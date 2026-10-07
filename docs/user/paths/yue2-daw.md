# 5 · YuE2 · DAW

Compose the score yourself - the writer drafts the words, you write the music, and YuE2 renders exactly what you approved.

▶ **Video:** *Tutorial 5 · YuE2 · DAW* in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE) - the whole path in ComfyUI, narrated, with chapters.

```
Song Brief ─► Write Song ─► Song Sheet · Text        (title, style, lyrics)
Song Brief ─► Score Tools ─► Song Sheet · DAW        (the score you compose)
Song Sheet · DAW ─► YuE2 Render ─► Plenio · Master ─► Export Release
```

## What YuE2 reads

YuE2 reads **two monophonic voices plus chord symbols**. That is the whole conditioning, and the DAW layout shows it as four tracks:

- **Vocal** → `V: Vocal` - the sung melody, one note at a time.
- **Instrument** → `V: Ins` - a second melody (in an instrumental song this carries the lead; the Vocal voice is silent).
- **Chords** → the chord symbols written over the Vocal line (`"D"`, `"Gm7"`, `"C/E"`, ...).
- **Guide** → **not sent to YuE2** - your own notes (a sketch piano, a bass line, a click). They are played in the editor and written into exported MIDI files, and nothing else.

There is no fourth conditioning track and no hidden arrangement: what you see in the editor is what the model gets.

## The first run

1. In **Song Brief** describe the song - genre, mood, length, tempo, key, meter. The default mode is *one song, stop to review*.
2. Press **Run**. The writer drafts title, style and lyrics, and the run **stops at Song Sheet · Text**: check the words, **Approve**, and press **Run** again.
3. *Score Tools* builds an **empty score** from the brief: the length and tempo give the number of measures, the brief's *meter* and *key* are read where you wrote them, and anything missing falls back to 4/4, C major and 100 BPM (the report lists every fallback). The score is one `verse` section of rests. The run **stops at Song Sheet · DAW**. Open it and compose:
   - **piano roll**: draw a note on an empty place, drag to move, drag the right end to resize; switch to **⬚ Select** to frame several notes (Shift adds) and move or delete them together; `Delete` turns notes into rests, `Shift+Delete` closes the gap;
   - **chord lane**: double-click to write a chord symbol, drag one to move it, double-click to rename;
   - **navigator**: split the score into sections (`verse`, `chorus`, ...), because YuE2 sings section by section;
   - **ABC text**: still there, under *Advanced* - the same text, synchronised both ways.
   You can also press **Import MIDI…** and read a sketch from any DAW; the dialog shows what the import did before anything is replaced. With the lyrics of Song Sheet · Text, the lyrics lane shows the words over the imported melody - give the sketch the lyrics' sections (verse, chorus, ...) so that every section has its words.
4. **Approve** the sheet (in the brief's review mode), then press **Run** again: YuE2 renders exactly this score, and Master and Export finish the song. Every further run is a new **take** of the same score.

A score that has only rests cannot be rendered - YuE2 needs at least one note. The sheet says so instead of rendering silence.

## The Guide track

The Guide track is for you, not for the model: a sketch piano, the bass line you are planning, a MIDI import you want to keep next to the score. It is stored in the Song Sheet node (in the workflow, so it survives saving and reloading), you can play it with the other tracks, it is exported into MIDI files, and it is *never* sent to YuE2 - the track panel says "not sent to YuE2" for that reason.

Patterns of a DAW workflow:

- Import a MIDI file with a *Chords* track: switch on *read chords from the notes* and the chord symbols are written into the score (best effort, reported).
- Keep the drums or the piano of your sketch on the Guide track: they will not colour what YuE2 sings, but you hear them while you work.
- **Save project** keeps the score, the Guide notes and the lyrics in one file (`<title>.plenio.json`); **Open project…** brings them back in any DAW sheet, so you can go on where you stopped - in another workflow or on another machine.
- **Export MusicXML** gives the sheet music, with the lyrics under the notes, to a notation program (MuseScore, Sibelius, Dorico, Cubase).

## Honest limits

- YuE2 reads **two voices**. A piano arrangement with three independent lines cannot be conditioned as such: put the leading line in *Vocal* or *Ins*, the harmony in the chord symbols, and the rest on the Guide track.
- Imported MIDI is quantised to the grid and reduced to one voice per track; the import report says exactly what was changed.
- The instrumental convention applies: for an instrumental song the Vocal voice must stay silent (Score Tools *prepare from brief* does that for a planner draft; you do it by not writing Vocal notes).
- The editor is a guide, not a preview: playback uses simple tones, never the model's sound.

## Related

- [Score editor](../concepts/score-editor.md) - the roll, the inspector, the lyrics lane, MIDI, MusicXML and project files, the delete rules.
- [Song Sheet](../concepts/song-sheet.md) - automatic, edited and manual documents, review and approval.
- [1 · YuE2 · Song](yue2-song.md) - when the model writes the score.
