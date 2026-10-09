"""Match Song Form: YuE2's plan made to fit the lyrics' song form, with at most one second plan.

Inside the *YuE2 Plan* block (owner's request 2026-10-08): the plan's sung sections against the lyrics'
(``core.song_form``). A plan whose sections are the lyrics' in kind - or can be put in their order, or
named after them - is used at once; otherwise the ``alternative`` input, a second plan with the next seed,
is requested (lazy: it is planned only then) and the better plan wins; a kind still missing then takes a
related section's melody. Instrumentals, a score without singing and planning off pass through.
"""

from __future__ import annotations

import logging
from typing import Any

from comfy_api.latest import io

from ...core import song_form
from ...core.reports import Report, Status
from ..types import ReportType

LOG = logging.getLogger(__name__)


def _first(score: str | None, lyrics: str | None) -> song_form.Form:
    return song_form.match(lyrics or "", score or "")


def _unchecked(score: str, error: Exception) -> io.NodeOutput:
    """The plan as it is after an unexpected error (every sung YuE2 song passes here: it must not stop the run);
    the traceback goes to the console for a bug report."""
    LOG.exception("Plenio Match Song Form: the check failed; the plan is used as it is")
    reason = f"{type(error).__name__}: {error}"
    summary = f"Song form: not checked (an internal error, {reason}); the plan is used as it is"
    data = {"category": "error", "lyrics": [], "plan": [], "changes": [], "notes": [reason]}
    report = Report("song_form", Status.WARNING, summary + ".", (), data)
    return io.NodeOutput(
        score, report, ui={"plenio_summary": [{"status": "warning", "markdown": f"**{summary}**"}]}
    )


class PlenioMatchSongForm(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioMatchSongForm",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Match Song Form",
            category="Plenio/Score",
            description=(
                "Makes the planned score fit the lyrics' song form: sections of the same kind put in the lyrics' "
                "order (chorus words on the chorus melody), or named after the lyrics when the kinds differ. When "
                "neither works, a second plan (the alternative, planned only then) is tried and the better one "
                "wins; a section kind the plans do not have takes a related section's melody (a bridge a verse's). "
                "Only the sections move - YuE2's notes stay. Instrumentals pass through."
            ),
            inputs=[
                io.String.Input(
                    "score", force_input=True, tooltip="YuE2's plan (empty when planning is off)."
                ),
                io.String.Input(
                    "lyrics",
                    force_input=True,
                    tooltip="The lyrics the plan was made from (Song Sheet · Text's plan_lyrics).",
                ),
                io.String.Input(
                    "alternative",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="A second plan with the next seed; requested only when the first does not fit.",
                ),
            ],
            outputs=[
                io.String.Output(display_name="score", tooltip="The score in the lyrics' song form."),
                ReportType.Output(display_name="report", tooltip="What was compared, tried and changed."),
            ],
        )

    @classmethod
    def check_lazy_status(
        cls, score: str | None = None, lyrics: str | None = None, **kwargs: Any
    ) -> list[str]:
        if kwargs.get("alternative") is not None:
            return []
        try:
            first = _first(score, lyrics)
        except Exception:  # noqa: BLE001 - execute passes the plan through and says why
            return []
        return (
            ["alternative"]
            if first.category != song_form.SKIP and first.quality < song_form.REPLAN_BELOW
            else []
        )

    @classmethod
    def execute(cls, score: str, lyrics: str, alternative: str | None = None) -> io.NodeOutput:
        try:
            return cls._match(score, lyrics, alternative)
        except Exception as error:  # noqa: BLE001 - the plan as it is beats a stopped run
            return _unchecked(score, error)

    @classmethod
    def _match(cls, score: str, lyrics: str, alternative: str | None) -> io.NodeOutput:
        first = _first(score, lyrics)
        chosen, second_used, tried = first, False, False
        if (
            first.category != song_form.SKIP
            and first.quality < song_form.REPLAN_BELOW
            and alternative is not None
        ):
            tried = True
            second = _first(alternative, lyrics)
            if second.quality < song_form.REPLAN_BELOW:
                first = song_form.match(lyrics, score, substitute=True)
                second = song_form.match(lyrics, alternative, substitute=True)
            chosen = song_form.better(first, second)
            second_used = chosen is second
        if second_used:
            summary = f"Song form: a second plan fits better - {chosen.text}"
        elif tried:
            summary = f"Song form: a second plan did not fit better; {chosen.text}"
        else:
            summary = f"Song form: {chosen.text}"
        status = (
            Status.SKIPPED
            if chosen.category == song_form.SKIP
            else Status.WARNING
            if chosen.category == song_form.DIFFERS
            else Status.OK
        )
        data = {**chosen.to_dict(), "second_plan": tried, "second_plan_used": second_used}
        report = Report("song_form", status, summary + ".", tuple(chosen.changes), data)
        markdown = "\n".join([f"**{summary}**", *[f"- {change}" for change in chosen.changes]])
        return io.NodeOutput(
            chosen.score, report, ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]}
        )
