"""The Song API v2 on the running ComfyUI: ``/plenio/api/v2/...`` (PD 8.1).

v2 runs every template that carries the API's marker (``yue2-song``, ``yue2-cover``, ``yue2-daw``,
``minimax-song``), takes the presets, and keeps its jobs on disk (``plenio.core.api.jobstore``): a job has an id of
its own and the ComfyUI prompts it ran as; its state is read from ComfyUI's queue and history - the v1 functions
that do it - and written to its file when it changes, by the requests that read it and by a watcher in the
background (``watch``), so that a job that ends while nobody asks is written too. API v1 stays as it was
(``song_api_v1``) and does not read v2's jobs.
"""

from __future__ import annotations

import asyncio
import hashlib
import random
import threading
import time
from typing import Any

from aiohttp import web

from .. import __version__
from ..core import song_api
from ..core.access import Route
from ..core.api.jobstore import ACTIVE, ENDED, Job, JobStore
from ..core.presets import with_preset
from ..core.song_api import SongApiError
from . import host
from . import song_api_v1 as v1
from .shared import template_workflows

BASE = "/plenio/api/v2"
API_VERSION = "2.0"
WAIT_LIMIT_S = 60.0
WATCH_EVERY_S = 2.0
OWNER_HERE = "here"
"""The caller on this computer (a token's id once tokens exist, phase 5.4)."""

_store: JobStore | None = None
_store_lock = threading.Lock()
_watcher: threading.Thread | None = None


def instance_id() -> str:
    """This server: its user folder and its address (two ComfyUIs may share a user folder)."""
    text = f"{host.user_directory()}|{v1._self_url()}"
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def store() -> JobStore:
    global _store
    with _store_lock:
        if _store is None:
            _store = JobStore(host.user_directory() / "plenio" / "api" / "jobs", instance_id())
        return _store


def _templates(info: Any) -> dict[str, song_api.Template]:
    return {
        template_id: song_api.load_template(name, workflow, info)
        for template_id, (name, workflow) in song_api.api_templates(template_workflows()).items()
    }


def _template(template_id: str, info: Any) -> song_api.Template:
    found = song_api.api_templates(template_workflows()).get(template_id)
    if found is None:
        known = ", ".join(sorted(song_api.api_templates(template_workflows())))
        raise SongApiError(
            "unknown_template", f"No template {template_id!r}.", hint=f"The templates: {known}.", status=404
        )
    return song_api.load_template(found[0], found[1], info)


# --- a job's state ----------------------------------------------------------------------------------------------


def refresh(job: Job) -> tuple[Job, dict[str, Any] | None]:
    """The job with what ComfyUI says of its last prompt, written when its state changed; and that prompt's v1
    view (stage, progress, the queue position), ``None`` when ComfyUI no longer knows it."""
    if job.status in ENDED or not job.prompts:
        return job, None
    view = v1.job_view(job.prompts[-1])
    if view is None:
        if job.status == "queued" and time.time() - job.created < 30:
            return job, None  # just queued: ComfyUI's history may not show it yet
        return store().update(
            job.id,
            status="failed",
            error={
                "code": "lost",
                "message": "ComfyUI no longer knows this job's run (its history was cleared).",
            },
        ), None
    status = str(view.get("status") or job.status)
    changes: dict[str, Any] = {}
    if status != job.status and status in (*ACTIVE, *ENDED):
        changes["status"] = status
    if status == "succeeded" and view.get("result") is not None:
        changes["result"] = view["result"]
    if status == "failed" and view.get("error"):
        error = dict(view["error"])
        changes["error"] = {"code": "run_failed", **error}
    if changes:
        job = store().update(job.id, **changes)
    return job, view


def job_answer(job: Job, view: dict[str, Any] | None = None) -> dict[str, Any]:
    """A job as v2 answers it."""
    request = dict(job.request)
    return {
        "id": job.id,
        "template": job.template,
        "kind": job.kind,
        "status": job.status,
        "stage": (view or {}).get("stage"),
        "progress": (view or {}).get("progress"),
        "queue_position": (view or {}).get("queue_position"),
        "created_at": job.created,
        "updated_at": job.updated,
        "ended_at": job.ended,
        "seeds": dict(request.get("seeds") or {}),
        "client": dict(job.client),
        "review": list(request.get("review") or []),
        "waiting_at": job.stage or None,
        "result": _v2_result(job),
        "error": dict(job.error) if job.error else None,
        "links": {"self": f"{BASE}/jobs/{job.id}"},
    }


