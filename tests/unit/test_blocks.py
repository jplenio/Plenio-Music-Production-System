"""Blocks saved before they followed the brief's creativity, brought up to date when a workflow opens (owner's
report 2026-10-20: creativity 100 on the brief, and the song's plan and take sampling were still 50's)."""

from __future__ import annotations

import copy
import gzip
import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core import blocks as b
from plenio.core.creativity import sampling

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "tests" / "fixtures" / "workflows"
BLOCKS = b.current_blocks(
    json.loads(path.read_text(encoding="utf-8")) for path in sorted((ROOT / "subgraphs").glob("*.json"))
)
TEMPLATES = {
    path.stem: json.loads(path.read_text(encoding="utf-8"))
    for path in sorted((ROOT / "example_workflows").glob("*.json"))
}
BRIEFS = b.brief_outputs(TEMPLATES.values())
PLAN, RENDER, TAKES = "Plenio · YuE2 Plan", "Plenio · YuE2 Render", "Plenio · YuE2 Takes"
WRITE, ARRANGE = "Plenio · Write Song", "Plenio · Arrange"


def fixture(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads(gzip.decompress((FIXTURES / name).read_bytes()))
    return data


SAVED_SONG = fixture("1.0.1 song, as the frontend saved it.json.gz")
COVER_TEMPLATE = fixture("1.0.1 cover template.json.gz")


def definition(workflow: dict[str, Any], name: str) -> dict[str, Any]:
    return next(d for d in workflow["definitions"]["subgraphs"] if d["name"] == name)


def instance(workflow: dict[str, Any], name: str) -> dict[str, Any]:
    block_id = definition(workflow, name)["id"]
    return next(node for node in workflow["nodes"] if node["type"] == block_id)


def links_by_id(workflow: dict[str, Any]) -> dict[int, list[Any]]:
    return {link[0]: link for link in workflow["links"]}


def creativity_origin(workflow: dict[str, Any], name: str) -> tuple[str, str] | None:
    """(the node's type, its output's name) the block's creativity input is linked from."""
    slot = next(i for i in instance(workflow, name)["inputs"] if i["name"] == "creativity")
    if slot["link"] is None:
        return None
    link = links_by_id(workflow)[slot["link"]]
    origin = next(node for node in workflow["nodes"] if node["id"] == link[1])
    return origin["type"], origin["outputs"][link[2]]["name"]


def test_the_shipped_blocks_that_follow_the_creativity():
    assert sorted(block.name for block in BLOCKS.values()) == [ARRANGE, WRITE, PLAN, RENDER, TAKES]
    for template in TEMPLATES.values():
        assert b.outdated(template, BLOCKS) == []
        found = b.upgrade(template, BLOCKS, BRIEFS)
        assert (found.updated, found.kept, found.linked, found.workflow) == ((), (), (), template)


def test_a_song_saved_with_1_0_1_gets_the_current_blocks_and_the_briefs_creativity():
    assert b.outdated(SAVED_SONG, BLOCKS) == [WRITE, PLAN, ARRANGE, RENDER]
    found = b.upgrade(SAVED_SONG, BLOCKS, BRIEFS)
    assert set(found.updated) == {WRITE, PLAN, ARRANGE, RENDER}
    assert found.kept == () and found.unlinked == ()
    assert set(found.linked) == {PLAN, RENDER}
    workflow = found.workflow
    # each block is the shipped one, under the id its instances use
    for name in found.updated:
        shipped = next(block for block in BLOCKS.values() if block.name == name).definition
        assert definition(workflow, name) == {**shipped, "id": definition(SAVED_SONG, name)["id"]}
    # the YuE2 blocks' creativity comes from the brief, as in the current template
    for name in (PLAN, RENDER):
        assert creativity_origin(workflow, name) == ("PlenioSongBrief", "creativity")
        assert creativity_origin(TEMPLATES["1 · YuE2 · Song"], name) == ("PlenioSongBrief", "creativity")
        # unlinked it would take the default (100 since 1.5.0); linked, the brief's value counts
        assert instance(workflow, name)["widgets_values"][-1] == 100
    brief = next(node for node in workflow["nodes"] if node["type"] == "PlenioSongBrief")
    out = next(slot for slot in brief["outputs"] if slot["name"] == "creativity")
    assert len(out["links"]) == 2 and workflow["last_link_id"] == max(links_by_id(workflow))
    # nothing else of the workflow changed: the brief, the other nodes, the old links
    assert all(links_by_id(workflow)[link[0]] == link for link in SAVED_SONG["links"])
    before = {node["id"]: node for node in SAVED_SONG["nodes"]}
    for node in workflow["nodes"]:
        if node["type"] not in {definition(workflow, name)["id"] for name in found.updated} | {
            "PlenioSongBrief"
        }:
            assert node == before[node["id"]]
    assert SAVED_SONG == fixture("1.0.1 song, as the frontend saved it.json.gz")  # the input is left alone
    # once up to date, nothing more to do
    again = b.upgrade(workflow, BLOCKS, BRIEFS)
    assert b.outdated(workflow, BLOCKS) == [] and again.workflow == workflow and again.updated == ()


def test_at_50_the_creativity_nodes_give_the_numbers_the_old_blocks_had():
    # a block is only replaced where its sampling nodes are the current block's: at 50 they run as before
    found = b.upgrade(SAVED_SONG, BLOCKS, BRIEFS)
    stages = {"YuE2GenerateABC": "plan", "YuE2GenerateMusic": "take"}
    for name in (PLAN, RENDER):
        old = {node["id"]: node for node in definition(SAVED_SONG, name)["nodes"]}
        for node in definition(found.workflow, name)["nodes"]:
            # the retakes of the lyrics fidelity (1.2.1) are new: the old block had none
            if node["type"] in stages and node["id"] in old:
                values = sampling(50, stages[node["type"]])
                written = old[node["id"]]["widgets_values"]
                triple = [values.temperature, values.top_p, values.top_k]
                assert any(written[i : i + 3] == triple for i in range(len(written) - 2))


def test_a_cover_template_of_1_0_1_links_the_cover_briefs_creativity():
    found = b.upgrade(COVER_TEMPLATE, BLOCKS, BRIEFS)
    assert set(found.updated) == {WRITE, ARRANGE, TAKES} and found.kept == ()
    assert creativity_origin(found.workflow, TAKES) == ("PlenioCoverBrief", "creativity")
    # the 1.0.1 brief had no creativity output: it gets the outputs the current template's brief has
    brief = next(node for node in found.workflow["nodes"] if node["type"] == "PlenioCoverBrief")
    assert [slot["name"] for slot in brief["outputs"]] == [
        slot["name"] for slot in BRIEFS["PlenioCoverBrief"]
    ]


def test_a_block_changed_inside_is_kept_and_named():
    changed = copy.deepcopy(SAVED_SONG)
    take = next(n for n in definition(changed, RENDER)["nodes"] if n["type"] == "YuE2GenerateMusic")
    take["widgets_values"] = [1.05 if value == 1 else value for value in take["widgets_values"]]
    found = b.upgrade(changed, BLOCKS, BRIEFS)
    assert found.kept == ((RENDER, "its node YuE2GenerateMusic was changed inside the block"),)
    assert definition(found.workflow, RENDER) == definition(changed, RENDER)
    assert "creativity" not in [slot["name"] for slot in instance(found.workflow, RENDER)["inputs"]]
    assert set(found.updated) == {WRITE, PLAN, ARRANGE} and found.linked == (PLAN,)


@pytest.mark.parametrize(
    ("change", "why"),
    [
        (lambda d: d["inputs"].pop(0), "its inputs differ from the current block's"),
        (lambda d: d["outputs"].reverse(), "its outputs differ from the current block's"),
        (
            lambda d: d["nodes"].remove(next(n for n in d["nodes"] if n["type"] == "YuE2GenerateABC")),
            "its sampling nodes differ from the current block's",
        ),
    ],
)
def test_a_block_that_does_not_fit_the_current_one_is_kept(change: Any, why: str):
    changed = copy.deepcopy(SAVED_SONG)
    change(definition(changed, PLAN))
    found = b.upgrade(changed, BLOCKS, BRIEFS)
    assert found.kept == ((PLAN, why),) and PLAN not in found.updated


def test_without_a_single_brief_the_blocks_keep_their_own_creativity():
    two = copy.deepcopy(SAVED_SONG)
    brief = next(node for node in two["nodes"] if node["type"] == "PlenioSongBrief")
    two["nodes"].append({**copy.deepcopy(brief), "id": 999})
    found = b.upgrade(two, BLOCKS, BRIEFS)
    assert set(found.updated) == {WRITE, PLAN, ARRANGE, RENDER} and found.linked == ()
    assert {name for name, _ in found.unlinked} == {PLAN, RENDER}
    assert creativity_origin(found.workflow, PLAN) is None  # the block's slider (50) counts


def test_a_creativity_already_linked_is_left_and_a_workflow_without_blocks_is_untouched():
    found = b.upgrade(SAVED_SONG, BLOCKS, BRIEFS).workflow
    plan = definition(found, PLAN)
    old_plan = definition(SAVED_SONG, PLAN)
    # the block replaced again (as if it had been saved without its Creativity node), its input still linked
    found["definitions"]["subgraphs"][found["definitions"]["subgraphs"].index(plan)] = copy.deepcopy(old_plan)
    again = b.upgrade(found, BLOCKS, BRIEFS)
    assert again.updated == (PLAN,) and again.linked == ()
    assert creativity_origin(again.workflow, PLAN) == ("PlenioSongBrief", "creativity")
    assert b.upgrade({"nodes": [], "links": []}, BLOCKS, BRIEFS).updated == ()
