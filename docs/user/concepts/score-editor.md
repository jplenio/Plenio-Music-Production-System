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
| **View** | the layout *Review* or *Text* (see below); in *Review*: *piano roll* and *ABC text (advanced)* on/off; notation zoom; *Export MIDI* and *Import MIDI…* (see below) |
| **Piano roll** | both voices over time (Vocal blue, Ins orange) with a chord lane and the bars and sections above; draw, move, resize and delete notes and chord symbols with the mouse (see below) |
| **Inspector** (right, *Review*) | the selected note(s), chord symbol and bar as fields: voice, pitch, start, length, chord; insert, duplicate or delete bars, meter, key (see below) |
| **Navigator** | the sections (go to, rename, start one bar earlier / later, join to the one before, new section at the selected bar) and a bar strip (sections in colour, bars with errors marked); in *Review* with the song's lyrics: *Lyrics fit* (the lyrics next to the score's sections) |
| **Notation** | click a note or rest to select it, Shift+click to add to the selection |
| **ABC text** | the canonical text with line numbers; errors are underlined at their bar; the cursor selects the note under it |
| **Transport** | play from the selected bar, loop the section, metronome, voices (Vocal, Ins, chords), speed; with a source connected: play the source from the same bar and **A/B** |
| **Status line** | what is selected (voice, bar, pitch, length, chord) and what the last edit did |
| **Diagnostics** | the backend's findings, each with a link to its bar |

## Layouts

| Layout | Shows | For |
|---|---|---|
| **Review** | piano roll, notation and inspector, the navigator on the left; the ABC text only with *ABC text (advanced)* | correcting a score graphically - no ABC knowledge needed |
| **Text** | the ABC text (large, with its diagnostics) and the notation | editing the text directly |

A Song Sheet node can choose the layout its editor opens in with the node property `plenio_editor_layout` (`review` or `text`; the templates set it where it matters). Without it the editor opens in the layout you used last in this browser.

## The window and the panes

The editor window is yours to size (since 0.3.0):

| Control | What it does |
|---|---|
| **⛶ / ❐** in the header (or a double-click on the header) | fills the browser window / returns to the size before |
| the **corner grip** (bottom right) | drag it to resize the window; it never gets smaller than 640 × 420 and never larger than the browser window |
| the **grip under the piano roll** | drag it (or use ↑/↓ on it) to give the roll more or less height - a big roll for drawing, a small one to keep the notation in view |
| the **grip under the notation** (with *ABC text (advanced)*) | drag it (or ↑/↓) to share the column between the notation and the ABC text |
| the **grip right of the navigator** | drag it (or ←/→) to widen the navigator, the track panel and *Lyrics fit* |

The window size and the pane sizes are remembered in this browser (they are viewer preferences, never part of the workflow). The lyrics and ABC text fields keep their own resize grip too.

## The inspector

The inspector shows what is selected - in the piano roll, the notation, the chord lane or the bar strip - and each field changes it with one checked edit (Enter or leaving the field commits it):

| Selection | Fields |
|---|---|
| one note | **voice** (Vocal / Ins: moves the note to the other voice), **pitch** (e.g. `C#5`, `Bb3` or a MIDI number; −8va −1 +1 +8va), **start** (bar and units from the start of the bar; the header says the beat), **length** (units, or a note value; with *longer: over the next note* it may play over the following notes), **chord** where the note starts (empty removes it), *→ rest*, *close gap* |
| several notes | voice, pitch steps, *→ rest*, *close gap* |
| a chord symbol | name (empty removes it), start, *remove* |
| the bar of the selection | *+ before*, *+ after* (an empty bar), *duplicate* (a copy after it), *delete* (in both voices), **meter** (only for an empty bar - music is never re-barred), **key** from this bar on (pitches stay; notes are re-spelled), *remove change* |

Bar rules: an inserted bar joins the line of the bar before it; a line longer than four bars is split. Deleting bars keeps the key that was in effect after them, and a section that started inside moves to the cut. Duplicating a whole section gives two sections of that name; duplicating part of a section makes the section longer.

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

