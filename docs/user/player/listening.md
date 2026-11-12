# Plenio Player: Listening

Open the player, find your songs, a song's page, Now playing, playlists, keys. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## Finding your way
<!-- media: player.listening.finding-your-way -->

The player has five places, the same in the sidebar of a computer and in a phone's tab bar: **Songs**, **Playlists**
(with Favourites, Most played, Recently played and your saved filters), **Live** (Live Play and the party),
**Make**, and **More** (People & access, In the making, Help, Settings). **Settings** opens on *Basic* - eight
settings most people change -; *Everything* has every section as a tab, and *Find a setting* searches every
label. A new player shows three cards once: your songs, *F* for the show, a party.

For remote controls, stream decks and home automation, the player has an API of its own:
[Player API](../../api/player.md).

## Open the player
<!-- media: player.listening.open-the-player -->

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

In the Plenio folder (`ComfyUI/custom_nodes/Plenio-Music-Production-System`), with Plenio from GitHub (`git clone`
or the release zip - the ComfyUI Manager's package leaves the two start scripts out, see
[two ways to install](../getting-started.md#two-ways-to-install); there, use the command below):

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
<!-- media: player.listening.on-a-phone-a-tablet-and-a-large-screen -->

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
<!-- media: player.listening.help-and-tutorials -->

**Help & tutorials** (in the sidebar, *Help* on a phone, or **H**) has short guides by topic - first steps,
finding songs, Now playing and the visuals, Live Play and the party, making songs, phones and other computers,
videos and shared players, what to check when something does not work - and the narrated **video tutorials**.
The search above them finds a guide's lines and the tutorials by every word typed. A tutorial plays in the
page, from `youtube-nocookie.com`, after a click on it: nothing is loaded from YouTube before.

## Your folders, and other music
<!-- media: player.listening.your-folders-and-other-music -->

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
<!-- media: player.listening.the-library -->

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
| `creativity:>100` `creativity:40-60` `creativity:adventurous` | the brief's [creativity](../concepts/creativity.md) (0-200) or its level: steady, restrained, balanced, varied, experimental, adventurous |
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
<!-- media: player.listening.a-songs-page -->

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
<!-- media: player.listening.now-playing -->

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

## Playlists and the queue
<!-- media: player.listening.playlists-and-the-queue -->

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

## Continue a song in ComfyUI
<!-- media: player.listening.continue-a-song-in-comfyui -->

**Open in ComfyUI** on a song's page (or in its menu) opens ComfyUI in a browser tab with the song's
workflow - its brief, its lyrics, its score and its settings, as the song was made - ready for another take, a
new arrangement or an edit of the lyrics or the notes. It is the same as *File › Continue a Plenio song…*
in ComfyUI, or dropping the song's FLAC onto ComfyUI: the song's record travels from the player to the
ComfyUI tab.

It needs a ComfyUI with Plenio 1.0.0 or newer running on this computer. Which one: the ComfyUI that started
the player; else the address under **Settings › Open in ComfyUI**; else the player looks for one at
`127.0.0.1:8188` and `127.0.0.1:8000` (ComfyUI Desktop). The Settings page says which ComfyUI it found.

## Your settings are kept
<!-- media: player.listening.your-settings-are-kept -->

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
<!-- media: player.listening.remove-a-song -->

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
<!-- media: player.listening.keys -->

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
<!-- media: player.listening.written-and-sung-lyrics -->

A music model does not always sing what it was given: YuE2 may repeat a line, make one up, sing other words
or leave a line out - the more so, the freer the brief's creativity and a creative arrangement. Export Release
listens to every take (below), so it knows both: the **lyrics as written**, at the times they are sung, and
**what the take sings**, as heard. Both are kept in the release record, and the sung lyrics also in
`<name> (sung).srt` ([Lyrics subtitles](../concepts/tags-and-subtitles.md#lyrics-subtitles)).

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
<!-- media: player.listening.where-the-times-come-from -->

Since 1.0.0, Export Release listens to every song as it exports it. It writes when each lyrics line and
syllable is sung into the release record and into the [subtitle files](../concepts/tags-and-subtitles.md), and for songs
with a score, where each syllable sits in the score. The player reads these times. On the songs measured
for 1.0.0, half the words were within 0.16 seconds and 82 % within half a second. Set to listen to the take's
vocal stem (Export Release's *lyrics heard on*, since 1.4.1 a choice - it takes extra time), words lit up while
nobody sings went from 2.5 % to 0.3 % in the songs measured ([how](../concepts/tags-and-subtitles.md#lyrics-subtitles)).

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
<!-- media: player.listening.limits -->

- The player plays what the browser can play: FLAC, MP3 and WAV work in Chrome, Edge and Firefox (and in
  Safari since version 11).
- The sheet music tab uses the browser's PDF viewer. If your browser has none, use *Open the PDF*.
- The player does not edit songs. It moves or deletes their files only when you remove a song.
- Other music plays what the browser can play: OGG and Opus not in Safari, M4A (AAC) not in every Firefox.
- The player keeps a cache of the records it has read in its state folder, so on later starts it reads
  only new or changed records again.
