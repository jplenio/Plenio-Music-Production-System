"""The Song API in a real ComfyUI (owner's request 2026-10-25; docs/design/party-songs.md §2): the templates and their
fields read from the running server, a job queued that ComfyUI's own validation accepts (the template's loaders
find files of the catalogue's names - empty ones: the run then fails at the first loader, which is expected), its
status from the queue and the history, a recording uploaded, refusals by name, a cancel.

The real run (models on a GPU) was made on the owner's machine: a party song through this API, its record with the
party's folder, album and artist."""

from __future__ import annotations

import json
import random
import time
import urllib.request
from pathlib import Path
from typing import Any

import pytest

from harness import PROJECT, ComfyServer
from plenio.core.models import load_catalogue
from plenio.core.song_api import api_templates, load_template, prepare

pytestmark = pytest.mark.host

BASE = "/plenio/api/v1"


@pytest.fixture(scope="module")
def models(server: ComfyServer) -> ComfyServer:
    """Empty files with the catalogue's names in the server's models folder: the loaders' lists have them."""
    for model in load_catalogue(PROJECT / "resources" / "models.toml").values():
        target = server.base / "models" / model.folder / model.file
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes(b"")
    return server


def finished(server: ComfyServer, job_id: str, timeout: float = 120.0) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        view: dict[str, Any] = server.get(f"{BASE}/jobs/{job_id}")
        if view["status"] in ("succeeded", "failed", "cancelled"):
            return view
        time.sleep(0.3)
    raise TimeoutError(server.log_tail())


def test_the_api_describes_itself(server: ComfyServer) -> None:
    index = server.get(BASE)
    assert index["api"] == "plenio-song-api" and index["version"].startswith("1.")
    assert [t["id"] for t in index["templates"]] == ["yue2-song", "yue2-cover"]
    song = server.get(f"{BASE}/templates/yue2-song")
    fields = {f["id"]: f for f in song["fields"]}
    assert {
        "template",
        "genre",
        "vocals",
        "language",
        "writer.model",
        "finish.hq_mastering",
        "finish.cover_art",
    } <= set(fields)
    assert fields["vocals"]["choices"] == ["sung", "sparse vocals", "instrumental"]
    assert fields["mode"]["fixed"] is True
    assert {"folder", "artist", "album"} <= {f["id"] for f in song["release"]}
    cover = server.get(f"{BASE}/templates/yue2-cover")
    assert cover["needs"] == ["source.audio"]
    document = server.get(f"{BASE}/openapi.json")
    assert document["openapi"] == "3.1.0" and "JobRequest_yue2_song" in document["components"]["schemas"]
    briefs = server.get(f"{BASE}/briefs?kind=song")
    assert len(briefs["briefs"]) > 100 and any("synthwave" in v.lower() for v in briefs["values"]["genre"])
    assert server.request("GET", f"{BASE}/templates/nope")[0] == 404


def test_a_job_is_queued_validated_by_comfyui_and_followed(models: ComfyServer) -> None:
    server = models
    status, job = server.request(
        "POST",
        f"{BASE}/jobs",
        {
            "template": "yue2-song",
            "fields": {
                "genre": "synthwave",
                "length": 60,
                "vocals": "sung",
                "language": "English",
                "finish.cover_art": True,
            },
            "release": {"folder": "plenio/Party-Songs-test", "album": "Party-Song test", "artist": "Guest"},
            "client": {"name": "host test"},
        },
    )
    assert status == 201, job
    assert job["template"] == "yue2-song" and set(job["seeds"]) == {
        "draft",
        "plan",
        "arrangement",
        "take",
        "cover",
    }
    view = finished(server, job["id"])
    # the empty checkpoint: the run got past ComfyUI's validation and failed at its first loader
    assert view["status"] == "failed" and view["error"]["title"], view
    assert view["started_at"] and view["finished_at"] >= view["started_at"]
    history = server.get(f"/history/{job['id']}")[job["id"]]
    prompt, extra = history["prompt"][2], history["prompt"][3]
    assert extra["plenio_api"]["template"] == "yue2-song" and extra["plenio_api"]["client"] == {
        "name": "host test"
    }
    assert extra["extra_pnginfo"]["workflow"]["extra"]["plenio_api"]["id"] == "yue2-song"
    export = next(n for n in prompt.values() if n["class_type"] == "PlenioExportRelease")["inputs"]
    assert (export["folder"], export["tags.album"], export["tags.artist"]) == (
        "plenio/Party-Songs-test",
        "Party-Song test",
        "Guest",
    )
    brief = next(n for n in prompt.values() if n["class_type"] == "PlenioSongBrief")["inputs"]
    assert brief["length"] == "very short (about 1:00)" and brief["mode"] == "new song every run"
    listed = server.get(f"{BASE}/jobs")["jobs"]
    assert job["id"] in [j["id"] for j in listed]
    assert server.get(f"{BASE}/queue")["recent"] == [] or isinstance(
        server.get(f"{BASE}/queue")["recent"], list
    )


