"""``/plenio/*`` HTTP endpoints (target-architecture section 6).

Handlers only parse JSON, call ``plenio.core`` and serialise the result - the
same functions the nodes use, so the editor never decides musical validity.
Errors become ``{"error": {"type", "message", "hint"}}`` with status 400 (user
errors) or 500 (bugs).
"""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from typing import Any

from aiohttp import web

from ..core import lyrics as lyrics_rules
from ..core import score as score_rules
from ..core.engines import rules_for
from ..core.errors import PlenioError, PlenioUserError
from ..core.sheet import DOCUMENT_KINDS, evaluate_sheet, parse_sheet_state
from ..core.system import check_system, to_markdown
from . import host
from .shared import template_library

log = logging.getLogger("plenio")

Handler = Callable[[web.Request], Awaitable[web.StreamResponse]]


def error_response(error: Exception) -> web.Response:
    status = 400 if isinstance(error, PlenioUserError) else 500
    body: dict[str, Any] = {"type": type(error).__name__, "message": str(error)}
    if isinstance(error, PlenioError):
        body["message"] = error.message
        body["hint"] = error.hint
        body["details"] = error.details
    return web.json_response({"error": body}, status=status)


def guarded(handler: Handler) -> Handler:
    async def wrapper(request: web.Request) -> web.StreamResponse:
        try:
            return await handler(request)
        except PlenioError as error:
            return error_response(error)
        except Exception as error:
            log.exception("Plenio route %s failed", request.path)
            return error_response(error)

    return wrapper


async def read_json(request: web.Request) -> dict[str, Any]:
    try:
        data = await request.json()
    except ValueError as error:
        raise PlenioUserError("The request body is not valid JSON.") from error
    if not isinstance(data, dict):
        raise PlenioUserError("The request body must be a JSON object.")
    return data


def _text(data: dict[str, Any], key: str, required: bool = True) -> str:
    value = data.get(key, "")
    if value is None or (required and key not in data):
        raise PlenioUserError(f"The request needs the field {key!r}.")
    if not isinstance(value, str):
        raise PlenioUserError(f"The field {key!r} must be a string.")
    return value


async def system(request: web.Request) -> web.StreamResponse:
    report = check_system(host.system_facts())
    return web.json_response({"report": report.to_dict(), "markdown": to_markdown(report)})


async def score_analyze(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    return web.json_response(score_rules.editor_view(_text(data, "abc")))


async def score_transform(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    operation = data.get("operation")
    if not isinstance(operation, dict):
        raise PlenioUserError(
            "The request needs an 'operation' object.", hint=f"Use one of {sorted(score_rules.OPERATIONS)}."
        )
    result = score_rules.apply(_text(data, "abc"), operation)
    return web.json_response(
        {
            "abc": result.abc,
            "changes": list(result.changes),
            "warnings": list(result.warnings),
            "select": list(result.select),
            "analysis": score_rules.editor_view(result.abc),
        }
    )


async def lyrics_analyze(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    text = _text(data, "lyrics")
    instrumental = bool(data.get("instrumental", False))
    engine = data.get("engine")
    findings = (
        rules_for(str(engine)).check_lyrics(text, instrumental=instrumental)
        if engine
        else lyrics_rules.check_lyrics(text, instrumental=instrumental)
    )
    parsed = lyrics_rules.parse_lyrics(text)
    sections = [
        {
            "tag": s.tag,
            "lines": len(s.lines),
            "words": s.words,
            "syllables": sum(lyrics_rules.estimate_syllables(line) for line in s.lines),
        }
        for s in parsed.sections
    ]
    abc = data.get("abc") or ""
    if isinstance(abc, str) and abc.strip():
        analysis = score_rules.analyze(abc)
        if analysis.ok:
            findings += lyrics_rules.compare_sections(text, [s.tag for s in analysis.sections])
            for item, section in zip(sections, analysis.sections, strict=False):
                item["score_section"] = section.label
                item["vocal_notes"] = section.vocal_notes
    return web.json_response(
        {
            "sections": sections,
            "tags": parsed.tags,
            "words": parsed.words,
            "findings": [f.to_dict() for f in findings],
        }
    )


async def sheet_resolve(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    state = parse_sheet_state(data.get("sheet_state") or "")
    upstream = data.get("upstream") or {}
    owned = [k for k in data.get("owned", []) if k in DOCUMENT_KINDS]
    if not isinstance(upstream, dict) or not owned:
        raise PlenioUserError("The request needs 'owned' documents and an 'upstream' object.")
    engine = data.get("engine")
    context = {k: v for k, v in (data.get("context") or {}).items() if isinstance(v, str)}
    evaluation = evaluate_sheet(
        state,
        {k: (v if isinstance(v, str) else None) for k, v in upstream.items()},
        owned,
        review=str(data.get("review", "continue")),
        rules=rules_for(str(engine)) if engine else None,
        engine_id=str(engine) if engine else None,
        instrumental=bool(data.get("instrumental", False)),
        max_seconds=float(data["max_seconds"]) if data.get("max_seconds") else None,
        target_seconds=float(data["target_seconds"]) if data.get("target_seconds") else None,
        context=context,
    )
    return web.json_response(evaluation.payload())


async def templates_list(request: web.Request) -> web.StreamResponse:
    library = template_library()
    if request.query.get("reload") == "1":
        library.reload()
    return web.json_response({"templates": library.listing()})


async def template_get(request: web.Request) -> web.StreamResponse:
    return web.json_response(template_library().get(request.match_info["template_id"]).to_dict())


async def template_save(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    fields = data.get("fields")
    if not isinstance(fields, dict):
        raise PlenioUserError("The request needs a 'fields' object.")
    template = template_library().save_user_template(_text(data, "name"), fields)
    return web.json_response(template.to_dict())


async def asr_note(request: web.Request) -> web.StreamResponse:
    from .nodes.transcribe_lyrics import asr_notes

    return web.json_response({"note": asr_notes().get(request.match_info["draft_sha256"])})


ROUTES: tuple[tuple[str, str, Handler], ...] = (
    ("GET", "/plenio/system", system),
    ("POST", "/plenio/score/analyze", score_analyze),
    ("POST", "/plenio/score/transform", score_transform),
    ("POST", "/plenio/lyrics/analyze", lyrics_analyze),
    ("POST", "/plenio/sheet/resolve", sheet_resolve),
    ("GET", "/plenio/templates", templates_list),
    ("GET", "/plenio/templates/{template_id:.+}", template_get),
    ("POST", "/plenio/templates", template_save),
    ("GET", "/plenio/asr/notes/{draft_sha256}", asr_note),
)


def register(routes: web.RouteTableDef) -> None:
    for method, path, handler in ROUTES:
        routes.route(method, path)(guarded(handler))
