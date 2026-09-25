# Plenio Music Production System — Current-System Analysis (Phase 1A)

| | |
|---|---|
| Phase | 1A — forensic analysis and upstream research (no architecture, no production code) |
| Date | 2026-09-24 |
| Legacy system analysed | `ComfyUI-MiniMax-Music-Production-Toolkit` **v3.1.3** (local copy `D:\Daten2\Deepseek\ComfyUI-MiniMax\ComfyUI-MiniMax`, no `.git`) |
| Reference host | user's ComfyUI at `D:\Daten2\ComfyUI` — core **0.37.0** (git `c194dd00`), frontend package **1.53.6**, workflow templates 0.11.66, `comfy_aimdo` 0.5.5, `llama_cpp_python` 0.3.48, `faster_whisper` 1.2.1. Installed toolkit copy there is **3.1.2**. |
| Upstream snapshot | retrieved 2026-09-24 (YuE repo `main` at `09a1e8a85b`, 2026-09-23; HF model cards; ComfyUI frontend docs `main`) |
| Legacy repository | treated read-only. Tests were run on a scratch copy only. |

Paths in this document without a prefix are relative to the legacy repository root. `comfy:` means the user's ComfyUI checkout. `upstream:` means an external primary source listed in Appendix A.

---

## How to read this document

Every significant statement carries an evidence tag:

| Tag | Meaning |
|---|---|
| **[VF]** | Verified fact — checked in this session by execution, by reading runtime code of the installed host, or by querying a primary API/source. |
| **[RE]** | Evidence from the legacy repository (code, workflow JSON, legacy docs) read in this session. |
| **[UP]** | Upstream documented behaviour (official repository, model card, official docs). |
| **[CM]** | Community evidence (issues, discussions, third-party repositories) — informative, not authoritative. |
| **[EA]** | Engineering assessment (judgement, not a measurement). |
| **[AS]** | Assumption that still requires validation. |

Classification vocabulary used in §3 and §14 (as required by the Phase 1A prompt):
**keep · generalize · redesign · merge · split · replace-native** (replace with standard ComfyUI functionality) **· replace-subgraph · replace-library** (replace with a standard library) **· remove**.

### What was done in this phase

- Every root Python module (90 files, 24 643 lines) was outlined via AST; the generation, cover, prompt, parser, LLM, VRAM, settings, Whisper and instrumental-check modules were read in full. **[VF]**
- Both example workflows were analysed programmatically (node/link/group inventory, full link graph with slot names, stored widget values). **[VF]**
- The legacy test suite was executed on an isolated scratch copy: **1 337 tests, OK (1 skipped), 129 s**; all 9 frontend `.mjs` tests passed; `scripts/validate_release.py` → "Release validation OK". **[VF]**
- Native ComfyUI 0.37.0 source was inspected for YuE2, SheetSage2, MiniMax Music 3, TextGenerate, loops, logic/switch nodes, V3 schema, node replacement, subgraph/blueprint serving, LoRA key mapping, and the bundled blueprints/templates. **[VF]**
- Upstream research: YuE2 repo docs and issues, YuE2/SheetSage2/MiniMax/Qwen3-ASR model cards and licences, Comfy-Org mirrors and templates, ComfyUI frontend extension docs, abcjs 6.7.1 source, notation-library metadata, community YuE2 LoRAs and the `pytraveler/YuE2-ComfyUI` node pack. **[VF]** (sources: Appendix A)

### What was deliberately **not** done

No model inference, no GPU run, no listening test, no browser/UI test, no ComfyUI smoke test, no model downloads, no changes to the legacy repository or to the installed ComfyUI. Audio-quality statements are therefore reported evidence or assessment, never measurement from this session.

---

## 0. Executive summary

