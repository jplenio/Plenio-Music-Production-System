"""Export Release (Phase 3 scope): FLAC 24-bit with collision-safe names and a release record."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from comfy_api.latest import io

from ... import __version__
from ...core.engines import ENGINES
from ...core.errors import PlenioUserError
from ...core.files import atomic_write_text
from ...core.release import (
    RecordInput,
    build_record,
    expand_pattern,
    file_facts,
    naming_values,
    plan_path,
    workflow_licences,
    write_flac,
)
from ...core.reports import Report, Status
from .. import host
from ..types import ReportType

COLLISIONS = ("number", "overwrite", "error")


class PlenioExportRelease(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioExportRelease",
            display_name="Export Release",
            category="Plenio/Release",
            description=(
                "Writes the song as 24-bit FLAC into the ComfyUI output folder, with a release record (JSON) "
                "next to it: documents with hashes, seeds and settings of the executed graph, reports and model "
                "licences. MP3/WAV, tags and cover art follow in a later version."
            ),
            inputs=[
                io.Audio.Input(
                    "audio", tooltip="The finished audio (every item of a batch becomes one file)."
                ),
                io.String.Input("title", force_input=True, tooltip="Song title (from the Song Sheet)."),
                io.Autogrow.Input(
                    "reports",
                    optional=True,
                    template=io.Autogrow.TemplatePrefix(
                        input=ReportType.Input("report", tooltip="A Plenio report to include in the record."),
                        prefix="report_",
                        min=0,
                        max=16,
                    ),
                    tooltip="Reports to include in the release record (Song Sheets, drafts, score tools).",
                ),
                io.String.Input(
                    "folder", default="plenio", tooltip="Sub-folder of the ComfyUI output folder."
                ),
                io.String.Input(
                    "naming",
                    default="{date} {title}",
                    tooltip="File name pattern: {title}, {date}, {time}, {seed}. '/' makes sub-folders.",
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
                io.String.Output(display_name="files", tooltip="Written audio files, one per line."),
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
        title: str,
        folder: str,
        naming: str,
        collision: str = "number",
        reports: dict[str, Any] | None = None,
    ) -> io.NodeOutput:
        base = host.output_directory()
        target_folder = (base / folder.strip().strip("/\\")) if folder.strip() else base
        if base.resolve() not in (target_folder.resolve(), *target_folder.resolve().parents):
            raise PlenioUserError(f"The export folder {folder!r} leaves the ComfyUI output folder.")
        waveform = audio["waveform"]
        rate = int(audio["sample_rate"])
        batch = waveform.detach().cpu().float().numpy()
        received = [r for r in (reports or {}).values() if r is not None]
        report_dicts = [r.to_dict() if isinstance(r, Report) else dict(r) for r in received]
        relative = expand_pattern(naming, naming_values(title, None))
        written, facts = [], []
        for index, samples in enumerate(batch):
            name = relative if len(batch) == 1 else f"{relative} take {index + 1}"
            path = plan_path(target_folder, name, ".flac", collision=collision)
            audio_facts = write_flac(path, samples, rate)
            written.append(path)
            facts.append({**file_facts(path), **audio_facts})
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
                audio={"sample_rate": rate, "items": len(batch)},
                title=title,
                licences=licences,
            )
        )
        record_path = written[0].with_suffix(".plenio.json")
        atomic_write_text(record_path, json.dumps(record, indent=2, ensure_ascii=False))
        relative_names = [str(Path(p).relative_to(base)) for p in written]
        clipped = sum(int(f["clipped_samples"]) for f in facts)
        warnings = (
            [
                f"{clipped} samples above full scale were clipped (peak {max(f['peak'] for f in facts):.3f}); "
                "a limiter before the export avoids this."
            ]
            if clipped
            else []
        )
        summary = Report(
            "export",
            Status.WARNING if warnings else Status.OK,
            f"Exported {len(written)} file(s) to {folder or 'output'}",
            (*relative_names, *warnings),
            {"files": facts, "record": str(record_path.relative_to(base))},
        )
        markdown = "\n".join(
            [
                "**Exported**",
                *[f"- {name}" for name in relative_names],
                f"- record: {record_path.name}",
                *([f"- licence: {x}" for x in licences]),
                *([f"- warning: {w}" for w in warnings]),
            ]
        )
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
                    for p in written
                ],
            },
        )
