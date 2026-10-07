# Local LLMs

The song templates write their lyrics with ComfyUI's native **Generate Text** and the Gemma 4 writer, which ComfyUI downloads for you. If you already have language models - GGUF files in ComfyUI's `models/LLM` folder, or models in LM Studio, Ollama, llama.cpp, Unsloth Studio or another local app - you can write with them instead. Outside the song templates the **Local LLM** node is a general node: one prompt in, one answer out, usable in any workflow.

## Choose the song writer

The **writer model** field of the *Write Song* block lists every model:

| In the list | Written by |
|---|---|
| `gemma4_e4b_it_fp8_scaled.safetensors` (the default) and the other ComfyUI text models - bare file names from `models/text_encoders`, as in every ComfyUI loader | ComfyUI's own **Generate Text**; ComfyUI manages the memory and offers the default's download |
| `models/LLM · …gguf`, `LM Studio files · …`, `HF cache · …` - with where it comes from in front | a GGUF file, run by llama.cpp for the draft (see below) |
| `LM Studio · …`, `Ollama · …`, `llama.cpp · …` … | a model of a running app |

Choose one and run - nothing else changes. Inside the block, a switch takes the answer of the chosen writer only: the other one is never loaded, and a GGUF does not need the Gemma file at all. *draft seed* and *thinking* apply to whichever writer you chose. The ComfyUI list shows the text encoders of language-model families (Gemma, Qwen, Llama, Mistral) by name; CLIP and T5 encoders are left out.

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
- **An app's model** (`LM Studio · …`, `Ollama · …`) is answered by the running app. The app manages its own memory: Plenio asks Ollama, and LM Studio for models it loaded by itself, to unload after the answer (*keep loaded* off), but a model you loaded by hand in LM Studio stays. Set the context length in LM Studio to 12288 or more (a draft with thoughts needs it); Ollama gets it from the node.

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
| seed | 0, fixed | the same seed, prompt and settings give the same answer - from Plenio's answer cache, without asking the model again |
| max tokens | 6144 | room for a long draft and a reasoning model's thoughts; a longer answer stops the run with a message instead of being cut |
| temperature | 0.8 | 0 = most likely words; higher = more varied |
| thinking | off | let a reasoning model think first; slower and needs more max tokens; the thoughts come out on *thinking* |
| context | 12288 | prompt + answer, for files and Ollama |
| keep loaded | off | on: the model stays loaded for the next run - faster, but it keeps its GPU memory next to ComfyUI's models |
| system prompt | empty | standing instructions before the prompt |
| reuse answers | on | keep every answer in `user/plenio/cache/llm` and answer the same request from there (see below) |
| schema | - | an optional JSON schema the answer must follow (Arrange connects one) |

## The same request is never sent twice

ComfyUI runs a node again when anything before it changed - also when its own inputs stayed the same (for example after you changed a slider that does not reach this prompt, or after a restart). With *reuse answers* on, Local LLM then answers from Plenio's **answer cache**: the same model (for a file also its size and date), prompt, system prompt, seed and settings give the stored answer, and the summary says *from Plenio's answer cache - the model was not asked again*. A new seed asks the model again. The cache is in `user/plenio/cache/llm`; delete it to forget all answers.

## Answers in a fixed format

With a **schema** connected (the creative modes' *Arrange* does this), GGUF files, LM Studio, Ollama and vLLM are held to that JSON schema while they write - the answer cannot leave the format. An app that does not take a schema answers freely (the summary says so) and Plenio reads the answer leniently. Keep *thinking* off with a schema: a reasoning model cannot think inside the format.

## Limits

- Draft quality depends on the model. The writer prompts were tuned with Gemma 4 E4B (native); instruction-tuned models of 4-12 B parameters follow the layout best. Parse Song Draft reports every deviation it repaired.
- Only text: images and audio inputs of multimodal models are not used.
- Plenio keeps no API keys. An app that needs a key reads it from an environment variable (Unsloth Studio: `UNSLOTH_API_KEY`).
