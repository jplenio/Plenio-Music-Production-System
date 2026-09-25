"""The YuE2 Song path in a real ComfyUI server with model fakes (V2).

Graph: Song Brief -> Compose -> fake LLM -> Parse -> Song Sheet (text) -> fake plan
-> Score Tools -> Song Sheet (score) -> fake render -> Export Release.
"""

from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host

ROOT = Path(__file__).resolve().parents[2]


def sheet_state(docs: dict[str, Any] | None = None, approved: str | None = None) -> str:
    state: dict[str, Any] = {"schema": "plenio.sheet_state/1", "docs": docs or {}}
    if approved:
        state["review"] = {"approved_fingerprint": approved}
    return json.dumps(state)


def song_prompt(
    *,
    label: str,
    variant: str = "a",
    text_state: str = "",
    score_state: str = "",
    text_review: str = "continue",
    score_review: str = "continue",
    plan_seed: int = 0,
    take_seed: int = 1,
    vocals: str = "sung",
) -> dict[str, Any]:
    vocals_inputs = (
        {"vocals.language": "English", "vocals.voice": "", "vocals.theme": ""}
        if vocals == "sung"
        else {"vocals.melody": "instrument plays the lead", "vocals.lead_instrument": ""}
    )
    return {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "template": "none",
                "description": f"A song about rain ({label})",
                "genre": "piano pop",
                "mood": "",
                "tempo": "88 BPM",
                "length": "short (about 1:30)",
                "vocals": vocals,
                **vocals_inputs,
                "key": "",
                "meter": "",
            },
        },
        "2": {"class_type": "PlenioTestFakeEngine", "inputs": {}},
        "3": {
            "class_type": "PlenioComposePrompt",
            "inputs": {"brief": ["1", 0], "engine": ["2", 0], "detail": "standard"},
        },
        "4": {"class_type": "PlenioTestFakeLLM", "inputs": {"prompt": ["3", 0], "variant": variant}},
        "5": {"class_type": "PlenioParseDraft", "inputs": {"text": ["4", 0], "request": ["3", 1]}},
        "6": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "title": ["5", 0],
                "style": ["5", 1],
                "lyrics": ["5", 2],
                "artwork_prompt": ["5", 3],
                "brief": ["1", 0],
                "engine": ["2", 0],
                "review": text_review,
                "sheet_state": text_state,
            },
        },
        "7": {
            "class_type": "PlenioTestFakePlan",
            "inputs": {"style": ["6", 1], "lyrics": ["6", 2], "seed": plan_seed},
        },
        "8": {
            "class_type": "PlenioScoreTools",
            "inputs": {"score": ["7", 0], "brief": ["1", 0], "operation": "prepare from brief"},
        },
        "9": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["8", 0],
                "context_style": ["6", 1],
                "context_lyrics": ["6", 2],
                "brief": ["1", 0],
                "engine": ["2", 0],
                "review": score_review,
                "sheet_state": score_state,
            },
        },
        "10": {
            "class_type": "PlenioTestFakeRender",
            "inputs": {
                "style": ["6", 1],
                "lyrics": ["6", 2],
                "abc": ["9", 3],
                "mode": ["9", 5],
                "max_duration": ["9", 6],
                "seed": take_seed,
            },
        },
        "11": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["10", 0],
                "title": ["6", 0],
                "folder": f"plenio-test/{label}",
                "naming": "{title}",
                "collision": "number",
                "reports.report_0": ["6", 7],
                "reports.report_1": ["9", 7],
            },
        },
    }


def label() -> str:
    return uuid.uuid4().hex[:10]


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def sheet_payload(entry: dict[str, Any], node_id: str) -> dict[str, Any]:
    payload: dict[str, Any] = entry["outputs"][node_id]["plenio_sheet"][0]
    return payload


