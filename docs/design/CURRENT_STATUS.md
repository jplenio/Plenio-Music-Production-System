# Current status (handoff checkpoint)

| | |
|---|---|
| Date | 2026-09-27 |
| Written for | **Phase 11C**: the milestones M1-M7 of the next-release plan (next: M5/D9) |
| Overall phase | **Phase 11A (design), Phase 11B (critical implementation, O1-O7) and M1-M4 done** (score editor, YuE2 · DAW, brief templates + manual lyrics, EQ UX); 0.2.2 is the released baseline; the Phase 10 owner-machine checks (§8.3) are still open |
| Sub-phase | - (hard stop after Phase 11B) |
| Commits | Phase 11A `c5b8af3`; Phase 11B `9588977` (O1) · `a035c2f` (O2) · `0139957` (O3) · `a041315` (O4) · `c2f4668` (O5) · `299964d` (O6) · `6578313` (O7) · `7b0eb39` (help pages) · `f8dfa3d` (docs); M1/D1 `f1f968a` (+ docs `e47da84`); M1/D2 `d7621a2` (+ docs `c3048e8`); M1/D3 `e5354bd` (+ docs `9bcb8d5`); M2 `db3bc00` (+ docs `81fa0ad`); M3 `d3fe3e1` (+ docs `ff67444`); M4 `c026f9b` (+ docs this checkpoint). **All local, not pushed** (owner instruction for Phase 11B; kept for Phase 11C so far). |
| Prompt set | `D:\Daten2\Deepseek\ComfyUI-MiniMax\Plenio_Music_Production_System_Refactor_Prompts_Next_Release\` on the owner's machine: `13_PHASE_11A`, `14_PHASE_11B`, `15_PHASE_11C` |

**Continuing implementer (DeepSeek 4.1 Flash): start with [deepseek-handoff.md](deepseek-handoff.md).**

Read with: [next-release-plan.md](next-release-plan.md) - **§16.2 (the milestones, in order), §17 (as implemented, verification)**, §9 (canonical score engine), §10 (DAW), §4 (refine), §6 (stems), §7/§8 (lyrics, brief); then [score-editor-design.md](score-editor-design.md) §15 (the Phase 5 editor the milestones extend), [target-architecture.md](target-architecture.md) §2 (rules R1-R12), [docs/dev/testing.md](../dev/testing.md).

---

## 1. Completed in Phase 11B (the OPUS-CRITICAL foundations)

| # | Result | Main files | Tests |
|---|---|---|---|
| O1 | **Canonical score model** (`Score`, `Note`, `KeyChange`, `ChordSymbol`, `Section`), `from_abc` (upstream parser first; measures that are not a whole number of `L` units are outside the subset), `to_abc` (verbatim reuse of unchanged measures/fields/comments = S2 identity and S5 locality; native style for rewritten measures = S7; every output re-parsed = S6; canonical re-print as fallback), `validate`/`problems`, `new_score` | `plenio/core/score/canonical.py`, `tests/support/score_strategies.py` (hypothesis models and accepted texts) | `tests/unit/test_score_canonical.py` |
| O2 | **Edit operations** on the model (24 operations; delete → rest keeps every measure's length, close-gap only on request, overwrite insert, move = delete + insert, resize into rests or overwrite, chords never move notes, measure insert/delete/duplicate, meter only on empty bars, key changes keep pitches) and the commit path `transform(text, op)`. The Phase 5 operations in `edit.py` are **unchanged** (owner decision); names are disjoint. | `plenio/core/score/ops.py` | `tests/unit/test_score_ops.py` (examples + hypothesis state machine: validity, round trip, locality) |
| O3 | **View contract v2** under `view.model` (units, measures, groups, keys, sections, tracks with `segments` → element ids), `model_error` outside the subset; `/plenio/score/transform` runs canonical operations; **commit gate** in the editor (invalid/unchecked text blocks Apply and Approve with the reason, notation operations refused, *Revert to last valid*) | `plenio/core/score/operations.py`, `frontend/src/shared/scoreView.ts`, `frontend/src/sheet-editor/score/useScoreSession.ts`, `ScoreTab.vue`, `SheetDialog.vue` | `tests/unit/test_score_view.py`, `frontend/tests/scoreEditor.test.ts`, host `test_canonical_score_routes` |
| O4 | **MIDI boundary**: own SMF reader/writer, lossless round trip for Plenio files (`plenio:score` text event), foreign import with quantisation, monophonic reduction, first tempo, time/key signatures, markers, `plenio:chord` events - every lossy step reported; routes `/plenio/score/midi/export` and `/import` | `plenio/core/score/midi.py`, `plenio/comfy/routes.py`, `frontend/src/api/client.ts` | `tests/unit/test_score_midi.py`, host `test_canonical_score_routes` |
| O5 | **One authoritative value**: brief precedence typed > template > empty (`resolve_text_fields`, `field_sources`, `template_choice_hints`), legacy `custom` = empty with a note (never in the prompt or fingerprint); manual lyrics resolve to themselves for any draft, review and brief mode; info finding "Title and style were drafted from the brief, not from your lyrics."; **I12**: a score of rests is a YuE2 rule error | `plenio/core/brief.py`, `plenio/core/sheet/evaluate.py`, `plenio/core/engines/yue2.py`, brief nodes | `tests/unit/test_precedence.py`, host `test_manual_lyrics_survive_every_new_draft` |
| O6 | **Refine (48 kHz)** core (bandwidth, PRE, chunked OLA around an `Engine`, complementary crossover, POST, report; *resample only* = the resampler) and the experimental nodes **Load Audio Model** and **Refine**; model folders `models/audio_sr`, `models/audio_separation`; adapter registry | `plenio/core/audio/refine.py`, `plenio/comfy/audio_models.py`, `plenio/comfy/nodes/{audio_model,refine}.py` | `tests/unit/test_refine.py`, host `tests/host/test_refine_node.py` |
| O7 | **Stems**: `Stems` + residual (neutral mix = input), strict `plenio.stem_mix/1`, mixer (gain, mute/solo incl. *rest*, compression, muted ranges, injected reverb/delay buses) and the experimental nodes **Separate Stems** and **Stem Mixer** | `plenio/core/audio/stems.py`, `plenio/comfy/nodes/stems.py` | `tests/unit/test_stems.py`, host `tests/host/test_stems_node.py` |

Also: types `PLENIO_AUDIO_MODEL`, `PLENIO_STEMS`; node count 14 → 18 (the four new nodes `is_experimental`); help pages `web/docs/Plenio{AudioModelLoader,Refine,SeparateStems,StemMixer}.md`; `tools/data/node_types.json` regenerated; test node pack: `PlenioTestFakeAudioModel`, `PlenioTestAudioProbe`; plan §9.2 states the whole-unit measure rule; plan §16.2 groups the DeepSeek tasks into milestones; §17 records what was built and how it deviates from the design text.

## 2. Remaining DEEPSEEK-SUITABLE tasks, in exact order

Detail, files and "done when" criteria: [next-release-plan.md §16.2](next-release-plan.md). Each milestone ends in a usable state and closes its own tests and docs.

| Order | Milestone | Tasks | Effort |
|---|---|---|---|
| 1 | **M1** graphical score editor in Review mode | ~~D1 piano roll + chord lane~~ (**done**, `f1f968a`) → ~~D2 layouts + inspector~~ (**done**, `d7621a2`) → ~~D3 MIDI UI + chord recognition~~ (**done**, `e5354bd`) | **complete** |
| 2 | **M2** YuE2 · DAW template | ~~D4 *new score from brief* + template 5~~ (**done**, `db3bc00`) → ~~D5 Guide track~~ (**done**) | **complete** |
| 3 | **M3** Song Brief and manual-lyrics UX | ~~D6 ghost text / template actions / frontend `custom` migration~~ (**done**, `d3fe3e1`) → ~~D7 *Use my own lyrics*~~ (**done**) | **complete** |
| 4 | **M4** EQ UX | ~~D8~~ (**done**, `c026f9b`) | **complete** |
| 5 | **M5** Refine in the templates | D9 UniverSR adapter + study tooling → D10 blueprint, template defaults, System Check | 7 h |
| 6 | **M6** Stems in the templates | D11 BS-RoFormer adapter → D12 effects, mixer widget, blueprint, wiring | 8 h |
| 7 | **M7** documentation and release 0.3.0 | D13 | 3 h |
| - | optional **F1** | route or retire the Phase 5 operations (owner decision) | - |

Rules that bind every milestone: use the canonical engine (`canonical`/`ops`) for all graphical edits - **no second score model** in TypeScript, the piano roll only does geometry and commits one operation per gesture; the ABC text stays the only stored score; never accept malformed ABC (the gate exists - keep it in force); keep the new stages bypassed/collapsed until used; remove `is_experimental` from a node only when its milestone is accepted.

### 2.1 Done in Phase 11C

**M1/D1 - piano roll and chord lane** (`f1f968a`): `frontend/src/sheet-editor/score/pianoRoll.ts` (pure: geometry, hit testing, gesture → exactly one canonical operation, keys, selection mapping) and `PianoRoll.vue` (SVG, ghost while dragging, windowed drawing, snap, zoom, active track Vocal/Ins, chord lane with inline name editing) in `ScoreTab.vue`, above the notation (on/off and zoom in the editor prefs). Gestures: move (`move_notes`), resize (`resize_note`, Review mode *rests*, Alt = *overwrite*), draw / double-click (`insert_note`), Delete (`delete`), Shift+Delete (`delete_close_gap`), arrows (`set_note_pitch`, `move_notes`, `resize_note`), chords (`move_chord`, `put_chord`, `delete_chord`). One selection with the staff and the ABC text (element ids; the session turns canonical result ids into segments via `elementSelection`). The reveals in the notation and the ABC text scroll only their own pane now (they scrolled the dialog). Tests: `frontend/tests/pianoRoll.test.ts` (21), session test updated; **checked in the real frontend** (ComfyUI 0.37.0, isolated `tools/dev_server.py --test-nodes`): select, move, draw into Ins, ↑/Delete/Ctrl+Z, chord add, invalid text → stale roll + Apply off → revert, refused resize → ghost removed + reason. User guide: `docs/user/concepts/score-editor.md` (piano roll, delete rule, commit gate).

**M1/D2 - layouts and inspector** (`d7621a2`): layouts *Review* (piano roll, notation, inspector, navigator with *Lyrics fit* when the song has lyrics; ABC text under *ABC text (advanced)*) and *Text* (ABC text + notation); the node property `plenio_editor_layout` (`review`, `text`; `daw` opens *review* until M2) chooses the layout a sheet opens in, else the viewer's last (editor prefs, which also read the 0.2.x values). `Inspector.vue` with pure `frontend/src/sheet-editor/score/inspector.ts`: note fields (voice, pitch `C#5`/MIDI, start bar + units, length units/note value with *over the next note*, chord at the note, → rest, close gap), chord fields (name, start, remove) and bar fields (+ before, + after, duplicate, delete, meter of empty bars, key from the bar, remove the change) - each one canonical operation. Transport metronome (`playback.schedule` clicks, player sound). Backend: `duplicate_measures` copies a section only when the block holds all of it (the browser check found a second "verse" after duplicating bar 1). Tests: `frontend/tests/inspector.test.ts` (15), prefs migration, `test_duplicating_part_of_a_section_extends_it`; checked by hand in the real frontend (ComfyUI 0.37.0): both layouts incl. the node property, pitch/length from the inspector, duplicate, key change + removal (inline `[K:G]` in both voices, pitches kept), insert bar + 3/4 meter (own group with `M:` lines). The navigator keeps the Phase 5 section operations (F1). User guide updated.

