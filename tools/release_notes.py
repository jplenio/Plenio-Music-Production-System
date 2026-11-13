"""The release notes of a version, from its CHANGELOG section (MP 8.2, step 4): ``docs/releases/<version>.md``, which
the release workflow publishes from the tag.

    python tools/release_notes.py 2.0.0            # write docs/releases/2.0.0.md
    python tools/release_notes.py 2.0.0 --check    # exit 1 when the file is not as the CHANGELOG says
    python tools/release_notes.py 2.0.0 --print    # the notes on the screen, nothing written

The notes are made for a reader of the release page: the banner, the section's intro, what to watch, the
**Highlights** as a table (with a picture beside each one that has one), **Updating from 1.x**, how to install - and
then every change, part by part, folded so that the page stays short and nothing is left out. The CHANGELOG is the
one source of the words; ``docs/releases/<version>.json`` (optional) says how the page looks:

    {"banner": "assets/branding/banner-large.png",
     "watch": [{"key": "film-hero", "label": "Plenio in 50 seconds"}],     # videos by their key in media.toml
     "pictures": {"Plenio Setup": "assets/branding/2.0.0/setup.jpg"}}      # by the highlight's bold lead-in

A video whose key ``resources/media.toml`` does not know yet (not uploaded) is left out, so the notes never link a
film that is not there. Standard library only.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
ORDER = ("Added", "Changed", "Security", "Fixed")
SHOWN = ("Highlights", "Updating")
"""The parts shown open at the top (``Updating from 1.x`` too: by its first word); every other part is folded under
*Every change*."""
REPOSITORY = "https://github.com/jplenio/Plenio-Music-Production-System"
RAW = "https://raw.githubusercontent.com/jplenio/Plenio-Music-Production-System"
SITE = "https://jplenio.github.io/Plenio-Music-Production-System"
ABOUT = (
    "> **New to Plenio?** Plenio is a free, open-source song production suite for ComfyUI that runs on your own "
    "PC: type an idea and get a finished, mastered song with cover art, timed lyrics and sheet music - sung by YuE2 "
    "or MiniMax Music 3. See and change every word, note and chord before it is sung, and play it to a room from the "
    f"Plenio Player. [Listen first]({SITE}/) · [README]({REPOSITORY}#readme) · "
    f"[Guide]({SITE}/guide/)"
)


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


def items(part: str) -> list[str]:
    """A part's entries: its top-level bullets, each with the lines that continue it."""
    found: list[str] = []
    for line in part.splitlines():
        if line.startswith("- "):
            found.append(line[2:])
        elif found and line.strip() and not line.startswith("#"):
            found[-1] += "\n" + line
    return found


def lead_in(item: str) -> str:
    """An entry's bold lead-in without its stars (``**Plenio Setup** - ...`` gives ``Plenio Setup``)."""
    match = re.match(r"\*{2,3}(.+?)\*{2,3}", item)
    return match.group(1).strip() if match else ""


def videos(media: str) -> dict[str, str]:
    """The registered videos and playlists: key -> go-link."""
    try:
        import tomllib
    except ModuleNotFoundError:  # Python 3.10
        import tomli as tomllib
    data: dict[str, Any] = tomllib.loads(media) if media else {}
    site = str(data.get("site", SITE)).rstrip("/")
    return {
        str(v["key"]): f"{site}/go/{v['key']}/" for kind in ("video", "playlist") for v in data.get(kind, [])
    }


def highlights(part: str, pictures: dict[str, str], version: str) -> list[str]:
    """The highlights: a table with a picture beside each entry that has one, plain bullets when none has."""
    entries = items(part)
    if not any(lead_in(e) in pictures for e in entries):
        return [f"- {e}" for e in entries]
    rows = ["<table>"]
    for entry in entries:
        picture = pictures.get(lead_in(entry))
        if picture:
            alt = lead_in(entry).replace('"', "'")
            rows += [
                f'<tr><td width="42%"><img src="{RAW}/v{version}/{picture}" alt="{alt}" width="100%" /></td><td>',
                "",
                entry,
                "",
                "</td></tr>",
            ]
        else:
            rows += ['<tr><td colspan="2">', "", entry, "", "</td></tr>"]
    rows.append("</table>")
    return rows


def count(part: str) -> int:
    return len(items(part))


