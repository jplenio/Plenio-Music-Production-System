# Models and downloads

Plenio ships no model weights. Each template's loader nodes name the files they need, and **ComfyUI** offers to download missing ones when you open the template (the *missing models* dialog). You can also download them yourself and put them into the folders below. The **0 · System Check** template lists which files of each template are installed on your machine.

The list below is the model catalogue Plenio's templates are built from (`resources/models.toml`). Sizes are those of the public files (decimal GB, as download dialogs show them).

## Files per template

### 1 · YuE2 · Song

| File | Folder (`ComfyUI/models/...`) | Size | Licence | |
|---|---|---|---|---|
| `yue2_3b_int8_convrot.safetensors` | `checkpoints` | 4.0 GB | CC BY-NC 4.0 | needed |
| `gemma4_e4b_it_fp8_scaled.safetensors` | `text_encoders` | (see the model card) | Apache-2.0 | needed (writer) |
| `ar_lora_inst_v3abc_comfyui.safetensors` | `loras` | (see the model card) | CC BY-NC 4.0 | optional: instrumental adapter inside the model block, bypassed |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | optional: Cover Art, bypassed |

### 2 · YuE2 · Cover

| File | Folder | Size | Licence | |
|---|---|---|---|---|
| `yue2_3b_int8_convrot.safetensors` | `checkpoints` | 4.0 GB | CC BY-NC 4.0 | needed |
| `sheetsage2_bf16.safetensors` | `audio_encoders` | 1.4 GB | CC BY-NC 4.0 | needed (score transcription, Check Vocals) |
| `ar_lora_inst_v3abc_comfyui.safetensors` | `loras` | (see the model card) | CC BY-NC 4.0 | needed (instrumental adapter) |
| `gemma4_e4b_it_fp8_scaled.safetensors` | `text_encoders` | (see the model card) | Apache-2.0 | needed (writer) |
| faster-whisper large-v3 (Plenio asset, below) | `plenio/asr/faster-whisper-large-v3` | 3.1 GB | MIT | fetched by Plenio when *original lyrics* first need it |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | optional: Cover Art, bypassed |

### 3 · MiniMax · Song

| File | Folder | Size | Licence | |
|---|---|---|---|---|
| `minimax_music3_dit_fp16.safetensors` | `diffusion_models` | 4.9 GB | MiniMax-Music3 Community License | needed |
| `minimax_music3_text_encoder_pruned_int8_convrot.safetensors` | `text_encoders` | 9.2 GB | MiniMax-Music3 Community License | needed |
| `minimax_music3_dav.safetensors` | `vae` | 217 MB | MiniMax-Music3 Community License | needed |
| `gemma4_e4b_it_fp8_scaled.safetensors` | `text_encoders` | (see the model card) | Apache-2.0 | needed (writer) |
| FLUX.2 Klein files (below) | | 16.1 GB | Apache-2.0 | optional: Cover Art, bypassed |

### Cover Art (optional block of templates 1-3)

| File | Folder | Size | Licence |
|---|---|---|---|
| `flux-2-klein-4b.safetensors` | `diffusion_models` | 7.8 GB | Apache-2.0 |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | Apache-2.0 |
| `flux2-vae.safetensors` | `vae` | 336 MB | Apache-2.0 |

The block stays bypassed until you turn it on, so a template runs without these files.

### 0 · System Check and 4 · Enhance & Master

No model files.

## Download sources

| File | Source |
|---|---|
| YuE2, SheetSage2 | [Comfy-Org/YuE2](https://huggingface.co/Comfy-Org/YuE2) |
| instrumental adapter | [Mothersuperior/YuE2-instrumental-cot-full-loras](https://huggingface.co/Mothersuperior/YuE2-instrumental-cot-full-loras) (pinned revision in the template) |
| writer | [Comfy-Org/gemma-4](https://huggingface.co/Comfy-Org/gemma-4) |
| MiniMax Music 3 | [Comfy-Org/MiniMax-Music-3](https://huggingface.co/Comfy-Org/MiniMax-Music-3) |
| FLUX.2 Klein 4B, its text encoder | [Comfy-Org/flux2-klein](https://huggingface.co/Comfy-Org/flux2-klein) |
| FLUX.2 VAE | [Comfy-Org/flux2-dev](https://huggingface.co/Comfy-Org/flux2-dev) |
| faster-whisper large-v3 | [Systran/faster-whisper-large-v3](https://huggingface.co/Systran/faster-whisper-large-v3) (pinned revision) |

The exact URLs are in `resources/models.toml` (the templates' loaders carry the same entries for ComfyUI's download dialog).

## Smaller GPUs: alternative files

The templates default to the files above. The System Check marks the row of its hardware rule table that matches your GPU; for smaller cards it suggests these alternatives (choose them in the loader nodes - nothing is switched automatically):

| Instead of | Choose | Size | For | Basis |
|---|---|---|---|---|
| `minimax_music3_dit_fp16` | `minimax_music3_dit_int8_convrot.safetensors` | 2.5 GB | 8-16 GB | legacy toolkit rating |
| `flux-2-klein-4b` | `flux-2-klein-4b-fp8.safetensors` ([black-forest-labs/FLUX.2-klein-4b-fp8](https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8)) | 4.1 GB | 8-16 GB | legacy toolkit rating |
| `qwen_3_4b` | `qwen_3_4b_fp4_flux2.safetensors` | 3.8 GB | 8-16 GB | legacy toolkit rating |
| `yue2_3b_int8_convrot` | `yue2_3b_bf16.safetensors` | 7.8 GB | 24 GB and more | Plenio design (int8 stays the faster default) |

"Legacy toolkit rating" means the rating Plenio's predecessor gave these files; Plenio has not measured them itself. The YuE2 int8 checkpoint with the Gemma 4 E4B writer is measured on a 16 GB card (RTX 5060 Ti).

## Plenio assets

Some models are not ComfyUI model files but run in a separate Plenio worker. Plenio fetches them itself, pinned to an exact revision, when a node first needs them:

| Asset | Used by | Size | Where |
|---|---|---|---|
| faster-whisper large-v3 | *Transcribe Lyrics* (covers with the original lyrics, *Check sung lyrics*) | 3.1 GB | `ComfyUI/models/plenio/asr/faster-whisper-large-v3` |

- `PLENIO_OFFLINE=1` or `PLENIO_AUTO_DOWNLOAD=0` turn this off; the node then names the files to place.
- An existing copy elsewhere: point `[asset_paths]` in the Plenio `config.toml` at it (see [Configuration](configuration.md)).

## Existing model folders

If your models live outside `ComfyUI/models`, add the folders to ComfyUI's `extra_model_paths.yaml` (the standard ComfyUI way). Plenio's templates and the System Check find files there too.

## Licences

The licences above apply to the weights and, for the non-commercial ones, to what you make with them. See [Licensing](licensing.md).
