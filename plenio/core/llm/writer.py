"""One writer list: ComfyUI's own text models and the local LLMs (Write Song's *writer model*).

A text model is listed by its bare file name in ``models/text_encoders`` - as every ComfyUI loader lists it,
so the frontend's missing-model dialog can offer its download - and is written by ComfyUI's native
Generate Text (the file loaded by its CLIP loader, the memory managed by ComfyUI). Every other entry is a
Local LLM reference ``"<source> · <name>"`` (``catalog.py``). ``route`` says which of the two an entry takes.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

from ..errors import PlenioUserError
from .catalog import CHOOSE, SEPARATOR, split_ref

NATIVE = "text_encoders"
"""ComfyUI's model folder of the text models (the writer list holds their bare file names)."""
_FAMILIES = ("gemma", "qwen", "llama", "mistral", "ministral")
"""Language-model families whose text encoders ComfyUI's Generate Text can run."""
_NOT_A_WRITER = ("t5", "clip", "connector", "projection", "embedding", "ltx", "minimax")
"""Encoders and parts of other models that share a family name (T5Gemma, LTX's Gemma projection ...)."""
_FILES = (".safetensors", ".sft")


def native_writers(files: Iterable[str]) -> list[str]:
    """The text encoders that can write (bare file names), judged by name: language-model families only
    (no CLIP or T5 encoders), safetensors only (ComfyUI's loader reads no GGUF - those are Local LLM files)."""
    found = []
    for file in files:
        lower = file.replace("\\", "/").rsplit("/", 1)[-1].lower()
        if (
            lower.endswith(_FILES)
            and any(family in lower for family in _FAMILIES)
            and not any(marker in lower for marker in _NOT_A_WRITER)
        ):
            found.append(file)
    return sorted(found, key=str.casefold)


@dataclass(frozen=True)
class Route:
    """Where a writer reference goes: a text-encoder file for Generate Text, or a Local LLM reference."""

    text_encoder: str = ""
    local_model: str = ""

    @property
    def use_local(self) -> bool:
        return bool(self.local_model)


def route(ref: str) -> Route:
    """A bare file name is a text model; a ``"<source> · <name>"`` reference is a Local LLM model."""
    if SEPARATOR not in ref:
        if not ref.strip() or ref == CHOOSE:
            raise PlenioUserError(
                "No writer model is chosen.", hint="Choose one in Write Song's writer model."
            )
        return Route(text_encoder=ref)
    split_ref(ref)
    return Route(local_model=ref)
