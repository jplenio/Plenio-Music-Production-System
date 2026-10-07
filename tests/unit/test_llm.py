"""Local LLMs (``plenio.core.llm``): discovery, the HTTP client and the llama.cpp server runner.

The servers are fakes on 127.0.0.1 (``http.server`` in a thread; a Python script with llama-server's
command line for the runner), so the tests need no model, no GPU and no network.
"""

from __future__ import annotations

import json
import os
import socket
import sys
import threading
from collections.abc import Callable, Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import pytest

from plenio.core import llm
from plenio.core.config import PlenioConfig
from plenio.core.errors import PlenioCancelledError, PlenioUserError, PlenioWorkerError
from plenio.core.llm import catalog, client, runtime

Reply = Callable[[str, dict[str, Any] | None], tuple[int, dict[str, Any]]]


class FakeApp:
    """An HTTP server that records requests and answers with ``reply(path, body)``."""

    def __init__(self, reply: Reply):
        self.requests: list[tuple[str, dict[str, Any] | None, dict[str, str]]] = []
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args: Any) -> None:
                return

            def _answer(self, body: dict[str, Any] | None) -> None:
                outer.requests.append((self.path, body, dict(self.headers)))
                status, data = reply(self.path, body)
                raw = json.dumps(data).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)

            def do_GET(self) -> None:  # noqa: N802
                self._answer(None)

            def do_POST(self) -> None:  # noqa: N802
                self._answer(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))

        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.port = self.httpd.server_address[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def server(self, name: str = "Fake", protocol: str = "openai", **kwargs: Any) -> llm.Server:
        suffix = "" if protocol == "ollama" else "/v1"
        return llm.Server(name, f"http://127.0.0.1:{self.port}{suffix}", protocol=protocol, **kwargs)

    def close(self) -> None:
        self.httpd.shutdown()
        self.httpd.server_close()


@pytest.fixture
def app() -> Iterator[Callable[[Reply], FakeApp]]:
    apps: list[FakeApp] = []

    def start(reply: Reply) -> FakeApp:
        apps.append(FakeApp(reply))
        return apps[-1]

    yield start
    for item in apps:
        item.close()


def completion(content: str, finish: str = "stop", **message: Any) -> dict[str, Any]:
    return {
        "model": "served-name",
        "choices": [{"finish_reason": finish, "message": {"content": content, **message}}],
        "usage": {"prompt_tokens": 11, "completion_tokens": 7},
    }


def closed_port() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return int(probe.getsockname()[1])


# --- answers ----------------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("text", "answer", "thoughts"),
    [
        ("plain", "plain", ""),
        ("<think>plan</think>\nThe song", "The song", "plan"),
        ("plan first</think>The song", "The song", "plan first"),  # the template opened the block
        ("<think>a</think>x<think>b</think>y", "xy", "a\n\nb"),
    ],
)
def test_thoughts_are_split_from_the_answer(text: str, answer: str, thoughts: str) -> None:
    assert llm.split_thinking(text) == (answer, thoughts)


def test_openai_request_and_answer(app: Callable[[Reply], FakeApp]) -> None:
    fake = app(lambda path, body: (200, completion("<think>hm</think>Lyrics", reasoning_content="deep")))
    settings = llm.Settings(max_tokens=99, temperature=0.3, seed=7, system_prompt="Be brief.")
    answer = llm.chat(fake.server(), "my-model", "Write", settings)
    assert (answer.text, answer.thinking) == ("Lyrics", "deep\n\nhm")
    assert (answer.model, answer.prompt_tokens, answer.completion_tokens) == ("served-name", 11, 7)
    path, body, _ = fake.requests[-1]
    assert path == "/v1/chat/completions"
    assert body is not None
    assert body["messages"] == [
        {"role": "system", "content": "Be brief."},
        {"role": "user", "content": "Write"},
    ]
    assert (body["model"], body["max_tokens"], body["temperature"], body["seed"]) == ("my-model", 99, 0.3, 7)
    assert body["chat_template_kwargs"] == {"enable_thinking": False}
    assert "ttl" not in body


def test_lm_studio_unloads_what_it_loaded_for_the_request(app: Callable[[Reply], FakeApp]) -> None:
    fake = app(lambda path, body: (200, completion("ok")))
    llm.chat(fake.server(protocol="lmstudio"), "m", "x", llm.Settings(unload_after=True))
    assert fake.requests[-1][1]["ttl"] == client.LM_STUDIO_TTL_S
    llm.chat(fake.server(protocol="lmstudio"), "m", "x", llm.Settings(unload_after=False))
    assert "ttl" not in fake.requests[-1][1]


