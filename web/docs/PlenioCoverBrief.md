# Cover Brief

The intent of a cover. Melody, song form and tempo come from the source recording; the brief says what the new version sounds like and what happens to the vocals and the harmony.

- **template** - an optional target style. Style fields you leave empty are taken from the template (never the language).
- **description, genre, mood** - the target style. At least a genre or a description is needed.
- **vocals**
  - *instrumental* (default) - an instrument plays the vocal melody (*instrument plays the lead*, optional **lead instrument**) or *accompaniment only*.
  - *original lyrics* - the source's lyrics, transcribed by *Transcribe Lyrics*. **language** *auto* detects it; **voice** describes the new singer.
  - *new lyrics* - new words on the source's melody: **language**, **voice**, **theme**; **phrasing reference** lets the writer see the source's transcribed lines (runs the lyrics ASR) and gives it a syllable target per line.
- **harmony** - *new accompaniment* removes the source's chords so YuE2 re-harmonises (melody mode); *keep original chords* keeps them (full mode).
- **title** (advanced) - a fixed title, otherwise the writer proposes one.

The brief does not decide which lyrics text is used in the end: that is the job of the **Song Sheet**, where manual text always wins.

Outputs: the brief, a readable summary, *use_source_lyrics* (original lyrics) and *instrumental* - the two switches of the Cover template.

Choose a **voice that fits the melody's range**: YuE2 sings the melody as written. A high (female) melody sung by a "male baritone" became hard to understand in the Phase 4B tests; the Song Sheet warns about it.
