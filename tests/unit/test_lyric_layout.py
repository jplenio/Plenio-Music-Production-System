"""Where the lyrics are sung (owner's requests 2026-10-01 and 2026-10-09): the lines in their order on the
Vocal notes, syllables on notes, ``w:`` lines in the notation's display text - without changing the score or
the lyrics."""

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
# tricky (L:1/32): intro (bar 1, no Vocal notes), verse (bars 2-5), chorus (bars 6-7); the Vocal line has no
# rest from bar 2 on (one phrase of 11 notes)
LYRICS = "[Intro]\n\n[Verse]\nbeautiful morning\nsing it again\n\n[Chorus]\nhold on"

HEAD = """X:1
T:
M:4/4
L:1/8
Q:1/4=100
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
"""


def section(label: str, vocal: str) -> str:
    bars = vocal.count("|")
    return f"% {label}\nV: Vocal\n{vocal}\nV: Ins\n{'C8|' * bars}\n"


def first_onsets(placed: lyric_layout.LyricLayout) -> dict[tuple[int, int], int | None]:
    """``(block, line)`` -> the onset of the line's first syllable (``None``: no note sings it)."""
    return {
        (line.block, line.line): line.syllables[0].onset if line.syllables else None
        for line in placed.lines()
    }


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


def test_lines_take_the_notes_in_order_and_syllables_take_notes() -> None:
    placed = lyric_layout.layout(c.from_abc(TRICKY), LYRICS)
    intro, verse, chorus = placed.parts
    # the empty [Intro] has the intro's bar (the lane can give it words there), the verse its lines
    assert (intro.block, intro.start, intro.end, intro.lines) == (0, 0, 32, ())
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
    # the parts cover the score one after the other
    assert (verse.start, verse.end, chorus.start, chorus.end) == (32, 160, 160, 224)
    assert verse.phrases == ((32, 160),) and chorus.phrases == ((160, 224),)  # the phrase, cut at the part
    assert placed.unplaced == () and placed.unsung == ()


def test_the_blocks_follow_the_melody_whatever_the_sections_are_called() -> None:
    # owner's report 2026-10-09: the plan's intro ends with the verse's first word, and its chorus section
    # sings the chorus and the outro - the words stood on the notes of other lines
    abc = HEAD + section("intro", "z6 G2|") + section("verse", "CDEF z4|CDEF z4|")
    abc += section("chorus", "cBAG z4|cBAG z4|GABc z4|")
    text = "[Verse]\nI walk alone\nla la la la\n\n[Chorus]\nhold on now\n\n[Outro]\nlet it go now\nbye"
    placed = lyric_layout.layout(c.from_abc(abc), text)
    assert first_onsets(placed) == {
        (0, 0): 6,  # on the pickup in the intro's bar
        (0, 1): 16,
        (1, 0): 24,  # where the chorus section starts
        (1, 1 - 1): 24,
        (2, 0): 32,  # the outro right after the chorus, inside its section
        (2, 1): 40,
    }
    assert [(p.tag, p.start, p.end) for p in placed.parts] == [
        ("Verse", 0, 24),
        ("Chorus", 24, 32),
        ("Outro", 32, 48),
    ]
    # renamed sections (as Match Song Form did before 0.5.0) do not move the words
    renamed = abc.replace("% intro", "% verse").replace("% verse\nV: Vocal\nCDEF", "% chorus\nV: Vocal\nCDEF")
    renamed = renamed.replace("% chorus\nV: Vocal\ncBAG", "% outro\nV: Vocal\ncBAG")
    assert first_onsets(lyric_layout.layout(c.from_abc(renamed), text)) == first_onsets(placed)


def test_notes_no_block_sings_are_left_and_a_block_sings_on_in_the_next_section() -> None:
    # the intro's two notes are ad-libs (the lyrics have no intro); the second verse goes into the section
    # the plan called bridge, the chorus into the chorus
    abc = HEAD + section("intro", "GA z6|") + section("verse", "CDEF z4|CDEF z4|")
    abc += section("bridge", "cBAG z4|") + section("chorus", "cBAG z4|")
    text = "[Verse]\nla la la la\nlo lo lo lo\n\n[Verse]\nmi mi mi mi\n\n[Chorus]\nhold on to me"
    placed = lyric_layout.layout(c.from_abc(abc), text)
    assert first_onsets(placed) == {(0, 0): 8, (0, 1): 16, (1, 0): 24, (2, 0): 32}
    assert 0 not in placed.syllables() and 1 not in placed.syllables()


