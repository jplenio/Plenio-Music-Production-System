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
        ("GET", "/plenio/setup/state"),
        ("POST", "/plenio/setup/state"),
        ("GET", "/plenio/setup/findings"),
        ("GET", "/plenio/setup/folders"),
    ):
        body = (
            {"variants": ["yue2-3b-int8"], "token": "x", "variant": "yue2-3b-int8"}
            if method == "POST"
            else None
        )
        status, data = server.request(method, path, body, headers=REMOTE)
        assert status == 403 and data["error"]["type"] == "PlenioAccessError", (path, data)


def test_setup_remembers_its_step_and_the_templates(server: ComfyServer) -> None:
    first = server.get("/plenio/setup/state")
    assert first["state"]["step"] == "computer" and first["version"]
    changed = server.request(
        "POST", "/plenio/setup/state", {"step": "plan", "templates": ["1 · YuE2 · Song"], "opened_for": "x"}
    )
    assert changed[0] == 200, changed
    again = server.get("/plenio/setup/state")["state"]
    assert (
        again["step"] == "plan" and again["templates"] == ["1 · YuE2 · Song"] and again["opened_for"] == "x"
    )
    assert (server.base / "user" / "plenio" / "setup.json").is_file()
    status, data = server.request("POST", "/plenio/setup/state", {"templates": ["9 · Nothing"]})
    assert status == 400 and "no template" in data["error"]["message"]
    server.request("POST", "/plenio/setup/state", {"step": "computer", "templates": [], "opened_for": ""})


def test_the_findings_carry_ids_and_fixes(server: ComfyServer) -> None:
    answer = server.get("/plenio/setup/findings")
    ids = {item["id"] for item in answer["findings"]}
    assert "model.missing" in ids  # the test server has no model files
    from plenio.core.system import FINDINGS

    assert ids <= set(FINDINGS)  # only documented ids
    missing = next(item for item in answer["findings"] if item["id"] == "model.missing")
    assert missing["fix"]["action"] == "download" and missing["fix"]["payload"]["variant"]
    assert answer["computer"]["disk_free_bytes"] > 0 and answer["computer"]["comfyui"]


def test_the_folders_are_comfyuis_and_a_download_goes_nowhere_else(server: ComfyServer) -> None:
    folders = server.get("/plenio/setup/folders")["folders"]
    assert folders["checkpoints"][0]["target"] and folders["checkpoints"][0]["free_bytes"] > 0
    status, data = server.request(
        "POST",
        "/plenio/setup/downloads",
        {"variants": ["yue2-3b-int8"], "folders": {"checkpoints": "C:/elsewhere"}},
    )
    # offline refuses first; the folder check itself is a unit of setup.py's _targets
    assert status == 400, data


def test_a_problem_report_carries_no_place_and_no_user_name(server: ComfyServer) -> None:
    from pathlib import Path

    user = Path.home().name
    workflow = {
        "nodes": [{"type": "PlenioSongBrief", "widgets_values": ["a song about my secret garden", "pop"]}]
    }
    error = {"exception_message": f"cannot read {server.base / 'models' / 'checkpoints' / 'x.safetensors'}"}
    status, data = server.request("POST", "/plenio/setup/report", {"workflow": workflow, "error": error})
    assert status == 200, data
    files = data["files"]
    assert {"README.txt", "system-check.md", "comfyui-log.txt", "error.json", "workflow.json"} <= set(files)
    text = "\n".join(files.values())
    assert "secret garden" not in text and "…/checkpoints/x.safetensors" in text
    assert str(server.base) not in text and str(Path.home()) not in text
    assert user.lower() not in text.lower(), [
        line for line in text.splitlines() if user.lower() in line.lower()
    ][:3]
    status, _ = server.request("POST", "/plenio/setup/report", {}, headers=REMOTE)
    assert status == 403
