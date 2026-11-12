"""Guests in the same network see the live playlist (owner's request 2026-10-17): with the access switched on
in Live Play, anyone on the same network (the party's Wi-Fi) opens a page of their own on their phone - the
song that plays, what comes next - and, if the host allows it, moves songs up and down, takes them out and
adds songs from the library.

The access is a second, small server of its own (``serve_guests``), apart from the player's: the player keeps
answering on the loopback address only, while this one listens on the network and answers only below a
random path (``/<token>/``) that the host can make anew at any time - the old address then leads nowhere. It
serves the guests' page, the live playlist and the songs' covers, and in *change* mode a search of the
library and the guests' wishes. Nothing else: no audio, no records, no paths, no settings.

The live playlist lives in the player's page (its queue). The page sends what it shows (``publish``) and asks
for the guests' wishes (``take``), which it carries out itself - so the playlist has one owner, and a wish for
a song that has moved on is simply not done.

Every guest hears the party's songs again on their own phone (owner's request 2026-10-29): the songs made at this
party - by guests, users and the host - once they played, while the host lets them (``replay``). A party begins when
the access is switched on, gets a new address, or the host starts a new one; its songs are kept in
``party-played.json``, and the guests' server sends their audio - no other song's.

When the host lets guests make songs (``plenio.player.maker``, owner's request 2026-10-25), the guests' page has
*Make your own song*: a page of its own below the token (``make/``, built into ``guest_static``), and the party
songs' routes for guests (``api/make...``) - a guest is known by a cookie of their own.

Guests react to the song that plays (owner's request 2026-10-26, the player as a party machine): a tap on
🔥 ❤️ 🎉 👏 💃 😂 on their page (``api/react``) floats over the player's screen and is counted for the song.
Only these six, a few a minute per guest, and only when the host lets guests react.
"""

from __future__ import annotations

import hmac
import json
import os
import re
import secrets
import socket
import threading
import time
from collections import deque
from collections.abc import Callable
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

from . import maker as maker_rules
from . import other as other_music
from .library import Library

PAGE = Path(__file__).resolve().parent / "guest_page.html"
MAKER_PAGE = Path(__file__).resolve().parent / "guest_static"
"""The guests' song form (``frontend/src/guest``, built by ``npm run build:player``)."""
SOURCES_PER_MINUTE = 6
PORTS = range(8770, 8780)
MODES = ("view", "change")
SHOWS = ("both", "qr", "address", "none")
OPS = ("up", "down", "next", "remove", "add")
SONG_ID = re.compile(r"[0-9a-f]{12}")
STALE_AFTER = 20.0
"""Seconds without news from the player's page after which the guests read that it is closed."""
WISHES_KEPT = 200
WISHES_PER_MINUTE = 40
"""Wishes one guest (address) may send in a minute."""
REACTIONS = ("fire", "heart", "party", "clap", "dance", "laugh")
"""What a guest may send to the screen (the pages show them as 🔥 ❤️ 🎉 👏 💃 😂)."""
REACTIONS_PER_MINUTE = 60
"""Reactions one guest (address) may send in a minute."""
REACTIONS_KEPT = 300
PER_SONG = ("any", "one")
"""How many reactions a guest may give a song: as many as they like, or one (a tap on another changes it)."""
TALLY_FILE = "reactions.json"
"""The reactions per song, kept in the player's state folder: ``{"songs": {id: {kind: n}}, "votes": {id: {guest:
kind}}}`` (the votes: who gave which, for one per song)."""
LIST_LIMIT = 200
BODY_LIMIT = 64 * 1024
ASSET_TYPES = {
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
}
DEFAULTS: dict[str, Any] = {
    "on": False,
    "mode": "view",
    "show": "both",
    "token": "",
    "port": 0,
    "reactions": True,
    "reactions_per_song": "any",
    "replay": True,
    "party_since": 0.0,
}
REPLAY_FILE = "party-played.json"
"""The songs made at the party that played: ``{"since": when the party began, "songs": {id: {"at": when it played,
"by": who made it}}}``."""
ALL_NETWORKS = ("0.0.0.0", "")  # noqa: S104 - the guests' access is meant for the network


def new_token() -> str:
    """A path nobody guesses: 16 URL characters, about 96 bits."""
    return secrets.token_urlsafe(12)


def lan_addresses() -> list[str]:
    """This computer's addresses in its networks (IPv4), the one of the default route first; no loopback or
    self-assigned (169.254) ones. Asking which address a route would use sends nothing."""
    found: list[str] = []
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
            probe.connect(("10.254.254.254", 1))
            found.append(probe.getsockname()[0])
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            found.append(str(info[4][0]))
    except OSError:
        pass
    seen: list[str] = []
    for address in found:
        if address.startswith(("127.", "169.254.", "0.")) or address in seen:
            continue
        seen.append(address)
    return seen


