# Tutorial videos

Scripts that drive the real ComfyUI frontend with Plenio and the real models in Chromium, record the
screen and cut a finished 1920 x 1080 video with an English voice-over:

| Script | Video |
|---|---|
| `system-check.mjs` | **0 · System Check**: open the template, run the check, and read the report section by section - versions, GPU, the templates and their model files, the hardware table, the recommendations |
| `yue2-song.mjs` | **1 · YuE2 · Song**: open the template, a run straight through (*new song every run*), then *one song, stop to review*: Song Sheet · Text (the tabs, Approve), Song Sheet · Score with the score editor (the lyrics lane, editing a line where it is sung, notes, the cursor and playback, copy and paste, arranging sections - a duplicated chorus is kept - MusicXML and the project file, Approve), Song Sheet · Text again with the lyrics that followed the chorus, and the finished song |
| `yue2-cover.mjs` | **2 · YuE2 · Cover**: load a recording, an instrumental cover straight through (*new cover every run*), then *one cover, stop to review* with the original lyrics: Song Sheet · Score with the score editor (notes, the cursor with A/B against the source, the sung pitch over the notes and *align*, a duplicated section that is kept, the files, Approve), Song Sheet · Text (the transcribed words over their notes, the score still editable there, Approve) and the finished cover |
| `minimax-song.mjs` | **3 · MiniMax · Song**: a run straight through, then *one song, stop to review*: the Song Sheet (the caption in three parts, the lyrics, the 5,000-token budget, Approve) and the finished song |
| `enhance-master.mjs` | **4 · Enhance & Master**: master an unmastered take with the defaults (a warm tone match, -14 LUFS) and read the curve, the measured loudness and the files; then edit the bands by hand, pick -16 LUFS and run again |
| `yue2-daw.mjs` | **5 · YuE2 · DAW**: the writer's lyrics (Song Sheet · Text, Approve), then Song Sheet · DAW: the four tracks, a sketch imported with *Import MIDI…* (the import dialog, the Guide track), playback from the cursor, a counter-line recorded with a MIDI keyboard (simulated in the video, and undone), *Save project*, Approve - and the song YuE2 renders from that score |

The runs are real: the songs in the videos are rendered while they are recorded (on an RTX 5060 Ti a
YuE2 run takes about two minutes). Waiting is fast-forwarded in the edit, with a speed badge in the band
under the picture. Where a preview plays a song, the song is mixed under the voice.

## What it needs

- ComfyUI with its Python environment and the models of the templates (the dev server below uses them
  through `--models`, read only).
- For the voice: **TTS Audio Suite** with **OmniVoice** in a ComfyUI (its model in
  `models/TTS/omnivoice/OmniVoice`) - only for lines that are not in the voice cache yet.
- Node.js and Playwright with its Chromium (`PLAYWRIGHT_MODULE=<folder of the playwright package>` when
  it is not installed globally).
