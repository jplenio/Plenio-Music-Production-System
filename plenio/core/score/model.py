"""Note-level view of a native score for the editor.

Every note and rest token becomes an *element* with a stable-for-this-text id
(``V12.3`` = Vocal, bar 12, fourth note/rest token; ``I`` = Ins; ``C12.0`` = the first
chord symbol of bar 12), its position in the text and its sounding pitch. Pitches follow
the upstream parser exactly (accidentals by letter across octaves, unmarked tied
continuations keep their pitch), and the upstream parser must accept the text first.

``display_abc`` is the text abcjs renders: the same score with every accidental that
standard ABC would read differently written out, and section names as annotations. It is
never used as the model's score (extra tokens would change what YuE2 reads).
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..errors import PlenioValidationError
from .positions import HEADER_LINES, Structure, structure

VOICES = upstream.VOICES
PREFIX = {"Vocal": "V", "Ins": "I"}
ACCIDENTAL_VALUE = {"=": 0, "_": -1, "__": -2, "^": 1, "^^": 2}
ACCIDENTAL_TEXT = {-2: "__", -1: "_", 0: "=", 1: "^", 2: "^^"}
PITCH_NAMES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
CHORD_INTERVALS = {
    "": (0, 4, 7),
    "m": (0, 3, 7),
    "dim": (0, 3, 6),
    "aug": (0, 4, 8),
    "7": (0, 4, 7, 10),
    "maj7": (0, 4, 7, 11),
    "m7": (0, 3, 7, 10),
    "dim7": (0, 3, 6, 9),
    "m7b5": (0, 3, 6, 10),
    "sus4": (0, 5, 7),
    "sus2": (0, 2, 7),
    "6": (0, 4, 7, 9),
    "m6": (0, 3, 7, 9),
    "7sus4": (0, 5, 7, 10),
    "m(maj7)": (0, 3, 7, 11),
}


def pitch_name(midi: int) -> str:
    return f"{PITCH_NAMES[midi % 12]}{midi // 12 - 1}"


def _written(letter: str, lower: bool, octave: str) -> int:
    return (
        60
        + int(upstream.NATURAL[letter])
        + (12 if lower else 0)
        + 12 * (octave.count("'") - octave.count(","))
    )


@dataclass(frozen=True)
class Element:
    id: str
    voice: str
    bar: int
    index: int
    kind: str
    """``note``, ``rest`` or ``bar_rest`` (a full-bar ``Z``)."""
    onset: Fraction
    """Quarter notes from the start of the score."""
    offset: Fraction
    """Quarter notes from the start of the bar."""
    duration: Fraction
    units: int
    start: int
    end: int
    key: str
    midi: int | None = None
    letter: str = ""
    written: int = 0
    """MIDI number of the written letter and octave without accidental."""
    accidental: str = ""
    tie_in: bool = False
    tie_out: bool = False
    chord: str | None = None

    @property
    def is_note(self) -> bool:
        return self.kind == "note"


@dataclass(frozen=True)
class ChordMark:
    id: str
    bar: int
    index: int
    onset: Fraction
    name: str
    start: int
    end: int


@dataclass(frozen=True)
class BarInfo:
    number: int
    onset: Fraction
    length: Fraction
    meter: tuple[int, int]
    key: str
    """Key in effect at the start of the bar."""


@dataclass
class ScoreModel:
    text: str
    shape: Structure
    score: upstream.Score
    elements: tuple[Element, ...]
    chords: tuple[ChordMark, ...]
    bars: dict[str, tuple[BarInfo, ...]]
    _by_id: dict[str, Element] = field(default_factory=dict, repr=False)

    def __post_init__(self) -> None:
        self._by_id = {element.id: element for element in self.elements}

    @property
    def bpm(self) -> int:
        return int(self.score.bpm)

    @property
    def unit(self) -> Fraction:
        return Fraction(self.score.unit)

    def element(self, element_id: str) -> Element:
        try:
            return self._by_id[element_id]
        except KeyError as error:
            raise PlenioValidationError(
                f"The score has no note or rest {element_id!r}.",
                hint="The score changed; select the note again.",
            ) from error

    def chord(self, chord_id: str) -> ChordMark:
        for mark in self.chords:
            if mark.id == chord_id:
                return mark
        raise PlenioValidationError(f"The score has no chord symbol {chord_id!r}.")

    def in_bar(self, voice: str, bar: int) -> list[Element]:
        return [e for e in self.elements if e.voice == voice and e.bar == bar]

    def chords_in_bar(self, bar: int) -> list[ChordMark]:
        return [c for c in self.chords if c.bar == bar]

    def voice_elements(self, voice: str) -> list[Element]:
        return [e for e in self.elements if e.voice == voice]

    def chain(self, element_id: str) -> list[Element]:
        """The written segments of the sounding note that contains ``element_id`` (ties)."""
        element = self.element(element_id)
        if not element.is_note:
            return [element]
        segments = self.voice_elements(element.voice)
        index = segments.index(element)
        start = index
        while start > 0 and segments[start].tie_in:
            start -= 1
        end = index
        while end < len(segments) - 1 and segments[end].tie_out:
            end += 1
        return segments[start : end + 1]

    def seconds(self, quarters: Fraction) -> float:
        return float(quarters * 60 / self.bpm)


def build(text: str) -> ScoreModel:
    """The element view of ``text``; raises ``PlenioValidationError`` for invalid scores."""
    try:
        score = upstream.parse_abc(text)
    except upstream.AbcError as error:
        raise PlenioValidationError(f"The score is not valid native two-voice ABC: {error}") from error
    shape = structure(text)
    lines = shape.lines
    header_meter = upstream.meter_value(lines[2].text[2:])
    header_key = lines[7].text[2:]
    elements: list[Element] = []
    chords: list[ChordMark] = []
    bars: dict[str, list[BarInfo]] = {voice: [] for voice in VOICES}
    for voice in VOICES:
        prefix = PREFIX[voice]
        key, meter = header_key, header_meter
        time = Fraction(0)
        pending: tuple[int, int] | None = None
        for group in shape.groups:
            for index in group.fields.get(voice, []):
                name, value = lines[index].text.split(":", 1)
                if name == "M":
                    meter = upstream.meter_value(value)
                else:
                    key = value
            for slot in (s for s in shape.slots[voice] if s.group == group.index):
                length = Fraction(4 * meter[0], meter[1])
                bars[voice].append(BarInfo(slot.number, time, length, meter, key))
                if slot.text == "Z":
                    units = int(length / (score.unit * 4))
                    elements.append(
                        Element(
                            f"{prefix}{slot.number}.0",
                            voice,
                            slot.number,
                            0,
                            "bar_rest",
                            time,
                            Fraction(0),
                            length,
                            units,
                            slot.start,
                            slot.end,
                            key,
                        )
                    )
                    time += length
                    continue
                local: dict[str, int] = {}
                offset = Fraction(0)
                count = 0
                chord_count = 0
                chord_here: str | None = None
                cursor = 0
                body = slot.text
                while cursor < len(body):
                    if body[cursor].isspace():
                        cursor += 1
                        continue
                    match = upstream.TOKEN.match(body, cursor)
                    assert match is not None  # the upstream parser accepted the text
                    start, end = slot.start + match.start(), slot.start + match.end()
                    cursor = match.end()
                    if match.group("chord") is not None:
                        chord_here = match.group("chord")
                        chords.append(
                            ChordMark(
                                f"C{slot.number}.{chord_count}",
                                slot.number,
                                chord_count,
                                time + offset,
                                chord_here,
                                start,
                                end,
                            )
                        )
                        chord_count += 1
                        continue
                    if match.group("key") is not None:
                        key = match.group("key")
                        local = {}
                        continue
                    note, acc, octave, tie = match.group("note", "acc", "oct", "tie")
                    units = int(match.group("duration") or "1")
                    duration = units * score.unit * 4
                    element_id = f"{prefix}{slot.number}.{count}"
                    if note == "z":
                        elements.append(
                            Element(
                                element_id,
                                voice,
                                slot.number,
                                count,
                                "rest",
                                time + offset,
                                offset,
                                duration,
                                units,
                                start,
                                end,
                                key,
                                chord=chord_here,
                            )
                        )
                    else:
                        letter = note.upper()
                        written = _written(letter, note.islower(), octave)
                        alteration = local.get(letter, upstream.key_accidentals(key)[letter])
                        if acc:
                            alteration = ACCIDENTAL_VALUE[acc]
                            local[letter] = alteration
                        pitch = written + alteration
                        tie_in = pending is not None
                        if pending is not None and not acc and written == pending[1]:
                            pitch = pending[0]
                        elements.append(
                            Element(
                                element_id,
                                voice,
                                slot.number,
                                count,
                                "note",
                                time + offset,
                                offset,
                                duration,
                                units,
                                start,
                                end,
                                key,
                                pitch,
                                letter,
                                written,
                                acc or "",
                                tie_in,
                                bool(tie),
                                chord_here,
                            )
                        )
                        pending = (pitch, written) if tie else None
                    chord_here = None
                    count += 1
                    offset += duration
                time += length
    return ScoreModel(
        text,
        shape,
        score,
        tuple(elements),
        tuple(chords),
        {voice: tuple(infos) for voice, infos in bars.items()},
    )


# --- display ------------------------------------------------------------------------


def _section_starts(model: ScoreModel) -> list[tuple[int, str]]:
    """(first bar, label) of every group that starts a section."""
    starts: list[tuple[int, str]] = []
    label = "untitled"
    for group in model.shape.groups:
        if group.comments:
            names = [model.shape.lines[i].text[2:].strip() for i in group.comments]
            label = next((n for n in reversed(names) if n), label)
            starts.append((group.first_bar, label))
        elif not starts:
            starts.append((group.first_bar, label))
    return starts


def _annotation(label: str) -> str:
    text = " ".join(word.capitalize() for word in label.replace('"', "").split())
    return f'"^{text}"'


@dataclass(frozen=True)
class Display:
    abc: str
    ranges: dict[str, tuple[int, int]]
    """Element and chord ids -> their range in ``abc``."""


def display(model: ScoreModel) -> Display:
    """``display_abc`` and the display range of every element and chord."""
    insertions: list[tuple[int, int, str]] = []  # (position, order, text)
    first_vocal = {e.bar: e for e in reversed(model.voice_elements("Vocal"))}
    first_chord = {c.bar: c for c in reversed(model.chords)}
    for bar, label in _section_starts(model):
        anchor = [x for x in (first_vocal.get(bar), first_chord.get(bar)) if x is not None]
        if anchor:
            insertions.append((min(a.start for a in anchor), 0, _annotation(label)))
    for voice in VOICES:
        state: dict[tuple[str, int], int] = {}
        current = (0, "")
        for element in model.voice_elements(voice):
            if (element.bar, element.key) != current:
                state, current = {}, (element.bar, element.key)
            if not element.is_note or element.midi is None:
                continue
            alteration = element.midi - element.written
            where = (element.letter, element.written)
            if element.accidental:
                state[where] = ACCIDENTAL_VALUE[element.accidental]
                continue
            default = state.get(where, upstream.key_accidentals(element.key)[element.letter])
            if alteration != default:
                insertions.append((element.start, 1, ACCIDENTAL_TEXT[alteration]))
                state[where] = alteration
    # Full-bar rests are written out as plain rests, bar by bar: abcjs draws "Z4" as one bar
    # (misaligning the voices) and "Z" with a bar count. (start, end, order, text); start == end
    # for insertions.
    edits: list[tuple[int, int, int, str]] = [(p, p, o, t) for p, o, t in insertions]
    rest_bars = {(e.start, e.end): f"z{e.units}" for e in model.elements if e.kind == "bar_rest"}
    compressed = {
        (s.start, s.end): s.span for voice in VOICES for s in model.shape.slots[voice] if s.text == "Z"
    }
    edits += [
        (start, end, 2, "|".join([rest_bars[(start, end)]] * span))
        for (start, end), span in compressed.items()
    ]
    edits.sort(key=lambda item: (item[0], item[2]))
    parts: list[str] = []
    cursor = 0
    for start, end, _order, replacement in edits:
        parts.append(model.text[cursor:start])
        parts.append(replacement)
        cursor = end

    parts.append(model.text[cursor:])

    def shift(offset: int, *, at_start: bool) -> int:
        """Display offset of a source offset (``at_start``: after annotations inserted there)."""
        moved = offset
        for start, end, order, replacement in edits:
            if end < offset or (end == offset and start < offset):
                moved += len(replacement) - (end - start)
            elif start == end == offset and at_start and order == 0:
                moved += len(replacement)
        return moved

    ranges: dict[str, tuple[int, int]] = {}
    for element in model.elements:
        if element.kind == "bar_rest":  # the n-th bar of a written-out full-bar rest
            slot = model.shape.slot(element.voice, element.bar)
            assert slot is not None
            width = len(rest_bars[(element.start, element.end)])
            first = shift(element.start, at_start=True) + (width + 1) * slot.part
            ranges[element.id] = (first, first + width)
        else:
            ranges[element.id] = (shift(element.start, at_start=True), shift(element.end, at_start=False))
    ranges.update({c.id: (shift(c.start, at_start=True), shift(c.end, at_start=False)) for c in model.chords})
    return Display("".join(parts), ranges)


# --- playback events --------------------------------------------------------------------


def _chord_pitches(name: str) -> list[int]:
    root_text, _, bass_text = name.partition("/")
    root_letter = root_text[0]
    rest = root_text[1:]
    shift = 0
    while rest[:1] in ("#", "b"):
        shift += 1 if rest[0] == "#" else -1
        rest = rest[1:]
    intervals = CHORD_INTERVALS.get(rest, (0, 4, 7))
    root = 48 + (upstream.NATURAL[root_letter] + shift) % 12  # C3 ... B3
    pitches = [root + i for i in intervals]
    if bass_text:
        bass = upstream.NATURAL[bass_text[0]] + bass_text[1:].count("#") - bass_text[1:].count("b")
        pitches.insert(0, 36 + bass % 12)
    return pitches


def view(text: str) -> dict[str, Any]:
    """Everything the editor shows and plays, derived from ``text`` (JSON-ready)."""
    model = build(text)
    shown = display(model)
    per_bar_seconds = {b.number: model.seconds(b.onset) for b in model.bars["Vocal"]}

    def element_dict(e: Element) -> dict[str, Any]:
        item: dict[str, Any] = {
            "id": e.id,
            "voice": e.voice,
            "bar": e.bar,
            "kind": e.kind,
            "units": e.units,
            "onset_q": float(e.onset),
            "duration_q": float(e.duration),
            "start_s": round(model.seconds(e.onset), 4),
            "duration_s": round(model.seconds(e.duration), 4),
            "source": [e.start, e.end],
            "display": list(shown.ranges[e.id]),
        }
        if e.is_note and e.midi is not None:
            item.update(midi=e.midi, name=pitch_name(e.midi), tie_in=e.tie_in, tie_out=e.tie_out)
        if e.chord:
            item["chord"] = e.chord
        return item

    notes: dict[str, list[dict[str, Any]]] = {}
    for voice in VOICES:
        heads = [e for e in model.voice_elements(voice) if e.is_note and not e.tie_in]
        items = []
        for head in heads:
            chain = model.chain(head.id)
            duration = sum((s.duration for s in chain), Fraction(0))
            items.append(
                {
                    "id": head.id,
                    "segments": [s.id for s in chain],
                    "midi": head.midi,
                    "start_s": round(model.seconds(head.onset), 4),
                    "duration_s": round(model.seconds(duration), 4),
                }
            )
        notes[voice] = items
    end = model.score.voices["Vocal"].time
    chord_events = []
    for index, mark in enumerate(model.chords):
        until = model.chords[index + 1].onset if index + 1 < len(model.chords) else end
        chord_events.append(
            {
                "id": mark.id,
                "name": mark.name,
                "bar": mark.bar,
                "pitches": _chord_pitches(mark.name),
                "start_s": round(model.seconds(mark.onset), 4),
                "duration_s": round(model.seconds(until - mark.onset), 4),
                "source": [mark.start, mark.end],
                "display": list(shown.ranges[mark.id]),
            }
        )
    return {
        "elements": [element_dict(e) for e in model.elements],
        "chords": chord_events,
        "notes": notes,
        "bar_starts_s": [round(per_bar_seconds[n], 4) for n in sorted(per_bar_seconds)],
        "display_abc": shown.abc,
    }


def element_at(model: ScoreModel, voice: str, onset: Fraction) -> Element | None:
    for element in model.voice_elements(voice):
        if element.onset <= onset < element.onset + element.duration:
            return element
    return None


def ids(elements: Iterable[Element]) -> list[str]:
    return [e.id for e in elements]


__all__ = [
    "HEADER_LINES",
    "BarInfo",
    "ChordMark",
    "Display",
    "Element",
    "ScoreModel",
    "build",
    "display",
    "element_at",
    "pitch_name",
    "view",
]
