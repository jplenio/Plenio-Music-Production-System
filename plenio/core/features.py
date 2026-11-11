"""Which optional parts this installation of Plenio carries.

The **Studio add-on** (``plenio/addons``) holds the functions that start a program on this computer other than
Plenio's own workers: the player starting ComfyUI, a ``llama-server`` program for GGUF files, the file manager.
A ``git clone`` and the release zip carry it; the Comfy Registry package leaves it out (``.comfyignore``), so that
the package starts nothing but this Python with Plenio's own modules. Every function that needs the add-on asks
:func:`has` first and says what to do instead when it is not there.

``PLENIO_ADDONS=0`` switches the add-on off where it is installed (an installation that should behave like the
Registry package).

Standard library only.
"""

from __future__ import annotations

import importlib
import os
from pathlib import Path
from types import ModuleType

ADDONS = ("studio_launcher", "llm_server", "file_manager")
"""The add-on's modules: the player starts ComfyUI; a llama-server program runs a GGUF file; a folder is shown in
the file manager."""
FOLDER = Path(__file__).resolve().parents[1] / "addons"
SWITCH = "PLENIO_ADDONS"
FULL_DOWNLOAD = "https://github.com/jplenio/Plenio-Music-Production-System#install"
"""Where the installation with the add-on is described (named in the sentences that say what is missing)."""


def enabled() -> bool:
    """The add-on is not switched off by ``PLENIO_ADDONS`` (``0``, ``off``, ``false`` or ``no``)."""
    return os.environ.get(SWITCH, "").strip().lower() not in ("0", "off", "false", "no")


def has(addon: str) -> bool:
    """Whether this installation carries the Studio add-on module ``addon`` and may use it."""
    return addon in ADDONS and enabled() and (FOLDER / f"{addon}.py").is_file()


def load(addon: str) -> ModuleType:
    """The add-on module ``addon``; ask :func:`has` first (``ModuleNotFoundError`` when it is not installed)."""
    if not has(addon):
        raise ModuleNotFoundError(f"Plenio's Studio add-on ({addon}) is not part of this installation.")
    return importlib.import_module(f"..addons.{addon}", __package__)


def summary() -> dict[str, bool]:
    """Every add-on module and whether it is there (the System Check prints it)."""
    return {addon: has(addon) for addon in ADDONS}
