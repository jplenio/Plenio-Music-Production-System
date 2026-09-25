# Score Tools

Deterministic operations on a score in the native two-voice ABC dialect (Vocal and Ins voices). Every result is re-parsed and its invariants are checked, for example removing chords never changes a note and transposing moves every pitch by the same interval.

- **prepare from brief** - what the brief asks for:
  - sung songs and covers: unchanged (a cover with *new accompaniment* loses its chords);
  - instrumentals: a silent Vocal voice (the melody moves to Ins, or accompaniment only);
  - instrumental songs whose plan is much longer than the brief's length: *fit length* is applied;
  - a plan that ends in the middle of a bar group is repaired (the incomplete last group is removed).
- **strip chords** - removes all chord symbols (for a new accompaniment).
- **fit length** - removes whole sections until the score is close to the given seconds; the first section up to the first chorus and the ending are kept. It never cuts inside a section and reports what it removed or why it could not shorten.
- **voices** - keep, silence Vocal, or move the Vocal melody to Ins (with a policy for bars where Ins already plays).
- **transpose** - by semitones; notes, chords and keys are re-spelled for the new key. Use -12 or +12 when a cover's melody does not fit the voice you want.
- **tempo** - a new quarter-note tempo; notes and bars stay.

Outputs the score, its section tags as lyrics (for instrumentals) and a report of what changed.
