"""The Song API on the running ComfyUI: ``/plenio/api/v1/...`` (owner's request 2026-10-25; the design is
docs/design/party-songs.md §2, the guide docs/user/concepts/song-api.md).

A program - the Plenio Player first - makes a song with one request: a template (``yue2-song``, ``yue2-cover``),
the fields of its song part, the release's fields, seeds if wanted. The template's fields are read from the
template and the node definitions of this ComfyUI every time (``plenio.core.song_api``), the run is queued through
ComfyUI's own ``POST /prompt`` on this server's address, and the job is ComfyUI's prompt: its status comes from
ComfyUI's queue and history. ``POST /from-record`` turns a release record back into such a request - the song
again, a new take of it (its documents kept), or a new song of its brief.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import random
import re
import tempfile
import threading
import time
import urllib.parse
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from aiohttp import ClientError, ClientSession, ClientTimeout, web

from .. import __version__
from ..core import brief as brief_rules
from ..core import song_api
from ..core.errors import PlenioUserError
from ..core.release import RECORD_SCHEMA
from ..core.song_api import SongApiError
from ..core.song_api_doc import openapi
from ..core.workflow_prompt import InfoLookup
from . import host
from .shared import template_library, template_workflows

log = logging.getLogger("plenio")

BASE = "/plenio/api/v1"
CLIENT_ID = "plenio-song-api"
UPLOAD_LIMIT = 200 * 2**20
AUDIO_SUFFIXES = {".mp3", ".flac", ".wav", ".ogg", ".oga", ".m4a", ".opus", ".aac", ".aif", ".aiff"}
KEYS_KEPT_S = 24 * 3600
"""How long an ``Idempotency-Key`` returns its first job."""
JOBS_KEPT = 500
WAIT_LIMIT_S = 60.0
"""``GET /jobs/{id}?wait=<s>`` answers at the latest after this long."""
WAIT_STEP_S = 0.5
LIST_LIMIT = 200
FINISHED = ("succeeded", "failed", "cancelled")
STAGE_TEXT = {
    "SONG": "reading the brief",
    "SOURCE": "reading the original",
    "COVER": "planning the cover",
    "WRITE": "writing the lyrics",
    "TEXT": "checking the lyrics",
    "SCORE": "composing",
    "LYRICS": "hearing the lyrics",
    "RENDER": "singing and playing",
    "FINISH": "mastering and saving",
    "COVER ART": "painting the cover",
    "MUSIC MODEL": "loading the music model",
}
"""What a template group means to a listener (``"5 · RENDER"`` -> *singing and playing*); a group not named here
is told by its title."""
STAGE_TEXT_COVER = {"SCORE": "reading the melody"}

Handler = Callable[[web.Request], Awaitable[web.StreamResponse]]


@dataclass
class Job:
    """What the API keeps of a job it queued (ComfyUI keeps the rest): the template, the request, the workflow (for
    the stage a run is in), when it was first seen running."""

    id: str
    template: str
    kind: str
    created: float
    client: dict[str, str]
    fields: dict[str, Any]
    release: dict[str, Any]
    seeds: dict[str, int]
    workflow: dict[str, Any]
    warnings: list[str] = field(default_factory=list)
    started: float | None = None
    documents: list[str] = field(default_factory=list)


_jobs: dict[str, Job] = {}
_dropped: dict[str, float] = {}
"""Jobs taken out of the queue before they ran (ComfyUI keeps no trace of them): id -> when."""
_keys: dict[str, tuple[str, float]] = {}
_lock = threading.Lock()
_key_locks: dict[str, asyncio.Lock] = {}
"""One request at a time per ``Idempotency-Key``: two at once with one key made two songs."""


# --- answers ------------------------------------------------------------------------------------------------


def _error(error: SongApiError) -> web.Response:
    return web.json_response({"error": error.to_dict()}, status=error.status)


def guarded(handler: Handler) -> Handler:
    async def wrapper(request: web.Request) -> web.StreamResponse:
        try:
            return await handler(request)
        except SongApiError as error:
            return _error(error)
        except Exception:  # noqa: BLE001 - a bug: said as one, its text only in the log (it can name folders)
            log.exception("Plenio Song API %s failed", request.path)
            return _error(
                SongApiError(
                    "internal",
                    "The Song API failed - an error in Plenio. ComfyUI's console (its log) says which.",
                    status=500,
                )
            )

    return wrapper


def _style(template_id: str) -> brief_rules.Template | None:
    """A style template by its id (``none`` and an unknown one: none)."""
    if template_id in ("", "none"):
        return None
    try:
        return template_library().get(template_id)
    except PlenioUserError:
        return None


def _lookup() -> InfoLookup:
    """The node definitions of this ComfyUI, read once per request (a list of files as it is on disk now)."""
    seen: dict[str, Any] = {}

    def info(node_type: str) -> Any:
        if node_type not in seen:
            try:
                seen[node_type] = host.node_info(node_type)
            except Exception:  # noqa: BLE001 - a node whose definition fails is one ComfyUI cannot run either
                log.exception("Plenio Song API: the definition of %s could not be read", node_type)
                seen[node_type] = None
        return seen[node_type]

    return info


def _templates(info: InfoLookup) -> dict[str, song_api.Template]:
    return {
        template_id: song_api.load_template(name, workflow, info)
        for template_id, (name, workflow) in song_api.api_templates(template_workflows()).items()
    }


def _template(template_id: str, info: InfoLookup) -> song_api.Template:
    found = song_api.api_templates(template_workflows()).get(template_id)
    if found is None:
        known = ", ".join(sorted(song_api.api_templates(template_workflows())))
        raise SongApiError(
            "unknown_template", f"No template {template_id!r}.", hint=f"The templates: {known}.", status=404
        )
    return song_api.load_template(found[0], found[1], info)


async def _body(request: web.Request) -> dict[str, Any]:
    if not (request.content_type or "").startswith("application/json"):
        raise SongApiError(
            "unsupported_media_type", "The request is JSON (Content-Type: application/json).", status=415
        )
    try:
        data = await request.json()
    except ValueError as error:
        raise SongApiError("bad_request", "The request body is not valid JSON.") from error
    if not isinstance(data, dict):
        raise SongApiError("bad_request", "The request body is a JSON object.")
    return data


# --- ComfyUI's queue -----------------------------------------------------------------------------------------


def _self_url() -> str:
    """This ComfyUI's own address (the loopback one when it listens on every network)."""
    server = host.prompt_server()
    address = str(getattr(server, "address", "") or "127.0.0.1")
    port = int(getattr(server, "port", 8188) or 8188)
    if address in ("0.0.0.0", ""):  # noqa: S104 - an address read, not one listened on
        address = "127.0.0.1"
    elif address == "::":
        address = "::1"
    if ":" in address and not address.startswith("["):
        address = f"[{address}]"
    return f"{'https' if host.tls_enabled() else 'http'}://{address}:{port}"


