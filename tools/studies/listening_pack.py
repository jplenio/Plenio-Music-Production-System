"""Build the owner's listening pack: numbered copies of the study takes plus a verdict sheet.

Usage:
  <python> tools/studies/listening_pack.py --evaluation <json> --takes <output dir> --source <audio> --out <pack dir>
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Any

from _common import read_json

QUESTIONS = {
    "e4": "Any voice (singing, humming, choir, spoken words, vocal chops)? Ending natural?",
    "e5-original": "Are the original lyrics sung correctly? Is the melody recognisable?",
    "e5-newlyrics": "Are the new lyrics sung and understandable? Melody recognisable?",
    "e5-lead": "Any voice? Does an instrument play the vocal melody recognisably?",
    "e5-acc": "Any voice? Does anything of the original remain recognisable?",
}


def question(name: str) -> str:
    for prefix, text in QUESTIONS.items():
        if name.startswith(prefix):
            return text
    return ""


def detectors(row: dict[str, Any]) -> str:
    parts = []
    if "score_detector" in row:
        parts.append(f"SheetSage2 vocal notes {row['score_detector']['vocal_notes']}")
    if "listen_detector" in row:
        parts.append(f"Gemma yes {row['listen_detector']['yes']}/{row['listen_detector']['windows']}")
    if "sung_lyrics_wer" in row:
        parts.append(f"lyrics WER {row['sung_lyrics_wer']['wer']}")
    if "identity" in row:
        parts.append(f"melody overlap {row['identity']['melody_vs_source_vocal'].get('f1')}")
    return "; ".join(parts)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--evaluation", required=True, type=Path)
    parser.add_argument("--takes", required=True, type=Path, help="ComfyUI output folder containing studies/")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    rows = read_json(args.evaluation)
    lines = [
        "# Phase 4A listening pack",
        "",
        "Please listen with headphones and fill in the last column (e.g. *no voice*, *humming at 1:20*, *lyrics ok*).",
        "The detector readings are what Plenio measured; your verdicts calibrate them.",
        "",
        "**Start here (the verdicts that decide defaults):**",
        "",
        "1. Vocals despite an instrumental score: 02 and 03 (adapter off, flagged) against 04 and 05 (adapter on). "
        "03 is the one case where the two detectors disagree.",
        "2. Adapter in covers: 15/16 against 17/18 (lead melody, new harmony) and 19/20 against 21/22 (lead, original chords).",
        "3. Endings with the adapter on the Song path: 04, 05, 08, 11 (all measured as abrupt).",
        "4. Lyrics: 12 and 13 (original lyrics, automatic draft), 14 (new lyrics).",
        "5. Accompaniment only: 23 (new harmony, flagged as vocal) against 24-27 (original chords).",
        "",
        "| # | File | Condition | Listen for | Measured | Your verdict |",
        "|---|---|---|---|---|---|",
    ]
    number = 0
    if args.source:
        number += 1
        target = f"{number:02d} source excerpt{args.source.suffix}"
        shutil.copy2(args.source, args.out / target)
        lines.append(f"| {number} | {target} | cover source (MiniMax excerpt) | reference | | |")
    for row in rows:
        stem = row["name"]
        matches = sorted((args.takes / "studies").glob(f"{stem}_*.flac"))
        if not matches:
            continue
        number += 1
        target = f"{number:02d} {stem}.flac"
        shutil.copy2(matches[0], args.out / target)
        lora = "adapter on" if row["lora"] else "adapter off"
        lines.append(
            f"| {number} | {target} | {row['condition']}, seed {row['seed']}, {lora} | {question(stem)} | {detectors(row)} | |"
        )
    (args.out / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{number} files in {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
