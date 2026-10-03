"""Edit operations on the canonical score (next-release plan §9.6).

Every operation is a pure function ``Score -> OpResult``: it returns a new, validated score
and a change log, or refuses with a :class:`PlenioValidationError` that says why and what to
do instead - it never returns a score that breaks an invariant. ``transform(text, op)`` is
the commit path of the editor: read the text, apply one operation, write the text and check
that it re-parses to the new score (``canonical.to_abc``, S6).

Repair rules (deterministic):

- **delete** turns each selected note into a rest of the same length; measure lengths never
  change. **delete and close gap** (explicit) extends the note of the same voice that ends
  exactly where the deleted note starts; without such a note the span stays a rest.
- **insert** overwrites inside its voice: the overlapped parts of other notes are removed, the
  parts outside remain as notes with their pitch. **move** is delete (rest) + insert.
- **resize** grows *into rests only* (refuses when a note follows) or *overwrites*; shrinking
  leaves a rest.
- measure insertion, deletion and duplication keep both voices, chords, keys and sections
  aligned and re-group lines deterministically (groups are split, never merged).

Ids: ``vocal:<onset>``, ``ins:<onset>`` (a voice holds at most one note per onset) and
``chord:<onset>``; onsets and durations are integers in ``L`` units, bars are 1-based.
"""

from __future__ import annotations

import math
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass, replace
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioValidationError
from . import canonical as c
from .canonical import ChordSymbol, KeyChange, Note, Score, Section
from .edit import _label as section_label
from .model import pitch_name
from .native import _chord_name, _transpose_key

VOICE_OF = {"vocal": "Vocal", "ins": "Ins"}
DEFAULT_PITCH = {"vocal": 72, "ins": 67}
RESIZE_MODES = ("rests", "overwrite")
MAX_INSERT = 64


TimeMap = tuple[tuple[int, int, int], ...]
"""Where the old score's time went: ``(old start, old end, new start)`` per piece, in units. A piece
may appear twice (a copy); time that is not covered was deleted. ``None`` on a result: unchanged."""


@dataclass(frozen=True)
class OpResult:
    score: Score
    changes: tuple[str, ...]
    warnings: tuple[str, ...] = ()
    select: tuple[str, ...] = ()
    """Ids to select after the edit."""
    time_map: TimeMap | None = None
    """Set by the operations that move time (bars inserted, deleted, copied or rearranged): what
    lives outside the score text - the Guide track - follows with it."""


@dataclass(frozen=True)
class TextResult:
    abc: str
    result: OpResult


# --- ids and lookups --------------------------------------------------------------------


def note_id(track: str, onset: int) -> str:
    return f"{track}:{onset}"


def chord_id(onset: int) -> str:
    return f"chord:{onset}"


def parse_id(value: object) -> tuple[str, int]:
    """``("vocal" | "ins" | "chord", onset)`` of an id."""
    if isinstance(value, str):
        kind, separator, onset = value.partition(":")
        if separator and kind in ("vocal", "ins", "chord") and onset.isdigit():
            return kind, int(onset)
    raise PlenioValidationError(
        f"{value!r} is not a note or chord id.", hint="Use vocal:<onset>, ins:<onset> or chord:<onset>."
    )


def _bar(score: Score, onset: int) -> str:
    return f"bar {score.measure_at(onset) + 1}"


def _find(score: Score, track: str, onset: int) -> Note:
    for note in score.track(track):
        if note.onset == onset:
            return note
    raise PlenioValidationError(
        f"The score has no {VOICE_OF[track]} note starting at {_bar(score, onset)} (onset {onset}).",
        hint="The score changed; select the note again.",
    )


def _chord_at(score: Score, onset: int) -> ChordSymbol:
    for chord in score.chords:
        if chord.onset == onset:
            return chord
    raise PlenioValidationError(
        f"The score has no chord symbol at onset {onset}.", hint="Select the chord again."
    )


def _selection(score: Score, ids: Sequence[object]) -> list[tuple[str, int]]:
    if not ids:
        raise PlenioValidationError("Select at least one note.")
    seen: dict[tuple[str, int], None] = {}
    for value in ids:
        seen.setdefault(parse_id(value), None)
    return sorted(seen, key=lambda item: (("vocal", "ins", "chord").index(item[0]), item[1]))


def _notes_of(score: Score, ids: Sequence[object]) -> list[tuple[str, Note]]:
    picked = []
    for kind, onset in _selection(score, ids):
        if kind == "chord":
            raise PlenioValidationError("Select notes, not chord symbols, for this operation.")
        picked.append((kind, _find(score, kind, onset)))
    return picked


def _describe(score: Score, track: str, note: Note) -> str:
    return f"{_bar(score, note.onset)} {VOICE_OF[track]}: {pitch_name(note.pitch)}"


def _carve(notes: Iterable[Note], start: int, end: int) -> tuple[list[Note], list[Note]]:
    """Remove ``[start, end)`` from a voice: ``(what remains, the notes that were cut)``."""
    kept: list[Note] = []
    hit: list[Note] = []
    for note in notes:
        if note.end <= start or note.onset >= end:
            kept.append(note)
            continue
        hit.append(note)
        if note.onset < start:
            kept.append(Note(note.onset, start - note.onset, note.pitch, note.spelling))
        if note.end > end:
            kept.append(Note(end, note.end - end, note.pitch, note.spelling))
    return sorted(kept, key=lambda n: n.onset), hit


def _commit(
    score: Score,
    changes: Iterable[str],
    warnings: Iterable[str] = (),
    select: Iterable[str] = (),
    time_map: TimeMap | None = None,
) -> OpResult:
    return OpResult(c.validate(score), tuple(changes), tuple(warnings), tuple(select), time_map)


def _unchanged(score: Score, reason: str, select: Iterable[str] = ()) -> OpResult:
    return OpResult(score, (reason,), (), tuple(select))


def _whole(value: object, name: str, low: int | None = None, high: int | None = None) -> int:
    if (
        isinstance(value, bool)
        or not isinstance(value, int | float)
        or not math.isfinite(value)
        or int(value) != value
    ):
        raise PlenioValidationError(f"The operation needs a whole number '{name}'.")
    number = int(value)
    if (low is not None and number < low) or (high is not None and number > high):
        span = f"{low if low is not None else '...'} ... {high if high is not None else '...'}"
        raise PlenioValidationError(f"'{name}' must lie within {span} (got {number}).")
    return number


def _track(value: object) -> str:
    if value not in VOICE_OF:
        raise PlenioValidationError(f"Unknown track {value!r}; use 'vocal' or 'ins'.")
    return str(value)


def _pitch(value: object) -> int:
    return _whole(value, "pitch", 0, 127)


# --- notes ------------------------------------------------------------------------------


def delete(score: Score, ids: Sequence[object]) -> OpResult:
    """Every selected note becomes a rest of the same length; selected chord symbols are removed."""
    tracks = {"vocal": list(score.vocal), "ins": list(score.ins)}
    chords = list(score.chords)
    changes = []
    for kind, onset in _selection(score, ids):
        if kind == "chord":
            chord = _chord_at(score, onset)
            chords.remove(chord)
            changes.append(f"{_bar(score, onset)}: chord {chord.name} removed")
        else:
            note = _find(score, kind, onset)
            tracks[kind].remove(note)
            changes.append(f"{_describe(score, kind, note)} -> rest")
    new = replace(score, vocal=tuple(tracks["vocal"]), ins=tuple(tracks["ins"]), chords=tuple(chords))
    return _commit(new, changes)


def delete_close_gap(score: Score, ids: Sequence[object]) -> OpResult:
    """Delete notes and let the adjacent preceding note of the same voice take their time."""
    tracks = {"vocal": list(score.vocal), "ins": list(score.ins)}
    chords = list(score.chords)
    changes: list[str] = []
    select: list[str] = []
    for kind, onset in _selection(score, ids):
        if kind == "chord":
            chord = _chord_at(score, onset)
            chords.remove(chord)
            changes.append(f"{_bar(score, onset)}: chord {chord.name} removed")
            continue
        notes = tracks[kind]
        note = next((n for n in notes if n.onset == onset), None)
        if note is None:
            note = _find(score, kind, onset)  # raises: not in the score
        notes.remove(note)
        before = next((n for n in notes if n.end == note.onset), None)
        if before is None:
            changes.append(
                f"{_describe(score, kind, note)} -> rest (no note ends where it starts, so the gap stays a rest)"
            )
            continue
        notes[notes.index(before)] = Note(
            before.onset, before.duration + note.duration, before.pitch, before.spelling
        )
        changes.append(
            f"{_describe(score, kind, note)} deleted; {pitch_name(before.pitch)} "
            f"({_bar(score, before.onset)}) now lasts {before.duration + note.duration} units"
        )
        select.append(note_id(kind, before.onset))
    new = replace(score, vocal=tuple(tracks["vocal"]), ins=tuple(tracks["ins"]), chords=tuple(chords))
    return _commit(new, changes, select=dict.fromkeys(select))


