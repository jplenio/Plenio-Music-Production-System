"""Sung Pitch: the vocal line of a recording as a pitch curve for the score editor (owner's request
2026-10-03: a cover's original singing over the transcribed notes).

The vocal stem comes from a separation model in ``models/audio_separation`` (the one Separate Stems
uses), the curve from ``core.audio.pitch`` (YIN, NumPy). The curve is display only: Song Sheet shows
it in the piano roll and never sends it anywhere. Without a separation model - or when the separation
fails - the node still finishes: its output says why there is no curve, and the run goes on.

The stem itself is an output too (owner 2026-10-24): Transcribe Lyrics hears it besides the mix and keeps the
more confident hearing. Without a stem the output is empty, and Transcribe Lyrics hears the mix alone.
"""

from __future__ import annotations

import logging
from typing import Any

from comfy_api.latest import io

from ...core.audio.pitch import SungPitch, missing, track
from ...core.models import AUDIO_MODEL_FOLDERS
from ...core.problem_report import public_reason
from .. import audio_models, host
from ..types import PitchType

LOG = logging.getLogger(__name__)
WHOLE_MIX = "whole mix (no separation - less reliable)"
FOLDER = AUDIO_MODEL_FOLDERS["separation"]


def _separation_choices() -> list[str]:
    return [*host.model_files(FOLDER), WHOLE_MIX]


def _summary(pitch: SungPitch) -> str:
    if pitch.problem:
        return f"**No sung pitch:** {pitch.problem}"
    seconds = len(pitch.midi) / pitch.rate if pitch.rate else 0
    return f"**Sung pitch** of {seconds:.0f} s, {pitch.voiced:.0%} sung - {pitch.source}. Shown in Song Sheet's piano roll."


class PlenioSungPitch(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioSungPitch",
            display_name="Sung Pitch",
            category="Plenio/Audio analysis",
            description=(
                "The sung melody of a recording as a pitch curve: a separation model takes out the vocals, a "
                "pitch tracker follows them. Connect it to Song Sheet (sung_pitch): the piano roll draws the "
                "curve over the transcribed notes, so you see where they differ from the singing. Display only. "
                "Without a separation model it still finishes and says why there is no curve."
            ),
            inputs=[
                io.Audio.Input("audio", tooltip="The source recording (the cover's original)."),
                io.Combo.Input(
                    "separation",
                    options=_separation_choices(),
                    tooltip=f"A separation model in models/{FOLDER} (the one of Separate Stems) for the vocal stem; "
                    "'whole mix' tracks the loudest pitch of the mix, which is often an instrument.",
                ),
            ],
            outputs=[
                PitchType.Output(
                    display_name="sung_pitch", tooltip="For Song Sheet: the curve in the piano roll."
                ),
                io.Audio.Output(
                    display_name="vocals",
                    tooltip="The vocal stem (empty without a separation), for Transcribe Lyrics: it hears the stem "
                    "too and keeps the more confident hearing.",
                ),
            ],
        )

    @classmethod
    def execute(cls, audio: dict[str, Any], separation: str) -> io.NodeOutput:
        pitch, vocals = cls._pitch(audio, separation)
        return io.NodeOutput(
            pitch,
            vocals,
            ui={
                "plenio_summary": [
                    {"status": "warning" if pitch.problem else "ok", "markdown": _summary(pitch)}
                ]
            },
        )

    @classmethod
    def _pitch(cls, audio: dict[str, Any], separation: str) -> tuple[SungPitch, dict[str, Any] | None]:
        """The curve, and the vocal stem it was tracked on (``None``: no separation)."""
        items, rate = host.audio_items(audio)
        if not items:
            return missing("No audio came in."), None
        samples = items[0]
        if separation == WHOLE_MIX:
            return track(samples, rate, source="the whole mix (no separation)"), None
        path = host.locate_model(FOLDER, separation) if separation else None
        if path is None:
            return missing(
                f"The separation model {separation or '(none)'} is not in models/{FOLDER}; put it there "
                "(Separate Stems uses the same file) or choose 'whole mix'."
            ), None
        host.raise_if_interrupted()
        try:
            model = audio_models.load("separation", separation, path)
            stems = model.engine.separate(samples, rate)
        except Exception as error:  # display only: a failed separation must not stop the cover
            LOG.warning("Sung Pitch: the separation failed: %s", error)
            return missing(
                f"The separation failed ({public_reason(error)}); the editor shows no sung pitch."
            ), None
        vocals = stems.get("vocals")
        if vocals is None:
            return missing(f"{model.engine.name} gives no vocal stem ({', '.join(stems)})."), None
        host.raise_if_interrupted()
        return track(vocals, rate, source=f"vocals of {model.engine.name}"), host.make_audio([vocals], rate)
