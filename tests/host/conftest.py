from __future__ import annotations

import shutil
from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, Log, copy_package

HERE = Path(__file__).resolve().parent
FIXTURE_BLUEPRINT = PROJECT / "tests" / "fixtures" / "graphs" / "Plenio Test Blueprint.json"
COVER_EVENTS = PROJECT / "tests" / "fixtures" / "cover" / "minimax-excerpt.events.json"

TINY_UNIVERSR = {
    "model": {
        "in_channels": 2,
        "out_channels": 2,
        "dims": [16, 32],
        "depths": [1, 1],
        "drop_path": 0,
        "time_dim": 32,
        "cond_dim": 32,
        "total_freq_bins": 512,
        "hr_freq_bins": 432,
        "feature_enc_layers": 2,
        "cond_dropout_prob": 0.1,
        "sr_to_lr_bins": {8: 80, 12: 128, 16: 170, 24: 256},
    },
    "transform": {
        "window_fn": "hann",
        "n_fft": 1024,
        "sampling_rate": 48000,
        "hop_length": 512,
        "alpha": 0.2,
        "beta": 1,
        "comp_eps": 0.0001,
    },
    "path": {"init_args": {"sigma_min": 0.0001}},
}


def tiny_universr_checkpoint(folder: Path) -> None:
    """Write a real *tiny* UniverSR checkpoint (random weights) into an audio model folder.

    The host suite then loads it with the vendored adapter code - the released architecture with
    small dimensions, so the plumbing (config, device, chunking, shapes, determinism) runs on the
    CPU in seconds. The released weights and the listening study stay on the owner's machine (L1).
    """
    try:
        import torch

        from plenio.third_party.universr import ensure_dependencies
        from plenio.third_party.universr.models.unet import ConvNeXtUNetCond
    except ImportError:  # einops/torch missing: the adapter tests skip themselves
        return
    ensure_dependencies()
    torch.manual_seed(0)
    model = ConvNeXtUNetCond(**TINY_UNIVERSR["model"])
    folder.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": model.state_dict(), "config": TINY_UNIVERSR}, folder / "tiny-universr.bin")


@pytest.fixture(scope="session")
def server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-host")
    custom = base / "custom_nodes"
    custom.mkdir()
    copy_package(custom, {"subgraphs/Plenio Test Blueprint.json": FIXTURE_BLUEPRINT})
    shutil.copytree(
        HERE / "plenio_test_nodes", custom / "plenio_test_nodes", ignore=shutil.ignore_patterns("__pycache__")
    )
    shutil.copy2(COVER_EVENTS, custom / "plenio_test_nodes" / COVER_EVENTS.name)
    # a model file no engine adapter reads (Load Audio Model must refuse it clearly)
    for folder, name in (("audio_sr", "unknown-sr.safetensors"), ("audio_separation", "unknown-stems.ckpt")):
        (base / "models" / folder).mkdir(parents=True, exist_ok=True)
        (base / "models" / folder / name).write_bytes(b"")
    # ... and a real tiny UniverSR checkpoint for the adapter tests (D9)
    tiny_universr_checkpoint(base / "models" / "audio_sr")
    instance = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME, "plenio_test_nodes"],
        extra_env={"PLENIO_OFFLINE": "1"},  # tests never download; missing assets are an expected error
    )
    instance.start()
    yield instance
    instance.stop()


@pytest.fixture
def log(server: ComfyServer) -> Log:
    result = Log(server.output_dir / "plenio_test_log.jsonl")
    result.clear()
    return result
