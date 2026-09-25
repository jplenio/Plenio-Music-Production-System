"""Release export: file naming, FLAC encoding, the release record and secret redaction.

Phase 3 scope is FLAC 24-bit plus the record; MP3/WAV, tags and cover art
follow with the audio production chain (Phase 7).
"""

from __future__ import annotations

import re
import time
import unicodedata
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .dependencies import require
from .errors import PlenioUserError
from .hashing import canonical_json, sha256_text

RECORD_SCHEMA = "plenio.record/1"
_RESERVED = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{i}" for i in range(1, 10)),
    *(f"LPT{i}" for i in range(1, 10)),
}
_INVALID = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
_SECRET_KEY = re.compile(
    r"(?i)(api[_-]?key|token|secret|password|passwd|authorization|auth|credential|cookie)"
)
_SECRET_VALUE = re.compile(
    r"\b(hf_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{30,}|ghp_[A-Za-z0-9]{30,})\b"
)
PATTERN_TOKENS = ("title", "date", "time", "seed")


def safe_filename(name: str, fallback: str = "Untitled") -> str:
    """A file-name-safe version of ``name`` that keeps Unicode letters (Windows rules applied everywhere)."""
    text = unicodedata.normalize("NFC", name)
    text = _INVALID.sub("", text)
    text = re.sub(r"\s+", " ", text).strip().rstrip(". ")
    if not text:
        text = fallback
    if text.split(".")[0].upper() in _RESERVED:
        text = f"{text}_"
    return text[:120].rstrip(". ") or fallback


def expand_pattern(pattern: str, values: Mapping[str, str]) -> str:
    """Replace ``{title}``, ``{date}``, ``{time}`` and ``{seed}``; unknown tokens are an error."""
    unknown = sorted(set(re.findall(r"\{([^{}]*)\}", pattern)) - set(PATTERN_TOKENS))
    if unknown:
        raise PlenioUserError(
            f"Unknown naming tokens {unknown}.", hint=f"Use {['{' + t + '}' for t in PATTERN_TOKENS]}."
        )
    result = pattern
    for token in PATTERN_TOKENS:
        result = result.replace("{" + token + "}", values.get(token, ""))
    return result


def naming_values(title: str, seed: int | None, now: time.struct_time | None = None) -> dict[str, str]:
    moment = now or time.localtime()
    return {
        "title": safe_filename(title),
        "date": time.strftime("%Y-%m-%d", moment),
        "time": time.strftime("%H%M%S", moment),
        "seed": "" if seed is None else str(seed),
    }


def plan_path(folder: Path, relative: str, extension: str, *, collision: str = "number") -> Path:
    """Target path for ``relative`` (may contain sub-folders) under ``folder``.

    ``collision``: ``number`` appends `` (2)``, `` (3)``...; ``overwrite`` replaces; ``error`` refuses.
    """
    parts = [safe_filename(part) for part in re.split(r"[\\/]+", relative) if part.strip()]
    if not parts:
        raise PlenioUserError("The file name pattern produced an empty name.")
    target = folder.joinpath(*parts[:-1], parts[-1] + extension)
    resolved_folder = folder.resolve()
    if resolved_folder not in target.resolve().parents:
        raise PlenioUserError(f"The file name {relative!r} leaves the output folder.")
    if not target.exists() or collision == "overwrite":
        return target
    if collision == "error":
        raise PlenioUserError(
            f"{target.name} already exists.", hint="Change the naming pattern or the collision policy."
        )
    for number in range(2, 10000):
        candidate = target.with_name(f"{parts[-1]} ({number}){extension}")
        if not candidate.exists():
            return candidate
    raise PlenioUserError(f"Too many files named {parts[-1]!r}.")


def write_flac(path: Path, samples: Any, sample_rate: int) -> dict[str, Any]:
    """Encode ``samples`` (float array ``[channels, frames]`` in -1..1) as 24-bit FLAC."""
    av = require("av")
    import numpy as np

    data = np.asarray(samples, dtype=np.float32)
    if data.ndim != 2 or data.shape[0] not in (1, 2) or data.shape[1] == 0:
        raise PlenioUserError(
            f"Expected mono or stereo audio as [channels, frames], got shape {tuple(data.shape)}."
        )
    peak = float(np.max(np.abs(data)))
    clipped = int(np.count_nonzero(np.abs(data) > 1.0))
    ints = np.clip(np.round(data * (2**23 - 1)), -(2**23), 2**23 - 1).astype(np.int32) << 8
    layout = "mono" if data.shape[0] == 1 else "stereo"
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".part")
    container = av.open(str(partial), mode="w", format="flac")
    try:
        stream = container.add_stream("flac", rate=sample_rate, layout=layout)
        stream.codec_context.format = "s32"
        interleaved = np.ascontiguousarray(ints.T)
        block = 1 << 16
        for start in range(0, interleaved.shape[0], block):
            chunk = np.ascontiguousarray(interleaved[start : start + block].reshape(1, -1))
            frame = av.AudioFrame.from_ndarray(chunk, format="s32", layout=layout)
            frame.sample_rate = sample_rate
            frame.pts = start  # monotonic timestamps, one tick per sample
            for packet in stream.encode(frame):
                container.mux(packet)
        for packet in stream.encode(None):
            container.mux(packet)
    finally:
        container.close()
    partial.replace(path)
    return {
        "format": "flac",
        "bits": 24,
        "sample_rate": sample_rate,
        "channels": int(data.shape[0]),
        "seconds": round(data.shape[1] / sample_rate, 3),
        "peak": round(peak, 4),
        "clipped_samples": clipped,
    }


def file_facts(path: Path) -> dict[str, Any]:
    import hashlib

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    return {"name": path.name, "bytes": path.stat().st_size, "sha256": digest}


def redact(value: Any) -> Any:
    """Copy of ``value`` with secret-like keys and token-like strings replaced by ``<redacted>``."""
    if isinstance(value, Mapping):
        return {
            k: (
                "<redacted>"
                if isinstance(k, str) and _SECRET_KEY.search(k) and not isinstance(v, (Mapping, list))
                else redact(v)
            )
            for k, v in value.items()
        }
    if isinstance(value, list | tuple):
        return [redact(item) for item in value]
    if isinstance(value, str):
        return _SECRET_VALUE.sub("<redacted>", value)
    return value


@dataclass(frozen=True)
class RecordInput:
    versions: Mapping[str, str]
    prompt: Mapping[str, Any] | None
    reports: Sequence[Mapping[str, Any]]
    files: Sequence[Mapping[str, Any]]
    audio: Mapping[str, Any]
    title: str
    licences: Sequence[str]


def build_record(data: RecordInput) -> dict[str, Any]:
    """The release record: everything needed to know how the audio was made."""
    documents: dict[str, Any] = {}
    for report in data.reports:
        for kind, doc in (report.get("data", {}).get("documents") or {}).items():
            documents[kind] = doc
    record = {
        "schema": RECORD_SCHEMA,
        "created": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "title": data.title,
        "versions": dict(data.versions),
        "documents": documents,
        "reports": [dict(r) for r in data.reports],
        "audio": dict(data.audio),
        "files": [dict(f) for f in data.files],
        "licences": list(data.licences),
        "prompt": redact(dict(data.prompt)) if data.prompt else None,
    }
    record["fingerprint"] = sha256_text(canonical_json({k: v for k, v in record.items() if k != "created"}))
    return record
