"""YuE2 Cover core: brief, timeline, lyrics alignment, sung-lyrics check, ASR cache, preparation, vocals."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from plenio.core import alignment as al
from plenio.core import lyrics as lyrics_rules
from plenio.core import score as score_rules
from plenio.core.asr import (
    AsrCache,
    AsrNotes,
    AsrResult,
    AsrSettings,
    cache_key,
    result_from_dict,
    weak_segments,
)
from plenio.core.brief import TemplateLibrary, build_cover_brief, build_song_brief
from plenio.core.engines import EngineInfo, yue2
from plenio.core.errors import PlenioUserError
from plenio.core.preparation import prepare_for_brief
from plenio.core.score.timeline import Timeline, TimelineBar, merge_intervals, timeline_from_dict
from plenio.core.vocals import VocalReading, ending, judge
from plenio.core.writing import compose, draft_findings, parse_draft

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "tests" / "fixtures" / "cover"
ENGINE = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())


def fixture(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))
    return data


def timeline_of(data: dict[str, Any], source: str = "src") -> Timeline:
    analysis = score_rules.analyze(data["abc"])
    starts = data["bar_starts"]
    ends = [*starts[1:], data["duration_s"]]
    return Timeline(
        source_sha256=source,
        score_sha256="abc",
        duration_s=data["duration_s"],
        bars=tuple(
            TimelineBar(a, b, bar.meter) for a, b, bar in zip(starts, ends, analysis.bars, strict=True)
        ),
        sections=tuple((s.label, s.start_bar, s.bars) for s in analysis.sections),
        vocal_notes=tuple((a, b) for a, b in data["vocal_notes"]),
    )


def draft_for(name: str) -> tuple[al.Alignment, dict[str, Any]]:
    data = fixture(name)
    analysis = score_rules.analyze(data["abc"])
    words = al.words_from(data["words"])
    result = al.align(
        words,
        list(analysis.sections),
        timeline=timeline_of(data),
        score_meters=[b.meter for b in analysis.bars],
    )
    return result, data


def section_words(text: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for section in lyrics_rules.parse_lyrics(text).sections:
        key = section.tag.lower()
        if section.lines:
            out.setdefault(key, []).extend(al.normalize_words("\n".join(section.lines)))
    return out


# --- brief -----------------------------------------------------------------------------------


def test_cover_brief_modes_and_defaults() -> None:
    instrumental = build_cover_brief({"genre": "acoustic folk"})
    assert (
        instrumental.vocals == "instrumental"
        and instrumental.melody == "lead"
        and instrumental.harmony == "new"
    )
    assert instrumental.instrumental and not instrumental.use_source_lyrics
    assert instrumental.target_seconds is None and instrumental.kind == "cover"
    original = build_cover_brief(
        {"genre": "jazz", "vocals": "original lyrics", "language": "auto", "voice": "warm"}
    )
    assert original.use_source_lyrics and original.language == "" and original.voice == "warm"
    new = build_cover_brief(
        {
            "genre": "jazz",
            "vocals": "new lyrics",
            "language": "German",
            "phrasing_reference": True,
            "theme": "rain",
        }
    )
    assert new.writes_lyrics and new.phrasing_reference and new.language == "German"
    assert "new lyrics" in new.to_text() and "Harmony: new accompaniment" in new.to_text()
    # options of other modes do not leak into the brief
    leaked = build_cover_brief(
        {"genre": "jazz", "vocals": "instrumental", "language": "German", "theme": "x"}
    )
    assert leaked.language == "" and leaked.theme == ""
    assert (
        build_cover_brief({"genre": "jazz", "harmony": "keep original chords"}).fingerprint
        != instrumental.fingerprint
    )


def test_cover_brief_errors_and_warnings() -> None:
    with pytest.raises(PlenioUserError):
        build_cover_brief({})
    with pytest.raises(PlenioUserError):
        build_cover_brief({"genre": "pop", "vocals": "karaoke"})
    accompaniment = build_cover_brief(
        {"genre": "pop", "melody": "accompaniment only", "harmony": "new accompaniment"}
    )
    assert accompaniment.warnings() and "Keep the original chords" in accompaniment.warnings()[0]
    assert not build_cover_brief(
        {"genre": "pop", "melody": "accompaniment only", "harmony": "keep original chords"}
    ).warnings()


def test_cover_brief_takes_the_style_from_a_song_template() -> None:
    library = TemplateLibrary(ROOT / "resources" / "templates")
    template = library.get("pop/german-pop-vocal")
    brief = build_cover_brief({"vocals": "new lyrics"}, template)
    assert brief.genre and "genre" in brief.from_template
    assert brief.language == ""  # the language is the cover's own choice, never the template's


# --- timeline ----------------------------------------------------------------------------------


def test_merge_intervals_and_vocal_regions() -> None:
    notes = [(1.0, 1.5), (2.0, 3.0), (10.0, 10.2), (20.0, 21.0), (21.5, 22.0)]
    assert merge_intervals(notes, 30.0, merge_gap_s=2.0, margin_s=0.0, min_s=0.5) == [
        (1.0, 3.0),
        (20.0, 22.0),
    ]
    assert merge_intervals(notes, 21.5, margin_s=1.0, min_s=0.5) == [(0.0, 4.0), (19.0, 21.5)]
    data = fixture("minimax-excerpt")
    timeline = timeline_of(data)
    regions = timeline.vocal_regions()
    assert regions[0][0] == 0.0 and all(b > a for a, b in regions)
    restored = timeline_from_dict(timeline.to_dict())
    assert restored.to_dict() == timeline.to_dict() and restored.sha256 == timeline.sha256
    assert timeline.bar_at(-1.0) == 0 and timeline.bar_at(10**6) == len(timeline.bars) - 1


# --- alignment --------------------------------------------------------------------------------


@pytest.mark.parametrize("name", ["minimax-excerpt", "yue2-take-y3"])
def test_alignment_places_words_where_they_are_sung(name: str) -> None:
    """Regression on Phase 4A study data: the draft's sections carry the lyric sheet's words."""
    result, data = draft_for(name)
    assert result.method == "beat grid"
    heard, reference = section_words(result.lyrics), section_words(data["reference"])
    for tag, words in reference.items():
        if tag not in heard:
            continue
        pairs = al._alignment_pairs(words, heard[tag])
        errors = sum(1 for r, h in pairs if r is None or h is None or words[r] != heard[tag][h])
        assert errors / len(words) <= 0.25, (tag, heard[tag])


def test_alignment_pickup_rule_moves_phrase_starts_into_the_next_section() -> None:
    abc = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
    analysis = score_rules.analyze(abc)
    sections = list(analysis.sections)
    boundary_bar = sections[1].start_bar - 1
    starts = [bar.start_s for bar in analysis.bars]
    boundary = starts[boundary_bar]
    words = [
        al.AsrWord(boundary - 6.0, boundary - 5.5, "late", segment=0),
        al.AsrWord(boundary - 1.0, boundary - 0.7, "if", segment=1),  # phrase starts before the downbeat
        al.AsrWord(boundary - 0.6, boundary - 0.2, "I", segment=1),
        al.AsrWord(boundary + 0.1, boundary + 0.5, "said", segment=1),
    ]
    placed = al.place_on_grid(words, starts, sections)
    assert placed == [0, 1, 1, 1]
    # continuous singing across the boundary that started more than a bar earlier is not moved
    bar = starts[boundary_bar] - starts[boundary_bar - 1]
    first = boundary - bar - 1.0
    continuous = [
        al.AsrWord(first + 0.5 * i, first + 0.5 * (i + 1), f"w{i}", segment=0)
        for i in range(int((bar + 1.5) / 0.5))
    ]
    placed_continuous = al.place_on_grid(continuous, starts, sections)
    assert all(
        section == 0
        for word, section in zip(continuous, placed_continuous, strict=True)
        if word.mid < boundary
    )


def test_alignment_leaves_out_inventions_after_the_singing() -> None:
    result, _data = draft_for("yue2-take-y2")
    dropped = " ".join(w.word for w in result.dropped)
    assert "Thank" in dropped and "Thank" not in result.lyrics
    assert any("left out" in w for w in result.warnings)


def test_alignment_fallbacks_never_invent_timing() -> None:
    data = fixture("minimax-excerpt")
    words = al.words_from(data["words"])
    analysis = score_rules.analyze(data["abc"])
    timeline = timeline_of(data)
    edited = list(analysis.sections)
    # bar structure changed (one meter differs) but the same section labels: section order
    meters = [b.meter for b in analysis.bars]
    meters[0] = "3/4"
    by_order = al.align(words, edited, timeline=timeline, score_meters=meters)
    assert by_order.method == "section order"
    # no timeline: one block in source order, every word kept in order
    plain = al.align(words, edited, timeline=None, score_meters=meters)
    assert plain.method == "source order" and plain.lyrics.startswith("[Verse]")
    assert al.normalize_words(plain.lyrics) == al.normalize_words(" ".join(w.word for w in words))


def test_join_tokens_attaches_hyphen_and_apostrophe_tokens() -> None:
    assert al.join_tokens(["half", "-dead", "glow"]) == "half-dead glow"
    assert al.join_tokens(["I", "'m", "here"]) == "I'm here"


def test_sung_lyrics_check_finds_a_section_that_was_not_sung() -> None:
    data = fixture("yue2-take-y2")
    check = al.check_sung_lyrics(data["reference"], al.words_from(data["words"]))
    assert check.wer is not None and 0.2 < check.wer < 0.45
    assert any("[Verse]" in finding for finding in check.findings)
    exact = al.check_sung_lyrics("[Verse]\nOne two three four five", "one two three four five")
    assert exact.wer == 0 and exact.passed


# --- ASR cache ---------------------------------------------------------------------------------


def test_asr_cache_key_and_roundtrip(tmp_path: Path) -> None:
    settings = AsrSettings(regions=((0.0, 10.0),))
    key = cache_key("sha", settings, "rev1")
    assert key == cache_key("sha", AsrSettings(regions=((0.0, 10.0),)), "rev1")
    assert key != cache_key("sha", AsrSettings(regions=((0.0, 11.0),)), "rev1")
    assert key != cache_key("sha", AsrSettings(language="de", regions=((0.0, 10.0),)), "rev1")
    assert key != cache_key("sha", settings, "rev2")
    assert key == cache_key(
        "sha", AsrSettings(regions=((0.0, 10.0),), device="cpu"), "rev1"
    )  # device is not content
    cache = AsrCache(tmp_path)
    assert cache.get(key) is None
    result = AsrResult(
        "e", "m", "en", 0.9, ({"start": 0, "end": 1, "text": "hi"},), (al.AsrWord(0, 1, "hi", 0.9),)
    )
    cache.put(key, result)
    restored = cache.get(key)
    assert (
        restored is not None and restored.cached and restored.words[0].word == "hi" and restored.text == "hi"
    )
    cache.path(key).write_text("{broken", encoding="utf-8")
    assert cache.get(key) is None
    with pytest.raises(PlenioUserError):
        result_from_dict({"schema": "other"})


# --- preparation, length, phrasing -------------------------------------------------------------


def test_cover_preparation_per_mode() -> None:
    abc = fixture("minimax-excerpt")["abc"]
    assert score_rules.has_chords(abc)
    lead_new = prepare_for_brief(abc, build_cover_brief({"genre": "folk"}))
    analysis = score_rules.analyze(lead_new.abc)
    assert (
        not analysis.has_chords
        and analysis.voices["Vocal"]["notes"] == 0
        and analysis.voices["Ins"]["notes"] > 100
    )
    keep = prepare_for_brief(abc, build_cover_brief({"genre": "folk", "harmony": "keep original chords"}))
    assert score_rules.has_chords(keep.abc)
    sung = prepare_for_brief(abc, build_cover_brief({"genre": "folk", "vocals": "original lyrics"}))
    assert score_rules.analyze(sung.abc).voices["Vocal"]["notes"] == 163
    acc = prepare_for_brief(abc, build_cover_brief({"genre": "folk", "melody": "accompaniment only"}))
    assert acc.warnings and score_rules.analyze(acc.abc).voices["Ins"]["notes"] == 25


def test_song_preparation_fits_long_instrumental_plans() -> None:
    plan = fixture("yue2-take-y3")["abc"]  # 197 s, sung plan
    brief = build_song_brief({"genre": "folk", "vocals": "instrumental", "length": "short (about 1:30)"})
    prepared = prepare_for_brief(plan, brief)
    analysis = score_rules.analyze(prepared.abc)
    assert analysis.ok and analysis.voices["Vocal"]["notes"] == 0
    labels = [s.label for s in analysis.sections]
    assert labels[-1] == "outro" and "chorus" in labels and analysis.duration_s < 150
    assert any("fitted" in c for c in prepared.changes)
    sung = prepare_for_brief(plan, build_song_brief({"genre": "folk", "length": "short (about 1:30)"}))
    assert sung.abc == plan  # sung plans follow their lyrics; never cut


def test_truncated_plan_is_repaired_and_reported() -> None:
    plan = fixture("yue2-take-y3")["abc"]
    lines = plan.rstrip("\n").split("\n")
    truncated = "\n".join(lines[:-1] + [lines[-1][: len(lines[-1]) // 2]]) + "\n"
    assert not score_rules.analyze(truncated).ok
    change = score_rules.repair_truncated(truncated)
    assert change is not None and score_rules.analyze(change.abc).ok and "token limit" in change.changes[0]
    assert score_rules.repair_truncated(plan) is None
    prepared = prepare_for_brief(truncated, None)
    assert score_rules.analyze(prepared.abc).ok


def test_phrasing_map_of_a_transcription() -> None:
    phrases = score_rules.phrasing(fixture("minimax-excerpt")["abc"])
    assert [p["tag"] for p in phrases] == ["[Verse]", "[Pre-Chorus]", "[Chorus]", "[Outro]"]
    assert sum(p["vocal_notes"] for p in phrases) == 163 and phrases[0]["phrases"][:2] == [15, 15]
    assert phrases[-1]["phrases"] == []


# --- vocals ------------------------------------------------------------------------------------


def test_vocal_verdict_and_ranking() -> None:
    clean = VocalReading(0, 0.0)
    humming = VocalReading.from_notes([(10.0, 11.0), (11.2, 12.0), (40.0, 41.5)], 60.0)
    assert humming.notes == 3 and humming.seconds == pytest.approx(3.3) and len(humming.regions) == 2
    result = judge([humming, clean], [60.0, 60.0])
    assert result.best == 1 and result.passed and not result.verdicts[0].passed
    worst = judge([VocalReading(10, 20.0), VocalReading(3, 4.0)], [60.0, 60.0])
    assert worst.best == 1 and not worst.passed and "vocal suspected" in worst.summary()
    tolerant = judge([humming], [60.0], tolerance_s=5.0)
    assert tolerant.passed
    with pytest.raises(ValueError):
        judge([], [])


def test_ranking_prefers_a_clean_take_that_ends_naturally() -> None:
    # Phase 4B: the clean take 1 ran to the render ceiling and stopped mid-phrase
    from plenio.core.vocals import Ending

    clean = VocalReading(0, 0.0)
    abrupt, natural = Ending(0.9, True), Ending(0.1, False)
    result = judge([clean, clean], [105.8, 84.0], [abrupt, natural])
    assert result.best == 1 and result.passed and not result.notes
    only_abrupt = judge([clean, VocalReading(3, 2.0)], [105.8, 84.0], [abrupt, natural])
    assert only_abrupt.best == 0 and "fade it out" in only_abrupt.notes[0]  # clean beats a natural ending


def test_ending_check() -> None:
    rate = 8000
    t = np.arange(rate * 10) / rate
    tone = 0.3 * np.sin(2 * np.pi * 220 * t)
    assert ending(np.stack([tone, tone]), rate).abrupt
    faded = tone * np.clip((10 - t) / 3, 0, 1) ** 3
    assert not ending(faded, rate).abrupt


# --- writing for covers ------------------------------------------------------------------------

ANSWER = "TITLE: Lanterns\nSTYLE: English, acoustic folk pop, soft female vocal, warm piano, 121 BPM\nLYRICS:\nnone\nARTWORK: A lantern on a river."


def test_compose_original_lyrics_cover_asks_for_no_lyrics() -> None:
    abc = fixture("minimax-excerpt")["abc"]
    sections = [s.tag for s in score_rules.analyze(abc).sections]
    brief = build_cover_brief({"genre": "acoustic folk", "vocals": "original lyrics"})
    prompt, request = compose(
        brief, ENGINE, score_sections=sections, language_hint="English", score_tempo=121
    )
    assert request.kind == "cover" and request.lyrics_mode == "none" and "original lyrics" in prompt
    assert "121 BPM" in prompt and "in English" in prompt
    draft = parse_draft(ANSWER, request)
    assert draft.lyrics == "" and draft.title == "Lanterns"
    assert (
        parse_draft("TITLE: X\nSTYLE: folk, 121 BPM\nARTWORK: y.", request).lyrics == ""
    )  # no LYRICS block needed


def test_compose_new_lyrics_cover_uses_the_phrasing_and_enforces_sections() -> None:
    abc = fixture("minimax-excerpt")["abc"]
    sections = [s.tag for s in score_rules.analyze(abc).sections]
    brief = build_cover_brief(
        {"genre": "folk", "vocals": "new lyrics", "language": "English", "theme": "a river"}
    )
    prompt, request = compose(brief, ENGINE, score_sections=sections, phrasing=score_rules.phrasing(abc))
    assert request.lyrics_mode == "write" and request.enforce_sections
    assert "[Verse]: 5 line(s) of about 15, 15, 16, 16, 2 syllables" in prompt and "a river" in prompt
    good = "TITLE: T\nSTYLE: English, folk, 121 BPM\nLYRICS:\n[Verse]\na\n\n[Pre-Chorus]\nb\n\n[Chorus]\nc\n\n[Outro]\nARTWORK: x."
    assert not [f for f in draft_findings(parse_draft(good, request), request) if f["severity"] == "error"]
    wrong = "TITLE: T\nSTYLE: English, folk, 121 BPM\nLYRICS:\n[Verse]\na\n\n[Chorus]\nc\nARTWORK: x."
    errors = [f for f in draft_findings(parse_draft(wrong, request), request) if f["severity"] == "error"]
    assert errors and "must match" in errors[0]["message"]


def test_compose_instrumental_cover_uses_the_score_tags() -> None:
    abc = fixture("minimax-excerpt")["abc"]
    sections = [s.tag for s in score_rules.analyze(abc).sections]
    _prompt, request = compose(build_cover_brief({"genre": "folk"}), ENGINE, score_sections=sections)
    draft = parse_draft(ANSWER.replace("English, ", "").replace("soft female vocal, ", ""), request)
    assert draft.lyrics == "[Verse]\n\n[Pre-Chorus]\n\n[Chorus]\n\n[Outro]"
    with pytest.raises(Exception, match="final score"):
        compose(build_cover_brief({"genre": "folk"}), ENGINE)


def test_weak_whisper_segments_are_recognised() -> None:
    # the Phase 4B cover run: "Thank you." invented at the end of a clip, between sung lines
    def word(start: float, text: str, p: float, segment: int) -> al.AsrWord:
        return al.AsrWord(start, start + 0.3, text, p, segment)

    result = AsrResult(
        engine="faster-whisper-large-v3",
        model="m",
        language="en",
        language_probability=0.8,
        segments=(
            {"text": "But right now, city, hold us", "avg_logprob": -0.149},
            {"text": "Thank you.", "avg_logprob": -0.86},
            {"text": "Oh yeah", "avg_logprob": -0.9},  # sung, uncertain but no near-zero word
            {"text": "Neon bleeding through the dark", "avg_logprob": -0.166},
        ),
        words=(
            word(53.1, "But", 0.9, 0),
            word(59.33, "Thank", 0.044, 1),
            word(59.61, "you.", 0.997, 1),
            word(60.5, "Oh", 0.4, 2),
            word(60.8, "yeah", 0.5, 2),
            word(62.06, "Neon", 0.95, 3),
        ),
    )
    assert weak_segments(result) == {1}
    no_logprob = AsrResult("qwen", "m", "en", 0.0, ({"text": "Thank you."},), (word(1.0, "Thank", 0.01, 0),))
    assert weak_segments(no_logprob) == set()


GEMMA_NEW_LYRICS = """[Verse]
The turning beam sweeps ocean wide
My lonely vigil starts to fade tonight
Another cycle slows its steady pace
A final watch within this salty space
Just me and glass

