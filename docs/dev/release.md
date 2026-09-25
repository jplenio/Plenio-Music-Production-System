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
2. Create a GitHub release with the tag `v<version>` (for example `v0.2.0`) and the changelog section as its text.
3. Publishing the release runs `.github/workflows/publish.yml`, which uploads the version to the Comfy Registry (publisher `jplenio`, package `comfyui-plenio-music`). It needs the repository secret `REGISTRY_ACCESS_TOKEN` (a token from the Registry's publisher page). The workflow can also be started by hand (*Actions → Publish to Comfy Registry → Run workflow*).
4. Check the package page on the Registry and install it once through the ComfyUI Manager.

The Registry's icon and banner are the raw GitHub URLs of `assets/branding/Plenio-Music-Production-System-Icon.png` and `assets/branding/Plenio-Music-Production-System-Banner.png` (`[tool.comfy]` in `pyproject.toml`); they must exist on `main` before publishing.

## Demo gallery

The listening page is GitHub Pages from the `docs/` folder of `main` (`docs/index.html`, `docs/demo-tracks.js`, `docs/demo-covers.js`, images in `docs/assets/demo-covers/`, `docs/.nojekyll` so the other documents are not processed). Audio is streamed from SoundCloud: a track's `soundcloudUrl` is its public SoundCloud URL, and the playlist button uses `soundcloudPlaylistUrl`. The catalog was built with the predecessor toolkit's scripts; new entries are added by hand in the same format.
