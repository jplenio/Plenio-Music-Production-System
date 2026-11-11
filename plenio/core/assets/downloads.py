"""The download manager: catalogue files fetched in the background, with states a page can show.

    absent -> queued -> downloading <-> paused -> verifying -> installed
                    \\-> blocked (the user can fix it)      \\-> failed (try again) / cancelled

One file is one :class:`Download`. It is fetched into ``<file>.part`` (resumed with ``Range`` when that
exists), checked against the catalogue's size and SHA-256, and only then renamed into place - a file that is
there is whole. At most ``parallel`` files load at once. A refusal of the host becomes a
:class:`~plenio.core.assets.hub.Refusal` in words; a host that asks to wait is waited for.

The manager fetches what it is handed: the caller (Plenio Setup's routes) hands it catalogue entries only -
never a URL or a folder from a request.

Standard library only; threads, no event loop (ComfyUI's routes hand work over and read states).
"""

from __future__ import annotations

import hashlib
import os
import shutil
import threading
import time
import urllib.error
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import hub

STATES = ("queued", "downloading", "paused", "verifying", "installed", "blocked", "failed", "cancelled")
ACTIVE = ("queued", "downloading", "verifying")
"""States in which the manager still works on a file."""
_CHUNK = 1 << 20
_RENAME_TRIES = 5
_RENAME_WAIT_S = 2.0
_BUSY_TRIES = 4
_BUSY_WAIT_S = 60.0
"""The longest the manager waits for a busy host before it tries again."""
_EVENT_EVERY_S = 0.25
_ROOM_SPARE = 64 * 2**20
"""Room left on the disk beyond the file (a download that fills a disk to the last byte helps nobody)."""


@dataclass
class Download:
    """One file being fetched: what, where to, and how far."""

    id: str
    url: str
    target: Path
    size: int
    sha256: str
    title: str = ""
    manual_approval: bool = False
    state: str = "queued"
    done: int = 0
    speed: float = 0.0
    """Bytes a second, over the last seconds."""
    refusal: hub.Refusal | None = None
    wanted: str = "run"
    """What the user asked last: ``run``, ``pause`` or ``cancel`` (the worker reads it between blocks)."""
    _last_event: float = field(default=0.0, repr=False)

    @property
    def part(self) -> Path:
        return self.target.with_name(self.target.name + ".part")

    def to_dict(self) -> dict[str, Any]:
        """What a page shows. The folder's path stays on this computer: the file's name is what a page needs."""
        left = (
            (self.size - self.done) / self.speed if self.speed > 0 and self.state == "downloading" else None
        )
        return {
            "id": self.id,
            "title": self.title or self.target.name,
            "file": self.target.name,
            "state": self.state,
            "bytes": self.size,
            "done": self.done,
            "speed": round(self.speed),
            "seconds_left": round(left) if left is not None else None,
            "refusal": self.refusal.to_dict() if self.refusal else None,
        }


