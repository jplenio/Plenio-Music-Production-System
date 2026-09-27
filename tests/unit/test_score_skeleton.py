"""The DAW skeleton (M2/D4): measures from length and tempo, meter and key read from the brief."""

from __future__ import annotations

import pytest

from plenio.core.brief import LENGTHS, SongBrief
from plenio.core.score import canonical as c
from plenio.core.score import skeleton as sk

BASE = {
    "description": "a driving synth pop song",
    "length": "standard (about 3:00)",
    "vocals": "instrumental",
}


def brief(**values: object) -> SongBrief:
    data = {**BASE, **values}
    return SongBrief(**data)  # type: ignore[arg-type]


def test_measures_follow_length_and_tempo() -> None:
    result = sk.from_brief(brief(tempo="120 BPM", meter="4/4"))
    assert result.score.tempo == 120
    assert len(result.score.meters) == 90  # 180 s / (4 quarters at 0.5 s)
    assert all(meter == (4, 4) for meter in result.score.meters)
    assert result.score.total == 90 * 32  # unit 1/32
    assert result.score.sections[0].label == "verse" and result.score.sections[0].measure == 0
    assert result.score.vocal == () and result.score.ins == () and result.score.chords == ()
    assert result.report[0].startswith("new score: 90 measure(s) of 4/4 in C at 120 BPM (3:00")
    assert c.from_abc(result.abc) == result.score


def test_a_waltz_is_longer_per_measure() -> None:
    result = sk.from_brief(brief(tempo="120", meter="3/4"))
    # 3/4 at 120: 1.5 s per measure -> 120 measures for 3:00
    assert len(result.score.meters) == 120
    assert all(meter == (3, 4) for meter in result.score.meters)


def test_defaults_and_notes_when_the_brief_says_little() -> None:
    result = sk.from_brief(brief(length="very short (about 1:00)"))
    assert result.score.tempo == sk.DEFAULT_TEMPO
    assert result.score.key_at(0) == sk.DEFAULT_KEY
    assert len(result.score.meters) == 25  # 60 s / 2.4 s per 4/4 measure at 100 BPM
    text = " | ".join(result.report)
    assert "no tempo in the brief: 100 BPM assumed" in text
    assert "no meter in the brief: 4/4 assumed" in text
    assert "no key in the brief: C assumed" in text


def test_tempo_numbers_are_read_from_free_text() -> None:
    assert sk.parse_tempo("about 128 bpm") == (128, ())
    assert sk.parse_tempo("92,5") == (92, ())
    assert sk.parse_tempo("fast")[0] == sk.DEFAULT_TEMPO
    assert sk.parse_tempo("fast")[1][0].startswith("tempo 'fast' carries no number")
    assert sk.parse_tempo("900") == (300, ("tempo 900 BPM is outside 20-300: 300 BPM used",))
    assert sk.parse_tempo("5") == (20, ("tempo 5 BPM is outside 20-300: 20 BPM used",))


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("4/4", (4, 4)),
        ("3 / 4", (3, 4)),
        ("6/8 shuffle", (6, 8)),
        ("waltz", (4, 4)),
        ("3/5", (4, 4)),  # not a power of two
        ("4/3", (4, 4)),
        ("5/128", (4, 4)),  # not a whole number of 1/32 notes
    ],
)
def test_meter_parsing(text: str, expected: tuple[int, int]) -> None:
    assert sk.parse_meter(text)[0] == expected


def test_meter_notes_only_where_something_was_replaced() -> None:
    assert sk.parse_meter("6/8")[1] == ()
    assert "not a fraction" in sk.parse_meter("waltz")[1][0]
    assert "not supported" in sk.parse_meter("3/5")[1][0]
    assert "whole number of 1/32" in sk.parse_meter("5/128")[1][0]


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("G", "G"),
        ("g major", "G"),
        ("F# minor", "F#m"),
        ("F#m", "F#m"),
        ("Am", "Am"),
        ("a minor", "Am"),
        ("Bb", "Bb"),
        ("b-flat", "Bb"),
        ("H", "C"),  # not a note name at all
        ("", "C"),
        ("G# major", "Ab"),  # enharmonic, reported
        ("D#m", "D#m"),
        ("A#m", "A#m"),
        ("Cmaj", "C"),
    ],
)
def test_key_parsing(text: str, expected: str) -> None:
    assert sk.parse_key(text)[0] == expected


def test_key_notes_explain_enharmonics_and_defaults() -> None:
    assert sk.parse_key("G major")[1] == ()
    assert sk.parse_key("")[1] == ("no key in the brief: C assumed",)
    assert "carries no note name" in sk.parse_key("H")[1][0]
    assert sk.parse_key("G# major")[1][0].endswith("(it sounds the same)")


def test_every_length_option_gives_a_usable_skeleton() -> None:
    for option in LENGTHS:
        result = sk.from_brief(brief(length=option))
        assert c.problems(result.score) == [], option
        assert c.from_abc(result.abc) == result.score
        # the score covers the target (but not much more): whole measures of 4/4 at 100 BPM
        measure_seconds = 4 * 60 / sk.DEFAULT_TEMPO
        covered = len(result.score.meters) * measure_seconds
        assert covered >= LENGTHS[option]
        assert covered - measure_seconds < LENGTHS[option]


def test_the_measure_cap_is_reported() -> None:
    result = sk.from_brief(brief(tempo="300", meter="1/8"))
    assert len(result.score.meters) == sk.MAX_MEASURES
    assert any(f"stops at {sk.MAX_MEASURES}" in line for line in result.report)


def test_the_skeleton_has_no_notes_so_yue2_refuses_it() -> None:
    from plenio.core.engines import yue2

    result = sk.from_brief(brief())
    findings, duration = yue2.check_score(result.abc, instrumental=True)
    assert any("only rests" in finding.message for finding in findings)
    assert duration is not None
