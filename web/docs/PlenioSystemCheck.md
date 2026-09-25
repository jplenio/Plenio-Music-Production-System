# System Check

Shows whether this ComfyUI installation is ready for Plenio.

## What it reports

- ComfyUI, frontend, Python, torch and Plenio versions (Plenio supports ComfyUI 0.37.0 and newer)
- GPUs with total and free VRAM, system RAM, the device ComfyUI uses for native models
- optional Python packages and whether they are installed
- the download policy: offline mode (`PLENIO_OFFLINE`, `HF_HUB_OFFLINE`) and automatic asset downloads (`PLENIO_AUTO_DOWNLOAD`)
- hardware recommendations as a transparent rule table

## Inputs

- **detail** - `summary` shows the readable overview; `full` adds the raw facts as JSON (useful for bug reports).

## Output

- **report** - a Plenio report that can be passed to *Export Release* or inspected.

Recommendations are text only. The System Check never changes a setting, never loads or downloads a model and never switches a model on its own.
