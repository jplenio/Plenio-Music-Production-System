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

from plenio.core.llm import CHOOSE  # noqa: E402
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
SEED_SUM = "sum(values)"  # works with or without the song seed (a blueprint used without a brief)
WRITER_MAX_TOKENS = 6144  # a long draft plus a reasoning model's thoughts (Qwen thinks 500-3000 tokens)
WRITER_CONTEXT = 12288  # Local LLM: a detailed prompt, WRITER_MAX_TOKENS and a margin
ARRANGE_MAX_TOKENS = 2048  # a JSON section plan: 300-900 tokens for up to 12 sections (study A1)
ARRANGE_CONTEXT = 8192  # the arrangement prompt (1 500-3 000 tokens) and the answer
ARRANGE_TEMPERATURE = 0.7
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
REFINE_MODEL = "pytorch_model.bin"
"""The UniverSR weights as the catalogue names them (Hugging Face serves that file name)."""
SEPARATION_MODEL = "model_bs_roformer_ep_17_sdr_9.6568.ckpt"
"""The BS-RoFormer 4-stem checkpoint of the MSST release (the catalogue names the same file)."""


def master() -> Blueprint:
    g = Graph(first_id=401)
    eq = g.add(
        "PlenioEQ",
        (0, 0),
        size=(620, 320),
        widgets={"mode": "match preset", "mode.preset": WARM_GENTLE},
    )
    loudness = g.add(
        "PlenioLoudness",
        (680, 0),
        size=(360, 220),
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


def refine() -> Blueprint:
    """Refine (48 kHz): the loader (collapsed) and the stage, wrapped for the node library (D10).

    Node ids 1201+: every blueprint body owns its own range (YuE2 Plan uses 701+), so a blueprint added
    to a template never collides with another one.
    """
    g = Graph(first_id=1201)
    loader = g.add(
        "PlenioAudioModelLoader",
        (0, 0),
        size=(340, 130),
        collapsed=True,
        title="Super-resolution model",
        widgets={"kind": "super-resolution", "kind.model": REFINE_MODEL},
        properties=model(REFINE_MODEL),
    )
    stage = g.add(
        "PlenioRefine",
        (400, 0),
        size=(340, 260),
        widgets={"engine": "model"},
        labels={"engine": "engine"},
    )
    g.link(loader, "model", stage, "model")
    return Blueprint(
        "Plenio · Refine (48 kHz)",
        "Plenio/Audio",
        "Brings the song to 48 kHz and extends the top octaves with UniverSR (vocoder-free flow "
        "matching), keeping everything below the crossover from the render (complementary crossover). "
        "Same duration, no normalisation; the report shows engine, bandwidth before and after, crossover, "
        "loudness change and timing. The model always runs when it is connected, also for input that "
        "already reaches 20 kHz.",
        g,
        [
            BlueprintInput("audio", "AUDIO", [(stage, "audio")]),
            # promoted widgets: every template sets its own stages on the wrapper node
            BlueprintInput("preset", "COMBO", [(stage, "preset")], label="stage template"),
            BlueprintInput("pre_hz", "FLOAT", [(stage, "pre_hz")], label="pre (model input)"),
            BlueprintInput("post_hz", "FLOAT", [(stage, "post_hz")], label="post (roll-off)"),
            BlueprintInput("crossover_hz", "FLOAT", [(stage, "crossover_hz")], label="crossover"),
        ],
        [
            BlueprintOutput("audio", "AUDIO", (stage, "audio")),
            BlueprintOutput("report", "PLENIO_REPORT", (stage, "report")),
        ],
    )


def stems_stage(
    g: Graph,
    blueprints: dict[str, Blueprint],
    x: float,
    *,
    audio: tuple[Node, str],
    y: float = 430,
) -> tuple[tuple[Node, str], Node]:
    """The STEMS block of a template (plan §11): bypassed and collapsed in every template."""
    node = g.add_subgraph(
        blueprints["stems"],
        (x, y),
        size=(340, 170),
        title="Stems (optional)",
        mode=4,
        collapsed=True,
    )
    g.link(audio[0], audio[1], node, "audio")
    g.group("STEMS (optional)", [node], color=OPTIONAL_GROUP)
    return (node, "audio"), node


REFINE_HEIGHT = 380
"""The stage's eight widgets, its two sockets and a report summary of about four lines."""


def refine_stage(
    g: Graph,
    x: float,
    *,
    audio: tuple[Node, str],
    active: bool = False,
    y: float = 430,
    widgets: dict[str, object] | None = None,
) -> tuple[tuple[Node, str], Node]:
    """The REFINE block: the model loader and Refine as **plain nodes** in one group (plan §11).

    Not a subgraph: the ComfyUI frontend renders the promoted widgets of a subgraph node as a
    read-only preview and draws no editable widget rows for them, so the four stage widgets (the
    preset and the three numbers) could not be touched there - the owner's reports of 2026-09-28
    and 2026-09-29. Plain nodes behave like every other node in the templates.

    ``widgets`` are Refine's own widget values (the MiniMax template: preset 3 and the matching
    numbers, the owner's choice); elsewhere the node keeps its defaults (preset *custom*, pre 0 =
    the engine's condition, post 0 = off, crossover 0 = the measured bandwidth minus 500 Hz).

    Active (MiniMax), both nodes are expanded with room for the stage's report summary; bypassed,
    both are collapsed like the Stems block (Ctrl+B on the group, then expand them to see the fields).

    Returns the audio source and the stage node, so the caller can pass both to ``finish`` (its
    report).
    """
    loader = g.add(
        "PlenioAudioModelLoader",
        (x, y),
        size=(320, 110),
        title="Super-resolution model" if active else "Super-resolution model (optional)",
        widgets={"kind": "super-resolution", "kind.model": REFINE_MODEL},
        properties=model(REFINE_MODEL),
        mode=0 if active else 4,
        collapsed=not active,
    )
    stage = g.add(
        "PlenioRefine",
        (x, y + (160 if active else 50)),
        size=(360, REFINE_HEIGHT),
        title="Refine (48 kHz)" if active else "Refine (optional)",
        widgets=widgets,
        mode=0 if active else 4,
        collapsed=not active,
    )
    g.link(loader, "model", stage, "model")
    g.link(audio[0], audio[1], stage, "audio")
    g.group(
        "REFINE (48 kHz)" if active else "REFINE (optional)",
        [loader, stage],
        color=GROUP if active else OPTIONAL_GROUP,
    )
    return (stage, "audio"), stage


def stems() -> Blueprint:
    """Separate Stems + Stem Mixer as one optional block (plan §11)."""
    g = Graph(first_id=1101)  # its own id range (YuE2 Render uses 801+)
    loader = g.add(
        "PlenioAudioModelLoader",
        (0, 0),
        size=(340, 130),
        collapsed=True,
        title="Separation model",
        widgets={"kind": "separation", "kind.model": SEPARATION_MODEL},
        properties=model(SEPARATION_MODEL),
    )
    separate = g.add("PlenioSeparateStems", (400, 0), size=(340, 170))
    mixer = g.add(
        "PlenioStemMixer",
        (800, 0),
        size=(400, 260),
        widgets={"mix": ""},
        labels={"mix": "mixer"},
    )
    g.link(loader, "model", separate, "model")
    g.link(separate, "stems", mixer, "stems")
    return Blueprint(
        "Plenio · Stems",
        "Plenio/Audio",
        "Splits the song into up to four stems (vocals, drums, bass, other) and mixes them back: gain, "
        "mute/solo, compression, muted time ranges and one reverb and delay bus per mix. The residual "
        "(what the separator missed) is one more strip, so a neutral mix returns the render unchanged. "
        "Bypassed by default in every template - select the block and press Ctrl+B to use it.",
        g,
        [BlueprintInput("audio", "AUDIO", [(separate, "audio")])],
        [
            BlueprintOutput("audio", "AUDIO", (mixer, "audio")),
            BlueprintOutput("report", "PLENIO_REPORT", (mixer, "report")),
            BlueprintOutput("separation_report", "PLENIO_REPORT", (separate, "report")),
        ],
    )


def write_song() -> Blueprint:
    """Compose -> writer -> Parse. One *writer model* list (Writer Choice) holds ComfyUI's text models and
    every Local LLM model (ADR-0010); a lazy switch takes the answer of the chosen branch only, so the
    other model is never loaded. The model names reach the loaders by link, so ComfyUI does not require the
    default writer's file when a Local LLM model is chosen."""
    g = Graph(first_id=501)
    compose = g.add("PlenioComposePrompt", (0, 0), size=(300, 100))
    choice = g.add(
        "PlenioWriterChoice",
        (0, 160),
        size=(320, 120),
        title="Writer Choice",
        widgets={"model": WRITER},
        # the frontend's missing-model dialog reads the download from the node that shows the file name
        properties=model(WRITER),
    )
    loader = g.add(
        "CLIPLoader",
        (380, 0),
        size=(300, 110),
        title="Writer model (ComfyUI)",
        widgets={"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        properties=model(WRITER),
    )
    generate = g.add(
        "TextGenerate",
        (380, 160),
        size=(340, 420),
        title="Generate Text (ComfyUI)",
        widgets={
            "prompt": "",
            "max_length": WRITER_MAX_TOKENS,
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
    local_llm = g.add(
        "PlenioLocalLLM",
        (380, 640),
        size=(340, 330),
        widgets={
            "prompt": "",
            "model": CHOOSE,
            "seed": 0,
            "seed.control": "fixed",
            "max_tokens": WRITER_MAX_TOKENS,
            "temperature": 0.8,
            "thinking": False,
            "context": WRITER_CONTEXT,
            "keep_loaded": False,
            "system_prompt": "",
        },
    )
    switch = g.add("ComfySwitchNode", (780, 160), size=(260, 90), title="ComfyUI or Local LLM")
    parse = g.add("PlenioParseDraft", (1100, 0), size=(300, 140))
    draft = g.add(
        "PrimitiveInt",
        (0, 340),
        size=(320, 80),
        title="Draft seed",
        widgets={"value": 0, "value.control": "fixed"},
    )
    seed = g.add(
        "ComfyMathExpression",
        (0, 470),
        size=(320, 150),
        title="draft seed + song seed",
        widgets={"expression": SEED_SUM},
    )
    g.link(draft, "INT", seed, "values.a")
    g.link(seed, "INT", generate, "sampling_mode.seed")
    g.link(seed, "INT", local_llm, "seed")
    g.link(compose, "prompt", generate, "prompt")
    g.link(compose, "prompt", local_llm, "prompt")
    g.link(choice, "text_encoder", loader, "clip_name")
    g.link(loader, "CLIP", generate, "clip")
    g.link(choice, "local_model", local_llm, "model")
    g.link(choice, "use_local", switch, "switch")
    g.link(generate, "generated_text", switch, "on_false")
    g.link(local_llm, "text", switch, "on_true")
    g.link(switch, "output", parse, "text")
    g.link(compose, "request", parse, "request")
    return Blueprint(
        "Plenio · Write Song",
        "Plenio/Writing",
        "Writes title, style, lyrics and an artwork prompt following the rules of the loaded music model. The "
        "writer model is one list: ComfyUI's own text models (native Generate Text, the default) and every "
        "local LLM - GGUF files from models/LLM, LM Studio or the Hugging Face cache, or the models of a "
        "running LM Studio, Ollama, llama.cpp ... Only the chosen one is loaded. The brief's song seed is "
        "added to the draft seed: every song of a 'new song every run' series gets its own.",
        g,
        [
            BlueprintInput("brief", "PLENIO_BRIEF", [(compose, "brief")]),
            BlueprintInput("engine", "PLENIO_ENGINE", [(compose, "engine")]),
            BlueprintInput("score", "STRING", [(compose, "score")]),
            BlueprintInput("language", "STRING", [(compose, "language")]),
            BlueprintInput("reference_lyrics", "STRING", [(compose, "reference_lyrics")]),
            BlueprintInput(
                "model", "COMBO", [(choice, "model")], widget=True, default=WRITER, label="writer model"
            ),
            BlueprintInput(
                "sampling_mode.seed", "INT", [(draft, "value")], widget=True, default=0, label="draft seed"
            ),
            BlueprintInput("song_seed", "INT", [(seed, "values.b")], label="song seed"),
            BlueprintInput(
                "thinking",
                "BOOLEAN",
                [(generate, "thinking"), (local_llm, "thinking")],
                widget=True,
                default=False,
            ),
        ],
        [
            BlueprintOutput("title", "STRING", (parse, "title")),
            BlueprintOutput("style", "STRING", (parse, "style")),
            BlueprintOutput("lyrics", "STRING", (parse, "lyrics")),
            BlueprintOutput("artwork_prompt", "STRING", (parse, "artwork_prompt")),
            BlueprintOutput("report", "PLENIO_REPORT", (parse, "report")),
        ],
    )


def arrange() -> Blueprint:
    """Compose Arrangement -> writer (the same writer list as Write Song) -> Apply Arrangement. Apply's answer
    is lazy: in the simple mode, for a cover kept at its original song flow and without a score, nothing
    before it runs - no prompt, no writer model. The arrangement seed plus the song seed drives the writer
    and the notes Plenio writes; a Local LLM is held to the plan's JSON schema."""
    g = Graph(first_id=1301)
    compose = g.add("PlenioComposeArrangement", (0, 0), size=(320, 150))
    choice = g.add(
        "PlenioWriterChoice",
        (0, 210),
        size=(320, 120),
        title="Writer Choice",
        widgets={"model": WRITER},
        properties=model(WRITER),
    )
    loader = g.add(
        "CLIPLoader",
        (380, 0),
        size=(300, 110),
        title="Writer model (ComfyUI)",
        widgets={"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        properties=model(WRITER),
    )
    generate = g.add(
        "TextGenerate",
        (380, 160),
        size=(340, 420),
        title="Generate Text (ComfyUI)",
        widgets={
            "prompt": "",
            "max_length": ARRANGE_MAX_TOKENS,
            "sampling_mode": "on",
            "sampling_mode.temperature": ARRANGE_TEMPERATURE,
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
    local_llm = g.add(
        "PlenioLocalLLM",
        (380, 640),
        size=(340, 360),
        widgets={
            "prompt": "",
            "model": CHOOSE,
            "seed": 0,
            "seed.control": "fixed",
            "max_tokens": ARRANGE_MAX_TOKENS,
            "temperature": ARRANGE_TEMPERATURE,
            "thinking": False,
            "context": ARRANGE_CONTEXT,
            "keep_loaded": False,
            "system_prompt": "",
            "reuse_answers": True,
        },
    )
    switch = g.add("ComfySwitchNode", (780, 160), size=(260, 90), title="ComfyUI or Local LLM")
    apply = g.add(
        "PlenioApplyArrangement",
        (1100, 0),
        size=(340, 260),
        widgets={"seed": 0, "seed.control": "fixed"},
    )
    arrangement_seed = g.add(
        "PrimitiveInt",
        (0, 390),
        size=(320, 80),
        title="Arrangement seed",
        widgets={"value": 0, "value.control": "fixed"},
    )
    seed = g.add(
        "ComfyMathExpression",
        (0, 520),
        size=(320, 150),
        title="arrangement seed + song seed",
        widgets={"expression": SEED_SUM},
    )
    g.link(arrangement_seed, "INT", seed, "values.a")
    g.link(seed, "INT", generate, "sampling_mode.seed")
    g.link(seed, "INT", local_llm, "seed")
    g.link(seed, "INT", apply, "seed")
    g.link(compose, "prompt", generate, "prompt")
    g.link(compose, "prompt", local_llm, "prompt")
    g.link(compose, "schema", local_llm, "schema")
    g.link(choice, "text_encoder", loader, "clip_name")
    g.link(loader, "CLIP", generate, "clip")
    g.link(choice, "local_model", local_llm, "model")
    g.link(choice, "use_local", switch, "switch")
    g.link(generate, "generated_text", switch, "on_false")
    g.link(local_llm, "text", switch, "on_true")
    g.link(switch, "output", apply, "answer")
    return Blueprint(
        "Plenio · Arrange",
        "Plenio/Score",
        "The creative modes' section plan: the writer model plans every section of the score (chords, what the "
        "instrument line plays, energy, a key lift) as a small JSON plan, and Plenio writes the notes and checks "
        "the result - or keeps the score as it was and says why (in the report and the Song Sheet). In the "
        "brief's simple mode nothing runs here. The writer model is the same list as Write Song's; GGUF files, "
        "LM Studio and Ollama keep to the plan's format exactly. The arrangement seed gives another arrangement "
        "of the same song.",
        g,
        [
            BlueprintInput("score", "STRING", [(compose, "score"), (apply, "score")]),
            BlueprintInput("brief", "PLENIO_BRIEF", [(compose, "brief"), (apply, "brief")]),
            BlueprintInput("engine", "PLENIO_ENGINE", [(compose, "engine"), (apply, "engine")]),
            BlueprintInput("style", "STRING", [(compose, "style"), (apply, "style")]),
            BlueprintInput("lyrics", "STRING", [(compose, "lyrics"), (apply, "lyrics")]),
            BlueprintInput(
                "model", "COMBO", [(choice, "model")], widget=True, default=WRITER, label="writer model"
            ),
            BlueprintInput(
                "seed", "INT", [(arrangement_seed, "value")], widget=True, default=0, label="arrangement seed"
            ),
            BlueprintInput("song_seed", "INT", [(seed, "values.b")], label="song seed"),
        ],
        [
            BlueprintOutput("score", "STRING", (apply, "score")),
            BlueprintOutput("report", "PLENIO_REPORT", (apply, "report")),
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
    plan_seed = g.add(
        "PrimitiveInt",
        (0, 480),
        size=(300, 80),
        title="Plan seed",
        widgets={"value": 0, "value.control": "fixed"},
    )
    seed = g.add(
        "ComfyMathExpression",
        (0, 610),
        size=(300, 150),
        title="plan seed + song seed",
        widgets={"expression": SEED_SUM},
    )
    g.link(empty, "STRING", switch, "on_false")
    g.link(plan, "abc", switch, "on_true")
    g.link(plan_seed, "INT", seed, "values.a")
    g.link(seed, "INT", plan, "seed")
    return Blueprint(
        "Plenio · YuE2 Plan",
        "Plenio/YuE2",
        "Plans the song's score (ABC) from style and lyrics with YuE2. With planning off, no score is made and "
        "YuE2 renders without a plan. The brief's song seed is added to the plan seed: every song of a 'new "
        "song every run' series gets its own plan.",
        g,
        [
            BlueprintInput("clip", "CLIP", [(plan, "clip")]),
            BlueprintInput("style", "STRING", [(plan, "style")]),
            BlueprintInput("lyrics", "STRING", [(plan, "lyrics")]),
            BlueprintInput("seed", "INT", [(plan_seed, "value")], widget=True, default=0, label="plan seed"),
            BlueprintInput("song_seed", "INT", [(seed, "values.b")], label="song seed"),
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
SUMMARY_ROOM = 100
"""Height every node with a run summary keeps free for it (about five lines). Without the room the
frontend squeezed the summary into what was left after a run - one clipped line on Score Tools and
the EQ - and shrank the brief's description field; ``frontend/src/extension/summary.ts`` gives the
summary its minimum, and ``tests/workflows/test_graphs.py`` checks the room."""


def about_note(g: Graph, text: str, height: float = ABOUT_SIZE[1]) -> Node:
    return g.add_frontend(
        "MarkdownNote", (-560, 0), size=(ABOUT_SIZE[0], height), title="About this template", widgets=[text]
    )


FOLLOW_BRIEF = {"review": "as the brief says"}
"""The sheets stop for review in the brief's mode 'one song/cover, stop to review' only."""


def song_sheet(g: Graph, pos: tuple[float, float], title: str) -> Node:
    """A Song Sheet that follows the brief's mode; its editor button carries the title (App mode label)."""
    return g.add(
        "PlenioSongSheet",
        pos,
        size=(420, 360 + SUMMARY_ROOM),
        title=title,
        widgets=FOLLOW_BRIEF,
        labels={"sheet_state": title},
    )


def draft_seed(g: Graph, write: Node, pos: tuple[float, float]) -> Node:
    """The writer's seed as its own node: *fixed* keeps the draft (and an approval) across runs, *randomize*
    writes a new draft every run. Native Generate Text has no randomize control on its seed."""
    seed = g.add(
        "SeedNode",
        pos,
        size=(300, 90),
        title="Draft seed",
        widgets={"seed": 0, "seed.control": "fixed"},
        labels={"seed": "draft seed"},
    )
    g.link(seed, "seed", write, "sampling_mode.seed")
    return seed


def writer_model(g: Graph, pos: tuple[float, float]) -> Node:
    """The template's writer model: one list (ComfyUI's text models and every Local LLM model) for Write Song
    and Arrange, so every writing step uses the same model; App mode shows it."""
    return g.add(
        "PlenioWriterChoice",
        pos,
        size=(360, 120 + SUMMARY_ROOM),
        title="Writer model",
        widgets={"model": WRITER},
        # the frontend's missing-model dialog reads the download from the node that shows the file name
        properties=model(WRITER),
        labels={"model": "writer model"},
    )


def arrangement_seed(g: Graph, arrange_node: Node, pos: tuple[float, float]) -> Node:
    """The arrangement seed as its own node (App mode): another arrangement of the same song - only Arrange
    and what follows it run again."""
    seed = g.add(
        "SeedNode",
        pos,
        size=(300, 90),
        title="Arrangement seed",
        widgets={"seed": 0, "seed.control": "fixed"},
        labels={"seed": "arrangement seed"},
    )
    g.link(seed, "seed", arrange_node, "seed")
    return seed


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
    cover_y: float = 560,
    export_size: tuple[float, float] = (380, 470 + SUMMARY_ROOM),
    sheet_music: str = "off",
) -> tuple[Node, Node, Node]:
    """Master -> Preview + Export (the unmastered take as the original), and the optional Cover Art.

    ``cover_y``/``export_size`` carry the owner's layout choices (2026-09-28): the optional blocks sit
    under the wired path, and a taller export shows more report slots. ``sheet_music``: the YuE2 templates
    save the score's notation with the lyrics as ``<name>.pdf`` (owner's request 2026-10-08).
    """
    master = g.add_subgraph(blueprints["master"], (x, 0), size=(340, 170))
    preview = g.add("PreviewAudio", (x, 230), size=(340, 120), title="Preview (mastered)")
    all_reports = [*reports, (master, "eq_report"), (master, "loudness_report")]
    export = g.add(
        "PlenioExportRelease",
        (x + 400, 0),
        size=export_size,
        autogrow={"reports": len(all_reports)},
        widgets={**(export_widgets or {}), "sheet_music": sheet_music},
    )
    cover = g.add_subgraph(
        blueprints["cover"], (x, cover_y), size=(340, 170), mode=4, title="Cover Art (optional)"
    )
    cover_preview = g.add(
        "PreviewImage", (x + 400, cover_y), size=(300, 300), mode=4, title="Cover preview (optional)"
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
    "take as `(original).flac` and a release record to `output/plenio` - in the YuE2 templates also the "
    "**sheet music** with the lyrics as `<name>.pdf` (*sheet music* in Export: A4, Letter or off; this page "
    "draws it right after the export)."
)
COVER_TEXT = (
    "**Cover art (optional, bypassed):** *Cover Art* paints a cover from the sheet's artwork prompt with "
    "FLUX.2 Klein 4B (about 16 GB of extra model files, Apache-2.0). Select it and the cover preview and "
    "press **Ctrl+B**; Export then embeds the cover in the FLAC and MP3 files and saves it as `.jpg`."
)
STEMS_TEXT = (
    "**Stems (optional, bypassed):** *Separate Stems* splits the take into vocals, drums, bass and other; "
    "the *Stem Mixer* balances them (gain, mute/solo, compression, reverb/delay sends, muted time ranges) "
    "and mixes the residual *rest* along, so a neutral mix returns the render unchanged. Select the block "
    "and press **Ctrl+B**; the mixer is inside it - open the block with the icon at the top right of the "
    "node. It needs the BS-RoFormer checkpoint (527 MB). The user guide *Stems* covers it."
)
REFINE_TEXT = (
    "**Refine (optional, bypassed):** brings the take to 48 kHz and extends the top octaves with the "
    "UniverSR model (229 MB); nothing below the crossover changes. YuE2 renders at 48 kHz already, so this "
    "is for experiments. Select the REFINE group, press **Ctrl+B** and expand its two nodes to pick a "
    "*preset*. The user guide *Refine (48 kHz)* covers it."
)
REFINE_MINIMAX_TEXT = (
    "**Refine (48 kHz, on):** extends the top octaves of the render with the UniverSR model (229 MB) and "
    "keeps everything below the crossover. The *preset* is *3 - MiniMax* (pre 10 kHz, crossover 9.5 kHz, "
    "post 19 kHz); pick another preset (also in App mode), or *custom* for the three number fields. For the plain render select "
    "the REFINE group and press **Ctrl+B**. Experimental: the settings are provisional until the listening "
    "study."
)
APP_TEXT = (
    "**App mode:** switch *Graph / App* at the top left for a simple form: the mode, the brief with its creative "
    "mode and closeness, the writer model, the seeds, the Song Sheet buttons (review and edit, also in the app - "
    "their status line says where the run stands: *stops here for review*, *waiting for your approval*, "
    "*approved*) and the results. *Number of runs* next to Run renders a series."
)
WRITER_TEXT = (
    "**Writer model:** one list in the *Writer model* node for every writing step (Write Song and Arrange): "
    "ComfyUI's text models (Gemma 4 E4B by default) and every local LLM - GGUF files in `models/LLM`, LM Studio, "
    "Ollama ... Only the chosen one is loaded. Local LLM answers are kept: the same request with the same seed "
    "is answered from Plenio's cache, without asking the model again."
)
CREATIVE_TEXT = (
    "**Creative modes (experimental):** *arrangement* in the brief. They can give unexpected results and are "
    "meant for experimenting - try a mode, listen, keep what you like. *simple* (default, the dependable "
    "choice): {simple}. A creative mode - *standard*, "
    "*varied*, *fantasy*, *sterile*, *many instruments*, *dramatic* or your own file in `user/plenio/arrangement` "
    "- adds its hints to the writing and lets the writer model plan every section of the score in **Arrange**: "
    "chords, what the instrument line plays, energy, a key lift. {closeness} The writer answers with a small "
    "plan, never notes: Plenio writes every note itself and checks the result, so the score stays valid - a plan "
    "it cannot use leaves the score as it was, and Song Sheet · Score says so. **Arrangement seed:** another "
    "arrangement of the same song. Changing the mode or a slider writes the text again (the brief changed); a "
    "Local LLM answers from its cache when the request is the same."
)
CREATIVE_SONG_TEXT = CREATIVE_TEXT.format(
    simple="YuE2 plans melody, chords and instruments by itself, as before",
    closeness="*genre closeness* sets how free it may be: 100 strictly typical, 70 typical with personal touches, "
    "40 free within the genre, 0 any style.",
)
CREATIVE_COVER_TEXT = CREATIVE_TEXT.format(
    simple="the transcribed score stays as it is",
    closeness="*song flow closeness* sets how close it stays to the original: 100 exactly the original (no "
    "plan), 80 chords and key stay, 50 recognisable, 20 a free version, 0 only a hint - the melody and the form "
    "always remain. *lyrics closeness* (new lyrics) sets how close the new words stay to the source's: 0 without "
    "them (as before) up to 100, their meaning line by line.",
)
STATUS_TEXT = (
    "**Where the run stands:** a badge above each Plenio node shows its result - ✓ done, ⚠ warning, ✖ error; "
    "every Song Sheet that will stop carries ⏸ *review stop* before the run, ⏸ *waiting for your approval* "
    "(and an amber frame) when the run stopped there, ✓ *approved* once you approved it. A new run clears the "
    "badges, so they show how far this run got."
)
SONG_MODES_TEXT = """1. Choose the **mode** in **Song Brief**:
   - *new song every run* - every run writes and renders a **different song** from the brief, without stops (set the **Draft seed** to *randomize* for even more variety). For a series, set the batch count next to **Run** (App mode: *Number of runs*) - one click, many songs.
   - *one song, stop to review* - the run **stops at the Song Sheet{sheets}**: open it, check or edit the documents, *Approve*, run again. Once approved, every further run is a **new take** of the same song (the documents stay cached).
2. Describe the song (or pick a template). *vocals* switches between a sung song and an instrumental; *length* runs from 1:00 to 6:00."""

ABOUT_YUE2 = f"""# 1 · YuE2 · Song

**Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Arrange -> Song Sheet · Score -> YuE2 Render -> Master -> Export**

{SONG_MODES_TEXT.format(sheets="s (Text, then Score)")}
3. Press **Run**. The writer model drafts title, style and lyrics; YuE2 plans a score and renders the song.

**Inspect and edit:** open a **Song Sheet** to see exactly what YuE2 receives. Edit a document there; your edit wins until its draft changes, then the run stops and asks you. The sheets' *review* follows the brief's mode (*as the brief says*); set it to *continue* or *stop for review* to decide per sheet.

{CREATIVE_SONG_TEXT}

{WRITER_TEXT}

{STATUS_TEXT}

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{REFINE_TEXT}

{APP_TEXT}

**Models** (ComfyUI offers the downloads when you open the template): YuE2 3B int8 (4.0 GB), the Gemma 4 E4B writer. YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The model block below is collapsed; expand it to choose other files.
"""


def yue2_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_YUE2, height=1100)
    brief = g.add(
        "PlenioSongBrief",
        (0, 0),
        size=(380, 690 + SUMMARY_ROOM),  # 0.5: arrangement and genre closeness
        widgets={
            "mode": "new song every run",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
        },
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, 940), size=(380, 140), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(360, 220))
    draft = draft_seed(g, write, (460, 280))
    writer = writer_model(g, (460, 410))
    text_sheet = song_sheet(g, (900, 0), "Song Sheet · Text")
    plan = g.add_subgraph(bp["yue2_plan"], (1400, 0), size=(340, 220))
    tools = g.add(
        "PlenioScoreTools",
        (1400, 300),
        size=(340, 120 + SUMMARY_ROOM),
        widgets={"operation": "prepare from brief"},
    )
    arrange_node = g.add_subgraph(bp["arrange"], (1400, 570), size=(340, 260), title="Arrange")
    arrangement = arrangement_seed(g, arrange_node, (1400, 880))
    score_sheet = song_sheet(g, (1820, 0), "Song Sheet · Score")
    seed = take_seed(g, (2320, 0))
    render = g.add_subgraph(bp["yue2_render"], (2320, 150), size=(320, 310))
    audio, stems_node = stems_stage(g, bp, 2320, audio=(render, "AUDIO"), y=665)
    audio, refine_node = refine_stage(g, 2320, audio=audio, y=815)
    g.link(brief, "brief", write, "brief")
    g.link(brief, "song_seed", write, "song_seed")
    g.link(model_node, "engine", write, "engine")
    for kind in ("title", "style", "lyrics", "artwork_prompt"):
        g.link(write, kind, text_sheet, kind)
    g.link(brief, "brief", text_sheet, "brief")
    g.link(model_node, "engine", text_sheet, "engine")
    g.link(model_node, "CLIP", plan, "clip")
    g.link(brief, "song_seed", plan, "song_seed")
    g.link(text_sheet, "style", plan, "style")
    g.link(text_sheet, "plan_lyrics", plan, "lyrics")
    g.link(plan, "score", tools, "score")
    g.link(brief, "brief", tools, "brief")
    g.link(writer, "model", write, "model")
    g.link(writer, "model", arrange_node, "model")
    g.link(tools, "score", arrange_node, "score")
    g.link(brief, "brief", arrange_node, "brief")
    g.link(brief, "song_seed", arrange_node, "song_seed")
    g.link(model_node, "engine", arrange_node, "engine")
    g.link(text_sheet, "style", arrange_node, "style")
    g.link(text_sheet, "lyrics", arrange_node, "lyrics")
    g.link(arrange_node, "score", score_sheet, "score")
    g.link(arrange_node, "report", score_sheet, "arrangement")
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
        audio=audio,
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[
            (text_sheet, "report"),
            (score_sheet, "report"),
            (stems_node, "report"),
            (stems_node, "separation_report"),
            (refine_node, "report"),
        ],
        group="6 · FINISH",
        cover_y=700,
        sheet_music="PDF (A4)",
    )
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write, draft, writer])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · SCORE", [plan, tools, arrange_node, arrangement, score_sheet])
    g.group("5 · RENDER", [seed, render])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    return g, song_app(
        brief, seed, draft, [text_sheet, score_sheet], preview, export, writer=writer, arrangement=arrangement
    )


def song_app(
    brief: Node,
    seed: Node,
    draft: Node,
    sheets: list[Node],
    preview: Node,
    export: Node,
    extra: list[tuple[Node, str]] | None = None,
    *,
    writer: Node,
    arrangement: Node | None = None,
) -> App:
    # The sung options only: App Mode (frontend 1.52) drops controls of the option that is not selected,
    # so the instrumental options are set in the graph. The sheets' editor buttons work in App mode too:
    # 'one song, stop to review' is reviewed there, and their status line says where the run stands.
    controls = [
        "mode",
        "template",
        "description",
        "genre",
        "mood",
        "tempo",
        "key",
        "meter",
        "length",
        "vocals",
    ]
    controls += ["vocals.language", "vocals.voice", "vocals.theme", "arrangement", "genre_closeness"]
    inputs = [(brief, name) for name in controls] + [(writer, "model"), (seed, "seed"), (draft, "seed")]
    if arrangement is not None:
        inputs.append((arrangement, "seed"))
    inputs += extra or []
    return App(inputs + [(sheet, "sheet_state") for sheet in sheets], [preview, export])


ABOUT_COVER = f"""# 2 · YuE2 · Cover

**Source -> Transcribe Score -> Arrange -> Song Sheet · Score -> lyrics (ASR, writer or section tags) -> Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Master -> Export**

1. Load the **source** recording (upload in *Load Audio*; up to 5:00 - trim longer songs with the optional *Excerpt* node).
2. In **Cover Brief** choose the **mode** - *one cover, stop to review* (default, steps 4-6) or *new cover every run*: every run writes and renders a **different version** (title, style and - with new lyrics - the lyrics) without stops; the batch count next to **Run** makes a series. Then the target style and what happens to the vocals: *original lyrics* (default; transcribed from the source), *instrumental* (an instrument plays the melody, or accompaniment only) or *new lyrics* (written on the source's melody). *harmony* keeps or replaces the original chords.
3. Press **Run**: SheetSage2 transcribes the source (once; later runs reuse it).
4. The run **stops at Song Sheet · Score**. Open it, check the score (fix section names and boundaries), then *Approve*.
5. Run again: the lyrics are drafted (ASR of the original, the writer's new lyrics, or the section tags) and the run **stops at Song Sheet · Text**. Correct or replace the lyrics - your text always wins - and *Approve*.
6. Run again to render. Each further run is a new take (the take seed changes).

**New lyrics** are understood only when they fit the melody - about one syllable per note - and the voice fits its range; Song Sheet · Text warns about both.

{CREATIVE_COVER_TEXT}

{WRITER_TEXT}

{STATUS_TEXT}

**Takes:** *YuE2 Takes* renders *takes* versions (seeds take seed, +1, ...); **Check Vocals** keeps the first instrumental take without vocal notes, the preview plays all takes. N takes cost N renders. **Instrumental adapter:** for instrumental covers YuE2 renders with the instrumental LoRA of the *Instrumental adapter* node (the optional adapter inside the model block stays bypassed here). **Check sung lyrics** (optional, bypassed) measures what a sung take actually sang.

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{REFINE_TEXT}

**App mode:** switch *Graph / App* at the top left for a simple form: the source file, the mode, the cover style, the creative mode with both closeness sliders, the writer model, the seeds, the two Song Sheet buttons (the review stops work in the app; their status line says where the run stands) and the results. The other options of *original lyrics* and *new lyrics* are set in the graph.

**Models** (downloaded on first use): YuE2 3B int8, SheetSage2, the instrumental adapter, the Gemma 4 E4B writer; the lyrics ASR (faster-whisper large-v3, 3.1 GB) is fetched by Plenio when first needed. YuE2, SheetSage2 and the adapter are **CC BY-NC 4.0 (non-commercial)**.
"""


def yue2_cover(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_COVER, height=1240)
    source = g.add("LoadAudio", (0, 0), size=(360, 140), title="Source recording")
    excerpt = g.add(
        "TrimAudioDuration",
        (0, 230),
        size=(360, 110),
        mode=4,
        title="Excerpt (optional)",
        widgets={"start_index": 0.0, "duration": 120.0},
    )
    brief = g.add(
        "PlenioCoverBrief",
        (0, 480),
        size=(380, 640 + SUMMARY_ROOM),  # 0.5: arrangement and both closeness sliders
        # the owner's defaults since 0.4.3: a pop style template (genre and mood come from it), the
        # original lyrics in the language detected from the singing, the original chords
        widgets={
            "mode": "one cover, stop to review",
            "template": "pop/dance-pop-vocal",
            "genre": "",
            "mood": "",
            "vocals": "original lyrics",
            "vocals.language": "",
            "harmony": "keep original chords",
        },
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, 1395), size=(380, 140), collapsed=True)
    adapter = g.add(
        "LoraLoader",
        (0, 1475),
        size=(380, 130),
        title="Instrumental adapter",
        widgets={"lora_name": LORA, "strength_model": 0.0, "strength_clip": 1.0},
        properties=model(LORA),
    )
    adapter_switch = g.add(
        "ComfySwitchNode", (420, 1475), size=(260, 90), title="Adapter for instrumental covers"
    )
    transcribe = g.add_subgraph(bp["transcribe"], (460, 0), size=(340, 160))
    tools = g.add(
        "PlenioScoreTools",
        (460, 220),
        size=(340, 120 + SUMMARY_ROOM),
        widgets={"operation": "prepare from brief"},
    )
    score_sheet = song_sheet(g, (880, 0), "Song Sheet · Score")
    arrange_node = g.add_subgraph(bp["arrange"], (460, 650), size=(340, 260), title="Arrange")
    arrangement = arrangement_seed(g, arrange_node, (460, 960))
    # Original lyrics: the Cover Brief owns the source's language; new lyrics: this widget does (AUD-02).
    asr = g.add(
        "PlenioTranscribeLyrics",
        (1380, 0),
        size=(340, 200 + SUMMARY_ROOM),
        title="Transcribe Lyrics",
        labels={"language": "source language (original lyrics: Cover Brief)"},
    )
    write = g.add_subgraph(bp["write"], (1380, 360), size=(360, 260))
    draft = draft_seed(g, write, (1380, 680))
    writer = writer_model(g, (1380, 810))
    source_switch = g.add("ComfySwitchNode", (1800, 0), size=(260, 90), title="Original or new lyrics")
    tags_switch = g.add("ComfySwitchNode", (1800, 165), size=(260, 90), title="Instrumental: section tags")
    text_sheet = song_sheet(g, (2135, 10), "Song Sheet · Text")
    seed = take_seed(g, (2620, 0))
    render = g.add_subgraph(bp["yue2_takes"], (2620, 170), size=(320, 330), title="YuE2 Takes")
    check_vocals = g.add(
        "PlenioVocalCheck", (3000, 0), size=(340, 120 + SUMMARY_ROOM), title="Check Vocals · best take"
    )
    takes_preview = g.add("PreviewAudio", (3000, 280), size=(340, 120), title="Preview (all takes)")
    check_lyrics = g.add(
        "PlenioTranscribeLyrics",
        (3015, 845),
        size=(340, 200 + SUMMARY_ROOM),
        mode=4,
        title="Check sung lyrics (optional)",
    )

    g.link(source, "AUDIO", excerpt, "audio")
    g.link(excerpt, "AUDIO", transcribe, "audio")
    g.link(transcribe, "score", tools, "score")
    g.link(brief, "brief", tools, "brief")
    g.link(writer, "model", write, "model")
    g.link(writer, "model", arrange_node, "model")
    g.link(tools, "score", arrange_node, "score")
    g.link(brief, "brief", arrange_node, "brief")
    g.link(brief, "song_seed", arrange_node, "song_seed")
    g.link(model_node, "engine", arrange_node, "engine")
    g.link(arrange_node, "score", score_sheet, "score")
    g.link(arrange_node, "report", score_sheet, "arrangement")
    g.link(transcribe, "timeline", score_sheet, "timeline")
    g.link(excerpt, "AUDIO", score_sheet, "reference_audio")  # A/B listening in the score editor
    g.link(brief, "brief", score_sheet, "brief")
    g.link(model_node, "engine", score_sheet, "engine")
    g.link(excerpt, "AUDIO", asr, "audio")
    g.link(score_sheet, "score", asr, "score")
    g.link(transcribe, "timeline", asr, "timeline")
    g.link(brief, "brief", asr, "brief")
    g.link(brief, "brief", write, "brief")
    g.link(brief, "song_seed", write, "song_seed")
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
    audio, stems_node = stems_stage(g, bp, 3420, audio=(check_vocals, "audio"), y=715)
    audio, refine_node = refine_stage(g, 3420, audio=audio, y=905)
    _master, preview, export = finish(
        g,
        bp,
        3880,
        audio=audio,
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[
            (score_sheet, "report"),
            (text_sheet, "report"),
            (transcribe, "report"),
            (check_vocals, "report"),
            (check_lyrics, "report"),
            (stems_node, "report"),
            (stems_node, "separation_report"),
            (refine_node, "report"),
        ],
        group="7 · FINISH",
        cover_y=780,
        sheet_music="PDF (A4)",
        export_size=(380, 560 + SUMMARY_ROOM),
    )
    # Sung Pitch (0.4.4): the source's vocals as a pitch curve for both sheets' editors, once per source;
    # the text sheet plays the source too, so the words can be checked against the singing
    sung_pitch = g.add(
        "PlenioSungPitch",
        (460, 480),
        size=(340, 106),
        title="Sung Pitch (for the editor)",
        widgets={"separation": SEPARATION_MODEL},
        properties=model(SEPARATION_MODEL),
    )
    g.link(excerpt, "AUDIO", text_sheet, "reference_audio")
    g.link(excerpt, "AUDIO", sung_pitch, "audio")
    g.link(sung_pitch, "sung_pitch", score_sheet, "sung_pitch")
    g.link(sung_pitch, "sung_pitch", text_sheet, "sung_pitch")
    g.group("1 · SOURCE", [source, excerpt])
    g.group("2 · COVER", [brief])
    g.group(
        "3 · SCORE", [transcribe, tools, score_sheet, sung_pitch, arrange_node, arrangement], min_height=700
    )
    g.group("4 · LYRICS", [asr, write, draft, writer, source_switch, tags_switch])
    g.group("5 · TEXT", [text_sheet])
    g.group("6 · RENDER", [seed, render, check_vocals, takes_preview])
    g.group("CHECK SUNG LYRICS (optional)", [check_lyrics], color=OPTIONAL_GROUP)
    g.group("MUSIC MODEL", [model_node, adapter, adapter_switch], color=MODEL_GROUP)
    # The options of the default vocals (original lyrics) only, as in song_app; the two review stops use
    # the sheets' editor buttons.
    controls = ["mode", "template", "description", "genre", "mood", "vocals"]
    controls += ["vocals.language", "vocals.voice", "harmony", "arrangement", "song_flow_closeness"]
    controls += ["lyrics_closeness"]
    inputs = [(source, "audio"), *[(brief, name) for name in controls], (writer, "model")]
    inputs += [(seed, "seed"), (draft, "seed"), (arrangement, "seed")]
    inputs += [(score_sheet, "sheet_state"), (text_sheet, "sheet_state")]
    return g, App(inputs, [takes_preview, preview, export])


ABOUT_MINIMAX = f"""# 3 · MiniMax · Song

**Brief -> Write Song -> Song Sheet -> MiniMax Render -> Refine (48 kHz) -> Master -> Export**

{SONG_MODES_TEXT.format(sheets="")}
3. Press **Run**. The writer model drafts title, a structured **caption** (Global Metadata, Vocal Details, Arrangement), lyrics and an artwork prompt; MiniMax Music 3 renders the song.

{STATUS_TEXT}

**Inspect and edit:** open the **Song Sheet** to see exactly what MiniMax receives; its *review* follows the brief's mode (*as the brief says*). Caption and lyrics together must stay under **5 000 tokens** (the sheet counts them exactly with the loaded text encoder and stops before rendering if they do not fit). The render ceiling follows the brief's length, at most 6:00; the model can end earlier.

**Instrumentals:** the lyrics are a map of section tags ([Intro], [Instrumental], [Solo], ...), about twice as long as a sung song's, and the caption's Vocal Details are *n/a*.

**Creative modes:** *arrangement* in the brief adds the mode's hints to the caption (for example *many instruments*: a large ensemble) and, with *genre closeness*, says how typical it stays. MiniMax Music 3 has no score, so there is no section plan here; *simple* writes as before.

{WRITER_TEXT}

{FINISH_TEXT}

{REFINE_MINIMAX_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{APP_TEXT}

**Models** (ComfyUI offers the downloads when you open the template): MiniMax Music 3 (diffusion model 4.9 GB, int8 text encoder 9.2 GB, VAE), the Gemma 4 E4B writer. MiniMax Music 3 weights: **MiniMax-Music3 Community License**. If decoding runs out of memory, turn on *tiled decode* in MiniMax Render.
"""


def minimax_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_MINIMAX, height=940)
    brief = g.add(
        "PlenioSongBrief",
        (0, 0),
        size=(380, 690 + SUMMARY_ROOM),  # 0.5: arrangement and genre closeness
        widgets={
            "mode": "new song every run",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
        },
    )
    model_node = g.add_subgraph(bp["minimax_model"], (0, 940), size=(380, 160), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(360, 220))
    draft = draft_seed(g, write, (460, 280))
    writer = writer_model(g, (460, 410))
    sheet = song_sheet(g, (900, 0), "Song Sheet")
    seed = take_seed(g, (1400, 0))
    render = g.add_subgraph(bp["minimax_render"], (1400, 150), size=(320, 250))
    g.link(brief, "brief", write, "brief")
    g.link(brief, "song_seed", write, "song_seed")
    g.link(model_node, "engine", write, "engine")
    g.link(writer, "model", write, "model")
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
    # MiniMax renders a band-limited signal: Refine runs with UniverSR by default (plan §4.6) and
    # carries the owner's preset (pre 10 kHz, post 19 kHz, crossover 14.5 kHz; 2026-09-28)
    audio, stems_node = stems_stage(g, bp, 1800, audio=(render, "AUDIO"), y=430)
    audio, refine_node = refine_stage(
        g,
        1800,
        audio=audio,
        active=True,
        y=620,
        widgets={
            "engine": "model",
            "preset": "3 - MiniMax: pre 10 kHz / post 19 kHz",
            "pre_hz": 10000.0,
            "post_hz": 19000.0,
            "crossover_hz": 9500.0,
        },
    )
    _master, preview, export = finish(
        g,
        bp,
        2320,
        audio=audio,
        title=(sheet, "title"),
        artwork=(sheet, "artwork_prompt"),
        reports=[
            (sheet, "report"),
            (stems_node, "report"),
            (stems_node, "separation_report"),
            (refine_node, "report"),
        ],
        group="5 · FINISH",
        cover_y=700,
    )
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write, draft, writer])
    g.group("3 · SHEET", [sheet])
    g.group("4 · RENDER", [seed, render])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    # Refine is on in this template: its preset is the one audio choice worth making in the app
    return g, song_app(
        brief, seed, draft, [sheet], preview, export, extra=[(refine_node, "preset")], writer=writer
    )


ABOUT_DAW = f"""# 5 · YuE2 · DAW

**Brief -> Write Song -> Song Sheet · Text -> Score Tools (new score from brief) -> Song Sheet · DAW -> YuE2 Render -> Master -> Export**

Write the song yourself: the lyrics come from the writer (or from you - open the lyrics tab and *use my own lyrics*), and the **score** is yours. YuE2 reads exactly two voices and the chord symbols:

- **Vocal** -> `V: Vocal` - the sung melody, one voice.
- **Instrument** -> `V: Ins` - the instrumental melody, one voice.
- **Chords** -> the chord symbols over the Vocal voice.
- **Guide** -> **not sent to YuE2**: your own notes for playback and for MIDI export (a sketch piano, a bass line).

How to work:

1. In **Song Brief** describe the song (genre, mood, length, tempo, key, meter). *one song, stop to review* is the default: nothing is rendered before you have approved the score.
2. Press **Run**. The writer drafts title, style and lyrics; *Score Tools* builds an **empty score** from the brief - one `verse` of the right length in the brief's meter and key, all rests.
3. The run **stops at Song Sheet · DAW**. Open it and compose: draw notes in the piano roll (or import a MIDI file), set chord symbols in the chord lane, split the score into sections in the navigator, and correct the lyrics in *Song Sheet · Text*. **Approve** both sheets.
4. Run again: YuE2 renders **exactly the score you approved** (`Vocal`, `Ins` and the chord symbols - never the Guide track), and Master and Export finish the song.

**Empty score:** a score of rests cannot be rendered - YuE2 needs at least one note (the Song Sheet says so). Draw the first note or import a MIDI file.

**Creative modes:** *arrangement* in the brief adds the mode's hints to the writing (the style); the score is yours, so nothing is planned here. *simple* writes as before.

{WRITER_TEXT}

{STATUS_TEXT}

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{REFINE_TEXT}

**App mode:** the mode, the brief (with key and meter - the empty score follows them), the writer model, the seeds, both Song Sheet buttons with their status line and the results - the app is usable for a first run, but the score is drawn in the graph's sheet editor.

**Models:** YuE2 3B int8 (4.0 GB, **CC BY-NC 4.0, non-commercial**) and the Gemma 4 E4B writer. The model block below is collapsed; expand it to choose other files.
"""


def yue2_daw(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_DAW, height=1160)
    brief = g.add(
        "PlenioSongBrief",
        (0, 0),
        size=(380, 690 + SUMMARY_ROOM),  # 0.5: arrangement and genre closeness
        widgets={
            "mode": "one song, stop to review",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
        },
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, 940), size=(380, 140), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(360, 220))
    draft = draft_seed(g, write, (460, 280))
    writer = writer_model(g, (460, 410))
    text_sheet = song_sheet(g, (900, 0), "Song Sheet · Text")
    tools = g.add(
        "PlenioScoreTools",
        (1400, 0),
        size=(340, 130 + SUMMARY_ROOM),
        title="Score Tools · new score from brief",
        widgets={"operation": "new score from brief"},
    )
    # The DAW layout: track headers, piano roll, staff, inspector and the MIDI tools. It always stops for
    # review: the score starts as rests and is composed there - in a 'new song every run' series every
    # new song stops to be composed (on 'as the brief says' the empty score would stop the run as invalid).
    score_sheet = g.add(
        "PlenioSongSheet",
        (1820, 0),
        size=(420, 360 + SUMMARY_ROOM),
        title="Song Sheet · DAW",
        widgets={"review": "stop for review"},
        labels={"sheet_state": "Song Sheet · DAW"},
        properties={"plenio_editor_layout": "daw"},
    )
    seed = take_seed(g, (2320, 0))
    render = g.add_subgraph(bp["yue2_render"], (2320, 150), size=(320, 310))
    g.link(brief, "brief", write, "brief")
    g.link(brief, "song_seed", write, "song_seed")
    g.link(model_node, "engine", write, "engine")
    g.link(writer, "model", write, "model")
    for kind in ("title", "style", "lyrics", "artwork_prompt"):
        g.link(write, kind, text_sheet, kind)
    g.link(brief, "brief", text_sheet, "brief")
    g.link(model_node, "engine", text_sheet, "engine")
    # The score input of Score Tools stays unconnected: 'new score from brief' builds the skeleton.
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
    audio, stems_node = stems_stage(g, bp, 2320, audio=(render, "AUDIO"), y=670)
    audio, refine_node = refine_stage(g, 2320, audio=audio, y=820)
    _master, preview, export = finish(
        g,
        bp,
        2720,
        audio=audio,
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[
            (text_sheet, "report"),
            (score_sheet, "report"),
            (stems_node, "report"),
            (stems_node, "separation_report"),
            (refine_node, "report"),
        ],
        group="6 · FINISH",
        cover_y=755,
        sheet_music="PDF (A4)",
        export_size=(385, 530 + SUMMARY_ROOM),
    )
    g.group("1 · SONG", [brief])
    g.group("2 · WRITE", [write, draft, writer])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · DAW", [tools, score_sheet])
    g.group("5 · RENDER", [seed, render])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    return g, song_app(brief, seed, draft, [text_sheet, score_sheet], preview, export, writer=writer)


