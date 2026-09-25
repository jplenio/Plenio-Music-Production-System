# Plenio Music Production System

A ComfyUI custom node package for making songs with local music models: writing lyrics and style with a local LLM, generating with **YuE2** (with an editable score) and **MiniMax Music 3**, covering existing recordings with **YuE2 Cover**, and finishing and exporting releases.

> **Status: alpha (0.1.0).** The foundation and the **YuE2 Song** path work end to end (brief to FLAC, tested on an RTX 5060 Ti 16 GB). Cover, MiniMax and mastering follow. See [CHANGELOG.md](CHANGELOG.md) and the [implementation roadmap](docs/design/implementation-roadmap.md).

## How it works

Plenio uses ComfyUI's own nodes wherever they exist (YuE2, SheetSage2, MiniMax Music 3, `TextGenerate`, loaders, samplers, loops, switches) and adds a small set of reusable nodes where ComfyUI has nothing equivalent. Each music model has its own template, so every workflow shows only the controls that apply to it:

| Template | For |
|---|---|
| **0 · System Check** | installation and hardware diagnostics |
| **1 · YuE2 · Song** | new songs with YuE2, with inspectable and editable text and score ([guide](docs/user/paths/yue2-song.md)) |
| **2 · YuE2 · Cover** | new versions of an existing recording *(planned)* |
| **3 · MiniMax · Song** | new songs with MiniMax Music 3 *(planned)* |
| **4 · Enhance & Master** | finishing an existing audio file *(planned)* |

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
- **Model weights have their own licences.** YuE2, YuE2-VAE and SheetSage2 are **CC BY-NC 4.0 (non-commercial)**; MiniMax Music 3 uses the MiniMax-Music3 Community License with commercial conditions. See [docs/user/licensing.md](docs/user/licensing.md).

## Documentation

- Users: [docs/user](docs/user/README.md)
- Contributors: [docs/dev](docs/dev/architecture.md), design documents in [docs/design](docs/design/README.md), decisions in [docs/adr](docs/adr/README.md)
