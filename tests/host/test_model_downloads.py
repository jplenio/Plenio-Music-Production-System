"""Host integration: model files fetched through Plenio Setup's routes and by a run with ``downloads = "auto"``,
from a throttled stand-in for Hugging Face reached as the mirror ``HF_ENDPOINT`` (``tools/fake_hub.py``). The
copied package's catalogue expects the stand-in's bytes; nothing leaves this computer."""

from __future__ import annotations

import shutil
import socket
import sys
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, Log, copy_package

pytestmark = pytest.mark.host

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "tools"))

from fake_hub import SIZE, rewrite_catalogue, serve  # noqa: E402

GATED = "flux2-vae.safetensors"


def free_port() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return int(probe.getsockname()[1])


@pytest.fixture(scope="module")
def fetching(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-downloads")
    custom = base / "custom_nodes"
    custom.mkdir()
    copy_package(custom)
    shutil.copytree(
        HERE / "plenio_test_nodes", custom / "plenio_test_nodes", ignore=shutil.ignore_patterns("__pycache__")
    )
    rewrite_catalogue(custom / PACKAGE_NAME / "resources" / "models.toml")
    port = free_port()
    hub = serve(port, bytes_per_second=4 * 2**20, gated=frozenset({GATED}))
    instance = ComfyServer(
        comfy_path,
        base,
        node_packs=[PACKAGE_NAME, "plenio_test_nodes"],
        extra_env={
            "PLENIO_OFFLINE": "0",
            "HF_HUB_OFFLINE": "0",
            "PLENIO_MODEL_DOWNLOADS": "auto",
            "HF_ENDPOINT": f"http://127.0.0.1:{port}",
        },
    )
    instance.start()
    yield instance
    instance.stop()
    hub.shutdown()


def prompt(component: str, label: str) -> dict[str, Any]:
    return {
        "1": {
            "class_type": "PlenioModelChoice",
            "inputs": {"component": component, "component.file": "auto"},
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 0], "label": label}},
    }


def test_setup_downloads_a_file_through_its_routes(fetching: ComfyServer) -> None:
    status, data = fetching.request("POST", "/plenio/setup/downloads", {"variants": ["minimax-vae"]})
    assert status == 200 and data["downloads"][0]["id"] == "minimax-vae", data
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        rows = {row["id"]: row for row in fetching.get("/plenio/setup/downloads")["downloads"]}
        if rows["minimax-vae"]["state"] in ("installed", "failed", "blocked"):
            break
        time.sleep(0.2)
    assert rows["minimax-vae"]["state"] == "installed", rows
    from plenio.core.models import load_components

    vae = load_components(HERE.parents[1] / "resources" / "models.toml")["minimax-vae"]
    assert (fetching.base / "models" / vae.folder / vae.default.file).stat().st_size == SIZE
    plan = fetching.get("/plenio/setup/plan")
    minimax = next(t for t in plan["templates"] if t["template"] == "3 · MiniMax · Song")
    assert next(p for p in minimax["picks"] if p["component"] == "minimax-vae")["installed"]


def test_a_run_on_auto_fetches_the_missing_file_and_goes_on(fetching: ComfyServer) -> None:
    log = Log(fetching.output_dir / "plenio_test_log.jsonl")
    log.clear()
    fetching.run(prompt("flux2-klein", "fetched"), timeout=120)
    values = [e["value"] for e in log.events() if e.get("node") == "sink" and e.get("label") == "fetched"]
    assert len(values) == 1 and any((fetching.base / "models").rglob(values[0])), values


def test_a_gated_file_stops_the_run_with_what_to_do(fetching: ComfyServer) -> None:
    error = fetching.run_expect_error(prompt("flux2-vae", "gated"))
    assert error["node_type"] == "PlenioModelChoice"
    message = error["exception_message"]
    assert GATED in message and "not downloaded" in message and "Hugging Face" in message, message
