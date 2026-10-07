"""One text answer from a local LLM server, over plain HTTP (no SDK).

Two wire protocols cover the local apps: OpenAI-compatible chat completions (LM Studio, llama.cpp,
vLLM, Jan, KoboldCpp, text-generation-webui, GPT4All, Unsloth Studio, and the llama.cpp servers Plenio
starts itself) and Ollama's own API, which - unlike its OpenAI endpoint - takes the context length.
A request that ran is never repeated; one the app refused before running it (a JSON schema or a thinking
switch it does not support) is sent again without that part. Errors name the app and what to do.
"""

from __future__ import annotations

import json
import re
import threading
import time
from collections.abc import Callable, Mapping
from dataclasses import dataclass, replace
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import ProxyHandler, Request, build_opener

from ..errors import PlenioCancelledError, PlenioUserError

MAX_RESPONSE_BYTES = 16 * 1024 * 1024
LM_STUDIO_TTL_S = 5
"""Idle seconds after which LM Studio unloads a model it loaded for the request (``unload_after``)."""
_THINK = re.compile(r"<think>(.*?)</think>", re.DOTALL)
# Local and LAN servers: a system proxy (HTTP_PROXY) must not take these requests.
_OPENER = build_opener(ProxyHandler({}))


@dataclass(frozen=True)
class Server:
    """A local app that answers chat requests.

    ``protocol``: ``openai`` (``url`` ends in ``/v1``), ``lmstudio`` (the same plus an idle time to live)
    or ``ollama`` (``url`` is the bare address).
    """

    name: str
    url: str
    protocol: str = "openai"
    api_key_env: str = ""
    """Name of an environment variable that holds the key, for apps that require one (never the key)."""
    start_hint: str = "Start the app's local API server."


@dataclass(frozen=True)
class Settings:
    max_tokens: int = 2048
    temperature: float = 0.8
    top_p: float = 0.95
    seed: int | None = 0
    thinking: bool = False
    """Let a reasoning model think first (its thoughts come back separately)."""
    system_prompt: str = ""
    context: int = 8192
    """Context length in tokens where the request can set it (Ollama); files get it when their server starts."""
    unload_after: bool = True
    """Ask the app to free the model's memory after the answer (Ollama; LM Studio for models it loaded itself)."""
    timeout_s: float = 900.0
    schema: Mapping[str, Any] | None = None
    """A JSON schema for the answer: llama.cpp, LM Studio, Ollama and vLLM hold the model to it (constrained
    decoding), so the answer is always valid JSON of that shape. An app that refuses it is asked without."""


@dataclass(frozen=True)
class Answer:
    text: str
    thinking: str
    model: str
    seconds: float
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    constrained: bool = False
    """The app held the answer to the request's JSON schema."""


class HttpError(PlenioUserError):
    """The app answered with an HTTP error (``code``)."""

    def __init__(self, message: str, *, code: int, hint: str | None = None):
        super().__init__(message, hint=hint, details={"http_status": code})
        self.code = code


def split_thinking(text: str) -> tuple[str, str]:
    """(answer, thoughts) of a text that may carry ``<think>`` blocks; a template that opened the block
    itself leaves only the closing tag."""
    thoughts = [m.strip() for m in _THINK.findall(text)]
    text = _THINK.sub("", text)
    if "</think>" in text:
        head, _, text = text.partition("</think>")
        thoughts.insert(0, head.replace("<think>", "").strip())
    return text.strip(), "\n\n".join(t for t in thoughts if t)


def _error_text(body: bytes) -> str:
    try:
        data = json.loads(body)
    except ValueError:
        return body.decode("utf-8", errors="replace").strip()[:300]
    error = data.get("error", data) if isinstance(data, dict) else data
    if isinstance(error, dict):
        error = error.get("message") or error.get("error") or error
    return str(error)[:300]


