"""Where the lyrics are sung: lines on the Vocal phrases, syllables on notes (owner's request 2026-10-01).

YuE2 reads the lyrics section by section; it does not put syllables on notes. This layout is the
editor's picture of where the words fall - the same rule the lyrics writer follows (one line per
Vocal phrase, about one syllable per note; ``native.phrasing``):

- a lyrics block belongs to a labelled section of the score (in order; by tag when the numbers differ);
- the section's Vocal notes form phrases, split at rests of at least a beat;
- the lines take the section's notes in order, as many as their syllables ask for: a line starts where a
  phrase starts wherever it can, may run on over the next phrase when its syllables need it, and every
  sung note belongs to a line (owner's report 2026-10-08: with a line per phrase, lines that did not match
  the phrases were crammed onto two or three notes while other phrases stayed empty - 18 % of the lines,
  15 % of the sung notes in the owner's songs);
- each syllable takes a note; a line with fewer syllables spreads them over its phrases and holds each
  phrase's last syllable over the rest of it (a melisma), one with more puts the rest on its last note;
- with more lines than notes, lines share a phrase in order.

A line placed by hand (the piano roll's lyrics lane: moved, made longer or shorter, pasted) has a
**span** - ``[start, end)`` in units of L, kept with the sheet. A section with spans is placed by them:
its lines take its spans in order (the first line the earliest span), each syllable a note that starts
inside its line's span; lines past the last span follow on the notes after it by the rule above.

The piano roll draws the lines over their phrases and edits them there, the notation shows the
syllables under the notes (``w:`` lines of the display text) and the MusicXML export writes them as
``<lyric>`` elements. A layout never changes the score or the lyrics.
"""

from __future__ import annotations

import re
from collections.abc import Sequence
from dataclasses import dataclass, field, replace
from typing import Any

from .. import lyrics as lyrics_rules
from .. import syllables
from . import canonical, ops

_VOWELS = re.compile(r"[aeiouyäöüàáâèéêìíîòóôùúûæøå]+", re.IGNORECASE)
_DIRECTION = re.compile(r"^\s*[\(\[\{<].*[\)\]\}>]\s*$")


@dataclass(frozen=True)
class Syllable:
    onset: int
    """The Vocal note (its onset in units of L) the syllable is sung on."""
    text: str
    end_of_word: bool
    """``False``: the word goes on (a hyphen follows)."""


@dataclass(frozen=True)
class Line:
    block: int
    line: int
    text: str
    start: int
    end: int
    syllables: tuple[Syllable, ...]
    holds: tuple[int, ...] = ()
    """Notes (onsets) over which the line's last syllable is held."""


@dataclass(frozen=True)
class SectionLayout:
    section: int
    """Index in the score's sections (with the implicit first one, as the editor's view counts)."""
    block: int | None
    tag: str | None
    phrases: tuple[tuple[int, int], ...]
    lines: tuple[Line, ...]


@dataclass(frozen=True)
class LyricLayout:
    sections: tuple[SectionLayout, ...]
    unplaced: tuple[int, ...] = field(default=())
    """Blocks that found no section of the score."""

    def syllables(self) -> dict[int, Syllable]:
        """Every syllable by the onset of its note."""
        return {s.onset: s for section in self.sections for line in section.lines for s in line.syllables}

    def holds(self) -> set[int]:
        return {onset for section in self.sections for line in section.lines for onset in line.holds}

    def to_dict(self) -> dict[str, Any]:
        return {
            "sections": [
                {
                    "section": s.section,
                    "block": s.block,
                    "tag": s.tag,
                    "phrases": [list(p) for p in s.phrases],
                    "lines": [
                        {
                            "block": line.block,
                            "line": line.line,
                            "text": line.text,
                            "start": line.start,
                            "end": line.end,
                            "syllables": [
                                {"onset": y.onset, "text": y.text, "end_of_word": y.end_of_word}
                                for y in line.syllables
                            ],
                            "holds": list(line.holds),
                        }
                        for line in s.lines
                    ],
                }
                for s in self.sections
            ],
            "unplaced": list(self.unplaced),
        }


