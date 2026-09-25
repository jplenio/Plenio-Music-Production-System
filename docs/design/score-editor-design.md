# Score / Notation Editor Design (package item K)

| | |
|---|---|
| Status | Phase 1B design baseline — minimal text UI in Phase 3, full editor in Phase 5 |
| Date | 2026-09-25 |
| Scope | The reusable editor used by the **Song Sheet** node: notation, raw ABC, lyrics, style/caption, title, artwork prompt; validation; approval |
| Related | [target-architecture.md](target-architecture.md) §5–§6, §8.1 · [yue2-cover-design.md](yue2-cover-design.md) §4 |

The editor serves the flow **Generate/Transcribe → Inspect → Edit → Validate → Generate**. It is a general ComfyUI notation component: it knows *documents* and a *score dialect*, never which template or engine it runs in.

---

## 1. Requirements mapped to design

| Requirement | Design element |
|---|---|
| rendered notation | abcjs rendering of a display version of the score (§5) |
| ABC support incl. the native dialect | backend analysis with the vendored upstream parser; accidental normalisation for display (§5.3) |
| lyrics | section panel next to the score; lyrics never enter the model ABC (§7) |
| direct note editing | selection → semantic edit operations applied by the backend (§6) |
| synchronized raw ABC editing | CodeMirror view of the canonical text, live validation (§6) |
| validation | `/plenio/score/analyze`, `/plenio/lyrics/analyze`, `/plenio/sheet/resolve` (§4) |
| measure navigation | bar/section navigator from the analysis timeline (§6.4) |
| undo/redo | snapshot history per document (§6.5) |
| playback / cursor | abcjs synth + cursor; A/B with the source recording (§8) |
| later piano roll / DAW-like view | analysis exposes note events; edit operations are view-independent (§11) |
| reusable, not YuE2-specific | documents + dialect parameter; engine rules only through the node's validation result (§2) |

---

## 2. Component boundaries

