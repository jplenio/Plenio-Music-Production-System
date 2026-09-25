"""One-time import of the legacy toolkit's brief templates into resources/templates.

Usage: python tools/import_legacy_templates.py <legacy repo>/prompts/user

The legacy folder is only read. Field mapping:

    Genre, Tempo, Voice, Theme, Key -> same field (lower-case keys)
    Meter "4/4 (common time)"       -> "4/4"; other values kept as text
    Lyrics yes/sparse               -> vocals: sung
    Lyrics instrumental             -> vocals: instrumental
    Lyrics "only voice - no words"  -> vocals: sung, theme: wordless vocalise
    Language "Deutsch (German)"     -> "German" (the English name)
    Length 1-2 min / 2-4 min / 4-5  -> short / standard / long

Instrumental templates that mention vocal words are reported so that they can
be edited by hand; the Song Sheet would reject such a style anyway.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT))

from plenio.core.brief import Template, parse_template, render_template  # noqa: E402
from plenio.core.engines.yue2 import _VOCAL_TERMS  # noqa: E402

TARGET = PROJECT / "resources" / "templates"


def length_preset(value: str) -> str:
    minutes = [int(n) for n in re.findall(r"\d+", value)]
    top = max(minutes) if minutes else 3
    if top <= 2:
        return "short (about 1:30)"
    if top <= 4:
        return "standard (about 3:00)"
    return "long (about 4:30)"


def convert(path: Path, group_folder: str) -> tuple[Template, list[str]]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", text.replace("\r\n", "\n"), re.DOTALL)
    if match is None:
        raise ValueError(f"{path}: no front matter")
    raw = {}
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        raw[key.strip().lower()] = value.strip()
    description = match.group(2).strip()
    fields: dict[str, str] = {"description": description}
    if raw.get("genre"):
        fields["genre"] = raw["genre"].lower()
    if raw.get("tempo"):
        fields["tempo"] = raw["tempo"]
    meter = raw.get("meter", "")
    fraction = re.match(r"(\d+/\d+)\s*\(common time\)$", meter)
    if fraction:
        fields["meter"] = fraction.group(1)
    elif meter:
        fields["meter"] = meter
    lyrics = raw.get("lyrics", "yes").lower()
    if lyrics == "instrumental":
        fields["vocals"] = "instrumental"
    else:
        fields["vocals"] = "sung"
        if "no words" in lyrics:
            fields["theme"] = "wordless vocalise"
    language = raw.get("language", "")
    english = re.search(r"\(([^)]+)\)", language)
    if language:
        fields["language"] = english.group(1) if english else language
    for key in ("voice", "key"):
        if raw.get(key):
            fields[key] = raw[key]
    if raw.get("theme") and "theme" not in fields:
        fields["theme"] = raw["theme"]
    fields["length"] = length_preset(raw.get("length", ""))
    stem = path.stem
    base = re.sub(r"-(vocal|instrumental)$", "", stem)
    name = base.replace("-", " ").capitalize()
    if fields["vocals"] == "instrumental":
        name += " (instrumental)"
    group = group_folder.replace("-", " ").capitalize() if group_folder != "edm" else "EDM"
    template = Template(f"{group_folder}/{stem}", name, group, fields)
    problems = []
    if fields["vocals"] == "instrumental":
        for term in sorted({m.group(0).lower() for m in _VOCAL_TERMS.finditer(description)}):
            problems.append(f"instrumental template mentions {term!r}")
    return template, problems


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    source = Path(sys.argv[1])
    count = 0
    for path in sorted(source.glob("*/*.txt")):
        template, problems = convert(path, path.parent.name)
        target = TARGET / path.parent.name / f"{path.stem}.md"
        target.parent.mkdir(parents=True, exist_ok=True)
        rendered = render_template(template)
        parse_template(rendered, template.id)  # the written file must load
        target.write_text(rendered, encoding="utf-8")
        count += 1
        for problem in problems:
            print(f"{template.id}: {problem}")
    print(f"imported {count} templates into {TARGET.relative_to(PROJECT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
