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


def pytest_terminal_summary(terminalreporter: pytest.TerminalReporter) -> None:
    """On GitHub Actions, list every failure as an annotation, readable without opening the job log."""
    if os.environ.get("GITHUB_ACTIONS") != "true":
        return
    for report in terminalreporter.stats.get("failed", []) + terminalreporter.stats.get("error", []):
        crash = getattr(report.longrepr, "reprcrash", None)
        path = Path(crash.path if crash else report.location[0])
        try:
            path = path.resolve().relative_to(ROOT)
        except ValueError:
            pass
        line = crash.lineno if crash else (report.location[1] or 0) + 1
        message = f"{report.nodeid}: {crash.message if crash else report.longrepr}"[:1000]
        message = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        terminalreporter.write_line(f"::error file={path.as_posix()},line={line}::{message}")


@pytest.fixture(scope="session")
def comfy_path() -> Path:
    """Make ComfyUI importable in-process (contract tests of the adapter layer)."""
    root = Path(COMFY_ROOT).resolve()
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    return root
