"""Loudness & Dynamics: optional compression, true-peak limiting to a BS.1770 loudness target, output rate."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.audio.dynamics import Compressor, Target, master
from ...core.errors import PlenioUserError
from ...core.reports import Report, Status
from .. import host
from ..shared import preset_library
from ..types import ReportType

SAMPLE_RATES = ("keep", "44100", "48000")
CUSTOM = "custom"
OFF = "off"


class PlenioLoudness(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        library = preset_library()
        targets = library.target_names()
        styles = library.style_names()
        return io.Schema(
            node_id="PlenioLoudness",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Loudness & Dynamics",
            category="Plenio/Mastering",
            description=(
                "Brings the audio to a loudness target (BS.1770 integrated loudness) below a true-peak ceiling: "
                "optional compression, then a 4x-oversampled lookahead limiter; the result is measured again. "
                "Converts the sample rate first, so the ceiling holds at the final rate."
            ),
            inputs=[
                io.Audio.Input("audio", tooltip="The audio to master (every item of a batch)."),
                io.DynamicCombo.Input(
                    "target",
                    options=[
                        *[io.DynamicCombo.Option(name, []) for name in targets],
                        io.DynamicCombo.Option(
                            CUSTOM,
                            [
                                io.Float.Input(
                                    "lufs",
                                    default=-14.0,
                                    min=-30.0,
                                    max=-5.0,
                                    step=0.5,
                                    tooltip="Integrated loudness (LUFS).",
                                ),
                                io.Float.Input(
                                    "ceiling_dbtp",
                                    default=-1.0,
                                    min=-12.0,
                                    max=-0.1,
                                    step=0.1,
                                    tooltip="True-peak ceiling (dBTP).",
                                ),
                            ],
                        ),
                    ],
                    tooltip="Loudness target and true-peak ceiling.",
                ),
                io.DynamicCombo.Input(
                    "compression",
                    options=[
                        io.DynamicCombo.Option(OFF, []),
                        *[io.DynamicCombo.Option(name, []) for name in styles],
                        io.DynamicCombo.Option(
                            CUSTOM,
                            [
                                io.Float.Input(
                                    "threshold_db",
                                    default=-18.0,
                                    min=-60.0,
                                    max=0.0,
                                    step=0.5,
                                    tooltip="Level above which the compressor works (dB).",
                                ),
                                io.Float.Input(
                                    "ratio",
                                    default=1.5,
                                    min=1.0,
                                    max=10.0,
                                    step=0.1,
                                    tooltip="Compression ratio above the threshold.",
                                ),
                                io.Float.Input(
                                    "knee_db", default=6.0, min=0.0, max=24.0, step=0.5, advanced=True
                                ),
                                io.Float.Input(
                                    "attack_ms",
                                    default=20.0,
                                    min=1.0,
                                    max=200.0,
                                    step=1.0,
                                    tooltip="How fast the compressor reacts (ms).",
                                ),
                                io.Float.Input(
                                    "release_ms",
                                    default=150.0,
                                    min=10.0,
                                    max=2000.0,
                                    step=5.0,
                                    tooltip="How fast it lets go (ms).",
                                ),
                                io.Float.Input(
                                    "sidechain_hz", default=80.0, min=0.0, max=500.0, step=5.0, advanced=True
                                ),
                                io.Combo.Input(
                                    "detector", options=["RMS", "Peak"], default="RMS", advanced=True
                                ),
                            ],
                        ),
                    ],
                    tooltip="off: limiter only; a style: gentle genre presets; custom: your settings.",
                ),
                io.Combo.Input(
                    "sample_rate",
                    options=list(SAMPLE_RATES),
                    default="keep",
                    tooltip="Output sample rate (converted before limiting).",
                ),
            ],
            outputs=[
                io.Audio.Output(
                    display_name="audio", tooltip="The mastered audio at the chosen sample rate."
                ),
                ReportType.Output(
                    display_name="report",
                    tooltip="Measured loudness and true peak before and after, and each pass.",
                ),
            ],
        )

    @classmethod
    def execute(
        cls, audio: dict[str, Any], target: dict[str, Any], compression: dict[str, Any], sample_rate: str
    ) -> io.NodeOutput:
        library = preset_library()
        if sample_rate not in SAMPLE_RATES:
            raise PlenioUserError(f"Unknown sample rate {sample_rate!r}; use one of {list(SAMPLE_RATES)}.")
        style = str(compression.get("compression", OFF))
        compressor: Compressor | None
        if style == OFF:
            compressor, limiter_style = None, None
        elif style == CUSTOM:
            compressor = Compressor(
                float(compression.get("threshold_db", -18.0)),
                float(compression.get("ratio", 1.5)),
                float(compression.get("knee_db", 6.0)),
                float(compression.get("attack_ms", 20.0)),
                float(compression.get("release_ms", 150.0)),
                float(compression.get("sidechain_hz", 80.0)),
                str(compression.get("detector", "RMS")),
            )
            limiter_style = None
        else:
            compressor, limiter_style = library.compressor(style), style
        target_name = str(target.get("target", library.target_names()[0]))
        if target_name == CUSTOM:
            goal = Target(float(target.get("lufs", -14.0)), float(target.get("ceiling_dbtp", -1.0)))
        else:
            goal = library.target(target_name, limiter_style)
        items, rate = host.audio_items(audio)
        out_rate = rate if sample_rate == "keep" else int(sample_rate)
        results, reports = [], []
        for item in items:
            processed, final_rate, report = master(
                item, rate, goal, compressor, output_rate=out_rate, cancel=host.raise_if_interrupted
            )
            results.append(processed)
            reports.append(report)
        length = min(r.shape[1] for r in results)
        results = [r[:, :length] for r in results]
        lines = []
        warnings = []
        for index, report in enumerate(reports):
            output = report["output"]
            where = f"take {index + 1}: " if len(reports) > 1 else ""
            if output["integrated_lufs"] is None:
                lines.append(f"{where}silent or too short to measure")
                warnings.append(
                    f"{where}the audio is silent or too short; nothing was changed but the limiter"
                )
                continue
            lines.append(
                f"{where}{output['integrated_lufs']:.1f} LUFS, {output['true_peak_dbtp']:.1f} dBTP ({report['reason'].replace('_', ' ')})"
            )
            if not report["target_reached"]:
                warnings.append(
                    f"{where}the target {goal.integrated_lufs:g} LUFS was not reached ({report['reason'].replace('_', ' ')}); "
                    "the limiter's gain-reduction or make-up budget stopped it"
                )
        status = Status.WARNING if warnings else Status.OK
        summary = f"Loudness: {'; '.join(lines)} at {out_rate} Hz"
        record = Report(
            "loudness",
            status,
            summary,
            tuple(warnings),
            {"target": target_name, "compression": style, "sample_rate": out_rate, "items": reports},
        )
        markdown = "\n".join([f"**{summary}**", *[f"- warning: {w}" for w in warnings]])
        return io.NodeOutput(
            host.make_audio(results, out_rate),
            record,
            ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]},
        )
