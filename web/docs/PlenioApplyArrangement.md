# Apply Arrangement

> **Experimental (0.4.5).** Creative modes and the closeness sliders can give unexpected results - a chord that surprises, an instrument line that does not fit every song, a plan that is not applied. They are meant for experimenting first: try a mode, listen, change the score in the Song Sheet or run again with another *arrangement seed*, and keep what you like. *simple* is the dependable choice.

Writes the writer's section plan into the score - or keeps the score as it was and says why. Plenio writes every note itself, with the same validated operations as *Score Tools*, so the result is always a score that YuE2 and the score editor read.

Per section, in this order:

1. **chords** - the plan's chords, one per bar. A chord must fit the melody notes on the bar's strong beats (how strictly follows the closeness); where it does not, the planned chord stays.
2. **the instrument line** (the score's *Ins* voice) - what the plan's *lead* asks for: *pad*, *arpeggio*, *riff*, *countermelody*, *solo*, *octave* (the sung melody an octave away), *motif* (the writer's short figure in note names, moved onto every chord, restarted on every downbeat, its strong-beat notes on chord notes), *none* or *keep*. A line that carries the melody (an instrumental with a lead) is never replaced; lines are built on chords, so a section without chords keeps its line.
3. **key lift** - the section moves by the planned semitones, unless the voice would leave its range (at most two semitones above the song's highest note).

At the end the **tempo** change. Then the result must pass YuE2's parser, read back unchanged, open note by note in the score editor and - with the engine connected - fit YuE2's context (the instrument lines are left out first; a cover's style and lyrics are estimated, as they are written later). Anything else keeps the score as it was: status *fallback* with the reason.

- **answer** - the writer's answer; requested only when a plan is wanted (not in the simple mode, not for a cover at song flow closeness 95 or more, not without a score). Read leniently: code fences, thoughts, a missing last brace, single quotes, chord aliases (*Cmaj9* -> *Cmaj7*, *H* -> *B*) are repaired and reported.
- **seed** - varies the notes Plenio writes for the lines (the same seed, the same notes).
- **engine**, **style**, **lyrics** (optional) - for the exact context budget.

Outputs: the **score** and a **report** with the status (*applied*, *partial* - some parts kept, see the notes -, *unchanged*, *fallback*, *skipped*), the idea, per section what was applied and what stayed, and the plan itself. Connect the report to the Song Sheet's **arrangement** input: the sheet shows it and warns about a fallback, and the release record keeps it.