def test_a_short_line_holds_its_last_syllable_and_a_long_one_shares_notes() -> None:
    score = c.from_abc(
        HEAD + section("verse", "CDEF z4|") + section("chorus", "cB z6|") + section("bridge", "GABc z4|")
    )
    held = lyric_layout.layout(
        score, "[Verse]\nla la\n\n[Chorus]\nfar too many words here\n\n[Bridge]\none two three four"
    )
    verse_line = held.parts[0].lines[0]
    assert [s.text for s in verse_line.syllables] == ["la", "la"]
    assert verse_line.holds == (2, 3) and verse_line.end == 4  # the whole phrase
    # six syllables on two notes: a word's syllables together first, then neighbours, spread over the notes
    # (owner's report 2026-10-08: the rest of a line piled up on its last note)
    crowded = held.parts[1].lines[0].syllables
    assert [s.text for s in crowded] == ["far too many", "words here"]
    assert [lyric_layout.w_token(s) for s in crowded] == ["far~too~many", "words~here"]


def test_directions_take_no_notes() -> None:
    score = c.from_abc(TRICKY)
    placed = lyric_layout.layout(score, "[Verse]\n(softly)\nbeautiful\n\n[Chorus]\nhold on")
    direction, word = placed.parts[0].lines
    assert direction.syllables == () and (direction.start, direction.end) == (0, 0)
    assert word.syllables[0].onset == 32
    assert placed.unsung == ()  # a direction is no lyric line no note sings


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
    assert sung["lyrics"]["parts"][1]["lines"][0]["text"] == "beautiful morning"
    assert operations.editor_view(TRICKY, "") == plain


def test_a_real_plan_gets_a_w_line_for_every_sung_vocal_line() -> None:
    plan = json.loads((FIXTURES / "cover" / "yue2-take-y3.json").read_text(encoding="utf-8"))["abc"]
    lyrics = "\n\n".join(
        f"[{tag}]\n" + "\n".join(f"line {i} of {tag} with some words" for i in range(4))
        for tag in ("Verse", "Chorus", "Verse", "Chorus", "Outro")
    )
    view = operations.editor_view(plan, lyrics)
    placed = view["lyrics"]["parts"]
    assert [p["block"] for p in placed] == [0, 1, 2, 3, 4]
    sung = sum(len(line["syllables"]) for p in placed for line in p["lines"])
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


# --- lines placed by hand -------------------------------------------------------------------------


def test_lines_placed_by_hand_stand_on_their_spans_and_the_others_flow_around_them() -> None:
    score = c.from_abc(TRICKY)
    # the verse's second line by hand (the list need not be in order)
    placed = lyric_layout.layout(score, LYRICS, [(80, 160, 1, 1), (32, 72, 1, 0)])
    _intro, verse, chorus = placed.parts
    first, second = verse.lines
    assert (first.start, first.end, first.pinned) == (32, 72, True)
    assert (second.start, second.end, second.pinned) == (80, 160, True)
    assert all(32 <= s.onset < 72 for s in first.syllables)
    assert all(80 <= s.onset < 160 for s in second.syllables)
    assert "".join(s.text for s in first.syllables).replace(" ", "") == "beautifulmorning"
    # the chorus has no span: placed as before
    assert [s.text for s in chorus.lines[0].syllables] == ["hold", "on"] and not chorus.lines[0].pinned
    assert lyric_layout.layout(score, LYRICS).parts[2] == chorus
    # one line by hand: the lines after it take the notes after its span
    one = lyric_layout.layout(score, LYRICS, [(32, 104, 1, 0)])
    assert first_onsets(one)[(1, 1)] == 104 and first_onsets(one)[(2, 0)] == 160


