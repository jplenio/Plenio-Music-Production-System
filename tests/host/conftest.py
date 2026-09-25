from __future__ import annotations

import shutil
from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, Log, copy_package

HERE = Path(__file__).resolve().parent
FIXTURE_BLUEPRINT = PROJECT / "tests" / "fixtures" / "graphs" / "Plenio Test Blueprint.json"


@pytest.fixture(scope="session")
def server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-host")
    custom = base / "custom_nodes"
    custom.mkdir()
    copy_package(custom, {"subgraphs/Plenio Test Blueprint.json": FIXTURE_BLUEPRINT})
    shutil.copytree(
        HERE / "plenio_test_nodes", custom / "plenio_test_nodes", ignore=shutil.ignore_patterns("__pycache__")
    )
    instance = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME, "plenio_test_nodes"])
    instance.start()
    yield instance
    instance.stop()


@pytest.fixture
def log(server: ComfyServer) -> Log:
    result = Log(server.output_dir / "plenio_test_log.jsonl")
    result.clear()
    return result