async def _post_prompt(
    prompt: dict[str, Any], workflow: dict[str, Any], meta: dict[str, Any]
) -> dict[str, Any]:
    """Queue through ComfyUI's own ``/prompt`` (its validation included); its node errors become the API's."""
    payload = {
        "prompt": prompt,
        "client_id": CLIENT_ID,
        "extra_data": {"extra_pnginfo": {"workflow": workflow}, "plenio_api": meta},
    }
    try:
        async with ClientSession(timeout=ClientTimeout(total=120)) as session:
            async with session.post(f"{_self_url()}/prompt", json=payload, ssl=False) as answer:
                body = await answer.json(content_type=None)
                status = answer.status
    except (ClientError, OSError, ValueError) as error:
        raise SongApiError("not_ready", f"ComfyUI's queue did not answer: {error}", status=503) from error
    if status != 200 or not isinstance(body, dict) or not body.get("prompt_id"):
        message = ((body or {}).get("error") or {}).get("message") if isinstance(body, dict) else ""
        details = _node_errors(body.get("node_errors") if isinstance(body, dict) else None, prompt)
        missing = _missing_files(details)
        if missing:
            raise SongApiError(
                "comfyui_rejected",
                f"ComfyUI does not find {'the model file' if len(missing) == 1 else 'the model files'} "
                + ", ".join(missing)
                + ".",
                hint="Put the file into ComfyUI's models folder, or start ComfyUI with the folder that holds it "
                "(--models-directory). The template 0 · System Check lists every model file and its folder.",
                details=details,
            )
        raise SongApiError(
            "comfyui_rejected",
            f"ComfyUI refused the run: {message or status}.",
            hint="The details name the nodes and why (a model file missing is the usual reason).",
            details=details,
        )
    return body


