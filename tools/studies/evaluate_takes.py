"""E3/E5 evaluation: detector metrics and cover identity for every rendered study take.

Combines the render rows (``render_matrix.py``), the re-transcriptions of the takes
(``sheetsage_timeline.py``), their ASR runs (``asr_whisper.py``) and, if present, the Gemma
listen answers into one table:

* vocal-presence metrics — ``score`` detector (SheetSage2 vocal notes/seconds), ``words`` detector
  (confident ASR words per minute, mean word probability), ``listen`` detector (yes answers);
* identity against the cover source — bars, key, tempo, section order, melody overlap (onset ±1/16
  and pitch class, best bar offset of -1..+1), chord-root agreement per bar;
* sung-lyrics check — WER of the take's ASR against the lyrics it was given.

Usage: <python> tools/studies/evaluate_takes.py --renders <dir> --e1 <dir> --e2 <dir> --source <e1 json> --out <json>
"""

from __future__ import annotations

import argparse
from collections import Counter
from fractions import Fraction
from pathlib import Path
from typing import Any

from _common import read_json, wer, words, write_json

from plenio.core.score import native

_ROOT = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def _items(abc: str, voices: tuple[str, ...]) -> tuple[list[tuple[int, int, int]], int]:
    """(bar, onset in 16ths within the bar, pitch class) for the sounding notes of ``voices``."""
    score = native._parse(abc)
    bars = score.voices["Vocal"].bars
    starts = [b[0] for b in bars]
    out = []
    for voice in voices:
        for start, pitch, _ in score.voices[voice].notes:
            index = max(i for i, s in enumerate(starts) if s <= start)
            out.append((index, int(round((start - starts[index]) * 4)), pitch % 12))
    return out, len(bars)


def melody_f1(reference: list[tuple[int, int, int]], take: list[tuple[int, int, int]]) -> dict[str, Any]:
    if not reference or not take:
        return {"f1": 0.0, "offset": 0}
    best = {"f1": -1.0, "offset": 0}
    for offset in (-1, 0, 1):
        pool = Counter(take)
        hits = 0
        for bar, onset, pc in reference:
            for delta in (0, -1, 1):
                key = (bar + offset, onset + delta, pc)
                if pool[key] > 0:
                    pool[key] -= 1
                    hits += 1
                    break
        precision, recall = hits / len(take), hits / len(reference)
        f1 = 2 * precision * recall / (precision + recall) if hits else 0.0
        if f1 > best["f1"]:
            best = {
                "f1": round(f1, 3),
                "offset": offset,
                "precision": round(precision, 3),
                "recall": round(recall, 3),
            }
    return best


def _root(chord: str) -> int | None:
    if not chord or chord[0].upper() not in _ROOT:
        return None
    value = _ROOT[chord[0].upper()]
    if len(chord) > 1 and chord[1] in "#b":
        value += 1 if chord[1] == "#" else -1
    return value % 12


def chord_roots(abc: str) -> list[int | None]:
    score = native._parse(abc)
    vocal = score.voices["Vocal"]
    starts = [b[0] for b in vocal.bars]
    roots: list[int | None] = [None] * len(starts)
    for start, chord in vocal.chords:
        index = max(i for i, s in enumerate(starts) if s <= Fraction(start))
        if roots[index] is None:
            roots[index] = _root(str(chord))
    return roots


def chord_agreement(reference: str, take: str) -> float | None:
    a, b = chord_roots(reference), chord_roots(take)
    best = None
    for offset in (-1, 0, 1):
        pairs = [
            (a[i], b[i + offset])
            for i in range(len(a))
            if 0 <= i + offset < len(b) and a[i] is not None and b[i + offset] is not None
        ]
        if pairs:
            share = sum(x == y for x, y in pairs) / len(pairs)
            best = share if best is None or share > best else best
    return round(best, 3) if best is not None else None


def ending(path: Path) -> dict[str, Any]:
    """Loudness of the last 2 s relative to the take's median (0.5 s RMS frames): a high ratio means the
    audio stops while music is still playing (e.g. cut at the render ceiling)."""
    import numpy as np
    import soundfile

    data, rate = soundfile.read(str(path), dtype="float32", always_2d=True)
    mono = data.mean(axis=1)
    frame = rate // 2
    rms = [float(np.sqrt(np.mean(mono[i : i + frame] ** 2))) for i in range(0, len(mono) - frame, frame)]
    median = float(np.median(rms)) if rms else 0.0
    tail = float(np.sqrt(np.mean(mono[-2 * rate :] ** 2))) if len(mono) > 2 * rate else 0.0
    ratio = tail / median if median > 0 else 0.0
    return {"tail_to_median": round(ratio, 2), "abrupt": ratio > 0.5, "seconds": round(len(mono) / rate, 2)}


