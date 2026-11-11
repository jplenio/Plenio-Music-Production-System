# The writer on ComfyUI's own Gemma 4 12B (phase 0.4)

Measured 2026-11-11 with `tools/studies/writer_compare.py` in ComfyUI **0.41.0** (the oldest version Plenio 2.0 supports) on an RTX 5060 Ti 16 GB (the second card, nothing else on it). Each writer wrote the briefs of the first twenty song templates (alphabetical: ten instrumental, ten sung; YuE2, standard detail, seed 0) the way the templates ask it: a native file through `CLIPLoader` + `TextGenerate`, a GGUF through Plenio's *Local LLM* with `keep_loaded` off (llama-cpp-python, context 24 576 tokens). Data: [`data/writer-native-12b.json`](data/writer-native-12b.json) - measures only, no lyrics.

| Writer | First answer | Median after it | Sung briefs (median) | Parsed | Cut off | Peak memory above idle |
|---|---|---|---|---|---|---|
| `gemma4_12b_int8_convrot` (native, 12.06 GB) | 29.1 s | 9.8 s | 12.4 s | 20 of 20 | 0 | 12.1 GiB |
| `gemma4_e4b_it_fp8_scaled` (native, 9.06 GB) | 24.3 s | 8.2 s | 9.3 s | 20 of 20 | 0 | 9.3 GiB |
| `gemma-4-12B-it-QAT-Q4_0` (GGUF, llama.cpp) | 18.5 s | 9.3 s | 10.8 s | 20 of 20 | 0 | 14.8 GiB |
| `gemma-4-12b-it-Q6_K` (GGUF, llama.cpp; measured the same day after the download was permitted) | 24.8 s | 23.1 s | 26.7 s | 20 of 20 | 0 | 15.1 GiB |

*First answer* includes loading the model from disk; for the GGUF every answer includes starting its server, as in the templates. Peak memory is `nvidia-smi`'s used memory of the card during a writer's twenty answers minus the level before; the GGUF's figure includes llama.cpp's 24 576-token context.

## What it settles

- **ComfyUI 0.41.0 loads the 12B** (`Gemma4TEModel`, dynamic VRAM loading, 11.4 GB staged). Step 3 needs no newer ComfyUI.
- **Steps 2 and 3 stay in their order** (GGUF before the native 12B where llama.cpp runs). On this card they write equally fast (9.3 s and 9.8 s a brief after the first) and every answer of both parses. The GGUF step comes first because a GGUF on the computer is a file the user chose; the native 12B is the writer that needs no runtime.
- **The memory from which step 3 is taken:** the native 12B peaked at 12.1 GiB; the catalogue now takes it from **13.0 GiB** (room for longer answers) and marks it *measured*. Below that the plan takes the E4B, which peaked at 9.3 GiB and is now taken from **10.0 GiB**. The E2B was not measured (not on this machine); its threshold stays an estimate.
- **The Q6_K, the GGUF Plenio downloads for a card from 15.5 GiB, is the slowest writer on a 16 GB card**: 23.1 s a brief against 9.8 s for the native 12B and 9.3 s for the QAT Q4_0, with the card nearly full (15.1 GiB with the 24 576-token context) - probably because weights and context do not both fit on the card (not checked). On a 16 GB card the native 12B and the QAT Q4_0 write about 2.4 times as fast. Whether the Q6_K writes better words was not judged. Whether to take the Q6_K only from more memory is the owner's decision (it trades a possible quality for time); until then the thresholds stay.

## What it does not settle

- **Quality of the words** was not judged: *parsed* says that the answer has every block Plenio needs, not that the lyrics are good. Not read, not heard.
- One card and one run per brief. The spread between runs was not measured.
