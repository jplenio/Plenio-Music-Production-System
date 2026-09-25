"""The score editor's backend: text positions, the element view, display text and edits.

The vendored upstream parser is the authority throughout: element pitches must equal its
sounding notes, and every edit result must parse and keep everything outside the edited
bars as it was - checked here independently of the checks inside ``edit.verify``.
"""

from __future__ import annotations

import functools
import json
import re
from fractions import Fraction
from pathlib import Path

import pytest

from plenio.core.errors import PlenioValidationError
from plenio.core.score import edit, native, operations
from plenio.core.score import model as score_model
from plenio.core.score.positions import locate, split_lines, structure
from plenio.third_party import yue2_abc_tools as upstream

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
HEADER = (
    "X:1\nT:\nM:4/4\nL:1/32\nQ:1/4=90\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
)


def build(key: str, groups: list[tuple[str | None, str, str]]) -> str:
    lines = [HEADER + f"K:{key}"]
    for section, vocal, ins in groups:
        if section:
            lines.append(f"% {section}")
        lines += ["V: Vocal", vocal, "V: Ins", ins]
    return "\n".join(lines) + "\n"


# Accidentals by letter across octaves, ties within and across bars, multi-bar rests,
# a group without a section comment.
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
    texts = {path.stem: path.read_text(encoding="utf-8") for path in sorted((FIXTURES / "abc").glob("*.abc"))}
    for path in sorted((FIXTURES / "cover").glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "abc" in data:
            texts[path.stem] = data["abc"]
    texts["tricky"] = TRICKY
    return texts


ALL = _fixtures()
REAL = {name: text for name, text in ALL.items() if name != "tricky"}


def test_every_fixture_is_found_and_valid() -> None:
    assert {
        "upstream-score",
        "upstream-score-jazz",
        "minimax-excerpt",
        "yue2-take-y2",
        "yue2-take-y3",
    } <= set(ALL)
    for text in ALL.values():
        upstream.parse_abc(text)


def music(text: str) -> str:
    return "\n".join(text.splitlines()[8:])


def sounding(model: score_model.ScoreModel, voice: str) -> list[list[object]]:
    """The model's sounding notes (tie chains joined) in the upstream parser's form."""
    result = []
    for head in (e for e in model.voice_elements(voice) if e.is_note and not e.tie_in):
        chain = model.chain(head.id)
        result.append([head.onset, head.midi, sum((s.duration for s in chain), Fraction(0))])
    return result


def slot_texts(text: str) -> dict[tuple[str, int], str]:
    shape = structure(text)
    return {(s.voice, s.number): s.text for voice in shape.slots for s in shape.slots[voice]}


def non_music_lines(text: str) -> list[str]:
    shape = structure(text)
    music_lines = {index for group in shape.groups for index in group.music.values()}
    return [line.text for line in shape.lines if line.index not in music_lines]


def assert_only_bars_changed(before: str, after: str, bars: set[tuple[str, int]]) -> None:
    """Every bar outside ``bars`` keeps its exact text, and no other line changes."""
    old, new = slot_texts(before), slot_texts(after)
    assert old.keys() == new.keys()
    changed = {slot for slot in old if old[slot] != new[slot]}
    assert changed <= bars, f"bars changed outside the edit: {sorted(changed - bars)}"
    assert non_music_lines(before) == non_music_lines(after)


# --- positions ------------------------------------------------------------------------------


def test_split_lines_offsets_and_line_endings() -> None:
    lines = split_lines("ab\r\ncd\ref\n")
    assert [(line.text, line.start, line.end) for line in lines] == [("ab", 0, 2), ("cd", 4, 6), ("ef", 7, 9)]
    assert split_lines("") == []
    assert [line.text for line in split_lines("a")] == ["a"]
    assert [line.text for line in split_lines("a\n")] == ["a"]
    assert [line.text for line in split_lines("a\n\nb")] == ["a", "", "b"]


def test_structure_of_the_tricky_score() -> None:
    shape = structure(TRICKY)
    assert len(shape.groups) == 4
    assert [(g.first_bar, g.bars) for g in shape.groups] == [(1, 1), (2, 2), (4, 2), (6, 2)]
    assert [bool(g.comments) for g in shape.groups] == [True, True, False, True]
    ins = shape.slots["Ins"]
    assert [(s.number, s.text, s.span, s.part) for s in ins] == [
        (1, "d8f8a16", 1, 0),
        (2, "Z", 2, 0),
        (3, "Z", 2, 1),
        (4, "D8F8A8d8", 1, 0),
        (5, "z32", 1, 0),
        (6, "Z", 2, 0),
        (7, "Z", 2, 1),
    ]
    # both bars of a multi-bar rest point at the one token
    assert TRICKY[ins[1].start : ins[1].end] == "Z2" and (ins[1].start, ins[1].end) == (
        ins[2].start,
        ins[2].end,
    )
    for voice in ("Vocal", "Ins"):
        for slot in shape.slots[voice]:
            token = TRICKY[slot.start : slot.end]
            assert token == slot.text or re.fullmatch(r"Z[2-4]?", token)
    assert shape.slot("Vocal", 0) is None and shape.slot("Vocal", 8) is None


def test_structure_offsets_ignore_surrounding_spaces() -> None:
    text = TRICKY.replace('"A7"A16-A16|', ' "A7"A16-A16  |')
    slot = structure(text).slot("Vocal", 3)
    assert slot is not None and text[slot.start : slot.end] == '"A7"A16-A16'


@pytest.mark.parametrize("name", sorted(ALL))
def test_structure_agrees_with_the_upstream_bar_grid(name: str) -> None:
    text = ALL[name]
    shape = structure(text)
    parsed = upstream.parse_abc(text)
    for voice in ("Vocal", "Ins"):
        assert len(shape.slots[voice]) == len(parsed.voices[voice].bars)
    assert sum(g.bars for g in shape.groups) == len(parsed.voices["Vocal"].bars)


def test_structure_is_tolerant_of_invalid_scores() -> None:
    broken = TRICKY.replace('"A7"A16-A16|', '"A7"A16-A15|').replace("K:D", "K:H")
    assert len(structure(broken).groups) == 4
    dangling = TRICKY + "% outro\nV: Vocal\n"
    assert len(structure(dangling).groups) == 4  # the incomplete group has no music
    assert structure("X:1\n").groups == []


INVALID = {
    "duration": (
        TRICKY.replace('"A7"A16-A16|', '"A7"A16-A15|'),
        "unsupported duration 15",
        16,
        '"A7"A16-A15',
    ),
    "bar length": (
        TRICKY.replace('"D"d32|\nV: Ins\nD8', '"D"d16|\nV: Ins\nD8'),
        "meter duration",
        20,
        '"D"d16',
    ),
    "token": (TRICKY.replace("d8f8a16|", "d8f8a16!|"), "unsupported token", 13, "d8f8a16!"),
    "tie at the end": (
        TRICKY[: -len('"D"d32|\nV: Ins\nZ2|\n')] + '"D"d32-|\nV: Ins\nZ2|\n',
        "unresolved tie",
        25,
        '"D"d32-',
    ),
    "key": (TRICKY.replace("K:D", "K:H"), "Unsupported key", 8, "K:H"),
    "tempo": (TRICKY.replace("Q:1/4=90", "Q:90"), "tempo", 5, "Q:90"),
    "measure counts": (
        TRICKY.replace("D8F8A8d8|z32|", "D8F8A8d8|"),
        "different measure counts",
        20,
        '"Bm"B8_B8B16|"D"d32|',
    ),
    "missing music": (TRICKY + "V: Vocal\n", "missing music line", 28, "V: Vocal"),
}


@pytest.mark.parametrize("case", sorted(INVALID))
def test_diagnostics_point_at_the_faulty_text(case: str) -> None:
    text, fragment, line, excerpt = INVALID[case]
    analysis = native.analyze(text)
    assert not analysis.ok
    error = analysis.errors[0]
    assert fragment in error.message
    assert error.line == line
    assert error.start is not None and error.end is not None
    assert text[error.start : error.end] == excerpt
    assert text.splitlines()[line - 1].find(excerpt) >= 0


def test_locate_messages_without_a_position() -> None:
    assert locate(TRICKY, "something the parser never says") is None
    assert locate("", "group 1, Vocal: expected V: Vocal") is None
    assert locate("X:1\n", "Incomplete native two-voice ABC") is None
    # a group number beyond the text points at the last line
    last = split_lines(TRICKY)[-1]
    assert locate(TRICKY, "group 9, Ins: expected V: Ins") == (last.index + 1, last.start, last.end)
    # a bar that does not exist falls back to the group's music line
    line, start, end = locate(TRICKY, "group 2, Vocal, bar 99: x") or (0, 0, 0)
    assert TRICKY[start:end] == '"G"^F8f8=F8f8|"A7"A16-A16|' and line == 16


def test_diagnostics_of_valid_scores_carry_no_error() -> None:
    for text in ALL.values():
        assert native.analyze(text).ok


# --- element view ---------------------------------------------------------------------------


@pytest.mark.parametrize("name", sorted(ALL))
def test_element_pitches_equal_the_upstream_parser(name: str) -> None:
    text = ALL[name]
    model = score_model.build(text)
    parsed = upstream.parse_abc(text)
    for voice in ("Vocal", "Ins"):
        assert sounding(model, voice) == parsed.voices[voice].notes
        assert [(b.onset, b.length, b.meter) for b in model.bars[voice]] == parsed.voices[voice].bars
    assert [(c.onset, c.name) for c in model.chords] == parsed.voices["Vocal"].chords


@pytest.mark.parametrize("name", sorted(ALL))
def test_element_ids_ranges_and_bars(name: str) -> None:
    text = ALL[name]
    model = score_model.build(text)
    ids = [e.id for e in model.elements]
    assert len(ids) == len(set(ids))
    for voice, prefix in (("Vocal", "V"), ("Ins", "I")):
        elements = model.voice_elements(voice)
        for bar in {e.bar for e in elements}:
            in_bar = model.in_bar(voice, bar)
            assert [e.id for e in in_bar] == [f"{prefix}{bar}.{n}" for n in range(len(in_bar))]
            info = model.bars[voice][bar - 1]
            assert sum((e.duration for e in in_bar), Fraction(0)) == info.length
            assert in_bar[0].onset == info.onset
        # onsets are contiguous across the whole voice
        time = Fraction(0)
        for element in elements:
            assert element.onset == time
            time += element.duration
    for element in model.elements:
        token = text[element.start : element.end]
        if element.kind == "bar_rest":
            assert re.fullmatch(r"Z[2-4]?", token)
        elif element.kind == "rest":
            assert token == f"z{element.units if element.units > 1 else ''}"
        else:
            assert token.lstrip("^_=").upper().startswith(element.letter)
            assert token.endswith("-") == element.tie_out
    for mark in model.chords:
        assert text[mark.start : mark.end] == f'"{mark.name}"'
        assert mark.id == f"C{mark.bar}.{mark.index}"


def test_elements_of_the_tricky_score() -> None:
    model = score_model.build(TRICKY)
    pitches = {e.id: e.midi for e in model.elements if e.is_note}
    # ^F sets the letter for the bar: f (another octave) is F#5, =F cancels it for f too
    assert [pitches[f"V2.{n}"] for n in range(4)] == [66, 78, 65, 77]
    # _B holds for the following B, and D major's C# holds for the tied continuation
    assert [pitches["V4.0"], pitches["V4.1"], pitches["V4.2"]] == [71, 70, 70]
    assert model.element("V1.0").kind == "rest" and model.element("V1.0").chord == "D"
    assert model.element("I2.0").kind == "bar_rest" and model.element("I3.0").kind == "bar_rest"
    assert model.element("I2.0").units == 32
    assert model.element("V2.0").chord == "G" and model.element("V2.1").chord is None


def test_tie_chains() -> None:
    model = score_model.build(TRICKY)
    assert [e.id for e in model.chain("V3.0")] == ["V3.0", "V3.1"]
    assert [e.id for e in model.chain("V3.1")] == ["V3.0", "V3.1"]
    assert [e.id for e in model.chain("V2.0")] == ["V2.0"]
    assert [e.id for e in model.chain("V1.0")] == ["V1.0"]  # a rest is its own chain
    across = build("C", [(None, "z16^F16-|F8-F8f16|", "Z2|")])
    model = score_model.build(across)
    chain = model.chain("V2.1")
    assert [e.id for e in chain] == ["V1.1", "V2.0", "V2.1"]
    assert {e.midi for e in chain} == {66}  # the unmarked continuation keeps F#
    assert model.element("V2.2").midi == 77  # but does not sharpen later f in that bar
    assert [e.tie_in for e in chain] == [False, True, True]
    assert [e.tie_out for e in chain] == [True, True, False]


def test_unknown_ids_are_refused_clearly() -> None:
    model = score_model.build(TRICKY)
    with pytest.raises(PlenioValidationError, match="no note or rest 'V9.0'"):
        model.element("V9.0")
    with pytest.raises(PlenioValidationError, match="no chord symbol"):
        model.chord("C9.0")


def test_build_refuses_invalid_scores() -> None:
    with pytest.raises(PlenioValidationError, match="not valid native two-voice ABC"):
        score_model.build(INVALID["duration"][0])


def test_pitch_names() -> None:
    assert score_model.pitch_name(60) == "C4"
    assert score_model.pitch_name(61) == "C#4"
    assert score_model.pitch_name(59) == "B3"


def test_element_at() -> None:
    model = score_model.build(TRICKY)
    assert score_model.element_at(model, "Vocal", Fraction(5)) == model.element("V2.1")
    assert score_model.element_at(model, "Ins", Fraction(5)) == model.element("I2.0")
    assert score_model.element_at(model, "Vocal", Fraction(1000)) is None


# --- display text ----------------------------------------------------------------------------


def _display_token(view: dict, element_id: str) -> str:
    start, end = next(e["display"] for e in view["elements"] if e["id"] == element_id)
    return str(view["display_abc"][start:end])


@pytest.mark.parametrize("name", sorted(ALL))
def test_display_ranges_cover_each_element(name: str) -> None:
    text = ALL[name]
    view = score_model.view(text)
    shown = view["display_abc"]
    model = score_model.build(text)
    for item in view["elements"]:
        element = model.element(item["id"])
        token = shown[item["display"][0] : item["display"][1]]
        if element.kind == "bar_rest":
            assert token == f"z{element.units}"
        elif element.kind == "rest":
            assert token == text[element.start : element.end]
        else:
            # the source token, possibly with an accidental written out in front
            source = text[element.start : element.end]
            assert token.endswith(source.lstrip("^_=")) and re.fullmatch(
                r"(\^\^|__|\^|_|=)?", token[: len(token) - len(source.lstrip("^_="))]
            )
    for chord in view["chords"]:
        assert shown[chord["display"][0] : chord["display"][1]] == f'"{chord["name"]}"'
    # display ranges are in text order and never overlap within a voice
    for voice in ("Vocal", "Ins"):
        ranges = [e["display"] for e in view["elements"] if e["voice"] == voice]
        assert all(a[1] <= b[0] for a, b in zip(ranges, ranges[1:], strict=False))


def _standard_abc_pitches(text: str) -> dict[str, list[int]]:
    """Pitches as a standard ABC reader (abcjs) reads the display text: accidentals per
    written note until the bar line, no letter-wide propagation, no tie carry-over."""
    lines = text.splitlines()
    key = lines[7][2:]
    result: dict[str, list[int]] = {"Vocal": [], "Ins": []}
    voice = None
    keys = {"Vocal": key, "Ins": key}
    for line in lines[8:]:
        if line.startswith("V: "):
            voice = line[3:]
            continue
        if line.startswith("K:") and voice:
            keys[voice] = line[2:]
            continue
        if line.startswith("%") or voice is None:
            continue
        for bar in line[:-1].split("|"):
            local: dict[tuple[str, int], int] = {}
            for match in upstream.TOKEN.finditer(bar):
                if match.group("key") is not None:
                    keys[voice] = match.group("key")
                    continue
                note = match.group("note")
                if match.group("chord") is not None or note in (None, "z"):
                    continue
                letter = note.upper()
                octave = match.group("oct")
                written = 60 + upstream.NATURAL[letter] + (12 if note.islower() else 0)
                written += 12 * (octave.count("'") - octave.count(","))
                acc = match.group("acc")
                if acc:
                    local[(letter, written)] = score_model.ACCIDENTAL_VALUE[acc]
                alteration = local.get((letter, written), upstream.key_accidentals(keys[voice])[letter])
                result[voice].append(written + alteration)
    return result


@pytest.mark.parametrize("name", sorted(ALL))
def test_display_reads_as_the_same_pitches_in_standard_abc(name: str) -> None:
    text = ALL[name]
    model = score_model.build(text)
    shown = _standard_abc_pitches(score_model.view(text)["display_abc"])
    for voice in ("Vocal", "Ins"):
        assert shown[voice] == [e.midi for e in model.voice_elements(voice) if e.is_note]


def test_display_accidental_across_octaves() -> None:
    text = build("C", [(None, "^f8F8F,8f'8|", "Z|")])
    view = score_model.view(text)
    assert [_display_token(view, f"V1.{n}") for n in range(4)] == ["^f8", "^F8", "^F,8", "^f'8"]


def test_display_tied_continuation_across_a_bar_line() -> None:
    text = build("C", [(None, "z16^F16-|F8F8f16|", "Z2|")])
    view = score_model.view(text)
    # the continuation sounds F#: standard ABC needs the sharp again after the bar line;
    # the next F is natural again (the continuation does not change the bar state natively)
    assert [_display_token(view, f"V2.{n}") for n in range(3)] == ["^F8", "=F8", "f16"]


def test_display_inline_key_change() -> None:
    plain = build("C", [(None, "F8[K:G]F8f16|", "z8[K:G]z8F16|")])
    view = score_model.view(plain)
    assert [_display_token(view, f"V1.{n}") for n in range(3)] == ["F8", "F8", "f16"]
    # after a key change, a letter that had an accidental earlier in the bar is always
    # written with its accidental (readers disagree whether the old one still applies)
    text = build("G", [(None, "=F8[K:C]F8[K:G]F8f8|", "z8[K:C]z8[K:G]F16|")])
    view = score_model.view(text)
    assert [_display_token(view, f"V1.{n}") for n in range(4)] == ["=F8", "=F8", "^F8", "f8"]
    assert [e.midi for e in score_model.build(text).voice_elements("Vocal")] == [65, 65, 66, 78]


def test_display_writes_full_bar_rests_bar_by_bar() -> None:
    view = score_model.view(TRICKY)
    shown = view["display_abc"]
    assert "Z" not in music(shown)
    assert "\nz32|z32|\n" in shown
    assert _display_token(view, "I2.0") == "z32" and _display_token(view, "I3.0") == "z32"
    first, second = (next(e["display"] for e in view["elements"] if e["id"] == i) for i in ("I2.0", "I3.0"))
    assert second[0] == first[1] + 1  # the second written-out bar follows after its bar line
    three = build("C", [(None, "c32|d32|e32|", "Z3|")])
    assert "\nz32|z32|z32|\n" in score_model.view(three)["display_abc"]


def test_display_section_annotations() -> None:
    shown = score_model.view(TRICKY)["display_abc"]
    assert '"^Intro""D"z32|' in shown
    assert '"^Verse""G"^F8f8=F8=f8|' in shown
    assert '"^Chorus""G"' in shown
    assert len(re.findall(r'"\^[A-Z][a-z]', shown)) == 3  # the group without a comment continues the verse
    view = score_model.view(TRICKY)
    assert _display_token(view, "V1.0") == "z32"  # the element range starts after the annotation


def test_display_is_not_the_model_score() -> None:
    shown = score_model.view(TRICKY)["display_abc"]
    with pytest.raises(upstream.AbcError):
        upstream.parse_abc(shown)  # annotations are not native chord symbols


def test_view_playback_data() -> None:
    view = score_model.view(TRICKY)
    assert view["bar_starts_s"] == pytest.approx([i * 8 / 3 for i in range(7)], abs=1e-3)
    tied = next(n for n in view["notes"]["Vocal"] if n["id"] == "V3.0")
    assert tied["segments"] == ["V3.0", "V3.1"] and tied["duration_s"] == pytest.approx(8 / 3, abs=1e-3)
    assert all(not n["id"].startswith("V3.1") for n in view["notes"]["Vocal"])
    chords = view["chords"]
    assert [c["name"] for c in chords] == ["D", "G", "A7", "Bm", "D", "G", "D"]
    assert chords[2]["pitches"] == [57, 61, 64, 67]
    assert chords[-1]["start_s"] + chords[-1]["duration_s"] == pytest.approx(7 * 8 / 3, abs=1e-3)
    element = next(e for e in view["elements"] if e["id"] == "V2.0")
    assert (
        element["name"] == "F#4"
        and element["chord"] == "G"
        and element["source"]
        == [
            score_model.build(TRICKY).element("V2.0").start,
            score_model.build(TRICKY).element("V2.0").end,
        ]
    )
    json.dumps(view)


def test_chord_pitches_for_playback() -> None:
    view = score_model.view(build("C", [(None, '"F#m7"c8"Bb/D"c8"C"c16|', "Z|")]))
    assert [c["pitches"] for c in view["chords"]] == [[54, 57, 61, 64], [38, 58, 62, 65], [48, 52, 55]]


# --- round trip ---------------------------------------------------------------------------------


@pytest.mark.parametrize("name", sorted(ALL))
def test_rewriting_every_bar_keeps_the_score(name: str) -> None:
    """``write_bar(bar_events(...))`` for every bar gives the same score (native spelling)."""
    text = ALL[name]
    model = score_model.build(text)
    new_bars = {
        (voice, info.number): edit.write_bar(edit.bar_events(model, voice, info.number), info.key)
        for voice in ("Vocal", "Ins")
        for info in model.bars[voice]
    }
    rewritten = edit.replace_bars(model, new_bars)
    comparison = upstream.compare(model.score, upstream.parse_abc(rewritten))
    assert comparison["match"], comparison["differences"]
    again = score_model.build(rewritten)

    def row(e: score_model.Element) -> tuple[object, ...]:
        # a rest filling a bar is written natively as a full-bar rest
        return (e.id, "note" if e.is_note else "rest", e.midi, e.units, e.tie_out)

    assert [row(e) for e in again.elements] == [row(e) for e in model.elements]
    assert [(c.id, c.name) for c in again.chords] == [(c.id, c.name) for c in model.chords]


def test_build_of_the_same_text_gives_the_same_view() -> None:
    for text in ALL.values():
        assert score_model.view(text) == score_model.view(str(text))


# --- note edits -------------------------------------------------------------------------------


@functools.lru_cache(maxsize=16)
def _model(text: str) -> score_model.ScoreModel:
    return score_model.build(text)


def _check_edit(before: str, result: edit.EditResult, bars: set[tuple[str, int]]) -> score_model.ScoreModel:
    after = score_model.build(result.abc)
    assert after.bars == _model(before).bars
    assert_only_bars_changed(before, result.abc, bars)
    for element_id in result.select:
        after.element(element_id)
    return after


def test_shift_pitch_respells_the_bar_natively() -> None:
    result = edit.set_pitch(TRICKY, ["V2.2"], semitones=1)
    # F natural -> F#: the redundant ^F goes, and f keeps F natural with an explicit =
    assert '"G"F8f8F8=f8|' in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 2)})
    assert [e.midi for e in after.in_bar("Vocal", 2)] == [66, 78, 66, 77]
    assert result.changes == ("bar 2 Vocal: F4 -> F#4",)
    assert result.select == ("V2.2",)


