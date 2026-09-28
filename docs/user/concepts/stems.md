# Stems (separate and mix)

**Stems** splits a rendered (or uploaded) song into four stems - vocals, drums, bass, other - and mixes them back
together with your own balance. It is one optional block of two nodes:

```
… Render (or Load Audio) ─► Separate Stems ─► Stem Mixer ─► Plenio · Master ─► Export
```

| Template | Stems | Why |
|---|---|---|
| 1 · YuE2 · Song, 2 · YuE2 · Cover, 3 · MiniMax · Song, 5 · YuE2 · DAW | bypassed | the render goes to Master unchanged; press **Ctrl+B** to switch the block on |
| 4 · Enhance & Master | bypassed | switch it on to rebalance a recording you upload |

The block sits **before** mastering on purpose: the master then hears your mix, not the raw render.

## The residual: why a neutral mix is exact

A separation model yields *at most* four stems; whatever it cannot place - room tone, reverb tails, separation
errors - would simply vanish. Plenio computes it explicitly:

**`rest` = input − (vocals + drums + bass + other)**

`rest` is mixed as a **fifth strip**, not thrown away. That gives the block's core guarantee:

> **With neutral settings (every gain 0 dB, nothing muted or soloed, no compression, no sends) the Stem Mixer
> returns the input sample for sample - same rate, same length.** Separation errors can only ever affect what
> you changed yourself.

The separation report names the stems and how much energy the residual holds, so you can see how much the model
left behind.

## Separate Stems

| | |
|---|---|
| Input | the song (before mastering) and a **Load Audio Model** of kind *separation* |
| Output | the stems plus the residual, and the separation report |
| Contract | the input's rate and length, stems in float32 |

- The model works at **44.1 kHz stereo**. The node resamples to that rate, separates **chunk by chunk** with crossfades
  (the checkpoint's own chunk size), and resamples the stems back - so a 48 kHz render stays 48 kHz.
- A mono input is fed to the model twice (left = right); nothing else is guessed.
- ComfyUI caches this node: changing only the mixer does **not** re-run the separation.

## Stem Mixer

The node has one widget: a **strip per stem** plus `rest`. Under *Advanced* you can also see and edit the raw
`plenio.stem_mix/1` JSON - it is the same value the widget writes, never a second one.

| Per strip | Range | Notes |
|---|---|---|
| gain (fader) | −60 … +12 dB | −60 dB shows as `-∞` |
| M / S | on/off | **solo beats mute**; any solo silences every other strip, including `rest` |
| compression | 0 … 1 | one knob: threshold −12 … −30 dB, ratio 1 … 6, 10 ms attack / 120 ms release, **no make-up gain**; the report names the gain reduction |
| reverb send | 0 … 1 | to the one shared reverb bus |
| delay send | 0 … 1 | to the one shared delay bus |
| muted ranges | `[start_s, end_s]` | drawn on the strip's waveform: **drag** to mute a stretch, **click** a range to remove it |
| save | on/off | writes this stem as its own 24-bit FLAC on the next run (default: off) |

Every strip is there **before the first run** - vocals, drums, bass, other and the residual `rest` - so you can
set the balance for the run you are about to start. Dragging a fader writes the value live (the strip stays under
your pointer) and the release updates the whole node; every control carries a tooltip.

### A stem as its own file

A strip switched to **save** is written on the next run: 24-bit FLAC in `output/plenio/stems`, named after the stem
(`drums.flac`). A later run that writes the same stem gets `drums (2).flac`, so nothing is overwritten. The file
holds **that strip's own signal**: its gain, its compression and its muted ranges are applied; mute/solo and the
shared buses belong to the mixdown, not to one stem. The summary and the report name every file that was written.

Muted ranges cut a stem's content in that window with a 10 ms fade and are merged and clipped to the song. The song
keeps its length - cutting time out of the song would misalign the stems, so it is not offered.

### The effect buses

| Bus | Model |
|---|---|
| **Reverb** | convolution with a synthesised, seeded, decorrelated stereo impulse response; presets *room* (1.2 s), *plate* (1.6 s), *hall* (2.4 s) |
| **Delay** | stereo feedback delay; time in **ms** or a note value at 120 BPM; the first echo has the send level, feedback 0 ... 0.8 sets how much of each echo returns (0: a single echo); low-pass in the loop |

Both are deterministic: the same settings give the same result. A **send without its bus is refused** - the mixer
stops with a message instead of silently ignoring your send. Raising a send in the widget writes the documented
default bus settings along with it, so the first raise just works.

The mixer's **waveform of the last run** comes from the separation that produced the stems; before the first run the
strips show the documented stems and an empty waveform, and the node says so.

## Mixdown contract

- Float64 inside, **no normalisation**: the mixer never changes your loudness on its own.
- Output length = input length; effect tails are cut at the song end with a 50 ms fade.
- Peaks and per-strip gain reduction are reported; **Plenio · Master** sets the loudness afterwards.
- The mixdown and the separation each write a report; both reach *Export* in the templates.

## Model and licence

| File | Folder | Size | Licence |
|---|---|---|---|
| `model_bs_roformer_ep_17_sdr_9.6568.ckpt` | `models/audio_separation` | 527 MB | MIT (the trainer and the vendored inference code); the checkpoint was trained on MUSDB18-HQ, whose dataset terms are research-oriented |

The inference code is vendored in `plenio/third_party/msst` (pinned commit and per-file hashes in its `NOTICE.md`).
The checkpoint carries its own config, so a second file is not needed. `ComfyUI`'s missing-model dialog offers the
file when you switch the block on; Plenio itself downloads nothing.

The **0.3** release ships BS-RoFormer as the only separation model. An alternative checkpoint with the same
architecture can be dropped into `models/audio_separation` and chosen in *Load Audio Model*; other architectures are
refused with a message rather than guessed at.

## What is measured, what is not

- The authors report **MUSDB18-HQ SDR 9.66** for this checkpoint. Plenio has not re-measured the separation quality itself.
- Everything the mixer guarantees (neutral = input, solo/mute rules, range merging, bus determinism, lengths and
  rates) is covered by tests that run without the model.
- The **listening check (L2)** on real songs with the real weights is an owner task; until it is accepted, the
  block is marked **experimental**. `tools/studies/stem_study.py` produces the numbers (speed, VRAM, the
  neutral-mix and muted-range contracts) and - with `--write-audio <dir>` - the material for the verdict: the
  neutral mix, the four stems, the residual and one example mix as 24-bit FLAC. The checklist is in
  `CURRENT_STATUS.md` (L2) and the plan §6.

## Limits

- Separation quality is the model's, not Plenio's: dense mixes with wide stereo vocals are the hard case, and
  "other" holds whatever did not fit the three named stems.
- The residual keeps a neutral mix exact - it does **not** repair a separation error once you change gains.
- Separate files are written only for the strips you switch to **save**; *Export* always takes the mixdown (and the
  reports). The saved file carries the strip's gain, compression and muted ranges, not the mute/solo decision and
  not the shared bus tails.
- Effect buses are shared: every strip's send reaches the *same* reverb and the *same* delay, which is what keeps
  the mix reproducible.
