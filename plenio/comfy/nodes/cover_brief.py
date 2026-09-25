"""Cover Brief: the target style of a cover and how its vocals and harmony are treated."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.brief import COVER_VOCALS, HARMONY_OPTIONS, MELODY_OPTIONS, build_cover_brief, options
from ...core.errors import PlenioError
from ..shared import template_library
from ..types import Brief


def _summary(brief: Any) -> str:
    mode = {
        "original": "Original lyrics",
        "new": "New lyrics",
        "instrumental": "Instrumental" + (" · accompaniment only" if brief.melody == "accompaniment" else ""),
    }[brief.vocals]
    lines = [f"**Cover: {mode}**, harmony {brief.harmony}", "", brief.to_text()]
    lines += [f"\n- warning: {w}" for w in brief.warnings()]
    return "\n".join(lines)


class PlenioCoverBrief(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioCoverBrief",
            display_name="Cover Brief",
            category="Plenio/Song",
            description=(
                "The intent of a cover: the target style, what happens to the vocals (original lyrics, new "
                "lyrics or instrumental) and to the harmony. Melody, form and tempo come from the source. "
                "Which lyrics text is finally used is decided in the Song Sheet, not here."
            ),
            inputs=[
                io.Combo.Input(
                    "template",
                    options=options(template_library()),
                    default="none",
                    tooltip="Optional target style. Style fields you leave empty are taken from the template.",
                ),
                io.String.Input(
                    "description", multiline=True, default="", tooltip="How the cover should sound."
                ),
                io.String.Input("genre", default="", tooltip="Target genre, e.g. 'acoustic folk'."),
                io.String.Input("mood", default="", tooltip="Mood words, e.g. 'warm, intimate'."),
                io.DynamicCombo.Input(
                    "vocals",
                    options=[
                        io.DynamicCombo.Option(
                            "instrumental",
                            [
                                io.Combo.Input(
                                    "melody",
                                    options=list(MELODY_OPTIONS),
                                    default="instrument plays the lead",
                                    tooltip="An instrument plays the vocal melody, or accompaniment only.",
                                ),
                                io.String.Input(
                                    "lead_instrument",
                                    default="",
                                    tooltip="Optional lead instrument, e.g. 'piano'.",
                                ),
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "original lyrics",
                            [
                                io.String.Input(
                                    "language",
                                    default="auto",
                                    tooltip="Language of the source's lyrics; 'auto' detects it from the singing.",
                                ),
                                io.String.Input(
                                    "voice", default="", tooltip="Vocal character, e.g. 'soft female voice'."
                                ),
                            ],
                        ),
                        io.DynamicCombo.Option(
                            "new lyrics",
                            [
                                io.String.Input(
                                    "language", default="English", tooltip="Language of the new lyrics."
                                ),
                                io.String.Input("voice", default="", tooltip="Vocal character."),
                                io.String.Input(
                                    "theme", default="", tooltip="What the new lyrics are about."
                                ),
                                io.Boolean.Input(
                                    "phrasing_reference",
                                    default=False,
                                    tooltip="Show the writer the source's transcribed lyrics as a phrasing reference "
                                    "(runs the lyrics ASR).",
                                ),
                            ],
                        ),
                    ],
                    tooltip="Instrumental (default), the original lyrics of the source, or new lyrics on its melody.",
                ),
                io.Combo.Input(
                    "harmony",
                    options=list(HARMONY_OPTIONS),
                    default="new accompaniment",
                    tooltip="new accompaniment: the source's chords are removed and YuE2 re-harmonises (melody mode). "
                    "keep original chords: the chords stay (full mode).",
                ),
                io.String.Input(
                    "title",
                    default="",
                    advanced=True,
                    tooltip="Optional fixed title, e.g. 'Original Title (Jazz Cover)'. Empty: the writer proposes one.",
                ),
            ],
            outputs=[
                Brief.Output(display_name="brief", tooltip="The cover brief."),
                io.String.Output(display_name="brief_text", tooltip="The brief as readable text."),
                io.Boolean.Output(
                    display_name="use_source_lyrics",
                    tooltip="True for original-lyrics covers (lyrics from the ASR).",
                ),
                io.Boolean.Output(display_name="instrumental", tooltip="True for instrumental covers."),
            ],
        )

    @classmethod
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        template = kwargs.get("template", "none")
        if template != "none":
            try:
                template_library().get(str(template))
            except PlenioError as error:
                return str(error)
        if "harmony" in kwargs and kwargs["harmony"] not in HARMONY_OPTIONS:
            return f"Unknown harmony {kwargs['harmony']!r}; choose one of {list(HARMONY_OPTIONS)}."
        return True

    @classmethod
    def execute(
        cls,
        template: str,
        description: str,
        genre: str,
        mood: str,
        vocals: dict[str, Any],
        harmony: str,
        title: str = "",
    ) -> io.NodeOutput:
        chosen = None if template == "none" else template_library().get(template)
        mode = vocals.get("vocals", "instrumental")
        values = {
            "description": description,
            "genre": genre,
            "mood": mood,
            "vocals": COVER_VOCALS.get(mode, mode),
            "language": vocals.get("language", ""),
            "voice": vocals.get("voice", ""),
            "theme": vocals.get("theme", ""),
            "phrasing_reference": bool(vocals.get("phrasing_reference", False)),
            "melody": vocals.get("melody", ""),
            "lead_instrument": vocals.get("lead_instrument", ""),
            "harmony": harmony,
            "title": title,
        }
        brief = build_cover_brief(values, chosen)
        status = "warning" if brief.warnings() else "ok"
        return io.NodeOutput(
            brief,
            brief.to_text(),
            brief.use_source_lyrics,
            brief.instrumental,
            ui={"plenio_summary": [{"status": status, "markdown": _summary(brief)}]},
        )
