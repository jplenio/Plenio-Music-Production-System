"""Objects shared by several nodes and routes (created lazily, once per process)."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from ..core.assets import Asset, load_catalogue
from ..core.audio.presets import Library
from ..core.brief import TemplateLibrary
from ..core.models import ModelFile
from ..core.models import load_catalogue as load_model_catalogue
from ..core.reports import Report
from ..core.system import check_system, to_markdown
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


@lru_cache(maxsize=1)
def preset_library() -> Library:
    """EQ and loudness presets shipped with Plenio (``resources/presets``)."""
    return Library(RESOURCES / "presets")


@lru_cache(maxsize=1)
def model_catalogue() -> dict[str, ModelFile]:
    """The model files the templates load (``resources/models.toml``)."""
    return load_model_catalogue(RESOURCES / "models.toml")


def system_report() -> tuple[Report, str]:
    """The System Check report and its Markdown (node and route)."""
    report = check_system(host.system_facts(model_catalogue(), asset_catalogue()), model_catalogue())
    return report, to_markdown(report)
