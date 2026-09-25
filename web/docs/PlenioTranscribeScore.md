# Transcribe Score

Transcribes a recording into the native two-voice ABC score with **SheetSage2** - the same score as the native *SheetSage2 Audio to ABC* node in *full* mode - and keeps the **beat grid**: the start and end of every bar and the times of the sung notes (`PLENIO_TIMELINE`).

- **audio_encoder** - SheetSage2 from *Audio Encoder Loader* (`sheetsage2_bf16.safetensors`).
- **audio** - the source; trim it first (*Trim Audio Duration*) to cover a part of a song.

Outputs: **score** (with chords and section comments), **timeline** (for *Transcribe Lyrics*, the Song Sheet and *Check Vocals*), **report** (bars, key, tempo, sections with their start times, vocal and instrument notes).

Why the timeline: SheetSage2 writes one tempo into the ABC but places the notes on the real beat grid, so reading the score at a constant tempo misplaces bars by up to two seconds. Lyrics are placed with the real bar times.

Limits:

- **Length**: SheetSage2 transcribes up to **5:00** in one pass and needs about 16.5-17 GiB of GPU memory for it (independent of the length). Longer sources need a second pass that does not fit a 16 GB card; the node stops before starting and asks you to trim. Larger cards may try.
- A source without a steady beat, or silence, cannot be transcribed; the node stops with a clear message.
- *no vocal melody found* means the transcription heard no singing - choose *instrumental* or enter lyrics manually.

Licence: SheetSage2 (Comfy-Org/YuE2 repackaging) is **CC BY-NC 4.0**.
