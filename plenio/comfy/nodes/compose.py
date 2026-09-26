"""Compose Writing Prompt: brief + engine rules -> one plain prompt for any LLM node."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.brief import CoverBrief
from ...core.writing import DETAIL, compose
from ..types import Brief, Engine, Request


def _needs(brief: Any) -> dict[str, bool]:
    """Which lazy inputs this brief needs: the ASR language (original lyrics, language 'auto') and the
    source lyrics draft (new lyrics with the phrasing reference)."""
    cover = isinstance(brief, CoverBrief)
    return {
        "language": cover and brief.vocals == "original" and not brief.language,
        "reference_lyrics": cover and brief.writes_lyrics and brief.phrasing_reference,
    }


class PlenioComposePrompt(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioComposePrompt",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Compose Writing Prompt",
            category="Plenio/Writing",
            description=(
                "Builds the writing prompt from the brief and the rules of the loaded music model. Connect the "
                "prompt to any text-generation node (for example the native Generate Text) and its answer to "
                "Parse Song Draft. Covers are written against their final score."
            ),
            inputs=[
                Brief.Input("brief", tooltip="From Song Brief or Cover Brief."),
                Engine.Input("engine", tooltip="From the music model block (Engine Profile)."),
                io.String.Input(
                    "score",
                    optional=True,
                    force_input=True,
                    tooltip="The final score: its sections (and for covers its phrasing and tempo) guide the lyrics.",
                ),
                io.String.Input(
                    "language",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="Detected lyrics language (Transcribe Lyrics); requested only for original-lyrics covers "
                    "whose brief says 'auto'.",
                ),
                io.String.Input(
                    "reference_lyrics",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="The source's lyrics draft (Transcribe Lyrics: lyrics); requested only for new-lyrics covers with "
                    "the phrasing reference. Sectioned lyrics give the writer a syllable target per line.",
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
    def check_lazy_status(cls, brief: Any, **kwargs: Any) -> list[str]:
        needs = _needs(brief)
        return [name for name, wanted in needs.items() if wanted and name in kwargs and kwargs[name] is None]

    @classmethod
    def execute(
        cls,
        brief: Any,
        engine: Any,
        detail: str = "standard",
        score: str | None = None,
        language: str | None = None,
        reference_lyrics: str | None = None,
    ) -> io.NodeOutput:
        sections: list[str] = []
        phrasing: list[dict[str, Any]] = []
        tempo = None
        vocal_range: tuple[int, int] | None = None
        if score and score.strip():
            analysis = score_rules.validate(score)
            sections = [section.tag for section in analysis.sections]
            tempo = analysis.header.get("tempo_bpm")
            vocal = analysis.voices.get("Vocal", {})
            if vocal.get("notes") and vocal.get("lowest") is not None:
                vocal_range = (int(vocal["lowest"]), int(vocal["highest"]))
            if isinstance(brief, CoverBrief) and brief.writes_lyrics:
                phrasing = score_rules.phrasing(score)
        needs = _needs(brief)
        prompt, request = compose(
            brief,
            engine,
            detail=detail,
            score_sections=sections,
            phrasing=phrasing,
            language_hint=(language or "") if needs["language"] else "",
            reference_lyrics=(reference_lyrics or "") if needs["reference_lyrics"] else "",
            score_tempo=tempo if isinstance(brief, CoverBrief) else None,
            vocal_range=vocal_range if isinstance(brief, CoverBrief) else None,
        )
        kind = "cover" if request.kind == "cover" else "song"
        markdown = f"Prompt for **{engine.engine_id}** ({kind}), {len(request.sections)} section(s), lyrics: {request.lyrics_mode}"
        return io.NodeOutput(prompt, request, ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]})
