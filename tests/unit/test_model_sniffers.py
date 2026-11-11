"""The sniffers of the catalogue's components (``accepts``): a file's header says whether its loader takes it.

The headers are made up after the tensor names and shapes of the real files (read from their headers, never their
names): the sniffers look at keys and shapes only.
"""

from __future__ import annotations

import json
import struct
from pathlib import Path
from typing import Any

import pytest

from plenio.core.errors import PlenioUserError
from plenio.core.models import SNIFFERS, file_problem, load_components

PROJECT = Path(__file__).resolve().parents[2]


def tensors(*names: str, **shapes: list[int]) -> dict[str, Any]:
    found: dict[str, Any] = {name: {"dtype": "BF16", "shape": [1], "data_offsets": [0, 2]} for name in names}
    for name, shape in shapes.items():
        found[name.replace("__", ".")] = {"dtype": "BF16", "shape": shape, "data_offsets": [0, 2]}
    return found


def layers(count: int, prefix: str = "model.layers") -> list[str]:
    return [f"{prefix}.{n}.self_attn.q_proj.weight" for n in range(count)]


KINDS: dict[str, dict[str, Any]] = {
    "yue2-checkpoint": tensors(
        "model.diffusion_model.layers.0.weight",
        "vae.decoder.conv.weight",
        "text_encoders.yue2_tokenizer_json",
    ),
    "yue2-text-lora": tensors(
        "text_encoders.model.layers.0.mlp.down_proj.lora_down.weight",
        "text_encoders.model.layers.0.mlp.down_proj.lora_up.weight",
    ),
    "sheetsage": tensors("encoder.subsampling_module.conv.weight", "decoder.layers.0.fc1.weight"),
    "minimax-dit": tensors("diffusion_transformer.transformer.layers.0.weight", "cond_layer_logits"),
    "minimax-text-encoder": tensors(*layers(2), "model.audio_decoder.proj.weight"),
    "minimax-vae": tensors("dec_in_proj.weight", "decoder.model.0.weight"),
    "flux2-klein-4b": tensors(
        "double_stream_modulation_img.lin.weight",
        "double_blocks.0.img_attn.qkv.weight",
        txt_in__weight=[3072, 7680],
    ),
    "qwen3-4b": tensors(*layers(36), model__embed_tokens__weight=[151936, 2560]),
    "flux2-vae": tensors(
        "bn.running_mean",
        encoder__conv_out__weight=[64, 512, 3, 3],
        decoder__conv_in__weight=[512, 32, 3, 3],
    ),
    "gemma4-text": tensors(
        *layers(2), "vision_model.encoder.weight", model__embed_tokens__weight=[262144, 2560]
    ),
}
"""One header per sniffer that its loader takes."""

NEAR_MISSES: dict[str, dict[str, Any]] = {
    # FLUX.2 Klein 9B reads Qwen3 8B (3 x 4096): the Cover Art block's 4B encoder does not fit it
    "flux2-klein-4b": tensors("double_stream_modulation_img.lin.weight", txt_in__weight=[4096, 12288]),
    # Qwen3 8B, and a vision-language model with 36 layers of 2560
    "qwen3-4b": tensors(*layers(36), model__embed_tokens__weight=[151936, 4096]),
    # the FLUX.1 VAE: 16 latent channels, no batch norm
    "flux2-vae": tensors(encoder__conv_out__weight=[32, 512, 3, 3], decoder__conv_in__weight=[512, 16, 3, 3]),
    # Gemma 2: no vision part, another vocabulary
    "gemma4-text": tensors(*layers(2), model__embed_tokens__weight=[256000, 2304]),
    # m-a-p's Transformers layout of YuE2
    "yue2-checkpoint": tensors(*layers(2), "lm_head.weight"),
}


def write(folder: Path, name: str, header: dict[str, Any]) -> Path:
    raw = json.dumps({"__metadata__": {"format": "pt"}, **header}).encode("utf-8")
    path = folder / name
    path.write_bytes(struct.pack("<Q", len(raw)) + raw)  # the header is all a sniffer reads
    return path


def test_every_sniffer_has_a_file_it_takes_and_says_why_it_refuses_the_others(tmp_path: Path) -> None:
    assert set(KINDS) == set(SNIFFERS)
    for kind, header in KINDS.items():
        path = write(tmp_path, f"{kind}.safetensors", header)
        assert file_problem(kind, path) is None, kind
        for other, other_header in KINDS.items():
            if other == kind:
                continue
            refused = file_problem(kind, write(tmp_path, f"{other}-as-{kind}.safetensors", other_header))
            assert isinstance(refused, str) and refused, (kind, other)


@pytest.mark.parametrize("kind", sorted(NEAR_MISSES))
def test_a_file_of_a_neighbouring_kind_is_refused_with_its_reason(tmp_path: Path, kind: str) -> None:
    said = file_problem(kind, write(tmp_path, "near.safetensors", NEAR_MISSES[kind]))
    assert isinstance(said, str) and said


def test_the_reason_names_the_mismatch() -> None:
    assert "12288" in (SNIFFERS["flux2-klein-4b"](NEAR_MISSES["flux2-klein-4b"]) or "")
    assert "4096" in (SNIFFERS["qwen3-4b"](NEAR_MISSES["qwen3-4b"]) or "")
    assert "Transformers layout" in (SNIFFERS["yue2-checkpoint"](NEAR_MISSES["yue2-checkpoint"]) or "")


def test_what_has_no_header_to_read(tmp_path: Path) -> None:
    empty = tmp_path / "half.safetensors"
    empty.write_bytes(b"")
    assert file_problem("minimax-dit", empty) is None  # an interrupted download: the inventory says so
    broken = tmp_path / "broken.safetensors"
    broken.write_bytes(struct.pack("<Q", 40) + b"{not json")
    assert file_problem("minimax-dit", broken) == "not readable as a safetensors file"
    huge = tmp_path / "huge.safetensors"
    huge.write_bytes(struct.pack("<Q", 2**40))
    assert file_problem("minimax-dit", huge) == "not a safetensors file"
    gguf = tmp_path / "writer.gguf"
    gguf.write_bytes(b"GGUF")
    assert file_problem("gemma4-text", gguf) == "not a safetensors file"
    assert file_problem("", gguf) is None  # a component without a sniffer takes what its folder has


def test_the_catalogue_names_known_sniffers_and_its_own_files_pass_their_own(tmp_path: Path) -> None:
    components = load_components(PROJECT / "resources" / "models.toml")
    assert {c.accepts for c in components.values()} - {""} <= set(SNIFFERS)
    text = (PROJECT / "resources" / "models.toml").read_text(encoding="utf-8")
    broken = tmp_path / "models.toml"
    broken.write_text(
        text.replace('accepts = "minimax-vae"', 'accepts = "no-such-kind"', 1), encoding="utf-8"
    )
    with pytest.raises(PlenioUserError, match="no sniffer 'no-such-kind'"):
        load_components(broken)