def test_ollama_gets_context_and_unload(app: Callable[[Reply], FakeApp]) -> None:
    def reply(path: str, body: dict[str, Any] | None) -> tuple[int, dict[str, Any]]:
        if body and body.get("think") is not None and body["model"] == "plain:latest":
            return 400, {"error": '"plain:latest" does not support thinking'}
        return 200, {
            "model": body["model"] if body else "",
            "message": {"content": "Verse", "thinking": "idea"},
            "done_reason": "stop",
            "eval_count": 5,
        }

    fake = app(reply)
    server = fake.server(protocol="ollama")
    answer = llm.chat(server, "qwen3:8b", "x", llm.Settings(context=6000, max_tokens=300, seed=3))
    body = fake.requests[-1][1]
    assert fake.requests[-1][0] == "/api/chat"
    assert body["options"] == {
        "num_ctx": 6000,
        "num_predict": 300,
        "temperature": 0.8,
        "top_p": 0.95,
        "seed": 3,
    }
    assert (body["think"], body["keep_alive"]) == (False, 0)
    assert (answer.text, answer.thinking, answer.completion_tokens) == ("Verse", "idea", 5)
    # a model without a thinking switch: asked once more without it
    assert llm.chat(server, "plain:latest", "x").text == "Verse"
    assert "think" not in fake.requests[-1][1]


@pytest.mark.parametrize(
    ("reply", "message"),
    [
        (completion("cut", finish="length"), "cut off after"),
        (completion("<think>only thoughts</think>"), r"no text \(only thoughts\)"),
        ({"unexpected": True}, "unknown format"),
    ],
)
def test_unusable_answers_stop_the_run(
    app: Callable[[Reply], FakeApp], reply: dict[str, Any], message: str
) -> None:
    fake = app(lambda path, body: (200, reply))
    with pytest.raises(PlenioUserError, match=message):
        llm.chat(fake.server(), "m", "x")


def test_http_errors_name_the_app_and_the_fix(app: Callable[[Reply], FakeApp]) -> None:
    fake = app(lambda path, body: (404, {"error": {"message": "model 'm' not found"}}))
    with pytest.raises(PlenioUserError) as error:
        llm.chat(fake.server("LM Studio"), "m", "x")
    assert "LM Studio answered HTTP 404: model 'm' not found" in str(error.value)
    assert "refresh" in str(error.value)


def test_an_app_that_is_not_running_gets_its_start_hint() -> None:
    server = llm.Server(
        "Ollama", f"http://127.0.0.1:{closed_port()}", protocol="ollama", start_hint="Run it."
    )
    with pytest.raises(PlenioUserError) as error:
        llm.chat(server, "m", "x")
    assert "Ollama is not reachable" in str(error.value) and "Run it." in str(error.value)


def test_cancel_returns_at_once(app: Callable[[Reply], FakeApp]) -> None:
    gate = threading.Event()

    def slow(path: str, body: dict[str, Any] | None) -> tuple[int, dict[str, Any]]:
        gate.wait(5)
        return 200, completion("late")

    fake = app(slow)
    with pytest.raises(PlenioCancelledError):
        llm.chat(fake.server(), "m", "x", is_cancelled=lambda: True)
    gate.set()


def test_model_lists_leave_out_embedding_models(app: Callable[[Reply], FakeApp]) -> None:
    openai = app(
        lambda path, body: (200, {"data": [{"id": "b-chat"}, {"id": "nomic-embed-text"}, {"id": "A-chat"}]})
    )
    assert client.list_models(openai.server()) == ["A-chat", "b-chat"]
    ollama = app(
        lambda path, body: (200, {"models": [{"name": "llama3.2:latest"}, {"name": "bge-embed:v1"}]})
    )
    assert client.list_models(ollama.server(protocol="ollama")) == ["llama3.2:latest"]


def test_api_key_comes_from_the_named_variable(app: Callable[[Reply], FakeApp]) -> None:
    fake = app(lambda path, body: (200, completion("ok")))
    model = llm.Model("Studio", "m", server=fake.server("Studio", api_key_env="STUDIO_KEY"))
    llm.generate(model, "x", env={"STUDIO_KEY": "secret"})
    assert fake.requests[-1][2]["Authorization"] == "Bearer secret"