_NOT_IN_LIST = re.compile(r"'([^']+)' not in")


def _missing_files(details: list[dict[str, Any]]) -> list[str]:
    """The files ComfyUI's validation did not find in a loader's list (``Value not in list``): ``name (node)``."""
    found: list[str] = []
    for detail in details:
        if "not in list" not in detail["message"].lower():
            continue
        match = _NOT_IN_LIST.search(detail["details"])
        if match:
            entry = f"{match.group(1)} ({detail['title'] or detail['type']})"
            if entry not in found:
                found.append(entry)
    return found


def _node_errors(errors: Any, prompt: dict[str, Any]) -> list[dict[str, Any]]:
    out = []
    for node_id, entry in (errors or {}).items() if isinstance(errors, dict) else []:
        title = ((prompt.get(str(node_id)) or {}).get("_meta") or {}).get("title", "")
        for problem in (entry or {}).get("errors") or []:
            out.append(
                {
                    "node": str(node_id),
                    "title": title,
                    "type": (entry or {}).get("class_type", ""),
                    "message": str(problem.get("message") or ""),
                    "details": str(problem.get("details") or ""),
                }
            )
    return out


def _queue_items() -> tuple[list[Any], list[Any]]:
    queue = host.prompt_server().prompt_queue
    getter = getattr(queue, "get_current_queue_volatile", None) or queue.get_current_queue
    running, pending = getter()
    return list(running), sorted(pending, key=lambda item: item[0])


def _history(prompt_id: str) -> dict[str, Any] | None:
    found = host.prompt_server().prompt_queue.get_history(prompt_id=prompt_id)
    item = found.get(prompt_id) if isinstance(found, dict) else None
    return item if isinstance(item, dict) else None


