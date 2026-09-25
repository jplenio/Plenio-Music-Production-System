"""Loudness and peak metering: ITU-R BS.1770-4 integrated loudness, EBU Tech 3342 loudness range,
true peak (4x oversampled at 44.1/48 kHz), sample peak.

The K-weighting filters are designed for any sample rate from their analog prototypes with the
constants that reproduce the 48 kHz coefficients of BS.1770 exactly (the parameterisation used by
libebur128). Measurement only - nothing here changes audio. ``pyloudnorm`` serves as the test oracle.

True peak: 4x oversampling (2x from 96 kHz) with a Kaiser low-pass flat to 0.4 x the rate and 80 dB
down from 0.6 x the rate (images of content below 0.4 x the rate are rejected). Content between 0.4
and 0.5 x the rate is slightly under-read; the limiter keeps a 0.2 dB reserve.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import numpy as np

from ..dependencies import require
from .resample import lowpass
from .signal import BLOCK, Cancel, as_channels, check_rate, db, no_cancel, peak

ABSOLUTE_GATE_LUFS = -70.0
RELATIVE_GATE_LU = -10.0
LRA_RELATIVE_GATE_LU = -20.0
BLOCK_S, STEP_S = 0.4, 0.1  # momentary blocks, 75 % overlap
SHORT_TERM_S, SHORT_TERM_STEP_S = 3.0, 0.1


def k_weighting(rate: int) -> np.ndarray:
    """Second-order sections of the BS.1770 K-weighting (pre-filter shelf, then RLB high-pass)."""
    rate = check_rate(rate)
    f0, gain_db, q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    k = math.tan(math.pi * f0 / rate)
    vh = 10.0 ** (gain_db / 20.0)
    vb = vh**0.4996667741545416
    a0 = 1.0 + k / q + k * k
    shelf = [
        (vh + vb * k / q + k * k) / a0,
        2.0 * (k * k - vh) / a0,
        (vh - vb * k / q + k * k) / a0,
        1.0,
        2.0 * (k * k - 1.0) / a0,
        (1.0 - k / q + k * k) / a0,
    ]
    f0, q = 38.13547087602444, 0.5003270373238773
    k = math.tan(math.pi * f0 / rate)
    denominator = 1.0 + k / q + k * k
    highpass = [1.0, -2.0, 1.0, 1.0, 2.0 * (k * k - 1.0) / denominator, (1.0 - k / q + k * k) / denominator]
    return np.array([shelf, highpass], dtype=np.float64)


def _weighted_power(samples: np.ndarray, rate: int, cancel: Cancel) -> np.ndarray:
    """Per-frame sum over channels of the squared K-weighted signal (channel weights 1.0 for L, R, mono)."""
    signal = require("scipy.signal")
    sos = k_weighting(rate)
    state = np.zeros((len(sos), samples.shape[0], 2))
    power = np.empty(samples.shape[1], dtype=np.float64)
    for start in range(0, samples.shape[1], BLOCK):
        cancel()
        block, state = signal.sosfilt(sos, samples[:, start : start + BLOCK], axis=-1, zi=state)
        power[start : start + block.shape[1]] = np.sum(block * block, axis=0)
    return power


def _block_powers(power: np.ndarray, rate: int, length_s: float, step_s: float) -> np.ndarray:
    size, step = round(length_s * rate), round(step_s * rate)
    if power.shape[0] < size:
        return np.empty(0)
    cumulative = np.concatenate(([0.0], np.cumsum(power)))
    starts = np.arange(0, power.shape[0] - size + 1, step)
    return np.asarray((cumulative[starts + size] - cumulative[starts]) / size, dtype=np.float64)


def _lufs(mean_power: np.ndarray | float) -> Any:
    return -0.691 + 10.0 * np.log10(np.maximum(mean_power, 1e-20))


def integrated_from_blocks(blocks: np.ndarray) -> float | None:
    """Gated integrated loudness of momentary block powers (``None`` below the gates)."""
    if blocks.size == 0:
        return None
    loud = blocks[_lufs(blocks) > ABSOLUTE_GATE_LUFS]
    if loud.size == 0:
        return None
    threshold = float(_lufs(float(np.mean(loud)))) + RELATIVE_GATE_LU
    gated = loud[_lufs(loud) > threshold]
    return float(_lufs(float(np.mean(gated)))) if gated.size else None


def loudness_range(blocks: np.ndarray) -> float | None:
    """EBU Tech 3342 LRA of short-term (3 s) block powers."""
    if blocks.size == 0:
        return None
    levels = _lufs(blocks)
    levels = levels[levels > ABSOLUTE_GATE_LUFS]
    if levels.size == 0:
        return None
    threshold = float(_lufs(float(np.mean(10.0 ** ((levels + 0.691) / 10.0))))) + LRA_RELATIVE_GATE_LU
    gated = np.sort(levels[levels > threshold])
    if gated.size < 2:
        return 0.0
    return float(np.percentile(gated, 95) - np.percentile(gated, 10))


@lru_cache(maxsize=8)
def _interpolation_filter(rate: int, factor: int) -> np.ndarray:
    return lowpass(rate * factor, 0.4 * rate, 0.6 * rate, 80.0)


def true_peak(samples: np.ndarray, rate: int, cancel: Cancel = no_cancel) -> float:
    """Linear true peak: 4x oversampled below 96 kHz, 2x up to 192 kHz, sample peak above."""
    factor = 4 if rate < 96000 else 2 if rate <= 192000 else 1
    if factor == 1:
        return peak(samples)
    signal = require("scipy.signal")
    h = _interpolation_filter(rate, factor)
    guard = len(h) // factor + 1
    result = 0.0
    for start in range(0, samples.shape[1], BLOCK):
        cancel()
        lo, hi = max(0, start - guard), min(samples.shape[1], start + BLOCK + guard)
        up = signal.resample_poly(samples[:, lo:hi], factor, 1, axis=-1, window=h)
        core = up[:, (start - lo) * factor : (start - lo + min(BLOCK, samples.shape[1] - start)) * factor]
        result = max(result, float(np.max(np.abs(core))))
    return max(result, peak(samples))


@dataclass(frozen=True)
class Measurement:
    integrated_lufs: float | None
    true_peak_dbtp: float | None
    sample_peak_dbfs: float | None
    loudness_range_lu: float | None
    seconds: float

    @property
    def valid(self) -> bool:
        return self.integrated_lufs is not None and self.true_peak_dbtp is not None

    def to_dict(self) -> dict[str, Any]:
        def rounded(value: float | None) -> float | None:
            return None if value is None else round(value, 2)

        return {
            "integrated_lufs": rounded(self.integrated_lufs),
            "true_peak_dbtp": rounded(self.true_peak_dbtp),
            "sample_peak_dbfs": rounded(self.sample_peak_dbfs),
            "loudness_range_lu": rounded(self.loudness_range_lu),
            "plr_db": rounded(self.true_peak_dbtp - self.integrated_lufs) if self.valid else None,  # type: ignore[operator]
            "seconds": round(self.seconds, 3),
            "meter": "BS.1770-4 / EBU Tech 3342 (Plenio)",
            "valid": self.valid,
        }


def measure(
    samples: Any, rate: int, *, cancel: Cancel = no_cancel, with_true_peak: bool = True
) -> Measurement:
    """Integrated loudness, LRA, true peak (optional: the slowest part) and sample peak of mono or stereo audio."""
    rate = check_rate(rate)
    data = as_channels(samples)
    sample_peak = peak(data)
    seconds = data.shape[1] / rate
    if sample_peak < 1e-12:
        return Measurement(None, None, None, None, seconds)
    power = _weighted_power(data, rate, cancel)
    integrated = integrated_from_blocks(_block_powers(power, rate, BLOCK_S, STEP_S))
    lra = loudness_range(_block_powers(power, rate, SHORT_TERM_S, SHORT_TERM_STEP_S))
    tp = db(true_peak(data, rate, cancel)) if with_true_peak else None
    return Measurement(integrated, tp, db(sample_peak), lra, seconds)
