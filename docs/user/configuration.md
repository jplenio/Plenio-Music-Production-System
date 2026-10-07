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
| `PLENIO_LLAMA_SERVER` | a program or its folder | the llama.cpp server that runs GGUF files for **Local LLM** (default: found on the PATH, in Unsloth Studio, winget or Homebrew) |
| `PLENIO_LLM_OTHER_APPS` | `1` (default) / `0` | **Local LLM** also lists the model folders and running servers of other apps |

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

[llm]                                  # Local LLM
llama_server = "D:/tools/llama.cpp"    # the llama-server program or its folder
other_apps = true                      # LM Studio, Hugging Face cache, Ollama ...

[llm.folders]                          # more GGUF folders: label = folder
"My GGUFs" = "E:/gguf"

[llm.servers]                          # more OpenAI-compatible servers: label = API base
"Workstation" = "http://192.168.1.20:1234/v1"
```

Labels appear in the Local LLM list (`My GGUFs · model.gguf`, `Workstation · model-id`); they must not contain ` · `. Plenio stores no API keys; see [Local LLMs](concepts/local-llm.md).

## Files Plenio keeps in the ComfyUI user directory

| Folder | What |
|---|---|
| `plenio/templates/` | your brief templates ([Brief templates](concepts/brief-templates.md)) |
| `plenio/arrangement/` | your creative modes, one Markdown file each ([Creative modes](concepts/creative-modes.md)) |
| `plenio/cache/llm/` | Local LLM answers: the same request with the same seed is answered from here without a call (delete the folder to forget them, or turn *reuse answers* off in the node) |
| `plenio/cache/asr/`, `plenio/cache/asr-notes/` | lyrics transcriptions and the editor's notes about them |

Unknown keys are reported as errors so that typos do not go unnoticed.

## Model files

ComfyUI-format model weights (YuE2, SheetSage2, MiniMax, text models) are handled by ComfyUI: the templates declare the files, and ComfyUI offers to download missing ones. Plenio-owned assets (for example ASR models used by a worker) are pinned to an exact revision and downloaded only when a node needs them, under the policy above.
