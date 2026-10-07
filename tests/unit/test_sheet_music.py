"""Export Release's sheet music PDF (owner's request 2026-10-08): the reservation and the release record.

The browser's part (drawing the notation) is tested in the frontend; the round trip through a real
server in ``tests/host/test_sheet_music_export.py``.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.comfy.sheet_music import TOKEN_TTL_S, Jobs
from plenio.core.errors import PlenioUserError
from plenio.core.release import RecordInput, build_record, record_fingerprint, with_sheet_music


def record(sheet_music: dict | None = None) -> dict:
    return build_record(
        RecordInput(
            versions={"plenio": "0"},
            prompt=None,
            reports=[{"data": {"documents": {"score": {"text": "X:1"}}, "node_id": "7"}}],
            files=[{"name": "Song.flac", "bytes": 3, "sha256": "x"}],
            audio={"items": 1},
            title="Song",
            licences=[],
            sheet_music=sheet_music,
        )
    )


def test_the_record_names_the_pdf_and_lists_it_once_saved() -> None:
    plain = record()
    assert "sheet_music" not in plain and plain["fingerprint"] == record_fingerprint(plain)
    pending = record({"file": "Song.pdf", "paper": "A4", "status": "drawn by the browser after the export"})
    assert pending["fingerprint"] != plain["fingerprint"]
    saved = with_sheet_music(pending, {"name": "Song.pdf", "bytes": 9, "sha256": "y"})
    assert saved["sheet_music"] == {"file": "Song.pdf", "paper": "A4", "status": "saved"}
    assert saved["files"][-1] == {"name": "Song.pdf", "bytes": 9, "sha256": "y", "role": "sheet_music"}
    assert saved["fingerprint"] == record_fingerprint(saved) != pending["fingerprint"]
    assert pending["files"] == plain["files"]  # the original is not changed


def reserve(tmp_path: Path, jobs: Jobs, now: float = 0.0) -> tuple[str, Path, Path]:
    pdf, record_path = tmp_path / "Song.pdf", tmp_path / "Song.plenio.json"
    record_path.write_text(
        json.dumps(record({"file": "Song.pdf", "paper": "A4", "status": "pending"})), encoding="utf-8"
    )
    return jobs.reserve(pdf, record_path, now=now), pdf, record_path


def test_a_token_saves_its_pdf_once(tmp_path: Path) -> None:
    jobs = Jobs()
    token, pdf, record_path = reserve(tmp_path, jobs)
    with pytest.raises(PlenioUserError, match="not a PDF"):
        jobs.save(token, b"<html>", now=1.0)
    facts = jobs.save(token, b"%PDF-1.4 notes", now=2.0)  # the refused upload did not use the token up
    assert facts["name"] == "Song.pdf" and pdf.read_bytes() == b"%PDF-1.4 notes"
    saved = json.loads(record_path.read_text(encoding="utf-8"))
    assert saved["sheet_music"]["status"] == "saved" and saved["fingerprint"] == record_fingerprint(saved)
    with pytest.raises(PlenioUserError, match="can no longer be saved"):
        jobs.save(token, b"%PDF-1.4 again", now=3.0)
    with pytest.raises(PlenioUserError, match="can no longer be saved"):
        jobs.save("made-up", b"%PDF-1.4", now=3.0)


def test_a_token_expires(tmp_path: Path) -> None:
    jobs = Jobs()
    token, pdf, _record = reserve(tmp_path, jobs, now=100.0)
    with pytest.raises(PlenioUserError, match="older than 30 minutes"):
        jobs.save(token, b"%PDF-1.4", now=100.0 + TOKEN_TTL_S + 1)
    assert not pdf.exists()


def test_a_moved_record_does_not_stop_the_pdf(tmp_path: Path) -> None:
    jobs = Jobs()
    token, pdf, record_path = reserve(tmp_path, jobs)
    record_path.unlink()
    assert jobs.save(token, b"%PDF-1.4", now=1.0)["name"] == "Song.pdf"
    assert pdf.exists() and not record_path.exists()