def insert_note(score: Score, track: str, onset: int, duration: int, pitch: int) -> OpResult:
    """Draw a note; it overwrites whatever its voice plays in ``[onset, onset + duration)``."""
    track = _track(track)
    onset = _whole(onset, "onset", 0, score.total - 1)
    duration = _whole(duration, "duration", 1, score.total - onset)
    pitch = _pitch(pitch)
    kept, hit = _carve(score.track(track), onset, onset + duration)
    note = Note(onset, duration, pitch)
    warnings = [f"{_describe(score, track, n)} was overwritten" for n in hit]
    new = score.with_track(track, [*kept, note])
    change = f"{_describe(score, track, note)} ({duration} units) inserted"
    return _commit(new, [change], warnings, [note_id(track, onset)])


def place_notes(
    score: Score,
    track: str,
    notes: Sequence[Mapping[str, Any]],
    *,
    clear: Sequence[int] | None = None,
    label: str = "",
) -> OpResult:
    """Notes played in (a MIDI recording, step input) into one voice, in one step.

    ``clear`` ``[start, end)``: what the voice played there goes first (a recording that replaces);
    without it only the new notes' spans are overwritten (one that merges). The voice stays one line:
    a note that starts before the previous one ends cuts it short.
    """
    track = _track(track)
    placed: list[Note] = []
    for item in sorted(notes, key=lambda n: (int(n.get("onset", 0)), -int(n.get("pitch", 0)))):
        onset = _whole(item.get("onset"), "onset", 0, score.total - 1)
        duration = _whole(item.get("duration"), "duration", 1, score.total - onset)
        pitch = _pitch(item.get("pitch"))
        if placed and placed[-1].onset == onset:
            continue  # a chord into one voice: its highest note
        if placed and placed[-1].end > onset:
            last = placed[-1]
            placed[-1] = Note(last.onset, onset - last.onset, last.pitch)
        placed.append(Note(onset, duration, pitch))
    if not placed and clear is None:
        return _unchanged(score, "no notes to place")
    voice = list(score.track(track))
    removed = 0
    if clear is not None:
        start = _whole(clear[0], "clear start", 0, score.total)
        end = _whole(clear[1], "clear end", start, score.total)
        voice, hit = _carve(voice, start, end)
        removed = len(hit)
    warnings: list[str] = []
    for note in placed:
        voice, hit = _carve(voice, note.onset, note.end)
        warnings += [f"{_describe(score, track, n)} was overwritten" for n in hit]
        voice = sorted([*voice, note], key=lambda n: n.onset)
    new = score.with_track(track, voice)
    if placed:
        first = score.measure_at(placed[0].onset) + 1
        last = score.measure_at(placed[-1].end - 1) + 1
        where = f"bar {first}" if first == last else f"bars {first}-{last}"
        change = f"{label or 'placed'} {len(placed)} note{'s' if len(placed) != 1 else ''} in {VOICE_OF[track]} ({where})"
    else:
        change = f"{label or 'placed'} no notes in {VOICE_OF[track]}"
    if removed:
        change += f", {removed} replaced"
    return _commit(
        new, [change], warnings if clear is None else [], [note_id(track, n.onset) for n in placed]
    )


def move_notes(
    score: Score, ids: Sequence[object], *, delta: int = 0, semitones: int = 0, track: str | None = None
) -> OpResult:
    """Move notes in time, pitch and/or to the other voice (delete to rests, then insert with overwrite)."""
    picked = _notes_of(score, ids)
    delta = _whole(delta, "delta", -score.total, score.total)
    semitones = _whole(semitones, "semitones", -127, 127)
    target_track = _track(track) if track is not None else None
    if delta == 0 and semitones == 0 and all(target_track in (None, kind) for kind, _n in picked):
        return _unchanged(score, "nothing moved", [note_id(k, n.onset) for k, n in picked])
    targets: list[tuple[str, Note]] = []
    for kind, note in picked:
        destination = target_track or kind
        onset, pitch = note.onset + delta, note.pitch + semitones
        if onset < 0 or onset + note.duration > score.total:
            raise PlenioValidationError(
                f"{_describe(score, kind, note)} would leave the score.",
                hint="Move it by less, or add bars first.",
            )
        if not 0 <= pitch <= 127:
            raise PlenioValidationError(f"{_describe(score, kind, note)} would leave the MIDI range 0-127.")
        targets.append(
            (destination, Note(onset, note.duration, pitch, note.spelling if semitones == 0 else None))
        )
    tracks = {"vocal": list(score.vocal), "ins": list(score.ins)}
    for kind, note in picked:
        tracks[kind].remove(note)
    warnings: list[str] = []
    placed: list[tuple[str, Note]] = []
    for destination, note in sorted(targets, key=lambda item: (item[0], item[1].onset)):
        kept, hit = _carve(tracks[destination], note.onset, note.end)
        warnings += [f"{_describe(score, destination, n)} was overwritten" for n in hit]
        tracks[destination] = sorted([*kept, note], key=lambda n: n.onset)
        placed.append((destination, note))
    new = replace(score, vocal=tuple(tracks["vocal"]), ins=tuple(tracks["ins"]))
    changes = [
        f"{_describe(score, kind, old)} -> {_describe(score, destination, moved)}"
        for (kind, old), (destination, moved) in zip(picked, targets, strict=True)
    ]
    survivors = [
        note_id(destination, note.onset)
        for destination, note in placed
        if any(
            n.onset == note.onset and n.end == note.end
            for n in (new.vocal if destination == "vocal" else new.ins)
        )
    ]
    return _commit(new, changes, warnings, survivors)


def quantize(score: Score, ids: Sequence[object], grid: int, *, lengths: bool = False) -> OpResult:
    """The selected notes' starts on a grid of ``grid`` units (Cubase: Quantize), their lengths too with
    ``lengths`` (at least one step). Where a note lands it replaces what its voice played there."""
    picked = _notes_of(score, ids)
    grid = _whole(grid, "grid", 1, score.total)
    targets: list[tuple[str, Note, Note]] = []
    for kind, note in picked:
        onset = min(max(0, round(note.onset / grid) * grid), score.total - 1)
        if lengths:
            end = max(onset + grid, round(note.end / grid) * grid)
        else:
            end = onset + note.duration
        end = min(end, score.total)
        if end <= onset:
            end = min(onset + 1, score.total)
        targets.append((kind, note, Note(onset, end - onset, note.pitch, note.spelling)))
    moved = [
        (kind, old, new)
        for kind, old, new in targets
        if (old.onset, old.duration) != (new.onset, new.duration)
    ]
    if not moved:
        return _unchanged(score, "already on the grid", [note_id(k, n.onset) for k, n in picked])
    tracks = {"vocal": list(score.vocal), "ins": list(score.ins)}
    for kind, old, _new in moved:
        tracks[kind].remove(old)
    warnings: list[str] = []
    for kind, _old, note in sorted(moved, key=lambda item: (item[0], item[2].onset, item[1].onset)):
        kept, hit = _carve(tracks[kind], note.onset, note.end)
        warnings += [f"{_describe(score, kind, n)} was overwritten" for n in hit]
        tracks[kind] = sorted([*kept, note], key=lambda n: n.onset)
    new_score = replace(score, vocal=tuple(tracks["vocal"]), ins=tuple(tracks["ins"]))
    survivors = [
        note_id(kind, note.onset)
        for kind, _old, note in targets
        if any(
            n.onset == note.onset and n.end == note.end
            for n in (new_score.vocal if kind == "vocal" else new_score.ins)
        )
    ]
    what = "starts and lengths" if lengths else "starts"
    change = f"quantized {len(moved)} note{'s' if len(moved) != 1 else ''} ({what}) to {grid} unit{'s' if grid != 1 else ''}"
    return _commit(new_score, [change], warnings, survivors)


