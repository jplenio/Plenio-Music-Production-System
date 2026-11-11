"""Workflows saved with 1.6.0 keep their model files: their model blocks load the files they name, no Model Choice
comes in, and opening them (which brings blocks up to date) leaves the model blocks as they were.

The fixtures are the 1.6.0 templates as shipped (commit c307d35); the prompt converter is checked against the
frontend's own prompts in tests/unit/test_workflow_prompt.py."""

from __future__ import annotations

import gzip
import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core.blocks import current_blocks, outdated
from plenio.core.workflow_prompt import to_prompt
from workflow_validation import load_snapshot

ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT = load_snapshot()
SAVED = {
    "1.6.0 song template": {
        "CheckpointLoaderSimple": {"ckpt_name": "yue2_3b_int8_convrot.safetensors"},
        "UNETLoader": {"unet_name": "flux-2-klein-4b.safetensors"},
        "VAELoader": {"vae_name": "flux2-vae.safetensors"},
    },
    "1.6.0 MiniMax song template": {
        "UNETLoader": {"unet_name": "minimax_music3_dit_fp16.safetensors"},
        "VAELoader": {"vae_name": "minimax_music3_dav.safetensors"},
    },
}
MODEL_BLOCKS = {"Plenio · YuE2 Model", "Plenio · MiniMax Model", "Plenio · Cover Art"}


def saved(name: str) -> dict[str, Any]:
    raw = (ROOT / "tests" / "fixtures" / "workflows" / f"{name}.json.gz").read_bytes()
    return json.loads(gzip.decompress(raw))


@pytest.mark.parametrize("name", sorted(SAVED))
def test_a_1_6_workflow_loads_the_files_it_names(name: str) -> None:
    prompt = to_prompt(saved(name), SNAPSHOT["nodes"].get)
    assert not [n for n in prompt.values() if n["class_type"] == "PlenioModelChoice"]
    for kind, expected in SAVED[name].items():
        found = [n["inputs"] for n in prompt.values() if n["class_type"] == kind]
        assert any(all(inputs.get(k) == v for k, v in expected.items()) for inputs in found), (kind, found)


@pytest.mark.parametrize("name", sorted(SAVED))
def test_opening_it_leaves_its_model_blocks_as_they_were(name: str) -> None:
    files = [json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "subgraphs").glob("*.json")]
    blocks = current_blocks(files)
    workflow = saved(name)
    present = {d.get("name") for d in workflow["definitions"]["subgraphs"]}
    assert present & MODEL_BLOCKS
    assert not set(outdated(workflow, blocks)) & MODEL_BLOCKS
