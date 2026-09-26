"""EQ: parametric EQ with manual bands, preset tone matching or a custom match (legacy Auto-EQ merged in)."""

from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import io

from ...core.audio import eq
from ...core.errors import PlenioUserError
from ...core.reports import Report, Status
from .. import host
from ..shared import preset_library
from ..types import ReportType

MODES = ("flat", "manual", "match preset", "custom match")
TARGETS = ("warm", "bright", "reference")
FLAT_JSON = json.dumps(eq.FLAT)


def _match_inputs() -> list[Any]:
    return [
        io.Combo.Input(
            "target",
            options=list(TARGETS),
            default="warm",
            tooltip="warm / bright: a gentle tilt around 1 kHz; reference: the tone of the reference input.",
        ),
        io.Float.Input(
            "strength",
            default=0.35,
            min=0.0,
            max=1.0,
            step=0.05,
            tooltip="How far to move towards the target.",
        ),
        io.Float.Input(
            "max_gain_db",
            default=2.0,
            min=0.1,
            max=6.0,
            step=0.1,
            tooltip="Largest boost or cut of the curve.",
        ),
        io.Int.Input("max_bands", default=4, min=1, max=6, tooltip="Most peak bands the match may use."),
        io.Float.Input("min_hz", default=40.0, min=20.0, max=1000.0, step=1.0, advanced=True),
        io.Float.Input("max_hz", default=16000.0, min=1000.0, max=20000.0, step=100.0, advanced=True),
    ]


class PlenioEQ(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        library = preset_library()
        return io.Schema(
            node_id="PlenioEQ",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="EQ",
            category="Plenio/Mastering",
            description=(
                "Parametric EQ (up to 8 bands: peak, shelves, high/low-pass, notch). manual: edit the bands on the "
                "curve; match preset / custom match: Plenio proposes gentle peak bands that move the tone towards "
                "a warm or bright tilt or towards a reference recording. No hidden normalisation."
            ),
            inputs=[
                io.Audio.Input("audio", tooltip="The audio to equalise (every item of a batch)."),
                io.Audio.Input(
                    "reference", optional=True, tooltip="Reference recording for the 'reference' target."
                ),
                io.DynamicCombo.Input(
                    "mode",
                    options=[
                        io.DynamicCombo.Option("flat", []),
                        io.DynamicCombo.Option(
                            "manual",
                            [
                                io.String.Input(
                                    "bands",
                                    default=FLAT_JSON,
                                    multiline=True,
                                    tooltip="EQ bands (plenio.eq/1); edit them on the curve.",
                                )
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "match preset",
                            [
                                io.Combo.Input(
                                    "preset",
                                    options=library.match_names(),
                                    default=library.match_names()[0],
                                    tooltip="Tone match recipes (reference recipes need the reference input).",
                                )
                            ],
                        ),
                        io.DynamicCombo.Option("custom match", _match_inputs()),
                    ],
                    tooltip="flat: no change; manual: your bands; match: a proposal fitted to the audio.",
                ),
            ],
            outputs=[
                io.Audio.Output(display_name="audio", tooltip="The equalised audio (same rate and length)."),
                ReportType.Output(
                    display_name="report", tooltip="Mode, the applied bands and the match result."
                ),
            ],
        )

    @classmethod
    def execute(
        cls, audio: dict[str, Any], mode: dict[str, Any], reference: dict[str, Any] | None = None
    ) -> io.NodeOutput:
        name = mode.get("mode", "flat")
        if name not in MODES:
            raise PlenioUserError(f"Unknown EQ mode {name!r}; use one of {list(MODES)}.")
        items, rate = host.audio_items(audio)
        if name == "flat":
            report = Report("eq", Status.SKIPPED, "EQ flat: audio unchanged", (), {"mode": "flat"})
            return io.NodeOutput(audio, report, ui=_ui(report, eq.FLAT, rate))
        if name == "manual":
            settings = eq.parse_settings(mode.get("bands", FLAT_JSON), rate)
            proposals: list[dict[str, Any]] = [settings] * len(items)
            details: list[dict[str, Any]] = []
        else:
            params = _match_params(mode, name)
            ref_items, ref_rate = host.audio_items(reference) if reference is not None else ([], rate)
            if params["target"] == "reference" and not ref_items:
                raise PlenioUserError(
                    "The 'reference' target needs a reference recording.",
                    hint="Connect the reference input, or choose a warm or bright target.",
                )
            proposals, details = [], []
            for index, item in enumerate(items):
                grid = eq.display_grid(min(rate, ref_rate))
                source = eq.spectral_profile(item, rate, grid, cancel=host.raise_if_interrupted)
                if params["target"] == "reference":
                    ref = ref_items[0 if len(ref_items) == 1 else min(index, len(ref_items) - 1)]
                    target = eq.spectral_profile(ref, ref_rate, grid, cancel=host.raise_if_interrupted)
                else:
                    target = eq.tilt_target(source, params["target"])
                proposal, fit_report = eq.fit(
                    source,
                    target,
                    rate,
                    strength=params["strength"],
                    max_gain_db=params["max_gain_db"],
                    max_bands=params["max_bands"],
                    min_hz=params["min_hz"],
                    max_hz=params["max_hz"],
                    cancel=host.raise_if_interrupted,
                )
                proposals.append(proposal)
                details.append(fit_report)
        out = [
            eq.apply(item, rate, settings, cancel=host.raise_if_interrupted)
            for item, settings in zip(items, proposals, strict=True)
        ]
        summary = f"EQ {name}: " + ", ".join(f"{len(p['bands'])} band(s)" for p in proposals)
        report = Report(
            "eq",
            Status.OK,
            summary,
            tuple(d["reason"] for d in details if d.get("reason")),
            {"mode": name, "sample_rate": rate, "settings": proposals, "match": details},
        )
        return io.NodeOutput(host.make_audio(out, rate), report, ui=_ui(report, proposals[0], rate))


def _match_params(mode: dict[str, Any], name: str) -> dict[str, Any]:
    if name == "match preset":
        chosen = preset_library().match(str(mode.get("preset", "")))
        return {k: chosen[k] for k in ("target", "strength", "max_gain_db", "max_bands", "min_hz", "max_hz")}
    return {
        "target": str(mode.get("target", "warm")),
        "strength": float(mode.get("strength", 0.35)),
        "max_gain_db": float(mode.get("max_gain_db", 2.0)),
        "max_bands": int(mode.get("max_bands", 4)),
        "min_hz": float(mode.get("min_hz", 40.0)),
        "max_hz": float(mode.get("max_hz", 16000.0)),
    }


def _ui(report: Report, settings: dict[str, Any], rate: int) -> dict[str, Any]:
    grid = eq.display_grid(rate)
    curve = eq.response_db(settings, rate, grid)
    return {
        "plenio_summary": [{"status": report.status.value, "markdown": f"**{report.summary}**"}],
        "plenio_eq": [
            {
                "settings": settings,
                "sample_rate": rate,
                "frequency_hz": [round(float(f), 2) for f in grid],
                "response_db": [round(float(v), 3) for v in curve],
            }
        ],
    }
