# Releases

Published Registry versions are immutable: every fix is a new version.

## Before a release

1. Version in `pyproject.toml` (`[project].version`), `plenio/__init__.py` and `frontend/package.json` (+ `package-lock.json`); a `CHANGELOG.md` section with the date.
2. All suites green: the CI on GitHub (Ubuntu + Windows, ComfyUI host job, frontend with the build check) and, on the owner's machine, the full suite with the real models (`PLENIO_SMOKE=1`, `docs/dev/testing.md`).
3. `tools/build_graphs.py` and `tools/build_thumbnails.py` leave no diff; `tools/workflow_validation.py` passes.
4. Package check: `comfy node validate` and `comfy node pack` (comfy-cli), then look into `node.zip`: the 5 templates, 10 blueprints, `plenio/`, `web/`, `resources/` and `docs/user/` must be there, `tests/`, `tools/`, `frontend/`, `assets/` and the rest of `docs/` must not (`.comfyignore`). Delete `node.zip` afterwards.
5. No local paths, private addresses, personal prompt text or credentials in shipped files (`tests/unit/test_import_boundary.py`).

## Publishing

1. Commit and push to `main`.
2. Create a GitHub release with the tag `v<version>` (for example `v0.2.0`) and the changelog section as its text. The workflow `.github/workflows/publish.yml` attaches these files itself (`tools/build_release_assets.py`; locally: `python tools/build_release_assets.py`, needs comfy-cli, writes `dist/v<version>/`): the packed node as `Plenio-Music-Production-System-v<version>.zip` (the content of `comfy node pack` under one top folder, so it unpacks straight into `custom_nodes`), the five templates as `Plenio <template> v<version>.json`, and `SHA256SUMS.txt`. Install the zip once into a fresh ComfyUI after the release (14 nodes, 10 blueprints, 5 templates, no import error).
3. Publishing the release runs `.github/workflows/publish.yml`, which uploads the version to the Comfy Registry (publisher `jplenio`, package `comfyui-plenio-music`). It needs the repository secret `REGISTRY_ACCESS_TOKEN` (a token from the Registry's publisher page). The workflow can also be started by hand (*Actions → Publish to Comfy Registry → Run workflow*).
4. Check the package page on the Registry and install it once through the ComfyUI Manager.

The Registry's icon and banner are the raw GitHub URLs of `assets/branding/icon.png` and `assets/branding/banner.png` (`[tool.comfy]` in `pyproject.toml`); they must exist on `main` before publishing.

## Demo gallery

The listening page is GitHub Pages from the `docs/` folder of `main` (`docs/index.html`, `docs/.nojekyll` so the other documents are not processed); every push to `main` publishes it. Three collections, one tab each (`#plenio`, `#songs`, `#covers` link to them):

- **Songs from Plenio** - `docs/demo-plenio.js`, covers in `docs/assets/demo-plenio/`. Built by `python tools/build_demo_catalog.py <folder with *.plenio.json>` from the release records of a batch: one song per brief template (length against the brief, Song Sheet warnings, a render that matches the template's vocals, distinct titles; `--pick TEMPLATE=FILE` overrides a choice). It also writes the upload checklist `docs/demo-plenio-upload.md` (files, SoundCloud titles, descriptions, tags, alternatives per genre). Running it again keeps the `soundcloudUrl` and `comment` values typed into the catalog and its config.
- **MiniMax Music 3** and **YuE2 Cover** - `docs/demo-tracks.js`, `docs/demo-covers.js`, images in `docs/assets/demo-covers/`; built with the predecessor toolkit's scripts, new entries are added by hand in the same format.

Audio is streamed from SoundCloud: a track's `soundcloudUrl` is its public SoundCloud URL (a player loads when the visitor presses play; without a URL the card says *Coming to SoundCloud*), and the playlist button of a tab uses that catalog's `soundcloudPlaylistUrl`. The page loads nothing else from third parties.