def resize_note(score: Score, id_: object, duration: int, *, mode: str = "rests") -> OpResult:
    """Give a note a new length: grow into rests only (``rests``) or over what follows (``overwrite``)."""
    kind, onset = parse_id(id_)
    if kind == "chord":
        raise PlenioValidationError("Chord symbols have no length; move the next chord instead.")
    if mode not in RESIZE_MODES:
        raise PlenioValidationError(f"Unknown resize mode {mode!r}; use one of {list(RESIZE_MODES)}.")
    note = _find(score, kind, onset)
    duration = _whole(duration, "duration", 1, score.total - note.onset)
    if duration == note.duration:
        return _unchanged(score, "no length changed", [note_id(kind, onset)])
    others = [n for n in score.track(kind) if n.onset != note.onset]
    warnings: list[str] = []
    if duration > note.duration:
        grow_end = note.onset + duration
        blocking = [n for n in others if n.onset < grow_end and n.end > note.end]
        if blocking and mode == "rests":
            room = min(n.onset for n in blocking) - note.end
            raise PlenioValidationError(
                f"Only {room} units of rest follow {_describe(score, kind, note)}; it cannot grow to {duration}.",
                hint="Delete or move the following note first, or resize with overwrite.",
            )
        others, hit = _carve(others, note.end, grow_end)
        warnings = [f"{_describe(score, kind, n)} was overwritten" for n in hit]
    new = score.with_track(kind, [*others, Note(note.onset, duration, note.pitch, note.spelling)])
    change = f"{_describe(score, kind, note)} length {note.duration} -> {duration}"
    return _commit(new, [change], warnings, [note_id(kind, onset)])


def set_note_pitch(
    score: Score, ids: Sequence[object], *, midi: int | None = None, semitones: int | None = None
) -> OpResult:
    """A new pitch for the selected notes (the spelling follows the key when the text is written).

    Moved by ``semitones``, selected chord symbols move too (spelled for the key where they stand;
    an octave leaves a chord symbol as it is)."""
    if (midi is None) == (semitones is None):
        raise PlenioValidationError("Give either a pitch or a number of semitones.")
    chosen = _selection(score, ids)
    chord_onsets = [onset for kind, onset in chosen if kind == "chord"]
    if chord_onsets and midi is not None:
        raise PlenioValidationError(
            "A chord symbol has no single pitch to set.", hint="Move it by semitones (↑ / ↓) or rename it."
        )
    picked = [(kind, _find(score, kind, onset)) for kind, onset in chosen if kind != "chord"]
    tracks = {"vocal": list(score.vocal), "ins": list(score.ins)}
    changes = []
    chords = list(score.chords)
    for onset in chord_onsets:
        chord = _chord_at(score, onset)
        name = _chord_name(chord.name, _whole(semitones, "semitones"), score.key_at(onset))
        if name != chord.name:
            chords[chords.index(chord)] = ChordSymbol(onset, name)
            changes.append(f"{_bar(score, onset)}: chord {chord.name} -> {name}")
    for kind, note in picked:
        target = _pitch(midi) if midi is not None else note.pitch + _whole(semitones, "semitones")
        if not 0 <= target <= 127:
            raise PlenioValidationError(f"{_describe(score, kind, note)} cannot move outside the MIDI range.")
        if target == note.pitch:
            continue
        tracks[kind][tracks[kind].index(note)] = Note(note.onset, note.duration, target)
        changes.append(f"{_describe(score, kind, note)} -> {pitch_name(target)}")
    select = [note_id(k, n.onset) for k, n in picked] + [chord_id(onset) for onset in chord_onsets]
    if not changes:
        return _unchanged(score, "no pitch changed", select)
    return _commit(
        replace(score, vocal=tuple(tracks["vocal"]), ins=tuple(tracks["ins"]), chords=tuple(chords)),
        changes,
        select=select,
    )


def split_note(score: Score, id_: object, at: int) -> OpResult:
    """Two attacks of the same pitch at ``at`` (onset < at < end)."""
    kind, onset = parse_id(id_)
    note = _find(score, kind, onset) if kind != "chord" else None
    if note is None:
        raise PlenioValidationError("Select a note to split.")
    at = _whole(at, "at")
    if not note.onset < at < note.end:
        raise PlenioValidationError(f"Split inside the note: between {note.onset + 1} and {note.end - 1}.")
    notes = [n for n in score.track(kind) if n.onset != onset]
    notes += [
        Note(onset, at - onset, note.pitch, note.spelling),
        Note(at, note.end - at, note.pitch, note.spelling),
    ]
    return _commit(
        score.with_track(kind, notes),
        [f"{_describe(score, kind, note)} split at {_bar(score, at)}"],
        select=[note_id(kind, onset), note_id(kind, at)],
    )


def join_notes(score: Score, ids: Sequence[object]) -> OpResult:
    """Join adjacent notes of equal pitch in one voice into one sounding note."""
    picked = _notes_of(score, ids)
    kinds = {kind for kind, _n in picked}
    if len(picked) < 2 or len(kinds) != 1:
        raise PlenioValidationError("Select at least two adjacent notes of one voice to join.")
    kind = kinds.pop()
    notes = sorted((n for _k, n in picked), key=lambda n: n.onset)
    for left, right in zip(notes, notes[1:], strict=False):
        if left.end != right.onset or left.pitch != right.pitch:
            raise PlenioValidationError(
                f"{_describe(score, kind, left)} and {_describe(score, kind, right)} are not adjacent notes "
                "of the same pitch.",
                hint="Only notes that follow each other directly with the same pitch can be joined.",
            )
    first = notes[0]
    joined = Note(first.onset, notes[-1].end - first.onset, first.pitch, first.spelling)
    onsets = {n.onset for n in notes}
    rest = [n for n in score.track(kind) if n.onset not in onsets]
    return _commit(
        score.with_track(kind, [*rest, joined]),
        [f"{len(notes)} notes joined into {_describe(score, kind, joined)} ({joined.duration} units)"],
        select=[note_id(kind, first.onset)],
    )


def fill_rest(score: Score, track: str, onset: int, *, pitch: int | None = None) -> OpResult:
    """Turn the rest at ``onset`` into a note: the longest supported length that fits the rest in its bar."""
    track = _track(track)
    onset = _whole(onset, "onset", 0, score.total - 1)
    notes = score.track(track)
    if any(n.onset <= onset < n.end for n in notes):
        raise PlenioValidationError(f"{VOICE_OF[track]} already plays at onset {onset}; select a rest.")
    measure = score.measure_at(onset)
    gap_end = min([score.starts[measure + 1], *(n.onset for n in notes if n.onset > onset)])
    duration = max(d for d in c.DURATIONS if d <= gap_end - onset)
    if pitch is None:
        before = [n for n in notes if n.onset < onset]
        after = [n for n in notes if n.onset > onset]
        pitch = before[-1].pitch if before else after[0].pitch if after else DEFAULT_PITCH[track]
    note = Note(onset, duration, _pitch(pitch))
    return _commit(
        score.with_track(track, [*notes, note]),
        [f"{_bar(score, onset)} {VOICE_OF[track]}: rest -> {pitch_name(note.pitch)} ({duration} units)"],
        select=[note_id(track, onset)],
    )


# --- chord symbols ----------------------------------------------------------------------


def _chord_name_checked(name: object) -> str:
    text = str(name).strip() if isinstance(name, str) else ""
    if upstream.CHORD.fullmatch(text) is None:
        raise PlenioValidationError(
            f"{name!r} is not a supported chord symbol.",
            hint="Use a root (C, F#, Bb ...) with an optional quality (m, 7, maj7, m7, dim, sus4 ...) and bass (/E).",
        )
    return text


def put_chord(score: Score, onset: int, name: str) -> OpResult:
    """Add (or replace) the chord symbol at ``onset``; notes never change."""
    onset = _whole(onset, "onset", 0, score.total - 1)
    name = _chord_name_checked(name)
    old = next((ch for ch in score.chords if ch.onset == onset), None)
    if old is not None and old.name == name:
        return _unchanged(score, "no chord changed", [chord_id(onset)])
    chords = sorted(
        [*(ch for ch in score.chords if ch.onset != onset), ChordSymbol(onset, name)], key=lambda x: x.onset
    )
    change = (
        f"{_bar(score, onset)}: chord {old.name} -> {name}"
        if old
        else f"{_bar(score, onset)}: chord {name} added"
    )
    return _commit(replace(score, chords=tuple(chords)), [change], select=[chord_id(onset)])


def move_chord(score: Score, onset: int, to: int) -> OpResult:
    """Move a chord symbol to another onset (a chord already there is replaced, with a warning)."""
    chord = _chord_at(score, _whole(onset, "onset"))
    to = _whole(to, "to", 0, score.total - 1)
    if to == chord.onset:
        return _unchanged(score, "no chord moved", [chord_id(to)])
    replaced = next((ch for ch in score.chords if ch.onset == to), None)
    chords = [ch for ch in score.chords if ch.onset not in (chord.onset, to)] + [ChordSymbol(to, chord.name)]
    warnings = [f"{_bar(score, to)}: chord {replaced.name} was replaced"] if replaced else []
    return _commit(
        replace(score, chords=tuple(sorted(chords, key=lambda x: x.onset))),
        [f"chord {chord.name} moved from {_bar(score, chord.onset)} to {_bar(score, to)}"],
        warnings,
        [chord_id(to)],
    )


