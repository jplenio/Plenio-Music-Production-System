"""Lyrics, briefs and templates, YuE2 rules and budgets, writing prompts and draft parsing."""

from __future__ import annotations

from pathlib import Path

import pytest

from plenio.core import lyrics, writing
from plenio.core.brief import (
    COVER_MODES,
    LENGTHS,
    SONG_MODES,
    TemplateLibrary,
    build_cover_brief,
    build_song_brief,
    parse_template,
    resolve_length,
    resolve_mode,
)
from plenio.core.engines import EngineInfo, rules_for, yue2
from plenio.core.errors import PlenioModelError, PlenioUserError, PlenioValidationError
from plenio.core.writing import SERIES_ANGLES, compose, parse_draft

ROOT = Path(__file__).resolve().parents[2]
SONG = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
LYRICS = "[Verse]\nNeon fades along the lane\nFootsteps keep the time of rain\n\n[Chorus]\nLet the day come into view"
STYLE = "English, warm piano pop, expressive female voice, acoustic piano, light drums, 88 BPM"


class FakeTokenizer:
    """One token per character plus fixed overheads (enough for budget arithmetic)."""

    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        return 2 + len(f"{mode}\n[Tags]\n{style}\n[Lyrics]\n{lyrics}\n")

    def abc_tokens(self, abc: str) -> int:
        return len(abc)


def severities(findings: list[object], severity: str) -> list[str]:
    return [f.message for f in findings if f.severity == severity]  # type: ignore[attr-defined]


# --- lyrics --------------------------------------------------------------------------


def test_parse_and_format_lyrics() -> None:
    parsed = lyrics.parse_lyrics("\n[Verse]\n  line one \n\n\nline two\n[Chorus]\nhook\n")
    assert parsed.tags == ["Verse", "Chorus"]
    assert parsed.format() == "[Verse]\nline one\nline two\n\n[Chorus]\nhook"
    assert parsed.words == 5 and not parsed.is_tags_only


def test_lyrics_rules() -> None:
    assert severities(lyrics.check_lyrics("", instrumental=False), "error")
    assert severities(lyrics.check_lyrics("no tags at all", instrumental=False), "error")
    warnings = severities(
        lyrics.check_lyrics("[Verse]\nhello (x2)\n(guitar solo)", instrumental=False), "warning"
    )
    assert any("Repeat" in w for w in warnings) and any("Stage direction" in w for w in warnings)
    assert severities(lyrics.check_lyrics(LYRICS, instrumental=True), "error")  # words in an instrumental
    assert not severities(lyrics.check_lyrics("[Intro]\n\n[Verse]", instrumental=True), "error")


def test_compare_sections() -> None:
    assert lyrics.compare_sections(LYRICS, ["[Verse]", "[Chorus]"]) == []
    assert lyrics.compare_sections(LYRICS, ["[Chorus]", "[Verse]"])


def test_syllable_estimate_is_rough_but_stable() -> None:
    assert lyrics.estimate_syllables("Neon fades along the lane") in range(5, 9)


# --- brief and templates -------------------------------------------------------------


def test_every_shipped_template_loads_and_builds_a_brief() -> None:
    library = TemplateLibrary(ROOT / "resources" / "templates")
    ids = library.ids()
    assert len(ids) == 250
    for template_id in ids:
        template = library.get(template_id)
        brief = build_song_brief(
            {
                "vocals": template.fields.get("vocals", "sung"),
                "length": template.fields.get("length", "standard (about 3:00)"),
            },
            template,
        )
        assert brief.description
        if brief.instrumental:
            # Instrumental templates must not ask for vocal sounds (vocal words make vocals likely).
            assert not yue2._VOCAL_TERMS.search(template.fields["description"]), template_id


def test_template_fills_only_empty_fields() -> None:
    template = parse_template("---\nname: T\ngenre: jazz\nmood: calm\n---\nA calm jazz tune.", "jazz/t")
    brief = build_song_brief({"genre": "bebop", "vocals": "sung", "length": "short (about 1:30)"}, template)
    assert (brief.genre, brief.mood, brief.description) == ("bebop", "calm", "A calm jazz tune.")
    assert set(brief.from_template) == {"mood", "description"}
    assert brief.target_seconds == 90 and brief.max_seconds == pytest.approx(113.5)


