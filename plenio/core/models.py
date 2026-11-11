"""The model catalogue (``resources/models.toml``, schema ``plenio.models/2``).

The ComfyUI-format model files Plenio's templates load, as **components** and their **variants**. A component is
one thing a template needs - the YuE2 music model, FLUX.2's text encoder -; a variant is one file that can be it:
the int8 or the bf16 checkpoint, the full or the fp4 encoder. Every variant says where its file comes from (a URL
pinned to a commit, its size and SHA-256), its licence, and what a graphics card needs to run it, so that the
model plan (``plenio.core.modelplan``) can choose per machine.

The catalogue feeds the templates' download entries, the System Check's inventory, the model guide and Plenio
Setup. ``load_catalogue`` gives the flat view older code reads: one ``ModelFile`` per variant.
``yue2_checkpoint_problem`` reads a YuE2 file's own table of contents: a finetune loads as a ComfyUI checkpoint
only in ComfyUI's format.
"""

from __future__ import annotations

import json
import os
import re
import struct
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any

from .errors import PlenioUserError
from .files import read_toml

SCHEMA = "plenio.models/2"
AUDIO_MODEL_FOLDERS = {"super-resolution": "audio_sr", "separation": "audio_separation"}
"""Plenio's own model folders (registered with ComfyUI) for Load Audio Model, by model kind."""
FILE_SUFFIXES = (".safetensors", ".bin", ".ckpt")
"""Allowed catalogued file names. ``.bin``/``.ckpt`` cover released PyTorch state dicts (UniverSR,
BS-RoFormer); the adapters read them with ``weights_only=True`` only (``comfy.audio_models.read_weights``)."""
FOLDERS = frozenset(
    {
        "checkpoints",
        "loras",
        "audio_encoders",
        "text_encoders",
        "diffusion_models",
        "vae",
        *AUDIO_MODEL_FOLDERS.values(),
    }
)
_ID = re.compile(r"[a-z0-9][a-z0-9.-]*")
_HUB_URL = re.compile(
    r"https://huggingface\.co/(?P<repo>[\w.-]+/[\w.-]+)/resolve/(?P<revision>[\w.-]+)/(?P<path>[\w./-]+)"
)
_RELEASE_URL = re.compile(r"https://github\.com/[\w.-]+/[\w.-]+/releases/download/[\w.-]+/[\w./-]+")
"""A direct file URL: a Hugging Face ``resolve`` path or a GitHub release asset (both download the
file itself; the MSST checkpoints are published as GitHub release assets)."""
_COMMIT = re.compile(r"[0-9a-f]{40}")
_SHA256 = re.compile(r"[0-9a-f]{64}")


@dataclass(frozen=True)
class Variant:
    """One file that can be a component: where it comes from and what it needs."""

    id: str
    file: str
    url: str
    bytes: int
    sha256: str
    licence: str
    role: str
    default: bool
    """The file the templates' loaders are set to (one per component)."""
    quality: int = 1
    """Rank within the component; higher is better."""
    speed: int = 1
    """Rank within the component; higher is faster."""
    vram_min_gib: float = 0.0
    """Below this much graphics memory the file runs only with heavy offloading."""
    vram_full_gib: float = 0.0
    """From this much graphics memory on, its stage runs on the card."""
    basis: str = "estimate"
    """Where the two thresholds come from: ``estimate`` or ``measured ...``."""
    gated: bool = False
    """The repository asks for an agreement on its page before the file can be downloaded."""
    manual_approval: bool = False
    """The model's makers approve each agreement by hand (the hub's ``gated = "manual"``): access can take days."""

    @property
    def non_commercial(self) -> bool:
        return re.search(r"(?<![A-Za-z])NC(?![A-Za-z])", self.licence) is not None  # CC BY-NC, BY-NC-SA ...

    @property
    def hub(self) -> tuple[str, str, str] | None:
        """``(repository, revision, path)`` of a Hugging Face file; ``None`` for a GitHub release asset."""
        match = _HUB_URL.fullmatch(self.url)
        return (match["repo"], match["revision"], match["path"]) if match else None


