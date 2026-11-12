"""Events of the Song API v2 (PD 8.1, ``GET /plenio/api/v2/events``): one stream for jobs and downloads.

An event says *what* changed - a job's id, status and stage, a download's id and state - never its content (a
job's documents, an error's text): a program reads that with a ``GET`` behind the API's guard. Every subscriber
gets only what it may see: a token's subscriber its own jobs, downloads (this computer's) only a subscriber on this
computer - on the live path and when missed events are replayed.

Bounds: the newest ``KEEP`` events are kept for a replay by ``Last-Event-ID``; progress is not kept (only the newest
state matters); each subscriber has a queue of ``QUEUE`` events and is dropped when it cannot keep up; at most
``SUBSCRIBERS`` at a time. An event id is ``<boot>-<number>``: an id of an earlier start of the server, or one older
than what is kept, gets a ``sync`` event - read the state again - instead of a replay.

Standard library only; ``publish`` may be called from any thread, a subscriber reads in its event loop.
"""

from __future__ import annotations

import asyncio
import secrets
import threading
from collections import deque
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

KEEP = 500
QUEUE = 200
SUBSCRIBERS = 32
PER_TOKEN = 4
"""Streams one token may hold open at once (the rest stay free for the others)."""


@dataclass(frozen=True)
class Event:
    id: str
    kind: str
    data: Mapping[str, Any]
    local: bool = False
    """Only for a subscriber on this computer (downloads)."""
    owner: str = ""
    """The job's caller (``token:<id>``): only that token's subscriber, and this computer's, get it."""

    def wire(self) -> bytes:
        import json

        return f"id: {self.id}\nevent: {self.kind}\ndata: {json.dumps(dict(self.data))}\n\n".encode()


@dataclass
class Subscriber:
    loop: asyncio.AbstractEventLoop
    here: bool
    owner: str | None
    """``None``: every job (this computer, an open API); else only this caller's."""
    queue: asyncio.Queue[Event] = field(default_factory=lambda: asyncio.Queue(QUEUE))
    dropped: bool = False

    def wants(self, event: Event) -> bool:
        if event.local and not self.here:
            return False
        return self.owner is None or event.owner == self.owner  # a token: its own jobs, nobody else's


class TooManyStreamsError(Exception):
    pass


class EventHub:
    def __init__(self, *, keep: int = KEEP, subscribers: int = SUBSCRIBERS, per_token: int = PER_TOKEN):
        self.boot = secrets.token_hex(4)
        self._seq = 0
        self._kept: deque[Event] = deque(maxlen=keep)
        self._subscribers: list[Subscriber] = []
        self._limit = subscribers
        self._per_token = per_token
        self._lock = threading.Lock()

    def publish(
        self, kind: str, data: Mapping[str, Any], *, local: bool = False, owner: str = "", replay: bool = True
    ) -> Event:
        """Tell every subscriber that may see it; ``replay``: keep it for one that reconnects (not progress)."""
        with self._lock:
            self._seq += 1
            event = Event(f"{self.boot}-{self._seq}", kind, dict(data), local, owner)
            if replay:
                self._kept.append(event)
            subscribers = list(self._subscribers)
        for subscriber in subscribers:
            if subscriber.wants(event) and not subscriber.dropped:
                try:
                    subscriber.loop.call_soon_threadsafe(_offer, subscriber, event)
                except RuntimeError:  # its loop is closed: the stream is gone
                    subscriber.dropped = True
        return event

    def subscribe(
        self, loop: asyncio.AbstractEventLoop, *, here: bool, owner: str | None, after: str | None = None
    ) -> Subscriber:
        """A new subscriber; ``after`` (``Last-Event-ID``): the kept events after it, or a ``sync`` event when they
        are not all kept any more."""
        subscriber = Subscriber(loop, here, owner)
        with self._lock:
            if len(self._subscribers) >= self._limit:
                raise TooManyStreamsError(f"{self._limit} event streams are open already")
            if owner is not None and sum(s.owner == owner for s in self._subscribers) >= self._per_token:
                raise TooManyStreamsError(f"this token holds {self._per_token} event streams open already")
            self._subscribers.append(subscriber)
            backlog = self._after(after) if after else []
        for event in backlog:
            if subscriber.wants(event):
                _offer(subscriber, event)
        return subscriber

    def _after(self, after: str) -> list[Event]:
        boot, _, number = after.partition("-")
        try:
            seq = int(number)
        except ValueError:
            seq = -1
        kept = list(self._kept)
        oldest = int(kept[0].id.partition("-")[2]) if kept else self._seq + 1
        if boot != self.boot or seq < 0 or seq > self._seq or seq < oldest - 1:
            return [
                Event(
                    f"{self.boot}-{self._seq}", "sync", {"reason": "the events since then are not all kept"}
                )
            ]
        return [event for event in kept if int(event.id.partition("-")[2]) > seq]

    def unsubscribe(self, subscriber: Subscriber) -> None:
        with self._lock:
            if subscriber in self._subscribers:
                self._subscribers.remove(subscriber)

    @property
    def open_streams(self) -> int:
        return len(self._subscribers)


def _offer(subscriber: Subscriber, event: Event) -> None:
    try:
        subscriber.queue.put_nowait(event)
    except asyncio.QueueFull:
        subscriber.dropped = True  # it cannot keep up: its stream ends, and it reconnects with its last id
