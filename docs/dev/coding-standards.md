# Coding standards

- **English only** in code, comments, UI strings and docs (ADR-0008).
- **Relative imports inside `plenio`.** ComfyUI imports the package under a path-derived module name, so `import plenio` would fail at runtime.
- **Pure core.** `plenio.core` has no ComfyUI, torch or aiohttp imports and is fully typed (`mypy --strict`).
- **One module touches ComfyUI internals:** `plenio/comfy/host.py`. Nodes use `comfy_api.latest.io` for schemas and `host` for everything else.
- **Nodes are thin:** validate inputs, call core, return typed outputs, a UI payload (`plenio_summary`) and a report.
- **Errors are actionable.** Raise the `plenio.core.errors` types with a message (what happened) and a hint (what to do). Never swallow an error or pass input through on failure (R7).
- **Optional dependencies** go through `plenio.core.dependencies.require()`, which raises `PlenioDependencyError` with the install command. Nodes always register.
- **No speculative abstractions.** Plain functions and dataclasses; a registry or interface is added only when a second implementation exists.
- **Every schema string is versioned** (`plenio.report/1`, ...). Readers accept the current major version; changes go through a new version.
- **Tooltips on every input and output**, in the V3 schema (checked by the contract tests).
- Formatting and linting: `ruff format`, `ruff check`; line length 110.
