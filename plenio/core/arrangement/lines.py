"""The instrument line of a section, written note by note from its chords (the plan's *lead* roles).

Every generator returns notes ``(onset, duration, pitch)`` in the score's ``L`` units that lie inside the
section; ``apply`` puts them into the Ins voice with the score operations, which validate the result.
The lines are deterministic: the same chords, energy and seed give the same notes.

Every note follows the chord sounding at its onset (a bar with two chords gets both), and ``fit_to_voice``
fits a finished line to the singing: YuE2's own scores never let the Ins voice sound while the voice sings
(it is the instrumental melody), so by default a line plays only where the voice rests - fills and
answers; with *lines under the singing* it stays below the voice, without a minor second or major
seventh against it (``docs/design/harmony-and-lyrics-fit.md``).
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
RIFF_FIGURES = (
    ("root", "root", "fifth", "octave"),
    ("root", "fifth", "root", "seventh"),
    ("root", "octave", "fifth", "root"),
    ("root", "third", "fourth", "fifth"),
)
"""Riff figures by chord function: the third is the chord's own (minor or major), the seventh the chord's
seventh or else the octave, a fourth that would clash with a major third becomes the fifth."""
REGISTER = {
    "pad": (55, 69),
    "arpeggio": (57, 79),
    "riff": (45, 64),
    "countermelody": (55, 76),
    "solo": (64, 86),
    "motif": (55, 79),
}
HARSH = (1, 11)
"""Pitch-class distances heard as a clash against the voice: a minor second / major seventh (any octave)."""
BELOW_VOICE = 3
"""Under the singing a line stays at least a minor third below the sung note (no unison, no crossing)."""


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


def is_avoid(pc: int, classes: Sequence[int]) -> bool:
    """A half step above a chord tone (and not a chord tone itself)."""
    return pc not in classes and any((pc - t) % 12 == 1 for t in classes)


@dataclass(frozen=True)
class Bar:
    """One bar of the section as the generators need it."""

    start: int
    length: int
    meter: tuple[int, int]
    chord: str | None
    key: str
    changes: tuple[tuple[int, str], ...] = ()
    """Chord symbols that start inside the bar after its first chord: ``(onset, name)``."""

    def chord_at(self, onset: int) -> str | None:
        name = self.chord
        for at, other in self.changes:
            if at <= onset:
                name = other
        return name

    def segments(self) -> list[tuple[int, int, str | None]]:
        """``(start, length, chord)`` of the bar's chords in order."""
        points = [
            (self.start, self.chord),
            *[(at, n) for at, n in self.changes if self.start < at < self.end],
        ]
        result = []
        for i, (at, name) in enumerate(points):
            stop = points[i + 1][0] if i + 1 < len(points) else self.end
            result.append((at, stop - at, name))
        return result

    @property
    def end(self) -> int:
        return self.start + self.length


def bars_of(score: c.Score, first: int, end: int, chord_at: Sequence[str | None]) -> list[Bar]:
    """The section's bars; ``chord_at`` is the chord each bar starts with, the score's chord symbols inside
    a bar become its ``changes``."""
    bars = []
    for i, m in enumerate(range(first, end)):
        start, length = score.starts[m], score.lengths[m]
        changes = tuple((ch.onset, ch.name) for ch in score.chords if start < ch.onset < start + length)
        bars.append(Bar(start, length, score.meters[m], chord_at[i], score.key_at(start), changes))
    return bars


def step_units(score: c.Score, energy: int) -> int:
    """The rhythmic grid of a line for its energy: half notes (1) to sixteenths (5), as far as ``L`` allows."""
    quarter = max(1, score.units_per_quarter)
    wanted = {1: Fraction(2), 2: Fraction(1), 3: Fraction(1, 2), 4: Fraction(1, 2), 5: Fraction(1, 4)}[energy]
    units = quarter * wanted
    while units.denominator != 1 and units < quarter * 2:
        units *= 2
    return max(1, int(units))


def _classes(chord: str | None, key: str) -> tuple[int, ...]:
    if chord:
        return chord_classes(chord)
    tonic, minor = _key_tonic(key)
    return tuple((tonic + i) % 12 for i in ((0, 3, 7) if minor else (0, 4, 7)))


def _chord_classes_or_key(bar: Bar, onset: int | None = None) -> tuple[int, ...]:
    return _classes(bar.chord_at(bar.start if onset is None else onset), bar.key)


