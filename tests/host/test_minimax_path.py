"""The MiniMax Song path in a real ComfyUI server with model fakes (V2).

Graph (as in the template): Song Brief -> Compose -> fake LLM -> Parse -> Song Sheet -> fake MiniMax
render -> Export Release. The fake engine is a MiniMax descriptor with a character-count tokenizer, so
the Song Sheet's exact budget check runs as with the real text encoder.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host


def sheet_state(docs: dict[str, Any] | None = None, approved: str | None = None) -> str:
    state: dict[str, Any] = {"schema": "plenio.sheet_state/1", "docs": docs or {}}
    if approved:
        state["review"] = {"approved_fingerprint": approved}
    return json.dumps(state)


def minimax_prompt(
    *, label: str, state: str = "", review: str = "continue", take_seed: int = 1, vocals: str = "sung"
) -> dict[str, Any]:
    vocals_inputs = (
        {"vocals.language": "English", "vocals.voice": "", "vocals.theme": ""}
        if vocals == "sung"
        else {"vocals.melody": "instrument plays the lead", "vocals.lead_instrument": "piano"}
    )
    return {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "template": "none",
                "description": f"A song about rain ({label})",
                "genre": "dream pop",
                "mood": "",
                "tempo": "92 BPM",
                "length": "short (about 1:30)",
                "vocals": vocals,
                **vocals_inputs,
                "key": "",
                "meter": "",
            },
        },
        "2": {"class_type": "PlenioTestFakeEngine", "inputs": {"engine": "minimax_music3"}},
        "3": {
            "class_type": "PlenioComposePrompt",
            "inputs": {"brief": ["1", 0], "engine": ["2", 0], "detail": "standard"},
        },
        "4": {"class_type": "PlenioTestFakeLLM", "inputs": {"prompt": ["3", 0], "variant": "minimax"}},
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
                "review": review,
                "sheet_state": state,
            },
        },
        "7": {
            "class_type": "PlenioTestFakeMiniMaxRender",
            "inputs": {"caption": ["6", 1], "lyrics": ["6", 2], "max_duration": ["6", 6], "seed": take_seed},
        },
        "8": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["7", 0],
                "title": ["6", 0],
                "folder": f"plenio-minimax-test/{label}",
                "naming": "{title}",
                "collision": "number",
                "reports.report_0": ["6", 7],
            },
        },
    }


def label() -> str:
    return uuid.uuid4().hex[:10]


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def sheet_payload(entry: dict[str, Any], node_id: str = "6") -> dict[str, Any]:
    payload: dict[str, Any] = entry["outputs"][node_id]["plenio_sheet"][0]
    return payload


def test_brief_to_flac_with_exact_conditioning(server: ComfyServer, log: Log) -> None:
    name = label()
    entry = server.run(minimax_prompt(label=name))
    render = events(log, "minimax_render")[-1]
    payload = sheet_payload(entry)
    assert render["caption"] == payload["docs"]["style"]["text"]
    assert render["lyrics"] == payload["docs"]["lyrics"]["text"]
    assert render["caption"].splitlines()[0] == "Global Metadata"  # the structured caption keeps its lines
    assert render["max_duration"] == pytest.approx(payload["score_seconds"]) == pytest.approx(90 * 1.15 + 10)
    assert payload["validation"]["budget"]["exact"] is True
    assert payload["validation"]["budget"]["prompt_tokens"] == 12 + len(render["caption"]) + len(
        render["lyrics"]
    )
    folder = server.output_dir / "plenio-minimax-test" / name
    record = json.loads((folder / "Neon Rain.plenio.json").read_text(encoding="utf-8"))
    assert (folder / "Neon Rain.flac").stat().st_size > 1000
    assert record["documents"]["style"]["text"] == render["caption"]
    assert any("MiniMax-Music3 Community License" in licence for licence in record["licences"])


def test_prompt_over_the_budget_stops_at_the_sheet(server: ComfyServer, log: Log) -> None:
    long_lyrics = "[Verse]\n" + "\n".join(f"We run through neon rain, line {i}" for i in range(200))
    state = sheet_state({"lyrics": {"state": "manual", "text": long_lyrics}})
    error = server.run_expect_error(minimax_prompt(label=label(), state=state))
    assert error["node_type"] == "PlenioSongSheet"
    assert events(log, "minimax_render") == []
    details = json.dumps(error)
    assert "5000" in details and "Shorten" in details


def test_new_take_reuses_the_documents(server: ComfyServer, log: Log) -> None:
    name = label()
    server.run(minimax_prompt(label=name, take_seed=1))
    log.clear()
    server.run(minimax_prompt(label=name, take_seed=2))
    assert events(log, "llm") == []
    assert [e["seed"] for e in events(log, "minimax_render")] == [2]


def test_instrumental_is_a_tags_only_map_with_vocal_details_na(server: ComfyServer, log: Log) -> None:
    entry = server.run(minimax_prompt(label=label(), vocals="instrumental"))
    render = events(log, "minimax_render")[-1]
    tags = [line for line in render["lyrics"].splitlines() if line.strip()]
    assert all(line.startswith("[") for line in tags) and len(tags) >= 10
    assert tags[0] == "[Intro]" and tags[-1] == "[Outro]"
    assert "Vocal Details\nn/a" in render["caption"]
    enforcements = json.dumps(entry["outputs"].get("5", {}))
    assert "n/a" in enforcements or "n/a" in render["caption"]


def test_review_gate_blocks_and_releases(server: ComfyServer, log: Log) -> None:
    name = label()
    waiting = server.run(minimax_prompt(label=name, review="stop for review"))
    payload = sheet_payload(waiting)
    assert payload["waiting"] and payload["fingerprint"]
    assert events(log, "minimax_render") == []
    server.run(
        minimax_prompt(
            label=name, review="stop for review", state=sheet_state(approved=payload["fingerprint"])
        )
    )
    assert len(events(log, "minimax_render")) == 1


def test_sheet_resolve_route_uses_the_minimax_rules(server: ComfyServer, log: Log) -> None:
    entry = server.run(minimax_prompt(label=label()))
    payload = sheet_payload(entry)
    status, route = server.request(
        "POST",
        "/plenio/sheet/resolve",
        {
            "sheet_state": "",
            "upstream": {k: v["upstream"] for k, v in payload["docs"].items()},
            "owned": payload["owned"],
            "engine": "minimax_music3",
            "instrumental": False,
            "review": "continue",
        },
    )
    assert status == 200 and route["fingerprint"] == payload["fingerprint"]
    assert route["validation"]["budget"]["exact"] is False  # the route has no loaded tokenizer: an estimate
