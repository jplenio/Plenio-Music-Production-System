"""Architecture rules that can be checked statically.

* ``plenio.core`` imports nothing from ComfyUI, torch or aiohttp (R10).
* Inside ``plenio`` only relative imports refer to Plenio itself, because
  ComfyUI imports the package under a path-derived module name.
* Only ``plenio.comfy.host`` touches ComfyUI internals beyond ``comfy_api``.
* No legacy node IDs or local absolute paths appear in shipped files.
* The vendored upstream file is unchanged.
"""

from __future__ import annotations

import ast
import hashlib
import json
import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
PLENIO = ROOT / "plenio"
FORBIDDEN_IN_CORE = {
    "comfy",
    "comfy_api",
    "comfy_execution",
    "comfy_extras",
    "folder_paths",
    "nodes",
    "server",
    "execution",
    "torch",
    "torchaudio",
    "aiohttp",
    "comfyui_version",
}
COMFY_INTERNALS = {
    "comfy",
    "comfy_execution",
    "comfy_extras",
    "folder_paths",
    "nodes",
    "server",
    "execution",
    "comfyui_version",
}


def python_files(folder: Path) -> list[Path]:
    return [p for p in folder.rglob("*.py") if "third_party" not in p.parts and "__pycache__" not in p.parts]


def imported_roots(path: Path) -> set[str]:
    roots = set()
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        if isinstance(node, ast.Import):
            roots.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            roots.add(node.module.split(".")[0])
    return roots


@pytest.mark.parametrize("path", python_files(PLENIO / "core"), ids=lambda p: str(p.relative_to(ROOT)))
def test_core_is_pure(path: Path) -> None:
    assert not imported_roots(path) & FORBIDDEN_IN_CORE


@pytest.mark.parametrize("path", python_files(PLENIO), ids=lambda p: str(p.relative_to(ROOT)))
def test_plenio_uses_relative_self_imports(path: Path) -> None:
    assert "plenio" not in imported_roots(path)


@pytest.mark.parametrize("path", python_files(PLENIO / "comfy"), ids=lambda p: str(p.relative_to(ROOT)))
def test_only_host_touches_comfy_internals(path: Path) -> None:
    if path.name == "host.py":
        return
    assert not imported_roots(path) & COMFY_INTERNALS


SHIPPED = ["plenio", "web", "subgraphs", "example_workflows", "resources", "locales", "frontend/src"]
TEXT_SUFFIXES = {".py", ".json", ".toml", ".md", ".ts", ".js", ".vue", ".txt", ".css"}


def shipped_files() -> list[Path]:
    files = []
    for folder in SHIPPED:
        base = ROOT / folder
        if base.exists():
            files.extend(
                p
                for p in base.rglob("*")
                if p.is_file()
                and p.suffix in TEXT_SUFFIXES
                and "third_party" not in p.parts
                and "__pycache__" not in p.parts
            )
    return files


def legacy_ids() -> set[str]:
    inventory = json.loads(
        (ROOT / "docs" / "design" / "data" / "legacy-node-inventory.json").read_text(encoding="utf-8")
    )
    return {entry["id"] for entry in inventory}


def test_no_legacy_ids_or_local_paths_in_shipped_files() -> None:
    ids = legacy_ids()
    assert len(ids) >= 50
    id_pattern = re.compile(r"\b(" + "|".join(sorted(map(re.escape, ids), key=len, reverse=True)) + r")\b")
    path_pattern = re.compile(
        r"(?i)\b[A-Z]:[\\/](?:Users|Daten|ComfyUI)|/home/\w+/|ComfyUI-MiniMax-Music-Production-Toolkit"
    )
    offenders = []
    for path in shipped_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for pattern in (id_pattern, path_pattern):
            match = pattern.search(text)
            if match:
                offenders.append(f"{path.relative_to(ROOT)}: {match.group(0)}")
    assert offenders == []


def test_vendored_abc_tools_is_unchanged() -> None:
    digest = hashlib.sha256((PLENIO / "third_party" / "yue2_abc_tools.py").read_bytes()).hexdigest()
    assert digest == "ea04b922dacebec7ad257a2f8d83bdb5dfecb7a23110c1a3121c5c41c313930e"
