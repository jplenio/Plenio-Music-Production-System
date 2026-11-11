"""Export Release: FLAC 24-bit / MP3 V0 / WAV 32-bit float with tags and cover art, and a release record -
also inside the FLAC, so the song can be continued from the audio file alone. Tags and the file name take
variables (``core.variables``); the lyrics go next to the song as subtitles, timed by listening
(``core.subtitles``)."""

from __future__ import annotations

import json
import logging
import time
from dataclasses import replace
from pathlib import Path
from typing import Any

import numpy as np
from comfy_api.latest import io

from ... import __version__
from ...core import romanize, syllables, variables
from ...core import score as score_rules
from ...core import subtitles as subtitle_rules
from ...core.asr import AsrSettings, weak_segments
from ...core.audio import measure
from ...core.audio.stems import SavedStems
from ...core.audio.transcribe import write_stem_midi
from ...core.brief import COVER_MODES, COVER_VOCALS, HARMONY_OPTIONS, MELODY_OPTIONS, SONG_MODES
from ...core.continuation import workflow_for_record
from ...core.engines import ENGINES
from ...core.errors import PlenioCancelledError, PlenioError, PlenioUserError
from ...core.files import atomic_write_bytes, atomic_write_text
from ...core.models import AUDIO_MODEL_FOLDERS
from ...core.quality import song_quality, summary_line
from ...core.release import (
    FORMATS,
    PROJECT_EMBEDDED,
    RECORD_SUFFIX,
    STEMS_SUFFIX,
    TAG_FIELDS,
    RecordInput,
    audio_md5,
    build_record,
    cover_jpeg,
    embed_cover,
    embed_project,
    expand_pattern,
    file_facts,
    numbered_title,
    plan_release,
    project_block,
    read_tags,
    release_titles,
    safe_filename,
    workflow_licences,
    write_audio,
)
from ...core.reports import Report, Status
from ...core.score import canonical, lyric_layout
from ...core.step_clock import StepClock
from ...player.song_page import PAGE_SUFFIX, page_for
from .. import audio_models, host
from ..lyrics_asr import language_code, run_asr
from ..sheet_music import DEFAULT_SIZE, JOBS, OFF, PAPERS, SHEET_MUSIC_OPTIONS, SIZES, hand_placed
from ..types import Brief, ReportType
from .stems import write_saved_stems

LOG = logging.getLogger(__name__)
COLLISIONS = ("number", "overwrite", "error")
TIMING_STEM = "vocal stem"
TIMING_SONG = "the song"
# the song first: the default since 1.4.1 - the vocal stem's separation made an export take minutes now and then
# (owner's request 2026-10-30), and the times on the song are good enough for most songs
LYRICS_TIMING = (TIMING_SONG, TIMING_STEM)
SEPARATION = "model_bs_roformer_ep_17_sdr_9.6568.ckpt"
"""The separation model the lyrics are heard on (the one of Stems and Sung Pitch, in models/audio_separation)."""
TIMING_OVERLAP = 8
"""The take is separated with an eighth of a chunk overlapping: 30 s instead of 55 s for four minutes (GPU), the
vocals 23 dB from the full separation's - plenty for the times."""
TIMING_TOOLTIP = (
    "What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the "
    "model of Stems and Sung Pitch, about half a minute per take - or the song (quicker)."
)
ORIGINAL_SUFFIX = " (original).flac"
TAG_MODES = ("title only", "tags", "copy from loaded file")
EXTRA_TAGS = tuple(field for field in TAG_FIELDS if field != "title")
# what the *tags* mode writes as the comment unless the user changes it
DEFAULT_COMMENT = "Powered by Plenio Music Production System / ComfyUI"
SHEET_SUFFIX = ".pdf"
SUBTITLE_SUFFIXES = {"lines": " (lines).srt", "notes": " (notes).srt", "sung": " (sung).srt"}
"""The lyrics as written, whole lines and painted on note by note - and what the take sings, as heard
(``core.subtitles.time_sung``; not for a song without lyrics, whose lines are what was heard)."""
SEED_NODES = ("PlenioSeed", "SeedNode")
LOW_MATCH = 0.5
"""Below this share of the lyrics' words heard, the subtitles get a note: the times rest on few words."""
SEED_TITLES = {"take seed": "take_seed", "draft seed": "draft_seed", "arrangement seed": "arrangement_seed"}
SHEET_TOOLTIP = (
    "Also save the sheet music (both voices, chords, sections, the lyrics under the notes) as '<name>.pdf' on "
    "A4 or Letter pages; an open ComfyUI page draws it after the export. Needs a score (YuE2)."
)
PROJECT_TOOLTIP = (
    "Store the release record (workflow, Song Sheets, seeds, settings) inside the song's FLAC: File > Continue "
    "a Plenio song... opens the song from the FLAC alone. Off for files you share without their making-of."
)
SIZE_TOOLTIP = (
    "How large the sheet music draws: standard about 3 bars a line, smaller 3-4, compact about 4, large 1-2 "
    "(the biggest notes)."
)
PAGE_TOOLTIP = (
    "Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and "
    "the prompts to copy, every setting, how it was made, the sound, the score and links to the files."
)
SRT_TOOLTIP = (
    "Write the lyrics as subtitles: '(lines).srt' whole lines, '(notes).srt' note by note, '(sung).srt' what the "
    "take really sings. Timed by listening (Qwen3-ASR and its aligner, 5.9 GB, fetched on first use)."
)
BRIEF_TOOLTIP = (
    "Optional: the brief, so that tags and the file name can use its fields ({genre}, {mood} ...)."
)
NAMING_TOOLTIP = (
    "File name: {title}, {date}, {seed}, {genre}, {artist} ... (the variables of the tags); '/' makes "
    "sub-folders; [optional {parts}] vanish when empty."
)


