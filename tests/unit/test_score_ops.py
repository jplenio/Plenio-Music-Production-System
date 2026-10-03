"""Edit operations on the canonical score (next-release plan §9.6) and their guarantees.

Every committed edit gives a valid score whose text passes the upstream parser and re-parses
to the same model; deletion keeps every measure's length (a rest takes the note's place);
edits rewrite only the lines whose measures changed; a refused edit changes nothing.
"""

from __future__ import annotations

import json
from dataclasses import replace
from pathlib import Path

import pytest
from hypothesis import HealthCheck, settings
from hypothesis import strategies as st
from hypothesis.stateful import RuleBasedStateMachine, initialize, invariant, rule

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.score import ops
from plenio.core.score.canonical import ChordSymbol, KeyChange, Note, Section
from plenio.third_party import yue2_abc_tools as upstream
from score_strategies import CHORDS, KEYS, LABELS, scores, texts

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
MINIMAX = json.loads((FIXTURES / "cover" / "minimax-excerpt.json").read_text(encoding="utf-8"))["abc"]
HEADER = (
    "X:1\nT:\nM:4/4\nL:1/16\nQ:1/4=90\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
)
SMALL = (
    HEADER
    + "K:C\n% verse\nV: Vocal\n"
    + '"C"c4d4e4f4|"G"g8z8|\nV: Ins\nC,16|Z|\n'
    + "% chorus\nV: Vocal\n"
    + '"F"a4-a4g8|f16|\nV: Ins\nZ2|\n'
)


def score_of(text: str) -> c.Score:
    return c.from_abc(text)


def lines_changed(before: str, after: str) -> list[int]:
    a, b = before.split("\n"), after.split("\n")
    assert len(a) == len(b)
    return [i for i, (x, y) in enumerate(zip(a, b, strict=True)) if x != y]


def run(text: str, **operation: object) -> tuple[str, ops.OpResult]:
    result = ops.transform(text, operation)
    upstream.parse_abc(result.abc)
    assert c.from_abc(result.abc) == result.result.score
    return result.abc, result.result


# --- deletion ---------------------------------------------------------------------------------


def test_delete_leaves_a_rest_of_the_same_length_and_touches_one_line() -> None:
    abc, result = run(SMALL, op="delete", ids=["vocal:4"])
    assert abc.split("\n")[10] == '"C"c4z4e4f4|"G"g8z8|'
    assert lines_changed(SMALL, abc) == [10]
    assert result.changes == ("bar 1 Vocal: D5 -> rest",)
    before, after = upstream.parse_abc(SMALL), upstream.parse_abc(abc)
    assert after.voices["Vocal"].bars == before.voices["Vocal"].bars  # every measure keeps its length


def test_delete_a_tied_note_and_a_chord_together() -> None:
    abc, result = run(SMALL, op="delete", ids=["vocal:32", "chord:32"])
    assert abc.split("\n")[15] == "z8g8|f16|"
    assert len(result.changes) == 2


def test_delete_everything_in_a_measure_gives_a_full_measure_rest() -> None:
    abc, _ = run(SMALL, op="delete", ids=["ins:0"])
    assert abc.split("\n")[12] == "Z2|"


def test_delete_and_close_gap_extends_only_an_adjacent_note() -> None:
    abc, result = run(SMALL, op="delete_close_gap", ids=["vocal:4"])
    assert abc.split("\n")[10] == '"C"c8e4f4|"G"g8z8|'
    assert "now lasts 8 units" in result.changes[0]
    assert result.select == ("vocal:0",)
    # no note ends where g5 (onset 16) starts? f4 ends at 16, so it is extended across the bar line
    abc, result = run(SMALL, op="delete_close_gap", ids=["vocal:16"])
    assert abc.split("\n")[10] == '"C"c4d4e4f4-|"G"f8z8|'
    # a note after a rest has no adjacent note: the gap stays a rest, and the change log says why
    abc, result = run(SMALL, op="delete_close_gap", ids=["vocal:32"])
    assert "gap stays a rest" in result.changes[0]
    assert abc.split("\n")[15] == '"F"z8g8|f16|'


# --- insert, move, resize ---------------------------------------------------------------------


