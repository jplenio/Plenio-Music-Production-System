"""Optional Python packages: probing and actionable errors.

Nodes always register. A feature that needs a missing package raises
``PlenioDependencyError`` with the exact install command when it runs.
"""

from __future__ import annotations

import importlib
import importlib.metadata
import importlib.util
from dataclasses import dataclass
from types import ModuleType

from .errors import PlenioDependencyError


@dataclass(frozen=True)
class OptionalPackage:
    module: str
    distribution: str
    feature: str
    install: str


KNOWN_PACKAGES: tuple[OptionalPackage, ...] = (
    OptionalPackage("av", "av", "Audio export (Export Release)", "python -m pip install av"),
    OptionalPackage("PIL", "pillow", "Cover art (Export Release)", "python -m pip install pillow"),
    OptionalPackage(
        "scipy", "scipy", "Mastering DSP (EQ, Loudness & Dynamics)", "python -m pip install scipy"
    ),
    OptionalPackage(
        "faster_whisper",
        "faster-whisper",
        "Lyrics transcription of covers with lyrics (Transcribe Lyrics; optional)",
        "python -m pip install faster-whisper",
    ),
)


def _find(module: str) -> bool:
    try:
        return importlib.util.find_spec(module) is not None
    except (ImportError, ValueError):
        return False


def probe(packages: tuple[OptionalPackage, ...] = KNOWN_PACKAGES) -> dict[str, str | None]:
    """``{module: version or None}`` without importing the packages."""
    result: dict[str, str | None] = {}
    for package in packages:
        if not _find(package.module):
            result[package.module] = None
            continue
        try:
            result[package.module] = importlib.metadata.version(package.distribution)
        except importlib.metadata.PackageNotFoundError:
            result[package.module] = "unknown version"
    return result


def require(module: str, packages: tuple[OptionalPackage, ...] = KNOWN_PACKAGES) -> ModuleType:
    """Import ``module`` or raise ``PlenioDependencyError`` describing how to install it."""
    try:
        return importlib.import_module(module)
    except ModuleNotFoundError as error:
        if error.name not in (module, module.split(".")[0]):
            raise
        known = next((p for p in packages if p.module in (module, module.split(".")[0])), None)
        if known is None:
            raise PlenioDependencyError(
                module, feature=f"This feature (module {module})", install=f"python -m pip install {module}"
            ) from error
        raise PlenioDependencyError(
            known.distribution, feature=known.feature, install=known.install
        ) from error
