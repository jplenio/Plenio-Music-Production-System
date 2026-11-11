"""System Check: diagnostics, findings with fixes, and transparent recommendations.

The adapter collects facts from ComfyUI and torch; this module turns them into a report. What needs attention is a
:class:`Finding` with a stable id (listed in ``docs/user/troubleshooting.md``) and, where a button can help, a
:class:`Fix`: the System Check node renders them as text, Plenio Setup as rows with buttons, the API as JSON - one
list, three views. Nothing is switched automatically.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import features
from .assets import Asset
from .models import Inventory, ModelFile, readiness, size_text, template_names
from .reports import Report, Status, worst

MIN_COMFYUI = (0, 37, 0)
GIB = 1024**3
ESSENTIAL_PACKAGES = frozenset({"av", "PIL", "scipy"})
"""Packages ComfyUI itself installs; missing means a broken installation (the others are optional)."""
CPU_TEMPLATES = ("0 · System Check", "4 · Enhance & Master")


@dataclass(frozen=True)
class Device:
    index: int
    name: str
    kind: str
    total_bytes: int | None = None
    free_bytes: int | None = None


@dataclass(frozen=True)
class SystemFacts:
    plenio_version: str
    comfyui_version: str
    frontend_version: str
    python_version: str
    platform: str
    torch_version: str
    active_device: str
    devices: tuple[Device, ...] = ()
    ram_total_bytes: int | None = None
    packages: Mapping[str, str | None] = field(default_factory=dict)
    config: Mapping[str, Any] = field(default_factory=dict)
    models: Mapping[str, int] = field(default_factory=dict)
    """Installed catalogue model files: file name -> size on disk."""
    misplaced: Mapping[str, str] = field(default_factory=dict)
    """Missing catalogue model files found in a folder ComfyUI does not search: file name -> its path (the
    folder beside the known model folders, e.g. ``audio_encoders`` of an ``extra_model_paths.yaml``
    location without its line)."""
    assets: Mapping[str, str] = field(default_factory=dict)
    """Plenio assets: id -> ``installed``, ``configured folder`` or ``not downloaded``."""
    models_root: str = ""
    """ComfyUI's (first) models folder, where the template model files go."""
    asset_root: str = ""
    """Where Plenio keeps its assets: ``<asset_root>/<kind>/<id>``."""
    asset_folders: Mapping[str, str] = field(default_factory=dict)
    """A configured folder per asset id (``[asset_paths]`` of the Plenio config), instead of the asset root."""
    llm: Mapping[str, Any] = field(default_factory=dict)
    """Local LLM: ``runtimes`` (names, best first), ``models`` (source -> count), ``files`` (GGUF files
    among them), ``notes``, ``writer`` (what the default writer takes here) and ``writer_blocked``."""
    checkpoints: Mapping[str, str] = field(default_factory=dict)
    """The YuE2 files of ``models/checkpoints``: file name -> what keeps it from loading (empty: nothing does)."""
    disk_free_bytes: int | None = None
    """Free space on the drive of ComfyUI's models folder (``None``: not measured)."""


@dataclass(frozen=True)
class Fix:
    """What a button can do about a finding."""

    label: str
    """The button's words: "Download 4.0 GB", "Copy the line for extra_model_paths.yaml"."""
    action: str
    """``download`` (payload ``variant``: a catalogue variant id), ``copy`` (``text``), ``open_url`` (``url``),
    ``choose_writer`` or ``refresh``."""
    payload: Mapping[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {"label": self.label, "action": self.action, "payload": dict(self.payload)}


@dataclass(frozen=True)
class Finding:
    """One thing the System Check found: what is the matter, in one sentence, and the fix if a button can do it."""

    id: str
    severity: Status
    text: str
    fix: Fix | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "severity": self.severity.value,
            "text": self.text,
            "fix": self.fix.to_dict() if self.fix else None,
        }