def sheet_documents(reports: list[dict[str, Any]]) -> dict[str, Any]:
    """The final documents of the release (the Song Sheets' reports), the sheets that hold them and the music
    model (``engine``)."""
    found: dict[str, Any] = {
        "score": "",
        "lyrics": "",
        "score_sheet": None,
        "lyrics_sheet": None,
        "engine": "",
    }
    for report in reports:
        data = report.get("data") or {}
        documents = data.get("documents") or {}
        for kind, doc in documents.items():
            if isinstance(doc, dict) and str(doc.get("text") or "").strip():
                found[kind] = str(doc["text"])
                found[f"{kind}_sheet"] = data.get("node_id")
        if data.get("engine") in ENGINES and not found["engine"]:
            found["engine"] = str(data["engine"])
    return found


TAG_TIPS = {
    "artist": "The artist tag.",
    "album": "The album tag.",
    "date": "Year or date, e.g. 2026 or {date}.",
    "track": "Track number, e.g. 3 or 3/12.",
    "genre": "The genre tag, e.g. {genre} (the brief's).",
    "comment": "The comment tag; empty: none.",
    "album_artist": "The album artist tag.",
    "composer": "The composer tag.",
    "lyrics": "The lyrics tag (FLAC, MP3; players show it), e.g. {lyrics}.",
}
VARIABLE_HINT = " Text with {variables}, or connect a text output to the field."


def _tag_inputs() -> list[Any]:
    defaults = {"comment": DEFAULT_COMMENT}
    return [
        io.String.Input(
            field,
            default=defaults.get(field, ""),
            # added in 1.0.0: optional, so an API prompt of 0.8.0 in *tags* mode runs as before
            optional=field == "lyrics",
            tooltip=TAG_TIPS[field] + VARIABLE_HINT,
        )
        for field in EXTRA_TAGS
    ]


def made_facts(brief: Any, reports: list[dict[str, Any]], now: float | None = None) -> dict[str, Any]:
    """How the song was made, for its record: when its run began (``None``: not known) and ended, how long it took,
    on what, and with which lyrics fidelity (the brief's, else the Best Take's level)."""
    finished = time.time() if now is None else now
    started = host.run_started()
    out: dict[str, Any] = {
        "started": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(started)) if started else None,
        "finished": time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(finished)),
        "seconds": round(finished - started, 1) if started and finished >= started else None,
        "on": host.machine(),
    }
    fidelity = getattr(brief, "fidelity", None)
    if not fidelity:
        best = next((r for r in reports if r.get("kind") == "best_take"), None)
        fidelity = ((best or {}).get("data") or {}).get("level")
    if fidelity:
        out["lyrics_fidelity"] = str(fidelity)
    return out


def run_timings(workflow: Any) -> dict[str, Any] | None:
    """Where this run's time went, per group of the template (``plenio.core.timings``), up to this node."""
    from ...core.song_api import stage_of

    shown = workflow if isinstance(workflow, dict) else {}
    try:
        return host.run_timings(lambda node_id: stage_of(shown, node_id))
    except Exception:  # noqa: BLE001 - the timings are a note; the export does not fail for them
        return None


def chosen_models(prompt: Any) -> dict[str, dict[str, str]] | None:
    """The file each Model Choice of ``prompt`` gave a loader, by node id: what it output in this run; one ComfyUI
    took from its cache did not run, and is resolved again as it did - the same plan on the same computer. A Model
    Choice that fed nothing (beside a bypassed adapter) is left out."""
    from .. import setup

    if not isinstance(prompt, dict):
        return None
    taken = setup.taken_in_this_run()
    found: dict[str, dict[str, str]] = {}
    for node_id, node in prompt.items():
        if not isinstance(node, dict) or node.get("class_type") != "PlenioModelChoice":
            continue
        if not setup.consumed(prompt, str(node_id)):
            continue
        if str(node_id) in taken:
            found[str(node_id)] = taken[str(node_id)]
            continue
        inputs = node.get("inputs") or {}
        component, file = str(inputs.get("component", "")), str(inputs.get("component.file", "") or "auto")
        try:
            found[str(node_id)] = {"component": component, "file": setup.choose(component, file).pick.file}
        except Exception:  # noqa: BLE001 - a note of the record; the export does not fail for it
            continue
    return found or None


def _plain(value: Any) -> str:
    if isinstance(value, bool):
        return "on" if value else "off"
    return "" if value is None else str(value).strip()


def brief_variables(brief: Any) -> dict[str, str]:
    """The brief's fields as variables (a Song Brief or a Cover Brief; nothing without one)."""
    if brief is None:
        return {}
    labels = {v: k for k, v in MELODY_OPTIONS.items()}
    modes = {v: k for k, v in (COVER_MODES if brief.kind == "cover" else SONG_MODES).items()}
    values: dict[str, Any] = {
        "description": brief.description,
        "template": brief.template,
        "mode": modes.get(brief.mode, brief.mode),
        "genre": brief.genre,
        "mood": brief.mood,
        "language": "" if brief.instrumental else brief.language,
        "voice": "" if brief.instrumental else brief.voice,
        "theme": "" if brief.instrumental else brief.theme,
        "melody": labels.get(brief.melody, brief.melody) if brief.instrumental else "",
        "lead_instrument": brief.lead_instrument if brief.instrumental else "",
        "arrangement": brief.arrangement,
        "lines_under_singing": bool(brief.lines_under_singing),
        "length": brief.length,
        "creativity": brief.creativity,
    }
    if brief.kind == "cover":
        values["vocals"] = {v: k for k, v in COVER_VOCALS.items()}.get(brief.vocals, brief.vocals)
        values["harmony"] = {v: k for k, v in HARMONY_OPTIONS.items()}.get(brief.harmony, brief.harmony)
        values["song_flow_closeness"] = brief.closeness
        values["lyrics_closeness"] = brief.lyrics_closeness if brief.writes_lyrics else ""
    else:
        values.update(
            vocals=brief.vocals,
            tempo=brief.tempo,
            key=brief.key,
            meter=brief.meter,
            genre_closeness=brief.closeness,
        )
    return {key: _plain(value) for key, value in values.items()}


