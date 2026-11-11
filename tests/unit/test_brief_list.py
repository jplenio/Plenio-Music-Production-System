"""Brief List and the recipes (phase 4.8)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core.brief_list import entries, pick, read_list
from plenio.core.errors import PlenioUserError
from plenio.core.workflow_prompt import to_prompt

ROOT = Path(__file__).resolve().parents[2]
NODES: dict[str, Any] = json.loads((ROOT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))[
    "nodes"
]
RECIPES = sorted((ROOT / "example_workflows" / "recipes").glob("*.json"))


def test_entries_leave_out_blank_lines_and_comments() -> None:
    assert entries("  first  \n\n# a comment\nsecond\n   \n") == ["first", "second"]


def test_a_run_takes_its_entry_and_wraps_round() -> None:
    items = ["a", "b", "c"]
    assert [pick(items, i).text for i in range(5)] == ["a", "b", "c", "a", "b"]
    assert pick(items, 4).position == 1 and pick(items, 4).count == 3
    with pytest.raises(PlenioUserError, match="empty"):
        pick([], 0)


def test_a_list_file_comes_from_the_input_folder_only(tmp_path: Path) -> None:
    (tmp_path / "list.txt").write_text("﻿one\ntwo\n", encoding="utf-8")
    assert entries(read_list(tmp_path, "list.txt")) == ["one", "two"]
    assert read_list(tmp_path, "  ") == ""
    for outside in ("../secret.txt", str(tmp_path.parent / "x.txt")):
        with pytest.raises(PlenioUserError, match="input folder"):
            read_list(tmp_path, outside)
    with pytest.raises(PlenioUserError, match="no file"):
        read_list(tmp_path, "missing.txt")


def test_there_are_six_recipes_each_with_a_note_and_without_the_api_mark() -> None:
    assert len(RECIPES) == 6
    for path in RECIPES:
        workflow = json.loads(path.read_text(encoding="utf-8"))
        titles = [n.get("title") for n in workflow["nodes"]]
        assert "Recipe" in titles, path.name
        assert "plenio_api" not in (workflow.get("extra") or {}), path.name  # the API runs the templates


@pytest.mark.parametrize("path", RECIPES, ids=lambda p: p.stem)
def test_every_recipe_converts_to_a_prompt(path: Path) -> None:
    workflow = json.loads(path.read_text(encoding="utf-8"))
    prompt = to_prompt(workflow, NODES.get)
    kinds = {node["class_type"] for node in prompt.values()}
    assert "PlenioExportRelease" in kinds or "SaveAudio" in kinds or any("Export" in k for k in kinds), (
        path.name
    )
    if "stems" in path.stem:
        mixers = [json.dumps(n["inputs"]) for n in prompt.values() if "StemMixer" in n["class_type"]]
        assert mixers and all("save_all" in mixer for mixer in mixers), mixers
    else:
        lists = [n for n in prompt.values() if n["class_type"] == "PlenioBriefList"]
        assert lists and all(n["inputs"]["entries"] for n in lists), path.name
