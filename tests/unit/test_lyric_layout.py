"""Where the lyrics are sung (owner's request 2026-10-01): lines on Vocal phrases, syllables on notes,
``w:`` lines in the notation's display text - without changing the score or the lyrics."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.core.score import canonical as c
from plenio.core.score import lyric_layout, operations

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
TRICKY = json.loads(
    (Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "tricky-score.json").read_text(
        encoding="utf-8"
    )
)["abc"]
# tricky: intro (bar 1, no Vocal notes), verse (bars 2-5: one phrase of 9 notes), chorus (bars 6-7: 2 notes)
LYRICS = "[Intro]\n\n[Verse]\nbeautiful morning\nsing it again\n\n[Chorus]\nhold on"


@pytest.mark.parametrize(
    ("word", "parts"),
    [
        ("beautiful", ["beau", "ti", "ful"]),
        ("morning", ["mor", "ning"]),
        ("children", ["chil", "dren"]),
        ("little", ["lit", "tle"]),
        ("make", ["make"]),
        ("fire,", ["fire,"]),
        ("again", ["a", "gain"]),
        ("I", ["I"]),
    ],
)
def test_words_split_at_their_vowel_groups(word: str, parts: list[str]) -> None:
    assert lyric_layout.split_word(word) == parts
    assert "".join(parts) == word


def test_lines_share_a_phrase_and_syllables_take_notes() -> None:
    placed = lyric_layout.layout(c.from_abc(TRICKY), LYRICS)
    intro, verse, chorus = placed.sections
    assert intro.lines == () and intro.phrases == ()
    first, second = verse.lines
    assert [(s.onset, s.text, s.end_of_word) for s in first.syllables] == [
        (32, "beau", False),
        (40, "ti", False),
        (48, "ful", True),
        (56, "mor", False),
        (64, "ning", True),
    ]
    assert (first.start, first.end) == (32, 96) and (second.start, second.end) == (96, 160)
    assert [s.text for s in second.syllables] == ["sing", "it", "a", "gain"]
    assert [s.text for s in chorus.lines[0].syllables] == ["hold", "on"]
    assert placed.unplaced == ()


def test_a_short_line_holds_its_last_syllable_and_a_long_one_crowds_the_last_note() -> None:
    score = c.from_abc(TRICKY)
    held = lyric_layout.layout(score, "[Intro]\n\n[Verse]\nla\n\n[Chorus]\nfar too many words here")
    verse_line = held.sections[1].lines[0]
    assert [s.text for s in verse_line.syllables] == ["la"]
    assert len(verse_line.holds) == 8 and verse_line.end == 160  # the whole phrase
    crowded = held.sections[2].lines[0].syllables
    assert [s.text for s in crowded] == ["far", "too many words here"]


def test_directions_take_no_notes_and_unknown_blocks_are_reported() -> None:
    score = c.from_abc(TRICKY)
    # four blocks for three sections: matched by tag, in order
    text = "[Verse]\n(softly)\nbeautiful\n\n[Bridge]\nnowhere\n\n[Chorus]\nhold on\n\n[Outro]\nend"
    placed = lyric_layout.layout(score, text)
    verse = placed.sections[1]
    assert verse.block == 0 and verse.lines[0].syllables == () and verse.lines[1].syllables[0].onset == 32
    assert placed.sections[0].block is None and placed.sections[2].block == 2
    assert placed.unplaced == (1, 3)  # [Bridge] and [Outro]: the score has neither
    # as many blocks as sections: in order, as YuE2 sings them, whatever their tags
    same = lyric_layout.layout(score, "[A]\none\n\n[B]\ntwo\n\n[C]\nthree")
    assert [s.block for s in same.sections] == [0, 1, 2]


def test_the_notation_shows_the_syllables_and_keeps_every_element_in_place() -> None:
    plain = operations.editor_view(TRICKY)
    sung = operations.editor_view(TRICKY, LYRICS)
    assert "lyrics" not in plain and "w:" not in plain["display_abc"]
    shown = sung["display_abc"]
    assert "w: beau-ti-ful mor-ning *\n" in shown  # the tied A's continuation is skipped
    assert "w: hold * on\n" in shown
    # every element still points at its own token in the longer display text
    by_id = {e["id"]: e for e in plain["elements"]}
    for element in sung["elements"]:
        if element["kind"] == "bar_rest":
            continue
        before = by_id[element["id"]]["display"]
        assert shown[slice(*element["display"])] == plain["display_abc"][slice(*before)]
    assert sung["lyrics"]["sections"][1]["lines"][0]["text"] == "beautiful morning"
    assert operations.editor_view(TRICKY, "") == plain


def test_a_real_plan_gets_a_w_line_for_every_sung_vocal_line() -> None:
    plan = json.loads((FIXTURES / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))["abc"]
    lyrics = "\n\n".join(
        f"[{tag}]\n" + "\n".join(f"line {i} of {tag} with some words" for i in range(4))
        for tag in ("Intro", "Verse", "Chorus", "Verse", "Chorus", "Outro")
    )
    view = operations.editor_view(plan, lyrics)
    placed = view["lyrics"]["sections"]
    assert [s["block"] for s in placed] == [0, 1, 2, 3, 4, 5]
    sung = sum(len(line["syllables"]) for s in placed for line in s["lines"])
    tokens = [
        t
        for row in view["display_abc"].splitlines()
        if row.startswith("w: ")
        for t in row[3:].replace("-", "- ").split()
        if t not in ("*", "_")
    ]
    assert sung > 0 and len(tokens) == sung


# --- the frontend's view with lyrics (frontend/tests/fixtures/tricky-lyrics.json) ------------------

LYRICS_FIXTURE = (
    Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "tricky-lyrics.json"
)


def lyrics_fixture() -> dict[str, object]:
    return json.loads(json.dumps({"lyrics": LYRICS, "view": operations.editor_view(TRICKY, LYRICS)}))


def write_lyrics_fixture() -> None:
    with LYRICS_FIXTURE.open("w", encoding="utf-8", newline="\n") as file:
        file.write(json.dumps(lyrics_fixture(), indent=1) + "\n")


def test_the_lyrics_view_fixture_is_current() -> None:
    assert json.loads(LYRICS_FIXTURE.read_text(encoding="utf-8")) == lyrics_fixture(), (
        'regenerate frontend/tests/fixtures/tricky-lyrics.json: python -c "import sys; '
        "sys.path[:0] = ['tests/unit', 'tests/support']; import test_lyric_layout as t; t.write_lyrics_fixture()\""
    )


def test_lines_placed_by_hand_take_their_spans_in_order() -> None:
    score = c.from_abc(TRICKY)
    # the verse's two lines by hand: the second first in the list (the spans are taken by their start)
    placed = lyric_layout.layout(score, LYRICS, [(80, 160), (32, 72)])
    _intro, verse, chorus = placed.sections
    first, second = verse.lines
    assert (first.start, first.end) == (32, 72) and (second.start, second.end) == (80, 160)
    assert all(32 <= s.onset < 72 for s in first.syllables)
    assert all(80 <= s.onset < 160 for s in second.syllables)
    assert "".join(s.text for s in first.syllables).replace(" ", "") == "beautifulmorning"
    # the chorus has no span: placed as before
    assert [s.text for s in chorus.lines[0].syllables] == ["hold", "on"]
    assert lyric_layout.layout(score, LYRICS).sections[2] == chorus


def test_a_span_without_notes_shows_its_line_unsung_and_lines_past_the_spans_follow() -> None:
    score = c.from_abc(TRICKY)
    # a span in another section (bar 1 is the intro) does not place the verse
    assert (
        lyric_layout.layout(score, LYRICS, [(16, 24)]).sections[1]
        == lyric_layout.layout(score, LYRICS).sections[1]
    )
    # no Vocal note starts inside 33-39: the line stands where it was put, without syllables
    first, second = lyric_layout.layout(score, LYRICS, [(33, 39)]).sections[1].lines
    assert (first.start, first.end, first.syllables) == (33, 39, ())
    # the second line follows on the notes after the span, by the rule of the module
    assert second.syllables and second.syllables[0].onset >= 39


def test_the_view_places_the_lyrics_by_the_spans() -> None:
    view = operations.editor_view(TRICKY, LYRICS, [[32, 72], [80, 160]])
    lines = view["lyrics"]["sections"][1]["lines"]
    assert [(line["start"], line["end"]) for line in lines] == [(32, 72), (80, 160)]