FINDINGS: Mapping[str, str] = {
    "comfyui.too_old": "ComfyUI is older than the oldest version Plenio supports",
    "gpu.none": "no graphics card was found",
    "package.missing": "a package ComfyUI installs itself is missing",
    "model.missing": "a model file a template needs is not installed (not a fault: Setup offers the download)",
    "model.incomplete": "a model file has another size than the catalogue's (an interrupted download?)",
    "model.misplaced": "a model file is in a folder ComfyUI does not search",
    "model.unloadable": "a YuE2 checkpoint will not load",
    "model.finetune": "a YuE2 checkpoint loads as a finetune",
    "asset.missing": "a Plenio asset (writer, lyrics recognition, stems) is not downloaded yet",
    "writer.blocked": "the templates' default writer cannot run as it is",
    "config.error": "Plenio's config.toml has an error; the defaults are used",
    "disk.low": "the models drive has less free space than the missing files need",
}
"""Every finding id with what it means. The ids are stable: Setup, the API and the troubleshooting guide use them."""
_PIP_NAMES = {"PIL": "pillow"}
COMFYUI_RELEASES = "https://github.com/Comfy-Org/ComfyUI/releases"
DISK_SPARE = 2 * GIB
"""Room beyond the files a download leaves on the drive (PD 4.1)."""


@dataclass(frozen=True)
class Rule:
    """One row of the hardware table (VRAM of the largest GPU, GiB as torch reports it): what auto takes there."""

    label: str
    low: float
    high: float | None
    yue2: str
    minimax: str
    cover_art: str
    basis: str
    writer: str = ""
    """The default writer's Gemma 4 12B file for this row (``plenio.core.llm.gemma``)."""

    def matches(self, vram_gib: float) -> bool:
        return vram_gib >= self.low and (self.high is None or vram_gib < self.high)


CARDS: tuple[tuple[str, float, float | None, float], ...] = (
    # label, low, high (GiB as torch reports them: a card sold as "16 GB" reports about 15.9), the size the row
    # shows - a typical card of the row, its low end where the row is wide
    ("below 8 GB", 0.0, 7.5, 6.0),
    ("8-12 GB", 7.5, 11.5, 7.9),
    ("12-16 GB", 11.5, 15.5, 11.9),
    ("16-24 GB", 15.5, 23.0, 15.9),
    ("24 GB and more", 23.0, None, 23.6),
)
"""The rows of the hardware table. What each row says is the model plan's pick for its card (``hardware_rows``)."""
_WHERE = ("runs on the card", "runs with offloading: slower", "too large for this card: very slow")


def _where(reason: str) -> str:
    found = [w for w in _WHERE if w in reason]
    return found[0] if found else reason


def _row_cell(picks: list[Any]) -> str:
    files = " + ".join(
        f"`{p.file.rsplit('.', 1)[0]}` ({size_text(p.variant.bytes)})" for p in picks if p.variant
    )
    worst = max((_where(p.reason) for p in picks), key=lambda w: _WHERE.index(w) if w in _WHERE else 0)
    return f"{files} - {worst}"


def hardware_rows(
    components: Mapping[str, Any], assets: Mapping[str, Asset] | None = None
) -> tuple[Rule, ...]:
    """The hardware table, made from the catalogue: per row the files ``auto`` takes on its card with nothing
    installed (``plenio.core.modelplan``), the writer's file, and whether the thresholds behind it are measured."""
    from .llm import gemma
    from .modelplan import pick

    def picks(*ids: str, vram: float) -> list[Any]:
        return [pick(components[i], vram_gib=vram, installed={}) for i in ids if i in components]

    rows = []
    for label, low, high, vram in CARDS:
        yue2 = picks("yue2", vram=vram)
        minimax = picks("minimax-dit", "minimax-text-encoder", vram=vram)
        cover = picks("flux2-klein", "flux2-text-encoder", vram=vram)
        writer = ""
        if assets is not None and gemma.wanted(vram) in assets:
            asset = assets[gemma.wanted(vram)]
            writer = f"`{gemma.file_of(asset)}` ({size_text(asset.total_size)})"
        if "writer-native" in components:
            native = gemma.native_pick(components["writer-native"], vram, {}, has_12b=True)
            writer += f"{'; ' if writer else ''}without llama.cpp: `{native.file.rsplit('.', 1)[0]}`"
        chosen = [p.variant for p in (*yue2, *minimax, *cover) if p.variant is not None]
        measured = bool(chosen) and all(v.basis.startswith("measured") for v in chosen)
        rows.append(
            Rule(
                label,
                low,
                high,
                _row_cell(yue2) if yue2 else "",
                _row_cell(minimax) if minimax else "",
                _row_cell(cover) if cover else "",
                "measured" if measured else "estimate (the catalogue's memory thresholds)",
                writer,
            )
        )
    return tuple(rows)


