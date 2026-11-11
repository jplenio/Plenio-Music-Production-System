"""The default writer: Gemma 4 12B as a GGUF file, its size chosen by the graphics card.

Gemma 4 12B writes clearly better lyrics, titles and styles than the Gemma 4 E4B text encoder the templates
used before 1.5.1. The writer list offers it as one entry, ``AUTO``; when a run uses it, Write Song (Writer
Choice) takes

1. a Gemma 4 12B GGUF already on this machine - in models/LLM, a folder of Plenio's config, LM Studio's models
   or the Hugging Face cache: the file with the name of the one this card would get first, else the largest
   that fits the card, else the smallest (``pick``). Nothing is downloaded twice under another name;
2. else a Gemma 4 12B of a running app (LM Studio, Ollama ...), as it is;
3. else the file for this card (``wanted``), downloaded once into ComfyUI's models/LLM - pinned like every
   Plenio asset (``resources/assets.toml``: repository revision, size, SHA-256), resumable, and never in
   offline mode (``PLENIO_OFFLINE``, ``PLENIO_AUTO_DOWNLOAD=0``).

A GGUF file needs llama.cpp to run, which ComfyUI does not bring. Without it (``runs_files``) no file is used and
nothing is downloaded: a running app's model still serves, else ComfyUI's own Gemma text model if one is installed
(``native_fallback``: templates saved with it keep working, and the summary says what to install), else the run
stops and says what to do.

Which file: Q6_K (9.8 GB) from 20 GiB of VRAM on - near the full model's quality -, below that (a 16 GB card too:
measured, the Q6_K and its context do not fit there and write 2.4 times slower) the QAT Q4 (6.7 GB) Google trained for 4-bit, which keeps more of it than a plain Q4. Both leave room
for the writer's 24 576-token context; on a smaller card llama.cpp keeps the layers that do not fit in RAM.
Both are Unsloth's GGUFs of Google's Gemma 4 12B instruction model (Apache-2.0).
"""

from __future__ import annotations

import re
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from .. import features
from ..assets import Asset
from .catalog import Model, is_chat_model_file

AUTO = "Gemma 4 12B (auto)"
"""The writer list's entry: Gemma 4 12B, the file chosen for this machine when a run uses it."""
LARGE = "gemma-4-12b-it-q6-k"
"""The asset for cards from ``LARGE_FROM_GIB`` on."""
SMALL = "gemma-4-12b-it-qat-ud-q4-k-xl"
"""The asset for smaller cards and machines without a GPU."""
LARGE_FROM_GIB = 20.0
"""VRAM (GiB, as torch reports it) from which the Q6_K file is chosen. Measured 2026-11-11 on a 16 GB card
(15.9 GiB): the Q6_K with the 24 576-token context filled the card and wrote 2.4 times slower than the QAT Q4
(docs/test-reports/2026-11-11-writer-native-12b.md) - so 16 GB cards get the QAT Q4."""
HEADROOM_GIB = 7.5
"""What a found file leaves of the card for the context and the server: a file fits when it is this much
smaller than the VRAM (measured: the QAT Q4_0 of 6.4 GiB peaked at 14.8 GiB, the Q6_K of 9.1 GiB at 15.1 GiB and
was slowed down on a 15.9 GiB card)."""
GIB = 1024**3
NATIVE_E4B = "gemma4_e4b_it_fp8_scaled.safetensors"
"""ComfyUI's lighter Gemma writer, the templates' default before 1.5.1."""
NATIVE_E4B_URL = f"https://huggingface.co/Comfy-Org/gemma-4/resolve/main/text_encoders/{NATIVE_E4B}"
INSTALL_LLAMA_CPP = (
    "Install llama.cpp (Windows: `winget install llama.cpp`, macOS: `brew install llama.cpp`) or `pip install "
    "llama-cpp-python` into ComfyUI's Python, or set the path of a llama-server in PLENIO_LLAMA_SERVER"
)
"""What makes GGUF files run where Plenio starts a llama-server program (the Studio add-on)."""
INSTALL_LLAMA_CPP_PYTHON = (
    "`pip install llama-cpp-python` into ComfyUI's Python, or run the model in LM Studio, Ollama or a "
    "llama-server you start yourself (this installation of Plenio starts no llama-server program; Plenio from "
    "GitHub - git clone or the release zip - does)"
)
"""The same where it does not: the Comfy Registry package."""


