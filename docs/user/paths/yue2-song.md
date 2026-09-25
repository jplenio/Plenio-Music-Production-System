# 1 · YuE2 · Song

A new song from a short brief: a local text model writes title, style and lyrics, YuE2 plans a score (ABC notation) and renders the song, and Export writes a 24-bit FLAC with a release record.

```text
Song Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Score Tools -> Song Sheet · Score -> YuE2 Render -> Export Release
                                  ^ YuE2 Model (loader, optional instrumental adapter, Engine Profile) feeds all YuE2 steps
```

## Quick start

1. Open **1 · YuE2 · Song** from the template browser.
2. In **Song Brief**, pick a template or describe the song. *length* and *vocals* (sung or instrumental) are set only here.
3. Press **Run**. The first run downloads missing models (YuE2 3B int8, Gemma 4 E4B writer), then takes a few minutes.
4. The song appears in the preview and in `output/plenio/` as `<date> <title>.flac` plus `<date> <title>.plenio.json`.

Measured on an RTX 5060 Ti 16 GB: about 3 minutes for a 3-minute song, including writing and planning.

## New takes

Run again: the **Take seed** changes, the text and the score stay the same (they are cached). To get new text, change the *draft seed* in **Write Song**; for a new score, change the *plan seed* in **YuE2 Plan**.

## Inspect and edit what YuE2 receives

Each **Song Sheet** shows the documents that go to YuE2, exactly as they will be used. Press **Edit Song Sheet…**:

| You do | The document becomes | What happens later |
|---|---|---|
| nothing | *auto* | the newest draft is used |
| change the text | *edited* | your text is used while the draft stays the same; if the draft changes (new draft seed, new plan), the run **stops with a conflict** and asks you |
| press *Make manual* | *manual* | your text is always used; the draft is not even computed |
| press *Use draft* | *auto* | back to the draft |

In a conflict you choose: keep your edit (manual), use the new draft, or merge by hand.

**Review:** set *review* on a sheet to *stop for review*. The run then stops after that sheet until you press **Approve** in the editor; approving is valid only for exactly the documents you saw.

Two sheets are needed because the score is planned from the final text: **Song Sheet · Text** owns title, style, lyrics and artwork prompt; **Song Sheet · Score** owns the score and shows the text as context.

## Instrumental songs

Set *vocals* to *instrumental* and choose *instrument plays the lead* or *accompaniment only*. Plenio then guarantees an instrumental **conditioning**: lyrics with section tags only, a style without vocal or language words, and a score whose Vocal voice is silent (the melody moves to the instrument, or is removed). The audio itself is not guaranteed free of voice-like sounds; that check arrives with *Check Vocals*.

## What the checks mean

- **Style**: one comma-separated line of about 40 words; no song structure, timing or negations.
- **Lyrics**: `[Tag]` lines with sung lines beneath; no stage directions or repeat marks.
- **Score length**: YuE2 plans roughly 8-10 seconds per sung line. If the plan is much longer or shorter than the brief's length, the score sheet warns.
- **Budget**: style, lyrics and score share YuE2's context of 24 576 tokens with the music (25 tokens per second). The score sheet shows how many seconds of music fit.

## Licence

YuE2 weights are **CC BY-NC 4.0 (non-commercial)**. The release record names the licence of the models used.
