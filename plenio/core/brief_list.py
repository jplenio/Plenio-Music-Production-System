"""Brief List: one line of a list per run - a series of songs from a list of briefs (PD 7.3), a cover in three
styles, the same lyrics in three genres.

The list is a text (one entry per line) or a text file in ComfyUI's input folder; empty lines and lines starting
with ``#`` are left out. Run *n* takes entry *n* (counted from 0, wrapping round), so ComfyUI's batch count with the
index on *increment* makes the whole list in one go.

Standard library only.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .errors import PlenioUserError

MAX_ENTRIES = 1000
MAX_BYTES = 1_000_000


def entries(text: str) -> list[str]:
    """The list's entries: its lines without blank ones and ``#`` comments, each stripped."""
    lines = [line.strip() for line in text.splitlines()]
    return [line for line in lines if line and not line.startswith("#")][:MAX_ENTRIES]


def input_file(folder: Path, name: str) -> Path:
    """The file ``name`` in ``folder`` (ComfyUI's input folder) - a plain name or a path inside it, nothing outside."""
    base = folder.resolve()
    path = (base / name.strip()).resolve()
    if base not in path.parents:
        raise PlenioUserError(
            f"'{name}' is not a file in ComfyUI's input folder.", hint="Put the file into the input folder."
        )
    if not path.is_file():
        raise PlenioUserError(f"There is no file '{name}' in ComfyUI's input folder.", hint="Check its name.")
    return path


def read_list(folder: Path, name: str) -> str:
    """The text of ``name`` in ``folder`` (ComfyUI's input folder) - a plain name or a path inside it, nothing
    outside."""
    if not name.strip():
        return ""
    path = input_file(folder, name)
    if path.stat().st_size > MAX_BYTES:
        raise PlenioUserError(f"'{name}' is larger than 1 MB: that is no list of briefs.")
    return path.read_text(encoding="utf-8-sig")


@dataclass(frozen=True)
class Picked:
    text: str
    position: int
    """0-based."""
    count: int


def pick(items: list[str], index: int) -> Picked:
    if not items:
        raise PlenioUserError(
            "The list is empty.", hint="Write one entry per line, or name a text file in the input folder."
        )
    position = index % len(items)
    return Picked(items[position], position, len(items))