def parse_version(text: str) -> tuple[int, ...] | None:
    match = re.match(r"v?(\d+)\.(\d+)(?:\.(\d+))?", text.strip())
    if not match:
        return None
    return tuple(int(part or 0) for part in match.groups())


def _gib(value: int | None) -> str:
    return f"{value / GIB:.1f} GiB" if value is not None else "unknown"


def largest_gpu(devices: tuple[Device, ...]) -> Device | None:
    gpus = [d for d in devices if d.kind != "cpu" and d.total_bytes]
    return max(gpus, key=lambda d: d.total_bytes or 0) if gpus else None


def matching_rule(devices: tuple[Device, ...], rows: tuple[Rule, ...] = ()) -> Rule | None:
    gpu = largest_gpu(devices)
    if gpu is None:
        return None
    vram = (gpu.total_bytes or 0) / GIB
    return next((rule for rule in rows if rule.matches(vram)), None)


def _recommendations(devices: tuple[Device, ...], rows: tuple[Rule, ...] = ()) -> list[str]:
    gpu = largest_gpu(devices)
    if gpu is None:
        return [
            "No GPU detected: YuE2 and MiniMax Music 3 are not practical on the CPU. "
            "0 · System Check and 4 · Enhance & Master run on the CPU."
        ]
    vram = (gpu.total_bytes or 0) / GIB
    rule = matching_rule(devices, rows)
    rules = [f"Largest GPU: {gpu.name} with {vram:.1f} GiB."]
    if rule is not None:
        rules = [
            f"Largest GPU: {gpu.name} with {vram:.1f} GiB - row '{rule.label}' of the hardware table: the model "
            "fields on auto take these files (Model Choice decides on the card it runs on; a file you choose wins).",
            f"YuE2: {rule.yue2}.",
            f"MiniMax Music 3: {rule.minimax}.",
            f"Cover Art (optional): {rule.cover_art}.",
            f"Writer (Gemma 4 12B (auto), the templates' default): {rule.writer}.",
        ]
    if len([d for d in devices if d.kind != "cpu"]) > 1:
        rules.append(
            "Several GPUs: ComfyUI uses one device for native models (--cuda-device); "
            "Plenio workers can run on another one."
        )
    return rules


def _model_rows(catalogue: Mapping[str, ModelFile], inventory: Inventory) -> list[dict[str, Any]]:
    rows = []
    for model in catalogue.values():
        if not model.default:
            continue
        used = [f"{t}" for t in model.templates] + [f"{t} (optional)" for t in model.optional_templates]
        rows.append(
            {
                "file": model.file,
                "folder": model.folder,
                "size": size_text(model.bytes),
                "licence": model.licence,
                "status": inventory.status(model),
                "used_by": used,
                "url": model.url,
            }
        )
    return rows


def _asset_rows(assets: Mapping[str, Asset], facts: SystemFacts) -> list[dict[str, Any]]:
    root = facts.asset_root.rstrip("/\\") if facts.asset_root else "models/plenio"
    llm_folder = (facts.models_root.rstrip("/\\") or "models") + "/LLM"

    def folder(asset: Asset) -> str:
        # the writer's GGUF goes into ComfyUI's models/LLM, where every Local LLM list finds it
        return facts.asset_folders.get(asset.id) or (
            llm_folder if asset.kind == "llm" else f"{root}/{asset.kind}/{asset.id}"
        )

    return [
        {
            "asset": asset.id,
            "folder": folder(asset),
            "size": size_text(asset.total_size),
            "licence": asset.licence,
            "role": asset.role or asset.description,
            "status": facts.assets.get(asset.id, "unknown"),
            "source": f"https://huggingface.co/{asset.repo}/tree/{asset.revision}",
        }
        for asset in assets.values()
    ]


