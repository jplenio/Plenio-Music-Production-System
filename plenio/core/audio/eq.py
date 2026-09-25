"""Parametric EQ: settings, RBJ biquads, response curves, filtering, and conservative tone matching.

Ported from the legacy toolkit v3.1.3 (``eq_config.py``, ``audio_eq.py``, ``audio_auto_eq.py``,
``audio_analysis.spectral_profile``; MIT, same author) with the schema renamed to ``plenio.eq/1``.
Formulas: W3C Audio EQ Cookbook (RBJ). The EQ never normalises hidden: the output is exactly the
filtered input times the preamp.
"""

from __future__ import annotations

import json
import math
from collections.abc import Mapping, Sequence
from typing import Any

import numpy as np

from ..dependencies import require
from ..errors import PlenioUserError, PlenioValidationError
from .signal import BLOCK, Cancel, as_channels, check_rate, gain, no_cancel, number

SCHEMA = "plenio.eq/1"
FILTER_TYPES = ("peak", "low_shelf", "high_shelf", "highpass", "lowpass", "notch")
GAIN_TYPES = ("peak", "low_shelf", "high_shelf")
MAX_BANDS = 8
FLAT: dict[str, Any] = {"schema": SCHEMA, "preamp_db": 0.0, "bands": []}
TILTS = {"warm": -0.75, "bright": 0.75}
"""Tone targets: a tilt in dB per octave around 1 kHz (legacy Warm/Bright tilt)."""


def parse_settings(value: Any, sample_rate: int | None = None) -> dict[str, Any]:
    """Validated EQ settings (a JSON string or a mapping); frequencies are limited to 0.45 x the rate."""
    if isinstance(value, str):
        if not value.strip():
            return dict(FLAT, bands=[])
        if len(value) > 65536:
            raise PlenioValidationError("The EQ settings exceed 64 KiB.")
        try:
            value = json.loads(value)
        except ValueError as error:
            raise PlenioValidationError("The EQ settings are not valid JSON.") from error
    if not isinstance(value, Mapping) or value.get("schema", SCHEMA) != SCHEMA:
        raise PlenioValidationError(f"The EQ settings must be an object with schema {SCHEMA!r}.")
    unknown = set(value) - {"schema", "preamp_db", "bands"}
    if unknown:
        raise PlenioValidationError(f"Unknown EQ settings fields: {sorted(unknown)}.")
    bands = value.get("bands", [])
    if not isinstance(bands, list) or len(bands) > MAX_BANDS:
        raise PlenioValidationError(f"The EQ takes a list of at most {MAX_BANDS} bands.")
    result: dict[str, Any] = {
        "schema": SCHEMA,
        "preamp_db": number(value.get("preamp_db", 0.0), "preamp_db", -24, 24),
        "bands": [],
    }
    ids: set[str] = set()
    upper = min(20000.0, 0.45 * sample_rate) if sample_rate else 20000.0
    for index, band in enumerate(bands):
        if not isinstance(band, Mapping) or set(band) - {
            "id",
            "enabled",
            "type",
            "frequency_hz",
            "gain_db",
            "q",
            "slope",
        }:
            raise PlenioValidationError(f"EQ band {index + 1} has unknown fields.")
        ident = band.get("id", f"band-{index + 1}")
        if not isinstance(ident, str) or not ident or len(ident) > 64 or ident in ids:
            raise PlenioValidationError("EQ band ids must be unique, non-empty and at most 64 characters.")
        ids.add(ident)
        kind, enabled = band.get("type", "peak"), band.get("enabled", True)
        if kind not in FILTER_TYPES:
            raise PlenioValidationError(f"Unknown EQ band type {kind!r}; use one of {list(FILTER_TYPES)}.")
        if not isinstance(enabled, bool):
            raise PlenioValidationError("An EQ band's 'enabled' must be true or false.")
        result["bands"].append(
            {
                "id": ident,
                "enabled": enabled,
                "type": kind,
                "frequency_hz": number(
                    band.get("frequency_hz", 1000),
                    f"band {index + 1} frequency_hz",
                    20,
                    upper if enabled else 20000,
                ),
                "gain_db": number(band.get("gain_db", 0.0), f"band {index + 1} gain_db", -12, 12),
                "q": number(band.get("q", 1 / math.sqrt(2)), f"band {index + 1} q", 0.2, 10),
                "slope": number(band.get("slope", 1.0), f"band {index + 1} slope", 0.25, 1),
            }
        )
    return result