def _v2_result(job: Job) -> dict[str, Any] | None:
    if job.result is None:
        return None
    result = dict(job.result)
    prompt = job.prompts[-1] if job.prompts else ""
    files = []
    for entry in result.get("files") or []:
        if isinstance(entry, dict):
            url = str(entry.get("url") or "").replace(f"{v1.BASE}/jobs/{prompt}/", f"{BASE}/jobs/{job.id}/")
            files.append({**entry, "url": url})
    result["files"] = files
    return result


def watch() -> None:
    """Write the state of the jobs that still run, every few seconds, in the background - a job that ends while no
    program asks is written too. Started once, with the routes."""
    global _watcher
    if _watcher is not None and _watcher.is_alive():
        return

    def loop() -> None:
        while True:
            time.sleep(WATCH_EVERY_S)
            try:
                for job in store().active():
                    refresh(job)
            except Exception:  # noqa: BLE001 - the watcher must not die; the next request reads the state too
                v1.log.exception("Plenio Song API v2: the jobs' watcher failed once")

    _watcher = threading.Thread(target=loop, name="plenio-api-v2-jobs", daemon=True)
    _watcher.start()


# --- routes: discovery ------------------------------------------------------------------------------------------


async def index(request: web.Request) -> web.StreamResponse:
    info = v1._lookup()
    return web.json_response(
        {
            "api": song_api.API_NAME,
            "version": API_VERSION,
            "plenio": __version__,
            "comfyui": host.comfyui_version(),
            "templates": [t.summary() for t in _templates(info).values()],
            "paths": {
                "templates": f"{BASE}/templates",
                "briefs": f"{BASE}/briefs",
                "presets": f"{BASE}/presets",
                "jobs": f"{BASE}/jobs",
            },
            "docs": "https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/api/README.md",
        }
    )


async def templates(request: web.Request) -> web.StreamResponse:
    return web.json_response({"templates": [t.summary() for t in _templates(v1._lookup()).values()]})


async def template_detail(request: web.Request) -> web.StreamResponse:
    return web.json_response(_template(request.match_info["template_id"], v1._lookup()).describe())


async def presets(request: web.Request) -> web.StreamResponse:
    found = v1._presets()
    return web.json_response(
        {
            "presets": [
                {"id": p.id, "name": p.name, "text": p.text, "fields": dict(p.fields)} for p in found.values()
            ]
        }
    )


# --- routes: jobs ----------------------------------------------------------------------------------------------


async def jobs_create(request: web.Request) -> web.StreamResponse:
    data = await v1._body(request)
    key = str(request.headers.get("Idempotency-Key") or "").strip()[:200]
    jobs = store()
    known = jobs.by_key(OWNER_HERE, key)
    if known is not None:
        job, view = refresh(known)
        return web.json_response(job_answer(job, view), status=200)
    if "review" in data:
        raise SongApiError(
            "invalid_value", "Review stops come with a later version of API v2.", field="review", status=400
        )
    template_id = data.get("template")
    if not isinstance(template_id, str) or not template_id:
        raise SongApiError(
            "missing_field", "The request names its template ('template': 'yue2-song').", field="template"
        )
    info = v1._lookup()
    template = _template(template_id, info)
    client = data.get("client") or {}
    if not isinstance(client, dict):
        raise SongApiError("bad_request", "'client' is an object of texts.", field="client")
    client = {str(k)[:40]: str(v)[:200] for k, v in list(client.items())[:12]}
    data = with_preset(data, v1._presets())
    prepared = song_api.prepare(template, data, info, rng=random.Random(), styles=v1._style)
    refused = await asyncio.to_thread(v1.model_choice_errors, prepared.prompt)
    missing = v1._missing_files(refused)
    if missing:
        raise SongApiError(
            "models_missing",
            f"ComfyUI does not find {'the model file' if len(missing) == 1 else 'the model files'} "
            + ", ".join(missing)
            + ".",
            hint='Plenio Setup downloads them (or [models] downloads = "auto" lets a run fetch them).',
            details=refused,
        )
    meta = {
        "api": API_VERSION,
        "template": template.id,
        "kind": template.kind,
        "client": client,
        "seeds": prepared.seeds,
        "fields": {k: v for k, v in prepared.fields.items() if not isinstance(v, (dict, list))},
        "release": prepared.release,
        "documents": prepared.documents,
        "stems": prepared.stems,
    }
    answer = await v1._post_prompt(prepared.prompt, prepared.workflow, meta)
    job = jobs.create(
        template=template.id,
        kind=template.kind,
        prompt=str(answer["prompt_id"]),
        owner=OWNER_HERE,
        key=key,
        client=client,
        request={
            "fields": {k: v for k, v in prepared.fields.items() if not isinstance(v, (dict, list))},
            "release": dict(prepared.release),
            "seeds": dict(prepared.seeds),
            "warnings": list(prepared.warnings),
        },
    )
    watch()
    return web.json_response(job_answer(job), status=201, headers={"Location": f"{BASE}/jobs/{job.id}"})


