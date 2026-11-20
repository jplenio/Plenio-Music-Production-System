"""YuE2 Decoder (YuE2-VAE-RS x3) behind ComfyUI's VAE socket, with a fake checkpoint VAE and a fake decoder.

What matters here is the plumbing: encode stays the checkpoint's own, every decode path goes to x3 and none to the
checkpoint's decoder, the tile size is bounded, a checkpoint is never saved from it, and a file that is not x3 is
refused. The released weights (2 x 0.75 GB) are not needed: the real decode is checked against Ruach Studio's
reference outside the suite (the pull request reports the numbers).
"""

from __future__ import annotations

import json
import struct
from pathlib import Path
from typing import Any

import pytest

from plenio.comfy import host, yue2_decoder
from plenio.core.errors import PlenioModelError, PlenioUserError

torch = pytest.importorskip("torch", reason="the decoder needs PyTorch (ComfyUI provides it)")


class FakeVAE:
    """The checkpoint's VAE: encodes, and fails the test if anything decodes with it."""

    audio_sample_rate = 48000
    latent_channels = 64
    downscale_ratio = 1920
    device = "cpu"

    def __init__(self) -> None:
        self.encoded: list[Any] = []

    def encode(self, pixel_samples: Any) -> Any:
        self.encoded.append(pixel_samples)
        return ("standard encoder", pixel_samples)

    def encode_tiled(self, pixel_samples: Any, *args: Any, **kwargs: Any) -> Any:
        return ("standard encoder, tiled", pixel_samples, args, kwargs)

    def decode(self, *args: Any, **kwargs: Any) -> Any:
        raise AssertionError("the checkpoint's decoder was used")

    decode_tiled = decode_tiled_1d = decode_tiled_ = decode_tiled_3d = decode

    def clone(self) -> FakeVAE:
        twin = FakeVAE()
        twin.device = self.device
        return twin


class FakeDecoder:
    """x3's decode API: records the tile sizes it was asked for and returns a recognisable waveform."""

    def __init__(self) -> None:
        self.cores: list[int] = []
        self.devices: list[str] = []

    def required_halo(self, core: int | None = None) -> int:
        return 60

    def to(self, device: Any) -> FakeDecoder:
        self.devices.append(str(device))
        return self

    def decode_tiled(self, latent: Any, core_frames: int, output_device: str, on_progress: Any) -> Any:
        self.cores.append(core_frames)
        on_progress(1, 1)
        batch, _, frames = latent.shape
        audio = torch.zeros(batch, 2, 1920 * frames)
        audio[:, 1] = 0.5
        return audio


@pytest.fixture(autouse=True)
def no_comfyui(monkeypatch: pytest.MonkeyPatch) -> None:
    class Progress:
        def __init__(self, total: int = 100) -> None:
            pass

        def update(self, fraction: float | None) -> None:
            pass

    monkeypatch.setattr(host, "Progress", Progress)
    monkeypatch.setattr(host, "raise_if_interrupted", lambda: None)
    monkeypatch.setattr(host, "soft_empty_cache", lambda: None)
    monkeypatch.setattr(host, "free_memory", lambda *args: None)


def wrapped() -> tuple[yue2_decoder.DecoderVAE, FakeVAE, FakeDecoder]:
    base, decoder = FakeVAE(), FakeDecoder()
    return yue2_decoder.DecoderVAE(base, decoder, "YuE2-VAE-RS-x3_v1.safetensors"), base, decoder


def test_encode_is_the_checkpoints_own() -> None:
    vae, base, _ = wrapped()
    audio = torch.zeros(1, 48000, 2)
    assert vae.encode(audio) == ("standard encoder", audio)
    assert base.encoded == [audio]
    assert vae.encode_tiled(audio, tile_x=4)[0] == "standard encoder, tiled"


def test_decode_goes_to_x3_and_returns_channels_last() -> None:
    vae, _, decoder = wrapped()
    audio = vae.decode(torch.zeros(2, 64, 10))
    assert tuple(audio.shape) == (2, 19200, 2)  # [batch, samples, channels], as VAE.decode returns it
    assert float(audio[0, 0, 1]) == 0.5
    assert decoder.cores == [yue2_decoder.TILE_FRAMES]
    assert decoder.devices[-1] == "cpu"  # parked in RAM after the decode