def delete_chord(score: Score, onset: int) -> OpResult:
    chord = _chord_at(score, _whole(onset, "onset"))
    return _commit(
        replace(score, chords=tuple(ch for ch in score.chords if ch.onset != chord.onset)),
        [f"{_bar(score, chord.onset)}: chord {chord.name} removed"],
    )


# --- layout helpers ---------------------------------------------------------------------


def _firsts(layout: Sequence[int]) -> list[int]:
    firsts, cursor = [], 0
    for count in layout:
        firsts.append(cursor)
        cursor += count
    return firsts


def _split_layout(layout: Sequence[int], cuts: Iterable[int]) -> list[int]:
    """``layout`` with every measure index in ``cuts`` made a group start."""
    wanted = set(cuts)
    result = []
    for first, count in zip(_firsts(layout), layout, strict=True):
        start = first
        for cut in sorted(m for m in wanted if first < m < first + count):
            result.append(cut - start)
            start = cut
        result.append(first + count - start)
    return result


def _chunk(layout: Iterable[int]) -> list[int]:
    """Groups longer than four measures split into fours (from the group start)."""
    result = []
    for count in layout:
        while count > c.MAX_GROUP:
            result.append(c.MAX_GROUP)
            count -= c.MAX_GROUP
        if count:
            result.append(count)
    return result


def _origins(score: Score) -> list[int | None]:
    return [score.origin(m) for m in range(score.measure_count)]


def _shift_notes(notes: Iterable[Note], at: int, delta: int) -> list[Note]:
    """Notes starting at or after ``at`` move by ``delta``; a note crossing ``at`` is split there."""
    result = []
    for note in notes:
        if note.onset >= at:
            result.append(Note(note.onset + delta, note.duration, note.pitch, note.spelling))
        elif note.end > at:
            result.append(Note(note.onset, at - note.onset, note.pitch, note.spelling))
            result.append(Note(at + delta, note.end - at, note.pitch, note.spelling))
        else:
            result.append(note)
    return result


def _respell(notes: Iterable[Note], start: int, end: int) -> list[Note]:
    """Forget the kept spelling of attacks in ``[start, end)`` (they follow the new key)."""
    return [Note(n.onset, n.duration, n.pitch) if start <= n.onset < end else n for n in notes]


def _checked_meter(score: Score, meter: tuple[object, object]) -> tuple[int, int]:
    numerator = _whole(meter[0], "meter numerator", 1, 64)
    denominator = _whole(meter[1], "meter denominator", 1, c.MAX_UNIT)
    if denominator & (denominator - 1) or (numerator * score.unit.denominator) % denominator:
        raise PlenioValidationError(
            f"The meter {numerator}/{denominator} is not supported with L:1/{score.unit.denominator}.",
            hint="The denominator must be a power of two and a bar a whole number of units.",
        )
    return numerator, denominator


def _bar_index(score: Score, bar: object, *, allow_end: bool = False) -> int:
    limit = score.measure_count + (1 if allow_end else 0)
    return _whole(bar, "bar", 1, limit) - 1


# --- measures ---------------------------------------------------------------------------


def insert_measures(
    score: Score, bar: int, count: int = 1, *, meter: tuple[int, int] | None = None
) -> OpResult:
    """Insert empty measures before ``bar`` (``bar = measures + 1`` appends).

    With the meter of the measure before ``bar`` (the default) the new measures join that measure's
    group - at bar 1 the first group - and a group longer than four measures is split into fours.
    Another meter makes them a group of their own (a group that contains ``bar`` is split there).
    Everything from ``bar`` on moves back; a note sounding across the insertion point is split, its
    end becoming a new note after the new bars.
    """
    at = _bar_index(score, bar, allow_end=True)
    count = _whole(count, "count", 1, MAX_INSERT)
    neighbour = score.meters[at - 1] if at > 0 else score.meters[0]
    new_meter = _checked_meter(score, meter) if meter is not None else neighbour
    length = new_meter[0] * score.unit.denominator // new_meter[1]
    time, delta = score.starts[at], count * length
    layout = list(score.layout)
    if new_meter == neighbour:
        firsts = _firsts(layout)
        group = 0 if at == 0 else max(i for i, first in enumerate(firsts) if first < at)
        layout = layout[:group] + _chunk([layout[group] + count]) + layout[group + 1 :]
        shift_from = at if at > 0 else 1  # at bar 1 the first section keeps starting at bar 1
    else:
        layout = _split_layout(layout, [at])
        index = _firsts(layout).index(at) if at < score.measure_count else len(layout)
        layout[index:index] = _chunk([count])
        shift_from = at
    keys = [
        k if k.onset < time or (at == 0 and k.onset == 0) else KeyChange(k.onset + delta, k.key, k.placement)
        for k in score.keys
    ]
    sections = [Section(s.measure + count, s.label) if s.measure >= shift_from else s for s in score.sections]
    origins = _origins(score)
    new = replace(
        score,
        meters=score.meters[:at] + (new_meter,) * count + score.meters[at:],
        layout=tuple(layout),
        keys=tuple(keys),
        sections=tuple(sections),
        vocal=tuple(_shift_notes(score.vocal, time, delta)),
        ins=tuple(_shift_notes(score.ins, time, delta)),
        chords=tuple(
            ChordSymbol(ch.onset + delta, ch.name) if ch.onset >= time else ch for ch in score.chords
        ),
        origins=tuple(origins[:at] + [None] * count + origins[at:]),
    )
    warnings = [
        f"{_describe(score, kind, n)} crossed the insertion point; its end is now a new note after the new bars"
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if n.onset < time < n.end
    ]
    where = f"before bar {at + 1}" if at < score.measure_count else "at the end"
    time_map = ((0, time, 0), (time, score.total, time + delta))
    return _commit(
        new,
        [f"{count} empty bar(s) of {new_meter[0]}/{new_meter[1]} inserted {where}"],
        warnings,
        time_map=time_map,
    )


def delete_measures(score: Score, bar: int, count: int = 1) -> OpResult:
    """Delete measures in both voices: notes inside go, a note crossing the start is cut there, a note
    crossing the end keeps its tail as a new attack; chords inside go; the key in effect after the cut
    stays in effect; a section that starts inside moves to the cut, sections left empty disappear."""
    first = _bar_index(score, bar)
    count = _whole(count, "count", 1, score.measure_count - first)
    if count >= score.measure_count:
        raise PlenioValidationError("A score keeps at least one bar (I10).", hint="Delete fewer bars.")
    end = first + count
    start_time, end_time = score.starts[first], score.starts[end]
    delta = end_time - start_time
    tracks = {}
    for kind in ("vocal", "ins"):
        kept, _hit = _carve(score.track(kind), start_time, end_time)
        tracks[kind] = [
            Note(n.onset - delta, n.duration, n.pitch, n.spelling) if n.onset >= end_time else n for n in kept
        ]
    chords = [
        ChordSymbol(ch.onset - delta, ch.name) if ch.onset >= end_time else ch
        for ch in score.chords
        if not start_time <= ch.onset < end_time
    ]
    keys = [k for k in score.keys if k.onset < start_time]
    if end_time < score.total:
        following = score.key_at(end_time)
        before = keys[-1].key if keys else None
        moved = [k for k in score.keys if start_time <= k.onset <= end_time]
        if following != before or (moved and moved[-1].onset == end_time):
            placement = "header" if start_time == 0 else (moved[-1].placement if moved else "field")
            keys.append(KeyChange(start_time, following, placement))
        keys += [KeyChange(k.onset - delta, k.key, k.placement) for k in score.keys if k.onset > end_time]
    sections = [s for s in score.sections if s.measure < first]
    inside = [s for s in score.sections if first <= s.measure <= end]
    if inside and end < score.measure_count:
        last = inside[-1]
        sections.append(Section(first, last.label))
    sections += [Section(s.measure - count, s.label) for s in score.sections if s.measure > end]
    layout = []
    for group_first, group_count in zip(_firsts(score.layout), score.layout, strict=True):
        remaining = sum(1 for m in range(group_first, group_first + group_count) if not first <= m < end)
        if remaining:
            layout.append(remaining)
    origins = _origins(score)
    new = replace(
        score,
        meters=score.meters[:first] + score.meters[end:],
        layout=tuple(layout),
        keys=tuple(keys),
        sections=tuple(sections),
        vocal=tuple(tracks["vocal"]),
        ins=tuple(tracks["ins"]),
        chords=tuple(chords),
        origins=tuple(origins[:first] + origins[end:]),
    )
    removed = [
        f"{_describe(score, kind, n)} removed"
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if start_time <= n.onset and n.end <= end_time
    ]
    change = f"bar(s) {first + 1}-{end} deleted" if count > 1 else f"bar {first + 1} deleted"
    time_map = ((0, start_time, 0), (end_time, score.total, start_time))
    return _commit(new, [change, *removed], time_map=time_map)


