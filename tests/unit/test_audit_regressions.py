"""Regression tests for defects found in the Phase 9 audit (docs/audit/2026-09-25-phase-9-audit.md)."""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from types import SimpleNamespace

import pytest

from plenio.core.errors import PlenioValidationError
from plenio.core.files import atomic_write_text
from plenio.core.release import prompt_for_record, redact
from plenio.core.score import native, operations
from plenio.core.timefmt import clock
from plenio.core.vocals import Ending, VocalReading, judge

ROOT = Path(__file__).resolve().parents[2]


def long_score(factor: int) -> str:
    lines = (
        (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8").splitlines()
    )
    return "\n".join(lines[:8] + lines[8:] * factor)


def fastest(function: object, *args: object, runs: int = 3) -> float:
    best = float("inf")
    for _ in range(runs):
        started = time.perf_counter()
        function(*args)  # type: ignore[operator]
        best = min(best, time.perf_counter() - started)
    return best


def test_editor_view_grows_about_linearly_with_the_score() -> None:
    """AUD-05: the analysis counted notes per bar by scanning all notes, and ties by list.index,
    so every editor action on a long YuE2 plan took about a second (quadratic)."""
    short, long = long_score(10), long_score(40)  # 80 and 320 bars
    assert len(native.analyze(long).bars) == 4 * len(native.analyze(short).bars)
    ratio = fastest(operations.editor_view, long) / fastest(operations.editor_view, short)
    assert ratio < 9, f"4x the bars took {ratio:.1f}x the time (quadratic would be about 16x)"


def test_bar_counts_and_chords_are_unchanged_by_the_faster_analysis() -> None:
    analysis = native.analyze(long_score(3))
    assert sum(bar.vocal_notes for bar in analysis.bars) == analysis.voices["Vocal"]["notes"]
    assert sum(bar.ins_notes for bar in analysis.bars) == analysis.voices["Ins"]["notes"]
    assert sum(len(bar.chords) for bar in analysis.bars) == analysis.voices["Vocal"]["chords"]


def test_redaction_keeps_settings_whose_names_contain_token_or_auth() -> None:
    """AUD-07: 'max_abc_tokens' (a YuE2 setting) and an 'author' tag were written as <redacted>."""
    record = prompt_for_record(
        {"5": {"class_type": "YuE2GenerateABC", "inputs": {"max_abc_tokens": 8192, "seed": 3}}}
    )
    assert record["5"]["inputs"] == {"max_abc_tokens": 8192, "seed": 3}
    kept = redact({"author": "Jo", "max_tokens": "512", "tokenizer": "x"})
    assert kept == {"author": "Jo", "max_tokens": "512", "tokenizer": "x"}
    gone = redact(
        {"api_key": "k", "hf_token": "t", "Authorization": "Bearer x", "nested": [{"password": "p"}]}
    )
    assert gone == {
        "api_key": "<redacted>",
        "hf_token": "<redacted>",
        "Authorization": "<redacted>",
        "nested": [{"password": "<redacted>"}],
    }
    assert redact({"note": "hf_" + "a" * 30}) == {"note": "<redacted>"}  # token-like values anywhere


@pytest.mark.parametrize("value", [float("inf"), float("-inf"), float("nan")])
def test_score_operations_refuse_non_finite_numbers(value: float) -> None:
    """AUD-08: JSON accepts Infinity/NaN, and int() of them crashed the transform route (500)."""
    abc = long_score(1)
    with pytest.raises(PlenioValidationError, match="whole number"):
        operations.apply(abc, {"op": "transpose", "semitones": value})


def test_clock_rounds_to_whole_seconds() -> None:
    """AUD-09: 119.6 s was shown as '1:60'."""
    assert [clock(s) for s in (0, 59.4, 59.6, 119.6, 179.7, 3600)] == [
        "0:00",
        "0:59",
        "1:00",
        "2:00",
        "3:00",
        "60:00",
    ]


@pytest.mark.skipif(sys.platform == "win32", reason="POSIX file modes")
def test_atomic_writes_get_the_usual_file_mode(tmp_path: Path) -> None:
    """AUD-12: records and covers were written with mode 0600 (tempfile default)."""
    mask = os.umask(0o022)
    try:
        import importlib

        import plenio.core.files as files

        importlib.reload(files)
        files.atomic_write_text(tmp_path / "record.json", "{}")
    finally:
        os.umask(mask)
        importlib.reload(files)
    assert (tmp_path / "record.json").stat().st_mode & 0o777 == 0o644
    atomic_write_text(tmp_path / "again.json", "{}")  # the module still works after the reloads


def test_beat_extension_stops_on_a_zero_period() -> None:
    """AUD-13: repeated beat times gave a zero period and an endless loop."""
    from plenio.comfy.host import _beats

    class Beat(SimpleNamespace):
        def __init__(self, time: float, beat_id: int, declared_numerator: int, denominator: int):
            super().__init__(
                time=time, beat_id=beat_id, declared_numerator=declared_numerator, denominator=denominator
            )

    events = [
        {"time": 1.0, "values": {"rhythm": {"meter": (4, 4), "eighth_position": 2 * i}}} for i in range(4)
    ]
    beats = _beats(events, duration=30.0, ss=SimpleNamespace(BeatEvent=Beat))
    assert len(beats) == 4


def test_the_ending_note_does_not_promise_a_fade_out() -> None:
    """AUD-14: the note said 'fade it out when mastering', but Master has no fade-out."""
    result = judge([VocalReading.from_notes([], 30.0)], [30.0], [Ending(0.9, True)])
    assert result.notes and "no fade-out yet" in result.notes[0]
