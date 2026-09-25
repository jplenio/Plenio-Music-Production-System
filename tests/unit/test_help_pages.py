"""Every Plenio node ships a help page (``web/docs/<node_id>.md``, shown by the ComfyUI frontend)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NODE_ID = re.compile(r'node_id="(Plenio\w+)"')


def node_ids() -> set[str]:
    ids: set[str] = set()
    for path in (ROOT / "plenio" / "comfy" / "nodes").glob("*.py"):
        ids.update(NODE_ID.findall(path.read_text(encoding="utf-8")))
    return ids


def test_every_node_has_a_help_page() -> None:
    ids = node_ids()
    assert len(ids) >= 12
    missing = sorted(i for i in ids if not (ROOT / "web" / "docs" / f"{i}.md").is_file())
    assert not missing, f"help pages missing for {missing}"


def test_help_pages_start_with_a_title() -> None:
    for page in (ROOT / "web" / "docs").glob("*.md"):
        assert page.read_text(encoding="utf-8").startswith("# "), page.name