@pytest.mark.parametrize(
    "values",
    [
        {},
        {"genre": "pop", "length": "epic"},
        {"genre": "pop", "vocals": "rap"},
        {"genre": "pop", "melody": "choir"},
    ],
)
def test_invalid_briefs(values: dict[str, str]) -> None:
    with pytest.raises(PlenioUserError):
        build_song_brief(values)


def test_brief_fingerprint_ignores_provenance() -> None:
    a = build_song_brief({"genre": "pop"})
    b = build_song_brief({"genre": "pop"})
    assert a.fingerprint == b.fingerprint
    assert build_song_brief({"genre": "rock"}).fingerprint != a.fingerprint
    assert set(LENGTHS) >= {a.length}


def test_user_templates_are_saved_and_listed(tmp_path: Path) -> None:
    library = TemplateLibrary(ROOT / "resources" / "templates", tmp_path)
    saved = library.save_user_template(
        "My Night Song", {"genre": "ambient", "unknown": "x", "vocals": "instrumental"}
    )
    assert saved.id == "user/my-night-song"
    assert library.get("user/my-night-song").fields == {"genre": "ambient", "vocals": "instrumental"}
    with pytest.raises(PlenioUserError):
        library.save_user_template("!!!", {})


def test_a_broken_user_template_is_skipped_not_fatal(tmp_path: Path) -> None:
    """Audit AUD-01: one hand-edited user file made the whole Plenio import fail."""
    (tmp_path / "broken.md").write_text("---\nname: Broken\nno colon here\n---\nbody\n", encoding="utf-8")
    (tmp_path / "odd.md").write_text("---\nbpm: 90\n---\n", encoding="utf-8")
    (tmp_path / "good.md").write_text("---\nname: Good\ngenre: folk\n---\nA song.\n", encoding="utf-8")
    library = TemplateLibrary(ROOT / "resources" / "templates", tmp_path)
    assert library.get("user/good").fields["genre"] == "folk"
    assert "user/broken" not in library.templates() and "user/odd" not in library.templates()
    assert set(library.problems) == {"user/broken", "user/odd"}
    assert "malformed front matter line" in library.problems["user/broken"]


def test_saving_multi_line_values_writes_a_readable_template(tmp_path: Path) -> None:
    """Audit AUD-01: a value with a line break produced a file that broke the library."""
    library = TemplateLibrary(ROOT / "resources" / "templates", tmp_path)
    saved = library.save_user_template(
        "Two\nLines", {"genre": "indie\npop", "mood": "warm\r\nsoft", "description": "Line one.\nLine two."}
    )
    fresh = TemplateLibrary(ROOT / "resources" / "templates", tmp_path)
    assert fresh.problems == {}
    assert fresh.get(saved.id).fields == {
        "genre": "indie pop",
        "mood": "warm soft",
        "description": "Line one.\nLine two.",
    }
    assert fresh.get(saved.id).name == "Two Lines"


# --- YuE2 rules ------------------------------------------------------------------------


def test_style_rules() -> None:
    assert not severities(yue2.check_style(STYLE, instrumental=False), "error")
    too_long = ", ".join(["word"] * 130)
    assert severities(yue2.check_style(too_long, instrumental=False), "error")
    assert severities(yue2.check_style(STYLE + ", 3:30 minutes", instrumental=False), "error")
    assert severities(yue2.check_style("[Verse] pop", instrumental=False), "error")
    assert severities(yue2.check_style("pop, no drums", instrumental=False), "warning")
    errors = severities(yue2.check_style(STYLE, instrumental=True), "error")
    assert any("vocals" in e for e in errors) and any("language" in e for e in errors)


