# Song Sheet

The single place that decides which documents condition the music model. What leaves the sheet reaches the model unchanged, and the release record stores exactly these texts.

Press **Edit Song Sheet…** to see and edit the documents:

- **auto** - the upstream draft is used.
- **edited** - your edit is used while its draft is unchanged. When the draft changes, the run stops with a **conflict** so that your edit is never replaced silently.
- **manual** - your text is always used and the upstream draft is not computed (for lyrics in a cover: the ASR does not run).

**review** = *stop for review* holds the documents back until you **Approve** exactly what you see.

The sheet validates the documents with the rules of the connected engine (style, lyrics, score, exact token budget). With MiniMax Music 3 the style document is the **caption** (Global Metadata, Vocal Details, Arrangement); caption and lyrics must stay under 5 000 tokens, counted exactly with the loaded text encoder, and the render ceiling follows the brief (at most 6:00). For a score it also outputs the render mode (chords -> full, otherwise melody), a render ceiling derived from the score's length and the score's **section tags** (the lyrics of an instrumental cover).

For covers (the score comes from *Song Sheet · Score* as context) the text sheet also checks:

- the lyrics' sections against the score's sections;
- whether each section's lyrics have about one syllable per melody note - far fewer or more and YuE2 does not sing the words clearly;
- whether the voice in the style fits the melody's range (YuE2 sings the melody as written).

In the editor you also see what changed against the draft (word by word), the words the lyrics ASR was unsure about, and - with a **timeline** connected - the sections of the source with their start and end times.

**Score tab** (when the sheet owns a score): the notation and the ABC text side by side, always the same score. Click a note and change it with the palette or the keyboard (↑/↓ semitone, Shift+↑/↓ octave, `[`/`]` shorter/longer, R rest, N note, ←/→ next note, Ctrl+Z/Ctrl+Y undo/redo); rename or move sections in the navigator; play the notes from the selected bar (simple tones, a guide to the notes) and, with **reference_audio** connected, the source recording from the same bar (A/B). Every edit is checked; one that would break a bar is refused with the reason, and errors in the ABC text are marked at their bar.

**reference_audio** (optional, display only): a recording to listen to in the editor, usually the cover's source. The sheet saves a temporary copy for the editor's player; it is not a document, does not change the fingerprint, and the recording is not stored in the release record.
