"""Study A1: how well local LLMs plan an arrangement - raw ABC against a JSON plan and a note-name motif.

Four ways to get an instrument line or a section plan from a writer model, measured on real YuE2 scores:

- ``abc``: the model writes the Ins voice of one section directly in ABC (bars, note lengths, octaves);
  valid when Plenio's parser reads it, every bar has the exact length and the bar count is right;
- ``plan``: the arrangement prompt of ``plenio.core.arrangement`` (JSON section plan), unconstrained;
- ``plan+schema``: the same request held to its JSON schema (llama.cpp constrained decoding);
- ``motif``: a one- or two-bar figure as note names with lengths (``{"note": "E4", "beats": 1}``), which
  Plenio moves onto the section's chords and writes as ABC itself.

Every model runs in its own llama.cpp server (the runtime Plenio uses for GGUF files), one after the other,
with thinking off and the same seeds. The scores are read from release records (read-only; nothing of them
is written out except counts). Results: JSON lines per call plus a summary table.

    python tools/studies/arrangement_llm.py --records <output/plenio> --out <folder> [--models a.gguf b.gguf]
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import statistics
import sys
import time
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[2]
if str(PROJECT) not in sys.path:
    sys.path.insert(0, str(PROJECT))

from plenio.core import llm  # noqa: E402
from plenio.core.arrangement import (  # noqa: E402
    ModeLibrary,
    arrange,
    plan,
    policy,
    prompt,
    schema,
    summarize,
)
from plenio.core.arrangement import lines as line_tools  # noqa: E402
from plenio.core.arrangement.plan import (  # noqa: E402
    PlanError,
    _json_object,
    _motif,
    chord_at,
    section_ranges,
)
from plenio.core.errors import PlenioError  # noqa: E402
from plenio.core.llm.runtime import LocalServer  # noqa: E402
from plenio.core.score import canonical as c  # noqa: E402
from plenio.core.score import native  # noqa: E402

TASKS = ("abc", "plan", "plan+schema", "motif")
MODES = ("standard", "varied")
SEEDS = (1, 2)
CONTEXT = 8192
TEMPERATURE = 0.7


@dataclass(frozen=True)
class Sample:
    id: str
    kind: str
    """``song``, ``instrumental`` or ``cover``."""
    abc: str
    style: str
    lyrics: str
    sections: int
    bars: int


# --- the scores ----------------------------------------------------------------------------------


def _text(doc: Any) -> str:
    return str(doc.get("text") or "") if isinstance(doc, dict) else str(doc or "")


def load_samples(records: Path, per_kind: int) -> list[Sample]:
    """Real scores from release records: sung songs, instrumentals and covers, 3-12 sections each."""
    found: dict[str, list[Sample]] = {"song": [], "instrumental": [], "cover": []}
    seen: set[str] = set()
    for path in sorted(records.rglob("*.plenio.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        docs = data.get("documents") or {}
        abc, style, lyrics = _text(docs.get("score")), _text(docs.get("style")), _text(docs.get("lyrics"))
        if not abc.strip() or abc in seen:
            continue
        try:
            score = c.from_abc(abc)
        except PlenioError:
            continue
        sections = len(section_ranges(score))
        if not 3 <= sections <= 12 or score.measure_count > 160:
            continue
        kinds = {r.get("kind") for r in data.get("reports") or [] if isinstance(r, dict)}
        instrumental = not score.vocal
        kind = "cover" if "transcribe_score" in kinds else "instrumental" if instrumental else "song"
        if len(found[kind]) >= per_kind:
            continue
        seen.add(abc)
        sample_id = f"{kind[0].upper()}{len(found[kind]) + 1}"
        found[kind].append(Sample(sample_id, kind, abc, style, lyrics, sections, score.measure_count))
    return [s for kind in ("song", "instrumental", "cover") for s in found[kind]]


def melody(sample: Sample) -> str:
    score = c.from_abc(sample.abc)
    if score.vocal:
        return "vocal"
    return "instrument" if score.ins else "none"


# --- the requests --------------------------------------------------------------------------------


def plan_request(sample: Sample, mode_name: str, library: ModeLibrary) -> tuple[str, dict[str, Any], Any]:
    rules = policy(
        library.by_name(mode_name),
        kind="cover" if sample.kind == "cover" else "song",
        closeness=60,
        melody=melody(sample),
    )
    summary = summarize(c.from_abc(sample.abc), melody=rules.melody)
    text = prompt(summary, rules, brief_text=f"Style: {sample.style}", genre="", lyrics=sample.lyrics)
    return text, schema(rules, len(summary.sections)), rules


def _section_facts(score: c.Score, index: int) -> tuple[str, int, int, list[str]]:
    label, first, end = section_ranges(score)[index]
    chords = [chord_at(score, score.starts[m]) or "-" for m in range(first, end)]
    return label, first, end, chords


def _target_section(score: c.Score) -> int:
    """The longest section with chords (a line needs them)."""
    ranges = section_ranges(score)
    best = max(
        range(len(ranges)),
        key=lambda i: (
            any(_section_facts(score, i)[3][j] != "-" for j in range(ranges[i][2] - ranges[i][1])),
            ranges[i][2] - ranges[i][1],
        ),
    )
    return best


def abc_request(sample: Sample) -> tuple[str, int]:
    score = c.from_abc(sample.abc)
    index = _target_section(score)
    label, first, end, chords = _section_facts(score, index)
    meter = score.meters[first]
    unit = f"1/{score.unit.denominator}" if score.unit.numerator == 1 else str(score.unit)
    per_bar = score.lengths[first]
    text = "\n".join(
        [
            "You are an arranger. Write the instrument line (the second voice, an accompaniment line) for one "
            "section of a song in ABC notation.",
            f"Key {score.key_at(score.starts[first])}, meter {meter[0]}/{meter[1]}, default note length L:{unit} "
            f"(so one bar is exactly {per_bar} units of L), tempo {score.tempo} BPM.",
            f"Section '{label}': {end - first} bars, chords per bar: {' | '.join(chords)}.",
            "Rules: notes in ABC (C D E F G A B c d e f g a b, sharps ^, flats _, octave marks ' and ,), lengths "
            "as multiples of L (e.g. E2, G4, z2 for a rest), bars separated by |. Every bar must be exactly "
            f"{per_bar} units long. Write exactly {end - first} bars and nothing else - no header, no chords, "
            "no comments.",
        ]
    )
    return text, index


def motif_request(sample: Sample) -> tuple[str, int]:
    score = c.from_abc(sample.abc)
    index = _target_section(score)
    label, first, end, chords = _section_facts(score, index)
    meter = score.meters[first]
    text = "\n".join(
        [
            "You are an arranger. Invent a short motif for the instrument line of one section of a song.",
            f"Key {score.key_at(score.starts[first])}, meter {meter[0]}/{meter[1]}, tempo {score.tempo} BPM.",
            f"Section '{label}': {end - first} bars, chords per bar: {' | '.join(chords)}.",
            "Answer only with JSON: a list of notes for one or two bars, each "
            '{"note": "E4", "beats": 1} - a note name with octave (C4 = middle C, sharps #, flats b) or "rest", '
            "and its length in quarter-note beats. The motif is moved onto every chord of the section, so "
            f"write it over the section's first chord ({next((ch for ch in chords if ch != '-'), 'the key')}).",
        ]
    )
    return text, index


# --- the measures --------------------------------------------------------------------------------


def chord_fit(score: c.Score, notes: Sequence[tuple[int, int, int]], first: int, end: int) -> float | None:
    """Share of the line's notes on strong beats that belong to the bar's chord."""
    hits = total = 0
    for measure in range(first, end):
        chord = chord_at(score, score.starts[measure])
        if not chord:
            continue
        classes = set(line_tools.chord_classes(chord))
        for position in plan.strong_positions(
            score.starts[measure], score.lengths[measure], score.meters[measure]
        ):
            sounding = [p for onset, length, p in notes if onset <= position < onset + length]
            if sounding:
                total += 1
                hits += sounding[0] % 12 in classes
    return hits / total if total else None


_BAR_JUNK = re.compile(r"^\s*(?:[A-Za-z]:.*|%.*)$")


def measure_abc(sample: Sample, answer: str, index: int) -> dict[str, Any]:
    score = c.from_abc(sample.abc)
    label, first, end, _chords = _section_facts(score, index)
    body = "\n".join(line for line in answer.replace("```", "\n").splitlines() if not _BAR_JUNK.match(line))
    body = re.sub(r'"[^"]*"', "", body)  # chord symbols the model added anyway
    bars = [b for b in re.split(r"\|+", body.replace(":", "")) if b.strip()]
    result: dict[str, Any] = {"bars_written": len(bars), "bars_wanted": end - first}
    meter = score.meters[first]
    unit = f"1/{score.unit.denominator}" if score.unit.numerator == 1 else str(score.unit)
    header = (
        f"X:1\nT:\nM:{meter[0]}/{meter[1]}\nL:{unit}\nQ:1/4={score.tempo}\n"
        'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"\n'
        'V: Ins clef=treble name="Ins Melody" snm="Inst."\n'
        f"K:{score.key_at(score.starts[first])}\n% {label}\n"
    )
    # YuE2's dialect interleaves the voices in groups of at most 4 bars; the study does that for the model
    voice = ""
    for start in range(0, max(1, len(bars)), 4):
        group = [bar.strip() for bar in bars[start : start + 4]] or [f"z{score.lengths[first]}"]
        rests = "|".join([f"z{score.lengths[first]}"] * len(group))
        voice += f"V: Vocal\n{rests}|\nV: Ins\n" + "|".join(group) + "|\n"
    try:
        fragment = c.from_abc(header + voice)
        result["parses"] = True
        result["exact_bars"] = len(bars) == end - first and all(
            length == score.lengths[first] for length in fragment.lengths
        )
        notes = [(n.onset + score.starts[first], n.duration, n.pitch) for n in fragment.ins]
        result["chord_fit"] = chord_fit(score, notes, first, end)
    except PlenioError as error:
        result["parses"] = False
        result["exact_bars"] = False
        result["error"] = str(error).splitlines()[0][:160]
    try:
        analysis = native.analyze(header + voice)
        result["native_ok"] = analysis.ok
        problems = [d.message for d in analysis.diagnostics if d.severity == "error"]
        if problems:
            result["problem"] = problems[0][:160]  # the parser's own reason (a bar too long, a bad token)
    except Exception:  # noqa: BLE001 - a study: any failure counts as not readable
        result["native_ok"] = False
    result["valid"] = bool(result.get("parses") and result.get("exact_bars") and result.get("native_ok"))
    return result


def measure_motif(sample: Sample, answer: str, index: int) -> dict[str, Any]:
    score = c.from_abc(sample.abc)
    label, first, end, chords = _section_facts(score, index)
    dropped: list[str] = []
    try:
        data = (
            _json_object('{"m": ' + answer[answer.find("[") : answer.rfind("]") + 1] + "}")["m"]
            if "[" in answer
            else None
        )
    except (PlanError, KeyError, TypeError):
        data = None
    figure = _motif(data, dropped.append, "motif") if isinstance(data, list) else ()
    result: dict[str, Any] = {"readable": bool(figure), "events": len(figure)}
    if figure:
        bars = line_tools.bars_of(
            score, first, end, [chord_at(score, score.starts[m]) for m in range(first, end)]
        )
        notes = line_tools.motif(bars, figure, score.units_per_quarter)
        beats = sum(float(b) for _, b in figure)
        quarter_per_bar = score.lengths[first] / score.units_per_quarter
        result["fits_bars"] = any(abs(beats - k * quarter_per_bar) < 1e-6 for k in (1, 2))
        result["chord_fit"] = chord_fit(score, notes, first, end)
        result["valid"] = True  # Plenio writes the notes: always valid ABC
    else:
        result["valid"] = False
    return result


def measure_plan(sample: Sample, answer: str, rules: Any, seed: int) -> dict[str, Any]:
    strict = True
    try:
        json.loads(re.sub(r"```(?:json)?", "", answer).strip())
    except ValueError:
        strict = False
    result: dict[str, Any] = {"strict_json": strict}
    try:
        planned = plan.read_plan(answer, rules, len(section_ranges(c.from_abc(sample.abc))))
        result["readable"] = True
        result["dropped"] = len(planned.dropped)
        result["corrected"] = len(planned.notes) - len(planned.dropped)
    except PlanError as error:
        result["readable"] = False
        result["error"] = str(error)
    arranged = arrange(sample.abc, answer, rules, seed=seed)
    result["status"] = arranged.status
    result["sections_changed"] = sum(1 for s in arranged.sections if s.applied)
    result["clashes_kept"] = sum(1 for s in arranged.sections for k in s.kept if "clashes" in k)
    result["valid"] = arranged.status in ("applied", "partial", "unchanged")
    return result


# --- the run -------------------------------------------------------------------------------------


def run_model(
    path: Path, samples: Sequence[Sample], out: Path, runtime: llm.Runtime, tasks: Sequence[str] = TASKS
) -> None:
    library = ModeLibrary(PROJECT / "resources" / "arrangement")
    server = LocalServer(runtime, path, context=CONTEXT)
    started = time.monotonic()
    try:
        endpoint = server.start()
    except PlenioError as error:
        with out.open("a", encoding="utf-8") as sink:
            sink.write(json.dumps({"model": path.name, "load_error": str(error)[:300]}) + "\n")
        return
    load_seconds = time.monotonic() - started
    try:
        for sample in samples:
            for seed in SEEDS:
                mode_name = MODES[(seed + len(sample.id)) % len(MODES)]
                for task in tasks:
                    settings = llm.Settings(
                        max_tokens=2048, temperature=TEMPERATURE, seed=seed, context=CONTEXT
                    )
                    if task in ("plan", "plan+schema"):
                        text, answer_schema, rules = plan_request(sample, mode_name, library)
                        if task == "plan+schema":
                            settings = llm.Settings(**{**settings.__dict__, "schema": answer_schema})
                    elif task == "abc":
                        text, index = abc_request(sample)
                    else:
                        text, index = motif_request(sample)
                    record: dict[str, Any] = {
                        "model": path.name,
                        "sample": sample.id,
                        "kind": sample.kind,
                        "sections": sample.sections,
                        "bars": sample.bars,
                        "task": task,
                        "seed": seed,
                        "mode": mode_name if task.startswith("plan") else "",
                        "load_seconds": round(load_seconds, 1),
                    }
                    try:
                        answer = llm.chat(endpoint, path.name, text, settings)
                    except PlenioError as error:
                        record.update(error=str(error).splitlines()[0][:200], valid=False)
                    else:
                        record.update(
                            answer=answer.text,  # the raw answer, for reading it again with a changed reader
                            seconds=round(answer.seconds, 1),
                            tokens=answer.completion_tokens,
                            constrained=answer.constrained,
                        )
                        if task in ("plan", "plan+schema"):
                            record.update(measure_plan(sample, answer.text, rules, seed))
                        elif task == "abc":
                            record.update(measure_abc(sample, answer.text, index))
                        else:
                            record.update(measure_motif(sample, answer.text, index))
                    with out.open("a", encoding="utf-8") as sink:
                        sink.write(json.dumps(record, ensure_ascii=False) + "\n")
                    print(
                        f"{path.name[:28]:28} {sample.id} {task:12} seed {seed}: "
                        f"{'valid' if record.get('valid') else 'INVALID'} {record.get('status', '')}",
                        flush=True,
                    )
    finally:
        server.stop()


def summary(results: Path) -> str:
    rows = [json.loads(line) for line in results.read_text(encoding="utf-8").splitlines() if line.strip()]
    rows = [r for r in rows if "task" in r]
    models = sorted(
        {r["model"] for r in rows}, key=lambda m: min(i for i, r in enumerate(rows) if r["model"] == m)
    )
    lines = [
        "| model | task | n | valid | details | chord fit (strong beats) | s per call |",
        "|---|---|---|---|---|---|---|",
    ]
    for model in models:
        for task in TASKS:
            group = [r for r in rows if r["model"] == model and r["task"] == task]
            if not group:
                continue
            valid = sum(1 for r in group if r.get("valid"))
            fits = [r["chord_fit"] for r in group if isinstance(r.get("chord_fit"), float)]
            seconds = [r["seconds"] for r in group if isinstance(r.get("seconds"), float)]
            if task.startswith("plan"):
                strict = sum(1 for r in group if r.get("strict_json"))
                statuses = {
                    s: sum(1 for r in group if r.get("status") == s)
                    for s in ("applied", "partial", "fallback")
                }
                dropped = statistics.mean([r.get("dropped", 0) for r in group if r.get("readable")] or [0])
                details = (
                    f"strict JSON {strict}/{len(group)}; applied {statuses['applied']}, partial {statuses['partial']}, "
                    f"fallback {statuses['fallback']}; dropped parts {dropped:.1f}"
                )
            elif task == "abc":
                parses = sum(1 for r in group if r.get("parses"))
                exact = sum(1 for r in group if r.get("exact_bars"))
                details = f"parses {parses}/{len(group)}, exact bars {exact}/{len(group)}"
            else:
                fits_bars = sum(1 for r in group if r.get("fits_bars"))
                details = f"readable {valid}/{len(group)}, 1-2 whole bars {fits_bars}/{len(group)}"
            lines.append(
                f"| {model} | {task} | {len(group)} | {valid}/{len(group)} | {details} | "
                f"{(statistics.mean(fits) if fits else float('nan')):.2f} | "
                f"{(statistics.mean(seconds) if seconds else float('nan')):.1f} |"
            )
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--records", type=Path, required=True, help="folder with *.plenio.json release records"
    )
    parser.add_argument("--out", type=Path, required=True, help="folder for results.jsonl and summary.md")
    parser.add_argument(
        "--models", nargs="*", type=Path, default=[], help="GGUF files (default: none, summary only)"
    )
    parser.add_argument("--per-kind", type=int, default=2, help="scores per kind (song, instrumental, cover)")
    parser.add_argument("--tasks", nargs="*", choices=TASKS, default=list(TASKS), help="the tasks to run")
    args = parser.parse_args(argv)
    args.out.mkdir(parents=True, exist_ok=True)
    results = args.out / "results.jsonl"
    if args.models:
        samples = load_samples(args.records, args.per_kind)
        print("samples:", ", ".join(f"{s.id} {s.kind} {s.sections} sections {s.bars} bars" for s in samples))
        runtimes = llm.find_runtimes(os.environ, Path.home())
        runtimes = [r for r in runtimes if "llama-server" in r.name] or runtimes
        if not runtimes:
            raise SystemExit("no llama.cpp runtime found")
        random.seed(0)
        for model_path in args.models:
            run_model(model_path, samples, results, runtimes[0], args.tasks)
    if results.is_file():
        table = summary(results)
        (args.out / "summary.md").write_text(table + "\n", encoding="utf-8")
        print(table)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
