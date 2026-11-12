"""Player API v1 (phase 5.8, PD §8.3): a small, stable set of the player's routes under ``/api/v1``, for remote
controls, stream decks and home automation. The page's own ``/api/...`` routes stay nobody's contract.

The answers are made here; ``server.py`` routes the requests and ``remote.py`` carries commands to the page that
plays. The OpenAPI document is ``openapi()`` (its copy: ``docs/api/player-openapi.json``, written by
``tools/api_docs.py``).
"""

from __future__ import annotations

import copy
from collections.abc import Callable, Mapping
from typing import Any
from urllib.parse import quote

from .. import __version__

API = "plenio-player-api"
VERSION = "1.0"
BASE = "/api/v1"
SONGS_LIMIT = 500
EVENT_KINDS = ("now", "queue", "live", "reaction")
ERROR_CODES = (
    "bad_request",
    "invalid_value",
    "missing_field",
    "not_found",
    "unauthorized",
    "no_player",
    "busy",
)

ROUTES: tuple[tuple[str, str, str], ...] = (
    ("GET", "", "index"),
    ("GET", "/openapi.json", "openapi"),
    ("GET", "/now", "now"),
    ("POST", "/transport", "transport"),
    ("GET", "/songs", "songs"),
    ("POST", "/queue", "queue"),
    ("GET", "/live", "live"),
    ("POST", "/live", "live_set"),
    ("GET", "/events", "events"),
)
"""Method, path under ``BASE`` and the operation's name: every route of the Player API (a test holds the server,
the document and the guide to it)."""


def index() -> dict[str, Any]:
    return {
        "api": API,
        "version": VERSION,
        "player": __version__,
        "paths": {name: f"{BASE}{path}" for _, path, name in ROUTES if name != "live_set"},
    }


def song_view(summary: Mapping[str, Any]) -> dict[str, Any]:
    """A song as the Player API shows it (from the library's summary)."""
    song_id = str(summary.get("id"))
    tags = part(summary, "tags")
    has = part(summary, "has")
    out: dict[str, Any] = {
        "id": song_id,
        "title": str(summary.get("title") or ""),
        "seconds": float(summary.get("seconds") or 0.0),
        "created": str(summary.get("created") or ""),
        "genre": str(summary.get("genre") or ""),
        "mood": str(summary.get("mood") or ""),
        "artist": str(summary.get("artist") or tags.get("artist") or ""),
        "album": str(summary.get("album") or tags.get("album") or ""),
        "audio": f"/media/{quote(song_id)}/audio" if has.get("audio") else None,
        "cover": f"/media/{quote(song_id)}/cover" if has.get("cover") else None,
    }
    if not summary.get("other"):
        out["page"] = f"/page/{quote(song_id)}"
    return out


def now_answer(
    shown: Mapping[str, Any] | None, summary_of: Callable[[str], Mapping[str, Any] | None]
) -> dict[str, Any]:
    """``GET /now``: the page's report (``remote.PlayerRemote.now``) with its songs written out."""
    if shown is None:
        return {"page": False, "playing": False, "song": None, "position": 0.0, "duration": 0.0, "next": [],
                "queue_length": 0, "live": None}  # fmt: skip

    def view(song_id: Any) -> dict[str, Any] | None:
        summary = summary_of(str(song_id)) if song_id else None
        return song_view(summary) if summary else None

    current = part(shown, "now")
    nxt = shown.get("next")
    following = [view(i) for i in (nxt if isinstance(nxt, list) else [])[:3] if isinstance(i, str)]
    live = part(shown, "live")
    return {
        "page": True,
        "playing": bool(shown.get("playing")),
        "song": view(current.get("id")) if current else None,
        "position": _seconds(shown.get("position")),
        "duration": _seconds(shown.get("duration")),
        "next": [song for song in following if song],
        "queue_length": int(shown.get("queue_length") or 0),
        "live": {k: live[k] for k in ("on", "insert", "auto", "atEnd") if k in live},
        "reported": _seconds(shown.get("reported")),
    }


