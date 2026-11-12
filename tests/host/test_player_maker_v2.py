"""Host integration (phase 5.10): the player's party songs reach ComfyUI's Song API v2 - a song is ordered as a v2
job, its events arrive, and it is followed to its end (failed at the first loader: the model files are empty)."""

from __future__ import annotations

import threading
import time

import pytest

from harness import ComfyServer
from plenio.player.maker import Studio

pytestmark = pytest.mark.host


def test_a_party_song_through_v2(server: ComfyServer, fake_models: None) -> None:
    studio = Studio(lambda: server.url)
    assert studio.has_v2()
    kinds: list[str] = []
    stop = threading.Event()

    def listen() -> None:
        for kind in studio.events(stop):
            kinds.append(kind)
            if kind in ("job.failed", "job.succeeded"):
                return

    listening = threading.Thread(target=listen, daemon=True)
    listening.start()
    time.sleep(0.5)
    request = {"template": "yue2-song", "fields": {"description": "a quiet walk by the sea"},
               "release": {"folder": "plenio/party-test"}, "client": {"name": "Plenio Player"}}  # fmt: skip
    answer = studio.create(request, key="plenio-player-host-test")
    assert answer["id"].startswith("job_") and answer["status"] in ("queued", "running")
    view = answer
    deadline = time.monotonic() + 120
    while view["status"] not in ("succeeded", "failed", "cancelled") and time.monotonic() < deadline:
        time.sleep(1)
        view = studio.job(answer["id"])
    assert view["status"] == "failed" and view.get("finished_at"), view
    listening.join(30)
    stop.set()
    assert "job.queued" in kinds and "job.failed" in kinds, kinds
