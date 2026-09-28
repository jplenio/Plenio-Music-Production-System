# Refine (48 kHz)

*Experimental.* Brings a rendered song to 48 kHz and can extend its missing top octave.

**engine** - *resample only*: converts the sample rate without adding anything (no model needed); *model*: a super-resolution model from **Load Audio Model** regenerates the band above the song's measured bandwidth.

With a model the stage works like this:

1. it measures the input's bandwidth (the highest frequency within 60 dB of the 1-4 kHz level);
2. it low-passes the model's input to the chosen stage (**pre_hz**: *auto* = the model's own training condition, *off* = no low-pass, else 6000, 8000, 10000, 12000 or 14000 Hz) - this shapes only what the model sees, never the song you keep;
3. it runs the model in overlapping chunks (seeded: **seed**);
4. it keeps the original below the **crossover_hz** (0: 500 Hz below the measured bandwidth) and takes the model's output above it, with **sr_gain**. The two filters are complementary: nothing below the crossover changes;
5. an optional linear-phase roll-off (**post_hz**: *off*, or 16000, 19000 or 21000 Hz).

**The model always runs when it is connected** - also for an input that already reaches the top of the band (the owner's decision, 2026-09-28). PRE shapes what the model sees, the crossover decides what it may replace, POST rolls its result off; the report says so when the input was already full band. A silent or very short input is only resampled. The result is 48 kHz with the input's duration; nothing is normalised. The report lists the engine, every parameter, the bandwidth before and after, the loudness change and the time taken.

**3 · MiniMax · Song** ships the stage on with **pre_hz 10000**, **post_hz 19000** and **crossover_hz 14500** - all three are widgets on the node in that template.

The default values are **provisional** until they are measured on real MiniMax takes and chosen in blind listening tests.
