# 3 · MiniMax · Song

A new song from a short brief with **MiniMax Music 3**: a local text model writes title, a structured caption and lyrics, MiniMax renders the song from caption and lyrics, Master finishes it, and Export writes a 24-bit FLAC with a release record. MiniMax takes no score, so there is one Song Sheet.

```text
Song Brief -> Write Song -> Song Sheet -> MiniMax Render -> Master -> Export Release
                               ^ MiniMax Model (diffusion model, text encoder, VAE, Engine Profile) feeds all MiniMax steps
```

## Quick start

1. Open **3 · MiniMax · Song** from the template browser.
2. In **Song Brief**, pick a template or describe the song. *length* and *vocals* (sung or instrumental) are set only here.
3. Press **Run**. The first run downloads missing models (MiniMax Music 3: diffusion model, int8 text encoder, VAE; the Gemma 4 E4B writer).
4. The mastered song appears in the preview and in `output/plenio/`, with the unmastered take as `(original).flac` and its release record.

## The caption

MiniMax reads a **caption** (the Song Sheet's *style* document; the editor calls it *Caption*) and the lyrics. Plenio asks the writer for a caption in three headed parts, each heading on its own line:

```text
Global Metadata
bpm is 88. key is A, and scale is major. Piano pop / soft rock.
Intimate verses open into a warm, anthemic chorus; clean, close production.

Vocal Details
English lyrics; warm female alto lead, soft in the verses, full in the chorus.

Arrangement
Piano and rounded bass carry the verses; drums and strings enter in the pre-chorus; ...
```

A free-text caption works too; the Song Sheet only notes that the structured form describes the song more reliably.

## Budget and length

- **5 000 tokens** for caption and lyrics together is a hard limit of the MiniMax text encoder. The Song Sheet counts them **exactly** with the loaded text encoder and stops *before* rendering if they do not fit, telling you how many tokens to cut. In the editor (before a run) the count is an estimate.
- The **render ceiling** follows the brief's length (short 1:30 -> 1:54, standard 3:00 -> 3:37, long 4:30 -> 5:21) and is at most **6:00**. MiniMax may end the song earlier.
- MiniMax sings roughly one lyric line every 5 seconds; the sheet warns when the lyrics are far too short or too long for the brief's length.

## New takes, editing, review

As in the YuE2 paths: run again for a new take (the take seed changes, the documents are cached); edit documents in the **Song Sheet** (your edit wins until its draft changes, then the run stops with a conflict); set *review* to *stop for review* to approve the documents before rendering. See [Song Sheet](../concepts/song-sheet.md).

## Instrumental songs

Set *vocals* to *instrumental*. Plenio then conditions MiniMax with:

- **lyrics** that are a map of section tags only ([Intro], [Instrumental], [Solo], [Break], [Outro]), about **twice as many sections** as a sung song of the same length - MiniMax ends short maps early (legacy toolkit experience);
- a caption whose **Vocal Details are `n/a`** (the Parse step sets it if the writer did not) and that describes instruments only.

The audio itself is not guaranteed free of voice-like sounds; see [Instrumental](../concepts/instrumental.md). This wording is the legacy toolkit's measured practice; Plenio's own listening check for MiniMax instrumentals is still open (instrumental strategy I-5).

## Memory

If decoding runs out of memory, open the **MiniMax Render** block and turn on *tiled decode*.

## Finishing: Master, cover art, files

- **Plenio · Master** (group *FINISH*) masters every take before Export: a gentle warm tone match and -14 LUFS with a true peak of at most -1 dBTP. Open the block to change the EQ, the loudness target or the compression style; its *sample rate* is on the block. Details: [Mastering and audio formats](../concepts/mastering.md).
- **Export Release** writes the mastered song, the unmastered take as `(original).flac` and the release record. Formats (FLAC, MP3, WAV) and tags are set on the node.
- **Cover Art (optional)** paints a cover from the sheet's *artwork prompt* with FLUX.2 Klein 4B (4 steps, 1024 x 1024; about 16 GB of extra model files, Apache-2.0). It is bypassed: select *Cover Art* and *Cover preview* and press **Ctrl+B**. Export saves the cover next to the song and embeds it when mutagen is installed. The cover seed is fixed, so new takes keep the cover; change the seed for another one.

## App mode

Switch **Graph / App** at the top left for a simple form with the brief and the take seed; see [App mode](../concepts/app-mode.md). The app runs without review stops (the sheets' default here).

## Licence

MiniMax Music 3 weights are released under the **MiniMax-Music3 Community License** (commercial use under its conditions; the Comfy-Org mirror card says apache-2.0 - the licence file of the original release is authoritative). The release record names the licence.
