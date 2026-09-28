# Refine (48 kHz)

**Refine (48 kHz)** brings a rendered song to 48 kHz and extends the missing top octave with a super-resolution model. It is one node with an optional model behind it, and it never touches the band the render already delivered.

Where it sits:

```
YuE2 Render ─► Refine (optional there) ─► Plenio · Master ─► Export
MiniMax Render ─► Refine (on by default) ─► Plenio · Master ─► Export
```

| Template | Refine | Why |
|---|---|---|
| 1 · YuE2 · Song, 2 · YuE2 · Cover, 5 · YuE2 · DAW | bypassed | YuE2 decodes at 48 kHz already; press **Ctrl+B** to switch it on |
| 3 · MiniMax · Song | **on** (engine *model*, preset *3 - MiniMax*: pre 10 kHz, crossover 9.5 kHz, post 19 kHz) | the owner's default for MiniMax renders |
| 4 · Enhance & Master | bypassed | switch it on for band-limited uploads (old MP3s, phone recordings) |

The model **always runs when it is connected** - also for an input that already reaches the top of the band
(the owner's decision, 2026-09-28). PRE shapes only what the model sees, the crossover decides what the model may
replace, and POST rolls its result off; nothing below the crossover changes. The report says so when the input was
already full band.

In every template the block is two plain nodes in a **REFINE** group - the super-resolution model loader and
*Refine (48 kHz)* itself - so all fields stay editable on the node.

## What it does, step by step

1. **Measure** the input's bandwidth (the highest frequency within 60 dB of the 1–4 kHz level).
2. **Condition** the model's input (**PRE**): a steep low-pass - 0 takes the model's own training condition,
   -1 leaves the input unchanged, any other value is the low-pass in Hz - then resampling to the model's rate.
   This shapes *only* what the model sees, never the band you keep.
3. **Run the model** chunk by chunk (5 s with 0.5 s overlap, crossfades, one derived seed per chunk).
4. **Join** the original (converted to 48 kHz) and the model's output with a **complementary crossover**: `LP(original) + HP(model)`, where the two filters sum to a pure delay. Below the crossover the result is the original, sample by sample; above it the model's content takes over.
5. Optional **POST roll-off** (linear phase): 0 = off, else a low-pass in Hz (16, 19 or 21 kHz are the usual
   steps) if the added air is too bright.
6. **Contract:** 48 kHz, exactly the input's duration, **no normalisation**. The report names the engine, the bandwidth before and after, the crossover, the loudness change, the peaks and the time.

A silent or very short input is only resampled, and the report says so.

## The engines

| Engine | What it is |
|---|---|
| **resample only** | the band-edge resampler (Kaiser, ≥ 100 dB stop band). No model file, no new content, bit-exact level. |
| **model** | the connected **Load Audio Model** (super-resolution). The first engine is **UniverSR** (ICASSP 2026): vocoder-free flow matching on complex STFT coefficients, 4 ODE steps, 8/12/16/24 kHz → 48 kHz. |

The model engine is **mono** inside: every channel is enhanced on its own - the stereo image is untouched.

**No silent fallback:** *resample only* is a visible engine choice. With *model* and no Load Audio Model connected, the node stops with a message that says what to connect.

## Models and licence

| File | Folder | Size | Licence |
|---|---|---|---|
| `pytorch_model.bin` (UniverSR audio) | `models/audio_sr` | 229 MB | **CC BY 4.0** (weights), MIT (inference code) |

ComfyUI's missing-model dialog offers the download when you open *3 · MiniMax · Song*; you can also put the file there yourself. The inference code is vendored in `plenio/third_party/universr` (pinned commit and per-file hashes in its `NOTICE.md`), so nothing is installed and nothing is downloaded by Plenio itself.

## Presets and parameters

The **preset** list box sets PRE, POST and the crossover in one go; the crossover always sits 500 Hz below PRE
(owner's rule, 2026-09-28):

| Preset | PRE | Crossover | POST |
|---|---|---|---|
| 1 - pre 6 kHz / post 16 kHz | 6 kHz | 5.5 kHz | 16 kHz |
| 2 - pre 8 kHz / post 19 kHz | 8 kHz | 7.5 kHz | 19 kHz |
| **3 - MiniMax: pre 10 kHz / post 19 kHz** | 10 kHz | 9.5 kHz | 19 kHz |
| 4 - pre 12 kHz / post 19 kHz | 12 kHz | 11.5 kHz | 19 kHz |
| 5 - pre 14 kHz / post 21 kHz | 14 kHz | 13.5 kHz | 21 kHz |
| *custom - the three fields below* | `pre_hz` | `crossover_hz` | `post_hz` |

A preset wins over the three fields; *custom* uses them as they are. The **MiniMax template** ships preset 3 *and*
the matching numbers in the fields, so switching to *custom* keeps the same sound. The report names the preset that
applied.

| Setting | Default | Meaning |
|---|---|---|
| `engine` | *model* in MiniMax, *resample only* elsewhere | which engine runs |
| `crossover_hz` | 0 = measured edge − 500 Hz | where the model takes over from the original (used by *custom*) |
| `sr_gain` | 1.0 | level of the added band (lower it if the air is too strong) |
| `preset` | *custom* | a prepared stage template (table above) |
| `pre_hz` | 0 | low-pass of the model's input: 0 = the model's training condition, -1 = none, else Hz (used by *custom*) |
| `post_hz` | 0 | linear-phase roll-off of the result: 0 = off, else Hz (used by *custom*) |
| `seed` | 0 | the model's seed (same seed, same result) |

`preset`, `pre_hz`, `post_hz` and `seed` are optional inputs: an API-format prompt without them runs with the
defaults above.

**Provisional defaults:** these values come from the design's re-evaluation of the legacy chain, not from measurements on your machine yet. The Refine block is marked *experimental* until the measurement study (**L1**) has decided them; the report marks the defaults as provisional.

## The study (owner, local)

`tools/studies/sr_study.py` measures the arms on your material, writes a JSON report and - with `--pack <dir>` - the **blind A/B material** (two level-matched files, `key.json`, `README.md` with the question). The commands and the decision rule are in [the plan §4.5](https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/design/next-release-plan.md) and in `CURRENT_STATUS.md`'s local checklist (L1). Nothing becomes a default before that verdict.

## Limits

- The model adds *plausible* high frequencies; it cannot recover what was never recorded. Above the crossover the result is the model's invention, not the artist's.
- Refine has no loudness or peak management: peaks can rise with a boost. *Plenio · Master* follows it in every template.
- It is the slowest stage in the chain; on a 16 GB card expect roughly real-time to a few times faster than real time with UniverSR (measured in L1).
