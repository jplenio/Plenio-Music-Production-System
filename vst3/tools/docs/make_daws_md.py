"""Writes docs/DAWS.md from webui/src/daws.json: the same steps the plug-in's DAW tab shows.

python tools/docs/make_daws_md.py          # writes docs/DAWS.md
python tools/docs/make_daws_md.py --check  # exits 1 when docs/DAWS.md is not up to date (CI)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "webui" / "src" / "daws.json"
TARGET = ROOT / "docs" / "DAWS.md"

ROWS = [
    ("add", "Add Plenio"),
    ("tempo", "Tempo map"),
    ("stems", "Stems"),
    ("midi", "MIDI"),
    ("ara", "Plenio ARA"),
    ("audio", "Good to know"),
]


def anchor(name: str) -> str:
    return "".join(c for c in name.lower().replace(" ", "-") if c.isalnum() or c == "-")


def render(data: dict) -> str:
    general = data["general"]
    daws = data["daws"]
    out = [
        "<!-- Written by tools/docs/make_daws_md.py from webui/src/daws.json: change that file, not this one. -->",
        "",
        "# Plenio VST3 in your DAW",
        "",
        "Plenio runs in every DAW that loads VST3 instruments. Most of it is the same everywhere; what differs is how a",
        "DAW takes a tempo map, routes a plug-in's extra outputs and treats audio that does not follow its tempo. The",
        "plug-in shows the same steps in its **DAW tab**, those of the DAW it runs in first.",
        "",
        "![The DAW tab: the steps for the DAW Plenio runs in](media/screens/daw-guide.png)",
        "",
        "| DAW | Plenio runs | The song's tempo map | Plenio ARA |",
        "|---|---|---|---|",
    ]
    for d in daws:
        runs = "no" if d.get("unsupported") else "yes"
        out.append(
            f"| [{d['name']}](#{anchor(d['name'])}) | {runs} | {d['table']['tempo']} | {d['table']['ara']} |"
        )
    out += [
        "",
        "## In every DAW",
        "",
    ]
    for key, label in ROWS:
        if key in general:
            out.append(f"- **{label}:** {general[key]}")
    for d in daws:
        out += ["", f"## {d['name']}", ""]
        if d.get("unsupported"):
            out.append(d["unsupported"])
            continue
        for key, label in ROWS:
            text = d.get(key) or (general.get(key) if key != "ara" else None)
            if text:
                out.append(f"- **{label}:** {text}")
    out += [
        "",
        "## Another DAW",
        "",
        "Waveform, Ardour, Reason, Mixcraft and every other VST3 host: insert Plenio as an instrument and follow",
        "[In every DAW](#in-every-daw). Tell us how it went, and what your DAW does differently:",
        "[open an issue](https://github.com/jplenio/Plenio-Music-Production-System/issues/new/choose).",
        "",
    ]
    return "\n".join(out)


def main() -> int:
    text = render(json.loads(SOURCE.read_text(encoding="utf-8")))
    if "--check" in sys.argv:
        current = TARGET.read_text(encoding="utf-8") if TARGET.exists() else ""
        if current != text:
            print("docs/DAWS.md is not up to date: run python tools/docs/make_daws_md.py", file=sys.stderr)
            return 1
        return 0
    TARGET.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {TARGET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
