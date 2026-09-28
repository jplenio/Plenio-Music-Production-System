"""UniverSR behind *Load Audio Model*: the super-resolution engine of Refine (48 kHz) - Phase 11C D9.

Vendored MIT inference code (`plenio/third_party/universr`, pinned commit in its ``NOTICE.md``),
weights through ComfyUI's model management (R9), no new Python packages:

- the checkpoint is read with ``weights_only=True``; a file that carries its own ``config`` (a dict
  with ``state_dict`` and ``config``) defines its architecture, a plain state dict uses the released
  ``audio_config.yaml`` next to the vendored code;
- the released model is **mono** and trained for 8/12/16/24 kHz input conditions; the adapter runs
  one channel at a time and defaults to the **24 kHz condition** (input band-limited at 12 kHz) that
  the plan §4.4 chose for MiniMax material - Refine's PRE, crossover and gain still shape the result;
- chunking, overlap-add, resampling and the crossover are pure core (`core.audio.refine`); this
  module only wraps the model call;
- ``timm`` and ``torchdiffeq`` are used when installed, with vendored stand-ins when not (reported).

The defaults are **provisional** until the owner's measurement study (L1, plan §15).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

from ..core.audio.refine import OUTPUT_RATE
from ..core.dependencies import require
from ..core.errors import PlenioDependencyError, PlenioModelError
from . import audio_models, host

NAME = "UniverSR"
"""The engine name that appears in Refine's report."""

FILE_NAMES = ("pytorch_model.bin", "universr_audio.bin", "universr_audio.safetensors")
"""Names that identify the released weights (Hugging Face serves them as ``pytorch_model.bin``)."""

CONDITIONS_HZ = (8000, 12000, 16000, 24000)
DEFAULT_INPUT_RATE = 24000
"""The 24 kHz input condition of the released model (plan §4.4): a steep low-pass at 12 kHz, then
resampling to 24 kHz - the condition for MiniMax material, whose useful band ends near 16 kHz."""

CHUNK_SECONDS = 5.0
OVERLAP_SECONDS = 0.5
ODE_STEPS = 4
GUIDANCE_SCALE = 1.5
CONFIG_NAME = "audio_config.yaml"
VENDOR = Path(__file__).resolve().parents[1] / "third_party" / "universr"


def matches(name: str) -> bool:
    """Does this adapter read the file? (by name: the catalogue entry names the weights)."""
    lowered = Path(name).name.lower()
    return lowered in FILE_NAMES or "universr" in lowered


def _require_torch() -> Any:
    try:
        return require("torch")
    except PlenioDependencyError as error:
        raise PlenioModelError(
            f"{NAME} needs PyTorch, which this ComfyUI does not provide.",
            hint="Refine's engine 'resample only' works without any model.",
        ) from error


