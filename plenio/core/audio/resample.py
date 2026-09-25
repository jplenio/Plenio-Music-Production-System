"""Sample-rate conversion: polyphase filtering with a Kaiser-designed low-pass (one resampler for all DSP).

The legacy toolkit (``audio_utils.resample_kaiser_polyphase``) used SciPy's default ``resample_poly``
filter, whose transition band starts at the new Nyquist frequency: a 23 kHz tone converted from 48 to
44.1 kHz came out at only -6 dB as a 21.1 kHz alias (Phase 7 test). Plenio designs the filter from
band edges instead: flat to 20 kHz (at most 0.9 x the lower Nyquist frequency), at least 100 dB
attenuation from the lower Nyquist frequency on.
"""

from __future__ import annotations

from fractions import Fraction
from functools import lru_cache

import numpy as np

from ..dependencies import require
from .signal import as_channels, check_rate

KAISER_BETA = 14.769656459379492
"""Kaiser beta of the legacy resampler (kept for the limiter's oversampling, which is ported unchanged)."""
PASSBAND_HZ = 20000.0
STOPBAND_DB = 100.0


def lowpass(rate: int, pass_hz: float, stop_hz: float, attenuation_db: float) -> np.ndarray:
    """Odd-length linear-phase Kaiser low-pass at ``rate`` with the given band edges."""
    signal = require("scipy.signal")
    taps, beta = signal.kaiserord(attenuation_db, (stop_hz - pass_hz) / (rate / 2))
    taps |= 1
    return np.asarray(signal.firwin(taps, (pass_hz + stop_hz) / 2, window=("kaiser", beta), fs=rate))


@lru_cache(maxsize=16)
def _conversion_filter(rate_in: int, up: int, down: int) -> np.ndarray:
    nyquist = min(rate_in, rate_in * up // down) / 2
    return lowpass(rate_in * up, min(PASSBAND_HZ, 0.9 * nyquist), nyquist, STOPBAND_DB)


def resample(samples: np.ndarray, rate_in: int, rate_out: int) -> np.ndarray:
    """``samples`` ``[channels, frames]`` at ``rate_out``; identical rates return the input unchanged."""
    rate_in, rate_out = check_rate(rate_in), check_rate(rate_out)
    if rate_in == rate_out:
        return samples
    signal = require("scipy.signal")
    data = as_channels(samples)
    ratio = Fraction(rate_out, rate_in).limit_denominator(10000)
    h = _conversion_filter(rate_in, ratio.numerator, ratio.denominator)
    out = signal.resample_poly(data, ratio.numerator, ratio.denominator, axis=-1, window=h)
    return np.asarray(out, dtype=np.float64)


def output_frames(frames: int, rate_in: int, rate_out: int) -> int:
    """Frames after conversion (``resample_poly``: ``ceil(frames * up / down)``)."""
    ratio = Fraction(rate_out, rate_in).limit_denominator(10000)
    return -(-frames * ratio.numerator // ratio.denominator)
