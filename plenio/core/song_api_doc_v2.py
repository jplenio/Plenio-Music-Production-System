"""The OpenAPI 3.1 document of the Song API v2 (PD 8.1): made from the templates as v1's is, with v1's schemas where
an answer kept its shape (templates, briefs, uploads, files, bars, models, the queue) and v2's own for jobs, review
stops, songs, events and access.

``openapi_v2`` is what ``GET /plenio/api/v2/openapi.json`` answers and what ``tools/api_docs.py`` writes to
``docs/api/openapi.json``; a test keeps the committed copy equal to the generated one.
"""

from __future__ import annotations

import copy
from collections.abc import Iterable
from typing import Any

from .song_api import API_NAME, Template
from .song_api_doc import openapi as openapi_v1

API_VERSION = "2.0"
"""The Song API v2's version (2.x only adds)."""

BASE = "/plenio/api/v2"
JOB_STATUSES = ("queued", "running", "waiting_for_review", "succeeded", "failed", "cancelled")
REVIEW_STAGES = ("text", "score")
AGAIN_AS = ("take", "again", "like", "cover")
EVENT_KINDS = (
    "job.queued",
    "job.running",
    "job.progress",
    "job.waiting",
    "job.succeeded",
    "job.failed",
    "job.cancelled",
    "download.queued",
    "download.progress",
    "download.paused",
    "download.verifying",
    "download.done",
    "download.blocked",
    "download.failed",
    "download.cancelled",
    "sync",
)
ERROR_CODES = (
    "bad_request",
    "unknown_template",
    "unknown_field",
    "invalid_value",
    "missing_field",
    "not_supported",
    "comfyui_rejected",
    "models_missing",
    "needs_review",
    "not_found",
    "too_large",
    "unsupported_media_type",
    "not_ready",
    "unauthorized",
    "remote_off",
    "busy",
    "internal",
)
"""``error.code`` of v2: v1's and ``models_missing``, ``needs_review``, ``unauthorized``, ``remote_off``, ``busy``;
a job's own ``error.code`` may also be ``interrupted`` (ComfyUI stopped while it ran)."""


def ref(name: str) -> dict[str, Any]:
    return {"$ref": f"#/components/schemas/{name}"}


def _answer(schema: dict[str, Any], text: str = "OK", example: Any = None) -> dict[str, Any]:
    content: dict[str, Any] = {"schema": schema}
    if example is not None:
        content["example"] = example
    return {"description": text, "content": {"application/json": content}}


REFUSALS = {
    "400": "Refused: the error names the field and why",
    "401": "Another computer without a valid token (Authorization: Bearer plenio_...)",
    "403": 'This ComfyUI answers no other computer ([api] remote = "off")',
    "404": "Not found (or another caller's)",
    "409": "Not in the state the call needs",
    "413": "Too large",
    "415": "Not the type the call takes",
    "422": "No template makes the song",
    "503": "Busy: ComfyUI's queue does not answer, or too many event streams",
}


def _refused(*codes: str) -> dict[str, Any]:
    return {code: _answer(ref("Error"), REFUSALS[code]) for code in codes}


def _param(name: str, text: str, where: str = "path", schema: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "name": name,
        "in": where,
        "required": where == "path",
        "schema": schema or {"type": "string"},
        "description": text,
    }


JOB_ID = _param("id", "The job's id (job_ followed by 32 hex digits)")
SONG_ID = _param("id", "The song's id (from GET /songs)")
FILE_NAME = _param("name", "A file's name as the result lists it")
LIMIT = _param("limit", "At most this many (1-200, default 200)", "query", {"type": "integer", "minimum": 1})


def _post(schema: dict[str, Any], text: str) -> dict[str, Any]:
    return {"required": True, "content": {"application/json": {"schema": schema}}, "description": text}


def _editor(operation: str, summary: str, body: dict[str, Any], answer: dict[str, Any]) -> dict[str, Any]:
    return {
        "post": {
            "tags": ["Scores"],
            "operationId": operation,
            "summary": summary,
            "requestBody": _post(body, summary),
            "responses": {"200": _answer(answer), **_refused("400")},
        }
    }


def _object(properties: dict[str, Any], required: Iterable[str] = (), text: str = "") -> dict[str, Any]:
    schema: dict[str, Any] = {"type": "object", "properties": properties}
    if required:
        schema["required"] = list(required)
    if text:
        schema["description"] = text
    return schema


