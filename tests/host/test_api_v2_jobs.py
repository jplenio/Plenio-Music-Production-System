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


def test_discovery_names_the_four_song_templates_and_the_presets(restartable: ComfyServer) -> None:
    index = restartable.get(BASE)
    assert index["version"] == "2.0"
    assert {t["id"] for t in index["templates"]} == {"yue2-song", "yue2-cover", "yue2-daw", "minimax-song"}
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
