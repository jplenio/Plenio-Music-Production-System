"""The section plan: what the writer is asked, what it may answer, and how the answer is read.

The writer never writes ABC (general LLMs keep its bar arithmetic and voice alignment poorly - see
``docs/design/arrangement.md``). It answers a small JSON plan - per section the chords, what the
instrument line plays, the energy and a key shift - and ``apply`` turns the plan into notes with the
score operations, so the result is valid by construction. The JSON schema of a request makes local
models (llama.cpp, LM Studio, Ollama) produce exactly that format; any other answer is read leniently
and every correction is reported.
"""

from __future__ import annotations

import json
import re
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Any

from ...third_party import yue2_abc_tools as upstream
from ..score import canonical as c
from .modes import CHORD_COLORS, LEAD_ROLES, CreativeMode

ENERGY = (1, 5)
MAX_CHORDS = 32
"""Chord symbols per section in a plan: one per bar (a shorter list repeats over the section)."""
MAX_MOTIF_NOTES = 16
SKIP_FROM = 95
"""Cover closeness from which nothing may change: the arrangement step is skipped (no writer call)."""
MELODY = ("vocal", "instrument", "none")
"""Where the melody is: sung (the Vocal voice), played by the instrument line (an instrumental with a lead:
the Ins voice carries it) or nowhere (accompaniment only)."""
NEEDS_CHORDS = ("pad", "arpeggio", "riff", "countermelody", "solo", "motif")
"""Lead roles built on the section's chords (a section without chords keeps its line)."""
_CHORD = r"[A-G](#|b)?(m\(maj7\)|maj7|m7b5|7sus4|dim7|sus2|sus4|dim|aug|m7|m6|m|7|6)?(/[A-G](#|b)?)?"
CHORD_PATTERN = f"^{_CHORD}$"
CHORD_PATTERN_OR_KEEP = f"^(keep|{_CHORD})$"
CHORD_LIST_PATTERN = f"^(keep|{_CHORD})(( - | *[,|] *| +)(keep|{_CHORD}))*$"
"""``keep``, or chords as one text (``C | G | Am``): writers write them so, and a schema that allowed only
``keep`` as text made every model of study A1 keep all chords."""
"""A chord symbol YuE2 reads, or ``keep`` (that bar keeps its chord); llama.cpp turns it into a grammar."""
NOTE_PATTERN = r"^(rest|[A-G](#|b)?[2-6])$"
_NOTE = re.compile(r"^([A-G])(#|b)?([2-6])$")
_PITCH_CLASS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
_LETTER_NAMES = ("C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B")


# --- the score as the writer sees it --------------------------------------------------------


@dataclass(frozen=True)
class SectionInfo:
    index: int
    """1-based position of the section in the score."""
    label: str
    first_bar: int
    """1-based number of the section's first bar."""
    bars: int
    chords: tuple[str, ...]
    """The chord sounding at the start of every bar (``-`` for none)."""
    melody: tuple[str, ...]
    """The melody's notes on the strong beats of every bar (``-`` where it rests)."""
    line: str
    """What the instrument line plays now: ``rests``, ``melody`` (it carries the song's melody) or ``line``."""


@dataclass(frozen=True)
class ScoreSummary:
    key: str
    meter: str
    tempo: int
    seconds: float
    bars: int
    sections: tuple[SectionInfo, ...]
    vocal_range: tuple[int, int] | None
    melody: str
    """``vocal``, ``instrument`` or ``none`` (``MELODY``)."""

    @property
    def has_chords(self) -> bool:
        return any(chord != "-" for s in self.sections for chord in s.chords)

    def describe(self) -> str:
        where = {
            "vocal": "",
            "instrument": ", instrumental: the instrument line carries the melody",
            "none": ", instrumental without a lead melody (accompaniment only)",
        }[self.melody]
        lines = [
            f"Key {self.key}, meter {self.meter}, tempo {self.tempo} BPM, {self.bars} bars, "
            f"{int(self.seconds // 60)}:{int(self.seconds % 60):02d}"
            + (
                f", sung range {_name(self.vocal_range[0])}-{_name(self.vocal_range[1])}"
                if self.vocal_range
                else ""
            )
            + where
        ]
        for s in self.sections:
            bars = f"bar {s.first_bar}" if s.bars == 1 else f"bars {s.first_bar}-{s.first_bar + s.bars - 1}"
            melody = f"; melody on the strong beats {' | '.join(s.melody)}" if self.melody != "none" else ""
            lines.append(
                f"{s.index}. {s.label} ({bars}): chords {' | '.join(s.chords)}{melody}; instrument line: {s.line}"
            )
        return "\n".join(lines)


