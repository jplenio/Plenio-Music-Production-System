"""Notes fitted to the lyrics: the text decides, the melody stays the song's, nothing clashes (``note_repair``)."""

from __future__ import annotations

from typing import Any

import pytest

from plenio.core.arrangement import harmony
from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical, lyric_layout, note_repair, operations

HEAD = (
    "X:1\nT:\nM:4/4\nL:1/8\nQ:1/4=100\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
    "K:C\n"
)


def _song(*sections: tuple[str, str, str]) -> str:
    """Sections ``(label, vocal, ins)``; a label starts a section with both voices of the same bars."""
    text = HEAD
    for label, vocal, ins in sections:
        text += f"% {label}\nV: Vocal\n{vocal}\nV: Ins\n{ins}\n"
    return text


REST4 = "z8|z8|z8|z8|"
VERSE = '"C"E2 G2 c4|"F"A4 F4|"G"G2 B2 d4|"C"c8|'
CHORUS = '"Am"A2 c2 e4|"F"f4 c4|"C"e2 d2 c4|"G"d8|'
SONG = _song(
    ("verse", VERSE, REST4), ("chorus", CHORUS, REST4), ("verse", VERSE, REST4), ("chorus", CHORUS, REST4)
)


def _lyrics(*blocks: tuple[str, list[str]]) -> str:
    return "\n\n".join(f"[{tag}]\n" + "\n".join(lines) for tag, lines in blocks)


def _counts(abc: str, lyrics: str) -> list[dict[str, Any]]:
    return note_repair.mismatches(canonical.from_abc(abc), lyrics)


def _fit(abc: str, lyrics: str, **extra: Any) -> Any:
    return operations.apply(abc, {"op": "fit_notes", "lyrics": lyrics, **extra})


def _clashes(score: canonical.Score, notes: Any) -> list[canonical.Note]:
    style = note_repair._style(score, "")
    return [n for n in notes if not note_repair._fits(score, n, style.tensions)]


FITS = _lyrics(
    ("verse", ["sing a morning song", "over the river wide"]),
    ("chorus", ["hold on to the light", "never let it go"]),
    ("verse", ["walk along the road", "under the silver moon"]),
    ("chorus", ["hold on to the light", "never let it go"]),
)
"""Lines of about the song's notes: what the tests then lengthen or shorten."""


def _adapted() -> tuple[str, str]:
    """The song and lyrics whose lines all fit it: every line exactly as many syllables as it has notes."""
    score = canonical.from_abc(SONG)
    placed = lyric_layout.layout(score, FITS)
    assert placed.parts
    return SONG, FITS


def test_a_line_with_too_many_syllables_gets_notes_on_its_chords() -> None:
    lyrics = _lyrics(("verse", ["la la la la la la la la la", "la la la la"]))
    abc = _song(("verse", VERSE, REST4))
    before = canonical.from_abc(abc)
    assert _counts(abc, lyrics)
    done = _fit(abc, lyrics)
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, lyrics) == []
    assert after.measure_count == before.measure_count
    assert after.chords == before.chords
    assert _clashes(after, after.vocal) == []
    assert done.select
    assert "added" in done.changes[0]
    # the voice stays one line
    notes = sorted(after.vocal, key=lambda n: n.onset)
    assert all(a.end <= b.onset for a, b in zip(notes, notes[1:], strict=False))


def test_a_line_with_too_few_syllables_loses_the_notes_that_carry_least() -> None:
    lyrics = _lyrics(("verse", ["la la", "la la"]))
    abc = _song(("verse", '"C"C D E F G A B c|"C"c8|"C"E F G A G F E D|"C"C8|', REST4))
    done = _fit(abc, lyrics, surplus="omit")
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, lyrics) == []
    assert len(after.vocal) == 4
    assert "left out" in done.changes[0]
    # what starts a bar stays while something else can go
    assert {0, 16} <= {n.onset for n in after.vocal}


def test_notes_are_kept_only_as_long_as_they_do_not_clash_when_held() -> None:
    abc = _song(("verse", '"C"c2 d2 e2 f2|"Dm"f8|z8|z8|', REST4))
    done = _fit(abc, _lyrics(("verse", ["la la"])))
    after = canonical.from_abc(done.abc)
    assert _clashes(after, after.vocal) == []
    assert _counts(done.abc, _lyrics(("verse", ["la la"]))) == []


