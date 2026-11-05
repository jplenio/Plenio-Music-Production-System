"""One's own lyrics are sung as written: a section tag stays as it is typed - however long, with all it says about
the section (``[Verse - Female Choir, Call and Response delivery]``) - and a section named with a description is that
section where Plenio compares sections (the plan's song form, where the words are placed, the editor's lyrics)."""

from __future__ import annotations

from plenio.core import lyrics as lyrics_rules
from plenio.core import song_form, subtitles
from plenio.core.brief import OWN_LYRICS, build_song_brief, parse_template
from plenio.core.engines import EngineInfo, yue2
from plenio.core.score import canonical as c
from plenio.core.score import lyric_layout
from plenio.core.writing import compose, given_lyrics, parse_draft

YUE2 = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())
TEMPLATE = parse_template(
    "---\ngenre: gospel\nvocals: sung\nlanguage: English\n---\nA choir and an organ.", "mine/gospel"
)

LONG = "Verse - Female Choir, Call and Response delivery"
OWN = (
    f"[{LONG}]\n"
    "We walk along the river\n"
    "(along the river)\n"
    "\n"
    "\n"
    "[Chorus: Full Choir, Male Solo on Top]\n"
    "Hold the light (x2)\n"
    "Hold the light tonight\n"
    "\n"
    "[Bridge (spoken)]\n"
    "**softly** we go home\n"
    "\n"
    "[Outro - Organ fades, last Amen held]"
)


def test_own_lyrics_reach_the_song_exactly_as_written() -> None:
    assert given_lyrics(OWN) == OWN
    brief = build_song_brief({"lyrics_from": OWN_LYRICS, "lyrics": OWN}, TEMPLATE)
    prompt, request = compose(brief, YUE2)
    assert request.given_lyrics == OWN
    assert request.sections == (
        LONG,
        "Chorus: Full Choir, Male Solo on Top",
        "Bridge (spoken)",
        "Outro - Organ fades, last Amen held",
    )
    assert f"  [{LONG}]" in prompt
    answer = "TITLE: River Light\nSTYLE: gospel, choir, organ\nLYRICS:\nnone\nARTWORK: A river at dusk"
    assert parse_draft(answer, request).lyrics == OWN
    # a writer that rewrites them anyway is not listened to
    rewritten = answer.replace(
        "LYRICS:\nnone", "LYRICS:\n[Verse] (Female Choir, Call and Response delivery)\nOther words"
    )
    assert parse_draft(rewritten, request).lyrics == OWN


def test_a_long_tag_is_a_tag_and_never_a_sung_line() -> None:
    parsed = lyrics_rules.parse_lyrics(OWN)
    assert parsed.tags[0] == LONG and not parsed.preamble
    assert parsed.sections[0].lines == ("We walk along the river", "(along the river)")
    # the subtitles and the player sing no tag
    assert all(LONG not in " ".join(line.words) for line in subtitles.sung_lines(OWN))
    # before 1.5.1 a tag of more than 40 characters became a line, and a [Verse] was put in front of it
    assert not given_lyrics(OWN).startswith("[Verse]\n[")


def test_only_what_makes_them_lyrics_is_added() -> None:
    # lines before the first tag: a verse of their own, the rest as written
    assert given_lyrics("Up early again\n\n[Chorus - all of us]\nMorning, stay") == (
        "[Verse]\nUp early again\n\n[Chorus - all of us]\nMorning, stay"
    )
    # no tag at all: 'Chorus:' lines are the sections, as written
    assert (
        given_lyrics("Verse 1:\nOne line\n\nchorus:\nMorning, stay")
        == "[Verse 1]\nOne line\n\n[chorus]\nMorning, stay"
    )
    # a tag in markdown emphasis (pasted from a chat) loses only the stars
    assert given_lyrics(f"**[{LONG}]**\nWe walk") == f"[{LONG}]\nWe walk"
    # line ends and trailing spaces are not text
    assert given_lyrics("[Verse]  \r\nWe walk  \r\n") == "[Verse]\nWe walk"


def test_a_section_named_with_a_description_is_that_section() -> None:
    kinds = {
        LONG: "verse",
        "Verse 2 - Female Choir": "verse",
        "Chorus: Full Choir": "chorus",
        "Bridge (spoken)": "bridge",
        "Pre Chorus": "pre-chorus",
        "pre-chorus, whispered": "pre-chorus",
        "Outro – organ": "outro",
        "Verse": "verse",
        "Break Free": "break free",  # a tag of one's own that begins like a section
        "Instrument: Violin Rise": "instrument: violin rise",
    }
    for tag, kind in kinds.items():
        assert lyrics_rules.section_kind(f"[{tag}]") == kind, tag
    assert song_form.kind(LONG) == "verse"
    assert song_form.kind("Instrument: Violin Rise") == "instrument violin rise"
    found = lyrics_rules.check_lyrics(OWN, instrumental=False, vocabulary=yue2.TAG_VOCABULARY)
    assert any(f.message.startswith(f"[{LONG}] is sung as a verse") for f in found)
    assert not any("would be sung" in f.message and LONG in f.message for f in found)


HEAD = """X:1
T:
M:4/4
L:1/16
Q:1/4=100
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
"""
PLAN = HEAD + (
    '% intro\nV: Vocal\n"C"G4E4D4C4|\nV: Ins\nC16|\n'
    '% verse\nV: Vocal\n"C"E4G4A4G4|\nV: Ins\nC16|\n'
    '% chorus\nV: Vocal\n"C"c4B4A4G4|\nV: Ins\nC16|\n'
)


def test_the_plan_keeps_its_sections_and_the_words_land_on_their_section() -> None:
    lyrics = f"[{LONG}]\nla la la la\n\n[Chorus: Full Choir]\nla la la la"
    form = song_form.match(lyrics, PLAN)
    assert form.lyrics_form == ("verse", "chorus")
    # the plan's verse and chorus are the lyrics' sections: YuE2's own names stay in the score
    assert "% verse" in form.score and "% chorus" in form.score
    assert "female" not in form.score
    placed = lyric_layout.layout(c.from_abc(PLAN), lyrics)
    verse_start = 16
    assert [line.start for line in placed.lines()] == [verse_start, 2 * verse_start]
