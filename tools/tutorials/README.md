# Tutorial videos

Scripts that drive the real ComfyUI frontend with Plenio and the real models in Chromium, record the
screen and cut a finished 1920 x 1080 video with English subtitles:

| Script | Video |
|---|---|
| `yue2-song.mjs` | **1 · YuE2 · Song**: open the template, a run straight through (*new song every run*), then *one song, stop to review*: Song Sheet · Text (the tabs, Approve), Song Sheet · Score with the score editor (the lyrics lane, editing a line where it is sung, notes, the cursor and playback, copy and paste, arranging sections - a duplicated chorus is kept - MusicXML and the project file, Approve), Song Sheet · Text again with the lyrics that followed the chorus, and the finished song |
| `yue2-cover.mjs` | **2 · YuE2 · Cover**: load a recording, an instrumental cover straight through (*new cover every run*), then *one cover, stop to review* with the original lyrics: Song Sheet · Score with the score editor (notes, the cursor with A/B against the source, a duplicated section that is kept, the files, Approve), Song Sheet · Text (the transcribed words over their notes, the score still editable there, Approve) and the finished cover |

The runs are real: the songs in the videos are rendered while they are recorded (on an RTX 5060 Ti a
run takes about two minutes). Waiting is fast-forwarded in the edit, with a speed badge in the caption
band. The videos have no sound; the rendered songs are in the server's output folder.

## What it needs

- ComfyUI with its Python environment and the models of the two templates (the dev server below uses
  them through `--models`, read only).
- Node.js and Playwright with its Chromium (`PLAYWRIGHT_MODULE=<folder of the playwright package>` when
  it is not installed globally).
- `ffmpeg` with libass (the `subtitles` filter) on the PATH.

## Recording

Start an isolated ComfyUI with Plenio on the GPU (a scratch base folder: the user's ComfyUI, its custom
nodes, settings and outputs are not touched):

```bash
PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <ComfyUI python> tools/dev_server.py --gpu --port 8190 --base <scratch folder> --models <ComfyUI models folder>
```

Then record and edit one video (about 15 minutes each, most of it rendering):

```bash
node tools/tutorials/record.mjs yue2-song --url http://127.0.0.1:8190 --out dist/tutorials
node tools/tutorials/record.mjs yue2-cover --url http://127.0.0.1:8190 --out dist/tutorials
```

`record.mjs` sets a few viewer settings on that server first (English, no minimap, no node source
badges, no canvas info, no selection toolbox, full-quality drawing when zoomed out). `--render-only`
cuts the video again from an existing recording; `--headed` shows the browser.

Output in `--out` (`dist/` is not committed):

- `<name>.mp4` - the video with the English subtitles burned into the caption band
- `<name> (no subtitles).mp4` - the same without the subtitles (for your own captions)
- `<name>.en.srt` - the subtitles as a file (YouTube, video editors)
- `<video>/raw.mp4`, `markers.json` - the real-time recording and its markers (re-cut with `--render-only`)

## How the scripts are built

`lib/studio.mjs` opens the browser (1920 x 1000; the edit adds an 80 px caption band below) and gives
the scripts a small vocabulary: `click`, `hover`, `drag`, `type`, `keys` (shown on screen), `spotlight`,
`fly*` (smooth camera moves over the graph), `chooseCombo`, `run` and `follow` (waits for the run, the
camera follows the running node, every stage becomes a fast-forwarded piece with its caption), and the
markers `caption`, `chapter`, `card` (title, chapter and end cards) and `fast`. Nodes are found by title
or type - a template opened from the browser gets string ids.

`lib/sheet.mjs` holds the Song Sheet parts: open a sheet, walk its tabs, approve, fix the sections when
the sheet warns that they do not match the lyrics (that edit stays), and the note-editing scene, which
shows the tools on an example and undoes each change, so the rendered song keeps the model's melody.

`lib/scenes.mjs` holds the score editor's scenes of 0.4: the overview with the lyrics lane, a lyrics
edit, the cursor and playback (A/B with a source), copy and paste at the cursor, arranging sections,
the files, and the node turning green at Approve. Every scene undoes its changes except the duplicated
section, which the scripts keep to show what follows it (the lyrics in the song, the words in the cover).

`lib/render.mjs` cuts the video: the fast-forwarded pieces, the cards (HTML rendered by Chromium), the
chapter name and speed badge in the band, the burned subtitles (ASS) and the `.srt`.

The writer, plan and draft seeds of the templates are fixed, so a second recording with the same brief
gets the same lyrics and score; the take seed is random, so each recording renders a new take.
