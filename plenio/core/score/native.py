"""The native two-voice ABC dialect written by YuE2's planner and SheetSage2.

The vendored upstream parser (``third_party/yue2_abc_tools.py``) is the
authority for validity and sounding notes. This module adds what Plenio needs
around it: a structural view (groups, sections, bars with times), analysis
for the Song Sheet and the editor, and deterministic operations that re-check
their invariants with the upstream parser.

Nothing here is specific to a music model; engines decide how to use a score.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioValidationError
from ..hashing import sha256_text
from . import positions

DIALECT = "yue2-native"
VOICES = upstream.VOICES
_REST_BAR = re.compile(r"Z([2-4])?")
_ACCIDENTAL_TEXT = {-2: "__", -1: "_", 0: "=", 1: "^", 2: "^^"}
_LETTERS = "CDEFGAB"


@dataclass(frozen=True)
class Diagnostic:
    severity: str
    message: str
    bar: int | None = None
    voice: str | None = None
    line: int | None = None
    """1-based line of the text the diagnostic refers to."""
    start: int | None = None
    end: int | None = None
    """Character range in the text (the bar, or the line)."""

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "severity": self.severity,
            "message": self.message,
            "bar": self.bar,
            "voice": self.voice,
            "where": f"bar {self.bar}" if self.bar else "score",
        }
        if self.line is not None:
            result.update(line=self.line, start=self.start, end=self.end)
        return result


@dataclass(frozen=True)
class Bar:
    index: int
    start_s: float
    duration_s: float
    meter: str
    key: str
    chords: tuple[str, ...]
    vocal_notes: int
    ins_notes: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "start_s": round(self.start_s, 3),
            "duration_s": round(self.duration_s, 3),
            "meter": self.meter,
            "key": self.key,
            "chords": list(self.chords),
            "vocal_notes": self.vocal_notes,
            "ins_notes": self.ins_notes,
        }


@dataclass(frozen=True)
class Section:
    label: str
    start_bar: int
    bars: int
    start_s: float
    end_s: float
    vocal_notes: int

    @property
    def tag(self) -> str:
        return section_tag(self.label)

    def to_dict(self) -> dict[str, Any]:
        return {
            "label": self.label,
            "tag": self.tag,
            "start_bar": self.start_bar,
            "bars": self.bars,
            "start_s": round(self.start_s, 3),
            "end_s": round(self.end_s, 3),
            "vocal_notes": self.vocal_notes,
        }


@dataclass(frozen=True)
class Analysis:
    ok: bool
    sha256: str
    diagnostics: tuple[Diagnostic, ...]
    header: dict[str, Any] = field(default_factory=dict)
    bars: tuple[Bar, ...] = ()
    sections: tuple[Section, ...] = ()
    voices: dict[str, dict[str, Any]] = field(default_factory=dict)
    duration_s: float = 0.0
    has_chords: bool = False

    @property
    def errors(self) -> list[Diagnostic]:
        return [d for d in self.diagnostics if d.severity == "error"]

    def to_dict(self) -> dict[str, Any]:
        return {
            "ok": self.ok,
            "dialect": DIALECT,
            "sha256": self.sha256,
            "diagnostics": [d.to_dict() for d in self.diagnostics],
            "header": self.header,
            "bars": [b.to_dict() for b in self.bars],
            "sections": [s.to_dict() for s in self.sections],
            "voices": self.voices,
            "duration_s": round(self.duration_s, 3),
            "has_chords": self.has_chords,
        }


# --- structure -------------------------------------------------------------------


@dataclass
class _Group:
    section: str | None
    starts_section: bool  # a "% label" comment directly precedes the group
    lines: dict[str, int]  # voice -> index of its music line
    bars: int


def section_tag(label: str) -> str:
    """``pre-chorus`` -> ``[Pre-Chorus]``; the lyrics tag of a score section."""
    words = re.split(r"(\s+|-)", label.strip())
    return "[" + "".join(w.capitalize() if w.strip() and w != "-" else w for w in words) + "]"


def _expand(line: str) -> list[str]:
    bars: list[str] = []
    for bar in line[:-1].split("|"):
        bar = bar.strip()
        rest = _REST_BAR.fullmatch(bar)
        bars.extend(["Z"] * int(rest.group(1) or "1") if rest else [bar])
    return bars


def _groups(lines: list[str]) -> list[_Group]:
    """Walk the body like the upstream parser; assumes the text parsed successfully."""
    groups: list[_Group] = []
    cursor, section = 8, None
    while cursor < len(lines):
        starts = False
        while cursor < len(lines) and lines[cursor].startswith("% "):
            section = lines[cursor][2:].strip() or section
            starts = True
            cursor += 1
        group_lines: dict[str, int] = {}
        bars = 0
        for voice in VOICES:
            cursor += 1  # "V: <voice>"
            while cursor < len(lines) and lines[cursor].startswith(("M:", "K:")):
                cursor += 1
            group_lines[voice] = cursor
            bars = len(_expand(lines[cursor]))
            cursor += 1
        groups.append(_Group(section, starts or not groups, group_lines, bars))
    return groups


def _parse(text: str) -> upstream.Score:
    try:
        return upstream.parse_abc(text)
    except upstream.AbcError as error:
        raise PlenioValidationError(
            "The score is not valid native two-voice ABC.",
            diagnostics=[_diagnostic_from(str(error)).to_dict()],
            hint="Fix the reported bar in the Song Sheet, or re-generate/re-transcribe the score.",
        ) from error


def _diagnostic_from(message: str, text: str | None = None) -> Diagnostic:
    bar = re.search(r"bar (\d+)", message)
    voice = re.search(r"\b(Vocal|Ins)\b", message)
    where = positions.locate(text, message) if text is not None else None
    line, start, end = where if where is not None else (None, None, None)
    return Diagnostic(
        "error",
        message,
        int(bar.group(1)) if bar else None,
        voice.group(1) if voice else None,
        line,
        start,
        end,
    )


def _meter(meter: tuple[int, int]) -> str:
    return f"{meter[0]}/{meter[1]}"


def analyze(text: str) -> Analysis:
    """Analyse ``text``; invalid scores return ``ok=False`` with diagnostics instead of raising."""
    digest = sha256_text(text)
    if not text.strip():
        return Analysis(False, digest, (Diagnostic("error", "The score is empty."),))
    try:
        score = upstream.parse_abc(text)
    except upstream.AbcError as error:
        return Analysis(False, digest, (_diagnostic_from(str(error), text),))
    lines = text.splitlines()
    seconds_per_quarter = Fraction(60, score.bpm)
    vocal, ins = score.voices["Vocal"], score.voices["Ins"]
    keys = sorted(vocal.keys)

    def key_at(time: Fraction) -> str:
        current = keys[0][1]
        for start, key in keys:
            if start <= time:
                current = key
        return str(current)

    def notes_in(notes: list[Any], start: Fraction, end: Fraction) -> int:
        return sum(1 for onset, _pitch, _duration in notes if start <= onset < end)

    bars = []
    for index, (start, length, meter) in enumerate(vocal.bars, start=1):
        end = start + length
        chords = tuple(chord for time, chord in vocal.chords if start <= time < end)
        bars.append(
            Bar(
                index,
                float(start * seconds_per_quarter),
                float(length * seconds_per_quarter),
                _meter(meter),
                key_at(start),
                chords,
                notes_in(vocal.notes, start, end),
                notes_in(ins.notes, start, end),
            )
        )
    sections: list[Section] = []
    bar_cursor = 0
    for group in _groups(lines):
        first = bar_cursor + 1
        bar_cursor += group.bars
        span = bars[first - 1 : bar_cursor]
        end_s = span[-1].start_s + span[-1].duration_s
        notes = sum(b.vocal_notes for b in span)
        if group.starts_section or not sections:
            sections.append(
                Section(group.section or "untitled", first, group.bars, span[0].start_s, end_s, notes)
            )
        else:
            previous = sections[-1]
            sections[-1] = Section(
                previous.label,
                previous.start_bar,
                previous.bars + group.bars,
                previous.start_s,
                end_s,
                previous.vocal_notes + notes,
            )
    diagnostics: list[Diagnostic] = []
    if not vocal.notes and not ins.notes:
        diagnostics.append(Diagnostic("warning", "The score has no sounding notes."))
    voices = {
        name: {
            "notes": len(voice.notes),
            "bars": len(voice.bars),
            "lowest": min((p for _t, p, _d in voice.notes), default=None),
            "highest": max((p for _t, p, _d in voice.notes), default=None),
            "chords": len(voice.chords),
        }
        for name, voice in score.voices.items()
    }
    header = {"meter": lines[2][2:], "unit": lines[3][2:], "tempo_bpm": score.bpm, "key": lines[7][2:]}
    duration = float(vocal.time * seconds_per_quarter)
    return Analysis(
        True,
        digest,
        tuple(diagnostics),
        header,
        tuple(bars),
        tuple(sections),
        voices,
        duration,
        bool(vocal.chords),
    )


def validate(text: str) -> Analysis:
    """Analyse and raise ``PlenioValidationError`` when the score is invalid."""
    result = analyze(text)
    if not result.ok:
        raise PlenioValidationError(
            "The score is not valid native two-voice ABC.",
            diagnostics=[d.to_dict() for d in result.errors],
            hint="Fix the reported bar in the Song Sheet, or re-generate/re-transcribe the score.",
        )
    return result


def has_chords(text: str) -> bool:
    return bool(_parse(text).voices["Vocal"].chords)


def section_tags(text: str) -> str:
    """Lyrics made only of the score's section tags, in order (for instrumental songs)."""
    return "\n\n".join(section.tag for section in validate(text).sections)