def test_insert_overwrites_inside_its_voice_and_keeps_the_outer_parts() -> None:
    abc, result = run(SMALL, op="insert_note", track="vocal", onset=2, duration=8, pitch=79)
    assert abc.split("\n")[10] == '"C"c2g8e2f4|"G"g8z8|'
    assert result.select == ("vocal:2",)
    assert any("overwritten" in w for w in result.warnings)
    notes = c.from_abc(abc).vocal[:4]
    assert notes == (Note(0, 2, 72), Note(2, 8, 79), Note(10, 2, 76), Note(12, 4, 77))


def test_insert_across_a_bar_line_is_tied() -> None:
    abc, _ = run(SMALL, op="insert_note", track="ins", onset=8, duration=16, pitch=50)
    assert abc.split("\n")[12] == "C,8D,8-|D,8z8|"


def test_move_is_delete_then_insert_and_can_change_the_voice() -> None:
    abc, result = run(SMALL, op="move_notes", ids=["vocal:8"], delta=16, semitones=-12, track="ins")
    lines = abc.split("\n")
    assert lines[10] == '"C"c4d4z4f4|"G"g8z8|'
    assert lines[12] == "C,16|z8E4z4|"
    assert result.select == ("ins:24",)


def test_move_out_of_the_score_is_refused() -> None:
    with pytest.raises(PlenioValidationError, match="leave the score"):
        ops.transform(SMALL, {"op": "move_notes", "ids": ["vocal:0"], "delta": -1})


def test_resize_into_rests_only_or_overwrite() -> None:
    abc, _ = run(SMALL, op="resize_note", id="vocal:16", duration=16)
    assert abc.split("\n")[10] == '"C"c4d4e4f4|"G"g16|'
    with pytest.raises(PlenioValidationError, match="Only 0 units of rest"):
        ops.transform(SMALL, {"op": "resize_note", "id": "vocal:0", "duration": 8})
    abc, result = run(SMALL, op="resize_note", id="vocal:0", duration=8, mode="overwrite")
    assert abc.split("\n")[10] == '"C"c8e4f4|"G"g8z8|'
    assert result.warnings
    abc, _ = run(SMALL, op="resize_note", id="vocal:16", duration=4)  # shrinking leaves a rest
    assert abc.split("\n")[10] == '"C"c4d4e4f4|"G"g4z12|'


def test_pitch_split_join_and_fill_rest() -> None:
    abc, _ = run(SMALL, op="set_note_pitch", ids=["vocal:0", "vocal:4"], semitones=1)
    assert abc.split("\n")[10] == '"C"^c4^d4e4f4|"G"g8z8|'
    abc, result = run(SMALL, op="split_note", id="vocal:16", at=20)
    assert abc.split("\n")[10] == '"C"c4d4e4f4|"G"g4g4z8|'
    assert result.select == ("vocal:16", "vocal:20")
    joined, _ = run(abc, op="join_notes", ids=["vocal:16", "vocal:20"])
    assert joined == SMALL
    with pytest.raises(PlenioValidationError, match="not adjacent"):
        ops.transform(SMALL, {"op": "join_notes", "ids": ["vocal:0", "vocal:4"]})
    abc, _ = run(SMALL, op="fill_rest", track="vocal", onset=24)
    assert abc.split("\n")[10] == '"C"c4d4e4f4|"G"g8g8|'


def test_a_tied_note_changes_as_one_sounding_note() -> None:
    abc, _ = run(SMALL, op="set_note_pitch", ids=["vocal:32"], midi=70)
    assert abc.split("\n")[15] == '"F"^A8g8|f16|'  # A#4, spelled for the key (C: sharps first)


def test_quantize_puts_starts_and_lengths_on_the_grid() -> None:
    loose = SMALL.replace('"C"c4d4e4f4|', '"C"c3d4-de4f4|')
    abc, result = run(loose, op="quantize", ids=["vocal:3"], grid=4)
    vocal = score_of(abc).vocal
    d = next(n for n in vocal if n.pitch == score_of(SMALL).vocal[1].pitch)
    assert (d.onset, d.duration) == (4, 5)  # the start on the grid, the length kept
    assert result.changes == ("quantized 1 note (starts) to 4 units",)
    abc, _ = run(loose, op="quantize", ids=["vocal:3"], grid=4, lengths=True)
    d = next(n for n in score_of(abc).vocal if n.pitch == score_of(SMALL).vocal[1].pitch)
    assert (d.onset, d.duration) == (4, 4)
    # notes already on the grid: nothing changes
    result = ops.transform(SMALL, {"op": "quantize", "ids": ["vocal:0", "vocal:4"], "grid": 4})
    assert result.abc == SMALL and result.result.changes == ("already on the grid",)


