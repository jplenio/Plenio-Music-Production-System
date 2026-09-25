"""E1: SheetSage2 transcription facts, including the beat grid the native node does not expose.

Runs the native SheetSage2 encoder directly, along the same path as ``SheetSage2AudioToABC``
(mono downmix, resample, ``model.transcribe``, ``events_to_abc``), and additionally keeps the
decoded events: beat times, measures, note onsets, structure and key intervals. It then measures
how far a constant-tempo reading of the ABC drifts from the real bar times.

If a Plenio release record (``<stem>.plenio.json``) sits next to an audio file, the planned
score in it is compared with the transcription.

Usage:
  <comfy python> tools/studies/sheetsage_timeline.py --models F:/ComfyUI/models --out <dir> <audio>...
"""

from __future__ import annotations

import argparse
import statistics
import time
from fractions import Fraction
from pathlib import Path
from typing import Any

from _common import import_comfy, load_audio, read_json, write_json

from plenio.core.score import native


def _decoded_beats(events: list[dict[str, Any]], ss: Any) -> list[Any]:
    beats, meter = [], None
    for event in events:
        rhythm = event["values"].get("rhythm", {})
        meter = rhythm.get("meter", meter)
        eighth = rhythm.get("eighth_position")
        if eighth is not None and meter is not None:
            position = Fraction(eighth * meter[1], 8)
            beats.append(ss.BeatEvent(event["time"], int(position) + 1, meter[0], meter[1]))
    return beats


def _extended(beats: list[Any], duration: float, ss: Any) -> tuple[list[Any], float]:
    """The beat list exactly as ``events_to_abc`` extends it to the end of the audio."""
    period = float(statistics.median([b.time - a.time for a, b in zip(beats[-9:], beats[-8:], strict=False)]))
    beats = list(beats)
    while beats[-1].time < duration - 1e-6:
        previous = beats[-1]
        beats.append(
            ss.BeatEvent(
                previous.time + period,
                previous.beat_id % previous.declared_numerator + 1,
                previous.declared_numerator,
                previous.denominator,
            )
        )
    return beats, period


def _intervals(events: list[dict[str, Any]], field: str, duration: float) -> list[list[Any]]:
    rows = [[e["time"], duration, e["values"][field]] for e in events if field in e["values"]]
    for previous, current in zip(rows, rows[1:], strict=False):
        previous[1] = current[0]
    return [[round(a, 3), round(b, 3), str(v)] for a, b, v in rows if b > a]


def _onsets(events: list[dict[str, Any]], track: int, duration: float) -> list[list[float]]:
    """Note [onset, end, pitch] rows of one track (0 = Vocal, 1 = Ins, as in ``VOICE_IDS``)."""
    notes = []
    for event in events:
        for note in event["values"].get("melody", ()):
            if note["track"] == track and min(duration, note["end_time"]) > event["time"]:
                notes.append(
                    [round(event["time"], 3), round(min(duration, note["end_time"]), 3), note["pitch"]]
                )
    return sorted(notes)


def _summary(analysis: native.Analysis) -> dict[str, Any]:
    return {
        "ok": analysis.ok,
        "errors": [d.message for d in analysis.errors],
        "header": analysis.header,
        "bars": len(analysis.bars),
        "abc_seconds": round(analysis.duration_s, 2),
        "sections": [[s.label, s.start_bar, s.bars] for s in analysis.sections],
        "voices": analysis.voices,
        "has_chords": analysis.has_chords,
        "meters": sorted({b.meter for b in analysis.bars}),
        "keys": sorted({b.key for b in analysis.bars}),
    }


