# Changelog

All notable changes of the current version and the one before. Versions follow semantic versioning; published Registry versions are immutable. Earlier versions (0.2.0 to 0.4.4): the [changelog of 0.4.4](https://github.com/jplenio/Plenio-Music-Production-System/blob/v0.4.4/CHANGELOG.md) and the [GitHub releases](https://github.com/jplenio/Plenio-Music-Production-System/releases).

## 0.5.1 - 2026-10-10

Covers of songs longer than 5:00 work on a 16 GB card, the stems you save in the Stem Mixer stay with their song, a Song Sheet document can always go back to automatic, and the section tags go where the cursor is.

### Changed

- **Stems next to the song** (owner's request): the strips marked *save* in the **Stem Mixer** are written by **Export Release** next to the song, into a folder named after it with `-stems` - for `output/plenio/My Song.flac` the stems are `output/plenio/My Song-stems/drums.flac`, `vocals.flac` ... (a batch of takes: `drums take 1.flac` ...), 24-bit FLAC with the song's tags and the title *My Song (drums)*. The folder takes the song's number with it (`My Song (2)-stems`), so nothing is overwritten, and the release record lists every stem file. The templates need no change: the Stem Mixer's report already goes into the export. In a workflow without an Export Release that takes the mixer's report the stems go to `output/plenio/stems` as before.
- **Section tags at the cursor** (GitHub issue #3): the tag buttons under the lyrics editor insert the tag as its own line where the cursor is - after a blank line between sections; inside a line they break it there - and leave the cursor where the section's first line goes. Before you click into the text they append at the end, as before. A tag can be added more than once (a second *[Verse]*). New button **[Instrumental]**: a section without words between the sung ones.
- **The style's length is a hint, not a limit** (GitHub issue #3): YuE2's style aims at about 40 words - the target the writer is given. A longer style is used: above 60 words the sheet warns, only above 120 words is it an error. The messages now say so (*a hint, not a limit: up to 120 are accepted*); the error read *keep it under 120 (target 40)*.

### Fixed

- **A manual document could not go back to automatic** (GitHub issue #3): *Use draft* in the Song Sheet editor stayed greyed out while no draft was known - and the node computes no draft for a manual document, nor before its first run - so a text once made manual (or edited before the first run) stayed for good. The button is now **Back to auto** then: the text is discarded on *Apply* and the next run computes the document again (the writer, the plan or the transcription).
- **Models beside the folders of `extra_model_paths.yaml`** (a user's report): the stem model in a new `audio_separation` folder next to the other model folders of an `extra_model_paths.yaml` location was found only after it was copied into ComfyUI's own `models` folder - ComfyUI searches a folder of such a location only when the file names it, and no one's file names Plenio's folders. Plenio now searches its own folders (`audio_separation`, `audio_sr`, `LLM`) beside every model folder ComfyUI knows; a folder made while ComfyUI runs counts after pressing R. ComfyUI's own folders (`audio_encoders`, `diffusion_models` ...) keep ComfyUI's rule; when a model file the templates load lies in one without its line, the **System Check** names it and the line to add.
- **Covers of songs longer than 5:00** (owner's report): *Transcribe Score* refused a source of 5:15 on a 16 GB card ("needs a second pass, which does not fit this GPU"). That limit came from a measurement without inference mode; run as ComfyUI runs its nodes, SheetSage2 reads a 5:16 song - two 300-second windows - in under 40 s with about 2 GB of GPU memory, with the full beat grid for the lyrics. The node no longer refuses long sources.
- The release record's schema (`resources/schemas/record-1.schema.json`) knows the sheet music (its `sheet_music` entry, the PDF among the files) and the stems (`role`: `sheet_music`, `stem`): a record with sheet music did not pass it. All 408 records of the owner's songs pass it now.

## 0.5.0 - 2026-10-09

The writer model can plan the arrangement: **creative modes** for songs and covers - experimental, made for trying out - with closeness sliders, chords that carry the melody, instrument lines that leave room for the voice and key lifts that are led in. **Your own local LLMs** write songs and arrangements. New cover lyrics **fit the melody** line by line, covers keep their verses over long rests and are named after their source, and YuE2's song form follows the lyrics. Every export can bring its **sheet music as a PDF** - in four sizes, with the words where YuE2 sings them and no lyrics lost. Every field in the templates explains itself in a tooltip. Two new tutorials show the creative modes; the others were recorded again.

### Added

**Local language models as writers**

- **Local LLM** (new node, *Plenio/Text*): one prompt in, one answer out, with the language models already on the machine - GGUF files from ComfyUI's `models/LLM` folder (and `extra_model_paths.yaml`), LM Studio's download folder, the Hugging Face cache (Unsloth Studio, `llama-server -hf`), llama.cpp's cache and GPT4All, or the models of a running LM Studio, Ollama, llama.cpp, vLLM, Jan, KoboldCpp, text-generation-webui, GPT4All or Unsloth Studio. One list; press R after adding a model. A GGUF file runs in a llama.cpp server started for the call (`llama-server` from the PATH, Unsloth Studio, winget, Homebrew or `PLENIO_LLAMA_SERVER`; llama-cpp-python as the fallback): ComfyUI frees the GPU memory it needs first, and all of it is free again when the server stops. Thinking on/off with the thoughts on their own output, a fixed seed, context, *keep loaded*, system prompt, an optional **JSON schema** the model is held to while it writes (GGUF files, LM Studio, Ollama, vLLM), and an **answer cache** (*reuse answers*): the same request to the same model is answered from `user/plenio/cache/llm` without a call, also after a restart. No new Python packages, no stored keys ([guide](docs/user/concepts/local-llm.md), ADR-0010).
- **Writer model** (node **Writer Choice**, in every song template): one list of ComfyUI's text models (native Generate Text, Gemma 4 E4B by default) and every Local LLM model for *Write Song* and *Arrange*; a switch runs only the chosen writer, so the other model is never loaded and a GGUF writer needs no Gemma file. Both writers answer with up to 6144 tokens (room for a reasoning model's thoughts).
- `config.toml` `[llm]`: the llama-server program, extra GGUF folders and servers, other apps on/off; `PLENIO_LLAMA_SERVER`, `PLENIO_LLM_OTHER_APPS`. The System Check lists the Local LLM models per source and the runtime for GGUF files.

**Creative modes (experimental)**

- **arrangement** in the Song Brief and the Cover Brief: *off* (default) leaves the music to the music model, as always; *standard*, *varied*, *fantasy*, *sterile*, *many instruments* and *dramatic* add their hints to the writing prompt and - in *1 · YuE2 · Song* and *2 · YuE2 · Cover* - let the writer model plan every section of YuE2's score: chords, what the instrument line plays (*pad, arpeggio, riff, countermelody, solo, octave, motif, none*), energy, key lifts and the tempo. The writer answers a small JSON plan, never notes: Plenio writes every note with the checked score operations, keeps the melody and the form, and checks the result (YuE2's parser, read back, the score editor, YuE2's context). A plan it cannot use leaves the score as it was, and *Song Sheet · Score* says why. Own modes are Markdown files in `user/plenio/arrangement` ([guide](docs/user/concepts/creative-modes.md), ADR-0011).
- **Closeness sliders**: *genre closeness* (songs: 100 strictly typical ... 0 any style), *song flow closeness* (covers: 100 exactly the original - no plan, no writer call - ... 0 only a hint) and *lyrics closeness* (new cover lyrics: 0 without the source's text ... 100 its meaning line by line; above 0 the source's lyrics are transcribed for the writer).
- **Compose Arrangement** and **Apply Arrangement** (new nodes, *Plenio/Score*) in the block **Plenio · Arrange**, with an *arrangement seed* for another plan of the same song. Apply's answer is lazy: with arrangement *off* nothing before it runs.
- **Harmony guard**: the writer's chords stand only where they belong to the section's key or to the genre's usual borrowings (eleven genre families) and carry the melody of the whole bar; elsewhere the nearest fitting chord is chosen and the sheet says why. A gate per section puts back a section that would clash more than before. Where the guard had to repair much, the writer is **asked once more** about those sections, and the better plan is used.
- **Instrument lines that fit the voice**: by default a line plays only where the voice rests - fills and answers, as in YuE2's own scores; the brief's **lines under the singing (experimental)** lets it sound under the voice too, calm, below it and never a minor second against it. Every line note follows the chord sounding at it.
- **Key lifts that are led in and hold**: a lift holds to the end of the song and is prepared by chords as in a textbook modulation (*Cm - D7 -> Gm*, *Eb - F -> Gm*), over the last bars before it as far as the melody allows.
- **Harmony check** in Apply Arrangement's summary, the Song Sheet's arrangement details and the release record: the melody on chord tones, accented clashes with a chord, clashes between voice and line, chords in the key - before and after. *Song Sheet* has a new optional input **arrangement** for it.

**Lyrics and song form**

- **Lyrics that fit the melody** (new node **Fit Lyrics**, three of them inside *Write Song*): new cover lyrics are first put in the score's song form, then every line is counted against the notes of its phrase. Lines that do not fit go back to the same writer - only those lines, with their syllable targets, at most twice; when the draft fits, no second writer call is made. The last round shortens lines one or two syllables too long with the contractions a singer uses (*I'm*, *gonna*); shorter lines are sung as a melisma. In study A2 new lyrics fit 97-100 % of their phrases with a local writer held to the schema (drafts 21-56 %).
- **The song form follows the lyrics** (new node **Match Song Form** inside *YuE2 Plan*): the plan's sung sections are put in the lyrics' order or named after them; only when neither works, YuE2 plans once more with the next seed and the better plan wins. A plan that sings two blocks in one section (the chorus and the outro) stays as it is, and an intro whose only note is the verse's first word is no sung intro. On the owner's 200 sung songs the sung form matched the lyrics in 52 % with YuE2's own plan, 96 % with this. Plenio now has 25 nodes.
- **Syllable counter** for English and German with its own rules (silent *e*, *-ed*, *-le*, German onsets ...), used by the lyrics checks, the writer's line targets and the score editor's lyrics layout.

**Covers**

- **Covers keep their lyrics in place over long rests**: a rest of 4 bars or more inside a sung section becomes an interlude section of its own, so YuE2 sings the section on instead of starting the next lyrics there (a verse lost, the chorus twice).
- **Covers are named after their source**: with an empty *title* the Cover Brief takes the source recording's title tag - else its file name - with `-cover`. New optional input **source** on the Cover Brief (connected in *2 · YuE2 · Cover*).
- **Whisper's subtitle inventions leave the lyrics**: *Transcribe Lyrics* drops the sentences Whisper learnt from subtitled video ("Untertitel ...", "Vielen Dank fürs Zuschauen", "Amara.org", "Thanks for watching" ...) and reports them.

**Sheet music**

- **Sheet music with every export** (Export Release, new option *sheet music*: off, PDF (A4), PDF (Letter); A4 in the YuE2 templates): the final score - both voices, chord symbols, sections and the lyrics under the notes - as `<name>.pdf` next to the audio. An open ComfyUI page draws it with the score editor's *Export notation…* code - whichever workflow it shows - and Plenio saves it (a one-time token per export); a run that ended without an open page gets its PDF when the next page opens or comes back to the front (for up to 24 hours, while ComfyUI runs). Lyrics lines placed by hand come from the workflow the run was queued with. The release record lists the file.
- **Notation size**: *standard* (default, about 3 bars a line and 4 pages a song), *smaller*, *compact* and *large* - in *Export notation…* and Export Release's new *sheet music size*.
- **No lyrics lost in the notation**: lyrics that no note sings follow the music as text; German lyrics are split by the German rules; a line over several phrases breaks at a word; a phrase with more syllables than notes lets neighbouring syllables share notes. On the owner's 237 sung songs the lines missing from the sheet music went from 589 to 0.

**Help and videos**

- **Every field explains itself**: every input and output of the Plenio nodes and of the 13 blueprints has a tooltip - the blueprints' (and two native fields' that ComfyUI ships without one) come from `locales/en/nodeDefs.json`.
- **Tutorials 6 and 7**: *YuE2 · Song · Creative modes* and *YuE2 · Cover · Creative modes*; tutorials 0-5 recorded again. The README opens with the new spot (*Your idea. Your song. Your control.*).
- Studies A1 (local LLMs as arrangers), G1, A2 and E7 ([A1](docs/test-reports/2026-10-07-a1-arrangement-llm.md), [G1, A2, E7](docs/test-reports/2026-10-08-harmony-lyrics.md)).

### Changed

- **Lyrics where they are sung** (piano roll, notation, MusicXML, sheet music): the lines take the Vocal notes **in their order, as YuE2 sings them** - a block starts where a section starts (on its pickup), but follows the block before inside a section or sings on in a section of another kind; a line starts after a rest of an eighth where it can and runs on where its syllables need it; notes no line sings stay free. Before, a block took the section of the same number, so an instrumental intro or a plan with fewer sections moved every word by a section (owner's report). Measured on 79 of the owner's renders with every word timed: words within a beat of where they are sung 56 % -> 72 %, line starts 52 % -> 64 % ([study](docs/design/lyrics-placement.md)). Lines placed by hand keep their line and place; the lyrics lane edits a block between the lines of the blocks around it.
- The App mode of the song templates shows the creative mode with its sliders, the writer model and (YuE2 Song and Cover) the arrangement seed.
- *Transcribe Lyrics*: when there is no clear singing for new lyrics, the message says that *lyrics closeness* 0 and the phrasing reference off write them without the source's text.
- README and user guides: the tutorials are one link to the playlist (the README with a summary of every video); the README describes what Plenio does and leaves the changes to this changelog.
- `tools/build_graphs.py` builds the shipped templates again, and a test fails when a shipped graph (or its tooltips) differs from the generator's output.

### Fixed

- **A review stop in a series never ended.** With *new song every run* and a Song Sheet on *stop for review*, every run wrote a new song, so *Approve* was always for the previous one. Now a song that waits for review is kept until it is rendered; *new cover every run* behaves the same.
- **Every song of a series gets its own seeds**: the briefs have a new output *song seed*, added to the draft and plan seeds.
- **An edit in a series belongs to its song**: the next song takes its own draft instead of stopping with a conflict; *manual* text still stays for the whole series.
- *Song Sheet · DAW* always stops for review (a series stopped with an invalid empty score).
- **Score editor: a selection frame that scrolled the roll lost its notes** and took the chord symbols instead.
- **Cancelling the lyrics ASR on Windows** left its job folder in the temp directory when ComfyUI runs in a venv (its `python.exe` is a launcher; the interpreter ends a moment later).
- The steps that only improve a song - *Match Song Form*, *Apply Arrangement*, *Fit Lyrics* - pass their input on with a warning after an unexpected error instead of stopping the run.
- **A ComfyUI page left open while Plenio was updated** keeps the old Plenio code, whose files are gone: every export said *Failed to fetch dynamically imported module* and the Song Sheet editor did not open. The page now finds out and says to reload it (F5); the sheet music still waiting is saved then.
