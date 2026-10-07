"""'new song every run' with review stops: the series keeps a song under review (``core.series``), an edit
belongs to its song, an approval to this song (``core.sheet``)."""

from __future__ import annotations

import itertools

from plenio.core.brief import SongBrief, build_song_brief
from plenio.core.hashing import sha256_text
from plenio.core.series import Series, series_key
from plenio.core.sheet import evaluate_sheet, parse_sheet_state
from plenio.core.sheet.resolve import SERIES_EDIT, DocStatus, resolve


def counter() -> Series:
    numbers = itertools.count(1)
    return Series(lambda: next(numbers), limit=3)


def test_every_run_is_a_new_song_until_one_is_held() -> None:
    series = counter()
    assert [series.song("a") for _ in range(3)] == [1, 2, 3]
    assert series.current("a") == 3  # what the node's execute uses after its fingerprint
    series.hold("a", 3)
    assert [series.song("a") for _ in range(2)] == [3, 3] and series.is_held("a")
    series.release("a", 2)  # another song's release does not free this one
    assert series.song("a") == 3
    series.release("a", 3)
    assert not series.is_held("a") and series.song("a") == 4


def test_series_are_separate_and_bounded() -> None:
    series = counter()
    series.hold("a", series.song("a"))
    assert series.song("b") == 2 and series.song("a") == 1
    for key in "cde":
        series.hold(key, series.song(key))
    assert not series.is_held("a")  # the oldest of more than `limit` series is forgotten


def test_the_series_key_is_the_brief_nodes_inputs() -> None:
    inputs = {
        "mode": "new song every run",
        "genre": "pop",
        "vocals": {"vocals": "sung", "language": "English"},
    }
    assert series_key("song", inputs) == series_key("song", dict(reversed(list(inputs.items()))))
    assert series_key("song", {**inputs, "genre": "rock"}) != series_key("song", inputs)
    assert series_key("cover", inputs) != series_key("song", inputs)


def test_song_seed_and_record() -> None:
    values = {"description": "rain", "genre": "pop", "length": "short (about 1:30)", "vocals": "sung"}
    one = build_song_brief(values, mode="one song, stop to review", variation=42)
    many = build_song_brief(values, mode="new song every run", variation=42)
    assert (one.song_seed, many.song_seed) == (0, 42)
    assert "series" not in SongBrief(series="k").to_dict()  # records and fingerprints stay as before


DRAFT = "[Verse]\nFirst song\n\n[Chorus]\nRain"
EDIT = "[Verse]\nMy words\n\n[Chorus]\nRain"


def edited_state() -> object:
    return parse_sheet_state(
        '{"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "edited", "text": "'
        + EDIT.replace("\n", "\\n")
        + '", "base_sha256": "'
        + sha256_text(DRAFT)
        + '"}}}'
    )


def test_an_edit_belongs_to_its_song() -> None:
    state = edited_state()
    same = resolve(state, {"lyrics": DRAFT}, ["lyrics"], series=True).docs["lyrics"]
    assert (same.status, same.text) == (DocStatus.EDITED, EDIT)
    new_song = resolve(state, {"lyrics": "[Verse]\nSecond song"}, ["lyrics"], series=True).docs["lyrics"]
    assert (new_song.status, new_song.text, new_song.reason) == (
        DocStatus.AUTO,
        "[Verse]\nSecond song",
        SERIES_EDIT,
    )
    one_song = resolve(state, {"lyrics": "[Verse]\nSecond song"}, ["lyrics"]).docs["lyrics"]
    assert one_song.status is DocStatus.CONFLICT  # outside a series an outdated edit still stops the run
    evaluation = evaluate_sheet(state, {"lyrics": "[Verse]\nSecond song"}, ["lyrics"], brief_mode="batch")
    assert any("earlier song" in f.message for f in evaluation.findings)
