"""Where the local language models are: GGUF files in folders and the servers of local LLM apps.

A model is addressed by one string, its *reference* ``"<source> · <name>"``:

* a GGUF file - ``"models/LLM · Qwen3.5-9B-Q4_K_M.gguf"`` (the folder's label and the path below it),
  run by a llama.cpp server that Plenio starts for the call (``runtime.py``);
* a model of a running app - ``"Ollama · llama3.2:latest"`` (the app and its model id).

The reference is what a workflow saves, so it stays the same on every machine that has the file or
the app. Everything here is plain standard library and knows nothing about songs, so the module serves
any text-generation need.
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections.abc import Iterable, Iterator, Mapping, Sequence
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from ..errors import PlenioUserError
from .client import Server, list_models

SEPARATOR = " · "
CHOOSE = "(choose a model)"
"""The model list's placeholder: shown when nothing was found, and the value of a new Write Song block."""
GGUF = ".gguf"
MAX_DEPTH = 5
"""Folder levels searched below a store (LM Studio: publisher/repository/file)."""
_SHARD = re.compile(r"-(\d{5})-of-(\d{5})\.gguf$", re.IGNORECASE)
_NOT_A_CHAT_MODEL = ("mmproj", "projector", "vision-encoder", "vision_encoder", "embedding", "rerank")


@dataclass(frozen=True)
class Store:
    """A folder with GGUF files; ``hf_cache`` marks the Hugging Face hub cache layout."""

    name: str
    folder: Path
    hf_cache: bool = False


@dataclass(frozen=True)
class Model:
    source: str
    name: str
    path: Path | None = None
    """The GGUF file (first shard of a split model); ``None`` for a model served by an app."""
    server: Server | None = None
    size: int | None = None
    """Bytes on disk (all shards), when known."""

    @property
    def ref(self) -> str:
        return f"{self.source}{SEPARATOR}{self.name}"


@dataclass(frozen=True)
class Discovery:
    models: tuple[Model, ...]
    notes: tuple[str, ...] = field(default=())
    """What was found but cannot be listed (an app that needs a key, a folder that cannot be read)."""


def _ollama_url(env: Mapping[str, str]) -> str:
    host = env.get("OLLAMA_HOST", "").strip() or "127.0.0.1:11434"
    if "://" not in host:
        host = "http://" + host
    return host.rstrip("/").replace("://0.0.0.0", "://127.0.0.1")


def known_servers(env: Mapping[str, str]) -> tuple[Server, ...]:
    """The local LLM apps with an API, at their default addresses (Ollama honours ``OLLAMA_HOST``)."""
    return (
        Server(
            "LM Studio",
            "http://127.0.0.1:1234/v1",
            protocol="lmstudio",
            start_hint="Start LM Studio's local server (Developer > Start server, or `lms server start`).",
        ),
        Server(
            "Ollama",
            _ollama_url(env),
            protocol="ollama",
            start_hint="Start Ollama (the app or `ollama serve`).",
        ),
        Server("llama.cpp", "http://127.0.0.1:8080/v1", start_hint="Start `llama-server -m <model.gguf>`."),
        Server("vLLM", "http://127.0.0.1:8000/v1", start_hint="Start `vllm serve <model>`."),
        Server(
            "Jan",
            "http://127.0.0.1:1337/v1",
            start_hint="Start Jan's local API server (Settings > Local API Server).",
        ),
        Server("KoboldCpp", "http://127.0.0.1:5001/v1", start_hint="Start KoboldCpp with a model."),
        Server(
            "text-generation-webui",
            "http://127.0.0.1:5000/v1",
            start_hint="Start text-generation-webui with --api.",
        ),
        Server(
            "GPT4All", "http://127.0.0.1:4891/v1", start_hint="Turn on GPT4All's local API server (Settings)."
        ),
        Server(
            "Unsloth Studio",
            "http://127.0.0.1:8888/v1",
            api_key_env="UNSLOTH_API_KEY",
            start_hint="Start Unsloth Studio and set UNSLOTH_API_KEY before starting ComfyUI.",
        ),
    )


def _lm_studio_home(home: Path) -> Path:
    pointer = home / ".lmstudio-home-pointer"
    try:
        target = pointer.read_text(encoding="utf-8").strip()
    except OSError:
        target = ""
    if target and Path(target).is_dir():
        return Path(target)
    for candidate in (home / ".lmstudio", home / ".cache" / "lm-studio"):
        if candidate.is_dir():
            return candidate
    return home / ".lmstudio"


