# Song Sheet

The single place that decides which documents condition the music model. What leaves the sheet reaches the model unchanged, and the release record stores exactly these texts.

Press **Edit Song Sheet…** to see and edit the documents:

- **auto** - the upstream draft is used.
- **edited** - your edit is used while its draft is unchanged. When the draft changes, the run stops with a **conflict** so that your edit is never replaced silently.
- **manual** - your text is always used and the upstream draft is not computed.

**review** = *stop for review* holds the documents back until you **Approve** exactly what you see.

The sheet validates the documents with the rules of the connected engine (style, lyrics, score, exact token budget). For a score it also outputs the render mode (chords -> full, otherwise melody) and a render ceiling derived from the score's length.
