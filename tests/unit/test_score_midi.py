"""MIDI boundary (next-release plan §10.4): lossless for Plenio's own files, reported for foreign ones."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st

from plenio.core.errors import PlenioValidationError
from plenio.core.score import canonical as c
from plenio.core.score import midi
from plenio.core.score.midi import GuideNote, _chunk, _meta, _track
from score_strategies import scores

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def _fixture_texts() -> list[str]:
    texts = [p.read_text(encoding="utf-8") for p in sorted((FIXTURES / "abc").glob("*.abc"))]
    for path in sorted((FIXTURES / "cover").glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and "abc" in data:
            texts.append(data["abc"])
    return texts


@pytest.mark.parametrize("text", _fixture_texts())
def test_round_trip_of_real_scores(text: str) -> None:
    score = c.from_abc(text)
    back = midi.import_midi(midi.export_midi(score, title="Song"))
    assert back.score == score
    assert back.report == ()
    assert c.to_abc(back.score) == c.canonical_text(score)


@settings(max_examples=120, deadline=None, suppress_health_check=[HealthCheck.too_slow])
@given(
    scores(), st.lists(st.tuples(st.integers(0, 200), st.integers(1, 64), st.integers(0, 127)), max_size=8)
)
def test_round_trip_of_every_valid_score_with_guide_notes(
    score: c.Score, raw_guide: list[tuple[int, int, int]]
) -> None:
    guide = tuple(
        sorted(
            (GuideNote(o, min(d, score.total - o), p) for o, d, p in raw_guide if o < score.total),
            key=lambda g: (g.onset, g.pitch),
        )
    )
    data = midi.export_midi(score, guide=guide)
    back = midi.import_midi(data)
    assert back.score == score
    assert back.guide == guide
    assert back.report == ()


def test_file_layout() -> None:
    score = c.from_abc((FIXTURES / "abc" / "upstream-score.abc").read_text(encoding="utf-8"))
    data = midi.export_midi(score)
    assert data[:4] == b"MThd"
    assert int.from_bytes(data[8:10], "big") == 1  # type 1
    assert int.from_bytes(data[10:12], "big") == 4  # conductor, Vocal, Instrument, Chords
    assert int.from_bytes(data[12:14], "big") == 480
    fmt, ppq, tracks = midi._read(data)
    assert [t.name for t in tracks] == ["", "Vocal", "Instrument", "Chords"]
    texts = [midi._text(e.data) for e in tracks[3].events if e.kind == "meta" and e.meta == 0x01]
    assert texts[:2] == ["plenio:chord C", "plenio:chord G"]
    velocities = {e.velocity for t in tracks for e in t.events if e.kind == "on"}
    assert velocities == {midi.VELOCITY}
    assert midi._ppq(1024) % 1 == 0 and midi._ppq(1024) * 4 % 1024 == 0


# --- foreign files ----------------------------------------------------------------------------


def smf(*tracks: list[tuple[int, int, bytes]], ppq: int = 96, names: tuple[str, ...] = ()) -> bytes:
    body = []
    for index, events in enumerate(tracks):
        named = list(events)
        if index < len(names) and names[index]:
            named.insert(0, (0, 0, _meta(0x03, names[index].encode())))
        end = max((tick for tick, _o, _m in named), default=0)
        body.append(_track(named, end))
    header = _chunk(b"MThd", (1).to_bytes(2, "big") + len(body).to_bytes(2, "big") + ppq.to_bytes(2, "big"))
    return header + b"".join(body)


def note(tick: int, length: int, pitch: int, channel: int = 0) -> list[tuple[int, int, bytes]]:
    return [
        (tick, 2, bytes([0x90 | channel, pitch, 100])),
        (tick + length, 1, bytes([0x80 | channel, pitch, 0])),
    ]


def test_foreign_file_is_quantised_reduced_and_reported() -> None:
    conductor = [
        (0, 0, _meta(0x51, (500_000).to_bytes(3, "big"))),  # 120 BPM
        (96 * 8, 0, _meta(0x51, (600_000).to_bytes(3, "big"))),  # a later tempo change: dropped
        (0, 1, _meta(0x58, bytes([3, 2, 24, 8]))),  # 3/4
        (96 * 4, 1, _meta(0x58, bytes([4, 2, 24, 8]))),  # 4/4 inside bar 2 (bar 2 starts at 3 quarters)
        (0, 2, _meta(0x59, bytes([0xFF, 1]))),  # 1 flat, minor: Dm
        (96 * 3, 3, _meta(0x06, b"Verse  One")),
    ]
    vocal = (
        note(0, 96, 62)  # D4 quarter
        + note(48, 96, 69)  # A4 overlapping and higher: wins
        + note(250, 40, 65)  # off the grid
    )
    chords = [(0, 0, _meta(0x01, b"plenio:chord Dm")), (96 * 3, 0, _meta(0x01, b"plenio:chord Cmaj9"))]
    extra = note(0, 96, 40)
    data = smf(conductor, vocal, chords, extra, names=("", "Vocal", "Chords", "Bass"))
    result = midi.import_midi(data)
    score = result.score
    assert score.tempo == 120
    assert score.keys[0].key == "Dm"
    assert score.meters[:3] == ((3, 4), (3, 4), (4, 4))  # the 4/4 inside bar 2 starts bar 3
    assert [(s.measure, s.label) for s in score.sections] == [(1, "Verse One")]
    assert [(n.onset, n.duration, n.pitch) for n in score.vocal][:2] == [(0, 4, 62), (4, 8, 69)]
    assert [ch.name for ch in score.chords] == ["Dm"]
    text = " | ".join(result.report)
    for fragment in (
        "later tempo change",
        "inside a bar moved",
        "overlapping note",
        "quantised",
        "track 4 (Bass) was not imported",
        "'Cmaj9' is not a supported chord symbol",
    ):
        assert fragment in text
    assert c.from_abc(c.to_abc(score)) == score  # a foreign import is a valid score


def test_mapping_overrides_track_names_and_guide_keeps_polyphony() -> None:
    chord_notes = note(0, 192, 60, 1) + note(0, 192, 64, 1) + note(0, 192, 67, 1)
    data = smf(
        [(0, 0, _meta(0x58, bytes([4, 2, 24, 8])))], note(0, 96, 72), chord_notes, names=("", "Lead", "Pads")
    )
    unmapped = midi.import_midi(data)
    assert unmapped.score.vocal == () and len(unmapped.report) >= 2
    mapped = midi.import_midi(data, mapping={1: "vocal", 2: "guide"})
    assert [n.pitch for n in mapped.score.vocal] == [72]
    assert [g.pitch for g in mapped.guide] == [60, 64, 67]
    with pytest.raises(PlenioValidationError, match="Unknown track role"):
        midi.import_midi(data, mapping={1: "drums"})


def test_track_infos_describe_the_file_for_the_import_dialog() -> None:
    data = smf(
        [(0, 0, _meta(0x58, bytes([4, 2, 24, 8])))],
        note(0, 96, 72),
        note(0, 96, 60, 1) + note(0, 96, 64, 1) + note(0, 96, 67, 1),
        note(0, 96, 40),
        names=("", "Lead", "Pads", "Bass"),
    )
    result = midi.import_midi(data)
    assert [(t.index, t.name, t.notes, t.role) for t in result.tracks] == [
        (0, "", 0, None),
        (1, "Lead", 1, None),
        (2, "Pads", 3, None),
        (3, "Bass", 1, None),
    ]
    named = midi.import_midi(smf(note(0, 96, 60), names=("Vocal",)))
    assert [(t.name, t.notes, t.role) for t in named.tracks] == [("Vocal", 1, "vocal")]
    # an explicit mapping does not change what the file *suggests* (the dialog shows both)
    mapped = midi.import_midi(smf(note(0, 96, 60), names=("Vocal",)), mapping={0: "guide"})
    assert mapped.tracks[0].role == "vocal" and mapped.guide


def test_chords_are_read_from_the_notes_when_asked() -> None:
    voicing = note(0, 96, 60, 2) + note(0, 96, 64, 2) + note(0, 96, 67, 2)
    later = note(96, 96, 57, 2) + note(96, 96, 60, 2) + note(96, 96, 64, 2)
    data = smf(
        [(0, 0, _meta(0x58, bytes([4, 2, 24, 8])))],
        note(0, 192, 72),
        voicing + later,
        names=("", "Vocal", "Pads"),
    )
    plain = midi.import_midi(data, mapping={1: "vocal", 2: "chords"})
    assert plain.score.chords == ()
    assert any("turn on chord recognition" in line for line in plain.report)
    read = midi.import_midi(data, mapping={1: "vocal", 2: "chords"}, chords_from_notes=True)
    assert [(chord.onset, chord.name) for chord in read.score.chords] == [(0, "C"), (8, "Am")]
    assert any("best effort" in line for line in read.report)
    assert c.from_abc(c.to_abc(read.score)) == read.score  # the recognised symbols print and re-parse


def test_chord_text_events_win_over_recognition() -> None:
    voicing = note(0, 96, 60, 2) + note(0, 96, 64, 2) + note(0, 96, 67, 2)
    data = smf(
        [(0, 0, _meta(0x58, bytes([4, 2, 24, 8])))],
        note(0, 192, 72),
        voicing + [(0, 0, _meta(0x01, b"plenio:chord Fm"))],
        names=("", "Vocal", "Chords"),
    )
    # the written symbol stands; recognition runs only when the file has no chord events at all
    result = midi.import_midi(data, chords_from_notes=True)
    assert [chord.name for chord in result.score.chords] == ["Fm"]
    assert not any("best effort" in line for line in result.report)

    body = bytes([0x00, 0x90, 60, 100, 0x60, 60, 0, 0x00, 62, 100, 0x60, 0x80, 62, 0]) + bytes(
        [0, 0xFF, 0x2F, 0]
    )
    data = _chunk(b"MThd", (0).to_bytes(2, "big") + (1).to_bytes(2, "big") + (96).to_bytes(2, "big"))
    data += _chunk(b"MTrk", body)
    result = midi.import_midi(data, mapping={0: "ins"})
    assert [(n.onset, n.duration, n.pitch) for n in result.score.ins] == [(0, 8, 60), (8, 8, 62)]


@pytest.mark.parametrize(
    ("data", "fragment"),
    [
        (b"RIFF0000", "no MThd"),
        (
            _chunk(b"MThd", (1).to_bytes(2, "big") + (1).to_bytes(2, "big") + (0xE728).to_bytes(2, "big")),
            "SMPTE",
        ),
        (
            _chunk(b"MThd", (2).to_bytes(2, "big") + (1).to_bytes(2, "big") + (96).to_bytes(2, "big")),
            "format 2",
        ),
        (
            _chunk(b"MThd", (1).to_bytes(2, "big") + (1).to_bytes(2, "big") + (96).to_bytes(2, "big"))
            + b"MTrk"
            + (40).to_bytes(4, "big")
            + b"\x00\x90",
            "truncated",
        ),
    ],
)
def test_unreadable_files_are_refused(data: bytes, fragment: str) -> None:
    with pytest.raises(PlenioValidationError, match=fragment):
        midi.import_midi(data)


def test_an_import_grid_outside_the_choices_is_refused() -> None:
    with pytest.raises(PlenioValidationError, match="grid"):
        midi.import_midi(b"", grid=12)


def test_route_helpers() -> None:
    assert midi.filename_for("My Song: Take 2/3") == "My Song_ Take 2_3.mid"
    assert midi.filename_for("   ") == "score.mid"
    assert midi.guide_from_json([[8, 4, 60], [0, 8, 40]]) == (GuideNote(0, 8, 40), GuideNote(8, 4, 60))
    assert midi.guide_from_json(None) == ()
    assert midi.mapping_from_json({"1": "vocal", "2": None}) == {1: "vocal", 2: None}
    for bad in ([[0, 0, 60]], [[0, 4, 128]], [[0, 4]], "x", [[True, 4, 60]]):
        with pytest.raises(PlenioValidationError):
            midi.guide_from_json(bad)
    for bad_mapping in ({"a": "vocal"}, {"1": "drums"}, ["vocal"]):
        with pytest.raises(PlenioValidationError):
            midi.mapping_from_json(bad_mapping)
