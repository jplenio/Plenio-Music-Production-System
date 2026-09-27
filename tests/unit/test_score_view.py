"""View contract v2 (next-release plan §9.9) and the transform route's dispatch of canonical operations.

Every view is derived from exactly one text; the canonical model view uses integer units and
maps each sounding note to the element ids of its written segments, so the staff, the ABC text
and the piano roll select the same note.
"""

from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path

import pytest

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical, operations
from plenio.third_party import yue2_abc_tools as upstream

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
TEXT = json.loads((FIXTURES / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))["abc"]


def test_the_model_view_matches_the_element_view() -> None:
    view = operations.editor_view(TEXT)
    model = view["model"]
    assert model["version"] == 2 and model["unit"] == "1/16" and model["tempo"] == 83
    elements = {e["id"]: e for e in view["elements"]}
    score = canonical.from_abc(TEXT)
    quarter = score.unit * 4
    for voice, key in (("Vocal", "vocal"), ("Ins", "ins")):
        notes = model["tracks"][key]
        assert [n["id"] for n in notes] == [f"{key}:{n.onset}" for n in score.track(key)]
        for note in notes:
            segments = [elements[s] for s in note["segments"]]
            assert segments and all(s["voice"] == voice and s["kind"] == "note" for s in segments)
            assert Fraction(segments[0]["onset_q"]).limit_denominator(1024) == note["onset"] * quarter
            assert sum(s["units"] for s in segments) == note["duration"]
            assert all(s["midi"] == note["pitch"] for s in segments)
    assert [m["n"] for m in model["measures"]] == list(range(1, score.measure_count + 1))
    assert sum(model["groups"]) == score.measure_count
    assert model["measures"][-1]["onset"] + model["measures"][-1]["length"] == model["total"]
    chords = model["tracks"]["chords"]
    assert [c["id"] for c in chords] == [f"chord:{c.onset}" for c in score.chords]
    labels = [s["label"] for s in model["sections"]]
    assert labels[:3] == ["intro", "verse", "chorus"]


def test_a_score_outside_the_subset_is_valid_but_has_no_model() -> None:
    text = (
        "X:1\nT:\nM:3/32\nL:1/16\nQ:1/4=90\n"
        'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
        'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
        "K:C\nV: Vocal\nZ|\nV: Ins\nZ|\n"
    )
    upstream.parse_abc(text)
    view = operations.editor_view(text)
    assert view["ok"] is True and view["model"] is None
    assert "whole number" in view["model_error"]["diagnostics"][0]["message"]


def test_an_invalid_text_has_diagnostics_and_no_views() -> None:
    view = operations.editor_view(TEXT.replace("|", "", 1))
    assert view["ok"] is False and "model" not in view and "elements" not in view
    assert view["diagnostics"][0]["line"]


def test_apply_runs_canonical_operations_through_the_text() -> None:
    score = canonical.from_abc(TEXT)
    note = score.vocal[5]
    result = operations.apply(TEXT, {"op": "delete", "ids": [f"vocal:{note.onset}"]})
    assert result.changes[0].endswith("-> rest")
    assert note not in canonical.from_abc(result.abc).vocal
    # the Phase 5 operations keep their names and element ids
    phase5 = operations.apply(TEXT, {"op": "note_to_rest", "ids": ["V13.1"]})
    assert phase5.abc != TEXT
    with pytest.raises(PlenioValidationError, match="Unknown score operation"):
        operations.apply(TEXT, {"op": "explode"})


def test_the_view_is_json_serialisable() -> None:
    json.dumps(operations.editor_view(TEXT), allow_nan=False)