def test_a_repeated_request_with_its_key_is_one_job(models: ComfyServer) -> None:
    server = models
    body = json.dumps({"template": "yue2-song", "fields": {"genre": "ska"}}).encode("utf-8")

    def post() -> dict[str, Any]:
        request = urllib.request.Request(
            server.url + f"{BASE}/jobs",
            data=body,
            method="POST",
            headers={"Content-Type": "application/json", "Idempotency-Key": "host-test-key"},
        )
        with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - local test server
            result: dict[str, Any] = json.loads(answer.read())
            return result

    first, again = post(), post()
    assert first["id"] == again["id"]
    finished(server, first["id"])


def test_refusals_name_the_field(server: ComfyServer) -> None:
    cases = [
        ({"template": "yue2-song", "fields": {"genr": "x"}}, "unknown_field", "genr"),
        ({"template": "yue2-song", "fields": {"vocals": "rap"}}, "invalid_value", "vocals"),
        ({"template": "yue2-song", "fields": {"mode": "one song, stop to review"}}, "not_supported", "mode"),
        ({"template": "yue2-cover"}, "missing_field", "source.audio"),
        ({"template": "yue2-song", "release": {"folder": "../out"}}, "invalid_value", "release.folder"),
    ]
    for body, code, field in cases:
        status, answer = server.request("POST", f"{BASE}/jobs", body)
        assert status == 400 and answer["error"]["code"] == code and answer["error"]["field"] == field, answer


def test_a_recording_is_uploaded_and_a_cover_is_queued_and_cancelled(
    models: ComfyServer, tmp_path: Path
) -> None:
    server = models
    data = b"RIFF" + b"\x00" * 64
    request = urllib.request.Request(
        server.url + f"{BASE}/uploads?name=My%20Song.wav",
        data=data,
        method="POST",
        headers={"Content-Type": "audio/wav"},
    )
    with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - local test server
        uploaded = json.loads(answer.read())
    assert uploaded["name"].startswith("plenio-api-") and uploaded["name"].endswith("-My-Song.wav")
    assert (server.base / "input" / uploaded["name"]).read_bytes() == data
    status, wrong = server.request("POST", f"{BASE}/uploads?name=evil.exe", None)
    assert status == 415 and wrong["error"]["code"] == "unsupported_media_type"
    status, job = server.request(
        "POST",
        f"{BASE}/jobs",
        {"template": "yue2-cover", "fields": {"source.audio": uploaded["name"], "genre": "jazz"}},
    )
    assert status == 201, job
    status, stopped = server.request("DELETE", f"{BASE}/jobs/{job['id']}")
    assert status == 200 and stopped["id"] == job["id"]
    assert finished(server, job["id"])["status"] in ("cancelled", "failed")


# --- a record back into a request (owner's request 2026-10-26; docs/design/party-songs.md §2) ---------------


def record_of(
    server: ComfyServer, template_id: str, request: dict[str, Any], documents: dict[str, str]
) -> tuple[dict[str, Any], Any]:
    """A release record as Export Release writes it - the request's prompt and workflow, its documents, its seeds."""
    workflows = {
        path.stem: json.loads(path.read_text(encoding="utf-8"))
        for path in (PROJECT / "example_workflows").glob("*.json")
    }
    name, workflow = api_templates(workflows)[template_id]
    info = server.get("/object_info")
    prepared = prepare(load_template(name, workflow, info.get), request, info.get, rng=random.Random(7))
    record = {
        "schema": "plenio.record/1",
        "title": "Neon",
        "created": "2026-10-26T12:00:00Z",
        "prompt": prepared.prompt,
        "workflow": prepared.workflow,
        "documents": {kind: {"state": "auto", "text": text} for kind, text in documents.items()},
        "audio": {"seconds": 64.0, "tags": {"artist": "Guest", "album": "Party-Song 2026-10-26"}},
        "files": [{"name": "Neon.flac", "format": "flac"}],
    }
    return record, prepared


