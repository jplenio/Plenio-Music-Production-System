"""Chord recognition by template matching for foreign MIDI files (Phase 11C D3). Pure.

A foreign file usually has no ``plenio:chord`` text events, so the notes of a *Chords* track
would contribute nothing to the score. This module reads chord symbols from those notes: for
every onset the sounding pitch classes are matched against the chords the YuE2 dialect supports
(root, quality, optional slash bass, ``canonical.ChordSymbol``); the closest template wins, a tie
prefers the bass note as the root and then the more common quality.

The result is **best effort**: it is labelled in the import report and lands in the text like any
other chord symbol, where the editor shows and edits it. Nothing here is a second source of
truth - the ABC text stays the only stored score.
"""

from __future__ import annotations

from bisect import bisect_right
from collections.abc import Iterable, Sequence
from dataclasses import dataclass

from ...third_party import yue2_abc_tools as upstream
from .canonical import ChordSymbol
from .model import CHORD_INTERVALS

# Common qualities first: on a tie (for example C6 against Am7 on C-E-G-A) the earlier one wins.
QUALITY_ORDER: tuple[str, ...] = (
    "",
    "m",
    "7",
    "maj7",
    "m7",
    "dim",
    "aug",
    "sus4",
    "sus2",
    "6",
    "m6",
    "m7b5",
    "dim7",
    "7sus4",
    "m(maj7)",
)
_SHARP = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
_FLAT = ("C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B")
MIN_MATCHES = 2
"""A single pitch is not a chord: at least two chord tones must be present."""

Note = tuple[int, int, int]
"""``(onset, duration, pitch)`` in units of ``L``, as ``midi.import_midi`` reads a track."""


@dataclass(frozen=True)
class Recognition:
    """The chord symbols read from a track: what was found, what was not, what was merged."""

    chords: tuple[ChordSymbol, ...]
    skipped: int
    """Onsets at which no supported chord fitted the notes."""
    merged: int
    """Onsets covered by the symbol before them (the harmony did not change)."""


def _speller(key: str) -> tuple[str, ...]:
    """The accidental preference of a key: flat keys spell with ``b``, all others with ``#``."""
    return _FLAT if upstream.KEYS[key] < 0 else _SHARP


def _key_at(keys: Sequence[tuple[int, str]], default_key: str, onset: int) -> str:
    if not keys:
        return default_key
    index = bisect_right([k[0] for k in keys], onset) - 1
    return keys[index][1] if index >= 0 else default_key


def _best(pitches: Sequence[int]) -> tuple[int, str] | None:
    """Root pitch class and quality of the closest template, or ``None`` when nothing fits."""
    classes = {p % 12 for p in pitches}
    bass = pitches[0] % 12
    best: tuple[tuple[int, int, int, int], int, str] | None = None
    for rank, quality in enumerate(QUALITY_ORDER):
        intervals = CHORD_INTERVALS[quality]
        size = len(intervals)
        for root in range(12):
            if root not in classes:
                continue  # a chord symbol without its root is not a reading of these notes
            tones = {(root + i) % 12 for i in intervals}
            matches = len(tones & classes)
            if matches < min(MIN_MATCHES, size):
                continue
            score = matches - len(tones - classes) - len(classes - tones)
            if score < 1:
                continue
            candidate = (-score, 0 if root == bass else 1, rank, size)
            if best is None or candidate < best[0]:
                best = (candidate, root, quality)
    return (best[1], best[2]) if best else None


def _name(root: int, quality: str, pitches: Sequence[int], spell: Sequence[str]) -> str:
    text = f"{spell[root]}{quality}"
    bass = pitches[0] % 12
    classes = {(root + i) % 12 for i in CHORD_INTERVALS[quality]}
    if len(set(pitches)) >= 3 and bass != root and bass in classes:
        text += f"/{spell[bass]}"
    return text


def recognize_chords(
    notes: Iterable[Note], *, keys: Sequence[tuple[int, str]] = (), default_key: str = "C"
) -> Recognition:
    """Chord symbols for the notes of a chord track, by template matching.

    ``notes`` are ``(onset, duration, pitch)`` in units of ``L``; the harmony of an onset is the
    set of pitches that *start* there. ``keys`` is the score's key timeline as ``(onset, key)``
    pairs (a key's accidentals decide the spelling), in any order.
    """
    groups: dict[int, list[int]] = {}
    for onset, duration, pitch in notes:
        if duration > 0:
            groups.setdefault(onset, []).append(pitch)
    timeline = sorted(keys)
    found: list[ChordSymbol] = []
    skipped = merged = 0
    previous: tuple[str, frozenset[int]] | None = None
    for onset in sorted(groups):
        pitches = sorted(groups[onset])
        classes = frozenset(p % 12 for p in pitches)
        reading = _best(pitches)
        if reading is None:
            skipped += 1
            previous = None
            continue
        key = _key_at(timeline, default_key, onset)
        name = _name(reading[0], reading[1], pitches, _speller(key))
        if previous is not None and previous[1] == classes and previous[0] == name:
            merged += 1  # the harmony did not change: the symbol before it holds
            continue
        found.append(ChordSymbol(onset, name))
        previous = (name, classes)
    return Recognition(tuple(found), skipped, merged)


__all__ = ["MIN_MATCHES", "QUALITY_ORDER", "Recognition", "recognize_chords"]