def _messages(item: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    return [
        (str(m[0]), m[1] if isinstance(m[1], dict) else {})
        for m in ((item.get("status") or {}).get("messages") or [])
        if isinstance(m, (list, tuple)) and len(m) == 2
    ]


def _stage(workflow: dict[str, Any] | None, kind: str, node_id: Any) -> dict[str, Any] | None:
    if not workflow or node_id is None:
        return None
    group = song_api.stage_of(workflow, node_id)
    if not group:
        return None
    name = re.sub(r"^\s*\d+\s*·\s*", "", group).strip()
    text = (STAGE_TEXT_COVER if kind == "cover" else {}).get(name) or STAGE_TEXT.get(name) or name.lower()
    numbers = sorted(
        n
        for g in workflow.get("groups") or []
        if isinstance(g, dict) and (n := song_api.group_number(g.get("title"))) is not None
    )
    return {
        "group": group,
        "text": text,
        "index": song_api.group_number(group),
        "of": numbers[-1] if numbers else None,
    }


def _progress(prompt_id: str, total: int) -> dict[str, Any] | None:
    state = host.progress_state()
    if state is None or getattr(state, "prompt_id", None) != prompt_id:
        return None
    nodes = dict(getattr(state, "nodes", {}) or {})
    done = sum(
        1
        for entry in nodes.values()
        if str(getattr(entry.get("state"), "value", entry.get("state"))) == "finished"
    )
    running = next(
        (
            entry
            for entry in nodes.values()
            if str(getattr(entry.get("state"), "value", entry.get("state"))) == "running"
        ),
        None,
    )
    out: dict[str, Any] = {"nodes_done": done, "nodes": total}
    if running is not None and float(running.get("max") or 0) > 1:
        out.update(step=float(running.get("value") or 0), steps=float(running.get("max") or 0))
    return out


def _result(item: dict[str, Any], prompt_id: str = "") -> dict[str, Any] | None:
    """What a finished run made: the release record Export Release names (``plenio_player``), its title, its files -
    each with the address to download it (``GET /jobs/{id}/files/{name}``)."""
    for output in (item.get("outputs") or {}).values():
        for entry in (output or {}).get("plenio_player") or []:
            path = Path(str((entry or {}).get("record") or ""))
            if not path.name:
                continue
            result: dict[str, Any] = {
                "record": str(path),
                "folder": str(path.parent),
                "title": "",
                "files": [],
            }
            try:
                record = json.loads(path.read_text(encoding="utf-8"))
                result["title"] = str(record.get("title") or "")
                result["files"] = [
                    {"name": str(f.get("name")), **({"role": f["role"]} if f.get("role") else {})}
                    for f in record.get("files") or []
                    if isinstance(f, dict) and f.get("name")
                ]
                result["seconds"] = float((record.get("audio") or {}).get("seconds") or 0.0)
            except (OSError, ValueError):
                pass
            if prompt_id:
                files = [*result["files"], {"name": path.name, "role": "record"}]
                result["files"] = [
                    {**f, "url": f"{BASE}/jobs/{prompt_id}/files/{urllib.parse.quote(f['name'])}"}
                    for f in files
                ]
            return result
    return None


def job_view(prompt_id: str) -> dict[str, Any] | None:
    """A job as the API shows it (``None``: ComfyUI knows no such prompt)."""
    with _lock:
        job = _jobs.get(prompt_id)
    running, pending = _queue_items()
    item: Any = next((x for x in running if x[1] == prompt_id), None)
    status, position = "", None
    if item is not None:
        status = "running"
        if job is not None and job.started is None:
            job.started = time.time()
    else:
        index = next((k for k, x in enumerate(pending) if x[1] == prompt_id), None)
        if index is not None:
            item = pending[index]
            status, position = "queued", index + 1
    history = _history(prompt_id) if not status else None
    if not status and history is None:
        if prompt_id not in _dropped:
            return None
        status = "cancelled"
    meta: dict[str, Any] = {}
    extra = (item[3] if item is not None and len(item) > 3 else None) or (
        (history or {}).get("prompt", [None, None, None, {}])[3] if history else {}
    )
    if isinstance(extra, dict):
        meta = extra.get("plenio_api") or {}
    view: dict[str, Any] = {
        "id": prompt_id,
        "template": (job.template if job else meta.get("template")) or "",
        "status": status,
        "queue_position": position,
        "created_at": job.created
        if job
        else _ms((extra or {}).get("create_time"))
        if isinstance(extra, dict)
        else None,
        "started_at": job.started if job else None,
        "finished_at": _dropped.get(prompt_id),
        "stage": None,
        "progress": None,
        "seeds": dict(job.seeds) if job else dict(meta.get("seeds") or {}),
        "documents": list(job.documents) if job else list(meta.get("documents") or []),
        "client": dict(job.client) if job else dict(meta.get("client") or {}),
        "result": None,
        "error": None,
        "warnings": list(job.warnings) if job else [],
        "links": {"self": f"{BASE}/jobs/{prompt_id}"},
    }
    kind = (job.kind if job else meta.get("kind")) or "song"
    if status == "running":
        server = host.prompt_server()
        if getattr(server, "last_prompt_id", None) == prompt_id:
            workflow = job.workflow if job else (((extra or {}).get("extra_pnginfo") or {}).get("workflow"))
            view["stage"] = _stage(workflow, kind, getattr(server, "last_node_id", None))
            prompt = item[2] if item is not None and len(item) > 2 else {}
            view["progress"] = _progress(prompt_id, len(prompt) if isinstance(prompt, dict) else 0)
    if history is not None:
        messages = _messages(history)
        stamps = {event: data.get("timestamp") for event, data in messages}
        view["started_at"] = _ms(stamps.get("execution_start")) or view["started_at"]
        failed = next((data for event, data in messages if event == "execution_error"), None)
        stopped = next((data for event, data in messages if event == "execution_interrupted"), None)
        end = (
            stamps.get("execution_success")
            or stamps.get("execution_error")
            or stamps.get("execution_interrupted")
        )
        view["finished_at"] = _ms(end)
        state = str((history.get("status") or {}).get("status_str") or "")
        if stopped is not None:
            view["status"] = "cancelled"
        elif failed is not None or state == "error":
            view["status"] = "failed"
            data = failed or {}
            node = str(data.get("node_id") or "")
            prompt = (history.get("prompt") or [None, None, {}])[2] or {}
            view["error"] = {
                "message": str(data.get("exception_message") or "the run failed").strip(),
                "type": str(data.get("exception_type") or ""),
                "node": node,
                "title": str(
                    ((prompt.get(node) or {}).get("_meta") or {}).get("title") or data.get("node_type") or ""
                ),
            }
        else:
            view["status"] = "succeeded"
            view["result"] = _result(history, prompt_id)
    return view


def _ms(value: Any) -> float | None:
    return round(float(value) / 1000, 3) if isinstance(value, (int, float)) and value > 0 else None


# --- routes --------------------------------------------------------------------------------------------------


async def index(request: web.Request) -> web.StreamResponse:
    info = _lookup()
    return web.json_response(
        {
            "api": song_api.API_NAME,
            "version": song_api.API_VERSION,
            "plenio": __version__,
            "comfyui": host.comfyui_version(),
            "templates": [t.summary() for t in _templates(info).values()],
            "paths": {
                "templates": f"{BASE}/templates",
                "briefs": f"{BASE}/briefs",
                "uploads": f"{BASE}/uploads",
                "jobs": f"{BASE}/jobs",
                "from_record": f"{BASE}/from-record",
                "queue": f"{BASE}/queue",
                "openapi": f"{BASE}/openapi.json",
            },
            "docs": "https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/api/README.md",
        }
    )


async def openapi_document(request: web.Request) -> web.StreamResponse:
    return web.json_response(
        openapi(_templates(_lookup()).values(), plenio=__version__, comfyui=host.comfyui_version())
    )


async def templates(request: web.Request) -> web.StreamResponse:
    return web.json_response({"templates": [t.summary() for t in _templates(_lookup()).values()]})


async def template_detail(request: web.Request) -> web.StreamResponse:
    return web.json_response(_template(request.match_info["template_id"], _lookup()).describe())


async def briefs(request: web.Request) -> web.StreamResponse:
    """The style templates and every value their fields have, for the lists of a simple form."""
    from ..core.brief import TEMPLATE_FIELDS

    kind = request.query.get("kind", "song")
    if kind not in ("song", "cover"):
        raise SongApiError("invalid_value", "kind: song or cover.", field="kind")
    library = template_library()
    if request.query.get("reload") == "1":
        library.reload()
    found = [library.templates()[i] for i in library.ids()]
    return web.json_response(
        {
            "kind": kind,
            "briefs": [t.to_dict() for t in found],
            "values": song_api.brief_values(found, TEMPLATE_FIELDS),
        }
    )


async def upload(request: web.Request) -> web.StreamResponse:
    """A source recording for a cover: saved in ComfyUI's input folder under a name of the API's own (the same file
    sent twice is saved once)."""
    original = Path(request.query.get("name", "")).name
    suffix = Path(original).suffix.lower()
    if suffix not in AUDIO_SUFFIXES:
        raise SongApiError(
            "unsupported_media_type",
            "A source recording is an audio file: MP3, FLAC, WAV, OGG, M4A, OPUS, AAC or AIFF (its name in ?name=).",
            status=415,
        )
    if request.content_length is not None and request.content_length > UPLOAD_LIMIT:
        raise SongApiError("too_large", f"A recording of at most {UPLOAD_LIMIT // 2**20} MB.", status=413)
    folder = host.input_directory()
    folder.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    size = 0
    with tempfile.NamedTemporaryFile(dir=folder, prefix=".plenio-upload-", delete=False) as handle:
        temp = Path(handle.name)
        try:
            async for chunk in request.content.iter_chunked(256 * 1024):
                size += len(chunk)
                if size > UPLOAD_LIMIT:
                    raise SongApiError(
                        "too_large", f"A recording of at most {UPLOAD_LIMIT // 2**20} MB.", status=413
                    )
                digest.update(chunk)
                handle.write(chunk)
        except BaseException:
            handle.close()
            temp.unlink(missing_ok=True)
            raise
    if size == 0:
        temp.unlink(missing_ok=True)
        raise SongApiError("bad_request", "The request has no recording in its body.")
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(original).stem).strip("-.")[:60] or "source"
    name = f"{song_api.UPLOAD_PREFIX}{digest.hexdigest()[:12]}-{stem}{suffix}"
    target = folder / name
    if target.exists():
        temp.unlink(missing_ok=True)
    else:
        temp.replace(target)
    return web.json_response({"name": name, "bytes": size}, status=201)