```text
┌──────────────────────────── ComfyUI node (PlenioSongSheet) ───────────────────────────┐
│ widget "sheet_state" (custom widget type, serialised with the workflow)               │
│ canvas summary: document states · validation badge · key/tempo/bars/duration · buttons │
└───────────────┬───────────────────────────────────────────────────────────────────────┘
                │ open
┌───────────────▼──────────────── Sheet dialog (Vue app, bundled) ──────────────────────┐
│ Tabs: Lyrics · Score · Style/Caption · Details (title, artwork prompt)                │
│ Score tab: Notation view (abcjs) | ABC text (CodeMirror) | Lyrics-by-section panel     │
│            Transport (play/stop, voice toggles, tempo, loop, A/B source)              │
│            Navigator (sections, bars) · Validation panel · Operation palette          │
│ Footer: state badges (auto/edited/manual) · Revert · Apply · Approve                  │
└───────────────┬───────────────────────────────────────────────────────────────────────┘
                │ JSON routes (pure core functions)
┌───────────────▼──────────────── Backend: plenio.comfy.routes → plenio.core ────────────┐
│ score.analyze / score.transform · lyrics.analyze · sheet.resolve                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

- The **node** stores only `sheet_state`. It executes, validates and blocks/unblocks outputs.
- The **dialog** edits working copies and writes `sheet_state` on *Apply*.
- The **backend routes** compute everything musical. The frontend never re-implements parsing, validation or fingerprinting.

---

## 3. Frontend technology

| Choice | Decision | Reason |
|---|---|---|
| Language/build | TypeScript + Vite, ES module output into `web/js/` (committed build) | typed, fast, standard for ComfyUI extensions |
| UI framework | **Vue 3, bundled** (ComfyUI does not expose its Vue to extensions [CM]) | editor has tabs, panels, lists, dialogs, undo — a framework keeps it maintainable; same ecosystem as the ComfyUI frontend |
| Notation | **abcjs 6.7.x** (MIT, maintained, bundled by SheetSage2's own renderer [VF]) | rendering, synth playback with cursor control, element selection, keyboard navigation; the app rewrites the ABC on edits (documented abcjs behaviour [UP]) |
| Raw ABC | **CodeMirror 6** (MIT) | line numbers, diagnostics markers, small bundle, accessible |
| ComfyUI integration | documented hooks only: `registerExtension`, `getCustomWidgets`, `nodeCreated`/`beforeRegisterNodeDef`, widget values, dialog/toast APIs | R11; frontend migration notes (Pinia-backed widget values, shallow-copied `onConfigure`) |
| Loading | the editor chunk is lazy-loaded when the dialog opens | no cost for graphs without a Song Sheet |
| Styling | ComfyUI CSS variables for colours; follows light/dark theme | consistent look |

Rejected: Verovio (LGPL-3.0, heavy WASM, MEI-centred), OSMD (MusicXML only), building an engraver from VexFlow (too low level), canvas-drawn LiteGraph widgets for the editor (not maintainable).

---

## 4. Backend contract

### 4.1 `POST /plenio/score/analyze`

Request: `{ "abc": "...", "dialect": "yue2-native" }`

Response (abridged):

```json
{
  "ok": true,
  "sha256": "…",
  "diagnostics": [{"severity": "error", "line": 12, "column": 5, "bar": 7, "voice": "Vocal", "message": "bar has 30/32 units"}],
  "header": {"meter": "4/4", "unit": "1/32", "tempo_bpm": 88, "key": "G"},
  "bars": [{"index": 1, "start_s": 0.0, "duration_s": 2.727, "meter": "4/4", "key": "G", "chords": ["Gmaj7", "Am7"]}],
  "sections": [{"label": "verse", "start_bar": 1, "bars": 8, "start_s": 0.0, "end_s": 21.8}],
  "voices": {
    "Vocal": {"notes": [{"id": "V:1:0", "bar": 1, "onset_q": "0", "duration_q": "1", "midi": 71, "spelled": "B", "source_range": [210, 212], "display_range": [214, 216]}]},
    "Ins": {"notes": []}
  },
  "display_abc": "… explicit accidentals …",
  "offset_map": [[214, 210], …],
  "duration_s": 187.3
}
```

### 4.2 `POST /plenio/score/transform`

Request: `{ "abc": "...", "dialect": "yue2-native", "operation": {"op": "set_pitch", "note": "V:3:2", "midi": 74} }`

Operations (same core functions as the Score Tools node): `set_pitch`, `shift_pitch` (±1 semitone/±octave), `set_duration` (within the bar, keeps bar length by adjusting the following rest or refusing), `note_to_rest`, `rest_to_note`, `set_chord` / `remove_chord` (supported qualities only), `transpose` (range or whole score, re-spelled), `set_tempo`, `strip_chords`, `voices` (mute / move-to-Ins), `rename_section`, `move_section_boundary`.

Response: `{ "abc": "...", "changes": ["bar 3 Vocal: D5 → F#5"], "diagnostics": [...] }` — edited bars are re-spelled the way the native writer spells them (accidentals only where the key/bar needs them, whole-bar rests as `Z`), all other bars stay byte-identical.

### 4.3 `POST /plenio/lyrics/analyze`

Request: `{ "lyrics": "...", "abc": "... (optional)", "instrumental": false }` → sections, tag list, tag/section consistency with the score, per-section estimated syllables vs. vocal note onsets, instrumental violations.

### 4.4 `POST /plenio/sheet/resolve`

Request: `{ "sheet_state": {...}, "upstream": {"lyrics": {"text": "...", "sha256": "..."}, ...}, "rules": {"engine": "yue2", "instrumental": false} }` → resolved documents, per-document status (`auto`/`edited`/`manual`/`conflict`), validation, **fingerprint** of the resolved documents.

---

## 5. Data model

### 5.1 Persisted: `SheetState` (widget value)

Defined in [target-architecture.md](target-architecture.md) §5.3: per document `state`, `text`, `base_sha256`; review block with `approved_fingerprint`. Nothing else is persisted. UI preferences (tab, zoom, voice toggles) live in `localStorage`, never in the workflow.

### 5.2 Session (not persisted)

```text
EditorSession
  upstream        docs from the node's last execution payload (text + sha256 per document)
  working         working copy per document (text), dirty flags
  analysis        last analyze result per score/lyrics working copy
  selection       {document, note ids | bar range | section}
  history         per-document stack of {text, label} snapshots + cursor
  validation      last sheet.resolve result (statuses, fingerprint)
