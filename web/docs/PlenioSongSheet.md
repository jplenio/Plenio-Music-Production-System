# Song Sheet

The single place that decides which documents condition the music model. What leaves the sheet reaches the model unchanged, and the release record stores exactly these texts.

Press **Edit Song Sheet…** (also available in App mode) to see and edit the documents:

- **auto** - the upstream draft is used.
- **edited** - your edit is used while its draft is unchanged. When the draft changes, the run stops with a **conflict** so that your edit is never replaced silently.
- **manual** - your text is always used and the upstream draft is not computed (for lyrics in a cover: the ASR does not run).

**review** - *as the brief says* (default) stops when the connected brief's mode is *one song / one cover, stop to review* and continues for *new song / new cover every run* (and without a brief); *stop for review* always holds the documents back until you **Approve** exactly what you see; *continue* never stops. In a series (*new song every run*) an *edited* document conflicts with the next run's new draft - make it *manual* to keep it for the whole series.

**Where the run stands:** before a run a sheet that will stop carries **⏸ review stop** (and *stops here for review* under its button); after a run it shows **⏸ waiting for your approval** with an amber frame (the run stopped here - Edit, Approve, run again), **✓ approved**, or **✖** with a red frame for a conflict or an invalid document. The same line appears in App mode. A new run clears the previous run's badges.

The sheet validates the documents with the rules of the connected engine (style, lyrics, score, exact token budget). With MiniMax Music 3 the style document is the **caption** (Global Metadata, Vocal Details, Arrangement); caption and lyrics must stay under 5 000 tokens, counted exactly with the loaded text encoder, and the render ceiling follows the brief (at most 6:00). For a score it also outputs the render mode (chords -> full, otherwise melody), a render ceiling derived from the score's length and the score's **section tags** (the lyrics of an instrumental cover). **plan_lyrics** is what the YuE2 planner reads: for an instrumental song whose lyrics are the bare `[instrumental]` tag, a section form for the brief's length (*Intro, Verse, Chorus ... Outro*, longer for longer songs) - it is never sung, the render gets the sheet's lyrics; otherwise the lyrics themselves.

For covers (the score comes from *Song Sheet · Score* as context) the text sheet also checks:

- the lyrics' sections against the score's sections;
- whether each section's lyrics have about one syllable per melody note - far fewer or more and YuE2 does not sing the words clearly;
- whether the voice in the style fits the melody's range (YuE2 sings the melody as written).

In the editor you also see what changed against the draft (word by word), the words the lyrics ASR was unsure about, and - with a **timeline** connected - the sections of the source with their start and end times.

The cover's text sheet can still **edit the score** it shows: Apply writes it into *Song Sheet · Score* and keeps the lyrics shown with it as *manual*; Approve approves the changed score there too. When the score sheet's score changed after the last run, it stays read-only here.

**Score tab** (when the sheet owns a score): the piano roll with the chord lane, the notation and the ABC text, always the same score. Draw, move and resize notes in the roll or change them with the palette and the keyboard (↑/↓ semitone, Shift+↑/↓ octave, `[`/`]` shorter/longer, R rest, N note, Ctrl+Z/Ctrl+Y undo/redo). In the section list, select sections and duplicate, copy, move or delete them, or drag them to a new place (Alt: a copy); the bar strip under it does the same with single bars. Click in the roll's ruler to set the **cursor**: playback starts there, and Ctrl+V / Ctrl+Shift+V paste at it, overwriting or inserting time. With **reference_audio** connected, the source recording is a track under the score: its waveform in the roll, and *hear* plays it together with the notes on the transcription's beat grid, or alone (A/B, switched at once). With lyrics, a **lyrics lane** shows every line over the phrase it is sung on (double-click to edit; select, drag, lengthen at its end, Del, Ctrl+C / Ctrl+V like notes - a line placed by hand keeps its span), and the notation shows the syllables under the notes. When sections or bars are arranged, the Guide notes follow, and so do the lyrics of *Song Sheet · Text* (written there on Apply). With a **MIDI keyboard** (Chrome or Edge), **● rec** (Shift+R) records a melody into the roll's *draw into* voice from the cursor after a bar of count-in - Space keeps the take as one undo step, Esc throws it away - and **step** writes a note at the cursor with every key. **♫ sounds** gives every track a sound (piano, strings, pad, voice ...) and holds presets by kind of song, your own ones too. Files: MIDI export and import, **MusicXML** export, the notation as **PDF, PNG or SVG** (*Export notation…*), and a **project file** (score, Guide notes, lyrics and the editor's settings). Every edit is checked; one that would break a bar is refused with the reason, and errors in the ABC text are marked at their bar.

**reference_audio** (optional, display only): a recording to listen to in the editor, usually the cover's source. The sheet saves a temporary copy for the editor's player; it is not a document, does not change the fingerprint, and the recording is not stored in the release record.
