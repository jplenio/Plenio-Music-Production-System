"""Produce the golden DSP outputs of the legacy toolkit for Plenio's port regression tests.

The legacy repository stays read-only: its DSP modules are copied into a scratch package and run
there on deterministic synthetic signals. Writes ``tests/fixtures/dsp/golden-legacy-dsp.{npz,json}``.

    <python with numpy+scipy> tools/studies/golden_legacy_dsp.py <legacy toolkit folder> [scratch folder]
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

PROJECT = Path(__file__).resolve().parents[2]
MODULES = (
    "audio_dsp_utils.py",
    "audio_eq.py",
    "eq_config.py",
    "audio_compressor.py",
    "audio_limiter.py",
    "audio_auto_eq.py",
    "audio_analysis.py",
)
STUBS = {
    "toolkit_logging.py": "def get_logger(name):\n    import logging\n    return logging.getLogger(name)\n",
    "ffmpeg_utils.py": "def find_ffmpeg(message):\n    raise RuntimeError(message)\n",
    "audio_utils.py": "def validate_audio(*args, **kwargs):\n    raise RuntimeError('not used')\n",
}
RATE = 44100
EQ_SETTINGS = {
    "schema": "minimax_eq_v1",
    "preamp_db": -1.5,
    "bands": [
        {
            "id": "a",
            "type": "low_shelf",
            "frequency_hz": 120,
            "gain_db": 3,
            "q": 0.707,
            "slope": 1,
            "enabled": True,
        },
        {
            "id": "b",
            "type": "peak",
            "frequency_hz": 2500,
            "gain_db": -4,
            "q": 1.4,
            "slope": 1,
            "enabled": True,
        },
        {
            "id": "c",
            "type": "high_shelf",
            "frequency_hz": 9000,
            "gain_db": 2,
            "q": 0.707,
            "slope": 0.7,
            "enabled": True,
        },
        {
            "id": "d",
            "type": "highpass",
            "frequency_hz": 30,
            "gain_db": 0,
            "q": 0.707,
            "slope": 1,
            "enabled": True,
        },
        {"id": "e", "type": "notch", "frequency_hz": 60, "gain_db": 0, "q": 4, "slope": 1, "enabled": True},
    ],
}
COMPRESS_RMS = {
    "threshold_db": -24,
    "ratio": 3,
    "knee_db": 6,
    "attack_ms": 10,
    "release_ms": 120,
    "sidechain_hz": 80,
    "detector": "RMS",
}
COMPRESS_PEAK = {
    "threshold_db": -20,
    "ratio": 4,
    "knee_db": 0,
    "attack_ms": 5,
    "release_ms": 80,
    "sidechain_hz": 0,
    "detector": "Peak",
    "input_gain_db": 2,
}
LIMIT = {"ceiling_dbtp": -1, "drive_db": 9, "lookahead_ms": 3, "release_ms": 100, "block_frames": 16384}


def test_signal() -> np.ndarray:
    """0.6 s stereo: a 220 Hz tone that jumps up at 0.2 s (attack/release) plus noise; a 3.3 kHz tone."""
    rng = np.random.default_rng(20260925)
    t = np.arange(int(RATE * 0.6)) / RATE
    left = 0.4 * np.sin(2 * np.pi * 220 * t) * (0.3 + 0.7 * (t > 0.2)) + 0.05 * rng.standard_normal(t.size)
    right = 0.3 * np.sin(2 * np.pi * 3300 * t + 1) + 0.1 * rng.standard_normal(t.size)
    return np.vstack([left, right]).astype(np.float32)


def main() -> int:
    legacy = Path(sys.argv[1])
    scratch = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(tempfile.mkdtemp(prefix="plenio-golden-"))
    package = scratch / "legacy_dsp"
    package.mkdir(parents=True, exist_ok=True)
    for name in MODULES:
        shutil.copy2(legacy / name, package / name)
    for name, text in {"__init__.py": "", **STUBS}.items():
        (package / name).write_text(text, encoding="utf-8")
    sys.path.insert(0, str(scratch))
    from legacy_dsp.audio_analysis import spectral_profile  # type: ignore[import-not-found]
    from legacy_dsp.audio_auto_eq import fit_eq  # type: ignore[import-not-found]
    from legacy_dsp.audio_compressor import compress  # type: ignore[import-not-found]
    from legacy_dsp.audio_eq import apply_eq  # type: ignore[import-not-found]
    from legacy_dsp.audio_limiter import limit_peaks  # type: ignore[import-not-found]
    from legacy_dsp.eq_config import parse_settings  # type: ignore[import-not-found]

    signal = test_signal()
    eq_out = apply_eq(signal, RATE, parse_settings(EQ_SETTINGS, RATE), block_frames=4096)
    rms, rms_report = compress(signal, RATE, **COMPRESS_RMS)
    peak, peak_report = compress(signal, RATE, **COMPRESS_PEAK)
    limited, limit_report = limit_peaks(signal, RATE, **LIMIT)
    source = spectral_profile(signal, RATE)
    grid = np.asarray(source["frequency_hz"])
    target = dict(source, power_db=(np.asarray(source["power_db"]) - 0.75 * np.log2(grid / 1000)).tolist())
    fit_settings, fit_report = fit_eq(source, target, RATE, strength=0.5, max_gain=3.0, max_bands=4)
    out = PROJECT / "tests" / "fixtures" / "dsp"
    out.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        out / "golden-legacy-dsp.npz",
        eq=eq_out,
        compress_rms=rms,
        compress_peak=peak,
        limit=limited,
        profile_power=np.asarray(source["power_db"]),
    )
    commit = subprocess.run(
        ["git", "-C", str(legacy), "log", "-1", "--format=%H"], capture_output=True, text=True
    ).stdout.strip()
    meta = {
        "source": f"legacy toolkit v3.1.3 (commit {commit or 'unknown'}), DSP modules run from a scratch copy",
        "generator": "tools/studies/golden_legacy_dsp.py",
        "rate": RATE,
        "eq_settings": EQ_SETTINGS,
        "compress_rms": COMPRESS_RMS,
        "compress_peak": COMPRESS_PEAK,
        "limit": LIMIT,
        "reports": {"compress_rms": rms_report, "compress_peak": peak_report, "limit": limit_report},
        "fit_settings": fit_settings,
        "fit_report": {k: fit_report[k] for k in ("accepted", "before_error_db", "after_error_db")},
    }
    (out / "golden-legacy-dsp.json").write_text(json.dumps(meta, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {out / 'golden-legacy-dsp.npz'} ({(out / 'golden-legacy-dsp.npz').stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
