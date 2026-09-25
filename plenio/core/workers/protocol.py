"""Parent side of the worker protocol.

A worker is a Python module run as ``python -m <module> --job <folder>`` in a
separate process (optionally with another interpreter, for isolated
environments). Communication uses files in the job folder:

``request.json``    written by the parent before start
``progress.jsonl``  appended by the worker: ``{"progress": 0.4, "message": "..."}``
``result.json``     written atomically by the worker on success
``error.json``      written atomically by the worker on a handled failure
``stderr.log``      the worker's stderr (its tail is included in crash errors)

Files instead of pipes: no deadlocks on large outputs, and a crashed worker
leaves readable evidence.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..errors import PlenioCancelledError, PlenioWorkerError
from ..files import atomic_write_text

RESULT_SCHEMA = "plenio.worker_result/1"
ERROR_SCHEMA = "plenio.worker_error/1"
_STDERR_TAIL = 4000


@dataclass(frozen=True)
class WorkerEnv:
    """How to start a worker process."""

    python: Path = field(default_factory=lambda: Path(sys.executable))
    pythonpath: tuple[Path, ...] = ()
    extra_env: Mapping[str, str] = field(default_factory=dict)
    name: str = "host"
    """``host`` for ComfyUI's own interpreter, otherwise the isolated environment's name."""


@dataclass(frozen=True)
class WorkerLimits:
    timeout_s: float = 3600.0
    idle_timeout_s: float = 300.0
    poll_interval_s: float = 0.1


def _tail(path: Path) -> str:
    if not path.exists():
        return ""
    data = path.read_bytes()[-_STDERR_TAIL:]
    return data.decode("utf-8", errors="replace").strip()


def _read_new_progress(path: Path, offset: int) -> tuple[list[dict[str, Any]], int]:
    if not path.exists():
        return [], offset
    with path.open("rb") as handle:
        handle.seek(offset)
        chunk = handle.read()
    # Only complete lines; a half-written line is read on the next poll.
    end = chunk.rfind(b"\n")
    if end < 0:
        return [], offset
    events = []
    for line in chunk[: end + 1].splitlines():
        if line.strip():
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return events, offset + end + 1


def run_worker(
    module: str,
    request: Mapping[str, Any],
    *,
    env: WorkerEnv | None = None,
    limits: WorkerLimits | None = None,
    on_progress: Callable[[float | None, str], None] | None = None,
    is_cancelled: Callable[[], bool] | None = None,
    work_root: Path | None = None,
) -> dict[str, Any]:
    """Run ``module`` as a worker and return its result object.

    Raises ``PlenioCancelledError`` when ``is_cancelled`` becomes true and
    ``PlenioWorkerError`` for handled failures, crashes and timeouts. The job
    folder is removed afterwards in every case.
    """
    env = env or WorkerEnv()
    limits = limits or WorkerLimits()
    job = Path(tempfile.mkdtemp(prefix="plenio-job-", dir=work_root))
    try:
        atomic_write_text(job / "request.json", json.dumps(dict(request), ensure_ascii=False))
        process_env = dict(os.environ)
        process_env.update(env.extra_env)
        if env.pythonpath:
            parts = [str(p) for p in env.pythonpath]
            if process_env.get("PYTHONPATH"):
                parts.append(process_env["PYTHONPATH"])
            process_env["PYTHONPATH"] = os.pathsep.join(parts)
        process_env["PYTHONIOENCODING"] = "utf-8"
        with (job / "stderr.log").open("wb") as stderr:
            process = subprocess.Popen(  # noqa: S603 - fixed argv, no shell
                [str(env.python), "-m", module, "--job", str(job)],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=stderr,
                env=process_env,
            )
            try:
                _supervise(process, job, module, limits, on_progress, is_cancelled)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.wait()
        return _collect(process.returncode, job, module)
    finally:
        shutil.rmtree(job, ignore_errors=True)


def _supervise(
    process: subprocess.Popen[bytes],
    job: Path,
    module: str,
    limits: WorkerLimits,
    on_progress: Callable[[float | None, str], None] | None,
    is_cancelled: Callable[[], bool] | None,
) -> None:
    started = last_activity = time.monotonic()
    offset = 0
    while True:
        events, offset = _read_new_progress(job / "progress.jsonl", offset)
        if events:
            last_activity = time.monotonic()
            if on_progress is not None:
                for event in events:
                    fraction = event.get("progress")
                    on_progress(
                        float(fraction) if fraction is not None else None, str(event.get("message", ""))
                    )
        if process.poll() is not None:
            return
        if is_cancelled is not None and is_cancelled():
            raise PlenioCancelledError(f"Worker {module} was cancelled.")
        now = time.monotonic()
        if now - started > limits.timeout_s:
            raise PlenioWorkerError(
                f"Worker {module} did not finish within {limits.timeout_s:.0f} s and was stopped.",
                hint="Raise PLENIO_WORKER_TIMEOUT if the job is legitimately long.",
                details={"stderr": _tail(job / "stderr.log")},
            )
        if now - last_activity > limits.idle_timeout_s:
            raise PlenioWorkerError(
                f"Worker {module} reported no progress for {limits.idle_timeout_s:.0f} s and was stopped.",
                hint="The worker may be stuck; see the log. Raise PLENIO_WORKER_IDLE_TIMEOUT for slow machines.",
                details={"stderr": _tail(job / "stderr.log")},
            )
        time.sleep(limits.poll_interval_s)


def _collect(returncode: int, job: Path, module: str) -> dict[str, Any]:
    result_path, error_path = job / "result.json", job / "error.json"
    if error_path.exists():
        error = json.loads(error_path.read_text(encoding="utf-8"))
        raise PlenioWorkerError(
            f"Worker {module} failed: {error.get('message', 'no message')}",
            hint=error.get("hint"),
            details={"type": error.get("type"), "traceback": error.get("traceback", "")},
        )
    if returncode == 0 and result_path.exists():
        data = json.loads(result_path.read_text(encoding="utf-8"))
        if data.get("schema") != RESULT_SCHEMA:
            raise PlenioWorkerError(f"Worker {module} wrote an unknown result schema {data.get('schema')!r}.")
        result: dict[str, Any] = data.get("result", {})
        return result
    tail = _tail(job / "stderr.log")
    raise PlenioWorkerError(
        f"Worker {module} crashed with exit code {returncode} before writing a result."
        + (f"\nLast output:\n{tail}" if tail else ""),
        hint="See the output above; out-of-memory and missing packages are the usual causes.",
        details={"returncode": returncode, "stderr": tail},
    )