# --- operations -------------------------------------------------------------------


@dataclass(frozen=True)
class Change:
    abc: str
    changes: tuple[str, ...]
    warnings: tuple[str, ...] = ()


def _rewrite(text: str, voice_filter: Iterable[str], bar_fn: Callable[[str, str, int], str]) -> str:
    """Apply ``bar_fn(voice, bar, bar_number)`` to every bar of the given voices."""
    score = _parse(text)
    lines = text.splitlines()
    wanted = set(voice_filter)
    counters = dict.fromkeys(VOICES, 0)
    for index in sorted(score.music_lines):
        voice = score.music_lines[index]
        bars = _expand(lines[index])
        rewritten = []
        for bar in bars:
            counters[voice] += 1
            rewritten.append(bar_fn(voice, bar, counters[voice]) if voice in wanted else bar)
        if voice in wanted:
            lines[index] = "|".join(rewritten) + "|"
    return "\n".join(lines) + ("\n" if text.endswith("\n") else "")


def _tokens(bar: str) -> list[re.Match[str]]:
    result, cursor = [], 0
    while cursor < len(bar):
        if bar[cursor].isspace():
            cursor += 1
            continue
        match = upstream.TOKEN.match(bar, cursor)
        if match is None:
            raise PlenioValidationError(f"Unsupported token in bar {bar!r}.")
        result.append(match)
        cursor = match.end()
    return result


