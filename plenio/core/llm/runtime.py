"""Run a GGUF file: start a llama.cpp server for it, ask it, stop it.

The server is a process of its own, so the operating system frees all of its memory when it ends -
nothing stays behind for ComfyUI's models to trip over (rule R9; the caller asks ComfyUI for room
before the start). Runtimes, in this order: a configured ``llama-server``, ``llama-server`` on the PATH,
the builds other apps install (Unsloth Studio, winget, Homebrew), and llama-cpp-python through Plenio's
small server (``plenio.workers.llama_http``), which takes the same command line.

This module starts one thing only: this Python with Plenio's own server module (the llama-cpp-python
runtime). Finding and starting a ``llama-server`` program is the Studio add-on's part
(``plenio/addons/llm_server.py``, see ``plenio.core.features``); an installation without the add-on - the
Comfy Registry package - does neither.
"""

from __future__ import annotations

import atexit
import importlib.util
import os
import socket
import subprocess
import sys
import tempfile
import threading
import time
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import TypeVar
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, build_opener

from .. import features
from ..errors import PlenioCancelledError, PlenioWorkerError
from .client import Server

PACKAGE_ROOT = Path(__file__).resolve().parents[3]
"""The folder that contains the ``plenio`` package (the server shim runs as ``python -m plenio...``)."""
SHIM_MODULE = "plenio.workers.llama_http"
SHIM_NAME = "llama-cpp-python"
ADDON = "llm_server"
NO_PROGRAM = (
    "This installation of Plenio starts no llama-server program (the Comfy Registry package leaves that part "
    "out)."
)
WAYS_WITHOUT_PROGRAM = (
    "Run the model in an app that is already running - LM Studio, Ollama or a llama-server you started yourself "
    "(Local LLM lists their models) -, or `pip install llama-cpp-python` into ComfyUI's Python, or choose "
    "ComfyUI's own Gemma 4 as the writer. Plenio from GitHub (git clone or the release zip) also starts an "
    "installed llama-server."
)
"""What runs a GGUF file where the Studio add-on is not installed."""
_LOG_TAIL = 3000
_OPENER = build_opener(ProxyHandler({}))
T = TypeVar("T")


@dataclass(frozen=True)
class Runtime:
    """A program that serves a GGUF file over an OpenAI-compatible API (llama-server's command line)."""

    name: str
    command: tuple[str, ...]
    env: Mapping[str, str] = field(default_factory=dict)


def _exe(name: str, platform: str) -> str:
    return name + ".exe" if platform == "win32" else name


def find_runtimes(
    env: Mapping[str, str],
    home: Path,
    *,
    platform: str = sys.platform,
    configured: Path | None = None,
    python: str = sys.executable,
) -> list[Runtime]:
    """The runtimes on this machine, best first (see the module text); ``configured`` is llama.cpp's
    ``llama-server`` or the folder that holds it - a program of another name is not started (a configuration, or
    an environment variable, names no other program to run). The ``llama-server`` programs are found by the Studio
    add-on; an installation without it runs GGUF files with llama-cpp-python only."""
    runtimes: list[Runtime] = []
    if features.has(ADDON):
        programs = features.load(ADDON).find_programs(env, home, platform=platform, configured=configured)
        runtimes += [Runtime(f"llama-server ({origin})", (str(program),)) for origin, program in programs]
    if importlib.util.find_spec("llama_cpp") is not None:
        runtimes.append(Runtime(SHIM_NAME, (python, "-m", SHIM_MODULE), {"PYTHONPATH": str(PACKAGE_ROOT)}))
    return runtimes


def is_shim(runtime: Runtime) -> bool:
    """``runtime`` is Plenio's own llama-cpp-python server on this Python - started here, with a fixed command."""
    return tuple(runtime.command) == (sys.executable, "-m", SHIM_MODULE)


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        port: int = probe.getsockname()[1]
        return port


def _tail(path: Path) -> str:
    try:
        return path.read_bytes()[-_LOG_TAIL:].decode("utf-8", errors="replace").strip()
    except OSError:
        return ""


