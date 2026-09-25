# Releases

Not started yet. Rules that apply from the first release:

- Published Registry versions are immutable; every fix is a new version.
- Before a release: all test suites green on Windows and Linux, the frontend build reproduces `web/js`, templates and blueprints validate, `CHANGELOG.md` updated, versions in `pyproject.toml` and `plenio/__init__.py` match.
- No local paths, private addresses, personal prompt text or credentials in shipped files (the tests scan for them).
- The public repository (`jplenio/comfyui-plenio-music`) is created at the first release; `pyproject.toml` already names it.
