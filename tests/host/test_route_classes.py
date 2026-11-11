"""Host integration: every route of Plenio in ComfyUI, walked by its access class (``plenio.core.access``).

ComfyUI has no login: with ``--listen`` - or through the Plenio Player's *In your network* - another computer
reaches Plenio's routes. Each route declares who is answered; this test asks every one of them as another computer
would and checks that a ``local`` route refuses, and that no answer names a place on this computer.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import pytest

from harness import ComfyServer

pytestmark = pytest.mark.host

REMOTE = {"X-Plenio-Remote": "1", "X-Forwarded-For": "192.168.1.20"}
PLACEHOLDER = re.compile(r"\{(\w+)(:[^}]*)?\}")
VALUES = {
    "draft_sha256": "0" * 64,
    "kind": "eq",
    "template_id": "none",
    "job_id": "0" * 32,
    "name": "song.flac",
}
"""Something to put where a path names a thing: well-formed, and not there."""


def all_routes(comfy_path: Path) -> list[Any]:
    """The route tables, read in this process (``comfy_path`` makes ComfyUI importable for the modules' imports)."""
    from plenio.comfy import routes, setup, song_api_v1, song_api_v2

    return [*routes.ROUTES, *setup.ROUTES, *song_api_v1.ROUTES, *song_api_v2.ROUTES]


def path_of(route: Any) -> str:
    return PLACEHOLDER.sub(lambda match: VALUES.get(match.group(1), "x"), route.path)


def test_every_route_has_an_access_class(comfy_path: Path) -> None:
    from plenio.core.access import CLASSES

    routes = all_routes(comfy_path)
    assert len(routes) >= 38
    assert [f"{r.method} {r.path}" for r in routes if r.access not in CLASSES] == []
    keys = [(r.method, r.path) for r in routes]
    assert len(keys) == len(set(keys))  # no route is listed twice with two answers
    by_class = {name: [r.path for r in routes if r.access == name] for name in CLASSES}
    assert {"/plenio/player/open", "/plenio/system", "/plenio/setup/plan"} <= set(by_class["local"])
    assert all(
        p.startswith("/plenio/setup/")
        for p in by_class["local"]
        if p not in ("/plenio/player/open", "/plenio/system")
    )
    api_v1 = [path for path in by_class["api"] if path.startswith("/plenio/api/v1")]
    assert (
        all(path.startswith("/plenio/api/") for path in by_class["api"]) and len(api_v1) == 16
    )  # v1 as 1.6.0
    assert not [r.path for r in routes if r.access != "api" and r.path.startswith("/plenio/api/")]
    # a compute route takes a body and keeps nothing: none of them is a GET or has a name in its path
    assert all(r.method == "POST" and "{" not in r.path for r in routes if r.access == "compute")


def test_every_route_is_registered_with_the_server(server: ComfyServer, comfy_path: Path) -> None:
    for route in all_routes(comfy_path):
        status, _ = server.request(route.method, path_of(route), {} if route.method == "POST" else None)
        assert status != 405, f"{route.method} {route.path} is not registered"


def test_a_local_route_answers_this_computer_only(server: ComfyServer, comfy_path: Path) -> None:
    local = [r for r in all_routes(comfy_path) if r.access == "local"]
    assert local
    for route in local:
        body = {} if route.method == "POST" else None
        status, data = server.request(route.method, path_of(route), body, headers=REMOTE)
        assert status == 403 and data["error"]["type"] == "PlenioAccessError", (route.path, status, data)
        assert route.what in data["error"]["message"] and data["error"]["hint"] == route.hint


def test_a_local_route_refuses_a_page_whose_name_points_here(server: ComfyServer, comfy_path: Path) -> None:
    """DNS rebinding: the connection comes from loopback, the Host header names another site."""
    rebound = {"Host": "rebound.example:8188"}
    for route in (r for r in all_routes(comfy_path) if r.access == "local"):
        body = {} if route.method == "POST" else None
        status, data = server.request(route.method, path_of(route), body, headers=rebound)
        assert status == 403 and data["error"]["type"] == "PlenioAccessError", (route.path, status, data)
    status, _ = server.request("GET", "/plenio/setup/plan", headers={"Host": "localhost"})
    assert status == 200


def test_no_answer_to_another_computer_names_a_place_on_this_one(
    server: ComfyServer, comfy_path: Path
) -> None:
    """Whatever a route answers a request from the network - a result, a refusal, an error - holds no absolute
    path: not the server's folders, not the package's, not a home folder."""
    places = {str(server.base), str(server.root), str(Path.home()), str(Path(__file__).resolve().parents[2])}
    needles = {
        p.lower() for place in places for p in (place, place.replace("\\", "/"), place.replace("\\", "\\\\"))
    }
    drive = re.compile(r"(?<![A-Za-z])[A-Za-z]:[\\/]{1,2}[\w .-]+[\\/]")  # C:\Users\..., D:/ComfyUI/...
    leaks: list[str] = []
    for route in all_routes(comfy_path):
        body = {} if route.method in ("POST", "PUT") else None
        _status, data = server.request(route.method, path_of(route), body, headers=REMOTE)
        text = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False)
        if any(needle in text.lower() for needle in needles) or drive.search(text):
            leaks.append(f"{route.method} {route.path}: {text[:200]}")
    assert leaks == []