def test_spans_kept_without_their_line_belong_to_their_section() -> None:
    # Plenio 0.4.4 and 0.4.5 kept [start, end]: the section's lyrics block takes them in order
    score = c.from_abc(TRICKY)
    legacy = lyric_layout.layout(score, LYRICS, [(80, 160), (32, 72)])
    assert legacy == lyric_layout.layout(score, LYRICS, [(32, 72, 1, 0), (80, 160, 1, 1)])
    # a span in a section without words places nothing
    assert lyric_layout.layout(score, LYRICS, [(16, 24)]) == lyric_layout.layout(score, LYRICS)


def test_a_span_without_notes_shows_its_line_unsung_and_spans_out_of_order_are_left_out() -> None:
    score = c.from_abc(TRICKY)
    # no Vocal note starts inside 33-39: the line stands where it was put, without syllables
    placed = lyric_layout.layout(score, LYRICS, [(33, 39, 1, 0)])
    first, second = placed.parts[1].lines
    assert (first.start, first.end, first.syllables, first.pinned) == (33, 39, (), True)
    assert placed.unsung == (("Verse", ("beautiful morning",)),)
    # the second line follows on the notes after the span, by the rule of the module
    assert second.syllables and second.syllables[0].onset >= 39
    # a chorus line placed before the verse's: the later span in the lyrics' order is left out
    crossed = lyric_layout.layout(score, LYRICS, [(96, 160, 1, 0), (32, 64, 2, 0)])
    assert [line.pinned for line in crossed.lines()] == [True, False, False]
    # a span of a line the lyrics do not have is left out
    assert lyric_layout.layout(score, LYRICS, [(32, 64, 1, 7), (32, 64, 9, 0)]) == lyric_layout.layout(
        score, LYRICS
    )


def test_the_view_places_the_lyrics_by_the_spans() -> None:
    view = operations.editor_view(TRICKY, LYRICS, [[32, 72, 1, 0], [80, 160, 1, 1]])
    lines = view["lyrics"]["parts"][1]["lines"]
    assert [(line["start"], line["end"], line["pinned"]) for line in lines] == [
        (32, 72, True),
        (80, 160, True),
    ]


# --- the rules inside a block ---------------------------------------------------------------------


def test_a_long_line_runs_on_over_the_next_phrase_instead_of_crowding_a_short_one() -> None:
    # owner's report 2026-10-08: lines crammed onto two or three notes while other phrases stayed empty.
    # Phrases of 4, 8 and 4 notes; a line of 14 syllables and one of 3.
    score = c.from_abc(HEAD + "% verse\nV: Vocal\nCDEF z4|CDEFGABc|z4 CDEF|\nV: Ins\nZ3|\n")
    placed = lyric_layout.layout(
        score, "[Verse]\nwalking along the river where the water meets the light\nhold me now"
    )
    first, second = placed.parts[0].lines
    assert [s.onset for s in first.syllables] == [0, 1, 2, 3, *range(8, 16)]  # both phrases, a note each
    # the two syllables too many share a note with the other syllable of their word
    assert [s.text for s in first.syllables if " " not in s.text][-8:] == [
        "the",
        "river",
        "where",
        "the",
        "water",
        "meets",
        "the",
        "light",
    ]
    assert [s.text for s in second.syllables] == ["hold", "me", "now"] and second.holds == (23,)
    assert second.start == 20  # the last phrase is sung, not left empty


def test_fewer_lines_than_phrases_spread_over_them() -> None:
    score = c.from_abc(HEAD + "% verse\nV: Vocal\nCDEF z4|CDEF z4|CDEF z4|CDEF z4|\nV: Ins\nZ4|\n")
    placed = lyric_layout.layout(score, "[Verse]\nla la la la la la la la\nlo lo lo lo lo lo lo lo")
    lines = placed.parts[0].lines
    assert [len(line.syllables) for line in lines] == [8, 8] and all(not line.holds for line in lines)
    assert len(placed.syllables()) == 16  # every sung note has its syllable


