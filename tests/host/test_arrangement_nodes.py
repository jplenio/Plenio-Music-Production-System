"""Compose Arrangement, a writer and Apply Arrangement in a real ComfyUI server.

The writer is a fake OpenAI-compatible app in the test process (configured in config.toml) whose answer
the test chooses: a good plan, garbage, or nothing at all (it must not be asked). Checked: arrangement off
and a cover kept at its original song flow never reach the writer (the lazy answer); a plan becomes a
valid score with its report; garbage keeps the score as it was and says so; the same request is answered
from Plenio's answer cache; the Song Sheet shows the arrangement and warns about a fallback.
"""

from __future__ import annotations

import json
import re
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
SCORE = (HERE.parents[0] / "fixtures" / "abc" / "upstream-score.abc").read_text(encoding="utf-8")
ASKED: list[dict[str, Any]] = []
ANSWER: dict[str, str] = {"text": ""}
QUEUE: list[str] = []
"""Answers in order (the re-ask round's tests); empty: every request gets ``ANSWER``."""
MODEL = "Fake app · served-model"


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
        text = QUEUE.pop(0) if QUEUE else ANSWER["text"]
        self._send({"choices": [{"finish_reason": "stop", "message": {"content": text}}]})


GOOD_PLAN = json.dumps(
    {
        "idea": "a calm verse, a lifted chorus",
        "tempo_change": 0,
        "sections": [
            {"section": 1, "chords": "keep", "lead": "pad", "energy": 2, "key_shift": 0},
            {"section": 2, "chords": ["C", "F", "G7", "C"], "lead": "arpeggio", "energy": 4, "key_shift": 2},
        ],
    }
)


@pytest.fixture(scope="module")
def server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    app = ThreadingHTTPServer(("127.0.0.1", 0), _App)
    threading.Thread(target=app.serve_forever, daemon=True).start()
    base = tmp_path_factory.mktemp("comfy-arrangement")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    shutil.copytree(
        HERE / "plenio_test_nodes",
        base / "custom_nodes" / "plenio_test_nodes",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    (base / "user" / "plenio" / "arrangement").mkdir(parents=True)
    (base / "user" / "plenio" / "arrangement" / "calm.md").write_text(
        "---\norder: 15\nlead: keep, pad\n---\n## Arranger\nCalm and slow.\n", encoding="utf-8"
    )
    (base / "user" / "plenio" / "config.toml").write_text(
        f'[llm.servers]\n"Fake app" = "http://127.0.0.1:{app.server_address[1]}/v1"\n', encoding="utf-8"
    )
    comfy = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME, "plenio_test_nodes"])
    comfy.start()
    yield comfy
    comfy.stop()
    app.shutdown()
    app.server_close()


def song_brief(arrangement: str, closeness: int = 60, under: bool = False) -> dict[str, Any]:
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
            "arrangement": arrangement,
            "genre_closeness": closeness,
            "lines_under_singing": under,
        },
    }


def cover_brief(arrangement: str, closeness: int) -> dict[str, Any]:
    return {
        "class_type": "PlenioCoverBrief",
        "inputs": {
            "mode": "one cover, stop to review",
            "template": "none",
            "description": "",
            "genre": "jazz",
            "mood": "",
            "vocals": "original lyrics",
            "vocals.language": "",
            "vocals.voice": "",
            "harmony": "keep original chords",
            "title": "",
            "arrangement": arrangement,
            "song_flow_closeness": closeness,
            "lyrics_closeness": 0,
        },
    }


