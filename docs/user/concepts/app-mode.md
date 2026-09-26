# App mode

ComfyUI's **App mode** hides the node graph and shows a form: the chosen controls on the right, the results below, and a *Run* button. Every Plenio template comes with an app configuration.

Switch with **Graph / App** at the top left of the canvas (ComfyUI shows a short tour the first time). Switching back to the graph keeps everything you set.

| Template | The app shows | Results |
|---|---|---|
| 0 · System Check | detail | the System Check report |
| 1 · YuE2 · Song | **mode**, template, description, genre, mood, tempo, length, vocals, language, voice, theme, take seed, the buttons **Song Sheet · Text** and **Song Sheet · Score** | the mastered song (preview) and the export summary |
| 2 · YuE2 · Cover | the source file, **mode**, template, description, genre, mood, vocals, melody, lead instrument, harmony, take seed, the buttons **Song Sheet · Score** and **Song Sheet · Text** | all takes, the mastered song and the export summary |
| 3 · MiniMax · Song | as 1 · YuE2 · Song, with one button **Song Sheet** | the same |
| 4 · Enhance & Master | the audio file, EQ, loudness target, compression | the mastered song and the export summary |

## The mode in the app

- **new song every run** / **new cover every run**: set **Number of runs** above the *Run* button and press it once - every run writes and renders a different song from the brief, without stops. Each song is exported under its own title.
- **one song, stop to review** / **one cover, stop to review**: the run stops at a Song Sheet (the results stay empty and the button's line reads *waiting for approval*). Press the sheet's button - the same Song Sheet editor as in the graph opens - check or edit the documents, press **Approve**, and press *Run* again. YuE2 stops twice: first at the text, then at the score (the cover: first the score, then the text). Once approved, every further run is a new take of the same song.

## What to know

- The app runs the whole template, including the Song Sheets with their current settings. A sheet that stops - for review, with a conflict between your edit and a new draft, or with an invalid document - says so on its button; open it from there.
- The app shows the options of the default *vocals* choice: a **sung** song in the song templates, **instrumental** in the cover template. The options of the other choices (for example melody and lead instrument of an instrumental song, or the language of new cover lyrics) are set in the graph view - ComfyUI's App mode does not show options of a choice that is not selected.
- Model files, the writer model, mastering targets and export formats are set in the graph; the app keeps them.
- The take seed is set to *randomize*, so every run is a new take; in the mode *one song, stop to review* the documents stay cached as long as the brief is unchanged.

*Build an app* (top bar) lets you change which controls the app shows; ComfyUI saves your choice in the workflow.
