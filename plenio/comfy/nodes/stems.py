"""Separate Stems and Stem Mixer: an optional stem stage before mastering (plan §6; experimental).

``PLENIO_STEMS`` carries one ``core.audio.stems.Stems`` per batch item. The residual (input minus
the stems) is always part of the mix as the strip ``rest``, so a neutral mix returns the input.
"""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.audio import stems as stem_core
from ...core.audio.stems import MIX_SCHEMA, REST, make_stems, parse_mix
from ...core.reports import Report, Status
from .. import audio_models, host
from ..types import AudioModelType, ReportType, StemsType


class PlenioSeparateStems(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioSeparateStems",
            display_name="Separate Stems",
            category="Plenio/Audio",
            is_experimental=True,
            description=(
                "Splits a song into at most four stems with a separation model and keeps the residual "
                "(what the stems miss), so that a neutral Stem Mixer returns the input unchanged. Experimental."
            ),
            inputs=[
                io.Audio.Input("audio", tooltip="The song before mastering."),
                AudioModelType.Input("model", tooltip="Load Audio Model (separation)."),
            ],
            outputs=[
                StemsType.Output(display_name="stems", tooltip="The stems and the residual, for Stem Mixer."),
                ReportType.Output(
                    display_name="report", tooltip="Stem names and how much the residual holds."
                ),
            ],
        )

    @classmethod
    def execute(cls, audio: dict[str, Any], model: Any) -> io.NodeOutput:
        separator = audio_models.require(model, "separation", "Separate Stems")
        items, rate = host.audio_items(audio)
        batch = []
        shares = []
        for item in items:
            host.raise_if_interrupted()
            stems = make_stems(item, rate, separator.separate(item, rate), source=separator.name)
            batch.append(stems)
            energy = float((item**2).sum())
            shares.append(
                round(float((stems.residual.astype(float) ** 2).sum()) / energy, 4) if energy else 0.0
            )
        names = ", ".join(batch[0].names)
        summary = f"Stems: {names} + {REST} ({separator.name})"
        record = Report(
            "stems", Status.OK, summary, (), {"stems": list(batch[0].names), "residual_energy": shares}
        )
        return io.NodeOutput(
            tuple(batch), record, ui={"plenio_summary": [{"status": "ok", "markdown": f"**{summary}**"}]}
        )


class PlenioStemMixer(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioStemMixer",
            display_name="Stem Mixer",
            category="Plenio/Audio",
            is_experimental=True,
            has_intermediate_output=True,
            description=(
                "Mixes the stems back into one song: gain, mute/solo, compression and muted time ranges per stem "
                "(and the residual 'rest'). Empty settings mix neutrally and return the input. No normalisation; "
                "Master sets the loudness. Experimental."
            ),
            inputs=[
                StemsType.Input("stems", tooltip="From Separate Stems."),
                io.String.Input(
                    "mix",
                    default="",
                    multiline=True,
                    tooltip=f"The mixer settings ({MIX_SCHEMA} JSON); empty: neutral.",
                ),
            ],
            outputs=[
                io.Audio.Output(display_name="audio", tooltip="The mixdown at the input's rate and length."),
                ReportType.Output(
                    display_name="report", tooltip="Per strip: audible, gain, gain reduction, muted time."
                ),
            ],
        )

    @classmethod
    def execute(cls, stems: Any, mix: str) -> io.NodeOutput:
        settings = parse_mix(mix)
        results, reports = [], []
        for item in stems:
            out, report = stem_core.mix(item, settings, cancel=host.raise_if_interrupted)
            results.append(out)
            reports.append(report)
        notes = sorted({note for report in reports for note in report["notes"]})
        audible = [s["name"] for s in reports[0]["strips"] if s["audible"]]
        summary = (
            "Stem Mixer: neutral (the input unchanged)"
            if all(r["neutral"] for r in reports)
            else f"Stem Mixer: {', '.join(audible) or 'nothing'} audible"
        )
        status = Status.WARNING if notes else Status.OK
        record = Report("stem_mix", status, summary, tuple(notes), {"items": reports})
        markdown = "\n".join([f"**{summary}**", *[f"- note: {n}" for n in notes]])
        return io.NodeOutput(
            host.make_audio(results, stems[0].rate),
            record,
            ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]},
        )
