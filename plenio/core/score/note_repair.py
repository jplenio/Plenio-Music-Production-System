"""Notes that fit the lyrics: the text decides, the melody follows - a selection or the whole song, in one undo step.

YuE2 sings about one syllable per note. Where a line has more syllables than notes the words are crammed, where it has
fewer they drag or the melody goes on without them. Writing the text anew is ``lyrics_fit``'s way; this is the other
one, for lyrics that stay as they are: the notes change, as little as the count asks for, and the song stays the song.

For every sung line (``lyric_layout``) as many notes as syllables:

- **The song's own melody first.** The same melody stands elsewhere with the right number of notes (the first verse has
  the note the second verse lacks): that passage is taken over, as long as it fits the chords here. Chorus and verse
  stay one melody, and a repeated section that needs the same repair gets the same one.
- **Too few notes:** long notes are split on the song's own rhythm - where a split leaves durations the melody already
  uses - and what still lacks goes into the rest after the line, never up to the next line. A new note's pitch is the
  best way between the notes around it (``_pitches``): chord tones on strong beats, on weak ones also the scale's steps,
  the intervals and pitch classes this melody uses, never a note that clashes with its chord (``harmony.clashing``,
  with the song's genre) or grinds against the instrument line.
- **Too many notes:** the note that carries least goes - the same pitch as the note before first, then an unaccented
  note off the chord, never a turning point while another can go - and the note before it holds on, unless that would
  clash with the chord there (then a rest stands in its place).
- **Surplus to the Instrument** (``surplus="ins"``): the line's last notes and the notes no line sings move to the
  instrument line where it is silent, so the music stays and only the singing fits.

A line no note sings gets a phrase in the free bars around it, when there are any, from a melody of the song with as
many notes or on the rhythm of the line before. Bars, chords, lyrics and the positions of the other notes never change.
Pure: no ComfyUI, no I/O; deterministic - the same score and text give the same notes.
"""

from __future__ import annotations

import math
from collections import Counter
from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

from .. import syllables as syllable_rules
from ..arrangement import harmony
from ..errors import PlenioValidationError
from .canonical import Note, Score, from_abc, to_abc
from .edit import EditResult
from .lyric_layout import Line, LyricLayout, Part, layout, phrase_gap, syllables_of
from .ops import note_id

MAX_PASSES = 6
"""Every pass repairs what the layout shows and lays the text out again: lines may take other notes then."""
DONOR_SIMILARITY = 0.6
"""The share of a line's notes another passage must have at the same place to count as the same melody."""
SURPLUS = ("auto", "omit", "ins")
"""What becomes of notes the text does not need: ``auto`` a whole phrase no line sings goes to the instrument line,
a line's spare notes go; ``omit`` all go; ``ins`` all go to the instrument line where it is silent."""
OMIT_COST = 0.8
GROUP_COST = 0.6
"""A line over one more phrase."""
SHARE_COST = 1.5
"""One more line on a phrase: it starts inside the phrase."""
UNSUNG_COST = 12.0
"""A line without notes, and no free bars for it: words are not lost while a phrase can take them."""
NEW_PHRASE_COST = 1.0
"""A line without notes where free bars can take a phrase of its own."""
SKIP_BEFORE_FIRST = 1.0
"""More for a phrase left out before the block's first line, in the section the line stands in: a block starts where
its section starts."""
LINE_COST_MOST = 10.0
"""A line on a phrase costs at most this: however far off, its phrase is better than none."""
SKIP_NOTE = 0.5
SKIP_MOST = 3.0
"""A phrase no line sings, per note and at most."""
CRAMMED_COST = 3.0
"""A note more than the phrase's time holds on the melody's grid."""
HARSH_WITH_INS = frozenset({1, 6, 11})
"""A new sung note and the instrument line sounding together a half step (or its octaves) or a tritone apart."""
INFINITY = math.inf
TAIL_NOTES = 4
"""``auto``: from so many spare notes on (and as many as the text needs) they move rather than go."""
MIN_RANGE = 7
"""The semitones new notes have to choose from at least."""
REPEATS_LIKED = 0.3
"""The share of repeated pitches from which a melody counts as liking them (recitation, rap)."""
REPEAT_RUN_COST = 0.6
"""Every further time the same pitch comes again."""


@dataclass
class _Style:
    """What the melody around a new note does: its rhythm, its pitch classes and its intervals."""

    step: int
    """The shortest note a split may leave (the melody's own grid)."""
    durations: Counter[int]
    pitch_classes: Counter[int]
    intervals: Counter[int]
    tensions: frozenset[int]
    low: int
    high: int

    def duration_cost(self, length: int) -> float:
        total = sum(self.durations.values()) or 1
        share = self.durations.get(length, 0) / total
        return 0.0 if share >= 0.1 else 0.3 if share > 0 else 0.8

    def pitch_class_cost(self, pc: int) -> float:
        top = max(self.pitch_classes.values(), default=1)
        return 0.4 * (1.0 - self.pitch_classes.get(pc, 0) / top)

    def interval_cost(self, step: int) -> float:
        top = max(self.intervals.values(), default=1)
        return 0.3 * (1.0 - self.intervals.get(abs(step), 0) / top)

    def repeat_cost(self, run: int) -> float:
        """The same pitch again, for the ``run``-th time: little in a melody that likes it, more every time."""
        total = sum(self.intervals.values()) or 1
        liked = min(1.0, self.intervals.get(0, 0) / total / REPEATS_LIKED)
        return 0.7 * (1.0 - liked) + REPEAT_RUN_COST * max(0, run - 1)


