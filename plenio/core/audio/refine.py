"""Refine (48 kHz): audio super-resolution around an injected engine (next-release plan §4).

One pipeline for every engine; everything but the engine is pure DSP and testable with fakes:

1. measure the input's bandwidth (the highest frequency within 60 dB of the 1-4 kHz level);
2. *model engine*: low-pass the engine's input to the bandwidth it was trained for (PRE; it shapes
   only what the engine sees, never the kept original) and convert it to the engine's rate;
3. run the engine chunk by chunk (Hann-weighted overlap-add, a derived seed per chunk);
4. join the original (converted to 48 kHz) and the engine's output with a complementary
   crossover: ``LP(original) + gain * HP(SR)``, where ``HP = identity - LP`` for one linear-phase
   kernel, so the pair sums to the identity and nothing below the crossover changes;
5. optional linear-phase POST roll-off;
6. contract: 48 kHz, the duration of the input (``output_frames``), no hidden normalisation;
   a report with the parameters, the bandwidth before and after, loudness change and timing.

*resample only* is the same stage without the engine: exactly ``core.audio.resample``. With an
engine connected the model **always runs** - also for an input that already reaches the top
(owner's decision, 2026-09-28): PRE shapes what the model sees, the crossover decides what it may
replace (nothing below it changes) and POST rolls the result off. A silent or far too short input is
only resampled, and the report says so.

The parameter values are **provisional** (plan §4.4) until the measurement study (L1) decides
them; the report marks them as such.
"""

from __future__ import annotations

import math
import time
from collections.abc import Callable
from dataclasses import asdict, dataclass
from typing import Any, Protocol

import numpy as np

from ..dependencies import require
from ..errors import PlenioUserError
from .loudness import measure
from .resample import lowpass, output_frames, resample
from .signal import Cancel, as_channels, check_rate, no_cancel, number, peak

OUTPUT_RATE = 48000
REFINE_SCHEMA = "plenio.refine/1"
FULL_BAND_HZ = 20000.0
TRANSITION_HZ = 1000.0
ATTENUATION_DB = 90.0
CROSSOVER_BELOW_EDGE_HZ = 500.0
PROVISIONAL = True
"""The defaults come from the legacy chain and the plan's re-evaluation, not from measurements yet (L1)."""


class Engine(Protocol):
    """A super-resolution model behind the ComfyUI adapter layer (weights, device, memory)."""

    name: str
    input_rate: int
    """The rate the engine consumes (UniverSR: its 8/12/16/24 kHz input conditions)."""
    condition_hz: float
    """The input bandwidth the engine was trained for; the PRE low-pass edge (0: no PRE)."""
    chunk_seconds: float
    overlap_seconds: float

    def upsample(self, chunk: np.ndarray, seed: int) -> np.ndarray:
        """``[channels, frames]`` at ``input_rate`` -> ``[channels, frames * 48000 / input_rate]`` at 48 kHz."""
        ...


@dataclass(frozen=True)
class RefineSettings:
    pre_hz: float = 0.0
    """PRE low-pass edge of the engine input; 0: the engine's own condition; negative: none."""
    crossover_hz: float = 0.0
    """0: the measured bandwidth minus 500 Hz."""
    sr_gain: float = 1.0
    post_hz: float = 0.0
    """Linear-phase roll-off of the result; 0: off."""
    seed: int = 0

    def checked(self) -> RefineSettings:
        return RefineSettings(
            number(self.pre_hz, "PRE low-pass", -1.0, 23000.0),
            number(self.crossover_hz, "crossover", 0.0, 23000.0),
            number(self.sr_gain, "SR gain", 0.0, 2.0),
            number(self.post_hz, "POST roll-off", 0.0, 23900.0),
            int(number(self.seed, "seed", 0, 2**32 - 1)),
        )


# --- analysis ---------------------------------------------------------------------------


