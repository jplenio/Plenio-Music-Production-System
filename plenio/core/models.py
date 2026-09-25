"""The model catalogue (``resources/models.toml``, schema ``plenio.models/1``).

ComfyUI-format model files the templates load: where each file lives, where it comes from, its
licence and which templates need it. Plenio never downloads these files (ComfyUI's missing-model
dialog or the user does); the catalogue feeds the templates' download entries, the System Check
inventory and the model guide.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from .errors import PlenioUserError
from .files import read_toml

SCHEMA = "plenio.models/1"
FOLDERS = frozenset({"checkpoints", "loras", "audio_encoders", "text_encoders", "diffusion_models", "vae"})
_ID = re.compile(r"[a-z0-9][a-z0-9.-]*")
_URL = re.compile(r"https://huggingface\.co/[\w.-]+/[\w.-]+/resolve/[\w.-]+/[\w./-]+")


@dataclass(frozen=True)
class ModelFile:
    id: str
    file: str
    folder: str
    url: str
    bytes: int
    licence: str
    role: str
    default: bool
    templates: tuple[str, ...]
    optional_templates: tuple[str, ...] = ()

    @property
    def non_commercial(self) -> bool:
        return re.search(r"(?<![A-Za-z])NC(?![A-Za-z])", self.licence) is not None  # CC BY-NC, BY-NC-SA ...

    def download_entry(self) -> dict[str, str]:
        """The ``properties.models`` entry ComfyUI's missing-model dialog reads."""
        return {"name": self.file, "url": self.url, "directory": self.folder}


def parse_catalogue(data: Mapping[str, Any], source: str) -> dict[str, ModelFile]:
    if data.get("schema") != SCHEMA:
        raise PlenioUserError(f"{source}: expected schema {SCHEMA!r}, got {data.get('schema')!r}.")
    models: dict[str, ModelFile] = {}
    files: set[str] = set()
    for index, raw in enumerate(data.get("model", [])):
        where = f"{source} model #{index + 1}"
        try:
            model = ModelFile(
                id=str(raw["id"]),
                file=str(raw["file"]),
                folder=str(raw["folder"]),
                url=str(raw["url"]),
                bytes=int(raw.get("bytes", 0)),
                licence=str(raw["licence"]),
                role=str(raw["role"]),
                default=bool(raw["default"]),
                templates=tuple(str(t) for t in raw.get("templates", [])),
                optional_templates=tuple(str(t) for t in raw.get("optional_templates", [])),
            )
        except (KeyError, TypeError, ValueError) as error:
            raise PlenioUserError(f"{where} is incomplete or malformed: {error!r}.") from error
        if not _ID.fullmatch(model.id) or model.id in models:
            raise PlenioUserError(f"{where}: id {model.id!r} must be a unique lower-case identifier.")
        pure = PurePosixPath(model.file)
        if len(pure.parts) != 1 or model.file in files or not model.file.endswith(".safetensors"):
            raise PlenioUserError(f"{where}: file {model.file!r} must be a unique .safetensors file name.")
        if model.folder not in FOLDERS:
            raise PlenioUserError(f"{where}: unknown model folder {model.folder!r}.")
        if not _URL.fullmatch(model.url) or not model.url.endswith("/" + model.file):
            raise PlenioUserError(
                f"{where}: the URL must be a Hugging Face file URL ending in the file name."
            )
        if model.bytes < 0:
            raise PlenioUserError(f"{where}: bytes must not be negative.")
        if not model.default and (model.templates or model.optional_templates):
            raise PlenioUserError(f"{where}: an alternative (default = false) is not used by templates.")
        if set(model.templates) & set(model.optional_templates):
            raise PlenioUserError(f"{where}: a template needs the file either always or optionally.")
        models[model.id] = model
        files.add(model.file)
    return models


def load_catalogue(path: Path) -> dict[str, ModelFile]:
    return parse_catalogue(read_toml(path), str(path))


def by_file(catalogue: Mapping[str, ModelFile]) -> dict[str, ModelFile]:
    return {model.file: model for model in catalogue.values()}


def template_names(catalogue: Mapping[str, ModelFile]) -> list[str]:
    names = {t for model in catalogue.values() for t in (*model.templates, *model.optional_templates)}
    return sorted(names)


@dataclass(frozen=True)
class Inventory:
    """Which catalogued files are installed. ``found`` maps file name -> size on disk."""

    found: Mapping[str, int]

    def status(self, model: ModelFile) -> str:
        size = self.found.get(model.file)
        if size is None:
            return "missing"
        if model.bytes and size != model.bytes:
            return "size differs"
        return "installed"


def take_inventory(
    catalogue: Mapping[str, ModelFile], locate: Callable[[str, str], Path | None]
) -> Inventory:
    """``locate(folder, file)`` returns the installed path (ComfyUI's ``folder_paths``) or None."""
    found: dict[str, int] = {}
    for model in catalogue.values():
        path = locate(model.folder, model.file)
        if path is not None:
            try:
                found[model.file] = path.stat().st_size
            except OSError:
                continue
    return Inventory(found)


@dataclass(frozen=True)
class Readiness:
    template: str
    missing: tuple[ModelFile, ...]
    optional_missing: tuple[ModelFile, ...]

    @property
    def ready(self) -> bool:
        return not self.missing

    @property
    def missing_bytes(self) -> int:
        return sum(model.bytes for model in self.missing)


def readiness(
    catalogue: Mapping[str, ModelFile], inventory: Inventory, templates: Iterable[str]
) -> list[Readiness]:
    result = []
    for name in templates:
        needed = [m for m in catalogue.values() if name in m.templates]
        optional = [m for m in catalogue.values() if name in m.optional_templates]
        result.append(
            Readiness(
                name,
                tuple(m for m in needed if inventory.status(m) == "missing"),
                tuple(m for m in optional if inventory.status(m) == "missing"),
            )
        )
    return result


def size_text(size: int) -> str:
    """Decimal gigabytes as on model cards and download dialogs (``0`` = unknown)."""
    if size <= 0:
        return "size not recorded"
    if size >= 10**9:
        return f"{size / 10**9:.1f} GB"
    return f"{size / 10**6:.0f} MB"
