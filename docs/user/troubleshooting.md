# Troubleshooting

Start with **0 · System Check**: it shows versions, GPUs, which model files of each template are installed and the download policy. Set *detail* to `full` and attach the output to a bug report.

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
| Cover Art fails although the song renders | Cover Art is optional and needs 16 GB of extra files | Install the FLUX.2 Klein files, or bypass the block again (select it, Ctrl+B) |
| *Transcribe Score needs the SheetSage2 audio encoder* | the SheetSage2 file is missing | Place `sheetsage2_bf16.safetensors` in `models/audio_encoders` |
| The lyrics ASR asks for files / *offline* | faster-whisper is fetched on first use; offline mode or `PLENIO_AUTO_DOWNLOAD=0` stop that | Allow the download once, or place the files as the message says (or use `[asset_paths]`, see [Configuration](configuration.md)) |

## Running

| What you see | Why | What to do |
|---|---|---|
| The run stops at a **Song Sheet** without an error (*waiting for approval*) | the brief's mode is *one song / one cover, stop to review* (default in the Cover template) with the sheet's *review* on *as the brief says*, or the sheet is set to *stop for review* | Open the sheet (in App mode: its button), check the documents, press **Approve**, run again - or choose *new song every run* in the brief for runs without stops |
| *Song Sheet conflict - lyrics: ...* | you edited a document and its draft changed afterwards | Open the sheet and choose *Keep my edit (manual)*, *Use the new draft* or *Merge by hand* |
| A conflict on the second run of a series (*new song every run*) | a series writes a new draft every run, so an *edited* document no longer matches | Make the document *manual* (the whole series keeps it) or press *Use draft* |
| Every run writes a **new song** although you wanted a new take | the brief's mode is *new song every run* (default of the song templates) | Choose *one song, stop to review*: the song is written once, and after approval every run is a new take |
| The songs of a series sound alike | one brief, one style: the series changes title, story and hook, not the genre | Leave *description* and *theme* open (or empty), or change the brief between batches |
| *The Song Sheet documents are not valid* | a document breaks the model's rules (for example vocal words in instrumental lyrics, a score that is not native ABC) | Open the sheet: the findings point to the line and bar |
| MiniMax: the sheet reports more than **5 000 tokens** | caption and lyrics together are too long for the MiniMax text encoder | Shorten the caption or the lyrics by the number of tokens the sheet shows |
| Every run renders a new take | the take seed is set to *randomize* | That is the intent: in *one song, stop to review* text and score stay cached; set the seed to *fixed* to repeat a take |
| The writer runs again although you only wanted a new take | the brief's mode is *new song every run*, or an input of the writer changed (brief, writer model, draft seed) | Choose *one song, stop to review* and keep the brief unchanged; set the **Draft seed** node to *fixed* (the default) |
| The text sheet asks for approval on every run | the **Draft seed** is set to *randomize*: every run writes a new draft | Set the Draft seed to *fixed* while you review |
| **Out of memory** while rendering | the GPU is too small for the defaults | Follow the System Check's rule table (smaller files, [Models](models.md)); MiniMax: turn on *tiled decode* in MiniMax Render; keep songs short |
| SheetSage2 runs out of memory on a long source | long sources need a lot of VRAM | Use the optional *Excerpt* node (up to 5:00 is supported) |
| The take ends early or stops mid-phrase | the model may stop before the ceiling, or run to it | Render another take (new take seed); for instrumental covers use several *takes* |
| A voice appears in an instrumental | instrumental audio is measured, not guaranteed | See [Instrumental](concepts/instrumental.md); in covers *Check Vocals* keeps the best take |

## Mastering and export

| What you see | Why | What to do |
|---|---|---|
| Loudness warning *limiter reduction budget* | reaching the target would need more limiting than the style allows | Choose a lower target or a style with more limiter room; the song is not squashed on purpose |
| *samples above full scale were clipped* | a boost without a limiter before FLAC/MP3 | Keep **Plenio · Master** (or Loudness & Dynamics) before Export |
| Cover saved as `.jpg` but not inside the file | the file is a WAV (it has no place for a cover), or it was exported by Plenio 0.2.1 or older without mutagen | export as FLAC or MP3; 0.2.2 embeds the cover itself |
| *'copy from loaded file' needs exactly one Load Audio node* | tag copy reads the file of the single Load Audio node | Choose *tags* and type them, or keep one Load Audio node |
| WAV files miss album artist and composer | RIFF INFO has no fields for them | Use FLAC or MP3 for full tags |

## Workflows

| What you see | Why | What to do |
|---|---|---|
| Export widgets show odd values in a workflow saved before Phase 7 | the Export node got new widgets; old saves restore by position | Start from the current template or re-add the Export node |
| A workflow saved with 0.2.0/0.2.1 shows the brief's mode *one song, stop to review* | the mode is new in 0.2.2; Plenio adds it when loading, with the earlier behaviour (the same song, new takes) | Choose *new song every run* for a series; the sheets keep their saved *review* (set them to *as the brief says* to follow the mode) |
| API prompt: *Required input is missing: mode* | Song Brief and Cover Brief have a new first input in 0.2.2 | Add `"mode": "new song every run"` or `"one song, stop to review"` (Cover Brief: `"new cover every run"` / `"one cover, stop to review"`) |
| A block's settings are not visible | model blocks are collapsed; blocks are subgraphs | Expand a collapsed block (the dot at its top left, or right-click > *Expand*); open a block with the icon at its top right |
| App mode shows no instrumental options | App mode shows the options of the default *vocals* choice (sung songs; instrumental covers) | Set the other choice's options in the graph view |

## Reporting a problem

Run **0 · System Check** with *detail* = `full`, and include its output, the ComfyUI console lines around the error, and - for a run - the release record (`<song>.plenio.json` next to the audio; it holds the documents, seeds and settings, with secrets removed).
