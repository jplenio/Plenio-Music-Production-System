# Tutorial videos

Scripts that drive the real ComfyUI frontend with Plenio and the real models in Chromium, record the
screen and cut a finished 1920 x 1080 video with an English voice-over and an effects track (all
re-recorded for 1.0.0: arrangement *off* by default, the thirteen creative modes, a cover's melody that
follows the new chords, continuing a song from its record or its FLAC, the seeds' 🎲/🔒 switch, the export's
lyrics subtitles and tags with variables, the brief's line for the chosen creative mode):

| Script | Video |
|---|---|
| `system-check.mjs` | **0 · System Check**: open the template, run the check, and read the report section by section - versions, GPU, the templates and their model files, the hardware table, the recommendations |
| `yue2-song.mjs` | **1 · YuE2 · Song**: open the template, a run straight through (*new song every run*), then *one song, stop to review*: Song Sheet · Text (the tabs, Approve), Song Sheet · Score with the score editor - first a tour of every area (roll with chord and lyrics lanes, toolbar, transport, notation, inspector, sections and bar strip, palette, layouts, files, the keys list), then the details: the lyrics lane and editing a line where it is sung, notes, the cursor and playback, the tracks' sounds and a preset, copy and paste, arranging sections (a duplicated chorus is kept) and bars, a counter-line recorded with a MIDI keyboard (simulated, undone), MusicXML, the notation as PDF and the project file - Approve, Song Sheet · Text again with the lyrics that followed the chorus, the finished song - and *File > Continue a Plenio song…*: the list of songs, *Open a record or FLAC…* (the FLAC carries its project since 0.8.0), Continue |
| `yue2-cover.mjs` | **2 · YuE2 · Cover**: load a recording, an instrumental cover straight through (*new cover every run*), then *one cover, stop to review* with the original lyrics: Song Sheet · Score with the score editor - the tour (with the source's lane and the sung pitch), then notes, the cursor with A/B against the source, the sung pitch, *wave* and *sung* for a free cover, *align*, the sounds with the preset *Cover: check the transcription*, a duplicated section that is kept, the files (MusicXML, PDF, project) - Approve, Song Sheet · Text (the transcribed words over their notes, the score still editable there, Approve) and the finished cover |
| `minimax-song.mjs` | **3 · MiniMax · Song**: a run straight through, then *one song, stop to review*: the Song Sheet (the caption in three parts, the lyrics, the 5,000-token budget, Approve) and the finished song |
| `enhance-master.mjs` | **4 · Enhance & Master**: master an unmastered take with the defaults (a warm tone match, -14 LUFS) and read the curve, the measured loudness and the files; then edit the bands by hand, pick -16 LUFS and run again |
| `yue2-daw.mjs` | **5 · YuE2 · DAW**: the writer's lyrics (Song Sheet · Text, Approve), then Song Sheet · DAW: the four tracks, a sketch imported with *Import MIDI…* (the import dialog, the Guide track), the tour (with the track headers and their sounds), the words fitted, bars arranged, playback from the cursor, the sounds with the preset *Composing with a MIDI keyboard*, a counter-line recorded with a MIDI keyboard (simulated in the video, and undone), the files (MusicXML, PDF, project), Approve - and the song YuE2 renders from that score |
| `yue2-song-creative.mjs` | **6 · YuE2 · Song · Creative modes** (0.4.5, recorded again for 0.8.0, experimental): the note that creative modes are made for experimenting, the brief's *arrangement (experimental)* with its thirteen modes (only *key change* changes the key) and *genre closeness*, the *Writer model*, the block *Arrange* and its seed; one song (*dramatic*) with its stops - the style the mode wrote, the arrangement in Song Sheet · Score (its line with the badge, the details, the instrument line in the roll) - the song and its sheet music PDF; then another arrangement of the same song from the arrangement seed |
| `yue2-cover-creative.mjs` | **7 · YuE2 · Cover · Creative modes** (0.4.5, recorded again for 0.8.0, experimental): the sample song re-arranged as a free version (*many instruments*, *song flow closeness* 30: the writer's chords and a new melody over them, in the old rhythm) with new lyrics that keep its story (*lyrics closeness* 70); Song Sheet · Score with the arrangement and A/B against the original, Song Sheet · Text with the new words over the new melody, the cover and its sheet music PDF |
| `player.mjs` | **8 · Plenio Player** (1.0.0): starts in ComfyUI with the YuE2 Song template - the **Plenio Player** button beside Run and the one on Export Release; one click starts the player (a program of its own) and opens it in a tab the recording follows - then the library's search, field filters and chips, playing a song (the bar's line, the waveform and its bright square), the song's page (from ⓘ: lyrics lit up and jumped to, the notation following the music, every field of the brief and the files, takes, songs alike), Now playing in its four views, the visuals and their modes, **Plenio Drop** (a preset, *Edit a copy*) and **how the lyrics look**, a run through the visuals, a playlist made and given a visual, the smart lists, the queue and the sleep timer, a song's menu, **Live Play** with a song that arrives meanwhile (copied into the folder as Export Release writes one), **guests in the network** (switched on, *change it*, *Show it big*, the guests' page in a tab of its own with a song moved up, and what the host's playlist says), **a song as a video** (upright, karaoke, made), **share as a player** (the playlist, the file opened by itself), A/B and speed, the keys, the Settings page (the version, what is kept, the backup, the folders, Stop the player) and *Open in ComfyUI*, which opens the song's workflow in a ComfyUI tab. Recorded against a ComfyUI dev server whose output folder holds the songs, with `PLENIO_PLAYER_STATE` set to a fresh folder and `PLENIO_GUESTS_HOST=127.0.0.1` (the player ComfyUI starts inherits both: it takes the player of its state folder, never one with another state, and the guests' access stays on the loopback address, so Windows asks nothing); the music is the player page's own sound, under the voice |
| `yue2-loras.mjs` | **11 · YuE2 LoRAs** (1.4.0): the *YuE2 LoRAs* node under the music model of *1 · YuE2 · Song* - its four slots (none: YuE2 as loaded), the two halves a LoRA shapes (plan, sound), a LoRA from `models/loras` chosen (`$PLENIO_TUTORIAL_LORA`, the instrumental adapter by default) with its strength, an instrumental song made with it, the node's summary after the run, what it leaves out and the original layout it joins |

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

Then record one video (10 to 20 minutes each, most of it rendering) - and, once every recording is made,
cut it with the voice (the TTS server needs the GPU memory the songs rendered with):

```bash
node tools/tutorials/record.mjs yue2-song --url http://127.0.0.1:8190 --out dist/tutorials --record-only
node tools/tutorials/record.mjs yue2-song --render-only --tts-url http://127.0.0.1:8191 --out dist/tutorials
```

`record.mjs` sets a few viewer settings on that server first (English, no minimap, no node source
badges, no canvas info, no selection toolbox, full-quality drawing when zoomed out). Without
`--record-only` it cuts the video right after recording; `--render-only` cuts it again from an existing
recording (for example after a change of the narration);
`--headed` shows the browser. `PLENIO_TUTORIAL_REHEARSE=1` keeps every pause under a fifth of a second: a
rehearsal that finds what a script cannot click in minutes instead of a long take (its recording is not for
the edit; give it another `--out`). Tutorial 8 plays the song named by its file name in `PLENIO_PLAYER_SONG`
(else the longest with timed lyrics, a score and sheet music). Its script asks for a graphics card (`meta.gpu`):
the browser draws WebGL on the computer's default one - a headless browser otherwise draws it on the processor, and
the player offers neither Plenio Drop nor Plenio Nova there; its Nova chapter shows the first of a few Nova visuals
this graphics card draws smoothly. `enhance-master` masters `$PLENIO_TUTORIAL_AUDIO` (an unmastered take shows
the most; without it, the repository's sample song); `yue2-daw` imports `assets/Open Window Sketch.mid`
(an original 18-bar song made for the video, in the shape of the writer's lyrics for its brief - `assets/Open Window Sketch.abc` is its score - or
`$PLENIO_TUTORIAL_MIDI`).

The TTS server (`--tts-url`) is a second ComfyUI with TTS Audio Suite; stop it while recording, it holds
GPU memory. Speech is cached in `<out>/voice-cache` by text and voice, so a re-cut synthesises only the
lines that changed.

## Output

`--out` (`dist/` is not committed) gets one folder per video, named after it, with everything it is made
of - for editing by hand. Its `README.md` explains the files:

- `<name>.mp4` - the video with the voice-over, the effects and the songs, `<name> (no voice).mp4` - the
  same picture without sound;
- `<name>.srt` - the narration timed to both, written for a TTS (spoken spellings, `[pause:…]` tags), and
  `<name> (written).srt` - the same as subtitles;
- `audio/voice.wav`, `audio/effects and music.wav` (everything but the voice, as in the video),
  `audio/effects.wav`, `audio/editor.wav` (what the score editor plays), `audio/music.wav`, `audio/mix.wav` - 48 kHz, 24 bit, every one exactly as long as
  the video (for a soundtrack of your own in an editor such as DaVinci Resolve: the picture, the voice and
  *effects and music* on three tracks at 0:00) - and every line as `audio/lines/NNN.flac` with
  `audio/lines.tsv`;
- `voice/` - the narrator's reference recording, its transcript and how it was made (`voice/VOICE.md`).

The recording itself stays in `<out>/<script>/` (`raw.mp4`, `markers.json`, the songs as `sound-N.*`).

## The narration

`narration/<script>.txt` is what the narrator says, line by line, each at a caption or a card of the
script (`@ <the caption's first words>` / `@ card <title>`; the format is in `lib/voice.mjs`). The edit is
cut for the voice: a line starts 0.2 s after its cue and the next cue waits until 0.4 s after the line;
where the recording gives a line less time, a card stays longer, a fast-forwarded wait plays slower, or
the picture holds still before the next cue; where it leaves a long silence between two lines, the
picture plays a little faster there (at most 2.5 times, no speed badge, never while a song plays), so no
pause runs much longer than two seconds. `| +6` after a cue leaves six quiet seconds after the line
(to listen to a song).

`narration/lexicon.txt` turns written names into what the TTS says right ("YuE2" -> "Yu-eh two");
"Plenio" is written as it is. The narrator's voice is cloned from `voice/narrator.wav`
(see `voice/VOICE.md`).

## The promo and the README's screenshots

`promo.mjs` cuts about 80 seconds of shots from the recordings (the creative modes of 0.4.5 included) with a narrator, into
`<out>/Plenio - Music production in ComfyUI (promo)/` (no music; `--music` lays a song of the DAW
recording under the voice). Its video, *Plenio in 75 seconds*, is retired since 1.5.0: the spots *Your idea. Your
song. Your party.* and *Your idea. Your song. Your control.* (motion graphics, made outside this repository) take its
place in the README, the docs and the player's help. `screenshots.mjs` makes the README's screenshots again, at twice the
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

`lib/render.mjs` cuts the video: the fast-forwarded pieces, the cards (HTML animated in Chromium and
stepped frame by frame), the holds the narration needs, the chapter name and speed badge in the band,
the voice, the effects and the songs (ducked under the voice), and the folder of files. Every piece is a
whole number of frames, so the sound stays in sync to the last frame. `lib/sfx.mjs` makes the effects
from noise and sines (no samples, like the README's spot): a click, keys, a camera move, a sheet that
opens, Approve, a run that stops for review or ends, a wait that starts to play faster, and the cards -
from what the recording marked (`sfx` in `markers.json`). What the page plays - the score editor's
playback in the tracks' sounds, the source recording at *both* and A/B, a sound's preview, the keys of a
MIDI keyboard - is recorded in the browser (`lib/tap.mjs`: every Web Audio connection to a context's
output also goes to a recorder) and cut like the picture into `audio/editor.wav`: heard where the picture
plays at normal speed, and the picture never plays faster while it sounds. `lib/voice.mjs` reads the narration and the lexicon and makes
the speech.

The writer, plan and draft seeds of the templates keep their number (🔒), so a second recording with the
same brief gets the same lyrics and score; the take seed draws a new one before every run (🎲), so each
recording renders a new take. `seedsDemo` (lib/scenes.mjs) shows the switch, `exportExtras` the export's
subtitles, its tags and the *Tags & variables* note.