ABOUT_ENHANCE = """# 4 · Enhance & Master

**Load Audio -> Stems (optional) -> Refine (optional) -> EQ -> Loudness & Dynamics -> Export**

Finishes an existing recording (for example a take you rendered earlier) without any music model.

1. Upload the file in **Load Audio**.
2. For a **band-limited** source (an old MP3, a phone recording) select the *Refine (optional)* block and press **Ctrl+B**: it brings the file to 48 kHz and extends the missing top octave with UniverSR (the user guide *Refine (48 kHz)* covers the settings).
3. To rebalance a finished mix, select *Stems (optional)* and press **Ctrl+B**: *Separate Stems* splits the file into vocals, drums, bass and other, the *Stem Mixer* balances them (the residual *rest* keeps a neutral mix exact; the user guide *Stems* covers it). Both blocks are bypassed by default.
4. **EQ** starts with a gentle warm tone match (*match preset*). Choose *manual* to draw your own curve, *flat* for no EQ, or connect a **reference** recording and pick a reference recipe.
5. **Loudness & Dynamics** brings the song to -14 LUFS with a true peak of at most -1 dBTP (streaming); pick another target or compression style if you like.
6. Press **Run**. Export writes FLAC 24-bit and MP3 V0 to `output/plenio/enhanced`, copies the source file's tags and cover, keeps the unmastered source as `(original).flac`, and writes a release record with the measured loudness.

The preview plays the result; compare it with the source in Load Audio. Nothing here needs a GPU. After a run, a badge above each Plenio node shows its result (✓ done, ⚠ warning, ✖ error).

**App mode:** switch *Graph / App* at the top left for a simple form (file, EQ, target, compression).
"""


