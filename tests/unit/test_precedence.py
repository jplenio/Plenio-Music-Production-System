"""One authoritative value (next-release plan §7, §8, I12).

- Song Brief text fields: typed > template > empty; a template never alters a typed value;
  choice fields are always the widget's; the legacy ``custom`` placeholder counts as empty.
- Manual lyrics are never overwritten: whatever the writer drafts (another draft seed, a new
  song in batch mode, a changed brief or template), a manual document resolves to itself, needs
  no draft, and the approval fingerprint does not depend on the lyrics draft.
- A score of rests cannot reach YuE2.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from hypothesis import given
from hypothesis import strategies as st

from plenio.core.brief import (
    LEGACY_NOTE,
    TEXT_FIELDS,
    build_cover_brief,
    build_song_brief,
    cover_choice_hints,
    cover_text_fields,
    field_sources,
    parse_template,
    template_choice_hints,
)
from plenio.core.engines import EngineInfo, yue2
from plenio.core.score import canonical
from plenio.core.sheet import DocEntry, DocState, DocStatus, SheetState, evaluate_sheet, needs_upstream
from plenio.core.writing import compose

ROOT = Path(__file__).resolve().parents[2]
ENGINE = EngineInfo("yue2", yue2.RULES_VERSION, yue2.capabilities())
TEMPLATE = parse_template(
    "---\nname: T\ngenre: jazz\nmood: calm\ntempo: 70 BPM\nlength: long (about 4:30)\n---\nA calm jazz tune.",
    "jazz/t",
)
TEXT = st.one_of(st.just(""), st.just("  "), st.text("abc xyz", min_size=1, max_size=8).map(str.strip))


# --- Song Brief precedence --------------------------------------------------------------------


@given(st.fixed_dictionaries({name: TEXT for name in ("description", "genre", "mood", "tempo", "key")}))
def test_typed_beats_template_beats_empty(values: dict[str, str]) -> None:
    values = {**values, "genre": values["genre"] or "pop"}  # a brief needs a genre or a description
    brief = build_song_brief(values, TEMPLATE)
    sources = field_sources(values, TEMPLATE)
    for name in ("description", "genre", "mood", "tempo", "key"):
        typed = values[name].strip()
        effective = getattr(brief, name)
        if typed:
            assert effective == typed and sources[name] == "typed"
        elif TEMPLATE.fields.get(name):
            assert effective == TEMPLATE.fields[name] and sources[name] == "template"
            assert name in brief.from_template
        else:
            assert effective == "" and sources[name] == "empty"


def test_changing_the_template_never_alters_typed_values() -> None:
    values = {"genre": "bebop", "mood": "", "description": "my words", "length": "short (about 1:30)"}
    other = parse_template("---\nname: O\ngenre: rock\nmood: loud\n---\nA loud rock song.", "rock/o")
    for template in (None, TEMPLATE, other):
        brief = build_song_brief(values, template)
        assert (brief.genre, brief.description, brief.length) == ("bebop", "my words", "short (about 1:30)")
    assert build_song_brief(values, other).mood == "loud"
    assert build_song_brief(values, None).mood == ""


def test_choice_fields_stay_explicit_and_the_template_only_hints() -> None:
    values = {"genre": "pop", "length": "short (about 1:30)", "vocals": "sung", "melody": ""}
    brief = build_song_brief(values, TEMPLATE)
    assert brief.length == "short (about 1:30)"
    assert template_choice_hints(values, TEMPLATE) == {"length": "long (about 4:30)"}
    assert template_choice_hints({**values, "length": "long (about 4:30)"}, TEMPLATE) == {}
    assert template_choice_hints(values, None) == {}


def test_a_cover_brief_gets_the_template_choices_in_its_own_words() -> None:
    sung = parse_template(
        "---\nname: S\ngenre: pop\nvocals: sung\nlength: short (about 1:30)\n---\nPop.", "pop/s"
    )
    plain = parse_template(
        "---\nname: I\ngenre: ambient\nvocals: instrumental\nmelody: accompaniment only\n---\nAmbient.", "a/i"
    )
    # no length and never "sung": a sung template only turns an instrumental cover into one with the words
    assert cover_choice_hints({"vocals": "original lyrics"}, sung) == {}
    assert cover_choice_hints({"vocals": "new lyrics"}, sung) == {}
    assert cover_choice_hints({"vocals": "instrumental"}, sung) == {"vocals": "original lyrics"}
    assert cover_choice_hints({"vocals": "original lyrics"}, plain) == {
        "vocals": "instrumental",
        "melody": "accompaniment only",
    }
    assert cover_choice_hints({"vocals": "instrumental", "melody": "accompaniment only"}, plain) == {}
    assert cover_choice_hints({"vocals": "instrumental"}, None) == {}
    # the text fields a cover takes from a template: never tempo, key, meter or the language
    assert cover_text_fields("original lyrics") == ("description", "genre", "mood", "voice")
    assert cover_text_fields("new lyrics") == ("description", "genre", "mood", "voice", "theme")
    assert cover_text_fields("instrumental") == ("description", "genre", "mood", "lead_instrument")


@pytest.mark.parametrize("placeholder", ["custom", " Custom ", "CUSTOM"])
def test_the_legacy_custom_placeholder_is_empty_and_reported(placeholder: str) -> None:
    values = {"genre": "pop", "key": placeholder, "meter": placeholder, "tempo": "90 BPM"}
    brief = build_song_brief(values)
    assert (brief.key, brief.meter) == ("", "")
    assert brief.notes == (f"key, meter: {LEGACY_NOTE}",)
    assert brief.fingerprint == build_song_brief({"genre": "pop", "tempo": "90 BPM"}).fingerprint
    assert "custom" not in brief.to_text().lower()
    prompt, _request = compose(brief, ENGINE)
    assert "custom" not in prompt.lower()
    # a template value fills the field the placeholder left empty
    templated = build_song_brief({"genre": "pop", "mood": placeholder}, TEMPLATE)
    assert templated.mood == "calm" and "mood" in templated.from_template
    assert field_sources({"key": placeholder}, None)["key"] == "empty"
    cover = build_cover_brief({"genre": placeholder, "description": "soft", "vocals": "instrumental"})
    assert cover.genre == "" and cover.notes == (f"genre: {LEGACY_NOTE}",)


def test_every_text_field_is_covered() -> None:
    assert set(field_sources({}, None)) == set(TEXT_FIELDS)


# --- manual lyrics are authoritative ----------------------------------------------------------

MANUAL = "[Verse]\nEvery word is mine\n\n[Chorus]\nMine alone"
STYLE = "English, warm piano pop, expressive female voice, acoustic piano, light drums, 88 BPM"
DRAFTS = st.one_of(st.none(), st.just(""), st.text(min_size=1, max_size=60))


@given(
    lyrics_draft=DRAFTS,
    style_draft=st.sampled_from([STYLE, STYLE.replace("88", "92")]),
    review=st.sampled_from(["continue", "stop for review", "as the brief says"]),
    brief_mode=st.sampled_from([None, "batch", "careful"]),
)
def test_manual_lyrics_resolve_to_themselves_whatever_is_drafted(
    lyrics_draft: str | None, style_draft: str, review: str, brief_mode: str | None
) -> None:
    """Draft seed, batch mode, brief or template change: each only changes the drafts."""
    state = SheetState(docs={"lyrics": DocEntry(DocState.MANUAL, MANUAL)})
    assert needs_upstream(state, "lyrics") is False  # the node does not even evaluate the writer's lyrics
    evaluation = evaluate_sheet(
        state,
        {"title": "Drafted", "style": style_draft, "lyrics": lyrics_draft, "artwork_prompt": "A lane."},
        ["title", "style", "lyrics", "artwork_prompt"],
        review=review,
        brief_mode=brief_mode,
        rules=yue2,
        engine_id="yue2",
    )
    resolution = evaluation.resolution
    assert resolution.docs["lyrics"].status is DocStatus.MANUAL
    assert resolution.text("lyrics") == MANUAL
    assert not resolution.conflicts


def test_the_approval_does_not_depend_on_the_lyrics_draft() -> None:
    state = SheetState(docs={"lyrics": DocEntry(DocState.MANUAL, MANUAL)})

    def fingerprint(lyrics_draft: str | None) -> str | None:
        return evaluate_sheet(
            state, {"title": "T", "style": STYLE, "lyrics": lyrics_draft}, ["title", "style", "lyrics"]
        ).fingerprint

    assert fingerprint("[Verse]\nA draft") == fingerprint("[Verse]\nAnother draft") == fingerprint(None)


def test_manual_lyrics_with_drafted_title_and_style_get_an_info_finding() -> None:
    def infos(state: SheetState) -> list[str]:
        evaluation = evaluate_sheet(
            state,
            {"title": "T", "style": STYLE, "lyrics": "[Verse]\ndraft"},
            ["title", "style", "lyrics"],
            rules=yue2,
            engine_id="yue2",
        )
        return [f.message for f in evaluation.findings if f.severity == "info"]

    manual = DocEntry(DocState.MANUAL, MANUAL)
    assert "Title and style were drafted from the brief, not from your lyrics." in infos(
        SheetState(docs={"lyrics": manual})
    )
    only_title = infos(SheetState(docs={"lyrics": manual, "style": DocEntry(DocState.MANUAL, STYLE)}))
    assert "The title was drafted from the brief, not from your lyrics." in only_title
    everything = {
        "lyrics": manual,
        "style": DocEntry(DocState.MANUAL, STYLE),
        "title": DocEntry(DocState.MANUAL, "T"),
    }
    assert not any("drafted from the brief" in m for m in infos(SheetState(docs=everything)))
    assert not any("drafted from the brief" in m for m in infos(SheetState()))


# --- I12: a score of rests cannot be rendered -------------------------------------------------


def test_a_score_of_rests_is_a_song_sheet_error() -> None:
    skeleton = canonical.to_abc(canonical.new_score(measures=8, unit=16, tempo=100, section="verse"))
    findings, _seconds = yue2.check_score(skeleton, instrumental=False)
    assert [f.severity for f in findings] == ["error"]
    assert "only rests" in findings[0].message
    song = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
    findings, _seconds = yue2.check_score(song, instrumental=False)
    assert not any(f.severity == "error" for f in findings)
    # an accompaniment-only instrumental (silent Vocal, playing Ins) is fine
    instrumental = song.replace("V: Ins\nZ4|", "V: Ins\nC16|Z3|", 1)
    silent = canonical.from_abc(instrumental)
    silent = silent.with_track("vocal", [])
    findings, _seconds = yue2.check_score(canonical.to_abc(silent), instrumental=True)
    assert not any(f.severity == "error" for f in findings)
