"""The library's search as the player's page searches (``frontend/src/player/search.ts``), for the Player API.

Free words over title, genre, mood, style, lyrics, the brief and the listener's tags, field filters (``genre:pop``,
``bpm:>100``, ``len:<3``, ``tag:party`` or ``#party``, ``is:fav``, ``has:pdf``, ``stars:>=4``...), ``"quoted
phrases"`` and ``-`` in front to keep out what matches. Every term must match; the best matches come first.
Both sides are checked against the same cases (``tests/fixtures/player/search-cases.json``).
"""

from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from typing import Any

FIELDS: dict[str, str] = {
    "genre": "genre", "g": "genre", "mood": "mood", "bpm": "bpm", "tempo": "bpm", "key": "key", "model": "model",
    "m": "model", "year": "year", "lang": "language", "language": "language", "vocals": "vocals", "mode": "mode",
    "arrangement": "mode", "len": "len", "length": "len", "is": "is", "has": "has", "title": "title",
    "lyrics": "lyrics", "style": "style", "artist": "artist", "album": "album", "plenio": "plenio",
    "version": "plenio", "template": "template", "writer": "writer", "meter": "meter", "tag": "tag", "tags": "tag",
    "kind": "kind", "creativity": "creativity", "creative": "creativity", "stars": "stars", "rating": "stars",
    "rated": "stars", "measured": "measured", "auto": "measured",
}  # fmt: skip

CREATIVITY_LEVELS: tuple[tuple[int, str], ...] = (
    (19, "steady"),
    (39, "restrained"),
    (60, "balanced"),
    (80, "varied"),
    (150, "experimental"),
    (200, "adventurous"),
)

_TERM = re.compile(r'(-)?(?:(\w+):)?(?:"([^"]*)"|(\S+))', re.ASCII)
_MARKS = re.compile("[̀-ͯ]")


@dataclass(frozen=True)
class Term:
    field: str
    value: str
    negate: bool


@dataclass
class Context:
    """What the listener keeps of their own: favourites, tags, plays and stars per song; the measured stars."""

    favorites: set[str] = field(default_factory=set)
    tags: Mapping[str, list[str]] = field(default_factory=dict)
    plays: Mapping[str, int] = field(default_factory=dict)
    ratings: Mapping[str, float] = field(default_factory=dict)
    measured: Mapping[str, float | None] = field(default_factory=dict)

    @classmethod
    def of_state(
        cls, state: Mapping[str, Any], measured: Mapping[str, float | None] | None = None
    ) -> Context:
        """The context of a player state (``favorites``, ``tags``, ``plays``, ``ratings`` as the page saves them)."""

        def mapping(key: str) -> dict[str, Any]:
            value = state.get(key)
            return dict(value) if isinstance(value, Mapping) else {}

        favourites = state.get("favorites")
        return cls(
            favorites={str(f) for f in favourites} if isinstance(favourites, list) else set(),
            tags={k: [str(t) for t in v] for k, v in mapping("tags").items() if isinstance(v, list)},
            plays={k: int(v) for k, v in mapping("plays").items() if isinstance(v, (int, float))},
            ratings={k: float(v) for k, v in mapping("ratings").items() if isinstance(v, (int, float))},
            measured=dict(measured or {}),
        )


def fold(text: str) -> str:
    return _MARKS.sub("", unicodedata.normalize("NFKD", text)).lower()


def parse_query(query: str) -> list[Term]:
    terms: list[Term] = []
    for match in _TERM.finditer(query):
        minus, raw_field, quoted, bare = match.groups()
        value = (quoted if quoted is not None else bare or "").strip()
        if not value:
            continue
        if not raw_field and quoted is None and len(value) > 1 and value.startswith("#"):
            terms.append(Term("tag", value[1:], bool(minus)))
            continue
        name = FIELDS.get(raw_field.lower(), "") if raw_field else ""
        shown = value if name else (f"{raw_field}:{value}" if raw_field else value)
        terms.append(Term(name, shown, bool(minus)))
    return terms


def _number(value: Any) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        return None
    return float(value)


