"""Transcribe Score: SheetSage2 score of a recording plus the beat grid (``PLENIO_TIMELINE``)."""

from __future__ import annotations

from statistics import median
from typing import Any

from comfy_api.latest import io

from ...core import score as score_rules
from ...core.errors import PlenioModelError, PlenioUserError
from ...core.hashing import sha256_text
from ...core.reports import Report, Status
from ...core.score.timeline import Timeline, TimelineBar
from ...core.timefmt import clock as _clock
from .. import host
from ..types import ReportType, TimelineType

LONG_SOURCE_VRAM_BYTES = 24 * 2**30
"""Sources longer than one native SheetSage2 window (300 s) need a second window; on the owner's
16 GB card that ran out of memory (Phase 4A E3). Larger cards are allowed to try."""


class PlenioTranscribeScore(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioTranscribeScore",
            display_name="Transcribe Score",
            category="Plenio/Audio analysis",
            description=(
                "Transcribes a recording into the native two-voice ABC score with SheetSage2 (the same score "
                "as the native SheetSage2 node in full mode) and keeps the beat grid - the times of every bar "
                "and of the sung notes - which lyrics alignment needs."
            ),
            inputs=[
                io.AudioEncoder.Input("audio_encoder", tooltip="SheetSage2 from Audio Encoder Loader."),
                io.Audio.Input(
                    "audio", tooltip="The source recording (trim it first for a part of the song)."
                ),
            ],
            outputs=[
                io.String.Output(
                    display_name="score", tooltip="The transcribed score (native two-voice ABC, with chords)."
                ),
                TimelineType.Output(
                    display_name="timeline", tooltip="Bar times and sung notes in source seconds."
                ),
                ReportType.Output(display_name="report", tooltip="Bars, tempo, key, sections and voices."),
            ],
        )

    @classmethod
    def execute(cls, audio_encoder: Any, audio: Any) -> io.NodeOutput:
        if not host.is_sheetsage_encoder(audio_encoder):
            raise PlenioModelError(
                "Transcribe Score needs the SheetSage2 audio encoder.",
                hint="Load sheetsage2_bf16.safetensors with Audio Encoder Loader and connect it.",
            )
        _samples, _rate, seconds = host.audio_facts(audio)
        warnings: list[str] = []
        if host.audio_batch(audio) > 1:
            warnings.append(f"the audio has {host.audio_batch(audio)} items; only the first is transcribed")
        total = host.gpu_total_bytes()
        if seconds > host.SHEETSAGE_WINDOW_S and total is not None and total < LONG_SOURCE_VRAM_BYTES:
            raise PlenioUserError(
                f"The source is {_clock(seconds)} long. SheetSage2 transcribes up to 5:00 in one pass; longer audio "
                f"needs a second pass, which does not fit this GPU ({total / 2**30:.0f} GB).",
                hint="Trim the source with Trim Audio Duration (for example one cover per part of the song) and run again.",
            )
        try:
            result = host.sheetsage_transcribe(audio_encoder, audio)
        except Exception as error:
            if host.is_out_of_memory(error):
                raise PlenioUserError(
                    f"SheetSage2 ran out of GPU memory transcribing {_clock(seconds)} of audio.",
                    hint="Trim the source with Trim Audio Duration, or free the GPU (close other programs) and run again.",
                ) from error
            if host.is_interruption(error):
                raise
            raise PlenioModelError(
                f"SheetSage2 could not transcribe the source: {error}",
                hint="Is the source silent, very short or without a steady beat? Try a trimmed part with music, "
                "or enter the score manually in the Song Sheet.",
            ) from error
        abc = result["abc"]
        analysis = score_rules.analyze(abc)
        if not analysis.ok:
            raise PlenioModelError(
                "SheetSage2 returned a score that is not valid native ABC: "
                + "; ".join(d.message for d in analysis.errors),
                hint="Try a trimmed or re-exported source (WAV/FLAC).",
            )
        source = host.audio_sha256(audio)
        timeline = None
        if result.get("engine_path") == "events" and len(result["bar_starts"]) == len(analysis.bars):
            local = [
                60.0 * (int(bar.meter.split("/")[0]) * 4 / int(bar.meter.split("/")[1])) / (end - start)
                for bar, start, end in zip(
                    analysis.bars, result["bar_starts"], result["bar_ends"], strict=True
                )
                if end > start
            ]
            timeline = Timeline(
                source_sha256=source,
                score_sha256=sha256_text(abc),
                duration_s=float(result["duration_s"]),
                bars=tuple(
                    TimelineBar(float(start), float(end), bar.meter)
                    for bar, start, end in zip(
                        analysis.bars, result["bar_starts"], result["bar_ends"], strict=True
                    )
                ),
                first_beat_s=float(result["first_beat_s"]),
                pickup_padded=bool(result["pickup_padded"]),
                tempo_bpm=analysis.header.get("tempo_bpm"),
                median_bpm=float(median(local)) if local else None,
                sections=tuple((s.label, s.start_bar, s.bars) for s in analysis.sections),
                vocal_notes=tuple((float(a), float(b)) for a, b in result["vocal_notes"]),
            )
        elif result.get("engine_path") == "events":
            warnings.append(
                f"the beat grid has {len(result['bar_starts'])} bars but the score {len(analysis.bars)}; "
                "the timeline was dropped, lyrics alignment will use the section order"
            )
        else:
            warnings.append(
                "the SheetSage2 internals Plenio uses for the beat grid are not available in this ComfyUI version "
                f"({result.get('missing')}); lyrics alignment will use the section order"
            )
        vocal = analysis.voices["Vocal"]["notes"]
        if vocal == 0:
            warnings.append("no vocal melody found - is the source instrumental?")
        sections = ", ".join(
            f"{s.label} ({s.bars})"
            + (f" {_clock(timeline.bars[s.start_bar - 1].start_s)}" if timeline is not None else "")
            for s in analysis.sections
        )
        summary = (
            f"{len(analysis.bars)} bars, {analysis.header.get('meter')}, key {analysis.header.get('key')}, "
            f"{analysis.header.get('tempo_bpm')} BPM, {vocal} vocal and {analysis.voices['Ins']['notes']} "
            f"instrument notes, {'chords' if analysis.has_chords else 'no chords'}; sections: {sections}"
        )
        report = Report(
            "transcribe_score",
            Status.WARNING if warnings else Status.OK,
            summary,
            tuple(warnings),
            {
                "analysis": analysis.to_dict(),
                "timeline": timeline.to_dict() if timeline is not None else None,
                "source_sha256": source,
                "seconds": round(seconds, 2),
            },
        )
        markdown = "\n".join(
            [f"**Transcribed {_clock(seconds)}**", summary, *[f"- warning: {w}" for w in warnings]]
        )
        return io.NodeOutput(
            abc,
            timeline,
            report,
            ui={"plenio_summary": [{"status": report.status.value, "markdown": markdown}]},
        )
