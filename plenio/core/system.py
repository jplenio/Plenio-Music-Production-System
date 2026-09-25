"""System Check: diagnostics and transparent recommendations.

The adapter collects facts from ComfyUI and torch; this module turns them into
a report. Recommendations are text only - nothing is switched automatically.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

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
    assets: Mapping[str, str] = field(default_factory=dict)
    """Plenio assets: id -> ``installed``, ``configured folder`` or ``not downloaded``."""


@dataclass(frozen=True)
class Rule:
    """One row of the hardware rule table (VRAM of the largest GPU, GiB as torch reports it)."""

    label: str
    low: float
    high: float | None
    yue2: str
    minimax: str
    cover_art: str
    basis: str

    def matches(self, vram_gib: float) -> bool:
        return vram_gib >= self.low and (self.high is None or vram_gib < self.high)


# A card sold as "16 GB" reports about 15.9 GiB, hence the boundaries just below the nominal sizes.
RULES = (
    Rule(
        "below 8 GB",
        0.0,
        7.5,
        "only with heavy offloading (the int8 model alone is 4 GB): very slow, keep songs short",
        "only with heavy offloading: very slow",
        "not practical",
        "estimate from the model sizes",
    ),
    Rule(
        "8-12 GB",
        7.5,
        11.5,
        "int8 checkpoint (template default); keep songs short",
        "choose the int8 DiT `minimax_music3_dit_int8_convrot` (2.5 GB) and turn on *tiled decode*",
        "choose `flux-2-klein-4b-fp8` and the text encoder `qwen_3_4b_fp4_flux2`",
        "legacy toolkit ratings (not measured by Plenio)",
    ),
    Rule(
        "12-16 GB",
        11.5,
        15.5,
        "int8 checkpoint (template default)",
        "the defaults may offload; the int8 DiT is the safer choice",
        "fp8 model and fp4 text encoder",
        "legacy toolkit ratings (not measured by Plenio)",
    ),
    Rule(
        "16-24 GB",
        15.5,
        23.0,
        "int8 checkpoint (template default) with the Gemma 4 E4B writer",
        "template defaults (fp16 DiT, int8 text encoder)",
        "template defaults (bf16)",
        "YuE2 measured on 16 GB (Phases 3-5); MiniMax and Cover Art: legacy toolkit ratings",
    ),
    Rule(
        "24 GB and more",
        23.0,
        None,
        "the bf16 checkpoint `yue2_3b_bf16` (7.8 GB) is possible; int8 stays the faster default",
        "template defaults",
        "template defaults",
        "Plenio design",
    ),
)


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


def matching_rule(devices: tuple[Device, ...]) -> Rule | None:
    gpu = largest_gpu(devices)
    if gpu is None:
        return None
    vram = (gpu.total_bytes or 0) / GIB
    return next(rule for rule in RULES if rule.matches(vram))


def _recommendations(devices: tuple[Device, ...]) -> list[str]:
    gpu = largest_gpu(devices)
    if gpu is None:
        return [
            "No GPU detected: YuE2 and MiniMax Music 3 are not practical on the CPU. "
            "0 · System Check and 4 · Enhance & Master run on the CPU."
        ]
    rule = matching_rule(devices)
    assert rule is not None
    vram = (gpu.total_bytes or 0) / GIB
    rules = [
        f"Largest GPU: {gpu.name} with {vram:.1f} GiB - row '{rule.label}' of the rule table "
        "(nothing is applied automatically; choose files in the loader nodes).",
        f"YuE2: {rule.yue2}.",
        f"MiniMax Music 3: {rule.minimax}.",
        f"Cover Art (optional): {rule.cover_art}.",
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


def check_system(facts: SystemFacts, catalogue: Mapping[str, ModelFile] | None = None) -> Report:
    statuses: list[Status] = []
    messages: list[str] = []
    comfy = parse_version(facts.comfyui_version)
    minimum = ".".join(map(str, MIN_COMFYUI))
    if comfy is None or comfy < MIN_COMFYUI:
        statuses.append(Status.WARNING)
        messages.append(
            f"ComfyUI {facts.comfyui_version} is older than the supported {minimum}; update ComfyUI."
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
        statuses.append(Status.WARNING)
    messages.append(f"System RAM: {_gib(facts.ram_total_bytes)}.")
    for module, version in sorted(facts.packages.items()):
        if version is None:
            if module in ESSENTIAL_PACKAGES:
                statuses.append(Status.WARNING)
                messages.append(f"Package '{module}' is not installed (ComfyUI normally installs it).")
            else:
                messages.append(f"Optional package '{module}' is not installed.")
        else:
            messages.append(f"Package '{module}' {version}.")
    for asset, state in sorted(facts.assets.items()):
        messages.append(f"Plenio asset '{asset}': {state}.")
    config = dict(facts.config)
    if config.get("error"):
        statuses.append(Status.WARNING)
        messages.append(
            f"Plenio configuration error (defaults are used until it is fixed): {config['error']}"
        )
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
            "assets": dict(facts.assets),
        },
        "recommendations": _recommendations(facts.devices),
        "rules": [
            {
                "vram": rule.label,
                "yue2": rule.yue2,
                "minimax": rule.minimax,
                "cover_art": rule.cover_art,
                "basis": rule.basis,
                "this_machine": rule is matching_rule(facts.devices),
            }
            for rule in RULES
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
            for name in CPU_TEMPLATES
        ]
        data["templates"].sort(key=lambda row: row["template"])
        data["models"] = _model_rows(catalogue, inventory)
    status = worst(statuses)
    summary = "System looks usable for Plenio." if status is Status.OK else "System check found warnings."
    return Report(kind="system_check", status=status, summary=summary, messages=tuple(messages), data=data)


def _cell(text: str) -> str:
    return text.replace("|", "\\|")


def to_markdown(report: Report) -> str:
    lines = ["## Plenio System Check", "", report.to_markdown()]
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
        lines += [
            "",
            "### Model files",
            "",
            "| File | Folder | Size | Licence | Status |",
            "|---|---|---|---|---|",
        ]
        for row in models:
            lines.append(
                f"| `{row['file']}` | {row['folder']} | {row['size']} | {_cell(row['licence'])} | {row['status']} |"
            )
    lines += [
        "",
        "### Hardware rule table",
        "",
        "| VRAM | YuE2 | MiniMax Music 3 | Cover Art | Basis |",
        "|---|---|---|---|---|",
    ]
    for rule in report.data.get("rules", []):
        marker = "**this machine** - " if rule["this_machine"] else ""
        lines.append(
            f"| {marker}{rule['vram']} | {_cell(rule['yue2'])} | {_cell(rule['minimax'])} | "
            f"{_cell(rule['cover_art'])} | {_cell(rule['basis'])} |"
        )
    lines += ["", "### Recommendations"]
    lines.extend(f"- {rule}" for rule in report.data.get("recommendations", []))
    return "\n".join(lines)
