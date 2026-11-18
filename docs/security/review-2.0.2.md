# Security review request: Plenio 2.0.2

For the Comfy Registry's review of `comfyui-plenio-music` 2.0.2. What the package does that a reviewer looks at,
and what changed since 1.6.0.

## What the package starts

The Registry package starts nothing but ComfyUI's own Python (`sys.executable`) with Plenio's own modules, in three
places, each with its command written as a list in the same function:

- `plenio/core/llm/runtime.py:137`
- `plenio/core/workers/protocol.py:114`
- `plenio/player/launch.py:116`

Everything else that starts a program - the Plenio Player starting ComfyUI, a `llama-server` for a GGUF writer, the
file manager - is the **Studio add-on** (`plenio/addons/`), which `.comfyignore` leaves out of this package; the full
download from GitHub carries it ([ADR-0012](../adr/0012-two-artefacts.md)).

## The gate's findings

`tools/package_gate.py` reads every Python file of the packed zip by its syntax tree and fails the build on any other
launch site, `shell=`, `os.system`/`os.startfile`/`os.exec*`, `eval`/`exec`, `pip`, `pickle`, or a script or binary
file. On 2.0.2:

no finding

## Against 1.6.0

9 finding(s) on 1.6.0, 0 now:

- removed: [launch-site] `plenio/player/studio.py` - a process is started outside the accepted files
- removed: [launch-site] `plenio/player/studio.py` - a process is started outside the accepted files
- removed: [launch-site] `plenio/player/visuals.py` - a process is started outside the accepted files
- removed: [launch-site] `plenio/player/visuals.py` - a process is started outside the accepted files
- removed: [launch-site] `plenio/player/visuals.py` - a process is started outside the accepted files
- removed: [argv0] `plenio/core/llm/runtime.py` - the command's first element is not sys.executable
- removed: [argv0] `plenio/core/workers/protocol.py` - the command's first element is not sys.executable
- removed: [script-file] `Plenio Player.bat` - the package ships a script or a binary of its own
- removed: [script-file] `plenio_player.sh` - the package ships a script or a binary of its own

## What a request from the network gets (information-disclosure)

ComfyUI has no login: with `--listen` everyone in the network reaches its routes. Nothing Plenio answers such a
request names a place on this computer:

- **Plenio's routes** (`plenio/comfy/routes.py`, `guarded`): a `local` route refuses the request
  (`core/access.py: from_this_computer` - loopback or the computer's own address, no proxy header, a `Host` that names
  this computer, no cross-site `Origin`). Every error answer goes through `core/errors.py: public_error` - an
  unexpected exception without its text - and, to a request from the network, with every path in Plenio's own words
  cut to its last two parts (`routes.error_response`).
- **The Song API** (v1, v2): another computer needs a token (`[api] remote = "token"`, the default); its answers to
  it keep no place either (`song_api_v1._for_caller`: a job's record, folder and error text by their last parts).
- **ComfyUI's `/history`**, which keeps every node's UI output: Export Release names its release record by its place
  inside the output folder (`plenio/2026-11-11 Song.plenio.json`), never by an absolute path; the summaries name
  files by their names.
- **`/plenio/templates`** names a user template that cannot be read by its id and the kind of error only - not the
  error's text, which for a file that cannot be read is its absolute path.
- **The Plenio Player** (a program of its own, on 127.0.0.1 unless its owner opens it to the network, then with a
  login): its answers to the network name folders and files by their names (`player/server.py: without_places`);
  the guests' page gets no record path of a party song (`player/maker.py: view`).

Tests: `tests/unit/test_no_places_to_the_network.py`, `tests/unit/test_route_access.py`,
`tests/unit/test_player_maker.py`, `tests/host/test_sheet_music_export.py`.

## Network

- Model files are fetched only from the catalogue (`resources/models.toml`: each file pinned to a commit, with its
  size and SHA-256), after the user's confirmation in Plenio Setup ([ADR-0014](../adr/0014-downloads-after-confirmation.md)).
- Every HTTP route declares an access class (`local`, `compute`, `data`, `api`); `local` routes answer this computer
  only; the Song API answers another computer only with a token ([SECURITY.md](../../SECURITY.md)).
