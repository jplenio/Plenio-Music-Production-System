"""``/plenio/*`` HTTP endpoints (target-architecture section 6).

Handlers only parse JSON, call ``plenio.core`` and serialise the result - the
same functions the nodes use, so the editor never decides musical validity.
Errors become ``{"error": {"type", "message", "hint"}}`` with status 400 (user
errors) or 500 (bugs).
"""

from __future__ import annotations

import base64
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


def _lyrics(data: dict[str, Any]) -> str | None:
    """The song's lyrics sent with a score (optional): the view then says where they are sung."""
    value = data.get("lyrics")
    return value if isinstance(value, str) else None


async def score_analyze(request: web.Request) -> web.StreamResponse:
    data = await read_json(request)
    return web.json_response(score_rules.editor_view(_text(data, "abc"), _lyrics(data)))


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
            "time_map": [list(piece) for piece in result.time_map] if result.time_map is not None else None,
            "analysis": score_rules.editor_view(result.abc, _lyrics(data)),
        }
    )


async def score_midi_export(request: web.Request) -> web.StreamResponse:
    """The score (and the editor's Guide notes) as a standard MIDI file, base64 in JSON."""
    from ..core.score import canonical, midi

    data = await read_json(request)
    score = canonical.from_abc(_text(data, "abc"))
    title = _text(data, "title", required=False)
    payload = midi.export_midi(score, guide=midi.guide_from_json(data.get("guide")), title=title)
    return web.json_response(
        {"filename": midi.filename_for(title), "data": base64.b64encode(payload).decode("ascii")}
    )


async def score_musicxml_export(request: web.Request) -> web.StreamResponse:
    """The score as MusicXML 4.0 (the sheet music for notation programs), with the lyrics under the notes."""
    from ..core.score import canonical, musicxml

    data = await read_json(request)
    score = canonical.from_abc(_text(data, "abc"))
    title = _text(data, "title", required=False)
    text = musicxml.export_musicxml(score, title=title, lyrics=_lyrics(data))
    return web.json_response({"filename": musicxml.filename_for(title), "data": text, "type": musicxml.MUSICXML_MIME})


async def score_midi_import(request: web.Request) -> web.StreamResponse:
    """A MIDI file (base64) as a score: its ABC, the Guide notes, the tracks and the import report."""
    from ..core.score import canonical, midi

    data = await read_json(request)
    encoded = _text(data, "data")
    if len(encoded) > midi.MAX_FILE_BYTES * 4 // 3 + 4:
        raise PlenioUserError("The MIDI file is too large (8 MB at most).")
    try:
        raw = base64.b64decode(encoded, validate=True)
    except (ValueError, TypeError) as error:
        raise PlenioUserError("The field 'data' is not valid base64.") from error
    grid = int(_number(data, "grid", 4, 64) or 32)
    result = midi.import_midi(
        raw,
        mapping=midi.mapping_from_json(data.get("mapping")),
        grid=grid,
        chords_from_notes=bool(data.get("chords", False)),
    )
    abc = canonical.to_abc(result.score)
    return web.json_response(
        {
            "abc": abc,
            "guide": [[g.onset, g.duration, g.pitch] for g in result.guide],
            "report": list(result.report),
            "tracks": [
                {"index": t.index, "name": t.name, "notes": t.notes, "role": t.role} for t in result.tracks
            ],
            "analysis": score_rules.editor_view(abc),
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


async def brief_fields(request: web.Request) -> web.StreamResponse:
    """What a brief's template fills, by the one precedence rule (typed > template > empty).

    The editor shows the template's texts as a *Template fills:* line and offers the explicit actions
    (*copy the text*, *use the choices*, *reset*). The rule itself lives in ``core.brief`` - this route
    exists so the frontend never computes a second answer to "what would this brief resolve to?".
    """
    from ..core.brief import (
        DEFAULT_LENGTH,
        TEXT_FIELDS,
        field_sources,
        resolve_text_fields,
        template_choice_hints,
    )

    data = await read_json(request)
    values = data.get("fields", {})
    if not isinstance(values, dict):
        raise PlenioUserError("The field 'fields' must be an object of widget values.")
    fields = {name: value for name, value in values.items() if isinstance(value, str)}
    template_id = str(data.get("template") or "").strip()
    template = None if template_id in ("", "none") else template_library().get(template_id)
    merged, from_template, notes = resolve_text_fields(fields, template, TEXT_FIELDS)
    choices = template_choice_hints(fields, template)
    return web.json_response(
        {
            "template": template.id if template else "none",
            "sources": field_sources(fields, template),
            "fields": dict(template.fields) if template else {},
            "fills": [
                {"field": name, "value": merged[name], "template": template.fields[name]}
                for name in from_template
                if name in TEXT_FIELDS
            ],
            "choices": [
                {"field": name, "suggested": suggested, "current": str(fields.get(name, "") or "")}
                for name, suggested in choices.items()
            ],
            "length_default": DEFAULT_LENGTH,
            "notes": notes,
        }
    )


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
    ("POST", "/plenio/score/midi/export", score_midi_export),
    ("POST", "/plenio/score/midi/import", score_midi_import),
    ("POST", "/plenio/score/musicxml/export", score_musicxml_export),
    ("POST", "/plenio/lyrics/analyze", lyrics_analyze),
    ("POST", "/plenio/sheet/resolve", sheet_resolve),
    ("GET", "/plenio/templates", templates_list),
    ("GET", "/plenio/templates/{template_id:.+}", template_get),
    ("POST", "/plenio/templates", template_save),
    ("POST", "/plenio/brief/fields", brief_fields),
    ("GET", "/plenio/asr/notes/{draft_sha256}", asr_note),
    ("GET", "/plenio/presets/{kind}", presets),
    ("POST", "/plenio/eq/response", eq_response),
)


def register(routes: web.RouteTableDef) -> None:
    for method, path, handler in ROUTES:
        routes.route(method, path)(guarded(handler))
