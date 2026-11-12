# Plenio Player: People & access

Who comes in and what each may do: your devices, a party, people with accounts. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## The player in your network
<!-- media: player.people.the-player-in-your-network -->

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
  guests ([Party songs](making-songs.md#the-whole-studio-from-your-network)).
- Two devices at once - or two tabs: the player counts the changes, and a page that saved after another merges
  the two instead of overwriting them (a playlist both changed keeps the one saved last, favourites and tags
  keep both sides' changes, plays add up). Every few seconds each page takes in what another changed.

It is two small gateways of the player's own on ports 8780-8789, apart from the player, which still answers
this computer only. The first time, **Windows may ask whether Python may accept connections**: allow it for
private networks. On a network you do not trust (a café, a hotel) leave it off. It stays on when the player
starts again, with the same link; `--network-host` (or `PLENIO_NETWORK_HOST`) sets where it listens (every
network by default). The sidebar's *ComfyUI ↗* also opens ComfyUI on this computer when it runs.

## Who is listening: the login
<!-- media: player.people.who-is-listening-the-login -->

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