**M4/D8 - EQ panel** (`c026f9b`): the widget under the EQ node is now a full panel (plan §5): a 560×260 curve that grows with the node, a gain-range toggle (±6/±12/±18 dB - the dB axis follows through `withRange`), the last run's spectrum behind the curve (grey before, blue after, from the node's UI payload), handles with Shift = fine (a damped drag), wheel = Q, double-click = gain 0, double-click on an empty place = a new bell, Delete/right-click = remove, arrows/`+`/`-`/`0` on the keyboard, a band strip whose chips (`● 2 Bell 1.20 kHz +2.0 dB Q 1`) open an inline editor (type, Hz, dB, Q, enable, remove), *Edit these bands* for a match proposal (copies it into manual and switches the mode), and a toolbar (presets, range, undo/redo, reset, bypass compare, *bands as text*). The stored value stays `plenio.eq/1` in `mode.bands`; the raw JSON widget is hidden by default (`computeSize`) and reachable with one click. `plenio/comfy/nodes/eq.py` sends 1/6-octave profiles before/after (`spectrum_before_db`/`spectrum_after_db`; *flat* sends none). Tests: Vitest `eqCurve.test.ts` (11 incl. the six new panel cases), host `test_production_path.py` (the spectrum shift of a -6 dB preamp, a flat-mode case). Doc: `mastering.md`.