def study(path: Path, encoder: Any, ss: Any, mm: Any, torchaudio: Any) -> dict[str, Any]:
    started = time.perf_counter()
    waveform, rate = load_audio(path)
    audio = waveform.unsqueeze(0)
    mono = torchaudio.functional.resample(audio.float().mean(dim=1), rate, encoder.model_sample_rate)[0]
    mm.load_model_gpu(encoder.patcher)
    decode_start = time.perf_counter()
    events = encoder.model.transcribe(mono[None].to(encoder.load_device))
    duration = mono.shape[-1] / encoder.model_sample_rate
    abc = ss.events_to_abc(events, duration, melody_only=False)
    transcribe_s = time.perf_counter() - decode_start
    native_abc = encoder.generate_abc(audio, rate, melody_only=False)[0]

    decoded = _decoded_beats(events, ss)
    beats, period = _extended(decoded, duration, ss)
    measures, diagnostics = ss.infer_measures(beats)
    analysis = native.analyze(abc)
    bar_starts = [beats[m.start_beat].time for m in measures]
    first = measures[0]
    if first.pad_before and len(measures) > 1:
        # the leading partial bar is padded with a rest before the first decoded beat
        first_beats = first.end_beat - first.start_beat
        full = measures[1].end_beat - measures[1].start_beat
        local = (beats[first.end_beat].time - beats[first.start_beat].time) / max(first_beats, 1)
        bar_starts[0] = beats[first.start_beat].time - (full - first_beats) * local
    origin = bar_starts[0]
    drift = []
    for index, bar in enumerate(analysis.bars[: len(bar_starts)]):
        drift.append(round(bar_starts[index] - (origin + bar.start_s), 3))
    local_bpm = []
    for m in measures:
        seconds = beats[m.end_beat].time - beats[m.start_beat].time if m.end_beat < len(beats) else None
        count = m.end_beat - m.start_beat
        if seconds and count:
            local_bpm.append(round(60.0 * count / seconds * (4 / m.denominator), 2))
    result: dict[str, Any] = {
        "file": path.name,
        "audio_seconds": round(duration, 2),
        "transcribe_seconds": round(transcribe_s, 2),
        "total_seconds": round(time.perf_counter() - started, 2),
        "native_node_equal": abc == native_abc,
        "abc": abc,
        "transcription": _summary(analysis),
        "grid": {
            "first_beat_s": round(decoded[0].time, 3),
            "decoded_beats": len(decoded),
            "last_decoded_beat_s": round(decoded[-1].time, 3),
            "extended_beats": len(beats) - len(decoded),
            "tail_period_s": round(period, 4),
            "measures": len(measures),
            "abc_bars": len(analysis.bars),
            "bar0_start_s": round(origin, 3),
            "pickup_padded": bool(first.pad_before),
            "diagnostics": diagnostics[:20],
            "bar_starts_s": [round(t, 3) for t in bar_starts],
            "local_bpm": local_bpm,
            "local_bpm_range": [min(local_bpm), max(local_bpm)] if local_bpm else None,
            "constant_tempo_drift_s": {
                "per_bar": drift,
                "max_abs": max((abs(d) for d in drift), default=0.0),
                "end": drift[-1] if drift else 0.0,
            },
        },
        "events": {
            "vocal_notes": _onsets(events, 0, duration),
            "ins_notes_count": len(_onsets(events, 1, duration)),
            "structure": _intervals(events, "structure", duration),
            "key": _intervals(events, "key", duration),
            "tracks": sorted({n["track"] for e in events for n in e["values"].get("melody", ())}),
        },
    }
    record = path.with_suffix(".plenio.json")
    if record.exists():
        data = read_json(record)
        plan = data["documents"]["score"]["text"]
        result["plan"] = {"abc": plan, **_summary(native.analyze(plan))}
        result["plan"]["lyrics"] = data["documents"]["lyrics"]["text"]
        result["plan"]["style"] = data["documents"]["style"]["text"]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--models", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("audio", nargs="+", type=Path)
    args = parser.parse_args()
    import_comfy()
    import comfy.model_management as mm
    import comfy.model_patcher  # noqa: F401  (the encoder expects it imported)
    import comfy.utils
    import torchaudio
    from comfy.audio_encoders import sheetsage2_abc as ss
    from comfy.audio_encoders.audio_encoders import load_audio_encoder_from_sd

    started = time.perf_counter()
    sd = comfy.utils.load_torch_file(
        str(args.models / "audio_encoders" / "sheetsage2_bf16.safetensors"), safe_load=True
    )
    encoder = load_audio_encoder_from_sd(sd)
    print(f"SheetSage2 loaded in {time.perf_counter() - started:.1f} s")
    for path in args.audio:
        result = study(path, encoder, ss, mm, torchaudio)
        write_json(args.out / f"{path.stem}.sheetsage.json", result)
        grid, tr = result["grid"], result["transcription"]
        print(
            f"{path.name}: {result['audio_seconds']} s, transcribed in {result['transcribe_seconds']} s, "
            f"native equal {result['native_node_equal']}, Q {tr['header'].get('Q')}, K {tr['keys']}, M {tr['meters']}, "
            f"bars {tr['bars']} (abc {tr['abc_seconds']} s), first beat {grid['first_beat_s']} s, "
            f"drift max {grid['constant_tempo_drift_s']['max_abs']} s, "
            f"vocal notes {tr['voices'].get('Vocal', {}).get('notes')}, sections {len(tr['sections'])}"
        )
        if "plan" in result:
            plan = result["plan"]
            print(
                f"   plan: Q {plan['header'].get('Q')}, K {plan['keys']}, bars {plan['bars']} ({plan['abc_seconds']} s), "
                f"vocal notes {plan['voices'].get('Vocal', {}).get('notes')}, sections {len(plan['sections'])}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
