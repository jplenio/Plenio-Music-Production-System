"""docs/api/examples/plenio_client.py (phase 5.7) against a scripted stand-in for the Song API v2."""

from __future__ import annotations

import importlib.util
import json
import sys
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

EXAMPLES = Path(__file__).resolve().parents[2] / "docs" / "api" / "examples"


def _load() -> Any:
    spec = importlib.util.spec_from_file_location("plenio_client", EXAMPLES / "plenio_client.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules["plenio_client"] = module
    spec.loader.exec_module(module)
    return module


client = _load()
BASE = "/plenio/api/v2"


class Fake:
    """What the stand-in answers and what it was asked."""

    def __init__(self) -> None:
        self.seen: list[tuple[str, str, dict[str, str], bytes]] = []
        self.busy_first = 0
        self.job: dict[str, Any] = {}
        self.approved: list[Any] = []
        self.polls = 0


def make_handler(fake: Fake) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args: Any) -> None:
            pass

        def _send(self, status: int, body: Any, kind: str = "application/json") -> None:
            raw = body if isinstance(body, bytes) else json.dumps(body).encode()
            self.send_response(status)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def _error(self, status: int, code: str, message: str, hint: str = "", field: str = "") -> None:
            self._send(status, {"error": {"code": code, "message": message, "hint": hint, "field": field}})

        def _route(self, method: str) -> None:
            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length) if length else b""
            fake.seen.append((method, self.path, dict(self.headers), body))
            path = self.path
            if self.headers.get("Authorization") not in (None, "Bearer plenio_good"):
                return self._error(
                    401, "unauthorized", "The token is not known.", "Make one in Plenio Setup."
                )
            if path == BASE:
                return self._send(
                    200, {"api": "plenio-song-api", "version": "2.0", "plenio": "x", "comfyui": "y"}
                )
            if path == f"{BASE}/jobs" and method == "POST":
                if fake.busy_first > 0:
                    fake.busy_first -= 1
                    return self._error(503, "busy", "ComfyUI is busy.")
                request = json.loads(body)
                if request["template"] == "nope":
                    return self._error(404, "unknown_template", "No template 'nope'.", field="template")
                fake.job = {"id": "job_0000000000000001", "status": "queued", "seeds": {"music": 1}}
                return self._send(201, fake.job)
            if path.startswith(f"{BASE}/jobs/job_0000000000000001?wait="):
                fake.polls += 1
                states = ["running", "waiting_for_review"] if not fake.approved else ["running", "succeeded"]
                status = states[min(fake.polls, 2) - 1] if fake.polls <= 2 else states[-1]
                fake.job = {**fake.job, "status": status}
                if status == "waiting_for_review":
                    fake.job["waiting_at"] = "text"
                    fake.job["documents"] = {"title": {"text": "Paper Boats", "sha256": "x"}}
                if status == "succeeded":
                    fake.job["result"] = {"title": "Neon Rain", "files": [
                        {"name": "Neon Rain.flac", "url": f"{BASE}/jobs/job_0000000000000001/files/Neon%20Rain.flac"}
                    ]}  # fmt: skip
                return self._send(200, fake.job)
            if path == f"{BASE}/jobs/job_0000000000000001/approve":
                fake.approved.append(json.loads(body))
                fake.polls = 0
                return self._send(202, {**fake.job, "status": "queued"})
            if path == f"{BASE}/jobs/job_0000000000000001/files/Neon%20Rain.flac":
                return self._send(200, b"fLaC" + bytes(range(256)) * 10, "audio/flac")
            if path == f"{BASE}/songs?q=rain%20night":
                return self._send(200, {"songs": [{"id": "s_1", "title": "Neon Rain"}]})
            if path.startswith(f"{BASE}/uploads?name="):
                return self._send(201, {"name": "plenio-api-abc-take.wav", "bytes": len(body)})
            if path == f"{BASE}/events":
                stream = (
                    b": hello\n\n"
                    b'id: e1-1\nevent: job.queued\ndata: {"id": "job_1"}\n\n'
                    b'id: e1-2\nevent: job.failed\ndata: {"id": "job_1",\ndata:  "status": "failed"}\n\n'
                )
                return self._send(200, stream, "text/event-stream")
            return self._error(404, "not_found", "No such path.")

        def do_GET(self) -> None:  # noqa: N802 - http.server's names
            self._route("GET")

        def do_POST(self) -> None:  # noqa: N802
            self._route("POST")

        def do_DELETE(self) -> None:  # noqa: N802
            self._route("DELETE")

    return Handler


