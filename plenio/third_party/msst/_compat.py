"""Stand-ins for the two packages the vendored BS-RoFormer imports and ComfyUI does not ship.

- ``beartype`` guards the upstream model's ``__init__`` signatures at runtime. Plenio builds the
  architecture from a pinned config, so the guards add nothing here: the stand-in aliases
  ``beartype.typing`` to :mod:`typing` and makes ``@beartype`` a no-op decorator.
- ``rotary_embedding_torch`` provides the rotary position embedding. When it is installed it is
  used (that is the package the released weights were trained with); otherwise this module installs
  an implementation of the same standard rotation (halves of the head dimension rotated by a
  geometric frequency schedule), which is what ``RotaryEmbedding(dim)`` does with the defaults the
  upstream model uses.

``ensure_dependencies()`` reports what it substituted; the engine puts that into the node's report.
"""

from __future__ import annotations

import importlib.util
import sys
import types
import typing
from typing import Any

__all__ = ["ensure_dependencies", "BeartypeDecorator", "RotaryEmbedding"]


def BeartypeDecorator(func: Any = None, **_kwargs: Any) -> Any:  # noqa: N802 - the name beartype uses
    """``@beartype`` without the runtime guarding (the architecture is fixed by the config)."""
    if func is None:
        return lambda inner: inner
    return func


class RotaryEmbedding:
    """The standard rotary embedding: rotate halves of the head dimension with a geometric schedule.

    Matches ``rotary_embedding_torch.RotaryEmbedding(dim)`` for the defaults the upstream model
    uses (no xpos, no interpolation): ``rotate_queries_or_keys(x)`` with ``x`` of shape
    ``[..., heads, seq, dim]`` or ``[..., seq, dim]`` (the last dimension is rotated).
    """

    def __init__(self, dim: int, **_kwargs: Any) -> None:
        import torch

        if dim % 2:
            raise ValueError("RotaryEmbedding needs an even dimension")
        self.dim = dim
        frequencies = 1.0 / (10000 ** (torch.arange(0, dim, 2).float() / dim))
        self.frequencies = frequencies

    @staticmethod
    def _rotate_half(x: Any) -> Any:
        half = x.shape[-1] // 2
        import torch

        first, second = x[..., :half], x[..., half:]
        return torch.cat([-second, first], dim=-1)

    def rotate_queries_or_keys(self, x: Any) -> Any:
        import torch

        seq = x.shape[-2]
        device, dtype = x.device, x.dtype
        angles = torch.outer(
            torch.arange(seq, device=device, dtype=torch.float32), self.frequencies.to(device)
        )
        # the same angles for both halves; duplicated so they line up with the last dimension
        angles = torch.cat([angles, angles], dim=-1).to(dtype)
        while angles.ndim < x.ndim:
            angles = angles.unsqueeze(0)
        angles = angles.expand_as(x)
        return x * angles.cos() + self._rotate_half(x) * angles.sin()


def _havable(name: str) -> bool:
    if name in sys.modules:
        return True
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return False


def _install_beartype() -> None:
    package = types.ModuleType("beartype")
    package.beartype = BeartypeDecorator  # type: ignore[attr-defined]
    typing_shim = types.ModuleType("beartype.typing")
    for name in dir(typing):
        if not name.startswith("_"):
            setattr(typing_shim, name, getattr(typing, name))
    package.typing = typing_shim  # type: ignore[attr-defined]
    sys.modules["beartype"] = package
    sys.modules["beartype.typing"] = typing_shim


def _install_rotary() -> None:
    module = types.ModuleType("rotary_embedding_torch")
    module.RotaryEmbedding = RotaryEmbedding  # type: ignore[attr-defined]
    sys.modules["rotary_embedding_torch"] = module


def ensure_dependencies() -> dict[str, str]:
    """Install the stand-ins for missing packages; returns what was substituted (empty: nothing)."""
    used: dict[str, str] = {}
    if not _havable("beartype"):
        _install_beartype()
        used["beartype"] = "vendored no-op type guard (beartype is not installed)"
    if not _havable("rotary_embedding_torch"):
        _install_rotary()
        used["rotary_embedding_torch"] = "vendored standard rotary embedding"
    return used
