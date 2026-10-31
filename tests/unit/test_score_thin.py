"""A cover's *original notes* (owner's request 2026-10-31): fewer of the source's notes, none new - an instrumental's
melody keeps its line with fewer pitches, a sung melody every note, the instrument line gets rests, the harmony
changes less often."""

from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest

from plenio.core.brief import build_cover_brief
from plenio.core.preparation import prepare_for_brief
from plenio.core.score import canonical, native
from plenio.core.score.thin import _phrases, _sections, kept_share, thin

ROOT = Path(__file__).resolve().parents[2]
SCORE = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")


def test_the_share_runs_from_every_note_to_a_quarter() -> None:
    assert kept_share(100) == 1.0 and kept_share(0) == 0.25 and kept_share(50) == 0.625
    assert kept_share(140) == 1.0 and kept_share(-5) == 0.25


def test_at_100_the_score_stays_as_transcribed() -> None:
    assert thin(SCORE, 100).abc == SCORE and thin(SCORE, 100).changes == ()


@pytest.mark.parametrize("value", [75, 40, 0])
def test_the_melody_keeps_its_line_with_fewer_pitches(value: int) -> None:
    before = canonical.from_abc(SCORE)
    after = canonical.from_abc(thin(SCORE, value).abc)
    original = {note.onset: note for note in before.vocal}
    # nothing new: every note stays where it was, on its pitch
    assert all(n.onset in original and original[n.onset].pitch == n.pitch for n in after.vocal)
    # every phrase keeps its first note and is sung through to its end
    for phrase in _phrases(before, before.vocal):
        kept = [n for n in after.vocal if phrase[0].onset <= n.onset <= phrase[-1].onset]
        assert kept[0].onset == phrase[0].onset and kept[-1].end == phrase[-1].end
    # about the share asked for, per section (the first notes of the phrases stay in any case)
    for start, end in _sections(before):
        total = sum(1 for n in before.vocal if start <= n.onset < end)
        left = sum(1 for n in after.vocal if start <= n.onset < end)
        assert left == max(round(kept_share(value) * total), 1) or left == len(_phrases(before, before.vocal))
    assert len(after.vocal) < len(before.vocal)


def test_the_least_important_notes_go_first() -> None:
    before = canonical.from_abc(SCORE)
    after = canonical.from_abc(thin(SCORE, 0).abc)
    kept = {n.onset for n in after.vocal}
    downbeats = {before.starts[m] for m in range(before.measure_count)}
    # the notes on the downbeats stay before the ones between the beats
    on_downbeats = [n for n in before.vocal if n.onset in downbeats]
    assert sum(n.onset in kept for n in on_downbeats) / len(on_downbeats) > len(after.vocal) / len(
        before.vocal
    )


def test_the_instrument_line_gets_rests_and_the_chords_change_less_often() -> None:
    melody_on_ins = native.move_vocal_to_ins(SCORE).abc
    before = canonical.from_abc(melody_on_ins)
    after = canonical.from_abc(thin(melody_on_ins, 0).abc)
    original = {(n.onset, n.pitch, n.duration) for n in before.ins}
    assert before.ins and all(
        (n.onset, n.pitch, n.duration) in original for n in after.ins
    )  # rests, not longer
    assert len(after.ins) < len(before.ins)
    names = {(c.onset, c.name) for c in before.chords}
    assert all((c.onset, c.name) in names for c in after.chords) and len(after.chords) < len(before.chords)
    assert after.chords[0] == before.chords[0]
    assert all(a.name != b.name for a, b in zip(after.chords, after.chords[1:], strict=False))


def test_a_sung_melody_keeps_every_note_and_the_rest_is_thinned() -> None:
    before = canonical.from_abc(SCORE)
    thinned = thin(SCORE, 0, keep_sung=True)
    after = canonical.from_abc(thinned.abc)
    assert after.vocal == before.vocal  # every syllable keeps its note
    assert len(after.chords) < len(before.chords)
    assert "sung: every note stays" in thinned.changes[0]


def test_a_cover_brief_thins_its_score_when_it_is_prepared() -> None:
    brief = build_cover_brief({"genre": "jazz", "vocals": "original lyrics", "original_notes": 30})
    assert brief.original_notes == 30 and "Original notes: 30" in brief.to_text()
    change = prepare_for_brief(SCORE, replace(brief, harmony="keep"))
    assert any("original notes 30" in c and "sung: every note stays" in c for c in change.changes)
    # a sung cover: the melody as transcribed; the chords fewer
    assert (
        canonical.from_abc(change.abc).vocal
        == canonical.from_abc(
            prepare_for_brief(SCORE, replace(brief, harmony="keep", original_notes=100)).abc
        ).vocal
    )
    assert len(canonical.from_abc(change.abc).chords) < len(canonical.from_abc(SCORE).chords)
    # every note: as before the slider, also the brief's fingerprint
    every = build_cover_brief({"genre": "jazz", "vocals": "original lyrics"})
    assert every.original_notes == 100 and "Original notes" not in every.to_text()
    assert not any("original notes" in c for c in prepare_for_brief(SCORE, every).changes)
    assert replace(every, original_notes=99).fingerprint != every.fingerprint
    data = every.to_dict()
    assert data["original_notes"] == 100
