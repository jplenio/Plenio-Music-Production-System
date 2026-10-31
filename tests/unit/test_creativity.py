"""Creativity (owner's requests 2026-10-19 and 2026-10-31): one slider, 0 steady ... 25 balanced (1.4's reference)
... 50 experimental (the default, 1.4's 100) ... 100 adventurous. At 25 everything is as it was before the slider, at
50 as 1.4 had it at 100; the ends stay moderate."""

from __future__ import annotations

from dataclasses import replace

import pytest

from plenio.core import creativity as c
from plenio.core.brief import CoverBrief, SongBrief, build_cover_brief, build_song_brief
from plenio.core.engines import EngineInfo
from plenio.core.engines.minimax import ENGINE_ID as MINIMAX_ID
from plenio.core.engines.yue2 import check_style
from plenio.core.errors import PlenioUserError
from plenio.core.writing import compose

REFERENCE = {
    "writer": c.Sampling(0.8, 0.95, 64),
    "arrangement": c.Sampling(0.7, 0.95, 64),
    "plan": c.Sampling(0.7, 0.9, 30),  # YuE2 Generate ABC's defaults
    "take": c.Sampling(1.0, 0.95, 100),  # YuE2 Generate Music's defaults
}
OLD_100 = {  # what 1.4 gave at 100
    "writer": c.Sampling(1.0, 0.95, 64),
    "arrangement": c.Sampling(0.9, 0.95, 64),
    "plan": c.Sampling(0.92, 0.95, 50),
    "take": c.Sampling(1.1, 0.97, 150),
}


@pytest.mark.parametrize("stage", c.STAGES)
def test_25_gives_exactly_the_values_of_before_the_slider(stage: str) -> None:
    assert c.sampling(25, stage) == REFERENCE[stage]
    assert c.sampling(c.REFERENCE, stage) == REFERENCE[stage]


@pytest.mark.parametrize("stage", c.STAGES)
def test_the_default_50_gives_what_1_4_had_at_100(stage: str) -> None:
    assert c.sampling(c.CREATIVITY_DEFAULT, stage) == OLD_100[stage]


@pytest.mark.parametrize("stage", c.STAGES)
def test_the_values_rise_with_the_slider_and_stay_within_their_ends(stage: str) -> None:
    values = [c.sampling(v, stage) for v in range(0, 101, 5)]
    for low, high in zip(values, values[1:], strict=False):
        assert low.temperature <= high.temperature and low.top_p <= high.top_p and low.top_k <= high.top_k
    assert (
        values[0].temperature
        < REFERENCE[stage].temperature
        < OLD_100[stage].temperature
        < values[-1].temperature
    )
    # moderate ends: at most what is reported as the edge of risky, and no greedy decoding at 0
    assert values[-1].temperature <= {"writer": 1.1, "arrangement": 1.0, "plan": 1.0, "take": 1.15}[stage]
    assert values[0].temperature >= 0.5 and values[-1].top_p <= 0.98


def test_the_levels_and_the_slider_values() -> None:
    assert [c.creativity_level(v) for v in (0, 9, 10, 19, 20, 25, 30, 31, 40, 41, 50, 75, 76, 100)] == [
        "steady", "steady", "restrained", "restrained", "balanced", "balanced", "balanced", "varied", "varied",
        "experimental", "experimental", "experimental", "adventurous", "adventurous",
    ]  # fmt: skip
    assert c.creativity_value(None) == c.creativity_value("") == 50
    assert c.creativity_value(140) == 100 and c.creativity_value(-3) == 0 and c.creativity_value("72.4") == 72
    with pytest.raises(PlenioUserError):
        c.creativity_value("wild")
    with pytest.raises(PlenioUserError):
        c.sampling(50, "mix")
    assert c.describe(50) == "50 (experimental, the default)" and c.describe(35) == "35 (varied)"
    assert c.describe(25) == "25 (balanced, 1.4's reference)" and c.describe(90) == "90 (adventurous)"


def test_a_song_of_1_4_is_given_on_todays_scale() -> None:
    assert c.from_before_1_5(100) == 50 and c.from_before_1_5(50) == 25 and c.from_before_1_5(0) == 0
    assert c.scaled_for(80, (1, 4, 1)) == 40 and c.scaled_for(80, None) == 40
    assert c.scaled_for(80, (1, 5, 0)) == 80 and c.scaled_for(80, (2, 0, 0)) == 80


YUE2 = EngineInfo("yue2", "plenio.yue2-rules/1", "YuE2")
MINIMAX = EngineInfo(MINIMAX_ID, "plenio.minimax-rules/1", "MiniMax Music 3")


