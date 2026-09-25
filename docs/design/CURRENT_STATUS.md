# Current status (handoff checkpoint)

| | |
|---|---|
| Date | 2026-09-25 |
| Written for | the return from the Claude Code cloud session to the owner's Windows machine (the real-model pass that the Phase 10 acceptance depends on) |
| Overall phase | **Phase 10 done (accepted with conditions); release 0.2.0 prepared** - publishing steps with the owner |
| Sub-phase | - (hard stop after Phase 10) |
| Phases done | 1A, 1B (design), 2 (Foundation), 3 (YuE2 Core), 4A (Cover/Instrumental design gate), 4B (YuE2 Cover), 5 (Score / ABC editor), 9 (audit), 10 (acceptance review); 6 (MiniMax), 7 (Audio production chain) and 8 (Main workflows and UX) implemented, their real-model checks open |
| Prompt set | `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio_Music_Production_System_Refactor_Prompts\` on the owner's machine (not in this repository): `01_PHASE_1A` ... `12_PHASE_10`, one phase per prompt, hard stop after each phase, the next phase only on the owner's explicit authorization |

Read with: the [Phase 10 acceptance report](../audit/2026-09-25-phase-10-acceptance.md) (verdict, conditions, limitations), [README.md](README.md) (design index), [implementation-roadmap.md](implementation-roadmap.md), [docs/dev/extending.md](../dev/extending.md), [score-editor-design.md](score-editor-design.md) (§15 = Phase 5 implementation record), [target-architecture.md](target-architecture.md) §0/§2/§18, the test reports [phase 6](../test-reports/2026-09-25-phase-6.md), [phase 7](../test-reports/2026-09-25-phase-7.md) and [phase 8](../test-reports/2026-09-25-phase-8.md), the [usability review](usability-review.md) and the [Phase 9 audit](../audit/2026-09-25-phase-9-audit.md).

---

## 1. What has been completed

**Before Phase 6** (reports in `docs/test-reports/`): Phase 2 foundation; Phase 3 *1 · YuE2 · Song*; Phase 4A cover/instrumental design; Phase 4B *2 · YuE2 · Cover*; Phase 5 score editor (done, owner-verified: 557/559 passed, browser checks, YuE2 Song and Cover with A/B).

**Phase 6 - MiniMax Music 3** ([report](../test-reports/2026-09-25-phase-6.md)):

- `plenio/core/engines/minimax.py`: structured caption (Global Metadata / Vocal Details / Arrangement), exact 5 000-token budget through the loaded tokenizer (estimate otherwise), ceiling 10...360 s, instrumental conventions (tags-only map about 2x a sung song's sections, Vocal Details `n/a`), `describe_budget`; YuE2 module got the same interface.
- Engine Profile detects `MiniMaxMusic3Tokenizer`; Song Sheet labels the style document *Caption* (multi-line).
- Blueprints *Plenio · MiniMax Model*, *Plenio · MiniMax Render*; template **3 · MiniMax · Song**; user guide `docs/user/paths/minimax-song.md`.

**Phase 7 - Audio production chain** ([report](../test-reports/2026-09-25-phase-7.md)):

- `plenio/core/audio/`: `loudness` (BS.1770-4, EBU 3342, true peak), `resample` (band-edge Kaiser), `eq` (RBJ biquads, response, spectral profile, tone-match fit), `dynamics` (compressor, limiter, `master()` with budgets), `presets` (`resources/presets/{loudness,eq}.json`).
- Nodes **EQ** (curve widget `frontend/src/extension/eqWidget.ts`) and **Loudness & Dynamics**; routes `/plenio/presets/{kind}`, `/plenio/eq/response`.
- **Export Release** full: FLAC 24-bit / MP3 V0 / WAV float, tags typed or copied from the loaded file, cover (embedded with optional mutagen), original take, loudness in the record (`plenio/core/release.py`, `plenio/comfy/nodes/export.py`).
- Blueprint *Plenio · Master*; template **4 · Enhance & Master**; docs `docs/user/paths/enhance-master.md`, `docs/user/concepts/mastering.md`.
- Restoration gate: script `tools/studies/restoration_gate.py`; C1 provisionally *no Repair node* (only an already-mastered take was available).

**Phase 8 - Main workflows, subgraphs and UX** ([report](../test-reports/2026-09-25-phase-8.md)):

- Model catalogue `resources/models.toml` + `plenio/core/models.py` (inventory, readiness); `tools/build_graphs.py` writes the loaders' download entries from it.
- Blueprint *Plenio · Cover Art* (FLUX.2 Klein 4B distilled), bypassed in templates 1-3; *Plenio · Master* before Export in templates 1-3 (raw take as `original`).
- Final templates 0-4 (all generated): numbered groups, one About note, collapsed model block, *(optional)* titles, App configurations (`extra.linearData`) for 0, 1, 3, 4; thumbnails (`tools/build_thumbnails.py`).
- System Check full (`plenio/core/system.py`: template readiness, model table, assets, rule table `RULES`); route and node via `shared.system_report()`.
- Checks: validator template rules, `tests/workflows` catalogue tests, `tools/browser_check.mjs` (56/56), smoke tests `tests/host/test_song_models.py` (S-1, S-2, S-6) and `tests/host/test_cover_art_models.py`.
- Docs: `docs/user/{models,troubleshooting,getting-started}.md`, `docs/user/concepts/app-mode.md`, path guides, README; `docs/design/usability-review.md`.

**Phase 9 - full codebase audit** ([report](../audit/2026-09-25-phase-9-audit.md)): full read of the product code, reproduction on real servers, fuzzing of the parsers (1 500 texts x 11 functions) and of the score operations (10 257 operations), audio edge cases, profiling. 18 findings - 1 high (a malformed user template made the whole Plenio import fail), 5 medium (ASR language of new-lyrics covers, MP3 above 48 kHz, release naming/overwritten records, quadratic editor, System Check with a broken config), 10 low, 2 info - all high/medium/low fixed with regression tests (`tests/unit/test_audit_regressions.py`, `tests/host/test_audit_regressions.py`, `tests/contract/test_audit_regressions.py` and additions to existing files); dead code removed; three observations deferred with reasons.

**Phase 10 - final architecture acceptance review** ([report](../audit/2026-09-25-phase-10-acceptance.md)): **accepted with conditions**. Measured: no import cycles, layer rules hold, `plenio.core` 93.7 % line coverage, the adapter layer 73-100 % with the host tests (subprocess coverage), CI history through the GitHub API, CI environment reproduced (fresh clone, CPU without AVX-512, CRLF checkout, non-root, Python 3.10), generated files reproducible, 183 doc links intact, three full runs without a flaky test. Findings: the CI had been red on all 16 commits (ACC-01, fixed: first green run `3a9fda1`), the owner's reported pass ran a Phase 5 checkout with every host test skipped (ACC-02, open), the release record schema was not pinned (ACC-03, fixed), a stale node snapshot, Score Tools without host coverage, an implicit engine interface and licence facts in three places (ACC-04...07, tests added); `docs/dev/extending.md` lists the extension points with their guards.

## 2. Partially implemented

- MiniMax: instrumental caption wording (I-5) adopted from the legacy toolkit, not yet listened to.
- Restoration decision C1 needs measurements on unprocessed takes.
- App mode shows only the sung options of *vocals* (frontend limit, documented).
- File sizes of the writer and the adapter are not in the catalogue (no source here); licences of the FLUX.2 text encoder and VAE to be confirmed on the model cards before a public release.

## 3. What remains (the acceptance conditions, on the owner's machine)

Done by the owner (reported 2026-09-25): the Phase 9 fixes - a *new lyrics* cover transcribes the source in its own language (the transcription itself not always exact), MP3 export of a 96 kHz file, editor speed on a long YuE2 plan - and the templates in frontend 1.53.6 ("passt"). The reported full-suite run does **not** count: it ran a checkout at Phase 5 (560 tests) without `PLENIO_COMFYUI_ROOT`, so every host and smoke test was skipped.

1. **Update the checkout that runs the tests** (`git pull origin main`; 766 tests are collected now) and run the **full suite with the real models**: `PLENIO_COMFYUI_ROOT`, `PLENIO_MODELS_DIR`, `PLENIO_SMOKE=1` (commands in the acceptance report §6). This covers the tokenizer contract tests, S-1...S-7 and Cover Art.
2. Template runs of *3 · MiniMax · Song* (sung and instrumental) with a listening verdict on I-5; MiniMax has never run with the real model.
3. *4 · Enhance & Master*: curve widget, save/reload of a manual EQ, A/B; restoration gate on unprocessed takes and the C1 decision.
4. One first-use run of each template following only its About note; the System Check against the real models folder.
5. Record the results in the Phase 6-8 reports and set the roadmap statuses of Phases 6-8 to *Done*.

## 4. Important architectural decisions since Phase 1

- D-01...D-09 (ADR-0001...0009): per-path templates, Apache-2.0, native text generation, ASR by measurement, optional separation, instrumental adapter, clean break, English everywhere, package identity.
- Two Song Sheets per path (text and score); what leaves a sheet reaches the model unchanged; precedence manual > edited (while its draft is unchanged) > draft; conflicts instead of silent replacement; approval bound to a backend fingerprint.
- Covers: score first (Transcribe Score keeps the SheetSage2 beat grid as `PLENIO_TIMELINE`), lyrics second; faster-whisper large-v3 in a worker, only over vocal regions, fixed seed, disk cache (reproducible drafts); pickup-rule alignment; Whisper weak-segment filter.
- Instrumental: Song path `[instrumental]` tag, adapter bypassed; covers: section tags, adapter on (lazy switch); Check Vocals = SheetSage2 vocal notes, any note fails (owner calibration); Takes = native loop gated on the final lyrics (a blocked loop hangs ComfyUI 0.37.0).
- New-lyrics quality: text-sheet warnings for syllables per note (0.85-1.3) and voice register; per-line syllable targets from the sectioned ASR draft.
- Qwen3-ASR: evaluated; **owner: optional engine only**, built with a managed isolated environment in a later phase.
- Release records: only class/inputs/title of prompt nodes; licences of referenced non-commercial model files.
- Frontend: the one R11 exception - Plenio DynamicCombo nodes wrap `configure` (frontend 1.53.6 restore defect).
- Phase 5: the canonical ABC text is the only score model in the editor; every view comes from the backend for exactly the current text; element ids + per-element source/display ranges instead of an offset map; playback with offline WebAudio tones instead of the abcjs synth (which downloads a soundfont); `display_abc` is display-only.
- Phase 6: each engine module owns its conditioning rules and budget description (`rules_for(engine).describe_budget`); MiniMax budget errors stop at the Song Sheet with the exact count; the caption is a multi-line style document.
- Phase 7: Plenio's own loudness meter (no FFmpeg subprocess); resample before dynamics; one EQ node with tone match as a mode; mutagen stays optional (GPL, never installed); tag copy reads the one Load Audio file from the prompt; Export's format widgets are optional so API prompts of earlier phases keep working.
- Phase 8: one model catalogue feeds templates, System Check and docs; optional blocks (Cover Art, adapter, excerpt, sung-lyrics check) are bypassed and titled *(optional)*; Master is part of every song template; App configurations only for paths without review stops, the graph stays primary; blueprint bodies own distinct node-id ranges; the System Check's rule table states the basis of each row (measured / legacy rating / design).
- Phase 9: user files (templates, config) never stop Plenio from loading - they are skipped or reported; one base name per export; the Cover Brief decides the ASR language only for original lyrics; MP3 is converted when LAME cannot hold the rate.
- Phase 10: text files are checked out with LF everywhere (`.gitattributes`); the release record has a pinned schema (`resources/schemas/record-1.schema.json`); the engine module interface is written down (`MODULE_INTERFACE`) and tested; extension points and their guards are in `docs/dev/extending.md`.

## 5. Files and modules changed last (Phase 10)

- CI and tests: `.gitattributes`, `tests/conftest.py` (GitHub annotations), `tests/unit/test_audio.py` (tone-match tolerance), `tests/host/test_score_tools_node.py`, `tests/host/test_foundation.py` (snapshot), `tests/contract/test_data_schemas.py` and `tests/host/test_production_path.py` (record schema), `tests/unit/test_minimax.py` (engine interface), `tests/unit/test_models_catalogue.py` (licences).
- Code: `plenio/core/engines/__init__.py` (`MODULE_INTERFACE`, `WRITING_RULE_KEYS`), `tools/snapshot_node_types.py` (`take_snapshot`), `tools/data/node_types.json` (refreshed).
- Docs: `docs/audit/2026-09-25-phase-10-acceptance.md`, `docs/dev/extending.md`, annotations in `target-architecture.md` §13/§15/§16.
- Built output committed: `web/js/plenio.js`, `web/js/chunks/*.mjs`; generated: `subgraphs/*.json`, `example_workflows/*.json`, `example_workflows/*.jpg`.

## 6. Known issues

- Upstream ComfyUI 0.37.0: a native loop whose body is blocked never finishes (worked around by gating); the loop body re-runs on every queue; frontend 1.53.6 does not restore `cache_iterations` and misrestores DynamicCombo-first nodes (Plenio nodes repaired, native Start Loop not).
- YuE2 may render a take to the render ceiling and stop mid-phrase (Check Vocals ranks such takes last among clean ones).
- Sung covers with several takes export the first take only (Check Vocals skips sung songs).
- Editor chunk size about 1.4 MB (370 kB gzip), loaded only when a sheet opens.
- Dev tooling: `npm audit` reports a moderate advisory in vitest's mocker (dev-only; the fix is a major vitest upgrade, not done).
- CodeMirror renders only visible lines (tests reading the DOM see a subset).
- mypy with the configured `python_version = "3.10"` fails on the stubs of numpy releases that use 3.12 syntax (seen with the latest numpy in the cloud); CI runs `mypy --python-version 3.12`. The code itself passes the unit tests on Python 3.10 (Phase 10), but CI tests 3.12 only.
- Release 0.2.0 is prepared (`docs/dev/release.md`): the repository `jplenio/Plenio-Music-Production-System` becomes the public one (still private until the owner switches it); the Registry package `comfyui-plenio-music` is published by `.github/workflows/publish.yml` from a GitHub release and needs the secret `REGISTRY_ACCESS_TOKEN`; the README's images (`assets/branding/`) come from the owner.
- CI: green since `3a9fda1`; before that every run was red (acceptance report ACC-01). Job logs are not reachable from the cloud session (their storage host is blocked); failures appear as annotations, readable through the API.
- The tone-match EQ fit differs by up to 0.003 dB between CPUs (floating-point code paths; inaudible).
- Shell pitfall on the owner's machine: bash heredocs with backslashes (`\d`, `\n`, `\a`, `\b`) inserted control characters into code; write code with file-writing tools, and scan for control characters before committing.

- Export widget order changed in Phase 7: workflows saved from the earlier templates restore the Export node's widget values by position; re-add the node or start from the new templates.
- Cloud ComfyUI install (Phase 6/7): `download.pytorch.org` is blocked by the environment's network policy, so pip installed the CUDA torch build from PyPI (about 6.8 GB) instead of the planned CPU build (about 1-1.5 GB); it runs on the CPU. Only the cloud container is affected.

- App mode (frontend 1.52.7) drops the children of the DynamicCombo option that is not selected; the song apps list the sung options only.
- The bundled editor chunk contains 15 control characters from abcjs string literals (minifier output, unchanged since Phase 5); the control-character scan should skip `web/js/chunks/`.

## 7. Tests executed at this checkpoint

| Suite | Where | Result |
|---|---|---|
| Python (unit, contract, workflow, host) with ComfyUI 0.37.0 | cloud, end of Phase 10 | **754 passed, 12 skipped** (models 3, legacy toolkit 1, smoke 7, soundfile 1) |
| Three full runs (flakiness) | cloud | no flaky test (the only failure was a first version of the new snapshot test that depended on the shared server's state) |
| CI on GitHub (Ubuntu + Windows Python, ComfyUI host job, frontend) | GitHub Actions | green since `3a9fda1` (run 36188645235); the Phase 10 commit `588b314`: all four jobs green (run 36191595006) |
| Coverage | cloud | `plenio.core` 93.7 % of lines; `plenio` with the host tests 92 % (lines and branches) |
| Browser checks of all templates (`tools/browser_check.mjs`) | cloud (frontend 1.52.7, Chromium) | **56/56 passed** |
| Smoke S-7 (real MiniMax take, CPU) | cloud | passed |
| Python 3.10 (unit, workflow, data contracts) | cloud | 655 passed, 7 skipped |
| Fuzzers: parsers (1 500 texts), score operations (10 257) | cloud (Phase 9) | no crash, no invalid score |
| ruff check / format, mypy strict | cloud | clean (mypy `--python-version 3.12`) |
| Frontend `npm run check` | cloud | 58 tests passed, build unchanged |
| Workflows (`tools/workflow_validation.py`) | cloud | 10 blueprints + 5 templates valid |
| Phase 5 suite | owner's machine | 557 passed, 3 skipped; with smoke 559 passed, 1 skipped |
| Full suite reported on 2026-09-25 | owner's machine | not valid (Phase 5 checkout, host tests skipped) |

## 8. Tests that need the local GPU / ComfyUI environment

- **Host tests** (`tests/host/`, marker `host`): need a ComfyUI checkout with its Python environment (`PLENIO_COMFYUI_ROOT`); they start a real server on the CPU with fakes. Without it they are skipped.
- **Contract tests** marked `comfy` (ComfyUI importable; e.g. the YuE2 tokenizer test also needs `PLENIO_MODELS_DIR`).
- **Smoke tests** (`PLENIO_SMOKE=1`): `tests/host/test_song_models.py` (S-1, S-2, S-6: YuE2 int8 + writer, SheetSage2 optional), `tests/host/test_cover_art_models.py` (FLUX.2 Klein files), `tests/host/test_cover_models.py` (GPU, SheetSage2, faster-whisper large-v3, the legacy MiniMax sample), `tests/host/test_minimax_models.py` (S-5, MiniMax Music 3 models), `tests/host/test_master_smoke.py` (S-7, CPU, the legacy MiniMax sample or `PLENIO_LEGACY_SAMPLE`).
- **Browser checks** (`tools/browser_check.mjs`, see `docs/dev/testing.md`) and **real template runs** (`tools/dev_server.py --gpu --models <dir> --port 8190 --base <dir>`): YuE2 3B, Gemma 4 writer, instrumental LoRA, SheetSage2; owner's RTX 5060 Ti 16 GB, models in `F:\ComfyUI\models`, ComfyUI 0.37.0 in `D:\Daten2\ComfyUI` (frontend 1.53.6, Python 3.12.9).
- Everything else (unit, workflow, Vitest) runs without ComfyUI (pure Python with numpy; Node for the frontend).

## 9. Exact recommended next action

Run the owner-machine checks of §3 (first the full suite with the real models on the current commit) and record them in the Phase 6-8 reports. The refactor prompt set ends with Phase 10; further work (a public release, the optional Qwen3-ASR engine, fade-out, Repair node C1) needs the owner's decision and authorization.

## 10. Context a new session would otherwise have to rediscover

- **Owner rules**: the legacy repository (`ComfyUI-MiniMax`, owner's machine) is read-only; reply to the owner in **German**, write code and docs in **English**; never install into the owner's ComfyUI environment (dev tools live in the untracked `.devdeps/`); downloads beyond what the owner approved need consent; one phase per authorization with a hard stop; commits: the owner asked for checkpoint commits pushed to `origin/main` (earlier rule "commit only at the end" was lifted for checkpoints).
- **Dev setup (cloud)**: Python 3.12 with `numpy`, `scipy`, `av`, `pyloudnorm 0.2.0`, `mutagen`, `pytest 8.4.2`, `hypothesis 6.168.1`, `ruff 0.13.3`, `mypy 1.18.2`, `coverage`; a ComfyUI 0.37.0 checkout with its own venv for host tests (`PLENIO_COMFYUI_ROOT`); run `pytest` from the repository root (config in `pyproject.toml`; markers `comfy`/`host`/`smoke` skip without their environment). Frontend: `cd frontend && npm ci && npm run check` (writes `web/js/`, which is committed). CI results: `https://api.github.com/repos/jplenio/Plenio-Music-Production-System/actions/runs` (jobs and annotations are readable; logs are not). A test run in a folder whose name is a valid Python identifier makes pytest import the repository's `__init__.py` (clone into a folder with a hyphen, as ComfyUI and CI do).
- **Generated files**: never hand-edit `subgraphs/*.json`, `example_workflows/*.json` or the thumbnails; change `tools/build_graphs.py` (model files: `resources/models.toml`), run it and `tools/build_thumbnails.py`, validate with `tools/workflow_validation.py`. After node schema changes re-run `tools/snapshot_node_types.py` (needs ComfyUI) - the snapshot `tools/data/node_types.json` is committed.
- **Dialect facts**: native two-voice ABC (`Vocal`, `Ins`), fixed 8-line header, groups of 1-4 bars per voice, `% label` comments start sections, accidentals apply by letter across octaves within a bar, unmarked tied continuations keep their pitch, supported lengths {1,2,3,4,6,8,12,16,24,32,48} units, chords only in `Vocal`; the vendored upstream parser `plenio/third_party/yue2_abc_tools.py` is the authority.
- **Fixtures**: `tests/fixtures/abc/upstream-*.abc`, `tests/fixtures/cover/*.json` (real SheetSage2 transcription of M2 with events, YuE2 plans Y2/Y3 with vocal notes and ASR words).
- **Owner verdicts and decisions**: `docs/design/yue2-cover-design.md` §21, `instrumental-strategy.md` §13, listening pack verdicts summarised there.
