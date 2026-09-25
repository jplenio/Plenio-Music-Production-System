"""Native two-voice ABC: analysis, validation and every operation with its invariants."""

from __future__ import annotations

from pathlib import Path

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from plenio.core import score
from plenio.core.errors import PlenioValidationError
from plenio.third_party import yue2_abc_tools as upstream

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "abc"
SONG = (FIXTURES / "upstream-score.abc").read_text(encoding="utf-8")
JAZZ = (FIXTURES / "upstream-score-jazz.abc").read_text(encoding="utf-8")

HEADER = 'X:1\nT:\nM:4/4\nL:1/32\nQ:1/4=90\nV: Vocal clef=treble name="Vocal Melody" snm="Vocal"\nV: Ins clef=treble name="Ins Melody" snm="Inst."\n'


def build(key: str, groups: list[tuple[str | None, str, str]]) -> str:
    lines = [HEADER + f"K:{key}"]
    for section, vocal, ins in groups:
        if section:
            lines.append(f"% {section}")
        lines += ["V: Vocal", vocal, "V: Ins", ins]
    return "\n".join(lines) + "\n"


# Accidentals propagate by letter across octaves within a bar (native dialect), ties carry pitch.
TRICKY = build(
    "D",
    [
        ("intro", '"D"z32|', "d8f8a16|"),
        ("verse", '"G"^F8f8=F8f8|"A7"A16-A16|', "Z2|"),
        (None, '"Bm"B8_B8B16|"D"d32|', "D8F8A8d8|z32|"),
        ("chorus", '"G"^c16-c16|"D"d32|', "Z2|"),
    ],
)


def test_upstream_fixture_analysis() -> None:
    analysis = score.analyze(SONG)
    assert analysis.ok and analysis.has_chords
    assert analysis.header == {"meter": "4/4", "unit": "1/16", "tempo_bpm": 88, "key": "C"}
    assert [(s.label, s.start_bar, s.bars) for s in analysis.sections] == [("verse", 1, 4), ("chorus", 5, 4)]
    assert analysis.duration_s == pytest.approx(8 * 4 * 60 / 88)
    assert analysis.bars[4].chords == ("C",)
    assert score.section_tags(SONG) == "[Verse]\n\n[Chorus]"


def test_tricky_fixture_is_valid_and_sections_continue_without_comment() -> None:
    analysis = score.analyze(TRICKY)
    assert analysis.ok, analysis.diagnostics
    assert [(s.label, s.bars) for s in analysis.sections] == [("intro", 1), ("verse", 4), ("chorus", 2)]


@pytest.mark.parametrize(
    ("text", "fragment"),
    [
        ("", "empty"),
        ("X:1\nT:\n", "Incomplete"),
        (SONG.replace("E2G2A2G2E2D2C4|", "E2G2A2G2E2D2C2|", 1), "meter duration"),
        (SONG.replace('"G"', '"Gmaj9"', 1), "unsupported chord"),
    ],
)
def test_invalid_scores_are_reported_not_raised(text: str, fragment: str) -> None:
    analysis = score.analyze(text)
    assert not analysis.ok
    assert fragment in analysis.errors[0].message
    with pytest.raises(PlenioValidationError):
        score.validate(text)


def test_section_tag_names() -> None:
    assert score.section_tag("pre-chorus") == "[Pre-Chorus]"
    assert score.section_tag("verse 2") == "[Verse 2]"


def notes(text: str, voice: str) -> list[list[object]]:
    return upstream.parse_abc(text).voices[voice].notes


def test_strip_chords_keeps_every_note() -> None:
    change = score.strip_chords(SONG)
    assert not score.has_chords(change.abc)
    assert notes(change.abc, "Vocal") == notes(SONG, "Vocal")
    assert change.changes == ("8 chord symbols removed",)


def test_silence_vocal_keeps_chords_and_ins() -> None:
    change = score.silence_voice(TRICKY, "Vocal")
    parsed = upstream.parse_abc(change.abc)
    assert parsed.voices["Vocal"].notes == []
    assert parsed.voices["Vocal"].chords == upstream.parse_abc(TRICKY).voices["Vocal"].chords
    assert parsed.voices["Ins"].notes == notes(TRICKY, "Ins")
    assert '"G"z32|' in change.abc  # rests merged, chord kept at its onset


