"""Export Release's sheet music (owner's request 2026-10-08) in a real ComfyUI server.

The export reserves ``<name>.pdf`` next to the audio and hands the browser the notation (with the lyrics)
and a one-time token; the browser's PDF comes back over ``/plenio/export/sheet-music`` and the release
record lists it. The browser part (drawing with abcjs) is covered by the frontend tests and the browser
check; here the PDF is posted the way the page posts it.
"""

from __future__ import annotations

import json
import shutil
import urllib.error
import urllib.request
import uuid
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package
from plenio.core.release import record_fingerprint

pytestmark = pytest.mark.host
SCORE = (Path(__file__).resolve().parents[1] / "fixtures" / "abc" / "upstream-score.abc").read_text(
    encoding="utf-8"
)
LYRICS = (
    "[verse]\nMorning light on the window\nCoffee warm in my hand\n\n"
    "[chorus]\nSing it slow, let it go\nEvery road leads home"
)


@pytest.fixture(scope="module")
def server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    import numpy as np

    from plenio.core.release import write_audio

    base = tmp_path_factory.mktemp("comfy-sheet-music")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    (base / "input").mkdir()
    t = np.arange(44100 * 2) / 44100
    write_audio(
        base / "input" / "take.flac", 0.1 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2), 44100, "flac", {}
    )
    comfy = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME])
    comfy.start()
    yield comfy
    comfy.stop()
    shutil.rmtree(base / "output", ignore_errors=True)


def manual(**docs: str) -> str:
    return json.dumps(
        {
            "schema": "plenio.sheet_state/1",
            "docs": {kind: {"state": "manual", "text": text} for kind, text in docs.items()},
        }
    )


def export(
    server: ComfyServer,
    docs: dict[str, str],
    sheet_music: str = "PDF (A4)",
    workflow: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], Path]:
    folder = f"sheet-music/{uuid.uuid4().hex[:8]}"
    prompt = {
        "1": {
            "class_type": "PlenioSongSheet",
            "inputs": {"review": "continue", "sheet_state": manual(**docs)},
        },
        "2": {"class_type": "LoadAudio", "inputs": {"audio": "take.flac"}},
        "3": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["2", 0],
                "title": ["1", 0],
                "folder": folder,
                "naming": "{title}",
                "collision": "number",
                "tags": "title only",
                "reports.report_0": ["1", 7],
                "sheet_music": sheet_music,
            },
        },
    }
    extra = {"workflow": workflow} if workflow is not None else None
    outputs = server.run(prompt, extra_pnginfo=extra)["outputs"]["3"]
    return outputs, server.output_dir / folder


def pending(server: ComfyServer) -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = server.get("/plenio/export/sheet-music/pending")["jobs"]
    return jobs


