"""Refine (48 kHz): super-resolution with a crossover to the original, or plain resampling (experimental)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.audio.refine import (
    CUSTOM_PRESET,
    OUTPUT_RATE,
    PREPARED_STAGES,
    RefineSettings,
    prepared_stages,
    refine,
)
from ...core.errors import PlenioUserError
from ...core.reports import Report, Status
from .. import audio_models, host
from ..types import AudioModelType, ReportType

ENGINES = ("resample only", "model")
PRESET_OPTIONS: tuple[str, ...] = (CUSTOM_PRESET, *[name for name, _pre, _post in PREPARED_STAGES])
"""The prepared stage templates plus *custom* (the three fields below them)."""


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
                "changes. A prepared preset sets PRE, POST and the crossover in one go; *custom* uses the "
                "three fields. Same duration, no normalisation. Experimental."
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
                # preset, pre_hz, post_hz and seed are optional: an API prompt written before the preset
                # existed (it has no 'preset') stays valid, and the widget order the frontend builds
                # (required first, then optional) stays engine, crossover, gain, preset, pre, post, seed
                io.Combo.Input(
                    "preset",
                    options=list(PRESET_OPTIONS),
                    default=CUSTOM_PRESET,
                    optional=True,
                    tooltip=(
                        "A prepared stage template: one choice sets PRE, POST and the crossover (500 Hz "
                        "below PRE). *custom* uses the three fields below, which stay editable - the "
                        "MiniMax template ships template 3 and the matching numbers."
                    ),
                ),
                io.Float.Input(
                    "pre_hz",
                    default=0.0,
                    min=-1.0,
                    max=23000.0,
                    step=100.0,
                    advanced=True,
                    optional=True,
                    tooltip=(
                        "Low-pass before the model (it shapes only what the model sees): 0 = the model's "
                        "training condition, -1 = no PRE, else Hz (6000, 8000, 10000, 12000, 14000)."
                    ),
                ),
                io.Float.Input(
                    "post_hz",
                    default=0.0,
                    min=0.0,
                    max=23900.0,
                    step=100.0,
                    advanced=True,
                    optional=True,
                    tooltip=(
                        "Linear-phase roll-off of the result: 0 = off, else Hz (16000, 19000, 21000 tame "
                        "added air that sounds harsh)."
                    ),
                ),
                io.Int.Input(
                    "seed",
                    default=0,
                    min=0,
                    max=2**32 - 1,
                    optional=True,
                    tooltip="Seed of the model (deterministic).",
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
        model: Any = None,
        preset: str = CUSTOM_PRESET,
        pre_hz: float = 0.0,
        post_hz: float = 0.0,
        seed: int = 0,
    ) -> io.NodeOutput:
        if engine not in ENGINES:
            raise PlenioUserError(f"Unknown engine {engine!r}; use one of {list(ENGINES)}.")
        if preset not in PRESET_OPTIONS:
            raise PlenioUserError(f"Unknown preset {preset!r}; use one of {list(PRESET_OPTIONS)}.")
        chosen = prepared_stages(preset)
        # a prepared template sets all three stages in one go (owner's rule: crossover 500 Hz below PRE);
        # *custom* uses the three fields as they are
        use_pre, use_post, use_crossover = float(pre_hz), float(post_hz), float(crossover_hz)
        if chosen is not None:
            use_pre, use_post, use_crossover = chosen
        sr_engine = None
        if engine == "model":
            if model is None:
                raise PlenioUserError(
                    "Refine is set to 'model' but no Load Audio Model is connected.",
                    hint="Connect Load Audio Model (super-resolution), or choose the engine 'resample only'.",
                )
            sr_engine = audio_models.require(model, "super-resolution", "Refine")
        settings = RefineSettings(use_pre, use_crossover, sr_gain, use_post, seed)
        items, rate = host.audio_items(audio)
        results, reports = [], []
        for item in items:
            refined, report = refine(item, rate, sr_engine, settings, cancel=host.raise_if_interrupted)
            results.append(refined)
            reports.append(report)
        notes = [note for report in reports for note in report["notes"]]
        first = reports[0]
        edge_in, edge_out = first["bandwidth_in_hz"], first["bandwidth_out_hz"]
        applied = (
            f"; preset {preset} (PRE {use_pre:g} Hz, crossover {use_crossover:g} Hz, POST {use_post:g} Hz)"
            if chosen is not None
            else ""
        )
        summary = (
            f"Refine: {first['engine']}, {rate} -> {OUTPUT_RATE} Hz; bandwidth "
            f"{'-' if edge_in is None else f'{edge_in / 1000:.1f} kHz'} -> "
            f"{'-' if edge_out is None else f'{edge_out / 1000:.1f} kHz'}"
            + applied
            + (" (provisional defaults)" if first["provisional_defaults"] and sr_engine is not None else "")
        )
        status = Status.WARNING if notes else Status.OK
        record = Report(
            "refine",
            status,
            summary,
            tuple(notes),
            {"items": reports, "preset": preset if chosen is not None else None},
        )
        markdown = "\n".join([f"**{summary}**", *[f"- note: {n}" for n in notes]])
        return io.NodeOutput(
            host.make_audio(results, OUTPUT_RATE),
            record,
            ui={"plenio_summary": [{"status": status.value, "markdown": markdown}]},
        )
