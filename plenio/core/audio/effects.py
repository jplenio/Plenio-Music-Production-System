"""The two effect buses of the Stem Mixer (next-release plan §6.3): reverb and delay.

Both are pure functions ``Effect`` (``[channels, frames]`` in, the same shape out, the **wet** signal
only: the mixer adds the send level). They are deterministic: the reverb impulse response is built
from a seeded generator, so the same settings give the same result (R12).

- **Reverb**: convolution with a synthesised, decorrelated stereo impulse response (exponential decay
  with frequency-dependent damping and a pre-delay). Presets *room* (RT60 1.2 s), *plate* (1.6 s) and
  *hall* (2.4 s) differ in decay time, damping and early-reflection density. The impulse is scaled to
  unit energy, so the wet signal keeps the level of the dry one - no hidden normalisation of the mix.
- **Delay**: a stereo feedback delay with a low-pass in the loop. The time is given in milliseconds
  or as a note value at a BPM. The first echo carries the send level; the feedback (0 ... 0.8, so
  the tail always decays) sets how much of each echo returns as the next one.

Both follow the stems' channel count: a mono separation gets a mono wet signal (the reverb uses the
first channel of its impulse response).

The buses' settings come from the mixer value (``plenio.stem_mix/1``, the ``buses`` object); the
Stem Mixer node turns them into these functions with :func:`effects_for` and refuses a send whose bus
has no effect, never ignoring it silently.
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

import numpy as np

from ..dependencies import require
from ..errors import PlenioUserError
from .signal import as_channels, check_rate
from .stems import Effect

REVERB_PRESETS: dict[str, dict[str, float]] = {
    "room": {"rt60": 1.2, "damping": 0.45, "pre_delay_ms": 12.0},
    "plate": {"rt60": 1.6, "damping": 0.25, "pre_delay_ms": 4.0},
    "hall": {"rt60": 2.4, "damping": 0.55, "pre_delay_ms": 24.0},
}
NOTE_VALUES: dict[str, float] = {
    "1/4": 1.0,
    "1/4.": 1.5,
    "1/8": 0.5,
    "1/8.": 0.75,
    "1/8t": 1 / 3,
    "1/16": 0.25,
}
MAX_FEEDBACK = 0.8
MIN_DELAY_MS = 5.0
MAX_DELAY_MS = 2000.0
DEFAULT_DELAY_MS = 375.0
DEFAULT_FEEDBACK = 0.35
DEFAULT_LOWPASS_HZ = 4000.0
DEFAULT_BPM = 120.0
TAIL_FLOOR = 1e-5
"""The delay stops adding echoes once their level bound (``feedback ** n``) is below -100 dB."""
REVERB_KEYS = frozenset({"preset", "rt60", "damping", "pre_delay_ms", "seed"})
DELAY_KEYS = frozenset({"time_ms", "note", "bpm", "feedback", "lowpass_hz", "seed"})


def _value(settings: Mapping[str, Any], name: str, default: float, low: float, high: float) -> float:
    raw = settings.get(name, default)
    if isinstance(raw, bool) or not isinstance(raw, (int, float)) or not math.isfinite(float(raw)):
        raise PlenioUserError(f"The effect bus setting {name!r} must be a number, got {raw!r}.")
    value = float(raw)
    if not low <= value <= high:
        raise PlenioUserError(
            f"The effect bus setting {name!r} must be between {low} and {high}, got {value}."
        )
    return value


def _optional_number(settings: Mapping[str, Any], name: str) -> float | None:
    raw = settings.get(name)
    if raw in (None, ""):
        return None
    if isinstance(raw, str):
        try:
            raw = float(raw.strip())
        except ValueError as error:
            raise PlenioUserError(
                f"The effect bus setting {name!r} must be a number, got {raw!r}."
            ) from error
    if isinstance(raw, bool) or not isinstance(raw, (int, float)) or not math.isfinite(float(raw)):
        raise PlenioUserError(f"The effect bus setting {name!r} must be a number, got {raw!r}.")
    return float(raw)


def _choice(settings: Mapping[str, Any], name: str, options: tuple[str, ...], default: str) -> str:
    raw = str(settings.get(name, default) or default)
    if raw not in options:
        raise PlenioUserError(f"The effect bus setting {name!r} must be one of {list(options)}, got {raw!r}.")
    return raw


# --- reverb -------------------------------------------------------------------------------------


def impulse_response(
    rate: int, *, seed: int = 0, rt60: float = 1.2, damping: float = 0.45, pre_delay_ms: float = 12.0
) -> np.ndarray:
    """A synthesised stereo impulse response ``[2, frames]``, unit energy per channel.

    Exponential decay (``rt60`` is the time to -60 dB), frequency-dependent damping (a one-pole
    low-pass whose cutoff falls with the decay), a pre-delay of silence and a few early reflections.
    Channel 1 uses a different seed, so the two sides are decorrelated (a mono sum does not comb).
    """
    rate = check_rate(rate)
    length = max(1, int(round(rt60 * rate)))
    pre = int(round(max(0.0, pre_delay_ms) * rate / 1000.0))
    time = np.arange(length) / rate
    envelope = 10 ** (-3.0 * time / max(rt60, 1e-3))  # -60 dB after rt60
    signal = require("scipy.signal")
    channels = []
    for channel in range(2):
        rng = np.random.default_rng(seed * 2 + channel)
        noise = rng.standard_normal(length)
        # frequency-dependent damping: a one-pole low-pass (darker as the decay goes on)
        alpha = float(np.clip(damping, 0.0, 0.95))
        smoothed = signal.lfilter([1.0 - alpha], [1.0, -alpha], noise)
        response = smoothed * envelope
        # early reflections: a few delayed, attenuated copies (deterministic per channel)
        for index in range(4):
            offset = int(rng.uniform(0.004, 0.05) * rate)
            if 0 < offset < length:
                response[offset:] += response[: length - offset] * (0.5 ** (index + 1)) * 0.3
        energy = float(np.sqrt(np.sum(response**2)))
        channels.append(response / energy if energy > 0 else response)
    result = np.stack(channels)
    if pre:
        result = np.concatenate([np.zeros((2, pre)), result], axis=1)[:, : result.shape[1]]
    return result


def reverb(preset: str = "room", *, seed: int = 0, **overrides: Any) -> Effect:
    """The reverb bus: convolution with :func:`impulse_response` (wet only)."""
    if preset not in REVERB_PRESETS:
        raise PlenioUserError(f"Unknown reverb preset {preset!r}; use one of {list(REVERB_PRESETS)}.")
    settings = {**REVERB_PRESETS[preset], **overrides}
    rt60 = _value(settings, "rt60", 1.2, 0.1, 10.0)
    damping = _value(settings, "damping", 0.45, 0.0, 0.95)
    pre_delay = _value(settings, "pre_delay_ms", 12.0, 0.0, 200.0)
    seed_value = int(_value(settings, "seed", float(seed), 0.0, 2**32 - 1))

    def apply(samples: np.ndarray, rate: int) -> np.ndarray:
        signal = require("scipy.signal")
        data = as_channels(samples)
        impulse = impulse_response(rate, seed=seed_value, rt60=rt60, damping=damping, pre_delay_ms=pre_delay)
        # one impulse channel per stem channel: mono stems stay mono (the first channel of the IR)
        impulse = impulse[np.arange(data.shape[0]) % impulse.shape[0]]
        out = signal.oaconvolve(data, impulse, mode="full", axes=-1)[:, : data.shape[1]]
        return np.asarray(out, dtype=np.float64)

    return apply


# --- delay --------------------------------------------------------------------------------------


def delay(
    *,
    time_ms: float | None = None,
    note: str | None = None,
    bpm: float = DEFAULT_BPM,
    feedback: float = DEFAULT_FEEDBACK,
    lowpass_hz: float = DEFAULT_LOWPASS_HZ,
    seed: int = 0,
) -> Effect:
    """The delay bus: a feedback delay with a low-pass in the loop (wet only).

    ``time_ms`` wins over ``note`` (a note value at ``bpm``: ``1/4``, ``1/8.``, ``1/8t`` ...). The
    first echo is the send itself, one delay time later; every further echo is the one before it
    times ``feedback``, through the loop's one-pole low-pass (so every repeat is darker). With
    ``feedback`` 0 the bus is a single echo.

    The echoes are summed one by one - ``O(frames x echoes)``, not ``O(frames x delay samples)`` as a
    comb filter with the delay in its denominator costs - and stop once their level bound
    ``feedback ** n`` falls below :data:`TAIL_FLOOR` or the song ends.
    """
    if not 0.0 <= feedback <= MAX_FEEDBACK:
        raise PlenioUserError(
            f"The delay feedback must be 0 or more and at most {MAX_FEEDBACK} (got {feedback}); a higher "
            "value never decays."
        )
    if not 20.0 <= lowpass_hz <= 24000.0:
        raise PlenioUserError(f"The delay low-pass must be between 20 and 24000 Hz, got {lowpass_hz:g}.")
    if not 20.0 <= bpm <= 400.0:
        raise PlenioUserError(f"The delay BPM must be between 20 and 400, got {bpm:g}.")
    if time_ms is None and note is not None:
        if note not in NOTE_VALUES:
            raise PlenioUserError(f"Unknown delay note {note!r}; use one of {list(NOTE_VALUES)}.")
        time_ms = NOTE_VALUES[note] * 60000.0 / bpm
    milliseconds = float(time_ms if time_ms is not None else DEFAULT_DELAY_MS)
    if not MIN_DELAY_MS <= milliseconds <= MAX_DELAY_MS:
        raise PlenioUserError(
            f"The delay time must be between {MIN_DELAY_MS:.0f} and {MAX_DELAY_MS:.0f} ms, got {milliseconds:.0f}."
        )
    gain = float(feedback)
    cutoff = float(lowpass_hz)

    def apply(samples: np.ndarray, rate: int) -> np.ndarray:
        signal = require("scipy.signal")
        data = np.asarray(as_channels(samples), dtype=np.float64)
        rate = check_rate(rate)
        frames = data.shape[1]
        length = max(1, int(round(milliseconds * rate / 1000.0)))
        # the loop's one-pole low-pass: y[n] = (1-a) x[n] + a y[n-1]
        a = min(float(np.exp(-2.0 * np.pi * cutoff / rate)), 0.9995)
        out = np.zeros_like(data)
        echo = data  # the current echo, from its own start on
        start, level = length, 1.0
        while start < frames and level >= TAIL_FLOOR:
            out[:, start:] += echo[:, : frames - start]
            if not gain:
                break
            # the next echo: this one back through the loop (low-pass, feedback), one delay time later
            echo = gain * signal.lfilter([1.0 - a], [1.0, -a], echo[:, : frames - start], axis=-1)
            start += length
            level *= gain
        return out

    return apply


# --- the buses ----------------------------------------------------------------------------------


def _known(values: Mapping[str, Any], bus: str, keys: frozenset[str]) -> None:
    unknown = sorted(set(values) - keys)
    if unknown:
        raise PlenioUserError(
            f"Unknown {bus} bus setting(s) {unknown}; use {sorted(keys)}.",
            hint="The Stem Mixer widget writes only these; check a hand-edited mix value.",
        )


def _number_or(values: Mapping[str, Any], name: str, default: float) -> float:
    """A bus setting or its default: a missing value takes the default, a given 0 stays 0."""
    value = _optional_number(values, name)
    return default if value is None else value


def reverb_bus(settings: Mapping[str, Any] | None = None) -> Effect:
    values = dict(settings or {})
    _known(values, "reverb", REVERB_KEYS)
    preset = _choice(values, "preset", tuple(REVERB_PRESETS), "room")
    values.pop("preset", None)
    return reverb(preset, **values)


def delay_bus(settings: Mapping[str, Any] | None = None) -> Effect:
    """The delay bus from the mixer value; a missing setting takes the default the widget shows."""
    values = dict(settings or {})
    _known(values, "delay", DELAY_KEYS)
    return delay(
        time_ms=_optional_number(values, "time_ms"),
        note=str(values["note"]) if values.get("note") else None,
        bpm=_number_or(values, "bpm", DEFAULT_BPM),
        feedback=_number_or(values, "feedback", DEFAULT_FEEDBACK),
        lowpass_hz=_number_or(values, "lowpass_hz", DEFAULT_LOWPASS_HZ),
        seed=int(_number_or(values, "seed", 0)),
    )


def effects_for(buses: Mapping[str, Mapping[str, Any]] | None) -> dict[str, Effect]:
    """``{bus: effect}`` for every bus the mixer value configures (unknown buses are refused)."""
    builders = {"reverb": reverb_bus, "delay": delay_bus}
    effects: dict[str, Effect] = {}
    for name, settings in (buses or {}).items():
        if name not in builders:
            raise PlenioUserError(f"Unknown effect bus {name!r}; use one of {list(builders)}.")
        effects[name] = builders[name](settings)
    return effects


__all__ = [
    "DEFAULT_DELAY_MS",
    "DEFAULT_FEEDBACK",
    "DEFAULT_LOWPASS_HZ",
    "MAX_FEEDBACK",
    "NOTE_VALUES",
    "REVERB_PRESETS",
    "delay",
    "delay_bus",
    "effects_for",
    "impulse_response",
    "reverb",
    "reverb_bus",
]
