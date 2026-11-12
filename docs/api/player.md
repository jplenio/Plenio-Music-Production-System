# Plenio Player API v1

A small, stable set of the Plenio Player's routes for remote controls, stream decks and home automation: see what
plays, play and pause, skip, seek, add a song to the queue, switch Live Play, and follow it all as events.

The player's page talks to its server over many more `/api/…` routes; those are the page's own and may change in
any version. The routes below are a contract: they keep their meaning through 2.x.

| | |
|---|---|
| **Base** | `http://127.0.0.1:8765/api/v1` (the player's address and port) |
| **Reference** | [player-openapi.json](player-openapi.json) (OpenAPI 3.1), also served at `GET /api/v1/openapi.json` |
| **Song API** | making songs is ComfyUI's: [README.md](README.md) |

## How it works

The music plays in a browser: the player's page. Its server knows only what an open page tells it. Every player
page reports what it plays - on each change and every few seconds - and takes commands the moment they arrive.

- A command goes to **the page that plays** (of several that play, the one that started last; of none that
  plays, the one that reported last). With no page open the answer is `409` with the code `no_player`: open the
  player in a browser first.
- A page that has not reported for 15 seconds counts as closed.
- With users (*Settings › Accounts*), each user has a queue of their own: a command acts on the pages of the
  user who sends it.

## Access

- **This computer** needs nothing.
- **Another device** comes in by the player's link of *My devices* (it reaches the player through that way in,
  with the link's cookie) and logs in to the player (the player's login page), then sends both cookies it got
  (`Cookie: plenio_net=…; plenio_session=…`). A device in the network without a login gets `401` with the code
  `unauthorized`. A player started with `--host` treats a device of the network the same way - it is never this
  computer.
- Requests that change something send **JSON** (`Content-Type: application/json`). A page of another site
  cannot send that without asking first, and the player never says yes - so a web page you visit cannot pause
  your music.

## Endpoints

| | |
|---|---|
| `GET /api/v1` | the API's name, version and paths |
| `GET /api/v1/openapi.json` | the reference |
| `GET /api/v1/now` | the song that plays, the position, the next three, Live Play |
| `POST /api/v1/transport` | `{"do": "play" \| "pause" \| "toggle" \| "next" \| "previous" \| "seek", "seconds": 42}` |
| `GET /api/v1/songs?q=…&limit=50` | the library, searched as the page searches |
| `POST /api/v1/queue` | `{"id": "<song id>", "where": "next" \| "end"}` |
| `GET /api/v1/live` | Live Play: on or off, and its rules |
| `POST /api/v1/live` | start or stop Live Play, or change its rules |
| `GET /api/v1/events` | Server-Sent Events: `now`, `queue`, `live`, `reaction` |

### What plays

```sh
curl http://127.0.0.1:8765/api/v1/now
```

```json
{
  "page": true, "playing": true, "position": 63.4, "duration": 182.0, "reported": 1.2,
  "song": {"id": "3f9c0a1b2d4e", "title": "Neon Rain", "seconds": 182.0, "genre": "synthwave",
           "audio": "/media/3f9c0a1b2d4e/audio", "cover": "/media/3f9c0a1b2d4e/cover", "page": "/page/3f9c0a1b2d4e"},
  "next": [{"id": "…", "title": "Paper Boats"}],
  "queue_length": 12,
  "live": {"on": false, "insert": "next", "auto": true, "atEnd": "again"}
}
```

`position` is estimated: the page's last report plus the time since (`reported`, in seconds). `page: false` means
no player page is open; `song` is then `null`.

### Play, pause, skip, seek

```sh
curl -X POST http://127.0.0.1:8765/api/v1/transport -H "Content-Type: application/json" -d '{"do": "toggle"}'
curl -X POST http://127.0.0.1:8765/api/v1/transport -H "Content-Type: application/json" -d '{"do": "seek", "seconds": 42}'
```

The answer is `202` with the command's number (`{"sent": 17}`): the page acts on it within a second.

### Find a song and queue it

```sh
curl "http://127.0.0.1:8765/api/v1/songs?q=genre:folk%20rain"
curl -X POST http://127.0.0.1:8765/api/v1/queue -H "Content-Type: application/json" \
     -d '{"id": "3f9c0a1b2d4e", "where": "next"}'
```

`q` takes what the library's search field takes: free words over title, genre, mood, style, lyrics and the
brief; field filters (`genre:pop`, `mood:warm`, `bpm:>100`, `bpm:90-120`, `key:Am`, `model:yue2`, `year:2026`,
`lang:german`, `vocals:instrumental`, `len:<3` in minutes, `creativity:>60`, `plenio:>=2.0`); the listener's own
`tag:party` or `#party`, `is:fav`, `is:unplayed`, `stars:>=4`; `has:pdf`; `"quoted phrases"`; `-` in front keeps
out what matches. The best matches come first, then the newest. The page and this API are tested against the
same cases.

A song made through the Song API is found by its record: `?record=plenio/Neon%20Rain.plenio.json` - the place
inside ComfyUI's output folder, which a Song API song id carries (`plenio_mcp.py` plays a new song this way).

### Live Play

```sh
curl -X POST http://127.0.0.1:8765/api/v1/live -H "Content-Type: application/json" \
     -d '{"on": true, "insert": "next", "auto": true, "atEnd": "wait"}'
```

Any of the four keys: `on`; `insert` (`next`, `end`, `random` - where a new song goes); `auto` (new songs from
ComfyUI join by themselves); `atEnd` (`again` from the top, or `wait` for the next new song).

### Events

```sh
curl -N http://127.0.0.1:8765/api/v1/events
```

```text
id: 7c1e09aa-0
event: now
data: {"page": true, "playing": true, "song": {...}, ...}

id: 7c1e09aa-14
event: queue
data: {"next": ["3f9c0a1b2d4e", "…"]}
```

| Event | When | `data` |
|---|---|---|
| `now` | first on every connection; then when the song changes or it plays or pauses | as `GET /now` |
| `queue` | the next three songs change | `{"next": [song ids]}` |
| `live` | Live Play's state or rules change | as `GET /live`, without `page` |
| `reaction` | a guest reacts to the song that plays | `{"kind": "fire", "song": "<id>"}` |

A comment line comes every 15 seconds. Reconnect with `Last-Event-ID` and nothing is missed; an id of an earlier
start of the player gets what is new from now. At most 16 streams are open at once (`503`, code `busy`).

## Errors

Every refusal of the API's routes is `{"error": {"code", "message", "hint"}}` (a request the player refuses before it reaches them - an unknown `Host`, a failure of the player itself - answers `{"error": "<text>"}`):

| Status | `code` | When |
|---|---|---|
| 400 | `bad_request` | not JSON, or not sent as `application/json` |
| 400 | `invalid_value`, `missing_field` | a value the endpoint does not take |
| 401 | `unauthorized` | a device in the network without a login of the player |
| 404 | `not_found` | no such song, or no such path |
| 409 | `no_player` | no player page is open for this account |
| 503 | `busy` | too many event streams |

## Not in v1

Volume, the visuals, playlists and the song pages are the page's own. A guest's party page has its own routes
(the guests' access) and is not part of this API.
