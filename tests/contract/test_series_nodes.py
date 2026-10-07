"""Song Brief and Cover Brief in a series: a new song (and song seed) every run, the same one while a Song
Sheet holds it for review; one song: no variation, song seed 0 (``core.series``)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

pytestmark = pytest.mark.comfy

SONG = {
    "template": "none",
    "description": "A song about rain",
    "genre": "piano pop",
    "mood": "",
    "tempo": "88 BPM",
    "length": "short (about 1:30)",
    "vocals": {"vocals": "sung", "language": "English", "voice": "", "theme": ""},
    "key": "",
    "meter": "",
}
COVER = {
    "template": "none",
    "description": "A jazz version",
    "genre": "jazz",
    "mood": "",
    "vocals": {"vocals": "original lyrics", "language": "", "voice": ""},
    "harmony": "keep original chords",
    "title": "",
}


@pytest.mark.parametrize(
    ("node_name", "inputs", "series_mode", "one_mode"),
    [
        ("PlenioSongBrief", SONG, "new song every run", "one song, stop to review"),
        ("PlenioCoverBrief", COVER, "new cover every run", "one cover, stop to review"),
    ],
)
def test_a_series_holds_the_song_under_review(
    comfy_path: Path, node_name: str, inputs: dict[str, Any], series_mode: str, one_mode: str
) -> None:
    from plenio.comfy import nodes
    from plenio.comfy.shared import SERIES

    node = next(n for n in nodes.NODES if n.GET_SCHEMA().node_id == node_name)
    first = node.fingerprint_inputs(mode=series_mode, **inputs)
    second = node.fingerprint_inputs(mode=series_mode, **inputs)
    assert first != second  # every run a new song
    brief = node.execute(mode=series_mode, **inputs).result[0]
    assert brief.series and brief.variation is not None
    assert node.execute(mode=series_mode, **inputs).result[-1] == brief.song_seed == brief.variation
    SERIES.hold(brief.series, brief.variation)
    held = [node.fingerprint_inputs(mode=series_mode, **inputs) for _ in range(2)]
    assert held[0] == held[1] == second  # kept for review
    SERIES.release(brief.series, brief.variation)
    assert node.fingerprint_inputs(mode=series_mode, **inputs) != second

    assert node.fingerprint_inputs(mode=one_mode, **inputs) == ""
    one = node.execute(mode=one_mode, **inputs).result
    assert one[0].variation is None and one[-1] == 0
