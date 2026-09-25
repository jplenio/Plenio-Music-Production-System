# Getting started

## Requirements

- ComfyUI **0.37.0** or newer (it provides the native YuE2, SheetSage2, MiniMax Music 3, FLUX.2 and text-generation nodes Plenio builds on)
- an NVIDIA GPU for the music models (Plenio is developed and measured on a 16 GB card; the System Check's rule table covers smaller and larger ones). *4 · Enhance & Master* runs on the CPU.

## Install

Install through the ComfyUI Manager/Registry (`comfyui-plenio-music`) or clone the repository into `ComfyUI/custom_nodes` and restart ComfyUI. Plenio installs no Python packages.

## First run

1. Open the template browser and choose **0 · System Check** (listed under the Plenio package).
2. Press **Run**. The node shows versions and GPUs, which model files each template still needs, the download policy, and the hardware rule table with the row for your machine marked.
3. Nothing is changed automatically. You choose model files in the loader nodes of each template.

## Choosing a template = choosing the music model

Each music model has its own template, so every workflow shows only the controls that apply to it.

| Template | Use it for | Guide |
|---|---|---|
| 0 · System Check | checking the installation | this page |
| 1 · YuE2 · Song | new songs with YuE2, with an editable score | [guide](paths/yue2-song.md) |
| 2 · YuE2 · Cover | new versions of a recording you own or may use | [guide](paths/yue2-cover.md) |
| 3 · MiniMax · Song | new songs with MiniMax Music 3 | [guide](paths/minimax-song.md) |
| 4 · Enhance & Master | finishing an existing audio file | [guide](paths/enhance-master.md) |

When you open a template, ComfyUI offers to download the model files it is missing ([Models and downloads](models.md)).

## How a template is laid out

Every template reads from left to right in numbered groups, with the same anatomy:

```text
1 · SONG / SOURCE  ->  2 · WRITE  ->  3 · SHEET(S)  ->  4 · RENDER  ->  5 · FINISH
   the brief           the writer     what the model    take seed,     Master -> Export
                                      receives          the render     (+ Cover Art, optional)
                       MUSIC MODEL (collapsed, below): the model files
```

- **About this template** (the note on the left) explains the path in a few steps.
- **Song Sheets** show exactly what the music model receives; you can edit every document there ([Song Sheet](concepts/song-sheet.md)).
- **Nodes and grey groups marked *(optional)*** are switched off (bypassed). Select the nodes and press **Ctrl+B** to switch them on - for example *Cover Art*, which needs extra model files.
- The **MUSIC MODEL** block is collapsed: expand it (the dot at its top left, or right-click > *Expand*), then open it with the icon at its top right to change the model files.
- **Plenio · Master** finishes every song (tone match, -14 LUFS / -1 dBTP) before Export; Export also keeps the unmastered take as `(original).flac`.

## Where your songs go

Export writes into ComfyUI's output folder, `output/plenio/` (Enhance & Master: `output/plenio/enhanced/`):

- `<date> <title>.flac` (and MP3/WAV if chosen) - the mastered song, with tags
- `<date> <title> (original).flac` - the unmastered take
- `<date> <title>.jpg` - the cover, if Cover Art is on
- `<date> <title>.plenio.json` - the release record: the documents, seeds and settings of the run, reports, measured loudness and model licences

(Enhance & Master names the files after the title alone; change *naming* in Export as you like.)

## App mode

Templates 0, 1, 3 and 4 also work as a simple form: switch **Graph / App** at the top left of the canvas. The app shows the brief (or the file), the take seed and the results; see [App mode](concepts/app-mode.md). Use the graph view to review and edit Song Sheets.

## Next steps

- [Models and downloads](models.md), [Licensing](licensing.md), [Configuration](configuration.md)
- [Troubleshooting](troubleshooting.md)