- `ffmpeg` with libass (the `subtitles` filter, for the band's labels) on the PATH.

## Recording

Start an isolated ComfyUI with Plenio on the GPU (a scratch base folder: the user's ComfyUI, its custom
nodes, settings and outputs are not touched; `PLENIO_OFFLINE=1` makes sure nothing is downloaded):

```bash
PLENIO_OFFLINE=1 HF_HUB_OFFLINE=1 PLENIO_COMFYUI_ROOT=<ComfyUI> PYTHONPATH=.devdeps <ComfyUI python> tools/dev_server.py --gpu --port 8190 --base <scratch folder> --models <ComfyUI models folder>
```

Then record and edit one video (10 to 20 minutes each, most of it rendering):

```bash
node tools/tutorials/record.mjs yue2-song --url http://127.0.0.1:8190 --tts-url http://127.0.0.1:8191 --out dist/tutorials
```

`record.mjs` sets a few viewer settings on that server first (English, no minimap, no node source
badges, no canvas info, no selection toolbox, full-quality drawing when zoomed out). `--render-only`
cuts the video again from an existing recording (for example after a change of the narration);
`--headed` shows the browser. `enhance-master` masters `$PLENIO_TUTORIAL_AUDIO` (an unmastered take shows
the most; without it, the repository's sample song); `yue2-daw` imports `assets/Open Window Sketch.mid`
(an original 18-bar song made for the video, in the shape of the writer's lyrics for its brief - `assets/Open Window Sketch.abc` is its score - or
`$PLENIO_TUTORIAL_MIDI`).

The TTS server (`--tts-url`) is a second ComfyUI with TTS Audio Suite; stop it while recording, it holds
GPU memory. Speech is cached in `<out>/voice-cache` by text and voice, so a re-cut synthesises only the
lines that changed.

## Output

`--out` (`dist/` is not committed) gets one folder per video, named after it, with everything it is made
of - for editing by hand. Its `README.md` explains the files:

- `<name>.mp4` - the video with the voice-over (and the songs), `<name> (no voice).mp4` - the same picture
  without sound;
- `<name>.srt` - the narration timed to both, written for a TTS (spoken spellings, `[pause:…]` tags), and
  `<name> (written).srt` - the same as subtitles;
- `audio/voice.wav`, `audio/music.wav`, `audio/mix.wav` and every line as `audio/lines/NNN.flac` with
  `audio/lines.tsv`;
- `voice/` - the narrator's reference recording, its transcript and how it was made (`voice/VOICE.md`).

The recording itself stays in `<out>/<script>/` (`raw.mp4`, `markers.json`, the songs as `sound-N.*`).

## The narration

`narration/<script>.txt` is what the narrator says, line by line, each at a caption or a card of the
script (`@ <the caption's first words>` / `@ card <title>`; the format is in `lib/voice.mjs`). The edit is
cut for the voice: a line starts 0.2 s after its cue and the next cue waits until 0.4 s after the line;
where the recording gives a line less time, a card stays longer, a fast-forwarded wait plays slower, or
the picture holds still before the next cue. `| +6` after a cue leaves six quiet seconds after the line
(to listen to a song).

`narration/lexicon.txt` turns written names into what the TTS says right ("YuE2" -> "Yu-eh two");
"Plenio" is written as it is. The narrator's voice is cloned from `voice/narrator.wav`
(see `voice/VOICE.md`).

## The promo and the README's screenshots

`promo.mjs` cuts about 75 seconds of shots from the six recordings with a narrator, into
`<out>/Plenio - Music production in ComfyUI (promo)/` (no music; `--music` lays a song of the DAW
recording under the voice). `screenshots.mjs` makes the README's screenshots again, at twice the
screen resolution, into `assets/branding/<version>/`: the template graphs after real runs, App mode, the
System Check report, the EQ panel and the Stem Mixer (`--only` for some of them; `--audio` the song for
Enhance & Master). Every video's folder also has `youtube-chapters.txt` and `thumbnail.jpg` is cut from
its title card.

## How the scripts are built

`lib/studio.mjs` opens the browser (1920 x 1000; the edit adds an 80 px band below) and gives the scripts
a small vocabulary: `click`, `hover`, `drag`, `type`, `keys` (shown on screen), `spotlight`, `fly*`
(smooth camera moves over the graph), `chooseCombo`, `run` and `follow` (waits for the run, the camera
follows the running node, every stage becomes a fast-forwarded piece with its caption), `listen` (the song
a preview starts playing, for the edit), and the markers `caption`, `chapter`, `card` (title, chapter and
end cards) and `fast`. Nodes are found by title or type - a template opened from the browser gets string
ids. The captions are not shown; they are the cues of the narration.

`lib/sheet.mjs` holds the Song Sheet parts: open a sheet, walk its tabs, approve, fix the sections when
the sheet warns that they do not match the lyrics (that edit stays), and the note-editing scene, which
shows the tools on an example and undoes each change, so the rendered song keeps the model's melody.

`lib/scenes.mjs` holds the score editor's scenes of 0.4: the overview with the lyrics lane, a lyrics
edit, the cursor and playback (A/B with a source), copy and paste at the cursor, arranging sections,
the files, and the node turning green at Approve. Every scene undoes its changes except the duplicated
section, which the scripts keep to show what follows it (the lyrics in the song, the words in the cover).

`lib/render.mjs` cuts the video: the fast-forwarded pieces, the cards (HTML rendered by Chromium), the
holds the narration needs, the chapter name and speed badge in the band, the voice and the songs (ducked
under the voice), and the folder of files. `lib/voice.mjs` reads the narration and the lexicon and makes
the speech.

The writer, plan and draft seeds of the templates are fixed, so a second recording with the same brief
gets the same lyrics and score; the take seed is random, so each recording renders a new take.
