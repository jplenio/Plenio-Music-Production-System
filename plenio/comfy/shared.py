"""Objects shared by several nodes and routes (created lazily, once per process)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from ..core.assets import Asset, load_catalogue
from ..core.brief import TemplateLibrary
from . import host

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
RESOURCES = PACKAGE_ROOT / "resources"


@lru_cache(maxsize=1)
def template_library() -> TemplateLibrary:
    try:
        user_dir: Path | None = host.user_directory() / "plenio" / "templates"
    except (
        ImportError,
        AttributeError,
    ):  # outside a running ComfyUI (contract tests): package templates only
        user_dir = None
    return TemplateLibrary(RESOURCES / "templates", user_dir)


@lru_cache(maxsize=1)
def asset_catalogue() -> dict[str, Asset]:
    return load_catalogue(RESOURCES / "assets.toml")
