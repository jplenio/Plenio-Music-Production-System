"""The whole player from the network, and ComfyUI too (owner's request 2026-10-18): gateways that let in only a
browser that came with the link, pass requests on as if they came from this computer, keep a WebSocket open -
and a player that does all but this computer's own things for a request from the network. And the state's
change counter: two pages saving at once merge instead of one losing its changes."""

from __future__ import annotations

import http.client
import json
import socket
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

from plenio.player import network as network_module
from plenio.player import server as server_module
from plenio.player.library import Library
from plenio.player.network import COOKIE, NetworkAccess
from plenio.player.server import State, serve

PLAYER_PORTS = network_module.PORTS


def free_ports(size: int = 4) -> range:
    """Ports in a row that nothing on this computer answers on and that are free to take - new ones for every
    test (a port a test closed can still be held by its last connections for a while)."""
    for _ in range(50):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            base = probe.getsockname()[1]
        if base + size > 65535:
            continue
        try:
            for port in range(base, base + size):
                # taking the port on every address, alone, fails at once when anything holds it on any
                # address (asking each port for an answer waited 0.2 s for every refusal on Windows)
                with socket.socket() as free:
                    if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
                        free.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
                    free.bind(("0.0.0.0", port))  # noqa: S104 - bound and closed, never listening
        except OSError:
            continue
        return range(base, base + size)
    raise RuntimeError("no free ports in a row")


@pytest.fixture(autouse=True)
def gateway_ports(monkeypatch: pytest.MonkeyPatch) -> None:
    """Free ports for the gateways: a player running on this computer with its own access on holds 8780-8789,
    and a connection to a door closed in a test would reach it."""
    monkeypatch.setattr(network_module, "PORTS", free_ports())


def test_the_gateways_listen_on_ports_8780_to_8789() -> None:
    assert PLAYER_PORTS == range(8780, 8790)


class Echo(BaseHTTPRequestHandler):
    """An upstream that answers with what it was sent."""

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        pass

    def _answer(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length).decode() if length else ""
        data = json.dumps(
            {"path": self.path, "method": self.command, "headers": dict(self.headers), "body": body}
        ).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    do_GET = do_POST = _answer  # noqa: N815


@pytest.fixture
def echo() -> Iterator[int]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), Echo)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield server.server_address[1]
    server.shutdown()
    server.server_close()


@pytest.fixture
def access(tmp_path: Path, echo: int) -> Iterator[NetworkAccess]:
    network = NetworkAccess(
        tmp_path, player_port=lambda: echo, comfyui=lambda: f"http://127.0.0.1:{echo}/", host="127.0.0.1"
    )
    yield network
    network.close()


def call(
    port: int, method: str, path: str, body: bytes | None = None, **headers: str
) -> tuple[int, dict[str, str], bytes]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    connection.request(method, path, body=body, headers=headers)
    answer = connection.getresponse()
    data = answer.read()
    connection.close()
    return answer.status, dict(answer.getheaders()), data


def test_only_a_browser_with_the_link_comes_in(access: NetworkAccess) -> None:
    status = access.configure({"on": True})
    assert (
        status["on"]
        and status["url"].startswith(f"http://127.0.0.1:{status['port']}/")
        and status["comfyui_url"]
    )
    port, token = status["port"], access.token
    assert status["url"].endswith(f"/{token}/") and port in network_module.PORTS
    # without it: a page that says how to come in, and nothing passed on
    code, _, body = call(port, "GET", "/api/library")
    assert code == 401 and b"link" in body
    assert call(port, "GET", "/api/library", Cookie=f"{COOKIE}=wrong-code-wrong")[0] == 401
    # the link: a cookie for this browser, and on to the page asked for
    code, headers, _ = call(port, "GET", f"/{token}/song?x=1")
    assert code == 302 and headers["Location"] == "/song?x=1"
    cookie = headers["Set-Cookie"]
    assert cookie.startswith(f"{COOKIE}={token};") and "HttpOnly" in cookie and "SameSite=Lax" in cookie
    code, _, body = call(port, "GET", "/api/library", Cookie=f"other=1; {COOKIE}={token}")
    assert code == 200 and json.loads(body)["path"] == "/api/library"


