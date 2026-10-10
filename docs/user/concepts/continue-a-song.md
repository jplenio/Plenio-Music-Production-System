# Continue a song

Every export writes a **release record** next to the song: `<name>.plenio.json`. It holds what the song was made with - its title, style, lyrics and score, the settings and seeds of the run, the reports - and, since 0.6.0, the **workflow** itself. Open the record again and you are back where you stopped: the workflow the song was made with, its documents in the Song Sheets.

## Opening a record

- **File > Continue a Plenio song…** lists the songs in ComfyUI's output folder, newest first, with their cover, date, length and the Plenio version they were made with. Search by title, folder or date, listen with ▶, and press **Continue**. *Open a record file…* takes a record from any other folder.
- Or **drag the `.plenio.json` onto ComfyUI**. (Dropped as a plain workflow, ComfyUI would load nothing from it.)

The song opens in a new workflow tab named after it. A message says what was restored.

## What comes back

- **The workflow.** A record made with 0.6.0 or later keeps the workflow it was queued with: every setting, every seed, the blocks you had on or off, the lyrics lines you placed by hand and the Guide notes. A record from an earlier version has the run's settings but not the workflow: it opens in **today's template** of that kind (*1 · YuE2 · Song*, *2 · YuE2 · Cover* ...) with the song's settings - found by what each node is (*Take seed*, *Song Sheet · Text* ...), so they land in the right place although the templates changed since. The few nodes today's template no longer has are named in the message.
- **The documents, kept.** Title, style, lyrics and score go into the Song Sheets as *manual*: the next run uses them as they are instead of writing and planning anew. An approval the sheet had stays valid as long as the documents are the ones approved.
- Seeds stay as they were: run again unchanged and you get the same takes.

## Going on from there

| You want | Do |
| --- | --- |
| new takes of the same song | change the **take seed** (or set it to *randomize*) and run |
| a changed melody, chords or form | open **Edit Song Sheet…** - the score editor - and run |
| new lyrics, or a new score from the writer or the plan | press **Back to auto** for that document in the Song Sheet and run (change the draft or plan seed for a different one) |
| the same song mastered or split anew, without a new render | *4 · Enhance & Master* with the song's `(original).flac` |

## Limits

- A record from a **workflow of your own** (not a Plenio template) made before records kept the workflow cannot be rebuilt. Its title, style, lyrics and score then go into the Song Sheets of the workflow that is open - open the template you want first.
- The **files the workflow reads** must still be there: a cover's source recording in ComfyUI's `input` folder, the model files. ComfyUI says when one is missing.
- The record keeps the workflow with the secrets redacted (as the prompt in it): an API key in a node of the workflow is not stored, so enter it again before running.
