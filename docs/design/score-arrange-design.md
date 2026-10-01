# Arranging the score: sections, the cursor, copy and paste

| | |
|---|---|
| Status | **Design and implementation, 2026-10-01** (owner's request) |
| Scope | Score tab of the Song Sheet editor: section list, piano roll, transport; the backend's canonical operations; what follows a change (Guide track, lyrics, cover source times) |
| Related | [score-editor-design.md](score-editor-design.md), [yue2-cover-design.md](yue2-cover-design.md), user guide [score-editor.md](../user/concepts/score-editor.md) |

The owner copies a verse and a chorus in a cover by copying ABC text. The editor gets the same in its own terms,
close to Cubase (arranger track, project cursor, key editor clipboard), so that nobody has to learn ABC or a new
convention. Every change is still **one canonical operation** that the backend checks and writes as text; the
notation, the roll, the ABC text, the inspector and the section list follow from the new text as today.

## 1. Sections (the list on the left - Cubase: arranger track)

| Action | How | Cubase |
|---|---|---|
| select | click a section; Ctrl+click adds or removes one, Shift+click a range | arranger events |
| duplicate | **Duplicate** (Ctrl+D): the selected sections, in order, right after the last one | Duplicate (Ctrl+D) |
| delete | **Delete** (Del): the selected sections go, the rest closes up | Delete |
| move | **↑ / ↓** (Ctrl+↑/↓): the selection moves one section earlier or later; or drag a section to a new place | drag arranger events |
| copy by dragging | drag with **Alt** held: a copy goes to the drop place | Alt+drag copies |
| copy | **Copy** (Ctrl+C): the sections as a range in the clipboard, for pasting at the cursor in the roll | Copy |

Backend: `arrange_sections {order: [section numbers]}` - the new song as a list of the old sections (repeats and
omissions allowed). It is built on `arrange_measures` (the new song as a list of old measures):

- every new measure takes the old measure's meter, notes, chords and text (origins: unchanged measures keep their
  exact ABC text);
- a note that crosses a seam between measures that were not neighbours is cut at the seam (and its tail starts
  anew in the next block) - no tie leads into a different note;
- the key in effect at every measure is kept; a key change is written where it differs from the measure before;
- a section starts wherever an old section started, and at every seam (a moved part of a section keeps its label);
- the result carries a **time map** (`[[old start, old end, new start], ...]` in units) for what must follow.

## 2. The cursor (Cubase: project cursor)

A vertical line through the roll with a marker in the ruler (bar numbers). **Click in the ruler** to set it (on the
grid); clicking a section or a bar in the list puts it at the bar's start. **Play starts at the cursor** (Space), a
second line follows the playback and disappears on stop (the cursor stays: Cubase's *return to start position on
stop*). *Loop section* loops the section the cursor is in; the source recording (A/B) plays from the cursor's bar.

## 3. Clipboard (Cubase: key editor)

| Key | Action |
|---|---|
| Ctrl+C / Ctrl+X | copy / cut the selected notes and chord symbols (cut leaves rests, as Delete) |
| Ctrl+V | **paste at the cursor, overwriting**: in the voices the clip has, the notes from the cursor for the clip's length are replaced; chord symbols are replaced only when the clip has chord symbols |
| Ctrl+Shift+V | **paste time at the cursor** (Cubase *Paste Time*): everything from the cursor on - both voices, chords, sections, keys - moves later by the clip's length rounded up to whole bars, then the clip goes into the gap |
| Ctrl+D | duplicate the selection right after itself (overwriting) |

The clip starts at the earliest selected event (Cubase: the first event lands on the cursor); a clip copied from
sections starts at the section and lasts whole bars. The frame of the select mode also takes chord symbols when it
reaches into the chord lane; Ctrl+A selects all notes and chord symbols. The clipboard lives in the browser page, so
a clip can be pasted into another sheet's score.

Backend: `paste {at, mode: overwrite|insert, span, notes: [{track, onset, duration, pitch}], chords: [{onset, name}]}`
(onsets relative to the clip start); insert returns a time map.

## 4. What follows a change - by workflow

| Workflow / sheet | Score edits follow into |
|---|---|
| every sheet | the notation, the roll, the ABC text, the inspector, the section list, undo/redo (one step) |
| DAW sheet (*5 · YuE2 · DAW*) | the **Guide track**: its notes move, are copied and deleted with the bars (time map; part of the same undo step) - before, inserting or deleting bars left the Guide notes in place |
| score sheet with the text sheet's lyrics as context (*1 · YuE2 · Song*, *5 · YuE2 · DAW*) | the **lyrics**: when the lyrics' sections matched the score's before the edit, the editor offers to arrange them the same way and writes them into *Song Sheet · Text* (as *edited*; that sheet then asks for approval again - its lyrics changed). Otherwise the existing warning stays |
| cover, *instrumental* | nothing to do: the render's tags come from the final score |
| cover, *new lyrics* | the writer writes for the final sections on the next run |
| cover, *original lyrics* | the transcribed words follow their bars: the timeline keeps a fingerprint of every transcribed bar (meter and vocal notes); the final score's bars are matched to them, so a copied chorus gets the chorus words again and a moved verse takes its words along |
| cover, A/B and the section list's *source* times | the same match: a copied chorus plays the source's chorus |

## 5. Order of work

1. Backend: `arrange_measures`, `arrange_sections`, `paste`; time maps also for insert, delete and duplicate bars.
2. Section list: selection, Duplicate, Delete, ↑/↓, drag (Alt: copy), Copy.
3. Cursor in the roll, play from the cursor, follow line.
4. Clipboard in the roll: copy, cut, paste (overwrite), paste time (insert), duplicate; chords in the frame.
5. Follow-up: Guide track, lyrics of the text sheet, cover bar matching (lyrics alignment, A/B, source times).
6. Guide, tests, real-frontend check.
