"""Cover Brief: the target style of a cover and how its vocals and harmony are treated."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from comfy_api.latest import io

from ...core.brief import (
    ARRANGEMENT_DEFAULT,
    CLOSENESS_DEFAULT,
    COVER_MODES,
    COVER_VOCALS,
    HARMONY_OPTIONS,
    LYRICS_CLOSENESS_DEFAULT,
    MELODY_OPTIONS,
    build_cover_brief,
    options,
)
from ...core.errors import PlenioError
from ..shared import mode_library, mode_names, template_library
from ..types import Brief
from .brief import (
    EXPERIMENTAL,
    SONG_SEED_TOOLTIP,
    arrangement_line,
    check_arrangement,
    mode_line,
    series_song,
)

MODE_TOOLTIP = (
    "one cover, stop to review: Song Sheet · Score and Song Sheet · Text stop so you can check the transcription "
    "and the lyrics; later runs keep them and render new takes. new cover every run: each run writes a different "
    "version (title, style and - for new lyrics - the lyrics, with its own draft seed) and renders it; the "
    "transcription of the source is reused. A Song Sheet set to 'stop for review' stops each new version; after "
    "Approve the next run renders it, the run after it writes the next one."
)
COVER_INPUTS = ("mode", "template", "description", "genre", "mood", "vocals", "harmony", "title")
ARRANGEMENT_TOOLTIP = (
    "simple: the transcribed score stays as it is (as before). A creative mode (standard, varied, fantasy, "
    "sterile, many instruments, dramatic - or your own file in user/plenio/arrangement) adds its hints to the "
    "writing prompt and lets the writer model re-arrange the score's sections within the song flow closeness: "
    "chords, what the instrument line plays, energy, key. The melody and the form always stay. Plenio writes the "
    "notes itself and checks the result; a plan it cannot use leaves the transcription as it was (the score's "
    "Song Sheet says so). " + EXPERIMENTAL
)
SONG_FLOW_TOOLTIP = (
    "Creative modes only (simple ignores it; experimental): how close the cover's song flow stays to the "
    "original - 100 exactly the original (nothing is planned), 80 chords, key and tempo stay (only silent sections "
    "get a line), 50 recognisable (chords recoloured, lines changed, a small key lift), 20 a free version (new "
    "chords and lines, another tempo), 0 only a hint of the original. The melody and the form always remain."
)
LYRICS_CLOSENESS_TOOLTIP = (
    "New lyrics only (experimental): how close they stay to the source's lyrics - 0 written without the source's text (as "
    "before), 1-29 only a hint of it, 30-59 its theme and mood, 60-89 its story in new words, 90-100 its meaning "
    "line by line (a singable translation when the language differs). Above 0 the source's lyrics are "
    "transcribed for the writer (lyrics ASR); the source must have clear singing."
)


def _summary(brief: Any) -> str:
    mode = {
        "original": "Original lyrics",
        "new": "New lyrics",
        "instrumental": "Instrumental" + (" · accompaniment only" if brief.melody == "accompaniment" else ""),
    }[brief.vocals]
    lines = [f"**Note:** {note}\n" for note in brief.notes]
    lines += [
        f"**Cover: {mode}**, harmony {brief.harmony}",
        "",
        mode_line(brief),
        "",
        arrangement_line(brief),
        "",
        brief.to_text(),
    ]
    lines += [f"\n- warning: {w}" for w in brief.warnings()]
    return "\n".join(lines)


class PlenioCoverBrief(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioCoverBrief",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            display_name="Cover Brief",
            category="Plenio/Song",
            description=(
                "The intent of a cover: the work mode (one cover with review stops, or a new version every run), "
                "the target style, what happens to the vocals (original lyrics, new lyrics or instrumental) and "
                "to the harmony. Melody, form and tempo come from the source. "
                "Which lyrics text is finally used is decided in the Song Sheet, not here."
            ),
            inputs=[
                io.Combo.Input(
                    "mode",
                    options=list(COVER_MODES),
                    default="one cover, stop to review",
                    tooltip=MODE_TOOLTIP,
                ),
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
                # appended: a saved workflow's values are assigned by position, new widgets go last
                io.Combo.Input(
                    "arrangement",
                    display_name="arrangement (experimental)",
                    options=mode_names(),
                    default=ARRANGEMENT_DEFAULT,
                    optional=True,  # an API prompt of an older version runs as before (simple)
                    tooltip=ARRANGEMENT_TOOLTIP,
                ),
                io.Int.Input(
                    "song_flow_closeness",
                    display_name="song flow closeness",
                    default=CLOSENESS_DEFAULT,
                    optional=True,
                    min=0,
                    max=100,
                    step=1,
                    display_mode=io.NumberDisplay.slider,
                    tooltip=SONG_FLOW_TOOLTIP,
                ),
                io.Int.Input(
                    "lyrics_closeness",
                    display_name="lyrics closeness",
                    default=LYRICS_CLOSENESS_DEFAULT,
                    optional=True,
                    min=0,
                    max=100,
                    step=1,
                    display_mode=io.NumberDisplay.slider,
                    tooltip=LYRICS_CLOSENESS_TOOLTIP,
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
                io.Int.Output(
                    display_name="song_seed", tooltip=SONG_SEED_TOOLTIP.replace("and plan seeds", "seed")
                ),
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        # new cover every run: a new version - unless a Song Sheet holds the current one for review
        inputs = {name: kwargs.get(name) for name in COVER_INPUTS}
        key, song = series_song("cover", str(kwargs.get("mode", "")), inputs, fresh=True)
        return f"{key}:{song}" if key else ""

    @classmethod
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        if kwargs.get("mode", "one cover, stop to review") not in COVER_MODES:
            return f"Unknown mode {kwargs.get('mode')!r}. Choose one of {list(COVER_MODES)}."
        template = kwargs.get("template", "none")
        if template != "none":
            try:
                template_library().get(str(template))
            except PlenioError as error:
                return str(error)
        if "harmony" in kwargs and kwargs["harmony"] not in HARMONY_OPTIONS:
            return f"Unknown harmony {kwargs['harmony']!r}; choose one of {list(HARMONY_OPTIONS)}."
        return check_arrangement(kwargs.get("arrangement")) or True

    @classmethod
    def execute(
        cls,
        mode: str,
        template: str,
        description: str,
        genre: str,
        mood: str,
        vocals: dict[str, Any],
        harmony: str,
        title: str = "",
        arrangement: str = ARRANGEMENT_DEFAULT,
        song_flow_closeness: int = CLOSENESS_DEFAULT,
        lyrics_closeness: int = LYRICS_CLOSENESS_DEFAULT,
    ) -> io.NodeOutput:
        chosen = None if template == "none" else template_library().get(template)
        mode_library().by_name(arrangement)  # an unknown mode stops here, with the list to choose from
        vocal_mode = vocals.get("vocals", "instrumental")
        values = {
            "description": description,
            "genre": genre,
            "mood": mood,
            "vocals": COVER_VOCALS.get(vocal_mode, vocal_mode),
            "language": vocals.get("language", ""),
            "voice": vocals.get("voice", ""),
            "theme": vocals.get("theme", ""),
            "phrasing_reference": bool(vocals.get("phrasing_reference", False)),
            "melody": vocals.get("melody", ""),
            "lead_instrument": vocals.get("lead_instrument", ""),
            "harmony": harmony,
            "title": title,
            "arrangement": arrangement,
            "closeness": song_flow_closeness,
            "lyrics_closeness": lyrics_closeness,
        }
        inputs = dict(
            zip(COVER_INPUTS, (mode, template, description, genre, mood, vocals, harmony, title), strict=True)
        )
        series, song = series_song("cover", mode, inputs, fresh=False)
        brief = replace(build_cover_brief(values, chosen, mode=mode, variation=song), series=series)
        status = "warning" if brief.warnings() or brief.notes else "ok"
        return io.NodeOutput(
            brief,
            brief.to_text(),
            brief.use_source_lyrics,
            brief.instrumental,
            brief.song_seed,
            ui={"plenio_summary": [{"status": status, "markdown": _summary(brief)}]},
        )
