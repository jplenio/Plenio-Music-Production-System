"""Compose Arrangement and Apply Arrangement: the creative modes' section plan around any writer model.

Compose Arrangement turns the score and the brief into the arrangement prompt and its JSON schema; a writer
(native Generate Text or Local LLM) answers; Apply Arrangement writes the plan into the score with the
validated score operations - or keeps the score as it was and says why. Its ``answer`` input is lazy: in
arrangement off, for a cover kept at its original song flow and without a score, no writer is asked.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from dataclasses import replace
from typing import Any

from comfy_api.latest import io

from ...core import arrangement
from ...core.brief import CoverBrief
from ...core.engines import yue2
from ...core.errors import PlenioError, PlenioUserError
from ...core.reports import Report, Status
from ...core.score import canonical as c
from ...core.score import native
from ..shared import mode_library
from ..types import Brief, Engine, ReportType

ArrangementState = io.Custom("PLENIO_ARRANGEMENT")
"""The first Apply Arrangement's result for the re-ask round: ``{"result", "text", "sections", "report"}``."""

BUDGET_MARGIN_S = 5.0
"""Seconds of music the context must hold beyond the arranged score's length."""
RECOMMENDATION = (
    "Run again with another arrangement seed - or choose a GGUF file, an LM Studio or an Ollama model as the writer "
    "model: Local LLM holds them to the plan's format exactly."
)


def rules_for(brief: Any, style: str = "") -> arrangement.Policy:
    """The section plan's limits for this brief (its creative mode and closeness); the brief's genre and the
    style choose the harmony guard's chord vocabulary."""
    if brief is None or not hasattr(brief, "arrangement"):
        raise PlenioUserError("Arrangement needs a Song Brief or a Cover Brief.", hint="Connect the brief.")
    mode = mode_library().by_name(brief.arrangement)
    return arrangement.policy(
        mode,
        kind="cover" if isinstance(brief, CoverBrief) else "song",
        closeness=brief.closeness,
        melody=arrangement.melody_of(instrumental=brief.instrumental, melody=brief.melody),
        genre=f"{brief.genre} {style}".strip(),
        under_singing=bool(getattr(brief, "lines_under_singing", False)),
    )


def harmony_text(measures: dict[str, Any]) -> str:
    """The harmony check of an arrangement in words (``harmony.Measures`` after it; the melody's fit before)."""
    after, before = measures.get("after") or {}, measures.get("before") or {}
    if not after:
        return ""
    return (
        f"melody {after['melody_on_chord']:.0%} on chord tones (before {before.get('melody_on_chord', 0):.0%}), "
        f"{after['accented_avoid']} accented clash(es) with a chord, {after['clashes']} clash(es) between voice "
        f"and line, chords {after['chords_in_key']:.0%} in the key ({measures.get('genre', 'pop')})"
    )


def _engine_name(engine: Any) -> str:
    if engine is None:
        return "YuE2"
    return "YuE2" if engine.engine_id == yue2.ENGINE_ID else str(engine.engine_id)


def _closeness(rules: arrangement.Policy) -> str:
    return f"{'genre' if rules.kind == 'song' else 'song flow'} closeness {rules.closeness}"


