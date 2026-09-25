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
    App,
    Blueprint,
    BlueprintInput,
    BlueprintOutput,
    Graph,
    Node,
    blueprint_file,
    workflow,
)

sys.path.insert(0, str(PROJECT))

from plenio.core.models import ModelFile, by_file, load_catalogue  # noqa: E402

CATALOGUE = by_file(load_catalogue(PROJECT / "resources" / "models.toml"))


def catalogued(name: str) -> ModelFile:
    model = CATALOGUE[name]
    if not model.default:
        raise ValueError(f"{name} is an alternative, not a template default")
    return model


YUE2_CHECKPOINT = "yue2_3b_int8_convrot.safetensors"
LORA = "ar_lora_inst_v3abc_comfyui.safetensors"
SHEETSAGE = "sheetsage2_bf16.safetensors"
WRITER = "gemma4_e4b_it_fp8_scaled.safetensors"
MINIMAX_DIT = "minimax_music3_dit_fp16.safetensors"
MINIMAX_TE = "minimax_music3_text_encoder_pruned_int8_convrot.safetensors"
MINIMAX_VAE = "minimax_music3_dav.safetensors"
FLUX = "flux-2-klein-4b.safetensors"
FLUX_TE = "qwen_3_4b.safetensors"
FLUX_VAE = "flux2-vae.safetensors"


def model(name: str) -> dict[str, list[dict[str, str]]]:
    """Loader ``properties.models``: ComfyUI's missing-model dialog offers these downloads."""
    return {"models": [catalogued(name).download_entry()]}


