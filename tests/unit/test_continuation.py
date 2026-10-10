"""Continue a song from its release record (owner's request 2026-10-11): which workflow opens, which settings
go where, and the Song Sheets that keep the song's documents."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core import continuation as c
from plenio.core.errors import PlenioUserError
from plenio.core.release import RECORD_SCHEMA

ROOT = Path(__file__).resolve().parents[2]
TEMPLATES = {
    path.stem: json.loads(path.read_text(encoding="utf-8"))
    for path in sorted((ROOT / "example_workflows").glob("*.json"))
}
SONG = "1 · YuE2 · Song"


def node(kind: str, label: str | None = None, /, **inputs: Any) -> dict[str, Any]:
    entry: dict[str, Any] = {"class_type": kind, "inputs": inputs}
    if label is not None:
        entry["_meta"] = {"title": label}
    return entry


def prompt_of(workflow: dict[str, Any], renumber: int = 0) -> dict[str, dict[str, Any]]:
    """A prompt with every node of ``workflow`` that runs (titles as the frontend sends them; a node without a
    title of its own is named by its class). ``renumber`` shifts the top-level ids, as a template does
    between versions."""
    prompt: dict[str, dict[str, Any]] = {}
    for node_id, info in c.workflow_nodes(workflow).items():
        if info.block:
            continue
        head, _, rest = node_id.partition(":")
        new_id = f"{int(head) + renumber}" + (f":{rest}" if rest else "")
        prompt[new_id] = node(info.type, info.title or info.type)
    return prompt


def record(prompt: dict[str, Any], **extra: Any) -> dict[str, Any]:
    doc = lambda text: {"state": "auto", "status": "auto", "sha256": "a" * 64, "text": text}  # noqa: E731
    return {
        "schema": RECORD_SCHEMA,
        "created": "2026-10-11T10:00:00+0200",
        "title": "Harbour Lights",
        "versions": {"plenio": "0.5.0"},
        "documents": {
            "title": doc("Harbour Lights"),
            "style": doc("pop, warm piano"),
            "lyrics": doc("[Verse]\nthe harbour lights\n"),
            "score": doc("X:1\nK:C\n"),
            "artwork_prompt": doc(""),
        },
        "reports": [],
        "audio": {"seconds": 92.5},
        "files": [{"name": "Harbour Lights.flac"}, {"name": "Harbour Lights.jpg", "role": "cover"}],
        "licences": [],
        "prompt": prompt,
        "fingerprint": "f" * 64,
        **extra,
    }


def test_links_redacted_values_and_the_sheet_state_are_no_settings() -> None:
    prompt = {
        "4": node("PlenioSongBrief", description="a song", genre=["9", 0], api_key="<redacted>"),
        "7": node("PlenioSongSheet", review="continue", sheet_state="{}", brief=["4", 0]),
        "9": node("PreviewAudio", audio=["8", 0]),
    }
    assert c.literal_inputs(prompt) == {"4": {"description": "a song"}, "7": {"review": "continue"}}
    assert c.is_link(["4", 0]) and not c.is_link(["4", True]) and not c.is_link([1, 0])


def test_the_template_of_a_record_is_found_also_when_its_ids_moved() -> None:
    # a template's node ids change between versions; its nodes keep class and title (Take seed, Song Sheet · Text)
    song = TEMPLATES[SONG]
    for shift in (0, 40):
        prompt = prompt_of(song, renumber=shift)
        match = c.match_template(prompt, TEMPLATES)
        assert match is not None and match.name == SONG, shift
        seeds = {pid: tid for pid, tid in match.mapping.items() if prompt[pid]["class_type"] == "SeedNode"}
        nodes = c.workflow_nodes(song)
        assert {prompt[p]["_meta"]["title"] for p in seeds} == {nodes[t].title for t in seeds.values()}
        assert all(prompt[p]["_meta"]["title"] == nodes[t].title for p, t in seeds.items())
        sheets = [p for p, n in prompt.items() if n["class_type"] == "PlenioSongSheet"]
        assert all(nodes[match.mapping[p]].title == prompt[p]["_meta"]["title"] for p in sheets)


def test_a_workflow_of_ones_own_has_no_template() -> None:
    prompt = {
        "1": node("PlenioSongSheet", "My sheet"),
        "2": node("LoadAudio", "Mine"),
        "3": node("KSampler", "x"),
    }
    prompt.update({str(i): node("CLIPTextEncode", f"prompt {i}") for i in range(4, 20)})
    assert c.match_template(prompt, TEMPLATES) is None
    assert c.match_template({}, TEMPLATES) is None


def test_inner_values_go_to_the_widget_of_their_block() -> None:
    fed = c.widget_inputs(TEMPLATES[SONG])
    # the Write Song block's *thinking* and the YuE2 Plan block's plan seed are widgets on the instance
    assert fed[("4:504", "thinking")] == ("4", "thinking")
    assert fed[("8:704", "value")] == ("8", "seed")
    placed = c.place_values(
        {"4:504": {"thinking": True, "max_length": 512}, "8:704": {"value": 7}}, TEMPLATES[SONG]
    )
    assert placed == {"4": {"thinking": True}, "4:504": {"max_length": 512}, "8": {"seed": 7}}


def test_the_song_sheets_keep_their_documents_as_manual() -> None:
    approved = json.dumps(
        {"schema": "plenio.sheet_state/1", "docs": {}, "review": {"approved_fingerprint": "e" * 64}}
    )
    prompt = {
        "7": node(
            "PlenioSongSheet",
            "Song Sheet · Text",
            title=["4", 1],
            style=["4", 2],
            lyrics=["4", 3],
            sheet_state=approved,
        ),
        "12": node("PlenioSongSheet", "Song Sheet · Score", score=["8", 0], sheet_state=""),
    }
    # reports before 0.4.5 do not name their sheet: the documents go by the sheet's linked inputs
    states = {k: json.loads(v) for k, v in c.sheet_states(record(prompt)).items()}
    assert set(states["7"]["docs"]) == {"title", "style", "lyrics"}
    assert states["7"]["docs"]["lyrics"] == {"state": "manual", "text": "[Verse]\nthe harbour lights\n"}
    assert states["7"]["review"] == {
        "approved_fingerprint": "e" * 64
    }  # holds while the documents are the same
    assert (
        states["12"]["docs"] == {"score": {"state": "manual", "text": "X:1\nK:C\n"}}
        and "review" not in states["12"]
    )
    # a report that names its sheet decides its documents; a mapping moves them to the template's node
    report = {"kind": "song_sheet", "data": {"node_id": "12", "documents": {"score": {"text": "X:1\nK:D\n"}}}}
    moved = c.sheet_states(record(prompt, reports=[report]), {"7": "70", "12": "120"})
    assert set(moved) == {"70", "120"} and "K:D" in json.loads(moved["120"])["docs"]["score"]["text"]


def test_a_record_with_its_workflow_opens_that_workflow() -> None:
    workflow = {"nodes": [{"id": 7, "type": "PlenioSongSheet"}], "links": []}
    prompt = {"7": node("PlenioSongSheet", "Song Sheet · Text", lyrics=["4", 3])}
    plan = c.continuation(record(prompt, workflow=workflow), TEMPLATES, source="Harbour Lights.plenio.json")
    assert plan["from"] == "record" and plan["workflow"] == workflow and plan["values"] == {}
    assert json.loads(plan["sheets"]["7"])["docs"]["lyrics"]["state"] == "manual"
    assert plan["schema"] == c.CONTINUATION_SCHEMA and plan["title"] == "Harbour Lights"


def test_an_older_record_opens_in_todays_template_with_its_settings() -> None:
    prompt = prompt_of(TEMPLATES[SONG], renumber=40)
    take = next(p for p, n in prompt.items() if n.get("_meta", {}).get("title") == "Take seed")
    prompt[take]["inputs"] = {"seed": 4242}
    stems = next(p for p, n in prompt.items() if n["class_type"] == "PlenioSeparateStems")
    prompt["999"] = node("PlenioRetiredNode", "Gone since")
    plan = c.continuation(record(prompt), TEMPLATES)
    assert plan["from"] == "template" and plan["template"] == SONG
    nodes = c.workflow_nodes(TEMPLATES[SONG])
    target = next(t for t, v in plan["values"].items() if v == {"seed": 4242})
    assert nodes[target].title == "Take seed"
    # the Stems block ran: it is turned on (the template has it off)
    block = next(
        i
        for i, n in nodes.items()
        if ":" not in i and n.block and n.mode != 0 and n.title and n.title.startswith("Stems")
    )
    assert stems.split(":")[0] != block and block in plan["activate"]
    assert plan["unplaced"] == ["Gone since"]


def test_a_record_no_workflow_can_be_rebuilt_for_gives_its_documents() -> None:
    plan = c.continuation(record({"1": node("MyNode", "mine")}), TEMPLATES)
    assert plan["from"] == "none" and plan["workflow"] is None
    assert plan["documents"] == {
        "title": "Harbour Lights",
        "style": "pop, warm piano",
        "lyrics": "[Verse]\nthe harbour lights\n",
        "score": "X:1\nK:C\n",
    }


def test_only_release_records_are_continued() -> None:
    with pytest.raises(PlenioUserError, match="no Plenio release record"):
        c.continuation({"nodes": []}, TEMPLATES, source="workflow.json")


def test_the_stored_workflow_hides_the_prompts_secrets() -> None:
    prompt = {"5": node("SomeApiNode", api_key="sk-live-1234567890abcdefgh", text="hello")}
    workflow = {
        "nodes": [{"id": 5, "widgets_values": ["sk-live-1234567890abcdefgh", "hello", "hf_" + "a" * 30]}]
    }
    stored = c.workflow_for_record(workflow, prompt)
    assert stored == {"nodes": [{"id": 5, "widgets_values": ["<redacted>", "hello", "<redacted>"]}]}
    assert c.workflow_for_record(None, prompt) is None and c.workflow_for_record({"x": 1}, prompt) is None


def test_the_records_of_the_output_folder(tmp_path: Path) -> None:
    folder = tmp_path / "plenio" / "2026"
    folder.mkdir(parents=True)
    (folder / "Harbour Lights.plenio.json").write_text(json.dumps(record({})), encoding="utf-8")
    (folder / "Broken.plenio.json").write_text("{not json", encoding="utf-8")
    (folder / "Workflow.plenio.json").write_text(json.dumps({"nodes": []}), encoding="utf-8")
    rows = c.list_records(tmp_path)
    assert rows == [
        {
            "path": "plenio/2026/Harbour Lights.plenio.json",
            "title": "Harbour Lights",
            "created": "2026-10-11T10:00:00+0200",
            "plenio": "0.5.0",
            "seconds": 92.5,
            "audio": "plenio/2026/Harbour Lights.flac",
            "cover": "plenio/2026/Harbour Lights.jpg",
            "workflow": False,
        }
    ]
    assert c.record_path(tmp_path, rows[0]["path"]) == (folder / "Harbour Lights.plenio.json").resolve()
    for bad in ("../outside.plenio.json", "plenio/2026/Harbour Lights.flac", "plenio/none.plenio.json"):
        with pytest.raises(PlenioUserError):
            c.record_path(tmp_path, bad)
