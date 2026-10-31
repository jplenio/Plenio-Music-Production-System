"""Creativity (owner's requests 2026-10-19 and 2026-10-31): one slider, 0 steady ... 50 the reference ... 100
experimental (the default since 1.5.0) ... 200 adventurous. Up to 100 everything is as in 1.4; at 50 as before the
slider; the ends stay moderate."""

from __future__ import annotations

from dataclasses import replace

import pytest

from plenio.core import creativity as c
from plenio.core.brief import CoverBrief, SongBrief, build_cover_brief, build_song_brief
from plenio.core.engines import EngineInfo
from plenio.core.engines.minimax import ENGINE_ID as MINIMAX_ID
from plenio.core.engines.yue2 import check_style
from plenio.core.errors import PlenioUserError
from plenio.core.hashing import sha256_json
from plenio.core.writing import compose

REFERENCE = {
    "writer": c.Sampling(0.8, 0.95, 64),
    "arrangement": c.Sampling(0.7, 0.95, 64),
    "plan": c.Sampling(0.7, 0.9, 30),  # YuE2 Generate ABC's defaults
    "take": c.Sampling(1.0, 0.95, 100),  # YuE2 Generate Music's defaults
}
AT_100 = {
    # 1.4's experimental top: the default since 1.5.0
    "writer": c.Sampling(1.0, 0.95, 64),
    "arrangement": c.Sampling(0.9, 0.95, 64),
    "plan": c.Sampling(0.92, 0.95, 50),
    "take": c.Sampling(1.1, 0.97, 150),
}


@pytest.mark.parametrize("stage", c.STAGES)
def test_50_gives_exactly_the_values_of_before_and_the_default_those_of_1_4s_100(stage: str) -> None:
    assert c.sampling(50, stage) == REFERENCE[stage]
    assert c.sampling(c.CREATIVITY_DEFAULT, stage) == c.sampling(100, stage) == AT_100[stage]


def test_up_to_100_the_values_are_1_4s() -> None:
    # 1.4's 75: half way between its anchors 50 and 100
    assert c.sampling(75, "plan") == c.Sampling(0.81, 0.925, 40)
    assert c.sampling(75, "take") == c.Sampling(1.05, 0.96, 125)
    assert c.sampling(25, "writer") == c.Sampling(0.7, 0.95, 64)


@pytest.mark.parametrize("stage", c.STAGES)
def test_the_values_rise_with_the_slider_and_stay_within_their_ends(stage: str) -> None:
    values = [c.sampling(v, stage) for v in range(0, 201, 5)]
    for low, high in zip(values, values[1:], strict=False):
        assert low.temperature <= high.temperature and low.top_p <= high.top_p and low.top_k <= high.top_k
    assert (
        values[0].temperature
        < REFERENCE[stage].temperature
        < AT_100[stage].temperature
        < values[-1].temperature
    )
    # moderate ends: at most what is reported as risky, and no greedy decoding at 0
    assert values[-1].temperature <= {"writer": 1.1, "arrangement": 1.0, "plan": 1.0, "take": 1.15}[stage]
    assert values[0].temperature >= 0.5 and values[-1].top_p <= 0.98


def test_the_levels_and_the_slider_values() -> None:
    assert [c.creativity_level(v) for v in (0, 19, 20, 39, 40, 50, 60, 61, 80, 81, 100, 150, 151, 200)] == [
        "steady", "steady", "restrained", "restrained", "balanced", "balanced", "balanced", "varied",
        "varied", "experimental", "experimental", "experimental", "adventurous", "adventurous",
    ]  # fmt: skip
    assert c.creativity_value(None) == c.creativity_value("") == 100
    assert (
        c.creativity_value(240) == 200 and c.creativity_value(-3) == 0 and c.creativity_value("172.4") == 172
    )
    with pytest.raises(PlenioUserError):
        c.creativity_value("wild")
    with pytest.raises(PlenioUserError):
        c.sampling(50, "mix")
    assert c.describe(100) == "100 (experimental, the default)"
    assert c.describe(50) == "50 (balanced, the reference)" and c.describe(75) == "75 (varied)"
    assert c.describe(170) == "170 (adventurous)"


YUE2 = EngineInfo("yue2", "plenio.yue2-rules/1", "YuE2")
MINIMAX = EngineInfo(MINIMAX_ID, "plenio.minimax-rules/1", "MiniMax Music 3")


def song(**changes: object) -> SongBrief:
    return replace(build_song_brief({"genre": "indie pop", "mood": "warm", "language": "English"}), **changes)


def test_the_writer_prompt_is_unchanged_from_40_to_60() -> None:
    reference, _ = compose(song(creativity=50), YUE2)
    for value in (40, 50, 60):
        assert compose(song(creativity=value), YUE2)[0] == reference
    assert "Creativity" not in reference


