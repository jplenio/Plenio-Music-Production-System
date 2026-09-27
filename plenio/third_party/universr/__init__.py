"""Vendored UniverSR inference code (MIT) - see ``NOTICE.md`` for the pinned commit and the changes.

Nothing here imports torch at package import; the adapter (``plenio.comfy.universr``) imports the
modules it needs when a super-resolution model is actually loaded. ``ensure_dependencies`` installs
the small stand-ins for optional host packages (timm, torchdiffeq) that ComfyUI may not ship.
"""

from __future__ import annotations

from ._compat import ensure_dependencies

__all__ = ["ensure_dependencies"]