def band_sos(band: Mapping[str, Any], rate: int) -> np.ndarray:
    """One normalised second-order section ``[b0, b1, b2, 1, a1, a2]`` (RBJ cookbook)."""
    w = 2 * math.pi * float(band["frequency_hz"]) / rate
    c, s = math.cos(w), math.sin(w)
    a = 10 ** (float(band["gain_db"]) / 40)
    alpha = s / (2 * float(band["q"]))
    kind = band["type"]
    den = [1 + alpha, -2 * c, 1 - alpha]
    if kind == "peak":
        num = [1 + alpha * a, -2 * c, 1 - alpha * a]
        den = [1 + alpha / a, -2 * c, 1 - alpha / a]
    elif kind == "lowpass":
        num = [(1 - c) / 2, 1 - c, (1 - c) / 2]
    elif kind == "highpass":
        num = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
    elif kind == "notch":
        num = [1, -2 * c, 1]
    else:  # shelves
        alpha = s / 2 * math.sqrt((a + 1 / a) * (1 / float(band["slope"]) - 1) + 2)
        v = 2 * math.sqrt(a) * alpha
        if kind == "low_shelf":
            num = [
                a * ((a + 1) - (a - 1) * c + v),
                2 * a * ((a - 1) - (a + 1) * c),
                a * ((a + 1) - (a - 1) * c - v),
            ]
            den = [(a + 1) + (a - 1) * c + v, -2 * ((a - 1) + (a + 1) * c), (a + 1) + (a - 1) * c - v]
        else:
            num = [
                a * ((a + 1) + (a - 1) * c + v),
                -2 * a * ((a - 1) + (a + 1) * c),
                a * ((a + 1) + (a - 1) * c - v),
            ]
            den = [(a + 1) - (a - 1) * c + v, 2 * ((a - 1) - (a + 1) * c), (a + 1) - (a - 1) * c - v]
    row = np.asarray(num + den, dtype=np.float64) / den[0]
    if not np.isfinite(row).all() or np.max(np.abs(np.roots(row[3:]))) >= 1:
        raise PlenioValidationError(f"The EQ band {band.get('id', '')!r} is unstable at {rate} Hz.")
    return row


def design_sos(settings: Any, rate: int) -> np.ndarray:
    """Sections of the enabled bands that change the sound (gain bands at 0 dB are skipped)."""
    rate = check_rate(rate)
    parsed = parse_settings(settings, rate)
    rows = [
        band_sos(b, rate)
        for b in parsed["bands"]
        if b["enabled"] and (b["type"] not in GAIN_TYPES or b["gain_db"] != 0)
    ]
    return np.asarray(rows, dtype=np.float64).reshape(-1, 6)


def is_flat(settings: Any, rate: int) -> bool:
    return not len(design_sos(settings, rate)) and parse_settings(settings, rate)["preamp_db"] == 0


def response_db(settings: Any, rate: int, frequencies: Sequence[float] | np.ndarray) -> np.ndarray:
    """Magnitude response in dB (preamp included) at ``frequencies``."""
    grid = np.asarray(frequencies, dtype=np.float64)
    sos = design_sos(settings, rate)
    if len(sos):
        signal = require("scipy.signal")
        h = signal.sosfreqz(sos, worN=grid, fs=rate)[1]
    else:
        h = np.ones_like(grid)
    preamp = float(parse_settings(settings, rate)["preamp_db"])
    return np.asarray(20 * np.log10(np.maximum(np.abs(h), 1e-15)) + preamp, dtype=np.float64)


def display_grid(rate: int, points: int = 256) -> np.ndarray:
    return np.geomspace(20, min(20000, rate * 0.45), points)


