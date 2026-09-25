"""Plenio's small configuration.

Precedence (lowest to highest): built-in defaults, the optional config file
``<ComfyUI user directory>/plenio/config.toml``, environment variables.
Invalid values raise ``PlenioUserError``; nothing is silently ignored.

Environment variables:

``PLENIO_OFFLINE``              ``1``/``0``: never touch the network
``HF_HUB_OFFLINE``              Hugging Face's own switch; also enables offline mode
``PLENIO_AUTO_DOWNLOAD``        ``1``/``0``: fetch missing Plenio assets when a node needs them
``PLENIO_ASSET_DIR``            folder for Plenio assets (default: ``models/plenio``)
``PLENIO_WORKER_TIMEOUT``       seconds a worker may run in total
``PLENIO_WORKER_IDLE_TIMEOUT``  seconds a worker may go without reporting progress

Config file only: ``[asset_paths]`` maps an asset id to an existing folder that
already holds its files (for example a Whisper model you downloaded before);
Plenio then uses that folder instead of ``<asset_dir>/<kind>/<id>``.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any

from .errors import PlenioUserError
from .files import read_toml

CONFIG_FILE_NAME = "config.toml"

_TRUE = {"1", "true", "yes", "on"}
_FALSE = {"0", "false", "no", "off"}
_HF_TRUE = {"1", "ON", "YES", "TRUE"}


@dataclass(frozen=True)
class PlenioConfig:
    offline: bool = False
    auto_download: bool = True
    asset_dir: Path | None = None
    worker_timeout_s: float = 3600.0
    worker_idle_timeout_s: float = 300.0
    asset_paths: Mapping[str, Path] = field(default_factory=dict)
    """Asset id -> an existing folder with the asset's files (config file ``[asset_paths]``)."""
    sources: Mapping[str, str] = field(default_factory=dict)
    """Where each non-default value came from (``file`` or the variable name)."""

    @classmethod
    def load(cls, *, env: Mapping[str, str], config_file: Path | None = None) -> PlenioConfig:
        config = cls()
        sources: dict[str, str] = {}
        if config_file is not None and config_file.is_file():
            values = read_toml(config_file)
            config = _apply_file(config, values, config_file, sources)
        config = _apply_env(config, env, sources)
        return replace(config, sources=sources)

    def summary(self) -> dict[str, Any]:
        return {
            "offline": self.offline,
            "auto_download": self.auto_download,
            "asset_dir": str(self.asset_dir) if self.asset_dir else None,
            "worker_timeout_s": self.worker_timeout_s,
            "worker_idle_timeout_s": self.worker_idle_timeout_s,
            "asset_paths": {key: str(value) for key, value in self.asset_paths.items()},
            "sources": dict(self.sources),
        }


def _parse_bool(value: str, name: str) -> bool:
    lowered = value.strip().lower()
    if lowered in _TRUE:
        return True
    if lowered in _FALSE:
        return False
    raise PlenioUserError(f"{name}={value!r} is not a boolean.", hint=f"Use one of {sorted(_TRUE | _FALSE)}.")


def _parse_seconds(value: Any, name: str) -> float:
    try:
        seconds = float(value)
    except (TypeError, ValueError) as error:
        raise PlenioUserError(f"{name}={value!r} is not a number of seconds.") from error
    if not seconds > 0:
        raise PlenioUserError(f"{name} must be greater than zero, got {value!r}.")
    return seconds


