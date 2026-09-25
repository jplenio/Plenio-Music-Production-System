"""Print the facts of an exported release: audio properties, loudness proxies and the record summary.

Usage: <python> tools/inspect_release.py <file.flac>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile


def main() -> int:
    flac = Path(sys.argv[1])
    info = soundfile.info(str(flac))
    data, rate = soundfile.read(str(flac), dtype="float32", always_2d=True)
    mono = data.mean(axis=1)
    frame = rate // 2
    rms = [float(np.sqrt(np.mean(mono[i : i + frame] ** 2))) for i in range(0, len(mono) - frame, frame)]
    silent = sum(1 for value in rms if value < 1e-3)
    print(f"{flac.name}: {info.subtype}, {rate} Hz, {info.channels} ch, {info.frames / rate:.2f} s")
    print(
        f"peak {float(np.max(np.abs(data))):.3f}, rms {float(np.sqrt(np.mean(mono**2))):.4f}, "
        f"silent half-seconds {silent}/{len(rms)}"
    )
    record_path = flac.with_suffix(".plenio.json")
    if record_path.exists():
        record = json.loads(record_path.read_text(encoding="utf-8"))
        print("record:", record["schema"], "| title:", record["title"], "| licences:", record["licences"])
        for kind, doc in record["documents"].items():
            text = doc["text"].replace("\n", " / ")
            print(
                f"  {kind} [{doc['state']}/{doc['status']}]: {text[:160]}{'...' if len(text) > 160 else ''}"
            )
        for report in record["reports"]:
            print(f"  report {report['kind']}: {report['status']} - {report['summary']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
