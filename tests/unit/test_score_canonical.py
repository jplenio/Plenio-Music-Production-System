"""The canonical score engine (next-release plan §9.2-§9.5): model, parser and serializer.

S1 accepted language = upstream (minus measures that are not a whole number of units),
S2 identity for every accepted text, S3 round trip for every valid model, S4 determinism,
S6 validity of every output, S7 native style of rewritten measures.
"""

from __future__ import annotations

import json
from dataclasses import replace
from fractions import Fraction
from pathlib import Path

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.sheet.resolve import normalize_document
from plenio.third_party import yue2_abc_tools as upstream
from score_strategies import scores, texts

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
HEADER = (
    "X:1\nT:\nM:4/4\nL:1/32\nQ:1/4=90\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
)
PROPERTY = settings(max_examples=150, deadline=None, suppress_health_check=[HealthCheck.too_slow])


def build(key: str, groups: list[tuple[str | None, str, str]], header: str = HEADER) -> str:
    lines = [header + f"K:{key}"]
    for section, vocal, ins in groups:
        if section:
            lines.append(f"% {section}")
        lines += ["V: Vocal", vocal, "V: Ins", ins]
    return "\n".join(lines) + "\n"


TRICKY = build(
    "D",
    [
        ("intro", '"D"z32|', "d8f8a16|"),
        ("verse", '"G"^F8f8=F8f8|"A7"A16-A16|', "Z2|"),
        (None, '"Bm"B8_B8B16|"D"d32|', "D8F8A8d8|z32|"),
        ("chorus", '"G"^c16-c16|"D"d32|', "Z2|"),
    ],
)


