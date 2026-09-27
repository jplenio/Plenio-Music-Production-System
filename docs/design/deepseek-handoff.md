# Handoff to DeepSeek 4.1 Flash — Phase 11C (continue from M1/D3)

| | |
|---|---|
| Date | 2026-09-27 |
| From | Claude (Phases 11A, 11B, M1/D1, M1/D2) |
| To | DeepSeek 4.1 Flash, implementing the remaining DEEPSEEK-SUITABLE milestones |
| Start at | Git `main` at the commit that added this file (local repository `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio-Music-Production-System`; `main` is ahead of `origin/main` and **nothing is pushed**) |
| Scope | M1/D3, then M2 … M7 of [next-release-plan.md §16.2](next-release-plan.md), in that order |

Read before writing code, in this order:

1. this file;
2. [CURRENT_STATUS.md](CURRENT_STATUS.md) §1, §2, §2.1, §5, §6, §7;
3. [next-release-plan.md](next-release-plan.md) §16.2 (the milestones with files and "done when"), §17 (what exists, how it deviates from the design text), then the design sections of the milestone you work on (§9/§10 score and DAW, §7/§8 lyrics and brief, §5 EQ, §4 refine, §6 stems);
4. [target-architecture.md](target-architecture.md) §2 (rules R1-R12);
5. [docs/dev/testing.md](../dev/testing.md) and [docs/dev/extending.md](../dev/extending.md).

---

## 1. Binding rules

