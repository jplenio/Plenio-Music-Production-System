"""Host integration: Plenio Setup's routes in a real ComfyUI - the plan for this (test) computer, and what a
download request is answered. The test server is offline (``PLENIO_OFFLINE=1``): nothing is fetched here; the
download manager itself is tested against a local stand-in host (``tests/unit/test_downloads.py``)."""

from __future__ import annotations

import pytest

from harness import ComfyServer

pytestmark = pytest.mark.host

REMOTE = {"X-Plenio-Remote": "1"}


def test_the_plan_names_a_file_and_a_reason_for_every_component(server: ComfyServer) -> None:
    plan = server.get("/plenio/setup/plan")
    assert plan["prefer"] == "balanced" and plan["policy"] == {"downloads": "ask", "offline": True}
    assert plan["downloads"] == [] and isinstance(plan["token"], bool)
    assert plan["vram_gib"] is None  # the test server runs on the processor
    templates = {t["template"]: t for t in plan["templates"]}
    assert set(templates) >= {
        "1 · YuE2 · Song",
        "2 · YuE2 · Cover",
        "3 · MiniMax · Song",
        "4 · Enhance & Master",
    }
    song = templates["1 · YuE2 · Song"]
    assert not song["ready"] and song["download_bytes"] > 0
    for pick in song["picks"]:
        assert pick["file"] and pick["reason"].startswith("no graphics card"), pick
        assert pick["variants"] and all(v["bytes"] > 0 for v in pick["variants"])
    # without a card the plan takes the files that need the least, and says they will be slow
    yue2 = next(p for p in song["picks"] if p["component"] == "yue2")
    assert yue2["file"] == "yue2_3b_int8_convrot.safetensors" and "very slow" in yue2["warning"]
    # no path of the server's folders in what the page gets
    assert str(server.base) not in str(plan) and str(server.base).replace("\\", "/") not in str(plan)


def test_a_download_is_refused_while_offline_and_for_what_is_not_the_catalogues(server: ComfyServer) -> None:
    status, data = server.request("POST", "/plenio/setup/downloads", {"variants": ["yue2-3b-int8"]})
    assert status == 400 and "Offline mode is on" in data["error"]["message"], data
    assert server.get("/plenio/setup/downloads") == {"downloads": []}
    status, data = server.request(
        "POST", "/plenio/setup/check", {"variant": "https://example.org/x.safetensors"}
    )
    assert status == 400 and "catalogue has no model file" in data["error"]["message"]
    for method, path in (
        ("DELETE", "/plenio/setup/downloads/yue2-3b-int8"),
        ("POST", "/plenio/setup/downloads/yue2-3b-int8/pause"),
        ("POST", "/plenio/setup/downloads/yue2-3b-int8/resume"),
    ):
        status, data = server.request(method, path, {} if method == "POST" else None)
        assert status == 400 and data["error"]["message"] == "No such download.", (path, data)


def test_what_is_no_token_is_refused_before_anything_is_sent(server: ComfyServer) -> None:
    status, data = server.request("POST", "/plenio/setup/hub-token", {"token": "not-a-token"})
    assert status == 400 and data["error"]["message"] == "That is no Hugging Face token."
    assert "not-a-token" not in str(data)
    assert server.request("POST", "/plenio/setup/hub-token", {})[0] == 400


def test_setup_answers_this_computer_only(server: ComfyServer) -> None:
    for method, path in (
        ("GET", "/plenio/setup/plan"),
        ("GET", "/plenio/setup/downloads"),
        ("POST", "/plenio/setup/downloads"),
        ("POST", "/plenio/setup/hub-token"),
        ("POST", "/plenio/setup/check"),
    ):
        body = (
            {"variants": ["yue2-3b-int8"], "token": "x", "variant": "yue2-3b-int8"}
            if method == "POST"
            else None
        )
        status, data = server.request(method, path, body, headers=REMOTE)
        assert status == 403 and data["error"]["type"] == "PlenioAccessError", (path, data)