def _apply_file(
    config: PlenioConfig, values: dict[str, Any], path: Path, sources: dict[str, str]
) -> PlenioConfig:
    allowed = {"offline", "auto_download", "asset_dir", "workers", "asset_paths"}
    unknown = sorted(set(values) - allowed)
    if unknown:
        raise PlenioUserError(
            f"{path}: unknown settings {unknown}.", hint=f"Supported keys: {sorted(allowed)}."
        )
    updates: dict[str, Any] = {}
    for key in ("offline", "auto_download"):
        if key in values:
            if not isinstance(values[key], bool):
                raise PlenioUserError(f"{path}: '{key}' must be true or false.")
            updates[key] = values[key]
    if "asset_dir" in values:
        if not isinstance(values["asset_dir"], str) or not values["asset_dir"].strip():
            raise PlenioUserError(f"{path}: 'asset_dir' must be a non-empty path string.")
        updates["asset_dir"] = Path(values["asset_dir"]).expanduser()
    paths = values.get("asset_paths", {})
    if not isinstance(paths, dict) or not all(
        isinstance(k, str) and isinstance(v, str) and v.strip() for k, v in paths.items()
    ):
        raise PlenioUserError(f"{path}: [asset_paths] must map asset ids to folder path strings.")
    if paths:
        updates["asset_paths"] = {key: Path(value).expanduser() for key, value in paths.items()}
    workers = values.get("workers", {})
    if not isinstance(workers, dict):
        raise PlenioUserError(f"{path}: [workers] must be a table.")
    unknown_workers = sorted(set(workers) - {"timeout_seconds", "idle_timeout_seconds"})
    if unknown_workers:
        raise PlenioUserError(f"{path}: unknown [workers] settings {unknown_workers}.")
    if "timeout_seconds" in workers:
        updates["worker_timeout_s"] = _parse_seconds(workers["timeout_seconds"], "workers.timeout_seconds")
    if "idle_timeout_seconds" in workers:
        updates["worker_idle_timeout_s"] = _parse_seconds(
            workers["idle_timeout_seconds"], "workers.idle_timeout_seconds"
        )
    sources.update({key: "file" for key in updates})
    return replace(config, **updates)


def _apply_env(config: PlenioConfig, env: Mapping[str, str], sources: dict[str, str]) -> PlenioConfig:
    updates: dict[str, Any] = {}
    plenio_offline = _parse_bool(env["PLENIO_OFFLINE"], "PLENIO_OFFLINE") if "PLENIO_OFFLINE" in env else None
    hf_offline = env.get("HF_HUB_OFFLINE", "").strip().upper() in _HF_TRUE
    if plenio_offline:
        updates["offline"] = True
        sources["offline"] = "PLENIO_OFFLINE"
    elif hf_offline:
        # PLENIO_OFFLINE=0 cannot undo HF_HUB_OFFLINE=1: huggingface_hub stays offline anyway.
        updates["offline"] = True
        sources["offline"] = "HF_HUB_OFFLINE"
    elif plenio_offline is False:
        updates["offline"] = False
        sources["offline"] = "PLENIO_OFFLINE"
    if "PLENIO_AUTO_DOWNLOAD" in env:
        updates["auto_download"] = _parse_bool(env["PLENIO_AUTO_DOWNLOAD"], "PLENIO_AUTO_DOWNLOAD")
        sources["auto_download"] = "PLENIO_AUTO_DOWNLOAD"
    if env.get("PLENIO_ASSET_DIR", "").strip():
        updates["asset_dir"] = Path(env["PLENIO_ASSET_DIR"]).expanduser()
        sources["asset_dir"] = "PLENIO_ASSET_DIR"
    if "PLENIO_WORKER_TIMEOUT" in env:
        updates["worker_timeout_s"] = _parse_seconds(env["PLENIO_WORKER_TIMEOUT"], "PLENIO_WORKER_TIMEOUT")
        sources["worker_timeout_s"] = "PLENIO_WORKER_TIMEOUT"
    if "PLENIO_WORKER_IDLE_TIMEOUT" in env:
        updates["worker_idle_timeout_s"] = _parse_seconds(
            env["PLENIO_WORKER_IDLE_TIMEOUT"], "PLENIO_WORKER_IDLE_TIMEOUT"
        )
        sources["worker_idle_timeout_s"] = "PLENIO_WORKER_IDLE_TIMEOUT"
    return replace(config, **updates)
