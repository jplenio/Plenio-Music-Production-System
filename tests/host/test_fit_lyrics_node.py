"""Fit Lyrics in a real ComfyUI server: three rounds with a writer between them, as in the Write Song block.

The writer is a fake OpenAI-compatible app in the test process whose answers the test queues. Checked:
lyrics that fit never reach the writer (the lazy answer); a failing line goes back once, the answer is
merged and the third round asks nothing; a writer that cannot help is asked twice, then the last step
shortens what it can and the report warns; a song's lyrics pass through.
"""

from __future__ import annotations

import json
import shutil
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

from harness import PACKAGE_NAME, ComfyServer, copy_package

pytestmark = pytest.mark.host
HERE = Path(__file__).resolve().parent
# two sections, one phrase of 28 notes each
SCORE = (HERE.parents[0] / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
ASKED: list[dict[str, Any]] = []
ANSWERS: list[str] = []
MODEL = "Fake app · served-model"
VERSE = "I walk along the river where the water meets the evening light and every stone remembers me"
CHORUS = "Hold on to the night and never let it go, the stars are burning bright above the road we know"
SHORT = "Hold on tonight"


class _App(BaseHTTPRequestHandler):
    def log_message(self, *args: Any) -> None:
        return

    def _send(self, data: dict[str, Any]) -> None:
        raw = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self) -> None:  # noqa: N802
        self._send({"data": [{"id": "served-model"}]})

    def do_POST(self) -> None:  # noqa: N802
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        ASKED.append(body)
        text = ANSWERS.pop(0) if ANSWERS else ""
        self._send({"choices": [{"finish_reason": "stop", "message": {"content": text}}]})


@pytest.fixture(scope="module")
def server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    app = ThreadingHTTPServer(("127.0.0.1", 0), _App)
    threading.Thread(target=app.serve_forever, daemon=True).start()
    base = tmp_path_factory.mktemp("comfy-fit-lyrics")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    shutil.copytree(
        HERE / "plenio_test_nodes",
        base / "custom_nodes" / "plenio_test_nodes",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    (base / "user" / "plenio").mkdir(parents=True)
    (base / "user" / "plenio" / "config.toml").write_text(
        f'[llm.servers]\n"Fake app" = "http://127.0.0.1:{app.server_address[1]}/v1"\n', encoding="utf-8"
    )
    comfy = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME, "plenio_test_nodes"])
    comfy.start()
    yield comfy
    comfy.stop()
    app.shutdown()
    app.server_close()


def cover_brief() -> dict[str, Any]:
    return {
        "class_type": "PlenioCoverBrief",
        "inputs": {
            "mode": "one cover, stop to review",
            "template": "none",
            "description": "",
            "genre": "folk",
            "mood": "",
            "vocals": "new lyrics",
            "vocals.language": "English",
            "vocals.voice": "",
            "vocals.theme": "a river at night",
            "vocals.phrasing_reference": False,
            "harmony": "keep original chords",
            "title": "",
            "arrangement": "off",
            "song_flow_closeness": 60,
            "lyrics_closeness": 0,
        },
    }


def song_brief() -> dict[str, Any]:
    return {
        "class_type": "PlenioSongBrief",
        "inputs": {
            "mode": "one song, stop to review",
            "template": "none",
            "description": "A song about rain",
            "genre": "indie pop",
            "mood": "",
            "tempo": "",
            "length": "short (about 1:30)",
            "vocals": "sung",
            "vocals.language": "English",
            "vocals.voice": "",
            "vocals.theme": "",
            "key": "",
            "meter": "",
        },
    }


def writer(prompt: tuple[str, int], schema: tuple[str, int], seed: int) -> dict[str, Any]:
    return {
        "class_type": "PlenioLocalLLM",
        "inputs": {
            "prompt": list(prompt),
            "schema": list(schema),
            "model": MODEL,
            "seed": seed,
            "max_tokens": 512,
            "temperature": 0.7,
            "thinking": False,
            "context": 4096,
            "keep_loaded": False,
            "system_prompt": "",
            "reuse_answers": False,
        },
    }


