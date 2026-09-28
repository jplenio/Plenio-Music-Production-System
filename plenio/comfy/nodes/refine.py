"""Refine (48 kHz): super-resolution with a crossover to the original, or plain resampling (experimental)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.audio.refine import OUTPUT_RATE, RefineSettings, refine
from ...core.errors import PlenioUserError
from ...core.reports import Report, Status
from .. import audio_models, host
from ..types import AudioModelType, ReportType

ENGINES = ("resample only", "model")
PRE_STAGES: tuple[str, ...] = ("auto", "off", "6000", "8000", "10000", "12000", "14000")
POST_STAGES: tuple[str, ...] = ("off", "16000", "19000", "21000")
"""The prepared stages of the model engine (owner's list, 2026-09-28); every value is selectable."""


def pre_value(stage: str) -> float:
    """``auto`` -> the model's own training condition, ``off`` -> no PRE, else the frequency in Hz."""
    if stage == "auto":
        return 0.0
    if stage == "off":
        return -1.0
    return float(stage)


def post_value(stage: str) -> float:
    return 0.0 if stage == "off" else float(stage)


class PlenioRefine(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioRefine",
            display_name="Refine (48 kHz)",
            category="Plenio/Audio",
            is_experimental=True,
            has_intermediate_output=True,
            description=(
                "Brings audio to 48 kHz. 'model' extends the top octaves with a super-resolution model "
                "and keeps everything below the crossover from the original (complementary crossover); "
                "'resample only' converts the rate without new content. The model always runs when it is "
                "connected, also for an input that already reaches 20 kHz - nothing below the crossover "
                "changes. Same duration, no normalisation. Experimental."
            ),
            inputs=[
                io.Audio.Input("audio", tooltip="The rendered song (any sample rate)."),
                io.Combo.Input(
                    "engine",
                    options=list(ENGINES),
                    default="resample only",
                    tooltip="model: the connected Load Audio Model (super-resolution); resample only: no model.",
                ),
                AudioModelType.Input(
                    "model",
                    optional=True,
                    lazy=True,
                    tooltip="Load Audio Model (super-resolution); only for 'model'.",
                ),
                io.Float.Input(
                    "crossover_hz",
                    default=0.0,
                    min=0.0,
                    max=23000.0,
                    step=100.0,
                    advanced=True,
                    tooltip="Where the model takes over; 0: 500 Hz below the measured bandwidth.",
                ),
                io.Float.Input(
                    "sr_gain",
                    default=1.0,
                    min=0.0,
                    max=2.0,
                    step=0.05,
                    advanced=True,
                    tooltip="Level of the added band.",
                ),
                io.Combo.Input(
                    "pre_hz",
                    options=list(PRE_STAGES),
                    default="auto",
                    advanced=True,
                    tooltip=(
                        "Low-pass before the model (shapes only what the model sees): auto = the model's "
                        "training condition, off = no low-pass, else 6/8/10/12/14 kHz."
                    ),
                ),
                io.Combo.Input(
                    "post_hz",
                    options=list(POST_STAGES),
                    default="off",
                    advanced=True,
                    tooltip=(
                        "Linear-phase roll-off of the result: off, or 16/19/21 kHz (tames added air that "
                        "sounds harsh)."
                    ),
                ),
                io.Int.Input(
                    "seed", default=0, min=0, max=2**32 - 1, tooltip="Seed of the model (deterministic)."
                ),
            ],
            outputs=[
                io.Audio.Output(display_name="audio", tooltip="48 kHz, same duration."),
                ReportType.Output(
                    display_name="report", tooltip="Engine, parameters, bandwidth before/after."
                ),
            ],
        )

    @classmethod
    def check_lazy_status(cls, engine: str, **kwargs: Any) -> list[str]:
        # an unconnected optional input is absent; a connected lazy one arrives as None until evaluated
        return ["model"] if engine == "model" and "model" in kwargs and kwargs["model"] is None else []

    @classmethod
    def execute(
        cls,
        audio: dict[str, Any],
        engine: str,
        crossover_hz: float,
        sr_gain: float,
        pre_hz: str,
        post_hz: str,
        seed: int,
        model: Any = None,
    ) -> io.NodeOutput:
        if engine not in ENGINES:
            raise PlenioUserError(f"Unknown engine {engine!r}; use one of {list(ENGINES)}.")
        if pre_hz not in PRE_STAGES:
            raise PlenioUserError(f"Unknown pre stage {pre_hz!r}; use one of {list(PRE_STAGES)}.")
        if post_hz not in POST_STAGES:
            raise PlenioUserError(f"Unknown post stage {post_hz!r}; use one of {list(POST_STAGES)}.")
        sr_engine = None
        if engine == "model":
            if model is None:
                raise PlenioUserError(
                    "Refine is set to 'model' but no Load Audio Model is connected.",
                    hint="Connect Load Audio Model (super-resolution), or choose the engine 'resample only'.",
                )
            sr_engine = audio_models.require(model, "super-resolution", "Refine")
        settings = RefineSettings(pre_value(pre_hz), crossover_hz, sr_gain, post_value(post_hz), seed)
        items, rate = host.audio_items(audio)
        results, reports = [], []
        for item in items:
            refined, report = refine(item, rate, sr_engine, settings, cancel=host.raise_if_interrupted)
            results.append(refined)
            reports.append(report)
        notes = [note for report in reports for note in report["notes"]]
        first = reports[0]
        edge_in, edge_out = first["bandwidth_in_hz"], first["bandwidth_out_hz"]
        summary = (
            f"Refine: {first['engine']}, {rate} -> {OUTPUT_RATE} Hz; bandwidth "
            f"{'-' if edge_in is None else f'{edge_in / 1000:.1f} kHz'} -> "
            f"{'-' if edge_out is None else f'{edge_out / 1000:.1f} kHz'}"
            + (" (provisional defaults)" if first["provisional_defaults"] and sr_engine is not None else "")
        )
        status = Status.WARNING if notes else Status.OK
        record = Report("refine", status, summary, tuple(notes), {"items": reports})
        markdown = "\n".join([f"**{summary}**", *[f"- note: {n}" for n in notes]])
        return io.NodeOutput(
            host.make_audio(results, OUTPUT_RATE),
            record,
            ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]},
        )
