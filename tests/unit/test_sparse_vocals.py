"""Sparse vocals: a mostly instrumental song whose voice sings only a few short phrases, for YuE2 and MiniMax."""

from __future__ import annotations

from collections.abc import Iterable

import pytest

from plenio.core import lyrics as lyrics_rules
from plenio.core.brief import SPARSE, VOCALS, SongBrief, build_song_brief, parse_template
from plenio.core.diagnostics import Finding
from plenio.core.engines import EngineInfo, minimax, yue2
from plenio.core.sheet import SheetState, evaluate_sheet
from plenio.core.writing import compose, draft_findings, parse_draft

YUE2 = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())
MINIMAX = EngineInfo(minimax.ENGINE_ID, minimax.RULES_VERSION, minimax.capabilities())
CAPTION = """Global Metadata
bpm is 100. key is F, and scale is minor. Downtempo / trip-hop.
A hypnotic, mostly instrumental groove around a few sung hooks; warm, wide, dusty production.

Vocal Details
English lyrics; airy female voice that sings only a short hook now and then.

Arrangement
Dusty drums and a deep bass line carry the instrumental sections; a Rhodes motif answers the voice."""


def sparse_brief(length: str = "standard (about 3:00)") -> SongBrief:
    return build_song_brief(
        {
            "genre": "downtempo",
            "vocals": SPARSE,
            "language": "English",
            "theme": "a night drive",
            "length": length,
        }
    )


def sparse_lyrics(sections: list[str], line: str = "Hold the night") -> str:
    """Lyrics on ``sections`` with one line in every hook."""
    return "\n\n".join(
        f"[{tag}]\n{line}" if tag == lyrics_rules.SPARSE_TAG else f"[{tag}]" for tag in sections
    )


def messages(findings: Iterable[Finding], severity: str) -> list[str]:
    return [f.message for f in findings if f.severity == severity]


def test_the_brief_has_sparse_vocals_between_sung_and_instrumental() -> None:
    assert VOCALS == ("sung", SPARSE, "instrumental")
    brief = sparse_brief()
    assert brief.sparse and not brief.instrumental
    # the vocal settings stay: it is sung, only sparingly
    assert brief.language == "English" and brief.theme == "a night drive"
    assert "Vocals: sparse - mostly instrumental" in brief.to_text()
    assert not build_song_brief({"genre": "pop"}).sparse
    template = parse_template("---\nvocals: sparse vocals\n---\nA slow groove.", "mine/slow")
    assert template.fields["vocals"] == SPARSE


@pytest.mark.parametrize(
    ("seconds", "hooks", "limit"), [(60, 2, 4), (90, 2, 4), (180, 3, 6), (240, 4, 8), (360, 4, 8)]
)
def test_a_few_hooks_and_lines_by_the_length(seconds: float, hooks: int, limit: int) -> None:
    assert lyrics_rules.sparse_hooks(seconds) == hooks and lyrics_rules.sparse_line_limit(seconds) == limit
    for engine in (yue2, minimax):
        form = engine.sparse_sections(seconds)
        assert form[0] == "Intro" and form[-1] == "Outro" and form.count("Hook") == hooks
        assert set(form) <= {"Intro", "Instrumental", "Hook", "Break", "Outro"}
        assert form[1] != "Hook"  # the song starts instrumental
    # as many sections as a sung YuE2 song; as many as a MiniMax instrumental (MiniMax ends short maps early)
    assert len(yue2.sparse_sections(180)) == len(yue2.section_plan(180))
    assert len(minimax.sparse_sections(180)) == len(minimax.instrumental_sections(180))


def test_a_break_before_the_last_hook_when_there_is_room() -> None:
    assert lyrics_rules.sparse_form(8, 3) == [
        "Intro",
        "Instrumental",
        "Hook",
        "Instrumental",
        "Hook",
        "Break",
        "Hook",
        "Outro",
    ]
    assert lyrics_rules.sparse_form(4, 2) == [
        "Intro",
        "Instrumental",
        "Hook",
        "Instrumental",
        "Hook",
        "Outro",
    ]


