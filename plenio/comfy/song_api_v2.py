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
import json
import random
import threading
import time
from pathlib import Path
from typing import Any

from aiohttp import web

from .. import __version__
from ..core import continuation, song_api
from ..core.access import Route
from ..core.api import review, songs
from ..core.api.jobstore import ACTIVE, ENDED, Job, JobStore
from ..core.errors import PlenioUserError
from ..core.hashing import sha256_text
from ..core.presets import with_preset
from ..core.song_api import SongApiError
from . import host, routes, setup
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


_refresh_lock = threading.Lock()


def refresh(job: Job) -> tuple[Job, dict[str, Any] | None]:
    """The job with what ComfyUI says of its last prompt, written when its state changed; and that prompt's v1
    view (stage, progress, the queue position), ``None`` when ComfyUI no longer knows it. One at a time: the
    watcher and a request may both look at a job, and the second must see what the first wrote."""
    with _refresh_lock:
        return _refresh(store().get(job.id) or job)


def _refresh(job: Job) -> tuple[Job, dict[str, Any] | None]:
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
    if status == "succeeded":
        history = v1._history(job.prompts[-1])
        stop = review.waiting(history) if history is not None else None
        if stop is not None:
            if job.status != "waiting_for_review" or job.stage != stop["stage"]:
                job = store().update(
                    job.id, status="waiting_for_review", stage=stop["stage"], result={"waiting": stop}
                )
            return job, view
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
        "documents": _shown(job),
        "result": _v2_result(job),
        "error": dict(job.error) if job.error else None,
        "links": {"self": f"{BASE}/jobs/{job.id}"},
    }


def _shown(job: Job) -> dict[str, Any] | None:
    """The documents a review stop shows, each with its SHA-256 (``None`` while the job waits at no stop)."""
    if job.status != "waiting_for_review" or not job.result:
        return None
    documents = (job.result.get("waiting") or {}).get("documents") or {}
    return {kind: {"text": text, "sha256": sha256_text(text)} for kind, text in documents.items()}


def _v2_result(job: Job) -> dict[str, Any] | None:
    if job.result is None or "waiting" in job.result:
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
    return await create_job(data, key, OWNER_HERE)