async def jobs_create(request: web.Request) -> web.StreamResponse:
    data = await _body(request)
    key = str(request.headers.get("Idempotency-Key") or "").strip()[:200]
    if not key:
        return await _create(data, key)
    lock = _key_locks.setdefault(key, asyncio.Lock())
    try:
        async with lock:
            with _lock:
                now = time.time()
                for old in [k for k, (_, at) in _keys.items() if now - at > KEYS_KEPT_S]:
                    _keys.pop(old, None)
                known = _keys.get(key)
            if known is not None:
                view = job_view(known[0])
                if view is not None:
                    return web.json_response(view, status=200)
            return await _create(data, key)
    finally:
        if not lock.locked() and not getattr(lock, "_waiters", None):
            _key_locks.pop(key, None)


async def _create(data: dict[str, Any], key: str) -> web.StreamResponse:
    template_id = data.get("template")
    if not isinstance(template_id, str) or not template_id:
        raise SongApiError(
            "missing_field", "The request names its template ('template': 'yue2-song').", field="template"
        )
    info = _lookup()
    template = _template(template_id, info)
    client = data.get("client") or {}
    if not isinstance(client, dict):
        raise SongApiError("bad_request", "'client' is an object of texts.", field="client")
    client = {str(k)[:40]: str(v)[:200] for k, v in list(client.items())[:12]}
    prepared = song_api.prepare(template, data, info, rng=random.Random(), styles=_style)
    meta = {
        "api": song_api.API_VERSION,
        "template": template.id,
        "kind": template.kind,
        "client": client,
        "seeds": prepared.seeds,
        "fields": {k: v for k, v in prepared.fields.items() if not isinstance(v, (dict, list))},
        "release": prepared.release,
        "documents": prepared.documents,
    }
    answer = await _post_prompt(prepared.prompt, prepared.workflow, meta)
    prompt_id = str(answer["prompt_id"])
    job = Job(
        id=prompt_id,
        template=template.id,
        kind=template.kind,
        created=time.time(),
        client=client,
        fields=prepared.fields,
        release=prepared.release,
        seeds=prepared.seeds,
        workflow=prepared.workflow,
        warnings=prepared.warnings,
        documents=prepared.documents,
    )
    with _lock:
        _jobs[prompt_id] = job
        for old in list(_jobs)[:-JOBS_KEPT]:
            _jobs.pop(old, None)
        if key:
            _keys[key] = (prompt_id, time.time())
    view = job_view(prompt_id) or {
        "id": prompt_id,
        "template": template.id,
        "status": "queued",
        "queue_position": None,
        "created_at": job.created,
        "seeds": prepared.seeds,
        "warnings": prepared.warnings,
        "links": {"self": f"{BASE}/jobs/{prompt_id}"},
    }
    return web.json_response(view, status=201, headers={"Location": f"{BASE}/jobs/{prompt_id}"})


