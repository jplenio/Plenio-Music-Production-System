# Architecture overview

The engineering source of truth is [docs/design](../design/README.md); this page is the short version.

```text
frontend (web/js)  ->  /plenio/* routes  ->  plenio.core
plenio.comfy.nodes ->  plenio.core
plenio.comfy.nodes ->  plenio.comfy.host  ->  ComfyUI internals
```

- **`plenio.core`** - pure Python domain library: documents, scores, lyrics, engine rules, sheet resolution, DSP, release, assets, workers. It never imports ComfyUI, torch or aiohttp (enforced by `tests/unit/test_import_boundary.py`).
- **`plenio.comfy`** - thin adapters: V3 node schemas and `execute` methods, custom IO types, HTTP routes, and `host.py`, the only module that touches ComfyUI internals.
- **Graph assets** - blueprints in `subgraphs/` and templates in `example_workflows/` are the orchestration layer; there is no Plenio orchestration engine.
- **Frontend** - TypeScript sources in `frontend/`, built into `web/js/plenio.js`. It edits documents and displays results; all musical truth is computed by the backend.

Rules that bind every phase are listed in [target-architecture.md section 2](../design/target-architecture.md). The most important: native first, one owner per setting, manual text wins, what leaves the Song Sheet reaches the model unchanged, no silent degradation, ComfyUI owns GPU memory.