# --- folders ----------------------------------------------------------------------------------


def touch(path: Path, size: int = 10) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\0" * size)
    return path


def test_scan_lists_chat_models_only(tmp_path: Path) -> None:
    touch(tmp_path / "b-model.gguf", 5)
    touch(tmp_path / "pub" / "repo" / "A-model-Q4.gguf")
    touch(tmp_path / "pub" / "repo" / "mmproj-F16.gguf")
    touch(tmp_path / "Qwen3-Embedding-0.6B-Q8_0.gguf")
    touch(tmp_path / "big-00001-of-00002.gguf", 3)
    touch(tmp_path / "big-00002-of-00002.gguf", 4)
    touch(tmp_path / "notes.txt")
    touch(tmp_path / ".hidden" / "x.gguf")
    models = catalog.scan(llm.Store("models/LLM", tmp_path))
    assert [(m.name, m.size) for m in models] == [
        ("b-model.gguf", 5),
        ("big-00001-of-00002.gguf", 7),
        ("pub/repo/A-model-Q4.gguf", 10),
    ]
    assert models[0].ref == "models/LLM · b-model.gguf"


def test_broken_links_are_skipped(tmp_path: Path) -> None:
    try:
        os.symlink(tmp_path / "gone.gguf", tmp_path / "link.gguf")
    except (OSError, NotImplementedError):
        pytest.skip("this system does not allow symbolic links")
    assert catalog.scan(llm.Store("x", tmp_path)) == []


def hf_cache(root: Path) -> Path:
    repo = root / "models--unsloth--gemma-4-E2B-it-GGUF"
    touch(repo / "snapshots" / "old" / "gemma-Q4.gguf", 1)
    touch(repo / "snapshots" / "new" / "gemma-Q4.gguf", 2)
    touch(repo / "snapshots" / "new" / "mmproj-F16.gguf")
    (repo / "refs").mkdir()
    (repo / "refs" / "main").write_text("new", encoding="utf-8")
    touch(root / "models--openai--whisper" / "snapshots" / "r" / "model.bin")
    return root


def test_hugging_face_cache_lists_the_main_revision(tmp_path: Path) -> None:
    store = llm.Store("HF cache", hf_cache(tmp_path), hf_cache=True)
    models = catalog.scan(store)
    assert [(m.name, m.size) for m in models] == [("unsloth/gemma-4-E2B-it-GGUF/gemma-Q4.gguf", 2)]
    resolved = llm.resolve(models[0].ref, [store], [])
    assert resolved.path == models[0].path


def test_resolve_files_servers_and_mistakes(tmp_path: Path) -> None:
    touch(tmp_path / "a" / "x.gguf")
    touch(tmp_path / "outside.gguf")
    stores = [llm.Store("models/LLM", tmp_path / "empty"), llm.Store("models/LLM", tmp_path / "a")]
    server = llm.Server("Ollama", "http://127.0.0.1:1", protocol="ollama")
    assert llm.resolve("models/LLM · x.gguf", stores, [server]).path == tmp_path / "a" / "x.gguf"
    assert llm.resolve("Ollama · qwen3:8b", stores, [server]).server == server
    with pytest.raises(PlenioUserError, match="not in models/LLM"):
        llm.resolve("models/LLM · ../outside.gguf", stores, [server])
    with pytest.raises(PlenioUserError, match="neither a model folder nor a known app"):
        llm.resolve("Elsewhere · m", stores, [server])
    with pytest.raises(PlenioUserError, match="not a model reference"):
        llm.resolve(llm.CHOOSE, stores, [server])


def test_discover_folders_first_then_answering_servers(
    tmp_path: Path, app: Callable[[Reply], FakeApp]
) -> None:
    touch(tmp_path / "one" / "same.gguf")
    touch(tmp_path / "two" / "same.gguf")
    touch(tmp_path / "two" / "other.gguf")
    running = app(lambda path, body: (200, {"data": [{"id": "served"}]}))
    locked = app(lambda path, body: (401, {"error": "key required"}))
    stores = [llm.Store("models/LLM", tmp_path / "one"), llm.Store("models/LLM", tmp_path / "two")]
    servers = [
        running.server("LM Studio"),
        locked.server("Studio"),
        llm.Server("Off", f"http://127.0.0.1:{closed_port()}/v1"),
    ]
    found = llm.discover(stores, servers, env={})
    assert [m.ref for m in found.models] == [
        "models/LLM · same.gguf",
        "models/LLM · other.gguf",
        "LM Studio · served",
    ]
    assert found.notes == ("Studio: Studio answered HTTP 401: key required",)


