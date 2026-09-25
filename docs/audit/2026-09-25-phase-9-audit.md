# Phase 9 - Full codebase audit

| | |
|---|---|
| Date | 2026-09-25 |
| Scope | the whole repository at commit `2fa4776` (end of Phase 8): architecture, code, frontend, HTTP routes, nodes, subgraphs and templates, engines, instrumental rules, score editor, resources, dependencies and licences, tests, docs, installation, error handling |
| Size | Python product code 12.9 k lines (`plenio/`, without the vendored parser), frontend 4.1 k lines, tests 8.7 k lines, tools 5.3 k lines |
| Host | Claude Code cloud session (Linux, CPU): ComfyUI 0.37.0 with frontend 1.52.7, Chromium; no GPU, no models |
| Result | **18 findings: 1 high, 5 medium, 10 low, 2 info. Every high, medium and low finding is fixed with a regression test (the fade-out feature behind AUD-14 is deferred); of the info items the dead code is removed and three observations are deferred with reasons (§4).** |

## 1. Method

The audit was adversarial: every product module was read in full, and suspected defects were **reproduced** before they were counted.

| Technique | What it covered |
|---|---|
| Full read | `plenio/` (all nodes, the host adapter, routes, every `core` module, the ASR worker), `frontend/src`, the generators in `tools/` |
| Reproduction on a real server | start-up with broken user files, route inputs, the export matrix, annotated Load Audio values |
| Fuzzing (Hypothesis) | 1 500 generated texts through 11 parsers and validators (lyrics, score analysis and editor view, Song Sheet state, draft parser for YuE2/MiniMax sung/instrumental, style checks, document validation): **no crash** |
| Operation fuzzing | 10 257 random editor operations (all 16 operations, random ids and parameters) chained on the five real score fixtures: **no crash, no invalid score** - before and after the fixes |
| Audio edge cases | mono, 0.1 s, one sample, empty, silence, NaN, inf, +20 dB, 8/22.05/96 kHz through measure, EQ match, master and the three formats |
| Profiling | editor view and analysis for 8 to 320 bars |
| Consistency | bundled frontend libraries vs. `THIRD_PARTY.md` (18 packages, versions and licences), layer boundary (`plenio.core` imports no ComfyUI), dead code |
| Existing gates | all suites, `tools/workflow_validation.py`, `tools/browser_check.mjs`, smoke S-7 |

Severity: **high** - Plenio (or a whole feature) stops working for a plausible user action; **medium** - wrong result or crash in a supported use; **low** - wrong message, robustness or hygiene; **info** - observation, no defect in use. Confidence: **confirmed** = reproduced (before the fix) or proven by the code path and a failing regression test; **by reading** = the code path is unambiguous but was not triggered.

## 2. Findings

| ID | Severity | Confidence | Area | Finding | Status |
|---|---|---|---|---|---|
| AUD-01 | high | confirmed | brief templates | One malformed file in `user/plenio/templates/` made the **whole Plenio import fail** (0 nodes, "IMPORT FAILED"), and `POST /plenio/templates` could write such a file itself (a field value with a line break) | fixed |
| AUD-02 | medium | confirmed | covers, ASR | *Transcribe Lyrics* told the ASR the Cover Brief's language for **new-lyrics** covers - the language of the new text, not of the source's singing (German source + English lyrics -> English decoding of German singing, a wrong phrasing reference) | fixed |
| AUD-03 | medium | confirmed | export | MP3 at a sample rate LAME cannot encode (88.2/96/192 kHz) crashed with a raw PyAV error; *4 · Enhance & Master* (MP3 on, rate *keep*) hit it for every hi-res source | fixed |
| AUD-04 | medium | confirmed | export | With collision *number* each file of one export was numbered on its own: the files of one release could get different names, and an existing `.plenio.json` (or cover) of an earlier export was **overwritten** when the format set changed | fixed |
| AUD-05 | medium | confirmed | score editor | Score analysis and the editor view were quadratic in the score length (per-bar note counts by scanning every note, tie chains by `list.index`): 160 bars took 0.5 s per view, and every edit re-analyses - a sluggish editor on long YuE2 plans (AS-12) | fixed |
| AUD-06 | medium | confirmed | System Check | An invalid Plenio `config.toml` made the System Check itself fail - the tool meant to show that problem | fixed |
| AUD-07 | low | confirmed | release record | The secret redaction matched key substrings: `max_abc_tokens` (a YuE2 setting) and an `author` field were written as `<redacted>` | fixed |
| AUD-08 | low | confirmed | routes | Malformed requests ended as 500 instead of 400 (`/plenio/eq/response` sample rate or points, `/plenio/sheet/resolve` numbers, review mode, owned list, unknown engines, `Infinity`/`NaN` in score operations); `points` was unbounded (CPU/memory) | fixed |
| AUD-09 | low | confirmed | messages | `m:ss` showed `1:60` for 119.6 s (three copies of the helper) | fixed |
| AUD-10 | low | by reading | ASR, downloads | Cancelling during the ASR worker or an asset download showed a Plenio error instead of ComfyUI's normal interrupt | fixed |
| AUD-11 | low | confirmed | export | `write_audio` encoded NaN/inf samples into garbage (Export itself refused them earlier, through its loudness measurement); a failed encode left a `.part` file | fixed |
| AUD-12 | low | confirmed | files | Records, covers, notes and caches were written with mode 0600 (the `mkstemp` default) - a known issue since Phase 7 | fixed |
| AUD-13 | low | by reading | SheetSage2 grid | A zero beat period (repeated beat times) would extend the beat list forever | fixed |
| AUD-14 | low | confirmed | messages, design | *Check Vocals* told the user to "fade it out when mastering", but Master has no fade-out; two design documents still promised one | fixed (message); fade-out deferred |
| AUD-15 | low | confirmed | Phase 8 label | The Phase 8 usability fix labelled the Cover template's ASR language *Cover Brief decides* - true only for original lyrics (see AUD-02) | fixed |
| AUD-16 | info | confirmed | code hygiene | Dead code: `plan_path`, `write_flac`, `flatten_regions`, `describe_fields` | removed |
| AUD-17 | low | confirmed | tag copy | *copy from loaded file* did not resolve annotated Load Audio values (`x.flac [input]`) | fixed |
| AUD-18 | info | by reading | packaging, config, frontend | (a) the Registry package would ship tests, fixtures, docs data and frontend sources (no include list); (b) `[asset_paths]` entries with an unknown asset id are ignored silently; (c) the frontend's API client expects JSON error bodies | deferred (§4) |