def duplicate_measures(score: Score, bar: int, count: int = 1) -> OpResult:
    """Insert a copy of measures ``bar ... bar + count - 1`` right after them (notes, chords, keys).

    A section is copied only when the block holds all of it (duplicating a chorus gives two
    choruses); a copy of part of a section extends that section.
    """
    first = _bar_index(score, bar)
    count = _whole(count, "count", 1, min(MAX_INSERT, score.measure_count - first))
    end = first + count
    start_time, end_time = score.starts[first], score.starts[end]
    delta = end_time - start_time
    layout = _split_layout(score.layout, [first, end])
    firsts = _firsts(layout)
    block = layout[firsts.index(first) : (firsts.index(end) if end < score.measure_count else len(layout))]
    position = firsts.index(end) if end < score.measure_count else len(layout)
    layout[position:position] = block
    tracks = {}
    for kind in ("vocal", "ins"):
        notes = _shift_notes(score.track(kind), end_time, delta)
        copies = [
            Note(
                max(n.onset, start_time) + delta,
                min(n.end, end_time) - max(n.onset, start_time),
                n.pitch,
                n.spelling,
            )
            for n in score.track(kind)
            if n.onset < end_time and n.end > start_time
        ]
        tracks[kind] = sorted([*notes, *copies], key=lambda n: n.onset)
    chords = [ChordSymbol(ch.onset + delta, ch.name) if ch.onset >= end_time else ch for ch in score.chords]
    chords += [
        ChordSymbol(ch.onset + delta, ch.name) for ch in score.chords if start_time <= ch.onset < end_time
    ]
    keys = {k.onset: k for k in score.keys if k.onset < end_time}
    keys.update(
        {
            k.onset + delta: KeyChange(k.onset + delta, k.key, k.placement)
            for k in score.keys
            if k.onset >= end_time
        }
    )
    keys.update(
        {
            k.onset + delta: KeyChange(
                k.onset + delta, k.key, "field" if k.onset == start_time else k.placement
            )
            for k in score.keys
            if start_time <= k.onset < end_time
        }
    )
    opening = score.key_at(start_time)
    if end_time not in keys and score.key_at(end_time - 1) != opening:
        keys[end_time] = KeyChange(end_time, opening, "field")  # the copy starts in the block's opening key
    sections = [Section(s.measure + count, s.label) if s.measure >= end else s for s in score.sections]
    starts = [s.measure for s in score.sections] + [score.measure_count]
    sections += [
        Section(s.measure + count, s.label)
        for i, s in enumerate(score.sections)
        if first <= s.measure and starts[i + 1] <= end  # the whole section lies in the block
    ]
    origins = _origins(score)
    new = replace(
        score,
        meters=score.meters[:end] + score.meters[first:end] + score.meters[end:],
        layout=tuple(layout),
        keys=tuple(keys[o] for o in sorted(keys)),
        sections=tuple(sorted(sections, key=lambda s: s.measure)),
        vocal=tuple(tracks["vocal"]),
        ins=tuple(tracks["ins"]),
        chords=tuple(sorted(chords, key=lambda x: x.onset)),
        origins=tuple(origins[:end] + origins[first:end] + origins[end:]),
    )
    label = f"bars {first + 1}-{end}" if count > 1 else f"bar {first + 1}"
    time_map = ((0, end_time, 0), (start_time, end_time, end_time), (end_time, score.total, end_time + delta))
    return _commit(new, [f"{label} duplicated after bar {end}"], time_map=time_map)


MAX_MEASURES = 1024
"""The longest score an arrangement or a paste may make (measures)."""


def _section_index(starts: Sequence[Section], measure: int) -> int:
    return max(i for i, section in enumerate(starts) if section.measure <= measure)


def _runs(order: Sequence[int]) -> list[tuple[int, int, int]]:
    """``(source first, source end, new first)`` of every stretch of consecutive source measures."""
    runs: list[tuple[int, int, int]] = []
    for new, source in enumerate(order):
        if runs and runs[-1][1] == source and runs[-1][2] + (runs[-1][1] - runs[-1][0]) == new:
            first, _end, start = runs[-1]
            runs[-1] = (first, source + 1, start)
        else:
            runs.append((source, source + 1, new))
    return runs


