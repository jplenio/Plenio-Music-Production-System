"""Load Audio Model: a super-resolution or separation model for Refine and Separate Stems (experimental)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.errors import PlenioModelError
from ...core.models import AUDIO_MODEL_FOLDERS
from .. import audio_models, host
from ..types import AudioModelType


class PlenioAudioModelLoader(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioAudioModelLoader",
            display_name="Load Audio Model",
            category="Plenio/Audio",
            is_experimental=True,
            description=(
                "Loads a super-resolution model (for Refine) from models/audio_sr or a separation model "
                "(for Separate Stems) from models/audio_separation. Experimental: the engines arrive in a "
                "later release; Refine's 'resample only' needs no model."
            ),
            inputs=[
                io.DynamicCombo.Input(
                    "kind",
                    options=[
                        io.DynamicCombo.Option(
                            kind,
                            [
                                io.Combo.Input(
                                    "model",
                                    options=host.model_files(folder),
                                    tooltip=f"A model file in models/{folder}.",
                                )
                            ],
                        )
                        for kind, folder in AUDIO_MODEL_FOLDERS.items()
                    ],
                    tooltip="super-resolution: for Refine (48 kHz); separation: for Separate Stems.",
                )
            ],
            outputs=[
                AudioModelType.Output(
                    display_name="model",
                    tooltip="The loaded model, for Refine (super-resolution) or Separate Stems.",
                )
            ],
        )

    @classmethod
    def execute(cls, kind: dict[str, Any]) -> io.NodeOutput:
        name = str(kind.get("kind", ""))
        file = str(kind.get("model", "") or "")
        folder = AUDIO_MODEL_FOLDERS.get(name, "")
        path = host.locate_model(folder, file) if file else None
        if path is None:
            raise PlenioModelError(
                f"The {name} model {file or '(none)'} is not in models/{folder}.",
                hint="Download it with the missing-model dialog, or put it into that folder and refresh.",
            )
        return io.NodeOutput(audio_models.load(name, file, path))