def _addon_line() -> str:
    """Whether this installation carries the Studio add-on (``plenio.core.features``), and what its absence
    means."""
    if all(features.summary().values()):
        return (
            "Studio add-on: installed - the player can start ComfyUI, a llama-server program runs GGUF files, "
            "folders open in the file manager."
        )
    return (
        "Studio add-on: not part of this installation (the Comfy Registry package, or PLENIO_ADDONS=0). Songs, "
        "the editor, the API and the player work as they are; three conveniences are left out - the player "
        "starting ComfyUI, starting a llama-server program for GGUF files, opening folders in the file manager. "
        "Plenio from GitHub (git clone or the release zip) has them."
    )


def _llm_lines(llm: Mapping[str, Any]) -> list[str]:
    """What the Local LLM node can use on this machine (nothing when the facts were not gathered)."""
    if not llm:
        return []
    counts = dict(llm.get("models", {}))
    found = ", ".join(f"{source}: {count}" for source, count in counts.items()) or "none"
    runtimes = list(llm.get("runtimes", []))
    lines = [f"Local LLM models: {found}."]
    if runtimes:
        lines.append(f"Local LLM runtime for GGUF files: {runtimes[0]}.")
    elif llm.get("files", 0) or not counts:
        lines.append(
            "Local LLM: no llama.cpp runtime for GGUF files - install llama.cpp (winget/brew) or "
            "llama-cpp-python, or set PLENIO_LLAMA_SERVER; models of running apps work without it."
            if features.has("llm_server")
            else "Local LLM: no runtime for GGUF files - `pip install llama-cpp-python` into ComfyUI's Python; "
            "models of running apps (LM Studio, Ollama, a llama-server you started) work without it. This "
            "installation starts no llama-server program itself."
        )
    lines.extend(f"Local LLM note: {note}" for note in llm.get("notes", []))
    if llm.get("writer"):
        lines.append(f"Default writer (Gemma 4 12B (auto)) on this machine - {llm['writer']}.")
    return lines


def _file_findings(
    facts: SystemFacts,
    catalogue: Mapping[str, ModelFile] | None,
    assets: Mapping[str, Asset] | None,
    components: Mapping[str, Any] | None,
) -> list[Finding]:
    """The files the templates need and do not have (each with its download), files of the wrong size, the assets
    not fetched yet, and whether the models drive has room for them."""
    from .modelplan import pick

    found: list[Finding] = []
    gpu = largest_gpu(facts.devices)
    vram = (gpu.total_bytes or 0) / GIB if gpu is not None and gpu.total_bytes else None
    needed = 0
    for component in (components or {}).values():
        if not component.templates:
            continue
        chosen = pick(component, vram_gib=vram, installed=facts.models)
        if chosen.installed or chosen.variant is None:
            continue
        needed += chosen.variant.bytes
        size = size_text(chosen.variant.bytes)
        found.append(
            Finding(
                "model.missing",
                Status.OK,
                f"{component.title}: {chosen.file} is not installed ({size}); "
                f"{', '.join(component.templates)} need{'s' if len(component.templates) == 1 else ''} it.",
                Fix(f"Download {size}", "download", {"variant": chosen.variant.id}),
            )
        )
    for model in (catalogue or {}).values():
        on_disk = facts.models.get(model.file)
        if on_disk is not None and model.bytes and on_disk != model.bytes:
            found.append(
                Finding(
                    "model.incomplete",
                    Status.OK,  # the Templates table shows it, as in 1.x; Setup offers the download
                    f"Model file '{model.file}' has {size_text(on_disk)}, the catalogue says {size_text(model.bytes)} "
                    "(an interrupted download?).",
                    Fix(f"Download it again ({size_text(model.bytes)})", "download", {"variant": model.id}),
                )
            )
    for asset_id, state in sorted(facts.assets.items()):
        if state.startswith("not downloaded") and assets is not None and asset_id in assets:
            found.append(
                Finding(
                    "asset.missing",
                    Status.OK,
                    f"Plenio asset '{asset_id}' is not downloaded yet ({size_text(assets[asset_id].total_size)}); "
                    "Plenio fetches it the first time a node needs it.",
                )
            )
    if facts.disk_free_bytes is not None and facts.disk_free_bytes < needed + DISK_SPARE:
        found.append(
            Finding(
                "disk.low",
                Status.WARNING,
                f"{size_text(needed + DISK_SPARE)} needed for the missing model files and room to spare, "
                f"{size_text(facts.disk_free_bytes)} free on the drive of {facts.models_root or 'the models folder'}.",
            )
        )
    return found


