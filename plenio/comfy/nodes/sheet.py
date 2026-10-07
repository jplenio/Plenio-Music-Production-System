"""Song Sheet: the single authoritative, inspectable and editable point for the conditioning documents."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core import writing
from ...core.brief import CoverBrief
from ...core.diagnostics import has_errors, info, warning
from ...core.engines import rules_for
from ...core.errors import PlenioConflictError, PlenioValidationError
from ...core.reports import Report
from ...core.sheet import (
    BRIEF_REVIEW,
    DOCUMENT_KINDS,
    REVIEW_MODES,
    evaluate_sheet,
    needs_upstream,
    parse_sheet_state,
)
from .. import host
from ..shared import SERIES
from ..types import Brief, Engine, PitchType, ReportType, SheetState, TimelineType

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
            PitchType.Input(
                "sung_pitch",
                optional=True,
                tooltip="From Sung Pitch: the source's vocal line, drawn as a curve over the notes in the piano roll. "
                "Display only; it never reaches the model.",
            ),
            Brief.Input("brief", optional=True, tooltip="Vocal mode and length for validation."),
            Engine.Input(
                "engine", optional=True, tooltip="Rules and exact token counts of the loaded music model."
            ),
            io.Combo.Input(
                "review",
                options=list(REVIEW_MODES),
                default=BRIEF_REVIEW,
                tooltip="as the brief says: stop for review when the brief's mode is 'one song/cover, stop to "
                "review', continue for 'new song/cover every run'. stop for review: the documents are released "
                "only after you approve them in the editor - in a series every new song stops, and the run after "
                "Approve renders that song before the next one is written. continue: never stop for review.",
            ),
            SheetState.Input(
                "sheet_state",
                tooltip="Your edits and manual documents (edit them with the Song Sheet editor).",
            ),
            # appended (no widget): the slots of saved workflows stay where they were
            ReportType.Input(
                "arrangement",
                optional=True,
                lazy=True,
                tooltip="From Apply Arrangement: what the creative mode changed in the score - or why the score "
                "stayed as planned. Shown here and in the editor; requested only while the score comes from upstream.",
            ),
        ]
        return io.Schema(
            node_id="PlenioSongSheet",
            display_name="Song Sheet",
            category="Plenio/Song",
            description=(
                "Shows the documents that condition the music model and lets you edit or replace them. Manual "
                "text always wins; an edit whose draft changed stops the run with a conflict instead of being "
                "replaced (in a 'new song every run' series an edit belongs to its song, and the next song takes "
                "its own draft). What leaves the sheet reaches the model unchanged."
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
                io.String.Output(
                    display_name="plan_lyrics",
                    tooltip=(
                        "What the YuE2 planner reads: for an instrumental song, a section form for the brief's "
                        "length (never sung - the render keeps [instrumental]); otherwise the lyrics."
                    ),
                ),
            ],
            hidden=[io.Hidden.unique_id],
            is_output_node=True,
        )

    @classmethod
    def check_lazy_status(cls, sheet_state: str, review: str, **kwargs: Any) -> list[str]:
        state = parse_sheet_state(sheet_state)
        wanted = [
            kind
            for kind in DOCUMENT_KINDS
            if kind in kwargs and kwargs[kind] is None and needs_upstream(state, kind)
        ]
        # the arrangement report belongs to the score's draft: needed while that draft is
        if "arrangement" in kwargs and kwargs["arrangement"] is None and "score" in wanted:
            wanted.append("arrangement")
        return wanted

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
        report_in = kwargs.get("arrangement")
        arrangement = report_in if isinstance(report_in, Report) and "score" in owned else None
        context = {
            key.removeprefix("context_"): kwargs[key] for key in CONTEXT if kwargs.get(key) is not None
        }
        evaluation = evaluate_sheet(
            state,
            upstream,
            owned,
            review=review,
            brief_mode=getattr(brief, "mode", None),
            rules=rules_for(engine.engine_id) if engine is not None else None,
            engine_id=engine.engine_id if engine is not None else None,
            instrumental=bool(brief.instrumental) if brief is not None else False,
            tokenizer=engine.tokenizer if engine is not None else None,
            max_seconds=brief.max_seconds if brief is not None else None,
            target_seconds=brief.target_seconds if brief is not None else None,
            context=context,
            extra_findings=[*_cover_findings(brief, upstream, state), *_arrangement_findings(arrangement)],
        )
        payload = {**evaluation.payload(), "node_id": str(cls.hidden.unique_id)}
        if engine is not None:
            payload["style_label"] = getattr(rules_for(engine.engine_id), "STYLE_LABEL", "style")
        if timeline is not None:
            payload["timeline"] = timeline.to_dict()
        reference = kwargs.get("reference_audio")
        if reference is not None:
            payload["reference_audio"] = host.save_reference_audio(reference)
        sung = kwargs.get("sung_pitch")
        if sung is not None:
            payload["sung_pitch"] = sung.to_dict()
        if arrangement is not None:
            payload["arrangement"] = {**dict(arrangement.data), "report_status": arrangement.status.value}
        if evaluation.conflicts or has_errors(evaluation.findings):
            host.send_event(EVENT, payload)  # the editor needs the new drafts to resolve the problem
        if evaluation.conflicts:
            reasons = "; ".join(f"{doc.kind}: {doc.reason}" for doc in evaluation.resolution.conflicts)
            hint = (
                f"In the mode 'new {brief.kind} every run' the draft of an edited document is no longer "
                "connected: set the document to automatic (Use draft), or make it manual - the whole series "
                "then uses your text."
                if getattr(brief, "mode", None) == "batch"
                else None
            )
            raise PlenioConflictError(
                f"Song Sheet conflict - {reasons}.", documents=evaluation.conflicts, hint=hint
            )
        if evaluation.has_errors and not evaluation.waiting_for_approval:
            # A pending review stop wins over document errors: the run stops at the sheet and the editor
            # shows the findings (for example I12: an unfilled DAW skeleton is an error, but composing it
            # is exactly what the review stop is for - plan §10.2). Nothing renders either way: the
            # outputs stay blocked, and an approved set with errors raises on the next run.
            raise PlenioValidationError(
                "The Song Sheet documents are not valid.",
                diagnostics=[f.to_dict() for f in evaluation.findings if f.severity == "error"],
                hint="Open the Song Sheet editor to fix them, or change the upstream draft.",
            )
        _follow_series(brief, evaluation.waiting_for_approval)
        report = evaluation.report()
        if arrangement is not None:  # the release record keeps what the creative mode did
            report = Report(
                report.kind,
                report.status,
                report.summary,
                report.messages,
                {**dict(report.data), "arrangement": dict(arrangement.data)},
                report.source,
                report.source_id,
            )
        documents: list[Any] = [evaluation.text(kind) for kind in DOCUMENT_KINDS]
        final_score = evaluation.text("score") if "score" in evaluation.owned else ""
        tags = score_rules.section_tags(final_score) if final_score.strip() else ""
        derived: list[Any] = [evaluation.planning_mode, evaluation.score_seconds]
        final_lyrics = evaluation.text("lyrics") if "lyrics" in evaluation.owned else ""
        plan_lyrics: Any = writing.plan_lyrics(final_lyrics or "", brief)
        if evaluation.waiting_for_approval:
            documents = [host.execution_blocker(None)] * len(DOCUMENT_KINDS)
            derived = [host.execution_blocker(None)] * 2
            tags = host.execution_blocker(None)
            plan_lyrics = host.execution_blocker(None)
        ui = {
            "plenio_sheet": [payload],
            "plenio_summary": [
                {"status": report.status.value, "markdown": _markdown(evaluation, arrangement)}
            ],
        }
        return io.NodeOutput(*documents, *derived, report, tags, plan_lyrics, ui=ui)


def _follow_series(brief: Any, waiting: bool) -> None:
    """New song/cover every run (``core.series``): a sheet that waits for approval keeps the song for the next
    runs, a sheet that lets it through releases it, so the run after the render writes the next song."""
    series, song = getattr(brief, "series", ""), getattr(brief, "variation", None)
    if not series or song is None:
        return
    if waiting:
        SERIES.hold(series, song)
    else:
        SERIES.release(series, song)


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


def _arrangement_findings(arrangement: Report | None) -> list[Any]:
    """The creative mode's result as findings: a fallback is a warning (the plan was not used)."""
    if arrangement is None:
        return []
    data = dict(arrangement.data)
    status, summary = str(data.get("status", "")), str(data.get("summary", ""))
    if status == "fallback":
        return [
            warning(
                f"The arrangement ({data.get('mode')}) was not applied: {summary.removeprefix('not applied: ')}. "
                "Run again with another arrangement seed, or choose another writer model.",
                "arrangement",
            )
        ]
    if status in ("applied", "partial", "unchanged"):
        return [info(f"Arrangement ({data.get('mode')}): {summary}", "arrangement")]
    return []


def _markdown(evaluation: Any, arrangement: Report | None = None) -> str:
    lines = [f"**{evaluation.status_line()}**"]
    for kind in evaluation.owned:
        doc = evaluation.resolution.docs[kind]
        # 'lyrics: yours (manual)': the words are the user's and the writer is not consulted (plan §7)
        if kind == "lyrics" and doc.status.value == "manual":
            lines.append("- lyrics: yours (manual)")
        else:
            lines.append(f"- {kind.replace('_', ' ')}: {doc.status.value}")
    if evaluation.validation and evaluation.validation.get("budget") and evaluation.engine_id:
        lines.append(
            f"- budget: {rules_for(evaluation.engine_id).describe_budget(evaluation.validation['budget'])}"
        )
    if "score" in evaluation.owned:
        lines.append(f"- render: {evaluation.planning_mode}, ceiling {evaluation.score_seconds:.0f} s")
    if arrangement is not None and str(arrangement.data.get("status")) in ("applied", "partial", "unchanged"):
        lines.append(f"- arrangement: {arrangement.data.get('summary')}")
    lines += [f"- {f.severity}: {f.message}" for f in evaluation.findings if f.severity != "info"]
    return "\n".join(lines)