def test_place_notes_records_into_one_voice_replacing_or_merging() -> None:
    # SMALL's verse Vocal: c4 d4 e4 f4 | g8 z8 (L:1/16, 16 units a bar)
    played = [
        {"onset": 4, "duration": 6, "pitch": 74},
        {"onset": 8, "duration": 4, "pitch": 76},
        {"onset": 8, "duration": 4, "pitch": 72},
    ]
    abc, result = run(SMALL, op="place_notes", track="vocal", notes=played, label="recorded")
    vocal = score_of(abc).vocal
    # merge: the old c stays, the new notes overwrite their spans; a chord gives its highest note and the
    # first note is cut where the next one starts
    assert [(n.onset, n.duration, n.pitch) for n in vocal[:3]] == [(0, 4, 72), (4, 4, 74), (8, 4, 76)]
    assert result.changes == ("recorded 2 notes in Vocal (bar 1)",)
    # replace: everything the voice played in the range goes (bars 1-2), only the new notes remain there
    abc, result = run(
        SMALL, op="place_notes", track="vocal", notes=played[:1], clear=[0, 32], label="recorded"
    )
    vocal = score_of(abc).vocal
    assert [(n.onset, n.pitch) for n in vocal if n.onset < 32] == [(4, 74)]
    assert "replaced" in result.changes[0]
    with pytest.raises(PlenioValidationError):
        ops.transform(
            SMALL,
            {"op": "place_notes", "track": "vocal", "notes": [{"onset": 0, "duration": 0, "pitch": 60}]},
        )


# --- chords -----------------------------------------------------------------------------------


def test_selected_chord_symbols_move_by_semitones_with_the_notes() -> None:
    abc, result = run(SMALL, op="set_note_pitch", ids=["chord:0", "vocal:0", "chord:32"], semitones=2)
    after = score_of(abc)
    assert [(ch.onset, ch.name) for ch in after.chords][:1] == [(0, "D")]
    assert next(ch.name for ch in after.chords if ch.onset == 32) == "G"  # F + 2
    assert after.vocal[0].pitch == score_of(SMALL).vocal[0].pitch + 2
    assert set(result.select) == {"vocal:0", "chord:0", "chord:32"}
    abc, _ = run(SMALL, op="set_note_pitch", ids=["chord:32"], semitones=1)
    assert next(ch.name for ch in score_of(abc).chords if ch.onset == 32) == "F#"  # spelled for C major
    # an octave leaves a chord symbol as it is; a pitch cannot be set on one
    assert ops.transform(SMALL, {"op": "set_note_pitch", "ids": ["chord:0"], "semitones": 12}).abc == SMALL
    with pytest.raises(PlenioValidationError, match="no single pitch"):
        ops.transform(SMALL, {"op": "set_note_pitch", "ids": ["chord:0"], "midi": 60})


def test_chord_edits_never_change_notes() -> None:
    before = score_of(SMALL)
    abc, _ = run(SMALL, op="put_chord", onset=6, name="Dm7")
    after = score_of(abc)
    assert (after.vocal, after.ins) == (before.vocal, before.ins)
    assert abc.split("\n")[10] == '"C"c4d2-"Dm7"d2e4f4|"G"g8z8|'  # the note is split at the chord onset
    abc, result = run(abc, op="move_chord", onset=6, to=16)
    assert result.warnings == ("bar 2: chord G was replaced",)
    assert score_of(abc).chords == (ChordSymbol(0, "C"), ChordSymbol(16, "Dm7"), ChordSymbol(32, "F"))
    abc, _ = run(abc, op="delete_chord", onset=16)
    assert (score_of(abc).vocal, score_of(abc).ins) == (before.vocal, before.ins)
    with pytest.raises(PlenioValidationError, match="not a supported chord"):
        ops.transform(SMALL, {"op": "put_chord", "onset": 0, "name": "Cmaj9"})


# --- measures ---------------------------------------------------------------------------------


def test_insert_measures_join_the_group_before_and_split_groups_of_more_than_four() -> None:
    abc, _ = run(SMALL, op="insert_measures", bar=2, count=3)
    score = score_of(abc)
    assert score.layout == (4, 1, 2)
    assert score.sections == (Section(0, "verse"), Section(5, "chorus"))
    assert abc.split("\n")[10] == '"C"c4d4e4f4|Z3|'
    assert score.vocal[4] == Note(16 * 4, 8, 79)  # g5 moved back by three bars


