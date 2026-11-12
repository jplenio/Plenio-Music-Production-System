"""Host integration (phases 5.2, 5.3): Song API v2's jobs in a real ComfyUI - kept on disk with ids of their own,
followed to their end by the watcher, and after a restart: a job that was running is ``failed``/``interrupted`` and
its ``Idempotency-Key`` starts a new run.

The catalogue's model files are empty here: a run gets past ComfyUI's validation and fails at its first loader, so
"running" at the restart is set in the job's file while the server is down (a run cannot be held open on purpose
without models)."""

from __future__ import annotations

import json
import shutil
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, copy_package

pytestmark = pytest.mark.host

BASE = "/plenio/api/v2"
REQUEST = {
    "template": "yue2-song",
    "preset": "sketch",
    "fields": {"genre": "lo-fi hip hop", "description": "a calm beat", "vocals": "instrumental"},
    "client": {"name": "v2 test"},
}


def empty_models(models: Path) -> None:
    from plenio.core.models import load_components

    for component in load_components(PROJECT / "resources" / "models.toml").values():
        for variant in component.variants:
            target = models / component.folder / variant.file
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b"")


@pytest.fixture(scope="module")
def restartable(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-api-v2")
    custom = base / "custom_nodes"
    custom.mkdir()
    copy_package(custom)
    shutil.copytree(
        PROJECT / "tests" / "host" / "plenio_test_nodes",
        custom / "plenio_test_nodes",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    empty_models(base / "models")
    server = ComfyServer(
        comfy_path, base, node_packs=[PACKAGE_NAME, "plenio_test_nodes"], extra_env={"PLENIO_OFFLINE": "1"}
    )
    server.start()
    yield server
    server.stop()


def ended(server: ComfyServer, job_id: str, timeout: float = 120.0) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job: dict[str, Any] = server.get(f"{BASE}/jobs/{job_id}?wait=5")
        if job["status"] in ("succeeded", "failed", "cancelled"):
            return job
    raise TimeoutError(server.log_tail())


def test_discovery_names_the_five_templates_and_the_presets(restartable: ComfyServer) -> None:
    index = restartable.get(BASE)
    assert index["version"] == "2.0"
    assert {t["id"] for t in index["templates"]} == {
        "yue2-song",
        "yue2-cover",
        "yue2-daw",
        "minimax-song",
        "enhance-master",
    }
    assert [p["id"] for p in restartable.get(f"{BASE}/presets")["presets"]][:2] == ["best", "party"]
    v1 = restartable.get("/plenio/api/v1/templates")["templates"]
    assert {t["id"] for t in v1} == {"yue2-song", "yue2-cover"}  # v1 as 1.6.0


def test_a_job_is_kept_with_its_own_id_and_followed_to_its_end(restartable: ComfyServer) -> None:
    status, job = restartable.request("POST", f"{BASE}/jobs", REQUEST, headers={"Idempotency-Key": "first"})
    assert status == 201 and job["id"].startswith("job_") and job["status"] in ("queued", "running"), job
    done = ended(restartable, job["id"])
    assert done["status"] == "failed" and done["error"]["code"] == "run_failed"  # the empty model files
    stored = json.loads(
        (restartable.base / "user" / "plenio" / "api" / "jobs" / f"{job['id']}.json").read_text(
            encoding="utf-8"
        )
    )
    assert (
        stored["status"] == "failed" and stored["request"]["fields"]["length"] == "very short (about 1:00)"
    )  # the preset
    again = restartable.request("POST", f"{BASE}/jobs", REQUEST, headers={"Idempotency-Key": "first"})
    assert again[0] == 200 and again[1]["id"] == job["id"]
    listed = restartable.get(f"{BASE}/jobs")["jobs"]
    assert job["id"] in [j["id"] for j in listed]
    assert restartable.request("GET", f"{BASE}/jobs/job_0000")[0] == 404


def test_after_a_restart_a_running_job_is_interrupted_and_its_key_runs_again(
    restartable: ComfyServer,
) -> None:
    status, job = restartable.request("POST", f"{BASE}/jobs", REQUEST, headers={"Idempotency-Key": "night-7"})
    assert status == 201, job
    ended(restartable, job["id"])
    restartable.stop()
    path = restartable.base / "user" / "plenio" / "api" / "jobs" / f"{job['id']}.json"
    stored = json.loads(path.read_text(encoding="utf-8"))
    stored.update(
        status="running", error=None, ended=None, result=None
    )  # as if ComfyUI stopped during the run
    path.write_text(json.dumps(stored), encoding="utf-8")
    restartable.start()
    after = restartable.get(f"{BASE}/jobs/{job['id']}")
    assert after["status"] == "failed" and after["error"]["code"] == "interrupted", after
    status, fresh = restartable.request(
        "POST", f"{BASE}/jobs", REQUEST, headers={"Idempotency-Key": "night-7"}
    )
    assert status == 201 and fresh["id"] != job["id"], fresh


def test_songs_models_and_the_editors_routes(restartable: ComfyServer) -> None:
    assert isinstance(restartable.get(f"{BASE}/songs")["songs"], list)
    assert restartable.request("GET", f"{BASE}/songs/bm90LWEtc29uZw")[0] == 404
    plan = restartable.get(f"{BASE}/models/plan")
    assert {t["template"] for t in plan["templates"]} >= {"1 · YuE2 · Song"}
    assert restartable.get(f"{BASE}/models")["templates"]
    status, data = restartable.request("POST", f"{BASE}/scores/analyze", {"abc": "not a score"})
    assert status in (200, 400), data
    if status == 400:
        assert data["error"]["code"] == "bad_request"
    status, data = restartable.request("POST", f"{BASE}/lyrics/analyze", {"lyrics": "[verse]\nA paper boat"})
    assert status == 200, data


def silent_wav(seconds: float = 4.0, rate: int = 44100) -> bytes:
    import io
    import math
    import struct
    import wave

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as out:
        out.setnchannels(2)
        out.setsampwidth(2)
        out.setframerate(rate)
        frames = bytearray()
        for i in range(int(seconds * rate)):
            sample = int(
                3000 * math.sin(2 * math.pi * 220 * i / rate)
            )  # a quiet tone, so loudness can be measured
            frames += struct.pack("<hh", sample, sample)
        out.writeframes(bytes(frames))
    return buffer.getvalue()


def test_enhance_master_masters_an_uploaded_file(restartable: ComfyServer) -> None:
    import urllib.request

    request = urllib.request.Request(
        restartable.url + f"{BASE}/uploads?name=tone.wav",
        data=silent_wav(),
        method="POST",
        headers={"Content-Type": "audio/wav"},
    )
    with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - local test server
        uploaded = json.loads(answer.read())
    detail = restartable.get(f"{BASE}/templates/enhance-master")
    assert detail["kind"] == "master" and "source.audio" in detail["needs"]
    status, job = restartable.request(
        "POST",
        f"{BASE}/jobs",
        {
            "template": "enhance-master",
            "fields": {"source.audio": uploaded["name"], "finish.hq_mastering": False},
            "release": {"folder": "plenio/v2 master", "sheet_music": "off", "song_page": False},
        },
    )
    assert status == 201, job
    done = ended(restartable, job["id"], timeout=300)
    assert done["status"] == "succeeded", done
    names = [f["name"] for f in done["result"]["files"]]
    assert any(name.endswith(".flac") for name in names), names
    first = next(f for f in done["result"]["files"] if f["name"].endswith(".flac"))
    with urllib.request.urlopen(restartable.url + first["url"], timeout=60) as answer:  # noqa: S310 - local
        assert answer.status == 200 and answer.read(4) == b"fLaC"


def test_a_released_song_is_listed_and_made_again(restartable: ComfyServer) -> None:
    """After the mastering test: its song is in /songs, and a cover of it is queued from its audio."""
    found = restartable.get(f"{BASE}/songs?q=v2%20master")["songs"]
    assert found, restartable.get(f"{BASE}/songs")
    song = restartable.get(f"{BASE}/songs/{found[0]['id']}")
    assert song["files"] and all(f["url"].startswith(f"{BASE}/songs/") for f in song["files"])
    status, job = restartable.request("POST", f"{BASE}/songs/{found[0]['id']}/again", {"as": "cover"})
    assert status == 201 and job["template"] == "yue2-cover", job
    status, refused = restartable.request("POST", f"{BASE}/songs/{found[0]['id']}/again", {"as": "remix"})
    assert status == 400 and refused["error"]["field"] == "as"
    assert isinstance(restartable.get(f"{BASE}/writers")["writers"], list)
    assert isinstance(restartable.get(f"{BASE}/loras")["loras"], list)


def test_one_key_at_once_makes_one_job(server: ComfyServer, fake_models: None) -> None:
    """Four requests with one Idempotency-Key at the same moment: one job, the same answer to all (review)."""
    import threading

    answers: list[tuple[int, dict]] = []

    def post() -> None:
        answers.append(
            server.request("POST", "/plenio/api/v2/jobs", REQUEST, headers={"Idempotency-Key": "at-once"})
        )

    threads = [threading.Thread(target=post) for _ in range(4)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=120)
    assert sorted(status for status, _ in answers) == [200, 200, 200, 201], answers
    assert len({job["id"] for _, job in answers}) == 1
    server.request("DELETE", f"/plenio/api/v2/jobs/{answers[0][1]['id']}")
