# Compose Arrangement

> **Experimental.** Creative modes and the closeness sliders can give unexpected results - a chord that surprises, an instrument line that does not fit every song, a plan that is not applied. They are meant for experimenting first: try a mode, listen, change the score in the Song Sheet or run again with another *arrangement seed*, and keep what you like. *off* is the dependable choice.

The arrangement prompt of the brief's **creative mode** (Song Brief / Cover Brief *arrangement*). It shows the writer the score as a table - every section with its bars, its chords, the melody notes on the strong beats and what the instrument line plays now - the mode's rules, the closeness slider in words and the exact answer format: a small **JSON plan**, never notes or ABC.

- **score** - the score to arrange (in the templates: after *Score Tools · prepare from brief*).
- **brief** - the creative mode and its closeness: *genre closeness* for a song, *song flow closeness* for a cover.
- **engine** (optional) - the music model, named in the prompt.
- **style**, **lyrics** (optional) - the song's style and lyrics, for the mood (a cover's are written later).

Outputs: **prompt** for a writer (*Generate Text* or *Local LLM*) and **schema**, the JSON schema of the answer. Connect the schema to *Local LLM*: GGUF files, LM Studio, Ollama and vLLM are then held to it while they write, so the answer always has the plan's format.

With arrangement *off*, for a cover kept at its original song flow (closeness 95 or more) and without a score, the prompt is empty - and since *Apply Arrangement* does not ask for an answer then, neither this node nor the writer runs.

The block *Plenio · Arrange* contains this node, the writer branches and *Apply Arrangement*. See the user guide *Creative modes*.