def test_insert_measures_with_another_meter_form_their_own_group() -> None:
    abc, _ = run(SMALL, op="insert_measures", bar=3, count=1, meter="3/4")
    score = score_of(abc)
    assert score.meters == ((4, 4), (4, 4), (3, 4), (4, 4), (4, 4))
    assert score.layout == (2, 1, 2)
    assert "V: Vocal\nM:3/4\nZ|\nV: Ins\nM:3/4\nZ|\n% chorus\nV: Vocal\nM:4/4\n" in abc


def test_delete_measures_cut_notes_and_move_sections_to_the_cut() -> None:
    abc, result = run(SMALL, op="delete_measures", bar=2, count=2)
    score = score_of(abc)
    assert score.measure_count == 2
    assert score.sections == (Section(0, "verse"), Section(1, "chorus"))
    assert abc.split("\n")[10] == '"C"c4d4e4f4|'
    assert abc.split("\n")[14:17] == ["V: Vocal", "f16|", "V: Ins"]
    assert any("removed" in change for change in result.changes)
    with pytest.raises(PlenioValidationError, match="at least one bar"):
        ops.transform(SMALL, {"op": "delete_measures", "bar": 1, "count": 4})


def test_delete_measures_keeps_the_key_in_effect_after_the_cut() -> None:
    text = HEADER + "K:C\nV: Vocal\nc16|z4[K:D]f12|\nV: Ins\nZ|z4[K:D]z12|\n% b\nV: Vocal\nf16|\nV: Ins\nZ|\n"
    abc, _ = run(text, op="delete_measures", bar=2)
    score = score_of(abc)
    assert score.keys == (KeyChange(0, "C"), KeyChange(16, "D"))
    assert score.vocal == (Note(0, 16, 72), Note(16, 16, 78))


def test_duplicate_measures_copies_notes_chords_and_sections() -> None:
    abc, _ = run(SMALL, op="duplicate_measures", bar=3, count=2)
    score = score_of(abc)
    assert score.measure_count == 6
    assert score.sections == (Section(0, "verse"), Section(2, "chorus"), Section(4, "chorus"))
    assert abc.count('"F"a4-a4g8|f16|') == 2


def test_duplicating_part_of_a_section_extends_it() -> None:
    abc, _ = run(SMALL, op="duplicate_measures", bar=1, count=1)
    assert score_of(abc).sections == (Section(0, "verse"), Section(3, "chorus"))  # no second verse
    abc, _ = run(SMALL, op="duplicate_measures", bar=1, count=2)  # the whole verse
    assert score_of(abc).sections == (Section(0, "verse"), Section(2, "verse"), Section(4, "chorus"))


def test_meter_changes_only_on_empty_measures() -> None:
    with pytest.raises(PlenioValidationError, match="Only empty bars"):
        ops.transform(SMALL, {"op": "change_meter", "bar": 1, "count": 1, "meter": "3/4"})
    abc, _ = run(SMALL, op="delete", ids=["vocal:48"])
    abc, _ = run(abc, op="change_meter", bar=4, count=1, meter="2/4")
    score = score_of(abc)
    assert score.meters[-1] == (2, 4) and score.layout == (2, 1, 1)


# --- keys, tempo, transpose, sections ---------------------------------------------------------


def test_key_change_keeps_pitches_and_respells() -> None:
    before = score_of(SMALL)
    abc, _ = run(SMALL, op="put_key", onset=32, key="F")
    after = score_of(abc)
    assert [n.pitch for n in after.vocal] == [n.pitch for n in before.vocal]
    assert "% chorus\nV: Vocal\nK:F\n" in abc  # a group start: field lines in both voices
    abc, _ = run(SMALL, op="put_key", onset=8, key="Bb")
    assert abc.split("\n")[10] == '"C"c4d4[K:Bb]=e4f4|"G"g8z8|'
    abc, _ = run(abc, op="delete_key", onset=8)
    assert score_of(abc) == score_of(SMALL)


def test_tempo_and_transpose() -> None:
    abc, _ = run(SMALL, op="change_tempo", bpm=120)
    assert lines_changed(SMALL, abc) == [4]
    abc, _ = run(SMALL, op="transpose_by", semitones=2)
    score = score_of(abc)
    assert score.keys[0].key == "D" and score.chords[0].name == "D"
    assert [n.pitch for n in score.vocal] == [n.pitch + 2 for n in score_of(SMALL).vocal]