def check_system(
    facts: SystemFacts,
    catalogue: Mapping[str, ModelFile] | None = None,
    assets: Mapping[str, Asset] | None = None,
    components: Mapping[str, Any] | None = None,
) -> Report:
    rows = hardware_rows(components, assets) if components else ()
    found: list[Finding] = []
    messages: list[str] = []

    def finding(item: Finding) -> None:
        found.append(item)
        messages.append(item.text)

    comfy = parse_version(facts.comfyui_version)
    minimum = ".".join(map(str, MIN_COMFYUI))
    if comfy is None or comfy < MIN_COMFYUI:
        finding(
            Finding(
                "comfyui.too_old",
                Status.WARNING,
                f"ComfyUI {facts.comfyui_version} is older than the supported {minimum}; update ComfyUI.",
                Fix("Open ComfyUI's releases", "open_url", {"url": COMFYUI_RELEASES}),
            )
        )
    else:
        messages.append(
            f"ComfyUI {facts.comfyui_version} (supported: >= {minimum}), frontend {facts.frontend_version}."
        )
    messages.append(
        f"Plenio {facts.plenio_version}, Python {facts.python_version}, torch {facts.torch_version}, {facts.platform}."
    )
    messages.append(f"Active device for native models: {facts.active_device}.")
    for device in facts.devices:
        messages.append(
            f"Device {device.index}: {device.name} ({device.kind}), VRAM {_gib(device.total_bytes)} total, "
            f"{_gib(device.free_bytes)} free."
        )
    if not [d for d in facts.devices if d.kind != "cpu"]:
        found.append(
            Finding(
                "gpu.none",
                Status.WARNING,
                "No graphics card was found: YuE2 and MiniMax Music 3 are not practical on the CPU.",
            )
        )
    messages.append(f"System RAM: {_gib(facts.ram_total_bytes)}.")
    for module, version in sorted(facts.packages.items()):
        if version is None:
            if module in ESSENTIAL_PACKAGES:
                command = f"python -m pip install {_PIP_NAMES.get(module, module)}"
                finding(
                    Finding(
                        "package.missing",
                        Status.WARNING,
                        f"Package '{module}' is not installed (ComfyUI normally installs it).",
                        Fix("Copy the install command", "copy", {"text": command}),
                    )
                )
            else:
                messages.append(f"Optional package '{module}' is not installed.")
        else:
            messages.append(f"Package '{module}' {version}.")
    for file, path in sorted(facts.misplaced.items()):
        folder = Path(path).parent
        finding(
            Finding(
                "model.misplaced",
                Status.WARNING,
                f"Model file '{file}' is in {folder}, but ComfyUI does not search that folder: list it in "
                f"extra_model_paths.yaml as '{folder.name}: ...' beside your other model folders there, or move the "
                f"file into ComfyUI's models/{folder.name}; then restart ComfyUI.",
                Fix(
                    "Copy the line for extra_model_paths.yaml",
                    "copy",
                    {"text": f"{folder.name}: {folder.as_posix()}"},
                ),
            )
        )
    for asset, state in sorted(facts.assets.items()):
        messages.append(f"Plenio asset '{asset}': {state}.")
    for file, problem in sorted(facts.checkpoints.items()):
        if problem:
            finding(
                Finding(
                    "model.unloadable", Status.WARNING, f"YuE2 checkpoint '{file}' will not load: {problem}."
                )
            )
        elif catalogue is None or file not in {model.file for model in catalogue.values()}:
            finding(
                Finding(
                    "model.finetune",
                    Status.OK,
                    f"YuE2 checkpoint '{file}': loads as a finetune - choose it under *checkpoint* in the model block.",
                )
            )
    messages.append(_addon_line())
    messages.extend(_llm_lines(facts.llm))
    if facts.llm.get("writer_blocked"):
        found.append(
            Finding(
                "writer.blocked",
                Status.WARNING,
                "The templates' default writer (Gemma 4 12B (auto)) cannot run as it is"
                + (f" - {facts.llm['writer']}" if facts.llm.get("writer") else "")
                + ".",
                Fix("Choose another writer", "choose_writer"),
            )
        )
    config = dict(facts.config)
    if config.get("error"):
        finding(
            Finding(
                "config.error",
                Status.WARNING,
                f"Plenio configuration error (defaults are used until it is fixed): {config['error']}",
            )
        )
    found.extend(_file_findings(facts, catalogue, assets, components))
    messages.append(
        f"Offline mode: {'on' if config.get('offline') else 'off'}; "
        f"automatic asset downloads: {'on' if config.get('auto_download', True) else 'off'}."
    )
    data: dict[str, Any] = {
        "facts": {
            "plenio": facts.plenio_version,
            "comfyui": facts.comfyui_version,
            "frontend": facts.frontend_version,
            "python": facts.python_version,
            "platform": facts.platform,
            "torch": facts.torch_version,
            "active_device": facts.active_device,
            "devices": [vars(d) for d in facts.devices],
            "ram_total_bytes": facts.ram_total_bytes,
            "packages": dict(facts.packages),
            "config": config,
            "models": dict(facts.models),
            "checkpoints": dict(facts.checkpoints),
            "misplaced": dict(facts.misplaced),
            "assets": dict(facts.assets),
            "llm": dict(facts.llm),
            "disk_free_bytes": facts.disk_free_bytes,
            "models_root": facts.models_root,
        },
        "recommendations": _recommendations(facts.devices, rows),
        "rules": [
            {
                "vram": rule.label,
                "yue2": rule.yue2,
                "minimax": rule.minimax,
                "cover_art": rule.cover_art,
                "writer": rule.writer,
                "basis": rule.basis,
                "this_machine": rule is matching_rule(facts.devices, rows),
            }
            for rule in rows
        ],
    }
    if catalogue is not None:
        inventory = Inventory(facts.models)
        names = [*template_names(catalogue)]
        data["templates"] = [
            {
                "template": item.template,
                "ready": item.ready,
                "missing": [m.file for m in item.missing],
                "missing_size": size_text(item.missing_bytes) if item.missing else "",
                "optional_missing": [m.file for m in item.optional_missing],
                "incomplete": [m.file for m in item.incomplete],
            }
            for item in readiness(catalogue, inventory, names)
        ] + [
            {
                "template": name,
                "ready": True,
                "missing": [],
                "missing_size": "",
                "optional_missing": [],
                "incomplete": [],
            }
            # the CPU templates load no model - unless the catalogue knows them already (4 · Enhance &
            # Master lists the models of its optional Stems and Refine blocks)
            for name in CPU_TEMPLATES
            if name not in names
        ]
        data["templates"].sort(key=lambda row: row["template"])
        data["models"] = _model_rows(catalogue, inventory)
        data["models_root"] = facts.models_root
    if assets is not None:
        data["assets"] = _asset_rows(assets, facts)
    data["findings"] = [item.to_dict() for item in found]
    status = worst([item.severity for item in found])
    summary = "System looks usable for Plenio." if status is Status.OK else "System check found warnings."
    return Report(kind="system_check", status=status, summary=summary, messages=tuple(messages), data=data)


