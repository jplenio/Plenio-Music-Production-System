"""Error taxonomy.

Every error carries a message that says what happened and, where possible, a
``hint`` that says what the user can do about it. ComfyUI shows ``str(error)``
in the node error dialog, so the hint is part of the string.
"""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any


class PlenioError(Exception):
    """Base class of all Plenio errors."""

    def __init__(self, message: str, *, hint: str | None = None, details: Mapping[str, Any] | None = None):
        super().__init__(message)
        self.message = message
        self.hint = hint
        self.details: dict[str, Any] = dict(details or {})

    def __str__(self) -> str:
        if self.hint:
            return f"{self.message}\nHow to fix: {self.hint}"
        return self.message


class PlenioUserError(PlenioError):
    """The input or the configuration is wrong; the user can fix it."""


class PlenioValidationError(PlenioUserError):
    """A document or value failed validation.

    ``diagnostics`` holds the individual findings (dicts with at least
    ``severity`` and ``message``) so that nodes and the editor can show them.
    """

    def __init__(
        self,
        message: str,
        *,
        diagnostics: Sequence[Mapping[str, Any]] = (),
        hint: str | None = None,
    ):
        super().__init__(message, hint=hint, details={"diagnostics": [dict(d) for d in diagnostics]})
        self.diagnostics = [dict(d) for d in diagnostics]

    def __str__(self) -> str:
        lines = [self.message]
        for item in self.diagnostics:
            where = item.get("where")
            prefix = f"[{where}] " if where else ""
            lines.append(f"- {item.get('severity', 'error')}: {prefix}{item.get('message', '')}")
        if self.hint:
            lines.append(f"How to fix: {self.hint}")
        return "\n".join(lines)


class PlenioConflictError(PlenioUserError):
    """An edited document is stale because its upstream draft changed."""

    CHOICES = (
        "keep my edit (make it manual)",
        "discard my edit (use the new draft)",
        "compare and merge in the Song Sheet editor",
    )

    def __init__(self, message: str, *, documents: Sequence[str]):
        super().__init__(
            message,
            hint="Open the Song Sheet and choose for each document: " + "; ".join(self.CHOICES) + ".",
            details={"documents": list(documents)},
        )
        self.documents = list(documents)


class PlenioDependencyError(PlenioError):
    """An optional Python package or program is missing."""

    def __init__(self, package: str, *, feature: str, install: str):
        super().__init__(
            f"{feature} needs the Python package '{package}', which is not installed.",
            hint=f"Install it into the Python environment that runs ComfyUI: {install}",
            details={"package": package, "install": install},
        )
        self.package = package
        self.install = install


class PlenioModelError(PlenioError):
    """The loaded model is not the one a node needs."""


class PlenioAssetError(PlenioError):
    """A non-ComfyUI asset (for example an ASR model folder) is missing or broken."""


class PlenioWorkerError(PlenioError):
    """An out-of-process worker failed, crashed or timed out."""


class PlenioCancelledError(PlenioError):
    """The user interrupted the run."""