def test_shift_pitch_moves_the_whole_tied_note() -> None:
    result = edit.set_pitch(TRICKY, ["V3.1"], semitones=2)
    assert '"A7"B16-B16|' in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 3)})
    assert [e.midi for e in after.chain("V3.0")] == [71, 71]
    assert result.select == ("V3.0",)
    across = build("C", [(None, "z16^F16-|F8-F8f16|", "Z2|")])
    result = edit.set_pitch(across, ["V2.0"], semitones=-1)
    after = _check_edit(across, result, {("Vocal", 1), ("Vocal", 2)})
    assert [e.midi for e in after.chain("V1.1")] == [65, 65, 65]
    assert after.element("V2.2").midi == 77


def test_set_pitch_to_a_midi_number_and_a_multi_selection() -> None:
    result = edit.set_pitch(TRICKY, ["I1.0"], midi=61)
    assert "\nC8f8a16|\n" in result.abc
    _check_edit(TRICKY, result, {("Ins", 1)})
    result = edit.set_pitch(TRICKY, ["I4.0", "I4.3", "V5.0"], semitones=12)
    after = _check_edit(TRICKY, result, {("Ins", 4), ("Vocal", 5)})
    assert [e.midi for e in after.in_bar("Ins", 4)] == [74, 66, 69, 86]
    assert after.element("V5.0").midi == 86
    assert len(result.changes) == 3


