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
