"""Study A2: new cover lyrics against their melody with local LLMs - the draft, two repair rounds, the last step.

For real cover scores (release records, read only) every model writes new English lyrics with Write Song's
cover prompt (``writing.compose``; free answer, as the native writer), then Plenio runs what *Fit Lyrics*
does: the check against the Vocal phrases, at most two repair requests held to their JSON schema, the merge
and the last step (contractions). Measured per stage: lines that fit, the per-line deviation (syllables
against notes), how many lines went back, how many of them came back fitting, how much of a rewritten line's
words stayed, the writer's seconds. Every model runs in its own llama.cpp server, one after the other, thinking
off. Nothing of the records or the lyrics is written out - only counts and means.

    python tools/studies/lyrics_fit_llm.py --records <output/plenio> --out <folder> --models a.gguf b.gguf
"""

from __future__ import annotations

import argparse
import json
import os
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

from plenio.core import llm, lyrics_fit, syllables  # noqa: E402
from plenio.core import lyrics as lyrics_rules  # noqa: E402
from plenio.core.brief import build_cover_brief  # noqa: E402
from plenio.core.engines import EngineInfo, yue2  # noqa: E402
from plenio.core.errors import PlenioError  # noqa: E402
from plenio.core.llm.runtime import LocalServer  # noqa: E402
from plenio.core.score import canonical as c  # noqa: E402
from plenio.core.score import native  # noqa: E402
from plenio.core.writing import compose, parse_draft  # noqa: E402

ENGINE = EngineInfo(yue2.ENGINE_ID, yue2.RULES_VERSION, yue2.capabilities())
SEEDS = (1, 2)
CONTEXT = 12288
TEMPERATURE = 0.8
REPAIR_TEMPERATURE = 0.7
THEMES = (
    "a night drive through a sleeping city",
    "leaving the house where you grew up",
    "a friend who moved far away",
    "the first warm day after a long winter",
)
STAGES = ("draft", "round 1", "round 2", "last step")


@dataclass(frozen=True)
class Sample:
    id: str
    abc: str
    tags: tuple[str, ...]
    tempo: int
    phrasing: tuple[dict[str, Any], ...]
    lines: int
    """Sung phrases (the lines the lyrics should have)."""