def yue2_model() -> Blueprint:
    g = Graph(first_id=101)
    loader = g.add(
        "CheckpointLoaderSimple",
        (0, 0),
        size=(320, 100),
        widgets={"ckpt_name": YUE2_CHECKPOINT},
        properties=model(YUE2_CHECKPOINT),
    )
    lora = g.add(
        "LoraLoader",
        (380, 0),
        size=(320, 130),
        mode=4,
        title="Instrumental adapter (optional)",
        widgets={"lora_name": LORA, "strength_model": 0.0, "strength_clip": 1.0},
        properties=model(LORA),
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


def minimax_model() -> Blueprint:
    g = Graph(first_id=201)
    unet = g.add(
        "UNETLoader",
        (0, 0),
        size=(340, 90),
        widgets={"unet_name": MINIMAX_DIT, "weight_dtype": "default"},
        properties=model(MINIMAX_DIT),
    )
    clip = g.add(
        "CLIPLoader",
        (0, 140),
        size=(340, 110),
        widgets={"clip_name": MINIMAX_TE, "type": "minimax", "device": "default"},
        properties=model(MINIMAX_TE),
    )
    vae = g.add(
        "VAELoader",
        (0, 300),
        size=(340, 60),
        widgets={"vae_name": MINIMAX_VAE},
        properties=model(MINIMAX_VAE),
    )
    engine = g.add("PlenioEngine", (400, 140), size=(260, 60))
    g.link(clip, "CLIP", engine, "clip")
    return Blueprint(
        "Plenio · MiniMax Model",
        "Plenio/Model",
        "Loads MiniMax Music 3 (diffusion model, int8 text encoder, audio VAE) and identifies it for the Plenio "
        "nodes. MiniMax-Music3 Community License.",
        g,
        [
            BlueprintInput(
                "unet_name", "COMBO", [(unet, "unet_name")], widget=True, default=MINIMAX_DIT, label="model"
            ),
            BlueprintInput(
                "clip_name",
                "COMBO",
                [(clip, "clip_name")],
                widget=True,
                default=MINIMAX_TE,
                label="text encoder",
            ),
            BlueprintInput(
                "vae_name", "COMBO", [(vae, "vae_name")], widget=True, default=MINIMAX_VAE, label="vae"
            ),
        ],
        [
            BlueprintOutput("MODEL", "MODEL", (unet, "MODEL")),
            BlueprintOutput("CLIP", "CLIP", (clip, "CLIP")),
            BlueprintOutput("VAE", "VAE", (vae, "VAE")),
            BlueprintOutput("engine", "PLENIO_ENGINE", (engine, "engine")),
        ],
    )


def minimax_render() -> Blueprint:
    g = Graph(first_id=301)
    encode = g.add(
        "MiniMaxMusic3TextEncode",
        (0, 0),
        size=(340, 330),
        widgets={
            "caption": "",
            "lyrics": "",
            "seed": 0,
            "seed.control": "fixed",
            "max_duration": 120.0,
            "cfg_scale": 1.7,
            "top_k": 50,
        },
    )
    latent = g.add("EmptyMiniMaxMusic3LatentAudio", (400, 0), size=(280, 80))
    zero = g.add("ConditioningZeroOut", (400, 130), size=(240, 50))
    sampler = g.add(
        "KSampler",
        (720, 0),
        size=(300, 260),
        widgets={
            "seed": 0,
            "seed.control": "fixed",
            "steps": 30,
            "cfg": 1.7,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": 1.0,
        },
    )
    decode = g.add("VAEDecodeAudio", (1080, 0), size=(220, 60))
    tiled = g.add(
        "VAEDecodeAudioTiled", (1080, 110), size=(260, 90), widgets={"tile_size": 1536, "overlap": 64}
    )
    switch = g.add(
        "ComfySwitchNode", (1380, 0), size=(260, 90), title="Tiled decode", widgets={"switch": False}
    )
    g.link(encode, "seconds", latent, "seconds")
    g.link(encode, "CONDITIONING", zero, "conditioning")
    g.link(encode, "CONDITIONING", sampler, "positive")
    g.link(zero, "CONDITIONING", sampler, "negative")
    g.link(latent, "LATENT", sampler, "latent_image")
    g.link(sampler, "LATENT", decode, "samples")
    g.link(sampler, "LATENT", tiled, "samples")
    g.link(decode, "AUDIO", switch, "on_false")
    g.link(tiled, "AUDIO", switch, "on_true")
    return Blueprint(
        "Plenio · MiniMax Render",
        "Plenio/MiniMax",
        "Renders the final caption and lyrics with MiniMax Music 3 exactly as given (native nodes, 30 steps). The "
        "take seed drives both the token and the audio sampling; max seconds is the ceiling, the model may end "
        "earlier. Turn on tiled decode if decoding runs out of memory.",
        g,
        [
            BlueprintInput("model", "MODEL", [(sampler, "model")]),
            BlueprintInput("clip", "CLIP", [(encode, "clip")]),
            BlueprintInput("vae", "VAE", [(decode, "vae"), (tiled, "vae")]),
            BlueprintInput("caption", "STRING", [(encode, "caption")]),
            BlueprintInput("lyrics", "STRING", [(encode, "lyrics")]),
            BlueprintInput("seed", "INT", [(encode, "seed"), (sampler, "seed")], label="take seed"),
            BlueprintInput("max_duration", "FLOAT", [(encode, "max_duration")], label="max seconds"),
            BlueprintInput(
                "switch", "BOOLEAN", [(switch, "switch")], widget=True, default=False, label="tiled decode"
            ),
        ],
        [
            BlueprintOutput("AUDIO", "AUDIO", (switch, "output")),
            BlueprintOutput("seconds", "FLOAT", (encode, "seconds")),
        ],
    )


WARM_GENTLE = "Warm - gentle (workflow default)"
MASTER_TARGET = "streaming (-14 LUFS, -1 dBTP)"
MASTER_STYLE = "Balanced - gentle glue"


def master() -> Blueprint:
    g = Graph(first_id=401)
    eq = g.add(
        "PlenioEQ",
        (0, 0),
        size=(340, 200),
        widgets={"mode": "match preset", "mode.preset": WARM_GENTLE},
    )
    loudness = g.add(
        "PlenioLoudness",
        (400, 0),
        size=(340, 200),
        widgets={"target": MASTER_TARGET, "compression": MASTER_STYLE, "sample_rate": "keep"},
    )
    g.link(eq, "audio", loudness, "audio")
    return Blueprint(
        "Plenio · Master",
        "Plenio/Mastering",
        "Finishes a song: a gentle tone match (EQ) and loudness for streaming (-14 LUFS, -1 dBTP true peak) with "
        "gentle compression. Open the block to change the EQ curve or the compression style.",
        g,
        [
            BlueprintInput("audio", "AUDIO", [(eq, "audio")]),
            BlueprintInput("reference", "AUDIO", [(eq, "reference")]),
            BlueprintInput(
                "sample_rate",
                "COMBO",
                [(loudness, "sample_rate")],
                widget=True,
                default="keep",
                label="sample rate",
            ),
        ],
        [
            BlueprintOutput("audio", "AUDIO", (loudness, "audio")),
            BlueprintOutput("eq_report", "PLENIO_REPORT", (eq, "report")),
            BlueprintOutput("loudness_report", "PLENIO_REPORT", (loudness, "report")),
        ],
    )


def write_song() -> Blueprint:
    g = Graph(first_id=501)
    compose = g.add("PlenioComposePrompt", (0, 0), size=(300, 100))
    loader = g.add(
        "CLIPLoader",
        (0, 160),
        size=(300, 110),
        title="Writer model",
        widgets={"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        properties=model(WRITER),
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
            BlueprintInput("score", "STRING", [(compose, "score")]),
            BlueprintInput("language", "STRING", [(compose, "language")]),
            BlueprintInput("reference_lyrics", "STRING", [(compose, "reference_lyrics")]),
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


def transcribe_score() -> Blueprint:
    g = Graph(first_id=601)
    loader = g.add(
        "AudioEncoderLoader",
        (0, 0),
        size=(320, 90),
        title="SheetSage2",
        widgets={"audio_encoder_name": SHEETSAGE},
        properties=model(SHEETSAGE),
    )
    node = g.add("PlenioTranscribeScore", (380, 0), size=(320, 120))
    g.link(loader, "AUDIO_ENCODER", node, "audio_encoder")
    return Blueprint(
        "Plenio · Transcribe Score",
        "Plenio/Audio analysis",
        "Transcribes a recording into a native two-voice ABC score with SheetSage2 and keeps the beat grid "
        "(bar times, sung notes) for lyrics alignment. Also outputs the loaded SheetSage2 for Check Vocals. "
        "SheetSage2 weights are CC BY-NC 4.0.",
        g,
        [BlueprintInput("audio", "AUDIO", [(node, "audio")])],
        [
            BlueprintOutput("score", "STRING", (node, "score")),
            BlueprintOutput("timeline", "PLENIO_TIMELINE", (node, "timeline")),
            BlueprintOutput("report", "PLENIO_REPORT", (node, "report")),
            BlueprintOutput("AUDIO_ENCODER", "AUDIO_ENCODER", (loader, "AUDIO_ENCODER")),
        ],
    )


def yue2_plan() -> Blueprint:
    g = Graph(first_id=701)
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
    g = Graph(first_id=801)
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


def yue2_takes() -> Blueprint:
    """N renders of the same documents with the seeds take_seed, take_seed + 1, ... (native loop, AS-16)."""
    g = Graph(first_id=901)
    start = g.add(
        "StartLoop",
        (0, 0),
        size=(300, 170),
        widgets={"mode": "simple", "mode.num_iterations": 1, "cache_iterations": False},
    )
    seed = g.add(
        "ComfyMathExpression",
        (0, 230),
        size=(300, 150),
        title="take seed + iteration",
        widgets={"expression": "a + b"},
    )
    music = g.add(
        "YuE2GenerateMusic", (360, 0), size=(340, 380), widgets={"seed": 0, "seed.control": "fixed"}
    )
    latent = g.add("EmptyYuE2LatentAudio", (760, 0), size=(260, 80))
    zero = g.add("ConditioningZeroOut", (760, 130), size=(240, 50))
    sampler = g.add(
        "KSampler",
        (1060, 0),
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
    decode = g.add("VAEDecodeAudio", (1420, 0), size=(220, 60))
    end = g.add("EndLoop", (1700, 0), size=(260, 120), widgets={"accumulate": True})
    g.link(start, "iteration_index", seed, "values.a")
    g.link(seed, "INT", music, "seed")
    g.link(seed, "INT", sampler, "seed")
    g.link(music, "seconds", latent, "seconds")
    g.link(music, "CONDITIONING", zero, "conditioning")
    g.link(music, "CONDITIONING", sampler, "positive")
    g.link(zero, "CONDITIONING", sampler, "negative")
    g.link(latent, "LATENT", sampler, "latent_image")
    g.link(sampler, "LATENT", decode, "samples")
    g.link(decode, "AUDIO", end, "output_value")
    return Blueprint(
        "Plenio · YuE2 Takes",
        "Plenio/YuE2",
        "Renders the final style, lyrics and score N times with the seeds take seed, take seed + 1, ... "
        "(native loop). Connect the takes to Check Vocals, which keeps the best one. N takes cost N renders.",
        g,
        [
            BlueprintInput("model", "MODEL", [(sampler, "model")]),
            BlueprintInput("clip", "CLIP", [(music, "clip")]),
            BlueprintInput("vae", "VAE", [(decode, "vae")]),
            BlueprintInput("style", "STRING", [(music, "style")]),
            # The loop starts only with the final lyrics: a native loop whose body is blocked (a Song
            # Sheet waiting for review) never finishes in ComfyUI 0.37.0 (Phase 4B, measured).
            BlueprintInput("lyrics", "STRING", [(music, "lyrics"), (start, "initial_iteration_value")]),
            BlueprintInput("abc", "STRING", [(music, "abc")], label="score"),
            BlueprintInput("mode", "COMBO", [(music, "mode")], label="planning mode"),
            BlueprintInput("seed", "INT", [(seed, "values.b")], label="take seed"),
            BlueprintInput("max_duration", "FLOAT", [(music, "max_duration")], label="max seconds"),
            BlueprintInput("takes", "INT", [(start, "mode.num_iterations")], default=1),
        ],
        [BlueprintOutput("takes", "AUDIO", (end, "outputs"))],
    )


COVER_SIZE = 1024


def cover_art() -> Blueprint:
    g = Graph(first_id=1001)
    unet = g.add(
        "UNETLoader",
        (0, 0),
        size=(340, 90),
        widgets={"unet_name": FLUX, "weight_dtype": "default"},
        properties=model(FLUX),
    )
    clip = g.add(
        "CLIPLoader",
        (0, 140),
        size=(340, 110),
        widgets={"clip_name": FLUX_TE, "type": "flux2", "device": "default"},
        properties=model(FLUX_TE),
    )
    vae = g.add(
        "VAELoader", (0, 300), size=(340, 60), widgets={"vae_name": FLUX_VAE}, properties=model(FLUX_VAE)
    )
    encode = g.add("CLIPTextEncode", (400, 0), size=(340, 160), widgets={"text": ""})
    zero = g.add("ConditioningZeroOut", (400, 220), size=(240, 50))
    guider = g.add("CFGGuider", (780, 0), size=(260, 100), widgets={"cfg": 1.0})
    noise = g.add(
        "RandomNoise", (780, 150), size=(260, 90), widgets={"noise_seed": 0, "noise_seed.control": "fixed"}
    )
    select = g.add("KSamplerSelect", (780, 290), size=(260, 60), widgets={"sampler_name": "euler"})
    scheduler = g.add(
        "Flux2Scheduler",
        (780, 400),
        size=(260, 110),
        widgets={"steps": 4, "width": COVER_SIZE, "height": COVER_SIZE},
    )
    latent = g.add(
        "EmptyFlux2LatentImage",
        (780, 560),
        size=(260, 110),
        widgets={"width": COVER_SIZE, "height": COVER_SIZE, "batch_size": 1},
    )
    sample = g.add("SamplerCustomAdvanced", (1100, 0), size=(260, 110))
    decode = g.add("VAEDecode", (1420, 0), size=(220, 50))
    g.link(clip, "CLIP", encode, "clip")
    g.link(encode, "CONDITIONING", zero, "conditioning")
    g.link(unet, "MODEL", guider, "model")
    g.link(encode, "CONDITIONING", guider, "positive")
    g.link(zero, "CONDITIONING", guider, "negative")
    g.link(noise, "NOISE", sample, "noise")
    g.link(guider, "GUIDER", sample, "guider")
    g.link(select, "SAMPLER", sample, "sampler")
    g.link(scheduler, "SIGMAS", sample, "sigmas")
    g.link(latent, "LATENT", sample, "latent_image")
    g.link(sample, "output", decode, "samples")
    g.link(vae, "VAE", decode, "vae")
    return Blueprint(
        "Plenio · Cover Art",
        "Plenio/Artwork",
        "Paints the cover from the Song Sheet's artwork prompt with FLUX.2 Klein 4B (distilled, 4 steps, "
        "native nodes; Apache-2.0). The templates keep it bypassed because it needs about 16 GB of extra model "
        "files: select it and press Ctrl+B to turn it on. The seed is fixed, so new takes keep the cover; "
        "change it for another cover. Replace the block with any text-to-image block that takes a prompt and "
        "gives an image.",
        g,
        [
            BlueprintInput("text", "STRING", [(encode, "text")], label="prompt"),
            BlueprintInput("noise_seed", "INT", [(noise, "noise_seed")], default=0, label="cover seed"),
            BlueprintInput(
                "size",
                "INT",
                [(scheduler, "width"), (scheduler, "height"), (latent, "width"), (latent, "height")],
                default=COVER_SIZE,
                label="size (square, px)",
            ),
        ],
        [BlueprintOutput("IMAGE", "IMAGE", (decode, "IMAGE"))],
    )


# --- templates ------------------------------------------------------------------------------------

GROUP = "#3f789e"
MODEL_GROUP = "#444"
OPTIONAL_GROUP = "#555"
ABOUT_SIZE = (480, 760)


def about_note(g: Graph, text: str, height: float = ABOUT_SIZE[1]) -> Node:
    return g.add_frontend(
        "MarkdownNote", (-560, 0), size=(ABOUT_SIZE[0], height), title="About this template", widgets=[text]
    )


def take_seed(g: Graph, pos: tuple[float, float]) -> Node:
    return g.add(
        "SeedNode",
        pos,
        size=(300, 90),
        title="Take seed",
        widgets={"seed": 1, "seed.control": "randomize"},
        labels={"seed": "take seed"},
    )


def finish(
    g: Graph,
    blueprints: dict[str, Blueprint],
    x: float,
    *,
    audio: tuple[Node, str],
    title: tuple[Node, str],
    artwork: tuple[Node, str],
    reports: list[tuple[Node, str]],
    group: str,
    export_widgets: dict[str, object] | None = None,
) -> tuple[Node, Node, Node]:
    """Master -> Preview + Export (the unmastered take as the original), and the optional Cover Art."""
    master = g.add_subgraph(blueprints["master"], (x, 0), size=(340, 170))
    preview = g.add("PreviewAudio", (x, 230), size=(340, 120), title="Preview (mastered)")
    all_reports = [*reports, (master, "eq_report"), (master, "loudness_report")]
    export = g.add(
        "PlenioExportRelease",
        (x + 400, 0),
        size=(380, 440),
        autogrow={"reports": len(all_reports)},
        widgets=export_widgets,
    )
    cover = g.add_subgraph(
        blueprints["cover"], (x, 560), size=(340, 170), mode=4, title="Cover Art (optional)"
    )
    cover_preview = g.add(
        "PreviewImage", (x + 400, 560), size=(300, 300), mode=4, title="Cover preview (optional)"
    )
    g.link(audio[0], audio[1], master, "audio")
    g.link(master, "audio", preview, "audio")
    g.link(master, "audio", export, "audio")
    g.link(audio[0], audio[1], export, "original")
    g.link(title[0], title[1], export, "title")
    g.link(artwork[0], artwork[1], cover, "text")
    g.link(cover, "IMAGE", export, "cover")
    g.link(cover, "IMAGE", cover_preview, "images")
    for index, (node, output) in enumerate(all_reports):
        g.link(node, output, export, f"reports.report_{index}")
    g.group(group, [master, preview, export])
    g.group("COVER ART (optional)", [cover, cover_preview], color=OPTIONAL_GROUP)
    return master, preview, export


FINISH_TEXT = (
    "**Finish:** *Plenio · Master* brings the take to -14 LUFS / -1 dBTP with a gentle tone match (open the "
    "block to change the EQ or the loudness target). Export writes the mastered FLAC 24-bit, the unmastered "
    "take as `(original).flac` and a release record to `output/plenio`."
)
COVER_TEXT = (
    "**Cover art (optional, bypassed):** *Cover Art* paints a cover from the sheet's artwork prompt with "
    "FLUX.2 Klein 4B (about 16 GB of extra model files, Apache-2.0). Select it and the cover preview and "
    "press **Ctrl+B**; Export then embeds the cover."
)
APP_TEXT = (
    "**App mode:** switch *Graph / App* at the top left for a simple form with the brief, the take seed and "
    "the results (no review stops)."
)

ABOUT_YUE2 = f"""# 1 · YuE2 · Song

**Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Song Sheet · Score -> YuE2 Render -> Master -> Export**

1. Describe the song in **Song Brief** (or pick a template). *vocals* switches between a sung song and an instrumental.
2. Press **Run**. The writer model drafts title, style and lyrics; YuE2 plans a score and renders the song.
3. Run again for a **new take**: the take seed changes, the text and the score stay (they are cached).

**Inspect and edit:** open a **Song Sheet** to see exactly what YuE2 receives. Edit a document there; your edit wins until its draft changes, then the run stops and asks you. Set *review* to *stop for review* to approve documents before rendering.

{FINISH_TEXT}

{COVER_TEXT}

{APP_TEXT}

**Models** (ComfyUI offers the downloads when you open the template): YuE2 3B int8 (4.0 GB), the Gemma 4 E4B writer. YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The model block below is collapsed; expand it to choose other files.
"""


def yue2_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_YUE2)
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
    model_node = g.add_subgraph(bp["yue2_model"], (0, 760), size=(380, 140), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(360, 220))
    text_sheet = g.add("PlenioSongSheet", (900, 0), size=(420, 420), title="Song Sheet · Text")
    plan = g.add_subgraph(bp["yue2_plan"], (1400, 0), size=(340, 220))
    tools = g.add(
        "PlenioScoreTools", (1400, 300), size=(340, 140), widgets={"operation": "prepare from brief"}
    )
    score_sheet = g.add("PlenioSongSheet", (1820, 0), size=(420, 420), title="Song Sheet · Score")
    seed = take_seed(g, (2320, 0))
    render = g.add_subgraph(bp["yue2_render"], (2320, 150), size=(320, 250))
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
    # Only the sheets' reports (and the master's): they hold the final documents, and wiring draft reports
    # here would force the writer and the planner to run even when the user replaced their documents manually.
    _master, preview, export = finish(
        g,
        bp,
        2720,
        audio=(render, "AUDIO"),
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[(text_sheet, "report"), (score_sheet, "report")],
        group="6 · FINISH",
    )
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · SCORE", [plan, tools, score_sheet])
    g.group("5 · RENDER", [seed, render])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    return g, song_app(brief, seed, preview, export)


def song_app(brief: Node, seed: Node, preview: Node, export: Node) -> App:
    # The sung options only: App Mode (frontend 1.52) drops controls of the option that is not selected,
    # so the instrumental options are set in the graph.
    controls = ["template", "description", "genre", "mood", "tempo", "length", "vocals"]
    controls += ["vocals.language", "vocals.voice", "vocals.theme"]
    return App([(brief, name) for name in controls] + [(seed, "seed")], [preview, export])


ABOUT_COVER = f"""# 2 · YuE2 · Cover

**Source -> Transcribe Score -> Song Sheet · Score -> lyrics (ASR, writer or section tags) -> Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Master -> Export**

1. Load the **source** recording (upload in *Load Audio*; up to 5:00 - trim longer songs with the optional *Excerpt* node).
2. In **Cover Brief** choose the target style and what happens to the vocals: *instrumental* (default; an instrument plays the melody, or accompaniment only), *original lyrics* (transcribed from the source) or *new lyrics* (written on the source's melody). *harmony* keeps or replaces the original chords.
3. Press **Run**: SheetSage2 transcribes the source and the run **stops at Song Sheet · Score**. Open it, check the score (fix section names and boundaries), then *Approve*.
4. Run again: the lyrics are drafted (ASR of the original, the writer's new lyrics, or the section tags) and the run **stops at Song Sheet · Text**. Correct or replace the lyrics - your text always wins - and *Approve*.
5. Run again to render. Each further run is a new take (the take seed changes).

**New lyrics** are understood only when they fit the melody - about one syllable per note - and the voice fits its range; Song Sheet · Text warns about both.

**Takes:** *YuE2 Takes* renders *takes* versions (seeds take seed, +1, ...); **Check Vocals** keeps the first instrumental take without vocal notes, the preview plays all takes. N takes cost N renders. **Instrumental adapter:** for instrumental covers YuE2 renders with the instrumental LoRA of the *Instrumental adapter* node (the optional adapter inside the model block stays bypassed here). **Check sung lyrics** (optional, bypassed) measures what a sung take actually sang.

{FINISH_TEXT}

{COVER_TEXT}

This path has no App mode: the two review stops need the Song Sheet editor.

**Models** (downloaded on first use): YuE2 3B int8, SheetSage2, the instrumental adapter, the Gemma 4 E4B writer; the lyrics ASR (faster-whisper large-v3, 3.1 GB) is fetched by Plenio when first needed. YuE2, SheetSage2 and the adapter are **CC BY-NC 4.0 (non-commercial)**.
"""


def yue2_cover(bp: dict[str, Blueprint]) -> Graph:
    g = Graph()
    about_note(g, ABOUT_COVER, height=900)
    source = g.add(
        "LoadAudio", (0, 0), size=(360, 140), title="Source recording", widgets={"audio": "cover_source.flac"}
    )
    excerpt = g.add(
        "TrimAudioDuration",
        (0, 180),
        size=(360, 110),
        mode=4,
        title="Excerpt (optional)",
        widgets={"start_index": 0.0, "duration": 120.0},
    )
    brief = g.add(
        "PlenioCoverBrief",
        (0, 400),
        size=(380, 520),
        widgets={"genre": "acoustic folk", "mood": "warm, intimate", "vocals": "instrumental"},
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, 1060), size=(380, 140), collapsed=True)
    adapter = g.add(
        "LoraLoader",
        (0, 1140),
        size=(380, 130),
        title="Instrumental adapter",
        widgets={"lora_name": LORA, "strength_model": 0.0, "strength_clip": 1.0},
        properties=model(LORA),
    )
    adapter_switch = g.add(
        "ComfySwitchNode", (420, 1140), size=(260, 90), title="Adapter for instrumental covers"
    )
    transcribe = g.add_subgraph(bp["transcribe"], (460, 0), size=(340, 160))
    tools = g.add(
        "PlenioScoreTools", (460, 220), size=(340, 140), widgets={"operation": "prepare from brief"}
    )
    score_sheet = g.add(
        "PlenioSongSheet",
        (880, 0),
        size=(420, 420),
        title="Song Sheet · Score",
        widgets={"review": "stop for review"},
    )
    # Original lyrics: the Cover Brief owns the source's language; new lyrics: this widget does (AUD-02).
    asr = g.add(
        "PlenioTranscribeLyrics",
        (1380, 0),
        size=(340, 240),
        title="Transcribe Lyrics",
        labels={"language": "source language (original lyrics: Cover Brief)"},
    )
    write = g.add_subgraph(bp["write"], (1380, 300), size=(360, 260))
    source_switch = g.add("ComfySwitchNode", (1800, 0), size=(260, 90), title="Original or new lyrics")
    tags_switch = g.add("ComfySwitchNode", (1800, 140), size=(260, 90), title="Instrumental: section tags")
    text_sheet = g.add(
        "PlenioSongSheet",
        (2120, 0),
        size=(420, 420),
        title="Song Sheet · Text",
        widgets={"review": "stop for review"},
    )
    seed = take_seed(g, (2620, 0))
    render = g.add_subgraph(bp["yue2_takes"], (2620, 150), size=(320, 280), title="YuE2 Takes")
    check_vocals = g.add("PlenioVocalCheck", (3000, 0), size=(340, 160), title="Check Vocals · best take")
    takes_preview = g.add("PreviewAudio", (3000, 220), size=(340, 120), title="Preview (all takes)")
    check_lyrics = g.add(
        "PlenioTranscribeLyrics",
        (3000, 560),
        size=(340, 200),
        mode=4,
        title="Check sung lyrics (optional)",
    )

    g.link(source, "AUDIO", excerpt, "audio")
    g.link(excerpt, "AUDIO", transcribe, "audio")
    g.link(transcribe, "score", tools, "score")
    g.link(brief, "brief", tools, "brief")
    g.link(tools, "score", score_sheet, "score")
    g.link(transcribe, "timeline", score_sheet, "timeline")
    g.link(excerpt, "AUDIO", score_sheet, "reference_audio")  # A/B listening in the score editor
    g.link(brief, "brief", score_sheet, "brief")
    g.link(model_node, "engine", score_sheet, "engine")
    g.link(excerpt, "AUDIO", asr, "audio")
    g.link(score_sheet, "score", asr, "score")
    g.link(transcribe, "timeline", asr, "timeline")
    g.link(brief, "brief", asr, "brief")
    g.link(brief, "brief", write, "brief")
    g.link(model_node, "engine", write, "engine")
    g.link(score_sheet, "score", write, "score")
    g.link(asr, "language", write, "language")
    g.link(asr, "lyrics", write, "reference_lyrics")  # sectioned: line-by-line syllable targets
    g.link(brief, "use_source_lyrics", source_switch, "switch")
    g.link(asr, "lyrics", source_switch, "on_true")
    g.link(write, "lyrics", source_switch, "on_false")
    g.link(brief, "instrumental", tags_switch, "switch")
    g.link(score_sheet, "section_tags", tags_switch, "on_true")
    g.link(source_switch, "output", tags_switch, "on_false")
    for kind in ("title", "style", "artwork_prompt"):
        g.link(write, kind, text_sheet, kind)
    g.link(tags_switch, "output", text_sheet, "lyrics")
    g.link(score_sheet, "score", text_sheet, "context_score")
    g.link(transcribe, "timeline", text_sheet, "timeline")
    g.link(brief, "brief", text_sheet, "brief")
    g.link(model_node, "engine", text_sheet, "engine")
    g.link(model_node, "MODEL", adapter, "model")
    g.link(model_node, "CLIP", adapter, "clip")
    g.link(brief, "instrumental", adapter_switch, "switch")
    g.link(adapter, "CLIP", adapter_switch, "on_true")
    g.link(model_node, "CLIP", adapter_switch, "on_false")
    g.link(model_node, "MODEL", render, "model")
    g.link(adapter_switch, "output", render, "clip")
    g.link(model_node, "VAE", render, "vae")
    g.link(text_sheet, "style", render, "style")
    g.link(text_sheet, "lyrics", render, "lyrics")
    g.link(score_sheet, "score", render, "abc")
    g.link(score_sheet, "planning_mode", render, "mode")
    g.link(score_sheet, "score_seconds", render, "max_duration")
    g.link(seed, "seed", render, "seed")
    g.link(render, "takes", check_vocals, "audio")
    g.link(transcribe, "AUDIO_ENCODER", check_vocals, "audio_encoder")
    g.link(brief, "brief", check_vocals, "brief")
    g.link(check_vocals, "takes", takes_preview, "audio")
    g.link(check_vocals, "audio", check_lyrics, "audio")
    g.link(text_sheet, "lyrics", check_lyrics, "expected_lyrics")
    finish(
        g,
        bp,
        3420,
        audio=(check_vocals, "audio"),
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[
            (score_sheet, "report"),
            (text_sheet, "report"),
            (transcribe, "report"),
            (check_vocals, "report"),
            (check_lyrics, "report"),
        ],
        group="7 · FINISH",
    )
    g.group("1 · SOURCE", [source, excerpt])
    g.group("2 · COVER", [brief])
    g.group("3 · SCORE", [transcribe, tools, score_sheet])
    g.group("4 · LYRICS", [asr, write, source_switch, tags_switch])
    g.group("5 · TEXT", [text_sheet])
    g.group("6 · RENDER", [seed, render, check_vocals, takes_preview])
    g.group("CHECK SUNG LYRICS (optional)", [check_lyrics], color=OPTIONAL_GROUP)
    g.group("MUSIC MODEL", [model_node, adapter, adapter_switch], color=MODEL_GROUP)
    return g


ABOUT_MINIMAX = f"""# 3 · MiniMax · Song

**Brief -> Write Song -> Song Sheet -> MiniMax Render -> Master -> Export**

1. Describe the song in **Song Brief** (or pick a template). *vocals* switches between a sung song and an instrumental.
2. Press **Run**. The writer model drafts title, a structured **caption** (Global Metadata, Vocal Details, Arrangement), lyrics and an artwork prompt; MiniMax Music 3 renders the song.
3. Run again for a **new take**: the take seed changes, the documents stay (they are cached).

**Inspect and edit:** open the **Song Sheet** to see exactly what MiniMax receives. Caption and lyrics together must stay under **5 000 tokens** (the sheet counts them exactly with the loaded text encoder and stops before rendering if they do not fit). The render ceiling follows the brief's length, at most 6:00; the model can end earlier.

**Instrumentals:** the lyrics are a map of section tags ([Intro], [Instrumental], [Solo], ...), about twice as long as a sung song's, and the caption's Vocal Details are *n/a*.

{FINISH_TEXT}

{COVER_TEXT}

{APP_TEXT}

**Models** (ComfyUI offers the downloads when you open the template): MiniMax Music 3 (diffusion model 4.9 GB, int8 text encoder 9.2 GB, VAE), the Gemma 4 E4B writer. MiniMax Music 3 weights: **MiniMax-Music3 Community License**. If decoding runs out of memory, turn on *tiled decode* in MiniMax Render.
"""


def minimax_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_MINIMAX)
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
    model_node = g.add_subgraph(bp["minimax_model"], (0, 760), size=(380, 160), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(360, 220))
    sheet = g.add("PlenioSongSheet", (900, 0), size=(420, 420), title="Song Sheet")
    seed = take_seed(g, (1400, 0))
    render = g.add_subgraph(bp["minimax_render"], (1400, 150), size=(320, 250))
    g.link(brief, "brief", write, "brief")
    g.link(model_node, "engine", write, "engine")
    for kind in ("title", "style", "lyrics", "artwork_prompt"):
        g.link(write, kind, sheet, kind)
    g.link(brief, "brief", sheet, "brief")
    g.link(model_node, "engine", sheet, "engine")
    for source, name in ((model_node, "MODEL"), (model_node, "CLIP"), (model_node, "VAE")):
        g.link(source, name, render, name.lower())
    g.link(sheet, "style", render, "caption")
    g.link(sheet, "lyrics", render, "lyrics")
    g.link(sheet, "score_seconds", render, "max_duration")
    g.link(seed, "seed", render, "seed")
    _master, preview, export = finish(
        g,
        bp,
        1800,
        audio=(render, "AUDIO"),
        title=(sheet, "title"),
        artwork=(sheet, "artwork_prompt"),
        reports=[(sheet, "report")],
        group="5 · FINISH",
    )
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write])
    g.group("3 · SHEET", [sheet])
    g.group("4 · RENDER", [seed, render])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    return g, song_app(brief, seed, preview, export)