def prompt_variables(prompt: Any) -> dict[str, str]:
    """The seeds of the template's seed nodes (by their titles) and the writer model, from the executed graph."""
    found: dict[str, str] = {}
    for node in (prompt or {}).values():
        if not isinstance(node, dict):
            continue
        inputs = node.get("inputs") or {}
        title = str((node.get("_meta") or {}).get("title") or "").strip().lower()
        if node.get("class_type") in SEED_NODES and title in SEED_TITLES:
            seed = inputs.get("seed")
            if isinstance(seed, int) and not isinstance(seed, bool):
                found.setdefault(SEED_TITLES[title], str(seed))
        if node.get("class_type") == "PlenioWriterChoice" and isinstance(inputs.get("model"), str):
            name = Path(str(inputs["model"]).replace("\\", "/")).name
            found.setdefault("writer", name.removesuffix(".safetensors").removesuffix(".gguf"))
    if "take_seed" in found:
        found["seed"] = found["take_seed"]
    return found


def score_variables(score_text: str) -> dict[str, str]:
    """The score's tempo and key (YuE2)."""
    if not score_text.strip():
        return {}
    try:
        score = canonical.from_abc(score_text)
    except PlenioError:
        return {}
    key = score.keys[0].key if score.keys else ""
    return {"bpm": str(score.tempo), "score_key": key}


def song_variables(
    documents: dict[str, Any], title: str, seconds: float, now: time.struct_time | None = None
) -> dict[str, str]:
    moment = now or time.localtime()
    minutes, rest = divmod(round(seconds), 60)
    engine = ENGINES.get(documents.get("engine") or "")
    return {
        "title": title,
        "lyrics": subtitle_rules.plain_lyrics(documents.get("lyrics") or ""),
        "style": str(documents.get("style") or "").strip(),
        "artwork_prompt": str(documents.get("artwork_prompt") or "").strip(),
        "duration": f"{minutes}:{rest:02d}",
        "date": time.strftime("%Y-%m-%d", moment),
        "year": time.strftime("%Y", moment),
        "time": time.strftime("%H%M%S", moment),
        "model": str(getattr(engine, "DISPLAY_NAME", "")) if engine else "",
        "plenio_version": __version__,
        **score_variables(str(documents.get("score") or "")),
    }


def typed_tag_values(tags: Any) -> dict[str, str]:
    """The tag fields' values as ``validate_inputs`` sees them (nested or ``tags.<field>``)."""
    if isinstance(tags, dict):
        return {field: tags[field] for field in EXTRA_TAGS if isinstance(tags.get(field), str)}
    return {}


def unknown_variables(naming: Any, tags: Any, flat: dict[str, Any]) -> str | None:
    """Why a typed file name pattern or tag field cannot run (a name that is no variable), checked when the
    run is queued, before anything renders."""
    if isinstance(naming, str) and variables.unknown_names(naming):
        return variables.unknown_message("The file name pattern", variables.unknown_names(naming))
    fields = {**typed_tag_values(tags)}
    fields.update(
        {
            key.removeprefix("tags."): value
            for key, value in flat.items()
            if key.startswith("tags.") and isinstance(value, str)
        }
    )
    for field, value in fields.items():
        unknown = variables.unknown_names(value)
        if unknown:
            return variables.unknown_message(f"The tag field '{field}'", unknown)
    return None


