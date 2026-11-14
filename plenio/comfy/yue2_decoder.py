"""YuE2-VAE-RS: Ruach Studio's x3 decoder for YuE2's latents, behind ComfyUI's VAE socket (experimental).

*YuE2 Decoder* takes the VAE of the YuE2 model block and returns a VAE that decodes with an x3 file from
``models/vae`` and encodes exactly as before, with the checkpoint's own (Standard) encoder. Every consumer keeps its
wiring: *VAE Decode Audio* and *VAE Decode Audio (Tiled)* of the render blueprints call ``decode`` /
``decode_tiled``, *VAE Encode Audio* of the cover path calls ``encode``.

Why a wrapper and not a ComfyUI VAE built from the file: ComfyUI recognises the YuE2 VAE by its key names, builds it
in Standard's shape and loads it with ``strict=False``, so x3's 210 new tensors would be dropped without an error and
the result would be neither decoder. The vendored loader (``third_party/yue2_vae_rs.py``, Ruach Studio's, Apache-2.0)
is strict instead: float32 only, the x3 layout and nothing else, every tensor present and none left over. It reads the
decoder-only release and the ``-full`` file (Standard's encoder beside the same decoder) alike; the encoder half of a
``-full`` file is not used here, since the checkpoint's encoder is the same one.

The decode runs in float32 with TF32 off, whatever ``--fp16-vae`` / ``--bf16-vae`` say: x3 was trained and measured
in float32 only, and a half-precision decode puts its rounding error above 4 kHz, where x3 and Standard differ. It is
tiled with the exact receptive field (60 latent frames of context each side, cropped, no crossfade), so the tile size
changes the memory and never the result.
"""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Any

from ..core.errors import PlenioModelError, PlenioUserError
from . import host

LATENT_CHANNELS = 64
SAMPLE_RATE = 48000
HOP = 1920
"""YuE2's latents: 64 channels at 25 frames a second, 1920 samples of 48 kHz stereo per frame."""

TILE_FRAMES = 750
"""Latent frames kept per tile (30 s). A larger tile from *VAE Decode Audio (Tiled)* is lowered to this, a smaller
one is honoured: with the exact context each side every tile size gives the same audio, so only memory changes."""

BYTES_PER_FRAME = 3.0e6
WEIGHT_BYTES = 0.85e9
"""Ruach Studio's measurement on an RTX 3090: 3.3 GB peak for a 750-frame tile with 60 frames of context each side,
weights included. What is asked of ComfyUI's model management before a decode on a GPU."""

SHARED = "the checkpoint's own"
"""Not a decoder: a VAE passed through unchanged (the node's default)."""

_LOCK = threading.Lock()
_LOADED: dict[tuple[str, int, int, str], Any] = {}
"""The last decoder read, by file identity (path, size, mtime) and device: a replaced file is read again."""


def is_yue2_vae(vae: Any) -> bool:
    """Is this ComfyUI VAE YuE2's (48 kHz stereo, 64 latent channels, 1920 samples a frame)?"""
    return (
        getattr(vae, "audio_sample_rate", None) == SAMPLE_RATE
        and getattr(vae, "latent_channels", None) == LATENT_CHANNELS
        and getattr(vae, "downscale_ratio", None) == HOP
    )


def load(path: Path, device: str = "cpu") -> Any:
    """The x3 decoder in ``path``, float32, parked in RAM; any other file is refused with the loader's reason.

    The weight norm is folded on ``device``, the card the decode will run on, as Ruach Studio's own node pack does,
    so a decode there matches theirs; the folded weights are then moved to the CPU until a decode needs them.
    """
    from ..third_party.yue2_vae_rs import DecoderError, load_decoder

    stat = path.stat()
    key = (str(path.resolve()), stat.st_size, stat.st_mtime_ns, device)
    with _LOCK:
        if key in _LOADED:
            return _LOADED[key]
        try:
            decoder = load_decoder(str(path), device=device, allow_standard=False)
        except DecoderError as error:
            raise PlenioModelError(
                f"{path.name} is not a YuE2-VAE-RS x3 decoder: {error}",
                hint="Choose YuE2-VAE-RS-x3_v1 or _v2 (decoder only or -full) from models/vae, or "
                f"'{SHARED}' to keep the checkpoint's decoder.",
            ) from error
        except Exception as error:  # noqa: BLE001 - safetensors' own errors for a file that is not one
            raise PlenioModelError(
                f"{path.name} could not be read as a YuE2-VAE-RS decoder: {error}",
                hint="YuE2-VAE-RS files are .safetensors from huggingface.co/goldhub/YuE2-RS-Finetunes (VAE-RS/).",
            ) from error
        if device != "cpu":
            decoder.to("cpu")
        _LOADED.clear()
        _LOADED[key] = decoder
        return decoder