def test_section_edits() -> None:
    abc, _ = run(SMALL, op="rename_section_at", bar=3, label="Chorus 2")
    assert "% chorus 2\n" in abc
    abc, _ = run(SMALL, op="start_section", bar=2, label="pre-chorus")
    assert score_of(abc).layout == (1, 1, 2)
    abc, _ = run(abc, op="remove_section", bar=2)
    assert "% pre-chorus" not in abc
    abc, _ = run(SMALL, op="move_section_start", bar=3, to_bar=4)
    assert score_of(abc).sections == (Section(0, "verse"), Section(3, "chorus"))
    with pytest.raises(PlenioValidationError, match="not a usable section name"):
        ops.transform(SMALL, {"op": "rename_section_at", "bar": 1, "label": "%%%"})


# --- the commit path --------------------------------------------------------------------------


def test_malformed_text_is_rejected_before_any_operation() -> None:
    broken = SMALL.replace("f16|", "f15|")
    with pytest.raises(c.ScoreSyntaxError) as caught:
        ops.transform(broken, {"op": "delete", "ids": ["vocal:0"]})
    assert caught.value.diagnostics[0]["line"] == 16


def test_a_refused_or_empty_operation_returns_the_text_unchanged() -> None:
    result = ops.transform(SMALL, {"op": "set_note_pitch", "ids": ["vocal:0"], "midi": 72})
    assert result.abc == SMALL and result.result.changes == ("no pitch changed",)
    for bad in (
        {"op": "nope"},
        {"op": "delete", "ids": ["vocal:1"]},
        {"op": "delete", "ids": ["bass:0"]},
        {"op": "insert_note", "track": "vocal", "onset": 0, "duration": 0, "pitch": 60},
        {"op": "insert_note", "track": "vocal", "onset": 0, "duration": 4, "pitch": 128},
        {"op": "put_key", "onset": 0, "key": "H"},
        {"op": "change_tempo", "bpm": float("nan")},
    ):
        with pytest.raises(PlenioValidationError):
            ops.transform(SMALL, bad)


def test_operation_names_do_not_collide_with_the_phase_5_operations() -> None:
    from plenio.core.score.operations import OPERATIONS as PHASE_5

    assert not set(ops.OPERATIONS) & set(PHASE_5)


def test_edits_on_a_real_score_rewrite_only_the_edited_line() -> None:
    score = score_of(MINIMAX)
    target = score.vocal[20]
    abc, _ = run(MINIMAX, op="delete", ids=[f"vocal:{target.onset}"])
    assert len(lines_changed(MINIMAX, abc)) == 1
    abc, _ = run(MINIMAX, op="put_chord", onset=target.onset, name="Bm")
    assert len(lines_changed(MINIMAX, abc)) == 1


# --- random operation sequences (state machine) ----------------------------------------------


