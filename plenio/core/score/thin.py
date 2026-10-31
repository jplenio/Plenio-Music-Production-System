"""Fewer of the source's notes for a cover (owner's request 2026-10-31): the melody, the instrument line and the
chords stay the source's - nothing new is added - but the least important notes are left out, so that YuE2 has
more room to interpret and the cover becomes more a song of its own.

The Cover Brief's *original notes* (0-100) sets how many stay: 100 every note, 0 about a quarter
(``kept_share``). Which ones stay is decided per section, by how much a note carries the music:

- where it falls in the bar (the downbeat most, then the middle of the bar, the beats, the half beats);
- how long it sounds (against the beat);
- whether it starts or ends a phrase, and whether it is a turning point of the line (a highest or lowest note).

A sung cover keeps every note of its melody (owner's decision 2026-10-31): each carries a syllable, and with the
melody thinned YuE2 left the words out - measured on one cover with the same seeds, 83 % of the written words were
heard at 100, 14 % at 50 and 18 % at 0 with the melody thinned, 78 % at 0 with it kept. So there only the instrument
line and the chords are thinned. An instrumental cover's melody is thinned too: it keeps its line - a note left out
lengthens the note before it, so the line still runs through the phrase with fewer pitches - and the first note of
every phrase stays. A note of the instrument line that is left out becomes a rest. A chord left out lets the one
before it sound on; every section keeps its first chord.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass, replace

from . import canonical
from .canonical import ChordSymbol, Note, Score

FULL = 100
"""*original notes* at which the score stays as transcribed."""
LEAST_SHARE = 0.25
"""The share of the notes that stays at 0."""


def kept_share(original_notes: int) -> float:
    """The share of the notes that stays: 1.0 at 100, 0.25 at 0, in a straight line between."""
    value = max(0, min(FULL, int(original_notes)))
    return LEAST_SHARE + (1.0 - LEAST_SHARE) * value / FULL


@dataclass(frozen=True)
class Thinned:
    abc: str
    changes: tuple[str, ...]


def thin(text: str, original_notes: int, *, keep_sung: bool = False) -> Thinned:
    """``text`` (a native two-voice ABC score) with fewer notes; unchanged at 100 or when it is not a score the
    model reads (the note says so). ``keep_sung``: a sung cover - its melody keeps every note (its words need them),
    only the instrument line and the chords are thinned."""
    if original_notes >= FULL:
        return Thinned(text, ())
    try:
        score = canonical.from_abc(text)
    except (canonical.ScoreSyntaxError, canonical.ScoreModelError):
        return Thinned(text, ("original notes: the score is not in the editable form - every note stays",))
    share = kept_share(original_notes)
    vocal = list(score.vocal) if keep_sung else _thin_notes(score, score.vocal, share, sustain=True)
    ins = _thin_notes(score, score.ins, share, sustain=False)
    chords = _thin_chords(score, share)
    result = replace(score, vocal=tuple(vocal), ins=tuple(ins), chords=tuple(chords))
    abc = canonical.to_abc(result)

    def counted(before: Sequence[object], after: Sequence[object]) -> str:
        return f"{len(after)} of {len(before)}"

    return Thinned(
        abc,
        (
            f"original notes {original_notes}: about {round(share * 100)} % of the source's notes kept - "
            f"melody {counted(score.vocal, vocal)} notes{' (sung: every note stays)' if keep_sung else ''}, "
            f"instrument line {counted(score.ins, ins)}, "
            f"chords {counted(score.chords, chords)}",
        ),
    )


# --- how much a note carries the music -------------------------------------------------------------------------


def _beats(score: Score, measure: int) -> tuple[int, int]:
    """The beats of a measure and the units of one (6/8, 9/8, 12/8: dotted quarters)."""
    n, d = score.meters[measure]
    length = score.lengths[measure]
    beats = n // 3 if d == 8 and n % 3 == 0 and n > 3 else n
    return beats, max(1, length // max(1, beats))


def _metric(score: Score, onset: int) -> int:
    measure = score.measure_at(onset)
    position = onset - score.starts[measure]
    beats, beat = _beats(score, measure)
    if position == 0:
        return 4
    if beats % 2 == 0 and position * 2 == score.lengths[measure]:
        return 3
    if position % beat == 0:
        return 2
    if beat >= 2 and position % (beat // 2) == 0:
        return 1
    return 0


def _sections(score: Score) -> list[tuple[int, int]]:
    """Every section's onset range (the whole score when it has none)."""
    firsts = [section.measure for section in score.sections if section.measure > 0]
    edges = [0, *(score.starts[m] for m in firsts), score.total]
    return [(a, b) for a, b in zip(edges, edges[1:], strict=False) if b > a]


