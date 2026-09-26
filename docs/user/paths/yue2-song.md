# 1 · YuE2 · Song

A new song from a short brief: a local text model writes title, style and lyrics, YuE2 plans a score (ABC notation) and renders the song, Master finishes it, and Export writes a 24-bit FLAC with a release record.

```text
Song Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Score Tools -> Song Sheet · Score -> YuE2 Render -> Master -> Export Release
                                  ^ YuE2 Model (loader, optional instrumental adapter, Engine Profile) feeds all YuE2 steps
```

## Quick start

1. Open **1 · YuE2 · Song** from the template browser.
2. In **Song Brief**, choose the **mode** (below), then pick a template or describe the song. *length* (1:00 to 6:00) and *vocals* (sung or instrumental) are set only here.
3. Press **Run**. The first run downloads missing models (YuE2 3B int8, Gemma 4 E4B writer), then takes a few minutes.
4. The mastered song appears in the preview and in `output/plenio/` as `<date> <title>.flac`, with the unmastered take `<date> <title> (original).flac` and the record `<date> <title>.plenio.json`.

Measured on an RTX 5060 Ti 16 GB: about 3 minutes for a 3-minute song, including writing and planning.

## A series or one song: the mode

| Mode | A run | Next run |
|---|---|---|
| **new song every run** (template default) | writes, plans and renders a song straight through - the sheets do not stop | a **different song** from the same brief: the writer is asked for a new title, story, images and hook (a new *series variation*, shown in the brief's summary) |
| **one song, stop to review** | stops at **Song Sheet · Text**; after *Approve* and another run, at **Song Sheet · Score**; after that *Approve* the song is rendered | a **new take** of the approved song: the take seed changes, the text and the score stay (they are cached) |

**Many songs with one click:** in the mode *new song every run*, set the batch count next to **Run** (App mode: *Number of runs*) to 10 and press Run once - ComfyUI queues ten runs, and each one is a new song, exported under its own title (a repeated title gets ` (2)`). The brief, the length and the vocals stay the same for the whole series.

**One song, carefully:** in the mode *one song, stop to review*, nothing is rendered before you approved the text and the score. Afterwards, new takes: to get new text, change the **Draft seed**; for a new score, change the *plan seed* in **YuE2 Plan** (both mean reviewing again).

**Draft seed:** the writer's seed is its own node in *2 · WRITE* (and in App mode), like the take seed. *fixed* (default) keeps the draft - and your approval - from run to run; *randomize* lets the writer draw a new draft every run. Use *randomize* in *new song every run* for even more varied series; keep it *fixed* in *one song, stop to review*, otherwise every run brings a new text to approve.

## Inspect and edit what YuE2 receives

Each **Song Sheet** shows the documents that go to YuE2, exactly as they will be used. Press **Edit Song Sheet…**:

| You do | The document becomes | What happens later |
|---|---|---|
| nothing | *auto* | the newest draft is used |
| change the text | *edited* | your text is used while the draft stays the same; if the draft changes (new draft seed, new plan), the run **stops with a conflict** and asks you |
| press *Make manual* | *manual* | your text is always used; the draft is not even computed |
| press *Use draft* | *auto* | back to the draft |

In a conflict you choose: keep your edit (manual), use the new draft, or merge by hand.

**Review:** the sheets' *review* is set to *as the brief says*: they stop in the mode *one song, stop to review* and continue in *new song every run*. Set a single sheet to *stop for review* or *continue* to override the brief (for example: review only the text, never the score). A stopped run waits after that sheet until you press **Approve** in the editor; approving is valid only for exactly the documents you saw.

**Edits in a series:** in the mode *new song every run* each run brings a new draft, so an *edited* document conflicts on the next run. Make it *manual* instead - the whole series then uses your text (for example a fixed style line while the lyrics change).

Two sheets are needed because the score is planned from the final text: **Song Sheet · Text** owns title, style, lyrics and artwork prompt; **Song Sheet · Score** owns the score and shows the text as context.

## Instrumental songs

Set *vocals* to *instrumental* and choose *instrument plays the lead* or *accompaniment only*. Plenio then guarantees an instrumental **conditioning**: the lyrics are the single tag `[instrumental]` (YuE2 plans the form itself - bare tags gave the most instrument-like takes in the owner's listening), a style without vocal or language words, and a score whose Vocal voice is silent (the melody moves to the instrument, or is removed).

YuE2 chooses the length of instrumental plans itself (63-387 s for an 80-s request in Phase 4A). When a plan is more than 1.5 times the brief's length, Score Tools removes whole sections (*fit length*) and says what it removed - or why it could not: in one Phase 4B run the shortest complete form (intro, verse, interlude, chorus, ending) already lasted 140 s for a 90-s request. Delete sections in Song Sheet · Score or plan again with another seed.

The audio itself is not guaranteed free of voice-like sounds. To measure it, add *Audio Encoder Loader* (SheetSage2) and *Check Vocals* after the render - see [Instrumental](../concepts/instrumental.md).

## What the checks mean

- **Style**: one comma-separated line of about 40 words; no song structure, timing or negations.
- **Lyrics**: `[Tag]` lines with sung lines beneath; no stage directions or repeat marks.
- **Score length**: YuE2 plans roughly 8-10 seconds per sung line. If the plan is much longer or shorter than the brief's length, the score sheet warns.
- **Budget**: style, lyrics and score share YuE2's context of 24 576 tokens with the music (25 tokens per second). The score sheet shows how many seconds of music fit.

## Finishing: Master, cover art, files

- **Plenio · Master** (group *FINISH*) masters every take before Export: a gentle warm tone match and -14 LUFS with a true peak of at most -1 dBTP. Open the block to change the EQ, the loudness target or the compression style; its *sample rate* is on the block. Details: [Mastering and audio formats](../concepts/mastering.md).
- **Export Release** writes the mastered song, the unmastered take as `(original).flac` and the release record. Formats (FLAC, MP3, WAV) and tags are set on the node.
- **Cover Art (optional)** paints a cover from the sheet's *artwork prompt* with FLUX.2 Klein 4B (4 steps, 1024 x 1024; about 16 GB of extra model files, Apache-2.0). It is bypassed: select *Cover Art* and *Cover preview* and press **Ctrl+B**. Export embeds the cover in the FLAC and MP3 files and saves it next to the song as `.jpg`. The cover seed is fixed, so new takes of one song keep the cover (change the seed for another one); every song of a series gets its own cover, painted from its own artwork prompt.

## App mode

Switch **Graph / App** at the top left for a simple form with the mode, the brief, the take seed and the buttons **Song Sheet · Text** and **Song Sheet · Score** - review and editing work in the app as in the graph; see [App mode](../concepts/app-mode.md).

## Licence

YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The release record names the licence of the models used.