**M3/D6-D7 - brief template panel and manual lyrics** (`d3fe3e1`): `POST /plenio/brief/fields` answers the one precedence rule for a brief's widget values (`field_sources`, the template's fills, `template_choice_hints`, the `custom` note). `frontend/src/extension/briefTemplate.ts` attaches a panel to Song Brief and Cover Brief (public widget API): the *Template fills:* line, the *suggests:* line, *Copy template text* (empty fields only), *Use template choices*, *Reset all to template* (confirmation), refresh; it reads values by widget name (the vocals children are `vocals.*`), asks the backend on creation, after configure, on a template/text change (400 ms debounce) and after its actions, and clears the legacy `custom` from the text widgets after a load (`migrate.ts` clears the named-values path; positions are not guessed). **No ghost text:** the 1.53.6 bundle passes no placeholder to a single-line text widget and a dynamic placeholder has no API, so the documented fallback line carries the feature (recorded as evidence, not as an unverified assumption). Lyrics tab: *Use my own lyrics* and section-tag helpers (`frontend/src/shared/lyricsTags.ts`, tested); the sheet summary and the widget line say `lyrics: yours (manual)`. Tests: host `test_the_brief_fields_route_answers_the_one_precedence_rule`, Vitest `briefTemplate.test.ts` (9), `lyricsTags.test.ts` (2). Docs: `docs/user/concepts/brief-templates.md`, the manual-lyrics note in `song-sheet.md`, the user README link.