def number_test(value: str, actual: Any) -> bool:
    have = _number(actual)
    if have is None:
        return False
    span = re.fullmatch(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)", value)
    if span:
        return float(span.group(1)) <= have <= float(span.group(2))
    compare = re.fullmatch(r"(<=|>=|<|>|=)?\s*(\d+(?:\.\d+)?)", value)
    if not compare:
        return False
    n = float(compare.group(2))
    op = compare.group(1)
    if op == "<":
        return have < n
    if op == "<=":
        return have <= n
    if op == ">":
        return have > n
    if op == ">=":
        return have >= n
    return abs(have - n) < 0.5


def version_of(text: str | None) -> list[int] | None:
    match = re.match(r"(\d+)\.(\d+)(?:\.(\d+))?", text or "")
    return [int(match.group(1)), int(match.group(2)), int(match.group(3) or 0)] if match else None


def _compare(a: list[int], b: list[int]) -> int:
    for x, y in zip(a, b, strict=False):
        if x != y:
            return x - y
    return 0


def version_test(query: str, version: str | None) -> bool:
    have = version_of(version)
    if not have:
        return False
    q = re.sub(r"^from\s+", ">=", query.strip(), flags=re.IGNORECASE)
    span = re.fullmatch(r"(\d+\.\d+(?:\.\d+)?)\s*-\s*(\d+\.\d+(?:\.\d+)?)", q)
    if span:
        low, high = version_of(span.group(1)), version_of(span.group(2))
        assert low is not None and high is not None
        if len(span.group(2).split(".")) == 2:
            return _compare(have, low) >= 0 and _compare([*have[:2], 0], high) <= 0
        return _compare(have, low) >= 0 and _compare(have, high) <= 0
    op = re.fullmatch(r"(>=|<=|>|<|=)?\s*(\d+\.\d+(?:\.\d+)?)", q)
    if not op:
        return False
    want = version_of(op.group(2))
    assert want is not None
    c = _compare(have, want)
    sign = op.group(1)
    if sign == ">=":
        return c >= 0
    if sign == "<=":
        return c <= 0
    if sign == ">":
        return c > 0
    if sign == "<":
        return c < 0
    return have[:2] == want[:2] if len(op.group(2).split(".")) == 2 else c == 0


def creativity_level(value: float) -> str:
    return next((name for highest, name in CREATIVITY_LEVELS if value <= highest), "adventurous")


def _creativity_test(value: str, creativity: Any) -> bool:
    have = _number(creativity)
    if have is None:
        return False
    level = fold(value)
    if any(name == level for _, name in CREATIVITY_LEVELS):
        return creativity_level(have) == level
    return number_test(value, have)


def _stars_test(value: str, stars: Any) -> bool:
    if fold(value) == "none":
        return stars is None
    return number_test(value, stars)


def _has_test(song: Mapping[str, Any], v: str) -> bool:
    has = song.get("has") or {}
    if v == "lyrics":
        return bool(song.get("lyrics"))
    if v == "timing":
        return bool(has.get("timing") or has.get("lines"))
    return bool(has.get("pdf" if v == "sheet" else v))


def _is_test(song: Mapping[str, Any], v: str, context: Context) -> bool:
    song_id = str(song.get("id"))
    if v in ("fav", "favorite", "favourite"):
        return song_id in context.favorites
    if v == "cover":
        return song.get("kind") == "cover"
    if v == "other":
        return bool(song.get("other"))
    if v == "plenio":
        return not song.get("other")
    if v == "played":
        return context.plays.get(song_id, 0) > 0
    if v in ("unplayed", "never"):
        return not context.plays.get(song_id, 0)
    if v == "tagged":
        return bool(context.tags.get(song_id))
    if v == "untagged":
        return not context.tags.get(song_id)
    if v == "instrumental":
        return bool(song.get("instrumental"))
    return False


