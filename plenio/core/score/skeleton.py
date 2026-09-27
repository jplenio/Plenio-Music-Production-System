"""The skeleton of a new score for the DAW workflow (Phase 11C D4, next-release plan §10.2).

Score Tools' *new score from brief* builds an all-rest score from the Song Brief: the length and
the tempo give the number of measures, the meter and the key are read from the brief's text fields,
and what the brief does not say falls back to documented defaults (4/4, C major, 100 BPM) - each
fallback is reported. The result is a valid score with one section (``verse``) and no notes; the
user draws on it in the editor. Invariant I12 (at least one note) keeps an unfilled skeleton from
being rendered.

Pure - no ComfyUI, no I/O. The ABC text stays the only stored score.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass

from ...third_party import yue2_abc_tools as upstream
from ..brief import SongBrief
from . import canonical
from .canonical import Score

DEFAULT_TEMPO = 100
DEFAULT_METER = (4, 4)
DEFAULT_KEY = "C"
DEFAULT_SECTION = "verse"
DEFAULT_UNIT = 32
"""The shortest note of a new skeleton (``L:1/32``), as native YuE2 plans write it."""
MIN_MEASURES = 4
MAX_MEASURES = 400
MIN_TEMPO, MAX_TEMPO = 20, 300

_NUMBER = re.compile(r"\d+(?:[.,]\d+)?")
_METER = re.compile(r"(?<![\d/])(\d{1,2})\s*/\s*(\d{1,3})(?![\d/])")
_NOTE = re.compile(r"(?<![A-Za-z])([A-Ga-g])([#b]?)")
_NATURAL = upstream.NATURAL


@dataclass(frozen=True)
class Skeleton:
    """A new score from the brief, plus what was defaulted or adjusted."""

    score: Score
    report: tuple[str, ...]

    @property
    def abc(self) -> str:
        return canonical.to_abc(self.score)


def _clock(seconds: float) -> str:
    minutes, rest = divmod(int(round(seconds)), 60)
    return f"{minutes}:{rest:02d}"


def parse_tempo(text: str, default: int = DEFAULT_TEMPO) -> tuple[int, tuple[str, ...]]:
    """Quarter-note tempo from the brief's tempo field (a number in its text), else the default."""
    match = _NUMBER.search(text or "")
    if match is None:
        if (text or "").strip():
            return default, (f"tempo {text.strip()!r} carries no number: {default} BPM assumed",)
        return default, (f"no tempo in the brief: {default} BPM assumed",)
    value = int(round(float(match.group(0).replace(",", "."))))
    if not MIN_TEMPO <= value <= MAX_TEMPO:
        clamped = min(max(value, MIN_TEMPO), MAX_TEMPO)
        return clamped, (f"tempo {value} BPM is outside {MIN_TEMPO}-{MAX_TEMPO}: {clamped} BPM used",)
    return value, ()


def parse_meter(
    text: str, default: tuple[int, int] = DEFAULT_METER
) -> tuple[tuple[int, int], tuple[str, ...]]:
    """Meter from a ``n/d`` field, else the default; only whole measures are accepted."""
    match = _METER.search(text or "")
    if match is None:
        written = (text or "").strip()
        if written:
            return default, (f"meter {written!r} is not a fraction: {default[0]}/{default[1]} assumed",)
        return default, (f"no meter in the brief: {default[0]}/{default[1]} assumed",)
    numerator, denominator = int(match.group(1)), int(match.group(2))
    try:
        upstream.meter_value(f"{numerator}/{denominator}")
    except upstream.AbcError:
        return default, (
            f"meter {numerator}/{denominator} is not supported: {default[0]}/{default[1]} assumed",
        )
    if (numerator * DEFAULT_UNIT) % denominator:
        return default, (
            f"meter {numerator}/{denominator} is not a whole number of 1/{DEFAULT_UNIT} notes: "
            f"{default[0]}/{default[1]} assumed",
        )
    return (numerator, denominator), ()


def _pitch_class(letter: str, accidental: str) -> int:
    shift = 1 if accidental == "#" else -1 if accidental == "b" else 0
    return (int(_NATURAL[letter.upper()]) + shift) % 12


def parse_key(text: str, default: str = DEFAULT_KEY) -> tuple[str, tuple[str, ...]]:
    """Key from the brief's key field (``G``, ``F# minor``, ``Am``, ``Bb``), else the default."""
    written = (text or "").strip()
    if not written:
        return default, (f"no key in the brief: {default} assumed",)
    match = _NOTE.search(written)
    if match is None:
        return default, (f"key {written!r} carries no note name: {default} assumed",)
    tail = written[match.end() :].strip().lstrip("- ").lower()
    accidental = match.group(2)
    if not accidental and tail.startswith("flat"):
        accidental, tail = "b", tail[len("flat") :].strip()
    elif not accidental and tail.startswith("sharp"):
        accidental, tail = "#", tail[len("sharp") :].strip()
    minor = tail.startswith("m") and not tail.startswith("maj")
    root = match.group(1).upper() + accidental
    exact = root + ("m" if minor else "")
    if exact in upstream.KEYS:
        return exact, ()
    wanted = _pitch_class(match.group(1), accidental)
    mode = minor
    candidates = [
        key
        for key, count in upstream.KEYS.items()
        if key.endswith("m") == mode
        and _pitch_class(key[0], key[1:2] if key[1:2] in ("#", "b") else "") == wanted
    ]
    if not candidates:
        return default, (f"key {written!r} is not a native key: {default} assumed",)
    prefer = -1 if accidental == "b" else 1
    chosen = min(
        candidates,
        key=lambda key: (abs(upstream.KEYS[key]), 0 if upstream.KEYS[key] * prefer >= 0 else 1),
    )
    return chosen, (f"key {written!r} is not a native key: {chosen} used (it sounds the same)",)


def from_brief(brief: SongBrief, *, section: str = DEFAULT_SECTION) -> Skeleton:
    """An all-rest score for the brief: measures from its length and tempo, meter and key parsed."""
    tempo, tempo_notes = parse_tempo(brief.tempo)
    meter, meter_notes = parse_meter(brief.meter)
    key, key_notes = parse_key(brief.key)
    target = float(brief.target_seconds)
    measure_seconds = meter[0] * (60.0 / tempo) * (4.0 / meter[1])
    # round before the ceiling: float noise must not add a measure to an exact fit
    measures = max(MIN_MEASURES, int(math.ceil(round(target / measure_seconds, 9))))
    clamped = measures > MAX_MEASURES
    if clamped:
        measures = MAX_MEASURES
    score = canonical.new_score(
        measures=measures,
        meter=meter,
        unit=DEFAULT_UNIT,
        tempo=tempo,
        key=key,
        section=section,
    )
    length = _clock(measures * measure_seconds)
    report = [
        f"new score: {measures} measure(s) of {meter[0]}/{meter[1]} in {key} at {tempo} BPM "
        f"({length}, 1/{DEFAULT_UNIT} as the shortest note), all rests"
    ]
    if clamped:
        report.append(
            f"the brief asks for more than {MAX_MEASURES} measures: the score stops at {MAX_MEASURES}"
        )
    report += [*tempo_notes, *meter_notes, *key_notes]
    return Skeleton(score, tuple(report))


__all__ = [
    "DEFAULT_KEY",
    "DEFAULT_METER",
    "DEFAULT_SECTION",
    "DEFAULT_TEMPO",
    "DEFAULT_UNIT",
    "MAX_MEASURES",
    "Skeleton",
    "from_brief",
    "parse_key",
    "parse_meter",
    "parse_tempo",
]