def test_brief_to_flac_with_exact_conditioning(server: ComfyServer, log: Log) -> None:
    name = label()
    entry = server.run(song_prompt(label=name))
    render = events(log, "render")[-1]
    text = sheet_payload(entry, "6")
    score = sheet_payload(entry, "9")
    # WYSIWYG: the renderer receives exactly the sheets' outputs.
    assert render["style"] == text["docs"]["style"]["text"]
    assert render["lyrics"] == text["docs"]["lyrics"]["text"]
    assert render["abc"] == score["docs"]["score"]["text"]
    assert (render["mode"], render["max_duration"]) == (
        score["planning_mode"],
        pytest.approx(score["score_seconds"]),
    )
    assert render["mode"] == "full"  # the fake plan has chords
    folder = server.output_dir / "plenio-test" / name
    flac = folder / "Neon Rain.flac"
    record = json.loads((folder / "Neon Rain.plenio.json").read_text(encoding="utf-8"))
    assert flac.stat().st_size > 1000
    assert record["documents"]["lyrics"]["text"] == render["lyrics"]
    assert record["documents"]["score"]["text"] == render["abc"]
    assert record["prompt"]["10"]["inputs"]["seed"] == 1
    assert any("CC BY-NC" in licence for licence in record["licences"])


def test_new_take_reuses_draft_and_plan(server: ComfyServer, log: Log) -> None:
    name = label()
    server.run(song_prompt(label=name, take_seed=1))
    log.clear()
    server.run(song_prompt(label=name, take_seed=2))
    assert events(log, "llm") == [] and events(log, "plan") == []
    assert [e["seed"] for e in events(log, "render")] == [2]


def test_all_manual_documents_skip_the_writer(server: ComfyServer, log: Log) -> None:
    docs = {
        kind: {"state": "manual", "text": text}
        for kind, text in {
            "title": "Hand Made",
            "style": "English, folk, warm male voice, acoustic guitar, 90 BPM",
            "lyrics": "[Verse]\nEvery word is mine\n\n[Chorus]\nMine alone",
            "artwork_prompt": "A guitar.",
        }.items()
    }
    entry = server.run(song_prompt(label=label(), text_state=sheet_state(docs)))
    assert events(log, "llm") == []
    assert events(log, "render")[-1]["lyrics"] == "[Verse]\nEvery word is mine\n\n[Chorus]\nMine alone"
    assert sheet_payload(entry, "6")["docs"]["title"]["status"] == "manual"


def test_edited_document_survives_until_its_draft_changes(server: ComfyServer, log: Log) -> None:
    name = label()
    first = server.run(song_prompt(label=name))
    draft = sheet_payload(first, "6")["docs"]["lyrics"]
    edited = {
        "lyrics": {
            "state": "edited",
            "text": "[Verse]\nMy own verse\n\n[Chorus]\nWe run through neon rain",
            "base_sha256": draft["upstream_sha256"],
        }
    }
    server.run(song_prompt(label=name, text_state=sheet_state(edited)))
    assert events(log, "render")[-1]["lyrics"].startswith("[Verse]\nMy own verse")
    error = server.run_expect_error(song_prompt(label=name, text_state=sheet_state(edited), variant="b"))
    assert error["node_type"] == "PlenioSongSheet"
    assert "conflict" in error["exception_message"] and "lyrics" in error["exception_message"]


def test_review_gate_blocks_and_releases(server: ComfyServer, log: Log) -> None:
    name = label()
    waiting = server.run(song_prompt(label=name, text_review="stop for review"))
    payload = sheet_payload(waiting, "6")
    assert payload["waiting"] and payload["fingerprint"]
    assert events(log, "plan") == [] and events(log, "render") == []
    log.clear()
    server.run(
        song_prompt(
            label=name, text_review="stop for review", text_state=sheet_state(approved=payload["fingerprint"])
        )
    )
    assert events(log, "llm") == []  # draft cached; only the sheet re-ran
    assert len(events(log, "plan")) == 1 and len(events(log, "render")) == 1


def test_edited_score_survives_takes_and_conflicts_with_a_new_plan(server: ComfyServer, log: Log) -> None:
    name = label()
    first = server.run(song_prompt(label=name))
    plan_draft = sheet_payload(first, "9")["docs"]["score"]
    edited_score = plan_draft["upstream"].replace("Q:1/4=80", "Q:1/4=96")
    state = sheet_state(
        {"score": {"state": "edited", "text": edited_score, "base_sha256": plan_draft["upstream_sha256"]}}
    )
    server.run(song_prompt(label=name, score_state=state, take_seed=5))
    server.run(song_prompt(label=name, score_state=state, take_seed=6))
    renders = events(log, "render")
    assert [r["seed"] for r in renders[-2:]] == [5, 6] and all("Q:1/4=96" in r["abc"] for r in renders[-2:])
    assert len(events(log, "plan")) == 1
    error = server.run_expect_error(song_prompt(label=name, score_state=state, plan_seed=7))
    assert "score" in error["exception_message"] and "conflict" in error["exception_message"]


