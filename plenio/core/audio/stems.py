"""Stems before mastering (next-release plan §6): the container, the residual invariant and the mixer.

- :class:`Stems` (``PLENIO_STEMS``): at most four named stems at the input's rate and length, plus
  the **residual** ``input - sum(stems)``. The residual is mixed as one more strip, ``rest``, so
  a *neutral* mix (every gain 0 dB, nothing muted or soloed, no compression, no muted range, no
  effect send) returns the input exactly (float32 storage rounding): separation errors can only
  affect what the user changes.
- The mixer's value ``plenio.stem_mix/1`` (the Stem Mixer's widget, one owner): per strip gain
  (-60 ... +12 dB), mute, solo (solo beats mute; any solo silences every other strip including
  ``rest``), compression amount 0 ... 1 (the existing compressor), muted time ranges (merged,
  clipped, 10 ms raised-cosine edges inside the range; the song keeps its length), reverb and delay
  sends 0 ... 1 to one shared bus each.
- The effect buses (reverb, delay) are injected functions (``core.audio.effects``, task D12); a send
  without its bus is refused, never silently ignored. Their returns are cut at the song end with a
  50 ms fade. Mixdown in float64, no normalisation; peaks and gain reduction are reported.
"""

from __future__ import annotations

import json
import math
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any, Protocol

import numpy as np

from ..errors import PlenioUserError
from .dynamics import Compressor, compress
from .signal import Cancel, as_channels, check_rate, gain, no_cancel, number, peak

MIX_SCHEMA = "plenio.stem_mix/1"
REST = "rest"
MAX_STEMS = 4
EDGE_SECONDS = 0.010
TAIL_FADE_SECONDS = 0.050
BUSES = ("reverb", "delay")
_STRIP_FIELDS = {"gain_db", "mute", "solo", "compression", "muted", *BUSES, "save"}


class Separator(Protocol):
    """A separation model behind the ComfyUI adapter layer."""

    name: str
    stems: tuple[str, ...]

    def separate(self, samples: np.ndarray, rate: int) -> Mapping[str, np.ndarray]:
        """``{name: [channels, frames]}`` at the input's rate and length (at most four)."""
        ...


Effect = Callable[[np.ndarray, int], np.ndarray]
"""A bus: ``[channels, frames]`` in, the same shape out (the wet signal only)."""


@dataclass(frozen=True)
class Stems:
    rate: int
    names: tuple[str, ...]
    stems: tuple[np.ndarray, ...]
    """float32 ``[channels, frames]`` each."""
    residual: np.ndarray
    source: str = ""
    """The separator that made them."""

    @property
    def frames(self) -> int:
        return int(self.residual.shape[1])

    def strips(self) -> list[tuple[str, np.ndarray]]:
        return [*zip(self.names, self.stems, strict=True), (REST, self.residual)]


@dataclass(frozen=True)
class SavedStems:
    """The strips marked *save* in the Stem Mixer, as their files hold them: per take (batch item) the
    strip names and signals (float ``[channels, frames]``) at ``rate``. Export Release writes them next to
    the song, into ``<name>-stems`` (they ride on the mixer's report, outside the record)."""

    rate: int
    takes: tuple[tuple[tuple[str, np.ndarray], ...], ...]

    @property
    def names(self) -> tuple[str, ...]:
        return tuple(dict.fromkeys(name for take in self.takes for name, _signal in take))


def make_stems(samples: Any, rate: int, separated: Mapping[str, Any], *, source: str = "") -> Stems:
    """Stems plus the residual that makes their sum the input again."""
    rate = check_rate(rate)
    data = as_channels(samples)
    if not 1 <= len(separated) <= MAX_STEMS:
        raise PlenioUserError(f"A separation gives 1 to {MAX_STEMS} stems, got {len(separated)}.")
    names, stems = [], []
    total = np.zeros_like(data)
    for name, stem in separated.items():
        if not isinstance(name, str) or not name.strip() or name == REST or name in names:
            raise PlenioUserError(f"Stem name {name!r} is not usable (unique, not empty, not '{REST}').")
        array = np.asarray(as_channels(stem, label=f"stem {name!r}"), dtype=np.float32)
        if array.shape != data.shape:
            raise PlenioUserError(f"Stem {name!r} has the shape {array.shape}; the input has {data.shape}.")
        names.append(name)
        stems.append(array)
        total += array.astype(np.float64)
    residual = (data - total).astype(np.float32)
    return Stems(rate, tuple(names), tuple(stems), residual, source)


# --- the mixer value --------------------------------------------------------------------


@dataclass(frozen=True)
class Strip:
    gain_db: float = 0.0
    mute: bool = False
    solo: bool = False
    compression: float = 0.0
    muted: tuple[tuple[float, float], ...] = ()
    reverb: float = 0.0
    delay: float = 0.0
    save: bool = False
    """Write this strip as its own file (owner's request, 2026-09-28); the Stem Mixer node does it."""

    @property
    def neutral(self) -> bool:
        return self == Strip()