class PlenioExportRelease(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioExportRelease",
            display_name="Export Release",
            category="Plenio/Release",
            description=(
                "Writes the song into the ComfyUI output folder as FLAC 24-bit, MP3 V0 and/or WAV 32-bit float, "
                "with tags and cover art, plus a release record (JSON): documents with hashes, seeds and settings "
                "of the executed graph, reports, loudness and model licences. The stems marked 'save' in a Stem "
                "Mixer whose report comes in here go next to the song, into the folder '<name>-stems'."
            ),
            inputs=[
                io.Audio.Input(
                    "audio", tooltip="The finished audio (every item of a batch becomes one file)."
                ),
                io.String.Input(
                    "title",
                    force_input=True,
                    optional=True,
                    tooltip="Song title (from the Song Sheet). Without it: the copied title or the source file name.",
                ),
                io.Audio.Input(
                    "original",
                    optional=True,
                    tooltip="Also export this audio (for example the unmastered take) as '<name> (original).flac'.",
                ),
                io.Image.Input("cover", optional=True, tooltip="Cover art (square crop, JPEG)."),
                Brief.Input("brief", optional=True, tooltip=BRIEF_TOOLTIP),
                io.Autogrow.Input(
                    "reports",
                    optional=True,
                    template=io.Autogrow.TemplatePrefix(
                        input=ReportType.Input("report", tooltip="A Plenio report to include in the record."),
                        prefix="report_",
                        min=0,
                        max=16,
                    ),
                    tooltip="Reports to include in the release record (Song Sheets, mastering).",
                ),
                io.String.Input(
                    "folder", default="plenio", tooltip="Sub-folder of the ComfyUI output folder."
                ),
                io.String.Input(
                    "naming",
                    default="{date} {title}",
                    tooltip=NAMING_TOOLTIP,
                ),
                io.Boolean.Input("flac", optional=True, default=True, tooltip="FLAC 24-bit (lossless)."),
                io.Boolean.Input("mp3", optional=True, default=False, tooltip="MP3 VBR V0 (LAME)."),
                io.Boolean.Input(
                    "wav",
                    optional=True,
                    default=False,
                    tooltip="WAV 32-bit float (no clipping; few tags, no cover).",
                ),
                io.DynamicCombo.Input(
                    "tags",
                    optional=True,
                    options=[
                        io.DynamicCombo.Option("title only", []),
                        io.DynamicCombo.Option("tags", _tag_inputs()),
                        io.DynamicCombo.Option("copy from loaded file", []),
                    ],
                    tooltip="Metadata written into the files: the title only, tags typed or connected (with "
                    "{variables}), or the tags of the loaded file.",
                ),
                io.Combo.Input(
                    "collision",
                    options=list(COLLISIONS),
                    default="number",
                    advanced=True,
                    tooltip="When the file exists: number (add ' (2)' - also to a title another song of the folder "
                    "has), overwrite, or stop with an error.",
                ),
                # appended: a saved workflow's values are assigned by position, new widgets go last
                io.Combo.Input(
                    "sheet_music",
                    display_name="sheet music",
                    options=list(SHEET_MUSIC_OPTIONS),
                    default=OFF,
                    optional=True,
                    tooltip=SHEET_TOOLTIP,
                ),
                io.Combo.Input(
                    "sheet_music_size",
                    display_name="sheet music size",
                    options=list(SIZES),
                    default=DEFAULT_SIZE,
                    optional=True,
                    tooltip=SIZE_TOOLTIP,
                ),
                io.Boolean.Input(
                    "project_in_flac",
                    display_name="project in FLAC",
                    optional=True,
                    default=True,
                    tooltip=PROJECT_TOOLTIP,
                ),
                io.Boolean.Input(
                    "lyrics_srt",
                    display_name="lyrics subtitles (SRT)",
                    optional=True,
                    default=True,
                    tooltip=SRT_TOOLTIP,
                ),
                io.Combo.Input(
                    "lyrics_timing",
                    display_name="lyrics heard on",
                    options=list(LYRICS_TIMING),
                    default=TIMING_STEM,
                    optional=True,
                    tooltip=TIMING_TOOLTIP,
                ),
                io.Boolean.Input(
                    "song_page",
                    display_name="song page (HTML)",
                    optional=True,
                    default=True,
                    tooltip=PAGE_TOOLTIP,
                ),
            ],
            outputs=[
                io.String.Output(display_name="files", tooltip="Written files, one per line."),
                io.String.Output(display_name="record", tooltip="Path of the release record."),
            ],
            hidden=[io.Hidden.prompt, io.Hidden.extra_pnginfo],
            is_output_node=True,
            not_idempotent=True,
        )

    @classmethod
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        # a typo in a typed variable stops the run when it is queued, not after the render; linked text is
        # known only when the export runs (an unknown name there stays as written, with a note)
        flat = {key: value for key, value in kwargs.items() if key.startswith("tags.")}
        return unknown_variables(kwargs.get("naming"), kwargs.get("tags"), flat) or True

    @classmethod
    def execute(
        cls,
        audio: dict[str, Any],
        folder: str,
        naming: str,
        flac: bool = True,
        mp3: bool = False,
        wav: bool = False,
        tags: dict[str, Any] | None = None,
        collision: str = "number",
        title: str | None = None,
        original: dict[str, Any] | None = None,
        cover: Any = None,
        reports: dict[str, Any] | None = None,
        sheet_music: str = OFF,
        sheet_music_size: str = DEFAULT_SIZE,
        project_in_flac: bool = True,
        brief: Any = None,
        lyrics_srt: bool = True,
        lyrics_timing: str = TIMING_STEM,
        song_page: bool = True,
    ) -> io.NodeOutput:
        if sheet_music not in SHEET_MUSIC_OPTIONS:
            raise PlenioUserError(
                f"Unknown sheet music option {sheet_music!r}; use one of {list(SHEET_MUSIC_OPTIONS)}."
            )
        if sheet_music_size not in SIZES:
            raise PlenioUserError(f"Unknown sheet music size {sheet_music_size!r}; use one of {list(SIZES)}.")
        kinds = [kind for kind, wanted in (("flac", flac), ("mp3", mp3), ("wav", wav)) if wanted]
        if not kinds:
            raise PlenioUserError("Choose at least one format (flac, mp3 or wav).")
        base = host.output_directory()
        target_folder = (base / folder.strip().strip("/\\")) if folder.strip() else base
        if base.resolve() not in (target_folder.resolve(), *target_folder.resolve().parents):
            raise PlenioUserError(f"The export folder {folder!r} leaves the ComfyUI output folder.")
        items, rate = host.audio_items(audio)
        received = [r for r in (reports or {}).values() if r is not None]
        report_dicts = [r.to_dict() if isinstance(r, Report) else dict(r) for r in received]
        # the Stem Mixer's strips marked *save* ride on its report: they go next to the song
        saved_stems = [
            r.attachment for r in received if isinstance(r, Report) and isinstance(r.attachment, SavedStems)
        ]
        sheet = sheet_documents(report_dicts)
        # the variables of the tags and the file name (core.variables)
        values = {
            **song_variables(sheet, "", items[0].shape[1] / rate),
            **brief_variables(brief),
            **prompt_variables(cls.hidden.prompt),
        }
        metadata, picture, notes = _metadata(
            tags or {"tags": "title only"}, title, cover, cls.hidden.prompt, values
        )
        song_title = metadata.get("title") or "Untitled"
        if collision == "number":
            # a title another song of the folder has gets a number, as a file name does (owner's request
            # 2026-10-22: every cover of one song had the same title in the Plenio Player)
            numbered = numbered_title(
                song_title, release_titles(target_folder, recursive=target_folder != base)
            )
            if numbered != song_title:
                notes.append(
                    f"title: another song in this folder is titled {song_title!r} - this one is {numbered!r}"
                )
                song_title = metadata["title"] = numbered
        values.update({"title": song_title, **{k: metadata.get(k, "") for k in variables.TAG_VARIABLES}})
        relative = expand_pattern(naming, {**values, "title": safe_filename(song_title)})
        takes = ["" if len(items) == 1 else f" take {index + 1}" for index in range(len(items))]
        # the lyrics lines placed by hand on the Song Sheet, from the workflow the run was queued with
        spans = (
            hand_placed(cls.hidden.extra_pnginfo, (sheet["score_sheet"], sheet["lyrics_sheet"]))
            if sheet["score"].strip()
            else []
        )
        display = ""
        if sheet_music != OFF:
            if not sheet["score"].strip():
                notes.append(
                    "sheet music: this release has no score (MiniMax Music 3, or planning was off) - no PDF"
                )
            else:
                view = score_rules.editor_view(sheet["score"], sheet["lyrics"] or None, spans or None)
                display = str(view.get("display_abc") or "")
                if not display:
                    notes.append("sheet music: the score cannot be drawn as notation - no PDF")
        suffixes = [take + FORMATS[kind]["extension"] for take in takes for kind in kinds]
        suffixes += [ORIGINAL_SUFFIX] * (original is not None) + [".jpg"] * (picture is not None)
        suffixes += [SHEET_SUFFIX] * bool(display)
        suffixes += [STEMS_SUFFIX] * bool(saved_stems)
        suffixes += [PAGE_SUFFIX] * bool(song_page)
        suffixes += [take + suffix for take in takes for suffix in SUBTITLE_SUFFIXES.values()] * bool(
            lyrics_srt
        )
        # one base name for every file of this export, record included (AUD-04)
        stem = plan_release(target_folder, relative, [*suffixes, RECORD_SUFFIX], collision=collision)

        def file(suffix: str) -> Path:
            return stem.with_name(stem.name + suffix)

        clock = StepClock()
        written: list[Path] = []
        masters: list[Path] = []  # the song's FLAC files, one per take
        facts: list[dict[str, Any]] = []
        loudness: list[dict[str, Any]] = []
        for take, samples in zip(takes, items, strict=True):
            loudness.append(measure(samples, rate, cancel=host.raise_if_interrupted).to_dict())
            for kind in kinds:
                path = file(take + FORMATS[kind]["extension"])
                audio_facts = write_audio(path, samples, rate, kind, metadata)
                if picture is not None and kind != "wav":
                    embed_cover(path, picture)  # FLAC picture block / ID3 APIC; WAV keeps the .jpg only
                written.append(path)
                masters += [path] * (kind == "flac")
                facts.append({**file_facts(path), **audio_facts, **_md5(path)})
        if original is not None:
            original_items, original_rate = host.audio_items(original)
            path = file(ORIGINAL_SUFFIX)
            original_facts = write_audio(path, original_items[0], original_rate, "flac", metadata)
            if picture is not None:
                embed_cover(path, picture)
            facts.append({**file_facts(path), **original_facts, **_md5(path), "role": "original"})
            written.append(path)
        clock.lap("audio files")
        subtitle_lines: list[str] = []
        timings: list[dict[str, Any]] = []
        # why a take has no subtitles: the Plenio Player says it instead of guessing (GitHub report 2026-10-22)
        untimed: list[str] = []
        if lyrics_srt:
            for take, samples in zip(takes, items, strict=True):
                timed, sung, why, heard_from = _subtitles(
                    samples,
                    rate,
                    sheet,
                    spans,
                    brief,
                    notes,
                    on_stem=lyrics_timing == TIMING_STEM,
                    clock=clock,
                )
                clock.lap("lyrics timing")
                if timed is None:
                    untimed.append(why)
                    continue
                files_of = [("lines", timed, timed.lines_srt()), ("notes", timed, timed.notes_srt())]
                if sung is not None:
                    files_of.append(("sung", sung.subtitles, sung.subtitles.lines_srt()))
                for kind, source, text in files_of:
                    path = file(take + SUBTITLE_SUFFIXES[kind])
                    atomic_write_text(path, text)
                    facts.append(
                        {**file_facts(path), "role": "subtitles", "subtitles": kind, "timing": source.timing}
                    )
                    written.append(path)
                where = f" ({take.strip()})" if take else ""
                heard = (
                    "the words as heard"
                    if timed.timing == "heard"
                    else f"{timed.matched:.0%} of the lyrics' words heard"
                )
                subtitle_lines.append(
                    f"- subtitles{where}: (lines).srt and (notes).srt, {len(timed.lines)} lines timed by "
                    f"listening to {heard_from} ({heard})"
                )
                notes.extend(_subtitle_notes(timed, take))
                timings.append(
                    {
                        **timed.to_timing(take),
                        "heard_from": heard_from,
                        **({"sung": sung.to_record()} if sung else {}),
                    }
                )
                if sung is not None:
                    subtitle_lines.append(
                        f"- sung lyrics{where}: (sung).srt, {len(sung.subtitles.lines)} lines as heard - "
                        f"{sung.written_heard:.0%} of the lyrics' words sung as written, {sung.extra_words} "
                        "word(s) the lyrics do not have"
                    )
                    notes.extend(f"sung lyrics{where}: {finding}" for finding in sung.findings())
        clock.lap("lyrics timing")
        cover_path = None
        warnings: list[str] = []
        if picture is not None:
            cover_path = file(".jpg")
            atomic_write_bytes(cover_path, picture)
            facts.append({**file_facts(cover_path), "role": "cover"})
        stems_folder = file(STEMS_SUFFIX)
        stem_names: list[str] = []
        stem_midi_lines: list[str] = []
        for saved in saved_stems:
            for name, path, audio_facts in write_saved_stems(
                stems_folder,
                saved,
                lambda strip: {**metadata, "title": f"{song_title} ({strip})"},
                number=collision != "overwrite",
            ):
                facts.append(
                    {
                        **file_facts(path),
                        "name": f"{stems_folder.name}/{path.name}",
                        **audio_facts,
                        "role": "stem",
                        "stem": name,
                    }
                )
                written.append(path)
                stem_names.append(name)
            # the bass and the vocals also as notes, for a DAW (a user's request 2026-10-22; experimental)
            tempo, meter = _song_tempo(values, sheet)
            for name, path, count in write_stem_midi(
                stems_folder, saved, tempo=tempo, meter=meter, number=collision != "overwrite"
            ):
                facts.append(
                    {
                        **file_facts(path),
                        "name": f"{stems_folder.name}/{path.name}",
                        "role": "stem_midi",
                        "stem": name,
                        "notes": count,
                    }
                )
                written.append(path)
                stem_midi_lines.append(f"{path.name} ({count} notes)")
        licences = sorted(
            {
                ENGINES[r["data"]["engine"]].LICENCE
                for r in report_dicts
                if r.get("data", {}).get("engine") in ENGINES
            }
            | workflow_licences(cls.hidden.prompt)
        )
        # the song's FLAC files carry the record (GitHub issue #9); their entries give the file without it
        carriers = list(masters) if project_in_flac else []
        if carriers and host.metadata_disabled():
            notes.append("project in FLAC: off, ComfyUI runs with --disable-metadata")
            carriers = []
        carried = {path.name for path in carriers}
        facts = [{**f, "project": PROJECT_EMBEDDED} if f.get("name") in carried else f for f in facts]
        record_input = RecordInput(
            versions={
                "plenio": __version__,
                "comfyui": host.comfyui_version(),
                "frontend": host.frontend_version(),
            },
            prompt=cls.hidden.prompt,
            workflow=workflow_for_record((cls.hidden.extra_pnginfo or {}).get("workflow"), cls.hidden.prompt),
            timing=timings or None,
            subtitles={
                "wanted": lyrics_srt,
                "takes": len(timings),
                **({"why": list(dict.fromkeys(untimed))} if untimed else {}),
            },
            reports=report_dicts,
            files=facts,
            audio={
                "sample_rate": rate,
                "items": len(items),
                "seconds": round(items[0].shape[1] / rate, 3),
                "loudness": loudness,
                "tags": metadata,
            },
            title=song_title,
            licences=licences,
            made=made_facts(brief, report_dicts),
            timings=run_timings((cls.hidden.extra_pnginfo or {}).get("workflow")),
            models=chosen_models(cls.hidden.prompt),
            sheet_music=(
                {
                    "file": file(SHEET_SUFFIX).name,
                    "paper": sheet_music.removeprefix("PDF (").removesuffix(")"),
                    "size": sheet_music_size,
                    "status": "drawn by the browser after the export",
                }
                if display
                else None
            ),
        )
        record = build_record(record_input)
        if carriers:
            try:
                project_block(record)
            except PlenioUserError as error:  # too large for a FLAC block: the record file holds it alone
                notes.append(f"project in FLAC: left out ({error.message})")
                carriers = []
                plain = [{k: v for k, v in f.items() if k != "project"} for f in facts]
                record = build_record(replace(record_input, files=plain))
        clock.lap("stems and record")
        # how well it came out, measured from the master and the record (owner's request 2026-10-29): a hint where
        # to listen first; not part of the fingerprint, and a song is exported also when measuring fails
        try:
            record["quality"] = song_quality(np.asarray(items[0], dtype=np.float32), rate, record)
        except Exception as error:  # noqa: BLE001 - the measure is a reading aid
            LOG.warning("Plenio: the song's quality was not measured: %s", error, exc_info=True)
            notes.append(f"quality: not measured ({type(error).__name__}: {error})")
        for path in carriers:
            embed_project(path, record)
        clock.lap("quality")
        record_path = file(RECORD_SUFFIX)
        atomic_write_text(record_path, json.dumps(record, indent=2, ensure_ascii=False))
        page_path: Path | None = None
        if song_page:
            # everything about the song on one readable page, from the record just written (GitHub issue
            # 2026-10-28: the full lyrics, to copy for a new run)
            try:
                page_path = file(PAGE_SUFFIX)
                atomic_write_text(page_path, page_for(record_path))
            except Exception as error:  # noqa: BLE001 - the song is exported; the page is a reading aid
                LOG.warning("Plenio: the song page was not written: %s", error, exc_info=True)
                notes.append(f"song page: not written ({type(error).__name__}: {error})")
                page_path = None
        clock.lap("record and page")
        took = clock.line()
        LOG.info("Plenio Export Release %s: %s", stem.name, took)
        notation: list[dict[str, Any]] = []
        if display:
            # an open page draws the PDF and posts it back (sheet_music.py)
            pdf_path = file(SHEET_SUFFIX)
            job = {
                "file": pdf_path.name,
                "title": song_title,
                "paper": PAPERS[sheet_music],
                "size": sheet_music_size,
                "display_abc": display,
            }
            notation.append({**job, "token": JOBS.reserve(pdf_path, record_path, job)})
        relative_names = [str(Path(p).relative_to(base)) for p in written]
        # the released files: a clip there is a mistake (a limiter before the export avoids it)
        released = [f for f in facts if f.get("role") not in ("original", "cover", "stem", "subtitles")]
        clipped = sum(int(f.get("clipped_samples", 0)) for f in released)
        if clipped:
            warnings.append(
                f"{clipped} samples above full scale were clipped in FLAC/MP3 (peak "
                f"{max(float(f.get('peak', 0)) for f in released):.3f}); a limiter before the export avoids this"
            )
        # the unmastered take is kept as it was rendered: a render above full scale is normal there
        # and the mastered files are not affected, so it is a note, not a warning
        for f in (f for f in facts if f.get("role") == "original" and f.get("clipped_samples")):
            notes.append(
                f"the unmastered take peaks at {float(f.get('peak', 0)):.3f}: {int(f['clipped_samples'])} samples "
                "above full scale were clipped in its FLAC (the mastered files are not affected)"
            )
        # the stems are taken before mastering: a peak above full scale is normal there, as in the take
        clipped_stems = sum(int(f.get("clipped_samples", 0)) for f in facts if f.get("role") == "stem")
        if clipped_stems:
            notes.append(
                f"{clipped_stems} samples of the stems above full scale were clipped in their FLAC files "
                "(the stems are taken before mastering; the song's files are not affected)"
            )
        if wav and any(metadata.get(k) for k in ("album_artist", "composer")):
            warnings.append("WAV files cannot hold album artist and composer tags")
        converted = {f["converted_from_rate"] for f in facts if f.get("converted_from_rate")}
        if converted:
            notes.append(
                f"MP3 written at {', '.join(str(f['sample_rate']) for f in facts if f.get('converted_from_rate'))} Hz "
                f"(MP3 cannot hold {', '.join(map(str, sorted(converted)))} Hz); FLAC and WAV keep the rate"
            )
        summary = Report(
            "export",
            Status.WARNING if warnings else Status.OK,
            f"Exported {len(written)} file(s) to {folder or 'output'}",
            (*relative_names, *notes, *warnings),
            {"files": facts, "record": str(record_path.relative_to(base))},
        )
        level = loudness[0]
        markdown = "\n".join(
            [
                "**Exported**",
                *[f"- {name}" for name in relative_names],
                *([f"- cover: {cover_path.name}"] if cover_path else []),
                *(
                    [f"- stems: {stems_folder.name}/ ({', '.join(dict.fromkeys(stem_names))})"]
                    if stem_names
                    else []
                ),
                *(
                    [f"- stems as MIDI (experimental): {', '.join(stem_midi_lines)}"]
                    if stem_midi_lines
                    else []
                ),
                f"- record: {record_path.name}"
                + (" (also inside the FLAC: File > Continue a Plenio song... opens it)" if carriers else ""),
                *(
                    [f"- song page: {page_path.name} - the lyrics, prompts and settings to read and copy"]
                    if page_path
                    else []
                ),
                *(
                    [f"- sheet music: {notation[0]['file']} - an open ComfyUI page draws and saves it"]
                    if notation
                    else []
                ),
                *subtitle_lines,
                f"- {took}",
                (
                    f"- loudness: {level['integrated_lufs']} LUFS, true peak {level['true_peak_dbtp']} dBTP"
                    if level["valid"]
                    else "- loudness: not measurable (silent or too short)"
                ),
                # the stars it measured, and the measures that cost the most - where to listen first
                *(
                    [f"- stars: {summary_line(record['quality'])}"]
                    if (record.get("quality") or {}).get("stars") is not None
                    else []
                ),
                *([f"- licence: {x}" for x in licences]),
                *([f"- {n}" for n in notes]),
                *([f"- warning: {w}" for w in warnings]),
            ]
        )
        audio_files = [p for p in written if p.suffix in (".flac", ".mp3", ".wav")]
        return io.NodeOutput(
            "\n".join(str(p) for p in written),
            str(record_path),
            ui={
                "plenio_summary": [{"status": summary.status.value, "markdown": markdown}],
                "plenio_notation": notation,
                # the record, for the node's "Open in the Plenio Player" button
                "plenio_player": [{"record": str(record_path)}],
                "audio": [
                    {
                        "filename": Path(p).name,
                        "subfolder": str(Path(p).parent.relative_to(base)),
                        "type": "output",
                    }
                    for p in audio_files[:1]
                ],
            },
        )


