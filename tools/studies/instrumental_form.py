"""E6 (owner report 2026-09-30): form and length of instrumental songs on the YuE2 Song path.

The owner's release records show instrumental songs (above all EDM and electronic) at up to 3.8 x the
brief's length: with the lyrics ``[instrumental]`` the planner writes an intro and one long
"interlude", often a single pitch over one chord, and *fit length* cannot cut inside a section.
Upstream's instrumental workflow (YuE2 skill ``instrumental/``) plans with planner-only section tags
(default ``[Intro] [Verse] [Chorus] [Outro]``) and renders with the score's own section tags.

Two phases on a running, isolated ComfyUI with the real models (native nodes in API format):

* ``plans`` - planner-only lyrics forms x styles x seeds: plan length, sections, variety (distinct
  pitches, chords and bars), vocal notes, and the score after the Song path's preparation and fitting.
* ``renders`` - chosen plans (prepared and fitted as the product does) rendered with render-lyrics and
  style variants: length, ending, and Check Vocals (SheetSage2 re-transcription) per take.

Usage:
  <comfy python> tools/studies/instrumental_form.py --server http://127.0.0.1:8190 --out <dir> plans
      [--seeds 1 2] [--styles NAME ...] [--forms NAME ...]
  <comfy python> tools/studies/instrumental_form.py --server ... --out <dir> renders --from <plans.json>
      [--forms NAME ...] [--styles NAME ...] [--variants NAME ...]
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

from _common import read_json, write_json
from render_matrix import audio_files, plan_graph, run, texts

from plenio.core import preparation
from plenio.core.brief import LENGTHS, SongBrief
from plenio.core.score import canonical as c
from plenio.core.score import native

TARGET_SECONDS = 180.0

# instrumental styles as the writer made them for the owner's songs (release records, 2026-09)
STYLES = {
    "psytrance": "Psytrance, Full-on, Driving kick, rolling triplet bass, acid synth, swirling pads, intricate "
    "percussion, supersaw lead, hypnotic intense, 160 BPM",
    "melodic-techno": "melodic techno, deep bass, powerful kick, evolving arpeggios, filtered pads, soaring synth "
    "lead, dark emotional driving, 128 BPM",
    "downtempo": "downtempo electronica, balearic, deep organic grooves, warm analog synths, plucked strings, "
    "hypnotic lead synth, immersive, wide, 85 BPM",
    "dnb": "Drum and bass, neurofunk, deep sub bass, crisp snares, acid synth, soaring arpeggiated lead, "
    "relentless, modern, 185 BPM",
    "string-quartet": "classical string quartet, two violins viola cello, first violin lead, elegant refined "
    "melancholic, 110 BPM",
}

# planner-only lyrics (never sung: the render gets its own lyrics, see VARIANTS)
FORMS = {
    "bare": "[instrumental]",
    "upstream": "[Intro]\n\n[Verse]\n\n[Chorus]\n\n[Outro]\n",
    "song": "[Intro]\n\n[Verse]\n\n[Chorus]\n\n[Verse]\n\n[Chorus]\n\n[Bridge]\n\n[Chorus]\n\n[Outro]\n",
    "inst-labels": "[Intro]\n\n[Interlude]\n\n[Instrumental]\n\n[Interlude]\n\n[Outro]\n",
    "timed": "[intro 0:00-0:16]\n[verse 0:16-0:48]\n[chorus 0:48-1:20]\n[verse 1:20-1:52]\n[chorus 1:52-2:24]\n"
    "[bridge 2:24-2:40]\n[outro 2:40-3:00]",
}

UPSTREAM_NEGATIONS = ("no vocals", "no singing", "no choir", "no spoken words")


def upstream_style(style: str) -> str:
    """The style as upstream's instrumental skill writes it: 'Instrumental, ...' plus four negations."""
    text = style.strip().rstrip(".,")
    if not re.match(r"^instrumental\b", text, re.I):
        text = "Instrumental, " + text
    for condition in UPSTREAM_NEGATIONS:
        if condition not in text.lower():
            text += ", " + condition
    return text + "."


