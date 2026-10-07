# Local LLM

Answers a prompt with a language model on this machine. One list holds everything that was found:

| Entry | What it is | How it runs |
|---|---|---|
| `models/LLM · file.gguf` | a GGUF file in ComfyUI's `models/LLM` folder | a llama.cpp server is started for the call and stopped afterwards, so the GPU memory is free again for ComfyUI's models |
| `LM Studio files · …`, `HF cache · …`, `llama.cpp cache · …`, `GPT4All files · …` | GGUF files other apps downloaded (Unsloth Studio and `llama-server -hf` use the Hugging Face cache) | the same way, without the app running |
| `LM Studio · …`, `Ollama · …`, `llama.cpp · …`, `vLLM · …`, `Jan · …`, `KoboldCpp · …`, `text-generation-webui · …`, `GPT4All · …`, `Unsloth Studio · …` | a model of an app whose local server is running | asked over the app's API; the app keeps managing its memory |

Press **R** (refresh node definitions) after adding a file or starting an app.

**Inputs:** *prompt* (type it or connect a text, e.g. Compose Writing Prompt), *model*, *seed* (the same seed and prompt give the same, cached answer). Advanced: *max tokens* (6144: room for a long draft and a reasoning model's thoughts), *temperature*, *thinking* (let a reasoning model think first; the thoughts come out separately), *context* (12288, for GGUF files and Ollama; other apps use the length set in the app), *keep loaded* (off: memory is freed after the answer), *system prompt*.

**Outputs:** *text* (the answer, thoughts removed) and *thinking*.

**Running GGUF files** needs a llama.cpp server. Plenio uses, in this order: the program set in `PLENIO_LLAMA_SERVER` or `[llm] llama_server`, `llama-server` on the PATH, the one Unsloth Studio installs, winget's or Homebrew's, then llama-cpp-python if it is installed in ComfyUI's Python. The System Check names the one it found.

The run stops with a message - never with a half answer - when the answer is cut off at *max tokens*, the app is not running, the model is unknown to the app, or the file needs a newer llama.cpp.

In Plenio's song templates *Write Song* uses this node when its **writer model** is one of these models (Writer Choice). See the user guide *Local LLMs*.