def _name(midi: int) -> str:
    return f"{_LETTER_NAMES[midi % 12]}{midi // 12 - 1}"


def chord_at(score: c.Score, onset: int) -> str | None:
    """The chord symbol sounding at ``onset`` (the last one at or before it)."""
    sounding = None
    for chord in score.chords:
        if chord.onset > onset:
            break
        sounding = chord.name
    return sounding


def section_ranges(score: c.Score) -> list[tuple[str, int, int]]:
    """``(label, first measure, end measure)`` of every section (0-based measures); one section ``song``
    when the score names none."""
    if not score.sections:
        return [("song", 0, score.measure_count)]
    starts = [s.measure for s in score.sections]
    ends = [*starts[1:], score.measure_count]
    ranges = [(s.label, s.measure, end) for s, end in zip(score.sections, ends, strict=True)]
    if starts[0] > 0:
        ranges.insert(0, ("intro", 0, starts[0]))
    return ranges


def strong_positions(start: int, length: int, meter: tuple[int, int]) -> list[int]:
    """The strong beats of a bar: its first beat, and its middle in even meters (4/4, 6/8, 2/2)."""
    if meter[0] % 2 == 0 and meter[0] >= 2 and length >= 2:
        return [start, start + length // 2]
    return [start]


def _strong_notes(score: c.Score, voice: Sequence[c.Note], measure: int) -> str:
    names = []
    for position in strong_positions(score.starts[measure], score.lengths[measure], score.meters[measure]):
        pitch = next((n.pitch for n in voice if n.onset <= position < n.end), None)
        names.append(_LETTER_NAMES[pitch % 12] if pitch is not None else "-")
    return " ".join(names)


def melody_of(*, instrumental: bool, melody: str) -> str:
    """``MELODY`` of a brief: sung, an instrumental whose lead the instrument line plays (``melody`` =
    ``lead``), or accompaniment only."""
    if not instrumental:
        return "vocal"
    return "instrument" if melody == "lead" else "none"


def melody_voice(score: c.Score, melody: str) -> tuple[c.Note, ...]:
    """The notes that carry the melody (none for accompaniment only)."""
    if melody == "vocal":
        return score.vocal
    return score.ins if melody == "instrument" else ()


def summarize(score: c.Score, *, melody: str) -> ScoreSummary:
    sections = []
    voice = melody_voice(score, melody)
    for index, (label, first, end) in enumerate(section_ranges(score), start=1):
        start, stop = score.starts[first], score.starts[end]
        chords = tuple(chord_at(score, score.starts[m]) or "-" for m in range(first, end))
        notes = tuple(_strong_notes(score, voice, m) for m in range(first, end))
        plays = any(start <= n.onset < stop for n in score.ins)
        line = "rests" if not plays else "melody" if melody == "instrument" else "line"
        sections.append(SectionInfo(index, label, first + 1, end - first, chords, notes, line))
    meters = {f"{n}/{d}" for n, d in score.meters}
    vocal = [n.pitch for n in score.vocal]
    return ScoreSummary(
        key=score.keys[0].key,
        meter=f"{score.meters[0][0]}/{score.meters[0][1]}" + (" (changes)" if len(meters) > 1 else ""),
        tempo=score.tempo,
        seconds=score.seconds(score.total),
        bars=score.measure_count,
        sections=tuple(sections),
        vocal_range=(min(vocal), max(vocal)) if vocal else None,
        melody=melody,
    )


# --- what the plan may change ---------------------------------------------------------------


@dataclass(frozen=True)
class Policy:
    """The limits of one request: the creative mode narrowed by the closeness slider."""

    mode: CreativeMode
    kind: str
    """``song`` (closeness to the genre) or ``cover`` (closeness to the original's song flow)."""
    closeness: int
    melody: str
    """``MELODY``: where the melody is - it always stays."""
    chords: bool
    lead: tuple[str, ...]
    replace_lines: bool
    """Whether a line the score already has may be replaced (otherwise only silent sections get one)."""
    key_shift: tuple[int, int]
    tempo_change: tuple[int, int]
    tensions: str
    """How strictly chords must fit the melody: ``strict``, ``colour`` (seconds and sixths) or ``free``."""
    qualities: tuple[str, ...]
    slash: bool

    @property
    def skip(self) -> bool:
        """No section plan: the simple mode, or a cover that keeps its original song flow completely."""
        return not self.mode.arranges or (self.kind == "cover" and self.closeness >= SKIP_FROM)

    @property
    def skip_reason(self) -> str:
        if not self.mode.arranges:
            return "simple mode: the music model plans the music by itself"
        if self.skip:
            return f"song flow closeness {self.closeness}: the original stays as it is"
        return ""


def _narrow(span: tuple[int, int], low: int, high: int) -> tuple[int, int]:
    return max(span[0], low), min(span[1], high)


def policy(mode: CreativeMode, *, kind: str, closeness: int, melody: str) -> Policy:
    """The limits of a section plan: the mode's choices narrowed by the closeness slider, and the melody kept
    (an instrument line that carries it is never replaced)."""
    closeness = max(0, min(100, int(closeness)))
    chords, replace_lines, tensions = True, True, "strict"
    key_shift, tempo = mode.key_shift, mode.tempo_change
    if kind == "cover":
        if closeness >= 80:
            chords, replace_lines = False, False
            key_shift, tempo = (0, 0), (0, 0)
        elif closeness >= 50:
            key_shift, tempo = _narrow(key_shift, 0, 2), (0, 0)
        elif closeness >= 20:
            tempo, tensions = _narrow(tempo, -10, 10), "colour"
        else:
            tensions = "free"
    else:
        if closeness >= 90:
            key_shift, tempo = _narrow(key_shift, 0, 2), (0, 0)
        elif closeness >= 70:
            tempo = (0, 0)
        elif closeness >= 40:
            tensions = "colour"
        else:
            tensions = "free"
    lead = mode.lead
    if melody == "instrument":
        replace_lines = False  # the instrument line is the melody: lines go only where it rests
        lead = tuple(r for r in lead if r not in ("countermelody", "octave"))
    elif melody == "none":
        lead = tuple(r for r in lead if r not in ("solo", "countermelody", "octave"))  # no lead is wanted
    return Policy(
        mode=mode,
        kind=kind,
        closeness=closeness,
        melody=melody,
        chords=chords,
        lead=lead or ("keep",),
        replace_lines=replace_lines,
        key_shift=key_shift,
        tempo_change=tempo,
        tensions=tensions,
        qualities=CHORD_COLORS[mode.chord_colors],
        slash=mode.chord_colors >= 3,
    )


def closeness_text(kind: str, closeness: int, genre: str = "") -> str:
    """A closeness slider in words: the genre closeness of a song, the song flow closeness of a cover."""
    c_ = max(0, min(100, int(closeness)))
    if kind == "cover":
        if c_ >= SKIP_FROM:
            return "Keep the original's song flow exactly as it is."
        if c_ >= 80:
            return (
                "Stay very close to the original: every chord, the key and the tempo stay; only sections whose "
                "instrument line rests may get a line."
            )
        if c_ >= 50:
            return (
                "Stay recognisably close to the original: the melody, the form and the tempo stay; you may "
                "recolour chords, change the instrument lines and lift a section's key a little."
            )
        if c_ >= 20:
            return (
                "Make a free version: new chords, new instrument lines, another energy and tempo; the melody and "
                "the form stay."
            )
        return (
            "Keep only a hint of the original: reinvent the harmony, the lines, the tempo and the energy; only "
            "the melody and the form remain."
        )
    genre = genre.strip() or "the genre"
    if c_ >= 90:
        return f"Stay strictly within the conventions of {genre}: typical chords and instrument roles, no surprises."
    if c_ >= 70:
        return f"Stay close to {genre}: typical choices with small personal touches."
    if c_ >= 40:
        return f"Be free within {genre}: personal choices and ideas from neighbouring styles are welcome."
    return f"Be free: borrow from any style and surprise the listener; {genre} is only the starting point."


def writer_lines(mode: CreativeMode, *, kind: str, closeness: int, genre: str) -> list[str]:
    """The rules a creative mode adds to the writing prompt (none for ``simple``): its writer hints and,
    for a song, the genre closeness (a cover's song flow closeness concerns the score only)."""
    if not mode.arranges:
        return []
    lines = [
        f"- Creative mode '{mode.name}': {line.strip().removeprefix('- ').strip()}"
        for line in mode.writer.splitlines()
        if line.strip()
    ]
    if kind == "song":
        level = max(0, min(100, int(closeness)))
        lines.append(f"- Genre closeness {level} of 100: {closeness_text('song', level, genre)}")
    if lines:
        lines.append(
            "- The creative hints never override the rules above (the format and length of each part)."
        )
    return lines


# --- the request -----------------------------------------------------------------------------


def schema(policy: Policy, sections: int) -> dict[str, Any]:
    """The JSON schema of the answer (local models are held to it by constrained decoding)."""
    chords: dict[str, Any] = (
        {
            "anyOf": [
                {"type": "string", "pattern": CHORD_LIST_PATTERN},
                {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": MAX_CHORDS,
                    "items": {"type": "string", "pattern": CHORD_PATTERN_OR_KEEP},
                },
            ]
        }
        if policy.chords
        else {"type": "string", "enum": ["keep"]}
    )
    item: dict[str, Any] = {
        "type": "object",
        "properties": {
            "section": {"type": "integer", "minimum": 1, "maximum": sections},
            "chords": chords,
            "lead": {"type": "string", "enum": list(policy.lead)},
            "energy": {"type": "integer", "minimum": ENERGY[0], "maximum": ENERGY[1]},
            "key_shift": {"type": "integer", "minimum": policy.key_shift[0], "maximum": policy.key_shift[1]},
        },
        "required": ["section", "chords", "lead", "energy", "key_shift"],
        "additionalProperties": False,
    }
    if "motif" in policy.lead:
        item["properties"]["motif"] = {
            "type": "array",
            "maxItems": MAX_MOTIF_NOTES,
            "items": {
                "type": "object",
                "properties": {
                    "note": {"type": "string", "pattern": NOTE_PATTERN},
                    "beats": {"type": "number", "minimum": 0.25, "maximum": 4},
                },
                "required": ["note", "beats"],
                "additionalProperties": False,
            },
        }
    return {
        "type": "object",
        "properties": {
            "idea": {"type": "string", "maxLength": 240},
            "tempo_change": {
                "type": "integer",
                "minimum": policy.tempo_change[0],
                "maximum": policy.tempo_change[1],
            },
            "sections": {"type": "array", "minItems": sections, "maxItems": sections, "items": item},
        },
        "required": ["idea", "tempo_change", "sections"],
        "additionalProperties": False,
    }


_FIT_TEXT = {
    "strict": "- A new chord must contain the melody notes on its bar's strong beats (shown per bar above); where it "
    "does not, Plenio keeps the planned chord.",
    "colour": "- A new chord must contain the melody notes on its bar's strong beats (shown per bar above) or have "
    "them as its 2nd/9th or 6th; where it does not, Plenio keeps the planned chord.",
    "free": "- A new chord may colour the melody freely, but no melody note on a strong beat (shown per bar above) "
    "may lie a half step above a chord note; where one does, Plenio keeps the planned chord.",
}
_ROLE_TEXT = {
    "keep": "keep - the line YuE2 planned stays",
    "none": "none - the instrument line is silent",
    "pad": "pad - long held chord notes",
    "arpeggio": "arpeggio - broken chords",
    "riff": "riff - a short rhythmic figure on every chord",
    "countermelody": "countermelody - a second melody that moves against the sung one",
    "solo": "solo - an improvised instrumental solo",
    "octave": "octave - doubles the sung melody an octave away",
    "motif": 'motif - your own short figure, given in "motif" (see below), repeated on every chord',
}


def prompt(
    summary: ScoreSummary,
    policy: Policy,
    *,
    brief_text: str,
    genre: str,
    style: str = "",
    lyrics: str = "",
    engine_name: str = "YuE2",
) -> str:
    """The arrangement prompt: the score as a table, the mode, the closeness and the exact answer format."""
    qualities = ", ".join(f"C{q}" for q in policy.qualities)  # shown on C: "C" is major, nothing is added
    roles = "\n".join(f"  - {_ROLE_TEXT[r]}" for r in policy.lead)
    n = len(summary.sections)
    example_section = summary.sections[0]
    example_chords: Any = (
        list(example_section.chords[: min(4, example_section.bars)]) if policy.chords else "keep"
    )
    if example_chords != "keep" and "-" in example_chords:
        example_chords = "keep"
    example = {
        "idea": "one sentence: the idea of the arrangement",
        "tempo_change": 0,
        "sections": [
            {
                "section": 1,
                "chords": example_chords,
                "lead": policy.lead[min(1, len(policy.lead) - 1)],
                "energy": 2,
                "key_shift": 0,
            },
            {"section": 2, "chords": "keep", "lead": policy.lead[0], "energy": 4, "key_shift": 0},
        ][: max(1, min(2, n))],
    }
    parts = [
        f"You are an arranger preparing a song for the AI music model {engine_name}. {engine_name} has already planned "
        "the melody and the chords below. Plan how each section is arranged. Plenio writes the notes from your plan: "
        "do not write notes, ABC or any other notation.",
        "",
        "SONG",
        brief_text.strip(),
    ]
    if style.strip():
        parts.append(f"Style: {style.strip()}")
    if lyrics.strip():
        parts += ["", "LYRICS (for the mood only)", lyrics.strip()[:1500]]
    parts += [
        "",
        "SCORE",
        summary.describe(),
        "",
        f"MODE: {policy.mode.name} - {policy.mode.description}",
        policy.mode.arranger.strip(),
        "",
        f"FREEDOM: {closeness_text(policy.kind, policy.closeness, genre)}",
    ]
    if policy.melody == "instrument":
        parts.append(
            'The instrument line carries the melody: where it plays, it stays ("keep"); give a role only to the '
            'sections where it rests ("rests" above).'
        )
    elif policy.melody == "none":
        parts.append(
            "The song has no lead melody (accompaniment only): the instrument line only accompanies."
        )
    elif not policy.replace_lines:
        parts.append('Sections whose instrument line already plays keep it ("keep").')
    if policy.chords and not summary.has_chords:
        parts.append(
            "The score has no chords yet: give chords to every section that should get an instrument line - "
            "lines are built on the chords, a section without chords keeps its line."
        )
    parts += [
        "",
        "ANSWER: only this JSON, nothing else:",
        json.dumps(example, ensure_ascii=False),
        f'- "sections": exactly {n} entries, one per section, in order ("section": 1 to {n}).',
        (
            '- "chords": "keep" (the planned chords stay) or one chord symbol per bar (a shorter list repeats over '
            'the section; "keep" in the list keeps that bar\'s chord). A chord is a root A-G with an optional # or b '
            f"and one of these endings, shown on C: {qualities}"
            + ("; an optional bass after / (C/E)." if policy.slash else ". No other chord names.")
            if policy.chords
            else '- "chords": always "keep" (the chords stay as they are).'
        ),
        *([_FIT_TEXT[policy.tensions]] if policy.chords and policy.melody != "none" else []),
        '- "lead": what the instrument line plays:',
        roles,
        '- "energy": 1 (calm) to 5 (full): how busy the instrument line is.',
        (
            f'- "key_shift": semitones the section moves, {policy.key_shift[0]} to {policy.key_shift[1]} '
            "(0 keeps the key; a last chorus often goes up 1 or 2)."
            if policy.key_shift != (0, 0)
            else '- "key_shift": always 0.'
        ),
        (
            f'- "tempo_change": percent for the whole song, {policy.tempo_change[0]} to {policy.tempo_change[1]}.'
            if policy.tempo_change != (0, 0)
            else '- "tempo_change": always 0.'
        ),
    ]
    if "motif" in policy.lead:
        parts.append(
            '- "motif" (only with lead "motif"): your figure for one or two bars as a list of '
            '{"note": "E4", "beats": 1} - a note name with octave (C4 = middle C) or "rest", and its length in '
            "quarter-note beats. Write it over the section's first chord; Plenio moves it onto the chord of "
            "every bar."
        )
    return "\n".join(parts)


# --- the answer ------------------------------------------------------------------------------


LEAD_ALIASES = {
    "line": "keep",
    "melody": "keep",
    "same": "keep",
    "original": "keep",
    "rest": "none",
    "rests": "none",
    "silent": "none",
    "silence": "none",
    "tacet": "none",
    "pads": "pad",
    "sustain": "pad",
    "strings": "pad",
    "chords": "pad",
    "arp": "arpeggio",
    "arpeggios": "arpeggio",
    "broken chords": "arpeggio",
    "ostinato": "riff",
    "groove": "riff",
    "counter": "countermelody",
    "counter melody": "countermelody",
    "counter-melody": "countermelody",
    "lead": "solo",
    "improvisation": "solo",
    "double": "octave",
    "doubling": "octave",
    "unison": "octave",
    "hook": "motif",
    "figure": "motif",
}
"""Words writers use for the lead roles (``line`` and ``melody`` copy the score table: what plays now)."""


@dataclass(frozen=True)
class SectionPlan:
    section: int
    chords: tuple[str | None, ...] | None
    """``None``: the planned chords stay; a ``None`` item: that bar keeps its planned chord."""
    lead: str = "keep"
    energy: int = 3
    key_shift: int = 0
    motif: tuple[tuple[int | None, Fraction], ...] = ()
    """``(MIDI pitch or None for a rest, beats)``."""


@dataclass(frozen=True)
class Plan:
    idea: str
    tempo_change: int
    sections: tuple[SectionPlan, ...]
    notes: tuple[str, ...] = field(default=())
    """What reading the answer corrected or ignored, in words."""
    dropped: tuple[str, ...] = field(default=())
    """The notes about parts of the answer that could not be used (the plan is incomplete)."""

    def to_dict(self) -> dict[str, Any]:
        return {
            "idea": self.idea,
            "tempo_change": self.tempo_change,
            "sections": [
                {
                    "section": s.section,
                    "chords": [ch or "keep" for ch in s.chords] if s.chords is not None else "keep",
                    "lead": s.lead,
                    "energy": s.energy,
                    "key_shift": s.key_shift,
                    **(
                        {
                            "motif": [
                                {"note": _name(p) if p is not None else "rest", "beats": float(b)}
                                for p, b in s.motif
                            ]
                        }
                        if s.motif
                        else {}
                    ),
                }
                for s in self.sections
            ],
            "notes": list(self.notes),
            "dropped": list(self.dropped),
        }


class PlanError(ValueError):
    """The answer holds no usable plan at all (the arrangement falls back to the planned score)."""


_FENCE = re.compile(r"```(?:json)?", re.IGNORECASE)
_THINK = re.compile(r"<think>.*?</think>", re.DOTALL)
_TRAILING_COMMA = re.compile(r",\s*([}\]])")
_BARE_LIST = re.compile(r'("chords"\s*:\s*)((?:"[^"]*"\s*,\s*)+"[^"]*")(?=\s*[,}])')
"""``"chords": "C", "G", "lead": ...`` - a list without its brackets (Gemma 4 12B once in study A1)."""


_CLOSER = {"{": "}", "[": "]"}


def _balanced(text: str) -> str:
    """The first JSON object in ``text``: up to its closing brace, or - when the writer stopped before
    closing it (small models often drop the last ``}``) - cut after the last complete value and closed."""
    start = text.find("{")
    if start < 0:
        return ""
    stack: list[str] = []
    in_string = escaped = False
    last_complete = start
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
                last_complete = index
            continue
        if char == '"':
            in_string = True
        elif char in _CLOSER:
            stack.append(_CLOSER[char])
        elif char in "}]":
            if not stack or stack[-1] != char:
                break  # not JSON any more
            stack.pop()
            last_complete = index
            if not stack:
                return text[start : index + 1]
        elif not char.isspace() and char not in ",:":
            last_complete = index
    if not stack:
        return text[start:]
    # unclosed: keep what was complete, drop a dangling key or comma, close what is open
    head = text[start : last_complete + 1].rstrip()
    head = re.sub(r',\s*("[^"]*"\s*:?)?\s*$', "", head)
    opened: list[str] = []
    in_string = escaped = False
    for char in head:
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char in _CLOSER:
            opened.append(_CLOSER[char])
        elif char in "}]" and opened:
            opened.pop()
    return head + "".join(reversed(opened))


def _json_object(text: str) -> Any:
    text = _THINK.sub("", text)
    if "</think>" in text:
        text = text.split("</think>", 1)[1]
    text = _FENCE.sub("", text)
    if "{" not in text:
        raise PlanError("the answer contains no JSON object")
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")
    raw = _balanced(text)
    attempts = [raw, _TRAILING_COMMA.sub(r"\1", raw)]
    attempts.append(_BARE_LIST.sub(r"\1[\2]", attempts[-1]))
    attempts.append(
        re.sub(r"\bTrue\b", "true", re.sub(r"\bFalse\b", "false", re.sub(r"\bNone\b", "null", attempts[-1])))
    )
    if '"' not in raw:  # Python quotes: balance after turning them into JSON quotes
        attempts.append(_balanced(attempts[-1].replace("'", '"')))
    for attempt in attempts:
        try:
            return json.loads(attempt)
        except ValueError:
            continue
    raise PlanError("the JSON in the answer cannot be read")


_QUALITY_ALIASES = {
    "": "",
    "maj": "",
    "major": "",
    "M": "",
    "m": "m",
    "min": "m",
    "minor": "m",
    "-": "m",
    "mi": "m",
    "7": "7",
    "dom7": "7",
    "9": "7",
    "11": "7",
    "13": "7",
    "7#9": "7",
    "7b9": "7",
    "maj7": "maj7",
    "M7": "maj7",
    "Maj7": "maj7",
    "maj9": "maj7",
    "Δ": "maj7",
    "Δ7": "maj7",
    "m7": "m7",
    "min7": "m7",
    "-7": "m7",
    "m9": "m7",
    "m11": "m7",
    "6": "6",
    "m6": "m6",
    "add9": "",
    "add2": "",
    "sus": "sus4",
    "sus4": "sus4",
    "sus2": "sus2",
    "7sus4": "7sus4",
    "7sus": "7sus4",
    "dim": "dim",
    "°": "dim",
    "o": "dim",
    "dim7": "dim7",
    "°7": "dim7",
    "o7": "dim7",
    "aug": "aug",
    "+": "aug",
    "m7b5": "m7b5",
    "ø": "m7b5",
    "ø7": "m7b5",
    "m(maj7)": "m(maj7)",
    "mMaj7": "m(maj7)",
    "mM7": "m(maj7)",
}
_SIMPLER = {
    "7": "",
    "maj7": "",
    "m7": "m",
    "6": "",
    "m6": "m",
    "7sus4": "sus4",
    "dim": "m",
    "dim7": "m",
    "m7b5": "m",
    "aug": "",
    "m(maj7)": "m",
    "sus2": "",
    "sus4": "",
}
_ROOT = re.compile(r"^([A-Ha-h])(#|b|♯|♭)?(.*)$")
_QUALITY_WORDS = re.compile(
    r"\b([A-H](?:#|b|♯|♭)?)\s+(major|minor|maj7|maj9|maj|min7|min|m7|dim7|dim|aug|sus2|sus4|sus|add9)\b",
    re.IGNORECASE,
)
"""``F major``, ``A minor``: the word belongs to the chord before it (Gemma 4 E4B in S-9)."""


def normalize_chord(text: str, policy: Policy) -> tuple[str | None, str]:
    """A supported chord symbol for ``text`` within the policy's colours, and a note when it changed."""
    raw = str(text).strip()
    main, _, bass = raw.partition("/")
    match = _ROOT.match(main)
    if match is None:
        return None, f"{raw!r} is not a chord"
    letter, accidental, rest = match.groups()
    letter = "B" if letter in "Hh" else letter.upper()
    accidental = {"♯": "#", "♭": "b"}.get(accidental or "", accidental or "")
    quality = _QUALITY_ALIASES.get(rest.strip(), _QUALITY_ALIASES.get(rest.strip().lower()))
    if quality is None:
        return None, f"{raw!r}: unknown chord quality {rest!r}"
    note = ""
    while quality not in policy.qualities:
        simpler = _SIMPLER.get(quality, "")
        quality = simpler
        note = "simplified to the mode's chord colours"
    name = f"{letter}{accidental}{quality}"
    if bass:
        bass_match = _ROOT.match(bass.strip())
        if policy.slash and bass_match and not bass_match.group(3):
            b_letter = "B" if bass_match.group(1) in "Hh" else bass_match.group(1).upper()
            b_acc = {"♯": "#", "♭": "b"}.get(bass_match.group(2) or "", bass_match.group(2) or "")
            name = f"{name}/{b_letter}{b_acc}"
        else:
            note = note or "bass note dropped"
    if upstream.CHORD.fullmatch(name) is None:
        return None, f"{raw!r} is not a chord YuE2 reads"
    if not note and name != raw and name.lower() != raw.lower():
        note = "the nearest chord YuE2 reads"
    if note:
        return name, f"{raw} -> {name} ({note})"
    return name, (f"{raw} -> {name}" if name != raw else "")


def _motif(value: Any, drop: Callable[[str], None], where: str) -> tuple[tuple[int | None, Fraction], ...]:
    if not isinstance(value, list):
        return ()
    events: list[tuple[int | None, Fraction]] = []
    for item in value[:MAX_MOTIF_NOTES]:
        if isinstance(item, Mapping):
            pitch_text, beats = item.get("note"), item.get("beats")
        elif isinstance(item, Sequence) and not isinstance(item, str) and len(item) == 2:
            pitch_text, beats = item[0], item[1]
        else:
            continue
        try:
            length = Fraction(str(beats)).limit_denominator(4)
        except (ValueError, ZeroDivisionError):
            continue
        if not Fraction(1, 4) <= length <= 4:
            continue
        text = str(pitch_text).strip()
        if text.lower() == "rest":
            events.append((None, length))
            continue
        match = _NOTE.match(text)
        if match is None:
            continue
        letter, accidental, octave = match.groups()
        pitch = (int(octave) + 1) * 12 + _PITCH_CLASS[letter] + {"#": 1, "b": -1}.get(accidental or "", 0)
        events.append((pitch, length))
    if value and not events:
        drop(f"{where}: the motif could not be read")
    return tuple(events)


def _int(value: Any, low: int, high: int, default: int) -> tuple[int, bool]:
    """``(value clamped into low..high, whether it was usable as given)``."""
    try:
        number = round(float(value))
    except (TypeError, ValueError):
        return default, False
    clamped = max(low, min(high, number))
    return clamped, clamped == number


def read_plan(answer: str, policy: Policy, sections: int) -> Plan:
    """The plan in ``answer``, held to the policy; unusable parts are dropped and noted.

    Raises ``PlanError`` when the answer holds no plan at all."""
    data = _json_object(answer)
    if not isinstance(data, Mapping):
        raise PlanError("the JSON is not an object")
    entries = data.get("sections")
    if not isinstance(entries, list) or not entries:
        raise PlanError('the plan has no "sections" list')
    notes: list[str] = []
    dropped: list[str] = []

    def drop(text: str) -> None:
        notes.append(text)
        dropped.append(text)

    planned: dict[int, SectionPlan] = {}
    for position, entry in enumerate(entries, start=1):
        if not isinstance(entry, Mapping):
            drop(f"entry {position} is not an object and was ignored")
            continue
        number, ok = _int(entry.get("section", position), 1, sections, position)
        if not ok:
            notes.append(
                f"entry {position}: section {entry.get('section')!r} does not exist; read as section {position}"
            )
            number = position
        if number in planned or number > sections:
            drop(f"entry {position} repeats or exceeds the sections and was ignored")
            continue
        where = f"section {number}"
        chords: tuple[str | None, ...] | None = None
        value = entry.get("chords", "keep")
        if isinstance(value, str) and value.strip().lower() not in ("keep", ""):
            value = [
                part
                for part in re.split(r"[\s,|]+", _QUALITY_WORDS.sub(r"\1\2", value))
                if part.strip("-–—.")
            ]
        if isinstance(value, list) and value:
            if not policy.chords:
                drop(f"{where}: the chords stay at this closeness")
            else:
                names: list[str | None] = []
                for item in value[:MAX_CHORDS]:
                    if str(item).strip().lower() in ("keep", "-", "same", ""):
                        names.append(None)  # this bar keeps its planned chord
                        continue
                    name, note = normalize_chord(str(item), policy)
                    if name is None:
                        drop(f"{where}: {note}; that bar keeps its planned chord")
                    elif note:
                        notes.append(f"{where}: {note}")
                    names.append(name)
                if len(value) > MAX_CHORDS:
                    drop(f"{where}: only the first {MAX_CHORDS} chords are used")
                if any(names):
                    chords = tuple(names)
        lead = str(entry.get("lead", "keep")).strip().lower()
        if lead in LEAD_ALIASES:
            notes.append(f"{where}: lead {lead!r} read as {LEAD_ALIASES[lead]!r}")
            lead = LEAD_ALIASES[lead]
        if lead not in LEAD_ROLES:
            drop(f'{where}: unknown lead {lead!r}; the line stays ("keep")')
            lead = "keep"
        elif lead not in policy.lead:
            drop(f'{where}: lead {lead!r} is not part of this mode and closeness; the line stays ("keep")')
            lead = "keep"
        energy, ok = _int(entry.get("energy", 3), ENERGY[0], ENERGY[1], 3)
        if not ok:
            notes.append(f"{where}: energy set to {energy}")
        shift, ok = _int(entry.get("key_shift", 0), policy.key_shift[0], policy.key_shift[1], 0)
        if not ok:
            notes.append(f"{where}: key shift limited to {shift}")
        motif = _motif(entry.get("motif"), drop, where) if lead == "motif" else ()
        if lead == "motif" and not motif:
            drop(f'{where}: lead "motif" without a readable motif; arpeggio instead')
            lead = "arpeggio" if "arpeggio" in policy.lead else "keep"
        planned[number] = SectionPlan(number, chords, lead, energy, shift, motif)
    missing = [i for i in range(1, sections + 1) if i not in planned]
    if missing:
        drop(
            f"no plan for section{'s' if len(missing) > 1 else ''} {', '.join(map(str, missing))}: unchanged"
        )
    if not planned:
        raise PlanError("no section of the plan could be read")
    tempo, ok = _int(data.get("tempo_change", 0), policy.tempo_change[0], policy.tempo_change[1], 0)
    if not ok:
        notes.append(f"tempo change limited to {tempo} %")
    idea = str(data.get("idea", "")).strip()[:240]
    full = tuple(planned.get(i, SectionPlan(i, None)) for i in range(1, sections + 1))
    return Plan(idea, tempo, full, tuple(notes), tuple(dropped))