[Pre-Chorus]
The gears begin their slow release
A silent promise brings sweet peace
No more the turning bright
Just fading beams of light

[Chorus]
This lamp will sleep when dawn appears
Releasing all the gathered years
One last bright sweep across the spray
Washing shadows far away today
The great machine takes hold
A story in the sea unfolds

[Outro]"""


def test_syllable_fit_flags_lyrics_that_do_not_fit_the_melody() -> None:
    # Phase 4B: these lines were sung at WER 1.14; the source's own lyrics fit (sung at WER 0)
    phrasing = score_rules.phrasing(fixture("minimax-excerpt")["abc"])
    flagged = lyrics_rules.syllable_fit(GEMMA_NEW_LYRICS, phrasing)
    assert {f.data["tag"] for f in flagged} == {"[Verse]", "[Pre-Chorus]", "[Chorus]"}
    assert all("too few" in f.message for f in flagged)
    assert lyrics_rules.syllable_fit(fixture("minimax-excerpt")["reference"], phrasing) == []


def test_new_lyrics_prompt_gives_line_targets_from_the_sectioned_source_lyrics() -> None:
    data = fixture("minimax-excerpt")
    brief = build_cover_brief(
        {"genre": "folk", "vocals": "new", "language": "English", "phrasing_reference": True}
    )
    engine = ENGINE
    tags = [s.tag for s in score_rules.analyze(data["abc"]).sections]
    draft = "[Verse]\nBlue light pooling on the sidewalk, your shadow stretched out long\n\n[Pre-Chorus]\nFeel the bass\n\n[Chorus]\nNeon bleeding through the dark\n\n[Outro]"
    prompt, _request = compose(brief, engine, score_sections=tags, reference_lyrics=draft, score_tempo=121)
    assert "SAME number of syllables" in prompt
    assert "16 syllables, like: Blue light pooling on the sidewalk" in prompt  # the estimate, not a count
    assert "[Outro]: no singing" in prompt
    # an unsectioned reference falls back to the phrase map
    prompt, _request = compose(
        brief, engine, score_sections=tags, reference_lyrics="just words", score_tempo=121
    )
    assert "one syllable per note" in prompt and "just words" in prompt


def test_register_check_matches_the_voice_to_the_fixed_melody() -> None:
    # Phase 4B: the M2 melody (F#4-A5) sung by a baritone at WER 1.13, by a female voice at WER 0.50
    vocal = score_rules.analyze(fixture("minimax-excerpt")["abc"]).voices["Vocal"]
    lowest, highest = vocal["lowest"], vocal["highest"]
    baritone = yue2.check_register("English, folk, warm male baritone, 121 BPM", lowest, highest)
    assert len(baritone) == 1 and "F#4-A5" in baritone[0].message and "-12" in baritone[0].message
    assert yue2.check_register("English, folk, soft female vocal, 121 BPM", lowest, highest) == []
    assert yue2.check_register("English, folk, duet of a man and a woman", lowest, highest) == []
    assert yue2.check_register("jazz, tenor sax lead, soft female vocal", lowest, highest) == []
    assert "+12" in yue2.check_register("pop, bright female voice", 45, 58)[0].message
    assert yue2.voice_register("female vocal") == "female" and yue2.voice_register("tenor-sax") == ""


def test_cover_prompt_names_the_melody_register() -> None:
    brief = build_cover_brief({"genre": "folk", "vocals": "original"})
    tags = ["[Verse]", "[Chorus]"]
    prompt, _request = compose(brief, ENGINE, score_sections=tags, vocal_range=(66, 81))
    assert "The vocal melody lies high (F#4-A5)" in prompt
    prompt, _request = compose(brief, ENGINE, score_sections=tags, vocal_range=(55, 72))
    assert "vocal melody lies" not in prompt


def test_length_advice_depends_on_the_vocal_mode() -> None:
    plan = fixture("yue2-take-y3")["abc"]  # 197 s
    sung, _ = yue2.check_score(plan, instrumental=False, target_seconds=90.0)
    instrumental, _ = yue2.check_score(plan, instrumental=True, target_seconds=90.0)
    assert any("amount of lyrics" in f.message for f in sung)
    assert any("fit length" in f.message for f in instrumental)
    assert not any("amount of lyrics" in f.message for f in instrumental)


def test_asr_notes_are_stored_by_draft_hash(tmp_path: Path) -> None:
    notes = AsrNotes(tmp_path)
    note = {"draft_sha256": "a" * 64, "low_confidence": ["Blue"], "left_out": ["Thank", "you."]}
    notes.put(note)
    assert notes.get("a" * 64) == note
    assert notes.get("b" * 64) is None
    assert notes.get("../../etc/passwd") is None  # only hashes name files
    with pytest.raises(PlenioUserError):
        notes.put({"draft_sha256": "../x"})