class PlenioComposeArrangement(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioComposeArrangement",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Compose Arrangement",
            category="Plenio/Score",
            description=(
                "Experimental (creative modes can give unexpected results - try them and listen). "
                "The arrangement prompt of the brief's creative mode: the score as a table (sections, chords, the "
                "melody on the strong beats, what the instrument line plays), the mode's rules, the closeness and "
                "the exact answer format - a small JSON plan, never notes. Connect the prompt to a writer (Generate "
                "Text or Local LLM; Local LLM also takes the schema) and its answer to Apply Arrangement."
            ),
            inputs=[
                io.String.Input(
                    "score", force_input=True, tooltip="The score to arrange (native two-voice ABC)."
                ),
                Brief.Input(
                    "brief", tooltip="Song Brief or Cover Brief: the creative mode and the closeness."
                ),
                Engine.Input("engine", optional=True, tooltip="The music model (its name in the prompt)."),
                io.String.Input(
                    "style",
                    optional=True,
                    force_input=True,
                    tooltip="The song's style, for the mood (optional).",
                ),
                io.String.Input(
                    "lyrics",
                    optional=True,
                    force_input=True,
                    tooltip="The song's lyrics, for the mood (optional).",
                ),
            ],
            outputs=[
                io.String.Output(display_name="prompt", tooltip="The arrangement prompt for the writer."),
                io.String.Output(
                    display_name="schema",
                    tooltip="The JSON schema of the answer, for Local LLM (constrained decoding: the format is exact).",
                ),
            ],
        )

    @classmethod
    def execute(
        cls,
        score: str,
        brief: Any,
        engine: Any = None,
        style: str | None = None,
        lyrics: str | None = None,
    ) -> io.NodeOutput:
        rules = rules_for(brief, style or "")
        if rules.skip or not (score or "").strip():
            reason = rules.skip_reason or "no score (planning is off)"
            markdown = f"**No arrangement prompt** - {reason}"
            return io.NodeOutput("", "", ui={"plenio_summary": [{"status": "skipped", "markdown": markdown}]})
        try:
            model = c.from_abc(score)
        except PlenioError as error:
            # Apply Arrangement keeps such a score as it is and says so; the writer is asked nothing useful
            markdown = (
                f"**No arrangement prompt** - the score cannot be edited note by note ({error.message})"
            )
            return io.NodeOutput("", "", ui={"plenio_summary": [{"status": "warning", "markdown": markdown}]})
        summary = arrangement.summarize(model, melody=rules.melody)
        rules = arrangement.for_score(rules, has_chords=summary.has_chords)  # YuE2 harmonises it
        text = arrangement.prompt(
            summary,
            rules,
            brief_text=brief.to_text(),
            genre=brief.genre,
            style=style or "",
            lyrics=lyrics or "",
            engine_name=_engine_name(engine),
        )
        answer_schema = arrangement.schema(rules, len(summary.sections))
        markdown = (
            f"Arrangement prompt: **{rules.mode.name}**, {_closeness(rules)}, {len(summary.sections)} section(s), "
            f"{summary.bars} bars"
        )
        return io.NodeOutput(
            text,
            json.dumps(answer_schema, ensure_ascii=False),
            ui={"plenio_summary": [{"status": "ok", "markdown": markdown}]},
        )


