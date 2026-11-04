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
    id_clashes,
    load_blueprints,
    load_snapshot,
    validate_file,
)

SNAPSHOT = load_snapshot()
NATIVE_WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"
GRAPHS = sorted((PROJECT / "subgraphs").glob("*.json")) + sorted(
    (PROJECT / "example_workflows").glob("*.json")
)
FIXTURE = PROJECT / "tests" / "fixtures" / "graphs" / "Plenio Test Blueprint.json"


@pytest.mark.parametrize("path", GRAPHS, ids=lambda p: p.name)
def test_shipped_graph_is_valid(path: Path) -> None:
    assert validate_file(path, SNAPSHOT, load_blueprints(PROJECT / "subgraphs")) == []


def test_every_blueprint_owns_its_node_ids() -> None:
    """Phase 8 F2, regressed by the Stems blueprint (801+, the ids of YuE2 Render) and fixed again:
    shared ids made the frontend renumber nodes when a template loaded."""
    assert id_clashes(load_blueprints(PROJECT / "subgraphs").values()) == []
    clash = [{"name": "A", "nodes": [{"id": 1}, {"id": 2}]}, {"name": "B", "nodes": [{"id": 2}]}]
    assert id_clashes(clash) == [
        "node id 2 is used by the subgraphs 'A' and 'B' (the frontend renumbers one of them on load)"
    ]


SUMMARY_TYPES = {
    "PlenioSongBrief", "PlenioCoverBrief", "PlenioEQ", "PlenioExportRelease", "PlenioLoudness", "PlenioRefine",
    "PlenioScoreTools", "PlenioSongSheet", "PlenioStemMixer", "PlenioSystemCheck", "PlenioTranscribeLyrics",
    "PlenioVocalCheck", "PlenioHQStereoCleanup", "PlenioHQRegenerateHighs", "PlenioHQDeReverb", "PlenioLoras",
}  # fmt: skip
"""Node classes in the templates that show a run summary under their widgets."""


def test_nodes_with_a_run_summary_keep_room_for_it() -> None:
    """A lower bound for every expanded summary node: slot rows (20 px), widget rows (24 px), the title and
    ``SUMMARY_ROOM``. Before the review of 2026-09-29 Score Tools was 140 px tall and its summary was one
    clipped line after a run; the browser check measures the real heights (step 5)."""
    from build_graphs import SUMMARY_ROOM

    for path in sorted((PROJECT / "example_workflows").glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for node in data["nodes"]:
            if node["type"] not in SUMMARY_TYPES or node.get("flags", {}).get("collapsed"):
                continue
            widgets = sum(1 for slot in node.get("inputs", []) if slot.get("widget"))
            sockets = sum(1 for slot in node.get("inputs", []) if not slot.get("widget"))
            rows = max(sockets, len(node.get("outputs", [])))
            needed = rows * 20 + widgets * 24 + SUMMARY_ROOM
            assert node["size"][1] >= needed, (
                f"{path.stem}: {node.get('title') or node['type']} {node['size'][1]} < {needed}"
            )


def test_templates_ship() -> None:
    templates = sorted((PROJECT / "example_workflows").glob("*.json"))
    assert templates, "at least the System Check template ships"


def test_snapshot_is_pinned_to_the_supported_comfyui() -> None:
    assert SNAPSHOT["comfyui_version"] == "0.41.0"
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
    # Plenio's own audio model loader (UniverSR for HQ 2, the separator for Stems); its file widget
    # lives inside the 'kind' dynamic combo.
    "PlenioAudioModelLoader": "kind.model",
}


def model_files(template: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], set[str], set[str]]:
    """Download entries by file name, and the files a template needs always / only in optional blocks."""
    definitions = {d["id"]: d for d in template["definitions"]["subgraphs"]}
    entries: dict[str, dict[str, Any]] = {}
    required: set[str] = set()
    optional: set[str] = set()
    # HQ 2 asks for its super-resolution model only with HQ mastering on (lazy; off in the song templates, on
    # in Enhance & Master since 2026-10-24), the Master's stems for their separator only with its stems switch on
    hq_on = any(n["type"] == "PlenioHQMastering" and n["widgets_values"] == [True] for n in template["nodes"])
    lazy_off = {"separation"} | (set() if hq_on else {"super-resolution"})

    def walk(nodes: list[dict[str, Any]], bypassed: bool) -> None:
        for node in nodes:
            off = bypassed or node.get("mode") == 4
            if node["type"] in definitions:
                walk(definitions[node["type"]]["nodes"], off)
            elif node["type"] in LOADER_WIDGETS:
                if "models" not in (node.get("properties") or {}):
                    # the Generate Text branch's loader stays on Gemma 4 E4B, an alternative since 1.5.1 (the default
                    # writer is a GGUF): loaded only when that writer is chosen, so no download is offered for it
                    assert node["type"] == "CLIPLoader" and node["widgets_values"][0] == NATIVE_WRITER, node
                    continue
                (entry,) = node["properties"]["models"]
                # the file widget: the first value for ComfyUI's own loaders; Plenio's audio model
                # loader puts its file after the dynamic combo's 'kind' value
                index = 1 if node["type"] == "PlenioAudioModelLoader" else 0
                assert entry["name"] == node["widgets_values"][index], node
                entries[entry["name"]] = entry
                lazy = node["type"] == "PlenioAudioModelLoader" and node["widgets_values"][0] in lazy_off
                (optional if off or lazy else required).add(entry["name"])

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


