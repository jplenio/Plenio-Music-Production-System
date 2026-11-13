# Testing Plenio VST3 in a DAW

A checklist for trying every part of the plug-in in a DAW - REAPER and Cubase step by step, the same parts in any
other. Tried a DAW nobody has reported yet? Tell what works and what does not (see the end): it decides which DAW
gets tested next.

What is checked without a DAW, on every build: the core and the engine (`plenio_tests`), REAPER's side against a
fake REAPER, Steinberg's VST3 validator against the built plug-in, the web UI's types and tests. Checked by hand so
far: REAPER (every step below) on Windows. Cubase, Studio One, Ableton Live, FL Studio, Bitwig and Cakewalk follow
the VST3 standard the validator checks, but have not been tried step by step; macOS is built, not yet run on a Mac.

## What you need

- Windows 10 or 11 (x64) with the Microsoft Edge WebView2 Runtime (Windows 11 has it; the installer checks).
- ComfyUI with Plenio, started as you always start it. Plenio VST3 finds it on port 8188, 8000 or the port ComfyUI
  was last started with, and can start it when it is not running (Settings). On another computer: its name and a
  token in the Settings ([tutorial](TUTORIAL.md#comfyui-on-another-computer)).
- Plenio 2.0 (Song API v2). With Plenio 1.6 the plug-in speaks v1 and does the same; 1.5 makes songs without stems
  and with an estimated tempo map.

## Install

1. The installer of the release, or from a checkout: `tools\build.ps1`, then `tools\install.ps1` (asks for
   administrator rights and copies `Plenio.vst3` into `C:\Program Files\Common Files\VST3`; `-Uninstall` takes it
   out again).
2. Let the DAW scan for new plug-ins. Two plug-ins appear: **Plenio** (an instrument) and **Plenio ARA** (an ARA
   extension for clips).

Plenio keeps your songs in `Documents\Plenio\Songs`, its settings in `%APPDATA%\Plenio\VST3` and its log in
`%LOCALAPPDATA%\Plenio\VST3\plenio.log`.

## In REAPER

1. **Insert > Virtual instrument on new track… > VST3i: Plenio (Plenio).** The window shows the studio's state at the
   top right (green: *Plenio 2.0.0*). Before the first song it asks you to accept the models' licences (YuE2 and
   SheetSage2: CC BY-NC 4.0).
2. **New song**: a style on the left fills the brief (change any field), *Length: very short*, *Takes: 2*, *stems* on. *Make 2 takes*. A take takes about two minutes; both land on the take lanes.
3. **Play** (the space bar works in Plenio's window too): the instrument plays the chosen take in time with REAPER.
   Click Plenio's ruler while REAPER stands to listen from there. Choose the other take: it plays instead.
4. **DAW tab > Put on tracks**: below the instrument a folder *Plenio · <title>* with *Lyrics* (an item per sung
   line), *Song* (every take as one of REAPER's takes), *Melody*, *Instrument Line*, *Chords* (muted MIDI) and the
   stems; the sections as regions; the project's tempo map from the take's bars. Check:
   - REAPER's bar lines fall on the song's bars (the click of the DAW tab helps hearing it);
   - choose another take on the Song track (its take lane, or the *T* key): Plenio follows, and the stems, MIDI, lyrics
     and tempo map follow the take; choose one in Plenio: REAPER follows;
   - the instrument is quiet while REAPER plays the tracks (it still plays when you listen inside Plenio);
   - the song keeps its speed: its audio items have the timebase *Time* (item properties), so the tempo map moves
     REAPER's grid and not the song; what you put on Plenio's tracks yourself stays when they follow another take;
   - a song with cover art: the cover is the icon of the folder track and the Song track.
5. **Change the song**:
   - *Words* tab: change a line of the lyrics. *Generate* now says *compose new notes for the words, then render*.
   - the piano roll (double-click: a note; drag: move; its edge: length; Del; arrow keys: transpose), and a chord
     (click it). *Generate* says *render a take of your notes*.
   - *Brief* tab: change the brief: the song is written anew.
   Each run lands as new takes on the same track, also when the new take is longer or shorter.
6. **Drag and drop** (DAW tab, or the grip on a take lane): drag *Take*, *Stems*, *MIDI*, *Tempo map* or *Click* onto
   REAPER's timeline at bar 1. Every file starts at the project's start. Drop the *Take* first, then the *Tempo map*
   (REAPER asks whether to import its tempo: yes): the take keeps its speed and REAPER's grid moves onto the song's
   bars. REAPER on its own would stretch the take to the new tempo; within half a second of the drop Plenio gives its
   audio in the project the timebase *Time* (the item's properties show it, the log says
   `REAPER: Plenio's audio keeps its time in 1 item`).
7. **Without ComfyUI**: save the project, quit REAPER, quit ComfyUI, open the project again. The song, its takes and
   your edits are there; playing, editing, dragging and *Put on tracks* work; *Generate* asks for ComfyUI.

## Cover art

1. In the brief, switch *Cover art* on (*New song*, or the *Brief* tab: the switches under the form). With the take,
   Plenio paints a cover from the song's artwork prompt.
2. The cover shows at the top left of the song (click it: large), on the take's lane and in the song list (*Songs*).
3. The song's folder holds it as `cover.jpg` (the cover of the chosen take, else of the newest take with one); every
   take keeps its own beside its audio (`takes\<n>\<title> - Take <n>.jpg`).
4. A song made before this version: its cover comes out of the take's FLAC (Plenio embeds it there) when the song
   opens.

## In Cubase

1. An instrument track with **Plenio**: it plays the song in time with Cubase.
2. The stems on their own channels: activate the outputs *Vocals*, *Drums*, *Bass*, *Other*, *Rest* in the
   instrument's output list (VST Instruments rack); an active stem output leaves the main output.
3. *MIDI out*: the melody (channel 1), the instrument line (2) and the chords (3) go to a MIDI track routed from Plenio.
4. Drag and drop as in REAPER; the tempo map: drop *Tempo map* or use *File > Import > MIDI File…* with the tempo
   track imported.

## Plenio ARA (Cubase, Studio One, REAPER)

1. Drag a take (*Take* tile of the DAW tab) into the project and put **Plenio ARA** on that clip (Cubase: select the
   event, *Audio > Extensions > Plenio ARA*; REAPER: the item's FX, Plenio ARA).
2. Plenio ARA knows the clip as a Plenio take (the log says `ARA: '<file>' is take <n> of <title>`) and hands the host
   the take's tempo of every bar, meter, key, sung notes and chords. Hosts that read ARA content show them (Studio One:
   chord track and tempo from the clip; what Cubase and REAPER show of it is worth a report).
3. The clip plays unchanged through Plenio ARA.
4. Open Plenio ARA's window: it lists the clips that are Plenio takes. Choose another take of the song: after a moment
   it plays in the same clip, at the same places (a stem's clip plays the other take's same stem). The project's tempo
   map stays the one of the clip's take.

## Another computer

1. On the studio PC: start ComfyUI with `--listen`; *Plenio Setup > API access > Make a token*.
2. In the plug-in: *Settings > ComfyUI runs on another computer*, the PC's name, the token. The pill turns green.
3. Without a token, or with a wrong one, the pill says *Token needed* and a click on it opens the Settings.
4. Make a song: the takes, stems and cover arrive as from this computer.

## Not in this version

- More ARA: the take's lyrics, notes and chords in Plenio ARA's window, covers of any clip.
- A review of the lyrics before the take is sung (Song API v2 can stop there; the plug-in's way is to change the
  words and generate again), the syllables under the notes, undo and redo across all edits (the piano roll has its
  own), notes edited in REAPER read back, the plug-in's window on Linux.

## Reporting

- [How it works in my DAW](https://github.com/jplenio/Plenio-Music-Production-System/issues/new?template=vst3_daw_report.yml):
  the DAW and its version, what you did, what worked and what did not, a screenshot.
- The log: `%LOCALAPPDATA%\Plenio\VST3\plenio.log` (macOS `~/Library/Caches/Plenio/VST3/plenio.log`).
