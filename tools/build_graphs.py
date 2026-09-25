"""Generate Plenio's blueprints (subgraphs/) and path templates (example_workflows/).

Run after changing a blueprint or template definition here:

    <python> tools/build_graphs.py

The output is deterministic; the workflow tests check that every template
embeds the current blueprint definitions.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tools"))

from graph_builder import (  # noqa: E402
    Blueprint,
    BlueprintInput,
    BlueprintOutput,
    Graph,
    blueprint_file,
    workflow,
)

YUE2_CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
YUE2_URL = "https://huggingface.co/Comfy-Org/YuE2/resolve/main/checkpoints/yue2_3b_int8_convrot.safetensors"
LORA = "ar_lora_inst_v3abc_comfyui.safetensors"
LORA_URL = (
    "https://huggingface.co/Mothersuperior/YuE2-instrumental-cot-full-loras/resolve/"
    "947f2f4b28978b2b6c3e316e6a87925c76bf3c4b/ar_lora_inst_v3abc_comfyui.safetensors"
)
WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"
WRITER_URL = (
    "https://huggingface.co/Comfy-Org/gemma-4/resolve/main/text_encoders/gemma4_e4b_it_fp8_scaled.safetensors"
)


def model(name: str, url: str, directory: str) -> dict[str, list[dict[str, str]]]:
    return {"models": [{"name": name, "url": url, "directory": directory}]}


def yue2_model() -> Blueprint:
    g = Graph()
    loader = g.add(
        "CheckpointLoaderSimple",
        (0, 0),
        size=(320, 100),
        widgets={"ckpt_name": YUE2_CHECKPOINT},
        properties=model(YUE2_CHECKPOINT, YUE2_URL, "checkpoints"),
    )
    lora = g.add(
        "LoraLoader",
        (380, 0),
        size=(320, 130),
        mode=4,
        title="Instrumental adapter (optional)",
        widgets={"lora_name": LORA, "strength_model": 0.0, "strength_clip": 1.0},
        properties=model(LORA, LORA_URL, "loras"),
    )
    engine = g.add("PlenioEngine", (760, 0), size=(260, 60))
    g.link(loader, "MODEL", lora, "model")
    g.link(loader, "CLIP", lora, "clip")
    g.link(lora, "CLIP", engine, "clip")
    return Blueprint(
        "Plenio · YuE2 Model",
        "Plenio/Model",
        "Loads YuE2 (int8 by default) and identifies it for the Plenio nodes. Contains an optional instrumental "
        "adapter (LoRA, CC BY-NC 4.0), bypassed by default.",
        g,
        [
            BlueprintInput(
                "ckpt_name",
                "COMBO",
                [(loader, "ckpt_name")],
                widget=True,
                default=YUE2_CHECKPOINT,
                label="checkpoint",
            )
        ],
        [
            BlueprintOutput("MODEL", "MODEL", (lora, "MODEL")),
            BlueprintOutput("CLIP", "CLIP", (lora, "CLIP")),
            BlueprintOutput("VAE", "VAE", (loader, "VAE")),
            BlueprintOutput("engine", "PLENIO_ENGINE", (engine, "engine")),
        ],
    )


def write_song() -> Blueprint:
    g = Graph()
    compose = g.add("PlenioComposePrompt", (0, 0), size=(300, 100))
    loader = g.add(
        "CLIPLoader",
        (0, 160),
        size=(300, 110),
        title="Writer model",
        widgets={"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        properties=model(WRITER, WRITER_URL, "text_encoders"),
    )
    generate = g.add(
        "TextGenerate",
        (360, 0),
        size=(340, 420),
        widgets={
            "prompt": "",
            "max_length": 2048,
            "sampling_mode": "on",
            "sampling_mode.temperature": 0.8,
            "sampling_mode.top_k": 64,
            "sampling_mode.top_p": 0.95,
            "sampling_mode.min_p": 0.05,
            "sampling_mode.repetition_penalty": 1.05,
            "sampling_mode.seed": 0,
            "sampling_mode.presence_penalty": 0.0,
            "thinking": False,
            "use_default_template": True,
            "mtp": "auto",
        },
    )
    parse = g.add("PlenioParseDraft", (760, 0), size=(300, 140))
    g.link(compose, "prompt", generate, "prompt")
    g.link(loader, "CLIP", generate, "clip")
    g.link(generate, "generated_text", parse, "text")
    g.link(compose, "request", parse, "request")
    return Blueprint(
        "Plenio · Write Song",
        "Plenio/Writing",
        "Writes title, style, lyrics and an artwork prompt with a local text model (native Generate Text), "
        "following the rules of the loaded music model. Replace Generate Text with any other LLM node if you like.",
        g,
        [
            BlueprintInput("brief", "PLENIO_BRIEF", [(compose, "brief")]),
            BlueprintInput("engine", "PLENIO_ENGINE", [(compose, "engine")]),
            BlueprintInput(
                "clip_name",
                "COMBO",
                [(loader, "clip_name")],
                widget=True,
                default=WRITER,
                label="writer model",
            ),
            BlueprintInput(
                "sampling_mode.seed",
                "INT",
                [(generate, "sampling_mode.seed")],
                widget=True,
                default=0,
                label="draft seed",
            ),
            BlueprintInput("thinking", "BOOLEAN", [(generate, "thinking")], widget=True, default=False),
        ],
        [
            BlueprintOutput("title", "STRING", (parse, "title")),
            BlueprintOutput("style", "STRING", (parse, "style")),
            BlueprintOutput("lyrics", "STRING", (parse, "lyrics")),
            BlueprintOutput("artwork_prompt", "STRING", (parse, "artwork_prompt")),
            BlueprintOutput("report", "PLENIO_REPORT", (parse, "report")),
        ],
    )


def yue2_plan() -> Blueprint:
    g = Graph()
    plan = g.add(
        "YuE2GenerateABC",
        (0, 0),
        size=(340, 330),
        widgets={"seed": 0, "seed.control": "fixed", "mode": "full"},
    )
    empty = g.add("PrimitiveString", (0, 380), size=(300, 60), title="No score", widgets={"value": ""})
    switch = g.add("ComfySwitchNode", (400, 0), size=(260, 90), widgets={"switch": True})
    g.link(empty, "STRING", switch, "on_false")
    g.link(plan, "abc", switch, "on_true")
    return Blueprint(
        "Plenio · YuE2 Plan",
        "Plenio/YuE2",
        "Plans the song's score (ABC) from style and lyrics with YuE2. With planning off, no score is made and "
        "YuE2 renders without a plan.",
        g,
        [
            BlueprintInput("clip", "CLIP", [(plan, "clip")]),
            BlueprintInput("style", "STRING", [(plan, "style")]),
            BlueprintInput("lyrics", "STRING", [(plan, "lyrics")]),
            BlueprintInput("seed", "INT", [(plan, "seed")], widget=True, default=0, label="plan seed"),
            BlueprintInput(
                "switch", "BOOLEAN", [(switch, "switch")], widget=True, default=True, label="planning"
            ),
            BlueprintInput("mode", "COMBO", [(plan, "mode")], widget=True, default="full", label="plan type"),
        ],
        [BlueprintOutput("score", "*", (switch, "output"))],
    )


def yue2_render() -> Blueprint:
    g = Graph()
    music = g.add("YuE2GenerateMusic", (0, 0), size=(340, 380), widgets={"seed": 0, "seed.control": "fixed"})
    latent = g.add("EmptyYuE2LatentAudio", (400, 0), size=(260, 80))
    zero = g.add("ConditioningZeroOut", (400, 130), size=(240, 50))
    sampler = g.add(
        "KSampler",
        (700, 0),
        size=(300, 260),
        widgets={
            "seed": 0,
            "seed.control": "fixed",
            "steps": 32,
            "cfg": 1.0,
            "sampler_name": "dpm_2",
            "scheduler": "sgm_uniform",
            "denoise": 1.0,
        },
    )
    decode = g.add("VAEDecodeAudio", (1060, 0), size=(220, 60))
    g.link(music, "seconds", latent, "seconds")
    g.link(music, "CONDITIONING", zero, "conditioning")
    g.link(music, "CONDITIONING", sampler, "positive")
    g.link(zero, "CONDITIONING", sampler, "negative")
    g.link(latent, "LATENT", sampler, "latent_image")
    g.link(sampler, "LATENT", decode, "samples")
    return Blueprint(
        "Plenio · YuE2 Render",
        "Plenio/YuE2",
        "Renders the final style, lyrics and score with YuE2 exactly as given (native nodes, 32 steps). The take "
        "seed drives both the token and the audio sampling.",
        g,
        [
            BlueprintInput("model", "MODEL", [(sampler, "model")]),
            BlueprintInput("clip", "CLIP", [(music, "clip")]),
            BlueprintInput("vae", "VAE", [(decode, "vae")]),
            BlueprintInput("style", "STRING", [(music, "style")]),
            BlueprintInput("lyrics", "STRING", [(music, "lyrics")]),
            BlueprintInput("abc", "STRING", [(music, "abc")], label="score"),
            BlueprintInput("mode", "COMBO", [(music, "mode")], label="planning mode"),
            BlueprintInput("seed", "INT", [(music, "seed"), (sampler, "seed")], label="take seed"),
            BlueprintInput("max_duration", "FLOAT", [(music, "max_duration")], label="max seconds"),
        ],
        [
            BlueprintOutput("AUDIO", "AUDIO", (decode, "AUDIO")),
            BlueprintOutput("seconds", "FLOAT", (music, "seconds")),
        ],
    )


ABOUT_YUE2 = """# 1 · YuE2 · Song

**Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Song Sheet · Score -> YuE2 Render -> Export**

1. Describe the song in **Song Brief** (or pick a template). *vocals* switches between a sung song and an instrumental.
2. Press **Run**. The writer model drafts title, style and lyrics; YuE2 plans a score; YuE2 renders the song; Export writes a 24-bit FLAC and a release record to `output/plenio`.
3. Run again for a **new take**: the take seed changes, the text and the score stay (they are cached).

**Inspect and edit:** open a **Song Sheet** to see exactly what YuE2 receives. Edit a document there; your edit wins until its draft changes, then the run stops and asks you. Set *review* to *stop for review* to approve documents before rendering.

**Models** (downloaded on first use by ComfyUI): YuE2 3B int8, a Gemma 4 writer model. YuE2 weights are **CC BY-NC 4.0 (non-commercial)**.
"""


def yue2_song(model_bp: Blueprint, write_bp: Blueprint, plan_bp: Blueprint, render_bp: Blueprint) -> Graph:
    g = Graph()
    about = g.add_frontend(
        "MarkdownNote", (-560, 0), size=(480, 620), title="About this template", widgets=[ABOUT_YUE2]
    )
    brief = g.add(
        "PlenioSongBrief",
        (0, 0),
        size=(380, 620),
        widgets={
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
        },
    )
    model_node = g.add_subgraph(model_bp, (0, 760), size=(380, 140))
    write = g.add_subgraph(write_bp, (460, 0), size=(360, 220))
    text_sheet = g.add("PlenioSongSheet", (900, 0), size=(420, 420), title="Song Sheet · Text")
    plan = g.add_subgraph(plan_bp, (1400, 0), size=(340, 220))
    tools = g.add(
        "PlenioScoreTools", (1400, 300), size=(340, 140), widgets={"operation": "prepare from brief"}
    )
    score_sheet = g.add("PlenioSongSheet", (1820, 0), size=(420, 420), title="Song Sheet · Score")
    seed = g.add(
        "SeedNode",
        (2320, 0),
        size=(300, 90),
        title="Take seed",
        widgets={"seed": 1, "seed.control": "randomize"},
    )
    render = g.add_subgraph(render_bp, (2320, 150), size=(320, 250))
    preview = g.add("PreviewAudio", (2700, 0), size=(360, 120))
    export = g.add("PlenioExportRelease", (2700, 200), size=(360, 220), autogrow={"reports": 2})
    g.link(brief, "brief", write, "brief")
    g.link(model_node, "engine", write, "engine")
    for kind in ("title", "style", "lyrics", "artwork_prompt"):
        g.link(write, kind, text_sheet, kind)
    g.link(brief, "brief", text_sheet, "brief")
    g.link(model_node, "engine", text_sheet, "engine")
    g.link(model_node, "CLIP", plan, "clip")
    g.link(text_sheet, "style", plan, "style")
    g.link(text_sheet, "lyrics", plan, "lyrics")
    g.link(plan, "score", tools, "score")
    g.link(brief, "brief", tools, "brief")
    g.link(tools, "score", score_sheet, "score")
    g.link(text_sheet, "style", score_sheet, "context_style")
    g.link(text_sheet, "lyrics", score_sheet, "context_lyrics")
    g.link(brief, "brief", score_sheet, "brief")
    g.link(model_node, "engine", score_sheet, "engine")
    for source, name in ((model_node, "MODEL"), (model_node, "CLIP"), (model_node, "VAE")):
        g.link(source, name, render, name.lower())
    g.link(text_sheet, "style", render, "style")
    g.link(text_sheet, "lyrics", render, "lyrics")
    g.link(score_sheet, "score", render, "abc")
    g.link(score_sheet, "planning_mode", render, "mode")
    g.link(score_sheet, "score_seconds", render, "max_duration")
    g.link(seed, "seed", render, "seed")
    g.link(render, "AUDIO", preview, "audio")
    g.link(render, "AUDIO", export, "audio")
    g.link(text_sheet, "title", export, "title")
    # Only the sheets' reports: they hold the final documents, and wiring draft reports here would force the
    # writer and the planner to run even when the user replaced their documents manually.
    for index, sheet in enumerate((text_sheet, score_sheet)):
        g.link(sheet, "report", export, f"reports.report_{index}")
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · SCORE", [plan, tools, score_sheet])
    g.group("5 · RENDER", [seed, render])
    g.group("6 · EXPORT", [preview, export])
    g.group("MUSIC MODEL", [model_node], color="#444")
    del about
    return g


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    blueprints = [yue2_model(), write_song(), yue2_plan(), yue2_render()]
    for blueprint in blueprints:
        write_json(PROJECT / "subgraphs" / f"{blueprint.name}.json", blueprint_file(blueprint))
    song = yue2_song(*blueprints)
    write_json(
        PROJECT / "example_workflows" / "1 · YuE2 · Song.json", workflow(song, "1 · YuE2 · Song", blueprints)
    )
    print(f"wrote {len(blueprints)} blueprints and 1 template")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
