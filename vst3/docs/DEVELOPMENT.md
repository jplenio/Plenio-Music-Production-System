# Developing Plenio VST3

How the plug-in is built, how it is put together, how to try a change, and how it stays in step with Plenio.
Every path here is inside `vst3/`, the plug-in's folder of the Plenio repository; run the commands from there.

## The folder

| Folder | What |
|---|---|
| `src/core` | everything without VST3: the song and its takes, the session (making takes with Plenio's Song API), the library, DAW files, the timeline, MIDI, audio files, cover art, paths, the log |
| `src/engine` | the player: the take, its stems and MIDI in time with the host, on the audio thread |
| `src/plugin` | the two plug-ins (`instrument`, `ara_effect`), the song controller (the UI's calls and events), REAPER |
| `src/ara` | Plenio ARA: the document controller, audio sources, content readers, the playback renderer |
| `src/ui`, `src/platform` | the editor (a WebView inside the host's window), dialogs, drag and drop, the main thread |
| `webui` | the window's UI: Vue 3, Vite, TypeScript; its demo backend (`src/mock`) for the browser |
| `tests` | doctest: the core, the engine, REAPER against a fake REAPER |
| `tools` | build, package, install, dev tools, media, Plenio check |
| `installer` | Windows (Inno Setup), macOS (`pkgbuild`) |
| `docs` | the tutorial, the DAWs, testing in a DAW, the media |

## Building

All dependencies are fetched at pinned versions into `external/` (`tools/fetch_deps.ps1`, PowerShell 7 on every
system; a patch for choc in `cmake/patches`).

**Windows** (Visual Studio 2022, Node 22):

```powershell
pwsh tools/fetch_deps.ps1
pwsh tools/build.ps1            # web UI, Plenio.vst3, tests, EditorHost; the VST3 validator runs after the build
build\bin\Release\plenio_tests.exe
pwsh tools/install.ps1          # into C:\Program Files\Common Files\VST3 (asks for administrator rights)
pwsh tools/package.ps1          # installer (needs Inno Setup 6), zip, checksums into dist\
```

**macOS** (Xcode command line tools, CMake, Node 22; experimental):

```bash
pwsh tools/fetch_deps.ps1
(cd webui && npm ci)
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES="arm64;x86_64" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=13.3 -DSMTG_BUILD_UNIVERSAL_BINARY=OFF
cmake --build build --parallel
installer/macos/build_pkg.sh build/VST3/Release/Plenio.vst3 2.0.0 dist
```

**Linux**: the core and its tests (the plug-in's window there is still to come, so `PLENIO_BUILD_PLUGIN` is off):

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DSMTG_ENABLE_VST3_HOSTING_EXAMPLES=OFF -DSMTG_RUN_VST_VALIDATOR=OFF -DPLENIO_BUILD_WEBUI=OFF
cmake --build build --target plenio_tests && build/bin/Release/plenio_tests
```

## How it fits together

- **Threads.** The host's main thread runs the UI, the session and the REAPER API; workers do HTTP, downloads,
  decoding, resampling and the library; the audio thread only reads what the player was given (`engine/player`).
  `platform/main_thread` brings results back (a message window on Windows, the main run loop on macOS).
- **The song.** A `Song` (core/song.h) holds the brief, its documents, the takes and the edits since the active take.
  A take never changes once made. The library keeps every song in `<library>/<title> [<id>]` (song.json, takes, stems,
  DAW files, cover.jpg); the project's state keeps the song as well, so a project opens without the library's audio
  and without ComfyUI.
- **Plenio.** The session talks to Plenio's Song API v2 (`/plenio/api/v2`: templates, briefs, jobs, bars, models,
  uploads, scores as MIDI and back). `Studio` finds ComfyUI (8188, 8000, the port in
  `~/.plenio/comfyui-start.json`), asks for v2 first and falls back to v1 for a Plenio before 2.0
  (`PlenioClient::api`), and can start a ComfyUI on this computer. A job is followed on the API that made it
  (`PlenioClient::jobPath`: an id `job_…` is v2's), so a project saved before the update still gets its takes.
  A v2 job is ordered with `"review": []`; one cut short by a restart of ComfyUI comes back as `interrupted`.
- **Another computer.** *Settings* take a host name and a token; the token goes into every request as
  `Authorization: Bearer …` and is kept in the system's credential store (Windows Credential Manager; elsewhere a
  file only the user can read), never in `settings.json`, a project or the UI's state (`core/settings`).
- **The timeline.** "The audio is the master": the bars Plenio measured in a take (`/jobs/{id}/bars`) give the tempo
  map; `timeline::layOut` puts the score and the audio on the project's time with the lead-in bars. Every DAW file
  starts at the project's start.
- **The UI.** `ui/webview_panel` shows `webui/dist` (compiled into the plug-in) in a WebView (choc: WebView2 on Windows,
  WKWebView on macOS). Calls go through `window.plenioCall(JSON)`, events come back through `window.__plenioEvent`;
  `/files/…` serves files the controller names (covers).
- **REAPER.** Through `IReaperHostApplication`: tracks marked with `P_EXT:plenio`, takes, regions, the tempo map,
  track icons; Plenio's audio in a project keeps its time (timebase Time). Tested against a fake REAPER
  (`tests/plugin/test_reaper.cpp`).
- **ARA.** A clip whose name and length match a take (`core/clip_content`) gets the take's tempo, bars, key, notes and
  chords as ARA content; another take can play in the same clip.

## Trying a change

| Tool | What |
|---|---|
| `tools/dev/editorhost.ps1 [-DevHome .dev\demo-home] [-Ui]` | the plug-in in the SDK's EditorHost, with a home of its own (`PLENIO_VST3_HOME`: settings, cache, songs) and the DevTools on port 9333; `-Ui` loads `webui/dist` from disk |
| `tools/dev_comfyui.ps1 [-Stop]` | a ComfyUI of its own (port 8190) with Plenio from this checkout |
| `node tools/dev/cdp.mjs eval|call|shot|wait` | drives the plug-in's page over the DevTools protocol |
| `cd webui && npm run dev` | the UI in a browser with the demo backend; `?state=song|empty|busy|offline|new|ara`, `?tab=…`, `?host=REAPER` |
| `tools/dev/ara_test.ps1` | the ARA SDK's test host against Plenio ARA |

Tests: `plenio_tests` (doctest), `npx vitest run` and `npm run typecheck` in `webui`, the VST3 validator after every
build, `python tools/docs/make_daws_md.py --check`, `python tools/plenio.py check`. The repository's CI runs the
last two with every push (`ci.yml`) and builds the plug-in when `vst3/` or the version changes (`vst3.yml`:
Windows with the validator, the core on Linux, the macOS bundle).

## Every DAW's steps

`webui/src/daws.json` holds them: the DAW tab shows them (the host's first, by its name), and
`python tools/docs/make_daws_md.py` writes [DAWS.md](DAWS.md) from the same file. CI checks that both match.

## In step with Plenio

The plug-in and Plenio are one repository and one version (`CMakeLists.txt` reads it from `../pyproject.toml`).
Most of Plenio reaches the plug-in at run time: it asks the Song API for the styles, fields, values and models and
shows what it gets, so new studio switches appear in the brief by themselves.

What the plug-in relies on beyond that is checked by **`tools/plenio.py`**:

```bash
python tools/plenio.py check   # Song API v2's and v1's routes, the fields the plug-in sets, the release record, the demo's styles
python tools/plenio.py sync    # after a change to the styles or the version: the demo's styles, the version as tested
```

The CI's fast tier runs `check`: a change to the API that would break the plug-in fails in the pull request that
makes it. `resources/plenio-compat.json` says which Plenio the plug-in works with: `minimum` (songs can be made),
`recommended` (everything works; the status pill compares with it) and `tested` (this checkout's version). The
build compiles it in.

## Media

The screenshots, animations and videos come from the real plug-in:

| Script | What |
|---|---|
| `tools/media/tour.mjs <out> <scene …>` | drives the plug-in (EditorHost or a DAW with the DevTools port) with a drawn pointer and records frames: `new-song`, `takes`, `lyrics`, `notes`, `daw`, `cover`, `library`; `timelapse` while takes are made |
| `tools/media/make_media.py anims|clips <tour>` | the GIFs in `docs/media/anim`, 1080p clips for the videos |
| `tools/media/render_brand.py` | logo, banner and social preview from `docs/media/src` (headless Edge or Chrome) |
| `tools/media/make_teaser.py`, `make_tutorial.py` | the teaser and the tutorial video, cut to the demo song's bars |
| `tools/media/reaper/` | REAPER's pictures and clips: Lua scripts run in the open REAPER (`reaper.exe -nonewinst <script>`: the instrument dialog, Plenio's floating window, zoom, play, stop, save, quit), `capture.ps1` (a window or the screen as PNG), `window.ps1` (place a window, send it keys), `mouse.ps1` (move and click, for recordings) |

The videos' music is a YuE2 song (CC BY-NC 4.0), so the videos are no part of the repository; they are linked by
their keys in `resources/media.toml`.

## Releasing

The plug-in is released with Plenio ([docs/dev/release.md](../../docs/dev/release.md)): the tag `v<version>` runs
`release.yml`, which calls `vst3.yml` with `package` and puts the Windows installer, the zip, the macOS package
(when it built) and their checksums onto the GitHub release. Locally: `pwsh tools/package.ps1` (Inno Setup 6).