def part(data: Mapping[str, Any], key: str) -> dict[str, Any]:
    """``data[key]`` when it is an object, else an empty one (a page's report may hold anything)."""
    value = data.get(key)
    return dict(value) if isinstance(value, Mapping) else {}


def live_answer(shown: Mapping[str, Any] | None) -> dict[str, Any]:
    if shown is None:
        return {"page": False, "on": False}
    live = part(shown, "live")
    return {"page": True, **{k: live[k] for k in ("on", "insert", "auto", "atEnd") if k in live}}


def _seconds(value: Any) -> float:
    return round(float(value), 2) if isinstance(value, (int, float)) and not isinstance(value, bool) else 0.0


def error(code: str, message: str, hint: str = "") -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "hint": hint}}


# --- the OpenAPI document ---------------------------------------------------------------------------------------


def _ref(name: str) -> dict[str, str]:
    return {"$ref": f"#/components/schemas/{name}"}


def _json_body(name: str) -> dict[str, Any]:
    return {"required": True, "content": {"application/json": {"schema": _ref(name)}}}


def _answer(name: str, text: str) -> dict[str, Any]:
    return {"description": text, "content": {"application/json": {"schema": _ref(name)}}}


ERRORS = {
    "400": _answer("Error", "the request is not what the endpoint takes"),
    "401": _answer("Error", "from the network without a login of the player"),
}

SCHEMAS: dict[str, Any] = {
    "Error": {
        "type": "object",
        "properties": {"error": {"type": "object", "properties": {
            "code": {"type": "string", "enum": list(ERROR_CODES)},
            "message": {"type": "string"}, "hint": {"type": "string"},
        }, "required": ["code", "message"]}},
        "required": ["error"],
    },
    "Song": {
        "type": "object",
        "properties": {
            "id": {"type": "string"}, "title": {"type": "string"}, "seconds": {"type": "number"},
            "created": {"type": "string"}, "genre": {"type": "string"}, "mood": {"type": "string"},
            "artist": {"type": "string"}, "album": {"type": "string"},
            "audio": {"type": ["string", "null"], "description": "the audio file's address on the player"},
            "cover": {"type": ["string", "null"], "description": "the cover picture's address on the player"},
            "page": {"type": "string", "description": "the song's page (not for music made elsewhere)"},
        },
        "required": ["id", "title", "seconds"],
    },
    "Live": {
        "type": "object",
        "properties": {
            "on": {"type": "boolean"},
            "insert": {"type": "string", "enum": ["next", "end", "random"], "description": "where a new song goes"},
            "auto": {"type": "boolean", "description": "new songs from ComfyUI join by themselves"},
            "atEnd": {"type": "string", "enum": ["again", "wait"], "description": "from the top again, or wait"},
        },
    },
    "Now": {
        "type": "object",
        "properties": {
            "page": {"type": "boolean", "description": "a player page reports (false: none is open)"},
            "playing": {"type": "boolean"},
            "song": {"oneOf": [_ref("Song"), {"type": "null"}]},
            "position": {"type": "number", "description": "seconds; estimated from the page's last report"},
            "duration": {"type": "number"},
            "next": {"type": "array", "items": _ref("Song"), "maxItems": 3},
            "queue_length": {"type": "integer"},
            "live": {"oneOf": [_ref("Live"), {"type": "null"}]},
            "reported": {"type": "number", "description": "seconds since the page's last report"},
        },
        "required": ["page", "playing", "song", "next"],
    },
    "Transport": {
        "type": "object",
        "properties": {
            "do": {"type": "string", "enum": ["play", "pause", "toggle", "next", "previous", "seek"]},
            "seconds": {"type": "number", "minimum": 0, "description": "for seek: from the song's start"},
        },
        "required": ["do"],
    },
    "QueueAdd": {
        "type": "object",
        "properties": {"id": {"type": "string"}, "where": {"type": "string", "enum": ["next", "end"],
                                                          "default": "end"}},
        "required": ["id"],
    },
    "Sent": {
        "type": "object",
        "properties": {"sent": {"type": "integer", "description": "the command's number"}},
        "required": ["sent"],
    },
    "Songs": {
        "type": "object",
        "properties": {"songs": {"type": "array", "items": _ref("Song")}, "total": {"type": "integer"}},
        "required": ["songs", "total"],
    },
    "Index": {
        "type": "object",
        "properties": {"api": {"type": "string"}, "version": {"type": "string"}, "player": {"type": "string"},
                       "paths": {"type": "object", "additionalProperties": {"type": "string"}}},
    },
}  # fmt: skip

