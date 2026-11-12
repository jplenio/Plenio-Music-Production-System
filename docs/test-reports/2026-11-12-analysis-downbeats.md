# The analysis track's beats against measured bars (2026-11-12)

Phase 7.3. `tools/studies/analysis_downbeats.py` over the twenty newest release records with a score in the owner's
ComfyUI output folder, read-only: each take's bars were measured in memory (`plenio.core.bars.measure`, nothing
written), the analysis track was computed from the audio alone (without those bars), and the share of measured bar
starts that an audio beat or downbeat lies within 50 ms of was counted. Aggregates only.

| The track's | within 50 ms of a measured bar start (mean / median of 20 songs) |
|---|---|
| beats, a fixed grid (first try) | 39.9 % / 37.3 % |
| downbeats, a fixed grid (first try) | 20.6 % / 14.9 % |
| beats, dynamic programming (Ellis 2007; shipped) | **75.7 % / 78.3 %** |
| downbeats, dynamic programming (shipped) | **43.0 % / 40.6 %** |

Confidence of the audio-only tempo: mean 0.59, lowest 0.00.

What it means: from the audio alone the track finds the beat in about three of four bars, the bar's first beat in
under half - the bar's phase is the weak part (every fourth beat from the loudest low band). Where a take's bars are
measured and kept beside its record (`<name>.bars.json`), the track takes them instead (confidence 1). The Director
(7.6) falls back to *Match the music* below its confidence threshold. Not measured: other music (not made with
Plenio), tempo changes within a song.
