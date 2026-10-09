"""Song Brief: the structured intent of a song (single owner of vocal mode and length)."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import replace
from typing import Any

from comfy_api.latest import io

from ...core.arrangement import canonical_name
from ...core.brief import (
    ARRANGEMENT_DEFAULT,
    CLOSENESS_DEFAULT,
    COVER_MODES,
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
from ...core.series import series_key
from ..shared import SERIES, mode_library, mode_names, template_library
from ..types import Brief

MODE_TOOLTIP = (
    "new song every run: each run writes and renders a different song from this brief (with its own draft and "
    "plan seeds) - set the batch count next to Run for a whole series. A Song Sheet set to 'stop for review' "
    "stops each new song; after Approve the next run renders that song, the run after it writes the next one. "
    "one song, stop to review: the Song Sheets stop so you can check and edit the documents before rendering; "
    "later runs keep them and render new takes."
)
SONG_INPUTS = (
    "mode",
    "template",
    "description",
    "genre",
    "mood",
    "tempo",
    "length",
    "vocals",
    "key",
    "meter",
)
SONG_SEED_TOOLTIP = (
    "Added to the draft and plan seeds: every song of a series gets its own (kept while it waits for review); "
    "0 for one song."
)

EXPERIMENTAL = (
    "Experimental: creative modes can give unexpected results - they are meant for experimenting: try a mode, "
    "listen, keep what you like or run again with another arrangement seed. off is the dependable choice."
)
ARRANGEMENT_TOOLTIP = (
    "off: no arrangement - the music model plans melody, chords and instruments by itself. A creative mode "
    "(standard, varied, fantasy, sterile, many instruments, dramatic - or your own file in "
    "user/plenio/arrangement) adds its hints to the writing prompt and, in YuE2 Song, lets the writer model plan "
    "every section of YuE2's score: chords, what the instrument line plays, energy, a key lift. Plenio writes the "
    "notes itself and checks the result; a plan it cannot use leaves YuE2's score as it was (the Song Sheet says "
    "so). Planning works with every writer model - GGUF files, LM Studio and Ollama keep to the format exactly. "
    + EXPERIMENTAL
)
GENRE_CLOSENESS_TOOLTIP = (
    "Creative modes only (off ignores it; experimental): how close the song stays to its genre - 100 strictly "
    "typical, 70 typical with personal touches, 40 free within the genre, 0 borrow from any style. It shapes the "
    "style words and the section plan."
)
UNDER_SINGING_TOOLTIP = (
    "Creative modes only (experimental): off (default) - the instrument line plays where the voice rests "
    "(intros, interludes, gaps between phrases), as in YuE2's own scores, where the second voice is the "
    "instrumental melody. On - it also sounds under the singing: calm, below the voice and never a minor second "
    "against it. More accompaniment, but further from what YuE2 knows."
)
TEXT = {
    "description": "What the song is about and how it should sound. Sent to the writing model.",
    "genre": "Genre and sub-genre, e.g. 'indie pop'.",
    "mood": "Mood words, e.g. 'warm, hopeful'.",
    "tempo": "Tempo, e.g. '88 BPM' or 'midtempo'.",
    "key": "Optional key, e.g. 'G major'. Music models that use a score take the key from the score; the DAW "
    "template's empty score is built in it.",
    "meter": "Optional meter, e.g. '3/4' or '6/8'. Music models that use a score take the meter from the score; the "
    "DAW template's empty score is built in it.",
}


def arrangement_line(brief: Any) -> str:
    """The summary line of the creative mode (Song Brief and Cover Brief)."""
    if brief.arrangement == ARRANGEMENT_DEFAULT:
        return "Arrangement: off (the music model plans the music by itself)"
    under = ", lines also under the singing" if getattr(brief, "lines_under_singing", False) else ""
    if brief.kind == "song":
        return (
            f"Arrangement: **{brief.arrangement}** (experimental), genre closeness {brief.closeness}{under}"
        )
    lyrics = f", lyrics closeness {brief.lyrics_closeness}" if brief.writes_lyrics else ""
    return f"Arrangement: **{brief.arrangement}** (experimental), song flow closeness {brief.closeness}{lyrics}{under}"


def check_arrangement(name: Any) -> str | None:
    """Why ``name`` is not a creative mode (``None``: it is one)."""
    if name is None or canonical_name(str(name)) in mode_names():
        return None
    return (
        f"Unknown creative mode {name!r}. Choose one of {mode_names()} (a mode file of your own appears after a "
        "refresh, R; a file with a mistake is named in the ComfyUI log)."
    )


def mode_line(brief: Any) -> str:
    """The summary line of the work mode (Song Brief and Cover Brief)."""
    if brief.mode == "batch":
        held = " - kept until the reviewed song is rendered" if SERIES.is_held(brief.series) else ""
        return (
            f"Mode: new {brief.kind} every run (song {brief.variation} of the series{held}; Song Sheets on "
            "'as the brief says' do not stop)"
        )
    return f"Mode: one {brief.kind}, stop to review (the Song Sheets stop for approval; later runs are new takes)"


def series_song(kind: str, mode: str, inputs: Mapping[str, Any], *, fresh: bool) -> tuple[str, int | None]:
    """The series key and the song (variation) of this run; ``('', None)`` for one song.

    ``fresh`` (the node's fingerprint, once per run): a new song unless one is held for review;
    otherwise the song that fingerprint chose (``execute``)."""
    if resolve_mode(mode, SONG_MODES if kind == "song" else COVER_MODES) != "batch":
        return "", None
    key = series_key(kind, inputs)
    return key, SERIES.song(key) if fresh else SERIES.current(key)


def _summary(brief: Any) -> str:
    source = f" (from template: {', '.join(brief.from_template)})" if brief.from_template else ""
    return (
        f"**{'Instrumental' if brief.instrumental else 'Sung'} song**, {brief.length}{source}\n\n"
        f"{mode_line(brief)}\n\n{arrangement_line(brief)}\n\n" + brief.to_text()
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
                # not 'advanced': App mode shows an advanced widget's label without its field, and the DAW
                # template's empty score follows the key and the meter
                io.String.Input("key", default="", tooltip=TEXT["key"]),
                io.String.Input("meter", default="", tooltip=TEXT["meter"]),
                # appended: a saved workflow's values are assigned by position, new widgets go last
                io.Combo.Input(
                    "arrangement",
                    display_name="arrangement (experimental)",
                    options=mode_names(),
                    default=ARRANGEMENT_DEFAULT,
                    optional=True,  # an API prompt of an older version runs as before (off)
                    tooltip=ARRANGEMENT_TOOLTIP,
                ),
                io.Int.Input(
                    "genre_closeness",
                    display_name="genre closeness",
                    default=CLOSENESS_DEFAULT,
                    optional=True,
                    min=0,
                    max=100,
                    step=1,
                    display_mode=io.NumberDisplay.slider,
                    tooltip=GENRE_CLOSENESS_TOOLTIP,
                ),
                io.Boolean.Input(
                    "lines_under_singing",
                    display_name="lines under the singing (experimental)",
                    default=False,
                    optional=True,
                    tooltip=UNDER_SINGING_TOOLTIP,
                ),
            ],
            outputs=[
                Brief.Output(
                    display_name="brief", tooltip="The brief for Write Song, Score Tools and the Song Sheet."
                ),
                io.String.Output(display_name="brief_text", tooltip="The brief as readable text."),
                io.Float.Output(display_name="max_seconds", tooltip="Render headroom for the target length."),
                io.Boolean.Output(display_name="instrumental", tooltip="True for instrumental songs."),
                io.Int.Output(display_name="song_seed", tooltip=SONG_SEED_TOOLTIP),
            ],
        )

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        # new song every run: a new song (and with it everything after the brief) - unless a Song Sheet
        # holds the current one for review (core.series); one song: the inputs alone decide
        inputs = {name: kwargs.get(name) for name in SONG_INPUTS}
        key, song = series_song("song", str(kwargs.get("mode", "")), inputs, fresh=True)
        return f"{key}:{song}" if key else ""

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
        return check_arrangement(kwargs.get("arrangement")) or True

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
        arrangement: str = ARRANGEMENT_DEFAULT,
        genre_closeness: int = CLOSENESS_DEFAULT,
        lines_under_singing: bool = False,
    ) -> io.NodeOutput:
        chosen = None if template == "none" else template_library().get(template)
        # an unknown mode stops here, with the list to choose from; 0.4.5's "simple" is read as "off"
        arrangement = mode_library().by_name(arrangement).name
        length_input = length
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
            "arrangement": arrangement,
            "closeness": genre_closeness,
            "lines_under_singing": bool(lines_under_singing),
        }
        inputs = dict(
            zip(
                SONG_INPUTS,
                (mode, template, description, genre, mood, tempo, length_input, vocals, key, meter),
                strict=True,
            )
        )
        series, song = series_song("song", mode, inputs, fresh=False)
        brief = replace(build_song_brief(values, chosen, mode=mode, variation=song), series=series)
        notes = [note for note in (length_note, *brief.notes) if note]
        return io.NodeOutput(
            brief,
            brief.to_text(),
            brief.max_seconds,
            brief.instrumental,
            brief.song_seed,
            ui={
                "plenio_summary": [
                    {
                        "status": "warning" if notes else "ok",
                        "markdown": "".join(f"**Note:** {note}\n\n" for note in notes) + _summary(brief),
                    }
                ]
            },
        )