def test_set_pitch_without_a_change() -> None:
    result = edit.set_pitch(TRICKY, ["V2.0"], semitones=0)
    assert result.abc == TRICKY and result.changes == ("no pitch changed",)
    assert result.select == ("V2.0",)


@pytest.mark.parametrize(
    ("call", "message"),
    [
        (lambda: edit.set_pitch(TRICKY, ["V1.0"], semitones=1), "V1.0 is a rest; select a note"),
        (lambda: edit.set_pitch(TRICKY, ["V99.0"], semitones=1), "no note or rest 'V99.0'"),
        (lambda: edit.set_pitch(TRICKY, [], semitones=1), "Select at least one note"),
        (lambda: edit.set_pitch(TRICKY, ["V2.0"]), "either a pitch or a number of semitones"),
        (lambda: edit.set_pitch(TRICKY, ["V2.0"], midi=60, semitones=1), "either a pitch or"),
        (lambda: edit.set_pitch(TRICKY, ["V2.0"], semitones=100), "outside the MIDI range"),
        (lambda: edit.set_pitch(TRICKY, ["V2.0"], midi=-1), "outside the MIDI range"),
    ],
)
def test_set_pitch_refusals(call, message: str) -> None:  # type: ignore[no-untyped-def]
    with pytest.raises(PlenioValidationError, match=re.escape(message)):
        call()


