"""S-7: a real take through Master (EQ + Loudness & Dynamics) and Export Release (V3 audio, no model).

Uses the legacy toolkit's MiniMax sample (``PLENIO_LEGACY_SAMPLE``, default: the read-only legacy copy
next to this project) or any audio file given there; the file is copied into the server's input folder.
Needs ``PLENIO_SMOKE=1`` and ``PLENIO_COMFYUI_ROOT``; runs on the CPU in about a minute.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

import pytest

from harness import PROJECT, ComfyServer, Log
from plenio.core.release import read_tags

pytestmark = [pytest.mark.host, pytest.mark.smoke]

SAMPLE = Path(
    os.environ.get("PLENIO_LEGACY_SAMPLE", "")
    or PROJECT.parent
    / "ComfyUI-MiniMax"
    / "assets"
    / "sound-samples"
    / "Example Album - A Feeling With No Address.mp3"
)


def test_real_take_meets_the_targets_through_master_and_export(server: ComfyServer, log: Log) -> None:
    if not SAMPLE.exists():
        pytest.skip(f"sample not found: {SAMPLE} (set PLENIO_LEGACY_SAMPLE)")
    name = "s7-take" + SAMPLE.suffix
    (server.base / "input").mkdir(exist_ok=True)
    shutil.copy2(SAMPLE, server.base / "input" / name)
    folder = "plenio-smoke/master"
    for target, lufs, ceiling in (
        ("Apple Music / podcasts (-16 LUFS, -1 dBTP)", -16.0, -1.0),
        ("loud (-9 LUFS, -0.5 dBTP)", -9.0, -0.5),
    ):
        prompt = {
            "1": {"class_type": "LoadAudio", "inputs": {"audio": name}},
            "2": {
                "class_type": "PlenioEQ",
                "inputs": {
                    "audio": ["1", 0],
                    "mode": "match preset",
                    "mode.preset": "Warm - gentle (workflow default)",
                },
            },
            "3": {
                "class_type": "PlenioLoudness",
                "inputs": {
                    "audio": ["2", 0],
                    "target": target,
                    "compression": "Pop - punchy",
                    "sample_rate": "48000",
                },
            },
            "4": {
                "class_type": "PlenioExportRelease",
                "inputs": {
                    "audio": ["3", 0],
                    "title": f"S7 {lufs:g}",
                    "original": ["1", 0],
                    "folder": folder,
                    "naming": "{title}",
                    "flac": True,
                    "mp3": True,
                    "wav": True,
                    "tags": "copy from loaded file",
                    "collision": "overwrite",
                    "reports.report_0": ["2", 1],
                    "reports.report_1": ["3", 1],
                },
            },
        }
        server.run(prompt, timeout=900)
        base = server.output_dir / folder
        record = json.loads((base / f"S7 {lufs:g}.plenio.json").read_text(encoding="utf-8"))
        level = record["audio"]["loudness"][0]
        loudness = next(r for r in record["reports"] if r["kind"] == "loudness")
        if loudness["data"]["items"][0]["target_reached"]:
            assert level["integrated_lufs"] == pytest.approx(lufs, abs=0.3)
        else:  # the style's limiter budget may stop a loud target; the node then warns
            assert loudness["status"] == "warning" and level["integrated_lufs"] < lufs
        assert level["true_peak_dbtp"] <= ceiling + 0.05
        formats = {f["format"]: f for f in record["files"] if "format" in f and f.get("role") != "original"}
        assert set(formats) == {"flac", "mp3", "wav"} and all(
            f["sample_rate"] == 48000 for f in formats.values()
        )
        assert all(f["clipped_samples"] == 0 for f in formats.values())
        tags, _cover = read_tags(base / f"S7 {lufs:g}.flac")
        assert tags["title"] == f"S7 {lufs:g}"  # the title input wins over the copied title
        assert (base / f"S7 {lufs:g} (original).flac").exists()
