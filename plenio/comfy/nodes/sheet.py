"""Song Sheet: the single authoritative, inspectable and editable point for the conditioning documents."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.brief import CoverBrief
from ...core.diagnostics import has_errors, warning
from ...core.engines import rules_for
from ...core.errors import PlenioConflictError, PlenioValidationError
from ...core.sheet import DOCUMENT_KINDS, REVIEW_MODES, evaluate_sheet, needs_upstream, parse_sheet_state
from .. import host
from ..types import Brief, Engine, ReportType, SheetState, TimelineType

DOC_TOOLTIPS = {
    "title": "Song title draft.",
    "style": "Style / caption draft for the music model.",
    "lyrics": "Lyrics draft with [Tag] sections.",
    "score": "Score draft (native two-voice ABC).",
    "artwork_prompt": "Cover image prompt draft.",
}
CONTEXT = ("context_style", "context_lyrics", "context_score")
EVENT = "plenio.sheet"


class PlenioSongSheet(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        inputs: list[Any] = [
            io.String.Input(kind, optional=True, lazy=True, force_input=True, tooltip=DOC_TOOLTIPS[kind])
            for kind in DOCUMENT_KINDS
        ]
        inputs += [
            io.String.Input(
                "context_style",
                optional=True,
                force_input=True,
                tooltip="Style owned by another sheet; shown and used for the token budget.",
            ),
            io.String.Input(
                "context_lyrics",
                optional=True,
                force_input=True,
                tooltip="Lyrics owned by another sheet; shown and used for the token budget.",
            ),
            io.String.Input(
                "context_score",
                optional=True,
                force_input=True,
                tooltip="Score owned by another sheet; shown, used for the budget and to check the lyrics' sections.",
            ),
            TimelineType.Input(
                "timeline",
                optional=True,
                tooltip="From Transcribe Score: shows bar and section times of the source in the editor.",
            ),
            io.Audio.Input(
                "reference_audio",
                optional=True,
                tooltip="The recording the score was transcribed from: the editor plays it from the selected bar "
                "(A/B with the notes). Display only; it never reaches the model.",
            ),
            Brief.Input("brief", optional=True, tooltip="Vocal mode and length for validation."),
            Engine.Input(
                "engine", optional=True, tooltip="Rules and exact token counts of the loaded music model."
            ),
            io.Combo.Input(
                "review",
                options=list(REVIEW_MODES),
                default="continue",
                tooltip="stop for review: the documents are released only after you approve them in the editor.",
            ),
            SheetState.Input(
                "sheet_state",
                tooltip="Your edits and manual documents (edit them with the Song Sheet editor).",
            ),
        ]
        return io.Schema(
            node_id="PlenioSongSheet",
            display_name="Song Sheet",
            category="Plenio/Song",
            description=(
                "Shows the documents that condition the music model and lets you edit or replace them. Manual "
                "text always wins; an edit whose draft changed stops the run with a conflict instead of being "
                "replaced. What leaves the sheet reaches the model unchanged."
            ),
            inputs=inputs,
            outputs=[
                *[
                    io.String.Output(display_name=kind, tooltip=f"Final {kind.replace('_', ' ')}.")
                    for kind in DOCUMENT_KINDS
                ],
                io.Combo.Output(
                    display_name="planning_mode",
                    options=["full", "melody"],
                    tooltip="Render mode derived from the final score (chords -> full).",
                ),
                io.Float.Output(
                    display_name="score_seconds", tooltip="Render ceiling derived from the final score."
                ),
                ReportType.Output(display_name="report", tooltip="Final documents, states and validation."),
                io.String.Output(
                    display_name="section_tags",
                    tooltip="The final score's section tags (the lyrics of an instrumental cover).",
                ),
            ],
            hidden=[io.Hidden.unique_id],
            is_output_node=True,
        )

    @classmethod
    def check_lazy_status(cls, sheet_state: str, review: str, **kwargs: Any) -> list[str]:
        state = parse_sheet_state(sheet_state)
        return [
            kind
            for kind in DOCUMENT_KINDS
            if kind in kwargs and kwargs[kind] is None and needs_upstream(state, kind)
        ]

    @classmethod
    def execute(cls, sheet_state: str, review: str, **kwargs: Any) -> io.NodeOutput:
        state = parse_sheet_state(sheet_state)
        connected = [kind for kind in DOCUMENT_KINDS if kind in kwargs]
        owned = [
            kind for kind in DOCUMENT_KINDS if kind in connected or state.entry(kind).state.value == "manual"
        ]
        upstream = {kind: kwargs.get(kind) for kind in owned}
        brief, engine = kwargs.get("brief"), kwargs.get("engine")
        timeline = kwargs.get("timeline")
        context = {
            key.removeprefix("context_"): kwargs[key] for key in CONTEXT if kwargs.get(key) is not None
        }
        evaluation = evaluate_sheet(
            state,
            upstream,
            owned,
            review=review,
            rules=rules_for(engine.engine_id) if engine is not None else None,
            engine_id=engine.engine_id if engine is not None else None,
            instrumental=bool(brief.instrumental) if brief is not None else False,
            tokenizer=engine.tokenizer if engine is not None else None,
            max_seconds=brief.max_seconds if brief is not None else None,
            target_seconds=brief.target_seconds if brief is not None else None,
            context=context,
            extra_findings=_cover_findings(brief, upstream, state),
        )
        payload = {**evaluation.payload(), "node_id": str(cls.hidden.unique_id)}
        if timeline is not None:
            payload["timeline"] = timeline.to_dict()
        reference = kwargs.get("reference_audio")
        if reference is not None:
            payload["reference_audio"] = host.save_reference_audio(reference)
        if evaluation.conflicts or has_errors(evaluation.findings):
            host.send_event(EVENT, payload)  # the editor needs the new drafts to resolve the problem
        if evaluation.conflicts:
            reasons = "; ".join(f"{doc.kind}: {doc.reason}" for doc in evaluation.resolution.conflicts)
            raise PlenioConflictError(f"Song Sheet conflict - {reasons}.", documents=evaluation.conflicts)
        if evaluation.has_errors:
            raise PlenioValidationError(
                "The Song Sheet documents are not valid.",
                diagnostics=[f.to_dict() for f in evaluation.findings if f.severity == "error"],
                hint="Open the Song Sheet editor to fix them, or change the upstream draft.",
            )
        report = evaluation.report()
        documents: list[Any] = [evaluation.text(kind) for kind in DOCUMENT_KINDS]
        final_score = evaluation.text("score") if "score" in evaluation.owned else ""
        tags = score_rules.section_tags(final_score) if final_score.strip() else ""
        derived: list[Any] = [evaluation.planning_mode, evaluation.score_seconds]
        if evaluation.waiting_for_approval:
            documents = [host.execution_blocker(None)] * len(DOCUMENT_KINDS)
            derived = [host.execution_blocker(None)] * 2
            tags = host.execution_blocker(None)
        ui = {
            "plenio_sheet": [payload],
            "plenio_summary": [{"status": report.status.value, "markdown": _markdown(evaluation)}],
        }
        return io.NodeOutput(*documents, *derived, report, tags, ui=ui)


def _cover_findings(brief: Any, upstream: dict[str, Any], state: Any) -> list[Any]:
    """Cover-specific notes: brief warnings, and a sung cover whose score has no vocal melody."""
    if not isinstance(brief, CoverBrief):
        return []
    findings = [warning(message, "brief") for message in brief.warnings()]
    score = upstream.get("score")
    if score is None and state.entry("score").state.value == "manual":
        score = state.entry("score").text
    if not brief.instrumental and score:
        analysis = score_rules.analyze(score)
        if analysis.ok and analysis.voices["Vocal"]["notes"] == 0:
            findings.append(
                warning(
                    "The score has no vocal melody, but the cover is sung. Is the source instrumental? Choose "
                    "'instrumental' in the Cover Brief or check the transcription.",
                    "score",
                )
            )
    return findings


def _markdown(evaluation: Any) -> str:
    lines = [f"**{evaluation.status_line()}**"]
    for kind in evaluation.owned:
        doc = evaluation.resolution.docs[kind]
        lines.append(f"- {kind.replace('_', ' ')}: {doc.status.value}")
    if evaluation.validation and evaluation.validation.get("budget"):
        budget = evaluation.validation["budget"]
        lines.append(
            f"- budget: {budget['music_seconds']:.0f} s of music fit ({budget['prefix_tokens'] + budget['abc_tokens']} tokens used)"
        )
    if "score" in evaluation.owned:
        lines.append(f"- render: {evaluation.planning_mode}, ceiling {evaluation.score_seconds:.0f} s")
    lines += [f"- {f.severity}: {f.message}" for f in evaluation.findings if f.severity != "info"]
    return "\n".join(lines)
