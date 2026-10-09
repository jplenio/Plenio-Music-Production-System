# Transcribe Lyrics

Transcribes the sung words of a recording with **faster-whisper large-v3** (in a separate process) and places them into the **final score's sections** on the beat grid. The result is a *draft*: the Song Sheet decides what is used, and your corrections there always win.

- **audio** - the source recording (or a take, see the check below).
- **engine** - *faster-whisper large-v3*, run in a separate process.
- **score** - the final score from *Song Sheet · Score*: its sections become the lyrics' tags. Edit a section name in the score and the draft follows. Copy, move or delete sections and the words follow their bars: a copied chorus gets the chorus words again, a deleted section's words are left out (reported). This needs a timeline from this version of *Transcribe Score*.
- **timeline** - from *Transcribe Score*: only the parts where somebody sings are transcribed, and words land in the bar where they are sung (a word sung just before a section starts - a pickup - belongs to the new section).
- **brief** - for an *original lyrics* Cover Brief its language (the source's) is used; otherwise the **language** widget (auto, a name or a code) names the language of the singing in this recording. For *new lyrics* the brief's language is that of the new text, so it is not used here.
- **device** (advanced) - auto uses the GPU and falls back to the CPU (about 0.6 x the audio length) with a warning.

Outputs: **lyrics** (the sectioned draft; in the check below the lyrics as heard), **transcript** (the plain text), **language** (detected or given) and the **report**.

What it leaves out, and says so in the report: words far from any sung note (inventions), very short, very unsure segments that Whisper is known to invent at the end of a passage ("Thank you."), and the sentences Whisper learnt from subtitled video and writes into music wherever it stands ("Untertitelung des ZDF für funk, 2017", "Vielen Dank fürs Zuschauen", "Amara.org" ...), with a year on its own right after one.

**Reproducible:** every result is stored on disk under the source's hash, the sung regions, the model revision and the settings. A later run - also after a restart - gives the same draft without running the ASR again, so an edited lyrics document stays valid.

**Song Sheet editor:** the editor shows the words the ASR was unsure about and what it left out, next to the draft.

**Sung-lyrics check:** connect a take to **audio** and the lyrics it was given to **expected_lyrics**. The node then reports the word error rate overall and per section and names sections that were not sung as written (a warning, not an error).

The model (3 GB, MIT licence) is fetched on first use; point `[asset_paths]` in the Plenio configuration at an existing folder to use a copy you already have.
