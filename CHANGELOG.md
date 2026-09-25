# Changelog

All notable changes are listed here. Versions follow semantic versioning; published Registry versions are immutable.

## Unreleased

### Added (Phase 5 - Score / ABC editor)

- Score core: element view with ids and text positions (`core.score.model`), tolerant positions and diagnostics with line and bar range (`core.score.positions`), editing operations with invariant checks (`core.score.edit`: pitch, length, rest/note, chords, section rename/move/split/join), operation registry (`core.score.operations`); `/plenio/score/analyze` returns the element view and `display_abc`, `/plenio/score/transform` the new operations.
- Song Sheet: optional `reference_audio` input for A/B listening (display only); the Cover template connects the source.
- Song Sheet editor: tabs; score tab with abcjs notation, CodeMirror ABC text (lint markers), navigator, operation palette with shortcuts, undo/redo, playback with cursor (offline WebAudio tones), voice switches, speed, section loop, A/B with the source; lyrics fit per section; Revert and a close confirmation.
- Bundled libraries: abcjs 6.7.1, CodeMirror 6 (MIT; `THIRD_PARTY.md`). Dev tooling: happy-dom 20.14.5 (security update).
- Tests: `tests/unit/test_score_editor.py` (162), `frontend/tests/scoreEditor.test.ts` (31), host tests for the score routes, an editor-edited score in the Song path, section edits and `reference_audio` in the Cover path.
- Docs: user guide *Score editor*, Song Sheet concept and help page, test report `docs/test-reports/2026-09-25-phase-5.md`.

### Fixed (Phase 5)

- Score editor: a burst of typing is one undo step again, and a palette operation no longer triggers a second analysis (the session's document watcher runs synchronously).
- Playback from a bar starts with that bar's first note, and the cursor marks one note at a note boundary (1 ms time tolerance for the backend's rounded times).
- `display_abc` writes a letter's accidental again after an inline key change in the same bar.
- Clearer refusal when a chord symbol would start inside a Vocal note or rest.

### Added (Phase 4B - YuE2 Cover)

- **2 · YuE2 · Cover** template: Source -> (Excerpt) -> Transcribe Score -> Score Tools -> Song Sheet · Score -> Transcribe Lyrics / Write Song / section tags -> Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Export; both sheets stop for review; instrumental adapter on for instrumental covers (lazy switch).
- Nodes: **Cover Brief** (instrumental / original lyrics / new lyrics, harmony new or kept), **Transcribe Score** (SheetSage2 ABC identical to the native node plus the beat grid, `PLENIO_TIMELINE`; stops sources a 16 GB card cannot transcribe), **Transcribe Lyrics** (faster-whisper large-v3 in a worker, only over the sung regions, fixed seed, disk cache, beat-grid placement with the pickup rule, invention filters, sung-lyrics check), **Check Vocals** (SheetSage2 vocal notes, calibrated on the owner's listening; best take, ranked takes, ending check).
- Blueprints: *Plenio · Transcribe Score*, *Plenio · YuE2 Takes* (native loop, N takes, starts with the final lyrics).
- Score Tools: *fit length*; *prepare from brief* handles covers, instrumental plan length and truncated plans.
- Song Sheet: `section_tags` output, `timeline` input; cover checks for sections, syllables per note and voice range; editor shows the word diff against the draft, the ASR's unsure and left-out words and the source's section times.
- Writing: cover prompts (original lyrics: no lyrics written; new lyrics: per-line syllable targets from the source's sectioned lyrics; the melody's register and tempo).
- Route `GET /plenio/asr/notes/{draft_sha256}`; asset `faster-whisper-large-v3` with `[asset_paths]` to use an existing folder.
- Docs: user guide *2 · YuE2 · Cover*, concept pages *Song Sheet* and *Instrumental*, help pages of the new nodes; test report `docs/test-reports/2026-09-25-phase-4b.md`; Qwen3-ASR evaluation (`tools/studies/asr_qwen3.py`).

### Changed (Phase 4B)

- Instrumental songs are conditioned with the single tag `[instrumental]` (owner's listening verdict).
- Release records keep only class, inputs and title of each prompt node (loop nodes put NaN fingerprints into the prompt) and list the licences of SheetSage2 and the instrumental adapter when the workflow references them.
- Voice types (soprano ... baritone) count as vocal character in styles; instruments named after them do not.
- The length warning of instrumental plans points to *fit length* instead of the lyrics.

### Fixed (Phase 4B)

- Workflows with a Plenio DynamicCombo node (e.g. Score Tools *fit length*) reload with their values (works around a frontend 1.53.6 restore defect).

### Design gate (Phase 4A - YuE2 Cover and Instrumental)

- Final specifications in `docs/design/yue2-cover-design.md` and `docs/design/instrumental-strategy.md`: data flow, lyrics and score precedence, user modes, backend contracts (new node *Transcribe Score*, type `PLENIO_TIMELINE`), frontend implications, validation strategy, test matrix, failure modes and open assumptions; study data in `docs/test-reports/2026-09-25-phase-4a.md`.
- Study scripts in `tools/studies/` (SheetSage2 timeline, faster-whisper WER, lyrics alignment, cover budget, YuE2/Gemma render matrix, take evaluation). No product code changed.
- CI checks out ComfyUI from its new home `Comfy-Org/ComfyUI`.

### Added (Phase 3 - YuE2 Core)

- **1 · YuE2 · Song** template: Song Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Score Tools -> Song Sheet · Score -> YuE2 Render -> Export Release.
- Nodes: **Song Brief** (239 templates imported from the legacy library, cleaned and translated to English), **Engine Profile**, **Compose Writing Prompt**, **Parse Song Draft**, **Song Sheet** (auto/edited/manual documents, conflicts, validation, review gate), **Score Tools** (prepare from brief, strip chords, voices, transpose, tempo), **Export Release** (FLAC 24-bit, naming, release record).
- Blueprints: *Plenio · YuE2 Model* (with an optional instrumental adapter, bypassed), *Plenio · Write Song* (native Generate Text), *Plenio · YuE2 Plan*, *Plenio · YuE2 Render*.
- `plenio.core`: native two-voice ABC analysis and operations with invariant checks, sectioned lyrics, song briefs and templates, YuE2 rules with the exact context budget, writing prompts and robust draft parsing, Song Sheet evaluation, release naming/FLAC/records with secret redaction.
- Routes: `/plenio/score/analyze`, `/plenio/score/transform`, `/plenio/lyrics/analyze`, `/plenio/sheet/resolve`, `/plenio/templates`.
- Song Sheet editor (minimal): documents with states, live validation, Apply, Make manual, Use draft, conflict resolution, Approve.

### Added (Phase 2 - Foundation)

- Package skeleton with a V3 ComfyUI entry point, `plenio.core` (pure) and `plenio.comfy` (adapters).
- Core foundations: error taxonomy, canonical hashing, reports (`plenio.report/1`), configuration (`config.toml` and `PLENIO_*` variables), Song Sheet state (`plenio.sheet_state/1`) with resolution rules and approval fingerprints, asset catalogue with offline policy and resumable downloads, out-of-process worker protocol.
- **System Check** node, `GET /plenio/system` route and the *0 · System Check* template.
- Frontend extension (TypeScript, Vite) with the `PLENIO_SHEET_STATE` widget and rendered node summaries.
- Test suites: unit, contract, import boundary, workflow/blueprint validation, host integration against a real ComfyUI server, frontend (Vitest).
