# Changelog

All notable changes are listed here. Versions follow semantic versioning; published Registry versions are immutable.

## Unreleased

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
