"""The Song Sheet's persisted state (schema ``plenio.sheet_state/1``).

The state is stored as one JSON string widget value on the Song Sheet node, so
it is saved with the workflow and is part of the executed prompt. It records,
per document, whether the user left it automatic, edited an upstream draft, or
replaced it manually, plus the fingerprint of the documents the user approved.
"""

from __future__ import annotations

import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from ..errors import PlenioUserError
from ..hashing import canonical_json

SHEET_STATE_SCHEMA = "plenio.sheet_state/1"
_ACCEPTED_SCHEMAS = frozenset({SHEET_STATE_SCHEMA})

DOCUMENT_KINDS: tuple[str, ...] = ("title", "style", "lyrics", "score", "artwork_prompt")
"""Every document a Song Sheet can own, in display order."""


class DocState(str, Enum):
    AUTO = "auto"
    """Use the upstream draft unchanged."""
    EDITED = "edited"
    """Use the user's edit of an upstream draft; stop when that draft changes."""
    MANUAL = "manual"
    """Use the user's text; the upstream input is not evaluated at all."""


@dataclass(frozen=True)
class DocEntry:
    state: DocState = DocState.AUTO
    text: str | None = None
    base_sha256: str | None = None
    """For ``edited``: hash of the normalised upstream text the edit was made from."""

    def __post_init__(self) -> None:
        if self.state is DocState.AUTO and (self.text is not None or self.base_sha256 is not None):
            raise ValueError("an automatic document carries no text")
        if self.state is DocState.EDITED and (self.text is None or not self.base_sha256):
            raise ValueError("an edited document needs text and base_sha256")
        if self.state is DocState.MANUAL and (self.text is None or self.base_sha256 is not None):
            raise ValueError("a manual document needs text and no base_sha256")

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {"state": self.state.value}
        if self.text is not None:
            result["text"] = self.text
        if self.base_sha256 is not None:
            result["base_sha256"] = self.base_sha256
        return result


@dataclass(frozen=True)
class SheetState:
    docs: Mapping[str, DocEntry] = field(default_factory=dict)
    approved_fingerprint: str | None = None

    def entry(self, kind: str) -> DocEntry:
        _check_kind(kind)
        return self.docs.get(kind, DocEntry())

    def to_dict(self) -> dict[str, Any]:
        docs = {
            kind: entry.to_dict() for kind, entry in self.docs.items() if entry.state is not DocState.AUTO
        }
        result: dict[str, Any] = {"schema": SHEET_STATE_SCHEMA, "docs": docs}
        if self.approved_fingerprint:
            result["review"] = {"approved_fingerprint": self.approved_fingerprint}
        return result

    def to_json(self) -> str:
        return canonical_json(self.to_dict())


def _check_kind(kind: str) -> None:
    if kind not in DOCUMENT_KINDS:
        raise PlenioUserError(
            f"Unknown Song Sheet document {kind!r}; known documents: {list(DOCUMENT_KINDS)}."
        )


def parse_sheet_state(value: str | Mapping[str, Any] | None) -> SheetState:
    """Parse the widget value. An empty value is the default state (everything automatic).

    Malformed values raise ``PlenioUserError`` instead of being reset, because a
    silent reset would discard the user's manual text.
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        return SheetState()
    if isinstance(value, str):
        try:
            data = json.loads(value)
        except json.JSONDecodeError as error:
            raise PlenioUserError(
                f"The Song Sheet state is not valid JSON ({error.msg} at position {error.pos}).",
                hint="Undo the last manual change to the workflow file, or reset the Song Sheet from its editor.",
            ) from error
    else:
        data = dict(value)
    if not isinstance(data, dict):
        raise PlenioUserError("The Song Sheet state must be a JSON object.")
    schema = data.get("schema")
    if schema not in _ACCEPTED_SCHEMAS:
        raise PlenioUserError(
            f"Unsupported Song Sheet state schema {schema!r}.",
            hint=f"This version of Plenio reads {sorted(_ACCEPTED_SCHEMAS)}; update Plenio to open this workflow.",
        )
    unknown = sorted(set(data) - {"schema", "docs", "review"})
    if unknown:
        raise PlenioUserError(f"The Song Sheet state has unknown fields {unknown}.")
    docs_value = data.get("docs", {})
    if not isinstance(docs_value, dict):
        raise PlenioUserError("The Song Sheet state field 'docs' must be an object.")
    docs: dict[str, DocEntry] = {}
    for kind, raw in docs_value.items():
        _check_kind(kind)
        if not isinstance(raw, dict):
            raise PlenioUserError(f"Song Sheet document {kind!r} must be an object.")
        unknown_fields = sorted(set(raw) - {"state", "text", "base_sha256"})
        if unknown_fields:
            raise PlenioUserError(f"Song Sheet document {kind!r} has unknown fields {unknown_fields}.")
        try:
            state = DocState(raw.get("state", "auto"))
        except ValueError as error:
            raise PlenioUserError(
                f"Song Sheet document {kind!r} has the invalid state {raw.get('state')!r}.",
                hint="Valid states are auto, edited and manual.",
            ) from error
        text = raw.get("text")
        base = raw.get("base_sha256")
        if text is not None and not isinstance(text, str):
            raise PlenioUserError(f"Song Sheet document {kind!r}: 'text' must be a string.")
        if base is not None and not isinstance(base, str):
            raise PlenioUserError(f"Song Sheet document {kind!r}: 'base_sha256' must be a string.")
        try:
            docs[kind] = DocEntry(state, text, base)
        except ValueError as error:
            raise PlenioUserError(f"Song Sheet document {kind!r} is inconsistent: {error}.") from error
    review = data.get("review", {})
    if not isinstance(review, dict):
        raise PlenioUserError("The Song Sheet state field 'review' must be an object.")
    approved = review.get("approved_fingerprint")
    if approved is not None and not isinstance(approved, str):
        raise PlenioUserError("The approved fingerprint must be a string.")
    return SheetState(docs=docs, approved_fingerprint=approved or None)
