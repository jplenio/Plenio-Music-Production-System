"""The sung pitch of a recording (owner's request 2026-10-03: a cover's original vocal line as a curve in
the score editor, to see where the transcription's notes differ from the singing).

A YIN pitch tracker (de Cheveigné and Kawahara 2002) in NumPy - no extra dependency - on the vocal stem:

- mono, 16 kHz; a 64 ms frame every 10 ms; periods from 65 to 1050 Hz (C2 to C6, every singing voice);
- the cumulative mean normalised difference; the first dip under ``THRESHOLD`` (else the deepest),
  refined by parabolic interpolation;
- *voiced* where the dip is clear (``VOICED``) and the frame is no quieter than ``GATE_DB`` under the
  loud parts (a separated stem keeps some bleed of the band);
- a jump of more than ``OCTAVE_JUMP`` semitones from the run's median is folded by octaves (YIN's
  octave errors), a median filter smooths the curve, a short excursion of more than ``SPIKE``
  semitones from the local median goes (a breath or a consonant tracked wrong), and voiced runs
  shorter than ``MIN_RUN_S`` go.

The result is ``SungPitch``: a MIDI pitch (fractional: the intonation shows) or ``None`` per step.
It is a picture of the singing for the editor; nothing is changed by it.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

import numpy as np

from .resample import resample
from .signal import as_channels, check_rate

RATE = 16000
HOP = 160
"""10 ms."""
FRAME = 1024
"""64 ms: the difference function looks ``FRAME // 2`` samples far."""
FMIN = 65.0
FMAX = 1050.0
THRESHOLD = 0.12
VOICED = 0.25
GATE_DB = -35.0
OCTAVE_JUMP = 9.0
MIN_RUN_S = 0.06
SMOOTH = 5
SPIKE_WINDOW = 15
"""150 ms: a jump away from the local median shorter than half of it is a tracking error."""
SPIKE = 6.0
OUT_RATE = 50
"""What the editor gets: a value every 20 ms."""
BATCH = 2048


@dataclass(frozen=True)
class SungPitch:
    """A pitch curve: ``midi[i]`` at ``start + i / rate`` seconds (``None``: unvoiced)."""

    rate: float
    start: float
    midi: tuple[float | None, ...]
    source: str = ""
    """Where it comes from (``vocals of BS-RoFormer 4-stem``)."""
    problem: str | None = None
    """Why there is no curve (``midi`` is then empty)."""
    notes: tuple[str, ...] = field(default=())

    @property
    def voiced(self) -> float:
        return sum(1 for m in self.midi if m is not None) / len(self.midi) if self.midi else 0.0

    def to_dict(self) -> dict[str, Any]:
        if self.problem:
            return {"problem": self.problem}
        return {
            "rate": self.rate,
            "start": self.start,
            "midi": [None if m is None else round(m, 2) for m in self.midi],
            "source": self.source,
        }


def missing(problem: str) -> SungPitch:
    return SungPitch(OUT_RATE, 0.0, (), problem=problem)


