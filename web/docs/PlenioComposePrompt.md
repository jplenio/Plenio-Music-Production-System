# Compose Writing Prompt

Builds the writing prompt from the brief and the rules of the loaded music model: style conventions, lyrics format, section order and roughly how many lines fit the target length. Connect **prompt** to any text-generation node (the templates use the native *Generate Text*) and **request** to *Parse Song Draft*.

- **score** (optional) - when a score is connected, the lyrics must follow its sections.
- **detail** (advanced) - concise, standard or rich lyrics.

For a **Cover Brief** the prompt is written against the final score:

- *original lyrics* - the writer writes title, style and artwork only; the lyrics come from *Transcribe Lyrics*. **language** is requested from it only when the brief says *auto*.
- *new lyrics* - the lyrics must fit the melody: the same sections, one line per phrase, one syllable per note. With the brief's *phrasing reference*, **reference_lyrics** (the ASR draft) gives a syllable target for every line.
- *instrumental* - no lyrics are written; the score's section tags are used.

The prompt also names the source's tempo and, when the melody lies clearly high or low, which voice fits it.
