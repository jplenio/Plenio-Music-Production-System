"""MiniMax Music 3 rules: caption, lyrics, exact prompt budget, ceiling, writing and parsing."""

from __future__ import annotations

import pytest

from plenio.core.brief import build_song_brief
from plenio.core.engines import ENGINES, MODULE_INTERFACE, WRITING_RULE_KEYS, EngineInfo, minimax, rules_for
from plenio.core.sheet import SheetState, evaluate_sheet
from plenio.core.writing import compose, draft_findings, parse_draft

CAPTION = """Global Metadata
bpm is 92. key is D, and scale is minor. Indie pop / dream pop.
Hazy verses open into a wide, shimmering chorus; warm, close production with soft stereo width.

Vocal Details
English lyrics; airy female lead in a mid register, soft in the verses, fuller in the chorus.

Arrangement
Jangly guitars and a round bass carry the verses; drums and synth pads join in the chorus; the bridge
drops to guitar and voice before the last chorus."""
INSTRUMENTAL_CAPTION = CAPTION.replace(
    "English lyrics; airy female lead in a mid register, soft in the verses, fuller in the chorus.", "n/a"
).replace(" and voice", "")
LYRICS = "[Verse]\nCity lights are fading slow\nFootsteps keep the time\n\n[Chorus]\nWe run through neon rain"
MAP = "\n\n".join(f"[{t}]" for t in minimax.instrumental_sections(120))


class FakeTokenizer:
    """Counts one token per character of the native prompt (enough for the budget arithmetic)."""

    def prompt_tokens(self, caption: str, lyrics: str) -> int:
        return len(f"<im><cap>{caption}</cap><lyr>[start]\n{lyrics}</lyr></im><audio>")


def messages(findings: object, severity: str) -> list[str]:
    return [f.message for f in findings if f.severity == severity]  # type: ignore[attr-defined]


def test_registered_with_its_facts() -> None:
    assert ENGINES["minimax_music3"] is minimax and rules_for("minimax_music3") is minimax
    caps = minimax.capabilities()
    assert caps["score"] is False and caps["prompt_tokens"] == 5000 and caps["max_seconds"] == 360.0
    assert minimax.MAX_SECONDS == 9000 / 25
    assert "style" in minimax.DOCUMENTS and "score" not in minimax.DOCUMENTS


@pytest.mark.parametrize("engine_id", sorted(ENGINES))
def test_every_engine_module_provides_the_shared_interface(engine_id: str) -> None:
    """The extension point of target-architecture 7.3, checked: shared code calls these names."""
    module = rules_for(engine_id)
    assert [name for name in MODULE_INTERFACE if not hasattr(module, name)] == []
    assert module.ENGINE_ID == engine_id
    for instrumental in (False, True):
        rules = module.writing_rules(instrumental=instrumental, target_seconds=180.0)
        assert [key for key in WRITING_RULE_KEYS if key not in rules] == []


def test_render_ceiling() -> None:
    assert minimax.render_ceiling(None) == minimax.DEFAULT_MAX_SECONDS
    assert minimax.render_ceiling(114.5) == 114.5
    assert minimax.render_ceiling(900) == 360.0
    assert minimax.render_ceiling(3) == minimax.MIN_SECONDS


def test_structured_caption_is_accepted() -> None:
    assert minimax.caption_sections(CAPTION).keys() == {"global metadata", "vocal details", "arrangement"}
    findings = minimax.check_style(CAPTION, instrumental=False)
    assert not messages(findings, "error") and not messages(findings, "warning")


@pytest.mark.parametrize(
    ("caption", "severity", "fragment"),
    [
        ("", "error", "caption is empty"),
        ("dream pop", "warning", "only 2 words"),
        (CAPTION + "\n[Chorus]", "error", "section tags"),
        (CAPTION + "\nX:1", "error", "ABC notation"),
        (CAPTION + " word" * 700, "warning", "about 300 are enough"),
        (CAPTION.replace("Arrangement\n", "Sound\n"), "info", "no Arrangement section"),
        (
            "indie pop with jangly guitars, a round bass, soft drums, synth pads, airy female voice",
            "info",
            "free text",
        ),
        (
            CAPTION.replace(
                "English lyrics; airy female lead in a mid register, soft in the verses, fuller in the chorus.",
                "n/a",
            ),
            "error",
            "say it is instrumental",
        ),
    ],
)
def test_caption_rules(caption: str, severity: str, fragment: str) -> None:
    found = messages(minimax.check_style(caption, instrumental=False), severity)
    assert any(fragment in m for m in found), found