def _lm_studio_models(home: Path) -> Path:
    lms = _lm_studio_home(home)
    try:
        settings = json.loads((lms / "settings.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        settings = {}
    folder = settings.get("downloadsFolder") if isinstance(settings, dict) else None
    return Path(folder) if isinstance(folder, str) and folder else lms / "models"


def app_stores(env: Mapping[str, str], home: Path, platform: str = sys.platform) -> tuple[Store, ...]:
    """The GGUF folders of other apps that exist on this machine.

    LM Studio's download folder, the Hugging Face cache (Unsloth Studio and ``llama-server -hf`` download
    there too), llama.cpp's own cache and GPT4All's model folder.
    """
    local = Path(env["LOCALAPPDATA"]) if env.get("LOCALAPPDATA") else home / "AppData" / "Local"
    if env.get("HF_HUB_CACHE"):
        hf = Path(env["HF_HUB_CACHE"])
    elif env.get("HF_HOME"):
        hf = Path(env["HF_HOME"]) / "hub"
    else:
        hf = home / ".cache" / "huggingface" / "hub"
    if env.get("LLAMA_CACHE"):
        llama = Path(env["LLAMA_CACHE"])
    elif platform == "win32":
        llama = local / "llama.cpp"
    elif platform == "darwin":
        llama = home / "Library" / "Caches" / "llama.cpp"
    else:
        llama = Path(env.get("XDG_CACHE_HOME") or home / ".cache") / "llama.cpp"
    if platform == "win32":
        gpt4all = local / "nomic.ai" / "GPT4All"
    elif platform == "darwin":
        gpt4all = home / "Library" / "Application Support" / "nomic.ai" / "GPT4All"
    else:
        gpt4all = home / ".local" / "share" / "nomic.ai" / "GPT4All"
    candidates = (
        Store("LM Studio files", _lm_studio_models(home)),
        Store("HF cache", hf, hf_cache=True),
        Store("llama.cpp cache", llama),
        Store("GPT4All files", gpt4all),
    )
    return tuple(store for store in candidates if store.folder.is_dir())


def is_chat_model_file(name: str) -> bool:
    """A GGUF that holds a chat model: not a vision projector or an embedding model, not a later shard."""
    lower = name.lower()
    if not lower.endswith(GGUF) or any(marker in lower for marker in _NOT_A_CHAT_MODEL):
        return False
    shard = _SHARD.search(name)
    return shard is None or int(shard.group(1)) == 1


def _size(path: Path) -> int | None:
    """Bytes of the file, of all shards for the first shard of a split model."""
    try:
        shard = _SHARD.search(path.name)
        if shard is None:
            return path.stat().st_size
        total = int(shard.group(2))
        stem = path.name[: shard.start()]
        return sum(
            (path.parent / f"{stem}-{i:05d}-of-{total:05d}{GGUF}").stat().st_size for i in range(1, total + 1)
        )
    except OSError:
        return None


def _walk(folder: Path, depth: int = MAX_DEPTH) -> Iterator[Path]:
    """GGUF files below ``folder`` (symbolic links followed, hidden folders skipped)."""
    try:
        entries = sorted(os.scandir(folder), key=lambda entry: entry.name.casefold())
    except OSError:
        return
    for entry in entries:
        if entry.name.startswith("."):
            continue
        try:
            if entry.is_dir():
                if depth > 0:
                    yield from _walk(Path(entry.path), depth - 1)
            elif is_chat_model_file(entry.name) and entry.is_file():  # a broken link is no file
                yield Path(entry.path)
        except OSError:
            continue


def _snapshot(repo: Path) -> Path | None:
    """The snapshot a Hugging Face cache repository resolves to: ``refs/main``, else the newest one."""
    snapshots = repo / "snapshots"
    try:
        revision = (repo / "refs" / "main").read_text(encoding="utf-8").strip()
    except OSError:
        revision = ""
    if revision and (snapshots / revision).is_dir():
        return snapshots / revision
    try:
        folders = [p for p in snapshots.iterdir() if p.is_dir()]
        return max(folders, key=lambda p: p.stat().st_mtime) if folders else None
    except OSError:  # a snapshot removed while the cache is read
        return None


def _hf_repo_folder(name: str) -> tuple[str, str] | None:
    """``"org/repo/file.gguf"`` -> (``"models--org--repo"``, ``"file.gguf"``)."""
    parts = name.split("/")
    if len(parts) < 3:
        return None
    return f"models--{parts[0]}--{parts[1]}", "/".join(parts[2:])


def scan(store: Store) -> list[Model]:
    """The chat-model GGUFs of one folder, by name."""
    if not store.hf_cache:
        return [
            Model(store.name, path.relative_to(store.folder).as_posix(), path=path, size=_size(path))
            for path in _walk(store.folder)
        ]
    models = []
    try:
        repos = sorted(p for p in store.folder.iterdir() if p.name.startswith("models--"))
    except OSError:
        return []
    for repo in repos:
        snapshot = _snapshot(repo)
        if snapshot is None:
            continue
        prefix = "/".join(repo.name.split("--")[1:3])
        for path in _walk(snapshot):
            name = f"{prefix}/{path.relative_to(snapshot).as_posix()}"
            models.append(Model(store.name, name, path=path, size=_size(path)))
    return models


def _probe(server: Server, env: Mapping[str, str], timeout: float) -> tuple[list[Model], str]:
    key = env.get(server.api_key_env, "") if server.api_key_env else ""
    try:
        ids = list_models(server, api_key=key, timeout=timeout)
    except PlenioUserError as error:
        # an app that answers but refuses (a key is needed) is worth a note; one that is not running is not
        return [], (f"{server.name}: {error.message}" if "HTTP" in error.message else "")
    return [Model(server.name, model_id, server=server) for model_id in ids], ""


def discover(
    stores: Sequence[Store],
    servers: Sequence[Server],
    *,
    env: Mapping[str, str] | None = None,
    timeout: float = 0.5,
) -> Discovery:
    """Every usable model: the stores' files (in store order; a name already listed under the same label
    is skipped, as ComfyUI does with several model folders) and the models of the servers that answer
    within ``timeout`` seconds (probed in parallel)."""
    env = os.environ if env is None else env
    with ThreadPoolExecutor(max_workers=max(1, len(servers))) as pool:
        probes = [pool.submit(_probe, server, env, timeout) for server in servers]
        models: list[Model] = []
        seen: set[str] = set()
        for store in stores:
            for model in scan(store):
                if model.ref not in seen:
                    seen.add(model.ref)
                    models.append(model)
        notes = []
        for probe in probes:
            found, note = probe.result()
            models.extend(found)
            if note:
                notes.append(note)
    return Discovery(tuple(models), tuple(notes))


def split_ref(ref: str) -> tuple[str, str]:
    source, sep, name = ref.partition(SEPARATOR)
    if not sep or not source.strip() or not name.strip():
        raise PlenioUserError(
            f"'{ref}' is not a model reference.",
            hint="Choose a model in the list (refresh it with R if the list is old).",
        )
    return source.strip(), name.strip()


def _inside(folder: Path, path: Path) -> bool:
    try:
        path.resolve().relative_to(folder.resolve())
    except (OSError, ValueError):
        return False
    return True


def _file_in(store: Store, name: str) -> Path | None:
    if not store.hf_cache:
        path = store.folder / name
        return path if path.is_file() and _inside(store.folder, path) else None
    split = _hf_repo_folder(name)
    if split is None:
        return None
    repo, relative = split
    snapshot = _snapshot(store.folder / repo)
    candidates = [snapshot] if snapshot else []
    try:
        candidates += [p for p in (store.folder / repo / "snapshots").iterdir() if p not in candidates]
    except OSError:
        pass
    for folder in candidates:
        path = folder / relative
        if path.is_file() and _inside(store.folder / repo, path):
            return path
    return None


def resolve(ref: str, stores: Iterable[Store], servers: Iterable[Server]) -> Model:
    """The model a reference stands for, without scanning folders or asking servers.

    A file reference must exist now; a server reference is returned as is (the call reports an app that
    is not running).
    """
    source, name = split_ref(ref)
    labelled = [store for store in stores if store.name == source]
    for store in labelled:
        path = _file_in(store, name)
        if path is not None:
            return Model(source, name, path=path, size=_size(path))
    if labelled:
        folders = ", ".join(str(store.folder) for store in labelled)
        raise PlenioUserError(
            f"The model file '{name}' is not in {source} ({folders}).",
            hint="Put the GGUF there, or choose another model (press R to refresh the list).",
        )
    for server in servers:
        if server.name == source:
            return Model(source, name, server=server)
    raise PlenioUserError(
        f"'{source}' is neither a model folder nor a known app.",
        hint="Choose a model in the list (press R to refresh it); custom folders and servers are set in "
        "the [llm] section of Plenio's config.toml.",
    )


def describe(model: Model) -> str:
    """One line for logs and summaries."""
    if model.path is None:
        return f"{model.name} via {model.source}"
    size = f", {model.size / 1024**3:.1f} GB" if model.size else ""
    return f"{model.name} ({model.source}{size})"


def as_json(discovery: Discovery) -> dict[str, Any]:
    """The discovery as plain data (routes, reports)."""
    return {
        "models": [
            {"ref": m.ref, "source": m.source, "file": m.path is not None, "size": m.size}
            for m in discovery.models
        ],
        "notes": list(discovery.notes),
    }