class GuestHub:
    """The guests' access: its settings (kept in ``guests.json`` in the player's state folder), its server,
    what the player's page last showed, and the guests' wishes on their way to it."""

    def __init__(self, library: Library, directory: Path, host: str = "0.0.0.0") -> None:  # noqa: S104
        self.library = library
        self.path = directory / "guests.json"
        self.cache = directory / "cache"
        self.host = host
        self.lock = threading.Lock()
        self.settings = self._load()
        self.server: ThreadingHTTPServer | None = None
        self.on_reaction: Callable[[dict[str, Any]], None] | None = None
        """Told of each reaction counted (the Player API's ``reaction`` events)."""
        self.error = ""
        self.snapshot: dict[str, Any] = {}
        self.snapshot_at = 0.0
        self.wishes: deque[dict[str, Any]] = deque(maxlen=WISHES_KEPT)
        self.last_wish = 0
        self.sent: dict[str, deque[float]] = {}
        self.seen: dict[str, float] = {}
        self.maker: maker_rules.PartySongs | None = None
        """The party songs, when the player makes them (guests may when the host lets them)."""
        self.uploads: dict[str, deque[float]] = {}
        self.reactions: deque[dict[str, Any]] = deque(maxlen=REACTIONS_KEPT)
        self.last_reaction = 0
        self.reacted: dict[str, deque[float]] = {}
        self.tally_path = directory / TALLY_FILE
        self.cheers: dict[str, dict[str, int]] = {}
        """The reactions per song, kept for good (``reactions.json``)."""
        self.votes: dict[str, dict[str, str]] = {}
        """Per song, the reaction each guest gave (only one per song counts)."""
        self._load_tally()
        self.replay_path = directory / REPLAY_FILE
        self.party: dict[str, dict[str, Any]] = {}
        """The songs made at this party that played: what the guests hear again."""
        self._load_party()

    # --- settings and the server -------------------------------------------------------------------
    def _load(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            data = {}
        settings = {
            **DEFAULTS,
            **{k: v for k, v in (data if isinstance(data, dict) else {}).items() if k in DEFAULTS},
        }
        if settings["mode"] not in MODES:
            settings["mode"] = "view"
        if settings["show"] not in SHOWS:
            settings["show"] = "both"
        if not isinstance(settings["reactions"], bool):
            settings["reactions"] = True
        if settings["reactions_per_song"] not in PER_SONG:
            settings["reactions_per_song"] = "any"
        if not isinstance(settings["token"], str) or len(settings["token"]) < 12:
            settings["token"] = new_token()
        if not isinstance(settings["replay"], bool):
            settings["replay"] = True
        if not isinstance(settings["party_since"], (int, float)) or isinstance(settings["party_since"], bool):
            settings["party_since"] = 0.0
        return settings

    def _load_party(self) -> None:
        try:
            data = json.loads(self.replay_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        if not isinstance(data, dict) or data.get("since") != self.settings["party_since"]:
            return  # another party's
        for song, info in (data.get("songs") or {}).items() if isinstance(data.get("songs"), dict) else ():
            if SONG_ID.fullmatch(str(song)) and isinstance(info, dict):
                self.party[str(song)] = {"at": float(info.get("at") or 0), "by": str(info.get("by") or "")}

    def _save_party(self) -> None:
        try:
            self.replay_path.parent.mkdir(parents=True, exist_ok=True)
            temp = self.replay_path.with_suffix(".tmp")
            temp.write_text(
                json.dumps({"since": self.settings["party_since"], "songs": self.party}), encoding="utf-8"
            )
            temp.replace(self.replay_path)
        except OSError:
            pass

    def _new_party(self) -> None:
        """A new party begins (under the lock): what the guests hear again starts empty."""
        self.settings["party_since"] = time.time()
        self.party = {}
        self._save_party()

    def _load_tally(self) -> None:
        try:
            data = json.loads(self.tally_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return
        songs = data.get("songs") if isinstance(data, dict) else None
        votes = data.get("votes") if isinstance(data, dict) else None
        for song, tally in (songs or {}).items() if isinstance(songs, dict) else ():
            if isinstance(tally, dict):
                kept = {
                    k: int(n) for k, n in tally.items() if k in REACTIONS and isinstance(n, int) and n > 0
                }
                if kept:
                    self.cheers[str(song)] = kept
        for song, given in (votes or {}).items() if isinstance(votes, dict) else ():
            if isinstance(given, dict):
                self.votes[str(song)] = {str(g): str(k) for g, k in given.items() if k in REACTIONS}

    def _save_tally(self) -> None:
        """Write the reactions (under the lock); a full disk keeps them in memory until the next one."""
        try:
            self.tally_path.parent.mkdir(parents=True, exist_ok=True)
            temp = self.tally_path.with_suffix(".tmp")
            temp.write_text(json.dumps({"songs": self.cheers, "votes": self.votes}), encoding="utf-8")
            temp.replace(self.tally_path)
        except OSError:
            pass

    def tallies(self) -> dict[str, dict[str, int]]:
        """Every song's reactions, for the player's pages."""
        with self.lock:
            return {song: dict(tally) for song, tally in self.cheers.items()}

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(".tmp")
        temp.write_text(json.dumps(self.settings, indent=1), encoding="utf-8")
        temp.replace(self.path)

    def resume(self) -> None:
        """At the player's start: the access as it was left (on stays on)."""
        if self.settings["on"]:
            self._start()

    def configure(self, changes: dict[str, Any]) -> dict[str, Any]:
        """Switch the access on or off, choose what guests may do and what the screen shows, or make a new
        address (``regenerate``: the old one leads nowhere from now on)."""
        with self.lock:
            if changes.get("mode") in MODES:
                self.settings["mode"] = changes["mode"]
            if changes.get("show") in SHOWS:
                self.settings["show"] = changes["show"]
            if isinstance(changes.get("reactions"), bool):
                self.settings["reactions"] = changes["reactions"]
            if changes.get("reactions_per_song") in PER_SONG:
                self.settings["reactions_per_song"] = changes["reactions_per_song"]
            if isinstance(changes.get("replay"), bool):
                self.settings["replay"] = changes["replay"]
            was_on = bool(self.settings["on"])
            if changes.get("regenerate"):
                self.settings["token"] = new_token()
                self.wishes.clear()
                self.seen.clear()
                self.reacted.clear()
            if "on" in changes:
                self.settings["on"] = bool(changes["on"])
            # a new party: the access switched on, a new address, or the host says so
            if changes.get("new_party") or changes.get("regenerate") or (self.settings["on"] and not was_on):
                self._new_party()
            self._save()
            if self.settings["on"] and self.server is None:
                self._start()
            elif not self.settings["on"] and self.server is not None:
                self._stop()
        return self.status()

    def _start(self) -> None:
        self.error = ""
        wanted = self.settings.get("port") or 0
        ports = [wanted] if wanted else []
        ports += [p for p in PORTS if p not in ports]
        for port in ports:
            try:
                server = serve_guests(self, self.host, int(port))
            except OSError:
                continue
            self.server = server
            self.settings["port"] = server.server_address[1]
            self._save()
            threading.Thread(target=server.serve_forever, daemon=True, name="plenio-guests").start()
            return
        self.error = f"no free port among {PORTS.start}-{PORTS.stop - 1}"
        self.settings["on"] = False
        self._save()

    def _stop(self) -> None:
        server, self.server = self.server, None
        if server is not None:
            server.shutdown()
            server.server_close()

    def close(self) -> None:
        with self.lock:
            self._stop()

    def status(self) -> dict[str, Any]:
        """For the player's page: the settings, whether the access answers, and its addresses."""
        running = self.server is not None
        port = self.settings["port"]
        token = self.settings["token"]
        # on every network: this computer's addresses; on one address: that one
        addresses = (lan_addresses() if self.host in ALL_NETWORKS else [self.host]) if running else []
        urls = [f"http://{address}:{port}/{token}/" for address in addresses]
        now = time.monotonic()
        return {
            "on": bool(self.settings["on"]) and running,
            "mode": self.settings["mode"],
            "show": self.settings["show"],
            "reactions": bool(self.settings["reactions"]),
            "reactions_per_song": self.settings["reactions_per_song"],
            "port": port,
            "url": urls[0] if urls else "",
            "urls": urls,
            "guests": sum(1 for at in self.seen.values() if now - at < 30),
            "error": self.error,
            "replay": bool(self.settings["replay"]),
            "party_since": self.settings["party_since"],
            "party_songs": len(self.party),
        }

    def token_ok(self, token: str) -> bool:
        return bool(self.settings["on"]) and hmac.compare_digest(
            token.encode(), self.settings["token"].encode()
        )

    # --- the player's page ---------------------------------------------------------------------------
    def publish(self, data: dict[str, Any]) -> None:
        """What the player's page shows now: the song that plays (with where it is), what comes next and
        what played - song ids only; titles and covers come from the library, never from the page."""

        def entry(item: Any) -> dict[str, Any] | None:
            if not isinstance(item, dict) or not isinstance(item.get("id"), str):
                return None
            song = self.library.song(item["id"])
            if song is None:
                return None
            summary = song.summary
            at = item.get("at")
            by = summary.get("artist") or summary.get("genre") or ""
            # a party song: who made it, when the host shows it
            made = maker_rules.party_maker(summary.get("tags") or {}) if credit else None
            day = maker_rules.party_date(summary.get("tags") or {}) if made else ""
            return {
                "id": song.id,
                "at": at if isinstance(at, int) and not isinstance(at, bool) else -1,
                "title": summary.get("title") or "",
                "by": by,
                "made_by": made or "",
                "made_on": day,
                "seconds": round(float(summary.get("seconds") or 0.0), 1),
                "cover": bool((summary.get("has") or {}).get("cover")),
                "new": bool(item.get("new")),
            }

        credit = self.maker is not None and self.maker.settings.get("credit", "off") != "off"
        now = entry(data.get("now"))
        if now is not None:
            position = data.get("position")
            now["position"] = round(float(position), 2) if isinstance(position, (int, float)) else 0.0
        played = [e for e in (entry(x) for x in (data.get("played") or [])[:10]) if e]
        snapshot = {
            "live": bool(data.get("live")),
            "playing": bool(data.get("playing")),
            "waiting": bool(data.get("waiting")),
            "now": now,
            "next": [e for e in (entry(x) for x in (data.get("next") or [])[:LIST_LIMIT]) if e],
            "played": played,
        }
        with self.lock:
            self.snapshot = snapshot
            self.snapshot_at = time.monotonic()
        self._remember_played(played)

    def _remember_played(self, played: list[dict[str, Any]]) -> None:
        """The songs made at this party that have played: the guests may hear them again."""
        if self.maker is None:
            return
        since = float(self.settings["party_since"] or 0)
        fresh = []
        for item in played:
            song_id = item["id"]
            if song_id in self.party:
                continue
            made = self.maker.made_here(song_id, since)
            if made is not None:
                fresh.append((song_id, made["by"]))
        if fresh:
            with self.lock:
                for song_id, by in fresh:
                    self.party.setdefault(song_id, {"at": time.time(), "by": by})
                self._save_party()

    def party_songs(self) -> list[dict[str, Any]]:
        """This party's songs that played, the last first - for the guests to hear again."""
        with self.lock:
            kept = dict(self.party)
        out = []
        for song_id, info in sorted(kept.items(), key=lambda item: -item[1]["at"]):
            song = self.library.song(song_id)
            if song is None or "audio" not in song.files:
                continue
            summary = song.summary
            out.append(
                {
                    "id": song_id,
                    "title": summary.get("title") or "",
                    "by": info.get("by") or summary.get("artist") or "",
                    "seconds": round(float(summary.get("seconds") or 0.0), 1),
                    "cover": bool((summary.get("has") or {}).get("cover")),
                    "played": info.get("at"),
                }
            )
        return out

    def party_audio(self, song_id: str) -> Path | None:
        """A party song's audio for a guest's phone (the MP3 where there is one); ``None`` for any other song."""
        if not self.settings["replay"] or song_id not in self.party:
            return None
        song = self.library.song(song_id)
        if song is None:
            return None
        return next((song.files[k] for k in ("audio_mp3", "audio") if k in song.files), None)

    def take(self, after: int, reacted: int | None = None) -> dict[str, Any]:
        """The guests' wishes after ``after`` (the last one the page carried out), and their reactions after
        ``reacted`` (the last one the page showed; ``None``: only the count, for a page that just opened)."""
        with self.lock:
            reactions = [r for r in self.reactions if r["n"] > reacted] if reacted is not None else []
            return {
                "wishes": [w for w in self.wishes if w["n"] > after],
                "last": self.last_wish,
                "reactions": reactions,
                "last_reaction": self.last_reaction,
                # the counts of the songs reacted to, as kept (a changed reaction moves from one kind to another)
                "cheers": {r["id"]: dict(self.cheers.get(r["id"], {})) for r in reactions},
            }

    # --- the guests ----------------------------------------------------------------------------------
    def view(self, guest: str, voter: str = "") -> dict[str, Any]:
        """What a guest sees: the live playlist as the page last showed it, and what they may do (``voter``: the
        guest's own id - their reaction to the song that plays, when only one counts)."""
        with self.lock:
            self.seen[guest] = time.monotonic()
            fresh = self.snapshot and time.monotonic() - self.snapshot_at < STALE_AFTER
            snapshot = dict(self.snapshot) if fresh else {}
            age = time.monotonic() - self.snapshot_at if fresh else None
        if snapshot.get("now"):
            now = dict(snapshot["now"])
            if snapshot.get("playing") and age is not None:
                now["position"] = round(min(now["seconds"] or 1e9, now["position"] + age), 2)
            with self.lock:
                now["cheers"] = dict(self.cheers.get(now["id"], {}))
                if voter and self.settings["reactions_per_song"] == "one":
                    now["mine"] = self.votes.get(now["id"], {}).get(voter, "")
            snapshot["now"] = now
        make = bool(self.maker is not None and self.maker.guests_may())
        return {
            "open": bool(fresh),
            "mode": self.settings["mode"],
            "make": make,
            "replay": bool(self.settings["replay"]) and bool(self.party),
            "react": bool(self.settings["reactions"]),
            "per_song": self.settings["reactions_per_song"],
            **snapshot,
        }

    def wish(self, guest: str, data: Any) -> tuple[int, dict[str, Any]]:
        """A guest's wish (change mode only): a song up, down, next, out - or a song of the library added
        next or at the end. Checked here; the page carries it out if it still can."""
        if self.settings["mode"] != "change":
            return 403, {"error": "the host lets guests only look"}
        if not isinstance(data, dict) or data.get("op") not in OPS:
            return 400, {"error": f"op: one of {', '.join(OPS)}"}
        song_id = data.get("id")
        if (
            not isinstance(song_id, str)
            or not SONG_ID.fullmatch(song_id)
            or self.library.song(song_id) is None
        ):
            return 400, {"error": "no such song"}
        wish: dict[str, Any] = {"op": data["op"], "id": song_id}
        if data["op"] == "add":
            if data.get("where") not in ("next", "end"):
                return 400, {"error": "where: next or end"}
            wish["where"] = data["where"]
        else:
            at = data.get("at")
            if not isinstance(at, int) or isinstance(at, bool) or not 0 <= at < 100_000:
                return 400, {"error": "at: the song's place in the playlist"}
            wish["at"] = at
        now = time.monotonic()
        with self.lock:
            sent = self.sent.setdefault(guest, deque())
            while sent and now - sent[0] > 60:
                sent.popleft()
            if len(sent) >= WISHES_PER_MINUTE:
                return 429, {"error": "slow down a little"}
            sent.append(now)
            self.last_wish += 1
            wish["n"] = self.last_wish
            self.wishes.append(wish)
        return 200, {"ok": True, "n": wish["n"]}

    def react(self, guest: str, data: Any, voter: str = "") -> tuple[int, dict[str, Any]]:
        """A guest's reaction to the song that plays: on its way to the player's screen, and counted for the
        song (kept for good). Only one of ``REACTIONS``, only while the page shows a song, a few a minute per guest;
        with one per song (``voter``: the guest's own id) a tap on another kind changes theirs, the same kind
        again is not counted twice."""
        if not self.settings["reactions"]:
            return 403, {"error": "the host has switched reactions off"}
        kind = data.get("kind") if isinstance(data, dict) else None
        if kind not in REACTIONS:
            return 400, {"error": f"kind: one of {', '.join(REACTIONS)}"}
        now = time.monotonic()
        with self.lock:
            fresh = bool(self.snapshot) and now - self.snapshot_at < STALE_AFTER
            song = (self.snapshot.get("now") or {}).get("id") if fresh else None
            if not song:
                return 409, {"error": "nothing plays at the moment"}
            sent = self.reacted.setdefault(guest, deque())
            while sent and now - sent[0] > 60:
                sent.popleft()
            if len(sent) >= REACTIONS_PER_MINUTE:
                return 429, {"error": "slow down a little"}
            sent.append(now)
            tally = self.cheers.setdefault(song, {})
            if self.settings["reactions_per_song"] == "one":
                given = self.votes.setdefault(song, {})
                # without the guest's cookie id, the address - hashed, as it is written to reactions.json
                who = voter or maker_rules.guest_id(guest)
                before = given.get(who)
                if before == kind:
                    return 200, {"ok": True, "cheers": dict(tally), "mine": kind, "same": True}
                if before:
                    tally[before] = tally.get(before, 0) - 1
                    if tally[before] <= 0:
                        del tally[before]
                given[who] = kind
            tally[kind] = tally.get(kind, 0) + 1
            self.last_reaction += 1
            self.reactions.append({"n": self.last_reaction, "kind": kind, "id": song})
            self._save_tally()
            if self.on_reaction is not None:  # the Player API's events (server.serve)
                self.on_reaction({"kind": kind, "id": song})
            answer: dict[str, Any] = {"ok": True, "cheers": dict(tally)}
            if self.settings["reactions_per_song"] == "one":
                answer["mine"] = kind
            return 200, answer

    def search(self, query: str) -> list[dict[str, Any]]:
        """Songs of the library for a guest to add: every word in the title, artist, genre or mood."""
        words = [w for w in query.lower().split() if w][:6]
        found: list[tuple[int, dict[str, Any]]] = []
        for summary in self.library.songs():
            title = str(summary.get("title") or "")
            text = " ".join(
                str(summary.get(k) or "") for k in ("title", "artist", "album", "genre", "mood")
            ).lower()
            if words and not all(w in text for w in words):
                continue
            rank = 0 if words and all(w in title.lower() for w in words) else 1
            found.append(
                (
                    rank,
                    {
                        "id": summary["id"],
                        "title": title,
                        "by": summary.get("artist") or summary.get("genre") or "",
                        "seconds": round(float(summary.get("seconds") or 0.0), 1),
                        "cover": bool((summary.get("has") or {}).get("cover")),
                    },
                )
            )
        found.sort(key=lambda x: (x[0], x[1]["title"].lower()))
        return [item for _, item in found[:40]]

    def cover(self, song_id: str) -> Path | None:
        song = self.library.song(song_id) if SONG_ID.fullmatch(song_id) else None
        if song is None:
            return None
        path = song.files.get("cover")
        if path is None and song.other and (song.summary.get("has") or {}).get("cover"):
            path = other_music.embedded_cover(song.record, song.id, self.cache)
        return path


IMAGE_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
MEDIA_TYPES = {
    **IMAGE_TYPES,
    ".mp3": "audio/mpeg",
    ".flac": "audio/flac",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
}
"""What the guests' server sends of a song: its cover, and its audio - their own song to hear first, a song of the
party to hear again."""
MAKER_HEADERS = {
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": (
        "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
        "media-src 'self' blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    ),
}
"""The song form is a built page (its own scripts and styles from this server, nothing from elsewhere)."""
PAGE_HEADERS = {
    # the token is in the address: it goes to no other site, and the page runs only its own code
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": (
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; "
        "media-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    ),
}


def serve_guests(hub: GuestHub, host: str, port: int) -> ThreadingHTTPServer:
    """The guests' server: everything below ``/<token>/``, every other address a plain 404."""

    class Handler(BaseHTTPRequestHandler):
        server_version = "PlenioLive"

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - the base class's name
            pass

        def _send(
            self,
            status: int,
            body: bytes,
            kind: str,
            headers: dict[str, str] | None = None,
            *,
            page: dict[str, str] | None = None,
        ) -> None:
            self.send_response(status)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            for name, value in {**(page or PAGE_HEADERS), **(headers or {})}.items():
                self.send_header(name, value)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _json(self, data: Any, status: int = 200, cookie: str = "") -> None:
            self._send(
                status,
                json.dumps(data, ensure_ascii=False).encode("utf-8"),
                "application/json; charset=utf-8",
                {"Set-Cookie": cookie} if cookie else None,
            )

        # --- the party songs (when the host lets guests make them) ---
        def _guest(self) -> tuple[dict[str, Any], str]:
            token = maker_rules.token_of(self.headers.get("Cookie"))
            cookie = ""
            if not token:
                token = maker_rules.new_guest_token()
                cookie = maker_rules.guest_cookie(token)
            # ``party``: a guest of the party makes again only their own songs
            return {
                "kind": "guest",
                "id": maker_rules.guest_id(token),
                "name": maker_rules.GUEST_NAME,
                "party": True,
            }, cookie

        def _maker_page(self, route: str) -> None:
            if route in ("/make", "/make/"):
                target = MAKER_PAGE / "index.html"
            elif route.startswith("/make/assets/"):
                name = route.removeprefix("/make/assets/")
                target = MAKER_PAGE / "assets" / name
                if "/" in name or "\\" in name or name.startswith(".") or target.suffix not in ASSET_TYPES:
                    return self._nothing()
            else:
                return self._nothing()
            try:
                body = target.read_bytes()
            except OSError:
                return self._nothing()
            kind = "text/html; charset=utf-8" if target.suffix == ".html" else ASSET_TYPES[target.suffix]
            cache = {"Cache-Control": "max-age=86400"} if target.suffix != ".html" else None
            return self._send(200, body, kind, cache, page=MAKER_HEADERS)

        def _make(self, method: str, route: str, query: dict[str, str], raw: bytes) -> None:
            maker = hub.maker
            if maker is None or not maker.guests_may():
                return self._json({"error": "the host does not let guests make songs"}, 403)
            who, cookie = self._guest()
            job = re.fullmatch(r"/api/make/jobs/([0-9a-f]{16})(/move)?", route)
            waiting = re.fullmatch(r"/api/make/jobs/([0-9a-f]{16})/(audio|cover|release|discard)", route)
            try:
                if method == "GET" and waiting and waiting.group(2) in ("audio", "cover"):
                    # their own song, to hear it first on their phone (owner's request 2026-10-29)
                    return self._media(maker.listen(who, waiting.group(1), waiting.group(2)))
                if method == "GET" and route == "/api/make":
                    return self._json(maker.status(who), cookie=cookie)
                if method == "GET" and route == "/api/make/form":
                    return self._json(maker.form(who), cookie=cookie)
                again = re.fullmatch(r"/api/make/from/([0-9a-f]{6,64})", route)
                if method == "GET" and again:
                    return self._json(maker.remake(who, again.group(1)), cookie=cookie)
                if method == "POST" and route == "/api/make/sources":
                    # a header another site's page cannot send without asking first (this server never says yes)
                    if self.headers.get("X-Plenio-Live") != "1":
                        return self._json({"error": "from the guests' page only"}, 403)
                    now = time.monotonic()
                    with hub.lock:
                        sent = hub.uploads.setdefault(self.client_address[0], deque())
                        while sent and now - sent[0] > 60:
                            sent.popleft()
                        if len(sent) >= SOURCES_PER_MINUTE:
                            return self._json({"error": "slow down a little"}, 429)
                        sent.append(now)
                    return self._json(maker.add_source(who, query.get("name", ""), raw), 201, cookie)
                # JSON only (DELETE as it is: no other site's page sends one without asking first)
                if method != "DELETE" and not (self.headers.get("Content-Type") or "").startswith(
                    "application/json"
                ):
                    return self._json({"error": "JSON only"}, 415)
                body = json.loads(raw.decode("utf-8")) if raw else {}
                if not isinstance(body, dict):
                    return self._json({"error": "not JSON"}, 400)
                if method == "POST" and route == "/api/make/jobs":
                    return self._json(maker.create(who, body), 201, cookie)
                if method == "POST" and waiting and waiting.group(2) == "release":
                    return self._json(maker.release(who, waiting.group(1)), cookie=cookie)
                if method == "POST" and waiting and waiting.group(2) == "discard":
                    return self._json(maker.discard(who, waiting.group(1)), cookie=cookie)
                if job and method == "PUT" and not job.group(2):
                    return self._json(maker.update(who, job.group(1), body), cookie=cookie)
                if job and method == "POST" and job.group(2):
                    by = body.get("by")
                    return self._json(
                        maker.move(who, job.group(1), by if isinstance(by, int) else 0), cookie=cookie
                    )
                if job and method == "DELETE" and not job.group(2):
                    return self._json(maker.remove(who, job.group(1)), cookie=cookie)
            except maker_rules.MakerError as error:
                return self._json({"error": str(error)}, error.status)
            except ValueError:
                return self._json({"error": "not JSON"}, 400)
            return self._nothing()

        def _media(self, path: Path) -> None:
            """A song's audio or cover, in parts as a phone's player asks (``Range``) - the guests' server serves no
            other files than the page's, the covers and these."""
            kind = MEDIA_TYPES.get(path.suffix.lower())
            if kind is None or not path.is_file():
                return self._nothing()
            size = path.stat().st_size
            start, end = 0, size - 1
            ranged = re.fullmatch(r"bytes=(\d*)-(\d*)", (self.headers.get("Range") or "").strip())
            if ranged and (ranged.group(1) or ranged.group(2)):
                if ranged.group(1):
                    start = int(ranged.group(1))
                    end = int(ranged.group(2)) if ranged.group(2) else size - 1
                else:
                    start = max(0, size - int(ranged.group(2)))
                end = min(end, size - 1)
                if start > end or start >= size:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{size}")
                    self.send_header("Content-Length", "0")
                    self.end_headers()
                    return None
                self.send_response(206)
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            else:
                self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(end - start + 1))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "no-store")
            for name, value in PAGE_HEADERS.items():
                self.send_header(name, value)
            self.end_headers()
            if self.command == "HEAD":
                return None
            with path.open("rb") as stream:
                stream.seek(start)
                left = end - start + 1
                while left > 0:
                    chunk = stream.read(min(1 << 16, left))
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                    except (BrokenPipeError, ConnectionResetError):
                        return None
                    left -= len(chunk)
            return None

        def _read(self, limit: int) -> bytes | None:
            length = int(self.headers.get("Content-Length") or 0)
            if length > limit:
                self.close_connection = True
                return None
            return self.rfile.read(length) if length > 0 else b""

        def _nothing(self) -> None:
            self._send(404, b"not found", "text/plain; charset=utf-8")

        def _route(self) -> tuple[str, dict[str, str]] | None:
            """The path below a valid token, or ``None``."""
            parsed = urlparse(self.path)
            parts = unquote(parsed.path).split("/", 2)
            if len(parts) < 3 or parts[0] != "" or not hub.token_ok(parts[1]):
                return None
            return "/" + parts[2], {k: v[0] for k, v in parse_qs(parsed.query).items()}

        def do_HEAD(self) -> None:  # noqa: N802 - the base class's name
            self.do_GET()

        def do_GET(self) -> None:  # noqa: N802
            address = unquote(urlparse(self.path).path)
            if address.count("/") == 1 and hub.token_ok(address[1:]):
                # the address typed without its last slash: the page's own links need it
                self.send_response(301)
                self.send_header("Location", f"{address}/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            found = self._route()
            if found is None:
                return self._nothing()
            route, query = found
            guest = self.client_address[0]
            if route == "/":
                try:
                    return self._send(200, PAGE.read_bytes(), "text/html; charset=utf-8")
                except OSError:
                    return self._nothing()
            if route == "/api/live":
                who, cookie = self._guest()
                return self._json(hub.view(guest, who["id"]), cookie=cookie)
            if route == "/make":
                # without its last slash the page's own links would miss
                self.send_response(301)
                self.send_header("Location", f"{unquote(urlparse(self.path).path)}/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            if route.startswith("/make/"):
                return self._maker_page(route)
            if route == "/api/make" or route.startswith("/api/make/"):
                return self._make("GET", route, query, b"")
            if route == "/api/party":
                if not hub.settings["replay"]:
                    return self._json({"on": False, "songs": []})
                return self._json({"on": True, "songs": hub.party_songs()})
            if route.startswith("/song/"):
                path = hub.party_audio(route.removeprefix("/song/"))
                return self._media(path) if path is not None else self._nothing()
            if route == "/api/songs":
                if hub.settings["mode"] != "change":
                    return self._json({"error": "the host lets guests only look"}, 403)
                return self._json({"songs": hub.search(query.get("q", "")[:200])})
            if route.startswith("/cover/"):
                path = hub.cover(route.removeprefix("/cover/"))
                kind = IMAGE_TYPES.get(path.suffix.lower()) if path else None
                if path is None or kind is None or not path.is_file():
                    return self._nothing()
                return self._send(200, path.read_bytes(), kind, {"Cache-Control": "max-age=3600"})
            return self._nothing()

        def do_POST(self) -> None:  # noqa: N802
            found = self._route()
            if found is not None and found[0] == "/api/make/sources":
                upload = self._read(maker_rules.SOURCE_LIMIT)
                if upload is None:
                    return self._json({"error": "too large"}, 413)
                return self._make("POST", found[0], found[1], upload)
            raw = self._read(BODY_LIMIT)
            if raw is None:
                return self._json({"error": "too large"}, 413)
            if found is not None and found[0].startswith("/api/make/"):
                return self._make("POST", found[0], found[1], raw)
            if found is None or found[0] not in ("/api/wish", "/api/react"):
                return self._nothing()
            # JSON only: another site's page in a guest's browser cannot send it without asking first
            if not (self.headers.get("Content-Type") or "").startswith("application/json"):
                return self._json({"error": "JSON only"}, 415)
            try:
                data = json.loads(raw.decode("utf-8"))
            except ValueError:
                return self._json({"error": "not JSON"}, 400)
            if found[0] == "/api/wish":
                status, answer = hub.wish(self.client_address[0], data)
                return self._json(answer, status)
            # a reaction: the guest's own cookie tells their one reaction per song from another phone's
            who, cookie = self._guest()
            status, answer = hub.react(self.client_address[0], data, who["id"])
            return self._json(answer, status, cookie=cookie)

        def do_PUT(self) -> None:  # noqa: N802
            raw = self._read(BODY_LIMIT)
            found = self._route()
            if raw is None:
                return self._json({"error": "too large"}, 413)
            if found is None or not found[0].startswith("/api/make/"):
                return self._nothing()
            return self._make("PUT", found[0], found[1], raw)

        def do_DELETE(self) -> None:  # noqa: N802
            raw = self._read(BODY_LIMIT)
            found = self._route()
            if raw is None:
                return self._json({"error": "too large"}, 413)
            if found is None or not found[0].startswith("/api/make/"):
                return self._nothing()
            return self._make("DELETE", found[0], found[1], raw)

    class Server(ThreadingHTTPServer):
        daemon_threads = True
        # as the player's own server: the port free again at once after a restart, but never shared on Windows
        allow_reuse_address = os.name != "nt"

    return Server((host, port), Handler)
