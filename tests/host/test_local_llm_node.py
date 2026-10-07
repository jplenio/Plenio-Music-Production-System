"""Local LLM in a real ComfyUI server: the model list, a server from config.toml, and a GGUF file.

The app is a fake OpenAI-compatible server in the test process; the GGUF is a dummy file, so its run
must stop with a readable error (no runtime on the CI machine; a real llama-server refuses the file).
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
ASKED: list[dict[str, Any]] = []


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
        content = f"<think>plan</think>Answer to: {body['messages'][-1]['content']}"
        self._send({"choices": [{"finish_reason": "stop", "message": {"content": content}}]})


@pytest.fixture(scope="module")
def llm_server(tmp_path_factory: pytest.TempPathFactory, comfy_path: Path) -> Iterator[ComfyServer]:
    app = ThreadingHTTPServer(("127.0.0.1", 0), _App)
    threading.Thread(target=app.serve_forever, daemon=True).start()
    base = tmp_path_factory.mktemp("comfy-llm")
    (base / "custom_nodes").mkdir()
    copy_package(base / "custom_nodes")
    shutil.copytree(
        HERE / "plenio_test_nodes",
        base / "custom_nodes" / "plenio_test_nodes",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    (base / "models" / "LLM" / "sub").mkdir(parents=True)
    (base / "models" / "LLM" / "sub" / "tiny-Q4.gguf").write_bytes(b"GGUF not really")
    (base / "models" / "LLM" / "mmproj-F16.gguf").write_bytes(b"")
    (base / "user" / "plenio").mkdir(parents=True)
    (base / "user" / "plenio" / "config.toml").write_text(
        f'[llm.servers]\n"Fake app" = "http://127.0.0.1:{app.server_address[1]}/v1"\n', encoding="utf-8"
    )
    server = ComfyServer(comfy_path, base, node_packs=[PACKAGE_NAME, "plenio_test_nodes"])
    server.start()
    yield server
    server.stop()
    app.shutdown()
    app.server_close()


def prompt(model: str, text: str = "Hello") -> dict[str, Any]:
    return {
        "1": {
            "class_type": "PlenioLocalLLM",
            "inputs": {
                "prompt": text,
                "model": model,
                "seed": 5,
                "max_tokens": 64,
                "temperature": 0.0,
                "thinking": False,
                "context": 2048,
                "keep_loaded": False,
                "system_prompt": "",
            },
        },
        "2": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 0], "label": "text"}},
        "3": {"class_type": "PlenioTestSink", "inputs": {"value": ["1", 1], "label": "thinking"}},
    }


def test_the_list_holds_files_and_configured_servers(llm_server: ComfyServer) -> None:
    info = llm_server.get("/object_info/PlenioLocalLLM")["PlenioLocalLLM"]
    options = info["input"]["required"]["model"][1]["options"]
    assert options == ["models/LLM · sub/tiny-Q4.gguf", "Fake app · served-model"]


def test_an_app_model_answers(llm_server: ComfyServer) -> None:
    entry = llm_server.run(prompt("Fake app · served-model", "Write a line"))
    outputs = entry["outputs"]
    assert {node: outputs[node]["received"][0] for node in ("2", "3")} == {
        "2": "Answer to: Write a line",
        "3": "plan",
    }
    assert "answered by Fake app" in outputs["1"]["plenio_summary"][0]["markdown"]
    asked = ASKED[-1]
    assert (asked["model"], asked["seed"], asked["max_tokens"]) == ("served-model", 5, 64)
    assert asked["chat_template_kwargs"] == {"enable_thinking": False}


def test_a_file_that_cannot_run_stops_with_a_message(llm_server: ComfyServer) -> None:
    error = llm_server.run_expect_error(prompt("models/LLM · sub/tiny-Q4.gguf"))
    assert "tiny-Q4.gguf" in error["exception_message"]


def test_a_model_of_another_machine_is_reported_at_run_time(llm_server: ComfyServer) -> None:
    error = llm_server.run_expect_error(prompt("models/LLM · elsewhere.gguf"))
    assert "is not in models/LLM" in error["exception_message"]
    status, data = llm_server.request("POST", "/prompt", {"prompt": prompt("(choose a model)")})
    assert status == 400 and "choose a model" in json.dumps(data)
