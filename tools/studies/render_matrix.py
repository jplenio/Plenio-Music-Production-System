"""E4/E5 and the listen detector: native YuE2 and Gemma 4 jobs on a running, isolated ComfyUI.

Experiments (all jobs are native nodes in API format; nothing here is Plenio product code):

* ``instrumental`` (E4, I-1, AS-07) — YuE2 text path: tag forms x instrumental adapter on/off x seeds.
  The plan is generated first; if it has sounding ``Vocal`` notes, the lead preparation of
  ``plenio.core.score.native.prepare`` is applied before rendering, as the Song path does.
* ``cover`` (E5, I-2, I-3, Q-C3, Q-C4, Q-C6) — a transcribed source (``sheetsage_timeline.py`` JSON)
  rendered in every cover mode: original lyrics (the automatic draft of ``alignment.py``), new lyrics,
  instrument plays the melody, accompaniment only; harmony new (melody mode) or kept (full mode);
  adapter on/off.
* ``listen`` (E3) — Gemma 4 E4B answers yes/no to "is there a human voice?" on 30-second windows.
* ``gemma_asr`` (E2) — Gemma 4 E4B transcribes sung lyrics on 30-second windows.

Usage:
  <comfy python> tools/studies/render_matrix.py --server http://127.0.0.1:8232 --out <dir> --experiment NAME
      [--source <e1 json> --draft <alignment json>] [--seeds 1 2] [--files <audio in output>...]
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.request
import uuid
from pathlib import Path
from typing import Any

from _common import read_json, write_json

from plenio.core.engines import yue2
from plenio.core.score import native

CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
LORA = "ar_lora_inst_v3abc_comfyui.safetensors"
WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"

TEXT_STYLE = (
    "folk ballad, fingerpicked acoustic guitar, subtle piano, upright bass, brushed drums, "
    "acoustic guitar melody, intimate, sparse, 85 BPM"
)
COVER_SUNG_STYLE = "English, acoustic folk pop, fingerpicked acoustic guitar, warm piano, upright bass, brushed drums, soft female vocal, 121 BPM"
COVER_LEAD_STYLE = "acoustic folk instrumental, warm piano lead melody, fingerpicked acoustic guitar, upright bass, brushed drums, 121 BPM"
COVER_ACC_STYLE = "acoustic folk instrumental, fingerpicked acoustic guitar, warm piano, upright bass, brushed drums, 121 BPM"
NEW_LYRICS = """[Verse]
Paper lanterns on the river, and the water carries slow
Every ripple holds a secret that the harbor doesn't know
There's a whistle from the ferry, drifting over mud and stone
And I'm miles away from morning, but I'm never quite alone

[Pre-Chorus]
Hear the bells across the bay
Counting down the end of day
For a feeling that won't stay the same
I'm calling out a name into the rain

[Chorus]
Lanterns floating through the dark, a promise on the tide
You'll be a story by the morning, but tonight you're by my side
Lanterns floating through the dark, a whisper and a spark
If this is real or just a dream, hold it before it goes

