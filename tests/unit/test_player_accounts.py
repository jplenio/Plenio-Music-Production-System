"""The login (owner's request 2026-10-23): users set up by the admin keep their own playlists, likes, plays and
settings on every device; the admin logs in only on the player's computer and has the player's state as it
was; a guest keeps theirs in the browser."""

from __future__ import annotations

import http.client
import json
import threading
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player.accounts import COOKIE, AccountError, Accounts, avatar_suffix
from plenio.player.library import Library
from plenio.player.server import State, serve

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JSON = {"Content-Type": "application/json"}
FROM_NETWORK = {"X-Plenio-Remote": "1", "X-Plenio-Remote-Host": "192.168.1.20"}


def call(
    port: int, method: str, path: str, body: Any = None, **headers: str
) -> tuple[int, dict[str, str], Any]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    data = body if isinstance(body, bytes) or body is None else json.dumps(body).encode()
    connection.request(method, path, body=data, headers=headers)
    answer = connection.getresponse()
    raw = answer.read()
    connection.close()
    try:
        parsed: Any = json.loads(raw)
    except ValueError:
        parsed = raw
    return answer.status, {k.lower(): v for k, v in answer.getheaders()}, parsed


def cookie_of(headers: dict[str, str]) -> dict[str, str]:
    value = headers["set-cookie"].split(";")[0]
    assert value.startswith(f"{COOKIE}=")
    return {"Cookie": value}


@pytest.fixture
def player(tmp_path: Path) -> Iterator[tuple[int, Accounts, State]]:
    folder = tmp_path / "songs"
    folder.mkdir()
    library = Library([folder])
    library.scan(force=True)
    state = State(tmp_path / "state" / "state.json")
    state.write(
        {
            "favorites": ["the owner's"],
            "playlists": [],
            "plays": {},
            "last_played": {},
            "tags": {},
            "settings": {},
        }
    )
    accounts = Accounts(tmp_path / "state")
    server = serve(library, state, "127.0.0.1", 0, accounts=accounts)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield server.server_address[1], accounts, state
    server.shutdown()
    server.server_close()


