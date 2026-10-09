# Security and privacy

Plenio runs inside ComfyUI on your own machine. This page lists everything it does beyond computing inside ComfyUI's process: what it downloads, which programs it starts, which addresses it talks to and which files it writes.

## Network

- **One download, on first use.** The lyrics ASR model (faster-whisper large-v3, 3 GB, MIT licence) is fetched from Hugging Face when *Transcribe Lyrics* first needs it - from a revision pinned to a full commit hash, with the sizes and the SHA-256 of the weights checked (`resources/assets.toml`, `plenio/core/assets/fetch.py`). `PLENIO_OFFLINE=1` (or `HF_HUB_OFFLINE=1`) turns this off; point `[asset_paths]` in Plenio's `config.toml` at a copy you already have.
- **Model weights** in the templates are offered by ComfyUI's own missing-model dialog, not downloaded by Plenio.
- **Local LLM** talks only to language-model apps on your machine: their default local addresses (`127.0.0.1`: LM Studio, Ollama - which honours `OLLAMA_HOST` -, llama.cpp, vLLM, Jan, KoboldCpp, text-generation-webui, GPT4All, Unsloth Studio), the llama.cpp server it starts itself on a free local port, and the servers you add in `[llm.servers]`. A system proxy is bypassed for these requests. `[llm] other_apps = false` (or `PLENIO_LLM_OTHER_APPS=0`) keeps it to ComfyUI's own `models/LLM` folder. API keys are read from environment variables, never stored.
- No telemetry, no cloud service, no account.

## Programs Plenio starts

- **The lyrics ASR worker** - `python -m plenio.workers.asr` with ComfyUI's own Python, in a separate process so its memory is freed afterwards (`plenio/core/workers/protocol.py`: a fixed command line, no shell). On Windows it adds the CUDA library folders of the installed packages to its own `PATH`, so CTranslate2 finds cuBLAS and cuDNN.
- **A llama.cpp server** for a GGUF file chosen in *Local LLM* - the `llama-server` you installed (or `PLENIO_LLAMA_SERVER`), or llama-cpp-python through `python -m plenio.workers.llama_http` - listening on `127.0.0.1` only and stopped after the answer unless *keep loaded* is on (`plenio/core/llm/runtime.py`).

Plenio installs no Python packages. When a feature needs one (faster-whisper), it names the command for you to run.

## Files Plenio writes

- **ComfyUI's output folder** (`output/plenio` by default): the exported audio, cover art, sheet music PDF and release record; stems marked *save* in the Stem Mixer.
- **ComfyUI's user folder** (`user/plenio`): your brief templates and creative modes, `config.toml`, and caches (lyrics ASR results, Local LLM answers) that make runs repeatable. The score editor keeps your sound presets in ComfyUI's own user data.
- **The models folder**: the ASR model (`models/plenio/asr`).
- **The temp folder**: a worker's job folder and a llama.cpp server's log while they run, removed afterwards.

## Plenio's HTTP routes

ComfyUI serves Plenio's routes under `/plenio/` (`plenio/comfy/routes.py`). They analyse and convert what the editor sends (scores, lyrics, MIDI, the EQ curve) and read the template library and presets. Two write files: `POST /plenio/templates` saves a brief template under a sanitised name in `user/plenio/templates`, and `POST /plenio/export/sheet-music` saves the sheet music PDF of an export - only with the one-time token Export Release created for that file, within 30 minutes, only a PDF, only to the name the node reserved. Like all of ComfyUI, these routes are meant for a ComfyUI that listens on your own machine; if you open ComfyUI to a network, secure it as ComfyUI's own documentation describes.

## Reporting a problem

Please report a security problem through GitHub's private vulnerability reporting on this repository (*Security > Report a vulnerability*); if that is not available, open an issue without the details and ask for a private channel.
