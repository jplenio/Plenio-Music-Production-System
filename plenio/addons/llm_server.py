"""A ``llama-server`` program of this computer runs a GGUF file (Studio add-on).

Finds llama.cpp's server - the one named in Plenio's configuration, the one on the PATH, the builds other apps
install (Unsloth Studio, winget, Homebrew) - and starts it for ``plenio.core.llm.runtime``. Without this module
a GGUF file is run by an app that is already running (LM Studio, Ollama, a server the user started) or by
llama-cpp-python inside this Python.

Standard library only.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import IO

PROGRAM = "llama-server"
"""The only program this module starts: a file whose name begins with this (``llama-server.exe``,
``llama-server-cuda``); a configuration or an environment variable names no other program to run."""


def exe(name: str, platform: str) -> str:
    return name + ".exe" if platform == "win32" else name


def find_programs(
    env: Mapping[str, str], home: Path, *, platform: str, configured: Path | None = None
) -> list[tuple[str, Path]]:
    """The ``llama-server`` programs on this machine, best first, each with where it comes from: the configured
    one (the program or the folder that holds it), the PATH, Unsloth Studio, winget, Homebrew."""
    server = exe(PROGRAM, platform)
    local = Path(env["LOCALAPPDATA"]) if env.get("LOCALAPPDATA") else home / "AppData" / "Local"
    candidates: list[tuple[str, Path | None]] = []
    if configured is not None:
        program = configured / server if configured.is_dir() else configured
        if program.name.lower().startswith(PROGRAM):  # llama-server, llama-server.exe, llama-server-cuda ...
            candidates.append(("configured", program))
    found = shutil.which(PROGRAM, path=env.get("PATH"))
    candidates.append(("PATH", Path(found) if found else None))
    unsloth = home / ".unsloth" / "llama.cpp"
    for path in (
        unsloth / "build" / "bin" / "Release" / server,
        unsloth / "build" / "bin" / server,
        unsloth / server,
    ):
        candidates.append(("Unsloth Studio", path))
    candidates += [
        ("winget", p)
        for p in sorted((local / "Microsoft" / "WinGet" / "Packages").glob(f"ggml.llamacpp*/{server}"))
    ]
    for folder in ("/opt/homebrew/bin", "/usr/local/bin", str(home / ".local" / "bin")):
        candidates.append(("Homebrew" if "homebrew" in folder else "local", Path(folder) / server))
    programs: list[tuple[str, Path]] = []
    seen: set[str] = set()
    for origin, candidate in candidates:
        if candidate is None or not candidate.is_file():
            continue
        key = os.path.normcase(str(candidate.resolve()))
        if key not in seen:
            seen.add(key)
            programs.append((origin, candidate))
    return programs


def start(
    command: Sequence[str],
    arguments: Sequence[str],
    *,
    log: IO[bytes],
    env: Mapping[str, str],
    creationflags: int = 0,
) -> subprocess.Popen[bytes]:
    """Start the server program ``command`` with llama-server's ``arguments`` - an argument list, no shell, no
    console window, its output in ``log``."""
    return subprocess.Popen(  # noqa: S603 - an argument list, no shell
        [*command, *arguments],
        stdin=subprocess.DEVNULL,
        stdout=log,
        stderr=subprocess.STDOUT,
        env=dict(env),
        creationflags=creationflags,
    )
