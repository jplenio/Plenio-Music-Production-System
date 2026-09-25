# Song Brief

The intent of a new song. It is the only place where *sung or instrumental* and the *length* are chosen.

- **template** - a starting point from the template library. Text fields you leave empty are taken from the template; selecting a template never overwrites what you typed.
- **description, genre, mood, tempo** - what the song is and how it sounds. Sent to the writing model.
- **length** - short (about 1:30), standard (about 3:00) or long (about 4:30). Guides how much the writer writes; YuE2's plan follows the amount of lyrics.
- **vocals** - *sung* (language, voice character, lyrics theme) or *instrumental* (the instrument plays the lead melody, or accompaniment only; optional lead instrument).
- **key, meter** (advanced) - optional musical constraints.

Outputs: the brief, a readable summary, a render headroom for the length, and whether the song is instrumental.
