# Plenio 2.0 - product design

Written 2026-11-11 against Plenio 1.6.0 (`c307d35`). Companions: [v2-marketing-and-publishing.md](v2-marketing-and-publishing.md) (message, films, media pipeline, publishing) and [v2-implementation-plan.md](v2-implementation-plan.md) (the work, in phases a coding agent ticks off).

This document makes the technical and design decisions for 2.0. Where a decision is the owner's, it is listed in section 12 with a recommendation; the plan builds on the recommendation unless the owner decides otherwise.

**Evidence labels.** **[repo]** read in this repository at `c307d35`. **[measured 2026-11-11]** measured on the owner's machine on that day. **[checked 2026-11-11]** fetched from the named public service on that day. **[estimate]** not measured; phase 0 of the plan measures it before anything is built on it.

---

## 1. Summary

2.0 adds few new features to the music. It makes Plenio **installable by anyone, right for the computer it runs on, callable from anywhere, and accepted by the Comfy Registry**.

| # | Decision | Why |
|---|---|---|
| 1 | **One repository, two artefacts.** The Registry package contains no code that starts a configurable program. The three launchers (ComfyUI started by the player, a `llama-server` binary, the file manager) move into an add-on that only the full download carries. | Every version from 1.3.1 to 1.5.1 carries a manual Registry verdict of *arbitrary-file-launch* or *command-injection*. The 1.4.0 hardening removed *information-disclosure* from the verdicts; the launch classes remain (section 3). |
| 2 | **Plenio Setup**: a first-run assistant inside ComfyUI that reads the hardware, proposes the model files for it, downloads them into the right folders with progress, and ends with a test song. | ComfyUI's own missing-model download saves into the browser's download folder in the browser frontend (ComfyUI issue #13676, open). A newcomer cannot be expected to move 40 GB of files by hand. |
| 3 | **A model plan**: every model component (YuE2, MiniMax, FLUX.2, the writer, the ASR) has variants in one catalogue with their requirements; `auto` picks per machine, at run time, on the machine that runs; any choice can be overridden per workflow or pinned in the configuration. | Today the System Check prints recommendations and "nothing is switched automatically" [repo: `plenio/core/system.py`]. |
| 4 | **The writer without llama.cpp.** `auto` falls back to ComfyUI's native Gemma 4 12B, so a fresh install writes with a 12B model with nothing else to install. | Comfy-Org publishes `gemma4_12b_int8_convrot.safetensors` (12.06 GB) [checked 2026-11-11]. Today a newcomer without llama.cpp gets a stop on the default template. |
| 5 | **Song API v2** covers every template, review stops, model management and events; jobs survive a ComfyUI restart. **API v1 stays frozen and served.** A documented **Player API** and an **MCP server** join it. | v1 runs two of five production templates and keeps jobs in memory [repo: `docs/api/README.md`]. Plenio VST3 depends on v1. |
| 6 | **People & access** in the player: one page, five plainly named roles, invitations by QR code, a party assistant. | Three overlapping ways in exist today (accounts with groups, the guests' page, the network link), each with its own settings in different places [repo: `docs/user/concepts/player.md`]. |
| 7 | **Visuals that know the song**: a per-song analysis track (beats, bars, sections, onsets, energy) with look-ahead, a director that changes scenes on the downbeat of a section, sound-to-picture sync that accounts for output latency, visuals organised by what they show, and Plenio Nova on phones. | Visuals react to a live FFT, after the fact; Nova is refused on devices without `EXT_color_buffer_float` although it draws half floats [repo: `frontend/src/player/visuals/gpu.ts:59`]. |
| 8 | **Tests in tiers with a time budget**: the 2 110 unit tests run in 144 s, of which 73 s belong to the player's server tests and 37 s to teardowns [measured 2026-11-11]; the fix is fixtures, not fewer assertions. Mutation testing on the critical core modules decides which tests are necessary. | |
| 9 | **Facts from one source**: counts, sizes, the hardware table, the install line and every video link are generated into README and docs; CI fails on drift. | The README says 35 nodes, the release guide 31 nodes and 13 blueprints; the code declares 37 nodes and the repository has 14 blueprints [repo]. |
| 10 | **One release, no pre-release versions.** The package boundary ships with 2.0.0 itself; the owner tests 2.0.0 before it is published (owner's decision 2026-11-11 - a canary release 1.7.0 was proposed and declined). | The Registry's verdict on the new boundary is learned on 2.0.0; section 3.5 says what follows from it. |

Compatibility promises of 2.0:

- A workflow saved with 1.x opens and runs. A release record written by 1.x opens in ComfyUI and plays in the player.
- `/plenio/api/v1` answers exactly as in 1.6.0 for a caller on the same computer.
- The player's state (`~/.plenio/player`) is read as it is; users keep their accounts, passwords and playlists.

What 2.0 breaks, on purpose (section 11): the minimum ComfyUI version, remote access to the Song API without a token, and three player functions in the Registry package.

---

## 2. Where 1.6.0 stands

| Area | Fact | Source |
|---|---|---|
| Size | 61 000 lines of Python in `plenio/` (without `third_party`), 55 000 lines of TypeScript and Vue in `frontend/src` | [repo] |
| Largest modules | `player/maker.py` 1 899, `core/score/ops.py` 1 637, `core/song_api.py` 1 514, `player/server.py` 1 443 lines; `ScoreTab.vue` 1 994, `PianoRoll.vue` 1 492, `MakeForm.vue` 1 182 | [repo] |
| Tests | 2 110 Python unit, workflow and schema tests in 144-188 s; 232 contract and host tests in 272 s; 698 frontend tests; browser check 111 checks, run by hand | [measured 2026-11-11], session logs |
| ComfyUI | minimum 0.37.0, CI pinned to 0.41.0; the owner's ComfyUI is 0.44.0 with frontend 1.58.5 | [repo], [measured] |
| Models | 16 ComfyUI-format files in `resources/models.toml`, 12 of them on `resolve/main` without a pinned revision, none with a hash; 5 Plenio assets pinned with revision, size and SHA-256 | [repo] |
| Catalogue drift | three catalogue URLs point at repositories Hugging Face has since renamed (`Comfy-Org/flux2-klein`, `Comfy-Org/flux2-dev`, `Comfy-Org/vae-text-encorder-for-flux-klein-4b` now redirect to `Comfy-Org/Flux-2-Klein-4B` and `Comfy-Org/Flux-2-Dev`); they still resolve through a 307 | [checked 2026-11-11] |
| Gated models | none of the 17 repositories Plenio's catalogue and guide name is gated today | [checked 2026-11-11] |
| Registry | 621 downloads; all 28 versions *flagged*; no version *active* | [checked 2026-11-11] |
| Song API | 1.4: templates `yue2-song` and `yue2-cover`; jobs live in ComfyUI's memory | [repo] |

### 2.1 The Registry verdicts

Read from `https://api.comfy.org/versions?nodeId=comfyui-plenio-music&statuses=NodeVersionStatusFlagged&include_status_reason=true` [checked 2026-11-11]:

| Version | Published | Verdict (the Registry's reviewer) |
|---|---|---|
| 1.6.0 | 2026-11-09 | policy-v0.7: reflag-pending-review (not reviewed yet) |
| 1.5.1 | 2026-11-07 | policy-v0.8: **arbitrary-file-launch** |
| 1.5.0 | 2026-11-01 | policy-v0.7: command-injection, arbitrary-file-read, information-disclosure |
| 1.4.1 | 2026-10-30 | policy-v0.8: **command-injection** |
| 1.4.0 | 2026-10-30 | policy-v0.8: **arbitrary-file-launch** |
| 1.3.2, 1.3.1 | 2026-10-27 | policy-v0.8: **command-injection** |
| 1.3.0, 1.2.1 | 2026-10-26, -24 | policy-v0.8: arbitrary-file-launch, information-disclosure |
| 1.2.0 | 2026-10-23 | policy-v0.8: arbitrary-file-read, path-traversal |

Reading: reviews do happen, within days. Under policy v0.8 the file-read, traversal and disclosure classes are gone since the 1.2.1 and 1.4.0 fixes. What every reviewed version since keeps is **starting programs**. The code that does it, all of it [repo]:

| Site | What it starts | Class it reads as |
|---|---|---|
| `plenio/player/visuals.py:115` | `subprocess.Popen(f'"{program}" {target}')` - Explorer, as **one command string** built from a path | command-injection: a string command line, whatever guards precede it |
| `plenio/core/llm/runtime.py:55-100` | a `llama-server` binary from a configured path, an environment variable, the PATH, winget, Homebrew or Unsloth Studio | arbitrary-file-launch: the program is named by configuration |
| `plenio/player/studio.py:367` | ComfyUI's `main.py` with a Python from a configurable folder and **arguments typed into the player's settings** | both |
| `plenio/player/launch.py:102` | `sys.executable plenio_player.py`, fixed | accepted pattern: fixed interpreter, in-package script |
| `plenio/core/workers/protocol.py:114` | `sys.executable -m plenio.workers.asr`, fixed | accepted pattern |

The first three are convenience functions of the player and the writer. None of them is needed to make a song in ComfyUI.

---

## 3. Architecture: one repository, two artefacts

### 3.1 The decision

```text
repository (git clone = everything, as today)
├── Registry package  comfyui-plenio-music        what `comfy node pack` ships
│     nodes, Song Sheet editor, templates, blueprints, Song API, Plenio Setup,
│     the player (library, playback, visuals, party, make) - without the add-on
└── Studio add-on     plenio/addons/              only in the full download
      studio_launcher   the player starts ComfyUI
      llm_server        a llama-server binary is started for GGUF files
      file_manager      "Open folder" on this computer's screen
```

The add-on is excluded from the Registry package by `.comfyignore`. A `git clone`, the release zip *Plenio-full* and `Plenio Player.bat` carry it. Features test for the module and degrade with a sentence that says what to do:

```python
# plenio/core/features.py
import importlib.util

ADDONS = ("studio_launcher", "llm_server", "file_manager")

def has(addon: str) -> bool:
    """Whether this installation carries a Studio add-on module (the Registry package does not)."""
    return importlib.util.find_spec(f"{__package__.rsplit('.', 1)[0]}.addons.{addon}") is not None
```

| Function | With the add-on (git clone, full zip) | Registry package |
|---|---|---|
| The player starts ComfyUI (*Start the studio*) | as today | "ComfyUI is not running. Start it the way you usually do." The player opened from ComfyUI finds its ComfyUI anyway - the common case |
| GGUF writer through a `llama-server` binary | as today | GGUF through a **running** app or server (LM Studio, Ollama, a `llama-server` the user started), through `llama-cpp-python` if installed (fixed interpreter, in-package module), else the native Gemma writer (section 5.6) |
| *Open folder* in the file manager | as today, rewritten without a command string | the path with a *Copy* button |

`plenio/addons/file_manager.py` is also rewritten so that no command string exists anywhere in the repository:

```python
def show_folder(folder: Path) -> None:
    """Open ``folder`` (one of the player's own, checked by the caller) in the system's file manager."""
    folder.mkdir(parents=True, exist_ok=True)
    if sys.platform == "win32":
        os.startfile(str(folder))  # noqa: S606 - a folder of the player's own, no program named
    elif sys.platform == "darwin":
        subprocess.Popen(["/usr/bin/open", str(folder)])  # noqa: S603
    else:
        subprocess.Popen(["xdg-open", str(folder)])  # noqa: S603, S607
```

Selecting a file inside the folder (Explorer's `/select,`) is dropped: it is what forced the command string. A player started from ComfyUI without a window needs `os.startfile` to work from a background process; the 2026-10-16 report said it did nothing there. If that still holds, the windowless player shows the path with *Copy* instead - the same as the Registry package.

### 3.2 Why not move the whole player out

Considered: the player as a separate download (`uvx plenio-player`). It would leave the Registry package with almost no network or process code. Rejected for 2.0 because it turns one install into two for the feature that makes Plenio unique, and because the verdicts name the launch classes, not the player's servers. The add-on seam is built so that this stays a packaging change: the player already imports nothing from `plenio.comfy` and runs with `python -m plenio.player`. If the canary's verdict names another class, the next module moves behind the same seam (section 3.5).

### 3.3 The gate: the package cannot regress

A test over the **packed zip** fails the build when a launch site appears outside the two accepted patterns. It reads syntax trees, so comments, names and strings cannot hide or fake a finding.

```python
# tools/package_gate.py - run in CI on node.zip, and by tools/release.py
import ast, sys, zipfile

ACCEPTED = {  # the only places a process may be started in the Registry package, and what argv[0] must be
    "plenio/core/workers/protocol.py": "sys.executable",
    "plenio/player/launch.py": "sys.executable",
    "plenio/core/llm/runtime.py": "sys.executable",   # the llama-cpp-python shim only
}
STARTERS = {("subprocess", n) for n in ("Popen", "run", "call", "check_call", "check_output")} | {
    ("os", n) for n in ("system", "popen", "startfile", "execv", "execve", "spawnv", "spawnl")}

def findings(path: str, source: str) -> list[str]:
    out = []
    for node in ast.walk(ast.parse(source, path)):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        base = node.func.value
        if not (isinstance(base, ast.Name) and (base.id, node.func.attr) in STARTERS):
            continue
        where = f"{path}:{node.lineno}"
        if base.id == "os" or path not in ACCEPTED:
            out.append(f"{where}: {base.id}.{node.func.attr} outside the accepted launch sites")
            continue
        if any(k.arg == "shell" for k in node.keywords):
            out.append(f"{where}: shell= is never passed")
        argv = node.args[0] if node.args else None
        if not isinstance(argv, (ast.List, ast.Tuple, ast.Name)):
            out.append(f"{where}: the command must be a list (found {type(argv).__name__})")
        # a Name must be bound in the same function to a list whose first element is sys.executable:
        # checked by resolve_argv0(), omitted here
    return out

if __name__ == "__main__":
    with zipfile.ZipFile(sys.argv[1]) as z:
        bad = [f for n in z.namelist() if n.endswith(".py") and "/third_party/" not in n
               for f in findings(n, z.read(n).decode("utf-8"))]
    print("\n".join(bad) or "package gate: no launch site outside the accepted ones")
    raise SystemExit(1 if bad else 0)
```

The same tool prints the **delta of findings** against the last published tag, by rule and file. That delta goes into the review request: a reviewer reads "since 1.6.0: three launch sites removed, none added" instead of re-reading 600 files.

### 3.4 Route access classes

Every HTTP route gets one class, declared where the route is registered, tested for every route, and printed into SECURITY.md by `tools/facts.py`.

| Class | Who is answered | Routes |
|---|---|---|
| `local` | a browser or program on this computer (`core.access.from_this_computer`: loopback peer, no proxy headers) | `/plenio/system`, `/plenio/setup/*` (downloads, tokens), `/plenio/player/open`, API token management |
| `compute` | whoever reaches ComfyUI: the route reads only its request body and writes nothing | `/plenio/score/*`, `/plenio/lyrics/analyze`, `/plenio/sheet/resolve`, `/plenio/eq/response`, `GET /plenio/presets/*`, `/plenio/brief/fields`, `/plenio/workflow/blocks` |
| `data` | whoever reaches ComfyUI: the route reads or writes only inside ComfyUI's own folders, by names checked against them (as today), and names no absolute path to another computer | `/plenio/templates*`, `/plenio/records*`, `/plenio/export/sheet-music*`, `/plenio/asr/notes/*` |
| `api` | this computer; another computer only with an API token (section 8.5) | `/plenio/api/v1/*`, `/plenio/api/v2/*` |

```python
# plenio/comfy/routes.py
ROUTES = (
    Route("GET",  "/plenio/system",          system,          access="local"),
    Route("POST", "/plenio/score/transform", score_transform, access="compute"),
    ...
)

def guarded(route: Route) -> Handler:
    async def handler(request: web.Request) -> web.StreamResponse:
        if route.access == "local" and not access.from_this_computer(peer_of(request), request.headers):
            return refused("This is answered on the computer ComfyUI runs on only.")
        if route.access == "api" and not api_access.allowed(request):
            return refused("Another computer needs an API token: Plenio Setup › API access.", status=401)
        return await route.handler(request)
    return handler
```

`compute` and `data` keep a ComfyUI opened from another computer (a server at home, a rented GPU) fully working: the Song Sheet editor's routes are pure functions, and *Continue a song* and the brief templates stay inside ComfyUI's folders. Only what describes or changes the computer itself is `local`.

### 3.5 The verdict on 2.0.0

A canary release (1.7.0 = 1.6.0 plus sections 3.1 to 3.4, three weeks ahead) was proposed to learn the Registry's verdict before 2.0. **Declined by the owner on 2026-11-11: no pre-release versions; the boundary ships with 2.0.0, which the owner tests before publishing.** The verdict is therefore read on 2.0.0 (`tools/registry_status.py`), and decides what a 2.0.x does:

| Verdict on 2.0.0 | Consequence |
|---|---|
| active | the boundary stands; the Manager becomes the first install line in every text (a docs-only change, no new version needed for the README on GitHub) |
| flagged with a class that names a remaining module | that module moves behind the add-on seam (candidates, in order: the network gateway `player/network.py`, the party server `player/guest.py`, the player as a whole per section 3.2) in 2.0.1 |
| flagged without a class, or no review in three weeks | texts keep `comfy node install` and `git clone` first; the review request with the gate's delta against 1.6.0 is filed and the Discord review channel is asked once |

Until the verdict is known, every text of 2.0.0 names `git clone` and `comfy node install` first, as today.

No design can promise the verdict: the Registry's policy and scanner are private. The design removes every site the verdicts' classes describe and makes the removal verifiable.

### 3.6 ComfyUI compatibility window

| | 1.6.0 | 2.0 |
|---|---|---|
| Minimum | 0.37.0 | **0.41.0** (the version CI has tested since 2026-10-19) |
| CI, blocking | 0.41.0 | the minimum **and** the newest release tag (0.44.x today), as a matrix |
| CI, weekly, not blocking | - | ComfyUI `master`: a canary that opens an issue when a contract or host test fails |

Raising the minimum removes the repair for a frontend 1.53.6 restore defect (`extension/dynamicCombo.ts`) and the `proxyWidgets` quarantine handling once the minimum frontend is past them; each removal is checked against the minimum's frontend version first. The node-type snapshot is taken per tested tag (`tests/fixtures/node_types/<tag>.json`).

---

## 4. Installation and first run: Plenio Setup

### 4.1 The path of a newcomer

```text
Manager: search "Plenio", Install, restart
  └─ ComfyUI opens → Plenio Setup opens once (a sidebar tab; later under the Plenio menu)
       1  This computer      RTX 4060 · 8 GB · 32 GB RAM · 212 GB free on the models drive
       2  What do you want?  ☑ Songs (YuE2)   ☐ Covers   ☐ MiniMax songs   ☑ Cover art   ☐ Mastering only
       3  Your plan          6 files · 24.1 GB · where each goes · licences (YuE2: non-commercial)
                             [ Download all ]   each row: why this file for this card · change
       4  Downloading        per file: progress, speed, time left; pause, resume; verified ✓
       5  Test song          a one-minute instrumental with the chosen files → "It works" or what failed and the fix
       6  Go                 [ Make a song ]  [ Open the player ]  [ Watch: your first song (3 min) ]
```

Rules:

- Setup **proposes and the user confirms**. Nothing is downloaded before step 3's button, and the button names the total size.
- Every step can be left; Setup remembers where it was (`<user>/plenio/setup.json`). A red dot on the Plenio menu says that a template the user opened lacks files.
- Disk space is checked before a download starts (`shutil.disk_usage` of the target folder against the plan plus 2 GB).
- The target is ComfyUI's own folder for that kind of model: the first path of `folder_paths.get_folder_paths(kind)`, which is the `is_default` location of `extra_model_paths.yaml` when the user has one. Step 3 shows the path and lets the user choose another registered one.
- Files already on the computer are found first, in every registered folder and the sibling folders Plenio already searches [repo: `core/models.py: sibling_folders`], and never downloaded again under another name.
- Step 5's test song uses the real template and the real files with a fixed brief (60 s, instrumental, no cover art, no HQ) so that a failure appears here, with Setup's explanations, and not in the user's first real run.

### 4.2 System Check becomes the engine of Setup

`plenio/core/system.py` already gathers the facts. 2.0 adds **findings with fixes** in place of free text:

```python
@dataclass(frozen=True)
class Finding:
    id: str                 # "comfyui.too_old", "model.misplaced", "writer.blocked", "disk.low" ...
    severity: Status        # OK | WARNING | ERROR
    text: str               # what is the matter, in one sentence
    fix: Fix | None         # what the button does, if a button can do it

@dataclass(frozen=True)
class Fix:
    label: str              # "Download 4.0 GB", "Copy the line for extra_model_paths.yaml", "Open the model's page"
    action: str             # "download" | "copy" | "open_url" | "choose_writer" | "refresh"
    payload: Mapping[str, str]
```

The System Check node keeps its Markdown report (built from the same findings); Setup renders them as rows with buttons; `GET /plenio/api/v2/system` returns them as JSON. One list, three views.

### 4.3 Problem reports

*Setup › Report a problem* writes a zip the user can attach to an issue: the system report, the last 200 lines of ComfyUI's log that mention Plenio, the failing node's error, the workflow with text fields emptied. Paths are reduced to their last two parts and the user name is replaced, by the same function that already cleans answers for remote callers [repo: `player/server.py: without_places`]. The user sees the content before saving it.

---

## 5. Models

### 5.1 The catalogue, version 2

One file, `resources/models.toml` (schema `plenio.models/2`), replaces today's two catalogues' split by owner ("ComfyUI downloads these, Plenio those") with a split by **component** and **variant**. Every file is pinned.

```toml
schema = "plenio.models/2"

[[component]]
id = "yue2"
title = "YuE2 music model"
needed_by = ["yue2-song", "yue2-cover", "yue2-daw"]
loader = {node = "CheckpointLoaderSimple", input = "ckpt_name", folder = "checkpoints"}
accepts = "yue2-checkpoint"        # which files on disk may stand in: a sniffer in core/models.py

  [[component.variant]]
  id = "yue2-3b-int8"
  file = "yue2_3b_int8_convrot.safetensors"
  repo = "Comfy-Org/YuE2"
  revision = "2f76ca75e6…"         # a full commit hash
  path = "checkpoints/yue2_3b_int8_convrot.safetensors"
  bytes = 3960938800
  sha256 = "…"
  licence = "CC BY-NC 4.0"
  gated = false
  quality = 2                      # rank within the component; higher is better
  speed = 3                        # rank; higher is faster
  vram_min_gib = 6.0               # below: runs with heavy offloading, said so
  vram_full_gib = 9.0              # from here the stage runs on the card
  basis = "measured 2026-10 on RTX 5060 Ti 16 GB (int8); thresholds: estimate"

  [[component.variant]]
  id = "yue2-3b-bf16"
  file = "yue2_3b_bf16.safetensors"
  bytes = 7799983228
  quality = 3
  speed = 2
  vram_min_gib = 12.0
  vram_full_gib = 20.0
  basis = "estimate"
  ...
```

Components of 2.0: `yue2`, `yue2-instrumental-adapter`, `sheetsage2`, `minimax-dit`, `minimax-text-encoder`, `minimax-vae`, `flux2-klein`, `flux2-text-encoder`, `flux2-vae`, `writer-native` (Gemma 4 12B int8, E4B int8, E2B int8), `writer-gguf` (Q6_K, QAT Q4), `asr`, `asr-aligner`, `asr-fallback`, `stems`, `audio-sr`.

`tools/catalogue_check.py` keeps the catalogue true without downloading anything:

- `GET https://huggingface.co/api/models/<repo>` gives `gated` (`false`, `"auto"`, `"manual"`), the licence and the current commit; a renamed repository is found by the differing `id` in the answer.
- `HEAD <resolve URL at the pinned revision>` gives `X-Linked-Size` and `X-Linked-ETag` - for a large file the ETag is its SHA-256 - so sizes and hashes are filled and verified from headers.
- It runs weekly in CI and before a release, and fails on: a URL that no longer resolves, a size or hash that changed at a pinned revision, a repository that became gated, a licence that changed.

The first run of the tool fixes today's drift: twelve `resolve/main` URLs get revisions, all sixteen files get hashes, the three renamed repositories get their current names, `bytes = 0` of the instrumental adapter is filled.

### 5.2 The plan: which variant, and why

```python
# plenio/core/modelplan.py - pure, typed, tested with tables; no ComfyUI import
PREFERENCES = ("balanced", "quality", "speed", "small")

@dataclass(frozen=True)
class Pick:
    component: str
    variant: Variant | None          # None: a file on disk that is not in the catalogue (a finetune)
    file: str
    installed: bool
    reason: str                      # shown in Setup, the node's summary and the API
    alternatives: tuple[Variant, ...]
    warning: str = ""

def pick(component: Component, *, vram_gib: float | None, installed: Mapping[str, int],
         prefer: str = "balanced", pinned: str | None = None) -> Pick:
    """The variant of ``component`` for a machine with ``vram_gib`` GiB on its largest card.

    1. A pin wins: the user's file, whatever it is - with a warning when the card is below its minimum.
    2. Variants that run fully on the card are candidates; if none does, those that run at all;
       if none, the smallest (it will be slow, and the reason says so).
    3. Among the candidates the preference orders them.
    4. A candidate that is already installed is taken when it is at most one quality rank below
       the best ("balanced") - nobody downloads 8 GB for one rank.
    """
    variants = component.variants
    if pinned:
        known = next((v for v in variants if v.file == pinned), None)
        low = known is not None and vram_gib is not None and vram_gib < known.vram_min_gib
        return Pick(component.id, known, pinned, pinned in installed, "your choice", variants,
                    f"needs about {known.vram_min_gib:g} GB of graphics memory; this card has {vram_gib:.1f}" if low else "")
    vram = vram_gib or 0.0
    full = [v for v in variants if vram >= v.vram_full_gib]
    runs = [v for v in variants if vram >= v.vram_min_gib]
    pool = full or runs or [min(variants, key=lambda v: v.bytes)]
    order = {"quality": lambda v: (v.quality, v.speed), "speed": lambda v: (v.speed, v.quality),
             "small": lambda v: (-v.bytes,), "balanced": lambda v: (v.quality, v.speed)}[prefer]
    best = max(pool, key=order)
    have = [v for v in pool if installed.get(v.file) == v.bytes]
    tolerance = {"quality": 0, "balanced": 1, "speed": 1, "small": 1}[prefer]
    if have:
        kept = max(have, key=order)
        if kept.quality >= best.quality - tolerance:
            best = kept
    where = "runs on the card" if best in full else "runs with offloading: slower" if best in runs else "too large for this card: very slow"
    card = f"{vram:.1f} GB" if vram_gib else "no graphics card"
    return Pick(component.id, best, best.file, best in have,
                f"{card}: {where}" + (", already installed" if best in have else ""),
                tuple(v for v in variants if v is not best))
```

Three properties matter more than the ranking itself:

- **Stable.** The plan uses the card's total memory, never the free memory of the moment, so the choice does not flip between runs. Free memory only produces a warning ("another program holds 9 GB of this card").
- **Explained.** Every pick carries its reason in words; the same sentence appears in Setup, in the node's summary after a run, in the release record and in `GET /api/v2/models/plan`.
- **Honest about its basis.** A threshold marked `estimate` is shown as "expected", a measured one as "measured on <card>". Phase 0 measures peak memory per stage (`torch.cuda.max_memory_allocated` around each node) for every variant the owner's cards can load, and the catalogue records it.

The initial thresholds are the rows of today's hardware table [repo: `core/system.py: RULES`], which becomes generated from the catalogue instead of written twice.

### 5.3 In the graph: Model Choice

The pattern exists and is proven: *Writer Choice* outputs a file name that feeds ComfyUI's own `CLIPLoader` [repo: `plenio/comfy/nodes/writer_choice.py`]. 2.0 uses it for every model component.

```python
class PlenioModelChoice(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="PlenioModelChoice",
            display_name="Model Choice",
            category="Plenio/Models",
            has_intermediate_output=True,
            inputs=[
                io.DynamicCombo.Input(          # the component decides which files are listed, as in Load Audio Model
                    "component",
                    options=[
                        io.DynamicCombo.Option(component.id, [io.Combo.Input(
                            "file", options=[AUTO, *host.files_accepted_by(component)],
                            tooltip="auto: the file for this computer (Plenio Setup shows which and why). "
                                    "Or any file of this kind in your model folders - a finetune, too.")])
                        for component in modelplan.components()],
                    tooltip="Which model this node chooses a file for."),
            ],
            outputs=[io.AnyType.Output(display_name="file", tooltip="The file name, for the loader beside this node.")],
        )

    @classmethod
    def fingerprint_inputs(cls, component: str, file: str) -> str:
        # auto depends on what is installed and on the configuration: run again when either changes
        return file if file != AUTO else modelplan.fingerprint(component, host.inventory(), host.load_config())

    @classmethod
    def execute(cls, component: str, file: str) -> io.NodeOutput:
        chosen = host.plan_pick(component, pinned=None if file == AUTO else file)
        if not chosen.installed:
            raise PlenioModelError(
                f"{chosen.file} is not on this computer yet.",
                hint="Open Plenio Setup: it downloads the file into the right folder.",
                data={"component": component, "file": chosen.file})   # the frontend opens Setup at this row
        status = "warning" if chosen.warning else "ok"
        text = f"**{chosen.file}** - {chosen.reason}" + (f" - {chosen.warning}" if chosen.warning else "")
        return io.NodeOutput(chosen.file, ui={"plenio_summary": [{"status": status, "markdown": text}]})
```

Consequences:

- `auto` is resolved **on the machine that runs the workflow, when it runs**. The Song API, the player's *Make a song* and the VST3 plug-in get the right files without a frontend.
- The model blocks of the templates (`Plenio · YuE2 Model`, `Plenio · MiniMax Model`, `Plenio · Cover Art`) show one field per component, set to `auto`. Overriding is choosing another entry; it is saved with the workflow.
- Precedence: the node's field, then a pin in `config.toml` (`[models] yue2 = "my_finetune.safetensors"`), then the plan with the preference of `config.toml` (`[models] prefer = "balanced"`).
- The loaders driven by Model Choice no longer carry `properties.models`: ComfyUI's missing-model dialog would otherwise ask for the default variant on a machine whose plan chose another one. Setup is the one place that asks.
- The frontend lists only files a component accepts. For YuE2 that is decided by the existing header reader [repo: `core/models.py: yue2_checkpoint_problem`]; a file that would not load is shown greyed with the reason.
- A workflow saved with 1.x has no Model Choice node. It keeps its loaders' file names and runs as it did; *File › Bring this workflow's blocks up to date* (the existing mechanism of `core/blocks.py`) offers the new block.

### 5.4 Downloads

One downloader for every catalogue file, the one that exists [repo: `core/assets/fetch.py`], extended. It only ever fetches catalogue entries: a request names a variant id, never a URL.

```text
states of one file:   absent → queued → downloading ⇄ paused → verifying → installed
                                   ↘ blocked(reason) ↗            ↘ failed(reason) → queued (retry)
```

| Blocked or failed because | How it is recognised | What the user sees | Fix button |
|---|---|---|---|
| the model needs an accept on Hugging Face | 401 or 403 with header `X-Error-Code: GatedRepo` | "This model's makers ask you to accept their terms once." | the three steps of section 5.5 |
| approval by the makers is pending | the same, after the user accepted; the catalogue says `gated = "manual"` | "Your request is with the model's makers. This can take days." | *Check again*; *Use the other variant* when one is not gated |
| no token, or a token without the right | 401 without `GatedRepo`, or `GatedRepo` with a token present | "Your Hugging Face token is missing or may not read gated models." | *Open the token page*, the permission to tick |
| the file moved | 404 at a pinned revision | "The file is no longer at its address. Plenio's catalogue needs an update." | *Try the mirror* when the entry has one; *Report* |
| too many requests | 429 with `Retry-After` | "Hugging Face asks to wait 40 s." | waits and retries by itself |
| no connection, a proxy, a timeout | `URLError`, timeout | "No connection to huggingface.co." | *Try again*; the manual steps with folder and URL |
| the disk is full | `OSError` ENOSPC, or the check before starting | "24.1 GB needed, 11.3 GB free on D:." | *Choose another folder* |
| the file arrived damaged | size or SHA-256 differs | "The download was damaged." | discarded, *Try again* |
| a program holds the file (Windows, antivirus) | `PermissionError` on the final rename | "Another program is using the file." | retries five times over ten seconds, then *Try again* |

Mechanics:

- Resumable with `Range`, into `<file>.part`, renamed after the hash matched (exists). New: up to two files at once, a speed and time estimate, pause and cancel.
- Progress goes out as events (`plenio.download` on ComfyUI's websocket for the frontend, the same on the API's event stream).
- The routes are `local` class. A page from another computer sees the plan and the states and cannot start a download.
- `PLENIO_OFFLINE=1` and `PLENIO_AUTO_DOWNLOAD=0` keep their meaning. New in `config.toml`: `downloads = "ask" | "auto" | "off"` - *ask* (default): a run that lacks a file stops and opens Setup at that file; *auto*: the run downloads it and goes on (for an unattended party host or an API server); *off*: never. The writer's GGUF and the ASR models, which download during a run today, follow the same setting; their default stays *auto* for workflows saved before 2.0 so that nothing that worked stops.

### 5.5 Gated models: the user is led, not left with a 401

No file Plenio needs is gated today [checked 2026-11-11]. Finetunes, LoRAs and tomorrow's releases can be, so the path exists and is tested against a fake server.

What a gated file answers [checked 2026-11-11 against a gated repository]:

```text
HTTP/1.1 401 Unauthorized
X-Error-Code: GatedRepo
X-Error-Message: Access to model … is restricted. You must have access to it and be authenticated to access it. Please log in.
```

Access can only be requested in the browser, on the model's page (Hugging Face's documentation). So Setup leads through exactly three steps and checks each:

```text
┌ This model needs your OK on Hugging Face ────────────────────────────────────────────┐
│ 1  Open the model's page and accept its terms      [ Open huggingface.co/… ]   ○     │
│    You need a free Hugging Face account. The makers see your user name and e-mail.   │
│ 2  Give this computer a token that may read it      [ Open the token page ]     ○     │
│    Create a token of type "Read" (or fine-grained with "Read access to contents of   │
│    all public gated repos you can access"), then paste it here:  [ hf_…………… ] [Save] │
│ 3  [ Check and download ]                                                            │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

- **Where the token lives.** Plenio keeps no key of its own. It reads the token Hugging Face's tools already use (`HF_TOKEN`, then the file `huggingface_hub.constants.HF_TOKEN_PATH`), and *Save* stores the pasted token with `huggingface_hub.login(token=…, add_to_git_credential=False)` - the same place `hf auth login` writes to. `huggingface_hub` comes with ComfyUI.
- **Classification** uses the header, not the status code, because both 401 and 403 occur:

```python
# plenio/core/assets/hub.py
@dataclass(frozen=True)
class Refusal:
    kind: str      # "gated" | "token" | "moved" | "rate" | "other"
    message: str
    retry_after: float | None = None

def classify(status: int, headers: Mapping[str, str], *, token_sent: bool) -> Refusal | None:
    code = headers.get("X-Error-Code", "")
    said = headers.get("X-Error-Message", "")
    if code == "GatedRepo":
        return Refusal("token" if token_sent else "gated", said)   # with a token: it lacks the right, or no accept yet
    if status == 401:
        return Refusal("token", said or "The token was not accepted.")
    if status == 404 or code in ("EntryNotFound", "RevisionNotFound", "RepoNotFound"):
        return Refusal("moved", said)
    if status == 429:
        return Refusal("rate", said, float(headers.get("Retry-After", "30") or 30))
    return None if status < 400 else Refusal("other", said or f"HTTP {status}")
```

- **The token never leaves huggingface.co.** A file's address answers with a redirect to a storage host with a signed URL. Python's `urllib` copies request headers to the redirect target, `Authorization` included. The downloader therefore sends the token as an unredirected header and adds it again only when the redirect stays on the hub (a renamed repository redirects within `huggingface.co`):

```python
HUB = "huggingface.co"

class HubRedirects(urllib.request.HTTPRedirectHandler):
    def __init__(self, token: str | None):
        self.token = token

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new is not None and self.token and urllib.parse.urlsplit(newurl).hostname == HUB \
                and urllib.parse.urlsplit(newurl).scheme == "https":
            new.add_unredirected_header("Authorization", f"Bearer {self.token}")
        return new

def open_hub(url: str, token: str | None, start: int = 0):
    request = urllib.request.Request(url, headers={"User-Agent": "plenio-assets/2"})
    if token and urllib.parse.urlsplit(url).hostname == HUB:
        request.add_unredirected_header("Authorization", f"Bearer {token}")   # not copied to another host
    if start:
        request.add_header("Range", f"bytes={start}-")
    return urllib.request.build_opener(HubRedirects(token)).open(request, timeout=60)
```

  A test serves a redirect to a second local server and asserts that the second server never sees the header.
- *Check and download* asks the hub once (`GET /api/models/<repo>` with the token, then a `HEAD` of the file) and names the step that is still open: no accept yet, pending approval, or a token without the right.

### 5.6 The writer plan

| Order | What `Gemma 4 12B (auto)` takes | Needs | New in 2.0 |
|---|---|---|---|
| 1 | a Gemma 4 12B of a **running** app or server (LM Studio, Ollama, llama.cpp started by the user or by the Studio add-on) | nothing: it is loaded already | the order: first, since it costs no load time |
| 2 | a Gemma 4 12B **GGUF** on the computer, or the one for the card downloaded (Q6_K from 16 GB, QAT Q4 below) | the Studio add-on's `llm_server`, or `llama-cpp-python` | unchanged |
| 3 | ComfyUI's native **`gemma4_12b_int8_convrot`** (12.06 GB) | nothing but the file; ComfyUI's Generate Text | **new: the default without llama.cpp** |
| 4 | native `gemma4_e4b_it_int8_convrot` (8.09 GB), or `gemma4_e2b_it_int8_convrot` (5.20 GB) below 8 GB | the same | new: the lighter steps for small cards |

Sizes [checked 2026-11-11, `Comfy-Org/gemma-4`]. ComfyUI 0.44.0 has the 12B's configuration (`comfy/text_encoders/gemma4.py: Gemma4_12B_Config`) [repo of ComfyUI, measured]; whether the minimum 0.41.0 has it is checked in phase 0, and on a ComfyUI without it step 3 is skipped. Which of 2 and 3 writes better and faster on a 16 GB card, and from which memory step 3 is practical, is **[estimate]** until phase 0 runs the existing writer probe (`tools/writer_probe.py`) on both. The order of 2 and 3 follows that measurement; the table shows the expected outcome.

The effect for a newcomer: Setup's plan lists one writer file, it downloads like every other model, and the first song is written by a 12B model. No command line.

---

## 6. Performance

### 6.1 Measure first

The record of a release already says how long the whole run took [repo: `comfy/nodes/export.py`, `host.run_started`]. It does not say where the time went. 2.0 records it per stage:

```json
"timings": {
  "schema": "plenio.timings/1",
  "total_seconds": 151.2,
  "stages": [
    {"stage": "write",     "seconds": 28.4, "load_seconds": 11.0, "model": "gemma-4-12b-it-Q6_K.gguf"},
    {"stage": "plan",      "seconds": 14.9, "load_seconds": 6.2,  "model": "yue2_3b_int8_convrot.safetensors"},
    {"stage": "take",      "seconds": 61.0, "load_seconds": 0.0},
    {"stage": "master",    "seconds": 4.1},
    {"stage": "cover_art", "seconds": 21.7, "load_seconds": 14.3},
    {"stage": "listen",    "seconds": 17.6, "load_seconds": 8.0},
    {"stage": "export",    "seconds": 3.5}
  ],
  "peak_vram_gib": 13.8
}
```

(The numbers are a placeholder for the shape, not a measurement.) Stages are the template's groups, as the Song API's `stage` already names them; a node reports through `host.Progress`. `load_seconds` is the time ComfyUI spends moving weights before the node's own work, measured around `model_management.load_models_gpu` in `host.py`.

`tools/bench.py` runs a fixed set of briefs (60 s instrumental, 90 s sung, 180 s sung with HQ and cover art, a cover) through the Song API, three times each, and writes `docs/test-reports/data/bench-<version>-<card>.json` and a table. It is the yardstick for every item below and for the release ("2.0 is not slower than 1.6.0 on any brief").

### 6.2 Where time is expected to go, and what 2.0 does about it

Every row is a hypothesis until `bench.py` has measured it [estimate]. Only rows that measure a gain above 5 % of a run are implemented; the others are recorded as measured and dropped.

| # | Hypothesis | Change | Expected |
|---|---|---|---|
| P1 | On 16 GB and below, models are loaded and unloaded between stages; load time is a large share of a short song | the model plan prefers variants that leave room for the next stage: FLUX.2 fp8 with the fp4 text encoder (7.9 GB instead of 15.8 GB) below 24 GB | the cover-art stage's load time roughly halves |
| P2 | The writer's server is started and stopped for each song of a series | keep the writer loaded across a series when the plan says writer + music model fit together (`writer file + 2 GB + music model's vram_full` ≤ card); stop it when the queue is empty | the writer's load time is paid once per series |
| P3 | Export listens on the vocal stem: separation, then ASR, then alignment, one after another, each loading a model | on a machine with a second card, Plenio's workers (ASR, separation in a worker, the writer) run there (`[workers] device = "cuda:1"`, default: the largest card ComfyUI does not use); on one card nothing changes | the listening stage overlaps mastering and cover art |
| P4 | The cover is painted between YuE2's plan and its take in some runs, so on a 16 GB card the image model pushes the music model out and it loads twice | the templates order the cover before the music model's first use or after its last (a link that makes the cover wait for the take, or run before the plan); verified by `load_seconds` of the take being zero | one load of the music model less |
| P5 | A take of the same song re-runs stages whose inputs did not change | already cached by ComfyUI's node cache within a session; the Song API keeps the prompt's structure stable so the cache hits (a test compares the prompts of *a new take*) | plan and writer are skipped on takes |
| P6 | First run after ComfyUI started is far slower ("up to 7 minutes" in the API guide) | Setup's test song doubles as a warm-up; the player's studio panel says "first song after a start takes longer" with the measured factor | perception, not speed |
| P7 | The player's library with thousands of songs | measured and fine in 1.x (2 969 songs: 60-80 ms per keystroke); no change | - |
| P8 | The frontend bundle of the Song Sheet editor (1.7 MB) loads when a sheet opens | already lazy; preload it on idle after a template with a sheet opened | the first open feels instant |

### 6.3 Budgets

After phase 0 the measured numbers of 1.6.0 on the owner's 16 GB card become budgets in `docs/dev/performance.md`. A release whose `bench.py` run exceeds a budget by more than 10 % says so in its release checklist and needs a reason.

---

## 7. Workflows

The six templates and their numbers stay: tutorials, docs and saved habits depend on them.

### 7.1 Presets: the same six in every place

The player's *Make a song* has presets (*Best quality*, *Party - fast*, *Quick sketch*, *Full song*, *Three takes*, *Instrumental*) [repo: `frontend/src/player/make/presets.ts`]. The templates and the API have none. 2.0 moves them to one file, `resources/presets/make.json`, read by all three:

- **Templates**: a `Plenio · Preset` field at the top of the first group (beside the *HQ Mastering & Cover Art* cards). Choosing one sets HQ mastering, cover art, lyrics fidelity, the length and the batch count through the frontend - visible widget changes, undoable, nothing hidden in the backend.
- **API**: `"preset": "party-fast"` in a job request; explicit `fields` win over the preset.
- **Player**: unchanged for the user.

### 7.2 Plenio Home

The Setup tab doubles as the place to start from once setup is done:

```text
Plenio                                                   2.0.0 · everything ready ✓
[ Make a song ]  [ Cover a recording ]  [ Compose it yourself ]  [ Master a file ]     → opens the template
[ Open the player ]   [ Continue a song… ]
Recent songs: ▶ Night Drive · ▶ Marrow · ▶ The Brass Floor          → the player, at the song
Models: 6 of 6 for your templates · 2 optional not installed  [ Manage ]
New in 2.0 · Tutorials · Documentation · Report a problem
```

It replaces searching the template browser's *Extensions* section, which is where ComfyUI lists Plenio's templates.

### 7.3 Recipes instead of more templates

Flexibility comes from the blueprints (14 today), which a user can combine. 2.0 documents six **recipes** as short pages with a workflow file each in `example_workflows/recipes/` (shipped, not listed as numbered templates): a series from a list of briefs (a text file, one brief per line), two music models from one brief (YuE2 and MiniMax side by side), a cover in three styles, master a folder of files, a song with stems for a DAW, the same lyrics in three genres. Each recipe is built by `tools/build_graphs.py` and validated like a template.

One new node carries the first recipe: **Brief List** reads briefs from a text field or a file in the input folder and hands them to the Song Brief one per run, with the run's batch index - a series from a list instead of from one brief.

### 7.4 The review stop without the second click

Today *one song, stop to review* ends the run at the Song Sheet; after *Approve* the user presses *Run* again. 2.0: *Approve* queues the continuing run itself when the sheet stopped the run (the frontend calls ComfyUI's own queue function with the current graph). A setting keeps the old behaviour (*Approve only*).

---

## 8. APIs

### 8.1 Song API v2

Base `/plenio/api/v2`. v1 stays, frozen: its handlers move to `comfy/song_api_v1.py` with a golden test per endpoint recorded from 1.6.0.

| Group | Endpoints | New against v1 |
|---|---|---|
| Discovery | `GET /`, `GET /openapi.json`, `GET /templates`, `GET /templates/{id}`, `GET /briefs`, `GET /presets` | all five production templates: `yue2-song`, `yue2-cover`, `yue2-daw`, `minimax-song`, `enhance-master`; presets |
| System | `GET /system` (facts and findings), `GET /models`, `GET /models/plan`, `POST /models/downloads` (variant ids), `GET /models/downloads`, `DELETE /models/downloads/{id}`, `GET /writers`, `GET /loras` | the plan, downloads (class `local`), the lists a form needs |
| Jobs | `POST /jobs`, `GET /jobs`, `GET /jobs/{id}` (`?wait`), `DELETE /jobs/{id}`, `POST /jobs/{id}/approve`, `GET /jobs/{id}/documents`, `GET /jobs/{id}/files/{name}`, `GET /jobs/{id}/bars`, `GET /jobs/{id}/timings` | review stops, timings, **jobs kept on disk** |
| Songs | `GET /songs` (query as the player's search), `GET /songs/{id}`, `GET /songs/{id}/files/{name}`, `POST /songs/{id}/again` (take, like, cover) | the library of released songs, not only this session's jobs |
| Scores | `POST /scores/analyze`, `/scores/transform`, `/scores/import` (MIDI, MusicXML), `/scores/export` (MIDI, MusicXML), `POST /lyrics/analyze` | the editor's routes, documented and versioned |
| Uploads | `POST /uploads` | unchanged |
| Events | `GET /events` (Server-Sent Events) | new |
| Queue | `GET /queue` | unchanged |

**Review stops.** A job may ask to stop where the templates' Song Sheets stop:

```json
POST /jobs
{"template": "yue2-song", "fields": {"genre": "bossa nova", "description": "rain on a tin roof"},
 "review": ["text", "score"]}
```

```text
queued → running → waiting_for_review(text) --approve--> running → waiting_for_review(score) --approve--> running → succeeded
```

`GET /jobs/{id}` in `waiting_for_review` carries the documents as the Song Sheet shows them (title, style, lyrics, score as ABC) with their SHA-256. `POST /jobs/{id}/approve` takes the documents back, edited or not; an edited document becomes *manual*, exactly as an edit in the Song Sheet does, and the continuing run is queued under the same job id. This is the mechanism the templates already have (the sheet state); the API drives it instead of a person.

**Jobs on disk.** One JSON file per job in `<user>/plenio/api/jobs/`, written atomically at every state change; the index is rebuilt at start. A job that was running when ComfyUI stopped becomes `failed` with `error.code = "interrupted"` and can be posted again with its `Idempotency-Key`. Kept: the newest 500 or 30 days.

**Events.** One stream for jobs and downloads; a client that cannot hold a stream keeps using `?wait`.

```python
# plenio/comfy/song_api_v2.py
async def events(request: web.Request) -> web.StreamResponse:
    response = web.StreamResponse(headers={"Content-Type": "text/event-stream", "Cache-Control": "no-store",
                                           "X-Accel-Buffering": "no"})
    await response.prepare(request)
    queue = HUB.subscribe(after=request.headers.get("Last-Event-ID"))   # replays what the client missed
    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=15)
            except asyncio.TimeoutError:
                await response.write(b": keep-alive\n\n")
                continue
            await response.write(f"id: {event.id}\nevent: {event.kind}\ndata: {json.dumps(event.data)}\n\n".encode())
    except (ConnectionResetError, asyncio.CancelledError):
        return response
    finally:
        HUB.unsubscribe(queue)
```

Event kinds: `job.queued`, `job.stage`, `job.progress`, `job.waiting`, `job.succeeded`, `job.failed`, `job.cancelled`, `download.progress`, `download.blocked`, `download.done`. No webhooks: a server that calls a caller-chosen URL is the request-forgery class the Registry's reviewer blocks on.

**Errors** keep v1's shape (`error.code`, `error.message`, `error.hint`, `error.node`) and gain stable codes for what 2.0 can now say: `models_missing` (with the variant ids and sizes, and whether `downloads = "auto"` would fetch them), `gated`, `needs_review`, `interrupted`.

### 8.2 Contract

- `openapi.json` is generated from the handlers' declarations (as v1's is) and committed; CI fails when the committed copy differs.
- A golden test per endpoint and state (request, status, body with volatile fields masked).
- `docs/api/examples/` gains a typed single-file client, `plenio_client.py` (standard library only: `make_song`, `wait`, `approve`, `download`), used by the examples and by the MCP server; TypeScript types are generated in CI with `openapi-typescript` and published beside the reference.

### 8.3 Player API

The player's page talks to its server over about sixty `/api/…` routes that are nobody's contract. 2.0 documents a small, stable subset as **Player API v1** under `/api/v1`, for remote controls, stream decks and home automation:

| | |
|---|---|
| `GET /api/v1/now` | the song that plays, position, the queue's next three |
| `POST /api/v1/transport` | `{"do": "play" | "pause" | "next" | "previous" | "seek", "seconds": 42}` |
| `GET /api/v1/songs?q=…` | the library, searched as the page searches |
| `POST /api/v1/queue` | add a song next or at the end |
| `GET/POST /api/v1/live` | Live Play: state, start, stop, the rules for new songs |
| `GET /api/v1/events` | Server-Sent Events: `now`, `queue`, `live`, `reaction` |

Transport commands reach the page that plays through the page's existing few-second poll, shortened to the event stream. Access: this computer, or a device that came in through *My devices* (the existing link and cookie), or an API token of the player (section 9.1).

### 8.4 MCP: ask an assistant for a song

`plenio_mcp.py` at the repository root (beside `plenio_player.py`): a Model Context Protocol server over standard input and output, standard library only, about 300 lines on top of `plenio_client.py`. Tools: `make_song(description, genre?, length?, vocals?, language?, own_lyrics?)`, `job_status(id)`, `list_songs(query?)`, `song_details(id)`, `play_in_player(id)`. An assistant that speaks MCP can then be asked for "a bossa nova about rain on a tin roof" and answers with the song's page.

It opens no port and talks only to `127.0.0.1`. It is small, it demonstrates the API better than any example, and it is the proof of the film *Your code.* It ships in the full download and the repository, not in the Registry package (it is a program the user starts, not a node).

### 8.5 Access to the APIs from other computers

Today the Song API answers whoever reaches ComfyUI; with `--listen` that is the network. 2.0:

```toml
# <user>/plenio/config.toml
[api]
remote = "token"     # "token" (default): another computer needs a token · "open": as 1.x · "off": this computer only
```

Tokens are made in *Plenio Setup › API access* (class `local`), shown once, stored as SHA-256 in `<user>/plenio/api/tokens.json` with a name and the date last used, sent as `Authorization: Bearer plenio_…`. This applies to v1 as well. It is the one change of 2.0 that can break a running setup - a Plenio VST3 or a script that reaches ComfyUI over the network - and the migration note and the refusal's text both say how to make a token or set `remote = "open"`.

---

## 9. The player

### 9.1 People & access

Today, in three places: *Settings › Accounts* (users in groups *Listens*, *Makes songs*, *Admin - a helper*; the admin is "this computer"), *Live Play › Let guests see the live playlist* (a QR code; *only look* or *change it*; party songs under *Settings › Party songs*), *Settings › In your network* (a link that opens the whole player and the whole studio). A host who wants "my friends may add songs and make their own, my kids may only listen" visits all three.

2.0 puts them on one page, **People & access**, and names five roles in plain words. The stored groups keep their identifiers, so no state is migrated.

| Role (2.0) | Is today | Comes in by | Keeps their own playlists |
|---|---|---|---|
| **Host** | the admin, on this computer | being at this computer | yes (the player's own) |
| **Co-host** | group *Admin - a helper* | an account | yes |
| **Maker** | group *Makes songs* | an account | yes |
| **Listener** | group *Listens* | an account | yes |
| **Party guest** | a phone on the guests' page | the party's QR code, no account | no (their phone remembers their songs) |

*My devices* (today *In your network*) is not a role: it is the host on another screen, and the page says so.

```text
People & access
┌ My devices ─────────────┐ ┌ Party ───────────────────┐ ┌ People ──────────────────┐
│ Your player on your      │ │ Guests scan a code and   │ │ Family and friends with  │
│ phone, tablet, laptop.   │ │ join in. No account.     │ │ their own playlists.     │
│ [ Show the code ]  off   │ │ [ Start a party ]        │ │ [ Invite someone ]       │
└──────────────────────────┘ └──────────────────────────┘ │ Mia · Maker  Leo · Listener
                                                          └──────────────────────────┘
What each may do                Party guest  Listener  Maker  Co-host   Host
  see what plays, react             ✓           ✓        ✓       ✓        ✓
  add songs to the live playlist    ☐           ☐        ☑       ✓        ✓
  make songs                        ☐           -        ☑       ✓        ✓
  make covers                       ☐           -        ☐       ✓        ✓
  their song plays without approval ☐           -        ☑       ✓        ✓
  approve songs, invite people      -           -        -       ✓        ✓
  remove songs, change settings     -           -        -       ✓        ✓
  folders, stop the player          -           -        -       -        ✓
  ☑ ☐ = you decide   ✓ - = fixed
```

The grid is the single place for what *Settings › Party songs* spreads over six switches today. Three one-click starting points sit above it: **Just me**, **Family** (people listen and make songs, no party), **House party** (guests add and make songs, the host approves).

**Invitations instead of typed passwords.** Today the host types a name and a password for each user and tells them. 2.0: *Invite someone* asks for a name and a role and shows a QR code. The code carries a one-time secret (96 random bits, valid 15 minutes, stored hashed); the invited person opens it, sets their own password (or a four-digit PIN) and is logged in on that device.

```python
# plenio/player/accounts.py
def invite(self, name: str, group: str, *, now: float | None = None) -> str:
    """A one-time code for a new user: valid INVITE_SECONDS, usable once, kept as its hash."""
    code = secrets.token_urlsafe(12)
    with self.lock:
        data = self._load()
        data.setdefault("invites", {})[session_key(code)] = {
            "name": self._name(name), "group": self._group(group),
            "until": (now or time.time()) + INVITE_SECONDS}
        self._save(data)
    return code

def accept(self, code: str, password: str, address: str = "") -> tuple[str, dict[str, Any]]:
    """The invited person sets a password: the user is made, the code is spent, the device is logged in."""
    if self._limited(address):
        raise AccountError("Too many tries from this device. Wait a few minutes.", 429)
    with self.lock:
        data = self._load()
        entry = data.get("invites", {}).pop(session_key(code), None)
        if entry is None or entry["until"] < time.time():
            self._save(data)
            self._failed(address)
            raise AccountError("This invitation is used up or too old. Ask for a new one.", 410)
        ...   # as create(), then _open() a session
```

**Start a party** is three questions and one screen: the party's name (it becomes the album of its songs), what guests may do (the grid's guest column, pre-set from *House party*), and the code on the big screen. It switches on what is needed (the guests' access, Live Play, song making for guests) and *End the party* switches it off again. The settings behind it are the ones that exist; the assistant only sets them together.

### 9.2 Finding one's way

| Today | 2.0 |
|---|---|
| Sidebar: Songs, Favourites, Most played, Recently played, Live Play, Make a song, In the making, saved filters, playlists, folders, ComfyUI, Help, Settings | five places: **Songs**, **Playlists** (smart lists and saved filters inside), **Live** (Live Play and the party), **Make**, **More** (People & access, In the making, Help, Settings) - the same five as the phone's tab bar already has |
| Settings: one page with twelve sections | sections as tabs with a search field over every setting's label; *Basic* shows eight settings, *Everything* the rest |
| *Make a song*: the whole form at once | one field (*What should the song be about?*), the style chips, *Generate*; *More options* opens the fields that exist today; the presets stay on top |
| First start: the library, or an empty one | three cards once: *Your songs are here* · *Press F for the show* · *Having people over? Start a party* - and an empty library says where songs come from, with *Make your first song* |
| *In the making*, *Live Play*, *Now playing*, *Stage* | names stay; each gets a one-line explanation under its heading the first three times it is opened |

Every destructive or outward-facing switch (opening the network, deleting for good) keeps its confirmation.

### 9.3 Visuals: choosing

Ninety-nine visuals are grouped by engine today (*Classic*, *Plenio Drop*, *Plenio Nova*, *My presets*) and steered by six settings (mode, change, crossfade, look, sensitivity, the ticked pool). A listener thinks in what they want to see.

**Collections by what is shown.** Each visual gets one or two themes in its definition (`themes: ['space']`), next to the existing `suits`:

| Collection | Examples from today's set |
|---|---|
| Space | Hyperspace, Nebula, Black hole, Galaxy, Spiral Galaxy, Cosmic Dust, Star Gate |
| Nature | Northern lights, Moonlit sea, Ink in water, Living patterns, Living Coral, Aurora Curtain, Jelly Lanterns |
| Club | Laser show, Neon rings, Strobe Lattice, Shockwave, Spectrum city, Glowsticks, Fireworks |
| Retro & hi-fi | Classic Bars, VU Meters, LED Wall, Vinyl, Oscilloscope, Retro Grid, Outrun, Pulsar |
| Flow | Silk, Velvet Smoke, Liquid chrome, Lava Lamp, Plasma, Mind Blob, Nova · Mandala |
| Geometry | Mandelbulb, Gyroid caves, Kaleidoscope, Honeycomb, Fractal Garden, Harmonograph |
| This song | Cover Galaxy, Title Smoke, Lyric Tunnel, Album Kaleido, Cover Echo, Cover Droste |

**Two controls instead of six** on the first level of the visuals' panel:

- **Show**: *Director* (section 9.4, the new default) · a collection · *One visual* · *Off*.
- **Energy**: one slider from *calm* to *intense*. It sets sensitivity, how often the picture changes and which crossfade is used, together.

*Fine-tune* opens today's settings unchanged for whoever wants them.

**Seeing before choosing.** The gallery of the video dialog - every visual playing in a small window to the music - becomes the picker of the live panel too. On a phone, and for visuals not timed yet, a still stands in: `tools/visual_posters.mjs` renders one poster per visual from a fixed piece of music at build time into a sprite sheet (also used by the docs and the films).

**Curating while watching.** In the full-screen visual: **N** next (exists), **♥** more of this (the visual joins *My favourites*, a collection of its own), **✕** never this one (it leaves the pool). After an evening the pool is the listener's taste, with no list ticked by hand.

### 9.4 Visuals: the Director

The visuals react to a live spectrum: a beat is detected when the bass rises above its recent average [repo: `visuals/analysis.ts`]. That is after the fact by one analysis window, and it knows nothing of what comes next. Plenio knows the song: its bars (API 1.4), its sections, when each word is sung.

**The analysis track.** Once per song the player's server computes, with numpy from the audio it already decodes for the waveform, and keeps in its cache:

```json
{"schema": "plenio.analysis/1", "rate": 50, "seconds": 213.4,
 "beats": [0.52, 1.00, 1.48], "downbeats": [0.52, 2.44],
 "sections": [{"name": "verse", "start": 12.04, "end": 43.1, "energy": 0.41},
              {"name": "chorus", "start": 43.1, "end": 74.2, "energy": 0.83}],
 "bands": {"low": "<base64 u8 × rate × seconds>", "mid": "…", "high": "…"},
 "onsets": {"low": [0.52, 1.00], "high": [0.76]},
 "peaks": [{"t": 43.1, "kind": "drop", "strength": 0.9}]}
```

- Beats and downbeats come from the release's measured bars (`<name>.bars.json`) or the score's times when the song has them; otherwise from the onset envelope's autocorrelation.
- Sections come from the record (the score's sections at their measured times); a song without them gets sections from the novelty of the band energies.
- A *drop* is a downbeat where the low band jumps after at least two quieter bars.
- About 50 KB per song. Other music (not made with Plenio) gets the same track from its audio alone.

```python
# plenio/player/analysis.py - the envelope part
def band_envelopes(mono: np.ndarray, rate: int, out_rate: int = 50) -> dict[str, np.ndarray]:
    """Energy of three bands at ``out_rate`` Hz, each scaled to 0..255 by its own 99th percentile."""
    hop, size = rate // out_rate, 2048
    window = np.hanning(size)
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(mono, (size // 2, size // 2)), size)[::hop]
    power = np.abs(np.fft.rfft(frames * window, axis=1)) ** 2
    hz = np.fft.rfftfreq(size, 1 / rate)
    out = {}
    for name, (lo, hi) in {"low": (30, 150), "mid": (150, 2500), "high": (2500, 12000)}.items():
        e = np.sqrt(power[:, (hz >= lo) & (hz < hi)].sum(axis=1))
        out[name] = np.clip(255 * e / max(np.percentile(e, 99), 1e-9), 0, 255).astype(np.uint8)
    return out

def onsets(envelope: np.ndarray, out_rate: int = 50, refractory: float = 0.09) -> list[float]:
    """Moments the envelope rises sharply: positive flux above 1.5 x its local median, at least 90 ms apart."""
    flux = np.maximum(np.diff(envelope.astype(np.float32), prepend=envelope[:1]), 0)
    local = np.array([np.median(flux[max(0, i - out_rate): i + out_rate]) for i in range(len(flux))])
    picked, last = [], -1.0
    for i in np.flatnonzero((flux > 1.5 * local + 6) & (flux >= np.roll(flux, 1)) & (flux > np.roll(flux, -1))):
        t = i / out_rate
        if t - last >= refractory:
            picked.append(round(t, 3)); last = t
    return picked
```

**The cue.** Every frame, each visual receives a cue computed from the track at the time the listener hears - in addition to the live spectrum, which stays for fine texture:

```ts
// frontend/src/player/visuals/conductor.ts
export interface Cue {
  beatPhase: number      // 0 at a beat, rising to 1 at the next
  barPhase: number
  section: string; sectionProgress: number; sectionEnergy: number
  energy: number         // the bands, smoothed over the next 120 ms as well as the last
  anticipation: number   // 0..1, rising in the 180 ms before a strong onset: the camera leans in
  impact: number         // 1 at the onset, decaying with 120 ms: the hit lands on the sound
  tension: number        // 0..1 across the two bars before a section with more energy: the build-up
}

export function cueAt(a: Analysis, t: number): Cue {
  const i = Math.max(0, upperBound(a.beats, t) - 1)
  const b0 = a.beats[i] ?? 0, b1 = a.beats[i + 1] ?? b0 + 0.5
  const next = a.onsets.low[upperBound(a.onsets.low, t)] ?? Infinity
  const last = a.onsets.low[upperBound(a.onsets.low, t) - 1] ?? -Infinity
  const s = sectionAt(a, t), following = a.sections[a.sections.indexOf(s) + 1]
  const lead = 2 * barSeconds(a, t)
  const rising = following && following.energy > s.energy + 0.15 && following.start - t < lead
  return {
    beatPhase: clamp01((t - b0) / (b1 - b0)),
    barPhase: barPhaseAt(a, t),
    section: s.name, sectionProgress: clamp01((t - s.start) / (s.end - s.start)), sectionEnergy: s.energy,
    energy: lookAheadMean(a.bands, t, -0.08, 0.12),
    anticipation: next - t < 0.18 ? easeIn(1 - (next - t) / 0.18) * strengthAt(a, next) : 0,
    impact: Math.exp(-(t - last) / 0.12) * strengthAt(a, last),
    tension: rising ? easeIn(1 - (following.start - t) / lead) : 0,
  }
}
```

**The time the listener hears.** The spectrum is tapped before the sound leaves the computer; a Bluetooth speaker or a television adds 100 to 250 ms, and today the picture and the lyrics run ahead of the sound by that much. 2.0 computes the cue, the lyrics' highlight and the notation's cursor for

```ts
const heard = audio.currentTime - (context.outputLatency ?? context.baseLatency ?? 0) - settings.syncOffset
```

`outputLatency` is reported by Chrome, Edge and Firefox; *Settings › Sound › Picture and sound together* shows the value in use and has a slider (-300 to +300 ms) with a test pattern - a tick and a flash - for systems that report nothing.

**The Director** is the mode that uses all of it. It replaces *Match the music* as the default:

- One visual per **kind of section**: every chorus gets the same one, every verse another (the rule the video maker already offers), chosen from the pool by the section's energy against the visuals' `suits`.
- The change falls **on the section's downbeat**, known in advance, with the crossfade started early enough to be half through at the downbeat.
- The two bars before a louder section raise `tension`; visuals map it to their own build-up (zoom, brightness, colour fringing) and release it with `impact` on the downbeat.
- A drop gets the strongest transition (*Flash on the beat*); a quiet bridge gets the slowest (*Melt*).

Existing visuals gain `anticipation`, `impact` and `tension` through the shared uniforms and the mixer first (every visual benefits without a rewrite); the twelve signature visuals (section 9.6) are then tuned by hand.

### 9.5 Visuals: every device

| Finding [repo] | Change |
|---|---|
| `gpu.ts:59`, `nova/renderer.ts:202`, `drop/renderer.ts:485` ask for `EXT_color_buffer_float`, then allocate `RGBA16F`. Devices that offer only `EXT_color_buffer_half_float` - most phones - are told Nova cannot draw | accept either extension for `RGBA16F` targets; fall back to `RGBA8` with dithering when neither exists |
| Quality is pixels only: the governor removes pixels when frames come late | each Nova scene gets a `uQuality` uniform (0.5 to 1) that scales its march steps and noise octaves; the governor lowers quality before pixels, so a phone keeps a sharp picture with simpler light |
| One timing run decides whether a Nova visual is offered | unchanged; the result also sets the device's tier (below) |
| No frame cap | on battery (`navigator.getBattery`, where it exists) or on a coarse pointer with at most 4 GB (`navigator.deviceMemory`): 30 frames a second, and the device pixel ratio capped at 2 |

| Tier | Detected by | Gets |
|---|---|---|
| A · desktop card | WebGL2 on a graphics card, Nova median under 3 ns per pixel | everything, quality 1, up to 2560 × 1440 |
| B · integrated or phone | WebGL2 on a graphics card, slower | Drop at 0.75, Nova at quality 0.6 and as many pixels as fit, 30 or 60 frames by battery |
| C · no usable WebGL2 | none, or drawn by the processor | the classic visuals, with the Director's cues |

The whole pipeline stays WebGL2. A WebGPU renderer would reach fewer devices than WebGL2 does and would mean rewriting two renderers for no picture a listener could tell apart; it is not part of 2.0.

### 9.6 Visuals: one light, twelve signatures

- **One light for all three engines.** Nova's finishing - glow round the bright parts, a filmic tone curve, a trace of colour fringing on the beat, darker corners, fine grain - moves into the mixer's last pass and applies to classics and Drop as well. A change from a classic to a Nova scene no longer looks like a change of program.
- **Twelve signature visuals**: the twelve that are shown first, in the films and to a new user. Chosen by the owner from the ninety-nine; each tuned by hand for the Director's cues, each with a poster. The others stay under *All visuals*. Quality before number: 2.0 adds no visual until these twelve are finished.
- **Motion in the page.** The cover already travels from a card to the song's page as one element [repo: `store.ts:202`, `SongView.vue:467`]. 2.0 extends the same technique to the three moves a user makes most: a card to Now playing, the slim player to the full one, a playlist's row to its page. Everything else gets one easing and one duration (`--ease: cubic-bezier(.2,.8,.2,1)`, 220 ms) from `styles.css`, and all of it rests under `prefers-reduced-motion` (handled already in `layout.ts`).

### 9.7 The guests' page in the guest's language

A party guest meets one page, on their phone, with no introduction. It is the only part of Plenio where the reader did not choose the software. 2.0 translates **the guests' page** (about sixty strings) into German, Spanish, French, Italian, Portuguese and Japanese, chosen from the phone's language, with English as the fallback. The player itself and ComfyUI stay English (ADR-0008); this is an exception for one page, recorded as ADR-0012.

---

## 10. Quality: tests, security, documentation

### 10.1 Tests

Measured on the owner's machine with ComfyUI's Python [measured 2026-11-11]:

| Suite | Tests | Time | Note |
|---|---|---|---|
| unit, workflows, data schemas | 2 110 (CI form: 2 048) | 144 s (188 s under load) | 93 files |
| of which the player's tests | 142 | 73 s | `test_player.py` 24 s, `test_player_network.py` 19 s, `test_player_guests.py` 7 s |
| of which teardowns, all files | - | 37 s | two servers stopped per test, about half a second each |
| of which other slow files | - | 60 s | `test_llm.py` 14 s, `test_score_editor.py` 13 s, `test_audio.py` 6 s, `test_workers.py` 5 s |
| of which every test under 0.05 s | the great majority | about 10 s | |
| contract and host (CPU, fake models) | 232 | 272 s | one ComfyUI server per session |
| frontend (Vitest) | 698 | not measured here | 88 files |
| browser check | 111 | by hand | needs a server and Playwright |

The suite is not too large. It is slow in three places, each with a plain cause:

| Cause | Evidence | Fix | Expected |
|---|---|---|---|
| `ThreadingHTTPServer.serve_forever()` polls every 0.5 s; `shutdown()` waits for the next poll. Tests start and stop two servers each | 37 s of teardown; rows of 1.02 s | `serve_forever(poll_interval=0.02)` when a test starts the server (a parameter of `serve_guests` and `serve`, default unchanged); servers that a module's tests only read are started once per module | -35 s |
| PBKDF2 with 240 000 iterations per password, per test | `test_player_accounts.py`: about 1 s per test | `Accounts(folder, iterations=1_000)` in tests; one test keeps the production number and checks it | -4 s |
| Real processes: a player started and found again (10 s, 7 s), llama shims (2-3.5 s each), sockets that wait for a timeout (2 s) | the ten slowest tests | mark them `process`; they run in the same job but in parallel (`pytest -n auto` on these files is safe: each binds port 0) | -30 s |
| torch imported by two adapter tests in the unit job | 6.8 s and 4.4 s | they already skip in CI's unit job (no torch there); move them to the host job where torch is loaded anyway | cleaner tiers |

**Tiers and budgets.**

| Tier | Marker | Contains | Budget | Runs |
|---|---|---|---|---|
| fast | (none) | pure logic: scores, lyrics, DSP, records, plans, catalogue, API shapes | 30 s | every push, both systems |
| io | `io` | local servers, files, worker processes | 60 s with `-n auto` | every push, both systems |
| host | `host` | ComfyUI in process and as a server, fake models | 5 min | every push, Linux; the minimum and the newest ComfyUI |
| browser | - | `tools/browser_check.mjs`, headless, empty model files | 6 min | pushes to `main`, Linux |
| smoke | `smoke` | real models | - | the owner's machine before a release (`tools/release.py` asks for the report) |

`pytest-xdist` joins the development tools. A test that needs a fixed port or a shared folder is a bug to fix, not a reason to run serially.

**Which tests are necessary.** Counting lines covered answers "is this code run", not "would a fault be noticed". 2.0 answers the second question for the modules where a silent fault costs a song:

```bash
# tools/mutation.sh - weekly, and before a release, on the critical core modules
python -m mutmut run --paths-to-mutate plenio/core/score/ops.py,plenio/core/score/note_repair.py,\
plenio/core/lyrics_fit.py,plenio/core/audio/loudness.py,plenio/core/audio/dynamics.py,\
plenio/core/release.py,plenio/core/access.py,plenio/core/modelplan.py,plenio/core/assets/fetch.py \
  --runner "python -m pytest tests/unit -x -q -m 'not io'"
```

- A **surviving mutant** names a line no test would miss: a test is added, or the line is dead and removed.
- With per-test coverage contexts (`coverage run --contexts=test`) the report lists tests whose every covered line is covered by an earlier, shorter test **and** that kill no mutant the others do not: candidates to merge. They are reviewed by a person, never deleted by a script; a test named after a reported bug stays.
- Property tests get profiles: 25 examples on every push, 300 in the weekly run.

Target after phase T: fast + io under 90 s on the owner's machine, the same assertions as today minus the merged duplicates, plus the tests the mutants asked for.

### 10.2 Security, as a property that is tested

| Property | Test |
|---|---|
| no launch site outside the accepted ones | `tools/package_gate.py` on the packed zip (section 3.3) |
| every route has an access class, and the class holds | one parametrised test over `ROUTES`: each `local` route answers a remote peer with 403 and names no path; each `api` route answers a remote peer without a token with 401 |
| no absolute path and no exception text in an answer to a remote caller | the existing audit regressions, extended to v2 |
| downloads fetch catalogue entries only, to registered model folders only | the download route takes a variant id; a property test feeds ids, paths and URLs |
| the token is sent to huggingface.co only | the redirect test of section 5.5 |
| no `eval`, `exec`, pickle load, runtime package installation | ruff `S102`, `S307` (configured today) plus `S301`, `S605`, `S602` in 2.0 |

SECURITY.md keeps its form (what Plenio downloads, starts, listens on and writes) and gains the generated route table with access classes and the list of accepted launch sites.

### 10.3 Documentation that cannot drift

**Facts.** `tools/facts.py` computes from the code and writes `docs/facts.json`:

```json
{"version": "2.0.0", "nodes": 39, "blueprints": 14, "templates": 6, "recipes": 6, "brief_templates": 250,
 "visuals": {"classic": 25, "drop": 51, "nova": 22}, "tests": {"python": 2110, "frontend": 698},
 "comfyui": {"minimum": "0.41.0", "tested": ["0.41.0", "0.44.0"]}, "api": {"song": "2.0", "player": "1.0"},
 "install_line": "comfy node install comfyui-plenio-music", "routes": [...], "models": [...]}
```

Markdown refers to facts between markers, which `tools/facts.py --write` fills and `--check` (in CI) verifies:

```markdown
Plenio adds <!--fact:nodes-->39<!--/fact--> nodes where ComfyUI has nothing equivalent.
<!--facts:hardware-table-->
| GPU memory | YuE2 | MiniMax Music 3 | Cover Art | Writer |
...generated from resources/models.toml...
<!--/facts-->
```

Generated blocks: counts in README and docs, the hardware table (from the catalogue), the model tables of `docs/user/models.md`, the route table of SECURITY.md, the environment variables of `docs/user/configuration.md` (from `core/config.py`), the tutorial table and every video link (from `resources/media.toml`, see the marketing document, section 6).

**A documentation site.** The user guide stays Markdown in `docs/user/` (it ships in the package, and the node help links to it). A VitePress build - the Vue and Vite toolchain the repository already has - renders it with search, a sidebar and the embedded how-to chapters, and is deployed to GitHub Pages together with the demo page, the API reference and the go-links by one workflow. README links go to the site; the Markdown stays readable on GitHub.

**Checks in CI**: every relative link resolves; every node has a help page and every input a tooltip (exists); every environment variable and config key in the code is documented and the reverse; every route is in the API reference or marked internal; no `youtu.be` link outside generated blocks.

**What is rewritten by hand for 2.0**: *Getting started* (around Setup), *Models and downloads* (around the plan), *Plenio Player* (90 KB today: split into Listening, Visuals, Party, Making songs, People & access, Sharing, Videos, each with its how-to chapters), *Troubleshooting* (every finding of the System Check with its fix), the API guide for v2, and a migration page *From 1.x to 2.0*.

---

## 11. What changes for people who have 1.x

| Change | Who notices | What they do |
|---|---|---|
| ComfyUI 0.41.0 is the minimum | users on 0.37-0.40 | update ComfyUI; 1.6.0 stays installable for them |
| Another computer needs a token for the Song API | VST3 or scripts that reach ComfyUI over the network | make a token in Setup, or set `remote = "open"` |
| Registry installs carry no Studio add-on | Registry users who let the player start ComfyUI, or who run GGUF writers through a `llama-server` binary found by Plenio | start ComfyUI as usual; run the GGUF in LM Studio, Ollama or a `llama-server` of their own, install `llama-cpp-python`, take the native writer - or install by `git clone` |
| The templates' model blocks say `auto` | everyone, in new workflows | nothing; saved workflows keep their files |
| *Admin*, *helper*, *In your network* are called *Host*, *Co-host*, *My devices* | the player's users | nothing; accounts and settings are the same |
| Tutorial links go through go-links | nobody | - |

---

## 12. Decisions for the owner

| Id | Decision | Recommendation | If decided otherwise |
|---|---|---|---|
| D-1 | Two artefacts; the three launchers leave the Registry package (section 3.1) | yes | the Registry status stays as it is; sections 3.3 and 3.4 still apply |
| D-2 | A canary release 1.7.0 with only the boundary (section 3.5) | yes | **decided 2026-11-11: no** - no pre-release versions; 2.0.0 carries the boundary and learns the verdict after its launch |
| D-3 | Minimum ComfyUI 0.41.0 | yes | keep 0.37.0 and its two frontend repairs |
| D-4 | Plenio downloads ComfyUI-format model files itself, after the user's confirmation in Setup | yes | Setup shows the plan and links; files are fetched by hand or by ComfyUI's dialog |
| D-5 | `downloads = "ask"` as the default for runs that lack a file | yes | `auto`: the first run downloads without asking, as the writer does today |
| D-6 | The native Gemma 4 12B as the writer where no GGUF can run; its order against the GGUF by measurement | yes | newcomers without llama.cpp keep the stop with instructions |
| D-7 | API tokens for other computers, also for v1 | yes | v1 stays open as in 1.x; only v2 asks for a token |
| D-8 | The MCP server | yes; small, and the proof for developers | leave out |
| D-9 | Role names Host, Co-host, Maker, Listener, Party guest | yes | keep today's names; the page and the grid still come |
| D-10 | The Director as the default visual mode | yes, after the owner watched it on ten songs | *Match the music* stays the default, the Director is a choice |
| D-11 | Twelve signature visuals chosen by the owner; no new visual before they are tuned | yes | - |
| D-12 | The guests' page in seven languages (ADR-0012) | yes | English only |
| D-13 | A VitePress documentation site on GitHub Pages | yes | Markdown on GitHub only, with the generated facts |
| D-14 | Album mode (a brief becomes a track list, coherent covers, one shared player) | **after 2.0**: it is a new feature, and 2.0's promise is that what exists works for everyone | - |

---

## 13. Risks

| Risk | Likelihood | Effect | Answer |
|---|---|---|---|
| The Registry flags 2.0.0 for a class outside the three launchers | medium | 2.0.0 is not listed as active | the seam of section 3.1 moves the named module in 2.0.1; the launch texts name `git clone` and `comfy node install` first until the verdict is known |
| The native Gemma 4 12B is too slow or too large on 12-16 GB | medium | the newcomer's writer is the E4B | the plan's thresholds come from phase 0; the E4B and E2B steps exist |
| Model Choice feeding ComfyUI's loaders breaks on a ComfyUI release | low | templates do not run | it is Writer Choice's pattern, in production since 1.5.1; the weekly canary against ComfyUI `master` finds it first |
| Downloading model files adds a network finding for the Registry | low | a new *info* finding | the downloader exists and is in every review request since 1.5.1; it fetches pinned catalogue entries only, behind a `local` route |
| The Director misjudges songs without bars or sections (other music) | medium | restless or dull pictures | it falls back to *Match the music* when the track's confidence is low; D-10 keeps the owner's eye on it |
| The token requirement surprises VST3 users | medium | support questions | the refusal names the fix; the VST3 release with a token field ships the same day |
| 2.0 grows beyond its promise | high | a late release | section 12, D-14: new features wait; every phase of the plan has an exit that ships |