def test_set_pitch_refuses_invalid_scores() -> None:
    with pytest.raises(PlenioValidationError, match="not valid"):
        edit.set_pitch(INVALID["duration"][0], ["V2.0"], semitones=1)


def test_lengthen_into_following_rests() -> None:
    text = build("C", [(None, "c8z8z16|", "Z|")])
    result = edit.set_duration(text, "V1.0", 16)
    assert "\nc16z16|\n" in result.abc
    _check_edit(text, result, {("Vocal", 1)})
    result = edit.set_duration(text, "V1.0", 32)
    assert "\nc32|\n" in result.abc
    assert result.changes == ("bar 1 Vocal: C5 length 8 -> 32",)
    assert result.select == ("V1.0",)


def test_shorten_fills_with_a_rest() -> None:
    result = edit.set_duration(TRICKY, "V4.2", 8)
    assert '"Bm"B8_B8B8z8|' in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 4)})
    assert after.element("V4.3").kind == "rest"
    assert after.element("V4.2").midi == 70  # _B still holds for the shortened note


def test_shorten_a_tied_note_removes_the_tie_with_a_warning() -> None:
    result = edit.set_duration(TRICKY, "V3.0", 8)
    assert '"A7"A8z8A16|' in result.abc
    assert result.warnings == ("bar 3: the tie to the next note was removed; it is now a new attack",)
    _check_edit(TRICKY, result, {("Vocal", 3)})
    across = build("C", [(None, "z16^F16-|F16f16|", "Z2|")])
    result = edit.set_duration(across, "V1.1", 8)
    after = _check_edit(across, result, {("Vocal", 1), ("Vocal", 2)})
    # the former continuation is a new attack and keeps its pitch (now written ^F)
    assert after.element("V2.0").midi == 66 and not after.element("V2.0").tie_in
    assert "|^F16=f16|" in result.abc  # f stays natural: the new ^F now sets the bar state
    assert after.element("V2.1").midi == 77


