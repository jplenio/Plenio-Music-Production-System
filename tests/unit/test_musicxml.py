"""The sheet music as MusicXML 4.0 (owner's request 2026-10-01): full measures, paired ties, pitches
spelled for the key, chord symbols, section marks, tempo and the lyrics under the Vocal notes."""

from __future__ import annotations

import json
import xml.etree.ElementTree as ET
from pathlib import Path

from plenio.core.score import canonical as c
from plenio.core.score import musicxml, ops

ROOT = Path(__file__).resolve().parents[2]
TRICKY = json.loads((ROOT / "frontend" / "tests" / "fixtures" / "tricky-score.json").read_text(encoding="utf-8"))["abc"]
PLAN = json.loads((ROOT / "tests" / "fixtures" / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))["abc"]
LYRICS = "[Intro]\n\n[Verse]\nbeautiful morning\nsing it again\n\n[Chorus]\nhold on"


def parse(text: str) -> ET.Element:
    assert text.startswith('<?xml version="1.0" encoding="UTF-8"')
    return ET.fromstring(text.split("\n", 2)[2])  # past the declaration and the DOCTYPE


def notes_of(part: ET.Element) -> list[ET.Element]:
    return [n for m in part.findall("measure") for n in m.findall("note")]


def test_every_measure_is_full_and_every_tie_is_closed() -> None:
    for abc in (TRICKY, PLAN):
        score = c.from_abc(abc)
        root = parse(musicxml.export_musicxml(score, title="Song"))
        assert [p.get("id") for p in root.findall("part")] == ["P1", "P2"]
        for part in root.findall("part"):
            measures = part.findall("measure")
            assert len(measures) == score.measure_count
            for index, measure in enumerate(measures):
                assert sum(int(n.findtext("duration")) for n in measure.findall("note")) == score.lengths[index]
            open_ties = 0
            for note in notes_of(part):
                kinds = [t.get("type") for t in note.findall("tie")]
                open_ties -= kinds.count("stop")
                assert open_ties >= 0
                open_ties += kinds.count("start")
            assert open_ties == 0


def test_the_header_names_tempo_key_meter_and_sections() -> None:
    score = c.from_abc(TRICKY)  # D major, 4/4, 90 BPM, L:1/32; intro, verse, chorus
    root = parse(musicxml.export_musicxml(score, title="Mine & yours"))
    assert root.findtext("work/work-title") == "Mine & yours"
    first = root.find("part/measure/attributes")
    assert first is not None
    assert first.findtext("divisions") == "8"
    assert first.findtext("key/fifths") == "2" and first.findtext("key/mode") == "major"
    assert (first.findtext("time/beats"), first.findtext("time/beat-type")) == ("4", "4")
    assert root.find("part/measure/direction/sound").get("tempo") == "90"
    assert [r.text for r in root.findall("part[@id='P1']//rehearsal")] == ["Intro", "Verse", "Chorus"]
    assert root.findall("part[@id='P2']//rehearsal") == []


def test_pitches_are_spelled_for_the_key_and_chords_get_their_kind() -> None:
    score = c.from_abc(TRICKY)
    root = parse(musicxml.export_musicxml(score))
    vocal = [n for n in notes_of(root.find("part[@id='P1']")) if n.find("pitch") is not None]
    first = vocal[0].find("pitch")  # F#4 in D major: F with a sharp, not G flat
    assert (first.findtext("step"), first.findtext("alter"), first.findtext("octave")) == ("F", "1", "4")
    harmonies = root.findall("part[@id='P1']//harmony")
    assert [(h.findtext("root/root-step"), h.findtext("kind")) for h in harmonies[:3]] == [
        ("D", "major"),
        ("G", "major"),
        ("A", "dominant"),
    ]
    assert harmonies[3].findtext("kind") == "minor"  # Bm


def test_the_lyrics_stand_under_the_vocal_notes() -> None:
    score = c.from_abc(TRICKY)
    root = parse(musicxml.export_musicxml(score, lyrics=LYRICS))
    lyrics = [(l.findtext("syllabic"), l.findtext("text")) for l in root.findall("part[@id='P1']//lyric")]
    assert lyrics[:5] == [("begin", "beau"), ("middle", "ti"), ("end", "ful"), ("begin", "mor"), ("end", "ning")]
    assert lyrics[5:] == [("single", "sing"), ("single", "it"), ("begin", "a"), ("end", "gain"), ("single", "hold"), ("single", "on")]
    assert root.findall("part[@id='P2']//lyric") == []


def test_lengths_without_one_note_value_are_tied_and_an_empty_bar_is_a_bar_rest() -> None:
    score = c.from_abc(TRICKY)
    five = c.Note(onset=score.starts[2], duration=5, pitch=62)  # 5/32: an eighth tied to a 32nd
    changed = ops.paste(score, score.starts[2], score.lengths[2], [{"track": "vocal", "onset": 0, "duration": 5, "pitch": 62}]).score
    assert five in changed.vocal
    root = parse(musicxml.export_musicxml(changed, lyrics=LYRICS))
    bar = root.findall("part[@id='P1']/measure")[2]
    first, second = bar.findall("note")[:2]
    assert (first.findtext("type"), first.findtext("duration"), first.find("tie").get("type")) == ("eighth", "4", "start")
    assert (second.findtext("type"), second.findtext("duration"), second.find("tie").get("type")) == ("32nd", "1", "stop")
    assert first.find("lyric") is not None and second.find("lyric") is None  # a tied note has one syllable
    rest = root.findall("part[@id='P2']/measure")[2].find("note/rest")  # Ins rests through bar 3
    assert rest is not None and rest.get("measure") == "yes"


def test_the_file_name_comes_from_the_title() -> None:
    assert musicxml.filename_for("My Song: Take 2") == "My Song_ Take 2.musicxml"
    assert musicxml.filename_for("  ") == "score.musicxml"
