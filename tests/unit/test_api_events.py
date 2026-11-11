"""Events of the Song API v2 (phase 5.5)."""

from __future__ import annotations

import asyncio

import pytest

from plenio.core.api import events
from plenio.core.api.events import EventHub, TooManyStreamsError


def drain(subscriber: events.Subscriber) -> list[events.Event]:
    found = []
    while not subscriber.queue.empty():
        found.append(subscriber.queue.get_nowait())
    return found


def run(coroutine):  # noqa: ANN001, ANN201
    return asyncio.run(coroutine)


def test_a_subscriber_gets_what_it_may_see() -> None:
    async def body() -> None:
        hub = EventHub()
        loop = asyncio.get_running_loop()
        here = hub.subscribe(loop, here=True, owner=None)
        token_a = hub.subscribe(loop, here=False, owner="token:a")
        hub.publish("job.queued", {"id": "job_1"}, owner="token:a")
        hub.publish("job.queued", {"id": "job_2"}, owner="token:b")
        hub.publish("download.done", {"id": "yue2"}, local=True)
        await asyncio.sleep(0)
        assert [e.data["id"] for e in drain(here)] == ["job_1", "job_2", "yue2"]
        assert [e.data["id"] for e in drain(token_a)] == ["job_1"]

    run(body())


def test_a_reconnect_replays_what_it_missed_and_progress_is_not_kept() -> None:
    async def body() -> None:
        hub = EventHub()
        loop = asyncio.get_running_loop()
        first = hub.publish("job.queued", {"id": "job_1"})
        hub.publish("job.progress", {"id": "job_1", "done": 3}, replay=False)
        hub.publish("job.running", {"id": "job_1"})
        hub.publish("job.failed", {"id": "job_1"})
        again = hub.subscribe(loop, here=True, owner=None, after=first.id)
        assert [e.kind for e in drain(again)] == ["job.running", "job.failed"]
        stale = hub.subscribe(loop, here=True, owner=None, after="0000-3")  # an earlier start of the server
        assert [e.kind for e in drain(stale)] == ["sync"]

    run(body())


def test_an_id_older_than_what_is_kept_gets_a_sync() -> None:
    async def body() -> None:
        hub = EventHub(keep=3)
        loop = asyncio.get_running_loop()
        first = hub.publish("job.queued", {"id": "j"})
        for _ in range(5):
            hub.publish("job.running", {"id": "j"})
        assert [e.kind for e in drain(hub.subscribe(loop, here=True, owner=None, after=first.id))] == ["sync"]

    run(body())


def test_bounds_a_slow_subscriber_is_dropped_and_streams_are_capped(monkeypatch: pytest.MonkeyPatch) -> None:
    async def body() -> None:
        monkeypatch.setattr(events, "QUEUE", 2)
        hub = EventHub(subscribers=2)
        loop = asyncio.get_running_loop()
        slow = hub.subscribe(loop, here=True, owner=None)
        for index in range(4):
            hub.publish("job.running", {"id": str(index)})
        await asyncio.sleep(0)
        assert slow.dropped and slow.queue.qsize() == 2
        hub.subscribe(loop, here=True, owner=None)
        with pytest.raises(TooManyStreamsError):
            hub.subscribe(loop, here=True, owner=None)
        hub.unsubscribe(slow)
        assert hub.open_streams == 1

    run(body())


def test_an_event_on_the_wire() -> None:
    event = events.Event("ab12-7", "job.failed", {"id": "job_1", "status": "failed"})
    assert event.wire() == b'id: ab12-7\nevent: job.failed\ndata: {"id": "job_1", "status": "failed"}\n\n'