def draw_operation(data: st.DataObject, score: c.Score) -> dict[str, object]:
    """A random operation with plausible parameters (it may still be refused)."""
    notes = [("vocal", n) for n in score.vocal] + [("ins", n) for n in score.ins]
    kinds = ["insert_note", "put_chord", "insert_measures", "change_tempo", "fill_rest", "put_key"]
    # a MIDI take, step input and paste: notes from outside the score (any pitch a keyboard has)
    kinds += ["place_notes", "paste"]
    if notes:
        kinds += [
            "quantize",
            "delete",
            "delete_close_gap",
            "move_notes",
            "resize_note",
            "set_note_pitch",
            "split_note",
            "join_notes",
        ]
    if score.chords:
        kinds += ["move_chord", "delete_chord"]
    if score.measure_count > 1:
        kinds += ["delete_measures", "change_meter", "start_section", "move_section_start"]
    kinds += ["duplicate_measures", "transpose_by", "rename_section_at", "remove_section", "delete_key"]
    kind = data.draw(st.sampled_from(kinds))
    total = score.total
    bar = data.draw(st.integers(1, score.measure_count))
    onset = data.draw(st.integers(0, total - 1))
    pick = data.draw(st.sampled_from(notes)) if notes else None
    ident = f"{pick[0]}:{pick[1].onset}" if pick else "vocal:0"
    played = [
        {
            "onset": (at := data.draw(st.integers(0, total - 1))),
            "duration": data.draw(st.integers(1, max(1, min(total - at, 32)))),
            "pitch": data.draw(st.integers(21, 108)),
        }
        for _ in range(data.draw(st.integers(1, 6)))
    ]
    span = data.draw(st.integers(1, 32))
    clip, cursor = [], 0
    while cursor < span and len(clip) < 4:
        length = data.draw(st.integers(1, span - cursor))
        if data.draw(st.booleans()):
            clip.append(
                {
                    "track": "vocal",
                    "onset": cursor,
                    "duration": length,
                    "pitch": data.draw(st.integers(40, 90)),
                }
            )
        cursor += length
    return {
        "insert_note": {
            "track": data.draw(st.sampled_from(("vocal", "ins"))),
            "onset": onset,
            "duration": data.draw(st.integers(1, max(1, min(total - onset, 64)))),
            "pitch": data.draw(st.integers(36, 96)),
        },
        "put_chord": {"onset": onset, "name": data.draw(st.sampled_from(CHORDS))},
        "place_notes": {
            "track": data.draw(st.sampled_from(("vocal", "ins"))),
            "notes": played,
            "label": "recorded",
        }
        | (
            {"clear": sorted([data.draw(st.integers(0, total)), data.draw(st.integers(0, total))])}
            if data.draw(st.booleans())
            else {}
        ),
        "paste": {
            "at": onset,
            "span": span,
            "notes": clip,
            "tracks": ["vocal"],
            "mode": data.draw(st.sampled_from(("overwrite", "insert"))),
        },
        "quantize": {
            "ids": [ident],
            "grid": data.draw(st.sampled_from((1, 2, 3, 4, 8))),
            "lengths": data.draw(st.booleans()),
        },
        "insert_measures": {
            "bar": data.draw(st.integers(1, score.measure_count + 1)),
            "count": data.draw(st.integers(1, 5)),
        },
        "change_tempo": {"bpm": data.draw(st.integers(20, 300))},
        "fill_rest": {"track": data.draw(st.sampled_from(("vocal", "ins"))), "onset": onset},
        "put_key": {"onset": onset, "key": data.draw(st.sampled_from(KEYS))},
        "delete": {"ids": [ident]},
        "delete_close_gap": {"ids": [ident]},
        "move_notes": {
            "ids": [ident],
            "delta": data.draw(st.integers(-32, 32)),
            "semitones": data.draw(st.integers(-5, 5)),
            "track": data.draw(st.sampled_from((None, "vocal", "ins"))),
        },
        "resize_note": {
            "ids": [ident],
            "duration": data.draw(st.integers(1, 48)),
            "mode": data.draw(st.sampled_from(("rests", "overwrite"))),
        },
        "set_note_pitch": {"ids": [ident], "semitones": data.draw(st.integers(-12, 12))},
        "split_note": {"ids": [ident], "at": (pick[1].onset + data.draw(st.integers(1, 8))) if pick else 1},
        "join_notes": {"ids": [ident, f"{pick[0]}:{pick[1].end}"] if pick else [ident]},
        "move_chord": {
            "onset": data.draw(st.sampled_from([ch.onset for ch in score.chords])) if score.chords else 0,
            "to": onset,
        },
        "delete_chord": {
            "onset": data.draw(st.sampled_from([ch.onset for ch in score.chords])) if score.chords else 0
        },
        "delete_measures": {"bar": bar, "count": data.draw(st.integers(1, 3))},
        "change_meter": {
            "bar": bar,
            "count": 1,
            "meter": data.draw(st.sampled_from(("3/4", "2/4", "6/8", "4/4"))),
        },
        "start_section": {"bar": bar, "label": data.draw(st.sampled_from(LABELS))},
        "move_section_start": {"bar": bar, "to_bar": data.draw(st.integers(1, score.measure_count))},
        "duplicate_measures": {"bar": bar, "count": data.draw(st.integers(1, 2))},
        "transpose_by": {"semitones": data.draw(st.integers(-3, 3))},
        "rename_section_at": {"bar": bar, "label": data.draw(st.sampled_from(LABELS))},
        "remove_section": {"bar": bar},
        "delete_key": {"onset": data.draw(st.sampled_from([k.onset for k in score.keys]))},
    }[kind] | {"op": kind}


