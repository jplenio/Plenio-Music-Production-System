"""E2q: Qwen3-ASR-1.7B (+ Qwen3-ForcedAligner-0.6B for word times) on the Phase 4A corpus.

Candidate second engine for Transcribe Lyrics (Phase 4B). It needs transformers >= 5.13, newer than
ComfyUI's, so it runs in an isolated package folder (AS-11): start this script with that folder
first on ``PYTHONPATH``; torch, numpy and PyAV come from ComfyUI's environment.

Output has the format of ``asr_whisper.py`` (``<stem>.qwen3-asr-1.7b.asr.json`` with ``runs``), so
``alignment.py`` scores the section placement of both engines the same way. Configurations:

``full``     the whole file in one request, word times from the forced aligner
``regions``  each vocal region of the Whisper ``regions`` run (``--regions`` = its E2 folder)
             transcribed and aligned separately, times shifted back to the file

Usage:
  PYTHONPATH=<qwen package folder> <comfy python> tools/studies/asr_qwen3.py \
      --asr <Qwen3-ASR-1.7B-hf dir> --aligner <Qwen3-ForcedAligner-0.6B-hf dir> \
      --out <dir> [--regions <e2 dir>] [--config full] [--config regions] <audio>...
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path
from typing import Any

from _common import read_json, wer, write_json
from asr_whisper import reference_for

MODEL = "qwen3-asr-1.7b"
RATE = 16000
ALIGNER_MAX_S = 300.0


def decode(path: Path) -> Any:
    """16 kHz mono float32 (PyAV, as ComfyUI's LoadAudio decodes)."""
    import av
    import numpy as np

    chunks = []
    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="flt", layout="mono", rate=RATE)
        for frame in container.decode(stream):
            chunks.extend(f.to_ndarray().reshape(-1) for f in resampler.resample(frame))
        chunks.extend(f.to_ndarray().reshape(-1) for f in resampler.resample(None))
    return np.concatenate(chunks).astype("float32")


class Qwen3:
    def __init__(self, asr_dir: Path, aligner_dir: Path):
        import torch
        import transformers
        from transformers import AutoModelForMultimodalLM, AutoModelForTokenClassification, AutoProcessor

        self.torch = torch
        self.versions = {"transformers": transformers.__version__, "torch": torch.__version__}
        started = time.perf_counter()
        self.processor = AutoProcessor.from_pretrained(asr_dir)
        self.model = AutoModelForMultimodalLM.from_pretrained(
            asr_dir, dtype=torch.bfloat16, device_map="cuda"
        )
        self.aligner_processor = AutoProcessor.from_pretrained(aligner_dir)
        self.aligner = AutoModelForTokenClassification.from_pretrained(
            aligner_dir, dtype=torch.bfloat16, device_map="cuda"
        )
        self.load_seconds = time.perf_counter() - started

    def transcribe(self, samples: Any) -> dict[str, Any]:
        inputs = self.processor.apply_transcription_request(audio=samples).to(
            self.model.device, self.model.dtype
        )
        with self.torch.inference_mode():
            output = self.model.generate(**inputs, max_new_tokens=1024, do_sample=False)
        generated = output[:, inputs["input_ids"].shape[1] :]
        parsed = self.processor.decode(generated, return_format="parsed")[0]
        return {"language": parsed.get("language") or "", "text": parsed.get("transcription") or ""}

    def align(self, samples: Any, text: str, language: str) -> list[dict[str, Any]]:
        if not text.strip():
            return []
        inputs, word_lists = self.aligner_processor.prepare_forced_aligner_inputs(
            audio=samples, transcript=text, language=language or "English"
        )
        inputs = inputs.to(self.aligner.device, self.aligner.dtype)
        with self.torch.inference_mode():
            logits = self.aligner(**inputs).logits
        items = self.aligner_processor.decode_forced_alignment(
            logits=logits,
            input_ids=inputs["input_ids"],
            word_lists=word_lists,
            timestamp_token_id=self.aligner.config.timestamp_token_id,
        )[0]
        return [
            {"start": float(i["start_time"]), "end": float(i["end_time"]), "word": str(i["text"]), "p": 1.0}
            for i in items
        ]


def run(engine: Qwen3, samples: Any, spans: list[tuple[float, float]]) -> dict[str, Any]:
    import torch

    torch.cuda.reset_peak_memory_stats()
    started = time.perf_counter()
    texts, words_out, languages = [], [], []
    for segment, (start, end) in enumerate(spans):
        piece = samples[int(start * RATE) : int(end * RATE)]
        heard = engine.transcribe(piece)
        texts.append(heard["text"])
        languages.append(heard["language"])
        piece_for_aligner = piece[: int(ALIGNER_MAX_S * RATE)]
        for word in engine.align(piece_for_aligner, heard["text"], heard["language"]):
            words_out.append(
                {**word, "start": word["start"] + start, "end": word["end"] + start, "segment": segment}
            )
    return {
        "language": max(set(languages), key=languages.count) if languages else "",
        "language_probability": 0.0,
        "seconds": round(time.perf_counter() - started, 2),
        "peak_vram_gib": round(torch.cuda.max_memory_allocated() / 2**30, 2),
        "text": " ".join(t for t in texts if t).strip(),
        "segments": [{"text": t, "start": a, "end": b} for t, (a, b) in zip(texts, spans, strict=True)],
        "words": words_out,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--asr", required=True, type=Path)
    parser.add_argument("--aligner", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--regions", type=Path, help="E2 folder of the Whisper regions run (for 'regions')")
    parser.add_argument("--config", action="append", choices=["full", "regions"])
    parser.add_argument("audio", nargs="+", type=Path)
    args = parser.parse_args()
    configs = args.config or ["full"]
    engine = Qwen3(args.asr, args.aligner)
    print(f"loaded in {engine.load_seconds:.1f} s ({engine.versions})")
    for path in args.audio:
        samples = decode(path)
        duration = len(samples) / RATE
        reference = reference_for(path)
        result: dict[str, Any] = {
            "file": path.name,
            "model": MODEL,
            "versions": engine.versions,
            "audio_seconds": round(duration, 2),
            "reference": reference,
            "runs": {},
        }
        for config in configs:
            if config == "full":
                spans = [(0.0, duration)]
            else:
                whisper = args.regions / f"{path.stem}.whisper-large-v3.asr.json" if args.regions else None
                flat = read_json(whisper).get("regions") if whisper and whisper.exists() else None
                if not flat:
                    result["runs"][config] = {"skipped": "no vocal regions", "words": [], "text": ""}
                    continue
                spans = [(float(a), float(b)) for a, b in zip(flat[::2], flat[1::2], strict=True)]
                result["regions"] = flat
            outcome = run(engine, samples, spans)
            outcome["wer"] = wer(reference or "", outcome["text"]) if reference else None
            result["runs"][config] = outcome
            score = outcome["wer"]["wer"] if outcome["wer"] else None
            print(
                f"{path.name} [{config}]: {len(outcome['words'])} words, {outcome['language']}, "
                f"WER {score}, {outcome['seconds']} s, peak {outcome['peak_vram_gib']} GiB"
            )
        write_json(args.out / f"{path.stem}.{MODEL}.asr.json", result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
