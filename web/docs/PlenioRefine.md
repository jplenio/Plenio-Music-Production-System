# Refine (48 kHz)

*Experimental.* Brings a rendered song to 48 kHz and can extend its missing top octave.

**engine** - *resample only*: converts the sample rate without adding anything (no model needed); *model*: a super-resolution model from **Load Audio Model** regenerates the band above the song's measured bandwidth.

With a model the stage works like this:

1. it measures the input's bandwidth (the highest frequency within 60 dB of the 1-4 kHz level);
2. it low-passes the model's input (**pre_hz**: 0 = the model's own training condition, -1 = no low-pass, else Hz) - this shapes only what the model sees, never the song you keep;
3. it runs the model in overlapping chunks (seeded: **seed**; its *control after generate* starts as *fixed*, so the same seed gives the same result and ComfyUI reuses the refined audio when nothing before it changed);
4. it keeps the original below the **crossover_hz** (0: 500 Hz below the measured bandwidth) and takes the model's output above it, with **sr_gain**. The two filters are complementary: nothing below the crossover changes;
5. an optional linear-phase roll-off (**post_hz**: 0 = off, else Hz, for example 16000, 19000 or 21000).

**preset** sets PRE, POST and the crossover in one go (the crossover 500 Hz below PRE): *1 - pre 6 kHz / post 16 kHz*, *2 - pre 8 kHz / post 19 kHz*, *3 - MiniMax: pre 10 kHz / post 19 kHz*, *4 - pre 12 kHz / post 19 kHz*, *5 - pre 14 kHz / post 21 kHz*; *custom* uses the fields **pre_hz**, **post_hz** and **crossover_hz**. The report names the preset that applied.

**The model always runs when it is connected** - also for an input that already reaches the top of the band (the owner's decision, 2026-09-28). PRE shapes what the model sees, the crossover decides what it may replace, POST rolls its result off; the report says so when the input was already full band. A silent or very short input is only resampled. The result is 48 kHz with the input's duration; nothing is normalised. The report lists the engine, every parameter, the bandwidth before and after, the loudness change and the time taken.

**3 · MiniMax · Song** ships the stage on with preset **3** (pre 10 kHz, crossover 9.5 kHz, post 19 kHz) and the same numbers in the three fields, so *custom* keeps the sound. In every template the block is two plain nodes (the model loader and this node), so every field is editable; where it is bypassed, both nodes are collapsed - press **Ctrl+B** on the group, then expand them.

The default values are **provisional** until they are measured on real MiniMax takes and chosen in blind listening tests.
