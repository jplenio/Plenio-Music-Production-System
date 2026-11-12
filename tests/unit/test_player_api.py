"""Player API v1 (phase 5.8): the six routes under /api/v1, the page that plays reporting and taking commands, the
events - against a real player server with a small library; the playing page is simulated by a thread."""

from __future__ import annotations

import http.client
import json
import re
import threading
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player import player_api
from plenio.player.accounts import Accounts
from plenio.player.library import Library
from plenio.player.remote import PlayerRemote, RemoteError, check_live, check_queue, check_transport
from plenio.player.server import State, serve

JSON = {"Content-Type": "application/json"}
FROM_NETWORK = {"X-Plenio-Remote": "1", "X-Plenio-Remote-Host": "192.168.1.20"}


def record(title: str, genre: str) -> dict[str, object]:
    return {
        "schema": "plenio.record/1",
        "title": title,
        "created": "2026-10-15T10:00:00Z",
        "documents": {"lyrics": {"text": "[Verse]\nla la la", "sha256": "l1"}, "style": {"text": genre}},
        "audio": {"seconds": 120.0, "tags": {"genre": genre}},
        "files": [{"name": f"{title}.flac", "format": "flac"}],
    }


@pytest.fixture
def player(tmp_path: Path) -> Iterator[tuple[int, Library]]:
    folder = tmp_path / "output" / "plenio"
    folder.mkdir(parents=True)
    for title, genre in (("Neon Rain", "synthwave"), ("Paper Boats", "folk"), ("Iron Hearts", "metal")):
        (folder / f"{title}.plenio.json").write_text(json.dumps(record(title, genre)), encoding="utf-8")
        (folder / f"{title}.flac").write_bytes(b"x" * 100)
    library = Library([tmp_path / "output"], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield running.server_address[1], library
    running.shutdown()
    running.server_close()


def call(port: int, method: str, path: str, body: Any = None, **headers: str) -> tuple[int, Any]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    connection.request(method, path, body=json.dumps(body) if body is not None else None,
                       headers={"Host": f"127.0.0.1:{port}", **headers})  # fmt: skip
    answer = connection.getresponse()
    data = answer.read()
    connection.close()
    return answer.status, json.loads(data) if data else None


def ids(library: Library) -> dict[str, str]:
    return {song["title"]: song["id"] for song in library.songs()}


def report(port: int, page: str, library: Library, *, playing: bool = True, now: str = "Neon Rain",
           position: float = 10.0, live: dict[str, Any] | None = None) -> None:  # fmt: skip
    known = ids(library)
    shown = {
        "page": page, "playing": playing, "position": position, "duration": 120.0, "now": {"id": known[now]},
        "next": [known["Paper Boats"], known["Iron Hearts"]], "queue_length": 3,
        "live": live or {"on": False, "insert": "next", "auto": True, "atEnd": "again"},
    }  # fmt: skip
    assert call(port, "POST", "/api/remote/now", shown, **JSON) == (200, {"ok": True})


def test_the_index_and_the_document_name_every_route(player: tuple[int, Library]) -> None:
    port, _ = player
    code, index = call(port, "GET", "/api/v1")
    assert code == 200 and index["api"] == "plenio-player-api" and index["version"] == "1.0"
    code, document = call(port, "GET", "/api/v1/openapi.json")
    served = {(m.lower(), f"{player_api.BASE}{p}") for m, p, _ in player_api.ROUTES}
    documented = {(m, p) for p, ops in document["paths"].items() for m in ops}
    assert code == 200 and served == documented
    copy = json.loads((Path(__file__).parents[2] / "docs" / "api" / "player-openapi.json").read_text("utf-8"))
    assert copy == json.loads(json.dumps(player_api.openapi())), "run tools/api_docs.py"
    guide = (Path(__file__).parents[2] / "docs" / "api" / "player.md").read_text(encoding="utf-8")
    for method, path, _ in player_api.ROUTES:
        assert f"`{method} {player_api.BASE}{path}" in guide, (method, path)


def test_now_without_and_with_a_page(player: tuple[int, Library]) -> None:
    port, library = player
    code, now = call(port, "GET", "/api/v1/now")
    assert code == 200 and now["page"] is False and now["song"] is None
    report(port, "tv", library)
    code, now = call(port, "GET", "/api/v1/now")
    assert code == 200 and now["page"] and now["playing"]
    assert now["song"]["title"] == "Neon Rain" and now["song"]["audio"].startswith("/media/")
    assert [s["title"] for s in now["next"]] == ["Paper Boats", "Iron Hearts"]
    assert 10.0 <= now["position"] < 12.0 and now["queue_length"] == 3


def test_a_transport_command_reaches_the_playing_page_within_a_second(player: tuple[int, Library]) -> None:
    port, library = player
    assert call(port, "POST", "/api/v1/transport", {"do": "pause"}, **JSON)[0] == 409  # no page yet
    report(port, "phone", library, playing=False)
    report(port, "tv", library)  # the page that plays gets the commands
    got: list[tuple[float, Any]] = []

    def page() -> None:
        code, answer = call(port, "GET", "/api/remote/commands?page=tv&after=0&wait=5")
        got.append((time.monotonic(), answer))

    listening = threading.Thread(target=page)
    listening.start()
    time.sleep(0.3)  # the page is waiting
    sent_at = time.monotonic()
    code, sent = call(port, "POST", "/api/v1/transport", {"do": "seek", "seconds": 42}, **JSON)
    listening.join(5)
    assert code == 202 and isinstance(sent["sent"], int)
    ((arrived, answer),) = got
    assert arrived - sent_at < 1.0
    assert answer["commands"] == [{"n": sent["sent"], "do": "seek", "seconds": 42.0}]
    assert call(port, "GET", "/api/remote/commands?page=phone&after=0&wait=0")[1]["commands"] == []


def test_queue_live_and_songs(player: tuple[int, Library]) -> None:
    port, library = player
    report(port, "tv", library)
    known = ids(library)
    assert call(port, "POST", "/api/v1/queue", {"id": "nope"}, **JSON)[0] == 404
    code, sent = call(port, "POST", "/api/v1/queue", {"id": known["Iron Hearts"], "where": "next"}, **JSON)
    assert code == 202
    code, sent_live = call(port, "POST", "/api/v1/live", {"on": True, "insert": "end"}, **JSON)
    assert code == 202
    commands = call(port, "GET", "/api/remote/commands?page=tv&after=0&wait=0")[1]["commands"]
    assert commands == [
        {"n": sent["sent"], "do": "queue", "id": known["Iron Hearts"], "where": "next"},
        {"n": sent_live["sent"], "do": "live", "on": True, "insert": "end"},
    ]
    assert call(port, "GET", "/api/v1/live")[1] == {"page": True, "on": False, "insert": "next", "auto": True,
                                                    "atEnd": "again"}  # fmt: skip
    code, found = call(port, "GET", "/api/v1/songs?q=genre:folk")
    assert code == 200 and [s["title"] for s in found["songs"]] == ["Paper Boats"] and found["total"] == 1
    assert call(port, "GET", "/api/v1/songs?limit=2")[1]["total"] == 3
    assert len(call(port, "GET", "/api/v1/songs?limit=2")[1]["songs"]) == 2
    assert call(port, "GET", "/api/v1/songs?limit=x")[0] == 400
    code, found = call(port, "GET", "/api/v1/songs?record=plenio/Paper%20Boats.plenio.json")
    assert [s["title"] for s in found["songs"]] == ["Paper Boats"]


def test_refusals(player: tuple[int, Library]) -> None:
    port, library = player
    report(port, "tv", library)
    assert call(port, "POST", "/api/v1/transport", {"do": "pause"})[0] == 400  # not sent as JSON
    code, answer = call(port, "POST", "/api/v1/transport", {"do": "rewind"}, **JSON)
    assert code == 400 and answer["error"]["code"] == "invalid_value"
    assert call(port, "POST", "/api/v1/transport", {"do": "seek"}, **JSON)[0] == 400
    assert call(port, "POST", "/api/v1/live", {"on": "yes"}, **JSON)[0] == 400
    assert (
        call(port, "POST", "/api/v1/transport", {"do": "next"}, **JSON, Origin="http://evil.example")[0]
        == 400
    )
    code, answer = call(port, "GET", "/api/v1/nothing")
    assert code == 404 and answer["error"]["code"] == "not_found"


def test_the_event_stream(player: tuple[int, Library]) -> None:
    port, library = player
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    connection.request("GET", "/api/v1/events", headers={"Host": f"127.0.0.1:{port}"})
    stream = connection.getresponse()
    assert stream.status == 200 and stream.getheader("Content-Type", "").startswith("text/event-stream")

    def next_event() -> tuple[str, str, dict[str, Any]]:
        fields: dict[str, str] = {}
        while True:
            line = stream.fp.readline().decode("utf-8").rstrip("\n")
            if not line and "data" in fields:
                return fields["id"], fields["event"], json.loads(fields["data"])
            if line and not line.startswith(":"):
                name, _, value = line.partition(": ")
                fields[name] = value

    first = next_event()
    assert first[1] == "now" and first[2]["page"] is False and re.fullmatch(r"[0-9a-f]+-\d+", first[0])
    report(port, "tv", library)
    kinds = [next_event() for _ in range(3)]
    assert [k for _, k, _ in kinds] == ["now", "queue", "live"]
    assert kinds[0][2]["song"]["title"] == "Neon Rain" and kinds[0][2]["playing"] is True
    report(port, "tv", library, playing=False)
    _, kind, data = next_event()
    assert kind == "now" and data["playing"] is False
    connection.close()


def test_from_the_network_a_login_is_needed(tmp_path: Path) -> None:
    folder = tmp_path / "output"
    folder.mkdir()
    library = Library([folder], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    accounts = Accounts(tmp_path / "state")
    anna = accounts.create("Anna", "secret1")
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0, accounts=accounts)
    threading.Thread(target=running.serve_forever, daemon=True).start()
    port = running.server_address[1]
    try:
        code, answer = call(port, "GET", "/api/v1/now", **FROM_NETWORK)
        assert code == 401 and answer["error"]["code"] == "unauthorized"
        assert call(port, "GET", "/api/v1/now")[0] == 200  # this computer
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
        connection.request("POST", "/api/login", body=json.dumps({"user": anna["id"], "password": "secret1"}),
                           headers={"Host": f"127.0.0.1:{port}", **JSON, **FROM_NETWORK})  # fmt: skip
        answer_ = connection.getresponse()
        cookie = (answer_.getheader("Set-Cookie") or "").split(";")[0]
        answer_.read()
        connection.close()
        assert call(port, "GET", "/api/v1/now", Cookie=cookie, **FROM_NETWORK)[0] == 200
        # Anna's page and the admin's are apart: a page of the admin's plays, a command of Anna's finds none of hers
        shown = {"page": "admin-tv", "playing": True, "now": None}
        assert call(port, "POST", "/api/remote/now", shown, **JSON)[0] == 200
        assert call(port, "POST", "/api/v1/transport", {"do": "pause"}, **JSON)[0] == 202
        assert (
            call(port, "POST", "/api/v1/transport", {"do": "pause"}, Cookie=cookie, **JSON, **FROM_NETWORK)[0]
            == 409
        )
    finally:
        running.shutdown()
        running.server_close()


# --- the middle, without a server ---------------------------------------------------------------------------------


class Clock:
    def __init__(self) -> None:
        self.now = 100.0

    def __call__(self) -> float:
        return self.now


def test_commands_go_to_the_page_that_started_playing_last_and_a_page_goes_stale() -> None:
    clock = Clock()
    hub = PlayerRemote(stale=15, clock=clock)
    hub.report("tv", "admin", {"playing": True, "now": {"id": "a"}})
    clock.now += 1
    hub.report("phone", "admin", {"playing": True, "now": {"id": "b"}})
    hub.report("tv", "admin", {"playing": True, "now": {"id": "a"}})  # a heartbeat moves nothing
    n = hub.send("admin", {"do": "pause"})
    assert hub.commands("phone", "admin", 0, 0) == [{"n": n, "do": "pause"}]
    assert hub.commands("tv", "admin", 0, 0) == []
    assert hub.commands("phone", "anna", 0, 0) == []  # another account asks for the admin's page
    clock.now += 16
    with pytest.raises(RemoteError) as gone:
        hub.send("admin", {"do": "play"})
    assert gone.value.status == 409 and gone.value.code == "no_player"


def test_the_position_is_estimated_while_playing() -> None:
    clock = Clock()
    hub = PlayerRemote(clock=clock)
    hub.report("tv", "admin", {"playing": True, "position": 30.0, "duration": 31.0})
    clock.now += 4
    now = hub.now("admin")
    assert now is not None and now["position"] == 31.0 and now["reported"] == 4.0


def test_reactions_are_events_and_the_checks() -> None:
    hub = PlayerRemote()
    hub.reaction({"kind": "fire", "id": "s1"}, "admin")
    (event,) = hub.events("admin", 0, 0)
    assert event.kind == "reaction" and event.data == {"kind": "fire", "song": "s1"}
    assert hub.events("anna", 0, 0) == []
    assert check_transport({"do": "seek", "seconds": 3}) == {"do": "seek", "seconds": 3.0}
    for bad in ({"do": "seek", "seconds": -1}, {"do": "seek", "seconds": True}, {}, None):
        with pytest.raises(RemoteError):
            check_transport(bad)
    assert check_queue({"id": "s1"}, lambda _: True) == {"do": "queue", "id": "s1", "where": "end"}
    with pytest.raises(RemoteError):
        check_queue({"id": "s1", "where": "first"}, lambda _: True)
    assert check_live({"atEnd": "wait"}) == {"do": "live", "atEnd": "wait"}
    for bad in ({}, {"color": "red"}, {"insert": "middle"}):
        with pytest.raises(RemoteError):
            check_live(bad)


def test_one_account_cannot_take_another_s_page_or_every_stream() -> None:
    """Review of phase 6: a page id reported by another account replaced the page, and one account could hold
    every event stream."""
    from plenio.player import remote as remote_module

    hub = PlayerRemote()
    hub.report("tv", "admin", {"playing": True, "now": {"id": "a"}, "secret": "x" * 1000})
    with pytest.raises(RemoteError):
        hub.report("tv", "anna", {"playing": False})
    hub.leave("tv", "anna")  # not hers: stays
    now = hub.now("admin")
    assert now is not None and now["playing"] is True and "secret" not in now
    for _ in range(remote_module.STREAMS_PER_OWNER):
        hub.open_stream("anna")
    with pytest.raises(RemoteError):
        hub.open_stream("anna")
    hub.open_stream("admin")  # the host still gets one
    for n in range(remote_module.PAGES_PER_OWNER + 3):
        hub.report(f"p{n}", "ben", {"playing": False})
    assert sum(p.owner == "ben" for p in hub._pages.values()) == remote_module.PAGES_PER_OWNER