def song(**changes: object) -> SongBrief:
    return replace(build_song_brief({"genre": "indie pop", "mood": "warm", "language": "English"}), **changes)


def test_the_writer_prompt_is_the_one_before_the_slider_from_20_to_30() -> None:
    reference, _ = compose(song(creativity=25), YUE2)
    for value in (20, 30):
        assert compose(song(creativity=value), YUE2)[0] == reference
    assert "Creativity" not in reference
    default, _ = compose(song(), YUE2)
    assert "- Creativity (50 of 100, experimental)" in default  # the default writes as 1.4's 100


@pytest.mark.parametrize("value", [5, 15, 35, 60, 90])
def test_every_other_level_adds_its_rules(value: int) -> None:
    prompt, _ = compose(song(creativity=value), YUE2)
    level = c.creativity_level(value)
    assert f"- Creativity ({value} of 100, {level})" in prompt
    assert "- Style:" in prompt.split("RULES", 1)[1] and "- Lyrics:" in prompt.split("Creativity", 1)[1]


def test_the_yue2_style_rules_stay_a_descriptor_line() -> None:
    """The varied style for YuE2 is more specific, not longer, and names no section: YuE2 sang style prose."""
    for value in (35, 45, 90):
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
    lines = c.writer_lines(35, engine_id=MINIMAX_ID, instrumental=False, lyrics="write", fixed_sections=False)
    assert any(
        "Arrangement part tell a clear arc" in line and "answering the voice" in line for line in lines
    )
    steady = c.writer_lines(5, engine_id=MINIMAX_ID, instrumental=True, lyrics="none", fixed_sections=False)
    assert any("one steady groove" in line for line in steady)


def test_an_extra_section_only_when_the_sections_are_free() -> None:
    for value in (45, 95):
        free = c.writer_lines(
            value, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False
        )
        fixed = c.writer_lines(
            value, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=True
        )
        assert "[Break]" in " ".join(free) and "[Break]" not in " ".join(fixed)
    varied = c.writer_lines(35, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    assert "[Break]" not in " ".join(varied)


def test_adventurous_goes_further_than_experimental() -> None:
    experimental = " ".join(
        c.writer_lines(60, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    )
    adventurous = " ".join(
        c.writer_lines(90, engine_id="yue2", instrumental=False, lyrics="write", fixed_sections=False)
    )
    assert "Add one unexpected" in experimental and "Add two unexpected" in adventurous
    assert "surprising perspective" in adventurous and "surprising perspective" not in experimental
    caption = " ".join(
        c.writer_lines(90, engine_id=MINIMAX_ID, instrumental=False, lyrics="write", fixed_sections=False)
    )
    assert "Allow two surprising turns" in caption


def test_new_cover_lyrics_keep_their_syllable_counts() -> None:
    lines = c.writer_lines(45, engine_id="yue2", instrumental=False, lyrics="melody", fixed_sections=True)
    lyrics = next(line for line in lines if line.startswith("- Lyrics"))
    assert "syllable counts above still rule" in lyrics and "vary line lengths" not in lyrics
    cover = replace(build_cover_brief({"genre": "jazz", "vocals": "new lyrics"}), creativity=45)
    prompt, _ = compose(cover, YUE2, score_sections=("[Verse]", "[Chorus]"))
    assert "syllable counts above still rule" in prompt


def test_the_creativity_always_counts_in_the_fingerprint() -> None:
    """Since 1.5.0 a brief at 50 writes and samples as 1.4's 100 did: it is not the brief of before, so its
    creativity is part of its fingerprint (the lyrics fidelity still counts only away from standard)."""
    brief = song()
    assert brief.to_dict()["creativity"] == 50
    assert song(creativity=51).fingerprint != brief.fingerprint != song(creativity=25).fingerprint
    cover = build_cover_brief({"genre": "jazz"})
    assert cover.creativity == 50 and replace(cover, creativity=10).fingerprint != cover.fingerprint
    assert isinstance(cover, CoverBrief)


def test_the_brief_takes_the_slider() -> None:
    assert build_song_brief({"genre": "pop", "creativity": 85}).creativity == 85
    assert build_song_brief({"genre": "pop"}).creativity == 50  # an older workflow: the default
    assert build_cover_brief({"genre": "jazz", "creativity": "12"}).creativity == 12


def test_the_minimax_prompt_gets_caption_rules_not_the_descriptor_line() -> None:
    prompt, _ = compose(song(creativity=40), MINIMAX)
    assert "- Caption: let the Arrangement part tell a clear arc" in prompt
    assert "make the line more specific" not in prompt
    yue2_prompt, _ = compose(song(creativity=40), YUE2)
    assert "make the line more specific" in yue2_prompt and "- Caption:" not in yue2_prompt