def test_instrumental_song_is_tags_only_with_a_silent_vocal_voice(server: ComfyServer, log: Log) -> None:
    entry = server.run(song_prompt(label=label(), vocals="instrumental"))
    render = events(log, "render")[-1]
    assert render["lyrics"] == "[instrumental]"  # the bare tag: YuE2 plans the form (owner verdict, Phase 4A)
    assert "voice" not in render["style"] and "English" not in render["style"]
    abc_lines = render["abc"].splitlines()
    vocal_music = [abc_lines[i + 1] for i, line in enumerate(abc_lines) if line == "V: Vocal"]
    assert all(set(line) <= set('"CGFz16|') for line in vocal_music)  # only chords and rests
    report = entry["outputs"]["8"]["plenio_summary"][0]["markdown"]
    assert "moved to Ins" in report


def test_invalid_document_stops_with_the_findings(server: ComfyServer, log: Log) -> None:
    docs = {"style": {"state": "manual", "text": "pop, [Verse] structure, 3:30 minutes"}}
    error = server.run_expect_error(song_prompt(label=label(), text_state=sheet_state(docs)))
    assert error["node_type"] == "PlenioSongSheet"
    assert "timing" in error["exception_message"] or "tags" in error["exception_message"]
    assert events(log, "plan") == []


def test_sheet_resolve_route_matches_the_node(server: ComfyServer, log: Log) -> None:
    entry = server.run(song_prompt(label=label()))
    payload = sheet_payload(entry, "6")
    status, route = server.request(
        "POST",
        "/plenio/sheet/resolve",
        {
            "sheet_state": "",
            "upstream": {k: v["upstream"] for k, v in payload["docs"].items()},
            "owned": payload["owned"],
            "engine": "yue2",
            "instrumental": False,
            "review": "continue",
        },
    )
    assert status == 200
    assert route["fingerprint"] == payload["fingerprint"]


def test_score_routes(server: ComfyServer) -> None:
    abc = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
    status, analysis = server.request("POST", "/plenio/score/analyze", {"abc": abc})
    assert status == 200 and analysis["ok"] and analysis["sections"][0]["tag"] == "[Verse]"
    status, result = server.request(
        "POST", "/plenio/score/transform", {"abc": abc, "operation": {"op": "transpose", "semitones": 2}}
    )
    assert status == 200 and result["analysis"]["header"]["key"] == "D"
    status, bad = server.request(
        "POST", "/plenio/score/transform", {"abc": abc, "operation": {"op": "explode"}}
    )
    assert status == 400 and "Unknown score operation" in bad["error"]["message"]
    status, lyrics = server.request(
        "POST", "/plenio/lyrics/analyze", {"lyrics": "[Verse]\nHello", "abc": abc, "engine": "yue2"}
    )
    assert status == 200 and lyrics["sections"][0]["score_section"] == "verse"