async def from_record(request: web.Request) -> web.StreamResponse:
    """The request that makes a record's song again (the record is the body): its template, fields, release fields,
    seeds and documents - and whether its documents make a new take here (a cover's original recording must still
    be in ComfyUI's input folder). Reads nothing but the body."""
    record = await _body(request)
    if record.get("schema") != RECORD_SCHEMA:
        raise SongApiError(
            "bad_request",
            f"The body is a Plenio release record (schema {RECORD_SCHEMA}): the <name>.plenio.json of a song.",
        )
    template = song_api.template_for_record(_templates(_lookup()), record)
    if template is None:
        raise SongApiError(
            "unknown_template",
            "No template of the API makes this record's song - it has no Song Brief or Cover Brief.",
            status=422,
        )
    answer = song_api.request_from_record(template, record)
    source = str(answer["fields"].get("source.audio") or "")
    if template.field("source.audio") is not None and answer["take"]["possible"]:
        folder = host.input_directory()
        if Path(source).name != source or not (folder / source).is_file():
            answer["take"] = {
                "possible": False,
                "why": "Its original recording is no longer in ComfyUI's input folder.",
            }
    return web.json_response(answer)


def _query_limit(request: web.Request) -> int:
    raw = request.query.get("limit", "")
    if not raw:
        return LIST_LIMIT
    try:
        limit = int(raw)
    except ValueError as error:
        raise SongApiError("invalid_value", "limit: a whole number from 1.", field="limit") from error
    if limit < 1:
        raise SongApiError("invalid_value", "limit: a whole number from 1.", field="limit")
    return min(limit, LIST_LIMIT)