def test_other_apps_folders(tmp_path: Path) -> None:
    home = tmp_path / "home"
    lms = tmp_path / "lms-home"
    (home).mkdir()
    lms.mkdir()
    (home / ".lmstudio-home-pointer").write_text(str(lms), encoding="utf-8")
    downloads = tmp_path / "lm-models"
    downloads.mkdir()
    (lms / "settings.json").write_text(json.dumps({"downloadsFolder": str(downloads)}), encoding="utf-8")
    hf = tmp_path / "hf"
    (hf / "hub").mkdir(parents=True)
    llama = tmp_path / "llama-cache"
    llama.mkdir()
    env = {"HF_HOME": str(hf), "LLAMA_CACHE": str(llama)}
    stores = llm.app_stores(env, home, platform="linux")
    assert [(s.name, s.folder, s.hf_cache) for s in stores] == [
        ("LM Studio files", downloads, False),
        ("HF cache", hf / "hub", True),
        ("llama.cpp cache", llama, False),
    ]


def test_ollama_address_follows_ollama_host() -> None:
    servers = {s.name: s for s in llm.known_servers({"OLLAMA_HOST": "0.0.0.0:11500"})}
    assert servers["Ollama"].url == "http://127.0.0.1:11500"
    assert servers["Ollama"].protocol == "ollama"
    assert servers["LM Studio"].protocol == "lmstudio"


# --- runtimes ---------------------------------------------------------------------------------


