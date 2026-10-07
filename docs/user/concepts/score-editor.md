# Score editor

The **Score** tab of the Song Sheet editor (*Edit Song Sheet…* on a sheet that owns a score) shows the score as a piano roll, as notation and as ABC text, lets you correct it note by note - by dragging notes in the roll or with the palette - and plays it, against the source recording in covers. Everything you change is a change of **one text**: the native two-voice ABC that YuE2 reads. The notation, the note list, the sections and the playback are always computed by the backend from exactly that text; the editor keeps no second copy that could drift.

Typical uses:

- fix a wrong note of a SheetSage2 transcription (a cover) or of a YuE2 plan (a song);
- move a section boundary one bar, rename a section - the lyrics of a cover follow the score's sections;
- remove or replace a chord symbol, change the tempo, transpose.

## Layout

| Part | What it does |
|---|---|
| **Palette** (top) | undo/redo; pitch −8va, −1, +1, +8va (the selected notes and chord symbols); shorter / longer; rest / note; chord symbol set / remove; *Whole score*: transpose, tempo, remove chords, let the instrument play the melody, silence the Vocal voice |
| **View** | the layout *Review* or *Text* (see below); in *Review*: *piano roll* and *ABC text (advanced)* on/off; notation zoom; the files: *Export MIDI*, *Export MusicXML*, *Save project*, *Import MIDI…*, *Open project…* (see [Files](#files-midi-musicxml-and-the-project)) |
| **Piano roll** | both voices over time (Vocal blue, Ins orange) with a chord lane and the bars and sections above; with lyrics a **lyrics lane** (the words over the phrases they are sung on - edit them there, and select, move, lengthen, delete, copy and paste lines like notes); the **cursor** (click in the bar numbers); draw, move, resize and delete notes and chord symbols with the mouse (see below) |
| **Inspector** (right, *Review*) | the selected note(s), chord symbol and bar as fields: voice, pitch, start, length, chord; insert, duplicate or delete bars, meter, key (see below) |
| **Navigator** | the sections: select one or more and **duplicate, copy, move or delete** them (also by dragging - see [Arranging sections](#arranging-sections)); go to, rename, start one bar earlier / later, join to the one before, new section at the selected bar; the **bar strip** (sections in colour, bars with errors marked): select one or more bars and **duplicate, copy, move or delete** them (see [Arranging bars](#arranging-bars)); in *Review* with the song's lyrics: *Lyrics fit* (the lyrics next to the score's sections) |
| **Notation** | click a note or rest to select it, Shift+click to add to the selection; the lyrics stand under the Vocal notes (read-only) |
| **ABC text** | the canonical text with line numbers; errors are underlined at their bar; the cursor selects the note under it |
| **Transport** (between the roll and the notation) | play from the cursor (a click in the ruler while it plays jumps there), loop the selection's bars or the cursor's section, metronome, voices (Vocal, Ins, chords), speed; with a source connected (covers): **hear** the notes and the source recording together, or one of them (**A/B**), and the source's level |
| **⌨ keys** (view tools) | every key and mouse gesture of the editor at a glance |
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

The bar numbers are the **ruler**, as in Cubase: click in it (or drag along it) to put the **cursor** there - a white line through the roll with a marker in the ruler, on the grid of *snap*. Playback starts at the cursor (Space); while it plays, a green line follows the music and the roll pages along. On stop the green line disappears and the cursor stays where it was. Clicking a section or a bar in the navigator puts the cursor at the bar's start; **Home** / **End** put it at the start / end of the score. The transport shows where the cursor is as *bar.beat.sixteenth* (Cubase's position display, e.g. `5.2.1`). Without the roll (layout *Text*, or the roll switched off) the cursor follows the selected bar.

Two modes, switched in the roll's toolbar, decide what a drag on an **empty place** does. The roll always opens in **✎ Draw**; the mode is not remembered.

- **✎ Draw** - a click on an empty place inserts a note of the last drawn length (a beat at first; while notes are selected, the click only lets them go), a drag draws one, **Shift+drag** pulls a selection frame.
- **⬚ Select** - a drag on an empty place pulls a dashed **frame**: every note it touches is selected when you let go (the roll shows them while you pull). Hold **Shift** to add the framed notes to the selection. The frame selects notes of both voices; when it reaches into the **chord lane** (or starts there) it takes the chord symbols it passes too. The notation and the ABC text show the same selection, so you can see there which notes you caught. Select mode never draws a note.

Clicking, moving and resizing notes, and all keys, work the same in both modes. So you can frame a phrase in *Select*, then drag one of its notes to move the whole phrase, or press ↑ to transpose it.

| Gesture | Result |
|---|---|
| click or drag in the ruler (bar numbers) | set the cursor; the selection stays |
| click a note | select it (Shift/Ctrl+click adds to the selection); the notation and the ABC text select it too |
| drag a note | move it in time and pitch (all selected notes together; you hear the new pitch); where it lands it replaces what its voice played there, and the place it left becomes a rest |
| **Alt**+drag a note | copy it (all selected notes) to where you drop it; the originals stay |
| drag the right end of a note | make it longer or shorter; longer grows into the rests after it and **stops at the next note** of its voice - hold **Alt** to play over it (it is shortened or removed) |
| click an empty place (**Draw**) | a new note of the last drawn length into the voice chosen under *draw into* (with notes selected: only lets them go) |
| drag on an empty place (**Draw**) | draw a new note of that length |
| double-click an empty place (**Draw**) | a new note of one beat |
| Shift+drag on an empty place (**Draw**) | a frame, as in Select mode |
| click a key of the keyboard (left) | hear its pitch |
| Ctrl+wheel, **G** / **H** | zoom along the bars (around the pointer / the cursor); never the browser page |
| Alt+wheel, **Shift+G** / **Shift+H** | zoom the rows (taller or lower key rows) |
| **Q** / **Shift+Q** | quantize: the selected notes' starts on the grid of *snap* (all notes when none is selected) / their lengths too; where a note lands it replaces what its voice played there |
| drag on an empty place (**Select**) | a frame: select every note it touches (Shift: add them to the selection) |
| Ctrl+A | select all notes of both voices and all chord symbols |
| click an empty place / Esc | clear the selection (Esc during a frame cancels the frame; in the score, Esc never closes the editor) |
| drag a chord symbol | move it; a chord already at that place is replaced |
| double-click the chord lane | type a new chord symbol (Enter adds it, Esc cancels); double-click a chord to rename it, an empty name removes it |

While you drag, a dashed **ghost** shows the result; nothing changes before you let go. Then the backend checks the edit and writes the text; if it refuses (for example a note that cannot grow because another note follows), the ghost disappears and the reason is shown.

Keys with the roll focused: ↑/↓ semitone (Shift: octave) - selected **chord symbols** move too, one or many, spelled for the key where they stand (an octave leaves them as they are), ←/→ move by the grid (Shift: a beat), Alt+←/→ shorter/longer, **Delete** turns the selected notes into rests (and removes selected chord symbols), **Shift+Delete** deletes and lets the note before take the time (*close the gap*). **snap** sets the grid (*auto* is the score's finest length) - also for **Q** (quantize); **−/+**, **G / H** and Ctrl+wheel zoom along the bars, **↕−/↕+**, **Shift+G / H** and Alt+wheel zoom the rows. With *follow* switched off the roll stays where you look while it plays. A note wide enough shows its pitch (`E5`), and a drawn, grabbed or moved note is heard (switch it off with *hear* in the roll's toolbar). Only the visible part of a long score is drawn.

The roll covers the whole piano range (A0 to C8, more for a note beyond it) and **scrolls both ways**: the mouse wheel moves through the pitches, Shift+wheel (or the scrollbar) through the bars. It opens centred on the score's notes; the pitch names stay on the left and the bar numbers, sections and the chord lane stay on top while you scroll, and a note you select - or the note that plays - is scrolled into view. Dragging a note to the top or bottom edge scrolls along, so a note can be moved or drawn anywhere in the range.

### Lyrics where they are sung

When the song has lyrics, the roll shows a **lyrics lane** under the chord lane. Each line stands over the Vocal phrase it is sung on, and each syllable stands small over its note (`beau-` `ti-` `ful`). The notation shows the same syllables under the Vocal notes; there they are read-only.

**Double-click a line** in the lane to edit it there (Enter keeps it, Esc cancels, an empty line is removed). A double-click over a phrase without words adds a line for it. Each edit is one undo step. Where the edited lyrics go:

| Sheet | The lyrics come from | An edit goes |
|---|---|---|
| score sheet of *1 · YuE2 · Song*, *5 · YuE2 · DAW* | *Song Sheet · Text* | into that sheet on **Apply** (the side column says so; *Revert the lyrics* goes back) - that sheet then asks for approval again |
| text sheet of *2 · YuE2 · Cover* (the score is the other sheet's, read-only) | this sheet | straight into its **Lyrics** tab |

**Place lines by hand**, like notes:

| Action | Mouse | Keys (after a click on a line) |
|---|---|---|
| select | click a line; **Ctrl+click** or **Shift+click** adds or removes one; a click on a note or the empty lane lets them go | Esc: none |
| move | drag the selected lines (on the grid of *snap*) | ← / →: one grid step |
| longer / shorter | drag a line's **end** (the light edge) or its **start** | |
| delete | | Del (the words go too) |
| copy, cut, duplicate | the roll's **Copy** / **Cut** buttons | Ctrl+C, Ctrl+X, Ctrl+D (right after the last selected line) |
| paste | set the cursor in the ruler, then the roll's **Paste** button | Ctrl+V: into the section at the cursor, from the cursor on |

A section with a line placed by hand is placed by hand as a whole: every line keeps the span it has (the box), and its syllables take the notes that start inside that span. What you moved or pasted stands exactly where you put it; a line it covers in part starts after it, a line it covers whole moves behind it with its length. A line moved past another is sung after it - the lyrics text changes its order too. Lines stay inside their section. The spans are kept with the sheet (like the Guide notes), move with the bars when sections or bars are arranged, go into the project file and the MusicXML export, and every edit is one undo step. A section without lines placed by hand is placed by the rule below.

How the words are placed is the lyrics writer's own rule. A block of the lyrics belongs to a section of the score, in order (by tag when the numbers differ). The section's Vocal notes form **phrases**, split at rests of a beat or more, and each line takes a phrase. Each syllable takes a note: a short line holds its last syllable over the rest of the phrase (a melisma), and a long one puts the rest on its last note.

This is a picture of where the words fall. YuE2 itself sings the lyrics section by section and places the syllables itself. Syllables are split at vowel groups, the same estimate the *Lyrics fit* counts with. It is made for English: a German final *e* (*Liebe*) is taken as silent.

### Copy and paste at the cursor

The roll's **Copy**, **Cut**, **Paste** and **Insert** buttons and the keys below work like Cubase's key editor. They work wherever the score has the focus (roll, notation, section list), not in a text field. A clip holds notes and chord symbols. It starts at its earliest event, which lands on the cursor when it is pasted.

| Key | Button | What it does |
|---|---|---|
| Ctrl+C | Copy | copy the selected notes and chord symbols (also from a read-only score) |
| Ctrl+X | Cut | copy them; the notes become rests and the chord symbols are removed |
| Ctrl+V | Paste | **paste at the cursor, overwriting**: in the voices the clip has, what played from the cursor for the clip's length is replaced (its rests too); chord symbols are replaced only when the clip has chord symbols |
| Ctrl+Shift+V | Insert | **insert at the cursor** (Cubase: *Paste Time*): everything from the cursor on - both voices, chord symbols, keys, sections - moves later by the clip's length rounded up to whole bars, then the clip goes into the gap |
| Ctrl+D | | duplicate the selection right after itself (overwriting what follows; the clipboard stays as it is) |

A Vocal clip goes into the Vocal voice and an Ins clip into the Ins voice. **Sections** copied in the section list paste as a range of both voices with their chord symbols. Insert them and they keep their names, so a copied chorus becomes a new chorus at the cursor. The clipboard belongs to the editor page, so a clip can be pasted into the other sheet's score. A clip from a score with a finer grid (L:1/32) pastes into a coarser one (L:1/16) only when every note fits that grid; the status line says so otherwise. Each paste is one undo step.

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
| Space | play / stop (from the cursor) |
| Home / End | cursor to the start / end of the score |
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

## Files: MIDI, MusicXML and the project

A score goes in and out as a standard MIDI file, so a sketch from any DAW can become the score - and the score can go back to a DAW. The sheet music goes out as MusicXML, PDF, PNG or SVG, and the whole editor's work goes into a project file to go on later.

| Button | What it does |
|---|---|
| **Save project** | Downloads everything the score editor holds as one file, `<title>.plenio.json`: the score (notes of both voices, chord symbols, sections, tempo, keys, meters), the **Guide notes**, the **lyrics** and the editor's **settings** - the tracks' sounds, the metronome, a cover's *hear*, source level, *wave* and *sung*, the MIDI recording settings and the paper. An unfinished or even invalid score is saved as it is. |
| **Open project…** | Opens such a file in any score sheet. Its score, Guide notes and lyrics replace these in **one undo step**, and its settings become the editor's (a file saved before 0.4.4 has none; older versions ignore them). A part the sheet cannot hold is left out, and the status line says which: Guide notes need the DAW sheet, and lyrics need a sheet whose lyrics the editor can change. Lyrics opened in a score sheet of the Song or DAW template go into *Song Sheet · Text* on Apply, like any lyrics edit. |
| **Export notation…** | The notation as you see it - both voices, chord symbols, section names and the lyrics under the notes, with the song's title - as **PDF** (pages of A4 or Letter with page numbers, 300 dpi), **PNG** (the whole score as one picture, twice the screen resolution), **SVG** (the whole score as a vector drawing) or **Print…** (the browser's print dialog, which also saves a *vector* PDF). A line of music never breaks across pages. Off while the text is invalid. **Automatically on every export:** *Export Release*'s *sheet music* (on A4 in the YuE2 templates) saves the same PDF of the final score and lyrics as `<name>.pdf` next to the audio. |
| **Export MusicXML** | Downloads the sheet music as MusicXML 4.0 (`<title>.musicxml`), the format notation programs exchange (MuseScore, Sibelius, Finale, Dorico, Cubase's score editor, Logic). Parts: *Vocal* (with the chord symbols, the section names as rehearsal marks, the tempo and the **lyrics** under the notes) and *Instrument* (bass clef when it plays low). Notes that cross a bar line or have no single note value are tied; pitches are spelled for the key. For an engraved PDF with full control over the layout, open the file in a notation program (MuseScore is free). The Guide track stays in the MIDI export. Off while the text is invalid. |
| **Export MIDI** | Downloads the score as a type-1 MIDI file named after the song's title. Tracks: *Vocal*, *Instrument*, *Chords* (block voicings plus `plenio:chord` text events) and the *Guide* track; tempo, time and key signatures and the section markers sit in the conductor track. Off while the text is invalid - the same gate as Apply. |
| **Import MIDI…** | Reads a `.mid`/`.midi` file and shows what the import found **before** anything is replaced: the file's tracks with a role each, the grid, whether to read chords from the notes, and the import report. *Insert* replaces the score **and its Guide notes** - one undo step for both (the diagnostics of the imported text come with it); the sheet's old Guide notes belong to the replaced score and go with it, which the dialog says before you insert. |

Roles: *Vocal* and *Instrument* become the two YuE2 voices (one voice each - where notes overlap, the highest sounds, and the report says how many were shortened, split or dropped); *Chords* becomes chord symbols; *Guide* is kept for playback and MIDI only and is **never sent to YuE2**; *do not import* leaves a track out. A Plenio file carries the unit and the bar layout in a text event, so it comes back exactly as it was.

Foreign files are read deterministically and reported: note starts and ends are quantised to the grid (1/16, or the score's own length), only the first tempo is used, later time signatures take effect at bar starts, markers become sections - every lossy step is listed. *Read chords from the notes* matches the notes of a *Chords* track against the supported chord symbols (best effort: what fits nothing is counted, not guessed); written `plenio:chord` events always win.

## Sections

Section names are the `% name` comment lines in the score. They matter: YuE2 sings the lyrics section by section, and in covers the lyrics draft is placed into the score's sections. Changing sections in the Score sheet therefore changes the cover's lyrics draft - and a lyrics document you edited before is then **not replaced silently**: the next run stops with a conflict in the text sheet (see [Song Sheet](song-sheet.md)).

Names are stored in lower case and use letters, digits, spaces and hyphens (up to 30 characters), for example `verse`, `pre-chorus`, `chorus 2`, `outro`.

### Arranging sections

The section list works like Cubase's arranger track: whole sections are copied, moved and deleted - with their notes in both voices, their chord symbols, keys and bar lines. No ABC is needed.

| Action | Mouse | Keys (list focused) |
|---|---|---|
| select | click a section (it also goes there); **Ctrl+click** adds or removes one, **Shift+click** selects a range | Ctrl+A all, Esc none |
| duplicate | **Duplicate**: a copy of the selected sections right after the last of them | Ctrl+D |
| copy | **Copy**: the selected sections into the clipboard, to paste them at the cursor in the roll | Ctrl+C (Ctrl+X: copy and delete) |
| move | **↑ / ↓**: one place earlier / later; or **drag** the sections to a new place (the line shows where they land) | Ctrl+↑ / Ctrl+↓ |
| copy to a place | drag with **Alt** (or Ctrl) held | |
| delete | **Delete**: the rest closes up (one section always stays) | Del |

Every arrangement is **one undo step**, and the notation, the roll, the ABC text and the bar strip follow it at once. A note that was tied across into a section that no longer follows is cut at the section's end - it does not tie into a different note. A copied section keeps its name, so a song can have two `chorus` sections in a row.

### Arranging bars

The **bar strip** under the sections arranges single bars the same way - for a bar too many in a verse, a fill to repeat, or two bars in the wrong order. Its buttons sit right above it.

| Action | Mouse | Keys (after a click in the strip) |
|---|---|---|
| select | click a bar (it also goes there: the inspector and the cursor follow); **Ctrl+click** adds or removes one, **Shift+click** selects a range | Ctrl+A all, Esc none |
| duplicate | **Duplicate**: a copy of the selected bars right after the last of them | Ctrl+D |
| copy | **Copy**: the selected bars into the clipboard, to paste them at the cursor in the roll | Ctrl+C (Ctrl+X: copy and delete) |
| move | **← / →**: one place earlier / later; or **drag** the bars to a new place (the line shows where they land) | Ctrl+← / Ctrl+→ |
| copy to a place | drag with **Alt** (or Ctrl) held | |
| delete | **Delete**: what follows moves up (one bar always stays) | Del |

The keys act on what you clicked last: after a click in the section list they arrange sections, after a click in the bar strip they arrange bars. A bar keeps its section: deleting the first bars of a section starts the section at the next one; a bar copied out of another section starts a new section of that name. Every arrangement is **one undo step** (the undo button says what it did, for example *deleted bars 10-13*), and everything listed below follows it.

### What follows an arrangement

| Where | What follows |
|---|---|
| every sheet | notation, roll, ABC text, inspector, section list - and undo/redo (one step) |
| **DAW** sheet (*5 · YuE2 · DAW*) | the **Guide track**: its notes move, are copied and deleted with their bars. This holds for arranged sections, *Insert* at the cursor, and inserted, deleted or duplicated bars. Undo brings the Guide back with the score. |
| score sheet whose lyrics come from **Song Sheet · Text** (*1 · YuE2 · Song*, *5 · YuE2 · DAW*) | the **lyrics**, when their sections matched the score's when you opened the editor (see below) |
| **cover** (*2 · YuE2 · Cover*) | the lyrics are written for the final score on the next run (the text sheet comes after the score sheet). At the text sheet's stop, the score can still be edited in that sheet's score tab: Apply writes it into *Song Sheet · Score*, the lyrics shown there are kept with it (*manual*), and Approve approves both. With the **original lyrics**, the transcribed words follow their bars. A copied chorus gets the chorus words again, a moved verse takes its words along, and the words of a deleted section are left out (the report says how many). **A/B** and the section list's *source* times follow the same match: a copied chorus plays the source's chorus. This needs a transcription made with this version; older ones place the words by the section order as before |

**The lyrics follow the sections.** YuE2 sings the lyrics section by section, so a duplicated chorus needs its words twice. When the lyrics of *Song Sheet · Text* have the same sections as the score, the side column shows **lyrics follow the sections**. Every edit then lays the lyrics onto the new sections:

- a copied section copies its words, and a moved section takes them along;
- a deleted section loses its words;
- a section joined to the one before adds its lines there;
- a part split off a section starts without words;
- a section pasted with *Insert* brings the words it was copied with;
- a renamed section gets a matching tag.

The panel lists the new order, and *Lyrics fit* checks the arranged lyrics. **Apply** writes them into *Song Sheet · Text* as an edit of its draft, so that sheet asks for approval again.

In *1 · YuE2 · Song* the planner reads those lyrics. On the next run it plans again, and the arranged score is kept as yours (*manual*). It is used as it is and does not turn into a conflict with the new plan.

Untick the box to leave the lyrics as they are. Lyrics that were changed in *Song Sheet · Text* after the last run are not overwritten. The panel then says to run again first.

## Playback and A/B

**▶ Play** (Space) plays simple tones of the notes from the **cursor**, marking the sounding notes in the notation and the piano roll and drawing a playback line in the roll - a guide to the notes, not a preview of what YuE2 will render. It works offline: no soundfont is downloaded. A click in the ruler (or on a section) while it plays jumps there. Choose the voices, the speed (the score's tempo is not changed), *loop* and the *metronome* (a click on every beat, higher on the first beat of a bar). *Loop* repeats the bars of the selected notes (*loop bars 12-13*), or - with nothing selected - plays from the cursor to the end of its section and then repeats the whole section, like Cubase's cycle.

### The source recording (covers)

With **reference_audio** connected to the Song Sheet (the Cover template connects the source to both sheets), the source recording is a track of its own, like an audio track under the MIDI in a DAW:

- The roll shows its **waveform** in a lane under the chord and lyrics lanes, bar by bar where the transcription puts it - you see where the singing starts, a phrase ends or a bar is silent. A bar the source does not have (inserted) is marked. A click in the lane sets the cursor.
- **hear: both** plays the notes and the recording **together**, on one clock: every bar lasts as long as the recording's bar (the transcription's beat grid), so the notes, the metronome and the recording stay together even where the singer drifts from the score's tempo. In an arranged cover, a copied chorus plays the source's chorus again.
- **notes** / **source** play one of them; **A/B** switches between the two **at once**, also while it plays. The *source* slider sets the recording's level under the notes.
- The source plays at 100 % speed only (no time stretching); at another speed the notes play alone.
- **sung**: with node **Sung Pitch** connected (the Cover template does), the roll draws the **sung pitch** of the source's vocals as a pink curve over the notes - every 20 ms, with the intonation - so you see where a transcribed note differs from the singing: a wrong pitch, an octave off, a note nobody sings, a sung note the transcription missed. SheetSage2 often writes the melody an octave away from where it is sung (a female voice around C4 notated around C5); the curve is then drawn in the notes' octave and the switch says so (*sung +8va*). Untick *sung* to hide it. Without the separation model the switch is greyed and its tooltip says why.
- **wave** and **sung** in the roll's toolbar show or hide the waveform lane and the sung-pitch curve. For a cover that goes far from the original - another melody, another harmony - untick them: the roll shows only your score, and *hear: notes* plays only the notes. The choice is remembered, goes into the project file, and the presets *Cover: check the transcription* and *Cover: free arrangement* set all three at once.
- **⇆ align**: when the recording runs ahead of or behind the bars - the transcription's beat detection was off - move it by a beat or in 10 ms steps (*reset* goes back to the detected grid). The waveform, the playback, A/B, the sections' source times and the sung pitch follow; the shift is kept with the sheet (node property `plenio_source_shift`), it changes no document.

The reference is only for listening; it is not part of the sheet's documents and never reaches the model.

## Sounds and presets

Each track plays in a sound of its own - like the instrument slot of a DAW's track. **♫ sounds** in the transport (and, in the DAW layout, the select under each track header) chooses it; **▶** next to a track plays a few notes in its sound. Drawn and moved notes and the keys of a MIDI keyboard are heard in the sound of the roll's *draw into* track.

| Sound | |
|---|---|
| Plain, Soft lead | the editor's classic sine and triangle tones (the default: Vocal in *Soft lead*, the rest *Plain*) |
| Piano, Electric piano | a struck string that fades and darkens; a bell-like FM electric piano |
| Strings, Pad | a bowed section with vibrato; a slow, wide synth pad |
| Organ, Flute | drawbar organ; a breathy flute |
| Voice “ah” | a sung “ah” (formant synthesis) - for the Vocal track |
| Pluck, Synth lead, Bass, Mallets | a plucked string; a bright lead; a round bass; marimba / vibraphone |

The sounds are synthesized in the browser: nothing is downloaded, they work offline and with the latency of the plain tones, and every sound is levelled to the loudness of the plain tone. They are sketches of the instruments, to tell the tracks apart and hear the music's character - YuE2 renders the song itself. VST plugins cannot run in a browser (see [the design note](../../design/score-editor-sounds-export.md)); for real instruments, export MIDI into a DAW.

**Presets** set the basic settings at once. The built-in ones are starting points by kind of song - *Classic*, *Pop*, *Ballad*, *Rock*, *Electronic / dance*, *Acoustic / singer-songwriter*, *Jazz / soul*, *Orchestral / cinematic* (the tracks' sounds) - and by way of working: *Composing with a MIDI keyboard* (piano sounds, metronome, count-in, 1/16 quantize), *Cover: check the transcription* (the source under the notes, its waveform and sung pitch shown) and *Cover: free arrangement* (only the notes; waveform and sung pitch hidden). Choose one and press **use**: it changes what it names and leaves the rest. **save current as preset…** saves the current sounds, metronome, cover view, recording settings and paper under a name of yours; your presets are listed under *Yours* and can be deleted. They are kept in ComfyUI's user data (`user/<user>/plenio/score-editor-presets.json`, next to your workflows), so they are there in every browser; when that store cannot be reached they are kept in this browser, and the panel says so.

## Recording with a MIDI keyboard

Play a melody in with a MIDI keyboard, like the record button of a DAW. It works in Chrome and Edge (Firefox: allow MIDI for the site), with ComfyUI opened at `127.0.0.1` or `localhost` - the browser offers MIDI only to a secure page, not to `http://` and the computer's network address. The first **● rec**, **step** or *use MIDI* asks the browser for access; a keyboard plugged in later is found at once.

**● rec** (Shift+R) records into the voice chosen in the roll's **draw into** (*Vocal* or *Ins*), from the **cursor**:

1. Set the cursor in the ruler and press **● rec**. One bar of clicks counts in (the button blinks *count-in*) - on the song's beats, also when the cursor is between two - then the score plays from the cursor.
2. Play. The keys show as red notes in the roll while you play, where you heard them: the audio output's latency is taken out, so a key played with a note you hear lands on that note. A key a little before the first beat lands on it.
3. **Space**, **■ stop** or **● rec** again stops and **keeps** the take - one undo step (*recorded 12 notes in Vocal (bar 5)*), its notes selected. **Esc** throws it away. Playback also stops at the score's end. While the take runs, the score is not edited (an edit or Ctrl+Z says so and waits): the take's notes go to the bars as they were at *rec*.

A voice of the score is one line, so the take is made one line: keys pressed together give their highest note, and a key pressed before the previous one is let go ends it (legato). Starts and ends go onto the *quantize* grid, and a gap of at most one grid step before the next note closes - a key let go a little early still gives a half note, not a dotted quarter and a sixteenth rest. With **replace** the voice plays only the take from the start to the stop (what it played there before is gone); with **merge** only the time under the new notes is overwritten and the rest stays. Nothing played changes nothing.

**step** input writes without playback: every key writes a note of the step length at the cursor and moves the cursor on (keys pressed together: the highest); **rest ▶** moves on without a note. Click **step** again to end it.

The light next to *step* flashes with every key. **🎹** holds the settings, remembered in this browser:

| Setting | |
|---|---|
| keyboard | *all keyboards* or one of them; while the chosen one is unplugged, every keyboard is heard |
| hear the keys | a simple tone while a key is held (for keyboards without a sound of their own) |
| count-in | none, 1 or 2 bars of clicks |
| quantize | 1/4, 1/8, 1/16, 1/32, or off (the score's finest length) |
| mode | *replace* or *merge* |
| mute its old notes | the recorded voice's notes are silent while recording |
| step | the step input's length (1/1 to 1/16) |

A key still held when the keyboard is unplugged (or sends *all notes off*) ends there; nothing hangs. The sustain pedal is not recorded: a note lasts as long as its key is down.

## The score stays YuE2's

Whatever the editor does - a drawn note, a MIDI take, a paste, an arrangement, an import - the result is a score in the two-voice ABC dialect YuE2 reads:

- every edit is one operation of the backend on the score model; its text is written by the serializer and **read back with the parser of YuE2's ABC dialect** (`yue2_abc_tools`). The text must parse and give exactly the same music, or the edit is refused with the reason. Durations become the note values the dialect has (tied where needed), a voice is always one line, every bar is exactly full, and chord symbols, keys and meters are the supported ones;
- typed ABC is checked the same way after a short pause; an invalid text is marked and cannot be applied or approved;
- the sheet then checks the score against YuE2's rules: no score of rests only, a silent Vocal voice for an instrumental song, the sections against the lyrics, the length against the brief, the register against the voice the style asks for - and since 0.4.4 a vocal melody that reaches **below E2 or above C7** (as written; transcriptions write melodies an octave above the singing) is flagged as an octave slip, such as a MIDI keyboard played an octave off. These are warnings: the text is valid, YuE2 just would not sing it well;
- the exact token budget is counted when the workflow runs, with the loaded YuE2 tokenizer.

A test drives hundreds of random edit sequences - MIDI takes over the whole keyboard, pastes, quantizing, notes, bars, keys, meters, sections - through the editor's operations and checks after every step that the parser accepts the text and that it reads back as the same music.

## Apply, Revert, Approve

- **Apply** saves your documents into the node (they are stored in the workflow, so they survive saving and reloading it). An applied score is *edited* while its draft is unchanged, or *manual* if you made it manual.
- **Revert** discards every change made since the editor opened.
- **Approve** (with *review* = *stop for review*) releases exactly the documents you see for the next run.
- Closing with unapplied changes asks whether to apply, discard or keep editing.

## Preferences

Layout, *ABC text (advanced)*, zoom, piano roll (on/off and its zoom), metronome, voices, speed, *hear*, the source's level, *wave* and *sung* (covers), the roll's *hear* switch (hearing the notes you edit), the tracks' sounds, the paper of the notation export and the MIDI keyboard and recording settings (🎹) are remembered in this browser (not in the workflow). The project file and the presets carry the basic ones (see [Sounds and presets](#sounds-and-presets)). A blocked or cleared browser storage simply gives the defaults.

## Limits

- Very long scores (several minutes of YuE2 plan) render as one page; scrolling is fine, but paging is not built yet.
- The editor edits notes, rests, lengths, chord symbols, sections, bars, meters (of empty bars) and keys. Tempo and transposition are in the palette's *Whole score*.
- A score that YuE2 accepts but whose bars are not a whole number of the score's shortest length (`L:`) cannot be shown in the piano roll; it is edited as text (the roll says so).