def test_instrumental_caption_rules() -> None:
    assert not messages(minimax.check_style(INSTRUMENTAL_CAPTION, instrumental=True), "error")
    errors = messages(minimax.check_style(CAPTION, instrumental=True), "error")
    assert any("exactly 'n/a'" in e for e in errors)
    warned = messages(
        minimax.check_style(INSTRUMENTAL_CAPTION + "\nA choir hums.", instrumental=True), "warning"
    )
    assert any("mentions vocals" in w for w in warned)
    # instruments named after voice types are not vocals
    assert not messages(
        minimax.check_style(INSTRUMENTAL_CAPTION + "\nTenor sax solo.", instrumental=True), "warning"
    )


def test_enforce_caption() -> None:
    fixed, notes = minimax.enforce_style(CAPTION, instrumental=True)
    assert minimax.caption_sections(fixed)["vocal details"] == "n/a"
    assert notes == ["instrumental: the caption's Vocal Details were set to 'n/a'"]
    assert minimax.caption_sections(fixed)["arrangement"] == minimax.caption_sections(CAPTION)["arrangement"]
    same, notes = minimax.enforce_style(CAPTION + "\n\n\n", instrumental=False)
    assert same == CAPTION and notes == []


def test_lyrics_rules() -> None:
    assert not messages(minimax.check_lyrics(LYRICS, instrumental=False), "error")
    assert not messages(minimax.check_lyrics(MAP, instrumental=True), "warning")
    short = messages(minimax.check_lyrics("[Intro]\n\n[Outro]", instrumental=True), "warning")
    assert any("ends short maps early" in w for w in short)
    vocal_tags = messages(minimax.check_lyrics(MAP + "\n\n[Chorus]", instrumental=True), "warning")
    assert any("invite singing" in w for w in vocal_tags)
    assert messages(minimax.check_lyrics(LYRICS, instrumental=True), "error")  # words in an instrumental


def test_instrumental_map_is_long_enough() -> None:
    for seconds in (60, 90, 180, 300):
        plan = minimax.instrumental_sections(seconds)
        assert plan[0] == "Intro" and plan[-1] == "Outro"
        assert len(plan) >= 2 * len(minimax.section_plan(seconds)) - 4
        assert set(plan) <= set(minimax.INSTRUMENTAL_TAGS)


def test_exact_budget() -> None:
    tokenizer = FakeTokenizer()
    result = minimax.budget(tokenizer, CAPTION, LYRICS)
    assert result.exact and result.prompt_tokens == tokenizer.prompt_tokens(CAPTION, LYRICS)
    assert result.to_dict()["remaining_tokens"] == 5000 - result.prompt_tokens
    estimate = minimax.budget(None, CAPTION, LYRICS)
    assert not estimate.exact and estimate.prompt_tokens > 0


def test_validate_documents_refuses_an_exact_budget_overflow() -> None:
    tokenizer = FakeTokenizer()
    long_lyrics = LYRICS + "\n" + "\n".join("We run through neon rain again" for _ in range(200))
    result = minimax.validate_documents(
        {"style": CAPTION, "lyrics": long_lyrics}, instrumental=False, tokenizer=tokenizer, max_seconds=200
    )
    errors = messages(result.findings, "error")
    assert any("accepts at most 5000" in e and "Shorten" in e for e in errors)
    assert result.budget is not None and result.budget.prompt_tokens > 5000
    # without the tokenizer an (estimated) overflow is only a warning: an estimate never refuses a run
    longer = LYRICS + "\n" + "\n".join("We run through neon rain again" for _ in range(700))
    estimate = minimax.validate_documents(
        {"style": CAPTION, "lyrics": longer}, instrumental=False, tokenizer=None, max_seconds=200
    )
    assert not messages(estimate.findings, "error")
    assert any("estimate" in w for w in messages(estimate.findings, "warning"))


