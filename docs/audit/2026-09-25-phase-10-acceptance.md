# Phase 10 - Final architecture acceptance review

| | |
|---|---|
| Date | 2026-09-25 |
| Question | Is the Plenio Music Production System a clean, maintainable architecture that another maintainer would accept? |
| Scope | the repository after the Phase 9 audit (commit `adb05a2`) against its design baseline ([target architecture](../design/target-architecture.md) rules R1-R12 and sections 4-16, [testing strategy](../design/testing-strategy.md) gates, the roadmap's definition of done); the review's own changes are listed in section 3 |
| Host | Claude Code cloud session (Linux, CPU, ComfyUI 0.37.0, frontend 1.52.7); GitHub Actions results read through the API; the owner's reports of 2026-09-25 |
| Verdict | **Accepted with conditions.** The architecture meets its design rules and is maintainable; the verdict on the model-facing paths depends on the owner-machine pass of section 6 |

## 1. Verdict

**Accepted with conditions.** The structure holds everywhere it was measured: the pure core has no ComfyUI dependency and no import cycles, one adapter module touches ComfyUI internals, 14 small nodes replace the legacy 55, generation stays in native nodes, every template and blueprint is generated from one script and one model catalogue, and the test suite covers the core at 94 % of its lines. The main maintainability defect was a **red CI on every one of the 16 commits** before this review (ACC-01). Nobody had noticed it, and the Phase 8 report said it was fixed. It is fixed now: the first green run in the project's history is `3a9fda1`.

Conditions, in order:

1. **Real-model pass on the current commit** (section 6): S-1...S-7 and Cover Art. The run reported on 2026-09-25 used a Phase 5 checkout without `PLENIO_COMFYUI_ROOT`, so no host or smoke test ran (ACC-02). MiniMax Music 3, Cover Art and the mastering chain on unprocessed takes have never run with real models; about a quarter of `plenio/comfy/host.py` (engine detection with the real tokenizers, SheetSage2 internals, GPU memory) runs only there.
2. **Keep the CI green and make it required** once the repository is public; the red CI went unnoticed for 16 commits because nothing depended on it.
3. **Before a public release** (not architecture): the Registry include list (AUD-18a), the public repository that the README's install line names (ACC-10), the licences of the FLUX.2 text encoder and VAE, and the missing file sizes in the catalogue.

## 2. Evidence

### 2.1 Structure

| Measure | Result |
|---|---|
| Modules, internal import edges | 73 modules, 240 edges (AST scan of `plenio/`) |
| Import cycles | **none** |
| Layer rules (R10, section 4) | no `core -> comfy`, no `core -> workers`; ComfyUI internals (`comfy`, `folder_paths`, `server`, `comfy_execution`) imported only by `plenio/comfy/host.py`; `comfy_api` only by the node modules, `extension`, `types` and `host` |
| Third-party imports of `plenio.core` | numpy (7 modules), tomllib/tomli, urllib (asset download), subprocess (workers); no torch, no aiohttp |
| Engine isolation | engine names outside `core/engines/`: detection in `host.py` (by design, section 7.3), licence data (release, System Check), docstrings and messages; one coupling in shared code: the cover writer uses YuE2's melody-register helpers (ACC-08) |
| Size | 11 330 logical lines of Python in 71 files (without the vendored parser); frontend 3 633 lines TypeScript/Vue |
| Functions | 575; median 8 lines; 13 longer than 80 lines (node schemas, Export and Transcribe Lyrics `execute`, `ScoreModel.build`, EQ fit, mastering); 25 above McCabe complexity 10, the highest 17 (`parse_sheet_state`, `ScoreModel.display`) |
| Inventory | 14 nodes (legacy toolkit: 55), conditional nodes C1/C2 not built by measurement; 10 blueprints; 5 templates; 14 node help pages |
| Frontend | knows no engine (the style label comes from the backend payload); documented hooks only (`beforeRegisterNodeDef`, `onExecuted` chaining, `getCustomWidgets`), plus the one recorded R11 exception (DynamicCombo `configure` repair) |

### 2.2 Design rules

| Rule | Evidence | Holds |
|---|---|---|
| R1 native first | generation, loaders, sampling, loops, switches, previews, downloads are native nodes (57 node types in `tools/data/node_types.json`, 14 of them Plenio) | yes |
| R2 one owner per setting | parameter-ownership table (target architecture 10.3), usability review (Phase 8), templates generated from one script | yes |
| R3 links win | native semantics; no field-by-field merging (Song Sheet resolves whole documents) | yes |
| R4 manual text wins | `core.sheet` precedence matrix (unit), a manual document does not evaluate its upstream (`tests/host/test_foundation.py`), conflicts stop (host) | yes |
| R5 WYSIWYG | the fake render receives exactly the sheet outputs (`tests/host/test_song_path.py`); S-1 compares the record with the sheets | yes (V3 on the current commit open) |
| R6 visible transformations | Score Tools node with reports; all five operations now also through a real server (`tests/host/test_score_tools_node.py`) | yes |
| R7 no silent degradation | `dependencies.require()` errors with the install command; unreadable user files are skipped *and* listed (AUD-01); bypassed blocks are titled *(optional)* | yes |
| R8 engine rules follow the model | Engine Profile detects by tokenizer class; host and tokenizer contract tests | yes (MiniMax with the real model open) |
| R9 ComfyUI owns GPU memory | the only memory call is the public `free_memory` before the ASR worker; no `unload_all_models`, no `empty_cache` | yes |
| R10 pure core | import-boundary test and the scan above | yes |
| R11 documented frontend APIs | scan of `frontend/src`; one recorded exception | yes |
| R12 deterministic defaults | the take seed is *randomize*; the draft seed (*Write Song*) and the plan seed (*YuE2 Plan*) stay at 0; the cover-art seed is *fixed* | yes |

### 2.3 Gates of the testing strategy (section 5)

| Gate | Result |
|---|---|
| ruff (lint, format) | clean |
| mypy `--strict` for `plenio.core` | clean (`--python-version 3.12`; the adapter layer is not type-checked, it is covered by host tests) |
| `vue-tsc --noEmit` | clean; **ESLint** was planned but never set up (ACC-13) |
| Coverage `plenio.core` >= 90 % lines | **93.7 % of lines** (5 307 statements; 92 % counting branches) from the unit, workflow and contract tests; `core/workers/runtime.py` runs only inside worker processes |
| Branch coverage of `core.sheet`, the score operations and alignment | 88-100 % (sheet state 88, evaluate 94, resolve 98, edit 95, operations 100, alignment 93) |
| Adapter layer with the host tests | measured in every server subprocess for the first time: `plenio` 92 % overall; nodes 79-100 % except Transcribe Lyrics 65 % (real ASR worker), Transcribe Score 76 % (SheetSage2 internals) and Score Tools 44 % before this review (ACC-05, now covered); `host.py` 73 % |
| Licence/NOTICE check | the 18 bundled frontend packages match `THIRD_PARTY.md` (Phase 9) |
| Template leak scan | `tests/unit/test_import_boundary.py` (legacy ids, local paths) |
| CI Windows + Linux | **red on all 16 commits before this review** (ACC-01); green since `3a9fda1` (run 36188645235: Python on Ubuntu and Windows, ComfyUI 0.37.0 host tests, frontend) |
| Frontend build reproduces `web/js` | yes: CI step *The committed build matches the sources* (green in every run) and locally |

### 2.4 Reproducibility and portability

| Check | Result |
|---|---|
| Fresh clone (no untracked files), the CI's package set | passes: 651 passed, 7 skipped (pyloudnorm, soundfile absent) |
| CPU without AVX-512 (the runners), emulated with `NPY_DISABLE_CPU_FEATURES` and three OpenBLAS kernels | one failure before the fix: the tone-match fit moves by up to 0.003 dB (ACC-01) |
| Checkout with `core.autocrlf=true` (Windows default) | one failure before the fix: the hash-pinned vendored parser (ACC-01) |
| Non-root user | passes |
| Python 3.10 (the declared minimum; CI runs 3.12) | 655 passed, 7 skipped with numpy 2.2, scipy 1.15, av 17 (ACC-11) |
| Generated files | `tools/build_graphs.py` and `tools/build_thumbnails.py` reproduce the committed files byte for byte; the node-type snapshot was stale (ACC-04) |
| Documentation links | 183 relative links in 312 Markdown files, none broken, no broken anchor |

### 2.5 Tests at the end of the review

| Suite | Result |
|---|---|
| Python with ComfyUI 0.37.0 (unit, contract, workflows, host) | 754 passed, 12 skipped (section 7) |
| Frontend `npm run check` | 58 tests in 6 files, type check, build unchanged |
| Browser checks (`tools/browser_check.mjs`) | 56/56 (frontend 1.52.7, Chromium) |
| Smoke S-7 (real MiniMax take through Master and Export, CPU) | passed |
| Real-model smoke S-1...S-6, Cover Art | not run on the current code (section 6) |

## 3. Findings of this review

| ID | Severity | Finding | Status |
|---|---|---|---|
| ACC-01 | high | The CI was red on all 16 commits: until Phase 8 the Python job stopped at mypy, so its tests never ran; since then pytest failed on the runners. Reproduced here: the tone-match golden test used 1e-3 dB tolerances although the fit's flat optimum moves by up to 0.003 dB with the CPU's numpy/OpenBLAS code path (the runners have no AVX-512), and Windows checkouts (`core.autocrlf=true`) changed the bytes of the hash-pinned parser. The Phase 8 report called the CI fixed without seeing a result; the Phase 9 audit did not look at it | fixed: `.gitattributes` (LF checkouts), CPU-independent tolerance (0.01 dB, 0.5 %), failure annotations on GitHub Actions (`tests/conftest.py`); CI green |
| ACC-02 | medium | The owner-machine pass reported on 2026-09-25 is not valid evidence: the checkout was at Phase 5 (560 tests collected instead of 766) and `PLENIO_COMFYUI_ROOT` was not set, so every host and smoke test was skipped | open: condition 1 (section 6) |
| ACC-03 | medium | `plenio.record/1`, the file written next to every song, was the one contract of the testing strategy without a pinned schema | fixed: `resources/schemas/record-1.schema.json`, a contract test on a full record (three formats, 96 kHz MP3 conversion, cover, unmeasurable audio) and schema validation of every record the host tests' real Export writes |
| ACC-04 | low | `tools/data/node_types.json` was stale since Phase 9 (Transcribe Lyrics tooltips); nothing detected it | fixed: refreshed; a host test compares it with a fresh server (`test_the_node_type_snapshot_matches_the_server`) |
| ACC-05 | low | Score Tools: only *prepare from brief* ran through ComfyUI (44 % adapter coverage); a wrong option name would have fallen back to a default unnoticed | fixed: `tests/host/test_score_tools_node.py` (every operation, both conflict policies, compared with the core function) - the mapping was correct |
| ACC-06 | low | The engine module interface that shared code calls was implicit (found by reading the call sites) | fixed: `MODULE_INTERFACE`, `WRITING_RULE_KEYS` (`plenio/core/engines/__init__.py`) and a test per engine; [docs/dev/extending.md](../dev/extending.md) |
| ACC-07 | low | Licence facts live in three places: the catalogue, the engine modules and `MODEL_LICENCES` (what records read); a non-commercial model added to the catalogue only would be missing from records | guarded: a test keeps the catalogue and `MODEL_LICENCES` consistent; consolidation deferred to the next model addition |
| ACC-08 | low | The shared cover writer imports YuE2's `melody_register`/`note_name` (the register hint "YuE2 does not transpose"); the Phase 9 audit's "engine rules only in `core/engines`" was not quite true | documented (extending.md); moves into `writing_rules()` when a second cover engine exists |
| ACC-09 | info | Target architecture sections 13, 15 and 16 still described the Phase 1B plan (score dialect seam, document registry, file names that were never created) | annotated with the state as built |
| ACC-10 | info | The README's install line clones `jplenio/comfyui-plenio-music`, the planned public repository; today the code is in the private `jplenio/Plenio-Music-Production-System` | release item (condition 3) |
| ACC-11 | info | `requires-python >= 3.10`, but CI tests 3.12 only | verified once here (3.10 passes); a 3.10 CI job is recommended |
| ACC-12 | info | Export Release keeps the export orchestration (~150 lines) in the adapter; every step it calls is in `core.release` and host coverage is 93 % | accepted while there is one front end |
| ACC-13 | info | The testing strategy's ESLint gate was never set up | accepted (`vue-tsc` is clean) |
| ACC-14 | info | The tone-match EQ is reproducible on one machine, not bit-identical across CPUs (differences up to 0.003 dB) | documented (inaudible) |

## 4. Remaining limitations

**Product** (documented for users): YuE2 may render a take to the ceiling and stop mid-phrase; sung covers with several takes export the first take; App mode shows only the sung options of *vocals*; cover embedding needs the optional GPL `mutagen`; no fades, restoration, multiband or per-section loudness; SheetSage2 pads to a 300-s window (sources longer than one window run out of memory on 16 GB); native loop limits of ComfyUI 0.37.0 (a blocked loop body never finishes; the body re-runs on every queue); the frontend 1.53.6 DynamicCombo restore repair (R11 exception) stays until the frontend is fixed; the editor chunk is 1.4 MB (370 kB gzip), loaded only when a sheet opens.

**Verification** (V3/V4 open): MiniMax Music 3 with the real model (S-5, tokenizer contract test, template runs, listening check of the instrumental caption wording I-5); Cover Art with the FLUX.2 files; restoration decision C1 on unprocessed takes; the full smoke pass on the current commit; one first-use run per template; the System Check against the real models folder. Checked by the owner after Phase 9: new-lyrics covers transcribe the source in its language, 96 kHz MP3 export, editor speed on a long plan, templates in frontend 1.53.6.

**Deferred with reasons**: fade-out in Master; Qwen3-ASR as an optional engine in an isolated environment (owner decision); vocal separation C2; unknown `[asset_paths]` ids and non-JSON error bodies (Phase 9 section 4).

## 5. Extension points

The touch points as built, and the test that catches a forgotten step, are in [docs/dev/extending.md](../dev/extending.md). In short:

| Extension | Touch points | Guarded by |
|---|---|---|
| Music engine | engine module + registration, detection in `host.py`, blueprints and template (`tools/build_graphs.py`), catalogue, System Check rows, docs | interface test, workflow validator, snapshot test, licence consistency test, help-page and model-guide tests |
| Template | one function in `tools/build_graphs.py`, catalogue entries | validator, workflow tests, browser check |
| Model file | one catalogue entry (+ `MODEL_LICENCES` if non-commercial) | catalogue and licence tests |
| Score operation | `edit.py` + `OPERATIONS`; editor button | editor unit tests, operation fuzzing |
| ASR engine | `ENGINES` in `core/asr.py`, worker; engine widget from the second engine on | worker protocol tests; cache key includes engine and model revision |
| Mastering stage, format | `core/audio`, node, *Master* blueprint; `FORMATS` + record schema enum | bypass-identity and format tests, record schema |
| Document type | `DOCUMENT_KINDS`, sheet inputs/outputs, editor tab, record schema | sheet and schema tests |
| LLM, image model | swap the node inside *Write Song* / *Cover Art* | - |

The MiniMax addition (Phase 6, commit `5e3fb6c`) shows the engine extension in practice: besides its own module, blueprints, template, tests and docs it changed `host.py` (detection), the Song Sheet node (7 lines), the engines registry, the YuE2 module (the same `describe_budget` function), `writing.py` (section maps and multi-line styles from the rules) and two frontend files (the style label). Those shared changes made the style label, the budget text and the instrumental section map data-driven, so a third engine should not need them again.

## 6. Owner-machine pass (condition 1)

In the checkout that runs the tests (the host tests copy the package into an isolated ComfyUI base, so any checkout works), after `git pull origin main` (expect this review's commit or newer, and 766 collected tests):

```powershell
$py = "D:\Daten2\ComfyUI\.venv\Scripts\python.exe"
$env:PLENIO_COMFYUI_ROOT = "D:\Daten2\ComfyUI"
$env:PLENIO_MODELS_DIR = "F:\ComfyUI\models"
$env:PLENIO_SMOKE = "1"
& $py -m pytest
```

Expected: only the skips whose reason names a missing file or package (for example the legacy toolkit or the FLUX.2 files). Then one run of *3 · MiniMax · Song* (sung and instrumental) and of *4 · Enhance & Master* on an unprocessed take (`tools/studies/restoration_gate.py`, C1).

## 7. Verification of this review

| Check | Result |
|---|---|
| Python with ComfyUI 0.37.0, full suite | **754 passed, 12 skipped** (models 3, legacy toolkit 1, smoke 7, soundfile 1); jsonschema in the test process, as in CI |
| Repeated full runs (flakiness) | three runs, no flaky test; the only failure was a first version of the new snapshot test that depended on the shared server's state (user templates and input files of other tests) and now uses a fresh server |
| CI on GitHub | green since `3a9fda1` (run 36188645235); the review's commit `588b314`: all four jobs green (run 36191595006) |
| Coverage | as in section 2.3 |
| Smoke S-7 | passed (real MiniMax take through Master and Export, CPU) |
| ruff, mypy strict, workflow validation, frontend check | clean; 10 blueprints + 5 templates valid; 58 frontend tests |
