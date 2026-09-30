# Score Tools

Deterministic operations on a score in the native two-voice ABC dialect (Vocal and Ins voices). Every result is re-parsed and its invariants are checked, for example removing chords never changes a note and transposing moves every pitch by the same interval.

- **prepare from brief** - what the brief asks for:
  - sung songs and covers: unchanged (a cover with *new accompaniment* loses its chords);
  - instrumentals: a silent Vocal voice (the melody moves to Ins, or accompaniment only);
  - instrumental songs whose plan is more than 1.2 times or less than 0.8 times the brief's length: *fit length* is applied;
  - a plan that ends in the middle of a bar group is repaired (the incomplete last group is removed).
- **new score from brief** - an empty score to compose in (the *5 · YuE2 · DAW* template): the brief's length and tempo give the number of measures, its *meter* and *key* fields are read (defaults 4/4, C major, 100 BPM, each reported), and the score has one `verse` section of rests and `L:1/32`. The *score* input stays unconnected for this operation. A score that has only rests cannot be rendered: draw notes or import a MIDI file before the run renders.
- **strip chords** - removes all chord symbols (for a new accompaniment).
- **fit length** - brings the score close to the given seconds and keeps its beginning and its ending. A longer score loses whole sections (the first section up to the first chorus stays); when the sections are too long for that - an instrumental plan is often an intro and one long, repeating section - the bars in between are removed inside the section at a phrase (every 4 bars), and the plan's own last phrase or outro stays as the ending. A shorter score repeats its middle (the sections between the first and the last, like a second verse and chorus). It reports what it removed or repeated, or why it could not.
- **voices** - keep, silence Vocal, or move the Vocal melody to Ins (with a policy for bars where Ins already plays).
- **transpose** - by semitones; notes, chords and keys are re-spelled for the new key. Use -12 or +12 when a cover's melody does not fit the voice you want.
- **tempo** - a new quarter-note tempo; notes and bars stay.

Outputs the score, its section tags as lyrics (for instrumentals) and a report of what changed.
