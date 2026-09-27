"""BS-RoFormer 4-stem behind *Load Audio Model*: the separator of Separate Stems (Phase 11C D11).

Vendored MIT inference code (`plenio/third_party/msst`, pinned commit in its ``NOTICE.md``), the
checkpoint through ComfyUI's model management (R9), no new Python packages:

- the released checkpoint is the MSST *BS-RoFormer* (384 dim, 8 blocks, 4 stems, MUSDB18-HQ,
  average SDR 9.66); the architecture comes from the checkpoint's own ``hyper_parameters`` when it
  has them, else from the released ``audio_config.json`` next to the vendored code;
- the model works at 44.1 kHz on stereo; the adapter resamples the input there, runs chunk by chunk
  (the config's ``chunk_size`` with ``num_overlap`` crossfades, normalised so the windows sum to
  one), and returns every stem **at the input's rate and length** - the core requires the input's
  shape (``core.audio.stems.make_stems``);
- the sum of the stems is *not* the input: the core keeps the residual, so a neutral mixer returns
  the input exactly, whatever the separator missed;
- ``beartype`` and ``rotary_embedding_torch`` are used when installed, with vendored stand-ins when
  not (reported by the node).
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

from ..core.audio.resample import resample
from ..core.audio.stems import REST
from ..core.dependencies import require
from ..core.errors import PlenioDependencyError, PlenioModelError
from . import host

NAME = "BS-RoFormer 4-stem"
STEMS: tuple[str, ...] = ("vocals", "drums", "bass", "other")
"""The documented stem order (MUSDB18-HQ) - and the fallback for a config that names no instruments.

