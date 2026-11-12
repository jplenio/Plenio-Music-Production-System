"""Facts the documentation states, computed from the code (PD 10.3): numbers and tables cannot drift.

``docs/facts.json`` holds every fact. Markdown names a fact between markers, which ``--write`` fills and ``--check``
(in the CI) verifies::

    Plenio adds <!--fact:nodes-->39<!--/fact--> nodes where ComfyUI has nothing equivalent.

    <!--facts:hardware-table-->
    | GPU memory | YuE2 | ... |
    <!--/facts-->

A number edited by hand inside a marker fails ``--check``. Standard library and Plenio's core only (no ComfyUI).

    python tools/facts.py --write     # docs/facts.json and every marker
    python tools/facts.py --check     # exit 1 when a file is not as --write would make it
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from collections.abc import Callable, Mapping
from pathlib import Path
from typing import Any

import tomllib

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

FACTS = PROJECT / "docs" / "facts.json"
FILES = (
    "README.md",
    "SECURITY.md",
    "docs/user/models.md",
    "docs/user/configuration.md",
    "docs/user/getting-started.md",
    "docs/user/from-1x-to-2.md",
    "docs/dev/release.md",
    "docs/dev/testing.md",
)
"""The Markdown files that carry markers (a file without one is left as it is)."""

COMFYUI_TESTED = ("0.41.0", "0.44.2")
"""The ComfyUI tags the CI's host tier runs on (``.github/workflows/ci.yml``); the first is the minimum
(``plenio.core.system.MIN_COMFYUI``, which a test holds to it)."""

FACT = re.compile(r"<!--fact:([\w.-]+)-->(.*?)<!--/fact-->", re.S)
BLOCK = re.compile(r"(<!--facts:([\w-]+)-->\n)(.*?)(<!--/facts-->)", re.S)


# --- the facts ------------------------------------------------------------------------------------------------------------


def _nodes() -> int:
    """Plenio's nodes in the node library: ``NODES`` without the retired ones kept for old workflows."""
    tree = ast.parse((PROJECT / "plenio" / "comfy" / "nodes" / "__init__.py").read_text(encoding="utf-8"))
    source = (PROJECT / "plenio" / "comfy" / "nodes" / "__init__.py").read_text(encoding="utf-8")
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "NODES" for t in node.targets
        ):
            assert isinstance(node.value, ast.Tuple)
            retired_from = source.index("# retired")
            line = source.count("\n", 0, retired_from) + 1
            return sum(1 for element in node.value.elts if element.lineno < line)
    raise SystemExit("NODES not found in plenio/comfy/nodes/__init__.py")


def _visuals() -> dict[str, int]:
    """The built-in visuals by engine, from the themes every visual has (``collections.ts``; a test holds the list
    to the visuals there are). Drop counts its presets without the one made up fresh each time."""
    text = (PROJECT / "frontend" / "src" / "player" / "visuals" / "collections.ts").read_text(
        encoding="utf-8"
    )
    start = text.index("export const THEMES")
    block = text[start : text.index("} // prettier-ignore", start)]
    ids = [a or b for a, b in re.findall(r"(?:'([\w-]+)'|\b([a-z]+)):\s*\[", block)]
    drop = [i for i in ids if i.startswith("drop-") and i != "drop-random"]
    nova = [i for i in ids if i.startswith("nova-")]
    classic = [i for i in ids if not i.startswith(("drop-", "nova-"))]
    # all: with the one made up fresh each time
    return {"classic": len(classic), "drop": len(drop), "nova": len(nova), "all": len(ids)}


def _tests() -> dict[str, int]:
    """Test functions as written (a parametrised test counts once): Python's ``def test_``, the frontend's ``it(``."""
    python = sum(
        len(re.findall(r"^\s*(?:async\s+)?def test_\w+\(", path.read_text(encoding="utf-8"), re.M))
        for path in (PROJECT / "tests").rglob("test_*.py")
    )
    frontend = sum(
        len(
            re.findall(
                r"^\s*(?:it|test)(?:\.each\([^)]*\))?\(\s*['\"`]", path.read_text(encoding="utf-8"), re.M
            )
        )
        for path in (PROJECT / "frontend" / "tests").rglob("*.test.ts")
    )
    return {"python": python, "frontend": frontend, "all": python + frontend}


