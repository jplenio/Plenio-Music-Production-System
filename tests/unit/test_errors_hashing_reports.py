import math

import pytest

from plenio.core.errors import (
    PlenioConflictError,
    PlenioDependencyError,
    PlenioError,
    PlenioUserError,
    PlenioValidationError,
)
from plenio.core.hashing import canonical_json, sha256_json, sha256_text
from plenio.core.reports import REPORT_SCHEMA, Report, Status, worst


def test_error_message_includes_hint() -> None:
    error = PlenioError("Something broke.", hint="Do this.")
    assert str(error) == "Something broke.\nHow to fix: Do this."
    assert str(PlenioError("No hint.")) == "No hint."


def test_validation_error_lists_diagnostics() -> None:
    error = PlenioValidationError(
        "Style is invalid.",
        diagnostics=[{"severity": "error", "message": "too long", "where": "style"}],
        hint="Shorten it.",
    )
    text = str(error)
    assert "- error: [style] too long" in text
    assert text.endswith("How to fix: Shorten it.")
    assert isinstance(error, PlenioUserError)


def test_dependency_error_names_install_command() -> None:
    error = PlenioDependencyError("mutagen", feature="Tag writing", install="python -m pip install mutagen")
    assert "Tag writing needs the Python package 'mutagen'" in str(error)
    assert "python -m pip install mutagen" in str(error)


def test_conflict_error_offers_the_three_choices() -> None:
    error = PlenioConflictError("Lyrics are stale.", documents=["lyrics"])
    assert error.documents == ["lyrics"]
    for choice in PlenioConflictError.CHOICES:
        assert choice in str(error)


def test_canonical_json_is_order_independent_and_keeps_unicode() -> None:
    assert canonical_json({"b": 1, "a": "Grün"}) == '{"a":"Grün","b":1}'
    assert sha256_json({"a": 1, "b": 2}) == sha256_json({"b": 2, "a": 1})
    assert sha256_text("x") == "2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881"


def test_canonical_json_rejects_nan_and_objects() -> None:
    with pytest.raises(ValueError):
        canonical_json({"x": math.nan})
    with pytest.raises(TypeError):
        canonical_json({"x": object()})


def test_report_round_trip() -> None:
    report = Report("demo", Status.WARNING, "Half done.", ("one", "two"), {"n": 1}).with_source(
        "PlenioX", "7"
    )
    data = report.to_dict()
    assert data["schema"] == REPORT_SCHEMA
    assert data["source"] == {"node_type": "PlenioX", "node_id": "7"}
    assert Report.from_dict(data) == report


def test_report_rejects_unknown_schema_and_non_json_data() -> None:
    with pytest.raises(PlenioUserError):
        Report.from_dict({"schema": "plenio.report/9", "kind": "x", "status": "ok"})
    with pytest.raises(TypeError):
        Report("demo", Status.OK, "x", data={"bad": object()})


def test_worst_status() -> None:
    assert worst([]) is Status.OK
    assert worst([Status.OK, Status.SKIPPED, Status.WARNING]) is Status.WARNING
    assert worst([Status.WARNING, Status.ERROR, Status.OK]) is Status.ERROR
