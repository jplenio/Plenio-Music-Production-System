# Next Release Plan (Plenio 0.3.0) — Phase 11A

| | |
|---|---|
| Status | Design Phase 11A (2026-09-27); **Phase 11B implemented** (OPUS-CRITICAL O1-O7, §17); Phase 11C (milestones M1-M7 in §16.2): **M1-M5 done**, M6-M7 not started. |
| Date | 2026-09-27 |
| Baseline | Plenio 0.2.2 (`main` at `eaaa174`), ComfyUI 0.37.0, frontend 1.52.7 (cloud) / 1.53.6 (owner) |
| Scope | audio refinement / super-resolution, EQ UX, optional stems before mastering, authoritative manual lyrics, Song Brief template precedence, a shared canonical score engine with a YuE2 · DAW workflow and graphical Review editing |
| Related | [target-architecture.md](target-architecture.md) (rules R1–R12) · [score-editor-design.md](score-editor-design.md) (§15 = the editor this plan extends) · [yue2-design.md](yue2-design.md) · [testing-strategy.md](testing-strategy.md) · [CURRENT_STATUS.md](CURRENT_STATUS.md) |

---

## 0. Decisions on one page

| # | Requirement | Decision |
|---|---|---|
| 1 | Audio super-resolution | One reusable **Refine (48 kHz)** stage: pure-DSP core (pre-filter, complementary crossover, post roll-off, level/length contract) plus an optional model engine behind one engine protocol. **UniverSR** (MIT code, CC-BY-4.0 weights, 4 flow-matching steps, vocoder-free) is the first engine to integrate; **FlashSR** is re-evaluated in an A/B study through the legacy toolkit node that is already installed on the owner's machine and is integrated only if it wins. The legacy PRE 12 kHz / "add air" / POST 19 kHz values are *provisional baselines*, not defaults, until the study (§4.5) decides. MiniMax: stage **on**; YuE2 / YuE2 Cover / DAW / Enhance: **bypassed**. |
| 2 | EQ UX | Same node, same `plenio.eq/1` bands; a larger direct-manipulation curve with a band strip, band types, per-band enable, before/after spectrum and "edit this proposal"; the raw JSON leaves the default view (§5). |
| 3 | Stems | Optional **Stems** blueprint before mastering, bypassed and collapsed by default: *Load Audio Model* → *Separate Stems* (4-stem BS-RoFormer, MIT weights trained on MUSDB18-HQ) → *Stem Mixer* (gain, mute/solo, compression, muted time ranges, one reverb bus, one delay bus). **Residual invariant:** stems + residual = input, so a neutral mixer returns the input unchanged (§6). |
| 4 | Manual lyrics | No new mechanism: the Song Sheet's `manual` state *is* the authority (R4). Add first-class UX ("Use my own lyrics" before the first run, in App mode, in every song template) and tests that pin "never overwritten" across draft seeds, batch mode, template and brief changes (§7). |
| 5 | Template precedence | Stateless rule for text fields: **typed value > template value > empty**. Template values appear as ghost text in empty fields and are never written into widgets; choice fields stay explicit with a one-click "use template choices". The legacy sentinel `custom` (it enters via App mode *Reuse parameters* of old toolkit jobs) is normalised to empty with a note (§8). |
| 6 | Score engine / DAW | **One canonical score model** in `plenio.core.score` (sounding notes with integer onsets/durations in `L` units, chord symbols, key/meter timelines, sections, layout) with an exact parser and a deterministic serializer to the **native YuE2 two-voice dialect**. The ABC text stays the persisted document (it is what YuE2 tokenizes verbatim); the model is never stored separately. Guarantees: text identity for untouched text, round trip for every model, locality of edits, validity of every committed result (§9). |
| 6a | Tracks | **YuE2 reads two monophonic voices plus chord symbols.** DAW tracks: *Vocal* → `V: Vocal`, *Instrument* → `V: Ins`, *Chords* → chord symbols, *Guide* → never sent to YuE2 (playback and MIDI only, clearly labelled). No pretence of four conditioning tracks (§10.1). |
| 6b | Editing | Deletion leaves a rest of the same duration (default); "delete and close gap" extends the preceding adjacent note only on explicit request. Insert/move/resize use overwrite semantics inside a voice. Every edit is checked by the upstream parser before it is committed (§9.6). |
| 6c | Editor | The existing Song Sheet score editor gains a piano roll, chord lane, inspector and MIDI import/export; the **same editor** serves Review (all song templates) and the new **5 · YuE2 · DAW** template. Raw ABC becomes an "advanced" synchronized view (§9.8, §10). |
| 7 | UX invariant | Existing templates keep their controls and defaults; new stages are bypassed/collapsed until used; 4 new nodes in total (§12). |

---

## 1. Baseline (verified in code on 2026-09-27)

| Area | Fact | Where |
|---|---|---|
| YuE2 output | VAE decodes at **48 kHz** (`audio_sample_rate = 48000` for the YuE2 Oobleck VAE) | ComfyUI 0.37.0 `comfy/sd.py` |
| MiniMax Music 3 output | DAV decoder at **44.1 kHz nominal** (default `audio_sample_rate = 44100`, no override for the DAV). The useful bandwidth is lower: the legacy chain treated 12–16 kHz as damaged and regenerated above ~14.5 kHz, i.e. a ~32-kHz-class signal. **Measure on unmastered takes before choosing defaults** (task L1). | `comfy/sd.py`, legacy `audio_lowpass.py`, `audio_hf_repair.py` |
| Legacy SR chain | PRE low-pass 12 kHz (Butterworth order 2, zero-phase) → FlashSR (48 kHz, 5.12 s chunks, 0.5 s overlap, Hann OLA) → *Original + FlashSR air* (original resampled to 48 kHz + 0.35 × FlashSR high-passed at 14.5 kHz, 2 kHz transition, linear-phase FIR) → HF cymbal/shimmer repair → POST low-pass 19 kHz (order 2, causal) | legacy `flashsr_audio.py`, `audio_hf_repair.py`, `audio_lowpass.py` |
| Native audio nodes | Load/Save/Preview, Trim, Split/Join channels, Concat, Merge, Adjust Volume, Equalizer3Band, VAE encode/decode. **No separation and no super-resolution node in core.** | `comfy_extras/nodes_audio.py` |
| YuE2 score input | `YuE2GenerateMusic` tokenizes the `abc` string **verbatim** (`tokenizer.encode(abc)`) and inserts it as the model's chain-of-thought; `full` = chord-annotated, `melody` = no chord symbols; an empty `abc` switches to `off` | `comfy_extras/nodes_yue2.py`, `comfy/text_encoders/yue2.py` |
| Score dialect | defined by the vendored upstream parser (fail-closed); Plenio's score engine: text-canonical, element view, deterministic operations that keep untouched bars byte-identical, `display_abc` for abcjs | `plenio/third_party/yue2_abc_tools.py`, `plenio/core/score/` |
| Delete note today | `note_to_rest` replaces a note (whole tie chain) by rests; `set_duration` lengthens only into following rests and fills with a rest when shortening | `plenio/core/score/edit.py` |
| Song Sheet | documents `auto` / `edited` / `manual`; manual text is used and the upstream draft is not even evaluated (lazy inputs); strict `plenio.sheet_state/1` (unknown fields rejected) | `plenio/core/sheet/` |
| Song Brief | text fields: an empty field takes the template value at execution; choice fields (`length`, `vocals`, `melody`) always carry a widget value, so a template's length never applies from the UI | `plenio/core/brief.py` |
| `custom` in briefs | all 129 owner records of 0.2.2 carry `key: "custom", meter: "custom"`; the legacy toolkit's structured prompt node used `custom` = "let the LLM decide" for `key`/`meter`; ComfyUI's *Reuse parameters* copies inputs by name (the same path that brought `2-3 minutes` into 0.2.2) | owner records, legacy `prompt_metadata.py` |
| EQ | 360×150 SVG curve under the node; drag/wheel/double-click editing; bands live in the visible multiline `mode.bands` JSON widget | `frontend/src/extension/eqWidget.ts`, `plenio/comfy/nodes/eq.py` |

---

## 2. Principles for this release

- **R1–R12 stay binding** ([target-architecture.md §2](target-architecture.md)). In particular: native first, one owner per setting, manual text wins, WYSIWYG after the Song Sheet, no silent degradation, ComfyUI owns GPU memory, pure core, documented frontend APIs only, deterministic defaults.
- **UX invariant.** A user who never touches the new features sees the same templates, the same App-mode forms and the same results as in 0.2.2 — except MiniMax, whose Refine stage is on by design (§4.6).
- **No second source of truth.** Lyrics: the Song Sheet document. Score: the Song Sheet's ABC text, edited only through the canonical engine. EQ bands: the node's `mode.bands` value. Mixer: the mixer widget value. Brief: the widget values.
- **Optional means optional.** Model code is imported lazily; model files come through the catalogue and ComfyUI's missing-model dialog; bypassed blocks need no files.
- **Honesty about the cloud.** Audio quality, SR, separation and GPU timings are validated on the owner's machine (§15); cloud tests use fake engines.

---

## 3. Architecture overview

```text
Song Brief ─► Write Song ─► Song Sheet · Text ─┐                    (templates 1, 3, 5; cover: Cover Brief …)
                                               ▼
                 (YuE2 Plan | SheetSage2 | new score from brief) ─► Song Sheet · Score  ◄─ one score editor:
                                                                     │                   staff · piano roll ·
                                                                     │                   chord lane · ABC (advanced)
                                                                     ▼
                         YuE2 / MiniMax render ─► [Stems (optional)] ─► [Refine 48 kHz] ─► Plenio · Master ─► Export
                                                   bypassed by default   MiniMax: on          EQ (new UX),
                                                                         others: bypassed     Loudness
```

Core modules (pure, `plenio.core`): `score.canonical` (model, parser, serializer), `score.ops` (edit algebra), `score.midi` (SMF), `score.skeleton` (new score from brief facts), `audio.refine` (SR DSP and chunking), `audio.stems` (stem container, residual, mixer), `audio.effects` (reverb, delay), `brief` (precedence and legacy normalisation).

ComfyUI layer (`plenio.comfy`): nodes *Load Audio Model*, *Refine*, *Separate Stems*, *Stem Mixer*; engine adapters (UniverSR; FlashSR only if chosen; BS-RoFormer) that wrap vendored inference code and ComfyUI model management.