# render variants: (lyrics rule, style rule)
VARIANTS = {
    "bare": ("bare", "plenio"),  # today's Song path
    "tags": ("tags", "plenio"),  # the score's section tags (upstream's rule)
    "tags-neg": ("tags", "upstream"),  # section tags and upstream's style
    "empty-neg": ("empty", "upstream"),  # empty lyrics and upstream's style
}


# --- metrics --------------------------------------------------------------------------------------


def variety(abc: str) -> dict[str, Any]:
    """Distinct pitches and chords, and how many measures (both voices and the chord) are distinct."""
    score = c.from_abc(abc)
    notes = [(kind, n) for kind in ("vocal", "ins") for n in score.track(kind)]
    measures = []
    for index in range(score.measure_count):
        start, end = score.starts[index], score.starts[index + 1]
        content = tuple(
            (kind, n.onset - start, n.duration, n.pitch) for kind, n in notes if start <= n.onset < end
        ) + tuple((ch.onset - start, ch.name) for ch in score.chords if start <= ch.onset < end)
        measures.append(content)
    return {
        "bars": len(measures),
        "distinct_bars": len(set(measures)),
        "distinct_ratio": round(len(set(measures)) / len(measures), 3) if measures else None,
        "pitches": len({n.pitch for _kind, n in notes}),
        "chords": len({ch.name for ch in score.chords}),
    }


def describe(abc: str) -> dict[str, Any]:
    analysis = native.analyze(abc)
    if not analysis.ok:
        return {"valid": False, "error": analysis.errors[0].message if analysis.errors else "invalid"}
    return {
        "valid": True,
        "seconds": round(analysis.duration_s, 1),
        "sections": [(s.label, round(s.end_s - s.start_s)) for s in analysis.sections],
        "vocal_notes": int(analysis.voices["Vocal"]["notes"]),
        **variety(abc),
    }


def brief(target: float = TARGET_SECONDS) -> SongBrief:
    length = next(label for label, seconds in LENGTHS.items() if seconds == target)
    return SongBrief(length=length, vocals="instrumental", melody="lead")


# --- phases ---------------------------------------------------------------------------------------


def plans(
    server: str, out: Path, seeds: list[int], styles: list[str], forms: list[str]
) -> list[dict[str, Any]]:
    target = out / "e6-plans.json"
    results: list[dict[str, Any]] = read_json(target) if target.exists() else []
    done = {(r["style"], r["form"], r["seed"]) for r in results}
    the_brief = brief()
    for style in styles:
        for form in forms:
            for seed in seeds:
                if (style, form, seed) in done:
                    continue
                planned = run(server, plan_graph(STYLES[style], FORMS[form], seed, False))
                plan = texts(planned, "4")[0] if texts(planned, "4") else ""
                row: dict[str, Any] = {
                    "style": style,
                    "form": form,
                    "seed": seed,
                    "plan_status": planned["status"],
                    "plan_seconds": planned["execution_seconds"],
                    "plan": plan,
                    "truncated": native.repair_truncated(plan) is not None if plan.strip() else None,
                }
                if plan.strip():
                    row["planned"] = describe(native.repair_truncated(plan).abc if row["truncated"] else plan)
                    prepared = preparation.prepare_for_brief(plan, the_brief)
                    row["prepared"] = describe(prepared.abc)
                    row["prepared_abc"] = prepared.abc
                    row["preparation"] = list(prepared.changes) + [f"warning: {w}" for w in prepared.warnings]
                results.append(row)
                write_json(target, results)
                p, q = row.get("planned", {}), row.get("prepared", {})
                print(
                    f"{style:15} {form:12} s{seed}: plan {p.get('seconds')} s {len(p.get('sections', []))} sections "
                    f"pitches {p.get('pitches')} chords {p.get('chords')} distinct {p.get('distinct_ratio')} "
                    f"vocal {p.get('vocal_notes')} -> prepared {q.get('seconds')} s ({planned['execution_seconds']} s)",
                    flush=True,
                )
    return results


