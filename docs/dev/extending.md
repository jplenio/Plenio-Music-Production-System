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

## New template

1. A function in `tools/build_graphs.py` that returns the graph and its App configuration (`App`: widget list and output nodes); follow the anatomy of the existing templates (numbered groups, one *About this template* note, collapsed model block, *(optional)* titles for bypassed blocks).
2. `python tools/build_graphs.py`, `python tools/build_thumbnails.py` (needs Pillow), `python tools/workflow_validation.py`. Never edit the JSON by hand.
3. Model files the template loads: `templates` / `optional_templates` in `resources/models.toml` (the System Check's readiness table follows).

## New model file

One entry in `resources/models.toml` (file, folder, pinned URL, size, licence, role, templates). `tools/build_graphs.py` writes the loader's download entry from it; the System Check lists it; `docs/user/models.md` must name it (test). A non-commercial file also needs a `MODEL_LICENCES` entry (test above).

## New score operation

`plenio/core/score/edit.py` (the operation, with its invariants and refusals) and one entry in `OPERATIONS` (`plenio/core/score/operations.py`); the `/plenio/score/transform` route and the editor's session pick it up; a button or shortcut in `frontend/src/sheet-editor/score/ScorePalette.vue` or `ScoreTab.vue`. Whole-score operations that the graph should offer also become a DynamicCombo option of Score Tools (`plenio/comfy/nodes/score_tools.py`, covered by `tests/host/test_score_tools_node.py`). Tests: `tests/unit/test_score_editor.py` (untouched bars byte-identical, refusals) and the operation fuzzing described in the Phase 9 audit.

## New ASR engine

An `AsrEngine` entry in `ENGINES` (`plenio/core/asr.py`) and a worker in `plenio/workers/` (protocol: `plenio/core/workers/`); an engine that conflicts with ComfyUI's packages runs in an isolated environment (AS-11, mechanism verified in Phase 4B). Transcribe Lyrics gets an `engine` widget once a second engine exists. The ASR cache key includes the engine and model revision, so drafts stay reproducible.

## New mastering stage or export format

- DSP in `plenio/core/audio/`, a node in `plenio/comfy/nodes/`, its place in the *Plenio · Master* blueprint (`tools/build_graphs.py`); bypass must leave audio, rate and metadata unchanged (`tests/host/test_production_path.py::test_bypassed_stages_change_nothing`).
- A format is one entry in `FORMATS` (`plenio/core/release.py`), a widget on Export Release and the `format` enum of `resources/schemas/record-1.schema.json` (`tests/contract/test_data_schemas.py`).

## New document type

`DOCUMENT_KINDS` (`plenio/core/sheet/state.py`), the Song Sheet's inputs and outputs, an editor tab, and the `documents` names in `resources/schemas/record-1.schema.json`. Every schema string is versioned: a change that old readers cannot read gets a new major version.

## Other LLMs and image models

No code: replace `TextGenerate` inside *Plenio · Write Song* with any node that turns a prompt `STRING` into a `STRING`, or replace *Plenio · Cover Art* with any text-to-image blueprint that takes a prompt and returns an `IMAGE`.
