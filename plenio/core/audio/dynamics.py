"""Dynamics: stereo-linked compressor, oversampled lookahead true-peak limiter, loudness targeting.

Ported from the legacy toolkit v3.1.3 (``audio_compressor.py``, ``audio_limiter.py``,
``audio_mastering.master_track``; MIT, same author). Changes: the loudness meter is Plenio's own
BS.1770 implementation (the legacy toolkit parsed FFmpeg's stderr), parameters raise user errors,
and the chain resamples first so that the true-peak ceiling holds at the final rate.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

import numpy as np

from ..dependencies import require
from ..errors import PlenioUserError
from .loudness import measure
from .resample import KAISER_BETA, resample
from .signal import BLOCK, Cancel, as_channels, check_rate, gain, no_cancel, number

# --- compressor ----------------------------------------------------------------------------------


@dataclass(frozen=True)
class Compressor:
    threshold_db: float = -18.0
    ratio: float = 1.5
    knee_db: float = 6.0
    attack_ms: float = 20.0
    release_ms: float = 150.0
    sidechain_hz: float = 80.0
    detector: str = "RMS"
    input_gain_db: float = 0.0

    def checked(self, rate: int) -> Compressor:
        if self.detector not in ("RMS", "Peak"):
            raise PlenioUserError(f"Unknown compressor detector {self.detector!r}; use RMS or Peak.")
        return Compressor(
            number(self.threshold_db, "threshold_db", -60, 0),
            number(self.ratio, "ratio", 1, 10),
            number(self.knee_db, "knee_db", 0, 24),
            number(self.attack_ms, "attack_ms", 1, 200),
            number(self.release_ms, "release_ms", 10, 2000),
            number(self.sidechain_hz, "sidechain_hz", 0, min(500, rate * 0.4)),
            self.detector,
            number(self.input_gain_db, "input_gain_db", -24, 24),
        )

    def to_dict(self) -> dict[str, Any]:
        return dict(self.__dict__)


def soft_knee_reduction_db(level: float, threshold: float, ratio: float, knee: float) -> float:
    """Gain change (<= 0 dB) of the static curve at ``level`` dB."""
    over = level - threshold
    slope = 1 / ratio - 1
    if knee == 0:
        return slope * max(over, 0.0)
    if over <= -knee / 2:
        return 0.0
    if over >= knee / 2:
        return slope * over
    return slope * (over + knee / 2) ** 2 / (2 * knee)


def compress(
    samples: Any, rate: int, settings: Compressor | None = None, *, cancel: Cancel = no_cancel
) -> tuple[np.ndarray, dict[str, Any]]:
    """Feed-forward, stereo-linked compression with a 1 ms control rate (detection on every sample)."""
    signal = require("scipy.signal")
    rate = check_rate(rate)
    data = as_channels(samples)
    c = (settings or Compressor()).checked(rate)
    input_gain = gain(c.input_gain_db)
    n = data.shape[1]
    cell = max(1, round(rate / 1000))
    frames = (n + cell - 1) // cell
    levels = np.zeros(frames)
    highpass = (
        signal.butter(2, c.sidechain_hz, btype="highpass", fs=rate, output="sos") if c.sidechain_hz else None
    )
    state = np.zeros((len(highpass), data.shape[0], 2)) if highpass is not None else None
    for f in range(0, frames, 1024):
        cancel()
        stop = min(frames, f + 1024)
        block = data[:, f * cell : min(n, stop * cell)] * input_gain
        if highpass is not None:
            block, state = signal.sosfilt(highpass, block, axis=-1, zi=state)
        missing = (stop - f) * cell - block.shape[-1]
        if missing:
            block = np.pad(block, ((0, 0), (0, missing)))
        shaped = block.reshape(data.shape[0], stop - f, cell)
        if c.detector == "Peak":
            levels[f:stop] = np.max(np.abs(shaped), axis=(0, 2))
        else:
            power = np.sum(shaped * shaped, axis=(0, 2))
            divisor = np.full(stop - f, cell * data.shape[0], dtype=float)
            if missing:
                divisor[-1] = (cell - missing) * data.shape[0]
            levels[f:stop] = np.sqrt(power / divisor)
    level_db = 20 * np.log10(np.maximum(levels, 1e-15))
    attack = math.exp(-cell / (rate * c.attack_ms / 1000))
    release = math.exp(-cell / (rate * c.release_ms / 1000))
    reductions = np.zeros(frames)
    previous = 0.0
    for i, level in enumerate(level_db):
        if i % 4096 == 0:
            cancel()
        target = soft_knee_reduction_db(float(level), c.threshold_db, c.ratio, c.knee_db)
        coefficient = attack if target < previous else release
        previous = coefficient * previous + (1 - coefficient) * target
        reductions[i] = previous
    positions = np.r_[0, np.minimum((np.arange(frames) + 1) * cell, n)]  # gains at cell ends, unity at 0
    values = np.r_[0, reductions]
    out = np.empty_like(data)
    for start in range(0, n, BLOCK):
        cancel()
        stop = min(start + BLOCK, n)
        envelope = np.interp(np.arange(start, stop), positions, values)
        out[:, start:stop] = data[:, start:stop] * (input_gain * 10 ** (envelope / 20))
    return out, {
        "algorithm": "linked_feedforward_control_1ms_v1",
        "enabled": True,
        **c.to_dict(),
        "control_period_ms": 1000 * cell / rate,
        "max_reduction_db": round(float(-reductions.min()), 3),
        "mean_reduction_db": round(float(-reductions.mean()), 3),
    }


# --- limiter ----------------------------------------------------------------------------------------


def limit(
    samples: Any,
    rate: int,
    *,
    ceiling_dbtp: float = -1.0,
    drive_db: float = 0.0,
    lookahead_ms: float = 3.0,
    release_ms: float = 100.0,
    block_frames: int = 32768,
    cancel: Cancel = no_cancel,
) -> tuple[np.ndarray, dict[str, Any]]:
    """Stereo-linked 4x-oversampled lookahead limiter (a candidate; ``master`` verifies the ceiling)."""
    signal = require("scipy.signal")
    ndimage = require("scipy.ndimage")
    rate = check_rate(rate)
    data = as_channels(samples)
    ceiling_dbtp = number(ceiling_dbtp, "ceiling_dbtp", -12, -0.1)
    drive_db = number(drive_db, "drive_db", -48, 24)
    lookahead_ms = number(lookahead_ms, "lookahead_ms", 1, 5)
    release_ms = number(release_ms, "release_ms", 10, 1000)
    factor = 4
    look = max(1, round(rate * factor * lookahead_ms / 1000))
    width = look + 1
    guard = 64  # source frames beyond the resampling kernel support
    halo = 2 * ((look + factor - 1) // factor) + 2 * guard
    step = 12 / (rate * factor * release_ms / 1000)  # linear-dB release: 12 dB per release time
    threshold = 10 ** ((ceiling_dbtp - 0.2) / 20)  # reserve for resampling and meter rounding
    drive = gain(drive_db)
    n = data.shape[1]
    out = np.empty_like(data)
    history = np.zeros((data.shape[0], guard * factor))
    previous = 0.0
    max_reduction = sum_reduction = 0.0
    for start in range(0, n, block_frames):
        cancel()
        stop = min(start + block_frames, n)
        lo, hi = max(0, start - halo), min(n, stop + halo)
        tile = data[:, lo:hi] * drive
        tile = np.pad(tile, ((0, 0), (max(0, halo - start), max(0, stop + halo - n))))
        up = signal.resample_poly(tile, factor, 1, axis=-1, window=("kaiser", 10.0))
        demand = np.maximum(0, 20 * np.log10(np.maximum(np.max(np.abs(up), axis=0), 1e-20) / threshold))
        future = ndimage.maximum_filter1d(demand, size=width, origin=-(width // 2), mode="nearest")
        smooth = ndimage.uniform_filter1d(future, size=width, origin=(width - 1) // 2, mode="nearest")
        core_start = halo * factor
        core_size = (stop - start) * factor
        count = core_size + guard * factor
        required = np.maximum(demand, smooth)[core_start : core_start + count]
        offsets = np.arange(1, count + 1) * step
        reduction = np.maximum(np.maximum.accumulate(np.maximum(required + offsets, previous)) - offsets, 0)
        processed = up[:, core_start : core_start + count] * 10 ** (-reduction[None, :] / 20)
        extended = np.concatenate((history, processed), axis=-1)
        down = signal.resample_poly(extended, 1, factor, axis=-1, window=("kaiser", 10.0))
        out[:, start:stop] = down[:, guard : guard + stop - start]
        history = processed[:, max(0, core_size - guard * factor) : core_size].copy()
        if history.shape[-1] < guard * factor:
            history = np.pad(history, ((0, 0), (guard * factor - history.shape[-1], 0)))
        previous = float(reduction[core_size - 1])
        max_reduction = max(max_reduction, float(np.max(reduction[:core_size])))
        sum_reduction += float(np.sum(reduction[:core_size]))
    return out, {
        "algorithm": "lookahead_4x_linear_db_release_v1",
        "ceiling_dbtp": ceiling_dbtp,
        "drive_db": round(drive_db, 3),
        "lookahead_ms": lookahead_ms,
        "release_ms_per_12db": release_ms,
        "max_reduction_db": round(max_reduction, 3),
        "mean_reduction_db": round(sum_reduction / (n * factor), 4),
    }


# --- mastering chain -----------------------------------------------------------------------------


@dataclass(frozen=True)
class Target:
    integrated_lufs: float = -14.0
    ceiling_dbtp: float = -1.0
    max_limiter_reduction_db: float = 6.0
    max_makeup_db: float = 18.0
    lookahead_ms: float = 3.0
    limiter_release_ms: float = 100.0

    def checked(self) -> Target:
        return Target(
            number(self.integrated_lufs, "target_lufs", -30, -5),
            number(self.ceiling_dbtp, "ceiling_dbtp", -12, -0.1),
            number(self.max_limiter_reduction_db, "max_limiter_reduction_db", 1, 18),
            number(self.max_makeup_db, "max_makeup_db", 0, 24),
            number(self.lookahead_ms, "lookahead_ms", 1, 5),
            number(self.limiter_release_ms, "limiter_release_ms", 10, 1000),
        )

    def to_dict(self) -> dict[str, Any]:
        return dict(self.__dict__)


TOLERANCE_LU = 0.3
"""The loudness target counts as reached within this tolerance."""


def master(
    samples: Any,
    rate: int,
    target: Target | None = None,
    compressor: Compressor | None = None,
    *,
    output_rate: int | None = None,
    cancel: Cancel = no_cancel,
) -> tuple[np.ndarray, int, dict[str, Any]]:
    """Resample (optional) -> compress (optional) -> drive into the limiter until the loudness target is met.

    Up to three passes adjust the make-up gain; the limiter's gain reduction is bounded and the final
    true peak is measured independently and corrected if needed. Returns the audio, its rate and a report.
    """
    rate = check_rate(rate)
    goal = (target or Target()).checked()
    final_rate = check_rate(output_rate) if output_rate else rate
    data = resample(
        as_channels(samples), rate, final_rate
    )  # before dynamics: the ceiling holds at the final rate
    before = measure(data, final_rate, cancel=cancel)
    if compressor is not None:
        compressed, compression = compress(data, final_rate, compressor, cancel=cancel)
    else:
        compressed, compression = data, {"enabled": False}
    measured = measure(compressed, final_rate, cancel=cancel, with_true_peak=False)
    makeup = (
        float(np.clip(goal.integrated_lufs - measured.integrated_lufs, -48, goal.max_makeup_db))
        if measured.integrated_lufs is not None
        else 0.0
    )
    attempts: list[dict[str, Any]] = []
    reason = "iteration_limit"
    final, after = compressed, measured
    for iteration in range(1, 4):
        cancel()
        final, limiter = limit(
            compressed,
            final_rate,
            ceiling_dbtp=goal.ceiling_dbtp,
            drive_db=makeup,
            lookahead_ms=goal.lookahead_ms,
            release_ms=goal.limiter_release_ms,
            cancel=cancel,
        )
        if limiter["max_reduction_db"] > goal.max_limiter_reduction_db + 0.05:
            # render again from the compressor output with less drive, not from the previous master
            makeup = max(-48.0, makeup - (limiter["max_reduction_db"] - goal.max_limiter_reduction_db) - 0.05)
            final, limiter = limit(
                compressed,
                final_rate,
                ceiling_dbtp=goal.ceiling_dbtp,
                drive_db=makeup,
                lookahead_ms=goal.lookahead_ms,
                release_ms=goal.limiter_release_ms,
                cancel=cancel,
            )
            reason = "limiter_reduction_budget"
        after = measure(final, final_rate, cancel=cancel)
        correction = 0.0
        if after.true_peak_dbtp is not None and after.true_peak_dbtp > goal.ceiling_dbtp:
            correction = goal.ceiling_dbtp - after.true_peak_dbtp - 0.1
            final = final * gain(correction)
            after = measure(final, final_rate, cancel=cancel)
        if after.true_peak_dbtp is not None and after.true_peak_dbtp > goal.ceiling_dbtp + 0.05:
            raise PlenioUserError(
                "Mastering could not verify the true-peak ceiling; lower the ceiling or the target."
            )
        attempts.append(
            {
                "iteration": iteration,
                "makeup_db": round(makeup, 3),
                "safety_gain_db": round(correction, 3),
                "output": after.to_dict(),
                "limiter": limiter,
            }
        )
        if after.integrated_lufs is None:
            reason = "silence_or_unmeasurable_loudness"
            break
        error = goal.integrated_lufs - after.integrated_lufs
        if abs(error) <= TOLERANCE_LU:
            reason = "target_reached"
            break
        if error > 0 and (reason == "limiter_reduction_budget" or makeup >= goal.max_makeup_db):
            reason = "limiter_reduction_budget" if reason == "limiter_reduction_budget" else "makeup_budget"
            break
        new_makeup = float(np.clip(makeup + np.clip(error, -6, 6), -48, goal.max_makeup_db))
        if abs(new_makeup - makeup) < 0.01:
            reason = "makeup_budget"
            break
        makeup = new_makeup
    return (
        final,
        final_rate,
        {
            "input_rate": rate,
            "output_rate": final_rate,
            "input": before.to_dict(),
            "after_compressor": measured.to_dict(),
            "output": after.to_dict(),
            "compressor": compression,
            "target": goal.to_dict(),
            "attempts": attempts,
            "target_reached": reason == "target_reached",
            "reason": reason,
        },
    )


__all__ = ["KAISER_BETA", "Compressor", "Target", "compress", "limit", "master", "soft_knee_reduction_db"]
