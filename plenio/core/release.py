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
from .files import atomic_write_bytes
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
    # whole words of the key only: 'max_abc_tokens' and 'author' are settings, not secrets (AUD-07)
    r"(?i)(?:^|[_\-.\s])(api[_-]?key|token|secret|password|passwd|authorization|auth|credentials?|cookie)(?:$|[_\-.\s])"
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


def plan_release(folder: Path, relative: str, suffixes: Sequence[str], *, collision: str = "number") -> Path:
    """The base path (without extension) of a release whose files are ``base.name + suffix``.

    All files of one export share one base name: with ``number`` the base gets `` (2)``, `` (3)``...
    until *none* of its files exists, so no file of an earlier export - its record or cover
    included - is overwritten and the files of one export never end up with different numbers
    (audit AUD-04). ``overwrite`` replaces; ``error`` refuses when any of the files exists.
    """
    parts = [safe_filename(part) for part in re.split(r"[\\/]+", relative) if part.strip()]
    if not parts:
        raise PlenioUserError("The file name pattern produced an empty name.")
    base = folder.joinpath(*parts)
    if folder.resolve() not in base.resolve().parents:
        raise PlenioUserError(f"The file name {relative!r} leaves the output folder.")

    def taken(candidate: Path) -> list[Path]:
        return [p for p in (candidate.with_name(candidate.name + s) for s in suffixes) if p.exists()]

    if collision == "overwrite" or not taken(base):
        return base
    if collision == "error":
        raise PlenioUserError(
            f"{taken(base)[0].name} already exists.",
            hint="Change the naming pattern or the collision policy.",
        )
    for number in range(2, 10000):
        candidate = base.with_name(f"{parts[-1]} ({number})")
        if not taken(candidate):
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
MP3_RATES = (8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000)
"""The sample rates MPEG audio (LAME) can encode; other rates are converted for MP3 only (AUD-03)."""
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


def mp3_rate(sample_rate: int) -> int:
    """The rate an MP3 of ``sample_rate`` audio is written at (the same rate when LAME supports it)."""
    if sample_rate in MP3_RATES:
        return sample_rate
    if sample_rate > MP3_RATES[-1]:
        return 44100 if sample_rate % 44100 == 0 else 48000
    return next(rate for rate in MP3_RATES if rate >= sample_rate)


def write_audio(
    path: Path, samples: Any, sample_rate: int, kind: str = "flac", tags: Mapping[str, str] | None = None
) -> dict[str, Any]:
    """Encode ``samples`` (float ``[channels, frames]``, full scale 1.0) as ``kind`` with ``tags``; atomic.

    MP3 at a rate LAME cannot encode (for example 96 kHz) is converted to the nearest MP3 rate first;
    the facts say so.
    """
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
    if not np.all(np.isfinite(data)):
        raise PlenioUserError(
            "The audio contains NaN or infinite samples and cannot be exported.",
            hint="The render or a processing step failed numerically; render the take again.",
        )
    source_rate = int(sample_rate)
    if kind == "mp3" and mp3_rate(source_rate) != source_rate:
        from .audio.resample import resample

        sample_rate = mp3_rate(source_rate)
        data = resample(data, source_rate, sample_rate)
    peak = float(np.max(np.abs(data)))
    clipped = int(np.count_nonzero(np.abs(data) > 1.0)) if kind != "wav" else 0
    layout = "mono" if data.shape[0] == 1 else "stereo"
    path.parent.mkdir(parents=True, exist_ok=True)
    partial = path.with_name(path.name + ".part")
    container = av.open(str(partial), mode="w", format=spec["container"])
    completed = False
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
        completed = True
    finally:
        container.close()
        if not completed:
            partial.unlink(missing_ok=True)  # no half-written file is left behind
    partial.replace(path)
    facts: dict[str, Any] = {
        "format": kind,
        "bits": spec["bits"],
        "sample_rate": sample_rate,
        "channels": int(data.shape[0]),
        "seconds": round(data.shape[1] / sample_rate, 3),
        "peak": round(peak, 4),
        "clipped_samples": clipped,
    }
    if sample_rate != source_rate:
        facts["converted_from_rate"] = source_rate
    return facts


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
    """Embed ``jpeg`` as the front cover of a FLAC (PICTURE block) or MP3 (ID3v2 APIC frame); atomic.

    Written by Plenio itself (no extra package). Returns False for formats without cover art (WAV).
    """
    if path.suffix.lower() == ".flac":
        data = _flac_with_picture(path.read_bytes(), jpeg)
    elif path.suffix.lower() == ".mp3":
        data = _mp3_with_picture(path.read_bytes(), jpeg)
    else:
        return False
    atomic_write_bytes(path, data)
    return True


