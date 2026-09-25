"""Score Tools: deterministic, validated operations on native two-voice ABC."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.reports import Report, Status
from ..types import Brief, ReportType

VOICE_ACTIONS = {"keep": "keep", "silence Vocal": "silence", "move Vocal melody to Ins": "move"}
CONFLICT = {"replace Ins": "replace", "keep Ins": "keep_ins"}


class PlenioScoreTools(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioScoreTools",
            display_name="Score Tools",
            category="Plenio/Score",
            description=(
                "Deterministic operations on a native two-voice ABC score. Every result is re-validated and the "
                "invariants are checked (for example: removing chords never changes a note)."
            ),
            inputs=[
                io.String.Input(
                    "score", force_input=True, tooltip="Score in the native two-voice ABC dialect."
                ),
                Brief.Input("brief", optional=True, tooltip="Needed by 'prepare from brief'."),
                io.DynamicCombo.Input(
                    "operation",
                    options=[
                        io.DynamicCombo.Option("prepare from brief", []),
                        io.DynamicCombo.Option("strip chords", []),
                        io.DynamicCombo.Option(
                            "voices",
                            [
                                io.Combo.Input(
                                    "vocal",
                                    options=list(VOICE_ACTIONS),
                                    default="keep",
                                    tooltip="What happens to the Vocal voice.",
                                ),
                                io.Combo.Input(
                                    "conflict",
                                    options=list(CONFLICT),
                                    default="replace Ins",
                                    tooltip="When moving: what wins where Ins already plays.",
                                ),
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "transpose",
                            [
                                io.Int.Input(
                                    "semitones",
                                    default=0,
                                    min=-12,
                                    max=12,
                                    tooltip="Semitones up (+) or down (-).",
                                ),
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "tempo",
                            [
                                io.Int.Input(
                                    "bpm", default=100, min=20, max=300, tooltip="New quarter-note tempo."
                                ),
                            ],
                        ),
                    ],
                    tooltip=(
                        "prepare from brief: sung songs unchanged; instrumental songs get a silent Vocal voice "
                        "(lead melody moved to Ins, or accompaniment only)."
                    ),
                ),
            ],
            outputs=[
                io.String.Output(display_name="score", tooltip="The transformed score."),
                io.String.Output(
                    display_name="section_tags", tooltip="Lyrics made of the score's section tags."
                ),
                ReportType.Output(
                    display_name="report", tooltip="What changed and which invariants were checked."
                ),
            ],
        )

    @classmethod
    def execute(cls, score: str, operation: dict[str, Any], brief: Any = None) -> io.NodeOutput:
        name = operation.get("operation", "prepare from brief")
        if not score.strip():
            report = Report("score_tools", Status.SKIPPED, f"{name}: no score (planning is off)")
            return io.NodeOutput(
                "", "", report, ui={"plenio_summary": [{"status": "skipped", "markdown": report.summary}]}
            )
        if name == "prepare from brief":
            if brief is None:
                change = score_rules.prepare(score, instrumental=False)
                change = score_rules.Change(change.abc, ("no brief connected: score unchanged",))
            else:
                change = score_rules.prepare(score, instrumental=brief.instrumental, melody=brief.melody)
        elif name == "strip chords":
            change = score_rules.strip_chords(score)
        elif name == "voices":
            action = VOICE_ACTIONS[operation.get("vocal", "keep")]
            if action == "keep":
                change = score_rules.Change(score, ("voices unchanged",))
            elif action == "silence":
                change = score_rules.silence_voice(score, "Vocal")
            else:
                change = score_rules.move_vocal_to_ins(
                    score, conflict=CONFLICT[operation.get("conflict", "replace Ins")]
                )
        elif name == "transpose":
            change = score_rules.transpose(score, int(operation.get("semitones", 0)))
        elif name == "tempo":
            change = score_rules.set_tempo(score, int(operation.get("bpm", 100)))
        else:
            raise ValueError(f"unknown operation {name!r}")
        analysis = score_rules.validate(change.abc)
        tags = score_rules.section_tags(change.abc)
        status = Status.WARNING if change.warnings else Status.OK
        report = Report(
            "score_tools",
            status,
            f"{name}: " + "; ".join(change.changes),
            tuple(change.warnings),
            {"operation": name, "changes": list(change.changes), "analysis": analysis.to_dict()},
        )
        markdown = "\n".join(
            [
                f"**{name}**",
                *[f"- {c}" for c in change.changes],
                *[f"- warning: {w}" for w in change.warnings],
            ]
        )
        return io.NodeOutput(
            change.abc, tags, report, ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]}
        )