[Outro]"""
LISTEN_PROMPT = (
    "Listen to this music clip. Is any human voice audible in it - singing, humming, speech, choir or "
    "vocal chops? Answer with exactly one word: yes or no."
)
ASR_PROMPT = "Transcribe the lyrics that are sung in this audio clip. Output only the lyrics, one line per sung phrase."


# --- server -----------------------------------------------------------------------


def api(server: str, path: str, data: Any = None) -> Any:
    body = None if data is None else json.dumps(data).encode("utf-8")
    request = urllib.request.Request(server + path, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read()
    return json.loads(raw) if raw else None


def run(server: str, prompt: dict[str, Any], timeout: float = 3600.0) -> dict[str, Any]:
    started = time.perf_counter()
    queued = api(server, "/prompt", {"prompt": prompt, "client_id": str(uuid.uuid4())})
    prompt_id = queued["prompt_id"]
    while True:
        history = api(server, f"/history/{prompt_id}")
        if prompt_id in history:
            entry = history[prompt_id]
            status = entry.get("status", {})
            if status.get("completed") or status.get("status_str") == "error":
                break
        if time.perf_counter() - started > timeout:
            raise TimeoutError(prompt_id)
        time.sleep(2.0)
    times = {m[0]: m[1].get("timestamp") for m in status.get("messages", []) if isinstance(m, list)}
    executed = None
    if times.get("execution_start") and (times.get("execution_success") or times.get("execution_error")):
        executed = (
            (times.get("execution_success") or times.get("execution_error")) - times["execution_start"]
        ) / 1000.0
    return {
        "prompt_id": prompt_id,
        "status": status.get("status_str"),
        "error": [m for m in status.get("messages", []) if m[0] == "execution_error"][:1],
        "wall_seconds": round(time.perf_counter() - started, 1),
        "execution_seconds": round(executed, 1) if executed else None,
        "outputs": entry.get("outputs", {}),
    }


def texts(result: dict[str, Any], node: str) -> list[str]:
    return list(result["outputs"].get(node, {}).get("text", []))


def audio_files(result: dict[str, Any]) -> list[str]:
    files = []
    for output in result["outputs"].values():
        for item in output.get("audio", []):
            files.append(
                f"{item['subfolder']}/{item['filename']}" if item.get("subfolder") else item["filename"]
            )
    return files


# --- graphs -----------------------------------------------------------------------


def _models(nodes: dict[str, Any], lora: bool) -> list[Any]:
    nodes["1"] = {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CHECKPOINT}}
    if not lora:
        return ["1", 1]
    nodes["2"] = {
        "class_type": "LoraLoader",
        "inputs": {
            "model": ["1", 0],
            "clip": ["1", 1],
            "lora_name": LORA,
            "strength_model": 0.0,
            "strength_clip": 1.0,
        },
    }
    return ["2", 1]


def plan_graph(style: str, lyrics: str, seed: int, lora: bool) -> dict[str, Any]:
    nodes: dict[str, Any] = {}
    clip = _models(nodes, lora)
    nodes["3"] = {
        "class_type": "YuE2GenerateABC",
        "inputs": {
            "clip": clip,
            "style": style,
            "lyrics": lyrics,
            "seed": seed,
            "mode": "full",
            "max_abc_tokens": 8192,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 30,
            "repetition_penalty": 1.005,
            "penalty_window": 100,
        },
    }
    nodes["4"] = {"class_type": "PreviewAny", "inputs": {"source": ["3", 0]}}
    return nodes


def render_graph(name: str, style: str, lyrics: str, abc: str, seed: int, lora: bool) -> dict[str, Any]:
    nodes: dict[str, Any] = {}
    clip = _models(nodes, lora)
    seconds = native.analyze(abc).duration_s if abc.strip() else 120.0
    nodes["4"] = {
        "class_type": "YuE2GenerateMusic",
        "inputs": {
            "clip": clip,
            "style": style,
            "lyrics": lyrics,
            "abc": abc,
            "seed": seed,
            "mode": yue2.planning_mode(abc),
            "max_duration": round(yue2.render_ceiling(seconds), 2),
            "temperature": 1.0,
            "top_p": 0.95,
            "top_k": 100,
            "repetition_penalty": 1.2,
            "cfg_scale": 1.0,
        },
    }
    nodes["5"] = {"class_type": "EmptyYuE2LatentAudio", "inputs": {"seconds": ["4", 1], "batch_size": 1}}
    nodes["6"] = {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["4", 0]}}
    nodes["7"] = {
        "class_type": "KSampler",
        "inputs": {
            "model": ["1", 0],
            "seed": seed,
            "steps": 32,
            "cfg": 1.0,
            "sampler_name": "dpm_2",
            "scheduler": "sgm_uniform",
            "positive": ["4", 0],
            "negative": ["6", 0],
            "latent_image": ["5", 0],
            "denoise": 1.0,
        },
    }
    nodes["8"] = {"class_type": "VAEDecodeAudio", "inputs": {"samples": ["7", 0], "vae": ["1", 2]}}
    nodes["9"] = {
        "class_type": "SaveAudio",
        "inputs": {"audio": ["8", 0], "filename_prefix": f"studies/{name}"},
    }
    nodes["10"] = {"class_type": "PreviewAny", "inputs": {"source": ["4", 1]}}
    return nodes


def gemma_graph(
    file: str, windows: list[tuple[float, float]], prompt: str, max_length: int
) -> dict[str, Any]:
    nodes: dict[str, Any] = {
        "1": {"class_type": "LoadAudio", "inputs": {"audio": file}},
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        },
    }
    for index, (start, duration) in enumerate(windows):
        base = 10 + index * 3
        nodes[str(base)] = {
            "class_type": "TrimAudioDuration",
            "inputs": {"audio": ["1", 0], "start_index": start, "duration": duration},
        }
        nodes[str(base + 1)] = {
            "class_type": "TextGenerate",
            "inputs": {
                "clip": ["2", 0],
                "prompt": prompt,
                "max_length": max_length,
                "sampling_mode": "off",
                "audio": [str(base), 0],
                "thinking": False,
                "use_default_template": True,
            },
        }
        nodes[str(base + 2)] = {"class_type": "PreviewAny", "inputs": {"source": [str(base + 1), 0]}}
    return nodes


# --- experiments ------------------------------------------------------------------


def vocal_notes(abc: str) -> int:
    return int(native.analyze(abc).voices.get("Vocal", {}).get("notes", 0))


TIMED_TAGS = "[intro 0:00-0:12]\n[verse 0:12-0:40]\n[chorus 0:40-1:05]\n[outro 1:05-1:20]"


def instrumental(
    server: str, out: Path, seeds: list[int], experiment: str = "instrumental"
) -> list[dict[str, Any]]:
    tags = "[Intro]\n\n[Verse]\n\n[Chorus]\n\n[Outro]"
    conditions = [
        ("tags", tags, False),
        ("tags-lora", tags, True),
        ("bare", "[instrumental]", False),
        ("bare-lora", "[instrumental]", True),
    ]
    if experiment == "timed":
        # the adapter card's third lyrics form: timed section tags (target 80 s)
        conditions = [("timed", TIMED_TAGS, False), ("timed-lora", TIMED_TAGS, True)]
    target = out / ("e4-timed.json" if experiment == "timed" else "e4-instrumental.json")
    results = []
    for label, lyrics, lora in conditions:
        for seed in seeds:
            name = f"e4-{label}-s{seed}"
            planned = run(server, plan_graph(TEXT_STYLE, lyrics, seed, lora))
            plan = texts(planned, "4")[0] if texts(planned, "4") else ""
            prepared = native.prepare(plan, instrumental=True, melody="lead") if plan.strip() else None
            abc = prepared.abc if prepared else plan
            rendered = run(server, render_graph(name, TEXT_STYLE, lyrics, abc, seed, lora))
            row = {
                "name": name,
                "condition": label,
                "lyrics": lyrics,
                "lora": lora,
                "seed": seed,
                "style": TEXT_STYLE,
                "plan_seconds": planned["execution_seconds"],
                "plan_status": planned["status"],
                "plan_vocal_notes": vocal_notes(plan) if plan.strip() else None,
                "plan_sections": [s.label for s in native.analyze(plan).sections] if plan.strip() else [],
                "plan": plan,
                "rendered_abc": abc,
                "preparation": list(prepared.changes) if prepared else [],
                "render": {k: rendered[k] for k in ("status", "error", "wall_seconds", "execution_seconds")},
                "score_seconds": round(native.analyze(abc).duration_s, 2) if abc.strip() else None,
                "files": audio_files(rendered),
                "native_seconds": texts(rendered, "10"),
            }
            results.append(row)
            write_json(target, results)
            print(
                f"{name}: plan vocal notes {row['plan_vocal_notes']}, render {rendered['status']} "
                f"{rendered['execution_seconds']} s, files {row['files']}"
            )
    return results


def cover(server: str, out: Path, seeds: list[int], source: Path, draft: Path) -> list[dict[str, Any]]:
    transcription = read_json(source)["abc"]
    original = read_json(draft)["draft_grid_pickup"]
    chordless = native.strip_chords(transcription).abc
    tags = native.section_tags(transcription)
    lead_new = native.prepare(chordless, instrumental=True, melody="lead")
    lead_keep = native.prepare(transcription, instrumental=True, melody="lead")
    acc_new = native.prepare(chordless, instrumental=True, melody="accompaniment")
    acc_keep = native.prepare(transcription, instrumental=True, melody="accompaniment")
    conditions = [
        ("original-new", COVER_SUNG_STYLE, original, chordless, False, seeds[:1]),
        ("original-keep", COVER_SUNG_STYLE, original, transcription, False, seeds[:1]),
        ("newlyrics-new", COVER_SUNG_STYLE, NEW_LYRICS, chordless, False, seeds[:1]),
        ("lead-new", COVER_LEAD_STYLE, tags, lead_new.abc, False, seeds),
        ("lead-new-lora", COVER_LEAD_STYLE, tags, lead_new.abc, True, seeds),
        ("lead-keep", COVER_LEAD_STYLE, tags, lead_keep.abc, False, seeds),
        ("lead-keep-lora", COVER_LEAD_STYLE, tags, lead_keep.abc, True, seeds),
        ("acc-new", COVER_ACC_STYLE, tags, acc_new.abc, False, seeds[:1]),
        ("acc-keep", COVER_ACC_STYLE, tags, acc_keep.abc, False, seeds),
        ("acc-keep-lora", COVER_ACC_STYLE, tags, acc_keep.abc, True, seeds),
    ]
    results = []
    for label, style, lyrics, abc, lora, condition_seeds in conditions:
        for seed in condition_seeds:
            name = f"e5-{label}-s{seed}"
            rendered = run(server, render_graph(name, style, lyrics, abc, seed, lora))
            analysis = native.analyze(abc)
            row = {
                "name": name,
                "condition": label,
                "style": style,
                "lyrics": lyrics,
                "lora": lora,
                "seed": seed,
                "mode": yue2.planning_mode(abc),
                "abc": abc,
                "score_seconds": round(analysis.duration_s, 2),
                "score_vocal_notes": analysis.voices.get("Vocal", {}).get("notes"),
                "score_ins_notes": analysis.voices.get("Ins", {}).get("notes"),
                "render": {k: rendered[k] for k in ("status", "error", "wall_seconds", "execution_seconds")},
                "files": audio_files(rendered),
                "native_seconds": texts(rendered, "10"),
            }
            results.append(row)
            write_json(out / "e5-cover.json", results)
            print(
                f"{name}: {row['mode']}, render {rendered['status']} {rendered['execution_seconds']} s, files {row['files']}"
            )
    preparations = {
        "lead_new": list(lead_new.changes) + list(lead_new.warnings),
        "lead_keep": list(lead_keep.changes) + list(lead_keep.warnings),
        "acc_new": list(acc_new.changes) + list(acc_new.warnings),
        "acc_keep": list(acc_keep.changes) + list(acc_keep.warnings),
    }
    write_json(out / "e5-preparations.json", preparations)
    return results


def gemma(server: str, out: Path, files: list[str], experiment: str) -> list[dict[str, Any]]:
    prompt, max_length = (LISTEN_PROMPT, 4) if experiment == "listen" else (ASR_PROMPT, 400)
    results = []
    for file in files:
        seconds = float(file.split("@", 1)[1]) if "@" in file else 90.0
        name = file.split("@", 1)[0]
        if experiment == "listen":
            windows = [(round(seconds * f, 2), 30.0) for f in (0.1, 0.4, 0.7)]
        else:
            windows = [(float(start), 30.0) for start in range(0, int(seconds), 30)]
        started = time.perf_counter()
        result = run(server, gemma_graph(name, windows, prompt, max_length))
        answers = [texts(result, str(12 + 3 * i)) for i in range(len(windows))]
        row = {
            "file": name,
            "windows": windows,
            "answers": answers,
            "status": result["status"],
            "error": result["error"],
            "seconds": round(time.perf_counter() - started, 1),
        }
        results.append(row)
        write_json(out / f"gemma-{experiment}.json", results)
        print(
            f"{name}: {result['status']} {row['seconds']} s -> {[a[0][:60] if a else None for a in answers]}"
        )
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--server", default="http://127.0.0.1:8232")
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument(
        "--experiment",
        required=True,
        choices=["instrumental", "timed", "cover", "listen", "gemma_asr"],
    )
    parser.add_argument("--seeds", nargs="+", type=int, default=[1, 2])
    parser.add_argument("--source", type=Path)
    parser.add_argument("--draft", type=Path)
    parser.add_argument(
        "--files", nargs="*", default=[], help="LoadAudio names, e.g. 'studies/x.flac [output]@83.0'"
    )
    args = parser.parse_args()
    if args.experiment in ("instrumental", "timed"):
        instrumental(args.server, args.out, args.seeds, args.experiment)
    elif args.experiment == "cover":
        cover(args.server, args.out, args.seeds, args.source, args.draft)
    else:
        gemma(args.server, args.out, args.files, args.experiment)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
