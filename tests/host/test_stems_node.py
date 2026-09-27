"""Separate Stems and Stem Mixer in a real ComfyUI server with a fake separator (plan §6, Phase 11B O7).

Real separation (BS-RoFormer) and its listening check run on the owner's machine (L2).
"""

from __future__ import annotations

import json
import uuid
from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def stems_prompt(mix: dict[str, Any] | None = None, kind: str = "separation") -> dict[str, Any]:
    return {
        "1": {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": 2.0, "variant": 2}},
        "2": {"class_type": "PlenioTestFakeAudioModel", "inputs": {"kind": kind}},
        "3": {"class_type": "PlenioSeparateStems", "inputs": {"audio": ["1", 0], "model": ["2", 0]}},
        "4": {
            "class_type": "PlenioStemMixer",
            "inputs": {
                "stems": ["3", 0],
                "mix": json.dumps({"schema": "plenio.stem_mix/1", **mix}) if mix else "",
            },
        },
        # unique probe names: a probe that ran before with the same inputs would be cached
        "5": {
            "class_type": "PlenioTestAudioProbe",
            "inputs": {"audio": ["4", 0], "name": f"mix {uuid.uuid4()}"},
        },
        "6": {
            "class_type": "PlenioTestAudioProbe",
            "inputs": {"audio": ["1", 0], "name": f"input {uuid.uuid4()}"},
        },
    }


def probes(log: Log) -> dict[str, dict[str, Any]]:
    return {e["name"].split()[0]: e for e in events(log, "probe")}


def test_a_neutral_mix_returns_the_input(server: ComfyServer, log: Log) -> None:
    entry = server.run(stems_prompt())
    found = probes(log)
    assert found["mix"]["shape"] == found["input"]["shape"] and found["mix"]["rate"] == found["input"]["rate"]
    assert found["mix"]["rms"] == pytest.approx(found["input"]["rms"], rel=1e-6)
    assert "neutral" in entry["outputs"]["4"]["plenio_summary"][0]["markdown"]
    assert "vocals, drums, bass, other + rest" in entry["outputs"]["3"]["plenio_summary"][0]["markdown"]


def test_solo_and_mute_follow_the_mixer_value(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt({"strips": {"vocals": {"solo": True}}}))
    found = probes(log)
    assert found["mix"]["rms"] == pytest.approx(0.4 * found["input"]["rms"], rel=1e-5)  # the fake's vocals
    log.clear()
    server.run(stems_prompt({"strips": {"rest": {"mute": True}}}))
    found = probes(log)
    assert found["mix"]["rms"] == pytest.approx(0.8 * found["input"]["rms"], rel=1e-5)  # without the residual


def test_errors_are_actionable(server: ComfyServer) -> None:
    wrong = server.run_expect_error(stems_prompt(kind="super-resolution"))
    assert (
        wrong["node_type"] == "PlenioSeparateStems"
        and "needs a separation model" in wrong["exception_message"]
    )
    send = server.run_expect_error(stems_prompt({"strips": {"drums": {"reverb": 0.3}}}))
    assert send["node_type"] == "PlenioStemMixer" and "no reverb bus yet" in send["exception_message"]
    typo = server.run_expect_error(stems_prompt({"strips": {"drums": {"pan": 0.3}}}))
    assert "unknown fields" in typo["exception_message"]


def test_the_payload_carries_the_strips_for_the_mixer_widget(server: ComfyServer) -> None:
    """The mixer widget draws its waveform from ``plenio_stems`` (Phase 11C M6/D12)."""
    entry = server.run(stems_prompt())
    payload = entry["outputs"]["4"]["plenio_stems"][0]
    assert payload["stems"] == ["vocals", "drums", "bass", "other", "rest"]
    assert payload["seconds"] == pytest.approx(2.0, abs=0.05)
    assert set(payload["peaks"]) == set(payload["stems"])
    for name, values in payload["peaks"].items():
        assert len(values) == 240, name
        assert max(values) > 0, name
        assert max(values) <= 1.0, name


def test_the_effect_buses_run_and_change_the_mix(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt())
    neutral = probes(log)["mix"]
    log.clear()
    entry = server.run(
        stems_prompt(
            {
                "strips": {"drums": {"reverb": 0.4, "delay": 0.25}},
                "reverb": {"preset": "hall"},
                "delay": {"time_ms": 250, "feedback": 0.35, "lowpass_hz": 4000},
            }
        )
    )
    found = probes(log)["mix"]
    assert found["rate"] == neutral["rate"] and found["shape"] == neutral["shape"]
    assert found["rms"] != pytest.approx(neutral["rms"], rel=1e-4)  # the sends are audible
    assert "Stem Mixer" in entry["outputs"]["4"]["plenio_summary"][0]["markdown"]


def test_a_muted_range_silences_only_its_stretch(server: ComfyServer, log: Log) -> None:
    server.run(stems_prompt())
    neutral = probes(log)["mix"]
    log.clear()
    server.run(stems_prompt({"strips": {"drums": {"muted": [[0.0, 1.0]]}}}))
    found = probes(log)["mix"]
    assert found["rms"] < neutral["rms"]  # half of the drums is gone
    assert found["rms"] > 0.5 * neutral["rms"]  # and nothing else
    assert found["shape"] == neutral["shape"] and found["rate"] == neutral["rate"]
