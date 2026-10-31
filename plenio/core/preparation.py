"""Score preparation from a brief (Score Tools *prepare from brief*), for songs and covers.

Every step is deterministic, validated by the score operations and reported:

1. a plan that ends inside its last group (cut off at the planner's token limit) loses that group;
2. covers: *harmony new* removes the chord symbols (the render then runs in melody mode);
3. instrumental songs and covers: the Vocal voice is silenced - the instrument plays the melody
   (*lead*) or the song is accompaniment only;
4. instrumental songs: a plan longer than 1.2 x the brief's target is shortened - at section
   boundaries, or inside a section at a phrase, keeping the plan's ending - and a plan shorter
   than 0.8 x repeats its middle (the planner ignores the intended length for tag-only lyrics,
   Phase 4A E4; the owner's instrumentals ran from 0.4 x to 3.8 x the target, study E6);
5. sung covers: a long Vocal rest inside a sung section (``LONG_REST_BARS``) becomes an interlude
   section of its own (``split_long_rests``);
6. instrumental songs: a long section is split into parts of 8 or 16 bars at phrase ends, named by
   their music - a part that repeats an earlier one takes its name (``split_long_sections``).
"""

from __future__ import annotations

from bisect import bisect_right

from . import song_form
from .brief import ORIGINAL_NOTES_DEFAULT, CoverBrief, SongBrief
from .score import canonical, native, ops
from .score.thin import thin

FIT_THRESHOLD = 1.2
LONG_REST_BARS = 4
"""Full bars without singing inside a sung section from which the rest becomes an interlude. Study of
2026-10-09 (the owner's cover of a song with a 5-bar rest inside its first verse): YuE2 took the rest for
the end of the section and sang the next lyrics block there - the chorus - so the rest of the verse was
lost; with the rest as an interlude section between two verse sections it sang the verse on (two seeds),
two verse sections without the interlude did not help. The bar after the last sung one and the bar before
the singing starts again stay with the verse: there the transcription often misses a last word or a
pickup the lyrics ASR heard (*Hand.*, *Im Strand*), and the lyrics follow the bars."""
SPLIT_KINDS = frozenset({"verse", "chorus", "pre-chorus", "post-chorus", "bridge", "hook", "refrain"})
"""Sung section kinds a long rest is split out of (intros, outros and interludes keep their rests)."""
LONG_SECTION_BARS = 16
"""A section of an instrumental song longer than this is split into parts. The owner's 110 instrumental demos
of 2026-10-12 (0.5.x/0.6.0, 3:00 each): YuE2 planned 1-3 sections in 44 % of them - most often an intro and one
*interlude* of 50-120 bars - although the planner read eight section tags; the arrangement then had one or two
sections to vary. Study E6: plans with more sections rendered more varied in 7 of 10 pairs."""
PART_BARS = (8, 16)
"""The part length: 8 bars for a section of up to ``SHORT_PARTS_UP_TO`` bars, 16 for a longer one."""
SHORT_PARTS_UP_TO = 48
PART_NAMES = ("verse", "chorus", "bridge", "break", "solo", "interlude")
"""Names for the parts that bring new music, in turn (the instrumental adapter's vocabulary); the first part
keeps the section's name, and a part that repeats an earlier one takes that one's name."""
SAME_MUSIC = 0.7
"""Share of a part's melody notes (pitch and place in the part) that must match an earlier part's for it to
count as a repeat."""