def test_no_app_control_is_an_advanced_widget() -> None:
    """App mode shows an *advanced* widget's label without its field (frontend 1.53.6): the brief's key
    and meter were such labels in the DAW app until the review before 0.3.0."""
    for name, template in TEMPLATES.items():
        nodes = {n["id"]: n for n in template["nodes"]}
        for node_id, widget in (template["extra"].get("linearData") or {}).get("inputs", []):
            info = SNAPSHOT["nodes"].get(nodes[node_id]["type"])
            if info is None:  # a subgraph wrapper or a frontend-only node
                continue
            specs = {**info["input"].get("required", {}), **(info["input"].get("optional") or {})}
            spec = specs.get(widget)
            options = spec[1] if spec and len(spec) > 1 and isinstance(spec[1], dict) else {}
            assert not options.get("advanced"), f"{name}: {nodes[node_id]['type']}.{widget} is advanced"


def test_app_configurations() -> None:
    apps = {name: t["extra"].get("linearData") for name, t in TEMPLATES.items()}
    for name in TEMPLATES:
        assert apps[name]["inputs"] and apps[name]["outputs"], name
    # 0.2.2: the mode comes first; the Song Sheet editor buttons make the review stops usable in the app
    # (the cover path has an app since then). Brief, seeds, the writer model and sheets: no model files
    # of the music model.
    sheets = {"1 · YuE2 · Song": 2, "2 · YuE2 · Cover": 2, "3 · MiniMax · Song": 1, "5 · YuE2 · DAW": 2}
    for name, count in sheets.items():
        nodes = {n["id"]: n for n in TEMPLATES[name]["nodes"]}
        shown = [(nodes[i]["type"], widget) for i, widget in apps[name]["inputs"]]
        brief = [widget for kind, widget in shown if kind.endswith("Brief")]
        assert brief[0] == "mode", name
        assert [kind for kind, widget in shown if widget == "sheet_state"] == ["PlenioSongSheet"] * count
        # the audio stages live in the Master block since Audio HQ (2026-10-21): none in the song apps - only
        # the HQ Mastering switch, among the first choices (2026-10-22)
        assert {kind for kind, _ in shown} <= {
            "PlenioSongBrief",
            "PlenioCoverBrief",
            "PlenioWriterChoice",
            "PlenioSeed",
            "PlenioSongSheet",
            "LoadAudio",
            "PlenioHQMastering",
        }
        assert ("PlenioHQMastering", "hq_mastering") in shown[:3], name
        # the creative mode and its sliders, and the one writer model of every writing step (0.5.0)
        assert [widget for kind, widget in shown if kind == "PlenioWriterChoice"] == ["model"], name
        assert "arrangement" in brief, name
        closeness = (
            ["song_flow_closeness", "lyrics_closeness"] if name == "2 · YuE2 · Cover" else ["genre_closeness"]
        )
        assert set(closeness) <= set(brief), name
        seeds = [nodes[i]["title"] for i, widget in apps[name]["inputs"] if nodes[i]["type"] == "PlenioSeed"]
        assert ("Arrangement seed" in seeds) == (name in ("1 · YuE2 · Song", "2 · YuE2 · Cover")), name
        # every seed shows its number and its switch (owner's request 2026-10-15)
        for title in set(seeds):
            assert sorted(w for i, w in apps[name]["inputs"] if nodes[i].get("title") == title) == [
                "keep_seed",
                "seed",
            ], (name, title)
        if (
            name != "2 · YuE2 · Cover"
        ):  # the song briefs: key and meter too (the DAW's empty score follows them)
            assert {"tempo", "key", "meter", "length"} <= set(brief), name
        assert {nodes[i]["type"] for i in apps[name]["outputs"]} == {"PreviewAudio", "PlenioExportRelease"}
        for node in nodes.values():
            if node["type"] == "PlenioSongSheet":  # the app shows the sheet's title on its button
                slot = next(s for s in node["inputs"] if s["name"] == "sheet_state")
                assert slot["label"] == node["title"]


