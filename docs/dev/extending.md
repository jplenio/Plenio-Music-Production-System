# Extending Plenio

Where each kind of extension goes, which files it touches and which check catches a forgotten step. The touch points of *new music engine* are taken from the MiniMax Music 3 addition (Phase 6, commit `5e3fb6c`), the others from the code as of the Phase 10 review ([acceptance report](../audit/2026-09-25-phase-10-acceptance.md)). Plain modules and tables, no plugin registry: a second implementation is added where the first one lives (target-architecture C-14).

## New music engine

| Step | Files | Guard |
|---|---|---|
| Rules module: document formats, style/caption rules, instrumental conventions, budget, ceiling, licence | `plenio/core/engines/<engine>.py`, registered in `ENGINES` (`plenio/core/engines/__init__.py`) | `MODULE_INTERFACE` and `WRITING_RULE_KEYS` in the same file, checked for every engine by `tests/unit/test_minimax.py::test_every_engine_module_provides_the_shared_interface`; unit tests for rules and budget with a fake tokenizer |
| Detection of the loaded model and an exact tokenizer handle | `detect_engine()` in `plenio/comfy/host.py` (by tokenizer class) | a contract test with the real tokenizer (`tests/contract/test_*_tokenizer.py`, needs `PLENIO_MODELS_DIR`) |
| Model and render blueprints, template, App configuration | `tools/build_graphs.py`; model files in `resources/models.toml`; native node types in `tools/snapshot_node_types.py` (`NATIVE_NODES`), then refresh `tools/data/node_types.json` | `tools/workflow_validation.py`, `tests/workflows/test_graphs.py`, `tests/host/test_foundation.py::test_the_node_type_snapshot_matches_the_server`, `tools/browser_check.mjs` |
| Hardware rows of the System Check | the `Rule` table in `plenio/core/system.py` has one column per engine | `tests/unit/test_dependencies_system.py` |
| Records | the engine's `LICENCE` is added to every record whose Song Sheet reports the engine; other non-commercial files of the engine go into `MODEL_LICENCES` (`plenio/core/release.py`) | `tests/unit/test_models_catalogue.py::test_release_records_name_every_non_commercial_model_file` |
| Tests and docs | a fake render node in `tests/host/plenio_test_nodes/fakes.py`, a host path test, a smoke test; `docs/user/paths/<engine>.md`, `docs/user/models.md`, `web/docs/` | `tests/unit/test_models_catalogue.py::test_the_model_guide_lists_every_catalogued_file`, `tests/unit/test_help_pages.py` |

Nothing else changes: Brief, Compose, Parse, Song Sheet and the editor adapt through `rules_for(engine_id)` and the `PLENIO_ENGINE` wire; the editor shows the style document under the engine's `STYLE_LABEL`. Known coupling: the cover writer (`plenio/core/writing.py`) uses YuE2's melody-register rule; a second cover engine moves that rule into its `writing_rules()`.

## New audio model (Refine, Stems)

The audio stages after rendering are one reusable shape: a **kind** (what a model is for), a **folder**
(`models/audio_sr`, `models/audio_separation`), an **adapter** that knows the file, and a stage that
runs it. Adding a second engine means adding an adapter, not a node.

