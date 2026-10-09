"""The steps that only improve a song pass their input through when they fail: Match Song Form (every sung
YuE2 song), Apply Arrangement and Fit Lyrics (experimental) - with a warning, never a stopped run."""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest

pytestmark = pytest.mark.comfy

ROOT = Path(__file__).resolve().parents[2]
SCORE = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
BROKEN = "X:1\nnot a score"
LYRICS = "[verse]\nI walk along the river\nThe water knows my name\n\n[chorus]\nHold on, hold on\n"


def node(name: str) -> Any:
    from plenio.comfy import nodes

    return next(n for n in nodes.NODES if n.GET_SCHEMA().node_id == name)


def cover_brief(**extra: Any) -> Any:
    vocals = {
        "vocals": "new lyrics",
        "language": "English",
        "voice": "",
        "theme": "",
        "phrasing_reference": False,
    }
    output = node("PlenioCoverBrief").execute(
        mode="one cover, stop to review",
        template="none",
        description="",
        genre="jazz",
        mood="",
        vocals=vocals,
        harmony="keep original chords",
        title="A cover",
        **extra,
    )
    return output.result[0]


def boom(*_args: Any, **_kwargs: Any) -> Any:
    raise RuntimeError("simulated bug")


def test_a_cover_score_plenio_cannot_edit_stays_with_a_yue2_engine(comfy_path: Path) -> None:
    from plenio.core.engines import yue2

    brief = cover_brief(arrangement="standard", song_flow_closeness=50)
    engine = SimpleNamespace(engine_id=yue2.ENGINE_ID, tokenizer=object())
    apply = node("PlenioApplyArrangement")
    assert apply.check_lazy_status(score=BROKEN, brief=brief) == []  # no writer for such a score
    output = apply.execute(score=BROKEN, brief=brief, seed=0, engine=engine)
    score, report = output.result[0], output.result[1]
    assert score == BROKEN and report.status.value == "warning"
    assert "cannot be edited note by note" in report.summary


def test_apply_arrangement_keeps_the_score_after_an_internal_error(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.core import arrangement

    monkeypatch.setattr(arrangement, "arrange", boom)
    output = node("PlenioApplyArrangement").execute(
        score=SCORE, brief=cover_brief(arrangement="standard", song_flow_closeness=50), seed=0, answer="{}"
    )
    score, report, reask_prompt = output.result[0], output.result[1], output.result[2]
    assert score == SCORE and report.status.value == "warning" and reask_prompt == ""
    assert "internal error (RuntimeError: simulated bug)" in report.summary
    assert report.data["status"] == "fallback"


def test_match_song_form_passes_the_plan_after_an_internal_error(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.core import song_form

    monkeypatch.setattr(song_form, "match", boom)
    match = node("PlenioMatchSongForm")
    assert match.check_lazy_status(score=SCORE, lyrics=LYRICS) == []
    output = match.execute(score=SCORE, lyrics=LYRICS)
    score, report = output.result
    assert score == SCORE and report.status.value == "warning"
    assert "not checked" in report.summary and report.data["category"] == "error"


def test_fit_lyrics_passes_the_lyrics_after_an_internal_error(
    comfy_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    from plenio.core import lyrics_fit

    monkeypatch.setattr(lyrics_fit, "check", boom)
    output = node("PlenioFitLyrics").execute(lyrics=LYRICS, brief=cover_brief(), score=SCORE)
    lyrics, prompt, schema, state, report = output.result
    assert lyrics == LYRICS and prompt == "" and schema == ""
    assert state["asked"] == [] and report.status.value == "warning"
    assert "not checked" in report.summary
