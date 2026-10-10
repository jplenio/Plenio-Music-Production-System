"""Models in a location of extra_model_paths.yaml (a user's report 2026-10-10).

The user put the stem model into a new ``audio_separation`` folder beside the other model folders of their
extra_model_paths.yaml location; Load Audio Model found it only after it was copied into ComfyUI's own
``models`` folder. ComfyUI reads a folder of such a location only when the file names it, and no user's file
names Plenio's folders: Plenio now searches its own folders beside every model folder ComfyUI knows. ComfyUI's
own folders keep ComfyUI's rules; the System Check says where a missing file lies and which line is missing.
"""

from __future__ import annotations

import json
from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = pytest.mark.host


@pytest.fixture(scope="module")
def shared(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """A model location outside ComfyUI, as many users keep one for several installations."""
    root = tmp_path_factory.mktemp("shared models")
    (root / "checkpoints").mkdir()
    (root / "audio_separation").mkdir()
    (root / "audio_separation" / "shared-stems.ckpt").write_bytes(b"")
    (root / "audio_encoders").mkdir()  # not in the yaml: ComfyUI does not search it
    (root / "audio_encoders" / "sheetsage2_bf16.safetensors").write_bytes(b"")
    return root


@pytest.fixture(scope="module")
def extra_server(
    tmp_path_factory: pytest.TempPathFactory, comfy_path: Path, shared: Path
) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-extra-paths")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    config = base / "extra_model_paths.yaml"
    # the layout of ComfyUI's example: a base path and one line per model folder - none for Plenio's
    config.write_text(
        f"shared:\n  base_path: {json.dumps(str(shared))}\n  checkpoints: checkpoints\n", encoding="utf-8"
    )
    server = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME],
        extra_env={"PLENIO_OFFLINE": "1"},
        extra_args=["--extra-model-paths-config", str(config)],
    )
    server.start()
    yield server
    server.stop()


def test_plenio_folders_are_found_beside_the_extra_model_folders(
    extra_server: ComfyServer, shared: Path
) -> None:
    assert "shared-stems.ckpt" in extra_server.get("/models/audio_separation")
    info = json.dumps(extra_server.get("/object_info/PlenioAudioModelLoader"))
    assert "shared-stems.ckpt" in info
    assert "model folder audio_separation also searched in" in extra_server.log_text()
    # a folder made while ComfyUI runs counts after a refresh of the node list (R)
    (shared / "audio_sr").mkdir()
    (shared / "audio_sr" / "late-sr.bin").write_bytes(b"")
    assert "late-sr.bin" in json.dumps(extra_server.get("/object_info/PlenioAudioModelLoader"))


def test_the_system_check_names_a_model_comfyui_does_not_search(
    extra_server: ComfyServer, shared: Path
) -> None:
    data = extra_server.get("/plenio/system")
    report = data["report"]
    misplaced = report["data"]["facts"]["misplaced"]
    assert (
        Path(misplaced["sheetsage2_bf16.safetensors"])
        == shared / "audio_encoders" / "sheetsage2_bf16.safetensors"
    )
    assert "sheetsage2_bf16.safetensors" not in report["data"]["facts"]["models"]  # ComfyUI's rules stay
    line = next(m for m in report["messages"] if "sheetsage2_bf16.safetensors" in m)
    assert "does not search that folder" in line and "audio_encoders: ..." in line