def test_a_style_names_a_length_only_with_a_number() -> None:
    """'warm driving second half' stopped half of the owner's cover series (2026-10-23)."""
    for style in ("dance pop, warm driving second half, 120 BPM", "trance, a second drop, 80s pads"):
        assert not severities(yue2.check_style(style, instrumental=False), "error"), style
    for timing in ("3 minutes long", "a 30-second intro", "two minutes", "2:45", "target length 3 min"):
        assert severities(yue2.check_style(f"pop, {timing}", instrumental=False), "error"), timing


def test_enforce_style_fixes_what_check_style_calls_an_error() -> None:
    style, notes = yue2.enforce_style(f"{STYLE}, about 3 minutes, [Verse] build", instrumental=False)
    assert style == f"{STYLE}, build" and len(notes) == 2
    assert not severities(yue2.check_style(style, instrumental=False), "error")
    score = f"{STYLE}\nX:1\nL:1/8\nK:C\n|CDEF GABc|"
    style, notes = yue2.enforce_style(score, instrumental=False)
    assert style == STYLE and "ABC" in notes[0]
    style, notes = yue2.enforce_style(", ".join(["warm pads"] * 70), instrumental=False)
    assert len(style.split()) == 120 and notes
    style, _ = yue2.enforce_style(" ".join(["warm"] * 130), instrumental=False)
    assert len(style.split()) == 120


def test_style_length_is_a_hint_up_to_120_words() -> None:
    # GitHub issue #3: "errored at the 40 token limit" - 40 words is the target, never an error
    eighty = ", ".join(["warm"] * 80)
    findings = yue2.check_style(eighty, instrumental=False)
    assert not severities(findings, "error")
    assert any("not a limit" in w and "120" in w for w in severities(findings, "warning"))
    assert not severities(yue2.check_style(", ".join(["warm"] * 60), instrumental=False), "warning")
    assert any(
        "at most 120" in e
        for e in severities(yue2.check_style(", ".join(["warm"] * 121), instrumental=False), "error")
    )


def test_voice_types_count_as_vocal_character_but_their_instruments_do_not() -> None:
    sung = "English, acoustic folk, warm male baritone, fingerpicked guitar, 121 BPM"
    assert not severities(yue2.check_style(sung, instrumental=False), "info")  # the Phase 4B false info
    assert severities(yue2.check_style("jazz, breathy mezzo-soprano, brushes", instrumental=True), "error")
    for instrument in ("tenor sax", "tenor-sax", "baritone guitar", "alto flute", "soprano saxophone"):
        style = f"cool jazz, {instrument} lead, upright bass, brushes"
        assert not severities(yue2.check_style(style, instrumental=True), "error"), instrument


def test_enforce_style_for_instrumentals() -> None:
    style, notes = yue2.enforce_style("English, lo-fi hip hop, female vocals, dusty drums", instrumental=True)
    assert style == "lo-fi hip hop, dusty drums" and notes
    assert yue2.enforce_style(STYLE, instrumental=False) == (STYLE, [])


def test_planning_mode_and_ceiling() -> None:
    assert yue2.planning_mode(SONG) == "full"
    assert yue2.planning_mode(yue2.score_rules.strip_chords(SONG).abc) == "melody"
    assert yue2.planning_mode("") == "full"
    assert yue2.render_ceiling(100) == pytest.approx(125.0)
    assert yue2.render_ceiling(5) == 30.0 and yue2.render_ceiling(2000) == 900.0


def test_exact_budget_arithmetic() -> None:
    budget = yue2.budget(FakeTokenizer(), STYLE, LYRICS, SONG)
    expected_prefix = 2 + len(f"full\n[Tags]\n{STYLE}\n[Lyrics]\n{LYRICS}\n")
    assert budget.prefix_tokens == expected_prefix
    assert budget.music_tokens == 24576 - expected_prefix - len(SONG) - 2
    off = yue2.budget(FakeTokenizer(), STYLE, LYRICS, "")
    assert off.abc_tokens == 0 and off.music_tokens > budget.music_tokens


class HugeTokenizer(FakeTokenizer):
    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        return 24000