def notes(
    version: str,
    changelog: str,
    install_line: str,
    look: dict[str, Any] | None = None,
    media: str = "",
) -> str:
    body = section(version, changelog)
    if not body:
        raise SystemExit(f"CHANGELOG.md has no section for {version}")
    intro, found = parts(body)
    if not intro:
        raise SystemExit(f"CHANGELOG.md: the section of {version} has no intro before its first part")
    look = look or {}
    lines: list[str] = []
    if look.get("banner"):
        lines += [
            f'<p align="center"><img src="{RAW}/v{version}/{look["banner"]}" alt="Plenio Music Production System '
            f'{version}" width="100%" /></p>',
            "",
        ]
    lines += [f"# Plenio {version}", "", intro, ""]
    known = videos(media)
    watch = [
        f"▶ **[{w['label']}]({known[w['key']]})**" for w in look.get("watch", []) if w.get("key") in known
    ]
    if watch:
        lines += [" · ".join(watch), ""]
    lines += [ABOUT, ""]
    if found.get("Highlights"):
        lines += [
            "## Highlights",
            "",
            *highlights(found["Highlights"], look.get("pictures", {}), version),
            "",
        ]
    for name in found:
        if name.startswith("Updating"):
            lines += [f"## {name}", "", found[name], ""]
    lines += [
        "## Install",
        "",
        f"- **ComfyUI Manager**: search for *Plenio Music Production System* - or `{install_line}`.",
        f"- **The full download**: `git clone {REPOSITORY}` into `ComfyUI/custom_nodes`, or the zip below. It also "
        "carries the Studio add-on: the player starts ComfyUI, a `llama-server` runs a GGUF writer, *Open the "
        "folder* opens the file manager.",
        "",
        "Restart ComfyUI: **Plenio Setup** opens and plans the model files for your graphics card.",
        "",
    ]
    shown = {name for name in found if name == "Highlights" or name.startswith("Updating")}
    rest = [name for name in [*ORDER, *sorted(set(found) - set(ORDER) - shown)] if found.get(name)]
    if rest:
        lines += ["## Every change", ""]
        for name in rest:
            lines += [
                f"<details><summary><b>{name}</b> ({count(found[name])})</summary>",
                "",
                found[name],
                "",
                "</details>",
                "",
            ]
        lines += [f"The same list as a file: [CHANGELOG.md]({REPOSITORY}/blob/v{version}/CHANGELOG.md).", ""]
    return absolute_links("\n".join(lines), version)


def absolute_links(text: str, version: str) -> str:
    """The CHANGELOG's links, relative to the repository's root, as links to the files at the version's tag: the
    notes live in docs/releases/ and on the GitHub release page, where a relative link leads nowhere."""
    return re.sub(
        r"\]\((?![a-z][a-z0-9+.-]*:|#|/)([^)\s]+)\)",
        lambda m: f"]({REPOSITORY}/blob/v{version}/{m.group(1)})",
        text,
    )


def target(version: str) -> Path:
    return PROJECT / "docs" / "releases" / f"{version}.md"


def look_of(version: str) -> dict[str, Any]:
    """How the version's page looks (``docs/releases/<version>.json``); every picture it names must exist."""
    path = PROJECT / "docs" / "releases" / f"{version}.json"
    if not path.exists():
        return {}
    look: dict[str, Any] = json.loads(path.read_text(encoding="utf-8"))
    named = [look.get("banner"), *look.get("pictures", {}).values()]
    missing = [p for p in named if p and not (PROJECT / p).is_file()]
    if missing:
        raise SystemExit(
            f"{path.relative_to(PROJECT)} names pictures that are not there: {', '.join(missing)}"
        )
    return look


def build(version: str) -> str:
    changelog = (PROJECT / "CHANGELOG.md").read_text(encoding="utf-8")
    registry = PROJECT / "resources" / "media.toml"
    media = registry.read_text(encoding="utf-8") if registry.exists() else ""
    look = look_of(version)
    text = notes(version, changelog, "comfy node install comfyui-plenio-music", look, media)
    unknown = [lead for lead in look.get("pictures", {}) if f'alt="{lead}"' not in text]
    if unknown:
        raise SystemExit(
            f"docs/releases/{version}.json: no highlight starts with {unknown} - pictures go by the bold lead-in"
        )
    return text


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=(__doc__ or "").split("\n\n")[0])
    parser.add_argument("version")
    parser.add_argument(
        "--check", action="store_true", help="exit 1 when the file is not as the CHANGELOG says"
    )
    parser.add_argument("--print", action="store_true", dest="show", help="print the notes; write nothing")
    args = parser.parse_args(argv)
    text = build(args.version)
    path = target(args.version)
    if args.show:
        sys.stdout.buffer.write(text.encode())
        return 0
    if args.check:
        same = path.exists() and path.read_text(encoding="utf-8").replace("\r\n", "\n") == text
        print(
            f"{path.relative_to(PROJECT)}: {'as the CHANGELOG says' if same else 'not as the CHANGELOG says - run: python tools/release_notes.py ' + args.version}"
        )
        return 0 if same else 1
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode())
    print(f"wrote {path.relative_to(PROJECT)} ({len(text.splitlines())} lines)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
