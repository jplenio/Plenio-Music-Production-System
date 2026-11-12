"""How well the analysis track's downbeats - found from the audio alone - meet the measured bars (phase 7.3).

Reads release records with a score in a folder, read-only; measures each take's bars in memory
(``plenio.core.bars.measure``, nothing written), computes the track from the audio *without* them and reports, as an aggregate only, the share of measured
downbeats that an audio downbeat lies within 50 ms of (no titles, no file names):

    python tools/studies/analysis_downbeats.py <ComfyUI output folder> [--songs 20]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import numpy as np  # noqa: E402

from plenio.player import analysis  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--songs", type=int, default=20)
    args = parser.parse_args()
    shares, beat_shares, confidences = [], [], []
    from plenio.core import bars as bar_rules

    for record in sorted(args.folder.rglob("*.plenio.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        if len(shares) >= args.songs:
            break
        try:
            data = json.loads(record.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        audio = bar_rules.record_audio(record, data)
        score = bar_rules.record_score(data)
        if audio is None or not score.strip():
            continue
        try:
            bars = bar_rules.measure(
                audio, score, bar_rules.record_warp(data), bar_rules.record_anchors(data)
            ).get("bars")
        except Exception:  # noqa: BLE001 - a take that cannot be measured is left out
            continue
        if not bars:
            continue
        audio_name = audio.name
        mono = analysis.decode(record.with_name(str(audio_name)))
        if mono is None:
            continue
        track = analysis.analyse(mono)
        truth = np.array(bars["audio"], dtype=float)
        found = np.array(track["downbeats"], dtype=float)
        beats = np.array(track["beats"], dtype=float)
        if not len(found) or not len(truth):
            continue
        near = [float(np.min(np.abs(found - t))) for t in truth]
        near_beat = [float(np.min(np.abs(beats - t))) for t in truth]
        shares.append(float(np.mean(np.array(near) <= 0.05)))
        beat_shares.append(float(np.mean(np.array(near_beat) <= 0.05)))
        confidences.append(float(track["confidence"]))
    if not shares:
        print("no song with measured bars found")
        return 1
    print(f"songs: {len(shares)}")
    print(
        f"measured downbeats with an audio downbeat within 50 ms: mean {np.mean(shares):.1%}, median {np.median(shares):.1%}"
    )
    print(
        f"measured downbeats with an audio beat within 50 ms: mean {np.mean(beat_shares):.1%}, median {np.median(beat_shares):.1%}"
    )
    print(f"confidence: mean {np.mean(confidences):.2f}, min {np.min(confidences):.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