def split_word(word: str) -> list[str]:
    """A word in syllables (``syllables.split``, the count of ``lyrics.estimate_syllables``)."""
    return syllables.split(word) or [word]


def syllables_of(line: str) -> list[tuple[str, bool]]:
    """``(syllable, end of word)`` of a sung line; hyphenated words split at their hyphens too."""
    result: list[tuple[str, bool]] = []
    for word in line.split():
        parts = [p for p in word.split("-") if p]
        pieces = [piece for part in parts for piece in split_word(part)]
        result += [(piece, index == len(pieces) - 1) for index, piece in enumerate(pieces)]
    return result


def _join(pieces: Sequence[tuple[str, bool]]) -> tuple[str, bool]:
    text = ""
    for piece, end in pieces:
        text += piece + (" " if end else "")
    return text.rstrip(), pieces[-1][1]


def _phrases(notes: Sequence[canonical.Note], gap: int) -> list[list[canonical.Note]]:
    phrases: list[list[canonical.Note]] = []
    previous_end: int | None = None
    for note in notes:
        if previous_end is None or note.onset - previous_end >= gap:
            phrases.append([])
        phrases[-1].append(note)
        previous_end = note.end
    return phrases


def _key(tag: str) -> str:
    """A tag or label as the lyrics checks compare them: no brackets, no trailing number, lower case."""
    return re.sub(r"\s*\d+$", "", tag.strip("[]").strip()).lower()


def _match(
    blocks: Sequence[lyrics_rules.LyricsSection], labels: Sequence[str]
) -> tuple[list[int | None], list[int]]:
    """For every labelled section the block it sings (by order, or by tag when the counts differ)."""
    if len(blocks) == len(labels):
        return list(range(len(blocks))), []
    mapping: list[int | None] = [None] * len(labels)
    unplaced: list[int] = []
    next_section = 0
    for index, block in enumerate(blocks):
        found = next(
            (i for i in range(next_section, len(labels)) if _key(labels[i]) == _key(block.tag)), None
        )
        if found is None:
            unplaced.append(index)
        else:
            mapping[found] = index
            next_section = found + 1
    return mapping, unplaced


def _placed(
    block_index: int, j: int, line: str, pieces: Sequence[tuple[str, bool]], region: Sequence[canonical.Note]
) -> Line:
    """``line`` sung on the notes ``region``: a syllable per note, the last held or the rest joined."""
    if len(pieces) <= len(region):
        placed = [Syllable(n.onset, t, e) for n, (t, e) in zip(region, pieces, strict=False)]
        holds = tuple(n.onset for n in region[len(pieces) :])
    else:
        placed = [Syllable(n.onset, t, e) for n, (t, e) in zip(region[:-1], pieces, strict=False)]
        joined, end_of_word = _join(pieces[len(region) - 1 :])
        placed.append(Syllable(region[-1].onset, joined, end_of_word))
        holds = ()
    return Line(block_index, j, line, region[0].onset, region[-1].end, tuple(placed), holds)


CROWD_COST = 1.0
"""The layout's cost of a syllable more than its line has notes (several syllables joined on one note)."""
HOLD_COST = 0.4
"""Of a note more than its line has syllables (a syllable held over it): a melisma is natural, a crowd is not."""
MID_PHRASE_COST = 1.5
"""Of a line that starts inside a phrase (not after a rest)."""
CROSS_COST = 0.5
"""Of every phrase a line runs on into (one line per phrase is the plan's own picture)."""


def _spread(
    block_index: int,
    j: int,
    line: str,
    pieces: Sequence[tuple[str, bool]],
    groups: Sequence[Sequence[canonical.Note]],
) -> Line:
    """``line`` on the notes of one or more phrases: with no more syllables than notes, each phrase gets its
    share of the syllables (at least one) and holds its last one; with more, ``_placed``."""
    region = [n for group in groups for n in group]
    if len(groups) == 1 or len(pieces) > len(region) or len(pieces) < len(groups):
        return _placed(block_index, j, line, pieces, region)
    shares = [1] * len(groups)
    rest = len(pieces) - len(groups)
    room = [len(g) - 1 for g in groups]
    while rest > 0:  # the next syllable to the phrase with the most notes per syllable that still has room
        best = max(
            (i for i in range(len(groups)) if room[i] > 0),
            key=lambda i: (len(groups[i]) / shares[i], -i),
        )
        shares[best] += 1
        room[best] -= 1
        rest -= 1
    placed: list[Syllable] = []
    holds: list[int] = []
    cursor = 0
    for group, share in zip(groups, shares, strict=True):
        part = pieces[cursor : cursor + share]
        cursor += share
        placed += [Syllable(n.onset, text, end) for n, (text, end) in zip(group, part, strict=False)]
        holds += [n.onset for n in group[len(part) :]]
    return Line(block_index, j, line, region[0].onset, region[-1].end, tuple(placed), tuple(holds))


