"""Match Song Form in a real ComfyUI server: the second plan is requested only when the first cannot be made
to fit the lyrics' song form, and the Song Sheet keeps what was done."""

from __future__ import annotations

from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host

HEAD = """X:1
T:
M:4/4
L:1/16
Q:1/4=100
V: Vocal clef=treble name="Vocal Melody" snm="Vocal"
V: Ins clef=treble name="Ins Melody" snm="Inst."
K:C
"""


def plan(*sections: str) -> str:
    return HEAD + "".join(f'% {s}\nV: Vocal\n"C"E4G4A4G4|\nV: Ins\nC16|\n' for s in sections)


def lyric(*sections: str) -> str:
    return "\n\n".join(f"[{s}]\nla la la la" for s in sections)


def graph(score: str, lyrics: str, alternative: str) -> dict[str, Any]:
    return {
        "1": {"class_type": "PrimitiveStringMultiline", "inputs": {"value": score}},
        "2": {"class_type": "PrimitiveStringMultiline", "inputs": {"value": lyrics}},
        "3": {"class_type": "PlenioTestSource", "inputs": {"name": "second plan", "value": alternative}},
        "4": {
            "class_type": "PlenioMatchSongForm",
            "inputs": {"score": ["1", 0], "lyrics": ["2", 0], "alternative": ["3", 0]},
        },
        "5": {"class_type": "PlenioTestSink", "inputs": {"value": ["4", 0], "label": "score"}},
    }


def summary(entry: dict[str, Any]) -> str:
    return str(entry["outputs"]["4"]["plenio_summary"][0]["markdown"])


def test_a_plan_that_can_be_made_to_fit_needs_no_second_plan(server: ComfyServer, log: Log) -> None:
    entry = server.run(
        graph(plan("verse", "chorus", "verse"), lyric("Verse", "Chorus", "Verse", "Chorus"), "")
    )
    assert "source" not in log.nodes()  # the second plan was never made
    assert "put together from the plan's sections in the lyrics' order" in summary(entry)
    assert entry["outputs"]["5"]["received"][0].count("% chorus") == 2


def test_a_plan_that_differs_asks_for_a_second_one_and_the_better_wins(server: ComfyServer, log: Log) -> None:
    lyrics = lyric("Verse", "Chorus", "Bridge", "Chorus")
    second = plan("verse", "chorus", "bridge", "chorus")
    entry = server.run(graph(plan("verse", "chorus"), lyrics, second))
    assert log.nodes().count("source") == 1
    assert entry["outputs"]["5"]["received"] == [second]
    assert "a second plan fits better" in summary(entry)


def test_without_a_better_second_plan_a_related_melody_is_used(server: ComfyServer, log: Log) -> None:
    lyrics = lyric("Verse", "Chorus", "Verse", "Chorus", "Bridge")
    entry = server.run(graph(plan("verse", "chorus", "verse", "chorus"), lyrics, plan("verse", "verse")))
    assert log.nodes().count("source") == 1
    assert "a second plan did not fit better" in summary(entry) and "bridge on the verse's melody" in summary(
        entry
    )
    assert "% bridge" in entry["outputs"]["5"]["received"][0]


def test_an_instrumental_passes_through(server: ComfyServer, log: Log) -> None:
    score = plan("verse")
    entry = server.run(graph(score, "[instrumental]", ""))
    assert entry["outputs"]["5"]["received"] == [score] and "source" not in log.nodes()