def test_validate_documents() -> None:
    ok = yue2.validate_documents(
        {"style": STYLE, "lyrics": LYRICS, "score": SONG}, instrumental=False, tokenizer=FakeTokenizer()
    )
    assert not severities(list(ok.findings), "error")
    assert ok.planning_mode == "full" and ok.score_seconds == pytest.approx(
        yue2.render_ceiling(8 * 4 * 60 / 88)
    )
    full = yue2.validate_documents(
        {"style": STYLE, "lyrics": LYRICS, "score": SONG}, instrumental=False, tokenizer=HugeTokenizer()
    )
    assert any("only" in e for e in severities(list(full.findings), "error"))
    instrumental = yue2.validate_documents(
        {"style": "ambient, piano", "lyrics": "[Verse]\n\n[Chorus]", "score": SONG},
        instrumental=True,
        tokenizer=None,
    )
    assert any("silent Vocal" in e for e in severities(list(instrumental.findings), "error"))
    no_score = yue2.validate_documents(
        {"style": STYLE, "lyrics": LYRICS},
        instrumental=False,
        tokenizer=None,
        max_seconds=120.0,
        check=("style", "lyrics"),
    )
    assert no_score.score_seconds == 120.0


def test_unknown_engine() -> None:
    with pytest.raises(PlenioModelError):
        rules_for("musicgen")


# --- writing ---------------------------------------------------------------------------

ENGINE = EngineInfo("yue2", yue2.RULES_VERSION, yue2.capabilities())
ANSWER = """<think>planning</think>
### TITLE
"Neon Rain"
### STYLE
English, dreamy indie pop, airy female voice,
jangly guitars, 104 BPM.
### LYRICS
**[Verse]**
City lights are fading slow
Chorus:
We run through neon rain (x2)
### ARTWORK
A rainy street at night.
"""


def test_compose_contains_brief_rules_and_sections() -> None:
    brief = build_song_brief(
        {"genre": "indie pop", "vocals": "sung", "language": "English", "length": "short (about 1:30)"}
    )
    prompt, request = compose(brief, ENGINE)
    assert "YuE2" in prompt and "Genre: indie pop" in prompt and "LYRICS:" in prompt.splitlines()
    assert request.sections == tuple(yue2.section_plan(90))
    _, fixed = compose(brief, ENGINE, score_sections=["[Verse]", "[Chorus]"], fixed_title="Given")
    assert fixed.sections == ("Verse", "Chorus") and fixed.fixed_title == "Given"


def test_parse_draft_enforces_and_reports() -> None:
    brief = build_song_brief({"genre": "indie pop"})
    _, request = compose(brief, ENGINE)
    draft = parse_draft(ANSWER, request)
    assert draft.title == "Neon Rain"
    assert draft.style == "English, dreamy indie pop, airy female voice, jangly guitars, 104 BPM"
    assert (
        draft.lyrics
        == "[Verse]\nCity lights are fading slow\n\n[Chorus]\nWe run through neon rain\nWe run through neon rain"
    )
    assert len(draft.enforcements) == 4


def test_parse_draft_instrumental_is_tags_only() -> None:
    brief = build_song_brief({"genre": "post-rock", "vocals": "instrumental"})
    _, request = compose(brief, ENGINE)
    draft = parse_draft(ANSWER, request)
    assert draft.lyrics == "[instrumental]"  # Phase 4A: the bare tag, whatever the model wrote
    assert any("[instrumental]" in note for note in draft.enforcements)
    assert "voice" not in draft.style and "English" not in draft.style


def test_parse_draft_without_blocks_is_actionable() -> None:
    _, request = compose(build_song_brief({"genre": "pop"}), ENGINE)
    with pytest.raises(PlenioValidationError) as error:
        parse_draft("Sure! Here is a great song about love.", request)
    assert "### STYLE" in str(error.value)


def test_parse_draft_without_labels_and_without_lyrics() -> None:
    """A cover keeping its original lyrics: Qwen3.8 27B answered without any heading (2026-10-23)."""
    answer = (
        "Lay All Your Love On Me-cover\nEnglish, progressive trance, ethereal female vocal, rolling synth bass, "
        "133 BPM\nnone\nA square abstract cover featuring a serene, moonlit ocean surface, with no text."
    )
    brief = build_song_brief({"genre": "trance", "vocals": "instrumental"})
    _, request = compose(brief, ENGINE)
    draft = parse_draft(answer, request)
    assert draft.title == "Lay All Your Love On Me-cover"
    assert draft.style.startswith("progressive trance") and draft.artwork_prompt.startswith("A square")