---

## 4. Audio refinement / super-resolution

### 4.1 What the stage must do

Take a rendered song (44.1 kHz MiniMax, 48 kHz YuE2, any file in Enhance), return **48 kHz** audio of the same length, extend the missing top octave only where it helps, and never degrade the band the model already delivered. Deterministic (fixed seed, R12), reported (parameters, measured bandwidth before/after, engine, seed, timing), bypassable.

### 4.2 Candidates

| Candidate | How it works | Quality evidence | Speed / VRAM | Licence | Maintenance | ComfyUI integration |
|---|---|---|---|---|---|---|
| **Resample only** (Plenio Kaiser SRC) | band-limited SRC to 48 kHz, no new content | exact, no artefacts, no extension | trivial, CPU | own (Apache-2.0) | ours | exists (`core.audio.resample`) |
| **FlashSR** (Im & Nam 2025, arXiv 2501.10807) | one-step distilled latent diffusion + SR vocoder; any 4–32 kHz input → 48 kHz | competitive with AudioSR in the paper; **legacy use on MiniMax needed a PRE low-pass, a restrained blend (0.35 above 14.5 kHz), HF repair and a POST roll-off** to tame "artificial air" | paper: 0.36 s per 5.12 s on an A6000 (~22× faster than AudioSR); weights 3.2 GB (VAE 1.6 GB, LDM 0.99 GB, vocoder 0.6 GB) | inference code Apache-2.0 (FlashSR_Inference); weights on HF (LAION org) — **licence to be confirmed at integration** | research code; the vendored legacy copy is 261 files with librosa/soundfile/torchaudio/TorchJaekwon imports | none in core; the legacy toolkit node exists on the owner's machine |
| **UniverSR** (ICASSP 2026, arXiv 2510.00771) | flow matching on complex STFT coefficients, vocoder-free; 8/12/16/24 kHz → 48 kHz; 4 ODE steps by default; guidance 1.5–2.0 recommended for music | state of the art in the paper across speech, music and effects; no vocoder (fewer vocoder artefacts in principle) | not published; chunked long-audio inference supported — **measure** | code MIT; weights CC-BY-4.0 (attribution) | active small repo (pip package, fixes in 2025/26) | none; small package, vendorable |
| AudioSR (Liu et al. 2023) | 50-step latent diffusion, 2–16 kHz bandwidth → 48 kHz | good, widely cited | ~22× slower than FlashSR | code MIT | stable, old | — rejected (speed) |
| LatentFlowSR (arXiv 2604.09188, Apr 2026) | latent flow matching | promising | unknown | unknown | research | — watch only |
| Legacy HF cymbal/shimmer repair | dynamic HF attenuation | only needed to fix FlashSR artefacts | cheap | own legacy | — | — not ported unless the study shows the need (Phase 7 C1 decision stands) |

Name collision to avoid: the small *FlashSR* repository by ysharma3501 / YatharthS (16 → 48 kHz, speech-oriented) is a different model.

### 4.3 Chosen strategy