def test_silence_rejects_unknown_voice() -> None:
    with pytest.raises(PlenioValidationError):
        score.silence_voice(SONG, "Bass")


def test_move_vocal_to_ins_replace_keeps_the_complete_melody() -> None:
    change = score.move_vocal_to_ins(TRICKY)
    parsed = upstream.parse_abc(change.abc)
    assert parsed.voices["Vocal"].notes == []
    moved = {tuple(n) for n in parsed.voices["Ins"].notes}
    assert {tuple(n) for n in notes(TRICKY, "Vocal")} <= moved
    assert any("replaced" in w for w in change.warnings)  # bar 5 had an Ins part


def test_move_vocal_to_ins_keep_ins_drops_conflicting_vocal_bars() -> None:
    change = score.move_vocal_to_ins(TRICKY, conflict="keep_ins")
    parsed = upstream.parse_abc(change.abc)
    assert parsed.voices["Vocal"].notes == []
    ins = notes(TRICKY, "Ins")
    assert all(n in parsed.voices["Ins"].notes for n in ins)
    assert any("dropped" in w for w in change.warnings)


def test_move_vocal_to_ins_upstream_fixture() -> None:
    change = score.move_vocal_to_ins(SONG)
    assert notes(change.abc, "Ins") == notes(SONG, "Vocal")
    assert change.changes == ("vocal melody moved to Ins in 8 bars",)


@pytest.mark.parametrize("semitones", [-12, -7, -3, -1, 1, 2, 5, 6, 7, 11, 12])
@pytest.mark.parametrize("text", [SONG, JAZZ, TRICKY], ids=["song", "jazz", "tricky"])
def test_transpose_moves_every_pitch_and_keeps_rhythm(text: str, semitones: int) -> None:
    change = score.transpose(text, semitones)
    for voice in ("Vocal", "Ins"):
        assert notes(change.abc, voice) == [[t, p + semitones, d] for t, p, d in notes(text, voice)]
    assert len(upstream.parse_abc(change.abc).voices["Vocal"].chords) == len(
        upstream.parse_abc(text).voices["Vocal"].chords
    )


def test_transpose_spells_chords_and_keys_in_the_new_key() -> None:
    change = score.transpose(SONG, 1)
    assert change.abc.splitlines()[7] == "K:Db"
    assert '"Ab"' in change.abc and '"Bbm"' in change.abc
    back = score.transpose(change.abc, -1)
    assert notes(back.abc, "Vocal") == notes(SONG, "Vocal")


def test_transpose_limits() -> None:
    assert score.transpose(SONG, 0).abc == SONG
    with pytest.raises(PlenioValidationError):
        score.transpose(SONG, 30)


@settings(max_examples=30, deadline=None)
@given(st.integers(min_value=-12, max_value=12), st.integers(min_value=-12, max_value=12))
def test_transpose_composes(first: int, second: int) -> None:
    once = score.transpose(score.transpose(TRICKY, first).abc, second)
    assert notes(once.abc, "Vocal") == [[t, p + first + second, d] for t, p, d in notes(TRICKY, "Vocal")]


def test_set_tempo() -> None:
    change = score.set_tempo(SONG, 120)
    assert upstream.parse_abc(change.abc).bpm == 120
    assert notes(change.abc, "Vocal") == notes(SONG, "Vocal")
    with pytest.raises(PlenioValidationError):
        score.set_tempo(SONG, 5)


def test_prepare_from_brief() -> None:
    assert score.prepare(SONG, instrumental=False).abc == SONG
    lead = score.prepare(SONG, instrumental=True, melody="lead")
    assert notes(lead.abc, "Vocal") == [] and notes(lead.abc, "Ins") == notes(SONG, "Vocal")
    accompaniment = score.prepare(SONG, instrumental=True, melody="accompaniment")
    assert notes(accompaniment.abc, "Vocal") == [] and notes(accompaniment.abc, "Ins") == []
    with pytest.raises(PlenioValidationError):
        score.prepare(SONG, instrumental=True, melody="choir")


def test_analysis_serialises() -> None:
    data = score.analyze(TRICKY).to_dict()
    assert data["dialect"] == "yue2-native"
    assert data["sections"][1]["tag"] == "[Verse]"
    assert data["bars"][0]["start_s"] == 0.0
