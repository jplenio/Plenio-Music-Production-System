"""The sung pitch tracker (core.audio.pitch): known tones come back as their MIDI pitches, silence and
noise as unvoiced, an octave error is folded, and the curve is what the editor gets."""

from __future__ import annotations

import time

import numpy as np

from plenio.core.audio import pitch

RATE = 44100


def tone(midi: float, seconds: float, rate: int = RATE, *, harmonics: bool = True) -> np.ndarray:
    t = np.arange(int(seconds * rate)) / rate
    f = 440.0 * 2 ** ((midi - 69) / 12)
    wave = np.sin(2 * np.pi * f * t)
    if harmonics:  # a voice is rich in overtones
        wave += 0.5 * np.sin(4 * np.pi * f * t) + 0.3 * np.sin(6 * np.pi * f * t)
    return (0.3 * wave / np.abs(wave).max()).astype(np.float32)


def test_tones_come_back_as_their_pitches_and_silence_as_unvoiced() -> None:
    melody = np.concatenate(
        [tone(60, 0.5), np.zeros(int(0.3 * RATE), np.float32), tone(67.3, 0.5), tone(45, 0.4)]
    )
    curve = pitch.track(melody[None, :], RATE, source="test")
    assert curve.rate == 50 and curve.problem is None
    at = lambda s: curve.midi[int(s * curve.rate)]  # noqa: E731
    assert abs(at(0.25) - 60) < 0.2
    assert at(0.65) is None  # the rest
    assert abs(at(1.05) - 67.3) < 0.2  # intonation shows: 30 cents sharp of G4
    assert abs(at(1.5) - 45) < 0.3
    data = curve.to_dict()
    assert data["source"] == "test" and len(data["midi"]) == len(curve.midi)


def test_noise_is_unvoiced_and_a_stereo_stem_is_read() -> None:
    rng = np.random.default_rng(1)
    noise = (0.2 * rng.standard_normal(RATE)).astype(np.float32)
    curve = pitch.track(np.stack([noise, noise]), RATE)
    assert curve.voiced < 0.1
    stereo = np.stack([tone(57, 0.6), tone(57, 0.6)])
    assert abs(pitch.track(stereo, RATE).midi[10] - 57) < 0.2


def test_short_blips_go_and_a_long_song_is_quick() -> None:
    blip = np.concatenate([np.zeros(RATE // 2, np.float32), tone(64, 0.03), np.zeros(RATE // 2, np.float32)])
    assert pitch.track(blip[None, :], RATE).voiced == 0
    song = np.tile(np.concatenate([tone(60, 0.4), tone(62, 0.4), tone(64, 0.8)]), 50)  # 80 s
    started = time.perf_counter()
    curve = pitch.track(song[None, :], RATE)
    assert time.perf_counter() - started < 30
    assert len(curve.midi) == int(80 * 50) or abs(len(curve.midi) - 80 * 50) <= 2


def test_a_missing_curve_says_why() -> None:
    assert pitch.missing("no separation model").to_dict() == {"problem": "no separation model"}