NO_PLAYER = _answer("Error", "no player page is open for this account (code no_player)")


def openapi() -> dict[str, Any]:
    sent = {"202": _answer("Sent", "sent to the page that plays; it acts within a second"), "409": NO_PLAYER}
    paths: dict[str, Any] = {
        BASE: {"get": {"operationId": "index", "summary": "The API's name, version and paths",
                       "responses": {"200": _answer("Index", "the index")}}},
        f"{BASE}/openapi.json": {"get": {"operationId": "openapi", "summary": "This document",
                                         "responses": {"200": {"description": "OpenAPI 3.1"}}}},
        f"{BASE}/now": {"get": {
            "operationId": "now", "summary": "The song that plays, the position, the next three",
            "responses": {"200": _answer("Now", "what the page that plays reported"), **ERRORS},
        }},
        f"{BASE}/transport": {"post": {
            "operationId": "transport", "summary": "Play, pause, toggle, next, previous or seek",
            "requestBody": _json_body("Transport"), "responses": {**sent, **ERRORS},
        }},
        f"{BASE}/songs": {"get": {
            "operationId": "songs", "summary": "The library, searched as the page searches",
            "parameters": [
                {"name": "q", "in": "query", "schema": {"type": "string"},
                 "description": "free words, field filters (genre:pop, bpm:>100, #party, is:fav ...), quotes, -"},
                {"name": "limit", "in": "query", "schema": {"type": "integer", "minimum": 1,
                                                            "maximum": SONGS_LIMIT, "default": 50}},
            ],
            "responses": {"200": _answer("Songs", "the best matches first, then the newest"), **ERRORS},
        }},
        f"{BASE}/queue": {"post": {
            "operationId": "queue", "summary": "Add a song to play next or at the end",
            "requestBody": _json_body("QueueAdd"),
            "responses": {**sent, "404": _answer("Error", "no such song"), **ERRORS},
        }},
        f"{BASE}/live": {
            "get": {"operationId": "live", "summary": "Live Play: on or off, and its rules",
                    "responses": {"200": {"description": "Live Play as the page that plays has it",
                                          "content": {"application/json": {"schema": _ref("Live")}}}, **ERRORS}},
            "post": {"operationId": "live_set", "summary": "Start or stop Live Play, or change its rules",
                     "requestBody": _json_body("Live"), "responses": {**sent, **ERRORS}},
        },
        f"{BASE}/events": {"get": {
            "operationId": "events", "summary": "Server-Sent Events: now, queue, live, reaction",
            "description": "Each event has an id; reconnect with Last-Event-ID. The first event is a now.",
            "responses": {"200": {"description": "text/event-stream",
                                  "content": {"text/event-stream": {"schema": {"type": "string"}}}},
                          "503": _answer("Error", "too many streams are open (code busy)"), **ERRORS},
        }},
    }  # fmt: skip
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Plenio Player API",
            "version": VERSION,
            "description": (
                "A small, stable set of the Plenio Player's routes for remote controls, stream decks and home "
                "automation. This computer needs nothing; another device logs in to the player (its session "
                "cookie). Requests that change something send JSON. Commands reach the page that plays; the "
                "player's page plays the music, so a command needs an open player page."
            ),
        },
        "servers": [{"url": "http://127.0.0.1:8765"}],
        "paths": paths,
        "components": {"schemas": copy.deepcopy(SCHEMAS)},
    }
