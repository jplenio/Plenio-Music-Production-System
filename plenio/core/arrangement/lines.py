"""The instrument line of a section, written note by note from its chords (the plan's *lead* roles).

Every generator returns notes ``(onset, duration, pitch)`` in the score's ``L`` units that lie inside the
section; ``apply`` puts them into the Ins voice with the score operations, which validate the result.
The lines are deterministic: the same chords, energy and seed give the same notes.
"""

from __future__ import annotations

import random
from collections.abc import Sequence
from dataclasses import dataclass
from fractions import Fraction

from ..score import canonical as c
from ..score.model import CHORD_INTERVALS
from ..score.native import _key_tonic

LineNote = tuple[int, int, int]
"""``(onset, duration, pitch)`` in L units and MIDI."""
_NATURAL = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
MAJOR = (0, 2, 4, 5, 7, 9, 11)
MINOR = (0, 2, 3, 5, 7, 8, 10)
PENTATONIC_MAJOR = (0, 2, 4, 7, 9)
PENTATONIC_MINOR = (0, 3, 5, 7, 10)
RIFFS_4 = (
    (1, 0, 0, 1, 0, 0, 1, 0),
    (1, 0, 1, 0, 0, 1, 1, 0),
    (1, 1, 0, 1, 0, 1, 0, 0),
    (1, 0, 0, 1, 1, 0, 1, 0),
)
"""One-bar rhythms on eighths (4/4); other meters stretch or cut them."""
REGISTER = {
    "pad": (55, 69),
    "arpeggio": (57, 79),
    "riff": (45, 64),
    "countermelody": (55, 76),
    "solo": (64, 86),
    "motif": (55, 79),
}


def chord_root(name: str) -> int:
    letter, rest = name[0], name[1:]
    shift = 0
    while rest[:1] in ("#", "b"):
        shift += 1 if rest[0] == "#" else -1
        rest = rest[1:]
    return (_NATURAL[letter] + shift) % 12


def chord_classes(name: str) -> tuple[int, ...]:
    """Pitch classes of a chord symbol (root first; a slash bass added)."""
    main, _, bass = name.partition("/")
    root = chord_root(main)
    quality = main[1:].lstrip("#b")
    classes = [(root + i) % 12 for i in CHORD_INTERVALS.get(quality, (0, 4, 7))]
    if bass:
        bass_class = chord_root(bass)
        if bass_class not in classes:
            classes.append(bass_class)
    return tuple(classes)


def scale(key: str) -> tuple[int, ...]:
    """Pitch classes of the key's major or natural minor scale."""
    tonic, minor = _key_tonic(key)
    return tuple((tonic + step) % 12 for step in (MINOR if minor else MAJOR))


def in_register(classes: Sequence[int], low: int, high: int) -> list[int]:
    return [p for p in range(low, high + 1) if p % 12 in classes]


def nearest(target: int, candidates: Sequence[int]) -> int:
    return min(candidates, key=lambda p: (abs(p - target), p))


@dataclass(frozen=True)
class Bar:
    """One bar of the section as the generators need it."""

    start: int
    length: int
    meter: tuple[int, int]
    chord: str | None
    key: str


def bars_of(score: c.Score, first: int, end: int, chord_at: Sequence[str | None]) -> list[Bar]:
    return [
        Bar(score.starts[m], score.lengths[m], score.meters[m], chord_at[i], score.key_at(score.starts[m]))
        for i, m in enumerate(range(first, end))
    ]


def step_units(score: c.Score, energy: int) -> int:
    """The rhythmic grid of a line for its energy: half notes (1) to sixteenths (5), as far as ``L`` allows."""
    quarter = max(1, score.units_per_quarter)
    wanted = {1: Fraction(2), 2: Fraction(1), 3: Fraction(1, 2), 4: Fraction(1, 2), 5: Fraction(1, 4)}[energy]
    units = quarter * wanted
    while units.denominator != 1 and units < quarter * 2:
        units *= 2
    return max(1, int(units))


def _chord_classes_or_key(bar: Bar) -> tuple[int, ...]:
    if bar.chord:
        return chord_classes(bar.chord)
    tonic, minor = _key_tonic(bar.key)
    return tuple((tonic + i) % 12 for i in ((0, 3, 7) if minor else (0, 4, 7)))


def pad(bars: Sequence[Bar], energy: int, rng: random.Random) -> list[LineNote]:
    notes: list[LineNote] = []
    low, high = REGISTER["pad"]
    previous = (low + high) // 2
    for bar in bars:
        classes = _chord_classes_or_key(bar)
        pool = in_register(classes, low, high)
        if not pool:
            continue
        third = [p for p in pool if p % 12 == classes[min(1, len(classes) - 1)]]
        first = nearest(previous, third or pool)
        if energy <= 2 or bar.length < 2:
            notes.append((bar.start, bar.length, first))
            previous = first
            continue
        half = bar.length // 2
        root = nearest(first, [p for p in pool if p % 12 == classes[0]] or pool)
        notes += [(bar.start, half, root), (bar.start + half, bar.length - half, first)]
        previous = first
    return notes


