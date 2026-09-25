"""Templates and blueprints are valid against the pinned ComfyUI node definitions."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

import pytest

from workflow_validation import (
    PROJECT,
    expected_widget_values,
    load_blueprints,
    load_snapshot,
    validate_file,
)

SNAPSHOT = load_snapshot()
GRAPHS = sorted((PROJECT / "subgraphs").glob("*.json")) + sorted(
    (PROJECT / "example_workflows").glob("*.json")
)
FIXTURE = PROJECT / "tests" / "fixtures" / "graphs" / "Plenio Test Blueprint.json"


@pytest.mark.parametrize("path", GRAPHS, ids=lambda p: p.name)
def test_shipped_graph_is_valid(path: Path) -> None:
    assert validate_file(path, SNAPSHOT, load_blueprints(PROJECT / "subgraphs")) == []


def test_templates_ship() -> None:
    templates = sorted((PROJECT / "example_workflows").glob("*.json"))
    assert templates, "at least the System Check template ships"


def test_snapshot_is_pinned_to_the_supported_comfyui() -> None:
    assert SNAPSHOT["comfyui_version"] == "0.37.0"
    assert "PlenioSystemCheck" in SNAPSHOT["nodes"]


def write(tmp_path: Path, name: str, data: dict[str, Any], folder: str = "subgraphs") -> Path:
    target = tmp_path / folder / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data), encoding="utf-8")
    return target


def fixture_data() -> dict[str, Any]:
    data: dict[str, Any] = json.loads(FIXTURE.read_text(encoding="utf-8"))
    return data


def test_fixture_blueprint_is_valid(tmp_path: Path) -> None:
    assert validate_file(write(tmp_path, "Plenio Test Blueprint.json", fixture_data()), SNAPSHOT, {}) == []


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (
            lambda d: d["definitions"]["subgraphs"][0]["nodes"][0].update(type="NoSuchNode"),
            "unknown node type",
        ),
        (
            lambda d: d["definitions"]["subgraphs"][0]["nodes"][0].update(widgets_values=["a", "b"]),
            "widget values",
        ),
        (lambda d: d["definitions"]["subgraphs"][0]["links"][0].update(type="IMAGE"), "type IMAGE"),
        (lambda d: d["definitions"]["subgraphs"][0]["links"][1].update(origin_id=99), "unknown origin"),
        (lambda d: d["nodes"][0]["properties"].update(proxyWidgets=[["-1", "text"]]), "proxyWidgets"),
        (lambda d: d["definitions"]["subgraphs"][0].update(category="Tests"), "category"),
        (lambda d: d["definitions"]["subgraphs"][0].update(description=""), "description"),
        (
            lambda d: d["definitions"]["subgraphs"][0]["nodes"][0].update(
                widgets_values=["C:\\Users\\me\\x"]
            ),
            "path",
        ),
        (lambda d: d["nodes"][0].update(widgets_values=["token = hf_" + "a" * 34]), "token"),
    ],
)
def test_validator_catches(tmp_path: Path, mutate: Any, message: str) -> None:
    data = fixture_data()
    mutate(data)
    problems = validate_file(write(tmp_path, "Plenio Test Blueprint.json", data), SNAPSHOT, {})
    assert any(message in problem for problem in problems), problems


def test_blueprint_name_must_match_file(tmp_path: Path) -> None:
    problems = validate_file(write(tmp_path, "Other Name.json", fixture_data()), SNAPSHOT, {})
    assert any("differs from the file name" in p for p in problems)


def test_template_must_embed_the_current_blueprint(tmp_path: Path) -> None:
    blueprint = fixture_data()
    template = copy.deepcopy(blueprint)
    template["nodes"][0]["id"] = 7
    blueprints = {"Plenio Test Blueprint": blueprint["definitions"]["subgraphs"][0]}
    assert validate_file(write(tmp_path, "t.json", template, "example_workflows"), SNAPSHOT, blueprints) == []
    template["definitions"]["subgraphs"][0]["nodes"][0]["widgets_values"] = ["changed"]
    problems = validate_file(write(tmp_path, "t.json", template, "example_workflows"), SNAPSHOT, blueprints)
    assert any("re-sync" in p for p in problems)


def test_widget_count_handles_seed_controls_and_dynamic_combos() -> None:
    nodes = SNAPSHOT["nodes"]
    assert expected_widget_values(nodes["KSampler"], [0, "fixed", 32, 1, "dpm_2", "sgm_uniform", 1]) == 7
    assert expected_widget_values(nodes["SeedNode"], [0, "fixed"]) == 2
    text_values = ["", 512, "on", 0.7, 64, 0.95, 0.05, 1.05, 0, 0, False, True, "auto"]
    assert expected_widget_values(nodes["TextGenerate"], text_values) == 13
    assert expected_widget_values(nodes["TextGenerate"], ["", 512, "off", False, True, "auto"]) == 6
    assert expected_widget_values(nodes["SaveAudioAdvanced"], ["audio/x", "mp3", "V0"]) == 3
