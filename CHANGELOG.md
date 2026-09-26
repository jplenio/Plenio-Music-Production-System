# Changelog

All notable changes are listed here. Versions follow semantic versioning; published Registry versions are immutable.

## 0.2.2 - 2026-09-26

### Added

- **Work mode** - the new first field of Song Brief and Cover Brief:
  - *new song every run* (default of the song templates) / *new cover every run*: every run writes and renders a different song from the same brief without stopping - the brief draws a new *series variation* each run, and the writer is asked for a new title, story, images and hook (with a changing angle for sung songs). Queue several runs (batch count next to Run, App mode *Number of runs*) for a series with one click; every song is exported under its own name. A cover series reuses the source's transcription.
  - *one song, stop to review* / *one cover, stop to review* (default of the cover template): the Song Sheets stop for review; once approved, every run is a new take of the same song.
- Song Sheet *review*: new option **as the brief says** (the new default, used by all templates) - stops in the brief's *stop to review* mode, continues in *every run* and without a brief; *continue* and *stop for review* still override it per sheet. The sheet payload and report hold the rule that applied; `/plenio/sheet/resolve` accepts an optional `brief_mode`.
- **App mode**: the song apps start with the mode and include the Song Sheet buttons (labelled with the sheet's title) - the editor opens from the app, so reviewing and approving work without the graph. **2 · YuE2 · Cover** has an app now (source file, mode, cover style, take seed, both sheets; all takes, the mastered song and the export).
- Song Brief **lengths**: ten options instead of three - *very short (about 1:00)*, *short (about 1:30)*, *about 2:00*, *about 2:30*, *standard (about 3:00)*, *about 3:30*, *about 4:00*, *long (about 4:30)*, *about 5:00*, *very long (about 6:00)*. The writer's section plan and line count, the render headroom and the engines' ceilings follow the seconds; the three earlier names are unchanged, so existing workflows and templates keep their values.

### Changed

- **MP3 tags are ID3v2.3** instead of ffmpeg's default ID3v2.4 (UTF-8): Windows Explorer, Windows Media Player and many players, phones and car radios read no 2.4 tags, so an MP3's embedded cover (and title) did not show there. Embedding a cover into a 2.4 file converts its tag to 2.3; the comment is written as a COMM frame (ffmpeg wrote it as `TXXX:comment`, which players do not show).
- **Cover art is embedded by Plenio itself** into FLAC (picture block) and MP3 (ID3 APIC) - the mastered files and the `(original).flac` - with every tag option (*title only*, *tags*, *copy from loaded file*). The optional GPL package mutagen is no longer used; the System Check lists `faster-whisper` as the optional package instead. Embedding twice replaces the picture, other tags are kept.
- Node summaries (Song Brief, Cover Brief, EQ, Loudness, Score Tools, ...) stay current: ComfyUI re-sends the summary of a cached node on every run (`has_intermediate_output`), and the last summary is kept in the node, so it is back after a reload, a tab switch or App mode. Before, a cached node showed its summary only after the run that executed it.
- Workflows saved with 0.2.0/0.2.1: the frontend inserts the new *mode* of Song Brief and Cover Brief when a workflow is loaded (as *one song/one cover, stop to review* - their earlier behaviour: the same song, new takes); the sheets keep their saved *review*. API-format prompts need the new `mode` input.
- **Draft seed** as its own node in the song and cover templates (group WRITE / LYRICS, and in App mode), linked to *Write Song*: *fixed* (default) keeps the draft, *randomize* writes a new draft every run. Native Generate Text offers no randomize control on its seed.
- A Song Sheet conflict in the mode *new song every run* explains that a series brings a new draft every run (make the document manual, or use the draft).

### Fixed

- Song Brief: a length that is not one of the options - for example `2-3 minutes`, which ComfyUI can carry over from a run of the predecessor toolkit (App mode *Reuse Parameters*, an old job's parameters) - stopped the whole prompt at validation with the same error on every input. A free-form duration now takes the nearest option (`2-3 minutes` -> *about 2:30*), and the node shows a note; text that names no duration is still refused.

## 0.2.1 - 2026-09-25

### Fixed

- Registry icon and banner and the README banner point to the renamed images `assets/branding/icon.png` and `assets/branding/banner.png` (0.2.0 names no longer exist, so the Registry page showed no icon).

## 0.2.0 - 2026-09-25

First public release. Plenio succeeds the [Music Production Toolkit](https://github.com/jplenio/ComfyUI-MiniMax-Music-Production-Toolkit) (formerly *MiniMax Music Production Toolkit*) as a new package with new node IDs; both can be installed side by side.

### Release (0.2.0)

- Version 0.2.0, development status *Production/Stable*; published to the Comfy Registry as `comfyui-plenio-music` (installable from the ComfyUI Manager) by `.github/workflows/publish.yml` when a GitHub release is published.
- The Registry package contains what ComfyUI loads plus the user guide (`.comfyignore`, patterns anchored at the root: an unanchored `assets/` had also dropped `plenio/core/assets`); a CI job packs it with comfy-cli and checks that every runtime file is inside. Templates and blueprints are included by directory, because `git ls-files` quotes their names (`·`) and comfy-cli would have skipped all of them.
- README rewritten for the release: templates, Song Sheet, score editor, covers, mastering, hardware table, installation, the move from the toolkit. Banner, icon and screenshots in `assets/branding/`.
- Demo gallery (GitHub Pages from `docs/`): 35 songs and 8 covers with their SoundCloud links and cover images, made with the predecessor toolkit; the sample song with its prompt report in `assets/sound-samples/`, also used by the S-7 and cover smoke tests.

### Fixed (Phase 10 - final architecture acceptance review, `docs/audit/2026-09-25-phase-10-acceptance.md`)

- CI was red on every commit: the tone-match golden test assumed one CPU's floating-point path (the runners have no AVX-512) and Windows checkouts changed the hash-pinned vendored parser. `.gitattributes` checks text files out with LF everywhere; the test tolerance is CPU-independent; failures are also reported as GitHub annotations (ACC-01).
- The node-type snapshot (`tools/data/node_types.json`) was stale since Phase 9; refreshed (ACC-04).

### Added (Phase 10)

- `resources/schemas/record-1.schema.json`: the release record's pinned schema, checked on a full record and on every record the host tests export (ACC-03).
- Tests: every Score Tools operation through a real server (ACC-05); the snapshot against a fresh server (ACC-04); the engine module interface (`MODULE_INTERFACE`, ACC-06); the catalogue and the record licences stay consistent (ACC-07).
- `docs/dev/extending.md`: where each kind of extension goes and which test catches a forgotten step.

### Fixed (Phase 9 - full codebase audit, `docs/audit/2026-09-25-phase-9-audit.md`)

- A malformed user brief template no longer stops Plenio from loading: unreadable user templates are skipped, logged and listed (`GET /plenio/templates` -> `problems`); saving a template writes only readable files (AUD-01).
- Covers with new lyrics: Transcribe Lyrics no longer forces the ASR to the language of the new lyrics; the Cover Brief decides the language only for original-lyrics covers (AUD-02).
- MP3 export of hi-res audio (88.2-192 kHz) is converted to 44.1/48 kHz for the MP3 instead of failing (AUD-03).
- All files of one export share one name; with collision *number* the whole set is numbered, so an earlier export's record or cover is never overwritten (AUD-04).
- Score analysis and the editor view are now roughly linear in the score length (160 bars: 486 -> 69 ms per view) (AUD-05).
- The System Check reports an invalid Plenio configuration instead of failing (AUD-06).
- Release records no longer redact settings like `max_abc_tokens` or an `author` field (AUD-07).
- Routes answer malformed input with 400 and bound `points` of `/plenio/eq/response` (AUD-08); `m:ss` rounding (AUD-09); cancelling the ASR or a download is a normal ComfyUI interrupt (AUD-10); NaN audio is refused by the encoder and no `.part` file is left behind (AUD-11); written records and covers get the usual file mode (AUD-12); a zero beat period cannot hang the SheetSage2 grid (AUD-13); Check Vocals no longer promises a fade-out in Master (AUD-14); tag copy resolves annotated Load Audio values (AUD-17).
- Removed dead code (`plan_path`, `write_flac`, `flatten_regions`, `describe_fields`).

### Changed (Phase 9)

- The release record is named after the export's base name (`<name>.plenio.json`, also for several takes).
- Cover template: the Transcribe Lyrics widget is labelled *source language (original lyrics: Cover Brief)*.

### Added (Phase 8 - Main workflows, subgraphs and UX)

- Model catalogue `resources/models.toml` (`plenio.core.models`): every model file the templates load, with folder, download URL, size, licence and the templates that need it; the templates' download entries are generated from it.
- Blueprint **Plenio · Cover Art** (FLUX.2 Klein 4B distilled, native nodes, 4 steps): paints a cover from the Song Sheet's artwork prompt; optional (bypassed) in the song templates, with a cover preview; Export embeds it.
- Song templates finish with **Plenio · Master** before Export, which also keeps the unmastered take as `(original).flac`.
- App Mode configurations for *0 · System Check*, *1 · YuE2 · Song*, *3 · MiniMax · Song* and *4 · Enhance & Master* (switch *Graph / App*).
- Template thumbnails (`tools/build_thumbnails.py`); the System Check template is generated like the others.
- **System Check**: which model files each template needs and which are missing or incomplete (with sizes), a model file table, Plenio assets, and the hardware rule table with the row for the machine marked.
- Checks: template rules in the workflow validator (About note, groups, *(optional)* titles, App configuration, thumbnail), catalogue/template consistency tests, `tools/browser_check.mjs` (load, save/reload, optional blocks on/off with server validation, Master bypass, App Mode) and smoke tests S-1, S-2, S-6 and Cover Art for real models.
- Docs: *Models and downloads*, *Troubleshooting*, *App mode*, rewritten *Getting started* and README, updated path guides and licensing; usability review (`docs/design/usability-review.md`); test report `docs/test-reports/2026-09-25-phase-8.md`.

### Changed (Phase 8)

- All templates regenerated: consistent groups (`1 · ...` to `FINISH`), one About note visible on open, the model block collapsed below the main row, *take seed* label; blueprint bodies use their own node-id ranges.
- The System Check warns only about packages ComfyUI itself installs (av, Pillow, scipy); a missing optional package is listed as information.
- CI: the unit job installs numpy, scipy, av and Pillow (as ComfyUI does) and runs mypy with `--python-version 3.12` (the known numpy-stub issue). Without them the job could not have passed since the cover and audio unit tests arrived; CI results are not visible from the cloud session.

### Fixed (Phase 8)

- The frontend no longer renumbers blueprint nodes when a template loads.
- The EQ curve and the node summaries no longer write a value into saved workflows.
- Cover template: the lyrics language widget of Transcribe Lyrics, which the Cover Brief overrides, is labelled so.

### Added (Phase 7 - Audio production chain)

- `core.audio`: BS.1770-4 loudness (K-weighting exact at 48 kHz, gating), EBU Tech 3342 loudness range, 4x-oversampled true peak; band-edge Kaiser resampler; RBJ biquad EQ with response, spectral profile and tone-match fit; compressor, oversampled lookahead limiter and loudness targeting with budgets (ported from the legacy toolkit v3.1.3, checked against its outputs).
- Nodes **EQ** (flat / manual bands / match preset / custom match, reference input; curve widget under the node: drag, wheel = Q, double-click adds a band) and **Loudness & Dynamics** (5 targets or custom, 12 compression styles or custom, output rate 44.1/48 kHz or keep); presets in `resources/presets/`; routes `GET /plenio/presets/{kind}` and `POST /plenio/eq/response`.
- **Export Release**: MP3 VBR V0 and WAV 32-bit float next to FLAC 24-bit; tags (typed, or copied from the loaded file), cover art (JPEG next to the audio; embedded into FLAC/MP3 when the optional `mutagen` is installed), the original take as `(original).flac`, measured loudness and tags in the release record.
- Blueprint *Plenio · Master*; template **4 · Enhance & Master**.
- Tests: DSP regression suite (`tests/unit/test_audio.py`: BS.1770 table, EBU cases, pyloudnorm oracle, true peak, resampler pass/stop band, analytic EQ responses, compressor curve, limiter ceiling, golden legacy outputs, targeting budgets), format round trips (`tests/unit/test_release_formats.py`), host tests of the chain incl. bypass identity (`tests/host/test_production_path.py`), smoke S-7 (`tests/host/test_master_smoke.py`), Vitest for the curve helpers. Restoration-gate study script `tools/studies/restoration_gate.py`.
- Docs: user guide *4 · Enhance & Master*, concept page *Mastering and audio formats* (methods and limits), help pages of EQ, Loudness & Dynamics and Export Release; test report `docs/test-reports/2026-09-25-phase-7.md`.

### Changed (Phase 7)

- Export Release has new widgets (*flac*, *mp3*, *wav*, *tags*) and optional *title*, *original* and *cover* inputs; templates 1-3 were regenerated. Workflows saved from the earlier templates keep their Export widget values by position - re-add the Export node or start from the new template.
- 24-bit export scales by 2^23 (decoder convention) instead of 2^23-1, so a 24-bit source is written back sample-exact.

### Fixed (Phase 7)

- Sample-rate conversion no longer aliases content just above the new Nyquist frequency (the legacy converter let a 23 kHz tone through as a -6 dB alias at 21.1 kHz when converting 48 to 44.1 kHz).

### Added (Phase 6 - MiniMax Music 3)

- `core.engines.minimax`: structured caption rules (Global Metadata, Vocal Details, Arrangement), exact 5 000-token prompt budget through the loaded text encoder (estimate without it), render ceiling at most 360 s, instrumental conventions (tags-only section map about twice as long as a sung song's, Vocal Details `n/a`).
- Engine Profile detects MiniMax Music 3 (CLIPLoader type `minimax`).
- Blueprints *Plenio · MiniMax Model* and *Plenio · MiniMax Render* (native nodes, 30 steps, optional tiled decode); template **3 · MiniMax · Song**.
- Writing: multi-line captions are kept by Parse; the editor labels the style document *Caption* for engines that call it so.
- Tests: MiniMax unit and host tests; contract test for the real tokenizer and smoke test S-5 (owner's machine). Docs: user guide *3 · MiniMax · Song*; test report `docs/test-reports/2026-09-25-phase-6.md`.

### Fixed (Phase 6)

- The Song Sheet's budget summary no longer assumes YuE2 fields.

### Added (Phase 5 - Score / ABC editor; done 2026-09-25)

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
