"""The Plenio Player's local web server: the player page, the library as JSON, the songs' files (with byte
ranges, so the audio seeks) and the listener's own state (playlists, favourites, plays).

Standard library only. It serves the files of the songs it found and nothing else, and listens on
127.0.0.1 unless told otherwise.
"""

from __future__ import annotations

import functools
import gzip
import json
import logging
import mimetypes
import os
import re
import secrets
import threading
import time
import urllib.request
from collections.abc import Callable
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PureWindowsPath
from typing import Any
from urllib.parse import parse_qs, quote, unquote, urlparse

from .. import __version__
from . import accounts as account_rules
from . import folders as folder_choice
from . import maker as maker_rules
from . import other as other_music
from . import player_api
from .analysis import track as analysis_track
from .guest import GuestHub, lan_addresses
from .library import RETIRED_DIR, Library, song_detail
from .measured import measured_for, ratings_of
from .network import REMOTE_HEADER, REMOTE_HOST_HEADER, REMOTE_PEER_HEADER, NetworkAccess
from .package import MAX_SONGS, PackageJobs, package_file, packages_dir
from .package import listing as package_listing
from .peaks import peaks
from .remote import PlayerRemote, RemoteError, check_live, check_queue, check_transport
from .search import Context as SearchContext
from .search import search as search_songs
from .song_page import render as render_song_page
from .studio import StudioLauncher, StudioLaunchError
from .thumbs import thumbnail
from .video import AUDIO_BITRATE, VideoJobs, videos_dir
from .visuals import list_presets, prepare_folder, save_copy, show_folder, visuals_dir