class LocalServer:
    """One GGUF file served by one runtime on a free local port."""

    def __init__(self, runtime: Runtime, model: Path, *, context: int):
        self.runtime, self.model, self.context = runtime, model, context
        self.key = (runtime.command, os.path.normcase(str(model)), context)
        self._process: subprocess.Popen[bytes] | None = None
        self._log = Path(tempfile.gettempdir()) / f"plenio-llm-{os.getpid()}-{id(self)}.log"
        self.server: Server | None = None

    @property
    def running(self) -> bool:
        return self._process is not None and self._process.poll() is None

    def start(self, *, timeout_s: float = 900.0, is_cancelled: Callable[[], bool] | None = None) -> Server:
        port = _free_port()
        arguments = [
            *("-m", str(self.model), "--host", "127.0.0.1", "--port", str(port)),
            *("-c", str(self.context), "-np", "1"),
        ]
        env = dict(os.environ)
        for name, value in self.runtime.env.items():
            env[name] = value + (os.pathsep + env[name] if name == "PYTHONPATH" and env.get(name) else "")
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)  # no console window on Windows
        with self._log.open("wb") as log:
            if is_shim(self.runtime):
                self._process = subprocess.Popen(  # noqa: S603 - this Python, Plenio's own module, no shell
                    [sys.executable, "-m", SHIM_MODULE, *arguments],
                    stdin=subprocess.DEVNULL,
                    stdout=log,
                    stderr=subprocess.STDOUT,
                    env=env,
                    creationflags=flags,
                )
            elif features.has(ADDON):
                self._process = features.load(ADDON).start(
                    self.runtime.command, arguments, log=log, env=env, creationflags=flags
                )
            else:
                raise PlenioWorkerError(NO_PROGRAM, hint=WAYS_WITHOUT_PROGRAM)
        started = time.monotonic()
        try:
            while not self._healthy(port):
                if self._process.poll() is not None:
                    raise PlenioWorkerError(
                        f"{self.runtime.name} stopped while loading {self.model.name} "
                        f"(exit code {self._process.returncode}).\nLast output:\n{_tail(self._log)}",
                        hint="An unknown model architecture means the runtime is older than the model: update "
                        "llama.cpp (or set another llama-server in Plenio's config). Out of memory: choose a "
                        "smaller quantization or a shorter context.",
                    )
                if is_cancelled is not None and is_cancelled():
                    raise PlenioCancelledError(f"Loading {self.model.name} was cancelled.")
                if time.monotonic() - started > timeout_s:
                    raise PlenioWorkerError(
                        f"{self.runtime.name} did not load {self.model.name} within {timeout_s:.0f} s.",
                        hint="The file may be too large for this machine.",
                    )
                time.sleep(0.25)
        except BaseException:
            self.stop()
            raise
        self.server = Server(
            self.runtime.name,
            f"http://127.0.0.1:{port}/v1",
            start_hint=f"{self.runtime.name} stopped; see the log {self._log}.",
        )
        return self.server

    def _healthy(self, port: int) -> bool:
        try:
            with _OPENER.open(f"http://127.0.0.1:{port}/health", timeout=2) as response:
                return bool(response.status == 200)
        except HTTPError:  # 503 while the model loads
            return False
        except (URLError, OSError):
            return False

    def stop(self) -> None:
        process, self._process, self.server = self._process, None, None
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        try:
            self._log.unlink(missing_ok=True)
        except OSError:
            pass


class _Kept:
    """At most one server kept running between calls (``keep_loaded``); stopped when ComfyUI exits."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.server: LocalServer | None = None
        atexit.register(self.release)

    def take(self, key: tuple[object, ...]) -> LocalServer | None:
        """The kept server for ``key`` (removed from the slot); any other kept server is stopped."""
        server, self.server = self.server, None
        if server is not None and (server.key != key or not server.running):
            server.stop()
            server = None
        return server

    def release(self) -> None:
        server, self.server = self.server, None
        if server is not None:
            server.stop()


KEPT = _Kept()


def serve_file(
    model: Path,
    runtimes: Sequence[Runtime],
    *,
    context: int,
    keep_loaded: bool,
    use: Callable[[Server], T],
    before_start: Callable[[], None] | None = None,
    is_cancelled: Callable[[], bool] | None = None,
) -> tuple[T, str]:
    """Serve ``model`` with the first runtime, call ``use(server)`` and return its result and the
    runtime's name. ``before_start`` runs only when a process starts (to make room for it)."""
    if not runtimes:
        raise PlenioWorkerError(
            f"No llama.cpp runtime was found to run {model.name}.",
            hint="Install llama.cpp (Windows: `winget install llama.cpp`, macOS: `brew install llama.cpp`) or "
            "Unsloth Studio, or `pip install llama-cpp-python` into ComfyUI's Python - or set the path of a "
            "llama-server in PLENIO_LLAMA_SERVER. A running LM Studio or Ollama works without any of these."
            if features.has(ADDON)
            else f"{NO_PROGRAM} {WAYS_WITHOUT_PROGRAM}",
        )
    runtime = runtimes[0]
    with KEPT.lock:
        local = KEPT.take((runtime.command, os.path.normcase(str(model)), context))
        if local is None or local.server is None:
            if before_start is not None:
                before_start()
            local = LocalServer(runtime, model, context=context)
            server = local.start(is_cancelled=is_cancelled)
        else:
            server = local.server
        try:
            result = use(server)
        except BaseException:
            local.stop()
            raise
        if keep_loaded:
            KEPT.server = local
        else:
            local.stop()
    return result, runtime.name
