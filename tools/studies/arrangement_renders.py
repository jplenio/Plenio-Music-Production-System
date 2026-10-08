"""Study E7: what YuE2 makes of an arranged score - the plan alone, 0.4.5's arrangement, the harmony guard with
fills (default) and with lines under the singing.

Steps (each writes into ``--out``; the scores and lyrics come from release records, read only, and stay in
``--out`` - only counts and means go into a report):

``prepare``  sung songs (and a cover) from the records and, per song, one writer plan from study A1's
             answers (``--plans``): the four conditions as scores. 0.4.5's arrangement comes from a checkout
             of release 0.4.5 (``--old``, e.g. a ``git worktree`` of ``9f0dabc``), run in its own process.
``render``   every condition with YuE2 on a running ComfyUI (``tools/dev_server.py --gpu``), two take seeds.
``evaluate`` SheetSage2 transcribes every take (ComfyUI's encoder, in this process; stop the server first):
             the sung melody against the score (note F1), the chord roots against the score's, the take's
             own harmony (sung notes on chord tones, accented clashes a minute) and its key clarity (the best
             key-profile correlation of all its notes).
``pack``     a blind listening pack for the owner: numbered takes in random order, a verdict sheet, and the
             key (which take is which) in a separate file.

    python tools/studies/arrangement_renders.py prepare --records <output/plenio> --plans <a1 results.jsonl> --old <0.4.5 checkout> --out <dir>
    python tools/studies/arrangement_renders.py render --server http://127.0.0.1:8232 --out <dir>
    python tools/studies/arrangement_renders.py evaluate --models F:/ComfyUI/models --takes <server output> --out <dir>
    python tools/studies/arrangement_renders.py pack --takes <server output> --out <dir> --pack <folder>
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
import statistics
import subprocess
import sys
from dataclasses import replace
from pathlib import Path
from typing import Any

from _common import PROJECT, import_comfy, load_audio
from arrangement_llm import load_samples
from evaluate_takes import _items, chord_agreement, melody_f1
from render_matrix import audio_files, render_graph, run

from plenio.core.arrangement import ModeLibrary, arrange, harmony, melody_of, policy
from plenio.core.arrangement.plan import melody_voice
from plenio.core.errors import PlenioError
from plenio.core.score import canonical as c

CONDITIONS = ("plan", "0.4.5", "guard", "guard-under")
TAKE_SEEDS = (1, 2)
PLAN_MODEL = "Qwen_Qwen3.5-9B-Q4_K_M.gguf"
CLOSENESS = 60

OLD_ARRANGE = """
import json, sys
from pathlib import Path
from plenio.core.arrangement import ModeLibrary, arrange, policy
job = json.loads(sys.stdin.read())
library = ModeLibrary(Path("resources/arrangement"), None)
rules = policy(library.by_name(job["mode"]), kind=job["kind"], closeness=job["closeness"], melody=job["melody"])
result = arrange(job["abc"], job["answer"], rules, seed=job["seed"])
print(json.dumps({"abc": result.abc, "status": result.status, "summary": result.summary}))
"""


def _old_arrangement(old: Path, job: dict[str, Any]) -> dict[str, Any]:
    done = subprocess.run(  # noqa: S603
        [
            sys.executable,
            "-I",
            "-c",
            OLD_ARRANGE.replace("from pathlib", f"sys.path.insert(0, {str(old)!r})\nfrom pathlib"),
        ],
        input=json.dumps(job),
        capture_output=True,
        text=True,
        cwd=old,
        check=True,
    )
    return json.loads(done.stdout.strip().splitlines()[-1])


def prepare(records: Path, plans: Path, old: Path, out: Path) -> None:
    library = ModeLibrary(PROJECT / "resources" / "arrangement", None)
    samples = [s for s in load_samples(records, 2) if s.kind in ("song", "cover")]
    answers = [json.loads(line) for line in plans.read_text(encoding="utf-8").splitlines() if line.strip()]
    jobs = []
    for sample in samples:
        row = next(
            (
                r
                for r in answers
                if r.get("sample") == sample.id
                and r.get("model") == PLAN_MODEL
                and r.get("task") == "plan+schema"
                and r.get("seed") == 1
            ),
            None,
        )
        if row is None or not sample.lyrics.strip():
            continue
        melody = melody_of(instrumental=False, melody="lead")
        base = policy(library.by_name(row["mode"]), kind=sample.kind, closeness=CLOSENESS, melody=melody)
        conditions: dict[str, Any] = {"plan": {"abc": sample.abc, "status": "plan"}}
        conditions["0.4.5"] = _old_arrangement(
            old,
            {
                "abc": sample.abc,
                "answer": row["answer"],
                "mode": row["mode"],
                "kind": sample.kind,
                "closeness": CLOSENESS,
                "melody": melody,
                "seed": 1,
            },
        )
        for name, under in (("guard", False), ("guard-under", True)):
            rules = replace(base, genre=sample.style, under_singing=under)
            result = arrange(sample.abc, row["answer"], rules, seed=1)
            conditions[name] = {"abc": result.abc, "status": result.status, "summary": result.summary}
        jobs.append(
            {
                "sample": sample.id,
                "kind": sample.kind,
                "mode": row["mode"],
                "style": sample.style,
                "lyrics": sample.lyrics,
                "conditions": conditions,
            }
        )
        print(sample.id, {k: v["status"] for k, v in conditions.items()}, flush=True)
    out.mkdir(parents=True, exist_ok=True)
    (out / "jobs.json").write_text(json.dumps(jobs, ensure_ascii=False, indent=1), encoding="utf-8")


def render(server: str, out: Path) -> None:
    jobs = json.loads((out / "jobs.json").read_text(encoding="utf-8"))
    rows_path = out / "renders.jsonl"
    done = {(r["sample"], r["condition"], r["seed"]) for r in _rows(rows_path)}
    for job in jobs:
        for condition in CONDITIONS:
            for seed in TAKE_SEEDS:
                if (job["sample"], condition, seed) in done:
                    continue
                if (
                    condition != "plan"
                    and job["conditions"][condition]["abc"] == job["conditions"]["plan"]["abc"]
                ):
                    continue  # the arrangement kept the plan: its takes are the plan's
                name = f"e7-{job['sample']}-{condition}-s{seed}"
                abc = job["conditions"][condition]["abc"]
                result = run(server, render_graph(name, job["style"], job["lyrics"], abc, seed, lora=False))
                row = {
                    "sample": job["sample"],
                    "condition": condition,
                    "seed": seed,
                    "files": audio_files(result),
                    "status": result["status"],
                    "seconds": result["execution_seconds"],
                }
                with rows_path.open("a", encoding="utf-8") as sink:
                    sink.write(json.dumps(row) + "\n")
                print(name, row["status"], row["seconds"], flush=True)


def _rows(path: Path) -> list[dict[str, Any]]:
    return (
        [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
        if path.exists()
        else []
    )


def _key_clarity(score: c.Score) -> float:
    weights = [0.0] * 12
    for note in (*score.vocal, *score.ins):
        weights[note.pitch % 12] += note.duration
    if not sum(weights):
        return 0.0
    return max(harmony.key_scores(weights).values())


def evaluate(models: Path, takes: Path, out: Path) -> None:
    import_comfy()
    import comfy.model_management as mm
    import comfy.model_patcher  # noqa: F401
    import comfy.utils
    import torchaudio
    from comfy.audio_encoders import sheetsage2_abc as ss
    from comfy.audio_encoders.audio_encoders import load_audio_encoder_from_sd

    sd = comfy.utils.load_torch_file(
        str(models / "audio_encoders" / "sheetsage2_bf16.safetensors"), safe_load=True
    )
    encoder = load_audio_encoder_from_sd(sd)
    jobs = {j["sample"]: j for j in json.loads((out / "jobs.json").read_text(encoding="utf-8"))}
    results = []
    for row in _rows(out / "renders.jsonl"):
        if row["status"] != "success" or not row["files"]:
            continue
        path = takes / row["files"][0]
        waveform, rate = load_audio(path)
        mono = torchaudio.functional.resample(
            waveform.unsqueeze(0).float().mean(dim=1), rate, encoder.model_sample_rate
        )[0]
        mm.load_model_gpu(encoder.patcher)
        events = encoder.model.transcribe(mono[None].to(encoder.load_device))
        take_abc = ss.events_to_abc(events, mono.shape[-1] / encoder.model_sample_rate, melody_only=False)
        conditioning = jobs[row["sample"]]["conditions"][row["condition"]]["abc"]
        reference, _ = _items(conditioning, ("Vocal",))
        take_items, _ = _items(take_abc, ("Vocal",))
        record = {
            **{k: row[k] for k in ("sample", "condition", "seed")},
            # no sung melody (an instrumental cover): nothing to compare the take's singing with
            "melody": melody_f1(reference, take_items) if reference else {},
            "chords": chord_agreement(conditioning, take_abc),
        }
        try:
            take = c.from_abc(take_abc)
            m = harmony.measure(take, melody_voice(take, "vocal"))
            minutes = max(1 / 60, take.seconds(take.total) / 60)
            record.update(
                on_chord=m.melody_on_chord,
                accented_per_min=m.accented_avoid / minutes,
                key_clarity=_key_clarity(take),
            )
        except PlenioError as error:
            record["take_score_error"] = error.message[:120]
        results.append(record)
        print(
            row["sample"],
            row["condition"],
            row["seed"],
            record["melody"].get("f1"),
            record.get("chords"),
            flush=True,
        )
    (out / "evaluation.json").write_text(json.dumps(results, indent=1), encoding="utf-8")
    print(summary(results))


def summary(results: list[dict[str, Any]]) -> str:
    lines = [
        "| condition | takes | sung melody F1 | chord roots | sung notes on chord tones | accented clashes / min | key clarity |",
        "|---|---|---|---|---|---|---|",
    ]
    for condition in CONDITIONS:
        group = [r for r in results if r["condition"] == condition]
        if not group:
            continue

        def mean(key: str, group: list[dict[str, Any]] = group) -> float:
            values = [r[key] for r in group if isinstance(r.get(key), int | float)]
            return statistics.mean(values) if values else float("nan")

        scores = [r["melody"]["f1"] for r in group if r.get("melody")]
        f1 = statistics.mean(scores) if scores else float("nan")
        lines.append(
            f"| {condition} | {len(group)} | {f1:.2f} | {mean('chords'):.2f} | {mean('on_chord'):.0%} | "
            f"{mean('accented_per_min'):.1f} | {mean('key_clarity'):.2f} |"
        )
    return "\n".join(lines)


def pack(takes: Path, out: Path, folder: Path) -> None:
    rows = [r for r in _rows(out / "renders.jsonl") if r["status"] == "success" and r["files"]]
    random.Random(7).shuffle(rows)
    folder.mkdir(parents=True, exist_ok=True)
    key, sheet = (
        {},
        [
            "# Listening pack E7 - harmony of the arranged songs",
            "",
            "Every song comes in several versions (in random order, numbered). Please listen with headphones and note per",
            "take: **harmony** 1 (clashing, wrong notes) to 5 (clean and fitting the genre), whether you hear **notes that",
            "clash** (and roughly where), and anything else. The key of which take is which is in `key.json` - open it",
            "only after listening.",
            "",
            "| take | song | harmony 1-5 | clashing notes (where) | notes |",
            "|---|---|---|---|---|",
        ],
    )
    for number, row in enumerate(rows, start=1):
        name = f"{number:02d}.flac"
        shutil.copyfile(takes / row["files"][0], folder / name)
        key[name] = {k: row[k] for k in ("sample", "condition", "seed")}
        sheet.append(f"| {name} | {row['sample']} | | | |")
    (folder / "sheet.md").write_text("\n".join(sheet) + "\n", encoding="utf-8")
    (folder / "key.json").write_text(json.dumps(key, indent=1), encoding="utf-8")
    print(f"{len(rows)} takes in {folder}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("step", choices=("prepare", "render", "evaluate", "summary", "pack"))
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--records", type=Path)
    parser.add_argument("--plans", type=Path)
    parser.add_argument("--old", type=Path)
    parser.add_argument("--server", default="http://127.0.0.1:8232")
    parser.add_argument("--models", type=Path, default=Path("F:/ComfyUI/models"))
    parser.add_argument("--takes", type=Path)
    parser.add_argument("--pack", type=Path)
    args = parser.parse_args()
    if args.step == "prepare":
        prepare(args.records, args.plans, args.old, args.out)
    elif args.step == "render":
        render(args.server, args.out)
    elif args.step == "evaluate":
        evaluate(args.models, args.takes, args.out)
    elif args.step == "summary":
        rows = json.loads((args.out / "evaluation.json").read_text(encoding="utf-8"))
        jobs = {j["sample"]: j for j in json.loads((args.out / "jobs.json").read_text(encoding="utf-8"))}
        for row in rows:
            if not _items(jobs[row["sample"]]["conditions"][row["condition"]]["abc"], ("Vocal",))[0]:
                row["melody"] = {}
        (args.out / "evaluation.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
        print(summary(rows))
        for kind in ("song", "cover"):
            print(f"\n{kind}s:")
            print(summary([r for r in rows if jobs[r["sample"]]["kind"] == kind]))
    else:
        pack(args.takes, args.out, args.pack)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
