"""E2b: placing ASR words into the transcribed score's sections — beat grid vs. constant tempo.

Inputs are the JSON files written by ``sheetsage_timeline.py`` (E1) and ``asr_whisper.py`` (E2).
Each ASR word is placed at the bar that contains its time midpoint, either with the decoded beat
grid (bar start times in source seconds) or with a constant-tempo reading of the ABC (its ``Q:``
from time 0). Placement is scored against the reference lyrics: every ASR word that the
Levenshtein alignment matches to a reference word should land in the score section that
corresponds to the reference word's section.

Usage: <python> tools/studies/alignment.py --e1 <dir> --e2 <dir> --out <dir> [--config auto]
"""

from __future__ import annotations

import argparse
import bisect
import re
from collections import Counter
from pathlib import Path
from typing import Any

from _common import align, read_json, words, write_json

from plenio.core.score import native

_TAG = re.compile(r"^\s*\[([^\]]+)\]\s*$")


def reference_sections(text: str) -> list[tuple[str, list[str]]]:
    """Reference lyrics as (label, words) per section; sections without words are dropped."""
    sections: list[tuple[str, list[str]]] = []
    label = "untagged"
    for line in text.splitlines():
        match = _TAG.match(line)
        if match:
            label = re.sub(r"\s*\d+$", "", match.group(1).strip().lower())
            sections.append((label, []))
        elif line.strip():
            if not sections:
                sections.append((label, []))
            sections[-1][1].extend(words(line))
    return [(lab, ws) for lab, ws in sections if ws]


