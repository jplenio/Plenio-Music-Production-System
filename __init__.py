"""Plenio Music Production System - ComfyUI custom node package.

ComfyUI imports this file as a package. Everything lives in the ``plenio``
package; this module only exposes the V3 entry point and the frontend directory.
"""

WEB_DIRECTORY = "./web"

# pytest imports this file without a parent package while collecting tests;
# only a package import (ComfyUI) loads the entry point.
if __package__:
    from .plenio.comfy.extension import comfy_entrypoint

    __all__ = ["WEB_DIRECTORY", "comfy_entrypoint"]
