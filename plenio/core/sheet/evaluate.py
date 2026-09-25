"""Everything the Song Sheet decides, in one pure function used by the node and the editor route."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from types import ModuleType
from typing import Any

from ..diagnostics import Finding, has_errors, info, summarize
from ..hashing import sha256_text
from ..lyrics import check_lyrics
from ..reports import Report, Status
from .resolve import DocStatus, Resolution, approval_matches, resolve
from .state import DOCUMENT_KINDS, SheetState

PAYLOAD_SCHEMA = "plenio.sheet_payload/1"
REVIEW_MODES = ("continue", "stop for review")


@dataclass(frozen=True)
class SheetEvaluation:
    state: SheetState
    resolution: Resolution
    owned: tuple[str, ...]
    upstream: Mapping[str, str | None]
    context: Mapping[str, str]
    findings: tuple[Finding, ...]
    validation: Mapping[str, Any] | None
    planning_mode: str
    score_seconds: float
    review: str
    engine_id: str | None
    instrumental: bool
    target_seconds: float | None = None

    @property
    def fingerprint(self) -> str | None:
        return self.resolution.fingerprint()

    @property
    def approved(self) -> bool:
        return approval_matches(self.state, self.resolution)

    @property
    def conflicts(self) -> list[str]:
        return [doc.kind for doc in self.resolution.conflicts]

    @property
    def has_errors(self) -> bool:
        return has_errors(self.findings)

    @property
    def waiting_for_approval(self) -> bool:
        return self.review == "stop for review" and not self.approved

    def text(self, kind: str) -> str:
        return self.resolution.text(kind)

    def status_line(self) -> str:
        if self.conflicts:
            return "conflict: " + ", ".join(self.conflicts)
        if self.has_errors:
            return "invalid: " + summarize(self.findings)
        if self.waiting_for_approval:
            return "waiting for approval"
        return summarize(self.findings)

    def payload(self) -> dict[str, Any]:
        docs = {}
        for kind in self.owned:
            doc = self.resolution.docs[kind]
            raw = self.upstream.get(kind)
            docs[kind] = {
                "state": self.state.entry(kind).state.value,
                "status": doc.status.value,
                "upstream": raw,
                "upstream_sha256": doc.upstream_sha256,
                "text": doc.text,
                "reason": doc.reason,
            }
        return {
            "schema": PAYLOAD_SCHEMA,
            "owned": list(self.owned),
            "docs": docs,
            "context": dict(self.context),
            "findings": [f.to_dict() for f in self.findings],
            "fingerprint": self.fingerprint,
            "review": self.review,
            "approved": self.approved,
            "waiting": self.waiting_for_approval,
            "status": self.status_line(),
            "planning_mode": self.planning_mode,
            "score_seconds": round(self.score_seconds, 2),
            "validation": dict(self.validation) if self.validation else None,
            "engine": self.engine_id,
            "instrumental": self.instrumental,
            "target_seconds": self.target_seconds,
        }

    def report(self) -> Report:
        if self.conflicts or self.has_errors:
            status = Status.ERROR
        elif self.waiting_for_approval:
            status = Status.SKIPPED
        elif any(f.severity == "warning" for f in self.findings):
            status = Status.WARNING
        else:
            status = Status.OK
        documents = {
            kind: {
                "state": self.state.entry(kind).state.value,
                "status": self.resolution.docs[kind].status.value,
                "sha256": sha256_text(self.text(kind)),
                "text": self.text(kind),
            }
            for kind in self.owned
        }
        return Report(
            "song_sheet",
            status,
            f"Song Sheet ({', '.join(self.owned) or 'no documents'}): {self.status_line()}",
            tuple(f"{f.severity}: {f.message}" for f in self.findings if f.severity != "info"),
            {
                "documents": documents,
                "findings": [f.to_dict() for f in self.findings],
                "fingerprint": self.fingerprint,
                "review": self.review,
                "approved": self.approved,
                "planning_mode": self.planning_mode,
                "score_seconds": round(self.score_seconds, 2),
                "validation": dict(self.validation) if self.validation else None,
                "engine": self.engine_id,
            },
        )


def evaluate_sheet(
    state: SheetState,
    upstream: Mapping[str, str | None],
    owned: Iterable[str],
    *,
    review: str = "continue",
    rules: ModuleType | None = None,
    engine_id: str | None = None,
    instrumental: bool = False,
    tokenizer: Any = None,
    max_seconds: float | None = None,
    context: Mapping[str, str] | None = None,
    target_seconds: float | None = None,
) -> SheetEvaluation:
    """Resolve the owned documents, validate them with the engine's rules and decide the review gate.

    ``context`` holds display-only documents (for example the text sheet's
    style and lyrics shown next to the score); they count for the budget but
    are validated by the sheet that owns them.
    """
    if review not in REVIEW_MODES:
        raise ValueError(f"unknown review mode {review!r}")
    kinds = tuple(k for k in DOCUMENT_KINDS if k in set(owned))
    resolution = resolve(state, upstream, kinds)
    findings: list[Finding] = []
    context = dict(context or {})
    docs = {**context, **{k: resolution.text(k) for k in kinds}}
    validation = None
    planning_mode, score_seconds = "full", float(max_seconds or 0.0)
    if resolution.conflicts:
        pass  # nothing to validate until the user decides
    elif rules is not None:
        checked = tuple(k for k in ("style", "lyrics", "score") if k in kinds)
        result = rules.validate_documents(
            docs,
            instrumental=instrumental,
            tokenizer=tokenizer,
            max_seconds=max_seconds,
            check=checked,
            target_seconds=target_seconds,
        )
        findings.extend(result.findings)
        validation = result.to_dict()
        planning_mode, score_seconds = result.planning_mode, result.score_seconds
    else:
        if "lyrics" in kinds:
            findings.extend(check_lyrics(docs.get("lyrics", ""), instrumental=instrumental))
        findings.append(
            info("No engine connected: model-specific rules and budgets are not checked.", "sheet")
        )
    for kind in kinds:
        if resolution.docs[kind].status is DocStatus.MISSING and kind in ("style", "lyrics"):
            findings.append(info(f"No {kind} is connected or entered.", kind))
    return SheetEvaluation(
        state,
        resolution,
        kinds,
        dict(upstream),
        context,
        tuple(findings),
        validation,
        planning_mode,
        score_seconds,
        review,
        engine_id,
        instrumental,
    )
