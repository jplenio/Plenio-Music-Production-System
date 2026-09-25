"""System Check: diagnostics and transparent recommendations.

The adapter collects facts from ComfyUI and torch; this module turns them into
a report. Recommendations are text only - nothing is switched automatically.
"""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

from .reports import Report, Status, worst

MIN_COMFYUI = (0, 37, 0)
GIB = 1024**3


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


def parse_version(text: str) -> tuple[int, ...] | None:
    match = re.match(r"v?(\d+)\.(\d+)(?:\.(\d+))?", text.strip())
    if not match:
        return None
    return tuple(int(part or 0) for part in match.groups())


def _gib(value: int | None) -> str:
    return f"{value / GIB:.1f} GiB" if value is not None else "unknown"


def _recommendations(devices: tuple[Device, ...]) -> list[str]:
    gpus = [d for d in devices if d.kind != "cpu" and d.total_bytes]
    if not gpus:
        return ["No GPU detected: YuE2 and MiniMax Music 3 are not practical on the CPU."]
    largest = max(gpus, key=lambda d: d.total_bytes or 0)
    vram = (largest.total_bytes or 0) / GIB
    rules = [
        f"Largest GPU: {largest.name} with {vram:.1f} GiB (rule table below, nothing is applied automatically)."
    ]
    if vram >= 23:
        rules.append(
            "YuE2: the bf16 checkpoint is possible (>= 24 GB); int8_convrot stays the faster default."
        )
    elif vram >= 11:
        rules.append("YuE2: use yue2_3b_int8_convrot (default of the Plenio templates).")
    else:
        rules.append("YuE2: less than 12 GB VRAM - expect heavy offloading; keep songs short.")
    if len(gpus) > 1:
        rules.append(
            "Several GPUs: ComfyUI uses one device for native models (--cuda-device); "
            "Plenio workers can run on another one."
        )
    return rules


def check_system(facts: SystemFacts) -> Report:
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
            statuses.append(Status.WARNING)
            messages.append(f"Optional package '{module}' is not installed.")
        else:
            messages.append(f"Package '{module}' {version}.")
    config = dict(facts.config)
    messages.append(
        f"Offline mode: {'on' if config.get('offline') else 'off'}; "
        f"automatic asset downloads: {'on' if config.get('auto_download', True) else 'off'}."
    )
    recommendations = _recommendations(facts.devices)
    status = worst(statuses)
    summary = "System looks usable for Plenio." if status is Status.OK else "System check found warnings."
    return Report(
        kind="system_check",
        status=status,
        summary=summary,
        messages=tuple(messages),
        data={
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
            },
            "recommendations": recommendations,
        },
    )


def to_markdown(report: Report) -> str:
    lines = ["## Plenio System Check", "", report.to_markdown(), "", "### Recommendations"]
    lines.extend(f"- {rule}" for rule in report.data.get("recommendations", []))
    return "\n".join(lines)
