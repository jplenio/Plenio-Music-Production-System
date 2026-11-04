"""Song Sheet editing (GitHub issue #28): a note tied over a bar line is shortened as the one note it is,
chord symbols sound as written (or not at all), and a lyrics line placed by hand keeps every syllable on the
note the flow gave it.

The frontend's *shorter* / *longer* (``lengthOperation`` in ``frontend/src/shared/scoreView.ts``) send
``resize_note`` for a note written in tied segments; before, ``set_duration`` shortened the first segment and
removed its tie, so the note fell apart into a short fragment and a second attack in the next bar.
``frontend/tests/fixtures/tied-score.json`` is this module's score with its view (kept current below).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.score import lyric_layout, operations
from plenio.core.score.model import _chord_pitches

TIED_FIXTURE = Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "tied-score.json"

# L:1/16, 16 units a bar. In both voices an A4 of 6 units starts at unit 14 of bar 1: two units in bar 1, tied
# to four in bar 2 - the shape of the issue's "Ins bar 12: A4, 6 units". The chord symbols, the other notes and
# the bars must not change when it is shortened.
TIED = """X:1
T:
M:4/4
L:1/16
Q:1/4=90
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:D
% verse
V: Vocal
"G"z8 B2 c2 A2 A2-|"D/F#"A4 F4 A4 z4|
V: Ins
z8 B2 c2 A2 A2-|A4 F4 A4 z4|
"""
LYRICS = "[Verse]\nsunny day and morning light sing"


def tied_fixture() -> dict[str, Any]:
    return {"abc": TIED, "view": operations.editor_view(TIED)}


def write_tied_fixture() -> None:
    with TIED_FIXTURE.open("w", encoding="utf-8", newline="\n") as file:
        file.write(json.dumps(tied_fixture(), indent=1) + "\n")


def test_the_tied_score_fixture_is_current() -> None:
    assert json.loads(TIED_FIXTURE.read_text(encoding="utf-8")) == tied_fixture(), (
        'regenerate frontend/tests/fixtures/tied-score.json: python -c "import sys; '
        "sys.path[:0] = ['tests/unit', 'tests/support', '.']; import test_song_sheet_editing as t; "
        't.write_tied_fixture()"'
    )


def _notes(abc: str, track: str) -> list[tuple[int, int, int]]:
    model = operations.editor_view(abc)["model"]
    return [(n["onset"], n["duration"], n["pitch"]) for n in model["tracks"][track]]


def _bars(abc: str) -> list[tuple[int, int, str]]:
    model = operations.editor_view(abc)["model"]
    return [(m["onset"], m["length"], m["meter"]) for m in model["measures"]]


def _chords(abc: str) -> list[tuple[int, str]]:
    model = operations.editor_view(abc)["model"]
    return [(ch["onset"], ch["name"]) for ch in model["tracks"]["chords"]]


@pytest.mark.parametrize("track", ["ins", "vocal"])
def test_the_tied_note_is_one_note_written_in_two_tied_segments(track: str) -> None:
    view = operations.editor_view(TIED)
    note = next(n for n in view["model"]["tracks"][track] if n["onset"] == 14)
    assert (note["duration"], note["name"], len(note["segments"])) == (6, "A4", 2)
    first, second = (next(e for e in view["elements"] if e["id"] == s) for s in note["segments"])
    assert (first["bar"], first["units"], first["tie_out"]) == (1, 2, True)
    assert (second["bar"], second["units"], second["tie_in"]) == (2, 4, True)


@pytest.mark.parametrize("track", ["ins", "vocal"])
def test_shortening_the_first_segment_splits_the_note_as_the_issue_showed(track: str) -> None:
    # what the toolbar sent before the fix: the first segment 2 -> 1 units, its tie removed
    first = next(n for n in operations.editor_view(TIED)["model"]["tracks"][track] if n["onset"] == 14)[
        "segments"
    ][0]
    split = operations.apply(TIED, {"op": "set_duration", "id": first, "units": 1})
    assert (14, 1, 69) in _notes(split.abc, track) and (16, 4, 69) in _notes(split.abc, track)
    assert any("tie to the next note was removed" in w for w in split.warnings)


@pytest.mark.parametrize("track", ["ins", "vocal"])
@pytest.mark.parametrize(
    ("duration", "written"),
    [
        (4, "A2-|A2"),  # still over the bar line: still tied, the rest after it in bar 2
        (3, "A2-|A"),
        (2, "A2|z"),  # ends at the bar line: no tie left, bar 2 starts with a rest
        (1, "Az|z"),
    ],
)
def test_the_tied_note_shortened_whole_keeps_its_start_pitch_bars_and_neighbours(
    track: str, duration: int, written: str
) -> None:
    before = _notes(TIED, track)
    other = "vocal" if track == "ins" else "ins"
    result = operations.apply(
        TIED, {"op": "resize_note", "id": f"{track}:14", "duration": duration, "mode": "rests"}
    )
    after = _notes(result.abc, track)
    # one note, same start and pitch, the new length; no second attack in bar 2
    assert (14, duration, 69) in after
    assert not any(onset == 16 for onset, _, _ in after)
    assert sorted(n for n in after if n[0] != 14) == sorted(n for n in before if n[0] != 14)
    # the other voice, the chord symbols and the bars stay; the score stays valid
    assert _notes(result.abc, other) == _notes(TIED, other)
    assert _chords(result.abc) == _chords(TIED)
    assert _bars(result.abc) == _bars(TIED)
    assert operations.editor_view(result.abc)["ok"]
    voice = "Vocal" if track == "vocal" else "Ins"
    body = (
        result.abc.split(f"V: {voice}\n")[-1]
        .split("\n")[0]
        .replace(" ", "")
        .replace('"G"', "")
        .replace('"D/F#"', "")
    )
    assert written in body
    assert not result.warnings
    # the released time is a rest: every bar still holds 16 units in each voice
    score = c.from_abc(result.abc)
    assert score.total == 32


def test_a_line_placed_by_hand_keeps_its_span_and_its_words_when_its_tied_note_is_shortened() -> None:
    # the lyrics are not part of the score: the operation leaves them as they are; a line placed by hand
    # keeps its span, and every syllable stands on a Vocal note of the new score. (The rest the note gives up
    # is an eighth: by the layout's rule a new phrase starts after it, so the syllables are shared out anew.)
    span = [(8, 28, 0, 0)]
    result = operations.apply(TIED, {"op": "resize_note", "id": "vocal:14", "duration": 4, "mode": "rests"})
    after = lyric_layout.layout(c.from_abc(result.abc), LYRICS, span)
    line = after.parts[0].lines[0]
    assert (line.start, line.end, line.pinned, line.text) == (8, 28, True, "sunny day and morning light sing")
    onsets = {n.onset for n in c.from_abc(result.abc).vocal}
    assert line.syllables and all(s.onset in onsets for s in line.syllables)
    assert "".join(s.text for s in line.syllables).replace(" ", "") == "sunnydayandmorninglightsing"


def test_the_tied_note_grows_into_the_rest_after_it_or_is_refused() -> None:
    # the F#4 follows at once: no room to grow - refused, nothing overwritten
    with pytest.raises(PlenioValidationError, match="rest"):
        operations.apply(TIED, {"op": "resize_note", "id": "ins:14", "duration": 8, "mode": "rests"})
    # with room after it (the F#4 turned into a rest first) it grows, still one tied note
    room = operations.apply(TIED, {"op": "delete", "ids": ["ins:20"]}).abc
    grown = operations.apply(room, {"op": "resize_note", "id": "ins:14", "duration": 8, "mode": "rests"})
    assert (14, 8, 69) in _notes(grown.abc, "ins")


@pytest.mark.parametrize(
    ("name", "pitches"),
    [
        ("C", [48, 52, 55]),
        ("Am7", [57, 60, 64, 67]),
        ("D/F#", [42, 50, 54, 57]),
        ("Bbm(maj7)", [58, 61, 65, 69]),
        ("F#7sus4", [54, 59, 61, 64]),
        ("Ebm7b5/A", [45, 51, 54, 57, 61]),
    ],
)
def test_a_chord_symbol_sounds_its_root_quality_and_slash_bass(name: str, pitches: list[int]) -> None:
    assert _chord_pitches(name) == pitches


@pytest.mark.parametrize("name", ["Cadd9", "N.C.", "H7", "C/H", "", "Csus"])
def test_a_chord_symbol_outside_the_dialect_sounds_nothing_instead_of_a_guessed_triad(name: str) -> None:
    assert _chord_pitches(name) == []


def test_a_line_pinned_where_the_flow_put_it_keeps_every_syllable_on_its_note() -> None:
    # phrases of 4 and 8 notes; one line of 9 syllables runs over both: the flow shares the syllables out by
    # phrase. Pinned on the same span (an edit in the lane pins every sung line), it must sing the same.
    head = (
        'X:1\nT:\nM:4/4\nL:1/8\nQ:1/4=100\nV: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
        'V: Ins clef=treble name="Ins Melody" snm="Inst."\nK:C\n'
    )
    score = c.from_abc(head + "% verse\nV: Vocal\nCDEF z4|CDEFGABc|\nV: Ins\nZ2|\n")
    lyrics = "[Verse]\nwalking slowly over the river"
    flowed = lyric_layout.layout(score, lyrics)
    line = flowed.parts[0].lines[0]
    pinned = lyric_layout.layout(score, lyrics, [(line.start, line.end, 0, 0)]).parts[0].lines[0]
    assert pinned.pinned and not line.pinned
    assert [(s.onset, s.text) for s in pinned.syllables] == [(s.onset, s.text) for s in line.syllables]
    assert pinned.holds == line.holds