```

### 5.3 Accidental semantics

The native dialect propagates an accidental **by letter across octaves within a bar**; abcjs playback applies it only to the same octave (`abc_midi_flattener.js`: "change that pitch (not other octaves) for the rest of the bar") [VF]. The backend therefore produces `display_abc`, in which every inherited accidental is written explicitly, plus an offset map. Rendering and playback use `display_abc`; the canonical text is never replaced by it (redundant accidentals could change the token sequence the model sees).

---

## 6. Editing and synchronisation

### 6.1 Canonical representation

The **ABC text** of the working copy is canonical. Notation, navigator, lyrics fit and validation are derived from it by `score/analyze`.

### 6.2 Two ways to edit, one pipeline

| Path | How | Then |
|---|---|---|
| Text | CodeMirror edits the working text directly | debounced (≈300 ms) analyze → diagnostics + re-render |
| Notation | click/keyboard selection in abcjs → note/bar id via `display_range` → palette command or shortcut → `score/transform` | new text replaces working copy → analyze → re-render |

Both paths push a history snapshot. There is never a second, divergent score model in the frontend.

### 6.3 Commit semantics

- **Apply**: write working copies into `sheet_state` (state `edited` with the upstream hash, or `manual` when the user chose *manual* or there is no upstream). The node re-executes on the next run.
- **Revert**: discard working copies.
- **Make manual / back to auto**: explicit per-document buttons with an explanation.
- **Approve** (when the node's review is *stop for review*): enabled only if `sheet.resolve` reports no errors; stores the backend fingerprint. A later change of any resolved document invalidates the approval automatically.
- Closing with unapplied changes asks to apply or discard (dialog API).

### 6.4 Navigation

Section list and bar strip from the analysis timeline; click to scroll the notation, select the bar, and position playback. Errors link to their bar.

### 6.5 Undo/redo

Snapshot-based per document (scores are small text files), labelled with the operation ("transpose +2", "bar 7 Vocal: C5 → D5"). Keyboard shortcuts inside the dialog only.

---

## 7. Lyrics handling

- The lyrics document is sectioned text owned by its sheet instance. In a score-only sheet the lyrics are **context** (read-only).
- The Lyrics tab shows the score's sections next to the lyrics blocks: order/count mismatches are highlighted; per section a fit hint (estimated syllables vs. vocal note onsets — "onsets are not syllables; melismas are allowed").
- Instrumental rules (from the node's rules): only tags; words are flagged as errors.
- Model ABC never contains `w:` lines (native dialect rule [UP]). An "approximate underlay" preview (display-only `w:` lines generated for abcjs) is a later option, labelled as an approximation.

---

## 8. Playback and A/B listening

- abcjs synth on `display_abc` with cursor, voice toggles (Vocal / Ins / chords), tempo override for practice, loop of a selection.
- **A/B with the source**: if the sheet receives `reference_audio`, the dialog plays the recording from the selected bar's `start_s` (timeline from the transcription), switching between synth and source to check transcription errors.
- Playback is a guide to the notes, not a preview of the YuE2 rendering (stated in the UI).

---

## 9. Validation states in the UI

| State | Badge | Approve | Run |
|---|---|---|---|
| valid | ✓ | allowed | proceeds |
| warnings | ⚠ with list | allowed (warnings recorded) | proceeds |
| errors | ✖ with list, bar links | blocked | node stops with the same errors |
| conflict (stale edit) | ⇄ with the three choices | blocked | node stops |
| waiting for approval | ⏸ | — | outputs blocked |

---

## 10. Persistence and save/reload

- `sheet_state` is a normal widget value: saved with the workflow, restored on load, part of the executed prompt (so the release record contains it).
- The dialog shows upstream documents only from the **latest execution payload of this node**; if the node has not run yet, only *manual* editing is offered (no stale copy of old upstream text).
- Unique, stable widget names; no widget renaming after registration (frontend migration notes).

---

## 11. Extensibility

| Extension | How |
|---|---|
| Piano-roll view | new view over `analysis.voices.*.notes`; edits through the same `score/transform` operations; shares history and selection |
| MIDI import/export | backend conversion routes; not part of the model ABC path |
| Other dialects | `dialect` parameter; new parser/validator/ops module in `core.score.dialects` |
| Take comparison | play multiple rendered takes against the score (later) |
| Other documents | new tab + document registry entry in `core.sheet` |

---

## 12. Known limits

- The native dialect excludes tuplets, grace notes, polyphony, repeats, endings, slurs, decorations and `w:` [UP]; the editor offers no such constructs.
- Two monophonic voices only; chord symbols only in `Vocal`, supported qualities only.
- Duration edits must keep every bar exact; the editor refuses edits that would break a bar instead of re-barring silently.
- Rendering of very long scores is paged/virtualised by section (performance [AS-12]).

---

## 13. Tests (details in [testing-strategy.md](testing-strategy.md))

- Core (pytest): analysis on fixtures incl. accidental-propagation cases, every transform operation (invariants, byte-identical untouched bars), display normalisation + offset map, lyrics fit, resolve/fingerprint.
- Frontend (Vitest): session store, history, selection ↔ note-id mapping, commit semantics, route client error handling.
- Integration: dialog + a real ComfyUI instance with a fake upstream node (Playwright, opt-in): open, edit, apply, save workflow, reload, run, conflict flow, approval flow.

## 14. Phasing

| Phase | Deliverable |
|---|---|
| 3 | Song Sheet node with the minimal dialog: text areas for each document, validation list from `sheet.resolve`, state buttons (auto/edited/manual), Apply, Approve. Same backend contracts as the final editor. |
| 4B | Cover needs (Phase 4A spec, [yue2-cover-design.md](yue2-cover-design.md) §14/§16): lyrics diff against the ASR draft with low-confidence words highlighted, section table with start times from the transcription timeline and *play this section of the source*, easy relabelling and moving of section boundaries (the most frequent transcription error in 4A: boundaries off by 2–8 bars), conflict dialog. |
| 5 | Full editor: abcjs notation, CodeMirror ABC, operation palette, navigator, playback, A/B source, undo/redo. |
