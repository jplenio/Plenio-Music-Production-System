"""Host integration (phase 5.4): who on another computer the Song API answers - ``[api] remote`` and tokens.

A request "from another computer" carries ``X-Plenio-Remote`` (what the Plenio Player's gateway adds; any
request with it counts as not from this computer)."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from collections.abc import Iterator

import pytest

from harness import ComfyServer

pytestmark = pytest.mark.host

REMOTE = {"X-Plenio-Remote": "1"}


@pytest.fixture
def config(server: ComfyServer) -> Iterator[object]:
    path = server.base / "user" / "plenio" / "config.toml"
    before = path.read_bytes() if path.exists() else None

    def set_remote(mode: str | None) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("" if mode is None else f'[api]\nremote = "{mode}"\n', encoding="utf-8")

    yield set_remote
    if before is None:
        path.unlink(missing_ok=True)
    else:
        path.write_bytes(before)


def raw(server: ComfyServer, path: str, headers: dict[str, str]) -> tuple[int, dict[str, str], dict]:
    request = urllib.request.Request(server.url + path, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=60) as answer:  # noqa: S310 - local test server
            return answer.status, dict(answer.headers), json.loads(answer.read())
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers), json.loads(error.read())


def test_another_computer_needs_a_token_this_one_none(server: ComfyServer, config) -> None:
    config(None)  # the default: token
    local = server.get("/plenio/api/v1/templates")
    for path in ("/plenio/api/v1/templates", "/plenio/api/v2/templates"):
        status, headers, data = raw(server, path, REMOTE)
        assert status == 401 and data["error"]["code"] == "unauthorized", data
        assert "API access" in data["error"]["hint"] and 'remote = "open"' in data["error"]["hint"]
        assert headers.get("WWW-Authenticate", "").startswith("Bearer")
    status, made = server.request("POST", "/plenio/setup/tokens", {"name": "my DAW"})
    assert status == 201 and made["token"].startswith("plenio_"), made
    try:
        status, _headers, data = raw(
            server, "/plenio/api/v1/templates", {**REMOTE, "Authorization": f"Bearer {made['token']}"}
        )
        assert status == 200 and data == local  # with a token: as this computer gets it
        status, _h, _d = raw(
            server, "/plenio/api/v1/templates", {**REMOTE, "Authorization": "Bearer plenio_wrong"}
        )
        assert status == 401
        stored = (server.base / "user" / "plenio" / "api" / "tokens.json").read_text(encoding="utf-8")
        assert made["token"] not in stored  # only its hash is kept
        listed = server.get("/plenio/setup/tokens")
        mine = next(t for t in listed["tokens"] if t["id"] == made["id"])
        assert mine["name"] == "my DAW" and mine["last_used"] and "sha256" not in json.dumps(listed)
        assert listed["remote"] == "token"
        assert server.request("GET", "/plenio/setup/tokens", headers=REMOTE)[0] == 403  # made here only
    finally:
        server.request("DELETE", f"/plenio/setup/tokens/{made['id']}")
    status, _h, _d = raw(
        server, "/plenio/api/v1/templates", {**REMOTE, "Authorization": f"Bearer {made['token']}"}
    )
    assert status == 401  # taken back


def test_open_answers_as_1_x_and_off_answers_nobody_else(server: ComfyServer, config) -> None:
    config("open")
    status, _headers, data = raw(server, "/plenio/api/v1/templates", REMOTE)
    assert status == 200 and data["templates"]
    config("off")
    status, _headers, data = raw(server, "/plenio/api/v2/templates", REMOTE)
    assert status == 403 and data["error"]["code"] == "remote_off", data
    assert server.get("/plenio/api/v1/templates")["templates"]  # this computer still
    config(None)


def test_the_brief_lists_need_no_token(server: ComfyServer, config) -> None:
    config(None)
    status, _headers, data = raw(server, "/plenio/brief/choices?kind=song", REMOTE)
    assert status == 200 and data, data