def _config_for(path: Path, torch: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    """``(state_dict, config)`` from a checkpoint: its own ``config`` or the released one.

    ``.bin``/``.pt`` files are read with ``weights_only=True``, ``.safetensors`` with safetensors
    (``audio_models.read_weights``).
    """
    payload = audio_models.read_weights(path, torch, NAME)
    if isinstance(payload, dict) and isinstance(payload.get("config"), dict) and "state_dict" in payload:
        return payload["state_dict"], dict(payload["config"])
    yaml = require("yaml")
    config = yaml.safe_load((VENDOR / CONFIG_NAME).read_text(encoding="utf-8"))
    return payload, dict(config)


@dataclass
class UniverSREngine:
    """The pure ``core.audio.refine.Engine`` contract around the loaded model."""

    model: Any
    device: str = "cpu"
    input_rate_hz: int = DEFAULT_INPUT_RATE
    name: str = NAME
    solver: str = "torchdiffeq"
    """Which ODE integrator ran (``torchdiffeq`` or the vendored stand-in), for the report."""
    substitutes: tuple[str, ...] = field(default_factory=tuple)
    """Optional packages that were replaced by the vendored stand-ins."""

    @property
    def input_rate(self) -> int:
        return int(self.input_rate_hz)

    @property
    def condition_hz(self) -> float:
        """The input bandwidth the model was trained for: half the input rate (Refine's PRE edge)."""
        return self.input_rate_hz / 2

    @property
    def chunk_seconds(self) -> float:
        return CHUNK_SECONDS

    @property
    def overlap_seconds(self) -> float:
        return OVERLAP_SECONDS

    def upsample(self, chunk: np.ndarray, seed: int) -> np.ndarray:
        """``[C, T]`` at ``input_rate`` -> ``[C, T * 48000 / input_rate]`` at 48 kHz.

        The released model is mono, so every channel runs on its own; the seed makes a chunk
        reproducible (``core.audio.refine`` derives one per chunk from the node's seed).
        """
        torch = _require_torch()
        data = np.ascontiguousarray(chunk, dtype=np.float32)
        frames = int(round(data.shape[1] * OUTPUT_RATE / self.input_rate))
        outputs: list[np.ndarray] = []
        with torch.no_grad():
            for index in range(data.shape[0]):
                single = torch.from_numpy(data[index]).to(self.device)
                enhanced = self.model.enhance(
                    single,
                    input_sr=self.input_rate,
                    ode_steps=ODE_STEPS,
                    guidance_scale=GUIDANCE_SCALE,
                    seed=int(seed),
                )
                flat = enhanced.detach().to("cpu").to(torch.float64).reshape(-1).numpy()
                outputs.append(
                    flat[:frames] if flat.size >= frames else np.pad(flat, (0, frames - flat.size))
                )
        _free_gpu_memory()
        return np.stack(outputs)


def _free_gpu_memory() -> None:
    """Let ComfyUI's memory manager decide what to free (R9) - through the host, never directly."""
    host.soft_empty_cache()


def load(path: Path) -> UniverSREngine:
    """Build the engine for a checkpoint file (called by ``audio_models.load``)."""
    torch = _require_torch()
    from ..third_party import universr as vendor

    substitutes = vendor.ensure_dependencies()
    from ..third_party.universr.flow.path import OriginalCFMPath
    from ..third_party.universr.inference import UniverSR
    from ..third_party.universr.models.unet import ConvNeXtUNetCond
    from ..third_party.universr.utils.spectral_ops import AmplitudeCompressedComplexSTFT

    state, config = _config_for(path, torch)
    try:
        model = ConvNeXtUNetCond(**config["model"])
        model.load_state_dict(state)
    except (KeyError, RuntimeError, TypeError) as error:
        raise PlenioModelError(
            f"{path.name} does not match the {NAME} architecture: {error}",
            hint=f"Use the released weights ({', '.join(FILE_NAMES)}) or a checkpoint with its own config.",
        ) from error
    device = _device()
    model = model.to(device).eval()
    transform = AmplitudeCompressedComplexSTFT(**config["transform"]).to(device)
    path_args = dict(config.get("path", {}).get("init_args") or {"sigma_min": 1e-4})
    engine = UniverSR(model=model, transform=transform, path=OriginalCFMPath(**path_args), device=str(device))
    _free_gpu_memory()
    return UniverSREngine(
        model=engine,
        device=str(device),
        solver="vendored integrator" if "torchdiffeq" in substitutes else "torchdiffeq",
        substitutes=tuple(sorted(substitutes)),
    )


def _device() -> str:
    """The device ComfyUI wants models on (through the host: only ``host.py`` touches comfy internals)."""
    return host.torch_device()


# --- registration (imported once by ``audio_models._ensure_registered``) ----------------------------


def _register() -> None:
    from .audio_models import Adapter, register

    register(Adapter(name=NAME, kind="super-resolution", matches=matches, load=load))


_register()


__all__ = [
    "CHUNK_SECONDS",
    "CONDITIONS_HZ",
    "DEFAULT_INPUT_RATE",
    "FILE_NAMES",
    "NAME",
    "ODE_STEPS",
    "OVERLAP_SECONDS",
    "UniverSREngine",
    "load",
    "matches",
]
