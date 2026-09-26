# Getting started

## Requirements

- ComfyUI **0.37.0** or newer (it provides the native YuE2, SheetSage2, MiniMax Music 3, FLUX.2 and text-generation nodes Plenio builds on)
- an NVIDIA GPU for the music models (Plenio is developed and measured on a 16 GB card; the System Check's rule table covers smaller and larger ones). *4 · Enhance & Master* runs on the CPU.

## Install

- **ComfyUI Manager:** *Manager → Custom Nodes Manager*, search for **Plenio Music Production System**, install, restart ComfyUI.
- **Comfy CLI:** `comfy node install comfyui-plenio-music`.
- **By hand:** `git clone https://github.com/jplenio/Plenio-Music-Production-System` inside `ComfyUI/custom_nodes`, then restart ComfyUI.

Plenio installs no Python packages. Optional: `python -m pip install faster-whisper` (covers with lyrics), in the Python that runs ComfyUI. Cover art is embedded in FLAC and MP3 without any extra package.

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

## Two ways to work

The first field of the **Song Brief** - and of the **Cover Brief** - is the **mode**. It decides what a run does:

- **new song every run** (default of the song templates): every run writes and renders a **different song** from the same brief, without stopping. To make a series with one click, set the batch count next to **Run** (in App mode: *Number of runs*) - ten runs, ten songs, each exported under its own title (a repeated title gets ` (2)`, ` (3)`, ...).
- **one song, stop to review**: the run stops at each **Song Sheet**. Open it, check or edit the documents, press *Approve*, and run again; YuE2 stops twice (text, then score). Once everything is approved, every further run is a **new take** of the same song.

The writer's **Draft seed** (its own node next to *Write Song*, also in App mode) is *fixed* by default; set it to *randomize* for even more varied series - in *one song, stop to review* keep it *fixed*, or every run brings a new text to approve.

The cover template offers *one cover, stop to review* (its default) and *new cover every run* (a new title, style and - for new lyrics - new lyrics on the same transcription every run). The Song Sheets' *review* is set to **as the brief says**; set a single sheet to *continue* or *stop for review* to override the brief.

## Where your songs go

Export writes into ComfyUI's output folder, `output/plenio/` (Enhance & Master: `output/plenio/enhanced/`):

- `<date> <title>.flac` (and MP3/WAV if chosen) - the mastered song, with tags
- `<date> <title> (original).flac` - the unmastered take
- `<date> <title>.jpg` - the cover, if Cover Art is on (it is also embedded in the FLAC and MP3 files)
- `<date> <title>.plenio.json` - the release record: the documents, seeds and settings of the run, reports, measured loudness and model licences

(Enhance & Master names the files after the title alone; change *naming* in Export as you like.)

## App mode

Every template also works as a simple form: switch **Graph / App** at the top left of the canvas. The app shows the mode, the brief (or the file), the take seed, buttons that open the Song Sheets - for review and editing, as in the graph - and the results; see [App mode](concepts/app-mode.md).

## Next steps

- [Models and downloads](models.md), [Licensing](licensing.md), [Configuration](configuration.md)
- [Troubleshooting](troubleshooting.md)