def map_labels(reference: list[str], score: list[str]) -> dict[int, int]:
    """Order-preserving alignment of section label sequences (match = equal label)."""
    rows, cols = len(reference) + 1, len(score) + 1
    best = [[0] * cols for _ in range(rows)]
    for i in range(1, rows):
        for j in range(1, cols):
            best[i][j] = max(
                best[i - 1][j], best[i][j - 1], best[i - 1][j - 1] + (reference[i - 1] == score[j - 1])
            )
    mapping, i, j = {}, len(reference), len(score)
    while i > 0 and j > 0:
        if reference[i - 1] == score[j - 1] and best[i][j] == best[i - 1][j - 1] + 1:
            mapping[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif best[i - 1][j] >= best[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return mapping


def place(times: list[float], starts: list[float]) -> list[int]:
    return [min(max(bisect.bisect_right(starts, t) - 1, 0), len(starts) - 1) for t in times]


def section_index(bars: list[int], sections: list[native.Section]) -> list[int]:
    lookup = []
    for index, section in enumerate(sections):
        lookup.extend([index] * section.bars)
    return [lookup[min(b, len(lookup) - 1)] for b in bars]


def phrases(asr: list[dict[str, Any]], gap: float) -> list[list[int]]:
    """Word indices grouped into phrases: a new phrase starts after a pause of at least ``gap`` seconds."""
    groups: list[list[int]] = []
    for index, word in enumerate(asr):
        if not groups or word["start"] - asr[index - 1]["end"] >= gap:
            groups.append([])
        groups[-1].append(index)
    return groups


def by_phrase(asr: list[dict[str, Any]], placed: list[int], gap: float) -> list[int]:
    """Each phrase goes to the section holding most of its words (ties: the later section), so a pickup
    sung before the section's first downbeat stays with its phrase."""
    out = list(placed)
    for group in phrases(asr, gap):
        counts = Counter(placed[i] for i in group)
        best = max(counts.items(), key=lambda item: (item[1], item[0]))[0]
        for i in group:
            out[i] = best
    return out


def _head(asr: list[dict[str, Any]], i: int, gap: float) -> bool:
    """A phrase starts at the first word, after a pause, or where the ASR starts a new segment (line)."""
    return (
        i == 0
        or asr[i]["start"] - asr[i - 1]["end"] >= gap
        or asr[i].get("segment") != asr[i - 1].get("segment")
    )


def with_pickups(
    asr: list[dict[str, Any]],
    placed: list[int],
    sections: list[native.Section],
    starts: list[float],
    gap: float,
) -> list[int]:
    """Midpoint placement, except that a phrase starting within one bar before a section's first
    downbeat (a pickup) moves to that section. Continuous singing across a boundary is not moved."""
    out = list(placed)
    for index, section in enumerate(sections[1:], start=1):
        bar = section.start_bar - 1
        if bar <= 0 or bar >= len(starts):
            continue
        boundary, window = starts[bar], starts[bar] - starts[bar - 1]
        inside = [i for i, w in enumerate(asr) if boundary - window <= (w["start"] + w["end"]) / 2 < boundary]
        heads = [i for i in inside if _head(asr, i, gap)]
        if not heads:
            continue
        follows = inside[-1] + 1 < len(asr) and not _head(asr, inside[-1] + 1, gap)
        if follows:
            for i in range(heads[-1], inside[-1] + 1):
                out[i] = index
    return out


def draft(asr: list[dict[str, Any]], placed: list[int], sections: list[native.Section]) -> str:
    """The automatic lyrics draft: section tags of the score, words in source order, a line per phrase."""
    blocks: dict[int, list[list[str]]] = {}
    previous: dict[str, Any] | None = None
    for word, section in zip(asr, placed, strict=False):
        lines = blocks.setdefault(section, [[]])
        new_line = previous is not None and (
            word["start"] - previous["end"] > 0.9 or word.get("segment") != previous.get("segment")
        )
        if new_line and lines[-1]:
            lines.append([])
        lines[-1].append(word["word"])
        previous = word
    out = []
    for index, section in enumerate(sections):
        out.append(section.tag)
        out.extend(" ".join(line) for line in blocks.get(index, []) if line)
        out.append("")
    return "\n".join(out).strip()


def study(e1: dict[str, Any], e2: dict[str, Any], config: str) -> dict[str, Any]:
    analysis = native.analyze(e1["abc"])
    sections = list(analysis.sections)
    run = e2["runs"][config]
    asr = [w for w in run["words"] if words(w["word"])]
    mids = [(w["start"] + w["end"]) / 2 for w in asr]
    grid = place(mids, e1["grid"]["bar_starts_s"])
    constant = place(mids, [b.start_s for b in analysis.bars])
    by_grid, by_constant = section_index(grid, sections), section_index(constant, sections)
    variants = {"grid": by_grid, "constant_tempo": by_constant}
    for gap in (0.3, 0.5, 0.8):
        variants[f"grid_phrase_{gap}"] = by_phrase(asr, by_grid, gap)
    variants["constant_tempo_phrase_0.5"] = by_phrase(asr, by_constant, 0.5)
    for gap in (0.2, 0.3, 0.5):
        variants[f"grid_pickup_{gap}"] = with_pickups(asr, by_grid, sections, e1["grid"]["bar_starts_s"], gap)
    result: dict[str, Any] = {
        "file": e1["file"],
        "config": config,
        "asr_words": len(asr),
        "score_sections": [s.label for s in sections],
        "bar_disagreement": sum(a != b for a, b in zip(grid, constant, strict=False)),
        "section_disagreement": sum(a != b for a, b in zip(by_grid, by_constant, strict=False)),
        "draft_grid": draft(asr, by_grid, sections),
        "draft_grid_pickup": draft(asr, variants["grid_pickup_0.3"], sections),
    }
    reference = e2.get("reference")
    if reference:
        ref_sections = reference_sections(reference)
        ref_words, ref_owner = [], []
        for owner, (_, ws) in enumerate(ref_sections):
            ref_words.extend(ws)
            ref_owner.extend([owner] * len(ws))
        hyp = [words(w["word"])[0] for w in asr]
        mapping = map_labels([lab for lab, _ in ref_sections], [s.label for s in sections])
        matched = [
            (r, h)
            for r, h in align(ref_words, hyp)
            if r is not None and h is not None and ref_words[r] == hyp[h]
        ]
        scored = [(mapping[ref_owner[r]], h) for r, h in matched if ref_owner[r] in mapping]
        result["reference_sections"] = [lab for lab, _ in ref_sections]
        result["label_mapping"] = {str(k): v for k, v in mapping.items()}
        result["matched_words"] = len(matched)
        result["scored_words"] = len(scored)
        result["section_accuracy"] = {
            name: round(sum(placed[h] == s for s, h in scored) / len(scored), 4) if scored else None
            for name, placed in variants.items()
        }
        chosen = variants["grid_pickup_0.3"]
        result["misplaced_grid_pickup"] = [
            {
                "word": asr[h]["word"],
                "t": asr[h]["start"],
                "placed": sections[chosen[h]].label,
                "expected": sections[s].label,
            }
            for s, h in scored
            if chosen[h] != s
        ][:25]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--e1", required=True, type=Path)
    parser.add_argument("--e2", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--config", default="auto")
    args = parser.parse_args()
    for path in sorted(args.e1.glob("*.sheetsage.json")):
        stem = path.name.removesuffix(".sheetsage.json")
        for asr_path in sorted(args.e2.glob(f"{stem}.*.asr.json")):
            e2 = read_json(asr_path)
            if args.config not in e2["runs"]:
                continue
            result = study(read_json(path), e2, args.config)
            write_json(
                args.out / f"{asr_path.name.removesuffix('.asr.json')}.{args.config}.alignment.json", result
            )
            acc = result.get("section_accuracy", {})
            print(
                f"{stem} [{e2['model']}/{args.config}]: words {result['asr_words']}, scored {result.get('scored_words')}, "
                f"bar disagreement grid/constant {result['bar_disagreement']}, accuracy {acc}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
