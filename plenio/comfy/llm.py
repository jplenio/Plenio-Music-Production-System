"""Local LLMs inside ComfyUI: where to look (ComfyUI's ``models/LLM``, Plenio's ``[llm]`` settings, other
apps), how to make room before a GGUF file is loaded, and which Gemma 4 12B file the default writer takes on
this machine (``auto_writer``). The work itself is ``plenio.core.llm``."""

from __future__ import annotations

import logging
import os
import threading
import time
from collections.abc import Callable
from pathlib import Path

from ..core import llm
from ..core.assets import ensure_asset_in
from ..core.config import PlenioConfig
from ..core.errors import PlenioError, PlenioModelError
from . import host

log = logging.getLogger("plenio")

COMFYUI_LABEL = "models/LLM"
TEXT_ENCODERS_LABEL = "models/text_encoders"
"""ComfyUI's text encoder folders (``text_encoders``, the old ``clip`` and their ``extra_model_paths.yaml``
lines): ComfyUI-GGUF keeps language models there (a user's report 2026-10-11: a Qwen GGUF its
CLIPLoaderGGUF lists was not offered as a writer). Only GGUFs that write are listed (``Store.encoders``)."""
LIST_TTL_S = 5.0
"""How long a model list is reused (ComfyUI asks for every node definition at once)."""
_cache: dict[str, tuple[float, llm.Discovery]] = {}
_lock = threading.Lock()


def load_config() -> PlenioConfig:
    """Plenio's configuration, or the defaults when it cannot be read (the System Check reports why)."""
    try:
        return host.load_config()
    except (PlenioError, ImportError, AttributeError) as error:
        log.warning("Plenio Local LLM: using the default settings (%s)", error)
        return PlenioConfig()


def stores(config: PlenioConfig) -> list[llm.Store]:
    found = [llm.Store(COMFYUI_LABEL, folder) for folder in host.llm_folders()]
    found += [llm.Store(label, folder) for label, folder in config.llm_folders.items()]
    found += [llm.Store(TEXT_ENCODERS_LABEL, folder, encoders=True) for folder in host.text_encoder_folders()]
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


def _capital(text: str) -> str:
    """``text`` as the start of a sentence (it may begin with a command in backticks)."""
    return text[:1].upper() + text[1:]


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


def writers(config: PlenioConfig) -> list[str]:
    """Write Song's writer list: Gemma 4 12B for this machine (the templates' default, ``llm.AUTO``), ComfyUI's
    text models that can write, then every Local LLM model."""
    return [
        llm.AUTO,
        *llm.native_writers(host.model_files("text_encoders")),
        *(m.ref for m in discovery(config).models),
    ]


def gemma_choice(config: PlenioConfig, *, fresh: bool = False) -> llm.gemma.Choice:
    """What the writer ``llm.AUTO`` stands for here: a Gemma 4 12B GGUF found on this machine, or the file for
    this card that a run downloads (``plenio.core.llm.gemma``)."""
    from .shared import asset_catalogue

    return llm.gemma.choose(
        discovery(config, fresh=fresh).models,
        asset_catalogue(),
        host.active_vram_gib(),
        runs_files=bool(runtimes(config)),
    )


def auto_writer(
    config: PlenioConfig,
    *,
    progress: Callable[[int, int, str], None] | None = None,
    is_cancelled: Callable[[], bool] | None = None,
) -> tuple[llm.Route, llm.gemma.Choice]:
    """Where the writer ``llm.AUTO`` goes on this machine, and the choice behind it. A Gemma 4 12B already here is
    used as it is; else the file for this card is downloaded once into ComfyUI's models/LLM (offline mode and
    ``PLENIO_AUTO_DOWNLOAD=0`` refuse that and say what to put where). Without llama.cpp nothing is downloaded that
    could not run: ComfyUI's own Gemma text model writes if one is installed, else the run stops and says what to
    do."""
    choice = gemma_choice(config, fresh=True)
    if choice.model is not None:
        return llm.Route(local_model=choice.model.ref), choice
    if choice.blocked:
        native = llm.gemma.native_fallback(llm.native_writers(host.model_files("text_encoders")))
        if native is not None:
            log.warning("Plenio writer: no llama.cpp for Gemma 4 12B; writing with ComfyUI's %s", native)
            return llm.Route(text_encoder=native), choice
        raise PlenioModelError(
            "The writer Gemma 4 12B runs on llama.cpp, and this computer has none.",
            hint=f"{_capital(llm.gemma.how_to_run_files())}, then run again: Plenio then downloads the model for your graphics "
            f"card. Or choose another writer model: a running LM Studio or Ollama works as it is, and ComfyUI's own "
            f"Gemma 4 E4B runs without llama.cpp - {llm.gemma.NATIVE_E4B_URL} into models/text_encoders, then press R.",
        )
    folders = host.llm_folders()
    if not folders:
        raise PlenioModelError(
            "ComfyUI has no models/LLM folder for the writer's Gemma 4 12B file.",
            hint="Restart ComfyUI (Plenio registers models/LLM), or choose another writer model.",
        )
    asset = choice.asset
    log.info("Plenio writer: downloading %s (%s) into %s", llm.gemma.file_of(asset), asset.repo, folders[0])
    ensure_asset_in(asset, folders[0], config, progress=progress, is_cancelled=is_cancelled)
    with _lock:
        _cache.clear()  # the next list has the new file
    return llm.Route(local_model=f"{COMFYUI_LABEL}{llm.SEPARATOR}{llm.gemma.file_of(asset)}"), choice


def answer_cache() -> llm.AnswerCache:
    """Local LLM answers kept on disk (``user/plenio/cache/llm``): the same request is not sent twice."""
    return llm.AnswerCache(host.user_directory() / "plenio" / "cache" / "llm")


def make_room(required_bytes: int) -> None:
    """Ask ComfyUI to free GPU memory for a GGUF server (R9); nothing to do on a CPU-only host."""
    if host.torch_device() != "cpu":
        host.free_memory(required_bytes)
