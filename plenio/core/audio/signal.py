"""Audio arrays for the DSP: validation, conversion, chunking and small helpers.

Audio is a float array ``[channels, frames]`` (mono or stereo) and an integer sample rate.
ComfyUI's ``AUDIO`` (``waveform [batch, channels, frames]``) is converted by the adapter layer.
"""

from __future__ import annotations

import math
from collections.abc import Callable
from typing import Any

import numpy as np

from ..errors import PlenioUserError

BLOCK = 1 << 16
"""Frames per processing block (bounded scratch memory)."""
MIN_RATE, MAX_RATE = 8000, 384000


def as_channels(samples: Any, *, label: str = "audio") -> np.ndarray:
    """``[channels, frames]`` float64 view/copy of mono or stereo audio; refuses NaN, Inf and empty audio."""
    data = np.asarray(samples, dtype=np.float64)
    if data.ndim == 1:
        data = data[None, :]
    if data.ndim != 2 or data.shape[0] not in (1, 2) or data.shape[1] == 0:
        raise PlenioUserError(
            f"The {label} must be mono or stereo [channels, frames]; got the shape {tuple(np.shape(samples))}."
        )
    for start in range(0, data.shape[1], BLOCK):
        if not np.isfinite(data[:, start : start + BLOCK]).all():
            raise PlenioUserError(f"The {label} contains NaN or infinite samples.")
    return data


def check_rate(sample_rate: Any) -> int:
    if (
        isinstance(sample_rate, bool)
        or not isinstance(sample_rate, int | float)
        or int(sample_rate) != sample_rate
    ):
        raise PlenioUserError(f"The sample rate must be a whole number of Hz, got {sample_rate!r}.")
    rate = int(sample_rate)
    if not MIN_RATE <= rate <= MAX_RATE:
        raise PlenioUserError(f"Sample rates from {MIN_RATE} to {MAX_RATE} Hz are supported, got {rate}.")
    return rate


def peak(samples: np.ndarray) -> float:
    return max(float(np.max(np.abs(samples[:, s : s + BLOCK]))) for s in range(0, samples.shape[1], BLOCK))


def db(value: float) -> float | None:
    return 20.0 * math.log10(value) if value > 0 else None


def gain(decibels: float) -> float:
    return float(10.0 ** (decibels / 20.0))


def number(value: Any, name: str, minimum: float, maximum: float) -> float:
    """A finite number within ``[minimum, maximum]`` or a user error naming the parameter."""
    if isinstance(value, bool):
        raise PlenioUserError(f"{name} must be a number, not a boolean.")
    try:
        result = float(value)
    except (TypeError, ValueError, OverflowError) as error:
        raise PlenioUserError(f"{name} must be a number.") from error
    if not math.isfinite(result) or not minimum <= result <= maximum:
        raise PlenioUserError(f"{name} must be between {minimum:g} and {maximum:g}, got {result:g}.")
    return result


Cancel = Callable[[], None]
"""Called between blocks; raises to cancel (the adapter passes ComfyUI's interrupt check)."""


def no_cancel() -> None:
    return None
