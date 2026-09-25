# Plenio Music Production System

A ComfyUI custom node package for making songs with local music models: writing lyrics and style with a local LLM, generating with **YuE2** (with an editable score) and **MiniMax Music 3**, covering existing recordings with **YuE2 Cover**, and finishing and exporting releases.

> **Status: alpha (0.1.0).** All five templates are built: YuE2 Song and YuE2 Cover are tested end to end on an RTX 5060 Ti 16 GB; MiniMax Music 3, mastering and cover art are tested with ComfyUI on the CPU and wait for their runs with the real models. See [CHANGELOG.md](CHANGELOG.md) and the [implementation roadmap](docs/design/implementation-roadmap.md).

## How it works

Plenio uses ComfyUI's own nodes wherever they exist (YuE2, SheetSage2, MiniMax Music 3, `TextGenerate`, loaders, samplers, loops, switches) and adds a small set of reusable nodes where ComfyUI has nothing equivalent. Each music model has its own template, so every workflow shows only the controls that apply to it:

| Template | For |
|---|---|
| **0 · System Check** | installation and hardware diagnostics: which model files each template still needs, a hardware rule table |
| **1 · YuE2 · Song** | new songs with YuE2, with inspectable and editable text and score ([guide](docs/user/paths/yue2-song.md)) |
| **2 · YuE2 · Cover** | new versions of an existing recording: instrumental, original or new lyrics ([guide](docs/user/paths/yue2-cover.md)) |
| **3 · MiniMax · Song** | new songs with MiniMax Music 3 and its structured caption ([guide](docs/user/paths/minimax-song.md)) |
| **4 · Enhance & Master** | finishing an existing audio file: EQ, loudness, FLAC/MP3/WAV with tags ([guide](docs/user/paths/enhance-master.md)) |

Every song template finishes with mastering (-14 LUFS, -1 dBTP) and can paint a cover with FLUX.2 Klein 4B (optional). Templates 0, 1, 3 and 4 also run as a simple form in ComfyUI's App mode.

Open them from ComfyUI's template browser (listed under the name of this package's folder).

## Install

Requires ComfyUI **0.37.0 or newer**.

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/jplenio/comfyui-plenio-music
```

Restart ComfyUI, then open the **0 · System Check** template and run it. Plenio installs no extra Python packages; optional features tell you the exact install command when they need one.

## Licences

- Plenio's code: [Apache-2.0](LICENSE). Bundled third-party code: [THIRD_PARTY.md](THIRD_PARTY.md).
- **Model weights have their own licences.** YuE2, YuE2-VAE and SheetSage2 are **CC BY-NC 4.0 (non-commercial)**; MiniMax Music 3 uses the MiniMax-Music3 Community License with commercial conditions; FLUX.2 Klein 4B (cover art) is Apache-2.0. See [docs/user/licensing.md](docs/user/licensing.md) and [the model guide](docs/user/models.md).

## Documentation

- Users: [docs/user](docs/user/README.md)
- Contributors: [docs/dev](docs/dev/architecture.md), design documents in [docs/design](docs/design/README.md), decisions in [docs/adr](docs/adr/README.md)
