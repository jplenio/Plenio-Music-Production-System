"""'new song every run' with the Song Sheets' review settings, in a real ComfyUI server with model fakes.

The owner's report (2026-10-07): a series with Song Sheet · Score on *stop for review* stopped on every run,
also after Approve - every run wrote a new song, and the approval was always for the previous one. Now a
song that waits for review is kept until a run lets it through (``core.series``), and an edit belongs to
its song. The fake writer puts the brief's variation into the title and the verse ("Song 1234").
"""

from __future__ import annotations

from typing import Any

import pytest
from test_song_path import events, label, sheet_payload, sheet_state, song_prompt

from harness import ComfyServer, Log

pytestmark = pytest.mark.host
SERIES = "new song every run"


def series(name: str, **kwargs: Any) -> dict[str, Any]:
    return song_prompt(label=name, variant="series", mode=SERIES, **kwargs)


def songs(log: Log) -> list[str]:
    """The verse of every song the fake writer wrote, in order."""
    return [e["prompt"].split("variation ")[1].split(")")[0] for e in events(log, "llm")]


def test_a_review_stop_keeps_the_song_until_it_is_rendered(server: ComfyServer, log: Log) -> None:
    name = label()
    first = server.run(series(name, score_review="stop for review"))
    score = sheet_payload(first, "9")
    assert score["status"] == "waiting for approval" and events(log, "render") == []
    song = sheet_payload(first, "6")["docs"]["title"]["text"]

    server.run(series(name, score_review="stop for review"))  # Run again without approving: the same song
    assert len(events(log, "llm")) == 1 and events(log, "render") == []

    approved = sheet_state(approved=score["fingerprint"])
    third = server.run(series(name, score_review="stop for review", score_state=approved))
    renders = events(log, "render")
    assert len(renders) == 1 and len(events(log, "llm")) == 1  # the approved song, not a new one
    assert sheet_payload(third, "6")["docs"]["title"]["text"] == song

    server.run(series(name, score_review="stop for review", score_state=approved))
    assert len(events(log, "llm")) == 2 and len(songs(log)) == 2 and songs(log)[0] != songs(log)[1]
    # the fake planner writes the same score for every song: the approval is for exactly these documents
    # and holds (a real plan differs per song and stops again - see the text sheet's test)
    assert len(events(log, "render")) == 2


def test_a_text_stop_in_a_series(server: ComfyServer, log: Log) -> None:
    name = label()
    first = server.run(series(name, text_review="stop for review"))
    text = sheet_payload(first, "6")
    assert text["status"] == "waiting for approval" and events(log, "plan") == []
    approved = sheet_state(approved=text["fingerprint"])
    server.run(series(name, text_review="stop for review", text_state=approved))
    assert len(events(log, "render")) == 1 and len(events(log, "llm")) == 1
    third = server.run(series(name, text_review="stop for review", text_state=approved))
    assert len(events(log, "llm")) == 2 and sheet_payload(third, "6")["status"] == "waiting for approval"


def test_without_stops_every_run_is_a_new_song(server: ComfyServer, log: Log) -> None:
    name = label()
    for _ in range(3):
        server.run(series(name, text_review="as the brief says", score_review="as the brief says"))
    renders = events(log, "render")
    assert len(renders) == 3 and len({r["lyrics"] for r in renders}) == 3
    assert len(set(songs(log))) == 3


def test_an_edit_belongs_to_its_song(server: ComfyServer, log: Log) -> None:
    """The next song takes its own draft instead of stopping with a conflict; manual text stays for all."""
    name = label()
    first = server.run(series(name))
    draft = sheet_payload(first, "6")["docs"]["lyrics"]
    edited = sheet_state(
        {
            "lyrics": {
                "state": "edited",
                "text": "[Verse]\nMy edit\n\n[Chorus]\nMine",
                "base_sha256": draft["upstream_sha256"],
            }
        }
    )
    second = server.run(series(name, text_state=edited))
    lyrics = sheet_payload(second, "6")["docs"]["lyrics"]
    assert lyrics["status"] == "auto" and "earlier song" in lyrics["reason"]
    assert events(log, "render")[-1]["lyrics"] == lyrics["text"] != draft["text"]
    assert any("earlier song" in f["message"] for f in sheet_payload(second, "6")["findings"])


def test_one_song_mode_still_stops_on_a_changed_draft(server: ComfyServer, log: Log) -> None:
    """Outside a series an outdated edit is still a conflict (the rule of the Song Sheet)."""
    name = label()
    first = server.run(song_prompt(label=name))
    draft = sheet_payload(first, "6")["docs"]["lyrics"]
    edited = sheet_state(
        {
            "lyrics": {
                "state": "edited",
                "text": "[Verse]\nMy edit\n\n[Chorus]\nMine",
                "base_sha256": draft["upstream_sha256"],
            }
        }
    )
    error = server.run_expect_error(song_prompt(label=name, variant="b", text_state=edited))
    assert "conflict" in error["exception_message"].lower()
