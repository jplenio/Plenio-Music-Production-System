# App mode

ComfyUI's **App mode** hides the node graph and shows a form: the chosen controls on the right, the results below, and a *Run* button. Plenio's templates come with an app configuration for the paths that need no review.

Switch with **Graph / App** at the top left of the canvas (ComfyUI shows a short tour the first time). Switching back to the graph keeps everything you set.

| Template | The app shows | Results |
|---|---|---|
| 0 · System Check | detail | the System Check report |
| 1 · YuE2 · Song | template, description, genre, mood, tempo, length, vocals, language, voice, theme, take seed | the mastered song (preview) and the export summary |
| 3 · MiniMax · Song | the same | the same |
| 4 · Enhance & Master | the audio file, EQ, loudness target, compression | the mastered song and the export summary |
| 2 · YuE2 · Cover | no app | the cover path stops twice for review, which needs the Song Sheet editor |

What to know:

- The app runs the whole template, including the Song Sheets with their current settings. If a sheet is set to *stop for review*, or has an edit that now conflicts with a new draft, the run stops there - switch to the graph and open the sheet.
- The app shows the options of a **sung** song. For an instrumental, choose *instrumental* under *vocals*; its own options (melody, lead instrument) are set in the graph view (ComfyUI's App mode does not show options of the choice that is not selected).
- Model files, the writer model, mastering targets and export formats are set in the graph; the app keeps them.
- Each run is a new take (the take seed is set to *randomize*); the documents stay cached as long as the brief is unchanged.

*Build an app* (top bar) lets you change which controls the app shows; ComfyUI saves your choice in the workflow.
