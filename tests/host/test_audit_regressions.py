"""Regression tests for defects found in the Phase 9 audit that need a server of their own.

The server starts with a broken user template and a broken Plenio configuration in its user
directory: Plenio must still register every node, and the System Check must report the problem.
"""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = pytest.mark.host

ALL_NODES = {
    "PlenioSongBrief",
    "PlenioCoverBrief",
    "PlenioEngine",
    "PlenioComposePrompt",
    "PlenioParseDraft",
    "PlenioSongSheet",
    "PlenioScoreTools",
    "PlenioTranscribeScore",
    "PlenioTranscribeLyrics",
    "PlenioVocalCheck",
    "PlenioEQ",
    "PlenioLoudness",
    "PlenioExportRelease",
    "PlenioSystemCheck",
}


@pytest.fixture(scope="module")
def broken_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    base = tmp_path_factory.mktemp("comfy-broken-user")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    plenio = base / "user" / "plenio"
    (plenio / "templates").mkdir(parents=True)
    (plenio / "templates" / "broken.md").write_text(
        "---\nname: Broken\nthis line has no colon\n---\n\nbody\n", encoding="utf-8"
    )
    (plenio / "templates" / "mine.md").write_text("---\nname: Mine\ngenre: folk\n---\n", encoding="utf-8")
    (plenio / "config.toml").write_text("offline = maybe\n", encoding="utf-8")
    server = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME], extra_env={"PLENIO_OFFLINE": "1"})
    server.start()
    yield server
    server.stop()


def test_a_broken_user_template_does_not_stop_plenio_from_loading(broken_server: ComfyServer) -> None:
    """AUD-01: one malformed file in user/plenio/templates made the whole import fail (0 nodes)."""
    info = broken_server.get("/object_info")
    assert ALL_NODES <= set(info)
    templates = info["PlenioSongBrief"]["input"]["required"]["template"]
    options = templates[1]["options"] if isinstance(templates[0], str) else templates[0]
    assert "user/mine" in options and "user/broken" not in options
    listing = broken_server.get("/plenio/templates")
    assert "malformed front matter line" in listing["problems"]["user/broken"]


def test_the_system_check_reports_a_broken_configuration(broken_server: ComfyServer) -> None:
    """AUD-06: an invalid config.toml made the System Check itself fail."""
    data = broken_server.get("/plenio/system")
    assert data["report"]["status"] == "warning"
    assert "Plenio configuration error" in data["markdown"]
    assert "config.toml" in data["markdown"]


@pytest.mark.parametrize(
    ("path", "body", "message"),
    [
        ("/plenio/eq/response", {"settings": "", "sample_rate": "fast"}, "sample_rate"),
        ("/plenio/eq/response", {"settings": "", "sample_rate": 0}, "sample_rate"),
        ("/plenio/eq/response", {"settings": "", "points": 10**9}, "points"),
        ("/plenio/eq/response", {"settings": "", "points": 100.5}, "points"),
        (
            "/plenio/sheet/resolve",
            {"owned": ["lyrics"], "upstream": {}, "max_seconds": "long"},
            "max_seconds",
        ),
        ("/plenio/sheet/resolve", {"owned": ["lyrics"], "upstream": {}, "review": "later"}, "review"),
        ("/plenio/sheet/resolve", {"owned": ["lyrics"], "upstream": {}, "engine": "nope"}, "nope"),
        ("/plenio/sheet/resolve", {"owned": "lyrics", "upstream": {}}, "owned"),
        ("/plenio/lyrics/analyze", {"lyrics": "[Verse]\nla", "engine": "nope"}, "nope"),
        (
            "/plenio/score/transform",
            {"abc": "x", "operation": {"op": "transpose", "semitones": float("inf")}},
            "whole number",
        ),
    ],
)
def test_routes_answer_bad_input_with_400(server: ComfyServer, path: str, body: dict, message: str) -> None:
    """AUD-08: malformed requests ended as 500 (and 'points' was unbounded)."""
    status, answer = server.request("POST", path, body)
    assert status == 400, answer
    assert message in answer["error"]["message"] + str(answer["error"].get("hint"))


def test_tag_copy_accepts_an_annotated_load_audio_value(server: ComfyServer) -> None:
    """AUD-17: 'copy from loaded file' did not resolve Load Audio values like 'x.flac [input]'."""
    import uuid

    import numpy as np

    from plenio.core.release import read_tags, write_audio

    name = f"annotated-{uuid.uuid4().hex[:8]}.flac"
    (server.base / "input").mkdir(exist_ok=True)
    t = np.arange(44100 * 2) / 44100
    write_audio(
        server.base / "input" / name,
        0.1 * np.vstack([np.sin(2 * np.pi * 220 * t)] * 2),
        44100,
        "flac",
        {"title": "Annotated", "artist": "Plenio"},
    )
    folder = f"plenio-audit/{uuid.uuid4().hex[:8]}"
    prompt = {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": f"{name} [input]"}},
        "2": {
            "class_type": "PlenioExportRelease",
            "inputs": {
                "audio": ["1", 0],
                "folder": folder,
                "naming": "{title}",
                "collision": "number",
                "tags": "copy from loaded file",
            },
        },
    }
    server.run(prompt)
    tags, _cover = read_tags(server.output_dir / folder / "Annotated.flac")
    assert tags["artist"] == "Plenio"


def test_a_free_form_length_passes_validation_with_a_note(server: ComfyServer) -> None:
    """A length like '2-3 minutes' (the predecessor toolkit's option, reused from other parameters)
    failed the prompt's validation; it now takes the nearest option and the node says so."""
    prompt = {
        "1": {
            "class_type": "PlenioSongBrief",
            "inputs": {
                "mode": "one song, stop to review",
                "template": "none",
                "description": "A song about rain",
                "genre": "piano pop",
                "mood": "",
                "tempo": "",
                "length": "2-3 minutes",
                "vocals": "sung",
                "vocals.language": "English",
                "vocals.voice": "",
                "vocals.theme": "",
                "key": "",
                "meter": "",
            },
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 1], "label": "brief"}},
    }
    entry = server.run(prompt)
    assert "about 2:30" in entry["outputs"]["2"]["received"][0]
    summary = entry["outputs"]["1"]["plenio_summary"][0]
    assert summary["status"] == "warning" and "2-3 minutes" in summary["markdown"]
