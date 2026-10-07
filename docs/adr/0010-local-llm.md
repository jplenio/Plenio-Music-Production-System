# ADR-0010: Local LLMs from GGUF files and local apps

- Status: accepted
- Date: 2026-10-07
- Amends: ADR-0003

## Context

ADR-0003 replaced the legacy llama.cpp-in-process writer with ComfyUI's native `TextGenerate`, because the legacy node had to reach into ComfyUI's memory management (TP-16). The owner wants the language models that are already on the machine to be usable as well: GGUF files in ComfyUI's `models/LLM` folder and the models of local apps (LM Studio, Ollama, llama.cpp, Unsloth Studio, ...) - as one general node, usable outside Plenio's song paths, as simple as possible.

Facts on the owner's machine (2026-10-07): GGUFs in `models/LLM`, LM Studio's download folder and the Hugging Face cache (Unsloth); a working `llama-server` built by Unsloth Studio; LM Studio's bundled `llama-server.exe` does not run standalone; llama-cpp-python 0.3.48 in ComfyUI's Python.

## Decision

- One node, **Local LLM** (`PlenioLocalLLM`, *Plenio/Text*): prompt in, text and thoughts out, a single model list. A model is one reference string `"<source> · <name>"`.
- Pure core `plenio.core.llm` (standard library only): discovery (folders and app servers), one HTTP client (OpenAI-compatible chat completions; Ollama's own API, which takes the context length), and a runner for files.
- **GGUF files run out of process**: a llama.cpp server (`llama-server`, or llama-cpp-python through Plenio's small server with the same command line) is started for the call on a free local port and stopped afterwards. ComfyUI is asked to free the file's size plus its context before the start (R9); when the process ends, the operating system frees all of its memory. No access to ComfyUI internals, no co-residency hacks.
- Apps' models are asked over their local API; Plenio asks Ollama and LM Studio (models they loaded for the request) to unload afterwards unless *keep loaded* is on.
- No new Python packages, no SDKs, no stored API keys (an app that needs a key reads it from an environment variable). Extra folders and servers come from the `[llm]` section of `config.toml`.
- The song templates keep native `TextGenerate` with the downloadable Gemma 4 writer as the default (owner decision 2026-10-07), and *Write Song* offers every other model in the same **writer model** field (owner's request, same day): the node **Writer Choice** (`PlenioWriterChoice`) holds one list - ComfyUI's text models (bare file names, as in every ComfyUI loader, so the frontend's missing-model dialog offers the default's download from the node's `properties.models`) and every Local LLM reference - and routes the choice: the file name by link to `CLIPLoader` -> `TextGenerate`, the reference by link to Local LLM, and a boolean to the native lazy `ComfySwitchNode` in front of Parse. Only the chosen branch runs. Because the names arrive by link, ComfyUI does not check them against the folder lists, so a Local LLM writer does not need the default writer's file; a missing native file is reported by Writer Choice.
- Length: 6144 tokens for the answer (a long draft plus a reasoning model's thoughts) in both writers, a 12 288-token context for Local LLM.

## Consequences

- Two more nodes (21: Local LLM, Writer Choice), no new blueprint. ADR-0003's rule "remote or other LLMs replace the one node" stays; the shipped Write Song already offers the local models.
- Draft quality with other models is not measured (AS-01 covers Gemma 4 E4B only); Parse Song Draft reports what it repaired.
- The model list depends on the machine; host tests set `PLENIO_LLM_OTHER_APPS=0` so the node-type snapshot stays the same everywhere.