def apply(samples: Any, rate: int, settings: Any, *, cancel: Cancel = no_cancel) -> np.ndarray:
    """Filtered audio; flat settings return the input unchanged (bit-identical)."""
    rate = check_rate(rate)
    data = as_channels(samples)
    sos = design_sos(settings, rate)
    preamp = gain(parse_settings(settings, rate)["preamp_db"])
    if not len(sos) and preamp == 1.0:
        return data
    signal = require("scipy.signal")
    out = np.empty_like(data)
    state = np.zeros((len(sos), data.shape[0], 2))
    for start in range(0, data.shape[1], BLOCK):
        cancel()
        block = data[:, start : start + BLOCK] * preamp
        if len(sos):
            block, state = signal.sosfilt(sos, block, axis=-1, zi=state)
        out[:, start : start + block.shape[1]] = block
    return out


# --- tone matching -------------------------------------------------------------------------


def spectral_profile(
    samples: Any, rate: int, grid: np.ndarray | None = None, *, cancel: Cancel = no_cancel
) -> dict[str, Any]:
    """Welch mean power per channel with a per-frame silence gate, smoothed to 1/6 octave, on a log grid."""
    ndimage = require("scipy.ndimage")
    data = as_channels(samples)
    grid = display_grid(rate) if grid is None else np.asarray(grid, dtype=np.float64)
    size = min(8192, data.shape[1])
    hop = max(1, size // 2)
    window = np.hanning(size)
    power = np.zeros(size // 2 + 1)
    sum_db = np.zeros_like(power)
    sum_db2 = np.zeros_like(power)
    count = total = 0
    norm = rate * max(float(np.dot(window, window)), 1e-20)
    for start in range(0, data.shape[1] - size + 1, hop):
        if total % 64 == 0:
            cancel()
        frame = data[:, start : start + size]
        total += 1
        if np.mean(frame * frame) < 1e-10:  # -100 dBFS RMS: silence, not a loudness gate
            continue
        spectrum = np.fft.rfft(frame * window, axis=-1)
        psd = np.mean(np.abs(spectrum) ** 2, axis=0) / norm
        psd[1:-1] *= 2
        power += psd
        level = 10 * np.log10(np.maximum(psd, 1e-20))
        sum_db += level
        sum_db2 += level * level
        count += 1
    freqs = np.fft.rfftfreq(size, 1 / rate)
    mean = power / max(count, 1)
    level = np.interp(grid, freqs, 10 * np.log10(np.maximum(mean, 1e-20)))
    sigma = max(0.5, (math.log(2) / 6) / math.log(grid[1] / grid[0]) / 2.355)
    level = ndimage.gaussian_filter1d(level, sigma=sigma, mode="nearest")
    variance = np.maximum(0, sum_db2 / max(count, 1) - (sum_db / max(count, 1)) ** 2)
    spread = np.interp(grid, freqs, np.sqrt(variance))
    evidence = (level > max(-130, float(np.max(level)) - 50)) & (grid >= 2 * rate / size)
    confidence = np.where(evidence, 1 / (1 + spread / 20), 0.0) if count >= 4 else np.zeros_like(grid)
    return {
        "frequency_hz": grid,
        "power_db": level,
        "confidence": confidence,
        "active_frames": count,
        "valid": bool(count >= 4 and np.count_nonzero(confidence) >= 12),
    }


def tilt_target(source: Mapping[str, Any], tone: str) -> dict[str, Any]:
    if tone not in TILTS:
        raise PlenioUserError(f"Unknown tone target {tone!r}; use one of {sorted(TILTS)}.")
    grid = np.asarray(source["frequency_hz"])
    return dict(source, power_db=np.asarray(source["power_db"]) + TILTS[tone] * np.log2(grid / 1000))


def fit(
    source: Mapping[str, Any],
    target: Mapping[str, Any],
    rate: int,
    *,
    strength: float = 0.5,
    max_gain_db: float = 3.0,
    max_bands: int = 6,
    min_hz: float = 40.0,
    max_hz: float = 16000.0,
    cancel: Cancel = no_cancel,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Peak bands that move ``source``'s tone towards ``target`` (loudness removed), bounded by ``max_gain_db``.

    Greedy: each round adds a band at the largest weighted remaining difference, then least-squares
    refines all bands; a round is kept only if it lowers the weighted error and the summed response
    stays within the bound on a dense grid.
    """
    optimize = require("scipy.optimize")
    grid = np.asarray(source["frequency_hz"])
    weights = np.minimum(source["confidence"], target["confidence"])
    weights = np.where((grid >= min_hz) & (grid <= min(max_hz, rate * 0.45)), weights, 0)
    flat = dict(FLAT, bands=[])
    if not source["valid"] or not target["valid"] or np.count_nonzero(weights) < 12:
        return flat, {
            "accepted": False,
            "reason": "not enough reliable spectrum (silence, short or narrow-band audio)",
        }
    mask = weights > 0
    delta = np.asarray(target["power_db"]) - np.asarray(source["power_db"])
    delta = delta - np.median(delta[mask])  # tone only, not loudness
    desired = np.where(mask, np.clip(delta * strength, -max_gain_db, max_gain_db), 0)
    objective = np.where(mask, weights, 0.25)
    initial = float(np.average(desired**2, weights=objective))
    if initial < 0.0025 or strength == 0:
        return flat, {
            "accepted": True,
            "reason": "already matched",
            "before_error_db": initial**0.5,
            "after_error_db": initial**0.5,
        }

    def settings_of(params: Sequence[float]) -> dict[str, Any]:
        bands = [
            {
                "id": f"match-{i // 3 + 1}",
                "type": "peak",
                "enabled": True,
                "frequency_hz": float(np.exp(params[i])),
                "gain_db": float(params[i + 1]),
                "q": float(np.exp(params[i + 2])),
            }
            for i in range(0, len(params), 3)
        ]
        return parse_settings({"schema": SCHEMA, "preamp_db": 0, "bands": bands}, rate)

    valid_grid = grid[mask]
    lower, upper = max(20.0, float(valid_grid[0])), min(float(valid_grid[-1]), 0.45 * rate)
    dense = np.geomspace(20, min(20000, rate * 0.45), 2048)
    params: list[float] = []
    best, best_error = flat, initial
    for _ in range(max_bands):
        cancel()
        remaining = desired - response_db(best, rate, grid)
        index = int(np.argmax(np.abs(remaining) * weights))
        if abs(remaining[index]) < 0.15:
            break
        params.extend(
            [
                math.log(float(np.clip(grid[index], lower, upper))),
                float(np.clip(remaining[index], -max_gain_db, max_gain_db)),
                0.0,
            ]
        )
        count = len(params) // 3

        def residual(p: np.ndarray) -> np.ndarray:
            curve = response_db(settings_of(p.tolist()), rate, grid)
            return np.asarray(np.r_[np.sqrt(objective) * (curve - desired), 0.05 * np.asarray(p)[1::3]])

        result = optimize.least_squares(
            residual,
            params,
            bounds=(
                np.tile([math.log(lower), -max_gain_db, math.log(0.3)], count),
                np.tile([math.log(upper), max_gain_db, math.log(2.0)], count),
            ),
            max_nfev=100,
        )
        candidate = settings_of(result.x.tolist())
        for _shrink in range(8):  # summed bands may exceed the bound
            extent = float(np.max(np.abs(response_db(candidate, rate, dense))))
            if extent <= max_gain_db + 1e-6:
                break
            for band in candidate["bands"]:
                band["gain_db"] *= max_gain_db / extent * 0.99
        extent = float(np.max(np.abs(response_db(candidate, rate, dense))))
        error = float(np.average((response_db(candidate, rate, grid) - desired) ** 2, weights=objective))
        if error >= best_error or extent > max_gain_db + 1e-5:
            break
        best, best_error = candidate, error
        params = [
            v for b in best["bands"] for v in (math.log(b["frequency_hz"]), b["gain_db"], math.log(b["q"]))
        ]
    return best, {
        "accepted": best_error < initial,
        "before_error_db": round(initial**0.5, 3),
        "after_error_db": round(best_error**0.5, 3),
        "bands": len(best["bands"]),
    }
