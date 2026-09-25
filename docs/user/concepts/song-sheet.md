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

## Two sheets per path

The score is made from the text (Song path: YuE2 plans from the lyrics) or the text is made against the score (Cover path: lyrics are placed into the score's sections). So each path has two sheets:

- **Song Sheet · Text** owns title, style, lyrics and artwork prompt;
- **Song Sheet · Score** owns the score.

Each shows the other's documents as read-only context and checks against them: in covers the lyrics must have the score's sections, about one syllable per melody note, and a voice that fits the melody's range.

## Review

*review* = **stop for review** stops the run after the sheet until you **Approve** in the editor. The approval is bound to exactly the documents you saw (a fingerprint); if anything changes, the sheet waits again. The Cover template stops at both sheets by default.

## The editor

**Edit Song Sheet…** opens the editor with the draft, your text, the state badges and the findings of the engine's rules (updated while you type). It also shows:

- **Changes against the draft**, word by word;
- for ASR lyrics, the **unsure words** and what the ASR **left out** as not sung;
- with a timeline connected (covers), the **sections of the source** with start and end times;
- the exact **token budget** of YuE2 and the render ceiling of a score.

A sheet that owns a score has a **Score** tab: notation and ABC text of the same score, note-by-note editing, sections, playback and - with **reference_audio** connected - A/B against the source recording. See [Score editor](score-editor.md).

**Apply** stores your documents in the node (and so in the workflow); **Revert** discards the changes made since the editor opened; closing with unapplied changes asks first.

The editor never decides musical validity itself: it asks the same backend functions the node uses.
