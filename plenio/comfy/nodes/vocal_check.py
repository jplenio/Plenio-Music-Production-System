"""Check Vocals: is an instrumental take free of vocals? Picks the best of several takes."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.reports import Report, Status
from ...core.vocals import DEFAULT_TOLERANCE_S, LIMITS, VocalReading, ending, judge
from .. import host
from ..types import Brief, ReportType


def _single(value: Any) -> Any:
    return value[0] if isinstance(value, list) else value


def _reading(encoder: Any, audio: Any) -> tuple[VocalReading, float]:
    """SheetSage2 vocal notes of a take; takes longer than one native window are read in pieces."""
    samples, rate, seconds = host.audio_facts(audio)
    window = int(host.SHEETSAGE_WINDOW_S * rate)
    notes: list[tuple[float, float]] = []
    for start in range(0, samples.shape[-1], window):
        if samples.shape[-1] - start < rate * 5 and start > 0:
            break
        piece = {"waveform": audio["waveform"][0:1, :, start : start + window], "sample_rate": rate}
        events, _duration = host.sheetsage_events(encoder, piece)
        offset = start / rate
        for event in events:
            for note in event["values"].get("melody", ()):
                if note["track"] == 0 and note["end_time"] > event["time"]:
                    notes.append((event["time"] + offset, note["end_time"] + offset))
    return VocalReading.from_notes(notes, seconds), seconds


class PlenioVocalCheck(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioVocalCheck",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Check Vocals",
            category="Plenio/Audio analysis",
            description=(
                "Checks instrumental takes for vocals with a SheetSage2 re-transcription (notes in its vocal track) "
                "and passes on the best take: the first one without vocal notes, otherwise the least vocal one. "
                "Also reports takes that end while the music is still playing. A measurement, not a guarantee."
            ),
            inputs=[
                io.Audio.Input(
                    "audio", tooltip="One take, or the list of takes from a loop (End Loop, accumulate)."
                ),
                io.AudioEncoder.Input(
                    "audio_encoder", tooltip="SheetSage2 (the cover path's loader can be reused)."
                ),
                Brief.Input("brief", optional=True, tooltip="Sung songs are not checked."),
                io.Float.Input(
                    "tolerance_seconds",
                    default=DEFAULT_TOLERANCE_S,
                    min=0.0,
                    max=60.0,
                    step=0.5,
                    advanced=True,
                    tooltip="Seconds of vocal-like notes still accepted. 0 = any vocal note fails (calibrated "
                    "against the owner's listening, Phase 4A).",
                ),
            ],
            outputs=[
                io.Audio.Output(display_name="audio", tooltip="The best take."),
                io.Boolean.Output(
                    display_name="passed", tooltip="True when the best take has no vocal notes."
                ),
                ReportType.Output(
                    display_name="report", tooltip="Per-take measurements, the verdict and its limits."
                ),
                io.Audio.Output(
                    display_name="takes",
                    is_output_list=True,
                    tooltip="All takes, the best first (connect a Preview Audio to listen to every take).",
                ),
            ],
            is_input_list=True,
        )

    @classmethod
    def execute(
        cls,
        audio: list[Any],
        audio_encoder: list[Any],
        tolerance_seconds: list[float],
        brief: list[Any] | None = None,
    ) -> io.NodeOutput:
        takes = [take for take in audio]
        encoder = _single(audio_encoder)
        tolerance = float(_single(tolerance_seconds))
        the_brief = _single(brief) if brief else None
        if the_brief is not None and not the_brief.instrumental:
            report = Report(
                "vocal_check", Status.SKIPPED, "sung song: no vocal check", (), {"takes": len(takes)}
            )
            return io.NodeOutput(
                takes[0],
                True,
                report,
                takes,
                ui={"plenio_summary": [{"status": "skipped", "markdown": report.summary}]},
            )
        if not host.is_sheetsage_encoder(encoder):
            from ...core.errors import PlenioModelError

            raise PlenioModelError(
                "Check Vocals needs the SheetSage2 audio encoder.",
                hint="Load sheetsage2_bf16.safetensors with Audio Encoder Loader and connect it.",
            )
        readings, durations, endings = [], [], []
        progress = host.Progress(len(takes))
        for index, take in enumerate(takes):
            reading, seconds = _reading(encoder, take)
            samples, rate, _seconds = host.audio_facts(take)
            readings.append(reading)
            durations.append(seconds)
            endings.append(ending(samples, rate))
            progress.update((index + 1) / len(takes))
        result = judge(readings, durations, endings, tolerance_s=tolerance)
        status = Status.OK if result.passed else Status.WARNING
        report = Report(
            "vocal_check", status, result.summary(), tuple(result.notes) + LIMITS, result.to_dict()
        )
        lines = [f"**{result.summary()}**"]
        for verdict in result.verdicts:
            regions = ", ".join(f"{a:.0f}-{b:.0f} s" for a, b in verdict.reading.regions[:6])
            lines.append(
                f"- take {verdict.index + 1}: {'ok' if verdict.passed else 'vocal suspected'}, "
                f"{verdict.reading.notes} vocal notes ({verdict.reading.seconds:.1f} s)"
                + (f" at {regions}" if regions else "")
                + (", ends abruptly" if verdict.ending and verdict.ending.abrupt else "")
            )
        lines += [f"- {note}" for note in result.notes]
        ranked = [takes[result.best], *(take for index, take in enumerate(takes) if index != result.best)]
        return io.NodeOutput(
            takes[result.best],
            result.passed,
            report,
            ranked,
            ui={"plenio_summary": [{"status": status.value, "markdown": "\n".join(lines)}]},
        )
