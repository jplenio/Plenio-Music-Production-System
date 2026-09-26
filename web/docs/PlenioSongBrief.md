# Song Brief

The intent of a new song. It is the only place where the *work mode*, *sung or instrumental* and the *length* are chosen.

- **mode** - how the runs of this workflow behave:
  - *new song every run* - every run writes and renders a **different song** from this brief (a new *series variation*: the writer is asked for its own title, story, images and hook). Song Sheets set to *as the brief says* do not stop. Set the batch count next to **Run** (App mode: *Number of runs*) to make a whole series with one click.
  - *one song, stop to review* - the brief stays the same, so its song is written once: Song Sheets set to *as the brief says* stop until you **Approve** the documents, and later runs are new takes of the approved song.
- **template** - a starting point from the template library. Text fields you leave empty are taken from the template; selecting a template never overwrites what you typed.
- **description, genre, mood, tempo** - what the song is and how it sounds. Sent to the writing model.
- **length** - from *very short (about 1:00)* in half-minute steps to *about 5:00*, and *very long (about 6:00)*; *standard (about 3:00)* is the default. Guides the song form and how much the writer writes (YuE2's plan follows the amount of lyrics) and sets the render ceiling without a score (MiniMax Music 3 renders at most 6:00). A free-form value such as *2-3 minutes* (from older workflows) takes the nearest option, with a note.
- **vocals** - *sung* (language, voice character, lyrics theme) or *instrumental* (the instrument plays the lead melody, or accompaniment only; optional lead instrument).
- **key, meter** (advanced) - optional musical constraints.

Outputs: the brief, a readable summary, a render headroom for the length, and whether the song is instrumental. The node's summary shows the mode and, in *new song every run*, the variation of the current run.