1. **Do not redesign.** The architecture, contracts and operations are decided (plan §0-§14, §17). If new evidence contradicts them, stop and write the question into `CURRENT_STATUS.md` §5 instead of changing the design.
2. **One score engine.** All musical edits go through `plenio/core/score/ops.py` (canonical operations) and the score session (`useScoreSession.operate`). No second score model in TypeScript; views do geometry only. **One gesture or field edit = exactly one operation.** Do not change `canonical.py`/`ops.py` semantics; adding an operation needs the owner's approval.
3. **The Phase 5 operations stay** (`plenio/core/score/edit.py`, 162 tests in `tests/unit/test_score_editor.py`). Do not touch them (task F1 is the owner's decision).
4. **Never silently accept or replace text.** Invalid ABC never replaces the last valid score (the commit gate exists — keep it in force). An import or a replaced document is always visible and undoable (one undo step).
5. **One owner per value** (R2): lyrics = the Song Sheet, score = the sheet's ABC text, EQ = `mode.bands`, mixer = the Stem Mixer's value, brief = its widgets. No parallel mechanism.
6. **Optional stays optional:** new stages are bypassed and collapsed in the templates; heavy model code is imported lazily; missing model → actionable error, never a silent fallback.
7. **Native ComfyUI first**, no new custom nodes beyond plan §12, no new Python packages (vendored, hash-pinned code only where the plan says so), no new frontend libraries.
8. **Honesty:** never claim GPU, audio-quality, listening or real-model results you did not produce. Keep the owner's local checklist (plan §15, L1-L4) up to date instead.
9. **Git:** commit coherent checkpoints **locally**; **do not push** unless the owner says so. End commit messages with a co-author line for yourself. Never commit `.codewhale/` (another tool's folder) or `.claude/`.
10. **Language:** code, comments, docs and commit messages in English; answers to the owner in German.

## 2. What exists (do not rebuild)

| Area | Where | Notes |
|---|---|---|
| Canonical score model, parser, serializer | `plenio/core/score/canonical.py` | `from_abc`, `to_abc` (identity for unchanged text, locality, re-parse check), `validate`, `new_score` |
| Edit operations (24) | `plenio/core/score/ops.py` | names and parameters: plan §17.1; ids `vocal:<onset>`, `ins:<onset>`, `chord:<onset>`; bars 1-based; `transform(text, op)` |
| View contract v2 | `plenio/core/score/operations.py` (`editor_view`, `model_view`) | `view.model` (units, measures, groups, keys, sections, tracks with `segments`), `model_error` outside the subset |
| MIDI core + routes | `plenio/core/score/midi.py`, `plenio/comfy/routes.py` | `POST /plenio/score/midi/export` → `{filename, data(base64)}`; `/import` ← `{data, mapping?, grid?}` → `{abc, guide, report, analysis}`; client calls `exportMidi`/`importMidi` in `frontend/src/api/client.ts` |
| Brief precedence, `custom`, manual lyrics, I12 | `plenio/core/brief.py` (`resolve_text_fields`, `field_sources`, `template_choice_hints`), `sheet/evaluate.py`, `engines/yue2.py` | backend done; UX is M3 |
| Refine core + nodes (experimental) | `plenio/core/audio/refine.py`, `plenio/comfy/nodes/{audio_model,refine}.py`, `plenio/comfy/audio_models.py` (adapter registry) | engine protocol `Engine`; M5 adds UniverSR |
| Stems core + nodes (experimental) | `plenio/core/audio/stems.py`, `plenio/comfy/nodes/stems.py` | `Separator` protocol, effect buses injected; M6 adds separation + effects + widget |
| Score editor UI | `frontend/src/sheet-editor/score/`: `ScoreTab.vue`, `PianoRoll.vue` + `pianoRoll.ts`, `Inspector.vue` + `inspector.ts`, `useScoreSession.ts` (commit gate, `revertToLastValid`), `prefs.ts`, `NotationView.vue`, `AbcEditor.vue`, `ScoreTransport.vue` (metronome) | layouts *review*/*text*; node property `plenio_editor_layout` |
| Test fakes | `tests/host/plenio_test_nodes/fakes.py` | `PlenioTestFakeAudioModel` (SR/separation fakes), `PlenioTestAudioProbe`, fake LLM/plan/render |
| Hypothesis strategies | `tests/support/score_strategies.py` | on the pytest path |

## 3. Work order and acceptance criteria

Do the milestones strictly in this order. A milestone is **done** only when every item of its "done when" in plan §16.2 is met, the checks of §4 pass, the docs are updated and a checkpoint is committed. Then update `CURRENT_STATUS.md` (§2 table, §2.1 entry, §4 numbers, §6 next task) and plan §17, commit, and continue with the next milestone.

| # | Milestone | Tasks | Key deliverables (details: plan §16.2) |
|---|---|---|---|
| 1 | **M1/D3** MIDI UI | D3 | *Export MIDI* (download, file name from the title) and *Import MIDI* (file → base64 → dialog with the file's tracks, role per track vocal/ins/chords/guide/none, grid, the report shown **before** the text is replaced; replacing = one undo step); optional `plenio/core/score/chords.py` (template-matching chord recognition, labelled best effort) with unit tests; `frontend/tests/midiDialog.test.ts`; user guide section |
| 2 | **M2** YuE2 · DAW template | D4, D5 | Score Tools *new score from brief* (`plenio/core/score/skeleton.py` → `canonical.new_score`), template **5 · YuE2 · DAW** in `tools/build_graphs.py` (+ App mode, thumbnail, node property `plenio_editor_layout = "daw"`), DAW layout (track headers incl. Guide "not sent to YuE2"), Guide track in the Song Sheet node's properties (`[[onset, duration, pitch]]`, format of `midi.guide_from_json`) with playback and MIDI; host `test_daw_path.py`; `docs/user/paths/yue2-daw.md` |
| 3 | **M3** Brief + manual-lyrics UX | D6, D7 | placeholder spike on frontend 1.52.7/1.53.6, ghost text (typed > template > empty) or the fallback line, *Copy template text*, *Use template choices*, *Reset all to template*, frontend migration of `custom`; *Use my own lyrics*, `lyrics: yours (manual)` badges; Vitest `briefTemplate.test.ts`; docs |
| 4 | **M4** EQ UX | D8 | plan §5 in `eqWidget.ts`/`eqCurve.ts`, spectrum payload from `plenio/comfy/nodes/eq.py`; value stays `plenio.eq/1`; tests; `mastering.md` |
| 5 | **M5** Refine in the templates | D9, D10 | UniverSR adapter (vendored MIT code under `plenio/third_party/universr/`, hash-pinned, registered with `audio_models.register`), catalogue entry (`models/audio_sr`, CC-BY-4.0), `tools/studies/sr_study.py`; blueprint *Plenio · Refine (48 kHz)*, template defaults (MiniMax on with *model*, others bypassed), System Check rows; remove `is_experimental` only when accepted; `refine.md`; defaults stay **provisional** until the owner's L1 |
| 6 | **M6** Stems in the templates | D11, D12 | BS-RoFormer 4-stem adapter (vendored MSST MIT code, results at the input's shape), `plenio/core/audio/effects.py` (reverb, delay as `stems.Effect`), mixer widget replacing the JSON text (same `plenio.stem_mix/1`), blueprint *Plenio · Stems* bypassed + collapsed everywhere; tests; `stems.md` |
| 7 | **M7** Docs and release 0.3.0 | D13 | README, CHANGELOG, user guides linked, App-mode docs, `extending.md` (audio adapters, canonical operations), version bump, a test report; the release itself only after the owner's L1-L4 |

If a milestone is blocked (missing model file, licence unclear, spike negative), record it in `CURRENT_STATUS.md` §5 with what you tried, skip only that item, and continue with what is independent; never fake it.

## 4. Checks after every coherent change

Environment (owner's Windows machine; Git Bash syntax; `PY=/d/Daten2/ComfyUI/.venv/Scripts/python.exe`, Python 3.12.9; dev tools in `.devdeps`):

```bash
PYTHONPATH=.devdeps $PY -m ruff check . && PYTHONPATH=.devdeps $PY -m ruff format --check .
PYTHONPATH=.devdeps $PY -m mypy --python-version 3.12
PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY -m pytest tests/unit tests/workflows tests/contract
PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY -m pytest tests/host
cd frontend && npm run check
$PY tools/workflow_validation.py
```

Expected baseline at handoff: unit + workflow + contract 848+ passed (4 skipped); host 101 passed, 8 skipped; Vitest 103 passed; ruff clean; mypy reports only `type-arg` errors for bare `np.ndarray` (local numpy 2.2 stubs; do not add new error kinds).

Also:
- after node schema changes: `PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY tools/snapshot_node_types.py` (commit `tools/data/node_types.json`); every node needs `web/docs/<node_id>.md` and tooltips on every input/output (contract tests);
- templates/blueprints only through `tools/build_graphs.py` (+ `tools/build_thumbnails.py`), never by hand;
- after frontend changes: `npm run build` — `web/js/` is committed;
- if `editor_view` output changes: regenerate `frontend/tests/fixtures/tricky-score.json` (sorted keys, indent 1; `test_frontend_fixture_is_current` checks it);
- UI changes: check them in the real frontend (below) and write what you checked into `CURRENT_STATUS.md`.

**Real-frontend check:** start an isolated ComfyUI with Plenio and the test nodes: `PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY tools/dev_server.py --test-nodes --port 8191` (it copies the package at start: rebuild the frontend first and restart after backend changes). A Song Sheet node without connections owns every document; put a manual score into its `sheet_state` widget (`{"schema":"plenio.sheet_state/1","docs":{"score":{"state":"manual","text":"<ABC>"}}}`) and open *Edit Song Sheet…*. Delete the temporary `%TEMP%\plenio-dev-*` folders afterwards.

## 5. Pitfalls already met (save yourself the time)

- **Shell quoting:** Bash heredocs and inline Python mangle backslashes and quotes in code. Write code with file-writing tools; for patch scripts write a `.py` file first, then run it. Scan for control characters before committing.
- **CRLF:** some tools write CRLF; `.gitattributes` normalises to LF on commit — fine, but compare fixtures byte-exactly only after normalisation.
- **Lazy inputs in V3 nodes:** an unconnected optional input is *absent* in `check_lazy_status`; a connected, not yet evaluated one is `None`. Request it only if `name in kwargs and kwargs[name] is None`, else ComfyUI fails ("says it needs input … no input").
- **Scrolling in the dialog:** never use `scrollIntoView` (or CodeMirror's `scrollIntoView: true`) inside the Song Sheet dialog — it scrolls the dialog and moves panes under the pointer. Scroll only the pane itself (see `NotationView.reveal`, `AbcEditor.scrollInside`).
- **Selection:** the session's selection is in element ids (`V12.3`) plus chord ids (`chord:<onset>`); canonical note ids from operation results are mapped to segments by `elementSelection`. Keep it that way (the palette and status line depend on it).
- **Host tests share one server:** ComfyUI caches node outputs; give probe/test nodes unique inputs per test when you need them to run again.
- **Vitest/happy-dom:** `getBoundingClientRect` is all zeros (client coordinates = SVG coordinates), `clientWidth` is 0 (the roll then draws everything); `aria-label^=` selectors also match groups — use the full label prefix.
- **Measures that are not a whole number of units** are outside the supported subset: valid for YuE2, `view.model === null`, text editing only.
- **Unit denominators:** `units_per_quarter` may be fractional for coarse `L`; never assume 1/16 or 1/32.

## 6. Reporting and stop

After each milestone: a short German summary for the owner (what was done, tests and checks with numbers, what was not verified, decisions to review, the next step), `CURRENT_STATUS.md` and plan §17 updated, local commits. Stop and ask the owner before: pushing, releasing, installing anything into the owner's ComfyUI environment, downloading models or datasets, changing a decided design, or accepting a licence.