def test_surplus_goes_to_the_instrument_where_it_is_silent() -> None:
    lyrics = _lyrics(("verse", ["la la la"]))
    abc = _song(("verse", '"C"E2 G2 c2 G2|"F"A2 F2 A2 c2|z8|z8|', REST4))
    done = _fit(abc, lyrics, surplus="ins")
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, lyrics) == []
    assert len(after.vocal) == 3
    assert len(after.ins) == 5
    assert "moved to the Ins" in done.changes[0]
    # all together it is still the same melody
    before = canonical.from_abc(abc)
    assert sorted((n.onset, n.pitch) for n in [*after.vocal, *after.ins]) == sorted(
        (n.onset, n.pitch) for n in before.vocal
    )


def test_a_busy_instrument_line_is_not_overwritten() -> None:
    lyrics = _lyrics(("verse", ["la la la"]))
    abc = _song(("verse", '"C"E2 G2 c2 G2|"F"A2 F2 A2 c2|z8|z8|', "C8|F8|z8|z8|"))
    done = _fit(abc, lyrics, surplus="ins")
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, lyrics) == []
    assert [n.pitch for n in after.ins] == [n.pitch for n in canonical.from_abc(abc).ins]


def test_notes_no_line_sings_follow_the_surplus_choice() -> None:
    lyrics = _lyrics(("verse", ["la la la la"]))
    abc = _song(("verse", '"C"E2 G2 c4|"F"A4 F4|z8|"C"E2 G2 E2 C2|', REST4))
    # the line's fifth note goes (auto) or moves along (ins); the phrase no line sings moves unless told otherwise
    for surplus, ins in (("omit", 0), ("auto", 4), ("ins", 5)):
        done = _fit(abc, lyrics, surplus=surplus)
        after = canonical.from_abc(done.abc)
        assert len(after.ins) == ins, surplus
        assert len(after.vocal) == 4, surplus


def test_only_the_lines_of_the_selection_change() -> None:
    lyrics = _lyrics(("verse", ["la la la la la la la", "la la la la la la la la"]))
    abc = _song(("verse", '"C"E2 G2 c4|"F"A4 F4|z8|"G"G2 B2 d4|', REST4))
    score = canonical.from_abc(abc)
    done = _fit(abc, lyrics, start=0, end=16)
    after = canonical.from_abc(done.abc)
    assert [n for n in after.vocal if n.onset >= 24] == [n for n in score.vocal if n.onset >= 24]
    assert len([n for n in after.vocal if n.onset < 16]) > len([n for n in score.vocal if n.onset < 16])


def test_a_repeated_section_gets_the_same_repair() -> None:
    line = "la la la la la la la"
    abc = SONG
    lyrics = _lyrics(("verse", [line]), ("chorus", [line]), ("verse", [line]), ("chorus", [line]))
    done = _fit(abc, lyrics)
    after = canonical.from_abc(done.abc)

    def bar_notes(first: int, last: int) -> list[tuple[int, int, int]]:
        start = first * 8
        return [(n.onset - start, n.duration, n.pitch) for n in after.vocal if start <= n.onset < last * 8]

    assert _counts(done.abc, lyrics) == []
    assert bar_notes(0, 4) == bar_notes(8, 12)
    assert bar_notes(4, 8) == bar_notes(12, 16)


def test_the_songs_own_melody_is_taken_where_it_fits() -> None:
    """The first verse has the two notes the second one lacks."""
    full = '"C"E G A G c2 G2|"F"A4 F4|'
    thin = '"C"E2 A2 c2 G2|"F"A4 F4|'
    abc = _song(("verse", full, "z8|z8|"), ("verse", thin, "z8|z8|"))
    lyrics = _lyrics(("verse", ["la la la la la la la la"]), ("verse", ["la la la la la la la la"]))
    assert len(_counts(abc, lyrics)) == 1
    done = _fit(abc, lyrics)
    after = canonical.from_abc(done.abc)
    first = [(n.onset, n.duration, n.pitch) for n in after.vocal if n.onset < 16]
    second = [(n.onset - 16, n.duration, n.pitch) for n in after.vocal if n.onset >= 16]
    assert first == second
    assert "song's own melody" in done.changes[0]


