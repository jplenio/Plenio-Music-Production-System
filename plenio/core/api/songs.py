"""The released songs of the Song API v2 (``/songs``, PD 8.1): the release records in ComfyUI's output folder - not
only this session's jobs - each by an id made from its place (the record's path in the output folder, encoded), so
an id never names a place outside it.

Standard library only.
"""

from __future__ import annotations

import base64
import binascii
from collections.abc import Iterable, Mapping
from typing import Any

from ..errors import PlenioUserError
from ..release import RECORD_SUFFIX


def song_id(relative: str) -> str:
    """The id of the record at ``relative`` (``/``-separated, inside the output folder)."""
    return base64.urlsafe_b64encode(relative.encode("utf-8")).decode("ascii").rstrip("=")


def relative_of(song: str) -> str:
    """The record's path of a song id (refused when it is none: the path is checked again by the caller)."""
    try:
        text = base64.urlsafe_b64decode(song + "=" * (-len(song) % 4)).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError, ValueError) as error:
        raise PlenioUserError(f"There is no song {song[:40]!r}.") from error
    if not text.endswith(RECORD_SUFFIX) or text.startswith("/") or ".." in text.split("/"):
        raise PlenioUserError(f"There is no song {song[:40]!r}.")
    return text


def song_row(row: Mapping[str, Any]) -> dict[str, Any]:
    """A record's summary (``continuation.list_records``) as v2 lists a song."""
    out = {key: row.get(key) for key in ("title", "created", "plenio", "seconds", "workflow")}
    out["id"] = song_id(str(row["path"]))
    out["files"] = {"audio": bool(row.get("audio")), "cover": bool(row.get("cover"))}
    return out


def matches(row: Mapping[str, Any], query: str) -> bool:
    """Every word of ``query`` is in the song's title, date or folder (the player's search, its simplest form)."""
    words = [word for word in query.lower().split() if word]
    text = f"{row.get('title', '')} {str(row.get('created', ''))[:10]} {row.get('path', '')}".lower()
    return all(word in text for word in words)


def listing(rows: Iterable[Mapping[str, Any]], query: str = "", limit: int = 50) -> list[dict[str, Any]]:
    return [song_row(row) for row in rows if matches(row, query)][: max(0, limit)]
