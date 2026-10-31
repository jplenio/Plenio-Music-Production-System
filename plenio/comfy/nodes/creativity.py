"""Creativity: the brief's creativity as sampling values for one stage (the writer, the arrangement, YuE2's
plan or take), inside the template blocks (owner's request 2026-10-19)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.creativity import CREATIVITY_DEFAULT, STAGES, creativity_value, describe, sampling
from ..types import Brief

STAGE_TOOLTIP = (
    "writer: the first draft's temperature; arrangement: a creative mode's plan; plan: YuE2's score (ABC); "
    "take: YuE2's performance (music tokens)."
)
CREATIVITY_TOOLTIP = (
    "0 steady ... 25 balanced (the native defaults) ... 50 experimental (the default) ... 100 adventurous. A "
    "connected brief's creativity "
    "takes its place."
)


class PlenioCreativity(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioCreativity",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Creativity",
            category="Plenio/Song",
            description=(
                "Turns the brief's creativity (0 steady, 25 balanced, 50 the default, 100 adventurous) into the "
                "sampling of one stage: the writer's first draft, a creative mode's arrangement, YuE2's plan or YuE2's "
                "take. At 25 it gives the values the templates had before the slider, at 50 those 1.4 had at 100; the "
                "ends stay moderate. Used inside the template blocks - the slider is on Song Brief and Cover Brief."
            ),
            inputs=[
                io.Combo.Input("stage", options=list(STAGES), default="take", tooltip=STAGE_TOOLTIP),
                io.Int.Input(
                    "creativity",
                    default=CREATIVITY_DEFAULT,
                    min=0,
                    max=100,
                    step=1,
                    display_mode=io.NumberDisplay.slider,
                    tooltip=CREATIVITY_TOOLTIP,
                ),
                Brief.Input("brief", optional=True, tooltip="Optional: its creativity is used instead."),
            ],
            outputs=[
                io.Float.Output(display_name="temperature", tooltip="For the stage's temperature field."),
                io.Float.Output(display_name="top_p", tooltip="For YuE2's top_p field (plan and take)."),
                io.Int.Output(display_name="top_k", tooltip="For YuE2's top_k field (plan and take)."),
            ],
        )

    @classmethod
    def execute(cls, stage: str, creativity: int = CREATIVITY_DEFAULT, brief: Any = None) -> io.NodeOutput:
        value = creativity_value(
            getattr(brief, "creativity", creativity) if brief is not None else creativity
        )
        chosen = sampling(value, stage)
        return io.NodeOutput(
            chosen.temperature,
            chosen.top_p,
            chosen.top_k,
            ui={
                "plenio_summary": [
                    {
                        "status": "ok",
                        "markdown": f"Creativity {describe(value)} - {stage}: temperature {chosen.temperature}, "
                        f"top-p {chosen.top_p}, top-k {chosen.top_k}",
                    }
                ]
            },
        )
