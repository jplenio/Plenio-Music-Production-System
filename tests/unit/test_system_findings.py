"""Findings with fixes (phase 4.1): one test per finding id, and the ids are documented."""

import re
from pathlib import Path
from typing import Any

import pytest

from plenio.core.assets import load_catalogue as load_assets
from plenio.core.models import load_catalogue as load_models
from plenio.core.models import load_components
from plenio.core.reports import Status
from plenio.core.system import FINDINGS, GIB, Device, SystemFacts, check_system, to_markdown

ROOT = Path(__file__).resolve().parents[2]
RESOURCES = ROOT / "resources"
COMPONENTS = load_components(RESOURCES / "models.toml")
CATALOGUE = load_models(RESOURCES / "models.toml")
ASSETS = load_assets(RESOURCES / "assets.toml")
EVERY_DEFAULT = {model.file: model.bytes for model in CATALOGUE.values()}
"""Every catalogue file installed at its size: no ``model.missing``."""


def facts(**overrides: Any) -> SystemFacts:
    values: dict[str, Any] = dict(
        plenio_version="2.0.0",
        comfyui_version="0.41.0",
        frontend_version="1.58.5",
        python_version="3.12.9",
        platform="Windows 11",
        torch_version="2.9.1",
        active_device="cuda:0",
        devices=(Device(0, "Example GPU", "cuda", 16 * GIB, 15 * GIB),),
        ram_total_bytes=64 * GIB,
        packages={"av": "18.1.0"},
        config={"offline": False, "auto_download": True},
        models=EVERY_DEFAULT,
        disk_free_bytes=500 * GIB,
    )
    values.update(overrides)
    return SystemFacts(**values)


def found(report: Any, finding_id: str) -> list[dict[str, Any]]:
    return [item for item in report.data["findings"] if item["id"] == finding_id]


def check(**overrides: Any) -> Any:
    return check_system(facts(**overrides), CATALOGUE, ASSETS, COMPONENTS)


def test_a_healthy_machine_has_no_findings() -> None:
    report = check()
    assert report.status is Status.OK
    assert report.data["findings"] == []
    assert "### Findings" not in to_markdown(report)


def test_comfyui_too_old() -> None:
    report = check(comfyui_version="0.30.0")
    (item,) = found(report, "comfyui.too_old")
    assert item["severity"] == "warning" and "older than the supported" in item["text"]
    assert item["fix"]["action"] == "open_url" and item["fix"]["payload"]["url"].startswith(
        "https://github.com/"
    )
    assert report.status is Status.WARNING


def test_gpu_none() -> None:
    report = check(devices=(Device(0, "CPU", "cpu"),))
    (item,) = found(report, "gpu.none")
    assert item["severity"] == "warning" and item["fix"] is None


def test_package_missing_offers_the_pip_name() -> None:
    report = check(packages={"PIL": None, "faster_whisper": None})
    (item,) = found(report, "package.missing")  # an optional package is no finding
    assert item["fix"] == {
        "label": "Copy the install command",
        "action": "copy",
        "payload": {"text": "python -m pip install pillow"},
    }


def test_model_missing_names_the_plans_file_and_its_download() -> None:
    installed = dict(EVERY_DEFAULT)
    for model in CATALOGUE.values():
        if model.component == "minimax-dit":
            installed.pop(model.file)
    report = check(models=installed)
    (item,) = found(report, "model.missing")
    assert item["severity"] == "ok" and "3 · MiniMax · Song needs it" in item["text"]
    variant = COMPONENTS["minimax-dit"].variants
    assert item["fix"]["action"] == "download" and item["fix"]["payload"]["variant"] in {
        v.id for v in variant
    }
    assert item["fix"]["label"].startswith("Download ")
    assert report.status is Status.OK  # not having a template's files is no fault


def test_model_incomplete() -> None:
    model = next(m for m in CATALOGUE.values() if m.component == "minimax-vae" and m.default)
    report = check(models={**EVERY_DEFAULT, model.file: model.bytes // 2})
    (item,) = found(report, "model.incomplete")
    assert item["fix"]["payload"] == {"variant": model.id} and "interrupted download" in item["text"]
    assert report.status is Status.OK  # as in 1.x: the Templates table shows it


def test_model_misplaced_copies_the_yaml_line() -> None:
    path = str(Path("D:/AI/models/audio_encoders/example.safetensors"))
    report = check(misplaced={"example.safetensors": path})
    (item,) = found(report, "model.misplaced")
    assert item["fix"]["payload"]["text"] == "audio_encoders: D:/AI/models/audio_encoders"
    assert item["text"] in report.messages  # the node's text says the same as before


def test_model_unloadable_and_finetune() -> None:
    report = check(
        checkpoints={"broken.safetensors": "the file is not a YuE2 checkpoint", "mine.safetensors": ""}
    )
    (bad,) = found(report, "model.unloadable")
    (tune,) = found(report, "model.finetune")
    assert bad["severity"] == "warning" and "will not load" in bad["text"]
    assert tune["severity"] == "ok" and "finetune" in tune["text"]


def test_asset_missing() -> None:
    asset = next(iter(ASSETS))
    report = check(assets={asset: "not downloaded (fetched on first use, 3.1 GB)"})
    (item,) = found(report, "asset.missing")
    assert asset in item["text"] and item["severity"] == "ok"


def test_writer_blocked_offers_another_writer() -> None:
    report = check(llm={"writer": "no Gemma 4 12B here", "writer_blocked": True})
    (item,) = found(report, "writer.blocked")
    assert item["fix"]["action"] == "choose_writer" and "no Gemma 4 12B here" in item["text"]


def test_config_error() -> None:
    report = check(
        config={"offline": False, "auto_download": True, "error": "config.toml: unknown settings ['x']"}
    )
    (item,) = found(report, "config.error")
    assert "unknown settings" in item["text"]


def test_disk_low_counts_the_missing_files() -> None:
    installed = {f: s for f, s in EVERY_DEFAULT.items() if "minimax" not in f}
    report = check(models=installed, disk_free_bytes=3 * GIB)
    (item,) = found(report, "disk.low")
    assert item["severity"] == "warning" and "free on the drive" in item["text"]
    assert not found(check(disk_free_bytes=3 * GIB), "disk.low")  # nothing to fetch: 2 GB spare suffice
    assert not found(check(models=installed, disk_free_bytes=None), "disk.low")  # not measured


def test_the_markdown_puts_findings_first_with_ids_and_fixes_once() -> None:
    path = str(Path("D:/AI/models/audio_encoders/example.safetensors"))
    markdown = to_markdown(check(comfyui_version="0.30.0", misplaced={"example.safetensors": path}))
    findings, details = markdown.split("### Details")
    assert "### Findings" in findings and "`comfyui.too_old`" in findings and "`model.misplaced`" in findings
    assert (
        "Fix: *Copy the line for extra_model_paths.yaml*: `audio_encoders: D:/AI/models/audio_encoders`"
        in findings
    )
    assert "older than the supported" not in details  # said once


@pytest.mark.parametrize("finding_id", sorted(FINDINGS))
def test_every_id_is_in_the_troubleshooting_guide(finding_id: str) -> None:
    guide = (ROOT / "docs" / "user" / "troubleshooting.md").read_text(encoding="utf-8")
    assert f"`{finding_id}`" in guide


def test_every_id_the_check_makes_is_known() -> None:
    source = (ROOT / "plenio" / "core" / "system.py").read_text(encoding="utf-8")
    made = set(re.findall(r'Finding\(\s*"([a-z0-9_.]+)"', source))
    assert made == set(FINDINGS)
