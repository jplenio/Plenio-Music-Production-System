# Instrumental Strategy (package item J)

| | |
|---|---|
| Status | **Final specification (Phase 4A design gate, 2026-09-25)**; implemented in Phase 4B after the owner's authorization |
| Scope | Instrumental generation for YuE2 (text), YuE2 Cover and MiniMax Music 3 |
| Related | [yue2-design.md](yue2-design.md), [yue2-cover-design.md](yue2-cover-design.md), [target-architecture.md](target-architecture.md), study data: [2026-09-25-phase-4a.md](../test-reports/2026-09-25-phase-4a.md) |

Instrumental output is treated as a quality requirement. The strategy is **defense in depth**: several independent mechanisms, each of which reduces the chance of vocals, plus measurement of the result. No mechanism is presented as a guarantee it cannot give.

---

## 0. Decisions of this design gate

| Topic | Decision | Evidence |
|---|---|---|
| Deterministic score preparation | **Mandatory on both YuE2 paths** (G1): the final score has no sounding `Vocal` notes — *lead* moves them into `Ins`, *accompaniment* silences them. | [4A E4] without the adapter the planner wrote a vocal melody into **6 of 6** plans for tag-only lyrics (30–219 notes; untimed, bare and timed tags) |
| Instrumental adapter (D-06) | Keys load completely (AS-07 load part **verified**). Stays **optional and bypassed by default**: it removes vocal melodies from plans, but in the text path it made plans very long or unfinished and **every adapter take ended abruptly**. Cover results: §4.2. | [4A E4, E4b] 0 vocal notes in 4/4 valid adapter plans; plans 226–387 s, and 2 of 6 adapter plans never finished (cut at the planner's 8 192-token limit, invalid ABC); 4/4 adapter takes end with the music still at full level (two cut at the render ceiling, one by the context budget) vs 0/6 without the adapter |
| Tag vocabulary / form | Section tags (`[Intro]`, `[Verse]` …) stay the default; bare `[instrumental]` gave no advantage; timed tags do not control the length (63–387 s for an 80-s target). | [4A E4, E4b] |
| Length control of instrumental plans (Song path) | New deterministic Score Tools operation **fit length** (§3.2) instead of relying on the planner. | [4A E4] four tags gave plans of 188–363 s; timed tags 63–387 s |
| Vocal detector for *Check Vocals* | §6.2 | [4A E3] |
| Ending check | Every take's report states whether it ends with the music still playing (tail loudness ≥ 0.5 × the take's median); Export warns and the Master stage (Phase 7) offers a fade-out. | [4A E4] |
| Takes | Default N = 1; cost per take is 0.35–0.55 × the song length on the owner's GPU (§7). | [4A E4/E5] |

---

## 1. Evidence