**M2/D4-D5 - YuE2 · DAW** (`db3bc00`): `plenio/core/score/skeleton.py` builds an all-rest score from the brief (measures from its length and tempo; meter and key read from the brief's text fields, else the documented defaults 4/4, C major, 100 BPM - each reported); Score Tools gained *new score from brief* (its `score` input is optional for this operation only; a cover brief or a missing brief is refused with a hint). The Song Sheet **review stop now wins over document errors**: a run that would stop for approval stops *instead of failing*, with the findings in the payload and the outputs blocked (the DAW skeleton's first run needs exactly that; I12 still refuses to render, and an approved all-rest score raises on the next run). Template **5 · YuE2 · DAW** (`tools/build_graphs.py`): groups 1 SONG … 6 FINISH + MUSIC MODEL, the DAW sheet carries `plenio_editor_layout = "daw"`, App mode like the song template, thumbnail, catalogue entries (YuE2 3B, writer, optional Cover Art). Frontend: the layout **daw** (Review plus track headers), `TrackPanel.vue` + pure `tracks.ts` (Vocal → `V: Vocal`, Instrument → `V: Ins`, Chords → chord symbols, Guide → *not sent to YuE2*; note counts; playback switches), the Guide notes in the node property `plenio_guide` (`[[onset, duration, pitch]]`; read on open, written on Apply, played with the score via `playback.schedule`'s new `guide` part, exported/imported through the MIDI tools, clearable from the panel). Tests: `tests/unit/test_score_skeleton.py` (30), `tests/host/test_daw_path.py` (4: skeleton → stop → the drawn score reaches the renderer byte for byte; a manual score survives a changed brief; an approved all-rest score raises), workflow tests (template 5 anatomy, App config, mode, finish), catalogue tests updated, `frontend/tests/dawTracks.test.ts` (8). Guide: `docs/user/paths/yue2-daw.md` (+ links in the user README and getting started, help page of Score Tools).

**M1/D3 - MIDI export and import UI** (`e5354bd`): the Score tab's view row carries *Export MIDI* (downloads the score and the Guide notes as a type-1 file named after the title document; off while the text is invalid, like Apply) and *Import MIDI…*; the import dialog (`MidiDialog.vue` + the pure `midiImport.ts`: role choices, explicit mapping, grid from the score's own unit, base64) shows the file's tracks with a role each (Vocal, Instrument, Chords, Guide, do not import), the grid, *read chords from the notes* and the import report **before** anything is replaced; *Insert* replaces the text as one undo step (`useScoreSession.replaceText`, which takes the imported view so there is no second round trip) and hands the Guide notes to the sheet. Backend: `midi.import_midi(..., chords_from_notes=)` and `TrackInfo` (index, name, notes, role) on `MidiImport`; the import route returns `tracks` and takes `chords`; the new pure `plenio/core/score/chords.py` reads chord symbols from a Chords track's notes by template matching (key-aware spelling, slash bass for a non-root bass, repeated harmony merged, what fits nothing counted; written `plenio:chord` events always win). Tests: `tests/unit/test_score_chords.py` (9), `test_score_midi.py` (+3), host `test_song_path.py::test_midi_import_lists_tracks_maps_roles_and_reads_chords` (+ the extended route test), `frontend/tests/midiDialog.test.ts` (11) and a `replaceText` session test. **Not run:** a browser check of the dialog (see §5).

