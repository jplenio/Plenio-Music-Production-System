"""S-1, S-2, S-6: the YuE2 Song path and the writer with the real models on local hardware (V3).

* S-6 - the writer (Gemma 4 E4B, native Generate Text) drafts from a fixed brief; Parse and the Song
  Sheet accept the draft. The time is printed (``-s`` shows it).
* S-1 - a short sung song from fixed documents: YuE2 plans the score, Score Tools prepares it, the score
  sheet validates it, YuE2 renders it, Export writes FLAC and record. The record holds exactly the
  documents the sheets released and the audio stays within the score's ceiling.
* S-2 - the same as an instrumental: the lyrics are the single tag ``[instrumental]``, the score's Vocal
  voice is silent, and with SheetSage2 present Check Vocals reports on the take.

Needs ``PLENIO_SMOKE=1``, ``PLENIO_COMFYUI_ROOT`` and ``PLENIO_MODELS_DIR`` with the YuE2 int8 checkpoint
and the writer (``checkpoints/``, ``text_encoders/``); SheetSage2 (``audio_encoders/``) is optional.
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
from plenio.core.score.model import build

pytestmark = [pytest.mark.host, pytest.mark.smoke]

MODELS = Path(os.environ.get("PLENIO_MODELS_DIR", "") or "missing-models-dir")
CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"
SHEETSAGE = "sheetsage2_bf16.safetensors"
SUNG_STYLE = (
    "English, acoustic pop, warm female vocal, acoustic guitar, soft piano, 96 BPM, gentle and bright"
)
SUNG_LYRICS = (
    "[Verse]\nMorning light on the window\nCoffee warm in my hand\n\n"
    "[Chorus]\nSing it slow, let it go\nEvery road leads home"
)
INSTRUMENTAL_STYLE = (
    "instrumental, acoustic folk, fingerpicked guitar lead, soft piano, light brushes, 92 BPM"
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
    base = tmp_path_factory.mktemp("comfy-yue2-song")
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


def brief(vocals: str) -> dict[str, Any]:
    options = (
        {"vocals.language": "English", "vocals.voice": "warm female", "vocals.theme": ""}
        if vocals == "sung"
        else {"vocals.melody": "instrument plays the lead", "vocals.lead_instrument": "acoustic guitar"}
    )
    return {
        "class_type": "PlenioSongBrief",
        "inputs": {
            "template": "none",
            "description": "A short, bright song about a slow morning at home.",
            "genre": "acoustic pop",
            "mood": "warm, hopeful",
            "tempo": "96 BPM",
            "length": "short (about 1:30)",
            "vocals": vocals,
            **options,
            "key": "",
            "meter": "",
        },
    }


def manual(**docs: str) -> str:
    return json.dumps(
        {
            "schema": "plenio.sheet_state/1",
            "docs": {kind: {"state": "manual", "text": text} for kind, text in docs.items()},
        }
    )


def song_prompt(vocals: str, folder: str, *, check_vocals: bool = False) -> dict[str, Any]:
    style = SUNG_STYLE if vocals == "sung" else INSTRUMENTAL_STYLE
    lyrics = SUNG_LYRICS if vocals == "sung" else "[instrumental]"
    title = "Smoke Sung" if vocals == "sung" else "Smoke Instrumental"
    prompt: dict[str, Any] = {
        "1": brief(vocals),
        "2": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CHECKPOINT}},
        "3": {"class_type": "PlenioEngine", "inputs": {"clip": ["2", 1]}},
        "4": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": manual(title=title, style=style, lyrics=lyrics, artwork_prompt="A window."),
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
        "7": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["6", 0],
                "context_style": ["4", 1],
                "context_lyrics": ["4", 2],
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": "",
            },
        },
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
    if check_vocals:
        prompt["14"] = {"class_type": "AudioEncoderLoader", "inputs": {"audio_encoder_name": SHEETSAGE}}
        prompt["15"] = {
            "class_type": "PlenioVocalCheck",
            "inputs": {
                "audio": ["12", 0],
                "audio_encoder": ["14", 0],
                "tolerance_seconds": 0.0,
                "brief": ["1", 0],
            },
        }
        prompt["13"]["inputs"]["audio"] = ["15", 0]
        prompt["13"]["inputs"]["reports.report_2"] = ["15", 2]
    return prompt


def payload(entry: dict[str, Any], node: str) -> dict[str, Any]:
    result: dict[str, Any] = entry["outputs"][node]["plenio_sheet"][0]
    return result


def errors(sheet: dict[str, Any]) -> list[str]:
    return [f["message"] for f in sheet["findings"] if f["severity"] == "error"]


def test_s6_writer_draft_parses(gpu_server: ComfyServer) -> None:
    prompt = {
        "1": brief("sung"),
        "2": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CHECKPOINT}},
        "3": {"class_type": "PlenioEngine", "inputs": {"clip": ["2", 1]}},
        "4": {
            "class_type": "PlenioComposePrompt",
            "inputs": {"brief": ["1", 0], "engine": ["3", 0], "detail": "standard"},
        },
        "5": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        },
        "6": {
            "class_type": "TextGenerate",
            "inputs": {
                "clip": ["5", 0],
                "prompt": ["4", 0],
                "max_length": 2048,
                "sampling_mode": "on",
                "sampling_mode.temperature": 0.8,
                "sampling_mode.top_k": 64,
                "sampling_mode.top_p": 0.95,
                "sampling_mode.min_p": 0.05,
                "sampling_mode.repetition_penalty": 1.05,
                "sampling_mode.seed": 0,
                "sampling_mode.presence_penalty": 0.0,
                "thinking": False,
                "use_default_template": True,
                "mtp": "auto",
            },
        },
        "7": {"class_type": "PlenioParseDraft", "inputs": {"text": ["6", 0], "request": ["4", 1]}},
        "8": {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "title": ["7", 0],
                "style": ["7", 1],
                "lyrics": ["7", 2],
                "artwork_prompt": ["7", 3],
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": "",
            },
        },
    }
    started = time.monotonic()
    entry = gpu_server.run(prompt, timeout=1800)
    seconds = time.monotonic() - started
    sheet = payload(entry, "8")
    print(f"S-6 writer draft: {seconds:.1f} s; title {sheet['docs']['title']['text']!r}")
    assert sheet["docs"]["lyrics"]["text"].count("[") >= 2  # sectioned lyrics
    assert sheet["docs"]["style"]["text"].strip() and sheet["docs"]["title"]["text"].strip()
    assert errors(sheet) == [], sheet["status"]


def test_s1_sung_song_from_fixed_documents(gpu_server: ComfyServer) -> None:
    folder = "plenio-smoke/s1"
    entry = gpu_server.run(song_prompt("sung", folder), timeout=3600)
    text, score = payload(entry, "4"), payload(entry, "7")
    assert errors(score) == [] and errors(text) == [], (text["status"], score["status"])
    base = gpu_server.output_dir / folder
    record = json.loads((base / "Smoke Sung.plenio.json").read_text(encoding="utf-8"))
    assert record["documents"]["lyrics"]["text"] == text["docs"]["lyrics"]["text"] == SUNG_LYRICS
    assert record["documents"]["score"]["text"] == score["docs"]["score"]["text"]
    assert (base / "Smoke Sung.flac").stat().st_size > 100_000
    assert 5.0 < record["audio"]["seconds"] <= score["score_seconds"] + 0.5
    print(f"S-1: {record['audio']['seconds']} s of {score['score_seconds']} s ceiling")


def test_s2_instrumental_guarantees(gpu_server: ComfyServer) -> None:
    folder = "plenio-smoke/s2"
    check = (MODELS / "audio_encoders" / SHEETSAGE).exists()
    entry = gpu_server.run(song_prompt("instrumental", folder, check_vocals=check), timeout=3600)
    text, score = payload(entry, "4"), payload(entry, "7")
    assert text["docs"]["lyrics"]["text"] == "[instrumental]"
    assert errors(score) == [], score["status"]
    model = build(score["docs"]["score"]["text"])
    assert model.voice_elements("Vocal") and not any(e.is_note for e in model.voice_elements("Vocal"))
    record = json.loads(
        (gpu_server.output_dir / folder / "Smoke Instrumental.plenio.json").read_text(encoding="utf-8")
    )
    kinds = {report["kind"] for report in record["reports"]}
    if check:
        assert "vocal_check" in kinds, kinds
    print(f"S-2: {record['audio']['seconds']} s; reports {sorted(kinds)}")
