# Score editor

The **Score** tab of the Song Sheet editor (*Edit Song Sheet…* on a sheet that owns a score) shows the score as notation and as ABC text, lets you correct it note by note, and plays it - against the source recording in covers. Everything you change is a change of **one text**: the native two-voice ABC that YuE2 reads. The notation, the note list, the sections and the playback are always computed by the backend from exactly that text; the editor keeps no second copy that could drift.

Typical uses:

- fix a wrong note of a SheetSage2 transcription (a cover) or of a YuE2 plan (a song);
- move a section boundary one bar, rename a section - the lyrics of a cover follow the score's sections;
- remove or replace a chord symbol, change the tempo, transpose.

## Layout

| Part | What it does |
|---|---|
| **Palette** (top) | undo/redo; pitch −8va, −1, +1, +8va; shorter / longer; rest / note; chord symbol set / remove; *Whole score*: transpose, tempo, remove chords, let the instrument play the melody, silence the Vocal voice |
| **View** | *notation and ABC text*, *notation* or *ABC text*; notation zoom |
| **Navigator** | the sections (go to, rename, start one bar earlier / later, join to the one before, new section at the selected bar) and a bar strip (sections in colour, bars with errors marked) |
| **Notation** | click a note or rest to select it, Shift+click to add to the selection |
| **ABC text** | the canonical text with line numbers; errors are underlined at their bar; the cursor selects the note under it |
| **Transport** | play from the selected bar, loop the section, voices (Vocal, Ins, chords), speed; with a source connected: play the source from the same bar and **A/B** |
| **Status line** | what is selected (voice, bar, pitch, length, chord) and what the last edit did |
| **Diagnostics** | the backend's findings, each with a link to its bar |

## Editing notes

Select a note, then use the palette or the keyboard:

| Key | Action |
|---|---|
| ← / → | previous / next note or rest of the voice |
| Alt+↑ / Alt+↓ | the other voice at the same time |
| ↑ / ↓ | one semitone up / down (a tied note moves as a whole) |
| Shift+↑ / Shift+↓ | one octave up / down |
| `[` / `]` | shorter / longer |
| R or Delete | turn into a rest |
| N | turn a rest into a note (the pitch of the nearest note) |
| Space | play / stop |
| Ctrl+Z, Ctrl+Y (Ctrl+Shift+Z) | undo, redo |
| Esc | clear the selection |

Rules the editor keeps for you:

- **Bars stay exactly full.** *Longer* only grows into the rests after the note; *shorter* fills the freed time with a rest. An edit that would overfill a bar or cross a chord symbol is refused with the reason and a hint (for example: "Only 2 units of rest follow the note in bar 12 - turn the following note into a rest first").
- **Only the edited bars change.** Every other character of the text stays exactly as it was. An edited bar is rewritten in the native spelling: accidentals only where the key and the bar need them. Native accidentals apply to the letter in every octave until the bar line, so raising one `F` can add a `=` to a later `f` in the same bar - that keeps the other notes where they were.
- **Ties** are one note: a pitch change moves every tied part; shortening a tied note removes the tie (a warning says so).
- **Chord symbols** belong to the Vocal voice and start at a Vocal note or rest; selecting a note of the Ins voice puts the chord at the Vocal onset at the same time.
- Every result is checked against the upstream YuE2 parser before it replaces the text. The editor never decides musical validity itself.

## Editing the text

Type in the ABC view like in any code editor. The analysis follows after a short pause. While the text is invalid, the notation shows the **last valid score** with the note *"The text has errors - the notation shows the last valid score"*, the bar with the error is underlined and marked in the bar strip, and the diagnostic links to it. Palette operations work only on a valid text.

One undo history covers both kinds of edits: a burst of typing is one step, each palette operation is one step (its tooltip names the step), and a document replaced by the dialog (for example *use the new draft* after a conflict) is one step too.

## Sections

Section names are the `% name` comment lines in the score. They matter: YuE2 sings the lyrics section by section, and in covers the lyrics draft is placed into the score's sections. Changing sections in the Score sheet therefore changes the cover's lyrics draft - and a lyrics document you edited before is then **not replaced silently**: the next run stops with a conflict in the text sheet (see [Song Sheet](song-sheet.md)).

Names are stored in lower case and use letters, digits, spaces and hyphens (up to 30 characters), for example `verse`, `pre-chorus`, `chorus 2`, `outro`.

## Playback and A/B

**Play** plays simple tones of the notes from the selected bar, with a cursor in the notation - a guide to the notes, not a preview of what YuE2 will render. It works offline: no soundfont is downloaded. Choose the voices, the speed (the score's tempo is not changed) and *loop section*.

With **reference_audio** connected to the Song Sheet (the Cover template connects the source), **Source** plays the recording from the same bar, and **A/B** switches between the notes and the recording at the current bar. The bar times come from the transcription's beat grid, so the recording and the notes line up even where the source's tempo drifts. The reference is only for listening; it is not part of the sheet's documents.

## Apply, Revert, Approve

- **Apply** saves your documents into the node (they are stored in the workflow, so they survive saving and reloading it). An applied score is *edited* while its draft is unchanged, or *manual* if you made it manual.
- **Revert** discards every change made since the editor opened.
- **Approve** (with *review* = *stop for review*) releases exactly the documents you see for the next run.
- Closing with unapplied changes asks whether to apply, discard or keep editing.

## Preferences

Layout, zoom, voices and speed are remembered in this browser only (not in the workflow). A blocked or cleared browser storage simply gives the defaults.

## Limits

- Very long scores (several minutes of YuE2 plan) render as one page; scrolling is fine, but paging is not built yet.
- The editor edits notes, rests, lengths, chord symbols and sections. Meter and key changes, and adding or removing bars, are done in the ABC text.