@dataclass(frozen=True)
class Component:
    """One thing a template needs, and the files that can be it."""

    id: str
    title: str
    folder: str
    variants: tuple[Variant, ...]
    templates: tuple[str, ...] = ()
    """Templates that need the component to run."""
    optional_templates: tuple[str, ...] = ()
    """Templates in which only an optional (bypassed) block uses it."""
    loader_node: str = ""
    loader_input: str = ""
    """The ComfyUI node and input that take the file's name (empty: a Plenio node lists the folder itself)."""
    accepts: str = ""
    """Which other files on disk may stand in (a sniffer's name; empty: only the catalogued ones)."""

    @property
    def default(self) -> Variant:
        return next(v for v in self.variants if v.default)


@dataclass(frozen=True)
class ModelFile:
    """A variant in the flat view: its file with its component's folder and templates. Only a component's default
    variant belongs to templates; the others are alternatives to choose."""

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
    component: str = ""
    sha256: str = ""

    @property
    def non_commercial(self) -> bool:
        return re.search(r"(?<![A-Za-z])NC(?![A-Za-z])", self.licence) is not None  # CC BY-NC, BY-NC-SA ...

    def download_entry(self) -> dict[str, str]:
        """The ``properties.models`` entry ComfyUI's missing-model dialog reads."""
        return {"name": self.file, "url": self.url, "directory": self.folder}


def _variant(raw: Mapping[str, Any], where: str, *, strict: bool) -> Variant:
    try:
        variant = Variant(
            id=str(raw["id"]),
            file=str(raw["file"]),
            url=str(raw["url"]),
            bytes=int(raw.get("bytes", 0)),
            sha256=str(raw.get("sha256", "")).lower(),
            licence=str(raw["licence"]),
            role=str(raw["role"]),
            default=bool(raw.get("default", False)),
            quality=int(raw.get("quality", 1)),
            speed=int(raw.get("speed", 1)),
            vram_min_gib=float(raw.get("vram_min_gib", 0.0)),
            vram_full_gib=float(raw.get("vram_full_gib", 0.0)),
            basis=str(raw.get("basis", "estimate")),
            gated=bool(raw.get("gated", False)),
            manual_approval=bool(raw.get("manual_approval", False)),
        )
    except (KeyError, TypeError, ValueError) as error:
        raise PlenioUserError(f"{where} is incomplete or malformed: {error!r}.") from error
    if not _ID.fullmatch(variant.id):
        raise PlenioUserError(f"{where}: id {variant.id!r} must be a lower-case identifier.")
    if len(PurePosixPath(variant.file).parts) != 1 or not variant.file.endswith(FILE_SUFFIXES):
        raise PlenioUserError(
            f"{where}: file {variant.file!r} must be a {' or '.join(FILE_SUFFIXES)} file name."
        )
    hub = _HUB_URL.fullmatch(variant.url)
    if not (hub or _RELEASE_URL.fullmatch(variant.url)) or not variant.url.endswith("/" + variant.file):
        raise PlenioUserError(
            f"{where}: the URL must be a Hugging Face or GitHub release file URL ending in the file name."
        )
    if variant.bytes < 0 or variant.quality < 1 or variant.speed < 1:
        raise PlenioUserError(f"{where}: bytes must not be negative; quality and speed are ranks from 1.")
    if not 0 <= variant.vram_min_gib <= variant.vram_full_gib:
        raise PlenioUserError(f"{where}: 0 <= vram_min_gib <= vram_full_gib.")
    if strict:
        if hub and not _COMMIT.fullmatch(hub["revision"]):
            raise PlenioUserError(
                f"{where}: the URL must be pinned to a full commit hash, not {hub['revision']!r} "
                "(tools/catalogue_check.py --write pins it)."
            )
        if variant.bytes <= 0 or not _SHA256.fullmatch(variant.sha256):
            raise PlenioUserError(
                f"{where}: the size and the SHA-256 of the file are needed (tools/catalogue_check.py --write)."
            )
    return variant