## 3. Files and components (Phase 11B)

- **New core:** `plenio/core/score/canonical.py`, `ops.py`, `midi.py`, `chords.py` (M1/D3), `skeleton.py` (M2/D4); `plenio/core/audio/refine.py`, `stems.py`.
- **Changed core:** `plenio/core/score/operations.py` (dispatch, `model_view`, `editor_view`), `plenio/core/brief.py`, `plenio/core/sheet/evaluate.py`, `plenio/core/engines/yue2.py`, `plenio/core/models.py` (audio model folders); `plenio/comfy/nodes/sheet.py` (review stop before document errors, M2).
- **ComfyUI layer:** `plenio/comfy/audio_models.py` (new), `nodes/audio_model.py`, `nodes/refine.py`, `nodes/stems.py` (new), `nodes/__init__.py`, `types.py`, `host.py` (folders, `model_files`), `routes.py` (MIDI), `nodes/brief.py`, `nodes/cover_brief.py` (notes in the summary).
- **New frontend:** `src/shared/lyricsTags.ts`, `src/extension/briefTemplate.ts` (M3); `src/sheet-editor/score/midiImport.ts` + `MidiDialog.vue` (M1/D3), `tracks.ts` + `TrackPanel.vue` (M2).
- **Tests:** unit `test_score_canonical.py`, `test_score_ops.py`, `test_score_view.py`, `test_score_midi.py`, `test_score_chords.py` (M1/D3), `test_precedence.py`, `test_refine.py`, `test_stems.py`; `tests/support/score_strategies.py` (on the pytest path); host `test_refine_node.py`, `test_stems_node.py`, additions to `test_song_path.py`, `conftest.py` (an unreadable model file per audio folder), `plenio_test_nodes/fakes.py`, `test_audit_regressions.py`; frontend `tests/scoreEditor.test.ts`, `tests/fixtures/tricky-score.json` (regenerated from `editor_view`).
- **Generated:** `tools/data/node_types.json`. Templates and blueprints are unchanged (the new nodes are not wired yet).

## 4. Tests run at this checkpoint (owner's machine, Windows 11, Python 3.12.9 of ComfyUI 0.37.0, CPU)

| Suite | Command (bash, repository root; `PY=/d/Daten2/ComfyUI/.venv/Scripts/python.exe`) | Result |
|---|---|---|
| unit + workflow + contract | `PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY -m pytest tests/unit tests/workflows tests/contract` | 899 passed, 4 skipped (after M4) |
| host (real server, fakes) | `PLENIO_COMFYUI_ROOT=D:/Daten2/ComfyUI PYTHONPATH=.devdeps $PY -m pytest tests/host` | 108 passed, 8 skipped (after M4) |
| frontend | `cd frontend && npm run check` | vue-tsc clean, 140 Vitest passed, build ok (after M4; 134 after M3) |
| lint | `PYTHONPATH=.devdeps $PY -m ruff check . && ... ruff format --check .` | clean |
| types | `PYTHONPATH=.devdeps $PY -m mypy --python-version 3.12` | only `type-arg` errors for bare `np.ndarray` (local numpy 2.2 stubs), the same class as the 23 pre-existing ones; nothing else |
| workflows | `$PY tools/workflow_validation.py` | all ok |
| extra fuzzing (scratch, not in the suite) | hypothesis with raised limits | 5 000 models + 3 000 accepted texts (identity, round trip, validity); 2 000 edit sequences × 25 steps - no failure |

## 5. Limitations and local validation still required

