"""S-9: the creative modes with the real models on local hardware (V3).

YuE2 plans a score from fixed documents, Score Tools prepares it, Arrange plans the sections with a real
writer - ComfyUI's native Generate Text (Gemma 4 E4B, answering freely) and a GGUF through Local LLM (held
to the plan's JSON schema) - and Apply Arrangement writes the plan into the score. The score sheet must
accept the result; with the native writer YuE2 also renders it, so the arranged score is shown to reach
the music model. The plans and the times are printed (``-s``).

Needs ``PLENIO_SMOKE=1``, ``PLENIO_COMFYUI_ROOT`` and ``PLENIO_MODELS_DIR`` with the YuE2 int8 checkpoint,
the writer and (for the GGUF case) ``LLM/<PLENIO_SMOKE_GGUF>`` plus a llama.cpp runtime.
"""

from __future__ import annotations

import json
import os
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = [pytest.mark.host, pytest.mark.smoke]

MODELS = Path(os.environ.get("PLENIO_MODELS_DIR", "") or "missing-models-dir")
CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"
GGUF_WRITER = os.environ.get("PLENIO_SMOKE_GGUF", "Qwen_Qwen3.5-9B-Q4_K_M.gguf")
STYLE = "English, indie pop, warm female vocal, acoustic guitar, soft piano, light drums, 96 BPM, hopeful"
LYRICS = (
    "[Verse]\nMorning light on the window\nCoffee warm in my hand\nEvery sound is a promise\n\n"
    "[Chorus]\nSing it slow, let it go\nEvery road leads home\nSing it slow, let it go\nYou are not alone"
)


@pytest.fixture(scope="module")
def gpu_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    missing = [
        f"{folder}/{name}"
        for folder, name in (("checkpoints", CHECKPOINT), ("text_encoders", WRITER))
        if not (MODELS / folder / name).exists()
    ]
    if missing:
        pytest.skip(f"model files not found under {MODELS}: {', '.join(missing)}")
    base = tmp_path_factory.mktemp("comfy-arrangement-models")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    server = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME],
        cpu=False,
        models_dir=MODELS,
        extra_env={"PLENIO_OFFLINE": "1", "PLENIO_LLM_OTHER_APPS": "0"},
    )
    server.start()
    yield server
    server.stop()


def manual(**docs: str) -> str:
    return json.dumps(
        {
            "schema": "plenio.sheet_state/1",
            "docs": {kind: {"state": "manual", "text": text} for kind, text in docs.items()},
        }
    )