def how_to_run_files() -> str:
    """What to do so that this installation runs GGUF files, as the start of a sentence."""
    return INSTALL_LLAMA_CPP if features.has("llm_server") else INSTALL_LLAMA_CPP_PYTHON


_NAME = re.compile(r"gemma[-_ ]?4[-_ ]?12b", re.IGNORECASE)
_NOT_THE_MODEL = ("mtp-", "-mtp", "draft", "imatrix")
"""A speculative-decoding head (MTP) or a quantization helper beside the model, named like it."""


def is_gemma_12b(name: str) -> bool:
    """A GGUF file of Gemma 4 12B itself (its first shard), judged by name - not its projector or MTP head."""
    file = name.replace("\\", "/").rsplit("/", 1)[-1].lower()
    return (
        file.endswith(".gguf")
        and bool(_NAME.search(file))
        and is_chat_model_file(file)
        and not any(marker in file for marker in _NOT_THE_MODEL)
    )


def is_gemma_12b_of_app(model: Model) -> bool:
    """A model of a running app named Gemma 4 12B (``google/gemma-4-12b``, ``gemma4:12b``) - not an embedding one."""
    return model.path is None and bool(re.search(r"gemma[-_ ]?4[-_ :]?12b", model.name, re.IGNORECASE))


def native_fallback(writers: Iterable[str]) -> str | None:
    """ComfyUI's own Gemma 4 writer among the text models listed (``native_writers``), for a machine without
    llama.cpp: a 12B first, then the E4B the templates used before, then any other Gemma 4."""
    gemmas = [name for name in writers if re.search(r"gemma[-_ ]?4", name, re.IGNORECASE)]
    if not gemmas:
        return None
    return min(gemmas, key=lambda name: (not _NAME.search(name), name != NATIVE_E4B, name.casefold()))


def wanted(vram_gib: float | None) -> str:
    """The asset id of the file for a card with ``vram_gib`` GiB (``None``: no GPU)."""
    return LARGE if vram_gib is not None and vram_gib >= LARGE_FROM_GIB else SMALL


def file_of(asset: Asset) -> str:
    return asset.files[0].path


def pick(models: Sequence[Model], vram_gib: float | None, wanted_file: str) -> Model | None:
    """The Gemma 4 12B file to use among ``models`` (``None``: there is none): the one named like
    ``wanted_file`` first (the first source listing it), else the largest that fits the card, else the
    smallest."""
    found = [m for m in models if m.path is not None and is_gemma_12b(m.name)]
    if not found:
        return None
    name = wanted_file.lower()
    same = [m for m in found if m.name.replace("\\", "/").rsplit("/", 1)[-1].lower() == name]
    if same:
        return same[0]
    budget = (vram_gib - HEADROOM_GIB) * GIB if vram_gib is not None else None
    fitting = [m for m in found if m.size and budget is not None and m.size <= budget]
    if fitting:
        return max(fitting, key=lambda m: m.size or 0)
    return min(found, key=lambda m: m.size or float("inf"))


