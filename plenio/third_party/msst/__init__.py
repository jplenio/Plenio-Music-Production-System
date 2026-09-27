"""Vendored MSST BS-RoFormer inference code (MIT) - see ``NOTICE.md`` for the pinned commit.

Nothing here imports torch at package import; the adapter (``plenio.comfy.msst``) imports the
modules it needs when a separation model is loaded. ``ensure_dependencies`` installs the small
stand-ins for the two packages the upstream model imports and ComfyUI does not ship (``beartype``,
``rotary_embedding_torch``).
"""

from __future__ import annotations

from ._compat import ensure_dependencies

__all__ = ["ensure_dependencies"]
