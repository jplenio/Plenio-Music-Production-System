"""Stems before mastering (next-release plan §6): residual invariant, mixer rules, no hidden processing."""

from __future__ import annotations

import json

import numpy as np
import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from plenio.core.audio import stems as s
from plenio.core.audio.dynamics import compress
from plenio.core.errors import PlenioUserError

RATE = 44100
RNG = np.random.default_rng(3)


def song(seconds: float = 1.0, channels: int = 2) -> np.ndarray:
    return RNG.standard_normal((channels, int(RATE * seconds))) * 0.2


def separation(x: np.ndarray) -> dict[str, np.ndarray]:
    """An imperfect separator: the parts do not add up to the input (the residual keeps the rest)."""
    return {"vocals": 0.5 * x + 0.01, "drums": 0.2 * x[::-1] if x.shape[0] == 2 else 0.2 * x, "bass": 0.1 * x}


def mix_json(**strips: dict[str, object]) -> s.Mix:
    return s.parse_mix(json.dumps({"schema": s.MIX_SCHEMA, "strips": strips}))


@settings(max_examples=40, deadline=None)
@given(st.integers(1, 2), st.integers(1, 4), st.integers(0, 2**31))
def test_a_neutral_mix_returns_the_input(channels: int, count: int, seed: int) -> None:
    rng = np.random.default_rng(seed)
    x = rng.standard_normal((channels, 4000)) * 0.3
    parts = {f"stem{i}": rng.standard_normal((channels, 4000)) * 0.1 for i in range(count)}
    stems = s.make_stems(x, RATE, parts)
    out, report = s.mix(stems)
    assert np.max(np.abs(out - x)) < 1e-6
    assert report["neutral"] is True
    out, report = s.mix(stems, s.parse_mix(""))
    assert np.max(np.abs(out - x)) < 1e-6


def test_stems_are_validated() -> None:
    x = song(0.1)
    with pytest.raises(PlenioUserError, match="1 to 4"):
        s.make_stems(x, RATE, {f"s{i}": x for i in range(5)})
    with pytest.raises(PlenioUserError, match="not usable"):
        s.make_stems(x, RATE, {"rest": x})
    with pytest.raises(PlenioUserError, match="shape"):
        s.make_stems(x, RATE, {"vocals": x[:, :-1]})
    stems = s.make_stems(x, RATE, {"vocals": x})
    assert stems.stems[0].dtype == np.float32 and stems.residual.dtype == np.float32
    assert [name for name, _stem in stems.strips()] == ["vocals", "rest"]


def test_gain_mute_and_solo_including_the_residual() -> None:
    x = song(0.2)
    stems = s.make_stems(x, RATE, separation(x))
    vocals, drums, bass = (stem.astype(float) for stem in stems.stems)
    rest = stems.residual.astype(float)

    def run(**strips: dict[str, object]) -> np.ndarray:
        return s.mix(stems, mix_json(**strips))[0]

    assert np.allclose(run(vocals={"solo": True}), vocals)
    assert np.allclose(run(vocals={"solo": True, "mute": True}), vocals)  # solo beats mute
    assert np.allclose(run(rest={"solo": True}), rest)
    assert np.allclose(run(vocals={"solo": True}, bass={"solo": True}), vocals + bass)
    assert np.allclose(run(rest={"mute": True}), vocals + drums + bass)
    assert np.allclose(run(drums={"gain_db": -6.0}), vocals + drums * 10 ** (-6 / 20) + bass + rest)
    out, report = s.mix(stems, mix_json(vocals={"mute": True}))
    assert [strip["audible"] for strip in report["strips"]] == [False, True, True, True]
    assert report["neutral"] is False


