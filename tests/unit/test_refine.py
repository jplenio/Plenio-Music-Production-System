"""Refine (48 kHz) core (next-release plan §4): contracts of the DSP around an injected engine.

Real engines are validated on the owner's machine (L1); here fakes stand in for them.
"""

from __future__ import annotations

import numpy as np
import pytest

from plenio.core.audio import refine as r
from plenio.core.audio.loudness import measure
from plenio.core.audio.resample import output_frames, resample
from plenio.core.errors import PlenioUserError

RNG = np.random.default_rng(7)


def tone(freq: float, rate: int, seconds: float = 1.0, level: float = 0.25) -> np.ndarray:
    t = np.arange(int(rate * seconds)) / rate
    return level * np.sin(2 * np.pi * freq * t)[None, :]


def band_limited_noise(rate: int, edge_hz: float, seconds: float = 3.0, channels: int = 2) -> np.ndarray:
    noise = RNG.standard_normal((channels, int(rate * seconds))) * 0.1
    return r.filter_zero_delay(noise, r.lowpass_kernel(rate, edge_hz, 400.0))


class RepeatEngine:
    """Pointwise 2x upsampling at 24 kHz: chunk-independent, so overlap-add must be exact."""

    name = "repeat"
    input_rate = 24000
    condition_hz = 11000.0
    chunk_seconds = 0.25
    overlap_seconds = 0.05

    def __init__(self) -> None:
        self.seeds: list[int] = []

    def upsample(self, chunk: np.ndarray, seed: int) -> np.ndarray:
        self.seeds.append(seed)
        return np.repeat(chunk, 2, axis=1)


class NoiseEngine(RepeatEngine):
    """Adds seeded high-band noise, like a generative model would."""

    name = "noise"

    def upsample(self, chunk: np.ndarray, seed: int) -> np.ndarray:
        noise = np.random.default_rng(seed).standard_normal((chunk.shape[0], chunk.shape[1] * 2)) * 0.01
        return np.repeat(chunk, 2, axis=1) + noise


class BrokenEngine(RepeatEngine):
    def upsample(self, chunk: np.ndarray, seed: int) -> np.ndarray:
        return chunk


# --- filters ----------------------------------------------------------------------------------


def test_the_complementary_crossover_sums_to_the_identity() -> None:
    x = RNG.standard_normal((2, 48000)) * 0.3
    for cutoff in (4000.0, 11500.0, 15500.0, 21000.0):
        assert np.max(np.abs(r.crossover(x, x, 48000, cutoff) - x)) < 1e-9


def test_the_crossover_keeps_the_original_below_and_takes_the_model_above() -> None:
    low, high = tone(1000, 48000), tone(18000, 48000)
    out = r.crossover(low, high, 48000, 12000.0)
    spectrum = np.abs(np.fft.rfft(out[0, 4800:-4800]))
    freqs = np.fft.rfftfreq(out.shape[1] - 9600, 1 / 48000)
    peak_low = spectrum[np.argmin(np.abs(freqs - 1000))]
    peak_high = spectrum[np.argmin(np.abs(freqs - 18000))]
    assert peak_high / peak_low == pytest.approx(1.0, rel=1e-3)
    silent = r.crossover(low, high, 48000, 12000.0, gain=0.0)
    assert np.max(np.abs(silent[:, 4800:-4800] - low[:, 4800:-4800])) < 1e-4


def test_lowpass_kernel_response() -> None:
    kernel = r.lowpass_kernel(48000, 12000.0)
    assert kernel.size % 2 == 1 and np.allclose(kernel, kernel[::-1])
    response = np.abs(np.fft.rfft(kernel, 1 << 16))
    freqs = np.fft.rfftfreq(1 << 16, 1 / 48000)

    def db(f: float) -> float:
        return float(20 * np.log10(response[np.argmin(np.abs(freqs - f))]))

    assert abs(db(1000)) < 0.01 and abs(db(11400)) < 0.01
    assert db(12000) == pytest.approx(-6.02, abs=0.1)
    assert db(12600) < -85 and db(20000) < -85
    with pytest.raises(PlenioUserError):
        r.lowpass_kernel(48000, 24000.0)


def test_bandwidth_measurement() -> None:
    edge = r.measure_bandwidth(band_limited_noise(44100, 12000.0), 44100)
    assert edge is not None and 11500 <= edge <= 12800
    assert r.measure_bandwidth(np.zeros((2, 44100)), 44100) is None
    assert r.measure_bandwidth(np.ones((1, 100)), 44100) is None  # too short


# --- chunked engine ---------------------------------------------------------------------------


