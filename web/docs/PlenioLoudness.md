# Loudness & Dynamics

Brings the audio to a loudness target below a true-peak ceiling and measures the result.

**target** - integrated loudness (ITU-R BS.1770) and true-peak ceiling: *streaming* (-14 LUFS, -1 dBTP), *Apple Music / podcasts* (-16), *dynamic* (-18), *broadcast EBU R128* (-23), *loud* (-9 LUFS, -0.5 dBTP), or *custom*.

**compression** - *off* (limiter only), a gentle style (*Balanced - gentle glue*, *Acoustic - gentle*, *Pop - punchy*, *Classical - preserve dynamics* ...; each also sets how much the limiter may work), or *custom*.

**sample_rate** - *keep*, 44100 or 48000 Hz. The conversion happens first, so the ceiling holds at the final rate.

How it works: the optional compressor (stereo-linked, 1 ms control rate) runs first; then the make-up gain drives a 4x-oversampled lookahead limiter; the output is measured again (loudness and true peak) and the gain is corrected in up to three passes. When the limiter would have to reduce more than the style allows, the target is not forced - the report says *limiter reduction budget* and the node shows a warning.

Measured: integrated loudness (BS.1770-4, identical to pyloudnorm), loudness range (EBU Tech 3342), true peak (4x oversampled), sample peak - in the report and the release record.
