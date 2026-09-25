"""EQ and loudness presets (``resources/presets/*.json``): one source for the nodes, the route and the editor."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..errors import PlenioUserError
from . import eq
from .dynamics import Compressor, Target

KINDS = ("eq", "loudness")


def load(folder: Path, kind: str) -> dict[str, Any]:
    if kind not in KINDS:
        raise PlenioUserError(f"Unknown preset kind {kind!r}; use one of {list(KINDS)}.")
    data: dict[str, Any] = json.loads((folder / f"{kind}.json").read_text(encoding="utf-8"))
    return data


@dataclass(frozen=True)
class Library:
    folder: Path

    def eq(self) -> dict[str, Any]:
        return load(self.folder, "eq")

    def loudness(self) -> dict[str, Any]:
        return load(self.folder, "loudness")

    def eq_names(self) -> list[str]:
        return [p["name"] for p in self.eq()["manual"]]

    def match_names(self) -> list[str]:
        return [p["name"] for p in self.eq()["match"]]

    def target_names(self) -> list[str]:
        return [p["name"] for p in self.loudness()["targets"]]

    def style_names(self) -> list[str]:
        return [p["name"] for p in self.loudness()["compression"]]

    def eq_settings(self, name: str) -> dict[str, Any]:
        return eq.parse_settings(_named(self.eq()["manual"], name, "EQ preset")["settings"])

    def match(self, name: str) -> dict[str, Any]:
        return dict(_named(self.eq()["match"], name, "tone match preset"))

    def target(self, name: str, style: str | None = None) -> Target:
        chosen = _named(self.loudness()["targets"], name, "loudness target")
        limiter = (
            _named(self.loudness()["compression"], style, "compression style")["limiter"] if style else {}
        )
        return Target(float(chosen["integrated_lufs"]), float(chosen["ceiling_dbtp"]), **limiter)

    def compressor(self, style: str) -> Compressor | None:
        settings = _named(self.loudness()["compression"], style, "compression style")["compressor"]
        return Compressor(**settings) if settings else None


def _named(items: list[dict[str, Any]], name: str | None, what: str) -> dict[str, Any]:
    for item in items:
        if item["name"] == name:
            return item
    raise PlenioUserError(f"Unknown {what} {name!r}.", hint=f"Use one of {[i['name'] for i in items]}.")