def prepare_for_brief(text: str, brief: SongBrief | CoverBrief | None) -> native.Change:
    changes: list[str] = []
    warnings: list[str] = []
    # a plan YuE2 wrote not quite in the dialect: its lines' measures, then a plan cut off at the token limit
    for repair in (native.repair_groups, native.repair_truncated):
        repaired = repair(text)
        if repaired is not None:
            text = repaired.abc
            changes += repaired.changes
            warnings += repaired.warnings
    if brief is None:
        native.validate(text)
        return native.Change(text, (*changes, "no brief connected: score unchanged"), tuple(warnings))
    if isinstance(brief, CoverBrief) and brief.harmony == "new":
        step = native.strip_chords(text)
        text = step.abc
        changes += [f"harmony new: {c}" for c in step.changes]
    step = native.prepare(text, instrumental=brief.instrumental, melody=brief.melody)
    text = step.abc
    changes += step.changes
    warnings += step.warnings
    if isinstance(brief, CoverBrief) and brief.original_notes < ORIGINAL_NOTES_DEFAULT:
        # fewer of the source's notes, so that YuE2 interprets more freely (owner's request 2026-10-31); a sung
        # cover's melody keeps every note - with it thinned YuE2 left the words out (measured, thin.py)
        thinned = thin(text, brief.original_notes, keep_sung=not brief.instrumental)
        text = thinned.abc
        changes += thinned.changes
    if isinstance(brief, SongBrief) and brief.instrumental:
        duration = native.validate(text).duration_s
        if not native.EXTEND_BELOW * brief.target_seconds <= duration <= FIT_THRESHOLD * brief.target_seconds:
            step = native.fit_length(text, brief.target_seconds)
            text = step.abc
            changes += step.changes
            warnings += step.warnings
    if isinstance(brief, CoverBrief) and not brief.instrumental:
        step = split_long_rests(text)
        text = step.abc
        changes += step.changes
    if isinstance(brief, SongBrief) and brief.instrumental:
        step = split_long_sections(text)
        text = step.abc
        changes += step.changes
    if isinstance(brief, CoverBrief):
        warnings += brief.warnings()
    return native.Change(text, tuple(changes), tuple(warnings))


def split_long_rests(text: str) -> native.Change:
    """Every rest of at least ``LONG_REST_BARS`` full bars between two Vocal notes of a sung section becomes
    an interlude: the section goes on (same name) after it. A score outside the editable subset stays."""
    try:
        score = canonical.from_abc(text)
    except (canonical.ScoreSyntaxError, canonical.ScoreModelError):
        return native.Change(text, ())
    starts = ops._section_starts(score)
    cuts: list[
        tuple[int, int, str]
    ] = []  # (first interlude bar, first bar of the section again, label), 0-based
    for index, section in enumerate(starts):
        if song_form.kind(section.label) not in SPLIT_KINDS:
            continue
        end = starts[index + 1].measure if index + 1 < len(starts) else score.measure_count
        first, last = score.starts[section.measure], score.starts[end]
        notes = sorted((n for n in score.vocal if first <= n.onset < last), key=lambda n: n.onset)
        for current, following in zip(notes, notes[1:], strict=False):
            rest_from = (
                bisect_right(score.starts, current.end - 1) - 1 + 1
            )  # the first bar after the sung one
            resume = bisect_right(score.starts, following.onset) - 1  # the bar the singing starts again
            if resume - rest_from >= LONG_REST_BARS:
                cuts.append((rest_from + 1, resume - 1, section.label))
    if not cuts:
        return native.Change(text, ())
    changes = []
    for start, again, label in sorted(cuts, reverse=True):  # the later cut first: earlier bars stay
        score = ops.start_section(score, again + 1, label).score
        score = ops.start_section(score, start + 1, "interlude").score
        changes.append(
            f"{label}: {again - start + 2} bars without singing - bars {start + 1}-{again} are an interlude "
            f"and the {label} goes on from bar {again + 1} (YuE2 takes a long rest for the end of a section "
            "and would sing the next lyrics there)"
        )
    return native.Change(canonical.to_abc(score), tuple(reversed(changes)))


def _crosses(score: canonical.Score, bar: int) -> bool:
    """A melody note sounds across the barline before ``bar`` (0-based): no phrase ends there."""
    line = score.starts[bar]
    return any(n.onset < line < n.end for n in (*score.vocal, *score.ins))


def _cut_at(score: canonical.Score, wanted: int, low: int, high: int) -> int:
    """The barline next to ``wanted`` (within one bar, between ``low`` and ``high``) where no melody note is
    held across - a phrase ends there; ``wanted`` when every candidate is inside a phrase."""
    candidates = [c for c in (wanted, wanted - 1, wanted + 1) if low <= c <= high]
    return next((c for c in candidates if not _crosses(score, c)), wanted)