def _is_note(match: re.Match[str]) -> bool:
    return match.group("note") is not None and match.group("note") != "z"


_REST_UNITS = sorted(upstream.DURATIONS, reverse=True)


def _rests(units: int) -> str:
    """Rests for ``units`` using the fewest supported durations (48, 32, 24, 16, ...)."""
    parts = []
    for size in _REST_UNITS:
        while units >= size:
            parts.append("z" if size == 1 else f"z{size}")
            units -= size
    return "".join(parts)


def _silence_bar(bar: str) -> str:
    """Replace the notes of a bar with rests, keeping chord symbols and key changes at their onsets."""
    if bar == "Z":
        return bar
    parts: list[str] = []
    pending = 0
    only_rests = True
    for match in _tokens(bar):
        if match.group("chord") is not None or match.group("key") is not None:
            parts.append(_rests(pending))
            pending = 0
            parts.append(match.group(0))
            only_rests = False
        elif match.group("note") is not None:
            pending += int(match.group("duration") or "1")
    parts.append(_rests(pending))
    return "Z" if only_rests else "".join(parts)


def _check_same_grid(before: upstream.Score, after: upstream.Score) -> None:
    for voice in VOICES:
        if before.voices[voice].bars != after.voices[voice].bars:
            raise PlenioValidationError(f"Internal error: the {voice} bar grid changed.")