def _http(
    server: Server, path: str, payload: dict[str, Any] | None, *, api_key: str = "", timeout: float
) -> dict[str, Any]:
    url = server.url.rstrip("/") + path
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None else None
    request = Request(url, data=data, headers=headers, method="POST" if data is not None else "GET")  # noqa: S310
    try:
        with _OPENER.open(request, timeout=timeout) as response:
            raw = response.read(MAX_RESPONSE_BYTES + 1)
    except HTTPError as error:
        message = _error_text(error.read(4096))
        error.close()
        hint = {
            401: f"{server.name} wants an API key"
            + (f": set {server.api_key_env} before starting ComfyUI." if server.api_key_env else "."),
            403: f"{server.name} refused the request; check its access settings.",
            404: f"{server.name} does not have this model: load or download it there, or press R to refresh the list.",
        }.get(
            error.code,
            f"See {server.name}'s log; a context length too small for the prompt is a common cause.",
        )
        raise HttpError(
            f"{server.name} answered HTTP {error.code}: {message}", code=error.code, hint=hint
        ) from None
    except (TimeoutError, OSError) as error:
        reason = getattr(error, "reason", error)
        if isinstance(error, TimeoutError) or isinstance(reason, TimeoutError):
            raise PlenioUserError(
                f"{server.name} did not answer within {timeout:.0f} s.",
                hint="The model may be too large for this machine, or the app is busy; no retry was made.",
            ) from None
        if isinstance(error, URLError) or isinstance(error, ConnectionError):
            raise PlenioUserError(
                f"{server.name} is not reachable at {server.url}.", hint=server.start_hint
            ) from None
        raise
    if len(raw) > MAX_RESPONSE_BYTES:
        raise PlenioUserError(f"{server.name} sent more than {MAX_RESPONSE_BYTES // 2**20} MB.")
    try:
        result = json.loads(raw)
    except ValueError:
        raise PlenioUserError(
            f"{server.name} did not answer with JSON at {url}.",
            hint="The address must be the app's API base (for OpenAI-compatible apps ending in /v1).",
        ) from None
    if not isinstance(result, dict):
        raise PlenioUserError(f"{server.name} sent an unexpected answer.")
    return result


def list_models(server: Server, *, api_key: str = "", timeout: float = 2.0) -> list[str]:
    """The ids of the chat models the app offers (embedding models left out)."""
    if server.protocol == "ollama":
        items = _http(server, "/api/tags", None, api_key=api_key, timeout=timeout).get("models")
        ids = [item.get("name") for item in items or [] if isinstance(item, dict)]
    else:
        items = _http(server, "/models", None, api_key=api_key, timeout=timeout).get("data")
        ids = [item.get("id") for item in items or [] if isinstance(item, dict)]
    return sorted({i for i in ids if isinstance(i, str) and i and "embed" not in i.lower()}, key=str.casefold)


def _messages(prompt: str, settings: Settings) -> list[dict[str, str]]:
    messages = (
        [{"role": "system", "content": settings.system_prompt}] if settings.system_prompt.strip() else []
    )
    return [*messages, {"role": "user", "content": prompt}]


def _refused_schema(error: HttpError, settings: Settings) -> bool:
    """The app refused the request because of its JSON schema (it was not run)."""
    if settings.schema is None:
        return False
    text = error.message.lower()
    return error.code in (400, 422) or (
        error.code == 500 and any(word in text for word in ("schema", "grammar", "response_format", "format"))
    )


def _openai(server: Server, model: str, prompt: str, settings: Settings, api_key: str) -> Answer:
    try:
        return _openai_once(server, model, prompt, settings, api_key)
    except HttpError as error:
        if not _refused_schema(error, settings):
            raise
        return _openai_once(server, model, prompt, replace(settings, schema=None), api_key)


def _openai_once(server: Server, model: str, prompt: str, settings: Settings, api_key: str) -> Answer:
    payload: dict[str, Any] = {
        "model": model,
        "messages": _messages(prompt, settings),
        "max_tokens": settings.max_tokens,
        "temperature": settings.temperature,
        "top_p": settings.top_p,
        "stream": False,
        # llama.cpp, vLLM and others pass this to the chat template (Qwen, Gemma: thinking on/off)
        "chat_template_kwargs": {"enable_thinking": settings.thinking},
    }
    if settings.seed is not None:
        payload["seed"] = settings.seed
    if server.protocol == "lmstudio" and settings.unload_after:
        payload["ttl"] = LM_STUDIO_TTL_S
    if settings.schema is not None:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {"name": "answer", "strict": True, "schema": dict(settings.schema)},
        }
    start = time.monotonic()
    result = _http(server, "/chat/completions", payload, api_key=api_key, timeout=settings.timeout_s)
    try:
        choice = result["choices"][0]
        message = choice["message"]
        content = message.get("content") or ""
        if isinstance(content, list):  # content parts
            content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
        reasoning = message.get("reasoning_content") or message.get("reasoning") or ""
        finish = choice.get("finish_reason")
    except (KeyError, IndexError, TypeError, AttributeError):
        raise PlenioUserError(f"{server.name} sent a chat answer in an unknown format.") from None
    text, inline = split_thinking(str(content))
    usage: dict[str, Any] = result["usage"] if isinstance(result.get("usage"), dict) else {}
    return _checked(
        server,
        Answer(
            text,
            "\n\n".join(t for t in (str(reasoning).strip(), inline) if t),
            str(result.get("model") or model),
            time.monotonic() - start,
            usage.get("prompt_tokens"),
            usage.get("completion_tokens"),
            settings.schema is not None,
        ),
        finish == "length",
        settings,
    )


