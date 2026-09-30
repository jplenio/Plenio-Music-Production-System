"""Planner-only section forms of instrumental songs (0.3.1, study E6)."""

from __future__ import annotations

from plenio.core import lyrics as lyrics_rules
from plenio.core.brief import LENGTHS, CoverBrief, SongBrief
from plenio.core.writing import instrumental_plan_form, plan_lyrics


def test_instrumental_songs_plan_with_a_form_that_grows_with_the_length() -> None:
    sizes = []
    for length, seconds in LENGTHS.items():
        form = plan_lyrics("[instrumental]", SongBrief(vocals="instrumental", length=length))
        tags = [t.strip("[]").lower() for t in lyrics_rules.parse_lyrics(form).tags]
        assert form == instrumental_plan_form(seconds)
        assert tags[0] == "intro" and tags[-1] == "outro" and "chorus" in tags
        assert all(
            not line.strip() or line.startswith("[") for line in form.splitlines()
        )  # tags only, no words
        sizes.append(len(tags))
    assert sizes == sorted(sizes) and sizes[0] == 4 and sizes[-1] == 10
    assert "[Bridge]" in instrumental_plan_form(180.0)


def test_other_lyrics_reach_the_planner_unchanged() -> None:
    sung = "[Verse]\nsome words\n"
    assert plan_lyrics(sung, SongBrief(length="about 2:00")) == sung
    assert plan_lyrics(sung, SongBrief(vocals="instrumental")) == sung  # the user's own tags win
    assert plan_lyrics("[instrumental]", SongBrief(length="about 2:00")) == "[instrumental]"  # sung brief
    assert (
        plan_lyrics("[instrumental]", CoverBrief(vocals="instrumental")) == "[instrumental]"
    )  # covers: no plan
    assert plan_lyrics("[instrumental]", None) == "[instrumental]"
