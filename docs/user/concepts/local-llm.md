# Local LLMs

The song templates write their lyrics with ComfyUI's native **Generate Text** and the Gemma 4 writer, which ComfyUI downloads for you. If you already have language models - GGUF files in ComfyUI's `models/LLM` folder, or models in LM Studio, Ollama, llama.cpp, Unsloth Studio or another local app - the **Local LLM** node uses them instead. It is a general node: one prompt in, one answer out, usable in any workflow.

## Use it as the song writer

1. In the node library open *Plenio / Writing* and add **Plenio · Write Song (local LLM)** next to the template's *Write Song* block.
2. Connect it like *Write Song*: *brief*, *engine* (and in covers *score*, *language*, *reference_lyrics*) in, *title*, *style*, *lyrics*, *artwork_prompt* and *report* out; link the **Draft seed** node to its *draft seed*. Then delete the old block.
3. Choose the **writer model** and run.

Quicker, for one template: open *Write Song* (the icon at its top right), delete *Writer model* and *Generate Text*, add **Local LLM**, and connect *Compose Writing Prompt → prompt* and *text → Parse Song Draft*.

## Which models it finds

| In the list | Where it comes from |
|---|---|
| `models/LLM · …` | ComfyUI's `models/LLM` folder, and every `LLM:` folder of `extra_model_paths.yaml` |
| `LM Studio files · …` | LM Studio's download folder (as set in LM Studio) |
| `HF cache · …` | the Hugging Face cache - where Unsloth Studio and `llama-server -hf` download GGUFs |
| `llama.cpp cache · …`, `GPT4All files · …` | those apps' model folders |
| `LM Studio · …`, `Ollama · …`, `llama.cpp · …`, `vLLM · …`, `Jan · …`, `KoboldCpp · …`, `text-generation-webui · …`, `GPT4All · …`, `Unsloth Studio · …` | the models of an app whose local API server is running (at its default port) |
| your labels | extra folders and servers from Plenio's `config.toml` ([Configuration](../configuration.md)) |

Vision projectors (`mmproj`), embedding models and the later parts of split files are left out. Press **R** in ComfyUI after you add a file or start an app.

## Files or apps?

- **A file** (`models/LLM · …`, `… files · …`, `HF cache · …`) runs in a llama.cpp server that Plenio starts for the draft and stops right after. Before it starts, ComfyUI frees enough GPU memory for the file and its context; afterwards all of it is free again for YuE2 or MiniMax. This is the best choice on a single 16 GB card. Loading takes a few seconds per draft (a fixed draft seed keeps the draft cached, so it is written once).
- **An app's model** (`LM Studio · …`, `Ollama · …`) is answered by the running app. The app manages its own memory: Plenio asks Ollama, and LM Studio for models it loaded by itself, to unload after the answer (*keep loaded* off), but a model you loaded by hand in LM Studio stays. Set the context length in LM Studio to 8192 or more; Ollama gets it from the node.

## Running GGUF files: the llama.cpp server

GGUF files need a llama.cpp server program. Plenio looks for one in this order and the System Check shows which it found:

1. `PLENIO_LLAMA_SERVER` or `[llm] llama_server` in `config.toml` (the program or its folder);
2. `llama-server` on the PATH (Windows: `winget install llama.cpp`, macOS/Linux: `brew install llama.cpp`, or a [release](https://github.com/ggml-org/llama.cpp/releases));
3. the build Unsloth Studio installs (`~/.unsloth/llama.cpp`), winget's and Homebrew's folders;
4. llama-cpp-python, if it is installed in ComfyUI's Python (slower to support new model architectures).

Without any of them, models of running apps still work. LM Studio's bundled llama.cpp is not a standalone server; use LM Studio's own server for its models, or its files through one of the programs above.

## Settings

| Setting | Default | Meaning |
|---|---|---|
| seed | 0, fixed | the same seed and prompt give the same, cached answer |
| max tokens | 2048 | a longer answer stops the run with a message instead of being cut |
| temperature | 0.8 | 0 = most likely words; higher = more varied |
| thinking | off | let a reasoning model think first; slower and needs more max tokens; the thoughts come out on *thinking* |
| context | 8192 | prompt + answer, for files and Ollama |
| keep loaded | off | on: the model stays loaded for the next run - faster, but it keeps its GPU memory next to ComfyUI's models |
| system prompt | empty | standing instructions before the prompt |

## Limits

- Draft quality depends on the model. The writer prompts were tuned with Gemma 4 E4B (native); instruction-tuned models of 4-12 B parameters follow the layout best. Parse Song Draft reports every deviation it repaired.
- Only text: images and audio inputs of multimodal models are not used.
- Plenio keeps no API keys. An app that needs a key reads it from an environment variable (Unsloth Studio: `UNSLOTH_API_KEY`).
