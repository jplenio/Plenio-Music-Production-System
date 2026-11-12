"""The Player API's middle (phase 5.8): what the page that plays reports, the commands sent to it, the events.

The page plays the music; the server only knows what a page tells it. Every open player page reports its state -
the song, the position, what comes next, Live Play - on each change and every few seconds
(``POST /api/remote/now``), and asks for commands with a long poll (``GET /api/remote/commands``), which answers
the moment one arrives. A command of the Player API goes to the page that plays (the newest report that plays,
else the newest report) of the same account - each user of the player has a queue of their own. Events of the
Player API (``now``, ``queue``, ``live``, ``reaction``) are made from the reports and the guests' reactions.
"""

from __future__ import annotations

import itertools
import threading
import time
from collections import deque
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from typing import Any

PAGE_STALE_S = 15.0
"""A page that has not reported for this long is gone (a page reports at least every five seconds)."""
COMMANDS_KEPT = 50
EVENTS_KEPT = 200
STREAMS = 16
"""Event streams open at once (each holds a thread of the player's server)."""
TRANSPORT = ("play", "pause", "toggle", "next", "previous", "seek")
WHERE = ("next", "end")
LIVE_KEYS = {"on": bool, "auto": bool, "insert": ("next", "end", "random"), "atEnd": ("again", "wait")}


class RemoteError(ValueError):
    """A request the Player API refuses: ``status``, ``code`` and a ``hint``."""

    def __init__(self, status: int, code: str, message: str, hint: str = "") -> None:
        super().__init__(message)
        self.status = status
        self.code = code
        self.hint = hint


class TooManyStreamsError(RemoteError):
    def __init__(self) -> None:
        super().__init__(
            503, "busy", f"{STREAMS} event streams are open already.", "Close one, or ask /api/v1/now."
        )


@dataclass
class Page:
    """One open player page, as it last reported."""

    id: str
    owner: str
    shown: dict[str, Any]
    at: float
    playing_since: float = 0.0
    commands: deque[tuple[int, dict[str, Any]]] = field(default_factory=lambda: deque(maxlen=COMMANDS_KEPT))


@dataclass(frozen=True)
class Event:
    id: int
    kind: str
    owner: str
    data: dict[str, Any]


def check_transport(body: Any) -> dict[str, Any]:
    """``{"do": "play" | "pause" | "toggle" | "next" | "previous" | "seek", "seconds": 42}`` as a command."""
    if not isinstance(body, Mapping) or body.get("do") not in TRANSPORT:
        raise RemoteError(400, "invalid_value", f"'do' is one of {', '.join(TRANSPORT)}.", "")
    command: dict[str, Any] = {"do": body["do"]}
    if body["do"] == "seek":
        seconds = body.get("seconds")
        if isinstance(seconds, bool) or not isinstance(seconds, (int, float)) or not 0 <= seconds < 86400:
            raise RemoteError(
                400, "invalid_value", "A seek needs 'seconds' from the song's start (0 or more)."
            )
        command["seconds"] = float(seconds)
    return command


def check_queue(body: Any, known: Callable[[str], bool]) -> dict[str, Any]:
    """``{"id": "<song id>", "where": "next" | "end"}`` as a command (the song must be in the library)."""
    if not isinstance(body, Mapping) or not isinstance(body.get("id"), str) or not body["id"]:
        raise RemoteError(400, "missing_field", "'id': the song's id (from /api/v1/songs).")
    where = body.get("where", "end")
    if where not in WHERE:
        raise RemoteError(400, "invalid_value", "'where' is next or end.")
    if not known(body["id"]):
        raise RemoteError(
            404, "not_found", "No song with this id in the library.", "Look it up in /api/v1/songs."
        )
    return {"do": "queue", "id": body["id"], "where": where}


def check_live(body: Any) -> dict[str, Any]:
    """``{"on": true, "insert": "next", "auto": true, "atEnd": "again"}`` (any of them) as a command."""
    if not isinstance(body, Mapping) or not body or set(body) - set(LIVE_KEYS):
        raise RemoteError(400, "invalid_value", f"Live Play takes {', '.join(LIVE_KEYS)}.")
    command: dict[str, Any] = {"do": "live"}
    for key, value in body.items():
        rule = LIVE_KEYS[key]
        if (rule is bool and not isinstance(value, bool)) or (isinstance(rule, tuple) and value not in rule):
            allowed = "true or false" if rule is bool else " or ".join(rule)  # type: ignore[arg-type]
            raise RemoteError(400, "invalid_value", f"'{key}' is {allowed}.")
        command[key] = value
    return command


def _view(shown: Mapping[str, Any]) -> dict[str, Any]:
    """What a report says, in the shape the events compare (only what the Player API shows)."""
    now = shown.get("now")
    now = now if isinstance(now, Mapping) else {}
    nxt = shown.get("next")
    nxt = nxt if isinstance(nxt, list) else []
    live = shown.get("live")
    live = live if isinstance(live, Mapping) else {}
    return {
        "song": str(now["id"]) if now.get("id") else None,
        "playing": bool(shown.get("playing")),
        "next": [str(i) for i in nxt[:3] if isinstance(i, str)],
        "live": {k: live.get(k) for k in LIVE_KEYS if k in live},
    }