def arrange_measures(score: Score, order: Sequence[object], *, change: str | None = None) -> OpResult:
    """The score rebuilt from its own measures in ``order`` (0-based; repeats and omissions allowed).

    Every new measure takes the old measure's meter, notes, chords and key; a note that crosses a seam
    between measures that were not neighbours is cut there (its tail in the next block starts anew),
    so no tie leads into another note. A section starts where an old section started and wherever the
    music comes from another section; the line groups follow the old ones and break at every seam.
    """
    count = score.measure_count
    measures = [_whole(m, "measure", 0, count - 1) for m in order]
    if not measures:
        raise PlenioValidationError(
            "A score keeps at least one bar (I10).", hint="Keep at least one section."
        )
    if len(measures) > MAX_MEASURES:
        raise PlenioValidationError(
            f"The score would have {len(measures)} bars; at most {MAX_MEASURES} are supported."
        )
    if measures == list(range(count)):
        return _unchanged(score, "the order did not change")
    starts = score.starts
    meters = tuple(score.meters[m] for m in measures)
    lengths = [n * score.unit.denominator // d for n, d in meters]
    new_starts = [0]
    for length in lengths:
        new_starts.append(new_starts[-1] + length)
    runs = _runs(measures)
    time_map = tuple((starts[a], starts[b], new_starts[new]) for a, b, new in runs)
    tracks: dict[str, list[Note]] = {"vocal": [], "ins": []}
    chords: list[ChordSymbol] = []
    for old_start, old_end, new_start in time_map:
        shift = new_start - old_start
        for kind in ("vocal", "ins"):
            for note in score.track(kind):
                if note.end <= old_start or note.onset >= old_end:
                    continue
                onset, end = max(note.onset, old_start), min(note.end, old_end)
                tracks[kind].append(Note(onset + shift, end - onset, note.pitch, note.spelling))
        chords += [
            ChordSymbol(ch.onset + shift, ch.name) for ch in score.chords if old_start <= ch.onset < old_end
        ]
    # keys: the key in effect at every measure is kept, changes inside a measure move along
    old_keys = {k.onset: k for k in score.keys}
    keys: list[KeyChange] = []
    current: str | None = None
    for new, source in enumerate(measures):
        opening = score.key_at(starts[source])
        if opening != current:
            written = old_keys.get(starts[source])
            placement = "header" if new == 0 else (written.placement if written else "field")
            keys.append(
                KeyChange(new_starts[new], opening, "field" if placement == "header" and new else placement)
            )
            current = opening
        for k in score.keys:
            if starts[source] < k.onset < starts[source + 1]:
                keys.append(KeyChange(k.onset - starts[source] + new_starts[new], k.key, k.placement))
                current = k.key
    if keys and keys[0].placement != "header" and score.keys[0].placement == "header":
        keys[0] = KeyChange(0, keys[0].key, "header")
    # sections: where an old section started, and where the music comes from another section
    old_sections = _section_starts(score)
    explicit_first = bool(score.sections) and score.sections[0].measure == 0
    sections: list[Section] = []
    for new, source in enumerate(measures):
        index = _section_index(old_sections, source)
        starts_here = (
            new == 0
            or old_sections[index].measure == source
            or index != _section_index(old_sections, measures[new - 1])
        )
        if not starts_here:
            continue
        if new == 0 and index == 0 and not explicit_first:
            continue  # the implicit first section stays implicit
        sections.append(Section(new, old_sections[index].label))
    # line groups: the old groups within each run, broken at seams, section starts and meter changes
    old_firsts = set(score.group_firsts)
    cuts = {new for _a, _b, new in runs} | {s.measure for s in sections}
    cuts |= {new for new, source in enumerate(measures) if source in old_firsts}
    cuts |= {i for i in range(1, len(meters)) if meters[i] != meters[i - 1]}
    bounds = sorted(cuts | {0}) + [len(measures)]
    layout = _chunk(b - a for a, b in zip(bounds, bounds[1:], strict=False) if b > a)
    origins = _origins(score)
    new_score = replace(
        score,
        meters=meters,
        layout=tuple(layout),
        keys=tuple(keys),
        sections=tuple(sections),
        vocal=tuple(sorted(tracks["vocal"], key=lambda n: n.onset)),
        ins=tuple(sorted(tracks["ins"], key=lambda n: n.onset)),
        chords=tuple(sorted(chords, key=lambda x: x.onset)),
        origins=tuple(origins[m] for m in measures),
    )
    return _commit(new_score, [change or _measures_change(count, measures)], time_map=time_map)


def _bar_runs(bars: Sequence[int]) -> str:
    """``5-7, 9`` for 1-based bar numbers."""
    ordered = sorted(set(bars))
    runs: list[str] = []
    i = 0
    while i < len(ordered):
        j = i
        while j + 1 < len(ordered) and ordered[j + 1] == ordered[j] + 1:
            j += 1
        runs.append(f"{ordered[i]}-{ordered[j]}" if j > i else str(ordered[i]))
        i = j + 1
    return ", ".join(runs)


def _measures_change(count: int, measures: Sequence[int]) -> str:
    """What an arrangement of bars did, in words (the undo label): deleted, copied or moved bars."""
    removed = [m + 1 for m in range(count) if m not in measures]
    copied = [m + 1 for m in sorted(set(measures)) if measures.count(m) > 1]
    what = []
    if removed:
        what.append(f"deleted {'bar' if len(removed) == 1 else 'bars'} {_bar_runs(removed)}")
    if copied:
        what.append(f"copied {'bar' if len(copied) == 1 else 'bars'} {_bar_runs(copied)}")
    if not removed and not copied:
        what.append("bars moved")
    return f"{'; '.join(what)} ({count} -> {len(measures)} bars)"


def arrange_sections(score: Score, order: Sequence[object]) -> OpResult:
    """The song as a list of its sections (1-based; repeats and omissions allowed): copy, delete and
    move whole sections. See :func:`arrange_measures`."""
    starts = _section_starts(score)
    picked = [_whole(index, "section", 1, len(starts)) - 1 for index in order]
    if not picked:
        raise PlenioValidationError("A score keeps at least one section.", hint="Keep at least one section.")
    bounds = [s.measure for s in starts] + [score.measure_count]
    measures = [m for index in picked for m in range(bounds[index], bounds[index + 1])]
    labels = [starts[i].label for i in picked]
    before = [s.label for s in starts]
    removed = [starts[i].label for i in range(len(starts)) if i not in picked]
    copied = [starts[i].label for i in sorted(set(picked)) if picked.count(i) > 1]
    what = []
    if removed:
        what.append(f"deleted {', '.join(removed)}")
    if copied:
        what.append(f"copied {', '.join(copied)}")
    if not removed and not copied:
        what.append("moved")
    change = f"sections {'; '.join(what)}: {' - '.join(labels)} (was {' - '.join(before)})"
    return arrange_measures(score, measures, change=change)


def _clip_notes(value: object, span: int) -> dict[str, list[tuple[int, int, int]]]:
    if not isinstance(value, list):
        raise PlenioValidationError("The clip needs a list 'notes'.")
    notes: dict[str, list[tuple[int, int, int]]] = {"vocal": [], "ins": []}
    for item in value:
        if not isinstance(item, Mapping):
            raise PlenioValidationError("Every clip note needs track, onset, duration and pitch.")
        track = _track(item.get("track"))
        onset = _whole(item.get("onset"), "onset", 0, span - 1)
        duration = _whole(item.get("duration"), "duration", 1, span - onset)
        notes[track].append((onset, duration, _pitch(item.get("pitch"))))
    for track, items in notes.items():
        items.sort()
        for (a, d, _p), (b, _e, _q) in zip(items, items[1:], strict=False):
            if a + d > b:
                raise PlenioValidationError(f"The clip's {VOICE_OF[track]} notes overlap at onset {b}.")
    return notes


def paste(
    score: Score,
    at: object,
    span: object,
    notes: object,
    chords: object = (),
    *,
    mode: str = "overwrite",
    tracks: Sequence[object] | None = None,
    with_chords: bool | None = None,
    sections: object = (),
) -> OpResult:
    """Paste a clip at ``at`` (Cubase: paste at the cursor).

    The clip's onsets are relative to its start; it lasts ``span`` units and covers the voices in
    ``tracks`` (default: the voices it has notes in) and the chord symbols when ``with_chords`` (default:
    when it has chord symbols). *overwrite*: in the covered voices the notes from ``at`` for ``span`` are
    replaced (silence of the clip included), likewise the chord symbols. *insert* (Cubase: paste time):
    everything from ``at`` on - both voices, chords, keys, sections - first moves later by ``span``
    rounded up to whole bars of the bar at ``at``, then the clip goes into the gap; ``sections`` of the
    clip (``{onset, label}`` at its bar starts) become sections there.
    """
    if mode not in ("overwrite", "insert"):
        raise PlenioValidationError(f"Unknown paste mode {mode!r}.", hint="Use 'overwrite' or 'insert'.")
    at = _whole(at, "at", 0, score.total - 1)
    span = _whole(span, "span", 1, MAX_MEASURES * score.lengths[0] * 4)
    clip = _clip_notes(notes, span)
    clip_chords = []
    for item in chords if isinstance(chords, list | tuple) else []:
        if not isinstance(item, Mapping):
            raise PlenioValidationError("Every clip chord needs onset and name.")
        clip_chords.append(
            (_whole(item.get("onset"), "chord onset", 0, span - 1), _chord_name_checked(item.get("name")))
        )
    covered = [_track(t) for t in tracks] if tracks else [t for t in ("vocal", "ins") if clip[t]]
    take_chords = bool(clip_chords) if with_chords is None else bool(with_chords)
    if not covered and not take_chords:
        raise PlenioValidationError("The clip is empty.", hint="Copy notes or chord symbols first.")
    changes: list[str] = []
    warnings: list[str] = []
    time_map: TimeMap | None = None
    work = score
    if mode == "insert":
        bar = score.measure_at(at)
        length = score.lengths[bar]
        bars = -(-span // length)
        delta = bars * length
        if score.measure_count + bars > MAX_MEASURES:
            raise PlenioValidationError(f"The score would have more than {MAX_MEASURES} bars.")
        bar_start = score.starts[bar]
        sections_after = bar if at == bar_start and at > 0 else bar + 1
        layout = list(score.layout)
        firsts = _firsts(layout)
        group = max(i for i, first in enumerate(firsts) if first <= bar)
        layout = layout[:group] + _chunk([layout[group] + bars]) + layout[group + 1 :]
        moved_sections = [
            Section(s.measure + bars, s.label) if s.measure >= sections_after else s for s in score.sections
        ]
        origins = _origins(score)
        work = replace(
            score,
            meters=score.meters[: bar + 1] + (score.meters[bar],) * bars + score.meters[bar + 1 :],
            layout=tuple(layout),
            keys=tuple(
                k if k.onset < at or k.onset == 0 else KeyChange(k.onset + delta, k.key, k.placement)
                for k in score.keys
            ),
            sections=tuple(moved_sections),
            vocal=tuple(_shift_notes(score.vocal, at, delta)),
            ins=tuple(_shift_notes(score.ins, at, delta)),
            chords=tuple(
                ChordSymbol(ch.onset + delta, ch.name) if ch.onset >= at else ch for ch in score.chords
            ),
            origins=tuple(origins[: bar + 1] + [None] * bars + origins[bar + 1 :]),
        )
        clip_sections = []
        for item in sections if isinstance(sections, list | tuple) else []:
            if isinstance(item, Mapping):
                onset = _whole(item.get("onset"), "section onset", 0, span - 1)
                clip_sections.append((at + onset, section_label(str(item.get("label", "")))))
        new_sections = list(work.sections)
        for onset, label in clip_sections:
            if onset in work.starts:
                measure = work.starts.index(onset)
                new_sections = [s for s in new_sections if s.measure != measure] + [Section(measure, label)]
        cuts = [s.measure for s in new_sections] + [
            i for i in range(1, work.measure_count) if work.meters[i] != work.meters[i - 1]
        ]
        work = replace(
            work,
            sections=tuple(sorted(new_sections, key=lambda s: s.measure)),
            layout=tuple(_chunk(_split_layout(work.layout, cuts))),
        )
        time_map = ((0, at, 0), (at, score.total, at + delta))
        changes.append(
            f"{bars} bar(s) inserted at {_bar(score, at)} (everything after moved {bars} bar(s) later)"
        )
    end = min(at + span, work.total)
    if at + span > work.total:
        warnings.append("the clip was longer than the rest of the score and was cut at the end")
    tracks_out = {kind: list(work.track(kind)) for kind in ("vocal", "ins")}
    select: list[str] = []
    for kind in covered:
        kept, _hit = _carve(tracks_out[kind], at, end)
        added = []
        for onset, duration, pitch in clip[kind]:
            start = at + onset
            if start >= end:
                continue
            added.append(Note(start, min(duration, end - start), pitch))
            select.append(note_id(kind, start))
        tracks_out[kind] = sorted([*kept, *added], key=lambda n: n.onset)
    new_chords = list(work.chords)
    if take_chords:
        new_chords = [ch for ch in new_chords if not at <= ch.onset < end]
        for onset, name in clip_chords:
            if at + onset < end:
                new_chords.append(ChordSymbol(at + onset, name))
                select.append(chord_id(at + onset))
    result = replace(
        work,
        vocal=tuple(tracks_out["vocal"]),
        ins=tuple(tracks_out["ins"]),
        chords=tuple(sorted(new_chords, key=lambda x: x.onset)),
    )
    voices = " and ".join(VOICE_OF[k] for k in covered)
    what = voices + (
        " with chord symbols" if take_chords and voices else "chord symbols" if take_chords else ""
    )
    changes.append(
        f"pasted at {_bar(score, at) if mode == 'overwrite' else _bar(result, at)}: {what} ({mode})"
    )
    return _commit(result, changes, warnings, select, time_map=time_map)


def change_meter(score: Score, bar: int, count: int, meter: tuple[int, int]) -> OpResult:
    """Give empty measures a new meter (music is never re-barred in this release)."""
    first = _bar_index(score, bar)
    count = _whole(count, "count", 1, score.measure_count - first)
    numerator, denominator = _checked_meter(score, meter)
    end = first + count
    start_time, end_time = score.starts[first], score.starts[end]
    busy = [
        f"{_describe(score, kind, n)}"
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if n.onset < end_time and n.end > start_time
    ]
    busy += [f"chord {ch.name}" for ch in score.chords if start_time <= ch.onset < end_time]
    busy += [f"key change to {k.key}" for k in score.keys if start_time < k.onset < end_time]
    if busy:
        raise PlenioValidationError(
            f"Only empty bars can change their meter; bars {first + 1}-{end} contain {', '.join(busy[:3])}.",
            hint="Delete the notes first, or insert new bars with the meter you need.",
        )
    new_meter = (numerator, denominator)
    if all(m == new_meter for m in score.meters[first:end]):
        return _unchanged(score, "no meter changed")
    delta = count * (numerator * score.unit.denominator // denominator) - (end_time - start_time)
    meters = score.meters[:first] + (new_meter,) * count + score.meters[end:]
    cuts = [m for m in (first, end) if 0 < m < len(meters) and meters[m] != meters[m - 1]]
    new = replace(
        score,
        meters=meters,
        layout=tuple(_split_layout(score.layout, cuts)),
        keys=tuple(
            KeyChange(k.onset + delta, k.key, k.placement) if k.onset >= end_time else k for k in score.keys
        ),
        vocal=tuple(
            Note(n.onset + delta, n.duration, n.pitch, n.spelling) if n.onset >= end_time else n
            for n in score.vocal
        ),
        ins=tuple(
            Note(n.onset + delta, n.duration, n.pitch, n.spelling) if n.onset >= end_time else n
            for n in score.ins
        ),
        chords=tuple(
            ChordSymbol(ch.onset + delta, ch.name) if ch.onset >= end_time else ch for ch in score.chords
        ),
    )
    return _commit(new, [f"bars {first + 1}-{end}: meter {numerator}/{denominator}"])


# --- keys, tempo, transposition ---------------------------------------------------------


def put_key(score: Score, onset: int, key: str) -> OpResult:
    """A key change at ``onset`` (a group start: field line; elsewhere inline). Pitches are kept;
    the notes up to the next key change are re-spelled for the new key."""
    onset = _whole(onset, "onset", 0, score.total - 1)
    if key not in upstream.KEYS:
        raise PlenioValidationError(
            f"Unsupported key {key!r}.", hint="Use a major (C, F#, Bb ...) or minor (Am, C#m ...) key."
        )
    if score.key_at(onset) == key:
        return _unchanged(score, "no key changed")
    groups = {score.starts[g] for g in score.group_firsts}
    placement = "header" if onset == 0 else "field" if onset in groups else "inline"
    keys = sorted(
        [*(k for k in score.keys if k.onset != onset), KeyChange(onset, key, placement)],
        key=lambda k: k.onset,
    )
    following = next((k.onset for k in keys if k.onset > onset), score.total)
    new = replace(
        score,
        keys=tuple(keys),
        vocal=tuple(_respell(score.vocal, onset, following)),
        ins=tuple(_respell(score.ins, onset, following)),
    )
    return _commit(new, [f"{_bar(score, onset)}: key {score.key_at(onset)} -> {key}"])


def delete_key(score: Score, onset: int) -> OpResult:
    onset = _whole(onset, "onset", 1, score.total - 1)
    change = next((k for k in score.keys if k.onset == onset), None)
    if change is None:
        raise PlenioValidationError(
            f"There is no key change at onset {onset}.",
            hint="The first key cannot be removed; change it instead.",
        )
    keys = tuple(k for k in score.keys if k.onset != onset)
    following = next((k.onset for k in keys if k.onset > onset), score.total)
    new = replace(
        score,
        keys=keys,
        vocal=tuple(_respell(score.vocal, onset, following)),
        ins=tuple(_respell(score.ins, onset, following)),
    )
    return _commit(new, [f"{_bar(score, onset)}: key change to {change.key} removed"])


def change_tempo(score: Score, bpm: int) -> OpResult:
    bpm = _whole(bpm, "bpm", 20, 300)
    if bpm == score.tempo:
        return _unchanged(score, "no tempo changed")
    return _commit(replace(score, tempo=bpm), [f"tempo {score.tempo} -> {bpm} BPM"])


def transpose_by(score: Score, semitones: int) -> OpResult:
    """Transpose notes, chord symbols and keys; every note is re-spelled for its new key."""
    semitones = _whole(semitones, "semitones", -24, 24)
    if semitones == 0:
        return _unchanged(score, "no transposition")
    for kind in ("vocal", "ins"):
        for note in score.track(kind):
            if not 0 <= note.pitch + semitones <= 127:
                raise PlenioValidationError(
                    f"Transposing moves {_describe(score, kind, note)} outside the MIDI range."
                )
    keys = tuple(KeyChange(k.onset, _transpose_key(k.key, semitones), k.placement) for k in score.keys)
    moved = replace(score, keys=keys)
    chords = tuple(
        ChordSymbol(ch.onset, _chord_name(ch.name, semitones, moved.key_at(ch.onset))) for ch in score.chords
    )
    new = replace(
        moved,
        chords=chords,
        vocal=tuple(Note(n.onset, n.duration, n.pitch + semitones) for n in score.vocal),
        ins=tuple(Note(n.onset, n.duration, n.pitch + semitones) for n in score.ins),
    )
    return _commit(new, [f"transposed by {semitones:+d} semitones; key {score.keys[0].key} -> {keys[0].key}"])


# --- sections ---------------------------------------------------------------------------


def _section_starts(score: Score) -> list[Section]:
    """The sections including the implicit first one (``untitled``) when bar 1 has none."""
    sections = list(score.sections)
    if not sections or sections[0].measure != 0:
        sections.insert(0, Section(0, "untitled"))
    return sections


def rename_section_at(score: Score, bar: int, label: str) -> OpResult:
    first = _bar_index(score, bar)
    new_label = section_label(label)
    current = next((s for s in _section_starts(score) if s.measure == first), None)
    if current is None:
        raise PlenioValidationError(
            f"No section starts at bar {first + 1}.", hint="Select the first bar of a section."
        )
    sections = [s for s in score.sections if s.measure != first] + [Section(first, new_label)]
    return _commit(
        replace(score, sections=tuple(sorted(sections, key=lambda s: s.measure))),
        [f"section at bar {first + 1}: {current.label} -> {new_label}"],
    )


def start_section(score: Score, bar: int, label: str) -> OpResult:
    """A new section from ``bar`` (the line group is split there when needed)."""
    first = _bar_index(score, bar)
    new_label = section_label(label)
    if first == 0:
        return rename_section_at(score, bar, label)
    if any(s.measure == first for s in score.sections):
        raise PlenioValidationError(f"A section already starts at bar {first + 1}; rename it instead.")
    sections = sorted([*score.sections, Section(first, new_label)], key=lambda s: s.measure)
    new = replace(score, layout=tuple(_split_layout(score.layout, [first])), sections=tuple(sections))
    return _commit(new, [f"new section {new_label} from bar {first + 1}"])


def remove_section(score: Score, bar: int) -> OpResult:
    """Join the section starting at ``bar`` to the one before it."""
    first = _bar_index(score, bar)
    if first == 0:
        raise PlenioValidationError("The first section has no section before it.")
    section = next((s for s in score.sections if s.measure == first), None)
    if section is None:
        raise PlenioValidationError(f"No section starts at bar {first + 1}.")
    previous = [s for s in _section_starts(score) if s.measure < first][-1]
    return _commit(
        replace(score, sections=tuple(s for s in score.sections if s.measure != first)),
        [f"section {section.label} joined to {previous.label}"],
    )


def move_section_start(score: Score, bar: int, to_bar: int) -> OpResult:
    """Let the section starting at ``bar`` start at ``to_bar`` instead (each section keeps a bar)."""
    first = _bar_index(score, bar)
    target = _bar_index(score, to_bar)
    starts = _section_starts(score)
    index = next((i for i, s in enumerate(starts) if s.measure == first), None)
    if index is None or first == 0:
        raise PlenioValidationError("Select the first bar of a section after the first one.")
    low = starts[index - 1].measure + 1
    high = (starts[index + 1].measure if index + 1 < len(starts) else score.measure_count) - 1
    if not low <= target <= high:
        raise PlenioValidationError(
            f"This section can start at bar {low + 1} ... {high + 1}.",
            hint="Each section keeps at least one bar.",
        )
    if target == first:
        return _unchanged(score, "no boundary moved")
    label = starts[index].label
    sections = [s for s in score.sections if s.measure != first] + [Section(target, label)]
    new = replace(
        score,
        layout=tuple(_split_layout(score.layout, [target])),
        sections=tuple(sorted(sections, key=lambda s: s.measure)),
    )
    return _commit(new, [f"section {label} now starts at bar {target + 1} (was {first + 1})"])


# --- dispatch ---------------------------------------------------------------------------


def _ids(operation: Mapping[str, Any]) -> list[object]:
    value = operation.get("ids", [operation["id"]] if "id" in operation else None)
    if not isinstance(value, list) or not value:
        raise PlenioValidationError("The operation needs the ids of the selected notes.")
    return value


def _meter(value: object) -> tuple[int, int]:
    if isinstance(value, str) and "/" in value:
        numerator, _, denominator = value.partition("/")
        if numerator.isdigit() and denominator.isdigit():
            return int(numerator), int(denominator)
    if isinstance(value, list | tuple) and len(value) == 2:
        return _whole(value[0], "meter numerator"), _whole(value[1], "meter denominator")
    raise PlenioValidationError("The operation needs a meter such as '3/4'.")


def _int(operation: Mapping[str, Any], name: str, default: int | None = None) -> int:
    value = operation.get(name, default)
    if value is None:
        raise PlenioValidationError(f"The operation needs a whole number '{name}'.")
    return _whole(value, name)


def _opt_int(operation: Mapping[str, Any], name: str) -> int | None:
    return None if operation.get(name) is None else _int(operation, name)


def _str(operation: Mapping[str, Any], name: str) -> str:
    value = operation.get(name)
    if not isinstance(value, str):
        raise PlenioValidationError(f"The operation needs a text '{name}'.")
    return value


def _list(operation: Mapping[str, Any], name: str) -> list[object]:
    value = operation.get(name)
    if not isinstance(value, list):
        raise PlenioValidationError(f"The operation needs a list '{name}'.")
    return value


def _opt_track(operation: Mapping[str, Any]) -> str | None:
    return None if operation.get("track") is None else _track(operation.get("track"))


Operation = Callable[[Score, Mapping[str, Any]], OpResult]

OPERATIONS: dict[str, Operation] = {
    # notes
    "delete": lambda s, op: delete(s, _ids(op)),
    "delete_close_gap": lambda s, op: delete_close_gap(s, _ids(op)),
    "insert_note": lambda s, op: insert_note(
        s, _track(op.get("track")), _int(op, "onset"), _int(op, "duration"), _int(op, "pitch")
    ),
    "move_notes": lambda s, op: move_notes(
        s, _ids(op), delta=_int(op, "delta", 0), semitones=_int(op, "semitones", 0), track=_opt_track(op)
    ),
    "resize_note": lambda s, op: resize_note(
        s, _ids(op)[0], _int(op, "duration"), mode=str(op.get("mode", "rests"))
    ),
    "set_note_pitch": lambda s, op: set_note_pitch(
        s, _ids(op), midi=_opt_int(op, "midi"), semitones=_opt_int(op, "semitones")
    ),
    "split_note": lambda s, op: split_note(s, _ids(op)[0], _int(op, "at")),
    "join_notes": lambda s, op: join_notes(s, _ids(op)),
    "fill_rest": lambda s, op: fill_rest(
        s, _track(op.get("track")), _int(op, "onset"), pitch=_opt_int(op, "pitch")
    ),
    # chord symbols
    "put_chord": lambda s, op: put_chord(s, _int(op, "onset"), _str(op, "name")),
    "move_chord": lambda s, op: move_chord(s, _int(op, "onset"), _int(op, "to")),
    "place_notes": lambda s, op: place_notes(
        s,
        _str(op, "track"),
        op.get("notes", []) if isinstance(op.get("notes"), list) else [],
        clear=op.get("clear") if isinstance(op.get("clear"), list) and len(op["clear"]) == 2 else None,
        label=str(op.get("label", ""))[:40],
    ),
    "quantize": lambda s, op: quantize(
        s, op.get("ids", []), _int(op, "grid"), lengths=op.get("lengths") is True
    ),
    "delete_chord": lambda s, op: delete_chord(s, _int(op, "onset")),
    # measures
    "insert_measures": lambda s, op: insert_measures(
        s, _int(op, "bar"), _int(op, "count", 1), meter=_meter(op["meter"]) if op.get("meter") else None
    ),
    "delete_measures": lambda s, op: delete_measures(s, _int(op, "bar"), _int(op, "count", 1)),
    "duplicate_measures": lambda s, op: duplicate_measures(s, _int(op, "bar"), _int(op, "count", 1)),
    "arrange_sections": lambda s, op: arrange_sections(s, _list(op, "order")),
    "arrange_measures": lambda s, op: arrange_measures(s, _list(op, "order")),
    "paste": lambda s, op: paste(
        s,
        op.get("at"),
        op.get("span"),
        op.get("notes", []),
        op.get("chords", []),
        mode=str(op.get("mode", "overwrite")),
        tracks=op.get("tracks") if isinstance(op.get("tracks"), list) else None,
        with_chords=op.get("with_chords") if isinstance(op.get("with_chords"), bool) else None,
        sections=op.get("sections", []),
    ),
    "change_meter": lambda s, op: change_meter(
        s, _int(op, "bar"), _int(op, "count", 1), _meter(op.get("meter"))
    ),
    # keys, tempo, transposition
    "put_key": lambda s, op: put_key(s, _int(op, "onset"), _str(op, "key")),
    "delete_key": lambda s, op: delete_key(s, _int(op, "onset")),
    "change_tempo": lambda s, op: change_tempo(s, _int(op, "bpm")),
    "transpose_by": lambda s, op: transpose_by(s, _int(op, "semitones")),
    # sections
    "rename_section_at": lambda s, op: rename_section_at(s, _int(op, "bar"), _str(op, "label")),
    "start_section": lambda s, op: start_section(s, _int(op, "bar"), _str(op, "label")),
    "remove_section": lambda s, op: remove_section(s, _int(op, "bar")),
    "move_section_start": lambda s, op: move_section_start(s, _int(op, "bar"), _int(op, "to_bar")),
}


def apply(score: Score, operation: Mapping[str, Any]) -> OpResult:
    name = operation.get("op")
    if name not in OPERATIONS:
        raise PlenioValidationError(
            f"Unknown score operation {name!r}.", hint=f"Use one of {sorted(OPERATIONS)}."
        )
    return OPERATIONS[str(name)](score, operation)


def transform(text: str, operation: Mapping[str, Any]) -> TextResult:
    """Read ``text``, apply one operation, write the new text (checked: it re-parses to the new score).

    An operation that changes nothing returns the text unchanged."""
    score = c.from_abc(text)
    result = apply(score, operation)
    if result.score is score:
        return TextResult(text, result)
    return TextResult(c.to_abc(result.score), result)


__all__ = [
    "OPERATIONS",
    "OpResult",
    "TextResult",
    "apply",
    "arrange_measures",
    "arrange_sections",
    "change_meter",
    "change_tempo",
    "chord_id",
    "delete",
    "delete_chord",
    "delete_close_gap",
    "delete_key",
    "delete_measures",
    "duplicate_measures",
    "fill_rest",
    "insert_measures",
    "insert_note",
    "join_notes",
    "move_chord",
    "move_notes",
    "move_section_start",
    "note_id",
    "paste",
    "parse_id",
    "place_notes",
    "put_chord",
    "put_key",
    "quantize",
    "remove_section",
    "rename_section_at",
    "resize_note",
    "set_note_pitch",
    "split_note",
    "start_section",
    "transform",
    "transpose_by",
]