def _known(job_id: str) -> Job:
    job = store().get(job_id)
    if job is None:
        raise SongApiError("not_found", "There is no such job.", status=404)
    return job


async def job_get(request: web.Request) -> web.StreamResponse:
    """A job; ``?wait=<seconds>`` (at most 60): the answer comes when its status, place in the queue or stage
    changes."""
    job, view = await asyncio.to_thread(refresh, _known(request.match_info["job_id"]))
    raw = request.query.get("wait", "")
    if raw:
        try:
            wait = min(max(float(raw), 0.0), WAIT_LIMIT_S)
        except ValueError as error:
            raise SongApiError("invalid_value", "wait: seconds, at most 60.", field="wait") from error

        def moment(job: Job, view: dict[str, Any] | None) -> tuple[Any, ...]:
            return (
                job.status,
                (view or {}).get("queue_position"),
                ((view or {}).get("stage") or {}).get("group"),
            )

        first = moment(job, view)
        deadline = time.monotonic() + wait
        while job.status not in ENDED and time.monotonic() < deadline:
            await asyncio.sleep(min(v1.WAIT_STEP_S, max(0.0, deadline - time.monotonic())))
            job, view = await asyncio.to_thread(refresh, job)
            if moment(job, view) != first:
                break
    return web.json_response(job_answer(job, view))


async def jobs_list(request: web.Request) -> web.StreamResponse:
    limit = v1._query_limit(request)
    statuses = [s for s in request.query.get("status", "").split(",") if s]
    found = store().listing(owner=None, statuses=statuses, limit=limit)
    return web.json_response({"jobs": [job_answer(job) for job in found]})


async def job_delete(request: web.Request) -> web.StreamResponse:
    job = _known(request.match_info["job_id"])
    if job.status in ENDED:
        return web.json_response(job_answer(job))
    for prompt in job.prompts[-1:]:
        await asyncio.to_thread(v1.cancel_prompt, prompt)
    job = store().update(job.id, status="cancelled")
    return web.json_response(job_answer(job))


async def job_file(request: web.Request) -> web.StreamResponse:
    """A finished job's file: served as v1 serves it for the job's last run."""
    job = _known(request.match_info["job_id"])
    if not job.prompts:
        raise SongApiError("not_found", "This job made no files.", status=404)
    return await asyncio.to_thread(v1.serve_file, job.prompts[-1], request.match_info["name"])


def _route(method: str, path: str, handler: Any) -> Route:
    return Route(method, f"{BASE}{path}", handler, "api")


ROUTES: tuple[Route, ...] = (
    _route("GET", "", index),
    _route("GET", "/", index),
    _route("GET", "/templates", templates),
    _route("GET", "/templates/{template_id}", template_detail),
    _route("GET", "/briefs", v1.briefs),
    _route("GET", "/presets", presets),
    _route("POST", "/jobs", jobs_create),
    _route("GET", "/jobs", jobs_list),
    _route("GET", "/jobs/{job_id}", job_get),
    _route("DELETE", "/jobs/{job_id}", job_delete),
    _route("GET", "/jobs/{job_id}/files/{name:.+}", job_file),
    _route("POST", "/uploads", v1.upload),
    _route("GET", "/queue", v1.queue_info),
)
"""The Song API v2's routes (more follow in phase 5.3): all of the access class ``api``."""


def register(routes: web.RouteTableDef) -> None:
    for route in ROUTES:
        routes.route(route.method, route.path)(v1.guarded(route.handler))
    watch()
