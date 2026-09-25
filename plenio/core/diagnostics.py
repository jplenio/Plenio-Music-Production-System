"""Validation findings shared by documents, scores and engine rules."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from typing import Any

SEVERITIES = ("error", "warning", "info")


@dataclass(frozen=True)
class Finding:
    severity: str
    message: str
    where: str = ""
    """Which document or place, e.g. ``style``, ``lyrics``, ``score bar 7``."""
    data: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.severity not in SEVERITIES:
            raise ValueError(f"unknown severity {self.severity!r}")

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {"severity": self.severity, "message": self.message, "where": self.where}
        if self.data:
            result["data"] = dict(self.data)
        return result


def error(message: str, where: str = "", **data: Any) -> Finding:
    return Finding("error", message, where, data)


def warning(message: str, where: str = "", **data: Any) -> Finding:
    return Finding("warning", message, where, data)


def info(message: str, where: str = "", **data: Any) -> Finding:
    return Finding("info", message, where, data)


def has_errors(findings: Iterable[Finding]) -> bool:
    return any(f.severity == "error" for f in findings)


def summarize(findings: Iterable[Finding]) -> str:
    items = list(findings)
    errors = sum(f.severity == "error" for f in items)
    warnings = sum(f.severity == "warning" for f in items)
    if not errors and not warnings:
        return "valid"
    parts = []
    if errors:
        parts.append(f"{errors} error{'s' if errors != 1 else ''}")
    if warnings:
        parts.append(f"{warnings} warning{'s' if warnings != 1 else ''}")
    return ", ".join(parts)
