"""Check Vocals: vocal-presence verdicts for instrumental takes, take ranking and the ending check.

Calibration record (Phase 4A study + the owner's listening verdicts, 2026-09-25):

* Detector ``score`` = SheetSage2 re-transcription of the take; the metric is the number and the
  duration of notes in its ``Vocal`` track.
* On 25 labelled takes every take the owner heard a voice in had at least one ``Vocal`` note
  (humming, "a little humming", "gibberish lyrics": 1-173 notes), and every take the owner
  heard no voice in had none: precision 1.0. Two takes with rare, faint voice had 0 notes
  (recall 6/8). The default threshold is therefore *any vocal note*.
* The Gemma 4 *listen* detector flagged only takes that ``score`` also flagged and missed five,
  so it is not used. The ASR word count invents words on instrumental audio and is not a detector.

Plenio guarantees an instrumental conditioning; the audio itself is checked, not guaranteed.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any

import numpy as np

from .score.timeline import merge_intervals

DETECTOR = "sheetsage2-vocal-notes"
CALIBRATION = {
    "labelled_takes": 25,
    "voiced_by_ear": 8,
    "flagged_voiced": 6,
    "false_alarms": 0,
    "missed": "2 takes with rare, faint voice",
    "date": "2026-09-25",
}
DEFAULT_TOLERANCE_S = 0.0
ENDING_TAIL_S = 2.0
ENDING_ABRUPT_RATIO = 0.5
LIMITS = (
    "A voice-like instrument can be read as vocal; faint humming, whispers and vocal chops can be missed.",
    "The check measures the rendered audio; it does not make YuE2 render instrumental music.",
)


@dataclass(frozen=True)
class VocalReading:
    """What the detector found in one take."""

    notes: int
    seconds: float
    regions: tuple[tuple[float, float], ...] = ()

    @classmethod
    def from_notes(cls, notes: Sequence[Sequence[float]], duration_s: float) -> VocalReading:
        spans = [(float(n[0]), float(n[1])) for n in notes if float(n[1]) > float(n[0])]
        regions = merge_intervals(spans, duration_s, merge_gap_s=2.0, margin_s=0.0, min_s=0.0)
        return cls(len(spans), round(sum(b - a for a, b in spans), 2), tuple(regions))

    def to_dict(self) -> dict[str, Any]:
        return {
            "notes": self.notes,
            "seconds": self.seconds,
            "regions": [[round(a, 1), round(b, 1)] for a, b in self.regions],
        }


@dataclass(frozen=True)
class Ending:
    tail_to_median: float
    abrupt: bool

    def to_dict(self) -> dict[str, Any]:
        return {"tail_to_median": round(self.tail_to_median, 2), "abrupt": self.abrupt}


def ending(samples: np.ndarray[Any, Any], rate: int) -> Ending:
    """Loudness of the last two seconds relative to the take's median (0.5-s RMS frames).

    A ratio of 0.5 or more means the music is still playing when the audio stops - measured on all
    adapter takes of the Song path in Phase 4A, and on none of the takes without it.
    """
    mono = samples.mean(axis=0) if samples.ndim == 2 else samples
    frame = max(1, rate // 2)
    if mono.size < 3 * frame:
        return Ending(0.0, False)
    usable = mono[: mono.size - mono.size % frame].reshape(-1, frame)
    rms = np.sqrt(np.mean(usable.astype(np.float64) ** 2, axis=1))
    median = float(np.median(rms))
    tail = mono[-int(ENDING_TAIL_S * rate) :].astype(np.float64)
    ratio = float(np.sqrt(np.mean(tail**2)) / median) if median > 0 else 0.0
    return Ending(ratio, ratio >= ENDING_ABRUPT_RATIO)


@dataclass(frozen=True)
class TakeVerdict:
    index: int
    seconds: float
    reading: VocalReading
    ending: Ending | None
    passed: bool

    def to_dict(self) -> dict[str, Any]:
        return {
            "take": self.index + 1,
            "seconds": round(self.seconds, 2),
            "vocal": self.reading.to_dict(),
            "ending": self.ending.to_dict() if self.ending else None,
            "passed": self.passed,
        }


@dataclass(frozen=True)
class CheckResult:
    verdicts: tuple[TakeVerdict, ...]
    best: int
    tolerance_s: float
    notes: tuple[str, ...] = field(default=())

    @property
    def passed(self) -> bool:
        return self.verdicts[self.best].passed

    def summary(self) -> str:
        best = self.verdicts[self.best]
        if best.passed:
            head = (
                f"take {best.index + 1}: no vocal notes found"
                if best.reading.notes == 0
                else (
                    f"take {best.index + 1}: {best.reading.seconds:.1f} s of vocal notes (tolerated up to {self.tolerance_s:.0f} s)"
                )
            )
        else:
            head = (
                f"vocal suspected in every take; the least vocal is take {best.index + 1} "
                f"({best.reading.notes} vocal notes, {best.reading.seconds:.1f} s)"
            )
        return head + (f" of {len(self.verdicts)}" if len(self.verdicts) > 1 else "")

    def to_dict(self) -> dict[str, Any]:
        return {
            "detector": DETECTOR,
            "tolerance_s": self.tolerance_s,
            "best_take": self.best + 1,
            "passed": self.passed,
            "takes": [v.to_dict() for v in self.verdicts],
            "calibration": CALIBRATION,
            "limits": list(LIMITS),
            "notes": list(self.notes),
        }


def judge(
    readings: Sequence[VocalReading],
    durations: Sequence[float],
    endings: Sequence[Ending | None] = (),
    *,
    tolerance_s: float = DEFAULT_TOLERANCE_S,
) -> CheckResult:
    """Verdict per take and the best take.

    The first take that passes and ends naturally; else the first that passes (Phase 4B: a clean
    take that ran to the render ceiling and stopped mid-phrase was chosen over a clean take that
    ended); else the least vocal one.
    """
    if not readings:
        raise ValueError("no takes to check")
    padded = list(endings) + [None] * (len(readings) - len(endings))

    def passes(reading: VocalReading) -> bool:
        return reading.notes == 0 if tolerance_s <= 0 else reading.seconds <= tolerance_s

    verdicts = tuple(
        TakeVerdict(i, float(durations[i]), reading, padded[i], passes(reading))
        for i, reading in enumerate(readings)
    )
    passing = [v for v in verdicts if v.passed]
    if passing:
        natural = [v for v in passing if not (v.ending is not None and v.ending.abrupt)]
        best = (natural or passing)[0].index
    else:
        best = min(verdicts, key=lambda v: (v.reading.seconds, v.reading.notes, v.index)).index
    notes = []
    chosen = padded[best]
    if chosen is not None and chosen.abrupt:
        notes.append(f"take {best + 1} ends while the music is still playing; fade it out when mastering")
    return CheckResult(verdicts, best, tolerance_s, tuple(notes))