def silence_voice(text: str, voice: str) -> Change:
    """Replace every note of ``voice`` with rests; chords, keys and the other voice stay."""
    if voice not in VOICES:
        raise PlenioValidationError(f"Unknown voice {voice!r}; use one of {list(VOICES)}.")
    before = _parse(text)
    result = _rewrite(text, [voice], lambda _v, bar, _n: _silence_bar(bar))
    after = _parse(result)
    _check_same_grid(before, after)
    other = "Ins" if voice == "Vocal" else "Vocal"
    if after.voices[voice].notes or after.voices[other].notes != before.voices[other].notes:
        raise PlenioValidationError("Internal error: silencing changed the wrong notes.")
    if [c for v in VOICES for c in after.voices[v].chords] != [
        c for v in VOICES for c in before.voices[v].chords
    ]:
        raise PlenioValidationError("Internal error: silencing changed chords.")
    removed = len(before.voices[voice].notes)
    return Change(
        result,
        (f"{voice}: {removed} notes replaced by rests",) if removed else (f"{voice} was already silent",),
    )


def strip_chords(text: str) -> Change:
    """Remove all chord symbols; every note stays (upstream invariant check)."""
    before = _parse(text)
    count = len(before.voices["Vocal"].chords)
    try:
        result = upstream.strip_chords(text, keep_voice="both")
    except upstream.AbcError as error:
        raise PlenioValidationError(f"Removing chords failed: {error}") from error
    return Change(result, (f"{count} chord symbols removed",) if count else ("no chord symbols present",))


def move_vocal_to_ins(text: str, *, conflict: str = "replace") -> Change:
    """Let the instrument play the vocal melody.

    Every bar with sung notes moves those notes into ``Ins`` and silences
    ``Vocal`` (chords stay in ``Vocal``). Where ``Ins`` already plays in the same
    bar, ``conflict="replace"`` keeps the complete melody (the ``Ins`` bar is
    replaced) and ``conflict="keep_ins"`` keeps the instrument part (the vocal
    notes of that bar are dropped).
    """
    if conflict not in ("replace", "keep_ins"):
        raise PlenioValidationError(f"Unknown conflict policy {conflict!r}; use 'replace' or 'keep_ins'.")
    before = _parse(text)
    lines = text.splitlines()
    groups = _groups(lines)
    changes: list[str] = []
    warnings: list[str] = []
    moved: set[int] = set()
    bar_number = 0
    new_bars: dict[int, list[str]] = {}
    for group in groups:
        vocal_bars = _expand(lines[group.lines["Vocal"]])
        ins_bars = _expand(lines[group.lines["Ins"]])
        new_vocal, new_ins = [], []
        for vocal_bar, ins_bar in zip(vocal_bars, ins_bars, strict=True):
            bar_number += 1
            vocal_has = vocal_bar != "Z" and any(_is_note(m) for m in _tokens(vocal_bar))
            ins_has = ins_bar != "Z" and any(_is_note(m) for m in _tokens(ins_bar))
            if not vocal_has:
                new_vocal.append(vocal_bar)
                new_ins.append(ins_bar)
                continue
            if ins_has and conflict == "keep_ins":
                new_vocal.append(_silence_bar(vocal_bar))
                new_ins.append(ins_bar)
                warnings.append(
                    f"bar {bar_number}: Ins already plays; the vocal notes of this bar were dropped"
                )
                continue
            melody = "".join(m.group(0) for m in _tokens(vocal_bar) if m.group("chord") is None)
            new_ins.append(melody)
            new_vocal.append(_silence_bar(vocal_bar))
            moved.add(bar_number)
            if ins_has:
                warnings.append(f"bar {bar_number}: the Ins part was replaced by the vocal melody")
        new_bars[group.lines["Vocal"]] = new_vocal
        new_bars[group.lines["Ins"]] = new_ins
    _fix_ties(new_bars, lines, groups, moved, warnings)
    for index, bars in new_bars.items():
        lines[index] = "|".join(bars) + "|"
    result = "\n".join(lines) + ("\n" if text.endswith("\n") else "")
    after = _parse(result)
    _check_same_grid(before, after)
    if after.voices["Vocal"].notes:
        raise PlenioValidationError("Internal error: Vocal still has notes after moving them.")
    if after.voices["Vocal"].chords != before.voices["Vocal"].chords:
        raise PlenioValidationError("Internal error: chords changed while moving the melody.")
    windows = [before.voices["Vocal"].bars[n - 1] for n in sorted(moved)]

    def inside(notes: list[Any]) -> list[Any]:
        return [n for n in notes if any(start <= n[0] < start + length for start, length, _m in windows)]

    if inside(after.voices["Ins"].notes) != inside(before.voices["Vocal"].notes) and not any(
        "tie" in w for w in warnings
    ):
        raise PlenioValidationError("Internal error: the moved melody differs from the vocal melody.")
    if moved:
        changes.append(f"vocal melody moved to Ins in {len(moved)} bars")
    else:
        changes.append("no sung notes to move")
    return Change(result, tuple(changes), tuple(warnings))