@dataclass(frozen=True)
class Mix:
    strips: Mapping[str, Strip] = field(default_factory=dict)
    buses: Mapping[str, Mapping[str, Any]] = field(default_factory=dict)
    """Bus settings (reverb preset, delay time ...), passed to the effect functions unchanged."""

    def strip(self, name: str) -> Strip:
        return self.strips.get(name, Strip())

    def to_json(self) -> str:
        strips = {
            name: {
                key: [list(r) for r in value] if key == "muted" else value
                for key, value in strip.__dict__.items()
                if value != getattr(Strip(), key)
            }
            for name, strip in self.strips.items()
            if not strip.neutral
        }
        return json.dumps({"schema": MIX_SCHEMA, "strips": strips, **dict(self.buses)}, sort_keys=True)


def _flag(value: Any, name: str) -> bool:
    if not isinstance(value, bool):
        raise PlenioUserError(f"{name} must be true or false.")
    return value


def parse_mix(text: str | None) -> Mix:
    """The mixer value; empty is the neutral mix. Unknown fields are refused (no silent typos)."""
    if text is None or not str(text).strip():
        return Mix()
    try:
        data = json.loads(text)
    except ValueError as error:
        raise PlenioUserError(f"The stem mix is not valid JSON: {error}.") from error
    if not isinstance(data, dict) or data.get("schema") != MIX_SCHEMA:
        raise PlenioUserError(f'The stem mix must be an object with "schema": "{MIX_SCHEMA}".')
    unknown = set(data) - {"schema", "strips", *BUSES}
    if unknown:
        raise PlenioUserError(f"Unknown stem mix fields: {sorted(unknown)}.")
    strips: dict[str, Strip] = {}
    raw_strips = data.get("strips", {})
    if not isinstance(raw_strips, dict):
        raise PlenioUserError("'strips' must map strip names to settings.")
    for name, raw in raw_strips.items():
        where = f"strip {name!r}"
        if not isinstance(raw, dict) or set(raw) - _STRIP_FIELDS:
            raise PlenioUserError(
                f"{where}: unknown fields {sorted(set(raw) - _STRIP_FIELDS) if isinstance(raw, dict) else raw!r}."
            )
        ranges = raw.get("muted", [])
        if not isinstance(ranges, list) or not all(
            isinstance(r, list | tuple) and len(r) == 2 for r in ranges
        ):
            raise PlenioUserError(f"{where}: 'muted' must be a list of [start_s, end_s].")
        muted = []
        for start, end in ranges:
            a = number(start, f"{where} muted start", 0, 24 * 3600)
            b = number(end, f"{where} muted end", 0, 24 * 3600)
            if b <= a:
                raise PlenioUserError(f"{where}: a muted range must end after it starts ({a:g} ... {b:g} s).")
            muted.append((a, b))
        strips[str(name)] = Strip(
            number(raw.get("gain_db", 0.0), f"{where} gain_db", -60, 12),
            _flag(raw.get("mute", False), f"{where} mute"),
            _flag(raw.get("solo", False), f"{where} solo"),
            number(raw.get("compression", 0.0), f"{where} compression", 0, 1),
            tuple(muted),
            number(raw.get("reverb", 0.0), f"{where} reverb", 0, 1),
            number(raw.get("delay", 0.0), f"{where} delay", 0, 1),
            _flag(raw.get("save", False), f"{where} save"),
        )
    buses = {bus: data[bus] for bus in BUSES if bus in data}
    for bus, value in buses.items():
        if not isinstance(value, dict):
            raise PlenioUserError(f"The {bus} bus settings must be an object.")
    return Mix(strips, buses)


# --- mixing -----------------------------------------------------------------------------


def compressor_for(amount: float) -> Compressor:
    """One knob: amount 0 ... 1 -> threshold -12 ... -30 dB, ratio 1 ... 6; 10 ms / 120 ms, no side-chain
    filter (a bass stem must be heard by its own detector); no make-up gain."""
    return Compressor(
        threshold_db=-12.0 - 18.0 * amount,
        ratio=1.0 + 5.0 * amount,
        knee_db=6.0,
        attack_ms=10.0,
        release_ms=120.0,
        sidechain_hz=0.0,
    )


def merge_ranges(ranges: Sequence[tuple[float, float]], seconds: float) -> list[tuple[float, float]]:
    clipped = sorted((max(0.0, a), min(seconds, b)) for a, b in ranges if a < seconds and b > 0)
    merged: list[tuple[float, float]] = []
    for start, end in clipped:
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        elif end > start:
            merged.append((start, end))
    return merged