def matches(song: Mapping[str, Any], term: Term, context: Context) -> int:  # noqa: C901, PLR0911, PLR0912 - one table
    v = fold(term.value)
    brief = song.get("brief") or {}
    tags = song.get("tags") or {}
    song_id = str(song.get("id"))

    def has(text: Any) -> bool:
        return bool(text) and isinstance(text, str) and v in fold(text)

    kind = term.field
    if kind == "genre":
        return 3 if has(song.get("genre")) else 0
    if kind == "mood":
        return 3 if has(song.get("mood")) else 0
    if kind == "bpm":
        return 2 if number_test(term.value, song.get("bpm")) else 0
    if kind == "key":
        hit = fold(str(song.get("score_key") or "")) == v or fold(str(brief.get("key") or "")).startswith(v)
        return 2 if hit else 0
    if kind == "model":
        return (
            2
            if has(song.get("model")) or (v == "master" and not song.get("model") and not song.get("other"))
            else 0
        )
    if kind == "year":
        return 2 if song.get("year") == term.value else 0
    if kind == "language":
        return 2 if has(song.get("language")) else 0
    if kind == "vocals":
        vocals = song.get("vocals")
        sung = v == "sung" and not song.get("instrumental") and bool(vocals) and vocals != "sparse vocals"
        return 2 if has(vocals) or sung else 0
    if kind == "mode":
        return 2 if has(song.get("arrangement")) else 0
    if kind == "len":
        seconds = _number(song.get("seconds"))
        return 2 if seconds is not None and number_test(term.value, seconds / 60) else 0
    if kind == "creativity":
        return 2 if _creativity_test(term.value, brief.get("creativity")) else 0
    if kind == "stars":
        return 2 if _stars_test(term.value, context.ratings.get(song_id)) else 0
    if kind == "measured":
        return 2 if _stars_test(term.value, context.measured.get(song_id)) else 0
    if kind == "meter":
        return 2 if has(song.get("score_meter")) or has(brief.get("meter")) else 0
    if kind == "is":
        return 2 if _is_test(song, v, context) else 0
    if kind == "plenio":
        return 2 if version_test(term.value, song.get("plenio")) else 0
    if kind == "artist":
        return 3 if has(song.get("artist")) or has(tags.get("artist")) else 0
    if kind == "album":
        return 3 if has(song.get("album")) or has(tags.get("album")) else 0
    if kind == "has":
        return 2 if _has_test(song, v) else 0
    if kind == "title":
        return 5 if has(song.get("title")) else 0
    if kind in ("lyrics", "style", "template", "writer"):
        return 2 if has(song.get(kind)) else 0
    if kind == "kind":
        return 2 if fold("other" if song.get("other") else str(song.get("kind") or "")) == v else 0
    if kind == "tag":
        return 4 if any(fold(t) == v for t in context.tags.get(song_id, [])) else 0
    if has(song.get("title")):
        return 6
    named = ("genre", "mood", "artist", "album")
    if any(has(song.get(k)) for k in named) or has(tags.get("artist")) or has(tags.get("album")):
        return 4
    if any(v in fold(t) for t in context.tags.get(song_id, [])):
        return 4
    if (
        has(song.get("style"))
        or has(song.get("template"))
        or has(brief.get("description"))
        or has(brief.get("theme"))
    ):
        return 3
    if has(song.get("language")) or has(song.get("model")) or has(song.get("arrangement")):
        return 2
    return 1 if has(song.get("lyrics")) else 0


def score(song: Mapping[str, Any], terms: Iterable[Term], context: Context) -> int:
    """How well ``song`` matches ``terms`` (0: not at all); title hits weigh most, lyrics least."""
    total = 1
    for term in terms:
        hit = matches(song, term, context)
        if (hit > 0) if term.negate else (hit == 0):
            return 0
        if not term.negate:
            total += hit
    return total


def search(
    songs: Iterable[Mapping[str, Any]], query: str, context: Context | None = None
) -> list[Mapping[str, Any]]:
    """The songs that match ``query``, the best first, then the newest (no query: every song, the newest first)."""
    terms = parse_query(query)
    known = context or Context()
    scored = [(score(song, terms, known), song) for song in songs]
    found = [(s, song) for s, song in scored if s > 0]
    found.sort(key=lambda pair: str(pair[1].get("created") or ""), reverse=True)
    found.sort(key=lambda pair: pair[0], reverse=True)
    return [song for _, song in found]
