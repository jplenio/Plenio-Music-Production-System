# Song Sheet

The Song Sheet is the one place that decides which documents condition the music model: **title, style, lyrics, score and artwork prompt**. What leaves the sheet reaches the model unchanged, and the release record stores exactly these texts with their hashes. Every model output upstream of a sheet - the writer's draft, YuE2's plan, SheetSage2's transcription, the lyrics ASR - is only a *draft*.

## Document states

| State | Which text is used | When the draft changes |
|---|---|---|
| **auto** | the newest draft | the new draft is used |
| **edited** | your edit | the run **stops with a conflict**: keep your edit (it becomes manual), take the new draft, or merge by hand |
| **manual** | your text | nothing happens - the draft is not even computed |

This is the precedence everywhere in Plenio: **manual > edited (while its draft is unchanged) > draft**. No model output ever replaces your text silently.

A draft that is not needed is not computed: with manual lyrics in a cover, Transcribe Lyrics does not run (unless another node still needs its language), and with a manual score SheetSage2 is not asked for a score.

**Your own lyrics.** In the Lyrics tab, **Use my own lyrics** switches the document to *manual* in one click - the writer is not consulted any more, the text is yours, and the node's summary says so (`lyrics: yours (manual)`). Section tags (`[Verse]`, `[Chorus]`, …) can be inserted under the editor; see [Brief templates](brief-templates.md). In *new song every run*, a manual lyrics document is used for every song of the series (new titles and styles, the same words).

## Two sheets per path

The score is made from the text (Song path: YuE2 plans from the lyrics) or the text is made against the score (Cover path: lyrics are placed into the score's sections). So each path has two sheets:

- **Song Sheet · Text** owns title, style, lyrics and artwork prompt;
- **Song Sheet · Score** owns the score.

Each shows the other's documents as context and checks against them: in covers the lyrics must have the score's sections, about one syllable per melody note, and a voice that fits the melody's range.

The context is read-only, with two exceptions where the editor writes back into the sheet that owns the document:

- **A cover's text sheet edits the score it shows.** Apply writes the score into *Song Sheet · Score* (as an edit of the transcription) and keeps this sheet's lyrics as shown (*manual*), so score and lyrics stay a pair. With **Approve** the changed score is approved in *Song Sheet · Score* too; with Apply that sheet asks for approval on the next run.
- **A score sheet arranges the lyrics of *Song Sheet · Text*** (templates *1 · YuE2 · Song* and *5 · YuE2 · DAW*; see [Score editor](score-editor.md#what-follows-an-arrangement)).

Neither happens when the other sheet's document changed after the last run: then the editor says so, and the context stays read-only until the next run.

## Review

| *review* | The sheet stops for approval |
|---|---|
| **as the brief says** (default) | when the brief's **mode** is *one song, stop to review* or *one cover, stop to review*; not in *new song every run* / *new cover every run*; not without a brief |
| **stop for review** | always |
| **continue** | never |

A stopped run waits after the sheet until you **Approve** in the editor. The approval is bound to exactly the documents you saw (a fingerprint); if anything changes, the sheet waits again. The templates set every sheet to *as the brief says*, so the mode in the brief decides for the whole path: the song templates start with *new song every run* (no stops), the cover template with *one cover, stop to review* (both sheets stop). *Song Sheet · DAW* always stops: its score is composed there.

### Every combination

| Brief mode | Sheet *review* | What the runs do |
|---|---|---|
| *one song, stop to review* | *as the brief says* or *stop for review* | the first run stops at the sheet; after *Approve* the next run goes on; every later run is a **new take of the same song** (text and score stay) |
| *one song, stop to review* | *continue* | this sheet never stops; the song stays, every run is a new take |
| *new song every run* | *as the brief says* or *continue* | every run writes and renders a **new song** (its own draft and plan seeds), without stopping |
| *new song every run* | *stop for review* | every **new song stops** at this sheet. Run again without approving: the same song waits again (no new one is written). *Approve* and run: **that song is rendered**. The run after it writes the next song, which stops again - unless its documents are exactly the ones you approved (a cover series on a checked score goes on) |

With two sheets on *stop for review* in a series, each new song stops at both in turn (text, then score) before it is rendered.

### Where the run stands

The canvas shows it on the nodes, the sheet's button line says it in words (also in App mode):

| Before a run | After a run |
|---|---|
| **⏸ review stop** (blue badge above the sheet; *stops here for review* under its button) - the sheet will hold the run | **⏸ waiting for your approval** (amber badge and an amber frame around the sheet, a message) - the run stopped here: *Edit Song Sheet…*, check, *Approve*, run again |
| *runs through, no review stop* - the run passes this sheet | **✓ approved** - you approved exactly these documents; ✓ *passed*, ⚠ *warnings* or ✖ *fix the sheet* (red frame) for a sheet that does not stop |

Every other Plenio node shows its result the same way (✓, ⚠ warning, ✖ error with a red frame). A new run clears the badges first, so they show how far the current run got - a node after the stop has none. The frame stays visible when you zoom out.

**Edits in a series:** in the mode *new song every run* an edit belongs to its song. A song that waits for review keeps your edit until it is rendered; the next song takes its own new draft (the sheet notes *your edit was for an earlier song*) instead of stopping with a conflict. Use *manual* for a text the whole series should keep - *Use my own lyrics*, for example. Outside a series an edit whose draft changed still stops the run with a conflict, so nothing of yours is replaced unseen.

## The editor

**Edit Song Sheet…** (on the node, and in App mode on the sheet's button) opens the editor with the draft, your text, the state badges and the findings of the engine's rules (updated while you type). It also shows:

- **Changes against the draft**, word by word;
- for ASR lyrics, the **unsure words** and what the ASR **left out** as not sung;
- with a timeline connected (covers), the **sections of the source** with start and end times;
- the exact **token budget** of YuE2 and the render ceiling of a score.

A sheet that owns a score has a **Score** tab: notation and ABC text of the same score, note-by-note editing, sections, playback and - with **reference_audio** connected - A/B against the source recording. See [Score editor](score-editor.md).

**Apply** stores your documents in the node (and so in the workflow); **Revert** discards the changes made since the editor opened; closing with unapplied changes asks first.

The editor never decides musical validity itself: it asks the same backend functions the node uses.