## 3. Details and fixes

**AUD-01 - one bad user template stopped Plenio.** The brief nodes list the templates when ComfyUI registers them; `TemplateLibrary._load` raised on the first unreadable file, `define_schema` failed and ComfyUI dropped the whole extension. Reproduced with a user file containing a line without a colon: `Error while calling comfy_entrypoint ... malformed front matter line`, `(IMPORT FAILED)`, 0 Plenio nodes. Fix: unreadable *user* templates are skipped, logged and listed (`TemplateLibrary.problems`, and `problems` in `GET /plenio/templates`); shipped templates still fail loudly (a packaging bug). `save_user_template` writes single-line front-matter values and re-parses the file before writing it. Tests: `tests/unit/test_documents.py` (skip, save with line breaks), `tests/host/test_audit_regressions.py` (a server with a broken user template registers all 14 nodes and lists the problem).

**AUD-02 - wrong ASR language for new-lyrics covers.** `build_cover_brief` stores the language of the *new* lyrics for *new lyrics*, and Transcribe Lyrics used it for the source. Fix: `asr_language()` - the brief decides only for original-lyrics covers; otherwise the node's widget (default *auto*) names the source's language. The template label now reads *source language (original lyrics: Cover Brief)*. Test: `tests/contract/test_audit_regressions.py`.

**AUD-03 - MP3 above 48 kHz.** `write_audio` converts MP3 to the nearest rate LAME supports (88.2/176.4 kHz -> 44.1 kHz, 96/192 kHz -> 48 kHz, unusual rates up to the next MP3 rate) with Plenio's resampler; FLAC and WAV keep the rate; the facts carry `converted_from_rate` and Export shows a note. Tests: `tests/unit/test_release_formats.py`, `tests/host/test_production_path.py` (96 kHz source through the chain).

**AUD-04 - one name per release.** `plan_release()` chooses one base name for every file of an export (all takes and formats, the original, the cover and the record) so that none of them exists; the record is `<base>.plenio.json` (before: next to the first audio file). Tests: unit (a free `Song.flac` next to an old `Song.plenio.json` gives `Song (2)`), host (MP3 export then FLAC export of the same title keep both records).

**AUD-05 - quadratic editor.** Per-bar note and chord counts use bisection on sorted onsets; `ScoreModel` caches each voice's element list and positions, so tie chains are found in constant time. 160 bars: editor view 486 ms -> 69 ms; 320 bars 176 ms. The operation fuzzer and the 243 score tests give identical results. Test: `tests/unit/test_audit_regressions.py` (4x the bars must take less than 9x the time; quadratic is about 16x).

**AUD-06 - broken configuration.** `host.system_facts()` catches the configuration error, uses the defaults for the rest of the check, and the report shows *Plenio configuration error (defaults are used until it is fixed)* as a warning. Tests: unit and host (a server with `offline = maybe`).