def post_pdf(server: ComfyServer, token: str, data: bytes) -> tuple[int, dict[str, Any]]:
    request = urllib.request.Request(
        f"{server.url}/plenio/export/sheet-music?token={token}",
        data=data,
        headers={"Content-Type": "application/pdf"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:  # noqa: S310 - the local test server
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read())


def test_the_export_reserves_the_pdf_and_the_browser_saves_it(server: ComfyServer) -> None:
    outputs, folder = export(server, {"title": "Slow Morning", "lyrics": LYRICS, "score": SCORE})
    job = outputs["plenio_notation"][0]
    assert job["file"] == "Slow Morning.pdf" and job["paper"] == "a4" and job["title"] == "Slow Morning"
    assert job["size"] == "standard"  # a workflow saved before the size existed
    assert "\nw:" in job["display_abc"]  # the notation carries the lyrics
    assert (
        "- sheet music: Slow Morning.pdf - an open ComfyUI page draws and saves it"
        in outputs["plenio_summary"][0]["markdown"]
    )
    # every page asks for the PDFs still waiting: this one until it is saved
    assert [j for j in pending(server) if j["token"] == job["token"]] == [job]
    record_path = folder / "Slow Morning.plenio.json"
    record = json.loads(record_path.read_text(encoding="utf-8"))
    assert record["sheet_music"] == {
        "file": "Slow Morning.pdf",
        "paper": "A4",
        "size": "standard",
        "status": "drawn by the browser after the export",
    }
    assert not (folder / "Slow Morning.pdf").exists()

    assert post_pdf(server, job["token"], b"not a pdf")[0] == 400  # refused, the token stays valid
    status, saved = post_pdf(server, job["token"], b"%PDF-1.4 sheet music")
    assert status == 200 and saved == {"file": "Slow Morning.pdf", "bytes": 20}
    assert (folder / "Slow Morning.pdf").read_bytes() == b"%PDF-1.4 sheet music"
    record = json.loads(record_path.read_text(encoding="utf-8"))
    assert record["sheet_music"]["status"] == "saved"
    assert {"name": "Slow Morning.pdf", "role": "sheet_music"}.items() <= record["files"][-1].items()
    assert record["fingerprint"] == record_fingerprint(record)

    status, refused = post_pdf(server, job["token"], b"%PDF-1.4 again")  # once only
    assert status == 400 and "can no longer be saved" in refused["error"]["message"]
    assert post_pdf(server, "made-up", b"%PDF-1.4")[0] == 400
    assert job["token"] not in {j["token"] for j in pending(server)}


def test_the_lines_placed_by_hand_come_from_the_workflow_the_run_was_queued_with(server: ComfyServer) -> None:
    # the page sends the workflow with the prompt; the Song Sheet keeps the lines placed by hand in its
    # properties, so the export places them itself - the page that draws the PDF may show another workflow
    docs = {"title": "By Hand", "lyrics": LYRICS, "score": SCORE}
    plain, _ = export(server, docs)
    workflow = {
        "nodes": [{"id": 1, "type": "PlenioSongSheet", "properties": {"plenio_lyric_spans": [[0, 64, 0, 0]]}}]
    }
    placed, _ = export(server, docs, workflow=workflow)
    by_hand = placed["plenio_notation"][0]["display_abc"]
    status, view = server.request(
        "POST", "/plenio/score/analyze", {"abc": SCORE, "lyrics": LYRICS, "lyric_spans": [[0, 64, 0, 0]]}
    )
    # (the sheet keeps the score without its last line break)
    assert status == 200 and view["display_abc"].rstrip("\n") == by_hand.rstrip("\n")
    assert by_hand != plain["plenio_notation"][0]["display_abc"]


def test_a_second_export_of_the_title_numbers_the_pdf_with_its_audio(server: ComfyServer) -> None:
    _outputs, folder = export(server, {"title": "Twice", "lyrics": LYRICS, "score": SCORE})
    # the same title again in the same folder: every file of the export takes ' (2)', the PDF too
    second = server.run(
        {
            "1": {
                "class_type": "PlenioSongSheet",
                "inputs": {
                    "review": "continue",
                    "sheet_state": manual(title="Twice", lyrics=LYRICS, score=SCORE),
                },
            },
            "2": {"class_type": "LoadAudio", "inputs": {"audio": "take.flac"}},
            "3": {
                "class_type": "PlenioExportRelease",
                "inputs": {
                    "audio": ["2", 0],
                    "title": ["1", 0],
                    "folder": str(folder.relative_to(server.output_dir)).replace("\\", "/"),
                    "naming": "{title}",
                    "collision": "number",
                    "tags": "title only",
                    "reports.report_0": ["1", 7],
                    "sheet_music": "PDF (Letter)",
                    "sheet_music_size": "compact",
                },
            },
        }
    )["outputs"]["3"]
    job = second["plenio_notation"][0]
    assert job["file"] == "Twice (2).pdf" and job["paper"] == "letter" and job["size"] == "compact"
    assert (folder / "Twice (2).flac").exists()


def test_without_a_score_there_is_no_sheet_music(server: ComfyServer) -> None:
    outputs, _folder = export(server, {"title": "Caption Only", "lyrics": LYRICS})
    assert outputs["plenio_notation"] == []
    assert "sheet music: this release has no score" in outputs["plenio_summary"][0]["markdown"]
    off, _ = export(server, {"title": "Off", "lyrics": LYRICS, "score": SCORE}, sheet_music="off")
    assert off["plenio_notation"] == [] and "sheet music" not in off["plenio_summary"][0]["markdown"]
