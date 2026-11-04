"""Which bar of the transcription every bar of the final score is (docs/design/score-arrange-design.md §4).

A cover's score starts as the transcription of the source; the user may then copy, move or delete
sections. The editor keeps which source bar every bar is while it edits (``plenio_bar_sources``,
``frontend/src/sheet-editor/score/barSources.ts``): this module is the fallback for a score that comes without
that - one Arrange or a template changed, one saved before 1.5.1, an edit outside the editor.

The timeline keeps a print of every transcribed bar - its meter and the notes of each voice relative to the bar -
and the final score's bars are matched to them by content: a copied chorus finds the chorus's bars again (and gets
its words and its place in the recording), a moved verse takes its words along, a deleted section is simply not
found. The match is one path through the source (``match_bars``): going on bar by bar costs nothing, a jump costs
more than a bar of evidence is worth. So a bar whose notes were edited - moved to the other voice, silenced,
another pitch - keeps its place after the bar before it, and only a run of bars that really stands elsewhere makes
the path jump (GitHub issue 2026-11: every edited bar looked for its best match alone, an equal empty voice counted,
and one bar moved to the Ins sent it and the bars after it to another passage of the recording).

The print is a plain string (``4/4:0.8.66,8.8.78``) so that the editor computes the same one from its
model (``frontend/src/sheet-editor/score/barMatch.ts``, the same rule).
"""

from __future__ import annotations

from collections.abc import Sequence

from . import canonical

BarPrint = tuple[str, str]
"""The Vocal and the Ins content of a bar."""

_EVIDENCE = 2.0
"""An equal voice with notes."""
_EMPTY = 0.01
"""An equal empty voice: rests are everywhere - it only breaks a tie, it never decides a jump."""
_JUMP = 2.5
"""Leaving the bar after the previous one: more than one voice of one bar is worth, so one bar that happens to
equal another one stays where it is, and less than what a copied bar and its way back bring."""


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
        result.append(
            (_voice_print(meter, score.vocal, start, end), _voice_print(meter, score.ins, start, end))
        )
    return tuple(result)


def _score(a: BarPrint, b: BarPrint) -> float:
    total = 0.0
    for mine, theirs in zip(a, b, strict=True):
        if mine == theirs:
            total += _EMPTY if mine.endswith(":") else _EVIDENCE
    return total


def match_bars(final: Sequence[BarPrint], source: Sequence[BarPrint]) -> list[int | None]:
    """For every final bar the 0-based source bar it is, or ``None`` (no bar of the source: past its end).

    The best path through the source: each bar earns what it has in common with the source bar it is given, going
    on to the next source bar is free, any other step costs ``_JUMP``. Among equal paths the one that jumps least.
    """
    count = len(source)
    if not final:
        return []
    if not count:
        return [None] * len(final)
    past = count  # the state "no source bar"
    # the first bar comes as if after a bar before the source's first
    value = [
        (_score(final[0], source[j]) if j else _score(final[0], source[0]) + _JUMP) for j in range(count)
    ]
    value.append(0.0)
    back: list[list[int]] = []
    for i in range(1, len(final)):
        top = max(range(count + 1), key=lambda state: (value[state], -state))
        jump = value[top] - _JUMP
        step = [0] * (count + 1)
        now = [0.0] * (count + 1)
        for j in range(count):
            if j > 0 and value[j - 1] >= jump:
                now[j], step[j] = value[j - 1], j - 1
            else:
                now[j], step[j] = jump, top
            now[j] += _score(final[i], source[j])
        # past the source's end: after its last bar, or on from there
        from_end = max(
            (value[count - 1], count - 1), (value[past], past), key=lambda pair: (pair[0], -pair[1])
        )
        now[past], step[past] = from_end if from_end[0] >= jump else (jump, top)
        value = now
        back.append(step)
    state = max(range(count + 1), key=lambda s: (value[s], -s))
    states = [state]
    for step in reversed(back):
        state = step[state]
        states.append(state)
    states.reverse()
    return [None if s == past else s for s in states]


def has_evidence(bar: BarPrint, source: BarPrint) -> bool:
    """Whether the mapping of a bar rests on its content (notes they share, or the same rests) - else on its
    place after the bar before it."""
    return _score(bar, source) >= _EVIDENCE or bar == source


def is_identity(mapping: Sequence[int | None], source_bars: int) -> bool:
    return len(mapping) == source_bars and all(j == i for i, j in enumerate(mapping))