1. **One node, one pipeline** (replaces the legacy's four nodes): `Refine (48 kHz)` = measure input bandwidth → optional pre-filter → engine → complementary crossover with the original → optional post roll-off → length/level contract → report.
2. **Engine protocol** in the ComfyUI layer: `upsample(chunk[C, T] at engine rate, seed) -> chunk[C, T'] at 48 kHz`. Chunking, Hann overlap-add, resampling in/out and every filter are pure core (`plenio.core.audio.refine`) and fully testable with a fake engine.
3. **Engines:** `resample only` (built in) and `UniverSR` (first model engine). `FlashSR` joins only if it wins the study; the study uses the legacy toolkit's FlashSR node that is already installed side by side, so no FlashSR code has to be vendored to evaluate it. Refine's `engine` widget offers *model* (the connected Load Audio Model) and *resample only*; the `model` input is lazy, so with *resample only* the loader does not run and needs no file.
4. **Defaults are decided by measurement** (§4.5). Until then the parameters below are *provisional* and marked as such in the report.

### 4.4 Re-evaluating PRE, crossover and POST

| Stage | Legacy value | Why it existed | Re-evaluation | Provisional |
|---|---|---|---|---|
| PRE (engine input) | 12 kHz, Butterworth order 2, zero-phase | FlashSR regenerated more cleanly from a signal without MiniMax's noisy 12–16 kHz band | The engine input must look like the engine's *training condition*: a clean low-pass at a supported input bandwidth. UniverSR is trained for 8/12/16/24 kHz input rates only, so for a MiniMax edge around 16 kHz it receives the 24 kHz condition (steep low-pass at 12 kHz, resampled to 24 kHz) — the legacy 12 kHz value coincides with this condition. FlashSR takes free cut-offs; test: none / measured edge / 12 kHz. The PRE shapes only the engine's input, never the kept original. | UniverSR: its 24 kHz condition; FlashSR: steep low-pass at the measured edge |
| Blend | *Original + air*: original + 0.35 × SR high-passed at 14.5 kHz | keep all real content, add restrained air | Adding SR above 14.5 kHz on top of an original that still has content to ~16 kHz doubles that band. Test: *complementary replace* (LP(original) + HP(SR) with one linear-phase kernel pair that sums to a pure delay) vs legacy *add air*; crossover at edge − 0.5 kHz / edge − 1.5 kHz; SR gain 0.5 / 0.7 / 1.0. | complementary replace at edge − 0.5 kHz, gain 1.0 |
| POST roll-off | 19–20 kHz, Butterworth order 2, causal | tame harsh synthetic air | Keep as an option, linear-phase (the Kaiser FIR design already in `core.audio`). Test: none / 20 kHz / 19 kHz. | none |
| HF repair | cymbal/shimmer dynamic cut | FlashSR artefacts | only if the study shows fizz after the other stages | not ported |

Bandwidth measurement: the `tools/studies/restoration_gate.py` roll-off rule (highest frequency within 60 dB of the 1–4 kHz level), per song, reported; the stage refuses nothing but reports "input already full band — resample only" when the edge is above 20 kHz.

### 4.5 Measurement protocol (decides the defaults)

- **Material:** (a) *simulation set* — 12 full-band 48 kHz songs (6 YuE2 renders + 6 licensable recordings), low-passed at the measured MiniMax edge; (b) *target set* — 12 unmastered MiniMax takes (`(original).flac`).
- **Arms:** resample only · UniverSR · FlashSR (legacy node) × the PRE/blend/POST grid of §4.4 (pruned to ≤ 6 configurations per engine after a first objective pass).
- **Objective metrics** (`tools/studies/sr_study.py`, new): log-spectral distance 16–24 kHz against the reference (simulation set); HF "fizz" index (spectral flatness and envelope correlation of 16–24 kHz with 4–16 kHz); onset pre-echo; loudness change (must be < 0.1 LU); true peak; real-time factor and peak VRAM on the owner's GPU.
- **Listening:** blind A/B/X packs with `tools/studies/listening_pack.py`, owner verdicts on the target set.
- **Decision rule:** a model engine becomes the MiniMax default only if it is preferred over *resample only* in ≥ 70 % of blind trials on ≥ 10 takes and shows no metric regression; parameter defaults = best configuration of the winner. Otherwise MiniMax keeps Refine on with *resample only* and the model engines stay optional. The decision and its data go to `docs/test-reports/`.

### 4.6 Defaults per template

| Template | Refine | Engine (until L1 decides) | Why |
|---|---|---|---|
| 3 · MiniMax · Song | **on** | UniverSR (provisional; falls back to the L1 decision) | owner requirement; MiniMax is the band-limited source |
| 1 · YuE2 · Song, 2 · YuE2 · Cover, 5 · YuE2 · DAW | bypassed | — | YuE2 decodes at 48 kHz; switch on with Ctrl+B |
| 4 · Enhance & Master | bypassed | — | for band-limited uploads (old MP3s) |

Missing model with the stage on → actionable error with the download hint (R7); *resample only* is a visible engine choice, never a silent fallback. Bypassed blocks do not ask for model files.

---

## 5. EQ UX

The engine (`plenio.eq/1`, `core.audio.eq`) stays. The widget is redesigned:

| Element | Behaviour |
|---|---|
| Curve | ≥ 480×220, grows with the node; log 20 Hz–20 kHz; gain range toggle ±6 / ±12 / ±18 dB; the node's exact response (backend `/plenio/eq/response`, as now) |
| Spectrum | last run's long-term spectrum before (grey) and after (accent) behind the curve; the node sends 1/6-octave profiles in its UI payload (the fit already computes them) |
| Handles | numbered, coloured per band; drag = frequency + gain; **Shift = fine**; wheel / Alt-drag = Q; double-click empty = add bell; double-click handle = gain 0; Delete / right-click = remove; arrow keys for keyboard users |
| Band strip | one chip per band under the curve: `● 2 Bell 1.20 kHz +2.0 dB Q 1.0`; click = inline editor with type (bell, low/high shelf, low/high cut, notch), numeric fields, enable switch |
| Modes | *flat* · *manual* · *match*; a match proposal is shown read-only with **Edit these bands** (copies it into *manual*) |
| Toolbar | preset menu, undo/redo (widget-local), reset, bypass-compare of the curve (shows flat vs curve) |
| Advanced | the `mode.bands` JSON widget is hidden from the default view (still the stored value, R2) and reachable via *Advanced → bands as text* |

---

## 6. Stems before mastering

### 6.1 Separation choice

| Option | Stems | Quality (MUSDB18-HQ SDR) | Licence of weights | Verdict |
|---|---|---|---|---|
| **BS-RoFormer 4-stem** (ZFTurbo MSST checkpoint `model_bs_roformer_ep_17_sdr_9.6568`) | drums, bass, other, vocals | ≈ 9.66 average | **MIT** (trainer); trained on MUSDB18-HQ, whose dataset terms are research-oriented — the catalogue and records say so | **default candidate** |
| HT-Demucs (ft) | drums, bass, other, vocals | ≈ 9.0 | code MIT, **weights "scientific purposes only"** per the maintainer (facebookresearch/demucs#327; repo archived, continued at adefossez/demucs) | not shipped |
| Mel-Band RoFormer 2-stem (vocals / instrumental) | 2 | best-in-class vocals | varies per checkpoint — check each | optional second catalogue entry after a licence check |
| External custom nodes (kijai's MelBandRoFormer, audio-separation-nodes) | 2–4 | good | per model | not used: Plenio must not depend on other node packs; missing packs would turn bypassed template nodes red |

Integration: vendor MSST's MIT BS-RoFormer inference module (plus a small rotary-embedding helper) into `plenio/third_party/msst/` with a pinned hash, like `yue2_abc_tools.py`; `einops` ships with ComfyUI. Weights in `models/audio_separation/` through the model catalogue and the missing-model dialog. Inference at 44.1 kHz in chunks with overlap-add; ComfyUI model management (R9).

### 6.2 Contracts

- `PLENIO_STEMS`: `{rate, names[≤4], stems[≤4] (float32 [C,T] at the input rate), residual}`.
- **Residual invariant:** `residual = input − Σ stems` (after resampling the stems back to the input rate). Hence a *neutral* mixer (all gains 0 dB, nothing muted, no effects) returns the input sample-exactly (float32 rounding). Separation errors can only affect what the user changes.
- The residual is not a stem (the separator yields at most four); it is shown as one extra strip *rest* with gain and mute, so that a neutral mix is exact and nothing the separator missed is lost.

### 6.3 Mixer model (`plenio.stem_mix/1`, the Stem Mixer's widget value)

| Per stem | Range / rule |
|---|---|
| gain | −60 … +12 dB |
| mute / solo | solo beats mute; any solo mutes every non-soloed strip including *rest* |
| compression | *amount* 0–1 mapped to threshold/ratio of the existing `core.audio.dynamics` compressor (10 ms attack, 120 ms release); gain reduction reported, no automatic make-up |
| muted ranges | removes a stem's content in time ranges: list of `[start_s, end_s]`; merged, clipped to the song, 10 ms raised-cosine fades; the song keeps its length (cutting time out of the song is out of scope, it would misalign the stems) |
| reverb send | 0–1 to one shared reverb bus |
| delay send | 0–1 to one shared delay bus |

| Bus | Model |
|---|---|
| Reverb | convolution with a synthesised, seeded, decorrelated stereo IR (exponential decay, frequency-dependent damping, pre-delay); presets *room* (RT60 1.2 s), *plate* (1.6 s), *hall* (2.4 s) |
| Delay | stereo feedback delay; time in ms or a note value at a BPM field; feedback ≤ 0.8; low-pass in the loop |

Output length = input length (tails are cut with a 50 ms fade at the song end). Mixdown in float64, no normalisation; peaks are reported, Master sets the loudness.

### 6.4 UX

Blueprint **Plenio · Stems** (loader → separate → mixer), in a group *STEMS (optional)*, **bypassed and collapsed** in every template; bypass passes the audio through. The mixer widget shows 4 + 1 strips (fader, M/S, compression, sends) and per-stem mini waveforms from the last run, on which muted ranges are drawn and dragged. Separation is cached by ComfyUI, so mixer changes re-run only the mixer.

---

## 7. Authoritative manual lyrics

**Owner:** the Song Sheet that owns `lyrics` (R2, R4). No lyrics field anywhere else.

| Guarantee | Mechanism (exists) | New |
|---|---|---|
| manual lyrics are used verbatim | `manual` state, WYSIWYG (R5) | — |
| the writer never overwrites them | lazy input: the writer's lyrics output is not evaluated for a manual document | host test across draft seed changes, *new song every run*, template and brief changes |
| a changed draft never replaces an *edited* text | conflict stop | — |
| the approval covers the manual text | fingerprint of the resolved documents | — |

UX (all song templates: 1, 2, 3, 5; App mode through the sheet buttons):

- Lyrics tab shows **Use my own lyrics** before the first run and at any time: switches the document to *manual*, opens an empty (or pre-filled from the current draft) editor with section-tag helpers (`[Verse]`, `[Chorus]` …) and the engine's live checks.
- The node's canvas summary and the App-mode button line show `lyrics: yours (manual)`.
- When the lyrics are manual but title/style are drafted, the sheet adds an *info* finding: "Title and style were drafted from the brief, not from your lyrics." (The writer cannot read the sheet's manual text without a graph cycle; feeding it through a second lyrics field would create a parallel mechanism — rejected, §14.)
- Batch mode with manual lyrics: every run uses the same lyrics with new titles, styles and takes (documented).

---

## 8. Song Brief template precedence

### 8.1 Rule

| Field class | Fields | Effective value |
|---|---|---|
| text | description, genre, mood, tempo, key, meter, language, voice, theme, lead instrument | **typed value** if non-empty · else **template value** if the template defines it · else **empty** ("the writer decides") |
| choice | length, vocals, melody | always the widget value (explicit); the template's suggestion is shown as a hint |

Properties: stateless and deterministic; changing the template never writes into a widget, so user edits can never be destroyed; clearing a field returns it to the template value.

### 8.2 UX

- Empty text fields show the template value as **ghost text** `template: indie pop` (spike first: dynamic `placeholder` in canvas widgets, Vue nodes and App mode on 1.52.7 and 1.53.6; fallback: a compact "Template fills: …" line under the template selector).
- **Copy template text into fields** (explicit action): fills only empty fields with the template values, turning them into editable text (useful for editing a long description).
- **Use template choices** (explicit action, shown when they differ): sets length / vocals / melody to the template's values.
- **Reset all to template** (explicit, with confirmation): clears every typed text field.
- The summary after a run lists which fields came from the template (exists: `from_template`).

### 8.3 Legacy sentinel

`custom` (and the same with surrounding whitespace / any case) in a text field is the predecessor toolkit's "let the model decide"; it arrives through *Reuse parameters* of old jobs. `build_song_brief` / `build_cover_brief` treat it as empty and add the note "'custom' is the predecessor toolkit's placeholder; treated as empty". The frontend clears it from saved workflows on load. The writer never sees the word.

---

## 9. Canonical score engine

### 9.1 What YuE2 actually accepts

The native node tokenizes the ABC text **as written** (BPE ids of the exact string). Two consequences:

1. Formatting is conditioning: spaces, line layout, `% section` lines and accidental spellings all reach the model. The engine must write the **native serializer's style** and must not reformat text it did not change.
2. The accepted *language* is exactly what the upstream parser accepts (it is the upstream authority and fails closed).

### 9.2 Supported YuE2 ABC subset (the "native two-voice dialect")

| Part | Accepted form |
|---|---|
| Header (exactly 8 lines, no space after the colons) | `X:1` · `T:` (empty) · `M:<n>/<d>` (d power of two ≤ 1024) · `L:1/<2^k>` (≤ 1/1024; native plans usually write `1/32`, the upstream examples `1/16`) · `Q:1/4=<integer BPM>` · `V: Vocal clef=treble name="Vocal Melody" snm="Vocal"` · `V: Ins clef=treble name="Ins Melody" snm="Inst."` · `K:<key>` |
| Keys | 15 major (`Cb` … `C#`) and 15 minor (`Abm` … `A#m`) |
| Body | groups; each group: zero or more `% <label>` lines (only at the group start), then `V: Vocal`, optional `M:`/`K:` field lines (each at most once), one music line; then the same for `V: Ins` (a field change is written in both voices) |
| Music line | 1–4 measures (after expanding `Z2`…`Z4`), separated by `|`, ending with `|`; both voices of a group have the same number of measures; spaces inside and around measures are accepted (the native style writes none) |
| Tokens in a measure | chord symbol `"<chord>"` (**Vocal only**), inline key `[K:<key>]`, note = accidental (`^ ^^ _ __ =`)? letter (`A–G a–g`) octave marks (`,` or `'`, not mixed) duration (integer from {1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48} × L; the native style omits `1`, an explicit `1` is accepted) tie (`-`)?; rest `z<duration>` (no tie, accidental or octave); full-measure rest `Z`. Chord symbols and inline keys lie strictly inside a measure (one written at the bar line belongs to the next measure). |
| Chord symbols | root `A–G` with `b`/`#`/`bb`/`##`, quality ∈ {"", m, dim, aug, 7, maj7, m7, dim7, m7b5, sus4, sus2, 6, m6, 7sus4, m(maj7)}, optional `/bass` |
| Semantics | `C` = MIDI 60; accidentals apply by **letter across octaves** until the bar line or an inline key change; an unmarked tied continuation keeps the tied pitch; every measure sums exactly to its meter; both voices share the measure grid and the key-change timeline; ties must keep the pitch and must not enter rests; no tie at the end |
| Accepted, not canonical | a second chord symbol at the same onset, a key change repeated at one onset, a key change placed differently in the two voices, an explicit `1`, leading zeros in durations, spaces: parsed and **preserved verbatim** (S2); normalised only when their measure is rewritten by an edit, and the change log names it |
| Not supported (never produced, rejected on input) | tuplets, grace notes, notes sounding together within a voice, slurs, decorations, repeats and endings, `w:` lyrics, broken rhythm (`>`/`<`), inline `M:`/`Q:`, additional voices or header fields, blank lines |
| Measure length (added in Phase 11B) | every measure must be a **whole number of `L` units** (`n × L-denominator / d` integral). Measures that are not (e.g. `M:3/32` with `L:1/16`) lie **outside the subset**: the upstream parser accepts them only as full-measure rests (`Z`), because no note duration can fill them. `from_abc` rejects such a text with a located diagnostic; the score stays valid for YuE2 (Song Sheet validation is the upstream parser), but the editor offers text editing only (`model: null`, `model_error` in the view). |

Round-trip fidelity is promised **for this language only**. Any other ABC is rejected with the parser's precise message.

### 9.3 Canonical model (`plenio.core.score.canonical`)

```text
Score (immutable)
  tempo: int                         Q:1/4=<tempo>
  unit: Fraction                     L
  meters: tuple[(n, d)]              one per measure (grid shared by both voices)
  keys: tuple[KeyChange(onset, key, placement)]   onset in units; placement = header | group field | inline
  sections: tuple[Section(label, first_bar)]      a section starts at a group start
  layout: tuple[int]                 measures per group (1..4); presentation, but part of the text
  vocal, ins: tuple[Note(onset, duration, pitch, spelling?)]
                                     sounding notes: onsets/durations are integers in L units, may cross
                                     bar lines; non-overlapping (monophony); gaps are rests
  chords: tuple[ChordSymbol(onset, name)]
  source: SourceMap (private)        original header/field/comment lines and, per measure and per line,
                                     the original text plus a fingerprint of its musical content
```

- **Musical equality** compares tempo, unit, meters, keys (onset, key), sections, layout, notes (onset, duration, pitch) and chords. `spelling`, key placement and `source` are presentation.
- The model holds one chord symbol and one key per onset: the **last** one written at that onset (the effective one). Earlier duplicates are *accepted, not canonical* (§9.2): they stay in the source map, and therefore in the text, until their measure is rewritten.
- IDs are stable across unrelated edits: `vocal:<onset>`, `ins:<onset>`, `chord:<onset>` (a monophonic voice has at most one note per onset); the existing token ids (`V12.3`) remain for the staff and ABC views and map to sounding notes through `segments`.

### 9.4 Serialization contract

| # | Guarantee | Test |
|---|---|---|
| S1 | `from_abc(T)` accepts exactly the texts the upstream parser accepts (except measures that are not a whole number of units, §9.2); errors carry line, measure and range | fixtures + generated invalid texts |
| S2 | **Identity:** `to_abc(from_abc(T)) == T` byte for byte for every accepted `T` in the Song Sheet's normal form (`normalize_document`: LF line ends, no trailing spaces, no outer blank lines; spaces inside lines included). Other texts are normalised first — the Song Sheet already does this before hashing and output. | fixtures, every YuE2/SheetSage2 score in the test data, hypothesis-generated texts |
| S3 | **Round trip:** `from_abc(to_abc(S)) ≡ S` (musical equality) for every valid model `S` | hypothesis-generated models |
| S4 | **Determinism:** equal models give equal text | property test |
| S5 | **Locality:** an edit rewrites only the measures (and, for structural edits, the group/comment/field lines) whose content changed; a line whose measures are all unchanged is emitted verbatim | op tests compare untouched lines |
| S6 | **Validity:** every `to_abc` output passes the upstream parser *and* re-parses to the model (checked on every commit; a failure is an internal error and the edit is refused) | every op test |
| S7 | **Native style for rewritten measures:** no spaces; accidentals only where the key and the measure's by-letter state need them (kept spelling first, otherwise the key-aware speller `_spell`); notes split at bar lines, chord onsets and inline key changes with ties; durations decomposed greedily into supported values; gaps as rests merged and decomposed the same way; an empty measure as `Z`; runs of empty measures compressed to `Z2`…`Z4` inside a group | golden tests, comparison with native plans |

A measure is *unchanged* when its musical content, its key at the start and its incoming tie are unchanged; then its original text is reused.

### 9.5 Invariants (hold for every committed score)

| # | Invariant | Enforced by |
|---|---|---|
| I1 | every measure of both voices sums exactly to its meter | the model has no measures of its own: measures are cut from the meter timeline at print time |
| I2 | both voices share measures, meters and key changes | one `meters` and one `keys` timeline |
| I3 | monophony: notes of a voice never overlap | every op normalises by overwrite rules (§9.6) and `validate` checks |
| I4 | durations printable | decomposition into supported values with ties |
| I5 | pitches 0–127 | ops refuse, MIDI import clamps with a report |
| I6 | ties connect equal pitches only | ties are not stored; a sounding note is one note |
| I7 | chord symbols only in Vocal, supported grammar, strictly inside a measure; operations never write a second symbol at one onset | `ChordSymbol` validation, printer places them before the Vocal token at that onset (splitting it if needed) |
| I8 | 1–4 measures per group; header exact | layout ops re-group deterministically (split groups at 4 measures, never merge silently) |
| I9 | section labels match the editor's label rule (lower-case words, ≤ 30 characters) | section ops |
| I10 | at least one measure | bar deletion refuses to delete everything |
| I11 | an instrumental song's Vocal voice is silent (engine rule) | Song Sheet validation (exists), not structural |
| I12 | the score contains at least one note (a score that is only rests cannot be rendered) | new Song Sheet error, needed for the DAW skeleton (§10.2) |

### 9.6 Edit operations and repair rules (`plenio.core.score.ops`)

All operations are pure `Score -> Score` functions with a change log; the route applies one, serializes, re-parses (S6) and returns text + view.

| Operation | Deterministic rule |
|---|---|
| **delete** (default) | each selected sounding note becomes a gap of the same length (a rest); measure durations never change |
| **delete and close gap** (explicit, Shift+Delete) | the note of the same voice that ends exactly at the deleted note's onset is extended by the deleted duration (across bar lines as a tie); if there is no such adjacent note, the span becomes a rest and the change log says why |
| insert / draw note `[t, t+d)` | **overwrite** inside the voice: overlapped parts of other notes are removed, the parts outside remain as notes with their pitch; the note may cross bar lines |
| move (time and/or pitch, same or other voice) | atomic *delete (rest)* at the source + *insert (overwrite)* at the target |
| resize | *into rests only* (Review default: refuses when a note follows, as today) or *overwrite* (DAW default) |
| set / shift pitch | whole sounding note; spelling from the key |
| split at `t` / join adjacent equal pitches | two attacks ↔ one sounding note |
| rest → note | as today (longest supported value, remainder rest) |
| chord add / move / remove | any grid onset inside the score; one chord per onset; never changes a note |
| insert / delete / duplicate measures | both voices together; deleting time: notes inside are removed, a note crossing the start is cut there, a note crossing the end keeps its tail as a new attack; chords inside are removed; a key change inside moves to the cut; sections that become empty are removed; groups re-laid (§I8) |
| key change | at a measure start (group field) or inline; **pitches are kept**, spellings are re-derived |
| meter change | only on empty measures (no re-barring of music in this release) |
| tempo, transpose, section edits | as today, on the model |

### 9.7 Raw ABC editing

The ABC view stays a full editor for experts: every keystroke updates the working text; after a short debounce the backend validates it. **Valid:** it becomes the current score and all views update. **Invalid:** diagnostics with line/measure/range, the other views keep the *last valid score* marked "not current", structural operations are disabled, *Apply* and *Approve* are disabled for the score with the reason shown, and **Revert to last valid** restores it. The Song Sheet node refuses an invalid score (exists), so an invalid text can never reach YuE2.

### 9.8 Synchronization design

```text
            ┌───────────── Score session (one per score document) ─────────────┐
typing ───► │ text (working copy) ──debounce 200 ms──► POST analyze ──► view    │──► staff (abcjs display_abc)
            │                       (answers for older texts are dropped)      │──► piano roll / chord lane
op ───────► │ POST transform {abc, op} ──► {abc, view} (atomic) ─────────────► │──► inspector, navigator
            │ lastValid = last view with ok = true · history = text snapshots  │──► ABC text (advanced)
            └──────────────────────────────────────────────────────────────────┘
```

- Every view renders from the same `view` object, tagged with the text's hash; no view computes musical content. The piano roll does geometry only; during a drag it draws a client-side ghost and commits one operation on release (a refused op removes the ghost and shows the reason).
- `transform` returns the new view with the new text (no second round trip), times as **integer units** (no float tolerances; the 1 ms `TIME_TOLERANCE` workaround of Phase 5 disappears).
- Undo/redo: text snapshots with operation labels (exists).

### 9.9 View contract v2 (additions to `/plenio/score/analyze` and `/transform`)

`unit`, `tempo`, `measures[{n, onset, length, meter, key}]` (units), `tracks{vocal:[{id, onset, duration, pitch, name, segments}], ins:[…], chords:[{id, onset, name, pitches}]}`, `sections[{label, first_bar, bars}]`, `grid{units_per_quarter}`. Existing fields stay for the staff view. *As implemented (Phase 11B):* these fields live under the key `model` (the view already has a `sections` field), plus `total`, `groups`, `keys` and `grid.snap`; see §17.1.

---

## 10. YuE2 · DAW

### 10.1 Tracks and projection

| DAW track | Sent to YuE2 as | Constraints |
|---|---|---|
| **Vocal** | `V: Vocal` | monophonic; silent for instrumentals |
| **Instrument** | `V: Ins` | monophonic |
| **Chords** | chord symbols in the Vocal line | supported qualities and slash bass; the printer splits Vocal tokens at chord onsets (ties) |
| **Guide** | **not sent** | any notes (polyphonic allowed), playback and MIDI only; labelled "not sent to YuE2"; stored in the Song Sheet node's `properties` (saved with the workflow, not in the prompt, no schema change) |

Tracks 1–3 are a bijection with the ABC document (§9.4); the only lossy steps are explicit: Guide is never projected, and foreign MIDI is quantised and reduced to monophony on import (with a report). The planning mode follows the final score as today (chords → `full`, none → `melody`). The Song Sheet · DAW outputs exactly the text of the editor's ABC view and nothing changes it on the way to YuE2 (R5; Score Tools preparation runs before the sheet) — this is the user's full control over the conditioning.

### 10.2 Workflow `5 · YuE2 · DAW`

```text
Song Brief (mode default: one song, stop to review) ─► Write Song ─► Song Sheet · Text (lyrics usually manual)
Song Brief ─► Score Tools [new score from brief] ─► Song Sheet · DAW (score; editor opens in the DAW layout)
Song Sheet · DAW ─► YuE2 Render (take seed) ─► [Stems] ─► [Refine] ─► Plenio · Master ─► Export
```

- **New score from brief** is a new Score Tools operation (no new node): measures from length and tempo, meter and key parsed from the brief's text fields (defaults 4/4, C, 100 BPM, reported), one section `verse`, all rests. It is the draft; the user's composition becomes *edited* (a later brief change stops with a conflict and offers *keep mine*). Score Tools' `score` input becomes optional for this operation only.
- Invariant I12 keeps an all-rest skeleton from rendering; with the default review mode the run stops at the DAW sheet anyway.
- Everything the writer drafts (title, style, lyrics, artwork) is optional: manual documents skip the writer (lazy, exists).
- App mode: mode, template, description, genre, mood, tempo, length, vocals, language, voice, theme, take seed, buttons *Song Sheet · Text* and *Song Sheet · DAW*; results: preview and export.

### 10.3 Editor layouts (one editor, three layouts)

| Layout | Panels | Default for |
|---|---|---|
| **DAW** | track headers (4), piano roll with chord lane, staff below, inspector, transport (play from bar, loop, metronome, voice/track toggles), MIDI import/export | template 5 (node property `plenio_editor_layout = "daw"`) |
| **Review** | staff + piano roll, navigator, lyrics fit, inspector; ABC behind *Advanced* | Review sheets in templates 1–3 |
| **Text** | ABC editor with diagnostics + staff | power users |

Snap grid: 1/16 by default, 1/32 when `L = 1/32`; bar/beat/tick readout; keyboard map extends Phase 5 (arrows, Alt+arrows resize, Delete, Shift+Delete, D duplicate, Ctrl+C/V for bars).

### 10.4 MIDI import/export (`plenio.core.score.midi`, pure; no dependency)

- **Export:** SMF type 1, 480 PPQ; tempo, time signatures, key signatures, section markers; tracks *Vocal*, *Instrument*, *Chords* (block-chord voicings for any DAW **plus** text events `plenio:chord <name>`), *Guide*; velocity 90. The file name carries the song title.
- **Import:** tracks named like Plenio's (or mapped by the user); onsets and durations quantised to the snap grid; monophonic reduction for Vocal/Instrument (the highest sounding note wins, cut notes reported); first tempo only (later changes reported and dropped); time and key signatures at measure starts; chords from `plenio:chord` events, otherwise optional template-matching recognition from a chosen polyphonic track (best effort, labelled); markers become sections.
- **Guarantee:** `import(export(S)) ≡ S` for every valid model (plus the Guide track). Foreign files: deterministic result + report.

### 10.5 Review-mode reuse

The DAW layout, piano roll, inspector and operations are the same components and routes in every template's Song Sheet · Score; YuE2 Song and Cover reviewers correct notes graphically without ABC knowledge. No template-specific code.

---

## 11. Exact workflow and subgraph changes

| Artefact | Change |
|---|---|
| Blueprint **Plenio · Refine (48 kHz)** (new) | Load Audio Model (super-resolution, collapsed) → Refine; inputs `audio`; outputs `audio`, `report` |
| Blueprint **Plenio · Stems** (new) | Load Audio Model (separation) → Separate Stems → Stem Mixer; inputs `audio`; outputs `audio`, `report` |
| Blueprint Plenio · Master | unchanged wiring; the EQ inside gets the new widget |
| Blueprint Plenio · Write Song | unchanged |
| 1 · YuE2 · Song | between YuE2 Render and Master: *STEMS (optional)* group with Plenio · Stems (bypassed, collapsed) → *REFINE (optional)* group with Plenio · Refine (bypassed); both reports into Export; score sheet opens in the Review layout |
| 2 · YuE2 · Cover | same insertion between Check Vocals and Master |
| 3 · MiniMax · Song | Stems (bypassed) → **Refine (active)** → Master; catalogue lists the SR weights for this template |
| 4 · Enhance & Master | Stems (bypassed) → Refine (bypassed) between Load Audio and EQ |
| 5 · YuE2 · DAW (new) | §10.2; groups `1 · SONG`, `2 · WRITE`, `3 · TEXT`, `4 · DAW`, `5 · RENDER`, `STEMS (optional)`, `REFINE (optional)`, `6 · FINISH`, `MUSIC MODEL` |
| Song Brief (all) | frontend template ghost text and actions; backend legacy-sentinel normalisation |
| Song Sheet (all) | Lyrics tab *Use my own lyrics*; score editor layouts; I12 error; DAW layout property |
| Model catalogue | UniverSR audio weights (`models/audio_sr/`, CC-BY-4.0), BS-RoFormer 4-stem (`models/audio_separation/`, MIT; dataset note); templates/optional_templates per §4.6 and §6 |
| App modes | template 5 new; 1–4 unchanged except the sheet buttons' lyrics badge |

All JSON is generated by `tools/build_graphs.py`; thumbnails by `tools/build_thumbnails.py`; `tools/data/node_types.json` refreshed with `tools/snapshot_node_types.py`.

---

## 12. New nodes, types, routes and dependencies (minimal set)

| New | Why it cannot be avoided | Alternatives rejected |
|---|---|---|
| **Load Audio Model** (`PlenioAudioModelLoader`) | ComfyUI has no loader for SR or separation weights; a loader node gives the missing-model dialog, caching and ComfyUI memory management | loading inside each processing node (reloads on every audio change) |
| **Refine (48 kHz)** (`PlenioRefine`) | no core SR node; one node replaces the legacy's four | a chain of native nodes (impossible: no filters/SR in core) |
| **Separate Stems** (`PlenioSeparateStems`) | no core separation | external node packs (dependency, red nodes when missing) |
| **Stem Mixer** (`PlenioStemMixer`) | native Adjust Volume/Merge lack compression, muted ranges and effect buses; one mixer keeps 4–5 strips in one place | ~20 native nodes per template (unusable) |

- Types: `PLENIO_AUDIO_MODEL`, `PLENIO_STEMS`. Routes: `POST /plenio/score/midi/export`, `POST /plenio/score/midi/import`, `/plenio/score/transform` gains the new operations, `/plenio/score/analyze` gains the v2 view. Score Tools gains *new score from brief*.
- **No new Python packages.** Vendored, hash-pinned inference code (`third_party/universr/` MIT, `third_party/msst/` MIT) imported only when a model is loaded; own SMF reader/writer (~250 lines) instead of `mido`; reverb/delay/crossover with NumPy/SciPy (already used).
- Frontend: new components (piano roll, chord lane, track headers, inspector, mixer widget, brief ghost text); no new libraries.
- Node count 14 → 18.

---

## 13. Test plan

| Layer | Tests (new files) | What they prove |
|---|---|---|
| Unit — canonical engine | `test_score_canonical.py` | S1 accepted language = upstream; **S2 identity** on all fixture and recorded scores and on generated texts; **S3 round trip** on hypothesis-generated models (random meters, keys, inline keys, sections, layouts, notes crossing bars, chords); S4 determinism; S6/S7 native style goldens |
| Unit — operations | `test_score_ops.py` (+ a hypothesis `RuleBasedStateMachine`) | after every random op sequence: text valid (upstream), invariants I1–I10, locality S5, musical equality outside the edited range; **delete → rest keeps every measure's length**; close-gap extends only adjacent notes; overwrite rules; chord moves never change notes; bar deletion rules; pitch/duration/chord edits give valid ABC |
| Unit — raw ABC | `test_score_canonical.py` | malformed texts (fuzz from `tools/studies/fuzz_score.py` corpus) raise precise diagnostics; no state object is produced |
| Unit — MIDI | `test_score_midi.py` | `import(export(S)) ≡ S` (property); foreign fixtures: quantisation, monophonic reduction report, tempo/meter/key/marker mapping, chord text events |
| Unit — brief | `test_documents.py` additions | typed > template > empty; template change never alters typed values; `custom` normalised with a note, never reaches the writer |
| Unit — refine | `test_refine.py` | complementary crossover sums to a delayed identity; *resample only* equals `core.audio.resample`; output rate 48 kHz and length contract; PRE/POST filter responses; chunk OLA is seamless with an identity fake engine; seed determinism; report fields |
| Unit — stems | `test_stems.py` | **neutral mixer = input** (residual invariant); gain/mute/solo matrix incl. *rest*; muted ranges (silence + fades, merged, clipped); compressor reuse; reverb/delay determinism and tail policy; no hidden normalisation |
| Host (fake engines) | `test_refine_node.py`, `test_stems_node.py`, `test_daw_path.py`, additions to `test_song_path.py` | nodes in a real ComfyUI with fake models; DAW: skeleton → manual edit → fake YuE2 render receives exactly the projected ABC; I12 blocks an all-rest score; manual lyrics survive draft-seed changes and batch mode |
| Workflows | `test_graphs.py` additions | new blueprints validate; template defaults (Refine active only in MiniMax, Stems bypassed everywhere); template 5 anatomy and App config |
| Frontend (Vitest) | `scoreSession.test.ts`, `pianoRoll.test.ts`, `eqCurve.test.ts`, `stemMixer.test.ts`, `briefTemplate.test.ts` | text↔view atomicity, stale-answer dropping, invalid text blocks apply/approve, revert to last valid; piano-roll geometry, snapping and op mapping; EQ interactions; mixer state (de)serialisation; ghost-text precedence |
| Browser | `tools/browser_check.mjs` extension | template 5 load/reload/options/app; DAW e2e: draw a note → ABC changes; type ABC → roll changes; invalid ABC → stale + apply disabled; Delete → rest |
| Local (owner, GPU) | §15 | SR study, separation, full YuE2/MiniMax/DAW runs, frontend 1.53.6 checks |

---

## 14. Complexity challenge (what was cut and why)

| Considered | Decision | Reason |
|---|---|---|
| Four conditioning tracks | **cut** → 3 conditioning tracks + 1 guide | YuE2 reads two voices and chord symbols (§9.1) |
| Separate arrangement document / sheet schema v2 | **cut** | tracks 1–3 *are* the ABC; the guide lives in node properties |
| A second score engine in TypeScript | **forbidden** | one engine; the roll does geometry only |
| Re-barring music on meter change, grid (`L`) change, tuplets, polyphony per voice | **deferred / impossible** | not in the dialect or high risk for little value |
| Porting FlashSR's 261-file research framework | **deferred** | evaluate through the installed legacy node first; integrate only the winner |
| DSP "exciter" engine, AudioSR, HF repair port | **cut** | no measurement supports them; AudioSR too slow |
| Four legacy SR nodes (lowpass lab, FlashSR, hybrid, HF repair) | **merged into one** | fewer nodes, one report |
| Stem time removal, per-stem EQ/pan, more than two effect buses | **cut** | not requested or misaligns stems; keeps the mixer small |
| External separation node packs | **rejected** | dependency, red nodes when missing |
| Writer reading manual lyrics (second lyrics field, prompt introspection) | **rejected** | parallel mechanism or fragile caching; an info finding instead |
| Hidden "template applied" state / writing template values into widgets | **rejected** | stateless ghost-text rule is simpler and cannot destroy edits |
| DAW with an optional YuE2 planner draft | **cut** | a bypassed planner would pass its style input through as a "score"; template 1 + the DAW layout covers the case |
| `mido` / `pretty_midi` | **rejected** | ~250 lines of SMF code, no dependency |
| App-mode switches for Refine/Stems | **cut** | bypass is the switch (Ctrl+B); App mode stays simple |

---

## 15. Risks, open questions and the local validation checklist

| # | Item | Mitigation |
|---|---|---|
| K1 | SR models may add audible artefacts on MiniMax material | measurement gate §4.5; *resample only* stays available; defaults only from data |
| K2 | UniverSR speed/VRAM unknown | measured in L1 before it becomes a default |
| K3 | Weight licences (FlashSR weights, 2-stem RoFormers, MUSDB-trained checkpoints) | licence recorded in the catalogue and in every release record (existing mechanism); ship only entries whose licence is confirmed at integration time |
| K4 | Dynamic placeholders may not render in all frontend views | spike first; fallback "Template fills:" line |
| K5 | The canonical engine replaces the internals of the score operations pinned by the 162 Phase 5 tests (`test_score_editor.py`) | S2/S5 identity and locality tests on every existing fixture before switching; the Phase 5 tests stay as the regression suite |
| K6 | Large dialog + piano roll performance for 200+ measure scores | virtualised roll (visible measures only); staff paging by section (AS-12) |

**Local validation checklist (owner machine):**

1. **L1** SR study (§4.5): bandwidth of unmastered MiniMax takes, objective metrics, blind A/B, default decision recorded.
2. **L2** Separation: BS-RoFormer speed/VRAM on 16 GB, listening check of stems and the neutral-mixer identity on a real song.
3. **L3** Full runs: YuE2 Song, Cover, MiniMax (Refine on), DAW (hand-made score, imported MIDI) with real models; release records complete (licences of new weights).
4. **L4** Frontend 1.53.6: ghost text, piano roll, mixer and EQ widgets in canvas, Vue nodes and App mode; DynamicCombo restore still repaired.

---

## 16. Ordered implementation tasks

Effort = **agent hours** (wall-clock for an AI coding agent including its tests). Phase 11B implements the OPUS-CRITICAL tasks in order within ~4–5 h; anything unfinished moves to the front of the DEEPSEEK list with the spec above.

### 16.1 OPUS-CRITICAL (Phase 11B)

| # | Task | Scope | Effort |
|---|---|---|---|
| O1 | **Canonical score model + parser + serializer** | `score/canonical.py`: model, `from_abc` (upstream parse + structure + source map), `to_abc` (S2 identity, S5 locality, S7 native style), musical equality, `validate`; hypothesis generators for models and texts | 1.25 |
| O2 | **Edit operation algebra** | `score/ops.py`: delete→rest, delete-and-close-gap, insert/overwrite, move, resize (both modes), split/join, pitch, voice move, chords anywhere, measure insert/delete/duplicate, key change; existing public operations re-routed through the model; state-machine property tests; the Phase 5 suite stays green | 1.25 |
| O3 | **Route and view contract v2 + commit gate** | new ops in `/transform`, v2 view (§9.9), `{abc, view}` responses, TS types, `useScoreSession` gate (invalid text blocks apply/approve, revert to last valid) with Vitest | 0.5 |
| O4 | **MIDI boundary** | `score/midi.py`: SMF writer/reader, mapping of §10.4, lossless round trip property; foreign-import rules as a pure function with report (heuristic chord recognition left to D3) | 0.5 |
| O5 | **Brief precedence + manual-lyrics contract** | legacy `custom` normalisation with note; precedence helpers; tests pinning "manual lyrics never overwritten" (draft seed, batch, template/brief change); sheet info finding; I12 empty-score error | 0.25 |
| O6 | **Refine architecture** | `audio/refine.py` (bandwidth measure, PRE, chunked OLA around an injected engine, complementary crossover, POST, contracts), engine protocol, `PlenioAudioModelLoader` skeleton + `PlenioRefine` (engine widget, lazy `model` input) with *resample only* and a fake engine for tests; catalogue kinds/folders | 0.5 |
| O7 | **Stem interfaces** | `PLENIO_STEMS`, residual invariant, `plenio.stem_mix/1` schema, mixer core (gain, mute/solo incl. *rest*, muted ranges, compressor reuse), node skeletons with a fake separator; neutral-identity tests | 0.5 |

### 16.2 DEEPSEEK-SUITABLE (Phase 11C): milestones

The tasks D1-D13 are grouped into **seven milestones**. Each milestone ends in a state that is
fully usable on its own (merged into `main`, templates working, nothing half-wired), and each
closes its own tests and documentation - there is no "tests and docs later" bucket. Do them in
this order; within a milestone, in the listed order. The engine contracts they build on are done
(§17); **no milestone changes `plenio.core.score.canonical`/`ops` semantics** - a needed change
there is a design question for the owner.

Rules for every milestone: run `ruff check`, `ruff format --check`, `mypy`, the unit, workflow and
contract suites, the host suite (`PLENIO_COMFYUI_ROOT`), `npm run check` and, when a template or
widget changed, `tools/browser_check.mjs`; regenerate `tools/data/node_types.json` after node
schema changes and `subgraphs/`/`example_workflows/` with `tools/build_graphs.py` (+ thumbnails);
update `CURRENT_STATUS.md` and §17; commit coherent checkpoints.

#### M1 - Graphical score editor in Review mode (D1, D2, D3) - 10 h

*Usable result:* in every template's Song Sheet · Score a user corrects notes, rests, chords and
sections graphically (piano roll + chord lane + inspector next to the staff) without ABC
knowledge; MIDI export/import works from the editor. Raw ABC is the *Advanced* view.

| # | Scope | Files |
|---|---|---|
| D1 | Piano roll + chord lane: render `view.model` (v2); selection shared with the staff through `segments`/`modelNoteOfSegment`; draw / move / resize / delete with a client-side ghost that commits **one** canonical operation on release (`insert_note`, `move_notes`, `resize_note` with `mode`, `delete`, Shift+Delete `delete_close_gap`, `put_chord`/`move_chord`/`delete_chord`); snap from `view.model.grid`; keyboard map of §10.3; a refused operation removes the ghost and shows the backend's message | `frontend/src/sheet-editor/score/PianoRoll.vue` (new), `ChordLane.vue` (new), `ScoreTab.vue` |
| D2 | Layouts + inspector: *Review* (staff + roll + navigator + lyrics fit + inspector, ABC behind *Advanced*) and *Text*; inspector fields (pitch, onset, length, voice, chord) mapped to canonical ops; bar operations (`insert_measures`, `delete_measures`, `duplicate_measures`, `change_meter`, `put_key`/`delete_key`, section ops `rename_section_at`/`start_section`/`remove_section`/`move_section_start`); transport loop + metronome; layout default from the node property `plenio_editor_layout` | `ScoreTab.vue`, `Inspector.vue` (new), `ScoreTransport.vue`, `prefs.ts` |
| D3 | MIDI UI: export download (`exportMidi`, file name from the title), import dialog with the file's tracks, role mapping and the report (`importMidi`); optional template-matching chord recognition for foreign MIDI as a pure core function (best effort, labelled in the report) | `frontend/src/sheet-editor/score/MidiDialog.vue` (new), `plenio/core/score/chords.py` (new) |

*Done when:* Vitest `pianoRoll.test.ts` (geometry, snapping, ghost -> op mapping, refused op),
`inspector.test.ts`; the commit gate stays in force (an invalid ABC blocks Apply/Approve, revert
works); browser check: open a Review sheet, draw a note -> ABC changes, type ABC -> roll changes,
invalid ABC -> stale + Apply disabled, Delete -> rest; unit tests for chord recognition; user
guide `docs/user/concepts/score-editor.md` (graphical editing, the delete/close-gap rule, the
advanced ABC view and the gate).

#### M2 - YuE2 · DAW template (D4, D5) - 4 h

*Usable result:* template **5 · YuE2 · DAW** writes lyrics (or takes manual ones), creates an
all-rest score from the brief, stops in the DAW layout, and renders exactly the edited ABC.

| # | Scope | Files |
|---|---|---|
| D4 | Score Tools *new score from brief*: `plenio/core/score/skeleton.py` builds `canonical.new_score` from the brief (length and tempo -> measures; meter/key parsed from the brief's text fields with the documented defaults, reported); Score Tools' `score` input optional for this operation only; template 5 in `tools/build_graphs.py` (§10.2 groups), DAW layout property, App mode, thumbnail | `plenio/core/score/skeleton.py`, `plenio/comfy/nodes/score_tools.py`, `tools/build_graphs.py` |
| D5 | Guide track: editor-only 4th track in the Song Sheet node's `properties` (`[[onset, duration, pitch]]`, the format of `midi.guide_from_json`), playback, MIDI export/import, labelled "not sent to YuE2" | frontend score components, `sheetStateWidget.ts` |

*Done when:* unit tests of the skeleton (lengths, parsed/defaulted meter and key, report); host
`test_daw_path.py` (skeleton -> manual edit -> fake render receives exactly the ABC; I12 blocks the
unfilled skeleton - the error exists since O5); workflow tests (template 5 anatomy, App config);
browser check of template 5; user guide `docs/user/paths/yue2-daw.md` (the three conditioning
tracks, the Guide track, honest limits: YuE2 reads two voices + chord symbols).

#### M3 - Song Brief and manual-lyrics UX (D6, D7) - 4 h

*Usable result:* template values appear as ghost text and never overwrite typed values; users
can say "use my own lyrics" everywhere, and see that the lyrics are theirs.

| # | Scope | Files |
|---|---|---|
| D6 | Placeholder spike on frontend 1.52.7/1.53.6 (canvas, Vue nodes, App mode); ghost text from the template (`brief.field_sources` semantics: typed > template > empty) or the fallback line "Template fills: ..."; actions *Copy template text into fields*, *Use template choices* (`brief.template_choice_hints`), *Reset all to template* (confirmation); frontend migration that clears the legacy `custom` from saved workflows on load (the backend already treats it as empty with a note) | `frontend/src/extension/briefTemplate.ts` (new), `migrate.ts`, route for template fields if needed |
| D7 | *Use my own lyrics* in the Lyrics tab before the first run and later (sets the document to manual; empty or pre-filled editor; section-tag helpers), `lyrics: yours (manual)` on the canvas summary and the App-mode sheet button; batch-mode note in the docs | `SheetDialog.vue`, `summary.ts`, App-mode button code |

*Done when:* Vitest `briefTemplate.test.ts` (precedence, template switch keeps typed values,
`custom` migration); browser check of ghost text / fallback in canvas and App mode; host tests
stay green (manual lyrics survive drafts, brief changes, batch - pinned since O5); docs
`docs/user/concepts/brief-templates.md` and the manual-lyrics part of the path guides.

#### M4 - EQ UX (D8) - 3.5 h

*Usable result:* the EQ node edits like a visual EQ (§5); the stored value stays `plenio.eq/1`.

*Scope:* bigger resizable curve, band strip with inline editor (types, enable), handles with
Shift = fine, keyboard support, gain-range toggle, before/after spectrum (the node sends 1/6-octave
profiles in its UI payload), *Edit these bands* for match proposals, widget-local undo/redo,
bypass-compare, raw JSON under *Advanced*. Files: `frontend/src/extension/eqWidget.ts`,
`frontend/src/shared/eqCurve.ts`, `plenio/comfy/nodes/eq.py` (spectrum payload).
*Done when:* Vitest `eqCurve.test.ts` extended (interactions, value round trip), host test of the
spectrum payload, browser check (save/reload of a manual EQ identical), `docs/user/concepts/mastering.md` updated.

#### M5 - Refine in the templates (D9, D10) - 7 h (+ owner study L1)

*Usable result:* **Plenio · Refine (48 kHz)** in templates 1-5 (MiniMax: on, others: bypassed),
with a real super-resolution engine behind Load Audio Model and the study tooling to decide its
defaults.

| # | Scope | Files |
|---|---|---|
| D9 | UniverSR adapter: vendored, hash-pinned MIT code under `plenio/third_party/universr/`, registered with `plenio.comfy.audio_models.register` (kind super-resolution, `input_rate` per condition, `condition_hz`, chunking values), weights through ComfyUI model management (R9), seed handling; catalogue entry (`resources/models.toml`, folder `audio_sr`, licence CC-BY-4.0 with attribution); `tools/studies/sr_study.py` (simulation set, metrics of §4.5, listening pack) | `plenio/comfy/audio_models.py` (+ adapter module), `resources/models.toml`, `tools/studies/` |
| D10 | Blueprint *Plenio · Refine (48 kHz)* (loader collapsed -> Refine), groups *REFINE (optional)* per §11 (MiniMax active with engine *model*, others bypassed), reports into Export, System Check rows; remove `is_experimental` from Load Audio Model and Refine when this milestone is accepted | `tools/build_graphs.py`, `plenio/core/system.py` |

*Done when:* unit tests of the adapter's pure parts; host tests with the real adapter code on a
tiny fake checkpoint where possible; workflow tests (defaults per template); browser check;
`docs/user/concepts/refine.md`; the local checklist L1 prepared (commands in the doc). The
provisional defaults stay marked until the owner's L1 decision.

#### M6 - Stems in the templates (D11, D12) - 8 h (+ owner check L2)

*Usable result:* an optional, bypassed and collapsed **Plenio · Stems** block before mastering in
every template; with a separation model it splits, and the mixer edits gain, mute/solo,
compression, muted ranges, reverb and delay.

| # | Scope | Files |
|---|---|---|
| D11 | BS-RoFormer 4-stem adapter (vendored MSST MIT code, `plenio/third_party/msst/`, hash-pinned), 44.1 kHz chunked OLA, results back at the input rate (the core requires the input's shape), registered as kind separation; catalogue entry (folder `audio_separation`, MIT, MUSDB18-HQ note) | adapter module, `resources/models.toml` |
| D12 | `plenio/core/audio/effects.py`: seeded convolution reverb (room/plate/hall) and feedback delay as `stems.Effect` functions (bus settings from the mixer value's `reverb`/`delay` objects); pass them from the Stem Mixer node; mixer widget (strips, faders, M/S, compression, sends, mini waveforms with draggable muted ranges) replacing the JSON text widget (same `plenio.stem_mix/1` value); blueprint *Plenio · Stems* and template wiring (bypassed, collapsed); remove `is_experimental` from Separate Stems and Stem Mixer when accepted | `plenio/core/audio/effects.py`, `plenio/comfy/nodes/stems.py`, `frontend/src/extension/stemMixer.ts` (new), `tools/build_graphs.py` |

*Done when:* unit tests of the effects (determinism, tail policy, levels) and of the neutral
identity with buses at 0; Vitest `stemMixer.test.ts` (value (de)serialisation); host tests with the
fake separator (exist since O7) plus effect buses; workflow tests (bypassed everywhere); browser
check; `docs/user/concepts/stems.md`. L2 prepared.

#### M7 - Documentation and release 0.3.0 (D13) - 3 h

*Usable result:* a releasable 0.3.0: README, CHANGELOG, user guides linked, App-mode docs,
`docs/dev/extending.md` (audio model adapters, canonical score operations), version bump in
`pyproject.toml`/`frontend/package.json`, full test runs recorded in a test report, the owner's
local checklist (§15, L1-L4) ready to run. The release itself (tag, Registry publish) only after
the owner's L1-L4 verdicts.

#### Optional follow-up (not scheduled)

- **F1** Route the Phase 5 operations (`plenio/core/score/edit.py`, element ids) through the
  canonical engine, or retire them once the graphical editor (M1) covers their use. Their 162
  tests pin exact texts and ids; decide per operation. Owner decision; not needed for 0.3.0.

### 16.3 Owner (local, after M5/M6/M7)

L1 → L4 of §15; then the Refine defaults are fixed from L1, and the release is prepared.

---

## 17. Implementation status

| Task | Status |
|---|---|
| Phase 11A — this plan | done (2026-09-27, `c5b8af3`) |
| O1 canonical model, parser, serializer | **done** (2026-09-27, `9588977`) |
| O2 edit operation algebra | **done** (`a035c2f`) — the Phase 5 operations stay unchanged (owner decision); re-routing them is F1 |
| O3 route + view contract v2 + commit gate | **done** (`0139957`) |
| O4 MIDI boundary | **done** (`a041315`); chord recognition from notes → D3 |
| O5 brief precedence + manual-lyrics contract + I12 | **done** (`c2f4668`); ghost text and the frontend `custom` migration → D6 |
| O6 Refine architecture | **done** (`299964d`); real engine → D9, wiring → D10 |
| O7 stem interfaces | **done** (`6578313`, help pages `7b0eb39`); separation engine → D11, effects/widget/blueprint → D12 |
| M1 / D1 piano roll + chord lane | **done** (2026-09-27, `f1f968a`): `frontend/src/sheet-editor/score/pianoRoll.ts` (pure geometry, hit test, gesture/key → one canonical operation, selection mapping) and `PianoRoll.vue` in the Score tab; checked by Vitest and in a real ComfyUI 0.37.0 frontend |
| M1 / D2 layouts + inspector | **done** (`d7621a2`): Review/Text layouts (node property `plenio_editor_layout`, else the viewer's last), `Inspector.vue` + pure `inspector.ts` (note, chord and bar fields → one canonical operation each: voice, pitch, start, length, chord, rest/close gap, insert/duplicate/delete bars, meter, key), metronome; `duplicate_measures` now copies a section only when the block holds all of it |
| M1 / D3 MIDI UI | **done** (2026-09-27, `e5354bd`): the Score tab exports the score (download, file name from the title, gate-aware) and imports a file through a dialog that shows the file's tracks with a role each (Vocal / Instrument / Chords / Guide / do not import), the grid, *read chords from the notes* and the import report **before** anything is replaced; *Insert* replaces the text as one undo step (`useScoreSession.replaceText` carries the imported view). Backend: the import route returns the tracks (`TrackInfo`), takes an explicit mapping and reads chord symbols from a Chords track's notes with the new pure `plenio/core/score/chords.py` (template matching, key-aware spelling, slash bass, merging; what fits nothing is counted, not guessed; written `plenio:chord` events win). Tests: `test_score_chords.py` (9), additions to `test_score_midi.py`, host `test_song_path.py` (route lists tracks/maps/reads chords), Vitest `midiDialog.test.ts` (11) and a `replaceText` session test. **M1 is complete.** |
| M2 / D4-D5 YuE2 · DAW | **done** (2026-09-27, `db3bc00`): `plenio/core/score/skeleton.py` (an all-rest score from the brief: measures from length and tempo, meter and key parsed from the brief's text fields, defaults 4/4, C major, 100 BPM reported); Score Tools *new score from brief* with the `score` input optional for it; template **5 · YuE2 · DAW** (groups 1 SONG … 6 FINISH, the DAW sheet property, App mode, thumbnail, catalogue entries); a pending review stop now wins over document errors (the DAW skeleton's first run stops at the sheet instead of failing); the frontend *daw* layout with `TrackPanel.vue`/`tracks.ts` (four tracks, "not sent to YuE2", playback switch) and the Guide notes in the node property `plenio_guide` (playback, MIDI, cleared from the panel); tests: `test_score_skeleton.py` (30), host `test_daw_path.py` (4), workflow/catalogue tests, Vitest `dawTracks.test.ts` (8); guide `docs/user/paths/yue2-daw.md`. |
| M3 / D6-D7 Brief template + manual lyrics | **done** (2026-09-27, `d3fe3e1`): `POST /plenio/brief/fields` answers the precedence rule for a brief's widget values (sources, fills, choice hints, notes); the panel under the template selector (`frontend/src/extension/briefTemplate.ts`) shows *Template fills:* / *suggests:* and offers *Copy template text*, *Use template choices*, *Reset all to template* (confirmation) and a refresh - no ghost text (the 1.53.6 bundle passes no placeholder to single-line widgets; the fallback line carries it); the legacy `custom` is cleared from the loaded text widgets and from saved named values; *Use my own lyrics* + section-tag helpers in the Lyrics tab; `lyrics: yours (manual)` in the node summary and the sheet widget. Tests: host route test, Vitest `briefTemplate.test.ts` (9), `lyricsTags.test.ts` (2). Guide `docs/user/concepts/brief-templates.md`. |
| M4 / D8 EQ UX | **done** (2026-09-27, `c026f9b`): the EQ panel rebuilt per plan §5 - 560×260 curve that grows with the node, gain-range toggle ±6/±12/±18, the last run's spectrum behind the curve (grey before, blue after), handles (Shift = fine, wheel = Q, double-click = gain 0 / add a bell, Delete/right-click = remove, keyboard), band strip with chips + inline editor (type, Hz, dB, Q, enable, remove), *Edit these bands* for match proposals, toolbar (presets, undo/redo, reset, bypass compare, *bands as text* hiding the raw JSON widget); `eqCurve.ts` gains the pure axis/fine-drag/editBand/bandChip/spectrumPath/EqHistory helpers; the node's UI payload carries the 1/6-octave profiles before/after (flat: none). Tests: Vitest `eqCurve.test.ts` (11), host production path (the spectrum assertions + a flat case). `mastering.md` updated. |
| M5 / D9-D10 Refine + UniverSR | **done** (2026-09-27, `a115d95`): UniverSR vendored (MIT, commit `d8636623`, per-file hashes and the five relative-import changes in `plenio/third_party/universr/NOTICE.md`), adapter `plenio/comfy/universr.py` (weights_only config handling, the 24 kHz condition, mono per channel, seed, device/memory through `host`), `_compat.py` stand-ins for timm/torchdiffdet when the host lacks them (reported), catalogue entry (`audio_sr`, CC BY 4.0 weights + MIT code, MiniMax required, the other four templates optional), blueprint *Plenio · Refine (48 kHz)* and the REFINE group in all five templates (active in MiniMax, bypassed elsewhere), reports into Export, `tools/studies/sr_study.py` (arms, simulation/target sets, LSD/fizz/loudness/pre-echo/RTF/VRAM, JSON report), guides `docs/user/concepts/refine.md` + `models.md`. **Two host fixes** were needed: Plenio's model folders are registered with ComfyUI's model extensions (a new folder lists nothing otherwise) and the catalogue accepts `.bin`. `is_experimental` stays until L1 accepts the milestone. Tests: unit `test_universr_adapter.py` (10), host `test_refine_node.py` (6, incl. the tiny real checkpoint), workflow defaults, catalogue/readiness. |
| M6 … M7 | not started |
| L1 … L4 | not started |

All Phase 11B commits are **local only** (not pushed; owner instruction for this phase).

### 17.1 As implemented (Phase 11B)

| Area | What exists | Where |
|---|---|---|
| Canonical model | `Score(tempo, unit, meters, keys, sections, layout, vocal, ins, chords)`; `Note(onset, duration, pitch, spelling)` with `spelling` = the written natural pitch (presentation); `KeyChange(onset, key, placement)` with placement `header`/`field`/`inline` (a `field` change where no group starts is written inline); `Section(measure, label)` with 0-based measures - a first group without a `%` comment has no Section (the implicit *untitled*, marked `implicit` in the view); `source` (the original text per measure, field and comment line) and `origins` (source measure of every measure, so moved/duplicated measures keep their text) are presentation. `==` is musical equality. | `plenio/core/score/canonical.py` |
| Serializer | locality-preserving print (unchanged measures/fields/comments verbatim; a measure's reuse depends on its content, meter, key context, inline keys and the entering tie's spelling; measures with inline key text in the source are rewritten in both voices or neither) → S6 check → canonical re-print for exotic accepted texts (e.g. a key change placed differently in the two voices plus a partial edit) → internal error if even that fails. Rewritten lines merge plain `Z` measures into `Z2`…`Z4` runs. The canonical writer reproduces every real YuE2/SheetSage2 fixture byte for byte. | `canonical.to_abc`, `canonical_text` |
| Operations | `delete`, `delete_close_gap`, `insert_note`, `move_notes`, `resize_note` (`rests`/`overwrite`), `set_note_pitch`, `split_note`, `join_notes`, `fill_rest`, `put_chord`, `move_chord` (replaces with a warning), `delete_chord`, `insert_measures` (default: join the group *before* the insertion point, so bars inserted before a chorus extend the verse; another meter forms its own group; groups > 4 split into fours), `delete_measures` (the key in effect after the cut stays in effect; a section starting inside moves to the cut), `duplicate_measures` (a section is copied only when the block holds all of it; a copy of part of a section extends it), `change_meter` (empty measures only), `put_key`/`delete_key` (pitches kept, re-spelled), `change_tempo`, `transpose_by`, `rename_section_at`, `start_section`, `remove_section`, `move_section_start`. Ids `vocal:<onset>`, `ins:<onset>`, `chord:<onset>`; bars 1-based. Names are disjoint from the Phase 5 operations. `transform(text, op)` is the commit path. | `plenio/core/score/ops.py` |
| View v2 / route | `/plenio/score/analyze` and `/transform` return the existing view plus `model` (v2: `unit`, `tempo`, `total`, `grid{units_per_quarter, snap}`, `measures`, `groups`, `keys`, `sections`, `tracks{vocal, ins, chords}` with `segments` → element ids); `model: null` + `model_error` outside the subset. The v2 data lives under `model` (not top level) because `sections` already exists in the view. | `plenio/core/score/operations.py`, `plenio/comfy/routes.py` |
| Commit gate | `useScoreSession.commitBlock` (checking, check failed, invalid text), notation operations refused on an invalid text, `revertToLastValid` (one undo step), canonical ids kept in the selection; the Score tab reports the gate, the dialog disables Apply and Approve with the reason, banner with *Revert to last valid*. | `frontend/src/sheet-editor/score/useScoreSession.ts`, `ScoreTab.vue`, `SheetDialog.vue` |
| MIDI | own SMF reader/writer; a `plenio:score` text event carries unit and layout (lossless round trip); tracks Vocal/Instrument/Chords/Guide on channels 1-4; routes `POST /plenio/score/midi/export` (base64 JSON, file name from the title) and `/import` (ABC, Guide notes, report, view); typed client calls `exportMidi`/`importMidi`. | `plenio/core/score/midi.py` |
| Brief / lyrics | `resolve_text_fields` (typed > template > empty, one rule for Song and Cover Brief), `field_sources`, `template_choice_hints`; `custom` → empty with a note in the brief's `notes` (summary), not in the fingerprint or the prompt; sheet info finding for manual lyrics with drafted title/style; I12 as a YuE2 rule error. | `plenio/core/brief.py`, `sheet/evaluate.py`, `engines/yue2.py` |
| Refine | pure pipeline with an `Engine` protocol; *resample only* = `core.audio.resample`; nodes **Load Audio Model** (`PlenioAudioModelLoader`) and **Refine (48 kHz)** (`PlenioRefine`, default engine *resample only* until D9/L1), both `is_experimental`; folders `models/audio_sr`, `models/audio_separation`; adapter registry `plenio.comfy.audio_models`. The < 0.1 LU criterion of §4.5 is reported per run (`loudness_change_lu`), not enforced. | `plenio/core/audio/refine.py`, `plenio/comfy/nodes/refine.py`, `audio_model.py` |
| Stems | `Stems` (≤ 4 float32 stems + residual), strict `plenio.stem_mix/1`, `mix` with injected effect buses (a send without its bus is refused); nodes **Separate Stems** and **Stem Mixer** (JSON value until D12), `is_experimental`; `PLENIO_STEMS` = one `Stems` per batch item. | `plenio/core/audio/stems.py`, `plenio/comfy/nodes/stems.py` |

### 17.2 Verification (owner's machine, 2026-09-27; Python 3.12.9, ComfyUI 0.37.0 on the CPU)

| Check | Result |
|---|---|
| unit + workflow + contract suites | 848 passed, 4 skipped |
| host suite (real ComfyUI server, fakes) | 101 passed, 8 skipped (smoke/legacy) |
| frontend `npm run check` | vue-tsc clean, 67 Vitest passed, build ok |
| ruff check / format | clean |
| mypy (`--python-version 3.12`) | only `type-arg` errors for bare `np.ndarray` from the local numpy 2.2 stubs - the same class as the 23 pre-existing ones in `core/audio`; no other error |
| workflow validation | all blueprints and templates ok |
| extra fuzzing (not in the suite) | 5 000 random models + 3 000 accepted texts (S2/S3/S6); 2 000 random edit sequences × 25 steps (validity, round trip, locality) - no failure |
| not run | browser checks (`tools/browser_check.mjs`) - the dialog's gate banner and disabled Apply are covered by Vitest only; real SR/separation engines, GPU runs, listening (L1-L4) |

---

## 18. Sources

- Upstream code read for this plan: ComfyUI 0.37.0 (`comfy/sd.py`, `comfy_extras/nodes_yue2.py`, `comfy/text_encoders/yue2.py`, `comfy_extras/nodes_audio.py`), `plenio/third_party/yue2_abc_tools.py` (YuE commit `e76a8753`), the legacy toolkit (`flashsr_audio.py`, `audio_lowpass.py`, `audio_hf_repair.py`, `minimax_audio_branch.py`, `prompt_metadata.py`, `flashsr_inference/NOTICE.md`).
- FlashSR — paper: [arXiv 2501.10807](https://arxiv.org/abs/2501.10807); inference code: [jakeoneijk/FlashSR_Inference](https://github.com/jakeoneijk/FlashSR_Inference); weights: [laion/FlashSR_One-step_Versatile_Audio_Super-resolution](https://huggingface.co/laion/FlashSR_One-step_Versatile_Audio_Super-resolution).
- UniverSR — paper: [arXiv 2510.00771](https://arxiv.org/abs/2510.00771); code: [woongzip1/UniverSR](https://github.com/woongzip1/UniverSR); demo: [woongzip1.github.io/universr-demo](https://woongzip1.github.io/universr-demo/); weights: [woongzip1/universr-audio](https://huggingface.co/woongzip1/universr-audio).
- AudioSR — [arXiv 2309.07314](https://arxiv.org/abs/2309.07314), [project page](https://audioldm.github.io/audiosr/). LatentFlowSR — [arXiv 2604.09188](https://arxiv.org/abs/2604.09188).
- Separation — [ZFTurbo/Music-Source-Separation-Training](https://github.com/ZFTurbo/Music-Source-Separation-Training); BS-RoFormer paper [arXiv 2309.02612](https://arxiv.org/abs/2309.02612); MSST framework [arXiv 2607.23395](https://arxiv.org/abs/2607.23395); Demucs weight licence: [facebookresearch/demucs#327](https://github.com/facebookresearch/demucs/issues/327), [adefossez/demucs](https://github.com/adefossez/demucs); ComfyUI ecosystem: [ComfyUI-MelBandRoFormer](https://github.com/ethanfel/ComfyUI-MelBandRoFormer), [audio-separation-nodes-comfyui](https://github.com/christian-byrne/audio-separation-nodes-comfyui), [Comfy workflow MelBandRoFormer](https://comfy.org/workflows/audio_melbandroformer_audio_separation-99aec65eea89/).
- Statements about weights licences are taken from the model cards and repositories as found on 2026-09-27; each is re-checked when the catalogue entry is written (K3).
