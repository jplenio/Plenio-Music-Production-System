"""Lyrics ASR: engines, settings, results (``plenio.asr/1``) and the on-disk result cache.

The ASR itself runs in a worker process (``plenio.workers.asr``). This module is
pure: it describes what to run and stores what came back.

Reproducibility (yue2-cover-design section 5.3): an edited lyrics document stays
valid only while its ASR draft is unchanged, so every result is cached on disk
under a key made of the source audio hash, the vocal regions, the engine, the
model revision and the settings. The cache - not the decoder - guarantees that a
ComfyUI restart gives the same draft.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .alignment import AsrWord, words_from
from .errors import PlenioUserError
from .files import atomic_write_text
from .hashing import sha256_json

ASR_SCHEMA = "plenio.asr/1"
CACHE_VERSION = 1


@dataclass(frozen=True)
class AsrEngine:
    id: str
    label: str
    asset_id: str
    """Catalogue id of the model folder (``resources/assets.toml``)."""
    worker: str
    licence: str
    environment: str = "host"
    """``host`` = ComfyUI's Python; otherwise the name of an isolated package folder."""
    aligner_asset_id: str = ""


ENGINES: dict[str, AsrEngine] = {
    "faster-whisper large-v3": AsrEngine(
        "faster-whisper-large-v3",
        "faster-whisper large-v3",
        "faster-whisper-large-v3",
        "plenio.workers.asr",
        "MIT (faster-whisper, CTranslate2, Whisper weights)",
    ),
}
DEFAULT_ENGINE = "faster-whisper large-v3"


@dataclass(frozen=True)
class AsrSettings:
    engine: str = DEFAULT_ENGINE
    language: str = ""
    """Empty = detect."""
    device: str = "auto"
    beam_size: int = 5
    seed: int = 0
    regions: tuple[tuple[float, float], ...] = ()
    """Only these (start, end) spans are transcribed; empty = the whole audio."""

    def to_dict(self) -> dict[str, Any]:
        return {
            "engine": self.engine,
            "language": self.language,
            "beam_size": self.beam_size,
            "seed": self.seed,
            "regions": [[round(a, 2), round(b, 2)] for a, b in self.regions],
        }


@dataclass(frozen=True)
class AsrResult:
    engine: str
    model: str
    language: str
    language_probability: float
    segments: tuple[dict[str, Any], ...]
    words: tuple[AsrWord, ...]
    device: str = ""
    seconds: float = 0.0
    settings: Mapping[str, Any] = field(default_factory=dict)
    cached: bool = False

    @property
    def text(self) -> str:
        return " ".join(str(s.get("text", "")).strip() for s in self.segments).strip()

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": ASR_SCHEMA,
            "engine": self.engine,
            "model": self.model,
            "language": self.language,
            "language_probability": round(self.language_probability, 4),
            "device": self.device,
            "seconds": round(self.seconds, 2),
            "settings": dict(self.settings),
            "segments": list(self.segments),
            "words": [w.to_dict() for w in self.words],
        }


def result_from_dict(data: Mapping[str, Any], *, cached: bool = False) -> AsrResult:
    if data.get("schema") != ASR_SCHEMA:
        raise PlenioUserError(f"Unsupported ASR result schema {data.get('schema')!r}.")
    return AsrResult(
        engine=str(data["engine"]),
        model=str(data.get("model", "")),
        language=str(data.get("language") or ""),
        language_probability=float(data.get("language_probability") or 0.0),
        segments=tuple(dict(s) for s in data.get("segments", [])),
        words=tuple(words_from(data.get("words", []))),
        device=str(data.get("device", "")),
        seconds=float(data.get("seconds", 0.0)),
        settings=dict(data.get("settings", {})),
        cached=cached,
    )


def engine_for(label: str) -> AsrEngine:
    try:
        return ENGINES[label]
    except KeyError as error:
        raise PlenioUserError(
            f"Unknown ASR engine {label!r}.", hint=f"Choose one of {sorted(ENGINES)}."
        ) from error


def cache_key(source_sha256: str, settings: AsrSettings, model_revision: str) -> str:
    return sha256_json(
        {
            "cache": CACHE_VERSION,
            "source": source_sha256,
            "model_revision": model_revision,
            **settings.to_dict(),
        }
    )


class AsrCache:
    """``<folder>/<key>.json``; a missing or unreadable entry is simply a cache miss."""

    def __init__(self, folder: Path):
        self.folder = folder

    def path(self, key: str) -> Path:
        return self.folder / f"{key}.json"

    def get(self, key: str) -> AsrResult | None:
        path = self.path(key)
        if not path.is_file():
            return None
        try:
            return result_from_dict(json.loads(path.read_text(encoding="utf-8")), cached=True)
        except (OSError, ValueError, KeyError, PlenioUserError):
            return None

    def put(self, key: str, result: AsrResult) -> None:
        self.folder.mkdir(parents=True, exist_ok=True)
        atomic_write_text(self.path(key), json.dumps(result.to_dict(), ensure_ascii=False))


class AsrNotes:
    """Editor notes of lyrics drafts (``<folder>/<draft sha256>.json``): unsure and left-out words.

    The Song Sheet editor looks a note up by the hash of the draft it shows, so the note needs no
    graph connection and survives ComfyUI's cache (a cached node does not resend its UI output).
    """

    def __init__(self, folder: Path):
        self.folder = folder

    @staticmethod
    def _valid(draft_sha256: str) -> bool:
        return len(draft_sha256) == 64 and all(c in "0123456789abcdef" for c in draft_sha256)

    def put(self, note: Mapping[str, Any]) -> None:
        key = str(note.get("draft_sha256", ""))
        if not self._valid(key):
            raise PlenioUserError(f"Invalid draft hash {key!r} for an ASR note.")
        self.folder.mkdir(parents=True, exist_ok=True)
        atomic_write_text(self.folder / f"{key}.json", json.dumps(dict(note), ensure_ascii=False))

    def get(self, draft_sha256: str) -> dict[str, Any] | None:
        if not self._valid(draft_sha256):
            return None
        path = self.folder / f"{draft_sha256}.json"
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return None
        return data if isinstance(data, dict) else None


WEAK_SEGMENT_MAX_WORDS = 3
WEAK_SEGMENT_LOGPROB = -0.7
WEAK_SEGMENT_WORD_P = 0.2
"""A Whisper stock phrase at the end of a clip ("Thank you." in the Phase 4B cover run: 2 words,
avg_logprob -0.86 against -0.10 to -0.35 for the sung lines, one word at p 0.04)."""


def weak_segments(result: AsrResult) -> set[int]:
    """Indices of segments that look like a decoder invention rather than singing.

    Whisper-specific (it needs ``avg_logprob``): a segment of at most three words whose average
    log probability is below -0.7 and which contains a word below p 0.2. Other engines report no
    ``avg_logprob`` and are not filtered.
    """
    weak: set[int] = set()
    for index, segment in enumerate(result.segments):
        logprob = segment.get("avg_logprob")
        if logprob is None or float(logprob) >= WEAK_SEGMENT_LOGPROB:
            continue
        words = [w for w in result.words if w.segment == index]
        if 0 < len(words) <= WEAK_SEGMENT_MAX_WORDS and min(w.p for w in words) < WEAK_SEGMENT_WORD_P:
            weak.add(index)
    return weak
