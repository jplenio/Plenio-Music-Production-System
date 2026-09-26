"""Export Release: FLAC 24-bit / MP3 V0 / WAV 32-bit float with tags and cover art, and a release record."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from comfy_api.latest import io

from ... import __version__
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
from ..types import ReportType

COLLISIONS = ("number", "overwrite", "error")
ORIGINAL_SUFFIX = " (original).flac"
RECORD_SUFFIX = ".plenio.json"
TAG_MODES = ("title only", "tags", "copy from loaded file")
EXTRA_TAGS = tuple(field for field in TAG_FIELDS if field != "title")


def _tag_inputs() -> list[Any]:
    tips = {
        "artist": "Artist",
        "album": "Album",
        "date": "Year or date",
        "track": "Track number (for example 3 or 3/12)",
        "genre": "Genre",
        "comment": "Comment",
        "album_artist": "Album artist",
        "composer": "Composer",
    }
    return [io.String.Input(field, default="", tooltip=tips[field]) for field in EXTRA_TAGS]


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
    ) -> io.NodeOutput:
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
        suffixes = [take + FORMATS[kind]["extension"] for take in takes for kind in kinds]
        suffixes += [ORIGINAL_SUFFIX] * (original is not None) + [".jpg"] * (picture is not None)
        # one base name for every file of this export, record included (AUD-04)
        stem = plan_release(target_folder, relative, [*suffixes, RECORD_SUFFIX], collision=collision)

        def file(suffix: str) -> Path:
            return stem.with_name(stem.name + suffix)

        written: list[Path] = []
        facts: list[dict[str, Any]] = []
        loudness: list[dict[str, Any]] = []
        embedded = True
        for take, samples in zip(takes, items, strict=True):
            loudness.append(measure(samples, rate, cancel=host.raise_if_interrupted).to_dict())
            for kind in kinds:
                path = file(take + FORMATS[kind]["extension"])
                audio_facts = write_audio(path, samples, rate, kind, metadata)
                if picture is not None and kind != "wav":
                    embedded = embed_cover(path, picture) and embedded
                written.append(path)
                facts.append({**file_facts(path), **audio_facts})
        if original is not None:
            original_items, original_rate = host.audio_items(original)
            path = file(ORIGINAL_SUFFIX)
            original_facts = write_audio(path, original_items[0], original_rate, "flac", metadata)
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
            )
        )
        record_path = file(RECORD_SUFFIX)
        atomic_write_text(record_path, json.dumps(record, indent=2, ensure_ascii=False))
        relative_names = [str(Path(p).relative_to(base)) for p in written]
        clipped = sum(int(f.get("clipped_samples", 0)) for f in facts)
        if clipped:
            warnings.append(
                f"{clipped} samples above full scale were clipped in FLAC/MP3 (peak "
                f"{max(float(f.get('peak', 0)) for f in facts):.3f}); a limiter before the export avoids this"
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
