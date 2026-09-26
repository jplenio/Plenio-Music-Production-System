# Mastering and audio formats

What the EQ, Loudness & Dynamics and Export Release nodes do exactly, how precise they are, and where their limits are. All processing runs on the CPU in 64-bit floating point; nothing is downloaded.

## Order of the chain

```text
EQ  ->  resample (if a new rate is chosen)  ->  compressor  ->  make-up gain  ->  true-peak limiter  ->  measure  (repeat the gain, at most 3 passes)
```

The conversion to the output sample rate happens **before** dynamics, so the true-peak ceiling is met at the rate that is exported (converting after limiting can create new inter-sample peaks).

## Metering

| Quantity | Method | Accuracy (tests) |
|---|---|---|
| Integrated loudness (LUFS) | ITU-R BS.1770-4: K-weighting, 400 ms blocks with 75 % overlap, absolute gate -70 LUFS, relative gate -10 LU | K-weighting equals the standard's 48 kHz coefficients exactly (other rates: same analog prototype, as libebur128); equal to `pyloudnorm` within 0.01 LU; EBU Tech 3341 cases within 0.1 LU |
| Loudness range (LU) | EBU Tech 3342: 3 s short-term blocks, gates -70 LUFS and -20 LU, 10th-95th percentile | EBU Tech 3342 case 1 (10 LU) within 1 LU |
| True peak (dBTP) | 4x oversampling (2x at 96 kHz and above), Kaiser low-pass flat to 0.4 x the rate, 80 dB down from 0.6 x the rate | inter-sample peaks of test tones found within 0.02 dB (content up to 0.4 x the rate, 17.6 kHz at 44.1 kHz) |
| Sample peak (dBFS), PLR | maximum absolute sample; true peak minus integrated loudness | exact |

Audio shorter than one 400 ms block, or silent, is reported as *not measurable*; the loudness stage then applies no make-up gain (the limiter still holds the ceiling).

**Limit:** content between 0.4 and 0.5 x the sample rate (17.6-22 kHz at 44.1 kHz) is slightly under-read by the true-peak filter. The limiter therefore aims 0.2 dB below the ceiling. Music has little energy there, so the reserve covers it; for signals with strong content just below the Nyquist frequency the meter - and therefore the limiter - can read slightly low.

## EQ

- Biquad filters after the RBJ Audio EQ Cookbook: peak, low/high shelf (with slope), high/low-pass (with Q), notch; up to 8 bands and a pre-amp; settings are JSON (`plenio.eq/1`) and are checked (frequency 20 Hz to 20 kHz and at most 0.45 x the rate, band gain ±12 dB, Q 0.2-10, shelf slope 0.25-1, pre-amp ±24 dB).
- The curve on the node is the backend's computed response for the audio's rate.
- *flat* is bit-identical (the audio is not filtered at all).
- **Tone match**: the audio's long-term spectrum (1/6-octave smoothing; fitted between 40 Hz and 16 kHz by default) is compared with a target - a gentle tilt around 1 kHz (*warm* -0.75 dB/octave, *bright* +0.75 dB/octave, relative to the audio itself) or the spectrum of a *reference* recording, with the level difference removed first. A least-squares fit places up to *max bands* peak filters; *strength* scales the correction and *max gain* bounds the summed curve. The report shows the error before and after.
- No normalisation: a boost can raise the peak; clipping is only possible at the export of FLAC/MP3 if no limiter follows (the export warns).

## Compressor and limiter

Ported from the legacy toolkit v3.1.3 (same author, MIT), verified sample by sample against its outputs (difference below 2·10⁻⁶ of full scale; see the test report).

- **Compressor**: stereo-linked, RMS or peak detector, soft knee, attack/release smoothing, side-chain high-pass (so the bass does not pump the whole mix); gain is computed at a 1 ms control rate and interpolated.
- **Limiter**: 4x oversampled, lookahead (default 3 ms), release smoothing; it limits the true peak, not just samples.
- **Loudness targeting**: the make-up gain moves the measured loudness to the target; after limiting the result is measured again and the gain corrected (at most 3 passes, tolerance ±0.3 LU). Each style bounds the **make-up gain** (default 18 dB) and the **limiter reduction** (for example 6 dB for *Balanced - gentle glue*). If a bound is hit, the node returns the best result within it and reports *makeup budget* or *limiter reduction budget* instead of forcing the target.

## Sample-rate conversion

Polyphase resampling with a Kaiser low-pass designed from band edges: flat to 20 kHz (or 0.9 x the lower Nyquist frequency), at least 100 dB attenuation from the lower Nyquist frequency on. The legacy toolkit's converter used SciPy's default filter, which lets content just above the new Nyquist frequency alias back (a 23 kHz tone converted from 48 to 44.1 kHz came out as a 21.1 kHz alias at -6 dB); Plenio's filter is designed for 100 dB and the test requires the alias to stay below -80 dB. Output length is `ceil(frames x new_rate / old_rate)`.

## Formats

| Format | Encoding | Tags | Cover | Clipping |
|---|---|---|---|---|
| FLAC | 24-bit integer, lossless (PyAV / libFLAC) | Vorbis comments: title, artist, album, date, track, genre, comment, album artist, composer | embedded (a FLAC picture block, front cover) | samples above full scale are clipped; counted in the record |
| MP3 | LAME VBR V0 (highest VBR quality; the bit rate follows the music), at most 48 kHz: 88.2/176.4 kHz audio is converted to 44.1 kHz, 96/192 kHz to 48 kHz for the MP3 only | ID3v2, same fields | embedded (ID3 APIC frame, front cover) | as FLAC |
| WAV | 32-bit float | RIFF INFO: title, artist, album, date, track, genre, comment (no album artist / composer) | none | none - values above full scale are kept |

24-bit samples are scaled by 2²³ (the decoders' convention), so a 24-bit source passes through export sample-exact. Files are written to a temporary name and renamed when complete; an interrupted export leaves no half-written song. All files of one export share one base name; with collision *number* the whole set is numbered, so the record and cover of an earlier export are never overwritten.

**Tag copy** (*copy from loaded file*) reads the tags and the embedded cover with PyAV from the file of the workflow's single **Load Audio** node. With two or more Load Audio nodes the export stops and asks you to type the tags.

## What Plenio does not do (yet)

- **No restoration**: no declipping, de-noising or de-harshing. The Phase 7 measurement found no clipping on the available take; the decision on a conditional repair stage waits for measurements on unprocessed YuE2 and MiniMax takes ([test report](../../test-reports/2026-09-25-phase-7.md) §5).
- No multiband compression, stereo widening, dithering (not needed for 24-bit; MP3 is encoded from floating point) or fades (planned for the Master stage with the take-ending check).
- Loudness is measured over the whole song; there is no per-section or short-term target.