def graph(brief: dict[str, Any], *, seed: int = 0, sheet: bool = False) -> dict[str, Any]:
    """Brief -> Compose Arrangement -> Local LLM (schema) -> Apply Arrangement [-> Song Sheet]."""
    prompt: dict[str, Any] = {
        "1": brief,
        "2": {"class_type": "PrimitiveStringMultiline", "inputs": {"value": SCORE}},
        "3": {"class_type": "PlenioTestFakeEngine", "inputs": {}},
        "4": {
            "class_type": "PlenioComposeArrangement",
            "inputs": {"score": ["2", 0], "brief": ["1", 0], "engine": ["3", 0]},
        },
        "5": {
            "class_type": "PlenioLocalLLM",
            "inputs": {
                "prompt": ["4", 0],
                "schema": ["4", 1],
                "model": MODEL,
                "seed": seed,
                "max_tokens": 512,
                "temperature": 0.7,
                "thinking": False,
                "context": 4096,
                "keep_loaded": False,
                "system_prompt": "",
                "reuse_answers": True,
            },
        },
        "6": {
            "class_type": "PlenioApplyArrangement",
            "inputs": {
                "score": ["2", 0],
                "brief": ["1", 0],
                "answer": ["5", 0],
                "engine": ["3", 0],
                "seed": seed,
            },
        },
        "7": {"class_type": "PlenioTestSink", "inputs": {"value": ["6", 0], "label": "score"}},
    }
    if sheet:
        prompt["8"] = {
            "class_type": "PlenioSongSheet",
            "inputs": {
                "score": ["6", 0],
                "arrangement": ["6", 1],
                "brief": ["1", 0],
                "engine": ["3", 0],
                "review": "continue",
                "sheet_state": "",
            },
        }
    return prompt


def summary(entry: dict[str, Any], node: str) -> str:
    return str(entry["outputs"][node]["plenio_summary"][0]["markdown"])


def test_the_mode_list_holds_the_users_modes(server: ComfyServer) -> None:
    info = server.get("/object_info/PlenioSongBrief")["PlenioSongBrief"]
    options = info["input"]["optional"]["arrangement"][1]["options"]
    assert options[:4] == ["off", "standard", "calm", "varied"]


@pytest.mark.parametrize("name", ["off", "simple"])  # "simple": the pre-release name, still accepted
def test_arrangement_off_does_not_ask_the_writer(server: ComfyServer, name: str) -> None:
    ASKED.clear()
    entry = server.run(graph(song_brief(name)))
    assert entry["outputs"]["7"]["received"] == [SCORE]
    assert ASKED == [] and {"4", "5"}.isdisjoint(entry["outputs"])  # neither the prompt nor the writer ran
    assert "skipped" in summary(entry, "6")


def test_a_cover_kept_at_its_song_flow_does_not_ask_the_writer(server: ComfyServer) -> None:
    ASKED.clear()
    entry = server.run(graph(cover_brief("varied", 100)))
    assert entry["outputs"]["7"]["received"] == [SCORE] and ASKED == []
    assert "song flow closeness 100" in summary(entry, "6")


def test_a_plan_is_written_into_the_score(server: ComfyServer) -> None:
    ASKED.clear()
    ANSWER["text"] = f"Sure!\n```json\n{GOOD_PLAN}\n```"
    # the fixture is sung throughout: lines need room under the singing (a fill has none here)
    entry = server.run(graph(song_brief("varied", under=True), seed=11, sheet=True))
    arranged = entry["outputs"]["7"]["received"][0]
    assert arranged != SCORE and "K:D" in arranged  # the chorus lifted a whole tone
    request = ASKED[-1]
    assert request["response_format"]["type"] == "json_schema"  # held to the plan's format
    assert "do not write notes, ABC" in request["messages"][-1]["content"]
    assert request["seed"] == 11
    assert "Arrangement varied" in summary(entry, "6") and "2 of 2 sections arranged" in summary(entry, "6")
    sheet = entry["outputs"]["8"]["plenio_sheet"][0]
    assert sheet["arrangement"]["status"] == "applied" and sheet["arrangement"]["mode"] == "varied"
    assert "arrangement: varied: 2 of 2 sections arranged" in summary(entry, "8")
    assert "harmony check:" in summary(entry, "6") and "0 clash(es) between voice and line" in summary(
        entry, "6"
    )
    assert sheet["arrangement"]["harmony"]["after"]["clashes"] == 0
    # the brief changed, so ComfyUI runs the writer node again - but the request is the same (the slider
    # stayed in its band): Plenio's answer cache answers, the app is not asked
    asked = len(ASKED)
    nudged = server.run(graph(song_brief("varied", closeness=61, under=True), seed=11))
    assert len(ASKED) == asked and "from Plenio's answer cache" in summary(nudged, "5")
    assert nudged["outputs"]["7"]["received"] == [arranged]
    server.run(graph(song_brief("varied", closeness=61, under=True), seed=13))
    assert len(ASKED) == asked + 1  # a new seed: a new answer