def test_muted_ranges_remove_content_with_soft_edges_and_keep_the_length() -> None:
    x = np.ones((1, RATE))
    stems = s.make_stems(x, RATE, {"vocals": x})
    out, report = s.mix(
        stems, mix_json(vocals={"muted": [[0.2, 0.4], [0.35, 0.5], [0.9, 2.0]]}, rest={"mute": True})
    )
    assert out.shape == x.shape
    edge = round(s.EDGE_SECONDS * RATE)
    assert np.all(out[0, : int(0.2 * RATE)] == 1.0)  # untouched before the range
    assert np.all(out[0, int(0.2 * RATE) + edge : int(0.5 * RATE) - edge] == 0.0)  # merged 0.2-0.5 s
    assert 0 < out[0, int(0.2 * RATE) + edge // 2] < 1  # a raised-cosine edge
    assert np.all(out[0, int(0.5 * RATE) : int(0.9 * RATE)] == 1.0)
    assert np.all(out[0, int(0.9 * RATE) + edge : -edge] == 0.0)  # clipped at the song end
    assert report["strips"][0]["muted_seconds"] == pytest.approx(0.4 - 4 * s.EDGE_SECONDS / 2, abs=1e-3)
    assert s.merge_ranges([(0.5, 0.2), (3.0, 4.0)], 2.0) == []
    with pytest.raises(PlenioUserError, match="end after it starts"):
        mix_json(vocals={"muted": [[0.4, 0.2]]})


def test_compression_reuses_the_mastering_compressor_without_make_up() -> None:
    x = song(0.5) * 3
    stems = s.make_stems(x, RATE, {"vocals": x})
    out, report = s.mix(stems, mix_json(vocals={"compression": 1.0}, rest={"mute": True}))
    expected, info = compress(stems.stems[0].astype(float), RATE, s.compressor_for(1.0))
    assert np.allclose(out, expected)
    assert report["strips"][0]["gain_reduction_db"] == info["max_reduction_db"] > 0
    assert s.compressor_for(0.5).ratio == 3.5 and s.compressor_for(0.5).threshold_db == -21


def test_sends_need_their_bus_and_tails_end_with_a_fade() -> None:
    x = song(0.3)
    stems = s.make_stems(x, RATE, {"vocals": x})
    settings_ = mix_json(vocals={"reverb": 0.5})
    with pytest.raises(PlenioUserError, match="no reverb bus"):
        s.mix(stems, settings_)
    out, report = s.mix(stems, settings_, effects={"reverb": lambda wet, rate: np.ones_like(wet)})
    assert report["buses"] == ["reverb"]
    tail = round(s.TAIL_FADE_SECONDS * RATE)
    dry = stems.stems[0].astype(float) + stems.residual.astype(float)
    assert np.allclose(out[:, :-tail], dry[:, :-tail] + 1.0)
    assert np.all(np.abs(out[:, -1] - dry[:, -1]) < 1e-3)
    with pytest.raises(PlenioUserError, match="returned"):
        s.mix(stems, settings_, effects={"reverb": lambda wet, rate: wet[:, :-1]})


def test_no_hidden_normalisation() -> None:
    x = song(0.2)
    stems = s.make_stems(x, RATE, {"vocals": x})
    out, report = s.mix(stems, mix_json(vocals={"gain_db": 12.0}))
    assert np.max(np.abs(out)) > 1.0 and report["peak_db"] > 0


@pytest.mark.parametrize(
    ("text", "fragment"),
    [
        ("{", "not valid JSON"),
        ('{"schema": "x"}', "schema"),
        (json.dumps({"schema": s.MIX_SCHEMA, "eq": {}}), "Unknown stem mix fields"),
        (json.dumps({"schema": s.MIX_SCHEMA, "strips": {"a": {"pan": 1}}}), "unknown fields"),
        (json.dumps({"schema": s.MIX_SCHEMA, "strips": {"a": {"gain_db": 20}}}), "gain_db"),
        (json.dumps({"schema": s.MIX_SCHEMA, "strips": {"a": {"mute": 1}}}), "true or false"),
        (json.dumps({"schema": s.MIX_SCHEMA, "reverb": 3}), "bus settings"),
    ],
)
def test_the_mixer_value_is_strict(text: str, fragment: str) -> None:
    with pytest.raises(PlenioUserError, match=fragment):
        s.parse_mix(text)


def test_the_mixer_value_round_trips_and_unknown_strips_are_reported() -> None:
    value = mix_json(vocals={"gain_db": -3.0, "muted": [[1.0, 2.0]]}, rest={"mute": True})
    assert s.parse_mix(value.to_json()) == value
    x = song(0.1)
    _out, report = s.mix(s.make_stems(x, RATE, {"vocals": x}), mix_json(guitar={"mute": True}))
    assert report["notes"] == ["strip 'guitar' is not a stem of this separation and was ignored"]
