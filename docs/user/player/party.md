# Plenio Player: Party

Live Play and your guests: the live playlist, the party's page on their phones. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## The party's page in the guest's language
<!-- media: player.party.languages -->

The page your guests open with the party's code speaks their phone's language: English, German, Spanish, French,
Italian, Portuguese or Japanese - English for every other. Song titles and names stay as they are. The player
itself, and the song form below *Make your own song*, stay English. To start a party in one step, see
[People & access › Start a party](people.md#start-a-party-end-the-party).

## Live Play: make songs at a party, and they play
<!-- media: player.party.live-play-make-songs-at-a-party-and-they-play -->

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
