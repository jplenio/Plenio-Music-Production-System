# Getting started

▶ **Videos:** [Your idea. Your song. Your party.](https://youtu.be/myiZawtsja4) (the spot, 54 seconds), [Your idea. Your song. Your control.](https://youtu.be/XpNpks9ZCgE) (the first spot) - and one tutorial for every template, starting with [Tutorial 0 · System Check](https://youtu.be/v38t0bFqu5Q), plus two on the experimental creative modes (*Tutorials 6 and 7*), three on the Plenio Player - listening, party songs, the Song API (*Tutorials 8 to 10*) - and one on LoRAs for YuE2 (*Tutorial 11*), in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE). **Songs made with Plenio**, as videos made by the Plenio Player: [the example playlist](https://www.youtube.com/playlist?list=PLBZzzh1IMZzk).

## Requirements

- ComfyUI **0.37.0** or newer, tested with 0.41.0 (it provides the native YuE2, SheetSage2, MiniMax Music 3, FLUX.2 and text-generation nodes Plenio builds on)
- an NVIDIA GPU for the music models (Plenio is developed and measured on a 16 GB card; the System Check's hardware table covers smaller and larger ones). *4 · Enhance & Master* runs on the CPU.

## Install

- **ComfyUI Manager:** *Manager → Custom Nodes Manager*, search for **Plenio Music Production System**, install, restart ComfyUI.
- **Comfy CLI:** `comfy node install comfyui-plenio-music`.
- **By hand:** `git clone https://github.com/jplenio/Plenio-Music-Production-System` inside `ComfyUI/custom_nodes`, then restart ComfyUI.
- **After an update** (any of the ways above): restart ComfyUI and reload every open ComfyUI page (F5) - a page that was open keeps the old Plenio code and says so.

### Two ways to install

Both install the same nodes, templates, editor, Song API and player. They differ in three conveniences that start another program on your computer - the **Studio add-on**, which only the download from GitHub carries (since 2.0):

| | ComfyUI Manager, Comfy CLI (the Comfy Registry package) | `git clone`, the release zip |
|---|---|---|
| The Plenio Player starts ComfyUI for you (*Start the studio*) | no - start ComfyUI the way you usually do; the player finds it | yes |
| A GGUF writer model runs through an installed `llama-server` | no - through a running app (LM Studio, Ollama, a `llama-server` you started), through `llama-cpp-python`, or ComfyUI's own Gemma writes | yes |
| *Open the folder* in the player opens your file manager | no - the folder's path is shown with a *Copy* button | yes |
| `Plenio Player.bat`, `plenio_player.sh` to start the player by double-click | no - open it from ComfyUI (*Plenio Player* beside *Run*) or with `python plenio_player.py` | yes |

The Registry package starts nothing but ComfyUI's own Python with Plenio's own modules ([SECURITY.md](../../SECURITY.md#programs-plenio-starts)). **0 · System Check** says which of the two you have (*Studio add-on: ...*).

Plenio installs no Python packages. Optional: `python -m pip install faster-whisper` (the lyrics ASR's fallback for languages Qwen3's aligner cannot time), in the Python that runs ComfyUI. Cover art is embedded in FLAC and MP3 without any extra package.

## First run

**Plenio Setup** opens in ComfyUI's sidebar the first time a template you want lacks files (later: the *Plenio* menu, or the box icon in the sidebar). It goes through six steps - each can be left and taken up again:

1. **This computer**: graphics card, memory, free space on the models drive, and anything that needs attention, with its fix.
2. **What do you want?** The templates you will use, and the optional parts (cover art, HQ mastering, stems).
3. **Your plan**: the file for each model that suits your card, why, where it goes and its licence; you can choose another file, or another folder ComfyUI searches. Nothing is downloaded before you press *Download all*, which names the total size; a download that would not fit on its drive does not start.
4. **Downloading**: progress, speed and time left per file; pause, resume, cancel. Each file is checked against the catalogue's size and SHA-256 before it is put in place. A model whose makers ask for an OK on Hugging Face shows *What to do*: the three steps to get it.
5. **Test song**: a one-minute instrumental with *1 · YuE2 · Song* and your files (no cover art, no HQ; it goes into `output/plenio/Setup test`) - *It works ✓* with the take to listen to, or what failed and the way to fix it. About a minute on a 16 GB card.
6. **Go**: open a template and make your first song, or open the player.

**0 · System Check** shows the same in detail: versions and GPUs, the findings first (each with an id the [troubleshooting guide](troubleshooting.md) explains), which model files each template still needs, the download policy, and the hardware table - which files the model fields on auto take on each card - with the row for your machine marked. Nothing is changed automatically.

## Choosing a template = choosing the music model

Each music model has its own template, so every workflow shows only the controls that apply to it.

| Template | Use it for | Guide |
|---|---|---|
| 0 · System Check | checking the installation | this page |
| 1 · YuE2 · Song | new songs with YuE2, with an editable score | [guide](paths/yue2-song.md) |
| 2 · YuE2 · Cover | new versions of a recording you own or may use | [guide](paths/yue2-cover.md) |
| 3 · MiniMax · Song | new songs with MiniMax Music 3 | [guide](paths/minimax-song.md) |
| 4 · Enhance & Master | finishing an existing audio file | [guide](paths/enhance-master.md) |
| 5 · YuE2 · DAW | composing the score yourself and rendering it with YuE2 | [guide](paths/yue2-daw.md) |

When you open a template, ComfyUI offers to download the model files it is missing ([Models and downloads](models.md)). The writer, Gemma 4 12B, is a GGUF file run by llama.cpp: install llama.cpp first (`winget install llama.cpp`, `brew install llama.cpp`); the first song then downloads the file for your graphics card, unless you have one ([The writer](models.md#the-writer-gemma-4-12b)).

## How a template is laid out

Every template reads from left to right in numbered groups, with the same anatomy:

```text
                                                       COVER ART (above the render)
1 · SONG / SOURCE  ->  2 · WRITE  ->  3 · SHEET(S)  ->  4 · RENDER  ->  5 · FINISH
   the two cards,      the draft      what the model    take seed,     Master (stems, Audio HQ,
   the writer model,                  receives          the render     EQ, loudness) -> Export
   the brief
   MUSIC MODEL (collapsed, below): the model files
```

The numbered sections stand in one row: they start at the same top and end at the same bottom.

- **About this template** (the note on the left) explains the path in a few steps.
- **Song Sheets** show exactly what the music model receives; you can edit every document there ([Song Sheet](concepts/song-sheet.md)).
- **HQ Mastering & Cover Art** (the two cards at the top): click a card to switch it - HQ mastering (off by default, on in Enhance & Master; on: fewer AI artifacts, about twice the time) and the song's cover (on; off needs no image model). Under them, the **Writer model** for every writing step.
- **Nodes and grey groups marked *(optional)*** are switched off (bypassed). Select the nodes and press **Ctrl+B** to switch them on.
- **Seeds** follow the brief's mode: *new song every run* starts with every seed on 🎲 (something new every run), *one song, stop to review* keeps the song's seeds on 🔒 while you review it.
- The **MUSIC MODEL** group: in the YuE2 templates *checkpoint* chooses the YuE2 file - the original or a [finetune](models.md#yue2-finetunes). In the MiniMax template the block is collapsed: expand it (the dot at its top left, or right-click > *Expand*), then open it with the icon at its top right to change the model files.
- **Plenio · Master** finishes every song (tone match, -14 LUFS / -1 dBTP) before Export - with the **stems** first when you switch *stems* on on the block; Export also keeps the unmastered take as `(original).flac`.

## Two ways to work

The first field of the **Song Brief** - and of the **Cover Brief** - is the **mode**. It decides what a run does:

- **new song every run** (default of the song templates): every run writes and renders a **different song** from the same brief, without stopping - each with its own draft and plan seeds. To make a series with one click, set the batch count next to **Run** (in App mode: *Number of runs*) - ten runs, ten songs, each exported under its own title (a repeated title gets ` (2)`, ` (3)`, ...). Want to check each song first? Set a Song Sheet to *stop for review*: every new song stops there, and the run after *Approve* renders it before the next song is written ([Song Sheet](concepts/song-sheet.md#every-combination)).
- **one song, stop to review**: the run stops at each **Song Sheet**. Open it, check or edit the documents, press *Approve*, and run again; YuE2 stops twice (text, then score). Once everything is approved, every further run is a **new take** of the same song.

The writer's **Draft seed** (its own node next to *Write Song*, also in App mode) is 🔒 *same seed* by default - keep it so: in a series every song gets its own seeds anyway (the brief's *song seed* is added to the draft and plan seeds), and in *one song, stop to review* a kept seed keeps the approved text. Switch it to 🎲 *new seed* (or press *🎲 new seed now*) when you want another draft of the same song. Every seed node works the same way - blue keeps, amber renews; see [Seeds](concepts/seeds.md).

The cover template offers *new cover every run* (its default: a new title, style and - for new lyrics - new lyrics on the same transcription every run, without stops) and *one cover, stop to review*. The Song Sheets' *review* is set to **as the brief says**; set a single sheet to *continue* or *stop for review* to override the brief.

## Where your songs go

Export writes into ComfyUI's output folder, `output/plenio/` (Enhance & Master: `output/plenio/enhanced/`):

- `<date> <title>.flac` (and MP3/WAV if chosen) - the mastered song, with tags
- `<date> <title> (original).flac` - the unmastered take
- `<date> <title>.jpg` - the cover, if Cover Art is on (it is also embedded in the FLAC and MP3 files)
- `<date> <title>.plenio.json` - the release record: the documents, seeds and settings of the run, the workflow, reports, measured loudness and model licences. **File > Continue a Plenio song…** (or dropping the record onto ComfyUI) opens the song again where you stopped - see [Continue a song](concepts/continue-a-song.md)

(Enhance & Master names the files after the title alone; change *naming* in Export as you like.)

## App mode

Every template also works as a simple form: switch **Graph / App** at the top left of the canvas. The app shows the mode, the brief (or the file), the seeds with their switches, buttons that open the Song Sheets - for review and editing, as in the graph - and the results; see [App mode](concepts/app-mode.md).

## Next steps

- [Models and downloads](models.md), [Licensing](licensing.md), [Configuration](configuration.md)
- [Troubleshooting](troubleshooting.md)
