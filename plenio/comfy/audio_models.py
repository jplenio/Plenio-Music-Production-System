"""Audio models behind *Load Audio Model*: super-resolution and separation (next-release plan §4.3, §6.1).

A file in ``models/audio_sr`` or ``models/audio_separation`` is handed to the first registered
adapter that recognises it. An adapter wraps vendored inference code and ComfyUI's model
management (R9) and returns the engine object the pure core expects:

- super-resolution: ``core.audio.refine.Engine`` (``upsample(chunk, seed)`` at the engine's rate);
- separation: ``core.audio.stems.Separator`` (``separate(audio, rate) -> {name: stem}``).

The vendored adapters (UniverSR for super-resolution since D9, BS-RoFormer 4-stem for separation
since D11) register themselves when this module is first used; a file no adapter recognises is
refused with a clear message, and Refine's *resample only* engine needs no file at all. Model code
is imported only when a model is loaded (optional dependencies stay optional).
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..core.errors import PlenioModelError, PlenioUserError
from ..core.models import AUDIO_MODEL_FOLDERS

KINDS = tuple(AUDIO_MODEL_FOLDERS)


@dataclass(frozen=True)
class AudioModel:
    """What flows through a ``PLENIO_AUDIO_MODEL`` socket."""

    kind: str
    """``super-resolution`` or ``separation``."""
    file: str
    adapter: str
    engine: Any


@dataclass(frozen=True)
class Adapter:
    name: str
    kind: str
    matches: Callable[[str], bool]
    """Does this adapter read the file (by name; the catalogue entry names the adapter)?"""
    load: Callable[[Path], Any]


_ADAPTERS: dict[str, Adapter] = {}
_REGISTERED = False


def _ensure_registered() -> None:
    """Import the adapter modules once (they import torch only when a model is loaded)."""
    global _REGISTERED
    if _REGISTERED:
        return
    _REGISTERED = True
    from . import msst, universr  # noqa: F401  (register the adapters of D9 and D11)


def register(adapter: Adapter) -> None:
    if adapter.kind not in KINDS:
        raise ValueError(f"unknown audio model kind {adapter.kind!r}")
    _ADAPTERS[adapter.name] = adapter


def adapters(kind: str) -> list[Adapter]:
    _ensure_registered()
    return [a for a in _ADAPTERS.values() if a.kind == kind]


def load(kind: str, file: str, path: Path) -> AudioModel:
    """Load ``file`` (found at ``path``) with the adapter that recognises it."""
    if kind not in KINDS:
        raise PlenioUserError(f"Unknown audio model kind {kind!r}; use one of {list(KINDS)}.")
    for adapter in adapters(kind):
        if adapter.matches(file):
            return AudioModel(kind, file, adapter.name, adapter.load(path))
    raise PlenioModelError(
        f"No {kind} engine in this version of Plenio reads {file!r}.",
        hint=(
            "Refine can run with the engine 'resample only' without any model file."
            if kind == "super-resolution"
            else "Keep the Stems block bypassed until a separation engine is installed."
        ),
    )


def require(model: Any, kind: str, node: str) -> Any:
    """The engine of a connected audio model of ``kind`` (a clear error for the wrong kind)."""
    if getattr(model, "kind", None) != kind or getattr(model, "engine", None) is None:
        found = getattr(model, "kind", type(model).__name__)
        raise PlenioUserError(
            f"{node} needs a {kind} model, but the connected Load Audio Model provides {found!r}.",
            hint=f"Set Load Audio Model's kind to {kind}.",
        )
    return model.engine