def _fix_ties(
    new_bars: dict[int, list[str]],
    lines: list[str],
    groups: list[_Group],
    moved: set[int],
    warnings: list[str],
) -> None:
    """Remove Ins ties that would now join a moved bar with a kept bar (a tie cannot change pitch)."""
    sequence: list[tuple[int, int]] = []  # (line index, position) of every Ins bar in order
    for group in groups:
        index = group.lines["Ins"]
        sequence.extend((index, position) for position in range(len(new_bars[index])))
    for number in range(1, len(sequence)):
        crosses = (number in moved) != (number + 1 in moved)
        if not crosses:
            continue
        index, position = sequence[number - 1]
        bar = new_bars[index][position]
        if bar.rstrip().endswith("-"):
            new_bars[index][position] = bar.rstrip()[:-1]
            warnings.append(
                f"bar {number}: a tie into bar {number + 1} was removed (the next note is a new attack)"
            )


# --- transposition ------------------------------------------------------------------

_NATURAL = dict(zip(_LETTERS, (0, 2, 4, 5, 7, 9, 11), strict=True))


def _key_tonic(key: str) -> tuple[int, bool]:
    minor = key.endswith("m")
    name = key[:-1] if minor else key
    return (_NATURAL[name[0]] + name[1:].count("#") - name[1:].count("b")) % 12, minor


def _transpose_key(key: str, semitones: int) -> str:
    tonic, minor = _key_tonic(key)
    target = (tonic + semitones) % 12
    candidates = [k for k in upstream.KEYS if _key_tonic(k) == (target, minor)]
    if not candidates:
        raise PlenioValidationError(f"No supported key for {key} transposed by {semitones} semitones.")
    best: str = min(
        candidates,
        key=lambda k: (
            abs(upstream.KEYS[k]),
            upstream.KEYS[k] < 0 if semitones >= 0 else upstream.KEYS[k] > 0,
        ),
    )
    return best


def _spell(pitch_class: int, key: str) -> tuple[str, int]:
    """Letter and alteration for a pitch class in ``key`` (diatonic first, then the key's direction)."""
    signature = upstream.key_accidentals(key)
    sharp_key = upstream.KEYS[key] >= 0
    best: tuple[float, str, int] | None = None
    for letter in _LETTERS:
        for alteration in (-2, -1, 0, 1, 2):
            if (_NATURAL[letter] + alteration) % 12 != pitch_class:
                continue
            cost: float
            if alteration == signature[letter]:
                cost = 0
            elif alteration == 0:
                cost = 1
            elif abs(alteration) == 1:
                white_key = pitch_class in (0, 2, 4, 5, 7, 9, 11)  # E#, B#, Cb, Fb are a last resort
                cost = 3 if white_key else (1.5 if (alteration > 0) == sharp_key else 2)
            else:
                cost = 4
            if best is None or cost < best[0]:
                best = (cost, letter, alteration)
    assert best is not None
    return best[1], best[2]


def _note_text(letter: str, written: int) -> str:
    octave = (written - 60 - _NATURAL[letter]) // 12
    return letter.lower() + "'" * (octave - 1) if octave >= 1 else letter + "," * (-octave)


def _chord_name(name: str, semitones: int, key: str) -> str:
    match = re.fullmatch(r"([A-G](?:bb|##|b|#)?)(.*?)(?:/([A-G](?:bb|##|b|#)?))?", name)
    if match is None:
        raise PlenioValidationError(f"Unsupported chord symbol {name!r}.")

    def move(root: str) -> str:
        pc = (_NATURAL[root[0]] + root[1:].count("#") - root[1:].count("b") + semitones) % 12
        letter, alteration = _spell(pc, key)
        return letter + ("#" * alteration if alteration > 0 else "b" * -alteration)

    root, quality, bass = match.groups()
    return move(root) + quality + ("/" + move(bass) if bass else "")


