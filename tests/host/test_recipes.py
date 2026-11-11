"""Host integration (phase 4.8): every recipe is accepted by ComfyUI's own validation and runs until its first model
loader (the catalogue's files are empty here - real files make the songs), and Brief List hands one entry per run."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from harness import PROJECT, ComfyServer, Log
from plenio.core.models import load_catalogue
from plenio.core.workflow_prompt import to_prompt

pytestmark = pytest.mark.host

RECIPES = sorted((PROJECT / "example_workflows" / "recipes").glob("*.json"))
NODES: dict[str, Any] = json.loads(
    (PROJECT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8")
)["nodes"]


@pytest.fixture(scope="module")
def models(server: ComfyServer) -> ComfyServer:
    for model in load_catalogue(PROJECT / "resources" / "models.toml").values():
        target = server.base / "models" / model.folder / model.file
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists():
            target.write_bytes(b"")
    return server


@pytest.mark.parametrize("path", RECIPES, ids=lambda p: p.stem)
def test_comfyui_takes_every_recipe(models: ComfyServer, path: Path) -> None:
    workflow = json.loads(path.read_text(encoding="utf-8"))
    prompt = to_prompt(workflow, NODES.get)
    prompt_id = models.queue(prompt, {"workflow": workflow})  # raises when ComfyUI refuses it
    entry = models.wait(prompt_id, timeout=300)
    messages = [event for event, _data in entry["status"].get("messages", [])]
    assert "execution_start" in messages, entry["status"]
    # the empty model files stop the run at a loader (or Load Audio, whose files the recipe names)
    failed = next((data for event, data in entry["status"]["messages"] if event == "execution_error"), None)
    assert failed is None or failed["node_type"] not in ("PlenioBriefList", "PlenioPreset"), failed


def test_brief_list_hands_one_entry_per_run(server: ComfyServer) -> None:
    log = Log(server.output_dir / "plenio_test_log.jsonl")
    log.clear()
    for index in range(4):
        server.run(
            {
                "1": {
                    "class_type": "PlenioBriefList",
                    "inputs": {"entries": "first\n# left out\nsecond\n\nthird", "file": "", "index": index},
                },
                "2": {
                    "class_type": "PlenioTestSink",
                    "inputs": {"value": ["1", 0], "label": f"entry{index}"},
                },
            }
        )
    got = [
        e["value"]
        for e in log.events()
        if e.get("node") == "sink" and str(e.get("label", "")).startswith("entry")
    ]
    assert got == ["first", "second", "third", "first"]
