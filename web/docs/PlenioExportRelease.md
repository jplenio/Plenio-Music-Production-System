# Export Release

Writes the finished song into the ComfyUI output folder with a **release record** next to it.

**Formats** - *flac* (24-bit, lossless; default), *mp3* (VBR V0, LAME), *wav* (32-bit float: never clips, but holds only a few tags and no cover). Tick one or more.

**tags**

- *title only* - the title from the Song Sheet (or the copied title).
- *tags* - artist, album, year, track, genre, comment (preset to *Powered by Plenio Music Production System / ComfyUI*; change or clear it), album artist, composer.
- *copy from loaded file* - copies tags and the embedded cover from the file loaded by the workflow's **Load Audio** node (as in *4 · Enhance & Master*); the workflow must contain exactly one Load Audio node. The *title* input and the *cover* input win over copied values.

**cover** - an image input (for example from a cover-art block): cropped square, saved as `<name>.jpg` next to the audio and embedded into the FLAC and MP3 files - the mastered ones and the `(original).flac` - whichever *tags* option is chosen (*title only*, *tags* or *copy from loaded file*). A copied cover (*copy from loaded file*) is embedded the same way; the *cover* input wins over it. WAV has no place for a cover: it keeps the `.jpg` only. No extra package is needed. MP3 tags are ID3v2.3, which Windows Explorer, Windows Media Player and most players read (ffmpeg's default 2.4 is not shown there).

**original** - optional: also writes this audio (for example the unmastered take) as `<name> (original).flac`.

**Naming** - *naming* pattern with `{title}`, `{date}`, `{time}`, `{seed}`; `/` makes sub-folders; *collision* decides what happens when a file exists (number, overwrite, error). All files of one export share one name: with *number* the whole set becomes `<name> (2)` when any of its files - audio, original, cover or record - already exists, so an earlier export is never overwritten.

**sheet music** - *off*, *PDF (A4)* or *PDF (Letter)*: also saves the score's sheet music as `<name>.pdf` next to the audio - both voices, chord symbols, section names and the **lyrics under the notes**, with the title, exactly as the Song Sheet's *Export notation… > PDF* draws it (lyrics lines placed by hand included: the export reads them from the workflow the run was queued with). The notation is drawn by the browser: the export reserves the name, an open ComfyUI page draws the PDF right after the export - whichever workflow it shows - and Plenio saves it; the node's summary then says *saved* (when its workflow is open), a message says so, and the record lists the file. When no page was open (queued over the API, the tab closed or reloaded), the next ComfyUI page that opens or comes back to the front draws the PDFs still waiting - for up to 24 hours, while ComfyUI runs; until then the record says *drawn by the browser after the export*. Needs a score: MiniMax Music 3 and runs without planning have none (noted). The YuE2 templates save it on A4.

**sheet music size** - how large the music is drawn: *standard* (default) about 3 bars a line - about 4 pages for a song of 3-4 minutes; *smaller* about 3-4 bars a line (3 pages), *compact* about 4 (2-3 pages), *large* 1-2 bars a line (about 13 pages, the biggest notes). The text shrinks less than the notes. The same sizes as *Export notation…* in the Song Sheet.

**Release record** (`<name>.plenio.json`) - the documents with their hashes, the executed graph (secrets redacted), all connected reports, every written file with size and SHA-256, the delivered audio's loudness (LUFS, true peak, loudness range), the tags, and the licences of the models used.

With *sheet music* on the record also says which PDF belongs to the export, its paper and size, and whether it was saved.

Samples above full scale are clipped in FLAC and MP3; the node warns. MP3 holds at most 48 kHz: hi-res audio (88.2/96/192 kHz) is converted for the MP3 only (to 44.1 or 48 kHz); FLAC and WAV keep the rate, and the node notes the conversion. Audio with NaN or infinite samples is refused. Put **Loudness & Dynamics** before the export.