def graph(brief: dict[str, Any], lyrics: str, seed: int = 0) -> dict[str, Any]:
    """Lyrics -> Fit Lyrics -> writer -> Fit Lyrics -> writer -> Fit Lyrics (last), as in Write Song."""

    def fit(
        lyrics: list[Any], state: list[Any] | None, answer: list[Any] | None, last: bool
    ) -> dict[str, Any]:
        inputs: dict[str, Any] = {"lyrics": lyrics, "brief": ["1", 0], "score": ["2", 0], "last": last}
        if state is not None:
            inputs["state"] = state
            inputs["answer"] = answer
        return {"class_type": "PlenioFitLyrics", "inputs": inputs}

    return {
        "1": brief,
        "2": {"class_type": "PrimitiveStringMultiline", "inputs": {"value": SCORE}},
        "3": {"class_type": "PrimitiveStringMultiline", "inputs": {"value": lyrics}},
        "4": fit(["3", 0], None, None, False),
        "5": writer(("4", 1), ("4", 2), seed),
        "6": fit(["4", 0], ["4", 3], ["5", 0], False),
        "7": writer(("6", 1), ("6", 2), seed),
        "8": fit(["6", 0], ["6", 3], ["7", 0], True),
        "9": {"class_type": "PlenioTestSink", "inputs": {"value": ["8", 0], "label": "lyrics"}},
    }


def summary(entry: dict[str, Any], node: str) -> str:
    return str(entry["outputs"][node]["plenio_summary"][0]["markdown"])


def test_lyrics_that_fit_never_reach_the_writer(server: ComfyServer) -> None:
    ASKED.clear()
    lyrics = f"[Verse]\n{VERSE}\n\n[Chorus]\n{CHORUS}"
    entry = server.run(graph(cover_brief(), lyrics, seed=1))
    assert entry["outputs"]["9"]["received"] == [lyrics]
    assert ASKED == [] and {"5", "7"}.isdisjoint(entry["outputs"])
    assert "2 of 2 line(s) fit the melody" in summary(entry, "8")


def test_a_failing_line_goes_back_once_and_is_merged(server: ComfyServer) -> None:
    ASKED.clear()
    ANSWERS[:] = [json.dumps({"2-1": {"syllables": CHORUS.split(), "text": CHORUS}})]
    entry = server.run(graph(cover_brief(), f"[Verse]\n{VERSE}\n\n[Chorus]\n{SHORT}", seed=2))
    assert entry["outputs"]["9"]["received"] == [f"[Verse]\n{VERSE}\n\n[Chorus]\n{CHORUS}"]
    assert len(ASKED) == 1 and "7" not in entry["outputs"]  # the second repair writer never ran
    request = ASKED[0]
    assert request["response_format"]["type"] == "json_schema"
    content = request["messages"][-1]["content"]
    assert f'"2-1": section 2 [Chorus] line 1, "{SHORT}" - 4 syllables, its phrase has 28 notes' in content
    slot = request["response_format"]["json_schema"]["schema"]["properties"]["2-1"]["properties"]["syllables"]
    assert (slot["minItems"], slot["maxItems"]) == (21, 28)  # the writer cannot write fewer or more
    assert "Theme: a river at night" in content
    assert "2 of 2 line(s) fit the melody (draft: 1 of 2)" in summary(entry, "8")


def test_a_writer_that_cannot_help_is_asked_twice_then_the_lyrics_stay(server: ComfyServer) -> None:
    ASKED.clear()
    ANSWERS[:] = ["I cannot count syllables.", "Neither can I."]
    lyrics = f"[Verse]\n{VERSE}\n\n[Chorus]\n{SHORT}"
    entry = server.run(graph(cover_brief(), lyrics, seed=3))
    assert entry["outputs"]["9"]["received"] == [lyrics]
    assert len(ASKED) == 2
    assert entry["outputs"]["8"]["plenio_summary"][0]["status"] == "warning"
    assert "the rest is sung as it is" in summary(entry, "8")


def test_a_songs_lyrics_pass_through(server: ComfyServer) -> None:
    ASKED.clear()
    lyrics = f"[Verse]\n{SHORT}"
    entry = server.run(graph(song_brief(), lyrics, seed=4))
    assert entry["outputs"]["9"]["received"] == [lyrics] and ASKED == []
    assert "Lyrics fit skipped" in summary(entry, "8")
