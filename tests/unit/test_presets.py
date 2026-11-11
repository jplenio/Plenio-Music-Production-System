"""The six presets (phase 4.6): one file for the player, the Song API and the templates' Preset field."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import pytest

from plenio.core.presets import NONE, load_presets, template_changes, with_preset
from plenio.core.song_api import SongApiError, api_templates, load_template

ROOT = Path(__file__).resolve().parents[2]
PRESETS = load_presets(ROOT / "resources" / "presets" / "make.json")
NODES: dict[str, Any] = json.loads((ROOT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))[
    "nodes"
]
WORKFLOWS = {
    p.stem: json.loads(p.read_text(encoding="utf-8")) for p in (ROOT / "example_workflows").glob("*.json")
}
TEMPLATES = api_templates(WORKFLOWS)
IDS = ["best", "party", "sketch", "full", "takes", "instrumental"]


def template(template_id: str) -> Any:
    name, workflow = TEMPLATES[template_id]
    return load_template(name, workflow, NODES.get)


def test_the_player_the_api_and_the_templates_list_the_same_six() -> None:
    assert list(PRESETS) == IDS
    player = (ROOT / "frontend" / "src" / "player" / "make" / "presets.ts").read_text(encoding="utf-8")
    assert "resources/presets/make.json" in player and not re.search(r"id: '(best|party)'", player)
    node = (ROOT / "plenio" / "comfy" / "nodes" / "preset.py").read_text(encoding="utf-8")
    assert "load_presets" in node and NONE not in IDS


def test_a_request_takes_the_preset_and_its_own_fields_win() -> None:
    request = with_preset(
        {"template": "yue2-song", "preset": "party", "fields": {"length": "about 2:00"}}, PRESETS
    )
    assert "preset" not in request
    assert request["fields"]["length"] == "about 2:00" and request["fields"]["finish.cover_art"] is True
    best = with_preset({"preset": "best"}, PRESETS)
    assert best["release"] == {"flac": True, "mp3": True}
    assert with_preset({"fields": {"a": 1}}, PRESETS) == {"fields": {"a": 1}}
    with pytest.raises(SongApiError) as refused:
        with_preset({"preset": "loud"}, PRESETS)
    assert refused.value.field == "preset"


def test_every_preset_changes_fields_the_song_template_has() -> None:
    song = template("yue2-song")
    for preset in PRESETS.values():
        changes = template_changes(song, preset)
        named = {change["field"] for change in changes}
        assert named == {name for name in preset.fields if song.field(name) is not None}, preset.id
        for change in changes:
            assert ("switch" in change) != ("node" in change)
    sketch = {c["field"]: c for c in template_changes(song, PRESETS["sketch"])}
    assert sketch["finish.cover_art"] == {"field": "finish.cover_art", "switch": "cover", "value": False}
    assert sketch["length"]["value"] == "very short (about 1:00)" and sketch["length"]["input"]


def test_the_api_documents_the_same_six() -> None:
    document = (ROOT / "docs" / "api" / "openapi.json").read_text(encoding="utf-8")
    assert '"preset"' in document and all(f'"{preset}"' in document for preset in IDS)
