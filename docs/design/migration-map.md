# Old → New Migration Map (package item C)

| | |
|---|---|
| Status | Phase 1B design baseline |
| Date | 2026-09-25 |
| Legacy | `ComfyUI-MiniMax-Music-Production-Toolkit` v3.1.3 (read-only), analysed in [current-system-analysis.md](current-system-analysis.md) |
| Target | [target-architecture.md](target-architecture.md) |

Classification: **Keep** (port the idea/code with tests) · **Generalize** (keep the capability, widen or clean its contract) · **Replace** (native ComfyUI, a subgraph, or a standard library — named in the column) · **Merge** (into another Plenio component) · **Split** (into several clear components) · **Remove** (not carried over).

Nothing is migrated by copying legacy modules wholesale; "Keep" means the behaviour is re-implemented or ported deliberately into `plenio.core` with tests and provenance notes.

---

## 1. Nodes: control, settings, generation

| Legacy component | Problem | New solution | Class |
|---|---|---|---|
| `MusicProductionControl` | model choice + 4 stage switches in one node; default contradicts profile file; all engines in one graph | model chosen by the path template (D-01); optional stages are bypassable blocks | **Replace** (templates + native bypass) |
| `MiniMaxMusicModelProfile` | profile JSON over STRING wires | `core.engines.*` + `PLENIO_ENGINE` from Engine Profile | **Replace** |
| `model_profiles.py/.json` | data file drives nodes via JSON-in-STRING | engine rules modules with typed profiles | **Generalize** |
| `MiniMaxMusicModelSettings` | both engines' settings on one node, duplicated durations | native sampler widgets inside engine Render blueprints; duration from Song Sheet/Brief | **Split** → blueprints |
| `MiniMaxMusic3GenerationSettings`, `FlashSRProcessingSettings` | legacy-only | — | **Remove** |
| `MusicGeneration` | graph expansion hides ABC, sampler, decoder; checkpoint names as free STRINGs | `Plenio · YuE2 Plan/Render`, `Plenio · MiniMax Render` blueprints of native nodes | **Replace** (subgraphs) |
| `MusicGenerationReceipt` | separate receipt node | release record built by Export from the executed graph + reports | **Merge** → Export |
| `KSamplerWithConfig` | wrapper to return sampler names; retry logic for 0.35 issues | native `KSampler`; parameters recorded from the prompt | **Replace** (native) |
| `MiniMaxSafeAudioDecode` | custom decode + retry | native `VAEDecodeAudio` / `VAEDecodeAudioTiled` | **Replace** (native) |
| `runtime_safety.py` | mutates global ComfyUI args for 0.35-era graphs | — (re-test only if a real problem reappears) | **Remove** |
| `MiniMaxInstrumentalVocalCheck` | Whisper word count on the full mix | Check Vocals with calibrated detectors | **Replace** |
| `MiniMaxInstrumentalPick` | expansion-driven lazy retries, hidden | native loop (Takes) + Check Vocals list input | **Replace** (native + Merge) |

## 2. Nodes: cover

