# Performance

How long a song takes, measured, and the budgets a release is held to (PD §6). Every number here comes from
`tools/bench.py` on the reference machine; a number that was not measured says so.

## How it is measured

`tools/bench.py` orders fixed briefs through the Song API of a running ComfyUI, three runs each with fixed seeds, and
reads the seconds per stage from each song's release record (`timings`, `plenio.timings/1`): the groups of the
template, the part spent loading models (`load`), the peak memory on the graphics card. The reference machine is an
RTX 5060 Ti 16 GB used as the second card (`CUDA_VISIBLE_DEVICES=1`), ComfyUI with the model folder of that computer,
automatic downloads off.

```bash
<python> tools/dev_server.py --gpu --models <models> --port 8197          # CUDA_VISIBLE_DEVICES=<the card>
<python> tools/bench.py --api http://127.0.0.1:8197 --label <version> --card "<card>" --report <file.md>
<python> tools/bench.py --check docs/test-reports/data/bench-<version>.json    # against the budgets
```

Runs of one brief differ a lot on one machine (1.6.0: `sung-90` took 113.8, 153.5 and 181.8 s with the same seeds),
and other work on the computer slows them (the finishing stage is the processor's). A brief that looks slower is run
again on an idle computer before it counts.

## Budgets

The budgets are 1.6.0's medians (`docs/test-reports/data/bench-1.6.0-baseline.json`,
[the report](../test-reports/2026-11-11-bench-1.6.0.md)). `tools/bench.py --check <report>` compares a report with
them; a brief slower by more than 10 % is *over budget*. A release whose report is over a budget says so in its
release checklist with a reason (`tools/release.py prepare` asks for the report and runs the check).

| Brief | What | Budget (median) | Peak memory |
|---|---|---|---|
| `instrumental-60` | an instrumental of about a minute, no cover art | 54.1 s | 2.3 GiB |
| `sung-90` | a sung song of about 1:30, no cover art | 153.5 s | 5.0 GiB |
| `sung-180-hq-cover` | a sung song of about 3:00 with HQ mastering and cover art | 534.3 s | 6.5 GiB |
| `cover` | a cover of a recording | not measured (needs a recording that may be used) | - |

## Where the time goes, and what 2.0 did about it

Phase 8 of the 2.0 plan took each hypothesis of PD §6.2 in turn: measure, and change something only where the gain
is above 5 % of a run. [The report](../test-reports/2026-11-12-bench-2.0.md) has every number.

| Brief | 1.6.0 | 2.0.0 | Per second of song |
|---|---|---|---|
| `instrumental-60` | 54.1 s | 57.0 s | -2.8 % |
| `sung-90` | 153.5 s | 165.8 s | -12.4 % |
| `sung-180-hq-cover` | 534.3 s | 591.5 s | -0.1 % |

The same seeds make songs of other lengths in 2.0, so a release is compared per second of song (`bench.py`
does so where both reports know the lengths); by the raw median the long brief is 10.7 % longer with 15 % longer
songs.

- **Finishing is most of a sung song**: 85 s of 166 s at 1:30, 444 s of 592 s at 3:00 with HQ mastering - 2.2 s per
  second of song for the 3:00 brief, on 1.6.0 and on 2.0 alike. It is the place to look next.
- **Cover art** is 29 s (5 %) of the long brief; the plan's smaller FLUX.2 files below 15.5 GiB are already there.
- **The writer's server** is ready 3.2 s after its start (10.0 s cold); keeping it loaded between songs would save
  that only where writer and music model fit the card together - not on 16 GB.
- **The music model loads** in under a second within a run; a cover painted between plan and take costs nothing
  measurable.
- **A new take** runs neither the writer nor the plan (tested in `tests/unit/test_song_api.py`).
- **The first song after a start** takes up to about one and a half times as long; the player's studio panel and
  Setup say so. The Song Sheet editor's code is fetched while the browser is idle.
- **Not measured**: workers on a second card (the reference machine's other card is not free for it), the cover
  brief (it needs a recording that may be used).
