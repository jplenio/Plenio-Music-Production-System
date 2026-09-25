"""Q-C6: how long a cover can be — exact YuE2 context budget for transcribed scores.

Reads only the tokenizer tensor from the YuE2 checkpoint (the model is not loaded) and computes,
with Plenio's exact budget arithmetic (AS-14), how many seconds of music remain for a given
style, lyrics and score — for the full-mode transcription and its chord-free (melody) variant.

Usage:
  <comfy python> tools/studies/cover_budget.py --models F:/ComfyUI/models <e1 json>...
"""

from __future__ import annotations

import argparse
from pathlib import Path

from _common import import_comfy, read_json

from plenio.core.engines import yue2
from plenio.core.score import native

STYLE = "English, acoustic folk pop, fingerpicked acoustic guitar, warm piano, upright bass, brushed drums, soft female vocal, 121 BPM"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--models", required=True, type=Path)
    parser.add_argument("files", nargs="+", type=Path)
    args = parser.parse_args()
    import_comfy()
    import comfy.text_encoders.yue2 as encoder
    from safetensors import safe_open

    from plenio.comfy.host import _YuE2Tokenizer

    with safe_open(
        str(args.models / "checkpoints" / "yue2_3b_int8_convrot.safetensors"), framework="pt"
    ) as handle:
        key = next(k for k in handle.keys() if k.endswith("yue2_tokenizer_json"))
        tokenizer = _YuE2Tokenizer(
            encoder.YuE2Tokenizer(tokenizer_data={"yue2_tokenizer_json": handle.get_tensor(key)})
        )
    for path in args.files:
        data = read_json(path)
        full = data["abc"]
        melody = native.strip_chords(full).abc
        lyrics = ""
        if "plan" in data:
            lyrics = data["plan"]["lyrics"]
        for name, abc in (("full", full), ("melody", melody)):
            analysis = native.analyze(abc)
            budget = yue2.budget(tokenizer, STYLE, lyrics or native.section_tags(abc), abc)
            print(
                f"{data['file']} [{name}]: {len(analysis.bars)} bars, score {analysis.duration_s:.1f} s, "
                f"abc {budget.abc_tokens} tokens ({budget.abc_tokens / max(len(analysis.bars), 1):.0f}/bar), "
                f"prefix {budget.prefix_tokens}, music budget {budget.music_seconds:.1f} s, "
                f"ceiling {yue2.render_ceiling(analysis.duration_s):.1f} s -> "
                f"{'fits' if budget.music_seconds >= analysis.duration_s else 'TOO LONG'}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
