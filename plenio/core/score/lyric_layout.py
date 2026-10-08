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
- each syllable takes a note; a line over several phrases breaks between them at a word, after a comma or a
  full stop where it can, never inside a word unless it must; a phrase with fewer syllables than notes holds
  its last syllable over the rest (a melisma), one with more lets neighbouring syllables share a note - two
  of one word first, spread over the phrase (owner's report 2026-10-08: the rest of a line piled up on its
  last note, and a line's last word stood at the end of a phrase instead of the start of the next);
- the words are split in the lyrics' language (``syllables.guess_language``: German has no silent *e*);
- with more lines than notes, lines share a phrase in order;
- no line is lost: the lyrics that no note sings (a block whose section the score does not have, a section
  without Vocal notes) are written after the music (``unsung``, ``W:`` lines of the display text; owner's
  report 2026-10-08: whole passages were missing from the sheet music when YuE2 planned fewer sections
  than the lyrics have).

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

_LETTER = re.compile(r"[^\W\d_]")
"""A letter of any script (a line of Korean or Japanese is sung too)."""
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
    unsung: tuple[tuple[str, tuple[str, ...]], ...] = field(default=())
    """``(tag, lines)`` of the lyrics no note sings, in the lyrics' order (directions left out)."""

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
            "unsung": [{"tag": tag, "lines": list(lines)} for tag, lines in self.unsung],
        }


def split_word(word: str, language: str = "") -> list[str]:
    """A word in syllables (``syllables.split``, the count of ``lyrics.estimate_syllables``)."""
    return syllables.split(word, language) or [word]


def syllables_of(line: str, language: str = "") -> list[tuple[str, bool]]:
    """``(syllable, end of word)`` of a sung line; hyphenated words split at their hyphens too."""
    result: list[tuple[str, bool]] = []
    for word in line.split():
        parts = [p for p in word.split("-") if p]
        pieces = [piece for part in parts for piece in split_word(part, language)]
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


_PAUSE = re.compile(r"[,.;:!?…][\"'”’»«)]*$")


def _pause_after(text: str) -> bool:
    """A comma, a full stop ... ends the syllable: the singer breathes there."""
    return bool(_PAUSE.search(text))


SHARE_ACROSS_WORDS_COST = 1.0
"""Of two syllables of different words on one note (two of one word cost nothing)."""
SHARE_OVER_PAUSE_COST = 2.0
"""Of two syllables on one note across a comma or a full stop."""


def _fit(pieces: Sequence[tuple[str, bool]], notes: int) -> list[tuple[str, bool]]:
    """``pieces`` on ``notes`` notes, fewer than the pieces: neighbouring syllables share a note - two of one
    word first, then the shortest, a note with three only when every note has two."""
    groups = [[piece] for piece in pieces]

    def cost(i: int) -> float:
        left, right = groups[i], groups[i + 1]
        value = 0.0 if not left[-1][1] else SHARE_ACROSS_WORDS_COST
        value += SHARE_OVER_PAUSE_COST if _pause_after(left[-1][0]) else 0.0
        value += len(left) + len(right) - 2
        return value + 0.02 * sum(len(text) for text, _ in (*left, *right))

    while len(groups) > max(1, notes):
        i = min(range(len(groups) - 1), key=cost)
        groups[i : i + 2] = [groups[i] + groups[i + 1]]
    return [_join(group) for group in groups]


def _placed(
    block_index: int, j: int, line: str, pieces: Sequence[tuple[str, bool]], region: Sequence[canonical.Note]
) -> Line:
    """``line`` sung on the notes ``region``: a syllable per note, the last held or neighbours sharing notes."""
    if len(pieces) <= len(region):
        placed = [Syllable(n.onset, t, e) for n, (t, e) in zip(region, pieces, strict=False)]
        holds = tuple(n.onset for n in region[len(pieces) :])
    else:
        fitted = _fit(pieces, len(region))
        placed = [Syllable(n.onset, t, e) for n, (t, e) in zip(region, fitted, strict=True)]
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
BREAK_COST = 0.4
"""Of a line's break between two phrases after a word without a comma or a full stop (after one: nothing)."""
MID_WORD_BREAK_COST = 3.0
"""Of a break between two phrases inside a word."""


def _break_cost(piece: tuple[str, bool]) -> float:
    text, end_of_word = piece
    if not end_of_word:
        return MID_WORD_BREAK_COST
    return 0.0 if _pause_after(text) else BREAK_COST


def _shares(pieces: Sequence[tuple[str, bool]], sizes: Sequence[int]) -> list[int]:
    """How many of ``pieces`` each phrase of ``sizes`` notes sings (at least one each, in order): the
    cheapest split by ``CROWD_COST``, ``HOLD_COST`` and the break costs."""
    count, groups = len(pieces), len(sizes)
    inf = float("inf")
    best = [[inf] * (count + 1) for _ in range(groups + 1)]
    step = [[-1] * (count + 1) for _ in range(groups + 1)]
    best[0][0] = 0.0
    for g, size in enumerate(sizes):
        for start in range(g, count):
            if best[g][start] == inf:
                continue
            for end in range(start + 1, count - (groups - g - 1) + 1):
                n = end - start
                cost = best[g][start] + (CROWD_COST * (n - size) if n > size else HOLD_COST * (size - n))
                if end < count:
                    cost += _break_cost(pieces[end - 1])
                if cost < best[g + 1][end]:
                    best[g + 1][end], step[g + 1][end] = cost, start
    shares: list[int] = []
    end = count
    for g in range(groups, 0, -1):
        start = step[g][end]
        shares.append(end - start)
        end = start
    return shares[::-1]


