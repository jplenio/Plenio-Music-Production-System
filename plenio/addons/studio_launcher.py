"""The Plenio Player starts ComfyUI (Studio add-on): the command, the start, the stop.

``plenio.player.studio`` keeps the settings and knows whether a ComfyUI answers; this module is the half that
runs a program. The player finds the ComfyUI it is installed in (``ComfyUI/custom_nodes/<Plenio>``: ``main.py``
two folders up), or the folder the admin chose, and starts it in the background: the Python of that ComfyUI (the
portable build's embedded Python, a ``.venv``) or the one the player runs on, ``main.py`` and the arguments the
admin set in Settings (``--models-directory D:/models``, ``--cuda-device 1`` ...) - an argument list, no shell, no
window, detached; its output in ``comfyui.log`` in the player's state folder. It listens on this computer only:
``--listen`` and ``--enable-cors-header`` are refused. A ComfyUI the player started can be stopped from it; one
started otherwise is never touched.

How each ComfyUI with Plenio was last started (its ``main.py``, Python and arguments) is kept in the player's
state folder when ComfyUI loads Plenio: the player starts it the same way when Settings has no arguments of its
own.

Standard library only.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from collections.abc import Callable
from pathlib import Path
from typing import TYPE_CHECKING, Any

from ..player import studio
from ..player.launch import windowless

if TYPE_CHECKING:
    from ..player.studio import StudioLauncher

START_FILE = "comfyui-start.json"
"""How each ComfyUI with Plenio was last started, in the player's state folder."""
NOT_REPEATED = {
    "--listen": "?",
    "--port": 1,
    "--enable-cors-header": "?",
    "--tls-keyfile": 1,
    "--tls-certfile": 1,
}
"""Arguments of the remembered start the player leaves out (and how many values follow): it keeps ComfyUI on this
computer, on its own port. ``?``: a value only when the next word is not an option."""
PYTHON_NAME = re.compile(r"pythonw?(\d+(\.\d+)*)?(\.exe)?", re.IGNORECASE)
"""A Python interpreter's file name (``python.exe``, ``python3.12``): the only program the player starts."""


def python_of(root: Path) -> tuple[Path, bool]:
    """The Python that runs ``root``'s ComfyUI, and whether it is the portable build's embedded one: the portable
    build's ``python_embeded`` beside the ComfyUI folder, a ``.venv`` or ``venv`` in it - else the player's own."""
    windows = os.name == "nt"
    embedded = root.parent / "python_embeded" / "python.exe"
    if windows and embedded.is_file():
        return embedded, True
    for venv in (".venv", "venv"):
        found = root / venv / ("Scripts/python.exe" if windows else "bin/python")
        if found.is_file():
            return found, False
    return Path(sys.executable), False


def repeatable(argv: list[str]) -> list[str]:
    """A start's arguments without those the player sets itself or refuses (the address, the port, TLS, CORS, the
    portable build's flag - added again when its Python is the embedded one)."""
    out: list[str] = []
    skip = 0
    for index, part in enumerate(argv):
        if skip:
            skip -= 1
            continue
        name = part.split("=", 1)[0].lower()
        if name == "--windows-standalone-build":
            continue
        values = NOT_REPEATED.get(name)
        if values is None:
            if any(ch in part for ch in "\r\n\0"):
                return []
            out.append(part)
            continue
        if "=" in part:
            continue
        following = argv[index + 1] if index + 1 < len(argv) else ""
        skip = 1 if values == 1 or (following and not following.startswith("-")) else 0
    return out


