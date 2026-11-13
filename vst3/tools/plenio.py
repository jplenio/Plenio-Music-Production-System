"""Plenio VST3 and the Plenio it lives with: what the plug-in uses of Plenio's Song API, checked against this checkout.

    python vst3/tools/plenio.py check [--report out.md]
    python vst3/tools/plenio.py sync

Most of Plenio reaches the plug-in by itself, at run time, through the Song API: its styles, fields, models and
values. What the plug-in relies on beyond that is checked here: the routes of Song API v2 it calls (and of v1, which
it speaks to a Plenio before 2.0), the fields it sets, the release record. `check` says whether the checkout still has
all of it and whether the plug-in's demo data is current (exit 1 when not) - the repository's CI runs it, so a change
to the API that would break the plug-in is seen in the same pull request. `sync` takes over the styles for the demo
and the tests (webui/src/mock/briefs.json) and records the version as tested (resources/plenio-compat.json).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPAT = ROOT / "resources" / "plenio-compat.json"
BRIEFS = ROOT / "webui" / "src" / "mock" / "briefs.json"

# what the plug-in uses (src/core, src/plugin, webui/src/form.ts)
API_ROUTES = [
    "/",
    "/briefs",
    "/jobs",
    "/jobs/{id}",
    "/jobs/{id}/approve",
    "/jobs/{id}/bars",
    "/models",
    "/templates/{id}",
    "/uploads",
    "/scores/export/midi",
    "/scores/import/midi",
]
# a Plenio before 2.0: Song API v1 (frozen) and the score routes beside it
V1_ROUTES = [
    "/",
    "/briefs",
    "/jobs",
    "/jobs/{id}",
    "/jobs/{id}/bars",
    "/models",
    "/templates/{id}",
    "/uploads",
]
OTHER_ROUTES = ["/plenio/score/midi/export", "/plenio/score/midi/import"]
FIELDS = [
    # the brief (webui/src/form.ts)
    "template",
    "description",
    "genre",
    "mood",
    "tempo",
    "length",
    "vocals",
    "language",
    "voice",
    "theme",
    "lyrics_from",
    "lyrics",
    "key",
    "meter",
    "finish.cover_art",
    "finish.hq_mastering",
    "writer.model",
    # the release the plug-in asks for (src/core/session.cpp)
    "folder",
    "flac",
    "mp3",
    "wav",
    "song_page",
    "sheet_music",
    "lyrics_srt",
]
RECORD = ["documents", "quality", "timing", "subtitles", "title", "files"]
FEATURES = {"stems": "stems with every take", "bars": "the bars measured in a take (the tempo map)"}


def version_of(text: str, pattern: str) -> str | None:
    m = re.search(pattern, text, re.M)
    return m.group(1) if m else None


def numbers(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in re.findall(r"\d+", v)[:3])


def check(plenio: Path) -> tuple[bool, list[str], dict]:
    lines: list[str] = []
    ok = True

    def note(good: bool, text: str, required: bool = True) -> None:
        nonlocal ok
        lines.append(f"- {'✅' if good else ('❌' if required else '⚠️')} {text}")
        if required and not good:
            ok = False

    pyproject = (plenio / "pyproject.toml").read_text(encoding="utf-8")
    song_api = (plenio / "plenio" / "core" / "song_api.py").read_text(encoding="utf-8")
    version = version_of(pyproject, r'^version\s*=\s*"([^"]+)"') or "?"
    api = version_of(song_api, r'^API_VERSION\s*=\s*"([^"]+)"') or "0"
    features_text = version_of(song_api, r"^FEATURES\s*=\s*\(([^)]*)\)") or ""
    features = set(re.findall(r'"([^"]+)"', features_text))
    facts = {"version": version, "api": api, "features": sorted(features)}

    lines.append(
        f"Plenio **{version}**, Song API **{api}**, features: {', '.join(sorted(features)) or 'none'}"
    )
    lines.append("")
    note(
        numbers(api)[:1] == (1,) and numbers(api) >= (1, 3),
        f"Song API v1 is 1.3 or newer (songs can be made with a Plenio before 2.0): {api}",
    )
    for f, what in FEATURES.items():
        note(f in features, f"feature `{f}`: {what}", required=False)

    openapi = json.loads((plenio / "docs" / "api" / "openapi.json").read_text(encoding="utf-8"))
    paths = set(openapi.get("paths", {}))
    v2 = str(openapi.get("info", {}).get("version", "0"))
    facts["api_v2"] = v2
    note(numbers(v2)[:1] == (2,), f"Song API v2: {v2}")
    for route in API_ROUTES:
        note(route in paths, f"Song API v2 route `{route}`")
    v1 = json.loads((plenio / "docs" / "api" / "v1" / "openapi.json").read_text(encoding="utf-8"))
    for route in V1_ROUTES:
        note(route in v1.get("paths", {}), f"Song API v1 route `{route}`")
    routes = (plenio / "plenio" / "comfy" / "routes.py").read_text(encoding="utf-8")
    for route in OTHER_ROUTES:
        note(f'"{route}"' in routes, f"route `{route}`")

    fields_md = (plenio / "docs" / "api" / "fields.md").read_text(encoding="utf-8")
    known = set(re.findall(r"^\| `([^`]+)`", fields_md, re.M))
    for field in FIELDS:
        note(field in known, f"field `{field}`")

    schema = json.loads(
        (plenio / "resources" / "schemas" / "record-1.schema.json").read_text(encoding="utf-8")
    )
    props = set(schema.get("properties", {}))
    for key in RECORD:
        note(key in props, f"release record `{key}`")

    styles = list((plenio / "resources" / "templates").glob("*/*.md"))
    note(len(styles) > 0, f"{len(styles)} styles", required=False)
    facts["styles"] = len(styles)

    # the plug-in's own copies: the styles of its demo, the version it was checked against
    compat = json.loads(COMPAT.read_text(encoding="utf-8"))
    note(
        compat.get("tested") == version,
        f"resources/plenio-compat.json names {version} as tested (`sync` writes it)",
    )
    current = BRIEFS.exists() and json.loads(BRIEFS.read_text(encoding="utf-8")) == briefs(plenio)
    note(current, "webui/src/mock/briefs.json holds the checkout's styles (`sync` writes them)")
    return ok, lines, facts


def front_matter(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.S)
    if not m:
        return {}, text.strip()
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, m.group(2).strip()


def briefs(plenio: Path) -> list[dict]:
    out = []
    for path in sorted((plenio / "resources" / "templates").glob("*/*.md")):
        meta, body = front_matter(path.read_text(encoding="utf-8"))
        fields = {
            k: meta[k]
            for k in (
                "genre",
                "tempo",
                "meter",
                "vocals",
                "language",
                "voice",
                "theme",
                "lyrics",
                "key",
                "length",
            )
            if meta.get(k)
        }
        fields["description"] = body
        out.append(
            {
                "id": f"{path.parent.name}/{path.stem}",
                "name": meta.get("name", path.stem),
                "group": meta.get("group", path.parent.name.title()),
                "fields": fields,
            }
        )
    return out


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")  # the report's ✅ and ❌ on a Windows console too
    if len(sys.argv) < 2 or sys.argv[1] not in ("check", "sync"):
        print(__doc__)
        return 2
    # the checkout this folder is part of; another one may be named (a release to compare with)
    plenio = Path(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else ROOT.parent
    if sys.argv[1] == "sync":
        new = briefs(plenio)
        BRIEFS.write_text(
            json.dumps(new, indent=1, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
        )
        compat = json.loads(COMPAT.read_text(encoding="utf-8"))
        pyproject = (plenio / "pyproject.toml").read_text(encoding="utf-8")
        compat["tested"] = version_of(pyproject, r'^version\s*=\s*"([^"]+)"') or compat["tested"]
        COMPAT.write_text(
            json.dumps(compat, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n"
        )
        print(f"styles: {len(new)}; tested: {compat['tested']}")
    ok, lines, facts = check(plenio)
    report = "\n".join(
        [f"## Plenio {facts['version']} and Plenio VST3", ""]
        + lines
        + ["", "**Compatible.**" if ok else "**Not compatible: the plug-in needs a change.**", ""]
    )
    if "--report" in sys.argv:
        Path(sys.argv[sys.argv.index("--report") + 1]).write_text(report, encoding="utf-8")
    print(report)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
