"""Plenio for AI assistants: a Model Context Protocol server over standard input and output.

An assistant that speaks MCP (Claude Desktop, Claude Code, an editor's agent ...) can then be asked for "a bossa nova
about rain on a tin roof": it orders the song from ComfyUI's Song API, follows it, and plays it in the Plenio
Player. Standard library only, built on ``docs/api/examples/plenio_client.py``. It opens no port and talks only to
this computer (127.0.0.1): ComfyUI at ``PLENIO_API`` (default ``http://127.0.0.1:8188``) and the player at
``PLENIO_PLAYER`` (default ``http://127.0.0.1:8765``).

    python plenio_mcp.py            # started by the assistant, not by hand - see docs/api/mcp.md

Tools: ``make_song``, ``job_status``, ``list_songs``, ``song_details``, ``play_in_player``.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from pathlib import Path
from typing import Any, TextIO

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "docs" / "api" / "examples"))
from plenio_client import Plenio, PlenioError  # noqa: E402 - the client beside the API's guide

SERVER = {"name": "plenio", "version": "1.0"}
PROTOCOLS = ("2025-06-18", "2025-03-26", "2024-11-05")
LOOPBACK = ("127.0.0.1", "localhost", "[::1]", "::1")
INSTRUCTIONS = (
    "Plenio makes songs with local music models in ComfyUI. make_song starts a song and answers at once with a job "
    "id; a song takes minutes. Follow it with job_status (wait_seconds up to 60), then offer play_in_player. "
    "list_songs and song_details read the songs already made."
)

TOOLS: list[dict[str, Any]] = [
    {
        "name": "make_song",
        "description": (
            "Start a new song from a description (what it is about and how it sounds). Answers at once with the "
            "job's id; the song takes a few minutes - follow it with job_status."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "description": {"type": "string", "description": "what the song is about and how it should sound"},
                "genre": {"type": "string", "description": "e.g. 'bossa nova', 'indie pop'"},
                "length": {"type": "string", "description": "e.g. 'short (about 1:30)', 'about 2:30', '3:15', '150'"},
                "vocals": {"type": "string", "enum": ["sung", "sparse vocals", "instrumental"]},
                "language": {"type": "string", "description": "the lyrics' language, e.g. 'German'"},
                "own_lyrics": {"type": "string", "description": "lyrics to sing as written (else they are written)"},
            },
            "required": ["description"],
        },
    },
    {
        "name": "job_status",
        "description": "How a song job stands: queued, running (with its stage), succeeded (with the song), failed.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "the job's id from make_song"},
                "wait_seconds": {"type": "integer", "minimum": 0, "maximum": 60,
                                 "description": "wait up to this long for a change (default 0)"},
            },
            "required": ["id"],
        },
    },
    {
        "name": "list_songs",
        "description": "The songs made with Plenio, newest first; a query keeps those with its words in title or date.",
        "inputSchema": {
            "type": "object",
            "properties": {"query": {"type": "string"}, "limit": {"type": "integer", "minimum": 1, "maximum": 100}},
        },
    },
    {
        "name": "song_details",
        "description": "One song: title, length, files, its lyrics and style.",
        "inputSchema": {
            "type": "object",
            "properties": {"id": {"type": "string", "description": "a song id from list_songs or job_status"}},
            "required": ["id"],
        },
    },
    {
        "name": "play_in_player",
        "description": (
            "Play a song in the Plenio Player: next after the song that plays, or at once when nothing plays. "
            "Needs the player open in a browser on this computer; otherwise answers with its address."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {"id": {"type": "string", "description": "a song id from list_songs or job_status"}},
            "required": ["id"],
        },
    },
]  # fmt: skip


class ToolError(Exception):
    """A tool's failure, told to the assistant as the tool's result (``isError``)."""


def _loopback(url: str) -> str:
    host = urllib.parse.urlsplit(url).hostname or ""
    if host not in LOOPBACK:
        raise SystemExit(f"plenio_mcp talks only to this computer; {url!r} is not a loopback address.")
    return url.rstrip("/")


class Tools:
    """The tools, over the Song API (``Plenio``) and the Player API."""

    def __init__(self, api: str, player: str, token: str = "") -> None:
        self.plenio = Plenio(_loopback(api), token)
        self.player = _loopback(player)

    # -- the tools ---------------------------------------------------------------------------------------------

    def make_song(self, description: str, genre: str = "", length: str = "", vocals: str = "", language: str = "",
                  own_lyrics: str = "") -> dict[str, Any]:  # fmt: skip
        fields: dict[str, Any] = {"description": description}
        if genre:
            fields["genre"] = genre
        if length:
            fields["length"] = length
        if vocals:
            fields["vocals"] = vocals
        if language and vocals != "instrumental":
            fields["language"] = language
        if own_lyrics:
            fields["lyrics_from"] = "my own, sung as written below"
            fields["lyrics"] = own_lyrics
        job = self.plenio.make_song("yue2-song", fields, client="plenio_mcp.py")
        return {**_job(job), "next": "Follow it with job_status (a song takes a few minutes)."}

    def job_status(self, id: str, wait_seconds: int = 0) -> dict[str, Any]:  # noqa: A002 - the tool's own word
        return _job(self.plenio.job(id, wait=max(0, min(60, int(wait_seconds)))))

    def list_songs(self, query: str = "", limit: int = 20) -> dict[str, Any]:
        songs = self.plenio.songs(query)[: max(1, min(100, int(limit)))]
        return {"songs": [{k: s.get(k) for k in ("id", "title", "created", "seconds")} for s in songs]}

    def song_details(self, id: str) -> dict[str, Any]:  # noqa: A002
        song = self.plenio.song(id)
        documents = song.get("documents") or {}
        return {
            **{k: song.get(k) for k in ("id", "title", "created", "seconds", "plenio")},
            "files": [{"name": f.get("name"), "role": f.get("role")} for f in song.get("files") or []],
            **{kind: (documents.get(kind) or {}).get("text", "") for kind in ("style", "lyrics")},
        }

    def play_in_player(self, id: str) -> dict[str, Any]:  # noqa: A002
        relative = _relative(id)
        found = self._player(
            "GET", "/api/v1/songs?" + urllib.parse.urlencode({"record": relative, "limit": 1})
        )
        if not found or not found.get("songs"):
            raise ToolError(
                f"The player does not know this song. Is it running (at {self.player}) with ComfyUI's output folder? "
                "Start it from ComfyUI (Plenio Player button) or with `python plenio_player.py`."
            )
        song = found["songs"][0]
        page = f"{self.player}/#/song/{song['id']}"
        now = self._player("GET", "/api/v1/now") or {}
        if not now.get("page"):
            return {
                "played": False,
                "open": page,
                "why": "No player page is open: open this address in a browser.",
            }
        playing = bool(now.get("song"))
        self._player("POST", "/api/v1/queue", {"id": song["id"], "where": "next"})
        if playing:
            self._player("POST", "/api/v1/transport", {"do": "next"})
        return {"played": True, "title": song.get("title"), "page": page}

    # -- inside ------------------------------------------------------------------------------------------------

    def _player(self, method: str, path: str, body: Any = None) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(
            self.player + path, data=data, method=method, headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(request, timeout=10) as answer:  # noqa: S310 - a loopback address only
                return json.loads(answer.read() or b"null")
        except urllib.error.HTTPError as error:
            try:
                problem = json.loads(error.read()).get("error") or {}
            except ValueError:
                problem = {}
            raise ToolError(f"The player refused: {problem.get('message') or error.reason}") from None
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            raise ToolError(
                f"The Plenio Player does not answer at {self.player}. Start it from ComfyUI (Plenio Player button) "
                "or with `python plenio_player.py`, and open it in a browser."
            ) from None

    def call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        tool: Callable[..., dict[str, Any]] | None = getattr(self, name, None) if name in NAMES else None
        if tool is None:
            raise ToolError(f"There is no tool {name!r}.")
        try:
            return tool(**arguments)
        except TypeError as error:
            raise ToolError(f"The arguments do not fit {name}: {error}") from None
        except PlenioError as error:
            raise ToolError(f"{error.message} {error.hint}".strip()) from None


NAMES = frozenset(tool["name"] for tool in TOOLS)


def _relative(song_id: str) -> str:
    """The record's place inside ComfyUI's output folder, which a Song API song id carries (``core/api/songs.py``)."""
    import base64
    import binascii

    try:
        text = base64.urlsafe_b64decode(song_id + "=" * (-len(song_id) % 4)).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError, ValueError):
        raise ToolError(f"{song_id!r} is not a song id (list_songs gives them).") from None
    if not text.endswith(".plenio.json") or ".." in text.split("/"):
        raise ToolError(f"{song_id!r} is not a song id (list_songs gives them).")
    return text


def _job(job: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {"id": job.get("id"), "status": job.get("status")}
    if job.get("queue_position"):
        out["queue_position"] = job["queue_position"]
    if (job.get("stage") or {}).get("text"):
        out["stage"] = job["stage"]["text"]
    if job.get("waiting_at"):
        out["waiting_at"] = job["waiting_at"]
    if job.get("status") == "succeeded":
        result = job.get("result") or {}
        out["song"] = {k: result.get(k) for k in ("song", "title", "seconds") if result.get(k) is not None}
    if job.get("error"):
        out["error"] = {k: job["error"].get(k) for k in ("code", "message") if job["error"].get(k)}
    return out


# --- JSON-RPC over standard input and output ---------------------------------------------------------------------


def handle(message: dict[str, Any], tools: Tools) -> dict[str, Any] | None:
    """The answer to one message (``None`` for a notification)."""
    method = message.get("method")
    ident = message.get("id")
    params = message.get("params") or {}
    if ident is None:  # a notification: notifications/initialized, notifications/cancelled
        return None

    def ok(result: Any) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": ident, "result": result}

    def fail(code: int, text: str) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": ident, "error": {"code": code, "message": text}}

    if method == "initialize":
        asked = params.get("protocolVersion")
        return ok({
            "protocolVersion": asked if asked in PROTOCOLS else PROTOCOLS[0],
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": SERVER,
            "instructions": INSTRUCTIONS,
        })  # fmt: skip
    if method == "ping":
        return ok({})
    if method == "tools/list":
        return ok({"tools": TOOLS})
    if method == "tools/call":
        name = params.get("name")
        arguments = params.get("arguments") or {}
        if not isinstance(name, str) or not isinstance(arguments, dict):
            return fail(-32602, "tools/call needs a name and an object of arguments")
        try:
            result = tools.call(name, arguments)
        except ToolError as error:
            return ok({"content": [{"type": "text", "text": str(error)}], "isError": True})
        text = json.dumps(result, ensure_ascii=False, indent=1)
        return ok(
            {"content": [{"type": "text", "text": text}], "structuredContent": result, "isError": False}
        )
    return fail(-32601, f"no method {method!r}")


def serve(tools: Tools, source: TextIO, sink: TextIO) -> None:
    """Read one JSON-RPC message per line, answer each on its own line, until the input ends."""
    for line in source:
        if not line.strip():
            continue
        try:
            message = json.loads(line)
        except ValueError:
            answer: dict[str, Any] | None = {"jsonrpc": "2.0", "id": None,
                                             "error": {"code": -32700, "message": "not JSON"}}  # fmt: skip
        else:
            answer = handle(message, tools) if isinstance(message, dict) else None
        if answer is not None:
            sink.write(json.dumps(answer, ensure_ascii=False) + "\n")
            sink.flush()


def main() -> int:
    tools = Tools(
        os.environ.get("PLENIO_API", "http://127.0.0.1:8188"),
        os.environ.get("PLENIO_PLAYER", "http://127.0.0.1:8765"),
    )
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    sys.stdin.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
    serve(tools, sys.stdin, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