def _melody(score: canonical.Score, first: int, end: int) -> list[tuple[int, int]]:
    """The melody of bars ``first``..``end`` (0-based, end exclusive): (place in the part, pitch) per note."""
    begin, stop = score.starts[first], score.starts[end]
    return sorted((n.onset - begin, n.pitch) for n in (*score.vocal, *score.ins) if begin <= n.onset < stop)


def _same(a: list[tuple[int, int]], b: list[tuple[int, int]]) -> bool:
    if not a or not b:
        return not a and not b
    shared = len(set(a) & set(b))
    return shared >= SAME_MUSIC * max(len(a), len(b))


def split_long_sections(text: str) -> native.Change:
    """Every section of an instrumental song longer than ``LONG_SECTION_BARS`` is split into parts of
    ``PART_BARS`` - at the barline nearest the part length where no melody note is held across. The first part keeps the section's name (an outro's last part); a part that
    repeats an earlier part of the song takes its name, a part with new music the next of ``PART_NAMES``. Only section starts are added: the notes stay. A
    score outside the editable subset stays."""
    try:
        score = canonical.from_abc(text)
    except (canonical.ScoreSyntaxError, canonical.ScoreModelError):
        return native.Change(text, ())
    starts = ops._section_starts(score)
    bounds = [
        (s.measure, starts[i + 1].measure if i + 1 < len(starts) else score.measure_count, s.label)
        for i, s in enumerate(starts)
    ]
    parts: list[tuple[int, int, str]] = []  # (first bar, end bar, name) of every part of the song, 0-based
    cuts: list[tuple[int, str, str]] = []  # (first bar of a new part, its name, the section it comes from)
    names_used = {song_form.kind(label) for _first, _end, label in bounds}
    for first, end, label in bounds:
        bars = end - first
        if bars <= LONG_SECTION_BARS:
            parts.append((first, end, label))
            continue
        kind = song_form.kind(label)
        size = PART_BARS[0] if bars <= SHORT_PARTS_UP_TO else PART_BARS[1]
        edges = [first]
        wanted = first + size
        while end - wanted >= size // 2:  # a shorter rest joins the last part
            edges.append(_cut_at(score, wanted, edges[-1] + size // 2, end - size // 2))
            wanted = edges[-1] + size
        edges.append(end)
        own = len(edges) - 2 if kind == "outro" else 0  # the part that keeps the name: an outro's is its last
        for index, (a, b) in enumerate(zip(edges, edges[1:], strict=False)):
            melody = _melody(score, a, b)
            earlier = next((name for pa, pb, name in parts if _same(_melody(score, pa, pb), melody)), None)
            if index == own:
                name = label
            elif earlier is not None and song_form.kind(earlier) not in ("intro", "outro"):
                name = earlier
            else:
                name = next((n for n in PART_NAMES if n not in names_used), PART_NAMES[-1])
                names_used.add(name)
            parts.append((a, b, name))
            if index:
                cuts.append((a, name, label))
            elif name != label:  # an outro's first part: the section's first bar is renamed
                cuts.append((a, name, label))
    if not cuts:
        return native.Change(text, ())
    firsts = {first for first, _end, _label in bounds}
    for bar, name, _label in sorted(cuts, reverse=True):
        if bar in firsts:
            score = ops.rename_section_at(score, bar + 1, name).score
        else:
            score = ops.start_section(score, bar + 1, name).score
    by_section: dict[str, list[str]] = {}
    for bar, name, label in cuts:
        by_section.setdefault(label, []).append(f"{name} from bar {bar + 1}")
    changes = tuple(
        f"instrumental: the long {label} is split into parts at phrase ends - {', '.join(items)} (more sections "
        "for the arrangement and the render to vary)"
        for label, items in by_section.items()
    )
    return native.Change(canonical.to_abc(score), changes)