STATIC = Path(__file__).resolve().parent / "static"
MEDIA_KINDS = {
    "audio",
    "original",
    "cover",
    "pdf",
    "lines",
    "notes",
    "sung",
    "record",
    "audio_flac",
    "audio_mp3",
    "audio_wav",
}
STATE_LIMIT = 4 * 2**20
NEW_SONGS_EVERY = 2.0
"""Live Play asks every few seconds for new songs: the folders are read again at most this often."""
VIDEO_FPS = (24, 25, 30, 50, 60)
VIDEO_MAX_SIDE = 3840
VIDEO_AUDIO_KBITS = (128, 192, 256, 320)
"""The video's sound as AAC (owner's request 2026-10-29: more quality settings)."""
CHUNK = 256 * 1024
GZIP_MIN = 1400
"""Answers at least this large go compressed to a browser that takes gzip: the library of 2958 songs is 9.6 MB of
JSON, 1 MB compressed (2026-10-26) - a phone in the network had to load all of it at every start."""
GZIP_TYPES = (".js", ".mjs", ".css", ".html", ".htm", ".svg", ".json", ".webmanifest")
LIBRARY_WAIT_S = 2.0
EVENTS_WAIT_S = 15.0
"""The Player API's event stream says it is still there at least this often."""
"""While the folders are read the first time, the library's answer waits this long, then says how far it is."""
THUMB_SIZES = (128, 256, 512, 768)
"""The sizes of the covers' small pictures (``?size=``): the page picks the smallest one large enough."""
BOOT = secrets.token_hex(4)
"""Part of every ETag: a player started again never answers *unchanged* for an answer of the one before."""
SECURITY_HEADERS = (
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "same-origin"),
    # no other site may show the player in a frame of its own (and have a click land on Remove …)
    ("X-Frame-Options", "SAMEORIGIN"),
    ("Content-Security-Policy", "frame-ancestors 'self'"),
)
log = logging.getLogger("plenio.player")
TYPES = {".mp4": "video/mp4", ".htm": "text/html; charset=utf-8", ".flac": "audio/flac", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".srt": "text/plain; charset=utf-8",
         ".json": "application/json", ".pdf": "application/pdf", ".jpg": "image/jpeg", ".js": "text/javascript",
         ".mjs": "text/javascript", ".css": "text/css", ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml",
         ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json"}  # fmt: skip
APP = "plenio-player"
COMFYUI_PORTS = (8188, 8000)  # ComfyUI, ComfyUI Desktop
LOOPBACK_URL = re.compile(r"https?://(127\.0\.0\.1|localhost|\[::1\]):\d{2,5}/?")
EMPTY_STATE: dict[str, Any] = {
    "playlists": [],
    "favorites": [],
    "plays": {},
    "last_played": {},
    "tags": {},
    "settings": {},
    "ratings": {},
}


class State:
    """The listener's playlists, favourites, play counts and settings in one JSON file (outside the songs'
    folders, which the player changes only to remove a song). ``rev`` counts the changes: a page that saves
    names the one it started from, and is told when another page (another tab, a phone from the network)
    saved in between - it then merges the two and saves again (owner's request 2026-10-18: the player open
    on several devices at once). It starts from the clock, so a page from before a restart merges too."""

    def __init__(self, path: Path):
        self.path = path
        self.lock = threading.Lock()
        self.rev = int(time.time() * 1000)

    def read(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
            return {**EMPTY_STATE, **data} if isinstance(data, dict) else dict(EMPTY_STATE)
        except (OSError, ValueError):
            return dict(EMPTY_STATE)

    def write(self, data: dict[str, Any], base: int | None = None) -> int | None:
        """Save ``data``; with ``base``, only when nothing was saved since that change (``None`` back: it was).
        The new change's number back."""
        with self.lock:
            if base is not None and base != self.rev:
                return None
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temp = self.path.with_suffix(".tmp")
            temp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
            # Windows refuses the replace while another program reads the file for a moment (a virus scanner,
            # a backup): it is tried again (seen in the owner's player.log, 2026-10)
            for attempt in range(20):
                try:
                    temp.replace(self.path)
                    break
                except PermissionError:
                    if attempt == 19:
                        raise
                    time.sleep(0.05)
            self.rev += 1
            return self.rev


_own: tuple[float, frozenset[str]] = (-1e9, frozenset())
_own_lock = threading.Lock()


def own_addresses() -> frozenset[str]:
    """This computer's own network addresses (asked at most once a minute): a browser on this computer that opens a
    player started with ``--host <its address>`` comes from one of them."""
    global _own
    with _own_lock:
        if time.monotonic() - _own[0] > 60:
            _own = (time.monotonic(), frozenset(lan_addresses()))
        return _own[1]


def from_this_computer(client: str, remote: bool) -> bool:
    """A request of a browser on this computer itself: from a loopback address or one of this computer's own, and
    not passed on by a gateway of *In your network*. A player started with ``--host`` answers the network directly -
    its requests from other computers are not this computer's, whatever the login says (a connection's address
    cannot be chosen by the other side)."""
    if remote:
        return False
    return client in ("127.0.0.1", "::1") or client.removeprefix("::ffff:") in own_addresses()


PLACE_KEYS = frozenset(
    {
        "audio",
        "file_path",
        "folder",
        "folders",
        "path",
        "record",
        "record_path",
        "retire_to",
        "root",
        "started_with",
        "state",
    }
)
"""The keys under which the player's answers name a place on this computer: a folder, a file."""
REMOTE_FAILURE = "The player could not do that - its log on the computer says why."
"""What a request from the network hears of a failure (its text can name this computer's folders)."""


def place_name(text: str) -> str:
    """A folder's or file's own name, without where it is (``D:\\Music\\Plenio`` -> ``Plenio``)."""
    return PureWindowsPath(text).name  # takes "/" and "\\" apart: a path of any system


def without_places(data: Any, key: str = "") -> Any:
    """``data`` as a request from the network gets it: the folders and files of this computer by their names - where
    they are stays this computer's (the absolute paths among the values of ``PLACE_KEYS``)."""
    if isinstance(data, dict):
        return {name: without_places(value, str(name)) for name, value in data.items()}
    if isinstance(data, list):
        return [without_places(value, key) for value in data]
    if (
        isinstance(data, str)
        and key in PLACE_KEYS
        and (PureWindowsPath(data).is_absolute() or data.startswith("/"))
    ):
        return place_name(data)
    return data


def comfyui_at(url: str, timeout: float = 0.8) -> dict[str, Any] | None:
    """The ComfyUI answering at ``url`` (a loopback address only: the player asks no other computer)."""
    if not LOOPBACK_URL.fullmatch(url):
        return None
    try:
        with urllib.request.urlopen(f"{url.rstrip('/')}/system_stats", timeout=timeout) as answer:  # noqa: S310
            stats = json.loads(answer.read().decode("utf-8"))
    except (OSError, ValueError):
        return None
    system = stats.get("system") if isinstance(stats, dict) else None
    if not isinstance(system, dict):
        return None
    return {"url": url.rstrip("/") + "/", "version": str(system.get("comfyui_version") or "")}


def find_comfyui(preferred: str = "", also: Callable[[], str] | None = None) -> dict[str, Any] | None:
    """ComfyUI on this computer: ``preferred`` (the one that started the player, or the address in the
    settings), the one the player starts itself (``also``: its address), else the usual loopback ports."""
    for url in [u for u in (preferred, also() if also else "") if u]:
        found = comfyui_at(url)
        if found:
            return found
    for port in COMFYUI_PORTS:
        found = comfyui_at(f"http://127.0.0.1:{port}")
        if found:
            return found
    return None


def studio_finder(
    preferred: str = "", every: float = 10.0, also: Callable[[], str] | None = None
) -> Callable[[], str | None]:
    """The address of the ComfyUI on this computer for the party songs, looked for at most every ``every`` seconds
    (``preferred``: the one that started the player; ``also``: the address of the one the player starts)."""
    found: list[Any] = [-1e9, None]
    lock = threading.Lock()

    def url() -> str | None:
        with lock:
            if time.monotonic() - found[0] > every:
                found[1] = (find_comfyui(preferred, also) or {}).get("url")
                found[0] = time.monotonic()
            return str(found[1]) if found[1] else None

    return url


def _guarded(method: Callable[[Any], None]) -> Callable[[Any], None]:
    """A request that fails answers ``500`` with the reason (before, the connection just closed: the page saw a
    network error) and leaves it in the player's log; a browser that went away is no failure."""

    @functools.wraps(method)
    def run(handler: Any) -> None:
        handler.answered = False
        try:
            method(handler)
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            handler.close_connection = True
        except Exception as error:  # noqa: BLE001 - said to the page, kept in the log
            log.exception("Plenio Player: %s %s failed", handler.command, handler.path)
            handler.close_connection = True
            if not handler.answered:
                try:
                    handler._error(500, f"The player failed: {type(error).__name__}: {error}")
                except OSError:
                    pass

    return run


_gzipped: dict[tuple[str, int, int], bytes] = {}
_gzipped_lock = threading.Lock()


def gzipped_file(path: Path) -> bytes:
    """A page asset compressed, kept while the file stays as it is (the player's own few files)."""
    stat = path.stat()
    key = (str(path), stat.st_size, stat.st_mtime_ns)
    with _gzipped_lock:
        found = _gzipped.get(key)
    if found is None:
        found = gzip.compress(path.read_bytes(), 6)
        with _gzipped_lock:
            if len(_gzipped) > 64:
                _gzipped.clear()
            _gzipped[key] = found
    return found


def make_handler(
    library: Library,
    state: State,
    static: Path = STATIC,
    cache: Path | None = None,
    hosts: frozenset[str] = frozenset(),
    comfyui: str = "",
    guests: GuestHub | None = None,
    network: NetworkAccess | None = None,
    accounts: account_rules.Accounts | None = None,
    maker: maker_rules.PartySongs | None = None,
    launcher: StudioLauncher | None = None,
    remote: PlayerRemote | None = None,
) -> type[BaseHTTPRequestHandler]:
    """The requests' handler; with ``hosts`` it answers only requests addressed to one of them (a player on
    the loopback address is then out of reach of web pages that rename themselves to it: DNS rebinding).
    ``guests``: the guests' access to the live playlist (its own server; here only its settings, what the
    page shows and the guests' wishes). ``network``: the player and ComfyUI from the network (gateways of
    their own; here their settings) - requests that come by them do all but what belongs to this computer
    alone. ``accounts``: the login (``plenio.player.accounts``) - each user's state of their own; without it
    every page has the player's state, as before. ``maker``: the party songs (``plenio.player.maker``) - songs
    made from the page through ComfyUI's Song API. ``remote``: the Player API's reports and commands (one per
    server: ``serve`` makes it)."""

    hub = remote or PlayerRemote()
    jobs = VideoJobs(videos_dir(state.path.parent))
    packages = PackageJobs()
    # how well each song came out, measured: the record's, else measured once and kept (owner's request 2026-10-29)
    measured = measured_for(state.path.parent / "cache")
    user_states: dict[str, State] = {}
    states_lock = threading.Lock()
    # the library's answer, made once per change of the songs: JSON and compressed (``version``, raw, gzip) - for
    # this computer, and for the network (``True``)
    listings: dict[bool, list[Any]] = {False: [None, b"", b""], True: [None, b"", b""]}
    listing_lock = threading.Lock()

    def library_answer(remote: bool = False) -> tuple[str, bytes, bytes]:
        """The library as the page reads it - with its ETag: a page that has it gets ``304`` instead of 9 MB. From the
        network its folders by their names, and of a record that could not be read only the file's name."""
        songs = library.songs()
        key = (library.version, tuple(str(f) for f in library.folders))
        with listing_lock:
            listing = listings[remote]
            if listing[0] != key:
                folders, errors = [str(f) for f in library.folders], library.errors[:20]
                if remote:  # a record's error ("<file>: <why>") can name its folder
                    folders, errors = [place_name(f) for f in folders], [e.split(": ", 1)[0] for e in errors]
                body = json.dumps(
                    {"songs": songs, "folders": folders, "errors": errors, "version": __version__},
                    ensure_ascii=False,
                ).encode("utf-8")
                listing[:] = [key, body, gzip.compress(body, 5)]
            return f'"lib-{BOOT}-{library.version}{"-net" if remote else ""}"', listing[1], listing[2]

    def may_admin(account: dict[str, Any] | None) -> bool:
        """The admin's rights: the admin, or a user of the group *admin* (a helper - owner's request 2026-10-29).
        Only the admin has the admin's things (the state); what only this computer does stays this computer's."""
        return bool(account and (account.get("admin") or account.get("helper")))

    def state_of(account: dict[str, Any] | None) -> State | None:
        """The state of a user (``None``: a guest, who keeps theirs in the browser)."""
        if account is None:
            return None
        if account.get("admin") or accounts is None:
            return state
        with states_lock:
            if account["id"] not in user_states:
                user_states[account["id"]] = State(accounts.state_path(str(account["id"])))
            return user_states[account["id"]]

    def folders_answer() -> dict[str, Any]:
        counts = library.counts()
        return {
            "folders": [
                {
                    "path": str(root),
                    "other": root in library.other,
                    "exists": root.is_dir(),
                    "songs": counts.get(root, [0, 0])[0],
                    "other_songs": counts.get(root, [0, 0])[1],
                }
                for root in library.folders
            ],
            "chosen": folder_choice.load(state.path.parent) is not None,
            "started_with": [str(f) for f in library.started_with],
        }

    class Handler(BaseHTTPRequestHandler):
        server_version = f"PlenioPlayer/{__version__}"

        def parse_request(self) -> bool:
            if not super().parse_request():
                return False
            if hosts and (self.headers.get("Host") or "").lower() not in hosts:
                self._error(403, "unknown host")
                return False
            return True

        def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - the base class's name
            pass  # quiet: a player streams many ranges

        @property
        def remote(self) -> bool:
            """The request came from the network, by the gateway (which says so, on this computer)."""
            # any copy says so (a forged second one never makes it this computer's)
            marked = any(value.strip() == "1" for value in self.headers.get_all(REMOTE_HEADER) or [])
            return marked and self.client_address[0] in ("127.0.0.1", "::1")

        @property
        def here(self) -> bool:
            """The request is this computer's own: a loopback address, not passed on by the gateway. A player started
            with ``--host`` answers other computers directly - they are never this computer (review of phase 6)."""
            return from_this_computer(self.client_address[0], self.remote)

        @property
        def token(self) -> str:
            return account_rules.token_of(self.headers.get("Cookie"))

        @property
        def account(self) -> dict[str, Any] | None:
            """Whose things this request is about: the session's user - without one the admin on this computer
            (as before the login) and a guest from the network (``None``)."""
            if accounts is None:
                return {"id": account_rules.ADMIN, "admin": True}
            found = accounts.session(self.token)
            if found is not None:
                return found if not (found.get("admin") and not self.here) else None
            return accounts.admin() if self.here else None

        def _maker_who(self) -> tuple[dict[str, Any], str]:
            """Who makes a party song: the admin, a user - or a guest, known by a cookie of their own (set now
            when the browser has none: the second value); ``remote``: by *In your network* (the whole studio)."""
            account = self.account
            if account is not None:
                kind = "admin" if may_admin(account) else "user"
                return {
                    "kind": kind,
                    "id": str(account.get("id")),
                    "name": str(account.get("name") or ""),
                    "group": str(account.get("group") or account_rules.DEFAULT_GROUP),
                    "remote": self.remote,
                }, ""
            token = maker_rules.token_of(self.headers.get("Cookie"))
            cookie = ""
            if not token:
                token = maker_rules.new_guest_token()
                cookie = maker_rules.guest_cookie(token)
            return {
                "kind": "guest",
                "id": maker_rules.guest_id(token),
                "name": maker_rules.GUEST_NAME,
                "remote": self.remote,
            }, cookie

        def _make(self, method: str, route: str, query: dict[str, str], raw: bytes | None) -> None:
            """The party songs: ``GET /api/make`` (may I, the settings, my songs), ``GET /api/make/form``, ``GET
            /api/make/from/<song id>`` (to make it again), ``POST /api/make/jobs``, ``PUT /api/make/jobs/<id>``,
            ``POST /api/make/jobs/<id>/move``, ``DELETE /api/make/jobs/<id>``, ``POST /api/make/sources?name=`` (the
            recording), ``PUT /api/make/settings`` - and a song waiting to be released (owner's request 2026-10-29):
            ``GET /api/make/jobs/<id>/audio`` and ``/cover`` to hear it first, ``POST /api/make/jobs/<id>/release``
            and ``/discard``."""
            if maker is None:
                return self._error(404, "no party songs")
            who, cookie = self._maker_who()
            job = re.fullmatch(r"/api/make/jobs/([0-9a-f]{16})(/move)?", route)
            waiting = re.fullmatch(r"/api/make/jobs/([0-9a-f]{16})/(audio|cover|release|discard)", route)
            try:
                if method == "GET" and waiting and waiting.group(2) in ("audio", "cover"):
                    return self._file(maker.listen(who, waiting.group(1), waiting.group(2)))
                if method == "GET" and route == "/api/make":
                    return self._json(maker.status(who, everyone=query.get("all") == "1"), cookie=cookie)
                if method == "GET" and route == "/api/make/form":
                    return self._json(maker.form(who), cookie=cookie)
                again = re.fullmatch(r"/api/make/from/([0-9a-f]{6,64})", route)
                if method == "GET" and again:
                    return self._json(maker.remake(who, again.group(1)), cookie=cookie)
                if method == "POST" and route == "/api/make/sources":
                    if not self._binary_from_this_page():
                        return self._error(403, "only from the player's page")
                    return self._json(maker.add_source(who, query.get("name", ""), raw or b""), 201, cookie)
                # a change: JSON from the player's page (a DELETE as it is - no other site's page sends one without
                # asking first, and this server never says yes)
                if not (self._from_this_page() or (method == "DELETE" and self._binary_from_this_page())):
                    return self._error(403, "only from the player's page")
                body = json.loads(raw.decode("utf-8")) if raw else {}
                if not isinstance(body, dict):
                    return self._error(400, "not JSON")
                if method == "PUT" and route == "/api/make/settings":
                    if who["kind"] != "admin":
                        return self._error(403, "only the admin")
                    return self._json({"settings": maker.configure(body)})
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
                return self._error(error.status, str(error))
            except ValueError:
                return self._error(400, "not JSON")
            return self._error(404, "not found")

        def _studio(self, route: str, raw: bytes | None) -> None:
            """The studio - ComfyUI - started, stopped or set up from the player: the admin, on this computer, from
            the player's own page (``plenio.player.studio``)."""
            if launcher is None:
                return self._error(404, "no studio here")
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            # it runs a program: only from this computer itself, also when the player answers the network (--host)
            if not from_this_computer(self.client_address[0], self.remote):
                return self._error(
                    403, "Starting ComfyUI - only on the computer itself, not from the network"
                )
            if not may_admin(self.account):
                return self._error(403, "only the admin")
            try:
                if route == "/api/studio/start":
                    return self._json(launcher.start())
                if route == "/api/studio/stop":
                    return self._json(launcher.stop())
                changes = json.loads(raw.decode("utf-8")) if raw else None
                if not isinstance(changes, dict):
                    return self._error(400, "the studio's settings: root, args, port, auto, idle_stop_min")
                return self._json(launcher.configure(changes))
            except StudioLaunchError as error:
                return self._error(error.status, str(error))
            except ValueError:
                return self._error(400, "not JSON")

        def _not_from_network(self, what: str) -> bool:
            """Answer 403 to a request from the network for what only this computer does; ``True``: answered."""
            if self.here:
                return False
            self._error(403, f"{what} - only on the computer itself, not from the network")
            return True

        # --- answers ------------------------------------------------------------------------------
        def send_response(self, code: int, message: str | None = None) -> None:
            self.answered = True
            super().send_response(code, message)

        def end_headers(self) -> None:
            for name, value in SECURITY_HEADERS:
                self.send_header(name, value)
            super().end_headers()

        @property
        def takes_gzip(self) -> bool:
            return "gzip" in (self.headers.get("Accept-Encoding") or "").lower()

        def _send(
            self,
            status: int,
            body: bytes,
            kind: str,
            *,
            cache: str = "no-store",
            cookie: str = "",
            etag: str = "",
            gzipped: bytes | None = None,
        ) -> None:
            """An answer with its body - compressed when it is large and the browser takes gzip (``gzipped``: the
            body compressed already)."""
            encoded = self.takes_gzip and len(body) >= GZIP_MIN
            if encoded:
                body = gzipped if gzipped is not None else gzip.compress(body, 5)
            self.send_response(status)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", cache)
            if encoded:
                self.send_header("Content-Encoding", "gzip")
            if self.takes_gzip or encoded:
                self.send_header("Vary", "Accept-Encoding")
            if etag:
                self.send_header("ETag", etag)
            if cookie:
                self.send_header("Set-Cookie", cookie)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _json(self, data: Any, status: int = 200, cookie: str = "") -> None:
            if not self.here:
                data = without_places(data)
            body = json.dumps(data, ensure_ascii=False).encode("utf-8")
            self._send(status, body, "application/json; charset=utf-8", cookie=cookie)

        def _error(self, status: int, message: str) -> None:
            self._json({"error": REMOTE_FAILURE if status >= 500 and not self.here else message}, status)

        def _unchanged(self, etag: str) -> bool:
            """The browser has this version already (``If-None-Match``): ``304`` answered."""
            wanted = self.headers.get("If-None-Match") or ""
            if not etag or etag not in [tag.strip() for tag in wanted.split(",")]:
                return False
            self.send_response(HTTPStatus.NOT_MODIFIED)
            self.send_header("ETag", etag)
            self.end_headers()
            return True

        def _file(self, path: Path, *, cache: bool = False, download: str = "") -> None:
            if not path.is_file():
                return self._error(404, "not found")
            stat = path.stat()
            size = stat.st_size
            etag = f'"{size:x}-{stat.st_mtime_ns:x}"'
            kind = (
                TYPES.get(path.suffix.lower())
                or mimetypes.guess_type(path.name)[0]
                or "application/octet-stream"
            )
            ranged = self.headers.get("Range")
            if not ranged and not download and self._unchanged(etag):
                return None
            if not ranged and not download and path.suffix.lower() in GZIP_TYPES and self.takes_gzip:
                # the page's own files (scripts, styles): read whole, small, compressed once
                return self._send(
                    200,
                    path.read_bytes(),
                    kind,
                    cache="max-age=86400" if cache else "no-cache",
                    etag=etag,
                    gzipped=gzipped_file(path),
                )
            start, end = 0, size - 1
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", ranged.strip()) if ranged else None
            if match and (match.group(1) or match.group(2)):
                if match.group(1):
                    start = int(match.group(1))
                    end = int(match.group(2)) if match.group(2) else size - 1
                else:
                    start = max(0, size - int(match.group(2)))
                end = min(end, size - 1)
                if start > end or start >= size:
                    self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    self.send_header("Content-Range", f"bytes */{size}")
                    self.end_headers()
                    return
                self.send_response(HTTPStatus.PARTIAL_CONTENT)
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            else:
                self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", kind)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(end - start + 1))
            self.send_header("Cache-Control", "max-age=86400" if cache else "no-cache")
            self.send_header("ETag", etag)
            if download:
                self.send_header("Content-Disposition", f"attachment; filename*=UTF-8''{quote(download)}")
            self.end_headers()
            if self.command == "HEAD":
                return
            with path.open("rb") as handle:
                handle.seek(start)
                left = end - start + 1
                try:
                    while left > 0:
                        chunk = handle.read(min(CHUNK, left))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        left -= len(chunk)
                except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
                    pass  # the browser stopped reading (a seek): normal

        # --- routes ---------------------------------------------------------------------------------
        def do_HEAD(self) -> None:  # noqa: N802 - the base class's name
            self.do_GET()

        @_guarded
        def do_GET(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            route = unquote(parsed.path)
            query = {k: v[0] for k, v in parse_qs(parsed.query).items()}
            if route == "/api/v1" or route.startswith(("/api/v1/", "/api/remote/")):
                return self._player_api("GET", route, query, None)
            if route == "/api/info":
                # who answers here (ComfyUI's launcher looks for this), where the state is kept, which ComfyUI
                return self._json(
                    {
                        "app": APP,
                        "version": __version__,
                        "folders": [str(f) for f in library.folders],
                        "state": str(state.path),
                        "retired": RETIRED_DIR,
                        "comfyui": comfyui,
                        "pid": os.getpid(),
                        "remote": not self.here,
                    }
                )
            if route == "/api/network":
                if network is None:
                    return self._error(404, "no access from the network")
                doors = network.status(self.headers.get(REMOTE_HOST_HEADER, "") if self.remote else "")
                if not self.here and not self.remote:
                    # a device that reached a --host player directly: the links are the way in - not for it
                    for key in ("url", "urls", "comfyui_url", "comfyui_urls"):
                        doors.pop(key, None)
                return self._json({**doors, "remote": not self.here})
            if route == "/api/comfyui":
                # also the one the player starts itself (Settings > The studio), on the port set there; an address of
                # its own (a loopback one: the player asks no other computer) only from this computer - from the
                # network it would let anyone knock at this computer's ports
                asked = "" if not self.here else query.get("url", "")
                found = find_comfyui(asked or comfyui, launcher.url if launcher else None)
                return self._json({"found": found})
            if route == "/api/find":
                # the song of a record file (Export Release's button in ComfyUI opens the player at it)
                found_song = library.find_record(Path(query.get("record", "")))
                if found_song is not None:
                    return self._json({"id": found_song.id})
                return self._error(404, "no such song")
            if route == "/api/library":
                if not library.ready:
                    # the first reading of the folders (thousands of records after an update take a while): a moment,
                    # then the page hears how far it is and asks again
                    library.scan(wait=False)
                    if not library.wait_ready(LIBRARY_WAIT_S):
                        return self._json(
                            {
                                "songs": [],
                                "scanning": dict(library.progress),
                                "folders": [str(f) for f in library.folders],
                                "errors": [],
                                "version": __version__,
                            }
                        )
                etag, body, packed = library_answer(not self.here)
                if self._unchanged(etag):
                    return None
                return self._send(
                    200, body, "application/json; charset=utf-8", cache="no-cache", etag=etag, gzipped=packed
                )
            if route == "/api/stars":
                # the measured stars of every song known now, for the library's filter (owner's request 2026-10-30)
                return self._json({"stars": measured.stars(library), "measuring": dict(measured.progress)})
            if route.startswith("/api/quality/"):
                # how well it came out, measured (owner's request 2026-10-29): the record's, else measured now
                song = library.song(route.removeprefix("/api/quality/"))
                if song is None:
                    return self._error(404, "no such song")
                return self._json({"quality": measured.of(song)})
            if route.startswith("/api/song/"):
                song = library.song(route.removeprefix("/api/song/"))
                if song is None:
                    return self._error(404, "no such song")
                try:
                    return self._json(song_detail(song, cache=state.path.parent / "cache"))
                except (OSError, ValueError) as error:
                    return self._error(500, str(error))
            if route == "/api/session":
                return self._session()
            if route == "/api/studio":
                if launcher is None:
                    return self._error(404, "no studio here")
                local_admin = from_this_computer(self.client_address[0], self.remote) and may_admin(
                    self.account
                )
                return self._json(launcher.status(admin=local_admin))
            if route == "/api/make" or route.startswith("/api/make/"):
                return self._make("GET", route, query, None)
            if route == "/api/users":
                if accounts is None:
                    return self._error(404, "no login")
                return self._json({"users": accounts.users(details=may_admin(self.account))})
            if route == "/api/invites":
                return self._invites("GET", route, None)
            avatar = re.fullmatch(r"/api/users/([0-9a-f]{12}|admin)/avatar", route)
            if avatar:
                path = accounts.avatar(avatar.group(1)) if accounts else None
                return self._file(path) if path else self._error(404, "no picture")
            if route in ("/api/state", "/api/state/rev"):
                mine = state_of(self.account)
                if mine is None:
                    return self._json({"error": "a guest keeps the state in the browser", "guest": True}, 401)
                if route == "/api/state/rev":
                    return self._json({"rev": mine.rev})
                return self._json({**mine.read(), "rev": mine.rev})
            if route == "/api/guests":
                return self._json(guests.status()) if guests else self._error(404, "no guests' access")
            if route == "/api/reactions":
                # the guests' reactions per song, kept for good (apart from the favourites)
                return self._json({"songs": guests.tallies() if guests else {}})
            if route == "/api/guests/wishes":
                if not may_admin(self.account):
                    return self._error(403, "the guests' wishes are for the host's page")
                if guests is None:
                    return self._error(404, "no guests' access")
                try:
                    after = int(query.get("after", "0"))
                except ValueError:
                    after = 0
                try:
                    reacted: int | None = int(query["reacted"]) if "reacted" in query else None
                except ValueError:
                    reacted = None
                return self._json(guests.take(after, reacted))
            if route == "/api/folders":
                return self._json(folders_answer())
            if route == "/api/packages":
                directory = state.path.parent
                return self._json(
                    {"folder": str(packages_dir(directory)), "files": package_listing(directory)}
                )
            if route == "/api/package-jobs":
                # the shared players being made, waiting and made since the player started (the queue)
                return self._json({"jobs": packages.listing()})
            job = re.fullmatch(r"/api/package/([0-9a-f]{16})", route)
            if job:
                status = packages.status(job.group(1))
                return self._json(status) if status else self._error(404, "no such package")
            if route.startswith("/packages/"):
                made = package_file(state.path.parent, route.removeprefix("/packages/"))
                if made is None:
                    return self._error(404, "no such package")
                return self._file(made, download=made.name if query.get("download") else "")
            if route == "/api/videos":
                return self._json({"folder": str(jobs.folder), "files": jobs.listing()})
            if route.startswith("/videos/"):
                video = jobs.file(route.removeprefix("/videos/"))
                if video is None:
                    return self._error(404, "no such video")
                return self._file(video, download=video.name if query.get("download") else "")
            if route == "/api/new":
                # Live Play: the songs that appeared since the last answer's "now" (the folders read again,
                # at most every two seconds); without "since" just the "now" to start from
                library.scan(every=NEW_SONGS_EVERY)
                try:
                    since = float(query.get("since", ""))
                except ValueError:
                    since = None
                songs = library.newer(since) if since is not None else []
                return self._json({"now": library.scan_started, "songs": songs})
            if route == "/api/dirs":
                # the folder browser of the Settings page: only for the player's own page (another page
                # cannot send this header without asking first, and this server never says yes)
                if self.headers.get("X-Plenio-Player") != "1":
                    return self._error(403, "only from the player's page")
                if self._not_from_network("This computer's folders"):
                    return None
                return self._json(folder_choice.list_dirs(query.get("path")))
            if route == "/api/visuals":
                # the listener's own Plenio Drop presets (the page reads them again every few seconds)
                folder = visuals_dir(state.path.parent)
                return self._json({"folder": str(folder), "files": list_presets(folder)})
            if route.startswith("/api/analysis/"):
                # the song's analysis track for the visuals (analysis.py): computed once, kept in the cache
                song = library.song(route.removeprefix("/api/analysis/"))
                audio = song.files.get("audio") if song else None
                if song is None or audio is None:
                    return self._error(404, "no such song")
                found = analysis_track(
                    audio, state.path.parent / "cache" / "analysis", None if song.other else song.record
                )
                return self._json(found) if found else self._error(404, "no analysis")
            if route.startswith("/api/peaks/"):
                song = library.song(route.removeprefix("/api/peaks/"))
                audio = song.files.get("audio") if song else None
                levels = peaks(audio, cache or state.path.parent / "peaks") if audio else None
                return self._json({"peaks": levels}) if levels else self._error(404, "no waveform")
            if route.startswith("/page/"):
                # the song's page (song_page.py), for any song of the library - also one exported before it
                song = library.song(route.removeprefix("/page/"))
                if song is None or song.other:
                    return self._error(404, "no such song")
                detail = song_detail(song)
                record = json.loads(song.record.read_text(encoding="utf-8"))
                own = song.id
                # the viewer's own stars (a guest keeps theirs in the browser); the page beside the song has the admin's
                mine = state_of(self.account)
                page = render_song_page(
                    detail,
                    record,
                    lambda kind, _name: f"/media/{own}/{kind}",
                    in_player=True,
                    rating=ratings_of(mine.read().get("ratings")).get(own) if mine is not None else None,
                    quality=measured.of(song),
                )
                return self._send(200, page.encode("utf-8"), "text/html; charset=utf-8", cache="no-cache")
            if route.startswith("/media/"):
                parts = route.split("/")
                if len(parts) != 4 or parts[3] not in MEDIA_KINDS:
                    return self._error(404, "not found")
                song = library.song(parts[2])
                path = song.files.get(parts[3]) if song else None
                if (
                    song
                    and not path
                    and song.other
                    and parts[3] == "cover"
                    and song.summary["has"].get("cover")
                ):
                    # the picture inside the audio file, saved once into the cache
                    path = other_music.embedded_cover(song.record, song.id, state.path.parent / "cache")
                if path and parts[3] == "cover" and query.get("size", "").isdigit():
                    # a card's small picture: a cover of 1024 px is 150-300 KB, a page of cards 25 MB to a phone
                    size = int(query["size"])
                    small = (
                        thumbnail(path, size, state.path.parent / "cache" / "thumbs")
                        if size in THUMB_SIZES
                        else None
                    )
                    return self._file(small or path, cache=True)
                return self._file(path) if path else self._error(404, "no such file")
            # the page itself and its assets; every other path is the page (the player routes by #)
            target = (
                (static / route.lstrip("/")).resolve() if route not in ("", "/") else static / "index.html"
            )
            if static.resolve() not in target.parents and target != static / "index.html":
                return self._error(404, "not found")
            if not target.is_file():
                target = static / "index.html"
            return self._file(target, cache="/assets/" in route)

        # --- Player API v1 (player_api.py, remote.py) -------------------------------------------------------------
        def _api_error(self, status: int, code: str, message: str, hint: str = "") -> None:
            self._json(player_api.error(code, message, hint), status)

        def _player_api(self, method: str, route: str, query: dict[str, str], raw: bytes | None) -> None:
            """``/api/v1/...`` (the Player API) and ``/api/remote/...`` (the page that plays reports and asks for
            commands). This computer passes; from the network a login of the player (its session cookie)."""
            account = self.account
            if account is None:
                return self._api_error(
                    401, "unauthorized", "The player asks devices in the network to log in.",
                    "Log in to the player in this browser, or send its session cookie.",
                )  # fmt: skip
            owner = str(account.get("id"))
            body: Any = None
            if method == "POST":
                if not self._from_this_page():
                    return self._api_error(
                        400, "bad_request", "Send JSON (Content-Type: application/json).",
                        "A page of another site cannot send JSON here without asking first.",
                    )  # fmt: skip
                try:
                    body = json.loads(raw.decode("utf-8")) if raw else {}
                except (ValueError, UnicodeDecodeError):
                    return self._api_error(400, "bad_request", "The body is not JSON.")
            key = (method, route.removeprefix(player_api.BASE).rstrip("/"))
            try:
                if route.startswith("/api/remote/"):
                    return self._remote_page(method, route, query, body, owner)
                if key == ("GET", ""):
                    return self._json(player_api.index())
                if key == ("GET", "/openapi.json"):
                    return self._json(player_api.openapi())
                if key == ("GET", "/now"):
                    return self._json(player_api.now_answer(hub.now(owner), self._summary_of))
                if key == ("POST", "/transport"):
                    return self._json({"sent": hub.send(owner, check_transport(body))}, 202)
                if key == ("GET", "/songs"):
                    return self._api_songs(query, account)
                if key == ("POST", "/queue"):
                    command = check_queue(body, lambda song: library.song(song) is not None)
                    return self._json({"sent": hub.send(owner, command)}, 202)
                if key == ("GET", "/live"):
                    return self._json(player_api.live_answer(hub.now(owner)))
                if key == ("POST", "/live"):
                    return self._json({"sent": hub.send(owner, check_live(body))}, 202)
                if key == ("GET", "/events"):
                    return self._api_events(owner)
            except RemoteError as refused:
                return self._api_error(refused.status, refused.code, str(refused), refused.hint)
            return self._api_error(
                404, "not_found", f"No {method} {route} in the Player API.", "See /api/v1."
            )

        def _inside_folders(self, path: Path) -> set[str]:
            """A record's places relative to each song folder (and its parent: ComfyUI's output folder holds them)."""
            out = set()
            for root in library.folders:
                for base in (root, root.parent):
                    try:
                        out.add(path.relative_to(base).as_posix())
                    except ValueError:
                        pass
            return out

        def _summary_of(self, song_id: str) -> dict[str, Any] | None:
            song = library.song(song_id)
            return dict(song.summary) if song is not None else None

        def _api_songs(self, query: dict[str, str], account: dict[str, Any]) -> None:
            try:
                limit = max(1, min(player_api.SONGS_LIMIT, int(query.get("limit", "50"))))
            except ValueError:
                return self._api_error(400, "invalid_value", "'limit' is a number from 1 to 500.")
            words = query.get("q", "")
            mine = state_of(account)
            wants_measured = "measured:" in words or "auto:" in words
            context = SearchContext.of_state(
                mine.read() if mine is not None else {}, measured.stars(library) if wants_measured else None
            )
            songs: list[Any] = library.songs()
            record = query.get("record", "").replace("\\", "/").strip("/")
            if record:  # the record at this place inside a song folder (a Song API song id carries it)
                songs = [dict(s.summary) for s in library.every() if record in self._inside_folders(s.record)]
            found = search_songs(songs, words, context)
            return self._json(
                {"songs": [player_api.song_view(s) for s in found[:limit]], "total": len(found)}
            )

        def _api_events(self, owner: str) -> None:
            """Server-Sent Events: a ``now`` first, then ``now``, ``queue``, ``live``, ``reaction`` as they come;
            ids ``<start>-<n>`` (a ``Last-Event-ID`` of another start of the player gets only what is new)."""
            if self.command == "HEAD":
                return self._api_error(405, "bad_request", "GET the event stream.")
            hub.open_stream(owner)
            try:
                last = self.headers.get("Last-Event-ID") or ""
                boot, _, number = last.partition("-")
                after = int(number) if boot == BOOT and number.isdigit() else hub.last_event()
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                self.send_header("Cache-Control", "no-cache")
                self.end_headers()
                self.close_connection = True
                first = player_api.now_answer(hub.now(owner), self._summary_of)
                self.wfile.write(self._event(f"{BOOT}-{after}", "now", first))
                self.wfile.flush()
                while True:
                    found = hub.events(owner, after, EVENTS_WAIT_S)
                    if not found:
                        self.wfile.write(b": still here\n\n")
                    for event in found:
                        after = event.id
                        data: Any = event.data
                        if event.kind == "now":
                            data = player_api.now_answer(hub.now(owner), self._summary_of)
                        self.wfile.write(self._event(f"{BOOT}-{event.id}", event.kind, data))
                    self.wfile.flush()
            except OSError:  # the client went away
                return None
            finally:
                hub.close_stream(owner)

        def _event(self, event_id: str, kind: str, data: Any) -> bytes:
            text = json.dumps(without_places(data) if not self.here else data, ensure_ascii=False)
            return f"id: {event_id}\nevent: {kind}\ndata: {text}\n\n".encode()

        def _remote_page(self, method: str, route: str, query: dict[str, str], body: Any, owner: str) -> None:
            """The page's side: ``POST /api/remote/now`` (its state), ``GET /api/remote/commands?page=&after=&wait=``
            (a long poll for commands), ``POST /api/remote/leave`` (the page closes)."""
            if method == "POST" and route == "/api/remote/now":
                if not isinstance(body, dict) or not isinstance(body.get("page"), str):
                    return self._api_error(400, "bad_request", "The page's state, with its 'page' id.")
                hub.report(body["page"], owner, body)
                return self._json({"ok": True})
            if method == "POST" and route == "/api/remote/leave":
                if isinstance(body, dict) and isinstance(body.get("page"), str):
                    hub.leave(body["page"], owner)
                return self._json({"ok": True})
            if method == "GET" and route == "/api/remote/commands":
                try:
                    after = int(query.get("after", "0"))
                    wait = max(0.0, min(30.0, float(query.get("wait", "25"))))
                except ValueError:
                    return self._api_error(400, "invalid_value", "'after' and 'wait' are numbers.")
                return self._json({"commands": hub.commands(query.get("page", ""), owner, after, wait)})
            return self._api_error(404, "not_found", f"No {method} {route}.")

        def _from_this_page(self) -> bool:
            """A request that changes something must come from the player's own page: JSON (another site's
            page cannot send that without asking first, and this server never says yes) and, when the
            browser names the page's origin, this one."""
            if not (self.headers.get("Content-Type") or "").startswith("application/json"):
                return False
            origin = self.headers.get("Origin")
            host = self.headers.get("Host") or ""
            return origin is None or origin in (f"http://{host}", f"https://{host}")

        def _binary_from_this_page(self) -> bool:
            """A binary upload from the player's own page: a header another site's page cannot send without
            asking first (and this server never says yes), and - when the browser names it - this origin."""
            origin = self.headers.get("Origin")
            host = self.headers.get("Host") or ""
            return self.headers.get("X-Plenio-Player") == "1" and (
                origin is None or origin in (f"http://{host}", f"https://{host}")
            )

        def _length(self) -> int:
            """The body's length as the request says it (``-1``: not a length - the connection closes)."""
            try:
                length = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                length = -1
            if length < 0:
                self.close_connection = True
            return length

        def _upload(self, limit: int) -> bytes | None:
            """A large body (a recording), read whole; ``None`` when it is larger than ``limit``."""
            length = self._length()
            if length > limit or length < 0:
                self.close_connection = True
                return None
            return self.rfile.read(length) if length > 0 else b""

        def _body(self) -> bytes | None:
            """The request's body, read before any answer (an answer with the body unread makes Windows
            reset the connection); ``None`` when there is none or it is too large (the connection closes)."""
            length = self._length()
            if length > STATE_LIMIT or length < 0:
                self.close_connection = True
                return None
            return self.rfile.read(length) if length > 0 else None

        @_guarded
        def do_PUT(self) -> None:  # noqa: N802
            body = self._body()
            route = unquote(urlparse(self.path).path)
            if route.startswith("/api/users/"):
                return self._put_user(route, body)
            if route.startswith("/api/make/"):
                return self._make("PUT", route, {}, body)
            if route == "/api/studio":
                return self._studio(route, body)
            if route not in ("/api/state", "/api/folders", "/api/guests", "/api/network"):
                return self._error(404, "not found")
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            if route == "/api/folders":
                if self._not_from_network("Choosing the folders"):
                    return None
                return self._put_folders(body)
            if route == "/api/network":
                if self._not_from_network("Switching the access from the network"):
                    return None
                try:
                    changes = json.loads(body.decode("utf-8")) if body else None
                except ValueError:
                    changes = None
                if network is None or not isinstance(changes, dict):
                    return self._error(400 if network else 404, "the access from the network: on, regenerate")
                return self._json(network.configure(changes))
            if route == "/api/guests":
                # the party's way in is the host's (or a co-host's) to change - the grid of People & access says so
                if not may_admin(self.account):
                    return self._error(403, "only the host changes the guests' access")
                try:
                    changes = json.loads(body.decode("utf-8")) if body else None
                except ValueError:
                    changes = None
                if guests is None or not isinstance(changes, dict):
                    return self._error(
                        400 if guests else 404,
                        "the guests' access: on, mode, show, reactions, reactions_per_song, regenerate",
                    )
                return self._json(guests.configure(changes))
            if body is None:
                return self._error(413, "no state, or too large")
            try:
                data = json.loads(body.decode("utf-8"))
            except ValueError:
                return self._error(400, "not JSON")
            if not isinstance(data, dict):
                return self._error(400, "the state is an object")
            mine = state_of(self.account)
            if mine is None:
                return self._json({"error": "a guest keeps the state in the browser", "guest": True}, 401)
            base = data.get("rev")
            before = ratings_of(mine.read().get("ratings")) if mine is state else {}
            data["ratings"] = ratings_of(data.get("ratings"))
            saved = mine.write(
                {**EMPTY_STATE, **{k: v for k, v in data.items() if k in EMPTY_STATE}},
                base if isinstance(base, int) and not isinstance(base, bool) else None,
            )
            if saved is not None and mine is state:
                # the admin's stars go into the songs' own pages beside them (only the ones that changed)
                after = data["ratings"]
                changed = {k: after.get(k) for k in set(before) | set(after) if before.get(k) != after.get(k)}
                if changed:
                    measured.write_pages(library, changed)
            if saved is None:
                # another page saved since: this one merges the two and saves again
                return self._json(
                    {"error": "saved elsewhere since", "rev": mine.rev, "state": mine.read()}, 409
                )
            return self._json({"ok": True, "rev": saved})

        # --- the login (plenio.player.accounts) ---------------------------------------------------------

        def _session(self) -> None:
            """Who is logged in here, and who could log in: the login page asks first."""
            if accounts is None:
                return self._json(
                    {"login": False, "user": None, "chosen": True, "local": self.here, "users": []}
                )
            chosen = accounts.session(self.token)
            if chosen is not None and chosen.get("admin") and not self.here:
                chosen = None
            return self._json(
                {
                    "login": True,
                    "user": chosen or self.account,
                    "chosen": chosen is not None,
                    "local": self.here,
                    "users": accounts.users(),
                    "admin": accounts.admin() if self.here else None,
                }
            )

        def _login(self, raw: bytes | None) -> None:
            if accounts is None:
                return self._error(404, "no login")
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            try:
                body = json.loads(raw.decode("utf-8")) if raw else None
            except ValueError:
                body = None
            if not isinstance(body, dict):
                return self._error(400, "who logs in")
            where = self._peer()
            try:
                if body.get("admin"):
                    if self._not_from_network("The admin logs in"):
                        return None
                    token, user = accounts.login_admin()
                else:
                    token, user = accounts.login(
                        str(body.get("user") or ""), str(body.get("password") or ""), where
                    )
            except account_rules.AccountError as error:
                return self._error(error.status, str(error))
            if self.token:
                accounts.logout(self.token)
            return self._json({"user": user}, cookie=account_rules.session_cookie(token))

        def _peer(self) -> str:
            """The address wrong passwords and codes are counted by: the device's own (the gateway says it), never a
            header the browser chose."""
            if self.remote:
                peers = self.headers.get_all(REMOTE_PEER_HEADER) or ["network"]
                return "net:" + peers[-1].strip()  # the gateway's own comes last
            return str(self.client_address[0])

        def _invites(self, method: str, route: str, raw: bytes | None) -> None:
            """Invitations (People & access): the admin (or a helper) invites someone by name and role and gets a
            one-time code for a QR code (``GET``/``POST /api/invites``, ``DELETE /api/invites/<id>``); the invited
            device asks whom a code invites (``POST /api/invites/check``) and sets a password or a PIN with it
            (``POST /api/invites/accept``) - then it is logged in."""
            if accounts is None:
                return self._error(404, "no login")
            if method != "GET" and not self._from_this_page():
                return self._error(403, "only from the player's page")
            try:
                body = json.loads(raw.decode("utf-8")) if raw else {}
            except (ValueError, UnicodeDecodeError):
                body = None
            if not isinstance(body, dict):
                return self._error(400, "JSON, please")
            where = self._peer()
            try:
                if method == "POST" and route == "/api/invites/check":
                    found = accounts.invitation(str(body.get("code") or ""))
                    if found is None:
                        return self._error(410, "This invitation is used up or too old - ask for a new one.")
                    return self._json({"invite": found})
                if method == "POST" and route == "/api/invites/accept":
                    token, user = accounts.accept(str(body.get("code") or ""), body.get("password"), where)
                    if self.token:
                        accounts.logout(self.token)
                    return self._json({"user": user}, cookie=account_rules.session_cookie(token))
                if not may_admin(self.account):
                    return self._error(403, "only the admin invites people")
                if method == "GET" and route == "/api/invites":
                    return self._json({"invites": accounts.invitations()})
                if method == "POST" and route == "/api/invites":
                    code, invite = accounts.invite(body.get("name"), body.get("group"))
                    return self._json({"code": code, "invite": invite, "path": f"/#/join/{code}"})
                gone = re.fullmatch(r"/api/invites/([0-9a-f]{16})", route)
                if method == "DELETE" and gone:
                    accounts.withdraw(gone.group(1))
                    return self._json({"ok": True})
            except account_rules.AccountError as error:
                return self._error(error.status, str(error))
            return self._error(404, "not found")

        def _logout(self) -> None:
            if accounts is not None:
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                if self.token:
                    accounts.logout(self.token)
            return self._json({"ok": True}, cookie=account_rules.session_cookie("", forget=True))

        def _may_change(self, user_id: str) -> bool:
            """The admin (and a helper) changes every user; a user only themselves."""
            me = self.account or {}
            return may_admin(me) or (me.get("id") == user_id and user_id != account_rules.ADMIN)

        def _put_user(self, route: str, raw: bytes | None) -> None:
            if accounts is None:
                return self._error(404, "no login")
            picture = re.fullmatch(r"/api/users/([0-9a-f]{12}|admin)/avatar", route)
            target = picture.group(1) if picture else route.removeprefix("/api/users/")
            if not self._may_change(target):
                return self._error(403, "only the admin, or the user themselves")
            try:
                if picture:
                    if not self._binary_from_this_page():
                        return self._error(403, "only from the player's page")
                    return self._json({"user": accounts.set_avatar(target, raw or None)})
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                body = json.loads(raw.decode("utf-8")) if raw else None
                if not isinstance(body, dict):
                    return self._error(400, "name, password or colour")
                changes = {k: body[k] for k in ("name", "password", "color", "group") if k in body}
                if "group" in changes and not may_admin(self.account):
                    return self._error(403, "only the admin sets a user's group")
                if "password" in changes and self.token:
                    changes["keep_session"] = account_rules.session_key(self.token)
                return self._json({"user": accounts.update(target, changes)})
            except ValueError as error:
                status = error.status if isinstance(error, account_rules.AccountError) else 400
                return self._error(status, str(error))

        @_guarded
        def do_DELETE(self) -> None:  # noqa: N802
            raw = self._body()
            route = unquote(urlparse(self.path).path)
            if route.startswith("/api/make/"):
                return self._make("DELETE", route, {}, raw)
            if route.startswith("/api/invites/"):
                return self._invites("DELETE", route, raw)
            picture = re.fullmatch(r"/api/users/([0-9a-f]{12}|admin)/avatar", route)
            gone = re.fullmatch(r"/api/users/([0-9a-f]{12})", route)
            if accounts is None or not (picture or gone):
                return self._error(404, "not found")
            if not self._binary_from_this_page() and not self._from_this_page():
                return self._error(403, "only from the player's page")
            try:
                if picture:
                    if not self._may_change(picture.group(1)):
                        return self._error(403, "only the admin, or the user themselves")
                    return self._json({"user": accounts.set_avatar(picture.group(1), None)})
                assert gone is not None
                if not may_admin(self.account):
                    return self._error(403, "only the admin")
                accounts.delete(gone.group(1))
                with states_lock:
                    user_states.pop(gone.group(1), None)
                return self._json({"ok": True})
            except account_rules.AccountError as error:
                return self._error(error.status, str(error))

        def _put_folders(self, body: bytes | None) -> None:
            """The folders chosen in Settings (``{"folders": [{"path", "other"}]}``), or back to the folders
            the player started with (``{"reset": true}``)."""
            try:
                data = json.loads(body.decode("utf-8")) if body else None
            except ValueError:
                data = None
            if not isinstance(data, dict):
                return self._error(400, "not JSON")
            directory = state.path.parent
            if data.get("reset"):
                folder_choice.forget(directory)
                library.set_folders(library.started_with)
                return self._json(folders_answer())
            try:
                chosen = folder_choice.validate(data.get("folders"))
            except ValueError as error:
                return self._error(400, str(error))
            folder_choice.save(directory, chosen)
            library.set_folders([f.path for f in chosen], [f.path for f in chosen if f.other])
            return self._json(folders_answer())

        def _package(self, route: str, raw: bytes | None) -> None:
            """A portable player of chosen songs (one HTML file: plenio.player.package) put in the queue, one
            stopped, the finished ones forgotten, or the folder shown."""
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            stop = re.fullmatch(r"/api/package/([0-9a-f]{16})/cancel", route)
            if stop:
                return (
                    self._json({"ok": True})
                    if packages.cancel(stop.group(1))
                    else self._error(404, "no such package")
                )
            if route == "/api/package-jobs/clear":
                packages.clear()
                return self._json({"jobs": packages.listing()})
            if route == "/api/packages/open":
                if self._not_from_network("Opening a folder on this computer's screen"):
                    return None
                try:
                    return self._json(show_folder(packages_dir(state.path.parent)))
                except OSError as error:
                    return self._error(500, f"could not show the folder: {error}")
            try:
                body = json.loads(raw.decode("utf-8")) if raw else None
            except ValueError:
                body = None
            if not isinstance(body, dict) or not isinstance(body.get("songs"), list) or not body["songs"]:
                return self._error(400, "the songs to pack")
            ids = [str(i) for i in body["songs"]][:MAX_SONGS]
            if int(body.get("bitrate") or 192) not in (128, 160, 192):
                return self._error(400, "MP3 at 128, 160 or 192 kbit/s")
            job = packages.start(library, ids, body, state.path.parent)
            return self._json({"job": job})

        def _video(self, route: str, raw: bytes | None) -> None:
            """A song made into a video: start (the song, the part, the size), the H.264 stream in pieces,
            finish (the MP4 put together with the song's sound), cancel; and the videos folder shown."""
            data_route = re.fullmatch(r"/api/video/([0-9a-f]{16})/data", route)
            if data_route:
                if not self._binary_from_this_page():
                    return self._error(403, "only from the player's page")
                if raw is None:
                    return self._error(413, "no data, or too large")
                try:
                    return self._json({"bytes": jobs.append(data_route.group(1), raw)})
                except KeyError:
                    return self._error(404, "no such video")
                except (OSError, ValueError) as error:
                    return self._error(400, str(error))
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            try:
                body = json.loads(raw.decode("utf-8")) if raw else {}
            except ValueError:
                return self._error(400, "not JSON")
            if not isinstance(body, dict):
                return self._error(400, "not JSON")
            if route == "/api/videos/open":
                if self._not_from_network("Opening a folder on this computer's screen"):
                    return None
                try:
                    return self._json(show_folder(jobs.folder))
                except OSError as error:
                    return self._error(500, f"could not show the folder: {error}")
            if route == "/api/video":
                song = library.song(str(body.get("song", "")))
                if song is None:
                    return self._error(404, "no such song")
                audio = song.files.get("original") if body.get("take") == "original" else None
                audio = audio or song.files.get("audio")
                if audio is None:
                    return self._error(400, "the song has no audio")
                try:
                    fps, width, height = int(body["fps"]), int(body["width"]), int(body["height"])
                    start, length = float(body.get("start") or 0.0), float(body["length"])
                except (KeyError, TypeError, ValueError):
                    return self._error(400, "fps, width, height, start and length")
                if fps not in VIDEO_FPS or not (
                    16 <= width <= VIDEO_MAX_SIDE and 16 <= height <= VIDEO_MAX_SIDE
                ):
                    return self._error(400, f"a frame rate of {VIDEO_FPS} and a size up to {VIDEO_MAX_SIDE}")
                if start < 0 or not 0 < length <= 4 * 3600:
                    return self._error(400, "a part of the song")
                sound = body.get("audio", AUDIO_BITRATE // 1000)
                if sound not in VIDEO_AUDIO_KBITS:
                    return self._error(400, f"the sound at {VIDEO_AUDIO_KBITS} kbit/s")
                job = jobs.start(
                    {
                        "song": song.id,
                        "title": song.summary.get("title") or "song",
                        "audio": str(audio),
                        "fps": fps,
                        "width": width,
                        "height": height,
                        "start": start,
                        "length": length,
                        "audio_bitrate": int(sound) * 1000,
                    }
                )
                return self._json({"job": job})
            action = re.fullmatch(r"/api/video/([0-9a-f]{16})/(finish|cancel)", route)
            if not action:
                return self._error(404, "not found")
            try:
                if action.group(2) == "cancel":
                    jobs.cancel(action.group(1))
                    return self._json({"ok": True})
                made = jobs.finish(action.group(1), int(body.get("frames") or 0))
            except KeyError:
                return self._error(404, "no such video")
            except Exception as error:  # noqa: BLE001 - PyAV's errors are many; the page shows the reason
                return self._error(500, f"could not make the video: {error}")
            return self._json({"file": made.name, "size": made.stat().st_size, "folder": str(jobs.folder)})

        @_guarded
        def do_POST(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            route = unquote(parsed.path)
            if route == "/api/make/sources":
                # a recording for a cover: larger than the state's limit
                upload = self._upload(maker_rules.SOURCE_LIMIT)
                if upload is None:
                    return self._error(413, f"a recording of at most {maker_rules.SOURCE_LIMIT // 2**20} MB")
                return self._make("POST", route, {k: v[0] for k, v in parse_qs(parsed.query).items()}, upload)
            raw = self._body()
            if route == "/api/v1" or route.startswith(("/api/v1/", "/api/remote/")):
                return self._player_api("POST", route, {}, raw)
            if route.startswith("/api/make/"):
                return self._make("POST", route, {}, raw)
            if route in ("/api/studio/start", "/api/studio/stop"):
                return self._studio(route, raw)
            if route == "/api/rescan":
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                library.scan(force=True)
                return self._json({"songs": len(library.songs())})
            if route == "/api/login":
                return self._login(raw)
            if route.startswith("/api/invites"):
                return self._invites("POST", route, raw)
            if route == "/api/logout":
                return self._logout()
            if route == "/api/users":
                if accounts is None:
                    return self._error(404, "no login")
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                if not may_admin(self.account):
                    return self._error(403, "only the admin sets up users")
                try:
                    body = json.loads(raw.decode("utf-8")) if raw else None
                    if not isinstance(body, dict):
                        return self._error(400, "name and password")
                    return self._json(
                        {
                            "user": accounts.create(
                                body.get("name"),
                                body.get("password"),
                                body.get("group", account_rules.DEFAULT_GROUP),
                            )
                        }
                    )
                except ValueError as error:
                    status = error.status if isinstance(error, account_rules.AccountError) else 400
                    return self._error(status, str(error))
            if route == "/api/guests/live":
                # what the page shows, for the guests: from the host's page only (another user's queue is their own)
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                if not may_admin(self.account):
                    return self._error(403, "only the host's page shows the guests the live playlist")
                try:
                    shown = json.loads(raw.decode("utf-8")) if raw else None
                except ValueError:
                    shown = None
                if guests is None or not isinstance(shown, dict):
                    return self._error(400 if guests else 404, "the live playlist as the page shows it")
                guests.publish(shown)
                return self._json({"ok": True})
            if route in ("/api/package", "/api/packages/open", "/api/package-jobs/clear") or re.fullmatch(
                r"/api/package/[0-9a-f]{16}/cancel", route
            ):
                return self._package(route, raw)
            if route == "/api/video" or route.startswith("/api/video/") or route == "/api/videos/open":
                return self._video(route, raw)
            if route in ("/api/visuals/copy", "/api/visuals/open"):
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                folder = visuals_dir(state.path.parent)
                if route == "/api/visuals/open":
                    if self._not_from_network("Opening a folder on this computer's screen"):
                        return None
                    try:
                        return self._json(show_folder(prepare_folder(folder)))
                    except OSError as error:
                        return self._error(500, str(error))
                try:
                    body = json.loads(raw.decode("utf-8")) if raw else None
                except ValueError:
                    body = None
                if not isinstance(body, dict) or not isinstance(body.get("text"), str):
                    return self._error(400, "name and text of the preset")
                try:
                    json.loads(body["text"])
                    saved = save_copy(folder, str(body.get("name") or "preset"), body["text"])
                except ValueError as error:
                    return self._error(400, f"not a preset: {error}")
                except OSError as error:
                    return self._error(500, str(error))
                return self._json({"file": saved.name, "folder": str(folder)})
            if route == "/api/quit":
                # Stop the player (its Settings page): a player started from ComfyUI has no window to close
                if not self._from_this_page():
                    return self._error(403, "only from the player's page")
                if self._not_from_network("Stopping the player"):
                    return None
                self._json({"ok": True})
                threading.Thread(target=self.server.shutdown, daemon=True).start()
                return None
            match = re.fullmatch(r"/api/song/([0-9a-f]+)/remove", route)
            if not match:
                return self._error(404, "not found")
            # retire or delete a song: from the player's page only, naming the song twice (in the address and
            # in the body), so that no stray request removes one
            if not self._from_this_page():
                return self._error(403, "only from the player's page")
            try:
                body = json.loads(raw.decode("utf-8")) if raw else None
            except ValueError:
                body = None
            if not isinstance(body, dict) or body.get("confirm") != match.group(1):
                return self._error(400, "confirm the song's id")
            if body.get("action") not in ("retire", "delete"):
                return self._error(400, "action: retire or delete")
            # the library is the admin's: a listener, a maker or a guest keeps their own playlists, not the songs
            if not may_admin(self.account):
                return self._error(403, "only the admin removes songs from the library")
            if body["action"] == "delete" and self._not_from_network("Deleting a song for good (retire it)"):
                return None
            try:
                result = library.remove(match.group(1), str(body["action"]))
            except OSError as error:
                return self._error(500, f"could not remove every file: {error}")
            return self._json(result) if result else self._error(404, "no such song")

    return Handler


LOOPBACK = {"127.0.0.1", "localhost", "::1"}


def serve(
    library: Library,
    state: State,
    host: str = "127.0.0.1",
    port: int = 8765,
    comfyui: str = "",
    guests: GuestHub | None = None,
    network: NetworkAccess | None = None,
    accounts: account_rules.Accounts | None = None,
    maker: maker_rules.PartySongs | None = None,
    launcher: StudioLauncher | None = None,
) -> ThreadingHTTPServer:
    """The player's server; on the loopback address only for requests addressed to it. ``comfyui``: the
    ComfyUI that started it (where *Open in ComfyUI* goes); ``guests``: the guests' access; ``network``: the
    player and ComfyUI from the network; ``accounts``: the login; ``maker``: the party songs."""

    remote = PlayerRemote()
    if (
        guests is not None
    ):  # the guests' reactions are events of the Player API (the live playlist is the admin's)
        guests.on_reaction = lambda entry: remote.reaction(entry, account_rules.ADMIN)

    class Server(ThreadingHTTPServer):
        daemon_threads = True
        # On Windows SO_REUSEADDR lets a second player bind the same port, and the first one keeps
        # answering - a player started again would serve its old page. There the bind must fail instead.
        allow_reuse_address = os.name != "nt"

        def server_bind(self) -> None:
            super().server_bind()
            if host in LOOPBACK:
                bound = self.server_address[1]
                names = ("127.0.0.1", "localhost", "[::1]")
                # the port is known only now
                self.RequestHandlerClass = make_handler(
                    library,
                    state,
                    cache=state.path.parent / "peaks",
                    hosts=frozenset(f"{name}:{bound}" for name in names),
                    comfyui=comfyui,
                    guests=guests,
                    network=network,
                    accounts=accounts,
                    maker=maker,
                    launcher=launcher,
                    remote=remote,
                )

    return Server(
        (host, port),
        make_handler(
            library,
            state,
            cache=state.path.parent / "peaks",
            comfyui=comfyui,
            guests=guests,
            network=network,
            accounts=accounts,
            maker=maker,
            launcher=launcher,
            remote=remote,
        ),
    )
