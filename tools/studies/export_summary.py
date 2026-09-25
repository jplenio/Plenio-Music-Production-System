"""Collect compact study results (no audio, no full word lists) for docs/test-reports/data/.

Usage: <python> tools/studies/export_summary.py --studies <scratch studies dir> --out <data dir>
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from _common import read_json, write_json


def e1_summary(path: Path) -> dict[str, Any]:
    data = read_json(path)
    grid = dict(data["grid"])
    grid.pop("bar_starts_s", None)
    grid.pop("local_bpm", None)
    drift = grid.get("constant_tempo_drift_s", {})
    grid["constant_tempo_drift_s"] = {"max_abs": drift.get("max_abs"), "end": drift.get("end")}
    out = {
        "file": data["file"],
        "audio_seconds": data["audio_seconds"],
        "transcribe_seconds": data["transcribe_seconds"],
        "native_node_equal": data["native_node_equal"],
        "transcription": data["transcription"],
        "grid": grid,
        "structure": data["events"]["structure"],
    }
    if "plan" in data:
        out["plan"] = {k: v for k, v in data["plan"].items() if k not in ("abc", "lyrics", "style")}
    return out


def asr_summary(path: Path) -> dict[str, Any]:
    data = read_json(path)
    runs = {}
    for name, run in data["runs"].items():
        probabilities = [w["p"] for w in run["words"]]
        runs[name] = {
            "language": run["language"],
            "language_probability": run["language_probability"],
            "seconds": run["seconds"],
            "words": len(run["words"]),
            "mean_p": round(sum(probabilities) / len(probabilities), 3) if probabilities else None,
            "wer": run["wer"],
        }
    return {"file": data["file"], "model": data["model"], "runs": runs}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--studies", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    s = args.studies
    write_json(
        args.out / "e1-transcription.json",
        [e1_summary(p) for p in sorted((s / "e1").glob("*.sheetsage.json"))],
    )
    write_json(args.out / "e2-asr.json", [asr_summary(p) for p in sorted((s / "e2").glob("*.asr.json"))])
    if (s / "e2r").is_dir():
        write_json(
            args.out / "e2d-asr-vocal-regions.json",
            [asr_summary(p) for p in sorted((s / "e2r").glob("*.asr.json"))],
        )
    if (s / "e3" / "asr").is_dir():
        write_json(
            args.out / "e3-asr-takes.json",
            [asr_summary(p) for p in sorted((s / "e3" / "asr").glob("*.asr.json"))],
        )
    memory = s / "e3" / "memory" / "sheetsage-memory.json"
    if memory.exists():
        write_json(args.out / "e3-sheetsage-memory.json", read_json(memory))
    alignment = []
    for path in sorted((s / "e2b").glob("*.alignment.json")):
        data = read_json(path)
        alignment.append(
            {
                k: data.get(k)
                for k in (
                    "file",
                    "config",
                    "asr_words",
                    "scored_words",
                    "score_sections",
                    "reference_sections",
                    "section_accuracy",
                )
            }
        )
    write_json(args.out / "e2b-alignment.json", alignment)
    renders = []
    for name in ("e4-instrumental.json", "e4-timed.json", "e5-cover.json"):
        path = s / "renders" / name
        if path.exists():
            for row in read_json(path):
                renders.append({k: v for k, v in row.items() if k not in ("plan", "rendered_abc", "abc")})
    write_json(args.out / "e4-e5-renders.json", renders)
    for name in ("gemma-listen.json", "gemma-gemma_asr.json"):
        path = s / "renders" / name
        if path.exists():
            write_json(args.out / name, read_json(path))
    evaluation = s / "e3" / "evaluation.json"
    if evaluation.exists():
        write_json(args.out / "e3-evaluation.json", read_json(evaluation))
    print(f"written to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
