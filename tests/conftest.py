"""Shared test configuration.

Markers (see pyproject.toml): ``comfy`` needs ``PLENIO_COMFYUI_ROOT`` (an
importable ComfyUI checkout, run with ComfyUI's Python); ``host`` starts a real
ComfyUI server; ``smoke`` runs real models (``PLENIO_SMOKE=1``).
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "tests" / "fixtures"
COMFY_ROOT = os.environ.get("PLENIO_COMFYUI_ROOT", "").strip()


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    for item in items:
        if ("comfy" in item.keywords or "host" in item.keywords) and not COMFY_ROOT:
            item.add_marker(pytest.mark.skip(reason="set PLENIO_COMFYUI_ROOT to a ComfyUI checkout"))
        if "smoke" in item.keywords and os.environ.get("PLENIO_SMOKE") != "1":
            item.add_marker(pytest.mark.skip(reason="set PLENIO_SMOKE=1 to run real-model smoke tests"))


@pytest.fixture(scope="session")
def comfy_path() -> Path:
    """Make ComfyUI importable in-process (contract tests of the adapter layer)."""
    root = Path(COMFY_ROOT).resolve()
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    return root