def _auto(
    block_index: int,
    sung: Sequence[tuple[int, str]],
    phrases: Sequence[Sequence[canonical.Note]],
    cursor: int,
) -> list[Line]:
    """The lines ``sung`` (``(index in the block, text)``) on ``phrases`` by the rule of the module: the
    cheapest split of the section's notes into one run per line (``CROWD_COST`` ... ``CROSS_COST``)."""
    words = [(j, line, [] if _DIRECTION.match(line) else syllables_of(line)) for j, line in sung]
    lyric = [w for w in words if w[2]]
    notes = [n for phrase in phrases for n in phrase]
    if not lyric or len(lyric) > len(notes):
        return _sequential(block_index, sung, phrases, cursor)
    phrase_of = [i for i, phrase in enumerate(phrases) for _ in phrase]
    starts = {sum(len(p) for p in phrases[:i]) for i in range(len(phrases))}
    count, total = len(lyric), len(notes)
    inf = float("inf")
    best = [[inf] * (total + 1) for _ in range(count + 1)]
    step: list[list[int]] = [[-1] * (total + 1) for _ in range(count + 1)]
    best[0][0] = 0.0
    for i in range(count):
        size = len(lyric[i][2])
        longest = max(4 * size, size + 12)
        for j in range(total):
            if best[i][j] == inf:
                continue
            start_cost = 0.0 if j in starts else MID_PHRASE_COST
            last = total - (count - i - 1)  # the lines after this one need a note each
            for k in range(j + 1, min(last, j + longest) + 1):
                n = k - j
                cost = best[i][j] + start_cost
                cost += CROWD_COST * (size - n) if size > n else HOLD_COST * (n - size)
                cost += CROSS_COST * (phrase_of[k - 1] - phrase_of[j])
                if cost < best[i + 1][k]:
                    best[i + 1][k], step[i + 1][k] = cost, j
    if best[count][total] == inf:
        return _sequential(block_index, sung, phrases, cursor)
    runs: list[tuple[int, int]] = []
    k = total
    for i in range(count, 0, -1):
        j = step[i][k]
        runs.append((j, k))
        k = j
    runs.reverse()
    placed = {id(entry): (a, b) for entry, (a, b) in zip(lyric, runs, strict=True)}
    lines: list[Line] = []
    for entry in words:
        j, line, pieces = entry
        run = placed.get(id(entry))
        if run is None:  # a direction ("(guitar solo)"): shown where the words stopped
            lines.append(Line(block_index, j, line, cursor, cursor, ()))
            continue
        a, b = run
        groups: list[list[canonical.Note]] = []
        for index in range(a, b):
            if not groups or phrase_of[index] != phrase_of[index - 1]:
                groups.append([])
            groups[-1].append(notes[index])
        made = _spread(block_index, j, line, pieces, groups)
        lines.append(made)
        cursor = made.end
    return lines