def test_set_duration_without_a_change() -> None:
    result = edit.set_duration(TRICKY, "V2.0", 8)
    assert result.abc == TRICKY and result.changes == ("no length changed",)


@pytest.mark.parametrize(
    ("element", "units", "message"),
    [
        ("V2.0", 5, "Length 5 is not a native note length"),
        ("V2.0", 16, "Only 0 units of rest follow the note in bar 2; it cannot grow by 8"),
        ("V3.0", 32, "tied to the next one"),
        ("V1.0", 16, "V1.0 is a rest; select a note"),
    ],
)
def test_set_duration_refusals(element: str, units: int, message: str) -> None:
    with pytest.raises(PlenioValidationError, match=re.escape(message)) as caught:
        edit.set_duration(TRICKY, element, units)
    assert caught.value.hint or "native note length" not in message


def test_lengthen_refuses_to_cross_a_chord() -> None:
    text = build("C", [(None, 'c8z8"G"z16|', "Z|")])
    with pytest.raises(PlenioValidationError, match="chord G starts inside the new length"):
        edit.set_duration(text, "V1.0", 32)
    assert "c16" in edit.set_duration(text, "V1.0", 16).abc  # up to the chord is fine


def test_note_to_rest_merges_rests_and_whole_chains() -> None:
    result = edit.note_to_rest(TRICKY, ["V3.1"])
    assert '"A7"z32|' in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 3)})
    assert after.element("V3.0").kind == "rest"
    assert result.changes == ("bar 3 Vocal: A4 -> rest",)
    result = edit.note_to_rest(TRICKY, ["I4.0", "I4.1", "I4.2", "I4.3"])
    assert "\nZ|z32|\n" in result.abc  # an empty bar becomes a full-bar rest
    _check_edit(TRICKY, result, {("Ins", 4)})


def test_note_to_rest_keeps_the_pitch_of_later_notes() -> None:
    result = edit.note_to_rest(TRICKY, ["V2.0"])  # ^F goes; f must stay F#5
    after = _check_edit(TRICKY, result, {("Vocal", 2)})
    assert [e.midi for e in after.in_bar("Vocal", 2) if e.is_note] == [78, 65, 77]


def test_note_to_rest_refuses_rests() -> None:
    with pytest.raises(PlenioValidationError, match="is a rest"):
        edit.note_to_rest(TRICKY, ["V1.0"])


def test_rest_to_note_in_a_multi_bar_rest_splits_only_that_bar() -> None:
    result = edit.rest_to_note(TRICKY, "I3.0", midi=60)
    assert "\nZ|=C32|\n" in result.abc  # C natural in D major
    after = _check_edit(TRICKY, result, {("Ins", 3)})
    assert after.element("I3.0").midi == 60 and after.element("I2.0").kind == "bar_rest"
    assert result.select == ("I3.0",)
    result = edit.rest_to_note(TRICKY, "I2.0")  # nearby pitch: the note before (a16)
    assert "\na32|Z|\n" in result.abc
    assert result.changes == ("bar 2 Ins: rest -> A5",)


