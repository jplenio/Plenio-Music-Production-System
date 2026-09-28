"""Refine (48 kHz) and Load Audio Model in a real ComfyUI server with fake engines (plan §4, Phase 11B O6).

Real super-resolution engines and the listening study run on the owner's machine (L1).
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pytest

from harness import ComfyServer, ExecutionFailedError, Log

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


def test_the_model_runs_for_a_full_band_input_too(server: ComfyServer, log: Log) -> None:
    """Owner's decision (2026-09-28): the model always runs; above the crossover it replaces content.

    A 48 kHz input that already reaches 20 kHz: the engine is never skipped, and the report names the
    engine and says that only the content above the crossover changes.
    """
    prompt = refine_prompt(engine="model", crossover_hz=14500.0)
    prompt["1"]["inputs"].update({"rate": 48000, "broadband": True})  # already full band
    entry = server.run(prompt)
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert "fake-sr" in summary  # the engine path, not 'resample only'
    assert "already reaches" in summary and "14.5 kHz" in summary
    probe = events(log, "probe")[-1]
    assert probe["rate"] == 48000 and probe["shape"] == [1, 2, int(SECONDS * 48000)]


def test_the_prepared_templates_set_all_three_stages(server: ComfyServer) -> None:
    """Owner's request (2026-09-28): one preset sets PRE, POST and the crossover (500 Hz below PRE)."""
    info = server.get("/object_info/PlenioRefine")["PlenioRefine"]
    inputs = info["input"]
    # optional inputs (a default is enough for prompt validation) live under "optional"
    spec = inputs["required"].get("preset") or inputs["optional"]["preset"]
    presets = spec[1]["options"]
    assert presets[0].startswith("custom") and len(presets) == 6
    minimax = [name for name in presets if "MiniMax" in name]
    assert minimax, presets
    entry = server.run(refine_prompt(engine="model", preset=minimax[0]))
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    # the preset resolved its own numbers: PRE 10 kHz, crossover 9.5 kHz, POST 19 kHz
    assert f"preset {minimax[0]}" in summary
    assert "PRE 10000 Hz" in summary and "crossover 9500 Hz" in summary and "POST 19000 Hz" in summary
    assert "fake-sr" in summary  # the model ran
    # the three fields are free numbers now (the "off"/"auto" stage combos are gone)
    specs = {**inputs["required"], **inputs.get("optional", {})}
    assert [specs[name][0] for name in ("pre_hz", "post_hz", "crossover_hz")] == ["FLOAT"] * 3
    # the widget order the frontend builds (required first, then optional) keeps the preset in front
    # of its three fields, as the templates store it
    order = info["input_order"]["required"] + info["input_order"]["optional"]
    widgets = [name for name in order if name not in ("audio", "model")]
    assert widgets == ["engine", "crossover_hz", "sr_gain", "preset", "pre_hz", "post_hz", "seed"]
    # an unknown preset is refused before anything runs
    with pytest.raises(ExecutionFailedError) as refused:
        server.run(refine_prompt(engine="model", preset="no such template"))
    assert "preset" in str(refused.value) and "no such template" in str(refused.value)


def test_a_prompt_from_before_the_preset_still_runs(server: ComfyServer, log: Log) -> None:
    """An API prompt written before the preset existed has no preset (and may lack pre, post and the
    seed): ComfyUI accepts it and the node uses the defaults (*custom*, pre 0, post 0, seed 0)."""
    prompt = refine_prompt(engine="model")
    for name in ("preset", "pre_hz", "post_hz", "seed"):
        prompt["2"]["inputs"].pop(name, None)
    entry = server.run(prompt)
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert "fake-sr" in summary and "preset" not in summary
    assert events(log, "probe")[-1]["rate"] == 48000


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


def test_the_vendored_universr_adapter_runs_a_checkpoint(server: ComfyServer, log: Log) -> None:
    """D9 with real engine code: Load Audio Model loads a checkpoint and Refine runs it (tiny, CPU)."""
    pytest.importorskip("torch", reason="the adapter needs PyTorch")
    checkpoint = server.base / "models" / "audio_sr" / "tiny-universr.bin"
    if not checkpoint.is_file():
        pytest.skip("the tiny UniverSR checkpoint could not be built (torch/einops missing)")
    prompt = refine_prompt(engine="model", model=None, seed=5)
    prompt["4"] = {
        "class_type": "PlenioAudioModelLoader",
        "inputs": {"kind": "super-resolution", "kind.model": "tiny-universr.bin"},
    }
    prompt["2"]["inputs"]["model"] = ["4", 0]
    entry = server.run(prompt, timeout=900.0)
    probe = events(log, "probe")[-1]
    assert probe["rate"] == 48000
    assert probe["shape"] == [1, 2, int(round(SECONDS * 48000))]
    assert np.isfinite(probe["peak"]) and probe["peak"] > 0
    summary = entry["outputs"]["2"]["plenio_summary"][0]["markdown"]
    assert "UniverSR" in summary and "provisional" in summary
    # the report of the stage names the engine and the measured bandwidth
    assert "24000 -> 48000 Hz" in summary
    assert "UniverSR" in str(entry["outputs"]["2"]["plenio_summary"][0])


def test_the_adapter_is_deterministic_for_one_seed(server: ComfyServer, log: Log) -> None:
    """R12: the same seed gives the same result (the engine is the only stochastic part)."""
    pytest.importorskip("torch", reason="the adapter needs PyTorch")
    checkpoint = server.base / "models" / "audio_sr" / "tiny-universr.bin"
    if not checkpoint.is_file():
        pytest.skip("the tiny UniverSR checkpoint could not be built (torch/einops missing)")
    peaks = []
    for _ in range(2):
        prompt = refine_prompt(engine="model", model=None, seed=3)
        prompt["1"] = {"class_type": "PlenioTestFakeAudio", "inputs": {"seconds": 1.0, "variant": 1}}
        prompt["4"] = {
            "class_type": "PlenioAudioModelLoader",
            "inputs": {"kind": "super-resolution", "kind.model": "tiny-universr.bin"},
        }
        prompt["2"]["inputs"]["model"] = ["4", 0]
        server.run(prompt, timeout=900.0)
        peaks.append(events(log, "probe")[-1])
    assert peaks[0] == peaks[1]
