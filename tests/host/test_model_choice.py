"""Host integration: Model Choice in a running ComfyUI hands the chosen file's name to the node after it."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest

from harness import ComfyServer, Log

pytestmark = pytest.mark.host


def prompt(component: str, file: str, label: str) -> dict[str, Any]:
    return {
        "1": {
            "class_type": "PlenioModelChoice",
            "inputs": {"component": component, "component.file": file},
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 0], "label": label}},
    }


def received(log: Log, label: str) -> list[str]:
    return [e["value"] for e in log.events() if e.get("node") == "sink" and e.get("label") == label]


def catalogued(component: str) -> tuple[str, str, int]:
    from plenio.core.models import load_components

    found = load_components(Path(__file__).resolve().parents[2] / "resources" / "models.toml")[component]
    return found.folder, found.default.file, found.default.bytes


def test_a_pinned_file_of_ones_own_reaches_the_loader(server: ComfyServer, log: Log) -> None:
    folder = server.base / "models" / "checkpoints"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "my_yue2_finetune.safetensors").write_bytes(b"")
    server.run(prompt("yue2", "my_yue2_finetune.safetensors", "pinned"))
    assert received(log, "pinned") == ["my_yue2_finetune.safetensors"]


def test_auto_takes_the_catalogued_file_that_is_installed(server: ComfyServer, log: Log) -> None:
    """The MiniMax VAE has one variant; a file of its catalogued size counts as installed (a sparse file)."""
    folder, file, size = catalogued("minimax-vae")
    target = server.base / "models" / folder / file
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as handle:
        handle.truncate(size)
    try:
        server.run(prompt("minimax-vae", "auto", "auto"))
        assert received(log, "auto") == [file]
    finally:
        target.unlink()


def test_a_missing_file_stops_the_run_and_says_where_it_goes(server: ComfyServer) -> None:
    _folder, file, _size = catalogued("flux2-vae")
    error = server.run_expect_error(prompt("flux2-vae", "auto", "missing"))
    assert error["node_type"] == "PlenioModelChoice"
    assert file in error["exception_message"] and "Plenio Setup" in error["exception_message"]


def header_file(path: Path, header: dict[str, Any]) -> None:
    import json
    import struct

    raw = json.dumps(header).encode("utf-8")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(struct.pack("<Q", len(raw)) + raw)


def test_the_file_lists_say_which_files_a_loader_would_refuse(server: ComfyServer) -> None:
    folder = server.base / "models" / "vae"
    tensor = {"dtype": "F32", "data_offsets": [0, 4]}
    header_file(
        folder / "my_flux2_vae.safetensors",
        {
            "bn.running_mean": {**tensor, "shape": [128]},
            "encoder.conv_out.weight": {**tensor, "shape": [64, 512, 3, 3]},
            "decoder.conv_in.weight": {**tensor, "shape": [512, 32, 3, 3]},
        },
    )
    header_file(
        folder / "an_sdxl_vae.safetensors", {"encoder.conv_out.weight": {**tensor, "shape": [8, 512, 3, 3]}}
    )
    data = server.get("/plenio/models/files?component=flux2-vae")
    files = data["components"]["flux2-vae"]["files"]
    assert files["my_flux2_vae.safetensors"] is None
    pick = data["components"]["flux2-vae"]["pick"]
    assert pick["file"] == "flux2-vae.safetensors" and pick["reason"] and pick["source"] == "plan"
    assert "not a FLUX.2 VAE" in files["an_sdxl_vae.safetensors"]
    status, refused = server.request("GET", "/plenio/models/files?component=nope")
    assert status == 400 and "nope" in refused["error"]["message"]
    # pinned all the same, the file goes to the loader - with the reason in the summary
    error_or_run = server.run(prompt("flux2-vae", "an_sdxl_vae.safetensors", "wrong kind"))
    assert error_or_run["status"]["status_str"] == "success"
