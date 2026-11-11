# Testing

Strategy and verification levels: [docs/design/testing-strategy.md](../design/testing-strategy.md). Phase reports state the highest level actually executed (V1 unit/mocked, V2 host integration with fakes, V3 real model output, V4 listening/study).

## Setup

Tests run with **ComfyUI's Python** (it has torch, numpy, av, jsonschema). Dev tools are installed into a project-local folder so that ComfyUI's environment is not changed:

```bash
<ComfyUI python> -m pip install --target .devdeps "pytest==8.4.*" "pytest-xdist==3.8.*" "hypothesis==6.*" "ruff==0.13.*" "mypy==1.18.*" "pyloudnorm==0.2.*"
```

`pyloudnorm` is the loudness oracle of `tests/unit/test_audio.py` (skipped without it). The cover-art tests read the embedded picture back with PyAV (Pillow is needed for the JPEG).

Frontend: `cd frontend && npm ci`.

## Commands

| What | Command (bash; on PowerShell set the variables with `$env:NAME = "..."`) |
|---|---|
| unit, workflow and data-contract tests | `PYTHONPATH=.devdeps <python> -m pytest tests/unit tests/workflows tests/contract/test_data_schemas.py -n auto` (without `-n auto` one process) |
| the same without the slow dozen (while working on a change) | add `-m "not io and not process"` |
| node-schema contract tests | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/contract` |
| host integration (starts real ComfyUI servers on the CPU) | `PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <python> -m pytest tests/host` |
| side-by-side with the legacy toolkit | add `PLENIO_LEGACY_NODE_DIR=<installed legacy toolkit>` |
| real-model smoke tests (GPU, slow) | add `PLENIO_SMOKE=1` and `PLENIO_MODELS_DIR=<models>` |
| S-1, S-2, S-6 (YuE2 Song sung / instrumental, writer) and Cover Art | `PLENIO_SMOKE=1 PLENIO_MODELS_DIR=<models> ... pytest tests/host/test_song_models.py tests/host/test_cover_art_models.py` (GPU; `-s` prints timings) |
| S-7 mastering smoke (CPU, no model) | `PLENIO_SMOKE=1 PLENIO_COMFYUI_ROOT=<ComfyUI> <python> -m pytest tests/host/test_master_smoke.py`; the take is `assets/sound-samples/Example Album - A Feeling With No Address.mp3` or `PLENIO_LEGACY_SAMPLE=<audio file>` |
| coverage of the unit tier (per-test contexts) | `PYTHONPATH=.devdeps <python> -m coverage run --rcfile=tools/coverage.ini -m pytest tests/unit tests/workflows tests/contract/test_data_schemas.py -p no:randomly`, then `... -m coverage report --rcfile=tools/coverage.ini` (one process: about 3.5 min) |
| Song API v1 against 1.6.0's answers | in the host tier (`tests/host/test_api_v1_golden.py`); record again only from 1.6.0: `python tools/api_v1_golden.py --url <a 1.6.0 server> --base <its base> --record tests/fixtures/api-v1` |
| lint / format / types | `PYTHONPATH=.devdeps <python> -m ruff check . && ... -m ruff format --check . && ... -m mypy` |
| templates and blueprints | `<python> tools/workflow_validation.py` (also: no two groups or nodes overlap, no embedded definition is unused, no two blueprints share a node id) |
| frontend | `cd frontend && npm run check` (types, Vitest, build) |

**Markers for slow tests.** `process` marks a test that starts a real process (a player, a worker, a fake `llama-server`), `io` one that waits for a socket (a refused connection takes Windows two seconds). Everything else is the fast tier. Measured on 2026-11-11 (Windows, the reference machine, 24 threads): the whole command 81-89 s in one process, 20-22 s with `-n auto` (`pytest-xdist`); the fast tier 56 s in one process. Every test server binds port 0, so the workers never compete for a port.

**What keeps the tests quick** (`tests/conftest.py`): servers started inside the test process look for their shutdown every 20 ms (the standard library's half second made every `shutdown()` wait), and passwords set in tests are hashed with 1 000 PBKDF2 rounds - the player's own number is asserted once, in `test_player_accounts.py`. A test that needs free ports takes them with an exclusive bind instead of waiting for refusals. The two torch adapter suites (`test_msst_adapter.py`, `test_universr_adapter.py`) live in `tests/contract`, where the CI installs torch; in `tests/unit` the CI skipped them.

Host tests use an isolated base directory (`--base-directory`, `--disable-all-custom-nodes` with a whitelist): the user's custom nodes, user data and outputs are never touched.

## Benchmark

`tools/bench.py` orders fixed briefs through the Song API of a running ComfyUI (three runs each, fixed seeds), reads every song's release record and reports the seconds per group of the template, the part spent loading models and the peak memory on the graphics card (`timings`, since 2.0). `--compare <older.json>` marks a brief that got slower by more than 10 % and exits with 1. `--fake` checks the tool itself against canned answers. Reports go to `docs/test-reports/data/bench-<label>.json`.

```bash
<python> tools/bench.py --api http://127.0.0.1:8188 --label 2.0.0 --card "<your card>" [--source <recording for the cover brief>]
```

## Browser checks of the templates

`tools/browser_check.mjs` loads every template in the real ComfyUI frontend and checks: load (widget values as shipped, no Plenio console errors, no node-id renumbering), save/reload (widget values and API prompt identical), optional blocks on/off and Master bypassed (the frontend's API prompt has the expected shape and the server validates it), summaries (after a run every node's summary shows at least four lines, no text field is squeezed below 60 px, no node overlaps another once nodes grew), status (before a run every Song Sheet says whether it stops for review, matching the brief's mode), App Mode (configured controls shown, configuration kept). Run it after every change to a template, a blueprint or a node's widgets - the validator cannot see what the frontend adds (a seed's *control after generate*, the height of DOM widgets). It needs a running server whose models folder holds files with the catalogue's names - empty files are enough, the server only validates the names:

```bash
<python> tools/dev_server.py --port 8190 --base <dir> --models <dir with empty model files>
node tools/browser_check.mjs --url http://127.0.0.1:8190 [--chromium <path> | --channel msedge] --out <dir>
```

Put `cover_source.flac` and `browser-check.flac` (any short audio) into `<dir>/input`. Playwright: the global `playwright` package or `playwright-core` with a system browser (`--channel chrome` / `msedge`).

## Generated files

- The model catalogue's revisions, sizes and hashes: `tools/catalogue_check.py --write` (reads the hosts' headers; `--check` compares, weekly in the CI).
- Templates and blueprints: `tools/build_graphs.py` (reads `resources/models.toml` for the loaders' download entries); never edit the JSON by hand.
- Thumbnails: `<python with Pillow> tools/build_thumbnails.py` writes `example_workflows/<template>.jpg`.

## Manual checks in the browser

`<python> tools/dev_server.py --test-nodes` starts an isolated ComfyUI with Plenio and the test nodes and prints its URL. Use it for frontend checks that need the real ComfyUI frontend (custom widgets, bypass, blueprints in the node library).

## Refreshing the node-type snapshot

After upgrading ComfyUI: `PLENIO_COMFYUI_ROOT=<ComfyUI> <python> tools/snapshot_node_types.py`, then `tools/build_graphs.py` (it takes the native nodes' slots from the snapshot) and the workflow tests.

Take the snapshot from the **release tag** the CI checks out (`v0.41.0` in `.github/workflows/ci.yml`; the reference since 2026-10-19, before it `v0.37.0`), not from a `master` checkout: past a tag ComfyUI still calls itself by the tag's number, but its native nodes can differ (`TextGenerate` gained a `system_prompt` input and a `thinking` output past `v0.37.0`, and the CI failed on the 0.3.0 push). The tool refuses a checkout that is not exactly on a tag (`--allow-untagged` overrides it). A local clone of the tag works without touching the installed ComfyUI: `git clone --branch v0.41.0 --depth 1 file:///<ComfyUI> <dir>`, then `PLENIO_COMFYUI_ROOT=<dir>`. The snapshot records the checkout (`comfyui_ref`); the host test compares native nodes only on the same checkout, Plenio's own nodes always.

## DSP golden data and studies

- `tests/fixtures/dsp/golden-legacy-dsp.{npz,json}`: outputs of the legacy toolkit's EQ, compressor, limiter and tone match on a deterministic signal. Regenerate only when the port is meant to change: `<python with numpy+scipy> tools/studies/golden_legacy_dsp.py <legacy toolkit folder>` (the legacy modules are copied into a scratch folder; the legacy repository is not modified).
- Restoration gate (Phase 7, C1): `<python> tools/studies/restoration_gate.py <out.json> <audio files ...>` measures clipping, inter-sample overs, spectral roll-off and HF balance. Run it on **unprocessed** takes (Export's `(original)` files).
