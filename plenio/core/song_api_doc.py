"""The Song API described for programs: an OpenAPI 3.1 document, made from the same field lists the API checks
requests against - so it is as current as the templates (``GET /plenio/api/v1/openapi.json``)."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from .song_api import API_NAME, API_VERSION, DOCUMENT_LIMIT, LINE_LIMIT, TEXT_LIMIT, Field, Template

JOB_STATUSES = ("queued", "running", "succeeded", "failed", "cancelled", "waiting_for_review")
"""``waiting_for_review`` is reserved: a run stopped at a Song Sheet (review stops are not in v1)."""


def _schema(field: Field) -> dict[str, Any]:
    out: dict[str, Any]
    if field.type in ("text", "string", "upload"):
        out = {"type": "string", "maxLength": TEXT_LIMIT if field.type == "text" else LINE_LIMIT}
    elif field.type == "integer":
        out = {"type": "integer"}
    elif field.type == "number":
        out = {"type": "number"}
    elif field.type == "boolean":
        out = {"type": "boolean"}
    else:
        out = {"type": "string"}
        if field.choices:
            out["enum"] = list(field.choices)
    if field.type in ("integer", "number"):
        if field.minimum is not None:
            out["minimum"] = field.minimum
        if field.maximum is not None:
            out["maximum"] = field.maximum
    if field.type == "choice" and field.node_type == "PlenioSongBrief" and field.input == "length":
        out = {"oneOf": [out, {"type": "number", "description": "seconds: the nearest length"}]}
    out["title"] = field.label
    description = field.description
    if field.when:
        description += " " + "; ".join(
            f"Only when {parent} is {', '.join(values)}." for parent, values in field.when
        )
    if field.fixed:
        description += " Fixed in API v1 (no review stops)."
        out["const"] = field.default
    if description.strip():
        out["description"] = description.strip()
    out["default"] = field.default
    return out


def _request(template: Template) -> dict[str, Any]:
    return {
        "type": "object",
        "required": ["template"],
        "additionalProperties": False,
        "properties": {
            "template": {"const": template.id},
            "fields": {
                "type": "object",
                "properties": {f.id: _schema(f) for f in template.fields},
                "required": [f.id for f in template.fields if f.required],
            },
            "release": {"type": "object", "properties": {f.id: _schema(f) for f in template.release}},
            "seeds": {
                "type": "object",
                "properties": {
                    s.id: {"type": "integer", "minimum": 0, "maximum": 2**32 - 1, "title": s.title}
                    for s in template.seeds
                },
            },
            "documents": {
                "type": "object",
                "description": (
                    "Documents the Song Sheets keep as manual: the run keeps them instead of writing or planning "
                    "them anew. A song's documents with a new take seed make a new take of it (POST /from-record "
                    "gives them)."
                ),
                "properties": {
                    kind: {"type": "string", "maxLength": DOCUMENT_LIMIT} for kind in template.documents
                },
                "additionalProperties": False,
            },
            "client": {
                "type": "object",
                "description": "Who asks (kept with the job, shown in its listing): a name, a user, a reference.",
                "additionalProperties": {"type": "string"},
            },
            "strict": {
                "type": "boolean",
                "default": True,
                "description": "false: unknown fields are left out (named in warnings) instead of refused.",
            },
            "stems": {
                "type": "boolean",
                "default": False,
                "description": (
                    "API 1.4: the take's stems (vocals, drums, bass, other and the rest) are saved beside the song "
                    "and listed in its files (role 'stem'). The template separates them in every run anyway; the "
                    "sound of the song is the same."
                ),
            },
        },
    }


def openapi(templates: Iterable[Template], *, plenio: str = "", comfyui: str = "") -> dict[str, Any]:
    """The OpenAPI 3.1 document: every path with its parameters, the answers' schemas, an ``operationId`` per call
    (client generators name their functions by it) and the templates' request schemas."""
    templates = list(templates)

    def ref(name: str) -> dict[str, Any]:
        return {"$ref": f"#/components/schemas/{name}"}

    def answer(schema: dict[str, Any], text: str = "OK", example: Any = None) -> dict[str, Any]:
        content: dict[str, Any] = {"schema": schema}
        if example is not None:
            content["example"] = example
        return {"description": text, "content": {"application/json": content}}

    def refused(*codes: str) -> dict[str, Any]:
        texts = {
            "400": "Refused: the error names the field and why",
            "404": "Not found",
            "413": "Too large",
            "415": "Not the type the call takes",
            "422": "No template makes the record's song",
            "503": "ComfyUI's queue does not answer",
        }
        return {code: answer(ref("Error"), texts[code]) for code in codes}

    def path_id(name: str = "id", text: str = "The job's id (ComfyUI's prompt id)") -> dict[str, Any]:
        return {
            "name": name,
            "in": "path",
            "required": True,
            "schema": {"type": "string"},
            "description": text,
        }

    requests = [ref(f"JobRequest_{t.id.replace('-', '_')}") for t in templates]
    example_job: dict[str, Any] = {
        "id": "4f6c1d0e-8a3b-4e55-9d2c-0b7e2a1f9c33",
        "template": "yue2-song",
        "status": "running",
        "queue_position": None,
        "created_at": 1761484800.0,
        "started_at": 1761484803.2,
        "finished_at": None,
        "stage": {"group": "5 · RENDER", "text": "singing and playing", "index": 5, "of": 6},
        "progress": {"nodes_done": 41, "nodes": 88, "step": 12.0, "steps": 32.0},
        "seeds": {"draft": 11, "plan": 12, "arrangement": 13, "take": 14, "cover": 15},
        "documents": [],
        "client": {"name": "My app"},
        "result": None,
        "error": None,
        "warnings": [],
        "links": {"self": "/plenio/api/v1/jobs/4f6c1d0e-8a3b-4e55-9d2c-0b7e2a1f9c33"},
    }
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Plenio Song API",
            "version": API_VERSION,
            "summary": "Make songs with Plenio on a running ComfyUI, and follow them to the finished files.",
            "description": (
                "Make songs with the Plenio Music Production System on a running ComfyUI: choose a template, give its "
                "fields (the song part of the workflow), queue the job, follow it, download its files. "
                f"Plenio {plenio}, ComfyUI {comfyui}. The fields are read from the templates themselves, so this "
                "document is as current as the templates of this ComfyUI. Versioning: the path carries the major "
                "version (/v1); a minor version (1.1) only adds. Guide: docs/api/README.md."
            ),
            "license": {"name": "Apache-2.0", "identifier": "Apache-2.0"},
            "x-api-name": API_NAME,
        },
        "servers": [{"url": "/plenio/api/v1", "description": "This ComfyUI"}],
        "tags": [
            {
                "name": "Discovery",
                "description": "What this ComfyUI's API offers: templates, fields, style templates",
            },
            {"name": "Jobs", "description": "Make a song, follow it, cancel it, download its files"},
            {"name": "Sources", "description": "Recordings for covers, release records made again"},
        ],
        "paths": {
            "/": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "getApi",
                    "summary": "The API: its version, Plenio's and ComfyUI's, the templates, the paths",
                    "responses": {"200": answer(ref("Index"))},
                }
            },
            "/openapi.json": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "getOpenApi",
                    "summary": "This document",
                    "responses": {"200": answer({"type": "object"})},
                }
            },
            "/templates": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "listTemplates",
                    "summary": "The templates the API runs",
                    "responses": {
                        "200": answer(
                            {
                                "type": "object",
                                "required": ["templates"],
                                "properties": {
                                    "templates": {"type": "array", "items": ref("TemplateSummary")}
                                },
                            }
                        )
                    },
                }
            },
            "/templates/{id}": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "getTemplate",
                    "summary": "A template's fields, release fields, seeds and documents",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string", "enum": [t.id for t in templates]},
                        }
                    ],
                    "responses": {"200": answer(ref("TemplateDetail")), **refused("404")},
                }
            },
            "/briefs": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "listBriefs",
                    "summary": "The style templates and every value their fields have (the lists of a simple form)",
                    "parameters": [
                        {
                            "name": "kind",
                            "in": "query",
                            "schema": {"type": "string", "enum": ["song", "cover"], "default": "song"},
                        },
                        {
                            "name": "reload",
                            "in": "query",
                            "schema": {"type": "string", "enum": ["1"]},
                            "description": "1: read the style templates from disk again first",
                        },
                    ],
                    "responses": {"200": answer(ref("Briefs")), **refused("400")},
                }
            },
            "/uploads": {
                "post": {
                    "tags": ["Sources"],
                    "operationId": "uploadSource",
                    "summary": "A source recording for a cover (the body); the answer's name goes into source.audio",
                    "parameters": [
                        {
                            "name": "name",
                            "in": "query",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "The file's name with its extension (MP3, FLAC, WAV, OGG, M4A, OPUS, AAC, AIFF)",
                        }
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {"audio/*": {"schema": {"type": "string", "format": "binary"}}},
                    },
                    "responses": {
                        "201": answer(
                            {
                                "type": "object",
                                "required": ["name", "bytes"],
                                "properties": {"name": {"type": "string"}, "bytes": {"type": "integer"}},
                            },
                            "Saved in ComfyUI's input folder",
                            {"name": "plenio-api-3fa2b0c1d4e5-my-song.mp3", "bytes": 4810233},
                        ),
                        **refused("400", "413", "415"),
                    },
                }
            },
            "/jobs": {
                "get": {
                    "tags": ["Jobs"],
                    "operationId": "listJobs",
                    "summary": "The jobs made through the API that ComfyUI still knows, newest first",
                    "parameters": [
                        {
                            "name": "status",
                            "in": "query",
                            "schema": {"type": "string"},
                            "description": "Only jobs of these statuses, comma-separated (queued,running)",
                        },
                        {
                            "name": "client",
                            "in": "query",
                            "schema": {"type": "string"},
                            "description": "Only the jobs whose client.name is this",
                        },
                        {"name": "template", "in": "query", "schema": {"type": "string"}},
                        {
                            "name": "limit",
                            "in": "query",
                            "schema": {"type": "integer", "minimum": 1, "maximum": 200, "default": 200},
                        },
                    ],
                    "responses": {
                        "200": answer(
                            {
                                "type": "object",
                                "required": ["jobs"],
                                "properties": {"jobs": {"type": "array", "items": ref("Job")}},
                            }
                        ),
                        **refused("400"),
                    },
                },
                "post": {
                    "tags": ["Jobs"],
                    "operationId": "createJob",
                    "summary": "Make a song",
                    "parameters": [
                        {
                            "name": "Idempotency-Key",
                            "in": "header",
                            "schema": {"type": "string", "maxLength": 200},
                            "description": "The same key again (for 24 hours) returns the first job instead of a second song.",
                        }
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"oneOf": requests} if requests else {"type": "object"},
                                "example": {
                                    "template": "yue2-song",
                                    "fields": {
                                        "genre": "synthwave",
                                        "description": "a night drive through a rainy city",
                                        "length": "short (about 1:30)",
                                        "vocals": "sung",
                                        "language": "English",
                                        "finish.cover_art": True,
                                    },
                                    "release": {"album": "Night drives", "artist": "Me"},
                                    "client": {"name": "My app"},
                                },
                            }
                        },
                    },
                    "responses": {
                        "201": {
                            **answer(
                                ref("Job"), "Queued", {**example_job, "status": "queued", "queue_position": 1}
                            ),
                            "headers": {
                                "Location": {"schema": {"type": "string"}, "description": "The job's address"}
                            },
                        },
                        "200": answer(ref("Job"), "The job of this Idempotency-Key, made before"),
                        **refused("400", "404", "415", "503"),
                    },
                },
            },
            "/jobs/{id}": {
                "get": {
                    "tags": ["Jobs"],
                    "operationId": "getJob",
                    "summary": "A job: queued, running (with its stage), succeeded (with its files), failed or cancelled",
                    "parameters": [
                        path_id(),
                        {
                            "name": "wait",
                            "in": "query",
                            "schema": {"type": "number", "minimum": 0, "maximum": 60},
                            "description": (
                                "Seconds to wait for a change of its status, its place in the queue or its stage "
                                "before answering (at most 60): follow a song without asking every second"
                            ),
                        },
                    ],
                    "responses": {"200": answer(ref("Job"), "OK", example_job), **refused("400", "404")},
                },
                "delete": {
                    "tags": ["Jobs"],
                    "operationId": "cancelJob",
                    "summary": "Cancel a job: out of the queue while it waits, interrupted while it runs",
                    "parameters": [path_id()],
                    "responses": {"200": answer(ref("Job")), **refused("404")},
                },
            },
            "/jobs/{id}/files/{name}": {
                "get": {
                    "tags": ["Jobs"],
                    "operationId": "getJobFile",
                    "summary": "A file of a finished job's song: audio, cover, sheet music, subtitles, release record",
                    "description": (
                        "Each file of a job's result has its url. Byte ranges work (audio players seek). Since 1.4 a "
                        "name may hold one folder: the stems, '<name>-stems/vocals.flac'."
                    ),
                    "parameters": [
                        path_id(),
                        path_id("name", "The file's name, as the job's result lists it"),
                    ],
                    "responses": {
                        "200": {
                            "description": "The file",
                            "content": {
                                "application/octet-stream": {"schema": {"type": "string", "format": "binary"}}
                            },
                        },
                        **refused("404"),
                    },
                }
            },
            "/jobs/{id}/bars": {
                "get": {
                    "tags": ["Jobs"],
                    "operationId": "getJobBars",
                    "summary": "Where every bar of the take's score lies in its audio (API 1.4)",
                    "description": (
                        "A YuE2 take keeps no steady tempo. These are the times of every measure's start in the "
                        "score (at its own tempo) and in the take's audio, measured from the music - for a DAW's "
                        "tempo map, so that the metronome and further tracks keep to the take. 'bars' is null when "
                        "the score and the music do not meet ('why' says so). Measured once, then kept."
                    ),
                    "parameters": [path_id()],
                    "responses": {"200": answer(ref("Bars")), **refused("404")},
                }
            },
            "/models": {
                "get": {
                    "tags": ["Discovery"],
                    "operationId": "getModels",
                    "summary": "The model files the templates need: installed or missing, sizes, licences (API 1.4)",
                    "responses": {"200": answer(ref("Models"))},
                }
            },
            "/from-record": {
                "post": {
                    "tags": ["Sources"],
                    "operationId": "requestFromRecord",
                    "summary": "The request that makes a record's song again (a new take of it, or a new song)",
                    "description": (
                        "The body is a release record (<name>.plenio.json). The answer is a job request - template, "
                        "fields, release, seeds, documents - as the record's prompt has them, with 'take' (whether "
                        "its documents make a new take here) and 'warnings' (values the template no longer takes). "
                        "Leave out seeds.take for a new take; the documents and the seeds for a new song."
                    ),
                    "requestBody": {
                        "required": True,
                        "content": {"application/json": {"schema": {"type": "object"}}},
                    },
                    "responses": {
                        "200": answer(ref("FromRecord")),
                        **refused("400", "415", "422"),
                    },
                }
            },
            "/queue": {
                "get": {
                    "tags": ["Jobs"],
                    "operationId": "getQueue",
                    "summary": "How busy ComfyUI is, and how long API runs took lately (for estimates)",
                    "responses": {"200": answer(ref("Queue"))},
                }
            },
        },
        "components": {
            "schemas": {
                "Error": {
                    "type": "object",
                    "required": ["error"],
                    "properties": {
                        "error": {
                            "type": "object",
                            "required": ["code", "message"],
                            "properties": {
                                "code": {
                                    "type": "string",
                                    "description": "Stable, for programs",
                                    "examples": [
                                        "bad_request",
                                        "unknown_template",
                                        "unknown_field",
                                        "invalid_value",
                                        "missing_field",
                                        "not_supported",
                                        "comfyui_rejected",
                                        "not_found",
                                        "too_large",
                                        "unsupported_media_type",
                                        "not_ready",
                                        "internal",
                                    ],
                                },
                                "message": {"type": "string", "description": "For people"},
                                "hint": {"type": "string", "description": "What to do"},
                                "field": {"type": "string", "description": "The field it is about"},
                                "details": {"description": "comfyui_rejected: the nodes and why"},
                            },
                        }
                    },
                },
                "Index": {
                    "type": "object",
                    "properties": {
                        "api": {"type": "string", "const": API_NAME},
                        "version": {"type": "string", "description": "The API's version (1.x only adds)"},
                        "plenio": {"type": "string"},
                        "comfyui": {"type": "string"},
                        "templates": {"type": "array", "items": ref("TemplateSummary")},
                        "paths": {"type": "object", "additionalProperties": {"type": "string"}},
                        "features": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Since 1.4: what this version offers beyond 1.0 (stems, bars, models)",
                        },
                        "docs": {"type": "string"},
                    },
                },
                "Bars": {
                    "type": "object",
                    "properties": {
                        "job": {"type": "string"},
                        "warp": {
                            "type": ["array", "null"],
                            "items": {"type": "number"},
                            "description": "[a, b]: t_audio = a t_score + b, where the song roughly lies",
                        },
                        "bars": {
                            "oneOf": [
                                {
                                    "type": "object",
                                    "properties": {
                                        "score": {
                                            "type": "array",
                                            "items": {"type": "number"},
                                            "description": "Every measure's start and the end, in seconds of the score",
                                        },
                                        "audio": {
                                            "type": "array",
                                            "items": {"type": "number"},
                                            "description": "The same times in the take's audio (seconds)",
                                        },
                                        "meters": {
                                            "type": "array",
                                            "items": {"type": "array", "items": {"type": "integer"}},
                                            "description": "Every measure's meter, [numerator, denominator]",
                                        },
                                    },
                                },
                                {"type": "null"},
                            ]
                        },
                        "match": {
                            "type": "object",
                            "description": "How well the score's notes meet the music",
                        },
                        "why": {"type": "string", "description": "Why there are no bars"},
                    },
                },
                "Models": {
                    "type": "object",
                    "properties": {
                        "models": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "file": {"type": "string"},
                                    "folder": {
                                        "type": "string",
                                        "description": "ComfyUI's models folder it goes in",
                                    },
                                    "url": {"type": "string"},
                                    "bytes": {"type": "integer"},
                                    "licence": {"type": "string"},
                                    "non_commercial": {"type": "boolean"},
                                    "role": {"type": "string"},
                                    "status": {
                                        "type": "string",
                                        "enum": ["installed", "missing", "size differs"],
                                    },
                                    "templates": {"type": "array", "items": {"type": "string"}},
                                    "optional_for": {"type": "array", "items": {"type": "string"}},
                                },
                            },
                        },
                        "templates": {
                            "type": "object",
                            "description": "Per template id: whether it can run, what is missing",
                            "additionalProperties": {
                                "type": "object",
                                "properties": {
                                    "ready": {"type": "boolean"},
                                    "missing": {"type": "array", "items": {"type": "string"}},
                                    "incomplete": {"type": "array", "items": {"type": "string"}},
                                    "optional_missing": {"type": "array", "items": {"type": "string"}},
                                    "missing_bytes": {"type": "integer"},
                                },
                            },
                        },
                    },
                },
                "TemplateSummary": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "examples": ["yue2-song", "yue2-cover"]},
                        "title": {"type": "string"},
                        "kind": {"type": "string", "enum": ["song", "cover"]},
                        "workflow": {"type": "string", "description": "The template's name in ComfyUI"},
                        "needs": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Required fields",
                        },
                    },
                },
                "Field": {
                    "type": "object",
                    "required": ["id", "label", "type", "default"],
                    "properties": {
                        "id": {
                            "type": "string",
                            "description": "The name in fields/release: genre, writer.model …",
                        },
                        "label": {"type": "string"},
                        "type": {
                            "type": "string",
                            "enum": ["text", "string", "integer", "number", "boolean", "choice", "upload"],
                        },
                        "default": {"description": "The template's value"},
                        "description": {"type": "string"},
                        "choices": {"type": "array", "items": {"type": "string"}},
                        "minimum": {"type": "number"},
                        "maximum": {"type": "number"},
                        "step": {"type": "number"},
                        "when": {
                            "type": "object",
                            "description": "Applies only when these fields have one of these values",
                            "additionalProperties": {"type": "array", "items": {"type": "string"}},
                        },
                        "defaults": {
                            "type": "object",
                            "description": "The default per choice of the field it hangs on",
                        },
                        "fixed": {"type": "boolean", "description": "Not changeable in v1"},
                        "required": {"type": "boolean"},
                        "advanced": {"type": "boolean"},
                        "node": {"type": "object", "description": "The node it sets: id, type, title"},
                        "group": {"type": "string"},
                    },
                },
                "TemplateDetail": {
                    "allOf": [
                        ref("TemplateSummary"),
                        {
                            "type": "object",
                            "properties": {
                                "fields": {"type": "array", "items": ref("Field")},
                                "release": {"type": "array", "items": ref("Field")},
                                "seeds": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "id": {"type": "string"},
                                            "node": {"type": "integer"},
                                            "title": {"type": "string"},
                                            "drawn": {"type": "boolean"},
                                        },
                                    },
                                },
                                "documents": {"type": "array", "items": {"type": "string"}},
                                "aliases": {
                                    "type": "object",
                                    "description": "Old field names that keep working, and their new names",
                                    "additionalProperties": {"type": "string"},
                                },
                            },
                        },
                    ]
                },
                "Briefs": {
                    "type": "object",
                    "properties": {
                        "kind": {"type": "string", "enum": ["song", "cover"]},
                        "briefs": {
                            "type": "array",
                            "description": "The style templates: id, name, group, their fields",
                            "items": {"type": "object"},
                        },
                        "values": {
                            "type": "object",
                            "description": "Per field, every value the style templates have",
                            "additionalProperties": {"type": "array", "items": {"type": "string"}},
                        },
                    },
                },
                "Stage": {
                    "type": "object",
                    "properties": {
                        "group": {"type": "string", "examples": ["5 · RENDER"]},
                        "text": {"type": "string", "examples": ["singing and playing"]},
                        "index": {"type": ["integer", "null"]},
                        "of": {"type": ["integer", "null"]},
                    },
                },
                "Progress": {
                    "type": "object",
                    "properties": {
                        "nodes_done": {"type": "integer"},
                        "nodes": {"type": "integer"},
                        "step": {"type": "number", "description": "The running node's step (a sampler's)"},
                        "steps": {"type": "number"},
                    },
                },
                "File": {
                    "type": "object",
                    "required": ["name", "url"],
                    "properties": {
                        "name": {"type": "string"},
                        "role": {
                            "type": "string",
                            "description": "original, cover, pdf, lines, notes, record …",
                        },
                        "url": {"type": "string", "description": "GET it from this ComfyUI"},
                    },
                },
                "Result": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "record": {
                            "type": "string",
                            "description": "The release record's path on the ComfyUI computer",
                        },
                        "folder": {"type": "string"},
                        "seconds": {"type": "number"},
                        "files": {"type": "array", "items": ref("File")},
                    },
                },
                "Job": {
                    "type": "object",
                    "required": ["id", "status"],
                    "properties": {
                        "id": {"type": "string", "description": "ComfyUI's prompt id"},
                        "template": {"type": "string"},
                        "status": {
                            "type": "string",
                            "enum": list(JOB_STATUSES),
                            "description": "waiting_for_review is reserved for a later version",
                        },
                        "queue_position": {"type": ["integer", "null"], "description": "1: next to run"},
                        "created_at": {"type": ["number", "null"], "description": "Seconds since 1970 (UTC)"},
                        "started_at": {"type": ["number", "null"]},
                        "finished_at": {"type": ["number", "null"]},
                        "stage": {"oneOf": [ref("Stage"), {"type": "null"}]},
                        "progress": {"oneOf": [ref("Progress"), {"type": "null"}]},
                        "seeds": {"type": "object", "additionalProperties": {"type": "integer"}},
                        "documents": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "The documents given (kept as manual)",
                        },
                        "stems": {
                            "type": "boolean",
                            "description": "Since 1.4: the stems are saved with the song",
                        },
                        "client": {"type": "object", "additionalProperties": {"type": "string"}},
                        "result": {"oneOf": [ref("Result"), {"type": "null"}]},
                        "error": {
                            "oneOf": [
                                {
                                    "type": "object",
                                    "properties": {
                                        "message": {"type": "string"},
                                        "type": {"type": "string"},
                                        "node": {"type": "string"},
                                        "title": {"type": "string"},
                                    },
                                },
                                {"type": "null"},
                            ]
                        },
                        "warnings": {"type": "array", "items": {"type": "string"}},
                        "links": {"type": "object", "additionalProperties": {"type": "string"}},
                    },
                },
                "Queue": {
                    "type": "object",
                    "properties": {
                        "running": {
                            "oneOf": [
                                {
                                    "type": "object",
                                    "properties": {
                                        "id": {"type": "string"},
                                        "api": {"type": "boolean"},
                                        "template": {"type": "string"},
                                    },
                                },
                                {"type": "null"},
                            ]
                        },
                        "pending": {"type": "integer"},
                        "pending_api": {"type": "array", "items": {"type": "string"}},
                        "recent": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "template": {"type": "string"},
                                    "kind": {"type": "string"},
                                    "length": {"type": "string"},
                                    "seconds": {"type": "number", "description": "How long the run took"},
                                    "audio_seconds": {"type": ["number", "null"]},
                                    "finished_at": {"type": "number"},
                                },
                            },
                        },
                    },
                },
                "FromRecord": {
                    "type": "object",
                    "properties": {
                        "template": {"type": "string"},
                        "kind": {"type": "string", "enum": ["song", "cover"]},
                        "title": {"type": "string"},
                        "model": {"type": "string", "description": "The music model the song was made with"},
                        "fields": {"type": "object"},
                        "release": {"type": "object"},
                        "seeds": {"type": "object"},
                        "documents": {"type": "object"},
                        "take": {
                            "type": "object",
                            "properties": {"possible": {"type": "boolean"}, "why": {"type": "string"}},
                        },
                        "warnings": {"type": "array", "items": {"type": "string"}},
                    },
                },
                **{f"JobRequest_{t.id.replace('-', '_')}": _request(t) for t in templates},
            }
        },
    }