def transpose(text: str, semitones: int) -> Change:
    """Transpose both voices, chord symbols and all keys; notes are re-spelled for the new key."""
    if semitones == 0:
        return Change(text, ("no transposition",))
    if not -24 <= semitones <= 24:
        raise PlenioValidationError("Transpose by at most two octaves (-24 ... 24 semitones).")
    before = _parse(text)
    original = text.splitlines()
    lines = list(original)
    for index, line in enumerate(original):
        if index >= 7 and line.startswith("K:"):
            lines[index] = "K:" + _transpose_key(line[2:], semitones)
    for voice in VOICES:
        _transpose_voice(original, lines, before, voice, semitones)
    result = "\n".join(lines) + ("\n" if text.endswith("\n") else "")
    after = _parse(result)
    _check_same_grid(before, after)
    for voice in VOICES:
        expected = [[t, p + semitones, d] for t, p, d in before.voices[voice].notes]
        if after.voices[voice].notes != expected:
            raise PlenioValidationError(f"Internal error: transposition changed {voice} rhythm or pitch.")
    return Change(
        result, (f"transposed by {semitones:+d} semitones; key {original[7][2:]} -> {lines[7][2:]}",)
    )


def _transpose_voice(
    original: list[str], lines: list[str], score: upstream.Score, voice: str, semitones: int
) -> None:
    """Rewrite the music lines of ``voice`` in ``lines``, reading pitches from ``original``.

    Mirrors the upstream accidental rules: an accidental applies to its letter in
    every octave until the barline, and an unmarked tied continuation keeps the
    tied pitch without changing the bar state.
    """
    old_key = original[7][2:]
    pending_old: tuple[int, int] | None = None  # (pitch, written) of a tied note in the original
    pending_new: tuple[str, int] | None = None  # (letter, written) of the same note in the new text
    for index in sorted(i for i, v in score.music_lines.items() if v == voice):
        cursor = index - 1
        while cursor > 7 and original[cursor].startswith(("M:", "K:")):
            if original[cursor].startswith("K:"):
                old_key = original[cursor][2:]
            cursor -= 1
        new_key = _transpose_key(old_key, semitones)
        new_bars = []
        for bar in _expand(original[index]):
            if bar == "Z":
                new_bars.append(bar)
                continue
            old_local: dict[str, int] = {}
            new_local: dict[str, int] = {}
            parts = []
            for match in _tokens(bar):
                chord, inline_key, note = match.group("chord"), match.group("key"), match.group("note")
                if chord is not None:
                    parts.append('"' + _chord_name(chord, semitones, new_key) + '"')
                    continue
                if inline_key is not None:
                    old_key, new_key = inline_key, _transpose_key(inline_key, semitones)
                    old_local, new_local = {}, {}
                    parts.append(f"[K:{new_key}]")
                    continue
                duration, tie, acc = match.group("duration"), match.group("tie"), match.group("acc")
                if note == "z":
                    parts.append("z" + duration)
                    continue
                letter = note.upper()
                written = 60 + _NATURAL[letter] + (12 if note.islower() else 0)
                written += 12 * (match.group("oct").count("'") - match.group("oct").count(","))
                alteration = old_local.get(letter, upstream.key_accidentals(old_key)[letter])
                if acc:
                    alteration = {"=": 0, "_": -1, "__": -2, "^": 1, "^^": 2}[acc]
                    old_local[letter] = alteration
                pitch = written + alteration
                if pending_old is not None and not acc and written == pending_old[1]:
                    pitch = pending_old[0]
                target = pitch + semitones
                if not 0 <= target <= 127:
                    raise PlenioValidationError(
                        f"Transposing moves a note outside the MIDI range (bar {bar!r})."
                    )
                if pending_old is not None and pending_new is not None:
                    new_letter, new_written = pending_new
                    accidental = ""
                else:
                    new_letter, new_alteration = _spell(target % 12, new_key)
                    new_written = target - new_alteration
                    state = new_local.get(new_letter, upstream.key_accidentals(new_key)[new_letter])
                    accidental = "" if new_alteration == state else _ACCIDENTAL_TEXT[new_alteration]
                    if accidental:
                        new_local[new_letter] = new_alteration
                parts.append(accidental + _note_text(new_letter, new_written) + duration + tie)
                pending_old = (pitch, written) if tie else None
                pending_new = (new_letter, new_written) if tie else None
            new_bars.append("".join(parts))
        lines[index] = "|".join(new_bars) + "|"


