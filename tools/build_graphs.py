"""Generate Plenio's blueprints (subgraphs/) and path templates (example_workflows/).

Run after changing a blueprint or template definition here:

    <python> tools/build_graphs.py

The output is deterministic; the workflow tests check that every template
embeds the current blueprint definitions. It also writes the tooltips of the
blueprints' inputs and outputs to ``locales/en/nodeDefs.json``.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "tools"))

from graph_builder import (  # noqa: E402
    GROUP_GAP,
    GROUP_PADDING,
    NODE_GAP,
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

from plenio.core import variables  # noqa: E402
from plenio.core.audio import hq  # noqa: E402
from plenio.core.brief import TemplateLibrary, cover_text_fields  # noqa: E402
from plenio.core.creativity import CREATIVITY_DEFAULT  # noqa: E402
from plenio.core.llm import CHOOSE  # noqa: E402
from plenio.core.models import ModelFile, by_file, load_catalogue  # noqa: E402
from workflow_validation import load_snapshot  # noqa: E402

SNAPSHOT = load_snapshot()

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
REPAIR_TEMPERATURE = 0.7  # Fit Lyrics' repair rounds: a few lines rewritten to a syllable count
MINIMAX_DIT = "minimax_music3_dit_fp16.safetensors"
MINIMAX_TE = "minimax_music3_text_encoder_pruned_int8_convrot.safetensors"
MINIMAX_VAE = "minimax_music3_dav.safetensors"
FLUX = "flux-2-klein-4b.safetensors"
FLUX_TE = "qwen_3_4b.safetensors"
FLUX_VAE = "flux2-vae.safetensors"


FROM_MODEL_BLOCK = "From the music model block."
CREATIVITY = (
    "From the brief: 0 steady, 50 the reference (the native defaults), 100 experimental (the default), 200 "
    "adventurous - the sampling of this block follows it."
)
ENGINE_OUT = "The music model's rules and exact tokenizer, for Write Song and the Song Sheets."
TAKE_SEED = (
    "The take seed: another seed, another take of the same documents. It drives both the token and the audio "
    "sampling."
)
MAX_SECONDS = (
    "The longest the take may run (the Song Sheet derives it from the score's length); YuE2 may end earlier."
)
WRITER_MODEL = (
    "The writer: a text model of ComfyUI (a bare file name, written by Generate Text; Gemma 4 E4B by default) or "
    "a Local LLM model (GGUF files, LM Studio, Ollama ...). Only the chosen one is loaded; the templates link it to "
    "the Writer model node. Press R to refresh the list."
)
NATIVE_TOOLTIPS = {
    "SeedNode": {
        "seed": "The seed this node passes on. control after generate decides what happens to it after each run: "
        "fixed keeps it, increment and decrement step it, randomize draws a new one."
    },
    "LoadAudio": {"audio": "The audio file: one from ComfyUI's input folder, or upload one."},
}
"""Native widgets that the templates show at the top level and that ComfyUI ships without a tooltip."""


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
                tooltip="The YuE2 checkpoint in models/checkpoints: yue2_3b_int8_convrot (default, for 8-16 GB GPUs) "
                "or yue2_3b_bf16 (24 GB and more). ComfyUI offers the download when the file is missing.",
            )
        ],
        [
            BlueprintOutput(
                "MODEL",
                "MODEL",
                (lora, "MODEL"),
                tooltip="YuE2 for the render (through the instrumental adapter, bypassed unless switched on).",
            ),
            BlueprintOutput(
                "CLIP",
                "CLIP",
                (lora, "CLIP"),
                tooltip="YuE2's language side: planning, rendering, token counts.",
            ),
            BlueprintOutput("VAE", "VAE", (loader, "VAE"), tooltip="YuE2's audio decoder."),
            BlueprintOutput("engine", "PLENIO_ENGINE", (engine, "engine"), tooltip=ENGINE_OUT),
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
                "unet_name",
                "COMBO",
                [(unet, "unet_name")],
                widget=True,
                default=MINIMAX_DIT,
                label="model",
                tooltip="MiniMax Music 3's diffusion model in models/diffusion_models: the fp16 file (default) or "
                "minimax_music3_dit_int8_convrot (2.5 GB, for 8-12 GB GPUs).",
            ),
            BlueprintInput(
                "clip_name",
                "COMBO",
                [(clip, "clip_name")],
                widget=True,
                default=MINIMAX_TE,
                label="text encoder",
                tooltip="MiniMax Music 3's text encoder in models/text_encoders (int8 by default); the Song Sheet "
                "counts the 5,000-token prompt budget with it, exactly.",
            ),
            BlueprintInput(
                "vae_name",
                "COMBO",
                [(vae, "vae_name")],
                widget=True,
                default=MINIMAX_VAE,
                label="vae",
                tooltip="MiniMax Music 3's audio decoder in models/vae.",
            ),
        ],
        [
            BlueprintOutput("MODEL", "MODEL", (unet, "MODEL"), tooltip="MiniMax Music 3 for the render."),
            BlueprintOutput(
                "CLIP", "CLIP", (clip, "CLIP"), tooltip="The text encoder: the render and the token counts."
            ),
            BlueprintOutput("VAE", "VAE", (vae, "VAE"), tooltip="MiniMax Music 3's audio decoder."),
            BlueprintOutput("engine", "PLENIO_ENGINE", (engine, "engine"), tooltip=ENGINE_OUT),
        ],
    )


RETAKE_TITLES = ("Second take (lyrics fidelity)", "Third take (lyrics fidelity highest)")
"""The lazy retakes of a render block: rendered only when Best Take asks for them (``core.fidelity``)."""
SECOND_TAKE = (
    "The second take (seed + 1): rendered only when Best Take asks for it (lyrics fidelity high or highest, when "
    "the first take sang less than 96 % of the lyrics)."
)
THIRD_TAKE = (
    "The third take (seed + 2): rendered only when Best Take asks for it (lyrics fidelity highest, when neither "
    "take sang 96 % of the lyrics)."
)


def retake_seed(g: Graph, pos: tuple[float, float], plus: int, *, takes: bool = False) -> Node:
    """The seed of a retake: the take seed + 1 or + 2 (after the takes of a loop: + takes + 0 or 1)."""
    return g.add(
        "ComfyMathExpression",
        pos,
        size=(300, 150),
        title=f"take seed + {'takes' + (' + 1' if plus > 1 else '') if takes else plus}",
        widgets={"expression": f"a + b{' + 1' if plus > 1 else ''}" if takes else f"a + {plus}"},
    )


def minimax_chain(g: Graph, y: float, title: str | None = None) -> dict[str, Node]:
    """One MiniMax Music 3 render: encode, latent, sampler, decode (plain or tiled, by the switch)."""
    encode = g.add(
        "MiniMaxMusic3TextEncode",
        (0, y),
        size=(340, 330),
        title=title,
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
    latent = g.add("EmptyMiniMaxMusic3LatentAudio", (400, y), size=(280, 80))
    zero = g.add("ConditioningZeroOut", (400, y + 130), size=(240, 50))
    sampler = g.add(
        "KSampler",
        (720, y),
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
    decode = g.add("VAEDecodeAudio", (1080, y), size=(220, 60))
    tiled = g.add(
        "VAEDecodeAudioTiled", (1080, y + 110), size=(260, 90), widgets={"tile_size": 1536, "overlap": 64}
    )
    switch = g.add(
        "ComfySwitchNode", (1380, y), size=(260, 90), title="Tiled decode", widgets={"switch": False}
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
    return {"encode": encode, "sampler": sampler, "decode": decode, "tiled": tiled, "switch": switch}


def minimax_render() -> Blueprint:
    g = Graph(first_id=301)
    first = minimax_chain(g, 0)
    # the lyrics fidelity's retakes (2026-10-24): rendered only when Best Take asks for them
    second, third = (minimax_chain(g, 420 * k, title) for k, title in enumerate(RETAKE_TITLES, start=1))
    plus_one, plus_two = retake_seed(g, (1700, 420), 1), retake_seed(g, (1700, 840), 2)
    g.link(plus_one, "INT", second["encode"], "seed")
    g.link(plus_one, "INT", second["sampler"], "seed")
    g.link(plus_two, "INT", third["encode"], "seed")
    g.link(plus_two, "INT", third["sampler"], "seed")
    chains = (first, second, third)
    return Blueprint(
        "Plenio · MiniMax Render",
        "Plenio/MiniMax",
        "Renders the final caption and lyrics with MiniMax Music 3 exactly as given (native nodes, 30 steps). The "
        "take seed drives both the token and the audio sampling; max seconds is the ceiling, the model may end "
        "earlier. Turn on tiled decode if decoding runs out of memory. A second and a third take (seed + 1, + 2) "
        "render only when Best Take asks for them (the brief's lyrics fidelity).",
        g,
        [
            BlueprintInput(
                "model", "MODEL", [(c["sampler"], "model") for c in chains], tooltip=FROM_MODEL_BLOCK
            ),
            BlueprintInput("clip", "CLIP", [(c["encode"], "clip") for c in chains], tooltip=FROM_MODEL_BLOCK),
            BlueprintInput(
                "vae",
                "VAE",
                [(c[kind], "vae") for c in chains for kind in ("decode", "tiled")],
                tooltip=FROM_MODEL_BLOCK,
            ),
            BlueprintInput(
                "caption",
                "STRING",
                [(c["encode"], "caption") for c in chains],
                tooltip="The final caption (Song Sheet): rendered exactly as given.",
            ),
            BlueprintInput(
                "lyrics",
                "STRING",
                [(c["encode"], "lyrics") for c in chains],
                tooltip="The final lyrics (Song Sheet): rendered exactly as given.",
            ),
            BlueprintInput(
                "seed",
                "INT",
                [
                    (first["encode"], "seed"),
                    (first["sampler"], "seed"),
                    (plus_one, "values.a"),
                    (plus_two, "values.a"),
                ],
                label="take seed",
                tooltip=TAKE_SEED,
            ),
            BlueprintInput(
                "max_duration",
                "FLOAT",
                [(c["encode"], "max_duration") for c in chains],
                label="max seconds",
                tooltip="The longest the song may run (from the brief's length, at most 6:00); the model may end "
                "earlier.",
            ),
            BlueprintInput(
                "switch",
                "BOOLEAN",
                [(c["switch"], "switch") for c in chains],
                widget=True,
                default=False,
                label="tiled decode",
                tooltip="Decode the audio in tiles: turn it on when decoding runs out of GPU memory (8-12 GB "
                "cards).",
            ),
        ],
        [
            BlueprintOutput("AUDIO", "AUDIO", (first["switch"], "output"), tooltip="The rendered song."),
            BlueprintOutput(
                "seconds", "FLOAT", (first["encode"], "seconds"), tooltip="The render's length in seconds."
            ),
            BlueprintOutput("second", "AUDIO", (second["switch"], "output"), tooltip=SECOND_TAKE),
            BlueprintOutput("third", "AUDIO", (third["switch"], "output"), tooltip=THIRD_TAKE),
        ],
    )


WARM_GENTLE = "Warm - gentle (workflow default)"
MASTER_TARGET = "streaming (-14 LUFS, -1 dBTP)"
MASTER_STYLE = "Balanced - gentle glue"
SR_MODEL = "pytorch_model.bin"
"""The UniverSR weights as the catalogue names them (Hugging Face serves that file name): HQ 2 and Refine."""
SEPARATION_MODEL = "model_bs_roformer_ep_17_sdr_9.6568.ckpt"
"""The BS-RoFormer 4-stem checkpoint of the MSST release (the catalogue names the same file)."""


def master() -> Blueprint:
    """Stems, Audio HQ 1-3 (the owner's request, 2026-10-21: before the first EQ), EQ and Loudness.

    HQ 1 runs, HQ 2 runs only with *HQ mastering* on (the block's input, linked from the templates' HQ Mastering
    switch, off by default - the owner's request 2026-10-22: UniverSR about doubles a song's time), HQ 3 is
    bypassed (the owner's listening test: it dulls the highs); their presets are
    on *auto*, so the brief's genre picks the profile. The super-resolution model of HQ 2 is a collapsed loader
    inside the block, which runs only when HQ 2 asks for it - all audio work after the render lives in this
    block (the REFINE block is gone).

    The stems come first (owner's request 2026-10-24: the STEMS block of the templates moved into the master):
    Separate Stems and the Stem Mixer, switched by the block's *stems* input (off). A bypassed stage cannot
    stand here - the mixer has no audio input a bypass could pass on - so three If/Else switches choose: off,
    the song goes straight to HQ 1 and the two stem reports are empty; their inputs are lazy, so the separation
    and its model never run then (the loader's missing file is no error either).
    """
    g = Graph(first_id=401)
    # two socket rows and the preset, the run summary below (custom's fields make the node grow by itself)
    hq_size = (380, 120 + SUMMARY_ROOM)
    stereo = g.add("PlenioHQStereoCleanup", (0, 0), size=hq_size, widgets={"preset": hq.AUTO})
    loader = g.add(
        "PlenioAudioModelLoader",
        (440, 0),
        size=(340, 110),
        collapsed=True,
        title="Super-resolution model (HQ mastering)",
        widgets={"kind": "super-resolution", "kind.model": SR_MODEL},
        properties=model(SR_MODEL),
    )
    highs = g.add(
        "PlenioHQRegenerateHighs", (440, 80), size=(380, 200 + SUMMARY_ROOM), widgets={"preset": hq.AUTO}
    )
    dereverb = g.add(
        "PlenioHQDeReverb",
        (880, 0),
        size=hq_size,
        title="HQ 3 · De-Reverb (optional)",
        widgets={"preset": hq.AUTO},
        mode=4,
    )
    eq = g.add(
        "PlenioEQ",
        (1360, 0),
        # the size the page gives the EQ's curve anyway (2026-10-24: at 320 it reached out of its group)
        size=(760, 560 + SUMMARY_ROOM),
        widgets={"mode": "match preset", "mode.preset": WARM_GENTLE},
    )
    loudness = g.add(
        "PlenioLoudness",
        (2180, 0),
        size=(360, 220),
        widgets={"target": MASTER_TARGET, "compression": MASTER_STYLE, "sample_rate": "keep"},
    )
    # the stems, left of Audio HQ (made after it: the block's other node ids stay as they were)
    stems_loader = g.add(
        "PlenioAudioModelLoader",
        (-1380, 0),
        size=(340, 130),
        collapsed=True,
        title="Separation model (stems)",
        widgets={"kind": "separation", "kind.model": SEPARATION_MODEL},
        properties=model(SEPARATION_MODEL),
    )
    separate = g.add("PlenioSeparateStems", (-1380, 80), size=(340, 170))
    mixer = g.add(
        "PlenioStemMixer",
        (-980, 0),
        # five strips (the four stems and the rest) and the run summary
        size=(420, 540 + SUMMARY_ROOM),
        widgets={"mix": ""},
        labels={"mix": "mixer"},
    )
    stems_audio = g.add(
        "ComfySwitchNode", (-480, 0), size=(300, 90), title="Stems on: the mix · off: the song"
    )
    stems_mix_report = g.add("ComfySwitchNode", (-480, 170), size=(300, 90), title="Stems on: the mix report")
    stems_split_report = g.add(
        "ComfySwitchNode", (-480, 340), size=(300, 90), title="Stems on: the separation report"
    )
    g.link(stems_loader, "model", separate, "model")
    g.link(separate, "stems", mixer, "stems")
    g.link(mixer, "audio", stems_audio, "on_true")
    g.link(mixer, "report", stems_mix_report, "on_true")
    g.link(separate, "report", stems_split_report, "on_true")
    g.link(stems_audio, "output", stereo, "audio")
    g.link(loader, "model", highs, "model")
    g.link(stereo, "audio", highs, "audio")
    g.link(highs, "audio", dereverb, "audio")
    g.link(dereverb, "audio", eq, "audio")
    g.link(eq, "audio", loudness, "audio")
    g.group("AUDIO HQ (before the EQ)", [stereo, loader, highs, dereverb])
    g.group("MASTER", [eq, loudness])
    g.group(
        "STEMS (the block's stems switch, off)",
        [stems_loader, separate, mixer, stems_audio, stems_mix_report, stems_split_report],
        color=OPTIONAL_GROUP,
    )
    g.align(["STEMS (the block's stems switch, off)", "AUDIO HQ (before the EQ)", "MASTER"])
    return Blueprint(
        "Plenio · Master",
        "Plenio/Mastering",
        "Finishes a song: Stems (with the block's stems switch on: Separate Stems and the Stem Mixer, set the mix "
        "inside the block) - Audio HQ: HQ 1 · Stereo Cleanup runs, HQ 2 · Regenerate Highs (UniverSR) with HQ "
        "mastering on (fewer AI shimmer and artifacts, about twice the time), HQ 3 · De-Reverb is bypassed; their "
        "presets follow the brief's genre - then a gentle tone match (EQ) "
        "and loudness for streaming (-14 LUFS, -1 dBTP true peak) with gentle compression. Open the block to "
        "mix the stems, change a preset, bypass a stage (Ctrl+B), the EQ curve or the compression style.",
        g,
        [
            BlueprintInput(
                "audio",
                "AUDIO",
                [(separate, "audio"), (stems_audio, "on_false")],
                tooltip="The song to master.",
            ),
            BlueprintInput(
                "reference",
                "AUDIO",
                [(eq, "reference")],
                tooltip="Optional: a recording whose tone the EQ matches (with a reference recipe in the block).",
            ),
            BlueprintInput(
                "brief",
                "PLENIO_BRIEF",
                [(stereo, "brief"), (highs, "brief"), (dereverb, "brief")],
                tooltip="Optional: Song Brief or Cover Brief - the HQ presets on auto follow its genre.",
            ),
            BlueprintInput(
                "hq_mastering",
                "BOOLEAN",
                [(highs, "hq_mastering")],
                widget=True,
                default=False,
                label="HQ mastering",
                tooltip=HQ_MASTERING_TOOLTIP,
            ),
            BlueprintInput(
                "stems",
                "BOOLEAN",
                [(stems_audio, "switch"), (stems_mix_report, "switch"), (stems_split_report, "switch")],
                widget=True,
                default=False,
                label="stems",
                tooltip=STEMS_TOOLTIP,
            ),
            BlueprintInput(
                "sample_rate",
                "COMBO",
                [(loudness, "sample_rate")],
                widget=True,
                default="keep",
                label="sample rate",
                tooltip="keep, 44100 or 48000 Hz; converted before the limiter, so the true-peak ceiling holds.",
            ),
        ],
        [
            BlueprintOutput(
                "audio",
                "AUDIO",
                (loudness, "audio"),
                tooltip="The mastered song (-14 LUFS, -1 dBTP true peak in the templates).",
            ),
            BlueprintOutput(
                "eq_report", "PLENIO_REPORT", (eq, "report"), tooltip="The EQ's bands and the tone match."
            ),
            BlueprintOutput(
                "loudness_report",
                "PLENIO_REPORT",
                (loudness, "report"),
                tooltip="Loudness and true peak before and after.",
            ),
            BlueprintOutput(
                "hq1_report",
                "PLENIO_REPORT",
                (stereo, "report"),
                tooltip="HQ 1: profile, settings and the side level before/after.",
            ),
            BlueprintOutput(
                "hq2_report",
                "PLENIO_REPORT",
                (highs, "report"),
                tooltip="HQ 2: profile, engine and the highs before/after.",
            ),
            BlueprintOutput(
                "hq3_report",
                "PLENIO_REPORT",
                (dereverb, "report"),
                tooltip="HQ 3 (bypassed in the templates): profile and the highs before/after.",
            ),
            BlueprintOutput(
                "stems_report",
                "PLENIO_REPORT",
                (stems_mix_report, "output"),
                tooltip=(
                    "Stems on: per strip audible, gain, gain reduction, muted time - and the strips marked save, "
                    "which Export Release writes next to the song ('<name>-stems'). Empty with stems off."
                ),
            ),
            BlueprintOutput(
                "separation_report",
                "PLENIO_REPORT",
                (stems_split_report, "output"),
                tooltip="Stems on: the stem names and how much the residual holds. Empty with stems off.",
            ),
        ],
    )


STEMS_TOOLTIP = (
    "Off (default): the song goes straight to Audio HQ. On: Separate Stems splits it into vocals, drums, bass and "
    "other, and the Stem Mixer inside this block mixes them back (gain, mute/solo, compression, reverb and delay, "
    "muted time ranges; a neutral mix returns the song unchanged). Needs the BS-RoFormer model (527 MB)."
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
        widgets={"kind": "super-resolution", "kind.model": SR_MODEL},
        properties=model(SR_MODEL),
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
            BlueprintInput(
                "audio", "AUDIO", [(stage, "audio")], tooltip="The rendered song (any sample rate)."
            ),
            # promoted widgets: every template sets its own stages on the wrapper node
            BlueprintInput("preset", "COMBO", [(stage, "preset")], label="stage template"),
            BlueprintInput("pre_hz", "FLOAT", [(stage, "pre_hz")], label="pre (model input)"),
            BlueprintInput("post_hz", "FLOAT", [(stage, "post_hz")], label="post (roll-off)"),
            BlueprintInput("crossover_hz", "FLOAT", [(stage, "crossover_hz")], label="crossover"),
        ],
        [
            BlueprintOutput("audio", "AUDIO", (stage, "audio"), tooltip="48 kHz, same duration."),
            BlueprintOutput(
                "report",
                "PLENIO_REPORT",
                (stage, "report"),
                tooltip="Engine, parameters, bandwidth before/after.",
            ),
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
    """The STEMS block of Enhance & Master (plan §11): bypassed and collapsed. The song templates have the stems
    in their Master block since 2026-10-24, switched by its *stems* input."""
    node = g.add_subgraph(
        blueprints["stems"],
        (x, y),
        size=(340, 170),
        title="Stems (optional)",
        mode=4,
        collapsed=True,
    )
    g.link(audio[0], audio[1], node, "audio")
    return (node, "audio"), node


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
        "A strip marked save is kept with the song: Export Release writes it into '<name>-stems' next to it. "
        "Bypassed by default in every template - select the block and press Ctrl+B to use it.",
        g,
        [
            BlueprintInput(
                "audio", "AUDIO", [(separate, "audio")], tooltip="The song to split, before mastering."
            )
        ],
        [
            BlueprintOutput(
                "audio",
                "AUDIO",
                (mixer, "audio"),
                tooltip="The mixdown; a neutral mix returns the input unchanged.",
            ),
            BlueprintOutput(
                "report",
                "PLENIO_REPORT",
                (mixer, "report"),
                tooltip=(
                    "Per strip: audible, gain, gain reduction, muted time - and the strips marked save, which "
                    "Export Release writes next to the song ('<name>-stems')."
                ),
            ),
            BlueprintOutput(
                "separation_report",
                "PLENIO_REPORT",
                (separate, "report"),
                tooltip="Stem names and how much the residual holds.",
            ),
        ],
    )


def creativity_node(g: Graph, pos: tuple[float, float], stage: str, title: str) -> Node:
    """The brief's creativity as one stage's sampling (``core.creativity``): 50 gives the values of before."""
    return g.add(
        "PlenioCreativity",
        pos,
        size=(320, 130 + SUMMARY_ROOM),
        title=title,
        widgets={"stage": stage, "creativity": CREATIVITY_DEFAULT},
    )


def link_sampling(
    g: Graph, creativity: Node, target: Node, prefix: str = "", *, all_three: bool = True
) -> None:
    """The Creativity node's temperature (and top-p and top-k) into ``target``'s fields."""
    for name in ("temperature", "top_p", "top_k") if all_three else ("temperature",):
        g.link(creativity, name, target, prefix + name)


def _repair_writer(
    g: Graph,
    x: int,
    choice: Node,
    loader: Node,
    seed: Node,
    fit: Node,
    *,
    outputs: tuple[str, str] = ("prompt", "schema"),
    y: int = 300,
    title: str = "Repair",
    max_tokens: int = WRITER_MAX_TOKENS,
    temperature: float = REPAIR_TEMPERATURE,
    context: int = WRITER_CONTEXT,
) -> tuple[Node, Node, Node]:
    """One repair round's writer: Generate Text and Local LLM on the previous node's request (``outputs``:
    its prompt and schema), with the first writer's choice, loader and seed; the next node reads the switch
    lazily, only when something went back to the writer (Fit Lyrics' lines, Apply Arrangement's re-ask)."""
    generate = g.add(
        "TextGenerate",
        (x, y),
        size=(340, 420),
        title=f"{title} (ComfyUI)",
        widgets={
            "prompt": "",
            "max_length": max_tokens,
            "sampling_mode": "on",
            "sampling_mode.temperature": temperature,
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
        (x, y + 480),
        size=(340, 360),
        title=f"{title} (Local LLM)",
        widgets={
            "prompt": "",
            "model": CHOOSE,
            "seed": 0,
            "seed.control": "fixed",
            "max_tokens": max_tokens,
            "temperature": temperature,
            "thinking": False,
            "context": context,
            "keep_loaded": False,
            "system_prompt": "",
            "reuse_answers": True,
        },
    )
    switch = g.add("ComfySwitchNode", (x + 400, y), size=(260, 90), title=f"{title}: ComfyUI or Local LLM")
    g.link(fit, outputs[0], generate, "prompt")
    g.link(fit, outputs[0], local_llm, "prompt")
    g.link(fit, outputs[1], local_llm, "schema")
    g.link(seed, "INT", generate, "sampling_mode.seed")
    g.link(seed, "INT", local_llm, "seed")
    g.link(loader, "CLIP", generate, "clip")
    g.link(choice, "local_model", local_llm, "model")
    g.link(choice, "use_local", switch, "switch")
    g.link(generate, "generated_text", switch, "on_false")
    g.link(local_llm, "text", switch, "on_true")
    return generate, local_llm, switch


def write_song() -> Blueprint:
    """Compose -> writer -> Parse -> Fit Lyrics with two repair rounds. One *writer model* list (Writer
    Choice) holds ComfyUI's text models and every Local LLM model (ADR-0010); a lazy switch takes the answer
    of the chosen branch only, so the other model is never loaded. The model names reach the loaders by
    link, so ComfyUI does not require the default writer's file when a Local LLM model is chosen. A repair
    round (new cover lyrics against the melody) runs only when lines do not fit: each Fit Lyrics reads the
    next writer's answer lazily."""
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
    # the first draft follows the brief's creativity; the repair rounds keep their own temperature
    creativity = creativity_node(g, (0, 680), "writer", "Writer creativity")
    link_sampling(g, creativity, generate, "sampling_mode.", all_three=False)
    link_sampling(g, creativity, local_llm, all_three=False)
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
    fits = [
        g.add(
            "PlenioFitLyrics",
            (1460 + 700 * index, 0),
            size=(340, 220),
            title=f"Fit Lyrics ({name})",
            widgets={"last": index == 2},
        )
        for index, name in enumerate(("draft", "round 1", "round 2"))
    ]
    g.link(parse, "lyrics", fits[0], "lyrics")
    repairs: list[tuple[Node, Node]] = []
    for index in (1, 2):
        previous, fit = fits[index - 1], fits[index]
        generate_n, local_n, switch_n = _repair_writer(
            g, 1460 + 700 * (index - 1), choice, loader, seed, previous
        )
        g.link(previous, "lyrics", fit, "lyrics")
        g.link(previous, "state", fit, "state")
        g.link(switch_n, "output", fit, "answer")
        repairs.append((generate_n, local_n))
    return Blueprint(
        "Plenio · Write Song",
        "Plenio/Writing",
        "Writes title, style, lyrics and an artwork prompt following the rules of the loaded music model. The "
        "writer model is one list: ComfyUI's own text models (native Generate Text, the default) and every "
        "local LLM - GGUF files from models/LLM, LM Studio or the Hugging Face cache, or the models of a "
        "running LM Studio, Ollama, llama.cpp ... Only the chosen one is loaded. The brief's song seed is "
        "added to the draft seed: every song of a 'new song every run' series gets its own. New cover lyrics "
        "are fitted to the melody: lines that do not fit their phrase go back to the same writer, only those "
        "lines and at most twice (Fit Lyrics); when the draft fits, no second writer call is made.",
        g,
        [
            BlueprintInput(
                "brief",
                "PLENIO_BRIEF",
                [(compose, "brief"), (creativity, "brief"), *[(fit, "brief") for fit in fits]],
                tooltip="The Song Brief or Cover Brief: what to write (and its creativity: the draft's temperature).",
            ),
            BlueprintInput(
                "engine",
                "PLENIO_ENGINE",
                [(compose, "engine")],
                tooltip="From the music model block: the rules the writing follows.",
            ),
            BlueprintInput(
                "score",
                "STRING",
                [(compose, "score"), *[(fit, "score") for fit in fits]],
                tooltip="The final score (covers): the lyrics follow its sections, and new cover lyrics are "
                "fitted to its phrases line by line.",
            ),
            BlueprintInput(
                "language",
                "STRING",
                [(compose, "language")],
                tooltip="The language Transcribe Lyrics heard (an original-lyrics cover whose brief says auto).",
            ),
            BlueprintInput(
                "reference_lyrics",
                "STRING",
                [(compose, "reference_lyrics"), *[(fit, "reference_lyrics") for fit in fits]],
                tooltip="The source's transcribed lyrics (new cover lyrics with the phrasing reference or a lyrics "
                "closeness above 0); requested only then.",
            ),
            BlueprintInput(
                "model",
                "COMBO",
                [(choice, "model")],
                widget=True,
                default=WRITER,
                label="writer model",
                tooltip=WRITER_MODEL,
            ),
            BlueprintInput(
                "sampling_mode.seed",
                "INT",
                [(draft, "value")],
                widget=True,
                default=0,
                label="draft seed",
                tooltip="The draft seed: the same seed and brief give the same draft; another seed, another draft. "
                "The brief's song seed is added, so every song of a series gets its own.",
            ),
            BlueprintInput(
                "song_seed",
                "INT",
                [(seed, "values.b")],
                label="song seed",
                tooltip="From the brief: a new value for every song of a series, 0 for one song (added to the "
                "draft seed).",
            ),
            BlueprintInput(
                "thinking",
                "BOOLEAN",
                [
                    (generate, "thinking"),
                    (local_llm, "thinking"),
                    *[(n, "thinking") for pair in repairs for n in pair],
                ],
                widget=True,
                default=False,
                tooltip="Let a reasoning writer think before it answers (Qwen, Gemma ...): slower, the thoughts are "
                "not used. Needs more tokens.",
            ),
        ],
        [
            BlueprintOutput("title", "STRING", (parse, "title"), tooltip="The title draft."),
            BlueprintOutput(
                "style", "STRING", (parse, "style"), tooltip="The style draft (MiniMax Music 3: the caption)."
            ),
            BlueprintOutput(
                "lyrics",
                "STRING",
                (fits[2], "lyrics"),
                tooltip="The lyrics draft (new cover lyrics: fitted to the melody).",
            ),
            BlueprintOutput(
                "artwork_prompt", "STRING", (parse, "artwork_prompt"), tooltip="The cover art prompt draft."
            ),
            BlueprintOutput(
                "report",
                "PLENIO_REPORT",
                (parse, "report"),
                tooltip="What Parse Song Draft read and enforced.",
            ),
            BlueprintOutput(
                "lyrics_fit_report",
                "PLENIO_REPORT",
                (fits[2], "report"),
                tooltip="How the lyrics fit the melody (new cover lyrics; Fit Lyrics).",
            ),
        ],
    )


def arrange() -> Blueprint:
    """Compose Arrangement -> writer (the same writer list as Write Song) -> Apply Arrangement. Apply's answer
    is lazy: with arrangement off, for a cover kept at its original song flow and without a score, nothing
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
    # the first plan follows the brief's creativity; the re-ask keeps its own temperature
    creativity = creativity_node(g, (0, 730), "arrangement", "Arrangement creativity")
    link_sampling(g, creativity, generate, "sampling_mode.", all_three=False)
    link_sampling(g, creativity, local_llm, all_three=False)
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
    # the re-ask: sections whose chords the harmony guard had to repair go back to the writer once
    _generate2, _local2, switch2 = _repair_writer(
        g,
        1100,
        choice,
        loader,
        seed,
        apply,
        outputs=("reask_prompt", "reask_schema"),
        y=330,
        title="Re-ask",
        max_tokens=ARRANGE_MAX_TOKENS,
        temperature=ARRANGE_TEMPERATURE,
        context=ARRANGE_CONTEXT,
    )
    second = g.add(
        "PlenioApplyArrangement",
        (1800, 0),
        size=(340, 260),
        title="Apply Arrangement (re-ask)",
        widgets={"seed": 0, "seed.control": "fixed"},
    )
    g.link(seed, "INT", second, "seed")
    g.link(apply, "state", second, "first")
    g.link(switch2, "output", second, "answer")
    return Blueprint(
        "Plenio · Arrange",
        "Plenio/Score",
        "The creative modes' section plan: the writer model plans every section of the score (chords, what the "
        "instrument line plays, energy; a key change only in the mode key change) as a small JSON plan, and Plenio writes the notes and checks "
        "the result - or keeps the score as it was and says why (in the report and the Song Sheet). In the "
        "brief's arrangement off nothing runs here. The writer model is the same list as Write Song's; GGUF files, "
        "LM Studio and Ollama keep to the plan's format exactly. The arrangement seed gives another arrangement "
        "of the same song. Sections whose chords the harmony check had to repair much go back to the writer once "
        "(the re-ask); the better arrangement is used.",
        g,
        [
            BlueprintInput(
                "score",
                "STRING",
                [(compose, "score"), (apply, "score"), (second, "score")],
                tooltip="The score to arrange: YuE2's plan, or a cover's transcription.",
            ),
            BlueprintInput(
                "brief",
                "PLENIO_BRIEF",
                [(compose, "brief"), (apply, "brief"), (second, "brief"), (creativity, "brief")],
                tooltip="The brief: the creative mode and its closeness (arrangement off: nothing runs here), and "
                "its creativity (the plan's temperature).",
            ),
            BlueprintInput(
                "engine",
                "PLENIO_ENGINE",
                [(compose, "engine"), (apply, "engine"), (second, "engine")],
                tooltip="The music model: YuE2's context budget is checked with it.",
            ),
            BlueprintInput(
                "style",
                "STRING",
                [(compose, "style"), (apply, "style"), (second, "style")],
                tooltip="The song's style: the mood, and the exact context budget.",
            ),
            BlueprintInput(
                "lyrics",
                "STRING",
                [(compose, "lyrics"), (apply, "lyrics"), (second, "lyrics")],
                tooltip="The song's lyrics: the mood, and the exact context budget.",
            ),
            BlueprintInput(
                "model",
                "COMBO",
                [(choice, "model")],
                widget=True,
                default=WRITER,
                label="writer model",
                tooltip=WRITER_MODEL,
            ),
            BlueprintInput(
                "seed",
                "INT",
                [(arrangement_seed, "value")],
                widget=True,
                default=0,
                label="arrangement seed",
                tooltip="Another seed, another arrangement of the same song (the writer's plan and the notes "
                "Plenio writes). The brief's song seed is added.",
            ),
            BlueprintInput(
                "song_seed",
                "INT",
                [(seed, "values.b")],
                label="song seed",
                tooltip="From the brief: a new value for every song of a series, 0 for one song (added to the "
                "arrangement seed).",
            ),
        ],
        [
            BlueprintOutput(
                "score",
                "STRING",
                (second, "score"),
                tooltip="The arranged score, or the score as it was (the report says why).",
            ),
            BlueprintOutput(
                "report",
                "PLENIO_REPORT",
                (second, "report"),
                tooltip="What was arranged and kept, for Song Sheet · Score.",
            ),
        ],
    )


HEARD_CHECK_MAX_TOKENS = 1024  # a few corrections in JSON
HEARD_CHECK_CONTEXT = 8192  # the lyrics as heard (1 000-3 000 tokens) and the answer
HEARD_CHECK_TEMPERATURE = 0.2
"""A judgement, not a song: little sampling."""


def check_heard() -> Blueprint:
    """Compose Misheard Check -> writer (the same list as Write Song) -> Apply Misheard Check, between Transcribe
    Lyrics and the cover's Song Sheet (owner's rule 2026-10-24: misheard words are corrected only in a cover's
    transcribed original lyrics, before the render). Apply's answer is lazy: anything but a Cover Brief with
    original lyrics asks no writer - no model loads."""
    g = Graph(first_id=1401)
    compose = g.add("PlenioComposeHeardCheck", (0, 0), size=(320, 150))
    choice = g.add(
        "PlenioWriterChoice",
        (0, 170),
        size=(WRITER_WIDTH, 120),
        title="Writer Choice",
        widgets={"model": WRITER},
        properties=model(WRITER),
    )
    loader = g.add(
        "CLIPLoader",
        (460, 0),
        size=(300, 110),
        title="Writer model (ComfyUI)",
        widgets={"clip_name": WRITER, "type": "stable_diffusion", "device": "default"},
        properties=model(WRITER),
    )
    generate = g.add(
        "TextGenerate",
        (460, 170),
        size=(340, 420),
        title="Generate Text (ComfyUI)",
        widgets={
            "prompt": "",
            "max_length": HEARD_CHECK_MAX_TOKENS,
            "sampling_mode": "on",
            "sampling_mode.temperature": HEARD_CHECK_TEMPERATURE,
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
        (460, 660),
        size=(340, 360),
        widgets={
            "prompt": "",
            "model": CHOOSE,
            "seed": 0,
            "seed.control": "fixed",
            "max_tokens": HEARD_CHECK_MAX_TOKENS,
            "temperature": HEARD_CHECK_TEMPERATURE,
            "thinking": False,
            "context": HEARD_CHECK_CONTEXT,
            "keep_loaded": False,
            "system_prompt": "",
            "reuse_answers": True,
        },
    )
    switch = g.add("ComfySwitchNode", (860, 170), size=(260, 90), title="ComfyUI or Local LLM")
    apply = g.add("PlenioApplyHeardCheck", (1180, 0), size=(360, 260))
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
        "Plenio · Fix Misheard Words",
        "Plenio/Lyrics",
        "Misheard words in a cover's original lyrics, before the render: the writer model reads the lyrics "
        "Transcribe Lyrics heard in the source, with the words it was unsure of marked, and corrects those it is "
        "sure were misheard - with a word that sounds alike, fits the line and has as many syllables. The Song "
        "Sheet lists each correction with the word heard. Only a Cover Brief with original lyrics asks the "
        "writer; new lyrics, an instrumental and lyrics you write yourself are never changed.",
        g,
        [
            BlueprintInput(
                "lyrics",
                "STRING",
                [(compose, "lyrics"), (apply, "lyrics")],
                tooltip="The lyrics draft Transcribe Lyrics made from the source's singing.",
            ),
            BlueprintInput(
                "report",
                "PLENIO_REPORT",
                [(compose, "report"), (apply, "report")],
                tooltip="Transcribe Lyrics' report: which words it heard unsure.",
            ),
            BlueprintInput(
                "brief",
                "PLENIO_BRIEF",
                [(compose, "brief"), (apply, "brief")],
                tooltip="The Cover Brief: only original lyrics are checked.",
            ),
            BlueprintInput(
                "language",
                "STRING",
                [(compose, "language"), (apply, "language")],
                tooltip="The language Transcribe Lyrics heard.",
            ),
            BlueprintInput(
                "model",
                "COMBO",
                [(choice, "model")],
                widget=True,
                default=WRITER,
                label="writer model",
                tooltip=WRITER_MODEL,
            ),
        ],
        [
            BlueprintOutput(
                "lyrics",
                "STRING",
                (apply, "lyrics"),
                tooltip="The draft, with the misheard words corrected.",
            ),
            BlueprintOutput(
                "report",
                "PLENIO_REPORT",
                (apply, "report"),
                tooltip="What was corrected, and why not the rest.",
            ),
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
            BlueprintOutput(
                "score",
                "STRING",
                (node, "score"),
                tooltip="The transcribed score (native two-voice ABC, chords).",
            ),
            BlueprintOutput(
                "timeline",
                "PLENIO_TIMELINE",
                (node, "timeline"),
                tooltip="Bar times and sung notes of the source, for the lyrics and the editor.",
            ),
            BlueprintOutput(
                "report", "PLENIO_REPORT", (node, "report"), tooltip="Bars, tempo, key, sections and voices."
            ),
            BlueprintOutput(
                "AUDIO_ENCODER",
                "AUDIO_ENCODER",
                (loader, "AUDIO_ENCODER"),
                tooltip="The loaded SheetSage2, for Check Vocals.",
            ),
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
    # a second plan with the next seed, planned only when Match Song Form asks for it (the first plan's
    # sung sections cannot be made to fit the lyrics')
    alternative = g.add(
        "YuE2GenerateABC",
        (0, 820),
        size=(340, 330),
        title="Second plan (only when the form differs)",
        widgets={"seed": 0, "seed.control": "fixed", "mode": "full"},
    )
    next_seed = g.add(
        "ComfyMathExpression",
        (400, 820),
        size=(300, 150),
        title="seed + 1",
        widgets={"expression": "sum(values) + 1"},
    )
    form = g.add("PlenioMatchSongForm", (720, 0), size=(340, 160 + SUMMARY_ROOM))
    creativity = creativity_node(g, (720, 330), "plan", "Plan creativity")
    link_sampling(g, creativity, plan)
    link_sampling(g, creativity, alternative)
    g.link(empty, "STRING", switch, "on_false")
    g.link(plan, "abc", switch, "on_true")
    g.link(plan_seed, "INT", seed, "values.a")
    g.link(seed, "INT", plan, "seed")
    g.link(seed, "INT", next_seed, "values.a")
    g.link(next_seed, "INT", alternative, "seed")
    g.link(switch, "output", form, "score")
    g.link(alternative, "abc", form, "alternative")
    return Blueprint(
        "Plenio · YuE2 Plan",
        "Plenio/YuE2",
        "Plans the song's score (ABC) from style and lyrics with YuE2. With planning off, no score is made and "
        "YuE2 renders without a plan. The brief's song seed is added to the plan seed: every song of a 'new "
        "song every run' series gets its own plan. Match Song Form makes the plan fit the lyrics' song form "
        "(sections in the lyrics' order or named after them); when the plan cannot be made to fit, YuE2 plans "
        "once more with the next seed and the better plan wins.",
        g,
        [
            BlueprintInput("clip", "CLIP", [(plan, "clip"), (alternative, "clip")], tooltip=FROM_MODEL_BLOCK),
            BlueprintInput(
                "style",
                "STRING",
                [(plan, "style"), (alternative, "style")],
                tooltip="The final style (Song Sheet · Text): what YuE2 plans for.",
            ),
            BlueprintInput(
                "lyrics",
                "STRING",
                [(plan, "lyrics"), (alternative, "lyrics"), (form, "lyrics")],
                tooltip="What the planner reads (Song Sheet · Text's plan_lyrics): the lyrics, or a section form "
                "for an instrumental.",
            ),
            BlueprintInput(
                "seed",
                "INT",
                [(plan_seed, "value")],
                widget=True,
                default=0,
                label="plan seed",
                tooltip="The plan seed: the same seed gives the same plan; another seed, another melody and form. "
                "The brief's song seed is added.",
            ),
            BlueprintInput(
                "song_seed",
                "INT",
                [(seed, "values.b")],
                label="song seed",
                tooltip="From the brief: added to the plan seed, so every song of a series gets its own plan.",
            ),
            BlueprintInput(
                "switch",
                "BOOLEAN",
                [(switch, "switch")],
                widget=True,
                default=True,
                label="planning",
                tooltip="On: YuE2 plans a score (melody, chords, form) that the Song Sheet shows and you can edit. "
                "Off: no score - YuE2 renders without a plan.",
            ),
            BlueprintInput(
                "mode",
                "COMBO",
                [(plan, "mode"), (alternative, "mode")],
                widget=True,
                default="full",
                label="plan type",
                tooltip="full: melody and chords; melody: the melody only (YuE2 harmonises it when it renders).",
            ),
            BlueprintInput(
                "creativity",
                "INT",
                [(creativity, "creativity")],
                widget=True,
                default=CREATIVITY_DEFAULT,
                tooltip=CREATIVITY
                + " Here: the plan's temperature, top-p and top-k (how freely YuE2 picks notes, "
                "chords and rhythms).",
            ),
        ],
        [
            BlueprintOutput(
                "score",
                "STRING",
                (form, "score"),
                tooltip="The planned score in the lyrics' song form (empty with planning off).",
            ),
            BlueprintOutput(
                "form_report",
                "PLENIO_REPORT",
                (form, "report"),
                tooltip="How the plan was made to fit the lyrics' song form (for Song Sheet · Score).",
            ),
        ],
    )


def yue2_chain(
    g: Graph, x: float, y: float, creativity: Node | None, title: str | None = None
) -> dict[str, Node]:
    """One YuE2 render: Generate Music (its sampling from ``creativity``, else linked later), latent, sampler,
    decode."""
    music = g.add(
        "YuE2GenerateMusic",
        (x, y),
        size=(340, 380),
        title=title,
        widgets={"seed": 0, "seed.control": "fixed"},
    )
    latent = g.add("EmptyYuE2LatentAudio", (x + 400, y), size=(260, 80))
    zero = g.add("ConditioningZeroOut", (x + 400, y + 130), size=(240, 50))
    sampler = g.add(
        "KSampler",
        (x + 700, y),
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
    decode = g.add("VAEDecodeAudio", (x + 1060, y), size=(220, 60))
    if creativity is not None:
        link_sampling(g, creativity, music)
    g.link(music, "seconds", latent, "seconds")
    g.link(music, "CONDITIONING", zero, "conditioning")
    g.link(music, "CONDITIONING", sampler, "positive")
    g.link(zero, "CONDITIONING", sampler, "negative")
    g.link(latent, "LATENT", sampler, "latent_image")
    g.link(sampler, "LATENT", decode, "samples")
    return {"music": music, "sampler": sampler, "decode": decode}


def yue2_render() -> Blueprint:
    g = Graph(first_id=801)
    # the first take's nodes keep the ids of before the creativity and the retakes: a saved block is brought up
    # to date by them (core.blocks)
    first = yue2_chain(g, 0, 0, None)
    creativity = creativity_node(g, (0, 440), "take", "Take creativity")
    link_sampling(g, creativity, first["music"])
    # the lyrics fidelity's retakes (2026-10-24): rendered only when Best Take asks for them
    second, third = (
        yue2_chain(g, 400, 660 * k, creativity, title) for k, title in enumerate(RETAKE_TITLES, start=1)
    )
    plus_one, plus_two = retake_seed(g, (0, 660), 1), retake_seed(g, (0, 1320), 2)
    for plus, chain in ((plus_one, second), (plus_two, third)):
        g.link(plus, "INT", chain["music"], "seed")
        g.link(plus, "INT", chain["sampler"], "seed")
    chains = (first, second, third)
    return Blueprint(
        "Plenio · YuE2 Render",
        "Plenio/YuE2",
        "Renders the final style, lyrics and score with YuE2 exactly as given (native nodes, 32 steps). The take "
        "seed drives both the token and the audio sampling. A second and a third take (seed + 1, + 2) render only "
        "when Best Take asks for them (the brief's lyrics fidelity).",
        g,
        [
            BlueprintInput(
                "model", "MODEL", [(c["sampler"], "model") for c in chains], tooltip=FROM_MODEL_BLOCK
            ),
            BlueprintInput("clip", "CLIP", [(c["music"], "clip") for c in chains], tooltip=FROM_MODEL_BLOCK),
            BlueprintInput("vae", "VAE", [(c["decode"], "vae") for c in chains], tooltip=FROM_MODEL_BLOCK),
            *_render_documents([c["music"] for c in chains]),
            BlueprintInput(
                "seed",
                "INT",
                [
                    (first["music"], "seed"),
                    (first["sampler"], "seed"),
                    (plus_one, "values.a"),
                    (plus_two, "values.a"),
                ],
                label="take seed",
                tooltip=TAKE_SEED,
            ),
            BlueprintInput(
                "max_duration",
                "FLOAT",
                [(c["music"], "max_duration") for c in chains],
                label="max seconds",
                tooltip=MAX_SECONDS,
            ),
            BlueprintInput(
                "creativity",
                "INT",
                [(creativity, "creativity")],
                widget=True,
                default=CREATIVITY_DEFAULT,
                tooltip=CREATIVITY
                + " Here: the take's temperature, top-p and top-k (how freely YuE2 performs the "
                "score).",
            ),
        ],
        [
            BlueprintOutput("AUDIO", "AUDIO", (first["decode"], "AUDIO"), tooltip="The rendered take."),
            BlueprintOutput(
                "seconds", "FLOAT", (first["music"], "seconds"), tooltip="The take's length in seconds."
            ),
            BlueprintOutput("second", "AUDIO", (second["decode"], "AUDIO"), tooltip=SECOND_TAKE),
            BlueprintOutput("third", "AUDIO", (third["decode"], "AUDIO"), tooltip=THIRD_TAKE),
        ],
    )


def _render_documents(musics: list[Node], loop: Node | None = None) -> list[BlueprintInput]:
    """The Song Sheet's final documents for every YuE2 Generate Music (the takes' loop starts with the lyrics)."""
    return [
        BlueprintInput(
            "style",
            "STRING",
            [(music, "style") for music in musics],
            tooltip="The final style (Song Sheet): rendered exactly as given.",
        ),
        BlueprintInput(
            "lyrics",
            "STRING",
            [
                *((music, "lyrics") for music in musics),
                *([(loop, "initial_iteration_value")] if loop is not None else []),
            ],
            tooltip="The final lyrics (Song Sheet): rendered exactly as given.",
        ),
        BlueprintInput(
            "abc",
            "STRING",
            [(music, "abc") for music in musics],
            label="score",
            tooltip="The final score (Song Sheet); empty: YuE2 renders without a score.",
        ),
        BlueprintInput(
            "mode",
            "COMBO",
            [(music, "mode") for music in musics],
            label="planning mode",
            tooltip="From the Song Sheet: full when the score has chords, melody otherwise.",
        ),
    ]


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
    creativity = creativity_node(g, (360, 440), "take", "Take creativity")
    link_sampling(g, creativity, music)
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
    # the lyrics fidelity's retakes (2026-10-24), after the loop's seeds: rendered only when Best Take asks
    second, third = (
        yue2_chain(g, 360, 660 * k, creativity, title) for k, title in enumerate(RETAKE_TITLES, start=1)
    )
    plus_one = retake_seed(g, (0, 660), 1, takes=True)
    plus_two = retake_seed(g, (0, 1320), 2, takes=True)
    for plus, chain in ((plus_one, second), (plus_two, third)):
        g.link(plus, "INT", chain["music"], "seed")
        g.link(plus, "INT", chain["sampler"], "seed")
    retakes = (second, third)
    return Blueprint(
        "Plenio · YuE2 Takes",
        "Plenio/YuE2",
        "Renders the final style, lyrics and score N times with the seeds take seed, take seed + 1, ... "
        "(native loop). Connect the takes to Check Vocals, which keeps the best one. N takes cost N renders. Two "
        "more takes (the seeds after them) render only when Best Take asks for them (the brief's lyrics fidelity).",
        g,
        [
            BlueprintInput(
                "model",
                "MODEL",
                [(sampler, "model"), *((c["sampler"], "model") for c in retakes)],
                tooltip=FROM_MODEL_BLOCK,
            ),
            BlueprintInput(
                "clip",
                "CLIP",
                [(music, "clip"), *((c["music"], "clip") for c in retakes)],
                tooltip=FROM_MODEL_BLOCK,
            ),
            BlueprintInput(
                "vae",
                "VAE",
                [(decode, "vae"), *((c["decode"], "vae") for c in retakes)],
                tooltip=FROM_MODEL_BLOCK,
            ),
            # The loop starts only with the final lyrics: a native loop whose body is blocked (a Song
            # Sheet waiting for review) never finishes in ComfyUI 0.37.0 (Phase 4B, measured).
            *_render_documents([music, *(c["music"] for c in retakes)], loop=start),
            BlueprintInput(
                "seed",
                "INT",
                [(seed, "values.b"), (plus_one, "values.a"), (plus_two, "values.a")],
                label="take seed",
                tooltip="The first take's seed; the next takes use the following seeds. Another seed, other takes "
                "of the same documents.",
            ),
            BlueprintInput(
                "max_duration",
                "FLOAT",
                [(music, "max_duration"), *((c["music"], "max_duration") for c in retakes)],
                label="max seconds",
                tooltip=MAX_SECONDS,
            ),
            BlueprintInput(
                "takes",
                "INT",
                [(start, "mode.num_iterations"), (plus_one, "values.b"), (plus_two, "values.b")],
                default=1,
                tooltip="How many takes: take seed, take seed + 1, ...; Check Vocals keeps the best. N takes cost "
                "N renders.",
            ),
            BlueprintInput(
                "creativity",
                "INT",
                [(creativity, "creativity")],
                widget=True,
                default=CREATIVITY_DEFAULT,
                tooltip=CREATIVITY
                + " Here: the take's temperature, top-p and top-k (how freely YuE2 performs the "
                "score).",
            ),
        ],
        [
            BlueprintOutput("takes", "AUDIO", (end, "outputs"), tooltip="All takes, for Check Vocals."),
            BlueprintOutput("second", "AUDIO", (second["decode"], "AUDIO"), tooltip=SECOND_TAKE),
            BlueprintOutput("third", "AUDIO", (third["decode"], "AUDIO"), tooltip=THIRD_TAKE),
        ],
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
        "native nodes; Apache-2.0). On in the song templates (about 16 GB of model files): the Cover Art card of "
        "HQ Mastering & Cover Art switches it off. The writer's artwork prompt is read from the song - its lyrics, "
        "its title, its genre and mood. The seed decides the picture; another seed, another cover. Replace the "
        "block with any text-to-image block that takes a prompt and gives an image.",
        g,
        [
            BlueprintInput(
                "text",
                "STRING",
                [(encode, "text")],
                label="prompt",
                tooltip="The cover art prompt (the Song Sheet's artwork prompt).",
            ),
            BlueprintInput(
                "noise_seed",
                "INT",
                [(noise, "noise_seed")],
                default=0,
                label="cover seed",
                tooltip="The cover seed: fixed, so new takes keep the cover; another seed, another cover.",
            ),
            BlueprintInput(
                "size",
                "INT",
                [(scheduler, "width"), (scheduler, "height"), (latent, "width"), (latent, "height")],
                default=COVER_SIZE,
                label="size (square, px)",
                tooltip="Width and height of the square cover in pixels.",
            ),
        ],
        [
            BlueprintOutput(
                "IMAGE", "IMAGE", (decode, "IMAGE"), tooltip="The cover image, for Export Release."
            )
        ],
    )


# --- templates ------------------------------------------------------------------------------------

GROUP = "#3f789e"
MODEL_GROUP = "#444"
OPTIONAL_GROUP = "#555"
COVER_GROUP = "#8a4f7d"
COVER_SWITCH = {"plenio_switch": "cover"}
"""The nodes the Cover Art switch bypasses (``frontend/src/extension/finishSwitch.ts``)."""
ABOUT_SIZE = (480, 760)
SUMMARY_ROOM = 100
"""Height every node with a run summary keeps free for it (about five lines). Without the room the
frontend squeezed the summary into what was left after a run - one clipped line on Score Tools and
the EQ - and shrank the brief's description field; ``frontend/src/extension/summary.ts`` gives the
summary its minimum, and ``tests/workflows/test_graphs.py`` checks the room."""


HQ_MASTERING_TOOLTIP = hq.HQ_MASTERING_HINT
HQ_SWITCH_SIZE = (520, 160)
"""The first node of group 1, the first thing a template shows (owner's request 2026-10-22). Wide enough for
both cards of *HQ Mastering & Cover Art* (owner's request 2026-10-23), as wide as the brief under it."""
WRITER_Y = 250
"""The writer model under the switches, in group 1 (owner's request 2026-10-24: chosen at the start)."""
COLUMN_ONE_Y = 560
"""Where group 1's own nodes start (the brief, the source recording): under the switches and the writer model,
so that every section's first node stands at the top of the row (owner's request 2026-10-24)."""


def hq_switch(g: Graph, target: Node, name: str = "hq_mastering", *, on: bool = False) -> Node:
    """The HQ Mastering switch at the start, wired into the Master block (``target``; Enhance & Master: HQ 2
    itself) only - so switching it runs the mastering again, not the song. ``on``: off in the song templates
    (UniverSR about doubles a song's time), on in Enhance & Master (owner's request 2026-10-24). Made last, so
    that the template's other node ids stay as they were (continuing an older song maps its values by id)."""
    switch = g.add(
        "PlenioHQMastering",
        (0, 0),
        size=HQ_SWITCH_SIZE,
        title="HQ Mastering & Cover Art",
        widgets={"hq_mastering": on},
    )
    g.link(switch, "hq_mastering", target, name)
    return switch


BEST_TAKE_SIZE = (320, 150 + SUMMARY_ROOM)


def best_take(
    g: Graph,
    pos: tuple[float, float],
    *,
    take: tuple[Node, str],
    render: Node,
    lyrics: tuple[Node, str],
    brief: Node,
) -> Node:
    """Best Take (the brief's lyrics fidelity): the first take, or the take of two or three that sings most of
    its lyrics - the render block's second and third takes run only when it asks for them."""
    node = g.add("PlenioBestTake", pos, size=BEST_TAKE_SIZE, title="Best Take · lyrics fidelity")
    g.link(take[0], take[1], node, "take")
    g.link(render, "second", node, "second")
    g.link(render, "third", node, "third")
    g.link(lyrics[0], lyrics[1], node, "lyrics")
    g.link(brief, "brief", node, "brief")
    return node


def about_note(g: Graph, text: str, height: float = ABOUT_SIZE[1]) -> Node:
    return g.add_frontend(
        "MarkdownNote", (-560, 0), size=(ABOUT_SIZE[0], height), title="About this template", widgets=[text]
    )


MODELS_NOTE_X = -1120
MODELS_NOTE_WIDTH = 520
MODELS_ALTERNATIVES = {
    "flux-2-klein-4b.safetensors": "flux-2-klein-4b-fp8.safetensors",
    "qwen_3_4b.safetensors": "qwen_3_4b_fp4_flux2.safetensors",
    "minimax_music3_dit_fp16.safetensors": "minimax_music3_dit_int8_convrot.safetensors",
    "yue2_3b_int8_convrot.safetensors": "yue2_3b_bf16.safetensors",
}
"""The catalogue's alternative of a default file (docs/user/models.md, *Smaller GPUs*; the System Check's rules)."""
MODELS_ROLES = {
    "universr-audio": "HQ mastering (the *HQ Mastering* card): UniverSR regenerates the highs above 8.2 kHz",
    "bs-roformer-4stem": (
        "stems (the Master's *stems* switch); when it is there, Export Release also hears the lyrics on the vocal "
        "stem - their times get more exact"
    ),
    "yue2-instrumental-lora": "the instrumental adapter in the model block (bypassed until you switch it on)",
}
"""A shorter word for the note where the catalogue's role is long."""
MODELS_WHY = {
    "audio_sr": "HQ mastering",
    "audio_separation": "stems, the vocal stem for the lyrics times",
    "loras": "the instrumental adapter",
}
"""What an optional file is for, by its folder (the note's tree)."""


def _gb(size: int) -> str:
    return f"{size / 1e9:.1f} GB" if size >= 1e9 else f"{size / 1e6:.0f} MB" if size else "see the model card"


def _models_tree(models: list[ModelFile], needed: set[str], *, asr: bool) -> list[str]:
    """The folders under ``ComfyUI/models`` with their files, drawn as ComfyUI's own templates draw them."""
    folders: dict[str, list[str]] = {}
    for model in models:
        folders.setdefault(model.folder, []).append(model.file)
    names = sorted(folders) + (["plenio/asr"] if asr else [])
    tree = ["📂 ComfyUI/", "└── 📂 models/"]
    for index, folder in enumerate(names):
        last = index == len(names) - 1
        if folder == "plenio/asr":
            why, files = " (Plenio fetches these)", ["qwen3-asr-1.7b-hf/", "qwen3-forcedaligner-0.6b-hf/"]
        else:
            optional = folder in MODELS_WHY and not needed.intersection(folders[folder])
            why, files = (f" ({MODELS_WHY[folder]})" if optional else ""), sorted(folders[folder])
        tree.append(f"    {'└──' if last else '├──'} 📂 {folder}/{why}")
        for number, file in enumerate(files):
            tree.append(
                f"    {'    ' if last else '│   '}{'└──' if number == len(files) - 1 else '├──'} {file}"
            )
    return ["```", *tree, "```"]


def models_note_text(template: str) -> str:
    """The *Models* note of a template, like the notes of ComfyUI's own templates (owner's request 2026-10-26): which
    file goes into which folder, with its link and size, the optional ones, what Plenio fetches itself, and the files
    for a smaller or a larger graphics card - all from the model catalogue, so the note and the loaders agree. The
    System Check's note shows every template's files at once."""
    from plenio.core.system import RULES

    catalogue = [m for m in CATALOGUE.values() if m.default]
    overview = template == "0 · System Check"
    enhance = template == "4 · Enhance & Master"
    needed = [m for m in catalogue if (m.templates if overview else template in m.templates)]
    optional = [
        m
        for m in catalogue
        if m not in needed and (m.optional_templates if overview else template in m.optional_templates)
    ]
    lines = ["# Models · what goes where", ""]
    if overview:
        lines.append(
            "This template needs no model file. Run it: it lists what each template needs, what is installed, what is "
            "missing - with the folder and the download link. Here is the whole set at a glance:"
        )
    else:
        lines.append(
            "When the template opens, ComfyUI offers the files it misses (*Missing models*: download them there). By "
            "hand: put each file into its folder below - or into a folder of your `extra_model_paths.yaml`. "
            "**0 · System Check** lists what is there and what is missing."
        )

    def entry(model: ModelFile, optional: bool = False) -> str:
        role = MODELS_ROLES.get(model.id, model.role) if optional else model.role
        if optional and enhance and model.id == "bs-roformer-4stem":
            role = "the *Stems (optional)* block (bypassed: select it and press Ctrl+B)"
        return f"- [{model.file}]({model.url}) · {_gb(model.bytes)} · {model.licence}  \n  {role}"

    lines += ["", "## Needed" if not overview else "## The files", *[entry(m) for m in needed]]
    if optional:
        lines += ["", "## Optional", *[entry(m, optional=True) for m in optional]]
    lines += [
        "",
        "## Where they go",
        "",
        *_models_tree([*needed, *optional], {m.file for m in needed}, asr=not enhance),
    ]
    if overview:
        rows = ["| Template | Needs |", "|---|---|"]
        for name in (
            "1 · YuE2 · Song",
            "2 · YuE2 · Cover",
            "3 · MiniMax · Song",
            "4 · Enhance & Master",
            "5 · YuE2 · DAW",
        ):
            files = [m.file for m in catalogue if name in m.templates]
            rows.append(f"| {name} | {', '.join(f'`{f}`' for f in files)} |")
        lines += ["", *rows]
    if not enhance:
        lines += [
            "",
            "The lyrics ASR (Qwen3-ASR 1.7B, 4.1 GB, and its aligner, 1.8 GB) times the lyrics subtitles and hears a "
            "cover's words: Plenio downloads it into `models/plenio/asr` the first time it is needed. Offline "
            "(`PLENIO_OFFLINE=1`) it names the files to place.",
        ]
    if any("writer" in m.role.lower() for m in needed):
        lines += [
            "",
            "**The writer** can also be a GGUF file of your own in `models/LLM` (or LM Studio's folder) or a model of a "
            "running LM Studio, Ollama, llama.cpp, vLLM or Jan: choose it in *Writer model*. Only the one chosen is "
            "loaded.",
        ]
    if enhance:
        lines += [
            "",
            "## Your computer",
            "",
            "Enhance & Master runs on the CPU. HQ mastering (UniverSR) is faster on a graphics card: about 1.5 s per "
            "second of music on an RTX 5060 Ti; switched off it needs no model at all.",
        ]
    else:
        columns = (
            [("YuE2", "yue2"), ("MiniMax Music 3", "minimax")]
            if overview
            else [("Music model", "minimax" if "MiniMax" in template else "yue2")]
        )
        rows = [
            "| Graphics card | " + " | ".join(label for label, _ in columns) + " | Cover Art |",
            "|---|" + "---|" * len(columns) + "---|",
        ]
        for rule in RULES:
            cells = " | ".join(getattr(rule, key) for _, key in columns)
            rows.append(f"| {rule.label} | {cells} | {rule.cover_art} |")
        lines += [
            "",
            "## Your graphics card",
            "",
            *rows,
            "",
            "No graphics card: the music models are not practical on the CPU; 0 · System Check and 4 · Enhance & Master "
            "run on it.",
        ]
        alternatives = [
            (m, CATALOGUE[MODELS_ALTERNATIVES[m.file]]) for m in needed if m.file in MODELS_ALTERNATIVES
        ]
        if alternatives:
            lines += [
                "",
                "**Files for another card** (choose them in the loader nodes - nothing is switched by itself):",
                *[
                    f"- instead of `{default.file}`: [{other.file}]({other.url}) · {_gb(other.bytes)} · `{other.folder}/`"
                    for default, other in alternatives
                ],
            ]
    lines += [
        "",
        "Licences: [docs/user/licensing.md](https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/"
        "user/licensing.md) · every file: [docs/user/models.md](https://github.com/jplenio/Plenio-Music-Production-System"
        "/blob/main/docs/user/models.md)",
    ]
    return "\n".join(lines) + "\n"


def models_note(g: Graph, template: str) -> Node:
    """The *Models* note left of *About this template* - added last, so that the template's other node ids stay as
    they were (continuing an older song maps its values by id)."""
    text = models_note_text(template)
    height = min(1500, 140 + 21 * sum(1 + len(line) // 62 for line in text.splitlines()))
    return g.add_frontend(
        "MarkdownNote",
        (MODELS_NOTE_X, 0),
        size=(MODELS_NOTE_WIDTH, height),
        title="Models · what goes where",
        widgets=[text],
    )


STYLE_TEMPLATES = TemplateLibrary(PROJECT / "resources" / "templates")
BRIEF_WIDGETS = {
    "description": "description",
    "genre": "genre",
    "mood": "mood",
    "tempo": "tempo",
    "key": "key",
    "meter": "meter",
    "language": "vocals.language",
    "voice": "vocals.voice",
    "theme": "vocals.theme",
    "lyrics": "vocals.lyrics",
}
"""A brief's text fields and the widgets they are in (a vocals choice's inputs are named ``vocals.<input>``)."""
LYRICS_ROOM = 130
"""The Song Brief's lyrics choice and its field (1.5.0)."""


def template_widgets(template_id: str, cover_vocals: str = "") -> dict[str, str]:
    """The brief's text fields as the style template fills them: the shipped workflows show them in the fields, as
    choosing the template does (owner's request 2026-10-31). A cover's fields for its vocals choice (its language
    never: the source's is detected)."""
    fields = STYLE_TEMPLATES.get(template_id).fields
    names = cover_text_fields(cover_vocals) if cover_vocals else tuple(BRIEF_WIDGETS)
    return {BRIEF_WIDGETS[name]: fields[name] for name in names if name in BRIEF_WIDGETS and fields.get(name)}


BRIEF_WIDTH = 520
"""The briefs' width (380 until 0.8.0): template names, typed genres and the creative mode's name fit
(owner's report 2026-10-15: the inputs' text was cut)."""
WIDEN = BRIEF_WIDTH - 380
SLOT_HEIGHT = 20
SONG_FIELD_ROWS = 15
COVER_FIELD_ROWS = 13
CREATIVITY_ROW = 30
"""The creativity slider's row (owner's request 2026-10-19)."""
"""The briefs' field outputs (1.0.0): each takes a slot row above the widgets."""


def make_room(g: Graph, brief: Node, extra_height: float) -> None:
    """Room for the wider and taller brief, once the template stands: what is right of the old brief column
    moves ``WIDEN`` to the right, what stands below the brief in its column moves down by ``extra_height``
    (the field outputs' rows) - nodes and groups alike."""
    left = brief.pos[0] + 380
    bottom = brief.pos[1] + brief.size[1] - extra_height
    for node in g.nodes:
        if node is brief:
            continue
        x, y = node.pos
        x += WIDEN if x >= left else 0
        y += extra_height if y >= bottom and brief.pos[0] <= node.pos[0] < left else 0
        node.pos = (x, y)
    for group in g.groups:
        x, y, width, height = group["bounding"]
        if x >= left - 40:
            x += WIDEN
        if y >= bottom - 80 and brief.pos[0] - 40 <= x < left:
            y += extra_height
        group["bounding"] = [x, y, width, height]


COVER_BRIEF_X = 560
"""The Cover Brief's column, right of group 1 (2026-10-24: before, the brief stood under the source)."""
FOLLOW_BRIEF = {"review": "as the brief says"}
"""The sheets stop for review in the brief's mode 'one song/cover, stop to review' only."""


SHEET_SIZE = (420, 420 + SUMMARY_ROOM)
"""A Song Sheet: its editor button is a card with an icon since 2026-10-24 (``SHEET_WIDGET_HEIGHT`` in
``frontend/src/extension/sheetStateWidget.ts``, 60 px more than the button row before)."""
SHEET_LOOKS = {"text": ("#25695f", "#163d38"), "score": ("#5b4290", "#2b2244"), "daw": ("#2c5a8c", "#183250")}
"""The sheets' colours (owner's request 2026-10-24: the nodes that stop a run for review stand out): teal where
the words are edited, violet where the score is - the colours of their editor buttons (``sheetKind.ts``)."""


def song_sheet(g: Graph, pos: tuple[float, float], title: str, kind: str = "text") -> Node:
    """A Song Sheet that follows the brief's mode; its editor button carries the title (App mode label).
    ``kind``: what its editor edits - ``text`` (title, style, lyrics, cover prompt) or ``score``."""
    node = g.add(
        "PlenioSongSheet",
        pos,
        size=SHEET_SIZE,
        title=title,
        widgets=FOLLOW_BRIEF,
        labels={"sheet_state": title},
    )
    node.color, node.bgcolor = SHEET_LOOKS[kind]
    return node


WRITER_WIDTH = 400
"""The writer model's node and the blocks that show its list: the default model's file name fits (360 cut it)."""
SEED_SIZE = (340, 190)
"""A Plenio · Seed: the number, the switch, the 🎲 button and the line that says what the switch means."""


LORAS_SIZE = (380, 430)
"""YuE2 LoRAs: two inputs, four LoRAs with their strengths, the summary."""


def yue2_loras(g: Graph, model_node: Node) -> Node:
    """YuE2 LoRAs under the music model (GitHub issue 2026-10-28), every slot on none - YuE2 runs as loaded. Its
    MODEL and CLIP go where the model block's went. Made last of all, once the template stands: every other node
    keeps its id (saved workflows, records and the Song API's prompts name them)."""
    x, y = model_node.pos
    loras = g.add("PlenioLoras", (x, y + 80), size=LORAS_SIZE)
    for name in ("MODEL", "CLIP"):
        out = model_node.output_index(name)
        moved = model_node.output_links.pop(out, [])
        for link in g.links:
            if link["id"] in moved:
                link["origin_id"] = loras.id
                link["origin_slot"] = loras.output_index(name)
        loras.output_links.setdefault(loras.output_index(name), []).extend(moved)
    g.link(model_node, "MODEL", loras, "model")
    g.link(model_node, "CLIP", loras, "clip")
    g.join("MUSIC MODEL", loras)
    return loras


def seed_node(
    g: Graph, pos: tuple[float, float], title: str, label: str, *, keep: bool, part: str, seed: int = 0
) -> Node:
    """A seed with one switch (owner's request 2026-10-15): 🔒 the same seed every run - the part stays -, or
    🎲 a new seed drawn before every run. ``part`` names what it decides, for the line under the switch."""
    node = g.add(
        "PlenioSeed",
        pos,
        size=SEED_SIZE,
        title=title,
        widgets={"seed": seed, "keep_seed": keep},
        labels={"seed": label},
        properties={"plenio_part": part},
    )
    # the colours the frontend gives the switch's state (frontend/src/extension/seedNode.ts LOOKS)
    node.color, node.bgcolor = SEED_LOOKS["keep" if keep else "fresh"]
    return node


SEED_LOOKS = {"fresh": ("#7a5418", "#3b2a10"), "keep": ("#1f4e6e", "#14304a")}


def draft_seed(g: Graph, write: Node, pos: tuple[float, float], *, keep: bool) -> Node:
    """The writer's seed as its own node: 🔒 keeps the draft (and an approval) across runs, 🎲 writes a new
    draft every run. Native Generate Text has no switch on its seed. ``keep``: the template stops for review
    (the seeds follow the brief's mode, owner's request 2026-10-23 - runs that go through draw every seed anew)."""
    seed = seed_node(g, pos, "Draft seed", "draft seed", keep=keep, part="draft (title, style, lyrics)")
    g.link(seed, "seed", write, "sampling_mode.seed")
    return seed


def writer_model(g: Graph, pos: tuple[float, float]) -> Node:
    """The template's writer model: one list (ComfyUI's text models and every Local LLM model) for Write Song
    and Arrange, so every writing step uses the same model; App mode shows it. In group 1 under the switches,
    as wide as they are (owner's request 2026-10-24)."""
    return g.add(
        "PlenioWriterChoice",
        pos,
        size=(HQ_SWITCH_SIZE[0], 120 + SUMMARY_ROOM),
        title="Writer model",
        widgets={"model": WRITER},
        # the frontend's missing-model dialog reads the download from the node that shows the file name
        properties=model(WRITER),
        labels={"model": "writer model"},
    )


def arrangement_seed(g: Graph, arrange_node: Node, pos: tuple[float, float], *, keep: bool) -> Node:
    """The arrangement seed as its own node (App mode): another arrangement of the same song - only Arrange
    and what follows it run again."""
    seed = seed_node(g, pos, "Arrangement seed", "arrangement seed", keep=keep, part="arrangement")
    g.link(seed, "seed", arrange_node, "seed")
    return seed


def take_seed(g: Graph, pos: tuple[float, float]) -> Node:
    """The render's seed: 🎲 by default - every run a new take of the same documents."""
    return seed_node(g, pos, "Take seed", "take seed", keep=False, part="take", seed=1)


def plan_seed(g: Graph, plan: Node, pos: tuple[float, float], *, keep: bool) -> Node:
    """YuE2's plan seed as a Plenio · Seed (owner's request 2026-10-17: the seed node wherever it helps): 🔒
    the same melody and form, 🎲 a new plan every run. The brief's song seed is still added inside."""
    seed = seed_node(g, pos, "Plan seed", "plan seed", keep=keep, part="plan (melody and form)")
    g.link(seed, "seed", plan, "seed")
    return seed


def cover_seed(g: Graph, cover: Node, pos: tuple[float, float], *, keep: bool) -> Node:
    """The cover art's seed as a Plenio · Seed (owner's request 2026-10-17): 🔒 the same picture for the same
    prompt, 🎲 another picture every run - a new song every run gets a new picture."""
    seed = seed_node(g, pos, "Cover seed", "cover seed", keep=keep, part="cover art")
    g.link(seed, "seed", cover, "noise_seed")
    return seed


SEED_CONTROLS = ("seed", "keep_seed")
"""What App mode shows of a seed: the number and the switch."""


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
    export_size: tuple[float, float] = (380, 494 + SUMMARY_ROOM),
    sheet_music: str = "off",
    brief: Node | None = None,
    keep_seeds: bool = False,
) -> tuple[Node, Node, Node]:
    """Master (Stems, Audio HQ, EQ, Loudness) -> Preview + Export (the unmastered take as the original), and
    Cover Art - laid out above the render by ``cover_over`` once the template stands.

    ``export_size`` carries the owner's layout choice (2026-09-28): a taller export shows more report slots.
    ``sheet_music``: the YuE2 templates save the score's notation with the lyrics as ``<name>.pdf`` (owner's
    request 2026-10-08). ``brief`` goes into Export Release: its tags take the brief's fields as variables
    (owner's request 2026-10-15), shown by the *Tags & variables* note beside it; the tag fields and the brief
    socket make the export taller.
    """
    master = g.add_subgraph(blueprints["master"], (x, 0), size=MASTER_SIZE)
    preview_y = MASTER_SIZE[1] + 84
    preview = g.add("PreviewAudio", (x, preview_y), size=(340, 120), title="Preview (mastered)")
    all_reports = [
        *reports,
        # the stems are in the Master block since 2026-10-24: its two stem reports, where the STEMS block's were
        (master, "stems_report"),
        (master, "separation_report"),
        (master, "hq1_report"),
        (master, "hq2_report"),
        (master, "hq3_report"),
        (master, "eq_report"),
        (master, "loudness_report"),
    ]
    # + the three HQ report slots of the Master block (2026-10-21)
    # + Best Take's report slot (the lyrics fidelity, 2026-10-24)
    best = sum(1 for node, _output in reports if node.type == "PlenioBestTake")
    export_size = (export_size[0] + EXPORT_WIDER, export_size[1] + EXPORT_TALLER + (3 + best) * SLOT_HEIGHT)
    export = g.add(
        "PlenioExportRelease",
        (x + 400, 0),
        size=export_size,
        autogrow={"reports": len(all_reports)},
        widgets={**TEMPLATE_TAGS, **(export_widgets or {}), "sheet_music": sheet_music},
    )
    if brief is not None:
        g.link(brief, "brief", export, "brief")
        g.link(brief, "brief", master, "brief")  # the HQ presets on auto follow the genre
    tags_note(g, (x + 400 + export_size[0] + 40, 0))
    # on by default (owner's request 2026-10-23); the Cover Art switch at the top bypasses these three. Above
    # the finish for now: cover_over lays them out above the render
    cover = g.add_subgraph(blueprints["cover"], (x, -1200), size=(340, 170), title="Cover Art")
    cover_preview = g.add(
        "PreviewImage", (x + 400, -1200), size=(300, 300), title="Cover preview", properties=COVER_SWITCH
    )
    cover_seed_node = cover_seed(g, cover, (x, -960), keep=keep_seeds)
    cover.properties.update(COVER_SWITCH)
    cover_seed_node.properties.update(COVER_SWITCH)
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
    g.group("COVER ART", [cover, cover_seed_node, cover_preview], color=COVER_GROUP)
    return master, preview, export


MASTER_SIZE = (340, 260)
"""The Master block: three sockets, three switches (HQ mastering, stems, sample rate) and eight outputs."""
COLUMN_GAP = 60
COVER_AIR = 20
"""Between the cover's group and the row of sections, beyond the gap ``Graph.settle`` keeps."""


def cover_over(g: Graph, render: str) -> None:
    """Cover Art over the render section (owner's request 2026-10-24: up from under the finish, over the render,
    overlapping neither the render nor the finish). The template is settled first, so that the sections stand
    where they will; then the cover's block and its seed stand in the render section's first column with the
    preview beside them - or under them where the section is too narrow -, their group a gap above the row."""
    g.settle()
    left, top, right, _bottom = g.bounds(render)
    cover, seed, preview = g.members("COVER ART")
    x = left + GROUP_PADDING
    bottom = top - GROUP_GAP - GROUP_PADDING - COVER_AIR

    def stack(nodes: list[Node], low: float) -> None:
        """Bottom up: the last node's body ends at ``low``, each one above it a node gap higher."""
        for node in reversed(nodes):
            node.pos = (x, low - node.size[1])
            low = Graph.box(node)[1] - NODE_GAP

    if right - left - 2 * GROUP_PADDING >= cover.size[0] + COLUMN_GAP + preview.size[0]:
        stack([cover, seed], bottom)
        preview.pos = (x + cover.size[0] + COLUMN_GAP, cover.pos[1])
    else:
        stack([cover, seed, preview], bottom)
    g.refit("COVER ART")


EXPORT_WIDER = 60
EXPORT_TALLER = 10 * 24 + 24 + SLOT_HEIGHT
"""1.0.0: the nine tag fields of *tags* (with *lyrics*), *lyrics subtitles (SRT)* and the *brief* socket."""
TEMPLATE_COMMENT = "[Genre: {genre} · ][Mood: {mood} · ][Language: {language} · ]Powered by Plenio Music Production System / ComfyUI"
TEMPLATE_TAGS: dict[str, object] = {
    "tags": "tags",
    "tags.date": "{date}",
    "tags.genre": "{genre}",
    "tags.comment": TEMPLATE_COMMENT,
    "tags.lyrics": "{lyrics}",
}
"""The templates' tags (owner's request 2026-10-15): the brief's fields as variables, the lyrics as a tag."""


def _names(group: str) -> str:
    return " ".join(f"`{{{name}}}`" for name in variables.VARIABLES[group])


TAGS_NOTE = f"""## Tags & variables

**Export Release** writes these tags into the FLAC and MP3 files. Every tag field takes text with
**variables** - or connect any text output to it (drag a link onto the field), such as a field of the brief.

- `{{genre}}` - the value of a variable
- `[Mood: {{mood}} · ]` - shown only when every variable inside has a value
- `{{{{` and `}}}}` - literal braces

**Song:** {_names("song")}

**Brief:** {_names("brief")}

**Run:** {_names("run")}

**Models:** {_names("models")} · **Plenio:** {_names("plenio")}

**Tags:** {_names("tags")} (in the file name and the other tags)

Examples - comment: `Genre: {{genre}}[, mood: {{mood}}][, sung in {{language}}]`; album: `{{genre}} Sessions {{year}}`;
file name: `{{artist}} - {{title}}`. A name that is no variable stops the run when you press **Run**, before
anything renders.

**Subtitles:** *lyrics subtitles (SRT)* (on) writes `<name> (lines).srt` - whole lines - and
`<name> (notes).srt` - the lines painted on note by note - next to the song, timed by listening: Qwen3-ASR
hears the words and Qwen3-ForcedAligner times them (4.1 + 1.8 GB, fetched on first use; faster-whisper for a
language the aligner does not know).
"""
TAGS_NOTE_SIZE = (460, 760)


def tags_note(g: Graph, pos: tuple[float, float]) -> Node:
    return g.add_frontend(
        "MarkdownNote", pos, size=TAGS_NOTE_SIZE, title="Tags & variables", widgets=[TAGS_NOTE]
    )


FINISH_TEXT = (
    "**Finish:** *Plenio · Master* mixes the stems when you switch *stems* on, refines the take (*Audio HQ*, "
    "below) and brings it to -14 LUFS / -1 dBTP "
    "with a gentle tone match (open the block to change a stage, the EQ or the loudness target). Export writes the mastered FLAC 24-bit, the unmastered "
    "take as `(original).flac` and a release record to `output/plenio` - in the YuE2 templates also the "
    "**sheet music** with the lyrics as `<name>.pdf` (*sheet music* in Export: A4, Letter or off; *sheet music "
    "size*: standard about 3 bars a line, smaller, compact or large; this page draws it right after the export), "
    "and the lyrics as **subtitles** - `<name> (lines).srt` and `<name> (notes).srt`, timed by listening. The "
    "**tags** take the brief's fields as variables (`{genre}`, `{mood}` ...); the *Tags & variables* note "
    "beside Export lists them all."
)
COVER_TEXT = (
    "**Cover art (on):** *Cover Art* (the COVER ART group above the render) paints a cover from the sheet's "
    "artwork prompt with FLUX.2 Klein 4B (about "
    "16 GB of model files, Apache-2.0); Export embeds it in the FLAC and MP3 files and saves it as `.jpg`. The "
    "**Cover Art** card in *HQ Mastering & Cover Art* at the top switches it off - its three nodes are then "
    "bypassed and no image model loads."
)
STEMS_TEXT = (
    "**Stems (in the Master block, off):** switch *stems* on the *Plenio · Master* node on: *Separate Stems* "
    "splits the take into vocals, drums, bass and other, and the *Stem Mixer* - inside the block, open it with "
    "the icon at the top right of the node - balances them (gain, mute/solo, compression, reverb/delay sends, "
    "muted time ranges) and mixes the residual *rest* along, so a neutral mix returns the render unchanged. Off, "
    "the separation does not run. It needs the BS-RoFormer checkpoint (527 MB). The user guide *Stems* covers it."
)
HQ_TEXT = (
    "**HQ Mastering & Cover Art** (the two cards at the top - click one to switch it): **HQ Mastering** (**off** "
    "by default) runs the mastering at its highest quality - it can clearly reduce AI shimmer and artifacts, but "
    "the song takes **about twice as long** (UniverSR, 229 MB in `models/audio_sr`, needed only then); **Cover "
    "Art** (**on**) paints the song's cover.\n\n"
    "**Audio HQ (in the Master block, before the EQ):** *HQ 1 · Stereo Cleanup* calms the unsteady stereo shimmer "
    "in the render's highs (always); *HQ 2 · Regenerate Highs*, with HQ mastering on, lets the UniverSR model "
    "generate new highs above 8.2 kHz - in every preset - and blends them in at the original's level, about 1.5 s "
    "per second of music on an RTX 5060 Ti (its *model steps* 3: about 1.1 s); *HQ 3 · De-Reverb* (bypassed) dries "
    "the short metallic room "
    "but also dulls the highs. Their presets are on **auto**: the brief's genre picks *standard*, *gentle* "
    "(classical, jazz, folk), *strong* (rock, metal, punk) or *wide* (electronic, dance, ambient). Open the "
    "block (the icon at the top right of the node) to choose another preset or to bypass a stage (**Ctrl+B**). "
    "The user guide *Audio HQ* covers it."
)
FIDELITY_TEXT = (
    "**Lyrics fidelity** (the brief's last field): a music model does not always sing its lyrics - it leaves a "
    "line out, repeats one, sings other words. *standard* renders one take. *high - best of 2 takes* renders a "
    "second take (the next seed) when the first sang less than 96 % of the words as written, and **Best Take** "
    "keeps the one that sings more of the lyrics, as the lyrics ASR hears it; *highest - best of 3 takes* adds a "
    "third take when neither reached 96 %. A take of 96 % is close enough: the run goes on with it at once. "
    "Higher fidelity makes the generation take **longer** - up to about twice (high) or three times (highest). "
    "Best Take's summary and the release record say what each take sang and which one was kept."
)
CREATIVITY_TEXT = (
    "**Creativity** (the brief's slider): 0 steady, 50 the reference - exactly as before -, 100 experimental. It "
    "shapes the writer's rules and the temperature of its draft (and of a creative mode's plan) and, with YuE2, "
    "how freely the plan and the takes are sampled. More surprises also bring more misses: try a few seeds. A "
    "workflow saved before the slider keeps 50."
)
SEEDS_TEXT = (
    "**Seeds:** each seed node has one switch - **🔒 same seed**: the next run keeps that part (the same draft, "
    "the same take), so you can change other things; **🎲 new seed**: every run draws a new number - something "
    "new each time. The number shown is always the one the last run used: liked a take? Switch its seed to 🔒. "
    "Blue nodes keep, amber nodes renew. The seeds follow the brief's **mode**: *new song (cover) every run* "
    "starts with every seed on 🎲, *one song (cover), stop to review* with the song's seeds on 🔒 and the take "
    "seed on 🎲 - switching the mode switches them (a toast says so)."
)
APP_TEXT = (
    "**App mode:** switch *Graph / App* at the top left for a simple form: the mode, the brief with its creative "
    "mode, closeness and creativity, the writer model, the seeds, the Song Sheet buttons (review and edit, also in the app - "
    "their status line says where the run stands: *stops here for review*, *waiting for your approval*, "
    "*approved*) and the results. *Number of runs* next to Run renders a series."
)
WRITER_TEXT = (
    "**Writer model:** one list in the *Writer model* node - at the start, under the two cards - for every "
    "writing step (Write Song and Arrange): "
    "ComfyUI's text models (Gemma 4 E4B by default) and every local LLM - GGUF files in `models/LLM`, LM Studio, "
    "Ollama ... Only the chosen one is loaded. Local LLM answers are kept: the same request with the same seed "
    "is answered from Plenio's cache, without asking the model again."
)
CREATIVE_TEXT = (
    "**Creative modes (experimental):** *arrangement* in the brief. They can give unexpected results and are "
    "meant for experimenting - try a mode, listen, keep what you like. *off* (default, the dependable "
    "choice): no arrangement - {off}. A creative mode - from *standard*, *sterile* and *unplugged* over "
    "*call and response*, *signature motif*, *hypnotic* and *breakdown* to *jazz colours* and *fantasy* (the "
    "line under the brief says what the chosen one does), *key change* for one lift of the final chorus, or your own file in "
    "`user/plenio/arrangement` - adds its hints to the writing and lets the writer model plan every section of "
    "the score in **Arrange**: chords, what the instrument line plays, energy. {closeness} The writer answers with a small "
    "plan, never notes: Plenio writes every note itself and checks the result, so the score stays valid - a plan "
    "it cannot use leaves the score as it was, and Song Sheet · Score says so. A **harmony guard** keeps every "
    "chord in the key and the genre and on the melody, and the instrument line plays where the voice rests "
    "(*lines under the singing* in the brief lets it sound under the voice, calmly). **Arrangement seed:** another "
    "arrangement of the same song. Changing the mode or a slider writes the text again (the brief changed); a "
    "Local LLM answers from its cache when the request is the same."
)
CREATIVE_SONG_TEXT = CREATIVE_TEXT.format(
    off="YuE2 plans melody, chords and instruments by itself, as before",
    closeness="*genre closeness* sets how free it may be: 100 strictly typical, 70 typical with personal touches, "
    "40 free within the genre, 0 any style.",
)
CREATIVE_COVER_TEXT = CREATIVE_TEXT.format(
    off="the transcribed score stays as it is",
    closeness="*song flow closeness* sets how close it stays to the original: 100 exactly the original (no "
    "plan), 80 chords and key stay, 50 recognisable, 20 a free version, 0 only a hint - the form always "
    "remains, below 80 the melody follows the new chords. *lyrics closeness* (new lyrics) sets how close the new words stay to the source's: 0 without "
    "them (as before) up to 100, their meaning line by line.",
)
STATUS_TEXT = (
    "**Where the run stands:** a badge above each Plenio node shows its result - ✓ done, ⚠ warning, ✖ error; "
    "every Song Sheet that will stop carries ⏸ *review stop* before the run, ⏸ *waiting for your approval* "
    "(and an amber frame) when the run stopped there, ✓ *approved* once you approved it. A new run clears the "
    "badges, so they show how far this run got."
)
SONG_MODES_TEXT = """1. Choose the **mode** in **Song Brief**:
   - *new song every run* - every run writes and renders a **different song** from the brief, without stops (set the **Draft seed** to 🎲 *new seed* for even more variety). For a series, set the batch count next to **Run** (App mode: *Number of runs*) - one click, many songs.
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

{CREATIVITY_TEXT}

{FIDELITY_TEXT}

{SEEDS_TEXT}

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{HQ_TEXT}

{APP_TEXT}

**Models:** every file, its folder and the files for a smaller or larger graphics card are in the note *Models · what goes where* on the left; ComfyUI offers the downloads when you open the template. YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The model block below is collapsed; expand it to choose other files.
"""


def yue2_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    # the Song API runs it (owner's request 2026-10-25: party songs from the player; docs/design/party-songs.md)
    g.extra["plenio_api"] = {"id": "yue2-song", "kind": "song"}
    about_note(g, ABOUT_YUE2, height=1300)
    brief = g.add(
        "PlenioSongBrief",
        (0, COLUMN_ONE_Y),
        size=(
            BRIEF_WIDTH,
            690 + CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT + SUMMARY_ROOM,
        ),  # + field outputs
        widgets={
            "mode": "new song every run",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
            **template_widgets("pop/singer-songwriter-acoustic-vocal"),
        },
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, COLUMN_ONE_Y + 940), size=(380, 140), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(WRITER_WIDTH, 220))
    draft = draft_seed(g, write, (460, 280), keep=False)
    writer = writer_model(g, (0, WRITER_Y))
    text_sheet = song_sheet(g, (900, 0), "Song Sheet · Text")
    # the plan block's inputs take a row more since the creativity (owner's request 2026-10-19)
    plan = g.add_subgraph(bp["yue2_plan"], (1400, 0), size=(340, 250))
    plan_seed_node = plan_seed(g, plan, (1400, 310), keep=False)
    tools = g.add(
        "PlenioScoreTools",
        (1400, 560),
        size=(340, 120 + SUMMARY_ROOM),
        widgets={"operation": "prepare from brief"},
    )
    arrange_node = g.add_subgraph(bp["arrange"], (1400, 830), size=(WRITER_WIDTH, 260), title="Arrange")
    arrangement = arrangement_seed(g, arrange_node, (1400, 1140), keep=False)
    score_sheet = song_sheet(g, (1820, 0), "Song Sheet · Score", "score")
    seed = take_seed(g, (2320, 0))
    render = g.add_subgraph(bp["yue2_render"], (2320, 230), size=(320, 310))
    g.link(brief, "brief", write, "brief")
    g.link(brief, "song_seed", write, "song_seed")
    g.link(model_node, "engine", write, "engine")
    for kind in ("title", "style", "lyrics", "artwork_prompt"):
        g.link(write, kind, text_sheet, kind)
    g.link(brief, "brief", text_sheet, "brief")
    g.link(model_node, "engine", text_sheet, "engine")
    g.link(model_node, "CLIP", plan, "clip")
    g.link(brief, "song_seed", plan, "song_seed")
    g.link(brief, "creativity", plan, "creativity")
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
    g.link(plan, "form_report", score_sheet, "song_form")
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
    g.link(brief, "creativity", render, "creativity")
    best = best_take(
        g, (2320, 600), take=(render, "AUDIO"), render=render, lyrics=(text_sheet, "lyrics"), brief=brief
    )
    # Only the sheets' reports (and the master's): they hold the final documents, and wiring draft reports
    # here would force the writer and the planner to run even when the user replaced their documents manually.
    master_block, preview, export = finish(
        g,
        bp,
        2720,
        audio=(best, "audio"),
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[(text_sheet, "report"), (score_sheet, "report"), (best, "report")],
        group="6 · FINISH",
        sheet_music="PDF (A4)",
        brief=brief,
    )
    switch = hq_switch(g, master_block)
    g.group("1 · SONG", [switch, writer, brief])
    g.group("2 · WRITE", [write, draft])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · SCORE", [plan, plan_seed_node, tools, arrange_node, arrangement, score_sheet])
    g.group("5 · RENDER", [seed, render, best])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    make_room(g, brief, CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT)
    g.align()
    cover_over(g, "5 · RENDER")
    yue2_loras(g, model_node)
    return g, song_app(
        brief,
        seed,
        draft,
        [text_sheet, score_sheet],
        preview,
        export,
        [(plan_seed_node, name) for name in SEED_CONTROLS],
        writer=writer,
        arrangement=arrangement,
        hq_mastering=switch,
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
    hq_mastering: Node | None = None,
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
    controls += [
        "vocals.language",
        "vocals.voice",
        "vocals.theme",
        "vocals.lyrics_from",
        "vocals.lyrics",
        "arrangement",
        "genre_closeness",
        "creativity",
        "lyrics_fidelity",
    ]
    inputs = [(brief, name) for name in controls]
    # right after the template: the first choices of a run, as in group 1 of the graph (owner's request
    # 2026-10-24: the writer model at the start, after the switches)
    inputs[2:2] = [*([(hq_mastering, "hq_mastering")] if hq_mastering is not None else []), (writer, "model")]
    inputs += [(node, name) for node in (seed, draft) for name in SEED_CONTROLS]
    if arrangement is not None:
        inputs += [(arrangement, name) for name in SEED_CONTROLS]
    inputs += extra or []
    return App(inputs + [(sheet, "sheet_state") for sheet in sheets], [preview, export])


ABOUT_COVER = f"""# 2 · YuE2 · Cover

**Source -> Transcribe Score -> Arrange -> Song Sheet · Score -> lyrics (ASR, writer or section tags) -> Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Master -> Export**

1. Load the **source** recording (upload in *Load Audio*; up to 5:00 - trim longer songs with the optional *Excerpt* node).
2. In **Cover Brief** choose the **mode** - *new cover every run* (default): every run writes and renders a **different version** (title, style and - with new lyrics - the lyrics) without stops, so a queue of covers runs through; the batch count next to **Run** makes a series. Or *one cover, stop to review* (steps 4-6) to check the transcription and the lyrics first. Then the target style and what happens to the vocals: *original lyrics* (default; transcribed from the source), *instrumental* (an instrument plays the melody, or accompaniment only) or *new lyrics* (written on the source's melody). *harmony* keeps or replaces the original chords.
3. Press **Run**: SheetSage2 transcribes the source (once; later runs reuse it). With *new cover every run* the run goes on to the export.
4. With *one cover, stop to review* the run **stops at Song Sheet · Score**. Open it, check the score (fix section names and boundaries), then *Approve*.
5. Run again: the lyrics are drafted (ASR of the original, the writer's new lyrics, or the section tags) and the run **stops at Song Sheet · Text**. Correct or replace the lyrics - your text always wins - and *Approve*.
6. Run again to render. Each further run is a new take (the take seed changes).

**Original lyrics** are what *Transcribe Lyrics* hears in the source (Qwen3-ASR), placed into the score's sections. It hears the recording and the vocal stem *Sung Pitch* separates, and keeps the hearing it is more confident of - the stem only where it hears better (a separation also leaves artefacts that get misheard). **Fix Misheard Words** then has the writer model read them, with the words the ASR was unsure of marked, and correct the words it is sure were misheard - each with a word that sounds alike, fits the line and has as many syllables. Song Sheet · Text lists every correction beside the word heard; your text always wins. Only original lyrics are checked: new lyrics, an instrumental and lyrics you write yourself are never changed.

**New lyrics** are understood only when they fit the melody - about one syllable per note - and the voice fits its range; Song Sheet · Text warns about both.

{CREATIVE_COVER_TEXT}

{WRITER_TEXT}

{STATUS_TEXT}

{CREATIVITY_TEXT}

{FIDELITY_TEXT}

{SEEDS_TEXT}

**Takes:** *YuE2 Takes* renders *takes* versions (seeds take seed, +1, ...); **Check Vocals** keeps the first instrumental take without vocal notes, the preview plays all takes. N takes cost N renders. **Instrumental adapter:** for instrumental covers YuE2 renders with the instrumental LoRA of the *Instrumental adapter* node (the optional adapter inside the model block stays bypassed here). **Check sung lyrics** (optional, bypassed) measures what a sung take actually sang.

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{HQ_TEXT}

**App mode:** switch *Graph / App* at the top left for a simple form: the source file, the mode, the cover style, the creative mode with both closeness sliders, the creativity, the writer model, the seeds, the two Song Sheet buttons (the review stops work in the app; their status line says where the run stands) and the results. The other options of *original lyrics* and *new lyrics* are set in the graph.

**Models:** every file, its folder and the files for a smaller or larger graphics card are in the note *Models · what goes where* on the left; ComfyUI offers the downloads when you open the template. The lyrics ASR (Qwen3-ASR 1.7B with Qwen3-ForcedAligner 0.6B, 4.1 + 1.8 GB; faster-whisper large-v3, 3.1 GB, only for a language the aligner does not know) is fetched by Plenio when first needed. YuE2, SheetSage2 and the adapter are **CC BY-NC 4.0 (non-commercial)**.
"""


def yue2_cover(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    # the Song API runs it (owner's request 2026-10-25: party covers from the player)
    g.extra["plenio_api"] = {"id": "yue2-cover", "kind": "cover"}
    about_note(g, ABOUT_COVER, height=1440)
    # group 1: the switches, the writer model, the source; the brief beside it in group 2 (owner's request
    # 2026-10-24: every section at the top of one row - before, 2 · COVER stood under 1 · SOURCE)
    source = g.add("LoadAudio", (0, COLUMN_ONE_Y), size=(360, 140), title="Source recording")
    excerpt = g.add(
        "TrimAudioDuration",
        (0, COLUMN_ONE_Y + 230),
        size=(360, 110),
        mode=4,
        title="Excerpt (optional)",
        widgets={"start_index": 0.0, "duration": 120.0},
    )
    brief = g.add(
        "PlenioCoverBrief",
        (COVER_BRIEF_X, 0),
        size=(
            BRIEF_WIDTH,
            640 + CREATIVITY_ROW + COVER_FIELD_ROWS * SLOT_HEIGHT + SUMMARY_ROOM,
        ),  # + field outputs
        # the owner's defaults since 0.4.3: a pop style template (genre and mood come from it), the
        # original lyrics in the language detected from the singing, the original chords
        widgets={
            "mode": "new cover every run",
            "template": "pop/dance-pop-vocal",
            "vocals": "original lyrics",
            "vocals.language": "",
            "harmony": "keep original chords",
            **template_widgets("pop/dance-pop-vocal", "original lyrics"),
        },
    )
    # the music model under the row of sections
    model_node = g.add_subgraph(bp["yue2_model"], (0, 1700), size=(380, 140), collapsed=True)
    adapter = g.add(
        "LoraLoader",
        # YuE2 LoRAs above it (yue2_loras): the instrumental adapter acts on top of them
        (0, 1780 + LORAS_SIZE[1] + 40),
        size=(380, 130),
        title="Instrumental adapter",
        widgets={"lora_name": LORA, "strength_model": 0.0, "strength_clip": 1.0},
        properties=model(LORA),
    )
    # under the adapter, in the first column: right of it, the wider brief's room pushed it across the group's
    # edge (make_room moves what is right of the old brief column, not the group)
    adapter_switch = g.add(
        "ComfySwitchNode",
        (0, 1970 + LORAS_SIZE[1] + 40),
        size=(260, 90),
        title="Adapter for instrumental covers",
    )
    # the sections right of the brief: as before, the brief's column wider by COVER_BRIEF_X
    dx = COVER_BRIEF_X
    transcribe = g.add_subgraph(bp["transcribe"], (460 + dx, 0), size=(340, 160))
    tools = g.add(
        "PlenioScoreTools",
        (460 + dx, 220),
        size=(340, 120 + SUMMARY_ROOM),
        widgets={"operation": "prepare from brief"},
    )
    score_sheet = song_sheet(g, (880 + dx, 0), "Song Sheet · Score", "score")
    arrange_node = g.add_subgraph(bp["arrange"], (460 + dx, 650), size=(WRITER_WIDTH, 260), title="Arrange")
    arrangement = arrangement_seed(g, arrange_node, (460 + dx, 960), keep=False)
    # Original lyrics: the Cover Brief owns the source's language; new lyrics: this widget does (AUD-02).
    asr = g.add(
        "PlenioTranscribeLyrics",
        (1380 + dx, 0),
        size=(340, 200 + SUMMARY_ROOM),
        title="Transcribe Lyrics",
        labels={"language": "source language (original lyrics: Cover Brief)"},
    )
    write = g.add_subgraph(bp["write"], (1380 + dx, 360), size=(WRITER_WIDTH, 260))
    draft = draft_seed(g, write, (1380 + dx, 680), keep=False)
    writer = writer_model(g, (0, WRITER_Y))
    # misheard words in the original lyrics, before the render (owner's rule 2026-10-24); its writer is asked
    # only for original lyrics - the switch after it does not even ask for its output otherwise
    heard = g.add_subgraph(
        bp["heard_check"], (1380 + dx, 960), size=(WRITER_WIDTH, 170), title="Fix Misheard Words"
    )
    source_switch = g.add("ComfySwitchNode", (1800 + dx, 0), size=(260, 90), title="Original or new lyrics")
    tags_switch = g.add(
        "ComfySwitchNode", (1800 + dx, 165), size=(260, 90), title="Instrumental: section tags"
    )
    text_sheet = song_sheet(g, (2135 + dx, 0), "Song Sheet · Text")
    seed = take_seed(g, (2620 + dx, 0))
    render = g.add_subgraph(bp["yue2_takes"], (2620 + dx, 230), size=(320, 330), title="YuE2 Takes")
    check_vocals = g.add(
        "PlenioVocalCheck", (3000 + dx, 0), size=(340, 120 + SUMMARY_ROOM), title="Check Vocals · best take"
    )
    takes_preview = g.add("PreviewAudio", (3000 + dx, 280), size=(340, 120), title="Preview (all takes)")
    # in the render section, under the takes (2026-10-24: the sections reach the same bottom, so its own group
    # under them would have overlapped)
    check_lyrics = g.add(
        "PlenioTranscribeLyrics",
        (3000 + dx, 480),
        size=(340, 200 + SUMMARY_ROOM),
        mode=4,
        title="Check sung lyrics (optional)",
    )

    g.link(source, "AUDIO", excerpt, "audio")
    # the cover is named after the recording (owner's request 2026-10-08)
    g.link(source, "AUDIO", brief, "source")
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
    g.link(asr, "lyrics", heard, "lyrics")
    g.link(asr, "report", heard, "report")
    g.link(brief, "brief", heard, "brief")
    g.link(asr, "language", heard, "language")
    g.link(writer, "model", heard, "model")
    g.link(brief, "use_source_lyrics", source_switch, "switch")
    g.link(heard, "lyrics", source_switch, "on_true")
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
    g.link(brief, "creativity", render, "creativity")
    g.link(render, "takes", check_vocals, "audio")
    g.link(transcribe, "AUDIO_ENCODER", check_vocals, "audio_encoder")
    g.link(brief, "brief", check_vocals, "brief")
    g.link(check_vocals, "takes", takes_preview, "audio")
    best = best_take(
        g,
        (2620 + dx, 620),
        take=(check_vocals, "audio"),
        render=render,
        lyrics=(text_sheet, "lyrics"),
        brief=brief,
    )
    g.link(best, "audio", check_lyrics, "audio")
    g.link(text_sheet, "lyrics", check_lyrics, "expected_lyrics")
    master_block, preview, export = finish(
        g,
        bp,
        3880 + dx,
        audio=(best, "audio"),
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[
            (score_sheet, "report"),
            (text_sheet, "report"),
            (transcribe, "report"),
            (check_vocals, "report"),
            (check_lyrics, "report"),
            (heard, "report"),
            (best, "report"),
        ],
        group="7 · FINISH",
        sheet_music="PDF (A4)",
        export_size=(380, 584 + SUMMARY_ROOM),
        brief=brief,
    )
    # Sung Pitch (0.4.4): the source's vocals as a pitch curve for both sheets' editors, once per source;
    # the text sheet plays the source too, so the words can be checked against the singing
    sung_pitch = g.add(
        "PlenioSungPitch",
        (460 + dx, 480),
        size=(WRITER_WIDTH, 106),
        title="Sung Pitch (for the editor)",
        widgets={"separation": SEPARATION_MODEL},
        properties=model(SEPARATION_MODEL),
    )
    g.link(excerpt, "AUDIO", text_sheet, "reference_audio")
    g.link(excerpt, "AUDIO", sung_pitch, "audio")
    g.link(sung_pitch, "sung_pitch", score_sheet, "sung_pitch")
    g.link(sung_pitch, "sung_pitch", text_sheet, "sung_pitch")
    # the original lyrics are heard in the mix and in the vocal stem; the more confident hearing is kept
    g.link(sung_pitch, "vocals", asr, "vocals")
    switch = hq_switch(g, master_block)
    g.group("1 · SOURCE", [switch, writer, source, excerpt])
    g.group("2 · COVER", [brief])
    g.group("3 · SCORE", [transcribe, tools, score_sheet, sung_pitch, arrange_node, arrangement])
    g.group("4 · LYRICS", [asr, heard, write, draft, source_switch, tags_switch])
    g.group("5 · TEXT", [text_sheet])
    g.group("6 · RENDER", [seed, render, best, check_vocals, takes_preview, check_lyrics])
    g.group("MUSIC MODEL", [model_node, adapter, adapter_switch], color=MODEL_GROUP)
    make_room(g, brief, CREATIVITY_ROW + COVER_FIELD_ROWS * SLOT_HEIGHT)
    g.align()
    cover_over(g, "6 · RENDER")
    yue2_loras(g, model_node)
    # The options of the default vocals (original lyrics) only, as in song_app; the two review stops use
    # the sheets' editor buttons.
    controls = ["mode", "template", "description", "genre", "mood", "vocals"]
    controls += ["vocals.language", "vocals.voice", "harmony", "arrangement", "song_flow_closeness"]
    controls += ["lyrics_closeness", "creativity", "lyrics_fidelity", "original_notes"]
    inputs = [
        (source, "audio"),
        (switch, "hq_mastering"),
        (writer, "model"),
        *[(brief, name) for name in controls],
    ]
    inputs += [(node, name) for node in (seed, draft, arrangement) for name in SEED_CONTROLS]
    inputs += [(score_sheet, "sheet_state"), (text_sheet, "sheet_state")]
    return g, App(inputs, [takes_preview, preview, export])


ABOUT_MINIMAX = f"""# 3 · MiniMax · Song

**Brief -> Write Song -> Song Sheet -> MiniMax Render -> Master (Audio HQ, EQ, loudness) -> Export**

{SONG_MODES_TEXT.format(sheets="")}
3. Press **Run**. The writer model drafts title, a structured **caption** (Global Metadata, Vocal Details, Arrangement), lyrics and an artwork prompt; MiniMax Music 3 renders the song.

{STATUS_TEXT}

{CREATIVITY_TEXT}

{FIDELITY_TEXT}

{SEEDS_TEXT}

**Inspect and edit:** open the **Song Sheet** to see exactly what MiniMax receives; its *review* follows the brief's mode (*as the brief says*). Caption and lyrics together must stay under **5 000 tokens** (the sheet counts them exactly with the loaded text encoder and stops before rendering if they do not fit). The render ceiling follows the brief's length, at most 6:00; the model can end earlier.

**Instrumentals:** the lyrics are a map of section tags ([Intro], [Instrumental], [Solo], ...), about twice as long as a sung song's, and the caption's Vocal Details are *n/a*.

**Creative modes:** *arrangement* in the brief adds the mode's hints to the caption (for example *many instruments*: a large ensemble) and, with *genre closeness*, says how typical it stays. MiniMax Music 3 has no score, so there is no section plan here; *off* writes as before.

{WRITER_TEXT}

{FINISH_TEXT}

{HQ_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{APP_TEXT}

**Models:** every file, its folder and the files for a smaller or larger graphics card are in the note *Models · what goes where* on the left; ComfyUI offers the downloads when you open the template. MiniMax Music 3 weights: **MiniMax-Music3 Community License**. If decoding runs out of memory, turn on *tiled decode* in MiniMax Render.
"""


def minimax_song(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_MINIMAX, height=1080)
    brief = g.add(
        "PlenioSongBrief",
        (0, COLUMN_ONE_Y),
        size=(
            BRIEF_WIDTH,
            690 + CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT + SUMMARY_ROOM,
        ),  # + field outputs
        widgets={
            "mode": "new song every run",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
            **template_widgets("pop/singer-songwriter-acoustic-vocal"),
        },
    )
    model_node = g.add_subgraph(bp["minimax_model"], (0, COLUMN_ONE_Y + 940), size=(380, 160), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(WRITER_WIDTH, 220))
    draft = draft_seed(g, write, (460, 280), keep=False)
    writer = writer_model(g, (0, WRITER_Y))
    sheet = song_sheet(g, (900, 0), "Song Sheet")
    seed = take_seed(g, (1400, 0))
    render = g.add_subgraph(bp["minimax_render"], (1400, 230), size=(320, 250))
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
    best = best_take(
        g, (1400, 540), take=(render, "AUDIO"), render=render, lyrics=(sheet, "lyrics"), brief=brief
    )
    # the band-limited MiniMax highs are regenerated by HQ 2 inside the Master block (2026-10-21; until then
    # a REFINE block with UniverSR ran here)
    master_block, preview, export = finish(
        g,
        bp,
        1800,
        audio=(best, "audio"),
        title=(sheet, "title"),
        artwork=(sheet, "artwork_prompt"),
        reports=[(sheet, "report"), (best, "report")],
        group="5 · FINISH",
        brief=brief,
    )
    switch = hq_switch(g, master_block)
    g.group("1 · SONG", [switch, writer, brief])
    g.group("2 · WRITE", [write, draft])
    g.group("3 · SHEET", [sheet])
    g.group("4 · RENDER", [seed, render, best])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    make_room(g, brief, CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT)
    g.align()
    cover_over(g, "4 · RENDER")
    return g, song_app(brief, seed, draft, [sheet], preview, export, writer=writer, hq_mastering=switch)


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

**Creative modes:** *arrangement* in the brief adds the mode's hints to the writing (the style); the score is yours, so nothing is planned here. *off* writes as before.

{WRITER_TEXT}

{STATUS_TEXT}

{CREATIVITY_TEXT}

{FIDELITY_TEXT}

{SEEDS_TEXT}

{FINISH_TEXT}

{COVER_TEXT}

{STEMS_TEXT}

{HQ_TEXT}

**App mode:** the mode, the brief (with key and meter - the empty score follows them), the writer model, the seeds, both Song Sheet buttons with their status line and the results - the app is usable for a first run, but the score is drawn in the graph's sheet editor.

**Models:** every file, its folder and the files for a smaller or larger graphics card are in the note *Models · what goes where* on the left; ComfyUI offers the downloads when you open the template. YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The model block below is collapsed; expand it to choose other files.
"""


def yue2_daw(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    g = Graph()
    about_note(g, ABOUT_DAW, height=1300)
    brief = g.add(
        "PlenioSongBrief",
        (0, COLUMN_ONE_Y),
        size=(
            BRIEF_WIDTH,
            690 + CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT + SUMMARY_ROOM,
        ),  # + field outputs
        widgets={
            "mode": "one song, stop to review",
            "template": "pop/singer-songwriter-acoustic-vocal",
            "length": "short (about 1:30)",
            "vocals": "sung",
            **template_widgets("pop/singer-songwriter-acoustic-vocal"),
        },
    )
    model_node = g.add_subgraph(bp["yue2_model"], (0, COLUMN_ONE_Y + 940), size=(380, 140), collapsed=True)
    write = g.add_subgraph(bp["write"], (460, 0), size=(WRITER_WIDTH, 220))
    draft = draft_seed(g, write, (460, 280), keep=True)
    writer = writer_model(g, (0, WRITER_Y))
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
        size=SHEET_SIZE,
        title="Song Sheet · DAW",
        widgets={"review": "stop for review"},
        labels={"sheet_state": "Song Sheet · DAW"},
        properties={"plenio_editor_layout": "daw"},
    )
    score_sheet.color, score_sheet.bgcolor = SHEET_LOOKS["daw"]
    seed = take_seed(g, (2320, 0))
    render = g.add_subgraph(bp["yue2_render"], (2320, 230), size=(320, 310))
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
    g.link(brief, "creativity", render, "creativity")
    best = best_take(
        g, (2320, 600), take=(render, "AUDIO"), render=render, lyrics=(text_sheet, "lyrics"), brief=brief
    )
    master_block, preview, export = finish(
        g,
        bp,
        2720,
        audio=(best, "audio"),
        title=(text_sheet, "title"),
        artwork=(text_sheet, "artwork_prompt"),
        reports=[(text_sheet, "report"), (score_sheet, "report")],
        group="6 · FINISH",
        sheet_music="PDF (A4)",
        export_size=(385, 554 + SUMMARY_ROOM),
        keep_seeds=True,
        brief=brief,
    )
    switch = hq_switch(g, master_block)
    g.group("1 · SONG", [switch, writer, brief])
    g.group("2 · WRITE", [write, draft])
    g.group("3 · TEXT", [text_sheet])
    g.group("4 · DAW", [tools, score_sheet])
    g.group("5 · RENDER", [seed, render, best])
    g.group("MUSIC MODEL", [model_node], color=MODEL_GROUP)
    make_room(g, brief, CREATIVITY_ROW + LYRICS_ROOM + SONG_FIELD_ROWS * SLOT_HEIGHT)
    g.align()
    cover_over(g, "5 · RENDER")
    yue2_loras(g, model_node)
    return g, song_app(
        brief, seed, draft, [text_sheet, score_sheet], preview, export, writer=writer, hq_mastering=switch
    )


ABOUT_ENHANCE = """# 4 · Enhance & Master

**Load Audio -> Stems (optional) -> Audio HQ 1-3 -> EQ -> Loudness & Dynamics -> Export**, the lyrics to correct in *Lyrics (optional)*

Finishes an existing recording (for example a take you rendered earlier) without any music model - with every
stage of the song templates' *Plenio · Master* block, as plain nodes you can reach directly.

1. Upload the file in **Load Audio**.
2. **Audio HQ** runs before the EQ: *HQ 1 · Stereo Cleanup* calms the unsteady stereo shimmer in the highs; with **HQ mastering** on (the switch at the top, **on** by default) *HQ 2 · Regenerate Highs* generates new highs above 8.2 kHz with the UniverSR model (229 MB; about 1.5 s per second of music on an RTX 5060 Ti) - it can clearly reduce AI shimmer and artifacts, and it is the cure for a **band-limited** source such as an old MP3; switched off, UniverSR does not run and is not needed. *HQ 3 · De-Reverb* is bypassed (select it, **Ctrl+B**). There is no brief here, so the presets are *standard*; pick *gentle* (classical, jazz, folk), *strong* (rock, metal, punk) or *wide* (electronic, dance, ambient) for your music (the user guide *Audio HQ* covers them).
3. To rebalance a finished mix, select *Stems (optional)* (under Load Audio) and press **Ctrl+B**: *Separate Stems* splits the file into vocals, drums, bass and other, the *Stem Mixer* balances them (the residual *rest* keeps a neutral mix exact; the user guide *Stems* covers it). It is bypassed by default.
4. **EQ** starts with a gentle warm tone match (*match preset*). Choose *manual* to draw your own curve, *flat* for no EQ, or connect a **reference** recording and pick a reference recipe.
5. **Loudness & Dynamics** brings the song to -14 LUFS with a true peak of at most -1 dBTP (streaming); pick another target or compression style if you like.
6. **The lyrics** of a sung recording go into the subtitles, the lyrics tag and the release record as the ASR hears them - misheard words included. To correct them, select the two nodes of *Lyrics (optional)* (under the source) and press **Ctrl+B**: *Transcribe Lyrics* hears the words and the *Song Sheet* stops the run - open its editor, fix the words, **Approve** and **Run** again. Export then times your words to the singing. You can also type the lyrics into the Song Sheet yourself; then nothing is transcribed. Bypassed by default.
7. Press **Run**. Export writes FLAC 24-bit and MP3 V0 to `output/plenio/enhanced`, copies the source file's tags and cover, keeps the unmastered source as `(original).flac`, and writes a release record with the measured loudness.

The preview plays the result; compare it with the source in Load Audio. After a run, a badge above each Plenio node shows its result (✓ done, ⚠ warning, ✖ error).

**App mode:** switch *Graph / App* at the top left for a simple form (file, HQ presets, EQ, target, compression).
"""


LYRICS_Y = 1160
"""Enhance & Master: the optional lyrics under the source and Audio HQ, below their row."""


def enhance_master(bp: dict[str, Blueprint]) -> tuple[Graph, App]:
    """Plain nodes (the EQ curve and the HQ presets stay at hand): Audio HQ 1-3 before the EQ, like the Master
    block. No brief here, so the HQ presets are *standard* (auto would say so and take standard too)."""
    g = Graph()
    about_note(g, ABOUT_ENHANCE, height=760)
    # group 1: the HQ switch, the source and the optional stems under it (2026-10-24: every section at the top
    # of one row, of one height)
    source = g.add("LoadAudio", (0, 250), size=(340, 140), title="Source")
    audio, stems_node = stems_stage(g, bp, 0, audio=(source, "AUDIO"), y=500)
    standard = hq.PRESET_LABELS[hq.STANDARD]
    hq_size = (380, 120 + SUMMARY_ROOM)
    stereo = g.add("PlenioHQStereoCleanup", (420, 0), size=hq_size, widgets={"preset": standard})
    loader = g.add(
        "PlenioAudioModelLoader",
        (420, 290),
        size=(340, 110),
        collapsed=True,
        title="Super-resolution model (HQ mastering)",
        widgets={"kind": "super-resolution", "kind.model": SR_MODEL},
        properties=model(SR_MODEL),
    )
    highs = g.add(
        "PlenioHQRegenerateHighs", (420, 360), size=(380, 200 + SUMMARY_ROOM), widgets={"preset": standard}
    )
    dereverb = g.add(
        "PlenioHQDeReverb",
        (420, 700),
        size=hq_size,
        title="HQ 3 · De-Reverb (optional)",
        widgets={"preset": standard},
        mode=4,
    )
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
        # 1.0.0: the brief socket and lyrics subtitles (SRT); 2026-10-21: two more report slots (Audio HQ);
        # 1.2.1: what the lyrics are heard on; 1.3.2: the lyrics' Song Sheet; the song page (HTML)
        size=(380, 538 + SUMMARY_ROOM + 3 * SLOT_HEIGHT),
        autogrow={"reports": 8},
        widgets={
            "folder": "plenio/enhanced",
            "naming": "{title}",
            "mp3": True,
            "tags": "copy from loaded file",
        },
    )
    g.link(audio[0], audio[1], stereo, "audio")
    g.link(stereo, "audio", highs, "audio")
    g.link(loader, "model", highs, "model")
    g.link(highs, "audio", dereverb, "audio")
    g.link(dereverb, "audio", eq, "audio")
    g.link(eq, "audio", loudness, "audio")
    g.link(loudness, "audio", preview, "audio")
    g.link(loudness, "audio", export, "audio")
    g.link(source, "AUDIO", export, "original")
    # the lyrics as the ASR heard them, corrected before the release (GitHub issue, 1.3.1: misheard words went
    # into the subtitles and the record with no way to fix them) - bypassed like the stems: an instrumental
    # recording has no words, and a sung one runs through without a stop until it is switched on
    hear = g.add(
        "PlenioTranscribeLyrics",
        (0, LYRICS_Y),
        size=(340, 200 + SUMMARY_ROOM),
        title="Transcribe Lyrics (optional)",
        mode=4,
    )
    lyrics_sheet = g.add(
        "PlenioSongSheet",
        (420, LYRICS_Y),
        size=SHEET_SIZE,
        title="Song Sheet · Lyrics (optional)",
        widgets={"review": "stop for review"},
        labels={"sheet_state": "Song Sheet · Lyrics"},
        mode=4,
    )
    lyrics_sheet.color, lyrics_sheet.bgcolor = SHEET_LOOKS["text"]
    g.link(source, "AUDIO", hear, "audio")
    g.link(hear, "lyrics", lyrics_sheet, "lyrics")
    reports = [
        (stems_node, "report"),
        (stems_node, "separation_report"),
        (stereo, "report"),
        (highs, "report"),
        (dereverb, "report"),
        (eq, "report"),
        (loudness, "report"),
        (lyrics_sheet, "report"),
    ]
    for index, (node, output) in enumerate(reports):
        g.link(node, output, export, f"reports.report_{index}")
    switch = hq_switch(g, highs, "hq_mastering", on=True)
    g.group("1 · SOURCE", [switch, source, stems_node])
    g.group("2 · AUDIO HQ (before the EQ)", [stereo, loader, highs, dereverb])
    g.group("3 · MASTER", [eq, loudness])
    g.group("4 · FINISH", [preview, export])
    g.align()
    g.group("Lyrics (optional)", [hear, lyrics_sheet], color=SHEET_LOOKS["text"][0])
    app = App(
        [
            (source, "audio"),
            (switch, "hq_mastering"),
            (stereo, "preset"),
            (highs, "preset"),
            (eq, "mode"),
            (loudness, "target"),
            (loudness, "compression"),
        ],
        [preview, export],
    )
    return g, app


ABOUT_SYSTEM = """# 0 · System Check

Press **Run**. The node lists:

- ComfyUI, frontend and Plenio versions, Python and torch
- GPUs, VRAM and system RAM
- which model files of each template are installed, what is still missing, and the folder each one goes into (with its download link)
- the Plenio assets - the lyrics ASR Qwen3-ASR, its aligner and the Whisper fallback - with the folder Plenio keeps them in and whether they are there
- optional Python packages
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
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")


def _target_tooltip(item: BlueprintInput) -> str:
    """The tooltip of the node input a blueprint input feeds (the first target's, from the snapshot)."""
    target, name = item.targets[0]
    info = SNAPSHOT["nodes"].get(target.type, {})
    for section in ("required", "optional"):
        entry = (info.get("input") or {}).get(section, {}).get(name)
        if entry is not None and len(entry) > 1 and isinstance(entry[1], dict):
            return str(entry[1].get("tooltip") or "")
    return ""


def locale(bp: dict[str, Blueprint]) -> dict[str, Any]:
    """``locales/en/nodeDefs.json``: the tooltips of the blueprints' inputs and outputs, keyed by the
    blueprint's id (the type of its wrapper node), and of the native widgets the templates show that ComfyUI
    ships without one. ComfyUI's frontend reads these for the wrapper nodes, which have no node definition
    of their own (input names: dots become underscores, as the frontend's i18n keys)."""
    defs: dict[str, Any] = {}
    for blueprint in bp.values():
        inputs = {}
        for item in blueprint.inputs:
            tooltip = item.tooltip or _target_tooltip(item)
            if not tooltip:
                raise ValueError(f"{blueprint.name}: the input {item.name!r} has no tooltip")
            inputs[item.name.replace(".", "_")] = {"tooltip": tooltip}
        outputs = {}
        for index, out in enumerate(blueprint.outputs):
            if not out.tooltip:
                raise ValueError(f"{blueprint.name}: the output {out.name!r} has no tooltip")
            outputs[str(index)] = {"tooltip": out.tooltip}
        defs[blueprint.id] = {"inputs": inputs, "outputs": outputs}
    for node_type, tips in NATIVE_TOOLTIPS.items():
        defs[node_type] = {"inputs": {name: {"tooltip": text} for name, text in tips.items()}}
    return defs


def blueprints() -> dict[str, Blueprint]:
    return {
        "yue2_model": yue2_model(),
        "write": write_song(),
        "arrange": arrange(),
        "heard_check": check_heard(),
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
    # every template's Models note, made last (the other node ids stay as they were)
    for graph, name in (
        (check, "0 · System Check"),
        (song, "1 · YuE2 · Song"),
        (cover, "2 · YuE2 · Cover"),
        (minimax, "3 · MiniMax · Song"),
        (enhance, "4 · Enhance & Master"),
        (daw, "5 · YuE2 · DAW"),
    ):
        models_note(graph, name)
    # Refine is in no template since Audio HQ (2026-10-21): its blueprint ships in subgraphs/ for the node
    # library only; the song templates' stems are inside Master since 2026-10-24 (the Stems block: Enhance)
    finish_bps = [bp["master"], bp["cover"]]
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
            [
                bp["yue2_model"],
                bp["write"],
                bp["transcribe"],
                bp["arrange"],
                bp["heard_check"],
                bp["yue2_takes"],
                *finish_bps,
            ],
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
    write_json(PROJECT / "locales" / "en" / "nodeDefs.json", locale(bp))
    print(f"wrote {len(bp)} blueprints, {len(shipped)} templates and their tooltips")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