async def jobs_list(request: web.Request) -> web.StreamResponse:
    """The API's jobs ComfyUI still knows (in its queue or its history), newest first - ``?status=`` (one or several,
    comma-separated), ``?client=`` (the client's name), ``?template=``, ``?limit=``."""
    statuses = {s.strip() for s in request.query.get("status", "").split(",") if s.strip()}
    unknown = statuses - {"queued", "running", *FINISHED}
    if unknown:
        raise SongApiError(
            "invalid_value",
            f"No job status {sorted(unknown)[0]!r}.",
            hint="queued, running, succeeded, failed, cancelled",
            field="status",
        )
    client = request.query.get("client", "")
    template = request.query.get("template", "")
    limit = _query_limit(request)
    running, pending = _queue_items()
    ids = [str(x[1]) for x in running + pending if isinstance(x[3], dict) and x[3].get("plenio_api")]
    history = host.prompt_server().prompt_queue.get_history(max_items=200)
    for prompt_id, item in (history or {}).items():
        prompt = item.get("prompt") if isinstance(item, dict) else None
        extra = prompt[3] if isinstance(prompt, (list, tuple)) and len(prompt) > 3 else {}
        if isinstance(extra, dict) and extra.get("plenio_api") and prompt_id not in ids:
            ids.append(str(prompt_id))
    views = [v for v in (job_view(i) for i in ids) if v is not None]
    views = [
        v
        for v in views
        if (not statuses or v["status"] in statuses)
        and (not client or v["client"].get("name") == client)
        and (not template or v["template"] == template)
    ]
    views.sort(key=lambda v: v.get("created_at") or 0, reverse=True)
    return web.json_response({"jobs": views[:limit]})


def _moment(view: dict[str, Any]) -> tuple[Any, ...]:
    """What a waiting program wants to hear of: the status, the place in the queue, the stage."""
    return view["status"], view.get("queue_position"), (view.get("stage") or {}).get("group")


async def job_get(request: web.Request) -> web.StreamResponse:
    """A job - with ``?wait=<seconds>`` (at most 60) the answer comes when its status, its place in the queue or its
    stage changes, or the time is up: a program follows a song without asking every second."""
    job_id = request.match_info["job_id"]
    view = job_view(job_id)
    if view is None:
        raise SongApiError(
            "not_found", "ComfyUI knows no such job (it may have been restarted since).", status=404
        )
    raw = request.query.get("wait", "")
    if raw:
        try:
            wait = min(max(float(raw), 0.0), WAIT_LIMIT_S)
        except ValueError as error:
            raise SongApiError("invalid_value", "wait: seconds, at most 60.", field="wait") from error
        first = _moment(view)
        deadline = time.monotonic() + wait
        while view["status"] not in FINISHED and time.monotonic() < deadline:
            await asyncio.sleep(min(WAIT_STEP_S, max(0.0, deadline - time.monotonic())))
            found = job_view(job_id)
            if found is None:
                break
            view = found
            if _moment(view) != first:
                break
    return web.json_response(view)


async def job_file(request: web.Request) -> web.StreamResponse:
    """A file of a finished job's song: its audio, cover, sheet music, subtitles or release record - only what its
    record lists, from the record's folder inside ComfyUI's output folder."""
    job_id = request.match_info["job_id"]
    name = request.match_info["name"]
    history = _history(job_id)
    result = _result(history, job_id) if history is not None else None
    if not result or not result.get("record"):
        view = job_view(job_id)
        raise SongApiError(
            "not_found",
            "ComfyUI knows no such job."
            if view is None
            else f"The job has no finished song (it is {view['status']}).",
            status=404,
        )
    path = song_api.result_file(
        Path(result["record"]), name, [f["name"] for f in result["files"]], host.output_directory()
    )
    disposition = f"attachment; filename*=UTF-8''{urllib.parse.quote(path.name)}"
    return web.FileResponse(path, headers={"Content-Disposition": disposition})


