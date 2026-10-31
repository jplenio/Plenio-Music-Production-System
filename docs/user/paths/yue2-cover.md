# 2 · YuE2 · Cover

A new version of a recorded song: SheetSage2 transcribes the source into a score (melody, chords, sections, tempo), you decide what happens to the vocals and the harmony, and YuE2 renders the cover from the final score. Master finishes the best take, and Export writes a 24-bit FLAC with a release record.

▶ **Video:** [Tutorial 2 · YuE2 · Cover](https://youtu.be/Si4d-o8LpZ0) - the whole path in ComfyUI, narrated, with chapters. All of them in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

```text
Source -> (Excerpt) -> Transcribe Score -> Score Tools -> Arrange -> Song Sheet · Score
                                                             |
            Transcribe Lyrics (original lyrics) / Write Song (new lyrics) / section tags (instrumental)
                                                             |
                                                     Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Master -> Export
```

## Quick start

1. Open **2 · YuE2 · Cover** from the template browser.
2. Upload the source in **Source recording**. SheetSage2 reads it in windows of 5:00 (a 5:16 song takes about 20 s and 2 GB of GPU memory); with **Excerpt** (Trim Audio Duration) you cover one part of a song.
3. In **Cover Brief** choose the **mode** (below): the default *new cover every run* renders without stops - a queue of covers runs through; *one cover, stop to review* (steps 4-6) lets you check the transcription first. Then the target style and the **vocals**: *instrumental*, *original lyrics* or *new lyrics*. **harmony**: *new accompaniment* (YuE2 re-harmonises) or *keep original chords*. Both review stops show the **source recording** under the score - its waveform in the roll, the **sung pitch** of its vocals as a curve over the notes (node *Sung Pitch*, in group 3 · SCORE: it separates the vocals with the Stems model once per source, about half the song's length on a 16 GB card) and *hear: both* to play it together with the transcribed notes, bar by bar (A/B switches at once) - so you can check notes and words against the original. The template starts with the style template *pop/dance-pop-vocal* (its genre, description and voice shown in the fields), *original lyrics* with the language detected from the singing, and *keep original chords*.
4. Press **Run**. SheetSage2 transcribes the source; with *new cover every run* the run goes on to the export. With *one cover, stop to review* it **stops at Song Sheet · Score**. Open it, check the score - above all the section names and boundaries, because the lyrics follow them - and press **Approve**.
5. Run again. The lyrics are drafted and the run **stops at Song Sheet · Text**. Check and correct the lyrics (your text always wins), then **Approve**. Its score tab shows the score with the lyrics over the notes, and you can still **edit the score there**. Apply or Approve writes it into Song Sheet · Score and keeps the lyrics as you see them (*manual*), so the two stay a pair. Approve also approves the changed score, so the next run renders without stopping again.
6. Run again to render. Each further run is a new take (the take seed changes).

## One cover or a series: the mode

- **one cover, stop to review**: the two review stops above. For a transcription you have not checked this is the safe way - the lyrics follow the score's sections. A run queued this way **waits at the sheet**: in a queue of covers nothing is rendered until you approve (it was the default up to 1.1.0; now the default runs through, and Plenio warns when such a run joins a queue).

**Long rests inside a verse or chorus** (4 bars or more without singing) become an *interlude* section of their own when the cover is prepared - Song Sheet · Score shows it and Score Tools' summary names the bars. YuE2 took such a rest for the end of the section and sang the next lyrics there (a verse lost, the chorus twice); with the interlude it sings on.
- **new cover every run** (default): no stops. Every run writes a **new version** from the brief - a new title and style, and with *new lyrics* new lyrics on the same melody - and renders it; the batch count next to **Run** (App mode: *Number of runs*) makes a series with one click. The source is transcribed once and reused. With *original lyrics* the words stay the source's; with *instrumental* each version gets a new style.

The **Draft seed** (node in *4 · LYRICS*, also in App mode) is 🔒 *same seed* by default; 🎲 *new seed* lets the writer draw a new title, style and new lyrics every run even with an unchanged brief ([Seeds](../concepts/seeds.md)). The two sheets' *review* is *as the brief says*. A useful mix: review the score once (set *Song Sheet · Score* to *stop for review* and approve it), then let *new cover every run* write versions on the checked score.

Measured on an RTX 5060 Ti 16 GB for an 83-second source: transcription under 20 s, lyrics draft 30-80 s (the ASR model loads once), one take about 30-40 s, two takes 2 minutes including the checks.

## The three vocal modes

| Mode | Lyrics come from | What you check in Song Sheet · Text |
|---|---|---|
| *instrumental* | the score's section tags (`[Verse]`, `[Chorus]` ...) | nothing to write; the style has no voice or language |
| *original lyrics* | **Transcribe Lyrics** (Qwen3-ASR with Qwen3-ForcedAligner; faster-whisper for a language the aligner cannot time) on the sung parts of the source, placed into the score's sections; sentences an ASR invents in music ("Untertitelung des ZDF ...") are left out; then **Fix Misheard Words** (below) | the corrections beside the words heard, the unsure words highlighted; line breaks |
| *new lyrics* | the writer model, written against the score's sections and phrasing | the syllable check: each section needs about one syllable per melody note |

**Which lyrics are used - the order of precedence:**

1. Lyrics you made **manual** in Song Sheet · Text: always used; the ASR or the writer is not even asked (for original lyrics with a named language, the ASR does not run at all).
2. Lyrics you **edited**: used as long as the draft they were made from is unchanged. If the draft changes - for example because you renamed a section in the score - the run stops with a **conflict** instead of replacing your correction.
3. Otherwise the **draft**: ASR (original lyrics), writer (new lyrics) or the section tags (instrumental).

The same holds for the score in Song Sheet · Score: your edited or manual score is what YuE2 renders and what the lyrics are placed into.

### Recording or vocal stem

*Transcribe Lyrics* hears the source twice - the recording, and the vocal stem *Sung Pitch* separates - and keeps the hearing the ASR is more confident of (the mean probability of its words; the stem only when clearly ahead). The separation helps where the music drowns the voice, but its artefacts are misheard too: measured on 15 songs, the stem alone heard worse in 8 and better in 4; choosing the more confident hearing picked the better one in 13 and lowered the word error from 28.9 % to 27.3 %. The node's summary says which was kept. Without a separation model the recording is heard.

### Misheard words

An ASR sometimes hears a sung word as another one that sounds alike - and the cover would sing it as heard. So with *original lyrics*, **Fix Misheard Words** (in 4 · LYRICS, after *Transcribe Lyrics*) has the template's *Writer model* read the draft, with the words the ASR was unsure of marked, and name the words it is sure were misheard, each with the word most likely sung. Plenio takes a correction only when

- the writer is sure enough: 80 % for a word the ASR was unsure of, 90 % for one it heard clearly,
- the new word sounds like the one heard (their letters, and their consonants alone, compared),
- and it has as many syllables - the melody's notes stay the same.

Song Sheet · Text lists every correction beside the word heard (*Corrected as misheard: ~~doun~~ → down*); undo any of them like any other edit - your text always wins. The node's summary names the corrections and why others were not taken. Only original lyrics are checked: new lyrics, an instrumental cover, lyrics you made manual and the song templates' lyrics are never changed, and their runs ask no writer for it.

## Getting good new lyrics

YuE2 sings the melody exactly as transcribed. Two things decide whether the new words are understandable (measured in Phase 4B):

- **Syllables**: about one syllable per note in every section. Lyrics with 0.67-0.80 syllables per note were sung at a word error rate above 100 %; the source's own lyrics (0.9-1.0) were sung perfectly. The text sheet warns when a section is outside 0.85-1.3. Turn on **phrasing reference** in the Cover Brief: the writer then gets the syllable count of every source line.
- **Voice range**: the voice must fit the melody. The same lyrics sung by a "warm male baritone" on a female melody (F#4-A5) reached a word error rate of 113 %, with a "soft female vocal" 50 %. The text sheet warns; transpose the score with Score Tools (-12 / +12) or change the voice. With an empty voice in the brief, the writer chooses one that fits.

Enable **Check sung lyrics** (bypassed by default) to measure what was sung: word error rate overall and per section.

## Creative modes: how close to the original

> **Experimental.** Creative modes and the closeness sliders can give unexpected results - a chord that surprises, an instrument line that does not fit every song, a plan that is not applied. They are meant for experimenting first: try a mode, listen, change the score in the Song Sheet or run again with another *arrangement seed*, and keep what you like. *off* is the dependable choice. ▶ *Tutorial 7 · YuE2 · Cover · Creative modes* shows it.

The Cover Brief's **arrangement** is *off* by default: the transcribed score goes to the sheet as it is. With a creative mode **Arrange** lets the writer model re-arrange the score's sections within the **song flow closeness**:

| song flow closeness | what may change |
|---|---|
| 95-100 | nothing - the writer is not even asked |
| 80-94 | only sections whose instrument line rests get a line; chords, key and tempo stay |
| 50-79 (default 70) | chords recoloured, the instrument lines changed (*key change*: a lift of up to 2) |
| 20-49 | new chords and lines, another energy, the tempo by up to 10 % |
| 0-19 | only a hint of the original: harmony, lines, tempo and energy reinvented |

The **form always remains**, and an instrument line that carries the melody (an instrumental cover) is never replaced by another line. From song flow closeness 80 the melody stays as well; below it the melody follows the new chords - from 50 only its notes that clash move, below 50 it is written anew in the old rhythm. *harmony: new accompaniment* removes the source's chords first; a creative mode may then plan new ones (without chords a section keeps its line). **Song Sheet · Score** shows the arranged score and what was changed; a plan Plenio cannot use leaves the transcription as it was, with a warning. **Arrangement seed**: another arrangement of the same cover. See [Creative modes](../concepts/creative-modes.md).

**Lyrics closeness** (*new lyrics*): 0 (default) writes the new lyrics without the source's text; 1-29 keeps only a hint of it, 30-59 its theme and mood, 60-89 its story in new words, 90-100 its meaning line by line (a singable translation when the language differs). Above 0 *Transcribe Lyrics* runs on the source so the writer sees the original words - it needs clear singing.

**Original notes** (on the Cover Brief, 100 by default): how many of the source's notes the score keeps. 100 keeps every transcribed note - melody, instrument line and chords exactly as taken from the original. Lower values leave notes out, gradually down to about a quarter of them at 0: the sung melody keeps its phrase starts and its strongest notes (on the beat, long, the high and low points), and a kept note lasts through the notes left out after it, so the words keep their places; the instrument line gets rests; the chords keep the first of each section and those on strong beats, each sounding until the next. Nothing new is written - only left out - so YuE2 has more room to interpret: lower values give freer covers that stay recognisable. The summary of the score's preparation says how many notes were kept.

## Instrumental covers and vocal checks

For instrumental covers Plenio silences the Vocal voice of the score (the melody moves to an instrument, or is removed), writes only section tags, removes voice and language words from the style and renders with the **instrumental adapter** (a LoRA; bypass *Instrumental adapter* to switch it off - the optional adapter inside the collapsed model block stays bypassed in this template). See [Instrumental](../concepts/instrumental.md).

**YuE2 Takes** renders *takes* versions (seeds take seed, take seed + 1, ...). **Check Vocals** re-transcribes every take and keeps the first one without vocal notes; the preview plays all takes, best first. N takes cost N renders.

## Finishing: Master, cover art, files

- **Plenio · Master** (group *FINISH*) masters the take Check Vocals keeps before Export: a gentle warm tone match and -14 LUFS with a true peak of at most -1 dBTP. First come the **[stems](../concepts/stems.md)** when you switch *stems* on on the block (off by default; the mixer is inside the block), then, before the EQ, **[Audio HQ](../concepts/audio-hq.md)**: *HQ 1 · Stereo Cleanup* is on, *HQ 2 · Regenerate Highs* (UniverSR, 229 MB; about 1.5 s per second of music on an RTX 5060 Ti) runs with the **HQ Mastering** switch at the top of the template (**off** by default): on, *HQ 2 · Regenerate Highs* runs - it can clearly reduce AI shimmer and artifacts, but the song takes about twice as long, *HQ 3 · De-Reverb* is bypassed; their presets follow the brief's genre (*auto*). Open the block to change an HQ preset, bypass a stage, or change the EQ, the loudness target or the compression style; its *sample rate* is on the block. Details: [Mastering and audio formats](../concepts/mastering.md).
- **The title** is the source recording's with `-cover` (its title tag, else its file name: `Morning Song-cover`), so every cover is easy to match with its source - the files and the release record are named after it. Type a **title** in the Cover Brief (advanced) for another one.
- **Export Release** writes the mastered song, the unmastered take as `(original).flac`, the release record and the **sheet music** as `<name>.pdf` - the final score with the lyrics under the notes, on A4 (*sheet music* on the node: A4, Letter or off; *sheet music size*: standard about 3 bars a line, smaller, compact or large; an open ComfyUI page draws it right after the export, whichever workflow it shows). Formats (FLAC, MP3, WAV) and tags are set on the node.
- **Cover Art** (on) paints a cover from the sheet's *artwork prompt* with FLUX.2 Klein 4B (4 steps, 1024 x 1024; about 16 GB of model files, Apache-2.0). The **Cover Art** card in *HQ Mastering & Cover Art* at the top switches it off (its three nodes are then bypassed, no image model loads). Export embeds the cover in the FLAC and MP3 files and saves it next to the song as `.jpg`. In *new cover every run* the cover seed is 🎲; with *one cover, stop to review* it is 🔒, so new takes keep the cover.

## App mode

Switch **Graph / App** at the top left for a simple form: the source file, the mode, the cover style, *vocals* with the options of an original-lyrics cover (language, voice), *harmony*, the creative mode with *song flow closeness* and *lyrics closeness*, *original notes*, the writer model, the take, draft and arrangement seeds and the buttons **Song Sheet · Score** and **Song Sheet · Text** - the two review stops work in the app, the editor opens from the buttons. The options of *instrumental* and *new lyrics* (melody, lead instrument, theme) are set in the graph. See [App mode](../concepts/app-mode.md).

## Limits

- The original-lyrics ASR is a draft. It can mishear words, merge lines, and invent short phrases at the end of a passage; Plenio removes the typical inventions and shows unsure words, but read the lyrics before approving.
- A take can end while the music still plays; Check Vocals reports it (Master does not fade out yet).
- The Song Sheet editor's section table shows the source's times; playing a section is not built in yet.

## Licence

YuE2, SheetSage2 (Comfy-Org repackaging) and the instrumental adapter are **CC BY-NC 4.0 (non-commercial)**. Qwen3-ASR and its aligner are Apache-2.0, faster-whisper and the Whisper weights MIT. The release record lists the licences. Covering a song also touches the rights in the original composition and lyrics - see [Licensing](../licensing.md).
