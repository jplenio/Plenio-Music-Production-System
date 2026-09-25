"""Report records (schema ``plenio.report/1``).

A report is what a node wants to have recorded: a status, a one-line summary,
human-readable messages and JSON data. Reports travel as ``PLENIO_REPORT``
values and end up in the release record.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .errors import PlenioUserError
from .hashing import canonical_json

REPORT_SCHEMA = "plenio.report/1"
_ACCEPTED_SCHEMAS = frozenset({REPORT_SCHEMA})


class Status(str, Enum):
    OK = "ok"
    WARNING = "warning"
    ERROR = "error"
    SKIPPED = "skipped"


_SEVERITY_ORDER = {Status.OK: 0, Status.SKIPPED: 1, Status.WARNING: 2, Status.ERROR: 3}


def worst(statuses: Sequence[Status]) -> Status:
    """The most severe status of ``statuses`` (``ok`` when empty)."""
    result = Status.OK
    for status in statuses:
        if _SEVERITY_ORDER[status] > _SEVERITY_ORDER[result]:
            result = status
    return result


@dataclass(frozen=True)
class Report:
    kind: str
    status: Status
    summary: str
    messages: tuple[str, ...] = ()
    data: Mapping[str, Any] = field(default_factory=dict)
    source: str = ""
    source_id: str = ""

    def __post_init__(self) -> None:
        if not self.kind:
            raise ValueError("Report.kind must not be empty")
        # Fail early when data is not plain JSON: records must be reproducible.
        canonical_json(dict(self.data))

    def with_source(self, source: str, source_id: str) -> Report:
        return Report(self.kind, self.status, self.summary, self.messages, self.data, source, source_id)

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": REPORT_SCHEMA,
            "kind": self.kind,
            "status": self.status.value,
            "summary": self.summary,
            "messages": list(self.messages),
            "data": dict(self.data),
            "source": {"node_type": self.source, "node_id": self.source_id},
        }

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> Report:
        schema = value.get("schema")
        if schema not in _ACCEPTED_SCHEMAS:
            raise PlenioUserError(
                f"Unsupported report schema {schema!r}.",
                hint=f"This version of Plenio reads {sorted(_ACCEPTED_SCHEMAS)}.",
            )
        try:
            status = Status(value["status"])
        except (KeyError, ValueError) as error:
            raise PlenioUserError(f"Report has an invalid status: {value.get('status')!r}.") from error
        source = value.get("source") or {}
        return cls(
            kind=str(value["kind"]),
            status=status,
            summary=str(value.get("summary", "")),
            messages=tuple(str(m) for m in value.get("messages", ())),
            data=dict(value.get("data", {})),
            source=str(source.get("node_type", "")),
            source_id=str(source.get("node_id", "")),
        )

    def to_markdown(self) -> str:
        badge = {Status.OK: "OK", Status.WARNING: "Warning", Status.ERROR: "Error", Status.SKIPPED: "Skipped"}
        lines = [f"**{badge[self.status]}** - {self.summary}"]
        lines.extend(f"- {message}" for message in self.messages)
        return "\n".join(lines)