The order of a checkpoint's output dimension is the **config's** ``training.instruments`` order, not
this constant: the released BS-RoFormer lists ``drums, bass, other, vocals``, so a hardcoded order
silently swaps the stems (found by the owner's listening check, 2026-09-28). ``instruments_of`` reads
the truth; ``separate`` returns the documented order where the names allow it.
"""
SAMPLE_RATE = 44100
FILE_NAMES = (
    "model_bs_roformer_ep_17_sdr_9.6568.ckpt",
    "bs_roformer_4stems.ckpt",
    "bs_roformer.ckpt",
)
CONFIG_NAME = "audio_config.json"
VENDOR = Path(__file__).resolve().parents[1] / "third_party" / "msst"


def matches(name: str) -> bool:
    """Does this adapter read the file? (by name: the catalogue entry names the checkpoint)."""
    lowered = Path(name).name.lower()
    return lowered in {f.lower() for f in FILE_NAMES} or (
        lowered.endswith((".ckpt", ".safetensors")) and "roformer" in lowered
    )


def _require_torch() -> Any:
    try:
        return require("torch")
    except PlenioDependencyError as error:
        raise PlenioModelError(
            f"{NAME} needs PyTorch, which this ComfyUI does not provide.",
            hint="Keep the Stems block bypassed until PyTorch is available (ComfyUI ships it).",
        ) from error


def _fade(length: int) -> np.ndarray:
    """Raised-cosine fade; a fade and its reverse sum to one (used for the overlap-add)."""
    if length <= 0:
        return np.ones(0)
    return 0.5 - 0.5 * np.cos(np.pi * (np.arange(length) + 0.5) / length)


@dataclass
class BSRoformerSeparator:
    """The pure ``core.audio.stems.Separator`` contract around the loaded model."""

    model: Any
    device: str = "cpu"
    chunk_frames: int = 485100
    overlap_frames: int = 0
    name: str = NAME
    stems: tuple[str, ...] = STEMS
    substitutes: tuple[str, ...] = field(default_factory=tuple)
    """Optional packages that were replaced by the vendored stand-ins."""

    def separate(self, samples: np.ndarray, rate: int) -> dict[str, np.ndarray]:
        """``{stem: [channels, frames]}`` at ``rate`` and the input's length, float32.

        Every stem is labeled by the checkpoint's own instrument order (:func:`instruments_of`), so the
        names match the audio; where the names are the documented ones the result is returned in the
        documented order (vocals, drums, bass, other).
        """
        torch = _require_torch()
        data = np.ascontiguousarray(samples, dtype=np.float64)
        frames = int(data.shape[1])
        rate = int(rate)
        mono = data.shape[0] == 1
        work = data if rate == SAMPLE_RATE else resample(data, rate, SAMPLE_RATE)
        if mono:
            work = np.repeat(work, 2, axis=0)  # the released model is trained on stereo
        chunk = max(1024, int(self.chunk_frames))
        overlap = int(self.overlap_frames or chunk // 4)
        overlap = max(0, min(overlap, chunk // 2))
        step = chunk - overlap
        total = work.shape[1]
        starts = list(range(0, max(total - overlap, 1), step)) or [0]
        stems = {name: np.zeros_like(work) for name in self.stems}
        weight = np.zeros(total)
        for index, start in enumerate(starts):
            piece = work[:, start : start + chunk]
            if piece.shape[1] == 0:
                continue
            produced = self._forward(torch, piece)
            window = np.ones(piece.shape[1])
            edge = min(overlap, piece.shape[1] // 2)
            if index > 0 and edge:
                window[:edge] = _fade(edge)
            if index < len(starts) - 1 and edge:
                window[piece.shape[1] - edge :] = _fade(edge)[::-1]
            end = start + piece.shape[1]
            for name in self.stems:
                stems[name][:, start:end] += produced[name] * window
            weight[start:end] += window
        safe = np.maximum(weight, 1e-12)
        result: dict[str, np.ndarray] = {}
        for name in self.stems:
            mixed = stems[name] / safe
            if mono:
                mixed = mixed[:1]
            mixed = mixed[:, :frames]
            back = mixed if rate == SAMPLE_RATE else resample(mixed, SAMPLE_RATE, rate)
            if back.shape[1] < frames:
                back = np.pad(back, ((0, 0), (0, frames - back.shape[1])))
            result[name] = np.ascontiguousarray(back[:, :frames], dtype=np.float32)
        host.soft_empty_cache()
        if set(self.stems) == set(STEMS):
            # the names are the documented ones: hand them back in the documented order (the mixer
            # widget, the report and the strips read it) - the audio is matched by name, not index
            result = {name: result[name] for name in STEMS}
        return result

    def _forward(self, torch: Any, piece: np.ndarray) -> dict[str, np.ndarray]:
        """One chunk through the model: ``{stem: [channels, frames]}`` (float64, same length)."""
        tensor = torch.from_numpy(np.ascontiguousarray(piece, dtype=np.float32)).unsqueeze(0).to(self.device)
        with torch.no_grad():
            out = self.model(tensor)  # [batch, stems, channels, samples]
        if isinstance(out, dict):
            values = [out[name] for name in self.stems]
        else:
            stacked = out
            if stacked.shape[1] != len(self.stems) and stacked.shape[0] == len(self.stems):
                stacked = stacked.permute(1, 0, 2, 3)
            values = [stacked[:, index] for index in range(len(self.stems))]
        result: dict[str, np.ndarray] = {}
        for name, value in zip(self.stems, values, strict=True):
            array = value[0].detach().to("cpu").to(torch.float64).numpy()
            if array.ndim != 2:
                array = array.reshape(piece.shape[0], -1)
            if array.shape[-1] != piece.shape[1]:
                array = array[:, : piece.shape[1]]
            result[name] = array
        return result


def instruments_of(config: Mapping[str, Any], model_config: Mapping[str, Any]) -> tuple[str, ...]:
    """The stem order of the checkpoint's output dimension (the order it was trained in).

        MSST configs list it under ``training.instruments``; a checkpoint without a config falls back to
    the released ``audio_config.json``, and a config without the list to :data:`STEMS`. A list that does
    not match the model's ``num_stems`` is refused instead of guessed.
    """
    training = config.get("training") if isinstance(config.get("training"), dict) else {}
    listed = training.get("instruments") or config.get("instruments")
    if listed is None:
        names = STEMS
    else:
        if not isinstance(listed, (list, tuple)) or not all(
            isinstance(item, str) and item.strip() for item in listed
        ):
            raise PlenioModelError(f"{NAME}: 'instruments' must be a list of stem names.")
        names = tuple(item.strip() for item in listed)
    if len(set(names)) != len(names) or REST in names:
        raise PlenioModelError(
            f"{NAME}: the stem names must be unique and must not contain '{REST}'.",
            hint="'rest' is the residual Plenio adds itself; a config that names it is not usable.",
        )
    expected = model_config.get("num_stems")
    if expected is not None and int(expected) != len(names):
        raise PlenioModelError(
            f"{NAME}: the model has {int(expected)} stems, its config names {len(names)}.",
            hint="Use the released checkpoint with its config, or a config that matches the model.",
        )
    return names


def load(path: Path) -> BSRoformerSeparator:
    """Build the separator for a checkpoint file (called by ``audio_models.load``)."""
    torch = _require_torch()
    from ..third_party import msst as vendor

    substitutes = vendor.ensure_dependencies()
    from ..third_party.msst.bs_roformer import BSRoformer

    config, state = _read_checkpoint(path, torch)
    model_config = dict(config["model"])
    try:
        model = BSRoformer(**model_config)
        model.load_state_dict(_match_state_dict(model, state))
    except (KeyError, RuntimeError, TypeError) as error:
        raise PlenioModelError(
            f"{path.name} does not match the BS-RoFormer architecture: {error}",
            hint=f"Use the released checkpoint ({FILE_NAMES[0]}) or one with its own config.",
        ) from error
    device = host.torch_device()
    model = model.to(device).eval()
    audio = dict(config.get("audio") or {})
    inference = dict(config.get("inference") or {})
    chunk = int(audio.get("chunk_size") or 485100)
    num_overlap = max(1, int(inference.get("num_overlap") or 2))
    host.soft_empty_cache()
    return BSRoformerSeparator(
        model=model,
        device=str(device),
        chunk_frames=chunk,
        overlap_frames=chunk // num_overlap,
        stems=instruments_of(config, model_config),
        substitutes=tuple(sorted(substitutes)),
    )


def _match_state_dict(model: Any, state: dict[str, Any]) -> dict[str, Any]:
    """A Lightning checkpoint prefixes the weights (``model.``, ``ema_model.``); the plain model not."""
    expected = set(model.state_dict())
    if set(state) == expected:
        return state
    for prefix in ("model.", "ema_model.", "_orig_mod."):
        if all(key.startswith(prefix) for key in state):
            stripped = {key[len(prefix) :]: value for key, value in state.items()}
            if set(stripped) == expected:
                return stripped
    return state  # load_state_dict reports exactly what is missing or unexpected


def _read_checkpoint(path: Path, torch: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    """``(config, state_dict)``: the checkpoint's own config or the released one."""
    try:
        payload = torch.load(str(path), map_location="cpu", weights_only=False)
    except Exception as error:  # noqa: BLE001 - torch raises many types for a broken file
        raise PlenioModelError(
            f"{path.name} could not be read as a {NAME} checkpoint: {error}",
            hint="Download the checkpoint again (the missing-model dialog), or choose another file.",
        ) from error
    if not isinstance(payload, dict):
        raise PlenioModelError(f"{path.name} is not a checkpoint of {NAME}.")
    state = payload.get("state_dict") or payload
    state = {str(key): value for key, value in state.items()}
    config = payload.get("hyper_parameters") or payload.get("config") or {}
    if isinstance(config, dict) and "config" in config and "model" not in config:
        config = config["config"]
    if not isinstance(config, dict) or "model" not in config:
        config = json.loads((VENDOR / CONFIG_NAME).read_text(encoding="utf-8"))
    return dict(config), state


# --- registration (imported once by ``audio_models._ensure_registered``) ----------------------------


def _register() -> None:
    from .audio_models import Adapter, register

    register(Adapter(name=NAME, kind="separation", matches=matches, load=load))


_register()


__all__ = [
    "FILE_NAMES",
    "NAME",
    "SAMPLE_RATE",
    "STEMS",
    "BSRoformerSeparator",
    "instruments_of",
    "load",
    "matches",
]
