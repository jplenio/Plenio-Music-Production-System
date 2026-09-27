# Score editor

The **Score** tab of the Song Sheet editor (*Edit Song Sheet…* on a sheet that owns a score) shows the score as a piano roll, as notation and as ABC text, lets you correct it note by note - by dragging notes in the roll or with the palette - and plays it, against the source recording in covers. Everything you change is a change of **one text**: the native two-voice ABC that YuE2 reads. The notation, the note list, the sections and the playback are always computed by the backend from exactly that text; the editor keeps no second copy that could drift.

Typical uses:

- fix a wrong note of a SheetSage2 transcription (a cover) or of a YuE2 plan (a song);
- move a section boundary one bar, rename a section - the lyrics of a cover follow the score's sections;
- remove or replace a chord symbol, change the tempo, transpose.

## Layout

| Part | What it does |
|---|---|
| **Palette** (top) | undo/redo; pitch −8va, −1, +1, +8va; shorter / longer; rest / note; chord symbol set / remove; *Whole score*: transpose, tempo, remove chords, let the instrument play the melody, silence the Vocal voice |
| **View** | *notation and ABC text*, *notation* or *ABC text*; *piano roll* on/off; notation zoom |
| **Piano roll** | both voices over time (Vocal blue, Ins orange) with a chord lane and the bars and sections above; draw, move, resize and delete notes and chord symbols with the mouse (see below) |
| **Navigator** | the sections (go to, rename, start one bar earlier / later, join to the one before, new section at the selected bar) and a bar strip (sections in colour, bars with errors marked) |
| **Notation** | click a note or rest to select it, Shift+click to add to the selection |
| **ABC text** | the canonical text with line numbers; errors are underlined at their bar; the cursor selects the note under it |
| **Transport** | play from the selected bar, loop the section, voices (Vocal, Ins, chords), speed; with a source connected: play the source from the same bar and **A/B** |
| **Status line** | what is selected (voice, bar, pitch, length, chord) and what the last edit did |
| **Diagnostics** | the backend's findings, each with a link to its bar |

## The piano roll

The roll shows every sounding note of both voices as a bar: its left edge is where the note starts, its length is how long it sounds (tied notes are one bar), its height is its pitch (the rows are the semitones, C rows are marked and labelled). Above the notes are the **chord lane** and the bar numbers with the section names.

| Gesture | Result |
|---|---|
| click a note | select it (Shift/Ctrl+click adds to the selection); the notation and the ABC text select it too |
| drag a note | move it in time and pitch (all selected notes together); where it lands it replaces what its voice played there, and the place it left becomes a rest |
| drag the right end of a note | make it longer or shorter; longer only grows into rests - hold **Alt** to play over the following note (it is shortened or removed) |
| drag on an empty place | draw a new note into the voice chosen under *draw into* (Vocal or Ins) |
| double-click an empty place | a new note of one beat |
| click an empty place / Esc | clear the selection |
| drag a chord symbol | move it; a chord already at that place is replaced |
| double-click the chord lane | type a new chord symbol (Enter adds it, Esc cancels); double-click a chord to rename it, an empty name removes it |

While you drag, a dashed **ghost** shows the result; nothing changes before you let go. Then the backend checks the edit and writes the text; if it refuses (for example a note that cannot grow because another note follows), the ghost disappears and the reason is shown.

Keys with the roll focused: ↑/↓ semitone (Shift: octave), ←/→ move by the grid (Shift: a beat), Alt+←/→ shorter/longer, **Delete** turns the selected notes into rests (and removes selected chord symbols), **Shift+Delete** deletes and lets the note before take the time (*close the gap*). **snap** sets the grid (*auto* is the score's finest length); **−/+** zoom. Only the visible part of a long score is drawn.

Deleting a note never shortens a bar: the note's time becomes a rest. *Close the gap* only happens with Shift+Delete, and only when a note of the same voice ends exactly where the deleted one started - otherwise the time stays a rest and the status line says why.

## Editing notes with the palette and the keyboard

Select a note, then use the palette or the keyboard (in the notation):

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

Type in the ABC view like in any code editor. The analysis follows after a short pause. While the text is invalid, the notation and the piano roll show the **last valid score** (dimmed) with the note *"The text has errors - the notation shows the last valid score"*, the bar with the error is underlined and marked in the bar strip, and the diagnostic links to it. Palette operations and roll gestures work only on a valid text, and **Apply** and **Approve** are off (their tooltip says why): an invalid text never replaces the score in the node. **Revert to last valid** puts the last valid text back (one undo step).

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

Layout, zoom, piano roll (on/off and its zoom), voices and speed are remembered in this browser only (not in the workflow). A blocked or cleared browser storage simply gives the defaults.

## Limits

- Very long scores (several minutes of YuE2 plan) render as one page; scrolling is fine, but paging is not built yet.
- The editor edits notes, rests, lengths, chord symbols and sections. Meter and key changes, and adding or removing bars, are done in the ABC text for now (the operations exist; their buttons come with the inspector).
- A score that YuE2 accepts but whose bars are not a whole number of the score's shortest length (`L:`) cannot be shown in the piano roll; it is edited as text (the roll says so).
