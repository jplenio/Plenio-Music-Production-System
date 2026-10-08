# Match Song Form

Makes YuE2's planned score fit the **song form of the lyrics** - inside the *YuE2 Plan* block, nothing to wire. A song's lyrics are written first and YuE2 plans the melody from them, but the plan's sung sections often differ from the lyrics' (in the owner's songs: three of four - most often a bridge or a sung outro the plan does not have). The words would then land on melodies planned for other words.

The plan's **sung** sections are compared with the lyrics' sections that have words, by kind (*Verse 2* is a verse). In this order:

1. **The same kinds in the same order** - the plan stays.
2. **Every kind is in the plan** - the score is put together from the plan's own sections in the lyrics' order: a chorus repeated, a third verse or a sung intro without words left out, instrumental sections kept at the start and the end. Chorus words are sung on the chorus melody.
3. **As many sections, other kinds** - the plan's sections are named after the lyrics (the notes stay).
4. Otherwise YuE2 plans **once more** with the next seed (the *alternative* input, planned only then) and the better plan wins. A kind still missing then takes the melody of a related section of the plan - a bridge a verse's, a sung outro the chorus's - and is named after the lyrics.

Only whole sections move; YuE2's notes stay as planned. A score put together this way may be at most half again as long as the plan. **Song Sheet · Score** shows what was done (an info in its findings) and the release record keeps it. Instrumentals, a plan without singing and planning off pass through.

## Inputs

- **score** - YuE2's plan (empty when planning is off).
- **lyrics** - the lyrics the plan was made from (*Song Sheet · Text*'s plan_lyrics).
- **alternative** - a second plan with the next seed; requested only when the first cannot be made to fit.

## Outputs

- **score** - the score in the lyrics' song form.
- **report** - what was compared, tried and changed (to *Song Sheet · Score*'s *song_form* input).
