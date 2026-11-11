# Recipes

Six short workflows made from the templates, for things one does again and again. They ship in `example_workflows/recipes/` inside Plenio's folder (ComfyUI's template browser lists only the numbered templates): open one with *Workflow › Open* or drag the file onto ComfyUI. Each has a *Recipe* note that says what to change.

| Recipe | What it does | Made from |
|---|---|---|
| **A series from a list of briefs** | one song per line of **Brief List**: set the batch count beside *Run* to the number of lines and press *Run* once | 1 · YuE2 · Song |
| **Two music models from one brief** | YuE2 and MiniMax Music 3 each write and render a song from the same brief - to hear which suits an idea | 1 · YuE2 · Song and 3 · MiniMax · Song |
| **A cover in three styles** | the same recording covered in three genres, one per run | 2 · YuE2 · Cover |
| **The same lyrics in three genres** | your lyrics, sung as written, in a new genre every run | 1 · YuE2 · Song |
| **A song with stems for a DAW** | the Master block saves the take's stems (vocals, drums, bass, other) next to the song | 1 · YuE2 · Song |
| **Master a folder of files** | the files named in **Brief List** - recordings in ComfyUI's input folder - mastered one per run with **Load Audio by Name** | 4 · Enhance & Master |

**Brief List** takes its lines from its *entries* field or from a text file in the input folder; *index* on *increment* takes the next line every run. The examples in the recipes are invented - put your own briefs, styles, lyrics and file names.