def _sequential(
    block_index: int,
    sung: Sequence[tuple[int, str]],
    phrases: Sequence[Sequence[canonical.Note]],
    cursor: int,
) -> list[Line]:
    """A line per phrase, lines sharing a phrase in order when there are more of them (more lines than
    notes: the fallback of ``_auto``)."""
    lines: list[Line] = []
    phrase, offset = 0, 0
    for order, (j, line) in enumerate(sung):
        pieces = [] if _DIRECTION.match(line) else syllables_of(line)
        remaining_lines = sum(1 for _, rest in sung[order:] if not _DIRECTION.match(rest))
        if not pieces or phrase >= len(phrases):
            # a direction ("(guitar solo)") or a line without a phrase left: shown where the words stopped
            lines.append(Line(block_index, j, line, cursor, cursor, ()))
            continue
        notes_left = phrases[phrase][offset:]
        if remaining_lines <= len(phrases) - phrase:
            region = notes_left
            phrase, offset = phrase + 1, 0
        else:
            region = notes_left[: max(1, min(len(pieces), len(notes_left)))]
            offset += len(region)
            if offset >= len(phrases[phrase]):
                phrase, offset = phrase + 1, 0
        lines.append(_placed(block_index, j, line, pieces, region))
        cursor = region[-1].end
    return lines


def _pinned(
    block_index: int,
    sung: Sequence[tuple[int, str]],
    notes: Sequence[canonical.Note],
    spans: Sequence[tuple[int, int]],
    gap: int,
) -> list[Line]:
    """The lines ``sung`` on the spans placed by hand (in order); the lines past the last span follow
    on the notes after it. A note belongs to the first span it starts in."""
    lines: list[Line] = []
    taken: set[int] = set()
    for (j, line), (start, end) in zip(sung, spans, strict=False):
        pieces = [] if _DIRECTION.match(line) else syllables_of(line)
        region = [n for n in notes if start <= n.onset < end and n.onset not in taken]
        if not pieces or not region:
            lines.append(Line(block_index, j, line, start, end, ()))
            continue
        taken.update(n.onset for n in region)
        placed = _placed(block_index, j, line, pieces, region)
        lines.append(replace(placed, start=start, end=end))
    rest = sung[len(spans) :]
    if rest:
        last = max(end for _, end in spans)
        after = [n for n in notes if n.onset >= last and n.onset not in taken]
        lines += _auto(block_index, rest, _phrases(after, gap), after[0].onset if after else last)
    return lines


def layout(score: canonical.Score, text: str, spans: Sequence[Sequence[int]] | None = None) -> LyricLayout:
    """Where the lyrics ``text`` fall in ``score`` (an empty layout for empty or tag-only lyrics);
    ``spans``: the lines placed by hand (``[start, end)`` in units of L, see the module)."""
    parsed = lyrics_rules.parse_lyrics(text or "")
    starts = ops._section_starts(score)
    labelled = [i for i, section in enumerate(starts) if section in score.sections]
    mapping, unplaced = _match(parsed.sections, [starts[i].label for i in labelled])
    gap = max(1, score.unit.denominator // 4)  # a beat of rest (a quarter) splits phrases
    pinned = [(int(a), int(b)) for a, b in (spans or ()) if int(b) > int(a)]
    sections: list[SectionLayout] = []
    for position, index in enumerate(labelled):
        block_index = mapping[position]
        first = starts[index].measure
        last = starts[index + 1].measure if index + 1 < len(starts) else score.measure_count
        start, end = score.starts[first], score.starts[last]
        notes = [n for n in score.vocal if start <= n.onset < end]
        phrases = _phrases(notes, gap)
        phrase_spans = tuple((p[0].onset, p[-1].end) for p in phrases)
        if block_index is None:
            sections.append(SectionLayout(index, None, None, phrase_spans, ()))
            continue
        block = parsed.sections[block_index]
        sung = [(j, line) for j, line in enumerate(block.lines)]
        mine = sorted((a, b) for a, b in pinned if start <= a < end)
        if mine:
            lines = _pinned(block_index, sung, notes, mine, gap)
        else:
            lines = _auto(block_index, sung, phrases, phrases[0][0].onset if phrases else start)
        sections.append(SectionLayout(index, block_index, block.tag, phrase_spans, tuple(lines)))
    return LyricLayout(tuple(sections), tuple(unplaced))


# --- the notation: w: lines ---------------------------------------------------------------------

_W_SPECIAL = re.compile(r"[-_*~|\\]")


def w_token(syllable: Syllable) -> str:
    """The ``w:`` token of a syllable (``beau-``, ``ty``; joined words with ``~``)."""
    text = _W_SPECIAL.sub("", syllable.text).strip().replace(" ", "~") or "*"
    return text + ("" if syllable.end_of_word else "-")
