"""Stand-ins for the optional packages the vendored UniverSR code imports.

Two imports would otherwise be hard requirements on top of ComfyUI: ``timm`` (the UNet uses
``DropPath`` and ``trunc_normal_`` only) and ``torchdiffeq`` (``flow/solver.py`` calls
``odeint`` with a fixed time grid and the ``midpoint`` method). ComfyUI ships neither by default and
Plenio adds no Python packages (next-release plan §12), so this module installs a small, documented
replacement **only when the real package is missing** - `ensure_dependencies()` reports what it
substituted, and the adapter puts that into the refine report.

``DropPath`` follows timm's implementation (Apache-2.0, https://github.com/huggingface/pytorch-image-models);
``trunc_normal_`` delegates to PyTorch's own initialiser. The integrator implements the fixed-step
schemes of ``torchdiffeq`` for the time grid the upstream code passes (Euler, midpoint, RK4).
"""

from __future__ import annotations

import importlib.util
import sys
import types
from typing import Any

__all__ = ["ensure_dependencies", "drop_path", "trunc_normal", "odeint"]


# --- the stand-ins --------------------------------------------------------------------------------


def drop_path(x: Any, drop_prob: float = 0.0, training: bool = False, scale_by_keep: bool = True) -> Any:
    """Stochastic depth per sample (timm's ``drop_path``)."""
    import torch

    if drop_prob == 0.0 or not training:
        return x
    keep = 1 - drop_prob
    shape = (x.shape[0],) + (1,) * (x.ndim - 1)
    mask = x.new_empty(shape).bernoulli_(keep)
    if keep > 0 and scale_by_keep:
        mask.div_(keep)
    return x * mask


def trunc_normal(tensor: Any, mean: float = 0.0, std: float = 1.0, a: float = -2.0, b: float = 2.0) -> Any:
    """Truncated normal initialisation (PyTorch's own implementation)."""
    import torch

    return torch.nn.init.trunc_normal_(tensor, mean=mean, std=std, a=a, b=b)


def odeint(func: Any, y0: Any, t: Any, method: str = "euler", **_kwargs: Any) -> Any:
    """Fixed-step integration over the time grid ``t`` (the schemes ``torchdiffeq`` would run here).

    ``func(t, x)`` returns the drift; the result is stacked like ``torchdiffeq``'s (`states[0]` is
    ``y0``, so ``states[-1]`` is the answer the upstream solver uses).
    """
    import torch

    states = [y0]
    x = y0
    for index in range(len(t) - 1):
        start, end = t[index], t[index + 1]
        step = end - start
        if method == "euler":
            x = x + step * func(start, x)
        elif method == "midpoint":
            half = start + step / 2
            k1 = func(start, x)
            x = x + step * func(half, x + (step / 2) * k1)
        elif method == "rk4":
            half = start + step / 2
            k1 = func(start, x)
            k2 = func(half, x + (step / 2) * k1)
            k3 = func(half, x + (step / 2) * k2)
            k4 = func(end, x + step * k3)
            x = x + (step / 6) * (k1 + 2 * k2 + 2 * k3 + k4)
        else:
            raise ValueError(f"the vendored integrator supports euler, midpoint and rk4, not {method!r}")
        states.append(x)
    return torch.stack(states, dim=0)


# --- installation ---------------------------------------------------------------------------------


def _havable(name: str) -> bool:
    if name in sys.modules:
        return True
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return False


def _module(name: str) -> types.ModuleType:
    module = types.ModuleType(name)
    sys.modules[name] = module
    return module


def _install_timm() -> None:
    import torch

    class DropPath(torch.nn.Module):  # noqa: N801 - the name timm's users expect
        def __init__(self, drop_prob: float = 0.0, scale_by_keep: bool = True) -> None:
            super().__init__()
            self.drop_prob = float(drop_prob)
            self.scale_by_keep = bool(scale_by_keep)

        def forward(self, x: Any) -> Any:
            return drop_path(x, self.drop_prob, self.training, self.scale_by_keep)

        def extra_repr(self) -> str:
            return f"drop_prob={round(self.drop_prob, 3):0.3f}"

    top = _module("timm")
    models = _module("timm.models")
    layers = _module("timm.models.layers")
    layers.DropPath = DropPath  # type: ignore[attr-defined]
    layers.trunc_normal_ = trunc_normal  # type: ignore[attr-defined]
    models.layers = layers  # type: ignore[attr-defined]
    top.models = models  # type: ignore[attr-defined]


def _install_torchdiffeq() -> None:
    module = _module("torchdiffeq")
    module.odeint = odeint  # type: ignore[attr-defined]


def ensure_dependencies() -> dict[str, str]:
    """Install the stand-ins for missing packages; returns what was substituted (empty: nothing)."""
    used: dict[str, str] = {}
    if not _havable("timm"):
        _install_timm()
        used["timm"] = "vendored DropPath/trunc_normal_ (timm is not installed)"
    if not _havable("torchdiffeq"):
        _install_torchdiffeq()
        used["torchdiffeq"] = "vendored fixed-step integrator (torchdiffeq is not installed)"
    return used
