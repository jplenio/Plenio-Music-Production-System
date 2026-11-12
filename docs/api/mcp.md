# Plenio for AI assistants (MCP)

`plenio_mcp.py` lets an assistant that speaks the [Model Context Protocol](https://modelcontextprotocol.io) make
songs with Plenio: ask it for "a bossa nova about rain on a tin roof", and it orders the song from ComfyUI, follows
it while it is made, and plays it in the Plenio Player.

It is one file in the repository's root, standard library only, built on the Song API's client
([examples/plenio_client.py](examples/plenio_client.py)). The assistant starts it; it talks over standard input and
output, **opens no port and talks only to this computer**: ComfyUI at `http://127.0.0.1:8188` and the player at
`http://127.0.0.1:8765`. It is part of a git clone and of the release download, not of the Comfy Registry package
(it is a program you start, not a node).

## Tools

| Tool | What it does |
|---|---|
| `make_song(description, genre?, length?, vocals?, language?, own_lyrics?)` | starts a song with *1 · YuE2 · Song* and answers at once with the job's id - a song takes minutes |
| `job_status(id, wait_seconds?)` | queued, running (with its stage), succeeded (with the song's id and title) or failed (with the reason); waits up to 60 s for a change |
| `list_songs(query?, limit?)` | the songs made, newest first |
| `song_details(id)` | a song's title, length, files, lyrics and style |
| `play_in_player(id)` | plays the song in the open player: next after the song that plays, or at once; with no player page open it answers with the song's address in the player |

## Set it up

You need ComfyUI with Plenio running, and Python 3.9 or newer (ComfyUI's own Python will do). Replace the paths
below with yours.

**Claude Desktop** - *Settings › Developer › Edit Config* (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "plenio": {
      "command": "<ComfyUI>/.venv/Scripts/python.exe",
      "args": ["<ComfyUI>/custom_nodes/Plenio-Music-Production-System/plenio_mcp.py"]
    }
  }
}
```

**Claude Code**:

```sh
claude mcp add plenio -- python "<ComfyUI>/custom_nodes/Plenio-Music-Production-System/plenio_mcp.py"
```

Another assistant: its MCP settings take the same command and argument (a *stdio* server).

ComfyUI on another port (ComfyUI Desktop: `8000`) or the player on another one: set `PLENIO_API` and
`PLENIO_PLAYER` in the server's environment (`"env": {"PLENIO_API": "http://127.0.0.1:8000"}` in the JSON above).
Only loopback addresses are taken: the server refuses to start with another one.

## What to expect

- A song takes a few minutes (the System Check and `docs/test-reports/` have measured times per card). The
  assistant asks `job_status` again until the song is done.
- *Play it* needs the player open in a browser on this computer (ComfyUI's *Plenio Player* button, or
  `python plenio_player.py`): the song is played through the [Player API](player.md). Without an open page the
  assistant gets the song's address to open.
- Errors come back as the tool's result in words (ComfyUI not running, a missing model file and where Setup gets
  it, an unknown song) - the assistant can say them to you.

## Tested

A scripted JSON-RPC session (initialize, the tool list, every tool, a refusal, a line that is not JSON) runs in the
unit tests against a stand-in for the Song API and a real player; the host tests run one against ComfyUI with
empty model files (the song is accepted, followed and fails at its first loader). Not tested: a whole song with real
models through an assistant.
