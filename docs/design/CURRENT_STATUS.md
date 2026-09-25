# Current status (handoff checkpoint)

| | |
|---|---|
| Date | 2026-09-25 |
| Written for | the return from the Claude Code cloud session to the owner's Windows machine (Phase 6/7 checks that need models, a GPU or the owner's frontend) |
| Overall phase | **Phases 6 and 7 implemented** (prompts `08_PHASE_6_MINIMAX.md`, `09_PHASE_7_*`, authorized together); next: owner-machine checks, then Phase 8 only on the owner's authorization |
| Sub-phase | - (hard stop after Phase 7) |
| Phases done | 1A, 1B (design), 2 (Foundation), 3 (YuE2 Core), 4A (Cover/Instrumental design gate), 4B (YuE2 Cover), 5 (Score / ABC editor); 6 (MiniMax) and 7 (Audio production chain) implemented, owner checks open |
| Prompt set | `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio_Music_Production_System_Refactor_Prompts\` on the owner's machine (not in this repository): `01_PHASE_1A` ... `12_PHASE_10`, one phase per prompt, hard stop after each phase, the next phase only on the owner's explicit authorization |

Read with: [README.md](README.md) (design index), [implementation-roadmap.md](implementation-roadmap.md), [score-editor-design.md](score-editor-design.md) (§15 = Phase 5 implementation record), [target-architecture.md](target-architecture.md) §0/§2/§18, the latest test reports [../test-reports/2026-09-25-phase-6.md](../test-reports/2026-09-25-phase-6.md) and [../test-reports/2026-09-25-phase-7.md](../test-reports/2026-09-25-phase-7.md).

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

## 2. Partially implemented

- The **Master** block is not yet inside the song templates 1-3 (they export the raw take); Phase 8 builds the final templates.
- MiniMax: instrumental caption wording (I-5) adopted from the legacy toolkit, not yet listened to.
- Restoration decision C1 needs measurements on unprocessed takes.

## 3. What remains (Phases 6/7, on the owner's machine)

1. Full suite with ComfyUI (and `PLENIO_MODELS_DIR` for the tokenizer contract tests).
2. Phase 6: tokenizer contract test `tests/contract/test_minimax_tokenizer.py`; smoke S-5 `PLENIO_SMOKE=1 pytest tests/host/test_minimax_models.py`; template runs of *3 · MiniMax · Song* (sung and instrumental) with a listening verdict on I-5.
3. Phase 7: smoke S-7 `PLENIO_SMOKE=1 pytest tests/host/test_master_smoke.py`; *4 · Enhance & Master* in the owner's frontend 1.53.6 (curve widget, save/reload of a manual EQ, A/B against `(original).flac`); restoration gate on unprocessed YuE2 and MiniMax takes (`python tools/studies/restoration_gate.py out.json <takes>`) and the C1 decision.
4. Record the results in the Phase 6 and 7 reports, set the roadmap statuses to *Done*, and stop. Phase 8 only on the owner's authorization.

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

## 5. Files and modules currently being worked on

- Backend: `plenio/core/engines/{minimax,yue2,__init__}.py`, `plenio/core/writing.py`, `plenio/core/audio/*`, `plenio/core/release.py`, `plenio/core/dependencies.py`, `plenio/comfy/nodes/{eq,loudness,export,sheet,engine}.py`, `plenio/comfy/{host,routes,shared}.py`, `resources/presets/*.json`.
- Frontend: `frontend/src/shared/eqCurve.ts`, `frontend/src/extension/{eqWidget,main,style}.ts`, `frontend/src/api/client.ts`, `frontend/src/sheet-editor/{SheetDialog.vue,sheetSession.ts}`.
- Graphs: `tools/build_graphs.py` (MiniMax Model/Render, Master, templates 3 and 4); snapshot `tools/data/node_types.json` refreshed from ComfyUI 0.37.0.
- Built output committed: `web/js/plenio.js`, `web/js/chunks/*.mjs`.

## 6. Known issues

- Upstream ComfyUI 0.37.0: a native loop whose body is blocked never finishes (worked around by gating); the loop body re-runs on every queue; frontend 1.53.6 does not restore `cache_iterations` and misrestores DynamicCombo-first nodes (Plenio nodes repaired, native Start Loop not).
- YuE2 may render a take to the render ceiling and stop mid-phrase (Check Vocals ranks such takes last among clean ones).
- Sung covers with several takes export the first take only (Check Vocals skips sung songs).
- Editor chunk size about 1.4 MB (370 kB gzip), loaded only when a sheet opens.
- Dev tooling: `npm audit` reports a moderate advisory in vitest's mocker (dev-only; the fix is a major vitest upgrade, not done).
- CodeMirror renders only visible lines (tests reading the DOM see a subset).
- mypy with the configured `python_version = "3.10"` fails on the stubs of numpy releases that use 3.12 syntax (seen with the latest numpy in the cloud); the owner's pinned `.devdeps` numpy works. Pin numpy for mypy or raise the target when the minimum Python is decided.
- `pyproject.toml` still names the planned public repository `jplenio/comfyui-plenio-music` (release decision, `docs/dev/release.md`), while the working remote is `jplenio/Plenio-Music-Production-System`.
- Shell pitfall on the owner's machine: bash heredocs with backslashes (`\d`, `\n`, `\a`, `\b`) inserted control characters into code; write code with file-writing tools, and scan for control characters before committing.

- Export widget order changed in Phase 7: workflows saved from the earlier templates restore the Export node's widget values by position; re-add the node or start from the new templates.
- Output files written through `atomic_write_*` (record JSON, cover JPEG) get mode 0600 on Linux (temporary-file default); audio files 0644. Harmless on Windows.
- Cloud ComfyUI install (Phase 6/7): `download.pytorch.org` is blocked by the environment's network policy, so pip installed the CUDA torch build from PyPI (about 6.8 GB) instead of the planned CPU build (about 1-1.5 GB); it runs on the CPU. Only the cloud container is affected.

## 7. Tests executed at this checkpoint

| Suite | Where | Result |
|---|---|---|
| Python (unit, contract, workflow, host) with ComfyUI 0.37.0 | cloud, final commit | **672 passed, 9 skipped** (models 3, legacy toolkit 1, smoke 3, jsonschema/soundfile 2) |
| Smoke S-7 (real MiniMax take, CPU) | cloud | passed: -16 target -> -16.0 LUFS / -2.76 dBTP, -9 -> -9.14 / -0.70 |
| Browser: EQ curve, *4 · Enhance & Master* queued from the frontend | cloud (frontend 1.52.7, Chromium) | passed (report §4) |
| ruff check / format, mypy strict | cloud | clean (mypy `--python-version 3.12`) |
| Frontend `npm run check` | cloud | **58 tests passed**, typecheck clean, build ok (`web/js/` rebuilt and committed) |
| Workflows (`tools/workflow_validation.py`) | cloud | 9 blueprints + 5 templates valid |
| Phase 5 suite | owner's machine | 557 passed, 3 skipped; with smoke 559 passed, 1 skipped |

## 8. Tests that need the local GPU / ComfyUI environment

- **Host tests** (`tests/host/`, marker `host`): need a ComfyUI checkout with its Python environment (`PLENIO_COMFYUI_ROOT`); they start a real server on the CPU with fakes. Without it they are skipped.
- **Contract tests** marked `comfy` (ComfyUI importable; e.g. the YuE2 tokenizer test also needs `PLENIO_MODELS_DIR`).
- **Smoke tests** (`PLENIO_SMOKE=1`): `tests/host/test_cover_models.py` (GPU, SheetSage2, faster-whisper large-v3, the legacy MiniMax sample), `tests/host/test_minimax_models.py` (S-5, MiniMax Music 3 models), `tests/host/test_master_smoke.py` (S-7, CPU, the legacy MiniMax sample or `PLENIO_LEGACY_SAMPLE`).
- **Real template runs and browser checks** (`tools/dev_server.py --gpu --models <dir> --port 8190 --base <dir>`): YuE2 3B, Gemma 4 writer, instrumental LoRA, SheetSage2; owner's RTX 5060 Ti 16 GB, models in `F:\ComfyUI\models`, ComfyUI 0.37.0 in `D:\Daten2\ComfyUI` (frontend 1.53.6, Python 3.12.9).
- Everything else (unit, workflow, Vitest) runs without ComfyUI (pure Python with numpy; Node for the frontend).

## 9. Exact recommended next action

Run the owner-machine checks of §3 and record them in the Phase 6 and 7 reports. Phase 8 - Main workflows, subgraphs and UX (prompt `10_PHASE_8_*`) starts only on the owner's explicit authorization.

## 10. Context a new session would otherwise have to rediscover

- **Owner rules**: the legacy repository (`ComfyUI-MiniMax`, owner's machine) is read-only; reply to the owner in **German**, write code and docs in **English**; never install into the owner's ComfyUI environment (dev tools live in the untracked `.devdeps/`); downloads beyond what the owner approved need consent; one phase per authorization with a hard stop; commits: the owner asked for checkpoint commits pushed to `origin/main` (earlier rule "commit only at the end" was lifted for checkpoints).
- **Dev setup (cloud)**: Python 3.12 with `numpy`, `scipy`, `av`, `pyloudnorm 0.2.0`, `mutagen`, `pytest 8.4.2`, `hypothesis 6.168.1`, `ruff 0.13.3`, `mypy 1.18.2`, `coverage`; a ComfyUI 0.37.0 checkout with its own venv for host tests (`PLENIO_COMFYUI_ROOT`); run `pytest` from the repository root (config in `pyproject.toml`; markers `comfy`/`host`/`smoke` skip without their environment). Frontend: `cd frontend && npm ci && npm run check` (writes `web/js/`, which is committed).
- **Generated files**: never hand-edit `subgraphs/*.json` or `example_workflows/*.json`; change `tools/build_graphs.py`, run it, validate with `tools/workflow_validation.py`. After node schema changes re-run `tools/snapshot_node_types.py` (needs ComfyUI) - the snapshot `tools/data/node_types.json` is committed.
- **Dialect facts**: native two-voice ABC (`Vocal`, `Ins`), fixed 8-line header, groups of 1-4 bars per voice, `% label` comments start sections, accidentals apply by letter across octaves within a bar, unmarked tied continuations keep their pitch, supported lengths {1,2,3,4,6,8,12,16,24,32,48} units, chords only in `Vocal`; the vendored upstream parser `plenio/third_party/yue2_abc_tools.py` is the authority.
- **Fixtures**: `tests/fixtures/abc/upstream-*.abc`, `tests/fixtures/cover/*.json` (real SheetSage2 transcription of M2 with events, YuE2 plans Y2/Y3 with vocal notes and ASR words).
- **Owner verdicts and decisions**: `docs/design/yue2-cover-design.md` §21, `instrumental-strategy.md` §13, listening pack verdicts summarised there.