def test_passwords_are_kept_as_hashes_and_checked(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    anna = accounts.create("Anna", "secret1")
    stored = (tmp_path / "users.json").read_text(encoding="utf-8")
    assert "secret1" not in stored and anna["name"] == "Anna" and not anna["admin"]
    token, user = accounts.login(anna["id"], "secret1")
    assert user["id"] == anna["id"] and accounts.session(token)["name"] == "Anna"
    assert token not in stored and token not in (tmp_path / "users.json").read_text(encoding="utf-8")
    with pytest.raises(AccountError) as wrong:
        accounts.login(anna["id"], "nope")
    assert wrong.value.status == 401
    with pytest.raises(AccountError):
        accounts.create("anna", "other1")  # the same name
    with pytest.raises(AccountError):
        accounts.create("Ben", "abc")  # too short
    # a new password ends the other sessions, not the one that changed it
    other, _ = accounts.login(anna["id"], "secret1")
    from plenio.player.accounts import session_key

    accounts.update(anna["id"], {"password": "secret2", "keep_session": session_key(token)})
    assert accounts.session(token) is not None and accounts.session(other) is None
    accounts.logout(token)
    assert accounts.session(token) is None
    for _ in range(8):
        with pytest.raises(AccountError):
            accounts.login(anna["id"], "wrong", "10.0.0.9")
    with pytest.raises(AccountError) as slow:
        accounts.login(anna["id"], "secret2", "10.0.0.9")
    assert slow.value.status == 429
    assert avatar_suffix(PNG) == ".png" and avatar_suffix(b"<svg") is None


def test_the_admin_on_this_computer_keeps_the_players_state(player: tuple[int, Accounts, State]) -> None:
    port, _, _ = player
    session = call(port, "GET", "/api/session")[2]
    assert session["login"] and not session["chosen"] and session["local"] and session["user"]["admin"]
    # without a login this computer's page has the player's state, as before
    assert call(port, "GET", "/api/state")[2]["favorites"] == ["the owner's"]
    code, headers, answer = call(port, "POST", "/api/login", {"admin": True}, **JSON)
    assert code == 200 and answer["user"]["admin"]
    assert call(port, "GET", "/api/session", **cookie_of(headers))[2]["chosen"] is True
    # from the network nobody is the admin
    assert call(port, "POST", "/api/login", {"admin": True}, **JSON, **FROM_NETWORK)[0] == 403
    remote = call(port, "GET", "/api/session", **cookie_of(headers), **FROM_NETWORK)[2]
    assert remote["user"] is None and remote["admin"] is None and not remote["local"]


def test_a_user_has_their_own_state_on_every_device(player: tuple[int, Accounts, State]) -> None:
    port, _, state = player
    # the admin sets up a user (only the admin)
    code, _, made = call(port, "POST", "/api/users", {"name": "Anna", "password": "secret1"}, **JSON)
    assert code == 200
    anna = made["user"]["id"]
    assert (
        call(port, "POST", "/api/users", {"name": "Eve", "password": "secret1"}, **JSON, **FROM_NETWORK)[0]
        == 403
    )
    users = call(port, "GET", "/api/users", **FROM_NETWORK)[2]["users"]
    assert [u["name"] for u in users] == ["Anna"] and "created" not in users[0]
    # Anna logs in from her phone
    assert call(port, "POST", "/api/login", {"user": anna, "password": "x"}, **JSON, **FROM_NETWORK)[0] == 401
    code, headers, _ = call(
        port, "POST", "/api/login", {"user": anna, "password": "secret1"}, **JSON, **FROM_NETWORK
    )
    phone = {**cookie_of(headers), **FROM_NETWORK}
    assert call(port, "GET", "/api/state", **phone)[2]["favorites"] == []
    assert call(port, "PUT", "/api/state", {"favorites": ["hers"]}, **phone, **JSON)[0] == 200
    # ... and sees the same on her laptop, the owner's state untouched
    code, headers, _ = call(port, "POST", "/api/login", {"user": anna, "password": "secret1"}, **JSON)
    assert call(port, "GET", "/api/state", **cookie_of(headers))[2]["favorites"] == ["hers"]
    assert state.read()["favorites"] == ["the owner's"]
    # a guest from the network keeps theirs in the browser
    code, _, answer = call(port, "GET", "/api/state", **FROM_NETWORK)
    assert code == 401 and answer["guest"] is True
    # her picture; the admin removes her
    picture = {**phone, "X-Plenio-Player": "1"}
    assert call(port, "PUT", f"/api/users/{anna}/avatar", PNG, **picture)[2]["user"]["avatar"] is True
    assert call(port, "GET", f"/api/users/{anna}/avatar")[2] == PNG
    assert call(port, "PUT", f"/api/users/{anna}/avatar", b"<svg/>", **picture)[0] == 400
    assert call(port, "DELETE", f"/api/users/{anna}", None, **phone, **JSON)[0] == 403
    assert call(port, "DELETE", f"/api/users/{anna}", None, **JSON)[0] == 200
    assert call(port, "GET", "/api/state", **phone)[0] == 401  # her session is gone with her


def test_users_are_listeners_makers_or_helpers_with_the_admins_rights(
    player: tuple[int, Accounts, State], tmp_path: Path
) -> None:
    """The groups (owner's request 2026-10-29): a listener, a maker - and an admin, a helper with the admin's
    rights from any device, whose own things stay theirs."""
    port, accounts, state = player
    # set up with a group; a user from before the groups is a maker
    made = call(port, "POST", "/api/users", {"name": "Hal", "password": "secret1", "group": "admin"}, **JSON)[
        2
    ]
    hal = made["user"]
    assert hal["group"] == "admin" and hal["helper"] is True and hal["admin"] is False
    lea = call(
        port, "POST", "/api/users", {"name": "Lea", "password": "secret1", "group": "listener"}, **JSON
    )[2]
    assert lea["user"]["group"] == "listener" and not lea["user"]["helper"]
    assert (
        call(port, "POST", "/api/users", {"name": "Max", "password": "secret1", "group": "boss"}, **JSON)[0]
        == 400
    )
    old = accounts.create("Old", "secret1")
    data = json.loads((tmp_path / "state" / "users.json").read_text(encoding="utf-8"))
    for user in data["users"]:
        if user["id"] == old["id"]:
            del user["group"]
    (tmp_path / "state" / "users.json").write_text(json.dumps(data), encoding="utf-8")
    assert accounts.user(old["id"])["group"] == "maker"
    # the helper logs in from their phone and does what the admin does: users, their groups
    code, headers, _ = call(
        port, "POST", "/api/login", {"user": hal["id"], "password": "secret1"}, **JSON, **FROM_NETWORK
    )
    helper = {**cookie_of(headers), **FROM_NETWORK}
    assert call(port, "GET", "/api/users", **helper)[2]["users"][0].get("created")
    assert (
        call(port, "POST", "/api/users", {"name": "Zoe", "password": "secret1"}, **JSON, **helper)[0] == 200
    )
    lea_id = lea["user"]["id"]
    changed = call(port, "PUT", f"/api/users/{lea_id}", {"group": "maker"}, **JSON, **helper)
    assert changed[0] == 200 and changed[2]["user"]["group"] == "maker"
    # ... but has their own things, not the admin's
    assert call(port, "GET", "/api/state", **helper)[2]["favorites"] == []
    assert state.read()["favorites"] == ["the owner's"]
    # a user cannot change their own group
    code, headers, _ = call(port, "POST", "/api/login", {"user": lea_id, "password": "secret1"}, **JSON)
    lea_session = cookie_of(headers)
    assert call(port, "PUT", f"/api/users/{lea_id}", {"group": "admin"}, **JSON, **lea_session)[0] == 403
    assert call(port, "PUT", f"/api/users/{lea_id}", {"name": "Lea B"}, **JSON, **lea_session)[0] == 200
    # what only this computer does stays this computer's, for a helper too
    assert call(port, "POST", "/api/quit", {}, **JSON, **helper, **{"X-Plenio-Player": "1"})[0] == 403


def test_only_the_admin_or_a_helper_takes_songs_out_of_the_library(tmp_path: Path) -> None:
    """A listener, a maker and a guest keep their own playlists, not the library's songs; a helper retires one from
    their phone - deleting for good stays this computer's."""
    folder = tmp_path / "songs"
    folder.mkdir()
    for title in ("One", "Two"):
        (folder / f"{title}.plenio.json").write_text(
            json.dumps({"title": title, "files": [{"name": f"{title}.flac", "format": "flac"}]}),
            encoding="utf-8",
        )
        (folder / f"{title}.flac").write_bytes(b"x" * 64)
    library = Library([folder])
    library.scan(force=True)
    accounts = Accounts(tmp_path / "state")
    server = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0, accounts=accounts)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        port = server.server_address[1]
        ids = {s["title"]: s["id"] for s in call(port, "GET", "/api/library")[2]["songs"]}

        def remove(title: str, **who: str) -> int:
            body = {"action": "retire", "confirm": ids[title]}
            return call(port, "POST", f"/api/song/{ids[title]}/remove", body, **JSON, **who)[0]

        sessions = {}
        for name, group in (("Lea", "listener"), ("Max", "maker"), ("Hal", "admin")):
            user = accounts.create(name, "secret1", group)
            answer = call(
                port,
                "POST",
                "/api/login",
                {"user": user["id"], "password": "secret1"},
                **JSON,
                **FROM_NETWORK,
            )
            sessions[name] = {**cookie_of(answer[1]), **FROM_NETWORK}
        assert remove("One", **sessions["Lea"]) == 403 and remove("One", **sessions["Max"]) == 403
        assert remove("One", **FROM_NETWORK) == 403  # a guest
        assert remove("One", **sessions["Hal"]) == 200
        assert remove("Two") == 200  # the admin, on this computer
        assert not (folder / "One.flac").exists() and not (folder / "Two.flac").exists()
    finally:
        server.shutdown()
        server.server_close()


def test_a_new_password_gets_the_players_rounds_and_an_old_one_is_checked_with_its_own(
    tmp_path: Path, production_password_rounds: int, monkeypatch: pytest.MonkeyPatch
) -> None:
    # the tests lower the rounds (tests/conftest.py); what the player ships is this
    assert production_password_rounds == 240_000
    from plenio.player import accounts as accounts_module

    monkeypatch.setattr(accounts_module, "ITERATIONS", production_password_rounds)
    accounts = Accounts(tmp_path)
    anna = accounts.create("Anna", "secret1")
    stored = json.loads((tmp_path / "users.json").read_text(encoding="utf-8"))
    assert stored["users"][0]["iterations"] == 240_000
    # the rounds change later (here: back to the tests' few): the stored password is checked with its own
    monkeypatch.setattr(accounts_module, "ITERATIONS", 1_000)
    assert accounts.login(anna["id"], "secret1")[1]["id"] == anna["id"]