def _frames(samples: np.ndarray) -> np.ndarray:
    padded = np.concatenate(
        [np.zeros(FRAME // 2, np.float32), samples.astype(np.float32), np.zeros(FRAME, np.float32)]
    )
    count = max(1, (len(samples) + HOP - 1) // HOP)
    view = np.lib.stride_tricks.sliding_window_view(padded, FRAME)[::HOP]
    return view[:count]


def _yin(frames: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """``(period in samples, dip depth, rms)`` of every frame (period ``nan`` where nothing was found)."""
    width = FRAME // 2
    tau_min = int(RATE / FMAX)
    tau_max = min(width, int(math.ceil(RATE / FMIN)))
    size = 2 * FRAME
    periods = np.full(len(frames), np.nan)
    depths = np.ones(len(frames))
    rms = np.zeros(len(frames))
    for start in range(0, len(frames), BATCH):
        block = frames[start : start + BATCH].astype(np.float64)
        spectrum = np.fft.rfft(block, size)
        head = np.fft.rfft(block[:, :width], size)
        acf = np.fft.irfft(spectrum * np.conj(head), size)[:, : tau_max + 1]
        cum = np.concatenate([np.zeros((len(block), 1)), np.cumsum(block**2, axis=1)], axis=1)
        taus = np.arange(tau_max + 1)
        energy = cum[:, taus + width] - cum[:, taus]
        diff = np.maximum(energy[:, :1] + energy - 2 * acf, 0.0)
        running = np.cumsum(diff[:, 1:], axis=1)
        cmndf = np.ones_like(diff)
        with np.errstate(divide="ignore", invalid="ignore"):
            cmndf[:, 1:] = np.where(running > 0, diff[:, 1:] * taus[1:] / running, 1.0)
        rms[start : start + len(block)] = np.sqrt(energy[:, 0] / width)
        for row in range(len(block)):
            curve = cmndf[row]
            below = np.nonzero(curve[tau_min:] < THRESHOLD)[0]
            if below.size:
                tau = tau_min + int(below[0])
                while tau + 1 <= tau_max and curve[tau + 1] < curve[tau]:
                    tau += 1
            else:
                tau = tau_min + int(np.argmin(curve[tau_min:]))
            depth = float(curve[tau])
            if 0 < tau < tau_max:
                a, b, c = curve[tau - 1], curve[tau], curve[tau + 1]
                bend = a - 2 * b + c
                shift = 0.5 * (a - c) / bend if bend > 0 else 0.0
                refined = tau + max(-0.5, min(0.5, shift))
            else:
                refined = float(tau)
            periods[start + row] = refined
            depths[start + row] = depth
    return periods, depths, rms


def _runs(voiced: np.ndarray) -> list[tuple[int, int]]:
    runs: list[tuple[int, int]] = []
    start = None
    for i, on in enumerate(voiced):
        if on and start is None:
            start = i
        elif not on and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(voiced)))
    return runs


def _clean(midi: np.ndarray, voiced: np.ndarray) -> np.ndarray:
    """Octave errors folded, short runs removed, each run median-smoothed (``nan``: unvoiced)."""
    out = np.full(len(midi), np.nan)
    shortest = max(1, round(MIN_RUN_S * RATE / HOP))
    for a, b in _runs(voiced):
        if b - a < shortest:
            continue
        run = midi[a:b].copy()
        centre = float(np.median(run))
        for i, value in enumerate(run):
            while value - centre > OCTAVE_JUMP:
                value -= 12.0
            while centre - value > OCTAVE_JUMP:
                value += 12.0
            run[i] = value
        if len(run) >= SMOOTH:
            half = SMOOTH // 2
            padded = np.concatenate([np.full(half, run[0]), run, np.full(half, run[-1])])
            run = np.median(np.lib.stride_tricks.sliding_window_view(padded, SMOOTH), axis=1)
        out[a:b] = run
    return out


def _despike(curve: np.ndarray) -> np.ndarray:
    """Excursions far from the local median removed; runs left too short removed too."""
    out: np.ndarray = curve.copy()
    half = SPIKE_WINDOW // 2
    for a, b in _runs(np.isfinite(curve)):
        run = curve[a:b]
        if len(run) < SPIKE_WINDOW:
            continue
        padded = np.concatenate([np.full(half, run[0]), run, np.full(half, run[-1])])
        local = np.median(np.lib.stride_tricks.sliding_window_view(padded, SPIKE_WINDOW), axis=1)
        out[a:b][np.abs(run - local) > SPIKE] = np.nan
    shortest = max(1, round(MIN_RUN_S * RATE / HOP))
    for a, b in _runs(np.isfinite(out)):
        if b - a < shortest:
            out[a:b] = np.nan
    return out


def track(samples: Any, sample_rate: Any, *, source: str = "") -> SungPitch:
    """The sung pitch of ``samples`` (``[channels, frames]`` or mono; best a vocal stem)."""
    rate = check_rate(sample_rate)
    data = as_channels(samples, label="audio").astype(np.float64).mean(axis=0)
    if not len(data):
        return missing("The recording is empty.")
    mono = resample(data[None, :], rate, RATE)[0] if rate != RATE else data
    periods, depths, rms = _yin(_frames(mono))
    loud = float(np.percentile(rms, 95)) if len(rms) else 0.0
    gate = max(1e-5, loud * 10 ** (GATE_DB / 20))
    with np.errstate(invalid="ignore", divide="ignore"):
        midi = 69.0 + 12.0 * np.log2(RATE / periods / 440.0)
    voiced = (depths < VOICED) & (rms > gate) & np.isfinite(midi)
    clean = _despike(_clean(np.where(voiced, midi, np.nan), voiced))
    step = max(1, round(RATE / HOP / OUT_RATE))
    values: list[float | None] = []
    for i in range(0, len(clean), step):
        window = clean[i : i + step]
        window = window[np.isfinite(window)]
        values.append(float(np.median(window)) if len(window) else None)
    return SungPitch(RATE / HOP / step, 0.0, tuple(values), source=source)
