# Plenio Player: Sharing

Your songs as a player of their own, in one file. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## Share your songs as a player
<!-- media: player.sharing.share-your-songs-as-a-player -->

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
or open the whole player from your network instead ([see below](people.md#the-player-in-your-network)).

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
<!-- media: player.sharing.in-the-making-videos-and-shared-players-in-the-background -->

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
