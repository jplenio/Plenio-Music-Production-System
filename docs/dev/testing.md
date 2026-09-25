# Testing

Strategy and verification levels: [docs/design/testing-strategy.md](../design/testing-strategy.md). Phase reports state the highest level actually executed (V1 unit/mocked, V2 host integration with fakes, V3 real model output, V4 listening/study).

## Setup

Tests run with **ComfyUI's Python** (it has torch, numpy, av, jsonschema). Dev tools are installed into a project-local folder so that ComfyUI's environment is not changed:

```bash
<ComfyUI python> -m pip install --target .devdeps "pytest==8.4.*" "hypothesis==6.*" "ruff==0.13.*" "mypy==1.18.*"
```

Frontend: `cd frontend && npm ci`.

## Commands

| What | Command (bash; on PowerShell set the variables with `$env:NAME = "..."`) |
|---|---|
| unit, workflow and data-contract tests | `PYTHONPATH=.devdeps <python> -m pytest tests/unit tests/workflows tests/contract/test_data_schemas.py` |
| node-schema contract tests | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/contract` |
| host integration (starts real ComfyUI servers on the CPU) | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/host` |
| side-by-side with the legacy toolkit | add `PLENIO_LEGACY_NODE_DIR=<installed legacy toolkit>` |
| real-model smoke tests (GPU, slow) | add `PLENIO_SMOKE=1` and `PLENIO_MODELS_DIR=<models>` |
| lint / format / types | `PYTHONPATH=.devdeps <python> -m ruff check . && ... -m ruff format --check . && ... -m mypy` |
| templates and blueprints | `<python> tools/workflow_validation.py` |
| frontend | `cd frontend && npm run check` (types, Vitest, build) |

Host tests use an isolated base directory (`--base-directory`, `--disable-all-custom-nodes` with a whitelist): the user's custom nodes, user data and outputs are never touched.

## Manual checks in the browser

`<python> tools/dev_server.py --test-nodes` starts an isolated ComfyUI with Plenio and the test nodes and prints its URL. Use it for frontend checks that need the real ComfyUI frontend (custom widgets, bypass, blueprints in the node library).

## Refreshing the node-type snapshot

After upgrading ComfyUI: `PLENIO_COMFYUI_ROOT=<ComfyUI> <python> tools/snapshot_node_types.py`, then re-run the workflow tests.