def _song_tempo(values: dict[str, str], sheet: dict[str, Any]) -> tuple[float, tuple[int, int]]:
    """The song's tempo and meter for the stems' MIDI files: the score's, else the brief's tempo, else 120 BPM
    in 4/4."""
    meter = (4, 4)
    if str(sheet.get("score") or "").strip():
        try:
            score = canonical.from_abc(sheet["score"])
            return float(score.tempo), score.meters[0]
        except PlenioError:
            pass
    for key in ("bpm", "tempo"):
        try:
            tempo = float(str(values.get(key) or "").split()[0])
        except (ValueError, IndexError):
            continue
        if 20 <= tempo <= 400:
            return tempo, meter
    return 120.0, meter


def asr_language(brief: Any, lyrics: str) -> str:
    """The language the ASR is told: the brief's, else the lyrics' (English or German), else detected."""
    for candidate in (str(getattr(brief, "language", "") or ""), syllables.guess_language(lyrics)):
        if not candidate.strip():
            continue
        if candidate.strip().lower().startswith("deutsch"):
            return "de"
        try:
            return language_code(candidate)
        except PlenioUserError:
            continue
    return ""


def vocal_stem(samples: Any, rate: int) -> tuple[Any | None, str]:
    """The take's vocals for the lyrics ASR - or ``None`` and why (no separation model, the separation failed)."""
    path = host.locate_model(AUDIO_MODEL_FOLDERS["separation"], SEPARATION)
    if path is None:
        return None, f"the separation model is not installed ({SEPARATION} in models/audio_separation)"
    host.raise_if_interrupted()
    try:
        engine = audio_models.load("separation", SEPARATION, path).engine
        if hasattr(engine, "chunk_frames") and hasattr(engine, "overlap_frames"):
            engine = replace(engine, overlap_frames=int(engine.chunk_frames) // TIMING_OVERLAP)
        stems = engine.separate(samples, rate)
    except PlenioCancelledError:
        raise
    except (
        Exception
    ) as error:  # the times then come from the song: a failed separation never stops the export
        LOG.warning("Export Release: the vocal stem for the lyrics failed: %s", error)
        return None, f"the separation failed ({error})"
    vocals = stems.get("vocals")
    return (vocals, "") if vocals is not None else (None, "the separation gave no vocal stem")


def _subtitles(
    samples: Any,
    rate: int,
    sheet: dict[str, Any],
    spans: list[list[int]],
    brief: Any,
    notes: list[str],
    *,
    on_stem: bool = False,
    clock: StepClock | None = None,
) -> tuple[subtitle_rules.Subtitles | None, subtitle_rules.SungLyrics | None, str, str]:
    """The lyrics subtitles of one take, timed by listening, what it sings as heard (with lyrics), and what was
    heard - the take's vocal stem (``on_stem``, when it can be separated) or the song - or ``None`` and why
    (nothing to subtitle, or no ASR - noted)."""
    lyrics = str(sheet.get("lyrics") or "")
    if getattr(brief, "instrumental", False) or (lyrics.strip() and not subtitle_rules.sung_lines(lyrics)):
        return None, None, "an instrumental: no words", ""
    audio = host.make_audio([samples], rate)
    heard_from = TIMING_SONG
    if on_stem:
        if clock:
            clock.lap("lyrics timing")
        vocals, why = vocal_stem(samples, rate)
        if clock:
            clock.lap("vocal stem")
        if vocals is None:
            notes.append(f"subtitles: heard on the song - {why}")
        else:
            audio, heard_from = host.make_audio([vocals], rate), TIMING_STEM
    settings = AsrSettings(language=asr_language(brief, lyrics))
    progress = host.Progress()
    try:
        result = run_asr(audio, settings, host.audio_sha256(audio), progress)
    except PlenioCancelledError:
        host.raise_if_interrupted()
        raise
    except PlenioError as error:
        notes.append(f"subtitles: not written - the lyrics ASR could not run ({error.message})")
        return None, None, f"the lyrics ASR could not run: {error.message}", ""
    finally:
        progress.update(1.0)
    if clock:
        clock.lap("lyrics ASR")
        clock.hearing += float(getattr(result, "seconds", 0.0) or 0.0)
    weak = weak_segments(result)
    words = [w for w in result.words if w.segment not in weak]
    seconds = samples.shape[1] / rate
    if result.settings.get("engine_note"):
        notes.append(f"subtitles: {result.settings['engine_note']}")
    timing = subtitle_rules.timing_for(result.engine)
    if not lyrics.strip():
        timed = subtitle_rules.time_heard(words, duration=seconds, timing=timing)
        if not timed.lines:
            notes.append("subtitles: not written - no lyrics given and no singing heard")
            return None, None, "no lyrics given and no singing heard", ""
        return timed, None, "", heard_from
    # lyrics in Latin letters for a language with a script of its own (Hinglish): heard in that script
    words, romanized = romanize.in_lyrics_script(lyrics, words)
    if romanized:
        notes.append(
            f"subtitles: heard in {romanize.script(' '.join(w.word for w in result.words))}, compared in Latin letters"
        )
    score = layout = None
    if str(sheet.get("score") or "").strip():
        try:
            score = canonical.from_abc(sheet["score"])
            layout = lyric_layout.layout(score, lyrics, spans or None)
        except PlenioError:
            score = layout = None
    return (
        subtitle_rules.time_lyrics(
            lyrics, words, duration=seconds, score=score, layout=layout, timing=timing, romanized=romanized
        ),
        subtitle_rules.time_sung(lyrics, words, duration=seconds, timing=timing, romanized=romanized),
        "",
        heard_from,
    )


def _subtitle_notes(timed: subtitle_rules.Subtitles, take: str) -> list[str]:
    where = f" ({take.strip()})" if take else ""
    found: list[str] = []
    if timed.timing == "heard":
        found.append(f"subtitles{where}: no lyrics given - the words as heard")
    elif timed.matched < LOW_MATCH:
        found.append(
            f"subtitles{where}: only {timed.matched:.0%} of the lyrics' words were heard - check the times "
            "(the song may not sing its lyrics as written)"
        )
    if timed.untimed:
        shown = "; ".join(repr(line) for line in timed.untimed[:3]) + (
            " ..." if len(timed.untimed) > 3 else ""
        )
        found.append(f"subtitles{where}: {len(timed.untimed)} line(s) not heard, left out: {shown}")
    return found


def _md5(path: Path) -> dict[str, str]:
    """``audio_md5`` of a FLAC file (the MD5 of its decoded audio, as its encoder wrote it), when it has one."""
    if path.suffix != ".flac":
        return {}
    digest = audio_md5(path.read_bytes())
    return {"audio_md5": digest} if digest else {}


def loaded_file(prompt: Any) -> str:
    """The file name of the one native Load Audio node in the executed graph."""
    names = [
        str(node.get("inputs", {}).get("audio"))
        for node in (prompt or {}).values()
        if isinstance(node, dict) and node.get("class_type") == "LoadAudio"
    ]
    if len(names) != 1:
        raise PlenioUserError(
            f"'copy from loaded file' needs exactly one Load Audio node in the workflow, found {len(names)}.",
            hint="Choose 'tags' and type the tags instead.",
        )
    return names[0]


def expand_tags(fields: dict[str, Any], values: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    """The tag fields with their variables: the tags that are variables themselves (artist, album ...) first,
    from the song's variables; the others then with those too. Unknown names stay as written (notes)."""
    expanded: dict[str, str] = {}
    unknown: set[str] = set()
    for field in sorted(EXTRA_TAGS, key=lambda f: f not in variables.TAG_VARIABLES):
        scope = values if field in variables.TAG_VARIABLES else {**values, **expanded}
        text, missing = variables.expand(str(fields.get(field) or ""), scope)
        unknown.update(missing)
        expanded[field] = text.strip()
    notes = [variables.unknown_message("A connected tag field", sorted(unknown))] if unknown else []
    return {field: expanded[field] for field in EXTRA_TAGS if expanded[field]}, notes


def _metadata(
    tags: dict[str, Any],
    title: str | None,
    cover: Any,
    prompt: Any = None,
    values: dict[str, str] | None = None,
) -> tuple[dict[str, str], bytes | None, list[str]]:
    """Tags, the cover JPEG and notes. Precedence: the title input > copied or typed tags; the cover input > copied
    cover; a Song Sheet's lyrics > the copied lyrics tag. Typed or connected tags take the variables ``values``
    (``{title}`` is the title input's)."""
    mode = str(tags.get("tags", "title only"))
    if mode not in TAG_MODES:
        raise PlenioUserError(f"Unknown tag mode {mode!r}; use one of {list(TAG_MODES)}.")
    metadata: dict[str, str] = {}
    picture: bytes | None = None
    notes: list[str] = []
    if mode == "tags":
        scope = {**(values or {}), "title": (title or "").strip() or "Untitled"}
        metadata, notes = expand_tags(tags, scope)
    elif mode == "copy from loaded file":
        source = host.input_file(loaded_file(prompt))
        metadata, picture = read_tags(source)
        metadata.setdefault("title", source.stem)
        notes.append(f"tags copied from {source.name}")
        # the lyrics of a Song Sheet (heard and corrected in Enhance & Master) win over the file's own tag
        lyrics = str((values or {}).get("lyrics") or "").strip()
        if lyrics:
            metadata["lyrics"] = lyrics
            notes.append("lyrics tag: the Song Sheet's lyrics")
    if title and title.strip():
        metadata["title"] = title.strip()
    if cover is not None:
        picture = cover_jpeg(host.image_array(cover))
    return metadata, picture, notes
