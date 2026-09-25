"""Serialised data contracts match their pinned JSON Schemas."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from plenio.core.hashing import sha256_text
from plenio.core.reports import Report, Status
from plenio.core.sheet import DocEntry, DocState, SheetState

jsonschema = pytest.importorskip("jsonschema")
SCHEMAS = Path(__file__).resolve().parents[2] / "resources" / "schemas"


def schema(name: str) -> dict[str, Any]:
    data: dict[str, Any] = json.loads((SCHEMAS / name).read_text(encoding="utf-8"))
    jsonschema.Draft202012Validator.check_schema(data)
    return data


def test_report_matches_schema() -> None:
    report = Report("demo", Status.SKIPPED, "Nothing to do.", ("m",), {"x": [1, 2]}).with_source(
        "PlenioX", "3"
    )
    jsonschema.validate(report.to_dict(), schema("report-1.schema.json"))


def test_sheet_state_matches_schema() -> None:
    state = SheetState(
        docs={
            "lyrics": DocEntry(DocState.EDITED, "[Verse]\nmine", sha256_text("draft")),
            "score": DocEntry(DocState.MANUAL, "X:1"),
            "style": DocEntry(),
        },
        approved_fingerprint=sha256_text("fingerprint"),
    )
    jsonschema.validate(json.loads(state.to_json()), schema("sheet_state-1.schema.json"))
    jsonschema.validate(json.loads(SheetState().to_json()), schema("sheet_state-1.schema.json"))


def test_release_record_matches_schema(tmp_path: Path) -> None:
    """The record next to every exported song (Phase 10 review: it was the one listed contract not pinned)."""
    import numpy as np

    from plenio.core.audio.loudness import measure
    from plenio.core.engines import yue2
    from plenio.core.release import RecordInput, build_record, file_facts, write_audio
    from plenio.core.sheet import evaluate_sheet

    sheet = evaluate_sheet(
        SheetState(docs={"lyrics": DocEntry(DocState.MANUAL, "[Verse]\nNeon fades along the lane")}),
        {"title": "Neon", "style": "English, warm piano pop, female voice, 88 BPM", "lyrics": "[Verse]\nla"},
        ["title", "style", "lyrics"],
        rules=yue2,
        engine_id="yue2",
    )
    t = np.arange(96000) / 48000
    take = 0.2 * np.vstack([np.sin(2 * np.pi * 330 * t)] * 2)
    files = []
    for kind in ("flac", "mp3", "wav"):
        path = tmp_path / f"Neon.{kind}"
        audio_facts = write_audio(path, take, 96000, kind, {"title": "Neon"})
        files.append({**file_facts(path), **audio_facts})
    cover = tmp_path / "Neon.jpg"
    cover.write_bytes(b"\xff\xd8\xff\xd9")
    files.append({**file_facts(cover), "role": "cover"})
    report = sheet.report().with_source("PlenioSongSheet", "9").to_dict()
    record = build_record(
        RecordInput(
            versions={"plenio": "0.1.0", "comfyui": "0.37.0", "frontend": "1.53.6"},
            prompt={
                "9": {"class_type": "PlenioSongSheet", "inputs": {"review": "continue"}, "is_changed": [1]}
            },
            reports=[report],
            files=files,
            audio={
                "sample_rate": 96000,
                "items": 1,
                "seconds": 2.0,
                "loudness": [measure(take, 96000).to_dict(), measure(0 * take, 96000).to_dict()],
                "tags": {"title": "Neon"},
            },
            title="Neon",
            licences=[yue2.LICENCE],
        )
    )
    data = json.loads(json.dumps(record, allow_nan=False))
    jsonschema.validate(data, schema("record-1.schema.json"))
    for entry in data["reports"]:
        jsonschema.validate(entry, schema("report-1.schema.json"))
    assert (
        data["documents"]["lyrics"]["state"] == "manual" and data["files"][1]["converted_from_rate"] == 96000
    )


def test_schema_ids_carry_the_code_versions() -> None:
    from plenio.core.release import RECORD_SCHEMA
    from plenio.core.reports import REPORT_SCHEMA
    from plenio.core.sheet import SHEET_STATE_SCHEMA

    assert schema("report-1.schema.json")["$id"] == REPORT_SCHEMA
    assert schema("sheet_state-1.schema.json")["$id"] == SHEET_STATE_SCHEMA
    assert schema("record-1.schema.json")["$id"] == RECORD_SCHEMA
