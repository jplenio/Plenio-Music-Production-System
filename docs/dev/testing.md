# Testing

Strategy and verification levels: [docs/design/testing-strategy.md](../design/testing-strategy.md). Phase reports state the highest level actually executed (V1 unit/mocked, V2 host integration with fakes, V3 real model output, V4 listening/study).

## Setup

Tests run with **ComfyUI's Python** (it has torch, numpy, av, jsonschema). Dev tools are installed into a project-local folder so that ComfyUI's environment is not changed:

```bash
<ComfyUI python> -m pip install --target .devdeps "pytest==8.4.*" "hypothesis==6.*" "ruff==0.13.*" "mypy==1.18.*" "pyloudnorm==0.2.*"
```

`pyloudnorm` is the loudness oracle of `tests/unit/test_audio.py` (skipped without it). `mutagen` is optional: with it installed, the cover-art tests also check embedding.

Frontend: `cd frontend && npm ci`.

## Commands

| What | Command (bash; on PowerShell set the variables with `$env:NAME = "..."`) |
|---|---|
| unit, workflow and data-contract tests | `PYTHONPATH=.devdeps <python> -m pytest tests/unit tests/workflows tests/contract/test_data_schemas.py` |
| node-schema contract tests | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/contract` |
| host integration (starts real ComfyUI servers on the CPU) | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/host` |
| side-by-side with the legacy toolkit | add `PLENIO_LEGACY_NODE_DIR=<installed legacy toolkit>` |
| real-model smoke tests (GPU, slow) | add `PLENIO_SMOKE=1` and `PLENIO_MODELS_DIR=<models>` |
| S-1, S-2, S-6 (YuE2 Song sung / instrumental, writer) and Cover Art | `PLENIO_SMOKE=1 PLENIO_MODELS_DIR=<models> ... pytest tests/host/test_song_models.py tests/host/test_cover_art_models.py` (GPU; `-s` prints timings) |
| S-7 mastering smoke (CPU, no model) | `PLENIO_SMOKE=1 PLENIO_COMFYUI_ROOT=<ComfyUI> <python> -m pytest tests/host/test_master_smoke.py`; the take is the legacy MiniMax sample next to the project or `PLENIO_LEGACY_SAMPLE=<audio file>` |
| lint / format / types | `PYTHONPATH=.devdeps <python> -m ruff check . && ... -m ruff format --check . && ... -m mypy` |
| templates and blueprints | `<python> tools/workflow_validation.py` |
| frontend | `cd frontend && npm run check` (types, Vitest, build) |

Host tests use an isolated base directory (`--base-directory`, `--disable-all-custom-nodes` with a whitelist): the user's custom nodes, user data and outputs are never touched.

## Browser checks of the templates

`tools/browser_check.mjs` loads every template in the real ComfyUI frontend and checks: load (widget values as shipped, no Plenio console errors, no node-id renumbering), save/reload (widget values and API prompt identical), optional blocks on/off and Master bypassed (the frontend's API prompt has the expected shape and the server validates it), App Mode (configured controls shown, configuration kept). It needs a running server whose models folder holds files with the catalogue's names - empty files are enough, the server only validates the names:

```bash
<python> tools/dev_server.py --port 8190 --base <dir> --models <dir with empty model files>
node tools/browser_check.mjs --url http://127.0.0.1:8190 [--chromium <path> | --channel msedge] --out <dir>
```

Put `cover_source.flac` and `browser-check.flac` (any short audio) into `<dir>/input`. Playwright: the global `playwright` package or `playwright-core` with a system browser (`--channel chrome` / `msedge`).

## Generated files

- Templates and blueprints: `tools/build_graphs.py` (reads `resources/models.toml` for the loaders' download entries); never edit the JSON by hand.
- Thumbnails: `<python with Pillow> tools/build_thumbnails.py` writes `example_workflows/<template>.jpg`.

## Manual checks in the browser

`<python> tools/dev_server.py --test-nodes` starts an isolated ComfyUI with Plenio and the test nodes and prints its URL. Use it for frontend checks that need the real ComfyUI frontend (custom widgets, bypass, blueprints in the node library).

## Refreshing the node-type snapshot

After upgrading ComfyUI: `PLENIO_COMFYUI_ROOT=<ComfyUI> <python> tools/snapshot_node_types.py`, then re-run the workflow tests.

## DSP golden data and studies

- `tests/fixtures/dsp/golden-legacy-dsp.{npz,json}`: outputs of the legacy toolkit's EQ, compressor, limiter and tone match on a deterministic signal. Regenerate only when the port is meant to change: `<python with numpy+scipy> tools/studies/golden_legacy_dsp.py <legacy toolkit folder>` (the legacy modules are copied into a scratch folder; the legacy repository is not modified).
- Restoration gate (Phase 7, C1): `<python> tools/studies/restoration_gate.py <out.json> <audio files ...>` measures clipping, inter-sample overs, spectral roll-off and HF balance. Run it on **unprocessed** takes (Export's `(original)` files).
