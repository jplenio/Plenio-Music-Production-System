"""Variables in Export Release's tag fields and file name pattern (owner's request 2026-10-15,
``docs/design/subtitles-tags-seeds.md`` §2).

Syntax, the one the file name pattern always had (``{date} {title}``):

- ``{name}`` - the variable's value; names are lower case with underscores, any case is read.
- ``[ ... ]`` around text with at least one variable: the text appears only when every variable in it has a
  value (as in foobar2000 and Mp3tag title formatting) - ``[Mood: {mood} · ]`` disappears for an empty mood.
  Brackets without a variable inside stay text (``[Live]``).
- ``{{`` and ``}}`` - literal braces (a bracket needs no escape: one without a variable inside is text).

A name that is no variable stays as typed (``{foo}``) and is reported: Export Release refuses it in a typed
field when the run is queued, and keeps it in linked text, which may hold braces of its own.

Pure functions; Export Release gathers the values.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass

VARIABLES: dict[str, dict[str, str]] = {
    "song": {
        "title": "the song's title",
        "lyrics": "the final lyrics as plain lines (no section tags), a blank line between sections",
        "style": "the style the music model was given",
        "artwork_prompt": "the Song Sheet's artwork prompt",
        "duration": "the song's length, m:ss",
        "bpm": "the score's tempo (YuE2)",
        "score_key": "the score's key (YuE2)",
    },
    "brief": {
        "description": "the brief's description",
        "template": "the brief template (empty for none)",
        "mode": "the work mode",
        "genre": "the genre (the template's when the field is empty)",
        "mood": "the mood",
        "tempo": "the tempo as written in the brief",
        "length": "the target length (a cover: as the source)",
        "vocals": "sung or instrumental (a cover: original lyrics, new lyrics, instrumental)",
        "language": "the language of the lyrics",
        "voice": "the vocal character",
        "theme": "what the lyrics are about",
        "melody": "an instrumental's melody choice",
        "lead_instrument": "an instrumental's lead instrument",
        "key": "the key as written in the brief",
        "meter": "the meter as written in the brief",
        "arrangement": "the creative mode",
        "genre_closeness": "a song's genre closeness (0-100)",
        "lines_under_singing": "on or off",
        "harmony": "a cover's harmony choice",
        "song_flow_closeness": "a cover's song flow closeness (0-100)",
        "lyrics_closeness": "a cover's lyrics closeness (0-100)",
        "creativity": "the creativity (0-200, 50 the reference, 100 the default)",
    },
    "run": {
        "date": "the export's date, YYYY-MM-DD",
        "year": "the export's year",
        "time": "the export's time, HHMMSS",
        "seed": "the take seed",
        "take_seed": "the take seed (the node titled Take seed)",
        "draft_seed": "the draft seed (the node titled Draft seed)",
        "arrangement_seed": "the arrangement seed (the node titled Arrangement seed)",
    },
    "models": {
        "model": "the music model, e.g. YuE2 or MiniMax Music 3",
        "writer": "the writer model",
    },
    "plenio": {"plenio_version": "Plenio's version"},
    "tags": {
        "artist": "the artist tag",
        "album": "the album tag",
        "album_artist": "the album artist tag",
        "composer": "the composer tag",
        "track": "the track tag",
    },
}
NAMES: frozenset[str] = frozenset(name for group in VARIABLES.values() for name in group)
TAG_VARIABLES = tuple(VARIABLES["tags"])
"""Tag fields that are variables too (in the file name pattern and the other tag fields)."""

_NAME = re.compile(r"\{([A-Za-z][A-Za-z0-9_]*)\}")


@dataclass(frozen=True)
class _Text:
    text: str


@dataclass(frozen=True)
class _Var:
    name: str
    raw: str


@dataclass(frozen=True)
class _Group:
    parts: tuple[_Text | _Var | _Group, ...]


def _parse(template: str) -> tuple[_Text | _Var | _Group, ...]:
    """The template as text, variables and optional groups (an unclosed ``[`` is text)."""
    stack: list[list[_Text | _Var | _Group]] = [[]]
    opened: list[int] = []
    k = 0
    while k < len(template):
        pair = template[k : k + 2]
        if pair in ("{{", "}}"):
            stack[-1].append(_Text(pair[0]))
            k += 2
            continue
        char = template[k]
        if char == "{":
            match = _NAME.match(template, k)
            if match:
                stack[-1].append(_Var(match.group(1).lower(), match.group(0)))
                k = match.end()
                continue
        elif char == "[":
            stack.append([])
            opened.append(k)
            k += 1
            continue
        elif char == "]" and opened:
            parts = stack.pop()
            opened.pop()
            stack[-1].append(_Group(tuple(parts)) if _has_var(parts) else _Text(f"[{_render_plain(parts)}]"))
            k += 1
            continue
        stack[-1].append(_Text(char))
        k += 1
    while opened:  # an unclosed bracket: the bracket is text, its content stays as it is
        parts = stack.pop()
        opened.pop()
        stack[-1] += [_Text("["), *parts]
    return tuple(stack[0])


def _has_var(parts: list[_Text | _Var | _Group] | tuple[_Text | _Var | _Group, ...]) -> bool:
    return any(isinstance(p, _Var) or (isinstance(p, _Group) and _has_var(p.parts)) for p in parts)


def _render_plain(parts: list[_Text | _Var | _Group] | tuple[_Text | _Var | _Group, ...]) -> str:
    return "".join(p.text if isinstance(p, _Text) else p.raw if isinstance(p, _Var) else "" for p in parts)


def names_in(template: str) -> list[str]:
    """Every variable name ``template`` uses, in order (known or not)."""
    found: list[str] = []

    def walk(parts: tuple[_Text | _Var | _Group, ...]) -> None:
        for part in parts:
            if isinstance(part, _Var):
                found.append(part.name)
            elif isinstance(part, _Group):
                walk(part.parts)

    walk(_parse(template or ""))
    return found


def unknown_names(template: str) -> list[str]:
    return sorted({name for name in names_in(template) if name not in NAMES})


def expand(template: str, values: Mapping[str, object]) -> tuple[str, list[str]]:
    """``template`` with its variables replaced, and the unknown names it kept as typed. A known name without
    a value gives an empty text (and hides its optional group)."""
    unknown: list[str] = []

    def value(name: str) -> str:
        found = values.get(name)
        return "" if found is None else str(found)

    def render(parts: tuple[_Text | _Var | _Group, ...]) -> str:
        out = []
        for part in parts:
            if isinstance(part, _Text):
                out.append(part.text)
            elif isinstance(part, _Var):
                if part.name in NAMES:
                    out.append(value(part.name))
                else:
                    unknown.append(part.name)
                    out.append(part.raw)
            else:
                names = [p.name for p in part.parts if isinstance(p, _Var) and p.name in NAMES]
                if all(value(name).strip() for name in names):
                    out.append(render(part.parts))
        return "".join(out)

    return render(_parse(template or "")), sorted(set(unknown))


def unknown_message(where: str, names: list[str]) -> str:
    return (
        f"{where} uses {', '.join('{' + n + '}' for n in names)}, which is no Plenio variable. Known: "
        + ", ".join("{" + n + "}" for n in sorted(NAMES))
        + " (write {{ and }} for literal braces)."
    )
