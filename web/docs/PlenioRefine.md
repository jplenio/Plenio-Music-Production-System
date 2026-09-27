# Refine (48 kHz)

*Experimental.* Brings a rendered song to 48 kHz and can extend its missing top octave.

**engine** - *resample only*: converts the sample rate without adding anything (no model needed); *model*: a super-resolution model from **Load Audio Model** regenerates the band above the song's measured bandwidth.

With a model the stage works like this:

1. it measures the input's bandwidth (the highest frequency within 60 dB of the 1-4 kHz level);
2. it low-passes the model's input to the bandwidth the model was trained for (**pre_hz**; 0: the model's own condition, -1: none) - this shapes only what the model sees, never the song you keep;
3. it runs the model in overlapping chunks (seeded: **seed**);
4. it keeps the original below the **crossover** (0: 500 Hz below the measured bandwidth) and takes the model's output above it, with **sr_gain**. The two filters are complementary: nothing below the crossover changes;
5. an optional linear-phase roll-off (**post_hz**, 0: off).

The result is 48 kHz with the input's duration; nothing is normalised. An input that is already full band (above 20 kHz) is only resampled - the report says so. The report lists the engine, every parameter, the bandwidth before and after, the loudness change and the time taken.

The default values are **provisional** until they are measured on real MiniMax takes and chosen in blind listening tests.
