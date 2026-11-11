"""Show one of the player's folders in the system's file manager (Studio add-on).

The folder is one of the player's own, chosen and checked by the caller (its packages, its videos, the
listener's visuals): no route passes a path of the request on. The file manager is started with an argument
list - never a command line built as one string, never a shell.

Standard library only.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

EXPLORER_SEPARATOR = ","
"""Explorer splits its own arguments at commas (``/e,/root,<folder>``): a folder with one in its name is handed
to the shell instead, which opens it without a command line."""


def explorer() -> str:
    """Windows' Explorer: the program in the Windows folder (the name alone only when that folder is unknown)."""
    windir = Path(os.environ.get("WINDIR") or os.environ.get("SystemRoot") or "C:\\Windows")
    program = windir / "explorer.exe"
    return str(program) if program.is_file() else "explorer.exe"


def show_folder(folder: Path) -> None:
    """Open ``folder`` (made when it is not there yet) in the system's file manager.

    On Windows Explorer is started as a program of its own: asking the shell to open the folder
    (``os.startfile``) did nothing in a player that ComfyUI started in the background, without a window."""
    folder.mkdir(parents=True, exist_ok=True)
    shown = str(folder.resolve())
    if sys.platform == "win32":
        if EXPLORER_SEPARATOR in shown:
            os.startfile(shown)  # noqa: S606 - a folder of the player's own; no program is named
            return
        subprocess.Popen([explorer(), shown])  # noqa: S603 - Explorer and one folder, as an argument list
    elif sys.platform == "darwin":
        subprocess.Popen(["/usr/bin/open", shown])  # noqa: S603 - a fixed program and one folder
    else:
        subprocess.Popen(["xdg-open", shown])  # noqa: S603, S607 - the desktop's opener and one folder
