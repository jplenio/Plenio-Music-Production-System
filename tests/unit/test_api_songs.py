"""Released songs of the Song API v2 (phase 5.3)."""

from __future__ import annotations

import pytest

from plenio.core.api import songs
from plenio.core.errors import PlenioUserError


def test_a_song_id_is_its_records_place_and_names_nothing_outside() -> None:
    relative = "plenio/Night Drive/2026-11-11 Night Drive.plenio.json"
    assert songs.relative_of(songs.song_id(relative)) == relative
    for strange in ("../x.plenio.json", "/abs.plenio.json", "a/b.txt"):
        with pytest.raises(PlenioUserError):
            songs.relative_of(songs.song_id(strange))
    with pytest.raises(PlenioUserError):
        songs.relative_of("!!not base64!!")


def test_the_listing_searches_title_date_and_folder() -> None:
    rows = [
        {
            "path": "plenio/a.plenio.json",
            "title": "Paper Boats",
            "created": "2026-11-11T10:00:00",
            "audio": "a.flac",
        },
        {
            "path": "party/b.plenio.json",
            "title": "Night Drive",
            "created": "2026-11-10T10:00:00",
            "audio": None,
        },
    ]
    assert [s["title"] for s in songs.listing(rows, "paper")] == ["Paper Boats"]
    assert [s["title"] for s in songs.listing(rows, "party 2026-11-10")] == ["Night Drive"]
    found = songs.listing(rows)[1]
    assert found["files"] == {"audio": False, "cover": False} and "path" not in found
    assert len(songs.listing(rows, limit=1)) == 1