def test_rest_to_note_uses_the_nearest_pitch_and_a_default() -> None:
    result = edit.rest_to_note(TRICKY, "V1.0")  # no note before: the next one (F#4)
    assert '"D"F32|' in result.abc
    empty = build("C", [(None, "z32|", "Z|")])
    assert "\nc32|\n" in edit.rest_to_note(empty, "V1.0").abc
    assert "\nG32|\n" in edit.rest_to_note(empty, "I1.0").abc


def test_rest_to_note_of_an_unsupported_rest_length() -> None:
    text = build("C", [(None, "c8z20c4|", "Z|")])  # z20 is not written natively, but z16z4 is
    text = text.replace("z20", "z16z4")
    result = edit.rest_to_note(text, "V1.1", midi=62)
    assert "\nc8D16z4c4|\n" in result.abc


@pytest.mark.parametrize(
    ("call", "message"),
    [
        (lambda: edit.rest_to_note(TRICKY, "V2.0"), "V2.0 is already a note"),
        (lambda: edit.rest_to_note(TRICKY, "V1.0", midi=128), "outside the MIDI range"),
    ],
)
def test_rest_to_note_refusals(call, message: str) -> None:  # type: ignore[no-untyped-def]
    with pytest.raises(PlenioValidationError, match=re.escape(message)):
        call()


def test_set_chord_adds_and_replaces() -> None:
    result = edit.set_chord(TRICKY, "V2.1", "Em")
    assert '"G"F8"Em"f8=F8f8|' in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 2)})
    assert [c.name for c in after.chords_in_bar(2)] == ["G", "Em"]
    assert result.changes == ("bar 2: chord Em added",)
    result = edit.set_chord(TRICKY, "V2.0", " Em ")
    assert '"Em"F8f8=F8f8|' in result.abc
    assert result.changes == ("bar 2: chord G -> Em",)


def test_set_chord_from_an_ins_selection_uses_the_vocal_onset() -> None:
    result = edit.set_chord(TRICKY, "I4.1", "F#m")  # Ins onset = Vocal V4.1
    assert '"Bm"B8"F#m"_B8B16|' in result.abc
    _check_edit(TRICKY, result, {("Vocal", 4)})
    assert result.select == ("I4.1",)


@pytest.mark.parametrize(
    ("element", "name", "message"),
    [
        ("V2.1", "Hx", "'Hx' is not a supported chord symbol"),
        ("V2.1", "Cmaj9", "not a supported chord symbol"),
        ("I1.1", "Em", "inside a longer Vocal note or rest"),
    ],
)
def test_set_chord_refusals(element: str, name: str, message: str) -> None:
    with pytest.raises(PlenioValidationError, match=re.escape(message)) as caught:
        edit.set_chord(TRICKY, element, name)
    assert caught.value.hint


def test_remove_chord() -> None:
    result = edit.remove_chord(TRICKY, "C3.0")
    assert "|A16-A16|" in result.abc
    after = _check_edit(TRICKY, result, {("Vocal", 3)})
    assert [c.name for c in after.chords] == ["D", "G", "Bm", "D", "G", "D"]
    assert result.changes == ("bar 3: chord A7 removed",)
    two = edit.set_chord(TRICKY, "V2.2", "C").abc
    result = edit.remove_chord(two, "C2.1")
    _same_music(TRICKY, result.abc)  # the rewritten bar is spelled natively (no redundant ^F)
    assert '"G"F8f8=F8f8|' in result.abc
    with pytest.raises(PlenioValidationError, match="no chord symbol"):
        edit.remove_chord(TRICKY, "C1.1")


def _every(items: list, step: int) -> list:
    return items[::step]


@pytest.mark.parametrize("name", sorted(REAL))
def test_note_operations_on_real_scores(name: str) -> None:
    """A sample of every note operation on the real scores: valid, local and as intended."""
    text = REAL[name]
    model = score_model.build(text)
    notes = [e for e in model.elements if e.is_note]
    rests = [e for e in model.elements if not e.is_note]
    before = upstream.parse_abc(text).voices
    for element in _every(notes, 13):
        for semitones in (1, -1, 12):
            result = edit.set_pitch(text, [element.id], semitones=semitones)
            chain = model.chain(element.id)
            after = _check_edit(text, result, {(s.voice, s.bar) for s in chain})
            assert after.element(result.select[0]).midi == (element.midi or 0) + semitones
            parsed = upstream.parse_abc(result.abc).voices[element.voice].notes
            old = before[element.voice].notes
            assert len(parsed) == len(old)
            assert [n for n in parsed if n[0] != chain[0].onset] == [n for n in old if n[0] != chain[0].onset]
    for element in _every(notes, 17):
        result = edit.note_to_rest(text, [element.id])
        chain = model.chain(element.id)
        _check_edit(text, result, {(s.voice, s.bar) for s in chain})
        for units in (1, 2, 4):
            if units < element.units:
                result = edit.set_duration(text, element.id, units)
                bars = {(element.voice, element.bar)}
                if element.tie_out:
                    nxt = chain[chain.index(element) + 1]
                    bars.add((nxt.voice, nxt.bar))
                _check_edit(text, result, bars)
    for element in _every(rests, 7):
        result = edit.rest_to_note(text, element.id)
        after = _check_edit(text, result, {(element.voice, element.bar)})
        assert after.element(result.select[0]).is_note


@pytest.mark.parametrize("name", sorted(REAL))
def test_chord_operations_on_real_scores(name: str) -> None:
    text = REAL[name]
    model = score_model.build(text)
    for mark in _every(list(model.chords), 5):
        result = edit.remove_chord(text, mark.id)
        _check_edit(text, result, {("Vocal", mark.bar)})
        vocal = score_model.element_at(model, "Vocal", mark.onset)
        assert vocal is not None
        replaced = edit.set_chord(text, vocal.id, "Bb/D")
        _check_edit(text, replaced, {("Vocal", mark.bar)})
        assert (mark.onset, "Bb/D") in upstream.parse_abc(replaced.abc).voices["Vocal"].chords


# --- section edits -------------------------------------------------------------------------------


def labels(text: str) -> list[tuple[str, int, int]]:
    return [(s.label, s.first_bar, s.bars) for s in edit.sections(text)]


