# The full check before 2.0.0 (phase R5), 2026-11-12

On the reference machine (Windows 11, RTX 5060 Ti 16 GB as the second card for GPU work, Playwright's Chromium), the tree after the fixes of checkpoint 5 (`099bcc8`).

| Check | Result |
|---|---|
| fast and io tiers (`tests/unit`, `tests/workflows`, the data schemas, `-n auto`) | 2 680 passed, 1 skipped, 24 s |
| host tier on ComfyUI 0.41.0 (`git archive` of the tag) | 324 passed, 18 skipped, 6:21 |
| host tier on ComfyUI 0.44.2 (`git archive` of the tag) | 324 passed, 18 skipped (on `aba6604`, before the last fixes, which change only the player) |
| frontend (Vitest) | 837 passed |
| lint, format, types | ruff, ruff format, mypy: clean |
| facts, doc check, media links, workflow validation (also against both tags' native nodes), package gate | all pass; the gate: no finding, 9 findings of 1.6.0 gone |
| browser check of every template (dev server, empty model files) | 109 of 111; the two failures are the ones known before 2.0 (Cover Brief's description squeezed to 51 px; Enhance & Master's optional Lyrics sheet says it stops) |
| Plenio Setup from a clean base (the local stand-in for Hugging Face, `tools/setup_check.mjs`) | 10 of 10 |
| the real-model smoke suite (`PLENIO_SMOKE=1`, GPU 1: YuE2 sung and instrumental, cover with ASR, MiniMax, cover art, arrangement, mastering, HQ) | 13 passed, 16:47 |
| benchmark against the budgets (`bench.py --check docs/test-reports/data/bench-2.0.0-phase-8-before.json`) | every brief within its budget per second of song ([the report](2026-11-12-bench-2.0.md)) |
| the release zip and the install check (`build_release_assets.py`, `verify_install.py --zip`) | 664 files with the Studio add-on; the packed Registry zip in a fresh ComfyUI 0.44.2: 39 nodes, 6 templates, 14 blueprints, no add-on |
| Song API from another computer (live) | v1 and v2 refuse without a token, with the fix in the hint; `/plenio/system` 403 |
| the kit's films against the release build (`media.mjs status`) | the hero film renders again after the version change (its facts are in its render key); its captures stay |

**Not run here:** the CI on GitHub (it runs after the push); the release workflow (a tag); the mutation runs of five modules and the rate after the new tests (stopped for low memory, [the report](2026-11-12-mutation.md)); measurements on a phone (7.1) and with a free second card (8.3). **Not heard:** the songs of the smoke suite and the benchmark were measured, not listened to.
