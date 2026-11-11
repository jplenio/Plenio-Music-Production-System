"""A workflow saved before its blocks followed the brief's creativity, brought up to date through the route the
frontend calls as it opens (owner's report 2026-10-20), in a real ComfyUI server."""

from __future__ import annotations

import gzip
import json
from pathlib import Path

import pytest

from harness import ComfyServer

pytestmark = pytest.mark.host
ROOT = Path(__file__).resolve().parents[2]
SAVED_SONG = json.loads(
    gzip.decompress(
        (
            ROOT / "tests" / "fixtures" / "workflows" / "1.0.1 song, as the frontend saved it.json.gz"
        ).read_bytes()
    )
)


def test_the_blocks_of_a_1_0_1_song_follow_the_briefs_creativity(server: ComfyServer) -> None:
    status, answer = server.request("POST", "/plenio/workflow/blocks", {"workflow": SAVED_SONG})
    assert status == 200
    assert set(answer["updated"]) == {
        "Plenio · Write Song",
        "Plenio · YuE2 Plan",
        "Plenio · Arrange",
        "Plenio · YuE2 Render",
    }
    assert set(answer["linked"]) == {"Plenio · YuE2 Plan", "Plenio · YuE2 Render"}
    assert answer["kept"] == [] and answer["unlinked"] == []
    kinds = {
        node["type"]
        for definition in answer["workflow"]["definitions"]["subgraphs"]
        for node in definition["nodes"]
    }
    assert "PlenioCreativity" in kinds

    # once up to date, nothing changes; a request without a workflow is the caller's error
    status, again = server.request("POST", "/plenio/workflow/blocks", {"workflow": answer["workflow"]})
    assert status == 200 and again["workflow"] is None and again["updated"] == []
    status, refused = server.request("POST", "/plenio/workflow/blocks", {"workflow": []})
    assert status == 400 and "workflow" in refused["error"]["message"]


def test_the_model_blocks_of_a_1_6_song_come_up_to_date_only_when_asked(server: ComfyServer) -> None:
    saved = json.loads(
        gzip.decompress(
            (ROOT / "tests" / "fixtures" / "workflows" / "1.6.0 song template.json.gz").read_bytes()
        )
    )
    status, opened = server.request("POST", "/plenio/workflow/blocks", {"workflow": saved})
    assert status == 200 and not {"Plenio · YuE2 Model", "Plenio · Cover Art"} & set(opened["updated"])
    status, asked = server.request("POST", "/plenio/workflow/blocks", {"workflow": saved, "models": True})
    assert status == 200 and set(asked["updated"]) == {"Plenio · YuE2 Model", "Plenio · Cover Art"}
    pins = {
        tuple(node["widgets_values"])
        for definition in asked["workflow"]["definitions"]["subgraphs"]
        for node in definition["nodes"]
        if node["type"] == "PlenioModelChoice"
    }
    assert ("flux2-klein", "flux-2-klein-4b.safetensors") in pins and (
        "flux2-vae",
        "flux2-vae.safetensors",
    ) in pins