def _sorted(notes: Sequence[Note]) -> list[Note]:
    return sorted(notes, key=lambda n: n.onset)


def _style(score: Score, text: str) -> _Style:
    vocal = _sorted(score.vocal)
    durations = Counter(n.duration for n in vocal)
    sixteenth = max(1, score.units_per_quarter // 4)
    # the shortest duration the melody really uses (a tenth of its notes), not one stray ornament
    common = [d for d, count in durations.items() if count >= max(2, len(vocal) // 10)]
    eighth = max(1, score.units_per_quarter // 2)
    step = max(sixteenth, min(eighth, min(common, default=eighth)))
    pitches = sorted(n.pitch for n in vocal) or [60, 72]
    margin = len(pitches) // 20
    low, high = pitches[margin], pitches[-1 - margin]
    if high - low < MIN_RANGE:  # a melody on two or three notes: new ones may leave them a little
        spare = (MIN_RANGE - (high - low) + 1) // 2
        low, high = low - spare, high + spare
    return _Style(
        step=step,
        durations=durations,
        pitch_classes=Counter(n.pitch % 12 for n in vocal),
        intervals=Counter(abs(b.pitch - a.pitch) for a, b in zip(vocal, vocal[1:], strict=False)),
        tensions=harmony.genre_of(text).tensions,
        low=low,
        high=high,
    )


def _section_range(score: Score, onset: int) -> tuple[int, int]:
    """The measures ``[first, end)`` of the section ``onset`` stands in."""
    measure = score.measure_at(onset)
    firsts = sorted({0, *(s.measure for s in score.sections)})
    first = max((m for m in firsts if m <= measure), default=0)
    end = min((m for m in firsts if m > measure), default=score.measure_count)
    return first, end


def _under(
    score: Score, onset: int, duration: int, pitch: int = 60
) -> list[tuple[frozenset[int], int, bool]]:
    return harmony._note_chords(score, Note(onset, duration, pitch), max(1, score.units_per_quarter))


def _fits(score: Score, note: Note, tensions: frozenset[int]) -> bool:
    return harmony._fits_all(note.pitch, _under(score, note.onset, note.duration, note.pitch), tensions)


def _ins_at(score: Score, onset: int, end: int) -> list[Note]:
    return [n for n in score.ins if n.onset < end and n.end > onset]


def _note_cost(score: Score, onset: int, duration: int, pitch: int, key: harmony.Key, style: _Style) -> float:
    """How well a new sung note sits on its beat: its chord, the key, the melody's habits, the instrument line."""
    under = _under(score, onset, duration, pitch)
    if under and not harmony._fits_all(pitch, under, style.tensions):
        return INFINITY
    pc = pitch % 12
    accented = harmony.strong(score, onset) or duration >= max(1, score.units_per_quarter)
    in_chord = bool(under) and all(pc in tones for tones, _, _ in under)
    in_scale = pc in key.scale
    tension = bool(under) and all((pc - root) % 12 in style.tensions for _, root, _ in under)
    if in_chord:
        cost = 0.0
    elif not under:  # no chord symbols here: the key alone
        cost = 0.1 if in_scale else 2.5
    elif tension and in_scale:  # a 9th or a 6th of the song's key - the longer on a strong beat, the less
        cost = 0.5 * duration / max(1, score.units_per_quarter) if accented else 0.15
    elif in_scale:
        cost = 1.4 if accented else 0.35
    elif style.pitch_classes.get(pc, 0) * 20 >= sum(style.pitch_classes.values()):
        cost = 1.6 if accented else 0.8  # a colour the melody itself uses
    else:
        cost = INFINITY
    cost += style.pitch_class_cost(pc)
    for other in _ins_at(score, onset, onset + duration):
        if (pitch - other.pitch) % 12 in HARSH_WITH_INS:
            cost += 1.5 if accented else 0.6
    if pitch < style.low or pitch > style.high:
        cost += 0.5 * max(style.low - pitch, pitch - style.high)
    return cost


def _pitches(
    score: Score,
    slots: Sequence[tuple[int, int]],
    before: int | None,
    after: int | None,
    key: harmony.Key,
    style: _Style,
) -> list[int] | None:
    """The best pitches for new notes in a row between the notes around them (dynamic programming); ``None``: none
    fits (every candidate clashes)."""
    anchor = before if before is not None else after if after is not None else (style.low + style.high) // 2
    low = min(style.low, anchor) - 2
    high = max(style.high, anchor) + 2
    candidates = list(range(max(0, low), min(127, high) + 1))

    def move(last: int, pitch: int, path: Sequence[int]) -> float:
        """The step from ``last`` to ``pitch`` after ``path``."""
        cost = harmony._step_cost(pitch - last) + style.interval_cost(pitch - last)
        if pitch == last:
            run = 1
            for earlier in reversed(path[:-1]):
                if earlier != pitch:
                    break
                run += 1
            cost += style.repeat_cost(run)
        return cost

    best: dict[int, tuple[float, list[int]]] = {}
    for pitch in candidates:
        cost = _note_cost(score, *slots[0], pitch, key, style)
        if before is not None and cost < INFINITY:
            cost += move(before, pitch, [before])
        if cost < INFINITY:
            best[pitch] = (cost, [pitch])
    for slot in slots[1:]:
        reached: dict[int, tuple[float, list[int]]] = {}
        for pitch in candidates:
            own = _note_cost(score, *slot, pitch, key, style)
            if own == INFINITY:
                continue
            options = [
                (cost + own + move(last, pitch, ([before] if before is not None else []) + path), path)
                for last, (cost, path) in best.items()
            ]
            if options:
                cost, path = min(options, key=lambda o: (o[0], o[1]))
                reached[pitch] = (cost, [*path, pitch])
        best = reached
    if not best:
        return None
    if after is not None:
        final = {p: (c + move(p, after, path), path) for p, (c, path) in best.items()}
    else:
        final = best
    return min(final.values(), key=lambda o: (o[0], o[1]))[1]


# --- too few notes: where a new one goes ---------------------------------------------------------------------


@dataclass(frozen=True)
class _Slot:
    """A new note: split from the note at ``splits`` (``None``: into a rest), on ``[onset, onset + duration)``."""

    onset: int
    duration: int
    splits: int | None = None


def _split_point(score: Score, note: Note, step: int) -> int | None:
    """Where a note splits best: on the strongest position inside it that leaves both parts at least ``step``."""
    best: tuple[float, int] | None = None
    for at in range(note.onset + step, note.end - step + 1):
        if (at - score.starts[score.measure_at(at)]) % step:
            continue
        position = harmony.strong(score, at)
        beat = (at - score.starts[score.measure_at(at)]) % max(1, score.units_per_quarter) == 0
        centre = abs((at - note.onset) - (note.end - at)) / max(1, note.duration)
        value = (0.0 if position else 0.2 if beat else 0.5) + centre
        if best is None or value < best[0]:
            best = (value, at)
    return None if best is None else best[1]


def _add_notes(
    score: Score, notes: list[Note], limit: int, count: int, style: _Style
) -> tuple[list[Note], set[int], int]:
    """``count`` more notes among a line's ``notes``: ``(the notes, the onsets of the new ones, how many still lack)``.
    Rhythm only: the new notes keep the pitch of the note they came from until ``_pitches`` gives them theirs."""
    current = list(notes)
    fresh: set[int] = set()
    missing = count
    step = style.step
    finest = max(1, score.units_per_quarter // 4)
    while missing > 0:
        options: list[tuple[float, int, str, int]] = []
        for index, note in enumerate(current):
            at = _split_point(score, note, step)
            if at is not None:
                # long notes first; a phrase's last note holds its end as long as it can
                cost = 0.5 * (style.duration_cost(at - note.onset) + style.duration_cost(note.end - at))
                cost -= note.duration / max(
                    1, score.units_per_quarter
                )  # the longest note first: an even rhythm
                if index == len(current) - 1:
                    cost += 0.4
                if note.onset in fresh:
                    cost += 0.2
                options.append((cost, note.onset, "split", at))
        for left, right in zip(current, current[1:], strict=False):
            between = right.onset - left.end
            if between >= 2 * step:
                duration = min(between - step, max(step, _usual_duration(style, between - step)))
                options.append((0.8 + style.duration_cost(duration), left.end, "gap", duration))
        last = current[-1]
        room = limit - last.end
        if room >= step:
            duration = min(room, max(step, _usual_duration(style, room)))
            options.append((1.0 + style.duration_cost(duration), last.end, "tail", duration))
        if not options:
            if step <= finest:
                break
            step = max(finest, step // 2)  # the melody's own grid is full: a finer one rather than no note
            continue
        _, onset, kind, value = min(options)
        if kind == "split":
            index = next(i for i, n in enumerate(current) if n.onset == onset)
            note = current[index]
            current[index : index + 1] = [
                Note(note.onset, value - note.onset, note.pitch),
                Note(value, note.end - value, note.pitch),
            ]
            fresh.add(value)
        else:
            anchor = next((n.pitch for n in reversed(current) if n.end <= onset), last.pitch)
            current = _sorted([*current, Note(onset, value, anchor)])
            fresh.add(onset)
        missing -= 1
    return current, fresh, missing


def _usual_duration(style: _Style, room: int) -> int:
    fitting = [d for d in style.durations if d <= room]
    return max(fitting, key=lambda d: (style.durations[d], d)) if fitting else style.step


# --- too many notes: which one goes -------------------------------------------------------------------------


def _weight(score: Score, notes: Sequence[Note], index: int, key: harmony.Key) -> float:
    """How much a note carries the line (the lowest goes first)."""
    note = notes[index]
    under = _under(score, note.onset, note.duration, note.pitch)
    pc = note.pitch % 12
    in_chord = bool(under) and all(pc in tones for tones, _, _ in under)
    measure = score.measure_at(note.onset)
    position = note.onset - score.starts[measure]
    beat = max(1, score.units_per_quarter)
    weight = note.duration / beat
    if position == 0:
        weight += 2.0
    elif harmony.strong(score, note.onset):
        weight += 1.0
    elif position % beat == 0:
        weight += 0.5
    if in_chord:
        weight += 1.0
    elif pc not in key.scale:
        weight -= 0.3
    if 0 < index < len(notes) - 1:
        a, b = notes[index - 1].pitch, notes[index + 1].pitch
        if (note.pitch > a and note.pitch > b) or (note.pitch < a and note.pitch < b):
            weight += 1.0  # a turning point: what the melody is remembered by
        if note.pitch == a:
            weight -= 2.5  # the same pitch again: its going is hardly heard
    elif index == 0:
        weight += 3.0
    else:
        weight += 2.0
    return weight


def _omit_notes(score: Score, notes: list[Note], count: int, key: harmony.Key, style: _Style) -> list[Note]:
    current = list(notes)
    for _ in range(count):
        if len(current) <= 1:
            break
        index = min(range(len(current)), key=lambda i: (_weight(score, current, i, key), current[i].onset))
        gone = current.pop(index)
        if index == 0:
            continue
        previous = current[index - 1]
        if previous.end == gone.onset:
            longer = Note(previous.onset, gone.end - previous.onset, previous.pitch, previous.spelling)
            if _fits(score, longer, style.tensions):
                current[index - 1] = longer
    return current


# --- the song's own melody ----------------------------------------------------------------------------------


def _relative(notes: Sequence[Note], origin: int) -> list[tuple[int, int, int]]:
    return [(n.onset - origin, n.duration, n.pitch) for n in notes]


def _same_bars(score: Score, a: int, b: int) -> bool:
    """Whether two onsets stand at the same place in their bars (a phrase can be laid over the other)."""
    ma, mb = score.measure_at(a), score.measure_at(b)
    return a - score.starts[ma] == b - score.starts[mb] and score.lengths[ma] == score.lengths[mb]


def _donor(
    score: Score,
    lines: Sequence[tuple[Line, list[Note]]],
    index: int,
    wanted: int,
    limit: int,
    style: _Style,
) -> list[Note] | None:
    """Another passage of the song with the same melody and as many notes as the line wants, moved here - if it fits
    the chords here and stays before ``limit``."""
    line, own = lines[index]
    if not own:
        return None
    start = own[0].onset
    mine = {(n.onset - start, n.pitch) for n in own}
    found: list[tuple[float, int, list[Note]]] = []
    for other_index, (other, theirs) in enumerate(lines):
        if other_index == index or len(theirs) != wanted or not theirs or other.text == "":
            continue
        origin = theirs[0].onset
        if not _same_bars(score, start, origin):
            continue
        same = len(mine & {(n.onset - origin, n.pitch) for n in theirs}) / max(1, len(mine))
        if same < DONOR_SIMILARITY:
            continue
        moved = [Note(start + n.onset - origin, n.duration, n.pitch) for n in theirs]
        if moved[-1].end > limit or not all(_fits(score, n, style.tensions) for n in moved):
            continue
        found.append((-same, abs(other_index - index), moved))
    if not found:
        return None
    return min(found, key=lambda item: (item[0], item[1]))[2]


# --- the lines against their notes ---------------------------------------------------------------------------


@dataclass
class _Report:
    added: int = 0
    omitted: int = 0
    to_ins: int = 0
    borrowed: int = 0
    phrases: int = 0
    no_room: list[str] = field(default_factory=list)
    changed: set[str] = field(default_factory=set)


Sung = list[tuple[Line, list[Note]]]


def _line_notes(line: Line, vocal: Sequence[Note]) -> list[Note]:
    onsets = {s.onset for s in line.syllables} | set(line.holds)
    return [n for n in vocal if n.onset in onsets]


def wanted_notes(line: Line, language: str) -> int:
    """The notes a line asks for: one per syllable of its text."""
    return len(syllables_of(line.text, language))


def mismatches(
    score: Score, lyrics: str, spans: Sequence[Sequence[int]] | None = None
) -> list[dict[str, Any]]:
    """Every sung line whose notes do not match its syllables, where the layout sings it."""
    placed = layout(score, lyrics, spans)
    language = syllable_rules.guess_language(lyrics)
    vocal = _sorted(score.vocal)
    found = []
    for line in placed.lines():
        want = wanted_notes(line, language)
        have = len(_line_notes(line, vocal))
        if want and want != have:
            found.append(
                {
                    "block": line.block,
                    "line": line.line,
                    "text": line.text,
                    "start": line.start,
                    "syllables": want,
                    "notes": have,
                }
            )
    return found


def _miss(syllables: int, notes: Sequence[Note], step: int) -> float:
    """What it costs to bring ``notes`` to ``syllables``: a note added, a note left out, more than the time holds."""
    count = len(notes)
    if syllables <= count:
        return (count - syllables) * OMIT_COST
    room = (notes[-1].end - notes[0].onset) // max(1, step) if notes else 0
    return min(LINE_COST_MOST, float(syllables - count) + max(0, syllables - room) * CRAMMED_COST)


def _share(notes: Sequence[Note], sizes: Sequence[int]) -> list[list[Note]]:
    """Consecutive notes for lines of these sizes, in proportion."""
    total = sum(sizes) or 1
    shares: list[list[Note]] = []
    done = 0
    cursor = 0
    for size in sizes:
        done += size
        stop = round(len(notes) * done / total)
        shares.append(list(notes[cursor:stop]))
        cursor = stop
    return shares


def _assign_part(
    score: Score, part: Part, vocal: Sequence[Note], language: str, step: int
) -> tuple[Sung, list[Note]]:
    """Which notes every line of a lyrics block belongs on: ``(line and notes, the phrases no line sings)``.

    The layout lets lines run over wherever their syllables take them, which is what YuE2 does with text that does not
    fit; here the song is to fit, so lines and phrases are aligned first: a line on a phrase, or on two or three short
    ones, two or three short lines on a long one - whatever needs the fewest changes. A line placed by hand stays."""
    lines = [line for line in part.lines if wanted_notes(line, language)]
    phrases = [notes for notes in ([n for n in vocal if a <= n.onset < b] for a, b in part.phrases) if notes]
    if any(line.pinned for line in lines) or not lines or not phrases:
        as_placed = [(line, _line_notes(line, vocal)) for line in lines]
        claimed = {n.onset for _, notes in as_placed for n in notes}
        return as_placed, [n for notes in phrases for n in notes if n.onset not in claimed]
    sizes = [wanted_notes(line, language) for line in lines]
    m, n = len(lines), len(phrases)
    finest = max(1, score.units_per_quarter // 4)
    own_section = _section_range(score, min(score.total - 1, lines[0].start))[0]

    def skip(i: int, j: int) -> float:
        cost = min(SKIP_MOST, SKIP_NOTE * len(phrases[j]))
        if not i and score.measure_at(phrases[j][0].onset) >= own_section:
            cost += SKIP_BEFORE_FIRST
        return cost

    def unsung(i: int, j: int) -> float:
        """A line on no phrase: little where the bars between the phrases are free for it."""
        if not j:
            return UNSUNG_COST
        begin = phrases[j - 1][-1].end
        end = phrases[j][0].onset if j < n else part.end
        bar = score.lengths[score.measure_at(min(begin, score.total - 1))]
        return NEW_PHRASE_COST if end - begin >= max(bar, sizes[i] * step) else UNSUNG_COST

    best = [[INFINITY] * (n + 1) for _ in range(m + 1)]
    back: list[list[tuple[int, int, str] | None]] = [[None] * (n + 1) for _ in range(m + 1)]
    best[0][0] = 0.0

    def relax(i: int, j: int, cost: float, source: tuple[int, int, str]) -> None:
        if cost < best[i][j]:
            best[i][j], back[i][j] = cost, source

    for i in range(m + 1):
        for j in range(n + 1):
            here = best[i][j]
            if here == INFINITY:
                continue
            if j < n:
                relax(i, j + 1, here + skip(i, j), (i, j, "skip"))
            if i < m:
                relax(i + 1, j, here + unsung(i, j), (i, j, "unsung"))
            for k in range(1, 4):
                if i < m and j + k <= n:
                    notes = [note for phrase in phrases[j : j + k] for note in phrase]
                    relax(
                        i + 1,
                        j + k,
                        here + _miss(sizes[i], notes, finest) + (k - 1) * GROUP_COST,
                        (i, j, "line"),
                    )
            for r in range(2, 4):
                if i + r <= m and j < n:
                    total = sum(sizes[i : i + r])
                    relax(
                        i + r,
                        j + 1,
                        here + _miss(total, phrases[j], finest) + (r - 1) * SHARE_COST,
                        (i, j, "share"),
                    )
    i, j = m, n
    sung: Sung = []
    free: list[Note] = []
    while i or j:
        source = back[i][j]
        assert source is not None
        previous_i, previous_j, kind = source
        if kind == "skip":
            free = [*phrases[previous_j], *free]
        elif kind == "unsung":
            sung.insert(0, (lines[previous_i], []))
        elif kind == "line":
            notes = [note for phrase in phrases[previous_j:j] for note in phrase]
            sung.insert(0, (lines[previous_i], notes))
        else:
            for line, notes in reversed(
                list(zip(lines[previous_i:i], _share(phrases[previous_j], sizes[previous_i:i]), strict=True))
            ):
                sung.insert(0, (line, notes))
        i, j = previous_i, previous_j
    return sung, free


def _assign(
    score: Score, placed: LyricLayout, vocal: Sequence[Note], language: str, step: int
) -> tuple[Sung, list[Note]]:
    sung: Sung = []
    free: list[Note] = []
    for part in placed.parts:
        lines, left = _assign_part(score, part, vocal, language, step)
        sung += lines
        free += left
    return sung, free


def _as_laid_out(placed: LyricLayout, vocal: Sequence[Note], language: str) -> tuple[Sung, list[Note]]:
    """The lines on the notes the layout gives them, and the notes it gives no line."""
    sung = [(line, _line_notes(line, vocal)) for line in placed.lines() if wanted_notes(line, language)]
    held = placed.syllables().keys() | placed.holds()
    if not any(notes for _, notes in sung):
        return sung, []
    return sung, [n for n in vocal if n.onset not in held]


def _touches(begin: int, end: int, window: tuple[int, int] | None) -> bool:
    return window is None or (end > window[0] and begin < window[1])


def _limit(score: Score, line: Line, own: Sequence[Note], vocal: Sequence[Note]) -> int:
    """How far a line's notes may reach: a breath before the next note of the melody, inside its section."""
    end = own[-1].end
    if line.pinned:
        return max(end, min(line.end, score.total))
    _, last = _section_range(score, own[0].onset)
    stop = score.starts[last] if last < score.measure_count else score.total
    following = next((n.onset for n in vocal if n.onset >= end), None)
    return max(end, stop if following is None else min(stop, following - phrase_gap(score)))


def _repair_lines(
    score: Score,
    sung: Sung,
    language: str,
    window: tuple[int, int] | None,
    surplus: str,
    style: _Style,
    report: _Report,
) -> Score:
    """Every line touching ``window`` with as many notes as syllables. A line repaired is seen as it is now by the
    lines after it: a repeated section takes the repaired melody."""
    current = score
    for index, (line, own) in enumerate(sung):
        want = wanted_notes(line, language)
        if not own or len(own) == want or not _touches(own[0].onset, own[-1].end, window):
            continue
        vocal = _sorted(current.vocal)
        key = harmony.section_key(current, *_section_range(current, own[0].onset))
        limit = _limit(current, line, own, vocal)
        moved: list[Note] = []
        if len(own) < want:
            new_notes = _more_notes(current, sung, index, want, limit, key, style, report)
            if new_notes is None:
                report.no_room.append(line.text)
                continue
        else:
            new_notes = own
            # much more than the text needs: the rest of the melody stays, on the instrument line
            if surplus == "ins" or (surplus == "auto" and len(own) - want >= max(TAIL_NOTES, want)):
                new_notes, moved = _to_instrument(own, want, current.ins)
                report.to_ins += len(moved)
            leftover = len(new_notes) - want
            if leftover:
                report.omitted += leftover
                new_notes = _omit_notes(current, new_notes, leftover, key, style)
        gone = {n.onset for n in own}
        before = {(n.onset, n.duration, n.pitch) for n in own}
        report.changed |= {
            note_id("vocal", n.onset) for n in new_notes if (n.onset, n.duration, n.pitch) not in before
        }
        report.changed |= {note_id("ins", n.onset) for n in moved}
        current = current.with_track(
            "vocal", _sorted([*(n for n in vocal if n.onset not in gone), *new_notes])
        )
        if moved:
            current = current.with_track("ins", _sorted([*current.ins, *moved]))
        sung[index] = (line, new_notes)
    return current


def _more_notes(
    score: Score,
    sung: Sung,
    index: int,
    want: int,
    limit: int,
    key: harmony.Key,
    style: _Style,
    report: _Report,
) -> list[Note] | None:
    line, own = sung[index]
    donor = _donor(score, sung, index, want, limit, style)
    if donor is not None:
        report.borrowed += 1
        report.added += want - len(own)
        return donor
    placed, fresh, missing = _add_notes(score, own, limit, want - len(own), style)
    if missing == want - len(own):
        return None
    report.added += want - len(own) - missing
    if missing:
        report.no_room.append(line.text)
    return _with_pitches(score, placed, fresh, key, style)


def _with_pitches(
    score: Score, notes: list[Note], fresh: set[int], key: harmony.Key, style: _Style
) -> list[Note]:
    """The new notes' pitches, run by run between the notes that stay."""
    result = list(notes)
    index = 0
    while index < len(result):
        if result[index].onset not in fresh:
            index += 1
            continue
        stop = index
        while stop < len(result) and result[stop].onset in fresh:
            stop += 1
        slots = [(n.onset, n.duration) for n in result[index:stop]]
        before = result[index - 1].pitch if index else None
        after = result[stop].pitch if stop < len(result) else None
        chosen = _pitches(score, slots, before, after, key, style)
        if chosen is not None:
            for k, pitch in enumerate(chosen):
                note = result[index + k]
                result[index + k] = Note(note.onset, note.duration, pitch)
        index = stop
    return result


def _ins_free(note: Note, ins: Sequence[Note]) -> bool:
    return not any(n.onset < note.end and n.end > note.onset for n in ins)


def _to_instrument(own: list[Note], want: int, ins: Sequence[Note]) -> tuple[list[Note], list[Note]]:
    """A line's last notes for the instrument line, where it is silent: ``(the line's notes, the moved ones)``."""
    keep = list(own)
    moved: list[Note] = []
    while len(keep) > want and _ins_free(keep[-1], [*ins, *moved]):
        moved.insert(0, keep.pop())
    return keep, moved


def _free_notes(
    score: Score, free: Sequence[Note], window: tuple[int, int] | None, surplus: str, report: _Report
) -> Score:
    """Notes no line sings (the text is the basis): for the instrument line where it is silent, or gone."""
    chosen = [n for n in free if _touches(n.onset, n.end, window)]
    if not chosen:
        return score
    ins = _sorted(score.ins)
    gone: set[int] = set()
    for note in chosen:
        gone.add(note.onset)
        if surplus != "omit" and _ins_free(note, ins):
            ins = _sorted([*ins, note])
            report.to_ins += 1
            report.changed.add(note_id("ins", note.onset))
        else:
            report.omitted += 1
    return score.with_track("vocal", [n for n in _sorted(score.vocal) if n.onset not in gone]).with_track(
        "ins", ins
    )


# --- a line without notes ------------------------------------------------------------------------------------


def _new_phrases(
    score: Score, sung: Sung, language: str, window: tuple[int, int] | None, style: _Style, report: _Report
) -> Score:
    """Lines no note sings: a phrase in the free bars where they belong, in order, when the song has room."""
    result = _sorted(score.vocal)
    gap = phrase_gap(score)
    for index, (line, own) in enumerate(sung):
        want = wanted_notes(line, language)
        if not want or own:
            continue
        before = next((notes[-1].end for _, notes in reversed(sung[:index]) if notes), 0)
        after = next((notes[0].onset for _, notes in sung[index + 1 :] if notes), score.total)
        taken = [n for n in result if before <= n.onset < after]
        if taken:
            after = taken[0].onset
        if not _touches(before, after, window):
            continue
        phrase = _phrase_in(score, before, after, want, gap, sung, index, style)
        if phrase is None:
            report.no_room.append(line.text)
            continue
        report.phrases += 1
        report.added += len(phrase)
        report.changed |= {note_id("vocal", note.onset) for note in phrase}
        result = _sorted([*result, *phrase])
        sung[index] = (line, phrase)
    return score.with_track("vocal", result) if len(result) != len(score.vocal) else score


def _phrase_in(
    score: Score,
    before: int,
    after: int,
    want: int,
    gap: int,
    sung: Sung,
    index: int,
    style: _Style,
) -> list[Note] | None:
    """``want`` notes between ``before`` and ``after``: starting on the next bar or beat after a breath."""
    earliest = before + gap if before else 0
    if earliest >= score.total:
        return None
    # on the next bar when the notes have room from there, else on the next beat after a breath
    measure = score.measure_at(earliest)
    beat = max(1, score.units_per_quarter)
    bar_start = score.starts[measure] if score.starts[measure] >= earliest else None
    if bar_start is None and measure + 1 < score.measure_count:
        bar_start = score.starts[measure + 1]
    from_bar = score.starts[measure]
    on_beat = from_bar + math.ceil((earliest - from_bar) / beat) * beat
    end = after - (gap if after < score.total else 0)
    start = next((s for s in (bar_start, on_beat) if s is not None and end - s >= want * style.step), None)
    if start is None:
        return None
    room = end - start
    first, last = _section_range(score, start)
    key = harmony.section_key(score, first, last)
    # the melody of another line with as many notes, where it fits here
    for other, theirs in sung:
        if (
            len(theirs) == want
            and theirs
            and theirs[-1].end - theirs[0].onset <= room
            and _same_bars(score, theirs[0].onset, start)
        ):
            moved = [Note(start + n.onset - theirs[0].onset, n.duration, n.pitch) for n in theirs]
            if all(_fits(score, n, style.tensions) for n in moved) and other.text:
                return moved
    # else the rhythm of the line before, cycled; the pitches as for any new note
    template = next((notes for _, notes in reversed(sung[:index]) if notes), None)
    durations = [n.duration for n in template] if template else [_usual_duration(style, room)]
    lengths = [durations[k % len(durations)] for k in range(want)]
    while sum(lengths) > room:
        longest = max(range(want), key=lambda k: lengths[k])
        if lengths[longest] <= style.step:
            return None
        lengths[longest] = max(style.step, lengths[longest] - style.step)
    slots: list[tuple[int, int]] = []
    at = start
    for length in lengths:
        slots.append((at, length))
        at += length
    previous = next((notes[-1].pitch for _, notes in reversed(sung[:index]) if notes), None)
    chosen = _pitches(score, slots, previous, None, key, style)
    if chosen is None:
        return None
    return [Note(a, d, p) for (a, d), p in zip(slots, chosen, strict=True)]


# --- the operation ---------------------------------------------------------------------------------------------


def fit_notes(
    score: Score,
    lyrics: str,
    *,
    spans: Sequence[Sequence[int]] | None = None,
    window: tuple[int, int] | None = None,
    surplus: str = "auto",
    style_text: str = "",
) -> tuple[Score, _Report]:
    """``score`` with notes that fit ``lyrics`` - in the lines touching ``window`` (``[start, end)`` in units of L;
    ``None``: the whole song)."""
    if surplus not in SURPLUS:
        raise PlenioValidationError(f"'surplus' must be one of {', '.join(SURPLUS)}.")
    language = syllable_rules.guess_language(lyrics)
    report = _Report()
    style = _style(score, style_text)
    # first the lines on the phrases they belong on; then, for what the layout still sings otherwise, on its notes
    placed = layout(score, lyrics, spans)
    sung, free = _assign(score, placed, _sorted(score.vocal), language, style.step)
    current = _repair_lines(score, sung, language, window, surplus, style, report)
    current = _free_notes(current, free, window, surplus, report)
    current = _new_phrases(current, sung, language, window, style, report)
    for _ in range(MAX_PASSES):
        placed = layout(current, lyrics, spans)
        vocal = _sorted(current.vocal)
        sung, free = _as_laid_out(placed, vocal, language)
        repaired = _repair_lines(
            current, sung, language, window, "omit" if surplus == "auto" else surplus, style, report
        )
        repaired = _free_notes(repaired, free, window, surplus, report)
        if repaired.vocal == current.vocal and repaired.ins == current.ins:
            break
        current = repaired
    return current, report


def _message(report: _Report) -> str:
    parts = []
    if report.added:
        parts.append(f"{report.added} note(s) added")
    if report.omitted:
        parts.append(f"{report.omitted} left out")
    if report.to_ins:
        parts.append(f"{report.to_ins} moved to the Ins")
    if report.borrowed:
        parts.append(f"{report.borrowed} line(s) took the song's own melody")
    if report.phrases:
        parts.append(f"{report.phrases} new phrase(s)")
    return "notes fit to the lyrics: " + ", ".join(parts)


def apply(abc: str, operation: Mapping[str, Any]) -> EditResult:
    """The operation ``fit_notes``: ``lyrics``, optional ``spans``, ``start`` and ``end`` (units of L), ``surplus``
    (``auto``, ``omit`` or ``ins``, see ``SURPLUS``) and ``style`` (the song's style, for what its genre allows over a chord)."""
    lyrics = operation.get("lyrics")
    if not isinstance(lyrics, str) or not lyrics.strip():
        raise PlenioValidationError("The notes are fitted to the lyrics: this score has none here.")
    spans = operation.get("spans")
    if isinstance(spans, list):
        spans = [s for s in spans if isinstance(s, list) and all(type(x) is int and x >= 0 for x in s)]
    start, end = operation.get("start"), operation.get("end")
    window = (
        (int(start), int(end)) if isinstance(start, int | float) and isinstance(end, int | float) else None
    )
    score = from_abc(abc)
    new, report = fit_notes(
        score,
        lyrics,
        spans=spans if isinstance(spans, list) else None,
        window=window,
        surplus=str(operation.get("surplus", "auto")),
        style_text=str(operation.get("style") or ""),
    )
    # what still does not fit, as the layout sings it now
    still = [
        line
        for line in mismatches(new, lyrics, spans if isinstance(spans, list) else None)
        if window is None or window[0] <= line["start"] < window[1]
    ]
    warnings = tuple(
        f'no room for the notes of "{line["text"]}": add bars or shorten the line'
        if line["syllables"] > line["notes"]
        else f'"{line["text"]}" keeps {line["notes"]} notes for {line["syllables"]} syllable(s)'
        for line in still
    )
    if new is score or (new.vocal == score.vocal and new.ins == score.ins):
        return EditResult(abc, ("the notes already fit the lyrics here",) if not warnings else (), warnings)
    existing = {note_id("vocal", n.onset) for n in new.vocal} | {note_id("ins", n.onset) for n in new.ins}
    return EditResult(to_abc(new), (_message(report),), warnings, tuple(sorted(report.changed & existing)))
