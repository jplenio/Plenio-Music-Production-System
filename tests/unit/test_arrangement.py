"""Creative modes and the section plan (``plenio.core.arrangement``).

The central promise: whatever the writer answers, the result is a score the editor and YuE2 read - the
plan applied (wholly or in part), or the score exactly as it was with the reason. The property tests feed
random scores and random, partly broken plans through ``arrange``.
"""

from __future__ import annotations

import json
from dataclasses import replace
from fractions import Fraction
from pathlib import Path
from typing import Any

import jsonschema
import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from plenio.core.arrangement import (
    LEAD_ROLES,
    OFF,
    ModeLibrary,
    PlanError,
    arrange,
    harmony,
    lines,
    melody_of,
    parse_mode,
    policy,
    prompt,
    read_plan,
    schema,
    section_ranges,
    summarize,
    writer_lines,
)
from plenio.core.arrangement.apply import SHARE_TOLERANCE
from plenio.core.arrangement.plan import CHORD_PATTERN, closeness_text, melody_voice, normalize_chord
from plenio.core.errors import PlenioUserError
from plenio.core.score import canonical as c
from plenio.core.score import native, ops
from plenio.core.score.operations import editor_view
from score_strategies import scores

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "resources" / "arrangement"
FIXTURE = (ROOT / "tests" / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
LIBRARY = ModeLibrary(PACKAGE)


def rules(
    name: str = "varied",
    *,
    kind: str = "song",
    closeness: int = 60,
    melody: str = "vocal",
    under: bool = False,
    genre: str = "",
) -> Any:
    return policy(
        LIBRARY.by_name(name), kind=kind, closeness=closeness, melody=melody, under_singing=under, genre=genre
    )


def with_rests(text: str, bars: tuple[int, ...]) -> str:
    """The score with the voice silent in ``bars`` (0-based): room for fills."""
    model = c.from_abc(text)
    spans = [(model.starts[b], model.starts[b + 1]) for b in bars]
    vocal = tuple(n for n in model.vocal if not any(a <= n.onset < b for a, b in spans))
    return c.to_abc(c.validate(replace(model, vocal=vocal)))


def plan(*sections: dict[str, Any], tempo: int = 0) -> str:
    return json.dumps({"idea": "test", "tempo_change": tempo, "sections": list(sections)})


def entry(section: int, **fields: Any) -> dict[str, Any]:
    return {"section": section, "chords": "keep", "lead": "keep", "energy": 3, "key_shift": 0, **fields}


def readable(text: str) -> bool:
    """What the Song Sheet and YuE2 need: the parser, the round trip and the editor's note view."""
    if not native.analyze(text).ok:
        return False
    model = c.from_abc(text)
    return (
        c.musically_equal(model, c.from_abc(c.to_abc(model))) and editor_view(text).get("model") is not None
    )


# --- modes -----------------------------------------------------------------------------------------


def test_the_shipped_modes() -> None:
    assert LIBRARY.names() == [
        "off",
        "standard",
        "varied",
        "fantasy",
        "sterile",
        "many instruments",
        "dramatic",
    ]
    for name in LIBRARY.names()[1:]:
        mode = LIBRARY.by_name(name)
        assert mode.arranges and mode.description and mode.arranger and mode.writer, name
        assert set(mode.lead) <= set(LEAD_ROLES)
    assert not LIBRARY.by_name(OFF).arranges
    # 0.4.5 called it "simple": saved workflows and API prompts with that name still mean "off"
    assert LIBRARY.by_name("simple") is LIBRARY.by_name(OFF)


@pytest.mark.parametrize(
    ("front", "message"),
    [
        ("name: off", "must be 1-40"),
        ("name: simple", "must be 1-40"),
        ("lead: keep, dance", "unknown lead roles"),
        ("key shift: 0..9", "outside -5..5"),
        ("tempo change: fast", "must look like"),
        ("chord colors: 4", "must be 1, 2 or 3"),
        ("colour: 2", "unknown fields"),
    ],
)
def test_mode_files_name_their_mistakes(front: str, message: str) -> None:
    with pytest.raises(PlenioUserError, match=message):
        parse_mode(f"---\n{front}\n---\n## Arranger\nx\n", "mine")


def test_a_mode_needs_its_arranger_text() -> None:
    with pytest.raises(PlenioUserError, match="Arranger"):
        parse_mode("---\nname: mine\n---\n## Writer\nx\n", "mine")


def test_user_modes_join_the_list_and_broken_ones_are_skipped(tmp_path: Path) -> None:
    (tmp_path / "calm.md").write_text(
        "---\norder: 15\nlead: pad\n---\n## Arranger\nCalm.\n", encoding="utf-8"
    )
    (tmp_path / "varied.md").write_text("---\nname: varied\n---\n## Arranger\nMine.\n", encoding="utf-8")
    (tmp_path / "broken.md").write_text("no front matter", encoding="utf-8")
    library = ModeLibrary(PACKAGE, tmp_path)
    names = library.names()
    assert names[:3] == ["off", "standard", "calm"]
    assert "varied (mine)" in names and names.count("varied") == 1
    assert list(library.problems) == [str(tmp_path / "broken.md")]


# --- the policy ------------------------------------------------------------------------------------


def test_cover_closeness_bands() -> None:
    assert rules(kind="cover", closeness=95).skip  # the original stays: the writer is not asked
    close = rules(kind="cover", closeness=85)
    assert (
        not close.chords
        and not close.replace_lines
        and close.key_shift == (0, 0)
        and close.tempo_change == (0, 0)
    )
    middle = rules(kind="cover", closeness=60)
    assert middle.chords and middle.key_shift == (0, 2) and middle.tempo_change == (0, 0)
    free = rules("fantasy", kind="cover", closeness=30)
    assert free.tempo_change == (-10, 10) and free.tensions == "colour"
    assert rules("fantasy", kind="cover", closeness=5).tensions == "free"


def test_genre_closeness_bands() -> None:
    assert rules("fantasy", closeness=95).key_shift == (0, 2)
    assert rules("fantasy", closeness=95).tempo_change == (0, 0)
    assert rules("fantasy", closeness=75).tempo_change == (0, 0)
    assert rules("fantasy", closeness=75).key_shift == (-2, 3)
    assert rules("fantasy", closeness=50).tensions == "colour"
    assert rules("fantasy", closeness=10).tensions == "free"
    assert not rules(closeness=0).skip and rules("off").skip and rules("simple").skip


def test_the_melody_always_stays() -> None:
    instrument = rules("many instruments", melody="instrument")
    assert not instrument.replace_lines  # the instrument line is the melody: lines only where it rests
    assert "countermelody" not in instrument.lead and "octave" not in instrument.lead
    accompaniment = rules("many instruments", melody="none")
    assert not {"solo", "countermelody", "octave"} & set(accompaniment.lead)
    assert melody_of(instrumental=False, melody="lead") == "vocal"
    assert melody_of(instrumental=True, melody="lead") == "instrument"
    assert melody_of(instrumental=True, melody="accompaniment") == "none"


def test_writer_lines() -> None:
    assert writer_lines(LIBRARY.by_name("off"), kind="song", closeness=70, genre="pop") == []
    song = writer_lines(LIBRARY.by_name("sterile"), kind="song", closeness=95, genre="pop")
    assert song[0].startswith("- Creative mode 'sterile': Style:")
    assert any(
        "Genre closeness 95 of 100: Stay strictly within the conventions of pop" in line for line in song
    )
    cover = writer_lines(LIBRARY.by_name("sterile"), kind="cover", closeness=10, genre="pop")
    assert not any(
        "closeness" in line.lower() for line in cover[:-1]
    )  # the song flow concerns the score only
    assert closeness_text("cover", 99, "") == "Keep the original's song flow exactly as it is."


# --- the request -----------------------------------------------------------------------------------


def test_the_prompt_shows_the_score_and_never_asks_for_notation() -> None:
    summary = summarize(c.from_abc(FIXTURE), melody="vocal")
    text = prompt(summary, rules(), brief_text="Genre: indie pop", genre="indie pop")
    assert (
        "1. verse (bars 1-4): chords C | G | Am | F; melody on the strong beats E E | D D | E B | F G" in text
    )
    assert "do not write notes, ABC or any other notation" in text
    assert "exactly 2 entries" in text and "MODE: varied" in text


def test_the_schema_accepts_good_plans_and_holds_chords_to_yue2s_names() -> None:
    answer = schema(rules("fantasy"), 2)
    good = {
        "idea": "x",
        "tempo_change": -5,
        "sections": [entry(1, chords=["C/E", "Am7", "F#m7b5"]), entry(2)],
    }
    jsonschema.validate(good, answer)
    for bad in (
        {**good, "sections": [entry(1)]},  # one entry for two sections
        {**good, "sections": [entry(1, chords=["Cmaj9"]), entry(2)]},  # not a chord YuE2 reads
        {**good, "sections": [entry(1, lead="dance"), entry(2)]},
        {**good, "tempo_change": 30},
    ):
        with pytest.raises(jsonschema.ValidationError):
            jsonschema.validate(bad, answer)


@pytest.mark.parametrize(
    "name", ["C", "Am", "Bbmaj7", "F#m7b5", "Ebsus4", "D7sus4", "Abm(maj7)", "E6", "C/E", "Gdim7"]
)
def test_the_chord_pattern_matches_yue2(name: str) -> None:
    import re

    from plenio.third_party import yue2_abc_tools as upstream

    assert re.fullmatch(CHORD_PATTERN.strip("^$"), name) and upstream.CHORD.fullmatch(name)


# --- reading the answer ----------------------------------------------------------------------------


@pytest.mark.parametrize(
    "wrap",
    [
        lambda s: s,
        lambda s: f"Here is the plan:\n```json\n{s}\n```\nEnjoy!",
        lambda s: f"<think>let me see</think>{s}",
        lambda s: s.replace("}]", "},]"),  # a trailing comma
        lambda s: s.replace('"', "'"),  # Python quotes
        lambda s: s.replace('"idea": "test"', '"idea": “test”'),  # smart quotes
    ],
)
def test_answers_are_read_leniently(wrap: Any) -> None:
    text = wrap(plan(entry(1, lead="pad"), entry(2, chords=["F", "C"])))
    result = read_plan(text, rules(), 2)
    assert [s.lead for s in result.sections] == ["pad", "keep"]
    assert result.sections[1].chords == ("F", "C")


def test_an_unclosed_answer_is_closed() -> None:
    """Small models often drop the last brace (Gemma 4 E4B in 7 of 12 unconstrained plans, study A1)."""
    whole = plan(entry(1, lead="pad"), entry(2, chords="F - F | C,G", lead="riff"))
    for cut in (whole[:-1], whole[:-2], whole[:-2] + ", ", whole[: whole.rindex('"lead"')]):
        result = read_plan(cut, rules(), 2)
        assert result.sections[0].lead == "pad", cut
    assert read_plan(whole[:-2], rules(), 2).sections[1].chords == ("F", "F", "C", "G")
    assert read_plan("{'sections': [{'section': 1, 'lead': 'pad'}", rules(), 2).sections[0].lead == "pad"


@pytest.mark.parametrize("answer", ["", "no plan today", "[1, 2]", '{"sections": []}', '{"idea": "x"}'])
def test_no_plan_at_all_is_an_error(answer: str) -> None:
    with pytest.raises(PlanError):
        read_plan(answer, rules(), 2)


def test_corrections_and_dropped_parts_are_told_apart() -> None:
    answer = plan(
        entry(1, chords=["Cmaj9", "Hm", "Bb/D"], energy=9, key_shift=5),
        entry(1, lead="pad"),  # the same section again
        entry(7, lead="pad"),  # no such section
        tempo=40,
    )
    result = read_plan(answer, rules(), 3)
    assert result.sections[0].chords == ("Cmaj7", "Bm", "Bb")  # nearest names; no slash below colour level 3
    assert result.sections[0].energy == 5 and result.sections[0].key_shift == 2
    assert result.tempo_change == 5
    assert any("bass note dropped" in note for note in result.notes)
    assert any("repeats or exceeds" in note for note in result.dropped)
    assert any("section 7 does not exist; read as section 3" in note for note in result.notes)
    assert result.sections[2].lead == "pad"
    assert any("no plan for section 2:" in note for note in result.dropped)
    assert not any("energy" in note for note in result.dropped)  # a clamp is a correction


def test_unusable_parts_keep_what_was_planned() -> None:
    answer = plan(
        entry(1, chords=["C", "X9"], lead="dance"), entry(2, lead="motif", motif=[{"note": "Q9", "beats": 9}])
    )
    result = read_plan(answer, rules(), 2)
    assert (
        result.sections[0].chords == ("C", None) and result.sections[0].lead == "keep"
    )  # bar 2 keeps its chord
    assert result.sections[1].lead == "arpeggio" and not result.sections[1].motif
    assert len(result.dropped) == 4


def test_a_chord_list_without_brackets_is_read() -> None:
    """Gemma 4 12B once wrote the list without its brackets (study A1)."""
    answer = '{"idea": "x", "sections": [{"section": 1, "chords": "F", "G", "Am", "lead": "pad"}]}'
    assert read_plan(answer, rules(), 1).sections[0].chords == ("F", "G", "Am")


def test_quality_words_belong_to_their_chord() -> None:
    """Gemma 4 E4B wrote "F major" in the GPU smoke test S-9."""
    answer = plan(entry(1, chords="F major | D minor | Bb maj7 | C"))
    assert read_plan(answer, rules(), 1).sections[0].chords == ("F", "Dm", "Bbmaj7", "C")


def test_the_planned_chord_again_is_no_clash() -> None:
    result = arrange(FIXTURE, plan(entry(1, chords=["C", "G", "Am", "Fmaj7"])), rules("standard"))
    assert not any("clashes" in kept for section in result.sections for kept in section.kept)


def test_one_chord_per_bar_and_the_writers_own_words() -> None:
    sixteen = ["C", "G", "Am", "F"] * 4
    answer = plan(entry(1, chords=[*sixteen[:-1], "keep"], lead="counter"), entry(2, lead="line"))
    result = read_plan(answer, rules(), 2)
    assert result.sections[0].chords == (*sixteen[:-1], None) and not result.dropped
    assert [s.lead for s in result.sections] == ["countermelody", "keep"]
    assert "section 1: lead 'counter' read as 'countermelody'" in result.notes
    applied = arrange(FIXTURE, plan(entry(1, chords=["keep", "keep", "keep", "Fmaj7"])), rules())
    assert [ch.name for ch in c.from_abc(applied.abc).chords][:4] == ["C", "G", "Am", "Fmaj7"]


def test_normalize_chord() -> None:
    sterile = rules("sterile")
    assert normalize_chord("G7", sterile) == ("G", "G7 -> G (simplified to the mode's chord colours)")
    assert normalize_chord("Am", sterile) == ("Am", "")
    assert normalize_chord("B♭maj7", rules("fantasy"))[0] == "Bbmaj7"
    assert normalize_chord("C/E", rules("fantasy")) == ("C/E", "")
    assert normalize_chord("Zm", rules())[0] is None


# --- applying the plan -------------------------------------------------------------------------------


def test_a_plan_becomes_a_valid_score() -> None:
    answer = plan(
        entry(1, chords=["C", "G", "Am", "F"], lead="arpeggio", energy=3),
        entry(2, chords=["Cmaj9", "F", "G7", "C"], lead="countermelody", energy=4, key_shift=2),
        tempo=3,
    )
    result = arrange(FIXTURE, answer, rules(under=True), seed=1)
    assert result.status == "applied", (result.notes, [s.kept for s in result.sections])
    assert readable(result.abc)
    model = c.from_abc(result.abc)
    assert model.tempo == 91 and model.ins  # tempo +3 %, an instrument line where there was none
    assert [k.key for k in model.keys] == ["C", "D"]  # the chorus is lifted a whole tone
    original = c.from_abc(FIXTURE)
    chorus_start = original.starts[4]
    assert [n.pitch for n in model.vocal if n.onset < chorus_start] == [
        n.pitch for n in original.vocal if n.onset < chorus_start
    ]
    assert [n.pitch for n in model.vocal if n.onset >= chorus_start] == [
        n.pitch + 2 for n in original.vocal if n.onset >= chorus_start
    ]
    assert (
        arrange(FIXTURE, answer, rules(under=True), seed=1).abc == result.abc
    )  # the same seed, the same notes
    assert result.harmony["after"]["clashes"] == 0 and result.harmony["after"]["accented_avoid"] == 0


def test_a_chord_that_clashes_with_the_melody_is_not_used() -> None:
    result = arrange(FIXTURE, plan(entry(1, chords=["C#", "G", "Am", "Fmaj7"]), entry(2)), rules("standard"))
    assert result.status == "partial"
    assert any("bar 1: C# is not a chord of C" in kept for kept in result.sections[0].kept)
    assert [ch.name for ch in c.from_abc(result.abc).chords][:4] == ["C", "G", "Am", "Fmaj7"]
    alone = arrange(FIXTURE, plan(entry(1, chords=["C#", "G", "Am", "F"]), entry(2)), rules("standard"))
    assert (
        alone.status == "unchanged" and alone.summary == "nothing of the plan could be used (see the notes)"
    )


def test_garbage_falls_back_to_the_score_as_it_was() -> None:
    result = arrange(FIXTURE, "I would arrange it beautifully.", rules())
    assert result.status == "fallback" and result.abc == FIXTURE
    assert "not a usable plan" in result.summary and "the score is used as it was" in result.summary


def test_a_score_plenio_cannot_edit_stays_as_it_is() -> None:
    broken = "X:1\nnot a score"
    result = arrange(broken, plan(entry(1, lead="pad")), rules())
    assert result.status == "fallback" and result.abc == broken
    assert "cannot be edited note by note" in result.summary


def test_a_plan_that_keeps_everything_changes_nothing() -> None:
    result = arrange(FIXTURE, plan(entry(1), entry(2)), rules())
    assert result.status == "unchanged" and result.abc == FIXTURE


def test_arrangement_off_and_a_kept_cover_skip_the_writer() -> None:
    assert arrange(FIXTURE, "", rules("off")).status == "skipped"
    kept = arrange(FIXTURE, "", rules(kind="cover", closeness=100))
    assert kept.status == "skipped" and kept.abc == FIXTURE and "song flow closeness 100" in kept.summary


def test_the_context_check_drops_the_lines_first_then_falls_back() -> None:
    answer = plan(entry(1, chords=["C", "G", "Am", "Fmaj7"], lead="arpeggio"), entry(2, lead="riff"))
    without_lines = arrange(
        FIXTURE, answer, rules(under=True), fits=lambda abc: "too long" if "V: Ins\nZ" not in abc else None
    )
    assert without_lines.status == "partial"
    assert any("instrument lines were left out" in note for note in without_lines.notes)
    never = arrange(FIXTURE, answer, rules(under=True), fits=lambda abc: "too long")
    assert (
        never.status == "fallback"
        and never.abc == FIXTURE
        and "does not fit the music model" in never.summary
    )


def test_an_instrument_line_that_carries_the_melody_stays() -> None:
    model = c.from_abc(FIXTURE)
    moved = c.to_abc(c.validate(replace(model, ins=model.vocal, vocal=())))
    result = arrange(moved, plan(entry(1, lead="pad"), entry(2, lead="riff")), rules(melody="instrument"))
    assert c.from_abc(result.abc).ins == c.from_abc(moved).ins
    assert all("carries the melody" in kept[0] for kept in (s.kept for s in result.sections))


def test_a_score_without_chords_gets_none() -> None:
    """Owner's decision D2: a score without chords (a cover on *new accompaniment*) is harmonised by YuE2
    itself - the plan adds no chords and only lines that need none (a solo on the key's pentatonic)."""
    model = c.from_abc(FIXTURE)
    bare = c.to_abc(c.validate(replace(model, chords=())))
    result = arrange(
        bare, plan(entry(1, chords=["C", "G", "Am", "F"], lead="arpeggio"), entry(2, lead="none")), rules()
    )
    after = c.from_abc(result.abc)
    assert not after.chords
    assert not any(a.startswith("line arpeggio") for s in result.sections for a in s.applied)
    roomy = with_rests(bare, (1, 2))
    solo = arrange(roomy, plan(entry(1, lead="solo"), entry(2)), rules("many instruments"))
    assert c.from_abc(solo.abc).ins and not c.from_abc(solo.abc).chords


def test_a_key_lift_that_leaves_the_voice_range_is_not_made() -> None:
    result = arrange(FIXTURE, plan(entry(1), entry(2, key_shift=2)), rules(), seed=0)
    assert result.status == "applied"  # C5 + 2 stays within the song's highest note + 2
    high = rules("fantasy", closeness=60)
    lifted = arrange(FIXTURE, plan(entry(1), entry(2, key_shift=3)), high)
    assert (
        lifted.status == "unchanged"
    )  # the lift was all the plan wanted; the section says why it stayed out
    assert "would leave the singing range" in lifted.sections[1].kept[0]


def test_a_key_lift_that_leaves_the_midi_range_is_not_reported_as_made() -> None:
    # found by the fuzz test: an instrument note on G9 (127) cannot go up; the report said "key +1" anyway
    model = c.from_abc(FIXTURE)
    second = model.starts[section_ranges(model)[1][1]]
    top = c.validate(replace(model, ins=(c.Note(second, 1, 127),)))
    result = arrange(c.to_abc(top), plan(entry(1), entry(2, key_shift=1)), rules(), seed=0)
    assert not any(a.startswith("key ") for s in result.sections for a in s.applied)
    assert any("would leave the MIDI range" in kept for kept in result.sections[1].kept)
    if result.status != "unchanged":
        assert c.from_abc(result.abc).vocal == top.vocal


def test_motifs_follow_the_chords() -> None:
    figure = [{"note": "C4", "beats": 1}, {"note": "E4", "beats": 1}, {"note": "G4", "beats": 2}]
    result = arrange(with_rests(FIXTURE, (1,)), plan(entry(1, lead="motif", motif=figure), entry(2)), rules())
    assert result.status == "applied" and readable(result.abc)
    model = c.from_abc(result.abc)
    bar2 = [n.pitch % 12 for n in model.ins if model.starts[1] <= n.onset < model.starts[2]]
    assert bar2 == [7, 11, 2]  # moved onto G: G B D


def test_a_motif_starts_on_every_downbeat_and_lands_on_chord_notes() -> None:
    model = c.from_abc(FIXTURE)
    bars = lines.bars_of(model, 0, 4, ["C", "G", "Am", "F"])
    # three beats in 4/4 (it would drift across the bar lines) starting on D, not a note of C major
    figure = [(62, Fraction(1)), (64, Fraction(1)), (67, Fraction(1))]
    notes = lines.motif(bars, figure, model.units_per_quarter)
    downbeats = {onset: pitch for onset, _length, pitch in notes if onset in model.starts[:4]}
    assert set(downbeats) == set(model.starts[:4])  # restarted on every bar
    assert downbeats[model.starts[0]] % 12 in (0, 4, 7)  # D -> a note of C major
    assert all(onset + length <= model.starts[4] for onset, length, _pitch in notes)


@pytest.mark.parametrize("role", ["pad", "arpeggio", "riff", "countermelody", "solo", "octave"])
@pytest.mark.parametrize("energy", [1, 3, 5])
def test_every_role_writes_a_readable_line(role: str, energy: int) -> None:
    result = arrange(
        FIXTURE,
        plan(entry(1, lead=role, energy=energy), entry(2, lead=role, energy=energy)),
        rules("varied", under=True),
    )
    assert result.status in ("applied", "partial") and readable(result.abc), result.notes
    model = c.from_abc(result.abc)
    assert model.ins and all(0 <= n.pitch <= 127 for n in model.ins)
    low, high = lines.REGISTER.get(role, (36, 96))
    if role in lines.REGISTER and role != "countermelody":
        assert all(low - 14 <= n.pitch <= high for n in model.ins), role  # below the voice it may go lower
    assert harmony.clashes(model, model.vocal, model.ins) == 0  # never a minor second against the voice
    assert all(
        i.pitch <= v.pitch - lines.BELOW_VOICE
        for i in model.ins
        for v in model.vocal
        if i.onset < v.end and v.onset < i.end
    )


# --- lines that fit the voice and the chords (owner's decision D1) ----------------------------------------


@pytest.mark.parametrize("role", ["pad", "arpeggio", "riff", "countermelody", "solo"])
def test_lines_play_where_the_voice_rests(role: str) -> None:
    roomy = with_rests(FIXTURE, (2, 3))
    result = arrange(roomy, plan(entry(1, lead=role), entry(2, lead=role)), rules("varied"))
    model = c.from_abc(result.abc)
    assert model.ins, (result.sections, result.notes)
    assert not any(i.onset < v.end and v.onset < i.end for i in model.ins for v in model.vocal)
    sung_through = [s for s in result.sections if s.label == "chorus"][0]
    assert any("no room for a line" in kept for kept in sung_through.kept)


def test_octave_doubling_needs_lines_under_the_singing() -> None:
    assert "octave" not in rules("varied").lead
    assert "octave" in rules("varied", under=True).lead


def test_a_line_follows_every_chord_of_its_bar() -> None:
    model = c.from_abc(FIXTURE)
    half = model.starts[0] + model.lengths[0] // 2
    chords = sorted((*model.chords, c.ChordSymbol(half, "Am")), key=lambda ch: ch.onset)
    two = c.validate(replace(model, chords=tuple(chords)))
    bars = lines.bars_of(two, 0, 1, ["C"])
    notes = lines.pad(bars, 1, __import__("random").Random(1))
    assert [(onset, pitch % 12 in (9, 0, 4)) for onset, _length, pitch in notes][-1] == (half, True)
    assert len(notes) == 2


def test_riff_figures_take_the_chords_own_third() -> None:
    model = c.from_abc(FIXTURE)
    bars = lines.bars_of(model, 0, 1, ["C"])
    for seed in range(12):
        notes = lines.riff(bars, 4, __import__("random").Random(seed), model.units_per_quarter)
        assert all(pitch % 12 != 3 for _onset, _length, pitch in notes)  # never E-flat over C major


def test_genre_words_choose_the_vocabulary() -> None:
    answer = plan(entry(1, chords=["C", "G", "Am", "Bb"]), entry(2))
    pop = arrange(FIXTURE, answer, rules("standard", genre="indie pop"))
    assert c.from_abc(pop.abc).chords[3].name in (
        "Bb",
        "F",
    )  # bVII is borrowed in pop - if it fits the melody


# --- whatever the writer answers: a readable score or the score as it was -------------------------------

CHORD_NAMES = [
    "C",
    "Am",
    "F",
    "G7",
    "Dm7",
    "Bbmaj7",
    "F#m7b5",
    "Ebsus4",
    "C/E",
    "Hm",
    "Cmaj9",
    "X",
    "add9",
    "",
]


@st.composite
def answers(draw: st.DrawFn, sections: int) -> str:
    if draw(st.integers(0, 9)) == 0:
        return draw(st.sampled_from(["", "nope", "{", '{"sections": "all"}', "[]"]))
    entries = []
    for _ in range(draw(st.integers(0, sections + 2))):
        item: dict[str, Any] = {
            "section": draw(st.integers(0, sections + 1)),
            "chords": draw(st.one_of(st.just("keep"), st.lists(st.sampled_from(CHORD_NAMES), max_size=10))),
            "lead": draw(st.sampled_from([*LEAD_ROLES, "dance"])),
            "energy": draw(st.integers(-2, 8)),
            "key_shift": draw(st.integers(-7, 7)),
        }
        if item["lead"] == "motif" or draw(st.booleans()):
            item["motif"] = [
                {
                    "note": draw(st.sampled_from(["C4", "E4", "G#3", "Bb5", "rest", "Q1"])),
                    "beats": draw(st.sampled_from([0.25, 0.5, 1, 1.5, 2, 3, 7])),
                }
                for _ in range(draw(st.integers(0, 6)))
            ]
        entries.append(item)
    return json.dumps({"idea": "fuzz", "tempo_change": draw(st.integers(-40, 40)), "sections": entries})


@settings(max_examples=150, deadline=None, suppress_health_check=[HealthCheck.too_slow])
@given(
    score=scores(max_groups=4, max_notes=16),
    data=st.data(),
    mode=st.sampled_from(["standard", "varied", "fantasy", "sterile", "many instruments", "dramatic"]),
    kind=st.sampled_from(["song", "cover"]),
    closeness=st.integers(0, 94),
    melody=st.sampled_from(["vocal", "instrument", "none"]),
    seed=st.integers(0, 3),
)
def test_any_answer_gives_a_readable_score_or_the_old_one(
    score: c.Score, data: st.DataObject, mode: str, kind: str, closeness: int, melody: str, seed: int
) -> None:
    text = c.to_abc(score)
    answer = data.draw(answers(len(section_ranges(score))))
    under = data.draw(st.booleans())
    rules_ = rules(mode, kind=kind, closeness=closeness, melody=melody, under=under)
    result = arrange(text, answer, rules_, seed=seed)
    if result.status in ("fallback", "unchanged", "skipped"):
        assert result.abc == text
        return
    assert readable(result.abc), (result.notes, result.abc)
    after = c.from_abc(result.abc)
    # the harmony guard: never more clashes than the score had - with the chords, and between the voices
    before_m = harmony.measure(score, melody_voice(score, melody))
    after_m = harmony.measure(after, melody_voice(after, melody))
    # (as time: a key lift splits a note held across a section's boundary into two attacks)
    assert after_m.clash_share <= before_m.clash_share + SHARE_TOLERANCE + 1e-9, result.sections
    assert after_m.clashes <= before_m.clashes, result.sections
    assert after.measure_count == score.measure_count and after.sections == score.sections
    shifted = {
        r.index: next((int(a.split()[1]) for a in r.applied if a.startswith("key ")), 0)
        for r in result.sections
    }
    ranges = section_ranges(score)

    def shift_at(onset: int) -> int:
        for index, (_label, first, end) in enumerate(ranges, start=1):
            if score.starts[first] <= onset < score.starts[end]:
                return shifted.get(index, 0)
        return 0

    def sounding(notes: tuple[c.Note, ...]) -> dict[int, int]:
        return {t: n.pitch for n in notes for t in range(n.onset, n.end)}

    # the melody stays: the same pitches at the same times, moved only by a section's key lift
    before_vocal, after_vocal = sounding(score.vocal), sounding(after.vocal)
    assert after_vocal == {t: p + shift_at(t) for t, p in before_vocal.items()}
    if melody == "instrument":
        before_ins, after_ins = sounding(score.ins), sounding(after.ins)
        played = {t for t in before_ins}
        assert {t: p for t, p in after_ins.items() if t in played} == {
            t: p + shift_at(t) for t, p in before_ins.items()
        }
    assert Fraction(after.tempo, score.tempo) <= Fraction(140, 100)


def test_a_key_lift_holds_to_the_end_and_is_prepared() -> None:
    # verse - chorus - chorus; the plan lifts the first chorus and lets the second fall back: the owner's
    # listening (study E7) found the fall back the most abrupt moment, so the lift holds
    three = c.to_abc(ops.arrange_sections(c.from_abc(FIXTURE), [1, 2, 2]).score)
    result = arrange(three, plan(entry(1), entry(2, key_shift=2), entry(3, key_shift=0)), rules(), seed=0)
    assert readable(result.abc)
    model = c.from_abc(result.abc)
    assert [k.key for k in model.keys] == ["C", "D"]
    assert "the key lift holds to the end of the song" in " ".join(result.notes)
    # the last bar leads into D with chords that clash with nothing sung there: the melody ends on C, so the
    # dominant A7 does not fit - the new key's lowered sixth and seventh steps rise to it (Bb - C -> D)
    lift = model.starts[4]
    leading = [ch.name for ch in model.chords if model.starts[3] <= ch.onset < lift]
    assert leading == ["Bb", "C"]
    assert any(n.startswith("bar 4: Bb - C lead into D") for n in result.notes)
    assert result.harmony["after"]["accented_avoid"] == 0


def test_a_lift_that_cannot_be_made_everywhere_stays_out_everywhere() -> None:
    three = c.to_abc(ops.arrange_sections(c.from_abc(FIXTURE), [1, 2, 2]).score)
    model = c.from_abc(three)
    last = model.starts[section_ranges(model)[2][1]]
    high = c.to_abc(c.validate(replace(model, ins=(*model.ins, c.Note(last, 1, 127)))))  # bar 9 cannot go up
    result = arrange(high, plan(entry(1), entry(2, key_shift=1), entry(3, key_shift=1)), rules(), seed=0)
    assert [k.key for k in c.from_abc(result.abc).keys] == ["C"]  # no lift that falls back in the last chorus
    assert any("stays out with section 3's" in kept for kept in result.sections[1].kept)


def test_a_modulation_takes_a_chord_of_both_keys_and_the_new_dominant_first() -> None:
    from plenio.core.arrangement.apply import _modulations

    up_minor = _modulations(harmony.key_of("Fm"), harmony.key_of("Gm"))
    assert up_minor[0][1] == [(0, "m"), (2, "7")]  # Cm (iv of Gm, v of Fm) - D7 -> Gm
    up_major = _modulations(harmony.key_of("C"), harmony.key_of("D"))
    assert up_major[0][1] == [(4, "m"), (9, "7")]  # Em (ii of D, iii of C) - A7 -> D
    assert ("the new key's lowered sixth and seventh steps rising to it", [(10, ""), (0, "")]) in up_major
