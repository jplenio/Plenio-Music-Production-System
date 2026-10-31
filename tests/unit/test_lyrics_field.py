"""The Song Brief's lyrics field (1.5.0, owner's request 2026-10-31): an idea the writer writes the lyrics from - the
template's by default - or one's own lyrics, sung as written; and the brief's fields showing the template's values in
the workflows the Song API makes."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core.brief import (
    LYRICS_IDEA,
    OWN_LYRICS,
    TemplateLibrary,
    build_song_brief,
    parse_template,
)
from plenio.core.engines import EngineInfo, yue2
from plenio.core.errors import PlenioUserError
from plenio.core.song_api import api_templates, load_template, prepare
from plenio.core.workflow_prompt import decode_widgets
from plenio.core.writing import compose, given_lyrics, parse_draft

ROOT = Path(__file__).resolve().parents[2]
YUE2 = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())
TEMPLATE = parse_template(
    "---\ngenre: indie folk\nvocals: sung\nlanguage: English\nlyrics: About a lighthouse keeper's last night.\n---\n"
    "Warm acoustic guitars and a close voice.",
    "mine/folk",
)
OWN = "[Verse]\nThe kettle sings at six\nThe radio hums along\n\n[Chorus]\nMorning, morning, stay"


def test_the_lyrics_idea_comes_from_the_template_and_is_said_in_the_brief() -> None:
    brief = build_song_brief({}, TEMPLATE)
    assert brief.lyrics == "About a lighthouse keeper's last night." and not brief.own_lyrics
    assert "lyrics" in brief.from_template
    assert "Lyrics idea: About a lighthouse keeper's last night." in brief.to_text()
    typed = build_song_brief({"lyrics": "About a paper boat."}, TEMPLATE)
    assert typed.lyrics == "About a paper boat." and "lyrics" not in typed.from_template
    # an instrumental has no lyrics
    assert build_song_brief({"vocals": "instrumental"}, TEMPLATE).lyrics == ""


def test_ones_own_lyrics_are_never_the_templates_and_must_be_written() -> None:
    brief = build_song_brief({"lyrics_from": OWN_LYRICS, "lyrics": OWN}, TEMPLATE)
    assert brief.own_lyrics and brief.lyrics == OWN
    assert "they are sung exactly as written" in brief.to_text()
    with pytest.raises(PlenioUserError, match="lyrics field is empty"):
        build_song_brief({"lyrics_from": OWN_LYRICS}, TEMPLATE)
    with pytest.raises(PlenioUserError, match="Unknown lyrics choice"):
        build_song_brief({"lyrics_from": "sung by a choir"}, TEMPLATE)
    # an instrumental with the choice left on own: no lyrics, no error
    assert not build_song_brief({"lyrics_from": OWN_LYRICS, "vocals": "instrumental"}, TEMPLATE).own_lyrics
    assert build_song_brief({"lyrics_from": LYRICS_IDEA}, TEMPLATE).lyrics.startswith("About a lighthouse")


def test_given_lyrics_keep_their_sections_or_get_them_from_their_blocks() -> None:
    assert given_lyrics(OWN) == OWN
    # lines before the first tag: a verse of their own
    assert given_lyrics("Up early again\n\n[Chorus]\nMorning, stay").startswith("[Verse]\nUp early again")
    untagged = given_lyrics("One line here\nAnd one more\n\nMorning, stay\n\nA second verse\n\nMorning, stay")
    assert untagged.split("\n\n") == [
        "[Verse]\nOne line here\nAnd one more",
        "[Chorus]\nMorning, stay",
        "[Verse]\nA second verse",
        "[Chorus]\nMorning, stay",
    ]


def test_with_ones_own_lyrics_the_writer_writes_title_style_and_artwork_and_the_lyrics_stay() -> None:
    brief = build_song_brief({"lyrics_from": OWN_LYRICS, "lyrics": OWN}, TEMPLATE)
    prompt, request = compose(brief, YUE2)
    assert request.lyrics_mode == "given" and request.given_lyrics == OWN
    assert "The kettle sings at six" in prompt and "Write only the word none after LYRICS:" in prompt
    assert request.sections == ("Verse", "Chorus")
    answer = "TITLE: Six O'Clock Kettle\nSTYLE: indie folk, acoustic guitar, warm male vocal\nLYRICS:\nnone\nARTWORK: A kettle"
    draft = parse_draft(answer, request)
    assert draft.lyrics == OWN and draft.title == "Six O'Clock Kettle"
    rewritten = parse_draft(answer.replace("LYRICS:\nnone", "LYRICS:\n[Verse]\nOther words"), request)
    assert rewritten.lyrics == OWN
    assert any("sung as written" in note for note in rewritten.enforcements)


# --- the Song API: the brief's fields as ComfyUI shows them --------------------------------------------------------

NODES: dict[str, Any] = json.loads((ROOT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))[
    "nodes"
]
WORKFLOWS = {
    p.stem: json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "example_workflows").glob("*.json")
}
STYLES = TemplateLibrary(ROOT / "resources" / "templates")


def style(template_id: str) -> Any:
    return STYLES.templates().get(template_id)


def brief_widgets(workflow: dict[str, Any]) -> dict[str, Any]:
    node = next(n for n in workflow["nodes"] if n["type"] == "PlenioSongBrief")
    return decode_widgets(NODES["PlenioSongBrief"], node["widgets_values"])


def song(fields: dict[str, Any]) -> dict[str, Any]:
    name, workflow = api_templates(WORKFLOWS)["yue2-song"]
    template = load_template(name, workflow, NODES.get)
    return brief_widgets(prepare(template, {"fields": fields}, NODES.get, styles=style).workflow)


def test_the_shipped_song_shows_its_templates_values() -> None:
    shipped = song({})
    singer = STYLES.get("pop/singer-songwriter-acoustic-vocal").fields
    assert shipped["genre"] == singer["genre"] and shipped["vocals.lyrics"] == singer["lyrics"]
    assert shipped["vocals.lyrics_from"] == LYRICS_IDEA


def test_another_template_replaces_the_old_ones_values_and_keeps_those_given() -> None:
    birthday = STYLES.get("kids/birthday-song-vocal").fields
    made = song({"template": "kids/birthday-song-vocal", "mood": "silly"})
    assert made["genre"] == birthday["genre"] and made["vocals.voice"] == birthday["voice"]
    assert made["vocals.lyrics"] == birthday["lyrics"] and made["description"] == birthday["description"]
    assert made["mood"] == "silly"
    # no template: the old one's values go, the fields given stay
    none = song({"template": "none", "genre": "sea shanty"})
    assert none["genre"] == "sea shanty" and none["description"] == "" and none["vocals.lyrics"] == ""
    # one's own lyrics are never filled
    own = song({"template": "kids/birthday-song-vocal", "lyrics_from": OWN_LYRICS, "lyrics": OWN})
    assert own["vocals.lyrics"] == OWN and own["genre"] == birthday["genre"]


def test_without_the_style_lookup_the_fields_are_written_as_given() -> None:
    name, workflow = api_templates(WORKFLOWS)["yue2-song"]
    template = load_template(name, workflow, NODES.get)
    made = brief_widgets(
        prepare(template, {"fields": {"template": "kids/birthday-song-vocal"}}, NODES.get).workflow
    )
    assert made["genre"] == STYLES.get("pop/singer-songwriter-acoustic-vocal").fields["genre"]
