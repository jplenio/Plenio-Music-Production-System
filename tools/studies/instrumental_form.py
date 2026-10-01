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
* ``audio`` - variety of the rendered takes: how many 4-second windows sound unlike every earlier
  window (chroma and timbre), and how much the loudness moves (sections that build and drop).

Usage:
  <comfy python> tools/studies/instrumental_form.py --server http://127.0.0.1:8190 --out <dir> plans
      [--seeds 1 2] [--styles NAME ...] [--forms NAME ...]
  <comfy python> tools/studies/instrumental_form.py --server ... --out <dir> renders --from <plans.json>
      [--forms NAME ...] [--styles NAME ...] [--variants NAME ...]
  <comfy python> tools/studies/instrumental_form.py --server ... --out <dir> audio --output <ComfyUI output dir>
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
from plenio.core.writing import instrumental_plan_form

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
    "plenio": instrumental_plan_form(TARGET_SECONDS),  # the 0.3.1 product: the form by length
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
    "arr": ("bare", "arrangement"),  # [instrumental] and arrangement words in the style (no vocal words)
}

ARRANGEMENT = "dynamic arrangement, breakdown, build-up, drop, evolving sections"


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
                # 'NAME+lora': the instrumental adapter on the planner's CLIP only (the render stays plain)
                base, lora = form.removesuffix("+lora"), form.endswith("+lora")
                planned = run(server, plan_graph(STYLES[style], FORMS[base], seed, lora))
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
    # Check Vocals is not an output node: without a consumer ComfyUI would not run it
    nodes["22"] = {"class_type": "PreviewAny", "inputs": {"source": ["21", 1]}}
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
            style = {
                "plenio": STYLES[row["style"]],
                "upstream": upstream_style(STYLES[row["style"]]),
                "arrangement": f"{STYLES[row['style']]}, {ARRANGEMENT}",
            }[style_rule]
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


WINDOW_S = 4.0


def audio_variety(path: Path) -> dict[str, Any]:
    """Variety of a take: the share of 4-s windows unlike every earlier window that is not its neighbour
    (cosine similarity of chroma and MFCC means below a threshold), and the spread of the windows'
    loudness in dB (a loop that never builds or drops stays flat)."""
    import librosa
    import numpy as np

    y, rate = librosa.load(str(path), sr=22050, mono=True)
    hop = 512
    chroma = librosa.feature.chroma_stft(y=y, sr=rate, hop_length=hop)
    mfcc = librosa.feature.mfcc(y=y, sr=rate, n_mfcc=20, hop_length=hop)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    per = int(WINDOW_S * rate / hop)
    count = chroma.shape[1] // per
    feats, levels = [], []
    for i in range(count):
        part = slice(i * per, (i + 1) * per)
        c_mean = chroma[:, part].mean(axis=1)
        m_mean = mfcc[1:, part].mean(axis=1)
        vector = np.concatenate(
            [c_mean / (np.linalg.norm(c_mean) + 1e-9), m_mean / (np.linalg.norm(m_mean) + 1e-9)]
        )
        feats.append(vector / np.linalg.norm(vector))
        levels.append(20 * np.log10(rms[part].mean() + 1e-9))
    sims = np.array(feats) @ np.array(feats).T
    result: dict[str, Any] = {"seconds": round(len(y) / rate, 1), "windows": count}
    for threshold in (0.97, 0.985):
        novel = sum(1 for i in range(count) if i < 2 or sims[i, : i - 1].max() < threshold)
        result[f"novel_{threshold}"] = round(novel / count, 3) if count else None
    audible = [lv for lv in levels if lv > max(levels) - 40] if levels else []
    result["loudness_spread_db"] = round(float(np.std(audible)), 2) if audible else None
    result["mean_similarity"] = round(float(sims[np.triu_indices(count, 2)].mean()), 3) if count > 2 else None
    return result


def audio(out: Path, output_dir: Path) -> list[dict[str, Any]]:
    target = out / "e6-renders.json"
    results: list[dict[str, Any]] = read_json(target)
    for row in results:
        if row.get("files") and "variety" not in row:
            row["variety"] = audio_variety(output_dir / row["files"][0])
            print(row["name"], row["variety"], flush=True)
            write_json(target, results)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--server", required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("phase", choices=["plans", "renders", "audio"])
    parser.add_argument("--seeds", type=int, nargs="+", default=[1, 2])
    parser.add_argument("--styles", nargs="+", default=list(STYLES))
    parser.add_argument("--forms", nargs="+", default=list(FORMS))
    parser.add_argument("--variants", nargs="+", default=list(VARIANTS))
    parser.add_argument("--from", dest="source", type=Path)
    parser.add_argument("--output", type=Path, help="the server's output folder (phase audio)")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    if args.phase == "plans":
        plans(args.server, args.out, args.seeds, args.styles, args.forms)
    elif args.phase == "audio":
        audio(args.out, args.output)
    else:
        if not args.source:
            sys.exit("renders needs --from <e6-plans.json>")
        renders(args.server, args.out, args.source, args.forms, args.styles, args.variants, args.seeds)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
