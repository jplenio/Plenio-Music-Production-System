"""Export Release's sheet music PDF (owner's request 2026-10-08): the reservation and the release record.

The browser's part (drawing the notation) is tested in the frontend; the round trip through a real
server in ``tests/host/test_sheet_music_export.py``.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.comfy.sheet_music import MAX_PENDING, TOKEN_TTL_S, Jobs, hand_placed
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
    with pytest.raises(PlenioUserError, match="older than 24 hours"):
        jobs.save(token, b"%PDF-1.4", now=100.0 + TOKEN_TTL_S + 1)
    assert not pdf.exists()


def test_a_page_finds_the_pdfs_still_waiting(tmp_path: Path) -> None:
    # a run that ended while no page drew its PDF: the next page that opens asks for it (owner's report
    # 2026-10-09: no PDF when the run ended while another workflow was open)
    jobs = Jobs()
    notation = {"file": "Song.pdf", "title": "Song", "paper": "a4", "size": "standard", "display_abc": "X:1"}
    pdf, record_path = tmp_path / "Song.pdf", tmp_path / "Song.plenio.json"
    record_path.write_text(json.dumps(record({"file": "Song.pdf", "status": "pending"})), encoding="utf-8")
    token = jobs.reserve(pdf, record_path, notation, now=10.0)
    assert jobs.pending(now=11.0) == [{**notation, "token": token}]
    assert jobs.pending(now=10.0 + TOKEN_TTL_S + 1) == []  # too old
    jobs.save(token, b"%PDF-1.4", now=12.0)
    assert jobs.pending(now=13.0) == []  # saved: nothing waits any more


def test_the_oldest_reservations_go_first_when_too_many_wait(tmp_path: Path) -> None:
    jobs = Jobs()
    tokens = [
        jobs.reserve(tmp_path / f"{i}.pdf", tmp_path / f"{i}.json", {"file": f"{i}.pdf"}, now=1.0)
        for i in range(MAX_PENDING + 2)
    ]
    waiting = [job["token"] for job in jobs.pending(now=2.0)]
    assert len(waiting) == MAX_PENDING and waiting == tokens[2:]


def test_the_lines_placed_by_hand_come_from_the_queued_workflow() -> None:
    workflow = {
        "nodes": [
            {
                "id": 7,
                "type": "PlenioSongSheet",
                "properties": {"plenio_lyric_spans": [[0, 8, 1, 0], [8, 16]]},
            },
            {"id": 12, "type": "PlenioSongSheet", "properties": {"plenio_lyric_spans": "broken"}},
            {"id": 5, "type": "uuid-of-a-blueprint", "properties": {}},
        ],
        "definitions": {
            "subgraphs": [
                {
                    "id": "uuid-of-a-blueprint",
                    "nodes": [{"id": 3, "properties": {"plenio_lyric_spans": [[4, 2], [2, 6]]}}],
                }
            ]
        },
    }
    extra = {"workflow": workflow}
    assert hand_placed(extra, ("12", "7")) == [
        [0, 8, 1, 0],
        [8, 16],
    ]  # the score sheet has none: the lyrics sheet's (a span with its line, and one kept by 0.4.4 without)
    assert hand_placed(extra, ("7", "12")) == [[0, 8, 1, 0], [8, 16]]
    assert hand_placed(extra, ("5:3",)) == [[2, 6]]  # a sheet inside a blueprint; a reversed span is left out
    assert hand_placed(extra, ("99", None)) == []
    assert hand_placed(None, ("7",)) == [] and hand_placed({"workflow": "nonsense"}, ("7",)) == []


def test_a_moved_record_does_not_stop_the_pdf(tmp_path: Path) -> None:
    jobs = Jobs()
    token, pdf, record_path = reserve(tmp_path, jobs)
    record_path.unlink()
    assert jobs.save(token, b"%PDF-1.4", now=1.0)["name"] == "Song.pdf"
    assert pdf.exists() and not record_path.exists()