def arpeggio(bars: Sequence[Bar], energy: int, rng: random.Random, step: int) -> list[LineNote]:
    """Broken chords over four chord tones near the previous bar (small steps, no jumps across the
    register); up and down from energy 3."""
    notes: list[LineNote] = []
    low, high = REGISTER["arpeggio"]
    previous = (low + high) // 2 - 4
    for bar in bars:
        pool = in_register(_chord_classes_or_key(bar), low, high)
        if len(pool) < 2:
            continue
        start = pool.index(nearest(previous, pool))
        start = max(0, min(start, len(pool) - 4))
        span = pool[start : start + 4]
        order = span + span[-2:0:-1] if energy >= 3 and len(span) > 2 else span
        position = 0
        while position < bar.length:
            length = min(step, bar.length - position)
            notes.append((bar.start + position, length, order[(position // step) % len(order)]))
            position += length
        previous = span[0]
    return notes


def riff(bars: Sequence[Bar], energy: int, rng: random.Random, quarter: int) -> list[LineNote]:
    """A one-bar rhythm on eighths with a root-fifth-octave figure, moved onto every chord; calm sections
    (energy 1-2) play every other hit."""
    notes: list[LineNote] = []
    low, high = REGISTER["riff"]
    pattern = list(rng.choice(RIFFS_4))
    if energy <= 2:
        pattern = [on if i % 2 == 0 else 0 for i, on in enumerate(pattern)]
    figure = rng.choice(((0, 0, 7, 12), (0, 7, 0, 10), (0, 12, 7, 0), (0, 3, 5, 7)))
    eighth = max(1, quarter // 2)
    for bar in bars:
        classes = _chord_classes_or_key(bar)
        roots = [p for p in range(low, high + 1) if p % 12 == classes[0]]
        if not roots:
            continue
        root = roots[0]
        hits = [i * eighth for i, on in enumerate(pattern) if on and i * eighth < bar.length]
        for count, onset in enumerate(hits):
            following = hits[count + 1] if count + 1 < len(hits) else bar.length
            pitch = root + figure[count % len(figure)]
            if pitch > high:
                pitch -= 12
            notes.append((bar.start + onset, max(1, min(following - onset, eighth * 2)), pitch))
    return notes


def _vocal_pitch_at(vocal: Sequence[c.Note], onset: int) -> int | None:
    for note in vocal:
        if note.onset <= onset < note.end:
            return note.pitch
        if note.onset > onset:
            break
    return None


def countermelody(
    bars: Sequence[Bar], energy: int, rng: random.Random, step: int, vocal: Sequence[c.Note]
) -> list[LineNote]:
    """A second line that moves against the sung melody: long notes while the voice sings, motion in its rests."""
    notes: list[LineNote] = []
    sung = [n.pitch for n in vocal]
    centre = sum(sung) / len(sung) if sung else 67
    low, high = (52, 67) if centre >= 66 else (64, 79)
    quarter_ish = {1: 4, 2: 4, 3: 2, 4: 2, 5: 1}[energy]  # in steps of the energy-3 grid (eighths)
    beat = max(1, step * quarter_ish // 2) if energy <= 2 else max(1, step * quarter_ish)
    previous: int | None = None
    previous_sung: int | None = None
    for bar in bars:
        classes = _chord_classes_or_key(bar)
        chord_pool = in_register(classes, low, high)
        key_pool = in_register(scale(bar.key), low, high)
        if not chord_pool:
            continue
        position = 0
        while position < bar.length:
            length = min(beat, bar.length - position)
            onset = bar.start + position
            sung_now = _vocal_pitch_at(vocal, onset)
            strong = position == 0 or position * 2 == bar.length
            pool = chord_pool if strong or sung_now is not None else key_pool or chord_pool
            if previous is None:
                pitch = nearest((low + high) // 2, pool)
            elif sung_now is not None and previous_sung is not None and sung_now != previous_sung:
                direction = -1 if sung_now > previous_sung else 1
                moved = [p for p in pool if (p - previous) * direction > 0]
                pitch = nearest(previous + 2 * direction, moved) if moved else nearest(previous, pool)
            else:
                pitch = nearest(previous + rng.choice((-2, -1, 1, 2)), pool)
            notes.append((onset, length, pitch))
            previous, previous_sung = pitch, sung_now if sung_now is not None else previous_sung
            position += length
    return notes


SOLO_RHYTHMS = {
    2: ((2, 2, 4), (4, 2, 2), (2, 2, 2, 2)),
    3: ((1, 1, 2, 2, 2), (2, 1, 1, 2, 2), (1, 1, 1, 1, 2, 2)),
    4: ((1, 1, 1, 1, 2, 2), (1, 1, 2, 1, 1, 2), (1, 1, 1, 1, 1, 1, 2)),
}
"""Solo rhythms in eighth notes per 4/4 bar (sum 8), by energy (1-2, 3, 4-5)."""


def solo(bars: Sequence[Bar], energy: int, rng: random.Random, quarter: int) -> list[LineNote]:
    """Two-bar phrases on the key's pentatonic scale: chord tones on the strong beats, a held chord tone
    at the end of every phrase; busier with more energy."""
    notes: list[LineNote] = []
    if not bars:
        return notes
    low, high = REGISTER["solo"]
    eighth = max(1, quarter // 2)
    level = 2 if energy <= 2 else 3 if energy == 3 else 4
    previous = (low + high) // 2
    for index, bar in enumerate(bars):
        tonic, minor = _key_tonic(bar.key)
        penta = tuple((tonic + i) % 12 for i in (PENTATONIC_MINOR if minor else PENTATONIC_MAJOR))
        key_pool = in_register(penta, low, high)
        chord_pool = in_register(_chord_classes_or_key(bar), low, high)
        if not key_pool or not chord_pool:
            continue
        rhythm = rng.choice(SOLO_RHYTHMS[level])
        last_bar_of_phrase = index % 2 == 1 or index == len(bars) - 1
        position = 0
        for count, eighths in enumerate(rhythm):
            if position >= bar.length:
                break
            length = min(eighths * eighth, bar.length - position)
            if count == len(rhythm) - 1:
                length = bar.length - position
            strong = position == 0 or position * 2 == bar.length
            if last_bar_of_phrase and count == len(rhythm) - 1:
                pitch = nearest(previous, chord_pool)
            elif strong:
                pitch = nearest(previous + rng.choice((-3, -2, 2, 3)), chord_pool)
            else:
                pitch = nearest(previous + rng.choice((-2, -1, 1, 2, 4)), key_pool)
            notes.append((bar.start + position, length, pitch))
            previous = pitch
            position += length
    return notes


def octave(bars: Sequence[Bar], vocal: Sequence[c.Note]) -> list[LineNote]:
    """The sung melody an octave lower (or higher where lower would leave the range)."""
    if not bars:
        return []
    start, end = bars[0].start, bars[-1].start + bars[-1].length
    notes: list[LineNote] = []
    for note in vocal:
        if note.onset < start or note.onset >= end:
            continue
        length = min(note.duration, end - note.onset)
        pitch = note.pitch - 12 if note.pitch - 12 >= 48 else note.pitch + 12
        if 36 <= pitch <= 96:
            notes.append((note.onset, length, pitch))
    return notes


def _strong(bar: Bar, onset: int) -> bool:
    """A strong beat: the bar's first beat, and its middle in even meters (as ``plan.strong_positions``)."""
    if onset == bar.start:
        return True
    return bar.meter[0] % 2 == 0 and bar.length >= 2 and onset == bar.start + bar.length // 2


def motif(
    bars: Sequence[Bar], figure: Sequence[tuple[int | None, Fraction]], units_per_quarter: int
) -> list[LineNote]:
    """The writer's figure, moved onto every bar's chord root and restarted on the downbeat of every bar (or
    of every pair of bars for a longer figure). A note on a strong beat that is not in the bar's chord takes
    the nearest chord note; the notes between keep the writer's line (study A1: a quarter to a half of the
    writers' strong-beat notes missed the chord)."""
    if not bars or not figure or units_per_quarter < 1:
        return []
    low, high = REGISTER["motif"]
    events: list[tuple[int, int, int | None]] = []
    position = 0
    for pitch, beats in figure:
        exact = beats * units_per_quarter
        units = int(exact) if exact.denominator == 1 and exact >= 1 else max(1, round(float(exact)))
        events.append((position, units, pitch))
        position += units
    span = position
    if span < 1 or all(pitch is None for _, _, pitch in events):
        return []
    first_chord = next((b.chord for b in bars if b.chord), None)  # the figure is written over it
    reference = chord_root(first_chord) if first_chord else _key_tonic(bars[0].key)[0]
    per_tile = max(1, -(-span // max(1, bars[0].length)))  # bars the figure needs (1 or 2 in practice)
    notes: list[LineNote] = []
    for first in range(0, len(bars), per_tile):
        group = bars[first : first + per_tile]
        tile_start, tile_end = group[0].start, group[-1].start + group[-1].length
        tile = tile_start
        while tile < tile_end:
            for offset, length, pitch in events:
                onset = tile + offset
                if onset >= tile_end:
                    break
                if pitch is None:
                    continue
                bar = next((b for b in group if b.start <= onset < b.start + b.length), group[-1])
                root = chord_root(bar.chord) if bar.chord else reference
                shift = (root - reference) % 12
                if shift > 6:
                    shift -= 12
                moved = pitch + shift
                while moved < low:
                    moved += 12
                while moved > high:
                    moved -= 12
                if _strong(bar, onset):
                    tones = in_register(_chord_classes_or_key(bar), low, high)
                    if tones and moved % 12 not in {p % 12 for p in tones}:
                        moved = nearest(moved, tones)
                notes.append((onset, min(length, tile_end - onset), moved))
            tile += span
    return notes
