# 3 · MiniMax · Song

A new song from a short brief with **MiniMax Music 3**: a local text model writes title, a structured caption and lyrics, MiniMax renders the song from caption and lyrics, Master finishes it, and Export writes a 24-bit FLAC with a release record. MiniMax takes no score, so there is one Song Sheet.

▶ **Video:** [Tutorial 3 · MiniMax · Song](https://youtu.be/rptsvP0yYio) - the whole path in ComfyUI, narrated, with chapters. All of them in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

```text
Song Brief -> Write Song -> Song Sheet -> MiniMax Render -> Master -> Export Release
                               ^ MiniMax Model (diffusion model, text encoder, VAE, Engine Profile) feeds all MiniMax steps
```

## Quick start

1. Open **3 · MiniMax · Song** from the template browser.
2. In **Song Brief**, choose the **mode** - *new song every run* (the template default: a different song every run, no stops) or *one song, stop to review* (the run stops at the Song Sheet until you approve) - then pick a template or describe the song. *length* (1:00 to 6:00) and *vocals* (sung, sparse vocals or instrumental) are set only here.
3. Press **Run**. The first run downloads missing models (MiniMax Music 3: diffusion model, int8 text encoder, VAE) and, unless you have one, [the writer's Gemma 4 12B](../models.md#the-writer-gemma-4-12b).
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
- The **render ceiling** follows the brief's length (for example short 1:30 -> 1:54, standard 3:00 -> 3:37, long 4:30 -> 5:21) and is at most **6:00** - also for *very long (about 6:00)*, which leaves MiniMax no headroom. MiniMax may end the song earlier.
- MiniMax sings roughly one lyric line every 5 seconds; the sheet warns when the lyrics are far too short or too long for the brief's length.

## Series, new takes, editing, review

As in [1 · YuE2 · Song](yue2-song.md#a-series-or-one-song-the-mode):

- **new song every run:** every run is a different song from the brief; the batch count next to **Run** (App mode: *Number of runs*) makes a series with one click. Each song is exported under its own title.
- **one song, stop to review:** the run stops at the **Song Sheet** until you press **Approve**; after that every run is a new take (the take seed changes, the documents are cached).
- **Draft seed** (node in *2 · WRITE*, also in App mode): 🔒 *same seed* keeps the draft, 🎲 *new seed* writes a new draft every run - more variety in a series; keep it 🔒 when you review ([Seeds](../concepts/seeds.md)).
- Edit documents in the **Song Sheet** (your edit wins until its draft changes, then the run stops with a conflict; in a series, make a fixed document *manual*). The sheet's *review* follows the brief (*as the brief says*); set it to *continue* or *stop for review* to override. See [Song Sheet](../concepts/song-sheet.md).

## Sparse vocals

Set *vocals* to *sparse vocals* for a mostly instrumental song whose voice sings only a few short phrases (a hook, a call, a chant, wordless sounds). The lyrics are a map as long as an instrumental's - MiniMax ends short maps early - of empty *[Instrumental]* sections, a *[Break]* and two to four *[Hook]* sections with one or two short lines each (at most 6 lines for 3:00); the caption's *Vocal Details* say that the voice sings only now and then. The Song Sheet warns when the lyrics have more than twice as many lines, not when they have fewer than a sung song. Not yet measured with MiniMax.

## Instrumental songs

Set *vocals* to *instrumental*. Plenio then conditions MiniMax with:

- **lyrics** that are a map of section tags only ([Intro], [Instrumental], [Solo], [Break], [Outro]), about **twice as many sections** as a sung song of the same length - MiniMax ends short maps early (legacy toolkit experience);
- a caption whose **Vocal Details are `n/a`** (the Parse step sets it if the writer did not) and that describes instruments only.

The audio itself is not guaranteed free of voice-like sounds; see [Instrumental](../concepts/instrumental.md). This wording is the legacy toolkit's measured practice; Plenio's own listening check for MiniMax instrumentals is still open (instrumental strategy I-5).

## Memory

If decoding runs out of memory, open the **MiniMax Render** block and turn on *tiled decode*.

## Finishing: Master, cover art, files

- **Plenio · Master** (group *FINISH*) masters every take before Export: a gentle warm tone match and -14 LUFS with a true peak of at most -1 dBTP. First come the **[stems](../concepts/stems.md)** when you switch *stems* on on the block (off by default; the mixer is inside the block), then, before the EQ, **[Audio HQ](../concepts/audio-hq.md)**: *HQ 1 · Stereo Cleanup* is on, *HQ 2 · Regenerate Highs* (UniverSR, 229 MB; about 1.5 s per second of music on an RTX 5060 Ti) runs with the **HQ Mastering** switch at the top of the template (**off** by default): on, *HQ 2 · Regenerate Highs* runs - it can clearly reduce AI shimmer and artifacts, but the song takes about twice as long, *HQ 3 · De-Reverb* is bypassed; their presets follow the brief's genre (*auto*). Open the block to change an HQ preset, bypass a stage, or change the EQ, the loudness target or the compression style; its *sample rate* is on the block. Details: [Mastering and audio formats](../concepts/mastering.md).
- **Export Release** writes the mastered song, the unmastered take as `(original).flac` and the release record. Formats (FLAC, MP3, WAV) and tags are set on the node.
- **Cover Art** (on) paints a cover from the sheet's *artwork prompt* with FLUX.2 Klein 4B (4 steps, 1024 x 1024; about 16 GB of model files, Apache-2.0). The **Cover Art** card in *HQ Mastering & Cover Art* at the top switches it off (its three nodes are then bypassed, no image model loads). Export embeds the cover in the FLAC and MP3 files and saves it next to the song as `.jpg`. In *new song every run* the cover seed is 🎲 (every song its own cover); with *one song, stop to review* it is 🔒, so new takes of the song keep the cover.

## App mode

Switch **Graph / App** at the top left for a simple form with the mode, the brief, the take seed and the **Song Sheet** button (review and editing work in the app); see [App mode](../concepts/app-mode.md).

## Licence

MiniMax Music 3 weights are released under the **MiniMax-Music3 Community License** (commercial use under its conditions; the Comfy-Org mirror card says apache-2.0 - the licence file of the original release is authoritative). The release record names the licence.
