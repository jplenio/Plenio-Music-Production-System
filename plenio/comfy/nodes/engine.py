"""Engine Profile: identifies the loaded music model and provides its rules (R8)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from .. import host
from ..types import Engine


class PlenioEngine(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioEngine",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Engine Profile",
            category="Plenio/Model",
            description=(
                "Detects the music model behind a CLIP (YuE2 or MiniMax Music 3) and outputs its rules and an exact tokenizer, so "
                "that writing, validation and budgets always follow the model that is actually loaded."
            ),
            inputs=[io.Clip.Input("clip", tooltip="CLIP output of the music model's loader.")],
            outputs=[
                Engine.Output(
                    display_name="engine", tooltip="Engine descriptor for Write Song and the Song Sheet."
                )
            ],
        )

    @classmethod
    def execute(cls, clip: Any) -> io.NodeOutput:
        engine = host.detect_engine(clip)
        markdown = f"**{engine.engine_id}** ({engine.rules_version}); exact token counts: " + (
            "yes" if engine.tokenizer is not None else "no"
        )
        return io.NodeOutput(engine, ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]})
