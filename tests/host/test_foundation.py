"""Host integration (V2): Plenio inside a real ComfyUI server with test nodes.

Covers registration, routes, the System Check node and the Phase 2 spikes
AS-02 (backend half), AS-03 (lazy inputs + ExecutionBlocker + caching) and
AS-10 (blueprints from ``subgraphs/`` are served).
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, Log
from plenio import __version__

pytestmark = pytest.mark.host

PROJECT = Path(__file__).resolve().parents[2]


def test_plenio_loads_without_errors(server: ComfyServer) -> None:
    info = server.get("/object_info/PlenioSystemCheck")["PlenioSystemCheck"]
    assert info["category"] == "Plenio/Utilities"
    assert info["output"] == ["PLENIO_REPORT"]
    text = server.log_text()
    assert "Cannot import" not in text and "Error while calling comfy_entrypoint" not in text
    assert f"Plenio {__version__}" in text


def test_the_node_type_snapshot_matches_the_server(comfy_path: Path, tmp_path: Path) -> None:
    """The offline workflow validator (CI without ComfyUI) checks graphs against tools/data/node_types.json.
    Phase 9 changed Transcribe Lyrics tooltips without refreshing it (Phase 10 review). A fresh server
    as the tool uses it: user templates and input files of other tests change combo options."""
    from snapshot_node_types import take_snapshot

    committed = json.loads((PROJECT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))
    live = take_snapshot(comfy_path, tmp_path / "comfy")
    assert sorted(n for n in live["nodes"] if n.startswith("Plenio")) == sorted(
        n for n in committed["nodes"] if n.startswith("Plenio")
    )
    same_comfyui = committed["comfyui_version"] == live["comfyui_version"]  # native nodes change with it
    stale = [
        name
        for name, entry in live["nodes"].items()
        if (name.startswith("Plenio") or same_comfyui) and committed["nodes"].get(name) != entry
    ]
    assert stale == [], f"re-run tools/snapshot_node_types.py (changed: {stale})"


def test_system_route(server: ComfyServer) -> None:
    data = server.get("/plenio/system")
    assert data["report"]["schema"] == "plenio.report/1"
    assert data["report"]["kind"] == "system_check"
    assert "## Plenio System Check" in data["markdown"]
    # the inventory comes from ComfyUI's model folders (the test server has none of the files)
    report = data["report"]["data"]
    assert {row["template"] for row in report["templates"]} >= {"1 · YuE2 · Song", "4 · Enhance & Master"}
    assert all(row["status"] == "missing" for row in report["models"])
    assert "not downloaded" in report["facts"]["assets"]["faster-whisper-large-v3"]
    assert "### Hardware rule table" in data["markdown"]


def test_unknown_plenio_route_is_404(server: ComfyServer) -> None:
    status, _ = server.request("GET", "/plenio/does-not-exist")
    assert status == 404


def test_system_check_node_runs_every_time(server: ComfyServer) -> None:
    prompt = {"1": {"class_type": "PlenioSystemCheck", "inputs": {"detail": "full"}}}
    for _ in range(2):  # not cached: facts change outside the graph
        entry = server.run(prompt)
        summary = entry["outputs"]["1"]["plenio_summary"][0]
        assert "### Raw facts" in summary["markdown"]
        assert summary["status"] in ("ok", "warning")


def test_frontend_extension_is_served(server: ComfyServer) -> None:
    extensions = server.get("/extensions")
    ours = [path for path in extensions if path.startswith(f"/extensions/{PACKAGE_NAME}/")]
    assert ours == [f"/extensions/{PACKAGE_NAME}/js/plenio.js"]
    status, body = server.request("GET", ours[0])
    assert status == 200 and "scripts/app.js" in body
    # The entry imports its code from .mjs chunks, which ComfyUI does not auto-load as extensions.
    chunk = body.split('from "./')[1].split('"')[0]
    status, code = server.request("GET", f"/extensions/{PACKAGE_NAME}/js/{chunk}")
    assert status == 200 and "Plenio.Core" in code


def test_templates_are_listed(server: ComfyServer) -> None:
    templates = server.get("/workflow_templates")
    assert "0 · System Check" in templates[PACKAGE_NAME]


# --- AS-10: blueprints ----------------------------------------------------------


def test_blueprints_from_subgraphs_folder_are_served(server: ComfyServer) -> None:
    entries = server.get("/global_subgraphs")
    ours = {
        key: value
        for key, value in entries.items()
        if value["info"]["node_pack"] == f"custom_nodes.{PACKAGE_NAME}"
    }
    names = {value["name"] for value in ours.values()}
    assert "Plenio Test Blueprint" in names
    key = next(k for k, v in ours.items() if v["name"] == "Plenio Test Blueprint")
    data = json.loads(server.get(f"/global_subgraphs/{key}")["data"])
    assert data["definitions"]["subgraphs"][0]["name"] == "Plenio Test Blueprint"


# --- AS-03: lazy inputs, per-output blocking, caching ----------------------------


def gate_prompt(mode: str, value: str, label: str | None = None) -> dict[str, Any]:
    label = label or uuid.uuid4().hex  # unique label: nothing is cached from earlier tests
    return {
        "1": {"class_type": "PlenioTestSource", "inputs": {"name": label, "value": value}},
        "2": {"class_type": "PlenioTestGate", "inputs": {"text": ["1", 0], "mode": mode}},
        "3": {"class_type": "PlenioTestSink", "inputs": {"value": ["2", 0], "label": "text"}},
        "4": {"class_type": "PlenioTestSink", "inputs": {"value": ["2", 1], "label": "report"}},
    }


def test_manual_document_does_not_evaluate_the_upstream(server: ComfyServer, log: Log) -> None:
    entry = server.run(gate_prompt("manual", "draft"))
    assert "source" not in log.nodes()
    assert entry["outputs"]["3"]["received"] == ["manual text"]


def test_blocked_output_stops_only_its_branch_silently(server: ComfyServer, log: Log) -> None:
    entry = server.run(gate_prompt("block", "draft"))  # success, not an error
    assert log.nodes().count("source") == 1
    sinks = [e["label"] for e in log.events() if e["node"] == "sink"]
    assert sinks == ["report"]  # the report branch runs, the document branch waits
    assert entry["outputs"]["2"]["plenio_summary"][0]["markdown"] == "waiting"
    assert "3" not in entry["outputs"]


def test_approval_rerun_reuses_cached_upstream(server: ComfyServer, log: Log) -> None:
    label = uuid.uuid4().hex
    server.run(gate_prompt("block", "draft", label))
    assert log.nodes().count("source") == 1
    log.clear()
    entry = server.run(gate_prompt("pass", "draft", label))  # user approved: only the gate re-runs
    assert "source" not in log.nodes()
    assert "gate" in log.nodes()
    assert entry["outputs"]["3"]["received"] == ["draft"]
    log.clear()
    server.run(gate_prompt("pass", "draft", label))  # identical prompt: fully cached
    assert log.nodes() == []


# --- AS-02 (backend half): custom widget values arrive unchanged ------------------


@pytest.mark.parametrize("value", ["", '{"schema":"plenio.sheet_state/1","docs":{}}', "Grüße\n[Verse]"])
def test_custom_widget_value_reaches_execute(server: ComfyServer, log: Log, value: str) -> None:
    marker = uuid.uuid4().hex
    state = value + marker if value else marker
    entry = server.run({"1": {"class_type": "PlenioTestWidgetEcho", "inputs": {"sheet_state": state}}})
    assert entry["outputs"]["1"]["received"] == [state]
    assert log.events()[-1] == {"node": "echo", "value": state, "type": "str"}


def test_cached_nodes_send_their_summary_again(server: ComfyServer) -> None:
    """0.2.2: the summary of a cached node (Song Brief, EQ, ...) was shown only after the run that
    executed it - after a reload or tab switch it stayed empty. `has_intermediate_output` makes
    ComfyUI re-send the cached UI on every run."""
    prompt = {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "mode": "one song, stop to review",
                "template": "none",
                "description": f"A cached summary {uuid.uuid4().hex[:6]}",
                "genre": "piano pop",
                "mood": "",
                "tempo": "",
                "length": "short (about 1:30)",
                "vocals": "sung",
                "vocals.language": "English",
                "vocals.voice": "",
                "vocals.theme": "",
                "key": "",
                "meter": "",
            },
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 1], "label": "summary"}},
    }
    first = server.run(prompt)
    prompt["2"]["inputs"]["label"] = "summary again"  # the sink runs again, the brief is cached
    second = server.run(prompt)
    cached = [m[1]["nodes"] for m in second["status"]["messages"] if m[0] == "execution_cached"][0]
    assert "1" in cached
    assert second["outputs"]["1"]["plenio_summary"] == first["outputs"]["1"]["plenio_summary"]
