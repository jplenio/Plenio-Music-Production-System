# Export Release

Writes the audio as **24-bit FLAC** into the ComfyUI output folder and a release record (`.plenio.json`) next to it.

- **folder** - sub-folder of the output folder.
- **naming** - pattern with `{title}`, `{date}`, `{time}`, `{seed}`; `/` creates sub-folders. Names are made safe for all systems.
- **collision** (advanced) - add ` (2)`, overwrite, or stop when a file exists.
- **reports** - connect the Song Sheet reports; the record then contains the exact documents, their states and hashes.

The record also contains the executed graph with its seeds and settings (secret-like values removed), file hashes and the licences of the models used. Samples above full scale are clipped and reported as a warning.

MP3/WAV, tags and cover art follow in a later version.