def _fixtures() -> dict[str, str]:
    found = {path.stem: path.read_text(encoding="utf-8") for path in sorted((FIXTURES / "abc").glob("*.abc"))}
    for path in sorted((FIXTURES / "cover").glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "abc" in data:
            found[path.stem] = data["abc"]
    found["tricky"] = TRICKY
    return found


ALL = _fixtures()
REAL = {name: text for name, text in ALL.items() if name != "tricky"}


def upstream_notes(text: str) -> dict[str, list[list[object]]]:
    parsed = upstream.parse_abc(text)
    return {voice: [list(n) for n in parsed.voices[voice].notes] for voice in upstream.VOICES}


# --- S2 identity and S7 native style on real scores -------------------------------------------


@pytest.mark.parametrize("name", sorted(ALL))
def test_identity_on_every_fixture(name: str) -> None:
    text = ALL[name]
    assert c.to_abc(c.from_abc(text)) == text
    normal = normalize_document(text)
    assert c.to_abc(c.from_abc(normal)) == normal  # the Song Sheet's normal form (no final newline)


@pytest.mark.parametrize("name", sorted(REAL))
def test_the_canonical_writer_reproduces_native_scores(name: str) -> None:
    """S7 golden: with no source text at all, the writer's style is the native writers' style."""
    score = c.from_abc(REAL[name])
    assert c.canonical_text(score) == REAL[name]


def test_the_canonical_writer_normalises_a_non_native_score() -> None:
    score = c.from_abc(TRICKY)
    lines = c.canonical_text(score).splitlines()
    assert lines[15] == '"G"F8f8=F8f8|"A7"A32|'  # key D: no redundant sharp; one note of 32 units
    assert c.from_abc(c.canonical_text(score)) == score


@pytest.mark.parametrize("name", sorted(ALL))
def test_model_notes_are_the_upstream_sounding_notes(name: str) -> None:
    text = ALL[name]
    score = c.from_abc(text)
    quarter = score.unit * 4
    for voice, notes in (("Vocal", score.vocal), ("Ins", score.ins)):
        assert [
            [Fraction(n.onset) * quarter, n.pitch, Fraction(n.duration) * quarter] for n in notes
        ] == upstream_notes(text)[voice]


def test_model_of_a_small_score() -> None:
    score = c.from_abc(TRICKY)
    assert score.tempo == 90 and score.unit == Fraction(1, 32)
    assert score.meters == ((4, 4),) * 7
    assert score.layout == (1, 2, 2, 2)
    assert [(s.measure, s.label) for s in score.sections] == [(0, "intro"), (1, "verse"), (5, "chorus")]
    assert score.keys == (c.KeyChange(0, "D"),)
    # "A16-A16" is one sounding note of 32 units; "^c16-c16" keeps C# across the tie
    assert c.Note(64, 32, 69) in score.vocal
    assert c.Note(160, 32, 73) in score.vocal
    # accidentals by letter across octaves: ^F8 f8 (F#5 by the bar state) =F8 f8 (F5)
    assert [n.pitch for n in score.vocal if 32 <= n.onset < 64] == [66, 78, 65, 77]
    assert [(ch.onset, ch.name) for ch in score.chords][:3] == [(0, "D"), (32, "G"), (64, "A7")]


# --- S1 accepted language ---------------------------------------------------------------------


@pytest.mark.parametrize(
    ("text", "fragment"),
    [
        ("", "empty"),
        ("X:1\nT:\n", "Incomplete"),
        (build("C", [(None, "C32|", "Z|")]).replace("Q:1/4=90", "Q:90"), "tempo"),
        (build("C", [(None, "C16|", "Z|")]), "meter duration"),
        (build("C", [(None, "C33|", "Z|")]), "unsupported duration"),
        (build("C", [(None, "(3CDE8|", "Z|")]), "unsupported token"),
        (build("C", [(None, "C32-|", "Z|")]), "unresolved tie"),
        (build("C", [(None, "C32|", '"C"z32|')]), "Vocal, not Ins"),
        (build("H", [(None, "C32|", "Z|")]), "Unsupported key"),
        (build("C", [(None, "C32|C32|", "Z|")]), "different measure counts"),
    ],
)
def test_rejected_texts_carry_located_diagnostics(text: str, fragment: str) -> None:
    with pytest.raises(c.ScoreSyntaxError) as caught:
        c.from_abc(text)
    assert caught.value.diagnostics
    assert fragment.lower() in json.dumps(caught.value.diagnostics).lower()
    if text.strip() and fragment in ("meter duration", "unsupported duration", "unsupported token"):
        assert caught.value.diagnostics[0].get("line") == 10  # the Vocal music line


def test_measures_that_are_not_whole_units_are_outside_the_subset() -> None:
    """The upstream parser accepts M:3/32 with L:1/16 only as full-measure rests; we reject it."""
    text = build(
        "C", [(None, "Z|", "Z|")], header=HEADER.replace("M:4/4", "M:3/32").replace("L:1/32", "L:1/16")
    )
    upstream.parse_abc(text)
    with pytest.raises(c.ScoreSyntaxError) as caught:
        c.from_abc(text)
    assert "whole number" in caught.value.diagnostics[0]["message"]
    assert caught.value.diagnostics[0]["line"] == 10


def test_a_rejected_text_produces_no_score() -> None:
    bad = TRICKY.replace("d32|", "d31|", 1)
    with pytest.raises(PlenioValidationError):
        c.from_abc(bad)
    # the last valid score is untouched and still serialises
    good = c.from_abc(TRICKY)
    assert c.to_abc(good) == TRICKY


# --- accepted but not canonical: preserved verbatim, effective content in the model --------------


def test_accepted_variants_are_preserved_and_normalised_only_when_rewritten() -> None:
    text = build(
        "C",
        [
            ("verse", '"C""G" E8 E1z6z z16 |[K:G][K:D]D32|', " Z |[K:G][K:D]z32|"),
            (None, "c32|", "Z|"),
        ],
    )
    score = c.from_abc(text)
    assert c.to_abc(score) == text
    assert [(ch.onset, ch.name) for ch in score.chords] == [(0, "G")]  # the last chord at an onset
    assert [(k.onset, k.key) for k in score.keys] == [(0, "C"), (32, "D")]
    assert score.vocal[1] == c.Note(8, 1, 64)  # explicit 1
    # an edit elsewhere keeps the variants verbatim ...
    elsewhere = replace(score, vocal=score.vocal[:-1] + (c.Note(64, 32, 74),))
    out = c.to_abc(elsewhere)
    assert out.splitlines()[10] == text.splitlines()[10]
    assert out.splitlines()[12] == text.splitlines()[12]
    assert c.from_abc(out) == elsewhere
    # ... an edit in a measure writes that measure in the native style (the second chord is dropped)
    inside = replace(score, vocal=(c.Note(0, 8, 65),) + score.vocal[1:])
    out = c.to_abc(inside)
    assert out.splitlines()[10] == '"G"F8Ez16z6z|[K:G][K:D]D32|'
    assert out.splitlines()[12] == text.splitlines()[12]
    assert c.from_abc(out) == inside


def test_exotic_key_and_meter_placements_round_trip_and_stay_editable() -> None:
    header_override = HEADER.replace("M:4/4", "M:3/4")
    texts_ = [
        # the first group's field lines override the header key and meter
        header_override + "K:C\nV: Vocal\nM:4/4\nK:G\nF32|\nV: Ins\nM:4/4\nK:G\nZ|\n",
        # a key change written as a field in Vocal and inline in Ins (accepted, not canonical)
        build("C", [(None, "C32|", "Z|")]) + "V: Vocal\nK:D\nF32|\nV: Ins\n[K:D]z32|\n",
    ]
    for text in texts_:
        score = c.from_abc(text)
        assert c.to_abc(score) == text
        edited = replace(score, ins=(c.Note(0, 8, 60),))
        again = c.from_abc(c.to_abc(edited))
        assert again == edited


# --- S3 / S4 / S6 properties ----------------------------------------------------------------


@PROPERTY
@given(scores())
def test_round_trip_of_every_valid_model(score: c.Score) -> None:
    text = c.to_abc(score)
    upstream.parse_abc(text)  # S6
    again = c.from_abc(text)
    assert again == score  # S3
    assert c.to_abc(again) == text  # S2 on the writer's own output
    assert c.to_abc(replace(score)) == text  # S4


@PROPERTY
@given(texts())
def test_identity_of_every_accepted_text(text: str) -> None:
    assert c.to_abc(c.from_abc(text)) == text


@PROPERTY
@given(scores(), st.data())
def test_editing_a_parsed_score_keeps_unchanged_lines(score: c.Score, data: st.DataObject) -> None:
    """S5: replacing the notes of one measure rewrites only the music line of that measure's group."""
    text = c.to_abc(score)
    parsed = c.from_abc(text)
    measure = data.draw(st.integers(0, parsed.measure_count - 1))
    start, end = parsed.starts[measure], parsed.starts[measure + 1]
    inside = [n for n in parsed.ins if n.onset < end and n.end > start]
    kept = [n for n in parsed.ins if n not in inside]
    free = [n for n in inside if n.onset >= start and n.end <= end]
    assume_free = len(free) == len(inside) and bool(free)
    if not assume_free:
        return
    moved = [c.Note(n.onset, n.duration, (n.pitch + 1) % 128) for n in free]
    edited = parsed.with_track("ins", kept + moved)
    out = c.to_abc(edited)
    assert c.from_abc(out) == edited
    group = next(
        g for g, first in enumerate(parsed.group_firsts) if first <= measure < first + parsed.layout[g]
    )
    before, after = text.split("\n"), out.split("\n")
    assert len(before) == len(after)
    changed = [i for i, (x, y) in enumerate(zip(before, after, strict=True)) if x != y]
    ins_lines = [i for i, line in enumerate(before) if line == "V: Ins"]
    # the only changed line is the Ins music line of the edited measure's group
    assert len(changed) <= 1
    if changed:
        index = changed[0]
        preceding = max(i for i in ins_lines if i < index)
        assert ins_lines.index(preceding) == group


# --- invariants -------------------------------------------------------------------------------


def _base() -> c.Score:
    return c.new_score(measures=4, meter=(4, 4), unit=16, tempo=90, key="C")


@pytest.mark.parametrize(
    ("change", "fragment"),
    [
        ({"meters": ()}, "no measure"),
        ({"layout": (2, 3)}, "layout"),
        ({"layout": (5,)}, "layout"),
        ({"meters": ((4, 4), (3, 4), (4, 4), (4, 4)), "layout": (4,)}, "meter change must start a group"),
        ({"vocal": (c.Note(0, 20, 60), c.Note(16, 4, 62))}, "overlap"),
        ({"vocal": (c.Note(60, 8, 60),)}, "outside the score"),
        ({"vocal": (c.Note(0, 4, 128),)}, "0-127"),
        ({"chords": (c.ChordSymbol(0, "C"), c.ChordSymbol(0, "G"))}, "two chord symbols"),
        ({"chords": (c.ChordSymbol(0, "Cmaj9"),)}, "unsupported chord"),
        ({"keys": (c.KeyChange(0, "H"),)}, "unsupported key"),
        ({"keys": (c.KeyChange(4, "C"),)}, "onset 0"),
        ({"sections": (c.Section(1, "verse"),)}, "group start"),
        ({"sections": (c.Section(0, " verse"),)}, "comment line"),
        ({"unit": Fraction(1, 12)}, "power of two"),
        ({"meters": ((3, 32),) * 4}, "whole number"),
        ({"tempo": 0}, "tempo"),
    ],
)
def test_invalid_models_are_refused(change: dict[str, object], fragment: str) -> None:
    score = replace(_base(), **change)  # type: ignore[arg-type]
    with pytest.raises(c.ScoreModelError) as caught:
        c.to_abc(score)
    assert fragment in json.dumps(caught.value.diagnostics)


def test_new_score_is_all_rests_in_groups_of_four() -> None:
    score = c.new_score(measures=10, meter=(3, 4), unit=32, tempo=120, key="Eb", section="verse")
    text = c.to_abc(score)
    assert score.layout == (4, 4, 2)
    assert "V: Vocal\nZ4|\nV: Ins\nZ4|" in text
    assert text.startswith("X:1\nT:\nM:3/4\nL:1/32\nQ:1/4=120\n")
    assert c.from_abc(text) == score


def test_notes_crossing_bars_chords_and_key_changes_are_tied_in_native_style() -> None:
    score = replace(
        c.new_score(measures=2, unit=16, key="C"),
        keys=(c.KeyChange(0, "C", "header"), c.KeyChange(24, "D", "inline")),
        vocal=(c.Note(4, 20, 61), c.Note(28, 4, 66)),
        ins=(c.Note(0, 32, 48),),
        chords=(c.ChordSymbol(8, "Dm"),),
    )
    text = c.to_abc(score)
    lines = text.splitlines()
    # C#4 from 4 to 24: split at the chord (8) and the bar line (16) and the key change (24)
    assert lines[9] == 'z4^C4-"Dm"C8-|C8[K:D]z4F4|'
    assert lines[11] == "C,16-|C,8-[K:D]C,8|"
    assert c.from_abc(text) == score


def test_durations_are_decomposed_greedily_into_supported_values() -> None:
    assert c.decompose(0) == []
    assert c.decompose(5) == [4, 1]
    assert c.decompose(7) == [6, 1]
    assert c.decompose(14) == [12, 2]
    assert c.decompose(100) == [48, 48, 4]
    assert all(set(c.decompose(n)) <= upstream.DURATIONS for n in range(200))