async def job_delete(request: web.Request) -> web.StreamResponse:
    """Cancel a job: out of the queue while it waits, interrupted while it runs; a finished one stays as it is."""
    prompt_id = request.match_info["job_id"]
    queue = host.prompt_server().prompt_queue
    running, pending = _queue_items()
    if any(x[1] == prompt_id for x in pending):
        queue.delete_queue_item(lambda item: item[1] == prompt_id)
        with _lock:
            _dropped[prompt_id] = time.time()
            for old in list(_dropped)[:-JOBS_KEPT]:
                _dropped.pop(old, None)
    elif any(x[1] == prompt_id for x in running):
        stop = getattr(queue, "interrupt_if_running", None)
        if callable(stop):
            stop(prompt_id)
        else:
            host.interrupt()
    view = job_view(prompt_id)
    if view is None:
        raise SongApiError("not_found", "ComfyUI knows no such job.", status=404)
    if view["status"] == "queued":  # it started in between: interrupted now
        view["status"] = "cancelled"
    return web.json_response(view)


async def queue_info(request: web.Request) -> web.StreamResponse:
    """How busy ComfyUI is, and how long the API's runs took lately (for estimates)."""
    running, pending = _queue_items()
    now_running = None
    if running:
        item = running[0]
        meta = item[3].get("plenio_api") if isinstance(item[3], dict) else None
        now_running = {"id": str(item[1]), "api": bool(meta), "template": (meta or {}).get("template", "")}
    recent = []
    history = host.prompt_server().prompt_queue.get_history(max_items=200)
    for prompt_id, item in (history or {}).items():
        prompt = item.get("prompt") if isinstance(item, dict) else None
        extra = prompt[3] if isinstance(prompt, (list, tuple)) and len(prompt) > 3 else {}
        meta = extra.get("plenio_api") if isinstance(extra, dict) else None
        if not meta:
            continue
        stamps = {event: data.get("timestamp") for event, data in _messages(item)}
        start, end = _ms(stamps.get("execution_start")), _ms(stamps.get("execution_success"))
        if start and end and end > start:
            fields = meta.get("fields") or {}
            recent.append(
                {
                    "id": str(prompt_id),
                    "template": meta.get("template", ""),
                    "kind": meta.get("kind", ""),
                    "length": fields.get("length", ""),
                    "seconds": round(end - start, 1),
                    "audio_seconds": (_result(item) or {}).get("seconds"),
                    "finished_at": end,
                }
            )
    recent.sort(key=lambda r: r["finished_at"], reverse=True)
    return web.json_response(
        {
            "running": now_running,
            "pending": len(pending),
            "pending_api": [str(x[1]) for x in pending if isinstance(x[3], dict) and x[3].get("plenio_api")],
            "recent": recent[:20],
        }
    )


ROUTES: tuple[tuple[str, str, Handler], ...] = (
    ("GET", BASE, index),
    ("GET", f"{BASE}/", index),
    ("GET", f"{BASE}/openapi.json", openapi_document),
    ("GET", f"{BASE}/templates", templates),
    ("GET", f"{BASE}/templates/{{template_id}}", template_detail),
    ("GET", f"{BASE}/briefs", briefs),
    ("POST", f"{BASE}/uploads", upload),
    ("POST", f"{BASE}/jobs", jobs_create),
    ("POST", f"{BASE}/from-record", from_record),
    ("GET", f"{BASE}/jobs", jobs_list),
    ("GET", f"{BASE}/jobs/{{job_id}}", job_get),
    ("GET", f"{BASE}/jobs/{{job_id}}/files/{{name}}", job_file),
    ("DELETE", f"{BASE}/jobs/{{job_id}}", job_delete),
    ("GET", f"{BASE}/queue", queue_info),
)


def register(routes: web.RouteTableDef) -> None:
    for method, path, handler in ROUTES:
        routes.route(method, path)(guarded(handler))
