"""Regression tests for defects found in the Phase 9 audit that need the node modules (ComfyUI API)."""

from __future__ import annotations

from pathlib import Path

import pytest

from plenio.core.brief import build_cover_brief, build_song_brief

pytestmark = pytest.mark.comfy


def test_the_asr_language_of_a_new_lyrics_cover_is_the_source_language(comfy_path: Path) -> None:
    """AUD-02: a new-lyrics cover forced the ASR to the language of the *new* lyrics (e.g. English on a
    German source), which turned the phrasing reference into a translation."""
    from plenio.comfy.nodes.transcribe_lyrics import asr_language

    new = build_cover_brief(
        {"genre": "folk", "vocals": "new", "language": "English", "phrasing_reference": True}
    )
    original = build_cover_brief({"genre": "folk", "vocals": "original", "language": "German"})
    detect = build_cover_brief({"genre": "folk", "vocals": "original", "language": "auto"})
    assert asr_language("auto", new) == "auto" and asr_language("de", new) == "de"
    assert asr_language("auto", original) == "German" and asr_language("en", original) == "German"
    assert asr_language("en", detect) == "auto"
    assert asr_language("fr", build_song_brief({"genre": "pop"})) == "fr" and asr_language("fr", None) == "fr"
