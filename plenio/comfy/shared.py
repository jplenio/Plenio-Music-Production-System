"""Objects shared by several nodes and routes (created lazily, once per process)."""

from __future__ import annotations

from dataclasses import replace
from functools import lru_cache
from pathlib import Path
from typing import Any

from ..core.assets import Asset, load_catalogue
from ..core.audio.presets import Library
from ..core.brief import TemplateLibrary
from ..core.config import PlenioConfig
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


def llm_facts() -> dict[str, Any]:
    """What Local LLM finds on this machine, for the System Check."""
    from ..core.errors import PlenioError
    from . import llm

    try:
        config = host.load_config()
    except PlenioError:
        config = PlenioConfig()  # the System Check reports the configuration error itself
    found = llm.discovery(config, fresh=True)
    counts: dict[str, int] = {}
    for model in found.models:
        counts[model.source] = counts.get(model.source, 0) + 1
    return {
        "runtimes": [runtime.name for runtime in llm.runtimes(config)],
        "models": counts,
        "files": sum(1 for model in found.models if model.path is not None),
        "notes": list(found.notes),
    }


def system_report() -> tuple[Report, str]:
    """The System Check report and its Markdown (node and route)."""
    facts = replace(host.system_facts(model_catalogue(), asset_catalogue()), llm=llm_facts())
    report = check_system(facts, model_catalogue())
    return report, to_markdown(report)