def test_runtimes_in_order(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    exe = runtime._exe("llama-server", sys.platform)  # shutil.which needs the .exe on Windows
    configured = touch(tmp_path / "mine" / exe)
    on_path = touch(tmp_path / "bin" / exe)
    os.chmod(on_path, 0o755)
    home = tmp_path / "home"
    unsloth = touch(home / ".unsloth" / "llama.cpp" / "build" / "bin" / exe)
    monkeypatch.setattr(runtime.importlib.util, "find_spec", lambda name: object())
    found = llm.find_runtimes(
        {"PATH": str(tmp_path / "bin")},
        home,
        platform=sys.platform,
        configured=tmp_path / "mine",
        python="py",
    )
    same = os.path.normcase  # shutil.which may answer .EXE for .exe
    assert [(r.name, same(r.command[0])) for r in found] == [
        ("llama-server (configured)", same(str(configured))),
        ("llama-server (PATH)", same(str(on_path))),
        ("llama-server (Unsloth Studio)", same(str(unsloth))),
        ("llama-cpp-python", "py"),
    ]
    assert found[-1].command[1:] == ("-m", "plenio.workers.llama_http")


FAKE_LLAMA_SERVER = r"""
import argparse, json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
parser = argparse.ArgumentParser()
for flag in ("-m", "--host", "-c", "-np"):
    parser.add_argument(flag)
parser.add_argument("--port", type=int)
args = parser.parse_args()
if "broken" in args.m:
    print("error: unknown model architecture 'future'", flush=True)
    sys.exit(3)

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def _send(self, data):
        raw = json.dumps(data).encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)
    def do_GET(self):
        self._send({"status": "ok"})
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        content = "<think>sure</think>%s | ctx=%s np=%s" % (body["messages"][-1]["content"], args.c, args.np)
        self._send({"choices": [{"finish_reason": "stop", "message": {"content": content}}]})

HTTPServer((args.host, args.port), Handler).serve_forever()
"""


@pytest.fixture
def fake_runtime(tmp_path: Path) -> Iterator[llm.Runtime]:
    script = tmp_path / "fake_llama_server.py"
    script.write_text(FAKE_LLAMA_SERVER, encoding="utf-8")
    yield llm.Runtime("fake llama-server", (sys.executable, str(script)))
    runtime.KEPT.release()


def test_a_file_is_served_for_one_answer(tmp_path: Path, fake_runtime: llm.Runtime) -> None:
    model = llm.Model("models/LLM", "tiny.gguf", path=touch(tmp_path / "tiny.gguf", 1000), size=1000)
    room: list[int] = []
    result = llm.generate(
        model, "Hello", llm.Settings(context=4096), runtimes=[fake_runtime], make_room=room.append
    )
    assert (result.answer.text, result.answer.thinking) == ("Hello | ctx=4096 np=1", "sure")
    assert result.runtime == "fake llama-server"
    assert room == [llm.memory_estimate(model, 4096)] and room[0] > 1000
    assert runtime.KEPT.server is None  # stopped: its memory is free again


def test_keep_loaded_reuses_the_server(tmp_path: Path, fake_runtime: llm.Runtime) -> None:
    model = llm.Model("models/LLM", "tiny.gguf", path=touch(tmp_path / "tiny.gguf"), size=10)
    room: list[int] = []
    llm.generate(model, "a", runtimes=[fake_runtime], keep_loaded=True, make_room=room.append)
    kept = runtime.KEPT.server
    assert kept is not None and kept.running
    llm.generate(model, "b", runtimes=[fake_runtime], keep_loaded=True, make_room=room.append)
    assert runtime.KEPT.server is kept and len(room) == 1  # no second start
    llm.generate(model, "c", runtimes=[fake_runtime], keep_loaded=False)
    assert runtime.KEPT.server is None and not kept.running


def test_a_runtime_that_cannot_load_the_file_says_why(tmp_path: Path, fake_runtime: llm.Runtime) -> None:
    model = llm.Model("models/LLM", "broken.gguf", path=touch(tmp_path / "broken.gguf"))
    with pytest.raises(PlenioWorkerError) as error:
        llm.generate(model, "x", runtimes=[fake_runtime])
    assert "unknown model architecture 'future'" in str(error.value)
    assert "update llama.cpp" in str(error.value)


def test_no_runtime_names_the_ways_to_get_one(tmp_path: Path) -> None:
    model = llm.Model("models/LLM", "tiny.gguf", path=touch(tmp_path / "tiny.gguf"))
    with pytest.raises(PlenioWorkerError, match="winget install llama.cpp"):
        llm.generate(model, "x", runtimes=[])


# --- configuration ----------------------------------------------------------------------------


def test_llm_settings_from_file_and_environment(tmp_path: Path) -> None:
    file = tmp_path / "config.toml"
    file.write_text(
        '[llm]\nllama_server = "~/llama/llama-server"\nother_apps = false\n'
        '[llm.folders]\n"My GGUFs" = "~/gguf"\n'
        '[llm.servers]\n"Workstation" = "http://192.168.1.20:1234/v1"\n',
        encoding="utf-8",
    )
    config = PlenioConfig.load(env={}, config_file=file)
    assert config.llama_server == Path("~/llama/llama-server").expanduser()
    assert config.llm_other_apps is False
    assert config.llm_folders == {"My GGUFs": Path("~/gguf").expanduser()}
    assert config.llm_servers == {"Workstation": "http://192.168.1.20:1234/v1"}
    config = PlenioConfig.load(
        env={"PLENIO_LLM_OTHER_APPS": "1", "PLENIO_LLAMA_SERVER": "/opt/ls"}, config_file=file
    )
    assert (config.llm_other_apps, config.llama_server) == (True, Path("/opt/ls"))
    assert config.sources["llm_other_apps"] == "PLENIO_LLM_OTHER_APPS"


@pytest.mark.parametrize(
    "content",
    [
        "[llm]\nother_apps = 'no'\n",
        "[llm]\nservers = 3\n",
        '[llm.servers]\n"A" = "192.168.1.2:1234"\n',
        '[llm.folders]\n"A · B" = "x"\n',
        "[llm]\nmodel = 'x'\n",
    ],
)
def test_invalid_llm_settings_are_errors(tmp_path: Path, content: str) -> None:
    file = tmp_path / "config.toml"
    file.write_text(content, encoding="utf-8")
    with pytest.raises(PlenioUserError, match="llm"):
        PlenioConfig.load(env={}, config_file=file)


def test_system_check_names_the_runtime_or_how_to_get_one() -> None:
    from plenio.core.system import _llm_lines

    assert _llm_lines({}) == []
    facts = {"runtimes": ["llama-server (PATH)"], "models": {"models/LLM": 2, "Ollama": 1}, "files": 2}
    assert _llm_lines(facts) == [
        "Local LLM models: models/LLM: 2, Ollama: 1.",
        "Local LLM runtime for GGUF files: llama-server (PATH).",
    ]
    assert "winget" in _llm_lines({"runtimes": [], "models": {"models/LLM": 1}, "files": 1})[1]
    assert len(_llm_lines({"runtimes": [], "models": {"Ollama": 1}, "files": 0})) == 1  # apps need no runtime
