# Testing Strategy (package item N)

| | |
|---|---|
| Status | Phase 1B design baseline |
| Date | 2026-09-25 |
| Related | [target-architecture.md](target-architecture.md), [implementation-roadmap.md](implementation-roadmap.md) |

Legacy lesson (Phase 1A TP-28): 1 337 tests, mostly structural and mocked, no real-model regression, many tests pinning workflow layout. Plenio tests **behaviour and contracts**, keeps real-model evidence separate and honest, and does not pin cosmetic layout.

---

## 1. Verification levels (used in every phase report)

| Level | Label in reports | Proves |
|---|---|---|
| V1 | **unit / mocked** | logic of pure functions and node adapters with fakes |
| V2 | **integration (host, fakes)** | behaviour inside a real ComfyUI execution engine: laziness, caching, blocking, validation, routes, templates — with heavy native nodes replaced by fakes |
| V3 | **real model output** | the real models ran on real hardware and produced audio/score/text that passed the stated checks |
| V4 | **listening / study** | human listening or labelled studies (instrumental rate, cover identity, mastering) |

A phase may only claim what its highest executed level supports.

---

## 2. Test layers

| Layer | Tooling | Scope | Runs in CI |
|---|---|---|---|
| **Unit** | pytest (+ hypothesis for invariants) | all of `plenio.core`: score (parse/validate/ops/display/offset map), lyrics (sections, alignment losslessness, fit), sheet (states, conflicts, fingerprint), writing (compose, parse, enforcement reports), engines (rules, budgets with fixture tokenizers), brief (templates), audio DSP, release (naming, tags, records, redaction), assets (catalogue, offline policy), workers (protocol with a fake worker) | yes |
| **Contract** | pytest + JSON Schema | V3 node schemas (IDs, input/output types, defaults, `advanced`/`lazy` flags, tooltips present); custom IO types; `plenio.report/1`, `plenio.sheet_state/1`, `plenio.record/1`; route request/response shapes | yes |
| **Import boundary** | pytest (AST scan) | `plenio.core` imports nothing from `comfy*`, `folder_paths`, `server`, `nodes`; no ComfyUI source copied (licence hygiene) | yes |
| **Workflow / blueprint validation** | pytest over JSON | every template and blueprint: known node types (core list of the pinned ComfyUI + Plenio), typed links, acyclic, promoted inputs as documented, **embedded subgraph definitions equal the blueprint files**, `properties.models` present and pinned for every loader, optional blocks bypassed as designed, no local paths/IPs/secrets, grouped layout present (not pixel positions) | yes |
| **Host integration** | pytest with a pinned ComfyUI checkout (CPU) + a test extension providing fakes | execution of real graphs: lazy evaluation (which nodes ran), cache reuse across runs, ExecutionBlocker review gates, conflict stops, validation-time behaviour of bypassed blocks, routes over HTTP, template loading, workflow save/reload round trip of `sheet_state` | yes (separate job) |
| **DSP regression** | pytest + numpy | deterministic synthetic signals; metrics with tolerances; ported algorithms compared against golden outputs produced once from a legacy scratch copy (provenance recorded); bypass/format/sample-rate behaviour | yes |
| **Frontend** | Vitest + happy-dom | editor session store, history, selection ↔ note-id mapping, commit/approve semantics, route client errors, widget (de)serialisation | yes |
| **Frontend e2e** | Playwright (opt-in) | against a running ComfyUI: open dialog, edit, apply, save/reload, run, conflict and approval flows | no (manual/nightly) |
| **Smoke (real models)** | pytest marker `smoke`, local GPU | short real runs per path (see §6) with timing and memory notes | no (local, results stored) |
| **Studies** | scripted protocols + listening notes | instrumental rate, detector calibration, ASR WER, cover identity, mastering A/B | no (recorded as data) |

---

## 3. Fakes and fixtures

### 3.1 Fakes (model-independent)

| Fake | Replaces | Behaviour |
|---|---|---|
| `FakeTokenizer` | engine tokenizer handle | deterministic token counts (character-class based) for budget tests |
| `FakeClip` | YuE2/MiniMax CLIP in Engine Profile tests | exposes the attributes Engine Profile inspects; wrong-engine variant |
| `FakeTextGenerate` (test node) | native `TextGenerate` | returns canned LLM answers (valid, malformed, instrumental-violating, section-mismatch) |
| `FakeYuE2Plan` / `FakeYuE2Render` (test nodes) | native YuE2 nodes | return fixture ABC / synthetic audio of the requested length; record inputs for WYSIWYG assertions |
| `FakeSheetSage2` (test node) | native transcription | returns fixture ABC; failure variants |
| `FakeAsrWorker` | ASR worker process | canned timed transcripts, delays, crash, timeout, empty result |
| `FakeSeparation` | separation worker | returns stems from fixture mixes |

### 3.2 Fixtures

- **ABC corpus**: upstream documentation examples, real SheetSage2 transcriptions (from Phase 4A), edge cases — accidentals propagating across octaves, ties across bars, key and meter changes inside groups, `Z` multi-bar rests, empty `Vocal` voice, chord symbols in rests, invalid bars, unsupported constructs.
- **Lyrics**: sectioned samples (EN/DE), repeated lines, instrumental tag-only forms, mismatching sections.
- **Transcripts**: timed words with overlaps, gaps, words outside vocal sections.
- **LLM answers**: well-formed, extra chatter, missing sections, thinking tags, instrumental with words, overlong style.
- **Audio**: synthetic sines/sweeps/noise/transients/clipped signals; short licensed test clips only where redistribution is allowed (otherwise generated locally, not committed).

