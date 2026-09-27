# Stem Mixer

*Experimental.* Mixes the stems of **Separate Stems** back into one song.

**mix** - the mixer settings (`plenio.stem_mix/1`); empty means neutral: the output is the input. Per strip (each stem and *rest*, the residual):

- **gain_db** -60 ... +12 dB;
- **mute**, **solo** - solo wins over mute; any solo silences every strip that is not soloed, *rest* included;
- **compression** 0 ... 1 - one knob for the mastering compressor (threshold -12 ... -30 dB, ratio 1 ... 6, 10 ms attack, 120 ms release, no make-up gain);
- **muted** - time ranges `[[start_s, end_s], ...]` in which the stem is silent (with 10 ms soft edges; the song keeps its length);
- **reverb**, **delay** - sends to a shared bus each (the buses arrive in a later release; until then a send is refused).

Example:

```json
{"schema": "plenio.stem_mix/1",
 "strips": {"vocals": {"gain_db": 1.5, "compression": 0.3},
            "drums": {"muted": [[62.0, 64.5]]},
            "rest": {"gain_db": -3}}}
```

The mixdown is not normalised: **Plenio · Master** sets the loudness. The report lists, per strip, whether it was audible, its gain, the compressor's gain reduction and the muted time.