def evaluate(
    row: dict[str, Any],
    e1: Path,
    e2: Path,
    source: dict[str, Any] | None,
    listen: dict[str, Any],
    takes: Path | None = None,
) -> dict[str, Any]:
    stem = Path(row["files"][0]).stem if row.get("files") else None
    out: dict[str, Any] = {
        "name": row["name"],
        "condition": row["condition"],
        "seed": row["seed"],
        "lora": row["lora"],
        "render_seconds": row["render"]["execution_seconds"],
        "score_seconds": row.get("score_seconds"),
        "ceiling_seconds": row.get("native_seconds"),
    }
    if takes and stem and (takes / "studies" / f"{stem}.flac").exists():
        out["ending"] = ending(takes / "studies" / f"{stem}.flac")
    tr_path = e1 / f"{stem}.sheetsage.json"
    if tr_path.exists():
        tr = read_json(tr_path)
        vocal = tr["events"]["vocal_notes"]
        minutes = tr["audio_seconds"] / 60
        out["take_seconds"] = tr["audio_seconds"]
        out["score_detector"] = {
            "vocal_notes": tr["transcription"]["voices"].get("Vocal", {}).get("notes", 0),
            "vocal_seconds": round(sum(end - start for start, end, _ in vocal), 1),
            "vocal_notes_per_min": round(len(vocal) / minutes, 1),
        }
        if source:
            reference, _ = _items(source["abc"], ("Vocal",))
            take_items, take_bars = _items(tr["abc"], ("Vocal", "Ins"))
            out["identity"] = {
                "bars": [len(native.analyze(source["abc"]).bars), take_bars],
                "key": [
                    source["transcription"]["header"].get("key"),
                    tr["transcription"]["header"].get("key"),
                ],
                "tempo": [
                    source["transcription"]["header"].get("tempo_bpm"),
                    tr["transcription"]["header"].get("tempo_bpm"),
                ],
                "sections": [s[0] for s in tr["transcription"]["sections"]],
                "melody_vs_source_vocal": melody_f1(reference, take_items),
                "chord_roots_vs_source": chord_agreement(source["abc"], tr["abc"]),
            }
    asr_path = e2 / f"{stem}.whisper-large-v3.asr.json"
    if asr_path.exists():
        asr = read_json(asr_path)
        run = asr["runs"].get("auto") or next(iter(asr["runs"].values()))
        minutes = max((out.get("take_seconds") or 60) / 60, 1e-6)
        ws = [w for w in run["words"] if words(w["word"])]
        out["words_detector"] = {
            "words": len(ws),
            "confident_per_min": round(sum(w["p"] >= 0.5 for w in ws) / minutes, 1),
            "mean_p": round(sum(w["p"] for w in ws) / len(ws), 3) if ws else None,
            "language": [run["language"], run["language_probability"]],
        }
        if words(row.get("lyrics", "")):
            out["sung_lyrics_wer"] = wer(row["lyrics"], run["text"])
    key = f"studies/{stem}.flac [output]" if stem else None
    if key and key in listen:
        answers = [a[0].strip().lower() if a else "" for a in listen[key]["answers"]]
        out["listen_detector"] = {
            "yes": sum(a.startswith("yes") for a in answers),
            "windows": len(answers),
            "answers": answers,
        }
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--renders", required=True, type=Path)
    parser.add_argument("--e1", required=True, type=Path)
    parser.add_argument("--e2", required=True, type=Path)
    parser.add_argument("--source", type=Path)
    parser.add_argument("--takes", type=Path, help="ComfyUI output folder containing studies/")
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    source = read_json(args.source) if args.source else None
    listen_path = args.renders / "gemma-listen.json"
    listen = {row["file"]: row for row in read_json(listen_path)} if listen_path.exists() else {}
    table = []
    for name in ("e4-instrumental.json", "e4-timed.json", "e5-cover.json"):
        path = args.renders / name
        if not path.exists():
            continue
        for row in read_json(path):
            table.append(
                evaluate(row, args.e1, args.e2, source if name.startswith("e5") else None, listen, args.takes)
            )
    write_json(args.out, table)
    for t in table:
        sd, wd, ld = t.get("score_detector", {}), t.get("words_detector", {}), t.get("listen_detector", {})
        ident = t.get("identity", {})
        print(
            f"{t['name']:24} take {t.get('take_seconds')}/{t['score_seconds']} s | vocal notes {sd.get('vocal_notes')} "
            f"({sd.get('vocal_seconds')} s) | words {wd.get('words')} conf/min {wd.get('confident_per_min')} p {wd.get('mean_p')} "
            f"| listen {ld.get('yes')}/{ld.get('windows')} | wer {t.get('sung_lyrics_wer', {}).get('wer')} "
            f"| melody {ident.get('melody_vs_source_vocal', {}).get('f1')} chords {ident.get('chord_roots_vs_source')} "
            f"bars {ident.get('bars')} key {ident.get('key')} tempo {ident.get('tempo')} "
            f"| ending {t.get('ending', {}).get('tail_to_median')}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
