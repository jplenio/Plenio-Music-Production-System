"""Creative modes: how freely a song is written and arranged (Song Brief / Cover Brief *arrangement*).

A mode is a Markdown file with a front matter block (``resources/arrangement/*.md`` in the package,
``<ComfyUI user directory>/plenio/arrangement/*.md`` for your own):

.. code-block:: text

    ---
    name: varied
    order: 30
    description: Every section sounds different.
    lead: keep, pad, arpeggio, riff, countermelody, solo, octave
    key shift: 0..2
    tempo change: -5..5
    chord colors: 2
    ---

    ## Writer
    Lines added to the writing prompt (the style or caption).

    ## Arranger
    Lines added to the arrangement prompt (the section plan).

``simple`` is built in and has no file: the music model plans the music by itself, as before.
"""

from __future__ import annotations

import logging
import re
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

from ..errors import PlenioUserError

log = logging.getLogger("plenio")

SIMPLE = "simple"
"""The built-in mode: no writer hints, no section plan - the music model plans the music by itself."""
LEAD_ROLES = ("keep", "none", "pad", "arpeggio", "riff", "countermelody", "solo", "octave", "motif")
"""What the instrument line (the score's Ins voice) plays in a section; see ``lines``."""
CHORD_COLORS = {
    1: ("", "m", "sus2", "sus4"),
    2: ("", "m", "sus2", "sus4", "7", "maj7", "m7", "6", "m6", "7sus4"),
    3: (
        "",
        "m",
        "sus2",
        "sus4",
        "7",
        "maj7",
        "m7",
        "6",
        "m6",
        "7sus4",
        "dim",
        "aug",
        "m7b5",
        "dim7",
        "m(maj7)",
    ),
}
"""Chord qualities per colour level (1 plain, 2 with sevenths and sixths, 3 everything YuE2 reads; slash
basses from level 3)."""
KEY_SHIFT_LIMITS = (-5, 5)
TEMPO_CHANGE_LIMITS = (-25, 25)
_FRONT_MATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", re.DOTALL)
_HEADING = re.compile(r"(?mi)^##\s*(writer|arranger)\s*$")
_RANGE = re.compile(r"^\s*([+-]?\d+)\s*\.\.\s*([+-]?\d+)\s*$")
_NAME = re.compile(r"^[a-z0-9][a-z0-9 ()-]{0,40}$")


@dataclass(frozen=True)
class CreativeMode:
    id: str
    name: str
    """The option in the brief's *arrangement* list (lower case words)."""
    description: str
    writer: str = ""
    """Text added to the writing prompt's rules (instruments, production words)."""
    arranger: str = ""
    """Text added to the arrangement prompt."""
    lead: tuple[str, ...] = ("keep",)
    key_shift: tuple[int, int] = (0, 0)
    tempo_change: tuple[int, int] = (0, 0)
    chord_colors: int = 1
    order: int = 100
    source: str = "package"

    @property
    def arranges(self) -> bool:
        """Whether this mode writes a section plan (every mode but ``simple``)."""
        return self.id != SIMPLE

    def qualities(self) -> tuple[str, ...]:
        return CHORD_COLORS[self.chord_colors]


SIMPLE_MODE = CreativeMode(
    SIMPLE,
    SIMPLE,
    "The music model plans melody, chords and instruments by itself (as before); no section plan.",
    order=0,
)


def _range(value: str, name: str, limits: tuple[int, int], mode_id: str) -> tuple[int, int]:
    match = _RANGE.match(value)
    if match is None:
        raise PlenioUserError(f"Creative mode {mode_id!r}: '{name}' must look like -2..3, got {value!r}.")
    low, high = int(match.group(1)), int(match.group(2))
    if not limits[0] <= low <= high <= limits[1]:
        raise PlenioUserError(
            f"Creative mode {mode_id!r}: '{name}' {low}..{high} is outside {limits[0]}..{limits[1]}."
        )
    return low, high


