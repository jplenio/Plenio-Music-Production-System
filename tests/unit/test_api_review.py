"""Review stops of the Song API v2 (phase 5.3)."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from plenio.core.api import review

ROOT = Path(__file__).resolve().parents[2]
PROMPT = json.loads(
    (ROOT / "tests" / "fixtures" / "song_api" / "yue2-song.shipped.json").read_text(encoding="utf-8")
)["prompt"]


def test_the_song_templates_sheets_are_text_and_score() -> None:
    assert sorted(review.stages(PROMPT).values()) == ["score", "text"]
    assert review.stage_of("Song Sheet · Text") == "text" and review.stage_of("Song Sheet · DAW") == "daw"


def test_stops_where_wanted_and_not_approved() -> None:
    prompt = copy.deepcopy(PROMPT)
    assert sorted(review.set_stops(prompt, ["text", "score"], [])) == ["score", "text"]
    by_stage = {stage: prompt[node]["inputs"]["review"] for node, stage in review.stages(prompt).items()}
    assert by_stage == {"text": review.STOP, "score": review.STOP}
    assert review.set_stops(prompt, ["text", "score"], ["text"]) == ["score"]
    by_stage = {stage: prompt[node]["inputs"]["review"] for node, stage in review.stages(prompt).items()}
    assert by_stage == {"text": review.GO_ON, "score": review.STOP}
    assert review.unknown_stages(PROMPT, ["text", "lyrics"]) == ["lyrics"]


def test_a_finished_run_tells_where_it_waits() -> None:
    text_node = next(node for node, stage in review.stages(PROMPT).items() if stage == "text")
    history = {
        "prompt": [0, "p", PROMPT, {}],
        "outputs": {
            text_node: {
                "plenio_sheet": [
                    {
                        "waiting": True,
                        "owned": ["title", "lyrics"],
                        "docs": {"title": {"text": "Paper Boats"}, "lyrics": {"text": "[verse]\nline"}},
                        "fingerprint": "f" * 64,
                    }
                ]
            }
        },
    }
    found = review.waiting(history)
    assert found == {
        "stage": "text",
        "node": text_node,
        "documents": {"title": "Paper Boats", "lyrics": "[verse]\nline"},
        "fingerprint": "f" * 64,
    }
    history["outputs"][text_node]["plenio_sheet"][0]["waiting"] = False
    assert review.waiting(history) is None


def test_an_approval_passes_on_only_what_it_changed() -> None:
    shown = {"title": "Paper Boats", "lyrics": "a"}
    assert review.edited(shown, {"title": "Paper Boats", "lyrics": "b"}) == {"lyrics": "b"}
    assert review.edited(shown, None) == {}
    with pytest.raises(ValueError):
        review.edited(shown, {"lyrics": 3})