class DecoderVAE:
    """A YuE2 VAE whose ``decode`` is YuE2-VAE-RS x3 and whose ``encode`` is the checkpoint's, unchanged.

    Everything that is not a decode is the wrapped VAE's: ``encode`` / ``encode_tiled`` (covers), the sample rate and
    compression ratios the audio nodes read, the device and patcher model management uses. Attributes a node sets on
    it (a multi-GPU node sets ``device`` and ``patcher`` on a clone) are set on the wrapped VAE, so encode and decode
    keep agreeing on the device. ``get_sd`` is refused: a ComfyUI checkpoint saved from this VAE would carry
    Standard's decoder under a name that promises x3. The wrapped ``first_stage_model`` stays the checkpoint's model;
    no ComfyUI node decodes YuE2 latents through it directly (checked against ComfyUI master, 2026-11-12).
    """

    _OWN = frozenset({"_base", "_decoder", "decoder_name"})

    def __init__(self, base: Any, decoder: Any, decoder_name: str):
        object.__setattr__(self, "_base", base)
        object.__setattr__(self, "_decoder", decoder)
        object.__setattr__(self, "decoder_name", decoder_name)

    def __getattr__(self, name: str) -> Any:
        if name in self._OWN or name.startswith("__"):
            raise AttributeError(name)
        if name.startswith(("decode", "_decode", "prepare_decode")):
            # any other way into the checkpoint's decoder would decode with Standard under x3's name
            raise AttributeError(f"{name} is not offered by YuE2 Decoder's VAE; use decode or decode_tiled")
        return getattr(self._base, name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name in self._OWN:
            object.__setattr__(self, name, value)
        else:
            setattr(self._base, name, value)

    def clone(self) -> DecoderVAE:
        return DecoderVAE(self._base.clone(), self._decoder, self.decoder_name)

    def get_sd(self) -> Any:
        raise PlenioUserError(
            f"This VAE decodes with {self.decoder_name} (YuE2-VAE-RS), which a ComfyUI checkpoint cannot hold.",
            hint="Save the VAE from the YuE2 model block instead; YuE2 Decoder adds the decoder again on loading.",
        )

    def encode(self, pixel_samples: Any) -> Any:
        return self._base.encode(pixel_samples)

    def encode_tiled(self, pixel_samples: Any, *args: Any, **kwargs: Any) -> Any:
        return self._base.encode_tiled(pixel_samples, *args, **kwargs)

    def decode(self, samples_in: Any, vae_options: Any = None) -> Any:
        return self._decode(samples_in, TILE_FRAMES)

    def decode_tiled(
        self,
        samples: Any,
        tile_x: int | None = None,
        tile_y: int | None = None,
        overlap: int | None = None,
        tile_t: int | None = None,
        overlap_t: int | None = None,
    ) -> Any:
        # the overlap is not used: every tile gets the exact context it needs, cropped, with no crossfade
        return self._decode(samples, min(int(tile_x), TILE_FRAMES) if tile_x else TILE_FRAMES)

    def decode_tiled_1d(self, samples: Any, tile_x: int = TILE_FRAMES, overlap: int = 0) -> Any:
        """ComfyUI's own tiling entry point, here as well, so that no path decodes with the checkpoint's decoder."""
        return self._decode(samples, min(int(tile_x), TILE_FRAMES)).movedim(-1, 1)

    def _decode(self, samples: Any, tile: int) -> Any:
        """``[B, 64, T]`` latents to ``[B, 1920 * T, 2]`` float32 audio on the CPU, as ``VAE.decode`` returns it."""
        import torch

        latent = samples.unbind()[-1] if getattr(samples, "is_nested", False) else samples
        if latent.ndim == 2:
            latent = latent.unsqueeze(0)
        if latent.ndim != 3 or latent.shape[1] != LATENT_CHANNELS:
            raise PlenioUserError(
                f"YuE2 Decoder expects YuE2 audio latents [batch, {LATENT_CHANNELS}, frames], got {tuple(latent.shape)}."
            )
        device = torch.device(getattr(self._base, "device", None) or host.torch_device())
        decoder = self._decoder
        tiles = [max(1, tile)]
        while device.type == "cuda" and tiles[-1] > 64:
            tiles.append(max(64, tiles[-1] // 2))
        latent = latent.detach().to(device="cpu", dtype=torch.float32)
        frames = int(latent.shape[-1])
        for attempt, core in enumerate(tiles):
            halo = decoder.required_halo(core)
            if device.type != "cpu":
                host.free_memory(
                    int(WEIGHT_BYTES + (min(core, frames) + 2 * halo) * BYTES_PER_FRAME * latent.shape[0]),
                    str(device),
                )
            bar = host.Progress(100)

            def progress(done: int, total: int, bar: Any = bar) -> None:
                host.raise_if_interrupted()
                bar.update(done / max(1, total))

            try:
                decoder.to(device)
                audio = decoder.decode_tiled(
                    latent, core_frames=core, output_device="cpu", on_progress=progress
                )
                break
            except torch.cuda.OutOfMemoryError:
                if attempt == len(tiles) - 1:
                    raise
            finally:
                decoder.to("cpu")
                host.soft_empty_cache()
        return audio.movedim(1, -1)