def load_samples(records: Path, count: int) -> list[Sample]:
    """Sung cover scores from release records: 2-12 sections, 12-120 phrases, each source once."""
    found: list[Sample] = []
    seen: set[str] = set()
    for path in sorted(records.rglob("*.plenio.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        kinds = {r.get("kind") for r in data.get("reports") or [] if isinstance(r, dict)}
        doc = (data.get("documents") or {}).get("score") or {}
        abc = str(doc.get("text") or "") if isinstance(doc, dict) else ""
        if "transcribe_score" not in kinds or not abc.strip() or abc in seen:
            continue
        try:
            analysis = native.validate(abc)
            phrasing = native.phrasing(abc)
            c.from_abc(abc)
        except PlenioError:
            continue
        phrases = sum(len(p["phrases"]) for p in phrasing)
        if not 2 <= len(phrasing) <= 12 or not 12 <= phrases <= 120:
            continue
        shape = json.dumps([(p["tag"], p["phrases"]) for p in phrasing])
        if shape in seen:  # the same source covered again
            continue
        seen.update((abc, shape))
        tempo = int(analysis.header.get("tempo_bpm") or 100)
        tags = tuple(s.tag for s in analysis.sections)
        found.append(Sample(f"C{len(found) + 1}", abc, tags, tempo, tuple(phrasing), phrases))
        if len(found) >= count:
            break
    return found


def _deviation(fit: lyrics_fit.Fit) -> float | None:
    values = [
        abs(line.syllables - line.notes) / max(1, line.notes)
        for s in fit.sections
        if not s.rewrite
        for line in s.lines
        if not line.shared
    ]
    return statistics.median(values) if values else None


def _words(text: str) -> set[str]:
    return {w for w in re.findall(r"[a-z']+", text.lower()) if len(w) > 3}


def _kept(before: str, after: str, asked: Sequence[tuple[int, int]]) -> list[float]:
    """Per rewritten line: the share of the old line's content words still in the new one."""
    old = lyrics_rules.parse_lyrics(before).sections
    new = lyrics_rules.parse_lyrics(after).sections
    shares = []
    for section, line in asked:
        if not line or section > min(len(old), len(new)):
            continue
        a, b = old[section - 1].lines, new[section - 1].lines
        if line <= min(len(a), len(b)) and a[line - 1] != b[line - 1]:
            words = _words(a[line - 1])
            if words:
                shares.append(len(words & _words(b[line - 1])) / len(words))
    return shares


def run_one(endpoint: str, model: str, sample: Sample, seed: int, free: bool = False) -> dict[str, Any]:
    theme = THEMES[(seed + int(sample.id[1:])) % len(THEMES)]
    brief = build_cover_brief({"genre": "pop", "vocals": "new", "language": "English", "theme": theme})
    prompt, request = compose(
        brief,
        ENGINE,
        score_sections=list(sample.tags),
        phrasing=list(sample.phrasing),
        score_tempo=sample.tempo,
    )
    record: dict[str, Any] = {
        "model": model,
        "variant": "free" if free else "schema",
        "sample": sample.id,
        "seed": seed,
        "phrases": sample.lines,
    }
    settings = llm.Settings(max_tokens=3072, temperature=TEMPERATURE, seed=seed, context=CONTEXT)
    try:
        answer = llm.chat(endpoint, model, prompt, settings)
        draft = parse_draft(answer.text, request)
    except PlenioError as error:
        record["error"] = str(error).splitlines()[0][:200]
        return record
    seconds = [answer.seconds]
    text, conformed = lyrics_fit.conform(draft.lyrics, sample.phrasing)
    record["form_conformed"] = bool(conformed)
    fit = lyrics_fit.check(text, sample.phrasing, language="English")
    stages = {"draft": fit}
    asked_total, fixed_total, kept_shares = 0, 0, []
    for round_name in ("round 1", "round 2"):
        repair = lyrics_fit.request(text, fit, language="English", theme=theme)
        if repair is None:
            stages[round_name] = fit
            continue
        asked_total += len(repair.asked)
        repair_settings = llm.Settings(
            max_tokens=6144,
            temperature=REPAIR_TEMPERATURE,
            seed=seed,
            context=CONTEXT,
            schema=None if free else repair.schema,
        )
        try:
            reply = llm.chat(endpoint, model, repair.prompt, repair_settings)
        except PlenioError as error:
            record[f"{round_name} error"] = str(error).splitlines()[0][:200]
            stages[round_name] = fit
            continue
        seconds.append(reply.seconds)
        merged, _notes = lyrics_fit.merge(text, reply.text, repair.asked, fit)
        kept_shares += _kept(text, merged, repair.asked)
        after = lyrics_fit.check(merged, sample.phrasing, language="English")
        fitting = {(line.section, line.line) for s in after.sections for line in s.lines if line.fits}
        fixed_total += sum(1 for item in repair.asked if item in fitting)
        text, fit = merged, after
        stages[round_name] = fit
    shortened, _notes = lyrics_fit.shorten(text, fit)
    stages["last step"] = lyrics_fit.check(shortened, sample.phrasing, language="English")
    for name, stage in stages.items():
        good, checked = stage.counts
        record[name] = {
            "fitting": good,
            "lines": checked,
            "fits": stage.fits,
            "deviation": _deviation(stage),
            "rewrite_sections": sum(1 for s in stage.sections if s.rewrite),
        }
    record.update(
        asked=asked_total,
        fixed=fixed_total,
        kept_words=statistics.mean(kept_shares) if kept_shares else None,
        writer_calls=len(seconds),
        seconds=round(sum(seconds), 1),
        draft_lines=sum(len(s.lines) for s in lyrics_rules.parse_lyrics(draft.lyrics).sections),
        syllable_language=syllables.guess_language(draft.lyrics) or "?",
    )
    return record


def run_model(
    path: Path, samples: Sequence[Sample], out: Path, runtime: llm.Runtime, free: bool = False
) -> None:
    server = LocalServer(runtime, path, context=CONTEXT)
    try:
        endpoint = server.start()
    except PlenioError as error:
        with out.open("a", encoding="utf-8") as sink:
            sink.write(json.dumps({"model": path.name, "load_error": str(error)[:300]}) + "\n")
        return
    try:
        for sample in samples:
            for seed in SEEDS:
                started = time.monotonic()
                record = run_one(endpoint, path.name, sample, seed, free)
                record["wall_seconds"] = round(time.monotonic() - started, 1)
                with out.open("a", encoding="utf-8") as sink:
                    sink.write(json.dumps(record, ensure_ascii=False) + "\n")
                stages = " -> ".join(
                    f"{record[s]['fitting']}/{record[s]['lines']}"
                    for s in STAGES
                    if isinstance(record.get(s), dict)
                )
                print(
                    f"{path.name[:30]:30} {sample.id} seed {seed}: {stages or record.get('error')}",
                    flush=True,
                )
    finally:
        server.stop()


def summary(results: Path) -> str:
    rows = [json.loads(line) for line in results.read_text(encoding="utf-8").splitlines() if line.strip()]
    rows = [r for r in rows if "sample" in r]
    models = list(dict.fromkeys((r["model"], r.get("variant", "schema")) for r in rows))
    lines = [
        "| model | n | lines fitting: draft | round 1 | round 2 | last step | deviation draft -> end | sent back "
        "| came back fitting | words kept | writer calls | s per song |",
        "|---|---|---|---|---|---|---|---|---|---|---|---|",
    ]

    def share(group: list[dict[str, Any]], stage: str) -> str:
        good = sum(r[stage]["fitting"] for r in group)
        total = sum(r[stage]["lines"] for r in group)
        return f"{good / max(1, total):.0%}"

    for model, variant in models:
        mine = [r for r in rows if r["model"] == model and r.get("variant", "schema") == variant]
        group = [r for r in mine if isinstance(r.get("draft"), dict)]
        failed = len(mine) - len(group)
        model = f"{model} ({variant})"
        if not group:
            lines.append(f"| {model} | 0 (+{failed} failed) | | | | | | | | | | |")
            continue
        dev = [
            (r["draft"]["deviation"], r["last step"]["deviation"])
            for r in group
            if r["draft"]["deviation"] is not None and r["last step"]["deviation"] is not None
        ]
        asked = sum(r["asked"] for r in group)
        fixed = sum(r["fixed"] for r in group)
        kept = [r["kept_words"] for r in group if r.get("kept_words") is not None]
        lines.append(
            f"| {model} | {len(group)}{f' (+{failed} failed)' if failed else ''} | {share(group, 'draft')} | "
            f"{share(group, 'round 1')} | {share(group, 'round 2')} | {share(group, 'last step')} | "
            f"{statistics.median(d[0] for d in dev):.2f} -> {statistics.median(d[1] for d in dev):.2f} | "
            f"{asked} | {fixed / max(1, asked):.0%} | {(statistics.mean(kept) if kept else float('nan')):.0%} | "
            f"{statistics.mean(r['writer_calls'] for r in group):.1f} | "
            f"{statistics.mean(r['seconds'] for r in group):.0f} |"
        )
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--records", type=Path, required=True, help="folder with *.plenio.json release records"
    )
    parser.add_argument("--out", type=Path, required=True, help="folder for results.jsonl and summary.md")
    parser.add_argument("--models", nargs="*", type=Path, default=[], help="GGUF files (none: summary only)")
    parser.add_argument("--samples", type=int, default=6, help="cover scores")
    parser.add_argument(
        "--free", action="store_true", help="repairs without the schema (as the native writer)"
    )
    args = parser.parse_args(argv)
    args.out.mkdir(parents=True, exist_ok=True)
    results = args.out / "results.jsonl"
    if args.models:
        samples = load_samples(args.records, args.samples)
        print("samples:", ", ".join(f"{s.id} {len(s.tags)} sections {s.lines} phrases" for s in samples))
        runtimes = llm.find_runtimes(os.environ, Path.home())
        runtimes = [r for r in runtimes if "llama-server" in r.name] or runtimes
        if not runtimes:
            raise SystemExit("no llama.cpp runtime found")
        for model_path in args.models:
            run_model(model_path, samples, results, runtimes[0], args.free)
    if results.exists():
        text = summary(results)
        (args.out / "summary.md").write_text(text + "\n", encoding="utf-8")
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
