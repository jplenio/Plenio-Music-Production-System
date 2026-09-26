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
    problems = validate_file(write(tmp_path, "t.json", template, "example_workflows"), SNAPSHOT, blueprints)
    assert not any("re-sync" in p for p in problems)  # (the fixture is no complete template: anatomy aside)
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


# --- Phase 8: the shipped templates against the model catalogue, App configs, thumbnails -----------

TEMPLATES = {
    p.stem: json.loads(p.read_text(encoding="utf-8")) for p in (PROJECT / "example_workflows").glob("*.json")
}
LOADER_WIDGETS = {
    "CheckpointLoaderSimple": "ckpt_name",
    "LoraLoader": "lora_name",
    "UNETLoader": "unet_name",
    "CLIPLoader": "clip_name",
    "VAELoader": "vae_name",
    "AudioEncoderLoader": "audio_encoder_name",
}


def model_files(template: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], set[str], set[str]]:
    """Download entries by file name, and the files a template needs always / only in optional blocks."""
    definitions = {d["id"]: d for d in template["definitions"]["subgraphs"]}
    entries: dict[str, dict[str, Any]] = {}
    required: set[str] = set()
    optional: set[str] = set()

    def walk(nodes: list[dict[str, Any]], bypassed: bool) -> None:
        for node in nodes:
            off = bypassed or node.get("mode") == 4
            if node["type"] in definitions:
                walk(definitions[node["type"]]["nodes"], off)
            elif node["type"] in LOADER_WIDGETS:
                (entry,) = node["properties"]["models"]
                assert entry["name"] == node["widgets_values"][0], node
                entries[entry["name"]] = entry
                (optional if off else required).add(entry["name"])

    walk(template["nodes"], False)
    return entries, required, optional - required


@pytest.mark.parametrize("name", sorted(TEMPLATES))
def test_loaders_match_the_model_catalogue(name: str) -> None:
    from plenio.core.models import by_file, load_catalogue

    catalogue = by_file(load_catalogue(PROJECT / "resources" / "models.toml"))
    entries, required, optional = model_files(TEMPLATES[name])
    for file, entry in entries.items():
        assert file in catalogue and catalogue[file].default, file
        assert entry == catalogue[file].download_entry()
    assert required == {m.file for m in catalogue.values() if name in m.templates}
    assert optional == {m.file for m in catalogue.values() if name in m.optional_templates}


def test_app_configurations() -> None:
    apps = {name: t["extra"].get("linearData") for name, t in TEMPLATES.items()}
    for name in TEMPLATES:
        assert apps[name]["inputs"] and apps[name]["outputs"], name
    # 0.2.2: the mode comes first; the Song Sheet editor buttons make the review stops usable in the app
    # (the cover path has an app since then). Brief, take seed and sheets only: no model files.
    sheets = {"1 · YuE2 · Song": 2, "2 · YuE2 · Cover": 2, "3 · MiniMax · Song": 1}
    for name, count in sheets.items():
        nodes = {n["id"]: n for n in TEMPLATES[name]["nodes"]}
        shown = [(nodes[i]["type"], widget) for i, widget in apps[name]["inputs"]]
        brief = [widget for kind, widget in shown if kind.endswith("Brief")]
        assert brief[0] == "mode", name
        assert [kind for kind, widget in shown if widget == "sheet_state"] == ["PlenioSongSheet"] * count
        assert {kind for kind, _ in shown} <= {
            "PlenioSongBrief",
            "PlenioCoverBrief",
            "SeedNode",
            "PlenioSongSheet",
            "LoadAudio",
        }
        assert {nodes[i]["type"] for i in apps[name]["outputs"]} == {"PreviewAudio", "PlenioExportRelease"}
        for node in nodes.values():
            if node["type"] == "PlenioSongSheet":  # the app shows the sheet's title on its button
                slot = next(s for s in node["inputs"] if s["name"] == "sheet_state")
                assert slot["label"] == node["title"]


@pytest.mark.parametrize(
    ("name", "mode"),
    [
        ("1 · YuE2 · Song", "new song every run"),
        ("2 · YuE2 · Cover", "one cover, stop to review"),
        ("3 · MiniMax · Song", "new song every run"),
    ],
)
def test_the_sheets_follow_the_brief_mode(name: str, mode: str) -> None:
    """0.2.2 work mode: the brief decides; every Song Sheet of a template is set to 'as the brief says'."""
    nodes = TEMPLATES[name]["nodes"]
    brief = next(n for n in nodes if n["type"] in ("PlenioSongBrief", "PlenioCoverBrief"))
    assert brief["widgets_values"][0] == mode
    for sheet in (n for n in nodes if n["type"] == "PlenioSongSheet"):
        assert sheet["widgets_values"][0] == "as the brief says", sheet["title"]
    # the writer's seed is its own node (fixed by default; randomize is one click away), linked to Write Song
    draft = next(n for n in nodes if n.get("title") == "Draft seed")
    assert draft["type"] == "SeedNode" and draft["widgets_values"][1] == "fixed"
    (link,) = [link for link in TEMPLATES[name]["links"] if link[1] == draft["id"]]
    target = next(n for n in nodes if n["id"] == link[3])
    assert target["inputs"][link[4]]["name"] == "sampling_mode.seed"


@pytest.mark.parametrize("name", ["1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song"])
def test_song_templates_master_then_export_with_the_raw_take_as_original(name: str) -> None:
    template = TEMPLATES[name]
    titles = {n["id"]: n.get("title") or n["type"] for n in template["nodes"]}
    links = {link[0]: link for link in template["links"]}
    export = next(n for n in template["nodes"] if n["type"] == "PlenioExportRelease")
    inputs = {slot["name"]: slot.get("link") for slot in export["inputs"]}
    assert titles[links[inputs["audio"]][1]] == "Plenio · Master"
    master = next(n for n in template["nodes"] if titles[n["id"]] == "Plenio · Master")
    master_input = next(s["link"] for s in master["inputs"] if s["name"] == "audio")
    assert links[inputs["original"]][1:3] == links[master_input][1:3]  # the same take, unmastered
    cover = next(n for n in template["nodes"] if titles[n["id"]] == "Cover Art (optional)")
    assert cover["mode"] == 4 and titles[links[inputs["cover"]][1]] == "Cover Art (optional)"


def test_thumbnails_are_400px_jpegs() -> None:
    image = pytest.importorskip("PIL.Image")
    for name in TEMPLATES:
        with image.open(PROJECT / "example_workflows" / f"{name}.jpg") as thumbnail:
            assert thumbnail.format == "JPEG" and thumbnail.size == (400, 400), name


def test_validator_checks_the_template_anatomy(tmp_path: Path) -> None:
    template = copy.deepcopy(TEMPLATES["1 · YuE2 · Song"])
    cover = next(n for n in template["nodes"] if n.get("title") == "Cover Art (optional)")
    cover["title"] = "Cover Art"
    template["extra"]["linearData"]["inputs"].append([2, "no_such_widget"])
    template["extra"]["linearData"]["outputs"].append(cover["id"])
    template["groups"] = template["groups"][:1]
    problems = validate_file(
        write(tmp_path, "x.json", template, "example_workflows"),
        SNAPSHOT,
        load_blueprints(PROJECT / "subgraphs"),
    )
    text = "\n".join(problems)
    for message in (
        "must say '(optional)'",
        "outside every group",
        "is not a widget",
        "is not an output node",
        "thumbnail",
    ):
        assert message in text, message
