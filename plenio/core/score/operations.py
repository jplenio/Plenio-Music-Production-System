"""The score operations of the editor, by name, with checked parameters.

``apply(abc, {"op": ..., ...})`` is what ``POST /plenio/score/transform`` runs; the
whole-score operations are the same functions the Score Tools node uses. Names in
``OPERATIONS`` are the Phase 5 text operations (element ids such as ``V12.3``); names in
``ops.OPERATIONS`` run on the canonical model (ids ``vocal:<onset>``; next-release plan §9.6).

``editor_view(abc)`` is the view contract: the analysis, the element view (staff and ABC
views) and, for a score inside the supported subset, the canonical model view ``model``
(v2, plan §9.9) that the piano roll, chord lane and inspector render.
"""

from __future__ import annotations

import math
from collections.abc import Callable, Mapping
from fractions import Fraction
from typing import Any

from ..errors import PlenioValidationError
from . import canonical, edit, lyric_layout, native, ops
from . import model as score_model
from .edit import EditResult

Operation = Callable[[str, Mapping[str, Any]], EditResult]


def _int(operation: Mapping[str, Any], name: str, *, default: int | None = None) -> int:
    value = operation.get(name, default)
    if (
        isinstance(value, bool)
        or not isinstance(value, int | float)
        or not math.isfinite(value)  # JSON accepts Infinity/NaN; int() of them raised (AUD-08)
        or int(value) != value
    ):
        raise PlenioValidationError(f"The operation needs a whole number '{name}'.")
    return int(value)


def _text(operation: Mapping[str, Any], name: str) -> str:
    value = operation.get(name)
    if not isinstance(value, str) or not value.strip():
        raise PlenioValidationError(f"The operation needs a text '{name}'.")
    return value


def _ids(operation: Mapping[str, Any]) -> list[str]:
    value = operation.get("ids", [operation["id"]] if "id" in operation else None)
    if not isinstance(value, list) or not value or not all(isinstance(v, str) for v in value):
        raise PlenioValidationError("The operation needs the ids of the selected notes.")
    return value


def _from_change(change: native.Change) -> EditResult:
    return EditResult(change.abc, change.changes, change.warnings)


def _pitch(abc: str, operation: Mapping[str, Any]) -> EditResult:
    if "midi" in operation:
        return edit.set_pitch(abc, _ids(operation), midi=_int(operation, "midi"))
    return edit.set_pitch(abc, _ids(operation), semitones=_int(operation, "semitones"))


OPERATIONS: dict[str, Operation] = {
    # notes
    "set_pitch": _pitch,
    "shift_pitch": _pitch,
    "set_duration": lambda abc, op: edit.set_duration(abc, _ids(op)[0], _int(op, "units")),
    "note_to_rest": lambda abc, op: edit.note_to_rest(abc, _ids(op)),
    "rest_to_note": lambda abc, op: edit.rest_to_note(
        abc, _ids(op)[0], midi=_int(op, "midi") if "midi" in op else None
    ),
    "set_chord": lambda abc, op: edit.set_chord(abc, _ids(op)[0], _text(op, "name")),
    "remove_chord": lambda abc, op: edit.remove_chord(abc, _text(op, "chord")),
    # sections
    "rename_section": lambda abc, op: edit.rename_section(abc, _int(op, "section"), _text(op, "label")),
    "move_section_boundary": lambda abc, op: edit.move_section_boundary(
        abc, _int(op, "section"), _int(op, "start_bar")
    ),
    "split_section": lambda abc, op: edit.split_section(abc, _int(op, "bar"), _text(op, "label")),
    "merge_section": lambda abc, op: edit.merge_section(abc, _int(op, "section")),
    # whole score (the Score Tools operations)
    "transpose": lambda abc, op: _from_change(native.transpose(abc, _int(op, "semitones", default=0))),
    "set_tempo": lambda abc, op: _from_change(native.set_tempo(abc, _int(op, "bpm"))),
    "strip_chords": lambda abc, op: _from_change(native.strip_chords(abc)),
    "silence_voice": lambda abc, op: _from_change(native.silence_voice(abc, str(op.get("voice", "Vocal")))),
    "move_vocal_to_ins": lambda abc, op: _from_change(
        native.move_vocal_to_ins(abc, conflict=str(op.get("conflict", "replace")))
    ),
}


