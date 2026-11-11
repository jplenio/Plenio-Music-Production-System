"""Host integration: Plenio exactly as the Comfy Registry ships it.

The package is the tracked files without what ``.comfyignore`` leaves out - no Studio add-on, no start scripts. A
ComfyUI that loads it registers every node, answers its routes and says in the System Check what the package leaves
out. (Every other host test runs without the add-on too; this one copies the packed file set itself.)
"""

from __future__ import annotations

import json
import subprocess
from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, copy_registry_package

pytestmark = pytest.mark.host


@pytest.fixture(scope="module")
def packed(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[tuple[ComfyServer, Path]]:
    inside = subprocess.run(  # noqa: S603, S607
        ["git", "-C", str(PROJECT), "rev-parse", "--is-inside-work-tree"], capture_output=True, check=False
    )
    if inside.returncode != 0:
        pytest.skip("no git checkout (the package is the tracked files)")
    base = tmp_path_factory.mktemp("comfy-registry")
    package = copy_registry_package(base / "custom_nodes")
    server = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME], extra_env={"PLENIO_OFFLINE": "1"})
    server.start()
    yield server, package
    server.stop()


def test_the_package_leaves_out_the_add_on_and_the_start_scripts(packed: tuple[ComfyServer, Path]) -> None:
    _, package = packed
    assert not (package / "plenio" / "addons").exists()
    assert not (package / "Plenio Player.bat").exists() and not (package / "plenio_player.sh").exists()
    assert not (package / "tests").exists() and not (package / "tools").exists()
    for kept in ("__init__.py", "plenio_player.py", "plenio/core/features.py", "plenio/player/studio.py"):
        assert (package / kept).is_file(), kept


def test_comfyui_loads_the_package_with_every_node(packed: tuple[ComfyServer, Path]) -> None:
    server, _ = packed
    text = server.log_text()
    assert "Cannot import" not in text and "Error while calling comfy_entrypoint" not in text
    assert "IMPORT FAILED" not in text and "Traceback" not in text
    snapshot = json.loads((PROJECT / "tools" / "data" / "node_types.json").read_text(encoding="utf-8"))
    expected = sorted(name for name in snapshot["nodes"] if name.startswith("Plenio"))
    registered = sorted(name for name in server.get("/object_info") if name.startswith("Plenio"))
    assert registered == expected and len(registered) >= 37


def test_the_system_check_says_what_the_package_leaves_out(packed: tuple[ComfyServer, Path]) -> None:
    server, _ = packed
    data = server.get("/plenio/system")
    assert "Studio add-on: not part of this installation" in data["markdown"]
    assert "Studio add-on: installed" not in data["markdown"]


def test_the_package_keeps_no_start_line_for_the_player(packed: tuple[ComfyServer, Path]) -> None:
    """With the add-on ComfyUI notes how it was started, for the player to start it the same way; the package
    notes nothing."""
    server, _ = packed
    assert not (server.base / "player-state" / "comfyui-start.json").exists()


def test_the_routes_answer_as_in_the_full_installation(packed: tuple[ComfyServer, Path]) -> None:
    server, _ = packed
    assert server.request("GET", "/plenio/templates")[0] == 200
    status, api = server.request("GET", "/plenio/api/v1/")
    assert status == 200 and api["api"]
