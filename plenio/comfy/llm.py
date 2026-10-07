"""Local LLMs inside ComfyUI: where to look (ComfyUI's ``models/LLM``, Plenio's ``[llm]`` settings, other
apps) and how to make room before a GGUF file is loaded. The work itself is ``plenio.core.llm``."""

from __future__ import annotations

import os
import threading
import time
from pathlib import Path

from ..core import llm
from ..core.config import PlenioConfig
from . import host

COMFYUI_LABEL = "models/LLM"
LIST_TTL_S = 5.0
"""How long a model list is reused (ComfyUI asks for every node definition at once)."""
_cache: dict[str, tuple[float, llm.Discovery]] = {}
_lock = threading.Lock()


def stores(config: PlenioConfig) -> list[llm.Store]:
    found = [llm.Store(COMFYUI_LABEL, folder) for folder in host.llm_folders()]
    found += [llm.Store(label, folder) for label, folder in config.llm_folders.items()]
    if config.llm_other_apps:
        found += llm.app_stores(os.environ, Path.home())
    return found


def servers(config: PlenioConfig) -> list[llm.Server]:
    found = list(llm.known_servers(os.environ)) if config.llm_other_apps else []
    found += [
        llm.Server(label, url.rstrip("/"), start_hint=f"Start the server at {url}.")
        for label, url in config.llm_servers.items()
    ]
    return found


def runtimes(config: PlenioConfig) -> list[llm.Runtime]:
    return llm.find_runtimes(os.environ, Path.home(), configured=config.llama_server)


def discovery(config: PlenioConfig, *, fresh: bool = False) -> llm.Discovery:
    """Every model on this machine, reused for ``LIST_TTL_S`` seconds."""
    key = repr(config.summary())
    with _lock:
        cached = _cache.get(key)
        if cached is not None and not fresh and time.monotonic() - cached[0] < LIST_TTL_S:
            return cached[1]
        found = llm.discover(stores(config), servers(config))
        _cache.clear()
        _cache[key] = (time.monotonic(), found)
        return found


def make_room(required_bytes: int) -> None:
    """Ask ComfyUI to free GPU memory for a GGUF server (R9); nothing to do on a CPU-only host."""
    if host.torch_device() != "cpu":
        host.free_memory(required_bytes)
