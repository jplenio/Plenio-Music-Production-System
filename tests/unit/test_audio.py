"""DSP regression suite: loudness (BS.1770 / EBU Tech 3341, 3342), true peak, resampling, EQ,
tone matching, compressor, limiter, the mastering chain and presets.

References: analytic filter responses, the BS.1770 48 kHz coefficient table, EBU test cases,
``pyloudnorm`` (DeMan filters) as oracle, and golden outputs of the legacy toolkit's DSP
(``tests/fixtures/dsp``, made by ``tools/studies/golden_legacy_dsp.py``).
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pytest

from plenio.core.audio import eq, loudness
from plenio.core.audio.dynamics import Compressor, Target, compress, limit, master, soft_knee_reduction_db
from plenio.core.audio.presets import Library
from plenio.core.audio.resample import output_frames, resample
from plenio.core.errors import PlenioUserError, PlenioValidationError

ROOT = Path(__file__).resolve().parents[2]
GOLDEN = ROOT / "tests" / "fixtures" / "dsp"
PRESETS = Library(ROOT / "resources" / "presets")


def sine(
    frequency: float, seconds: float, rate: int, amplitude: float = 1.0, phase: float = 0.0
) -> np.ndarray:
    t = np.arange(int(round(seconds * rate))) / rate
    return amplitude * np.sin(2 * np.pi * frequency * t + phase)


def stereo(signal: np.ndarray) -> np.ndarray:
    return np.vstack([signal, signal])


def dbfs(level: float) -> float:
    return 10 ** (level / 20)


def music(seconds: float = 12.0, rate: int = 44100, seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    t = np.arange(int(seconds * rate)) / rate
    body = 0.2 * np.sin(2 * np.pi * 110 * t) * (1 + 0.5 * np.sin(2 * np.pi * 0.5 * t))
    return np.vstack([body, body]) + 0.05 * rng.standard_normal((2, t.size))


# --- loudness -------------------------------------------------------------------------------------


def test_k_weighting_matches_the_bs1770_table_at_48k() -> None:
    sos = loudness.k_weighting(48000)
    shelf = [1.53512485958697, -2.69169618940638, 1.19839281085285, 1.0, -1.69065929318241, 0.73248077421585]
    highpass = [1.0, -2.0, 1.0, 1.0, -1.99004745483398, 0.99007225036621]
    np.testing.assert_allclose(sos[0], shelf, atol=1e-10)
    np.testing.assert_allclose(sos[1], highpass, atol=1e-10)


def test_full_scale_997_hz_sine_is_minus_3_01_lufs() -> None:
    assert loudness.measure(sine(997, 5, 48000), 48000).integrated_lufs == pytest.approx(-3.01, abs=0.01)
    both = loudness.measure(stereo(sine(997, 5, 48000)), 48000).integrated_lufs
    assert both == pytest.approx(0.0, abs=0.01)


@pytest.mark.parametrize("rate", [44100, 48000])
def test_ebu_3341_cases(rate: int) -> None:
    # case 1: stereo 1 kHz at -23 dBFS -> -23 LUFS; case 2: -33 dBFS -> -33 LUFS
    for level in (-23.0, -33.0):
        result = loudness.measure(stereo(sine(1000, 20, rate, dbfs(level))), rate)
        assert result.integrated_lufs == pytest.approx(level, abs=0.1)
    # case 3: -36, -23, -36 dBFS for 10, 60, 10 s -> -23 LUFS (relative gate)
    parts = [sine(1000, s, rate, dbfs(v)) for s, v in ((10, -36), (60, -23), (10, -36))]
    assert loudness.measure(stereo(np.concatenate(parts)), rate).integrated_lufs == pytest.approx(
        -23.0, abs=0.1
    )
    # case 5: -26, -20, -26 dBFS for 20, 20.1, 20 s -> -23 LUFS
    parts = [sine(1000, s, rate, dbfs(v)) for s, v in ((20, -26), (20.1, -20), (20, -26))]
    assert loudness.measure(stereo(np.concatenate(parts)), rate).integrated_lufs == pytest.approx(
        -23.0, abs=0.1
    )


@pytest.mark.parametrize("rate", [22050, 32000, 44100, 48000, 88200, 96000])
def test_integrated_loudness_equals_pyloudnorm(rate: int) -> None:
    pyln = pytest.importorskip("pyloudnorm")
    rng = np.random.default_rng(rate)
    x = np.vstack([sine(997, 6, rate, 0.3), 0.2 * rng.standard_normal(int(6 * rate))])
    y = np.concatenate(
        [x[:, : x.shape[1] // 2], 0.01 * x[:, x.shape[1] // 2 :]], axis=1
    )  # exercises the gates
    for data in (x, y):
        oracle = pyln.Meter(rate, filter_class="DeMan").integrated_loudness(data.T)
        assert loudness.measure(data, rate).integrated_lufs == pytest.approx(oracle, abs=0.01)


def faded(x: np.ndarray, rate: int) -> np.ndarray:
    """Raised-cosine fades (0.1 s): an abruptly starting sine overshoots at its edges (real inter-sample peaks)."""
    ramp = int(0.1 * rate)
    envelope = np.ones(x.shape[-1])
    envelope[:ramp] = 0.5 - 0.5 * np.cos(np.pi * np.arange(ramp) / ramp)
    envelope[-ramp:] = envelope[:ramp][::-1]
    return x * envelope


@pytest.mark.parametrize("rate", [44100, 48000])
def test_true_peak_finds_inter_sample_peaks(rate: int) -> None:
    x = faded(
        sine(rate / 8, 1, rate, 1.0, math.pi / 8), rate
    )  # samples at most sin(3 pi / 8) = 0.924; the waveform reaches 1
    result = loudness.measure(x, rate)
    assert result.sample_peak_dbfs == pytest.approx(20 * math.log10(math.sin(3 * math.pi / 8)), abs=0.01)
    assert result.true_peak_dbtp == pytest.approx(0.0, abs=0.02)
    quarter = loudness.measure(
        faded(sine(rate / 4, 1, rate, 1.0, math.pi / 4), rate), rate
    )  # samples at +-0.707
    assert quarter.sample_peak_dbfs == pytest.approx(-3.01, abs=0.01)
    assert quarter.true_peak_dbtp == pytest.approx(0.0, abs=0.02)


def test_true_peak_is_optional_for_speed() -> None:
    result = loudness.measure(music(2.0), 44100, with_true_peak=False)
    assert result.true_peak_dbtp is None and result.integrated_lufs is not None


def test_loudness_range() -> None:
    rate = 48000
    steady = loudness.measure(stereo(sine(1000, 30, rate, dbfs(-20))), rate)
    assert steady.loudness_range_lu == pytest.approx(0.0, abs=0.1)
    # EBU Tech 3342 case 1: 20 s at -20 dBFS then 20 s at -30 dBFS -> LRA 10 LU (+-1)
    x = np.concatenate([sine(1000, 20, rate, dbfs(-20)), sine(1000, 20, rate, dbfs(-30))])
    assert loudness.measure(stereo(x), rate).loudness_range_lu == pytest.approx(10.0, abs=1.0)


def test_silence_and_short_audio_are_not_measurable() -> None:
    silent = loudness.measure(np.zeros((2, 48000)), 48000)
    assert not silent.valid and silent.integrated_lufs is None and silent.to_dict()["valid"] is False
    short = loudness.measure(sine(1000, 0.3, 48000), 48000)
    assert short.integrated_lufs is None and short.true_peak_dbtp is not None


@pytest.mark.parametrize(
    ("samples", "rate", "message"),
    [
        (np.zeros((3, 100)), 48000, "mono or stereo"),
        (np.array([[0.0, np.nan]]), 48000, "NaN"),
        (np.zeros((2, 100)), 4000, "Sample rates from"),
        (np.zeros((2, 100)), 44100.5, "whole number"),
    ],
)
def test_measure_refuses_bad_audio(samples: np.ndarray, rate: float, message: str) -> None:
    with pytest.raises(PlenioUserError, match=message):
        loudness.measure(samples, rate)  # type: ignore[arg-type]


# --- resampling -------------------------------------------------------------------------------------


def test_resample_identity_and_length() -> None:
    x = music(1.0)
    assert resample(x, 44100, 44100) is x
    y = resample(x, 44100, 48000)
    assert y.shape == (2, output_frames(x.shape[1], 44100, 48000)) == (2, 48000)


def test_resample_passband_and_stopband() -> None:
    passband = resample(sine(1000, 2, 44100, 0.5)[None, :], 44100, 48000)[0, 4800:-4800]
    assert 20 * math.log10(np.max(np.abs(passband)) / 0.5) == pytest.approx(0.0, abs=0.01)
    # a 23 kHz tone cannot exist at 44.1 kHz: it must be removed, not aliased to 21.1 kHz
    alias = resample(sine(23000, 2, 48000, 0.5)[None, :], 48000, 44100)[0, 4410:-4410]
    assert 20 * math.log10(max(float(np.max(np.abs(alias))), 1e-12) / 0.5) < -80


# --- EQ ----------------------------------------------------------------------------------------------


def band(
    kind: str, frequency: float, gain_db: float = 0.0, q: float = 0.7071, slope: float = 1.0
) -> dict[str, object]:
    return {
        "id": kind,
        "type": kind,
        "frequency_hz": frequency,
        "gain_db": gain_db,
        "q": q,
        "slope": slope,
        "enabled": True,
    }


def settings(*bands: dict[str, object], preamp: float = 0.0) -> dict[str, object]:
    return {"schema": eq.SCHEMA, "preamp_db": preamp, "bands": list(bands)}


@pytest.mark.parametrize("rate", [44100, 48000])
def test_analytic_band_responses(rate: int) -> None:
    peak = settings(band("peak", 1000, 6, q=1.0))
    assert eq.response_db(peak, rate, [1000])[0] == pytest.approx(6.0, abs=0.01)
    assert eq.response_db(peak, rate, [40])[0] == pytest.approx(0.0, abs=0.05)
    low = settings(band("low_shelf", 200, -4))
    assert eq.response_db(low, rate, [20])[0] == pytest.approx(-4.0, abs=0.1)
    assert eq.response_db(low, rate, [200])[0] == pytest.approx(-2.0, abs=0.05)  # half the gain at fc
    assert eq.response_db(low, rate, [10000])[0] == pytest.approx(0.0, abs=0.05)
    high = settings(band("high_shelf", 6000, 3))
    assert eq.response_db(high, rate, [19000])[0] == pytest.approx(3.0, abs=0.2)
    hp = settings(band("highpass", 100))
    assert eq.response_db(hp, rate, [100])[0] == pytest.approx(-3.01, abs=0.02)
    assert eq.response_db(hp, rate, [25])[0] < -20
    lp = settings(band("lowpass", 5000))
    assert eq.response_db(lp, rate, [5000])[0] == pytest.approx(-3.01, abs=0.02)
    notch = settings(band("notch", 60, q=4))
    assert eq.response_db(notch, rate, [60])[0] < -60
    assert eq.response_db(settings(preamp=-2.5), rate, [1000])[0] == pytest.approx(-2.5)


def test_filtering_follows_the_predicted_response() -> None:
    rate = 48000
    curve = settings(band("peak", 2000, -5, q=1.5), band("high_shelf", 8000, 2), preamp=-1)
    for frequency in (200.0, 2000.0, 9000.0):
        x = sine(frequency, 1.0, rate, 0.5)[None, :]
        y = eq.apply(x, rate, curve)[0, rate // 2 :]
        measured = 20 * math.log10(np.sqrt(np.mean(y * y)) / np.sqrt(np.mean(x[0, rate // 2 :] ** 2)))
        assert measured == pytest.approx(eq.response_db(curve, rate, [frequency])[0], abs=0.05)


def test_flat_eq_is_bit_identical_and_blocks_are_seamless() -> None:
    x = music(1.0)
    assert eq.apply(x, 44100, settings()) is not None
    np.testing.assert_array_equal(eq.apply(x, 44100, settings()), x)
    assert eq.is_flat(settings(band("peak", 1000, 0.0)), 44100)
    curve = settings(band("peak", 300, 4))
    long = music(3.0)  # longer than one processing block
    whole = eq.apply(long, 44100, curve)
    halves = np.concatenate([eq.apply(long[:, :70000], 44100, curve), np.zeros((2, 0))], axis=1)
    np.testing.assert_allclose(whole[:, :70000], halves, atol=1e-12)


@pytest.mark.parametrize(
    ("value", "message"),
    [
        ("{bad json", "not valid JSON"),
        ({"schema": "other/1"}, "must be an object with schema"),
        ({"schema": eq.SCHEMA, "extra": 1}, "Unknown EQ settings fields"),
        (settings(*[band("peak", 100 * (i + 1), 1) | {"id": f"b{i}"} for i in range(9)]), "at most 8 bands"),
        (settings(band("peak", 1000, 20)), "gain_db must be between -12 and 12"),
        (settings(band("wobble", 1000)), "Unknown EQ band type"),
        (settings(band("peak", 1000), band("peak", 2000)), "unique"),
        (settings(band("peak", 30000)), "frequency_hz must be between 20 and"),
    ],
)
def test_eq_settings_are_validated(value: object, message: str) -> None:
    with pytest.raises((PlenioValidationError, PlenioUserError), match=message):
        eq.design_sos(value, 44100)


def test_empty_settings_string_is_flat_and_frequencies_follow_the_rate() -> None:
    assert eq.parse_settings("")["bands"] == []
    with pytest.raises(PlenioUserError, match="between 20 and 9922.5"):
        eq.parse_settings(settings(band("peak", 12000, 2)), 22050)


def test_shipped_eq_presets_are_valid() -> None:
    for name in PRESETS.eq_names():
        eq.design_sos(PRESETS.eq_settings(name), 44100)
    assert PRESETS.eq_names()[0] == "Flat" and PRESETS.eq_settings("Flat")["bands"] == []
    for name in PRESETS.match_names():
        assert PRESETS.match(name)["target"] in ("warm", "bright", "reference")


def test_tone_match_is_bounded_and_improves() -> None:
    rate = 44100
    x = music(6.0, rate)
    source = eq.spectral_profile(x, rate)
    target = eq.tilt_target(source, "warm")
    proposal, report = eq.fit(source, target, rate, strength=0.5, max_gain_db=2.0, max_bands=4)
    assert report["accepted"] and report["after_error_db"] < report["before_error_db"]
    assert 1 <= len(proposal["bands"]) <= 4
    assert float(np.max(np.abs(eq.response_db(proposal, rate, np.geomspace(20, 19000, 2048))))) <= 2.0 + 1e-5
    silent = eq.spectral_profile(np.zeros((2, rate)), rate)
    flat, refused = eq.fit(silent, silent, rate)
    assert flat["bands"] == [] and refused["accepted"] is False
    with pytest.raises(PlenioUserError, match="Unknown tone target"):
        eq.tilt_target(source, "shiny")


# --- dynamics -----------------------------------------------------------------------------------------


def test_static_compression_curve() -> None:
    assert soft_knee_reduction_db(-30, -20, 4, 0) == 0
    assert soft_knee_reduction_db(-10, -20, 4, 0) == pytest.approx(-7.5)
    assert soft_knee_reduction_db(-20, -20, 4, 6) == pytest.approx(-0.5625)  # inside the knee
    assert soft_knee_reduction_db(-26, -20, 4, 6) == 0.0


def test_steady_compression_approaches_the_static_curve() -> None:
    rate = 48000
    x = stereo(sine(1000, 2, rate, dbfs(-6)))  # RMS level -9 dBFS
    settings_ = Compressor(threshold_db=-21, ratio=3, knee_db=0, attack_ms=5, release_ms=50, sidechain_hz=0)
    y, report = compress(x, rate, settings_)
    expected = soft_knee_reduction_db(-6 - 3.01, -21, 3, 0)
    tail = 20 * math.log10(np.max(np.abs(y[:, -rate // 4 :])) / dbfs(-6))
    assert tail == pytest.approx(expected, abs=0.1)
    assert report["max_reduction_db"] == pytest.approx(-expected, abs=0.1) and report["enabled"] is True
    with pytest.raises(PlenioUserError, match="ratio must be between 1 and 10"):
        compress(x, rate, Compressor(ratio=20))
    with pytest.raises(PlenioUserError, match="Unknown compressor detector"):
        compress(x, rate, Compressor(detector="LUFS"))


def test_limiter_holds_the_true_peak_ceiling() -> None:
    rate = 44100
    x = music(4.0, rate) * 3  # far over full scale
    y, report = limit(x, rate, ceiling_dbtp=-1.0)
    measured = loudness.measure(y, rate)
    assert measured.true_peak_dbtp is not None and measured.true_peak_dbtp <= -1.0 + 0.05
    assert report["max_reduction_db"] > 2


def golden() -> tuple[dict[str, np.ndarray], dict[str, object]]:
    data = np.load(GOLDEN / "golden-legacy-dsp.npz")
    meta = json.loads((GOLDEN / "golden-legacy-dsp.json").read_text(encoding="utf-8"))
    return {k: data[k] for k in data.files}, meta


def golden_signal() -> np.ndarray:
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "golden_tool", ROOT / "tools" / "studies" / "golden_legacy_dsp.py"
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return np.asarray(module.test_signal(), dtype=np.float64)


def test_port_matches_the_legacy_eq_compressor_and_limiter() -> None:
    outputs, meta = golden()
    x, rate = golden_signal(), int(meta["rate"])  # type: ignore[call-overload]
    legacy_eq = dict(meta["eq_settings"], schema=eq.SCHEMA)  # type: ignore[arg-type]
    np.testing.assert_allclose(eq.apply(x, rate, legacy_eq), outputs["eq"], atol=2e-6)
    rms = Compressor(**{k: v for k, v in meta["compress_rms"].items()})  # type: ignore[union-attr]
    np.testing.assert_allclose(compress(x, rate, rms)[0], outputs["compress_rms"], atol=2e-6)
    peak = Compressor(**{k: v for k, v in meta["compress_peak"].items()})  # type: ignore[union-attr]
    np.testing.assert_allclose(compress(x, rate, peak)[0], outputs["compress_peak"], atol=2e-6)
    np.testing.assert_allclose(limit(x, rate, **meta["limit"])[0], outputs["limit"], atol=2e-6)  # type: ignore[arg-type]
    np.testing.assert_allclose(eq.spectral_profile(x, rate)["power_db"], outputs["profile_power"], atol=1e-4)


def test_port_matches_the_legacy_tone_match() -> None:
    _outputs, meta = golden()
    x, rate = golden_signal(), int(meta["rate"])  # type: ignore[call-overload]
    source = eq.spectral_profile(x, rate)
    proposal, report = eq.fit(
        source, eq.tilt_target(source, "warm"), rate, strength=0.5, max_gain_db=3.0, max_bands=4
    )
    legacy = meta["fit_settings"]["bands"]  # type: ignore[index]
    assert len(proposal["bands"]) == len(legacy)
    for ours, theirs in zip(proposal["bands"], legacy, strict=True):
        assert ours["frequency_hz"] == pytest.approx(theirs["frequency_hz"], rel=1e-3)
        assert ours["gain_db"] == pytest.approx(theirs["gain_db"], abs=1e-3)
    assert report["after_error_db"] == pytest.approx(meta["fit_report"]["after_error_db"], abs=1e-3)  # type: ignore[index]


# --- mastering chain ------------------------------------------------------------------------------------


@pytest.mark.parametrize(("target", "ceiling"), [(-14.0, -1.0), (-9.0, -0.5), (-18.0, -1.0)])
def test_master_reaches_the_target_below_the_ceiling(target: float, ceiling: float) -> None:
    x = music(12.0) * 0.5
    y, rate, report = master(x, 44100, Target(target, ceiling, max_limiter_reduction_db=12), Compressor())
    measured = loudness.measure(y, rate)
    assert report["reason"] == "target_reached" and report["target_reached"]
    assert measured.integrated_lufs == pytest.approx(target, abs=0.3)
    assert measured.true_peak_dbtp is not None and measured.true_peak_dbtp <= ceiling + 0.05


def test_master_resamples_first_and_reports() -> None:
    y, rate, report = master(music(6.0), 44100, Target(), None, output_rate=48000)
    assert rate == 48000 and y.shape[1] == output_frames(int(6.0 * 44100), 44100, 48000)
    assert report["compressor"] == {"enabled": False} and report["input_rate"] == 44100
    assert loudness.measure(y, 48000).true_peak_dbtp <= -1.0 + 0.05  # type: ignore[operator]


def test_master_stops_at_its_budgets() -> None:
    quiet = music(6.0) * 0.01
    _y, _rate, report = master(quiet, 44100, Target(-9.0, -1.0, max_makeup_db=3.0))
    assert report["reason"] == "makeup_budget" and not report["target_reached"]
    _y, _rate, silent = master(np.zeros((2, 44100 * 2)), 44100, Target())
    assert silent["reason"] == "silence_or_unmeasurable_loudness"
    with pytest.raises(PlenioUserError, match="target_lufs must be between -30 and -5"):
        master(quiet, 44100, Target(-2.0))


def test_loudness_presets() -> None:
    target = PRESETS.target("streaming (-14 LUFS, -1 dBTP)", "Pop - punchy")
    assert (target.integrated_lufs, target.ceiling_dbtp) == (-14.0, -1.0)
    assert PRESETS.compressor("Classical - preserve dynamics") is None
    assert PRESETS.compressor("Balanced - gentle glue") == Compressor()
    with pytest.raises(PlenioUserError, match="Unknown loudness target"):
        PRESETS.target("very loud")
    for name in PRESETS.style_names():
        compressor = PRESETS.compressor(name)
        if compressor is not None:
            compressor.checked(44100)
        PRESETS.target(PRESETS.target_names()[0], name).checked()