def test_garbage_keeps_the_score_and_the_sheet_says_so(server: ComfyServer) -> None:
    ANSWER["text"] = "I would arrange this song with love."
    entry = server.run(graph(song_brief("standard"), seed=12, sheet=True))
    assert entry["outputs"]["7"]["received"] == [SCORE]
    assert "Arrangement not applied" in summary(entry, "6")
    sheet = entry["outputs"]["8"]["plenio_sheet"][0]
    assert sheet["arrangement"]["status"] == "fallback"
    warnings = [f["message"] for f in sheet["findings"] if f["severity"] == "warning"]
    assert any(re.search(r"The arrangement \(standard\) was not applied", w) for w in warnings)


def test_an_unknown_mode_is_named_before_the_run(server: ComfyServer) -> None:
    status, data = server.request("POST", "/prompt", {"prompt": graph(song_brief("baroque"))})
    assert status == 400 and "Unknown creative mode 'baroque'" in json.dumps(data)


def reask_graph(brief: dict[str, Any], seed: int) -> dict[str, Any]:
    """As in the Arrange block: Apply Arrangement -> a second writer on its re-ask -> Apply Arrangement (re-ask)."""
    prompt = graph(brief, seed=seed)
    prompt["9"] = writer_node(["6", 2], ["6", 3], seed)
    prompt["10"] = {
        "class_type": "PlenioApplyArrangement",
        "inputs": {
            "score": ["2", 0],
            "brief": ["1", 0],
            "answer": ["9", 0],
            "engine": ["3", 0],
            "seed": seed,
            "first": ["6", 4],
        },
    }
    prompt["7"]["inputs"]["value"] = ["10", 0]
    return prompt


def writer_node(prompt: list[Any], schema: list[Any], seed: int) -> dict[str, Any]:
    return {
        "class_type": "PlenioLocalLLM",
        "inputs": {
            "prompt": prompt,
            "schema": schema,
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


def section_plan(chords: list[str]) -> str:
    return json.dumps(
        {
            "idea": "new colours",
            "tempo_change": 0,
            "sections": [
                {"section": 1, "chords": chords, "lead": "keep", "energy": 3, "key_shift": 0},
                {"section": 2, "chords": "keep", "lead": "keep", "energy": 3, "key_shift": 0},
            ],
        }
    )


def test_sections_the_guard_repaired_much_go_back_to_the_writer_once(server: ComfyServer) -> None:
    ASKED.clear()
    second = {
        "sections": [
            {"section": 1, "chords": ["Am", "G", "Am", "F"], "lead": "keep", "energy": 3, "key_shift": 0}
        ]
    }
    QUEUE[:] = [section_plan(["Db", "Gb", "Ab", "Eb"]), json.dumps(second)]
    entry = server.run(reask_graph(song_brief("varied"), seed=21))
    assert len(ASKED) == 2
    content = ASKED[1]["messages"][-1]["content"]
    assert "bar 1: Db is not a chord of C" in content and "chords that fit (C major" in content
    assert ASKED[1]["response_format"]["type"] == "json_schema"
    assert entry["outputs"]["7"]["received"] != [SCORE]  # the first plan changed nothing, the second does
    assert "asked again about section(s) 1: the second plan needs fewer repairs" in summary(entry, "10")


def test_a_plan_the_guard_accepts_asks_nothing_more(server: ComfyServer) -> None:
    ASKED.clear()
    QUEUE[:] = [section_plan(["C", "G", "Am", "Dm"])]
    entry = server.run(reask_graph(song_brief("varied"), seed=22))
    assert len(ASKED) == 1 and "9" not in entry["outputs"]
    assert "asked again" not in summary(entry, "10")
