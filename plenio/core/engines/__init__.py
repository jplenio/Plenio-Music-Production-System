"""Engine rules modules. Each engine is a plain module with rules, budgets and validation.

There is no common engine API: shared nodes adapt through ``rules_for`` and the
``PLENIO_ENGINE`` descriptor (target-architecture section 7).
"""

from __future__ import annotations

from types import ModuleType

from ..errors import PlenioModelError
from . import minimax, yue2
from .base import EngineInfo

ENGINES: dict[str, ModuleType] = {yue2.ENGINE_ID: yue2, minimax.ENGINE_ID: minimax}

MODULE_INTERFACE = (
    "ENGINE_ID",
    "RULES_VERSION",
    "LICENCE",
    "STYLE_LABEL",
    "capabilities",
    "writing_rules",
    "enforce_style",
    "check_style",
    "check_lyrics",
    "validate_documents",
    "describe_budget",
)
"""What shared code uses of an engine module; a new engine provides all of it (target-architecture
section 7.3). ``writing_rules()`` returns at least ``WRITING_RULE_KEYS``. Checked by the unit tests."""

WRITING_RULE_KEYS = ("engine", "style", "lyrics", "sections", "example_style")


def rules_for(engine_id: str) -> ModuleType:
    try:
        return ENGINES[engine_id]
    except KeyError as error:
        raise PlenioModelError(
            f"Plenio has no rules for the music engine {engine_id!r}.",
            hint=f"Supported engines: {sorted(ENGINES)}.",
        ) from error


__all__ = ["ENGINES", "MODULE_INTERFACE", "WRITING_RULE_KEYS", "EngineInfo", "rules_for"]