TEXT = {"type": "string"}
SECONDS = {"type": ["number", "null"], "description": "Seconds since 1970 (UTC)"}
SONG = {
    "id": {"type": "string", "description": "The song's id (stable while its record stays where it is)"},
    "title": TEXT,
    "created": {"type": ["string", "null"], "description": "When it was made (ISO 8601)"},
    "plenio": {"type": ["string", "null"], "description": "The Plenio version that made it"},
    "seconds": {"type": ["number", "null"], "description": "Its length"},
    "workflow": {"type": ["string", "null"], "description": "The workflow that made it"},
}

EXAMPLE_JOB: dict[str, Any] = {
    "id": "job_5d0c4e1b9a7f42c08e3b6a1d2f9c7e40",
    "template": "yue2-song",
    "kind": "song",
    "status": "waiting_for_review",
    "stage": None,
    "progress": None,
    "queue_position": None,
    "created_at": 1762858800.0,
    "updated_at": 1762858861.4,
    "ended_at": None,
    "seeds": {"draft": 11, "plan": 12, "arrangement": 13, "take": 14},
    "client": {"name": "My app"},
    "review": ["text"],
    "waiting_at": "text",
    "documents": {
        "title": {"text": "Paper Lanterns", "sha256": "4c1f…"},
        "lyrics": {"text": "[verse]\nPaper lanterns on the river…", "sha256": "9b2e…"},
    },
    "result": None,
    "error": None,
    "links": {"self": f"{BASE}/jobs/job_5d0c4e1b9a7f42c08e3b6a1d2f9c7e40"},
}
"""An invented job, waiting at its text stop."""


