# Changelog

All notable changes are listed here. Versions follow semantic versioning; published Registry versions are immutable.

## Unreleased

### Added

- **The source recording as a track** (score editor, covers). The roll shows the source's waveform in a lane under the chord and lyrics lanes, bar by bar where the transcription puts it, and the transport plays it **together with the notes** on one clock - every bar as long as the recording's bar, so notes, metronome and recording stay together where the singer drifts, and an arranged cover's copied chorus plays the source's chorus again. *hear: both / notes / source* and **A/B** switch at once while it plays; a slider sets the source's level. *2 · YuE2 · Cover* now connects the source to *Song Sheet · Text* too, so the words can be checked against the singing there.
- **DAW habits in the piano roll**: a click on the empty grid in draw mode inserts a note of the last drawn length; Shift+drag pulls a frame in draw mode; **Alt+drag copies** notes; a note's end **stops at the next note** instead of being refused (Alt: over it); **Ctrl+wheel** and **G / H** zoom along the bars (never the browser page); a click on the keyboard plays its pitch, and drawn, grabbed and moved notes are heard (*hear* in the roll's toolbar); notes wide enough show their pitch (`E5`).
- Transport: a click in the ruler (or on a section) while it plays **jumps there**; *loop* repeats the **selected notes' bars** (*loop bars 12-13*), else the cursor's section.
- **Sung Pitch** (new node, covers): the source's vocals - separated with the Stems model - as a pitch curve, every 20 ms with the intonation (a YIN tracker in NumPy: on the example song it agrees with Praat in 93 % and with WORLD Harvest in 91 % of the sung frames). The score editor draws it as a pink curve over the notes, in the notes' octave when the transcription writes the melody an octave away from the singing (*sung +8va*). *2 · YuE2 · Cover* runs it once per source and connects it to both sheets; without the separation model the node finishes anyway and the editor says why there is no curve.
- **⇆ align** (covers): the source recording moved against the bars by a beat or in 10 ms steps when the transcription's beat grid was off; waveform, playback, A/B and the sections' source times follow, and the shift is kept with the sheet.
- Piano roll: **quantize** (Q: the selected notes' starts on the grid, all notes when none is selected; Shift+Q: the lengths too), **vertical zoom** (↕−/↕+, Shift+G / H, Alt+wheel) and a **follow** switch (the roll pages along with the playback, or stays where you look).
- **⌨ keys** in the view tools: every key and mouse gesture of the score editor at a glance.
- Inspector: chord symbols transposed from their panel (−1 / +1), also several at once; the note panel's pitch buttons move selected chord symbols too.

### Changed

- **Esc** in the score lets the selection go and no longer closes the editor (it closes it from outside the score, as before).
- **Space** plays and stops also right after a click on a transport button or checkbox (it toggled the checkbox instead); only text fields keep it.
- The transport's **▶ play** replaces *▶ notes* and *▶ source*; with a source, *hear* chooses what plays.

## 0.4.3 - 2026-10-03

The lyrics lane places lines by hand like notes, chord symbols move by semitones, and the cover template starts with the original lyrics on a pop style.

### Added

- **Lyrics lines placed by hand** (score editor). In the roll's lyrics lane a line is handled like a note: click to select it (Ctrl / Shift+click: more), drag to move it, drag its start or end to make it longer or shorter, Del deletes it, Ctrl+C / Ctrl+X / Ctrl+D copy, cut and duplicate, Ctrl+V pastes at the cursor; ← / → move by the grid. A section with a line placed by hand keeps every line's span, and the syllables take the notes inside it; a line moved past another is sung after it. The spans are kept with the sheet (node property `plenio_lyric_spans`), follow arranged sections and bars, go into the project file and the MusicXML export, and each edit is one undo step.

- **Transpose chord symbols**: ↑ / ↓ in the roll and the palette's −1 / +1 move the selected chord symbols by a semitone - one or many, alone or together with selected notes, in one undo step. Each is spelled for the key where it stands (F + 1 in C major: F#); an octave leaves a chord symbol as it is.

### Changed

- **2 · YuE2 · Cover** starts with the style template *pop/dance-pop-vocal*, *original lyrics* (the language detected from the singing) and *keep original chords*; genre and mood are empty, so they come from the style template. App mode shows the original lyrics' language and voice.

### Fixed

- **Use template choices** in the Cover Brief set *vocals* to *sung* and offered a length - words of the Song Brief. It now speaks the cover's: a sung style template turns an instrumental cover into one with the *original lyrics* (and leaves *original* or *new lyrics* alone), an instrumental one sets *instrumental* and its melody, and there is no length. *Template fills* names only the fields a cover takes from a template (no tempo, key, meter or language).

## 0.4.2 - 2026-10-02

The score editor arranges single bars the way it arranges sections, and the transport moves next to the piano roll.

### Added

- **Arrange single bars** (score editor). The bar strip under the sections now selects one or more bars (click, Ctrl+click, Shift+click) and **duplicates, copies, moves or deletes** them, with buttons right above it, the keys of the section list (Ctrl+D, Ctrl+C, Ctrl+X, Ctrl+←/→, Del) and drag and drop (Alt copies). The Guide track, the lyrics and a cover's words follow, as they follow arranged sections; each arrangement is one undo step that says what it did (*deleted bars 10-13*).

### Changed

- The **transport** (play, loop, metronome, voices, speed) sits between the piano roll and the notation, in reach of both (Cubase: the transport under the key editor); before, it was at the bottom of the editor.
- The navigator column scrolls as a whole: in the DAW layout the track panel and the lyrics box had squeezed the sections and the bar strip out of reach.

## 0.4.1 - 2026-10-02

Six video tutorials with a voice-over - one for every template - and a short promo, plus a few fixes found while recording them.

### Added

- **Video tutorials for all six templates** and a promo, recorded in ComfyUI with the real models and narrated in English: System Check, YuE2 Song, YuE2 Cover, MiniMax Song, Enhance & Master and YuE2 DAW, linked in the README and in every user guide. The recording tools (`tools/tutorials`) now cut the picture for a voice-over: a narration file per video, speech through TTS Audio Suite's OmniVoice with one cloned narrator, the songs a preview plays mixed under the voice, and a folder per video with the SRT, the audio tracks and every spoken line for editing by hand.

### Changed

- **Export Release**: in the *tags* mode, the comment is preset to *Powered by Plenio Music Production System / ComfyUI* (edit or clear it like any tag).

### Fixed

- **Stems** did not load its separation model when the Python package `beartype` is installed (other custom nodes bring it): the model's config came as lists where the model's signature asks for tuples, and beartype refused them. The config is converted now.
- After **Import MIDI…** or **Open project…** the lyrics lane and the syllables in the notation were gone (the imported score was shown without the song's lyrics); the score is checked again with the lyrics now.
- Lyrics whose sections did not match the score when the editor opened stayed a plain text: renaming a section to the lyrics' tag, as the sheet's warning asks, did not make them follow a later arrangement. They now follow as soon as they match.
- After Approve, the summary beside *Edit Song Sheet…* still showed the last run's *waiting for approval* next to *approved*; it is left out once the sheet is approved.
- The System Check's tables (templates, model files, the hardware rule table) were shown as raw `| a | b |` lines on the node; node summaries now render tables. The templates table listed *4 · Enhance & Master* twice.
- The EQ's band strip showed a match proposal's exact values (`Q 0.3982428666120445`); Q and gain are rounded there now.
- The Lyrics tab said "YuE2 sings section by section" also in the MiniMax Song Sheet; it names no model now.

## 0.4.0 - 2026-10-02

The score editor becomes an arranging tool in the manner of Cubase. You can copy, move and delete sections; a cursor sets where playback and paste start; the clipboard pastes at the cursor or inserts time there. Everything that depends on the bars follows: the Guide track, the lyrics of the text sheet and, in covers, the original words and the source times. The lyrics are shown and edited where they are sung. The sheet music goes out as MusicXML, and the editor's work can be saved as a project file and opened again later.

### Added

- **Arrange a score without ABC** (score editor). The section list works like Cubase's arranger track. Select one or more sections (Ctrl+click, Shift+click), then duplicate them (Ctrl+D), copy them (Ctrl+C), move them (Ctrl+↑/↓, or drag; Alt+drag copies) or delete them (Del). The notes of both voices, the chord symbols, keys and bar lines go with them. Each arrangement is one undo step, and the notation follows it.
- **A cursor in the piano roll** (Cubase: project cursor). Click or drag in the ruler to set it, on the grid. Playback starts at the cursor, and a line follows the music. The cursor stays where it was on stop. *Loop section* plays to the end of the cursor's section and then repeats that section. Home and End move the cursor to the start and the end of the score. The section list and the bar strip put the cursor at the bar's start.
- **Copy and paste at the cursor** (Cubase: key editor). Ctrl+C, Ctrl+X and Ctrl+V, plus the roll's Copy, Cut, Paste and Insert buttons. Paste overwrites what the clip's voices play from the cursor on. Insert (Ctrl+Shift+V, Cubase's *Paste Time*) moves everything from the cursor on later by whole bars first. Ctrl+D duplicates the selection right after itself. Sections copied in the list paste with their chord symbols, and when inserted they keep their names. A select frame that reaches into the chord lane also selects the chord symbols there, and Ctrl+A selects all notes and chord symbols.
- **The Guide track follows the bars** (DAW sheet). Its notes are moved, copied and deleted with their bars. This holds for arranged sections, *Insert* at the cursor, and inserted, deleted or duplicated bars, and undo brings them back with the score.
- **The lyrics follow the sections** (*1 · YuE2 · Song*, *5 · YuE2 · DAW*). This applies when the lyrics of *Song Sheet · Text* matched the score's sections. Then every arrangement in the score sheet lays them onto the new sections: a copied chorus copies its words, a deleted section loses them, a joined section adds its lines. Apply writes them into the text sheet as an edit, and that sheet asks for approval again. In the Song template, the planner plans again for the new lyrics, so the arranged score is kept as *manual*. Lyrics changed in the text sheet after the last run are not overwritten.
- **Lyrics where they are sung** (score editor). With lyrics, the piano roll shows a lyrics lane under the chord lane: every line over the Vocal phrase it is sung on, every syllable over its note. A double-click edits the line there, and each edit is one undo step. In *1 · YuE2 · Song* and *5 · YuE2 · DAW* the edits go into *Song Sheet · Text* on Apply; in the cover's text sheet they go into its Lyrics tab. The notation shows the syllables under the Vocal notes (read-only). The placement follows the lyrics writer's rule: one line per phrase, about one syllable per note.
- **Covers keep their original words through an arrangement** (*2 · YuE2 · Cover*). Transcribe Score now keeps the content of every transcribed bar in the timeline, and the final score's bars are matched to it. With the original lyrics, a copied chorus gets the chorus words again, a moved verse takes its words along, and a deleted section's words are left out (reported). In the editor, *A/B* plays the source's chorus for a copied chorus, and the section list shows the right source times. This needs a new transcription.
- **Edit the score at the cover's second stop** (*2 · YuE2 · Cover*). The text sheet's score tab no longer shows the score read-only. Apply writes the edited score into *Song Sheet · Score* as an edit of the transcription, and the lyrics shown with it are kept as *manual*, so score and lyrics stay a pair. Approve also approves the changed score in *Song Sheet · Score*, so the next run renders without stopping there again. A score that changed in *Song Sheet · Score* after the last run is not overwritten.
- **Export MusicXML** (score editor). The sheet music in the format notation programs exchange (MuseScore, Sibelius, Finale, Dorico, Cubase, Logic). It has two parts. *Vocal* carries the chord symbols, the section names, the tempo and the lyrics under the notes; *Instrument* is the other part. Pitches are spelled for the key, and notes across bar lines are tied.
- **Save project / Open project…** (score editor). One file, `<title>.plenio.json`, holds everything the score editor works on: the score, the Guide notes and the lyrics. Open it in any score sheet to go on where you stopped, as one undo step. Parts a sheet cannot hold are named and left out. This matters most in the DAW workflow.

### Changed

- Playback starts at the **cursor** (before: at the selected bar). Without the piano roll the cursor follows the selected bar, so the *Text* layout plays as before. *Loop section* now plays to the end of the cursor's section and then repeats the whole section.
- Ctrl+A in the piano roll selects the chord symbols too (Cubase: *Select All*); before, it selected the notes only.
- **Approve shows on the node at once.** Approving a Song Sheet in its editor turns the node's badge and status line to *✓ approved* right away; before, the node said *waiting for your approval* until the next run started. An Apply that changes the documents of an approved sheet takes the approval back: the node shows its review stop again. This also applies to the other sheet when the editor writes its lyrics or its score back.
- Timelines from Transcribe Score hold the content of every bar (`bar_prints`), which lets an arranged cover find its source bars. Older timelines are read as before.

### Fixed

- Inserting, deleting or duplicating bars in the inspector of a DAW sheet left the Guide notes where they were, so they no longer sat under their bars. They now move with them.

### Studies

- **E6** measured the 0.3.1 instrumental form on the GPU (60 plans, 36 renders): the form gives the plans a few more sections and fewer token-limit cuts, and the rendered songs are more varied in 7 of 10 pairs. The form stays as it is; see `docs/test-reports/2026-10-01-e6.md`.

## 0.3.1 - 2026-10-01

### Changed

- **Instrumental songs get a song form** (YuE2 Song path). With the lyrics `[instrumental]` the planner mostly wrote an intro and one section that repeated for minutes - in the owner's electronic songs one pattern over one chord. The planner now reads a **planner-only form** that grows with the brief's length - from *Intro, Verse, Chorus, Outro* for about 1:00 to *Intro, Verse, Pre-Chorus, Chorus, Verse, Pre-Chorus, Chorus, Bridge, Chorus, Outro* for 4:30 and more - as YuE2's own instrumental workflow does (empty section tags, never sung). The render still gets `[instrumental]`, and any melody the planner writes for the voice still moves to the instrument (*prepare from brief*), so nothing new reaches the singing side. The Song Sheet has a new output **plan_lyrics** for this; lyrics you write or edit yourself reach the planner unchanged. Not yet measured on the GPU (study E6, planned).
- **Instrumental songs keep the requested length** (YuE2 Song path). YuE2 plans an instrumental's length itself; the owner's 274 instrumentals ran from 0.4 to 3.8 times the brief's length - above all EDM and electronic styles, where the plan was an intro and one section repeating for up to 14 minutes, which *fit length* could not cut. *Prepare from brief* now fits every instrumental plan outside 0.8-1.2 times the target: too long, it removes whole sections or - inside a long section - the bars between the start and the plan's own ending, at a phrase, so the song still ends as it was written (no hard cut); too short, it repeats the middle of the song. On the owner's records this brings 92 % of the instrumentals within 0.8-1.2 times the length (22 % before). Score Tools *fit length* does the same on demand.

### Fixed

- Export Release warned after almost every YuE2 run - *samples above full scale were clipped in FLAC/MP3 … a limiter before the export avoids this* - although the mastered files were fine: the clipped file was the unmastered take `(original).flac`, which keeps the render as it was (a render above full scale is normal). That is now a note on the node (*the unmastered take peaks at …; the mastered files are not affected*); a clip in the released files is still a warning.
- The score editor's section list showed a cover's intro at *source -1:58*: the transcription's first bar starts a moment before the recording (a padded pickup), and the clock formatted -1.2 s that way. Times before the start now read 0:00 (also in the section times of the text sheet).

### Added

- Tutorial videos for *1 · YuE2 · Song* and *2 · YuE2 · Cover*, recorded from the real frontend with the real models: `tools/tutorials/` (Playwright and ffmpeg; English subtitles burned in and as `.srt`; see its README).

## 0.3.0 - 2026-09-29

### Added

- **5 · YuE2 · DAW** - compose the score yourself: draw notes in the **piano roll**, set chord symbols in the chord lane, split the score into sections, and let YuE2 render exactly what you approved. *Score Tools* builds an empty score from the brief (right length, meter and key), the DAW sheet carries a **track panel** (Vocal, Instrument, Chords and a **Guide** track that is played with the score but never sent to YuE2) and both sheets still stop for review.
- **The score editor grew into an editing tool**: a **piano roll** with draw, move, resize (Review mode: into rests, Alt: overwrite), delete (Delete = rest, Shift+Delete = close the gap) and arrow-key nudges; a **chord lane** with inline names; a **navigator** for sections; a **Bar inspector** (insert/duplicate/delete bars, meter of empty bars, key changes); **Undo/redo** and a commit gate that refuses malformed notation with a reason and offers *Revert to last valid*; and **MIDI export and import** (own SMF reader/writer, tracks with a role each, chord symbols read from a Chords track, lossy steps reported).
- **Refine (48 kHz)** - an optional stage between the render and the master: it brings the song to 48 kHz and, with a connected **super-resolution model** (UniverSR, vendored MIT inference code), extends the top octaves and joins them to the original with a complementary crossover - nothing below the crossover changes; *resample only* works without a model. A **preset** list box sets PRE (what the model sees), POST (a roll-off of the result) and the crossover (500 Hz below PRE) in one go - five prepared templates from *1 - pre 6 kHz / post 16 kHz* to *5 - pre 14 kHz / post 21 kHz* - and *custom* uses the three number fields. The model runs whenever it is connected, also for an input that already reaches the top of the band; the report then says that only the content above the crossover changed, and it names engine, preset, bandwidth before/after, crossover and loudness change. Every template has the block as two plain nodes in a REFINE group, so its fields are editable on the node (bypassed; **on** in *3 · MiniMax · Song* with preset 3: pre 10 kHz, crossover 9.5 kHz, post 19 kHz, and the same numbers in the fields). Experimental until the owner's listening check (L1).
- **Stems** - an optional block before mastering: **Separate Stems** (BS-RoFormer 4-stem, vendored MIT inference code) splits the song into vocals, drums, bass and other and keeps the **residual** *rest*, so that the **Stem Mixer** with neutral settings returns the song unchanged. The mixer has a strip per stem (fader, mute/solo, compression, reverb and delay sends), draws the last separation as a waveform on which you **drag muted time ranges**, and writes one JSON value (`plenio.stem_mix/1`) that you can also edit under *Advanced*. The **reverb** bus convolves with a seeded *room*, *plate* or *hall* impulse response; the **delay** bus sends its first echo at the send level, and *feedback* (0 ... 0.8) sets how much of each echo returns, through a low-pass. A mono song keeps mono stems and a mono effect return. A send without its bus is refused, never silently ignored. Experimental until the owner's listening check (L2).
- **The Stem Mixer works before the first run and can write single stems** (owner's review, 2026-09-28): all five strips - vocals, drums, bass, other and the residual *rest* - are there before a separation has run, so the balance can be set up front; a fader writes the value while you drag it (the strip stays under the pointer); and a **save** switch per strip writes that stem as its own 24-bit FLAC into `output/plenio/stems` on the next run (default: off). The file holds the strip's own signal - its gain, compression and muted ranges applied, mute/solo and the shared buses not - and a second run that writes the same stem gets `name (2).flac`, so nothing is overwritten.
- **Brief template panel**: under the template selector in Song Brief and Cover Brief - the *Template fills:* line, what the template suggests, *Copy template text*, *Use template choices* and *Reset all to template*; and **Use my own lyrics** in the Lyrics tab (manual lyrics are never replaced, and the sheet says `lyrics: yours (manual)`).
- **EQ panel on the node**: the curve is now the editor - handles (drag for frequency and gain, Shift for fine, wheel for Q, double-click for 0 dB or a new bell, Delete to remove), a band strip with an inline editor (numbers such as `1.2k` or `+3 dB`; anything else puts the band's value back), *Edit these bands* for match proposals, the last run's spectrum behind the curve, undo/redo, a gain-range switch (±6/±12/±18 dB) and *bands as text*.
- **The piano roll scrolls vertically**: it covers the whole piano range (A0-C8, wider for a note beyond it) in rows of one height and opens centred on the score's notes; the mouse wheel scrolls through the pitches, the pitch names stay on the left and the bar numbers, sections and the chord lane on top, a selected or playing note is scrolled into view, and a drag at the top or bottom edge scrolls along. Before, the roll showed only the notes' range (±4 semitones), squeezed into its height - nothing could be drawn above or below it.
- **The piano roll selects several notes at once**: a **✎ Draw** / **⬚ Select** switch in the roll's toolbar. The roll always opens in Draw: a drag on an empty place draws a note, as before. In Select, the same drag pulls a frame, and every note it touches is selected (Shift adds to the selection). The notation and the ABC text show the framed notes too. **Ctrl+A** selects all notes. Moving, transposing and deleting then act on the whole selection.
- **The Song Sheet window is resizable** (and fills the browser window with one click, or a double-click on its header), and the score editor's panes are draggable: the piano roll's height, the split between the notation and the ABC text, and the width of the navigator column. Window and pane sizes are remembered in the browser (viewer preferences, never in the workflow).
- **Where the run stands, on the nodes**: before a run every Song Sheet that will stop carries a blue **⏸ review stop** badge; after a run every Plenio node shows its result (✓, ⚠ warning, ✖ error), the sheets **⏸ waiting for your approval** or **✓ approved**. The node where the run stopped or failed gets a frame (amber or red) that stays visible when the canvas is zoomed out, and a message says where the run stopped and what to do. A new run clears the previous badges, so they show how far this run got. The line under a sheet's *Edit Song Sheet…* button says the same in words - also in App mode.
- Two measurement tools for the owner's local checks: `tools/studies/sr_study.py` (Refine arms, blind A/B pack) and `tools/studies/stem_study.py` (separation speed, VRAM, the mixer contracts and the listening material).
- Two new model files are catalogued for the new stages: `audio_sr/pytorch_model.bin` (UniverSR, CC BY 4.0 weights) and `audio_separation/model_bs_roformer_ep_17_sdr_9.6568.ckpt` (BS-RoFormer, MIT trainer); ComfyUI's missing-model dialog offers them when a template uses the block. *Load Audio Model* reads checkpoints with `weights_only=True` or as `.safetensors` and refuses a file that pickles anything besides the weights (unpickling it could run code).

### Changed

- **The EQ is much wider in the templates** (980 x 560 in *4 · Enhance & Master*, 620 x 320 in the *Plenio · Master* blueprint) and the nodes to its right moved with it (Loudness 1905, Preview/Export 2490), so nothing overlaps.
- The templates gained the new optional blocks: **REFINE (48 kHz)** in all five (active in MiniMax, bypassed elsewhere) and **STEMS (optional)** in all five (bypassed, collapsed), and *4 · Enhance & Master* now reads *Load Audio → Stems (optional) → Refine (optional) → EQ → Loudness & Dynamics → Export*.
- Plenio now has 18 nodes (was 14): *Load Audio Model*, *Refine (48 kHz)*, *Separate Stems* and *Stem Mixer* (all four marked experimental).
- The Song Sheet review stop now wins over a document error: a run that would stop for approval stops instead of failing (the DAW template's first run needs exactly that).
- The ABC text stays the only stored score; the piano roll, the chord lane and the inspector commit canonical operations, and no graphical edit can write text the upstream parser refuses.
- **Run summaries stay readable**: after a run every node's summary keeps about four lines and scrolls beyond them. Before, the frontend squeezed it into what was left of the node - one clipped line on Score Tools and the EQ - and the brief's *description* field shrank to make room. A node that is too small now grows (never shrinks), and the templates reserve the room, so none of them grows.
- **The optional REFINE block is collapsed while it is bypassed**, like the Stems block (it is expanded where it is on, in *3 · MiniMax · Song*). Every template's About note explains Refine (MiniMax: its preset and how to bypass it), the DAW note gained the Cover Art paragraph, and the Stems paragraph says that the Stem Mixer is inside the block (open it with the icon at the top right of the node).
- **App mode**: the song apps (YuE2 Song, MiniMax, DAW) show the brief's *key* and *meter* - they were *advanced* widgets, which App mode shows as a label without a field; they are regular fields now (the DAW template's empty score follows them). *3 · MiniMax · Song*'s app shows Refine's *preset* (the stage is on there).
- *2 · YuE2 · Cover* opens without the red *Media input missing* toast: its source starts empty, like *4 · Enhance & Master*'s.
- The EQ panel in a match mode says that the bands are fitted to the audio when the workflow runs, instead of an empty curve labelled *applied proposal (0 band(s))* - or, after a switch from *manual*, the manual bands as if they were the proposal.

### Fixed

- Refine's seed changed on every queue: the frontend adds a *control after generate* to every input named `seed` and defaults it to *randomize*, so UniverSR ran again with a new seed each time (no cache, a different result). The seed is *fixed* by default now - the same settings give the same result.
- Templates *1 · YuE2 · Song* and *5 · YuE2 · DAW* made the frontend renumber nodes when they loaded: the Stems blueprint used the node ids of *YuE2 Render* (the Refine blueprint those of *YuE2 Plan*). Every blueprint owns its own id range again, and `tools/workflow_validation.py` now refuses shared ids - between embedded definitions and between blueprint files.
- Nothing on the canvas covers anything else: the super-resolution loader overlapped the top of the Refine node in every template, and the REFINE group overlapped COVER ART in templates 1 and 5. The validator now refuses overlapping nodes and groups.
- The brief panel's buttons (*Copy template text*, *Use template choices*, *Reset all to template*) no longer wrap their labels onto two lines.
- The writer's *Text Generate* node in the templates and in *Write Song* matches ComfyUI v0.37.0 again: the node snapshot had been taken from a ComfyUI checkout past the tag, whose `TextGenerate` has an extra `system_prompt` input and a `thinking` output. `tools/snapshot_node_types.py` now refuses a checkout that is not on a release tag.

- The EQ drag was sticky: the frontend swallows the bubbling `pointerup`, so the `pointermove` listener stayed attached and the band followed the pointer **without a pressed button** and **outside** the curve. The drag now listens in the capture phase, ends on `pointercancel`/`blur`, ends itself when `buttons == 0`, and ignores positions outside the plot. Measured in a real Chromium (Playwright against `tools/dev_server.py`, *4 · Enhance & Master*): the drag moves the band and writes `1601 Hz / +4.0 dB`, and after the release the band no longer follows.
- The EQ panel's handles: a click rebuilt the plot, which detached the handle the pointer had just grabbed and made `setPointerCapture` throw - so the drag never started and a band could only be moved by typing (the owner's second report). The selection now paints without a rebuild, the capture is guarded, and the drag paints live as before. A chosen preset stays visible in the field until the bands are edited by hand (it was cleared immediately), the panel follows a *mode* change again (the frontend replaces the widgets of a DynamicCombo, so the panel re-attaches and re-reads them), and labels, fields and buttons carry tooltips.
- The Stem Mixer's bus settings (*reverb bus*, *delay bus*) are visible from the start - they used to appear only after an interaction - and the panel scrolls instead of silently cutting off its lower rows; the widget asks for the height it needs.
- Dragging a control rebuilt the panel under the pointer: every move in the EQ's curve and on a Stem Mixer fader replaced the handle or the slider that was being dragged, so the drag stopped after the first move (and after a click on an EQ handle, `Delete` no longer reached the band). A drag now paints live and only the release redraws the panel; `Delete` acts on the selected band (`frontend/tests/eqPanel.test.ts`, `stemMixerPanel.test.ts`; owner's report, 2026-09-28).
- The Song Sheet window could be dragged or maximized past the browser window; it is now clamped to the viewport on every resize (and re-clamped when the browser window changes size).
- `duplicate_measures` copies a section only when the block holds all of it; duplicating part of it extends the section instead of creating a second one with the same name (found by a browser check).
- The stem names of *Separate Stems* follow the checkpoint's own instrument order (the released BS-RoFormer lists `drums, bass, other, vocals`); a hardcoded order had labelled every stem as its neighbour. The mixdown was never affected (the residual keeps a neutral mix exact), which is why only a listening check could find it.
- A MIDI round trip of guide notes that share onset *and* pitch came back in an arbitrary order; export, import and the node property now use one canonical order `(onset, pitch, duration)`.

### Notes on this release

- The Refine defaults and the separation's quality are **not** decided here: both stages ship as *experimental*, measured on the owner's machine (L1/L2), with the listening verdicts still open. The measurement reports are in `docs/test-reports/data/`.
- On the two real takes measured so far, Refine's bandwidth rule counts both as full band; with the owner's decision the engine still runs and its contribution stays above the crossover (the report says so). The listening verdict (L1) is still open - see `docs/design/CURRENT_STATUS.md` §5.
- Every input and output of every Plenio node carries a tooltip; `tests/contract/test_node_schemas.py` refuses a node without one.

## 0.2.2 - 2026-09-26

### Added

- **Work mode** - the new first field of Song Brief and Cover Brief:
  - *new song every run* (default of the song templates) / *new cover every run*: every run writes and renders a different song from the same brief without stopping - the brief draws a new *series variation* each run, and the writer is asked for a new title, story, images and hook (with a changing angle for sung songs). Queue several runs (batch count next to Run, App mode *Number of runs*) for a series with one click; every song is exported under its own name. A cover series reuses the source's transcription.
  - *one song, stop to review* / *one cover, stop to review* (default of the cover template): the Song Sheets stop for review; once approved, every run is a new take of the same song.
- Song Sheet *review*: new option **as the brief says** (the new default, used by all templates) - stops in the brief's *stop to review* mode, continues in *every run* and without a brief; *continue* and *stop for review* still override it per sheet. The sheet payload and report hold the rule that applied; `/plenio/sheet/resolve` accepts an optional `brief_mode`.
- **App mode**: the song apps start with the mode and include the Song Sheet buttons (labelled with the sheet's title) - the editor opens from the app, so reviewing and approving work without the graph. **2 · YuE2 · Cover** has an app now (source file, mode, cover style, take seed, both sheets; all takes, the mastered song and the export).
- Song Brief **lengths**: ten options instead of three - *very short (about 1:00)*, *short (about 1:30)*, *about 2:00*, *about 2:30*, *standard (about 3:00)*, *about 3:30*, *about 4:00*, *long (about 4:30)*, *about 5:00*, *very long (about 6:00)*. The writer's section plan and line count, the render headroom and the engines' ceilings follow the seconds; the three earlier names are unchanged, so existing workflows and templates keep their values.

### Changed

- **MP3 tags are ID3v2.3** instead of ffmpeg's default ID3v2.4 (UTF-8): Windows Explorer, Windows Media Player and many players, phones and car radios read no 2.4 tags, so an MP3's embedded cover (and title) did not show there. Embedding a cover into a 2.4 file converts its tag to 2.3; the comment is written as a COMM frame (ffmpeg wrote it as `TXXX:comment`, which players do not show).
- **Cover art is embedded by Plenio itself** into FLAC (picture block) and MP3 (ID3 APIC) - the mastered files and the `(original).flac` - with every tag option (*title only*, *tags*, *copy from loaded file*). The optional GPL package mutagen is no longer used; the System Check lists `faster-whisper` as the optional package instead. Embedding twice replaces the picture, other tags are kept.
- Node summaries (Song Brief, Cover Brief, EQ, Loudness, Score Tools, ...) stay current: ComfyUI re-sends the summary of a cached node on every run (`has_intermediate_output`), and the last summary is kept in the node, so it is back after a reload, a tab switch or App mode. Before, a cached node showed its summary only after the run that executed it.
- Workflows saved with 0.2.0/0.2.1: the frontend inserts the new *mode* of Song Brief and Cover Brief when a workflow is loaded (as *one song/one cover, stop to review* - their earlier behaviour: the same song, new takes); the sheets keep their saved *review*. API-format prompts need the new `mode` input.
- **Draft seed** as its own node in the song and cover templates (group WRITE / LYRICS, and in App mode), linked to *Write Song*: *fixed* (default) keeps the draft, *randomize* writes a new draft every run. Native Generate Text offers no randomize control on its seed.
- A Song Sheet conflict in the mode *new song every run* explains that a series brings a new draft every run (make the document manual, or use the draft).

### Fixed

- Song Brief: a length that is not one of the options - for example `2-3 minutes`, which ComfyUI can carry over from a run of the predecessor toolkit (App mode *Reuse Parameters*, an old job's parameters) - stopped the whole prompt at validation with the same error on every input. A free-form duration now takes the nearest option (`2-3 minutes` -> *about 2:30*), and the node shows a note; text that names no duration is still refused.

## 0.2.1 - 2026-09-25

### Fixed

- Registry icon and banner and the README banner point to the renamed images `assets/branding/icon.png` and `assets/branding/banner.png` (0.2.0 names no longer exist, so the Registry page showed no icon).

## 0.2.0 - 2026-09-25

First public release. Plenio succeeds the [Music Production Toolkit](https://github.com/jplenio/ComfyUI-MiniMax-Music-Production-Toolkit) (formerly *MiniMax Music Production Toolkit*) as a new package with new node IDs; both can be installed side by side.

### Release (0.2.0)

- Version 0.2.0, development status *Production/Stable*; published to the Comfy Registry as `comfyui-plenio-music` (installable from the ComfyUI Manager) by `.github/workflows/publish.yml` when a GitHub release is published.
- The Registry package contains what ComfyUI loads plus the user guide (`.comfyignore`, patterns anchored at the root: an unanchored `assets/` had also dropped `plenio/core/assets`); a CI job packs it with comfy-cli and checks that every runtime file is inside. Templates and blueprints are included by directory, because `git ls-files` quotes their names (`·`) and comfy-cli would have skipped all of them.
- README rewritten for the release: templates, Song Sheet, score editor, covers, mastering, hardware table, installation, the move from the toolkit. Banner, icon and screenshots in `assets/branding/`.
- Demo gallery (GitHub Pages from `docs/`): 35 songs and 8 covers with their SoundCloud links and cover images, made with the predecessor toolkit; the sample song with its prompt report in `assets/sound-samples/`, also used by the S-7 and cover smoke tests.

### Fixed (Phase 10 - final architecture acceptance review, `docs/audit/2026-09-25-phase-10-acceptance.md`)

- CI was red on every commit: the tone-match golden test assumed one CPU's floating-point path (the runners have no AVX-512) and Windows checkouts changed the hash-pinned vendored parser. `.gitattributes` checks text files out with LF everywhere; the test tolerance is CPU-independent; failures are also reported as GitHub annotations (ACC-01).
- The node-type snapshot (`tools/data/node_types.json`) was stale since Phase 9; refreshed (ACC-04).

### Added (Phase 10)

- `resources/schemas/record-1.schema.json`: the release record's pinned schema, checked on a full record and on every record the host tests export (ACC-03).
- Tests: every Score Tools operation through a real server (ACC-05); the snapshot against a fresh server (ACC-04); the engine module interface (`MODULE_INTERFACE`, ACC-06); the catalogue and the record licences stay consistent (ACC-07).
- `docs/dev/extending.md`: where each kind of extension goes and which test catches a forgotten step.

### Fixed (Phase 9 - full codebase audit, `docs/audit/2026-09-25-phase-9-audit.md`)

- A malformed user brief template no longer stops Plenio from loading: unreadable user templates are skipped, logged and listed (`GET /plenio/templates` -> `problems`); saving a template writes only readable files (AUD-01).
- Covers with new lyrics: Transcribe Lyrics no longer forces the ASR to the language of the new lyrics; the Cover Brief decides the language only for original-lyrics covers (AUD-02).
- MP3 export of hi-res audio (88.2-192 kHz) is converted to 44.1/48 kHz for the MP3 instead of failing (AUD-03).
- All files of one export share one name; with collision *number* the whole set is numbered, so an earlier export's record or cover is never overwritten (AUD-04).
- Score analysis and the editor view are now roughly linear in the score length (160 bars: 486 -> 69 ms per view) (AUD-05).
- The System Check reports an invalid Plenio configuration instead of failing (AUD-06).
- Release records no longer redact settings like `max_abc_tokens` or an `author` field (AUD-07).
- Routes answer malformed input with 400 and bound `points` of `/plenio/eq/response` (AUD-08); `m:ss` rounding (AUD-09); cancelling the ASR or a download is a normal ComfyUI interrupt (AUD-10); NaN audio is refused by the encoder and no `.part` file is left behind (AUD-11); written records and covers get the usual file mode (AUD-12); a zero beat period cannot hang the SheetSage2 grid (AUD-13); Check Vocals no longer promises a fade-out in Master (AUD-14); tag copy resolves annotated Load Audio values (AUD-17).
- Removed dead code (`plan_path`, `write_flac`, `flatten_regions`, `describe_fields`).

### Changed (Phase 9)

- The release record is named after the export's base name (`<name>.plenio.json`, also for several takes).
- Cover template: the Transcribe Lyrics widget is labelled *source language (original lyrics: Cover Brief)*.

### Added (Phase 8 - Main workflows, subgraphs and UX)

- Model catalogue `resources/models.toml` (`plenio.core.models`): every model file the templates load, with folder, download URL, size, licence and the templates that need it; the templates' download entries are generated from it.
- Blueprint **Plenio · Cover Art** (FLUX.2 Klein 4B distilled, native nodes, 4 steps): paints a cover from the Song Sheet's artwork prompt; optional (bypassed) in the song templates, with a cover preview; Export embeds it.
- Song templates finish with **Plenio · Master** before Export, which also keeps the unmastered take as `(original).flac`.
- App Mode configurations for *0 · System Check*, *1 · YuE2 · Song*, *3 · MiniMax · Song* and *4 · Enhance & Master* (switch *Graph / App*).
- Template thumbnails (`tools/build_thumbnails.py`); the System Check template is generated like the others.
- **System Check**: which model files each template needs and which are missing or incomplete (with sizes), a model file table, Plenio assets, and the hardware rule table with the row for the machine marked.
- Checks: template rules in the workflow validator (About note, groups, *(optional)* titles, App configuration, thumbnail), catalogue/template consistency tests, `tools/browser_check.mjs` (load, save/reload, optional blocks on/off with server validation, Master bypass, App Mode) and smoke tests S-1, S-2, S-6 and Cover Art for real models.
- Docs: *Models and downloads*, *Troubleshooting*, *App mode*, rewritten *Getting started* and README, updated path guides and licensing; usability review (`docs/design/usability-review.md`); test report `docs/test-reports/2026-09-25-phase-8.md`.

### Changed (Phase 8)

- All templates regenerated: consistent groups (`1 · ...` to `FINISH`), one About note visible on open, the model block collapsed below the main row, *take seed* label; blueprint bodies use their own node-id ranges.
- The System Check warns only about packages ComfyUI itself installs (av, Pillow, scipy); a missing optional package is listed as information.
- CI: the unit job installs numpy, scipy, av and Pillow (as ComfyUI does) and runs mypy with `--python-version 3.12` (the known numpy-stub issue). Without them the job could not have passed since the cover and audio unit tests arrived; CI results are not visible from the cloud session.

### Fixed (Phase 8)

- The frontend no longer renumbers blueprint nodes when a template loads.
- The EQ curve and the node summaries no longer write a value into saved workflows.
- Cover template: the lyrics language widget of Transcribe Lyrics, which the Cover Brief overrides, is labelled so.

### Added (Phase 7 - Audio production chain)

- `core.audio`: BS.1770-4 loudness (K-weighting exact at 48 kHz, gating), EBU Tech 3342 loudness range, 4x-oversampled true peak; band-edge Kaiser resampler; RBJ biquad EQ with response, spectral profile and tone-match fit; compressor, oversampled lookahead limiter and loudness targeting with budgets (ported from the legacy toolkit v3.1.3, checked against its outputs).
- Nodes **EQ** (flat / manual bands / match preset / custom match, reference input; curve widget under the node: drag, wheel = Q, double-click adds a band) and **Loudness & Dynamics** (5 targets or custom, 12 compression styles or custom, output rate 44.1/48 kHz or keep); presets in `resources/presets/`; routes `GET /plenio/presets/{kind}` and `POST /plenio/eq/response`.
- **Export Release**: MP3 VBR V0 and WAV 32-bit float next to FLAC 24-bit; tags (typed, or copied from the loaded file), cover art (JPEG next to the audio; embedded into FLAC/MP3 when the optional `mutagen` is installed), the original take as `(original).flac`, measured loudness and tags in the release record.
- Blueprint *Plenio · Master*; template **4 · Enhance & Master**.
- Tests: DSP regression suite (`tests/unit/test_audio.py`: BS.1770 table, EBU cases, pyloudnorm oracle, true peak, resampler pass/stop band, analytic EQ responses, compressor curve, limiter ceiling, golden legacy outputs, targeting budgets), format round trips (`tests/unit/test_release_formats.py`), host tests of the chain incl. bypass identity (`tests/host/test_production_path.py`), smoke S-7 (`tests/host/test_master_smoke.py`), Vitest for the curve helpers. Restoration-gate study script `tools/studies/restoration_gate.py`.
- Docs: user guide *4 · Enhance & Master*, concept page *Mastering and audio formats* (methods and limits), help pages of EQ, Loudness & Dynamics and Export Release; test report `docs/test-reports/2026-09-25-phase-7.md`.

### Changed (Phase 7)

- Export Release has new widgets (*flac*, *mp3*, *wav*, *tags*) and optional *title*, *original* and *cover* inputs; templates 1-3 were regenerated. Workflows saved from the earlier templates keep their Export widget values by position - re-add the Export node or start from the new template.
- 24-bit export scales by 2^23 (decoder convention) instead of 2^23-1, so a 24-bit source is written back sample-exact.

### Fixed (Phase 7)

- Sample-rate conversion no longer aliases content just above the new Nyquist frequency (the legacy converter let a 23 kHz tone through as a -6 dB alias at 21.1 kHz when converting 48 to 44.1 kHz).

### Added (Phase 6 - MiniMax Music 3)

- `core.engines.minimax`: structured caption rules (Global Metadata, Vocal Details, Arrangement), exact 5 000-token prompt budget through the loaded text encoder (estimate without it), render ceiling at most 360 s, instrumental conventions (tags-only section map about twice as long as a sung song's, Vocal Details `n/a`).
- Engine Profile detects MiniMax Music 3 (CLIPLoader type `minimax`).
- Blueprints *Plenio · MiniMax Model* and *Plenio · MiniMax Render* (native nodes, 30 steps, optional tiled decode); template **3 · MiniMax · Song**.
- Writing: multi-line captions are kept by Parse; the editor labels the style document *Caption* for engines that call it so.
- Tests: MiniMax unit and host tests; contract test for the real tokenizer and smoke test S-5 (owner's machine). Docs: user guide *3 · MiniMax · Song*; test report `docs/test-reports/2026-09-25-phase-6.md`.

### Fixed (Phase 6)

- The Song Sheet's budget summary no longer assumes YuE2 fields.

### Added (Phase 5 - Score / ABC editor; done 2026-09-25)

- Score core: element view with ids and text positions (`core.score.model`), tolerant positions and diagnostics with line and bar range (`core.score.positions`), editing operations with invariant checks (`core.score.edit`: pitch, length, rest/note, chords, section rename/move/split/join), operation registry (`core.score.operations`); `/plenio/score/analyze` returns the element view and `display_abc`, `/plenio/score/transform` the new operations.
- Song Sheet: optional `reference_audio` input for A/B listening (display only); the Cover template connects the source.
- Song Sheet editor: tabs; score tab with abcjs notation, CodeMirror ABC text (lint markers), navigator, operation palette with shortcuts, undo/redo, playback with cursor (offline WebAudio tones), voice switches, speed, section loop, A/B with the source; lyrics fit per section; Revert and a close confirmation.
- Bundled libraries: abcjs 6.7.1, CodeMirror 6 (MIT; `THIRD_PARTY.md`). Dev tooling: happy-dom 20.14.5 (security update).
- Tests: `tests/unit/test_score_editor.py` (162), `frontend/tests/scoreEditor.test.ts` (31), host tests for the score routes, an editor-edited score in the Song path, section edits and `reference_audio` in the Cover path.
- Docs: user guide *Score editor*, Song Sheet concept and help page, test report `docs/test-reports/2026-09-25-phase-5.md`.

### Fixed (Phase 5)

- Score editor: a burst of typing is one undo step again, and a palette operation no longer triggers a second analysis (the session's document watcher runs synchronously).
- Playback from a bar starts with that bar's first note, and the cursor marks one note at a note boundary (1 ms time tolerance for the backend's rounded times).
- `display_abc` writes a letter's accidental again after an inline key change in the same bar.
- Clearer refusal when a chord symbol would start inside a Vocal note or rest.

### Added (Phase 4B - YuE2 Cover)

- **2 · YuE2 · Cover** template: Source -> (Excerpt) -> Transcribe Score -> Score Tools -> Song Sheet · Score -> Transcribe Lyrics / Write Song / section tags -> Song Sheet · Text -> YuE2 Takes -> Check Vocals -> Export; both sheets stop for review; instrumental adapter on for instrumental covers (lazy switch).
- Nodes: **Cover Brief** (instrumental / original lyrics / new lyrics, harmony new or kept), **Transcribe Score** (SheetSage2 ABC identical to the native node plus the beat grid, `PLENIO_TIMELINE`; stops sources a 16 GB card cannot transcribe), **Transcribe Lyrics** (faster-whisper large-v3 in a worker, only over the sung regions, fixed seed, disk cache, beat-grid placement with the pickup rule, invention filters, sung-lyrics check), **Check Vocals** (SheetSage2 vocal notes, calibrated on the owner's listening; best take, ranked takes, ending check).
- Blueprints: *Plenio · Transcribe Score*, *Plenio · YuE2 Takes* (native loop, N takes, starts with the final lyrics).
- Score Tools: *fit length*; *prepare from brief* handles covers, instrumental plan length and truncated plans.
- Song Sheet: `section_tags` output, `timeline` input; cover checks for sections, syllables per note and voice range; editor shows the word diff against the draft, the ASR's unsure and left-out words and the source's section times.
- Writing: cover prompts (original lyrics: no lyrics written; new lyrics: per-line syllable targets from the source's sectioned lyrics; the melody's register and tempo).
- Route `GET /plenio/asr/notes/{draft_sha256}`; asset `faster-whisper-large-v3` with `[asset_paths]` to use an existing folder.
- Docs: user guide *2 · YuE2 · Cover*, concept pages *Song Sheet* and *Instrumental*, help pages of the new nodes; test report `docs/test-reports/2026-09-25-phase-4b.md`; Qwen3-ASR evaluation (`tools/studies/asr_qwen3.py`).

### Changed (Phase 4B)

- Instrumental songs are conditioned with the single tag `[instrumental]` (owner's listening verdict).
- Release records keep only class, inputs and title of each prompt node (loop nodes put NaN fingerprints into the prompt) and list the licences of SheetSage2 and the instrumental adapter when the workflow references them.
- Voice types (soprano ... baritone) count as vocal character in styles; instruments named after them do not.
- The length warning of instrumental plans points to *fit length* instead of the lyrics.

### Fixed (Phase 4B)

- Workflows with a Plenio DynamicCombo node (e.g. Score Tools *fit length*) reload with their values (works around a frontend 1.53.6 restore defect).

### Design gate (Phase 4A - YuE2 Cover and Instrumental)

- Final specifications in `docs/design/yue2-cover-design.md` and `docs/design/instrumental-strategy.md`: data flow, lyrics and score precedence, user modes, backend contracts (new node *Transcribe Score*, type `PLENIO_TIMELINE`), frontend implications, validation strategy, test matrix, failure modes and open assumptions; study data in `docs/test-reports/2026-09-25-phase-4a.md`.
- Study scripts in `tools/studies/` (SheetSage2 timeline, faster-whisper WER, lyrics alignment, cover budget, YuE2/Gemma render matrix, take evaluation). No product code changed.
- CI checks out ComfyUI from its new home `Comfy-Org/ComfyUI`.

### Added (Phase 3 - YuE2 Core)

- **1 · YuE2 · Song** template: Song Brief -> Write Song -> Song Sheet · Text -> YuE2 Plan -> Score Tools -> Song Sheet · Score -> YuE2 Render -> Export Release.
- Nodes: **Song Brief** (239 templates imported from the legacy library, cleaned and translated to English), **Engine Profile**, **Compose Writing Prompt**, **Parse Song Draft**, **Song Sheet** (auto/edited/manual documents, conflicts, validation, review gate), **Score Tools** (prepare from brief, strip chords, voices, transpose, tempo), **Export Release** (FLAC 24-bit, naming, release record).
- Blueprints: *Plenio · YuE2 Model* (with an optional instrumental adapter, bypassed), *Plenio · Write Song* (native Generate Text), *Plenio · YuE2 Plan*, *Plenio · YuE2 Render*.
- `plenio.core`: native two-voice ABC analysis and operations with invariant checks, sectioned lyrics, song briefs and templates, YuE2 rules with the exact context budget, writing prompts and robust draft parsing, Song Sheet evaluation, release naming/FLAC/records with secret redaction.
- Routes: `/plenio/score/analyze`, `/plenio/score/transform`, `/plenio/lyrics/analyze`, `/plenio/sheet/resolve`, `/plenio/templates`.
- Song Sheet editor (minimal): documents with states, live validation, Apply, Make manual, Use draft, conflict resolution, Approve.

### Added (Phase 2 - Foundation)

- Package skeleton with a V3 ComfyUI entry point, `plenio.core` (pure) and `plenio.comfy` (adapters).
- Core foundations: error taxonomy, canonical hashing, reports (`plenio.report/1`), configuration (`config.toml` and `PLENIO_*` variables), Song Sheet state (`plenio.sheet_state/1`) with resolution rules and approval fingerprints, asset catalogue with offline policy and resumable downloads, out-of-process worker protocol.
- **System Check** node, `GET /plenio/system` route and the *0 · System Check* template.
- Frontend extension (TypeScript, Vite) with the `PLENIO_SHEET_STATE` widget and rendered node summaries.
- Test suites: unit, contract, import boundary, workflow/blueprint validation, host integration against a real ComfyUI server, frontend (Vitest).