SONG_REQUEST = {
    "template": "yue2-song",
    "fields": {
        "genre": "synthwave",
        "description": "a night drive through a rainy city",
        "length": "very short (about 1:00)",
        "vocals": "sung",
        "language": "English",
        "finish.cover_art": True,
    },
    "release": {"folder": "plenio/Host-Record", "album": "Night drives", "artist": "Guest"},
}
DOCUMENTS = {
    "title": "Neon",
    "style": "synthwave, warm female vocal",
    "lyrics": "[verse]\nCity lights\n\n[chorus]\nNeon nights",
    "score": "X:1\nK:C\nC|",
    "artwork_prompt": "a car at night",
}


def test_a_record_gives_the_request_that_makes_its_song_again(models: ComfyServer) -> None:
    server = models
    record, prepared = record_of(server, "yue2-song", SONG_REQUEST, DOCUMENTS)
    status, answer = server.request("POST", f"{BASE}/from-record", record)
    assert status == 200, answer
    assert answer["template"] == "yue2-song" and answer["kind"] == "song" and answer["model"] == "YuE2"
    assert answer["take"] == {"possible": True, "why": ""} and answer["warnings"] == []
    # the song's fields and release fields as its prompt has them, its seeds and its documents
    assert answer["fields"]["genre"] == "synthwave" and answer["fields"]["vocals"] == "sung"
    assert answer["fields"]["description"] == "a night drive through a rainy city"
    assert answer["fields"]["finish.cover_art"] is True
    assert (
        answer["release"]["folder"] == "plenio/Host-Record" and answer["release"]["album"] == "Night drives"
    )
    assert answer["seeds"] == prepared.seeds
    assert answer["documents"] == {
        kind: DOCUMENTS[kind] for kind in ("title", "style", "lyrics", "score", "artwork_prompt")
    }
    # the same request without the take seed makes a new take: the documents stay, the seed is drawn anew
    body = {key: answer[key] for key in ("template", "fields", "release", "seeds", "documents")}
    body["seeds"] = {k: v for k, v in answer["seeds"].items() if k != "take"}
    body["client"] = {"name": "host from-record"}
    status, job = server.request("POST", f"{BASE}/jobs", body)
    assert status == 201, job
    assert job["seeds"]["take"] != answer["seeds"]["take"] and sorted(job["documents"]) == sorted(DOCUMENTS)
    _ = server.request("DELETE", f"{BASE}/jobs/{job['id']}")
    # the documents are manual in the sheets that keep them
    view = finished(server, job["id"])
    assert view["status"] in ("cancelled", "failed")
    prompt = server.get(f"/history/{job['id']}")[job["id"]]["prompt"][2]
    states = [
        json.loads(node["inputs"]["sheet_state"])
        for node in prompt.values()
        if node["class_type"] == "PlenioSongSheet" and node["inputs"].get("sheet_state")
    ]
    kept = {kind: doc for state in states for kind, doc in (state.get("docs") or {}).items()}
    assert kept["lyrics"] == {"state": "manual", "text": DOCUMENTS["lyrics"]}
    assert kept["score"] == {"state": "manual", "text": DOCUMENTS["score"]}


def test_a_covers_record_needs_its_recording_in_the_input_folder(models: ComfyServer) -> None:
    server = models
    request = {
        "template": "yue2-cover",
        "fields": {"source.audio": "host-from-record.flac", "genre": "jazz", "vocals": "original lyrics"},
        "release": {"folder": "plenio/Host-Record"},
    }
    (server.base / "input" / "host-from-record.flac").write_bytes(b"RIFF" + b"\x00" * 32)
    record, _prepared = record_of(server, "yue2-cover", request, {**DOCUMENTS, "style": "jazz, brushes"})
    status, answer = server.request("POST", f"{BASE}/from-record", record)
    assert status == 200, answer
    assert answer["kind"] == "cover" and answer["fields"]["source.audio"] == "host-from-record.flac"
    assert answer["take"]["possible"] is True
    # without the recording, no new take - and the reason says so
    (server.base / "input" / "host-from-record.flac").unlink()
    status, answer = server.request("POST", f"{BASE}/from-record", record)
    assert status == 200 and answer["take"] == {
        "possible": False,
        "why": "Its original recording is no longer in ComfyUI's input folder.",
    }
    status, wrong = server.request("POST", f"{BASE}/from-record", {"schema": "nope"})
    assert status == 400 and wrong["error"]["code"] == "bad_request"