@pytest.mark.parametrize(
    ("name", "mode"),
    [
        ("1 · YuE2 · Song", "new song every run"),
        ("2 · YuE2 · Cover", "new cover every run"),
        ("3 · MiniMax · Song", "new song every run"),
        ("5 · YuE2 · DAW", "one song, stop to review"),
    ],
)
def test_the_sheets_follow_the_brief_mode(name: str, mode: str) -> None:
    """0.2.2 work mode: the brief decides; every Song Sheet of a template is set to 'as the brief says' -
    except Song Sheet · DAW, which always stops: its score starts as rests and is composed there (in a
    series every new song stops to be composed)."""
    nodes = TEMPLATES[name]["nodes"]
    brief = next(n for n in nodes if n["type"] in ("PlenioSongBrief", "PlenioCoverBrief"))
    assert brief["widgets_values"][0] == mode
    for sheet in (n for n in nodes if n["type"] == "PlenioSongSheet"):
        expected = "stop for review" if sheet["title"] == "Song Sheet · DAW" else "as the brief says"
        assert sheet["widgets_values"][0] == expected, sheet["title"]
    # every song of a series gets its own draft (and plan) seed: the brief's song seed reaches the blocks
    targets = [
        next(n for n in nodes if n["id"] == link[3]).get("title") or ""
        for link in TEMPLATES[name]["links"]
        if link[1] == brief["id"] and link[2] == 4  # the brief's song_seed output
    ]
    assert "Plenio · Write Song" in targets
    assert ("Plenio · YuE2 Plan" in targets) == (name == "1 · YuE2 · Song")
    # the writer's seed is its own node, linked to Write Song; the seeds follow the brief's mode (owner's
    # request 2026-10-23): runs that go through draw every seed anew, runs that stop keep the song's
    draft = next(n for n in nodes if n.get("title") == "Draft seed")
    assert draft["type"] == "PlenioSeed" and draft["widgets_values"] == [0, "stop" in mode]
    for seed in (n for n in nodes if n["type"] == "PlenioSeed" and n.get("title") != "Take seed"):
        assert seed["widgets_values"][1] == ("stop" in mode), (name, seed["title"])
    assert draft["properties"]["plenio_part"].startswith("draft")
    take = next(n for n in nodes if n.get("title") == "Take seed")
    assert take["type"] == "PlenioSeed" and take["widgets_values"] == [1, False]  # 🎲: a new take every run
    (link,) = [link for link in TEMPLATES[name]["links"] if link[1] == draft["id"]]
    target = next(n for n in nodes if n["id"] == link[3])
    assert target["inputs"][link[4]]["name"] == "sampling_mode.seed"


@pytest.mark.parametrize(
    "name", ["1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"]
)
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
    # the cover is painted by default; the Cover Art switch bypasses its three nodes (owner's request 2026-10-23)
    cover = next(n for n in template["nodes"] if titles[n["id"]] == "Cover Art")
    assert cover["mode"] == 0 and titles[links[inputs["cover"]][1]] == "Cover Art"
    switched = {titles[n["id"]] for n in template["nodes"] if n["properties"].get("plenio_switch") == "cover"}
    assert switched == {"Cover Art", "Cover preview", "Cover seed"}


def test_the_daw_template_composes_its_own_score() -> None:
    """M2: template 5 builds an empty score from the brief, opens the DAW layout and renders exactly it."""
    template = TEMPLATES["5 · YuE2 · DAW"]
    nodes = template["nodes"]
    titles = {n["id"]: n.get("title") or n["type"] for n in nodes}
    links = {link[0]: link for link in template["links"]}
    score_sheet = next(
        n for n in nodes if n["type"] == "PlenioSongSheet" and n.get("title") == "Song Sheet · DAW"
    )
    assert score_sheet["properties"]["plenio_editor_layout"] == "daw"
    tools = next(n for n in nodes if n["type"] == "PlenioScoreTools")
    assert tools["widgets_values"][0] == "new score from brief"
    # the score input of Score Tools stays unconnected: the skeleton comes from the brief
    slot = next(s for s in tools["inputs"] if s["name"] == "score")
    assert slot.get("link") is None
    (brief_link,) = [link for link in template["links"] if link[3] == tools["id"] and link[4] == 1]
    assert titles[brief_link[1]] == "PlenioSongBrief"
    # the sheet hands the score to the renderer, and the renderer to Master
    score_out = next(i for i, s in enumerate(score_sheet["outputs"]) if s["name"] == "score")
    assert any(link[1] == score_sheet["id"] and link[2] == score_out for link in template["links"])
    render = next(n for n in nodes if n.get("title") == "Plenio · YuE2 Render")
    abc_slot = next(s for s in render["inputs"] if s["name"] == "abc")
    assert links[abc_slot["link"]][1:3] == [score_sheet["id"], score_out]
    assert any(n.get("title") == "Plenio · Master" for n in nodes)


HQ_CHAIN = [
    "PlenioHQStereoCleanup",
    "PlenioHQRegenerateHighs",
    "PlenioHQDeReverb",
    "PlenioEQ",
    "PlenioLoudness",
]


def audio_chain(nodes: list[dict[str, Any]], links: list[Any], first: dict[str, Any]) -> list[dict[str, Any]]:
    """The HQ/master nodes the AUDIO output leads through from ``first`` on (links in either stored form)."""
    by_id = {n["id"]: n for n in nodes}
    rows = [
        [
            link["id"],
            link["origin_id"],
            link["origin_slot"],
            link["target_id"],
            link["target_slot"],
            link["type"],
        ]
        if isinstance(link, dict)
        else link
        for link in links
    ]
    path = [first]
    while True:
        here = path[-1]
        nexts = [
            by_id[row[3]]
            for row in rows
            if row[1] == here["id"]
            and row[5] == "AUDIO"
            and row[3] in by_id
            and by_id[row[3]]["type"] in HQ_CHAIN
        ]
        if not nexts:
            return path
        path.append(nexts[0])


