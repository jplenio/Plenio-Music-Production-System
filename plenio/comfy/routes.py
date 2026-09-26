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
from ..core.sheet import DOCUMENT_KINDS, REVIEW_MODES, evaluate_sheet, parse_sheet_state
from .shared import preset_library, system_report, template_library

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


def _number(data: dict[str, Any], key: str, low: float, high: float) -> float | None:
    """An optional finite number within ``low..high`` (``None`` when absent or empty)."""
    value = data.get(key)
    if value is None or value == "":
        return None
    if isinstance(value, bool) or not isinstance(value, int | float) or not low <= float(value) <= high:
        raise PlenioUserError(f"The field {key!r} must be a number between {low:g} and {high:g}.")
    return float(value)


def _engine_rules(engine: Any) -> Any:
    """The rules module of ``engine`` (``None`` when no engine is given); unknown engines are the caller's error."""
    if not engine:
        return None
    try:
        return rules_for(str(engine))
    except PlenioError as error:
        raise PlenioUserError(error.message, hint=error.hint) from error


def _text(data: dict[str, Any], key: str, required: bool = True) -> str:
    value = data.get(key, "")
    if value is None or (required and key not in data):
        raise PlenioUserError(f"The request needs the field {key!r}.")
    if not isinstance(value, str):
        raise PlenioUserError(f"The field {key!r} must be a string.")
    return value


async def system(request: web.Request) -> web.StreamResponse:
    report, markdown = system_report()
    return web.json_response({"report": report.to_dict(), "markdown": markdown})


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
    rules = _engine_rules(data.get("engine"))
    findings = (
        rules.check_lyrics(text, instrumental=instrumental)
        if rules is not None
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
    owned_value = data.get("owned", [])
    owned = [k for k in owned_value if k in DOCUMENT_KINDS] if isinstance(owned_value, list) else []
    context_value = data.get("context") or {}
    if not isinstance(upstream, dict) or not owned or not isinstance(context_value, dict):
        raise PlenioUserError("The request needs 'owned' documents, an 'upstream' and a 'context' object.")
    review = str(data.get("review", "continue"))
    if review not in REVIEW_MODES:
        raise PlenioUserError(f"Unknown review mode {review!r}; use one of {list(REVIEW_MODES)}.")
    brief_mode = data.get("brief_mode")  # the brief's work mode, for 'as the brief says'
    if brief_mode not in (None, "batch", "careful"):
        raise PlenioUserError(f"Unknown brief mode {brief_mode!r}; use 'batch' or 'careful'.")
    engine = data.get("engine")
    context = {k: v for k, v in context_value.items() if isinstance(v, str)}
    evaluation = evaluate_sheet(
        state,
        {k: (v if isinstance(v, str) else None) for k, v in upstream.items()},
        owned,
        review=review,
        brief_mode=brief_mode,
        rules=_engine_rules(engine),
        engine_id=str(engine) if engine else None,
        instrumental=bool(data.get("instrumental", False)),
        max_seconds=_number(data, "max_seconds", 1, 3600) or None,
        target_seconds=_number(data, "target_seconds", 1, 3600) or None,
        context=context,
    )
    return web.json_response(evaluation.payload())


async def templates_list(request: web.Request) -> web.StreamResponse:
    library = template_library()
    if request.query.get("reload") == "1":
        library.reload()
    return web.json_response({"templates": library.listing(), "problems": dict(library.problems)})


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


async def presets(request: web.Request) -> web.StreamResponse:
    from ..core.audio import presets as audio_presets

    return web.json_response(audio_presets.load(preset_library().folder, request.match_info["kind"]))


async def eq_response(request: web.Request) -> web.StreamResponse:
    """The EQ curve of ``settings`` at ``sample_rate`` (the curve widget draws exactly the node's response)."""
    from ..core.audio import eq

    data = await read_json(request)
    rate = int(_number(data, "sample_rate", 8000, 384000) or 48000)
    points = _number(data, "points", 16, 2048)
    if points is not None and points != int(points):
        raise PlenioUserError("The field 'points' must be a whole number.")
    settings = eq.parse_settings(data.get("settings", ""), rate)
    grid = eq.display_grid(rate, int(points or 256))
    bands = []
    for band in settings["bands"]:
        single = dict(settings, preamp_db=0.0, bands=[band])
        bands.append([round(float(v), 3) for v in eq.response_db(single, rate, grid)])
    return web.json_response(
        {
            "settings": settings,
            "frequency_hz": [round(float(f), 2) for f in grid],
            "response_db": [round(float(v), 3) for v in eq.response_db(settings, rate, grid)],
            "bands": bands,
        }
    )


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
    ("GET", "/plenio/presets/{kind}", presets),
    ("POST", "/plenio/eq/response", eq_response),
)


def register(routes: web.RouteTableDef) -> None:
    for method, path, handler in ROUTES:
        routes.route(method, path)(guarded(handler))