def test_a_request_is_passed_on_as_if_it_came_from_this_computer(access: NetworkAccess, echo: int) -> None:
    status = access.configure({"on": True})
    port, comfy, token = status["port"], status["comfy_port"], access.token
    here = f"127.0.0.1:{port}"
    headers = {
        "Cookie": f"theme=dark; {COOKIE}={token}",
        "Origin": f"http://{here}",
        "X-Plenio-Remote": "0",
        "Content-Type": "application/json",
    }
    code, _, body = call(port, "POST", "/api/state", b'{"a": 1}', **headers)
    seen = json.loads(body)
    sent = {k.lower(): v for k, v in seen["headers"].items()}
    assert code == 200 and seen["body"] == '{"a": 1}' and seen["method"] == "POST"
    assert sent["host"] == f"127.0.0.1:{echo}" and sent["origin"] == f"http://127.0.0.1:{echo}"
    # the way in's cookie stays with the gateway; the player hears it came from the network, and by which address
    assert (
        sent["cookie"] == "theme=dark"
        and sent["x-plenio-remote"] == "1"
        and sent["x-plenio-remote-host"] == here
    )
    assert sent["connection"] == "close"
    # another site's page keeps its own origin (and the player turns it away); ComfyUI hears it came from the
    # network too - Plenio's routes in it answer what only this computer may ask (its System Check's report,
    # starting the player) not by this way, as they answer --listen - whatever the browser said itself
    code, _, body = call(
        comfy,
        "GET",
        "/prompt",
        Cookie=f"{COOKIE}={token}",
        Origin="http://evil.example",
        **{"X-Plenio-Remote": "0"},
    )
    sent = {k.lower(): v for k, v in json.loads(body)["headers"].items()}
    assert sent["origin"] == "http://evil.example" and sent["x-plenio-remote"] == "1"


def test_a_websocket_stays_open_both_ways(tmp_path: Path) -> None:
    upstream = socket.socket()
    upstream.bind(("127.0.0.1", 0))
    upstream.listen(1)

    def serve_one() -> None:
        conn, _ = upstream.accept()
        data = b""
        while b"\r\n\r\n" not in data:
            data += conn.recv(4096)
        assert b"Upgrade: websocket" in data and b"Connection: Upgrade" in data
        conn.sendall(b"HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n")
        for _ in range(3):
            conn.sendall(conn.recv(4096).upper())
        conn.close()

    threading.Thread(target=serve_one, daemon=True).start()
    port = upstream.getsockname()[1]
    network = NetworkAccess(
        tmp_path, player_port=lambda: 1, comfyui=lambda: f"http://127.0.0.1:{port}/", host="127.0.0.1"
    )
    try:
        status = network.configure({"on": True})
        client = socket.create_connection(("127.0.0.1", status["comfy_port"]), timeout=10)
        client.sendall(
            f"GET /ws HTTP/1.1\r\nHost: 127.0.0.1:{status['comfy_port']}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
            f"Cookie: {COOKIE}={network.token}\r\n\r\n".encode()
        )
        assert client.recv(4096).startswith(b"HTTP/1.1 101")
        for word in (b"one", b"two", b"three"):
            client.sendall(word)
            assert client.recv(4096) == word.upper()
        client.close()
    finally:
        network.close()
        upstream.close()


@pytest.mark.io
def test_a_new_link_shuts_the_old_one_out_and_off_closes_the_doors(access: NetworkAccess) -> None:
    status = access.configure({"on": True})
    port, old = status["port"], access.token
    renewed = access.configure({"regenerate": True})
    assert access.token != old and renewed["port"] == port  # the same port, a new code
    assert call(port, "GET", "/api/x", Cookie=f"{COOKIE}={old}")[0] == 401
    assert call(port, "GET", f"/{old}/")[0] == 401
    assert call(port, "GET", "/api/x", Cookie=f"{COOKIE}={access.token}")[0] == 200
    # kept: on again after a restart, with the same link
    again = NetworkAccess(access.path.parent, player_port=lambda: 1, comfyui=lambda: None, host="127.0.0.1")
    assert again.token == access.token and again.settings["on"]
    access.configure({"on": False})
    with pytest.raises(OSError):
        socket.create_connection(("127.0.0.1", port), timeout=2)