class PlayerRemote:
    """The pages' reports and commands, and the Player API's events; safe to use from any thread."""

    def __init__(self, *, stale: float = PAGE_STALE_S, clock: Callable[[], float] = time.monotonic) -> None:
        self._stale = stale
        self._clock = clock
        self._pages: dict[str, Page] = {}
        self._changed = threading.Condition()
        self._numbers = itertools.count(1)
        self._events: deque[Event] = deque(maxlen=EVENTS_KEPT)
        self._streams = 0

    # -- the page's side ---------------------------------------------------------------------------------------

    def report(self, page: str, owner: str, shown: Mapping[str, Any]) -> None:
        """A page's state (``frontend/src/player/remote.ts``): ``playing``, ``position``, ``duration``, ``now``
        (``{"id"}``), ``next`` (song ids), ``queue_length``, ``live``."""
        if not page or len(page) > 64:
            raise RemoteError(400, "invalid_value", "'page': the page's own id.")
        now = self._clock()
        with self._changed:
            self._forget(now)
            before = self._latest(owner)
            old = before.shown if before else {}
            known = self._pages.get(page)
            if known is None or known.owner != owner:
                known = Page(page, owner, dict(shown), now)
                self._pages[page] = known
            else:
                known.shown, known.at = dict(shown), now
            if shown.get("playing") and not (known.playing_since and old.get("playing")):
                known.playing_since = now
            if not shown.get("playing"):
                known.playing_since = 0.0
            after = self._latest(owner)
            if after is not None and after.id == page:
                self._compare(owner, _view(old) if before else None, _view(after.shown))
            self._changed.notify_all()

    def commands(self, page: str, owner: str, after: int, wait: float) -> list[dict[str, Any]]:
        """The commands for ``page`` after the number ``after``; waits up to ``wait`` seconds for one."""
        deadline = self._clock() + max(0.0, wait)
        with self._changed:
            while True:
                known = self._pages.get(page)
                found = (
                    [{"n": n, **c} for n, c in known.commands if n > after]
                    if known and known.owner == owner
                    else []
                )
                left = deadline - self._clock()
                if found or left <= 0:
                    return found
                self._changed.wait(min(left, 1.0))

    def leave(self, page: str) -> None:
        """A page that closes (``pagehide``): commands go to another one at once."""
        with self._changed:
            self._pages.pop(page, None)

    # -- the API's side ----------------------------------------------------------------------------------------

    def now(self, owner: str) -> dict[str, Any] | None:
        """The state of the page that plays (``None``: no page reports): with its age and the estimated position."""
        at = self._clock()
        with self._changed:
            self._forget(at)
            page = self._latest(owner)
            if page is None:
                return None
            shown = dict(page.shown)
            age = at - page.at
        position = shown.get("position")
        if isinstance(position, (int, float)) and not isinstance(position, bool) and shown.get("playing"):
            duration = shown.get("duration")
            position = position + age
            if isinstance(duration, (int, float)) and duration > 0:
                position = min(position, float(duration))
            shown["position"] = round(position, 2)
        shown["reported"] = round(age, 2)
        return shown

    def send(self, owner: str, command: Mapping[str, Any]) -> int:
        """Send ``command`` to the page that plays; its number. ``RemoteError`` 409 when no page reports."""
        with self._changed:
            self._forget(self._clock())
            page = self._latest(owner)
            if page is None:
                raise RemoteError(
                    409, "no_player", "No player page is open for this account.",
                    "Open the player in a browser (it reports every few seconds), then send the command again.",
                )  # fmt: skip
            n = next(self._numbers)
            page.commands.append((n, dict(command)))
            self._changed.notify_all()
            return n

    def reaction(self, entry: Mapping[str, Any], owner: str) -> None:
        """A guest's reaction to the song that plays (``guest.GuestHub.react``)."""
        with self._changed:
            self._add("reaction", owner, {"kind": entry.get("kind"), "song": entry.get("id")})
            self._changed.notify_all()

    # -- events ------------------------------------------------------------------------------------------------

    def open_stream(self) -> None:
        with self._changed:
            if self._streams >= STREAMS:
                raise TooManyStreamsError()
            self._streams += 1

    def close_stream(self) -> None:
        with self._changed:
            self._streams = max(0, self._streams - 1)

    def last_event(self) -> int:
        with self._changed:
            return self._events[-1].id if self._events else 0

    def events(self, owner: str, after: int, wait: float) -> list[Event]:
        """The events for ``owner`` after the id ``after``; waits up to ``wait`` seconds for one."""
        deadline = self._clock() + max(0.0, wait)
        with self._changed:
            while True:
                found = [e for e in self._events if e.id > after and e.owner == owner]
                left = deadline - self._clock()
                if found or left <= 0:
                    return found
                self._changed.wait(min(left, 1.0))

    # -- inside ------------------------------------------------------------------------------------------------

    def _forget(self, now: float) -> None:
        for gone in [p.id for p in self._pages.values() if now - p.at > self._stale]:
            del self._pages[gone]

    def _latest(self, owner: str) -> Page | None:
        mine = [p for p in self._pages.values() if p.owner == owner]
        if not mine:
            return None
        playing = [p for p in mine if p.shown.get("playing")]
        # of the pages that play, the one that started last; else the one that reported last
        return max(playing, key=lambda p: p.playing_since) if playing else max(mine, key=lambda p: p.at)

    def _add(self, kind: str, owner: str, data: dict[str, Any]) -> None:
        self._events.append(Event(next(self._numbers), kind, owner, data))

    def _compare(self, owner: str, old: dict[str, Any] | None, new: dict[str, Any]) -> None:
        if old is None or (old["song"], old["playing"]) != (new["song"], new["playing"]):
            self._add("now", owner, {"song": new["song"], "playing": new["playing"]})
        if old is None or old["next"] != new["next"]:
            self._add("queue", owner, {"next": new["next"]})
        if old is None or old["live"] != new["live"]:
            self._add("live", owner, dict(new["live"]))
