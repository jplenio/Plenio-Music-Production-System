"""Answers kept on disk: the same request to the same model is answered from here, without a call.

A request is the same when the model (for a file: its path, size and modification time; for an app: its
address and the model's name), the prompt, the system prompt, the seed and every setting that shapes the
answer are the same. So a workflow that runs again - after a restart, after ComfyUI dropped its cache, or
because an unrelated setting before the writer changed - does not ask the model again; a new seed does.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from ..files import atomic_write_text
from ..hashing import sha256_json
from .catalog import Model
from .client import Answer, Settings

CACHE_VERSION = 1


def model_identity(model: Model) -> dict[str, Any]:
    """What makes a model the same model: a changed file (a new download) is another model."""
    if model.path is not None:
        size: int | None = model.size
        mtime: int | None = None
        try:
            stat = model.path.stat()
            size, mtime = stat.st_size, stat.st_mtime_ns
        except OSError:
            pass
        return {"file": str(model.path), "size": size, "mtime_ns": mtime}
    server = model.server
    return {
        "server": server.url if server else "",
        "protocol": server.protocol if server else "",
        "model": model.name,
    }


def request_key(model: Model, prompt: str, settings: Settings) -> str:
    return sha256_json(
        {
            "cache": CACHE_VERSION,
            "model": model_identity(model),
            "prompt": prompt,
            "system_prompt": settings.system_prompt,
            "seed": settings.seed,
            "temperature": settings.temperature,
            "top_p": settings.top_p,
            "max_tokens": settings.max_tokens,
            "thinking": settings.thinking,
            "context": settings.context,
            "schema": settings.schema,
        }
    )


def _answer_to_dict(answer: Answer) -> dict[str, Any]:
    return {
        "text": answer.text,
        "thinking": answer.thinking,
        "model": answer.model,
        "seconds": answer.seconds,
        "prompt_tokens": answer.prompt_tokens,
        "completion_tokens": answer.completion_tokens,
        "constrained": answer.constrained,
    }


def _answer_from_dict(data: Mapping[str, Any]) -> Answer:
    def tokens(name: str) -> int | None:
        value = data.get(name)
        return int(value) if isinstance(value, int) else None

    return Answer(
        text=str(data["text"]),
        thinking=str(data.get("thinking", "")),
        model=str(data.get("model", "")),
        seconds=float(data.get("seconds", 0.0)),
        prompt_tokens=tokens("prompt_tokens"),
        completion_tokens=tokens("completion_tokens"),
        constrained=bool(data.get("constrained", False)),
    )


class AnswerCache:
    """``<folder>/<key>.json``; a missing or unreadable entry is simply a miss (the model is asked)."""

    def __init__(self, folder: Path):
        self.folder = folder

    def path(self, key: str) -> Path:
        return self.folder / f"{key}.json"

    def get(self, key: str) -> tuple[Answer, str] | None:
        """``(answer, who answered then)``, or ``None``."""
        try:
            data = json.loads(self.path(key).read_text(encoding="utf-8"))
            if data.get("version") != CACHE_VERSION:
                return None
            return _answer_from_dict(data["answer"]), str(data.get("runtime", ""))
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            return None

    def put(self, key: str, answer: Answer, runtime: str) -> None:
        self.folder.mkdir(parents=True, exist_ok=True)
        data = {"version": CACHE_VERSION, "runtime": runtime, "answer": _answer_to_dict(answer)}
        atomic_write_text(self.path(key), json.dumps(data, ensure_ascii=False))
