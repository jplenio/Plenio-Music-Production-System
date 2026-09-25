"""Plenio and the legacy toolkit load side by side without ID collisions.

Optional: set ``PLENIO_LEGACY_NODE_DIR`` to an installed copy of the legacy
toolkit. The folder is linked (junction/symlink) into a temporary
``custom_nodes`` and loaded read-only by an isolated server.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, PROJECT, ComfyServer, copy_package, link_folder

pytestmark = pytest.mark.host
LEGACY = os.environ.get("PLENIO_LEGACY_NODE_DIR", "").strip()


@pytest.mark.skipif(not LEGACY, reason="set PLENIO_LEGACY_NODE_DIR to an installed legacy toolkit")
def test_plenio_and_legacy_toolkit_coexist(tmp_path: Path, comfy_path: Path) -> None:
    legacy = Path(LEGACY)
    custom = tmp_path / "custom_nodes"
    custom.mkdir()
    copy_package(custom)
    link = custom / legacy.name
    link_folder(legacy, link)
    server = ComfyServer(comfy_path, tmp_path, node_packs=[PACKAGE_NAME, legacy.name])
    try:
        server.start()
        info = server.get("/object_info")
    finally:
        server.stop()
        # Remove the link itself, never the linked folder (rmdir on a junction/unlink on a symlink).
        if os.name == "nt":
            os.rmdir(link)
        else:
            link.unlink()
    inventory = json.loads(
        (PROJECT / "docs" / "design" / "data" / "legacy-node-inventory.json").read_text("utf-8")
    )
    legacy_ids = {entry["id"] for entry in inventory}
    plenio_ids = {name for name in info if name.startswith("Plenio")}
    assert "PlenioSystemCheck" in plenio_ids
    assert legacy_ids & set(info), "the legacy toolkit did not load"
    assert not plenio_ids & legacy_ids
    log = server.log_text()
    assert f"Cannot import {custom / PACKAGE_NAME}" not in log