def pad(bars: Sequence[Bar], energy: int, rng: random.Random) -> list[LineNote]:
    """Held chord notes - one per chord (two per chord from energy 3: the root, then the third)."""
    notes: list[LineNote] = []
    low, high = REGISTER["pad"]
    previous = (low + high) // 2
    for bar in bars:
        for start, length, chord in bar.segments():
            classes = _classes(chord, bar.key)
            pool = in_register(classes, low, high)
            if not pool:
                continue
            third = [p for p in pool if p % 12 == classes[min(1, len(classes) - 1)]]
            upper = nearest(previous, third or pool)
            if energy <= 2 or length < 2:
                notes.append((start, length, upper))
                previous = upper
                continue
            half = length // 2
            root = nearest(upper, [p for p in pool if p % 12 == classes[0]] or pool)
            notes += [(start, half, root), (start + half, length - half, upper)]
            previous = upper
    return notes


def arpeggio(bars: Sequence[Bar], energy: int, rng: random.Random, step: int) -> list[LineNote]:
    """Broken chords over four chord tones near the previous ones (small steps, no jumps across the
    register); up and down from energy 3."""
    notes: list[LineNote] = []
    low, high = REGISTER["arpeggio"]
    previous = (low + high) // 2 - 4
    for bar in bars:
        for start, length, chord in bar.segments():
            pool = in_register(_classes(chord, bar.key), low, high)
            if len(pool) < 2:
                continue
            first = pool.index(nearest(previous, pool))
            first = max(0, min(first, len(pool) - 4))
            span = pool[first : first + 4]
            order = span + span[-2:0:-1] if energy >= 3 and len(span) > 2 else span
            position = 0
            while position < length:
                size = min(step, length - position)
                notes.append((start + position, size, order[(position // step) % len(order)]))
                position += size
            previous = span[0]
    return notes


def _figure_pitch(root: int, part: str, classes: Sequence[int], key: str) -> int:
    """A riff figure's degree on the chord: its own third and seventh (or the octave without one)."""
    root_pc = root % 12

    def above(interval_options: Sequence[int], fallback: int) -> int:
        for interval in interval_options:
            if (root_pc + interval) % 12 in classes:
                return root + interval
        return root + fallback

    if part == "root":
        return root
    if part == "fifth":
        return above((7, 6, 8), 7)
    if part == "octave":
        return root + 12
    if part == "third":
        return above((3, 4, 2, 5), 7)
    if part == "seventh":
        return above((10, 11, 9), 12)
    # the fourth: a passing note on the beat's off part, unless it clashes with the chord's third
    fourth = root + 5
    return root + 7 if is_avoid(fourth % 12, classes) else fourth


def riff(bars: Sequence[Bar], energy: int, rng: random.Random, quarter: int) -> list[LineNote]:
    """A one-bar rhythm on eighths with a root-fifth-octave figure, moved onto every chord; calm sections
    (energy 1-2) play every other hit."""
    notes: list[LineNote] = []
    low, high = REGISTER["riff"]
    pattern = list(rng.choice(RIFFS_4))
    if energy <= 2:
        pattern = [on if i % 2 == 0 else 0 for i, on in enumerate(pattern)]
    figure = rng.choice(RIFF_FIGURES)
    eighth = max(1, quarter // 2)
    for bar in bars:
        hits = [i * eighth for i, on in enumerate(pattern) if on and i * eighth < bar.length]
        for count, onset in enumerate(hits):
            chord = bar.chord_at(bar.start + onset)
            classes = _classes(chord, bar.key)
            roots = [p for p in range(low, high + 1) if p % 12 == classes[0]]
            if not roots:
                continue
            following = hits[count + 1] if count + 1 < len(hits) else bar.length
            pitch = _figure_pitch(roots[0], figure[count % len(figure)], classes, bar.key)
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
    """A second line that moves against the sung melody: long notes while the voice sings, motion in its
    rests (where it answers the voice)."""
    notes: list[LineNote] = []
    sung = [n.pitch for n in vocal]
    centre = sum(sung) / len(sung) if sung else 67
    low, high = (52, 67) if centre >= 66 else (64, 79)
    quarter_ish = {1: 4, 2: 4, 3: 2, 4: 2, 5: 1}[energy]  # in steps of the energy-3 grid (eighths)
    beat = max(1, step * quarter_ish // 2) if energy <= 2 else max(1, step * quarter_ish)
    previous: int | None = None
    previous_sung: int | None = None
    for bar in bars:
        key_pool = in_register(scale(bar.key), low, high)
        position = 0
        while position < bar.length:
            length = min(beat, bar.length - position)
            onset = bar.start + position
            chord_pool = in_register(_chord_classes_or_key(bar, onset), low, high)
            if not chord_pool:
                position += length
                continue
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
    at the end of every phrase, no pentatonic note that clashes with the chord sounding; busier with more
    energy."""
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
        rhythm = rng.choice(SOLO_RHYTHMS[level])
        last_bar_of_phrase = index % 2 == 1 or index == len(bars) - 1
        position = 0
        for count, eighths in enumerate(rhythm):
            if position >= bar.length:
                break
            length = min(eighths * eighth, bar.length - position)
            if count == len(rhythm) - 1:
                length = bar.length - position
            classes = _chord_classes_or_key(bar, bar.start + position)
            chord_pool = in_register(classes, low, high)
            key_pool = [p for p in in_register(penta, low, high) if not is_avoid(p % 12, classes)]
            if not chord_pool:
                position += length
                continue
            strong = position == 0 or position * 2 == bar.length
            if last_bar_of_phrase and count == len(rhythm) - 1:
                pitch = nearest(previous, chord_pool)
            elif strong or not key_pool:
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
    of every pair of bars for a longer figure). A note on a strong beat that is not in the chord sounding
    takes the nearest chord note; the notes between keep the writer's line (study A1: a quarter to a half
    of the writers' strong-beat notes missed the chord)."""
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
                chord = bar.chord_at(onset)
                root = chord_root(chord) if chord else reference
                shift = (root - reference) % 12
                if shift > 6:
                    shift -= 12
                moved = pitch + shift
                while moved < low:
                    moved += 12
                while moved > high:
                    moved -= 12
                if _strong(bar, onset):
                    tones = in_register(_chord_classes_or_key(bar, onset), low, high)
                    if tones and moved % 12 not in {p % 12 for p in tones}:
                        moved = nearest(moved, tones)
                notes.append((onset, min(length, tile_end - onset), moved))
            tile += span
    return notes


# --- fitting a line to the chords and the voice ----------------------------------------------------


def settle(notes: Sequence[LineNote], bars: Sequence[Bar], quarter: int) -> list[LineNote]:
    """A note on a strong beat or held for a beat that clashes with its chord (a half step above a chord
    tone) moves to the nearest chord tone."""
    result: list[LineNote] = []
    for onset, length, pitch in notes:
        bar = next((b for b in bars if b.start <= onset < b.end), None)
        if bar is None:
            result.append((onset, length, pitch))
            continue
        classes = _chord_classes_or_key(bar, onset)
        if (_strong(bar, onset) or length >= quarter) and is_avoid(pitch % 12, classes):
            pool = in_register(classes, pitch - 7, pitch + 7)
            pitch = nearest(pitch, pool) if pool else pitch
        result.append((onset, length, pitch))
    return result


def rests_of(vocal: Sequence[c.Note], start: int, stop: int, minimum: int) -> list[tuple[int, int]]:
    """Where the voice rests inside ``[start, stop)``: gaps of at least ``minimum`` units."""
    gaps: list[tuple[int, int]] = []
    cursor = start
    for note in sorted(vocal, key=lambda n: n.onset):
        if note.end <= start or note.onset >= stop:
            continue
        if note.onset - cursor >= minimum:
            gaps.append((cursor, note.onset))
        cursor = max(cursor, note.end)
    if stop - cursor >= minimum:
        gaps.append((cursor, stop))
    return gaps


def in_rests(notes: Sequence[LineNote], gaps: Sequence[tuple[int, int]]) -> list[LineNote]:
    """The parts of the notes that lie in the voice's rests (notes are cut at the gap's ends)."""
    result: list[LineNote] = []
    for onset, length, pitch in notes:
        for a, b in gaps:
            start, stop = max(onset, a), min(onset + length, b)
            if stop > start:
                result.append((start, stop - start, pitch))
    return result


def below_voice(
    notes: Sequence[LineNote], vocal: Sequence[c.Note], bars: Sequence[Bar], *, low: int = 36
) -> list[LineNote]:
    """Notes that sound with the voice keep below it - at least a minor third, never a minor second or
    major seventh against any sung note they overlap; a note that cannot be placed so is left out."""
    sung = sorted(vocal, key=lambda n: n.onset)
    result: list[LineNote] = []
    for onset, length, pitch in notes:
        over = [v.pitch for v in sung if v.onset < onset + length and v.end > onset]
        if not over:
            result.append((onset, length, pitch))
            continue

        def fine(p: int, over: Sequence[int] = over) -> bool:
            return all(p <= v - BELOW_VOICE and (v - p) % 12 not in HARSH for v in over)

        if fine(pitch):
            result.append((onset, length, pitch))
            continue
        bar = next((b for b in bars if b.start <= onset < b.end), None)
        classes = _chord_classes_or_key(bar, onset) if bar else (pitch % 12,)
        candidates = [
            p
            for p in range(max(low, pitch - 14), min(over) - BELOW_VOICE + 1)
            if p % 12 in classes and fine(p)
        ]
        if candidates:
            result.append((onset, length, nearest(pitch, candidates)))
    return result