class DownloadManager:
    """Fetches the files it is handed, ``parallel`` at a time, and tells ``on_event`` every change."""

    def __init__(
        self,
        *,
        token: Callable[[], str | None] = lambda: None,
        on_event: Callable[[dict[str, Any]], None] = lambda event: None,
        parallel: int = 2,
        open_url: Callable[..., Any] | None = None,
        free_bytes: Callable[[Path], int] | None = None,
        sleep: Callable[[float], None] = time.sleep,
        clock: Callable[[], float] = time.monotonic,
    ):
        self.token = token
        self.on_event = on_event
        self.parallel = max(1, parallel)
        self.open_url = open_url or hub.opener().open
        self.free_bytes = free_bytes or (lambda folder: shutil.disk_usage(folder).free)
        self.sleep = sleep
        self.clock = clock
        self.lock = threading.Lock()
        self.items: dict[str, Download] = {}
        self._threads: list[threading.Thread] = []

    # --- what a page asks -----------------------------------------------------------------------------------------
    def add(
        self,
        item_id: str,
        url: str,
        target: Path,
        size: int,
        sha256: str,
        *,
        title: str = "",
        manual_approval: bool = False,
    ) -> Download:
        """Queue a file (one already queued, loading or installed under this id is returned as it is)."""
        with self.lock:
            known = self.items.get(item_id)
            if known is not None and known.state in (*ACTIVE, "installed"):
                return known
            item = Download(item_id, url, target, size, sha256, title, manual_approval)
            self.items[item_id] = item
        self._say(item, force=True)
        self._work()
        return item

    def get(self, item_id: str) -> Download | None:
        return self.items.get(item_id)

    def listing(self) -> list[dict[str, Any]]:
        with self.lock:
            return [item.to_dict() for item in self.items.values()]

    def pause(self, item_id: str) -> Download | None:
        """Stop loading and keep what is there. A file still waiting is paused at once."""
        item = self.items.get(item_id)
        if item is None:
            return None
        with self.lock:
            if item.state == "queued":
                item.state = "paused"
            elif item.state == "downloading":
                item.wanted = "pause"
        self._say(item, force=True)
        return item

    def resume(self, item_id: str) -> Download | None:
        """Go on with a paused, blocked, failed or cancelled file - from where its partial file ends."""
        item = self.items.get(item_id)
        if item is None:
            return None
        with self.lock:
            if item.state in ("paused", "blocked", "failed", "cancelled"):
                item.state, item.wanted, item.refusal = "queued", "run", None
        self._say(item, force=True)
        self._work()
        return item

    def cancel(self, item_id: str) -> Download | None:
        """Stop and take the file off the work; its partial file stays, so a later start goes on from it."""
        item = self.items.get(item_id)
        if item is None:
            return None
        with self.lock:
            if item.state == "downloading":
                item.wanted = "cancel"
            elif item.state in ("queued", "paused", "blocked", "failed"):
                item.state = "cancelled"
        self._say(item, force=True)
        return item

    def wait(self, timeout: float = 60.0) -> bool:
        """Until nothing is queued or loading any more (tests, and a run that waits for its file)."""
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            with self.lock:
                busy = any(item.state in ACTIVE for item in self.items.values())
                threads = [t for t in self._threads if t.is_alive()]
            if not busy and not threads:
                return True
            time.sleep(0.01)
        return False

    # --- the work -------------------------------------------------------------------------------------------------
    def _say(self, item: Download, *, force: bool = False) -> None:
        now = self.clock()
        if not force and now - item._last_event < _EVENT_EVERY_S:
            return
        item._last_event = now
        try:
            self.on_event(item.to_dict())
        except Exception:  # noqa: BLE001, S110 - a page that is gone must not stop a download
            pass

    def _work(self) -> None:
        with self.lock:
            self._threads = [t for t in self._threads if t.is_alive()]
            waiting = sum(1 for item in self.items.values() if item.state == "queued")
            free = self.parallel - len(self._threads)
            for _ in range(max(0, min(free, waiting))):
                thread = threading.Thread(target=self._run, name="plenio-download", daemon=True)
                self._threads.append(thread)
                thread.start()

    def _next(self) -> Download | None:
        with self.lock:
            for item in self.items.values():
                if item.state == "queued":
                    item.state = "downloading"
                    return item
        return None

    def _run(self) -> None:
        while True:
            item = self._next()
            if item is None:
                return
            try:
                self._fetch(item)
            except Exception as error:  # noqa: BLE001 - every failure ends as a state with words
                self._stop(item, hub.classify_error(error))
            self._say(item, force=True)

    def _stop(self, item: Download, refusal: hub.Refusal) -> None:
        with self.lock:
            item.refusal = refusal
            item.speed = 0.0
            # what the user can fix is blocked; what trying again may cure has failed
            item.state = (
                "blocked" if refusal.kind in ("gated", "pending", "token", "moved", "disk") else "failed"
            )

    def _fetch(self, item: Download) -> None:
        item.target.parent.mkdir(parents=True, exist_ok=True)
        part = item.part
        if item.target.is_file() and item.target.stat().st_size == item.size:
            part = item.target  # there already (put there by hand): verified like a download
        start = part.stat().st_size if part.is_file() else 0
        if start > item.size:
            part.unlink()
            start = 0
        item.done = start
        if start < item.size:
            room = self.free_bytes(item.target.parent)
            if room < item.size - start + _ROOM_SPARE:
                return self._stop(
                    item, hub.no_room(item.size - start, room, str(item.target.parent.anchor or "/"))
                )
            finished = self._load(item, part, start)
            if not finished:
                return None
        with self.lock:
            item.state, item.speed = "verifying", 0.0
        self._say(item, force=True)
        if part.stat().st_size != item.size or (item.sha256 and _sha256(part) != item.sha256):
            part.unlink(missing_ok=True)
            item.done = 0
            return self._stop(
                item, hub.Refusal("damaged", "The download was damaged; it was discarded.", "Try again.")
            )
        if part != item.target:
            for attempt in range(_RENAME_TRIES):
                try:
                    os.replace(part, item.target)
                    break
                except PermissionError as error:
                    if attempt == _RENAME_TRIES - 1:
                        return self._stop(item, hub.classify_error(error))
                    self.sleep(_RENAME_WAIT_S)
        with self.lock:
            item.state, item.done, item.refusal = "installed", item.size, None
        return None

    def _load(self, item: Download, part: Path, start: int) -> bool:
        """Fetch from ``start`` into ``part``. ``True``: the whole file is there; ``False``: paused, cancelled or
        stopped with a refusal (the state says which)."""
        token = hub.token_for(item.url, self.token())
        for attempt in range(_BUSY_TRIES):
            try:
                response = self.open_url(hub.request_for(item.url, token, start=start), timeout=60)
                break
            except urllib.error.HTTPError as error:
                refusal = hub.classify(
                    error.code,
                    dict(error.headers or {}),
                    has_token=bool(token),
                    manual_approval=item.manual_approval,
                )
                if refusal is None:
                    raise
                if refusal.retries_by_itself and attempt < _BUSY_TRIES - 1:
                    with self.lock:
                        item.refusal = refusal
                    self._say(item, force=True)
                    self.sleep(min(refusal.retry_after or 5.0, _BUSY_WAIT_S))
                    if item.wanted != "run":
                        return self._interrupted(item)
                    continue
                self._stop(item, refusal)
                return False
        else:  # pragma: no cover - the loop always breaks or returns
            return False
        with self.lock:
            item.refusal = None
        with response:
            resumed = bool(start) and getattr(response, "status", 200) == 206
            done = start if resumed else 0
            marks: list[tuple[float, int]] = [(self.clock(), done)]
            # what has arrived, not a full block: on a slow line progress and a pause do not wait for a megabyte
            read = getattr(response, "read1", response.read)
            with part.open("ab" if resumed else "wb") as handle:
                while True:
                    if item.wanted != "run":
                        handle.flush()
                        item.done = done
                        return self._interrupted(item)
                    block = read(_CHUNK)
                    if not block:
                        break
                    handle.write(block)
                    done += len(block)
                    now = self.clock()
                    marks.append((now, done))
                    marks = [m for m in marks if now - m[0] <= 5.0] or marks[-1:]
                    span = now - marks[0][0]
                    item.done = done
                    item.speed = (done - marks[0][1]) / span if span > 0 else 0.0
                    self._say(item)
        item.done = done
        return True

    def _interrupted(self, item: Download) -> bool:
        with self.lock:
            item.state = "paused" if item.wanted == "pause" else "cancelled"
            item.speed, item.wanted = 0.0, "run"
        return False


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(_CHUNK), b""):
            digest.update(block)
    return digest.hexdigest()
