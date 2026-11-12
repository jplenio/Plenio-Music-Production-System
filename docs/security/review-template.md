# Security review request: Plenio {version}

For the Comfy Registry's review of `comfyui-plenio-music` {version}. What the package does that a reviewer looks at,
and what changed since {previous}.

## What the package starts

The Registry package starts nothing but ComfyUI's own Python (`sys.executable`) with Plenio's own modules, in three
places, each with its command written as a list in the same function:

{launch_sites}

Everything else that starts a program - the Plenio Player starting ComfyUI, a `llama-server` for a GGUF writer, the
file manager - is the **Studio add-on** (`plenio/addons/`), which `.comfyignore` leaves out of this package; the full
download from GitHub carries it ([ADR-0012](../adr/0012-two-artefacts.md)).

## The gate's findings

`tools/package_gate.py` reads every Python file of the packed zip by its syntax tree and fails the build on any other
launch site, `shell=`, `os.system`/`os.startfile`/`os.exec*`, `eval`/`exec`, `pip`, `pickle`, or a script or binary
file. On {version}:

{findings}

## Against {previous}

{delta}

## Network

- Model files are fetched only from the catalogue (`resources/models.toml`: each file pinned to a commit, with its
  size and SHA-256), after the user's confirmation in Plenio Setup ([ADR-0014](../adr/0014-downloads-after-confirmation.md)).
- Every HTTP route declares an access class (`local`, `compute`, `data`, `api`); `local` routes answer this computer
  only; the Song API answers another computer only with a token ([SECURITY.md](../../SECURITY.md)).
