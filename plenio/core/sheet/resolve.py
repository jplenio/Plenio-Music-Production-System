"""Resolution of Song Sheet documents: which text is used, and when to stop.

Rules (one implementation, used by the node and by the editor route):

* ``manual``  - the user's text; the upstream input is never evaluated.
* ``edited``  - the user's text while the upstream draft still hashes to the
  ``base_sha256`` the edit was made from; otherwise a **conflict** that stops
  the run. An edit is never silently replaced by a newer draft.
* ``auto``    - the upstream draft, or *missing* when nothing is connected.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from enum import Enum
from typing import Any

from ..hashing import sha256_json, sha256_text
from .state import DocState, SheetState

FINGERPRINT_SCHEMA = "plenio.sheet_fingerprint/1"


class DocStatus(str, Enum):
    AUTO = "auto"
    EDITED = "edited"
    MANUAL = "manual"
    CONFLICT = "conflict"
    MISSING = "missing"


def normalize_document(text: str) -> str:
    """Canonical form of a document: LF line ends, no trailing spaces, no outer blank lines.

    The Song Sheet outputs the normalised text, and all hashes are computed on
    it, so what the editor shows is exactly what reaches the model.
    """
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    start, end = 0, len(lines)
    while start < end and not lines[start]:
        start += 1
    while end > start and not lines[end - 1]:
        end -= 1
    return "\n".join(lines[start:end])


@dataclass(frozen=True)
class ResolvedDoc:
    kind: str
    status: DocStatus
    text: str | None
    """The text that leaves the sheet (``None`` for missing and conflicting documents)."""
    upstream_sha256: str | None = None
    reason: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "kind": self.kind,
            "status": self.status.value,
            "text": self.text,
            "sha256": sha256_text(self.text) if self.text is not None else None,
            "upstream_sha256": self.upstream_sha256,
            "reason": self.reason,
        }


@dataclass(frozen=True)
class Resolution:
    docs: Mapping[str, ResolvedDoc]

    @property
    def conflicts(self) -> list[ResolvedDoc]:
        return [doc for doc in self.docs.values() if doc.status is DocStatus.CONFLICT]

    def text(self, kind: str) -> str:
        """Output text of ``kind`` (empty for a missing document)."""
        doc = self.docs.get(kind)
        return doc.text if doc is not None and doc.text is not None else ""

    def fingerprint(self) -> str | None:
        """Fingerprint of the resolved documents, or ``None`` while a conflict exists."""
        if self.conflicts:
            return None
        return sha256_json(
            {
                "schema": FINGERPRINT_SCHEMA,
                "docs": {
                    kind: (sha256_text(doc.text) if doc.text is not None else None)
                    for kind, doc in sorted(self.docs.items())
                },
            }
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "docs": {kind: doc.to_dict() for kind, doc in self.docs.items()},
            "conflicts": [doc.kind for doc in self.conflicts],
            "fingerprint": self.fingerprint(),
        }


def needs_upstream(state: SheetState, kind: str) -> bool:
    """Whether the upstream input of ``kind`` has to be evaluated (lazy inputs)."""
    return state.entry(kind).state is not DocState.MANUAL


def resolve(state: SheetState, upstream: Mapping[str, str | None], kinds: Iterable[str]) -> Resolution:
    """Resolve ``kinds`` from the persisted ``state`` and the upstream drafts.

    ``upstream[kind]`` is ``None`` when the input is not connected or was not
    evaluated. Upstream texts are normalised before hashing.
    """
    docs: dict[str, ResolvedDoc] = {}
    for kind in kinds:
        entry = state.entry(kind)
        if entry.state is DocState.MANUAL:
            assert entry.text is not None
            docs[kind] = ResolvedDoc(kind, DocStatus.MANUAL, normalize_document(entry.text))
            continue
        raw = upstream.get(kind)
        draft = normalize_document(raw) if raw is not None else None
        draft_sha = sha256_text(draft) if draft is not None else None
        if entry.state is DocState.AUTO:
            if draft is None:
                docs[kind] = ResolvedDoc(
                    kind, DocStatus.MISSING, None, reason="no upstream draft is connected"
                )
            else:
                docs[kind] = ResolvedDoc(kind, DocStatus.AUTO, draft, draft_sha)
            continue
        assert entry.text is not None and entry.base_sha256 is not None
        if draft_sha == entry.base_sha256:
            docs[kind] = ResolvedDoc(kind, DocStatus.EDITED, normalize_document(entry.text), draft_sha)
        elif draft_sha is None:
            docs[kind] = ResolvedDoc(
                kind,
                DocStatus.CONFLICT,
                None,
                None,
                reason="the draft this edit was made from is no longer connected",
            )
        else:
            docs[kind] = ResolvedDoc(
                kind,
                DocStatus.CONFLICT,
                None,
                draft_sha,
                reason="the upstream draft changed after this document was edited",
            )
    return Resolution(docs)


def approval_matches(state: SheetState, resolution: Resolution) -> bool:
    """True when the user approved exactly the resolved documents."""
    fingerprint = resolution.fingerprint()
    return fingerprint is not None and state.approved_fingerprint == fingerprint
