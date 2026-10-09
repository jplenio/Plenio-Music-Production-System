"""Fit Lyrics: new cover lyrics against the melody, line by line, with at most two targeted repair rounds.

One node per round, unrolled in the *Write Song* block (owner's request 2026-10-08; ADR-0010's lazy writer
switch): the first checks the draft and, where lines do not fit their phrases, writes a repair prompt; a
writer answers it; the next merges the answer, checks again and asks once more; the last merges, shortens
what is still one or two syllables too long and asks nothing. ``answer`` is lazy - when the lyrics already
fit, no writer runs. Everything but a new-lyrics cover with a score passes through unchanged.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from comfy_api.latest import io

from ...core import lyrics_fit, syllables
from ...core.brief import CoverBrief
from ...core.errors import PlenioError
from ...core.reports import Report, Status
from ...core.score import native
from ...core.writing import lyrics_closeness_text
from ..types import Brief, ReportType

LOG = logging.getLogger(__name__)

FitState = io.Custom("PLENIO_LYRICS_FIT")
"""The previous round: ``{"round", "asked", "notes", "draft"}`` (``draft``: the draft's fitting lines)."""


def _skip_reason(brief: Any, score: str | None) -> str:
    if not isinstance(brief, CoverBrief) or not brief.writes_lyrics or brief.instrumental:
        return "only new lyrics of a cover are fitted to a melody"
    if not (score or "").strip():
        return "no score"
    return ""


def _phrasing(score: str) -> list[dict[str, Any]] | None:
    try:
        return native.phrasing(score)
    except PlenioError:
        return None


def _needs_reference(brief: Any) -> bool:
    return isinstance(brief, CoverBrief) and brief.writes_lyrics and brief.lyrics_closeness > 0


def _unfitted(lyrics: str, previous: dict[str, Any], round_number: int, error: Exception) -> io.NodeOutput:
    """The lyrics as they are after an unexpected error in the fitting (they are sung as written: a melisma
    or a squeeze where a line does not fit); the traceback goes to the console for a bug report."""
    LOG.exception("Plenio Fit Lyrics: the fitting failed; the lyrics are used as they are")
    reason = f"{type(error).__name__}: {error}"
    notes = [*previous.get("notes", []), f"round {round_number}: not fitted (an internal error, {reason})"]
    out = {"round": round_number, "asked": [], "notes": notes, "draft": previous.get("draft")}
    summary = f"Lyrics fit: not checked (an internal error, {reason}); the lyrics are used as they are"
    report = Report("lyrics_fit", Status.WARNING, summary + ".", tuple(notes), {"error": reason})
    return io.NodeOutput(
        lyrics,
        "",
        "",
        out,
        report,
        ui={"plenio_summary": [{"status": "warning", "markdown": f"**{summary}**"}]},
    )


class PlenioFitLyrics(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioFitLyrics",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Fit Lyrics",
            category="Plenio/Writing",
            description=(
                "New cover lyrics against the melody: every line against the notes of its phrase (about one "
                "syllable per note; one or two fewer are sung as a melisma). Lines that do not fit go back to the "
                "writer with their targets - only those lines, at most twice: chain three of these nodes (the "
                "Write Song block does), a writer between them. The last shortens a line still one or two "
                "syllables too long (I am -> I'm). Songs, original lyrics and instrumentals pass through."
            ),
            inputs=[
                io.String.Input(
                    "lyrics",
                    force_input=True,
                    tooltip="The lyrics: Parse Song Draft's, or the previous Fit Lyrics'.",
                ),
                Brief.Input("brief", tooltip="Song Brief or Cover Brief: only new cover lyrics are fitted."),
                io.String.Input(
                    "score",
                    optional=True,
                    force_input=True,
                    tooltip="The final score: its Vocal phrases are the targets.",
                ),
                io.String.Input(
                    "reference_lyrics",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="The source's lyrics (Transcribe Lyrics), for the meaning when the brief keeps close to "
                    "them; requested only then.",
                ),
                FitState.Input(
                    "state",
                    optional=True,
                    tooltip="The previous Fit Lyrics' state: what it asked the writer.",
                ),
                io.String.Input(
                    "answer",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="The writer's answer to the previous Fit Lyrics' prompt; requested only when it asked.",
                ),
                io.Boolean.Input(
                    "last",
                    default=False,
                    tooltip="The last round: asks the writer nothing more; shortens lines one or two syllables too "
                    "long.",
                ),
            ],
            outputs=[
                io.String.Output(display_name="lyrics", tooltip="The lyrics after this round."),
                io.String.Output(
                    display_name="prompt",
                    tooltip="The repair request for the writer (empty when the lyrics fit or in the last round).",
                ),
                io.String.Output(
                    display_name="schema",
                    tooltip="The answer's JSON schema, for Local LLM (the format is then exact).",
                ),
                FitState.Output(display_name="state", tooltip="For the next Fit Lyrics."),
                ReportType.Output(
                    display_name="report", tooltip="Lines that fit, what was asked and changed."
                ),
            ],
        )

    @classmethod
    def check_lazy_status(
        cls, lyrics: str = "", brief: Any = None, score: str | None = None, state: Any = None, **kwargs: Any
    ) -> list[str]:
        wanted = []
        if _skip_reason(brief, score):
            return []
        if isinstance(state, dict) and state.get("asked") and kwargs.get("answer") is None:
            wanted.append("answer")
        if _needs_reference(brief) and kwargs.get("reference_lyrics") is None and not kwargs.get("last"):
            wanted.append("reference_lyrics")
        return wanted

    @classmethod
    def execute(
        cls,
        lyrics: str,
        brief: Any,
        score: str | None = None,
        reference_lyrics: str | None = None,
        state: Any = None,
        answer: str | None = None,
        last: bool = False,
    ) -> io.NodeOutput:
        previous = state if isinstance(state, dict) else {}
        round_number = int(previous.get("round", -1)) + 1
        try:
            return cls._fit(lyrics, brief, score, reference_lyrics, previous, round_number, answer, last)
        except Exception as error:  # noqa: BLE001 - lyrics as written beat a stopped run
            return _unfitted(lyrics, previous, round_number, error)

    @classmethod
    def _fit(
        cls,
        lyrics: str,
        brief: Any,
        score: str | None,
        reference_lyrics: str | None,
        previous: dict[str, Any],
        round_number: int,
        answer: str | None,
        last: bool,
    ) -> io.NodeOutput:
        reason = _skip_reason(brief, score)
        phrasing = None if reason else _phrasing(score or "")
        if phrasing is None and not reason:
            reason = "the score cannot be read"
        if reason:
            out = {"round": round_number, "asked": [], "notes": list(previous.get("notes", []))}
            report = Report(
                "lyrics_fit", Status.SKIPPED, f"Lyrics fit skipped: {reason}.", (), {"skipped": reason}
            )
            markdown = f"**Lyrics fit skipped** - {reason}"
            return io.NodeOutput(
                lyrics,
                "",
                "",
                out,
                report,
                ui={"plenio_summary": [{"status": "skipped", "markdown": markdown}]},
            )
        assert phrasing is not None
        language = brief.language or syllables.guess_language(lyrics)
        notes: list[str] = list(previous.get("notes", []))
        text = lyrics
        if not previous:  # the draft: first into the score's song form (a writer may have left sections out)
            text, conformed = lyrics_fit.conform(text, phrasing)
            notes += conformed
        asked = [(int(item[0]), int(item[1])) for item in previous.get("asked", [])]
        if asked:
            before = lyrics_fit.check(text, phrasing, language=language)
            text, merged = lyrics_fit.merge(text, answer or "", asked, before)
            notes += [f"round {round_number}: {note}" for note in merged]
        fit = lyrics_fit.check(text, phrasing, language=language)
        draft = previous.get("draft") or list(fit.counts)
        prompt, schema, asked_now = "", "", []
        if not fit.fits and last:
            text, shortened = lyrics_fit.shorten(text, fit)
            notes += [f"last step: {note}" for note in shortened]
            fit = lyrics_fit.check(text, phrasing, language=language)
        elif not fit.fits:
            closeness = brief.lyrics_closeness if (reference_lyrics or "").strip() else 0
            repair = lyrics_fit.request(
                text,
                fit,
                language=language,
                closeness_text=lyrics_closeness_text(closeness) if closeness else "",
                reference=(reference_lyrics or "") if closeness else "",
                theme=brief.theme,
            )
            if repair is not None:
                prompt, schema, asked_now = repair.prompt, json.dumps(repair.schema), list(repair.asked)
        good, checked = fit.counts
        out = {"round": round_number, "asked": [list(a) for a in asked_now], "notes": notes, "draft": draft}
        status = Status.OK if fit.fits else Status.WARNING if last else Status.OK
        summary = f"Lyrics fit: {good} of {checked} line(s) fit the melody"
        if round_number:
            summary += f" (draft: {draft[0]} of {draft[1]})"
        if asked_now:
            summary += f"; {len(asked_now)} line(s) or section(s) go back to the writer"
        elif not fit.fits:
            summary += "; the rest is sung as it is (fewer syllables: a melisma; more: squeezed)"
        report = Report(
            "lyrics_fit",
            status,
            summary + ".",
            tuple(notes),
            {
                "round": round_number,
                "language": language,
                "fit": fit.to_dict(),
                "draft": draft,
                "asked": out["asked"],
            },
        )
        lines = [f"**Round {round_number}** - {summary}", *[f"- {note}" for note in notes[-12:]]]
        for section in fit.sections:
            for line in section.failing:
                lines.append(f"- [{section.tag}] line {line.line}: {line.problem}")
            if section.rewrite:
                lines.append(
                    f"- [{section.tag}]: {len(section.texts)} line(s) for {len(section.phrases)} phrase(s)"
                )
        return io.NodeOutput(
            text,
            prompt,
            schema,
            out,
            report,
            ui={"plenio_summary": [{"status": status.value, "markdown": "\n".join(lines)}]},
        )
