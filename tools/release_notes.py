"""The release notes of a version, from its CHANGELOG section (MP 8.2, step 4): ``docs/releases/<version>.md``, which
the release workflow publishes from the tag.

    python tools/release_notes.py 2.0.0            # write docs/releases/2.0.0.md
    python tools/release_notes.py 2.0.0 --check    # exit 1 when the file is not as the CHANGELOG says

The notes are the section's intro, its parts in the order Added, Changed, Security, Fixed, the two ways to install
and the line about the two artefacts. Standard library only.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
ORDER = ("Added", "Changed", "Security", "Fixed")


def section(version: str, changelog: str) -> str:
    """The CHANGELOG's section of ``version`` without its heading (empty when there is none)."""
    text = changelog.replace("\r\n", "\n")
    match = re.search(rf"^## {re.escape(version)}\b[^\n]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return match.group(1).strip() if match else ""


def parts(body: str) -> tuple[str, dict[str, str]]:
    """The intro (before the first ``###``) and the parts by their heading."""
    pieces = re.split(r"^### +(.+)$", body, flags=re.M)
    intro = pieces[0].strip()
    found = {pieces[i].strip(): pieces[i + 1].strip() for i in range(1, len(pieces) - 1, 2)}
    return intro, found


def notes(version: str, changelog: str, install_line: str) -> str:
    body = section(version, changelog)
    if not body:
        raise SystemExit(f"CHANGELOG.md has no section for {version}")
    intro, found = parts(body)
    if not intro:
        raise SystemExit(f"CHANGELOG.md: the section of {version} has no intro before its first part")
    lines = [f"# Plenio {version}", "", intro, ""]
    for name in [*ORDER, *sorted(set(found) - set(ORDER))]:
        if found.get(name):
            lines += [f"## {name}", "", found[name], ""]
    lines += [
        "## Install",
        "",
        f"- **ComfyUI Manager**: search for *Plenio Music Production System*; or `{install_line}`.",
        "- **The full download**: `git clone https://github.com/jplenio/Plenio-Music-Production-System` into "
        "`ComfyUI/custom_nodes`, or the zip below - it also carries the Studio add-on (the player starts ComfyUI, "
        "a `llama-server` runs a GGUF writer, *Open the folder*).",
        "",
        "Restart ComfyUI; Plenio Setup opens and plans the model files for your graphics card. Updating from 1.x: "
        "[what changes](https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/from-1x-to-2.md).",
        "",
    ]
    return "\n".join(lines)


def target(version: str) -> Path:
    return PROJECT / "docs" / "releases" / f"{version}.md"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("version")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    changelog = (PROJECT / "CHANGELOG.md").read_text(encoding="utf-8")
    text = notes(args.version, changelog, "comfy node install comfyui-plenio-music")
    path = target(args.version)
    if args.check:
        same = path.exists() and path.read_text(encoding="utf-8").replace("\r\n", "\n") == text
        print(
            f"{path.relative_to(PROJECT)}: {'as the CHANGELOG says' if same else 'not as the CHANGELOG says'}"
        )
        return 0 if same else 1
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode())
    print(f"wrote {path.relative_to(PROJECT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
