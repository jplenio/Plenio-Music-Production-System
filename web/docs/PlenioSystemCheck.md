# System Check

Shows whether this ComfyUI installation is ready for Plenio.

## What it reports

- ComfyUI, frontend, Python, torch and Plenio versions (Plenio supports ComfyUI 0.37.0 and newer)
- GPUs with total and free VRAM, system RAM, the device ComfyUI uses for native models
- **templates**: for each template whether its model files are installed, what is missing and how large it is; optional blocks (Cover Art, the adapter) are listed separately
- **model files**: every file the templates load - linked to its download - with the folder it goes into (`models/<folder>` inside ComfyUI's models folder, which the check names), size, licence, the templates that use it and its status (*installed*, *missing*, *size differs*), found in ComfyUI's model folders including `extra_model_paths.yaml`; a missing file that lies in a folder ComfyUI does not search (beside the other model folders, without its line in `extra_model_paths.yaml`) is named with a warning and the line to add
- **Plenio assets**: the lyrics ASR - Qwen3-ASR, Qwen3-ForcedAligner and the faster-whisper fallback - each with the folder Plenio keeps it in, size, licence, what it is for, a link to its pinned source, and whether it is installed (otherwise Plenio fetches it on first use)
- Python packages (a missing `av`, `PIL` or `scipy` is a warning; `transformers` - ComfyUI's own - is what Qwen3-ASR runs on; `faster-whisper` is optional, for the Whisper fallback)
- the download policy: offline mode (`PLENIO_OFFLINE`, `HF_HUB_OFFLINE`) and automatic asset downloads (`PLENIO_AUTO_DOWNLOAD`)
- the **hardware table** (VRAM of the largest GPU -> the files the model fields on *auto* take for YuE2, MiniMax Music 3, Cover Art and the writer), made from the model catalogue, with the row for this machine marked and whether its memory figures are measured or estimated

## Inputs

- **detail** - `summary` shows the readable overview; `full` adds the raw facts as JSON (useful for bug reports).

## Output

- **report** - a Plenio report that can be passed to *Export Release* or inspected.

Recommendations are text only. The System Check never changes a setting, never loads or downloads a model and never switches a model on its own.