def _schemas(v1: dict[str, Any], templates: list[Template]) -> dict[str, Any]:
    kept = {
        name: copy.deepcopy(v1["components"]["schemas"][name])
        for name in ("Bars", "Models", "TemplateSummary", "Field", "TemplateDetail", "Briefs", "Stage", "Progress",
                     "File", "Result", "Queue")
    }  # fmt: skip
    error = copy.deepcopy(v1["components"]["schemas"]["Error"])
    inner = error["properties"]["error"]["properties"]
    inner["code"]["examples"] = list(ERROR_CODES)
    inner["details"]["description"] = (
        "comfyui_rejected and models_missing: the nodes and why (models_missing: the missing files)"
    )
    requests = {}
    for template in templates:
        name = f"JobRequest_{template.id.replace('-', '_')}"
        schema = copy.deepcopy(v1["components"]["schemas"][name])
        schema["properties"]["review"] = {
            "type": "array",
            "items": {"type": "string", "enum": list(REVIEW_STAGES)},
            "description": (
                "Stop at these Song Sheet stages and wait for POST /jobs/{id}/approve: 'text' (title, style, "
                "lyrics), 'score' (the score). [] stops nowhere - the DAW template's sheet then stops by itself "
                "only when the request leaves 'review' out."
            ),
        }
        requests[name] = schema
    document = _object(
        {"text": TEXT, "sha256": {"type": "string", "description": "SHA-256 of the text (UTF-8), hex"}},
        ("text", "sha256"),
    )
    return {
        "Error": error,
        "Index": _object(
            {
                "api": {"type": "string", "const": API_NAME},
                "version": {"type": "string", "description": "The API's version (2.x only adds)"},
                "plenio": TEXT,
                "comfyui": TEXT,
                "templates": {"type": "array", "items": ref("TemplateSummary")},
                "paths": {"type": "object", "additionalProperties": TEXT},
                "docs": TEXT,
            }
        ),
        **kept,
        "Preset": _object(
            {
                "id": TEXT,
                "name": TEXT,
                "text": TEXT,
                "fields": {"type": "object", "description": "The fields and release values it sets"},
            }
        ),
        "Document": document,
        "Documents": _object(
            {
                "stage": {
                    "type": ["string", "null"],
                    "description": "The review stop it waits at; null: the made song's documents",
                },
                "documents": {"type": "object", "additionalProperties": ref("Document")},
            }
        ),
        "Job": _object(
            {
                "id": {
                    "type": "string",
                    "description": "job_ and 32 hex digits; kept on disk, across restarts",
                },
                "template": TEXT,
                "kind": {"type": "string", "description": "song, cover, daw or master"},
                "status": {"type": "string", "enum": list(JOB_STATUSES)},
                "stage": {"oneOf": [ref("Stage"), {"type": "null"}]},
                "progress": {"oneOf": [ref("Progress"), {"type": "null"}]},
                "queue_position": {"type": ["integer", "null"], "description": "1: next to run"},
                "created_at": SECONDS,
                "updated_at": SECONDS,
                "ended_at": SECONDS,
                "seeds": {"type": "object", "additionalProperties": {"type": "integer"}},
                "client": {"type": "object", "additionalProperties": TEXT},
                "review": {"type": "array", "items": TEXT, "description": "The stops the request asked for"},
                "waiting_at": {
                    "type": ["string", "null"],
                    "description": "waiting_for_review: the stop ('text' or 'score')",
                },
                "documents": {
                    "oneOf": [{"type": "object", "additionalProperties": ref("Document")}, {"type": "null"}],
                    "description": "waiting_for_review: the documents as the Song Sheet shows them",
                },
                "result": {"oneOf": [ref("Result"), {"type": "null"}]},
                "error": {
                    "oneOf": [
                        _object(
                            {"code": TEXT, "message": TEXT, "type": TEXT, "node": TEXT, "title": TEXT},
                            text="code 'interrupted': ComfyUI stopped while the job ran - post it again",
                        ),
                        {"type": "null"},
                    ]
                },
                "links": {"type": "object", "additionalProperties": TEXT},
            },
            ("id", "status"),
        ),
        "Jobs": _object({"jobs": {"type": "array", "items": ref("Job")}}),
        "Approval": _object(
            {
                "documents": {
                    "type": "object",
                    "additionalProperties": TEXT,
                    "description": (
                        "Optional: documents by kind, edited or not; an edited one becomes the Song Sheet's "
                        "manual text"
                    ),
                }
            }
        ),
        "Timings": _object(
            {
                "job": TEXT,
                "timings": {
                    "type": ["object", "null"],
                    "description": "Seconds per group of the workflow, and of it loading models",
                },
            }
        ),
        "SongRow": _object(
            {
                **SONG,
                "files": _object(
                    {"audio": {"type": "boolean"}, "cover": {"type": "boolean"}},
                    text="Whether it has an audio file and a cover picture",
                ),
            },
            text="A released song (a release record in ComfyUI's output folder)",
        ),
        "Songs": _object({"songs": {"type": "array", "items": ref("SongRow")}}),
        "Song": _object(
            {
                **SONG,
                "files": {"type": "array", "items": ref("File")},
                "documents": {"type": "object", "additionalProperties": ref("Document")},
                "timings": {"type": ["object", "null"]},
            }
        ),
        "Again": _object(
            {
                "as": {
                    "type": "string",
                    "enum": list(AGAIN_AS),
                    "default": "take",
                    "description": (
                        "take: a new take of the song (its documents, a new take seed); again: as it was made; "
                        "like: a new song of its brief; cover: a cover of its audio (yue2-cover)"
                    ),
                },
                "fields": {
                    "type": "object",
                    "description": "Fields that change the request (a cover's fields)",
                },
            }
        ),
        "Names": _object(
            {"writers": {"type": "array", "items": TEXT}, "loras": {"type": "array", "items": TEXT}}
        ),
        "ModelPlan": {
            "type": "object",
            "description": (
                "Plenio Setup's model plan for this computer: per template the variants it would use, what is "
                "there and what a download would add (no folder of this computer in it)"
            ),
        },
        "Event": _object(
            {
                "id": {"type": "string", "description": "<instance>-<number>: send it back as Last-Event-ID"},
                "event": {"type": "string", "enum": list(EVENT_KINDS)},
                "data": {
                    "type": "object",
                    "description": (
                        "job.*: id, status, waiting_at, stage, progress (no content); download.*: id, file, "
                        "state, bytes, done (this computer only); sync: what you missed is no longer kept - "
                        "read GET /jobs again"
                    ),
                },
            },
            text="One Server-Sent Event (id:, event:, data: lines)",
        ),
        **requests,
    }


V2_TEXTS = (
    ("Fixed in API v1 (no review stops).", "Fixed in the API: a job asks for review stops with 'review'."),
    ("(POST /from-record gives them)", "(POST /songs/{id}/again makes one)"),
    ("Not changeable in v1", "Not changeable through the API"),
    ("API 1.4: ", ""),
    (" (API 1.4)", ""),
    ("Since 1.4 a", "A"),
    ("Since 1.4: ", ""),
)
"""v1's texts that the schemas v2 shares with it say of v1: as v2 says it."""