def test_a_rest_of_an_eighth_splits_phrases() -> None:
    # renders start a line after an eighth rest about as often as after a longer one (study 2026-10-09)
    score = c.from_abc(HEAD + section("verse", "CDEF z GAB|cdef z gab|"))
    placed = lyric_layout.layout(score, "[Verse]\nla la la la\nlo lo lo\nmi mi mi mi\nmo mo mo")
    assert [line.syllables[0].onset for line in placed.lines()] == [0, 5, 8, 13]


def test_a_line_over_two_phrases_breaks_after_its_comma() -> None:
    # owner's report 2026-10-08: "... Sommersprossen, von / Kopf bis zu den Flossen" - the next words
    # started on the last note of a phrase
    score = c.from_abc(HEAD + "% verse\nV: Vocal\nCDEF z4|CDEF z4|\nV: Ins\nZ2|\n")
    line = lyric_layout.layout(score, "[Verse]\nhold me close, my dear one").parts[0].lines[0]
    assert [s.text for s in line.syllables] == ["hold", "me", "close,", "my", "dear", "one"]
    assert [s.onset for s in line.syllables] == [0, 1, 2, 8, 9, 10]  # "my" starts the second phrase
    assert line.holds == (3, 11)
    # never inside a word when a word boundary will do
    word = lyric_layout.layout(score, "[Verse]\nla la beautiful la la").parts[0].lines[0]
    onsets = [s.onset for s in word.syllables if s.text.replace("la", "").strip()]
    assert onsets and (max(onsets) < 4 or min(onsets) >= 8)  # "beautiful" in one phrase


def test_german_lyrics_are_split_by_the_german_rules() -> None:
    # owner's report 2026-10-08: "beide" and "deine" were one syllable, "vers-chos-sen" split as English
    score = c.from_abc(HEAD + "% verse\nV: Vocal\nCDEFGABc|d z z2 z4|\nV: Ins\nZ2|\n")
    line = lyric_layout.layout(score, "[Verse]\nIch und du, wir beide verschossen").parts[0].lines[0]
    assert [s.text for s in line.syllables] == [
        "Ich",
        "und",
        "du,",
        "wir",
        "bei",
        "de",
        "ver",
        "schos",
        "sen",
    ]
    english = lyric_layout.layout(score, "[Verse]\nthe stone and the time you make").parts[0].lines[0]
    assert "stone" in [s.text for s in english.syllables]  # an English silent e stays silent


def test_no_line_is_lost_what_no_note_sings_follows_the_music() -> None:
    # owner's report 2026-10-08: lyrics the plan has no notes for were missing from the sheet music
    score = c.from_abc(HEAD + section("verse", "CDEF z4|") + section("outro", "z8|"))
    text = "[Verse]\nla la la la\n\n[Bridge]\nnowhere 100% here\n(softly)\n\n[Outro]\nend"
    placed = lyric_layout.layout(score, text)
    assert placed.unsung == (
        ("Bridge", ("nowhere 100% here",)),  # the notes ran out; the direction is left out
        ("Outro", ("end",)),  # the outro has no Vocal notes
    )
    assert placed.unplaced == (1, 2)
    # a block no note sings gets the next section of its kind (the lane can give it words there)
    assert [(p.tag, p.start, p.end) for p in placed.parts] == [("Verse", 0, 8), ("Outro", 8, 16)]
    view = operations.editor_view(HEAD + section("verse", "CDEF z4|") + section("outro", "z8|"), text)
    assert view["display_abc"].endswith(
        "W:\nW: Lyrics without notes in this score:\nW:\nW: [Bridge]\nW: nowhere 100％ here\n"
        "W:\nW: [Outro]\nW: end\n"
    )
    assert view["lyrics"]["unsung"][1] == {"tag": "Outro", "lines": ["end"]}
    # every sung line on notes: nothing follows the music
    assert lyric_layout.layout(c.from_abc(TRICKY), LYRICS).unsung == ()
    assert "W:" not in operations.editor_view(TRICKY, LYRICS)["display_abc"]


def test_pickups_are_the_notes_that_lead_into_the_next_section() -> None:
    abc = HEAD + section("intro", "z6 G2|") + section("verse", "CDEF z4|") + section("chorus", "z4 cBAG|")
    assert lyric_layout.pickups(c.from_abc(abc)) == {6}  # the chorus's notes start after a rest: no pickup
