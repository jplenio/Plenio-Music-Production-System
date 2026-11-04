"""A bar keeps its place in the recording through edits of its notes (GitHub issue 2026-11).

Moving notes to the other voice, *melody to Ins* and *silence* changed what a bar holds, so bar matching sent it - and
the bars after it - to another passage of the recording: the waveform, the source's playback and the sung pitch showed
other bars, the audio itself never changed. Here: the real operations, a score with a repeated chorus, an intro the Ins
plays alone and the same riff under the chorus - and the fixture the editor's tests (``barSources.test.ts``) read, so
that both sides are measured on the same real edits.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.comfy import sheet_music
from plenio.core import alignment as al
from plenio.core import score as score_rules
from plenio.core.score import bar_match, canonical, operations
from plenio.core.score.timeline import Timeline, TimelineBar

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = ROOT / "frontend" / "tests" / "fixtures" / "bar-sources.json"

RIFF = "C2 E2 G2 E2|"
SCORE = (
    "X:1\nT:\nM:4/4\nL:1/8\nQ:1/4=120\n"
    'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
    'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
    "K:C\n"
    "% intro\nV: Vocal\nz8|z8|z8|z8|\nV: Ins\n" + RIFF * 4 + "\n"
    "% verse\nV: Vocal\nC2 D2 E2 F2|G4 E4|D2 E2 F2 G2|A8|\nV: Ins\nz8|z8|z8|z8|\n"
    "% chorus\nV: Vocal\nc2 B2 A2 G2|A4 G4|F2 G2 A2 B2|c8|\nV: Ins\n" + RIFF * 4 + "\n"
    "% verse\nV: Vocal\nE2 F2 G2 A2|B4 G4|F2 G2 A2 B2|c8|\nV: Ins\nz8|z8|z8|z8|\n"
    "% chorus\nV: Vocal\nc2 B2 A2 G2|A4 G4|F2 G2 A2 B2|c8|\nV: Ins\n" + RIFF * 4 + "\n"
)
BARS = 20
BAR_UNITS = 8
SOURCE = bar_match.bar_prints(canonical.from_abc(SCORE))
IDENTITY = list(range(BARS))


def _model() -> dict[str, Any]:
    return operations.editor_view(SCORE)["model"]


def _ids(voice: str, first: int, last: int) -> list[str]:
    """The notes of a voice in the bars ``[first, last)`` (0-based)."""
    return [n["id"] for n in _model()["tracks"][voice] if first <= n["onset"] // BAR_UNITS < last]


def _move(voice: str, first: int, last: int, to: str) -> dict[str, Any]:
    return {"op": "move_notes", "ids": _ids(voice, first, last), "delta": 0, "semitones": 0, "track": to}


NOTE_EDITS: dict[str, dict[str, Any]] = {
    "Vocal to Ins: a verse": _move("vocal", 4, 8, "ins"),
    "Vocal to Ins: a chorus": _move("vocal", 8, 12, "ins"),
    "Vocal to Ins: over two sections": _move("vocal", 6, 10, "ins"),
    "Vocal to Ins: one bar": _move("vocal", 9, 10, "ins"),
    "Ins to Vocal: the chorus's riff": _move("ins", 8, 12, "vocal"),
    "Ins to Vocal: the intro's riff": _move("ins", 0, 4, "vocal"),
    "melody to Ins: the whole song": {"op": "move_vocal_to_ins"},
    "silence Vocal": {"op": "silence_voice", "voice": "Vocal"},
    "silence Ins": {"op": "silence_voice", "voice": "Ins"},
    "another pitch": {"op": "set_note_pitch", "ids": _ids("vocal", 5, 6), "semitones": 1},
    "the whole Vocal up": {"op": "shift_track", "track": "vocal", "semitones": 2},
}


@pytest.mark.parametrize("name", NOTE_EDITS)
def test_notes_edited_leave_every_bar_where_it_is(name: str) -> None:
    done = operations.apply(SCORE, NOTE_EDITS[name])
    assert done.abc != SCORE
    assert done.time_map is None  # it says itself that no bar moved
    assert bar_match.match_bars(bar_match.bar_prints(canonical.from_abc(done.abc)), SOURCE) == IDENTITY


def _sections(abc: str) -> list[score_rules.Section]:
    return list(score_rules.validate(abc).sections)


def test_structure_is_still_found_by_content() -> None:
    """Bars that really moved: the second chorus before the second verse - as many bars as before."""
    moved = [*SOURCE[:12], *SOURCE[16:20], *SOURCE[12:16]]
    assert bar_match.match_bars(moved, SOURCE) == [*range(12), *range(8, 12), *range(12, 16)]
    # copied: the chorus's bars once more after the song; deleted: a verse is simply not found
    assert bar_match.match_bars([*SOURCE, *SOURCE[8:12]], SOURCE) == [*range(20), *range(8, 12)]
    assert bar_match.match_bars([*SOURCE[:4], *SOURCE[8:]], SOURCE) == [*range(4), *range(8, 20)]


def test_a_score_with_nothing_in_common_stays_in_order() -> None:
    other = [("4/4:0.8.60", "4/4:") for _ in range(6)]
    assert bar_match.match_bars(other, SOURCE) == list(range(6))
    assert not bar_match.has_evidence(other[0], SOURCE[0])
    assert bar_match.has_evidence(SOURCE[0], SOURCE[0])
    assert bar_match.has_evidence(("4/4:", "4/4:"), ("4/4:", "4/4:"))  # the same rests are the same bar


def _timeline() -> Timeline:
    analysis = score_rules.analyze(SCORE)
    return Timeline(
        source_sha256="s" * 64,
        score_sha256="t" * 64,
        engine="test",
        duration_s=BARS * 2.0,
        first_beat_s=0.0,
        pickup_padded=False,
        tempo_bpm=120,
        median_bpm=120.0,
        bars=tuple(TimelineBar(i * 2.0, (i + 1) * 2.0, "4/4") for i in range(BARS)),
        sections=tuple((s.label, s.start_bar, s.bars) for s in analysis.sections),
        vocal_notes=((0.0, BARS * 2.0),),
        bar_prints=SOURCE,
    )


def _words() -> list[al.AsrWord]:
    """A word in every bar of the recording."""
    return [al.AsrWord(i * 2.0 + 0.5, i * 2.0 + 1.5, f"bar{i + 1}", 0.9) for i in range(BARS)]


def _lyrics_of(lyrics: str) -> list[str]:
    """The words of every section of a lyrics draft."""
    sections: list[list[str]] = []
    for line in lyrics.splitlines():
        if line.startswith("["):
            sections.append([])
        elif line.strip() and sections:
            sections[-1].append(line.strip())
    return [" ".join(words) for words in sections]


def _per_section(abc: str, **extra: Any) -> list[str]:
    done = score_rules.validate(abc)
    prints = bar_match.bar_prints(canonical.from_abc(abc))
    found = al.align(
        _words(),
        list(done.sections),
        timeline=_timeline(),
        score_meters=[b.meter for b in done.bars],
        score_prints=prints,
        **extra,
    )
    return _lyrics_of(found.lyrics)


def test_lyrics_alignment_keeps_its_bars_through_a_note_edit() -> None:
    plain = _per_section(SCORE)
    assert plain[1] == "bar5 bar6 bar7 bar8"
    for name, operation in NOTE_EDITS.items():
        assert _per_section(operations.apply(SCORE, operation).abc) == plain, name


def test_lyrics_alignment_takes_the_bars_the_editor_kept() -> None:
    """Two choruses of the same notes swapped with the verse between: by content they cannot be told apart."""
    done = operations.apply(SCORE, {"op": "arrange_sections", "order": [1, 2, 5, 4, 3]})
    kept = [*range(8), *range(16, 20), *range(12, 16), *range(8, 12)]
    assert _per_section(done.abc, score_sources=kept)[2] == "bar17 bar18 bar19 bar20"
    assert _per_section(done.abc)[2] == "bar9 bar10 bar11 bar12"  # the first chorus: the guess


def test_the_kept_bars_are_read_only_for_their_own_score() -> None:
    good = {"timeline": "t", "score": "s", "bars": [0, 1, None]}
    info = {
        "workflow": {
            "nodes": [{"id": 1, "properties": {}}, {"id": 2, "properties": {"plenio_bar_sources": good}}]
        }
    }
    assert sheet_music.bar_sources(info, "t", "s", 3) == [0, 1, None]
    assert sheet_music.bar_sources(info, "other", "s", 3) is None  # another transcription
    assert sheet_music.bar_sources(info, "t", "other", 3) is None  # another text: edited elsewhere
    assert sheet_music.bar_sources(info, "t", "s", 4) is None
    assert sheet_music.bar_sources(None, "t", "s", 3) is None
    assert sheet_music.bar_sources({"workflow": "x"}, "t", "s", 3) is None
    bad = {**good, "bars": [0, -1, None]}
    assert (
        sheet_music.bar_sources(
            {"workflow": {"nodes": [{"properties": {"plenio_bar_sources": bad}}]}}, "t", "s", 3
        )
        is None
    )


def _structural() -> dict[str, dict[str, Any]]:
    return {
        "section moved, as many bars": {"op": "arrange_sections", "order": [1, 2, 5, 4, 3]},
        "section copied": {"op": "arrange_sections", "order": [1, 2, 3, 3, 4, 5]},
        "section deleted": {"op": "arrange_sections", "order": [1, 3, 4, 5]},
        "bars duplicated": {"op": "duplicate_measures", "bar": 9, "count": 2},
        "bars deleted": {"op": "delete_measures", "bar": 5, "count": 2},
        "bars inserted": {"op": "insert_measures", "bar": 9, "count": 2},
        "bars rearranged": {
            "op": "arrange_measures",
            "order": [*range(0, 4), *range(8, 12), *range(4, 8), *range(12, 20)],
        },
    }


def _tracks(model: dict[str, Any]) -> dict[str, list[dict[str, int]]]:
    return {
        track: [
            {"onset": n["onset"], "duration": n["duration"], "pitch": n["pitch"]}
            for n in model["tracks"][track]
        ]
        for track in ("vocal", "ins")
    }


def _fixture() -> dict[str, Any]:
    """What the editor's tests work on: the real results of the real operations."""
    before = operations.editor_view(SCORE)
    edits = []
    for name, operation in {**NOTE_EDITS, **_structural()}.items():
        done = operations.apply(SCORE, operation)
        after = operations.editor_view(done.abc)
        edits.append(
            {
                "name": name,
                "time_map": [list(piece) for piece in done.time_map] if done.time_map else None,
                "measures": [
                    {"onset": m["onset"], "length": m["length"], "meter": m["meter"]}
                    for m in after["model"]["measures"]
                ],
                "tracks": _tracks(after["model"]),
                "prints": [list(p) for p in bar_match.bar_prints(canonical.from_abc(done.abc))],
                "matched": bar_match.match_bars(bar_match.bar_prints(canonical.from_abc(done.abc)), SOURCE),
            }
        )
    return {
        "measures": [
            {"onset": m["onset"], "length": m["length"], "meter": m["meter"]}
            for m in before["model"]["measures"]
        ],
        "tracks": _tracks(before["model"]),
        "source": [list(p) for p in SOURCE],
        "edits": edits,
    }


def test_the_editors_fixture_is_current() -> None:
    expected = json.dumps(_fixture(), sort_keys=True, separators=(",", ":")) + "\n"
    if not FIXTURE.exists():  # a new checkout never lands here; written once, and then compared
        FIXTURE.write_text(expected, encoding="utf-8", newline="\n")
    assert FIXTURE.read_text(encoding="utf-8") == expected


def test_bar_structure_operations_say_where_bars_went() -> None:
    for name, operation in _structural().items():
        assert operations.apply(SCORE, operation).time_map, name
