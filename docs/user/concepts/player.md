# Plenio Player

A page in your browser that plays the songs you made with Plenio. It is a program of its own: it runs
**without ComfyUI**, and ComfyUI can start it with one click. Make songs in ComfyUI and listen in the player
at the same time, or just listen.

▶ **Videos:** [Tutorial 8 · Plenio Player](https://youtu.be/V7irEvnbKhU) - listening, a song's page with the full lyrics and its stars, the visuals with Plenio Nova, Live Play, videos; [Tutorial 9 · Party songs](https://youtu.be/zlfVKXzPj_c) - songs made from the player, with presets, takes and your guests. All of them in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

It finds every song that Export Release wrote (each export writes a `.plenio.json` release record next to
the audio). It shows them as a library you can search. While a song plays, the lyrics light up word by word,
a cursor follows the notes on the sheet music, and Winamp-style visuals move with the music. Every song can
go back into ComfyUI to work on it.

## Open the player

### From ComfyUI: one click

- **Plenio Player** (▶) in ComfyUI's action bar, beside **Run**.
- The menu **Plenio › Plenio Player** (also in the command palette).
- **▶ Open in the Plenio Player** on **Export Release**: after a run it opens the player right at the song the
  node just exported.

The player opens in a browser tab of its own; the next click brings that tab back. If no player runs yet,
ComfyUI starts one first (a few seconds): it plays ComfyUI's output folder and finds ComfyUI again for
*Open in ComfyUI*. A player started this way keeps running when you close ComfyUI, and it has no window -
stop it on its **Settings** page (*Stop the player*). Its messages go to `player.log` in the player's state
folder (`~/.plenio/player`).

### Without ComfyUI: a double click

In the Plenio folder (`ComfyUI/custom_nodes/Plenio-Music-Production-System`):

- **Windows:** double-click **`Plenio Player.bat`**. It finds the Python of your ComfyUI - the portable
  build's `python_embeded`, or the `.venv` of a manual or Desktop install.
- **macOS and Linux:** run **`./plenio_player.sh`**.

The browser opens at `http://127.0.0.1:8765/`. Stop the player with Ctrl+C in its window, or on its
Settings page. The same by hand, with the Python that runs your ComfyUI (any Python 3.10 or newer works;
the waveform needs PyAV and numpy):

```bash
# from the ComfyUI folder (a venv install)
.venv/Scripts/python custom_nodes/Plenio-Music-Production-System/plenio_player.py

# the Windows portable package
python_embeded\python.exe ComfyUI\custom_nodes\Plenio-Music-Production-System\plenio_player.py

# or as a module, from the package folder
python -m plenio.player
```

However you start it, it is the same player with the same playlists and settings.

| Option | What it does |
|---|---|
| `--folder <folder>` | The folder to read songs from, with all its subfolders (repeatable). The default is ComfyUI's `output` folder when Plenio sits in `ComfyUI/custom_nodes`, else the current folder |
| `--port 8765` | Another port, if 8765 is taken |
| `--no-browser` | Do not open the browser |
| `--comfyui http://127.0.0.1:8188` | The ComfyUI that *Open in ComfyUI* goes to (the button in ComfyUI sets it) |
| `--host 127.0.0.1` | Only this computer can open the player. `--host 0.0.0.0` opens it to your network. There is no login, so only do this on a network you trust |

Instead of `--folder` you can set `PLENIO_PLAYER_FOLDER` (several folders separated by `;` on Windows, `:`
elsewhere).

**What it writes:** your playlists, favourites, play counts and settings ([see below](#your-settings-are-kept))
and the waveforms it has worked out go to `~/.plenio/player` (or the folder in `PLENIO_PLAYER_STATE`). In your
song folders it changes something only when you remove a song ([see below](#remove-a-song)).

If the port is taken - the player is already running, or another program uses 8765 - it says so and does
not start; open the running one, or start it with `--port 8766`. (ComfyUI's button finds a running player on
8765-8769, and else starts one on the first free port.)

New songs show up when you click **Look for new songs** in the sidebar, or reload the page.

## On a phone, a tablet and a large screen

The player lays itself out for the screen it is on:

- **A phone** (narrower than 700 px): a tab bar at the bottom - *Songs*, *Playlists*, *Live*, *Make* (or *Help*)
  and *More*, the whole menu - and a slim player above it. **Swipe** the slim player sideways for the next or the
  previous song, up for Now playing; in Now playing, swipe down to close it. The library begins with the song that
  plays, your collections as chips and the songs right below them. **Filters** beside the search opens the filters
  as a sheet from the bottom; a song's ⋯ menu and Now playing's ⋯ open as sheets too. A tap on a song's row plays
  it, its ⋯ menu has its page - in the grid a tap opens the page.
- **A tablet** (700-1100 px): the slim player, and the menu as a drawer (☰).
- **A large screen**: the sidebar and the full bar.

**Like an app**: *Add to Home screen* in the browser's menu (Android), or *Share › Add to Home Screen* (iPhone,
iPad) - the player then opens on the whole screen, with its own icon.

**Thousands of songs**: the player reads its folders in the background - the page shows at once, also while a
large library is read for the first time (*Reading your songs - 1200 of 2969*) - and builds its list anew only
when a file changed. A cover comes as a small picture sharp at the size shown (a card: about 12 KB instead of
200 KB), the list grows as it scrolls, and the search waits for a pause in the typing. Measured with a library of
2,969 songs: the library reaches the page compressed (1 MB instead of 9.6 MB) and again in 2-25 ms, a keystroke
in the search takes 60-80 ms (before: 125-147 ms).

## Help and tutorials

**Help & tutorials** (in the sidebar, *Help* on a phone, or **H**) has short guides by topic - first steps,
finding songs, Now playing and the visuals, Live Play and the party, making songs, phones and other computers,
videos and shared players, what to check when something does not work - and the narrated **video tutorials**.
The search above them finds a guide's lines and the tutorials by every word typed. A tutorial plays in the
page, from `youtube-nocookie.com`, after a click on it: nothing is loaded from YouTube before.

## Your folders, and other music

The player reads every release record below its folders: ComfyUI's output folder unless you choose others.
Choose them on the **Settings** page under **Songs**:

- **Add a folder…** opens a folder browser: start at *Home*, your music folder or a drive, go into a folder,
  or type or paste its path, then **Choose this folder**. Add as many folders as you like; × stops reading one
  (its files stay where they are).
- **also other music** (per folder): the player also plays the folder's audio files that were **not made
  with Plenio** - FLAC, MP3, WAV, OGG, Opus, M4A. The files of a Plenio song (its audio, its unmastered take,
  its stems) always stay with that song.
- **Back to the start's folders** forgets your choice.

The folders are kept with the player (`library.json` in `~/.plenio/player`), so the player started from
ComfyUI reads them too.

**Songs of one title are told apart**: since 1.1.0 Export Release numbers a title another song of its folder
already has - the second cover of *Yesterday* is *Yesterday (2)*, in its tags and file name too (as file
names were always numbered). Songs exported before keep their title in their files; the player shows them as
*(2)*, *(3)* … in the order they were made, and their page names the recorded title. They stay **takes** of
one song when their lyrics and score are one.

**Other music is clearly marked**: *other music* on its card, **Other music** on its page, *Made with: other*
among the library's filters, `is:other` in the search (`is:plenio` for the rest, `artist:` and `album:` for
their tags). It has what its file has, no more: the title, artist, album, genre and year from its tags, the
picture inside the file (or a `cover.jpg` / `folder.jpg` beside it), the lyrics from its tags - and timed
lyrics, word by word, from an `.lrc` file of the same name beside it (or an `.srt`). It plays with the
visuals, in playlists and the queue like every song, and can be removed (the audio and its own `.lrc` go,
never the folder's cover). What needs a release record is not there: no notation, no sheet music, no brief or
seeds, no measured lyrics, no *Open in ComfyUI*.

The first time a folder with much other music is read, the player reads every file's tags once (a few
seconds per thousand files); after that it remembers them.

## The library

The library shows a featured song at the top, then every song as a card with its cover. Songs without a
cover get artwork drawn from their colours and genre. **Click a card to open the song's page; ▶ on its cover
plays it.** In the list view, a double click plays a song and ⓘ opens its page. A right-click or ⋯ opens the
song's menu:

- **Play next** or **Add to the queue**
- **Start a radio of songs alike**: the song, then up to 40 songs like it
- **Add to favourites**, or add it to a playlist
- **Open the song's page**
- **Tags…**: your own tags for the song ([see below](#tags-of-your-own))
- **Open in ComfyUI** ([see below](#continue-a-song-in-comfyui))
- **Remove from the library…** ([see below](#remove-a-song))

**Search** looks through titles, lyrics, genres, moods, styles, briefs and your tags; every word you type must
match. A line from the lyrics shows on the card when a word matches there. You can also narrow the search with
fields - **as you type, the search suggests them**: `gen` offers `genre:`, `genre:blu` offers every genre with
*blu* and how many songs have it, `#` your tags (↑ ↓ to choose, Enter or Tab to take one):

| Type | Finds |
|---|---|
| `genre:jazz` `mood:warm` | the brief's genre, mood |
| `bpm:>110` `bpm:90-120` | tempo from the score |
| `key:Am` `meter:6/8` | key and meter |
| `model:yue2` `model:minimax` `model:master` | the music model (*master*: recordings from Enhance & Master) |
| `lang:german` `vocals:instrumental` | language, vocals |
| `mode:dramatic` | the creative mode |
| `creativity:>100` `creativity:40-60` `creativity:adventurous` | the brief's [creativity](creativity.md) (0-200) or its level: steady, restrained, balanced, varied, experimental, adventurous |
| `len:<3` | length in minutes |
| `year:2026` `template:jazz` `writer:gemma` | year, brief template, the model that wrote the lyrics |
| `tag:party` `#party` `tag:"road trip"` | your own tags |
| `is:fav` `is:cover` `is:other` `is:plenio` | favourites, covers, other music, Plenio's songs |
| `is:unplayed` `is:played` `is:tagged` `is:untagged` | never played or played, with or without tags of yours |
| `plenio:>=0.8` `plenio:0.7` `plenio:0.5-0.7` | songs made with a Plenio version: from 0.8 on, any 0.7.x, from 0.5 to 0.7 |
| `artist:` `album:` | the tags of other music |
| `has:pdf` `has:timing` `has:original` `has:score` | songs with sheet music, timed lyrics (measured or from subtitle files), an unmastered take, notation |
| `"a phrase"` `-word` | an exact phrase; leave out songs with a word |

The **filters** under the search are rows of chips - your tags, genres, moods, what made the song (Plenio or
other music) and the model; **More filters** opens vocals (sung, sparse vocals, instrumental), language, tempo (slow, 90-119, 120-139, fast), length
(under 3, 3-5, over 5 minutes), key, creative mode, creativity (steady 0-19, restrained 20-39, balanced 40-60,
varied 61-80, experimental 81-150, adventurous 151-200), template, year, Plenio version, what a song has (timed
lyrics, sheet music, notation, an unmastered take, a cover picture) and listening (favourites, played, never
played, no tags yet). A row shows its most common values first; **+ 113 more** opens it to every value - every
genre a template gave, the rare ones too - with a field to find one in a long row.

- **A click** on a chip keeps only the songs with it; a second click takes the filter off. **Several chips in one
  row** are alternatives: *jazz* and *pop* keep the songs of either genre, *slow* and *fast* both tempos. The rows
  must all match (*jazz* or *pop*, and under 3 minutes).
- **A right click** (a long press on a phone) **leaves those songs out**: the chip turns red and struck
  through, *not Genre: jazz* in the Filtered row.
- **The numbers follow the filters**: they are how many of the songs shown have that value - after *from 1.0.0*,
  *instrumental* says how many of the 1.0 songs are instrumentals, and a value none of them has is gone. So
  every chip says how many songs would stay. A row counts without its own chips, so its other values say how
  many songs they add. A row that could not narrow the songs further is left out.
- **Plenio version** offers *from 1.0.0*, *from 0.8.0* … for an archive with songs of older versions: only the
  songs made with that version or a newer one. It is the one row with one choice at a time (a click on another
  replaces it): *from 0.8.0* already holds the newer versions. A song made before the creativity slider counts as *balanced*: it was
  made as 50 makes it now.

You can sort by newest, oldest, title, length, tempo, loudness, most played or recently played, and switch
between a grid and a list.

**The rail at the side** of a long list jumps anywhere in it: sorted by title its letters, by date its months (its
years when there are many), by length its minutes, by tempo its tens. Click a mark, or drag a finger along the
rail - a bubble shows where it lands.

**Saved filters**: *Save this filter…* in the Filtered row keeps the search and the filters under a name; the
sidebar lists them under *Saved filters* - a click shows those songs again, × forgets one.

### Tags of your own

Every song can have tags of yours - *party*, *road trip*, *for Anna* …:

- **On a song's page**, under its facts: type a tag and press Enter (or a comma). The tags you gave before are
  offered as you type - choose one with ↑ ↓ or the mouse. × takes a tag off; Backspace in the empty field the
  last one.
- **In a song's menu** (right click or ⋯): **Tags…**, the same.
- **For many songs at once**: **Tag…** on the songs' page gives a tag to every song shown - all of them, or the
  ones a search or filter shows. It also lists the tags those songs have (*party 12/37*: 12 of the 37) to take
  one off all of them.

A tag is found with `#party` or `tag:party` and in the filter row **Tags**; the cards show their tags - a click
on one shows the songs with it. Capitals do not make a new tag: *party* given after *Party* is *Party*.
**Settings > Tags** lists every tag with how many songs have it, to rename one (into another tag: the two become
one) or take it off every song; the filters that name it follow. Tags are kept with your playlists (in
`state.json`, and in a backup), and *Share as a player* can take your tags of the songs along.

**Your search and filters stay** - when you open a song's page, go to another view or another window and
come back, or reload the page; the library also keeps its place in the list, and as many songs as *Show more*
had shown. **Back to the songs, the page shows the song that plays**: when it is not in sight where you left
the list, the page goes to it - however far down, also among a thousand songs - and its card lights up for a
moment. Each view (*Songs*, *Favourites*, *Most played*, *Recently played*) has its own. While a search or filter is on, a **Filtered**
row shows each of them (× removes one) and how many songs are left, and **Reset filters** clears them all.

## A song's page

Open it with a click on the song's card or title, with ⓘ beside the song in the bar at the bottom and at the
top of Now playing, or with the key **I** (the song that plays). It shows the cover, the style, how often you
played it, the buttons *Play*, *Add to favourites*, *Playlist, queue …*, **Open in ComfyUI** and **Remove…**,
and these tabs (it opens on the tab you used last). The page of the song that plays follows the music: when the next song starts, the page shows that one, on the same tab
(on *Lyrics*, its live lyrics), and Back still leads to where you came from.

**Its stars** (since 1.4.0), under the title: 0 to 5 in halves. **Yours** are the ones you give by ear - click a
star (its left half gives a half star), **0** for none, **✕** takes them back -, kept like your playlists and
favourites (each user their own). Until you give yours, the **measured** stars stand in their place, faded - a
pre-fill, a hint where to listen first, never the verdict -, and beside them, small, always the measured ones. A
song exported since 1.4.0 has them in its record (Export Release measures every song, in about half a second); one
exported before is measured the first time its page opens and kept in the player's cache. *Details* lists every
measure (below).

- **Lyrics**: every line with the time it is sung. Click a line to hear the song from there. While the song
  plays, the lyrics light up as they are sung, and the line sung now stays in view. A song exported with what
  its take sings has a switch above them: **As written** - the song's lyrics - or **As sung** - what the take
  really sings, as heard when it was exported (see [Written and sung lyrics](#written-and-sung-lyrics)), with
  a line on how far the take follows its lyrics and the lines it left out. **Full lyrics**, the third choice
  of the switch, shows the lyrics as text with their sections (`[Verse]`, `[Chorus]` …) - what goes into a Song
  Sheet - with **Copy the lyrics**, **Without the section tags**, **Copy the style** and, below, the lyrics as
  the take sings them; the player keeps the choice for the next song. The song goes on following the version
  chosen.
- **Notation**: the score with the lyrics under the notes. While the song plays, the notes light up as they
  sound and the sheet moves on with the music: the line of music sounding now always stays in view, also
  after a jump or when you come back to the tab. The cursor points at the notes sounding (where only rests
  sound, already at the bar's next note); it stands at the bar's chord only in a bar with no note, one note
  or only a rest. Click a note to jump there.
- **Sheet music**: the PDF from Export Release, in the browser's PDF viewer.
- **Details**: *The song* lists every field of the brief the song was made with - work mode, template,
  genre, mood, tempo, key, meter, length and target length, vocals, language, voice, lyrics theme (or melody
  and lead instrument), for a cover the harmony and the closeness sliders, the arrangement, genre closeness,
  lines under the singing and the **creativity** - and the sampling it gave: the writer's temperature (and a
  creative mode's), YuE2's plan and take with temperature, top-p and top-k, *(the reference)* where they are
  the values of 50. A field you left empty shows the brief's default with *(default)*, or - for a
  text field, which has none - *open - the writer chose*; a value the template filled says *(from the
  template)*. **How it came out, measured**: the measured stars and every measure with a bar - how much of the
  lyrics as written is heard in the singing, the harmony (how well the notes that sound fit a major or a minor
  chord), few clashes (notes a semitone apart), how clearly it keeps to one key, how steady its beat -, then what
  takes stars off: an ending that stops in the middle of the sound, silent holes, a song much shorter than asked,
  clipping, a loudness off its aim, no headroom, too little or too much dynamics and the Song Sheet's warnings.
  What cannot be measured - an instrumental's lyrics, the singing of a song exported before it was heard - is left
  out, not counted against the song. **How it was made**: the date and time, how long making it took, the graphics card (with its memory) or the
  processor alone, the processor and the RAM, and the lyrics fidelity - for songs exported before 1.4.0 the date and
  time it was saved and, where its record says it, the fidelity. Then the model and the writer, loudness and true peak,
  the seeds (with a copy button, so you can make the take again), the tags in the file, the cover's prompt, and every file to download: FLAC, MP3, WAV, the
  unmastered take, the PDF, both subtitle files, the cover and the release record. The record's path is
  shown with a copy button, ready for *File > Continue a Plenio song…* in ComfyUI. **The song's page** opens
  everything about the song on one page in a new tab - see [The song's page](#the-songs-page-html).
- **Takes**: the song's other takes (same title - its number left out -, lyrics and score, rendered again). Play them one after the
  other to compare.
- **Alike**: songs with a similar genre, mood, tempo, key and language.

### The song's page (HTML)

One page with everything about a song, to read, print and copy from: the cover and the song to play, the
**lyrics as written with their sections** (and as the take sings them), the **style**, what the song is about
and the cover's prompt - each with a copy button -, every field of the brief, how it was made (with the model
files and the LoRAs), the sound and its mastering, the score as ABC notation and links to every file. Under the
title, its **stars**: the measured ones, faded, with every measure further down (*How it came out, measured*), and
the admin's own once they rate the song by ear in the player - the player writes them into the page beside the
song (only a page Export Release wrote there; it makes no new one). In the player the page shows your own stars.

Export Release writes it next to the song as `<name>.html` (*song page (HTML)*, on by default): a double click
opens it in any browser, with no internet and no program - its links are the files beside it. The player shows
the same page for every song of its library, also one exported before (*Full lyrics › The song's page*, or
*Details › Files*).

## Now playing

Click the cover in the bar at the bottom (or press **F**) for the full screen. It has four views:

- **Stage**: the cover floating in the song's colours, with the lyrics beside it.
- **Lyrics**: the lyrics, large and centred, lit up as they are sung (like karaoke).
- **Notation**: the sheet following the music, with the lyrics at the side.
- **Visual**: only the visual, with the lyrics as subtitles. The controls fade out while the mouse rests.

**How the lyrics look** - in the Lyrics and Stage views, on a song's page and in the subtitles over the
visual: 🎤 in Now playing, or *Lyrics* in Settings. There, too: **which lyrics** to follow, *As written* or
*As sung* (below).

- **Font**: Clean, Condensed, Poster, Rounded, Elegant serif, Classic serif, Handwritten, Script, Typewriter,
  Code, Blackletter - each shown in itself - or **your own font**: the name of any font installed on this
  computer. (The player uses the computer's fonts and downloads none; each choice names fonts that Windows,
  macOS and Linux have, the first one found is used.)
- **Effect** - how each syllable comes in as it is sung: *Sweep* (the colour runs through it), *Glow*,
  *Bounce* (it hops), *Pop* (it swells and settles), *Wave* (the letters ripple), *Typewriter* (the line types
  itself), *Rise* (syllables float up and in), *Focus* (blurred until sung), *Neon* (outlines that flick on),
  *Rainbow*, *On the beat* (the line pulses with the music). A line at the top sings itself as a preview.
- **Colour** of what is sung (white, the song's colour, gold, ice, pink, lime) and the **size**.

**The visual on the whole screen:** press **Shift + F**, double-click the visual, click *full screen* in the
visuals' settings, or click ⛶ on the small visual in the bar at the bottom. Again (or Esc) to go back.

Every view has the song's sections as chips (*Verse*, *Chorus* …; click to jump) and the song's waveform:
the part already played is filled in the song's colours, and hovering shows the time, the section and the
line sung there. Click or drag the waveform to jump. A title card greets every new song, and in its last 15
seconds **Up next** names the one that follows, with its cover (on a large screen; with the title cards, *Title
card when a song starts* in the visuals' settings) - for a party's big screen.

The bar at the bottom always shows the song, the line sung right now, the controls and a small square
visual - a bright ring of the music round a core that pulses with the bass, which breathes slowly when the
music stops; click it for Now playing. It also has:

- **A · master / B · original**: switches to the unmastered take and back without a gap, at the same moment
  in the song. You get this when you export with Export Release's *original* input connected (every
  template connects it).
- **Speed**: 0.75× to 1.25× without changing the pitch, to learn a part or sing along.
- **Volume**, **mute**, **shuffle** and **repeat**: the button (in the bar and in Now playing) goes from
  **repeat the whole playlist** (after its last song the queue starts again) to **repeat this song** (a small
  *1* on the button) to **no repeat** (the music stops after the last song). **R** does the same. A song's
  end is caught also while the player's tab is in the background.

Songs fade into each other (**crossfade**, 3 seconds by default; set 0-12 s in the queue). A song you start
always plays from its beginning. The player remembers where you stopped: the next time, ▶ in the bar (or
Space) picks up there; starting the song from its page or its card plays it from the beginning. The media keys on your keyboard and the operating
system's media controls work too.

## Visuals

Visuals in the spirit of Winamp, MilkDrop and AVS, drawn live from the music (its spectrum, its waveform,
left against right, the bass and the beats). There are two kinds.

**Classic visuals:**

| Visual | What you see |
|---|---|
| Classic Bars | Winamp's spectrum: bars with caps that fall slowly, mirrored on the floor |
| Oscilloscope | the waveform as a glowing line with afterglow |
| Stereo Vectorscope | left against right: the stereo picture of the music, drawn in light |
| Radial Bloom | the spectrum as petals around a pulsing core |
| Feedback Tunnel | MilkDrop-style feedback: each frame zooms and turns the last |
| Hyperspace | a starfield that rushes with the bass |
| Plasma | flowing colour fields, faster and brighter with the music |
| Inferno | AVS fire: the spectrum feeds the flames |
| Kaleidoscope | the waveform and floating lights, mirrored into twelve slices |
| Beat Fountain | every beat throws a burst of sparks |
| Spectrum Ridges | the spectrum's recent past as glowing ridges |
| Ripples | every beat drops a ring into still water |
| Retro Grid | a synthwave horizon: the sun pulses, the grid races with the bass |

**Twelve more classics** (2026-10-23: hypnotic and rhythmic, unusual, or very harmonious):

| Visual | What you see | Suits |
|---|---|---|
| Digital Rain | glyphs falling in columns - faster with the highs, brighter where the spectrum is loud | electronic, energetic, dark |
| LED Wall | a hi-fi's dot matrix: every band a column of lights, a peak light that sinks slowly | energetic, electronic, any |
| VU Meters | two needles on warm-lit dials, left and right - swinging as a tape machine's do | acoustic, calm, any |
| Spectrogram | the music's spectrum as it passes - the bass on the left, a waterfall of colour rising | calm, electronic, any |
| Spirograph | three gear-drawn roses turning into one another - their reach breathing with the music | calm, acoustic, any |
| Lava Lamp | warm blobs rising, melting into one another and parting again - swelling with the bass | calm, dark |
| Wave Tunnel | every moment's waveform a ring, flying away into a twisting tunnel - shaken by the kick | electronic, dark, energetic |
| Fireworks | every beat sends a rocket up; it bursts into a sphere of colour that falls slowly | energetic, any |
| Honeycomb | a field of hexagons lit from the middle out - bass at the heart, highs at the edge, a ring on every beat | electronic, energetic |
| Vinyl | a turning record that writes the music into its grooves as the needle passes - a ring of a song | acoustic, calm, any |
| Harmonograph | two pendulums drawing in harmony - slowly drifting ratios, the music swaying the pen | calm, acoustic |
| Spiral Galaxy | thousands of stars in spiral arms - the inner ones turning faster, the arms lit by the music | calm, electronic, dark |

**Plenio Drop**: visuals like Winamp's MilkDrop, drawn by Plenio's own renderer on the graphics card (nothing
is taken from MilkDrop). Each frame draws the last one again - zoomed, turned, bent, fading - and the music
on top, so trails, tunnels and swirls build up. When one Drop visual follows another, the picture stays and
glides into the new one.

| Visual | What you see |
|---|---|
| Drop · Nebula Swirl | a slow swirl of colour around a ring the music swells |
| Drop · Liquid Mirror | a line of sound melting upward, mirrored left and right |
| Drop · Star Gate | a tunnel rushing at you with the bass, the stereo picture at its heart |
| Drop · Kaleido Bloom | six mirrored slices, three shapes circling, the spectrum as a ring of dots |
| Drop · Pulse Rings | every beat drops a ring; the ripples carry the colour out |
| Drop · Aurora Curtain | green and violet light rising from a wave along the ground |
| Drop · Plasma Storm | the warp field wild, sparks of sound thrown into it |
| Drop · Vortex Engine | an outward spiral that turns faster when the mids push |
| Drop · Electric Lotus | eight petals of mirrored spectrum around a glowing core |
| Drop · Deep Dive | plunging forward, the image echoing back on itself |
| Drop · Mirror Hall | four mirrors and a slow turn |
| Drop · Solar Wind | both channels as streams of light, flaring with the highs |
| Drop · Neon Grid | a field of strokes along the flow, a line of sound across it |
| Drop · Ink in Water | colour spreading slowly, as ink in still water |
| Drop · Shockwave | every kick hits the picture: a jolt of zoom, a ring, a flash |
| Drop · Firefly Orbit | five lights circling, their trails woven into the dark |
| Drop · Cover Galaxy | the song's cover at the heart of a slow galaxy, its colours pulled into spiral arms that fill the sky |
| Drop · Title Smoke | the song's title at its start, then every line sung, rising as smoke |
| Drop · Lyric Tunnel | the words sung fly at you on the beat, through a tunnel of light |
| Drop · Album Kaleido | the cover folded into a turning mandala of ten mirrors, from the middle out to the edges |
| Drop · Cover Echo | the cover and its echoes falling away into the depth, thrown further on every beat, its light all around |
| Drop · Random | a preset made up now - a different one each time |

**Thirty more Drop visuals after MilkDrop's classics** (2026-10-23): each takes the idea of a classic of the MilkDrop preset packs - Geiss's *Cosmic Dust*, *Two-Pointed Spiral* and *Tokamak*, Rovastar's *Fractopia* and *Altars of Madness*, Flexi's *mindblob* and *infinite fractal*, Martin's *frosty caves*, Aderrasi's *Ambient Fire*, Krash's *Digital Flame*, Zylot's *Rainbow Orb Peacock* and more - and builds it anew in Plenio Drop's own format, with six new warp patterns made for them (twist, fold, lens, tiles, spiral, drain). *Suits* is what the visuals' *auto* mode matches with the song's genre and mood.

| Visual | What you see | Suits |
|---|---|---|
| Drop · Cosmic Dust | glittering dust drifting out of the middle, slowly turning - brighter where the highs sparkle | calm, electronic, any |
| Drop · Twin Spiral | an endless spiral whose eye wanders from one side to the other, winding the colours in | electronic, energetic |
| Drop · Living Coral | coral-like veins growing and branching slowly, as if the picture were alive | calm, dark |
| Drop · Bipolar Swirl | two lights circling each other, the swirl around them turning one way, then the other | energetic, electronic |
| Drop · Fractal Garden | the picture folded into itself frame by frame - a fractal of light that blooms and turns | electronic, dark |
| Drop · Altar of Madness | a tunnel and its own image turned over, burning into negatives when the bass hits hard | dark, energetic |
| Drop · Pyramid Dream | glowing triangles turning in a lens that breathes, mirrored into four | electronic, calm |
| Drop · Polar Night | curtains of light swaying over a dark sky, drifting slowly sideways | calm, acoustic |
| Drop · Mind Blob | a soft glowing blob that swells with the bass and wobbles in a breathing lens | calm, electronic |
| Drop · Infinite Mosaic | the picture in tiles of itself, tiles in tiles - on every beat a step deeper | electronic, energetic |
| Drop · Predator Prey | two spirals winding against each other - one hunts, the other turns away | electronic, dark |
| Drop · Frost Caves | cold light whirling slowly into the depth of an ice cave, its mirror image above | calm, dark |
| Drop · Liquid Diamonds | diamonds turning in a four-fold mirror, their light melting into soft facets | acoustic, calm |
| Drop · Unified Drag | the whole picture dragged along by the beat, its flow drawn as a field of strokes | energetic, electronic |
| Drop · Ember Rise | sparks of the spectrum rising from the ground in a warm, turbulent draught | dark, acoustic |
| Drop · Frozen Time | rings standing still in a hall of mirrors, the image within the image slowly fading | calm, dark |
| Drop · Digital Flame | the spectrum as a flame at the bottom, licking upward and narrowing to a point | energetic, electronic |
| Drop · Glowsticks | thick glowing figures of the sound swung through the dark, mirrored into four | electronic, energetic |
| Drop · Peacock Orb | rings of colour inside one another, swirled into the eyes of a peacock's tail | calm, electronic |
| Drop · Tokamak | a ring of plasma held in a field, twisted round and round - flaring on the kick | electronic, dark |
| Drop · Inkblot | a symmetric blot of ink spreading, folding and turning - what do you see in it? | calm, dark |
| Drop · Jelly Lanterns | soft glowing jellies floating upward like lanterns, pulsing gently with the beat | calm |
| Drop · Warp of Doom | everything pulled into a whirling drain, flashing into a negative on the hardest beats | dark, energetic |
| Drop · Sea Star | a five-armed star of light opening and closing in a five-fold mirror | acoustic, calm |
| Drop · Velvet Smoke | soft smoke curling upward from a quiet line of sound - slow, deep and warm | calm, acoustic |
| Drop · Hypno Disc | rings winding into an endless spiral that turns the other way every four beats | energetic, electronic |
| Drop · Strobe Lattice | a lattice of the picture in nine tiles, flashing on every beat - for the dance floor | energetic, electronic |
| Drop · Mandala Breath | a twelve-fold mandala breathing in and out with the music - calm, round and endless | calm, acoustic |
| Drop · Harmonic Rose | lights travelling along a three-petalled rose, their trails weaving a slow, harmonious flower | calm, acoustic |
| Drop · Cover Droste | the song's cover inside itself, again and again, winding into an endless spiral | calm, electronic, any |

**Plenio Nova** (2026-10-29): scenes the graphics card works out anew for every pixel and every frame - flights
through tunnels, fractals and a city, a black hole bending the starlight, liquid chrome, nebulae, the sea under the
moon; most of them in 3D, a few that grow from frame to frame (ink, living patterns, the song's last seconds as
mountains). The music moves them - the bass, its kicks, the mids, the highs, the beat, the spectrum, the waveform -
the colour scheme colours them, and every one goes through the same light: a glow round the bright parts, a filmic
tone curve, a touch of colour fringing on the beat, darker corners and fine grain.

| Visual | What you see | Suits |
|---|---|---|
| Nova · Hyperspace | warp speed through a tunnel of stars - the bass on the throttle, a flash at its end on every beat | energetic, electronic |
| Nova · Nebula | glowing gas and dark dust folding slowly into each other, a bright heart breathing with the bass, calm stars behind | calm, dark, acoustic |
| Nova · Black hole | a black hole bending the light of the stars round itself, its glowing disk spinning faster with the bass | dark, electronic, calm |
| Nova · Galaxy | a spiral galaxy turning, its bulge flaring with the bass and its arms brightening with the mids | calm, acoustic |
| Nova · Northern lights | curtains of light rippling over the stars, mirrored in a still lake below dark mountains | calm, acoustic |
| Nova · Moonlit sea | waves rolling under a big moon, its light a glittering path on the water - the swell rises with the bass | calm, acoustic |
| Nova · Neon rings | a flight through hexagonal neon rings, each lit by its own band of the spectrum | energetic, electronic |
| Nova · Mandelbulb | the famous 3D fractal turning in the dark, its shape breathing with the music | electronic, dark, calm |
| Nova · Gyroid caves | gliding through endless curved caves, their walls breathing with the bass, glowing veins along the way | electronic, calm |
| Nova · Spectrum city | flying low over a night city whose towers rise and fall with the spectrum, neon on the roofs | energetic, electronic |
| Nova · Outrun | a night drive down a neon valley towards a striped sunset, the grid pumping with the bass | energetic, electronic |
| Nova · Pulsar | the last seconds of the spectrum as ridge lines stacked into the distance - the famous album cover, alive | dark, energetic, electronic |
| Nova · Sound mountains | the song's last seconds as a neon mountain range: the newest at your feet, the bass in the middle | energetic, electronic |
| Nova · Liquid chrome | blobs of liquid metal melting into each other in a studio of lights, swelling with the bands | electronic, energetic |
| Nova · Sound sphere | a pearly sphere the spectrum shapes - the bass bulging its middle - inside a ring of the waveform | electronic, calm |
| Nova · Ink in water | three inks poured into swirling water - one for the bass, one for the mids, one for the highs | calm, acoustic |
| Nova · Living patterns | spots, stripes and coral growing by themselves as in nature's own chemistry; every beat sows new ones | calm, dark, electronic |
| Nova · Plasma globe | lightning crawling from the core to the glass, each arc a band of the spectrum, wilder with the highs | energetic, dark |
| Nova · Stained glass | a window of living stained glass, every pane lit by its own band, the lead glowing on the beat | energetic, electronic, acoustic |
| Nova · Laser show | laser fans sweeping through stage smoke, each beam a band - a new formation every eight beats | energetic, electronic |
| Nova · Mandala | an endless kaleidoscope of fractal lace, blooming with the bass, its finest threads lit by the highs | calm, electronic |
| Nova · Silk | ribbons of silk drifting in the dark, catching the light as they turn - soft, slow, rippling with the spectrum | calm, acoustic |

**Only what plays smoothly here.** Plenio Drop and Plenio Nova draw with WebGL 2 on the graphics card. A browser
without it - or one that draws WebGL with the processor, far too slow for them - is not offered either of them: the
visuals' settings say why, and the classic visuals play as ever. Each Nova visual is timed once on your graphics card,
a few seconds after the visual first shows (it takes a moment, in the background; the timings are kept for that
card in this browser): one that would not play smoothly even at a small picture is not offered on this computer -
the lists of one visual show it greyed, with why - and is timed again each time the player opens (a graphics card
busy with something else the first time, making a song, makes a visual look slower than it is); each of the others
gets as many pixels as keep it smooth. While a visual plays, the player watches the frames: when
they come late (the graphics card busy with something else, a heavy moment), it draws fewer pixels for a while and
more again when it can; a visual that still does not keep up is left out for the session and another one comes -
*Try again* in the visuals' settings offers it again. A song's or a playlist's own visual that this device does not
draw falls back to the mode.

**Write your own:** a Plenio Drop preset is a short text file of numbers and small formulas. *Edit a copy*
in the visuals' settings saves the visual that plays into your presets folder; change it in any editor, save,
and the visual changes on screen. Your presets appear as *My · <name>*. The guide:
[Plenio Drop: visuals of your own](player-visuals.md).

Open the visuals' settings with ✦ in Now playing (or press **V**):

- **Mode**:
  - *Match the music*: a visual that suits the song's genre, mood and tempo (the default). Calm songs get
    calm visuals, dance songs fast ones.
  - *Random*: a random pick from the visuals you tick, never the same twice in a row.
  - *Cycle*: the ticked visuals in turn.
  - *Fixed*: always the same visual: choose it in the list, or click its name among the visuals to choose from.
- **Change**: with every song, at every section (verse, chorus …), **every few seconds - also within a song**
  (10, 20, 30, 60 s or any number from 5), or *when the music drops in* after a quiet passage.
- **Crossfade**: how one visual turns into the next, and over how many seconds (0.5-8, 3 by default). Both
  visuals play on while it changes, and every soft change has a gentle swirl: the picture of the moment before
  drawn again a little larger and turned over it, so the two flow into each other like smoke.
  - *Morph - both into one* (the default): both visuals play together, each as bright as the other half way,
    and melt into one another until only the new one is left.
  - *Melt*: the new visual flows in through soft blots that drift and grow, like ink in water.
  - *Soft fade*, *Zoom through* (the old one swells away, the new one grows in), *Slide* (behind a soft edge).
  - *Flash on the beat*: the old visual plays on to the next beat, then the new one comes in a soft glow.
  - *A different one each time*: morph, melt, fade, zoom or slide, another at every change. *Cut*: at once.
  From one Plenio Drop visual to another the picture stays and its motion turns into the new one, over the same
  time. A song's video has the same choice (*a new visual … · Crossfade*).
- **This song**: a visual of its own for the song that plays. It is kept for that song.
- **The playlist**: a visual for the whole playlist that plays. You can also choose it on the playlist's page.
- **Look**: the song's colours, Winamp classic, neon, sunset or monochrome. **Sensitivity** makes the visuals
  react more or less. Switch the lyrics over the visual and the title card on or off.
- **The visuals to choose from**, compact even with a hundred of them: **find one** by name or by what it shows,
  or show only those that suit **energetic, calm, electronic, acoustic** or **dark** music. The groups (*Classic*,
  *Plenio Drop*, *Plenio Nova*, *My presets*) fold away and say how many of theirs are ticked; **all** and **none**
  tick or untick a whole group. Each visual is a small chip with its name - what it shows when the mouse rests on
  it - and the one that plays is outlined. **Click a name** to see that visual at once (with *Fixed* it stays,
  otherwise the mode takes over again at the next change); its tick lets the mode choose it. Under a group: what
  is not offered on this computer, and why.
- **Plenio Drop and Nova**: the **Quality** (*Fast* for a slow computer, *Balanced*, *Sharp*), **Edit a copy**,
  **Open my folder**, and any of your preset files that has a mistake, with what is wrong.
- **Visuals on** switches all visuals off (Now playing then shows the song's colours).

A song's own visual wins, then the playlist's, then the mode. **N** shows another visual right away.

## Playlists and the queue

**Playlists** in the sidebar lists the smart lists first: *Favourites*, *Most played*, *Recently played* and
*Never played*. Your own playlists follow. Make a new one with + in the sidebar, on the Playlists page, or
from a song's menu. On a playlist's page you can:

- rename it (click the name)
- reorder songs by dragging, or remove them
- add songs with the search
- give it a colour and a visual of its own
- play it in order or shuffled

The **queue** (the list icon in the bar, or **Q**) shows what played, what plays and what comes next. Drag to
reorder, remove songs, clear the rest, or **save the queue as a playlist**. It also holds the crossfade and
the **sleep timer**: stop after 15 to 90 minutes, with the music fading out over the last seconds, or after
this song.

A song counts as played after 30 seconds.

## Share your songs as a player

Give your music to others in one file: **Share…** in a view of the library or on a playlist's page, or
**Share as a player…** at the bottom of the sidebar, packs the player and the songs you choose into **one HTML
file that plays by itself**. Send it (by mail, a cloud folder, a USB stick); the other one double-clicks it and
has the Plenio Player with your songs - in any current browser, on Windows, macOS, Linux or a tablet, without
installing anything, without Plenio or ComfyUI.

- **Choose the songs**: tick them, or take all of the view, your favourites or a playlist at once; search to
  find some. The dialog shows how long and how large the file gets.
- **Sound**: MP3 at 128, 160 or 192 kbit/s (about 1-1.5 MB a minute). Never the FLAC or WAV.
- **Also**: the sheet music (PDF), your look (the visuals' and the lyrics' settings), your own Plenio Drop
  visuals, your playlists and your tags of these songs.
- **Files**: one file, or **parts** of at most 250 MB, 500 MB or 1 GB - see below. Above about 600 MB the dialog
  takes parts of 500 MB until you choose otherwise.

**Made in the background**: *Make the player* puts it in the queue (*In the making*, see below) - the player
itself makes it, so it goes on when you close the dialog or the page. 365 songs (2.6 GB at 192 kbit/s) take
about five minutes: the MP3s are made in several threads at once.

**Large files, and phones.** The file is laid out to be read from the top: the songs' list and the player come
first and start at once - the list shows within a second, also in a 2.6 GB file - and every song plays as soon
as its sound has arrived (the sidebar says *Songs arriving: 120 of 1095 files*; a song clicked before it is
there plays when it arrives). Once read, the page holds about 150 MB, whatever the size. What no file can
change: **a browser holds an HTML file in memory while it reads it** - opening a 2.6 GB file takes about 2.8 GB
for a few seconds (measured in Edge), which a computer has and most phones do not. For phones choose **parts**:
each part is a whole player of its songs (*All my songs (1 of 6).html* …), opens with about as much memory as its
size (a 500 MB part: under 600 MB), and favourites and playlists are the same in all of them. Phones open an HTML
file from their files app in Chrome or Firefox; on an iPhone a files app that opens web pages may be needed -
or open the whole player from your network instead ([see below](#the-player-in-your-network)).

In the shared player everything that needs no Plenio plays as here: the library with its search and filters,
a page per song with the lyrics and the notation following the music, Now playing with its four views, every
visual, the lyrics' look, playlists, the queue, Live Play, repeat, the sleep timer, the keys. The listener's
playlists, favourites and settings are kept in their browser. What it does not have: opening songs in
ComfyUI, folders and other music, new songs from ComfyUI, removing songs, videos, the unmastered take.

What stays out of the file: the FLAC and WAV files, the unmastered takes, the release records with their
workflows, and every path of your computer. The songs' details (style, brief, seeds) go in, as their pages
show them. The files are kept in the player's `packages` folder (`~/.plenio/player/packages`), listed under
*Shared players* in Settings, with *Download* and *Try it*.

## In the making: videos and shared players in the background

Videos and shared players are made in the background while you go on listening: **In the making** in the
sidebar (it shows once something is made, with how many are waiting or at work) lists them - each with how far
it is, **Stop**, and when it is done *Watch* or *Try it*, *Download* (every part of a shared player) and the
folder. *Clear the finished* tidies the list (the files stay).

- Videos are made one after the other, shared players one after the other - a video and a shared player at the
  same time.
- A **video** is drawn by the player's page: it goes on with the page in a tab in the background (also there
  at full speed), but not when the page closes - the browser asks before it does.
- A **shared player** is made by the player itself: it goes on when the page closes, and the page shows it
  again when opened.
- *Make the video* again with other settings puts another one in the queue (*Make another*).
- Stop: a waiting one never starts, the one at work stops and leaves no file.

## Save a song as a video

**Video…** on a song's page (or *Save as a video…* in its menu) makes an **MP4 video** of the song: a visual
moving with the music, and over it what you choose.

- **Size**: 1920 × 1080 (Full HD), 1280 × 720, 2560 × 1440 (QHD), 3840 × 2160 (4K), 1080 × 1080 or 2160 × 2160
  (square), 1080 × 1350 (4:5, an Instagram post), 1080 × 1920, 720 × 1280 or 2160 × 3840 (upright, for Shorts,
  Reels and TikTok). **24, 25, 30, 50 or 60 frames a second.**
- **Quality**: seven steps from *Low* (the smallest file) through *Medium*, *Standard*, *High* and *Very high* to
  *Best* - or **a bitrate of your own** (0.5 to 200 Mbit/s), **constant** if a platform asks for a constant rate
  (else variable: quiet parts take less, busy ones more). The dialog says what it means: so many Mbit/s, about so
  many MB a minute. **More about the encoding**: a full picture every 1, 2, 4 or 8 seconds (closer: a player jumps
  in it more quickly; farther: a smaller file), the encoder (as the browser chooses, the graphics card or the
  processor) and the sound (AAC at 128, 192, 256 or 320 kbit/s). The picture is H.264, which every player and
  platform plays.
- **The part**: the whole song, or from - to (in seconds; the section chips set a section). A part cut out
  of the song fades in and out.
- **The visuals**: **one visual** all the way, **a new one at every section** (verse, chorus …) or **every few
  seconds**. A strip shows the part of the song with its sections or spans, as wide as they last, each with a still
  of its visual; click one, and a **gallery** opens with every visual this browser can draw - classic, Plenio Drop,
  Plenio Nova, your own presets - each in a little window **playing to the music of that part**, so you see how it
  moves with this song before you choose. Jump to a group, find one by name, show only those that suit a mood; *large*
  shows larger windows with what each one shows.
  The first window, **At random**, leaves the choice to the dice: *Shuffle the random ones* draws others, from the
  visuals ticked in the visuals' settings, from those that suit the song, or from every visual. **The same visual for
  every chorus, every verse …** (on by default) gives every section of one name the visual of the first one - a
  choice for one is a choice for all. **Change on the beat** lets a change wait for the next beat (at most a second
  and a half). The **crossfade** (morph, melt, fade, zoom, slide, flash on the beat …) and how long it takes; the
  colours - and, if you like, **other colours at every change**. The visuals chosen are kept per song.
- **The look**: **the cover behind the visual** - blurred, slowly drifting, glowing through the dark of the visual;
  **breathes with the beat** - the picture grows a little on every beat; **how strongly the visuals react**;
  **film grain**; **darker corners**; **cinema bars** (2.39:1, for a wide video); **in from black, out to black** (on
  by default); **the section's name** in large letters for a moment as each section begins; **an end card** - the
  cover, the title and who made it (the song's artist and album, *Guest · Party-Song …* for a party song) over the
  last seconds.
- **Over the visual**: the **lyrics** as subtitles, as **karaoke** (large, the line before and after it) or
  **word by word** (the word sung now large, popping in on a little tilt, the words before it smaller above),
  lit up as they are sung - in the player's font, colour and effect, or another for the video (*as in the
  player* brings the player's back).
  - **Where**: at the bottom, in the middle, at the top - or **a new place every line** (one of nine spots,
    never the one before, slightly tilted).
  - **A line comes in**: fading, rising from below, zooming in (a little past, then back), dropping in with a
    bounce, coming into focus, wiped in, glitching in - or a different one every line.
  - **On the beat**: a line comes in in one beat of the song's tempo, and the lyrics pulse with the beat.
- **The cover, all the way through**: in a corner, at a side, in the middle or **drifting slowly** over the
  picture; its size; **rounded, square, round or a spinning record** (33 turns a minute, the cover as its
  label); pulsing with the beat. The song's name in the corner keeps clear of it.
- **Also over the visual**: **the notation**, the line of music sounding with a cursor at the notes and the
  notes aglow; a **title card** at the start with the cover; the song in the **corner**; a **progress bar**
  with the sections; *made with Plenio*.
- **Into the visual**: the title at the start, the line sung and the cover drawn into a Plenio Drop visual's
  smoke - they melt and swirl with it (over a classic visual: a soft glow). The Drop visuals *Cover Galaxy*,
  *Title Smoke*, *Lyric Tunnel*, *Album Kaleido* and *Cover Echo* draw the song by themselves - also in the
  player.
- **Sound**: the master, or the unmastered take.

**Preview** draws one frame as the video will show it. **Make the video** puts it in the queue ([In the
making](#in-the-making-videos-and-shared-players-in-the-background)): every frame is drawn from the song's own
sound - the visuals react exactly as when it plays - and encoded on the graphics card where the browser can:
usually several times faster than the song lasts (12 seconds of Full HD in about 3 seconds on a current
graphics card). The dialog shows it grow, how fast and how long it still takes; close it, and it goes on.
The finished MP4 (H.264 with AAC sound) is in the player's **videos** folder (`~/.plenio/player/videos`);
download it, watch it, or open the folder - also later, under *Videos* in Settings. The video settings are
kept for the next one.

It needs a browser that can encode video (WebCodecs with H.264): current Chrome and Edge can, on Windows,
macOS and Linux. Each preview and each video gives its graphics memory back as soon as it is done, and a video that
fails is tried once more by itself; when the browser runs out of memory all the same, the message says so - close
other tabs, or choose a smaller size or 30 frames a second.

## Live Play: make songs at a party, and they play

**Show the visual** at the top of Live Play puts the party on the big screen: Now playing with only the visual,
on the whole screen (Esc goes back). The guests' QR code can stay over it (see below).

**Live Play** (in the sidebar) is a playlist that plays while you change it - and the songs you make in
ComfyUI join it as soon as **Export Release** has written them. Make songs while the party goes on; a moment
after each export it is in the playlist.

**Start** it with the queue as it is, with a playlist, with the newest 10-100 songs, or empty (it waits for
the first song ComfyUI makes). While it runs, *LIVE* shows in the sidebar and in the bar at the bottom.

**Change it while it plays:**

- drag a song to another place (⠿), or drop it at the end
- ▶ plays a song now, ↑ plays it next, × takes it out
- **Add songs**: search the library and add a song *next* or *at the end*
- *Played* lists the last songs; **Again** plays one once more after the song that plays
- **Save as a playlist** keeps it

**New songs from ComfyUI** (switch off *join by themselves* to only be told of them):

- **next** - right after the song that plays (several new songs in the order they came)
- **at the end**
- **anywhere, at random** - somewhere after the song that plays

A message says where each new song went, *What happened* lists them (and what guests did), and a red **new**
mark shows on them (here and in the library) for a quarter of an hour.

**At the end** Live Play starts again **from the top**, or **waits for the next new song** and plays it the
moment it comes. Live Play stays on when you close the page and open it again, and so do its rules. The
player asks for new songs every few seconds; it reads its folders again for it, at most every two seconds.

### Guests in your network

Switch on **Let guests see the live playlist** in Live Play, and everyone on the same network - the party's
Wi-Fi - opens a page of their own on the phone: the song that plays (with how far it is), what comes next and
what played. The music keeps playing on your computer; the phones get no sound and no files.

- **The way in**: a QR code and an address like `http://192.168.178.23:8770/Ab3dE…/`. The last part is made
  at random; **New address** makes another one at any time, and the old one leads nowhere from then on.
- **Guests may** *only look*, or *change it*: move a song up or down, take it out, and search your library to
  add a song next or at the end. The song that plays and the ones already played stay as they are. A message
  and *What happened* say what a guest did.
- **On the screen**: the QR code and the address, only one of them, or nothing - as a card in Live Play and in
  Now playing (it stays when the controls fade, for a screen the room sees). **Show it big** (or a click on
  the card) shows it over everything.
- **Over the visual**: whether the card shows on the visual on the whole screen too (on by default), in which
  corner, and how large - *large* for a room to scan from afar. Also in the visuals' settings (✦), as *The
  guests' way in over the visual*.
- **Reactions**: the guests' page has 🔥 ❤️ 🎉 👏 💃 😂 under the song that plays. A tap floats up an edge
  of your screen - over the library, Live Play, Now playing and the visual on the whole screen - and every song's
  reactions are **counted and kept** (`reactions.json` in the player's state folder): Live Play and the song's page
  show them (*🔥 12 · ❤️ 4 from the guests*), apart from your favourite heart; the guests' phones show them too.
  Choose **as many per song as they like** or **one per song and guest** - then a tap on another emoji changes the
  guest's reaction, and the same one again counts once. One phone sends at most 60 a minute, and at most 40 float
  at once. **Reactions** switches them off.
- **Hear them again** (on by default): every guest hears the songs made at this party again on their own phone,
  once they played - the guests', the users' and yours, made from the player since the party began; no other song.
  A party begins when you switch the access on or make a new address - or with **start a new party**; the settings
  show since when, and how many songs there are so far.
- *n guests are looking now* counts the phones that asked in the last half minute.

The access is a small server of its own on port 8770 (8771-8779 when it is taken), apart from the player,
which still answers this computer only. It answers only below the random part of the address - the guests'
page, the live playlist with titles and covers, the reactions, the audio of this party's songs that played and of
a guest's own song waiting to be released, and in *change* mode the library's titles to add from. The
first time, **Windows may ask whether Python may accept connections**: allow it for private networks, or
the phones cannot reach the player. On a network you do not trust (a café, a hotel) leave it off. It stays on
when the player starts again, with the same address; `--guests-host` (or `PLENIO_GUESTS_HOST`) sets where it
listens (every network by default). Guests see the live playlist while the player's page is open - the page keeps the playlist.

## Party songs: guests make songs

At a party - or at home - your guests and users make **songs of their own** from the player: they pick a style,
say in a few words what the song is about, and press **Generate Song**. The studio - YuE2 in the ComfyUI on this
computer - writes the lyrics, composes, sings and paints the cover, one song after the other; when a song is ready it
joins **Live Play** as every new song does (next, at the end or at random, as you set it there).

**Switch it on**: *Settings > Party songs > Let people make songs* (you as the admin; it is off until you do) and
choose who may: **logged-in users**, **guests** - in the network without an account, and the party's phones on
Live Play's guests' page -, and whether they may make **covers** too. Also: how many songs one person may have in the
making (3), and the longest song (*about 4:00*). You as the admin always may, and longer and as many as you like.

**Make a song** (in the sidebar, with the number of your songs in the making; on the guests' page *Make your own
song*):

1. **A new song**, or **a cover** - then drop the original song (MP3, FLAC, WAV, M4A …; its melody, form, tempo and
   key stay).
2. **Pick a style**: a vibe (*Pop*, *Rock*, *Latin*, *EDM* … - each click another template of it), any of the style
   templates by name, or **Surprise me**. The style fills every field below - and the description.
3. **How it should sound - and what it is about**: the description (how it sounds), filled from the style, and for a
   sung song the lyrics: **The writer writes them from an idea** (the style's idea, or yours) or **My own lyrics, sung
   as written** - one line per sung line, a blank line between verse and chorus; the title then comes from your words.
4. **The details**: genre, mood, tempo, length, vocals, language, voice, theme, key and meter - each a list of every
   value the style templates have, or **✎ Your own …** to type one instead. Only what applies is asked: an
   instrumental has no voice or lyrics, a cover no tempo or length.
5. **Generate Song**.

**Presets** - above the style: a click sets the form's fields and, with the whole studio, its settings and how
many takes:

| Preset | Sets |
|---|---|
| **Best quality** | HQ mastering, cover art, the best of three takes for the words, FLAC and MP3 - takes longest |
| **Party - fast** | about 1:30, cover art, no HQ mastering - ready in a few minutes |
| **Quick sketch** | about 1:00, no cover art - the fastest way to hear an idea |
| **Full song** | about 3:00, HQ mastering, cover art, the better of two takes for the words |
| **Three takes** | one song, sung and played three times, with cover art |
| **Instrumental** | no singing |

**Save as preset…** keeps the form as it is under a name - the style, genre, mood, tempo, length, vocals,
language, voice, theme, key and meter (not the description: that is the song), the studio's settings and the
takes; your presets come after the built-in ones, × forgets one. A preset sets only what applies: the party's
guests get its length and vocals, a cover keeps its own length. A style chosen after a preset fills the style's
fields and keeps the preset's length and vocals (*Party - fast* stays about 1:30).

**How many** (the whole studio): 1 to 4 - **takes of one song** (the song is made, then its takes follow at the
head of the line: the same words and notes, sung and played anew; keep the one you like best) or **different
songs** of this form, each with words and music of its own.

**The studio**: songs are made by the ComfyUI on this computer; the player plays without it. When it is not
running, *Make a song* says so and offers **Start the studio** - see [The studio](#the-studio-comfyui-started-by-the-player).

**Your songs** - in their order, each with its title once made (before: its style, length and voice, and the start
of its description), and where it is:

- **#2 in line** - and roughly when it will be ready (*ready about 21:40*). **↑ ↓** move it past your next song (the
  admin moves any song), **✎** changes it, **✕** takes it out.
- **Being made** - for how long, what the studio does now (*writing the lyrics*, *composing*, *singing and playing*,
  *painting the cover*, *mastering and saving*), roughly when it is ready. **✕** stops it.
- **Ready 21:14** - in the library and at the party; **▶** plays it.

### Before everybody hears a new song

*Settings > Party songs > Before everybody hears a new song*: a song made from the player joins the songs - and
Live Play - as soon as it is ready (the default), or it waits:

- **Its maker hears it first** - on their own device, in *Make a song* (a guest on their phone, on the party's
  page): ▶ to hear it, then **Release it** or **Don't release**.
- **An admin approves it** - you or a helper, in *Make a song* under **Waiting for your approval** (the sidebar
  counts them): hear each one on this device, then **Approve** or **Reject**. With both on, the maker releases it
  first and an admin approves it after.

Songs of the admins (you and the helpers) are released at once. A waiting song is made into a folder of its own,
`_waiting/<number>` beside its folder, which the library does not read - so nobody else sees or hears it, and Live
Play does not take it in. Released, it moves to its folder (a name taken there gets a number) and comes in as a new
song; one not released or not approved is kept in `_waiting/not released`, nothing is deleted.

### Again: a new take, a new song like it, a cover of it

Any song of the library can be made again - one of your own party songs, a song of a playlist, a song that is years
old. **A new version…** (the wand) opens it: on a song's page, in its ⋯ menu, in a playlist's rows and in Live Play's
*Up next*; a finished song of yours has **Again…** (the wand) beside **▶** in *Your songs*.

- **A new take** - *the same song, sung and played anew*: title, style and lyrics stay as they are, and the studio
  sings and plays the very same notes once more. You may change the title, the style or the lyrics first; **new words
  get new notes**, the rest stays of the song. Nothing is written and nothing is planned anew - the take keeps the
  song's words and notes; its singing, mastering and saving take as long as a new song's of its length (on an RTX 5060
  Ti about 2:45 for a take of a 1:30 song). A take of a cover also reads its original's melody and words once more.
- **A new song like it** - its style and brief fill the form (genre, mood, tempo, length, vocals, language, voice,
  theme), and the words and the music are new. Change what you like and *Generate Song*.
- **A cover of it** - its own audio file is the original: its melody, form and tempo stay, in the style you choose.

What is not possible is said where the choice is, with the reason: a new take is YuE2's, so a song made with MiniMax
Music 3, a song finished from a file, or a song whose release record has no lyrics or no score keeps *a new song like
it* and *a cover* only. A new take of a cover needs the cover's original recording still in ComfyUI's input folder;
without it the cover is made again as a new song like it or as a cover of it. A cover's words stay as they are in its
new take - they follow the original's melody -, its title and style can change.

### The whole studio from your network

Who comes through *In your network* (the player opened from a phone or another computer with the link) has **the whole
studio**: the simple form, and below it **Every setting of the studio** - the writer model, HQ mastering, Cover Art,
and the rest of the Song Brief (arrangement, genre closeness, creativity, lyrics fidelity, a cover's excerpt) -, and
**Export Release**: the folder (a folder below ComfyUI's output folder, made when it is not there), the name and the
collision rule, FLAC, MP3 and WAV, the tags (artist, album, date, track, genre, comment, composer, lyrics), the sheet
music and the subtitles. Fields that do not apply are not shown: a voice only for sung vocals, the tags' own fields
only while tags are written. One line above the settings says how the song will be made (*HQ mastering off · cover
art on · gemma4_e4b · output/plenio/Cleo · FLAC*).

The same holds for the admin, and for the songs in the line: a waiting song keeps its settings, and *Edit* brings them
back. A new take starts from the song's own settings and release - its folder, album and artist, with a new number
for its files, never over the song it comes from -, a new song like it from the song's settings and the party's
release. Whoever comes through the network may also make songs while song making is off, and makes them as long as the
templates allow - the party's limits are for the party's guests. The admin switches it off with *Settings > Party
songs > From the network (In your network): the whole studio, at any time*.

**Who made it, while it plays** (*Settings > Party songs > Who made it*, not shown until you choose): a party song
shows the name of the one who made it - the user's name or *Guest* - all the way through, in Now playing and over the
visual:

- **Spotlight**: large as the song begins (*a party song on 27 October 2026 by …*, letter by letter), with every new
  section (*Chorus by …*) and as it ends (*made at the party on 27 October 2026 by … - thank you*); between, a small
  badge in the corner the guests' way in leaves free. The date is always the party's own - a song of an earlier party
  says when that was.
- **Drift**: the same moments, and between them the name floats slowly across the picture.

The name glows with the beat. The party's phones show *made by …* under the song that plays and in *Up next*. The
name comes from the song's tags: the album *Party-Song <date>* and its artist - songs made before show it too.

The times are estimates: from the song's length and how long the songs before took on this computer - the first
estimate is rough, then they get better. Songs wait in the player's own line until the studio takes them, one at a
time; your own runs in ComfyUI come first. When ComfyUI does not run, songs wait until it does.

Every song from the player: YuE2, **HQ mastering off** (twice as fast), **cover art on**. Only a song ordered on the
**party's page** - a guest's, from the phone - is a **party song**: saved in `plenio/Party-Songs-<date>` of ComfyUI's
output folder, album **Party-Song <date>**, artist **Guest**, named on the big screen while it plays. A song you or a
user makes in the player is saved like a song made in ComfyUI - the template's folder and tags - and joins your songs
(and Live Play while it runs) like every new song. The player reads the folder a song was saved in by itself, also
when it is not one of its folders. A shared player has none of this: making songs needs this computer.

It is made through Plenio's **[Song API](song-api.md)** - which other programs can use too.

### The studio: ComfyUI started by the player

The player runs on its own; ComfyUI is needed only to **make** songs, and nobody has to open a workflow for that.
**Settings › The studio** (the admin, on this computer):

- whether ComfyUI runs, **Start the studio** and **Stop it** (only a ComfyUI the player started itself), and
  **Open ComfyUI**
- **Start it by itself when a song is ordered** - a song ordered from *Make a song*, by a guest or through the
  network starts ComfyUI, and the song waits until it is ready (a ComfyUI that ends at once - its port taken, say -
  is tried again after two minutes; its log says why)
- **Stop the ComfyUI the player started after** 15 minutes, 30 minutes, an hour or three hours without a song
  (*never* by default) - the graphics card is free again
- **How it starts ComfyUI**: its folder (empty: the ComfyUI Plenio is installed in, else the one last started with
  Plenio), the arguments and the port (8188); the command it runs, and the end of its log (`comfyui.log` in the
  player's state folder). **With no arguments of your own, the player starts ComfyUI the way it was last started** -
  with its Python, your models folder (`--models-directory`) and your other options: every time ComfyUI loads Plenio,
  Plenio keeps how it was started (`comfyui-start.json` in the player's state folder). So start ComfyUI once the way
  you usually do (your `.bat`, the portable build, ComfyUI Desktop), and the player starts it the same way. Arguments
  you enter here win.

While a ComfyUI already answers on this computer - ComfyUI Desktop on port 8000, the ComfyUI that started the player
- the player counts it as running and starts none of its own. The Python is that ComfyUI's own - the portable build's
`python_embeded`, a `.venv` or `venv` - or else the player's. ComfyUI starts in the background, without a window, and stays on this computer: `--listen`,
`--enable-cors-header`, `--port` and the TLS arguments are refused (the network comes in through *In your
network*).

**When a song stops with "ComfyUI does not find the model file …"**: that ComfyUI does not see your models - mostly one
started without your models folder. *Settings › The studio* shows how it starts it; start ComfyUI once the way you
usually do, or enter `--models-directory <your folder>`. A model field of *Every setting of the studio* says so too,
when ComfyUI does not list the file it is set to.

## The player in your network

**Settings > In your network > Open the player from your network** opens the whole player to the devices in
your home network - a phone, a tablet, another computer - while it runs here: your songs, playlists, tags,
the visuals, Live Play, videos and shared players. The music plays on the device that opens it.

- **The link**: a QR code and an address like `http://192.168.178.23:8780/Ab3dE…/`. Open it once on a device,
  and from then on the address alone opens it there (the link leaves a cookie in that browser). Nobody without
  the link comes in. **New link** makes another one: the old link, and every browser let in by it, are out.
- **ComfyUI** too, when it runs on this computer: a second link (`…:8781/…`), and *ComfyUI ↗* in the sidebar of
  a page that came from the network. ComfyUI need not listen on the network itself (no `--listen`); *Open in
  ComfyUI* on a song's page works from there too.
- From the network the player does everything but **choose its folders, stop, open folders on this
  computer's screen and delete songs for good** (it retires them) - those are done on the computer itself.
- **Make a song** from there has the whole studio: every field of the template, the writer model, HQ mastering, Cover
  Art and Export Release's folder, formats and tags - at any time, also while song making is off for the party's
  guests ([Party songs](#the-whole-studio-from-your-network)).
- Two devices at once - or two tabs: the player counts the changes, and a page that saved after another merges
  the two instead of overwriting them (a playlist both changed keeps the one saved last, favourites and tags
  keep both sides' changes, plays add up). Every few seconds each page takes in what another changed.

It is two small gateways of the player's own on ports 8780-8789, apart from the player, which still answers
this computer only. The first time, **Windows may ask whether Python may accept connections**: allow it for
private networks. On a network you do not trust (a café, a hotel) leave it off. It stays on when the player
starts again, with the same link; `--network-host` (or `PLENIO_NETWORK_HOST`) sets where it listens (every
network by default). The sidebar's *ComfyUI ↗* also opens ComfyUI on this computer when it runs.

## Continue a song in ComfyUI

**Open in ComfyUI** on a song's page (or in its menu) opens ComfyUI in a browser tab with the song's
workflow - its brief, its lyrics, its score and its settings, as the song was made - ready for another take, a
new arrangement or an edit of the lyrics or the notes. It is the same as *File › Continue a Plenio song…*
in ComfyUI, or dropping the song's FLAC onto ComfyUI: the song's record travels from the player to the
ComfyUI tab.

It needs a ComfyUI with Plenio 1.0.0 or newer running on this computer. Which one: the ComfyUI that started
the player; else the address under **Settings › Open in ComfyUI**; else the player looks for one at
`127.0.0.1:8188` and `127.0.0.1:8000` (ComfyUI Desktop). The Settings page says which ComfyUI it found.

## Who is listening: the login

The player opens with **Who is listening?** - once per device:

- **A user** - their picture, then their password. A user keeps **their own** playlists, favourites, plays,
  tags and settings, the same on every device they log in on (a phone in the network, a laptop, this computer).
- **The admin** (*this computer* - only on the computer the player runs on) has the player's own playlists and
  settings, as they were before the login, and sets up the users: *Settings > Accounts* - *Set up a user*
  (name, password and group), a picture for each (click the round picture), a new password, rename, remove (their
  playlists and plays go with them).

Every user is in one of three **groups**, chosen when they are set up and changed in their row at any time:

- **Listens**: listens only - they may not make songs.
- **Makes songs**: listens and makes songs, when the party's settings let users make them (users set up before
  the groups are in this one).
- **Admin - a helper**: everything the admin may - set up users and their groups, approve songs, change the
  party's settings, start ComfyUI on this computer - from any device they log in on with their password, to step
  in when needed. Their own playlists, favourites and plays stay theirs; the player's own are the admin's. What
  only this computer does (choose the folders, stop the player, delete songs for good, switch *In your network*)
  stays this computer's, for a helper too.
- **Continue as a guest** - as before, without an account: what you keep stays **in this browser** only;
  another browser or device starts afresh.

A device stays logged in (a cookie) and remembers a guest's choice, so the page asks once. The name in the
sidebar (with its picture) logs out - and somebody else can log in. In *Settings > Accounts* a user changes
their own picture and password. Passwords are kept only as hashes (PBKDF2-SHA256) in `users.json` beside the
player's state; each user's things are in `users/<id>/` there. Eight wrong passwords from one device in ten
minutes make it wait.

## Your settings are kept

Everything you set in the player is kept - not in the browser, but by the player itself, on this computer
(for a guest: in the browser):

- your playlists, their order, colours and visuals, your favourites, your stars and play counts
- every setting: the visuals (mode, the ticked ones, a song's own visual), the colours, volume, crossfade and
  speed, the library's sort and view, and its search and filters (per view)
- the view Now playing opens in and the tab a song's page opens on
- where you stopped: the queue and the moment in the song (the player starts there next time)

It is saved half a second after each change, and once more when you close the page. So it is all still
there after closing the browser or restarting the computer, in another browser, and whether you started
the player from ComfyUI or by hand. *Settings* in the sidebar says **kept ✓** (or *saved ✓* after a change).

The **Settings** page starts with the version of the player that runs (and says so when the page is from
another version - reload it then). It shows what is kept, the file it is kept in
(`~/.plenio/player/state.json`), and when it was last saved, and it has:

- **Download a backup** - a `.json` file with everything above (the songs stay in their folders)
- **Restore a backup…** - read such a file back, on this or another computer
- **Start afresh…** - forget playlists, favourites, stars, play counts and settings (asks once more)

**Sound:** *Play the MP3 where a song has one* - a song exported as FLAC (or WAV) **and** MP3 (Export Release:
*mp3*) plays its MP3: about a sixth of the data, for a phone or another computer in the network. Settings says
how many songs have one; A/B still plays the unmastered take as it was saved.

It also shows the player in your network, where *Open in ComfyUI* goes (and *Open ComfyUI*), your tags, the
folders the player reads, the player's version, and **Stop the player**.

## Remove a song

A song you do not want any more: **Remove…** (👎) on its page, or *Remove from the library…* in its menu -
for the admin and the admins' group; listeners, makers and guests keep their own playlists, not the songs.
The dialog lists the song's files - the record, the audio of every take, the unmastered take, the cover,
the sheet music, the subtitles, the stems - and offers two ways:

- **Move to the retired songs**: the files go to `_retired` in the library folder, in the same subfolders
  as before (`output/plenio/…` → `output/_retired/plenio/…`). The player does not read that folder. To have
  the song back, move its files back and click **Look for new songs**. A song of the same name retired
  before keeps its place: the next one gets a folder of its own, named after the time.
- **Delete permanently**: the files are deleted, not moved to the recycle bin. The button asks once more
  (*Yes, delete 7 files for good*).

Either way the song leaves the queue, your playlists and your favourites. A song that is playing makes way
for the next one first. Only files in the song's own folder are touched, never a file the record names
elsewhere.

## Keys

| Key | Does |
|---|---|
| Space | play / pause |
| ← → | back / ahead 5 seconds |
| Shift + ← → | previous / next song |
| ↑ ↓ | louder / quieter |
| F | Now playing |
| Shift + F | only the visual, on the whole screen |
| I | the page of the song that plays |
| 1 2 3 4 | Stage, Lyrics, Notation, Visual |
| V | the visuals' settings |
| N | another visual |
| L | favourite |
| S | shuffle |
| R | repeat: the whole playlist, this song, off |
| B | A/B: master or unmastered take |
| W | lyrics as written or as sung (kept for the song) |
| M | mute |
| Q | the queue |
| / | search |
| H | help and the video tutorials |
| Esc | close |
| ? | all keys |

**The cursor follows the music** - through the instrumental parts too. The player finds the score's path
through the recording, frame by frame, by comparing the notes' pitch classes with the music (once per song, a
moment on its first notation; kept in the player's cache): where the take holds a chord longer than planned,
where it leaves part of its plan out. Until 1.1 the cursor followed only the sung syllables and ran straight
from one to the next - through an instrumental part often far too fast or too slow (in 85 % of the time between
syllables more than 4 s apart it ran over 30 % off the score's tempo), so it raced through and then waited at
the lyrics. Measured on 20 songs against their vocal stems: the score's vocal notes land within 0.15 s of a sung
onset 75 % of the time (the syllables gave 69 %), and 99 % of their time lies on the voice (94 %).

**Songs without measured times** (exported before 1.0.0): the cursor follows the music the same way -
*The cursor follows the music as the player heard it*. A YuE2 render is shifted against
its score, often by about a bar, and the shift wanders over the song; on the songs measured at export the
estimate lands within a few tenths of a second. If a song's cursor still runs ahead or behind, move it with
the buttons above the sheet (a quarter second or a bar at a time); the player keeps it for that song.

## Written and sung lyrics

A music model does not always sing what it was given: YuE2 may repeat a line, make one up, sing other words
or leave a line out - the more so, the freer the brief's creativity and a creative arrangement. Export Release
listens to every take (below), so it knows both: the **lyrics as written**, at the times they are sung, and
**what the take sings**, as heard. Both are kept in the release record, and the sung lyrics also in
`<name> (sung).srt` ([Lyrics subtitles](tags-and-subtitles.md#lyrics-subtitles)).

- **As written**: the song's lyrics. A line the take left out has no time of its own; one it made up is not
  there.
- **As sung**: what was heard, laid out like the lyrics wherever the take sings them - the lyrics' lines,
  their section tags and their spelling where the same word was heard; the words the lyrics do not have make
  lines of their own between them. It is what the ASR heard, so a misheard word shows as it was heard.

Every song shows its lyrics **as written**, and **as sung** only when you choose it - the ASR does not always
hear the word sung (a rare word, a name). Switch a song either way like master and original: the **Lyrics · as
written / as sung** chip in the player bar (key **W**), the switch on the song's *Lyrics* tab or in 🎤 in Now
playing - the choice is kept for that song. *Settings > Lyrics* sets the rule for every song (*As written*, the
default, or *As sung*) and forgets the songs' own choices with *Follow the rule again*. A song exported before Plenio kept what was sung shows its
written lyrics. *Save as a video* starts with what the song shows (*Which*, next to the lyrics). The song's
page says how far the take follows its lyrics - *This take sings 86 % of its lyrics' words as written, 12 words
they do not have, 2 lines not heard* - and names the sections it did not sing as written.

The lyrics as sung stay **as heard**: nothing corrects them after the export (a song exported with Plenio
1.2.0's *Check Sung Words* lists the words it corrected). Misheard words are corrected in one place only:
a cover's original lyrics, before the render ([Fix Misheard Words](../paths/yue2-cover.md#misheard-words)).

## Where the times come from

Since 1.0.0, Export Release listens to every song as it exports it. It writes when each lyrics line and
syllable is sung into the release record and into the [subtitle files](tags-and-subtitles.md), and for songs
with a score, where each syllable sits in the score. The player reads these times. On the songs measured
for 1.0.0, half the words were within 0.16 seconds and 82 % within half a second. Set to listen to the take's
vocal stem (Export Release's *lyrics heard on*, since 1.4.1 a choice - it takes extra time), words lit up while
nobody sings went from 2.5 % to 0.3 % in the songs measured ([how](tags-and-subtitles.md#lyrics-subtitles)).

- **Songs without measured times** - exported before 1.0.0, with *lyrics subtitles (SRT)* off, or when the
  lyrics ASR could not run - follow the **score's** times instead (since 1.1.0): where the player finds the
  score in the recording (as for the sheet's cursor, above), the lyrics lines light up as the score sings them,
  and the page says *Times estimated from the score and the music, not measured* and why the song has no times
  of its own (the record of a song exported since 1.1.0 says it). On songs whose times were measured, the
  estimate starts half the lines within 0.15 seconds and 83 % within a second. Where the player cannot find
  the score in the recording, or the song has no score, the lyrics stay plain text and the page says why.
  Open the song with *File > Continue a Plenio song…* and export it again to measure the times.
- **Songs with subtitle files but no times in the record** (a record edited by hand) take the times from the
  `.srt` files.
- **Recordings** from Enhance & Master have no score. They play with their waveform and visuals, without
  notation.

## Limits

- The player plays what the browser can play: FLAC, MP3 and WAV work in Chrome, Edge and Firefox (and in
  Safari since version 11).
- The sheet music tab uses the browser's PDF viewer. If your browser has none, use *Open the PDF*.
- The player does not edit songs. It moves or deletes their files only when you remove a song.
- Other music plays what the browser can play: OGG and Opus not in Safari, M4A (AAC) not in every Firefox.
- The player keeps a cache of the records it has read in its state folder, so on later starts it reads
  only new or changed records again.
