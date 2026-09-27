"""Refine (48 kHz) and Load Audio Model in a real ComfyUI server with fake engines (plan §4, Phase 11B O6).

Real super-resolution engines and the listening study run on the owner's machine (L1).
"""

from __future__ import annotations

from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host

SECONDS, FAKE_RATE = 3.0, 24000


def events(log: Log, node: str) -> list[dict[str, Any]]:
    return [e for e in log.events() if e["node"] == node]


def refine_prompt(
    *, engine: str = "resample only", model: str | None = "super-resolution", **settings: Any
) -> dict[str, Any]:
    prompt: dict[str, Any] = {
        "1": {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": SECONDS, "variant": 1}},
        "2": {
            "class_type": "PlenioRefine",
            "inputs": {
                "audio": ["1", 0],
                "engine": engine,
                "crossover_hz": 0.0,
                "sr_gain": 1.0,
                "pre_hz": 0.0,
                "post_hz": 0.0,
                "seed": 4,
                **settings,
            },
        },
        "3": {"class_type": "PlenioTestAudioProbe", "inputs": {"audio": ["2", 0], "name": "refined"}},
    }
    if model:
        prompt["4"] = {"class_type": "PlenioTestFakeAudioModel", "inputs": {"kind": model}}
        prompt["2"]["inputs"]["model"] = ["4", 0]
    return prompt


def test_resample_only_needs_no_model_and_does_not_load_one(server: ComfyServer, log: Log) -> None:
    entry = server.run(refine_prompt())
    probe = events(log, "probe")[-1]
    assert probe["rate"] == 48000 and probe["shape"] == [1, 2, int(SECONDS * 48000)]
    assert events(log, "audio_model") == []  # the model input is lazy
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert "resample only" in summary and "24000 -> 48000 Hz" in summary


def test_the_model_engine_runs_the_connected_model(server: ComfyServer, log: Log) -> None:
    entry = server.run(refine_prompt(engine="model", seed=9))
    assert [e["kind"] for e in events(log, "audio_model")] == ["super-resolution"]
    probe = events(log, "probe")[-1]
    assert probe["rate"] == 48000 and probe["shape"] == [1, 2, int(SECONDS * 48000)]
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert "fake-sr" in summary and "provisional" in summary


def test_model_engine_errors_are_actionable(server: ComfyServer) -> None:
    missing = server.run_expect_error(refine_prompt(engine="model", model=None))
    assert missing["node_type"] == "PlenioRefine"
    assert "no Load Audio Model is connected" in missing["exception_message"]
    wrong = server.run_expect_error(refine_prompt(engine="model", model="separation"))
    assert "needs a super-resolution model" in wrong["exception_message"]


def test_load_audio_model_refuses_a_file_no_engine_reads(server: ComfyServer) -> None:
    info = server.get("/object_info/PlenioAudioModelLoader")["PlenioAudioModelLoader"]
    assert info["experimental"] is True
    prompt = refine_prompt(engine="model", model=None)
    prompt["4"] = {
        "class_type": "PlenioAudioModelLoader",
        "inputs": {"kind": "super-resolution", "kind.model": "unknown-sr.safetensors"},
    }
    prompt["2"]["inputs"]["model"] = ["4", 0]
    error = server.run_expect_error(prompt)
    assert error["node_type"] == "PlenioAudioModelLoader"
    assert (
        "No super-resolution engine in this version of Plenio reads 'unknown-sr.safetensors'"
        in error["exception_message"]
    )
    assert "resample only" in error["exception_message"]