ABOUT_ENHANCE = """# 4 · Enhance & Master

**Load Audio -> EQ -> Loudness & Dynamics -> Export**

Finishes an existing recording (for example a take you rendered earlier) without any music model.

1. Upload the file in **Load Audio**.
2. **EQ** starts with a gentle warm tone match (*match preset*). Choose *manual* to draw your own curve, *flat* for no EQ, or connect a **reference** recording and pick a reference recipe.
3. **Loudness & Dynamics** brings the song to -14 LUFS with a true peak of at most -1 dBTP (streaming); pick another target or compression style if you like.
4. Press **Run**. Export writes FLAC 24-bit and MP3 V0 to `output/plenio/enhanced`, copies the source file's tags and cover, keeps the unmastered source as `(original).flac`, and writes a release record with the measured loudness.

The preview plays the result; compare it with the source in Load Audio. Nothing here needs a GPU.

**App mode:** switch *Graph / App* at the top left for a simple form (file, EQ, target, compression).
"""


def enhance_master() -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_ENHANCE, height=560)
    source = g.add("LoadAudio", (0, 0), size=(340, 140), title="Source")
    eq = g.add(
        "PlenioEQ",
        (420, 0),
        size=(420, 420),
        widgets={"mode": "match preset", "mode.preset": WARM_GENTLE},
        labels={"mode": "EQ"},
    )
    loudness = g.add(
        "PlenioLoudness",
        (900, 0),
        size=(340, 220),
        widgets={"target": MASTER_TARGET, "compression": MASTER_STYLE, "sample_rate": "keep"},
        labels={"target": "loudness target"},
    )
    preview = g.add("PreviewAudio", (1320, 0), size=(360, 120), title="Preview (mastered)")
    export = g.add(
        "PlenioExportRelease",
        (1320, 180),
        size=(380, 400),
        autogrow={"reports": 2},
        widgets={
            "folder": "plenio/enhanced",
            "naming": "{title}",
            "mp3": True,
            "tags": "copy from loaded file",
        },
    )
    g.link(source, "AUDIO", eq, "audio")
    g.link(eq, "audio", loudness, "audio")
    g.link(loudness, "audio", preview, "audio")
    g.link(loudness, "audio", export, "audio")
    g.link(source, "AUDIO", export, "original")
    g.link(eq, "report", export, "reports.report_0")
    g.link(loudness, "report", export, "reports.report_1")
    g.group("1 · SOURCE", [source])
    g.group("2 · MASTER", [eq, loudness])
    g.group("3 · FINISH", [preview, export])
    app = App(
        [(source, "audio"), (eq, "mode"), (loudness, "target"), (loudness, "compression")], [preview, export]
    )
    return g, app