def set_tempo(text: str, bpm: int) -> Change:
    """Change the quarter-note tempo; notes, meters and bars stay (upstream invariant check)."""
    if not 20 <= bpm <= 300:
        raise PlenioValidationError(f"Tempo {bpm} BPM is outside 20 ... 300.")
    before = _parse(text)
    lines = text.splitlines()
    lines[4] = f"Q:1/4={bpm}"
    result = "\n".join(lines) + ("\n" if text.endswith("\n") else "")
    after = _parse(result)
    invariant = upstream.compare(before, after, allow_tempo_change=True)
    if not invariant["match"]:
        raise PlenioValidationError(f"Internal error: tempo change altered notes: {invariant['differences']}")
    return Change(result, (f"tempo {before.bpm} -> {bpm} BPM",))


def prepare(text: str, *, instrumental: bool, melody: str = "lead") -> Change:
    """Deterministic preparation for an intended vocal mode.

    Sung songs are unchanged. Instrumental songs get a silent ``Vocal`` voice:
    ``melody="lead"`` lets the instrument play the vocal melody,
    ``melody="accompaniment"`` removes it.
    """
    if not instrumental:
        validate(text)
        return Change(text, ("sung song: score unchanged",))
    if melody == "lead":
        return move_vocal_to_ins(text)
    if melody == "accompaniment":
        return silence_voice(text, "Vocal")
    raise PlenioValidationError(
        f"Unknown instrumental melody option {melody!r}; use 'lead' or 'accompaniment'."
    )


# --- length -------------------------------------------------------------------------


def _group_spans(lines: list[str]) -> list[tuple[int, int]]:
    """``(first line, end line)`` of every group, including its ``% label`` lines."""
    spans: list[tuple[int, int]] = []
    cursor = 8
    while cursor < len(lines):
        start = cursor
        while cursor < len(lines) and lines[cursor].startswith("% "):
            cursor += 1
        for _voice in VOICES:
            cursor += 1  # "V: <voice>"
            while cursor < len(lines) and lines[cursor].startswith(("M:", "K:")):
                cursor += 1
            cursor += 1  # music line
        spans.append((start, min(cursor, len(lines))))
    return spans


def repair_truncated(text: str) -> Change | None:
    """Remove an incomplete last group (a plan cut off at the planner's token limit).

    Returns ``None`` when the score is valid, or when removing the last group does not make it
    valid (then the error is somewhere else and must be fixed by the user).
    """
    if analyze(text).ok:
        return None
    lines = text.splitlines()
    starts = [
        i
        for i in range(8, len(lines))
        if lines[i].startswith("% ")
        and not lines[i - 1].startswith("% ")
        or lines[i] == "V: Vocal"
        and not lines[i - 1].startswith("% ")
    ]
    if not starts:
        return None
    candidate = "\n".join(lines[: starts[-1]]) + "\n"
    analysis = analyze(candidate)
    if not analysis.ok:
        return None
    return Change(
        candidate,
        (
            f"the score ended inside its last group (a plan cut off at the planner's token limit); "
            f"the incomplete group was removed, {len(analysis.bars)} bars remain",
        ),
        ("the planner did not finish this plan; the removed part may have been the ending",),
    )


FIT_TOLERANCE = 1.15


def _core_sections(labels: list[str]) -> int:
    """How many sections from the start form the shortest complete song: up to the first chorus
    (or, without a chorus, the first verse)."""
    for word in ("chorus", "verse"):
        for index, label in enumerate(labels[:-1]):
            if word in label.lower() and "pre" not in label.lower():
                return index + 1
    return 1


