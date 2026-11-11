"""The listener's own Plenio Drop presets: JSON files in the player's visuals folder (``visuals`` in the
state folder). The page reads them (and again while they are edited), and saves a copy of a preset there
to edit. The page checks and runs them; a preset is data the page's own formula language reads, never
script, so a file someone shares can draw and nothing else.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from ..core import features

ADDON = "file_manager"
FILE_LIMIT = 256 * 1024
COUNT_LIMIT = 200
README = """Plenio Drop presets
===================

Every .json file here is a visual of your own in the Plenio Player (Visuals: My presets). The player reads
the folder again every few seconds: save a file and the visual changes on screen.

Start from a copy: in the player, Visuals > Plenio Drop > Edit a copy. The format, every parameter, the
music's names and the functions are in the guide: docs/user/concepts/player-visuals.md, online at
https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/concepts/player-visuals.md
"""


def visuals_dir(state_dir: Path) -> Path:
    return state_dir / "visuals"


def list_presets(folder: Path) -> list[dict[str, Any]]:
    """The preset files (name, text, time of the last change); files too large or not UTF-8 are left
    out."""
    if not folder.is_dir():
        return []
    found: list[dict[str, Any]] = []
    for path in sorted(folder.glob("*.json"), key=lambda p: p.name.lower())[:COUNT_LIMIT]:
        try:
            if not path.is_file() or path.stat().st_size > FILE_LIMIT:
                continue
            found.append(
                {
                    "name": path.name,
                    "text": path.read_text(encoding="utf-8"),
                    "mtime": path.stat().st_mtime,
                }
            )
        except (OSError, UnicodeDecodeError):
            continue
    return found


def file_name(name: str) -> str:
    """A preset's name as a file name: ``Nebula Swirl (my copy)`` -> ``nebula-swirl-my-copy.json``."""
    stem = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60] or "preset"
    return f"{stem}.json"


def save_copy(folder: Path, name: str, text: str) -> Path:
    """Save a preset under a name of its own (``-2``, ``-3`` ... when taken); never overwrites a file."""
    if len(text.encode("utf-8")) > FILE_LIMIT:
        raise ValueError("the preset is too large")
    folder.mkdir(parents=True, exist_ok=True)
    readme = folder / "README.txt"
    if not readme.exists():
        readme.write_text(README, encoding="utf-8")
    base = file_name(name)
    target = folder / base
    count = 1
    while target.exists():
        count += 1
        target = folder / f"{base.removesuffix('.json')}-{count}.json"
    with target.open("x", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    return target


def prepare_folder(folder: Path) -> Path:
    """The visuals folder, made when it is not there yet, with a README on what goes there."""
    folder.mkdir(parents=True, exist_ok=True)
    readme = folder / "README.txt"
    if not readme.exists():
        readme.write_text(README, encoding="utf-8")
    return folder


NOT_SHOWN = (
    "This installation of Plenio opens no file manager (the Comfy Registry package leaves that part out): the "
    "folder's path is shown instead - copy it into your file manager's address bar."
)
"""What the page hears with the folder's path where the Studio add-on is not installed."""


def show_folder(folder: Path) -> dict[str, object]:
    """Show a folder of the player's in the system's file manager (made when it is not there yet), and answer
    what the page needs: the ``folder`` and whether it was ``opened``. Opening is the Studio add-on's part
    (``plenio/addons/file_manager.py``); without it the answer carries the path and a ``hint``, and the page
    shows both with a button that copies the path."""
    folder.mkdir(parents=True, exist_ok=True)
    if not features.has(ADDON):
        return {"folder": str(folder), "opened": False, "hint": NOT_SHOWN}
    features.load(ADDON).show_folder(folder)
    return {"folder": str(folder), "opened": True}
