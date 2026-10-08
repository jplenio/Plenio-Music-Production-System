"""Song form of the lyrics against YuE2's plan in release records (study G1, aggregates only).

For every song record whose score is YuE2's plan (the Score sheet unchanged): what ``core.song_form``
would do - match, rename, assemble, or differs - and how much longer an assembled score gets. Prints
counts only; no lyrics or notes leave the records.

    <ComfyUI python> tools/studies/song_form.py <folder with *.plenio.json> [...]
"""

from __future__ import annotations

import glob
import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from plenio.core import song_form  # noqa: E402
from plenio.core.score import canonical as c  # noqa: E402


def _is_song(record: dict) -> bool:
    prompt = record.get("prompt") or {}
    return isinstance(prompt, dict) and any(
        isinstance(n, dict) and n.get("class_type") == "PlenioSongBrief" for n in prompt.values()
    )


def _plan_unchanged(record: dict) -> bool:
    for report in record.get("reports", []):
        docs = (report.get("data") or {}).get("documents") or {}
        status = (docs.get("score") or {}).get("status") if isinstance(docs.get("score"), dict) else None
        if status:
            return status == "auto"
    return False


def main(folders: list[str]) -> None:
    categories: Counter[str] = Counter()
    growth: list[float] = []
    count_diff: Counter[int] = Counter()
    fallback: Counter[str] = Counter()
    for folder in folders:
        for path in glob.glob(f"{folder}/**/*.plenio.json", recursive=True):
            record = json.loads(Path(path).read_text(encoding="utf-8"))
            if not _is_song(record) or not _plan_unchanged(record):
                continue
            score = (record["documents"].get("score") or {}).get("text") or ""
            lyrics = (record["documents"].get("lyrics") or {}).get("text") or ""
            form = song_form.match(lyrics, score)
            if form.category != song_form.SKIP and form.quality < song_form.REPLAN_BELOW:
                last = song_form.match(lyrics, score, substitute=True)
                fallback[last.category] += 1
            categories[form.category] += 1
            if form.category in (song_form.ASSEMBLE, song_form.DIFFERS):
                count_diff[len(form.lyrics_form) - len(form.plan_form)] += 1
            if form.category in (song_form.ASSEMBLE, song_form.SUBSTITUTE):
                growth.append(c.from_abc(form.score).total / c.from_abc(score).total)
    total = sum(categories.values())
    print(f"songs with YuE2's plan: {total}")
    for name in (song_form.SKIP, song_form.MATCH, song_form.ASSEMBLE, song_form.RENAME, song_form.DIFFERS):
        print(f"  {name:10} {categories[name]:4}  {categories[name] / max(1, total):5.0%}")
    print("  below rename, the last resort (without a second plan) gives:", dict(fallback))
    print("  sung sections lyrics - plan (assemble/differs):", dict(sorted(count_diff.items())))
    if growth:
        growth.sort()
        print(f"  assembled length / plan: median {growth[len(growth) // 2]:.2f}, max {growth[-1]:.2f}")


if __name__ == "__main__":
    main(sys.argv[1:] or ["D:/Daten2/ComfyUI/output/plenio"])