def test_a_line_without_notes_gets_a_phrase_in_the_free_bars() -> None:
    lyrics = _lyrics(("verse", ["la la la la", "sing it once again"]))
    abc = _song(("verse", '"C"E2 G2 c4|"F"A4 F4|"G"z8|"C"z8|', REST4))
    done = _fit(abc, lyrics)
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, lyrics) == []
    assert len(after.vocal) > 4
    assert _clashes(after, after.vocal) == []
    assert "new phrase" in done.changes[0]


def test_no_room_is_said_and_nothing_is_invented() -> None:
    lyrics = _lyrics(("verse", ["la " * 40]))
    abc = _song(("verse", '"C"E8|', "z8|"))
    done = _fit(abc, lyrics)
    assert any("no room" in w for w in done.warnings)


def test_new_notes_stay_in_the_song_key_without_chords() -> None:
    abc = _song(("verse", "E2 G2 c4|A4 F4|G2 B2 d4|c8|", REST4))
    lyrics = _lyrics(("verse", ["la " * 12]))
    after = canonical.from_abc(_fit(abc, lyrics).abc)
    assert all(n.pitch % 12 in harmony.key_of("C").scale for n in after.vocal)


def test_new_notes_do_not_grind_against_the_instrument_line() -> None:
    abc = _song(("verse", '"C"c8|"C"c8|', "C2 E2 G2 c2|G2 E2 C2 E2|"))
    done = _fit(abc, _lyrics(("verse", ["la la la la la la la la"])))
    after = canonical.from_abc(done.abc)
    assert _counts(done.abc, _lyrics(("verse", ["la la la la la la la la"]))) == []
    new = [n for n in after.vocal if n.pitch != 72]
    for note in new:
        for other in after.ins:
            if other.onset < note.end and other.end > note.onset:
                assert (note.pitch - other.pitch) % 12 not in {1, 11, 6}


def test_a_new_note_stays_in_the_key_also_where_the_genre_allows_a_colour() -> None:
    """A sixth over a minor chord may be a tension, but F sharp over A minor is outside C major."""
    abc = _song(("chorus", '"Am"A2 c2 e4|"F"f4 c4|"C"e2 d2 c4|"G"d8|', REST4))
    done = _fit(abc, _lyrics(("chorus", ["hold on to the light tonight now", "never let it go and stay"])))
    after = canonical.from_abc(done.abc)
    assert all(n.pitch % 12 in harmony.key_of("C").scale for n in after.vocal)


def test_a_warning_speaks_of_what_is_still_off_at_the_end() -> None:
    abc = _song(("verse", '"C"E2 G2 c4|"F"A4 F4|"G"G2 B2 d4|"C"c8|', REST4))
    lyrics = _lyrics(("verse", ["la la la la la la la la", "stay"]))
    done = _fit(abc, lyrics)
    assert _counts(done.abc, lyrics) == []
    assert done.warnings == ()


def test_a_second_run_changes_nothing() -> None:
    lyrics = _lyrics(("verse", ["la la la la la la la", "la la la"]))
    abc = _song(("verse", VERSE, REST4))
    once = _fit(abc, lyrics)
    twice = _fit(once.abc, lyrics)
    assert twice.abc == once.abc
    assert twice.changes == ("the notes already fit the lyrics here",)


def test_the_same_score_and_text_give_the_same_notes() -> None:
    lyrics = _lyrics(
        ("verse", ["la la la la la la la", "la la la"]), ("chorus", ["la la", "la la la la la la la la la"])
    )
    assert _fit(SONG, lyrics).abc == _fit(SONG, lyrics).abc


def test_hand_placed_lines_keep_to_their_span() -> None:
    lyrics = _lyrics(("verse", ["la la la la la la"]))
    abc = _song(("verse", '"C"E2 G2 c4|"F"A4 F4|z8|z8|', REST4))
    done = _fit(abc, lyrics, spans=[[0, 12, 0, 0]])
    after = canonical.from_abc(done.abc)
    assert all(
        n.onset < 12 or n.onset >= 12 and n.pitch == canonical.from_abc(abc).vocal[-1].pitch
        for n in after.vocal
    )


def test_it_needs_lyrics_and_a_valid_choice() -> None:
    with pytest.raises(PlenioValidationError):
        operations.apply(SONG, {"op": "fit_notes", "lyrics": ""})
    with pytest.raises(PlenioValidationError):
        _fit(SONG, FITS, surplus="elsewhere")


def test_the_bars_stay_where_they_are() -> None:
    done = _fit(SONG, _lyrics(("verse", ["la " * 9])))
    assert done.time_map is None
