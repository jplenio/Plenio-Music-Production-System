# 2 · YuE2 · Cover

A new version of a recorded song: SheetSage2 transcribes the source into a score (melody, chords, sections, tempo), you decide what happens to the vocals and the harmony, and YuE2 renders the cover from the final score. Master finishes the best take, and Export writes a 24-bit FLAC with a release record.

```text
Source -> (Excerpt) -> Transcribe Score -> Score Tools -> Song Sheet · Score
                                                             |
            Transcribe Lyrics (original lyrics) / Write Song (new lyrics) / section tags (instrumental)
                                                             |
                                                     Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Master -> Export
```

## Quick start

1. Open **2 · YuE2 · Cover** from the template browser.
2. Upload the source in **Source recording**. Up to 5:00 is transcribed in one pass; for longer songs enable **Excerpt** (Trim Audio Duration) and cover one part at a time.
3. In **Cover Brief** set the target style and the **vocals**: *instrumental* (default), *original lyrics* or *new lyrics*. **harmony**: *new accompaniment* (YuE2 re-harmonises) or *keep original chords*.
4. Press **Run**. SheetSage2 transcribes the source; the run **stops at Song Sheet · Score**. Open it, check the score - above all the section names and boundaries, because the lyrics follow them - and press **Approve**.
5. Run again. The lyrics are drafted and the run **stops at Song Sheet · Text**. Check and correct the lyrics (your text always wins), then **Approve**.
6. Run again to render. Each further run is a new take (the take seed changes).

Measured on an RTX 5060 Ti 16 GB for an 83-second source: transcription under 20 s, lyrics draft 30-80 s (the ASR model loads once), one take about 30-40 s, two takes 2 minutes including the checks.

## The three vocal modes

| Mode | Lyrics come from | What you check in Song Sheet · Text |
|---|---|---|
| *instrumental* | the score's section tags (`[Verse]`, `[Chorus]` ...) | nothing to write; the style has no voice or language |
| *original lyrics* | **Transcribe Lyrics** (faster-whisper large-v3) on the sung parts of the source, placed into the score's sections | unsure words are highlighted; correct misheard words and line breaks |
| *new lyrics* | the writer model, written against the score's sections and phrasing | the syllable check: each section needs about one syllable per melody note |

**Which lyrics are used - the order of precedence:**

1. Lyrics you made **manual** in Song Sheet · Text: always used; the ASR or the writer is not even asked (for original lyrics with a named language, the ASR does not run at all).
2. Lyrics you **edited**: used as long as the draft they were made from is unchanged. If the draft changes - for example because you renamed a section in the score - the run stops with a **conflict** instead of replacing your correction.
3. Otherwise the **draft**: ASR (original lyrics), writer (new lyrics) or the section tags (instrumental).

The same holds for the score in Song Sheet · Score: your edited or manual score is what YuE2 renders and what the lyrics are placed into.

## Getting good new lyrics

YuE2 sings the melody exactly as transcribed. Two things decide whether the new words are understandable (measured in Phase 4B):

- **Syllables**: about one syllable per note in every section. Lyrics with 0.67-0.80 syllables per note were sung at a word error rate above 100 %; the source's own lyrics (0.9-1.0) were sung perfectly. The text sheet warns when a section is outside 0.85-1.3. Turn on **phrasing reference** in the Cover Brief: the writer then gets the syllable count of every source line.
- **Voice range**: the voice must fit the melody. The same lyrics sung by a "warm male baritone" on a female melody (F#4-A5) reached a word error rate of 113 %, with a "soft female vocal" 50 %. The text sheet warns; transpose the score with Score Tools (-12 / +12) or change the voice. With an empty voice in the brief, the writer chooses one that fits.

Enable **Check sung lyrics** (bypassed by default) to measure what was sung: word error rate overall and per section.

## Instrumental covers and vocal checks

For instrumental covers Plenio silences the Vocal voice of the score (the melody moves to an instrument, or is removed), writes only section tags, removes voice and language words from the style and renders with the **instrumental adapter** (a LoRA; bypass *Instrumental adapter* to switch it off - the optional adapter inside the collapsed model block stays bypassed in this template). See [Instrumental](../concepts/instrumental.md).

**YuE2 Takes** renders *takes* versions (seeds take seed, take seed + 1, ...). **Check Vocals** re-transcribes every take and keeps the first one without vocal notes; the preview plays all takes, best first. N takes cost N renders.

## Finishing: Master, cover art, files

- **Plenio · Master** (group *FINISH*) masters the take Check Vocals keeps before Export: a gentle warm tone match and -14 LUFS with a true peak of at most -1 dBTP. Open the block to change the EQ, the loudness target or the compression style; its *sample rate* is on the block. Details: [Mastering and audio formats](../concepts/mastering.md).
- **Export Release** writes the mastered song, the unmastered take as `(original).flac` and the release record. Formats (FLAC, MP3, WAV) and tags are set on the node.
- **Cover Art (optional)** paints a cover from the sheet's *artwork prompt* with FLUX.2 Klein 4B (4 steps, 1024 x 1024; about 16 GB of extra model files, Apache-2.0). It is bypassed: select *Cover Art* and *Cover preview* and press **Ctrl+B**. Export saves the cover next to the song and embeds it when mutagen is installed. The cover seed is fixed, so new takes keep the cover; change the seed for another one.

This template has no App mode: its two review stops need the Song Sheet editor.

## Limits

- Sources longer than 5:00 need a second SheetSage2 pass that does not fit a 16 GB card: trim them.
- The original-lyrics ASR is a draft. It can mishear words, merge lines, and invent short phrases at the end of a passage; Plenio removes the typical inventions and shows unsure words, but read the lyrics before approving.
- A take can end while the music still plays; Check Vocals reports it (Master does not fade out yet).
- The Song Sheet editor's section table shows the source's times; playing a section is not built in yet.

## Licence

YuE2, SheetSage2 (Comfy-Org repackaging) and the instrumental adapter are **CC BY-NC 4.0 (non-commercial)**. faster-whisper and the Whisper weights are MIT. The release record lists the licences. Covering a song also touches the rights in the original composition and lyrics - see [Licensing](../licensing.md).