def parse_components(data: Mapping[str, Any], source: str, *, strict: bool = True) -> dict[str, Component]:
    """The catalogue's components by id. ``strict`` (the shipped file): every Hugging Face URL is pinned to a
    commit and every file has its size and SHA-256; ``tools/catalogue_check.py`` reads a draft without."""
    if data.get("schema") != SCHEMA:
        raise PlenioUserError(f"{source}: expected schema {SCHEMA!r}, got {data.get('schema')!r}.")
    components: dict[str, Component] = {}
    ids: set[str] = set()
    files: set[str] = set()
    for index, raw in enumerate(data.get("component", [])):
        where = f"{source} component #{index + 1}"
        try:
            loader = raw.get("loader") or {}
            component = Component(
                id=str(raw["id"]),
                title=str(raw["title"]),
                folder=str(raw["folder"]),
                variants=tuple(
                    _variant(item, f"{where} variant #{number + 1}", strict=strict)
                    for number, item in enumerate(raw.get("variant", []))
                ),
                templates=tuple(str(t) for t in raw.get("templates", [])),
                optional_templates=tuple(str(t) for t in raw.get("optional_templates", [])),
                loader_node=str(loader.get("node", "")),
                loader_input=str(loader.get("input", "")),
                accepts=str(raw.get("accepts", "")),
            )
        except (KeyError, TypeError, ValueError, AttributeError) as error:
            raise PlenioUserError(f"{where} is incomplete or malformed: {error!r}.") from error
        if not _ID.fullmatch(component.id) or component.id in components:
            raise PlenioUserError(f"{where}: id {component.id!r} must be a unique lower-case identifier.")
        if component.folder not in FOLDERS:
            raise PlenioUserError(f"{where}: unknown model folder {component.folder!r}.")
        if not component.variants:
            raise PlenioUserError(f"{where}: a component has at least one variant.")
        if sum(v.default for v in component.variants) != 1:
            raise PlenioUserError(f"{where}: exactly one variant is the default.")
        if set(component.templates) & set(component.optional_templates):
            raise PlenioUserError(f"{where}: a template needs the component either always or optionally.")
        if bool(component.loader_node) != bool(component.loader_input):
            raise PlenioUserError(f"{where}: a loader names its node and its input.")
        ranks = [v.quality for v in component.variants]
        if len(set(ranks)) != len(ranks):
            raise PlenioUserError(f"{where}: two variants have the same quality rank.")
        for variant in component.variants:
            if variant.id in ids or variant.file in files:
                raise PlenioUserError(
                    f"{where}: variant {variant.id!r} ({variant.file}) - ids and file names are unique."
                )
            ids.add(variant.id)
            files.add(variant.file)
        components[component.id] = component
    return components


def flat(components: Mapping[str, Component]) -> dict[str, ModelFile]:
    """One ``ModelFile`` per variant, by variant id, in the catalogue's order."""
    models: dict[str, ModelFile] = {}
    for component in components.values():
        for variant in component.variants:
            models[variant.id] = ModelFile(
                id=variant.id,
                file=variant.file,
                folder=component.folder,
                url=variant.url,
                bytes=variant.bytes,
                licence=variant.licence,
                role=variant.role,
                default=variant.default,
                templates=component.templates if variant.default else (),
                optional_templates=component.optional_templates if variant.default else (),
                component=component.id,
                sha256=variant.sha256,
            )
    return models


def parse_catalogue(data: Mapping[str, Any], source: str) -> dict[str, ModelFile]:
    return flat(parse_components(data, source))


def load_components(path: Path) -> dict[str, Component]:
    return parse_components(read_toml(path), str(path))


def load_catalogue(path: Path) -> dict[str, ModelFile]:
    return flat(load_components(path))


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
    incomplete: tuple[ModelFile, ...] = ()
    """Needed files whose size differs from the published one (an interrupted download?)."""

    @property
    def ready(self) -> bool:
        return not self.missing and not self.incomplete

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
                tuple(m for m in needed if inventory.status(m) == "size differs"),
            )
        )
    return result


_MAX_HEADER = 64 * 1024 * 1024
"""A safetensors header larger than this is no model's table of contents."""


