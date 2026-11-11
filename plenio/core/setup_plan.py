"""What Plenio Setup shows and starts: the model plan as an answer for a page, and a download request checked
against the catalogue.

Pure: the host passes in the catalogue, the card's memory, what is installed and where each model folder is.
A download is asked for by **variant ids** only; this module turns ids into catalogue entries and target paths
inside ComfyUI's own model folders - a request never names a URL or a folder.

Standard library only.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .errors import PlenioUserError
from .modelplan import Pick, is_installed, plan
from .models import Component, Variant

MAX_IDS = 40
"""More ids than the catalogue has variants in one request is no request of Setup's."""


def _variant(variant: Variant, installed: Mapping[str, int]) -> dict[str, Any]:
    return {
        "id": variant.id,
        "file": variant.file,
        "bytes": variant.bytes,
        "licence": variant.licence,
        "non_commercial": variant.non_commercial,
        "role": variant.role,
        "gated": variant.gated,
        "quality": variant.quality,
        "speed": variant.speed,
        "vram_min_gib": variant.vram_min_gib,
        "vram_full_gib": variant.vram_full_gib,
        "basis": variant.basis,
        "measured": variant.basis.startswith("measured"),
        "installed": is_installed(variant, installed),
    }


def _pick(found: Pick, component: Component, installed: Mapping[str, int], optional: bool) -> dict[str, Any]:
    return {
        "component": component.id,
        "title": component.title,
        "folder": component.folder,
        "optional": optional,
        "file": found.file,
        "variant": found.variant.id if found.variant is not None else None,
        "installed": found.installed,
        "reason": found.reason,
        "warning": found.warning,
        "download_bytes": found.download_bytes,
        "variants": [_variant(v, installed) for v in component.variants],
    }


def plan_view(
    components: Mapping[str, Component],
    templates: Iterable[str],
    *,
    vram_gib: float | None,
    installed: Mapping[str, int],
    prefer: str = "balanced",
    pins: Mapping[str, str] | None = None,
) -> dict[str, Any]:
    """The plan of every template in ``templates`` (workflow titles), as a page shows it: per template its picks -
    file, reason, warning, what is still to fetch - and every component's variants to choose from."""
    out = []
    for template in templates:
        found = plan(template, components, vram_gib=vram_gib, installed=installed, prefer=prefer, pins=pins)
        picks = [_pick(p, components[p.component], installed, False) for p in found.needed]
        picks += [_pick(p, components[p.component], installed, True) for p in found.optional]
        out.append(
            {
                "template": template,
                "ready": found.ready,
                "download_bytes": found.download_bytes,
                "licences": list(found.licences),
                "warnings": list(found.warnings),
                "picks": picks,
            }
        )
    return {"vram_gib": vram_gib, "prefer": prefer, "pins": dict(pins or {}), "templates": out}


@dataclass(frozen=True)
class Wanted:
    """One file to fetch: the catalogue's variant and where its file goes."""

    variant: Variant
    component: Component
    target: Path


def download_request(
    ids: Any, components: Mapping[str, Component], folders: Mapping[str, Path | None]
) -> list[Wanted]:
    """The files a request asks for: ``ids`` are variant ids of the catalogue - anything else is refused, the
    whole request with it. ``folders`` gives ComfyUI's own folder for each model folder name; a file goes there
    under its catalogued name, nowhere else."""
    if not isinstance(ids, list) or not ids or len(ids) > MAX_IDS or not all(isinstance(i, str) for i in ids):
        raise PlenioUserError(
            "A download names the catalogue's variant ids.", hint='Example: {"variants": ["yue2-3b-int8"]}'
        )
    known = {v.id: (v, c) for c in components.values() for v in c.variants}
    wanted: list[Wanted] = []
    for item in dict.fromkeys(ids):
        if item not in known:
            raise PlenioUserError(
                f"Plenio's catalogue has no model file {item[:80]!r}.",
                hint="Plenio fetches only the files of its own catalogue (resources/models.toml).",
            )
        variant, component = known[item]
        folder = folders.get(component.folder)
        if folder is None:
            raise PlenioUserError(
                f"ComfyUI has no model folder '{component.folder}' for {variant.file}.",
                hint="Restart ComfyUI (Plenio registers its folders), or create the folder under ComfyUI/models.",
            )
        target = folder / variant.file
        if (
            target.parent != folder
        ):  # a catalogued name is a plain file name (the parser checks it; checked again)
            raise PlenioUserError(f"{variant.file!r} is no file name.")
        wanted.append(Wanted(variant, component, target))
    return wanted
