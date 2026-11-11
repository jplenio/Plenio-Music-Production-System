"""Host integration (phase 5.5): Song API v2's event stream - a job's events as it runs, and a reconnect with
``Last-Event-ID`` that replays what it missed."""

from __future__ import annotations

import http.client
import json
import threading
import time
from typing import Any

import pytest

from harness import ComfyServer

pytestmark = pytest.mark.host

BASE = "/plenio/api/v2"


def read_events(
    server: ComfyServer, *, until: str, last_id: str | None = None, timeout: float = 120.0
) -> list[dict[str, Any]]:
    """Events of the stream until one of kind ``until`` (or the time is up)."""
    host, port = server.url.removeprefix("http://").split(":")
    connection = http.client.HTTPConnection(host, int(port), timeout=timeout)
    headers = {"Last-Event-ID": last_id} if last_id else {}
    connection.request("GET", f"{BASE}/events", headers=headers)
    response = connection.getresponse()
    assert response.status == 200 and response.getheader("Content-Type", "").startswith("text/event-stream")
    found: list[dict[str, Any]] = []
    event: dict[str, Any] = {}
    deadline = time.monotonic() + timeout
    try:
        while time.monotonic() < deadline:
            line = response.fp.readline().decode("utf-8").rstrip("\n")
            if line.startswith("id: "):
                event["id"] = line[4:]
            elif line.startswith("event: "):
                event["kind"] = line[7:]
            elif line.startswith("data: "):
                event["data"] = json.loads(line[6:])
            elif line == "" and event:
                found.append(event)
                if event.get("kind") == until:
                    return found
                event = {}
    finally:
        connection.close()
    raise TimeoutError(found)


def test_a_jobs_events_and_a_replay(server: ComfyServer) -> None:
    from harness import PROJECT
    from plenio.core.models import load_components

    made = []
    for component in load_components(PROJECT / "resources" / "models.toml").values():
        for variant in component.variants:
            target = server.base / "models" / component.folder / variant.file
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                target.write_bytes(b"")
                made.append(target)
    try:
        seen: list[dict[str, Any]] = []
        reader = threading.Thread(
            target=lambda: seen.extend(read_events(server, until="job.failed")), daemon=True
        )
        reader.start()
        time.sleep(1.0)  # the stream is open before the job is made
        status, job = server.request(
            "POST", f"{BASE}/jobs", {"template": "yue2-song", "fields": {"vocals": "instrumental"}}
        )
        assert status == 201, job
        reader.join(timeout=150)
        mine = [e for e in seen if e.get("data", {}).get("id") == job["id"]]
        kinds = [e["kind"] for e in mine]
        assert kinds[0] == "job.queued" and kinds[-1] == "job.failed", kinds
        assert all(
            set(e["data"]) <= {"id", "status", "waiting_at", "stage", "progress"} for e in mine
        )  # no content
        replayed = read_events(server, until="job.failed", last_id=mine[0]["id"], timeout=30)
        assert [e["kind"] for e in replayed if e.get("data", {}).get("id") == job["id"]][-1] == "job.failed"
        assert read_events(server, until="sync", last_id="0000-1", timeout=30)[-1]["kind"] == "sync"
    finally:
        for path in made:
            path.unlink(missing_ok=True)