def _same_music(before: str, after: str) -> None:
    assert upstream.compare(upstream.parse_abc(before), upstream.parse_abc(after))["match"]
    assert (
        upstream.parse_abc(before).voices["Vocal"].chords == upstream.parse_abc(after).voices["Vocal"].chords
    )


def test_sections_of_the_tricky_score() -> None:
    assert labels(TRICKY) == [("intro", 1, 1), ("verse", 2, 4), ("chorus", 6, 2)]
    no_comment = build("C", [(None, "c32|", "Z|")])
    assert labels(no_comment) == [("untitled", 1, 1)]


def test_rename_section() -> None:
    result = edit.rename_section(TRICKY, 2, "  Pre-Chorus ")
    assert "% pre-chorus\n" in result.abc and "% verse" not in result.abc
    assert labels(result.abc)[1] == ("pre-chorus", 2, 4)
    assert result.changes == ("section 2: verse -> pre-chorus",)
    _same_music(TRICKY, result.abc)
    assert len(result.abc.splitlines()) == len(TRICKY.splitlines())
    untitled = build("C", [(None, "c32|", "Z|")])
    result = edit.rename_section(untitled, 1, "intro")
    assert labels(result.abc) == [("intro", 1, 1)]
    assert result.abc.splitlines()[8] == "% intro"


@pytest.mark.parametrize("label", ["", "Ü!", "x" * 31, "-verse", 'verse "2"'])
def test_rename_section_refuses_unusable_names(label: str) -> None:
    with pytest.raises(PlenioValidationError) as caught:
        edit.rename_section(TRICKY, 2, label)
    assert "not a usable section name" in caught.value.message
    assert "lower-case words" in (caught.value.hint or "")


def test_section_index_is_checked() -> None:
    for call in (
        lambda: edit.rename_section(TRICKY, 4, "outro"),
        lambda: edit.rename_section(TRICKY, 0, "outro"),
        lambda: edit.merge_section(TRICKY, 4),
        lambda: edit.move_section_boundary(TRICKY, 9, 3),
    ):
        with pytest.raises(PlenioValidationError, match="has no section .*; it has 3"):
            call()


def test_move_section_boundary_earlier() -> None:
    result = edit.move_section_boundary(TRICKY, 3, 5)
    assert labels(result.abc) == [("intro", 1, 1), ("verse", 2, 3), ("chorus", 5, 3)]
    assert result.changes == ("section chorus now starts at bar 5 (was 6)",)
    _same_music(TRICKY, result.abc)
    # the group of bars 4-5 was split; its first half keeps its lines untouched
    assert '\n"Bm"B8_B8B16|\nV: Ins\nD8F8A8d8|\n% chorus\nV: Vocal\n"D"d32|\nV: Ins\nz32|\n' in result.abc
    result = edit.move_section_boundary(TRICKY, 3, 4)  # onto an existing group start
    assert labels(result.abc) == [("intro", 1, 1), ("verse", 2, 2), ("chorus", 4, 4)]
    assert result.abc.count("% chorus") == 1
    _same_music(TRICKY, result.abc)


def test_move_section_boundary_later() -> None:
    result = edit.move_section_boundary(TRICKY, 2, 3)
    assert labels(result.abc) == [("intro", 1, 2), ("verse", 3, 3), ("chorus", 6, 2)]
    _same_music(TRICKY, result.abc)
    assert "\nV: Ins\nZ|\n% verse\nV: Vocal\n" in result.abc  # the multi-bar rest was split
    result = edit.move_section_boundary(TRICKY, 2, 5)
    assert labels(result.abc) == [("intro", 1, 4), ("verse", 5, 1), ("chorus", 6, 2)]
    _same_music(TRICKY, result.abc)


def test_move_section_boundary_to_the_same_bar() -> None:
    result = edit.move_section_boundary(TRICKY, 2, 2)
    assert result.abc == TRICKY and result.changes == ("no boundary moved",)


@pytest.mark.parametrize(
    ("index", "bar", "message"),
    [
        (1, 2, "The first section always starts at bar 1"),
        (2, 1, "Section verse can start at bar 2 ... 5"),
        (2, 6, "Section verse can start at bar 2 ... 5"),
        (3, 2, "Section chorus can start at bar 3 ... 7"),
    ],
)
def test_move_section_boundary_refusals(index: int, bar: int, message: str) -> None:
    with pytest.raises(PlenioValidationError, match=re.escape(message)):
        edit.move_section_boundary(TRICKY, index, bar)


def test_split_section() -> None:
    result = edit.split_section(TRICKY, 3, "bridge")
    assert labels(result.abc) == [("intro", 1, 1), ("verse", 2, 1), ("bridge", 3, 3), ("chorus", 6, 2)]
    assert result.changes == ("new section bridge from bar 3",)
    _same_music(TRICKY, result.abc)
    result = edit.split_section(TRICKY, 4, "Pre Chorus")  # at a group start without comment
    assert labels(result.abc)[2] == ("pre chorus", 4, 2)
    assert len(result.abc.splitlines()) == len(TRICKY.splitlines()) + 1


@pytest.mark.parametrize(
    ("bar", "message"),
    [
        (1, "A new section can start at bar 2 ... 7"),
        (8, "A new section can start at bar 2 ... 7"),
        (6, "A section already starts at bar 6; rename it instead"),
    ],
)
def test_split_section_refusals(bar: int, message: str) -> None:
    with pytest.raises(PlenioValidationError, match=re.escape(message)):
        edit.split_section(TRICKY, bar, "bridge")


def test_merge_section() -> None:
    result = edit.merge_section(TRICKY, 3)
    assert labels(result.abc) == [("intro", 1, 1), ("verse", 2, 6)]
    assert result.changes == ("section chorus joined to verse",)
    assert "% chorus" not in result.abc
    _same_music(TRICKY, result.abc)
    with pytest.raises(PlenioValidationError, match="The first section has no section before it"):
        edit.merge_section(TRICKY, 1)


