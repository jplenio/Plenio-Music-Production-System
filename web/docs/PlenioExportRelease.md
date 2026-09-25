# Export Release

Writes the finished song into the ComfyUI output folder with a **release record** next to it.

**Formats** - *flac* (24-bit, lossless; default), *mp3* (VBR V0, LAME), *wav* (32-bit float: never clips, but holds only a few tags and no cover). Tick one or more.

**tags**

- *title only* - the title from the Song Sheet (or the copied title).
- *tags* - artist, album, year, track, genre, comment, album artist, composer.
- *copy from loaded file* - copies tags and the embedded cover from the file loaded by the workflow's **Load Audio** node (as in *4 · Enhance & Master*); the workflow must contain exactly one Load Audio node. The *title* input and the *cover* input win over copied values.

**cover** - an image input (for example from a cover-art block): cropped square, saved as `<name>.jpg` next to the audio and embedded into FLAC and MP3 when the optional package **mutagen** is installed (`python -m pip install mutagen` in ComfyUI's Python; GPL-2.0-or-later, therefore not bundled). Without mutagen the cover is only saved as a file and the node says so.

**original** - optional: also writes this audio (for example the unmastered take) as `<name> (original).flac`.

**Naming** - *naming* pattern with `{title}`, `{date}`, `{time}`, `{seed}`; `/` makes sub-folders; *collision* decides what happens when a file exists (number, overwrite, error).

**Release record** (`<name>.plenio.json`) - the documents with their hashes, the executed graph (secrets redacted), all connected reports, every written file with size and SHA-256, the delivered audio's loudness (LUFS, true peak, loudness range), the tags, and the licences of the models used.

Samples above full scale are clipped in FLAC and MP3; the node warns. Put **Loudness & Dynamics** before the export.
