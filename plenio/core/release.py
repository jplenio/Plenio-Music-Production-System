"""Release export: file naming, encoding (FLAC, MP3, WAV via PyAV), tags and cover art, the release record
and secret redaction.
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


FORMATS: dict[str, dict[str, Any]] = {
    "flac": {
        "extension": ".flac",
        "container": "flac",
        "codec": "flac",
        "sample_format": "s32",
        "bits": 24,
        "options": {},
    },
    "mp3": {
        "extension": ".mp3",
        "container": "mp3",
        "codec": "libmp3lame",
        "sample_format": "s32p",
        "bits": None,
        "options": {"flags": "+qscale", "global_quality": "0"},  # LAME VBR V0 (ffmpeg -q:a 0)
    },
    "wav": {
        "extension": ".wav",
        "container": "wav",
        "codec": "pcm_f32le",
        "sample_format": "flt",
        "bits": 32,
        "options": {},
    },
}
"""Export formats: FLAC 24-bit, MP3 VBR V0 (LAME), WAV 32-bit float. MP3 and 24-bit FLAC clip at full scale."""
TAG_FIELDS = ("title", "artist", "album", "date", "track", "genre", "comment", "album_artist", "composer")
"""Generic tag names; the muxer maps them (FLAC: Vorbis comments, MP3: ID3v2, WAV: RIFF INFO)."""


def _frames(data: Any, sample_format: str) -> Any:
    import numpy as np

    if sample_format == "flt":
        return np.ascontiguousarray(data.T.reshape(1, -1).astype(np.float32))
    # Full scale is 2**(bits-1), as in decoders, so a 24-bit source is written back sample-exact.
    if sample_format == "s32":  # 24-bit samples in the upper bits of s32 (the FLAC encoder writes 24 bits)
        ints = np.clip(np.round(data * 2**23), -(2**23), 2**23 - 1).astype(np.int32) << 8
        return np.ascontiguousarray(ints.T.reshape(1, -1))
    ints = np.clip(np.round(data * 2**31), -(2**31), 2**31 - 1).astype(np.int32)  # planar s32 for LAME
    return np.ascontiguousarray(ints)


def write_audio(
    path: Path, samples: Any, sample_rate: int, kind: str = "flac", tags: Mapping[str, str] | None = None
) -> dict[str, Any]:
    """Encode ``samples`` (float ``[channels, frames]``, full scale 1.0) as ``kind`` with ``tags``; atomic."""
    av = require("av")
    import numpy as np

    if kind not in FORMATS:
        raise PlenioUserError(f"Unknown export format {kind!r}; use one of {sorted(FORMATS)}.")
    spec = FORMATS[kind]
    data = np.asarray(samples, dtype=np.float64)
    if data.ndim != 2 or data.shape[0] not in (1, 2) or data.shape[1] == 0:
        raise PlenioUserError(
            f"Expected mono or stereo audio as [channels, frames], got shape {tuple(data.shape)}."
        )
    peak = float(np.max(np.abs(data)))
    clipped = int(np.count_nonzero(np.abs(data) > 1.0)) if kind != "wav" else 0
    layout = "mono" if data.shape[0] == 1 else "stereo"
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".part")
    container = av.open(str(partial), mode="w", format=spec["container"])
    try:
        for key, value in (tags or {}).items():
            if key in TAG_FIELDS and str(value).strip():
                container.metadata[key] = str(value).strip()
        stream = container.add_stream(
            spec["codec"], rate=sample_rate, layout=layout, options=dict(spec["options"])
        )
        stream.codec_context.format = spec["sample_format"]
        block = 1 << 16
        for start in range(0, data.shape[1], block):
            chunk = _frames(data[:, start : start + block], spec["sample_format"])
            frame = av.AudioFrame.from_ndarray(chunk, format=spec["sample_format"], layout=layout)
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
        "format": kind,
        "bits": spec["bits"],
        "sample_rate": sample_rate,
        "channels": int(data.shape[0]),
        "seconds": round(data.shape[1] / sample_rate, 3),
        "peak": round(peak, 4),
        "clipped_samples": clipped,
    }


def write_flac(path: Path, samples: Any, sample_rate: int) -> dict[str, Any]:
    """Encode ``samples`` (float array ``[channels, frames]`` in -1..1) as 24-bit FLAC."""
    return write_audio(path, samples, sample_rate, "flac")


def read_tags(path: Path) -> tuple[dict[str, str], bytes | None]:
    """Tags (generic names) and embedded cover image bytes of an audio file (PyAV; no extra package)."""
    av = require("av")
    tags: dict[str, str] = {}
    cover: bytes | None = None
    with av.open(str(path)) as container:
        found = {
            **dict(container.metadata),
            **(dict(container.streams.audio[0].metadata) if container.streams.audio else {}),
        }
        lowered = {k.lower(): v for k, v in found.items()}
        aliases = {
            "album_artist": ("album_artist", "albumartist", "album artist"),
            "track": ("track", "tracknumber"),
        }
        for field in TAG_FIELDS:
            for key in aliases.get(field, (field,)):
                if lowered.get(key):
                    tags[field] = str(lowered[key])
                    break
        for stream in container.streams.video:
            if stream.disposition & av.stream.Disposition.attached_pic:
                for packet in container.demux(stream):
                    if packet.size:
                        cover = bytes(packet)
                        break
                break
    return tags, cover


def cover_jpeg(image: Any, size: int = 1400) -> bytes:
    """A square JPEG (at most ``size`` pixels) of an RGB image array ``[height, width, 3]`` in 0..1."""
    import io

    import numpy as np

    pil = require("PIL.Image")
    data = np.clip(np.asarray(image, dtype=np.float32) * 255.0 + 0.5, 0, 255).astype(np.uint8)
    picture = pil.fromarray(data[..., :3])
    side = min(picture.size)
    left, top = (picture.width - side) // 2, (picture.height - side) // 2
    picture = picture.crop((left, top, left + side, top + side))
    if side > size:
        picture = picture.resize((size, size), pil.Resampling.LANCZOS)
    buffer = io.BytesIO()
    picture.convert("RGB").save(buffer, format="JPEG", quality=92)
    return buffer.getvalue()


def embed_cover(path: Path, jpeg: bytes) -> bool:
    """Embed ``jpeg`` as front cover (FLAC picture, MP3 APIC) with mutagen if it is installed.

    mutagen is GPL-2.0-or-later and not bundled; without it the cover is only written next to the audio.
    """
    import importlib

    try:  # mutagen has no type information; it is used through Any
        flac: Any = importlib.import_module("mutagen.flac")
        id3: Any = importlib.import_module("mutagen.id3")
    except ImportError:
        return False
    if path.suffix == ".flac":
        audio = flac.FLAC(str(path))
        picture = flac.Picture()
        picture.type, picture.mime, picture.desc, picture.data = 3, "image/jpeg", "Cover", jpeg
        audio.clear_pictures()
        audio.add_picture(picture)
        audio.save()
        return True
    if path.suffix == ".mp3":
        try:
            tags = id3.ID3(str(path))
        except id3.ID3NoHeaderError:
            tags = id3.ID3()
        tags.delall("APIC")
        tags.add(id3.APIC(encoding=3, mime="image/jpeg", type=3, desc="Cover", data=jpeg))
        tags.save(str(path))
        return True
    return False


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


MODEL_LICENCES = {
    "sheetsage2_bf16.safetensors": "CC BY-NC 4.0 (SheetSage2, Comfy-Org/YuE2 repackaging): non-commercial use only",
    "ar_lora_inst_v3abc_comfyui.safetensors": "CC BY-NC 4.0 (YuE2 instrumental adapter): non-commercial use only",
}
"""Model files whose licence restricts the use of the result, by file name (model cards, 2026-09-25)."""


def workflow_licences(prompt: Mapping[str, Any] | None) -> set[str]:
    """Licences of the known model files the prompt references (loaders' file-name inputs)."""
    found: set[str] = set()
    for node in (prompt or {}).values():
        inputs = node.get("inputs", {}) if isinstance(node, Mapping) else {}
        for value in inputs.values() if isinstance(inputs, Mapping) else ():
            if isinstance(value, str):
                licence = MODEL_LICENCES.get(value.replace("\\", "/").rsplit("/", 1)[-1].lower())
                if licence:
                    found.add(licence)
    return found


PROMPT_NODE_KEYS = ("class_type", "inputs", "_meta")
"""What a release record keeps of each prompt node. ComfyUI also writes run-time fields into the
prompt (``is_changed`` fingerprints - NaN for native loop nodes - and loop bookkeeping)."""


def prompt_for_record(prompt: Mapping[str, Any]) -> dict[str, Any]:
    """The API prompt as submitted: per node only its class, inputs and title; secrets redacted."""
    nodes = {
        str(node_id): {key: node[key] for key in PROMPT_NODE_KEYS if key in node}
        for node_id, node in prompt.items()
        if isinstance(node, Mapping)
    }
    return dict(redact(nodes))


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
        "prompt": prompt_for_record(data.prompt) if data.prompt else None,
    }
    record["fingerprint"] = sha256_text(canonical_json({k: v for k, v in record.items() if k != "created"}))
    return record