@dataclass(frozen=True)
class Choice:
    """What the writer entry ``AUTO`` stands for on this machine."""

    asset: Asset
    """The file this card would get (downloaded when ``model`` is ``None`` and files can run)."""
    model: Model | None
    """A Gemma 4 12B on this machine, used as it is: a file, or a running app's model."""
    vram_gib: float | None
    runs_files: bool = True
    """A llama.cpp runtime is there to serve GGUF files."""
    step: str = ""
    """Which step of the writer plan (``STEPS``) a run took - set by the host once it knows."""
    detail: str = ""
    """Why, in words (the native file's reason, the app's name)."""

    @property
    def download(self) -> bool:
        return self.model is None and self.runs_files

    @property
    def blocked(self) -> bool:
        """No Gemma 4 12B can write here: none of a running app, and nothing to run a file with."""
        return self.model is None and not self.runs_files

    def describe(self) -> str:
        """One line for the run's summary and the System Check."""
        card = f"{self.vram_gib:.1f} GiB of VRAM" if self.vram_gib is not None else "no GPU"
        if self.model is not None:
            size = f", {self.model.size / GIB:.1f} GiB" if self.model.size else ""
            return f"Gemma 4 12B: {self.model.ref} (found{size}; {card})"
        if self.blocked:
            return (
                f"Gemma 4 12B needs llama.cpp, and this computer has none - songs fall back to ComfyUI's own Gemma "
                f"text model when one is installed. To use the 12B: {how_to_run_files()}"
            )
        return (
            f"Gemma 4 12B: {file_of(self.asset)} ({self.asset.total_size / GIB:.1f} GiB, {self.asset.licence}) for "
            f"{card} - not on this machine yet: downloaded once into models/LLM from {self.asset.repo}"
        )


STEPS = ("app", "file", "download", "native")
"""The writer plan (PD 5.6), in order: (1) a Gemma 4 12B of a running app - loaded already, no load time; (2) a
Gemma 4 12B GGUF on this machine, or the one for the card downloaded - needs llama.cpp; without llama.cpp
(3) ComfyUI's native Gemma 4 12B, (4) its E4B or, on small cards, E2B - chosen by the model plan from the
catalogue's ``writer-native``. The order of 2 and 3 is PD's expectation until phase 0.4 measures both."""

NATIVE_12B = "gemma4_12b_int8_convrot.safetensors"


def choose(
    models: Sequence[Model], assets: Mapping[str, Asset], vram_gib: float | None, *, runs_files: bool = True
) -> Choice:
    """What ``AUTO`` stands for: a running app's Gemma 4 12B first (it costs no load time), then a file found on
    this machine (when llama.cpp can run it), else the file to download for this card."""
    asset = assets[wanted(vram_gib)]
    found = next((m for m in models if is_gemma_12b_of_app(m)), None)
    if found is None and runs_files:
        found = pick(models, vram_gib, file_of(asset))
    return Choice(asset, found, vram_gib, runs_files)


def native_pick(
    component: Any,
    vram_gib: float | None,
    installed: Mapping[str, int],
    *,
    has_12b: bool,
    prefer: str = "balanced",
    pinned: str | None = None,
) -> Any:
    """Steps 3 and 4: ComfyUI's own Gemma 4 file for this card, by the model plan (``plenio.core.modelplan``) over the
    catalogue's ``writer-native`` - the 12B only where this ComfyUI can load it (``has_12b``)."""
    from dataclasses import replace

    from ..modelplan import pick as plan_pick

    variants = tuple(v for v in component.variants if has_12b or v.file != NATIVE_12B)
    if not any(v.default for v in variants):  # the plan reads the default only for its reason
        variants = tuple(replace(v, default=v is variants[0]) for v in variants)
    return plan_pick(
        replace(component, variants=variants),
        vram_gib=vram_gib,
        installed=installed,
        prefer=prefer,
        pinned=pinned,
    )


__all__ = [
    "AUTO",
    "GIB",
    "HEADROOM_GIB",
    "INSTALL_LLAMA_CPP",
    "INSTALL_LLAMA_CPP_PYTHON",
    "how_to_run_files",
    "LARGE",
    "LARGE_FROM_GIB",
    "NATIVE_E4B",
    "NATIVE_E4B_URL",
    "SMALL",
    "NATIVE_12B",
    "STEPS",
    "Choice",
    "choose",
    "native_pick",
    "file_of",
    "is_gemma_12b",
    "is_gemma_12b_of_app",
    "native_fallback",
    "pick",
    "wanted",
]
