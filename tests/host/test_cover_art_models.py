"""Cover Art with the real FLUX.2 Klein 4B files on local hardware (V3, Phase 8).

The nodes of the *Plenio · Cover Art* block paint a cover from an artwork prompt; Export Release saves
it next to a short audio file (and embeds it when mutagen is installed). Needs ``PLENIO_SMOKE=1``,
``PLENIO_COMFYUI_ROOT`` and ``PLENIO_MODELS_DIR`` with the three FLUX.2 Klein files.
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import numpy as np
import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package
from plenio.core.release import read_tags, write_audio

pytestmark = [pytest.mark.host, pytest.mark.smoke]

MODELS = Path(os.environ.get("PLENIO_MODELS_DIR", "") or "missing-models-dir")
FILES = {
    "diffusion_models": "flux-2-klein-4b.safetensors",
    "text_encoders": "qwen_3_4b.safetensors",
    "vae": "flux2-vae.safetensors",
}
PROMPT = "Album cover: a sunlit kitchen window at dawn, a steaming cup, soft watercolor, warm colors, no text"


@pytest.fixture(scope="module")
def gpu_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    missing = [f"{folder}/{name}" for folder, name in FILES.items() if not (MODELS / folder / name).exists()]
    if missing:
        pytest.skip(f"FLUX.2 Klein files not found under {MODELS}: {', '.join(missing)}")
    base = tmp_path_factory.mktemp("comfy-cover-art")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    (base / "input").mkdir()
    t = np.arange(44100 * 3) / 44100
    write_audio(base / "input" / "cover-art.flac", 0.2 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2), 44100)
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


def prompt(folder: str) -> dict[str, Any]:
    return {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": FILES["diffusion_models"], "weight_dtype": "default"},
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": FILES["text_encoders"], "type": "flux2", "device": "default"},
        },
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": FILES["vae"]}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"text": PROMPT, "clip": ["2", 0]}},
        "5": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["4", 0]}},
        "6": {
            "class_type": "CFGGuider",
            "inputs": {"model": ["1", 0], "positive": ["4", 0], "negative": ["5", 0], "cfg": 1.0},
        },
        "7": {"class_type": "RandomNoise", "inputs": {"noise_seed": 0}},
        "8": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "9": {"class_type": "Flux2Scheduler", "inputs": {"steps": 4, "width": 1024, "height": 1024}},
        "10": {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {"width": 1024, "height": 1024, "batch_size": 1},
        },
        "11": {
            "class_type": "SamplerCustomAdvanced",
            "inputs": {
                "noise": ["7", 0],
                "guider": ["6", 0],
                "sampler": ["8", 0],
                "sigmas": ["9", 0],
                "latent_image": ["10", 0],
            },
        },
        "12": {"class_type": "VAEDecode", "inputs": {"samples": ["11", 0], "vae": ["3", 0]}},
        "13": {"class_type": "LoadAudio", "inputs": {"audio": "cover-art.flac"}},
        "14": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["13", 0],
                "cover": ["12", 0],
                "title": "Cover Art Smoke",
                "folder": folder,
                "naming": "{title}",
                "collision": "overwrite",
            },
        },
    }


def test_cover_art_is_painted_and_exported(gpu_server: ComfyServer) -> None:
    from PIL import Image

    folder = "plenio-smoke/cover-art"
    gpu_server.run(prompt(folder), timeout=1800)
    base = gpu_server.output_dir / folder
    with Image.open(base / "Cover Art Smoke.jpg") as cover:
        assert cover.size == (1024, 1024)
        pixels = np.asarray(cover.convert("L"), dtype=np.float64)
    assert pixels.std() > 10  # a picture, not a flat colour
    record = json.loads((base / "Cover Art Smoke.plenio.json").read_text(encoding="utf-8"))
    assert any(f.get("role") == "cover" for f in record["files"])
    _tags, embedded = read_tags(base / "Cover Art Smoke.flac")
    try:
        import mutagen  # noqa: F401
    except ImportError:
        assert embedded is None
    else:
        assert embedded == (base / "Cover Art Smoke.jpg").read_bytes()