**AUD-07 - redaction.** Only string values are redacted, and only when a secret word (`api_key`, `token`, `secret`, `password`, `authorization`, `auth`, `credential(s)`, `cookie`) is a whole word of the key; token-like values (`hf_...`, `sk-...`) are still redacted everywhere. Test: unit.

**AUD-08 - route input.** Numbers are checked for type and range (`sample_rate` 8-384 kHz, `points` 16-2048 whole, `max_seconds`/`target_seconds` 1-3600), the review mode and the owned list are validated, unknown engines are a user error, and score operations refuse non-finite numbers. Test: 10 cases in `tests/host/test_audit_regressions.py`.

**AUD-09 to AUD-17** are small; each has a test in `tests/unit/test_audit_regressions.py` or the host file (clock rounding, file mode 0644 under umask 022, zero beat period, the ending note, NaN refusal and no `.part` left behind, annotated Load Audio value). AUD-10 (cancel -> ComfyUI interrupt) is covered by reading only: triggering it needs a running ASR worker.

## 4. Deferred, with reasons

| Item | Why deferred |
|---|---|
| Fade-out in Master (AUD-14) | a new DSP feature, not a defect fix; the design documents now say it is not built |
| Registry package contents (AUD-18a) | a release decision (`docs/dev/release.md`): the include list is set when the public repository is created |
| Unknown `[asset_paths]` ids (AUD-18b) | the core configuration does not know the asset catalogue; harmless (an unknown id is never used). Candidate for a System Check note |
| Non-JSON error bodies in the frontend client (AUD-18c) | only reachable when ComfyUI itself fails (the Plenio routes always answer JSON) |

## 5. Areas without significant findings

- **Architecture:** `plenio.core` imports no ComfyUI (import-boundary test); one adapter module (`plenio/comfy/host.py`) touches ComfyUI internals; one module per node; engine-specific rules only in `core/engines/*` and the engine blueprints.
- **Error handling:** one taxonomy with message + hint; routes map user errors to 400 and log bugs as 500 (now also for malformed input, AUD-08); nodes raise actionable errors.
- **Song Sheet:** resolution (auto / edited / manual, conflicts), approval fingerprints and lazy inputs are consistent; the state parser refuses malformed input instead of silently resetting it; fuzzing found no crash.
- **Score editor backend:** 10 257 fuzzed operations kept every score valid.
- **Worker protocol and downloads:** files instead of pipes, total and idle timeouts, kill on cancel, job folder removed; downloads resume, check size and pinned SHA-256, write atomically.
- **Frontend:** Markdown summaries escape everything before formatting (no HTML injection from LLM text or titles); the DynamicCombo restore repair filters display-only widgets; no network access beyond the ComfyUI API.
- **Audio chain:** refuses NaN/inf, handles mono, silence, very short and unusual-rate audio (§1).
- **Licences:** the 18 bundled frontend packages match `THIRD_PARTY.md` in version and licence (all MIT); mutagen stays optional and unbundled.

## 6. Verification after the fixes

| Suite | Result |
|---|---|
| Python with ComfyUI 0.37.0 (unit, contract, workflow, host) | **738 passed, 13 skipped** (models 3, legacy toolkit 1, smoke 7, jsonschema/soundfile 2) - 33 new regression tests |
| Smoke S-7 (real MiniMax take, CPU) | passed |
| Browser checks (`tools/browser_check.mjs`, frontend 1.52.7) | 56/56 |
| Workflows | 10 blueprints + 5 templates valid (the Cover template's ASR label changed) |
| Frontend `npm run check` | 58 tests, build unchanged |
| ruff, mypy strict | clean |
| Fuzzers (parsers, score operations) | no crash, no invalid score |

### Owner-machine checks after the audit (reported 2026-09-25, recorded in the Phase 10 review)

| Check | Owner's result |
|---|---|
| Cover with *new lyrics*: the source is transcribed in its own language (AUD-02) | language correct; the transcription itself is not always exact |
| MP3 export of a 96 kHz file (AUD-03) | works |
| Editor on a long YuE2 plan (AUD-05) | reacts quickly |
| Templates in frontend 1.53.6 | "passt" (method not stated) |
| Full suite and smoke pass | **not valid**: the run was made in a checkout at Phase 5 (560 tests collected, the Phase 6-9 tests absent) and without `PLENIO_COMFYUI_ROOT`, so every host and smoke test was skipped - open |

## 7. Residual risks (not testable here)

- GPU and real-model paths (S-1 to S-6, Cover Art) run only on the owner's machine; their prompts pass the server's validation.
- The owner's frontend 1.53.6 (DynamicCombo restore defect; App Mode) is checked only in 1.52.7 here.
- ComfyUI has no authentication: anyone who can reach the server can call Plenio's routes (as any node or route). Plenio's routes write only under ComfyUI's user and output folders and read only what the routes name; running ComfyUI on a public interface remains the user's risk.
