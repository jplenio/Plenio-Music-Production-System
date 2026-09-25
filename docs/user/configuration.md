# Configuration

Plenio has very few settings. Everything else is chosen in the workflow.

## Environment variables

| Variable | Values | Effect |
|---|---|---|
| `PLENIO_OFFLINE` | `1` / `0` | never access the network; missing assets produce an error that names the folder and files to place |
| `HF_HUB_OFFLINE` | `1` | Hugging Face's own offline switch; also puts Plenio offline (it cannot be undone with `PLENIO_OFFLINE=0`) |
| `PLENIO_AUTO_DOWNLOAD` | `1` (default) / `0` | fetch missing Plenio assets when a node that needs them runs; `0` gives an error with manual steps instead |
| `PLENIO_ASSET_DIR` | a folder | where Plenio assets are stored (default: `models/plenio`) |
| `PLENIO_WORKER_TIMEOUT` | seconds | how long an out-of-process worker may run in total (default 3600) |
| `PLENIO_WORKER_IDLE_TIMEOUT` | seconds | how long a worker may run without reporting progress (default 300) |

Invalid values stop with an error message instead of being ignored.

## Config file

The same settings can be written to `<ComfyUI user directory>/plenio/config.toml`; environment variables win.

```toml
offline = false
auto_download = true
asset_dir = "D:/models/plenio"

[workers]
timeout_seconds = 3600
idle_timeout_seconds = 300
```

Unknown keys are reported as errors so that typos do not go unnoticed.

## Model files

ComfyUI-format model weights (YuE2, SheetSage2, MiniMax, text models) are handled by ComfyUI: the templates declare the files, and ComfyUI offers to download missing ones. Plenio-owned assets (for example ASR models used by a worker) are pinned to an exact revision and downloaded only when a node needs them, under the policy above.