def test_the_tiled_decode_is_bounded_and_ignores_the_overlap() -> None:
    vae, _, decoder = wrapped()
    vae.decode_tiled(torch.zeros(1, 64, 5), tile_x=1536, tile_y=1536, overlap=64)
    vae.decode_tiled(torch.zeros(1, 64, 5), tile_x=256, tile_y=256, overlap=0)
    vae.decode_tiled(torch.zeros(1, 64, 5))
    assert decoder.cores == [yue2_decoder.TILE_FRAMES, 256, yue2_decoder.TILE_FRAMES]
    assert tuple(vae.decode_tiled_1d(torch.zeros(1, 64, 5)).shape) == (1, 2, 9600)


def test_a_nested_latent_decodes_its_audio_part() -> None:
    vae, _, _ = wrapped()
    nested = torch.nested.nested_tensor([torch.zeros(1, 7), torch.zeros(64, 3)])
    assert tuple(vae.decode(nested).shape) == (1, 5760, 2)


def test_a_single_latent_without_a_batch_decodes() -> None:
    vae, _, _ = wrapped()
    assert tuple(vae.decode(torch.zeros(64, 3)).shape) == (1, 5760, 2)


@pytest.mark.parametrize("shape", [(1, 8, 10), (1, 64), (64,), (1, 64, 2, 5)])
def test_other_latents_are_refused(shape: tuple[int, ...]) -> None:
    vae, _, _ = wrapped()
    with pytest.raises(PlenioUserError):
        vae.decode(torch.zeros(*shape))


def test_no_other_path_reaches_the_checkpoints_decoder() -> None:
    vae, _, _ = wrapped()
    for name in ("decode_tiled_", "decode_tiled_3d", "_decode_tiled_owned", "prepare_decode"):
        with pytest.raises(AttributeError):
            getattr(vae, name)


def test_a_clone_keeps_the_decoder_and_settings_reach_the_checkpoints_vae() -> None:
    vae, base, decoder = wrapped()
    twin = vae.clone()
    assert isinstance(twin, yue2_decoder.DecoderVAE) and twin.decoder_name == vae.decoder_name
    twin.device = "cuda:1"
    assert twin.device == "cuda:1" and base.device == "cpu"
    twin.decode(torch.zeros(1, 64, 2))
    assert decoder.cores == [yue2_decoder.TILE_FRAMES]


def test_a_checkpoint_is_never_saved_from_it() -> None:
    vae, _, _ = wrapped()
    with pytest.raises(PlenioUserError):
        vae.get_sd()


def test_only_yue2_s_vae_is_taken() -> None:
    assert yue2_decoder.is_yue2_vae(FakeVAE())

    class Other(FakeVAE):
        audio_sample_rate = 44100

    assert not yue2_decoder.is_yue2_vae(Other())
    assert not yue2_decoder.is_yue2_vae(object())


def write_safetensors(path: Path, names: dict[str, list[int]], metadata: dict[str, str]) -> Path:
    header: dict[str, Any] = {}
    offset = 0
    for name, shape in names.items():
        size = 4
        for extent in shape:
            size *= extent
        header[name] = {"dtype": "F32", "shape": shape, "data_offsets": [offset, offset + size]}
        offset += size
    header["__metadata__"] = metadata
    body = json.dumps(header).encode("utf-8")
    path.write_bytes(struct.pack("<Q", len(body)) + body + b"\0" * offset)
    return path


def test_a_standard_decoder_file_is_refused(tmp_path: Path) -> None:
    path = write_safetensors(
        tmp_path / "standard.safetensors", {"decoder.layers.0.bias": [2048]}, {"format": "pt"}
    )
    with pytest.raises(PlenioModelError, match="not a YuE2-VAE-RS x3 decoder"):
        yue2_decoder.load(path)


def test_a_partial_x3_file_is_refused(tmp_path: Path) -> None:
    """Strict: the x3 names with most tensors missing do not load as x3 with the rest left at random."""
    names = {"pre.0.conv1.bias": [2048], "blocks.0.units.3.conv1.bias": [1024]}
    path = write_safetensors(tmp_path / "partial.safetensors", names, {"variant": "x3", "step": "161953"})
    with pytest.raises(PlenioModelError, match="not a YuE2-VAE-RS x3 decoder"):
        yue2_decoder.load(path)


def test_a_file_that_is_not_safetensors_is_refused(tmp_path: Path) -> None:
    path = tmp_path / "flux2-vae.safetensors"
    path.write_bytes(b"not a safetensors file")
    with pytest.raises(PlenioModelError):
        yue2_decoder.load(path)
