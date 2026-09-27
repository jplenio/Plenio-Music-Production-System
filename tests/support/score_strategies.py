"""Hypothesis strategies for the canonical score engine: valid models and accepted texts.

Models cover random units, meters (changing at group starts), layouts, key changes (field
and inline, anywhere on the grid), sections, notes of any length crossing bar lines, and
chord symbols. Texts are the serializer's output with accepted-but-not-canonical variations
(spaces, explicit ``1`` durations, duplicated chord symbols, redundant ``M:`` fields, split
``Z`` runs) that ``to_abc(from_abc(text))`` must reproduce byte for byte.
"""

from __future__ import annotations

from fractions import Fraction

from hypothesis import strategies as st

from plenio.core.score import canonical as c
from plenio.third_party import yue2_abc_tools as upstream

METERS = ((4, 4), (3, 4), (2, 4), (6, 8), (5, 4), (7, 8), (12, 8), (2, 2), (3, 8), (1, 4), (9, 16))
KEYS = tuple(upstream.KEYS)
CHORDS = ("C", "Am", "F", "G7", "Dm7", "Bbmaj7", "F#m7b5", "Ebsus4", "C/E", "D7sus4", "Abm(maj7)", "E6")
LABELS = ("intro", "verse", "pre-chorus", "chorus", "bridge", "outro", "verse 2")


@st.composite
def scores(draw: st.DrawFn, *, max_groups: int = 5, max_notes: int = 24) -> c.Score:
    denominator = draw(st.sampled_from((8, 16, 32)))
    usable = [m for m in METERS if (m[0] * denominator) % m[1] == 0]
    layout = draw(st.lists(st.integers(1, 4), min_size=1, max_size=max_groups))
    meters: list[tuple[int, int]] = []
    meter = draw(st.sampled_from(usable))
    for index, count in enumerate(layout):
        if index and draw(st.booleans()) and draw(st.booleans()):
            meter = draw(st.sampled_from(usable))
        meters += [meter] * count
    score = c.Score(
        tempo=draw(st.integers(20, 300)),
        unit=Fraction(1, denominator),
        meters=tuple(meters),
        keys=(c.KeyChange(0, draw(st.sampled_from(KEYS)), "header"),),
        sections=(),
        layout=tuple(layout),
        vocal=(),
        ins=(),
        chords=(),
    )
    total = score.total
    group_onsets = [score.starts[g] for g in score.group_firsts]
    keys = {0: score.keys[0]}
    for _ in range(draw(st.integers(0, 3))):
        if draw(st.booleans()) and len(group_onsets) > 1:
            onset = draw(st.sampled_from(group_onsets[1:]))
            placement = "field"
        else:
            onset = draw(st.integers(1, total - 1)) if total > 1 else 0
            placement = "inline"
        if onset:
            keys[onset] = c.KeyChange(onset, draw(st.sampled_from(KEYS)), placement)
    sections = {}
    for first in draw(st.lists(st.sampled_from(score.group_firsts), max_size=4, unique=True)):
        sections[first] = c.Section(first, draw(st.sampled_from(LABELS)))
    tracks = []
    longest = max(score.lengths)
    for _voice in range(2):
        notes = []
        time = draw(st.integers(0, longest))
        for _ in range(draw(st.integers(0, max_notes))):
            if time >= total:
                break
            duration = draw(st.integers(1, min(total - time, 3 * longest)))
            pitch = draw(st.one_of(st.integers(48, 84), st.integers(0, 127)))
            notes.append(c.Note(time, duration, pitch))
            time += duration + draw(st.sampled_from((0, 0, 1, 2, 4, longest)))
        tracks.append(tuple(notes))
    chord_onsets = draw(st.lists(st.integers(0, total - 1), max_size=6, unique=True))
    chords = tuple(
        sorted((c.ChordSymbol(o, draw(st.sampled_from(CHORDS))) for o in chord_onsets), key=lambda x: x.onset)
    )
    return c.validate(
        c.Score(
            tempo=score.tempo,
            unit=score.unit,
            meters=score.meters,
            keys=tuple(keys[o] for o in sorted(keys)),
            sections=tuple(sections[m] for m in sorted(sections)),
            layout=score.layout,
            vocal=tracks[0],
            ins=tracks[1],
            chords=chords,
        )
    )


def _explicit_ones(bar: str) -> str:
    """Write every implicit length 1 as an explicit ``1`` (accepted, not native)."""
    out, cursor = [], 0
    while cursor < len(bar):
        match = upstream.TOKEN.match(bar, cursor)
        if match is None:
            out.append(bar[cursor])
            cursor += 1
            continue
        token = match.group(0)
        if match.group("note") is not None and not match.group("duration"):
            token = token[:-1] + "1-" if token.endswith("-") else token + "1"
        out.append(token)
        cursor = match.end()
    return "".join(out)


@st.composite
def texts(draw: st.DrawFn) -> str:
    """An accepted text with non-canonical but accepted variations."""
    lines = c.canonical_text(draw(scores())).rstrip("\n").split("\n")
    out = lines[:8]
    for line in lines[8:]:
        if line.endswith("|") and not line.startswith(("V:", "% ", "M:", "K:")):
            bars = line[:-1].split("|")
            new = []
            for bar in bars:
                if bar.startswith("Z") and len(bar) == 2 and draw(st.booleans()):
                    new.extend(["Z"] * int(bar[1]))  # split a run
                    continue
                if bar != "Z" and not bar.startswith("Z") and draw(st.booleans()):
                    bar = _explicit_ones(bar)
                if bar.startswith('"') and draw(st.booleans()):
                    bar = '"C"' + bar  # an earlier chord symbol at the same onset (accepted, not canonical)
                if draw(st.booleans()):
                    bar = " " * draw(st.integers(0, 2)) + bar + " " * draw(st.integers(0, 2))
                new.append(bar)
            line = "|".join(new) + "|"
        out.append(line)
    text = "\n".join(out) + draw(st.sampled_from(("\n", "")))
    upstream.parse_abc(text)
    return text
