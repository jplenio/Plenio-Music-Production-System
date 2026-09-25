"""Score Tools in a real ComfyUI server: every operation's widget values reach the core function.

The templates only use *prepare from brief*. Without these runs a wrong option name in the node's
DynamicCombo mapping would fall back to a default unnoticed (Phase 10 review: the adapter's other
operations had no host coverage).
"""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

import pytest

from harness import ComfyServer
from plenio.core import score as score_rules

pytestmark = pytest.mark.host

ROOT = Path(__file__).resolve().parents[2]
LINES = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8").splitlines()
SONG = "\n".join(LINES)
LONG_SONG = "\n".join(LINES[:8] + LINES[8:] * 6)  # 48 bars, about 131 s
TAKE = json.loads((ROOT / "tests" / "fixtures" / "cover" / "yue2-take-y2.json").read_text(encoding="utf-8"))[
    "abc"
]

Case = tuple[str, dict[str, Any], Callable[[], score_rules.Change]]
CASES: list[Case] = [
    (SONG, {"operation": "strip chords"}, lambda: score_rules.strip_chords(SONG)),
    (
        LONG_SONG,
        {"operation": "fit length", "operation.seconds": 60.0},
        lambda: score_rules.fit_length(LONG_SONG, 60.0),
    ),
    (
        TAKE,
        {"operation": "voices", "operation.vocal": "silence Vocal", "operation.conflict": "replace Ins"},
        lambda: score_rules.silence_voice(TAKE, "Vocal"),
    ),
    (
        TAKE,
        {
            "operation": "voices",
            "operation.vocal": "move Vocal melody to Ins",
            "operation.conflict": "keep Ins",
        },
        lambda: score_rules.move_vocal_to_ins(TAKE, conflict="keep_ins"),
    ),
    (
        TAKE,
        {
            "operation": "voices",
            "operation.vocal": "move Vocal melody to Ins",
            "operation.conflict": "replace Ins",
        },
        lambda: score_rules.move_vocal_to_ins(TAKE, conflict="replace"),
    ),
    (SONG, {"operation": "transpose", "operation.semitones": -3}, lambda: score_rules.transpose(SONG, -3)),
    (SONG, {"operation": "tempo", "operation.bpm": 132}, lambda: score_rules.set_tempo(SONG, 132)),
]


@pytest.mark.parametrize(
    ("score", "operation", "expected"),
    CASES,
    ids=[
        "strip-chords",
        "fit-length",
        "silence-vocal",
        "move-keep-ins",
        "move-replace-ins",
        "transpose",
        "tempo",
    ],
)
def test_every_operation_reaches_the_core_function(
    server: ComfyServer, score: str, operation: dict[str, Any], expected: Callable[[], score_rules.Change]
) -> None:
    want = expected()
    assert want.abc != score, "the case must change the score"
    prompt = {
        "1": {"class_type": "PlenioTestSource", "inputs": {"name": "score", "value": score}},
        "2": {"class_type": "PlenioScoreTools", "inputs": {"score": ["1", 0], **operation}},
        "3": {"class_type": "PlenioTestSink", "inputs": {"value": ["2", 0], "label": "score tools"}},
    }
    entry = server.run(prompt)
    assert entry["outputs"]["3"]["received"] == [want.abc]
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert summary.startswith(f"**{operation['operation']}**")
    assert all(change in summary for change in want.changes)


def test_the_two_conflict_policies_give_different_scores() -> None:
    """Guards the fixture choice above: otherwise the conflict mapping would not be tested."""
    keep = score_rules.move_vocal_to_ins(TAKE, conflict="keep_ins").abc
    assert keep != score_rules.move_vocal_to_ins(TAKE, conflict="replace").abc