def yue2_checkpoint_problem(path: Path) -> str | None:
    """What keeps a YuE2 ``.safetensors`` file from loading as a ComfyUI checkpoint, from its header alone - or
    ``None`` when nothing does (one file with the music model, the text side with its tokenizer and the audio
    decoder, as Comfy-Org's own files and the finetunes made for ComfyUI have them). An empty file (an interrupted
    download) is the inventory's business."""
    try:
        with path.open("rb") as file:
            prefix = file.read(8)
            if not prefix:
                return None
            size = struct.unpack("<Q", prefix)[0] if len(prefix) == 8 else _MAX_HEADER + 1
            if size > _MAX_HEADER:
                return "not a safetensors file"
            header = json.loads(file.read(size))
    except (OSError, ValueError):
        return "not readable as a safetensors file"
    keys = [str(key) for key in header] if isinstance(header, dict) else []
    music = any(key.startswith("model.diffusion_model.") for key in keys)
    decoder = any(key.startswith("vae.") for key in keys)
    tokenizer = any(key.endswith("yue2_tokenizer_json") for key in keys)
    if music and decoder and tokenizer:
        return None
    if not music and any(key.startswith("model.layers.") or key == "lm_head.weight" for key in keys):
        return (
            "in m-a-p's Transformers layout, which ComfyUI does not load: take the file made for ComfyUI (a "
            "repository's comfyui folder) or convert it"
        )
    missing = [
        part
        for part, there in (
            ("the music model", music),
            ("the audio decoder", decoder),
            ("the tokenizer of the text side", tokenizer),
        )
        if not there
    ]
    return f"without {', '.join(missing)}: Load Checkpoint needs them all in one file"


def size_text(size: int) -> str:
    """Decimal gigabytes as on model cards and download dialogs (``0`` = unknown)."""
    if size <= 0:
        return "size not recorded"
    if size >= 10**9:
        return f"{size / 10**9:.1f} GB"
    return f"{size / 10**6:.0f} MB"


# --- model folders beside the ones ComfyUI knows -----------------------------------------

NOT_MODEL_FOLDERS = frozenset({"custom_nodes", "datasets"})
"""Keys of ComfyUI's ``folder_names_and_paths`` that hold no models (their parent is no model root)."""


def _key(path: Path) -> str:
    return os.path.normcase(os.path.abspath(str(path)))


def model_roots(registered: Mapping[str, Iterable[str]]) -> list[Path]:
    """The folders that hold ComfyUI's model folders: the parent of every registered model folder -
    ``models`` itself and every location of ``extra_model_paths.yaml`` (``registered``: folder name ->
    its paths, as ``folder_paths.folder_names_and_paths`` has them)."""
    roots: list[Path] = []
    seen: set[str] = set()
    for name, paths in registered.items():
        if name in NOT_MODEL_FOLDERS:
            continue
        for path in paths:
            root = Path(path).parent
            if _key(root) not in seen:
                seen.add(_key(root))
                roots.append(root)
    return roots


def sibling_folders(folder: str, registered: Mapping[str, Iterable[str]]) -> list[Path]:
    """Existing folders named ``folder`` beside the model folders ComfyUI knows that it does not search for
    ``folder`` - an ``audio_separation`` folder created next to the ``checkpoints`` of an
    ``extra_model_paths.yaml`` location, which ComfyUI reads only with its own line in that file (a user's
    report 2026-10-10: the stem model was found only in ComfyUI's own ``models`` folder)."""
    known = {_key(Path(path)) for path in registered.get(folder, ())}
    found: list[Path] = []
    for root in model_roots(registered):
        candidate = root / folder
        if _key(candidate) not in known and candidate.is_dir():
            known.add(_key(candidate))
            found.append(candidate)
    return found


def misplaced_file(folder: str, file: str, registered: Mapping[str, Iterable[str]]) -> Path | None:
    """A copy of ``file`` in a folder named ``folder`` beside the known model folders that ComfyUI does not
    search for ``folder`` (``extra_model_paths.yaml`` lacks its line): where the System Check sends the user."""
    known = {_key(Path(path)) for path in registered.get(folder, ())}
    for root in model_roots(registered):
        candidate = root / folder
        if _key(candidate) not in known and (candidate / file).is_file():
            return candidate / file
    return None