## MIDI files

A score goes in and out as a standard MIDI file, so a sketch from any DAW can become the score - and the score can go back to a DAW.

| Button | What it does |
|---|---|
| **Export MIDI** | Downloads the score as a type-1 MIDI file named after the song's title. Tracks: *Vocal*, *Instrument*, *Chords* (block voicings plus `plenio:chord` text events) and the *Guide* track; tempo, time and key signatures and the section markers sit in the conductor track. Off while the text is invalid - the same gate as Apply. |
| **Import MIDI…** | Reads a `.mid`/`.midi` file and shows what the import found **before** anything is replaced: the file's tracks with a role each, the grid, whether to read chords from the notes, and the import report. *Insert* replaces the score **and its Guide notes** - one undo step for both (the diagnostics of the imported text come with it); the sheet's old Guide notes belong to the replaced score and go with it, which the dialog says before you insert. |

Roles: *Vocal* and *Instrument* become the two YuE2 voices (one voice each - where notes overlap, the highest sounds, and the report says how many were shortened, split or dropped); *Chords* becomes chord symbols; *Guide* is kept for playback and MIDI only and is **never sent to YuE2**; *do not import* leaves a track out. A Plenio file carries the unit and the bar layout in a text event, so it comes back exactly as it was.

Foreign files are read deterministically and reported: note starts and ends are quantised to the grid (1/16, or the score's own length), only the first tempo is used, later time signatures take effect at bar starts, markers become sections - every lossy step is listed. *Read chords from the notes* matches the notes of a *Chords* track against the supported chord symbols (best effort: what fits nothing is counted, not guessed); written `plenio:chord` events always win.

## Sections

Section names are the `% name` comment lines in the score. They matter: YuE2 sings the lyrics section by section, and in covers the lyrics draft is placed into the score's sections. Changing sections in the Score sheet therefore changes the cover's lyrics draft - and a lyrics document you edited before is then **not replaced silently**: the next run stops with a conflict in the text sheet (see [Song Sheet](song-sheet.md)).

Names are stored in lower case and use letters, digits, spaces and hyphens (up to 30 characters), for example `verse`, `pre-chorus`, `chorus 2`, `outro`.

## Playback and A/B

**Play** plays simple tones of the notes from the selected bar, with a cursor in the notation and the piano roll - a guide to the notes, not a preview of what YuE2 will render. It works offline: no soundfont is downloaded. Choose the voices, the speed (the score's tempo is not changed), *loop section* and the *metronome* (a click on every beat, higher on the first beat of a bar).

With **reference_audio** connected to the Song Sheet (the Cover template connects the source), **Source** plays the recording from the same bar, and **A/B** switches between the notes and the recording at the current bar. The bar times come from the transcription's beat grid, so the recording and the notes line up even where the source's tempo drifts. The reference is only for listening; it is not part of the sheet's documents.

## Apply, Revert, Approve

- **Apply** saves your documents into the node (they are stored in the workflow, so they survive saving and reloading it). An applied score is *edited* while its draft is unchanged, or *manual* if you made it manual.
- **Revert** discards every change made since the editor opened.
- **Approve** (with *review* = *stop for review*) releases exactly the documents you see for the next run.
- Closing with unapplied changes asks whether to apply, discard or keep editing.

## Preferences

Layout, *ABC text (advanced)*, zoom, piano roll (on/off and its zoom), metronome, voices and speed are remembered in this browser only (not in the workflow). A blocked or cleared browser storage simply gives the defaults.

## Limits

- Very long scores (several minutes of YuE2 plan) render as one page; scrolling is fine, but paging is not built yet.
- The editor edits notes, rests, lengths, chord symbols, sections, bars, meters (of empty bars) and keys. Tempo and transposition are in the palette's *Whole score*.
- A score that YuE2 accepts but whose bars are not a whole number of the score's shortest length (`L:`) cannot be shown in the piano roll; it is edited as text (the roll says so).
