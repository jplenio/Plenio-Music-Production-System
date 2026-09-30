"""Fitting instrumental plans to the brief's length (study E6, the owner's records of 2026-09-30).

With the lyrics ``[instrumental]`` YuE2 plans an intro and one long section that repeats for minutes
(up to 3.8 x the target) or a short form (down to 0.4 x). ``fit_length`` shortens inside a section at a
phrase and keeps the plan's ending, or repeats the middle of a short plan; preparation applies it to
every instrumental plan outside 0.8-1.2 x the target.
"""

from __future__ import annotations

import json
from pathlib import Path

from plenio.core.brief import SongBrief
from plenio.core.preparation import prepare_for_brief
from plenio.core.score import canonical, native, ops

PLAN = json.loads(
    (Path(__file__).parents[1] / "fixtures" / "cover" / "yue2-take-y3.json").read_text("utf-8")
)["abc"]
# 197 s: intro 26, verse 23, chorus 35, verse 26, chorus 46, outro 40 (68 bars)


def one_long_section(repeats: int = 4) -> str:
    """The plan's shape for [instrumental]: an intro and one long section (here the rest of y3, repeated)."""
    score = canonical.from_abc(PLAN)
    for section in reversed(score.sections[2:]):
        score = ops.remove_section(score, section.measure + 1).score
    body = score.sections[1].measure
    block = score.measure_count - body - 8  # the last 8 bars stay the plan's ending
    for _ in range(repeats):
        score = ops.duplicate_measures(score, body + 1, block).score
    return canonical.to_abc(score)


def last_bars(text: str, count: int) -> list[tuple[object, ...]]:
    score = canonical.from_abc(text)
    first = score.starts[score.measure_count - count]
    return sorted(
        (kind, n.onset - first, n.duration, n.pitch)
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if n.onset >= first
    )


def test_a_long_single_section_is_cut_at_a_phrase_and_keeps_its_ending() -> None:
    long = one_long_section()
    before = native.validate(long)
    assert [s.label for s in before.sections] == ["intro", "verse"] and before.duration_s > 500
    change = native.fit_length(long, 180.0)
    after = native.validate(change.abc)
    assert 0.8 * 180 <= after.duration_s <= native.FIT_TOLERANCE * 180
    assert "inside the verse section" in change.changes[0] and "kept as the ending" in change.changes[0]
    first, last = (int(x) for x in change.changes[0].split("(bars ")[1].split(")")[0].split("-"))
    ending = last - first + 1
    assert ending >= 4 and last_bars(change.abc, ending) == last_bars(long, ending)  # the plan's own ending
    # the start is the plan's start, cut at a phrase (a multiple of 4 bars into the section)
    assert [s.label for s in after.sections] == ["intro", "verse"]
    kept = int(change.changes[0].split("bars ")[1].split("-")[0]) - 1
    assert (kept - before.sections[1].start_bar + 1) % native.PHRASE_BARS == 0


def test_whole_sections_are_removed_when_the_plan_has_a_form() -> None:
    change = native.fit_length(PLAN, 120.0)
    after = native.validate(change.abc)
    assert "kept intro" in change.changes[0] and after.sections[-1].label == "outro"
    assert 0.75 * 120 <= after.duration_s <= native.FIT_TOLERANCE * 120


def test_a_short_plan_repeats_its_middle() -> None:
    change = native.fit_length(PLAN, 360.0)  # 197 s is 0.55 x
    after = native.validate(change.abc)
    labels = [s.label for s in after.sections]
    assert labels[0] == "intro" and labels[-1] == "outro"
    assert labels[1:-1] == ["verse", "chorus", "verse", "chorus"] * (len(labels[1:-1]) // 4)
    assert len(labels) > 6 and "repeated" in change.changes[0]
    assert 0.8 * 360 <= after.duration_s <= native.EXTEND_CEILING * 360
    assert last_bars(change.abc, 8) == last_bars(PLAN, 8)


def test_two_sections_repeat_the_second_and_one_section_stays() -> None:
    score = canonical.from_abc(PLAN)
    for section in reversed(score.sections[2:]):
        score = ops.remove_section(score, section.measure + 1).score
    two = canonical.to_abc(score)
    change = native.fit_length(two, 360.0)
    assert "repeated" in change.changes[0]
    assert native.validate(change.abc).duration_s > native.validate(two).duration_s
    single = canonical.to_abc(
        ops.remove_section(canonical.from_abc(two), score.sections[1].measure + 1).score
    )
    unchanged = native.fit_length(single, 360.0)
    assert unchanged.abc == single and "single section" in unchanged.changes[0]


def test_preparation_fits_instrumental_plans_outside_the_corridor_only() -> None:
    instrumental = SongBrief(vocals="instrumental", length="about 2:30")  # 197 s is 1.31 x
    prepared = prepare_for_brief(PLAN, instrumental)
    assert any("fitted" in c for c in prepared.changes)
    assert native.validate(prepared.abc).duration_s <= native.FIT_TOLERANCE * 150
    fits = prepare_for_brief(PLAN, SongBrief(vocals="instrumental", length="about 3:30"))  # 0.94 x
    assert not any("fitted" in c or "extended" in c for c in fits.changes)
    sung = prepare_for_brief(PLAN, SongBrief(length="very long (about 6:00)"))
    assert sung.abc == PLAN  # sung plans follow their lyrics: never fitted
