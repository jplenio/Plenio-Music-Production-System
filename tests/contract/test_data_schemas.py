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


def test_schema_ids_carry_the_code_versions() -> None:
    from plenio.core.reports import REPORT_SCHEMA
    from plenio.core.sheet import SHEET_STATE_SCHEMA

    assert schema("report-1.schema.json")["$id"] == REPORT_SCHEMA
    assert schema("sheet_state-1.schema.json")["$id"] == SHEET_STATE_SCHEMA