def prompt(writer: str, *, render: bool, folder: str) -> dict[str, Any]:
    graph: dict[str, Any] = {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "mode": "one song, stop to review",
                "template": "none",
                "description": "A short, bright song about a slow morning at home.",
                "genre": "indie pop",
                "mood": "warm, hopeful",
                "tempo": "96 BPM",
                "length": "short (about 1:30)",
                "vocals": "sung",
                "vocals.language": "English",
                "vocals.voice": "warm female",
                "vocals.theme": "",
                "key": "",
                "meter": "",
                "arrangement": "varied",
                "genre_closeness": 60,
            },
        },
        "2": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CHECKPOINT}},
        "3": {"class_type": "PlenioEngine", "inputs": {"clip": ["2", 1]}},
        "4": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": manual(
                    title="Slow Morning", style=STYLE, lyrics=LYRICS, artwork_prompt="A window."
                ),
            },
        },
        "5": {
            "class_type": "YuE2GenerateABC",
            "inputs": {
                "clip": ["2", 1],
                "style": ["4", 1],
                "lyrics": ["4", 2],
                "seed": 3,
                "mode": "full",
                "max_abc_tokens": 8192,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 30,
                "repetition_penalty": 1.005,
                "penalty_window": 100,
            },
        },
        "6": {
            "class_type": "PlenioScoreTools",
            "inputs": {"score": ["5", 0], "brief": ["1", 0], "operation": "prepare from brief"},
        },
        # Arrange, as in the blueprint: Compose -> Writer Choice -> (CLIPLoader -> Generate Text | Local LLM)
        # -> lazy switch -> Apply
        "20": {
            "class_type": "PlenioComposeArrangement",
            "inputs": {
                "score": ["6", 0],
                "brief": ["1", 0],
                "engine": ["3", 0],
                "style": ["4", 1],
                "lyrics": ["4", 2],
            },
        },
        "21": {"class_type": "PlenioWriterChoice", "inputs": {"model": writer}},
        "22": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": ["21", 0], "type": "stable_diffusion", "device": "default"},
        },
        "23": {
            "class_type": "TextGenerate",
            "inputs": {
                "clip": ["22", 0],
                "prompt": ["20", 0],
                "max_length": 2048,
                "sampling_mode": "on",
                "sampling_mode.temperature": 0.7,
                "sampling_mode.top_k": 64,
                "sampling_mode.top_p": 0.95,
                "sampling_mode.min_p": 0.05,
                "sampling_mode.repetition_penalty": 1.05,
                "sampling_mode.seed": 1,
                "sampling_mode.presence_penalty": 0.0,
                "thinking": False,
                "use_default_template": True,
                "mtp": "auto",
            },
        },
        "24": {
            "class_type": "PlenioLocalLLM",
            "inputs": {
                "prompt": ["20", 0],
                "schema": ["20", 1],
                "model": ["21", 1],
                "seed": 1,
                "max_tokens": 2048,
                "temperature": 0.7,
                "thinking": False,
                "context": 8192,
                "keep_loaded": False,
                "system_prompt": "",
                "reuse_answers": False,
            },
        },
        "25": {
            "class_type": "ComfySwitchNode",
            "inputs": {"switch": ["21", 2], "on_false": ["23", 0], "on_true": ["24", 0]},
        },
        "26": {
            "class_type": "PlenioApplyArrangement",
            "inputs": {
                "score": ["6", 0],
                "brief": ["1", 0],
                "answer": ["25", 0],
                "engine": ["3", 0],
                "style": ["4", 1],
                "lyrics": ["4", 2],
                "seed": 1,
            },
        },
        "7": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["26", 0],
                "arrangement": ["26", 1],
                "context_style": ["4", 1],
                "context_lyrics": ["4", 2],
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": "",
            },
        },
    }
    if render:
        graph.update(
            {
                "8": {
                    "class_type": "YuE2GenerateMusic",
                    "inputs": {
                        "clip": ["2", 1],
                        "style": ["4", 1],
                        "lyrics": ["4", 2],
                        "abc": ["7", 3],
                        "seed": 7,
                        "mode": ["7", 5],
                        "max_duration": ["7", 6],
                        "temperature": 1.0,
                        "top_p": 0.95,
                        "top_k": 100,
                        "repetition_penalty": 1.2,
                        "cfg_scale": 1.0,
                    },
                },
                "9": {"class_type": "EmptyYuE2LatentAudio", "inputs": {"seconds": ["8", 1], "batch_size": 1}},
                "10": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["8", 0]}},
                "11": {
                    "class_type": "KSampler",
                    "inputs": {
                        "model": ["2", 0],
                        "positive": ["8", 0],
                        "negative": ["10", 0],
                        "latent_image": ["9", 0],
                        "seed": 7,
                        "steps": 32,
                        "cfg": 1.0,
                        "sampler_name": "dpm_2",
                        "scheduler": "sgm_uniform",
                        "denoise": 1.0,
                    },
                },
                "12": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["11", 0], "vae": ["2", 2]}},
                "13": {
                    "class_type": "PlenioExportRelease",
                    "inputs": {
                        "audio": ["12", 0],
                        "title": ["4", 0],
                        "folder": folder,
                        "naming": "{title}",
                        "collision": "overwrite",
                        "reports.report_0": ["4", 7],
                        "reports.report_1": ["7", 7],
                    },
                },
            }
        )
    return graph


@pytest.mark.parametrize("writer", [WRITER, f"models/LLM · {GGUF_WRITER}"], ids=["native", "gguf"])
def test_s9_a_real_writer_arranges_a_real_plan(gpu_server: ComfyServer, writer: str) -> None:
    if writer.startswith("models/LLM") and not (MODELS / "LLM" / GGUF_WRITER).exists():
        pytest.skip(f"{GGUF_WRITER} not found under {MODELS / 'LLM'}")
    render = writer == WRITER
    started = time.monotonic()
    entry = gpu_server.run(prompt(writer, render=render, folder="plenio/s9"), timeout=3600)
    seconds = time.monotonic() - started
    sheet = entry["outputs"]["7"]["plenio_sheet"][0]
    arrangement = sheet["arrangement"]
    print(f"\nS-9 {writer}: {seconds:.0f} s, {arrangement['status']}: {arrangement['summary']}")
    for section in arrangement["sections"]:
        print(
            f"  {section['index']} {section['label']} ({section['bars']}): {section['applied']} kept {section['kept']}"
        )
    for note in arrangement["notes"]:
        print(f"  note: {note}")
    assert arrangement["status"] in ("applied", "partial"), arrangement["summary"]
    assert [f for f in sheet["findings"] if f["severity"] == "error"] == []
    if render:
        record = json.loads(
            next((gpu_server.output_dir / "plenio" / "s9").glob("*.plenio.json")).read_text("utf-8")
        )
        score = record["documents"]["score"]["text"]
        assert score == sheet["docs"]["score"]["text"]  # YuE2 rendered exactly the arranged score
        assert any(r["kind"] == "song_sheet" and r["data"].get("arrangement") for r in record["reports"])