| Legacy component | Problem | New solution | Class |
|---|---|---|---|
| `MusicCoverSource` | custom file combo; mode default `full`; lyrics mode + lead instrument mixed into source | native `LoadAudio` + **Cover Brief** (vocals, harmony) | **Split** |
| `MusicCoverTranscription` | expansion wrapper around SheetSage2 | `Plenio · Transcribe Score` blueprint: native SheetSage2 loader + `PlenioTranscribeScore` (native `events_to_abc`, always full, plus the beat grid — Phase 4A) | **Replace** (subgraph + thin node) |
| `MusicCoverScore` / `cover_score.py` | regex block surgery next to a real parser; score rewritten up to three times | Score Tools on top of the upstream parser, applied once before the score sheet | **Generalize** |
| `MusicCoverLyrics` / `whisper_lyrics.py` / `whisper_worker.py` | Whisper on the mix; sticky CPU fallback; engine tied to one node | Transcribe Lyrics: faster-whisper large-v3 (D-04, decided in Phase 4A), VAD off, `temperature=0`, on-disk cache, per-call CPU fallback, worker protocol kept | **Generalize** (worker idea **Keep**) |
| `YuE2CoverStudioPlan/Transform/Apply`, `cover_profiles.py`, `cover_planner.py`, `resources/yue2/*` | 11-knob slider verbalised for an LLM that rewrites ABC; two LLM calls on every run | deterministic Score Tools + human editing in the Song Sheet; LLM ABC rewriting not carried over | **Remove** (deterministic parts → **Merge** into Score Tools) |
| `cover_transform.py` (transpose, tempo) | good deterministic ops inside the studio | Score Tools operations | **Keep** |
| `MiniMaxStyleHint` | exists only to avoid a cycle | style comes from the Cover Brief | **Remove** |
| `cover_conditioning.py` | regex vocabulary compiler for instrumental style | instrumental strategy (concise positive style, validation) | **Remove** (replaced by strategy) |
| `cover_alignment.py` | lossless placement of ASR words into ABC sections | `core.lyrics.align` — same lossless principle, now on the SheetSage2 beat grid with the pickup rule (Phase 4A: 99.4–100 % section accuracy) | **Keep** (improved) |
| `cover_lyrics_contract.py` | lyrics rules enforced in four places | rules in `core.sheet`/`core.lyrics`, enforced once at the Song Sheet | **Merge** |
| `lyrics_fit.py` | useful syllable-fit hints | `core.lyrics.fit_report` for the editor | **Keep** |
| `abc_validate.py` | wrapper around the vendored parser | `core.score.validate/analyze` | **Merge** |
| `third_party/yue2_abc.py` | — (strength) | `plenio/third_party/yue2_abc_tools.py`, unchanged, pinned | **Keep** |
| `song_duration.py` | injects "Target duration" prose into Style | length influences writing; ceiling from score/brief | **Replace** |

## 3. Nodes: prompting and LLM

| Legacy component | Problem | New solution | Class |
|---|---|---|---|
| `MiniMaxStructuredPromptV20` | brief + system prompt + cover context + model mismatch warnings in one node | **Song Brief** (intent) + Compose (engine rules) + Song Sheet (final text) | **Split** |
| `MiniMaxParseExternalLLMOutputV16` | parser, budget, cover rules, duration, seeds and list fan-out in one node | Parse Song Draft (parse + enforcement); budget at Song Sheet; seeds native; batches via native queue | **Split** |
| `MiniMaxLLMTemplateV16`, `MiniMaxPromptSourceArtworkV16`, `MiniMaxPromptBatchLoader` | legacy prompt sources | template library in Song Brief; batches via queue/loop | **Remove** / **Merge** |
| `prompt_library.py`, `prompt_metadata.py`, `prompt_sources.py`, `prompt_routes.py` | strong safety rules; writes into the package directory | `core.brief.TemplateLibrary` + `/plenio/templates` (user directory for writes) | **Generalize** |
| `prompts/user/*` (239 templates) | MiniMax-oriented descriptions; front matter | re-validated brief templates (fields + target style); engine-neutral | **Keep** (content, curated) |
| `prompts/system/*` (24 prompts, 2.4–3.9 k words) | near-duplicate variants; YuE2 prose rules contradict upstream | `resources/writing/` rule texts per engine, composed by Compose; one variant set | **Replace** |
| `prompt_budget.py` (MiniMax tokenizer read) | estimate for YuE2 | exact counts via the loaded CLIP tokenizer for both engines | **Generalize** |
| `MiniMaxPromptReport` | MiniMax-specific report node | Song Sheet shows exactly what is sent; record stores it | **Remove** |
| `MiniMaxLLMChat` (+ `llm_sampling`, `llm_profiles`) | llama.cpp outside ComfyUI memory management; 31 widgets ×3 | native `TextGenerate` inside *Write Song* (D-03) | **Replace** (native) |
| `MiniMaxLLMSettings` / `llm_config.py` | central copy of widgets merged "field by field" | one writer model input on the *Write Song* block | **Remove** |
| `MiniMaxLLMUnload`, `comfy_resources.py` | force-release of ComfyUI internals | not needed with managed models | **Remove** |
| `MiniMaxLLMSessionId`, `session_utils.py` | legacy cache buster | — | **Remove** |
| `llm_providers.py`, `llm_provider_routes.py`, `web/llm_provider*.js` | provider adapters and key storage in the toolkit | swap `TextGenerate` for any third-party LLM node | **Remove** |

## 4. Nodes: audio restoration and mastering

