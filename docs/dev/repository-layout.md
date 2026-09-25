# Repository layout

```text
__init__.py              ComfyUI entry: comfy_entrypoint + WEB_DIRECTORY
pyproject.toml           package metadata, [tool.comfy], pytest/ruff/mypy settings
plenio/core/             pure domain library (no ComfyUI imports)
plenio/comfy/            V3 nodes, IO types, routes, host adapter
plenio/workers/          worker entry points (python -m plenio.workers.<name>)
plenio/third_party/      unchanged upstream code (hash-pinned)
frontend/                TypeScript/Vue sources, Vite build, Vitest tests
web/js/                  built frontend (committed; ComfyUI loads every *.js here)
web/docs/                node help pages (<NodeId>.md)
subgraphs/               blueprints (served by ComfyUI via /global_subgraphs)
example_workflows/       templates (listed in the template browser)
resources/               assets catalogue, JSON schemas, templates, presets
docs/                    user/, dev/, design/, adr/, test-reports/
tests/                   unit/, contract/, workflows/, host/, fixtures/
tools/                   validators, node-type snapshot, dev server
```

Only these folders are copied into a test ComfyUI installation (`tests/host/harness.py`): `__init__.py`, `pyproject.toml`, `LICENSE`, `plenio`, `web`, `subgraphs`, `example_workflows`, `resources`, `locales`.