@pytest.fixture
def served() -> Iterator[tuple[Fake, str]]:
    fake = Fake()
    server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(fake))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield fake, f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()


def test_the_base_may_be_comfyui_or_the_api(served: tuple[Fake, str]) -> None:
    _, url = served
    assert client.Plenio(url).about()["version"] == "2.0"
    assert client.Plenio(url + "/plenio/api/v2/").about()["api"] == "plenio-song-api"


def test_a_song_through_a_review_with_an_edit(served: tuple[Fake, str], tmp_path: Path) -> None:
    fake, url = served
    plenio = client.Plenio(url, token="plenio_good")
    job = plenio.make_song("yue2-song", {"description": "rain"}, review=["text"])
    seen: list[str] = []
    job = plenio.wait(job, on_change=lambda j: seen.append(j["status"]))
    assert job["status"] == "waiting_for_review" and job["documents"]["title"]["text"] == "Paper Boats"
    job = plenio.wait(plenio.approve(job, {"title": "Neon Rain"}))
    assert job["status"] == "succeeded"
    assert fake.approved == [{"documents": {"title": "Neon Rain"}}]
    assert seen == ["queued", "running", "waiting_for_review"]
    (saved,) = plenio.download(job, tmp_path / "out")
    assert saved.name == "Neon Rain.flac" and saved.read_bytes().startswith(b"fLaC")
    sent = json.loads(next(b for m, p, _, b in fake.seen if m == "POST" and p.endswith("/jobs")))
    assert sent == {"template": "yue2-song", "fields": {"description": "rain"}, "client": {"name": "plenio_client.py"},
                    "review": ["text"]}  # fmt: skip
    assert all(h.get("Authorization") == "Bearer plenio_good" for _, _, h, _ in fake.seen)


def test_a_busy_comfyui_is_tried_again_with_the_same_key(
    served: tuple[Fake, str], monkeypatch: pytest.MonkeyPatch
) -> None:
    fake, url = served
    monkeypatch.setattr(client.time, "sleep", lambda s: None)
    fake.busy_first = 2
    job = client.Plenio(url).make_song("yue2-song", {}, key="one-song")
    assert job["status"] == "queued"
    keys = [h.get("Idempotency-Key") for m, p, h, _ in fake.seen if m == "POST"]
    assert keys == ["one-song"] * 3


def test_errors_carry_the_api_s_words(served: tuple[Fake, str]) -> None:
    _, url = served
    with pytest.raises(client.PlenioError) as caught:
        client.Plenio(url).make_song("nope", {})
    assert (caught.value.status, caught.value.code, caught.value.field) == (
        404,
        "unknown_template",
        "template",
    )
    with pytest.raises(client.PlenioError) as caught:
        client.Plenio(url, token="plenio_wrong").about()
    assert caught.value.code == "unauthorized" and caught.value.hint == "Make one in Plenio Setup."


def test_no_answer_is_an_error_too() -> None:
    with pytest.raises(client.PlenioError) as caught:
        client.Plenio("http://127.0.0.1:9", timeout=2).about()
    assert caught.value.status == 0 and caught.value.code == "unreachable"


def test_songs_upload_and_events(served: tuple[Fake, str], tmp_path: Path) -> None:
    _, url = served
    plenio = client.Plenio(url)
    assert plenio.songs("rain night") == [{"id": "s_1", "title": "Neon Rain"}]
    recording = tmp_path / "take one.wav"
    recording.write_bytes(b"RIFF" + bytes(64))
    assert plenio.upload(recording) == "plenio-api-abc-take.wav"
    events = list(plenio.events())
    assert [(e.id, e.kind) for e in events] == [("e1-1", "job.queued"), ("e1-2", "job.failed")]
    assert events[1].data == {"id": "job_1", "status": "failed"}


def test_a_wait_with_a_timeout_stops(served: tuple[Fake, str]) -> None:
    _, url = served
    plenio = client.Plenio(url)
    job = plenio.make_song("yue2-song", {})
    with pytest.raises(TimeoutError):
        plenio.wait(job, timeout=-1)