def _spread(
    block_index: int,
    j: int,
    line: str,
    pieces: Sequence[tuple[str, bool]],
    groups: Sequence[Sequence[canonical.Note]],
) -> Line:
    """``line`` on the notes of one or more phrases: each phrase sings its share of the syllables
    (``_shares``) - holding its last one over the notes it has left, or sharing notes when it has too few."""
    region = [n for group in groups for n in group]
    if len(groups) == 1 or len(pieces) < len(groups):
        return _placed(block_index, j, line, pieces, region)
    placed: list[Syllable] = []
    holds: list[int] = []
    cursor = 0
    for group, share in zip(groups, _shares(pieces, [len(g) for g in groups]), strict=True):
        part = list(pieces[cursor : cursor + share])
        cursor += share
        if len(part) > len(group):
            part = _fit(part, len(group))
        placed += [Syllable(n.onset, text, end) for n, (text, end) in zip(group, part, strict=False)]
        holds += [n.onset for n in group[len(part) :]]
    return Line(block_index, j, line, region[0].onset, region[-1].end, tuple(placed), tuple(holds))


def _auto(
    block_index: int,
    sung: Sequence[tuple[int, str]],
    phrases: Sequence[Sequence[canonical.Note]],
    cursor: int,
    language: str = "",
) -> list[Line]:
    """The lines ``sung`` (``(index in the block, text)``) on ``phrases`` by the rule of the module: the
    cheapest split of the section's notes into one run per line (``CROWD_COST`` ... ``CROSS_COST``)."""
    words = [(j, line, [] if _DIRECTION.match(line) else syllables_of(line, language)) for j, line in sung]
    lyric = [w for w in words if w[2]]
    notes = [n for phrase in phrases for n in phrase]
    if not lyric or len(lyric) > len(notes):
        return _sequential(block_index, sung, phrases, cursor, language)
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
        return _sequential(block_index, sung, phrases, cursor, language)
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
    language: str = "",
) -> list[Line]:
    """A line per phrase, lines sharing a phrase in order when there are more of them (more lines than
    notes: the fallback of ``_auto``)."""
    lines: list[Line] = []
    phrase, offset = 0, 0
    for order, (j, line) in enumerate(sung):
        pieces = [] if _DIRECTION.match(line) else syllables_of(line, language)
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
    language: str = "",
) -> list[Line]:
    """The lines ``sung`` on the spans placed by hand (in order); the lines past the last span follow
    on the notes after it. A note belongs to the first span it starts in."""
    lines: list[Line] = []
    taken: set[int] = set()
    for (j, line), (start, end) in zip(sung, spans, strict=False):
        pieces = [] if _DIRECTION.match(line) else syllables_of(line, language)
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
        lines += _auto(block_index, rest, _phrases(after, gap), after[0].onset if after else last, language)
    return lines


def layout(score: canonical.Score, text: str, spans: Sequence[Sequence[int]] | None = None) -> LyricLayout:
    """Where the lyrics ``text`` fall in ``score`` (an empty layout for empty or tag-only lyrics);
    ``spans``: the lines placed by hand (``[start, end)`` in units of L, see the module)."""
    parsed = lyrics_rules.parse_lyrics(text or "")
    language = syllables.guess_language(text or "")
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
            lines = _pinned(block_index, sung, notes, mine, gap, language)
        else:
            lines = _auto(block_index, sung, phrases, phrases[0][0].onset if phrases else start, language)
        sections.append(SectionLayout(index, block_index, block.tag, phrase_spans, tuple(lines)))
    return LyricLayout(tuple(sections), tuple(unplaced), _unsung(parsed, sections, unplaced))


def _unsung(
    parsed: lyrics_rules.Lyrics, sections: Sequence[SectionLayout], unplaced: Sequence[int]
) -> tuple[tuple[str, tuple[str, ...]], ...]:
    """The lines no note sings, by block in the lyrics' order: the lines of a block whose section the score
    does not have, and lines that found no note of their section."""
    found: dict[int, list[str]] = {}
    for section in sections:
        for line in section.lines:
            if not line.syllables and not _DIRECTION.match(line.text) and _LETTER.search(line.text):
                found.setdefault(line.block, []).append(line.text)
    for index in unplaced:
        lines = [
            line
            for line in parsed.sections[index].lines
            if not _DIRECTION.match(line) and _LETTER.search(line)
        ]
        if lines:
            found[index] = lines
    return tuple((parsed.sections[index].tag, tuple(found[index])) for index in sorted(found))


# --- the notation: w: lines ---------------------------------------------------------------------

_W_SPECIAL = re.compile(r"[-_*~|\\]")


def _abc_text(text: str) -> str:
    """Text for an ABC line: ``%`` would start a comment there (the full-width sign looks the same)."""
    return text.replace("%", "％")


def w_token(syllable: Syllable) -> str:
    """The ``w:`` token of a syllable (``beau-``, ``ty``; joined words with ``~``)."""
    text = _abc_text(_W_SPECIAL.sub("", syllable.text).strip().replace(" ", "~")) or "*"
    return text + ("" if syllable.end_of_word else "-")


UNSUNG_HEADING = "Lyrics without notes in this score:"


def unsung_words(unsung: Sequence[tuple[str, Sequence[str]]]) -> str:
    """``W:`` lines for the end of the notation: the lyrics no note sings, under their section tags."""
    if not unsung:
        return ""
    rows = ["W:", f"W: {UNSUNG_HEADING}"]
    for tag, lines in unsung:
        rows.append("W:")
        if tag:
            rows.append(f"W: [{_abc_text(tag)}]")
        rows += [f"W: {_abc_text(line.strip())}" for line in lines]
    return "\n".join(rows) + "\n"