class EditSession(RuleBasedStateMachine):
    """A score document under random edits, committed through the text like the editor does."""

    def __init__(self) -> None:
        super().__init__()
        self.text = ""
        self.score: c.Score | None = None

    @initialize(start=st.one_of(scores(max_groups=4, max_notes=12).map(c.to_abc), texts()))
    def load(self, start: str) -> None:
        self.text = start
        self.score = c.from_abc(start)

    @rule(data=st.data())
    def edit(self, data: st.DataObject) -> None:
        assert self.score is not None
        operation = draw_operation(data, self.score)
        before_text, before = self.text, self.score
        try:
            result = ops.transform(self.text, operation)
        except PlenioValidationError:
            assert self.text == before_text  # a refused edit changes nothing
            return
        after = c.from_abc(result.abc)
        assert after == result.result.score
        name = operation["op"]
        if name == "delete":
            assert after.meters == before.meters and after.layout == before.layout
            kind, onset = ops.parse_id(operation["ids"][0])  # type: ignore[index]
            gone = next(n for n in before.track(kind) if n.onset == onset)
            assert gone not in after.track(kind)
            other = "ins" if kind == "vocal" else "vocal"
            assert after.track(other) == before.track(other)
            assert [n for n in after.track(kind)] == [n for n in before.track(kind) if n.onset != onset]
        if name in ("put_chord", "move_chord", "delete_chord"):
            assert (after.vocal, after.ins) == (before.vocal, before.ins)
        if name == "insert_note" and result.result.select:
            kind = str(operation["track"])
            inserted = next(n for n in after.track(kind) if n.onset == operation["onset"])
            assert (inserted.duration, inserted.pitch) == (operation["duration"], operation["pitch"])
        if (
            after.meters == before.meters
            and after.layout == before.layout
            and after.sections == before.sections
        ):
            self._check_locality(before, after, before_text, result.abc)
        self.text, self.score = result.abc, after

    def _check_locality(self, before: c.Score, after: c.Score, old: str, new: str) -> None:
        """S5: a music line whose measures did not change (content and context) is written verbatim."""
        plan_a, plan_b = c._key_plan(before), c._key_plan(after)
        changed = {
            m
            for m in range(before.measure_count)
            for v in (0, 1)
            if c._fingerprint(before, plan_a, v, m) != c._fingerprint(after, plan_b, v, m)
        }
        # A tied note's continuations are written with its attack's spelling: when any measure of a
        # sounding note changed, all measures it spans may be rewritten.
        for score in (before, after):
            for note in (*score.vocal, *score.ins):
                spanned = set(range(score.measure_at(note.onset), score.measure_at(note.end - 1) + 1))
                if spanned & changed:
                    changed |= spanned
        old_lines, new_lines = old.split("\n"), new.split("\n")
        if len(old_lines) != len(new_lines):
            return  # field lines were added or removed (a key change at a group start)
        firsts = before.group_firsts
        music = [i for i, line in enumerate(old_lines) if i >= 8 and line.endswith("|")]
        for index, line_no in enumerate(music):
            group = index // 2
            measures = set(range(firsts[group], firsts[group] + before.layout[group]))
            if not measures & changed:
                assert old_lines[line_no] == new_lines[line_no], (
                    line_no,
                    old_lines[line_no],
                    new_lines[line_no],
                )

    @invariant()
    def valid(self) -> None:
        if self.score is not None:
            assert not c.problems(self.score)
            upstream.parse_abc(self.text)
            assert c.to_abc(self.score) == self.text


EditSession.TestCase.settings = settings(
    max_examples=60, stateful_step_count=12, deadline=None, suppress_health_check=[HealthCheck.too_slow]
)
test_random_edit_sequences = EditSession.TestCase


def test_delete_on_every_note_of_the_fixture_keeps_all_measures() -> None:
    score = score_of(MINIMAX)
    grid = upstream.parse_abc(MINIMAX).voices["Vocal"].bars
    for note in score.vocal[::7]:
        abc = ops.transform(MINIMAX, {"op": "delete", "ids": [f"vocal:{note.onset}"]}).abc
        assert upstream.parse_abc(abc).voices["Vocal"].bars == grid
        assert len(lines_changed(MINIMAX, abc)) == 1


def test_replace_keeps_source_and_origins_out_of_equality() -> None:
    score = score_of(SMALL)
    assert replace(score, source=None, origins=(None,) * 4) == score