def test_section_edits_keep_other_lines_byte_identical() -> None:
    for result in (
        edit.rename_section(TRICKY, 3, "outro"),
        edit.merge_section(TRICKY, 2),
        edit.split_section(TRICKY, 7, "tag"),
        edit.move_section_boundary(TRICKY, 3, 7),
    ):
        before = [line for line in TRICKY.splitlines() if not line.startswith("% ")]
        after = [line for line in result.abc.splitlines() if not line.startswith("% ")]
        kept = [line for line in before if line in after]
        # only group lines of a split group may differ; everything else is kept verbatim
        assert len(before) - len(kept) <= 4
        assert result.abc.endswith("\n")


@pytest.mark.parametrize("name", sorted(REAL))
def test_every_boundary_move_on_real_scores(name: str) -> None:
    text = REAL[name]
    found = edit.sections(text)
    for index in range(2, len(found) + 1):
        previous, section = found[index - 2], found[index - 1]
        for start in {
            previous.first_bar + 1,
            section.first_bar - 1,
            section.first_bar + 1,
            section.first_bar + section.bars - 1,
        }:
            if not previous.first_bar < start <= section.first_bar + section.bars - 1:
                continue
            result = edit.move_section_boundary(text, index, start)
            _same_music(text, result.abc)
            assert edit.sections(result.abc)[index - 1].first_bar == start
            assert edit.sections(result.abc)[index - 1].label == section.label
            assert [s.label for s in edit.sections(result.abc)] == [s.label for s in found]


# --- operation registry -------------------------------------------------------------------------


def test_apply_runs_each_registered_operation() -> None:
    cases = {
        "set_pitch": {"ids": ["V2.0"], "midi": 67},
        "shift_pitch": {"ids": ["V2.0"], "semitones": 2},
        "set_duration": {"id": "V4.2", "units": 8},
        "note_to_rest": {"ids": ["V2.0"]},
        "rest_to_note": {"id": "V1.0", "midi": 62},
        "set_chord": {"id": "V2.1", "name": "Em"},
        "remove_chord": {"chord": "C3.0"},
        "rename_section": {"section": 2, "label": "bridge"},
        "move_section_boundary": {"section": 3, "start_bar": 5},
        "split_section": {"bar": 3, "label": "bridge"},
        "merge_section": {"section": 3},
        "transpose": {"semitones": 2},
        "set_tempo": {"bpm": 120},
        "strip_chords": {},
        "silence_voice": {"voice": "Ins"},
        "move_vocal_to_ins": {"conflict": "keep_ins"},
    }
    assert set(cases) == set(operations.OPERATIONS)
    for name, parameters in cases.items():
        result = operations.apply(TRICKY, {"op": name, **parameters})
        assert result.abc != TRICKY, name
        assert result.changes, name
        upstream.parse_abc(result.abc)


def test_apply_accepts_whole_floats_and_defaults() -> None:
    assert operations.apply(TRICKY, {"op": "shift_pitch", "ids": ["V2.0"], "semitones": 1.0}).abc != TRICKY
    assert operations.apply(TRICKY, {"op": "transpose"}).abc == score_model.build(TRICKY).text
    assert "Q:1/4=120" in operations.apply(TRICKY, {"op": "set_tempo", "bpm": 120}).abc


@pytest.mark.parametrize(
    ("operation", "message"),
    [
        ({"op": "explode"}, "Unknown score operation 'explode'"),
        ({}, "Unknown score operation None"),
        ({"op": "shift_pitch", "ids": ["V2.0"]}, "needs a whole number 'semitones'"),
        ({"op": "shift_pitch", "ids": ["V2.0"], "semitones": 1.5}, "needs a whole number 'semitones'"),
        ({"op": "shift_pitch", "ids": ["V2.0"], "semitones": True}, "needs a whole number 'semitones'"),
        ({"op": "shift_pitch", "ids": ["V2.0"], "semitones": "1"}, "needs a whole number 'semitones'"),
        ({"op": "set_pitch", "ids": ["V2.0"], "midi": None}, "needs a whole number 'midi'"),
        ({"op": "shift_pitch", "semitones": 1}, "needs the ids of the selected notes"),
        ({"op": "shift_pitch", "ids": [], "semitones": 1}, "needs the ids of the selected notes"),
        ({"op": "shift_pitch", "ids": "V2.0", "semitones": 1}, "needs the ids of the selected notes"),
        ({"op": "shift_pitch", "ids": [3], "semitones": 1}, "needs the ids of the selected notes"),
        ({"op": "set_duration", "id": "V2.0"}, "needs a whole number 'units'"),
        ({"op": "set_chord", "id": "V2.0", "name": "  "}, "needs a text 'name'"),
        ({"op": "remove_chord"}, "needs a text 'chord'"),
        ({"op": "rename_section", "section": 2, "label": 5}, "needs a text 'label'"),
        ({"op": "rename_section", "section": "2", "label": "x"}, "needs a whole number 'section'"),
        ({"op": "move_section_boundary", "section": 2}, "needs a whole number 'start_bar'"),
        ({"op": "split_section", "label": "x"}, "needs a whole number 'bar'"),
        ({"op": "set_tempo"}, "needs a whole number 'bpm'"),
        ({"op": "silence_voice", "voice": "Bass"}, "Bass"),
    ],
)
def test_apply_parameter_errors(operation: dict, message: str) -> None:
    with pytest.raises(PlenioValidationError, match=re.escape(message)):
        operations.apply(TRICKY, operation)


def test_unknown_operation_names_the_valid_ones() -> None:
    with pytest.raises(PlenioValidationError) as caught:
        operations.apply(TRICKY, {"op": "explode"})
    assert "shift_pitch" in (caught.value.hint or "")


def test_editor_view() -> None:
    view = operations.editor_view(TRICKY)
    assert view["ok"] and {"elements", "chords", "notes", "bar_starts_s", "display_abc"} <= set(view)
    assert [s["label"] for s in view["sections"]] == ["intro", "verse", "chorus"]
    invalid = operations.editor_view(INVALID["duration"][0])
    assert not invalid["ok"] and "elements" not in invalid and "display_abc" not in invalid
    assert invalid["diagnostics"][0]["line"] == 16
    json.dumps(view)
    json.dumps(invalid)


def test_frontend_fixture_is_current() -> None:
    """The frontend tests use the editor view of TRICKY; keep it equal to the backend's."""
    path = Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "tricky-score.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["abc"] == TRICKY
    assert data["view"] == json.loads(json.dumps(operations.editor_view(TRICKY))), (
        "regenerate frontend/tests/fixtures/tricky-score.json from operations.editor_view(TRICKY)"
    )
