# Writer Choice

One list for the writing model of *Write Song*:

| Entry | Writer |
|---|---|
| a bare file name such as `gemma4_e4b_it_fp8_scaled.safetensors` | ComfyUI's own **Generate Text** with that text model from `models/text_encoders` (loaded by the native CLIP loader; ComfyUI manages its memory and offers the default's download) |
| `models/LLM · …gguf`, `LM Studio files · …`, `HF cache · …`, `llama.cpp cache · …`, `GPT4All files · …` | **Local LLM** with that GGUF file, run by llama.cpp for the draft |
| `LM Studio · …`, `Ollama · …`, `llama.cpp · …`, `vLLM · …`, `Jan · …` … | **Local LLM** with a model of a running app |

The node hands the choice on: *text_encoder* to the CLIP loader, *local_model* to Local LLM, and *use_local* to the switch after both. The switch asks only the chosen branch for its answer, so the other model is never loaded - and a Local LLM model needs no file in `models/text_encoders`.

The ComfyUI entries are the text encoders of language-model families (Gemma, Qwen, Llama, Mistral) found by name; CLIP and T5 encoders and GGUF files are not offered there. A chosen text model that is not in `models/text_encoders` stops the run with its name. Press **R** after adding a model or starting an app.
