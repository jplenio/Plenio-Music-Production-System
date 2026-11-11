"""Where Plenio Setup was: the step, the templates the user wants, and the version Setup last opened itself for.

Kept in ``<user>/plenio/setup.json`` so that every step can be left and taken up again (PD 4.1). A file that
cannot be read counts as no file: Setup starts at its first step, nothing fails.

Standard library only.
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

from .errors import PlenioUserError

SCHEMA = "plenio.setup/1"
STEPS = ("computer", "wants", "plan", "downloads", "test", "go")
"""Setup's six steps (PD 4.1), in order."""
SPARE_BYTES = 2 * 1024**3
"""Room a download leaves on its drive beyond the files (PD 4.1)."""


@dataclass(frozen=True)
class SetupState:
    step: str = "computer"
    templates: tuple[str, ...] = ()
    """The templates the user wants (step 2); empty: not chosen yet."""
    extras: tuple[str, ...] = ()
    """The optional blocks' components the user wants too (cover art, stems, HQ mastering), by component id."""
    opened_for: str = ""
    """The Plenio version Setup last opened itself for (it opens once after an install or an update)."""
    done: bool = False
    """Setup went through to its last step once: the tab shows Home first."""

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": SCHEMA,
            "step": self.step,
            "templates": list(self.templates),
            "extras": list(self.extras),
            "opened_for": self.opened_for,
            "done": self.done,
        }


def read_state(path: Path) -> SetupState:
    """The state in ``path`` (the defaults when it is missing or unreadable)."""
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return SetupState()
    if not isinstance(raw, dict) or raw.get("schema") != SCHEMA:
        return SetupState()
    try:
        return update(SetupState(), raw, templates=None)
    except PlenioUserError:
        return SetupState()


def write_state(path: Path, state: SetupState) -> None:
    """Write ``state`` whole or not at all (a temporary file renamed into place)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(state.to_dict(), indent=1), encoding="utf-8")
    os.replace(temporary, path)


def update(state: SetupState, data: Mapping[str, Any], *, templates: Iterable[str] | None) -> SetupState:
    """``state`` with the keys of a request changed: ``step``, ``templates`` (names of ``templates``; ``None``
    accepts any text, for a file written by an earlier version), ``extras``, ``opened_for``, ``done``. Anything else is
    refused, the whole request with it."""
    known = {"schema", "step", "templates", "extras", "opened_for", "done"}
    unknown = sorted(set(data) - known)
    if unknown:
        raise PlenioUserError(f"Plenio Setup keeps no {', '.join(map(repr, unknown[:5]))}.")
    changes: dict[str, Any] = {}
    if "step" in data:
        if data["step"] not in STEPS:
            raise PlenioUserError(
                f"Plenio Setup has no step {str(data['step'])[:40]!r}.", hint=f"Steps: {', '.join(STEPS)}."
            )
        changes["step"] = data["step"]
    if "templates" in data:
        wanted = data["templates"]
        if (
            not isinstance(wanted, list)
            or len(wanted) > 32
            or not all(isinstance(t, str) and len(t) < 200 for t in wanted)
        ):
            raise PlenioUserError("'templates' is a list of template names.")
        allowed = set(templates) if templates is not None else None
        if allowed is not None and (strange := [t for t in wanted if t not in allowed]):
            raise PlenioUserError(
                f"There is no template {strange[0][:80]!r}.", hint="Read the plan: it names them."
            )
        changes["templates"] = tuple(dict.fromkeys(wanted))
    if "extras" in data:
        extras = data["extras"]
        if (
            not isinstance(extras, list)
            or len(extras) > 32
            or not all(isinstance(e, str) and 0 < len(e) < 80 for e in extras)
        ):
            raise PlenioUserError("'extras' is a list of component ids.")
        changes["extras"] = tuple(dict.fromkeys(extras))
    if "opened_for" in data:
        if not isinstance(data["opened_for"], str) or len(data["opened_for"]) > 40:
            raise PlenioUserError("'opened_for' is a version.")
        changes["opened_for"] = data["opened_for"]
    if "done" in data:
        if not isinstance(data["done"], bool):
            raise PlenioUserError("'done' is true or false.")
        changes["done"] = data["done"]
    return replace(state, **changes)


@dataclass(frozen=True)
class Drive:
    """One drive the files of a download go to."""

    label: str
    """A folder on it, as the message names it."""
    free: int | None
    """Free bytes (``None``: not measured)."""
    needed: int
    """Bytes of the files that go there."""


def room_problem(drives: Iterable[Drive]) -> str | None:
    """What keeps a download from starting for lack of space (``None``: there is room on every drive)."""
    from .models import size_text

    for drive in drives:
        if drive.free is not None and drive.needed and drive.free < drive.needed + SPARE_BYTES:
            return (
                f"{size_text(drive.needed + SPARE_BYTES)} needed (the files and 2 GB to spare), "
                f"{size_text(drive.free)} free where {drive.label} is."
            )
    return None


TEST_SONG: dict[str, Any] = {
    "template": "yue2-song",
    "fields": {
        "template": "none",
        "genre": "lo-fi hip hop",
        "mood": "calm",
        "description": "a short calm beat with soft keys - Plenio Setup's test song",
        "length": "very short (about 1:00)",
        "vocals": "instrumental",
        "finish.cover_art": False,
        "finish.hq_mastering": False,
    },
    "release": {
        "folder": "plenio/Setup test",
        "naming": "{date} Setup test",
        "sheet_music": "off",
        "song_page": False,
        "lyrics_srt": False,
    },
    "client": {"name": "Plenio Setup"},
}
"""Setup's test song (step 5, PD 4.1): the real *1 · YuE2 · Song* template with the chosen files and a fixed brief -
a minute, instrumental, no cover art, no HQ - so that a failure appears in Setup, not in the first real song."""
