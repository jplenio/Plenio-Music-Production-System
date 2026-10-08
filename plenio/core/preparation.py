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
   section of its own (``split_long_rests``).
"""

from __future__ import annotations

from bisect import bisect_right

from . import song_form
from .brief import CoverBrief, SongBrief
from .score import canonical, native, ops

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


def prepare_for_brief(text: str, brief: SongBrief | CoverBrief | None) -> native.Change:
    changes: list[str] = []
    warnings: list[str] = []
    repaired = native.repair_truncated(text)
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