| Legacy component | Problem | New solution | Class |
|---|---|---|---|
| `AudioDeclipRepair` | value unmeasured for current engines | candidate operation of the conditional Audio Repair node (Phase 7 gate) | **Keep** (conditional) |
| `FlashSRLowpassLab` | FlashSR-specific naming | filter operation (conditional Repair) or not needed | **Generalize** (conditional) |
| `MiniMaxFlashSRAudio` + `flashsr_inference/` | vendored code without root licence; YuE2 is already 48 kHz | not bundled; users may add a separate SR custom node | **Remove** |
| `FlashSRHybridCrossover` | tied to FlashSR | — (only with an external SR node, not in core) | **Remove** |
| `HFCymbalShimmerRepair` | experimental | candidate operation of conditional Repair | **Keep** (conditional) |
| `AudioArtifactReduction` | experimental, default on | candidate operation of conditional Repair, default off | **Keep** (conditional) |
| `MiniMaxAudioBranchSelect`, `MusicOptionalStage` | custom gates with 8 positional report slots | native bypass / `ComfySwitchNode`; reports via Autogrow | **Replace** (native) |
| `MiniMaxAutoEQAnalyze` + `MiniMaxParametricEQ` + `eq_config.py` + `audio_auto_eq.py` + `audio_eq.py` | two nodes; presets duplicated in JS | one **EQ** node (manual / match reference / tone target); presets via route | **Merge** |
| `MiniMaxMasteringCompressor` + `audio_compressor.py` + `audio_limiter.py` + `audio_mastering.py` | good DSP | **Loudness & Dynamics** node | **Keep** |
| `AudioReleasePrep` | overlaps mastering; FFmpeg meter via stderr | merged into Loudness & Dynamics (own BS.1770 meter) | **Merge** |
| `audio_analysis.py` (FFmpeg loudnorm meter) | stderr scraping | own BS.1770 implementation, `pyloudnorm` as test oracle | **Replace** |
| `audio_utils.py`, `audio_dsp_utils.py` (validation, Kaiser resampler) | duplicated policies | `core.audio` helpers, one resampler | **Generalize** |
| `mastering_presets.py/.json`, `web/eq_presets.json` | duplicated in Python and JS | `resources/presets/*.json`, served by route | **Merge** |

## 5. Nodes: delivery, metadata, artwork, models, utilities

| Legacy component | Problem | New solution | Class |
|---|---|---|---|
| `SaveAudioSmartPrefix`, `SaveAudioAbsolutePath`, `SaveImageSmartPrefix` | three savers + JSON writer coordinate by passing paths | one **Export Release** node | **Merge** |
| `MiniMaxSaveProductionJSON` (56 inputs), `production_metadata.py`, `metadata_schema.py` | socket explosion | record from hidden `prompt` + Autogrow reports; versioned schema | **Replace** / **Generalize** (schema policy) |
| `MiniMaxSongMetadata`, `MiniMaxMetadataLoader` | legacy formats | (later: "reproduce from record" if requested) | **Remove** |
| `MiniMaxStandardAudioTags`, `audio_tags.py`, `audio_tag_copy.py` (`MiniMaxAudioTagReader`) | separate nodes | tags on Export; tag copy option for the Enhance template | **Merge** |
| `ffmpeg_utils.py`, `imageio-ffmpeg` | FFmpeg binary dependency | PyAV (host dependency) for encoding | **Replace** (library) |
| `filename_utils.py`, `output_paths.py`, `file_writes.py` | good rules (Unicode, Windows names, atomic writes) | `core.release` | **Keep** |
| `MiniMaxOutputPaths` | node for five prefixes | naming/folder pattern on Export | **Merge** |
| `MiniMaxSquareImageSize`, `MiniMaxCoverControl`, `MusicOptionalCoverPreview` | helper/gate nodes | native primitives, `PreviewImage`, bypass | **Replace** (native) |
| FLUX.2 artwork nodes in the main graph | fine, but mixed into the mega graph | `Plenio · Cover Art` blueprint (optional block) | **Replace** (subgraph) |
| `MiniMaxModelAutodownload`, `model_downloader.py`, `models_config.json`, `model_manager_routes.py` | custom catalogue for ComfyUI-format files; eight switches | `properties.models` in templates; `core.assets` only for non-ComfyUI assets | **Replace** (native) / **Generalize** |
| `MiniMaxModelAdvisor`, `resource_profiles.py`, `capabilities.py` | advisor inside the production graph | System Check node + template | **Generalize** |
| `ui_help.py` (86 kB), `audio_tools_help.py` | central tooltip injection | tooltips in schemas + `locales/en` + `web/docs` | **Replace** |
| `toolkit_logging.py`, `progress_utils.py` | custom progress helpers | standard logging + native `ProgressBar`/`model_trange` | **Replace** (native) |