ABOUT_SYSTEM = """# 0 · System Check

Press **Run**. The node lists:

- ComfyUI, frontend and Plenio versions, Python and torch
- GPUs, VRAM and system RAM
- which model files of each template are installed, and what is still missing
- optional Python packages and the Plenio assets (lyrics ASR)
- the offline and download policy (`PLENIO_OFFLINE`, `PLENIO_AUTO_DOWNLOAD`)
- the hardware rule table, with the row for this machine marked

Recommendations are text only. Plenio never changes a setting or a model on its own; you choose the model files in the loader nodes of each template.

Set **detail** to `full` to include the raw facts as JSON, for example for a bug report.
"""


def system_check() -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_SYSTEM, height=520)
    check = g.add("PlenioSystemCheck", (0, 0), size=(640, 720), title="System Check")
    g.group("SYSTEM CHECK", [check])
    return g, App([(check, "detail")], [check])


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


def blueprints() -> dict[str, Blueprint]:
    return {
        "yue2_model": yue2_model(),
        "write": write_song(),
        "yue2_plan": yue2_plan(),
        "yue2_render": yue2_render(),
        "transcribe": transcribe_score(),
        "yue2_takes": yue2_takes(),
        "minimax_model": minimax_model(),
        "minimax_render": minimax_render(),
        "master": master(),
        "cover": cover_art(),
    }