def remember_start(
    directory: Path, argv: list[str], python: str, clock: Callable[[], float] = time.time
) -> None:
    """Keep how this ComfyUI was started (called when ComfyUI loads Plenio): ``argv`` begins with its ``main.py``."""
    if not argv or Path(argv[0]).name != "main.py":
        return
    main = str(Path(argv[0]).resolve())
    file = directory / START_FILE
    try:
        known = json.loads(file.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        known = {}
    if not isinstance(known, dict):
        known = {}
    known[main] = {"python": python, "args": repeatable(list(argv[1:])), "at": clock()}
    directory.mkdir(parents=True, exist_ok=True)
    temp = file.with_suffix(".tmp")
    temp.write_text(json.dumps(known, indent=1), encoding="utf-8")
    temp.replace(file)


def remembered_start(directory: Path, root: Path | None = None) -> tuple[Path, dict[str, Any]] | None:
    """The last start of the ComfyUI in ``root`` (``None``: of any whose ``main.py`` still exists, the newest):
    its ``main.py`` and ``{python, args, at}``."""
    try:
        known = json.loads((directory / START_FILE).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not isinstance(known, dict):
        return None
    found: list[tuple[float, Path, dict[str, Any]]] = []
    for main, entry in known.items():
        path = Path(main)
        if not isinstance(entry, dict) or not path.is_file():
            continue
        if root is not None and path.resolve() != (root / "main.py").resolve():
            continue
        args = entry.get("args")
        if not isinstance(args, list) or not all(isinstance(a, str) for a in args):
            continue
        found.append((float(entry.get("at") or 0), path, entry))
    if not found:
        return None
    _at, path, entry = max(found, key=lambda item: item[0])
    return path, entry


def last_root(directory: Path) -> Path | None:
    """The folder of the ComfyUI last started with Plenio (ComfyUI Desktop keeps Plenio outside its own folder)."""
    last = remembered_start(directory)
    return last[0].parent if last and studio.is_comfyui(last[0].parent) else None


def arguments(launcher: StudioLauncher, root: Path) -> tuple[list[str], str, dict[str, Any] | None]:
    """The arguments for ``main.py``: the ones set in Settings, else those of the last start of this ComfyUI
    (its models folder, its options), else none - and where they come from (``settings``, ``last start`` or
    ``""``), with that last start."""
    own = str(launcher.settings.get("args") or "").strip()
    if own:
        return studio.parse_args(own), "settings", None
    last = remembered_start(launcher.directory, root)
    if last is None:
        return [], "", None
    # filtered again: the file is the player's, but a hand-edited --listen must not open ComfyUI to the network
    return repeatable(list(last[1]["args"])), "last start", last[1]


def command(launcher: StudioLauncher) -> tuple[list[str], Path]:
    """The argument list that starts ComfyUI, and the folder it runs in."""
    root = launcher.root()
    if root is None:
        raise studio.StudioLaunchError(
            "The player does not know yet how to start ComfyUI: Plenio is not inside a ComfyUI folder here, and "
            "ComfyUI has not run with Plenio since. Start ComfyUI once the way you usually do - from then on the "
            "player starts it the same way - or choose its folder under How it starts ComfyUI.",
            409,
        )
    extra, _source, last = arguments(launcher, root)
    python, embedded = python_of(root)
    last_python = Path(str((last or {}).get("python") or ""))
    if last_python.is_file() and PYTHON_NAME.fullmatch(last_python.name):
        # the Python it last ran on (ComfyUI Desktop's own environment, a conda one ...) - a Python, whatever
        # the start file says
        python = last_python
        embedded = python.parent.name == "python_embeded"
    argv = [str(python)]
    if embedded:
        argv.append("-s")
    argv += [str(root / "main.py"), "--port", str(int(launcher.settings.get("port") or 8188))]
    if embedded:
        argv.append("--windows-standalone-build")
    argv += extra
    return argv, root


def start(launcher: StudioLauncher) -> subprocess.Popen[bytes]:
    """Start ComfyUI in the background for ``launcher`` (which holds its lock and found none answering): the
    process, its output appended to ``comfyui.log``."""
    argv, root = command(launcher)
    launcher.directory.mkdir(parents=True, exist_ok=True)
    flags: dict[str, Any] = {}
    if sys.platform == "win32":
        flags["creationflags"] = windowless()
    else:
        flags["start_new_session"] = True
    log = (launcher.directory / studio.LOG).open("ab")
    try:
        log.write(f"\n--- started by the Plenio Player {time.ctime()}: {' '.join(argv)}\n".encode())
        log.flush()
        return subprocess.Popen(  # noqa: S603 - an argument list, no shell
            argv,
            cwd=str(root),
            stdin=subprocess.DEVNULL,
            stdout=log,
            stderr=subprocess.STDOUT,
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
            **flags,
        )
    finally:
        log.close()


def stop(process: subprocess.Popen[bytes]) -> None:
    """Stop the ComfyUI the player started - on Windows the whole tree: ComfyUI may have started workers."""
    if sys.platform == "win32":
        subprocess.run(  # noqa: S603, S607 - a fixed argument list
            ["taskkill", "/T", "/F", "/PID", str(process.pid)], capture_output=True, check=False
        )
    else:
        process.terminate()
    try:
        process.wait(timeout=15)
    except subprocess.TimeoutExpired:
        process.kill()
