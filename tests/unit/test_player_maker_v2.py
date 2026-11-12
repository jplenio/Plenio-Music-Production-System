"""The player's party songs on the Song API v2 (phase 5.10): made through v2 where ComfyUI has it, followed by the
id's own version, a run ComfyUI lost made again once, an older Plenio served on v1, the events waking the worker."""

from __future__ import annotations

import json
import threading
import time
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

from plenio.player.library import Library
from plenio.player.maker import PartySongs, Studio, StudioError, as_v1_view


class Stand:
    def __init__(self, v2: bool = True) -> None:
        self.v2 = v2
        self.seen: list[tuple[str, str, Any]] = []
        self.jobs: dict[str, dict[str, Any]] = {}


def handler(stand: Stand) -> type[BaseHTTPRequestHandler]:
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

        def _route(self, method: str) -> None:
            length = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(length)) if length else None
            stand.seen.append((method, self.path, body))
            if self.path.startswith("/plenio/api/v2") and not stand.v2:
                return self._send(404, b"404: Not Found", "text/plain")
            if self.path == "/plenio/api/v2":
                return self._send(200, {"api": "plenio-song-api", "version": "2.0"})
            if self.path == "/plenio/api/v2/events":
                return self._send(200, b": hi\n\nid: a-1\nevent: job.running\ndata: {}\n\n"
                                       b"id: a-2\nevent: job.succeeded\ndata: {}\n\n", "text/event-stream")  # fmt: skip
            if self.path.endswith("/jobs") and method == "POST":
                job_id = "job_0000000000000001" if "/v2/" in self.path else "1f2e3d"
                return self._send(201, {"id": job_id, "status": "queued"})
            if "/jobs/" in self.path:
                job_id = self.path.rsplit("/", 1)[1]
                found = stand.jobs.get(job_id)
                return self._send(200, found) if found else self._send(404, {"error": {"code": "not_found",
                                                                                      "message": "no job"}})  # fmt: skip
            return self._send(404, {"error": {"code": "not_found", "message": "no"}})

        def do_GET(self) -> None:  # noqa: N802
            self._route("GET")

        def do_POST(self) -> None:  # noqa: N802
            self._route("POST")

        def do_DELETE(self) -> None:  # noqa: N802
            self._route("DELETE")

    return Handler


@pytest.fixture
def stand() -> Iterator[tuple[Stand, Studio]]:
    found = Stand()
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler(found))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield found, Studio(lambda: f"http://127.0.0.1:{server.server_address[1]}")
    server.shutdown()
    server.server_close()


def test_a_song_is_made_through_v2_without_a_review_stop(stand: tuple[Stand, Studio]) -> None:
    found, studio = stand
    answer = studio.create({"template": "yue2-song", "fields": {}}, key="plenio-player-abc")
    assert answer["id"] == "job_0000000000000001"
    posted = [(p, b) for m, p, b in found.seen if m == "POST"]
    assert posted == [("/plenio/api/v2/jobs", {"template": "yue2-song", "fields": {}, "review": []})]


def test_each_job_is_followed_by_its_own_version(stand: tuple[Stand, Studio]) -> None:
    found, studio = stand
    found.jobs["job_0000000000000001"] = {"id": "job_0000000000000001", "status": "succeeded", "ended_at": 50.0,
                                          "result": {"title": "T", "record": "/out/T.plenio.json"}}  # fmt: skip
    found.jobs["1f2e3d"] = {"id": "1f2e3d", "status": "running", "started_at": 3.0}
    view = studio.job("job_0000000000000001")
    assert view["status"] == "succeeded" and view["finished_at"] == 50.0
    assert studio.job("1f2e3d")["status"] == "running"  # an older player's job: v1
    studio.cancel("1f2e3d")
    studio.cancel("job_0000000000000001")
    paths = [p for m, p, _ in found.seen if m in ("GET", "DELETE") and "/jobs/" in p]
    assert paths == ["/plenio/api/v2/jobs/job_0000000000000001", "/plenio/api/v1/jobs/1f2e3d",
                     "/plenio/api/v1/jobs/1f2e3d", "/plenio/api/v2/jobs/job_0000000000000001"]  # fmt: skip


def test_a_run_comfyui_lost_counts_as_forgotten(stand: tuple[Stand, Studio]) -> None:
    found, studio = stand
    found.jobs["job_0000000000000002"] = {"id": "job_0000000000000002", "status": "failed",
                                          "error": {"code": "interrupted", "message": "ComfyUI stopped"}}  # fmt: skip
    with pytest.raises(StudioError) as gone:
        studio.job("job_0000000000000002")
    assert gone.value.status == 404  # the worker makes it again once, as on v1


def test_an_older_plenio_is_served_on_v1(stand: tuple[Stand, Studio]) -> None:
    found, studio = stand
    found.v2 = False
    assert studio.create({"template": "yue2-song"}, key="k")["id"] == "1f2e3d"
    assert list(studio.events(threading.Event())) == []
    assert [p for m, p, _ in found.seen if m == "POST"] == ["/plenio/api/v1/jobs"]


def test_the_events_and_the_view() -> None:
    assert as_v1_view({"status": "waiting_for_review"})["status"] == "running"
    assert as_v1_view({"status": "running", "updated_at": 7.0})["started_at"] == 7.0


def test_events_wake_the_worker(stand: tuple[Stand, Studio], tmp_path: Path) -> None:
    _, studio = stand
    assert list(studio.events(threading.Event())) == ["job.running", "job.succeeded"]
    songs = PartySongs(Library([tmp_path]), tmp_path / "state", studio)
    listening = threading.Thread(target=songs._listen, daemon=True)
    listening.start()
    deadline = time.monotonic() + 5
    while not songs._wake.is_set() and time.monotonic() < deadline:
        time.sleep(0.02)
    songs._stop.set()
    assert songs._wake.is_set()
