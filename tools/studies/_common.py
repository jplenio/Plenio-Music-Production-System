"""Shared helpers for the Phase 4A measurement scripts (study tools, not product code)."""

from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[2]
if str(PROJECT) not in sys.path:
    sys.path.insert(0, str(PROJECT))

_APOSTROPHES = str.maketrans({"’": "'", "‘": "'", "`": "'", "´": "'"})
_TAG = re.compile(r"\[[^\]]*\]")
_NON_WORD = re.compile(r"[^\w' ]+")


def comfy_root() -> Path:
    root = os.environ.get("PLENIO_COMFYUI_ROOT", "").strip()
    if not root:
        raise SystemExit("set PLENIO_COMFYUI_ROOT to the ComfyUI folder")
    return Path(root)


def import_comfy() -> None:
    """Make ComfyUI importable in a standalone process (argument parsing stays disabled)."""
    root = str(comfy_root())
    if root not in sys.path:
        sys.path.insert(0, root)


def load_audio(path: Path) -> tuple[Any, int]:
    """Decode exactly like the native LoadAudio node: (channels, samples) float32, sample rate."""
    import_comfy()
    from comfy_extras.nodes_audio import load

    return load(str(path))


def words(text: str) -> list[str]:
    """Normalised word list for WER: section tags removed, case and punctuation folded."""
    text = unicodedata.normalize("NFKC", text).translate(_APOSTROPHES).lower()
    text = _TAG.sub(" ", text)
    text = _NON_WORD.sub(" ", text.replace("-", " "))
    return [w.strip("'") for w in text.split() if w.strip("'")]


def edit_ops(reference: list[str], hypothesis: list[str]) -> dict[str, int]:
    """Levenshtein alignment counts (substitutions, deletions, insertions)."""
    rows, cols = len(reference) + 1, len(hypothesis) + 1
    cost = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        cost[i][0] = i
    for j in range(cols):
        cost[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            same = reference[i - 1] == hypothesis[j - 1]
            cost[i][j] = min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (0 if same else 1))
    i, j, sub, dele, ins = len(reference), len(hypothesis), 0, 0, 0
    while i > 0 or j > 0:
        if i > 0 and j > 0 and cost[i][j] == cost[i - 1][j - 1] + (reference[i - 1] != hypothesis[j - 1]):
            sub += reference[i - 1] != hypothesis[j - 1]
            i, j = i - 1, j - 1
        elif i > 0 and cost[i][j] == cost[i - 1][j] + 1:
            dele, i = dele + 1, i - 1
        else:
            ins, j = ins + 1, j - 1
    return {"substitutions": sub, "deletions": dele, "insertions": ins}


def align(reference: list[str], hypothesis: list[str]) -> list[tuple[int | None, int | None]]:
    """Levenshtein alignment as (reference index, hypothesis index) pairs; None marks a gap."""
    rows, cols = len(reference) + 1, len(hypothesis) + 1
    cost = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        cost[i][0] = i
    for j in range(cols):
        cost[0][j] = j
    for i in range(1, rows):
        for j in range(1, cols):
            same = reference[i - 1] == hypothesis[j - 1]
            cost[i][j] = min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (0 if same else 1))
    pairs: list[tuple[int | None, int | None]] = []
    i, j = len(reference), len(hypothesis)
    while i > 0 or j > 0:
        if i > 0 and j > 0 and cost[i][j] == cost[i - 1][j - 1] + (reference[i - 1] != hypothesis[j - 1]):
            pairs.append((i - 1, j - 1))
            i, j = i - 1, j - 1
        elif i > 0 and cost[i][j] == cost[i - 1][j] + 1:
            pairs.append((i - 1, None))
            i -= 1
        else:
            pairs.append((None, j - 1))
            j -= 1
    return pairs[::-1]


def wer(reference: str, hypothesis: str) -> dict[str, Any]:
    ref, hyp = words(reference), words(hypothesis)
    ops = edit_ops(ref, hyp)
    errors = sum(ops.values())
    return {
        "reference_words": len(ref),
        "hypothesis_words": len(hyp),
        **ops,
        "wer": round(errors / len(ref), 4) if ref else None,
    }


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))