def test_comfyui_not_running_says_so(tmp_path: Path) -> None:
    network = NetworkAccess(tmp_path, player_port=lambda: 1, comfyui=lambda: None, host="127.0.0.1")
    try:
        status = network.configure({"on": True})
        assert not status["comfyui_running"]
        code, _, body = call(status["comfy_port"], "GET", "/", Cookie=f"{COOKIE}={network.token}")
        assert code == 503 and b"ComfyUI is not running" in body
    finally:
        network.close()


# --- the player from the network ----------------------------------------------------------------------------


@pytest.fixture
def player(tmp_path: Path) -> Iterator[tuple[int, NetworkAccess, State]]:
    folder = tmp_path / "songs"
    folder.mkdir()
    (folder / "One.plenio.json").write_text(
        json.dumps({"title": "One", "files": [{"name": "One.flac", "format": "flac"}]}), encoding="utf-8"
    )
    (folder / "One.flac").write_bytes(b"x" * 64)
    library = Library([folder])
    library.scan(force=True)
    ports: list[int] = []
    network = NetworkAccess(
        tmp_path / "state", player_port=lambda: ports[0], comfyui=lambda: None, host="127.0.0.1"
    )
    state = State(tmp_path / "state" / "state.json")
    server = serve(library, state, "127.0.0.1", 0, network=network)
    ports.append(server.server_address[1])
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield ports[0], network, state
    network.close()
    server.shutdown()
    server.server_close()


def test_from_the_network_the_player_does_all_but_this_computers_own_things(
    player: tuple[int, NetworkAccess, State],
) -> None:
    port, network, _ = player
    # the page on this computer switches it on; from the network it cannot
    assert (
        call(port, "PUT", "/api/network", b'{"on": true}', **{"Content-Type": "application/json"})[0] == 200
    )
    door = network.status()["port"]
    cookie = {"Cookie": f"{COOKIE}={network.token}"}
    json_from = {**cookie, "Content-Type": "application/json", "Origin": f"http://127.0.0.1:{door}"}
    info = json.loads(call(door, "GET", "/api/info", **cookie)[2])
    assert info["remote"] is True and json.loads(call(port, "GET", "/api/info")[2])["remote"] is False
    assert json.loads(call(door, "GET", "/api/library", **cookie)[2])["songs"][0]["title"] == "One"
    seen = json.loads(call(door, "GET", "/api/network", **cookie)[2])
    assert seen["remote"] and seen["comfyui_here"] == f"http://127.0.0.1:{network.status()['comfy_port']}/"
    song = json.loads(call(door, "GET", "/api/library", **cookie)[2])["songs"][0]["id"]
    for method, path, body in (
        ("PUT", "/api/network", b'{"on": false}'),
        ("PUT", "/api/folders", b'{"reset": true}'),
        ("POST", "/api/quit", b"{}"),
        ("POST", "/api/videos/open", b"{}"),
        ("POST", f"/api/song/{song}/remove", json.dumps({"action": "delete", "confirm": song}).encode()),
    ):
        code, _, answer = call(door, method, path, body, **json_from)
        assert code == 403 and b"only on the computer itself" in answer, path
    assert call(door, "GET", "/api/dirs", **cookie, **{"X-Plenio-Player": "1"})[0] == 403
    # the state, the playlists: as here
    assert call(door, "PUT", "/api/state", b'{"favorites": ["a"]}', **json_from)[0] == 200
    assert json.loads(call(port, "GET", "/api/state")[2])["favorites"] == ["a"]
    # a program on this computer that sends the header itself only holds itself back (it could do more)
    assert json.loads(call(port, "GET", "/api/info", **{"X-Plenio-Remote": "1"})[2])["remote"] is True


