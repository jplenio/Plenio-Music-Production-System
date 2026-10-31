"""Party songs: songs made from the player (owner's request 2026-10-25; docs/design/party-songs.md §3).

Guests and users - as the admin allows in the settings - fill a simple form (a style template, a description,
genre, mood, tempo, length, vocals, language, voice, theme, key, meter; for a cover the original recording) and the
song is made by YuE2 in the ComfyUI on this computer, through Plenio's Song API (``/plenio/api/v1``). Every song is
made with *HQ mastering* off and *Cover Art* on, in ``plenio/Party-Songs-<date>``, album *Party-Song <date>*, artist
*Guest* or the user's name; once made, the library reads it and Live Play takes it in as every new song.

The songs wait in the player's own line (``party-songs.json`` in its state folder) and go to ComfyUI one at a time:
until a song starts it can be moved, edited and deleted. A user or guest moves their songs among their own places
in the line; the admin moves any. How long a song takes is estimated from its length and from how long the songs
made before took on this computer.

**Again from a song** (owner's request 2026-10-26): from any song of the library - one's own party song, a song of a
playlist - a **new take** (its title, style, lyrics and notes kept, sung and played anew: the Song API's
``/from-record`` gives its request, with its documents and a new take seed), a **new song like it** (the form filled
from its brief) or a **cover of it** (its audio file the original). The party's guests do so with their own songs.

**The whole studio** for the admin and for whoever comes through *In your network* (while the admin lets them,
``remote``): every field of the template - the Song Brief's, the writer model, HQ mastering and Cover Art - and the
Export Release's (the folder, the formats, the tags), at any time and without the party's limits.

**Several takes, several songs** (owner's request 2026-10-26: several takes of a song): the whole studio orders two
to four takes of one song - the first is made, and when it is ready its takes follow, the same title, words and notes
sung and played anew (new take jobs of the song made, at the head of the line) - or up to five songs of one form at
once. A new take of a song of the library comes as several takes the same way.

Standard library only (PyAV, where it is, reads a recording's length).
"""

from __future__ import annotations

import hashlib
import json
import re
import secrets
import shutil
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any

from ..core import brief as brief_rules
from ..core.errors import PlenioUserError
from ..core.release import RECORD_SUFFIX, record_fingerprint
from ..core.song_api import brief_values, model_of
from . import other as other_music
from .library import WAITING_DIR, Library

FILE = "party-songs.json"
SOURCES = "party-sources"
DEFAULT_FOLDER = "plenio"
"""The release folder of the songs and covers made here when the party's is not theirs (the templates')."""
COOKIE = "plenio_maker"
GUEST_NAME = "Guest"
DEFAULTS: dict[str, Any] = {
    "on": False,
    "users": True,
    "guests": True,
    "per_person": 3,
    "max_length": "about 4:00",
    "covers": True,
    "credit": "off",
    "remote": True,
    "listen_first": False,
    "approve": False,
}
"""Off until the admin switches it on; then users and guests may, three songs each waiting, up to about 4:00. Who
comes through *In your network* has the whole studio, at any time (``remote``; the admin always has). A song made
here is released at once - or (owner's request 2026-10-29) after its maker heard it and released it
(``listen_first``) and/or after an admin approved it (``approve``); the admin's and the helpers' songs are released
at once."""
RELEASE_STEPS = ("maker", "admin")
"""A song waiting to be released: for its maker to hear it first, or for an admin to approve it."""
NOT_RELEASED = "not released"
CREDITS = ("off", "spotlight", "drift")
"""Who made a party song, while it plays (Now playing, the visual, the guests' page): not shown; *spotlight* -
large as it begins, at every new section and as it ends, a small badge between; *drift* - the name floats
across the picture all the way, glowing with the beat."""
PARTY_ALBUM = re.compile(r"Party-Song \d{4}-\d{2}-\d{2}")
TEMPLATES = {"song": "yue2-song", "cover": "yue2-cover"}
SONG_FIELDS = (
    "template",
    "description",
    "genre",
    "mood",
    "tempo",
    "length",
    "vocals",
    "language",
    "voice",
    "theme",
    "lyrics_from",
    "lyrics",
    "key",
    "meter",
)
COVER_FIELDS = ("template", "description", "genre", "mood", "vocals", "language", "voice", "theme")
"""What the form asks. A cover keeps the original's tempo, length, key and meter."""
SUNG_ONLY = ("language", "voice", "theme", "lyrics_from", "lyrics")
BRIEF_INPUTS = {
    "language": "vocals.language",
    "voice": "vocals.voice",
    "theme": "vocals.theme",
    "lyrics_from": "vocals.lyrics_from",
    "lyrics": "vocals.lyrics",
}
"""The form's fields that are a DynamicCombo's inputs in the brief (``vocals.language``)."""
AGAIN = ("take", "song", "cover")
"""What is made again from a song: a new take of it, a new song like it, a cover of it."""
DOCUMENT_LIMITS = {"title": 200, "style": 2000, "lyrics": 20000}
"""A new take's documents one may change, and their characters at most."""
STUDIO_VALUE_LIMIT = 4000
RECORD_LIMIT = 32 * 2**20
DESCRIPTION_LIMIT = 1500
LYRICS_LIMIT = 6000
"""A song's lyrics idea or one's own lyrics (1.5.0), in characters: a long song's words fit."""
TEXT_LIMIT = 120
SOURCE_LIMIT = 100 * 2**20
SOURCE_SUFFIXES = (".mp3", ".flac", ".wav", ".ogg", ".m4a", ".opus", ".aac", ".aif", ".aiff")
LINE_LIMIT = 40
"""Songs waiting in the line at most (for everybody together)."""
TAKES_LIMIT = 4
"""Takes of one song ordered at once (the whole studio)."""
COPIES_LIMIT = 5
"""Songs of one form ordered at once (the whole studio)."""
KEEP_FINISHED_S = 12 * 3600
SOURCES_KEPT_S = 6 * 3600
POLL_S = 2.0
STUDIO_EVERY_S = 5.0
PRIOR = {"song": (120.0, 3.0), "cover": (120.0, 1.5), "take": (60.0, 1.5)}
"""Seconds of work before the first song is measured: a fixed part and so many per second of music (measured on an
RTX 5060 Ti: 2026-10-25 a song of about 1:00 took 300-360 s once the models were loaded; 2026-10-26 a new song of 1:10
109 s, a new take of a song - nothing written, nothing planned - 164 s for 1:30 and 192 s for 1:29 with the models
loaded first, a cover of a 1:33 recording 262 s, a new take of a cover 225 s for 1:42: it reads its original again, so
it counts as a cover; the factors learned from every song made correct these)."""
ACTIVE = ("sending", "queued", "running")
FINISHED = ("done", "failed", "cancelled")
LOOPBACK = re.compile(r"https?://(127\.0\.0\.1|localhost|\[::1\]):\d{2,5}/?")


class MakerError(ValueError):
    """A request the party songs refuse, with the HTTP status to answer."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


class StudioUnavailableError(OSError):
    """ComfyUI does not answer (not running, starting, the network)."""


class StudioError(ValueError):
    """The Song API refused a request: its code and message."""

    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code


class Studio:
    """The Song API of the ComfyUI on this computer (``url()`` finds it; loopback addresses only)."""

    def __init__(self, url: Callable[[], str | None]):
        self.url = url

    def _call(
        self,
        method: str,
        path: str,
        body: Any = None,
        *,
        data: bytes | None = None,
        content_type: str = "",
        headers: Mapping[str, str] | None = None,
        timeout: float = 10.0,
    ) -> Any:
        base = (self.url() or "").rstrip("/")
        if not base or not LOOPBACK.fullmatch(base + "/"):
            raise StudioUnavailableError("ComfyUI is not running on this computer")
        sent = data if data is not None else (json.dumps(body).encode("utf-8") if body is not None else None)
        request = urllib.request.Request(f"{base}/plenio/api/v1{path}", data=sent, method=method)
        if sent is not None:
            request.add_header("Content-Type", content_type or "application/json")
        for name, value in (headers or {}).items():
            request.add_header(name, value)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as answer:  # noqa: S310 - loopback only
                return json.loads(answer.read().decode("utf-8") or "null")
        except urllib.error.HTTPError as error:
            try:
                problem = json.loads(error.read().decode("utf-8")).get("error") or {}
            except (ValueError, AttributeError):
                problem = {}
            if error.code == 404 and not problem:
                raise StudioError(
                    404, "not_installed", "This ComfyUI has no Song API (Plenio older than 1.3?)."
                ) from error
            message = str(problem.get("message") or error.reason)
            if message.startswith("ComfyUI does not find") and problem.get("hint"):
                # a model file ComfyUI does not see: what to do, not its validation's words
                message += " " + str(problem["hint"])
            elif problem.get("details"):
                first = (
                    problem["details"][0]
                    if isinstance(problem["details"], list) and problem["details"]
                    else {}
                )
                if isinstance(first, Mapping) and first.get("message"):
                    message += f" ({first.get('title') or first.get('type')}: {first['message']})"
            raise StudioError(error.code, str(problem.get("code") or "error"), message) from error
        except (urllib.error.URLError, OSError, ValueError) as error:
            raise StudioUnavailableError(str(getattr(error, "reason", error))) from error

    def index(self) -> dict[str, Any]:
        return dict(self._call("GET", "/", timeout=4.0))

    def template(self, template_id: str) -> dict[str, Any]:
        return dict(self._call("GET", f"/templates/{template_id}"))

    def briefs(self, kind: str) -> dict[str, Any]:
        return dict(self._call("GET", f"/briefs?kind={kind}"))

    def upload(self, path: Path, name: str) -> dict[str, Any]:
        return dict(
            self._call(
                "POST",
                f"/uploads?name={urllib.parse.quote(name)}",
                data=path.read_bytes(),
                content_type="application/octet-stream",
                timeout=120.0,
            )
        )

    def create(self, body: Mapping[str, Any], key: str) -> dict[str, Any]:
        return dict(self._call("POST", "/jobs", body, headers={"Idempotency-Key": key}, timeout=60.0))

    def job(self, job_id: str) -> dict[str, Any]:
        return dict(self._call("GET", f"/jobs/{job_id}", timeout=5.0))

    def cancel(self, job_id: str) -> dict[str, Any]:
        return dict(self._call("DELETE", f"/jobs/{job_id}", timeout=10.0))

    def from_record(self, record: Mapping[str, Any]) -> dict[str, Any]:
        return dict(self._call("POST", "/from-record", record, timeout=20.0))

    def queue(self) -> dict[str, Any]:
        return dict(self._call("GET", "/queue", timeout=5.0))


def party_date(tags: Mapping[str, Any]) -> str:
    """The day of a party song's party (``YYYY-MM-DD``, from its album *Party-Song <date>*); ``''`` for another."""
    album = str(tags.get("album") or "").strip()
    return album.removeprefix("Party-Song ") if PARTY_ALBUM.fullmatch(album) else ""


