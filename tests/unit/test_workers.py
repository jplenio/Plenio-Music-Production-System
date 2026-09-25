"""Worker lifecycle with a fake worker: start, progress, result, errors, crash, timeouts, cancel."""

from __future__ import annotations

import sys
import threading
import time
from pathlib import Path

import pytest

from plenio.core.errors import PlenioCancelledError, PlenioWorkerError
from plenio.core.workers import WorkerEnv, WorkerLimits, run_worker

ROOT = Path(__file__).resolve().parents[2]
ENV = WorkerEnv(python=Path(sys.executable), pythonpath=(ROOT, ROOT / "tests" / "fixtures" / "workers"))
MODULE = "plenio_fake_worker"


def run(mode: str, tmp_path: Path, **kwargs: object) -> dict[str, object]:
    return run_worker(MODULE, {"mode": mode, "payload": "Grüße"}, env=ENV, work_root=tmp_path, **kwargs)  # type: ignore[arg-type]


def test_result_and_progress(tmp_path: Path) -> None:
    events: list[tuple[float | None, str]] = []
    result = run("ok", tmp_path, on_progress=lambda f, m: events.append((f, m)))
    assert result["echo"] == "Grüße"
    assert events == [(0.5, "half way"), (1.0, "done")]
    assert list(tmp_path.iterdir()) == []  # job folder removed


def test_handled_error_keeps_message_and_hint(tmp_path: Path) -> None:
    with pytest.raises(PlenioWorkerError) as error:
        run("user_error", tmp_path)
    assert "The request was rejected." in str(error.value)
    assert "Send a better request." in str(error.value)
    assert error.value.details["type"] == "PlenioUserError"


def test_unexpected_exception_carries_traceback(tmp_path: Path) -> None:
    with pytest.raises(PlenioWorkerError, match="boom") as error:
        run("exception", tmp_path)
    assert "RuntimeError" in error.value.details["traceback"]


def test_crash_reports_exit_code_and_stderr_tail(tmp_path: Path) -> None:
    with pytest.raises(PlenioWorkerError) as error:
        run("crash", tmp_path)
    assert error.value.details["returncode"] == 3
    assert "simulated out of memory" in str(error.value)
    assert list(tmp_path.iterdir()) == []


def test_idle_timeout(tmp_path: Path) -> None:
    started = time.monotonic()
    with pytest.raises(PlenioWorkerError, match="no progress"):
        run("silent", tmp_path, limits=WorkerLimits(timeout_s=30, idle_timeout_s=1.0))
    assert time.monotonic() - started < 15


def test_total_timeout_even_with_progress(tmp_path: Path) -> None:
    with pytest.raises(PlenioWorkerError, match="did not finish"):
        run("busy", tmp_path, limits=WorkerLimits(timeout_s=1.5, idle_timeout_s=10))


def test_cancel_stops_the_worker(tmp_path: Path) -> None:
    flag = threading.Event()
    threading.Timer(0.8, flag.set).start()
    with pytest.raises(PlenioCancelledError):
        run("busy", tmp_path, is_cancelled=flag.is_set)
    assert list(tmp_path.iterdir()) == []


def test_no_sticky_state_between_calls(tmp_path: Path) -> None:
    with pytest.raises(PlenioWorkerError):
        run("crash", tmp_path)
    assert run("ok", tmp_path)["echo"] == "Grüße"
