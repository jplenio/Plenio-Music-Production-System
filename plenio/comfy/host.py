"""The only module that touches ComfyUI internals.

Nodes and routes call these wrappers instead of importing ``comfy``,
``folder_paths``, ``server`` or ``comfy_execution`` themselves, so that a
ComfyUI API change is fixed in one place.
"""

from __future__ import annotations

import importlib.metadata
import logging
import os
import platform
import sys
from pathlib import Path
from typing import Any

from .. import __version__
from ..core.config import CONFIG_FILE_NAME, PlenioConfig
from ..core.dependencies import probe
from ..core.engines import EngineInfo, yue2
from ..core.errors import PlenioModelError
from ..core.system import Device, SystemFacts

log = logging.getLogger("plenio")

ASSET_FOLDER = "plenio"
"""ComfyUI model folder name for Plenio-owned assets (``models/plenio/<kind>/<id>``)."""


def comfyui_version() -> str:
    try:
        import comfyui_version

        return str(comfyui_version.__version__)
    except (ImportError, AttributeError):
        return "unknown"


def frontend_version() -> str:
    try:
        return importlib.metadata.version("comfyui_frontend_package")
    except importlib.metadata.PackageNotFoundError:
        return "unknown"


def user_directory() -> Path:
    import folder_paths

    return Path(folder_paths.get_user_directory())


def output_directory() -> Path:
    import folder_paths

    return Path(folder_paths.get_output_directory())


def models_directory() -> Path:
    import folder_paths

    return Path(folder_paths.models_dir)


def register_model_folders() -> None:
    """Register ``models/plenio`` so that assets live next to the other models."""
    import folder_paths

    if ASSET_FOLDER not in folder_paths.folder_names_and_paths:
        folder_paths.add_model_folder_path(ASSET_FOLDER, str(models_directory() / ASSET_FOLDER))


def asset_root(config: PlenioConfig) -> Path:
    if config.asset_dir is not None:
        return config.asset_dir
    import folder_paths

    paths = folder_paths.get_folder_paths(ASSET_FOLDER)
    return Path(paths[0]) if paths else models_directory() / ASSET_FOLDER


def load_config() -> PlenioConfig:
    return PlenioConfig.load(env=os.environ, config_file=user_directory() / "plenio" / CONFIG_FILE_NAME)


def prompt_server_routes() -> Any:
    from server import PromptServer

    return PromptServer.instance.routes


def execution_blocker(message: str | None = None) -> Any:
    """A per-output blocker: ``None`` blocks silently, a message blocks with an error."""
    from comfy_execution.graph_utils import ExecutionBlocker

    return ExecutionBlocker(message)


def is_interrupted() -> bool:
    import comfy.model_management

    return bool(comfy.model_management.processing_interrupted())


def raise_if_interrupted() -> None:
    import comfy.model_management

    comfy.model_management.throw_exception_if_processing_interrupted()


def free_memory(required_bytes: int, device: str | None = None) -> None:
    """Ask ComfyUI to make room on ``device`` before an out-of-process worker starts (R9)."""
    import comfy.model_management
    import torch

    target = torch.device(device) if device else comfy.model_management.get_torch_device()
    comfy.model_management.free_memory(required_bytes, target)


def send_event(event: str, data: dict[str, Any]) -> None:
    """Send a custom message to the browser that queued the prompt (``api.addEventListener`` in the frontend)."""
    from server import PromptServer

    server = PromptServer.instance
    server.send_sync(event, data, server.client_id)


class _YuE2Tokenizer:
    """Exact YuE2 token counts through the loaded text encoder's own tokenizer (AS-14)."""

    def __init__(self, tokenizer: Any):
        self._tokenizer = tokenizer

    def prefix_tokens(self, style: str, lyrics: str, mode: str) -> int:
        tokens = self._tokenizer.tokenize_with_weights(style, lyrics=lyrics, cot=mode)
        return len(tokens["prefix"])

    def abc_tokens(self, abc: str) -> int:
        tokens = self._tokenizer.tokenize_with_weights("", lyrics="", cot="full", abc=abc)
        return len(tokens["abc_ids"])


def detect_engine(clip: Any) -> EngineInfo:
    """Identify the music model behind a CLIP object and return its engine descriptor."""
    import hashlib

    tokenizer = getattr(clip, "tokenizer", None)
    kind = type(tokenizer)
    if kind.__name__ == "YuE2Tokenizer" and kind.__module__.endswith("text_encoders.yue2"):
        raw = getattr(tokenizer, "tokenizer_json", b"")
        model = {
            "text_encoder": type(getattr(clip, "cond_stage_model", None)).__name__,
            "tokenizer": f"{kind.__module__}.{kind.__name__}",
            "tokenizer_sha256": hashlib.sha256(bytes(raw)).hexdigest() if raw else None,
        }
        return EngineInfo(
            yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities(), model, _YuE2Tokenizer(tokenizer)
        )
    detected = f"{kind.__module__}.{kind.__name__}" if tokenizer is not None else "no tokenizer"
    raise PlenioModelError(
        f"The connected model is not a supported music model (text encoder tokenizer: {detected}).",
        hint="Connect the CLIP output of the YuE2 Model block (checkpoint yue2_3b_int8_convrot.safetensors).",
    )


def _devices() -> tuple[Device, ...]:
    try:
        import torch
    except ImportError:
        return ()
    devices: list[Device] = []
    if torch.cuda.is_available():
        for index in range(torch.cuda.device_count()):
            properties = torch.cuda.get_device_properties(index)
            free: int | None
            try:
                free, _total = torch.cuda.mem_get_info(index)
            except RuntimeError:
                free = None
            devices.append(Device(index, properties.name, "cuda", int(properties.total_memory), free))
    if not devices:
        devices.append(Device(0, platform.processor() or "CPU", "cpu"))
    return tuple(devices)


def system_facts() -> SystemFacts:
    import comfy.model_management

    try:
        import psutil

        ram: int | None = int(psutil.virtual_memory().total)
    except ImportError:
        ram = None
    try:
        import torch

        torch_version = str(torch.__version__)
    except ImportError:
        torch_version = "not installed"
    return SystemFacts(
        plenio_version=__version__,
        comfyui_version=comfyui_version(),
        frontend_version=frontend_version(),
        python_version=sys.version.split()[0],
        platform=f"{platform.system()} {platform.release()}",
        torch_version=torch_version,
        active_device=str(comfy.model_management.get_torch_device()),
        devices=_devices(),
        ram_total_bytes=ram,
        packages=probe(),
        config=load_config().summary(),
    )
