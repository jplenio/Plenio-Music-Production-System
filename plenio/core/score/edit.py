"""Editing operations on a native score (the editor's notation view and palette).

Each operation rewrites only the bars - or, for section edits, the group lines and
section comments - it has to; every other character of the text stays as it was.
Rewritten bars are spelled the way the native writer spells them: accidentals only where
the key and the bar's accidental state need them (by letter, across octaves), full-bar
rests as ``Z``. Every result is re-parsed with the upstream parser and checked: the bar
grid and the key timeline are unchanged, and every note outside the edited bars is
exactly as before.
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field
from fractions import Fraction

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioValidationError
from . import model as score_model
from .model import ACCIDENTAL_TEXT, Element, ScoreModel, pitch_name
from .native import _note_text, _rests, _spell
from .positions import structure

VOICES = upstream.VOICES
_LABEL = re.compile(r"[a-z0-9][a-z0-9 \-]{0,29}")
DEFAULT_PITCH = {"Vocal": 72, "Ins": 67}


@dataclass(frozen=True)
class EditResult:
    abc: str
    changes: tuple[str, ...]
    warnings: tuple[str, ...] = ()
    select: tuple[str, ...] = ()
    """Ids to select after the edit (the edited notes in the new text)."""


# --- bar writing ----------------------------------------------------------------------


@dataclass
class Event:
    kind: str
    """``chord``, ``key``, ``note`` or ``rest``."""
    text: str = ""
    units: int = 0
    midi: int | None = None
    tie_in: bool = False
    tie_out: bool = False
    letter: str = ""
    written: int = 0
    element: str | None = None


def _units_text(units: int) -> str:
    return "" if units == 1 else str(units)


def write_bar(events: Sequence[Event], key: str) -> str:
    """Native text of one bar. ``key`` is the key in effect at the bar start."""
    local: dict[str, int] = {}
    parts: list[str] = []
    only_rests = True
    for event in events:
        if event.kind == "chord":
            parts.append(f'"{event.text}"')
            only_rests = False
        elif event.kind == "key":
            parts.append(f"[K:{event.text}]")
            key, local = event.text, {}
            only_rests = False
        elif event.kind == "rest":
            parts.append("z" + _units_text(event.units))
        else:
            only_rests = False
            assert event.midi is not None
            letter, written = event.letter, event.written
            if event.tie_in and letter:
                accidental = ""  # an unmarked tied continuation keeps its pitch and not the bar state
            else:
                if not letter or not -2 <= event.midi - written <= 2:
                    letter, alteration = _spell(event.midi % 12, key)
                    written = event.midi - alteration
                alteration = event.midi - written
                default = local.get(letter, upstream.key_accidentals(key)[letter])
                accidental = "" if alteration == default else ACCIDENTAL_TEXT[alteration]
                if accidental:
                    local[letter] = alteration
            parts.append(
                accidental
                + _note_text(letter, written)
                + _units_text(event.units)
                + ("-" if event.tie_out else "")
            )
    return "Z" if only_rests else "".join(parts)


def bar_events(model: ScoreModel, voice: str, bar: int) -> list[Event]:
    """The events of a bar in text order, notes and rests taken from the model."""
    slot = model.shape.slot(voice, bar)
    assert slot is not None
    elements = model.in_bar(voice, bar)
    if slot.text == "Z":
        return [Event("rest", units=elements[0].units, element=elements[0].id)]
    events: list[Event] = []
    count = 0
    cursor = 0
    while cursor < len(slot.text):
        if slot.text[cursor].isspace():
            cursor += 1
            continue
        match = upstream.TOKEN.match(slot.text, cursor)
        assert match is not None
        cursor = match.end()
        if match.group("chord") is not None:
            events.append(Event("chord", match.group("chord")))
        elif match.group("key") is not None:
            events.append(Event("key", match.group("key")))
        else:
            element = elements[count]
            count += 1
            if element.kind == "rest":
                events.append(Event("rest", units=element.units, element=element.id))
            else:
                events.append(
                    Event(
                        "note",
                        units=element.units,
                        midi=element.midi,
                        tie_in=element.tie_in,
                        tie_out=element.tie_out,
                        letter=element.letter,
                        written=element.written,
                        element=element.id,
                    )
                )
    return events


def _merge_rests(events: list[Event]) -> list[Event]:
    """Join neighbouring rests (not across chords or keys) into the fewest supported rests."""
    merged: list[Event] = []
    for event in events:
        if event.kind == "rest" and merged and merged[-1].kind == "rest":
            merged[-1] = Event("rest", units=merged[-1].units + event.units, element=merged[-1].element)
        else:
            merged.append(event)
    result: list[Event] = []
    for event in merged:
        if event.kind == "rest":
            result.extend(
                Event("rest", units=_rest_units(part), element=event.element)
                for part in _rests(event.units).replace("z", " z").split()
            )
        else:
            result.append(event)
    return result


def _rest_units(token: str) -> int:
    return int(token[1:] or "1")


def _compress(bars: list[str]) -> list[str]:
    out: list[str] = []
    run = 0
    for bar in [*bars, None]:
        if bar == "Z" and run < 4:
            run += 1
            continue
        if run:
            out.append("Z" if run == 1 else f"Z{run}")
            run = 0
        if bar == "Z":
            run = 1
        elif bar is not None:
            out.append(bar)
    return out


def replace_bars(model: ScoreModel, new_bars: dict[tuple[str, int], str]) -> str:
    """The text with the given bars replaced; multi-bar rests are split only where needed."""
    edits: dict[tuple[int, int], list[str]] = {}
    for (voice, number), text in new_bars.items():
        slot = model.shape.slot(voice, number)
        assert slot is not None
        parts = edits.setdefault((slot.start, slot.end), ["Z"] * slot.span)
        parts[slot.part] = text
    result = model.text
    for (start, end), parts in sorted(edits.items(), reverse=True):
        result = result[:start] + "|".join(_compress(parts) if len(parts) > 1 else parts) + result[end:]
    return result


# --- verification ---------------------------------------------------------------------


def _parse(text: str) -> upstream.Score:
    try:
        return upstream.parse_abc(text)
    except upstream.AbcError as error:
        raise PlenioValidationError(
            f"This edit would make the score invalid: {error}",
            hint="Bars must stay exactly full; change a neighbouring rest or note first.",
        ) from error


def _windows(
    model: ScoreModel, bars: Iterable[tuple[str, int]]
) -> dict[str, list[tuple[Fraction, Fraction]]]:
    windows: dict[str, list[tuple[Fraction, Fraction]]] = {voice: [] for voice in VOICES}
    for voice, number in bars:
        info = model.bars[voice][number - 1]
        windows[voice].append((info.onset, info.onset + info.length))
    return windows


def _overlaps(note: Sequence[object], windows: list[tuple[Fraction, Fraction]]) -> bool:
    onset, _pitch, duration = note
    assert isinstance(onset, Fraction) and isinstance(duration, Fraction)
    return any(onset < end and onset + duration > start for start, end in windows)


def verify(
    model: ScoreModel, text: str, bars: Iterable[tuple[str, int]], *, chords_may_change: bool = False
) -> upstream.Score:
    """Parse ``text`` and check that nothing outside ``bars`` changed."""
    after = _parse(text)
    before = model.score
    for voice in VOICES:
        if after.voices[voice].bars != before.voices[voice].bars:
            raise PlenioValidationError("Internal error: the edit changed the bar grid.")
        if after.voices[voice].keys != before.voices[voice].keys:
            raise PlenioValidationError("Internal error: the edit changed a key.")
    windows = _windows(model, bars)
    for voice in VOICES:
        outside_before = [n for n in before.voices[voice].notes if not _overlaps(n, windows[voice])]
        outside_after = [n for n in after.voices[voice].notes if not _overlaps(n, windows[voice])]
        if outside_before != outside_after:
            raise PlenioValidationError(
                f"Internal error: the edit changed {voice} notes outside the edited bars."
            )
    if not chords_may_change:
        if after.voices["Vocal"].chords != before.voices["Vocal"].chords:
            raise PlenioValidationError("Internal error: the edit changed chord symbols.")
    else:
        all_windows = [w for voice in VOICES for w in windows[voice]]
        inside = [c for c in before.voices["Vocal"].chords if not any(s <= c[0] < e for s, e in all_windows)]
        inside_after = [
            c for c in after.voices["Vocal"].chords if not any(s <= c[0] < e for s, e in all_windows)
        ]
        if inside != inside_after:
            raise PlenioValidationError(
                "Internal error: the edit changed chord symbols outside the edited bars."
            )
    return after


def _select(text: str, targets: Iterable[tuple[str, Fraction]]) -> tuple[str, ...]:
    """Ids of the elements at ``(voice, onset)`` in the edited text."""
    result = score_model.build(text)
    picked: list[str] = []
    for voice, onset in targets:
        element = score_model.element_at(result, voice, onset)
        if element is not None and element.id not in picked:
            picked.append(element.id)
    return tuple(picked)


def _rewrite(model: ScoreModel, bars: dict[tuple[str, int], list[Event]]) -> str:
    texts = {}
    for (voice, number), events in bars.items():
        texts[(voice, number)] = write_bar(events, model.bars[voice][number - 1].key)
    return replace_bars(model, texts)


def _note(model: ScoreModel, element_id: str) -> Element:
    element = model.element(element_id)
    if not element.is_note:
        raise PlenioValidationError(f"{element_id} is a rest; select a note.")
    return element


def _heads(model: ScoreModel, element_ids: Iterable[str]) -> list[list[Element]]:
    chains: list[list[Element]] = []
    seen: set[str] = set()
    for element_id in element_ids:
        chain = model.chain(_note(model, element_id).id)
        if chain[0].id not in seen:
            seen.add(chain[0].id)
            chains.append(chain)
    if not chains:
        raise PlenioValidationError("Select at least one note.")
    return chains


# --- note operations ----------------------------------------------------------------------


def set_pitch(
    text: str, element_ids: Sequence[str], *, midi: int | None = None, semitones: int | None = None
) -> EditResult:
    """Give the selected notes (with their tied continuations) a new pitch."""
    if (midi is None) == (semitones is None):
        raise PlenioValidationError("Give either a pitch or a number of semitones.")
    model = score_model.build(text)
    chains = _heads(model, element_ids)
    new_pitch: dict[str, tuple[int, str, int]] = {}  # element id -> (midi, letter, written)
    changes = []
    for chain in chains:
        head = chain[0]
        assert head.midi is not None
        target = midi if midi is not None else head.midi + (semitones or 0)
        if not 0 <= target <= 127:
            raise PlenioValidationError(f"{pitch_name(head.midi)} cannot move outside the MIDI range.")
        letter, alteration = _spell(target % 12, head.key)
        for segment in chain:
            new_pitch[segment.id] = (target, letter, target - alteration)
        if target != head.midi:
            changes.append(f"bar {head.bar} {head.voice}: {pitch_name(head.midi)} -> {pitch_name(target)}")
    if not changes:
        return EditResult(text, ("no pitch changed",), select=tuple(c[0].id for c in chains))
    affected = {(model.element(i).voice, model.element(i).bar) for i in new_pitch}
    bars: dict[tuple[str, int], list[Event]] = {}
    for voice, number in affected:
        events = bar_events(model, voice, number)
        for event in events:
            if event.element in new_pitch:
                event.midi, event.letter, event.written = new_pitch[event.element]
        bars[(voice, number)] = events
    result = _rewrite(model, bars)
    after = verify(model, result, affected)
    for chain in chains:
        head = chain[0]
        target = new_pitch[head.id][0]
        if not any(n[0] == head.onset and n[1] == target for n in after.voices[head.voice].notes):
            raise PlenioValidationError("Internal error: the note did not get its new pitch.")
    return EditResult(result, tuple(changes), select=tuple(c[0].id for c in chains))


def set_duration(text: str, element_id: str, units: int) -> EditResult:
    """Lengthen a note into the rests after it, or shorten it and fill the rest with a rest."""
    if units not in upstream.DURATIONS:
        raise PlenioValidationError(
            f"Length {units} is not a native note length.",
            hint=f"Use one of {sorted(upstream.DURATIONS)} units.",
        )
    model = score_model.build(text)
    element = _note(model, element_id)
    delta = units - element.units
    if delta == 0:
        return EditResult(text, ("no length changed",), select=(element.id,))
    events = bar_events(model, element.voice, element.bar)
    index = next(i for i, e in enumerate(events) if e.element == element.id)
    warnings: list[str] = []
    affected = {(element.voice, element.bar)}
    rewrite: dict[tuple[str, int], list[Event]] = {}
    if delta > 0:
        if element.tie_out:
            raise PlenioValidationError(
                "The note is tied to the next one; there is no room to lengthen it.",
                hint="Shorten or remove the tied continuation first.",
            )
        available, cursor = 0, index + 1
        while cursor < len(events) and available < delta:
            following = events[cursor]
            if following.kind == "chord":
                raise PlenioValidationError(
                    f"The chord {following.text} starts inside the new length; move or remove it first."
                )
            if following.kind != "rest":
                break
            available += following.units
            cursor += 1
        if available < delta:
            raise PlenioValidationError(
                f"Only {available} units of rest follow the note in bar {element.bar}; it cannot grow by {delta}.",
                hint="Turn the following note into a rest first, or choose a shorter length.",
            )
        events[index].units = units
        remaining = available - delta
        events[index + 1 : cursor] = [Event("rest", units=remaining)] if remaining else []
    else:
        events[index].units = units
        events.insert(index + 1, Event("rest", units=-delta))
        if element.tie_out:
            events[index].tie_out = False
            chain = model.chain(element.id)
            position = chain.index(element)
            nxt = chain[position + 1]
            warnings.append(
                f"bar {element.bar}: the tie to the next note was removed; it is now a new attack"
            )
            if (nxt.voice, nxt.bar) == (element.voice, element.bar):
                for event in events:
                    if event.element == nxt.id:
                        event.tie_in = False
            else:
                other = bar_events(model, nxt.voice, nxt.bar)
                for event in other:
                    if event.element == nxt.id:
                        event.tie_in = False
                rewrite[(nxt.voice, nxt.bar)] = other
                affected.add((nxt.voice, nxt.bar))
    rewrite[(element.voice, element.bar)] = _merge_rests(events)
    result = _rewrite(model, rewrite)
    verify(model, result, affected)
    change = f"bar {element.bar} {element.voice}: {pitch_name(element.midi or 0)} length {element.units} -> {units}"
    return EditResult(result, (change,), tuple(warnings), _select(result, [(element.voice, element.onset)]))


def note_to_rest(text: str, element_ids: Sequence[str]) -> EditResult:
    """Replace the selected notes (with their tied continuations) by rests."""
    model = score_model.build(text)
    chains = _heads(model, element_ids)
    removed = {segment.id for chain in chains for segment in chain}
    affected = {(model.element(i).voice, model.element(i).bar) for i in removed}
    bars: dict[tuple[str, int], list[Event]] = {}
    for voice, number in sorted(affected):
        events = bar_events(model, voice, number)
        for position, event in enumerate(events):
            if event.element in removed:
                events[position] = Event("rest", units=event.units, element=event.element)
        bars[(voice, number)] = _merge_rests(events)
    result = _rewrite(model, bars)
    verify(model, result, affected)
    changes = tuple(f"bar {c[0].bar} {c[0].voice}: {pitch_name(c[0].midi or 0)} -> rest" for c in chains)
    return EditResult(result, changes, select=_select(result, [(c[0].voice, c[0].onset) for c in chains]))


def _nearby_pitch(model: ScoreModel, element: Element) -> int:
    notes = [e for e in model.voice_elements(element.voice) if e.is_note and e.midi is not None]
    before = [e for e in notes if e.onset < element.onset]
    after = [e for e in notes if e.onset > element.onset]
    if before:
        return int(before[-1].midi or 0)
    if after:
        return int(after[0].midi or 0)
    return DEFAULT_PITCH[element.voice]


def rest_to_note(text: str, element_id: str, *, midi: int | None = None) -> EditResult:
    """Turn a rest (or a full-bar rest) into a note of the same length."""
    model = score_model.build(text)
    element = model.element(element_id)
    if element.is_note:
        raise PlenioValidationError(f"{element_id} is already a note.")
    pitch = midi if midi is not None else _nearby_pitch(model, element)
    if not 0 <= pitch <= 127:
        raise PlenioValidationError("The pitch is outside the MIDI range.")
    events = bar_events(model, element.voice, element.bar)
    position = next(i for i, e in enumerate(events) if e.element == element.id)
    units = element.units
    note_units = max(d for d in upstream.DURATIONS if d <= units)
    replacement = [Event("note", units=note_units, midi=pitch, element=element.id)]
    if units > note_units:
        replacement.append(Event("rest", units=units - note_units))
    events[position : position + 1] = replacement
    result = _rewrite(model, {(element.voice, element.bar): _merge_rests(events)})
    verify(model, result, {(element.voice, element.bar)})
    return EditResult(
        result,
        (f"bar {element.bar} {element.voice}: rest -> {pitch_name(pitch)}",),
        select=_select(result, [(element.voice, element.onset)]),
    )


def set_chord(text: str, element_id: str, name: str) -> EditResult:
    """Put (or replace) a chord symbol at the onset of the selected note or rest."""
    name = name.strip()
    if upstream.CHORD.fullmatch(name) is None:
        raise PlenioValidationError(
            f"{name!r} is not a supported chord symbol.",
            hint="Use a root (C, F#, Bb ...) with an optional quality (m, 7, maj7, m7, dim, sus4 ...) and bass (/E).",
        )
    model = score_model.build(text)
    selected = model.element(element_id)
    vocal = next((e for e in model.voice_elements("Vocal") if e.onset == selected.onset), None)
    if vocal is None:
        raise PlenioValidationError(
            "Chord symbols belong to the Vocal voice and start where it has a note or rest; "
            "this onset lies inside a longer Vocal note or rest.",
            hint="Select a note or rest that starts where the chord should start.",
        )
    events = bar_events(model, "Vocal", vocal.bar)
    position = next(i for i, e in enumerate(events) if e.element == vocal.id)
    previous = position - 1
    while previous >= 0 and events[previous].kind == "key":
        previous -= 1
    old = events[previous].text if previous >= 0 and events[previous].kind == "chord" else None
    if old is not None:
        events[previous] = Event("chord", name)
    else:
        events.insert(position, Event("chord", name))
    result = _rewrite(model, {("Vocal", vocal.bar): events})
    verify(model, result, {("Vocal", vocal.bar)}, chords_may_change=True)
    change = f"bar {vocal.bar}: chord {old} -> {name}" if old else f"bar {vocal.bar}: chord {name} added"
    return EditResult(result, (change,), select=_select(result, [(selected.voice, selected.onset)]))


def remove_chord(text: str, chord_id: str) -> EditResult:
    model = score_model.build(text)
    mark = model.chord(chord_id)
    events = bar_events(model, "Vocal", mark.bar)
    chord_positions = [i for i, e in enumerate(events) if e.kind == "chord"]
    del events[chord_positions[mark.index]]
    result = _rewrite(model, {("Vocal", mark.bar): events})
    verify(model, result, {("Vocal", mark.bar)}, chords_may_change=True)
    return EditResult(result, (f"bar {mark.bar}: chord {mark.name} removed",))


# --- section operations -----------------------------------------------------------------------


@dataclass
class _Section:
    label: str
    group: int
    first_bar: int
    bars: int = 0
    comment_lines: list[int] = field(default_factory=list)


def sections(text: str) -> list[_Section]:
    shape = structure(text)
    result: list[_Section] = []
    for group in shape.groups:
        if group.comments or not result:
            names = [shape.lines[i].text[2:].strip() for i in group.comments]
            label = next((n for n in reversed(names) if n), result[-1].label if result else "untitled")
            result.append(_Section(label, group.index, group.first_bar, 0, list(group.comments)))
        result[-1].bars += group.bars
    return result


def _label(label: str) -> str:
    cleaned = " ".join(label.strip().lower().split())
    if _LABEL.fullmatch(cleaned) is None:
        raise PlenioValidationError(
            f"{label!r} is not a usable section name.",
            hint="Use lower-case words such as verse, pre-chorus, chorus, bridge or outro (letters, digits, "
            "spaces and hyphens, at most 30 characters).",
        )
    return cleaned


def _lines(text: str) -> tuple[list[str], str]:
    ending = "\n" if text.endswith("\n") else ""
    return text.splitlines(), ending


def _split_group(text: str, bar: int) -> str:
    """Make ``bar`` the first bar of a group (splitting the group that contains it)."""
    shape = structure(text)
    group = next((g for g in shape.groups if g.first_bar <= bar < g.first_bar + g.bars), None)
    if group is None:
        raise PlenioValidationError(f"The score has no bar {bar}.")
    if group.first_bar == bar:
        return text
    lines, ending = _lines(text)
    cut = bar - group.first_bar
    first: list[str] = []
    second: list[str] = []
    for voice in VOICES:
        music = shape.lines[group.music[voice]].text
        bars = [s.text for s in shape.slots[voice] if s.group == group.index]
        first += [
            f"V: {voice}",
            *[lines[i] for i in group.fields[voice]],
            "|".join(_compress(bars[:cut])) + "|",
        ]
        second += [f"V: {voice}", "|".join(_compress(bars[cut:])) + "|"]
        assert music.endswith("|")
    start, end = group.voice_lines["Vocal"], group.music["Ins"]
    lines[start : end + 1] = first + second
    return "\n".join(lines) + ending


def _group_start_line(text: str, bar: int) -> int:
    shape = structure(text)
    group = next(g for g in shape.groups if g.first_bar == bar)
    return group.voice_lines["Vocal"]


def _section_result(model: ScoreModel, result: str, change: str) -> EditResult:
    after = _parse(result)
    comparison = upstream.compare(model.score, after)
    if not comparison["match"]:
        raise PlenioValidationError(
            f"Internal error: a section edit changed notes: {comparison['differences']}"
        )
    return EditResult(result, (change,))


def _section(text: str, index: int) -> tuple[list[_Section], _Section]:
    found = sections(text)
    if not 1 <= index <= len(found):
        raise PlenioValidationError(f"The score has no section {index}; it has {len(found)}.")
    return found, found[index - 1]


def rename_section(text: str, index: int, label: str) -> EditResult:
    model = score_model.build(text)
    new = _label(label)
    _all, section = _section(text, index)
    lines, ending = _lines(text)
    if section.comment_lines:
        first = section.comment_lines[0]
        lines[first : section.comment_lines[-1] + 1] = [f"% {new}"]
    else:
        lines.insert(_group_start_line(text, section.first_bar), f"% {new}")
    return _section_result(model, "\n".join(lines) + ending, f"section {index}: {section.label} -> {new}")


def split_section(text: str, bar: int, label: str) -> EditResult:
    """Start a new section at ``bar`` (inside an existing section)."""
    model = score_model.build(text)
    new = _label(label)
    found = sections(text)
    if bar <= 1 or bar > len(model.bars["Vocal"]):
        raise PlenioValidationError(f"A new section can start at bar 2 ... {len(model.bars['Vocal'])}.")
    if any(s.first_bar == bar for s in found):
        raise PlenioValidationError(f"A section already starts at bar {bar}; rename it instead.")
    result = _split_group(text, bar)
    lines, ending = _lines(result)
    lines.insert(_group_start_line(result, bar), f"% {new}")
    return _section_result(model, "\n".join(lines) + ending, f"new section {new} from bar {bar}")


def merge_section(text: str, index: int) -> EditResult:
    """Join section ``index`` to the section before it."""
    model = score_model.build(text)
    found, section = _section(text, index)
    if index == 1:
        raise PlenioValidationError("The first section has no section before it.")
    lines, ending = _lines(text)
    del lines[section.comment_lines[0] : section.comment_lines[-1] + 1]
    previous = found[index - 2]
    return _section_result(
        model, "\n".join(lines) + ending, f"section {section.label} joined to {previous.label}"
    )


def move_section_boundary(text: str, index: int, start_bar: int) -> EditResult:
    """Let section ``index`` start at ``start_bar`` (the most common transcription fix)."""
    model = score_model.build(text)
    found, section = _section(text, index)
    if index == 1:
        raise PlenioValidationError("The first section always starts at bar 1.")
    previous = found[index - 2]
    last = section.first_bar + section.bars - 1
    if not previous.first_bar < start_bar <= last:
        raise PlenioValidationError(
            f"Section {section.label} can start at bar {previous.first_bar + 1} ... {last}.",
            hint="Each section keeps at least one bar.",
        )
    if start_bar == section.first_bar:
        return EditResult(text, ("no boundary moved",))
    result = _split_group(text, start_bar)
    lines, ending = _lines(result)
    current = sections(result)[index - 1]
    del lines[current.comment_lines[0] : current.comment_lines[-1] + 1]
    result = "\n".join(lines) + ending
    lines, ending = _lines(result)
    lines.insert(_group_start_line(result, start_bar), f"% {section.label}")
    return _section_result(
        model,
        "\n".join(lines) + ending,
        f"section {section.label} now starts at bar {start_bar} (was {section.first_bar})",
    )
