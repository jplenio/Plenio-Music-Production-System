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


def rules_for(engine_id: str) -> ModuleType:
    try:
        return ENGINES[engine_id]
    except KeyError as error:
        raise PlenioModelError(
            f"Plenio has no rules for the music engine {engine_id!r}.",
            hint=f"Supported engines: {sorted(ENGINES)}.",
        ) from error


__all__ = ["ENGINES", "EngineInfo", "rules_for"]
