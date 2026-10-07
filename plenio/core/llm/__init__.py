"""Local language models for any text task: find them, ask them.

    discovery = discover(stores, servers)            # every model on this machine
    model = resolve("models/LLM · Qwen3.5-9B-Q4_K_M.gguf", stores, servers)
    answer = generate(model, "Write a haiku", Settings(seed=1), runtimes=find_runtimes(os.environ, Path.home()))

GGUF files run in a llama.cpp server that is started for the call (``runtime``); models of running apps
(LM Studio, Ollama, llama.cpp, vLLM, Jan, ...) are asked over their local API (``chat``). Standard
library only; nothing here is specific to songs or to ComfyUI.
"""

from __future__ import annotations

import os
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass, replace

from .catalog import (
    CHOOSE,
    SEPARATOR,
    Discovery,
    Model,
    Store,
    app_stores,
    describe,
    discover,
    known_servers,
    resolve,
    split_ref,
)
from .client import Answer, Server, Settings, chat, split_thinking
from .runtime import Runtime, find_runtimes, serve_file

GIB = 1024**3
KV_BYTES_PER_TOKEN = 128 * 1024
"""A generous key/value-cache estimate per context token (7-12B models at 16 bit are below it)."""


@dataclass(frozen=True)
class Result:
    answer: Answer
    model: Model
    runtime: str
    """Who answered: the app's name, or the llama.cpp runtime that served the file."""


def memory_estimate(model: Model, context: int) -> int:
    """Bytes a GGUF file needs on the GPU: the file, its context and a margin (0 for an app's model)."""
    if model.path is None or not model.size:
        return 0
    return model.size + context * KV_BYTES_PER_TOKEN + GIB // 2


def generate(
    model: Model,
    prompt: str,
    settings: Settings | None = None,
    *,
    runtimes: Sequence[Runtime] = (),
    keep_loaded: bool = False,
    make_room: Callable[[int], None] | None = None,
    is_cancelled: Callable[[], bool] | None = None,
    env: Mapping[str, str] | None = None,
) -> Result:
    """One answer of ``model`` to ``prompt``.

    A file is served by the first of ``runtimes``; ``make_room(bytes)`` is called before its server starts
    (ComfyUI frees that much GPU memory). ``keep_loaded`` keeps that server - or the app's model - loaded
    for the next call instead of freeing its memory right away.
    """
    settings = replace(settings or Settings(), unload_after=not keep_loaded)
    env = os.environ if env is None else env
    if model.server is not None:
        key = env.get(model.server.api_key_env, "") if model.server.api_key_env else ""
        answer = chat(model.server, model.name, prompt, settings, api_key=key, is_cancelled=is_cancelled)
        return Result(answer, model, model.server.name)
    if model.path is None:
        raise ValueError("a model needs a file or a server")
    path, needed = model.path, memory_estimate(model, settings.context)
    answer, runtime = serve_file(
        path,
        runtimes,
        context=settings.context,
        keep_loaded=keep_loaded,
        use=lambda server: chat(server, path.name, prompt, settings, is_cancelled=is_cancelled),
        before_start=(lambda: make_room(needed)) if make_room is not None and needed else None,
        is_cancelled=is_cancelled,
    )
    return Result(answer, model, runtime)


__all__ = [
    "CHOOSE",
    "SEPARATOR",
    "Answer",
    "Discovery",
    "Model",
    "Result",
    "Runtime",
    "Server",
    "Settings",
    "Store",
    "app_stores",
    "chat",
    "describe",
    "discover",
    "find_runtimes",
    "generate",
    "known_servers",
    "memory_estimate",
    "resolve",
    "split_ref",
    "split_thinking",
]
