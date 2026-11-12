"""The loudness meter against values worked out by hand (phase 9.3: the mutation run of loudness.py found lines no
test would miss without pyloudnorm, the oracle of test_audio.py, which this machine's tests may not have)."""

from __future__ import annotations

import numpy as np
import pytest

from plenio.core.audio.loudness import Measurement, loudness_range, measure, true_peak

RATE = 48000


def tone(
    seconds: float, amplitude: float, rate: int = RATE, frequency: float = 997.0, phase: float = 0.0
) -> np.ndarray:
    t = np.arange(int(seconds * rate)) / rate
    return amplitude * np.sin(2 * np.pi * frequency * t + phase)


def test_a_steady_tone_has_no_range_and_two_levels_ten_lu_apart_have_ten() -> None:
    steady = measure(np.stack([tone(20, 0.1)] * 2), RATE)
    assert steady.loudness_range_lu == pytest.approx(0.0, abs=0.1)
    quiet, loud = tone(15, 0.1 / np.sqrt(10)), tone(15, 0.1)  # 10 dB apart
    stepped = measure(np.stack([np.concatenate([quiet, loud])] * 2), RATE)
    assert stepped.loudness_range_lu == pytest.approx(10.0, abs=0.5)
    # a level more than 20 LU below the mean is left out of the range (EBU Tech 3342's relative gate): only the
    # 3 s blocks across the step remain between the two, not the quiet part's 25 LU
    far = tone(15, 0.1 / 10**1.25)  # 25 dB below
    gated = measure(np.stack([np.concatenate([far, loud])] * 2), RATE)
    assert 0.5 < gated.loudness_range_lu < 5.0


def test_the_range_of_too_few_blocks_and_of_silence() -> None:
    assert loudness_range(np.array([])) is None
    assert loudness_range(np.array([1e-12])) is None  # every block below -70 LUFS
    assert loudness_range(np.array([0.01])) == 0.0  # one block: no spread


def test_loudness_follows_the_gain_exactly() -> None:
    a = measure(np.stack([tone(10, 0.1)] * 2), RATE)
    b = measure(np.stack([tone(10, 0.05)] * 2), RATE)
    assert a.integrated_lufs - b.integrated_lufs == pytest.approx(20 * np.log10(2), abs=0.01)


@pytest.mark.parametrize("rate", [44100, 48000, 96000, 192000])
def test_a_peak_between_two_samples_is_found_at_every_rate_and_across_blocks(rate: int) -> None:
    # a quarter of the rate at 45 degrees: every sample sits at 0.707, the wave itself reaches 1.0 between them
    wave = tone(30, 1.0, rate, frequency=rate / 4, phase=np.pi / 4)
    stereo = np.stack([wave, wave])
    sample_peak = float(np.max(np.abs(stereo)))
    assert sample_peak == pytest.approx(np.sqrt(0.5), abs=1e-3)
    found = true_peak(stereo, rate)
    assert found > sample_peak * 1.25 and found == pytest.approx(1.0, abs=0.08), rate


def test_above_192_khz_the_sample_peak_is_the_true_peak() -> None:
    wave = tone(2, 1.0, 384000, frequency=96000, phase=np.pi / 4)
    assert true_peak(np.stack([wave, wave]), 384000) == pytest.approx(np.sqrt(0.5), abs=1e-3)


def test_the_report_of_a_measurement() -> None:
    # a mono sine: -20 dBTP peak, -23 LUFS (BS.1770 reads a sine 3 dB below its peak), so 3 dB peak to loudness
    report = measure(tone(12, 0.1), RATE).to_dict()
    assert report["valid"] is True and report["seconds"] == 12.0
    assert report["true_peak_dbtp"] == pytest.approx(-20.0, abs=0.05)
    assert report["integrated_lufs"] == pytest.approx(-23.0, abs=0.05)
    assert report["plr_db"] == pytest.approx(3.01, abs=0.05)
    silent = measure(np.zeros((2, RATE)), RATE)
    assert silent == Measurement(None, None, None, None, 1.0) and silent.to_dict()["valid"] is False
    assert silent.to_dict()["plr_db"] is None
