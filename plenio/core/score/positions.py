"""Where things are in a native score's text: lines, groups and bars with character offsets.

The walk is tolerant - it also works on scores the upstream parser rejects - so that
diagnostics can point at a line and a bar, and the editor can mark them. It never decides
validity; that is the upstream parser's job.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from ...third_party import yue2_abc_tools as upstream

VOICES = upstream.VOICES
HEADER_LINES = 8
_LINE = re.compile(r"[^\r\n]*(?:\r\n|\r|\n)?")
_REST_BAR = re.compile(r"Z([2-4])?")


@dataclass(frozen=True)
class Line:
    index: int
    start: int
    end: int
    """Offset after the line's last character (before its line break)."""
    text: str


@dataclass(frozen=True)
class Slot:
    """One bar of one voice. Bars written as ``Z2``..``Z4`` share the token's range."""

    voice: str
    number: int
    """1-based bar number of the voice."""
    group: int
    """1-based group number."""
    line: int
    start: int
    end: int
    text: str
    """The bar's text; ``Z`` for every bar of a multi-bar rest."""
    span: int = 1
    part: int = 0


@dataclass
class Group:
    index: int
    comments: list[int] = field(default_factory=list)
    """Line indices of the ``% label`` comments directly before the group."""
    voice_lines: dict[str, int] = field(default_factory=dict)
    fields: dict[str, list[int]] = field(default_factory=dict)
    music: dict[str, int] = field(default_factory=dict)
    first_bar: int = 1
    bars: int = 0


@dataclass
class Structure:
    lines: list[Line]
    groups: list[Group]
    slots: dict[str, list[Slot]]

    def slot(self, voice: str, number: int) -> Slot | None:
        slots = self.slots.get(voice, [])
        return slots[number - 1] if 0 < number <= len(slots) else None


def split_lines(text: str) -> list[Line]:
    lines: list[Line] = []
    for index, match in enumerate(_LINE.finditer(text)):
        raw = match.group(0)
        if not raw and match.start() == len(text):
            if index == 0 or text.endswith(("\n", "\r")):
                break
        body = raw.rstrip("\r\n")
        lines.append(Line(index, match.start(), match.start() + len(body), body))
        if match.end() == len(text):
            break
    return lines


def bar_slots(line: Line, voice: str, group: int, first_number: int) -> list[Slot]:
    """The bars of one music line (the text before the final ``|``), tolerant of errors."""
    body = line.text[:-1] if line.text.endswith("|") else line.text
    slots: list[Slot] = []
    number, offset = first_number, 0
    for raw in body.split("|"):
        stripped = raw.strip()
        if stripped:
            start = line.start + offset + len(raw) - len(raw.lstrip())
            end = start + len(stripped)
            rest = _REST_BAR.fullmatch(stripped)
            span = int(rest.group(1) or "1") if rest else 1
            for part in range(span):
                text = "Z" if rest else stripped
                slots.append(Slot(voice, number, group, line.index, start, end, text, span, part))
                number += 1
        offset += len(raw) + 1
    return slots


def structure(text: str) -> Structure:
    """Groups and bars as far as the text follows the native layout."""
    lines = split_lines(text)
    groups: list[Group] = []
    slots: dict[str, list[Slot]] = {voice: [] for voice in VOICES}
    cursor = HEADER_LINES
    while cursor < len(lines):
        group = Group(len(groups) + 1)
        while cursor < len(lines) and lines[cursor].text.startswith("% "):
            group.comments.append(cursor)
            cursor += 1
        complete = True
        for voice in VOICES:
            if cursor >= len(lines) or lines[cursor].text != f"V: {voice}":
                complete = False
                break
            group.voice_lines[voice] = cursor
            cursor += 1
            group.fields[voice] = []
            while cursor < len(lines) and lines[cursor].text.startswith(("M:", "K:")):
                group.fields[voice].append(cursor)
                cursor += 1
            if cursor >= len(lines):
                complete = False
                break
            group.music[voice] = cursor
            bars = bar_slots(lines[cursor], voice, group.index, len(slots[voice]) + 1)
            if voice == "Vocal":
                group.first_bar, group.bars = len(slots[voice]) + 1, len(bars)
            slots[voice].extend(bars)
            cursor += 1
        if group.music:
            groups.append(group)
        if not complete:
            break
    return Structure(lines, groups, slots)


_CONTEXT = re.compile(r"group (\d+)(?:, (Vocal|Ins))?(?:, bar (\d+))?")
_HEADER_HINTS = (
    ("X:1", 0),
    ("T:", 1),
    ("M:", 2),
    ("meter", 2),
    ("L:", 3),
    ("Q:", 4),
    ("tempo", 4),
    ("voice definitions", 5),
    ("K:", 7),
    ("key", 7),
)


def locate(text: str, message: str) -> tuple[int, int, int] | None:
    """``(line number, start, end)`` of the text an upstream error message refers to."""
    shape = structure(text)
    context = _CONTEXT.search(message)
    if context:
        group_number, voice, bar = int(context.group(1)), context.group(2), context.group(3)
        if voice and bar:
            slot = shape.slot(voice, int(bar))
            if slot is not None:
                return slot.line + 1, slot.start, slot.end
        group = shape.groups[group_number - 1] if 0 < group_number <= len(shape.groups) else None
        if group is not None:
            index = group.music.get(voice or "Vocal", group.voice_lines.get(voice or "Vocal"))
            if index is None and group.comments:
                index = group.comments[-1]
            if index is not None:
                line = shape.lines[index]
                return line.index + 1, line.start, line.end
        if shape.lines:
            line = shape.lines[-1]
            return line.index + 1, line.start, line.end
        return None
    tie = re.match(r"(Vocal|Ins): unresolved tie", message)
    if tie and shape.slots[tie.group(1)]:
        slot = shape.slots[tie.group(1)][-1]
        return slot.line + 1, slot.start, slot.end
    lowered = message.lower()
    for hint, index in _HEADER_HINTS:
        if hint.lower() in lowered and index < len(shape.lines):
            line = shape.lines[index]
            return line.index + 1, line.start, line.end
    return None
