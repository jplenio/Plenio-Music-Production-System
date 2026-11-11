# Troubleshooting

Start with **0 · System Check**: it shows versions, GPUs, which model files of each template are installed and the download policy. Set *detail* to `full` and attach the output to a bug report.

## System Check findings

The System Check (and Plenio Setup) name what needs attention as a finding with a stable id; the node's report lists them first, each with its fix where a button or a copied line can help.

| Finding | What it means | What to do |
|---|---|---|
| `comfyui.too_old` | ComfyUI is older than 0.37.0 | Update ComfyUI (*Open ComfyUI's releases*) |
| `gpu.none` | no graphics card was found | YuE2 and MiniMax Music 3 need one; 0 · System Check and 4 · Enhance & Master run on the CPU |
| `package.missing` | `av`, `PIL` or `scipy` is missing - ComfyUI installs them | Run the copied `pip install` line with ComfyUI's Python, or reinstall ComfyUI's requirements |
| `model.missing` | a template needs a file you do not have (not a fault) | *Download* in Plenio Setup, or place the file as [Models and downloads](models.md) says |
| `model.incomplete` | a model file has another size than the catalogue's - usually an interrupted download | *Download it again*, or replace the file |
| `model.misplaced` | a model file is in a folder ComfyUI does not search | Add the copied line to `extra_model_paths.yaml` beside your other folders, or move the file; restart ComfyUI |
| `model.unloadable` | a file in `models/checkpoints` is not a YuE2 checkpoint that loads | The message says why; replace the file or remove it |
| `model.finetune` | a YuE2 checkpoint that is not in the catalogue - it loads as a finetune | Choose it in the model block's *checkpoint* field |
| `asset.missing` | a Plenio asset (writer GGUF, lyrics recognition, stems) is not downloaded yet | Nothing: it is fetched the first time a node needs it (offline: place it as the System Check says) |
| `writer.blocked` | the templates' default writer cannot run on this machine as it is | Choose another writer in *Writer model*, or install what the message names |
| `config.error` | Plenio's `config.toml` has an invalid value or key; the defaults are used | Fix the file as the message says |
| `test.model`, `test.failed` | Setup's test song stopped: at a model file, or elsewhere (the node is named) | *Show the plan* and fetch or choose the file; otherwise the message says what failed - the same as a run of *1 · YuE2 · Song* would |
| `disk.low` | the models drive has less free space than the missing files need, plus 2 GB | Free space, or choose another model folder in Plenio Setup |

## Installation

| What you see | Why | What to do |
|---|---|---|
| The Plenio templates are not in the template browser | ComfyUI lists custom-node templates under the package's folder name; an old ComfyUI or an import error hides them | Update ComfyUI to 0.37.0 or newer; look for `Plenio` and `Cannot import` in the ComfyUI console at start-up |
| Red nodes, *missing node types* | ComfyUI older than 0.37.0 (the native YuE2, MiniMax, FLUX.2 and loop nodes are missing) | Update ComfyUI |
| System Check: *older than the supported 0.37.0* | as above | Update ComfyUI |
| System Check: *Package 'av' / 'PIL' / 'scipy' is not installed* | a broken ComfyUI environment (ComfyUI installs them) | Reinstall ComfyUI's requirements in its Python |
| A template you saved in `user/plenio/templates` does not appear | the file could not be read (for example a front-matter line without `:`) | The ComfyUI log says *skipped the user template ...* with the reason; fix or delete the file and refresh |
| System Check: *Plenio configuration error* | `user/plenio/config.toml` has an invalid value or key | Fix the file as the message says; until then Plenio uses its defaults |
| Song Brief shows *Note: length '2-3 minutes' is not one of the options* | a length value came from other parameters (for example an old run of the predecessor toolkit reused in App mode) | nothing to do: the nearest option is used; choose *length* again to clear the note |

## Models

| What you see | Why | What to do |
|---|---|---|
| *Missing models* dialog when opening a template | the template names files you do not have yet | Download them from the dialog, or place them as listed in [Models and downloads](models.md) |
| *Value not in list* for `ckpt_name`, `unet_name`, `clip_name` ... | a file is missing or has another name | Place the file (System Check lists what is missing) or choose your file in the loader |
| *The connected model is not a supported music model* | a different model is connected to Engine Profile | Use the template's model block (YuE2 or MiniMax Music 3 files) |
| Cover Art fails although the song renders | Cover Art is optional and needs 16 GB of extra files | Install the FLUX.2 Klein files, or switch the cover off with the *Cover Art* card at the top of the template |
| *... does not match the BS-RoFormer architecture: Unexpected key(s) in state_dict: ...rotary_embed.freqs* (Stems, Sung Pitch) | Plenio 0.6.0 and earlier without the Python package `rotary-embedding-torch` (ComfyUI Desktop) | Update Plenio to 0.6.1 or later; the checkpoint is fine (or install `rotary-embedding-torch` into ComfyUI's Python) |
| *Transcribe Score needs the SheetSage2 audio encoder* | the SheetSage2 file is missing | Place `sheetsage2_bf16.safetensors` in `models/audio_encoders` |
| The lyrics ASR asks for files / *offline* | Qwen3-ASR and its aligner (and faster-whisper for other languages) are fetched on first use; offline mode or `PLENIO_AUTO_DOWNLOAD=0` stop that - **0 · System Check** shows the folders | Allow the download once, or place the files as the message says (or use `[asset_paths]`, see [Configuration](configuration.md)) |

## Running

| What you see | Why | What to do |
|---|---|---|
| The run stops at a **Song Sheet** without an error (*waiting for approval*) | the brief's mode is *one song / one cover, stop to review* (default in the DAW template) with the sheet's *review* on *as the brief says*, or the sheet is set to *stop for review* | Open the sheet (in App mode: its button), check the documents, press **Approve** - the run goes on (*Approve* goes on with the run by itself; the setting *Plenio › Song Sheet › Approve goes on with the run* off: run again by hand) - or choose *new song every run* in the brief for runs without stops |
| *Song Sheet conflict - lyrics: ...* | you edited a document and its draft changed afterwards | Open the sheet and choose *Keep my edit (manual)*, *Use the new draft* or *Merge by hand* |
| A conflict on the second run of a series (*new song every run*) | a series writes a new draft every run, so an *edited* document no longer matches | Make the document *manual* (the whole series keeps it) or press *Use draft* |
| Every run writes a **new song** although you wanted a new take | the brief's mode is *new song every run* (default of the song templates) | Choose *one song, stop to review*: the song is written once, and after approval every run is a new take |
| The songs of a series sound alike | one brief, one style: the series changes title, story and hook, not the genre | Leave *description* and *theme* open (or empty), or change the brief between batches |
| *The Song Sheet documents are not valid* | a document breaks the model's rules (for example vocal words in instrumental lyrics, a score that is not native ABC) | Open the sheet: the findings point to the line and bar |
| MiniMax: the sheet reports more than **5 000 tokens** | caption and lyrics together are too long for the MiniMax text encoder | Shorten the caption or the lyrics by the number of tokens the sheet shows |
| Every run renders a new take | the take seed is set to 🎲 *new seed* | That is the intent: in *one song, stop to review* text and score stay cached; switch the take seed to 🔒 *same seed* to repeat the take you just heard (the number shown made it) |
| The writer runs again although you only wanted a new take | the brief's mode is *new song every run*, or an input of the writer changed (brief, writer model, draft seed) | Choose *one song, stop to review* and keep the brief unchanged; set the **Draft seed** node to 🔒 *same seed* (the default) |
| A series with a sheet on *stop for review* shows the same song again | it waits for your approval: a series writes the next song only after the reviewed one was rendered | *Approve* in the editor and run; or set the sheet to *continue* for a series without stops |
| After a ComfyUI restart a series starts a new song although one was waiting | the song under review is kept in the running server only | Review the new song (or change nothing and approve it) |
| The text sheet asks for approval on every run | the **Draft seed** is set to 🎲 *new seed*: every run writes a new draft | Switch the Draft seed to 🔒 *same seed* while you review |
| No subtitles next to the song | the lyrics ASR could not run (offline without the model), the song is instrumental, or *lyrics subtitles (SRT)* is off | The export's summary says which; the models (4.1 + 1.8 GB) are fetched on first use when downloads are allowed |
| *… uses {xyz}, which is no Plenio variable* when you press Run | a typo in a tag field or the file name pattern | Correct the name; the message lists every variable (`{{` and `}}` give literal braces) |
| No `<name>.pdf` after an export with *sheet music* on | the sheet music is drawn by an open ComfyUI page (whichever workflow it shows); no page was open when the run ended (queued over the API, the tab closed or reloaded) | Open ComfyUI (or bring its tab to the front): the page draws the PDFs still waiting, for up to 24 hours while ComfyUI runs (not after a restart). For an earlier song open its Song Sheet and use *Export notation… > PDF* |
| *Sheet music not saved: Plenio was updated while this page was open* (with an older Plenio: *Failed to fetch dynamically imported module ... notationExport-....mjs*); the Song Sheet editor does not open after an update | the ComfyUI page was open while Plenio was updated: it reconnects to the restarted server but keeps the old Plenio code, whose files are gone | Reload the page (F5). The sheet music still waiting is drawn and saved then (for up to 24 hours while ComfyUI runs). After every update of Plenio: restart ComfyUI, then reload every open ComfyUI page |
| Export says *sheet music: this release has no score* | MiniMax Music 3 renders without a score, and a YuE2 run with planning off has none | Nothing to do - there are no notes to print; the lyrics are in the release record |
| *Arrangement not applied* in Song Sheet · Score (a warning) | a creative mode's plan could not be used - the writer's answer was no plan, the arranged score did not pass the checks, or it did not fit YuE2's context; the score is YuE2's (or the transcription) as it was | Read the reason in the sheet's *Arrangement* line; run again with another **arrangement seed**, or choose a GGUF, LM Studio or Ollama model as the writer model (held to the plan's format); the score as it is can be approved and rendered |
| *Arrangement ... partial* | some parts of the plan were kept out (a chord that clashed with the melody, a line where the instrument plays the melody, a key lift that would leave the voice's range) | Nothing to do - the sheet's *Arrangement* details say what stayed; another arrangement seed gives another plan |
| Changing the creative mode or a slider writes the text again | the brief changed, so ComfyUI runs everything after it again; a mode's hints change the writing prompt | Expected; for another arrangement of the same text change only the **arrangement seed**. A Local LLM writer answers an unchanged request from its cache without a call |
| *Unknown creative mode 'x'* | a mode file was renamed, removed or has a mistake | Choose one from the list (press R after adding a file); a file with a mistake is named in the ComfyUI log |
| *No reliable singing was found* with new cover lyrics | *lyrics closeness* above 0 (or the phrasing reference) needs the source's words | Set *lyrics closeness* to 0 and the phrasing reference off, or trim the source to its sung part |
| **Out of memory** while rendering | the GPU is too small for the defaults | Follow the System Check's hardware table (smaller files - the model fields on auto take them by the card; [Models](models.md)); MiniMax: turn on *tiled decode* in MiniMax Render; keep songs short |
| SheetSage2 runs out of memory | another program or model holds the GPU memory (SheetSage2 itself needs about 2 GB, also for songs longer than 5:00) | Free the GPU and run again, or cover a part with the optional *Excerpt* node |
| The take ends early or stops mid-phrase | the model may stop before the ceiling, or run to it | Render another take (new take seed); for instrumental covers use several *takes* |
| A voice appears in an instrumental | instrumental audio is measured, not guaranteed | See [Instrumental](concepts/instrumental.md); in covers *Check Vocals* keeps the best take |

## Mastering and export

| What you see | Why | What to do |
|---|---|---|
| Loudness warning *limiter reduction budget* | reaching the target would need more limiting than the style allows | Choose a lower target or a style with more limiter room; the song is not squashed on purpose |
| *samples above full scale were clipped* | a boost without a limiter before FLAC/MP3 | Keep **Plenio · Master** (or Loudness & Dynamics) before Export |
| Cover saved as `.jpg` but not inside the file | the file is a WAV (it has no place for a cover), or it was exported by Plenio 0.2.1 or older (MP3: its ID3v2.4 tag is not read by Windows and many players) | export as FLAC or MP3 again with 0.2.2: it embeds the cover itself and writes MP3 tags as ID3v2.3 |
| *'copy from loaded file' needs exactly one Load Audio node* | tag copy reads the file of the single Load Audio node | Choose *tags* and type them, or keep one Load Audio node |
| WAV files miss album artist and composer | RIFF INFO has no fields for them | Use FLAC or MP3 for full tags |

## Workflows

| What you see | Why | What to do |
|---|---|---|
| Export widgets show odd values in a workflow saved before Phase 7 | the Export node got new widgets; old saves restore by position | Start from the current template or re-add the Export node |
| A workflow saved with 0.2.0/0.2.1 shows the brief's mode *one song, stop to review* | the mode is new in 0.2.2; Plenio adds it when loading, with the earlier behaviour (the same song, new takes) | Choose *new song every run* for a series; the sheets keep their saved *review* (set them to *as the brief says* to follow the mode) |
| API prompt: *Required input is missing: mode* | Song Brief and Cover Brief have a new first input in 0.2.2 | Add `"mode": "new song every run"` or `"one song, stop to review"` (Cover Brief: `"new cover every run"` / `"one cover, stop to review"`) |
| A block's settings are not visible | model blocks are collapsed; blocks are subgraphs | Expand a collapsed block (the dot at its top left, or right-click > *Expand*); open a block with the icon at its top right |
| App mode shows no instrumental options | App mode shows the options of the template's *vocals* choice (sung songs; covers with the original lyrics) | Set the other choice's options in the graph view |
| Local LLM or Write Song's writer model lists only *(choose a model)* | no GGUF in `models/LLM`, no writer in `models/text_encoders` and no local LLM app server running (or `other_apps = false`) | Put a GGUF into `ComfyUI/models/LLM` or start LM Studio's or Ollama's server, then press **R** |
| *No llama.cpp runtime was found* | GGUF files need a llama.cpp server program | `winget install llama.cpp` (Windows) or `brew install llama.cpp`, or set `PLENIO_LLAMA_SERVER`; the System Check shows what was found |
| *This installation of Plenio starts no llama-server program* | Plenio was installed through the ComfyUI Manager or the Comfy CLI: that package starts no other program ([two ways to install](getting-started.md#two-ways-to-install)) | Run the model in LM Studio, Ollama or a `llama-server` you start yourself - Local LLM lists their models -, or `pip install llama-cpp-python` into ComfyUI's Python, or choose ComfyUI's own Gemma 4 as the writer. Plenio from GitHub starts an installed `llama-server` itself |
| *... stopped while loading ... unknown model architecture* | the llama.cpp build is older than the model | Update llama.cpp, or point `PLENIO_LLAMA_SERVER` at a newer `llama-server` |
| *... answer was cut off at the answer's limit (max tokens: N)* | the answer needed more than *max tokens* - often a model's thinking, which comes first | Raise *max tokens* and *context*, or turn *thinking* off. *Thinking was off ..., yet the model thought*: its chat template ignores the switch - choose an instruction-tuned model such as Gemma 4, or turn thinking off where it is served (a file Plenio runs with llama.cpp: the environment variable `LLAMA_ARG_REASONING=off`, set before ComfyUI starts; LM Studio, Ollama: the model's setting) |
| *... answer was cut off after N tokens: the context (M tokens) was full* | the prompt and the answer together filled the context | Raise *context*; for a model of a running app, that app's own setting (LM Studio: the model's context length) |
| *The writer Gemma 4 12B runs on llama.cpp, and this computer has none* | the default writer is a GGUF file, and neither llama.cpp nor ComfyUI's own Gemma text model is there | `winget install llama.cpp` (Windows), `brew install llama.cpp` (macOS) or `pip install llama-cpp-python` into ComfyUI's Python, then run again - or choose another writer model ([The writer](models.md#the-writer-gemma-4-12b)) |
| Load Checkpoint: *Could not detect model type* on a YuE2 finetune | the file is in m-a-p's Transformers layout, not in ComfyUI's | Take the file made for ComfyUI (a repository's `comfyui/` folder) or convert it; **0 · System Check** says which YuE2 files load ([YuE2 finetunes](models.md#yue2-finetunes)) |
| *The connected model is not a supported music model* | another kind of checkpoint is chosen in the YuE2 model block | Choose a YuE2 file under **checkpoint** ([YuE2 finetunes](models.md#yue2-finetunes)) |
| *LM Studio is not reachable* | LM Studio runs, but not its local server | Developer tab > *Start server*, or `lms server start` |

## Plenio Player

| What you see | Why | What to do |
|---|---|---|
| A song from *Make a song* stops: *ComfyUI does not find the model file …* (in 1.3: *Load checkpoint: Value not in list*) | that ComfyUI does not see your models - mostly one the player started without your models folder | Start ComfyUI once the way you usually do (your `.bat`, the portable build, ComfyUI Desktop): the player then starts it the same way. Or enter `--models-directory <your folder>` in *Settings › The studio › How it starts ComfyUI* |
| *Every setting of the studio* lists only LM Studio's models, not ComfyUI's | the same: ComfyUI runs without your models folder | as above; a model field also says *ComfyUI does not find this model file* |
| *The player does not know yet how to start ComfyUI* | Plenio is not inside a ComfyUI folder (ComfyUI Desktop) and ComfyUI has not run with Plenio since 1.4.0 | Start ComfyUI once; or choose its folder in *Settings › The studio* |
| *This installation of Plenio does not start ComfyUI* (no *Start the studio* button) | Plenio was installed through the ComfyUI Manager or the Comfy CLI: that package starts no other program ([two ways to install](getting-started.md#two-ways-to-install)) | Start ComfyUI the way you usually do; the player finds it within a few seconds. Plenio from GitHub (`git clone`, the release zip) starts it for you |
| *Open the folder* shows a path instead of opening the folder | the same package opens no file manager | *Copy the path* and paste it into your file manager's address bar |
| A video stops: *The browser ran out of memory for this video* | the page has no room for one more frame at this size (other tabs, a 4K video at 60 frames a second) | Close other tabs; choose a smaller size or 30 frames a second. A failed video is tried once more by itself |
| A song made in the player is not in the party's folder | since 1.4.0 only songs ordered on the party's page (the guests' phones) are party songs | Nothing to do: yours are saved like songs made in ComfyUI |

## Reporting a problem

**Plenio Setup › Report a problem…** makes the report for you: the System Check, the ComfyUI log lines that mention Plenio (the last 200), the last error of a run on this page and the open workflow with its text fields emptied. Every path keeps only its last two parts and your user name is replaced by `<user>`; you read every file before *Save the zip*. Attach the zip to an issue.

Without Setup: run **0 · System Check** with *detail* = `full`, and include its output, the ComfyUI console lines around the error, and - for a run - the release record (`<song>.plenio.json` next to the audio; it holds the documents, seeds and settings, with secrets removed).
