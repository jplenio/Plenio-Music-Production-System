# Plenio 2.0 - implementation plan

For a coding agent. Design: [v2-product-design.md](v2-product-design.md) (cited as **PD §n**) and [v2-marketing-and-publishing.md](v2-marketing-and-publishing.md) (**MP §n**). Written 2026-11-11 against 1.6.0 (`c307d35`).

Tick a box when its acceptance line holds, in the commit that makes it hold. Do not tick a box for work that is written but not verified.

---

## Model and effort strategy

The goal is to maintain implementation quality while using model capacity
and tokens economically. Apply this strategy throughout the plan.

### Primary implementation model: Claude Opus 5.5

Use **Claude Opus 5.5 at medium effort** for the normal implementation work:

- Implement plan tasks in coherent, testable blocks.
- Inspect the existing code and the relevant design sections before editing.
- Write and run the tests required by the task and the project rules.
- Fix ordinary test failures and regressions.
- Update the plan, handover and documentation to reflect verified results.
- Commit locally as required by the project rules.

Use **high effort** for a particularly difficult implementation, a subtle
regression, a complex integration, or a problem that remains unresolved
after a reasonable investigation at medium effort. Return to medium for
subsequent ordinary work.

Do not use xhigh or max by default. If high effort is insufficient, follow
the escalation procedure below.

### Specialist model: Claude Fable 5.2

Use **Claude Fable 5.2 at high effort** selectively for:

- Independent reviews of high-impact changes and integration boundaries.
- Architecture decisions with consequences across multiple components.
- Difficult bugs or design conflicts that Opus has not resolved after a
  reasonable, evidence-based investigation.
- Reviews of security, access control, data integrity and compatibility
  where a mistake could have significant consequences.

Fable reviews should be focused. Give the reviewer the relevant plan and
design sections, the applicable project rules, the changed files or commit
range, and the specific risks to investigate. The reviewer may inspect
related code and callers where necessary.

By default, a review is read-only. Report concrete findings with their
location, impact and a reproducible scenario. Distinguish confirmed defects
from risks or hypotheses. If no significant issue is found, say so.

Use Fable at medium effort only for tasks where previous project experience
shows that it preserves the required quality. Do not use xhigh or max by
default.

### Review checkpoints

Do not review every small commit with Fable. Group related changes into
meaningful checkpoints. Use a targeted Fable review at least for:

1. **After 2.7:** Setup routes, local access restrictions, input validation,
   download lifecycle, errors and WebSocket events.
2. **After 3.5:** Model Choice integration, generated templates and migration
   of existing 1.x workflows, including preservation of users' model choices.
3. **Before and after the critical parts of phase 5:** API v1 compatibility,
   persistent jobs, API v2, token handling, route access and remote access.
   A short pre-implementation review is sufficient; review the resulting
   implementation after the related tasks are complete.
4. **After the access-related parts of phase 6:** invitations, authentication,
   roles, expiry and rate limiting.
5. **Before release:** one focused review of the integrated changes,
   outstanding findings, compatibility evidence and release gates.

If a checkpoint is reached with incomplete prerequisites, state what has
and has not been verified. Do not mark it as passed without evidence.

Opus normally fixes confirmed findings. Escalate a fix to Fable when the
problem remains difficult or when Opus cannot resolve it reliably.

### Switching models and effort

Prefer Opus as the main implementation session. When a Fable review is due:

1. If this Claude Code environment supports starting a subagent with
   Claude Fable 5.2, and the requested model and appropriate effort can be
   selected and verified, use a focused Fable subagent for the review.
   Continue only after reading its findings. Report the model and effort
   actually used when they are available.

2. If the required model or effort cannot be selected or verified for the
   subagent, stop at a safe checkpoint and ask the owner in German to switch
   the main session to **Claude Fable 5.2, high effort**. State the exact
   review task and what the owner should do next.

3. Once the Fable work is complete, record the findings and any necessary
   handover. If further implementation is due and the main session is still
   running Fable, stop and ask the owner to switch back to **Claude Opus 5.5,
   medium effort**.

4. If only the effort needs to change and the environment cannot change it
   reliably, stop and ask the owner to make that change.

Do not claim that a model or effort change has happened unless it has
actually been applied. Do not silently substitute another model. If Fable
is unavailable, explain this and wait for the owner's decision before
treating a mandatory Fable checkpoint as complete.

Use subagents only when they have a clear purpose. Avoid launching multiple
overlapping reviews or repeatedly asking Fable to reread the entire project.

### Handover and completion

Before a requested model switch, leave the working tree and the handover in
a clear state. Record:

- The completed task or commit and the next task.
- The relevant files and any uncommitted changes.
- Checks run, their results, and checks not run.
- Open findings, unresolved decisions and the precise review or problem.

Follow the existing commit, privacy, download, GPU and compatibility rules.
Do not commit a task as complete or tick its plan box unless its acceptance
criteria have actually been verified.

Continue through the assigned task or coherent work block until it is
complete, unless a project stop condition, missing permission, required
owner decision or model/effort switch requires a pause. Keep reports concise,
but do not omit failures, uncertainty or unverified behavior.


---

## How to work

### Rules that bind every task

1. **Languages.** Answers to the owner in German. Code, comments, UI strings, docs and commit messages in English (ADR-0008).
2. **Commits.** Commit locally, one task or a coherent part of one per commit. **Never push, never tag.** Never commit `.codewhale/`, `.claude/` or `dist/`.
3. **Private material.** The owner's release records and songs are read-only study input. Report aggregates; never copy lyrics, titles or sung lines into code, tests, docs, commit messages or the CHANGELOG. Invent examples of the same kind.
4. **Downloads and installs** need the owner's explicit permission, each time. This includes Python packages, npm packages, model files and browsers.
5. **Graphics cards.** GPU jobs run on GPU 1 only (`CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=1`). One GPU job at a time. Browsers that draw WebGL use Playwright's own Chromium with GPU flags, never a browser channel.
6. **Public texts** (CHANGELOG, README, docs, release notes) say what changed and why it is better. They never say who asked.
7. **Claims.** A number in a doc or a message is measured, or it is labelled an estimate. "Not rendered", "not heard", "not measured" are said plainly.
8. **Architecture rules stay** (`docs/dev/coding-standards.md`): `plenio.core` imports no ComfyUI, torch or aiohttp; `host.py` is the only module that touches ComfyUI internals; relative imports inside `plenio`; errors carry a message and a hint; every input and output has a tooltip.
9. **Frontend sources are LF** in the working tree before any build; the committed builds must match the sources.
10. **Compatibility.** A workflow saved with 1.x opens and runs. `/plenio/api/v1` answers as in 1.6.0 for a caller on this computer. The player reads its existing state. Breaking any of the three needs the owner's decision first.

### Checks before every commit that touches the named area

The commands are in `docs/dev/testing.md`; local paths are in the session's memory notes, not in this file.

| Area | Checks |
|---|---|
| any Python | `ruff check .` and `ruff format --check .` with the pinned ruff 0.13 binary; `mypy --python-version 3.12`; `pytest tests/unit tests/workflows tests/contract/test_data_schemas.py` |
| nodes, routes, templates, blueprints | also `pytest tests/contract tests/host` against the tagged ComfyUI exports; `tools/workflow_validation.py`; `tools/build_graphs.py` leaves no diff |
| frontend | `npm run typecheck`, `npm test`, `npm run build`, `npm run build:player`; `git status web/js plenio/player/static plenio/player/guest_static` shows only intended changes |
| templates, widgets | `tools/browser_check.mjs` against a dev server |
| packaging | `comfy node validate`, `comfy node pack` (after committing), `tools/package_gate.py node.zip`, then delete `node.zip` |

### When to stop and ask the owner

- A task needs a decision listed in PD §12 or MP §10 that the owner has not made, and the recommendation does not obviously apply.
- A measurement contradicts the design (for example: the native writer is unusable on 16 GB). Record the numbers in `docs/test-reports/`, propose the change to the design, wait.
- A task would break rule 10.
- Anything outward-facing: a push, a tag, a post, an issue, an upload.

Otherwise proceed with the recommendation and say so in the report.

### Order and releases

```text
Phase 0  baseline, measurements, faster tests            no release
Phase 1  package boundary, route classes                 no release
Phase 2  catalogue v2, model plan, downloads, gated
Phase 3  Model Choice, templates, writer plan
Phase 4  Plenio Setup and Home                           no release
Phase 5  Song API v2, tokens, Player API, MCP
Phase 6  player: People & access, navigation, guests' languages
Phase 7  visuals: devices, analysis, Director, chooser, one light
Phase 8  performance, by measurement                     no release
Phase 9  tests: tiers, mutation
Phase D  docs: facts, links, site, rewrites
Phase M  media pipeline and kit (repository Plenio-Media)
Phase R  release automation, 2.0.0                       → 2.0.0 (the only release; the owner tests it first)
```

