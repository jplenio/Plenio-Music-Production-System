"""Separate Stems and Stem Mixer: an optional stem stage before mastering (plan §6; experimental).

``PLENIO_STEMS`` carries one ``core.audio.stems.Stems`` per batch item. The residual (input minus
the stems) is always part of the mix as the strip ``rest``, so a neutral mix returns the input.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np
from comfy_api.latest import io

from ...core.audio import stems as stem_core
from ...core.audio.effects import effects_for
from ...core.audio.stems import MIX_SCHEMA, REST, make_stems, parse_mix
from ...core.release import plan_release, safe_filename, write_audio
from ...core.reports import Report, Status
from .. import audio_models, host
from ..types import AudioModelType, ReportType, StemsType

PEAK_POINTS = 240
"""How many peak values per strip the widget draws (about 1.4 kB per strip in the UI payload)."""

EXPORT_FOLDER = "plenio/stems"
"""Where the strips marked *save* are written (under the ComfyUI output folder)."""


def peak_profile(stem: Any, points: int = PEAK_POINTS) -> list[float]:
    """Absolute peaks of ``[channels, frames]`` in ``points`` buckets, for the mixer's waveform."""
    data = np.asarray(stem, dtype=np.float64)
    frames = data.shape[1]
    if frames == 0 or points <= 0:
        return [0.0] * max(points, 0)
    edges = np.linspace(0, frames, points + 1).astype(int)
    return [
        round(float(np.abs(data[:, edges[i] : max(edges[i] + 1, edges[i + 1])]).max()), 4)
        for i in range(points)
    ]


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
                "Master sets the loudness. The widget shows one strip per stem before the first run too, and a "
                "strip marked *save* is written as its own file to output/plenio/stems. Experimental."
            ),
            inputs=[
                StemsType.Input("stems", tooltip="From Separate Stems."),
                io.String.Input(
                    "mix",
                    default="",
                    multiline=True,
                    tooltip=(
                        f"The mixer settings ({MIX_SCHEMA} JSON); empty: neutral.  The widget under the node "
                        "writes the same value (a 'save' flag per strip included)."
                    ),
                ),
            ],
            outputs=[
                io.Audio.Output(display_name="audio", tooltip="The mixdown at the input's rate and length."),
                ReportType.Output(
                    display_name="report",
                    tooltip=(
                        "Per strip: audible, gain, gain reduction, muted time; and the files written for "
                        "strips marked 'save'."
                    ),
                ),
            ],
        )

    @classmethod
    def execute(cls, stems: Any, mix: str) -> io.NodeOutput:
        settings = parse_mix(mix)
        bus_effects = effects_for(settings.buses)
        results, reports, written = [], [], []
        for item in stems:
            # the mixdown hands back the processed signals of the audible strips marked *save*, so a
            # saved file does not run the strip's compressor a second time
            processed: dict[str, Any] = {}
            out, report = stem_core.mix(
                item, settings, effects=bus_effects, cancel=host.raise_if_interrupted, signals=processed
            )
            results.append(out)
            reports.append(report)
            written.extend(cls._write_stems(item, settings, processed, report))
        notes = sorted({note for report in reports for note in report["notes"]})
        saved = [
            f"saved {strip['name']} as its own file: {Path(strip['file']).name}"
            for strip in reports[0]["strips"]
            if "file" in strip
        ]
        audible = [s["name"] for s in reports[0]["strips"] if s["audible"]]
        summary = (
            "Stem Mixer: neutral (the input unchanged)"
            if all(r["neutral"] for r in reports)
            else f"Stem Mixer: {', '.join(audible) or 'nothing'} audible"
        )
        status = Status.WARNING if notes else Status.OK
        record = Report(
            "stem_mix",
            status,
            summary,
            tuple(notes),
            {"items": reports, "files": written},
        )
        markdown = "\n".join([f"**{summary}**", *[f"- note: {n}" for n in notes], *[f"- {s}" for s in saved]])
        first = stems[0]
        strips = first.strips()
        payload = {
            "stems": [name for name, _stem in strips],
            "seconds": round(first.frames / first.rate, 2),
            "peaks": {name: peak_profile(stem) for name, stem in strips},
            "saved": _saved_names(first, settings),
        }
        return io.NodeOutput(
            host.make_audio(results, stems[0].rate),
            record,
            ui={
                "plenio_summary": [{"status": status.value, "markdown": markdown}],
                "plenio_stems": [payload],
            },
        )

    @classmethod
    def _write_stems(
        cls, item: Any, settings: Any, processed: dict[str, Any], report: dict[str, Any]
    ) -> list[str]:
        """Write every strip marked *save* as a 24-bit FLAC into ``output/plenio/stems``.

        The file holds the strip's own signal (its gain, compression and muted ranges applied; the
        mute/solo decision and the shared effect buses are the mixdown's, not one stem's). One file
        per name: a second run that writes the same stem gets ``name (2).flac`` and so on. The
        item's own ``report`` names its files (``strips[].file``).
        """
        wanted = _saved_names(item, settings)
        if not wanted:
            return []
        folder = host.output_directory() / EXPORT_FOLDER
        stems = dict(item.strips())
        entries = {strip["name"]: strip for strip in report["strips"]}
        written: list[str] = []
        for name in wanted:
            signal = processed.get(name)
            if signal is None:  # a muted or unsoloed strip is not in the mixdown: process it here
                signal = stem_core.strip_signal(stems[name], item.rate, settings.strip(name))
            base = plan_release(folder, safe_filename(name), [".flac"])
            target = base.with_name(base.name + ".flac")
            write_audio(target, signal, item.rate, "flac", {"title": f"{name} (Plenio stems)"})
            written.append(str(target))
            entries[name]["file"] = str(target)
        return written


def _saved_names(stems: Any, settings: Any) -> list[str]:
    """The strips marked *save* (the documented order: the separator's stems, then ``rest``)."""
    return [name for name, _stem in stems.strips() if settings.strip(name).save]
