"""The engine descriptor that travels as ``PLENIO_ENGINE``."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class EngineInfo:
    """What the loaded music model is and which rules apply to it.

    Produced by the Engine Profile node next to the model loader, so the rules
    always follow the model that is actually loaded (R8). ``tokenizer`` is a
    handle for exact token counts; it is never serialised.
    """

    engine_id: str
    rules_version: str
    capabilities: Mapping[str, Any]
    model: Mapping[str, Any] = field(default_factory=dict)
    tokenizer: Any = field(default=None, compare=False, repr=False)

    def to_dict(self) -> dict[str, Any]:
        return {
            "engine_id": self.engine_id,
            "rules_version": self.rules_version,
            "capabilities": dict(self.capabilities),
            "model": dict(self.model),
            "exact_token_counts": self.tokenizer is not None,
        }