| Step | Files | Guard |
|---|---|---|
| Adapter: `matches(file name)`, `load(path) -> engine` with the stage's contract (`input_rate`, `condition_hz`, `chunk_seconds`, `upsample` for Refine; `separate(samples, rate)` for Stems) | `plenio/comfy/<engine>.py`; register in `audio_models._ensure_registered()` (`plenio/comfy/audio_models.py`: `Adapter`, `register`, `load`, `require`) | unit test with a **fake model** for the contract, and that importing the adapter does not import torch (the registry is imported by the extension) |
| Model folder | `AUDIO_MODEL_FOLDERS` in `plenio/core/models.py`; registered with ComfyUI by `host.register_model_folders()` (a newly registered folder lists *no* files unless the extensions are set too) | host tests (`tests/host/conftest.py` writes an unreadable file per audio folder) |
| Vendored inference code (only when the upstream licence allows it) | `plenio/third_party/<name>/` with the upstream `LICENSE`, a `NOTICE.md` (pinned commit, per-file SHA-256, the deliberate changes), absolute imports made relative, `_compat.py` stand-ins for missing optional packages installed **only when the host lacks them** | `plenio/third_party` is excluded from ruff/mypy; the stand-ins and their honouring are unit-tested |
| Weights | one entry in `resources/models.toml` (`folder`, pinned URL, size, licence, role, `templates`/`optional_templates`); `.bin`, `.ckpt` and GitHub release URLs are accepted next to `.safetensors` | `tests/unit/test_models_catalogue.py`, `test_the_model_guide_lists_every_catalogued_file`, System Check readiness |
| Stage node and wiring | `plenio/comfy/nodes/<stage>.py` (the node keeps `is_experimental` until the owner's listening check accepts it), blueprint + group in `tools/build_graphs.py`, report into Export | `tools/workflow_validation.py`, `tests/workflows/test_graphs.py`, host tests with a fake model |
| Measurement | `tools/studies/<stage>_study.py` for the real-weight run (numbers, JSON report, listening material) | the report is committed; the listening verdict is the owner's |
| Docs | `docs/user/concepts/<stage>.md`, `docs/user/models.md`, `web/docs/<NodeId>.md` | `tests/unit/test_help_pages.py`, the model-guide test |

**Never** claim quality that was not measured: the adapters report what they did (bandwidth before/after,
residual share, gain reduction) and the studies record the rest; `PROVISIONAL`/`is_experimental` markers
come off only with the owner's verdict.

## New template

1. A function in `tools/build_graphs.py` that returns the graph and its App configuration (`App`: widget list and output nodes); follow the anatomy of the existing templates (numbered groups, one *About this template* note, collapsed model block, *(optional)* titles for bypassed blocks). Song Sheets come from `song_sheet()` (review *as the brief says*, the title as the editor button's label) and belong into the app, the brief's *mode* first (`tests/workflows/test_graphs.py::test_app_configurations`).
2. `python tools/build_graphs.py`, `python tools/build_thumbnails.py` (needs Pillow), `python tools/workflow_validation.py`. Never edit the JSON by hand.
3. Model files the template loads: `templates` / `optional_templates` in `resources/models.toml` (the System Check's readiness table follows).

## New model file

One entry in `resources/models.toml` (file, folder, pinned URL, size, licence, role, templates). `tools/build_graphs.py` writes the loader's download entry from it; the System Check lists it; `docs/user/models.md` must name it (test). A non-commercial file also needs a `MODEL_LICENCES` entry (test above).

## New score operation

Two paths exist and the difference matters:

- **Canonical operations (use these for anything graphical).** `plenio/core/score/ops.py` edits the *model* (`canonical.Score`) and prints a new text; `transform(text, op)` is the commit path. Ids are stable element ids (`vocal:<onset>`, `ins:<onset>`, `chord:<onset>`, bars 1-based) and the names are disjoint from the Phase 5 ones. The text is re-parsed and validated after every edit (S6), and unchanged measures stay byte-identical (S2/S5). Guards: `tests/unit/test_score_ops.py` (examples + a hypothesis state machine) and `tests/unit/test_score_canonical.py`.
- **The Phase 5 operations** (`plenio/core/score/edit.py`, element ids) are the older path and are kept unchanged until F1 decides their fate (owner decision); their tests pin exact texts and ids.

A new canonical operation needs: the operation in `ops.py`, its entry in the dispatch table, the view
contract if it shows up in the editor (`plenio/core/score/operations.py` builds `view.model` with
tracks/segments → element ids), the gesture in the frontend (`pianoRoll.ts` for the roll,
`inspector.ts` for the fields, both committing **one** operation per gesture through
`useScoreSession.ts`), and tests on both sides - `frontend/tests/pianoRoll.test.ts`,
`inspector.test.ts` and the session tests. The editor's commit gate refuses a malformed text with a
reason and offers *Revert to last valid*; do not let any gesture write text the upstream parser refuses.
Whole-score operations the graph should offer also become a DynamicCombo option of Score Tools
(`plenio/comfy/nodes/score_tools.py`), e.g. *new score from brief* (`plenio/core/score/skeleton.py`).

## New ASR engine

An `AsrEngine` entry in `ENGINES` (`plenio/core/asr.py`) and a worker in `plenio/workers/` (protocol: `plenio/core/workers/`); an engine that conflicts with ComfyUI's packages runs in an isolated environment (AS-11, mechanism verified in Phase 4B). Transcribe Lyrics gets an `engine` widget once a second engine exists. The ASR cache key includes the engine and model revision, so drafts stay reproducible.

## New mastering stage or export format

- DSP in `plenio/core/audio/`, a node in `plenio/comfy/nodes/`, its place in the *Plenio · Master* blueprint (`tools/build_graphs.py`); bypass must leave audio, rate and metadata unchanged (`tests/host/test_production_path.py::test_bypassed_stages_change_nothing`).
- A format is one entry in `FORMATS` (`plenio/core/release.py`), a widget on Export Release and the `format` enum of `resources/schemas/record-1.schema.json` (`tests/contract/test_data_schemas.py`).

## New document type

`DOCUMENT_KINDS` (`plenio/core/sheet/state.py`), the Song Sheet's inputs and outputs, an editor tab, and the `documents` names in `resources/schemas/record-1.schema.json`. Every schema string is versioned: a change that old readers cannot read gets a new major version.

## Other LLMs and image models

No code: replace `TextGenerate` inside *Plenio · Write Song* with any node that turns a prompt `STRING` into a `STRING`, or replace *Plenio · Cover Art* with any text-to-image blueprint that takes a prompt and returns an `IMAGE`. Local models need no replacement: *Write Song*'s writer model already lists them (Writer Choice routes to **Local LLM**, ADR-0010).

## Another local LLM app or model folder

`plenio/core/llm` is standard library only and knows nothing about songs (reuse it as is). A new app with an OpenAI-compatible server is one `Server` row in `known_servers()` (`catalog.py`: name, default address, `start_hint`, `api_key_env` if it needs a key); a different wire protocol is one function next to `_openai`/`_ollama` in `client.py`. A new app folder is one `Store` in `app_stores()` (`hf_cache=True` for the Hugging Face layout). A new place where a `llama-server` program lives is one candidate in `runtime.find_runtimes()`. Guards: `tests/unit/test_llm.py` (fake servers and a fake `llama-server` script; no model, no network).
