# Current status (handoff checkpoint)

| | |
|---|---|
| Date | 2026-09-25 |
| Written for | the move of the development session from the owner's Windows machine to a Claude Code cloud session |
| Overall phase | **Phase 5 - Reusable Score / ABC editor** (prompt `07_PHASE_5_SCORE_EDITOR.md`, authorized by the owner on 2026-09-25) |
| Sub-phase | Phase 5 implementation: core, routes and the editor UI are implemented and checked by hand; **tests, integration tests, user documentation and the phase report remain** |
| Phases done | 1A, 1B (design), 2 (Foundation), 3 (YuE2 Core), 4A (Cover/Instrumental design gate), 4B (YuE2 Cover) |
| Prompt set | `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio_Music_Production_System_Refactor_Prompts\` on the owner's machine (not in this repository): `01_PHASE_1A` ... `12_PHASE_10`, one phase per prompt, hard stop after each phase, the next phase only on the owner's explicit authorization |

Read with: [README.md](README.md) (design index), [implementation-roadmap.md](implementation-roadmap.md), [score-editor-design.md](score-editor-design.md) (§15 = Phase 5 implementation record), [target-architecture.md](target-architecture.md) §0/§2/§18, the latest test report [../test-reports/2026-09-25-phase-4b.md](../test-reports/2026-09-25-phase-4b.md).

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

## 2. Partially implemented

- **Tests for Phase 5**: none written yet for the new modules (only the import-boundary tests cover them). Evidence so far: a fuzz run of every operation on three real scores (M2 SheetSage2 score, YuE2 plans Y2/Y3: 1019 notes; later re-run on 642 operations) with all invariant checks passing, and manual browser checks (§5).
- **Editor UX**: works on the 83-s SheetSage2 score; long YuE2 plans (~200 s) not yet rendered in the browser (performance, AS-12); accessibility and theming reviewed only by eye (dark theme).
- **Docs**: design and dev docs updated; the user guide for the editor and the Song Sheet concept/help page are not updated for the full editor yet.

## 3. What remains (Phase 5)

1. `tests/unit/test_score_editor.py` (new): positions and `locate()` (incl. invalid texts), element ids and pitches vs. the upstream parser on all fixtures, tie chains, `display_abc` ranges and accidental normalisation cases (letter-wide accidental across octaves, tied continuation across a bar line, inline key change), full-bar rest expansion, every edit operation (result, invariants, byte-identical untouched bars, refusals with clear messages), section operations, operation registry parameter errors, round trip (`build(view text)` = same elements).
2. Frontend Vitest: `history.ts`, `scoreView.ts` (lookup by display/source position, neighbours, describe), `playback.ts` (schedule, sounding, speed), `prefs.ts` (blocked storage), `useScoreSession.ts` with a fake fetcher (stale answers dropped, operation after a concurrent edit refused, undo/redo, external document replacement enters the history), `dynamicCombo.ts` already tested.
3. Host tests: routes `/plenio/score/analyze` / `/plenio/score/transform` with the new operations and error responses; Song Sheet `reference_audio` in the payload; workflow save/reload of an edited score (widget value round trip - checked by hand).
4. Integration: YuE2 Song path - a score edited through `/plenio/score/transform` and applied as *edited* reaches the renderer and survives a new take, a new plan gives a conflict; YuE2 Cover - a section rename/boundary move in the score sheet changes the ASR lyrics draft (and conflicts with an edited lyrics document).
5. Browser checks with a long YuE2 plan; keyboard-only use; light theme.
6. Docs: user guide page for the editor (`docs/user/concepts/score-editor.md` or an extension of `song-sheet.md`), `web/docs/PlenioSongSheet.md` (reference_audio, editor), test report `docs/test-reports/<date>-phase-5.md`, CHANGELOG, roadmap status *Done*.
7. Stop after the component and integrations are tested and documented (prompt rule).

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
- `pyproject.toml` still names the planned public repository `jplenio/comfyui-plenio-music` (release decision, `docs/dev/release.md`), while the working remote is `jplenio/Plenio-Music-Production-System`.
- Shell pitfall on the owner's machine: bash heredocs with backslashes (`\d`, `\n`, `\a`, `\b`) inserted control characters into code; write code with file-writing tools, and scan for control characters before committing.

## 7. Tests executed at this checkpoint

| Suite | Result |
|---|---|
| Python (unit, contract, workflow, host, smoke) with `PLENIO_COMFYUI_ROOT`, `PLENIO_MODELS_DIR`, `PLENIO_SMOKE=1` on the owner's machine | **393 passed, 1 skipped** (coexistence test: needs an installed legacy toolkit) |
| ruff check / ruff format --check / mypy (37 files) | clean |
| Frontend `npm run check` (vue-tsc, Vitest, build) | 22 tests passed, typecheck clean, build ok |
| Edit-operation fuzz on real scores (script, not a test file) | 642 operations, all invariant checks passed |
| Workflows (`tools/workflow_validation.py`) | 9/9 blueprints and templates valid |

## 8. Tests that need the local GPU / ComfyUI environment

- **Host tests** (`tests/host/`, marker `host`): need a ComfyUI checkout with its Python environment (`PLENIO_COMFYUI_ROOT`); they start a real server on the CPU with fakes. Without it they are skipped.
- **Contract tests** marked `comfy` (ComfyUI importable; e.g. the YuE2 tokenizer test also needs `PLENIO_MODELS_DIR`).
- **Smoke tests** (`PLENIO_SMOKE=1`, `tests/host/test_cover_models.py`): GPU, SheetSage2, faster-whisper large-v3, the legacy MiniMax sample.
- **Real template runs and browser checks** (`tools/dev_server.py --gpu --models <dir> --port 8190 --base <dir>`): YuE2 3B, Gemma 4 writer, instrumental LoRA, SheetSage2; owner's RTX 5060 Ti 16 GB, models in `F:\ComfyUI\models`, ComfyUI 0.37.0 in `D:\Daten2\ComfyUI` (frontend 1.53.6, Python 3.12.9).
- Everything in §3 items 1-2 runs without ComfyUI (pure Python with numpy; Node for the frontend).

## 9. Exact recommended next action

Continue **Phase 5** (do not start Phase 6): write the tests of §3 items 1 and 2 first (pure, runnable in the cloud), fix what they find, then items 3-4 (host tests; run them where a ComfyUI checkout is available, otherwise mark them for the owner's machine), then §3 items 5-6, then the Phase 5 report and stop.

**Next prompt file:** `07_PHASE_5_SCORE_EDITOR.md` (continue; Phase 5 is not complete). After Phase 5 is done and the owner authorizes it: `08_PHASE_6_MINIMAX.md`.

## 10. Context a new session would otherwise have to rediscover

- **Owner rules**: the legacy repository (`ComfyUI-MiniMax`, owner's machine) is read-only; reply to the owner in **German**, write code and docs in **English**; never install into the owner's ComfyUI environment (dev tools live in the untracked `.devdeps/`); downloads beyond what the owner approved need consent; one phase per authorization with a hard stop; commits: the owner asked for checkpoint commits pushed to `origin/main` (earlier rule "commit only at the end" was lifted for checkpoints).
- **Dev setup (cloud)**: Python 3.12 with `numpy`, `pytest 8.4.2`, `hypothesis 6.168.1`, `ruff 0.13.3`, `mypy 1.18.2`, `coverage`; run `pytest` from the repository root (config in `pyproject.toml`; markers `comfy`/`host`/`smoke` skip without their environment). Frontend: `cd frontend && npm ci && npm run check` (writes `web/js/`, which is committed).
- **Generated files**: never hand-edit `subgraphs/*.json` or `example_workflows/*.json`; change `tools/build_graphs.py`, run it, validate with `tools/workflow_validation.py`. After node schema changes re-run `tools/snapshot_node_types.py` (needs ComfyUI) - the snapshot `tools/data/node_types.json` is committed.
- **Dialect facts**: native two-voice ABC (`Vocal`, `Ins`), fixed 8-line header, groups of 1-4 bars per voice, `% label` comments start sections, accidentals apply by letter across octaves within a bar, unmarked tied continuations keep their pitch, supported lengths {1,2,3,4,6,8,12,16,24,32,48} units, chords only in `Vocal`; the vendored upstream parser `plenio/third_party/yue2_abc_tools.py` is the authority.
- **Fixtures**: `tests/fixtures/abc/upstream-*.abc`, `tests/fixtures/cover/*.json` (real SheetSage2 transcription of M2 with events, YuE2 plans Y2/Y3 with vocal notes and ASR words).
- **Owner verdicts and decisions**: `docs/design/yue2-cover-design.md` §21, `instrumental-strategy.md` §13, listening pack verdicts summarised there.
