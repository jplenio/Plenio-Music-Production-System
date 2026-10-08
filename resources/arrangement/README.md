# Creative modes

The *arrangement* choice of the Song Brief and the Cover Brief. Each file is one mode; `off` is built in (no file; *simple* until 0.4.5): the music model plans the music by itself, as before.

```text
---
name: varied                 # the option in the brief's list (lower case, unique)
order: 20                    # position in the list (off is 0)
description: One line for the tooltip.
lead: keep, pad, arpeggio, riff, countermelody, solo, octave, motif
key shift: 0..2              # semitones a section may move (-5..5)
tempo change: -5..5          # percent the whole song may change (-25..25)
chord colors: 2              # 1 plain, 2 with sevenths and sixths, 3 every chord YuE2 reads
---

## Writer

Lines added to the writing prompt's rules - the style (YuE2) or the caption (MiniMax Music 3).

## Arranger

Lines added to the arrangement prompt: how the section plan should sound.
```

Lead roles - what the instrument line (the score's *Ins* voice) plays in a section: `keep` (YuE2's line stays), `none` (silent), `pad` (long chord notes), `arpeggio`, `riff`, `countermelody` (moves against the melody), `solo`, `octave` (doubles the sung melody an octave away) and `motif` (a short figure the writer invents, repeated on the chords). Plenio writes every note itself, so the score always stays valid.

The brief's closeness slider narrows what a mode allows (*genre closeness* for songs, *song flow closeness* for covers - see the user guide *Creative modes*), and the melody always stays: for an instrumental whose instrument line carries the melody, `countermelody` and `octave` are left out and lines go only where it rests; for accompaniment only, `solo`, `countermelody` and `octave` are left out.

Your own modes go to `<ComfyUI user directory>/plenio/arrangement/` (the same format); they appear in the list after a refresh (R). A file with a mistake is skipped and named in the ComfyUI log. A mode with the name of a shipped one is listed as `<name> (mine)`.
