"""Objects shared by several nodes and routes (created lazily, once per process)."""

from __future__ import annotations

import json
import secrets
import threading
import time
from dataclasses import replace
from functools import lru_cache
from pathlib import Path
from typing import Any

from ..core.arrangement import ModeLibrary
from ..core.assets import Asset, load_catalogue
from ..core.audio.presets import Library
from ..core.blocks import Block, brief_outputs, current_blocks, model_blocks
from ..core.brief import TemplateLibrary
from ..core.config import PlenioConfig
from ..core.errors import PlenioError
from ..core.models import ModelFile
from ..core.models import load_catalogue as load_model_catalogue
from ..core.reports import Report
from ..core.series import Series
from ..core.system import check_system, to_markdown
from . import host

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
SERIES = Series(lambda: secrets.randbelow(9999) + 1)
"""The songs of the 'new song/cover every run' series of this server (``core.series``)."""
RESOURCES = PACKAGE_ROOT / "resources"
WORKFLOW_TEMPLATES = PACKAGE_ROOT / "example_workflows"
BLUEPRINTS = PACKAGE_ROOT / "subgraphs"


@lru_cache(maxsize=1)
def template_workflows() -> dict[str, dict[str, Any]]:
    """The shipped templates by name (``1 · YuE2 · Song`` ...): a record made before records kept their
    workflow is continued in the one its prompt matches (``core.continuation``)."""
    workflows: dict[str, dict[str, Any]] = {}
    for path in sorted(WORKFLOW_TEMPLATES.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(data, dict) and isinstance(data.get("nodes"), list):
            workflows[path.stem] = data
    return workflows


def _blueprint_files() -> list[dict[str, Any]]:
    files: list[dict[str, Any]] = []
    for path in sorted(BLUEPRINTS.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(data, dict):
            files.append(data)
    return files


@lru_cache(maxsize=1)
def shipped_blocks() -> dict[str, Block]:
    """The package's blocks that follow the brief's creativity (``subgraphs/``): a workflow saved before
    keeps older ones, brought up to date when it opens (``core.blocks``)."""
    return current_blocks(_blueprint_files())


@lru_cache(maxsize=1)
def shipped_model_blocks() -> dict[str, Block]:
    """The package's model blocks with Model Choice (``subgraphs/``): offered to a workflow saved with 1.x when
    asked (``core.blocks.upgrade_models``)."""
    return model_blocks(_blueprint_files())


@lru_cache(maxsize=1)
def template_briefs() -> dict[str, list[Any]]:
    """The briefs' outputs as the shipped templates have them (``core.blocks.brief_outputs``)."""
    return brief_outputs(template_workflows().values())


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
def mode_library() -> ModeLibrary:
    """The creative modes: the package's (``resources/arrangement``) and the user's own files."""
    try:
        user_dir: Path | None = host.user_directory() / "plenio" / "arrangement"
    except (ImportError, AttributeError):  # outside a running ComfyUI (contract tests): package modes only
        user_dir = None
    return ModeLibrary(RESOURCES / "arrangement", user_dir)


MODES_TTL_S = 5.0
"""How long the list of creative modes is reused before the files are read again (a refresh, R, then
lists a mode file the user just added)."""
_modes_read = [0.0]
_modes_lock = threading.Lock()


def mode_names() -> list[str]:
    """The options of the briefs' *arrangement* list, read again when older than ``MODES_TTL_S``."""
    library = mode_library()
    with _modes_lock:
        if time.monotonic() - _modes_read[0] > MODES_TTL_S:
            library.reload()
            _modes_read[0] = time.monotonic()
        return library.names()


def mode_description(name: str) -> str:
    """What the creative mode ``name`` does (its file's description; empty for ``off``, a mode without one or an
    unknown name) - the brief's summary and its panel say it for the chosen mode."""
    try:
        mode = mode_library().by_name(name)
    except PlenioError:
        return ""
    found = mode_library().modes().get(mode.id)
    return found.description.strip() if mode.arranges and found is not None else ""


def mode_guide() -> str:
    """Every creative mode in a line - its name and what it does (the help page's list)."""
    library = mode_library()
    names = mode_names()
    modes = library.modes()
    lines = [
        f"{name}: {description}" if (description := modes[mode.id].description.strip()) else name
        for name in names
        if (mode := library.by_name(name)).arranges and mode.id in modes
    ]
    return "\n".join(lines)


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
    try:
        found = llm.discovery(config, fresh=True)
        runtimes = [runtime.name for runtime in llm.runtimes(config)]
    except Exception as error:  # noqa: BLE001 - a broken model folder must not take the System Check down
        return {"runtimes": [], "models": {}, "files": 0, "notes": [f"listing the models failed: {error}"]}
    counts: dict[str, int] = {}
    for model in found.models:
        counts[model.source] = counts.get(model.source, 0) + 1
    blocked = False
    try:
        choice = llm.gemma_choice(config)
        writer, blocked = choice.describe(), choice.blocked
    except Exception as error:  # noqa: BLE001 - the System Check reports what it can
        writer = f"cannot tell ({error})"
    return {
        "runtimes": runtimes,
        "models": counts,
        "files": sum(1 for model in found.models if model.path is not None),
        "notes": list(found.notes),
        "writer": writer,
        "writer_blocked": blocked,
    }


def system_report() -> tuple[Report, str]:
    """The System Check report and its Markdown (node and route)."""
    facts = replace(host.system_facts(model_catalogue(), asset_catalogue()), llm=llm_facts())
    from ..core.models import load_components

    report = check_system(
        facts, model_catalogue(), asset_catalogue(), load_components(RESOURCES / "models.toml")
    )
    return report, to_markdown(report)