@pytest.mark.parametrize("value", [10, 30, 70, 90, 100, 130, 180])
def test_every_other_level_adds_its_rules(value: int) -> None:
    prompt, _ = compose(song(creativity=value), YUE2)
    level = c.creativity_level(value)
    assert f"- Creativity ({value} of 100, {level})" in prompt
    assert "- Style:" in prompt.split("RULES", 1)[1] and "- Lyrics:" in prompt.split("Creativity", 1)[1]


def test_the_default_writes_as_1_4_did_at_100() -> None:
    prompt, _ = compose(song(), YUE2)
    assert "- Creativity (100 of 100, experimental)" in prompt
    assert "Add one unexpected but fitting colour" in prompt


def test_adventurous_goes_further() -> None:
    lines = c.writer_lines(180, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    text = " ".join(lines)
    assert "Add two unexpected but fitting colours" in text and "a surprising perspective" in text
    assert "[Break]" in text  # an extra section where the sections are free, as at experimental
    caption = c.writer_lines(
        180, engine_id=MINIMAX_ID, instrumental=False, lyrics="write", fixed_sections=False
    )
    assert any("Allow two surprising turns" in line for line in caption)


def test_the_yue2_style_rules_stay_a_descriptor_line() -> None:
    """The varied style for YuE2 is more specific, not longer, and names no section: YuE2 sang style prose."""
    for value in (70, 90, 180):
        lines = c.writer_lines(
            value, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False
        )
        style = next(line for line in lines if line.startswith("- Style:"))
        assert "about 40 words" in style
        examples = ["dynamic build-ups", "sparse-to-full contrast", "instrumental fills between phrases"]
        assert all(e in style for e in examples)
        style_line = ", ".join(["English", "indie pop", "warm female voice", *examples, "88 BPM"])
        assert [f for f in check_style(style_line, instrumental=False) if f.severity != "info"] == []
    instrumental = c.writer_lines(
        90, engine_id="yue2", instrumental=True, lyrics="none", fixed_sections=False
    )
    assert "vocals" not in " ".join(instrumental) and not any(
        line.startswith("- Lyrics") for line in instrumental
    )


def test_minimax_gets_an_arc_in_its_caption() -> None:
    lines = c.writer_lines(75, engine_id=MINIMAX_ID, instrumental=False, lyrics="write", fixed_sections=False)
    assert any(
        "Arrangement part tell a clear arc" in line and "answering the voice" in line for line in lines
    )
    steady = c.writer_lines(5, engine_id=MINIMAX_ID, instrumental=True, lyrics="none", fixed_sections=False)
    assert any("one steady groove" in line for line in steady)


def test_an_extra_section_only_when_the_sections_are_free() -> None:
    free = c.writer_lines(95, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    fixed = c.writer_lines(95, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=True)
    assert "[Break]" in " ".join(free) and "[Break]" not in " ".join(fixed)
    varied = c.writer_lines(75, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    assert "[Break]" not in " ".join(varied)


def test_new_cover_lyrics_keep_their_syllable_counts() -> None:
    lines = c.writer_lines(85, engine_id="yue2", instrumental=False, lyrics="melody", fixed_sections=True)
    lyrics = next(line for line in lines if line.startswith("- Lyrics"))
    assert "syllable counts above still rule" in lyrics and "vary line lengths" not in lyrics
    cover = replace(build_cover_brief({"genre": "jazz", "vocals": "new lyrics"}), creativity=85)
    prompt, _ = compose(cover, YUE2, score_sections=("[Verse]", "[Chorus]"))
    assert "syllable counts above still rule" in prompt


def test_the_brief_keeps_its_fingerprint_at_50() -> None:
    """A brief at the reference has the fingerprint it had before the slider: drafts and records stay comparable
    (and at the standard lyrics fidelity, before that option); every other value counts as in 1.4."""
    brief = song(creativity=50)
    data = brief.to_dict()
    assert data["creativity"] == 50 and data["fidelity"] == "standard"
    for key in ("from_template", "notes", "creativity", "fidelity"):
        data.pop(key)
    assert brief.fingerprint == sha256_json(data)
    assert song(creativity=51).fingerprint != brief.fingerprint
    assert song().fingerprint != brief.fingerprint  # the default, 100, counts
    cover = build_cover_brief({"genre": "jazz"})
    assert cover.creativity == 100 and replace(cover, creativity=10).fingerprint != cover.fingerprint
    assert isinstance(cover, CoverBrief)


def test_the_brief_takes_the_slider() -> None:
    assert build_song_brief({"genre": "pop", "creativity": 185}).creativity == 185
    assert build_song_brief({"genre": "pop"}).creativity == 100  # without a value: the default
    assert build_cover_brief({"genre": "jazz", "creativity": "12"}).creativity == 12


def test_the_minimax_prompt_gets_caption_rules_not_the_descriptor_line() -> None:
    prompt, _ = compose(song(creativity=80), MINIMAX)
    assert "- Caption: let the Arrangement part tell a clear arc" in prompt
    assert "make the line more specific" not in prompt
    yue2_prompt, _ = compose(song(creativity=80), YUE2)
    assert "make the line more specific" in yue2_prompt and "- Caption:" not in yue2_prompt