**No pre-release versions** (owner's decision 2026-11-11): the canary 1.7.0 and the two betas of the first draft of this plan are dropped. Everything is committed locally on `main` and ships as 2.0.0, which the owner tests from the repository before publishing. `pyproject.toml` keeps 1.6.0 until `release.py prepare 2.0.0`; the CHANGELOG collects the changes under *2.0.0 - unreleased*.

Phases 5, 6 and 7 are independent of each other after phase 4 and may be done in any order.

---

## Phase 0 - baseline and measurements

Goal: numbers the later phases are judged by, and a test suite fast enough to run on every step. No behaviour of the product changes.

- [x] **0.1 Stage timings in the record.** `host.Progress` gains a stage name; `host.py` measures load time around ComfyUI's model loading and the node's own time; Export Release writes `timings` (`plenio.timings/1`, PD §6.1) into the record; `resources/schemas/record-1.schema.json` allows the optional key.
  *Accept:* a host test runs a fake-model song and finds one entry per stage with `seconds > 0`; an old record without `timings` still validates and plays.
- [ ] **0.2 `tools/bench.py`.** Runs the four fixed briefs of PD §6.1 through the Song API, three times each, against a running ComfyUI; writes JSON and a Markdown table to `docs/test-reports/`. `--fake` runs with the test nodes for CI.
  *Done so far (2026-11-11):* the tool, its report and `--compare`; `--fake` runs it against canned answers in the API's shapes (a unit test, not the host job: the API's templates load real model files, so test nodes cannot stand in). The run with real models is owed.
  *Run 2026-11-11 (GPU 1):* three of the four briefs, three runs each, report `docs/test-reports/2026-11-11-bench-1.6.0.md`. Still owed: the cover brief (it needs a recording that may be used for it - the owner's choice). Found: finishing is the largest stage of a sung song; the first run is about 30 s slower while the stages' *load* is under a second (to be explained before phase 8); the run-to-run spread (114-182 s for one brief) is wider than the release check's 10 %.
  *Accept:* `bench.py --fake` passes in the host job; the owner (or the agent on GPU 1, with permission) has run it with real models on 1.6.0 and the report `docs/test-reports/2026-…-bench-1.6.0.md` is committed.
- [ ] **0.3 Peak memory per variant.** A study script (`tools/studies/variant_memory.py`) loads each YuE2, MiniMax and FLUX.2 variant present on the machine through ComfyUI's loaders on GPU 1 and records `torch.cuda.max_memory_allocated` per stage for a 60 s and a 180 s song.
  *Accept:* a report with one row per variant and stage; the thresholds for PD §5.1 are derived from it and marked *measured* with the card's name; variants that are not on the machine stay *estimate*.
- [x] **0.4 The writer on the native 12B.** With the owner's permission to download `gemma4_12b_int8_convrot.safetensors` (12.06 GB): run `tools/writer_probe.py` with the native 12B and with the GGUF Q6_K and QAT Q4 on the same twenty briefs; record time, peak memory, cut-off answers and the probe's quality measures. Check whether ComfyUI 0.41.0 loads the 12B.
  *Accept:* a report that states the order of steps 2 and 3 of PD §5.6 and the memory from which step 3 is taken; if 0.41.0 cannot load it, the report says which version can.
  *Done 2026-11-11 (download permitted):* `docs/test-reports/2026-11-11-writer-native-12b.md` with `tools/studies/writer_compare.py` (the probe's way of asking, over twenty briefs; peak memory by `nvidia-smi`). 0.41.0 loads the 12B. Native 12B 9.8 s, GGUF QAT Q4_0 9.3 s a brief after the first, 20 of 20 parsed each; the order of steps 2 and 3 stays; step 3 from 13.0 GiB, the E4B from 10.0 GiB (catalogue: *measured*). Not measured: the GGUF Q6_K (not on the machine), the quality of the words, the E2B.
- [x] **0.5 Faster tests, same assertions** (PD §10.1).
  - [x] `serve()` and `serve_guests()` and the network gateway take `poll_interval` (default as today); test fixtures pass 0.02.
  - [ ] Servers that a module's tests only read become module-scoped fixtures. *(Not done: the budget holds without it.)*
  - [x] `Accounts(folder, iterations=…)`; tests pass 1 000; one test asserts the production default of 240 000.
  - [x] Markers `io` and `process` in `pyproject.toml`; the ten slowest tests carry them.
  - [x] The two torch adapter tests move to the host job.
  - [x] With the owner's permission: `pytest-xdist` in `.devdeps` and in CI; `-n auto` for the `io` tier; every server test binds port 0.
  *Done so far (2026-11-11):* 144 s -> 81-84 s, the fast tier (`-m "not io and not process"`) 56 s; done with one session fixture for the poll interval and one for the PBKDF2 rounds instead of new parameters; module-scoped servers were not needed for the budget; `pytest-xdist` waits for the owner's permission to install it.
  *Done 2026-11-11 (permission given):* `pytest-xdist` 3.8 in `.devdeps` and in the CI's unit job (`-n auto` for the whole command, not only the `io` tier: it is safe and the gain is larger); 2386 tests, unchanged; three runs with `-n auto -p no:randomly` and two more with `-n auto` pass in 20-31 s; three runs in a seeded random order (a shuffle plugin in the session's scratch; `pytest-randomly` is not installed) pass in 86-89 s in one process. The test servers already bound port 0. Module-scoped servers stay undone: not needed for the budget.
  *Accept:* `pytest tests/unit tests/workflows tests/contract/test_data_schemas.py` under 90 s on the owner's machine; the number of test functions is unchanged; three consecutive runs with `-n auto -p no:randomly` and three with a random order pass.
- [x] **0.6 Coverage baseline.** With permission: `coverage` in `.devdeps`; `coverage run --contexts=test`; the report per module is committed as `docs/test-reports/…-coverage-1.6.0.md` (percentages only).
  *Accept:* the report exists; nothing is deleted on its basis in this phase.
  *Done 2026-11-11 (permission given):* `docs/test-reports/2026-11-11-coverage-1.6.0.md` - 80.1 % of 1.6.0's statements by its unit tier (`plenio/core` 95 %, `plenio/player` 87 %, `plenio/comfy` 14 %: the host tests, which exercise the adapters inside ComfyUI, are not followed). Settings: `tools/coverage.ini` (per-test contexts). The tool is coverage.py 7.16 (`.devdeps`).

**Exit of phase 0:** the three reports are committed, the unit suite is under 90 s, and the owner has read the reports' conclusions (in German, in the session).

---

## Phase 1 - package boundary

Goal: PD §3.1 to §3.4. It ships with 2.0.0 (PD §3.5).

- [x] **1.1 `plenio/core/features.py`** with `has(addon)` and a test for a present and an absent module.
- [x] **1.2 The add-on package `plenio/addons/`.**
  - [x] `studio_launcher.py`: the process-starting half of `plenio/player/studio.py` (command building, start, stop, the log). `studio.py` keeps status, settings and the "is a ComfyUI answering" logic and calls the add-on through `features.has`.
  - [x] `llm_server.py`: `find_runtimes`' `llama-server` discovery and the server process of `plenio/core/llm/runtime.py`. `runtime.py` keeps the `llama-cpp-python` shim (fixed interpreter, in-package module) and the port probe.
  - [x] `file_manager.py`: `show_folder`, rewritten without a command string (PD §3.1). The select-a-file behaviour is dropped; the callers pass a folder.
  *Accept:* with the add-on present every existing test passes unchanged except those that asserted Explorer's `/select,`; with `plenio/addons` removed from the import path (a fixture that hides it) the player, the Local LLM node and Writer Choice import and run, and each degraded function answers with the sentence of PD §3.1's table.
- [x] **1.3 Degraded paths, in words.** The player's studio panel, the *Open folder* buttons (path with *Copy*), the Local LLM node's and Writer Choice's messages, the System Check's writer line. Each message says what the user can do.
  *Accept:* frontend tests for the two panels; unit tests for the three messages; `docs/user/troubleshooting.md` has an entry per message.
- [x] **1.4 `.comfyignore`** excludes `/plenio/addons/`; `tests/host/harness.py` copies it only when a test asks for the full install.
  *Accept:* `comfy node pack` → the zip has no `plenio/addons/`; ComfyUI started from the zip registers all 37 nodes with no import error (host test over the unpacked zip).
- [x] **1.5 `tools/package_gate.py`** (PD §3.3) with `resolve_argv0`, tests with one passing and six failing fixtures (a string command, `shell=True`, `os.system`, `os.startfile`, a launch in an unlisted file, an argv whose first element is not `sys.executable`), and the `--delta <tag>` report.
  *Accept:* the gate passes on the packed zip of this phase and fails on the packed zip of `v1.6.0`, naming `visuals.py`, `runtime.py` and `studio.py`; it runs in the CI job *Registry package*.
- [x] **1.6 Route access classes** (PD §3.4): a `Route` record with `access`, `guarded()`, the table in `routes.py` and `song_api.py`, one parametrised test over every route (remote peer → 403 for `local`; no absolute path in any answer to a remote peer). `api` behaves as today in this phase (tokens come in 5.4).
  *Accept:* the test enumerates `ROUTES` and fails when a route has no class.
- [x] **1.7 Ruff rules** `S301`, `S602`, `S605` added; findings fixed or justified with a `noqa` and a reason.
- **1.8** *(moved to R0: the release tool is written once, for 2.0.0.)*
- [x] **1.9 Docs for the boundary.** SECURITY.md (what the Registry package starts: two fixed patterns; what the add-on adds), `docs/user/getting-started.md` (the two ways to install and what differs), the CHANGELOG's *2.0.0 - unreleased* section, a short ADR-0012 *Two artefacts*.
- **1.10** *(dropped with the canary; the hand-over is R6.)*

**Exit of phase 1:** the gate passes on the packed zip and names the three launchers on 1.6.0; ComfyUI loads the package without the add-on with every node; the owner has the German summary of what the Registry package leaves out.

---

## Phase 2 - catalogue v2, the model plan, downloads

- [x] **2.1 Catalogue schema 2** (PD §5.1): `resources/models.toml` rewritten into components and variants, the assets of `resources/assets.toml` folded in; `plenio/core/models.py` parses `plenio.models/2` into `Component` and `Variant`; a reader for schema 1 is not kept (the file ships with the code).
  *Done 2026-11-11, with one part moved:* the ComfyUI-format files are components and variants (12 components, 18 variants, the native Gemma writers added). `resources/assets.toml` (the multi-file ASR models, the writer's GGUFs) stays a file of its own until 2.5: the downloader is what reads both, and folding them in belongs to it.
  *Accept:* parser tests for every rejection (missing hash, unknown folder, URL not on the allowlist, two variants with one file name, a quality rank used twice in a component); `tools/build_graphs.py` and the System Check read the new structures; every 1.6.0 file is present with the same folder and file name.
- [x] **2.2 `tools/catalogue_check.py`**: reads the hub's model info and file headers (PD §5.1); `--write` fills `revision`, `bytes`, `sha256`, `gated`, `licence`, current repository names; `--check` fails on drift. Network access by the tool only, never by a test: tests use recorded answers.
  *Accept:* after `--write` no entry points at `resolve/main`, every file has a SHA-256, the three renamed repositories carry their current names; a weekly CI job runs `--check`.
- [x] **2.3 `plenio/core/modelplan.py`**: `pick` as in PD §5.2, `plan(template, facts, catalogue, installed, config)` returning one `Pick` per component the template needs plus sizes, licences, disk need and warnings; `fingerprint`.
  *Accept:* table tests: for 6, 8, 12, 16, 24 GiB and no GPU × the four preferences × three installed sets, the picks equal a reviewed table; property test: the pick is stable under changes of free memory and of the order of variants; the reason is never empty.
- [x] **2.4 Config** (`core/config.py`): `[models] prefer`, per-component pins, `downloads = "ask" | "auto" | "off"`, `[workers] device`; environment variables for each; unknown keys stay errors.
  *Accept:* config tests; the generated table in `docs/user/configuration.md` (after D1) lists them.
- [x] **2.5 The downloader** (PD §5.4): `core/assets/fetch.py` gains a download manager (queue, two at once, pause, cancel, states, speed), the refusal classifier `core/assets/hub.py`, `open_hub` with the redirect handler, the disk-space check, the Windows rename retry. Standard library only in `core`; the token is read through a small adapter that uses `huggingface_hub` behind `dependencies.require`.
  *Done 2026-11-11:* `core/assets/downloads.py` (the manager: one file per item, so a multi-file asset of `assets.toml` is several items - the two catalogues stay two files and meet here), `core/assets/hub.py` (refusals in words, `HubRedirects`), the token in `core/assets/access.py`. `ensure_asset` of 1.x (downloads during a run) is unchanged; 2.7 and phase 4 put the manager to use.
  *Accept:* tests against a local fake hub for every row of PD §5.4's table; the redirect test proves the token never reaches a second host; a resumed download after a killed process ends with the right hash; cancelling leaves a `.part` that the next start resumes.
- [x] **2.6 The gated flow, backend**: `check(repo, file, token)` returning the open step (no accept, pending, token lacks the right, ready); saving a token through `huggingface_hub.login`.
  *Accept:* tests for the four outcomes with recorded hub answers; no test and no log line prints a token (a test greps the captured log).
- [x] **2.7 Routes** (class `local`): `GET /plenio/setup/plan`, `POST /plenio/setup/downloads` (variant ids only), `GET/DELETE /plenio/setup/downloads[/{id}]`, `POST /plenio/setup/hub-token`, `POST /plenio/setup/check`; events `plenio.download` over ComfyUI's websocket.
  *Done 2026-11-11:* `plenio/comfy/setup.py` over `core/setup_plan.py`; pause and resume are routes of their own. No route test drives a download through ComfyUI (catalogue URLs are fixed): the manager is tested against a local stand-in host, a real download through the routes is owed in phase 4.
  *Review after 2.7 (Claude Fable 5.2, the main session; its effort setting could not be read):* two confirmed defects in the download manager (a file asked for again after it was deleted is not fetched; a file of the user's with the catalogued name and size but other content is deleted) and three risks (a `local` route does not look at the `Host` header; `plenio.download` events reach every websocket client; the `pending` step is unreachable). They are fixed before phase 3 builds on the routes; the checkpoint is passed when they are.
  *Fixed 2026-11-11 (checkpoint passed):* an installed item counts only while its file is there; a file at the target is checked and, when it is another, left alone with the refusal `occupied`; `local` routes check the `Host` header (loopback, `localhost`, the computer's own address and names); a refusal carries no exception text (the log does); `manual_approval` in the catalogue (`catalogue_check` reads the hub's `gated = "manual"`) reaches `pending`; a pause taken back before it is noticed, an answer longer than the file, a worker leaving while a file is queued. Tests for each; unit, contract and host suites pass.
  *Accept:* a property test posts ids, paths and URLs: only catalogue ids start a download, and every target lies inside a registered model folder; the access test of 1.6 covers the routes.

**Exit of phase 2:** from a Python shell inside ComfyUI, `plan("yue2-song")` on the owner's machine names the files the owner would choose, with reasons; a missing file can be downloaded, paused, resumed and verified through the routes.

---

## Phase 3 - Model Choice, templates, the writer plan

- [x] **3.1 `PlenioModelChoice`** (PD §5.3) with `fingerprint_inputs`, its help page `web/docs/PlenioModelChoice.md`, tooltips, the `models_missing` error data.
  *Done 2026-11-11:* `plenio/comfy/nodes/model_choice.py` over `setup.choose` (the node's field, then `[models.pins]`, then the plan; a pinned file in its folder counts as there whatever its size). The error's `details` hold component, file, variant and folder; the page that queued the run also gets `plenio.models_missing` (the frontend acts on it in 3.4). The lists show every file of the folder until 3.2's sniffers narrow them. `downloads = "auto"` fetches during a run since phase 4 (`setup.fetch_now`; a host test against the fake hub). The fake catalogue is in the contract tests (`tests/contract/test_model_choice.py`); the host tests run the real catalogue (a pin of one's own, `auto` with a sparse file of the catalogued size, a missing file).
  *Accept:* contract tests (schema, tooltips); host tests: `auto` picks the installed variant of a fake catalogue and the loader receives its name; a pinned file wins; a missing file fails with the hint and the data; installing a file changes the fingerprint.
- [x] **3.2 Sniffers** `accepts` per component in `core/models.py` (YuE2 checkpoints exist; add the same header check for MiniMax DiT, FLUX.2, text encoders by their key prefixes) so that lists show only files a loader takes.
  *Done 2026-11-11:* ten sniffers (`SNIFFERS`), keys and shapes only - FLUX.2 Klein 4B is told from the 9B by `txt_in`'s width, the FLUX.2 VAE from FLUX.1's by its 32 latent channels, Qwen3 4B by 36 layers of 2560; the parser refuses an unknown name. Checked against the headers of this computer's model folders: every catalogue file present passes its own, files of other models are refused (not committed: the folder's names). The catalogue's own files always pass (three variants were not on the machine, among them a packed fp4 file). `GET /plenio/models/files` (class `data`) lists each component's files with the reason; Model Choice uses a pinned file of another kind all the same and says so in its summary. The greying is 3.4's.
  *Accept:* tests with synthetic safetensors headers for each kind; a file of the wrong kind is listed greyed with the reason by the frontend (test in 3.4).
- [x] **3.3 Blueprints and templates**: `Plenio · YuE2 Model`, `Plenio · MiniMax Model`, `Plenio · Cover Art` get a Model Choice per component feeding the loaders; the loaders lose `properties.models`; `tools/build_graphs.py` generates them; thumbnails rebuilt.
  *Done 2026-11-11:* the block's field is the Model Choice's `component.file` (a DynamicCombo's inner widget, promoted: load, save, reload and the API prompt hold in the frontend); the frontend's prompts of the API templates were recorded again (`tools/frontend_prompts.mjs`) and the converter gives them. The instrumental adapter of `2 · YuE2 · Cover` outside the block keeps its loader and download entry. Export Release writes `models` (the file each Model Choice took, resolved again at export, so a cached Model Choice counts) and the song page reads it. Thumbnails: rebuilt, unchanged (drawn from their own definitions). `tools/browser_check.mjs`: 109/111, the same two failures on the commit before (a squeezed Cover Brief field, a Song Sheet's status in Enhance & Master) - not of this task, still open. 1.6.0 fixtures (`tests/fixtures/workflows/1.6.0 *`): their prompt names their own files and opening them leaves the model blocks; a run of one is not in the host job (it needs model files). Until Setup's page (phase 4), a missing file's message gives its address and folder.
  *Accept:* `tools/workflow_validation.py`; `tests/workflows`; `tools/browser_check.mjs` (load, save and reload, API prompt identical); a 1.6.0 workflow from `tests/fixtures/workflows/` still loads and runs with its own file names.
- [x] **3.4 Frontend**: the Model Choice widget shows the plan's pick beside `auto` ("auto · yue2_3b_int8_convrot · runs on the card"), opens Setup at the component on a `models_missing` error, greys files that do not fit.
  *Accept:* Vitest for the label and the error path.
  *Done 2026-11-11, two parts changed:* the combo's `getOptionLabel` (frontend 1.58.5; an older one shows plain names) labels the value - the saved value stays the file's name; `/plenio/models/files` gives each component's `pick`. A list's entries cannot be greyed, so a file that does not fit reads "<file> · does not fit: <reason>". Setup's page does not exist before phase 4: `plenio.models_missing` shows a notice with the folder and the address for now; 4.x makes it open Setup at the row. Checked in the real frontend (Playwright's Chromium): the block fields show the labels after loading and after R; browser check 109/111, the two old failures. The template note on models no longer sends users to ComfyUI's missing-model dialog for the model blocks.
- [x] **3.5 `core/blocks.py`**: *Bring this workflow's blocks up to date* offers the new model blocks for 1.x workflows and keeps the user's file as the pin.
  *Accept:* tests on the 1.0.1 and 1.5 workflow fixtures: after the update the Model Choice holds the old file name, not `auto`.
  *Done 2026-11-11:* `upgrade_models` (the route with `"models": true`), never on opening - a 1.x workflow opens with a notice and runs as it did; the command *Bring the model blocks up to date* (File and Plenio menus) does it. Each Model Choice keeps the old loader's file (the block's field, or the loader's own value inside), the old loaders' other values and bypass go along; a block with another node changed inside, or other inputs, is kept and named. Tested on the two 1.0.1 and two 1.6.0 fixtures (no 1.5 fixture exists; 1.6.0's blocks are 1.5's): every loader gets the file it got before. In the real frontend (Playwright's Chromium): the notice on opening the 1.6.0 song, the command, the same files through four Model Choices; browser check 109/111 (the two old failures).
  *Review after 3.5 (Claude Fable 5.2, high effort, a read-only subagent):* seven confirmed defects, all fixed with tests: **C1** with 1.6's files installed, `auto` stopped below 15.5 GiB (it wanted the fp8/int8/fp4 variants) - `modelplan.pick` now keeps an installed variant rather than stop a run and names the better one (`Pick.better`, shown by Setup); this changes PD §5.2's "two ranks: the better file is worth it" for files not installed, by rule 10. **C2** `/plenio/api/v1`: `POST /jobs` again refuses a missing model file before queueing (`comfyui_rejected`, judged by name as ComfyUI's check of 1.6 did), and `GET /models` says `ready`/`missing` by the files the Model Choices take. **C3** `upgrade_models` kept a block only on changed values - now also on nodes added, removed or switched on/off inside. **C4** malformed headers no longer raise. **C5** `.sft` files are read. **C6** the song page names the adapter's LoRA from its Model Choice. **C7** the record names only Model Choices that fed a loader, with the file they output in the run (R1: a cached one resolved again). Risks fixed too: R3 the command opened a new tab (it loads into the open one now, checked in the frontend), R4 the labels refresh once per run, the header cache holds 4096. Left as noted: R2 (a block whose fields the user promoted from inside, `proxyWidgets`, is not covered - no such workflow known), R5 (`pick.reason` names the card's memory to any peer of the `data` route), R6 (a YuE2 LoRA with music parts is labelled as not fitting; no such file to check). Checkpoint passed.
- [x] **3.6 The writer plan** (PD §5.6) in `core/llm/gemma.py` and `comfy/llm.py`: the four steps in the order phase 0.4 measured; `writer-native` and `writer-gguf` are catalogue components, so Setup lists the writer's file like any other; Writer Choice's summary says which step wrote and why.
  *Accept:* `tests/unit/test_writer_default.py` extended to the four steps × (add-on present, absent) × (`llama_cpp` importable, not) × five memory sizes; a saved workflow keeps its writer.
  *Done 2026-11-11, with the order not measured:* phase 0.4 has not run (the 12 GB download waits for the owner's permission), so the steps follow PD 5.6's expectation and the docs say so: (1) a running app's Gemma 4 12B - now before a GGUF on disk, it costs no load time; (2) a GGUF here or the card's downloaded (llama.cpp); (3/4) without llama.cpp, `writer-native` by the model plan (`gemma.native_pick`: 12B, E4B or E2B by the card's memory, an installed one kept, a pin first; the 12B only where `comfy.text_encoders.gemma4` has `Gemma4_12B_Config` - v0.41.0 has it, read in its code), then any installed Gemma 4 text model; else the run stops naming the plan's file and its pinned address. Writer Choice's summary names the step and why (a warning when the E4B/E2B writes). `writer-gguf` stays in `resources/assets.toml` (the download manager serves both catalogues, 2.5); Setup lists it in phase 4. The writer entries are unchanged, so a saved workflow keeps its writer. Tests: 60 cases of steps × add-on × llama_cpp × five cards, the 12B's absence, the summary.
- [x] **3.7 The hardware table** is generated from the catalogue (System Check, README block after D1, `docs/user/models.md`); `core/system.py: RULES` is removed.
  *Accept:* the System Check's report on 16 GiB names the same files as `plan()`.
  *Done 2026-11-11:* `core/system.py: hardware_rows(components, assets)` - per row (`CARDS`, a typical card of each) the plan's picks with nothing installed, the writer's GGUF and its native step, and whether the thresholds are measured (all *estimate* today). The System Check and the templates' *Models* notes show it; `RULES` is gone. The README block and the table of `docs/user/models.md` follow with D1's facts tool (they are written by hand until then). Browser check 109/111, the two old failures.

**Exit of phase 3:** on a machine with only the files the plan chose, every template runs from a fresh `git clone` with every model field on `auto`. The owner has made one real song this way (GPU 1).
*Passed 2026-11-11:* the owner's real song from `1 · YuE2 · Song` with every Model Choice on `auto` on a 16 GB card (15.9 GiB): the record's `models` key lists the YuE2 file and the three cover-art files the plan took, the unused instrumental adapter is not listed; 235 s in all, peak 3.6 GiB as the record measures it; heard by the owner ("sounds good"). The fresh-clone runs of the other templates are the host job's, with fake models.

---

## Phase 4 - Plenio Setup and Home

- [x] **4.1 Findings with fixes** (PD §4.2) in `core/system.py`; the Markdown report is rendered from them; ids are stable and listed in `docs/user/troubleshooting.md`.
  *Accept:* a test per finding id; the report of 1.6.0's facts differs only in wording.
  *Done 2026-11-11:* `core/system.py: Finding`, `Fix`, `FINDINGS` (twelve ids, each in `docs/user/troubleshooting.md` - a test reads the guide); the node's Markdown lists the warnings first with their ids and fixes, then the details; `Report.messages` and the status are as in 1.6 for the same facts (a missing or incomplete model file is a finding of severity *ok*: the Templates table showed it, the status stayed OK). New facts: free space of the models drive (`disk.low`), and the download fix of each missing file is the plan's variant for the card.
- [x] **4.2 The sidebar tab** (`frontend/src/setup/`, lazy chunk): the six steps of PD §4.1 with the plan, the download rows (progress, pause, resume, blocked states with their fix buttons), the gated dialog of PD §5.5, the disk-space line, the choice of target folder among the registered ones. Opens once after an install or update that lacks files for a template; later from the Plenio menu; a red dot when an opened template lacks files.
  *Accept:* Vitest for each state of a row; a Playwright run against the dev server with a fake hub: plan → download → verified; the gated path with a fake gated file.
  *Done 2026-11-11:* `frontend/src/setup/` (`model.ts` the logic, `SetupPanel.vue`, `AccessDialog.vue`, a lazy chunk of 23 kB), `frontend/src/extension/setupTab.ts` (the tab, *Plenio › Plenio Setup*, opening once per version, the dot of the open workflow, `plenio.models_missing` opens the row). New local routes: `/plenio/setup/state` (`<user>/plenio/setup.json`, `core/setup_state.py`), `/findings` (4.1's list), `/folders` (the registered folders with free space; the plan itself stays without paths); a download names a registered folder or none and is refused before it starts when its drive lacks the files plus 2 GB. The fake hub is `tools/fake_hub.py`, reached as the mirror `HF_ENDPOINT` - which Plenio now honours for real mirrors too (no token is sent there; the SHA-256 check stays); `tools/dev_server.py --fake-hub` and `tools/setup_check.mjs`: 9 of 9 on a fresh base (plan → *Download all* → three files verified, the gated one → the three steps). Step 5 opens the template until 4.3 runs the test song.
- [x] **4.3 The test song** (step 5): the real `1 · YuE2 · Song` template through the Song API with the fixed brief of PD §4.1; failures are shown as findings with fixes.
  *Accept:* host test with fake models; on the owner's machine with real models once (GPU 1), time noted.
  *Done 2026-11-11:* `core/setup_state.py: TEST_SONG` (yue2-song, a minute, instrumental, cover art and HQ off, folder `plenio/Setup test`, no sheet music, song page or subtitles), `POST /plenio/setup/test-song` (local) queues it through the Song API (`song_api.create_job`); step 5 follows the job, plays the take, shows a failure as a finding (`test.model` with the way to the plan, `test.failed` with the node). Host test: the real template with the catalogue's names as empty files - ComfyUI accepts the prompt, the brief is the fixed one, the cover's nodes are bypassed, HQ is off. Real models on GPU 1 (RTX 5060 Ti 16 GB, ComfyUI 0.41.0 started fresh): **65 s** the first time, 44 s again from Setup's page in the browser - not heard.
- [x] **4.4 Home** (PD §7.2): the tab's page once setup is done - template buttons, the player, *Continue a song*, recent songs from `/plenio/records`, the models line, links.
  *Accept:* Vitest; browser check extended by "Home opens each template".
  *Done 2026-11-11:* Setup's last step (`HOME_TEMPLATES`, `HOME_LINKS`, `homeModels` in `frontend/src/setup/model.ts`): five template buttons by what one wants to do (the wanted ones highlighted), *Open the player*, *Continue a song…*, the five newest songs with audio from `/plenio/records` (each opens the player at the song), the models line with *Manage*, links. `tools/setup_check.mjs` checks that each button opens its template (10/10). *Report a problem* links the guide until 4.5.
- [x] **4.5 Problem report** (PD §4.3): the zip, the cleaning of paths and names, the preview.
  *Accept:* a test feeds a system report with the user's home path and asserts the zip contains neither the user name nor a drive path beyond two parts.
  *Done 2026-11-11:* `core/problem_report.py` (`report_files`, `zip_bytes`), `POST /plenio/setup/report` (local; the files as JSON for the preview, `download: true` the zip), *Report a problem…* in Setup with the files to read before *Save the zip*. Deviation: free text (the report's Markdown, log lines) needs its own cleaning - `player/server.py: without_places` cleans keyed data only - so `clean_text` cuts every path in a text to its last two parts, takes the home folder out first (its name may hold a space) and replaces the user name; JSON is cleaned value by value. Unit test with a home path holding a space; host test against the real server's home.
- [x] **4.6 Presets in the templates** (PD §7.1): `resources/presets/make.json` as the single source; the player's `presets.ts` and the API read it; a preset field in the templates' first group sets widgets through the frontend.
  *Accept:* a test asserts the player, the API and the template widget list the same six ids; choosing a preset changes exactly the widgets the file names, and undo restores them.
  *Done 2026-11-11:* `resources/presets/make.json` (the player's six, their ids kept: `best`, `party`, `sketch`, `full`, `takes`, `instrumental` - the player's saved state names them); `core/presets.py` (`with_preset` for a job's `"preset"`, the request's own fields win; `template_changes` per field the node and input or the switch); the node `PlenioPreset` (no outputs, does nothing in a run) in group 1 of the four song templates under the writer, made last so no node id moves, left out of the API's fields; `GET /plenio/presets?template=` (`data`); the frontend sets the widgets and the Cover switch and records one undo step (`changeTracker.checkState`). Tests: `tests/unit/test_presets.py` (same six in the file, the player's source, the node, the API document; precedence; every change is a field of the template), Vitest (exactly the named widgets change). In the browser on 1 · YuE2 · Song: *sketch* set the length and switched the cover off, ComfyUI's undo restored both. The prompt fixtures were recorded again (the templates hold the new node); browser check 109/111, the two old failures.
- [x] **4.7 Approve continues the run** (PD §7.4), with the setting to keep the old behaviour.
  *Accept:* browser check: approve on a stopped sheet queues one run; with the setting off it queues none.
  *Done 2026-11-11:* *Approve* on a sheet whose state is *waiting for your approval* calls ComfyUI's own `app.queuePrompt(0, 1)` (`sheetStateWidget.ts: onApprovedWhileWaiting`, `runStatus.ts: continuesAfterApproval`); the ComfyUI setting `Plenio.Sheet.ApproveContinues` (on by default) keeps the old behaviour when off; the waiting sheet's line says which. Vitest for the decision and the line; in the browser (1 · YuE2 · Song on *one song, stop to review*, a waiting Text sheet, its editor's Approve): one run queued with the setting on, none with it off.
- [x] **4.8 Recipes and Brief List** (PD §7.3): the node, its help page, the six recipe workflows built by `build_graphs.py`.
  *Accept:* each recipe validates and runs with fake models in the host job.
  *Done 2026-11-11:* `PlenioBriefList` (`core/brief_list.py`: entries from a text or a file inside the input folder, one per run by an index on *increment*, wrapping round) and, for the folder recipe, `PlenioLoadAudioByName` (ComfyUI 0.41.0's Load Audio fails its own check on a linked name); six recipes built by `build_graphs.py` into `example_workflows/recipes/` (not listed by ComfyUI's template browser; without `plenio_api`, so the Song API runs only the templates): a series from a list, two music models from one brief (YuE2 and MiniMax in one workflow, `below()` merges the graphs), a cover in three styles, the same lyrics in three genres, a song with stems for a DAW (`song_api.save_stems`), master a folder of files; `docs/user/recipes.md`; `workflow_validation.py` checks them (a *Recipe* note allowed, no thumbnail, block values may differ). Host test: ComfyUI accepts every recipe and runs it until its first loader - the catalogue's files are empty there, so *runs with fake models* means validated and started, not rendered; Brief List itself ran four times and handed entries 1, 2, 3, 1. The host run found that API v1's job list told another computer the package's path (in a failed job's error type and message): cleaned for other computers, unchanged for this one.

**Exit of phase 4:** on a clean ComfyUI (a fresh base directory, no Plenio files, an empty models folder, a throttled fake hub for the test and the real hub once with the owner's permission): install, open ComfyUI, follow Setup, hear the test song - without reading documentation. The owner does this once and names what was unclear; those points are fixed before phase 5 builds on them.
*Passed 2026-11-11 on the owner's word* ("Abschluss von Phase 4 ist okay, passt alles"): nothing named as unclear. Checked by the agent: Setup from a fresh base against the throttled fake hub in the browser (`tools/setup_check.mjs`, 10 of 10), the real hub through Plenio's download manager (the native 12B and the Q6_K, SHA-256 checked), the test song with real models on GPU 1.

---

## Phase 5 - Song API v2, tokens, Player API, MCP

*Pre-implementation review (Fable 5.2, 2026-11-11, read-only) - binding for the tasks below:*

- *Fixed at once:* a page of another site in a browser on this computer counted as this computer (its request to
  ComfyUI's network address came from the computer's own address): `core/access.py` now also requires a matching
  `Origin` and refuses `Sec-Fetch-Site: cross-site/same-site`. A finished job told another computer its record's and
  folder's paths: cleaned like the error (`song_api._without_places`).
- *5.1:* record the golden answers by running an export of 1.6.0 (`c307d35`) on the pinned ComfyUI with the same fake
  base, then replay on HEAD; every difference goes into a reviewed delta list (already known: the `preset` request
  key - 1.6 ignored unknown top-level keys - the refusal of a missing model file naming Model Choice, `/models`
  listing the plan's files, the cleaning of job answers for other computers). Compare parsed JSON with volatile fields
  masked; keep status codes, key sets, error `code`/`field`/`hint`, `Location`, 201 against 200 on a replay, the 404
  texts. A `succeeded` answer needs a golden made from a fabricated history. Keep `song_api.create_job` (Setup) and
  the 16 v1 routes the route test counts, or change both together.
- *5.2:* v1 keeps its queue- and history-derived view and its 404 after a restart (the player's maker makes the
  song again on it); the job store serves v2 only. v2 jobs get an id of their own with a list of prompt ids. State
  changes need an observer (nothing sees a run end today); reconcile queued jobs at start; stamp jobs with an
  instance id (two ComfyUIs can share a user folder); on Windows one writer, reads from the in-memory index, retry
  `os.replace`, never persist progress, skip corrupt or `.tmp` files when rebuilding.
- *5.4:* one guard for v1 and v2 `api` routes, made from the route table. Order: `is_here` passes without a token
  (1.6 callers, the player's maker); else `off` 403, `open` passes, `token` needs `Authorization: Bearer` (401 in
  v1's error shape with `WWW-Authenticate`). Tokens: 256-bit, stored as SHA-256, compared with
  `hmac.compare_digest`, never in a query string, never logged, *last used* written about once a minute, never in
  the problem report. Delay failed attempts, no lock-out by peer (gateway users all arrive as 127.0.0.1).
  `briefChoices.ts` reads `/plenio/api/v1/briefs` from ComfyUI's page: move it to a `data` route first. Cleaning of
  places follows `is_here`, token or not (reword 5.4's line "with a token: as local"). Idempotency keys per token.
- *5.5:* filter events per subscriber (`download.*` are `local`) on the live and the replay path; events carry ids,
  status and stage only; a ring buffer, progress coalesced and not replayed, bounded per-subscriber queues, a cap on
  subscribers; event ids with a boot epoch, an unknown `Last-Event-ID` gets a `sync` event; publish from worker
  threads with `call_soon_threadsafe`.
- *Docs:* the token protects Plenio's routes only - ComfyUI's own `/prompt` and `/history` stay open; a tunnel that
  rewrites `Host` to localhost without a forwarding header counts as this computer.

- [x] **5.1 Freeze v1.** Move v1's handlers to `comfy/song_api_v1.py`; record golden answers for every endpoint and state from 1.6.0's behaviour (`tests/fixtures/api-v1/`); a test replays them.
  *Accept:* the golden test passes before and after every later task of this phase.
  *Done 2026-11-11:* v1's handlers are `plenio/comfy/song_api_v1.py` (moved whole; its importers follow). `tools/api_v1_golden.py` sends a fixed series of 26 requests - every endpoint, the states a run can reach without real models (queued, failed at the first loader, a key replayed, cancelled after the end, the refusals) - and masks ids, times, seeds, versions and the base folder. The goldens in `tests/fixtures/api-v1/` were recorded from 1.6.0 (`c307d35`, checked out apart) on ComfyUI 0.41.0 with empty model files of both catalogues' names; `tests/host/test_api_v1_golden.py` replays the series on every host run and allows only `DELTAS`, each with its reason: `/models` (pinned URLs, measured sizes; readiness by the plan's variants) and the prompt's node count (Model Choice, Preset). The OpenAPI document is compared by its paths and methods (its schemas carry the template fields). Not covered: a `succeeded` job (needs real models; a fabricated history is owed with 5.2), a running job's stage.
- [x] **5.2 Jobs on disk** (PD §8.1): `core/api/jobstore.py` (atomic JSON per job, index, retention, `interrupted` on restart); v1 and v2 both read it.
  *Accept:* a host test restarts the server mid-job and finds the job `failed/interrupted`; an `Idempotency-Key` reused after the restart starts a new run.
  *Done so far 2026-11-11:* `plenio/core/api/jobstore.py` - v2 jobs with ids of their own (`job_<hex>`) and their ComfyUI prompts, one file per job written whole (`os.replace` tried again while Windows holds the file), the index in memory, damaged and half-written files skipped at start, a job of *this* server (`instance`) that was active becomes `failed`/`interrupted`, another server's (a shared user folder) is left alone, keys per caller and free again after an interruption, the newest 500 / 30 days kept; unit tests. Per the review, v1 does not read it. Owed: the observer that writes state changes and the host test with a restart - both need v2's jobs endpoint (5.3).
  *Done 2026-11-11:* the observer is `song_api_v2.refresh` (each request) and `watch()` (a background thread every 2 s for the jobs still active); a job whose run ComfyUI no longer knows becomes `failed`/`lost`. `tests/host/test_api_v2_jobs.py` restarts the server: the job's file is set to *running* while it is down (a run cannot be held open without models), and after the start the job is `failed`/`interrupted` and its `Idempotency-Key` makes a new job.
- [x] **5.3 v2 endpoints** in the order: discovery and templates for all five production templates (`extra.plenio_api` in `yue2-daw`, `minimax-song`, `enhance-master`), system and models (plan, downloads through 2.7's manager), jobs with `review` and `approve`, documents, timings, songs (`core/api/songs.py` over the records index), scores and lyrics (the existing route functions behind versioned paths), uploads, queue.
  *Accept:* per endpoint a golden test; a host test drives a job through both review stops with an edited lyrics document and finds the edit in the record; `enhance-master` masters an uploaded file; `yue2-daw` renders a posted score.
  *Done so far 2026-11-11:* `plenio/comfy/song_api_v2.py` - discovery (`/`, `/templates`, `/templates/{id}`, `/briefs`, `/presets`) for `yue2-song`, `yue2-cover`, `yue2-daw` and `minimax-song` (the two new ones carry the marker; v1 keeps its two, `song_api.V1_TEMPLATES`), jobs on the store (`POST`/`GET`/`DELETE`, `?wait`, the files of a finished job, the preset), uploads and the queue as v1's. Review stops (`core/api/review.py`): `review: ["text", "score"]` sets each Song Sheet's `review` in the prompt; a run that ended at a waiting sheet makes the job `waiting_for_review` with the documents and their SHA-256; `POST /jobs/{id}/approve` queues the same request again (seeds fixed) under the same job, edited documents as manual text, the approved stops passed; `GET /jobs/{id}/documents`. On real models (GPU 1, 2026-11-11): a sung `yue2-song` stopped at *text*, was approved with edited lyrics, stopped at *score*, was approved and made its song in 135 s; the record holds the edited lyrics - not heard. Also: `/jobs/{id}/timings`, `/jobs/{id}/bars`, `/models`, `/models/plan`, `/songs` (`core/api/songs.py`: the records of the output folder, an id made from the record's place inside it, `?q=`), `/songs/{id}`, `/songs/{id}/files/{name}`, `/scores/analyze|transform|import/midi|import/musicxml|export/midi|export/musicxml` and `/lyrics/analyze` (the editor's functions, refusals as `bad_request`). `enhance-master` carries the marker with the kind `master`: without a Song Brief its fields are the nodes of its groups 1-3 (`song_api.MASTER_GROUPS`); a host test uploads a generated tone, masters it on the CPU (HQ off) and downloads the FLAC. The watcher and a request no longer race (`refresh` reads the stored job, one at a time). `review: []` stops nowhere (the DAW template's sheet stops by itself otherwise): on real models (GPU 1) `yue2-daw` rendered a posted title, style, lyrics and score - the record's score and lyrics are the posted ones - in 181 s, not heard. Then `POST /songs/{id}/again` (`as`: again, take, like, cover - a cover copies the song's audio into the input folder as uploads are named), `/writers`, `/loras`. Goldens: `tools/api_v1_golden.py --api v2` records a series of 26 v2 requests (every endpoint that answers without real models, and the refusals) into `tests/fixtures/api-v2/`, replayed in the host tier with v1's; a job's `progress` and `stage` and the choices of a model-file field are left out of both comparisons (they depend on the moment and the server's files). Moved to 5.4: `/system` and the downloads, which are this computer's - they come with the guard that can say *local* inside `/plenio/api/`. Deviation from the acceptance line: the two review stops with an edited lyrics document were driven on real models (GPU 1), not in the host job, whose empty model files stop every run before its first sheet.

- [x] **5.4 Tokens and `api.remote`** (PD §8.5): `core/api/tokens.py`, the Setup page *API access*, the guard for `api` routes (v1 and v2), the refusal text.
  *Accept:* tests: remote without a token → 401 with the hint; with a token → as local; `remote = "open"` → as 1.x; `off` → 403; a token is stored only as its hash; the list shows names and last use.
  *Done 2026-11-11:* `core/api/tokens.py` (`plenio_` + 256 bits, SHA-256 only, `hmac.compare_digest`, last use written once a minute, `Authorization: Bearer` only), `[api] remote` / `PLENIO_API_REMOTE` (`core/config.py`), the guard `song_api_v1.admit` in the one wrapper v1 and v2 share: this computer passes without a token (1.6's callers, the player's maker), `open` as 1.x, `off` 403 `remote_off`, `token` 401 `unauthorized` with `WWW-Authenticate` after a second's pause (no lock-out: the gateway's guests share one address). A token's v2 jobs are its own; v1's Idempotency-Keys are scoped per token. Setup › *API access* (in Home): names, made, last used, *Make a token* (shown once), *Take back*; routes `/plenio/setup/tokens` (local). The ComfyUI page's brief lists moved from `/plenio/api/v1/briefs` to the `data` route `/plenio/brief/choices` (a page opened from another computer needs no token). Host tests `tests/host/test_api_access.py`; v1's goldens pass for this computer. Docs: the API guide, configuration, SECURITY.md, the CHANGELOG under *Changed* - the one change of 2.0 that can stop a setup reaching ComfyUI over the network.
- [x] **5.5 Events** (PD §8.1): the hub with replay by `Last-Event-ID`, the stream handler, events from the job store and the download manager.
  *Accept:* a host test reads the stream through a whole job and a download; a reconnect with `Last-Event-ID` misses nothing.
  *Done 2026-11-11:* `core/api/events.py` (`EventHub`: per subscriber only what it may see - a token's own jobs, downloads only on this computer - on the live and the replay path; ids `<boot>-<n>`; the newest 500 kept, progress never; queues of 200, a slow subscriber dropped; at most 32 streams; an unknown or too old `Last-Event-ID` gets `sync`; `publish` from any thread through `call_soon_threadsafe`), `GET /plenio/api/v2/events` (a comment every 15 s), events with ids, status, the stop and the stage only (`job.queued|running|waiting|succeeded|failed|cancelled|lost`, `job.progress`), the download manager's states as `download.*`. Unit tests; host test: a job's events from queued to failed on the open stream, a replay by `Last-Event-ID`, `sync` for an id of another start.
- [ ] **5.6 OpenAPI and docs**: `tools/api_docs.py` writes v2's `openapi.json`, `fields.md` and the reference page; `docs/api/README.md` is rewritten for v2 with a short *Coming from v1*; examples updated.
  *Accept:* the committed OpenAPI equals the generated one; the examples run against the fake-model server in the host job.
- [ ] **5.7 `plenio_client.py`** (single file, standard library, typed) in `docs/api/examples/`; the examples use it.
- [ ] **5.8 Player API v1** (PD §8.3): the six routes under `/api/v1` in `plenio/player/`, their OpenAPI (`docs/api/player-openapi.json`), a guide page, events.
  *Accept:* tests for each route and for a transport command reaching a (simulated) playing page within one second.
- [ ] **5.9 MCP server** (PD §8.4, if D-8): `plenio_mcp.py`, tests with a scripted JSON-RPC session against the fake-model server, a guide page with the configuration snippet for assistants.
- [ ] **5.10 The player and VST3 move to v2 where it helps**: the player's maker uses job persistence and events (it keeps its own line today); VST3 is the owner's repository - write the change notes for it (`docs/api/coming-from-v1.md`), touch nothing there.

**Exit of phase 5:** a script on another computer with a token makes a song with a review stop, edits a line, approves, downloads the files, and a second script lists the song in `/songs`.

---

## Phase 6 - the player: people, navigation, languages

- [ ] **6.1 Invitations** (PD §9.1): `Accounts.invite/accept`, the routes, the QR page, the accept page (password or four-digit PIN), expiry and rate limit.
  *Accept:* tests: a code works once; after 15 minutes it is refused; eight wrong tries make the device wait; the code is stored only as its hash.
- [ ] **6.2 The page *People & access***: the three cards, the grid bound to the existing settings (no new stored fields except invitations), the three starting points, the role names of D-9. *Settings › Accounts*, *Party songs*, *In your network* redirect here.
  *Accept:* a test maps every cell of the grid to the setting it reads and writes and asserts the old pages' switches and the grid agree; state files of 1.6.0 load with the same permissions as before.
- [ ] **6.3 *Start a party*** and *End the party*: the three questions, the settings set together, the code on the big screen.
  *Accept:* a test: after *Start* the guests' access, Live Play and guests' song making are on with the chosen permissions; after *End* each is as before *Start*.
- [ ] **6.4 Navigation** (PD §9.2): the five places on every screen size; Settings as tabs with a search over labels, *Basic* and *Everything*; first-run cards; empty states.
  *Accept:* Vitest for the routes and the search; screenshots at 390, 820 and 1440 px in the test report; every setting of 1.6.0 is reachable (a test lists setting keys against rendered controls).
- [ ] **6.5 *Make a song*, short first**: the one field, the style chips, *Generate*; *More options* holds today's form unchanged.
  *Accept:* the existing form tests pass with *More options* open; a new test makes a song from the short form with the defaults of the chosen style.
- [ ] **6.6 The guests' page in seven languages** (PD §9.7, if D-12): strings in `plenio/player/guest_locales/<lang>.json`, the choice by `navigator.languages`, English as the fallback, ADR-0013.
  *Accept:* a test asserts every locale has every key; no string of the page is left in the source.
- [ ] **6.7 Docs**: the player guide split into seven pages (PD §10.3), each section with its key in `resources/media.toml` for the how-to chapter that will be embedded.

**Exit of phase 6:** the owner sets up "two friends who make songs, one child who listens, a party tonight" from a fresh player state in under two minutes, without the guide.

---

## Phase 7 - visuals

- [ ] **7.1 Half floats** (PD §9.5): `gpu.ts`, `nova/renderer.ts`, `drop/renderer.ts` accept `EXT_color_buffer_half_float`; an `RGBA8` path with dithering when neither exists.
  *Accept:* tests with mocked contexts for the three cases; on the owner's phone Nova is offered (the owner checks; note the model in the report).
- [ ] **7.2 `uQuality`** in every Nova scene (march steps, octaves); the governor lowers quality before pixels; tiers A, B, C; the frame cap and pixel-ratio cap.
  *Accept:* `nova.test.ts` extended: the governor's order of steps; each scene compiles with quality 0.5 and 1 (the existing compile test over all scenes); on the integrated GPU of the test machine at least 20 of 22 Nova scenes stay offered, as measured before.
- [ ] **7.3 The analysis track** (PD §9.4): `plenio/player/analysis.py` (envelopes, onsets, beats from bars or score or autocorrelation, sections, drops, a confidence), the cache, the route, the shared player carries the tracks of its songs.
  *Accept:* tests on synthetic audio (a click track at 120 BPM: beats within 20 ms; a quiet-then-loud signal: one drop at the jump); on twenty of the owner's songs, read-only: the share of downbeats within 50 ms of the measured bars, reported as an aggregate.
- [ ] **7.4 The heard time** (PD §9.4): `engine.ts` exposes `heard()`; lyrics, notation cursor and visuals use it; *Settings › Sound › Picture and sound together* with the reported latency, the slider and the test pattern.
  *Accept:* unit tests for `heard()` with and without `outputLatency`; the lyrics-follow tests pass with an offset of zero.
- [ ] **7.5 The cue** (`visuals/conductor.ts`, PD §9.4) and its uniforms in the mixer and the three engines; every visual may read it, none must.
  *Accept:* table tests for `cueAt` on a hand-made track (phase, anticipation rising before an onset, impact at it, tension before a louder section); a visual that ignores the cue renders as before (image hash test on one classic).
- [ ] **7.6 The Director** as a mode: one visual per kind of section, changes on the section's downbeat with the crossfade centred on it, transitions by section energy, the fallback to *Match the music* below the confidence threshold.
  *Accept:* a simulation test over a track with verse, chorus, verse, chorus, bridge: five changes, each within one frame of its downbeat, both choruses the same visual.
- [ ] **7.7 One light** (PD §9.6): Nova's finishing as the mixer's last pass for all engines, with a setting to switch it off.
  *Accept:* the video maker's frame tests pass; a visual comparison sheet (before, after) for six visuals in the report for the owner.
- [ ] **7.8 The chooser** (PD §9.3): themes on every visual, the collections, *Show* and *Energy*, *Fine-tune* with today's panel, the live gallery, ♥ and ✕ in the full-screen view, `tools/visual_posters.mjs` and the sprite sheet.
  *Accept:* a test asserts every visual has a theme and a poster; settings of 1.6.0 load into *Fine-tune* unchanged; *Energy* maps to the three settings by a tested table.
- [ ] **7.9 Signatures** (if D-11): the owner names twelve; each is tuned for `anticipation`, `impact`, `tension`; a page in the report with a clip per visual for the owner's approval.
- [ ] **7.10 Motion in the page** (PD §9.6): the three shared-element moves, the one easing, reduced motion.

**Exit of phase 7:** the owner watches ten songs with the Director on a desktop, a phone and a television with a sound bar, and decides D-10.

---

## Phase 8 - performance, by measurement

For each hypothesis P1 to P6 and P8 of PD §6.2, in this order: measure with `bench.py` → if the gain is below 5 % of a run, record it and stop → else implement → measure again → record.

- [ ] **8.1 P1** the plan prefers variants that leave room (the catalogue's `vram_full` already expresses it; verify the cover-art picks below 24 GiB).
- [ ] **8.2 P2** the writer stays loaded across a series when the plan says it fits; it stops when the queue is empty.
- [ ] **8.3 P3** workers on the second card (`[workers] device`), default: the largest card ComfyUI does not use.
- [ ] **8.4 P4** the cover never runs between the music model's plan and take.
- [ ] **8.5 P5** *a new take* hits ComfyUI's cache for writer and plan (a test compares prompts).
- [ ] **8.6 P6, P8** the warm-up note; the editor chunk preloaded on idle.
- [ ] **8.7 Budgets**: `docs/dev/performance.md` with the measured numbers of 1.6.0 and of this phase; `release.py prepare` asks for a `bench.py` report and compares.

**Exit of phase 8:** a report with before and after per brief; no brief is slower than on 1.6.0.

---

## Phase 9 - tests: tiers and necessity

- [ ] **9.1 CI in tiers** (PD §10.1): `ci.yml` as a reusable workflow; jobs fast, io (`-n auto`), host as a matrix over the minimum and the newest ComfyUI tag, frontend, package (with the gate), browser on pushes to `main`; a weekly job against ComfyUI `master` that opens an issue on failure.
  *Accept:* a pull request's checks finish in under eight minutes of wall time.
- [ ] **9.2 Node-type snapshots per tag** (`tests/fixtures/node_types/<tag>.json`), the snapshot tool takes a tag.
- [ ] **9.3 Mutation runs** (with permission to add `mutmut` to `.devdeps`): `tools/mutation.sh` over the modules of PD §10.1; for every surviving mutant a test or a removal, recorded in `docs/test-reports/…-mutation.md`.
  *Accept:* the surviving-mutant rate of each listed module is reported before and after; after is below 10 % or each survivor has a written reason.
- [ ] **9.4 Merge candidates**: from per-test coverage contexts and the mutation results, a list of tests that add nothing; the agent proposes, the owner (or a review pass by the agent with the list in the report) confirms; merged tests keep every assertion that is not a duplicate.
  *Accept:* the list and what was done with each entry are in the report; no test named after a reported bug was removed.
- [ ] **9.5 Hypothesis profiles**: 25 examples on pushes, 300 weekly.
- [ ] **9.6 `docs/dev/testing.md` and `docs/design/testing-strategy.md`** rewritten for the tiers and budgets.

---

## Phase D - documentation

- [ ] **D1 `tools/facts.py`** (PD §10.3): `docs/facts.json`, the markers, `--write`, `--check` in CI; blocks in README, `docs/user/models.md`, `docs/user/configuration.md`, SECURITY.md, `docs/dev/release.md`.
  *Accept:* `--check` fails when a number in a block is edited by hand; the README's node, blueprint and test counts equal the code's.
- [ ] **D2 `resources/media.toml` and `tools/media_links.py`** (MP §6): the registry with today's sixteen videos, the go-link pages under `docs/go/`, `plenio/player/static/media.json` read by the player's help (`help.ts` loses its id list), thumbnails at `assets/media/<key>.jpg`, the generated tutorial table; the rule "no `youtu.be` outside generated blocks" replaces `tests/unit/test_tutorial_links.py`.
  *Accept:* changing one id in `media.toml` and running the tool changes README, docs, the go page and the player's JSON, and nothing else needs an edit.
- [ ] **D3 Link and coverage checks** in CI: relative links, environment variables and config keys against `core/config.py`, routes against the references.
- [ ] **D4 Rewrites** (PD §10.3): Getting started, Models and downloads, the seven player pages, Troubleshooting by finding id, the API guide, *From 1.x to 2.0*; node help pages for the new nodes; every page checked against the running program, not against the design.
- [ ] **D5 The site** (if D-13, with permission to add VitePress to the frontend's dev dependencies): `docs/.vitepress/`, the Pages workflow that builds the site, the demo page, the API reference and the go-links together.
  *Accept:* the site builds in CI; the demo page and the go-links keep their addresses.
- [ ] **D6 The README** in the order of MP §4, with the one line of D-M2.
- [ ] **D7 Design records**: this plan's boxes ticked; `docs/design/README.md` lists the three v2 documents as implemented with the commits; ADR-0012 (two artefacts), ADR-0013 (guests' languages), ADR-0014 (Plenio downloads catalogue models after confirmation).

---

## Phase M - media pipeline and the kit

In the repository `Plenio-Media` (if D-M1; otherwise in `tools/media/` of this repository, with `out/` ignored). The agent creates the repository locally; publishing it is the owner's step.

- [ ] **M1 The workspace** (MP §3.2): layout, `media.mjs` with `status`, `build`, `check`, `kit`; `lib/` moved from `tools/tutorials/lib`; `checks/` rebuilt from the descriptions in the session's memory notes where the scratch scripts are gone; `data/facts.json` read from the product checkout.
- [ ] **M2 Scenes and the cache** (MP §3.3, §3.4): `scene.yaml`, capture keys, render keys, checkpoints, `models: fake` captures against the test nodes, the drift check.
  *Accept:* a second `build` with no change does no work; touching a watched file re-captures exactly the scenes that watch it; the drift check flags a scene after a deliberate CSS change.
- [ ] **M3 The tutorials as chapters** (MP §5): the twelve scripts split into scenes; path tutorials and how-to chapters defined in `tutorials/*.yaml`; narration in `copy/en.yaml`; thumbnails from the template.
  *Accept:* `build tutorials` produces every path tutorial and chapter; `check` passes; a rehearsal of all captures finishes without a broken locator.
- [ ] **M4 The films** F1, F4, F5, F6, F8, F9, F10 new; F2 and F3 from the spot projects with 2.0 screens (MP §2, §2.1); three formats where listed.
  *Accept:* every film passes `check` (loudness, cues, no frozen picture); the owner approves each storyboard's first render before the final one.
- [ ] **M5 Stills and texts**: README hero loop, bento pictures, diagrams, posters; posts and store texts from templates with facts (MP §2.2).
- [ ] **M6 The YouTube publisher** (MP §7): `publish/youtube.py` with `--auth`, `--plan`, `--apply`, `--release`, the quota planner, the description templates, captions, playlists, the write-back into `resources/media.toml`.
  *Accept:* tests against a fake API for upload, replace, update and the quota split; `--plan` against the real channel changes nothing (the owner runs it after the setup of MP §7.2).
- [ ] **M7 The kit**: `media.mjs kit 2.0.0` → films, stills, posts in posting order with days, store texts, the press page, a README that says how each piece was made and what is drawn or simulated.
- [ ] **M8 The owner's guides**: `Plenio-Media/docs/` - *A new version in six commands*, *YouTube setup once* (MP §7.2 as steps with pictures), *When a tutorial changes*, *What stays manual and why*.

---

## Phase R - release automation and 2.0.0

- [ ] **R0 Release tool** (MP §8.2; D1 and D2 first): `tools/release.py version|prepare|verify` covering version strings, builds, CHANGELOG check, `tools/release_notes.py` (from the session's scratch script) writing `docs/releases/<version>.md`, the package gate and its delta against 1.6.0, and `docs/security/review-<version>.md` generated from a template plus the delta.
  *Accept:* `release.py prepare 2.0.0` on a clean tree produces exactly the diff a hand-made release would; `verify` passes.
- [ ] **R1 `release.yml`** (MP §8.2): the tag workflow, `tools/verify_install.py`, the release created from `docs/releases/<version>.md`; `publish.yml` retired.
  *Accept:* a dry run on a throwaway tag in a fork or with `act` is described in the report; nothing is pushed by the agent.
- [ ] **R2 The Registry watcher**: `tools/registry_status.py` and the scheduled workflow that opens an issue in this repository on a status change.
- [ ] **R3 After the launch: the verdict** (PD §3.5): `registry_status.py` reads the verdict on 2.0.0; the table's consequence is applied in a 2.0.x; SECURITY.md and the review request are updated. (Not a condition of 2.0.0.)
- [ ] **R4 Migration**: *From 1.x to 2.0* complete; the refusals and messages of PD §11 checked in the running program; a 1.6.0 player state, three 1.x workflows and a 1.6.0 API client run against 2.0 in the host job.
- [ ] **R5 The full check** on the owner's machine: all tiers, the browser check, `bench.py` against the budgets, the real-model smoke suite, Setup from a clean base, the kit's films against the release build (`media status` shows nothing stale).
- [ ] **R6 `release.py prepare 2.0.0`**, the CHANGELOG with the intro, the release notes, the review request with the gate's delta against 1.6.0, the German hand-over with the steps of MP §9's T-0 and what is not verified.

**Exit:** the owner has tested 2.0.0 from the repository, the points found are fixed, and the owner publishes.

---

## Out of scope for 2.0

Recorded so that nobody builds it on the way: album mode (D-14), new music models, a WebGPU renderer, the standalone application (`docs/design/standalone-app-concept.md`), new visuals beyond the twelve signatures' tuning, audio dubbing of the tutorials, posting to social networks by script.
