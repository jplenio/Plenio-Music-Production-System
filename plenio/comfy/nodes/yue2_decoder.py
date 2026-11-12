"""YuE2 Decoder: Ruach Studio's YuE2-VAE-RS x3 decoder in place of the checkpoint's own (experimental)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.errors import PlenioModelError, PlenioUserError
from .. import host, yue2_decoder


class PlenioYuE2Decoder(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioYuE2Decoder",
            display_name="YuE2 Decoder (VAE-RS)",
            category="Plenio/Model",
            is_experimental=True,
            description=(
                "Decodes YuE2's latents with Ruach Studio's YuE2-VAE-RS x3 decoder (a file in models/vae) instead of the "
                "checkpoint's own; encoding keeps the checkpoint's encoder. Connect the YuE2 model block's VAE here and this "
                "VAE wherever that one went. Runs in float32 with the exact context each side, so a tiled decode's tile size "
                "changes the memory, never the audio. Weights CC BY-NC 4.0."
            ),
            inputs=[
                io.Vae.Input("vae", tooltip="VAE output of the YuE2 model block."),
                io.Combo.Input(
                    "decoder",
                    options=[yue2_decoder.SHARED, *host.model_files("vae")],
                    default=yue2_decoder.SHARED,
                    tooltip=(
                        "YuE2-VAE-RS-x3_v1.safetensors or _v2 (or their -full files) in models/vae. "
                        f"'{yue2_decoder.SHARED}' passes the VAE through unchanged. Press R after adding a file."
                    ),
                ),
            ],
            outputs=[
                io.Vae.Output(
                    display_name="VAE",
                    tooltip="Decodes with the chosen decoder, encodes with the checkpoint's encoder.",
                )
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        # a decoder file replaced under the same name is read again instead of served from ComfyUI's cache
        decoder = str(kwargs.get("decoder") or yue2_decoder.SHARED)
        path = None if decoder == yue2_decoder.SHARED else host.locate_model("vae", decoder)
        if path is None:
            return decoder
        stat = path.stat()
        return f"{decoder}|{stat.st_size}|{stat.st_mtime_ns}"

    @classmethod
    def execute(cls, vae: Any, decoder: str) -> io.NodeOutput:
        if decoder == yue2_decoder.SHARED:
            return io.NodeOutput(vae)
        if not yue2_decoder.is_yue2_vae(vae):
            raise PlenioUserError(
                "YuE2 Decoder takes the VAE of a YuE2 model (48 kHz stereo, 64 latent channels); this one is not.",
                hint="Connect the VAE output of the Plenio · YuE2 Model block.",
            )
        path = host.locate_model("vae", decoder)
        if path is None:
            raise PlenioModelError(
                f"{decoder} is not in models/vae.",
                hint="Download YuE2-VAE-RS-x3_v1.safetensors from huggingface.co/goldhub/YuE2-RS-Finetunes "
                "(VAE-RS/) into models/vae and press R.",
            )
        device = str(getattr(vae, "device", None) or host.torch_device())
        return io.NodeOutput(yue2_decoder.DecoderVAE(vae, yue2_decoder.load(path, device), decoder))
