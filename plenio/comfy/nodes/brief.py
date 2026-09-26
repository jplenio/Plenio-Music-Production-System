"""Song Brief: the structured intent of a song (single owner of vocal mode and length)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.brief import DEFAULT_LENGTH, LENGTHS, MELODY_OPTIONS, build_song_brief, options, resolve_length
from ...core.errors import PlenioError
from ..shared import template_library
from ..types import Brief

TEXT = {
    "description": "What the song is about and how it should sound. Sent to the writing model.",
    "genre": "Genre and sub-genre, e.g. 'indie pop'.",
    "mood": "Mood words, e.g. 'warm, hopeful'.",
    "tempo": "Tempo, e.g. '88 BPM' or 'midtempo'.",
    "key": "Optional key, e.g. 'G major'. Music models that use a score take the key from the score.",
    "meter": "Optional meter, e.g. '3/4'.",
}


def _summary(brief: Any) -> str:
    source = f" (from template: {', '.join(brief.from_template)})" if brief.from_template else ""
    return (
        f"**{'Instrumental' if brief.instrumental else 'Sung'} song**, {brief.length}{source}\n\n"
        + brief.to_text()
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
                "The intent of a new song: description, genre, mood, tempo, length and vocals. A template fills "
                "only the fields you leave empty. The only place where sung/instrumental and the length are set."
            ),
            inputs=[
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
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        # ComfyUI passes every input (incl. the DynamicCombo values) and then skips its own combo
        # checks, so the combos are checked here. Templates saved after startup stay valid.
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
        brief = build_song_brief(values, chosen)
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
