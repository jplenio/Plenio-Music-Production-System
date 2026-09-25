# Score Tools

Deterministic operations on a score in the native two-voice ABC dialect (Vocal and Ins voices). Every result is re-parsed and its invariants are checked, for example removing chords never changes a note and transposing moves every pitch by the same interval.

- **prepare from brief** - sung songs unchanged; instrumental songs get a silent Vocal voice (melody moved to Ins, or accompaniment only).
- **strip chords** - removes all chord symbols (for a new accompaniment).
- **voices** - keep, silence Vocal, or move the Vocal melody to Ins (with a policy for bars where Ins already plays).
- **transpose** - by semitones; notes, chords and keys are re-spelled for the new key.
- **tempo** - a new quarter-note tempo; notes and bars stay.

Outputs the score, its section tags as lyrics (for instrumentals) and a report of what changed.
