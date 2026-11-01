"""Section tags for YuE2 (a user's request of 2026-11-01: tags of one's own such as [Breakdown] or [Violin Rise], kept
for the next songs): the sections YuE2 learned, the others Plenio knows, the writer using them, tags of one's own in
one's lyrics."""

from __future__ import annotations

from plenio.core import lyrics as lyrics_rules
from plenio.core.brief import OWN_LYRICS, build_song_brief, parse_template
from plenio.core.engines import EngineInfo, yue2
from plenio.core.writing import compose, parse_draft

YUE2 = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())
TEMPLATE = parse_template(
    "---\ngenre: synth pop\nvocals: sung\nlanguage: English\n---\nBright synths.", "mine/pop"
)


def test_yue2_knows_the_sections_it_learned_and_plenio_the_others() -> None:
    # SongFormer's labels (intro, verse, pre-chorus, chorus, bridge, inst, outro) as upstream writes them, with its
    # [Interlude]
    assert yue2.MODEL_SECTIONS == (
        "Intro",
        "Verse",
        "Pre-Chorus",
        "Chorus",
        "Bridge",
        "Interlude",
        "Instrumental",
        "Outro",
    )
    assert yue2.TAG_VOCABULARY[: len(yue2.MODEL_SECTIONS)] == yue2.MODEL_SECTIONS
    assert {"Post-Chorus", "Hook", "Refrain", "Solo", "Break", "Breakdown", "Drop", "Build"} <= set(
        yue2.TAG_VOCABULARY
    )
    rules = yue2.writing_rules(instrumental=False, target_seconds=180.0)
    assert rules["model_tags"] == list(yue2.MODEL_SECTIONS) and rules["tags"] == list(yue2.TAG_VOCABULARY)


def test_the_writer_is_told_every_section_it_may_use_and_takes_the_briefs_own() -> None:
    brief = build_song_brief({"description": "With a [Breakdown] before the last chorus."}, TEMPLATE)
    prompt, _request = compose(brief, YUE2)
    assert "Section tags YuE2 knows: [Intro] [Verse] [Pre-Chorus] [Chorus] [Bridge] [Interlude]" in prompt
    assert (
        "also understood: [Post-Chorus] [Hook] [Refrain] [Solo] [Break] [Breakdown] [Drop] [Build]" in prompt
    )
    assert (
        "a section tag the brief names in square brackets, such as [Breakdown], is used as written" in prompt
    )


def test_ones_own_lyrics_keep_tags_of_ones_own() -> None:
    own = "[Verse]\nLights on the water\n\n[Violin Rise]\n\n[Chorus]\nWe run, we run"
    brief = build_song_brief({"lyrics_from": OWN_LYRICS, "lyrics": own}, TEMPLATE)
    _prompt, request = compose(brief, YUE2)
    assert request.sections == ("Verse", "Violin Rise", "Chorus")
    draft = parse_draft(
        "TITLE: Water Lights\nSTYLE: synth pop, bright synths\nLYRICS:\nnone\nARTWORK: Water", request
    )
    assert draft.lyrics == own


def test_a_tag_of_ones_own_is_explained_not_refused() -> None:
    findings = lyrics_rules.check_lyrics(
        "[Verse]\nLights on the water\n\n[Violin Rise]\n\n[Chorus]\nWe run, we run",
        instrumental=False,
        vocabulary=yue2.TAG_VOCABULARY,
    )
    own = [f for f in findings if "Violin Rise" in f.message]
    assert len(own) == 1 and own[0].severity == "info"
    assert "a section tag of your own" in own[0].message and "instrumental part" in own[0].message
    assert not any(f.severity == "error" for f in findings)
    known = lyrics_rules.check_lyrics(
        "[Verse]\nOne\n\n[Interlude]\n\n[Breakdown]\nTwo", instrumental=False, vocabulary=yue2.TAG_VOCABULARY
    )
    assert not any("of your own" in f.message for f in known)
