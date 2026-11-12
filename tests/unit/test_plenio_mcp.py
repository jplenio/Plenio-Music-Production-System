"""plenio_mcp.py (phase 5.9): a scripted JSON-RPC session - initialize, the tools, their calls - with a stand-in for
the Song API and a real Plenio Player (the host tier runs it against ComfyUI: tests/host/test_api_examples.py)."""

from __future__ import annotations

import base64
import importlib.util
import io
import json
import sys
import threading
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player.library import Library
from plenio.player.server import State, serve

ROOT = Path(__file__).resolve().parents[2]


def _load() -> Any:
    spec = importlib.util.spec_from_file_location("plenio_mcp", ROOT / "plenio_mcp.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules["plenio_mcp"] = module
    spec.loader.exec_module(module)
    return module


mcp = _load()


class FakeSongApi:
    """What plenio_client.Plenio answers, scripted."""

    def __init__(self) -> None:
        self.made: list[tuple[str, dict[str, Any]]] = []

    def make_song(self, template: str, fields: dict[str, Any], **_: Any) -> dict[str, Any]:
        self.made.append((template, fields))
        return {"id": "job_00000000000000aa", "status": "queued", "queue_position": 1}

    def job(self, job_id: str, wait: float = 0) -> dict[str, Any]:
        if job_id == "job_gone":
            raise mcp.PlenioError(404, "not_found", "There is no job 'job_gone'.", "List the jobs.")
        return {
            "id": job_id,
            "status": "succeeded",
            "result": {"song": SONG_ID, "title": "Tin Roof", "seconds": 91.0},
        }

    def songs(self, query: str = "") -> list[dict[str, Any]]:
        return [{"id": SONG_ID, "title": "Tin Roof", "created": "2026-11-12", "seconds": 91.0, "files": {}}]

    def song(self, song_id: str) -> dict[str, Any]:
        return {"id": song_id, "title": "Tin Roof", "seconds": 91.0, "files": [{"name": "Tin Roof.flac"}],
                "documents": {"lyrics": {"text": "[Verse]\nrain on the roof"}, "style": {"text": "bossa nova"}}}  # fmt: skip


SONG_ID = base64.urlsafe_b64encode(b"plenio/Tin Roof.plenio.json").decode().rstrip("=")


@pytest.fixture
def player(tmp_path: Path) -> Iterator[str]:
    folder = tmp_path / "output" / "plenio"
    folder.mkdir(parents=True)
    record = {"schema": "plenio.record/1", "title": "Tin Roof", "created": "2026-11-12T10:00:00Z",
              "audio": {"seconds": 91.0}, "files": [{"name": "Tin Roof.flac", "format": "flac"}]}  # fmt: skip
    (folder / "Tin Roof.plenio.json").write_text(json.dumps(record), encoding="utf-8")
    (folder / "Tin Roof.flac").write_bytes(b"x" * 100)
    library = Library([tmp_path / "output"], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{running.server_address[1]}"
    running.shutdown()
    running.server_close()


def session(tools: Any, *messages: dict[str, Any]) -> list[dict[str, Any]]:
    source = io.StringIO("".join(json.dumps(m) + "\n" for m in messages) + "not json\n")
    sink = io.StringIO()
    mcp.serve(tools, source, sink)
    return [json.loads(line) for line in sink.getvalue().splitlines()]


def call(n: int, name: str, **arguments: Any) -> dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": n,
        "method": "tools/call",
        "params": {"name": name, "arguments": arguments},
    }


def test_a_session_from_initialize_to_playing_the_song(player: str) -> None:
    tools = mcp.Tools("http://127.0.0.1:8188", player)
    fake = FakeSongApi()
    tools.plenio = fake
    answers = session(
        tools,
        {"jsonrpc": "2.0", "id": 1, "method": "initialize",
         "params": {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "test"}}},
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
        call(3, "make_song", description="rain on a tin roof", genre="bossa nova", vocals="instrumental",
             language="German"),
        call(4, "job_status", id="job_00000000000000aa", wait_seconds=5),
        call(5, "list_songs", query="roof"),
        call(6, "song_details", id=SONG_ID),
        call(7, "play_in_player", id=SONG_ID),
        call(8, "job_status", id="job_gone"),
        call(9, "no_such_tool"),
        {"jsonrpc": "2.0", "id": 10, "method": "ping"},
        {"jsonrpc": "2.0", "id": 11, "method": "resources/list"},
    )  # fmt: skip
    by_id = {a.get("id"): a for a in answers}
    assert by_id[1]["result"]["protocolVersion"] == "2025-06-18"
    assert by_id[1]["result"]["capabilities"] == {"tools": {"listChanged": False}}
    names = [t["name"] for t in by_id[2]["result"]["tools"]]
    assert names == ["make_song", "job_status", "list_songs", "song_details", "play_in_player"]
    made = by_id[3]["result"]["structuredContent"]
    assert made["id"] == "job_00000000000000aa" and made["status"] == "queued"
    assert fake.made == [("yue2-song", {"description": "rain on a tin roof", "genre": "bossa nova",
                                        "vocals": "instrumental"})]  # fmt: skip
    assert by_id[4]["result"]["structuredContent"]["song"] == {
        "song": SONG_ID,
        "title": "Tin Roof",
        "seconds": 91.0,
    }
    assert by_id[5]["result"]["structuredContent"]["songs"][0]["title"] == "Tin Roof"
    assert by_id[6]["result"]["structuredContent"]["style"] == "bossa nova"
    played = by_id[7]["result"]["structuredContent"]
    assert played["played"] is False and played["open"].startswith(player + "/#/song/")  # no page open
    assert by_id[8]["result"]["isError"] and "no job" in by_id[8]["result"]["content"][0]["text"]
    assert by_id[9]["result"]["isError"]
    assert by_id[10]["result"] == {}
    assert by_id[11]["error"]["code"] == -32601
    assert by_id[None]["error"]["code"] == -32700  # the line that is not JSON


def test_play_in_player_queues_on_the_open_page(player: str) -> None:
    import urllib.request

    tools = mcp.Tools("http://127.0.0.1:8188", player)
    found = json.load(urllib.request.urlopen(f"{player}/api/v1/songs"))["songs"][0]
    shown = {"page": "tv", "playing": True, "now": {"id": found["id"]}, "next": []}
    request = urllib.request.Request(f"{player}/api/remote/now", data=json.dumps(shown).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")  # fmt: skip
    urllib.request.urlopen(request).read()
    assert tools.play_in_player(SONG_ID) == {
        "played": True,
        "title": "Tin Roof",
        "page": f"{player}/#/song/{found['id']}",
    }
    commands = json.load(urllib.request.urlopen(f"{player}/api/remote/commands?page=tv&after=0&wait=0"))[
        "commands"
    ]
    assert [c["do"] for c in commands] == ["queue", "next"]


def test_only_this_computer_and_own_lyrics() -> None:
    with pytest.raises(SystemExit):
        mcp.Tools("http://192.168.1.5:8188", "http://127.0.0.1:8765")
    tools = mcp.Tools("http://127.0.0.1:8188", "http://127.0.0.1:9")
    fake = FakeSongApi()
    tools.plenio = fake
    tools.make_song("a lullaby", own_lyrics="[Verse]\nsleep now")
    assert fake.made[0][1]["lyrics_from"] == "my own, sung as written below"
    with pytest.raises(mcp.ToolError):
        tools.play_in_player("not-an-id")
    with pytest.raises(mcp.ToolError, match="does not answer"):
        tools.play_in_player(SONG_ID)
