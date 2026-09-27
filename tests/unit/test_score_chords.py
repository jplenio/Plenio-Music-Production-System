"""Chord recognition by template matching (Phase 11C D3): best effort, deterministic, reported."""

from __future__ import annotations

from dataclasses import replace

from hypothesis import given, settings
from hypothesis import strategies as st

from plenio.core.score import canonical as c
from plenio.core.score.chords import recognize_chords
from plenio.third_party import yue2_abc_tools as upstream

# C4 = 60; triads and sevenths in root position.
CASES = [
    ((60, 64, 67), "C"),
    ((62, 65, 69), "Dm"),
    ((60, 64, 67, 70), "C7"),
    ((60, 64, 67, 71), "Cmaj7"),
    ((62, 65, 69, 72), "Dm7"),
    ((62, 65, 68), "Ddim"),
    ((60, 64, 68), "Caug"),
    ((59, 62, 65, 69), "Bm7b5"),
    ((62, 65, 68, 71), "Ddim7"),
    ((60, 65, 67), "Csus4"),
    ((62, 64, 69), "Dsus2"),
    ((60, 64, 67, 69), "C6"),
    ((60, 63, 67, 69), "Cm6"),
    ((60, 65, 67, 70), "C7sus4"),
    ((60, 63, 67, 71), "Cm(maj7)"),
]


def notes(onset: int, pitches: tuple[int, ...], duration: int = 4) -> list[tuple[int, int, int]]:
    return [(onset, duration, pitch) for pitch in pitches]


def test_every_supported_quality_is_recognised() -> None:
    for pitches, name in CASES:
        result = recognize_chords(notes(0, pitches), keys=[(0, "C")])
        assert [chord.name for chord in result.chords] == [name], (pitches, name)
        assert (result.skipped, result.merged) == (0, 0)


def test_results_are_supported_chord_symbols() -> None:
    for pitches, _name in CASES:
        for chord in recognize_chords(notes(0, pitches), keys=[(0, "C")]).chords:
            assert upstream.CHORD.fullmatch(chord.name) is not None, chord.name


def test_first_inversion_gets_a_slash_bass() -> None:
    result = recognize_chords(notes(0, (64, 67, 72)), keys=[(0, "C")])
    assert [chord.name for chord in result.chords] == ["C/E"]


def test_spelling_follows_the_key() -> None:
    assert [c.name for c in recognize_chords(notes(0, (58, 62, 65)), keys=[(0, "F")]).chords] == ["Bb"]
    assert [c.name for c in recognize_chords(notes(0, (54, 58, 61)), keys=[(0, "D")]).chords] == ["F#"]
    # the flat preference is in effect until the next key change
    timeline = [(0, "C"), (16, "Eb")]
    two = recognize_chords(notes(0, (60, 64, 67)) + notes(16, (63, 67, 70)), keys=timeline)
    assert [chord.name for chord in two.chords] == ["C", "Eb"]


def test_the_harmony_holds_until_it_changes() -> None:
    result = recognize_chords(notes(0, (60, 64, 67)) + notes(16, (60, 64, 67)) + notes(32, (65, 69, 72)))
    assert [chord.onset for chord in result.chords] == [0, 32]
    assert [chord.name for chord in result.chords] == ["C", "F"]
    assert result.merged == 1


def test_what_does_not_fit_is_counted_not_guessed() -> None:
    result = recognize_chords(
        notes(0, (60, 61, 62)) + notes(16, (64,)) + notes(32, (60, 64, 67)), keys=[(0, "C")]
    )
    assert [chord.onset for chord in result.chords] == [32]
    assert result.skipped == 2


def test_a_dyad_is_read_as_the_closest_triad_and_a_tritone_is_not_read() -> None:
    # E-G (a minor third) reads as E minor, the closest supported triad without its fifth.
    assert [chord.name for chord in recognize_chords(notes(0, (64, 67)), keys=[(0, "C")]).chords] == ["Em"]
    # C-F# is the tritone of C: it reads as Cdim, the triad without its third.
    assert [chord.name for chord in recognize_chords(notes(0, (60, 66)), keys=[(0, "C")]).chords] == ["Cdim"]
    # a chromatic cluster fits no supported chord: it is counted, not guessed.
    assert recognize_chords(notes(0, (60, 61, 62)), keys=[(0, "C")]).chords == ()
    # C-E-G is C major even in A minor, where it is also the III chord.
    assert [chord.name for chord in recognize_chords(notes(0, (60, 64, 67)), keys=[(0, "Am")]).chords] == [
        "C"
    ]


def test_recognised_chords_make_a_valid_score() -> None:
    raw = notes(0, (60, 64, 67)) + notes(16, (58, 62, 65))
    result = recognize_chords(raw, keys=[(0, "F")])
    assert [chord.name for chord in result.chords] == ["C", "Bb"]
    score = c.new_score(measures=2, unit=16, meter=(4, 4), key="F")
    score = replace(
        score,
        vocal=(c.Note(0, 8, 72), c.Note(8, 8, 74)),
        chords=result.chords,
    )
    text = c.to_abc(score)
    assert c.from_abc(text) == score
    assert "C" in text and "Bb" in text


@settings(max_examples=200, deadline=None)
@given(
    st.lists(
        st.tuples(st.integers(0, 8), st.lists(st.integers(0, 127), min_size=1, max_size=6)),
        max_size=6,
    ),
    st.sampled_from(sorted(upstream.KEYS)),
)
def test_anything_is_deterministic_and_valid(onsets: list[tuple[int, list[int]]], key: str) -> None:
    raw = [(onset * 16, 16, pitch) for onset, pitches in onsets for pitch in sorted(set(pitches))]
    first = recognize_chords(raw, keys=[(0, key)])
    assert first == recognize_chords(raw, keys=[(0, key)])
    assert [chord.onset for chord in first.chords] == sorted(chord.onset for chord in first.chords)
    assert len({chord.onset for chord in first.chords}) == len(first.chords)
    for chord in first.chords:
        assert upstream.CHORD.fullmatch(chord.name) is not None, chord.name