def check_graph(name: str, style: str, lyrics: str, abc: str, seed: int) -> dict[str, Any]:
    """Render as the Song path does (no adapter), then Check Vocals on the take."""
    from render_matrix import render_graph

    nodes = render_graph(name, style, lyrics, abc, seed, False)
    nodes["20"] = {
        "class_type": "AudioEncoderLoader",
        "inputs": {"audio_encoder_name": "sheetsage2_bf16.safetensors"},
    }
    nodes["21"] = {
        "class_type": "PlenioVocalCheck",
        "inputs": {"audio": ["8", 0], "audio_encoder": ["20", 0], "tolerance_seconds": 0.0},
    }
    return nodes


def renders(
    server: str,
    out: Path,
    source: Path,
    forms: list[str],
    styles: list[str],
    variants: list[str],
    seeds: list[int],
) -> list[dict[str, Any]]:
    target = out / "e6-renders.json"
    results: list[dict[str, Any]] = read_json(target) if target.exists() else []
    done = {(r["style"], r["form"], r["plan_seed"], r["variant"], r["seed"]) for r in results}
    planned = [
        r for r in read_json(source) if r["form"] in forms and r["style"] in styles and r.get("prepared_abc")
    ]
    for row in planned:
        abc = row["prepared_abc"]
        for variant in variants:
            lyrics_rule, style_rule = VARIANTS[variant]
            lyrics = {"bare": "[instrumental]", "tags": native.section_tags(abc), "empty": ""}[lyrics_rule]
            style = STYLES[row["style"]] if style_rule == "plenio" else upstream_style(STYLES[row["style"]])
            for seed in seeds:
                key = (row["style"], row["form"], row["seed"], variant, seed)
                if key in done:
                    continue
                name = f"e6-{row['style']}-{row['form']}-p{row['seed']}-{variant}-s{seed}"
                rendered = run(server, check_graph(name, style, lyrics, abc, seed))
                summary = rendered["outputs"].get("21", {}).get("plenio_summary", [{}])[0].get("markdown", "")
                notes = re.search(r"(\d+) vocal notes \(([\d.]+) s\)", summary)
                result = {
                    "name": name,
                    "style": row["style"],
                    "form": row["form"],
                    "plan_seed": row["seed"],
                    "variant": variant,
                    "seed": seed,
                    "lyrics": lyrics,
                    "render_style": style,
                    "score_seconds": row["prepared"]["seconds"],
                    "status": rendered["status"],
                    "error": rendered["error"],
                    "execution_seconds": rendered["execution_seconds"],
                    "native_seconds": texts(rendered, "10"),
                    "files": audio_files(rendered),
                    "vocal_notes": int(notes.group(1)) if notes else None,
                    "vocal_seconds": float(notes.group(2)) if notes else None,
                    "abrupt": "ends abruptly" in summary,
                    "check": summary,
                }
                results.append(result)
                write_json(target, results)
                print(
                    f"{name}: {rendered['status']} {rendered['execution_seconds']} s, native {result['native_seconds']}, "
                    f"vocal notes {result['vocal_notes']}, abrupt {result['abrupt']}",
                    flush=True,
                )
    return results


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--server", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("phase", choices=["plans", "renders"])
    parser.add_argument("--seeds", type=int, nargs="+", default=[1, 2])
    parser.add_argument("--styles", nargs="+", default=list(STYLES))
    parser.add_argument("--forms", nargs="+", default=list(FORMS))
    parser.add_argument("--variants", nargs="+", default=list(VARIANTS))
    parser.add_argument("--from", dest="source", type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    if args.phase == "plans":
        plans(args.server, args.out, args.seeds, args.styles, args.forms)
    else:
        if not args.source:
            sys.exit("renders needs --from <e6-plans.json>")
        renders(args.server, args.out, args.source, args.forms, args.styles, args.variants, args.seeds)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