def test_audio_hq_runs_in_the_master_block_before_the_eq() -> None:
    """Owner's request (2026-10-21): HQ 1 and HQ 2 on, HQ 3 bypassed, before the first EQ, inside the Master
    block; the presets follow the brief's genre (auto); the REFINE block outside it is gone. HQ 2 runs only with
    *HQ mastering* on: the switch at the top of the template, off, linked to the block alone (2026-10-22)."""
    from plenio.core.audio import hq

    for name in ("1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"):
        template = TEMPLATES[name]
        assert not any(n["type"] == "PlenioRefine" for n in template["nodes"]), name
        assert not any("REFINE" in g["title"] for g in template["groups"]), name
        assert all("Refine" not in sub["name"] for sub in template["definitions"]["subgraphs"]), name
        master_def = next(d for d in template["definitions"]["subgraphs"] if d["name"] == "Plenio · Master")
        nodes = master_def["nodes"]
        first = next(n for n in nodes if n["type"] == "PlenioHQStereoCleanup")
        path = audio_chain(nodes, master_def["links"], first)
        assert [n["type"] for n in path] == HQ_CHAIN, name
        modes = {n["type"]: n.get("mode", 0) for n in path}
        assert modes["PlenioHQDeReverb"] == 4, name
        assert all(modes[kind] == 0 for kind in HQ_CHAIN if kind != "PlenioHQDeReverb"), name
        highs = path[1]
        for node in path[:3]:
            assert node["widgets_values"][0] == hq.AUTO, name
        # the seed stays fixed (a new one on every queue would re-run the model), the model runs its 4 steps
        assert highs["widgets_values"][2:] == [0, "fixed", 4], name
        hq_input = next(slot for slot in master_def["inputs"] if slot["name"] == "hq_mastering")
        assert any(
            link["target_id"] == highs["id"]
            and link["origin_id"] == -10
            and link["origin_slot"] == master_def["inputs"].index(hq_input)
            for link in master_def["links"]
        ), name
        wrapper = next(n for n in template["nodes"] if n["type"] == master_def["id"])
        switch_slot = next(slot for slot in wrapper["inputs"] if slot["name"] == "hq_mastering")
        switch_link = next(link for link in template["links"] if link[0] == switch_slot["link"])
        switch = next(n for n in template["nodes"] if n["id"] == switch_link[1])
        # off, the first node of group 1, and made last (only the Models note and, since 1.4, the YuE2 LoRAs after
        # it): the template's other node ids stay as they were
        assert switch["type"] == "PlenioHQMastering" and switch["widgets_values"] == [False], name
        real = [
            n["id"] for n in template["nodes"] if n["type"] not in ("MarkdownNote", "Note", "PlenioLoras")
        ]
        assert switch["pos"] == [0, 0] and switch["id"] == max(real), name
        assert [link[3] for link in template["links"] if link[1] == switch["id"]] == [wrapper["id"]], name
        loader = next(n for n in nodes if n["type"] == "PlenioAudioModelLoader")
        assert loader["widgets_values"][:2] == ["super-resolution", "pytorch_model.bin"]
        assert loader["properties"]["models"][0]["directory"] == "audio_sr"
        inner = audio_chain(nodes, master_def["links"], loader)  # the loader feeds no AUDIO
        assert inner == [loader]
        assert any(
            link["origin_id"] == loader["id"] and link["target_id"] == highs["id"]
            for link in master_def["links"]
        ), name
        # the brief reaches the block (auto), and the three HQ reports reach the release record
        wrapper = next(n for n in template["nodes"] if n["type"] == master_def["id"])
        brief_slot = next(slot for slot in wrapper["inputs"] if slot["name"] == "brief")
        brief_link = next(link for link in template["links"] if link[0] == brief_slot["link"])
        assert next(n for n in template["nodes"] if n["id"] == brief_link[1])["type"].endswith("Brief"), name
        outputs = [out["name"] for out in master_def["outputs"]]
        export = next(n for n in template["nodes"] if n["type"] == "PlenioExportRelease")
        report_links = {slot["link"] for slot in export["inputs"] if slot["name"].startswith("reports.")}
        from_master = {
            outputs[link[2]]
            for link in template["links"]
            if link[0] in report_links and link[1] == wrapper["id"]
        }
        assert {"hq1_report", "hq2_report", "hq3_report", "eq_report", "loudness_report"} <= from_master, name


def test_enhance_runs_audio_hq_as_plain_nodes_with_standard_presets() -> None:
    from plenio.core.audio import hq

    template = TEMPLATES["4 · Enhance & Master"]
    nodes = template["nodes"]
    assert not any(n["type"] == "PlenioRefine" for n in nodes)
    first = next(n for n in nodes if n["type"] == "PlenioHQStereoCleanup")
    path = audio_chain(nodes, template["links"], first)
    assert [n["type"] for n in path] == HQ_CHAIN
    assert [n.get("mode", 0) for n in path[:3]] == [0, 0, 4]
    # no brief in this template: the presets say what they are
    assert [n["widgets_values"][0] for n in path[:3]] == [hq.PRESET_LABELS[hq.STANDARD]] * 3
    # the HQ Mastering switch sets HQ 2's *hq_mastering* - on here (owner's request 2026-10-24), off in the songs
    switch = next(n for n in nodes if n["type"] == "PlenioHQMastering")
    assert switch["widgets_values"] == [True] and switch["pos"] == [0, 0]
    hq_slot = next(slot for slot in path[1]["inputs"] if slot["name"] == "hq_mastering")
    assert next(link for link in template["links"] if link[0] == hq_slot["link"])[1] == switch["id"]
    app = template["extra"]["linearData"]["inputs"]
    shown = [(next(n for n in nodes if n["id"] == i)["type"], widget) for i, widget in app]
    assert ("PlenioHQStereoCleanup", "preset") in shown and ("PlenioHQRegenerateHighs", "preset") in shown
    assert shown[1] == ("PlenioHQMastering", "hq_mastering")


