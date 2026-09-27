"""The canonical score model of the native two-voice dialect (next-release plan §9).

A :class:`Score` holds the musical content of a score and nothing else: tempo, unit ``L``,
the meter of every measure, key changes, sections, the grouping of measures into lines
(``layout``), the sounding notes of the two voices with integer onsets and durations in
``L`` units, and the chord symbols. Ties do not exist in the model - a sounding note is one
note, however many bar lines, chord onsets or key changes it crosses. The ABC text stays the
persisted document (YuE2 tokenizes it verbatim); a model is never stored.

``from_abc(text)`` accepts exactly what the vendored upstream parser accepts, except
measures whose length is not a whole number of ``L`` units (§9.2), and keeps the original
text in a private source map. ``to_abc(score)`` writes the text back:

- a measure whose content (and context: meter, key at its start, the tie entering it) is
  unchanged is copied verbatim, and so are unchanged comment and field lines; hence
  ``to_abc(from_abc(T)) == T`` for every accepted ``T`` in the Song Sheet's normal form
  (S2), and an edit rewrites only what it changed (S5);
- every other measure is written in the native style (S7): accidentals only where the key
  and the measure's by-letter state need them, notes split with ties at bar lines, chord
  onsets and inline key changes, durations decomposed greedily into supported values, rests
  merged, an empty measure as ``Z`` and runs of them as ``Z2`` ... ``Z4``;
- the result must pass the upstream parser and re-parse to the same model (S6). If the
  locality-preserving text does not (possible only for exotic accepted-not-canonical source
  texts), the score is written canonically and checked again; a second failure is an
  internal error and the text is refused.

Musical equality is ``==``: spellings, key-change placements, the source map and the
measure origins are presentation and do not take part.
"""

from __future__ import annotations

import re
from bisect import bisect_left, bisect_right
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field, replace
from fractions import Fraction
from functools import cached_property
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioError, PlenioValidationError
from .native import _diagnostic_from, _note_text, _spell

VOICES: tuple[str, str] = ("Vocal", "Ins")
TRACKS: tuple[str, str] = ("vocal", "ins")
DURATIONS: tuple[int, ...] = tuple(sorted(upstream.DURATIONS, reverse=True))
PLACEMENTS = ("header", "field", "inline")
MAX_GROUP = 4
MAX_UNIT = 1024
HEADER_VOICE_LINES = (
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"',
    'V: Ins clef=treble name="Ins Melody" snm="Inst."',
)
_ACCIDENTAL_VALUE = {"=": 0, "_": -1, "__": -2, "^": 1, "^^": 2}
_ACCIDENTAL_TEXT = {-2: "__", -1: "_", 0: "=", 1: "^", 2: "^^"}
_LETTER_OF = {0: "C", 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 11: "B"}
_REST_RUN = re.compile(r"Z([2-4])?")
# Characters str.splitlines() breaks on (the upstream parser splits lines with it).
_BREAKS = frozenset("\n\r\x0b\x0c\x1c\x1d\x1e\x85  ")
_SIGNATURES: dict[str, dict[str, int]] = {}


def _signature(key: str) -> dict[str, int]:
    signature = _SIGNATURES.get(key)
    if signature is None:
        signature = _SIGNATURES[key] = upstream.key_accidentals(key)
    return signature


def _power_of_two(value: int) -> bool:
    return value > 0 and value & (value - 1) == 0


# --- errors -----------------------------------------------------------------------------


class ScoreSyntaxError(PlenioValidationError):
    """The text is not in the supported dialect; ``diagnostics`` locate the problem."""


class ScoreModelError(PlenioValidationError):
    """A model breaks an invariant of plan §9.5 (an operation or an importer made it)."""


class ScoreInternalError(PlenioError):
    """The serializer produced a text that does not re-parse to the model; nothing is committed."""


def _syntax_error(text: str, message: str) -> ScoreSyntaxError:
    return ScoreSyntaxError(
        "The score is not valid native two-voice ABC.",
        diagnostics=[_diagnostic_from(message, text).to_dict()],
        hint="Fix the reported bar, or undo to the last valid score.",
    )


# --- the model --------------------------------------------------------------------------


@dataclass(frozen=True)
class Note:
    """A sounding note: ``onset`` and ``duration`` in ``L`` units, ``pitch`` a MIDI number."""

    onset: int
    duration: int
    pitch: int
    spelling: int | None = field(default=None, compare=False)
    """MIDI number of the written letter and octave (without accidental); presentation only."""

    @property
    def end(self) -> int:
        return self.onset + self.duration


