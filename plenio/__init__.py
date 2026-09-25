"""Plenio Music Production System.

``plenio.core`` is a pure Python domain library (no ComfyUI imports).
``plenio.comfy`` holds the thin ComfyUI adapters. Modules inside this package
use relative imports only, because ComfyUI imports the custom node folder under
a path-derived module name.
"""

__version__ = "0.2.1"