def parse_mode(text: str, mode_id: str, source: str = "package") -> CreativeMode:
    """Read one mode file; a mistake raises ``PlenioUserError`` naming the field."""
    match = _FRONT_MATTER.match(text.replace("\r\n", "\n"))
    if match is None:
        raise PlenioUserError(f"Creative mode {mode_id!r} has no front matter block (--- ... ---).")
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(":")
        if not sep:
            raise PlenioUserError(f"Creative mode {mode_id!r}: malformed front matter line {line!r}.")
        fields[key.strip().lower()] = value.strip()
    unknown = sorted(
        set(fields) - {"name", "order", "description", "lead", "key shift", "tempo change", "chord colors"}
    )
    if unknown:
        raise PlenioUserError(f"Creative mode {mode_id!r}: unknown fields {unknown}.")
    name = fields.get("name", mode_id.rsplit("/", 1)[-1].replace("-", " ")).strip().lower()
    if not _NAME.match(name) or name == SIMPLE:
        raise PlenioUserError(
            f"Creative mode {mode_id!r}: the name {name!r} must be 1-40 lower-case letters, digits, spaces or "
            f"( ) - and not {SIMPLE!r}."
        )
    lead = tuple(
        dict.fromkeys(part.strip().lower() for part in fields.get("lead", "keep").split(",") if part.strip())
    )
    wrong = [role for role in lead if role not in LEAD_ROLES]
    if wrong or not lead:
        raise PlenioUserError(
            f"Creative mode {mode_id!r}: unknown lead roles {wrong}; use {list(LEAD_ROLES)}."
        )
    try:
        colors = int(fields.get("chord colors", "1"))
        order = int(fields.get("order", "100"))
    except ValueError:
        raise PlenioUserError(
            f"Creative mode {mode_id!r}: 'chord colors' and 'order' must be whole numbers."
        ) from None
    if colors not in CHORD_COLORS:
        raise PlenioUserError(f"Creative mode {mode_id!r}: 'chord colors' must be 1, 2 or 3.")
    body = match.group(2)
    parts = {"writer": "", "arranger": ""}
    headings = list(_HEADING.finditer(body))
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(body)
        parts[heading.group(1).lower()] = body[heading.end() : end].strip()
    if not parts["arranger"]:
        raise PlenioUserError(f"Creative mode {mode_id!r} needs an '## Arranger' section.")
    return CreativeMode(
        id=mode_id,
        name=name,
        description=fields.get("description", "").strip(),
        writer=parts["writer"],
        arranger=parts["arranger"],
        lead=lead,
        key_shift=_range(fields.get("key shift", "0..0"), "key shift", KEY_SHIFT_LIMITS, mode_id),
        tempo_change=_range(fields.get("tempo change", "0..0"), "tempo change", TEMPO_CHANGE_LIMITS, mode_id),
        chord_colors=colors,
        order=order,
        source=source,
    )


class ModeLibrary:
    """The package's modes (read-only) plus the user's (ComfyUI user directory); ``simple`` built in."""

    def __init__(self, package_dir: Path, user_dir: Path | None = None):
        self.package_dir = package_dir
        self.user_dir = user_dir
        self._modes: dict[str, CreativeMode] | None = None
        self.problems: dict[str, str] = {}
        """User mode files that could not be read (file -> reason); they are skipped."""

    def _load(self) -> dict[str, CreativeMode]:
        modes: dict[str, CreativeMode] = {SIMPLE: SIMPLE_MODE}
        self.problems = {}
        for folder, source in ((self.package_dir, "package"), (self.user_dir, "user")):
            if folder is None or not folder.is_dir():
                continue
            for path in sorted(folder.glob("*.md")):
                if path.name.lower() == "readme.md":
                    continue
                mode_id = path.stem if source == "package" else f"user/{path.stem}"
                try:
                    mode = parse_mode(path.read_text(encoding="utf-8"), mode_id, source)
                except (PlenioUserError, OSError, UnicodeDecodeError) as error:
                    if source == "package":
                        raise  # shipped modes are tested; a broken one is a packaging bug
                    self.problems[str(path)] = str(error).splitlines()[0]
                    log.warning("Plenio: skipped the creative mode %s: %s", path, self.problems[str(path)])
                    continue
                if any(existing.name == mode.name for existing in modes.values()):
                    if source == "package":
                        raise PlenioUserError(f"Two creative modes are called {mode.name!r}.")
                    mode = CreativeMode(**{**mode.__dict__, "name": f"{mode.name} (mine)"})
                modes[mode_id] = mode
        return modes

    def modes(self) -> Mapping[str, CreativeMode]:
        if self._modes is None:
            self._modes = self._load()
        return self._modes

    def reload(self) -> None:
        self._modes = None

    def names(self) -> list[str]:
        """The options of the brief's *arrangement* list: ``simple`` first, then by ``order``."""
        return [m.name for m in sorted(self.modes().values(), key=lambda m: (m.order, m.name))]

    def by_name(self, name: str) -> CreativeMode:
        for mode in self.modes().values():
            if mode.name == name:
                return mode
        raise PlenioUserError(
            f"Unknown creative mode {name!r}.",
            hint=f"Choose one of {self.names()} (your own modes appear after a refresh).",
        )