- **Not run:** `tools/browser_check.mjs` and frontend 1.53.6. The score editor (piano roll, gate banner, disabled Apply, revert; layouts, inspector, bar/key/meter edits) was checked by hand in the real frontend of ComfyUI 0.37.0 during M1/D1 and D2. **M1/D3:** the MIDI dialog is covered by Vitest with a mounted component and a fake fetcher (tracks, role change → new request, grid, chord switch, report, Insert, a refused file) and by the host route test; a browser check of the dialog itself (real file picker, real download) was **not** run - no browser automation is available in this session. The owner's L4 check covers it. The metronome's sound was not listened to (its schedule is tested).
- **No real audio models:** Refine and Stems ran only with fakes (pointwise SR engine, fixed-fraction separator). The refine defaults are **provisional** until L1; the < 0.1 LU criterion is reported, not enforced.
- **mypy in CI:** the new audio modules use bare `np.ndarray` like the existing ones; CI (older numpy stubs) is expected to accept them, but CI did not run (nothing pushed).
- **Owner checklist (plan §15):** L1 SR study (needs M5), L2 separation (needs M6), L3 full runs incl. the DAW template (needs M2), L4 frontend 1.53.6 (ghost text, piano roll, mixer and EQ widgets, the score gate) - plus the still open Phase 10 conditions (§8.3).

## 6. Exact next task

**M5 / D9 - UniverSR adapter and study tooling** (plan §16.2, §4): vendor the hash-pinned MIT inference code under `plenio/third_party/universr/`, register an adapter with `plenio.comfy.audio_models.register` (kind *super-resolution*, `input_rate` per condition, `condition_hz`, chunking values), weights through ComfyUI's model management, seed handling; catalogue entry (`resources/models.toml`, folder `audio_sr`, CC-BY-4.0 with attribution); `tools/studies/sr_study.py` (simulation set, the metrics of §4.5, listening pack). Then D10: the *Plenio · Refine (48 kHz)* blueprint (loader collapsed → Refine), the *REFINE (optional)* groups in the templates (MiniMax active with engine *model*, the others bypassed), reports into Export, System Check rows, and `is_experimental` removed from Load Audio Model and Refine when accepted. Unit tests of the adapter's pure parts, host tests with the real adapter on a tiny fake checkpoint where possible, workflow tests of the defaults, browser check, `docs/user/concepts/refine.md`; the provisional defaults stay marked until the owner's L1.

---

## 7. Decisions of Phase 11A/11B (in addition to §8.4)

- One canonical score engine in `plenio.core.score` (`canonical`, `ops`); the ABC text is the persisted document; views derive from exactly one text; the TypeScript side has no score model.
- Supported language = the native two-voice dialect; round trip promised only there; measures must be whole units (§9.2).
- Deletion leaves a rest; close-gap only on request; overwrite semantics inside a voice; the Phase 5 operations stay as they are until F1.
- DAW tracks: Vocal, Instrument, Chords are sent to YuE2; Guide never is.
- MIDI files carry Plenio's unit and layout in a text event (lossless); foreign imports are deterministic and reported.
- Template precedence is stateless (typed > template > empty); `custom` is empty.
- Refine: one node, injected engines, *resample only* as a visible engine; defaults from measurements (L1). Stems: residual invariant, effects injected, sends without a bus refused.
- New nodes start as `is_experimental` until their milestone wires and accepts them.
- Phase 11B commits stay local (owner instruction); earlier phases pushed checkpoints to `origin/main`.

## 8. Earlier checkpoint: Phase 10 and 0.2.x (2026-09-25, still valid context)

Written for the return from the cloud session to the owner's machine; the open owner checks of §8.3 still apply. Read with the [Phase 10 acceptance report](../audit/2026-09-25-phase-10-acceptance.md), [implementation-roadmap.md](implementation-roadmap.md) and [docs/dev/extending.md](../dev/extending.md).

### 8.0 Releases after the acceptance review

