"""Shared test configuration.

Markers (see pyproject.toml): ``comfy`` needs ``PLENIO_COMFYUI_ROOT`` (an
importable ComfyUI checkout, run with ComfyUI's Python); ``host`` starts a real
ComfyUI server; ``smoke`` runs real models (``PLENIO_SMOKE=1``).
"""

from __future__ import annotations

import os
import socketserver
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest

# Property tests by profile (PD 10.1): 25 examples on every push and here, 300 in the weekly run
# (HYPOTHESIS_PROFILE=weekly). A test sets its deadline and health checks, never its number of examples.
try:
    from hypothesis import settings as _hypothesis

    _hypothesis.register_profile("push", max_examples=25)
    _hypothesis.register_profile("weekly", max_examples=300)
    _hypothesis.load_profile(os.environ.get("HYPOTHESIS_PROFILE", "push"))
except ImportError:  # the host job may run without Hypothesis
    pass

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


SERVER_POLL_S = 0.02
"""How often a test's server looks for its shutdown. The standard library's default is half a second, and
``shutdown()`` waits for the next look: every test that stops a server paid up to that."""
TEST_PASSWORD_ROUNDS = 1_000
"""PBKDF2 rounds for passwords set in tests; the player's own number is asserted by one test."""


@pytest.fixture(scope="session", autouse=True)
def quick_servers() -> Iterator[None]:
    """Servers started in this process stop at once (see ``SERVER_POLL_S``); what they answer is unchanged."""
    original = socketserver.BaseServer.serve_forever

    def serve_forever(self: socketserver.BaseServer, poll_interval: float = SERVER_POLL_S) -> None:
        original(self, poll_interval)

    patch = pytest.MonkeyPatch()
    patch.setattr(socketserver.BaseServer, "serve_forever", serve_forever)
    yield
    patch.undo()


@pytest.fixture(scope="session")
def production_password_rounds() -> int:
    """The rounds the player gives a new password, read before the tests lower them."""
    from plenio.player import accounts

    return accounts.ITERATIONS


@pytest.fixture(scope="session", autouse=True)
def quick_passwords(production_password_rounds: int) -> Iterator[None]:
    """Passwords set in tests are hashed with few rounds: a login costs a millisecond, not a tenth of a
    second. A stored password is still checked with the rounds stored beside it."""
    from plenio.player import accounts

    patch = pytest.MonkeyPatch()
    patch.setattr(accounts, "ITERATIONS", TEST_PASSWORD_ROUNDS)
    yield
    patch.undo()


@pytest.fixture(scope="session")
def comfy_path() -> Path:
    """Make ComfyUI importable in-process (contract tests of the adapter layer)."""
    root = Path(COMFY_ROOT).resolve()
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    return root