## 6. Frontend

| Legacy module | Problem | New solution | Class |
|---|---|---|---|
| `structured_prompt.js`, `prompt_library.js`, `prompt_ui_utils.js`, `prompt_api.js`, `style_hint.js`, `song_model*.js` | dynamic combos, prefill, model-dependent prompt swap | Song Brief template prefill via the Plenio extension; no model swapping | **Replace** |
| `llm_provider.js`, `llm_provider_ui.js` | provider UI | — | **Remove** |
| `audio_eq.js`, `eq_dsp.js`, `eq_presets.js`, `auto_eq_presets.js` | canvas EQ editor with monkey-patched callbacks | EQ curve widget in the bundled frontend, documented APIs | **Generalize** |
| `mastering_presets.js`, `mastering_preset_utils.js`, `preset_sync.js` | presets duplicated in JS | presets from route; widget values set through documented APIs | **Replace** |
| `workflow_migration.js`, `migration_utils.js` | positional widget repair | not needed (clean break); future migrations via `io.NodeReplace` | **Remove** |
| `prompt_report_preview.js`, `model_advisor_preview.js` | internal `window.comfyAPI.textPreviewWidgets` | node UI text via `NodeOutput(ui=…)` | **Replace** |
| `web/docs/*.md` (55) | per-node pages for 55 nodes | per-node pages for the 14 core nodes (Phase 4A added Transcribe Score) | **Generalize** |

## 7. Workflows, resources, tooling, tests, docs

| Legacy item | Problem | New solution | Class |
|---|---|---|---|
| `Music_Production_Toolkit.json` (68 nodes) | mega workflow | three path templates + System Check | **Replace** |
| `Music_Production_AudioEnhance.json` | fine concept | *Enhance & Master* template | **Keep** (concept) |
| `widgets_values_named` workflow field | non-native duplicate serialisation | — | **Remove** |
| `scripts/validate_release.py`, `workflow_schema.py`, `build_public_workflow.py` | valuable checks, tied to legacy graph | template/blueprint validator tests; release tool | **Generalize** |
| `scripts/benchmark_toolkit.py` | good measurement culture | DSP regression + smoke timing reports | **Keep** (idea) |
| `scripts/*demo*`, `docs/index.html`, demo covers | GitHub Pages demo | outside the node package (separate site if wanted) | **Remove** (from package) |
| `tests/*` (1 337) | structural, mocked | new test layers ([testing-strategy.md](testing-strategy.md)); legacy tests serve as a checklist of edge cases | **Replace** |
| `docs/KONTEXT.md`, `PROJECT_STATE.md`, `IMPROVE-TODO.md`, `REFACTOR-PLAN.md` | very long hand-off logs | ADRs + design docs + changelog | **Replace** |
| `docs/references/*` (upstream snapshots) | useful | kept as referenced sources in `docs/design` appendices (links + hashes) | **Keep** |
| `TROUBLESHOOTING.md`, `INSTALLATION.md` | valuable knowledge, legacy-specific | rewritten user docs; lessons recorded in ADRs | **Generalize** |
| `.scratch/`, `dist/` | local artefacts | — | **Remove** |

## 8. Lessons carried over (not code)

| Lesson | Where it lives now |
|---|---|
| positional widget order breaks saved workflows | V3 schemas, named inputs, contract tests; no reordering after release |
| subgraph boundary links are real endpoints | template validator uses the native format |
| never infer final file names before collision handling | Export plans and writes atomically in one node |
| native LLM/CUDA crashes need process isolation | worker protocol for non-ComfyUI engines |
| verbose style text can be sung by YuE2 | concise-style rules and validation |
| empty-lyrics alone is not an instrumental guarantee | defense-in-depth strategy with measurement |
| registry versions are immutable | release process in `docs/dev/release.md` |
| no private paths/IPs/secrets in public artefacts | template leak scan, record redaction |
