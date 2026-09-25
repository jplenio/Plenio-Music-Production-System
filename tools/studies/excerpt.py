"""Cut an excerpt exactly like the native TrimAudioDuration node and write it as 24-bit FLAC.

Usage: <comfy python> tools/studies/excerpt.py --start 18.33 --duration 83.02 <in> <out.flac>
"""

from __future__ import annotations

import argparse
from pathlib import Path

import soundfile
from _common import load_audio


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--start", type=float, required=True)
    parser.add_argument("--duration", type=float, required=True)
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    args = parser.parse_args()
    waveform, rate = load_audio(args.source)
    start = max(0, min(int(round(args.start * rate)), waveform.shape[-1]))
    end = max(0, min(start + int(round(args.duration * rate)), waveform.shape[-1]))
    soundfile.write(str(args.target), waveform[:, start:end].T.numpy(), rate, subtype="PCM_24")
    print(f"{args.target.name}: {(end - start) / rate:.2f} s at {rate} Hz")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
