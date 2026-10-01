"""Arranging the score (owner's request 2026-10-01, docs/design/score-arrange-design.md).

``arrange_measures`` / ``arrange_sections`` rebuild a score from its own measures (copy, delete,
move whole sections); ``paste`` puts a clip at the cursor, overwriting or inserting time. Every
result is a valid score whose text re-parses to the same model, every new measure holds exactly what
its source measure held, and the time map says where the old time went (the Guide track follows it).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.score import operations, ops
from score_strategies import scores

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
PLAN = json.loads((FIXTURES / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))["abc"]
# sections: intro, verse, chorus, verse, chorus, outro (68 bars)


def content(score: c.Score, measure: int) -> tuple[object, ...]:
    """Everything that sounds in one measure, relative to its start: notes (clipped), chords, key, meter."""
    start, end = score.starts[measure], score.starts[measure + 1]
    notes = tuple(
        (kind, max(n.onset, start) - start, min(n.end, end) - max(n.onset, start), n.pitch)
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if n.onset < end and n.end > start
    )
    chords = tuple((ch.onset - start, ch.name) for ch in score.chords if start <= ch.onset < end)
    keys = tuple((k.onset - start, k.key) for k in score.keys if start < k.onset < end)
    return (score.meters[measure], score.key_at(start), keys, notes, chords)


def roundtrip(score: c.Score) -> None:
    text = c.to_abc(score)
    assert c.from_abc(text) == score


def labels(score: c.Score) -> list[str]:
    return [s.label for s in ops._section_starts(score)]


@settings(max_examples=60, deadline=None, suppress_health_check=[HealthCheck.too_slow])
@given(data=st.data(), score=scores())
def test_every_arrangement_keeps_each_measure_and_writes_valid_text(
    data: st.DataObject, score: c.Score
) -> None:
    order = data.draw(
        st.lists(st.integers(0, score.measure_count - 1), min_size=1, max_size=score.measure_count + 4)
    )
    result = ops.arrange_measures(score, order)
    if order == list(range(score.measure_count)):
        assert result.score is score
        return
    new = result.score
    assert new.measure_count == len(order)
    for index, source in enumerate(order):
        assert content(new, index) == content(score, source)
    roundtrip(new)
    # the time map covers the new score once, piece by piece, and points into the old one
    covered = 0
    for old_start, old_end, new_start in result.time_map or ():
        assert new_start == covered and 0 <= old_start < old_end <= score.total
        covered += old_end - old_start
    assert covered == new.total


def test_sections_are_duplicated_deleted_and_moved() -> None:
    score = c.from_abc(PLAN)
    assert labels(score) == ["intro", "verse", "chorus", "verse", "chorus", "outro"]
    starts = ops._section_starts(score)
    bounds = [s.measure for s in starts] + [score.measure_count]
    chorus = bounds[5] - bounds[4]  # the second chorus, in bars

    copied = ops.arrange_sections(score, [1, 2, 3, 4, 5, 5, 6])
    assert labels(copied.score) == ["intro", "verse", "chorus", "verse", "chorus", "chorus", "outro"]
    assert copied.score.measure_count == score.measure_count + chorus
    assert "copied chorus" in copied.changes[0]
    for offset in range(chorus):
        assert content(copied.score, bounds[5] + offset) == content(score, bounds[4] + offset)

    deleted = ops.arrange_sections(score, [1, 2, 3, 6])
    assert labels(deleted.score) == ["intro", "verse", "chorus", "outro"]
    assert "deleted verse, chorus" in deleted.changes[0]

    moved = ops.arrange_sections(score, [1, 3, 2, 4, 5, 6])
    assert labels(moved.score) == ["intro", "chorus", "verse", "verse", "chorus", "outro"]
    assert content(moved.score, bounds[1]) == content(score, bounds[2])  # the chorus now opens bar 2's place
    assert moved.changes[0].startswith("sections moved")
    for result in (copied, deleted, moved):
        roundtrip(result.score)

    with pytest.raises(PlenioValidationError):
        ops.arrange_sections(score, [])
    with pytest.raises(PlenioValidationError):
        ops.arrange_sections(score, [7])


def test_a_note_across_a_seam_is_cut_and_keys_stay_with_their_bars() -> None:
    score = c.from_abc(PLAN)
    starts = ops._section_starts(score)
    keyed = ops.put_key(score, score.starts[starts[2].measure], "G").score  # the first chorus in G, then on
    chorus_key = keyed.key_at(keyed.starts[starts[2].measure])
    moved = ops.arrange_sections(keyed, [1, 3, 2, 4, 5, 6]).score
    first_bar_of_chorus = starts[1].measure
    assert moved.key_at(moved.starts[first_bar_of_chorus]) == chorus_key
    verse_now = first_bar_of_chorus + (starts[3].measure - starts[2].measure)
    assert moved.key_at(moved.starts[verse_now]) == keyed.key_at(keyed.starts[starts[1].measure])
    roundtrip(moved)
    # a note tied over a bar line between two bars that are no longer neighbours is cut there
    tied = next(n for n in score.vocal if score.measure_at(n.onset) != score.measure_at(n.end - 1))
    first = score.measure_at(tied.onset)
    split = ops.arrange_measures(score, [first, first]).score
    assert all(n.end <= split.starts[1] or n.onset >= split.starts[1] for n in split.vocal)


def test_paste_overwrites_the_covered_voices_and_keeps_the_rest() -> None:
    score = c.from_abc(PLAN)
    bar = score.lengths[0]
    clip = [
        {"track": "vocal", "onset": 0, "duration": bar // 2, "pitch": 72},
        {"track": "vocal", "onset": bar // 2, "duration": bar // 2, "pitch": 74},
    ]
    at = score.starts[10]
    result = ops.paste(score, at, bar, clip)
    new = result.score
    assert [(n.onset, n.duration, n.pitch) for n in new.vocal if at <= n.onset < at + bar] == [
        (at, bar // 2, 72),
        (at + bar // 2, bar // 2, 74),
    ]
    assert new.ins == score.ins and new.chords == score.chords  # other voice and chords untouched
    assert result.time_map is None and set(result.select) == {f"vocal:{at}", f"vocal:{at + bar // 2}"}
    # a range clip covers both voices and the chords, silence included
    cleared = ops.paste(score, at, bar, [], tracks=["vocal", "ins"], with_chords=True).score
    assert not [n for n in cleared.vocal + cleared.ins if at <= n.onset < at + bar]
    assert not [ch for ch in cleared.chords if at <= ch.onset < at + bar]
    roundtrip(new)
    with pytest.raises(PlenioValidationError, match="overlap"):
        ops.paste(score, at, bar, [*clip, {"track": "vocal", "onset": 1, "duration": 2, "pitch": 60}])
    with pytest.raises(PlenioValidationError, match="empty"):
        ops.paste(score, at, bar, [])


def test_paste_time_inserts_whole_bars_at_the_cursor() -> None:
    score = c.from_abc(PLAN)
    bar = score.lengths[0]
    at = score.starts[10] + bar // 4  # inside bar 11
    clip = [{"track": "ins", "onset": 0, "duration": bar, "pitch": 60}]
    result = ops.paste(score, at, bar + 1, clip, mode="insert")  # 1 bar + 1 unit: two bars are inserted
    new = result.score
    assert new.measure_count == score.measure_count + 2
    assert result.time_map == ((0, at, 0), (at, score.total, at + 2 * bar))
    # what followed the cursor sounds two bars later, at the same place in its bar
    for kind in ("vocal", "ins"):
        # a note sounding across the cursor is split there; its tail moves along
        later = [(max(n.onset, at) + 2 * bar, n.pitch) for n in score.track(kind) if n.end > at]
        moved = [(n.onset, n.pitch) for n in new.track(kind) if n.onset >= at + 2 * bar]
        assert moved == later
    assert any(n.onset == at and n.pitch == 60 and n.duration == bar for n in new.ins)
    roundtrip(new)
    # a clip copied from sections brings its section label; at a bar start the section moves along
    starts = ops._section_starts(score)
    verse2 = score.starts[starts[3].measure]
    with_label = ops.paste(
        score, verse2, bar, clip, mode="insert", sections=[{"onset": 0, "label": "chorus"}]
    ).score
    assert labels(with_label) == ["intro", "verse", "chorus", "chorus", "verse", "chorus", "outro"]


def test_bar_operations_say_where_the_time_went() -> None:
    score = c.from_abc(PLAN)
    bar = score.lengths[0]
    inserted = ops.insert_measures(score, 3, 2)
    assert inserted.time_map == ((0, 2 * bar, 0), (2 * bar, score.total, 4 * bar))
    deleted = ops.delete_measures(score, 3, 2)
    assert deleted.time_map == ((0, 2 * bar, 0), (4 * bar, score.total, 2 * bar))
    duplicated = ops.duplicate_measures(score, 3, 2)
    assert duplicated.time_map == (
        (0, 4 * bar, 0),
        (2 * bar, 4 * bar, 4 * bar),
        (4 * bar, score.total, 6 * bar),
    )
    # the editor's route gets it with the text
    done = operations.apply(PLAN, {"op": "arrange_sections", "order": [1, 2, 3, 6]})
    assert done.time_map is not None and c.from_abc(done.abc).measure_count < score.measure_count
    assert operations.apply(PLAN, {"op": "put_chord", "onset": 0, "name": "C"}).time_map is None


# --- the editor's lyrics follow the sections (frontend/tests/fixtures/arrange-edits.json) --------------

FOLLOW_FIXTURE = Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "arrange-edits.json"
FOLLOW_LYRICS = (
    "[Intro]\n\n[Verse 1]\nverse one a\nverse one b\n\n[Chorus]\nchorus a\nchorus b\n\n"
    "[Verse 2]\nverse two a\n\n[Chorus]\nchorus a\nchorus b\n\n[Outro]\noutro a"
)


def _follow_edits(score: c.Score) -> dict[str, dict[str, object]]:
    """Real edits of the plan (sections at bars 1, 10, 18, 30, 39, 55): what the lyrics must follow."""
    chorus_start, chorus_end = score.starts[17], score.starts[29]
    clip = [
        {"track": kind, "onset": max(n.onset, chorus_start) - chorus_start,
         "duration": min(n.end, chorus_end) - max(n.onset, chorus_start), "pitch": n.pitch}
        for kind in ("vocal", "ins")
        for n in score.track(kind)
        if n.onset < chorus_end and n.end > chorus_start
    ]
    return {
        "duplicate the first chorus": {"op": "arrange_sections", "order": [1, 2, 3, 3, 4, 5, 6]},
        "move the first chorus up": {"op": "arrange_sections", "order": [1, 3, 2, 4, 5, 6]},
        "delete the second verse and chorus": {"op": "arrange_sections", "order": [1, 2, 3, 6]},
        "join the first chorus to its verse": {"op": "merge_section", "section": 3},
        "split the first verse": {"op": "split_section", "bar": 14, "label": "bridge"},
        "delete bars across the chorus start": {"op": "delete_measures", "bar": 16, "count": 4},
        "insert bars in the first verse": {"op": "insert_measures", "bar": 12, "count": 2},
        "rename the outro": {"op": "rename_section", "section": 6, "label": "ending"},
        "insert a copied chorus before the second verse": {
            "op": "paste", "at": score.starts[29], "mode": "insert", "span": chorus_end - chorus_start,
            "tracks": ["vocal", "ins"], "with_chords": True, "notes": clip, "chords": [],
            "sections": [{"onset": 0, "label": "chorus"}],
        },
    }


def follow_fixture() -> dict[str, object]:
    """The models (sections and bars only) and time maps of real edits, for the frontend's tests."""

    def trim(abc: str) -> dict[str, object]:
        model = operations.editor_view(abc)["model"]
        return {key: model[key] for key in ("total", "measures", "sections")}

    edits = []
    for name, operation in _follow_edits(c.from_abc(PLAN)).items():
        done = operations.apply(PLAN, operation)
        shown = {k: v for k, v in operation.items() if k not in ("notes", "chords")}
        edits.append({"name": name, "operation": shown, "after": trim(done.abc), "time_map": done.time_map})
    return json.loads(json.dumps({"lyrics": FOLLOW_LYRICS, "before": trim(PLAN), "edits": edits}))


def write_follow_fixture() -> None:
    FOLLOW_FIXTURE.write_text(json.dumps(follow_fixture(), indent=1) + "\n", encoding="utf-8")


def test_the_lyrics_follow_fixture_is_current() -> None:
    assert json.loads(FOLLOW_FIXTURE.read_text(encoding="utf-8")) == follow_fixture(), (
        "regenerate frontend/tests/fixtures/arrange-edits.json: "
        "python -c \"import sys; sys.path[:0] = ['tests/unit', 'tests/support']; import test_score_arrange as t; t.write_follow_fixture()\""
    )
