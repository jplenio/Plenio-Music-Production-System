"""Invitations (phase 6.1, People & access): a one-time code for a new user, valid 15 minutes, kept only as its hash;
the invited device sets a password or a PIN and is logged in; wrong codes make the device wait."""

from __future__ import annotations

import http.client
import json
import threading
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player import accounts as account_rules
from plenio.player.accounts import INVITE_SECONDS, AccountError, Accounts
from plenio.player.library import Library
from plenio.player.server import State, serve

JSON = {"Content-Type": "application/json"}
FROM_NETWORK = {"X-Plenio-Remote": "1", "X-Plenio-Remote-Host": "192.168.1.20"}


def test_a_code_works_once_and_is_kept_only_as_its_hash(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    code, invite = accounts.invite("Mia", "maker")
    assert len(code) == 16 and invite["name"] == "Mia" and invite["group"] == "maker"
    stored = (tmp_path / "users.json").read_text(encoding="utf-8")
    assert code not in stored and account_rules.session_key(code) in stored
    assert accounts.invitation(code) == {"name": "Mia", "group": "maker"}
    token, user = accounts.accept(code, "1234", "10.0.0.5")  # a four-digit PIN
    assert user["name"] == "Mia" and user["group"] == "maker"
    assert accounts.session(token)["id"] == user["id"]
    assert accounts.login(user["id"], "1234", "10.0.0.5")[1]["name"] == "Mia"
    with pytest.raises(AccountError) as again:
        accounts.accept(code, "5678", "10.0.0.6")
    assert again.value.status == 410
    assert accounts.invitations() == []


def test_after_fifteen_minutes_a_code_is_refused(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    code, _ = accounts.invite("Leo", "listener", now=1000.0)
    assert accounts.invitation(code, now=1000.0 + INVITE_SECONDS - 1) is not None
    assert accounts.invitation(code, now=1000.0 + INVITE_SECONDS + 1) is None
    with pytest.raises(AccountError) as late:
        accounts.accept(code, "secret1", "10.0.0.5", now=1000.0 + INVITE_SECONDS + 1)
    assert late.value.status == 410
    assert [u["name"] for u in accounts.users()] == []


def test_eight_wrong_codes_make_the_device_wait(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    code, _ = accounts.invite("Ada", "maker")
    for n in range(8):
        with pytest.raises(AccountError) as wrong:
            accounts.accept(f"wrong-{n}", "secret1", "10.0.0.9")
        assert wrong.value.status == 410
    with pytest.raises(AccountError) as wait:
        accounts.accept(code, "secret1", "10.0.0.9")  # even the right code waits now
    assert wait.value.status == 429
    assert accounts.accept(code, "secret1", "10.0.0.10")[1]["name"] == "Ada"  # another device


def test_names_rules_and_taking_back(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    accounts.create("Mia", "secret1")
    with pytest.raises(AccountError):
        accounts.invite("mia", "maker")  # taken
    with pytest.raises(AccountError):
        accounts.invite("Ben", "boss")  # no such role
    code, invite = accounts.invite("Ben", "admin")
    with pytest.raises(AccountError):
        accounts.accept(code, "abc", "x")  # too short: not spent
    assert accounts.invitation(code) is not None
    accounts.withdraw(invite["id"])
    assert accounts.invitation(code) is None
    with pytest.raises(AccountError):
        accounts.withdraw("0" * 16)


@pytest.fixture
def player(tmp_path: Path) -> Iterator[int]:
    library = Library([tmp_path / "songs"], cache=tmp_path / "state" / "cache.json")
    running = serve(library, State(tmp_path / "state" / "state.json"), "127.0.0.1", 0,
                    accounts=Accounts(tmp_path / "state"))  # fmt: skip
    threading.Thread(target=running.serve_forever, daemon=True).start()
    yield running.server_address[1]
    running.shutdown()
    running.server_close()


def call(
    port: int, method: str, path: str, body: Any = None, **headers: str
) -> tuple[int, dict[str, str], Any]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    connection.request(method, path, body=json.dumps(body) if body is not None else None,
                       headers={"Host": f"127.0.0.1:{port}", **headers})  # fmt: skip
    answer = connection.getresponse()
    data = answer.read()
    connection.close()
    return answer.status, dict(answer.getheaders()), json.loads(data) if data else None


def test_the_routes_from_invite_to_a_logged_in_phone(player: int) -> None:
    port = player
    # only the admin invites (this computer is the admin; a phone in the network is not)
    assert (
        call(port, "POST", "/api/invites", {"name": "Mia", "group": "maker"}, **JSON, **FROM_NETWORK)[0]
        == 403
    )
    code_, _, made = call(port, "POST", "/api/invites", {"name": "Mia", "group": "maker"}, **JSON)
    assert code_ == 200 and made["path"] == f"/#/join/{made['code']}"
    assert [i["name"] for i in call(port, "GET", "/api/invites")[2]["invites"]] == ["Mia"]
    # the phone opens the link: whom it invites, then a PIN
    assert call(port, "POST", "/api/invites/check", {"code": made["code"]}, **JSON, **FROM_NETWORK)[2] == {
        "invite": {"name": "Mia", "group": "maker"}
    }
    status, headers, accepted = call(
        port,
        "POST",
        "/api/invites/accept",
        {"code": made["code"], "password": "4711"},
        **JSON,
        **FROM_NETWORK,
    )
    assert status == 200 and accepted["user"]["name"] == "Mia"
    cookie = headers["Set-Cookie"].split(";")[0]
    session = call(port, "GET", "/api/session", Cookie=cookie, **FROM_NETWORK)[2]
    assert session["user"]["name"] == "Mia" and session["chosen"]
    assert call(port, "POST", "/api/invites/check", {"code": made["code"]}, **JSON)[0] == 410
    # not from another site's page
    assert call(port, "POST", "/api/invites/accept", {"code": "x", "password": "1234"})[0] == 403


def test_a_users_file_of_1_6_0_keeps_its_permissions(tmp_path: Path) -> None:
    """People & access names the groups anew (Listener, Maker, Co-host); the stored ids stay, so a file of 1.6.0 -
    without invitations - reads with the same groups and logins."""
    accounts = Accounts(tmp_path)
    made = {g: accounts.create(f"User {g}", "secret1", g) for g in ("listener", "maker", "admin")}
    data = json.loads((tmp_path / "users.json").read_text(encoding="utf-8"))
    data.pop("invites", None)  # as 1.6.0 wrote it
    (tmp_path / "users.json").write_text(json.dumps(data), encoding="utf-8")
    again = Accounts(tmp_path)
    for group, user in made.items():
        found = again.user(user["id"])
        assert found is not None and found["group"] == group and found["helper"] == (group == "admin")
        assert again.login(user["id"], "secret1", "10.0.0.1")[1]["group"] == group
    assert again.invitations() == []


def test_wrong_pins_are_counted_by_device_and_by_user(player: int, tmp_path: Path) -> None:
    """Review of phase 6: the limit followed the Host header the browser sent through the gateway - a new one each
    try went on for ever. It follows the device's address (the gateway's own header) and each user as well."""
    port = player
    made = call(port, "POST", "/api/invites", {"name": "Ada", "group": "admin"}, **JSON)[2]
    status, _, user = call(
        port, "POST", "/api/invites/accept", {"code": made["code"], "password": "1234"}, **JSON
    )
    ada = user["user"]["id"]
    for n in range(8):  # one device, a new Host header each time
        headers = {
            **FROM_NETWORK,
            "X-Plenio-Remote-Host": f"10.0.0.{n}:8780",
            "X-Plenio-Remote-Peer": "192.168.1.50",
        }
        assert (
            call(port, "POST", "/api/login", {"user": ada, "password": f"{n:04d}"}, **JSON, **headers)[0]
            == 401
        )
    headers = {**FROM_NETWORK, "X-Plenio-Remote-Peer": "192.168.1.50"}
    assert call(port, "POST", "/api/login", {"user": ada, "password": "1234"}, **JSON, **headers)[0] == 429
    # another device is not held back by the first one
    other = {**FROM_NETWORK, "X-Plenio-Remote-Peer": "192.168.1.51"}
    assert call(port, "POST", "/api/login", {"user": ada, "password": "1234"}, **JSON, **other)[0] == 200


def test_many_devices_cannot_try_every_pin_of_one_user(tmp_path: Path) -> None:
    accounts = Accounts(tmp_path)
    user = accounts.create("Ben", "4711", "admin")
    for n in range(20):
        with pytest.raises(AccountError):
            accounts.login(user["id"], f"{n:04d}", f"10.0.{n}.1")
    with pytest.raises(AccountError) as wait:
        accounts.login(user["id"], "4711", "10.9.9.9")
    assert wait.value.status == 429


def test_only_the_host_changes_the_guests_access(player: int) -> None:
    """Review of phase 6: a listener's session (or no login) from the network could switch the party's page."""
    port = player
    made = call(port, "POST", "/api/invites", {"name": "Leo", "group": "listener"}, **JSON)[2]
    _, headers, _ = call(
        port, "POST", "/api/invites/accept", {"code": made["code"], "password": "1234"}, **JSON
    )
    leo = {"Cookie": headers["Set-Cookie"].split(";")[0], **FROM_NETWORK}
    for who in (leo, FROM_NETWORK):
        assert (
            call(port, "PUT", "/api/guests", {"mode": "change", "regenerate": True}, **JSON, **who)[0] == 403
        )
        assert call(port, "POST", "/api/guests/live", {"live": True}, **JSON, **who)[0] == 403
        assert call(port, "GET", "/api/guests/wishes", **who)[0] == 403


def test_a_player_started_with_host_never_takes_another_computer_for_this_one(tmp_path: Path) -> None:
    """Review of phase 6 (owner's decision 2026-11-12, security over rule 9): with ``--host`` a device in the network
    reached the player directly and counted as this computer - the admin, without a login."""
    from email.message import Message

    from plenio.player import server as server_module

    accounts = Accounts(tmp_path)
    library = Library([tmp_path / "songs"], cache=tmp_path / "cache.json")
    handler = server_module.make_handler(library, State(tmp_path / "state.json"), accounts=accounts)

    def request(address: str) -> Any:
        found = object.__new__(handler)
        found.client_address = (address, 50000)
        found.headers = Message()
        return found

    lan, here = request("192.168.1.77"), request("127.0.0.1")
    assert lan.here is False and lan.account is None
    assert here.here is True and here.account["admin"] is True
    token, _ = accounts.login_admin()
    lan.headers["Cookie"] = f"plenio_session={token}"
    assert lan.account is None  # the admin's session counts on this computer only


def test_a_forged_second_mark_or_peer_changes_nothing(tmp_path: Path) -> None:
    from email.message import Message

    from plenio.player import server as server_module

    accounts = Accounts(tmp_path)
    library = Library([tmp_path / "songs"], cache=tmp_path / "cache.json")
    handler = server_module.make_handler(library, State(tmp_path / "state.json"), accounts=accounts)
    found = object.__new__(handler)
    found.client_address = ("127.0.0.1", 50000)
    found.headers = Message()
    found.headers["X-Plenio-Remote"] = "0"
    found.headers["X-Plenio-Remote"] = "1"
    found.headers["X-Plenio-Remote-Peer"] = "9.9.9.9"
    found.headers["X-Plenio-Remote-Peer"] = "192.168.1.50"
    assert found.remote is True and found.here is False and found.account is None
    assert found._peer() == "net:192.168.1.50"
    lan = object.__new__(handler)
    lan.client_address = ("192.168.1.77", 50000)
    lan.headers = Message()
    monkeypatch_own = server_module._own
    try:
        server_module._own = (1e18, frozenset({"192.168.1.10"}))
        assert lan.here is False
        lan.client_address = ("192.168.1.10", 50000)  # this computer's own address: a --host player's owner
        assert lan.here is True and lan.account["admin"] is True
    finally:
        server_module._own = monkeypatch_own