FIXTURES = ROOT / "tests" / "fixtures" / "llm"


@pytest.mark.parametrize(
    ("name", "title", "inferred"),
    [
        ("gemma4-labels.txt", "Words We Never Spoke", False),
        ("gemma4-no-labels.txt", "Ghost Conversations In The Quiet", True),
        ("gemma4-marker-content.txt", "Unsaid Words Hang Still", True),
    ],
)
def test_real_writer_answers_are_parsed(name: str, title: str, inferred: bool) -> None:
    """Answer layouts observed from Gemma 4 E4B through TextGenerate (Phase 3 probe)."""
    _, request = compose(build_song_brief({"genre": "folk"}), ENGINE)
    draft = parse_draft((FIXTURES / name).read_text(encoding="utf-8"), request)
    assert draft.title == title
    assert draft.style.startswith(("singer-songwriter folk", "Singer-songwriter folk"))
    assert "###" not in draft.style and "###" not in draft.lyrics
    assert draft.lyrics.startswith("[Intro]") and draft.lyrics.rstrip().endswith(
        ("now", "Still lingering now")
    )
    assert draft.artwork_prompt.startswith("A single")
    assert any("inferred" in note for note in draft.enforcements) == inferred
    if name == "gemma4-labels.txt":
        assert "Style is everything they told me" in draft.lyrics  # not taken for a STYLE label


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("2-3 minutes", "about 2:30"),  # the predecessor toolkit's length options
        ("30 seconds", "very short (about 1:00)"),
        ("4-5 minutes", "long (about 4:30)"),
        ("3:20", "about 3:30"),
        ("90 s", "short (about 1:30)"),
        ("10 minutes", "very long (about 6:00)"),
    ],
)
def test_a_free_form_length_takes_the_nearest_option(value: str, expected: str) -> None:
    """A length from other parameters (for example the toolkit's '2-3 minutes', reused in App mode)
    stopped the whole run at validation; it now takes the nearest option, with a note."""
    length, note = resolve_length(value)
    assert length == expected and note and value in note
    assert resolve_length("long (about 4:30)") == ("long (about 4:30)", None)
    assert build_song_brief({"genre": "pop", "length": value}).length == expected
    with pytest.raises(PlenioUserError, match="Unknown length"):
        resolve_length("quick")


def test_every_length_reaches_the_writer_and_the_render_headroom() -> None:
    """0.2.2: ten lengths from 1:00 to 6:00 instead of three; each one changes the plan it asks for."""
    from plenio.core.engines import minimax

    assert list(LENGTHS.values()) == sorted(LENGTHS.values()) and len(LENGTHS) == 10
    assert {"short (about 1:30)", "standard (about 3:00)", "long (about 4:30)"} <= set(LENGTHS)  # templates
    lines = []
    for length, seconds in LENGTHS.items():
        brief = build_song_brief({"genre": "pop", "length": length})
        assert brief.target_seconds == seconds and brief.max_seconds > seconds
        lines.append(yue2.lyric_lines(seconds))
        assert minimax.render_ceiling(brief.max_seconds) <= minimax.MAX_SECONDS
    assert lines == sorted(lines) and lines[0] < lines[-1]


# --- 0.2.2: work mode --------------------------------------------------------------------------


def test_work_modes() -> None:
    assert set(SONG_MODES.values()) == set(COVER_MODES.values()) == {"batch", "careful"}
    assert (
        resolve_mode("new song every run") == "batch"
        and resolve_mode("one cover, stop to review") == "careful"
    )
    assert resolve_mode("") == "careful" and resolve_mode("batch") == "batch"
    with pytest.raises(PlenioUserError, match="Unknown mode"):
        resolve_mode("sometimes")
    careful = build_song_brief({"genre": "pop"}, mode="one song, stop to review", variation=7)
    assert careful.mode == "careful" and careful.variation is None  # careful: always the same brief
    assert build_song_brief({"genre": "pop"}) == careful  # the default of older callers
    batch = build_song_brief({"genre": "pop"}, mode="new song every run", variation=7)
    assert batch.mode == "batch" and batch.variation == 7 and batch.fingerprint != careful.fingerprint
    assert batch.to_dict()["mode"] == "batch"  # recorded in the release record
    cover = build_cover_brief({"genre": "folk"}, mode="new cover every run", variation=3)
    assert (cover.mode, cover.variation) == ("batch", 3)