def enhance_master(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_ENHANCE, height=640)
    source = g.add("LoadAudio", (0, 0), size=(340, 140), title="Source")
    # for band-limited uploads (old MP3s): Refine is available, bypassed (plan §11)
    audio, stems_node = stems_stage(g, bp, 420, audio=(source, "AUDIO"), y=200)
    audio, refine_node = refine_stage(g, 420, audio=audio, y=380)
    eq = g.add(
        "PlenioEQ",
        (880, 0),
        # the owner's request (2026-09-28): a much wider EQ, so the curve has room for editing
        size=(980, 560 + SUMMARY_ROOM),
        widgets={"mode": "match preset", "mode.preset": WARM_GENTLE},
        labels={"mode": "EQ"},
    )
    loudness = g.add(
        "PlenioLoudness",
        (1905, 0),
        size=(425, 180 + SUMMARY_ROOM),
        widgets={"target": MASTER_TARGET, "compression": MASTER_STYLE, "sample_rate": "keep"},
        labels={"target": "loudness target"},
    )
    preview = g.add("PreviewAudio", (2490, 0), size=(360, 120), title="Preview (mastered)")
    export = g.add(
        "PlenioExportRelease",
        (2490, 180),
        size=(380, 400 + SUMMARY_ROOM),
        autogrow={"reports": 5},
        widgets={
            "folder": "plenio/enhanced",
            "naming": "{title}",
            "mp3": True,
            "tags": "copy from loaded file",
        },
    )
    g.link(audio[0], audio[1], eq, "audio")
    g.link(eq, "audio", loudness, "audio")
    g.link(loudness, "audio", preview, "audio")
    g.link(loudness, "audio", export, "audio")
    g.link(source, "AUDIO", export, "original")
    g.link(stems_node, "report", export, "reports.report_0")
    g.link(stems_node, "separation_report", export, "reports.report_1")
    g.link(refine_node, "report", export, "reports.report_2")
    g.link(eq, "report", export, "reports.report_3")
    g.link(loudness, "report", export, "reports.report_4")
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
        "arrange": arrange(),
        "yue2_plan": yue2_plan(),
        "yue2_render": yue2_render(),
        "transcribe": transcribe_score(),
        "yue2_takes": yue2_takes(),
        "minimax_model": minimax_model(),
        "minimax_render": minimax_render(),
        "master": master(),
        "cover": cover_art(),
        "refine": refine(),
        "stems": stems(),
    }


