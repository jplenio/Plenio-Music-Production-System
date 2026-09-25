"""The Cover analysis nodes with the real models on local hardware (V3).

A GPU ComfyUI server runs the native SheetSage2 node and Plenio's Transcribe Score on the same
excerpt, then Transcribe Lyrics with faster-whisper large-v3 in its worker process.

Needs ``PLENIO_SMOKE=1``, ``PLENIO_COMFYUI_ROOT``, ``PLENIO_MODELS_DIR`` (with
``audio_encoders/sheetsage2_bf16.safetensors`` and ``audio_encoders/whisper-large-v3``, or set
``PLENIO_WHISPER_DIR``) and the MiniMax sample in ``assets/sound-samples`` (or ``PLENIO_LEGACY_SAMPLE``). About 2 minutes on an RTX 5060 Ti 16 GB.
"""

from __future__ import annotations

import json
import os
import shutil
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, Log, copy_package
from plenio.core import score as score_rules
from plenio.core.alignment import AsrWord, check_sung_lyrics

pytestmark = [pytest.mark.host, pytest.mark.smoke]

MODELS = Path(os.environ.get("PLENIO_MODELS_DIR", "") or "missing-models-dir")
WHISPER = Path(os.environ.get("PLENIO_WHISPER_DIR", "") or MODELS / "audio_encoders" / "whisper-large-v3")
SHEETSAGE = MODELS / "audio_encoders" / "sheetsage2_bf16.safetensors"
LEGACY_SAMPLE = Path(
    os.environ.get("PLENIO_LEGACY_SAMPLE", "")
    or PROJECT / "assets" / "sound-samples" / "Example Album - A Feeling With No Address.mp3"
)
FIXTURE = json.loads(
    (PROJECT / "tests" / "fixtures" / "cover" / "minimax-excerpt.json").read_text(encoding="utf-8")
)
EXCERPT = (18.33, 83.02)
"""M2 of Phase 4A: verse, pre-chorus and chorus of the legacy sample (``TrimAudioDuration``)."""


@pytest.fixture(scope="module")
def gpu_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    missing = [p for p in (SHEETSAGE, WHISPER / "model.bin", LEGACY_SAMPLE) if not p.exists()]
    if missing:
        pytest.skip(f"real-model files not found: {', '.join(str(p) for p in missing)}")
    here = Path(__file__).resolve().parent
    base = tmp_path_factory.mktemp("comfy-gpu")
    custom = base / "custom_nodes"
    custom.mkdir()
    copy_package(custom)
    shutil.copytree(
        here / "plenio_test_nodes", custom / "plenio_test_nodes", ignore=shutil.ignore_patterns("__pycache__")
    )
    shutil.copy2(
        PROJECT / "tests" / "fixtures" / "cover" / "minimax-excerpt.events.json", custom / "plenio_test_nodes"
    )
    (base / "input").mkdir()
    shutil.copy2(LEGACY_SAMPLE, base / "input" / "m1.mp3")  # a copy: the legacy asset stays untouched
    config = base / "user" / "plenio" / "config.toml"
    config.parent.mkdir(parents=True)
    config.write_text(f"[asset_paths]\nfaster-whisper-large-v3 = '{WHISPER.as_posix()}'\n", encoding="utf-8")
    server = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME, "plenio_test_nodes"],
        cpu=False,
        models_dir=MODELS,
        extra_env={"PLENIO_OFFLINE": "1"},
    )
    server.start()
    yield server
    server.stop()


def analysis_prompt() -> dict[str, Any]:
    start, duration = EXCERPT
    return {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": "m1.mp3"}},
        "2": {
            "class_type": "TrimAudioDuration",
            "inputs": {"audio": ["1", 0], "start_index": start, "duration": duration},
        },
        "3": {"class_type": "AudioEncoderLoader", "inputs": {"audio_encoder_name": SHEETSAGE.name}},
        "4": {
            "class_type": "SheetSage2AudioToABC",
            "inputs": {"audio_encoder": ["3", 0], "audio": ["2", 0], "mode": "full"},
        },
        "5": {
            "class_type": "PlenioTranscribeScore",
            "inputs": {"audio_encoder": ["3", 0], "audio": ["2", 0]},
        },
        "6": {"class_type": "PlenioTestSink", "inputs": {"value": ["4", 0], "label": "native"}},
        "7": {"class_type": "PlenioTestSink", "inputs": {"value": ["5", 0], "label": "plenio"}},
        "8": {"class_type": "PlenioTestTimelineProbe", "inputs": {"timeline": ["5", 1]}},
        "9": {
            "class_type": "PlenioTranscribeLyrics",
            "inputs": {
                "audio": ["2", 0],
                "score": ["5", 0],
                "timeline": ["5", 1],
                "engine": "faster-whisper large-v3",
                "language": "auto",
                "device": "auto",
            },
        },
        "10": {"class_type": "PlenioTestSink", "inputs": {"value": ["9", 0], "label": "lyrics"}},
        "11": {"class_type": "PlenioTestSink", "inputs": {"value": ["9", 2], "label": "language"}},
    }


def test_transcribe_score_and_lyrics_with_the_real_models(gpu_server: ComfyServer) -> None:
    log = Log(gpu_server.output_dir / "plenio_test_log.jsonl")
    log.clear()
    entry = gpu_server.run(analysis_prompt(), timeout=1200)
    sinks = {e["label"]: e["value"] for e in log.events() if e["node"] == "sink"}
    # the same score as the native node in full mode
    assert sinks["plenio"] == sinks["native"]
    analysis = score_rules.analyze(sinks["plenio"])
    assert analysis.ok
    probe = next(e for e in log.events() if e["node"] == "timeline")
    assert probe["bars"] == len(analysis.bars)  # one timeline bar per score bar
    assert probe["vocal_notes"] > 0 and probe["regions"]
    # sung words placed into the score's sections, close to the lyrics MiniMax was given
    lyrics = sinks["lyrics"]
    assert [line for line in lyrics.splitlines() if line.startswith("[")][:3] == [
        "[Verse]",
        "[Pre-Chorus]",
        "[Chorus]",
    ]
    heard = [
        AsrWord(0.0, 0.0, word)
        for word in " ".join(line for line in lyrics.splitlines() if not line.startswith("[")).split()
    ]
    check = check_sung_lyrics(FIXTURE["reference"], heard)
    assert check.wer is not None and check.wer <= 0.05, check.to_dict()
    assert sinks["language"] == "English"
    assert "beat grid" in entry["outputs"]["9"]["plenio_summary"][0]["markdown"]
    # resources: the result is cached on disk, the worker's audio file is gone
    assert len(list((gpu_server.base / "user" / "plenio" / "cache" / "asr").glob("*.json"))) == 1
    assert not list((gpu_server.base / "temp").rglob("asr-*.npy"))
