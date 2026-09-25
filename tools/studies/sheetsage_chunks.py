"""E3/Q-C6: SheetSage2 memory per audio length, and chunked re-transcription of long takes.

The native encoder pads every window to 300 s, and audio longer than 300 s needs a second native
window, which ran out of memory on a 16 GB card (E3). ``--memory`` transcribes the first N seconds
of one file for several N and records the peak CUDA memory and time.

Otherwise: every file is transcribed in consecutive chunks of at most ``--chunk-seconds``
(native path per chunk, as in ``sheetsage_timeline.py``); a file that fits in one chunk gets the
complete ABC and analysis, longer files only the vocal-note detector data. The output has the
fields ``evaluate_takes.py`` reads.

Usage:
  <comfy python> tools/studies/sheetsage_chunks.py --models F:/ComfyUI/models --out <dir> [--chunk-seconds 120] <audio>...
  <comfy python> tools/studies/sheetsage_chunks.py --models F:/ComfyUI/models --out <dir> <audio> --memory 60 120 180 240
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path
from typing import Any

from _common import import_comfy, load_audio, write_json

from plenio.core.score import native


def _vocal(events: list[dict[str, Any]], duration: float, offset: float) -> list[list[float]]:
    notes = []
    for event in events:
        for note in event["values"].get("melody", ()):
            end = min(duration, note["end_time"])
            if note["track"] == 0 and end > event["time"]:
                notes.append([round(event["time"] + offset, 3), round(end + offset, 3), note["pitch"]])
    return notes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--models", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--chunk-seconds", type=float, default=120.0)
    parser.add_argument("--memory", nargs="*", type=float)
    parser.add_argument("audio", nargs="+", type=Path)
    args = parser.parse_args()
    import_comfy()
    import comfy.model_management as mm
    import comfy.model_patcher  # noqa: F401
    import comfy.utils
    import torch
    import torchaudio
    from comfy.audio_encoders import sheetsage2_abc as ss
    from comfy.audio_encoders.audio_encoders import load_audio_encoder_from_sd

    sd = comfy.utils.load_torch_file(
        str(args.models / "audio_encoders" / "sheetsage2_bf16.safetensors"), safe_load=True
    )
    encoder = load_audio_encoder_from_sd(sd)
    rate_out = encoder.model_sample_rate

    def transcribe(mono: Any) -> tuple[list[dict[str, Any]], float, float, float]:
        mm.load_model_gpu(encoder.patcher)
        torch.cuda.synchronize()
        torch.cuda.reset_peak_memory_stats()
        started = time.perf_counter()
        events = encoder.model.transcribe(mono[None].to(encoder.load_device))
        torch.cuda.synchronize()
        return (
            events,
            time.perf_counter() - started,
            torch.cuda.max_memory_allocated() / 2**30,
            mono.shape[-1] / rate_out,
        )

    if args.memory:
        path = args.audio[0]
        waveform, rate = load_audio(path)
        mono_all = torchaudio.functional.resample(waveform.unsqueeze(0).float().mean(dim=1), rate, rate_out)[
            0
        ]
        rows = []
        for seconds in args.memory:
            mono = mono_all[: int(seconds * rate_out)]
            try:
                _, elapsed, peak, length = transcribe(mono)
                rows.append(
                    {
                        "seconds": round(length, 1),
                        "peak_gib": round(peak, 2),
                        "time_s": round(elapsed, 1),
                        "ok": True,
                    }
                )
            except torch.OutOfMemoryError:
                rows.append({"seconds": seconds, "ok": False, "error": "CUDA out of memory"})
                torch.cuda.empty_cache()
            print(rows[-1])
            torch.cuda.empty_cache()
        write_json(
            args.out / "sheetsage-memory.json",
            {
                "file": path.name,
                "vram_gib": round(torch.cuda.get_device_properties(0).total_memory / 2**30, 1),
                "runs": rows,
            },
        )
        return 0

    for path in args.audio:
        waveform, rate = load_audio(path)
        mono_all = torchaudio.functional.resample(waveform.unsqueeze(0).float().mean(dim=1), rate, rate_out)[
            0
        ]
        total = mono_all.shape[-1] / rate_out
        step = int(args.chunk_seconds * rate_out)
        vocal, chunks, abc = [], [], ""
        for start in range(0, mono_all.shape[-1], step):
            mono = mono_all[start : start + step]
            if mono.shape[-1] < rate_out * 5:
                continue
            events, elapsed, peak, length = transcribe(mono)
            offset = start / rate_out
            vocal.extend(_vocal(events, length, offset))
            chunks.append(
                {
                    "start_s": round(offset, 1),
                    "seconds": round(length, 1),
                    "time_s": round(elapsed, 1),
                    "peak_gib": round(peak, 2),
                }
            )
            if step >= mono_all.shape[-1]:
                abc = ss.events_to_abc(events, length, melody_only=False)
            torch.cuda.empty_cache()
        analysis = native.analyze(abc) if abc else None
        result = {
            "file": path.name,
            "audio_seconds": round(total, 2),
            "chunked": len(chunks) > 1,
            "chunks": chunks,
            "abc": abc,
            "transcription": {
                "header": analysis.header if analysis else {},
                "sections": [[s.label, s.start_bar, s.bars] for s in analysis.sections] if analysis else [],
                "voices": {"Vocal": {"notes": len(vocal)}},
                "bars": len(analysis.bars) if analysis else None,
            },
            "events": {"vocal_notes": vocal},
        }
        write_json(args.out / f"{path.stem}.sheetsage.json", result)
        print(
            f"{path.name}: {total:.1f} s in {len(chunks)} chunk(s), vocal notes {len(vocal)}, peak {max(c['peak_gib'] for c in chunks):.2f} GiB"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