def _cell(text: str) -> str:
    return text.replace("|", "\\|")


def _finding_line(item: Mapping[str, Any]) -> str:
    line = f"- **{item['severity'].capitalize()}** `{item['id']}` - {item['text']}"
    fix = item.get("fix")
    if fix:
        detail = fix["payload"].get("text") or fix["payload"].get("url")
        line += f" Fix: *{fix['label']}*" + (f": `{detail}`" if detail else " (in Plenio Setup)")
    return line


def to_markdown(report: Report) -> str:
    """The node's report: what needs attention first (the findings of warning and error, with their ids and fixes),
    then the details."""
    findings = [f for f in report.data.get("findings", []) if f["severity"] in (Status.WARNING, Status.ERROR)]
    shown = {f["text"] for f in findings}
    head, *_ = report.to_markdown().splitlines()
    lines = ["## Plenio System Check", "", head]
    if findings:
        lines += ["", "### Findings", ""]
        lines.extend(_finding_line(item) for item in findings)
        lines += ["", "### Details", ""]
    lines.extend(f"- {message}" for message in report.messages if message not in shown)
    templates = report.data.get("templates")
    if templates:
        lines += ["", "### Templates", "", "| Template | Model files |", "|---|---|"]
        for row in templates:
            parts = []
            if row["missing"]:
                parts.append(
                    f"{len(row['missing'])} missing ({row['missing_size']}): "
                    + ", ".join(f"`{name}`" for name in row["missing"])
                )
            if row["incomplete"]:
                parts.append(
                    f"{len(row['incomplete'])} with an unexpected size (an interrupted download?): "
                    + ", ".join(f"`{name}`" for name in row["incomplete"])
                )
            state = "; ".join(parts) if parts else "all installed"
            if row["optional_missing"]:
                state += f"; optional blocks: {len(row['optional_missing'])} not installed"
            lines.append(f"| {row['template']} | {_cell(state)} |")
        lines += [
            "",
            "Missing files: open the template - ComfyUI offers the downloads - or place them into the folders "
            "below (see the model guide).",
        ]
    models = report.data.get("models")
    if models:
        root = report.data.get("models_root") or "ComfyUI/models"
        lines += [
            "",
            "### Model files",
            "",
            f"Into the folder named below inside ComfyUI's models folder (`{root}`), or the same folder of an "
            "`extra_model_paths.yaml` location.",
            "",
            "| File | Folder | Size | Licence | Used by | Status |",
            "|---|---|---|---|---|---|",
        ]
        for row in models:
            used = ", ".join(row.get("used_by", [])) or "-"
            name = f"[`{row['file']}`]({row['url']})" if row.get("url") else f"`{row['file']}`"
            lines.append(
                f"| {name} | `models/{row['folder']}` | {row['size']} | {_cell(row['licence'])} | {_cell(used)} | "
                f"{row['status']} |"
            )
    plenio_assets = report.data.get("assets")
    if plenio_assets:
        lines += [
            "",
            "### Plenio assets",
            "",
            "Plenio fetches a missing asset itself the first time a node needs it (automatic asset downloads on); "
            "offline, place its files into the folder shown (from the source link).",
            "",
            "| Asset | Folder | Size | Licence | Used for | Status |",
            "|---|---|---|---|---|---|",
        ]
        for row in plenio_assets:
            lines.append(
                f"| [`{row['asset']}`]({row['source']}) | `{row['folder']}` | {row['size']} | {_cell(row['licence'])} | "
                f"{_cell(row['role'])} | {row['status']} |"
            )
    lines += [
        "",
        "### Hardware table",
        "",
        "What the model fields on auto take on each card, with nothing installed (the model plan; an installed file "
        "that runs is kept).",
        "",
        "| VRAM | YuE2 | MiniMax Music 3 | Cover Art | Writer (default) | Basis |",
        "|---|---|---|---|---|---|",
    ]
    for rule in report.data.get("rules", []):
        marker = "**this machine** - " if rule["this_machine"] else ""
        lines.append(
            f"| {marker}{rule['vram']} | {_cell(rule['yue2'])} | {_cell(rule['minimax'])} | "
            f"{_cell(rule['cover_art'])} | {_cell(rule.get('writer', ''))} | {_cell(rule['basis'])} |"
        )
    lines += ["", "### Recommendations"]
    lines.extend(f"- {rule}" for rule in report.data.get("recommendations", []))
    return "\n".join(lines)
