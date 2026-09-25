"""Score preparation from a brief (Score Tools *prepare from brief*), for songs and covers.

Every step is deterministic, validated by the score operations and reported:

1. a plan that ends inside its last group (cut off at the planner's token limit) loses that group;
2. covers: *harmony new* removes the chord symbols (the render then runs in melody mode);
3. instrumental songs and covers: the Vocal voice is silenced - the instrument plays the melody
   (*lead*) or the song is accompaniment only;
4. instrumental songs: a plan longer than 1.5 x the brief's target is fitted at section
   boundaries (the planner ignores the intended length for tag-only lyrics, Phase 4A E4).
"""

from __future__ import annotations

from .brief import CoverBrief, SongBrief
from .score import native

FIT_THRESHOLD = 1.5


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
        if duration > FIT_THRESHOLD * brief.target_seconds:
            step = native.fit_length(text, brief.target_seconds)
            text = step.abc
            changes += step.changes
            warnings += step.warnings
    if isinstance(brief, CoverBrief):
        warnings += brief.warnings()
    return native.Change(text, tuple(changes), tuple(warnings))