def _estimated_lyrics(text: str, brief: Any) -> str:
    """Lyrics of about the right size for a cover whose lyrics are written later: one syllable per sung note."""
    model = c.from_abc(text)
    tags = [label for label, _first, _end in arrangement.section_ranges(model)]
    if brief.instrumental or not model.vocal:
        return "\n".join(f"[{tag}]" for tag in tags)
    per_section = max(1, len(model.vocal) // max(1, len(tags)))
    return "\n\n".join(f"[{tag}]\n" + " ".join(["la"] * per_section) for tag in tags)


def budget_check(
    engine: Any, brief: Any, original: str, style: str | None, lyrics: str | None
) -> Callable[[str], str | None] | None:
    """Why an arranged score does not fit YuE2's context (``None``: it fits) - or no check without YuE2's
    tokenizer. A cover's style and lyrics are written later, so they are estimated."""
    if engine is None or engine.tokenizer is None or engine.engine_id != yue2.ENGINE_ID:
        return None
    style_text = (style or "").strip() or ", ".join(
        part for part in (brief.genre, getattr(brief, "mood", ""), brief.description[:200]) if part
    )
    lyrics_text = (lyrics or "").strip() or _estimated_lyrics(original, brief)
    before = yue2.budget(engine.tokenizer, style_text, lyrics_text, original)

    def check(abc: str) -> str | None:
        analysis = native.analyze(abc)
        if not analysis.ok:
            return None  # the arrangement's own check reports it
        after = yue2.budget(engine.tokenizer, style_text, lyrics_text, abc)
        if (
            after.music_seconds >= analysis.duration_s + BUDGET_MARGIN_S
            or after.abc_tokens <= before.abc_tokens
        ):
            return None
        return (
            f"{after.music_seconds:.0f} s of music would fit into YuE2's context, but the arranged score lasts "
            f"{analysis.duration_s:.0f} s"
        )

    return check


def _markdown(result: arrangement.Arrangement, rules: arrangement.Policy) -> str:
    if result.status == "skipped":
        return f"**Arrangement: skipped** - {rules.skip_reason}"
    if result.status == "fallback":
        lines = [f"**Arrangement not applied** (experimental) - {result.summary}"]
        if any("writer's answer" in note for note in result.notes):
            lines.append(f"- {RECOMMENDATION}")
        return "\n".join(lines)
    lines = [f"**Arrangement {rules.mode.name}** (experimental, {_closeness(rules)}) - {result.summary}"]
    if result.harmony:
        lines.append(f"- harmony check: {harmony_text(result.harmony)}")
    if result.idea:
        lines.append(f"- idea: {result.idea}")
    for section in result.sections:
        if section.applied:
            lines.append(f"- {section.index} {section.label} ({section.bars}): {'; '.join(section.applied)}")
        for kept in section.kept:
            lines.append(f"- {section.index} {section.label}: {kept}")
    lines += [f"- note: {note}" for note in result.notes]
    return "\n".join(lines)


class PlenioApplyArrangement(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioApplyArrangement",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Apply Arrangement",
            category="Plenio/Score",
            description=(
                "Experimental (creative modes can give unexpected results - try them and listen). "
                "Writes the writer's section plan into the score: chords that fit the melody, the instrument line "
                "of every section (written note by note by Plenio), key lifts and the tempo - each step validated. "
                "The result must pass YuE2's parser, read back unchanged, open in the score editor and fit YuE2's "
                "context; otherwise the score stays as it was and the report says why. With arrangement off (and "
                "for a cover kept at its original song flow) the writer is not asked at all."
            ),
            inputs=[
                io.String.Input(
                    "score", force_input=True, tooltip="The score to arrange (native two-voice ABC)."
                ),
                Brief.Input(
                    "brief", tooltip="Song Brief or Cover Brief: the creative mode and the closeness."
                ),
                io.String.Input(
                    "answer",
                    optional=True,
                    lazy=True,
                    force_input=True,
                    tooltip="The writer's answer to Compose Arrangement's prompt; requested only when a plan is wanted.",
                ),
                Engine.Input(
                    "engine",
                    optional=True,
                    tooltip="The music model: YuE2's context budget is checked with it.",
                ),
                io.String.Input(
                    "style",
                    optional=True,
                    force_input=True,
                    tooltip="The song's style, for the exact context budget (a cover's is estimated).",
                ),
                io.String.Input(
                    "lyrics",
                    optional=True,
                    force_input=True,
                    tooltip="The song's lyrics, for the exact context budget (a cover's are estimated).",
                ),
                io.Int.Input(
                    "seed",
                    default=0,
                    min=0,
                    max=0xFFFFFFFFFFFFFFFF,
                    control_after_generate=io.ControlAfterGenerate.fixed,
                    tooltip="Varies the notes of the instrument lines Plenio writes (the same seed, the same notes).",
                ),
                # appended: the inputs of saved workflows stay where they were
                ArrangementState.Input(
                    "first",
                    optional=True,
                    tooltip="The first Apply Arrangement's state: this node is then the re-ask round - it reads the "
                    "writer's second answer (only when sections were asked again) and keeps the better arrangement.",
                ),
            ],
            outputs=[
                io.String.Output(display_name="score", tooltip="The arranged score, or the score as it was."),
                ReportType.Output(
                    display_name="report",
                    tooltip="What was arranged and kept, or why the score stayed as it was (for the Song Sheet).",
                ),
                io.String.Output(
                    display_name="reask_prompt",
                    tooltip="The re-ask for the writer: the sections whose chords the harmony guard had to repair "
                    "(empty when there are none, and in the re-ask round).",
                ),
                io.String.Output(
                    display_name="reask_schema", tooltip="The re-ask's JSON schema, for Local LLM."
                ),
                ArrangementState.Output(
                    display_name="state", tooltip="For the re-ask round's Apply Arrangement."
                ),
            ],
        )

    @classmethod
    def check_lazy_status(cls, score: str | None = None, brief: Any = None, **kwargs: Any) -> list[str]:
        if kwargs.get("answer") is not None or not (score or "").strip():
            return []
        first = kwargs.get("first")
        if isinstance(first, dict):  # the re-ask round: an answer only when sections were asked again
            return ["answer"] if first.get("sections") else []
        try:
            if rules_for(brief).skip:
                return []
            c.from_abc(score or "")  # a score Plenio cannot edit note by note: no writer, execute falls back
        except PlenioError:
            return []  # execute reports the problem
        return ["answer"]

    @classmethod
    def execute(
        cls,
        score: str,
        brief: Any,
        seed: int = 0,
        answer: str | None = None,
        engine: Any = None,
        style: str | None = None,
        lyrics: str | None = None,
        first: Any = None,
    ) -> io.NodeOutput:
        rules = rules_for(brief, style or "")
        text = score or ""
        reask_round = isinstance(first, dict)
        if not text.strip():
            report = Report(
                "arrangement",
                Status.SKIPPED,
                "arrangement: no score (planning is off)",
                (),
                {"status": "skipped"},
            )
            markdown = "**Arrangement: skipped** - no score (planning is off)"
            return io.NodeOutput(
                "",
                report,
                "",
                "",
                {"result": None, "text": "", "sections": []},
                ui={"plenio_summary": [{"status": "skipped", "markdown": markdown}]},
            )
        fits = None if rules.skip else budget_check(engine, brief, text, style, lyrics)
        if reask_round:
            result = _reask_round(first, text, answer, rules, seed, fits)
            if result is None:  # nothing was asked again: the first round's result passes through
                previous = first["result"]
                return io.NodeOutput(
                    previous.abc if previous is not None else text,
                    first["report"],
                    "",
                    "",
                    first,
                    ui={
                        "plenio_summary": [
                            {"status": first["report"].status.value, "markdown": first["markdown"]}
                        ]
                    },
                )
        elif rules.skip:
            result = arrangement.skipped(text, rules)
        else:
            result = arrangement.arrange(text, answer or "", rules, seed=seed, fits=fits)
        status = {
            "skipped": Status.SKIPPED,
            "fallback": Status.WARNING,
        }.get(result.status, Status.OK)
        messages = (result.summary,) if result.status == "fallback" else ()
        data = {**result.to_dict(), "kind": rules.kind, "melody": rules.melody}
        report = Report("arrangement", status, f"arrangement: {result.summary}", messages, data)
        markdown = _markdown(result, rules)
        reask = None if reask_round or rules.skip else arrangement.reask.request(text, result, rules)
        if reask is not None:
            markdown += (
                f"\n- the harmony check repaired much in section(s) {', '.join(map(str, reask.sections))}: the "
                "writer is asked once more"
            )
        state = {
            "result": result,
            "text": text,
            "sections": list(reask.sections) if reask else [],
            "report": report,
            "markdown": markdown,
        }
        return io.NodeOutput(
            result.abc,
            report,
            reask.prompt if reask else "",
            json.dumps(reask.schema, ensure_ascii=False) if reask else "",
            state,
            ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]},
        )