---

## 4. Key test matrices

### 4.1 Song Sheet precedence (per document)

| state × upstream | unchanged | changed | failed | not evaluated |
|---|---|---|---|---|
| auto | upstream text | upstream text | stop with upstream error | — |
| edited | edited text | **conflict stop** | stop | — |
| manual | manual text | manual text | manual text (upstream not executed) | ✓ asserted: upstream node did not run |

Plus: review gate (unapproved → blocked outputs; approved → pass; approved then document changed → blocked again), validation errors block, warnings pass and are recorded.

### 4.2 YuE2 Cover

The matrix in [yue2-cover-design.md](yue2-cover-design.md) §14 (vocals × harmony × lyrics state × score state × review × failures × resources). Each case asserts executed nodes, final documents, blocked outputs and report contents.

### 4.3 Instrumental

Deterministic guarantees (G1): tag-only lyrics, silent `Vocal` voice, absence of vocal terms in style — for every path and every document state. Detector and retry logic with fake takes (passing, failing, ties).

### 4.4 Resource lifecycle

Worker: start with memory request, progress, cancel via interrupt, idle timeout, crash with stderr tail, CPU fallback only when requested, no sticky state across calls. Assets: offline mode errors, resume after interruption, size mismatch, licence notice. Optional dependencies: node registration without the dependency, actionable execution error.

### 4.5 Export

Naming patterns incl. Unicode and Windows-reserved names, collisions, formats (FLAC 24-bit, MP3 V0, WAV float), sample-rate preservation (no silent resampling), tags and cover round trip, record completeness and secret redaction, atomic writes on failure.

### 4.6 DSP

EQ response vs. analytic biquad response; auto-EQ bounded corrections; compressor static curve and time constants; limiter true-peak ceiling at the final rate (4× oversampled measurement); loudness vs. `pyloudnorm` oracle (dev dependency) within ±0.1 LU on reference signals; resampler passband/stopband; bypass identity.

---

## 5. Tooling and gates

- `ruff` (lint/format), `mypy --strict` for `plenio.core`, `tsc --noEmit` + ESLint for the frontend.
- Coverage: `plenio.core` ≥ 90 % lines; branch coverage required for `core.sheet`, `core.score.ops`, `core.lyrics.align`.
- Licence/NOTICE check: every bundled third-party file has an entry in `THIRD_PARTY.md`.
- Template leak scan: no absolute local paths, IPs, user names, API keys.
- CI matrix: Windows + Linux; Python versions supported by the pinned ComfyUI; frontend build must reproduce the committed `web/js` output (build determinism check).

---

## 6. Smoke tests with real models (local, opt-in)

| ID | Path | Content | Checks |
|---|---|---|---|
| S-1 | YuE2 Song | 30–45 s sung song from a fixed brief, int8 checkpoint | completes; score valid; conditioning recorded equals sheet output; audio length ≤ ceiling; record written |
| S-2 | YuE2 Song instrumental | same with instrumental brief | G1 guarantees; detector report present |
| S-3 | YuE2 Cover | short licensed or user-owned source, new lyrics | transcription valid; lyrics sections match; render completes |
| S-4 | YuE2 Cover original lyrics | ASR worker + alignment + manual correction | no ASR re-run for manual lyrics; conflict flow; edited lyrics still valid after a server restart (ASR cache) |
| S-5 | MiniMax | 30 s song | token budget check exact; render completes |
| S-6 | Writer | TextGenerate draft with default writer model | parse passes; time and memory noted |
| S-7 | Master + Export | real take through Master and Export | loudness/true-peak targets met; files and tags valid |

Results (time, peak memory where measurable, pass/fail, notes) are stored in `docs/test-reports/<date>-<phase>.md`. A smoke test never counts as a listening test.

---

## 7. Phase additions

| Phase | Adds |
|---|---|
| 2 | test harness, import-boundary test, contract scaffolding, workflow validator, host-integration harness with a trivial node, worker protocol tests, config/asset tests, spikes AS-02/03/06/10 as tests |
| 3 | score/lyrics/sheet/writing/engine unit tests, YuE2 blueprint validation, host tests for laziness/review/caching, S-1, S-2 (G1 part), S-6 |
| 4A | study protocols I-1…I-6, Q-C1…Q-C8 with data (done: `docs/test-reports/2026-09-25-phase-4a.md`, scripts in `tools/studies/`) |
| 4B | cover matrix ([yue2-cover-design.md](yue2-cover-design.md) §18), `core.lyrics.align` tests on synthetic grids and on the recorded 4A study data (regression: the 4A accuracies must not drop), contract tests for the SheetSage2 internals used by Transcribe Score (ABC equals the native node, timeline bar count) and for the ASR worker on a short sung fixture, detector tests, sung-lyrics check, S-3, S-4, instrumental cover smoke run |
| 5 | frontend unit/component tests, e2e flows, save/reload, editor-route tests |
| 6 | MiniMax rules/budget tests, blueprint validation, S-5 |
| 7 | DSP regression suite, export matrix, bypass tests, S-7 |
| 8 | template/App configuration tests, usability checklist, full smoke pass |
| 9–10 | audit re-runs everything; coverage and flakiness review |
