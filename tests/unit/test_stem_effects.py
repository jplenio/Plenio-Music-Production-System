"""The Stem Mixer's effect buses (Phase 11C M6/D12): reverb, delay and the bus wiring."""

from __future__ import annotations

import numpy as np
import pytest

from plenio.core.audio import effects
from plenio.core.audio.stems import mix
from plenio.core.errors import PlenioUserError

RATE = 48000


def impulse(seconds: float = 0.2, rate: int = RATE) -> np.ndarray:
    data = np.zeros((2, int(seconds * rate)))
    data[:, 100] = 1.0
    return data


def noise(seconds: float = 1.0, rate: int = RATE, seed: int = 3) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return rng.standard_normal((2, int(seconds * rate))) * 0.1


def test_the_impulse_response_decays_and_is_decorrelated() -> None:
    for preset, values in effects.REVERB_PRESETS.items():
        ir = effects.impulse_response(RATE, seed=1, **values)
        assert ir.shape[0] == 2
        assert ir.shape[1] == pytest.approx(values["rt60"] * RATE, rel=0.01), preset
        # unit energy per channel: the wet signal keeps the dry level (no hidden normalisation)
        assert np.allclose(np.sqrt((ir**2).sum(axis=1)), 1.0, atol=1e-6), preset
        # the tail decays: the last tenth holds far less energy than the first
        head = float((ir[:, : ir.shape[1] // 10] ** 2).sum())
        tail = float((ir[:, -ir.shape[1] // 10 :] ** 2).sum())
        assert tail < head / 10, preset
        # the two channels are decorrelated (a different seed each)
        correlation = float(np.corrcoef(ir[0], ir[1])[0, 1])
        assert abs(correlation) < 0.1, preset


def test_the_reverb_is_deterministic_for_one_seed() -> None:
    first = effects.reverb("room", seed=7)(impulse(), RATE)
    second = effects.reverb("room", seed=7)(impulse(), RATE)
    other = effects.reverb("room", seed=8)(impulse(), RATE)
    assert np.array_equal(first, second)
    assert not np.allclose(first, other)


def test_the_reverb_keeps_the_shape_and_adds_a_tail() -> None:
    data = noise(0.5)
    wet = effects.reverb("plate", seed=0)(data, RATE)
    assert wet.shape == data.shape
    # the wet signal is the convolution: no dry copy, the pre-delay is silent
    assert float(np.abs(wet[:, :100]).max()) == pytest.approx(0.0, abs=1e-12)
    assert float(np.abs(wet).max()) > 0.0
    # a hall rings longer than a room
    room = effects.reverb("room", seed=0)(impulse(2.0), RATE)
    hall = effects.reverb("hall", seed=0)(impulse(2.0), RATE)
    assert float((hall[0, RATE:] ** 2).sum()) > float((room[0, RATE:] ** 2).sum())


def test_an_unknown_reverb_preset_is_refused() -> None:
    with pytest.raises(PlenioUserError, match="Unknown reverb preset"):
        effects.reverb("cathedral")


def test_the_delay_places_repeats_and_decays() -> None:
    data = impulse(1.0)
    wet = effects.delay(time_ms=100.0, feedback=0.5, lowpass_hz=20000.0)(data, RATE)
    peaks = np.flatnonzero(np.abs(wet[0]) > 1e-3)
    first = peaks.min()
    assert first == pytest.approx(100 + 0.1 * RATE, abs=2)  # the impulse sits at 100, the repeat 100 ms later
    # the wet signal does not contain the dry impulse itself
    assert float(np.abs(wet[0, :100]).max()) < 1e-9
    # each repeat is quieter: the second at 200 ms is below the first
    window = lambda start: float(np.abs(wet[0, int(start * RATE) : int((start + 0.01) * RATE)]).max())  # noqa: E731
    assert window(0.2) < window(0.1)
    assert window(0.3) < window(0.2)

    # the low-pass in the loop darkens the repeats: the third repeat loses more against the first
    # than it does with a flat loop (their levels are identical in both cases)
    def decay(hz: float) -> float:
        signal = effects.delay(time_ms=50.0, feedback=0.7, lowpass_hz=hz)(impulse(0.5), RATE)[0]

        def repeat(index: int) -> float:
            centre = 100 + index * (RATE // 20)
            return float(np.abs(signal[centre - 24 : centre + 24]).max())

        return repeat(3) / repeat(1)

    assert decay(1500.0) < decay(20000.0) * 0.98


def test_the_delay_time_can_be_a_note_value() -> None:
    eighth = effects.delay(note="1/8", bpm=120.0, feedback=0.5)(impulse(1.0), RATE)
    assert np.flatnonzero(np.abs(eighth[0]) > 1e-3).min() == pytest.approx(100 + RATE // 4, abs=2)  # 250 ms
    with pytest.raises(PlenioUserError, match="Unknown delay note"):
        effects.delay(note="1/64")


def test_delay_limits_are_enforced() -> None:
    with pytest.raises(PlenioUserError, match="at most 0.8"):
        effects.delay(feedback=0.95)
    with pytest.raises(PlenioUserError, match="between 5 and 2000 ms"):
        effects.delay(time_ms=4000.0)
    with pytest.raises(PlenioUserError, match="between 5 and 2000 ms"):
        effects.delay(time_ms=1.0)


def test_the_delay_is_the_feedback_recursion() -> None:
    """Against the textbook loop: wet[n] = w[n-L], w[n] = x[n] + g * lowpass(wet)[n]."""
    rng = np.random.default_rng(11)
    data = rng.standard_normal((2, 3000)) * 0.1
    length, gain, hz = 240, 0.5, 3000.0  # 5 ms at 48 kHz
    a = float(np.exp(-2.0 * np.pi * hz / RATE))
    expected = np.zeros_like(data)
    for channel in range(2):
        line, state = np.zeros(data.shape[1]), 0.0
        for n in range(data.shape[1]):
            wet = line[n - length] if n >= length else 0.0
            state = (1 - a) * wet + a * state
            line[n] = data[channel, n] + gain * state
            expected[channel, n] = wet
    wet = effects.delay(time_ms=5.0, feedback=gain, lowpass_hz=hz)(data, RATE)
    assert np.max(np.abs(wet - expected)) < 1e-5 * np.max(np.abs(data)) * 2


def test_feedback_zero_is_a_single_echo_at_the_send_level() -> None:
    wet = effects.delay(time_ms=100.0, feedback=0.0)(impulse(1.0), RATE)
    hits = np.flatnonzero(np.abs(wet[0]) > 1e-9)
    assert hits.tolist() == [100 + RATE // 10] and wet[0, hits[0]] == pytest.approx(1.0)


def test_a_long_delay_costs_the_echoes_not_the_delay_samples() -> None:
    """The old comb filter cost O(frames x delay samples): about 11 min for a 3-min song at 1.5 s."""
    import time

    data = noise(30.0)
    started = time.perf_counter()
    wet = effects.delay(time_ms=1500.0, feedback=0.8)(data, RATE)
    assert time.perf_counter() - started < 5.0
    assert wet.shape == data.shape and np.isfinite(wet).all()


def test_the_buses_follow_the_stems_channel_count() -> None:
    """A mono separation (a phone recording) gets a mono wet signal, not the stereo IR's two channels."""
    from plenio.core.audio.stems import make_stems, parse_mix

    for channels in (1, 2):
        data = np.random.default_rng(channels).standard_normal((channels, RATE // 2)) * 0.1
        assert effects.reverb("room")(data, RATE).shape == data.shape
        assert effects.delay(time_ms=50.0)(data, RATE).shape == data.shape
    mono = noise(0.5)[:1]
    stems = make_stems(mono, RATE, {"vocals": mono * 0.5, "other": mono * 0.25})
    settings = parse_mix(
        '{"schema": "plenio.stem_mix/1", "strips": {"vocals": {"reverb": 0.5, "delay": 0.3}},'
        ' "reverb": {"preset": "hall"}, "delay": {"time_ms": 120}}'
    )
    out, report = mix(stems, settings, effects=effects.effects_for(settings.buses))
    assert out.shape == mono.shape and report["buses"] == ["reverb", "delay"]


def test_a_bus_setting_that_is_left_out_takes_the_widgets_default() -> None:
    """The widget shows feedback 0.35 for a delay bus without the key; the backend used 0 (silent)."""
    probe = impulse(1.0)
    only_time = effects.delay_bus({"time_ms": 100})(probe, RATE)
    assert np.array_equal(only_time, effects.delay(time_ms=100.0, feedback=0.35)(probe, RATE))
    single = effects.delay_bus({"time_ms": 100, "feedback": 0})(probe, RATE)  # a given 0 stays 0
    assert np.count_nonzero(np.abs(single[0]) > 1e-9) == 1
    with pytest.raises(PlenioUserError, match="at most 0.8"):
        effects.delay_bus({"feedback": -0.2})
    with pytest.raises(PlenioUserError, match="BPM"):
        effects.delay_bus({"note": "1/8", "bpm": 0})
    with pytest.raises(PlenioUserError, match="Unknown delay bus setting"):
        effects.delay_bus({"time": 300})
    with pytest.raises(PlenioUserError, match="Unknown reverb bus setting"):
        effects.reverb_bus({"preset": "room", "size": 2})


def test_the_buses_are_built_from_the_mixer_settings() -> None:
    built = effects.effects_for({"reverb": {"preset": "hall"}, "delay": {"time_ms": "375", "feedback": 0.4}})
    assert set(built) == {"reverb", "delay"}
    wet = built["delay"](impulse(1.0), RATE)
    assert np.flatnonzero(np.abs(wet[0]) > 1e-3).min() == pytest.approx(100 + 0.375 * RATE, abs=400)
    with pytest.raises(PlenioUserError, match="Unknown effect bus"):
        effects.effects_for({"spring": {}})
    with pytest.raises(PlenioUserError, match="must be a number"):
        effects.effects_for({"delay": {"time_ms": "soon"}})


def test_a_send_without_its_bus_is_refused_and_a_neutral_mix_stays_exact() -> None:
    from plenio.core.audio.stems import make_stems, parse_mix

    data = noise(0.5)
    stems = make_stems(data, RATE, {"vocals": data * 0.5, "other": data * 0.25})
    settings = parse_mix('{"schema": "plenio.stem_mix/1", "strips": {"vocals": {"reverb": 0.5}}}')
    with pytest.raises(PlenioUserError, match="reverb"):
        mix(stems, settings, effects={})  # a send without a bus must never be ignored
    out, report = mix(stems, settings, effects=effects.effects_for({"reverb": {"preset": "room"}}))
    assert out.shape == data.shape and report["buses"]
    neutral, neutral_report = mix(stems, parse_mix(""), effects={})
    assert neutral_report["neutral"] and np.allclose(neutral, data, atol=1e-9)