def compute() -> dict[str, Any]:
    pyproject = tomllib.loads((PROJECT / "pyproject.toml").read_text(encoding="utf-8"))
    from plenio.core.song_api_doc_v2 import API_VERSION
    from plenio.core.system import MIN_COMFYUI
    from plenio.player.player_api import VERSION as PLAYER_API

    templates = sorted((PROJECT / "example_workflows").glob("*.json"))
    briefs = [p for p in (PROJECT / "resources" / "templates").rglob("*.md") if p.name != "README.md"]
    return {
        "version": pyproject["project"]["version"],
        "nodes": _nodes(),
        "blueprints": len(list((PROJECT / "subgraphs").glob("*.json"))),
        "templates": len(templates),
        "recipes": len(list((PROJECT / "example_workflows" / "recipes").glob("*.json"))),
        "brief_templates": len(briefs),
        "visuals": _visuals(),
        "tests": _tests(),
        "comfyui": {"minimum": ".".join(map(str, MIN_COMFYUI)), "tested": list(COMFYUI_TESTED)},
        "api": {"song": API_VERSION, "player": PLAYER_API},
        "install_line": "comfy node install comfyui-plenio-music",
        "hardware": [dict(zip(HARDWARE_KEYS, row, strict=True)) for row in _hardware_rows()],
    }


# --- the generated tables ---------------------------------------------------------------------------------------------------

HARDWARE_KEYS = ("card", "yue2", "minimax", "cover_art", "writer", "basis")


def _hardware_rows() -> list[tuple[str, ...]]:
    from plenio.core.assets.catalogue import load_catalogue
    from plenio.core.models import load_components
    from plenio.core.system import hardware_rows

    rows = hardware_rows(
        load_components(PROJECT / "resources" / "models.toml"),
        load_catalogue(PROJECT / "resources" / "assets.toml"),
    )
    return [(r.label, r.yue2, r.minimax, r.cover_art, r.writer, r.basis) for r in rows]


def hardware_table(facts: Mapping[str, Any]) -> str:
    lines = [
        "| GPU memory | YuE2 | MiniMax Music 3 | Cover Art (FLUX.2 Klein 4B) | Writer (Gemma 4) |",
        "|---|---|---|---|---|",
    ]
    lines += [
        f"| {r['card']} | {r['yue2']} | {r['minimax']} | {r['cover_art']} | {r['writer']} |"
        for r in facts["hardware"]
    ]
    bases = sorted({r["basis"] for r in facts["hardware"]})
    lines += ["", f"*What `auto` takes with nothing installed. Basis: {', '.join(bases)}.*"]
    return "\n".join(lines) + "\n"


BLOCKS: dict[str, Callable[[Mapping[str, Any]], str]] = {"hardware-table": hardware_table}


# --- markers ------------------------------------------------------------------------------------------------------------------


def value_of(facts: Mapping[str, Any], key: str) -> str:
    value: Any = facts
    for part in key.split("."):
        if not isinstance(value, Mapping) or part not in value:
            raise KeyError(f"no fact {key!r}")
        value = value[part]
    if isinstance(value, int):
        return f"{value:,}".replace(",", " ")  # 2 110, as the docs write numbers
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


def fill(text: str, facts: Mapping[str, Any]) -> str:
    """``text`` with every marker filled from ``facts``."""
    text = FACT.sub(lambda m: f"<!--fact:{m.group(1)}-->{value_of(facts, m.group(1))}<!--/fact-->", text)

    def block(m: re.Match[str]) -> str:
        name = m.group(2)
        if name not in BLOCKS:
            raise KeyError(f"no block {name!r}")
        return m.group(1) + BLOCKS[name](facts) + m.group(4)

    return BLOCK.sub(block, text)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="write docs/facts.json and fill every marker")
    mode.add_argument(
        "--check", action="store_true", help="exit 1 when a file is not as --write would make it"
    )
    args = parser.parse_args(argv)
    facts = compute()
    wanted = {FACTS: json.dumps(facts, indent=1, ensure_ascii=False) + "\n"}
    for name in FILES:
        path = PROJECT / name
        text = path.read_bytes().decode().replace("\r\n", "\n")
        wanted[path] = fill(text, facts)
    stale = [
        path
        for path, text in wanted.items()
        if not path.exists() or path.read_bytes().decode().replace("\r\n", "\n") != text
    ]
    if args.write:
        for path in stale:
            path.write_bytes(wanted[path].encode())
        print(f"facts: {len(stale)} file(s) written" if stale else "facts: every file is up to date")
        return 0
    for path in stale:
        print(
            f"{path.relative_to(PROJECT)}: not as the code says - run python tools/facts.py --write",
            file=sys.stderr,
        )
    return 1 if stale else 0


if __name__ == "__main__":
    raise SystemExit(main())
