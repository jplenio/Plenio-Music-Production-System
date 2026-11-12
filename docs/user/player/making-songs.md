# Plenio Player: Making songs

Songs made from the player - by you, your people and your guests. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## Make a song: the short form
<!-- media: player.making-songs.short-form -->

**Make** opens with three things: *What should the song be about?*, the style chips, **Generate**. A chip takes a
template of that style - one that sings - and *another one* the next; the song gets every value of that template,
and your words become the idea its lyrics are written from (for an instrumental style, the start of its
description). **More options** opens the full form below: every field, the presets, covers, several takes at once.
A song you change or make again opens the full form by itself.

## Party songs: guests make songs
<!-- media: player.making-songs.party-songs-guests-make-songs -->

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

**The form remembers**: once a song is ordered, *Make a song* opens with its values the next time - the style,
the description, the lyrics, every field - and its configuration: the preset, the studio's settings, how many,
*release at once*. They stay until you change them. The player keeps them with your settings (each account its
own); a guest's phone keeps a guest's. What the form no longer offers falls back to its own: a style the templates
do not have, a length longer than the host allows now, a cover where the host turned covers off. A song made again
from another keeps only the configuration.

**Your own lyrics** get the section tag buttons - YuE2's own sections and **+ your tag**, tags of your own kept for
your next songs (see [Section tags](../concepts/brief-templates.md#section-tags)).

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
  page): ▶ to hear it, then **Release it** or **Don't release**. Who wants it simpler ticks **Release at once -
  without hearing it first** under the form: the song goes on as soon as it is ready (the form remembers the tick).
- **An admin approves it** - you or a helper, in *Make a song* under **Waiting for your approval** (the sidebar
  counts them): hear each one on this device, then **Approve** or **Reject**. With both on, the maker releases it
  first and an admin approves it after; *release at once* skips the maker's hearing, not the approval.

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
name comes from the song's tags: the album *Party-Song &lt;date&gt;* and its artist - songs made before show it too.

The times are estimates: from the song's length and how long the songs before took on this computer - the first
estimate is rough, then they get better. Songs wait in the player's own line until the studio takes them, one at a
time; your own runs in ComfyUI come first. When ComfyUI does not run, songs wait until it does.

Every song from the player: YuE2, **HQ mastering off** (twice as fast), **cover art on**. Only a song ordered on the
**party's page** - a guest's, from the phone - is a **party song**: saved in `plenio/Party-Songs-<date>` of ComfyUI's
output folder, album **Party-Song &lt;date&gt;**, artist **Guest**, named on the big screen while it plays. A song you or a
user makes in the player is saved like a song made in ComfyUI - the template's folder and tags - and joins your songs
(and Live Play while it runs) like every new song. The player reads the folder a song was saved in by itself, also
when it is not one of its folders. A shared player has none of this: making songs needs this computer.

It is made through Plenio's **[Song API](../concepts/song-api.md)** - which other programs can use too.

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