def test_score_editor_routes(server: ComfyServer) -> None:
    """The element view and the editor operations over HTTP, with their refusals."""
    abc = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
    status, view = server.request("POST", "/plenio/score/analyze", {"abc": abc})
    assert status == 200 and view["ok"]
    assert {"elements", "chords", "notes", "bar_starts_s", "display_abc"} <= set(view)
    first = view["elements"][0]
    assert (first["id"], first["midi"], first["name"]) == ("V1.0", 64, "E4")
    assert abc[first["source"][0] : first["source"][1]] == "E2"
    assert len(view["bar_starts_s"]) == 8 and '"^Verse"' in view["display_abc"]

    def transform(text: str, operation: dict[str, Any]) -> tuple[int, Any]:
        return server.request("POST", "/plenio/score/transform", {"abc": text, "operation": operation})

    status, result = transform(abc, {"op": "shift_pitch", "ids": ["V1.0"], "semitones": 1})
    assert status == 200
    assert result["changes"] == ["bar 1 Vocal: E4 -> F4"] and result["select"] == ["V1.0"]
    assert result["analysis"]["elements"][0]["midi"] == 65
    status, moved = transform(abc, {"op": "move_section_boundary", "section": 2, "start_bar": 4})
    assert status == 200 and [s["start_bar"] for s in moved["analysis"]["sections"]] == [1, 4]
    status, renamed = transform(abc, {"op": "rename_section", "section": 2, "label": "Bridge"})
    assert status == 200 and "% bridge" in renamed["abc"]
    # refusals: 400 with the message and the hint the editor shows
    status, refused = transform(abc, {"op": "set_duration", "id": "V1.0", "units": 16})
    assert status == 400 and "cannot grow by 14" in refused["error"]["message"]
    assert refused["error"]["hint"].startswith("Turn the following note into a rest")
    status, refused = transform(abc, {"op": "shift_pitch", "ids": ["V1.0"]})
    assert status == 400 and "whole number 'semitones'" in refused["error"]["message"]
    status, refused = server.request("POST", "/plenio/score/transform", {"abc": abc})
    assert status == 400 and "'operation' object" in refused["error"]["message"]
    status, refused = server.request("POST", "/plenio/score/analyze", {})
    assert status == 400 and "'abc'" in refused["error"]["message"]
    # an invalid score: an analysis with positioned diagnostics (no element view), no transform
    broken = abc.replace("E2G2A2G2E2D2C4|", "E2G2A2G2E2D2C2|", 1)
    status, invalid = server.request("POST", "/plenio/score/analyze", {"abc": broken})
    assert status == 200 and not invalid["ok"] and "elements" not in invalid
    diagnostic = invalid["diagnostics"][0]
    assert diagnostic["line"] == 11 and broken[diagnostic["start"] : diagnostic["end"]] == '"C"E2G2A2G2E2D2C2'
    status, refused = transform(broken, {"op": "shift_pitch", "ids": ["V1.0"], "semitones": 1})
    assert status == 400 and "not valid native two-voice ABC" in refused["error"]["message"]


def test_a_score_edited_in_the_editor_reaches_the_renderer(server: ComfyServer, log: Log) -> None:
    """Editor operation -> Apply (edited) -> render; a new take keeps it, a new plan conflicts."""
    name = label()
    first = server.run(song_prompt(label=name))
    draft = sheet_payload(first, "9")["docs"]["score"]
    status, view = server.request("POST", "/plenio/score/analyze", {"abc": draft["text"]})
    assert status == 200 and view["ok"]
    note = next(e for e in view["elements"] if e["voice"] == "Vocal" and e["kind"] == "note")
    status, edited = server.request(
        "POST",
        "/plenio/score/transform",
        {"abc": draft["text"], "operation": {"op": "shift_pitch", "ids": [note["id"]], "semitones": 2}},
    )
    assert status == 200
    moved = next(e for e in edited["analysis"]["elements"] if e["id"] == edited["select"][0])
    assert moved["midi"] == note["midi"] + 2
    state = sheet_state(
        {"score": {"state": "edited", "text": edited["abc"], "base_sha256": draft["upstream_sha256"]}}
    )
    entry = server.run(song_prompt(label=name, score_state=state, take_seed=8))
    score = sheet_payload(entry, "9")["docs"]["score"]
    assert score["status"] == "edited"
    assert events(log, "render")[-1]["abc"] == score["text"] == edited["abc"].strip()
    server.run(song_prompt(label=name, score_state=state, take_seed=9))
    assert events(log, "render")[-1]["abc"] == score["text"] and events(log, "render")[-1]["seed"] == 9
    assert len(events(log, "plan")) == 1
    error = server.run_expect_error(song_prompt(label=name, score_state=state, plan_seed=11))
    assert error["node_type"] == "PlenioSongSheet"
    assert "conflict" in error["exception_message"] and "score" in error["exception_message"]


def test_template_routes(server: ComfyServer) -> None:
    listing = server.get("/plenio/templates")["templates"]
    assert len(listing) >= 239
    template = server.get("/plenio/templates/pop/german-pop-vocal")
    assert template["fields"]["language"] == "German"
    status, saved = server.request(
        "POST", "/plenio/templates", {"name": "Host Test", "fields": {"genre": "jazz"}}
    )
    assert status == 200 and saved["id"] == "user/host-test"
    assert (server.base / "user" / "default" / "plenio" / "templates" / "host-test.md").exists() or (
        server.base / "user" / "plenio" / "templates" / "host-test.md"
    ).exists()