def fit_length(text: str, target_seconds: float) -> Change:
    """Shorten a score to about ``target_seconds`` at section boundaries.

    Keeps whole sections from the start - at least up to the first chorus (or verse), so that a
    complete song remains - and then more sections while the kept part plus the final section
    (usually the outro, so the song still ends) stays within ``FIT_TOLERANCE`` x the target. Never
    cuts inside a section. When a removed section changes key or meter, the final section is not
    appended (its key would be wrong) and a warning says so.
    """
    analysis = validate(text)
    sections = list(analysis.sections)
    limit = target_seconds * FIT_TOLERANCE
    if analysis.duration_s <= limit or len(sections) < 3:
        return Change(
            text, (f"length {analysis.duration_s:.0f} s fits about {target_seconds:.0f} s: unchanged",)
        )
    ending = sections[-1]
    durations = [s.end_s - s.start_s for s in sections]
    keep = min(_core_sections([s.label for s in sections]), len(sections) - 1)
    while keep < len(sections) - 1 and sum(durations[: keep + 1]) + durations[-1] <= limit:
        keep += 1
    warnings: list[str] = []
    if sum(durations[:keep]) + durations[-1] > limit:
        warnings.append(
            f"the shortest complete form ({', '.join(s.label for s in sections[:keep])} and the ending) lasts "
            f"{sum(durations[:keep]) + durations[-1]:.0f} s, more than the {target_seconds:.0f} s target"
        )
    if keep >= len(sections) - 1:
        return Change(text, ("no section can be removed",), tuple(warnings))
    lines = text.splitlines()
    spans = _group_spans(lines)
    groups = _groups(lines)
    section_of_group: list[int] = []
    current = -1
    for index, group in enumerate(groups):
        if group.starts_section or index == 0:
            current += 1
        section_of_group.append(current)
    kept_groups = [i for i, s in enumerate(section_of_group) if s < keep]
    ending_groups = [i for i, s in enumerate(section_of_group) if s == len(sections) - 1]
    removed = [i for i, s in enumerate(section_of_group) if keep <= s < len(sections) - 1]
    changes_state = any(
        lines[line].startswith(("M:", "K:")) for i in removed for line in range(spans[i][0], spans[i][1])
    )
    body: list[str] = []
    for i in kept_groups:
        body.extend(lines[spans[i][0] : spans[i][1]])
    # A tie from the last kept bar would now lead into a different note.
    for voice in VOICES:
        line = groups[kept_groups[-1]].lines[voice] - spans[kept_groups[-1]][0]
        position = len(body) - (spans[kept_groups[-1]][1] - spans[kept_groups[-1]][0]) + line
        if body[position].endswith("-|"):
            body[position] = body[position][:-2] + "|"
            warnings.append(f"{voice}: a tie at the end of the kept part was removed")
    appended = ending.label
    if changes_state:
        warnings.append("a removed section changes key or meter, so the ending was not appended")
        appended = ""
    else:
        for i in ending_groups:
            body.extend(lines[spans[i][0] : spans[i][1]])
    result = "\n".join(lines[:8] + body) + "\n"
    after = validate(result)
    kept_labels = [s.label for s in sections[:keep]]
    return Change(
        result,
        (
            f"fitted to about {target_seconds:.0f} s: kept {', '.join(kept_labels)}"
            + (f" and the ending ({appended})" if appended else "")
            + f"; removed {len(sections) - keep - (1 if appended else 0)} section(s); "
            f"{analysis.duration_s:.0f} s -> {after.duration_s:.0f} s",
        ),
        tuple(warnings),
    )


# --- phrasing -----------------------------------------------------------------------


def phrasing(text: str, *, rest_quarters: float = 1.0) -> list[dict[str, Any]]:
    """Per section: bars, vocal notes and phrases (split at Vocal rests of at least one beat).

    Used to write new lyrics on an existing melody: roughly one syllable per note, one line per
    phrase. Onsets are not syllables (melismas are allowed); the counts are guidance.
    """
    analysis = validate(text)
    score = _parse(text)
    bars = score.voices["Vocal"].bars
    notes = sorted(score.voices["Vocal"].notes)
    result = []
    for section in analysis.sections:
        start = bars[section.start_bar - 1][0]
        last = bars[section.start_bar - 1 + section.bars - 1]
        end = last[0] + last[1]
        inside = [n for n in notes if start <= n[0] < end]
        phrases: list[int] = []
        previous_end = None
        for onset, _pitch, duration in inside:
            if previous_end is None or onset - previous_end >= Fraction(rest_quarters).limit_denominator(64):
                phrases.append(0)
            phrases[-1] += 1
            previous_end = onset + duration
        result.append(
            {
                "tag": section.tag,
                "label": section.label,
                "bars": section.bars,
                "vocal_notes": len(inside),
                "phrases": phrases,
            }
        )
    return result