async def create_job(data: dict[str, Any], key: str, owner: str) -> web.StreamResponse:
    """Queue a job (``POST /jobs``, ``POST /songs/{id}/again``): 201 with the job, 200 with the job its key named."""
    jobs = store()
    known = jobs.by_key(owner, key)
    if known is not None:
        job, view = refresh(known)
        return web.json_response(job_answer(job, view), status=200)
    asked = "review" in data  # an empty list too: stop nowhere (the DAW template's sheet stops by itself)
    wanted = data.pop("review", None) or []
    if not isinstance(wanted, list) or not all(isinstance(stage, str) for stage in wanted):
        raise SongApiError("invalid_value", "'review' is a list of stages ('text', 'score').", field="review")
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
    unknown = review.unknown_stages(prepared.prompt, wanted)
    if unknown:
        raise SongApiError(
            "invalid_value",
            f"The template {template.id!r} has no review stop {unknown[0]!r}.",
            hint=f"Its stops: {', '.join(sorted(set(review.stages(prepared.prompt).values())))}.",
            field="review",
        )
    if asked:
        review.set_stops(prepared.prompt, wanted, [])
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
        owner=owner,
        key=key,
        client=client,
        request={
            "fields": {k: v for k, v in prepared.fields.items() if not isinstance(v, (dict, list))},
            "release": dict(prepared.release),
            "seeds": dict(prepared.seeds),
            "warnings": list(prepared.warnings),
            # to queue it again at an approval: the request as it was taken, with its seeds fixed
            "source": {**data, "seeds": dict(prepared.seeds)},
            "review": list(wanted),
            "approved": [],
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


async def job_approve(request: web.Request) -> web.StreamResponse:
    """Let a job that waits at a review stop go on: ``{"documents": {kind: text}}`` (optional) - an edited
    document becomes the Song Sheet's manual text; the same request is queued again under the same job, the
    approved stops passed."""
    job, _view = await asyncio.to_thread(refresh, _known(request.match_info["job_id"]))
    if job.status != "waiting_for_review" or not job.result:
        raise SongApiError(
            "needs_review", f"The job waits at no review stop (it is {job.status}).", status=409
        )
    body = await v1._body(request)
    stop = dict(job.result.get("waiting") or {})
    try:
        changed = review.edited(stop.get("documents") or {}, body.get("documents"))
    except ValueError as error:
        raise SongApiError("invalid_value", str(error), field="documents") from error
    kept = dict(job.request)
    source = dict(kept.get("source") or {})
    source["documents"] = {**dict(source.get("documents") or {}), **changed}
    approved = [*kept.get("approved", []), stop.get("stage", "")]
    info = v1._lookup()
    prepared = song_api.prepare(
        _template(job.template, info), source, info, rng=random.Random(), styles=v1._style
    )
    review.set_stops(prepared.prompt, kept.get("review") or [], approved)
    meta = {"api": API_VERSION, "template": job.template, "kind": job.kind, "client": dict(job.client),
            "seeds": prepared.seeds, "documents": prepared.documents}  # fmt: skip
    answer = await v1._post_prompt(prepared.prompt, prepared.workflow, meta)
    job = store().update(
        job.id,
        status="queued",
        stage="",
        result=None,
        prompt=str(answer["prompt_id"]),
        request={**kept, "source": source, "approved": approved},
    )
    watch()
    return web.json_response(job_answer(job), status=202)


async def job_documents(request: web.Request) -> web.StreamResponse:
    """The job's documents: those its review stop shows while it waits, those of its song once it is made."""
    job, _view = await asyncio.to_thread(refresh, _known(request.match_info["job_id"]))
    shown = _shown(job)
    if shown is not None:
        return web.json_response({"stage": job.stage, "documents": shown})
    if job.status == "succeeded" and job.prompts:
        record = await asyncio.to_thread(v1._finished_record, job.prompts[-1])
        data = json.loads(await asyncio.to_thread(record.read_text, encoding="utf-8"))
        documents = {
            str(kind): {"text": str(doc.get("text") or ""), "sha256": sha256_text(str(doc.get("text") or ""))}
            for kind, doc in (data.get("documents") or {}).items()
            if isinstance(doc, dict)
        }
        return web.json_response({"stage": None, "documents": documents})
    raise SongApiError("not_found", f"The job has no documents yet (it is {job.status}).", status=404)


async def job_timings(request: web.Request) -> web.StreamResponse:
    """Where the job's time went (the record's ``timings``: seconds per group, of it loading models)."""
    job = _known(request.match_info["job_id"])
    if job.status != "succeeded" or not job.prompts:
        raise SongApiError("not_found", f"The job has no song yet (it is {job.status}).", status=404)
    record = await asyncio.to_thread(v1._finished_record, job.prompts[-1])
    data = json.loads(await asyncio.to_thread(record.read_text, encoding="utf-8"))
    return web.json_response({"job": job.id, "timings": data.get("timings")})


async def job_bars(request: web.Request) -> web.StreamResponse:
    """The bars of the take in its audio (as API v1's, for the job's last run)."""
    from ..core.bars import record_bars

    job = _known(request.match_info["job_id"])
    if not job.prompts:
        raise SongApiError("not_found", "This job made no song.", status=404)
    record = await asyncio.to_thread(v1._finished_record, job.prompts[-1])
    try:
        answer = await asyncio.to_thread(record_bars, record)
    except (OSError, ValueError, PlenioUserError) as error:
        raise SongApiError(
            "internal", f"The bars of the take were not measured: {error}", status=500
        ) from error
    return web.json_response({"job": job.id, **answer})


async def models_plan(request: web.Request) -> web.StreamResponse:
    """The model plan of every template for this computer (Plenio Setup's; no folder of this computer in it)."""
    return await setup.plan_get(request)


# --- routes: songs --------------------------------------------------------------------------------------------


def _record_of(song: str) -> Path:
    try:
        return continuation.record_path(host.output_directory(), songs.relative_of(song))
    except PlenioUserError as error:
        raise SongApiError("not_found", str(error), status=404) from error


async def songs_list(request: web.Request) -> web.StreamResponse:
    """The released songs (the records in ComfyUI's output folder), newest first; ``?q=`` words of the title, the
    date or the folder; ``?limit=``."""
    rows = await asyncio.to_thread(continuation.list_records, host.output_directory())
    return web.json_response(
        {"songs": songs.listing(rows, request.query.get("q", ""), v1._query_limit(request))}
    )


async def song_get(request: web.Request) -> web.StreamResponse:
    record = _record_of(request.match_info["song_id"])
    data = await asyncio.to_thread(continuation.read_record, record)
    relative = record.relative_to(host.output_directory().resolve()).as_posix()
    row = continuation.summary(data, relative)
    files = [
        {**({"role": f["role"]} if f.get("role") else {}), "name": str(f["name"]),
         "url": f"{BASE}/songs/{request.match_info['song_id']}/files/{f['name']}"}
        for f in data.get("files") or [] if isinstance(f, dict) and f.get("name")
    ]  # fmt: skip
    documents = {
        str(kind): {"text": str(doc.get("text") or ""), "sha256": sha256_text(str(doc.get("text") or ""))}
        for kind, doc in (data.get("documents") or {}).items()
        if isinstance(doc, dict)
    }
    return web.json_response(
        {**songs.song_row(row), "files": files, "documents": documents, "timings": data.get("timings")}
    )


async def song_file(request: web.Request) -> web.StreamResponse:
    record = _record_of(request.match_info["song_id"])
    data = await asyncio.to_thread(continuation.read_record, record)
    listed = [str(f["name"]) for f in data.get("files") or [] if isinstance(f, dict) and f.get("name")]
    path = song_api.result_file(record, request.match_info["name"], listed, host.output_directory())
    return web.FileResponse(path)


AUDIO = (".flac", ".mp3", ".wav")
AGAIN = ("again", "take", "like", "cover")
"""``again``: the song as it was made (its documents, seeds, settings); ``take``: a new take of it; ``like``: a new
song of its brief; ``cover``: a cover of its audio (``yue2-cover``)."""


async def song_again(request: web.Request) -> web.StreamResponse:
    """Make a song again: ``{"as": "take" | "again" | "like" | "cover", "fields": {...}}`` (fields change the
    request; for a cover they are the cover's)."""
    body = await v1._body(request)
    mode = body.get("as", "take")
    if mode not in AGAIN:
        raise SongApiError("invalid_value", f"'as' is one of {', '.join(AGAIN)}.", field="as")
    extra = body.get("fields") or {}
    if not isinstance(extra, dict):
        raise SongApiError("invalid_value", "'fields' is an object.", field="fields")
    record_file = _record_of(request.match_info["song_id"])
    record = await asyncio.to_thread(continuation.read_record, record_file)
    key = str(request.headers.get("Idempotency-Key") or "").strip()[:200]
    if mode == "cover":
        audio = next(  # the song's audio is the file without a role (as the record's summary takes it)
            (
                f
                for f in record.get("files") or []
                if isinstance(f, dict)
                and not f.get("role")
                and str(f.get("name", "")).lower().endswith(AUDIO)
            ),
            None,
        )
        if audio is None:
            raise SongApiError("not_found", "The song has no audio file to cover.", status=404)
        source = record_file.parent / str(audio["name"])
        name = await asyncio.to_thread(_into_input, source)
        data = {"template": "yue2-cover", "fields": {**extra, "source.audio": name}}
        return await create_job(data, key, OWNER_HERE)
    template = song_api.template_for_record(_templates(v1._lookup()), record)
    if template is None:
        raise SongApiError("unknown_template", "No template of the API makes this song again.", status=422)
    answer = song_api.request_from_record(template, record)
    data = {
        "template": answer["template"],
        "fields": {**answer["fields"], **extra},
        "release": answer["release"],
    }
    if mode == "again":
        data.update(seeds=answer["seeds"], documents=answer["documents"])
    elif mode == "take":
        if not answer["take"]["possible"]:
            raise SongApiError("invalid_value", f"No new take: {answer['take'].get('why', '')}", field="as")
        data.update(
            seeds={k: v for k, v in answer["seeds"].items() if k != "take"}, documents=answer["documents"]
        )
    return await create_job(data, key, OWNER_HERE)


def _into_input(source: Path) -> str:
    """A song's audio copied into ComfyUI's input folder for a cover (named as the API's uploads are)."""
    import shutil

    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
    name = f"plenio-api-{digest}-{source.name.replace(' ', '-')}"
    target = host.input_directory() / name
    if not target.exists():
        shutil.copyfile(source, target)
    return name


async def writers(request: web.Request) -> web.StreamResponse:
    """The writer models a form may offer (Writer Choice's list on this ComfyUI)."""
    found = await asyncio.to_thread(host.node_info, "PlenioWriterChoice")
    spec = (((found or {}).get("input") or {}).get("required") or {}).get("model") or [[]]
    options = (
        spec[0] if isinstance(spec[0], list) else (spec[1] or {}).get("options", []) if len(spec) > 1 else []
    )
    return web.json_response({"writers": [str(o) for o in options]})


async def loras(request: web.Request) -> web.StreamResponse:
    """The LoRA files in ComfyUI's ``models/loras`` (names only)."""
    return web.json_response({"loras": sorted(await asyncio.to_thread(host.model_files, "loras"))})


# --- routes: scores and lyrics (the editor's functions behind versioned paths) ---------------------------------


def _editor(handler: Any) -> Any:
    """An editor route in v2's error shape: what it refuses is a ``bad_request``."""

    async def wrapped(request: web.Request) -> web.StreamResponse:
        try:
            return await handler(request)
        except PlenioUserError as error:
            raise SongApiError("bad_request", error.message, hint=error.hint or "") from error

    return wrapped


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
    _route("POST", "/jobs/{job_id}/approve", job_approve),
    _route("GET", "/jobs/{job_id}/documents", job_documents),
    _route("GET", "/jobs/{job_id}/timings", job_timings),
    _route("GET", "/jobs/{job_id}/bars", job_bars),
    _route("GET", "/models", v1.models_info),
    _route("GET", "/models/plan", models_plan),
    _route("GET", "/songs", songs_list),
    _route("GET", "/songs/{song_id}", song_get),
    _route("GET", "/songs/{song_id}/files/{name:.+}", song_file),
    _route("POST", "/songs/{song_id}/again", song_again),
    _route("GET", "/writers", writers),
    _route("GET", "/loras", loras),
    _route("POST", "/scores/analyze", _editor(routes.score_analyze)),
    _route("POST", "/scores/transform", _editor(routes.score_transform)),
    _route("POST", "/scores/import/midi", _editor(routes.score_midi_import)),
    _route("POST", "/scores/import/musicxml", _editor(routes.score_musicxml_import)),
    _route("POST", "/scores/export/midi", _editor(routes.score_midi_export)),
    _route("POST", "/scores/export/musicxml", _editor(routes.score_musicxml_export)),
    _route("POST", "/lyrics/analyze", _editor(routes.lyrics_analyze)),
    _route("POST", "/uploads", v1.upload),
    _route("GET", "/queue", v1.queue_info),
)
"""The Song API v2's routes (more follow in phase 5.3): all of the access class ``api``."""


def register(routes: web.RouteTableDef) -> None:
    for route in ROUTES:
        routes.route(route.method, route.path)(v1.guarded(route.handler))
    watch()
