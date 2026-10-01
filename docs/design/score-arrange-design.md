# Arranging the score: sections, the cursor, copy and paste

| | |
|---|---|
| Status | **Implemented, 2026-10-01** (owner's requests; not yet released - CHANGELOG *Unreleased*) |
| Scope | Score tab of the Song Sheet editor: section list, piano roll, transport; the backend's canonical operations; what follows a change (Guide track, lyrics, cover source times); lyrics where they are sung, MusicXML and project files (§6) |
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
| score sheet with the text sheet's lyrics as context (*1 · YuE2 · Song*, *5 · YuE2 · DAW*) | the **lyrics**: when the lyrics' sections matched the score's when the editor opened, every edit lays them onto the new sections (`lyricsFollow.ts`: the time map says where each new section came from; a copied section copies its block, a joined one adds its lines, a split-off part starts empty, a pasted section brings the words copied with it) and Apply writes them into *Song Sheet · Text* (as *edited* against its draft; that sheet then asks for approval again). In *1 · YuE2 · Song* the planner reads those lyrics, so the arranged score is stored as *manual* (the approval covers texts only, so it stays). Lyrics changed in the text sheet after the last run are not overwritten. Otherwise the existing warning stays |
| cover, *instrumental* | nothing to do: the render's tags come from the final score |
| cover, *new lyrics* | the writer writes for the final sections on the next run |
| cover, *original lyrics* | the transcribed words follow their bars: the timeline keeps a print of every transcribed bar (`bar_prints`: meter plus the Vocal and the Ins notes relative to the bar); the final score's bars are matched to them (`bar_match`: best content match, among equal bars the passage that goes on matching longest, else the bar after the previous match), so a copied chorus gets the chorus words again, a moved verse takes its words along and a deleted section's words are left out with a warning (alignment method *matched bars*). Timelines made before have no prints and keep the old behaviour |
| cover, A/B and the section list's *source* times | the same match in the editor (`barMatch.ts`, checked against a backend fixture): a copied chorus plays the source's chorus, the playback line follows the recording's order |

## 5. Order of work (done)

1. Backend: `arrange_measures`, `arrange_sections`, `paste`; time maps also for insert, delete and duplicate bars (e9907b1).
2. Section list: selection, Duplicate, Delete, ↑/↓, drag (Alt: copy), Copy, Cut (ee003aa, 2a4b12b).
3. Cursor in the roll, play from the cursor, follow line (92918b2).
4. Clipboard in the roll: copy, cut, paste (overwrite), paste time (insert), duplicate; chords in the frame (2a4b12b).
5. Follow-up: Guide track and lyrics of the text sheet (6996e03); cover bar matching - lyrics alignment, A/B, source
   times (c847b35).
6. User guide, tests (Vitest, pytest, host routes), real-frontend check.

## 6. Lyrics where they are sung, MusicXML, project file (owner's follow-up request)

- **Lyrics layout** (`lyric_layout.py`): the editor sends the lyrics with the score (`analyze`/`transform` take
  `lyrics`); the view says where they fall by the lyrics writer's own rule - a block per labelled section (in order;
  by tag when the counts differ), the section's Vocal notes as phrases (split at rests of a beat), a line per
  phrase (lines share a phrase when there are more), a syllable per note (a short line holds its last syllable, a
  long one crowds its last note). Syllables are split at vowel groups (the *Lyrics fit* estimate; made for English).
- **Roll**: a lyrics lane under the chord lane (`geo.top` grows by it), every line over its phrase, every syllable
  over its note; a double-click edits the line there - an undo step of its own (History records side-state-only
  steps). Edits go where the lyrics live: *Song Sheet · Text* on Apply (templates 1 and 5) or the sheet's own
  Lyrics tab (the cover's text sheet, whose score is read-only context).
- **Notation**: `w:` lines in the display text (tied continuations `*`, held syllables `_`); every element keeps its
  display range.
- **MusicXML 4.0** (`musicxml.py`, `/plenio/score/musicxml/export`): parts *Vocal* (harmony, rehearsal marks,
  tempo, lyrics with syllabic) and *Instrument*; pitches spelled for the key, ties across bar lines and for lengths
  without one note value, bar rests. The Guide track stays in MIDI.
- **Project file** (`projectFile.ts`, `plenio.score_project/1`, `<title>.plenio.json`): score, Guide notes, lyrics;
  opening is one undo step and names what a sheet cannot hold.