| Evidence | Tag |
|---|---|
| YuE2 documentation has no instrumental mode, no empty-lyrics convention and no instrument-removal method; the skill warns against claiming instrument removal from checks. | [UP] |
| Users report vocals despite instrumental prompts; tricks (planning `full`, no language/singer in style, empty section tags) work in roughly half the cases, sometimes with "vocal chops". Covering an *instrumental* source reportedly does not invent vocals. | [CM] YuE #172, HF #1 |
| Dedicated AR LoRA `Mothersuperior/YuE2-instrumental-cot-full-loras` — rank 64 on all 28 AR layers, trained on ~2.7 k instrumental tracks with SheetSage2 chord ABC, intended for `cot="full"`; lyrics forms: bare `[instrumental]`, untimed tags, timed tags; ComfyUI-layout file (203 MiB) for the `LoraLoader` **CLIP** slot; CC BY-NC 4.0. | [VF] model card and file listing |
| The LoRA loads onto the native YuE2 CLIP without a single "lora key not loaded" warning, and with the same seed it changes the plan (219 → 0 vocal notes). | **[4A E4]** |
| Without the adapter, YuE2's planner writes a vocal melody for tag-only lyrics in 6/6 plans (`[Intro]…[Outro]` tags, bare `[instrumental]`, timed tags), and usually invents a full song form (5–9 sections). | **[4A E4, E4b]** |
| With the adapter the valid plans contain no vocal melody (4/4) but are long (226–387 s for an intended 80–90 s; 2 of 6 plans ran into the planner's 8 192-token limit and came back truncated, i.e. invalid) and the renders run past the plan's end (+14 s, +55 s, +64 s; two stopped at the render ceiling); all of them end with the music at full level (4/4, incl. the timed-tag take). Without the adapter the renders stop on YuE2's end token 2–6 s before the plan's end and fade to silence (6/6). | **[4A E4]** |
| Legacy measurement: an instrumental cover with zero `Vocal` notes and empty lyrics still produced ASR-recognisable Style phrases; after removing prose from the style channel, no Style phrases were recognised, but lyric-like segments remained. | [RE] legacy diagnostics |
| SheetSage2 distinguishes vocal and instrumental melody tracks; upstream calls transcription of generated audio a diagnostic estimate. | [UP] |
| Whisper invents text on instrumental audio ("Thank you for watching!", other languages) with low word probabilities. | **[4A E2]** |
| MiniMax Music 3 lyrics accept `[Instrumental]` and `[Solo]` tags; no instrumental switch is documented. | [UP] |

---

## 2. Guarantee levels

| Level | Meaning | Examples |
|---|---|---|
| **G1 Guaranteed by deterministic preprocessing** | A property of the conditioning, verified by validators before generation. | lyrics contain no words; score has no sounding `Vocal` notes; style contains no vocal/language/singer terms |
| **G2 Strongly encouraged by conditioning** | Conditioning that the model responds to, without a hard guarantee. | full planning with tag-only lyrics; instrumental descriptors; lead instrument named |
| **G3 Adapter-assisted** | A trained adapter shifts the model's distribution. | instrumental AR LoRA (optional) |
| **G4 Probabilistic** | What the model actually renders. | any residual humming, chops, choir-like pads, spoken fragments |
| **G5 Measured** | Detection with known false-positive/negative behaviour. | Check Vocals report per take |

The UI and documentation say exactly this: *"Plenio guarantees an instrumental conditioning. The audio itself is checked, not guaranteed."*

---

## 3. YuE2 text-to-music (YuE2 Song path)

### 3.1 Layers

| Layer | Mechanism | Owner | Level |
|---|---|---|---|
| Native | Planning `full`. Lyrics = section tags only, one per line (the writer's section plan). | Write Song, Song Sheet · Text, YuE2 Plan | G1/G2 |
| Conditioning | Style: concise positive descriptors — genre, instruments, lead instrument, tempo, mood; **no** language, vocal character, singer, choir, humming, and no negated vocal terms. | Compose → Parse → Song Sheet validation | G1 (terms absent) / G2 |
| Score | Score Tools *prepare from brief*: *lead* moves `Vocal` notes into `Ins`, *accompaniment* silences them — **needed in practice** (6/6 plans without the adapter had a vocal melody). Validated: no sounding `Vocal` notes. | Score Tools, Song Sheet · Score | G1 |
| Length | Score Tools **fit length** (§3.2) when the plan is longer than 150 % of the brief's target. | Score Tools, Song Sheet · Score | G1 (score length) |
| Adapter | Instrumental AR LoRA on the CLIP, bypassed by default (§10). | YuE2 Model block | G3 |
| Validation | Check Vocals per take (§6); ending check. | Check Vocals | G5 |
| Retry | Optional Takes block (§7). | Takes, Check Vocals | G4 → G5 |
| Fallback | Optional explicit vocal removal (§8), off by default. | user | — |

### 3.2 Length of instrumental plans

With tag-only lyrics the planner decides the length by itself: four tags gave plans of 188–257 s without and 226–363 s with the adapter [4A E4]; timed tags for 80 s gave 63–387 s [4A E4b] (Phase 3's single instrumental run happened to give 79 s). A very long adapter plan also exhausted the context budget: the render stopped at 300 s, 87 s before the plan's end. The Phase 3 length control (one sung line ≈ 8 s) does not apply to instrumentals.

**Truncated plans:** a plan that stops at the planner's token limit (`max_abc_tokens`, default 8 192) ends inside a group and is invalid ABC [4A E4]. The score sheet recognises it (invalid last group and planner token count at the limit) and says so explicitly ("the planner did not finish — re-plan with another seed or use *fit length*"); *fit length* removes the incomplete trailing group first and reports it.

**Fit length** (new Score Tools operation, deterministic, reported): keep whole sections from the start while the score stays within the target, then append the plan's final section (usually the outro) so the song still ends; never cut inside a section; if even the first section plus the ending exceed the target, keep them and warn. The score sheet shows the removed sections, the user can edit or switch the document to manual. The render still receives the text sheet's tags (WYSIWYG); if they no longer match the fitted score's sections, the score sheet reports it as a warning (tags are not sung; YuE2 reads them as structure hints).

Timed tags (the adapter card's third form, `[intro 0:00-0:12]` … for an 80-s target) were measured as a conditioning-level alternative and are **not reliable** as length control: see the test report §E4b.

## 4. YuE2 Cover (instrumental modes)

### 4.1 Layers

Same layers as §3.1, with these differences:

- **Score** comes from SheetSage2 (the source's melody); the user chooses *instrument plays the vocal melody* (vocal notes move into `Ins`) or *accompaniment only* (vocal notes silenced). Rules in [yue2-cover-design.md](yue2-cover-design.md) §9. No length fitting (the source defines the length).
- **Planning mode** is derived from the score (harmony choice): `melody` (default) or `full`.
- **Lyrics**: section tags of the final score.
- **Accompaniment only + new harmony** keeps only the instrumental line (25 notes in 42 bars for the test source) — the Cover Brief warns that the result will barely resemble the source.
- **Validation**: the loaded SheetSage2 encoder is reused — no extra download.

### 4.2 Measured [4A E5]

See the test report §E5: per condition (lead/accompaniment × harmony new/keep × adapter off/on, two seeds) the vocal detectors, melody overlap with the source, chord agreement, duration vs. score and the ending check.

## 5. MiniMax Music 3

| Layer | Mechanism |
|---|---|
| Native | lyrics made of `[Intro]`, `[Instrumental]`, `[Solo]`, `[Outro]` … tags only |
| Conditioning | structured caption with instrumental genre/arrangement; vocal-details section omitted or stated as instrumental (wording decided by Phase 6 tests) |
| Score | none (no symbolic input) |
| Adapter | none known |
| Validation / retry / fallback | as for YuE2 |

---

## 6. Validation design (Check Vocals)

**Input**: one take or a list of takes (from the Takes loop), the brief (expected instrumental), optional detector resources.

### 6.1 Detectors

| Detector | Signal | Strengths | Known failure modes | Resource |
|---|---|---|---|---|
| `score` | SheetSage2 re-transcription of the take (takes longer than one native 300-s window in pieces of ≤ 300 s, because a second native window ran out of memory on 16 GB — report §E3): notes and seconds in the `Vocal` track | reuses a model that is loaded in covers; separates vocal and instrumental melody | vocal-like leads may count as vocal; spoken/whispered voice and chops are missed; slow (≈ 0.3–0.6 × the take's length) | SheetSage2 (1.29 GiB) |
| `words` | ASR word count with word probability ≥ 0.5 per minute | readable evidence (the words) | Whisper invents words on music (low probability); not loaded in instrumental paths otherwise | ASR worker |
| `listen` | Gemma 4 (native `TextGenerate` with audio) answers yes/no per 30-s window | no extra model if the writer is Gemma 4 | reliability [4A E3] | writer model |
| `stems` | separation → vocal-stem energy | catches speech and chops | separation artefacts; extra model | not built (C2) |

### 6.2 Measured and chosen

See the test report §E3 for the per-take table. Thresholds are written into `core.vocals` together with this calibration record; the verdict is labelled *uncalibrated* for any detector/threshold pair that the owner's listening verdicts have not yet confirmed.

**Output**: `passed` (BOOLEAN), best take (AUDIO), report with per-take metrics, the detector's known limits, the thresholds used and the ending check.

## 7. Retry design (Takes)

- Native `StartLoop` (N iterations) → `Math Expression` (`take_seed + iteration_index`) → engine Render → `EndLoop(accumulate=True)` → Check Vocals (list input) [VF node set]; AS-16 (loops inside a blueprint) is verified in 4B.
- Native loops run a fixed number of iterations [VF], so N takes cost N renders. Measured cost per take on the owner's RTX 5060 Ti with YuE2 int8: 0.35–0.55 × the audio length (e.g. 29 s for an 83-s cover, 78 s for a 185-s take, 237 s for a 427-s take) [4A E4/E5]. Default N = 1; users choose N explicitly.
- Ranking: first take whose verdict passes; otherwise the take with the lowest vocal metric; ties keep the earliest. All takes are recorded; only the selected take continues to mastering.
- Early-exit retries would require a custom expansion node; not planned.

## 8. Fallback: vocal removal (explicit, off by default)

- Separation of the final take into stems, output = accompaniment stem, marked in UI and record as *processed by vocal removal*.
- Only with an explicit user switch (the owner rejected separation of delivered audio; confirmed 2026-09-25).
- Never automatic, never silent. Not part of 4B (C2 not built).

---

## 9. User-facing choices

| Choice | Where | Visibility |
|---|---|---|
| sung vs. instrumental | Song Brief / Cover Brief `vocals` | normal |
| *instrument plays the melody* vs. *accompaniment only* | Brief (`vocals = instrumental`) | normal (only when instrumental) |
| lead instrument | Brief | normal (optional) |
| adapter on/off | YuE2 Model block (bypass) | advanced, documented with its measured side effects |
| takes N | Takes block | normal when the block is enabled |
| detector, threshold | Check Vocals | detector normal, threshold advanced |
| vocal removal fallback | not offered in 4B | — |

Vocal controls (language, voice, theme) do not exist while *instrumental* is selected (DynamicCombo).

---

## 10. LoRA / adapter verification checklist

| Item | Status | Evidence |
|---|---|---|
| actual existence | **verified** | HF repository, file `ar_lora_inst_v3abc_comfyui.safetensors` (203 MiB) |
| compatibility (native YuE2, CLIP slot) | **verified** | `LoraLoader` (strength_clip 1.0, strength_model 0) → no "lora key not loaded" warning; same seed changes the plan [4A E4] |
| model/version support | YuE2-3B int8 (Comfy-Org repackaging) | [4A E4]; re-check if Comfy-Org repackages YuE2 |
| licence | **CC BY-NC 4.0** | card; same restriction as YuE2 itself |
| maintenance | single community author, released 2026-09-15 | [CM] |
| installation | one file into `models/loras`; template carries `properties.models`; optional block | design |
| quality benefit | **text path: removes vocal melodies from plans, but long or unfinished plans (2/6 truncated) and abrupt endings (4/4)**; cover path: test report §E5; audio vocal-freedom and musical quality: owner listening pack | [4A E4/E5] |
| default | **bypassed** | this gate |

## 11. What cannot be guaranteed

- That no voice-like sound (humming, choir pads, vocal chops, formant-rich synths, spoken fragments) appears in the audio.
- That the lead instrument named in the style is the one rendered.
- That detectors never miss or falsely flag vocals.
- That a take ends musically (the ending check reports it; mastering can fade).

These limits are stated in the node help, the user guide and the release record.

## 12. Phase 4A experiments — results

| ID | Experiment | Result |
|---|---|---|
| I-1 | tag forms × adapter, YuE2 text | §0/§1: vocal melodies in 6/6 plans without, 0/4 with the adapter; adapter plans long or unfinished, abrupt endings; timed tags do not control the length |
| I-2 | adapter with supplied cover scores (melody/full) | report §E5 |
| I-3 | lead vs. accompaniment conversions | lead: melody moved in 37/42 bars, no `Ins` note dropped; accompaniment + new harmony leaves 25 notes; listening: owner pack |
| I-4 | detector calibration | report §E3; owner verdicts complete the labels |
| I-5 | MiniMax caption wording | Phase 6 (MiniMax) |
| I-6 | takes N vs. cost | 0.35–0.55 × audio length per take (plans 7–45 s extra on the Song path) |
