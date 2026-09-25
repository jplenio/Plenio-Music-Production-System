"""Lyrics ASR worker: faster-whisper with word timestamps (run as ``python -m plenio.workers.asr``).

Request (``request.json``)::

    {"engine": "faster-whisper-large-v3", "model_dir": "...", "audio": "<file>.npy" (16 kHz mono float32),
     "language": "" | "en" | ..., "beam_size": 5, "seed": 0, "regions": [[start, end], ...],
     "device": "auto" | "cuda" | "cpu"}

Result: a ``plenio.asr/1`` object (see ``plenio.core.asr``).

Settings measured in Phase 4A: VAD off (the Silero VAD removes singing over music), transcribing
only the vocal regions (no invented words in instrumental parts), faster-whisper's default
temperature fallback with a fixed CTranslate2 seed.
"""

from __future__ import annotations

import importlib.util
import os
import time
from pathlib import Path
from typing import Any

from ..core.asr import ASR_SCHEMA
from ..core.errors import PlenioDependencyError, PlenioModelError
from ..core.workers.runtime import Job, serve


def _add_cuda_dll_folders() -> list[str]:
    """CTranslate2 4.x on Windows needs the CUDA 12 cuBLAS (nvidia-cublas-cu12) and cuDNN 9 (next to torch)."""
    if not hasattr(os, "add_dll_directory"):
        return []
    added = []
    candidates: list[Path] = []
    nvidia = importlib.util.find_spec("nvidia")
    if nvidia is not None and nvidia.submodule_search_locations:
        candidates += [Path(p) / "cublas" / "bin" for p in nvidia.submodule_search_locations]
    torch_spec = importlib.util.find_spec("torch")
    if torch_spec is not None and torch_spec.origin:
        candidates.append(Path(torch_spec.origin).parent / "lib")
    for folder in candidates:
        if folder.is_dir():
            os.add_dll_directory(str(folder))
            os.environ["PATH"] = str(folder) + os.pathsep + os.environ.get("PATH", "")
            added.append(str(folder))
    return added


def _model_class() -> Any:
    try:
        from faster_whisper import WhisperModel
    except ModuleNotFoundError as error:
        raise PlenioDependencyError(
            "faster-whisper",
            feature="Transcribe Lyrics (faster-whisper large-v3)",
            install="python -m pip install faster-whisper",
        ) from error
    return WhisperModel


def _transcribe(
    job: Job, model: Any, audio: Any, options: dict[str, Any], duration: float
) -> tuple[Any, list, list]:
    segments, info = model.transcribe(audio, **options)
    rows: list[dict[str, Any]] = []
    words: list[dict[str, Any]] = []
    for segment in segments:
        rows.append(
            {
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
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
        job.progress(min(0.99, 0.05 + 0.94 * segment.end / duration), f"{len(words)} words")
    return info, rows, words


def handle(job: Job) -> dict[str, Any]:
    import ctranslate2
    import numpy as np

    request = job.request
    started = time.perf_counter()
    job.progress(0.0, "loading the ASR model")
    dll_folders = _add_cuda_dll_folders()
    whisper_model = _model_class()
    audio = np.load(str(request["audio"])).astype("float32")
    duration = max(len(audio) / 16000.0, 1e-6)
    regions = [(float(a), float(b)) for a, b in request.get("regions", [])]
    options: dict[str, Any] = {
        "language": request.get("language") or None,
        "vad_filter": False,
        "word_timestamps": True,
        "beam_size": int(request.get("beam_size", 5)),
        "condition_on_previous_text": False,
    }
    if regions:
        options["clip_timestamps"] = [value for span in regions for value in span]
    requested = str(request.get("device", "auto"))
    device_note = ""
    attempts = ["cuda", "cpu"] if requested == "auto" else [requested]
    for device in attempts:
        try:
            ctranslate2.set_random_seed(int(request.get("seed", 0)))
            model = whisper_model(
                str(request["model_dir"]),
                device=device,
                compute_type="float16" if device == "cuda" else "int8",
            )
            job.progress(0.05, f"transcribing on {device}")
            info, rows, words = _transcribe(job, model, audio, options, duration)
            break
        except (RuntimeError, ValueError, OSError) as error:
            if device == attempts[-1]:
                raise PlenioModelError(
                    f"faster-whisper failed on {device}: {error}",
                    hint="Choose device 'cpu', or install the CUDA 12 cuBLAS for CTranslate2 "
                    "(python -m pip install nvidia-cublas-cu12).",
                ) from error
            device_note = f"GPU not usable ({error}); ran on the CPU (int8, about 0.6 x the audio length)"
    return {
        "schema": ASR_SCHEMA,
        "engine": str(request.get("engine", "faster-whisper-large-v3")),
        "model": Path(str(request["model_dir"])).name,
        "language": info.language,
        "language_probability": float(info.language_probability),
        "device": device,
        "seconds": round(time.perf_counter() - started, 2),
        "settings": {
            "vad_filter": False,
            "beam_size": options["beam_size"],
            "seed": int(request.get("seed", 0)),
            "regions": [[round(a, 2), round(b, 2)] for a, b in regions],
            "device_note": device_note,
            "dll_folders": len(dll_folders),
        },
        "segments": rows,
        "words": words,
    }


if __name__ == "__main__":
    raise SystemExit(serve(handle))
