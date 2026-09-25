"""S-5: MiniMax Music 3 with the real models on local hardware (V3).

A GPU ComfyUI server loads the MiniMax Model block's nodes, the Engine Profile detects the model, the Song
Sheet checks the exact prompt budget with the loaded text encoder, and the native nodes render a 30-s song
that Export Release writes. Needs ``PLENIO_SMOKE=1``, ``PLENIO_COMFYUI_ROOT`` and ``PLENIO_MODELS_DIR`` with
the three MiniMax Music 3 files (diffusion model, int8 text encoder, VAE).
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = [pytest.mark.host, pytest.mark.smoke]

MODELS = Path(os.environ.get("PLENIO_MODELS_DIR", "") or "missing-models-dir")
FILES = {
    "diffusion_models": "minimax_music3_dit_fp16.safetensors",
    "text_encoders": "minimax_music3_text_encoder_pruned_int8_convrot.safetensors",
    "vae": "minimax_music3_dav.safetensors",
}
CAPTION = (
    "Global Metadata\nbpm is 100. key is G, and scale is major. Acoustic pop.\nA bright, friendly short song; "
    "clean, close production.\n\nVocal Details\nEnglish lyrics; warm female lead, relaxed delivery.\n\n"
    "Arrangement\nAcoustic guitar and light percussion; a bass joins in the chorus."
)
LYRICS = "[Verse]\nMorning light on the window\nCoffee warm in my hand\n\n[Chorus]\nSing it slow, let it go"


@pytest.fixture(scope="module")
def gpu_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    missing = [f"{folder}/{name}" for folder, name in FILES.items() if not (MODELS / folder / name).exists()]
    if missing:
        pytest.skip(f"MiniMax Music 3 files not found under {MODELS}: {', '.join(missing)}")
    base = tmp_path_factory.mktemp("comfy-minimax")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    server = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME],
        cpu=False,
        models_dir=MODELS,
        extra_env={"PLENIO_OFFLINE": "1"},
    )
    server.start()
    yield server
    server.stop()


def prompt() -> dict[str, Any]:
    state = json.dumps(
        {
            "schema": "plenio.sheet_state/1",
            "docs": {
                "title": {"state": "manual", "text": "Morning Light"},
                "style": {"state": "manual", "text": CAPTION},
                "lyrics": {"state": "manual", "text": LYRICS},
            },
        }
    )
    return {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": FILES["diffusion_models"], "weight_dtype": "default"},
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": FILES["text_encoders"], "type": "minimax", "device": "default"},
        },
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": FILES["vae"]}},
        "4": {"class_type": "PlenioEngine", "inputs": {"clip": ["2", 0]}},
        "5": {
            "class_type": "PlenioSongSheet",
            "inputs": {"engine": ["4", 0], "review": "continue", "sheet_state": state},
        },
        "6": {
            "class_type": "MiniMaxMusic3TextEncode",
            "inputs": {
                "clip": ["2", 0],
                "caption": ["5", 1],
                "lyrics": ["5", 2],
                "seed": 7,
                "max_duration": 30.0,
                "cfg_scale": 1.7,
                "top_k": 50,
            },
        },
        "7": {
            "class_type": "EmptyMiniMaxMusic3LatentAudio",
            "inputs": {"seconds": ["6", 1], "batch_size": 1},
        },
        "8": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["6", 0]}},
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["6", 0],
                "negative": ["8", 0],
                "latent_image": ["7", 0],
                "seed": 7,
                "steps": 30,
                "cfg": 1.7,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
        },
        "10": {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["9", 0], "vae": ["3", 0]}},
        "11": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["10", 0],
                "title": ["5", 0],
                "folder": "plenio-smoke/minimax",
                "naming": "{title}",
                "collision": "number",
                "reports.report_0": ["5", 7],
            },
        },
    }


def test_minimax_renders_with_an_exact_budget(gpu_server: ComfyServer) -> None:
    entry = gpu_server.run(prompt(), timeout=1800)
    payload = entry["outputs"]["5"]["plenio_sheet"][0]
    assert payload["engine"] == "minimax_music3"
    budget = payload["validation"]["budget"]
    assert budget["exact"] is True and 0 < budget["prompt_tokens"] < 5000
    folder = gpu_server.output_dir / "plenio-smoke" / "minimax"
    record = json.loads((folder / "Morning Light.plenio.json").read_text(encoding="utf-8"))
    assert (folder / "Morning Light.flac").stat().st_size > 100_000
    assert 5.0 < record["audio"]["seconds"] <= 30.5
    assert record["documents"]["style"]["text"] == CAPTION
