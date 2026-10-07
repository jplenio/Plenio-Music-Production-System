"""A minimal OpenAI-compatible server for one GGUF file with llama-cpp-python.

Run as ``python -m plenio.workers.llama_http -m <file.gguf> --host 127.0.0.1 --port <port> -c <context>``
- the same command line as llama.cpp's ``llama-server``, so ``plenio.core.llm.runtime`` treats both
alike. It is the fallback when no ``llama-server`` program is installed but llama-cpp-python is.
Endpoints: ``GET /health`` (503 while the model loads), ``GET /v1/models``, ``POST /v1/chat/completions``
(no streaming; an OpenAI ``response_format`` with a JSON schema becomes llama-cpp-python's grammar). One
request at a time; the process ends when Plenio stops it.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

_state: dict[str, Any] = {"llama": None}
_lock = threading.Lock()
_ACCEPTED = ("max_tokens", "temperature", "top_p", "top_k", "min_p", "seed", "stop", "repeat_penalty")


def response_format(request: dict[str, Any]) -> dict[str, Any] | None:
    """llama-cpp-python's form of an OpenAI ``response_format`` (``json_schema`` or ``json_object``)."""
    wanted = request.get("response_format")
    if not isinstance(wanted, dict):
        return None
    if wanted.get("type") == "json_schema":
        schema = (wanted.get("json_schema") or {}).get("schema")
        return (
            {"type": "json_object", "schema": schema} if isinstance(schema, dict) else {"type": "json_object"}
        )
    if wanted.get("type") == "json_object":
        return {
            "type": "json_object",
            **({"schema": wanted["schema"]} if isinstance(wanted.get("schema"), dict) else {}),
        }
    return None


def _load(model: Path, context: int) -> None:
    try:
        from llama_cpp import Llama

        _state["llama"] = Llama(model_path=str(model), n_ctx=context, n_gpu_layers=-1, verbose=False)
    except Exception as error:  # the parent sees the exit and shows this line from the log
        sys.stderr.write(f"llama_http: loading {model} failed: {type(error).__name__}: {error}\n")
        sys.stderr.flush()
        os._exit(1)


class _Handler(BaseHTTPRequestHandler):
    model_name = "model"

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002 - BaseHTTPRequestHandler's name
        return

    def _send(self, status: int, data: dict[str, Any]) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - http.server's naming
        if self.path == "/health":
            if _state["llama"] is None:
                self._send(503, {"error": {"message": "Loading model"}})
            else:
                self._send(200, {"status": "ok"})
        elif self.path == "/v1/models":
            self._send(200, {"object": "list", "data": [{"id": self.model_name, "object": "model"}]})
        else:
            self._send(404, {"error": {"message": f"unknown path {self.path}"}})

    def do_POST(self) -> None:  # noqa: N802 - http.server's naming
        if self.path != "/v1/chat/completions":
            self._send(404, {"error": {"message": f"unknown path {self.path}"}})
            return
        llama = _state["llama"]
        if llama is None:
            self._send(503, {"error": {"message": "Loading model"}})
            return
        try:
            request = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
            options = {name: request[name] for name in _ACCEPTED if name in request}
            constrained = response_format(request)
            if constrained is not None:
                options["response_format"] = constrained
            # the GGUF's own chat template; llama-cpp-python takes no template switches (thinking on/off)
            with _lock:
                result = llama.create_chat_completion(messages=request["messages"], **options)
            self._send(200, result)
        except Exception as error:  # the client shows the message
            self._send(500, {"error": {"message": f"{type(error).__name__}: {error}"}})


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Plenio's llama-cpp-python server")
    parser.add_argument("-m", "--model", required=True, type=Path)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("-c", "--ctx-size", type=int, default=8192)
    parser.add_argument("-np", "--parallel", type=int, default=1)  # accepted for llama-server parity
    args = parser.parse_args(argv)
    _Handler.model_name = args.model.name
    threading.Thread(target=_load, args=(args.model, args.ctx_size), daemon=True).start()
    ThreadingHTTPServer((args.host, args.port), _Handler).serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
