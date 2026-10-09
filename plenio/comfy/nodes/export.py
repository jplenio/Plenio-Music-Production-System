"""Export Release: FLAC 24-bit / MP3 V0 / WAV 32-bit float with tags and cover art, and a release record."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from comfy_api.latest import io

from ... import __version__
from ...core import score as score_rules
from ...core.audio import measure
from ...core.engines import ENGINES
from ...core.errors import PlenioUserError
from ...core.files import atomic_write_bytes, atomic_write_text
from ...core.release import (
    FORMATS,
    TAG_FIELDS,
    RecordInput,
    build_record,
    cover_jpeg,
    embed_cover,
    expand_pattern,
    file_facts,
    naming_values,
    plan_release,
    read_tags,
    workflow_licences,
    write_audio,
)
from ...core.reports import Report, Status
from .. import host
from ..sheet_music import DEFAULT_SIZE, JOBS, OFF, PAPERS, SHEET_MUSIC_OPTIONS, SIZES, hand_placed
from ..types import ReportType

COLLISIONS = ("number", "overwrite", "error")
ORIGINAL_SUFFIX = " (original).flac"
RECORD_SUFFIX = ".plenio.json"
TAG_MODES = ("title only", "tags", "copy from loaded file")
EXTRA_TAGS = tuple(field for field in TAG_FIELDS if field != "title")
# what the *tags* mode writes as the comment unless the user changes it
DEFAULT_COMMENT = "Powered by Plenio Music Production System / ComfyUI"
SHEET_SUFFIX = ".pdf"
SHEET_TOOLTIP = (
    "Also save the sheet music - both voices, chord symbols, sections and the lyrics under the notes - as "
    "'<name>.pdf' next to the audio, on A4 or Letter pages. An open ComfyUI page draws it right after the export "
    "(as Export notation… in the Song Sheet does), whichever workflow it shows, and Plenio saves it; without an "
    "open page, the next page that opens draws it (within a day, while ComfyUI runs). Needs a score (YuE2)."
)
SIZE_TOOLTIP = (
    "How large the sheet music draws the music: standard about 3 bars a line (4 pages for a song of 3-4 "
    "minutes), smaller 3-4 (3 pages), compact about 4 (2-3 pages), large 1-2 bars a line (the biggest notes). "
    "The same sizes as Export notation… in the Song Sheet."
)


def sheet_documents(reports: list[dict[str, Any]]) -> dict[str, Any]:
    """The final score and lyrics of the release (the Song Sheets' reports) and the sheets that hold them."""
    found: dict[str, Any] = {"score": "", "lyrics": "", "score_sheet": None, "lyrics_sheet": None}
    for report in reports:
        data = report.get("data") or {}
        documents = data.get("documents") or {}
        for kind in ("score", "lyrics"):
            doc = documents.get(kind)
            if isinstance(doc, dict) and str(doc.get("text") or "").strip():
                found[kind] = str(doc["text"])
                found[f"{kind}_sheet"] = data.get("node_id")
    return found


def _tag_inputs() -> list[Any]:
    tips = {
        "artist": "The artist, written into the files' tags.",
        "album": "The album, written into the files' tags.",
        "date": "Year or date, e.g. 2026 or 2026-10-09.",
        "track": "Track number, e.g. 3 or 3/12.",
        "genre": "The genre, written into the files' tags.",
        "comment": "The comment tag; empty: none.",
        "album_artist": "The album artist, written into the files' tags.",
        "composer": "The composer, written into the files' tags.",
    }
    defaults = {"comment": DEFAULT_COMMENT}
    return [
        io.String.Input(field, default=defaults.get(field, ""), tooltip=tips[field]) for field in EXTRA_TAGS
    ]


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
                "of the executed graph, reports, loudness and model licences."
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
                    tooltip="File name pattern: {title}, {date}, {time}, {seed}. '/' makes sub-folders.",
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
                    tooltip="Metadata written into the files.",
                ),
                io.Combo.Input(
                    "collision",
                    options=list(COLLISIONS),
                    default="number",
                    advanced=True,
                    tooltip="When the file exists: number (add ' (2)'), overwrite, or stop with an error.",
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
        metadata, picture, notes = _metadata(tags or {"tags": "title only"}, title, cover, cls.hidden.prompt)
        song_title = metadata.get("title") or "Untitled"
        items, rate = host.audio_items(audio)
        received = [r for r in (reports or {}).values() if r is not None]
        report_dicts = [r.to_dict() if isinstance(r, Report) else dict(r) for r in received]
        relative = expand_pattern(naming, naming_values(song_title, None))
        takes = ["" if len(items) == 1 else f" take {index + 1}" for index in range(len(items))]
        sheet = sheet_documents(report_dicts) if sheet_music != OFF else {}
        display = ""
        if sheet_music != OFF:
            if not sheet["score"].strip():
                notes.append(
                    "sheet music: this release has no score (MiniMax Music 3, or planning was off) - no PDF"
                )
            else:
                # the lyrics lines placed by hand on the Song Sheet, from the workflow the run was queued with
                spans = hand_placed(cls.hidden.extra_pnginfo, (sheet["score_sheet"], sheet["lyrics_sheet"]))
                view = score_rules.editor_view(sheet["score"], sheet["lyrics"] or None, spans or None)
                display = str(view.get("display_abc") or "")
                if not display:
                    notes.append("sheet music: the score cannot be drawn as notation - no PDF")
        suffixes = [take + FORMATS[kind]["extension"] for take in takes for kind in kinds]
        suffixes += [ORIGINAL_SUFFIX] * (original is not None) + [".jpg"] * (picture is not None)
        suffixes += [SHEET_SUFFIX] * bool(display)
        # one base name for every file of this export, record included (AUD-04)
        stem = plan_release(target_folder, relative, [*suffixes, RECORD_SUFFIX], collision=collision)

        def file(suffix: str) -> Path:
            return stem.with_name(stem.name + suffix)

        written: list[Path] = []
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
                facts.append({**file_facts(path), **audio_facts})
        if original is not None:
            original_items, original_rate = host.audio_items(original)
            path = file(ORIGINAL_SUFFIX)
            original_facts = write_audio(path, original_items[0], original_rate, "flac", metadata)
            if picture is not None:
                embed_cover(path, picture)
            facts.append({**file_facts(path), **original_facts, "role": "original"})
            written.append(path)
        cover_path = None
        warnings: list[str] = []
        if picture is not None:
            cover_path = file(".jpg")
            atomic_write_bytes(cover_path, picture)
            facts.append({**file_facts(cover_path), "role": "cover"})
        licences = sorted(
            {
                ENGINES[r["data"]["engine"]].LICENCE
                for r in report_dicts
                if r.get("data", {}).get("engine") in ENGINES
            }
            | workflow_licences(cls.hidden.prompt)
        )
        record = build_record(
            RecordInput(
                versions={
                    "plenio": __version__,
                    "comfyui": host.comfyui_version(),
                    "frontend": host.frontend_version(),
                },
                prompt=cls.hidden.prompt,
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
        )
        record_path = file(RECORD_SUFFIX)
        atomic_write_text(record_path, json.dumps(record, indent=2, ensure_ascii=False))
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
        released = [f for f in facts if f.get("role") not in ("original", "cover")]
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
                f"- record: {record_path.name}",
                *(
                    [f"- sheet music: {notation[0]['file']} - an open ComfyUI page draws and saves it"]
                    if notation
                    else []
                ),
                (
                    f"- loudness: {level['integrated_lufs']} LUFS, true peak {level['true_peak_dbtp']} dBTP"
                    if level["valid"]
                    else "- loudness: not measurable (silent or too short)"
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


def _metadata(
    tags: dict[str, Any], title: str | None, cover: Any, prompt: Any = None
) -> tuple[dict[str, str], bytes | None, list[str]]:
    """Tags, the cover JPEG and notes. Precedence: the title input > copied or typed tags; the cover input > copied cover."""
    mode = str(tags.get("tags", "title only"))
    if mode not in TAG_MODES:
        raise PlenioUserError(f"Unknown tag mode {mode!r}; use one of {list(TAG_MODES)}.")
    metadata: dict[str, str] = {}
    picture: bytes | None = None
    notes: list[str] = []
    if mode == "tags":
        metadata = {
            field: str(tags.get(field, "")).strip()
            for field in EXTRA_TAGS
            if str(tags.get(field, "")).strip()
        }
    elif mode == "copy from loaded file":
        source = host.input_file(loaded_file(prompt))
        metadata, picture = read_tags(source)
        metadata.setdefault("title", source.stem)
        notes.append(f"tags copied from {source.name}")
    if title and title.strip():
        metadata["title"] = title.strip()
    if cover is not None:
        picture = cover_jpeg(host.image_array(cover))
    return metadata, picture, notes