@dataclass(frozen=True)
class KeyChange:
    onset: int
    key: str
    placement: str = field(default="inline", compare=False)
    """``header`` (onset 0), ``field`` (a ``K:`` line at a group start) or ``inline``; presentation.
    A ``field`` (or ``header``) change where no group starts is written inline."""


@dataclass(frozen=True)
class ChordSymbol:
    onset: int
    name: str


@dataclass(frozen=True)
class Section:
    measure: int
    """0-based index of the measure the section starts at (always a group start)."""
    label: str


@dataclass(frozen=True)
class Score:
    """An immutable, structurally valid score (``validate`` checks the invariants)."""

    tempo: int
    unit: Fraction
    meters: tuple[tuple[int, int], ...]
    keys: tuple[KeyChange, ...]
    sections: tuple[Section, ...]
    layout: tuple[int, ...]
    vocal: tuple[Note, ...]
    ins: tuple[Note, ...]
    chords: tuple[ChordSymbol, ...]
    source: Source | None = field(default=None, compare=False, repr=False)
    origins: tuple[int | None, ...] | None = field(default=None, compare=False, repr=False)
    """Source measure of every measure (``None`` = identity); lets moved measures keep their text."""

    # -- derived -------------------------------------------------------------------------

    @cached_property
    def lengths(self) -> tuple[int, ...]:
        """Length of every measure in units."""
        denominator = self.unit.denominator
        return tuple(n * denominator // d for n, d in self.meters)

    @cached_property
    def starts(self) -> tuple[int, ...]:
        """Onset of every measure plus the end of the score (``len(meters) + 1`` values)."""
        result = [0]
        for length in self.lengths:
            result.append(result[-1] + length)
        return tuple(result)

    @property
    def total(self) -> int:
        return self.starts[-1]

    @property
    def measure_count(self) -> int:
        return len(self.meters)

    @cached_property
    def group_firsts(self) -> tuple[int, ...]:
        firsts, cursor = [], 0
        for count in self.layout:
            firsts.append(cursor)
            cursor += count
        return tuple(firsts)

    @property
    def units_per_quarter(self) -> int:
        return self.unit.denominator // 4 if self.unit.denominator >= 4 else 0

    def measure_at(self, onset: int) -> int:
        """Index of the measure that contains ``onset`` (the last measure for ``onset == total``)."""
        return max(0, min(bisect_right(self.starts, onset) - 1, self.measure_count - 1))

    def key_at(self, onset: int) -> str:
        """The key in effect at ``onset`` (the last key change at or before it)."""
        index = bisect_right([k.onset for k in self.keys], onset) - 1
        return self.keys[max(index, 0)].key

    def track(self, name: str) -> tuple[Note, ...]:
        if name in ("vocal", "Vocal"):
            return self.vocal
        if name in ("ins", "Ins"):
            return self.ins
        raise PlenioValidationError(f"Unknown track {name!r}; use 'vocal' or 'ins'.")

    def with_track(self, name: str, notes: Iterable[Note]) -> Score:
        ordered = tuple(sorted(notes, key=lambda n: n.onset))
        if name in ("vocal", "Vocal"):
            return replace(self, vocal=ordered)
        if name in ("ins", "Ins"):
            return replace(self, ins=ordered)
        raise PlenioValidationError(f"Unknown track {name!r}; use 'vocal' or 'ins'.")

    def origin(self, measure: int) -> int | None:
        """The source measure whose text ``measure`` may reuse (``None`` = new measure)."""
        if self.source is None:
            return None
        if self.origins is not None:
            return self.origins[measure] if measure < len(self.origins) else None
        return measure if measure < self.source.model.measure_count else None

    def seconds(self, units: int | Fraction) -> float:
        """Nominal seconds of ``units`` at the score's tempo."""
        return float(Fraction(units) * self.unit * 4 * 60 / self.tempo)

    @cached_property
    def _index(self) -> _Index:
        return _Index(self)


class _Index:
    """Lookups by time (bisection over the sorted events of a score)."""

    def __init__(self, score: Score):
        self.notes = (score.vocal, score.ins)
        self.onsets = ([n.onset for n in score.vocal], [n.onset for n in score.ins])
        self.chords = score.chords
        self.chord_onsets = [c.onset for c in score.chords]
        self.keys = score.keys
        self.key_onsets = [k.onset for k in score.keys]

    def overlapping(self, voice: int, start: int, end: int) -> Sequence[Note]:
        notes, onsets = self.notes[voice], self.onsets[voice]
        low = bisect_left(onsets, start)
        if low > 0 and notes[low - 1].end > start:
            low -= 1
        return notes[low : bisect_left(onsets, end)]

    def chords_in(self, start: int, end: int) -> Sequence[ChordSymbol]:
        return self.chords[bisect_left(self.chord_onsets, start) : bisect_left(self.chord_onsets, end)]

    def keys_in(self, start: int, end: int) -> Sequence[KeyChange]:
        return self.keys[bisect_left(self.key_onsets, start) : bisect_left(self.key_onsets, end)]


# --- the source map ---------------------------------------------------------------------


@dataclass(frozen=True)
class _Slot:
    """One measure of one voice as written in the source text."""

    raw: str
    """The text between the bar lines, spaces included (a ``Z2``...``Z4`` run: the whole run)."""
    run: int
    part: int
    tie_in: tuple[int, int] | None
    """``(pitch, written)`` of the tied note entering the measure."""
    tie_out: tuple[int, int] | None
    inline_key: bool


@dataclass(frozen=True)
class _SourceGroup:
    first: int
    count: int
    comments: tuple[str, ...]
    fields: tuple[tuple[str, ...], tuple[str, ...]]


@dataclass(frozen=True)
class Source:
    """The text a score was read from, measure by measure (private to the serializer)."""

    text: str
    header_meter: str
    header_key: str
    slots: tuple[tuple[_Slot, ...], tuple[_Slot, ...]]
    groups: tuple[_SourceGroup, ...]
    trailing_newline: bool
    model: Score
    """The model read from ``text`` (without a source): the reference for "unchanged"."""

    @cached_property
    def group_at(self) -> dict[int, _SourceGroup]:
        return {group.first: group for group in self.groups}

    @cached_property
    def plan(self) -> dict[int, str]:
        return _key_plan(self.model)

    @cached_property
    def fingerprints(self) -> tuple[tuple[Any, ...], tuple[Any, ...]]:
        model, plan = self.model, self.plan
        return (
            tuple(_fingerprint(model, plan, 0, m) for m in range(model.measure_count)),
            tuple(_fingerprint(model, plan, 1, m) for m in range(model.measure_count)),
        )

    @cached_property
    def required(self) -> dict[int, tuple[Any, ...]]:
        return {group.first: _required_fields(self.model, self.plan, group.first) for group in self.groups}


# --- reading ----------------------------------------------------------------------------


def _comment_label(comments: Sequence[str], previous: str | None) -> str:
    names = [line[2:].strip() for line in comments]
    return next((name for name in reversed(names) if name), previous or "untitled")


def from_abc(text: str) -> Score:
    """The model of ``text``; raises :class:`ScoreSyntaxError` with located diagnostics."""
    if not isinstance(text, str) or not text.strip():
        raise ScoreSyntaxError(
            "The score is empty.", diagnostics=[{"severity": "error", "message": "The score is empty."}]
        )
    try:
        parsed = upstream.parse_abc(text)
    except upstream.AbcError as error:
        raise _syntax_error(text, str(error)) from error
    return _Reader(text, parsed).read()


class _Reader:
    def __init__(self, text: str, parsed: upstream.Score):
        self.text = text
        self.parsed = parsed
        self.lines = text.splitlines()
        self.unit = Fraction(parsed.unit)
        self.denominator = self.unit.denominator
        self.meters: list[tuple[int, int]] = []
        self.starts: list[int] = [0]

    def _add_measure(self, meter: tuple[int, int], group: int) -> None:
        n, d = meter
        if (n * self.denominator) % d:
            message = (
                f"group {group}, Vocal, bar {len(self.meters) + 1}: the meter {n}/{d} is not a whole number "
                f"of L:1/{self.denominator} units; such measures are outside the supported subset"
            )
            error = _syntax_error(self.text, message)
            error.hint = f"Use a finer unit (for example L:1/{max(d, self.denominator)}) or another meter."
            raise error
        self.meters.append(meter)
        self.starts.append(self.starts[-1] + n * self.denominator // d)

    def read(self) -> Score:
        lines = self.lines
        header_meter = upstream.meter_value(lines[2][2:])
        header_key = lines[7][2:]
        meter = [header_meter, header_meter]
        key = [header_key, header_key]
        key_events: list[list[tuple[int, str, str]]] = [
            [(0, header_key, "header")],
            [(0, header_key, "header")],
        ]
        notes: list[list[list[int]]] = [[], []]  # [onset, duration, pitch, written]
        pending: list[tuple[int, int] | None] = [None, None]
        chords: dict[int, str] = {}
        slots: list[list[_Slot]] = [[], []]
        groups: list[_SourceGroup] = []
        sections: list[Section] = []
        layout: list[int] = []
        label: str | None = None
        cursor = 8
        while cursor < len(lines):
            comments: list[str] = []
            while lines[cursor].startswith("% "):
                comments.append(lines[cursor])
                cursor += 1
            first = len(self.meters)
            if comments:
                label = _comment_label(comments, label)
                sections.append(Section(first, label))
            fields: tuple[list[str], list[str]] = ([], [])
            count = 0
            for voice in (0, 1):
                cursor += 1  # "V: <voice>"
                while cursor < len(lines) and lines[cursor].startswith(("M:", "K:")):
                    line = lines[cursor]
                    fields[voice].append(line)
                    name, value = line.split(":", 1)
                    if name == "M":
                        meter[voice] = upstream.meter_value(value)
                    else:
                        key[voice] = value
                        key_events[voice].append((self.starts[first], value, "field"))
                    cursor += 1
                music = lines[cursor]
                cursor += 1
                measure = first
                for raw in music[:-1].split("|"):
                    body = raw.strip()
                    run = _REST_RUN.fullmatch(body)
                    span = int(run.group(1) or "1") if run else 1
                    for part in range(span):
                        if voice == 0:
                            self._add_measure(meter[0], len(groups) + 1)
                        tie_in = pending[voice]
                        inline = False
                        if not run:
                            inline = self._walk(
                                body, voice, self.starts[measure], key, key_events, notes, pending, chords
                            )
                        slots[voice].append(_Slot(raw, span, part, tie_in, pending[voice], inline))
                        measure += 1
                count = measure - first
            groups.append(_SourceGroup(first, count, tuple(comments), (tuple(fields[0]), tuple(fields[1]))))
            layout.append(count)
        effective: dict[int, KeyChange] = {}
        for onset, name, placement in key_events[0]:
            effective[onset] = KeyChange(onset, name, placement)  # the last one at an onset wins
        model = Score(
            tempo=int(self.parsed.bpm),
            unit=self.unit,
            meters=tuple(self.meters),
            keys=tuple(effective[onset] for onset in sorted(effective)),
            sections=tuple(sections),
            layout=tuple(layout),
            vocal=tuple(Note(o, d, p, w) for o, d, p, w in notes[0]),
            ins=tuple(Note(o, d, p, w) for o, d, p, w in notes[1]),
            chords=tuple(ChordSymbol(onset, chords[onset]) for onset in sorted(chords)),
        )
        self._cross_check(model)
        source = Source(
            text=self.text,
            header_meter=lines[2][2:],
            header_key=header_key,
            slots=(tuple(slots[0]), tuple(slots[1])),
            groups=tuple(groups),
            trailing_newline=self.text.endswith(("\n", "\r")),
            model=model,
        )
        return replace(model, source=source)

    def _walk(
        self,
        body: str,
        voice: int,
        start: int,
        key: list[str],
        key_events: list[list[tuple[int, str, str]]],
        notes: list[list[list[int]]],
        pending: list[tuple[int, int] | None],
        chords: dict[int, str],
    ) -> bool:
        """Read one measure's tokens exactly like the upstream parser; ``True`` if it has an inline key."""
        local: dict[str, int] = {}
        offset = start
        inline = False
        cursor = 0
        while cursor < len(body):
            if body[cursor].isspace():
                cursor += 1
                continue
            match = upstream.TOKEN.match(body, cursor)
            assert match is not None  # the upstream parser accepted the text
            cursor = match.end()
            if match.group("chord") is not None:
                chords[offset] = match.group("chord")
                continue
            if match.group("key") is not None:
                key[voice] = match.group("key")
                key_events[voice].append((offset, key[voice], "inline"))
                local = {}
                inline = True
                continue
            note, accidental, octave, tie = match.group("note", "acc", "oct", "tie")
            units = int(match.group("duration") or "1")
            if note == "z":
                offset += units
                continue
            letter = note.upper()
            written = (
                60
                + int(upstream.NATURAL[letter])
                + (12 if note.islower() else 0)
                + 12 * (octave.count("'") - octave.count(","))
            )
            alteration = local.get(letter, _signature(key[voice])[letter])
            if accidental:
                alteration = _ACCIDENTAL_VALUE[accidental]
                local[letter] = alteration
            pitch = written + alteration
            held = pending[voice]
            if held is not None:
                if not accidental and written == held[1]:
                    pitch = held[0]
                notes[voice][-1][1] += units
            else:
                notes[voice].append([offset, units, pitch, written])
            pending[voice] = (pitch, written) if tie else None
            offset += units
        return inline

    def _cross_check(self, model: Score) -> None:
        quarter = self.unit * 4
        for voice, notes in zip(VOICES, (model.vocal, model.ins), strict=True):
            mine = [[Fraction(n.onset) * quarter, n.pitch, Fraction(n.duration) * quarter] for n in notes]
            if mine != [list(n) for n in self.parsed.voices[voice].notes]:
                raise ScoreInternalError(
                    f"Internal error: the {voice} notes differ from the upstream parser's."
                )


# --- invariants -------------------------------------------------------------------------


def problems(score: Score) -> list[str]:
    """Every broken invariant of ``score`` (empty for a valid model)."""
    found: list[str] = []
    if isinstance(score.tempo, bool) or not isinstance(score.tempo, int) or score.tempo < 1:
        found.append(f"tempo {score.tempo!r} is not a positive whole number of BPM")
    unit = score.unit
    if not isinstance(unit, Fraction) or unit.numerator != 1 or not _power_of_two(unit.denominator):
        found.append(f"unit {unit!r} is not 1/<power of two>")
        return found
    if unit.denominator > MAX_UNIT:
        found.append(f"unit 1/{unit.denominator} is finer than 1/{MAX_UNIT}")
    if not score.meters:
        found.append("the score has no measure (I10)")
        return found
    for index, (n, d) in enumerate(score.meters, start=1):
        if n < 1 or not _power_of_two(d) or d > MAX_UNIT:
            found.append(f"bar {index}: meter {n}/{d} is not supported")
        elif (n * unit.denominator) % d:
            found.append(f"bar {index}: meter {n}/{d} is not a whole number of units")
    if found:
        return found
    if any(not 1 <= count <= MAX_GROUP for count in score.layout) or sum(score.layout) != score.measure_count:
        found.append(f"layout {score.layout} does not group the {score.measure_count} measures by 1-4 (I8)")
        return found
    firsts = set(score.group_firsts)
    for index in range(1, score.measure_count):
        if score.meters[index] != score.meters[index - 1] and index not in firsts:
            found.append(f"bar {index + 1}: a meter change must start a group")
    total = score.total
    if not score.keys or score.keys[0].onset != 0:
        found.append("the key timeline must start at onset 0")
    previous = -1
    for change in score.keys:
        if change.onset <= previous:
            found.append(f"key changes are not strictly ordered at onset {change.onset}")
        previous = change.onset
        if change.key not in upstream.KEYS:
            found.append(f"unsupported key {change.key!r}")
        if not 0 <= change.onset < total:
            found.append(f"key change at onset {change.onset} lies outside the score")
        if change.placement not in PLACEMENTS:
            found.append(f"key change at onset {change.onset} has placement {change.placement!r}")
    previous = -1
    for section in score.sections:
        if section.measure <= previous:
            found.append("sections are not strictly ordered")
        previous = section.measure
        if section.measure not in firsts:
            found.append(f"section {section.label!r} does not start at a group start")
        label = section.label
        if (
            not isinstance(label, str)
            or not label
            or label != label.strip()
            or any(c in _BREAKS for c in label)
        ):
            found.append(f"section label {label!r} cannot be written as one comment line")
    for name, notes in (("Vocal", score.vocal), ("Ins", score.ins)):
        end = 0
        for note in notes:
            if note.duration < 1 or note.onset < 0 or note.end > total:
                found.append(
                    f"{name}: note at onset {note.onset} (length {note.duration}) lies outside the score"
                )
            if note.onset < end:
                found.append(f"{name}: notes overlap at onset {note.onset} (I3)")
            if not 0 <= note.pitch <= 127:
                found.append(f"{name}: pitch {note.pitch} at onset {note.onset} is outside 0-127 (I5)")
            end = max(end, note.end)
    previous = -1
    for chord in score.chords:
        if chord.onset <= previous:
            found.append(f"two chord symbols at onset {chord.onset} (I7)")
        previous = chord.onset
        if not 0 <= chord.onset < total:
            found.append(f"chord symbol at onset {chord.onset} lies outside the score")
        if upstream.CHORD.fullmatch(chord.name) is None:
            found.append(f"unsupported chord symbol {chord.name!r}")
    return found


def validate(score: Score) -> Score:
    """Raise :class:`ScoreModelError` unless every structural invariant holds; returns ``score``."""
    found = problems(score)
    if found:
        raise ScoreModelError(
            "The score breaks a structural invariant.",
            diagnostics=[{"severity": "error", "message": message, "where": "score"} for message in found],
        )
    return score


# --- writing ----------------------------------------------------------------------------


def _key_plan(score: Score) -> dict[int, str]:
    """How every key change is written: ``header``, ``field`` (group start) or ``inline``."""
    group_onsets = {score.starts[g] for g in score.group_firsts}
    plan: dict[int, str] = {}
    for change in score.keys:
        if change.onset == 0 and change.placement == "header":
            plan[0] = "header"
        elif change.placement in ("field", "header") and change.onset in group_onsets:
            plan[change.onset] = "field"
        else:
            plan[change.onset] = "inline"
    return plan


def _header_key(score: Score) -> str:
    first = score.keys[0]
    if first.placement == "header" or score.source is None:
        return first.key
    return score.source.header_key  # the key written at onset 0 is a field or inline change


def _entering_key(score: Score, plan: dict[int, str], measure: int) -> str:
    """The key in effect where the measure's text begins (field lines and earlier changes applied)."""
    start = score.starts[measure]
    index = bisect_right(score._index.key_onsets, start) - 1
    if index >= 0 and score.keys[index].onset == start and plan[start] == "inline":
        index -= 1
    return score.keys[index].key if index >= 0 else _header_key(score)


def _fingerprint(score: Score, plan: dict[int, str], voice: int, measure: int) -> tuple[Any, ...]:
    """Everything the text of one measure of one voice depends on (except the entering tie spelling)."""
    start, end = score.starts[measure], score.starts[measure + 1]
    index = score._index
    inline = tuple((k.onset - start, k.key) for k in index.keys_in(start, end) if plan[k.onset] == "inline")
    entering = None if inline and inline[0][0] == 0 else _entering_key(score, plan, measure)
    segments = tuple(
        (max(n.onset, start) - start, min(n.end, end) - start, n.pitch, n.onset < start, n.end > end)
        for n in index.overlapping(voice, start, end)
    )
    chords = tuple((c.onset - start, c.name) for c in index.chords_in(start, end)) if voice == 0 else ()
    return (score.meters[measure], entering, inline, segments, chords)


def _required_fields(score: Score, plan: dict[int, str], first: int) -> tuple[Any, ...]:
    """The ``M:``/``K:`` field content a group starting at measure ``first`` must carry."""
    meter = score.meters[first] if first > 0 and score.meters[first] != score.meters[first - 1] else None
    onset = score.starts[first]
    key = next((k.key for k in score._index.keys_in(onset, onset + 1) if plan[onset] == "field"), None)
    return (meter, key)


def _field_lines(required: tuple[Any, ...]) -> list[str]:
    meter, key = required
    lines = []
    if meter is not None:
        lines.append(f"M:{meter[0]}/{meter[1]}")
    if key is not None:
        lines.append(f"K:{key}")
    return lines


def decompose(units: int) -> list[int]:
    """``units`` as supported durations, greedily from the largest (``[]`` for 0)."""
    parts: list[int] = []
    for size in DURATIONS:
        while units >= size:
            parts.append(size)
            units -= size
    return parts


def _written_for(note: Note, key: str) -> int:
    """The written (natural) pitch of an attack: the kept spelling if usable, else the key-aware speller."""
    written = note.spelling
    if written is not None and written % 12 in _LETTER_OF and -2 <= note.pitch - written <= 2:
        return written
    _letter, alteration = _spell(note.pitch % 12, key)
    return note.pitch - alteration


def _duration_text(units: int) -> str:
    return "" if units == 1 else str(units)


def _print_measure(
    score: Score, plan: dict[int, str], voice: int, measure: int, pending: tuple[int, int] | None
) -> tuple[str, tuple[int, int] | None]:
    """Native text of one measure of one voice and the tie leaving it (``(pitch, written)``)."""
    start, end = score.starts[measure], score.starts[measure + 1]
    index = score._index
    notes = index.overlapping(voice, start, end)
    chords = {c.onset: c.name for c in index.chords_in(start, end)} if voice == 0 else {}
    inline = {k.onset: k.key for k in index.keys_in(start, end) if plan[k.onset] == "inline"}
    if not notes and not chords and not inline:
        return "Z", None
    key = _entering_key(score, plan, measure)
    cuts = sorted(
        {start, end, *chords, *inline}
        | {max(n.onset, start) for n in notes}
        | {min(n.end, end) for n in notes}
    )
    parts: list[str] = []
    local: dict[str, int] = {}
    rest = 0
    written = pending[1] if pending is not None else 0
    position = 0

    def flush() -> None:
        nonlocal rest
        parts.extend("z" + _duration_text(size) for size in decompose(rest))
        rest = 0

    for low, high in zip(cuts, cuts[1:], strict=False):
        while position < len(notes) and notes[position].end <= low:
            position += 1
        note = notes[position] if position < len(notes) and notes[position].onset <= low else None
        if low in inline or low in chords or note is not None:
            flush()
        if low in inline:
            key = inline[low]
            parts.append(f"[K:{key}]")
            local = {}
        if low in chords:
            parts.append(f'"{chords[low]}"')
        if note is None:
            rest += high - low
            continue
        at = low
        for size in decompose(high - low):
            if at == note.onset:
                written = _written_for(note, key)
                letter = _LETTER_OF[written % 12]
                alteration = note.pitch - written
                accidental = "" if alteration == local.get(letter, _signature(key)[letter]) else None
                if accidental is None:
                    accidental = _ACCIDENTAL_TEXT[alteration]
                    local[letter] = alteration
            else:  # an unmarked tied continuation keeps the tied pitch and leaves the bar state alone
                assert pending is not None or at > start
                accidental = ""
                letter = _LETTER_OF[written % 12]
            at += size
            parts.append(
                accidental
                + _note_text(letter, written)
                + _duration_text(size)
                + ("-" if at < note.end else "")
            )
    flush()
    last = notes[-1] if notes else None
    leaving = (last.pitch, written) if last is not None and last.end > end else None
    return "".join(parts), leaving


class _Printer:
    def __init__(self, score: Score, reuse: bool):
        self.score = score
        self.source = score.source if reuse else None
        self.plan = _key_plan(score)
        count = score.measure_count
        self.origins = [score.origin(m) if self.source is not None else None for m in range(count)]
        self.texts: list[list[str]] = [[""] * count, [""] * count]
        self.raw: list[list[bool]] = [[False] * count, [False] * count]

    def _decide(self) -> None:
        """Per voice and measure: reuse the source text or print it (both voices of a measure with an
        inline key in the source are decided together, so that duplicated key text stays in step)."""
        score, source = self.score, self.source
        count = score.measure_count
        fingerprints = [[_fingerprint(score, self.plan, v, m) for m in range(count)] for v in (0, 1)]
        forced: set[int] = set()
        while True:
            for voice in (0, 1):
                pending: tuple[int, int] | None = None
                for measure in range(count):
                    origin = self.origins[measure]
                    slot = source.slots[voice][origin] if source is not None and origin is not None else None
                    if (
                        slot is not None
                        and source is not None
                        and origin is not None
                        and measure not in forced
                        and source.fingerprints[voice][origin] == fingerprints[voice][measure]
                        and slot.tie_in == pending
                    ):
                        self.raw[voice][measure] = True
                        pending = slot.tie_out
                    else:
                        self.raw[voice][measure] = False
                        self.texts[voice][measure], pending = _print_measure(
                            score, self.plan, voice, measure, pending
                        )
            if source is None:
                return
            split = {
                m
                for m, origin in enumerate(self.origins)
                if origin is not None
                and (source.slots[0][origin].inline_key or source.slots[1][origin].inline_key)
                and self.raw[0][m] != self.raw[1][m]
            }
            if not split - forced:
                return
            forced |= split

    def _line(self, voice: int, first: int, count: int) -> str:
        parts: list[str] = []
        empty = 0

        def flush() -> None:
            nonlocal empty
            while empty:
                size = min(MAX_GROUP, empty)
                parts.append("Z" if size == 1 else f"Z{size}")
                empty -= size

        # A line with a rewritten measure is written in the native style around it: unchanged
        # full-measure rests written plainly ("Z", "Z3") join the runs of empty measures.
        rewritten = not all(self.raw[voice][first : first + count])
        measure = first
        while measure < first + count:
            if self.raw[voice][measure]:
                assert self.source is not None
                origin = self.origins[measure]
                assert origin is not None
                slot = self.source.slots[voice][origin]
                if rewritten and _REST_RUN.fullmatch(slot.raw):
                    empty += 1
                    measure += 1
                    continue
                whole = slot.run == 1 or (
                    slot.part == 0
                    and measure + slot.run <= first + count
                    and all(
                        self.raw[voice][measure + j] and self.origins[measure + j] == origin + j
                        for j in range(slot.run)
                    )
                )
                if whole:
                    flush()
                    parts.append(slot.raw)
                    measure += slot.run
                    continue
                empty += 1  # a measure of a broken Z run: an empty measure
            elif self.texts[voice][measure] == "Z":
                empty += 1
            else:
                flush()
                parts.append(self.texts[voice][measure])
            measure += 1
        flush()
        return "|".join(parts) + "|"

    def text(self) -> str:
        score, source = self.score, self.source
        self._decide()
        lines: list[str] = []
        sections = {s.measure: s for s in score.sections}
        previous: str | None = None
        n, d = score.meters[0]
        header_meter = f"{n}/{d}"
        for first, count in zip(score.group_firsts, score.layout, strict=True):
            origin = self.origins[first]
            group = source.group_at.get(origin) if source is not None and origin is not None else None
            section = sections.get(first)
            if section is not None:
                if (
                    group is not None
                    and group.comments
                    and _comment_label(group.comments, previous) == section.label
                ):
                    lines.extend(group.comments)
                else:
                    lines.append(f"% {section.label}")
                previous = section.label
            required = _required_fields(score, self.plan, first)
            reuse_fields = (
                group is not None and source is not None and source.required[group.first] == required
            )
            if first == 0 and reuse_fields and group is not None and source is not None:
                if any(line.startswith("M:") for line in group.fields[0]):
                    header_meter = source.header_meter  # the first group's M: line overrides the header
            for voice, name in enumerate(VOICES):
                lines.append(f"V: {name}")
                lines.extend(
                    group.fields[voice] if reuse_fields and group is not None else _field_lines(required)
                )
                lines.append(self._line(voice, first, count))
        header = [
            "X:1",
            "T:",
            f"M:{header_meter}",
            f"L:1/{score.unit.denominator}",
            f"Q:1/4={score.tempo}",
            *HEADER_VOICE_LINES,
            f"K:{_header_key(score)}",
        ]
        ending = "\n" if source is None or source.trailing_newline else ""
        return "\n".join(header + lines) + ending


def to_abc(score: Score) -> str:
    """The ABC text of ``score`` (see the module docstring for the guarantees)."""
    validate(score)
    text = _Printer(score, reuse=True).text()
    if score.source is not None:
        try:
            if from_abc(text) == score:
                return text
        except ScoreSyntaxError:
            pass
        text = _Printer(score, reuse=False).text()
    try:
        again = from_abc(text)
    except ScoreSyntaxError as error:
        raise ScoreInternalError(
            f"Internal error: the serializer wrote a text the upstream parser rejects: {error.diagnostics}"
        ) from error
    if again != score:
        raise ScoreInternalError("Internal error: the serialized text does not re-parse to the same score.")
    return text


def canonical_text(score: Score) -> str:
    """The fully canonical text of ``score`` (no source text reused), checked like ``to_abc``."""
    return to_abc(replace(score, source=None, origins=None))


# --- construction helpers ---------------------------------------------------------------


def new_score(
    *,
    measures: int,
    meter: tuple[int, int] = (4, 4),
    unit: int = 32,
    tempo: int = 100,
    key: str = "C",
    section: str | None = None,
) -> Score:
    """An all-rest score (the DAW skeleton's starting point); groups of four measures."""
    layout = tuple(
        [MAX_GROUP] * (measures // MAX_GROUP) + ([measures % MAX_GROUP] if measures % MAX_GROUP else [])
    )
    return validate(
        Score(
            tempo=tempo,
            unit=Fraction(1, unit),
            meters=(meter,) * measures,
            keys=(KeyChange(0, key, "header"),),
            sections=(Section(0, section),) if section else (),
            layout=layout,
            vocal=(),
            ins=(),
            chords=(),
        )
    )


def musically_equal(a: Score, b: Score) -> bool:
    return a == b


__all__ = [
    "DURATIONS",
    "TRACKS",
    "VOICES",
    "ChordSymbol",
    "KeyChange",
    "Note",
    "Score",
    "ScoreInternalError",
    "ScoreModelError",
    "ScoreSyntaxError",
    "Section",
    "Source",
    "canonical_text",
    "decompose",
    "from_abc",
    "musically_equal",
    "new_score",
    "problems",
    "to_abc",
    "validate",
]
