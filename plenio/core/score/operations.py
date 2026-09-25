"""The score operations of the editor, by name, with checked parameters.

``apply(abc, {"op": ..., ...})`` is what ``POST /plenio/score/transform`` runs; the
whole-score operations are the same functions the Score Tools node uses.
"""

from __future__ import annotations

import math
from collections.abc import Callable, Mapping
from typing import Any

from ..errors import PlenioValidationError
from . import edit, native
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
    if name not in OPERATIONS:
        raise PlenioValidationError(
            f"Unknown score operation {name!r}.", hint=f"Use one of {sorted(OPERATIONS)}."
        )
    return OPERATIONS[str(name)](abc, operation)


def editor_view(abc: str) -> dict[str, Any]:
    """The analysis plus, for a valid score, the element view the editor renders and plays."""
    analysis = native.analyze(abc)
    result = analysis.to_dict()
    if analysis.ok:
        result.update(score_model.view(abc))
    return result
