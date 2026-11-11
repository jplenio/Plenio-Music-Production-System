# Models and downloads

Plenio ships no model weights. The model blocks of the templates (*Plenio · YuE2 Model*, *Plenio · MiniMax Model*, *Plenio · Cover Art*) have one field per model, set to **auto**: when the workflow runs, a **Model Choice** node takes the file of the catalogue below that suits the computer that runs it - the best one that runs on its graphics card, or an installed one that is nearly as good - and its summary says which and why. A file that is not there stops the run with its name, its folder and its address; download it into the folder below. The **0 · System Check** template lists which files of each template are installed on your machine. A workflow saved with 1.x keeps the files its loaders name, and ComfyUI's *missing models* dialog still offers the other files (the separation, super-resolution and SheetSage models, the instrumental adapter of 2 · YuE2 · Cover).

The list below is the model catalogue Plenio's templates are built from (`resources/models.toml`). Sizes are those of the public files (decimal GB, as download dialogs show them).

## Files per template

### 1 · YuE2 · Song

| File | Folder (`ComfyUI/models/...`) | Size | Licence | |
|---|---|---|---|---|
| `yue2_3b_int8_convrot.safetensors` | `checkpoints` | 4.0 GB | CC BY-NC 4.0 | needed |
| Gemma 4 12B, a GGUF ([the writer](#the-writer-gemma-4-12b)) | `LLM` | 9.8 or 6.7 GB | Apache-2.0 | needed: one already on your computer, else fetched by Plenio for your graphics card |
| `ar_lora_inst_v3abc_comfyui.safetensors` | `loras` | (see the model card) | CC BY-NC 4.0 | optional: instrumental adapter inside the model block, bypassed |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | Cover Art (on; the *Cover Art* card switches it off) |

### 2 · YuE2 · Cover

| File | Folder | Size | Licence | |
|---|---|---|---|---|
| `yue2_3b_int8_convrot.safetensors` | `checkpoints` | 4.0 GB | CC BY-NC 4.0 | needed |
| `sheetsage2_bf16.safetensors` | `audio_encoders` | 1.4 GB | CC BY-NC 4.0 | needed (score transcription, Check Vocals) |
| `ar_lora_inst_v3abc_comfyui.safetensors` | `loras` | (see the model card) | CC BY-NC 4.0 | needed (instrumental adapter) |
| Gemma 4 12B, a GGUF ([the writer](#the-writer-gemma-4-12b)) | `LLM` | 9.8 or 6.7 GB | Apache-2.0 | needed: one already on your computer, else fetched by Plenio for your graphics card |
| Qwen3-ASR 1.7B and Qwen3-ForcedAligner 0.6B (Plenio assets, below) | `plenio/asr/qwen3-asr-1.7b-hf`, `plenio/asr/qwen3-forcedaligner-0.6b-hf` | 4.1 + 1.8 GB | Apache-2.0 | fetched by Plenio when *original lyrics*, *Check sung lyrics* or the subtitles first need them |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | Cover Art (on; the *Cover Art* card switches it off) |

### 3 · MiniMax · Song

| File | Folder | Size | Licence | |
|---|---|---|---|---|
| `minimax_music3_dit_fp16.safetensors` | `diffusion_models` | 4.9 GB | MiniMax-Music3 Community License | needed |
| `minimax_music3_text_encoder_pruned_int8_convrot.safetensors` | `text_encoders` | 9.2 GB | MiniMax-Music3 Community License | needed |
| `minimax_music3_dav.safetensors` | `vae` | 217 MB | MiniMax-Music3 Community License | needed |
| Gemma 4 12B, a GGUF ([the writer](#the-writer-gemma-4-12b)) | `LLM` | 9.8 or 6.7 GB | Apache-2.0 | needed: one already on your computer, else fetched by Plenio for your graphics card |
| `pytorch_model.bin` (UniverSR) | `audio_sr` | 229 MB | CC BY 4.0 (weights); MIT (code) | **optional**: HQ 2 · Regenerate Highs, with the HQ Mastering switch on |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | Cover Art (on; the *Cover Art* card switches it off) |

### Audio HQ 2 (UniverSR), in the Master block of templates 1-5

| File | Folder | Size | Licence |
|---|---|---|---|
| `pytorch_model.bin` (UniverSR audio) | `audio_sr` | 229 MB | CC BY 4.0 (weights), MIT (inference code; vendored in `plenio/third_party/universr`) |

**Needed for HQ mastering** (the switch at the top of every template: off by default in the song templates, **on** in 4 · Enhance & Master since 2026-10-24): with it on, [HQ 2 · Regenerate Highs](concepts/audio-hq.md) runs in the Master block (in 4 · Enhance & Master as a plain node); switched off, the model is not loaded and the file is not needed. ComfyUI offers the download when a template opens. The one file serves every template, and the *Refine (48 kHz)* node of the library uses it too (its *resample only* engine needs no model at all).

### Stems (BS-RoFormer), the optional block of templates 1-5

| File | Folder | Size | Licence |
|---|---|---|---|
| `model_bs_roformer_ep_17_sdr_9.6568.ckpt` | `audio_separation` | 527 MB | MIT (training code; vendored inference code in `plenio/third_party/msst`); the checkpoint was trained on MUSDB18-HQ, whose dataset terms are research-oriented |

*Separate Stems* and *Stem Mixer* run only when you turn them on: the *stems* switch of the Master block in the song templates (off), the bypassed *Stems (optional)* block in 4 · Enhance & Master. *2 · YuE2 · Cover* also uses the file for **Sung Pitch** (the source's vocal line in the score editor); without it the cover runs as before and the editor says that there is no sung pitch. Place the file in `ComfyUI/models/audio_separation` (create the folder if needed) - or in an `audio_separation` folder beside the model folders of your `extra_model_paths.yaml` (see [Existing model folders](#existing-model-folders)); the checkpoint is a plain `.ckpt` with its config inside, so no second file is required. Without it the template runs exactly as before.

The block is **experimental** until its listening check (L2) is accepted: the separation itself is measured (MUSDB18-HQ SDR 9.66 reported by the authors), but how the stems are used here is not.

### Cover Art (templates 1, 2, 3 and 5: on, the *Cover Art* card switches it off)

| File | Folder | Size | Licence |
|---|---|---|---|
| `flux-2-klein-4b.safetensors` | `diffusion_models` | 7.8 GB | Apache-2.0 |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | Apache-2.0 |
| `flux2-vae.safetensors` | `vae` | 336 MB | Apache-2.0 |

The block stays bypassed until you turn it on, so a template runs without these files.

### 0 · System Check and 4 · Enhance & Master (the other files)

0 · System Check needs no model file. 4 · Enhance & Master needs only the UniverSR file of HQ 2 (above) for HQ mastering, which is on by default (switched off, none at all), and the optional Stems block (bypassed) for material you upload.

## Download sources

| File | Source |
|---|---|
| YuE2, SheetSage2 | [Comfy-Org/YuE2](https://huggingface.co/Comfy-Org/YuE2) |
| instrumental adapter | [Mothersuperior/YuE2-instrumental-cot-full-loras](https://huggingface.co/Mothersuperior/YuE2-instrumental-cot-full-loras) (pinned revision in the template) |
| writer (Gemma 4 12B, GGUF) | [unsloth/gemma-4-12b-it-GGUF](https://huggingface.co/unsloth/gemma-4-12b-it-GGUF), [unsloth/gemma-4-12B-it-qat-GGUF](https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF) (pinned revisions) |
| lighter writer (Gemma 4 E4B, ComfyUI's text model) | [Comfy-Org/gemma-4](https://huggingface.co/Comfy-Org/gemma-4) |
| MiniMax Music 3 | [Comfy-Org/MiniMax-Music-3](https://huggingface.co/Comfy-Org/MiniMax-Music-3) |
| UniverSR audio (HQ 2, Refine) | [woongzip1/universr-audio](https://huggingface.co/woongzip1/universr-audio) - released as `pytorch_model.bin` (CC BY 4.0; the inference code is MIT and vendored) |
| BS-RoFormer 4-stem (Stems) | [ZFTurbo/Music-Source-Separation-Training](https://github.com/ZFTurbo/Music-Source-Separation-Training) release v1.0.12 - `model_bs_roformer_ep_17_sdr_9.6568.ckpt` (MIT training code; the inference code is MIT and vendored) |
| FLUX.2 Klein 4B, its text encoder | [Comfy-Org/flux2-klein](https://huggingface.co/Comfy-Org/flux2-klein) |
| FLUX.2 VAE | [Comfy-Org/flux2-dev](https://huggingface.co/Comfy-Org/flux2-dev) |
| Qwen3-ASR 1.7B, Qwen3-ForcedAligner 0.6B | [Qwen/Qwen3-ASR-1.7B-hf](https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf), [Qwen/Qwen3-ForcedAligner-0.6B-hf](https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B-hf) (pinned revisions; the inference code is Apache-2.0 and vendored from transformers 5.17) |
| faster-whisper large-v3 | [Systran/faster-whisper-large-v3](https://huggingface.co/Systran/faster-whisper-large-v3) (pinned revision) |

The exact URLs are in `resources/models.toml`; a missing file's message names its URL too.

## Smaller GPUs: alternative files

The tables above name each model's default file. With a model field on **auto** the plan may take one of these alternatives instead, by the card's memory; to use one regardless, choose it in the field (or pin it in `config.toml`, [Configuration](configuration.md)). The System Check's hardware table shows what auto takes on each card and marks your row:

| Instead of | Choose | Size | For | Basis |
|---|---|---|---|---|
| `minimax_music3_dit_fp16` | `minimax_music3_dit_int8_convrot.safetensors` | 2.5 GB | 8-16 GB | legacy toolkit rating |
| `flux-2-klein-4b` | `flux-2-klein-4b-fp8.safetensors` ([black-forest-labs/FLUX.2-klein-4b-fp8](https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8)) | 4.1 GB | 8-16 GB | legacy toolkit rating |
| `qwen_3_4b` | `qwen_3_4b_fp4_flux2.safetensors` | 3.8 GB | 8-16 GB | legacy toolkit rating |
| `yue2_3b_int8_convrot` | `yue2_3b_bf16.safetensors` | 7.8 GB | 24 GB and more | Plenio design (int8 stays the faster default) |

"Legacy toolkit rating" means the rating Plenio's predecessor gave these files; Plenio has not measured them itself. The YuE2 int8 checkpoint is measured on a 16 GB card (RTX 5060 Ti).

## YuE2 finetunes

The **checkpoint** field of the *Plenio · YuE2 Model* block takes any YuE2 file in `models/checkpoints`. A finetune replaces the whole model, so it goes there - no node needs to be added or rewired inside the block. What a file can do depends on its format, not on its name:

| Format | How to tell | In Plenio |
|---|---|---|
| **ComfyUI's format**: one file with the music model, the text side with its tokenizer and the audio decoder | Comfy-Org's `yue2_3b_*` files; the `comfyui/` folder of [goldhub/YuE2-RS-Finetunes](https://huggingface.co/goldhub/YuE2-RS-Finetunes/tree/main/comfyui) (`..._int8_convrot` 4.0 GB for smaller cards, `..._bf16` 7.8 GB) | loads: choose it under **checkpoint** |
| **m-a-p's Transformers layout**: the music model alone | the `...-BF16.safetensors` files at the top of that repository, `model.safetensors` in [goldhub/YuE2-3B-Ruach_Studio-IRA-Merge](https://huggingface.co/goldhub/YuE2-3B-Ruach_Studio-IRA-Merge) | does not load (ComfyUI: *Could not detect model type*); needs a conversion to ComfyUI's format |
| **GGUF** | `...-Q6_K.gguf`, `...-Q8_0.gguf`, `...-BF16.gguf` | does not load: these are for [yue2.cpp](https://github.com/ServeurpersoCom/yue2.cpp) and Ruach Studio. ComfyUI's YuE2 has no GGUF path, and the Local LLM node runs text models, not music models |
| **LoRA**: a small adapter on top of a model | a repository's adapter files, in `models/loras` | not a checkpoint: use the [YuE2 LoRAs](concepts/loras.md) node |

1. Download the file and put it into `ComfyUI/models/checkpoints` (or the checkpoints folder of your `extra_model_paths.yaml`).
2. Press **R** in ComfyUI to refresh the lists.
3. In the **MUSIC MODEL** group choose it under **checkpoint** instead of *auto*. The templates show the block open since 1.5.1; in a workflow saved before, expand it first (the dot at its top left). The choice is saved with the workflow.

The music model, the text side, the audio decoder and the Engine Profile then all come from that one file, and the Engine Profile reads the tokenizer the file brings. **0 · System Check** says for every YuE2 file in the folder whether it loads and, if not, why.

**Adapters on a finetune:** a LoRA or the instrumental adapter was trained on the weights it was made for, and may sound different - or worse - on a finetune; the finetune's own card says more (the RS-FW card advises training an adapter on the weights it will sing on). A merge that already holds an adapter must not get it a second time.

**Licences** are per model - read the card: the RS-FW finetunes are CC BY-NC-SA 4.0, the IRA merges CC BY-NC 4.0, both non-commercial. **Quality:** Plenio tests the choice and the loading with its own files; it has not measured how a finetune sounds.

## The writer: Gemma 4 12B

The templates' **Writer model** is *Gemma 4 12B (auto)*: the model that writes title, style, lyrics, arrangement plan and cover-art prompt. It takes, in this order:

1. **A Gemma 4 12B of a running app** (LM Studio, Ollama ...): it is loaded already, so it costs no load time.
2. **A Gemma 4 12B GGUF already on your computer**, in `models/LLM`, a folder of Plenio's config, LM Studio's models or the Hugging Face cache - any of them is used rather than downloading another. The file named like the one for your card comes first, else the largest that fits your card, else the smallest. Without one, **the file for your graphics card** is downloaded once into `models/LLM` the first time a song is written (pinned revision, size and SHA-256; a broken download resumes):

| VRAM | File | Size |
|---|---|---|
| 20 GB and more | [`gemma-4-12b-it-Q6_K.gguf`](https://huggingface.co/unsloth/gemma-4-12b-it-GGUF) | 9.8 GB |
| less (a 16 GB card too), or no GPU | [`gemma-4-12B-it-qat-UD-Q4_K_XL.gguf`](https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF) (trained for 4-bit, so it keeps more of the model than a plain Q4) | 6.7 GB |

On a 16 GB card the Q6_K and the writer's context fill the card: measured, it wrote 2.4 times slower than the QAT Q4 and ComfyUI's own 12B ([the report](../test-reports/2026-11-11-writer-native-12b.md)). A GGUF already on your computer is used only when it leaves 7.5 GB of the card free.

Both are Apache-2.0. On a card too small for the file, llama.cpp keeps the rest in RAM: it writes, more slowly. `PLENIO_OFFLINE=1` or `PLENIO_AUTO_DOWNLOAD=0` turn the download off; the run then names the file to place. **0 · System Check** says what the writer takes on your computer and marks the row of your card.

**A GGUF runs on llama.cpp**, which ComfyUI does not bring: `winget install llama.cpp` (Windows), `brew install llama.cpp` (macOS), your distribution's package or `pip install llama-cpp-python` into ComfyUI's Python. Without it nothing is downloaded that could not run, and the next steps write:

3. **ComfyUI's own Gemma 4 12B**, `gemma4_12b_int8_convrot` (12.1 GB), in `models/text_encoders` - on a card with enough memory, and a ComfyUI that knows the 12B (0.41.0 and later).
4. **ComfyUI's lighter Gemma 4**: `gemma4_e4b_it_fp8_scaled` (9.1 GB), or `gemma4_e2b_it_int8_convrot` (5.2 GB) on small cards.

ComfyUI's Gemma 4 files come from [Comfy-Org/gemma-4](https://huggingface.co/Comfy-Org/gemma-4) (Apache-2.0) and write without llama.cpp. Steps 3 and 4 are chosen like every model file: the one for your card, an installed one kept rather than a run stopped, a pin in `config.toml` (`[models.pins] writer-native = "..."`) first. Any other Gemma 4 text model in `models/text_encoders` writes too. If none is there, the run stops and names the file for your card and its address. On a 16 GB card the native 12B and a GGUF of the 12B wrote equally fast (about 10 s a song after the first, measured in ComfyUI 0.41.0); the native 12B is taken from 13 GB of graphics memory and the E4B from 10 GB (measured), the E2B below (an estimate) - [the report](../test-reports/2026-11-11-writer-native-12b.md). *Writer model*'s summary says which step wrote and why.

**Other writers:** *Writer model* lists every model - ComfyUI's lighter [`gemma4_e4b_it_fp8_scaled.safetensors`](https://huggingface.co/Comfy-Org/gemma-4/resolve/main/text_encoders/gemma4_e4b_it_fp8_scaled.safetensors) (9.1 GB, into `models/text_encoders`, no llama.cpp needed), any other GGUF, and the models of a running LM Studio, Ollama, llama.cpp ... - see [Local LLMs](concepts/local-llm.md). A workflow saved before keeps the writer it was saved with.

## Plenio assets

Some models are not ComfyUI model files but run in a separate Plenio worker ([the writer's GGUF](#the-writer-gemma-4-12b) goes the same way, into `models/LLM`). Plenio fetches them itself, pinned to an exact revision, when a node first needs them - **0 · System Check** lists them with their folder and whether they are there:

| Asset | Used by | Size | Where |
|---|---|---|---|
| Qwen3-ASR 1.7B | the lyrics ASR: *Transcribe Lyrics* (covers with the original lyrics, *Check sung lyrics*) and the lyrics subtitles of *Export Release* (every song template) | 4.1 GB | `ComfyUI/models/plenio/asr/qwen3-asr-1.7b-hf` |
| Qwen3-ForcedAligner 0.6B | the word times of the lyrics ASR (with Qwen3-ASR) | 1.8 GB | `ComfyUI/models/plenio/asr/qwen3-forcedaligner-0.6b-hf` |
| faster-whisper large-v3 | the lyrics ASR for a language the aligner cannot time (Dutch, Swedish, Polish, Turkish ...), and *Transcribe Lyrics* set to it; needs the optional `faster-whisper` package | 3.1 GB | `ComfyUI/models/plenio/asr/faster-whisper-large-v3` |

Qwen3-ASR runs on ComfyUI's own `transformers` (5.5 or newer): Plenio ships the model's inference code (from transformers 5.17, Apache-2.0) and installs nothing.

- `PLENIO_OFFLINE=1` or `PLENIO_AUTO_DOWNLOAD=0` turn this off; the node then names the files to place.
- An existing copy elsewhere: point `[asset_paths]` in the Plenio `config.toml` at it (see [Configuration](configuration.md)).

## Existing model folders

If your models live outside `ComfyUI/models`, add the folders to ComfyUI's `extra_model_paths.yaml` (the standard ComfyUI way). Plenio's templates and the System Check find files there too.

ComfyUI searches a folder of such a location only when the file names it - one line per folder, such as `checkpoints: checkpoints`. Plenio's own folders need no line: **`audio_separation`**, **`audio_sr`** and **`LLM`** are also searched beside every model folder ComfyUI knows. With

```yaml
shared:
  base_path: D:/AI/models
  checkpoints: checkpoints
  text_encoders: text_encoders
```

the stem model can lie in `D:/AI/models/audio_separation` (a folder made while ComfyUI runs counts after pressing R). ComfyUI's own folders keep ComfyUI's rule: `audio_encoders` (SheetSage2), `diffusion_models`, `vae` ... need their line. When a model file the templates load lies in such a folder without its line, the **System Check** names the file and the folder, and says which line to add.

## Licences

The licences above apply to the weights and, for the non-commercial ones, to what you make with them. See [Licensing](licensing.md).