def apply(abc: str, operation: Mapping[str, Any]) -> EditResult:
    name = operation.get("op")
    if name in OPERATIONS:
        return OPERATIONS[str(name)](abc, operation)
    if name in ops.OPERATIONS:
        done = ops.transform(abc, operation)
        return EditResult(
            done.abc, done.result.changes, done.result.warnings, done.result.select, done.result.time_map
        )
    raise PlenioValidationError(
        f"Unknown score operation {name!r}.", hint=f"Use one of {sorted([*OPERATIONS, *ops.OPERATIONS])}."
    )


VIEW_VERSION = 2


def model_view(score: canonical.Score, heads: Mapping[tuple[str, int], list[str]]) -> dict[str, Any]:
    """The canonical model as the editor's v2 view (integer units; plan §9.9).

    ``heads`` maps ``(voice, onset)`` of every sounding note to the element ids of its written
    segments (``V12.3`` ...), so that the staff/ABC views and the piano roll select the same note.
    """
    denominator = score.unit.denominator
    measures = []
    for index, meter in enumerate(score.meters):
        onset = score.starts[index]
        measures.append(
            {
                "n": index + 1,
                "onset": onset,
                "length": score.lengths[index],
                "meter": f"{meter[0]}/{meter[1]}",
                "key": score.key_at(onset),
            }
        )
    starts = ops._section_starts(score)
    sections = [
        {
            "label": section.label,
            "first_bar": section.measure + 1,
            "bars": (starts[i + 1].measure if i + 1 < len(starts) else score.measure_count) - section.measure,
            "implicit": section not in score.sections,
        }
        for i, section in enumerate(starts)
    ]

    def track(voice: str, notes: tuple[canonical.Note, ...]) -> list[dict[str, Any]]:
        return [
            {
                "id": ops.note_id(voice.lower(), n.onset),
                "onset": n.onset,
                "duration": n.duration,
                "pitch": n.pitch,
                "name": score_model.pitch_name(n.pitch),
                "segments": heads.get((voice, n.onset), []),
            }
            for n in notes
        ]

    return {
        "version": VIEW_VERSION,
        "unit": f"1/{denominator}",
        "tempo": score.tempo,
        "total": score.total,
        "grid": {
            "units_per_quarter": float(Fraction(denominator, 4)),
            "snap": 1 if denominator <= 32 else denominator // 16,
        },
        "measures": measures,
        "groups": list(score.layout),
        "keys": [{"onset": k.onset, "key": k.key} for k in score.keys],
        "sections": sections,
        "tracks": {
            "vocal": track("Vocal", score.vocal),
            "ins": track("Ins", score.ins),
            "chords": [
                {
                    "id": ops.chord_id(ch.onset),
                    "onset": ch.onset,
                    "name": ch.name,
                    "pitches": score_model._chord_pitches(ch.name),
                }
                for ch in score.chords
            ],
        },
    }


def editor_view(abc: str, lyrics: str | None = None) -> dict[str, Any]:
    """The analysis plus, for a valid score, the element view and the canonical model view.

    A score the upstream parser accepts but that lies outside the supported subset (plan §9.2)
    is valid for YuE2 but has no ``model``: ``model_error`` says why graphical editing is off.
    With ``lyrics`` the view also says where they are sung (``lyrics``, see ``lyric_layout``) and
    the notation shows the syllables under the Vocal notes.
    """
    analysis = native.analyze(abc)
    result = analysis.to_dict()
    if analysis.ok:
        try:
            score: canonical.Score | None = canonical.from_abc(abc)
        except canonical.ScoreSyntaxError as error:
            score = None
            result["model_error"] = {"message": error.message, "diagnostics": error.diagnostics}
        placed = (
            lyric_layout.layout(score, lyrics) if score is not None and lyrics and lyrics.strip() else None
        )
        words: dict[int, str] | None = None
        if placed is not None:
            words = {onset: lyric_layout.w_token(s) for onset, s in placed.syllables().items()}
            words.update(dict.fromkeys(placed.holds(), "_"))
        result.update(score_model.view(abc, words))
        result["model"] = model_view(score, _segments(abc)) if score is not None else None
        if placed is not None:
            result["lyrics"] = placed.to_dict()
    return result


def _segments(abc: str) -> dict[tuple[str, int], list[str]]:
    """``(voice, onset in units)`` of every sounding note -> the element ids of its written segments."""
    elements = score_model.build(abc)
    quarter = elements.unit * 4
    heads: dict[tuple[str, int], list[str]] = {}
    for voice in canonical.VOICES:
        for element in elements.voice_elements(voice):
            if element.is_note and not element.tie_in:
                heads[(voice, int(element.onset / quarter))] = [s.id for s in elements.chain(element.id)]
    return heads
