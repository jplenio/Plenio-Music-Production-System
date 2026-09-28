# Stem Mixer

*Experimental.* Mixes the stems of **Separate Stems** back into one song.

**mix** - the mixer settings (`plenio.stem_mix/1`); empty means neutral: the output is the input. Per strip (each stem and *rest*, the residual):

- **gain_db** -60 ... +12 dB;
- **mute**, **solo** - solo wins over mute; any solo silences every strip that is not soloed, *rest* included;
- **compression** 0 ... 1 - one knob for the mastering compressor (threshold -12 ... -30 dB, ratio 1 ... 6, 10 ms attack, 120 ms release, no make-up gain);
- **muted** - time ranges `[[start_s, end_s], ...]` in which the stem is silent (with 10 ms soft edges; the song keeps its length);
- **save** - `true` writes this stem as its own 24-bit FLAC into `output/plenio/stems` on the next run (default: false). The file holds the strip's own signal (gain, compression and muted ranges applied); mute/solo and the two buses belong to the mixdown. A second run that writes the same stem gets `name (2).flac` - nothing is overwritten;
- **reverb**, **delay** - sends 0 ... 1 to a shared bus each: *reverb* convolves with a synthesised, seeded impulse response (presets *room* 1.2 s, *plate* 1.6 s, *hall* 2.4 s); *delay* is a stereo feedback delay (time in ms or a note at 120 BPM; the first echo has the send level, feedback 0 ... 0.8 sets how much of each echo returns - 0 is a single echo; low-pass in the loop). A mono separation keeps a mono wet signal. A send without its bus is **refused**, never silently ignored; the widget's first raise writes the documented bus defaults with it. Effect tails are cut at the song end with a 50 ms fade.

Example:

```json
{"schema": "plenio.stem_mix/1",
 "strips": {"vocals": {"gain_db": 1.5, "compression": 0.3},
            "drums": {"muted": [[62.0, 64.5]]},
            "rest": {"gain_db": -3}}}
```

The mixdown is not normalised: **Plenio · Master** sets the loudness. The report lists, per strip, whether it was audible, its gain, the compressor's gain reduction, the muted time and the file written for a strip marked *save*.

On the node the value has a widget: a strip per stem plus *rest* (fader, **M**/**S**, compression, the two sends, **save**) with the **waveform of the last separation** underneath. The strips are there before the first run too (the documented stems, an empty waveform). A fader writes the value while you drag (the strip stays under the pointer); **Drag** on a waveform to mute that time range, **click** a range to remove it. Every control carries a tooltip. *Advanced* shows the raw JSON - it is the same value the widget writes.