def party_maker(tags: Mapping[str, Any]) -> str | None:
    """Who made a party song, from its tags (the album *Party-Song <date>*, the artist the user's name or
    *Guest*); ``None`` for every other song."""
    if not PARTY_ALBUM.fullmatch(str(tags.get("album") or "").strip()):
        return None
    return str(tags.get("artist") or "").strip() or GUEST_NAME


def _release_folder_ok(value: str) -> bool:
    """A release folder below ComfyUI's output folder (the Song API's rule, said early)."""
    text = value.strip().replace("\\", "/")
    return bool(
        text
        and not text.startswith("/")
        and not re.match(r"^[A-Za-z]:", text)
        and not any(p in ("..", ".") for p in text.split("/"))
    )


def _own_release(release: Any) -> dict[str, Any]:
    """A song's release fields to make it again with: all but the collision rule - a song made again never
    overwrites the one it comes from (the template's rule, a new number, holds unless chosen in the studio)."""
    return {k: v for k, v in dict(release or {}).items() if k != "collision"}


def move_song(folder: Path, target: Path) -> Path:
    """A released song's files from its waiting folder (``folder``: only its own) into ``target``; returns its
    record there. A name already taken there gets a number, as Export Release gives one - the files, the stems'
    folder and the record's list of files alike (its fingerprint computed again), and its page written anew."""
    record = next((p for p in folder.iterdir() if p.name.endswith(RECORD_SUFFIX)), None)
    if record is None:
        raise MakerError("The song's record is not in its folder.", 404)
    stem = record.name.removesuffix(RECORD_SUFFIX)
    entries = [p for p in folder.iterdir()]

    def renamed(name: str, new: str) -> str:
        return new + name[len(stem) :] if name.startswith(stem) else name

    new = stem
    number = 2
    while any((target / renamed(p.name, new)).exists() for p in entries):
        new = f"{stem} ({number})"
        number += 1
    if new != stem:
        data = json.loads(record.read_text(encoding="utf-8"))
        for item in data.get("files") or []:
            if isinstance(item, dict) and isinstance(item.get("name"), str):
                item["name"] = renamed(item["name"], new)
        if "fingerprint" in data:
            data["fingerprint"] = record_fingerprint(data)
        record.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    target.mkdir(parents=True, exist_ok=True)
    for path in entries:
        shutil.move(str(path), str(target / renamed(path.name, new)))
    folder.rmdir()
    moved = target / f"{new}{RECORD_SUFFIX}"
    page = target / f"{new}.html"
    if new != stem and page.exists():
        try:
            from .song_page import page_for

            page.write_text(page_for(moved), encoding="utf-8")
        except (OSError, ValueError):
            pass  # the page is a reading aid; the song is released
    return moved


def record_kind(record: Mapping[str, Any]) -> str:
    """``song`` or ``cover`` by the record's brief (``""``: none - a file finished, not made)."""
    classes = {n.get("class_type") for n in (record.get("prompt") or {}).values() if isinstance(n, Mapping)}
    return "cover" if "PlenioCoverBrief" in classes else "song" if "PlenioSongBrief" in classes else ""


def brief_fields(record: Mapping[str, Any], names: tuple[str, ...]) -> dict[str, str]:
    """The form's fields as the record's brief has them (without ComfyUI: from its prompt)."""
    brief = next(
        (
            n
            for n in (record.get("prompt") or {}).values()
            if isinstance(n, Mapping) and n.get("class_type") in ("PlenioSongBrief", "PlenioCoverBrief")
        ),
        None,
    )
    inputs = (brief or {}).get("inputs") or {}
    out: dict[str, str] = {}
    for name in names:
        value = inputs.get(BRIEF_INPUTS.get(name, name), inputs.get(name))
        if isinstance(value, (str, int, float)) and not isinstance(value, bool):
            out[name] = str(value)
    return out


def guest_id(token: str) -> str:
    """A guest by the cookie their browser keeps (only its hash)."""
    return "g" + hashlib.sha256(token.encode("utf-8")).hexdigest()[:15]


def new_guest_token() -> str:
    return secrets.token_urlsafe(24)


def guest_cookie(token: str) -> str:
    return f"{COOKIE}={token}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax"


def token_of(cookie_header: str | None) -> str:
    for part in (cookie_header or "").split(";"):
        name, _, value = part.strip().partition("=")
        if name == COOKIE and re.fullmatch(r"[A-Za-z0-9_-]{20,64}", value.strip()):
            return value.strip()
    return ""


def length_seconds(option: str) -> float:
    return float(brief_rules.LENGTHS.get(option, brief_rules.LENGTHS[brief_rules.DEFAULT_LENGTH]))


def _today(clock: float) -> str:
    return time.strftime("%Y-%m-%d", time.localtime(clock))


def _line(text: Any, limit: int, name: str) -> str:
    value = " ".join(str(text or "").split())
    if len(value) > limit:
        raise MakerError(f"The {name} is too long ({limit} characters at most).")
    return value


