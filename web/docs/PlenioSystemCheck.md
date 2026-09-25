# System Check

Shows whether this ComfyUI installation is ready for Plenio.

## What it reports

- ComfyUI, frontend, Python, torch and Plenio versions (Plenio supports ComfyUI 0.37.0 and newer)
- GPUs with total and free VRAM, system RAM, the device ComfyUI uses for native models
- **templates**: for each template whether its model files are installed, what is missing and how large it is; optional blocks (Cover Art, the adapter) are listed separately
- **model files**: every file the templates load, with folder, size, licence and status (*installed*, *missing*, *size differs*), found in ComfyUI's model folders including `extra_model_paths.yaml`
- Python packages (a missing `av`, `PIL` or `scipy` is a warning; `mutagen` is optional) and Plenio assets (the lyrics ASR: installed or fetched on first use)
- the download policy: offline mode (`PLENIO_OFFLINE`, `HF_HUB_OFFLINE`) and automatic asset downloads (`PLENIO_AUTO_DOWNLOAD`)
- the **hardware rule table** (VRAM of the largest GPU -> which files to choose for YuE2, MiniMax Music 3 and Cover Art), with the row for this machine marked and the basis of every row (measured, legacy toolkit rating, or design)

## Inputs

- **detail** - `summary` shows the readable overview; `full` adds the raw facts as JSON (useful for bug reports).

## Output

- **report** - a Plenio report that can be passed to *Export Release* or inspected.

Recommendations are text only. The System Check never changes a setting, never loads or downloads a model and never switches a model on its own.
