"""E2: faster-whisper transcription of sung audio: WER against known lyrics and word timestamps.

The reference lyrics come from a Plenio release record next to the audio (``<stem>.plenio.json``)
or from ``<stem>.lyrics.txt``. Each file is transcribed once per configuration; results (words
with times and probabilities, WER, language, run time) are written as JSON.

Usage:
  <comfy python> tools/studies/asr_whisper.py --model <ct2 model dir> --out <dir> [--config NAME]... <audio>...
"""

from __future__ import annotations

import argparse
import os
import time
from pathlib import Path
from typing import Any

from _common import comfy_root, read_json, wer, write_json

CONFIGS: dict[str, dict[str, Any]] = {
    "auto": {"language": None, "vad_filter": False},
    "auto_vad": {"language": None, "vad_filter": True},
    "en": {"language": "en", "vad_filter": False},
    "en_vad": {"language": "en", "vad_filter": True},
    # the settings Plenio's Transcribe Lyrics uses (deterministic: no temperature fallback)
    "plenio": {"language": None, "vad_filter": False, "temperature": 0.0},
    "plenio_en": {"language": "en", "vad_filter": False, "temperature": 0.0},
}


def reference_for(path: Path) -> str | None:
    record = path.with_suffix(".plenio.json")
    if record.exists():
        return str(read_json(record)["documents"]["lyrics"]["text"])
    text = path.with_suffix(".lyrics.txt")
    return text.read_text(encoding="utf-8") if text.exists() else None


def transcribe(model: Any, path: Path, config: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    segments, info = model.transcribe(
        str(path),
        language=config["language"],
        vad_filter=config["vad_filter"],
        word_timestamps=True,
        beam_size=5,
        condition_on_previous_text=False,
        **({"temperature": config["temperature"]} if "temperature" in config else {}),
    )
    rows, words = [], []
    for segment in segments:
        rows.append(
            {
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
                "no_speech_prob": round(segment.no_speech_prob, 3),
                "avg_logprob": round(segment.avg_logprob, 3),
            }
        )
        for word in segment.words or ():
            words.append(
                {
                    "start": round(word.start, 3),
                    "end": round(word.end, 3),
                    "word": word.word.strip(),
                    "p": round(word.probability, 3),
                    "segment": len(rows) - 1,
                }
            )
    return {
        "language": info.language,
        "language_probability": round(info.language_probability, 3),
        "seconds": round(time.perf_counter() - started, 2),
        "text": " ".join(r["text"] for r in rows),
        "segments": rows,
        "words": words,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--model", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--config", action="append", choices=sorted(CONFIGS))
    parser.add_argument("--device", default="cuda")
    parser.add_argument("--compute-type", default="float16")
    parser.add_argument("audio", nargs="+", type=Path)
    args = parser.parse_args()
    # CTranslate2 4.x needs the CUDA 12 cuBLAS (nvidia-cublas-cu12 wheel) and cuDNN 9 (next to torch).
    site = comfy_root() / ".venv" / "Lib" / "site-packages"
    for folder in (site / "nvidia" / "cublas" / "bin", site / "torch" / "lib"):
        if folder.is_dir() and hasattr(os, "add_dll_directory"):
            os.add_dll_directory(str(folder))
            os.environ["PATH"] = str(folder) + os.pathsep + os.environ.get("PATH", "")
    from faster_whisper import WhisperModel

    started = time.perf_counter()
    model = WhisperModel(str(args.model), device=args.device, compute_type=args.compute_type)
    print(f"model loaded in {time.perf_counter() - started:.1f} s ({args.device}, {args.compute_type})")
    for path in args.audio:
        reference = reference_for(path)
        result: dict[str, Any] = {
            "file": path.name,
            "model": args.model.name,
            "reference": reference,
            "runs": {},
        }
        for name in args.config or ["auto", "auto_vad"]:
            run = transcribe(model, path, CONFIGS[name])
            run["wer"] = wer(reference, run["text"]) if reference else None
            result["runs"][name] = run
            score = run["wer"]["wer"] if run["wer"] else "-"
            print(
                f"{path.name} [{name}]: {run['seconds']} s, lang {run['language']} ({run['language_probability']}), "
                f"words {len(run['words'])}, WER {score}"
            )
        write_json(args.out / f"{path.stem}.{args.model.name}.asr.json", result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