def _v2_texts(value: Any) -> Any:
    if isinstance(value, str):
        for old, new in V2_TEXTS:
            value = value.replace(old, new)
        return value
    if isinstance(value, dict):
        return {key: _v2_texts(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_v2_texts(item) for item in value]
    return value


def openapi_v2(templates: Iterable[Template], *, plenio: str = "", comfyui: str = "") -> dict[str, Any]:
    """The OpenAPI 3.1 document of ``/plenio/api/v2``: every path, an ``operationId`` per call, the templates'
    request schemas with ``review``, the bearer token for other computers."""
    templates = list(templates)
    v1 = _v2_texts(openapi_v1(templates, plenio=plenio, comfyui=comfyui))
    old = v1["paths"]
    requests = [ref(f"JobRequest_{t.id.replace('-', '_')}") for t in templates]

    def reuse(path: str, method: str, tags: list[str] | None = None) -> dict[str, Any]:
        operation: dict[str, Any] = copy.deepcopy(old[path][method])
        if tags:
            operation["tags"] = tags
        return operation

    paths: dict[str, Any] = {
        "/": {
            "get": {
                "tags": ["Discovery"],
                "operationId": "getApi",
                "summary": "The API: its version, Plenio's and ComfyUI's, the templates, the paths",
                "responses": {"200": _answer(ref("Index"))},
            }
        },
        "/openapi.json": {"get": reuse("/openapi.json", "get")},
        "/templates": {"get": reuse("/templates", "get")},
        "/templates/{id}": {"get": reuse("/templates/{id}", "get")},
        "/briefs": {"get": reuse("/briefs", "get")},
        "/presets": {
            "get": {
                "tags": ["Discovery"],
                "operationId": "listPresets",
                "summary": "The player's six presets: what each sets (a job names one as 'preset')",
                "responses": {
                    "200": _answer(_object({"presets": {"type": "array", "items": ref("Preset")}}))
                },
            }
        },
        "/models": {"get": reuse("/models", "get", ["System"])},
        "/models/plan": {
            "get": {
                "tags": ["System"],
                "operationId": "getModelPlan",
                "summary": "The model plan for this computer: the variants each template would use",
                "responses": {"200": _answer(ref("ModelPlan"))},
            }
        },
        "/writers": {
            "get": {
                "tags": ["System"],
                "operationId": "listWriters",
                "summary": "The writer models a form may offer (the 'writer' field's list)",
                "responses": {"200": _answer(ref("Names"))},
            }
        },
        "/loras": {
            "get": {
                "tags": ["System"],
                "operationId": "listLoras",
                "summary": "The LoRA files in ComfyUI's models/loras (names only)",
                "responses": {"200": _answer(ref("Names"))},
            }
        },
        "/jobs": {
            "post": {
                "tags": ["Jobs"],
                "operationId": "createJob",
                "summary": "Make a song: queue a job of a template (with review stops, a preset, documents)",
                "parameters": [
                    _param(
                        "Idempotency-Key",
                        "The same key gives the same job (yours, not interrupted): a retry makes no second song",
                        "header",
                    )
                ],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"oneOf": requests, "discriminator": {"propertyName": "template"}},
                            "example": {
                                "template": "yue2-song",
                                "fields": {"genre": "bossa nova", "description": "rain on a tin roof"},
                                "review": ["text"],
                            },
                        }
                    },
                },
                "responses": {
                    "201": _answer(
                        ref("Job"),
                        "Queued",
                        {
                            **EXAMPLE_JOB,
                            "status": "queued",
                            "waiting_at": None,
                            "documents": None,
                            "queue_position": 1,
                        },
                    ),  # fmt: skip
                    "200": _answer(ref("Job"), "The job its Idempotency-Key named"),
                    **_refused("400", "404", "503"),
                },
            },
            "get": {
                "tags": ["Jobs"],
                "operationId": "listJobs",
                "summary": "Your jobs, newest first (kept on disk: the newest 500, 30 days)",
                "parameters": [
                    _param(
                        "status", "Only jobs of these statuses, comma-separated (queued,running)", "query"
                    ),
                    LIMIT,
                ],
                "responses": {"200": _answer(ref("Jobs"))},
            },
        },
        "/jobs/{id}": {
            "get": {
                "tags": ["Jobs"],
                "operationId": "getJob",
                "summary": "A job: its status, stage, the documents at a review stop, its files when it succeeded",
                "parameters": [
                    JOB_ID,
                    _param(
                        "wait",
                        "Seconds to wait for a change of its status, place in the queue or stage (at most 60)",
                        "query",
                        {"type": "number", "minimum": 0, "maximum": 60},
                    ),
                ],
                "responses": {"200": _answer(ref("Job"), example=EXAMPLE_JOB), **_refused("400", "404")},
            },
            "delete": {
                "tags": ["Jobs"],
                "operationId": "cancelJob",
                "summary": "Cancel a job: out of the queue while it waits, interrupted while it runs",
                "parameters": [JOB_ID],
                "responses": {"200": _answer(ref("Job")), **_refused("404")},
            },
        },
        "/jobs/{id}/approve": {
            "post": {
                "tags": ["Jobs"],
                "operationId": "approveJob",
                "summary": "Let a job that waits at a review stop go on, with its documents edited or not",
                "parameters": [JOB_ID],
                "requestBody": {
                    "required": False,
                    "content": {
                        "application/json": {
                            "schema": ref("Approval"),
                            "example": {"documents": {"title": "Paper Lanterns at Dawn"}},
                        }
                    },
                },
                "responses": {"202": _answer(ref("Job"), "Queued again"), **_refused("400", "404", "409")},
            }
        },
        "/jobs/{id}/documents": {
            "get": {
                "tags": ["Jobs"],
                "operationId": "getJobDocuments",
                "summary": "The job's documents: at its review stop, or of its song once made",
                "parameters": [JOB_ID],
                "responses": {"200": _answer(ref("Documents")), **_refused("404")},
            }
        },
        "/jobs/{id}/files/{name}": {"get": reuse("/jobs/{id}/files/{name}", "get")},
        "/jobs/{id}/timings": {
            "get": {
                "tags": ["Jobs"],
                "operationId": "getJobTimings",
                "summary": "Where a made song's time went: seconds per group, of it loading models",
                "parameters": [JOB_ID],
                "responses": {"200": _answer(ref("Timings")), **_refused("404")},
            }
        },
        "/jobs/{id}/bars": {"get": reuse("/jobs/{id}/bars", "get")},
        "/songs": {
            "get": {
                "tags": ["Songs"],
                "operationId": "listSongs",
                "summary": "The released songs (records in ComfyUI's output folder), newest first",
                "parameters": [_param("q", "Words of the title, the date or the folder", "query"), LIMIT],
                "responses": {"200": _answer(ref("Songs"))},
            }
        },
        "/songs/{id}": {
            "get": {
                "tags": ["Songs"],
                "operationId": "getSong",
                "summary": "A song: its files, documents and timings",
                "parameters": [SONG_ID],
                "responses": {"200": _answer(ref("Song")), **_refused("404")},
            }
        },
        "/songs/{id}/files/{name}": {
            "get": {
                "tags": ["Songs"],
                "operationId": "getSongFile",
                "summary": "A file of a song",
                "parameters": [SONG_ID, FILE_NAME],
                "responses": {
                    "200": {"description": "The file", "content": {"application/octet-stream": {}}},
                    **_refused("404"),
                },
            }
        },
        "/songs/{id}/again": {
            "post": {
                "tags": ["Songs"],
                "operationId": "makeSongAgain",
                "summary": "Make a song again: a new take, as it was, a new song like it, or a cover of it",
                "parameters": [
                    SONG_ID,
                    _param("Idempotency-Key", "As for POST /jobs", "header"),
                ],
                "requestBody": _post(ref("Again"), "How to make it again"),
                "responses": {"201": _answer(ref("Job"), "Queued"), **_refused("400", "404", "422")},
            }
        },
        "/scores/analyze": _editor(
            "analyzeScore",
            "A score (ABC) as the Song Sheet's editor sees it: measures, findings, the lyrics under the notes",
            _object({"abc": TEXT, "lyrics": TEXT, "spans": {"type": "array"}}, ("abc",)),
            {"type": "object"},
        ),
        "/scores/transform": _editor(
            "transformScore",
            "An editor operation on a score: transpose, move, fit notes to the lyrics, …",
            _object({"abc": TEXT, "operation": {"type": "object"}}, ("abc", "operation")),
            _object({"abc": TEXT, "changes": {"type": "array"}, "warnings": {"type": "array"}}),
        ),
        "/scores/import/midi": _editor(
            "importMidi",
            "A MIDI file (base64, 8 MB at most) as a score",
            _object({"data": TEXT, "grid": {"type": "integer"}}, ("data",)),
            {"type": "object"},
        ),
        "/scores/import/musicxml": _editor(
            "importMusicXml",
            "A MusicXML file Plenio wrote as a score, with its lyrics",
            _object({"text": TEXT, "abc": TEXT, "lyrics": TEXT}, ("text",)),
            {"type": "object"},
        ),
        "/scores/export/midi": _editor(
            "exportMidi",
            "A score as a standard MIDI file (base64)",
            _object({"abc": TEXT, "title": TEXT, "guide": {}}, ("abc",)),
            _object({"filename": TEXT, "data": TEXT}),
        ),
        "/scores/export/musicxml": _editor(
            "exportMusicXml",
            "A score as MusicXML 4.0, the lyrics under the notes",
            _object({"abc": TEXT, "title": TEXT, "lyrics": TEXT}, ("abc",)),
            _object({"filename": TEXT, "data": TEXT, "type": TEXT}),
        ),
        "/lyrics/analyze": _editor(
            "analyzeLyrics",
            "Lyrics checked as the Song Sheet checks them: findings, sections, language",
            _object({"lyrics": TEXT, "instrumental": {"type": "boolean"}, "engine": TEXT}, ("lyrics",)),
            {"type": "object"},
        ),
        "/uploads": {"post": reuse("/uploads", "post")},
        "/events": {
            "get": {
                "tags": ["Events"],
                "operationId": "streamEvents",
                "summary": "Server-Sent Events of your jobs (and, on this computer, of downloads)",
                "parameters": [
                    _param(
                        "Last-Event-ID",
                        "The last event's id: what you missed is sent first (or 'sync' when it is no longer kept)",
                        "header",
                    )
                ],
                "responses": {
                    "200": {
                        "description": "An open stream; a comment line every 15 s keeps it open",
                        "content": {"text/event-stream": {"schema": ref("Event")}},
                    },
                    **_refused("503"),
                },
            }
        },
        "/queue": {"get": reuse("/queue", "get")},
    }
    for path, operations in paths.items():
        for operation in operations.values():
            operation.setdefault("responses", {}).update(_refused("401", "403"))
            for parameter in operation.get("parameters", []):
                if (
                    parameter.get("in") == "path"
                    and parameter.get("name") == "id"
                    and path.startswith("/jobs")
                ):
                    parameter["description"] = JOB_ID["description"]
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Plenio Song API",
            "version": API_VERSION,
            "summary": "Make songs with Plenio on a running ComfyUI: every template, review stops, songs, events.",
            "description": (
                "Make songs with the Plenio Music Production System on a running ComfyUI: choose one of the five "
                "templates, give its fields, queue the job - stop it where the Song Sheet stops to read or edit "
                "the lyrics and the score -, follow it (?wait or the event stream), download its files; make a "
                f"released song again. Plenio {plenio}, ComfyUI {comfyui}. Jobs are kept on disk and survive a "
                "restart of ComfyUI. This computer needs no token; another computer sends one (Plenio Setup > "
                "API access). The path carries the major version (/v2); a minor version only adds. v1 stays "
                "served as it was. Guide: docs/api/README.md."
            ),
            "license": {"name": "Apache-2.0", "identifier": "Apache-2.0"},
            "x-api-name": API_NAME,
        },
        "servers": [{"url": BASE, "description": "This ComfyUI"}],
        "security": [{}, {"token": []}],
        "tags": [
            {
                "name": "Discovery",
                "description": "What this ComfyUI's API offers: templates, fields, presets",
            },
            {"name": "System", "description": "Models, the model plan, the lists a form needs"},
            {
                "name": "Jobs",
                "description": "Make a song, follow it, review it, cancel it, download its files",
            },
            {"name": "Songs", "description": "The released songs, and making one again"},
            {"name": "Scores", "description": "The Song Sheet editor's functions: scores and lyrics"},
            {"name": "Sources", "description": "Recordings for covers"},
            {"name": "Events", "description": "One stream for jobs and downloads"},
        ],
        "paths": paths,
        "components": {
            "schemas": _schemas(v1, templates),
            "securitySchemes": {
                "token": {
                    "type": "http",
                    "scheme": "bearer",
                    "description": (
                        'Another computer only (with [api] remote = "token", the default): a token made in Plenio '
                        "Setup > API access, 'Authorization: Bearer plenio_...'. This computer needs none."
                    ),
                }
            },
        },
    }
