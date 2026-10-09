"""Separate Stems and Stem Mixer: an optional stem stage before mastering (plan §6; experimental).

``PLENIO_STEMS`` carries one ``core.audio.stems.Stems`` per batch item. The residual (input minus
the stems) is always part of the mix as the strip ``rest``, so a neutral mix returns the input.
"""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

import numpy as np
from comfy_api.latest import io

from ...core.audio import stems as stem_core
from ...core.audio.effects import effects_for
from ...core.audio.stems import MIX_SCHEMA, REST, SavedStems, make_stems, parse_mix
from ...core.release import STEMS_SUFFIX, feeds, plan_release, safe_filename, write_audio
from ...core.reports import Report, Status
from .. import audio_models, host
from ..types import AudioModelType, ReportType, StemsType

PEAK_POINTS = 240
"""How many peak values per strip the widget draws (about 1.4 kB per strip in the UI payload)."""

EXPORT_FOLDER = "plenio/stems"
"""Where the strips marked *save* are written when no Export Release takes the mixer's report (under the
ComfyUI output folder); with one they go next to the song, into ``<name>-stems`` (owner's request 2026-10-09)."""
EXPORT_NODE = "PlenioExportRelease"
REPORT_OUTPUT = 1
"""The Stem Mixer's report output: the stems marked *save* ride on it to Export Release."""


def write_saved_stems(
    folder: Path, saved: SavedStems, tags: Callable[[str], dict[str, str]], *, number: bool
) -> list[tuple[str, Path, dict[str, Any]]]:
    """Every strip of ``saved`` as a 24-bit FLAC in ``folder``: ``<strip>.flac`` (``<strip> take N.flac`` for a
    batch), tagged by ``tags(strip)``. ``number``: a file that exists gets `` (2)`` ... (else it is replaced).
    Returns ``(strip, path, audio facts)`` per file."""
    written: list[tuple[str, Path, dict[str, Any]]] = []
    batch = len(saved.takes) > 1
    for index, take in enumerate(saved.takes):
        for name, signal in take:
            label = safe_filename(name) + (f" take {index + 1}" if batch else "")
            base = plan_release(folder, label, [".flac"], collision="number" if number else "overwrite")
            target = base.with_name(base.name + ".flac")
            written.append((name, target, write_audio(target, signal, saved.rate, "flac", tags(name))))
    return written


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
                io.Audio.Input(
                    "audio",
                    tooltip="The song to split, before mastering (the residual keeps what the stems miss).",
                ),
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
                "strip marked *save* becomes its own file: Export Release writes it next to the song, into the "
                "folder '<name>-stems' (without an Export Release that takes this report: output/plenio/stems). "
                "Experimental."
            ),
            inputs=[
                StemsType.Input("stems", tooltip="The stems and the residual 'rest' from Separate Stems."),
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
                        "Per strip: audible, gain, gain reduction, muted time. Into Export Release: it also "
                        "carries the strips marked 'save', which the export writes next to the song "
                        "('<name>-stems')."
                    ),
                ),
            ],
            hidden=[io.Hidden.prompt, io.Hidden.unique_id],
        )

    @classmethod
    def execute(cls, stems: Any, mix: str) -> io.NodeOutput:
        settings = parse_mix(mix)
        bus_effects = effects_for(settings.buses)
        results, reports, takes = [], [], []
        for item in stems:
            # the mixdown hands back the processed signals of the audible strips marked *save*, so a
            # saved file does not run the strip's compressor a second time
            processed: dict[str, Any] = {}
            out, report = stem_core.mix(
                item, settings, effects=bus_effects, cancel=host.raise_if_interrupted, signals=processed
            )
            results.append(out)
            reports.append(report)
            takes.append(_saved_signals(item, settings, processed))
        to_save = SavedStems(stems[0].rate, tuple(takes)) if any(takes) else None
        # with an Export Release that takes this report, the stems go next to the song; else they are
        # written here, as before
        with_song = feeds(cls.hidden.prompt, cls.hidden.unique_id, REPORT_OUTPUT, EXPORT_NODE)
        written: list[str] = []
        saved: list[str] = []
        if to_save is not None and with_song:
            saved.append(
                f"saved with the song: {', '.join(to_save.names)} - Export Release writes them into "
                f"'<name>{STEMS_SUFFIX}' next to it"
            )
        elif to_save is not None:
            folder = host.output_directory() / EXPORT_FOLDER
            files = write_saved_stems(
                folder, to_save, lambda name: {"title": f"{name} (Plenio stems)"}, number=True
            )
            batch = len(to_save.takes) > 1
            for (name, path, _facts), index in zip(files, _take_indices(to_save), strict=True):
                written.append(str(path))
                if index == 0 or not batch:
                    saved.append(f"saved {name} as its own file: {path.name}")
                for strip in reports[index]["strips"]:
                    if strip["name"] == name:
                        strip["file"] = str(path)
        notes = sorted({note for report in reports for note in report["notes"]})
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
            {"items": reports, "files": written, "save": list(to_save.names) if to_save else []},
            # always: a run that takes this result from ComfyUI's cache into an export (connected later)
            # still hands the stems over
            attachment=to_save,
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


def _saved_signals(item: Any, settings: Any, processed: dict[str, Any]) -> tuple[tuple[str, Any], ...]:
    """The signals of one take's strips marked *save*: the strip's own signal (its gain, compression and
    muted ranges applied; the mute/solo decision and the shared effect buses are the mixdown's, not one
    stem's) - from the mixdown where it was audible, else processed here."""
    strips = dict(item.strips())
    signals = []
    for name in _saved_names(item, settings):
        signal = processed.get(name)
        if signal is None:  # a muted or unsoloed strip is not in the mixdown: process it here
            signal = stem_core.strip_signal(strips[name], item.rate, settings.strip(name))
        signals.append((name, signal))
    return tuple(signals)


def _take_indices(saved: SavedStems) -> list[int]:
    """The take of every file ``write_saved_stems`` writes, in its order."""
    return [index for index, take in enumerate(saved.takes) for _ in take]


def _saved_names(stems: Any, settings: Any) -> list[str]:
    """The strips marked *save* (the documented order: the separator's stems, then ``rest``)."""
    return [name for name, _stem in stems.strips() if settings.strip(name).save]