1. **The legacy system is a large, defensively engineered monolith.** 55 registered nodes, 24.6 k lines of root Python, 261 vendored FlashSR files (6.6 MB), 2.8 k lines of frontend JS, 22 k lines of tests, 239 user prompt templates and 24 system prompts of ~2.4–3.9 k words each. The main workflow has 68 nodes, 183 links and 420 stored widget values. Stability is bought with positional-slot discipline, many JSON-string sockets and extensive guard code. **[VF]**
2. **Most of the heavy lifting is native in ComfyUI 0.37.** YuE2 (`YuE2GenerateABC`, `YuE2GenerateMusic`, `EmptyYuE2LatentAudio`), SheetSage2 (`AudioEncoderLoader` + `SheetSage2AudioToABC`), MiniMax Music 3, FLUX.2, a native LLM node (`TextGenerate`, incl. Qwen 3.5 and Gemma 4 with audio input), lazy switches, generic loops, `SaveAudioAdvanced`, and official subgraph blueprints for *Text to Music (YuE2)*, *Music Cover (YuE2)* and *Text to Music (MiniMax Music 3)*. The legacy toolkit hides these behind one graph-expanding node (`MusicGeneration`), which also hides the ABC score — the one artefact the target user flow (Generate/Transcribe → Inspect → Edit → Validate → Generate) needs to expose. **[VF]**
3. **The legacy YuE2 conditioning contradicts upstream guidance.** Upstream style examples are short comma-separated descriptor lists; the legacy YuE2 system prompt demands 250–450 words of prose with a numbered, timed arrangement and a `Target duration:` instruction line that is prepended to the Style the model receives. The cover default is `full` instead of the upstream-recommended `melody`; the workflow uses 40 sampler steps against the upstream/native 32. The legacy's own cover diagnostics found that YuE2 audibly *sang* Style prose. **[RE]/[UP]**
4. **Instrumental generation is the weakest area and is handled with heuristics.** YuE2 has no documented instrumental mode **[UP]**; community prompt tricks work in roughly half of the cases **[CM]**. The legacy stacks a vocabulary compiler, hazard-word filters, a score rewrite and a Whisper word-count retry loop, and itself states it gives no acoustic guarantee. **[RE]** A real, dedicated **instrumental AR LoRA for YuE2** now exists (`Mothersuperior/YuE2-instrumental-cot-full-loras`, ~2.7 k instrumental tracks, ComfyUI-native file for the standard `LoraLoader` CLIP slot, CC BY-NC 4.0). **[UP (3rd-party model card)]** Its native compatibility is plausible from ComfyUI's generic LoRA key mapping but not yet runtime-verified. **[AS]**
5. **Resource management fights the host.** Loading llama.cpp next to ComfyUI-managed models required force-releasing ComfyUI internals (`gc.get_objects()` scan for `ModelVBAR`, aimdo cast buffers, prefetch queues). Whisper runs in a subprocess, FlashSR in a private cache. This is fragile against every ComfyUI update. **[RE]/[EA]** Additionally, the two Cover-Studio LLM calls always execute — also for plain MiniMax/YuE2 runs, and also when the main LLM is switched off. **[RE]**
6. **Lyrics/ASR:** the YuE2 model card recommends Qwen3-ASR (Apache-2.0, explicitly supports singing voice and songs with background music) or a cloud API — not Whisper. **[UP]**
7. **Notation:** abcjs 6.7.1 (MIT, actively maintained, and bundled by SheetSage2's own renderer) covers rendering, playback with cursor, selection, keyboard navigation and note dragging (the application must rewrite the ABC). Its playback applies accidentals per octave, whereas YuE2/SheetSage2's native dialect propagates accidentals by letter across octaves — a verified semantic mismatch that any editor must normalise. **[VF]/[UP]** The community pack `pytraveler/YuE2-ComfyUI` (Apache-2.0, very active) already ships a piano-roll/notes/ABC score editor with bar-local rewriting and upstream-parser verification, MIDI in/out, Qwen3-ASR, vocal separation and a LoRA node. **[CM]**
8. **Licensing constrains the product.** YuE2, YuE2-VAE and SheetSage2 weights are CC BY-NC 4.0; MiniMax-Music3 ships under a *Community License* with commercial conditions (the Comfy-Org mirror card says `apache-2.0` — a discrepancy); the vendored FlashSR code has no root licence; `mutagen` is GPL-2.0-or-later, `pedalboard`/`matchering` are GPL-3. **[VF]**
9. **Modern ComfyUI mechanisms can replace large parts of the custom infrastructure:** V3 schema (advanced inputs, DynamicCombo, search aliases, deprecation flags), node replacement (`io.NodeReplace`) instead of custom JS workflow migration, subgraph blueprints shipped from a custom node's `subgraphs/` folder, promoted widgets, App Mode, and `properties.models` download metadata in workflows. **[VF]/[UP]**
10. **Tests are numerous but mostly structural.** They pin node contracts, workflow layout and mocked inference; there is no real-model regression. They document legacy contracts well but would mostly be replaced, not ported. **[VF]/[EA]**

---

## 1. Architecture map of the existing system

### 1.1 Layered view

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Registration  __init__.py: 27 module mappings merged + 4 late additions (55 nodes) │
│               runtime_safety.configure_runtime() at import (opt-in env var)        │
│               ui_help.install_input_tooltips() — global tooltip injection (86 kB)  │
│               HTTP routes: prompt library, model manager, LLM providers            │
│               capabilities report in startup log; WEB_DIRECTORY=./web (20 JS)      │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Control       MusicProductionControl (inherits MiniMaxMusicModelProfile)           │
│               model_profiles.json (3 profiles) · MiniMaxMusicModelSettings         │
│               MiniMaxLLMSettings (central LLM widgets)                             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Prompting     prompt_library / prompt_metadata / prompt_sources / prompt_routes    │
│               MiniMaxStructuredPromptV20 (brief + system prompt + cover context)   │
│               MiniMaxLLMChat (llama.cpp GGUF | local server | cloud) ×3            │
│               MiniMaxParseExternalLLMOutputV16 (sections, budget, cover rules,     │
│               seeds, batch fan-out via OUTPUT_IS_LIST)                              │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Cover         MusicCoverSource → MusicCoverTranscription (expands to native        │
│               SheetSage2) → MusicCoverScore → MusicCoverLyrics (Whisper subprocess) │
│               → YuE2 Cover Studio Plan → LLM → Transform → LLM → Apply             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Generation    MusicGeneration: graph expansion into native YuE2 or MiniMax nodes,  │
│               KSamplerWithConfig, MiniMaxSafeAudioDecode, optional instrumental    │
│               check/pick takes; MusicGenerationReceipt                             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Audio chain   Refinement gate: Declip → PRE low-pass → FlashSR → Crossover →       │
│               HF repair → POST low-pass;  Artifact reduction;  Mastering gate:     │
│               Auto-EQ analyse → EQ apply → manual EQ → SRC → compressor/limiter    │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Artwork       native FLUX.2 Klein nodes → MusicOptionalCoverPreview →              │
│               SaveImageSmartPrefix                                                 │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Delivery      SaveAudioSmartPrefix ×3 (original / release FLAC / MP3, tags, cover) │
│               MiniMaxPromptReport · MiniMaxSaveProductionJSON (56 inputs, last)    │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Models        models_config.json (7 groups) · model_downloader · preflight node    │
│               MiniMaxModelAdvisor · resource_profiles · llm_profiles               │
├────────────────────────────────────────────────────────────────────────────────────┤
│ Tooling       21 scripts (release, validation, workflow builder/sanitiser,         │
│               benchmark, demo catalogue) · 80 test modules · GitHub Pages demo     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Size by responsibility (root Python, lines) **[VF]**

| Area | Main modules (lines) | Total |
|---|---|---:|
| LLM | `llm_chat` 1557, `llm_profiles` 424, `llm_providers` 366, `llm_sampling` 302, `llm_config` 150, `llm_provider_routes` 88, `session_utils` 43 | ~2 930 |
| Prompting | `minimax_prompt_source` 923, `prompt_metadata` 615, `minimax_structured_prompt` 553, `prompt_budget` 466, `prompt_library` 459, `prompt_routes` 195, `prompt_sources` 173, `style_hint` 171 | ~3 555 |
| Cover / YuE2 | `cover_studio` 668, `whisper_lyrics` 606, `cover_transform` 572, `cover_profiles` 552, `instrumental_check` 445, `cover_score` 426, `music_cover` 425, `abc_validate` 323, `cover_planner` 228, `lyrics_fit` 201, `cover_conditioning` 159, `whisper_worker` 148, `song_duration` 117, `cover_alignment` 103, `cover_prompts` 71, `cover_lyrics_contract` 56, `third_party/yue2_abc` 337 | ~5 440 |
| Generation / control | `music_generation` 253, `minimax_settings` 378, `model_profiles` 431, `music_production_control` 128, `minimax_model_profile` 103, `ksampler_config` 112, `audio_decode` 108, `runtime_safety` 173 | ~1 690 |
| Audio restoration | `flashsr_audio` 739, `audio_declip` 401, `audio_lowpass` 361, `audio_hf_repair` 307, `audio_artifact_reduction` 175, `minimax_audio_branch` 263 | ~2 250 |
| Mastering / DSP | `audio_release_prep` 276, `audio_auto_eq` 167, `audio_mastering` 148, `audio_analysis` 126, `eq_config` 120, `audio_compressor` 93, `audio_limiter` 75, `audio_eq` 69, `audio_dsp_utils` 76, `audio_utils` 179 | ~1 330 |
| Delivery / metadata | `save_audio_absolute` 382, `minimax_json_output` 364, `production_metadata` 349, `save_audio_smart_prefix` 321, `ffmpeg_utils` 292, `audio_tag_copy` 232, `minimax_metadata` 222, `minimax_artwork` 215, `output_paths` 205, `minimax_prompt_report` 194, `audio_tags` 241, `file_writes` 137, `metadata_schema` 115, `filename_utils` 110, `minimax_audio_tags` 48 | ~3 430 |
| Models / resources | `model_downloader` 1012, `model_advisor` 726, `resource_profiles` 461, `minimax_autodownload` 163, `model_manager_routes` 122, `capabilities` 111, `comfy_resources` 254 | ~2 850 |
| Help / infra | `ui_help` 664 (86 kB), `audio_tools_help` 50, `toolkit_logging` 87, `progress_utils` 114, `__init__` 294 | ~1 210 |

### 1.3 Frontend extensions (`web/`, 20 JS modules, 2 830 lines) **[VF]**

| Module | Purpose | Mechanism |
|---|---|---|
| `structured_prompt.js`, `prompt_library.js`, `prompt_ui_utils.js`, `prompt_api.js`, `style_hint.js`, `song_model.js`, `song_model_utils.js` | dynamic prompt-file dropdowns, grouped options, copy file body/front-matter into widgets, model-aware system-prompt swap | `app.registerExtension`, `nodeCreated`, widget callbacks, `options.getOptionLabel`, custom HTTP routes |
| `llm_provider.js`, `llm_provider_ui.js` | backend/provider visibility, API-key dialog, model inventory labels (✔/⬇) | buttons via `addWidget`, visibility toggling, routes |
| `audio_eq.js`, `eq_dsp.js`, `eq_presets.js(.json)`, `auto_eq_presets.js` | canvas EQ curve editor, presets | `addDOMWidget` (serialize:false), monkey-patched `onDrawForeground/onExecuted/onRemoved` |
| `mastering_presets.js(.json)`, `mastering_preset_utils.js`, `preset_sync.js` | preset materialisation into widgets; restore appended widgets of old workflows | `beforeRegisterNodeDef` + patched `onConfigure` |
| `workflow_migration.js`, `migration_utils.js` | repair positional widget/link slots of old saved workflows | patched `onConfigure`, `removeInput` |
| `prompt_report_preview.js`, `model_advisor_preview.js` | Markdown preview inside custom nodes | `window.comfyAPI.textPreviewWidgets` (internal surface) |
| `web/docs/*.md` (55 files) | per-node help pages | native node-docs mechanism |

### 1.4 Other assets **[VF]**

- `prompts/user/` — 239 templates in 31 categories, each with a `---` front-matter block (genre, tempo, meter, key, lyrics, language, voice, theme, length). `prompts/system/` — 12 MiniMax variants (~3.8–3.9 k words) + 12 YuE2 variants (~2.4–2.5 k words); `resources/yue2/` — 2 cover-studio role prompts.
- `third_party/yue2_abc.py` — unchanged Apache-2.0 copy of upstream `abc_tools.py` (YuE commit `ef1936f2`).
- `docs/references/` — hashed Markdown snapshots of upstream YuE2 ABC/generation docs.
- `flashsr_inference/` — vendored FlashSR + TorchJaekwon code (no root licence, see §5.5).
- `docs/` — GitHub Pages SoundCloud demo (44 covers), plus large local hand-off docs (`KONTEXT.md` 1.4 k lines, `PROJECT_STATE.md` 1.5 k lines, `IMPROVE-TODO.md` 1.7 k lines, `REFACTOR-PLAN.md` for v2.1.1).
- `.scratch/` — 242 one-off maintenance scripts/logs (not packaged).

---

## 2. Important runtime and data flows

### 2.1 Main production workflow (`example_workflows/Music_Production_Toolkit.json`) **[VF]** (from the link graph)

```text
118 MusicProductionControl ──profile_json──┬─► 80 StructuredPrompt ─┬─system/user─► 81 LLMChat ─text─► 85 LLMUnload ─trigger─► 53 Parser
  (model, stage switches)                  ├─► 53 Parser           │                (+134 central settings)               │
                                           ├─► 55 ModelSettings    └─ user_prompt/summary ─────────────────────────────────┘
                                           ├─► 37 MusicGeneration                                                               │
                                           ├─► 101 ModelAutodownload ─report─► 53 Parser, 122 Transcription, 126 Whisper        │
                                           └─► 121/122/126 cover nodes                                                          │
53 Parser ─caption/lyrics─► 37 MusicGeneration ◄─settings_json─ 55 ◄─seed/provenance─ 53                                          │
53 Parser ─title/image_prompt─► 63 Tags, 68 FLUX encode, 77 cover saver, 35/46/52 audio savers, 99 JSON ◄─────────────────────────┘
37 audio ─► 35 Original FLAC
       └─► 119 Refinement gate ◄─(95 Declip → 49 PRE → 45 FlashSR → 93 Crossover → 94 HF → 50 POST)
             └─► 123 Artifact reduction ─► 109/110/112 EQ ─► 91 SRC ─► 111 Master ─► 120 Mastering gate ─► 116 Preview ─► 52 MP3
                                                                                                        └─► 46 Release FLAC
all save_info + reports (26 report sockets) ─► 99 MiniMaxSaveProductionJSON (runs last)
```

Key characteristics:

- **Everything is wired through STRING sockets carrying JSON** (`profile_json`, `settings_json`, `cover_source_json`, `studio_json`, `*_report_json`, `save_info_json`). Types are invisible to ComfyUI; schema versions live inside payloads (`music_cover_source_v1`, `cover_studio_state_v1`, …). **[RE]**
- **Ordering is forced through fake data dependencies**: the parser receives `model_check_report` and `llm_status` only so it runs after the preflight and the LLM; the LLM text reaches the parser *through* the unload node's `trigger` pass-through so that the GGUF is released before generation. **[RE]**
- **One parse fans out to N songs** via `OUTPUT_IS_LIST` on all 11 parser outputs (`song_count`, random or incrementing seeds); every downstream node is list-mapped. The LLM runs once per queue. **[RE]** (`minimax_prompt_source.py:593-601`)

### 2.2 YuE2 text-to-music path (inside `MusicGeneration`) **[RE]** (`music_generation.py:61-124`)

1. The structured prompt appends a `DURATION PLAN` and (for instrumentals) an `INSTRUMENTAL CONSTRAINT` to the user prompt; the YuE2 system prompt asks for `[Style]`, `[Lyrics]`, `[Title]`, `[Image_Prompt]`.
2. The parser maps `[Style]` to `caption`, estimates tokens (character heuristic; no YuE2 tokenizer, line 851), resolves the length request, and **prepends `Target duration: … seconds.` plus an English instruction paragraph to the Style** (`song_duration.duration_style`, line 72).
3. `MusicGeneration` checks that Style starts with that duration line, then expands: `CheckpointLoaderSimple(yue2_checkpoint)` → `YuE2GenerateABC` (hard-coded 8192 tokens, T 0.7, top-p 0.9, top-k 30, rep 1.005, window 100) → `YuE2GenerateMusic` (mode/T/top-p/top-k/rep from settings) → `EmptyYuE2LatentAudio(seconds)` → `KSamplerWithConfig` → `MiniMaxSafeAudioDecode` (tiled 1920/128).
4. The ABC exists only inside the expanded graph; it is recorded in the receipt JSON afterwards but **cannot be inspected or edited before synthesis**. **[RE]/[EA]**

### 2.3 YuE2 Cover path **[RE]**

```text
121 MusicCoverSource(audio, mode=full|melody, lyrics_mode, lead_instrument) ── cover_source_json
122 MusicCoverTranscription ─expands→ LoadAudio → AudioEncoderLoader → SheetSage2AudioToABC(mode)
125 MusicCoverScore: instrumental → mute Vocal notes to rests, move lead into Ins (replacing Ins notes)
126 MusicCoverLyrics: Whisper (faster-whisper, isolated subprocess) for new/original lyrics
127 Studio Plan (freedom slider → 11-knob profile) → 128 LLM → 129 Transform (+ABC reference) → 130 LLM → 131 Apply
        (deterministic tempo/key/strip-chords, validate LLM ABC, fallback)
131 cover_abc ─► 80 StructuredPrompt (cover system addendum, measured timeline, phrasing map, source JSON)
             └─► 37 MusicGeneration (re-applies adapt_cover_score, strip_chords for melody,
                                     instrumental_conditioning() tag compiler, retries)
```

- The **same score rewrite is applied up to three times** (score node, structured prompt, generation), relying on idempotency. **[RE]** (`minimax_structured_prompt.py:469`, `music_generation.py:95`)
- Lyrics-mode rules are enforced in **four places**: structured prompt (field removal, forced Lyrics value), parser (`apply_cover_lyrics`, `original_lyrics`, lock handling), generation (`apply_cover_lyrics` again), Cover Studio (lyrics policy). **[RE]**
- Original lyrics are restored deterministically from Whisper word timestamps into ABC sections with a lossless word-order check (`cover_alignment.original_lyrics`). **[RE]** This is one of the strongest parts of the cover stack. **[EA]**
- Instrumental covers: native Style is replaced by a compiled tag list (identity sentence filtered by hazard/score-talk regexes, genre/sound vocabulary hits, lead-instrument tag, BPM, `M:`/`K:` values, per-section texture arc, explicit "Instrumental only. No human voices…" rule); native Lyrics become empty section tags with Verse/Chorus renamed `[Instrumental]`. **[RE]** (`cover_conditioning.py`)

### 2.4 MiniMax Music 3 path **[RE]**

`UNETLoader` + `CLIPLoader(type=minimax)` + `VAELoader` → `MiniMaxMusic3TextEncode(caption, lyrics, max_duration, cfg_scale, top_k)` → `ConditioningZeroOut` negative → `EmptyMiniMaxMusic3LatentAudio` → `KSamplerWithConfig` → `MiniMaxSafeAudioDecode`. Caption+Lyrics are counted with the real MiniMax tokenizer read from the text-encoder checkpoint's `tokenizer_json` tensor (no weight load) and soft-trimmed to a 4 500-token budget below the 5 000-token hard limit. **[RE]/[UP]** (upstream limitation: "The tokenized text prompt is limited to 5,000 tokens.")

### 2.5 Audio chain and gating **[RE]**

- `MusicOptionalStage` gates *audio plus eight generic `report_N` strings* with lazy inputs; disabled stages pass the original through and emit `bypassed` JSON. Which report sits on which slot is a positional convention decoded again by the JSON writer (e.g. refinement `report_2` = PRE preset, `report_8` = declip). **[VF]**
- Shipped defaults (3.1.3): refinement "Model default" (on for MiniMax, off for YuE2), PRE low-pass bypassed, crossover `Original SRC only`, HF repair `Cymbal clarity`, artifact reduction **on** (experimental), Auto-EQ Warm tilt 35 %, compressor ratio 1.5 + limiter to −14 LUFS / −1 dBTP, `AudioReleasePrep` used only as resampler. **[VF]**
- Sample-rate conversion is implemented in at least four places (FlashSR output, crossover, release prep, mastering node option) with two resampler implementations (Kaiser polyphase, optional soxr). **[RE]**

### 2.6 Delivery and provenance **[RE]**

Three `SaveAudioSmartPrefix` nodes (original FLAC 24-bit, release FLAC, MP3 V0) with shared `Album - Title` naming, collision handling, tags via mutagen and embedded cover; `SaveImageSmartPrefix` JPEG; `MiniMaxPromptReport` Markdown; finally `MiniMaxSaveProductionJSON` aggregates 56 inputs into schema `minimax_music3_production_metadata_v7` and writes atomically. Output folders come from `MiniMaxOutputPaths` (five prefixes). **[VF]**

### 2.7 Audio Enhance workflow **[VF]**

26 nodes / 34 links: `LoadAudio` → restoration chain (off by default) → artifact reduction → mastering → two savers; `MiniMaxAudioTagReader` copies source tags/cover. Gates are `PrimitiveBoolean` nodes. No LLM, no generation.

### 2.8 Caching and re-execution **[RE]/[EA]**

- `MiniMaxLLMChat.IS_CHANGED` returns `NaN` when enabled and the parser's `IS_CHANGED` always returns `NaN` (`llm_chat.py:1299-1302`, `minimax_prompt_source.py:600-601`). With `seed_mode=random_each_song`, **every queue re-runs the LLM, the generation and the whole audio chain**; there is no way in the main workflow to re-master or re-render artwork for an existing take without regenerating the song. The separate AudioEnhance workflow is the workaround.
- Nodes that want fresh file state implement content fingerprints (`prompt_selection_fingerprint`, style hint hash, cover-source mtime/size). This is sound. **[EA]**

### 2.9 LLM / VRAM lifecycle sequence (one production run) **[RE]**

```text
128 Studio plan LLM  ──┐ same model (central settings) → loaded once
130 Studio transform ──┤   _get_model(): close other GGUFs → free_comfyui_model_cache():
 81 Main LLM         ──┘     FlashSR cache → collect dynamic models → cleanup_prefetch_queues()
                              → reset_cast_buffers() → unload_all_models() → partially_unload()
                              → empty_cache() → if aimdo >200 MB: gc.get_objects() ModelVBAR force-free
 85 LLMUnload → close GGUF, gc, empty_cache, soft_empty_cache
126 Whisper (subprocess, CTranslate2) → released after run; sticky CPU fallback after one CUDA error
 37 YuE2/MiniMax native models (ComfyUI model management)
 45 FlashSR (private runner cache, outside ComfyUI management)
 65-67 FLUX.2 (ComfyUI model management)
```

---

## 3. Custom-node inventory (55 registered nodes) **[VF]**

"Use" = count in main (**M**) / AudioEnhance (**E**) workflow; **X** = created only by graph expansion; **L** = legacy/unused, registered for old workflows. Classification is a first proposal for §14, not a final design. Machine-readable raw inventory (module, category, input/widget/output counts, usage, lazy/output flags): [`data/legacy-node-inventory.json`](data/legacy-node-inventory.json).

### 3.1 Control, settings, generation

| Node ID | Module | Role | Use | Inputs | Classification | Notes |
|---|---|---|---|---:|---|---|
| `MusicProductionControl` | music_production_control | model choice + 4 stage switches, 12 outputs | M1 | 5 | **split / replace-native** | model selection vs stage gates; gates → native switches/subgraph bypass. Default `YuE2` contradicts profile default `minimax_music3`. |
| `MiniMaxMusicModelProfile` | minimax_model_profile | publish profile JSON | L (base class) | 1 | **merge** | into an engine registry (not a node). |
| `MiniMaxMusicModelSettings` | minimax_settings | both engines' sampler/text settings + instrumental check, 16 outputs | M1 | 26 | **split** | per-engine settings (DynamicCombo); duplicated `max_duration`/`yue2_max_duration`. |
| `MiniMaxMusic3GenerationSettings` | minimax_settings | pre-2.6 settings | L | 8 | **remove** | |
| `FlashSRProcessingSettings` | minimax_settings | pre-2.0 low-pass settings | L | 11 | **remove** | |
| `MusicGeneration` | music_generation | graph expansion into native YuE2/MiniMax + retries | M1 | 11 | **redesign → replace-subgraph** | per-engine subgraphs around native nodes; checkpoint names are free STRINGs. |
| `MusicGenerationReceipt` | music_generation | generation record JSON | X | 6 | **redesign** | fold into provenance service. |
| `KSamplerWithConfig` | ksampler_config | KSampler + returns sampler names; NaN guard | X | 10 | **replace-native** | native `KSampler`; keep only a generic finite-latent check if still needed. |
| `MiniMaxSafeAudioDecode` | audio_decode | VAE decode + validation + retry smaller tiles | X | 5 | **replace-native** | `VAEDecodeAudio` / `VAEDecodeAudioTiled`; optional validation node. |
| `MiniMaxInstrumentalVocalCheck` | instrumental_check | Whisper word count on a take | X | 8 | **redesign** | see §11 (validation strategy). |
| `MiniMaxInstrumentalPick` | instrumental_check | lazy pick of least-vocal take (≤11) | X | 24 | **redesign** | native loops or explicit take list. |

### 3.2 Cover

| Node ID | Module | Role | Use | Inputs | Classification | Notes |
|---|---|---|---|---:|---|---|
| `MusicCoverSource` | music_cover | source file, mode, lyrics mode, lead instrument | M1 | 6 | **redesign** | native `LoadAudio` for selection; mode default `full` ≠ upstream `melody`. |
| `MusicCoverTranscription` | music_cover | expands to native SheetSage2 | M1 | 3 | **replace-native / replace-subgraph** | the native blueprint does exactly this. |
| `MusicCoverScore` | music_cover | instrumental score rewrite + phrase map | M1 | 2 | **redesign** | deterministic ABC-operation nodes (mute voice, move voice, strip chords). |
| `MusicCoverLyrics` | whisper_lyrics | Whisper transcription (subprocess) | M1 | 10 | **replace** | Qwen3-ASR or reviewed text; see §10. |
| `YuE2CoverStudioPlan` | cover_studio | freedom slider → profile → plan prompt | M1 | 23 | **redesign** | |
| `YuE2CoverStudioTransform` | cover_studio | plan → transform prompt (+ABC reference) | M1 | 3 | **redesign** | |
| `YuE2CoverStudioApply` | cover_studio | deterministic ops + validate LLM ABC + fallback | M1 | 5 | **split** | keep the deterministic/validation core; LLM rewrite becomes optional. |
| `MiniMaxStyleHint` | style_hint | style text for studio (cycle workaround) | M1 | 4 | **remove** | exists only because the master prompt node is downstream of the studio. |

### 3.3 Prompting and LLM

| Node ID | Module | Role | Use | Inputs | Classification | Notes |
|---|---|---|---|---:|---|---|
| `MiniMaxStructuredPromptV20` | minimax_structured_prompt | 9 fields + description + system prompt + cover context | M1 | 22 | **split** | brief builder / system-prompt selection / cover context augmentation. |
| `MiniMaxParseExternalLLMOutputV16` | minimax_prompt_source | sections, budget, cover rules, seeds, batch lists | M1 | 20 | **split** | parser / budget / cover rules / batch fan-out are four concerns. |
| `MiniMaxLLMTemplateV16` | minimax_prompt_source | pre-2.0 prompt template | L | 9 | **remove** | |
| `MiniMaxPromptSourceArtworkV16` | minimax_prompt_source | folder/manual source without LLM | L | 11 | **merge** | into one batch/prompt-source node. |
| `MiniMaxPromptBatchLoader` | minimax_batch | folder batch | L | 10 | **merge** | |
| `MiniMaxPromptReport` | minimax_prompt_report | Markdown of exact model input | M1 | 5 | **redesign** | engine-agnostic "what the model received" preview. |
| `MiniMaxLLMChat` | llm_chat | llama.cpp GGUF / local server / cloud; 31 widgets | M3 | 34 | **redesign / replace-native** | native `TextGenerate` as default backend candidate; remote adapter kept separately. |
| `MiniMaxLLMSettings` | llm_config | central copy of chat widgets | M1 | 29 | **redesign** | configuration via subgraph promoted widgets or one config object. |
| `MiniMaxLLMUnload` | llm_chat | release GGUF, pass-through trigger | M1 | 3 | **remove** (if native LLM) | otherwise keep as explicit lifecycle node. |
| `MiniMaxLLMSessionId` | session_utils | cache buster for external LLM nodes | L | 2 | **remove** | |

### 3.4 Audio restoration and mastering

| Node ID | Module | Role | Use | Inputs | Classification | Notes |
|---|---|---|---|---:|---|---|
| `AudioDeclipRepair` | audio_declip | clipped-plateau Hermite repair | M1 E1 | 10 | **keep** (measure) | |
| `FlashSRLowpassLab` | audio_lowpass | Butterworth PRE/POST presets | M2 E2 | 11 | **generalize** | generic filter node; "FlashSR" naming is historical. |
| `MiniMaxFlashSRAudio` | flashsr_audio | vendored FlashSR SR to 48 kHz | M1 E1 | 3 | **redesign** | optional external dependency; licence and value for YuE2 (48 kHz native) unclear. |
| `FlashSRHybridCrossover` | audio_hf_repair | FIR crossover blend original/FlashSR | M1 E1 | 6 | **keep / generalize** | |
| `HFCymbalShimmerRepair` | audio_hf_repair | dynamic HF sustain reduction | M1 E1 | 11 | **keep** (experimental) | |
| `AudioArtifactReduction` | audio_artifact_reduction | spectral outlier attenuation | M1 E1 | 9 | **keep** (experimental, default off) | shipped default ON while labelled experimental. |
| `MiniMaxAudioBranchSelect` | minimax_audio_branch | lazy A/B branch select | L | 6 | **replace-native** | `ComfySwitchNode` (lazy). |
| `MusicOptionalStage` | music_production_control | gate audio + 8 positional reports | M2 E2 | 12 | **replace-native** | native switch / subgraph bypass + typed report object. |
| `MiniMaxAutoEQAnalyze` | audio_auto_eq | tone-match proposal | M1 E1 | 9 | **keep / generalize** | |
| `MiniMaxParametricEQ` | audio_eq | 8-band RBJ EQ + canvas editor | M2 E2 | 3 | **keep** | editor → modern widget API. |
| `AudioReleasePrep` | audio_release_prep | SRC + static LUFS/TP gain (FFmpeg meter) | M1 E1 | 5 | **merge** | overlaps mastering node; used as resampler only. |
| `MiniMaxMasteringCompressor` | audio_mastering | compressor + limiter + LUFS loop | M1 E1 | 19 | **split or keep** | clear sub-blocks exist (compress/limit/measure). |

### 3.5 Delivery, metadata, artwork, models, utilities

| Node ID | Module | Role | Use | Inputs | Classification | Notes |
|---|---|---|---|---:|---|---|
| `SaveAudioSmartPrefix` | save_audio_smart_prefix | FLAC/WAV/MP3, tags, cover, save-info | M3 E2 | 17 | **redesign** | one export service; native `SaveAudioAdvanced` covers the plain case. |
| `SaveAudioAbsolutePath` | save_audio_absolute | absolute-directory saver | L | 10 | **remove / merge** | |
| `SaveImageSmartPrefix` | minimax_artwork | JPEG cover with shared naming | M1 | 9 | **merge** | into the artefact/export service. |
| `MiniMaxSquareImageSize` | minimax_artwork | size presets | M2 | 2 | **replace-native** | primitives. |
| `MiniMaxCoverControl` | minimax_artwork | old artwork switch | L | 1 | **remove** | |
| `MusicOptionalCoverPreview` | music_production_control | lazy preview gate | M1 | 2 | **replace-native** | `PreviewImage` + switch/bypass. |
| `MiniMaxSaveProductionJSON` | minimax_json_output | canonical record, 56 inputs | M1 | 56 | **redesign** | accumulate a typed record instead of 56 sockets. |
| `MiniMaxOutputPaths` | minimax_batch | five output prefixes | M1 E1 | 9 | **generalize** | |
| `MiniMaxStandardAudioTags` | minimax_audio_tags | tag JSON | M1 E1 | 9 | **keep / merge** | |
| `MiniMaxAudioTagReader` | audio_tag_copy | read tags/cover of a file | E1 | 3 | **keep** | |
| `MiniMaxSongMetadata` | minimax_metadata | v6 metadata builder | L | 32 | **remove** | |
| `MiniMaxMetadataLoader` | minimax_metadata | restore settings from JSON | L | 1 | **redesign** | a "reproduce from record" feature, if wanted. |
| `MiniMaxModelAutodownload` | minimax_autodownload | preflight/download 8 groups | M1 | 10 | **replace-native** (ComfyUI-format weights) / **generalize** (other assets) | |
| `MiniMaxModelAdvisor` | model_advisor | hardware-fit report | M1 | 2 | **redesign** | diagnostic, not part of the production graph. |

---

## 4. Workflow / subgraph inventory **[VF]**

| Workflow | Nodes | Links | Groups | Notes (10 = MarkdownNote count) | Subgraphs | Size |
|---|---:|---:|---:|---|---|---:|
| `example_workflows/Music_Production_Toolkit.json` (v3.1.3) | 68 | 183 | 11 | 10 | none (earlier MiniMax subgraph replaced by `MusicGeneration` expansion) | 171 kB, single line |
| `example_workflows/Music_Production_AudioEnhance.json` (v3.1.3) | 26 | 34 | 6 | 1 | none | 44 kB |
| `dist/v3.x/*` | release copies (3.0.1–3.1.3) incl. older `Yue2_MM3_Production_Toolkit_v3.0.1.json` | | | | | |

Main-workflow groups: `00 CHOOSE / Song model`, `01 START / Files & models`, `02 WRITE / Prompt & LLM`, `03 GENERATE / Music`, `04 REFINE / Restoration A→F`, `05 ILLUSTRATE / Cover artwork`, `06 DELIVER / Files & provenance`, `MASTERING`, `CLEAN · Artifact reduction`, `07 Cover Studio`, `08 LLM SETTINGS`.

Workflow-specific observations:

- **Workflow-specific custom nodes:** `MusicProductionControl`, `MusicOptionalStage` (positional report slots), `MiniMaxStyleHint` (cycle workaround), `MiniMaxLLMUnload` (ordering/memory), `MiniMaxSaveProductionJSON` (56 sockets), `MiniMaxOutputPaths`, `MusicOptionalCoverPreview` exist to make *this* graph work rather than as reusable building blocks. **[EA]**
- **Stored values that diverge from node defaults / upstream** (Appendix C): YuE2 steps 40 vs 32, cover mode `full` vs `melody`, `trim_long_prompt` false vs true, JSON `workflow_name` still "…3.1.1", model default `YuE2` vs profile default `minimax_music3`. **[VF]**
- **Serialization tooling:** workflows carry a toolkit-invented `widgets_values_named` duplicate of positional values, maintained by scripts (`build_public_workflow.py`, `upgrade_workflow_to_v2.py`, `validate_release.py`); it is not a ComfyUI format feature. **[VF]**
- **Native blueprints available on the host** (`comfy:blueprints/`): *Text to Music (YuE2)* (ABC planning toggle via `ComfySwitchNode` + `PrimitiveBoolean`, `PreviewAny` shows the ABC and passes it through), *Music Cover (YuE2)* (SheetSage2 melody → `PreviewAny` → `YuE2GenerateMusic(mode=melody)`), *Text to Music (MiniMax Music 3)* (tiled decode switch). Official templates embed download URLs in `properties.models` and use `yue2_3b_int8_convrot.safetensors`, 32 steps, `dpm_2`/`sgm_uniform`, `ConditioningZeroOut` negative. **[VF]**

---

## 5. Dependency inventory

### 5.1 Python packages (declared) **[VF]**

| Package | Declared | Used for | Licence (PyPI) | Notes |
|---|---|---|---|---|
| numpy ≥1.26, scipy ≥1.10 | yes | DSP, resampling, Auto-EQ fit | BSD | numpy belongs to ComfyUI's runtime. |
| soundfile ≥0.12 | yes | WAV/FLAC I/O | BSD-3 | soundfile 0.13 short-write assert workaround exists. |
| imageio-ffmpeg ≥0.5 | yes | FFmpeg binary fallback (MP3, loudnorm meter) | BSD-2 (bundles FFmpeg builds) | **[AS]** FFmpeg build licence (GPL/LGPL) not reviewed. |
| mutagen ≥1.47 | yes | tags + cover embedding | **GPL-2.0-or-later** | licence interaction with an MIT/Apache package must be assessed. |
| Pillow ≥10 | yes | JPEG artwork | HPND | |
| faster-whisper ≥1.0 | yes (also optional extra) | lyrics ASR, instrumental check | MIT | pulls CTranslate2, PyAV, ONNX Runtime, tokenizers (31 packages). |
| llama-cpp-python | **not declared** (documented) | integrated LLM | MIT | installed build 0.3.48 is not on PyPI (latest PyPI 0.3.35) — a custom/forked wheel. **[VF]** |
| tqdm, torch, torchaudio, safetensors, tokenizers, aiohttp | host | progress, tensors, tokenizer read, routes | — | provided by ComfyUI. |
| soxr (optional) | no | FlashSR resampling if present | LGPL-2.1+ | |

### 5.2 Host (ComfyUI) internals relied upon **[VF]**

`comfy.model_management.{unload_all_models, reset_cast_buffers, soft_empty_cache, current_loaded_models}`, `comfy.model_prefetch.cleanup_prefetch_queues`, `comfy_aimdo.control.get_total_vram_usage`, `ModelVBAR` objects via `gc.get_objects()`, `comfy.cli_args.args.disable_cuda_graphs/disable_comfy_compiler` (runtime_safety), `comfy_execution.graph_utils.GraphBuilder`, `folder_paths.*`, `nodes.PreviewImage`, frontend `window.comfyAPI.textPreviewWidgets`. Several are private or undocumented surfaces. **[EA]**

### 5.3 Native ComfyUI nodes used (by expansion or directly) **[VF]**

`CheckpointLoaderSimple`, `YuE2GenerateABC`, `YuE2GenerateMusic`, `EmptyYuE2LatentAudio`, `UNETLoader`, `CLIPLoader`, `VAELoader`, `MiniMaxMusic3TextEncode`, `EmptyMiniMaxMusic3LatentAudio`, `ConditioningZeroOut`, `LoadAudio`, `AudioEncoderLoader`, `SheetSage2AudioToABC`, FLUX.2 nodes (`CLIPTextEncode`, `CFGGuider`, `RandomNoise`, `KSamplerSelect`, `Flux2Scheduler`, `EmptyFlux2LatentImage`, `SamplerCustomAdvanced`, `VAEDecode`), `PreviewAudio`, `PrimitiveBoolean/String/Int`, `MarkdownNote`.

### 5.4 Model files (catalogue `models_config.json`, version 3) **[VF]**

| Group | Default files | Source repo | Weights licence |
|---|---|---|---|
| minimax | `minimax_music3_dit_fp16`, `…text_encoder_pruned_int8_convrot`, `…dav` (+4 alternatives) | Comfy-Org/MiniMax-Music-3 | MiniMax-Music3 Community License (mirror card tags apache-2.0) |
| yue2 | `yue2_3b_bf16` (+ `yue2_3b_int8_convrot`) | Comfy-Org/YuE2 | CC BY-NC 4.0 |
| sheetsage2 | `sheetsage2_bf16` | Comfy-Org/YuE2 | CC BY-NC 4.0 |
| flux2 | `flux-2-klein-4b`, `qwen_3_4b`, `flux2-vae` (+fp8/fp4) | Comfy-Org split files, BFL | per BFL/Qwen licences (not reviewed here) |
| flashsr | 3 weights | `laion/FlashSR_One-step_Versatile_Audio_Super-resolution` (legacy notes report the original `jakeoneijk/FlashSR_weights` answering HTTP 401; dates given inconsistently as June 2026 and 2026-09-19) | not reviewed |
| llm | 19 GGUFs (Qwen 3.5/3.8, Gemma 4, Llama 3.1, Mistral Nemo, LFM2.5) | bartowski, unsloth, google, LiquidAI, a distil repo | per model |
| whisper | large-v3 (5 files) + turbo + turbo-int8 | Systran; community CT2 conversions (deepdml, Zoont) | MIT (Systran); community conversions unverified |

### 5.5 Vendored code **[VF]**

- `third_party/yue2_abc.py` — Apache-2.0, upstream commit pinned; standard-library only. Low risk, high value.
- `flashsr_inference/` — FlashSR_Inference + TorchJaekwon; upstream has **no root licence** (`license=""`); sub-components MIT/Apache/BSD. The legacy NOTICE calls it "source-available". Redistribution inside an MIT-labelled Registry package is a licensing risk. **[RE]/[EA]**

### 5.6 External tools and services

FFmpeg (system or imageio-ffmpeg), optional local LLM servers (LM Studio etc.), optional cloud LLM providers (API keys held in session memory or stored per base URL), SoundCloud/GitHub Pages for demos, Comfy Registry publishing via GitHub Action. **[RE]**

---

## 6. Architectural strengths and major technical problems

### 6.1 Strengths worth preserving (as ideas or code) **[EA]** unless tagged

1. **Safe prompt library**: path-traversal/symlink protection, strict UTF-8, size limits, content fingerprints for cache invalidation, front-matter metadata. **[RE]**
2. **Exact MiniMax token counting without loading weights** (read `tokenizer_json` via `safe_open`) — directly transferable to YuE2 (its checkpoint carries `yue2_tokenizer_json`, `comfy:comfy/sd.py:1775`). **[VF]**
3. **Lossless original-lyrics placement** from ASR word timestamps into ABC sections with an ordered-word check. **[RE]**
4. **Vendored upstream ABC checker** (`third_party/yue2_abc.py`) used for validation, timeline measurement and chord stripping instead of home-grown parsing (partially — see TP-19). **[RE]**
5. **Deterministic ABC operations** (transpose with re-spelling, tempo rewrite, strip chords) validated before use, with deterministic fallback when an LLM answer fails. **[RE]**
6. **Honest provenance**: generation receipts, measured vs requested duration, "no guarantee" statements, reproducibility metadata, atomic writes, collision-safe naming, Windows/Unicode filename handling. **[RE]**
7. **Mastering philosophy**: meter-only loudness measurement, static gain respecting true-peak headroom, bounded Auto-EQ corrections. **[RE]**
8. **Isolation of a crash-prone native library** (Whisper subprocess with progress and cancellation). **[RE]**
9. **Measurement culture**: benchmark harness with fixed synthetic inputs, median/spread reporting, explicit "unknown" instead of zero. **[RE]**
10. **Rich domain content**: 239 curated templates with structured metadata; EQ/mastering presets; troubleshooting knowledge base. **[RE]**

### 6.2 Technical problems

Each problem lists category · evidence · consequence.

**Coupling and structure**

- **TP-01 Mega-workflow as the product.** One 68-node graph carries MiniMax, YuE2, YuE2 Cover, Cover Studio, audio chain, artwork and delivery. Every run executes the cover chain nodes (they return `""`/inactive payloads when not in cover mode). **[VF]** · Change in one area risks all others; the legacy needed validators for cycles, overlaps and slot order. **[EA]**
- **TP-02 JSON-over-STRING interfaces.** Profiles, settings, cover source, studio state, 26 report strings — schema is enforced by each consumer, invisible to the graph and to validation. **[RE]**
- **TP-03 Hidden sub-graph via expansion.** `MusicGeneration` builds the real pipeline at run time; its internal nodes (ABC, sampler, decoder, takes) are not visible, not editable, not individually cacheable by the user. **[RE]**
- **TP-04 Dependency-cycle workarounds.** The master prompt node is downstream of the Cover Studio, so a separate `MiniMaxStyleHint` duplicates template selection to feed the studio. **[RE]** (PROJECT_STATE 2026-09-18)
- **TP-05 Fake ordering dependencies.** Parser inputs `model_check_report`/`llm_status`, LLM text routed through `MiniMaxLLMUnload.trigger`. **[VF]**

**Hidden state**

- **TP-06 Process-global caches with policy effects.** `_loaded_models` / `_sessions` (LLM), `_runner_cache` (FlashSR), `_MODEL_CACHE` + **sticky `_CUDA_FAILURE`** (with `device=auto`, Whisper stays on CPU until restart after one CUDA error, `whisper_lyrics.py:320-347`), prompt-option caches, tokenizer cache, profile cache. **[VF]**
- **TP-07 Global host mutation.** `runtime_safety` sets `comfy.cli_args.args.disable_cuda_graphs`/`disable_comfy_compiler` for the whole process when enabled (`runtime_safety.py:88-90`). **[VF]**
- **TP-08 Package-directory writes.** "Save custom prompt" writes into `prompts/_custom` inside the installed custom-node folder (`prompt_library.py:204`), which package updates can overwrite. **[VF]**

**Parameter duplication and unclear precedence**

- **TP-09 Duplicated parameters.** Duration: `max_duration`, `yue2_max_duration`, Length field, `Target duration` in Style, profile ceilings. LLM: three chat nodes with 31 widgets each + a central settings node whose payload overrides "field by field". Engine settings: MiniMax and YuE2 groups on one node. Style source for covers: template, fields, description, style hint, `target_style`. **[VF]**
- **TP-10 Precedence rules scattered across nodes** (examples): widget > file metadata > omit; description field authoritative over file body; central LLM payload > node widget; cover `lyrics_mode` > template voice/language/theme; lyrics lock > LLM lyrics > manual fields; `refinement = Model default` depends on engine; studio `melody_only` depends on cot mode *and* slider. Each rule is documented in tooltips/docs but not visible in the graph. **[RE]**
- **TP-11 Divergent defaults** (Appendix C). **[VF]**

**Unnecessary complexity**

- **TP-12 Cover Studio profile model.** A 0–100 slider interpolated over seven anchor profiles into 11 fractional weights, then verbalised for an LLM that rewrites ABC; most results fall back to deterministic operations when validation fails. **[RE]/[EA]**
- **TP-13 Instrumental text compiler.** Regex vocabularies (28 genres, ~60 sound terms, hazard words, score-talk words), identity-sentence splitting and tag capping to 600 chars. **[RE]** Heuristic, language-bound and unmeasured. **[EA]**
- **TP-14 Parser as a policy engine.** 20 inputs, section parsing, token budget, cover rule enforcement, duration injection, measured style headers, provenance, seeds, list fan-out. **[RE]**
- **TP-15 System-prompt sprawl.** 24 near-duplicate system prompts of 2.4–3.9 k words; the YuE2 family requires timed numbered arrangements. Changing a rule means editing 12 files and re-serialising workflows. **[VF]**

**Weak resource management** (details §8)

- **TP-16 Co-residency hacks with private host APIs** (`comfy_resources.py`, `gc.get_objects()` over `ModelVBAR`). **[VF]**
- **TP-17 Unconditional Cover-Studio LLM calls.** Inactive studio nodes return a system prompt plus `"{}"` as user text; `MiniMaxLLMChat` only short-circuits on `enabled=False` or empty text, so nodes 128/130 load the GGUF and generate for every run, including when the main LLM (81) is disabled. **[VF]** (`cover_studio.py:180-184,308-323`; `llm_chat.py:1402-1407`)
- **TP-18 Models outside ComfyUI's manager** (llama.cpp, FlashSR runner, Whisper subprocess) — invisible to ComfyUI's memory accounting. **[RE]**

**Brittle parsing**

- **TP-19 Regex-based ABC surgery next to a real parser.** `cover_score.adapt_cover_score` rewrites voice blocks with regexes while `third_party/yue2_abc.parse_abc` exists; correctness relies on SheetSage2's current serialisation layout ("expected paired Vocal/Ins blocks"). **[RE]**
- **TP-20 LLM-output parsing.** Heading-regex section parser that takes the last header occurrence, `[Count]` integer scraping, think-tag splitting with Gemma/Qwen special cases, numbered `NN [Tag]:` Style entries used as a structural contract across four modules. **[RE]**
- **TP-21 FFmpeg `loudnorm` JSON scraped from stderr** for metering. **[RE]**

**Silent or soft failure modes**

- **TP-22 Permissive validation.** `VALIDATE_INPUTS` returns `True` unconditionally on cover source, structured prompt, model settings, profile; unknown model names fall back to a default with a warning; unavailable samplers fall back silently to the first option with a log note. **[RE]**
- **TP-23 Pass-through on failure.** FlashSR fetch failure → stage skipped with one warning; Auto-EQ without reference → unity with warning; style hint unreadable → typed text; unreadable LLM payload ignored; many `except Exception: pass` in `comfy_resources`. Runs "succeed" with degraded output unless the user reads the console or JSON. **[RE]/[EA]**

**Dependency / licensing problems** (see §5): undeclared llama-cpp-python with custom CUDA wheels; GPL `mutagen`; vendored FlashSR without root licence; CC BY-NC model weights; community Whisper conversions. **[VF]**

**Obsolete workarounds** **[EA]** (to re-verify on the target host)

- **TP-24** `runtime_safety` for ComfyUI 0.35 CUDA-graph issues; `KSamplerWithConfig` backend-retry logic; `MiniMaxSafeAudioDecode` retry; frontend positional-widget migration (`workflow_migration.js`) — the host now offers `io.NodeReplace`; `widgets_values_named`; `restoreAppendedControls` for widgets appended in 3.x.

**Unsafe assumptions**

- **TP-25** Whisper word count on the full mix is treated as vocal evidence (Whisper hallucinates on music; the legacy docs themselves say "not proof"). **[RE]**
- **TP-26** SheetSage2 ABC layout stays paired `V: Vocal`/`V: Ins` blocks per group (true today per native serializer, `comfy:comfy/audio_encoders/sheetsage2_abc.py:884-921`). **[VF]** Any upstream change breaks the regex rewrite. **[EA]**
- **TP-27** Style prose length and "Target duration" text influence YuE2 duration — not an upstream-documented control; YuE2 duration is bounded by `max_duration`, the model's end token and shared context (`comfy:comfy/text_encoders/yue2.py:252-258`). **[VF]/[EA]**

**Testing gaps**

- **TP-28** 1 337 tests with mocked inference; 22 test modules use mocks; roughly 70 tests pin workflow structure, node contracts, schema snapshots and documentation links. No real YuE2/MiniMax/SheetSage2/LLM run, no audio-quality regression, no browser test in this environment (Playwright tests self-skip). **[VF]**

**Functionality already available natively** — see §13; summary: generation graphs, SheetSage2 transcription, switches/gates, loops for retries, tiled audio decode, audio save with format options, LLM text generation (with model management), model download metadata, workflow migration, per-node docs, blueprints, App Mode. **[VF]**

---

## 7. UX problems

| # | Problem | Evidence |
|---|---|---|
| UX-01 | **Parameter overload**: 420 stored widget values in the main workflow; the chat node alone has 31 widgets, the JSON writer 56 inputs, the studio plan 20 widgets. Legacy App-Mode planning catalogued 271 user-facing fields on 41 nodes. | **[VF]/[RE]** |
| UX-02 | **The score is not a first-class object**: no inspect/edit/validate step between plan and render for text-to-music; covers can only be steered through the studio's slider/knobs and LLM rewrite. | **[RE]** |
| UX-03 | **Iteration is expensive**: every queue regenerates the song (NaN `IS_CHANGED` + random seeds), so tweaking mastering/artwork costs a full generation (~10 min per 4-min MiniMax track on the user's machine per legacy notes). | **[RE]** |
| UX-04 | **Engine switching in one graph** shows MiniMax, YuE2 and cover settings simultaneously; which values apply depends on the model dropdown. | **[RE]** |
| UX-05 | **Hidden semantics in names**: "FlashSR" low-pass nodes used without FlashSR, "Cover" meaning both song cover and cover artwork (explicitly clarified in tooltips), `report_1…8` slots. | **[RE]** |
| UX-06 | **Console as the primary feedback channel**: failures degrade silently to pass-through; progress/decisions mostly in the log. Markdown previews rely on an internal frontend API. | **[RE]** |
| UX-07 | **Surprising defaults**: experimental artifact reduction on by default; cover mode `full`; 40 YuE2 steps; thinking `on` with 24 576 max tokens for a 9 B model. | **[VF]** |
| UX-08 | **Instrumental unreliability** is exposed as knobs (word tolerance, retries, lead instrument) rather than as a dependable mode. | **[RE]** |
| UX-09 | **Setup burden**: undeclared llama-cpp-python CUDA wheel, optional Whisper engine, FFmpeg, eight model groups, custom preflight node and advisor in the production graph. | **[RE]** |
| UX-10 | **Documentation volume**: 86 kB tooltip module, 55 node pages, 1.4–1.7 k-line hand-off docs; tooltips carry architectural warnings ("do not wire X into Y, it is a cycle"). | **[VF]** |
| UX-11 | **Language**: UI English, most maintainer docs German, no i18n locales. | **[RE]** |

---

## 8. Resource / model lifecycle assessment

| Resource | Owner | Load | Release | Visible to ComfyUI memory manager | Assessment |
|---|---|---|---|---|---|
| YuE2 checkpoint (bf16 ~7.3 GB; int8 ~3.7 GB) | ComfyUI (native nodes) | per run via expansion | ComfyUI policy | yes | good (native). **[VF]** |
| SheetSage2 (1.29 GB per community pack README) | ComfyUI (native) | per cover run | ComfyUI policy | yes | good. |
| MiniMax DiT/TE/DAV (TE ~8.7 GB per legacy notes) | ComfyUI | per run | ComfyUI policy | yes | good; dynamic VRAM (aimdo) staging is where legacy fought. |
| FLUX.2 Klein 4B + Qwen3-4B TE | ComfyUI | per run | ComfyUI policy | yes | good. |
| GGUF LLM (0.7–21 GB) | toolkit (llama.cpp) | first LLM node | `MiniMaxLLMUnload` or model switch | **no** | root cause of the force-release hacks; CUDA allocations outside torch. **[RE]/[EA]** |
| Whisper large-v3 (CTranslate2) | toolkit subprocess | per call | process exit | **no** (separate process) | robust isolation; sticky CPU fallback; double GPU context while running. **[RE]** |
| FlashSR runner | toolkit cache | first use | `clear_flashsr_cache` (called by LLM cleanup) | **no** | private cache on GPU. **[RE]** |
| Instrumental-check candidates | temp WAVs in `%TEMP%/mmt-instrumental-check` | per take | selection node / 24 h prune | n/a | acceptable; files left on cancel for 24 h. **[RE]** |

Findings:

- **LF-1** The core conflict is *two memory managers on one GPU*. The legacy solution reaches into ComfyUI's private dynamic-VRAM internals and must be re-validated for every ComfyUI release (the user's host moved 0.34 → 0.37 within weeks). **[VF]/[EA]**
- **LF-2** ComfyUI's native `TextGenerate` runs LLMs *inside* ComfyUI model management (Qwen 3.5 0.8–27 B, Gemma 4 E2B/E4B/12B/31B, GPT-OSS-20B, Qwen3-VL, MTP speculative decoding; Gemma 4 accepts audio). This would remove the co-residency problem for local LLMs. **[VF]** Quality/speed vs GGUF on 16 GB cards and GGUF compatibility are **[AS]**.
- **LF-3** Upstream YuE2 baseline: 24 GB GPU recommended, measured peak 11.0–14.1 GiB (RTX 4090/H800) for the reference runtime. **[UP]** The user's cards have 16 GB; the ComfyUI int8 build and community low-VRAM work reduce this further **[CM]**. Measurement on the target hardware is required. **[AS]**
- **LF-4** Stage lifecycles should be explicit and visible (what is loaded, when it is released); today the knowledge lives in log lines and tooltips. **[EA]**

---

## 9. Current YuE2 assessment

### 9.1 Upstream facts **[UP]** (YuE repo `main`, model card, native code)

- YuE2-3B: AR–NAR Mixture-of-Transformers; `plan()` → `generate_semantic()` → `synthesize()` → `decode()`; 48 kHz stereo; inputs `style`, `lyrics`, `cot` (`full`/`melody`/`off`), `seed`, `abc`, `cfg_scale`. No reference-audio, phoneme, BPM, negative-prompt or edit-interval argument.
- Style guidance: "Put genre, instruments, vocal character, language, and tempo in `style`." All official examples are short comma-separated lists (e.g. *"English, warm piano pop, expressive female voice, acoustic piano, rounded bass and light drums, lyrical memorable melody, unhurried phrasing, 88 BPM"*). The Comfy template note: "Keep musical instructions in Style rather than in the lyrics" and "Put only the words intended to be sung in the lyrics field."
- CFG defaults: 1.0 for `full`/`melody`, 1.01 for `off`; ABC sampling has no CFG. Standard preset: 32 synthesis steps. The native node exposes `cfg_scale` as an advanced optional input since ComfyUI #16373.
- Native context: 24 576 tokens shared by prefix (instruction + style + lyrics), ABC and music at 25 frames/s; the music budget is reduced automatically when the prompt is long (`comfy:comfy/text_encoders/yue2.py:252-258`). **[VF]**
- Output flags: truncation of ABC and semantic phases is reported (`yue2_truncated`, warning "reached its token budget"). **[VF]**
- Licence: weights CC BY-NC 4.0; code Apache-2.0. A maintainer stated informally on HF that individual creators may monetise outputs while companies need a licence — **not** part of the licence text. **[UP]/[CM]**

### 9.2 Legacy YuE2 integration versus upstream

| Aspect | Legacy | Upstream / native | Assessment |
|---|---|---|---|
| Style format | 250–450 words, identity paragraph + numbered timed arrangement, `Target duration` line and instructions prepended (`prompts/system/yue2/production.txt:26-32`, `song_duration.py:72`) | concise descriptor list | **[EA]** deviation increases context use and risks prose being sung (legacy cover diagnostics found 7-word Style sequences in ASR of an instrumental). |
| ABC | generated inside expansion, not editable | plan/edit/regenerate is the core upstream workflow | missing capability. |
| Sampler | workflow 40 steps (node default 32) | 32 steps, `dpm_2`, `sgm_uniform`, cfg 1 | unexplained deviation. |
| Checkpoint | `yue2_3b_bf16` as free STRING | templates use `yue2_3b_int8_convrot`; loaders are combos with download metadata | no validation of the name. |
| Duration | Length → Target line, ceiling `yue2_max_duration` 360 | `max_duration` is a ceiling; model may end early | legacy honestly calls Length a target; still injected as prose. |
| Token budget | 4 500 estimated chars/3.5 | real tokenizer available in checkpoint | inaccurate for YuE2. |
| ABC generation settings | hard-coded (8192/0.7/0.9/30/1.005/100) | same values are native defaults | fine, but duplicated. |
| Instrumental | tag-only lyrics, prose rules, hazard filters | not documented | see §11. |
| LoRA | none | community AR/NAR LoRAs exist; native `LoraLoader` applies ComfyUI-layout files | missing. |

### 9.3 Community observations **[CM]** (not verified here)

- Key in the style line had no effect in 18/18 songs, while a transposed ABC was sung in the new key every time (`pytraveler/YuE2-ComfyUI`, HF discussion #13).
- BPM acts as a target, not a lock; harmonic anchors in ABC are followed loosely (HF discussion #8).
- Short lyrics under a long instrumental-style description produced scores without vocal notes 8/8 times (pytraveler README).
- Genre adherence varies (e.g. "rock drifts to country"); ABC planning sometimes pulls the style; LoRAs help (HF discussion #10).
- Voice identity has little control (HF discussion #21).

---

## 10. Current YuE2 Cover assessment

### 10.1 Upstream workflow **[UP]**

1. Transcribe with SheetSage2; **review** melody, meter, key and section order ("Transcription errors can carry into the cover").
2. Remove chord symbols (`--melody-only` keeps both `Vocal` and `Ins`); `cot="melody"` is recommended for covers; `full` keeps the original harmony.
3. Lyrics: find them or transcribe the singing with **Qwen3-ASR** or the Gemini API, check them, organise them into sections matching the recording; align section tags and lyric order with the score; when translating, match phrasing and syllable counts.
4. Generate with target style (short descriptor list) + lyrics + ABC.
5. Evaluate identity and style separately; SheetSage2 transcription of the generated audio is a diagnostic, not ground truth.

The native ComfyUI *Music Cover (YuE2)* blueprint implements steps 1–4 with `mode=melody` and a `PreviewAny` node between SheetSage2 and YuE2 (visible, but not an editor). **[VF]**

### 10.2 Legacy cover features and assessment

| Feature | Legacy | Assessment |
|---|---|---|
| Transcription | native SheetSage2 via expansion; decode probe with PyAV for damaged files | **keep idea** (probe); replace wrapper with native nodes. **[EA]** |
| Mode | default `full`, same choice drives transcription + generation | should follow upstream `melody` for style covers; mode choice independent of transcription detail. **[UP]/[EA]** |
| Score review | none (studio LLM may rewrite) | the upstream "review" step is missing. **[EA]** |
| Lyrics — original | Whisper on the full mix, VAD handling, deterministic section placement | ASR choice weak (upstream suggests Qwen3-ASR; Whisper on mixes is error-prone); placement logic strong. **[UP]/[EA]** |
| Lyrics — new | LLM writes words with phrasing map (note onsets, explicitly "not syllables") and ASR phrasing reference; guard against copying the source | reasonable; syllable-fit is advisory only (`lyrics_fit`). **[RE]** |
| Instrumental | score rewrite (Vocal → rests, lead → Ins replacing Ins notes), tag compiler, empty tags, optional Whisper retry | heuristic stack; replacing Ins notes discards original instrumental lines in vocal passages. **[RE]/[EA]** |
| Cover Studio | freedom slider → LLM plan → LLM ABC transform → validate/fallback; deterministic key/tempo/strip-chords | deterministic ops valuable; LLM-driven ABC rewriting unproven, costly (2 LLM calls). **[EA]** |
| Title | filename stem + `-cover` owns the title | simple and predictable. **[RE]** |
| Timing | measured timeline from ABC; Style headers rewritten with measured times | depends on the numbered-Style convention (TP-20). **[RE]** |

### 10.3 Community state of the art **[CM]**

`pytraveler/YuE2-ComfyUI` (Apache-2.0, created 2026-09-12, v0.9.0 on 2026-09-24, 51 stars): own implementation of SheetSage2 transcription, Qwen3-ASR (1.7B) lyrics, Qwen3-ForcedAligner, Mel-Band RoFormer vocal separation ("Vocals Only"), MIDI import/export, score editor, LoRA node, staged plan/select/render nodes and a track editor ("retake a few bars, keep the rest"). It caches its model outside ComfyUI's model manager and applies deterministic torch settings per run. Reported: cover transcription better for songs with singers than for instrumentals.

---

## 11. Instrumental-generation research findings

### 11.1 Facts and evidence

| Finding | Tag | Source |
|---|---|---|
| YuE2 docs contain **no instrumental mode, empty-lyrics convention or instrument-removal method**; the skill warns not to claim "instrument removal" from checks. | [UP] | YuE docs `generation.md`, `covers.md`, `SKILL.md` |
| Open issue #172 (2026-09-12): users always get vocals. Reported tricks: planning `full`, no language/singer in style, empty section tags — works "5 out of 10" with seed hunting; others report "vocal chops"; a covered instrumental source reportedly does *not* invent vocals. | [CM] | YuE issue #172; HF discussion #1 |
| YuE (v1) maintainer advice: empty lyrics sections with several blank lines, remove vocal tags from genre prompt. Relevance to YuE2 unverified. | [CM] | YuE issue #18 |
| HF user: generate ABC first, then regex-remove the vocal part of the generated score before music generation. | [CM] | HF discussion #1 |
| **Instrumental AR LoRA** `Mothersuperior/YuE2-instrumental-cot-full-loras`: rank-64 on all 28 AR layers (attention + MLP), trained on ~2.7 k instrumental tracks with SheetSage2 chord-annotated ABC, 50/50 regularised; intended for `cot="full"`; three lyrics caption styles (`[instrumental]`, untimed tags `[intro] [verse] …`, timed tags `[intro 0:00-0:15]`); style is a normal tag string; provides `ar_lora_inst_v3abc_comfyui.safetensors` for the **standard `LoraLoader` CLIP slot**; pairs with an optional NAR LoRA from `yue2-mothersuperior-realaudio-tokenizer-v4`; CC BY-NC 4.0; published 2026-09-15. | [UP (3rd-party card)] | HF model card |
| ComfyUI's generic CLIP LoRA mapping maps `text_encoders.<state_dict_key>`; the YuE2 CLIP target is `YuE2TEModel` directly (keys `model.layers.*`), so the documented `text_encoders.model.layers.{i}.self_attn.qkv_proj` keys should map. | [VF] (code) / [AS] (runtime) | `comfy:comfy/lora.py:97-106`, `comfy/supported_models.py:2317` |
| Community pack notes that `LoraLoader` "applies only" ComfyUI-layout files and silently patches nothing for m-a-p-layout files (console only); 3 of 8 measured adapters were ComfyUI layout. | [CM] | pytraveler README |
| Further YuE2 LoRAs exist (genre/style: industrial rock, death metal, reggae, chanson, qawwali, J-pop, hum-to-song; "particle sliders"); training code is not released upstream (HF discussion #4). | [VF] (HF search) / [CM] | HF API |
| Upstream skill: SheetSage2 transcription of generated audio is a diagnostic of realised events; ASR/PER and listening are separate evidence. | [UP] | `listening-and-evaluation.md` |
| Qwen3-ASR supports "Singing Voice, Songs with BGM"; Apache-2.0. | [UP] | Qwen3-ASR model card |
| Legacy measured: an instrumental cover with zero Vocal notes and empty lyrics still produced ASR-recognisable Style phrases; after the tag-compiler change, no Style phrases but "repeated, lyric-like segments" remained; the user chose no vocal separation. | [RE] | `docs/YUE2_COVER_DIAGNOSTICS.md` |
| MiniMax Music 3 supports `[Instrumental]` and `[Solo]` lyric tags; no dedicated instrumental switch is documented. | [UP] | MiniMax-Music3 model card |

### 11.2 Strategy space (options, not a design) **[EA]**

| Lever | Option | Evidence strength | Cost / risk |
|---|---|---|---|
| Native conditioning | `cot=full` plan, then **mute or drop the Vocal voice in the generated/transcribed ABC** before `YuE2GenerateMusic` | community + legacy (cover) | cheap, deterministic, validated by upstream parser; residual vocalisations possible |
| Lyrics representation | bare `[instrumental]`, untimed or timed section tags; empty sections; no words | LoRA card, community | cheap |
| Prompt strategy | concise style **without** singer/language/vocal words; avoid negative "no vocals" prose | upstream style guidance + community; negative-mention effect **[AS]** | cheap |
| Adapter | instrumental AR LoRA (+ optional NAR LoRA) via native `LoraLoader` | 3rd-party card, unmeasured | CC BY-NC, community maintenance, download 2 files, runtime key mapping to verify |
| Generation mode | `full` recommended by LoRA; `melody` recommended upstream for covers | conflicting guidance for instrumental covers | test both |
| Output validation | (a) SheetSage2 re-transcription: count `Vocal` notes/track of the output; (b) vocal separation + vocal-stem energy/VAD (Mel-Band RoFormer/Demucs, MIT code); (c) Qwen3-ASR word count; (d) native Gemma 4 audio-input classification via `TextGenerate` **[AS]** | (a) upstream-endorsed as diagnostic; (b)(c) standard practice; Whisper-on-mix is the weakest | (a) reuses loaded model; (b) adds a model; (c) adds 3.8 GB model |
| Retry | seed retries with validation; best-of-N at the cheap ABC stage (community "symbolic BoN") | community | native `StartLoop`/`EndLoop` with terminations now exist (#16227/#16347) |
| Fallback | vocal-stem removal as last resort (changes timbre; user previously rejected) | legacy decision | product decision |

---

## 12. ABC / notation research findings

### 12.1 Native dialect constraints **[UP]** (upstream `abc-editing.md`, vendored `abc_tools.py`, native serializer)

- Fixed header order (`X:1`, blank `T:`, `M:`, `L:`, `Q:`, two `V:` definitions, `K:`); two monophonic voices `Vocal`/`Ins`; chords only in `Vocal` (also while resting); groups of 1–4 bars with `% label` comments; allowed durations {1,2,3,4,6,8,12,16,24,32,48}; `Z`/`Z2-4` bar rests; 15 chord qualities.
- **Accidentals propagate by letter across octaves within a bar** ("This differs from some general-purpose ABC implementations, so do not silently substitute a parser with different accidental semantics").
- Unsupported: tuplets, grace notes, polyphony, repeats, endings, slurs, broken rhythm, decorations, `w:` lyric fields, custom voices/directives. Lyrics/phoneme alignment belongs in sidecars.
- Validation layers: native-dialect structure, intended musical invariants (e.g. `compare --voices Vocal`), actual audio. SheetSage2's own `validate_serialized_abc` needs structured events and is not a free-text validator.

### 12.2 Library options **[VF]** (registry/API data 2026-09-24)

| Library | Licence | Activity | ABC | Rendering | Playback / cursor | Editing | Fit |
|---|---|---|---|---|---|---|---|
| **abcjs** 6.7.1 | MIT | pushed 2026-09-21, 2.35 k★ | native | SVG | synth + `CursorControl` | `Editor` (textarea sync, warnings, `onchange`), selection (`selectTypes`), keyboard tab navigation, note dragging (reports `step`; **app must rewrite ABC**) | best match; SheetSage2's renderer bundles `abcjs-basic-min.js` |
| Verovio 6.3.0 | **LGPL-3.0** | active | import (`abc` among 10 input formats; MEI native) | high-quality engraving (WASM) | MIDI/timemap | editor toolkit via MEI | heavier; LGPL obligations for a bundled WASM |
| OpenSheetMusicDisplay | BSD-3 | active | no (MusicXML) | VexFlow-based | cursor | no | would need ABC↔MusicXML conversion |
| VexFlow (vexflow/vexflow) | MIT | active | no | low-level engraving | no | build-your-own | too low-level |
| pytraveler YuE2-ComfyUI editor | Apache-2.0 | very active | YuE2 dialect | own piano roll + sheet view + ABC tab | sampled piano, per-part sounds, tempo slider | draw/move/stretch notes, chord lane, sections strip, undo/redo, bar-local rewrite, upstream-parser verification, MIDI export | purpose-built; coupled to its own node pack |

Verified mismatch: abcjs playback applies an accidental to "that pitch (not other octaves) for the rest of the bar" (`abcjs/src/synth/abc_midi_flattener.js:640-664`), unlike the YuE2/SheetSage2 letter-wide convention. A notation stage must therefore either write explicit accidentals for display/playback (normalisation) or post-process abcjs' MIDI pitches; the vendored upstream parser must remain the authority. **[VF]**

### 12.3 Requirement coverage for the intended flow *(Generate/Transcribe → Inspect → Edit → Validate → Generate)* **[EA]**

| Need | abcjs-based | pytraveler editor | Build-from-scratch |
|---|---|---|---|
| Rendered notation | yes | yes | large effort |
| ABC support incl. dialect | yes + normalisation | yes | — |
| Lyrics display | abcjs renders `w:` — but `w:` is not allowed in model ABC → sidecar overlay needed | lyrics panel beside track (edit track) | — |
| Direct note editing | partial (pitch dragging, custom rewrite) | full piano roll | large |
| Synchronized raw ABC | Editor class | ABC tab | — |
| Validation | vendored `abc_tools` (Python) server-side or ported | upstream parser round-trip | — |
| Measure navigation | selection + custom | bar strip, sections | — |
| Undo/redo | custom | yes | — |
| Playback/cursor | yes | yes | — |
| Piano-roll/DAW extension | separate component | exists | — |

The "hold execution for editing" pattern needs a ComfyUI mechanism: the community pack uses output-node plan nodes plus a node-side edit stored with a signature of the words it belongs to; ComfyUI V3 offers `has_intermediate_output` for nodes with interactive intermediate UI. **[CM]/[VF]**

---

## 13. Modern ComfyUI capabilities we should use

All verified against the local host (0.37.0 / frontend 1.53.6) unless tagged **[UP]**.

| Capability | What it gives | Replaces in legacy | Tag |
|---|---|---|---|
| **V3 node schema** (`comfy_api.latest.io`) — `Schema` with `description`, `search_aliases`, `is_deprecated`, `is_experimental`, `is_dev_only`, `not_idempotent`, `enable_expand`, `has_intermediate_output`, `loop_boundary`, `essentials_category`; inputs with `tooltip`, `advanced`, `lazy`, `optional`, `force_input`, `socketless`, `raw_link`; `fingerprint_inputs`, `validate_inputs`, `check_lazy_status`, async `execute` | typed, discoverable nodes; advanced parameters hidden behind the "advanced" toggle | V1 dicts, `ui_help` global tooltip injection, visibility JS | [VF] |
| "Future extensions to node features will only be added to V3 schema." | V1 is frozen | — | [UP] |
| **DynamicCombo** (option-dependent child inputs, values restored on switch), **Autogrow** (prefix/named), **MatchType**, **MultiType**, `Dict`/`Array` types | per-engine settings on one node without showing everything | `MiniMaxMusicModelSettings` dual groups, LLM visibility JS | [VF] |
| **Node replacement** `io.NodeReplace(old_node_id → new_node_id, old_widget_ids, input_mapping, output_mapping)`, applied server-side on prompts and exposed to the frontend | migrating legacy node IDs and positional widget values | `workflow_migration.js`, `migration_utils.js`, `widgets_values_named` | [VF] |
| **Subgraphs**: slots, promoted widgets, parameters panel (reorder/hide), nested subgraphs, unpack; **blueprints** served from `custom_nodes/<pack>/subgraphs/*.json` via `/global_subgraphs` | ship the pipeline as editable building blocks rather than one mega graph | `MusicGeneration` expansion, groups-as-structure | [VF]/[UP] |
| **App Mode / App Builder** (frontend ≥1.41.13): selected inputs/outputs as a simple UI, stored in the workflow | simple user surface over complex graphs | the planned custom App-Mode concept | [UP] (custom widgets not documented as supported) |
| **Model metadata** `properties.models = [{name,url,directory}]` on loader nodes in workflows/templates (missing-model download flow) | standard downloads for ComfyUI-format weights | `models_config.json` + downloader + preflight for Comfy-Org files | [VF] |
| **Lazy switch** `ComfySwitchNode`, `ComfySoftSwitchNode`, boolean logic, `CustomCombo`, `ConvertStringToComboNode` | real optional branches | `MusicOptionalStage`, `MiniMaxAudioBranchSelect`, cover-preview gate | [VF] |
| **Generic loops** `StartLoop`/`EndLoop` (simple/for/list, carried values, terminations, iteration caching), ComfyUI #16227/#16347 (Sept 2026) | bounded retries/best-of-N in the graph | instrumental take expansion + lazy pick | [VF] (new; stability **[AS]**) |
| **Native YuE2/SheetSage2/MiniMax nodes** + blueprints; `YuE2GenerateMusic.cfg_scale` advanced input | engine graphs without custom wrappers | `MusicGeneration`, `MusicCoverTranscription` | [VF] |
| **Native `TextGenerate`** (DynamicCombo sampling, thinking, MTP, image/video/audio inputs) with Qwen 3.5, Gemma 4 (audio), GPT-OSS, Qwen3-VL text encoders | LLM inside model management | llama.cpp node + VRAM hacks | [VF] |
| **Audio nodes**: `LoadAudio`, `RecordAudio`, `TrimAudioDuration`, `AudioConcat`, `AudioMerge`, `AudioAdjustVolume`, `AudioEqualizer3Band`, `Split/JoinAudioChannels`, `VAEDecodeAudioTiled`, `SaveAudio`/`SaveAudioMP3`/`SaveAudioOpus`/`SaveAudioAdvanced` (DynamicCombo format/quality), `PreviewAudio` | standard I/O and simple ops | part of saver/decoder logic | [VF] |
| **String/regex/JSON nodes** (`RegexReplace`, `JsonExtractString`, `StringFormat`, …), `PreviewAny` (text pass-through preview) | light text plumbing without custom nodes | some glue | [VF] |
| **Per-node docs** `WEB_DIRECTORY/docs/<Node>.md` and `docs/<Node>/<lang>.md`; `locales/` i18n | help and localisation | `ui_help.py` bulk | [UP] |
| **Frontend extension rules**: widget values live in a Pinia store; unique, stable widget names; `node.widgets` may be undefined; use `addWidget`/`addDOMWidget`/`BaseWidget`; persist extension data in `node.properties`/`graph.extra`; `onConfigure` receives a shallow copy; do not call internal stores | constraints for any editor widget | legacy monkey-patching of `onConfigure/onExecuted`, internal `textPreviewWidgets` | [UP] |
| **Secure V2 custom-node extensions** (isolated workers) | future frontend isolation | — | [UP] open PR #17759, not merged **[AS]** |
| Progress: `comfy.utils.ProgressBar`, `model_trange`; interruption: `throw_exception_if_processing_interrupted` | consistent progress/cancel | custom tqdm/progress helpers | [VF] |

---

## 14. Migration candidates — keep / generalize / replace / remove (subsystem level)

| Subsystem | Legacy location | Classification | Rationale (plausible option, not final) |
|---|---|---|---|
| Engine profiles | `model_profiles.py/.json`, `minimax_model_profile.py` | **generalize** | engine registry with capabilities (context, fps, token counter, cot modes, sample rate), not a node. |
| Production control / stage gates | `music_production_control.py` | **split → replace-native** | model choice and stage gates as native switches / subgraph bypass / App-Mode inputs. |
| Engine settings | `minimax_settings.py` | **split** | per-engine nodes or DynamicCombo; remove legacy settings nodes. |
| Generation orchestration | `music_generation.py` | **replace-subgraph** | blueprints around native YuE2/MiniMax nodes; ABC exposed; custom node only where native lacks something. |
| Sampler/decoder wrappers | `ksampler_config.py`, `audio_decode.py` | **replace-native** | native KSampler/VAEDecodeAudio(Tiled). |
| Runtime safety | `runtime_safety.py` | **remove** (re-verify) | 0.35-era workaround with global side effects. |
| YuE2 prompt conditioning | `prompts/system/yue2/*`, `song_duration.py` | **redesign** | concise style per upstream; duration via `max_duration`/score, not prose; exact token counting. |
| Cover transcription | `music_cover.py` | **replace-native** | native SheetSage2 nodes + review step. |
| Score operations | `cover_score.py`, `cover_transform.py`, `third_party/yue2_abc.py`, `abc_validate.py` | **keep + generalize** | deterministic, parser-based ABC ops library (strip chords, keep/mute voice, transpose, tempo, validate, compare). Regex surgery → parser-based. |
| Cover Studio (LLM rewrite) | `cover_studio.py`, `cover_profiles.py`, `cover_planner.py`, `resources/yue2/*` | **redesign** | editor-centred; LLM editing optional with invariant checks. |
| Lyrics ASR | `whisper_lyrics.py`, `whisper_worker.py` | **replace** | Qwen3-ASR (upstream-recommended) or reviewed text; keep subprocess-isolation idea if a non-native engine stays. |
| Lyrics alignment/fit | `cover_alignment.py`, `cover_lyrics_contract.py`, `lyrics_fit.py` | **keep / generalize** | lossless placement, ordered-word check, fit diagnostics. |
| Instrumental conditioning | `cover_conditioning.py` | **remove / redesign** | replace with evidence-based strategy (§11). |
| Instrumental validation/retry | `instrumental_check.py` | **redesign** | validation via SheetSage2/separation/ASR; retries via loops/explicit takes. |
| Prompt library & metadata | `prompt_library.py`, `prompt_metadata.py`, `prompt_sources.py`, `prompt_routes.py`, `prompts/user/*` | **keep / generalize** | strong; move user writes out of the package directory. |
| Structured prompt node | `minimax_structured_prompt.py` | **split** | brief builder, system-prompt selection, cover context. |
| System prompts | `prompts/system/*` | **redesign** | composable, versioned, per engine; drop 12×-duplicated variants. |
| LLM parser | `minimax_prompt_source.py` | **split** | parser, budget, engine-specific rules, batch. |
| Token budget | `prompt_budget.py` | **generalize** | exact counters per engine (MiniMax + YuE2 tokenizers from checkpoints). |
| Local LLM runtime | `llm_chat.py`, `llm_sampling.py`, `llm_profiles.py` | **redesign / replace-native** | native `TextGenerate` default; llama.cpp optional adapter only if measured necessary. |
| Remote LLM providers | `llm_providers.py`, `llm_provider_routes.py`, `web/llm_provider*.js` | **keep (optional) / redesign** | isolated adapter; security review of key storage. |
| Central LLM settings | `llm_config.py` | **redesign** | promoted widgets or one config object. |
| VRAM force-release | `comfy_resources.py` | **remove** | obsolete if all models are ComfyUI-managed; isolate if llama.cpp stays. |
| Model catalogue/downloader | `model_downloader.py`, `models_config.json`, `minimax_autodownload.py`, `model_manager_routes.py` | **replace-native + generalize** | `properties.models` for ComfyUI weights; small fetcher only for non-ComfyUI assets (ASR, separation, FlashSR). |
| Hardware advisor | `model_advisor.py`, `resource_profiles.py`, `capabilities.py` | **redesign** | diagnostics outside the production graph. |
| Restoration DSP | `audio_declip.py`, `audio_lowpass.py`, `audio_hf_repair.py`, `audio_artifact_reduction.py` | **keep (measure) / generalize** | retain algorithms that show measured benefit; generic naming. |
| Super-resolution | `flashsr_audio.py`, `flashsr_inference/` | **redesign** | optional external node or licensed dependency; YuE2 is already 48 kHz. |
| Branch/stage gates | `minimax_audio_branch.py`, `MusicOptionalStage` | **replace-native** | lazy switches, bypass. |
| Mastering DSP | `audio_eq.py`, `eq_config.py`, `audio_auto_eq.py`, `audio_compressor.py`, `audio_limiter.py`, `audio_mastering.py`, `audio_analysis.py` | **keep / generalize** | coherent own DSP; consider `pyloudnorm` (MIT) for LUFS metering; true-peak needs oversampling (keep own). |
| Release prep / SRC | `audio_release_prep.py`, resamplers in 4 places | **merge** | one resampling utility and one loudness stage. |
| Savers / artefacts | `save_audio_smart_prefix.py`, `save_audio_absolute.py`, `minimax_artwork.py`, `audio_tags.py`, `ffmpeg_utils.py`, `file_writes.py`, `filename_utils.py`, `output_paths.py` | **merge + keep core utilities** | one export service; keep naming/atomic write/collision code. Review mutagen (GPL). |
| Production record | `minimax_json_output.py`, `production_metadata.py`, `metadata_schema.py`, `minimax_metadata.py` | **redesign** | typed record accumulated through the graph; schema migration keep. |
| Prompt report | `minimax_prompt_report.py`, `web/prompt_report_preview.js` | **redesign / replace-native** | engine-agnostic input preview via `PreviewAny`/UI text. |
| Artwork | native FLUX.2 nodes + saver | **replace-subgraph** | blueprint; saver merged into export. |
| Tooltips/help | `ui_help.py`, `audio_tools_help.py`, `web/docs/*` | **redesign** | schema tooltips + per-node docs + i18n. |
| Frontend prompt/preset JS | `web/structured_prompt.js`, `prompt_library.js`, `style_hint.js`, `song_model*.js`, `preset_sync.js`, `mastering_presets.js` | **redesign** | V3 dynamic inputs/remote options; single source for presets. |
| Frontend migration JS | `web/workflow_migration.js`, `web/migration_utils.js` | **remove** | `io.NodeReplace`. |
| EQ editor widget | `web/audio_eq.js`, `eq_dsp.js` | **keep / redesign** | port to supported widget API. |
| Release/validation tooling | `scripts/*`, `workflow_schema.py` | **redesign** | new repo tooling; keep ideas (privacy scan, schema checks, link checks). |
| Tests | `tests/*` | **redesign** | contract ideas keep; add real-model smoke/regression on the target GPU. |
| Demo site | `docs/index.html`, `demo-*.js` | **keep outside core** | not part of the node package. |
| Logging/progress | `toolkit_logging.py`, `progress_utils.py` | **keep / replace-native** | native ProgressBar/model_trange. |

---

## 15. Open questions the architecture must resolve

**Scope and product**

1. Engine scope and priority: YuE2 (text + cover) first-class, MiniMax Music 3 second, others (ACE-Step 1.5 is native on the host) out of scope?
2. Product/licence positioning: YuE2/SheetSage2 are CC BY-NC 4.0 — is the system explicitly non-commercial, and how is that surfaced to users who export/release audio? Licence of the new package (MIT vs Apache-2.0)? Treatment of GPL dependencies (`mutagen`) and the FlashSR vendoring?
3. Backward compatibility: must legacy workflows/node IDs load (via `io.NodeReplace`), or is Plenio a clean break with a documented import path for records/prompts only?

**YuE2 core**

4. Build on native YuE2 nodes, adopt/depend on `pytraveler/YuE2-ComfyUI` (own inference, own model cache, rich editor), or hybrid (native generation + reuse of its Apache-2.0 editor/validation ideas)?
5. How is the ABC made a first-class, editable artefact in ComfyUI: separate "plan" and "render" executions, an output node that stores an edited score, `has_intermediate_output`, or file-backed scores? Where is the edit persisted (node properties, widget value, file) and how is staleness detected (words/style changed)?
6. Style generation policy: concise descriptor style per upstream, generated by LLM or by deterministic templates from structured fields? How are arrangement intentions expressed if not as prose (score edits, section tags, LoRAs)?
7. Duration control: `max_duration` + score length only, or an explicit "structure planner" that produces section tags/ABC length?
8. Checkpoint policy: bf16 vs int8_convrot default on 16 GB cards; LoRA support (AR/NAR, layouts) as a first-class feature?

**Cover**

9. Mandatory human review step between transcription and generation (App Mode vs node editor)?
10. Default `melody` vs `full`; per-voice keep/mute choices (upstream `--keep-voice`) as explicit options?
11. Lyrics source: Qwen3-ASR (dependency, ~3.8 GB, Apache-2.0), Whisper, native Gemma 4 audio via `TextGenerate`, or manual/reviewed text only? Is forced alignment (Qwen3-ForcedAligner) needed?
12. Keep an LLM-based score transformation at all, or limit to deterministic operations plus the editor?

**Instrumental**

13. Primary strategy: instrumental LoRA, score-level vocal muting, prompt conventions — or a combination — and the default for text-to-music vs cover?
14. Validation: which detector (SheetSage2 re-transcription, separation-based vocal energy, ASR), which thresholds, and is vocal separation acceptable now (the legacy user rejected it on 2026-09-17)?
15. Retry policy: seeds vs best-of-N at the ABC stage vs native loops; budget limits.

**LLM and resources**

16. LLM runtime: native `TextGenerate` only, llama.cpp as optional adapter, remote providers? Which default model fits 16 GB alongside YuE2/MiniMax without force-release hacks?
17. Which models may be resident simultaneously (LLM, YuE2, SheetSage2, ASR, separation, FLUX), and is multi-GPU (2× 16 GB on the user's machine) a supported configuration?
18. Model acquisition: rely on `properties.models` + ComfyUI(-Manager) flows; how to handle non-ComfyUI assets (ASR, separation, FlashSR)?

**Audio chain and delivery**

19. Which restoration/mastering stages have measured benefit for YuE2 (48 kHz) and MiniMax (44.1/32 kHz) output and remain in the default path? FlashSR at all?
20. One export service with naming/tagging/cover embedding — which formats and tag writer (licence)?
21. Provenance/record schema: what is recorded (native YuE2 artefacts such as score, seeds, model identities, LoRAs), and is "reproduce from record" a feature?

**UX and platform**

22. Primary surface: subgraph blueprints + App Mode, or custom node UIs? Which widgets must be custom (score editor, EQ) and how do they coexist with promoted widgets/App Mode (not documented for custom widgets)?
23. Frontend technology for editors (plain DOM vs bundled Vue), and dependency on non-public frontend APIs.
24. Localisation (English + German UI via `locales/`)?
25. Batch semantics (list fan-out, variants per brief, per-song seeds) in a subgraph-based design.
26. Test strategy: which real-model regression runs on the target GPU are required per phase, and how are listening checks recorded?
27. Registry identity: new package name/publisher, node ID prefix, versioning policy.

---

## Appendix A — Sources (retrieved 2026-09-24)

Upstream / primary:

- YuE repository (YuE2), `main` @ `09a1e8a85b`: <https://github.com/multimodal-art-projection/YuE> — `docs/generation.md`, `docs/covers.md`, `docs/editing.md`, `skills/yue2-music/SKILL.md`, `references/models-and-setup.md`, `references/listening-and-evaluation.md`, `examples/song.json`
- YuE issues #172, #193, #112, #18: <https://github.com/multimodal-art-projection/YuE/issues/172>
- YuE2-3B model card and licence: <https://huggingface.co/m-a-p/YuE2-3B> (discussions #1, #4, #5, #8, #9, #10, #11, #13, #21)
- SheetSage2 model card: <https://huggingface.co/m-a-p/SheetSage2>
- Comfy-Org mirrors: <https://huggingface.co/Comfy-Org/YuE2>, <https://huggingface.co/Comfy-Org/MiniMax-Music-3>
- MiniMax-Music3 model card and licence: <https://huggingface.co/MiniMaxAI/MiniMax-Music3>
- Qwen3-ASR-1.7B: <https://huggingface.co/Qwen/Qwen3-ASR-1.7B>
- Comfy-Org workflow templates: `audio_yue2_text2music.json`, `audio_yue2_music_cover.json`, `audio_minimax_music_3.json` in <https://github.com/Comfy-Org/workflow_templates>
- ComfyUI frontend extension docs: <https://github.com/Comfy-Org/ComfyUI_frontend/tree/main/docs/extensions> (widgets, serialization, node-id migration, recipe book); PR #17759 (secure V2 extensions)
- ComfyUI docs: subgraphs <https://docs.comfy.org/interface/features/subgraph>, subgraph blueprints for custom nodes <https://docs.comfy.org/custom-nodes/subgraph_blueprints>, App Mode <https://docs.comfy.org/interface/app-mode>, V3 migration <https://docs.comfy.org/custom-nodes/v3_migration>, node help pages <https://docs.comfy.org/custom-nodes/help_page>
- Releases: ComfyUI core v0.37.0 (2026-09-21), frontend v1.55.11 / v1.54.7 / v1.53.7 (GitHub API)
- abcjs 6.7.1 package source (npm) and docs <https://docs.abcjs.net/visual/dragging.html>; Verovio input formats <https://book.verovio.org/toolkit-reference/input-formats.html>

Community / third-party:

- Instrumental LoRA: <https://huggingface.co/Mothersuperior/YuE2-instrumental-cot-full-loras>; other LoRAs via HF search (`monsterovich/yue2-industrial-rock-lora`, `Mothersuperior/YuE2-hum-to-song`, …)
- YuE2 ComfyUI node pack: <https://github.com/pytraveler/YuE2-ComfyUI> (README v0.9.0)
- PyPI metadata for pyloudnorm, pedalboard, matchering, soxr, audio-separator, demucs, faster-whisper, qwen-asr, llama-cpp-python, mutagen, soundfile, imageio-ffmpeg, music21, symusic

Local:

- Legacy repository (read-only), user's ComfyUI `D:\Daten2\ComfyUI` (source and bundled blueprints/templates).

## Appendix B — Verification log

| Check | Command/Method | Result |
|---|---|---|
| Legacy unit tests | `python -m unittest discover -s tests` on scratch copy (no bytecode writes) | 1 337 tests OK, 1 skipped, 129.5 s |
| Frontend tests | `node tests/*.mjs` (Node 22.21.0) | 9/9 OK (Playwright variants self-skip) |
| Release validator | `python scripts/validate_release.py` on scratch copy | "Release validation OK" |
| Node inventory | entry point loaded through `tests/_toolkit_bootstrap.py` | 55 nodes; per-node inputs/outputs/usage |
| Workflow graphs | JSON link analysis | main 68/183/11 groups, 420 widget values; enhance 26/34/6 |
| Native YuE2/SheetSage2/MiniMax/TextGenerate/loops/NodeReplace | read `comfy_extras/*`, `comfy/*`, `comfy_api/latest/_io.py`, `app/*` | as cited |
| LoRA key mapping | `comfy/lora.py:97-106`, `supported_models.py:2317` | generic `text_encoders.*` mapping applies to YuE2 TE (runtime unverified) |
| abcjs accidental semantics | `abcjs 6.7.1 src/synth/abc_midi_flattener.js:640-664` | per-pitch (octave-specific) propagation |

## Appendix C — Stored values vs defaults vs upstream **[VF]**

| Setting | Node default | Shipped workflow | Upstream / native | Note |
|---|---|---|---|---|
| Song model | `YuE2` (`MusicProductionControl`) | `YuE2` | — | `model_profiles.json` default is `minimax_music3`; `MiniMaxMusicModelProfile` default is the first display name. |
| YuE2 steps | 32 | **40** | 32 (native template, upstream preset) | |
| YuE2 mode (text) | `full` | `full` | `full` default for new songs | ok |
| Cover transcription/generation mode | `full` | `full` | **`melody` recommended for covers** | |
| YuE2 checkpoint | `yue2_3b_bf16` (STRING) | same | templates: `yue2_3b_int8_convrot` | no combo validation |
| `max_duration` / `yue2_max_duration` | 300 / 360 | 300 / 360 | native 360 (max 900) | two ceilings |
| `trim_long_prompt` | true | **false** | — | |
| `workflow_name` (JSON node) | derived "Music Production Toolkit 3.1.3" | **"YuE2 Cover / YuE2 / Music Production Toolkit 3.1.1"** | — | stale |
| Artifact reduction | on | on | — | labelled experimental |
| LLM thinking / max_tokens | off / 24 576 | **on** / 24 576 | — | |
| Cover lyrics mode | instrumental | instrumental | — | user decision 2026-09-18 |

## Appendix D — Legacy decisions to carry into Phase 1B as context

- User decision (2026-09-17): for instrumental covers **only prompt/ABC corrections, no vocal separation**. Must be re-confirmed for Plenio. **[RE]**
- User decision (2026-09-18): default cover lyrics mode `instrumental`. **[RE]**
- Release rule: published Registry versions are immutable. **[RE]**
- Privacy rule: no local paths, private IPs, personal prompt text or credentials in public artefacts. **[RE]**
- Hardware: Windows 11, 64 GB RAM, 2× RTX 5060 Ti 16 GB (ComfyUI sees one GPU unless configured). **[RE]**
  - *Correction 2026-09-25 (Phase 2, measured by the System Check and `nvidia-smi`):* the host currently exposes **one** RTX 5060 Ti 16 GB and **32 GB** RAM. Designs keep the 16 GB single-GPU case as the reference.