@pytest.mark.parametrize("engine", [YUE2, MINIMAX], ids=["yue2", "minimax"])
def test_the_writer_gets_the_map_and_writes_only_a_few_lines(engine: EngineInfo) -> None:
    prompt, request = compose(sparse_brief(), engine)
    module = yue2 if engine is YUE2 else minimax
    assert request.sections == tuple(module.sparse_sections(180)) and request.lyrics_mode == "write"
    assert request.sparse_lines == 6 and not request.instrumental
    assert "Words go only into the [Hook] sections" in prompt and "at most 6 sung lines" in prompt
    assert "Sections, in this order" not in prompt  # the lyrics rule names them
    assert "[Hook]\n<one or two short lines>" in prompt
    assert "sung lines in total" not in prompt  # not the line count of a sung song


def test_a_sung_brief_is_written_as_before() -> None:
    # at 50, the prompt of before the slider (from 61 the style may name a 'sparse-to-full contrast')
    prompt, request = compose(
        build_song_brief({"genre": "pop", "language": "English", "creativity": 50}), YUE2
    )
    assert request.sparse_lines == 0 and "sparse" not in prompt.lower()
    assert request.sections == tuple(yue2.section_plan(180))


def test_on_a_score_the_words_go_into_a_few_of_its_sections() -> None:
    prompt, request = compose(
        sparse_brief(), YUE2, score_sections=["[Intro]", "[Verse]", "[Chorus]", "[Outro]"]
    )
    assert request.sections == ("Intro", "Verse", "Chorus", "Outro")
    assert "[Intro] [Verse] [Chorus] [Outro] (they follow the score and must not change)" in prompt
    assert "one to three of these sections" in prompt and "[Hook] sections" not in prompt


def test_creativity_keeps_the_words_few() -> None:
    brief = build_song_brief({"genre": "downtempo", "vocals": SPARSE, "creativity": 90})
    prompt, _request = compose(brief, YUE2)
    assert "The words stay as few as the lyrics rule says." in prompt
    assert "the chorus repeats" not in prompt and "You may add one contrasting section" not in prompt


def test_the_draft_warns_when_it_has_far_more_lines() -> None:
    _prompt, request = compose(sparse_brief(), YUE2)
    few = sparse_lyrics(yue2.sparse_sections(180))
    answer = f"STYLE: English, downtempo, airy voice, 90 BPM\nLYRICS:\n{few}\nTITLES:\n1. Night Road\nARTWORK: A road."
    draft = parse_draft(answer, request)
    assert draft.lyrics.count("Hold the night") == 3
    assert not [f for f in draft_findings(draft, request) if "Sparse vocals" in f["message"]]
    many = "\n".join(["[Intro]", *[f"line number {k}" for k in range(14)], "", "[Outro]"])
    full = parse_draft(answer.replace(few, many), request)
    assert [f for f in draft_findings(full, request) if "Sparse vocals" in f["message"]]


def test_the_song_sheet_checks_the_few_lines_not_a_sung_songs_line_count() -> None:
    form = minimax.sparse_sections(180)
    docs = {
        "title": "Night Road",
        "style": CAPTION,
        "lyrics": sparse_lyrics(form),
        "artwork_prompt": "A road.",
    }
    owned = ["title", "style", "lyrics", "artwork_prompt"]
    sparse = evaluate_sheet(
        SheetState(),
        docs,
        owned,
        rules=minimax,
        engine_id=minimax.ENGINE_ID,
        target_seconds=180.0,
        sparse=True,
    )
    assert not [m for m in messages(sparse.findings, "warning") if "sung lines" in m]
    assert sparse.payload()["sparse"] is True
    # the same lyrics as a sung song: far too few lines
    sung = evaluate_sheet(
        SheetState(), docs, owned, rules=minimax, engine_id=minimax.ENGINE_ID, target_seconds=180.0
    )
    assert [m for m in messages(sung.findings, "warning") if "MiniMax needs roughly" in m]
    crowded = {**docs, "lyrics": "[Hook]\n" + "\n".join(f"line {k}" for k in range(20))}
    findings = minimax.validate_documents(
        crowded, instrumental=False, tokenizer=None, target_seconds=180.0, sparse=True
    ).findings
    assert [m for m in messages(findings, "warning") if m.startswith("Sparse vocals: the lyrics have 20")]
    yue2_findings = yue2.validate_documents(
        crowded, instrumental=False, tokenizer=None, check=("lyrics",), target_seconds=180.0, sparse=True
    ).findings
    assert [m for m in messages(yue2_findings, "warning") if m.startswith("Sparse vocals")]
