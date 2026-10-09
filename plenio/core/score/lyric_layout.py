"""Where the lyrics are sung: lines on the Vocal notes, syllables on notes (owner's requests 2026-10-01 and
2026-10-09).

YuE2 reads the lyrics with the score and sings the lines **in their order** over the Vocal melody, about
one syllable per note; it does not put syllables on notes. This layout is the editor's picture of where
the words fall, and it follows what the renders do (owner's report 2026-10-09: in the sheet music the
words stood far from the notes they are sung on; a study of the owner's renders with every word timed by
speech recognition and a forced aligner, ``docs/design/lyrics-placement.md``):

- the lines take the Vocal notes in their order, as many as their syllables ask for: a line starts where
  a phrase starts wherever it can (phrases split at rests of an eighth or more) and may run on over the
  next phrase when its syllables need it (owner's report 2026-10-08: with a line per phrase, lines that
  did not match the phrases were crammed onto two or three notes while other phrases stayed empty);
- a lyrics block starts where a section of the score starts - on its pickup when the section's first
  phrase begins in the bar before - a section of its own kind first. YuE2 sings on whatever the sections
  are called: a block may follow the one before inside a section (a plan that sings the chorus and the
  outro in one section) or start in a section of another kind (the second verse in the plan's bridge);
- a note no line sings (an intro's ad-libs, the end of a section after its block) costs little in a
  section of a kind the lyrics have no block for and more elsewhere, where a line rather holds it;
- each syllable takes a note; a line over several phrases breaks between them at a word, after a comma or
  a full stop where it can, never inside a word unless it must; a phrase with fewer syllables than notes
  holds its last syllable over the rest (a melisma), one with more lets neighbouring syllables share a
  note - two of one word first, spread over the phrase (owner's report 2026-10-08: the rest of a line
  piled up on its last note, and a line's last word stood at the end of a phrase instead of the start of
  the next);
- the words are split in the lyrics' language (``syllables.guess_language``: German has no silent *e*);
- no line is lost: the lines no note sings (the notes ran out) are written after the music (``unsung``,
  ``W:`` lines of the display text; owner's report 2026-10-08).

The layout has a **part** per lyrics block: its lines, and the stretch of the score it covers - from its
first line to the next part (the first part from the start of the score). A block no note sings (an empty
``[Intro]``, words for a section without notes) gets the stretch of the next section of its kind that
holds no other block's lines, when there is one: the lyrics lane can give it words there.

A line placed by hand (the piano roll's lyrics lane: moved, made longer or shorter, pasted) has a **span**
- ``[start, end, block, line]`` in units of L, kept with the sheet: line ``line`` of block ``block`` is
sung on the notes that start inside ``[start, end)``, and the lines between the lines placed by hand take
the notes between them by the rules above. Spans that would put lines out of their order are left out. A
span without its line (``[start, end]``, as Plenio 0.4.4 and 0.4.5 kept them) belongs to the section it
starts in, whose lyrics block takes that section's spans in order (by order of the sections, by tag when
the lyrics have another number of blocks), as it did then.

The piano roll draws the lines over their phrases and edits them there, the notation shows the
syllables under the notes (``w:`` lines of the display text) and the MusicXML export writes them as
``<lyric>`` elements. A layout never changes the score or the lyrics.
"""

from __future__ import annotations

import re
from collections.abc import Iterator, Sequence
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
    pinned: bool = False
    """The line stands on a span placed by hand (``start``, ``end``)."""


@dataclass(frozen=True)
class Part:
    """A lyrics block where it is sung."""

    block: int
    tag: str
    start: int
    """Where the part begins (units of L): its first line - the first part at the start of the score."""
    end: int
    """Where the next part begins (the end of the score after the last)."""
    phrases: tuple[tuple[int, int], ...]
    """``[start, end)`` of the Vocal phrases in the part (a phrase over two parts: each its piece)."""
    lines: tuple[Line, ...]
    """Every line of the block, in its order (a line no note sings has no syllables)."""


