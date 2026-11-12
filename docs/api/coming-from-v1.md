# Moving a program from Song API v1 to v2

For programs that make songs with Plenio over `/plenio/api/v1` - a DAW plug-in such as the Plenio VST3, a script,
a bot. **Nothing has to change**: v1 answers as Plenio 1.6.0 did, for the two templates it had, and a test replays
1.6.0's answers on every build. One thing can stop a program that reaches ComfyUI **from another computer**: since
2.0 such a request needs a token (below). This page says what to change, step by step, to use v2 where it helps.

The short table is in the guide: [README.md › Coming from v1](README.md#coming-from-v1).

## 0. A program on another computer: a token (needed with 2.0)

Plenio 2.0 asks a program on another computer for a token, on v1 and v2 alike (`[api] remote = "token"`, the
default). Without one it gets `401` with the code `unauthorized` and `WWW-Authenticate: Bearer`.

- Make a token in ComfyUI: *Plenio Setup › API access › Make a token* (shown once - copy it).
- Send it with every request: `Authorization: Bearer plenio_…`. Never in the address.
- In a plug-in: a field *Token* in its settings, kept like a password (the system's credential store where there
  is one). An empty field: no header (a program on the same computer as ComfyUI needs none).
- Show `error.message` and `error.hint` of a `401` to the user: they say where the token is made.
- The owner of the computer can also set `remote = "open"` in `<user>/plenio/config.toml` (as 1.x) - say that in
  the plug-in's help as the other way, with its risk (anyone in the network can then use the API).

## 1. The base address

`/plenio/api/v1` → `/plenio/api/v2`. Ask `GET /plenio/api/v2` first: `404` means a Plenio before 2.0 - keep v1 for
it (the Plenio Player does exactly that).

## 2. Jobs

| What | v1 | v2 |
|---|---|---|
| id | ComfyUI's prompt id (a UUID) | `job_` and 16 hex digits, the API's own |
| after a restart of ComfyUI | `404` | the job is still there: `failed` with `error.code` `interrupted` (or `lost`) when it was running; a finished job keeps its result and files |
| `Idempotency-Key` | per caller | per caller (a token is a caller); after `interrupted`/`lost` the same key starts a new run - send the same request again with the same key |
| times | `created_at`, `started_at`, `finished_at` | `created_at`, `updated_at`, `ended_at` |
| statuses | `queued`, `running`, `succeeded`, `failed`, `cancelled` | the same, and `waiting_for_review` |
| the result | `result.files[].url` under `/plenio/api/v1/jobs/{prompt id}/files/` | under `/plenio/api/v2/jobs/{job id}/files/`; and `result.song`, the song's id in `/songs` |
| the list | `GET /jobs?client=&template=` | `GET /jobs?status=&limit=` - a token sees its own jobs only |

A plug-in that keeps its open jobs across its own restart (a DAW project re-opened) stores the v2 id and asks
`GET /jobs/{id}` - it finds the job even when ComfyUI was restarted in between.

**Keep apart:** an id that starts with `job_` is v2's; any other is v1's. A program updated while a v1 job runs
follows that one on v1 to its end (the Plenio Player does this with its saved jobs).

## 3. Review stops (new)

v1 refused the review mode. v2 stops where the Song Sheet stops:

```json
POST /plenio/api/v2/jobs
{"template": "yue2-song", "fields": {...}, "review": ["text"]}
```

The job becomes `waiting_for_review` with `waiting_at: "text"` and `documents` (title, style, lyrics, each with its
SHA-256). Show them in the plug-in, let the user edit, then `POST /jobs/{id}/approve` with `{"documents": {"lyrics":
"…"}}` - edited documents are kept as written. `"review": []` runs straight through (send it when the plug-in has
no review screen: the DAW template stops by itself otherwise).

## 4. Following a job

v1: `GET /jobs/{id}?wait=30` in a loop. v2 has the same, and one stream for all jobs: `GET /plenio/api/v2/events`
(Server-Sent Events: `job.queued`, `job.running`, `job.progress`, `job.waiting`, `job.succeeded`, `job.failed`,
`job.cancelled`, `job.lost`). Each event carries the job's id and status only - ask `GET /jobs/{id}` for the rest.
Reconnect with `Last-Event-ID`; a `sync` event means something was missed: ask for the jobs again. A token sees
the events of its own jobs; at most four streams per token.

In a plug-in the stream is worth it when several songs are made at once; for one song the long poll is simpler.

## 5. Making a song again

v1: `POST /from-record` with the whole record in the body, then a new job from its answer. v2: `POST
/songs/{id}/again` with `{"as": "take" | "again" | "like" | "cover", "fields": {...}}` - one call, the answer is
the new job. The song's id is `result.song` of the job that made it, or from `GET /songs?q=`.

## 6. More templates

v2 runs all five: `yue2-song`, `yue2-cover` and also `yue2-daw` (a song for a DAW: the take with its stems and
sheet music - the natural template for a plug-in), `minimax-song`, `enhance-master` (masters an uploaded file).
`GET /plenio/api/v2/templates/{id}` lists each one's fields.

## 7. Errors

The shape is the same: `{"error": {"code", "message", "hint", "field", "details"}}`. New codes in v2:
`models_missing` (a model file is not there; `details` names it - Plenio Setup gets it), `needs_review` (approve
on a job that does not wait), `unauthorized`, `remote_off`, `busy` (too many event streams).

## The Plenio VST3

The VST3 is a repository of its own; this page is its change list. In the order of what it gains:

1. **Token field** in its settings and the `Authorization` header on every request (step 0) - needed for a DAW on
   another computer than ComfyUI.
2. **v2 when there**, v1 otherwise (step 1); store v2 job ids with the project, so a re-opened project finds its
   songs (step 2).
3. **`yue2-daw`** for stems and sheet music in one job (step 6).
4. **A review screen** for the lyrics before the take (step 3), with `"review": []` when it is switched off.
5. **`/songs/{id}/again`** for *another take* (step 5).

Not changed by 2.0 for the VST3: the fields, seeds, uploads (`POST /uploads?name=`), the files and their roles,
`GET /jobs/{id}/bars`.

## The Plenio Player

The player's party songs moved to v2 in 2.0 (`plenio/player/maker.py`): a song is a v2 job with `"review": []`;
a run ComfyUI lost is made again once with the same key; the job's events wake the player's worker at once; a job
the player saved before the update is followed on v1; a ComfyUI whose Plenio has no v2 is served on v1.