# --- API 1.1 (2026-10-26): waiting for a change, the list's filters, a finished job's files, one key at a time ---


def test_a_program_waits_for_the_change_instead_of_asking_every_second(models: ComfyServer) -> None:
    server = models
    status, job = server.request(
        "POST",
        f"{BASE}/jobs",
        {"template": "yue2-song", "fields": {"genre": "ska"}, "client": {"name": "wait test"}},
    )
    assert status == 201, job
    asked = 0
    view = job
    deadline = time.monotonic() + 120
    while view["status"] not in ("succeeded", "failed", "cancelled") and time.monotonic() < deadline:
        view = server.get(f"{BASE}/jobs/{job['id']}?wait=20")
        asked += 1
    assert view["status"] == "failed" and asked <= 6, (asked, view)
    assert server.request("GET", f"{BASE}/jobs/{job['id']}?wait=soon")[0] == 400
    # the list, filtered: by the client's name, by status
    mine = server.get(f"{BASE}/jobs?client=wait%20test")["jobs"]
    assert [j["id"] for j in mine] == [job["id"]]
    assert job["id"] in [j["id"] for j in server.get(f"{BASE}/jobs?status=failed,cancelled&limit=50")["jobs"]]
    assert job["id"] not in [j["id"] for j in server.get(f"{BASE}/jobs?status=queued")["jobs"]]
    status, wrong = server.request("GET", f"{BASE}/jobs?status=done")
    assert status == 400 and wrong["error"]["field"] == "status"
    # a failed job has no song: none of its files
    status, missing = server.request("GET", f"{BASE}/jobs/{job['id']}/files/Song.flac")
    assert status == 404 and "failed" in missing["error"]["message"]
    assert server.request("GET", f"{BASE}/jobs/nope/files/Song.flac")[0] == 404


def test_two_requests_at_once_with_one_key_make_one_job(models: ComfyServer) -> None:
    import threading

    server = models
    body = json.dumps({"template": "yue2-song", "fields": {"genre": "polka"}}).encode("utf-8")
    ids: list[str] = []

    def post() -> None:
        request = urllib.request.Request(
            server.url + f"{BASE}/jobs",
            data=body,
            method="POST",
            headers={"Content-Type": "application/json", "Idempotency-Key": "host-test-at-once"},
        )
        with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - local test server
            ids.append(json.loads(answer.read())["id"])

    threads = [threading.Thread(target=post) for _ in range(3)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(60)
    assert len(ids) == 3 and len(set(ids)) == 1, ids
    finished(server, ids[0])


def test_setups_test_song_is_the_real_template_with_its_fixed_brief(models: ComfyServer) -> None:
    status, job = models.request("POST", "/plenio/setup/test-song", {})
    assert status == 201 and job["template"] == "yue2-song", job
    view = finished(models, job["id"])
    # the empty model files: past ComfyUI's validation, failed at the first loader (real files make the song)
    assert view["status"] == "failed" and view["error"]["title"], view
    prompt = models.get(f"/history/{job['id']}")[job["id"]]["prompt"][2]
    brief = next(n for n in prompt.values() if n["class_type"] == "PlenioSongBrief")["inputs"]
    assert brief["length"] == "very short (about 1:00)" and brief["vocals"] == "instrumental"
    export = next(n for n in prompt.values() if n["class_type"] == "PlenioExportRelease")["inputs"]
    assert export["folder"] == "plenio/Setup test"
    assert "PlenioCoverArt" not in {
        n["class_type"] for n in prompt.values()
    }  # the cover's nodes are bypassed
    hq = next(n for n in prompt.values() if n["class_type"] == "PlenioHQMastering")["inputs"]
    assert hq["hq_mastering"] is False
    status, refused = models.request("POST", "/plenio/setup/test-song", {}, headers={"X-Plenio-Remote": "1"})
    assert status == 403, refused