def _ollama(server: Server, model: str, prompt: str, settings: Settings, api_key: str) -> Answer:
    options: dict[str, Any] = {
        "num_ctx": settings.context,
        "num_predict": settings.max_tokens,
        "temperature": settings.temperature,
        "top_p": settings.top_p,
    }
    if settings.seed is not None:
        options["seed"] = settings.seed
    payload: dict[str, Any] = {
        "model": model,
        "messages": _messages(prompt, settings),
        "stream": False,
        "think": settings.thinking,
        "options": options,
        "keep_alive": 0 if settings.unload_after else "5m",
    }
    if settings.schema is not None:
        payload["format"] = dict(settings.schema)
    start = time.monotonic()
    result: dict[str, Any] | None = None
    for _attempt in range(3):  # the request was refused, not run: without the part the model does not support
        try:
            result = _http(server, "/api/chat", payload, api_key=api_key, timeout=settings.timeout_s)
            break
        except HttpError as error:
            if "does not support thinking" in error.message and "think" in payload:
                del payload["think"]
            elif "format" in payload and _refused_schema(error, settings):
                del payload["format"]
            else:
                raise
    if result is None:
        raise PlenioUserError(f"{server.name} refused the request.")
    message: dict[str, Any] = result["message"] if isinstance(result.get("message"), dict) else {}
    text, inline = split_thinking(str(message.get("content") or ""))
    thinking = "\n\n".join(t for t in (str(message.get("thinking") or "").strip(), inline) if t)
    answer = Answer(
        text,
        thinking,
        str(result.get("model") or model),
        time.monotonic() - start,
        result.get("prompt_eval_count"),
        result.get("eval_count"),
        "format" in payload,
    )
    return _checked(server, answer, result.get("done_reason") == "length", settings)


def _checked(server: Server, answer: Answer, cut_off: bool, settings: Settings) -> Answer:
    if cut_off:
        raise PlenioUserError(
            f"{server.name}'s answer was cut off after {settings.max_tokens} tokens.",
            hint="Raise max tokens (and the context length), or turn thinking off.",
        )
    if not answer.text:
        raise PlenioUserError(
            f"{server.name} returned no text" + (" (only thoughts)." if answer.thinking else "."),
            hint="Turn thinking off, raise max tokens, or choose an instruction-tuned chat model.",
        )
    return answer


def chat(
    server: Server,
    model: str,
    prompt: str,
    settings: Settings | None = None,
    *,
    api_key: str = "",
    is_cancelled: Callable[[], bool] | None = None,
) -> Answer:
    """Ask ``model`` on ``server`` for one answer to ``prompt``.

    With ``is_cancelled`` the request runs in a helper thread and the call returns as soon as the
    user cancels (``PlenioCancelledError``); the app may still finish the answer in the background.
    """
    settings = settings or Settings()
    call = _ollama if server.protocol == "ollama" else _openai
    if is_cancelled is None:
        return call(server, model, prompt, settings, api_key)
    outcome: dict[str, Any] = {}

    def run() -> None:
        try:
            outcome["answer"] = call(server, model, prompt, settings, api_key)
        except BaseException as error:  # handed to the caller's thread
            outcome["error"] = error

    worker = threading.Thread(target=run, name=f"plenio-llm-{server.name}", daemon=True)
    worker.start()
    while worker.is_alive():
        worker.join(0.1)
        if worker.is_alive() and is_cancelled():
            raise PlenioCancelledError(f"The request to {server.name} was cancelled.")
    if "error" in outcome:
        raise outcome["error"]
    answer: Answer = outcome["answer"]
    return answer