def test_validate_documents_ceiling_and_score() -> None:
    ok = minimax.validate_documents(
        {"style": CAPTION, "lyrics": LYRICS}, instrumental=False, tokenizer=FakeTokenizer(), max_seconds=114.5
    )
    assert not messages(ok.findings, "error") and ok.score_seconds == 114.5 and ok.planning_mode == "full"
    long = minimax.validate_documents(
        {"style": CAPTION, "lyrics": LYRICS}, instrumental=False, tokenizer=None, max_seconds=500
    )
    assert long.score_seconds == 360.0
    assert any("at most 360" in w for w in messages(long.findings, "warning"))
    scored = minimax.validate_documents(
        {"style": CAPTION, "lyrics": LYRICS, "score": "X:1"},
        instrumental=False,
        tokenizer=None,
        check=("style", "lyrics", "score"),
    )
    assert any("takes no score" in e for e in messages(scored.findings, "error"))


def test_lyrics_length_against_the_target() -> None:
    result = minimax.validate_documents(
        {"style": CAPTION, "lyrics": LYRICS}, instrumental=False, tokenizer=None, target_seconds=180
    )
    assert any("needs roughly 36" in w for w in messages(result.findings, "warning"))


def test_song_sheet_uses_the_minimax_rules() -> None:
    evaluation = evaluate_sheet(
        SheetState(),
        {"title": "Neon Rain", "style": CAPTION, "lyrics": LYRICS, "artwork_prompt": "A street."},
        ["title", "style", "lyrics", "artwork_prompt"],
        rules=minimax,
        engine_id=minimax.ENGINE_ID,
        tokenizer=FakeTokenizer(),
        max_seconds=114.5,
    )
    assert not evaluation.has_errors
    assert evaluation.score_seconds == 114.5
    assert evaluation.validation and evaluation.validation["budget"]["exact"] is True


ENGINE = EngineInfo(minimax.ENGINE_ID, minimax.RULES_VERSION, minimax.capabilities())
ANSWER = f"""TITLE: Neon Rain
STYLE:
**Global Metadata**
{CAPTION.split(chr(10), 1)[1]}
LYRICS:
[Verse]
City lights are fading slow
[Chorus]
We run through neon rain
ARTWORK: A rainy street at night, no text.
"""


def test_compose_asks_for_a_structured_caption() -> None:
    brief = build_song_brief({"genre": "dream pop", "language": "English", "length": "short (about 1:30)"})
    prompt, request = compose(brief, ENGINE)
    assert "MiniMax Music 3" in prompt and "Global Metadata" in prompt and "Vocal Details" in prompt
    assert "STYLE:" in prompt.splitlines() and "<the style, on several lines as described>" in prompt
    assert request.sections == tuple(minimax.section_plan(90)) and request.engine_id == "minimax_music3"


def test_compose_instrumental_uses_a_section_map() -> None:
    brief = build_song_brief({"genre": "post-rock", "vocals": "instrumental", "length": "short (about 1:30)"})
    prompt, request = compose(brief, ENGINE)
    assert request.sections == tuple(minimax.instrumental_sections(90)) and request.lyrics_mode == "tags"
    assert "write exactly n/a" in prompt


def test_parse_keeps_the_caption_lines() -> None:
    brief = build_song_brief({"genre": "dream pop"})
    _, request = compose(brief, ENGINE)
    draft = parse_draft(ANSWER, request)
    assert draft.style.splitlines()[0] == "Global Metadata"
    assert minimax.caption_sections(draft.style).keys() == {"global metadata", "vocal details", "arrangement"}
    assert draft.lyrics == "[Verse]\nCity lights are fading slow\n\n[Chorus]\nWe run through neon rain"
    assert not [f for f in draft_findings(draft, request) if f["severity"] == "error"]


def test_parse_instrumental_sets_vocal_details_and_the_map() -> None:
    brief = build_song_brief({"genre": "post-rock", "vocals": "instrumental"})
    _, request = compose(brief, ENGINE)
    draft = parse_draft(ANSWER, request)
    assert minimax.caption_sections(draft.style)["vocal details"] == "n/a"
    assert draft.lyrics == "\n\n".join(f"[{t}]" for t in request.sections)
    assert any("n/a" in note for note in draft.enforcements)