def measure_bandwidth(samples: Any, rate: int) -> float | None:
    """The highest frequency within 60 dB of the 1-4 kHz level (``None``: silent or too short).

    The rule of ``tools/studies/restoration_gate.py`` (Phase 7), on the mono mix.
    """
    data = as_channels(samples)
    rate = check_rate(rate)
    mono = data.mean(axis=0)
    size = 8192
    if mono.size < size:
        return None
    window = np.hanning(size)
    step = size // 2
    power = np.zeros(size // 2 + 1)
    count = 0
    for start in range(0, mono.size - size + 1, step):
        frame = mono[start : start + size] * window
        if float(np.mean(frame * frame)) > 1e-8:
            power += np.abs(np.fft.rfft(frame)) ** 2
            count += 1
    if not count:
        return None
    freqs = np.fft.rfftfreq(size, 1 / rate)
    power /= count
    band = (freqs >= 1000) & (freqs < 4000)
    reference = 10 * math.log10(max(float(power[band].mean()), 1e-30))
    level = 10 * np.log10(np.maximum(power, 1e-30))
    above = freqs[level > reference - 60]
    return float(above.max()) if above.size else None


# --- filters ----------------------------------------------------------------------------


def lowpass_kernel(rate: int, cutoff_hz: float, transition_hz: float = TRANSITION_HZ) -> np.ndarray:
    """Odd-length linear-phase low-pass, -6 dB at ``cutoff_hz`` (Kaiser, ``ATTENUATION_DB`` stop band)."""
    nyquist = rate / 2
    if not 0 < cutoff_hz < nyquist:
        raise PlenioUserError(f"A {cutoff_hz:g} Hz low-pass is not possible at {rate} Hz.")
    half = min(transition_hz / 2, cutoff_hz * 0.5, (nyquist - cutoff_hz) * 0.9)
    return lowpass(rate, cutoff_hz - half, cutoff_hz + half, ATTENUATION_DB)


def filter_zero_delay(samples: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """Linear-phase FIR with its delay removed (the kernel is odd and symmetric)."""
    signal = require("scipy.signal")
    return np.asarray(signal.oaconvolve(samples, kernel[None, :], mode="same", axes=-1))


def crossover(
    original: np.ndarray, sr: np.ndarray, rate: int, cutoff_hz: float, gain: float = 1.0
) -> np.ndarray:
    """``LP(original) + gain * (SR - LP(SR))``: complementary, so ``crossover(x, x, ...) == x``."""
    kernel = lowpass_kernel(rate, cutoff_hz)
    return np.asarray(filter_zero_delay(original, kernel) + gain * (sr - filter_zero_delay(sr, kernel)))


# --- chunked engine ---------------------------------------------------------------------


def _fade(length: int) -> np.ndarray:
    """Raised-cosine fade-in of ``length`` samples; ``fade + fade[::-1] == 1``."""
    if length <= 0:
        return np.ones(0)
    return 0.5 - 0.5 * np.cos(np.pi * (np.arange(length) + 0.5) / length)


def run_chunked(
    samples: np.ndarray, engine: Engine, *, seed: int = 0, cancel: Cancel = no_cancel
) -> np.ndarray:
    """The engine over the whole input in overlapping chunks, joined by crossfades; 48 kHz output
    with exactly ``output_frames(frames, input_rate, 48000)`` frames. Chunk ``i`` gets seed ``seed + i``."""
    rate = engine.input_rate
    data = as_channels(samples)
    frames = data.shape[1]
    total = output_frames(frames, rate, OUTPUT_RATE)
    chunk = max(1, round(engine.chunk_seconds * rate))
    overlap = min(max(0, round(engine.overlap_seconds * rate)), chunk // 2)
    step = chunk - overlap
    out = np.zeros((data.shape[0], total))
    weight = np.zeros(total)
    starts = list(range(0, max(frames - overlap, 1), step)) or [0]
    for index, start in enumerate(starts):
        cancel()
        piece = data[:, start : start + chunk]
        result = np.asarray(engine.upsample(piece, seed + index), dtype=np.float64)
        expected = output_frames(piece.shape[1], rate, OUTPUT_RATE)
        if result.ndim != 2 or result.shape[0] != data.shape[0] or abs(result.shape[1] - expected) > 2:
            raise PlenioUserError(
                f"The super-resolution engine {engine.name!r} returned {result.shape}, expected "
                f"{(data.shape[0], expected)} for chunk {index + 1}."
            )
        result = np.pad(result[:, :expected], ((0, 0), (0, max(0, expected - result.shape[1]))))
        begin = output_frames(start, rate, OUTPUT_RATE)
        end = min(begin + expected, total)
        window = np.ones(expected)
        edge = output_frames(overlap, rate, OUTPUT_RATE)
        if index > 0 and edge:
            window[:edge] = _fade(edge)
        if index < len(starts) - 1 and edge:
            window[expected - edge :] = _fade(edge)[::-1]
        out[:, begin:end] += result[:, : end - begin] * window[: end - begin]
        weight[begin:end] += window[: end - begin]
    return np.asarray(out / np.maximum(weight, 1e-12))


# --- the stage --------------------------------------------------------------------------


def _lufs(samples: np.ndarray, rate: int) -> float | None:
    value = measure(samples, rate, with_true_peak=False).integrated_lufs
    return None if value is None else float(value)


def refine(
    samples: Any,
    rate: int,
    engine: Engine | None = None,
    settings: RefineSettings | None = None,
    *,
    cancel: Cancel = no_cancel,
    clock: Callable[[], float] = time.perf_counter,
) -> tuple[np.ndarray, dict[str, Any]]:
    """48 kHz audio of the same duration and the stage's report (see the module docstring)."""
    started = clock()
    data = as_channels(samples)
    rate = check_rate(rate)
    options = (settings or RefineSettings()).checked()
    edge_in = measure_bandwidth(data, rate)
    original = resample(data, rate, OUTPUT_RATE)
    notes: list[str] = []
    applied: dict[str, Any] = {"pre_hz": None, "crossover_hz": None, "sr_gain": None, "post_hz": None}
    if engine is None:
        out = original
        engine_name = "resample only"
    elif edge_in is None:
        out = original
        engine_name = engine.name
        notes.append("the input is silent or too short to measure; it was only resampled")
    else:
        # The model always runs when it is connected - also for an input that already reaches the top
        # (the owner's decision, 2026-09-28): the crossover decides what it may replace, PRE what it
        # sees, POST rolls the result off. Nothing below the crossover changes.
        engine_name = engine.name
        pre = engine.condition_hz if options.pre_hz == 0 else max(options.pre_hz, 0.0)
        source = data
        if pre > 0:
            source = filter_zero_delay(data, lowpass_kernel(rate, min(pre, rate / 2 - 100)))
        conditioned = resample(source, rate, engine.input_rate)
        sr = run_chunked(conditioned, engine, seed=options.seed, cancel=cancel)
        frames = original.shape[1]
        sr = np.pad(sr[:, :frames], ((0, 0), (0, max(0, frames - sr.shape[1]))))
        cutoff = options.crossover_hz or max(edge_in - CROSSOVER_BELOW_EDGE_HZ, 1000.0)
        if edge_in >= FULL_BAND_HZ:
            notes.append(
                f"the input already reaches {edge_in / 1000:.1f} kHz: the model only replaces content "
                f"above the crossover ({cutoff / 1000:.1f} kHz), everything below stays the original"
            )
        out = crossover(original, sr, OUTPUT_RATE, cutoff, options.sr_gain)
        if options.post_hz:
            out = filter_zero_delay(out, lowpass_kernel(OUTPUT_RATE, options.post_hz))
        applied = {
            "pre_hz": pre or None,
            "crossover_hz": cutoff,
            "sr_gain": options.sr_gain,
            "post_hz": options.post_hz or None,
        }
    before, after = _lufs(original, OUTPUT_RATE), _lufs(out, OUTPUT_RATE)
    report = {
        "schema": REFINE_SCHEMA,
        "engine": engine_name,
        "provisional_defaults": PROVISIONAL,
        "input_rate": rate,
        "output_rate": OUTPUT_RATE,
        "frames": int(out.shape[1]),
        "bandwidth_in_hz": None if edge_in is None else round(edge_in, 1),
        "bandwidth_out_hz": None if (edge := measure_bandwidth(out, OUTPUT_RATE)) is None else round(edge, 1),
        **applied,
        "seed": options.seed,
        "loudness_change_lu": None if before is None or after is None else round(after - before, 3),
        "peak_in": round(peak(data), 6),
        "peak_out": round(peak(out), 6),
        "seconds": round(clock() - started, 3),
        "settings": asdict(options),
        "notes": notes,
    }
    return out, report


__all__ = [
    "OUTPUT_RATE",
    "REFINE_SCHEMA",
    "Engine",
    "RefineSettings",
    "crossover",
    "filter_zero_delay",
    "lowpass_kernel",
    "measure_bandwidth",
    "refine",
    "run_chunked",
]