def mute_envelope(frames: int, rate: int, ranges: Sequence[tuple[float, float]]) -> np.ndarray:
    """1 outside the ranges, 0 inside, with raised-cosine edges of 10 ms inside each range."""
    envelope = np.ones(frames)
    edge = max(1, round(EDGE_SECONDS * rate))
    for start_s, end_s in merge_ranges(ranges, frames / rate):
        start, end = round(start_s * rate), min(frames, round(end_s * rate))
        if end <= start:
            continue
        envelope[start:end] = 0.0
        ramp = min(edge, (end - start) // 2)
        if ramp:
            fall = 0.5 + 0.5 * np.cos(np.pi * (np.arange(ramp) + 0.5) / ramp)
            envelope[start : start + ramp] = fall
            envelope[end - ramp : end] = fall[::-1]
    return envelope


def _tail_fade(signal_: np.ndarray, rate: int) -> np.ndarray:
    length = min(signal_.shape[1], round(TAIL_FADE_SECONDS * rate))
    if length:
        signal_ = signal_.copy()
        signal_[:, -length:] *= 0.5 + 0.5 * np.cos(np.pi * (np.arange(length) + 0.5) / length)
    return signal_


def strip_signal(
    stem: Any,
    rate: int,
    strip: Strip,
    *,
    item: dict[str, Any] | None = None,
    cancel: Cancel = no_cancel,
) -> np.ndarray:
    """One strip as the mixer uses it: float64, with its compression, muted ranges and gain.

    The mute/solo *decision* is the mixer's (it depends on the other strips); the effect sends are
    added by the mixer too. ``item`` (the strip's report entry) is filled with the gain reduction and
    the muted time - the same numbers the mixdown reports.
    """
    signal_ = np.asarray(stem, dtype=np.float64)
    if strip.compression > 0:
        signal_, info = compress(signal_, rate, compressor_for(strip.compression), cancel=cancel)
        if item is not None:
            item["gain_reduction_db"] = info["max_reduction_db"]
    if strip.muted:
        envelope = mute_envelope(signal_.shape[1], rate, strip.muted)
        signal_ = signal_ * envelope
        if item is not None:
            item["muted_seconds"] = round(float((1 - envelope).sum()) / rate, 3)
    if strip.gain_db:
        signal_ = signal_ * gain(strip.gain_db)
    return signal_


def mix(
    stems: Stems,
    settings: Mix | None = None,
    *,
    effects: Mapping[str, Effect] | None = None,
    cancel: Cancel = no_cancel,
    signals: dict[str, np.ndarray] | None = None,
) -> tuple[np.ndarray, dict[str, Any]]:
    """The mixdown (float64 ``[channels, frames]``, the input's length) and the mixer report.

    ``signals``, when given, receives the processed signal (:func:`strip_signal`) of every audible
    strip marked *save*, so the files of those strips need not be processed again.
    """
    options = settings or Mix()
    rate = stems.rate
    known = {*stems.names, REST}
    notes = [
        f"strip {name!r} is not a stem of this separation and was ignored"
        for name in options.strips
        if name not in known
    ]
    soloing = any(options.strip(name).solo for name in known)
    shape = stems.residual.shape
    dry = np.zeros(shape)
    sends = {bus: np.zeros(shape) for bus in BUSES}
    strips_report = []
    for name, stem in stems.strips():
        cancel()
        strip = options.strip(name)
        audible = strip.solo if soloing else not strip.mute
        item: dict[str, Any] = {"name": name, "audible": audible, "gain_db": strip.gain_db}
        if strip.save:
            item["save"] = True
        strips_report.append(item)
        if not audible:
            continue
        signal_ = strip_signal(stem, rate, strip, item=item, cancel=cancel)
        if signals is not None and strip.save:
            signals[name] = signal_
        dry += signal_
        for bus in BUSES:
            amount = getattr(strip, bus)
            if amount:
                sends[bus] += signal_ * amount
    out = dry
    used = [bus for bus in BUSES if np.any(sends[bus])]
    for bus in used:
        effect = (effects or {}).get(bus)
        if effect is None:
            raise PlenioUserError(
                f"A {bus} send is set, but this version of Plenio has no {bus} bus yet.",
                hint=f"Set every {bus} send to 0.",
            )
        wet = np.asarray(effect(sends[bus], rate), dtype=np.float64)
        if wet.shape != shape:
            raise PlenioUserError(f"The {bus} bus returned {wet.shape}, expected {shape}.")
        out = out + _tail_fade(wet, rate)
    neutral = not soloing and all(options.strip(name).neutral for name in known)
    report = {
        "schema": MIX_SCHEMA,
        "rate": rate,
        "stems": list(stems.names),
        "source": stems.source,
        "neutral": neutral,
        "strips": strips_report,
        "buses": used,
        "peak_db": None if (value := peak(out)) <= 0 else round(20 * math.log10(value), 2),
        "notes": notes,
    }
    return out, report


__all__ = [
    "MIX_SCHEMA",
    "REST",
    "Mix",
    "Separator",
    "Stems",
    "Strip",
    "compressor_for",
    "make_stems",
    "merge_ranges",
    "mix",
    "mute_envelope",
    "parse_mix",
    "strip_signal",
]