def templates(bp: dict[str, Blueprint]) -> list[tuple[str, Graph, list[Blueprint], App | None]]:
    song, song_app_config = yue2_song(bp)
    cover, cover_app = yue2_cover(bp)
    minimax, minimax_app = minimax_song(bp)
    daw, daw_app = yue2_daw(bp)
    enhance, enhance_app = enhance_master(bp)
    check, check_app = system_check()
    # the REFINE block is plain nodes in every template (``refine_stage``): its blueprint ships in
    # subgraphs/ for the node library only, so no template embeds its definition
    finish_bps = [bp["master"], bp["cover"], bp["stems"]]
    return [
        ("0 · System Check", check, [], check_app),
        (
            "1 · YuE2 · Song",
            song,
            [bp["yue2_model"], bp["write"], bp["yue2_plan"], bp["arrange"], bp["yue2_render"], *finish_bps],
            song_app_config,
        ),
        (
            "2 · YuE2 · Cover",
            cover,
            [bp["yue2_model"], bp["write"], bp["transcribe"], bp["arrange"], bp["yue2_takes"], *finish_bps],
            cover_app,
        ),
        (
            "3 · MiniMax · Song",
            minimax,
            [bp["minimax_model"], bp["write"], bp["minimax_render"], *finish_bps],
            minimax_app,
        ),
        (
            "4 · Enhance & Master",
            enhance,
            [bp["stems"]],
            enhance_app,
        ),
        (
            "5 · YuE2 · DAW",
            daw,
            [bp["yue2_model"], bp["write"], bp["yue2_render"], *finish_bps],
            daw_app,
        ),
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
