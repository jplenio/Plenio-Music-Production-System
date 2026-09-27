"""The YuE2 · DAW path (M2/D4): the skeleton from the brief, the user's score, exact conditioning.

Template 5 composes its own score: Score Tools builds an all-rest skeleton from the brief
(*new score from brief*), the run stops at Song Sheet · DAW for composing, and the renderer
receives exactly the text the user approved - both voices and the chord symbols, never a Guide
track.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host

# A hand-made score for the DAW path: an instrumental melody in Ins, chord symbols over a silent
# Vocal voice (the YuE2 instrumental convention), one section.
DRAWN = (
    "X:1\n"
    "T:\n"
    "M:4/4\n"
    "L:1/16\n"
    "Q:1/4=120\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
    "K:D\n"
    "% verse\n"
    "V: Vocal\n"
    '"D"z16|"G"z16|\n'
    "V: Ins\n"
    "D2F2A2F2D2F2A2F2|G2B2d2B2G2B2d2B2|"
)


def sheet_state(docs: dict[str, Any] | None = None, approved: str | None = None) -> str:
    state: dict[str, Any] = {"schema": "plenio.sheet_state/1", "docs": docs or {}}
    if approved:
        state["review"] = {"approved_fingerprint": approved}
    return json.dumps(state)


def daw_prompt(
    *,
    label: str,
    score_state: str = "",
    text_state: str = "",
    score_review: str = "as the brief says",
    take_seed: int = 1,
    length: str = "very short (about 1:00)",
) -> dict[str, Any]:
    return {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "mode": "one song, stop to review",
                "template": "none",
                "description": f"A synth exercise ({label})",
                "genre": "synth pop",
                "mood": "",
                "tempo": "120 BPM",
                "length": length,
                "vocals": "instrumental",
                "vocals.melody": "instrument plays the lead",
                "vocals.lead_instrument": "",
                "key": "D",
                "meter": "4/4",
            },
        },
        "2": {"class_type": "PlenioTestFakeEngine", "inputs": {}},
        "3": {
            "class_type": "PlenioComposePrompt",
            "inputs": {"brief": ["1", 0], "engine": ["2", 0], "detail": "standard"},
        },
        "4": {"class_type": "PlenioTestFakeLLM", "inputs": {"prompt": ["3", 0], "variant": "a"}},
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
                "review": "continue",
                "sheet_state": text_state,
            },
        },
        # the score input stays unconnected: 'new score from brief' builds the skeleton
        "7": {
            "class_type": "PlenioScoreTools",
            "inputs": {"brief": ["1", 0], "operation": "new score from brief"},
        },
        "8": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["7", 0],
                "context_style": ["6", 1],
                "context_lyrics": ["6", 2],
                "brief": ["1", 0],
                "engine": ["2", 0],
                "review": score_review,
                "sheet_state": score_state,
            },
        },
        "9": {
            "class_type": "PlenioTestFakeRender",
            "inputs": {
                "style": ["6", 1],
                "lyrics": ["6", 2],
                "abc": ["8", 3],
                "mode": ["8", 5],
                "max_duration": ["8", 6],
                "seed": take_seed,
            },
        },
        # an output node, so the renderer is part of the execution graph (it records what it got)
        "10": {
            "class_type": "PlenioTestAudioProbe",
            "inputs": {"audio": ["9", 0], "name": f"daw-{label}"},
        },
    }


def label() -> str:
    return uuid.uuid4().hex[:10]


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def sheet_payload(entry: dict[str, Any], node_id: str) -> dict[str, Any]:
    payload: dict[str, Any] = entry["outputs"][node_id]["plenio_sheet"][0]
    return payload


def test_the_brief_builds_the_skeleton_and_the_run_stops_at_the_daw_sheet(
    server: ComfyServer, log: Log
) -> None:
    """The first run of template 5: an empty score from the brief, waiting for the user, nothing rendered."""
    from plenio.core.score import canonical

    entry = server.run(daw_prompt(label=label()))
    payload = sheet_payload(entry, "8")
    skeleton = payload["docs"]["score"]["text"]
    score = canonical.from_abc(skeleton)
    assert (score.tempo, score.meters[0], score.key_at(0)) == (120, (4, 4), "D")
    assert len(score.meters) == 30  # 60 s of 4/4 at 120 BPM
    assert score.vocal == () and score.ins == () and score.chords == ()
    assert [s.label for s in score.sections] == ["verse"]
    assert payload["review"] == "stop for review" and payload["waiting"] is True
    # I12: the skeleton cannot be rendered - the findings say so, and the run is stopped, not failed
    findings = payload["findings"]
    assert any(f["severity"] == "error" and "only rests" in f["message"] for f in findings)
    assert events(log, "render") == []


def test_the_drawn_score_reaches_the_renderer_exactly(server: ComfyServer, log: Log) -> None:
    """The user's score is the conditioning: the renderer gets the approved text, byte for byte."""
    name = label()
    state = sheet_state({"score": {"state": "manual", "text": DRAWN}})
    entry = server.run(daw_prompt(label=name, score_review="continue", score_state=state, take_seed=3))
    payload = sheet_payload(entry, "8")
    assert payload["docs"]["score"]["text"] == DRAWN
    assert payload["docs"]["score"]["state"] == "manual"
    assert payload["planning_mode"] == "full"  # the chord symbols are in the score
    render = events(log, "render")[-1]
    assert render["abc"] == DRAWN  # WYSIWYG: not a normalised copy
    assert (render["mode"], render["seed"]) == ("full", 3)
    assert "V: Vocal" in render["abc"] and "V: Ins" in render["abc"]
    assert '"D"z16' in render["abc"]  # the chord symbols travel with the empty Vocal voice


def test_a_manual_score_survives_a_changed_brief(server: ComfyServer, log: Log) -> None:
    """A manual score is the user's: a longer brief must not replace it."""
    name = label()
    state = sheet_state({"score": {"state": "manual", "text": DRAWN}})
    entry = server.run(
        daw_prompt(label=name, score_review="continue", score_state=state, length="short (about 1:30)")
    )
    payload = sheet_payload(entry, "8")
    assert payload["docs"]["score"]["text"] == DRAWN
    assert payload["docs"]["score"]["state"] == "manual"
    assert events(log, "render")[-1]["abc"] == DRAWN


def test_an_approved_all_rest_score_is_refused(server: ComfyServer, log: Log) -> None:
    """Approving the skeleton does not make it renderable: the I12 error then stops the run."""
    name = label()
    first = server.run(daw_prompt(label=name))
    fingerprint = sheet_payload(first, "8")["fingerprint"]
    assert fingerprint
    error = server.run_expect_error(daw_prompt(label=name, score_state=sheet_state(approved=fingerprint)))
    assert error["node_type"] == "PlenioSongSheet"
    assert "only rests" in error["exception_message"] or "not valid" in error["exception_message"]
    assert len(events(log, "render")) == 0