- **0.2.1** (2026-09-25): renamed branding images (Registry icon and banner).
- **0.2.2** (2026-09-26, owner's requests after the first real use; details in `CHANGELOG.md`):
  - **Work mode** as the first field of Song Brief and Cover Brief: *new song every run* (batch - `fingerprint_inputs` re-runs the brief every time, the brief carries a random *series variation*, `plenio.core.writing.series_lines` asks the writer for a new song with a rotating angle) and *one song, stop to review* (careful - constant brief, the Song Sheets stop). The Song Sheet's new review option *as the brief says* (`plenio.core.sheet.effective_review`) makes the brief decide for all sheets; the templates use it. Workflows saved before get the careful mode on load (`frontend/src/extension/migrate.ts`).
  - **App mode**: the Song Sheet's DOM widget (the *Edit Song Sheet…* button) works in App mode (verified in the browser with frontend 1.52.7: stop, open, Approve, run again); the song apps show the mode and the sheet buttons, and the cover template has an app now.
  - Ten **lengths** (1:00 ... 6:00); the engines were already continuous in seconds.
  - **Cover art** embedded by Plenio's own FLAC/ID3 writer (`plenio.core.release.embed_cover`) for every tag option; mutagen is no longer used.
  - Node **summaries** re-sent for cached nodes (`has_intermediate_output`) and kept in the node's properties across reloads.

### 8.1 What has been completed

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

### 8.2 Partially implemented

- MiniMax: instrumental caption wording (I-5) adopted from the legacy toolkit, not yet listened to.
- Restoration decision C1 needs measurements on unprocessed takes.
- App mode shows only the sung options of *vocals* (frontend limit, documented).
- File sizes of the writer and the adapter are not in the catalogue (no source here); licences of the FLUX.2 text encoder and VAE to be confirmed on the model cards before a public release.

### 8.3 What remains (the acceptance conditions, on the owner's machine)

Done by the owner (reported 2026-09-25): the Phase 9 fixes - a *new lyrics* cover transcribes the source in its own language (the transcription itself not always exact), MP3 export of a 96 kHz file, editor speed on a long YuE2 plan - and the templates in frontend 1.53.6 ("passt"). The reported full-suite run does **not** count: it ran a checkout at Phase 5 (560 tests) without `PLENIO_COMFYUI_ROOT`, so every host and smoke test was skipped.

1. **Update the checkout that runs the tests** (`git pull origin main`; 766 tests are collected now) and run the **full suite with the real models**: `PLENIO_COMFYUI_ROOT`, `PLENIO_MODELS_DIR`, `PLENIO_SMOKE=1` (commands in the acceptance report §6). This covers the tokenizer contract tests, S-1...S-7 and Cover Art.
2. Template runs of *3 · MiniMax · Song* (sung and instrumental) with a listening verdict on I-5; MiniMax has never run with the real model.
3. *4 · Enhance & Master*: curve widget, save/reload of a manual EQ, A/B; restoration gate on unprocessed takes and the C1 decision.
4. One first-use run of each template following only its About note; the System Check against the real models folder.
5. Record the results in the Phase 6-8 reports and set the roadmap statuses of Phases 6-8 to *Done*.

### 8.4 Important architectural decisions since Phase 1

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

### 8.5 Files and modules changed last (Phase 10)

- CI and tests: `.gitattributes`, `tests/conftest.py` (GitHub annotations), `tests/unit/test_audio.py` (tone-match tolerance), `tests/host/test_score_tools_node.py`, `tests/host/test_foundation.py` (snapshot), `tests/contract/test_data_schemas.py` and `tests/host/test_production_path.py` (record schema), `tests/unit/test_minimax.py` (engine interface), `tests/unit/test_models_catalogue.py` (licences).
- Code: `plenio/core/engines/__init__.py` (`MODULE_INTERFACE`, `WRITING_RULE_KEYS`), `tools/snapshot_node_types.py` (`take_snapshot`), `tools/data/node_types.json` (refreshed).
- Docs: `docs/audit/2026-09-25-phase-10-acceptance.md`, `docs/dev/extending.md`, annotations in `target-architecture.md` §13/§15/§16.
- Built output committed: `web/js/plenio.js`, `web/js/chunks/*.mjs`; generated: `subgraphs/*.json`, `example_workflows/*.json`, `example_workflows/*.jpg`.

### 8.6 Known issues

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

### 8.7 Tests executed at this checkpoint

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

### 8.8 Tests that need the local GPU / ComfyUI environment

- **Host tests** (`tests/host/`, marker `host`): need a ComfyUI checkout with its Python environment (`PLENIO_COMFYUI_ROOT`); they start a real server on the CPU with fakes. Without it they are skipped.
- **Contract tests** marked `comfy` (ComfyUI importable; e.g. the YuE2 tokenizer test also needs `PLENIO_MODELS_DIR`).
- **Smoke tests** (`PLENIO_SMOKE=1`): `tests/host/test_song_models.py` (S-1, S-2, S-6: YuE2 int8 + writer, SheetSage2 optional), `tests/host/test_cover_art_models.py` (FLUX.2 Klein files), `tests/host/test_cover_models.py` (GPU, SheetSage2, faster-whisper large-v3, the legacy MiniMax sample), `tests/host/test_minimax_models.py` (S-5, MiniMax Music 3 models), `tests/host/test_master_smoke.py` (S-7, CPU, the legacy MiniMax sample or `PLENIO_LEGACY_SAMPLE`).
- **Browser checks** (`tools/browser_check.mjs`, see `docs/dev/testing.md`) and **real template runs** (`tools/dev_server.py --gpu --models <dir> --port 8190 --base <dir>`): YuE2 3B, Gemma 4 writer, instrumental LoRA, SheetSage2; owner's RTX 5060 Ti 16 GB, models in `F:\ComfyUI\models`, ComfyUI 0.37.0 in `D:\Daten2\ComfyUI` (frontend 1.53.6, Python 3.12.9).
- Everything else (unit, workflow, Vitest) runs without ComfyUI (pure Python with numpy; Node for the frontend).

### 8.9 Recommended next action at that checkpoint (superseded by §6 for the next-release work)

Run the owner-machine checks of §8.3 (first the full suite with the real models on the current commit) and record them in the Phase 6-8 reports. The refactor prompt set ended with Phase 10; the next-release prompt set (Phases 11A-11C) followed; the optional Qwen3-ASR engine, fade-out and the Repair node C1 still need the owner's decision.

### 8.10 Context a new session would otherwise have to rediscover

- **Owner rules**: the legacy repository (`ComfyUI-MiniMax`, owner's machine) is read-only; reply to the owner in **German**, write code and docs in **English**; never install into the owner's ComfyUI environment (dev tools live in the untracked `.devdeps/`); downloads beyond what the owner approved need consent; one phase per authorization with a hard stop; commits: the owner asked for checkpoint commits pushed to `origin/main` (earlier rule "commit only at the end" was lifted for checkpoints); **Phase 11B: local commits only, nothing pushed**.
- **Dev setup (owner's machine, Phase 11B)**: ComfyUI's Python `D:\Daten2\ComfyUI\.venv\Scripts\python.exe` (3.12.9) with the dev tools in the untracked `.devdeps/` (`PYTHONPATH=.devdeps`; pytest 8.4.2, hypothesis 6.168.1, ruff 0.13.3, mypy 1.18.2); `PLENIO_COMFYUI_ROOT=D:\Daten2\ComfyUI` for contract and host tests; hypothesis strategies of the score engine in `tests/support/` (on the pytest path).
- **Dev setup (cloud)**: Python 3.12 with `numpy`, `scipy`, `av`, `pyloudnorm 0.2.0`, `mutagen`, `pytest 8.4.2`, `hypothesis 6.168.1`, `ruff 0.13.3`, `mypy 1.18.2`, `coverage`; a ComfyUI 0.37.0 checkout with its own venv for host tests (`PLENIO_COMFYUI_ROOT`); run `pytest` from the repository root (config in `pyproject.toml`; markers `comfy`/`host`/`smoke` skip without their environment). Frontend: `cd frontend && npm ci && npm run check` (writes `web/js/`, which is committed). CI results: `https://api.github.com/repos/jplenio/Plenio-Music-Production-System/actions/runs` (jobs and annotations are readable; logs are not). A test run in a folder whose name is a valid Python identifier makes pytest import the repository's `__init__.py` (clone into a folder with a hyphen, as ComfyUI and CI do).
- **Generated files**: never hand-edit `subgraphs/*.json`, `example_workflows/*.json` or the thumbnails; change `tools/build_graphs.py` (model files: `resources/models.toml`), run it and `tools/build_thumbnails.py`, validate with `tools/workflow_validation.py`. After node schema changes re-run `tools/snapshot_node_types.py` (needs ComfyUI) - the snapshot `tools/data/node_types.json` is committed.
- **Dialect facts**: native two-voice ABC (`Vocal`, `Ins`), fixed 8-line header, groups of 1-4 bars per voice, `% label` comments start sections, accidentals apply by letter across octaves within a bar, unmarked tied continuations keep their pitch, supported lengths {1,2,3,4,6,8,12,16,24,32,48} units, chords only in `Vocal`; the vendored upstream parser `plenio/third_party/yue2_abc_tools.py` is the authority.
- **Fixtures**: `tests/fixtures/abc/upstream-*.abc`, `tests/fixtures/cover/*.json` (real SheetSage2 transcription of M2 with events, YuE2 plans Y2/Y3 with vocal notes and ASR words).
- **Owner verdicts and decisions**: `docs/design/yue2-cover-design.md` §21, `instrumental-strategy.md` §13, listening pack verdicts summarised there.