@pytest.mark.parametrize("frames", [100, 6000, 6001, 24000, 60017])
def test_overlap_add_is_seamless(frames: int) -> None:
    x = RNG.standard_normal((2, frames))
    engine = RepeatEngine()
    out = r.run_chunked(x, engine, seed=5)
    assert out.shape == (2, output_frames(frames, 24000, 48000))
    assert np.max(np.abs(out - np.repeat(x, 2, axis=1))) < 1e-12
    assert engine.seeds == list(range(5, 5 + len(engine.seeds)))


def test_seeds_make_the_model_deterministic() -> None:
    x = RNG.standard_normal((1, 30000))
    a = r.run_chunked(x, NoiseEngine(), seed=1)
    assert np.array_equal(a, r.run_chunked(x, NoiseEngine(), seed=1))
    assert not np.array_equal(a, r.run_chunked(x, NoiseEngine(), seed=2))


def test_an_engine_with_the_wrong_output_is_refused() -> None:
    with pytest.raises(PlenioUserError, match="returned"):
        r.run_chunked(RNG.standard_normal((1, 30000)), BrokenEngine())


# --- the stage --------------------------------------------------------------------------------


@pytest.mark.parametrize("rate", [32000, 44100, 48000])
def test_resample_only_is_exactly_the_resampler(rate: int) -> None:
    x = band_limited_noise(rate, 14000.0, seconds=1.5)
    out, report = r.refine(x, rate)
    assert np.array_equal(out, resample(x, rate, 48000))
    assert out.shape[1] == output_frames(x.shape[1], rate, 48000)
    assert report["engine"] == "resample only" and report["crossover_hz"] is None


def test_model_refinement_keeps_the_band_below_the_crossover_and_the_duration() -> None:
    rate = 44100
    x = band_limited_noise(rate, 14500.0)
    out, report = r.refine(x, rate, NoiseEngine(), r.RefineSettings(seed=3))
    assert out.shape == (2, output_frames(x.shape[1], rate, 48000))
    original = resample(x, rate, 48000)
    kernel = r.lowpass_kernel(48000, 9000.0)
    below = r.filter_zero_delay(out - original, kernel)
    assert np.max(np.abs(below[:, 2000:-2000])) < 1e-3  # nothing below the crossover changed
    assert report["engine"] == "noise" and report["provisional_defaults"] is True
    assert 13500 <= report["bandwidth_in_hz"] <= 15000
    assert report["crossover_hz"] == pytest.approx(report["bandwidth_in_hz"] - 500, abs=0.1)
    assert report["pre_hz"] == 11000.0 and report["seed"] == 3
    measured = measure(out, 48000, with_true_peak=False).integrated_lufs
    reference = measure(original, 48000, with_true_peak=False).integrated_lufs
    assert report["loudness_change_lu"] == pytest.approx(measured - reference, abs=1e-3)
    again, _ = r.refine(x, rate, NoiseEngine(), r.RefineSettings(seed=3))
    assert np.array_equal(out, again)


def test_a_full_band_input_keeps_everything_below_the_crossover() -> None:
    """The model always runs when it is connected (owner's decision, 2026-09-28): for an input that is
    already full band, only what lies above the crossover comes from the model."""
    full = RNG.standard_normal((2, 48000 * 2)) * 0.1
    crossover = 21500.0
    out, report = r.refine(full, 48000, NoiseEngine(), r.RefineSettings(crossover_hz=crossover))
    assert report["engine"] == "noise"  # the engine ran, nothing was skipped
    assert "already reaches" in report["notes"][0] and "21.5 kHz" in report["notes"][0]
    assert report["crossover_hz"] == crossover
    assert out.shape == full.shape
    # below the crossover the output is the original: what is left there is the crossover filter's own
    # arithmetic (~1.5e-6, about -116 dBFS), not the model
    kernel = r.lowpass_kernel(48000, crossover - 1500.0)
    below = r.filter_zero_delay(out - full, kernel)
    assert np.max(np.abs(below[:, 5000:-5000])) < 1e-5
    # above it, the model's content is in: the bands differ
    high = full - r.filter_zero_delay(full, kernel)
    assert np.max(np.abs((out - full)[:, 5000:-5000])) > np.max(np.abs(high)) * 0.01


def test_a_silent_input_is_only_resampled() -> None:
    silent, report = r.refine(np.zeros((1, 44100)), 44100, NoiseEngine())
    assert not silent.any() and "silent" in report["notes"][0]


def test_post_rolloff_and_settings_are_checked() -> None:
    x = band_limited_noise(44100, 12000.0)
    out, report = r.refine(x, 44100, NoiseEngine(), r.RefineSettings(post_hz=19000.0, crossover_hz=11000.0))
    assert report["post_hz"] == 19000.0 and report["crossover_hz"] == 11000.0
    assert r.measure_bandwidth(out, 48000) < 19800
    with pytest.raises(PlenioUserError):
        r.refine(x, 44100, NoiseEngine(), r.RefineSettings(sr_gain=5.0))
