"""Song Brief: the structured intent of a song (single owner of vocal mode and length)."""

from __future__ import annotations

import secrets
from typing import Any

from comfy_api.latest import io

from ...core.brief import (
    DEFAULT_LENGTH,
    LENGTHS,
    MELODY_OPTIONS,
    SONG_MODES,
    build_song_brief,
    options,
    resolve_length,
    resolve_mode,
)
from ...core.errors import PlenioError
from ..shared import template_library
from ..types import Brief

MODE_TOOLTIP = (
    "new song every run: each run writes and renders a different song from this brief, without stops - set "
    "the batch count next to Run for a whole series. one song, stop to review: the Song Sheets stop so you "
    "can check and edit the documents before rendering; later runs keep them and render new takes."
)

TEXT = {
    "description": "What the song is about and how it should sound. Sent to the writing model.",
    "genre": "Genre and sub-genre, e.g. 'indie pop'.",
    "mood": "Mood words, e.g. 'warm, hopeful'.",
    "tempo": "Tempo, e.g. '88 BPM' or 'midtempo'.",
    "key": "Optional key, e.g. 'G major'. Music models that use a score take the key from the score.",
    "meter": "Optional meter, e.g. '3/4'.",
}


def mode_line(brief: Any) -> str:
    """The summary line of the work mode (Song Brief and Cover Brief)."""
    if brief.mode == "batch":
        return f"Mode: new {brief.kind} every run (series variation {brief.variation}; the Song Sheets do not stop)"
    return f"Mode: one {brief.kind}, stop to review (the Song Sheets stop for approval; later runs are new takes)"


def draw_variation(mode: str) -> int | None:
    """A new series variation for every batch run; none in the careful mode."""
    return secrets.randbelow(9999) + 1 if resolve_mode(mode) == "batch" else None


def _summary(brief: Any) -> str:
    source = f" (from template: {', '.join(brief.from_template)})" if brief.from_template else ""
    return (
        f"**{'Instrumental' if brief.instrumental else 'Sung'} song**, {brief.length}{source}\n\n"
        f"{mode_line(brief)}\n\n" + brief.to_text()
    )


class PlenioSongBrief(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioSongBrief",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Song Brief",
            category="Plenio/Song",
            description=(
                "The intent of a new song: the work mode (a new song every run, or one song with review stops), "
                "description, genre, mood, tempo, length and vocals. A template fills only the fields you leave "
                "empty. The only place where the work mode, sung/instrumental and the length are set."
            ),
            inputs=[
                io.Combo.Input(
                    "mode", options=list(SONG_MODES), default="new song every run", tooltip=MODE_TOOLTIP
                ),
                io.Combo.Input(
                    "template",
                    options=options(template_library()),
                    default="none",
                    tooltip="Optional starting point. Text fields you leave empty are taken from the template.",
                ),
                io.String.Input("description", multiline=True, default="", tooltip=TEXT["description"]),
                io.String.Input("genre", default="", tooltip=TEXT["genre"]),
                io.String.Input("mood", default="", tooltip=TEXT["mood"]),
                io.String.Input("tempo", default="", tooltip=TEXT["tempo"]),
                io.Combo.Input(
                    "length",
                    options=list(LENGTHS),
                    default=DEFAULT_LENGTH,
                    tooltip="Target length. Guides the writing and, without a score, the render ceiling.",
                ),
                io.DynamicCombo.Input(
                    "vocals",
                    options=[
                        io.DynamicCombo.Option(
                            "sung",
                            [
                                io.String.Input(
                                    "language", default="", tooltip="Language of the lyrics, e.g. 'English'."
                                ),
                                io.String.Input(
                                    "voice", default="", tooltip="Vocal character, e.g. 'warm female voice'."
                                ),
                                io.String.Input("theme", default="", tooltip="What the lyrics are about."),
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "instrumental",
                            [
                                io.Combo.Input(
                                    "melody",
                                    options=list(MELODY_OPTIONS),
                                    default="instrument plays the lead",
                                    tooltip="Whether an instrument carries a lead melody or the song is accompaniment only.",
                                ),
                                io.String.Input(
                                    "lead_instrument",
                                    default="",
                                    tooltip="Optional lead instrument, e.g. 'saxophone'.",
                                ),
                            ],
                        ),
                    ],
                    tooltip="Sung song or instrumental. Instrumental hides all vocal settings.",
                ),
                io.String.Input("key", default="", advanced=True, tooltip=TEXT["key"]),
                io.String.Input("meter", default="", advanced=True, tooltip=TEXT["meter"]),
            ],
            outputs=[
                Brief.Output(
                    display_name="brief", tooltip="The brief for Write Song, Score Tools and the Song Sheet."
                ),
                io.String.Output(display_name="brief_text", tooltip="The brief as readable text."),
                io.Float.Output(display_name="max_seconds", tooltip="Render headroom for the target length."),
                io.Boolean.Output(display_name="instrumental", tooltip="True for instrumental songs."),
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        # new song every run: the brief runs again (a new variation) and with it everything after it
        return secrets.token_hex(8) if kwargs.get("mode") == "new song every run" else ""

    @classmethod
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        # ComfyUI passes every input (incl. the DynamicCombo values) and then skips its own combo
        # checks, so the combos are checked here. Templates saved after startup stay valid.
        if kwargs.get("mode", "one song, stop to review") not in SONG_MODES:
            return f"Unknown mode {kwargs.get('mode')!r}. Choose one of {list(SONG_MODES)}."
        template = kwargs.get("template", "none")
        if template != "none":
            try:
                template_library().get(str(template))
            except PlenioError as error:
                return str(error)
        if "length" in kwargs:
            try:
                resolve_length(str(kwargs["length"]))  # a free-form duration takes the nearest option
            except PlenioError as error:
                return f"{error} Choose one of {list(LENGTHS)}."
        return True

    @classmethod
    def execute(
        cls,
        mode: str,
        template: str,
        description: str,
        genre: str,
        mood: str,
        tempo: str,
        length: str,
        vocals: dict[str, Any],
        key: str = "",
        meter: str = "",
    ) -> io.NodeOutput:
        chosen = None if template == "none" else template_library().get(template)
        length, length_note = resolve_length(length)
        values = {
            "description": description,
            "genre": genre,
            "mood": mood,
            "tempo": tempo,
            "length": length,
            "key": key,
            "meter": meter,
            "vocals": vocals.get("vocals", "sung"),
            "language": vocals.get("language", ""),
            "voice": vocals.get("voice", ""),
            "theme": vocals.get("theme", ""),
            "melody": vocals.get("melody", ""),
            "lead_instrument": vocals.get("lead_instrument", ""),
        }
        brief = build_song_brief(values, chosen, mode=mode, variation=draw_variation(mode))
        return io.NodeOutput(
            brief,
            brief.to_text(),
            brief.max_seconds,
            brief.instrumental,
            ui={
                "plenio_summary": [
                    {
                        "status": "warning" if length_note else "ok",
                        "markdown": (f"**Note:** {length_note}\n\n" if length_note else "") + _summary(brief),
                    }
                ]
            },
        )