def _reask_round(
    first: dict[str, Any],
    text: str,
    answer: str | None,
    rules: arrangement.Policy,
    seed: int,
    fits: Callable[[str], str | None] | None,
) -> arrangement.Arrangement | None:
    """The re-ask round: the first plan with the asked sections from the writer's second answer, arranged
    again; the better of the two arrangements (``None``: nothing was asked)."""
    previous = first.get("result")
    sections = first.get("sections") or []
    if previous is None or not sections:
        return None
    merged = arrangement.reask.merged_answer(previous, answer or "", sections)
    if merged is None:
        note = (
            "asked again about section(s) "
            + ", ".join(map(str, sections))
            + ": no usable answer; the first plan stands"
        )
        return replace(previous, notes=(*previous.notes, note))
    second = arrangement.arrange(text, merged, rules, seed=seed, fits=fits)
    asked = ", ".join(map(str, sections))
    if arrangement.reask.better(previous, second):
        before, after = arrangement.reask.repairs(previous), arrangement.reask.repairs(second)
        note = f"asked again about section(s) {asked}: the second plan needs fewer repairs ({before} -> {after}) and is used"
        return replace(second, notes=(*second.notes, note))
    note = f"asked again about section(s) {asked}: the second plan was not better; the first stands"
    return replace(previous, notes=(*previous.notes, note))