def _phrases(score: Score, notes: Sequence[Note]) -> list[list[Note]]:
    """The notes grouped into phrases: a rest of a beat or more, or a section start, begins a new one."""
    section_starts = {a for a, _ in _sections(score)}
    phrases: list[list[Note]] = []
    for note in notes:
        if phrases:
            last = phrases[-1][-1]
            _, beat = _beats(score, score.measure_at(last.end - 1))
            starts_section = any(last.onset < start <= note.onset for start in section_starts)
            if note.onset - last.end < beat and not starts_section:
                phrases[-1].append(note)
                continue
        phrases.append([note])
    return phrases


def _importance(score: Score, phrase: Sequence[Note], index: int) -> float:
    note = phrase[index]
    _, beat = _beats(score, score.measure_at(note.onset))
    weight = 2.0 * _metric(score, note.onset)
    weight += max(-3.0, min(3.0, math.log2(note.duration / beat)))
    if index == 0:
        weight += 3.0
    if index == len(phrase) - 1:
        weight += 1.5
    if 0 < index < len(phrase) - 1:
        before, after = phrase[index - 1].pitch, phrase[index + 1].pitch
        if (note.pitch > before and note.pitch > after) or (note.pitch < before and note.pitch < after):
            weight += 1.0
    return weight


def _thin_notes(score: Score, notes: Sequence[Note], share: float, *, sustain: bool) -> list[Note]:
    """The notes that stay. ``sustain`` (the sung melody): every phrase keeps its first note, and a kept note sounds
    on until the next kept note of its phrase (or the phrase's last note ends)."""
    ordered = sorted(notes, key=lambda n: n.onset)
    if not ordered:
        return []
    phrases = _phrases(score, ordered)
    keep: set[int] = set()  # ids (onsets) of the kept notes
    for start, end in _sections(score):
        candidates: list[tuple[float, int, bool]] = []  # importance, onset, must stay
        for phrase in phrases:
            for index, note in enumerate(phrase):
                if start <= note.onset < end:
                    candidates.append((_importance(score, phrase, index), note.onset, sustain and index == 0))
        if not candidates:
            continue
        wanted = max(1, round(share * len(candidates)))
        chosen = {onset for _, onset, must in candidates if must}
        for _, onset, _must in sorted(candidates, key=lambda c: (-c[0], c[1])):
            if len(chosen) >= wanted:
                break
            chosen.add(onset)
        keep |= chosen
    out: list[Note] = []
    for phrase in phrases:
        kept = [note for note in phrase if note.onset in keep]
        if not sustain:
            out.extend(kept)
            continue
        for position, note in enumerate(kept):
            # sounds on over the notes left out after it, up to the next kept one (gaps inside the phrase stay)
            following = [n for n in phrase if note.onset < n.onset]
            stop = kept[position + 1].onset if position + 1 < len(kept) else None
            covered = [n for n in following if stop is None or n.onset < stop]
            end = max([note.end, *(n.end for n in covered)])
            out.append(replace(note, duration=end - note.onset))
    return out


def _thin_chords(score: Score, share: float) -> list[ChordSymbol]:
    """The chord symbols that stay: every section's first, then the ones on the strongest places that last longest."""
    chords = sorted(score.chords, key=lambda c: c.onset)
    if not chords:
        return []
    keep: set[int] = set()
    for start, end in _sections(score):
        inside = [(i, c) for i, c in enumerate(chords) if start <= c.onset < end]
        if not inside:
            continue
        wanted = max(1, round(share * len(inside)))
        chosen = {inside[0][1].onset}

        def weight(item: tuple[int, ChordSymbol]) -> tuple[float, int]:
            i, chord = item
            following = chords[i + 1].onset if i + 1 < len(chords) else score.total
            _, beat = _beats(score, score.measure_at(chord.onset))
            lasting = max(-3.0, min(3.0, math.log2(max(1, following - chord.onset) / beat)))
            return (-(2.0 * _metric(score, chord.onset) + lasting), chord.onset)

        for _, chord in sorted(inside, key=weight):
            if len(chosen) >= wanted:
                break
            chosen.add(chord.onset)
        keep |= chosen
    out: list[ChordSymbol] = []
    for chord in chords:
        # a chord kept after the same chord (the one between was left out) says nothing new
        if chord.onset in keep and not (out and out[-1].name == chord.name):
            out.append(chord)
    return out
