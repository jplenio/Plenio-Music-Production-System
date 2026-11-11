"""Start the Plenio Player from ComfyUI with one click (owner's request 2026-10-16): find a player that runs on
this computer, or start one - as a program of its own, which keeps running when ComfyUI stops.

Standard library only; ComfyUI's route (``plenio.comfy.routes``) calls :func:`ensure_player` in a thread.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path
from typing import Any

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = PACKAGE_ROOT / "plenio_player.py"
PORTS = range(8765, 8770)
APP = "plenio-player"
STARTING_S = 120.0
"""A player this ComfyUI started is waited for this long before another one would be started."""
_lock = threading.Lock()
_started: dict[tuple[Path, int], tuple[subprocess.Popen[bytes], float]] = {}
"""The players this ComfyUI started ((state folder, port) -> process, when): a click while one starts waits for
it."""


def windowless() -> int:
    """Windows' flags for a Python started in the background: a console of its own without a window, in a process
    group of its own. Not ``DETACHED_PROCESS``: a venv's ``python.exe`` is a launcher that starts the real
    interpreter as its child, which - finding no console to inherit - got a new one, a window that popped up (with
    Windows Terminal as the default terminal an error tab, 0x800700e8, when the process ended)."""
    if sys.platform != "win32":
        return 0
    return subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP


LISTENING_S = 0.25
"""How long a connection to this computer may take to open. A listener's connection opens within a
millisecond, also while its program is busy (the system accepts it); a port nobody listens on refuses, and
Windows takes two seconds to say so - which made five empty ports ten seconds of waiting."""


def _listening(port: int, timeout: float = LISTENING_S) -> bool:
    """Something accepts connections on ``127.0.0.1:port``."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.settimeout(timeout)
        return probe.connect_ex(("127.0.0.1", port)) == 0


def player_at(port: int, timeout: float = 2.0) -> dict[str, Any] | None:
    """The Plenio Player answering on ``127.0.0.1:port`` (its ``/api/info``), else ``None``. A port nobody
    listens on is known at once; a listener has ``timeout`` seconds to answer."""
    if not _listening(port):
        return None
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/info", timeout=timeout) as answer:  # noqa: S310 - loopback only
            info = json.loads(answer.read().decode("utf-8"))
    except (OSError, ValueError):
        return None
    return info if isinstance(info, dict) and info.get("app") == APP else None


def _port_free(port: int) -> bool:
    """Nothing listens on ``127.0.0.1:port``: a connection is refused. A listener that is slow to answer (a
    player busy reading its songs) holds the port all the same."""
    return not _listening(port)


def _same_state(info: dict[str, Any], state: Path) -> bool:
    try:
        return Path(str(info.get("state") or "")).resolve() == (state / "state.json").resolve()
    except OSError:
        return False


def find_player(state: Path | None = None) -> tuple[int, dict[str, Any]] | None:
    """A Plenio Player running on one of the player's ports; with ``state``, only the one that keeps its state
    there (a player started for another state folder - another library, other playlists - is not this one)."""
    for port in PORTS:
        info = player_at(port)
        if info and (state is None or _same_state(info, state)):
            return port, info
    return None


def start_player(folder: Path, comfyui: str, port: int, state: Path) -> subprocess.Popen[bytes]:
    """Start a player in the background: this Python, the package's ``plenio_player.py`` (it puts the package
    on its own import path, also in the portable build's embedded Python), a fixed argument list, no shell,
    no window, detached from ComfyUI. Its output goes to ``player.log`` in its state folder."""
    state.mkdir(parents=True, exist_ok=True)
    log = (state / "player.log").open("ab")
    flags: dict[str, Any] = {}
    if sys.platform == "win32":
        flags["creationflags"] = windowless()
    else:
        flags["start_new_session"] = True
    # the launcher script; a copy of the package without it (some installs copy only the folders) runs the
    # module with the package on the import path
    # the player keeps its state where its log goes (it read the default folder before, so a player started
    # for another state folder took that folder's chosen music folders)
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PLENIO_PLAYER_STATE": str(state)}
    if SCRIPT.is_file():
        command = [sys.executable, str(SCRIPT)]
    else:
        command = [sys.executable, "-m", "plenio.player"]
        env["PYTHONPATH"] = os.pathsep.join(p for p in (str(PACKAGE_ROOT), env.get("PYTHONPATH", "")) if p)
    command += ["--no-browser", "--port", str(port), "--folder", str(folder)]
    if comfyui:
        command += ["--comfyui", comfyui]
    try:
        return subprocess.Popen(  # noqa: S603 - fixed argv, no shell
            command,
            cwd=str(PACKAGE_ROOT),
            stdin=subprocess.DEVNULL,
            stdout=log,
            stderr=subprocess.STDOUT,
            env=env,
            **flags,
        )
    finally:
        log.close()


def ensure_player(folder: Path, comfyui: str, state: Path, wait: float = 60.0) -> dict[str, Any]:
    """The address of a running Plenio Player - the one found, or one started now. ``started`` says which;
    raises ``RuntimeError`` when the player did not come up (the end of its log says why). One at a time: a
    second click while a player starts waits for that one (owner's report 2026-10-23: two clicks started two
    players, and the second found its port taken)."""
    with _lock:
        return _ensure(folder, comfyui, state, wait)


def _ensure(folder: Path, comfyui: str, state: Path, wait: float, *, again: bool = True) -> dict[str, Any]:
    found = find_player(state)
    if found:
        running, info = found
        return {"url": f"http://127.0.0.1:{running}/", "started": False, "version": info.get("version", "")}
    # a player this ComfyUI started a moment ago for the same state, still on its way up
    starting = next(
        (
            (port, process)
            for (folder_of, port), (process, at) in _started.items()
            if folder_of == state
            and port in PORTS
            and process.poll() is None
            and time.monotonic() - at < STARTING_S
        ),
        None,
    )
    if starting is not None:
        port, process = starting
    else:
        free = next((p for p in PORTS if _port_free(p)), None)
        if free is None:
            raise RuntimeError(f"Ports {PORTS.start}-{PORTS.stop - 1} are all taken by other programs.")
        port = free
        process = start_player(folder, comfyui, port, state)
        _started[(state, port)] = (process, time.monotonic())
    deadline = time.monotonic() + wait
    while time.monotonic() < deadline:
        answer = player_at(port)
        if answer:
            return {"url": f"http://127.0.0.1:{port}/", "started": True, "version": answer.get("version", "")}
        if process.poll() is not None:
            # it stopped - another player (started by hand, or by another ComfyUI) may have come up meanwhile
            found = find_player(state)
            if found:
                running, info = found
                return {
                    "url": f"http://127.0.0.1:{running}/",
                    "started": False,
                    "version": info.get("version", ""),
                }
            _started.pop((state, port), None)
            if starting is not None and again:
                # the player waited for had been quit a moment before: this click starts one of its own
                return _ensure(folder, comfyui, state, wait, again=False)
            break
        time.sleep(0.3)
    tail = ""
    try:
        tail = (state / "player.log").read_text(encoding="utf-8", errors="replace").strip().splitlines()[-1]
    except (OSError, IndexError):
        pass
    raise RuntimeError(f"The Plenio Player did not start. {tail}".strip())
