"""Small file helpers: TOML reading and atomic writes."""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path
from typing import Any

from .errors import PlenioDependencyError, PlenioUserError


def read_toml(path: Path) -> dict[str, Any]:
    """Read a TOML file; syntax errors become ``PlenioUserError`` naming the file."""
    if sys.version_info >= (3, 11):
        import tomllib
    else:  # pragma: no cover - depends on the interpreter
        try:
            import tomli as tomllib
        except ModuleNotFoundError as error:
            raise PlenioDependencyError(
                "tomli", feature=f"Reading {path}", install="python -m pip install tomli"
            ) from error
    try:
        with path.open("rb") as handle:
            data: dict[str, Any] = tomllib.load(handle)
    except tomllib.TOMLDecodeError as error:
        raise PlenioUserError(f"{path} is not valid TOML: {error}", hint="Fix or delete the file.") from error
    return data


def atomic_write_bytes(path: Path, data: bytes) -> None:
    """Write ``data`` to ``path`` so that readers never see a partial file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(handle, "wb") as temp:
            temp.write(data)
            temp.flush()
            os.fsync(temp.fileno())
        os.replace(temp_name, path)
    except BaseException:
        Path(temp_name).unlink(missing_ok=True)
        raise


def atomic_write_text(path: Path, text: str) -> None:
    atomic_write_bytes(path, text.encode("utf-8"))