def _jpeg_size(jpeg: bytes) -> tuple[int, int]:
    """Width and height from the JPEG's start-of-frame marker (0, 0 when it has none)."""
    index = 2
    while index + 9 < len(jpeg):
        if jpeg[index] != 0xFF:
            index += 1
            continue
        marker = jpeg[index + 1]
        length = int.from_bytes(jpeg[index + 2 : index + 4], "big")
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            height = int.from_bytes(jpeg[index + 5 : index + 7], "big")
            width = int.from_bytes(jpeg[index + 7 : index + 9], "big")
            return width, height
        index += 2 + length
    return 0, 0


def _flac_with_picture(flac: bytes, jpeg: bytes) -> bytes:
    """The FLAC stream with its PICTURE blocks replaced by one front cover (FLAC format, METADATA_BLOCK_PICTURE)."""
    if flac[:4] != b"fLaC":
        raise PlenioUserError("Not a FLAC file: the cover cannot be embedded.")
    blocks: list[tuple[int, bytes]] = []
    index = 4
    while True:
        header = flac[index]
        kind, length = header & 0x7F, int.from_bytes(flac[index + 1 : index + 4], "big")
        if kind != 6:  # 6 = PICTURE: replaced below
            blocks.append((kind, flac[index + 4 : index + 4 + length]))
        index += 4 + length
        if header & 0x80:
            break
    width, height = _jpeg_size(jpeg)
    mime, description = b"image/jpeg", b"Cover"
    picture = b"".join(
        [
            (3).to_bytes(4, "big"),  # front cover
            len(mime).to_bytes(4, "big"),
            mime,
            len(description).to_bytes(4, "big"),
            description,
            width.to_bytes(4, "big"),
            height.to_bytes(4, "big"),
            (24).to_bytes(4, "big"),  # colour depth
            (0).to_bytes(4, "big"),  # not an indexed-colour image
            len(jpeg).to_bytes(4, "big"),
            jpeg,
        ]
    )
    if len(picture) >= 1 << 24:
        raise PlenioUserError("The cover image is too large to embed (16 MB limit of a FLAC block).")
    streaminfo, others = blocks[:1], blocks[1:]
    ordered = [*streaminfo, (6, picture), *others]
    out = [b"fLaC"]
    for position, (kind, body) in enumerate(ordered):
        last = 0x80 if position == len(ordered) - 1 else 0
        out.append(bytes([last | kind]) + len(body).to_bytes(3, "big") + body)
    out.append(flac[index:])
    return b"".join(out)


def _syncsafe(value: int) -> bytes:
    return bytes([(value >> 21) & 0x7F, (value >> 14) & 0x7F, (value >> 7) & 0x7F, value & 0x7F])


def _unsyncsafe(data: bytes) -> int:
    return (data[0] << 21) | (data[1] << 14) | (data[2] << 7) | data[3]


def _mp3_with_picture(mp3: bytes, jpeg: bytes) -> bytes:
    """The MP3 with an ID3v2 tag whose APIC frames are replaced by one front cover.

    Keeps the frames of an existing ID3v2.3/2.4 tag (ffmpeg writes 2.4); a tag with unsynchronisation
    or an extended header is replaced by a new 2.4 tag with the cover only.
    """
    frames: list[bytes] = []
    major, audio = 4, mp3
    if mp3[:3] == b"ID3" and mp3[3] in (3, 4) and not mp3[5] & 0xC0:
        major = mp3[3]
        size = _unsyncsafe(mp3[6:10])
        tag, audio = mp3[10 : 10 + size], mp3[10 + size + (10 if mp3[5] & 0x10 else 0) :]
        index = 0
        while index + 10 <= len(tag) and tag[index] != 0:
            frame_id = tag[index : index + 4]
            length = (
                _unsyncsafe(tag[index + 4 : index + 8])
                if major == 4
                else int.from_bytes(tag[index + 4 : index + 8], "big")
            )
            if frame_id != b"APIC":
                frames.append(tag[index : index + 10 + length])
            index += 10 + length
    elif mp3[:3] == b"ID3":
        size = _unsyncsafe(mp3[6:10])
        audio = mp3[10 + size + (10 if mp3[5] & 0x10 else 0) :]
    encoding = 3 if major == 4 else 0  # UTF-8 in ID3v2.4, ISO-8859-1 in 2.3 (the description is ASCII)
    body = bytes([encoding]) + b"image/jpeg\x00" + bytes([3]) + b"Cover\x00" + jpeg
    frame_size = _syncsafe(len(body)) if major == 4 else len(body).to_bytes(4, "big")
    frames.append(b"APIC" + frame_size + b"\x00\x00" + body)
    content = b"".join(frames)
    return b"ID3" + bytes([major, 0, 0]) + _syncsafe(len(content)) + content + audio


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
                if isinstance(k, str) and isinstance(v, str) and v and _SECRET_KEY.search(k)
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
