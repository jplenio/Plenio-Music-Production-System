# Preset

Sets the template's fields for one way of making a song - the same six presets as the Plenio Player's *Make a song* and the Song API's `"preset"`:

| Preset | What it sets |
|---|---|
| `best` - Best quality | HQ mastering and cover art on, lyrics fidelity *highest - best of 3 takes* (the player and the API also save an MP3) |
| `party` - Party - fast | about 1:30, cover art on, HQ mastering off, lyrics fidelity *standard* |
| `sketch` - Quick sketch | about 1:00, cover art and HQ mastering off, lyrics fidelity *standard* |
| `full` - Full song | about 3:00, HQ mastering and cover art on, lyrics fidelity *high - best of 2 takes* |
| `takes` - Three takes | cover art on (the player makes three takes; in a template, set the batch count beside *Run*) |
| `instrumental` - Instrumental | vocals *instrumental*, cover art on |

Choosing one changes the fields in the nodes - the Song Brief's length, vocals and lyrics fidelity, the *HQ Mastering & Cover Art* cards - where you see them; **Ctrl+Z** takes the change back. A field the template does not have is left alone. `none` sets nothing.

The node does nothing when the workflow runs: it has no outputs. The presets live in one file, `resources/presets/make.json`.