def templates(bp: dict[str, Blueprint]) -> list[tuple[str, Graph, list[Blueprint], App | None]]:
    song, song_app_config = yue2_song(bp)
    minimax, minimax_app = minimax_song(bp)
    enhance, enhance_app = enhance_master()
    check, check_app = system_check()
    finish_bps = [bp["master"], bp["cover"]]
    return [
        ("0 · System Check", check, [], check_app),
        (
            "1 · YuE2 · Song",
            song,
            [bp["yue2_model"], bp["write"], bp["yue2_plan"], bp["yue2_render"], *finish_bps],
            song_app_config,
        ),
        (
            "2 · YuE2 · Cover",
            yue2_cover(bp),
            [bp["yue2_model"], bp["write"], bp["transcribe"], bp["yue2_takes"], *finish_bps],
            None,
        ),
        (
            "3 · MiniMax · Song",
            minimax,
            [bp["minimax_model"], bp["write"], bp["minimax_render"], *finish_bps],
            minimax_app,
        ),
        ("4 · Enhance & Master", enhance, [], enhance_app),
    ]


def main() -> int:
    bp = blueprints()
    for blueprint in bp.values():
        write_json(PROJECT / "subgraphs" / f"{blueprint.name}.json", blueprint_file(blueprint))
    shipped = templates(bp)
    for name, graph, used, app in shipped:
        write_json(PROJECT / "example_workflows" / f"{name}.json", workflow(graph, name, used, app))
    print(f"wrote {len(bp)} blueprints and {len(shipped)} templates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
