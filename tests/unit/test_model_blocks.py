"""*Bring the model blocks up to date* (``core.blocks.upgrade_models``): a workflow saved with 1.x gets the 2.0 model
blocks with Model Choice - asked for, never on opening - and keeps the files it loaded as the Model Choices' pins."""

from __future__ import annotations

import copy
import gzip
import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core import blocks
from plenio.core.workflow_prompt import to_prompt

ROOT = Path(__file__).resolve().parents[2]
SAVED = [
    "1.0.1 song, as the frontend saved it",
    "1.0.1 cover template",
    "1.6.0 song template",
    "1.6.0 MiniMax song template",
]
FINETUNE = "yue2_3b_RS-FW-2.4x0.75_int8_convrot.safetensors"


def saved(name: str) -> dict[str, Any]:
    return json.loads(
        gzip.decompress((ROOT / "tests" / "fixtures" / "workflows" / f"{name}.json.gz").read_bytes())
    )


def shipped() -> dict[str, blocks.Block]:
    return blocks.model_blocks(
        [json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "subgraphs").glob("*.json")]
    )


def snapshot() -> Any:
    return json.loads((ROOT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))["nodes"].get


def loader_files(prompt: dict[str, Any]) -> dict[str, set[str]]:
    """The file each loader of the prompt gets: written in it (1.x) or from the Model Choice feeding it."""
    files: dict[str, set[str]] = {}
    for node in prompt.values():
        widget = blocks.LOADER_FILES.get(node["class_type"])
        if widget is None:
            continue
        value = node["inputs"].get(widget)
        if isinstance(value, list):
            source = prompt[str(value[0])]
            if source["class_type"] != blocks.MODEL_CHOICE:
                continue  # the writer's loader takes its file from Writer Choice, before and after
            value = source["inputs"]["component.file"]
        files.setdefault(node["class_type"], set()).add(value)
    return files


@pytest.mark.parametrize("name", SAVED)
def test_the_model_blocks_become_the_current_ones_and_load_the_files_they_loaded(name: str) -> None:
    workflow = saved(name)
    before = to_prompt(workflow, snapshot())
    assert blocks.models_outdated(workflow, shipped())
    upgraded = blocks.upgrade_models(workflow, shipped())
    assert upgraded.kept == () and upgraded.updated
    assert not blocks.models_outdated(upgraded.workflow, shipped())
    after = to_prompt(upgraded.workflow, snapshot())
    choices = [n for n in after.values() if n["class_type"] == blocks.MODEL_CHOICE]
    assert choices
    # every Model Choice holds the file the old loader had - a pin, not auto
    assert all(n["inputs"]["component.file"] != "auto" for n in choices)
    assert loader_files(after) == loader_files(before)
    assert workflow == saved(name)  # the original is left as it was (a copy is changed)


def test_the_file_chosen_on_the_block_is_the_pin() -> None:
    workflow = saved("1.6.0 song template")
    definition = next(d for d in workflow["definitions"]["subgraphs"] if d["name"] == "Plenio · YuE2 Model")
    block = next(n for n in workflow["nodes"] if n["type"] == definition["id"])
    block["widgets_values"] = [FINETUNE]
    after = to_prompt(blocks.upgrade_models(workflow, shipped()).workflow, snapshot())
    checkpoint = next(n for n in after.values() if n["class_type"] == "CheckpointLoaderSimple")
    choice = after[str(checkpoint["inputs"]["ckpt_name"][0])]
    assert choice["inputs"] == {"component": "yue2", "component.file": FINETUNE}


