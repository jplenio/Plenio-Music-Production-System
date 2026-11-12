"""MusicXML import (feature request 2026-10-22): Plenio's own MusicXML comes back exactly - the score, the
lyrics and the notes they are sung on -, a file a script changed comes back as changed, and any other
MusicXML is refused with the reason."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET

import pytest
from hypothesis import HealthCheck, given, settings

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.score import lyric_layout, musicxml
from plenio.core.score.musicxml_import import import_musicxml
from score_strategies import scores

HEADER = (
    "X:1\nT:\nM:4/4\nL:1/16\nQ:1/4=96\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
)
SONG = (
    HEADER
    + "K:C\n% verse\nV: Vocal\n"
    + '"C"c4d4e4f4|"G"g4a4b4z4|\nV: Ins\nC,16|G,,16|\n'
    + "% chorus\nV: Vocal\n"
    + '"F"c4c4d4e4|"C"c8z8|\nV: Ins\nF,,16|C,16|\n'
)
LYRICS = "[Verse]\nbeautiful morning sun\n(softly)\nsing\n\n[Chorus]\nhold on to me\n"


def placement(score: c.Score, lyrics: str, spans: object = None) -> dict[int, str]:
    return {o: s.text for o, s in lyric_layout.layout(score, lyrics, spans).syllables().items()}  # type: ignore[arg-type]


def test_a_song_comes_back_exactly_with_its_lyrics_on_their_notes() -> None:
    score = c.from_abc(SONG)
    text = musicxml.export_musicxml(score, title="Song", lyrics=LYRICS)
    back = import_musicxml(text, lyrics=LYRICS, current=score)
    assert back.score == score and c.to_abc(back.score) == SONG
    assert back.lyrics == LYRICS  # tags, the direction and the spelling stay
    assert placement(back.score, LYRICS, back.spans) == placement(score, LYRICS)
    assert back.report[0].startswith(
        "4 bars at 96 BPM: Vocal 12 notes, Instrument 4 notes, 4 chord symbols, 2 sections"
    )
    # every line has its span with the onsets of its syllables
    assert all(len(span) > 4 for span in back.spans)


def test_the_export_keeps_lines_blocks_and_tags_for_the_import() -> None:
    score = c.from_abc(SONG)
    root = ET.fromstring(musicxml.export_musicxml(score, lyrics=LYRICS).split("\n", 2)[2])
    lyrics = [n.find("lyric") for n in root.iter("note") if n.find("lyric") is not None]
    assert lyrics[0] is not None and lyrics[0].get("name") == "Verse"
    ends = [
        (x.findtext("text"), x.find("end-line") is not None, x.find("end-paragraph") is not None)
        for x in lyrics
        if x is not None
    ]
    assert ("sun", True, False) in ends and ("sing", True, True) in ends and ends[-1] == ("me", True, True)
    fields = {f.get("name"): f.text for f in root.iter("miscellaneous-field")}
    assert fields == {"plenio-layout": "2 2", "plenio-sections": '[[0, "verse"], [2, "chorus"]]'}


def test_without_the_sheets_lyrics_they_are_written_from_the_file() -> None:
    score = c.from_abc(SONG)
    back = import_musicxml(musicxml.export_musicxml(score, lyrics=LYRICS))
    assert back.lyrics == "[Verse]\nbeautiful morning sun\nsing\n\n[Chorus]\nhold on to me\n"
    assert placement(back.score, back.lyrics or "", back.spans) == placement(score, LYRICS)
    assert any("written from the file" in line for line in back.report)


def _move_lyric(text: str, word: str, steps: int) -> str:
    """The file with the lyric ``word`` moved ``steps`` Vocal notes later (what a script does)."""
    notes = re.findall(r"<note>.*?</note>", text.split('<part id="P2">')[0], re.S)
    source = next(k for k, n in enumerate(notes) if f"<text>{word}</text>" in n)
    lyric = re.search(r"<lyric.*?</lyric>", notes[source], re.S)
    assert lyric is not None
    target = source + steps
    moved = notes[source].replace(lyric.group(0), "")
    landed = notes[target].replace("</note>", lyric.group(0) + "</note>")
    return text.replace(notes[source], moved, 1).replace(notes[target], landed, 1)


def test_a_word_a_script_moved_is_sung_where_it_was_moved() -> None:
    score = c.from_abc(SONG)
    lyrics = "[Verse]\nsun on me\n\n[Chorus]\nhold on\n"
    before = placement(score, lyrics)
    assert sorted(before.items())[:3] == [(0, "sun"), (4, "on"), (8, "me")]
    edited = _move_lyric(
        musicxml.export_musicxml(score, lyrics=lyrics), "me", 2
    )  # from e (bar 1) to g (bar 2)
    back = import_musicxml(edited, lyrics=lyrics, current=score)
    assert back.lyrics == lyrics
    after = placement(back.score, lyrics, back.spans)
    assert after[16] == "me" and 8 not in after  # e now holds "on"
    assert lyric_layout.layout(back.score, lyrics, back.spans).parts[0].lines[0].holds[:2] == (8, 12)


def test_other_words_from_a_script_become_the_lyrics() -> None:
    score = c.from_abc(SONG)
    text = musicxml.export_musicxml(score, lyrics=LYRICS).replace("<text>sing</text>", "<text>dance</text>")
    back = import_musicxml(text, lyrics=LYRICS, current=score)
    assert back.lyrics == "[Verse]\nbeautiful morning sun\ndance\n\n[Chorus]\nhold on to me\n"
    sung = next(o for o, t in placement(score, LYRICS).items() if t == "sing")
    assert placement(back.score, back.lyrics or "", back.spans)[sung] == "dance"


def test_a_word_split_otherwise_than_the_layout_keeps_its_note() -> None:
    score = c.from_abc(SONG)
    lyrics = "[Verse]\ntomorrow sun\n"
    assert [p for p, _end in lyric_layout.syllables_of("tomorrow")] == ["to", "mor", "row"]
    text = musicxml.export_musicxml(score, lyrics=lyrics)
    # a script splits it tom-or-row: no run of the layout's syllables - the word keeps its first note
    edited = text.replace("<text>to</text>", "<text>tom</text>", 1).replace(
        "<text>mor</text>", "<text>or</text>", 1
    )
    back = import_musicxml(edited, lyrics=lyrics, current=score)
    assert back.spans[0][4:] == (0, 12)  # one onset a word
    assert placement(back.score, lyrics, back.spans) == placement(score, lyrics)
    # split as the layout does, every syllable has its onset
    assert import_musicxml(text, lyrics=lyrics, current=score).spans[0][4:] == (0, 4, 8, 12)


def test_a_key_change_in_a_bar_of_rests_survives() -> None:
    score = c.from_abc(SONG)
    rests = c.from_abc(HEADER + "K:C\n% verse\nV: Vocal\nc16|z16|\nV: Ins\nC,16|Z|\n")
    changed = c.validate(
        c.Score(
            tempo=rests.tempo,
            unit=rests.unit,
            meters=rests.meters,
            keys=(c.KeyChange(0, "C", "header"), c.KeyChange(24, "D", "inline")),
            sections=rests.sections,
            layout=rests.layout,
            vocal=rests.vocal,
            ins=rests.ins,
            chords=(),
        )
    )
    assert import_musicxml(musicxml.export_musicxml(changed)).score == changed
    assert score  # the song itself has no key change


@settings(deadline=None, suppress_health_check=[HealthCheck.too_slow])
@given(scores())
def test_every_score_comes_back_as_it_was(score: c.Score) -> None:
    assert import_musicxml(musicxml.export_musicxml(score)).score == score


# --- what is refused ------------------------------------------------------------------------------------------


def refused(text: str) -> str:
    with pytest.raises(PlenioValidationError) as caught:
        import_musicxml(text)
    return str(caught.value)


@pytest.fixture
def exported() -> str:
    return musicxml.export_musicxml(c.from_abc(SONG), lyrics=LYRICS)


def test_musicxml_of_another_program_is_refused(exported: str) -> None:
    other = exported.replace(musicxml.SOFTWARE, "MuseScore 4.4.2")
    assert "written by MuseScore 4.4.2, not by Plenio" in refused(other)
    assert "Import MIDI" in refused(other)
    assert "no well-formed XML" in refused("<score-partwise><part>")
    assert "root is <score-timewise>" in refused('<?xml version="1.0"?><score-timewise/>')


def test_entities_and_an_internal_doctype_are_refused(exported: str) -> None:
    bomb = exported.replace("<score-partwise", '<!DOCTYPE x [<!ENTITY a "aaaaaaaaaa">]>\n<score-partwise', 1)
    assert "declares entities" in refused(bomb)


@pytest.mark.parametrize(
    ("change", "says"),
    [
        (("<voice>1</voice>", "<voice>2</voice>"), "second voice"),
        (
            ("<duration>4</duration><voice>1</voice>", "<chord/><duration>4</duration><voice>1</voice>"),
            "<chord> note",
        ),
        (("</attributes>", "</attributes><backup><duration>4</duration></backup>"), "<backup>"),
        (("<rest/><duration>4</duration>", "<rest/><duration>2</duration>"), "holds"),
        (
            ("<part-name>Instrument</part-name>", "<part-name>Piano</part-name>"),
            "two parts Vocal (P1) and Instrument (P2)",
        ),
        (("<type>quarter</type>", "<type>quarter</type><time-modification/>"), "<time-modification> note"),
        (("<pitch>", "<grace/><pitch>"), "<grace> note"),
        (("<sound tempo", "<words>loud</words><sound tempo"), "<words> direction"),
        (("<divisions>4</divisions>", "<divisions>3</divisions>"), "cannot be a score unit"),
    ],
)
def test_what_plenio_never_writes_is_refused(exported: str, change: tuple[str, str], says: str) -> None:
    old, new = change
    assert old in exported, old
    assert says in refused(exported.replace(old, new, 1))


def test_presentation_a_program_adds_is_passed_over(exported: str) -> None:
    dressed = exported.replace("<type>quarter</type>", "<type>quarter</type><stem>up</stem>").replace(
        '<measure number="2">', '<measure number="2"><print new-system="yes"/>'
    )
    score = c.from_abc(SONG)
    assert import_musicxml(dressed, lyrics=LYRICS, current=score).score == score
