"""Which bar of the transcription every bar of the final score is (docs/design/score-arrange-design.md §4).

A cover's score starts as the transcription of the source; the user may then copy, move or delete
sections. The timeline keeps a print of every transcribed bar - its meter and the notes of each voice
relative to the bar - and the final score's bars are matched to them by content: a copied chorus finds
the chorus's bars again (and gets its words and its place in the recording), a moved verse takes its
words along, a deleted section is simply not found. A bar whose notes were edited keeps the place
after the bar before it.

The print is a plain string (``4/4:0.8.66,8.8.78``) so that the editor computes the same one from its
model (``frontend/src/sheet-editor/score/barMatch.ts``).
"""

from __future__ import annotations

from collections.abc import Sequence

from . import canonical

BarPrint = tuple[str, str]
"""The Vocal and the Ins content of a bar."""

_EVIDENCE = 2.0  # an equal voice with notes
_EMPTY = 0.5  # an equal empty voice (rests are everywhere: weak evidence)
LOOKAHEAD = 32
"""Bars compared ahead to tell equal passages apart (enough for any section; keeps long songs fast)."""


def _voice_print(meter: tuple[int, int], notes: Sequence[canonical.Note], start: int, end: int) -> str:
    parts = []
    for note in notes:
        if note.end <= start or note.onset >= end:
            continue
        begin = max(note.onset, start)
        parts.append(f"{begin - start}.{min(note.end, end) - begin}.{note.pitch}")
    return f"{meter[0]}/{meter[1]}:" + ",".join(parts)


def bar_prints(score: canonical.Score) -> tuple[BarPrint, ...]:
    """The print of every bar of ``score``."""
    result = []
    for index, meter in enumerate(score.meters):
        start, end = score.starts[index], score.starts[index] + score.lengths[index]
        result.append((_voice_print(meter, score.vocal, start, end), _voice_print(meter, score.ins, start, end)))
    return tuple(result)


def _score(a: BarPrint, b: BarPrint) -> float:
    total = 0.0
    for mine, theirs in zip(a, b, strict=True):
        if mine == theirs:
            total += _EMPTY if mine.endswith(":") else _EVIDENCE
    return total


def match_bars(final: Sequence[BarPrint], source: Sequence[BarPrint]) -> list[int | None]:
    """For every final bar the 0-based source bar it is, or ``None`` (past the end of the source).

    The best content match wins. Among equal ones (a chorus whose first bars equal the next chorus's)
    the one whose following bars go on matching longest - the passage that was really copied - then the
    one nearest to the bar after the previous match. Without any match a bar continues after the
    previous one.
    """
    scores = [[_score(bar, other) for other in source] for bar in final]
    best = [max(row, default=0.0) for row in scores]

    def run(i: int, j: int) -> int:
        length = 0
        while length < LOOKAHEAD and i + length < len(final) and j + length < len(source):
            if best[i + length] <= 0 or scores[i + length][j + length] != best[i + length]:
                break
            length += 1
        return length

    mapping: list[int | None] = []
    previous = -1
    for i in range(len(final)):
        follow = previous + 1
        if best[i] > 0:
            candidates = [j for j, value in enumerate(scores[i]) if value == best[i]]
            if follow in candidates and run(i, follow) >= max(run(i, j) for j in candidates):
                chosen: int | None = follow  # the music goes on
            else:
                chosen = min(candidates, key=lambda j: (-run(i, j), abs(j - follow), j))
        else:
            chosen = follow if follow < len(source) else None
        mapping.append(chosen)
        if chosen is not None:
            previous = chosen
    return mapping


def is_identity(mapping: Sequence[int | None], source_bars: int) -> bool:
    return len(mapping) == source_bars and all(j == i for i, j in enumerate(mapping))