def test_an_adapter_switched_on_inside_the_block_stays_on() -> None:
    workflow = saved("1.6.0 song template")
    definition = next(d for d in workflow["definitions"]["subgraphs"] if d["name"] == "Plenio · YuE2 Model")
    lora = next(n for n in definition["nodes"] if n["type"] == "LoraLoader")
    lora["mode"], lora["widgets_values"] = 0, ["my_adapter.safetensors", 0.6, 0.9]
    fresh = blocks.upgrade_models(workflow, shipped()).workflow
    new = next(d for d in fresh["definitions"]["subgraphs"] if d["name"] == "Plenio · YuE2 Model")
    loader = next(n for n in new["nodes"] if n["type"] == "LoraLoader")
    assert loader["mode"] == 0 and loader["widgets_values"] == ["my_adapter.safetensors", 0.6, 0.9]
    choice = next(
        n for n in new["nodes"] if n["type"] == blocks.MODEL_CHOICE and n["widgets_values"][0] != "yue2"
    )
    assert choice["widgets_values"] == ["yue2-instrumental-adapter", "my_adapter.safetensors"]


def test_a_block_changed_by_hand_inside_is_kept_and_named() -> None:
    workflow = saved("1.6.0 song template")
    definition = next(d for d in workflow["definitions"]["subgraphs"] if d["name"] == "Plenio · Cover Art")
    scheduler = next(n for n in definition["nodes"] if n["type"] == "Flux2Scheduler")
    scheduler["widgets_values"] = [8, 1024, 1024]  # eight steps instead of four
    upgraded = blocks.upgrade_models(copy.deepcopy(workflow), shipped())
    assert upgraded.updated == ("Plenio · YuE2 Model",)
    ((name, why),) = upgraded.kept
    assert name == "Plenio · Cover Art" and "changed inside the block" in why


def test_a_workflow_with_the_current_model_blocks_has_nothing_to_offer() -> None:
    template = json.loads((ROOT / "example_workflows" / "1 · YuE2 · Song.json").read_text(encoding="utf-8"))
    assert blocks.models_outdated(template, shipped()) == []
    upgraded = blocks.upgrade_models(template, shipped())
    assert upgraded.updated == () and upgraded.workflow == template


def test_opening_a_workflow_never_changes_its_model_blocks() -> None:
    """The automatic upgrade on opening (creativity) does not touch them: only the explicit request does."""
    files = [json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "subgraphs").glob("*.json")]
    for name in SAVED:
        found = blocks.upgrade(saved(name), blocks.current_blocks(files), {})
        assert not {"Plenio · YuE2 Model", "Plenio · MiniMax Model", "Plenio · Cover Art"} & set(
            found.updated
        )


def _block(workflow: dict[str, Any], name: str) -> dict[str, Any]:
    return next(d for d in workflow["definitions"]["subgraphs"] if d["name"] == name)


def test_a_node_added_removed_or_switched_inside_keeps_the_block() -> None:
    """The review after 3.5 (C3): a LoRA of one's own chained in, a second VAE, a node removed or bypassed inside -
    the block is kept and named, never upgraded with the change lost."""
    added_lora = saved("1.6.0 song template")
    _block(added_lora, "Plenio · YuE2 Model")["nodes"].append(
        {
            "id": 150,
            "type": "LoraLoader",
            "mode": 0,
            "widgets_values": ["my_style_lora.safetensors", 0.8, 0.8],
        }
    )
    added_vae = saved("1.6.0 song template")
    _block(added_vae, "Plenio · YuE2 Model")["nodes"].append(
        {"id": 160, "type": "VAELoader", "mode": 0, "widgets_values": ["my_decoder.safetensors"]}
    )
    removed = saved("1.6.0 song template")
    art = _block(removed, "Plenio · Cover Art")
    art["nodes"] = [n for n in art["nodes"] if n["type"] != "ConditioningZeroOut"]
    bypassed = saved("1.6.0 song template")
    next(n for n in _block(bypassed, "Plenio · Cover Art")["nodes"] if n["type"] == "ConditioningZeroOut")[
        "mode"
    ] = 4
    for workflow, name in (
        (added_lora, "Plenio · YuE2 Model"),
        (added_vae, "Plenio · YuE2 Model"),
        (removed, "Plenio · Cover Art"),
        (bypassed, "Plenio · Cover Art"),
    ):
        upgraded = blocks.upgrade_models(workflow, shipped())
        assert name in dict(upgraded.kept) and name not in upgraded.updated, name
        assert _block(upgraded.workflow, name) == _block(workflow, name)  # left exactly as it was
