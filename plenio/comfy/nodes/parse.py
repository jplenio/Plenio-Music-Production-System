"""Parse Song Draft: robust parsing and deterministic format enforcement of an LLM answer."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.diagnostics import Finding, summarize
from ...core.reports import Report, Status
from ...core.writing import draft_findings, parse_draft
from ..types import ReportType, Request


class PlenioParseDraft(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioParseDraft",
            display_name="Parse Song Draft",
            category="Plenio/Writing",
            description=(
                "Extracts title, style, lyrics and artwork prompt from the writing model's answer and enforces the "
                "format (one-line style, [Tag] sections, tags only for instrumentals). Every change is reported."
            ),
            inputs=[
                io.String.Input("text", force_input=True, tooltip="The writing model's answer."),
                Request.Input("request", tooltip="From Compose Writing Prompt."),
            ],
            outputs=[
                io.String.Output(display_name="title", tooltip="Song title draft."),
                io.String.Output(display_name="style", tooltip="Style draft."),
                io.String.Output(display_name="lyrics", tooltip="Lyrics draft."),
                io.String.Output(display_name="artwork_prompt", tooltip="Cover image prompt draft."),
                ReportType.Output(display_name="report", tooltip="What was parsed and enforced."),
            ],
        )

    @classmethod
    def execute(cls, text: str, request: Any) -> io.NodeOutput:
        draft = parse_draft(text, request)
        findings = draft_findings(draft, request.engine_id, instrumental=request.instrumental)
        status = (
            Status.WARNING
            if draft.enforcements or any(f["severity"] != "info" for f in findings)
            else Status.OK
        )
        summary = f"Draft '{draft.title}': {len(draft.enforcements)} enforcement(s), checks: " + summarize(
            [Finding(f["severity"], f["message"], f["where"]) for f in findings]
        )
        report = Report(
            "song_draft",
            status,
            summary,
            tuple(draft.enforcements),
            {"draft": draft.to_dict(), "findings": findings, "request": request.to_dict()},
        )
        lines = [
            f"**{draft.title}**",
            "",
            *[f"- {note}" for note in draft.enforcements],
            *[f"- {f['severity']}: {f['message']}" for f in findings],
        ]
        return io.NodeOutput(
            draft.title,
            draft.style,
            draft.lyrics,
            draft.artwork_prompt,
            report,
            ui={"plenio_summary": [{"status": status.value, "markdown": "\n".join(lines)}]},
        )
