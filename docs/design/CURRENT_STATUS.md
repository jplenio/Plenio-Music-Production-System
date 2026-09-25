# Current status (handoff checkpoint)

| | |
|---|---|
| Date | 2026-09-25 |
| Written for | the return from the Claude Code cloud session to the owner's Windows machine (Phase 5 checks that need ComfyUI, a GPU or a browser) |
| Overall phase | **Phase 5 - Reusable Score / ABC editor** (prompt `07_PHASE_5_SCORE_EDITOR.md`, authorized by the owner on 2026-09-25) |
| Sub-phase | Phase 5 implemented, unit and Vitest suites pass, host tests written, docs and report written; **the owner-machine checks of §3 remain** before Phase 5 is *Done* |
| Phases done | 1A, 1B (design), 2 (Foundation), 3 (YuE2 Core), 4A (Cover/Instrumental design gate), 4B (YuE2 Cover) |
| Prompt set | `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio_Music_Production_System_Refactor_Prompts\` on the owner's machine (not in this repository): `01_PHASE_1A` ... `12_PHASE_10`, one phase per prompt, hard stop after each phase, the next phase only on the owner's explicit authorization |

Read with: [README.md](README.md) (design index), [implementation-roadmap.md](implementation-roadmap.md), [score-editor-design.md](score-editor-design.md) (§15 = Phase 5 implementation record), [target-architecture.md](target-architecture.md) §0/§2/§18, the latest test report [../test-reports/2026-09-25-phase-5.md](../test-reports/2026-09-25-phase-5.md).

---

## 1. What has been completed

**Before Phase 5** (reports in `docs/test-reports/`):

- Phase 2: package skeleton (V3 ComfyUI entry), `plenio.core` (pure) / `plenio.comfy` (adapters), errors, hashing, reports, configuration, Song Sheet state and resolution, asset catalogue with offline policy, worker protocol, System Check, frontend extension skeleton, test suites.
- Phase 3: *1 · YuE2 · Song* template and its nodes (Song Brief, Engine Profile, Compose Writing Prompt, Parse Song Draft, Song Sheet, Score Tools, Export Release) and blueprints; minimal Song Sheet editor.
- Phase 4A: final cover and instrumental specifications with studies (`docs/design/yue2-cover-design.md`, `instrumental-strategy.md`).
- Phase 4B: *2 · YuE2 · Cover* template; Cover Brief, Transcribe Score, Transcribe Lyrics (faster-whisper worker, cache, beat-grid alignment), Check Vocals, *YuE2 Takes* blueprint; real template runs; Qwen3-ASR evaluated.

**Phase 5 so far** (details: [score-editor-design.md](score-editor-design.md) §15):

- `plenio/core/score/positions.py` - tolerant text structure with offsets; `locate()` for diagnostics.
- `plenio/core/score/model.py` - element view (ids `V<bar>.<n>`, `I<bar>.<n>`, chords `C<bar>.<n>`), pitches exactly as the upstream parser, `display_abc` (explicit accidentals, section annotations, full-bar rests written out), playback notes and chords.
- `plenio/core/score/edit.py` - pitch, length, rest/note, chord set/remove, section rename/move boundary/split/join; untouched bars byte-identical; invariant checks against the upstream parser.
- `plenio/core/score/operations.py` - operation registry and `editor_view`; routes `/plenio/score/analyze` (element view) and `/plenio/score/transform` (all operations) use it.
- Score diagnostics carry `line`, `start`, `end`.
- Song Sheet input `reference_audio` (temporary Opus copy for A/B); Cover template connects the source.
- Frontend: tabbed Song Sheet editor; score tab with abcjs notation, CodeMirror ABC text with lint markers, navigator, palette with shortcuts, undo/redo, WebAudio playback with cursor, voice switches, speed, section loop, A/B with the source; lyrics fit per section; Revert; close confirmation.
- Bundled libraries recorded in `THIRD_PARTY.md` (abcjs 6.7.1, CodeMirror 6 and its dependencies, all MIT).

- Phase 5 tests (cloud session): `tests/unit/test_score_editor.py` (162), `frontend/tests/scoreEditor.test.ts` (31, with the backend's editor view as fixture `frontend/tests/fixtures/tricky-score.json`); fixes they found: session watcher (typing groups, double analysis), playback time tolerance, `display_abc` after inline key changes, chord refusal message (report §3).
- Host tests written (not yet run): score routes and an editor-edited score reaching the renderer (`tests/host/test_song_path.py`), section edits re-sectioning the ASR lyrics draft and `reference_audio` (`tests/host/test_cover_path.py`).
- Docs: `docs/user/concepts/score-editor.md`, Song Sheet concept and help page, test report `docs/test-reports/2026-09-25-phase-5.md`, CHANGELOG, roadmap status.

## 2. Partially implemented

- **Editor UX**: long YuE2 plans (~200 s) not yet rendered in the browser (performance, AS-12); keyboard-only use and the light theme not yet checked.

## 3. What remains (Phase 5, on the owner's machine)

1. ~~Full Python suite with ComfyUI~~ - done on the owner's machine: 557 passed, 3 skipped, all four new host tests pass. Open: the smoke run with `PLENIO_MODELS_DIR` and `PLENIO_SMOKE=1`.
2. Browser checks (report §5): long YuE2 plan, keyboard-only, light theme; repeat of the checkpoint checks after the fixes (typing undo, play from a bar, A/B, Apply -> save -> reload).
3. V3: one cover and one song with an editor-edited score, listened to.
4. Record the results in the Phase 5 report, set the roadmap status to *Done*, and stop (prompt rule). Phase 6 only on the owner's authorization.

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

## 5. Files and modules currently being worked on

- Backend: `plenio/core/score/{positions,model,edit,operations}.py`, `plenio/core/score/native.py` (diagnostic positions), `plenio/comfy/routes.py`, `plenio/comfy/nodes/sheet.py` (`reference_audio`), `plenio/comfy/host.py` (`save_reference_audio`), `tools/build_graphs.py` (cover: source → score sheet).
- Frontend: `frontend/src/sheet-editor/SheetDialog.vue`, `frontend/src/sheet-editor/score/*` (`ScoreTab`, `NotationView`, `AbcEditor`, `ScoreNavigator`, `ScorePalette`, `ScoreTransport`, `player.ts`, `prefs.ts`, `useScoreSession.ts`), `frontend/src/sheet-editor/LyricsFit.vue`, `frontend/src/shared/{scoreView,history,playback}.ts`, `frontend/src/api/client.ts`, `frontend/src/sheet-editor/dialog.css`.
- Built output committed: `web/js/plenio.js`, `web/js/chunks/*.mjs` (rebuild with `npm run build` in `frontend/`).

Manual checks done in a real ComfyUI with the SheetSage2 score of the M2 source: rendering (202 notes, both voices); click selection; ↑ on E5 in A major writes `=f4` and the text follows; undo → *auto*, redo; →; typing an unsupported length marks bar 1 (lint marker, bar strip, diagnostic with bar link) and the notation as stale; chorus boundary one bar earlier; playback from bar 25 with cursor; A/B to the source at the same bar (48.9 s); Apply → workflow save/reload keeps the edited score. Console 404s seen were ComfyUI's own (`user.css`, empty `userdata` folders), not Plenio's.

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

## 7. Tests executed at this checkpoint

| Suite | Where | Result |
|---|---|---|
| Python (unit, contract, workflow, host, smoke) with ComfyUI | owner's machine, before Phase 5 tests | 393 passed, 1 skipped |
| Python without ComfyUI (host/comfy/smoke skip) | cloud, after Phase 5 tests | **500 passed, 58 skipped** |
| ruff check / format, mypy strict (37 files) | cloud | clean (mypy run with `--python-version 3.12`, see report §2) |
| Frontend `npm run check` (vue-tsc, Vitest, build) | cloud | **53 tests passed**, typecheck clean, build ok (`web/js/` rebuilt and committed) |
| Workflows (`tools/workflow_validation.py`) | owner's machine | 9/9 valid (no graph changes since) |

## 8. Tests that need the local GPU / ComfyUI environment

- **Host tests** (`tests/host/`, marker `host`): need a ComfyUI checkout with its Python environment (`PLENIO_COMFYUI_ROOT`); they start a real server on the CPU with fakes. Without it they are skipped.
- **Contract tests** marked `comfy` (ComfyUI importable; e.g. the YuE2 tokenizer test also needs `PLENIO_MODELS_DIR`).
- **Smoke tests** (`PLENIO_SMOKE=1`, `tests/host/test_cover_models.py`): GPU, SheetSage2, faster-whisper large-v3, the legacy MiniMax sample.
- **Real template runs and browser checks** (`tools/dev_server.py --gpu --models <dir> --port 8190 --base <dir>`): YuE2 3B, Gemma 4 writer, instrumental LoRA, SheetSage2; owner's RTX 5060 Ti 16 GB, models in `F:\ComfyUI\models`, ComfyUI 0.37.0 in `D:\Daten2\ComfyUI` (frontend 1.53.6, Python 3.12.9).
- Everything else (unit, workflow, Vitest) runs without ComfyUI (pure Python with numpy; Node for the frontend).

## 9. Exact recommended next action

On the owner's machine: `git pull`, then run §3 items 1-3; fix what they find; record the results in `docs/test-reports/2026-09-25-phase-5.md` and set Phase 5 to *Done*. Do not start Phase 6.

**Next prompt file:** `07_PHASE_5_SCORE_EDITOR.md` (finish the owner-machine checks). After Phase 5 is done and the owner authorizes it: `08_PHASE_6_MINIMAX.md`.

## 10. Context a new session would otherwise have to rediscover

- **Owner rules**: the legacy repository (`ComfyUI-MiniMax`, owner's machine) is read-only; reply to the owner in **German**, write code and docs in **English**; never install into the owner's ComfyUI environment (dev tools live in the untracked `.devdeps/`); downloads beyond what the owner approved need consent; one phase per authorization with a hard stop; commits: the owner asked for checkpoint commits pushed to `origin/main` (earlier rule "commit only at the end" was lifted for checkpoints).
- **Dev setup (cloud)**: Python 3.12 with `numpy`, `pytest 8.4.2`, `hypothesis 6.168.1`, `ruff 0.13.3`, `mypy 1.18.2`, `coverage`; run `pytest` from the repository root (config in `pyproject.toml`; markers `comfy`/`host`/`smoke` skip without their environment). Frontend: `cd frontend && npm ci && npm run check` (writes `web/js/`, which is committed).
- **Generated files**: never hand-edit `subgraphs/*.json` or `example_workflows/*.json`; change `tools/build_graphs.py`, run it, validate with `tools/workflow_validation.py`. After node schema changes re-run `tools/snapshot_node_types.py` (needs ComfyUI) - the snapshot `tools/data/node_types.json` is committed.
- **Dialect facts**: native two-voice ABC (`Vocal`, `Ins`), fixed 8-line header, groups of 1-4 bars per voice, `% label` comments start sections, accidentals apply by letter across octaves within a bar, unmarked tied continuations keep their pitch, supported lengths {1,2,3,4,6,8,12,16,24,32,48} units, chords only in `Vocal`; the vendored upstream parser `plenio/third_party/yue2_abc_tools.py` is the authority.
- **Fixtures**: `tests/fixtures/abc/upstream-*.abc`, `tests/fixtures/cover/*.json` (real SheetSage2 transcription of M2 with events, YuE2 plans Y2/Y3 with vocal notes and ASR words).
- **Owner verdicts and decisions**: `docs/design/yue2-cover-design.md` §21, `instrumental-strategy.md` §13, listening pack verdicts summarised there.