def _stems_parts(stems: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    loader = next(
        n for n in stems["nodes"] if n["type"] == "PlenioAudioModelLoader" and "Separation" in n["title"]
    )
    assert loader["widgets_values"][:2] == ["separation", "model_bs_roformer_ep_17_sdr_9.6568.ckpt"]
    assert loader["properties"]["models"][0]["directory"] == "audio_separation"
    mixer = next(n for n in stems["nodes"] if n["type"] == "PlenioStemMixer")
    assert mixer["widgets_values"] == [""]  # neutral by default: the input comes back unchanged
    return loader, mixer


def test_the_stems_sit_in_the_master_block_behind_its_switch() -> None:
    """Owner's request (2026-10-24): the STEMS block of the song templates moved into Plenio · Master - Separate
    Stems and the Stem Mixer before HQ 1, switched by the block's *stems* input (off). A bypassed stage cannot
    pass the song on there (the mixer has no audio input), so three If/Else switches choose the mix or the song
    and the two reports; their inputs are lazy, so nothing of the stems runs while the switch is off."""
    for name in ("1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"):
        template = TEMPLATES[name]
        assert not any("Stems" in str(n.get("title", "")) for n in template["nodes"]), name
        assert not any("STEMS" in g["title"] for g in template["groups"]), name
        assert all(d["name"] != "Plenio · Stems" for d in template["definitions"]["subgraphs"]), name
        master = next(d for d in template["definitions"]["subgraphs"] if d["name"] == "Plenio · Master")
        nodes = {n["id"]: n for n in master["nodes"]}
        links = {link["id"]: link for link in master["links"]}
        _loader, mixer = _stems_parts(master)
        separate = next(n for n in nodes.values() if n["type"] == "PlenioSeparateStems")
        stereo = next(n for n in nodes.values() if n["type"] == "PlenioHQStereoCleanup")
        switches = [n for n in nodes.values() if n["type"] == "ComfySwitchNode"]
        assert len(switches) == 3, name

        def source(node: dict[str, Any], slot: str, links: dict[int, Any] = links) -> tuple[int, int]:
            link = links[next(s for s in node["inputs"] if s["name"] == slot)["link"]]
            return link["origin_id"], link["origin_slot"]

        # HQ 1 hears the switch: on, the mix; off, the block's audio input (the song, as before)
        audio_switch = nodes[source(stereo, "audio")[0]]
        assert source(audio_switch, "on_true") == (mixer["id"], 0), name
        block_inputs = [slot["name"] for slot in master["inputs"]]
        assert source(audio_switch, "on_false") == (-10, block_inputs.index("audio")), name
        assert source(separate, "audio") == (-10, block_inputs.index("audio")), name
        # the three switches follow the block's stems input, off on the template's Master node
        for switch in switches:
            assert source(switch, "switch") == (-10, block_inputs.index("stems")), name
        wrapper = next(n for n in template["nodes"] if n["type"] == master["id"])
        widgets = [slot["name"] for slot in wrapper["inputs"] if slot.get("widget")]
        assert wrapper["widgets_values"][widgets.index("stems")] is False, name
        # both stem reports reach the release record through the block
        outputs = [out["name"] for out in master["outputs"]]
        export = next(n for n in template["nodes"] if n["type"] == "PlenioExportRelease")
        report_links = {slot["link"] for slot in export["inputs"] if slot["name"].startswith("reports.")}
        from_master = {
            outputs[link[2]]
            for link in template["links"]
            if link[0] in report_links and link[1] == wrapper["id"]
        }
        assert {"stems_report", "separation_report"} <= from_master, name


def test_enhance_keeps_its_stems_block_bypassed_in_the_source_section() -> None:
    """Enhance & Master: the Stems block (M6/D12, plan §11) bypassed and collapsed, under Load Audio in group
    1 (2026-10-24), before Audio HQ - every stage of the Master block, as plain nodes."""
    template = TEMPLATES["4 · Enhance & Master"]
    wrapper = next(n for n in template["nodes"] if "Stems" in str(n.get("title", "")))
    assert wrapper.get("mode") == 4 and wrapper["flags"]["collapsed"] is True
    assert "(optional)" in str(wrapper["title"])
    definition = next(d for d in template["definitions"]["subgraphs"] if d["id"] == wrapper["type"])
    assert definition["name"] == "Plenio · Stems"
    _stems_parts(definition)
    source = next(n for n in template["nodes"] if n["type"] == "LoadAudio")
    assert next(link for link in template["links"] if link[3] == wrapper["id"])[1] == source["id"]
    stereo = next(n for n in template["nodes"] if n["type"] == "PlenioHQStereoCleanup")
    assert (
        next(link for link in template["links"] if link[3] == stereo["id"] and link[5] == "AUDIO")[1]
        == wrapper["id"]
    )
    group = next(g for g in template["groups"] if g["title"] == "1 · SOURCE")
    x, y, width, height = group["bounding"]
    assert x <= wrapper["pos"][0] < x + width and y <= wrapper["pos"][1] < y + height
    export = next(n for n in template["nodes"] if n["type"] == "PlenioExportRelease")
    report_links = {slot["link"] for slot in export["inputs"] if slot["name"].startswith("reports.")}
    assert wrapper["id"] in {link[1] for link in template["links"] if link[0] in report_links}


@pytest.mark.parametrize("name", [n for n in sorted(TEMPLATES) if not n.startswith("0")])
def test_the_sections_stand_in_one_row(name: str) -> None:
    """Owner's request (2026-10-24): the numbered sections top-aligned and of one height; Cover Art above the
    render section, overlapping neither it nor the finish; the writer model in group 1 under the switches."""
    template = TEMPLATES[name]
    groups = {g["title"]: g["bounding"] for g in template["groups"]}
    numbered = [b for t, b in groups.items() if t.split(" ", 1)[0].isdigit()]
    assert len({b[1] for b in numbered}) == 1 and len({b[1] + b[3] for b in numbered}) == 1, name
    for (title, a), (other, b) in [
        (p, q) for i, p in enumerate(groups.items()) for q in list(groups.items())[i + 1 :]
    ]:
        assert not (
            a[0] < b[0] + b[2] and b[0] < a[0] + a[2] and a[1] < b[1] + b[3] and b[1] < a[1] + a[3]
        ), f"{name}: {title} / {other}"
    nodes = template["nodes"]
    if "COVER ART" in groups:
        cover = groups["COVER ART"]
        render = next(b for t, b in groups.items() if t.endswith("RENDER"))
        assert (
            cover[1] + cover[3] < render[1]
            and render[0] <= cover[0]
            and cover[0] + cover[2] <= render[0] + render[2]
        ), name
    group_one = next(b for t, b in groups.items() if t.startswith("1 "))
    inside = [
        n
        for n in nodes
        if group_one[0] <= n["pos"][0] < group_one[0] + group_one[2]
        and group_one[1] <= n["pos"][1] < group_one[1] + group_one[3]
    ]
    column = [n["type"] for n in sorted(inside, key=lambda n: n["pos"][1])]
    assert column[0] == "PlenioHQMastering", name
    if any(n["type"] == "PlenioWriterChoice" for n in nodes):
        assert column[1] == "PlenioWriterChoice", name


def test_thumbnails_are_400px_jpegs() -> None:
    image = pytest.importorskip("PIL.Image")
    for name in TEMPLATES:
        with image.open(PROJECT / "example_workflows" / f"{name}.jpg") as thumbnail:
            assert thumbnail.format == "JPEG" and thumbnail.size == (400, 400), name


def test_validator_checks_the_template_anatomy(tmp_path: Path) -> None:
    template = copy.deepcopy(TEMPLATES["2 · YuE2 · Cover"])
    bypassed = next(n for n in template["nodes"] if n["mode"] == 4 and "(optional)" in (n.get("title") or ""))
    bypassed["title"] = bypassed["title"].replace(" (optional)", "")
    cover = next(n for n in template["nodes"] if n.get("title") == "Cover Art")
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


def test_the_song_planner_reads_the_plan_lyrics_and_the_render_the_sheets_lyrics() -> None:
    """0.3.1 (study E6): the YuE2 planner gets a section form for instrumental songs through the text
    sheet's ``plan_lyrics``; the render keeps the sheet's ``lyrics`` ([instrumental]), never the form."""
    template = TEMPLATES["1 · YuE2 · Song"]
    titles = {n["id"]: n.get("title") or n["type"] for n in template["nodes"]}
    links = {link[0]: link for link in template["links"]}
    sheet = next(n for n in template["nodes"] if titles[n["id"]] == "Song Sheet · Text")
    outputs = [slot["name"] for slot in sheet["outputs"]]

    def source(node_title: str, name: str) -> tuple[str, str]:
        node = next(n for n in template["nodes"] if titles[n["id"]] == node_title)
        link = links[next(s["link"] for s in node["inputs"] if s["name"] == name)]
        return titles[link[1]], outputs[link[2]] if titles[link[1]] == "Song Sheet · Text" else str(link[2])

    assert source("Plenio · YuE2 Plan", "lyrics") == ("Song Sheet · Text", "plan_lyrics")
    assert source("Plenio · YuE2 Render", "lyrics") == ("Song Sheet · Text", "lyrics")


def test_the_committed_graphs_are_the_generators_output() -> None:
    """Templates and blueprints come from ``tools/build_graphs.py`` and are never edited by hand. After
    0.3.1 four templates were (the cover defaults of 0.4.3, the Sung Pitch wiring of 0.4.4), so a rebuild
    would have reverted them unnoticed (found 2026-10-07)."""
    import build_graphs
    from graph_builder import blueprint_file, workflow

    bp = build_graphs.blueprints()
    expected = {f"subgraphs/{b.name}.json": blueprint_file(b) for b in bp.values()}
    for name, graph, used, app in build_graphs.templates(bp):
        expected[f"example_workflows/{name}.json"] = workflow(graph, name, used, app)
    shipped = {
        path.relative_to(PROJECT).as_posix()
        for folder in ("subgraphs", "example_workflows")
        for path in (PROJECT / folder).glob("*.json")
    }
    assert shipped == set(expected), "every shipped graph is generated, and every generated graph is shipped"
    expected["locales/en/nodeDefs.json"] = build_graphs.locale(bp)
    stale = [
        path
        for path, data in expected.items()
        if json.loads((PROJECT / path).read_text(encoding="utf-8")) != json.loads(json.dumps(data))
    ]
    assert stale == [], f"run tools/build_graphs.py, or move the hand edit into it: {stale}"


def _input_spec(inputs: dict[str, Any], name: str) -> dict[str, Any] | None:
    """The options of input ``name`` (``parent.child``: a DynamicCombo option's input)."""
    parent, _, child = name.partition(".")
    for section in ("required", "optional"):
        spec = (inputs.get(section) or {}).get(parent)
        if spec is None:
            continue
        options = spec[1] if len(spec) > 1 and isinstance(spec[1], dict) else {}
        if not child:
            return options
        for option in options.get("options", []):
            found = _input_spec(option.get("inputs", {}), child) if isinstance(option, dict) else None
            if found is not None:
                return found
    return None


def _tooltip_of(node_type: str, name: str, locale: dict[str, Any]) -> str:
    entry = locale.get(node_type, {}).get("inputs", {}).get(name.replace(".", "_"), {})
    if entry.get("tooltip"):
        return str(entry["tooltip"])
    spec = _input_spec(SNAPSHOT["nodes"].get(node_type, {}).get("input", {}), name)
    return str((spec or {}).get("tooltip") or "")


@pytest.mark.parametrize("path", sorted((PROJECT / "example_workflows").glob("*.json")), ids=lambda p: p.name)
def test_every_field_a_template_shows_has_a_tooltip(path: Path) -> None:
    """The owner's request (2026-10-09): every input field in the workflows explains itself. A blueprint's
    wrapper node has no node definition of its own, so its tooltips ship in ``locales/en/nodeDefs.json``
    (built by ``tools/build_graphs.py``), as do those of the two native widgets the templates show that
    ComfyUI ships without one."""
    locale = json.loads((PROJECT / "locales" / "en" / "nodeDefs.json").read_text(encoding="utf-8"))
    graph = json.loads(path.read_text(encoding="utf-8"))
    missing = []
    for node in graph["nodes"]:
        if node["type"] in ("MarkdownNote", "Note"):
            continue
        for slot in node.get("inputs", []):
            # a field: a widget nothing is linked to (a linked one is driven by another node, as the switches
            # the Cover Brief sets in 2 · YuE2 · Cover)
            field = "widget" in slot and slot.get("link") is None
            if field and not _tooltip_of(node["type"], slot["name"], locale):
                missing.append(f"{node.get('title') or node['type']}.{slot['name']}")
    assert missing == []


def test_every_blueprint_input_and_output_has_a_tooltip() -> None:
    locale = json.loads((PROJECT / "locales" / "en" / "nodeDefs.json").read_text(encoding="utf-8"))
    for path in sorted((PROJECT / "subgraphs").glob("*.json")):
        definition = json.loads(path.read_text(encoding="utf-8"))["definitions"]["subgraphs"][0]
        entry = locale[definition["id"]]
        assert set(entry["inputs"]) == {i["name"].replace(".", "_") for i in definition["inputs"]}, path.name
        assert set(entry["outputs"]) == {str(index) for index in range(len(definition["outputs"]))}, path.name
        assert all(v["tooltip"].strip() for v in [*entry["inputs"].values(), *entry["outputs"].values()])


@pytest.mark.parametrize(
    "name", ["1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"]
)
def test_export_takes_the_brief_and_writes_tags_with_variables(name: str) -> None:
    """1.0.0 (owner's request 2026-10-15): the brief goes into Export Release, whose tags use its fields as
    variables - genre, date, a comment of optional parts, the lyrics - and a note beside it lists them."""
    from build_graphs import TEMPLATE_TAGS

    template = TEMPLATES[name]
    nodes = {n["id"]: n for n in template["nodes"]}
    export = next(n for n in nodes.values() if n["type"] == "PlenioExportRelease")
    brief = next(n for n in nodes.values() if n["type"] in ("PlenioSongBrief", "PlenioCoverBrief"))
    slot = next(index for index, s in enumerate(export["inputs"]) if s["name"] == "brief")
    assert any(
        link[1] == brief["id"] and link[3] == export["id"] and link[4] == slot for link in template["links"]
    )
    values = export["widgets_values"]
    assert values[values.index("tags") + 1 :][:9] == [
        "",
        "",
        "{date}",
        "",
        "{genre}",
        TEMPLATE_TAGS["tags.comment"],
        "",
        "",
        "{lyrics}",
    ]
    assert values[-3] is True  # lyrics subtitles (SRT): on
    assert values[-2] == "vocal stem"  # the lyrics heard on the vocal stem: the song is the quicker choice.1
    assert values[-1] is True  # the song's page (HTML), GitHub issue 2026-10-28
    note = next(n for n in nodes.values() if n.get("title") == "Tags & variables")
    for word in ("{genre}", "{mood}", "{lyrics}", "{take_seed}", "(notes).srt"):
        assert word in note["widgets_values"][0], word


@pytest.mark.parametrize("name", sorted(TEMPLATES))
def test_every_template_says_which_model_file_goes_where(name: str) -> None:
    """Owner's request (2026-10-26): a note in every template, like ComfyUI's own templates have, with each model file,
    its folder and link - and the files for a smaller or larger graphics card. Every file a loader of the template
    downloads is in it, under its folder in the tree."""
    template = TEMPLATES[name]
    note = next(n for n in template["nodes"] if n.get("title") == "Models · what goes where")
    text = note["widgets_values"][0]
    assert (
        note["pos"][0]
        < next(n for n in template["nodes"] if n.get("title") == "About this template")["pos"][0]
    )
    downloads = [
        entry for node in template["nodes"] for entry in (node.get("properties") or {}).get("models", [])
    ] + [
        entry
        for definition in template["definitions"]["subgraphs"]
        for node in definition["nodes"]
        for entry in (node.get("properties") or {}).get("models", [])
    ]
    for entry in downloads:
        assert f"[{entry['name']}]({entry['url']})" in text, (name, entry["name"])
        assert f"📂 {entry['directory']}/" in text, (name, entry["directory"])
    if name.startswith(("1 ", "2 ", "3 ", "5 ")):
        assert "## Your graphics card" in text and "No graphics card" in text
    # the view opens with the note in sight
    assert template["extra"]["ds"]["offset"][0] + note["pos"][0] >= 0


YUE2_TEMPLATES = ["1 · YuE2 · Song", "2 · YuE2 · Cover", "5 · YuE2 · DAW"]
ORIGINAL = "yue2_3b_int8_convrot.safetensors"
FINETUNE = "yue2_3b_RS-FW-2.4x0.75_int8_convrot.safetensors"


def _yue2_block(template: dict[str, Any]) -> dict[str, Any]:
    definition = next(d for d in template["definitions"]["subgraphs"] if d["name"] == "Plenio · YuE2 Model")
    return next(n for n in template["nodes"] if n["type"] == definition["id"])


@pytest.mark.parametrize("name", YUE2_TEMPLATES)
def test_the_yue2_block_shows_its_checkpoint_choice_with_the_original_as_default(name: str) -> None:
    """GitHub issue #26: collapsed, the block hid its *checkpoint*, and a finetune was wired in by hand inside it."""
    block = _yue2_block(TEMPLATES[name])
    assert not block["flags"].get("collapsed")
    assert block["widgets_values"] == [ORIGINAL]
    assert [i.get("label") for i in block["inputs"] if i.get("widget")] == ["checkpoint"]


@pytest.mark.parametrize("name", YUE2_TEMPLATES)
def test_a_chosen_checkpoint_gives_the_music_model_its_text_side_its_decoder_and_the_engine(
    name: str,
) -> None:
    from plenio.core.workflow_prompt import to_prompt

    workflow = copy.deepcopy(TEMPLATES[name])
    _yue2_block(workflow)["widgets_values"] = [FINETUNE]
    prompt = to_prompt(workflow, SNAPSHOT["nodes"].get)
    # one loader, with the file chosen; the template's other checkpoint loaders do not exist
    loaders = [key for key, node in prompt.items() if node["class_type"] == "CheckpointLoaderSimple"]
    assert len(loaders) == 1 and prompt[loaders[0]]["inputs"]["ckpt_name"] == FINETUNE
    loader = loaders[0]

    def comes_from_loader(link: Any, seen: frozenset[str] = frozenset()) -> bool:
        """The link leads to the loader, through what passes MODEL and CLIP on (the LoRAs, the cover's adapter)."""
        key = str(link[0])
        if key == loader:
            return True
        if key in seen:
            return False
        inputs = prompt[key]["inputs"]
        return any(
            isinstance(value, list) and len(value) == 2 and comes_from_loader(value, seen | {key})
            for name, value in inputs.items()
            if name in ("model", "clip", "on_false", "on_true", "value")
        )

    loras = next(node for node in prompt.values() if node["class_type"] == "PlenioLoras")
    assert loras["inputs"]["model"] == [loader, 0] and loras["inputs"]["clip"] == [loader, 1]
    # the original's instrumental adapter inside the block stays bypassed, as in a template without a choice
    assert not any(key.endswith(":102") for key in prompt)
    engine = next(node for node in prompt.values() if node["class_type"] == "PlenioEngine")
    assert engine["inputs"]["clip"] == [loader, 1]
    decoders = [node for node in prompt.values() if node["class_type"] == "VAEDecodeAudio"]
    assert decoders and all(node["inputs"]["vae"] == [loader, 2] for node in decoders)
    # every take: the text side in YuE2's own node, the music model in its sampler
    renders = [node for node in prompt.values() if node["class_type"] == "YuE2GenerateMusic"]
    assert renders and all(comes_from_loader(node["inputs"]["clip"]) for node in renders)
    samplers = [
        node
        for node in prompt.values()
        if node["class_type"] == "KSampler" and comes_from_loader(node["inputs"]["model"])
    ]
    assert len(samplers) == len(renders)


@pytest.mark.parametrize(
    "name", ["1 · YuE2 · Song", "2 · YuE2 · Cover", "3 · MiniMax · Song", "5 · YuE2 · DAW"]
)
def test_the_writer_default_is_gemma_4_12b_for_this_machine(name: str) -> None:
    from plenio.core.llm import AUTO

    template = TEMPLATES[name]
    choices = [n for n in template["nodes"] if n["type"] == "PlenioWriterChoice"]
    assert [n["widgets_values"] for n in choices] == [[AUTO]]
    # no template asks to download a ComfyUI writer file: the GGUF is fetched by the run (or found on the machine)
    assert not choices[0].get("properties", {}).get("models")
    inner = [
        node
        for definition in template["definitions"]["subgraphs"]
        for node in definition["nodes"]
        if node["type"] == "PlenioWriterChoice"
    ]
    assert inner and all(node["widgets_values"] == [AUTO] for node in inner)
