"""The six ways to make a song - *Best quality*, *Party - fast* ... - from one file (``resources/presets/make.json``),
read by the player's *Make a song*, the Song API (``"preset"`` in a job request) and the templates' *Preset* field.

A preset names the Song API's field ids and values: the form's fields (``length``, ``vocals``), the whole studio's
(``finish.hq_mastering``, ``lyrics_fidelity``), the release's (``mp3``), and how many takes (the player's).

Standard library only.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .errors import PlenioUserError
from .song_api import SongApiError, Template

SCHEMA = "plenio.presets/1"
NONE = "none"
"""The *Preset* field's value that sets nothing."""


@dataclass(frozen=True)
class Preset:
    id: str
    name: str
    text: str
    fields: Mapping[str, Any] = field(default_factory=dict)
    """The Song API's fields it sets: the form's and the whole studio's together."""
    release: Mapping[str, Any] = field(default_factory=dict)
    takes: int = 1


def load_presets(path: Path) -> dict[str, Preset]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if raw.get("schema") != SCHEMA:
        raise PlenioUserError(f"{path.name} is not a presets file ({SCHEMA}).")
    out: dict[str, Preset] = {}
    for item in raw.get("presets", []):
        studio = item.get("studio") or {}
        out[str(item["id"])] = Preset(
            id=str(item["id"]),
            name=str(item["name"]),
            text=str(item.get("text", "")),
            fields={**(studio.get("fields") or {}), **(item.get("fields") or {})},
            release=dict(studio.get("release") or {}),
            takes=int(item.get("takes", 1)),
        )
    return out


def with_preset(request: Mapping[str, Any], presets: Mapping[str, Preset]) -> dict[str, Any]:
    """A job request with its ``"preset"`` spread into ``fields`` and ``release`` - what the request names itself
    wins. A request without one is returned as it is."""
    out = dict(request)
    name = out.pop("preset", None)
    if name is None:
        return out
    if not isinstance(name, str) or name not in presets:
        raise SongApiError(
            "invalid_value",
            f"There is no preset {str(name)[:40]!r}.",
            field="preset",
            hint=f"Presets: {', '.join(presets)}.",
        )
    preset = presets[name]
    for part, values in (("fields", preset.fields), ("release", preset.release)):
        given = out.get(part) or {}
        if not isinstance(given, Mapping):
            return out  # prepare refuses it with its own words
        out[part] = {**values, **given}
    return out


def template_changes(template: Template, preset: Preset) -> list[dict[str, Any]]:
    """What choosing ``preset`` in a template's *Preset* field changes: per field the node and its input with the
    value, or the switch to turn on or off. Fields the template does not have are left out."""
    by_id = {f.id: f for f in template.fields}
    changes: list[dict[str, Any]] = []
    for name, value in preset.fields.items():
        found = by_id.get(name)
        if found is None or found.fixed:
            continue
        if found.kind == "switch":
            changes.append({"field": name, "switch": found.switch, "value": bool(value)})
        elif found.kind == "widget" and found.input:
            if found.choices and str(value) not in found.choices:
                continue
            changes.append({"field": name, "node": found.node, "input": found.input, "value": value})
    return changes