def test_from_the_network_the_player_names_no_place_on_this_computer(
    player: tuple[int, NetworkAccess, State], tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Where the songs, the state and the made files lie is this computer's business: the network hears their names,
    and of a failure only that it failed (its text can name a folder); the page on this computer hears it all."""
    port, network, _ = player
    assert (
        call(port, "PUT", "/api/network", b'{"on": true}', **{"Content-Type": "application/json"})[0] == 200
    )
    door, cookie = network.status()["port"], {"Cookie": f"{COOKIE}={network.token}"}
    here, there = (json.loads(call(p, "GET", "/api/info", **h)[2]) for p, h in ((port, {}), (door, cookie)))
    assert here["state"] == str(tmp_path / "state" / "state.json") and here["folders"] == [
        str(tmp_path / "songs")
    ]
    assert there["state"] == "state.json" and there["folders"] == ["songs"]
    library = json.loads(call(door, "GET", "/api/library", **cookie)[2])
    assert library["folders"] == ["songs"] and library["songs"][0]["title"] == "One"
    assert json.loads(call(port, "GET", "/api/library")[2])["folders"] == [str(tmp_path / "songs")]
    song = library["songs"][0]["id"]
    (tmp_path / "songs" / "One.plenio.json").write_text("{broken", encoding="utf-8")
    code, _, body = call(door, "GET", f"/api/song/{song}", **cookie)
    assert code == 500 and json.loads(body)["error"] == server_module.REMOTE_FAILURE
    code, _, body = call(port, "GET", f"/api/song/{song}")
    assert code == 500 and json.loads(body)["error"] != server_module.REMOTE_FAILURE
    # an address of its own to look for ComfyUI at: from this computer only (from the network it would knock at
    # this computer's ports)
    asked: list[str] = []
    monkeypatch.setattr(server_module, "find_comfyui", lambda preferred, also=None: asked.append(preferred))
    call(port, "GET", "/api/comfyui?url=http://127.0.0.1:9999")
    call(door, "GET", "/api/comfyui?url=http://127.0.0.1:9999", **cookie)
    assert asked == ["http://127.0.0.1:9999", ""]


def test_the_places_named_for_the_network_are_names_only() -> None:
    data = {
        "folder": r"D:\Music\Plenio",
        "folders": ["/home/anna/music", r"\\server\share\songs", "relative/one"],
        "jobs": [
            {"folder": "C:/Users/anna/.plenio/player/videos", "file": "Song.mp4", "url": "/videos/Song.mp4"}
        ],
        "title": r"C:\not a place - a title",
        "record_path": "",
    }
    assert server_module.without_places(data) == {
        "folder": "Plenio",
        "folders": ["music", "songs", "relative/one"],
        "jobs": [{"folder": "videos", "file": "Song.mp4", "url": "/videos/Song.mp4"}],
        "title": r"C:\not a place - a title",
        "record_path": "",
    }


def test_two_pages_saving_at_once_are_told_and_merge(player: tuple[int, NetworkAccess, State]) -> None:
    port, _, state = player
    headers = {"Content-Type": "application/json"}
    first = json.loads(call(port, "GET", "/api/state")[2])
    rev = first["rev"]
    assert json.loads(call(port, "GET", "/api/state/rev")[2]) == {"rev": rev}
    # page A saves from the change it read: fine, the counter goes on
    code, _, body = call(
        port, "PUT", "/api/state", json.dumps({"favorites": ["a"], "rev": rev}).encode(), **headers
    )
    assert code == 200 and json.loads(body) == {"ok": True, "rev": rev + 1}
    # page B saves from the same old change: told, with what is saved now, to merge
    code, _, body = call(
        port, "PUT", "/api/state", json.dumps({"favorites": ["b"], "rev": rev}).encode(), **headers
    )
    answer = json.loads(body)
    assert code == 409 and answer["rev"] == rev + 1 and answer["state"]["favorites"] == ["a"]
    assert "rev" not in json.loads(state.path.read_text(encoding="utf-8"))
    # without a change named (a backup put back), it saves
    assert call(port, "PUT", "/api/state", json.dumps({"favorites": []}).encode(), **headers)[0] == 200
