"""Build the demo gallery's Plenio section from release records (docs/dev/release.md, "Demo gallery").

    python tools/build_demo_catalog.py <folder with *.plenio.json> [--pick TEMPLATE=FILE ...]

Picks one song per brief template (the best by the checks the records carry: length against the
brief, Song Sheet warnings, a title that no other pick shares) and writes

- ``docs/demo-plenio.js``: the tracks of the section, with empty ``soundcloudUrl`` fields to fill in
  after the upload; values typed in there (URLs, comments) are kept when the tool runs again;
- ``docs/demo-plenio-upload.md``: the upload checklist - which MP3 and cover to upload, in which
  order, the SoundCloud title, description and tags, and where the URLs go.

``--pick african/afrobeats-vocal="2026-09-26 Golden Hour Feeling Good.plenio.json"`` overrides the
automatic choice of a template. Only public fields are copied; the records' prompts stay local.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
CATALOG = PROJECT / "docs" / "demo-plenio.js"
CHECKLIST = PROJECT / "docs" / "demo-plenio-upload.md"
COVERS = "assets/demo-plenio"
VARIABLE = "window.PLENIO_DEMO_SONGS"
CONFIG = "window.PLENIO_DEMO_CONFIG"
KEPT = ("soundcloudUrl", "comment")
LANGUAGES = {"Arabic": "ar", "Japanese": "ja", "German": "de", "Hindi": "hi", "Hinglish": "hi"}


def template_meta(template_id: str) -> dict[str, str]:
    """Front matter of a brief template (name, group, language ...)."""
    path = PROJECT / "resources" / "templates" / f"{template_id}.md"
    meta: dict[str, str] = {}
    if path.is_file():
        head = path.read_text(encoding="utf-8").split("---")[1]
        for line in head.strip().splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return meta


def node(prompt: dict[str, Any], class_type: str, title: str | None = None) -> dict[str, Any]:
    for entry in prompt.values():
        if isinstance(entry, dict) and entry.get("class_type") == class_type:
            if title is None or entry.get("_meta", {}).get("title") == title:
                return dict(entry.get("inputs", {}))
    return {}


def score_facts(abc: str) -> dict[str, Any]:
    tempo = re.search(r"^Q:\s*1/4=(\d+)", abc, re.M)
    key = re.search(r"^K:\s*(\S+)", abc, re.M)
    sections = re.findall(r"^%\s*(\w[\w-]*)", abc, re.M)
    return {
        "bpm": int(tempo.group(1)) if tempo else None,
        "key": key.group(1) if key else "",
        "sections": list(dict.fromkeys(sections)),
    }


def load(path: Path) -> dict[str, Any]:
    record = json.loads(path.read_text(encoding="utf-8"))
    prompt = record.get("prompt", {})
    brief = node(prompt, "PlenioSongBrief")
    docs = {k: v.get("text", "") for k, v in record.get("documents", {}).items()}
    loudness = (record.get("audio", {}).get("loudness") or [{}])[0]
    files = {Path(f["name"]).suffix: f["name"] for f in record.get("files", []) if f.get("role") != "original"}
    warnings = [m for r in record.get("reports", []) for m in r.get("messages", [])]
    template = brief.get("template", "none")
    meta = template_meta(template)
    vocals = brief.get("vocals", "sung")
    language = brief.get("vocals.language") or (meta.get("language", "") if vocals == "sung" else "")
    return {
        "record": path.name,
        "template": template,
        "meta": meta,
        "title": record.get("title", ""),
        "created": record.get("created", ""),
        "plenio": record.get("versions", {}).get("plenio", ""),
        "brief": brief,
        "vocals": vocals,
        "language": language,
        "docs": docs,
        "seconds": float(record.get("audio", {}).get("seconds", 0.0)),
        "loudness": loudness,
        "files": files,
        "warnings": warnings,
        "licences": record.get("licences", []),
        "draft_seed": node(prompt, "SeedNode", "Draft seed").get("seed"),
        "take_seed": node(prompt, "SeedNode", "Take seed").get("seed"),
        "plan_seed": node(prompt, "YuE2GenerateABC").get("seed"),
        "target": 180.0 if "3:00" in str(brief.get("length", "")) else None,
    }


def penalty(song: dict[str, Any]) -> float:
    """Lower is better: length against the brief, warnings about the length, runaway renders."""
    seconds, target = song["seconds"], song["target"] or 180.0
    value = float(abs(seconds - target) / 60.0)
    if seconds > 330 or seconds < 100:
        value += 4.0  # runaway plan or a fragment
    if song["target"] is None:
        value += 3.0  # a test run with another length
    value += sum(1.0 for w in song["warnings"] if "score lasts" in w)
    value += sum(0.2 for w in song["warnings"] if "score lasts" not in w)
    if song["meta"].get("vocals") == song["vocals"]:
        value -= 1.0  # the render is what the template was written for (an instrumental template played)
    return value


def choose(songs: list[dict[str, Any]], picks: dict[str, str]) -> list[dict[str, Any]]:
    by_template: dict[str, list[dict[str, Any]]] = {}
    for song in songs:
        if song["template"] != "none":
            by_template.setdefault(song["template"], []).append(song)
    chosen: list[dict[str, Any]] = []
    used_words: set[tuple[str, ...]] = set()
    for template in sorted(by_template, key=lambda t: min(penalty(s) for s in by_template[t])):
        candidates = by_template[template]
        if template in picks:
            match = [s for s in candidates if s["record"] == picks[template]]
            if not match:
                raise SystemExit(f"--pick {template}: no record {picks[template]!r}")
            chosen.append(match[0])
            continue
        best = min(candidates, key=lambda song: rank(song, candidates, used_words))
        used_words.add(tuple(best["title"].lower().split()[:2]))
        chosen.append(best)
    group_order = ["Pop", "Rock", "Alternative", "Soul", "Punk", "African", "Asian", "World", "Reggae"]
    group_order += ["Ambient", "Seasonal"]
    chosen.sort(key=lambda s: (_index(group_order, s["meta"].get("group", "")), s["meta"].get("name", "")))
    return chosen


def rank(song: dict[str, Any], candidates: list[dict[str, Any]], used_words: set[tuple[str, ...]]) -> float:
    """``penalty`` plus: a title whose first words another genre's pick already has, or a title the
    batch produced several times."""
    words = tuple(song["title"].lower().split()[:2])
    repeated = sum(1 for s in candidates if s["title"] == song["title"]) > 1
    return penalty(song) + (1.5 if words in used_words else 0.0) + (0.3 if repeated else 0.0)


def _index(order: list[str], value: str) -> int:
    return order.index(value) if value in order else len(order)


UPPER = {"jrpg": "JRPG", "edm": "EDM", "rnb": "R&B", "idm": "IDM", "ebm": "EBM"}


def genre_name(name: str) -> str:
    """Display genre of a template name: without '(instrumental)' / 'vocal' (the type is its own
    badge), each word capitalised."""
    name = re.sub(r"\((instrumental|vocal)\)|\b(vocal|instrumental)\b", "", name, flags=re.I)
    words = re.sub(r"[-_]+", " ", name).split()
    return " ".join(UPPER.get(w.lower(), w[:1].upper() + w[1:]) for w in words)


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def entry(song: dict[str, Any], order: int, kept: dict[str, Any]) -> dict[str, Any]:
    meta, docs = song["meta"], song["docs"]
    facts = score_facts(docs.get("score", ""))
    ident = f"plenio-{slug(song['template'])}"
    genre = genre_name(meta.get("name") or song["template"].split("/")[-1])
    instrumental = song["vocals"] == "instrumental"
    lyrics = "" if instrumental else docs.get("lyrics", "")
    item = {
        "id": ident,
        "showcaseOrder": order,
        "title": song["title"],
        "genre": genre,
        "group": meta.get("group", ""),
        "type": "Instrumental" if instrumental else "Vocal",
        "language": song["language"] if not instrumental else "",
        "bpm": facts["bpm"],
        "key": facts["key"],
        "seconds": round(song["seconds"], 1),
        "template": song["template"],
        "templateDescription": _template_text(song["template"]),
        "style": docs.get("style", ""),
        "lyrics": lyrics,
        "sections": facts["sections"],
        "artworkPrompt": docs.get("artwork_prompt", ""),
        "mode": song["brief"].get("mode", ""),
        "length": song["brief"].get("length", ""),
        "draftSeed": song["draft_seed"],
        "planSeed": song["plan_seed"],
        "takeSeed": song["take_seed"],
        "loudness": {
            "integratedLufs": song["loudness"].get("integrated_lufs"),
            "truePeakDbtp": song["loudness"].get("true_peak_dbtp"),
            "loudnessRangeLu": song["loudness"].get("loudness_range_lu"),
        },
        "plenioVersion": song["plenio"],
        "licence": "; ".join(song["licences"]),
        "uploadFile": song["files"].get(".mp3", ""),
        "coverFile": song["files"].get(".jpg", ""),
        "coverArt": f"{COVERS}/{song['files'].get('.jpg', '')}" if song["files"].get(".jpg") else "",
        "soundcloudUrl": "",
        "comment": "",
    }
    for key in KEPT:
        if kept.get(key):
            item[key] = kept[key]
    return item


def _template_text(template_id: str) -> str:
    path = PROJECT / "resources" / "templates" / f"{template_id}.md"
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8").split("---", 2)[2].strip()


def existing() -> tuple[dict[str, dict[str, Any]], dict[str, Any]]:
    """Hand-filled values of the current catalog (by id) and its config."""
    if not CATALOG.is_file():
        return {}, {}
    text = CATALOG.read_text(encoding="utf-8")
    config = json.loads(re.search(rf"{re.escape(CONFIG)} = (\{{.*?\}});", text, re.S).group(1))  # type: ignore[union-attr]
    tracks = json.loads(re.search(rf"{re.escape(VARIABLE)} = (\[.*\]);", text, re.S).group(1))  # type: ignore[union-attr]
    return {t["id"]: t for t in tracks}, config


HEADER = """// Plenio Music Production System - demo songs made with Plenio {version} (YuE2 · Song template).
//
// Generated by tools/build_demo_catalog.py from the release records (*.plenio.json) of the runs.
// Running it again refreshes the facts and KEEPS what you typed here: soundcloudUrl and comment
// of every track, and the config below.
//
// HOW TO ADD THE SOUNDCLOUD LINKS (checklist: docs/demo-plenio-upload.md):
// 1. Upload the MP3 named in "uploadFile" to SoundCloud, public, into one playlist.
// 2. Paste the NORMAL SoundCloud track URL into that track's "soundcloudUrl".
// 3. Paste the playlist URL into "soundcloudPlaylistUrl" below.
// 4. Copy the JPG named in "coverFile" into docs/assets/demo-plenio/ (file names unchanged).
//
"""


def write_catalog(tracks: list[dict[str, Any]], config: dict[str, Any], version: str) -> None:
    config = {
        "artist": "Pelenio",
        "soundcloudPlaylistUrl": "",
        "album": "World of AI Music",
        **config,
    }
    text = HEADER.format(version=version)
    text += f"{CONFIG} = {json.dumps(config, indent=2, ensure_ascii=False)};\n\n"
    text += f"{VARIABLE} = {json.dumps(tracks, indent=2, ensure_ascii=False)};\n"
    CATALOG.write_text(text, encoding="utf-8")


def write_checklist(tracks: list[dict[str, Any]], alternatives: dict[str, list[str]], version: str) -> None:
    lines = [
        f"# Demo gallery: upload checklist for the Plenio {version} songs",
        "",
        f"{len(tracks)} songs, one per genre template, made with Plenio {version} (*1 · YuE2 · Song*, mode "
        "*new song every run*). Generated by `tools/build_demo_catalog.py`; the section of the demo page "
        "reads `docs/demo-plenio.js`.",
        "",
        "## Steps",
        "",
        "1. **SoundCloud:** create a playlist (suggestion: *Plenio 0.2.2 · YuE2 Songs*) and upload the MP3 "
        "files below into it in this order, public. Title, description and tags per track are listed below "
        "(the MP3s already carry title, artist and the cover).",
        "2. **URLs:** open `docs/demo-plenio.js`, search the track's `id` and paste the normal track URL "
        "(`https://soundcloud.com/pelenio/...`) into `soundcloudUrl`; paste the playlist URL into "
        "`soundcloudPlaylistUrl` at the top.",
        "3. **Covers:** copy the JPG files below into `docs/assets/demo-plenio/` with their names unchanged.",
        "4. Commit and push; GitHub Pages updates the page within a minute. Tracks without a URL show "
        "*coming to SoundCloud* instead of a player, so the section can go online before every upload is done.",
        "",
        "## Tracks",
        "",
        "| # | id | Title | Genre | MP3 to upload | Cover (to docs/assets/demo-plenio/) |",
        "|---|---|---|---|---|---|",
    ]
    for t in tracks:
        lines.append(
            f"| {t['showcaseOrder']} | `{t['id']}` | {t['title']} | {t['genre']} | {t['uploadFile']} | {t['coverFile']} |"
        )
    lines += ["", "## SoundCloud text per track", ""]
    for t in tracks:
        tags = ["Plenio", "ComfyUI", "YuE2", "AI music", t["genre"], t["group"]]
        facts = [t["type"], t["language"], f"{t['bpm']} BPM" if t["bpm"] else "", t["key"]]
        lines += [
            f"### {t['showcaseOrder']}. {t['title']}",
            "",
            f"- **Title:** {t['title']}",
            f"- **Genre (SoundCloud):** {t['genre']}",
            f"- **Tags:** {' '.join(json.dumps(x, ensure_ascii=False) if ' ' in x else x for x in tags if x)}",
            "- **Description:**",
            "",
            "```text",
            f"{t['genre']} · {' · '.join(x for x in facts if x)}",
            f"Made locally in ComfyUI with the Plenio Music Production System {t['plenioVersion']} and YuE2 "
            f"(brief template: {t['template']}; lyrics and style written by Gemma 4, mastered to "
            f"{t['loudness']['integratedLufs']} LUFS by Plenio).",
            "Workflow and all settings: https://github.com/jplenio/Plenio-Music-Production-System",
            "Demo gallery: https://jplenio.github.io/Plenio-Music-Production-System/",
            f"Model licence: {t['licence']}",
            "```",
            "",
        ]
    lines += [
        "## Alternatives per genre",
        "",
        "The other runs of each template, best first by the same checks - to swap a song after listening: "
        "`python tools/build_demo_catalog.py <records> --pick <template>=<record file>`.",
        "",
    ]
    for template, names in alternatives.items():
        lines.append(f"- `{template}`: " + "; ".join(names))
    CHECKLIST.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("records", type=Path)
    parser.add_argument("--pick", action="append", default=[], help="TEMPLATE=RECORD FILE")
    args = parser.parse_args()
    picks = dict(p.split("=", 1) for p in args.pick)
    songs = [load(p) for p in sorted(args.records.glob("*.plenio.json"))]
    if not songs:
        print(f"no *.plenio.json in {args.records}", file=sys.stderr)
        return 1
    chosen = choose(songs, picks)
    kept, config = existing()
    version = max(s["plenio"] for s in chosen)
    tracks = []
    for order, song in enumerate(chosen, 1):
        ident = f"plenio-{slug(song['template'])}"
        tracks.append(entry(song, order, kept.get(ident, {})))
    alternatives = {}
    for song in chosen:
        others = sorted(
            (s for s in songs if s["template"] == song["template"] and s is not song), key=penalty
        )
        alternatives[song["template"]] = [
            f"{s['title']} ({s['seconds']:.0f} s, `{s['record']}`)" for s in others
        ]
    write_catalog(tracks, config, version)
    write_checklist(tracks, alternatives, version)
    print(f"{len(tracks)} songs from {len(songs)} records -> {CATALOG.relative_to(PROJECT)}")
    for t in tracks:
        print(f"{t['showcaseOrder']:2} {t['genre']:<28} {t['type']:<12} {t['seconds']:>6.1f}s  {t['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