@dataclass(frozen=True)
class LyricLayout:
    parts: tuple[Part, ...]
    unplaced: tuple[int, ...] = field(default=())
    """Blocks with words of which no note sings any."""
    unsung: tuple[tuple[str, tuple[str, ...]], ...] = field(default=())
    """``(tag, lines)`` of the lyrics no note sings, in the lyrics' order (directions left out)."""

    def lines(self) -> Iterator[Line]:
        for part in self.parts:
            yield from part.lines

    def syllables(self) -> dict[int, Syllable]:
        """Every syllable by the onset of its note."""
        return {s.onset: s for line in self.lines() for s in line.syllables}

    def holds(self) -> set[int]:
        return {onset for line in self.lines() for onset in line.holds}

    def to_dict(self) -> dict[str, Any]:
        return {
            "parts": [
                {
                    "block": p.block,
                    "tag": p.tag,
                    "start": p.start,
                    "end": p.end,
                    "phrases": [list(phrase) for phrase in p.phrases],
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
                            "pinned": line.pinned,
                        }
                        for line in p.lines
                    ],
                }
                for p in self.parts
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


def phrase_gap(score: canonical.Score) -> int:
    """The rest that splits phrases: an eighth (YuE2 starts a line after one about as often as after a
    longer rest; ``docs/design/lyrics-placement.md``)."""
    return max(1, score.unit.denominator // 8)


def pickups(score: canonical.Score) -> frozenset[int]:
    """The onsets of the Vocal notes that only lead into the next section: the notes before a section's start
    of a phrase that begins in the bar before it, after its downbeat, and runs on into it (a plan's intro often
    ends with the verse's first word)."""
    notes = sorted(score.vocal, key=lambda n: n.onset)
    phrases = _phrases(notes, phrase_gap(score))
    found: set[int] = set()
    for section in ops._section_starts(score)[1:]:
        begin = score.starts[section.measure]
        bar = score.lengths[section.measure - 1]
        for phrase in phrases:
            if phrase[0].onset < begin <= phrase[-1].onset and begin - phrase[0].onset < bar:
                found.update(n.onset for n in phrase if n.onset < begin)
    return frozenset(found)


def _key(tag: str) -> str:
    """A tag or label as the lyrics checks compare them: no brackets, no trailing number, lower case."""
    return re.sub(r"\s*\d+$", "", tag.strip("[]").strip()).lower()


def _match(
    blocks: Sequence[lyrics_rules.LyricsSection], labels: Sequence[str]
) -> tuple[list[int | None], list[int]]:
    """For every labelled section the block it sang until 0.5 (by order, or by tag when the counts
    differ): the owner of the spans kept without their line."""
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
BLOCK_INSIDE_COST = 2.0
"""Of a block whose first line does not start where a section starts (or on its pickup)."""
OTHER_KIND_COST = 0.5
"""Of a block that starts where a section of another kind starts."""
FREE_NOTE_COST = 0.05
"""Of a note no line sings in a section of a kind the lyrics have no block for (an intro's ad-libs)."""
LEFT_NOTE_COST = 0.6
"""Of a note no line sings in a section of a kind the lyrics have (a line rather holds it)."""
UNSUNG_LINE_COST = 6.0
"""Of a line no note sings while notes are left: the layout sings every line it can."""
LATE_LINE_COST = 1.5
"""Of a line after the last note (the notes ran out): rather written after the music than crammed onto the
notes of the lines before (owner's report 2026-10-08; renders seldom sing what the plan has no notes for)."""


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


# --- the flow: every line on its run of notes ----------------------------------------------------


@dataclass(frozen=True)
class _Sung:
    """A sung line as the flow places it."""

    block: int
    line: int
    text: str
    pieces: tuple[tuple[str, bool], ...]
    opens: bool
    """The block's first sung line."""
    kind: str
    """The block's tag as the sections are compared (``_key``)."""


@dataclass(frozen=True)
class _Notes:
    """The Vocal notes as the flow sees them (indices into ``notes``)."""

    notes: tuple[canonical.Note, ...]
    phrase: tuple[int, ...]
    """The phrase of every note."""
    heads: frozenset[int]
    """The notes a phrase starts with."""
    entries: dict[int, str]
    """The notes a section starts with (its pickup's first, see ``_entries``) and the section's kind."""
    left: tuple[float, ...]
    """What it costs that no line sings the note (``FREE_NOTE_COST`` or ``LEFT_NOTE_COST``)."""


def _entries(
    score: canonical.Score, notes: Sequence[canonical.Note], phrase: Sequence[int], heads: Sequence[int]
) -> dict[int, str]:
    """Note index -> the kind of the section that starts there: a labelled section's first note, or the
    first note of its phrase when that phrase starts in the bar before the section, after its downbeat (a
    pickup; it wins over the section before, whose only notes it may be)."""
    entries: dict[int, str] = {}
    starts = ops._section_starts(score)
    for index, section in enumerate(starts):
        if section not in score.sections:
            continue
        begin = score.starts[section.measure]
        end = score.starts[starts[index + 1].measure] if index + 1 < len(starts) else score.total
        first = next((k for k, n in enumerate(notes) if begin <= n.onset < end), None)
        if first is None:
            continue
        head = heads[phrase[first]]
        bar = score.lengths[section.measure - 1] if section.measure > 0 else 0
        if head < first and begin - notes[head].onset < bar:
            first = head
        entries[first] = _key(section.label)
    return entries


def _late(lines: Sequence[_Sung], seen: _Notes, start: int, stop: int) -> list[float]:
    """What it costs that no note sings a line once the notes ran out: ``LATE_LINE_COST`` for a block the
    score has no section of its kind left for (the third chorus of a plan with two, an outro without notes),
    else ``UNSUNG_LINE_COST`` - a block whose section is there is sung there."""
    sections: dict[str, int] = {}
    for note in range(start, stop):
        kind = seen.entries.get(note)
        if kind is not None:
            sections[kind] = sections.get(kind, 0) + 1
    blocks: dict[str, int] = {}
    late: list[float] = []
    for line in lines:
        if line.opens:
            blocks[line.kind] = blocks.get(line.kind, 0) + 1
        extra = blocks.get(line.kind, 1) > sections.get(line.kind, 0)
        late.append(LATE_LINE_COST if extra else UNSUNG_LINE_COST)
    return late


def _flow(lines: Sequence[_Sung], seen: _Notes, start: int, stop: int) -> list[tuple[int, int] | None]:
    """The run of notes ``[a, b)`` (indices) of every line on the notes ``start`` ... ``stop - 1``, ``None``
    for a line no note sings: the cheapest by the costs of the module."""
    late = _late(lines, seen, start, stop)
    count, total = len(lines), stop - start
    inf = float("inf")
    best = [[inf] * (total + 1) for _ in range(count + 1)]
    back = [[-1] * (total + 1) for _ in range(count + 1)]
    move = [[0] * (total + 1) for _ in range(count + 1)]  # 0: a note left, 1: a line sung, 2: a line unsung
    best[0][0] = 0.0
    phrase = seen.phrase
    for i in range(count + 1):
        row = best[i]
        below = best[i + 1] if i < count else None
        line = lines[i] if i < count else None
        size = len(line.pieces) if line is not None else 0
        longest = max(4 * size, size + 12)
        for j in range(total + 1):
            here = row[j]
            if here == inf:
                continue
            if j < total and here + seen.left[start + j] < row[j + 1]:
                row[j + 1], back[i][j + 1], move[i][j + 1] = here + seen.left[start + j], j, 0
            if line is None or below is None:
                continue
            unsung = here + (UNSUNG_LINE_COST if j < total else late[i])
            if unsung < below[j]:
                below[j], back[i + 1][j], move[i + 1][j] = unsung, j, 2
            if j == total:
                continue
            note = start + j
            begin = here + (0.0 if note in seen.heads or note in seen.entries or j == 0 else MID_PHRASE_COST)
            if line.opens:
                kind = seen.entries.get(note)
                begin += BLOCK_INSIDE_COST if kind is None else 0.0 if kind == line.kind else OTHER_KIND_COST
            first_phrase = phrase[note]
            for k in range(j + 1, min(total, j + longest) + 1):
                n = k - j
                cost = begin + (CROWD_COST * (size - n) if size > n else HOLD_COST * (n - size))
                cost += CROSS_COST * (phrase[start + k - 1] - first_phrase)
                if cost < below[k]:
                    below[k], back[i + 1][k], move[i + 1][k] = cost, j, 1
    runs: list[tuple[int, int] | None] = [None] * count
    i, j = count, total
    while i > 0 or j > 0:
        previous = back[i][j]
        if move[i][j] == 0:
            j = previous
            continue
        if move[i][j] == 1:
            runs[i - 1] = (start + previous, start + j)
        i, j = i - 1, previous
    return runs


def _pins(
    score: canonical.Score, parsed: lyrics_rules.Lyrics, spans: Sequence[Sequence[int]] | None
) -> dict[tuple[int, int], tuple[int, int]]:
    """``(block, line) -> (start, end)`` of the lines placed by hand (see the module), in the lyrics' order
    and one after the other (a span that would put a line before the one ahead of it is left out)."""
    found: dict[tuple[int, int], tuple[int, int]] = {}
    legacy: list[tuple[int, int]] = []
    for span in spans or ():
        start, end = int(span[0]), int(span[1])
        if end <= start:
            continue
        if len(span) >= 4:
            block, line = int(span[2]), int(span[3])
            if 0 <= block < len(parsed.sections) and 0 <= line < len(parsed.sections[block].lines):
                found.setdefault((block, line), (start, end))
        else:
            legacy.append((start, end))
    if legacy:
        starts = ops._section_starts(score)
        labelled = [i for i, section in enumerate(starts) if section in score.sections]
        mapping, _ = _match(parsed.sections, [starts[i].label for i in labelled])
        for position, index in enumerate(labelled):
            owner = mapping[position]
            if owner is None:
                continue
            begin = score.starts[starts[index].measure]
            stop = score.starts[starts[index + 1].measure] if index + 1 < len(starts) else score.total
            mine = sorted(kept for kept in legacy if begin <= kept[0] < stop)
            for j, kept in enumerate(mine[: len(parsed.sections[owner].lines)]):
                found.setdefault((owner, j), kept)
    pins: dict[tuple[int, int], tuple[int, int]] = {}
    reached = 0
    for key in sorted(found):
        start, end = found[key]
        if start >= reached:
            pins[key] = (start, end)
            reached = end
    return pins


def layout(score: canonical.Score, text: str, spans: Sequence[Sequence[int]] | None = None) -> LyricLayout:
    """Where the lyrics ``text`` fall in ``score`` (an empty layout for empty or tag-only lyrics);
    ``spans``: the lines placed by hand (``[start, end, block, line]`` in units of L, see the module)."""
    parsed = lyrics_rules.parse_lyrics(text or "")
    language = syllables.guess_language(text or "")
    notes = tuple(sorted(score.vocal, key=lambda n: n.onset))
    phrases = _phrases(notes, phrase_gap(score))
    seen = _seen(score, parsed, notes, phrases)
    sung: dict[tuple[int, int], _Sung] = {}
    for b, block in enumerate(parsed.sections):
        opens = True
        for j, text_line in enumerate(block.lines):
            pieces = () if _DIRECTION.match(text_line) else tuple(syllables_of(text_line, language))
            if pieces:
                sung[(b, j)] = _Sung(b, j, text_line, pieces, opens, _key(block.tag))
                opens = False
    pins = _pins(score, parsed, spans)
    placed: dict[tuple[int, int], Line] = {}
    taken: set[int] = set()
    for key, (start, end) in pins.items():
        b, j = key
        text_line = parsed.sections[b].lines[j]
        region = [k for k, n in enumerate(notes) if start <= n.onset < end and k not in taken]
        if key in sung and region:
            taken.update(region)
            on_notes = _placed(b, j, text_line, sung[key].pieces, [notes[k] for k in region])
            placed[key] = replace(on_notes, start=start, end=end, pinned=True)
        else:
            placed[key] = Line(b, j, text_line, start, end, (), pinned=True)
    # the lines between two placed by hand take the notes between them
    order = [(b, j) for b, block in enumerate(parsed.sections) for j in range(len(block.lines))]
    edges = [(-1, 0), *(pins[key] for key in order if key in pins), (score.total + 1, score.total + 1)]
    between: list[tuple[int, int]] = []
    edge = 0
    for current in [*order, None]:
        if current is not None and current not in pins:
            between.append(current)
            continue
        low, high = edges[edge][1], edges[edge + 1][0]
        edge += 1
        indices = [k for k, n in enumerate(notes) if low <= n.onset < high and k not in taken]
        flowing = [sung[key] for key in between if key in sung]
        runs = (
            _flow(flowing, seen, indices[0], indices[-1] + 1)
            if flowing and indices
            else [None] * len(flowing)
        )
        for entry, run in zip(flowing, runs, strict=True):
            if run is not None:
                placed[(entry.block, entry.line)] = _spread(
                    entry.block, entry.line, entry.text, entry.pieces, _groups(notes, seen.phrase, *run)
                )
        between = []
    # a line without notes (a direction, a line no note sings) stands where the words before it stopped
    cursor = 0
    for b, j in order:
        found = placed.get((b, j))
        if found is None:
            placed[(b, j)] = Line(b, j, parsed.sections[b].lines[j], cursor, cursor, ())
        elif found.syllables or found.pinned:
            cursor = found.end
    return _parts(score, parsed, placed, phrases)


def _seen(
    score: canonical.Score,
    parsed: lyrics_rules.Lyrics,
    notes: tuple[canonical.Note, ...],
    phrases: Sequence[Sequence[canonical.Note]],
) -> _Notes:
    """The Vocal notes with their phrases, the section starts and what a note no line sings costs."""
    phrase = tuple(i for i, p in enumerate(phrases) for _ in p)
    heads = [k for k in range(len(notes)) if k == 0 or phrase[k] != phrase[k - 1]]
    kinds = {
        _key(block.tag)
        for block in parsed.sections
        if any(not _DIRECTION.match(line) and _LETTER.search(line) for line in block.lines)
    }
    starts = ops._section_starts(score)
    measure_kind: list[str] = []
    for index, section in enumerate(starts):
        last = starts[index + 1].measure if index + 1 < len(starts) else score.measure_count
        measure_kind += [_key(section.label) if section in score.sections else ""] * (last - section.measure)
    left = tuple(
        LEFT_NOTE_COST if measure_kind[score.measure_at(n.onset)] in kinds else FREE_NOTE_COST for n in notes
    )
    return _Notes(notes, phrase, frozenset(heads), _entries(score, notes, phrase, heads), left)


def _groups(
    notes: Sequence[canonical.Note], phrase: Sequence[int], a: int, z: int
) -> list[list[canonical.Note]]:
    """The notes ``a`` ... ``z - 1`` by phrase."""
    groups: list[list[canonical.Note]] = []
    for k in range(a, z):
        if not groups or phrase[k] != phrase[k - 1]:
            groups.append([])
        groups[-1].append(notes[k])
    return groups


def _parts(
    score: canonical.Score,
    parsed: lyrics_rules.Lyrics,
    placed: dict[tuple[int, int], Line],
    phrases: Sequence[Sequence[canonical.Note]],
) -> LyricLayout:
    """The placed lines by block, each block with the stretch of the score it covers (see the module)."""
    blocks = [
        tuple(placed[(b, j)] for j in range(len(block.lines))) for b, block in enumerate(parsed.sections)
    ]
    begins: dict[int, int] = {}
    for b, lines in enumerate(blocks):
        sung = [line.start for line in lines if line.syllables or line.pinned]
        if sung:
            begins[b] = min(sung)
    # a block no note sings: the next section of its kind that holds no other block's lines
    starts = ops._section_starts(score)
    sections = [(score.starts[s.measure], _key(s.label)) for s in starts if s in score.sections]
    used: set[int] = set()
    for b, block in enumerate(parsed.sections):
        if b in begins:
            continue
        before = max((end for c, lines in enumerate(blocks) if c < b for end in _ends(lines)), default=0)
        after = min((begins[c] for c in begins if c > b), default=score.total)
        found = next(
            (
                i
                for i, (at, kind) in enumerate(sections)
                if i not in used and before <= at < after and kind == _key(block.tag)
            ),
            None,
        )
        if found is not None:
            used.add(found)
            begins[b] = sections[found][0]
            blocks[b] = tuple(
                replace(line, start=begins[b], end=begins[b]) if not line.syllables else line
                for line in blocks[b]
            )
    order = sorted(begins, key=lambda b: (begins[b], b))
    parts: list[Part] = []
    for position, b in enumerate(order):
        start = 0 if position == 0 else begins[b]
        end = begins[order[position + 1]] if position + 1 < len(order) else score.total
        inside = tuple(
            (max(p[0].onset, start), min(p[-1].end, end))
            for p in phrases
            if p[0].onset < end and p[-1].end > start
        )
        parts.append(Part(b, parsed.sections[b].tag, start, end, inside, blocks[b]))
    unplaced = tuple(
        b
        for b, lines in enumerate(blocks)
        if not any(line.syllables for line in lines)
        and any(not _DIRECTION.match(line.text) and _LETTER.search(line.text) for line in lines)
    )
    unsung: list[tuple[str, tuple[str, ...]]] = []
    for b, lines in enumerate(blocks):
        missing = tuple(
            line.text
            for line in lines
            if not line.syllables and not _DIRECTION.match(line.text) and _LETTER.search(line.text)
        )
        if missing:
            unsung.append((parsed.sections[b].tag, missing))
    return LyricLayout(tuple(parts), unplaced, tuple(unsung))


def _ends(lines: Sequence[Line]) -> list[int]:
    return [line.end for line in lines if line.syllables or line.pinned]


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