def test_a_series_asks_the_writer_for_a_different_song_each_run() -> None:
    values = {"genre": "indie pop", "vocals": "sung", "language": "English"}
    careful, _ = compose(build_song_brief(values), ENGINE)
    assert "Series" not in careful and "Angle" not in careful
    prompts = [compose(build_song_brief(values, mode="batch", variation=v), ENGINE)[0] for v in (1, 2)]
    assert all("variation" in p and "Series" in p for p in prompts)
    assert prompts[0] != prompts[1] and SERIES_ANGLES[1] in prompts[0] and SERIES_ANGLES[2] in prompts[1]
    instrumental = build_song_brief({"genre": "ambient", "vocals": "instrumental"}, mode="batch", variation=1)
    prompt, _ = compose(instrumental, ENGINE)
    assert "Series" in prompt and "Angle" not in prompt  # no story for an instrumental


def test_a_section_the_writer_filled_with_what_the_band_plays_is_played_not_sung() -> None:
    """Owner's report 2026-10-30: a metal song's bridge told the band what to play, without brackets, and the music
    model sang it. Such a section keeps its tag and loses its lines; one such line among sung ones stays."""
    assert lyrics.playing_direction("Violin tremolo over a pounding snare")
    assert lyrics.playing_direction("Guitar tapping, harmonized octaves")
    assert lyrics.playing_direction("Hold it long on the guitar, no words, just sound")
    for sung in (
        "No words left, only the rain",  # no words alone is a lyric
        "I play my guitar solo all night",  # a person plays
        "Drums fill the sky with thunder",  # fill: common in lyrics
        "Flames climb higher than the moon",
    ):
        assert not lyrics.playing_direction(sung), sung
    text = (
        "[Verse]\nWe ride the storm tonight\nSynth arpeggios rise into the night\n\n"
        "[Bridge]\nViolin tremolo over a pounding snare\nGuitar tapping, harmonized octaves\n"
        "Hold it long on the guitar, no words, just sound\nFlames climb higher than the moon\n\n"
        "[Chorus]\nWe are fire"
    )
    kept, removed = lyrics.without_playing_directions(text.split("\n"))
    assert len(removed) == 4 and "Flames climb higher than the moon" in removed
    assert "Synth arpeggios rise into the night" in kept  # alone among sung lines: kept
    notes: list[str] = []
    cleaned = writing._clean_lyrics(text, notes)
    assert (
        cleaned
        == "[Verse]\nWe ride the storm tonight\nSynth arpeggios rise into the night\n\n[Bridge]\n\n[Chorus]\nWe are fire"
    )
    assert any("stage direction" in note for note in notes)
    warnings = severities(lyrics.check_lyrics(text, instrumental=False), "warning")
    assert sum("Stage direction" in w for w in warnings) == 4


def test_export_release_says_how_long_each_step_took(monkeypatch: pytest.MonkeyPatch) -> None:
    """Owner's report 2026-10-30: Export Release took minutes - its summary says where they went."""
    from plenio.core import step_clock

    now = iter([0.0, 3.2, 115.2, 167.0, 167.4, 197.0])
    monkeypatch.setattr(step_clock.time, "perf_counter", lambda: next(now))
    clock = step_clock.StepClock()
    clock.lap("audio files")
    clock.lap("vocal stem")
    clock.lap("lyrics ASR")
    clock.hearing = 46.2
    clock.lap("quality")  # under a second: left out
    assert (
        clock.line() == "took 3:17 - audio files 3 s, vocal stem 1:52, lyrics ASR 52 s (46 s in its worker)"
    )
