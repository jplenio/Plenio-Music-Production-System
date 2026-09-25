"""Compose Writing Prompt: brief + engine rules -> one plain prompt for any LLM node."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.writing import DETAIL, compose
from ..types import Brief, Engine, Request


class PlenioComposePrompt(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioComposePrompt",
            display_name="Compose Writing Prompt",
            category="Plenio/Writing",
            description=(
                "Builds the writing prompt from the brief and the rules of the loaded music model. Connect the "
                "prompt to any text-generation node (for example the native Generate Text) and its answer to "
                "Parse Song Draft."
            ),
            inputs=[
                Brief.Input("brief", tooltip="From Song Brief."),
                Engine.Input("engine", tooltip="From the music model block (Engine Profile)."),
                io.String.Input(
                    "score",
                    optional=True,
                    force_input=True,
                    tooltip="Optional score whose sections the lyrics must follow.",
                ),
                io.Combo.Input(
                    "detail",
                    options=list(DETAIL),
                    default="standard",
                    advanced=True,
                    tooltip="How compact or rich the lyrics should be.",
                ),
            ],
            outputs=[
                io.String.Output(display_name="prompt", tooltip="Prompt text for the writing model."),
                Request.Output(
                    display_name="request",
                    tooltip="What was asked; Parse Song Draft checks the answer against it.",
                ),
            ],
        )

    @classmethod
    def execute(
        cls, brief: Any, engine: Any, detail: str = "standard", score: str | None = None
    ) -> io.NodeOutput:
        sections: list[str] = []
        if score and score.strip():
            sections = [section.tag for section in score_rules.validate(score).sections]
        prompt, request = compose(brief, engine, detail=detail, score_sections=sections)
        markdown = f"Prompt for **{engine.engine_id}**, {len(request.sections)} sections, " + (
            "instrumental" if request.instrumental else "sung"
        )
        return io.NodeOutput(prompt, request, ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]})
