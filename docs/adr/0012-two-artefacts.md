# ADR-0012: Two artefacts - the Registry package starts no other program

Date: 2026-11-11. Status: accepted (owner's decision D-1, [2.0 product design](../design/v2-product-design.md) section 3).

## Context

Every version from 1.2.1 to 1.5.1 carries a manual verdict of the Comfy Registry's review: *arbitrary-file-launch* or *command-injection*. The hardening of 1.4.0 removed the disclosure and file-read classes from the verdicts; the launch classes stayed. Three functions matched them: the Plenio Player starting ComfyUI (a Python and arguments from settings), a `llama-server` program found by configuration, PATH or other apps' folders, and Explorer started with a command line built as one string. None of them is needed to make a song in ComfyUI.

## Decision

One repository, two artefacts.

- The **Comfy Registry package** starts nothing but `sys.executable` with Plenio's own modules, at three places (`plenio/core/workers/protocol.py`, `plenio/player/launch.py`, `plenio/core/llm/runtime.py`), each with a command written as a list in the same function.
- The three functions live in the **Studio add-on**, `plenio/addons/` (`studio_launcher`, `llm_server`, `file_manager`), which `.comfyignore` leaves out of the package together with the two start scripts. A `git clone` and the release zip carry it.
- Nothing imports the add-on directly. Callers ask `plenio.core.features.has(...)`, load it through `features.load(...)`, and without it answer with a sentence that says what to do instead. `PLENIO_ADDONS=0` switches it off on a full installation.
- `tools/package_gate.py` checks the packed zip by syntax tree and fails the build on any other launch site (and on `eval`/`exec`, `pip`, `pickle`, scripts and binaries). The CI runs it; it also prints the delta against a version for a review request.
- Every HTTP route declares an access class (`plenio.core.access`): `local`, `compute`, `data` or `api`.

## Consequences

- Registry users lose three conveniences and the double-click start scripts; each has a stated replacement (the player finds a running ComfyUI; GGUF through a running app or llama-cpp-python, else ComfyUI's own Gemma; a folder's path with *Copy*; the player opened from ComfyUI).
- Host tests run the package without the add-on, so the Registry form is what CI exercises; `tests/unit/test_addons.py` covers both forms.
- A new function that starts a program belongs in the add-on, behind `features.has`, with its degraded sentence and a test for both.
- The verdict on the new boundary is learned on 2.0.0 itself (no canary release: owner's decision 2026-11-11). If a verdict names a remaining module, that module moves behind the same seam.
