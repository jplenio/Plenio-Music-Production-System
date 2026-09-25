"""Phase 7 restoration gate: does rendered audio need a repair stage (declip, HF de-harsh, low-pass)?

Measures, per file: sample clipping (samples and runs at full scale), inter-sample overs (true peak
above 0 dBTP), the spectrum's roll-off (the highest frequency within 60 dB of the 1-4 kHz level), the
high-frequency balance (8-16 kHz vs. 1-4 kHz) and its variability over time (a harshness/fizz proxy),
and loudness facts. Writes JSON for the test report; the decision on the conditional Repair node
(target-architecture C1) is taken from these numbers on **unprocessed** takes (the ``(original)``
files of Export Release, or takes rendered without mastering).

    <python with numpy, scipy, av> tools/studies/restoration_gate.py <out.json> <audio files ...>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import numpy as np

PROJECT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT))

from plenio.core.audio.loudness import measure  # noqa: E402

CLIP_LEVEL = 0.999


def decode(path: Path) -> tuple[np.ndarray, int]:
    import av

    with av.open(str(path)) as container:
        stream = container.streams.audio[0]
        rate = int(stream.rate)
        resampler = av.AudioResampler(
            format="fltp", layout="stereo" if stream.channels > 1 else "mono", rate=rate
        )
        chunks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray())
        for out in resampler.resample(None):
            chunks.append(out.to_ndarray())
    return np.concatenate(chunks, axis=1).astype(np.float64), rate


def clipping(x: np.ndarray) -> dict[str, Any]:
    hot = np.abs(x) >= CLIP_LEVEL
    runs = 0
    longest = 0
    for channel in hot:
        edges = np.diff(np.r_[0, channel.astype(np.int8), 0])
        starts, ends = np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)
        lengths = ends - starts
        runs += int(np.count_nonzero(lengths >= 3))  # 3+ samples in a row: flat-topped (clipped) peaks
        longest = max(longest, int(lengths.max()) if lengths.size else 0)
    return {"samples_at_full_scale": int(hot.sum()), "clipped_runs_3plus": runs, "longest_run": longest}


def spectrum(x: np.ndarray, rate: int) -> dict[str, Any]:
    mono = x.mean(axis=0)
    size = 8192
    window = np.hanning(size)
    frames = [mono[s : s + size] * window for s in range(0, mono.size - size, size // 2)]
    frames = [f for f in frames if np.mean(f * f) > 1e-8]
    if not frames:
        return {"valid": False}
    power = np.abs(np.fft.rfft(np.array(frames), axis=-1)) ** 2
    freqs = np.fft.rfftfreq(size, 1 / rate)

    def band(lo: float, hi: float) -> np.ndarray:
        return power[:, (freqs >= lo) & (freqs < hi)].mean(axis=1)

    mid = band(1000, 4000)
    high = band(8000, min(16000, rate / 2))
    ratio_db = 10 * np.log10(np.maximum(high, 1e-20) / np.maximum(mid, 1e-20))
    mean_power = power.mean(axis=0)
    reference = 10 * np.log10(mean_power[(freqs >= 1000) & (freqs < 4000)].mean())
    level = 10 * np.log10(np.maximum(mean_power, 1e-30))
    above = freqs[level > reference - 60]
    return {
        "valid": True,
        "rolloff_hz": round(float(above.max()) if above.size else 0.0, 1),
        "hf_to_mid_db": round(float(np.median(ratio_db)), 2),
        "hf_to_mid_spread_db": round(float(np.percentile(ratio_db, 90) - np.percentile(ratio_db, 10)), 2),
    }


def study(path: Path) -> dict[str, Any]:
    x, rate = decode(path)
    level = measure(x, rate).to_dict()
    return {
        "file": path.name,
        "sample_rate": rate,
        "seconds": round(x.shape[1] / rate, 2),
        "loudness": level,
        "inter_sample_over": bool(level["true_peak_dbtp"] is not None and level["true_peak_dbtp"] > 0.0),
        "clipping": clipping(x),
        "spectrum": spectrum(x, rate),
    }


def main() -> int:
    out = Path(sys.argv[1])
    results = [study(Path(p)) for p in sys.argv[2:]]
    out.write_text(
        json.dumps({"schema": "plenio.study.restoration/1", "files": results}, indent=1) + "\n",
        encoding="utf-8",
    )
    for r in results:
        c, s = r["clipping"], r["spectrum"]
        print(
            f"{r['file']}: {r['loudness']['integrated_lufs']} LUFS, TP {r['loudness']['true_peak_dbtp']} dBTP, "
            f"clipped runs {c['clipped_runs_3plus']}, roll-off {s.get('rolloff_hz')} Hz, HF/mid {s.get('hf_to_mid_db')} dB"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