class PartySongs:
    """The party songs: settings, the line, the worker that sends one song at a time to ComfyUI and follows it."""

    def __init__(
        self,
        library: Library,
        directory: Path,
        studio: Studio,
        *,
        clock: Callable[[], float] = time.time,
        package_templates: Path | None = None,
    ) -> None:
        self.library = library
        self.directory = directory
        self.path = directory / FILE
        self.sources = directory / SOURCES
        self.studio = studio
        self.clock = clock
        self.package_templates = (
            package_templates or Path(__file__).resolve().parents[2] / "resources" / "templates"
        )
        self.lock = threading.RLock()
        data = self._load()
        self.settings: dict[str, Any] = data["settings"]
        self.jobs: list[dict[str, Any]] = data["jobs"]
        self.rates: dict[str, float] = data["rates"]
        self.folders: list[str] = data["folders"]
        self.studio_state: dict[str, Any] = {"reachable": False, "checked": 0.0, "queue": None, "error": ""}
        self._form: tuple[float, dict[str, Any]] | None = None
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self.launcher: Any = None
        """The studio the player starts itself (``plenio.player.studio.StudioLauncher``): a song that waits starts it
        when the admin wishes, and it stops after the idle minutes."""
        self.library.extra = [Path(f) for f in self.folders]
        # a song that was being sent when the player stopped: sent again (the API knows it by its job id)
        for job in self.jobs:
            if job["status"] == "sending":
                job["status"] = "waiting"

    # --- the file ---------------------------------------------------------------------------------------
    def _load(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            data = {}
        data = data if isinstance(data, dict) else {}
        given: dict[str, Any] = data["settings"] if isinstance(data.get("settings"), dict) else {}
        settings = {**DEFAULTS, **{k: v for k, v in given.items() if k in DEFAULTS}}
        settings["on"], settings["users"], settings["guests"], settings["covers"] = (
            bool(settings["on"]),
            bool(settings["users"]),
            bool(settings["guests"]),
            bool(settings["covers"]),
        )
        try:
            settings["per_person"] = max(1, min(20, int(settings["per_person"])))
        except (TypeError, ValueError):
            settings["per_person"] = DEFAULTS["per_person"]
        if settings["max_length"] not in brief_rules.LENGTHS:
            settings["max_length"] = DEFAULTS["max_length"]
        if settings["credit"] not in CREDITS:
            settings["credit"] = DEFAULTS["credit"]
        settings["remote"] = bool(settings["remote"])
        settings["listen_first"] = bool(settings["listen_first"])
        settings["approve"] = bool(settings["approve"])
        jobs = [j for j in data.get("jobs") or [] if isinstance(j, dict) and isinstance(j.get("id"), str)]
        rates = {
            k: float(v)
            for k, v in (data.get("rates") or {}).items()
            if k in PRIOR and isinstance(v, (int, float))
        }
        folders = [str(f) for f in data.get("folders") or [] if isinstance(f, str)]
        return {"settings": settings, "jobs": jobs, "rates": rates, "folders": folders}

    def _save(self) -> None:
        self.directory.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(".tmp")
        temp.write_text(
            json.dumps(
                {"settings": self.settings, "jobs": self.jobs, "rates": self.rates, "folders": self.folders},
                ensure_ascii=False,
                indent=1,
            ),
            encoding="utf-8",
        )
        for attempt in range(20):
            try:
                temp.replace(self.path)
                return
            except PermissionError:
                if attempt == 19:
                    raise
                time.sleep(0.05)

    # --- rights -----------------------------------------------------------------------------------------
    def full(self, who: Mapping[str, Any]) -> bool:
        """The whole studio - every field, at any time, without the party's limits: the admin, and whoever comes
        through *In your network* while the admin lets them."""
        return who.get("kind") == "admin" or bool(who.get("remote") and self.settings["remote"])

    def may(self, who: Mapping[str, Any]) -> tuple[bool, str]:
        # a user of the group *listener* listens only (owner's request 2026-10-29) - also through the network
        if who.get("kind") == "user" and who.get("group") == "listener":
            return (
                False,
                "This account listens only - the admin lets it make songs (Settings: Who is listening).",
            )
        if self.full(who):
            return True, ""
        if not self.settings["on"]:
            return False, "Making songs is switched off - the host switches it on in Settings."
        if who.get("kind") == "user" and not self.settings["users"]:
            return False, "The host lets only the admin make songs."
        if who.get("kind") == "guest" and not self.settings["guests"]:
            return False, "The host lets only logged-in listeners make songs."
        return True, ""

    def guests_may(self) -> bool:
        return bool(self.settings["on"] and self.settings["guests"])

    def _mine(self, who: Mapping[str, Any], job: Mapping[str, Any]) -> bool:
        """A job of this listener: a guest's by their cookie, a user's by their id - also when their group changed
        since (a user made a helper made it as a user)."""
        owner = job.get("owner") or {}
        guest = owner.get("kind") == "guest"
        return guest == (who.get("kind") == "guest") and owner.get("id") == who.get("id")

    def made_here(self, song_id: str, since: float = 0.0) -> dict[str, str] | None:
        """Who made a song here - the party's songs, of guests, users and the admins - when it was ordered at or after
        ``since``; ``None`` for a song not made here."""
        with self.lock:
            for job in self.jobs:
                if (job.get("result") or {}).get("song") == song_id and float(
                    job.get("created") or 0
                ) >= since:
                    owner = job.get("owner") or {}
                    return {"by": str(owner.get("name") or GUEST_NAME), "kind": str(owner.get("kind") or "")}
        return None

    def _job(self, job_id: str, who: Mapping[str, Any]) -> dict[str, Any]:
        job = next((j for j in self.jobs if j["id"] == job_id), None)
        if job is None or not (self._mine(who, job) or who.get("kind") == "admin"):
            raise MakerError("No such song.", 404)
        return job

    # --- the settings -----------------------------------------------------------------------------------
    def configure(self, changes: Mapping[str, Any]) -> dict[str, Any]:
        with self.lock:
            for key in ("on", "users", "guests", "covers", "remote", "listen_first", "approve"):
                if key in changes:
                    self.settings[key] = bool(changes[key])
            if "per_person" in changes:
                try:
                    self.settings["per_person"] = max(1, min(20, int(changes["per_person"])))
                except (TypeError, ValueError) as error:
                    raise MakerError("Songs per person: a number from 1 to 20.") from error
            if "max_length" in changes:
                if changes["max_length"] not in brief_rules.LENGTHS:
                    raise MakerError(f"The longest length: one of {list(brief_rules.LENGTHS)}.")
                self.settings["max_length"] = changes["max_length"]
            if "credit" in changes:
                if changes["credit"] not in CREDITS:
                    raise MakerError(f"Who made it: one of {list(CREDITS)}.")
                self.settings["credit"] = changes["credit"]
            self._save()
            return dict(self.settings)

    # --- the form ---------------------------------------------------------------------------------------
    def _lengths(self, who: Mapping[str, Any]) -> list[str]:
        limit = length_seconds(self.settings["max_length"]) if not self.full(who) else float("inf")
        return [option for option, seconds in brief_rules.LENGTHS.items() if seconds <= limit]

    def _too_long(self, who: Mapping[str, Any], length: Any) -> bool:
        """A song made again is longer than the party allows (the whole studio: never; a length older versions
        named otherwise is let through)."""
        seconds = brief_rules.LENGTHS.get(str(length or ""))
        return (
            not self.full(who)
            and seconds is not None
            and seconds > length_seconds(self.settings["max_length"])
        )

    def _covers(self, who: Mapping[str, Any]) -> bool:
        return bool(self.settings["covers"]) or self.full(who)

    def form(self, who: Mapping[str, Any]) -> dict[str, Any]:
        """What the form offers: the style templates (to fill every field), every value their fields have (the
        lists), the choices of length and vocals - from ComfyUI's Song API when it answers, else from the package."""
        now = self.clock()
        cached = self._form
        # ComfyUI's answer is kept a minute; the package's only a moment - ComfyUI may come up any time (the studio
        # started from the player), and its form has the whole studio's settings
        if cached is None or now - cached[0] > (60 if cached[1].get("source") == "studio" else 5):
            built = self._form_from_studio() or self._form_from_package()
            self._form = cached = (now, built)
        form: dict[str, Any] = json.loads(json.dumps(cached[1]))
        form["song"]["choices"]["length"] = [
            c for c in form["song"]["choices"]["length"] if c in self._lengths(who)
        ]
        form["limits"] = {
            "description": DESCRIPTION_LIMIT,
            "lyrics": LYRICS_LIMIT,
            "text": TEXT_LIMIT,
            "source_mb": SOURCE_LIMIT // 2**20,
            "max_length": self.settings["max_length"] if not self.full(who) else "",
            "documents": dict(DOCUMENT_LIMITS),
        }
        form["covers"] = self._covers(who)
        studio = form.pop("studio_templates", None)
        if self.full(who):
            form["studio"] = (
                {**studio, "defaults": self._studio_defaults(who)}
                if studio
                else {"unavailable": "ComfyUI is not running - its settings show once it runs."}
            )
        return form

    def _studio_defaults(self, who: Mapping[str, Any]) -> dict[str, Any]:
        """What the whole studio starts from: HQ mastering off, Cover Art on - and for a guest of the party the
        party's release (the host and the users keep the template's folder and tags, as in ComfyUI)."""
        party = bool(who.get("party") or who.get("kind") == "guest")
        return {
            "fields": {"finish.hq_mastering": False, "finish.cover_art": True},
            "release": self._party_release({"kind": who.get("kind"), "name": who.get("name")}, self.clock())
            if party
            else {},
        }

    def _form_from_studio(self) -> dict[str, Any] | None:
        try:
            song = self.studio.template(TEMPLATES["song"])
            cover = self.studio.template(TEMPLATES["cover"])
            briefs = self.studio.briefs("song")
        except (StudioUnavailableError, StudioError):
            return None

        def field_of(template: Mapping[str, Any], name: str) -> Mapping[str, Any]:
            found: Mapping[str, Any] = next(
                (f for f in template.get("fields") or [] if isinstance(f, Mapping) and f.get("id") == name),
                {},
            )
            return found

        def choices(template: Mapping[str, Any], name: str) -> list[str]:
            return [str(c) for c in field_of(template, name).get("choices") or []]

        def default(template: Mapping[str, Any], name: str) -> Any:
            return field_of(template, name).get("default")

        def described(template: Mapping[str, Any]) -> dict[str, Any]:
            return {
                "template": template.get("id"),
                "fields": list(template.get("fields") or []),
                "release": list(template.get("release") or []),
                "documents": list(template.get("documents") or []),
            }

        return {
            "source": "studio",
            "studio_templates": {"song": described(song), "cover": described(cover)},
            "templates": [
                {"id": b["id"], "name": b["name"], "group": b["group"], "fields": b.get("fields") or {}}
                for b in briefs.get("briefs") or []
                if isinstance(b, Mapping) and b.get("id")
            ],
            "values": briefs.get("values") or {},
            "song": {
                "fields": list(SONG_FIELDS),
                "choices": {"length": choices(song, "length"), "vocals": choices(song, "vocals")},
                "defaults": {"length": default(song, "length"), "vocals": default(song, "vocals")},
            },
            "cover": {
                "fields": list(COVER_FIELDS),
                "choices": {"vocals": choices(cover, "vocals")},
                "defaults": {"vocals": default(cover, "vocals")},
            },
        }

    def _form_from_package(self) -> dict[str, Any]:
        library = brief_rules.TemplateLibrary(self.package_templates)
        found = [library.templates()[i] for i in library.ids()]
        return {
            "source": "package",
            "templates": [
                {"id": t.id, "name": t.name, "group": t.group, "fields": dict(t.fields)} for t in found
            ],
            "values": brief_values(found, brief_rules.TEMPLATE_FIELDS),
            "song": {
                "fields": list(SONG_FIELDS),
                "choices": {"length": list(brief_rules.LENGTHS), "vocals": list(brief_rules.VOCALS)},
                "defaults": {"length": brief_rules.DEFAULT_LENGTH, "vocals": "sung"},
            },
            "cover": {
                "fields": list(COVER_FIELDS),
                "choices": {"vocals": list(brief_rules.COVER_VOCALS)},
                "defaults": {"vocals": "original lyrics"},
            },
        }

    # --- songs --------------------------------------------------------------------------------------------
    def _clean(self, who: Mapping[str, Any], data: Mapping[str, Any], *, kind: str) -> dict[str, str]:
        given: Mapping[str, Any] = data["fields"] if isinstance(data.get("fields"), Mapping) else {}
        names = SONG_FIELDS if kind == "song" else COVER_FIELDS
        fields: dict[str, str] = {}
        for name in names:
            if name == "description":
                text = str(given.get(name) or "").strip()
                if len(text) > DESCRIPTION_LIMIT:
                    raise MakerError(f"The description is too long ({DESCRIPTION_LIMIT} characters at most).")
                fields[name] = re.sub(r"[^\S\n]+", " ", text)
            elif name == "lyrics":
                # one's own lyrics keep their lines and their blank lines (the sections)
                text = str(given.get(name) or "").replace("\r\n", "\n").strip()
                if len(text) > LYRICS_LIMIT:
                    raise MakerError(f"The lyrics are too long ({LYRICS_LIMIT} characters at most).")
                fields[name] = "\n".join(re.sub(r"[^\S\n]+", " ", line).strip() for line in text.split("\n"))
            else:
                fields[name] = _line(given.get(name), TEXT_LIMIT, name)
        if kind == "song":
            if fields["length"] and fields["length"] not in brief_rules.LENGTHS:
                try:
                    fields["length"] = brief_rules.resolve_length(fields["length"])[0]
                except PlenioUserError as error:
                    raise MakerError(f"The length: {error.message}") from error
            fields["length"] = fields["length"] or brief_rules.DEFAULT_LENGTH
            if fields["length"] not in self._lengths(who):
                raise MakerError(f"The host allows songs up to {self.settings['max_length']}.")
            fields["vocals"] = fields["vocals"] or "sung"
            if fields["vocals"] not in brief_rules.VOCALS:
                raise MakerError(f"Vocals: one of {', '.join(brief_rules.VOCALS)}.")
            fields["lyrics_from"] = fields["lyrics_from"] or brief_rules.LYRICS_IDEA
            if fields["lyrics_from"] not in brief_rules.LYRICS_FROM:
                raise MakerError(f"Lyrics: one of {', '.join(brief_rules.LYRICS_FROM)}.")
            own = fields["lyrics_from"] == brief_rules.OWN_LYRICS
            if own and fields["vocals"] != "instrumental" and not fields["lyrics"]:
                raise MakerError("Write your lyrics - or let the writer write them from an idea.")
        else:
            fields["vocals"] = fields["vocals"] or "original lyrics"
            if fields["vocals"] not in brief_rules.COVER_VOCALS:
                raise MakerError(f"Vocals: one of {', '.join(brief_rules.COVER_VOCALS)}.")
        fields["template"] = fields["template"] if fields["template"] not in ("", "none") else "none"
        if fields["template"] != "none" and (
            not re.fullmatch(r"[a-z0-9][a-z0-9/_-]{0,118}", fields["template"])
            or fields["template"] not in self._style_ids(who)
        ):
            raise MakerError("No such style - choose one of the list.")
        if fields["template"] == "none" and not (fields["genre"] or fields["description"]):
            raise MakerError("Choose a style, or give at least a genre or a description.")
        return fields

    def _style_ids(self, who: Mapping[str, Any]) -> set[str]:
        """The style templates the form offers (ComfyUI's, else the package's)."""
        return {str(t.get("id")) for t in self.form(who).get("templates") or []}

    def _waiting(self) -> list[dict[str, Any]]:
        return [j for j in self.jobs if j["status"] == "waiting"]

    def create(self, who: Mapping[str, Any], data: Mapping[str, Any]) -> dict[str, Any]:
        allowed, why = self.may(who)
        if not allowed:
            raise MakerError(why, 403)
        again, base, record = self._again(who, data)
        source_id = str(data.get("source") or "")
        if again == "take":
            kind = record_kind(record or {})
            fields = brief_fields(record or {}, SONG_FIELDS if kind == "song" else COVER_FIELDS)
            if kind == "song" and self._too_long(who, fields.get("length")):
                raise MakerError(
                    f"The host allows songs up to {self.settings['max_length']} - this one is longer."
                )
        else:
            kind = "cover" if source_id or again == "cover" else "song"
            fields = self._clean(who, data, kind=kind)
        if kind == "cover" and not self._covers(who):
            raise MakerError("The host lets guests make new songs only, no covers.", 403)
        documents = self._edits(data, kind) if again == "take" else {}
        studio = self._studio_values(who, data, kind)
        takes, copies = self._counts(who, data)
        with self.lock:
            open_jobs = [j for j in self.jobs if self._mine(who, j) and j["status"] not in FINISHED]
            if not self.full(who) and len(open_jobs) >= self.settings["per_person"]:
                raise MakerError(
                    f"You have {len(open_jobs)} songs in the making - the host allows {self.settings['per_person']}. "
                    "Wait until one is done.",
                    429,
                )
            # a new take of a song of the library: each take a job of its own; a new song with takes: the first
            # job, and its takes once it is made; several songs of one form: a job each
            count = takes if again == "take" else copies
            if len(self._waiting()) + count > LINE_LIMIT:
                raise MakerError("The line is full just now - try again in a few minutes.", 429)
            source = None
            if again == "cover" and base is not None:
                source = {"song": base["song"], "title": base["title"], "seconds": base["seconds"]}
            elif kind == "cover" and again != "take":
                source = self._source(source_id, who)
            group = secrets.token_hex(4) if takes > 1 or copies > 1 else ""
            made = []
            for number in range(count):
                job = self._new_job(who, kind, again, base, documents, studio, fields, source)
                if group:
                    job["group"] = group
                    job["of"] = count if again == "take" or copies > 1 else takes
                    job["number"] = number + 1
                if again != "take" and takes > 1:
                    job["takes_left"] = takes - 1
                self.jobs.append(job)
                made.append(job)
            self._save()
        return self.view(made[0], who)

    def _counts(self, who: Mapping[str, Any], data: Mapping[str, Any]) -> tuple[int, int]:
        """How many takes of the song, and how many songs of the form, a request orders: the whole studio up to
        :data:`TAKES_LIMIT` and :data:`COPIES_LIMIT` (not both at once), everybody else one."""

        def number(name: str, most: int) -> int:
            raw = data.get(name, 1)
            if isinstance(raw, bool) or not isinstance(raw, (int, float)) or int(raw) != raw:
                raise MakerError(f"{name}: a whole number from 1 to {most}.")
            if not 1 <= int(raw) <= most:
                raise MakerError(f"{name}: from 1 to {most}.")
            return int(raw)

        takes, copies = number("takes", TAKES_LIMIT), number("copies", COPIES_LIMIT)
        if (takes > 1 or copies > 1) and not self.full(who):
            raise MakerError(
                "Several takes or songs at once are for the whole studio (the admin, the network).", 403
            )
        if takes > 1 and copies > 1:
            raise MakerError("Several takes of one song, or several songs - not both at once.")
        return takes, copies

    def _new_job(
        self,
        who: Mapping[str, Any],
        kind: str,
        again: str | None,
        base: Mapping[str, Any] | None,
        documents: Mapping[str, str],
        studio: Mapping[str, Any] | None,
        fields: Mapping[str, Any],
        source: Mapping[str, Any] | None,
    ) -> dict[str, Any]:
        return {
            "id": secrets.token_hex(8),
            "owner": {
                "kind": who.get("kind"),
                "id": who.get("id"),
                "name": who.get("name") or GUEST_NAME,
                # ordered on the party's page: a party song (the host and the users make songs as in ComfyUI)
                "party": bool(who.get("party") or who.get("kind") == "guest"),
            },
            "kind": kind,
            "again": again,
            "base": dict(base) if base else None,
            "documents": dict(documents),
            "studio": dict(studio) if studio else studio,
            "full": self.full(who),
            "fields": dict(fields),
            "source": dict(source) if source else None,
            "status": "waiting",
            "created": self.clock(),
            "sent": None,
            "started": None,
            "finished": None,
            "comfy": None,
            "stage": None,
            "progress": None,
            "result": None,
            "error": "",
            "note": "",
            "retried": False,
        }

    def _add_takes(self, job: dict[str, Any], song_id: str) -> None:
        """The takes a song was ordered with, once it is made: new take jobs of it, at the head of the line (the
        same owner and studio settings; the same title, words and notes, a new take seed each)."""
        left = int(job.get("takes_left") or 0)
        if left <= 0:
            return
        try:
            song, record = self._record(song_id)
        except MakerError:
            return
        why = self._take_why(record)
        with self.lock:
            job["takes_left"] = 0
            if why:
                job["note"] = f"no further takes: {why}"
                self._save()
                return
            kind = record_kind(record or {})
            fields = brief_fields(record or {}, SONG_FIELDS if kind == "song" else COVER_FIELDS)
            base = {
                "song": song.id,
                "title": str(song.summary.get("title") or "a song")[:200],
                "seconds": round(float(song.summary.get("seconds") or 0.0), 1),
            }
            owner = job.get("owner") or {}
            who = {"kind": owner.get("kind"), "id": owner.get("id"), "name": owner.get("name")}
            group = str(job.get("group") or secrets.token_hex(4))
            job["group"] = group
            total = left + 1
            job["of"] = total
            job["number"] = 1
            first = next((k for k, j in enumerate(self.jobs) if j["status"] == "waiting"), len(self.jobs))
            for number in range(left):
                take = self._new_job(who, kind or "song", "take", base, {}, job.get("studio"), fields, None)
                take["full"] = bool(job.get("full"))
                take.update(group=group, of=total, number=number + 2)
                self.jobs.insert(first + number, take)
            self._save()

    def update(self, who: Mapping[str, Any], job_id: str, data: Mapping[str, Any]) -> dict[str, Any]:
        with self.lock:
            job = self._job(job_id, who)
            if job["status"] != "waiting":
                raise MakerError("The song is being made already - it can no longer be changed.", 409)
            if job.get("again") == "take":
                job["documents"] = self._edits(data, job["kind"])
            else:
                job["fields"] = self._clean(who, data, kind=job["kind"])
            if "studio" in data:
                job["studio"] = self._studio_values(who, data, job["kind"])
            if (
                job["kind"] == "cover"
                and job.get("again") is None
                and data.get("source")
                and data.get("source") != (job.get("source") or {}).get("id")
            ):
                job["source"] = self._source(str(data["source"]), who)
            self._save()
            return self.view(job, who)

    # --- again from a song --------------------------------------------------------------------------------
    def _record(self, song_id: str) -> tuple[Any, dict[str, Any] | None]:
        """A song of the library and its release record (``None``: other music, or a record not to be read)."""
        song = self.library.song(song_id) if re.fullmatch(r"[0-9a-f]{6,64}", song_id or "") else None
        if song is None:
            raise MakerError("No such song in the library.", 404)
        if song.other:
            return song, None
        try:
            if song.record.stat().st_size > RECORD_LIMIT:
                return song, None
            record = json.loads(song.record.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return song, None
        return song, record if isinstance(record, dict) else None

    def made_by(self, who: Mapping[str, Any], song_id: str) -> bool:
        """Whether ``who`` made the song here (the party's guests make again only their own songs)."""
        return any(
            self._mine(who, j) and (j.get("result") or {}).get("song") == song_id and j["status"] == "done"
            for j in self.jobs
        )

    def _audio_of(self, song: Any) -> Path | None:
        if song.other:
            return Path(song.record) if Path(song.record).is_file() else None
        for kind in ("audio_flac", "audio_wav", "audio_mp3"):
            path = song.files.get(kind)
            if path is not None and Path(path).is_file():
                return Path(path)
        return None

    def _again(
        self, who: Mapping[str, Any], data: Mapping[str, Any]
    ) -> tuple[str | None, dict[str, Any] | None, dict[str, Any] | None]:
        """What a request makes again: (``take``/``song``/``cover`` or ``None``, the song it comes from, its
        record)."""
        raw = data.get("from")
        if not raw:
            return None, None, None
        if not isinstance(raw, Mapping) or raw.get("as") not in AGAIN or not isinstance(raw.get("song"), str):
            raise MakerError(f"from: the song's id and what to make ({', '.join(AGAIN)}).")
        again = str(raw["as"])
        if who.get("party") and not self.made_by(who, raw["song"]):
            raise MakerError("No such song of yours.", 404)
        song, record = self._record(raw["song"])
        summary = song.summary
        base = {
            "song": song.id,
            "title": str(summary.get("title") or "a song")[:200],
            "seconds": round(float(summary.get("seconds") or 0.0), 1),
        }
        if again == "take":
            why = self._take_why(record)
            if why:
                raise MakerError(f"No new take of this song: {why}", 409)
        if again == "cover" and self._audio_of(song) is None:
            raise MakerError("The song's audio file is not there.", 409)
        return again, base, record

    def _take_why(self, record: Mapping[str, Any] | None) -> str:
        """Why a song makes no new take, as far as the player can tell without ComfyUI (``""``: it does)."""
        if record is None:
            return "it was not made with Plenio."
        model = model_of(record)
        if model != "YuE2":
            return (
                f"it was made with {model} - a new take is YuE2's."
                if model
                else "it was not made by a model."
            )
        texts = {
            k
            for k, d in (record.get("documents") or {}).items()
            if isinstance(d, Mapping) and str(d.get("text") or "").strip()
        }
        lacking = [k for k in ("style", "lyrics", "score") if k not in texts]
        return f"its record has no {' and no '.join(lacking)}." if lacking else ""

    def remake(self, who: Mapping[str, Any], song_id: str) -> dict[str, Any]:
        """What the form starts from to make a song again: the song, what can be made of it (a new take, a new
        song like it, a cover of it - and why not), its brief's fields, the documents a new take may change - and
        for the whole studio every field as the song had it."""
        allowed, why = self.may(who)
        if not allowed:
            raise MakerError(why, 403)
        if who.get("party") and not self.made_by(who, song_id):
            raise MakerError("No such song of yours.", 404)
        song, record = self._record(song_id)
        summary = song.summary
        kind = record_kind(record or {})
        answer: dict[str, Any] | None = None
        if record is not None and kind:
            try:
                answer = self.studio.from_record(record)
            except (StudioUnavailableError, StudioError):
                answer = None
        can: dict[str, bool] = {}
        reasons: dict[str, str] = {}
        take_why = self._take_why(record)
        if not take_why and answer is not None and not (answer.get("take") or {}).get("possible"):
            take_why = str((answer.get("take") or {}).get("why") or "ComfyUI makes no new take of it.")
            take_why = take_why[0].lower() + take_why[1:]
        fields = brief_fields(record or {}, SONG_FIELDS if kind != "cover" else COVER_FIELDS)
        if not take_why and kind == "song" and self._too_long(who, fields.get("length")):
            take_why = f"it is longer than the host allows ({self.settings['max_length']})."
        can["take"], reasons["take"] = not take_why, take_why
        can["song"] = bool(kind)
        reasons["song"] = "" if kind else "it has no Song Brief to start from."
        has_audio = self._audio_of(song) is not None
        can["cover"] = has_audio and self._covers(who)
        reasons["cover"] = (
            ""
            if can["cover"]
            else "the host lets guests make new songs only."
            if has_audio
            else "its audio file is not there."
        )
        song_fields = {k: fields[k] for k in SONG_FIELDS if k in fields}
        if kind == "cover":
            # a new song like a cover: its sound and its voice, sung
            song_fields["vocals"] = "instrumental" if fields.get("vocals") == "instrumental" else "sung"
        texts = {
            str(k): str(d.get("text") or "")
            for k, d in ((record or {}).get("documents") or {}).items()
            if isinstance(d, Mapping)
        }
        out: dict[str, Any] = {
            "song": {
                "id": song.id,
                "title": str(summary.get("title") or ""),
                "genre": str(summary.get("genre") or ""),
                "seconds": round(float(summary.get("seconds") or 0.0), 1),
                "cover": bool((summary.get("has") or {}).get("cover")),
                "other": bool(song.other),
                "model": model_of(record or {}),
                "kind": kind,
            },
            "can": can,
            "why": reasons,
            "start": next((k for k in AGAIN if can[k]), ""),
            "kind": kind or "song",
            "fields": song_fields,
            "documents": {k: texts.get(k, "") for k in DOCUMENT_LIMITS},
            "studio": None,
        }
        if self.full(who) and answer is not None:
            out["studio"] = {
                "template": answer.get("template"),
                "fields": dict(answer.get("fields") or {}),
                "release": _own_release(answer.get("release")),
                "warnings": list(answer.get("warnings") or []),
            }
        return out

    def _edits(self, data: Mapping[str, Any], kind: str) -> dict[str, str]:
        """A new take's documents as changed (title, style, lyrics), checked - a cover's words stay: they follow
        the original's melody."""
        raw = data.get("documents") or {}
        if not isinstance(raw, Mapping):
            raise MakerError("documents: the title, style and lyrics.")
        out: dict[str, str] = {}
        for name, limit in DOCUMENT_LIMITS.items():
            text = raw.get(name)
            if kind == "cover" and name == "lyrics":
                continue
            if text is None:
                continue
            if not isinstance(text, str):
                raise MakerError(f"The {name} is text.")
            text = text.replace("\r\n", "\n").strip()
            if len(text) > limit:
                raise MakerError(f"The {name} is too long ({limit} characters at most).")
            if any(ord(c) < 32 and c not in "\n\t" for c in text) or (name != "lyrics" and "\n" in text):
                raise MakerError(
                    f"The {name}: {'lines of text' if name == 'lyrics' else 'one line of text'}."
                )
            if text:
                out[name] = text
        return out

    def _studio_values(
        self, who: Mapping[str, Any], data: Mapping[str, Any], kind: str
    ) -> dict[str, dict[str, Any]] | None:
        """The whole studio's values (the template's fields, the release's), checked as far as the player can - the
        Song API checks them all."""
        raw = data.get("studio")
        if not raw:
            return None
        if not self.full(who):
            raise MakerError(
                "Every setting of the studio is for the admin and for the player in your network.", 403
            )
        if not isinstance(raw, Mapping):
            raise MakerError("studio: the fields and the release.")
        cached = (self._form[1] if self._form else {}).get("studio_templates") or {}
        spec = cached.get(kind) or {}
        known = {
            "fields": {str(f.get("id")): f for f in spec.get("fields") or [] if isinstance(f, Mapping)},
            "release": {str(f.get("id")): f for f in spec.get("release") or [] if isinstance(f, Mapping)},
        }
        out: dict[str, dict[str, Any]] = {}
        for part in ("fields", "release"):
            values = raw.get(part) or {}
            if not isinstance(values, Mapping) or len(values) > 120:
                raise MakerError(f"studio.{part}: names and values.")
            clean: dict[str, Any] = {}
            for name, value in values.items():
                if not isinstance(name, str) or not re.fullmatch(r"[a-z0-9_.]{1,80}", name):
                    raise MakerError(f"studio.{part}: {str(name)[:40]!r} is no field.")
                if known[part] and name not in known[part]:
                    raise MakerError(f"The studio has no field {name!r}.")
                found = known[part].get(name) or {}
                if found.get("fixed") or found.get("type") == "upload":
                    continue  # the run-through mode, a cover's recording: the player's own
                if isinstance(value, str):
                    if len(value) > STUDIO_VALUE_LIMIT:
                        raise MakerError(f"{name}: {STUDIO_VALUE_LIMIT} characters at most.")
                elif value is not None and not isinstance(value, (bool, int, float)):
                    raise MakerError(f"{name}: a text, a number or yes/no.")
                if value is None:
                    continue
                if part == "release" and name == "folder" and not _release_folder_ok(str(value)):
                    raise MakerError(
                        "The folder is one below ComfyUI's output folder, like 'plenio/My-Songs'."
                    )
                clean[name] = value
            out[part] = clean
        return out

    def move(self, who: Mapping[str, Any], job_id: str, by: int) -> dict[str, Any]:
        """One place up (``-1``) or down (``1``) in the line: past the next song of one's own (the admin: past the
        next song)."""
        if by not in (-1, 1):
            raise MakerError("by: -1 (earlier) or 1 (later).")
        with self.lock:
            job = self._job(job_id, who)
            if job["status"] != "waiting":
                raise MakerError("Only a song that is still waiting can move.", 409)
            line = self._waiting()
            at = line.index(job)
            admin = who.get("kind") == "admin"
            others = [k for k, j in enumerate(line) if (admin or self._mine(who, j)) and j is not job]
            target = next(
                (k for k in (reversed(others) if by < 0 else others) if (k < at if by < 0 else k > at)), None
            )
            if target is None:
                raise MakerError("It is first already." if by < 0 else "It is last already.", 409)
            a, b = self.jobs.index(job), self.jobs.index(line[target])
            self.jobs[a], self.jobs[b] = self.jobs[b], self.jobs[a]
            self._save()
            return self.view(job, who)

    def remove(self, who: Mapping[str, Any], job_id: str) -> dict[str, Any]:
        """A waiting song out of the line, one being made stopped, a finished one off the list."""
        cancel = ""
        with self.lock:
            job = self._job(job_id, who)
            if job["status"] in ACTIVE:
                cancel = str(job.get("comfy") or "")
                job["status"] = "cancelled"
                job["finished"] = self.clock()
                job["note"] = "stopped"
                result = self.view(job, who)
            else:
                self.jobs.remove(job)
                self._drop_source(job)
                result = {"id": job_id, "removed": True}
            self._save()
        if cancel:
            try:
                self.studio.cancel(cancel)
            except (StudioUnavailableError, StudioError):
                pass  # it is gone from ComfyUI already, or ComfyUI is gone
        return result

    # --- the source recordings ------------------------------------------------------------------------------
    def add_source(self, who: Mapping[str, Any], name: str, data: bytes) -> dict[str, Any]:
        allowed, why = self.may(who)
        if not allowed:
            raise MakerError(why, 403)
        if not (self.settings["covers"] or who.get("kind") == "admin"):
            raise MakerError("The host lets guests make new songs only, no covers.", 403)
        clean = Path(str(name or "")).name[:120] or "recording"
        suffix = Path(clean).suffix.lower()
        if suffix not in SOURCE_SUFFIXES:
            raise MakerError("An audio file: MP3, FLAC, WAV, OGG, M4A, OPUS, AAC or AIFF.", 415)
        if not data:
            raise MakerError("The file is empty.")
        if len(data) > SOURCE_LIMIT:
            raise MakerError(f"The recording is too large ({SOURCE_LIMIT // 2**20} MB at most).", 413)
        source_id = secrets.token_hex(8)
        self.sources.mkdir(parents=True, exist_ok=True)
        path = self.sources / f"{source_id}{suffix}"
        path.write_bytes(data)
        facts = other_music.probe(path)
        seconds = float(facts.get("seconds") or 0.0)
        title = str((facts.get("tags") or {}).get("title") or Path(clean).stem)
        meta = {
            "id": source_id,
            "name": clean,
            "title": title[:120],
            "seconds": round(seconds, 1),
            "bytes": len(data),
            "owner": {"kind": who.get("kind"), "id": who.get("id")},
            "added": self.clock(),
        }
        (self.sources / f"{source_id}.json").write_text(
            json.dumps(meta, ensure_ascii=False), encoding="utf-8"
        )
        return {k: meta[k] for k in ("id", "name", "title", "seconds", "bytes")}

    def _source(self, source_id: str, who: Mapping[str, Any]) -> dict[str, Any]:
        if not re.fullmatch(r"[0-9a-f]{16}", source_id):
            raise MakerError("No such recording - add it again.")
        try:
            meta = json.loads((self.sources / f"{source_id}.json").read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise MakerError("No such recording - add it again.") from error
        owner = meta.get("owner") or {}
        if who.get("kind") != "admin" and (owner.get("kind"), owner.get("id")) != (
            who.get("kind"),
            who.get("id"),
        ):
            raise MakerError("No such recording - add it again.")
        return {k: meta.get(k) for k in ("id", "name", "title", "seconds")}

    def _source_file(self, job: Mapping[str, Any]) -> Path | None:
        source = job.get("source") or {}
        if source.get("song"):  # a song of the library is the original
            song = self.library.song(str(source["song"]))
            return self._audio_of(song) if song is not None else None
        suffix = Path(str(source.get("name") or "")).suffix.lower()
        path = self.sources / f"{source.get('id')}{suffix}"
        return path if source.get("id") and path.is_file() else None

    def _drop_source(self, job: Mapping[str, Any]) -> None:
        source = job.get("source") or {}
        if not source.get("id") or any(
            j is not job and (j.get("source") or {}).get("id") == source["id"] for j in self.jobs
        ):
            return
        for path in self.sources.glob(f"{source['id']}*"):
            path.unlink(missing_ok=True)

    # --- what the page shows --------------------------------------------------------------------------------
    def estimate(self, job: Mapping[str, Any]) -> float:
        """Seconds the song takes to make: a fixed part and a part per second of music, times what this computer
        showed so far."""
        kind = self._work(job)
        base, per_second = PRIOR.get(kind, PRIOR["song"])
        return (base + per_second * self._seconds(job)) * self.rates.get(kind, 1.0)

    @staticmethod
    def _work(job: Mapping[str, Any]) -> str:
        """What a song's making is like: a new take of a song (no writing, no planning), a cover - also a new take of
        one, which reads its original's melody and words again -, a song."""
        if job.get("again") == "take" and job.get("kind") == "song":
            return "take"
        return str(job.get("kind") or "song")

    @staticmethod
    def _seconds(job: Mapping[str, Any]) -> float:
        """About how long the song will be."""
        if job.get("again") == "take" and (job.get("base") or {}).get("seconds"):
            return float(job["base"]["seconds"])
        if job.get("kind") == "cover":
            return float((job.get("source") or {}).get("seconds") or 0.0) or 180.0
        return length_seconds(str((job.get("fields") or {}).get("length") or ""))

    def _timeline(self) -> dict[str, tuple[float, float]]:
        """When each song in the making will be done, roughly: (start, ready) by job id."""
        now = self.clock()
        out: dict[str, tuple[float, float]] = {}
        t = now
        active = next((j for j in self.jobs if j["status"] in ACTIVE), None)
        line = self._waiting()
        first = active if active is not None else (line[0] if line else None)
        queue = self.studio_state.get("queue") or {}
        running = queue.get("running") or {}
        # what ComfyUI runs before the party's song (the owner's own runs): how long they take is not known -
        # half a song each
        ours = str((active or {}).get("comfy") or "")
        ahead = int(queue.get("pending") or 0) - (
            1 if ours and ours in (queue.get("pending_api") or []) else 0
        )
        ahead += 1 if running and running.get("id") != ours else 0
        if first is not None and (active is None or active["status"] != "running"):
            t += max(0, ahead) * 0.5 * self.estimate(first)
        if active is not None:
            elapsed = now - float(active.get("started") or now) if active["status"] == "running" else 0.0
            ready = t + max(30.0, self.estimate(active) - elapsed)
            out[active["id"]] = (t, ready)
            t = ready
        for job in line:
            ready = t + self.estimate(job)
            out[job["id"]] = (t, ready)
            t = ready
        return out

    def label(self, job: Mapping[str, Any]) -> str:
        """What identifies a song before it has a title: its style, its length, its voice."""
        fields = job.get("fields") or {}
        base = job.get("base") or {}
        if job.get("again") == "take":
            return f"New take of {base.get('title') or 'a song'}"
        minutes = re.search(r"\d+:\d\d", str(fields.get("length") or ""))
        parts = [fields.get("genre") or "", minutes.group(0) if minutes else ""]
        if job.get("kind") == "cover":
            parts = [
                f"Cover of {(job.get('source') or {}).get('title') or 'a song'}",
                fields.get("genre") or "",
            ]
        if fields.get("vocals") == "instrumental":
            parts.append("instrumental")
        else:
            parts.append(fields.get("voice") or fields.get("language") or "")
        if not parts[0] and fields.get("template") not in (None, "", "none"):
            parts[0] = str(fields["template"]).rsplit("/", 1)[-1].replace("-", " ")
        if job.get("again") == "song" and base.get("title"):
            parts.insert(0, f"Like {base['title']}")
        return " · ".join(p for p in parts if p) or "A new song"

    def view(
        self,
        job: Mapping[str, Any],
        who: Mapping[str, Any],
        timeline: Mapping[str, tuple[float, float]] | None = None,
    ) -> dict[str, Any]:
        timeline = self._timeline() if timeline is None else timeline
        mine = self._mine(who, job)
        admin = who.get("kind") == "admin"
        line = self._waiting()
        waiting = job["status"] == "waiting"
        position = next((k + 1 for k, j in enumerate(line) if j is job), None) if waiting else None
        movers = [j for j in line if admin or self._mine(who, j)]
        place = next((k for k, j in enumerate(movers) if j is job), -1) if waiting else -1
        when = timeline.get(job["id"])
        result = dict(job.get("result") or {}) or None
        out: dict[str, Any] = {
            "id": job["id"],
            "kind": job["kind"],
            "status": job["status"],
            "owner": {"kind": job["owner"].get("kind"), "name": job["owner"].get("name")},
            "mine": mine,
            "label": self.label(job),
            "description": str((job.get("fields") or {}).get("description") or "")[:240],
            "created": job.get("created"),
            "started": job.get("started"),
            "finished": job.get("finished"),
            "position": position,
            "eta": round(when[1]) if when else None,
            "starts": round(when[0]) if when and waiting else None,
            "estimate": round(self.estimate(job)),
            "stage": job.get("stage"),
            "progress": job.get("progress"),
            "result": result,
            "again": job.get("again"),
            "from": dict(job.get("base") or {}) or None,
            "group": job.get("group") or "",
            "number": job.get("number"),
            "of": job.get("of"),
            "takes_left": int(job.get("takes_left") or 0),
            "error": job.get("error") or "",
            "note": job.get("note") or "",
            # waiting to be released: for its maker to hear it first (``maker``), for an admin (``admin``); or
            # ``released``, ``discarded``, ``rejected`` (owner's request 2026-10-29)
            "release": job.get("release"),
            "can": {
                "edit": waiting and (mine or admin),
                "up": waiting and place > 0,
                "down": waiting and 0 <= place < len(movers) - 1,
                "delete": (mine or admin) and job.get("release") not in RELEASE_STEPS,
                "listen": (mine or admin) and job.get("release") in RELEASE_STEPS,
                "release": job.get("release") == "maker"
                and (mine or admin)
                or job.get("release") == "admin"
                and admin,
                "discard": job.get("release") == "maker"
                and (mine or admin)
                or job.get("release") == "admin"
                and admin,
            },
        }
        if mine or admin:
            out["fields"] = dict(job.get("fields") or {})
            out["source"] = dict(job.get("source") or {}) or None
            out["documents"] = dict(job.get("documents") or {})
            out["studio"] = dict(job.get("studio") or {}) or None
        return out

    def listing(self, who: Mapping[str, Any], *, everyone: bool = False) -> list[dict[str, Any]]:
        with self.lock:
            timeline = self._timeline()
            shown = [j for j in self.jobs if (everyone and who.get("kind") == "admin") or self._mine(who, j)]
            return [self.view(j, who, timeline) for j in shown]

    def status(self, who: Mapping[str, Any], *, everyone: bool = False) -> dict[str, Any]:
        allowed, why = self.may(who)
        admin = who.get("kind") == "admin"
        with self.lock:
            settings = (
                dict(self.settings)
                if admin
                else {
                    k: self.settings[k]
                    for k in ("covers", "max_length", "per_person", "credit", "listen_first", "approve")
                }
            )
            # the songs waiting for an admin's approval, everybody's (owner's request 2026-10-29)
            approvals = [self.view(j, who) for j in self.jobs if j.get("release") == "admin"] if admin else []
            waiting = len(self._waiting())
            making = any(j["status"] in ACTIVE for j in self.jobs)
            timeline = self._timeline()
        return {
            "on": bool(self.settings["on"]),
            "may": allowed,
            "why": why,
            "me": {
                "kind": who.get("kind"),
                "name": who.get("name") or GUEST_NAME,
                "full": self.full(who),
                "remote": bool(who.get("remote")),
            },
            "admin": admin,
            "settings": settings,
            "studio": {
                "reachable": bool(self.studio_state.get("reachable")),
                "error": str(self.studio_state.get("error") or "") if admin else "",
            },
            "line": {
                "waiting": waiting,
                "making": making,
                "free": round(max([t[1] for t in timeline.values()], default=self.clock())),
            },
            "jobs": self.listing(who, everyone=everyone),
            "approvals": approvals,
        }

    # --- the worker ---------------------------------------------------------------------------------------
    def start(self) -> None:
        if self._thread is None:
            self._thread = threading.Thread(target=self._run, name="plenio-party-songs", daemon=True)
            self._thread.start()

    def close(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=5)

    def _run(self) -> None:
        while not self._stop.wait(POLL_S):
            try:
                self.tick()
            except Exception as error:  # noqa: BLE001 - the worker goes on with the next song
                with self.lock:
                    self.studio_state["error"] = f"{type(error).__name__}: {error}"

    def _check_studio(self) -> None:
        now = self.clock()
        if now - float(self.studio_state.get("checked") or 0) < STUDIO_EVERY_S:
            return
        self.studio_state["checked"] = now
        try:
            self.studio_state["queue"] = self.studio.queue()
            self.studio_state["reachable"] = True
            self.studio_state["error"] = ""
        except (StudioUnavailableError, StudioError) as error:
            self.studio_state["reachable"] = False
            self.studio_state["queue"] = None
            self.studio_state["error"] = str(error)

    def tick(self) -> None:
        """One step: follow the song being made, or send the next one; forget old finished songs."""
        if self.launcher is not None:
            with self.lock:
                pending = any(j["status"] == "waiting" or j["status"] in ACTIVE for j in self.jobs)
            self.launcher.tick(waiting=pending)
        self._check_studio()
        with self.lock:
            now = self.clock()
            old = [
                j
                for j in self.jobs
                if j["status"] in FINISHED
                and j.get("release") not in RELEASE_STEPS
                and now - float(j.get("finished") or now) > KEEP_FINISHED_S
            ]
            for job in old:
                self.jobs.remove(job)
                self._drop_source(job)
            if old:
                self._save()
            self._clean_sources(now)
            active = next((j for j in self.jobs if j["status"] in ACTIVE), None)
            nxt = None if active is not None else next(iter(self._waiting()), None)
            if nxt is not None and self.studio_state.get("reachable"):
                nxt["status"] = "sending"
                self._save()
        if active is not None:
            self._follow(active)
        elif nxt is not None and nxt["status"] == "sending":
            self._send(nxt)

    def _clean_sources(self, now: float) -> None:
        if not self.sources.is_dir():
            return
        used = {(j.get("source") or {}).get("id") for j in self.jobs}
        for meta in self.sources.glob("*.json"):
            if meta.stem in used:
                continue
            try:
                if now - meta.stat().st_mtime > SOURCES_KEPT_S:
                    for path in self.sources.glob(f"{meta.stem}*"):
                        path.unlink(missing_ok=True)
            except OSError:
                pass

    def _party_release(self, owner: Mapping[str, Any], when: float) -> dict[str, Any]:
        date = _today(when)
        return {
            "folder": f"plenio/Party-Songs-{date}",
            "album": f"Party-Song {date}",
            "artist": str(owner.get("name") or GUEST_NAME) if owner.get("kind") != "guest" else GUEST_NAME,
        }

    def request_of(
        self, job: Mapping[str, Any], audio: str = "", base: Mapping[str, Any] | None = None
    ) -> dict[str, Any]:
        """The Song API request for a song: the form's fields, HQ mastering off, Cover Art on, the party's folder,
        album and artist - for a new take the song's own request (``base``: the Song API's ``/from-record``) with its
        documents as changed and a new take seed; with the whole studio every value as chosen."""
        owner = job.get("owner") or {}
        # a party song (ordered on the party's page): the day's party folder and album; every other song keeps the
        # template's folder and tags, as if made in ComfyUI (owner's request 2026-10-28). A job of 1.3 without the
        # mark: a guest's is a party song.
        party = owner.get("party", owner.get("kind") == "guest")
        request: dict[str, Any] = {
            "release": self._party_release(owner, float(job.get("sent") or self.clock())) if party else {},
            "client": {
                "name": "Plenio Player",
                "job": str(job.get("id")),
                "by": str(owner.get("name") or GUEST_NAME),
            },
            "strict": False,
        }
        if job.get("again") == "take" and base is not None:
            fields = dict(base.get("fields") or {})
            documents = {str(k): str(v) for k, v in (base.get("documents") or {}).items()}
            edits = dict(job.get("documents") or {})
            if (
                base.get("kind") == "song"
                and "lyrics" in edits
                and edits["lyrics"].strip() != documents.get("lyrics", "").strip()
            ):
                documents.pop("score", None)  # new words: the notes are planned anew for them
            documents.update(edits)
            request.update(
                template=str(base.get("template") or TEMPLATES[str(job.get("kind") or "song")]),
                documents=documents,
                seeds={k: v for k, v in (base.get("seeds") or {}).items() if k != "take"},
            )
            if job.get("full"):
                request["release"] = {**request["release"], **_own_release(base.get("release"))}
        else:
            fields = dict(job.get("fields") or {})
            if fields.get("vocals") in ("instrumental",):
                for name in SUNG_ONLY:
                    fields.pop(name, None)
            if job.get("kind") == "cover":
                if fields.get("vocals") != "new lyrics":
                    fields.pop("theme", None)
                fields["source.audio"] = audio
            fields = {k: v for k, v in fields.items() if v != "" or k in ("description",)}
            request["template"] = TEMPLATES[str(job.get("kind") or "song")]
        studio = job.get("studio") if job.get("full") else None
        if studio:
            fields.update(studio.get("fields") or {})
            request["release"] = {**request["release"], **(studio.get("release") or {})}
        else:
            fields["finish.hq_mastering"] = False
            fields["finish.cover_art"] = True
        request["fields"] = fields
        return request

    def _send(self, job: dict[str, Any]) -> None:
        job["sent"] = self.clock()
        try:
            audio = ""
            base = None
            if job.get("again") == "take":
                try:
                    _song, record = self._record(str((job.get("base") or {}).get("song") or ""))
                except MakerError as error:
                    raise StudioError(404, "not_found", "The song is no longer in the library.") from error
                if record is None:
                    raise StudioError(404, "not_found", "The song's record can no longer be read.")
                base = self.studio.from_record(record)
                if not (base.get("take") or {}).get("possible"):
                    raise StudioError(
                        409,
                        "no_take",
                        str((base.get("take") or {}).get("why") or "No new take of this song."),
                    )
            elif job["kind"] == "cover":
                path = self._source_file(job)
                if path is None:
                    raise StudioError(400, "missing_field", "The original recording is gone - add it again.")
                name = str((job.get("source") or {}).get("name") or path.name)
                audio = str(self.studio.upload(path, name if Path(name).suffix else path.name)["name"])
            request = self.request_of(job, audio, base)
            # a song that waits to be released is made into a folder of its own, which the library does not read
            job["hold"] = self._holds(job.get("owner") or {})
            if job["hold"]:
                job["final"] = str(request["release"].get("folder") or DEFAULT_FOLDER)
                request["release"] = {
                    **request["release"],
                    "folder": f"{job['final']}/{WAITING_DIR}/{job['id']}",
                }
            answer = self.studio.create(request, key=f"plenio-player-{job['id']}")
        except StudioUnavailableError as error:
            with self.lock:
                if job["status"] == "sending":
                    job["status"] = "waiting"
                    job["note"] = f"waiting for ComfyUI ({error})"
                    self._save()
            return
        except StudioError as error:
            with self.lock:
                job["status"] = "failed"
                job["finished"] = self.clock()
                job["error"] = str(error)
                self._save()
            return
        with self.lock:
            if job["status"] == "cancelled":  # deleted while it was being sent
                try:
                    self.studio.cancel(str(answer.get("id")))
                except (StudioUnavailableError, StudioError):
                    pass
                return
            job["comfy"] = str(answer.get("id") or "")
            job["status"] = "running" if answer.get("status") == "running" else "queued"
            job["note"] = ""
            if job["status"] == "running":
                job["started"] = float(answer.get("started_at") or self.clock())
            self._save()

    def _follow(self, job: dict[str, Any]) -> None:
        if job["status"] == "sending":
            return
        try:
            view = self.studio.job(str(job.get("comfy") or "-"))
        except StudioUnavailableError:
            with self.lock:
                job["note"] = "ComfyUI does not answer just now"
            return
        except StudioError as error:
            with self.lock:
                if error.status == 404:
                    # ComfyUI forgot it (a restart): the song goes back to the head of the line once
                    if not job.get("retried"):
                        job.update(
                            status="waiting", comfy=None, retried=True, note="ComfyUI restarted - made again"
                        )
                        self.jobs.remove(job)
                        first = next(
                            (k for k, j in enumerate(self.jobs) if j["status"] == "waiting"), len(self.jobs)
                        )
                        self.jobs.insert(first, job)
                    else:
                        job.update(
                            status="failed",
                            finished=self.clock(),
                            error="ComfyUI restarted and lost the song.",
                        )
                    self._save()
            return
        status = str(view.get("status") or "")
        with self.lock:
            if job["status"] == "cancelled":
                return
            job["note"] = ""
            if status == "queued":
                job["status"] = "queued"
                # ComfyUI runs other runs first (the owner's own): where it waits there
                position = int(view.get("queue_position") or 0)
                job["note"] = f"#{position} in ComfyUI's queue" if position > 1 else ""
            elif status == "running":
                job["status"] = "running"
                job["started"] = float(view.get("started_at") or job.get("started") or self.clock())
                job["stage"] = view.get("stage")
                job["progress"] = view.get("progress")
            elif status == "succeeded":
                job["status"] = "done"
                job["started"] = float(view.get("started_at") or job.get("started") or self.clock())
                job["finished"] = float(view.get("finished_at") or self.clock())
                job["stage"] = None
                job["progress"] = None
                self._learn(job)
                result = view.get("result") or {}
                job["result"] = {
                    "title": str(result.get("title") or ""),
                    "record": str(result.get("record") or ""),
                    "song": "",
                }
            elif status in ("failed", "cancelled"):
                job["status"] = status
                job["finished"] = float(view.get("finished_at") or self.clock())
                problem = view.get("error") or {}
                where = f" ({problem.get('title')})" if problem.get("title") else ""
                job["error"] = (
                    f"{problem.get('message') or 'the run stopped'}{where}" if status == "failed" else ""
                )
                job["stage"] = None
            self._save()
        if job["status"] == "done":
            self._file(job)

    def _learn(self, job: Mapping[str, Any]) -> None:
        """How long the song took against the estimate: the next estimates follow (half the old, half the new)."""
        took = float(job.get("finished") or 0) - float(job.get("started") or 0)
        kind = self._work(job)
        if took <= 10:
            return
        base, per_second = PRIOR.get(kind, PRIOR["song"])
        factor = max(0.25, min(4.0, took / (base + per_second * self._seconds(job))))
        self.rates[kind] = factor if kind not in self.rates else 0.5 * self.rates[kind] + 0.5 * factor

    # --- released, or not (owner's request 2026-10-29) ----------------------------------------------------
    def _holds(self, owner: Mapping[str, Any]) -> bool:
        """Whether a song waits to be released: one of a user or a guest while its maker hears it first or an admin
        approves it (the admin's and the helpers' songs are released at once)."""
        return owner.get("kind") != "admin" and bool(
            self.settings["listen_first"] or self.settings["approve"]
        )

    def _next_step(self, job: Mapping[str, Any], heard: bool = False) -> str | None:
        """What a song waits for now: its maker (not heard yet), an admin, or nothing (``None``: released)."""
        owner = job.get("owner") or {}
        if owner.get("kind") == "admin":
            return None
        if not heard and self.settings["listen_first"]:
            return "maker"
        return "admin" if self.settings["approve"] else None

    def _waiting_job(self, who: Mapping[str, Any], job_id: str) -> dict[str, Any]:
        job = self._job(job_id, who)
        if job.get("release") not in RELEASE_STEPS:
            raise MakerError("This song does not wait to be released.", 409)
        return job

    def listen(self, who: Mapping[str, Any], job_id: str, what: str = "audio") -> Path:
        """A song waiting to be released, to hear it first on one's own device: its audio (MP3 where there is one -
        every phone plays it) or its cover - for its maker and the admins only."""
        with self.lock:
            job = self._waiting_job(who, job_id)
            record = Path(str((job.get("result") or {}).get("record") or ""))
        try:
            data = json.loads(record.read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            raise MakerError("The song's files are not there.", 404) from error
        files = [f for f in data.get("files") or [] if isinstance(f, dict) and isinstance(f.get("name"), str)]
        if what == "cover":
            names = [f["name"] for f in files if f.get("role") == "cover"]
        else:
            main = [f for f in files if not f.get("role")]
            names = [f["name"] for k in ("mp3", "flac", "wav") for f in main if f.get("format") == k]
        for name in names:
            path = (record.parent / str(name)).resolve()
            if path.parent == record.parent.resolve() and path.is_file():
                return path
        raise MakerError("The song's file is not there.", 404)

    def release(self, who: Mapping[str, Any], job_id: str) -> dict[str, Any]:
        """Release a waiting song: its maker after hearing it (then an admin approves it, where they must), an
        admin approving it. Released, it moves to its folder and Live Play takes it in as a new song."""
        admin = who.get("kind") == "admin"
        with self.lock:
            job = self._waiting_job(who, job_id)
            if job["release"] == "admin" and not admin:
                raise MakerError("An admin releases it - it waits for their approval.", 403)
            step = self._next_step(job, heard=True) if job["release"] == "maker" else None
            if step == "admin" and not admin:
                job["release"] = "admin"
                job["heard"] = self.clock()
                self._save()
                return self.view(job, who)
        self._publish(job)
        with self.lock:
            return self.view(job, who)

    def discard(self, who: Mapping[str, Any], job_id: str) -> dict[str, Any]:
        """Not released: by its maker after hearing it, or rejected by an admin. Its files go to the folder ``not
        released`` beside the waiting songs - nothing is deleted."""
        admin = who.get("kind") == "admin"
        with self.lock:
            job = self._waiting_job(who, job_id)
            if job["release"] == "admin" and not admin:
                raise MakerError("An admin decides about it now.", 403)
            record = Path(str((job.get("result") or {}).get("record") or ""))
            folder = record.parent
            if folder.is_dir() and folder.parent.name == WAITING_DIR:
                target = folder.parent / NOT_RELEASED / folder.name
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(folder), str(target))
                job["result"]["record"] = str(target / record.name)
            job["release"] = "discarded" if self._mine(who, job) and job["release"] == "maker" else "rejected"
            job["decided"] = self.clock()
            self._save()
            return self.view(job, who)

    def _publish(self, job: dict[str, Any]) -> None:
        """A released song from its waiting folder into its release folder, then into the library."""
        record = Path(str((job.get("result") or {}).get("record") or ""))
        folder = record.parent
        if folder.is_dir() and folder.parent.name == WAITING_DIR:
            record = move_song(folder, folder.parent.parent)
        with self.lock:
            job["result"]["record"] = str(record)
            job["release"] = "released"
            job["decided"] = self.clock()
            self._save()
        self._into_library(job)

    def _file(self, job: dict[str, Any]) -> None:
        """A finished song: waiting to be released (its maker hears it first, an admin approves it), or released
        into the library."""
        if job.get("hold") and job.get("release") is None:
            step = self._next_step(job)
            if step is not None:
                with self.lock:
                    job["release"] = step
                    self._save()
                return
            self._publish(job)
            return
        self._into_library(job)

    def _into_library(self, job: dict[str, Any]) -> None:
        """The finished song into the library: its record's folder is read (added when it is outside the
        library's folders), so Live Play takes it in as a new song."""
        record = Path(str((job.get("result") or {}).get("record") or ""))
        if not record.name:
            return
        self.library.expect(record)
        found = self._song_of(record)
        if found is None and record.parent.is_dir():
            folder = str(record.parent.resolve())
            with self.lock:
                if folder not in self.folders:
                    self.folders.append(folder)
                    self.library.extra = [Path(f) for f in self.folders]
                    self._save()
            found = self._song_of(record)
        if found is not None:
            with self.lock:
                job["result"]["song"] = found
                self._save()
            self._add_takes(job, found)

    def _song_of(self, record: Path) -> str | None:
        self.library.scan(force=True)
        found = self.library.find_record(record)
        return found.id if found is not None else None
