# Instrumental

"Instrumental" in Plenio means two different things, and only the first can be guaranteed.

## 1. Instrumental conditioning - guaranteed

When the brief says *instrumental*, everything YuE2 receives asks for an instrumental:

| Document | Song path | Cover path |
|---|---|---|
| lyrics | the single tag `[instrumental]` | the final score's section tags (`[Verse]`, `[Chorus]` ...) |
| style | no voice, singer or language words (removed from the writer's draft; an error if you type them) | same |
| score | Vocal voice silent: the melody moves to the instrument voice, or is removed (*accompaniment only*) | same, from the transcription |
| adapter | the instrumental LoRA is bypassed (it made Song-path plans long and endings abrupt) | the instrumental LoRA is **on** (fewer vocal-like takes in Phase 4A: 0 of 6 against 2 of 7) |

The Song Sheet refuses words in instrumental lyrics and vocal notes in an instrumental score.

## 2. Instrumental audio - measured, not guaranteed

YuE2 can still produce humming, vowel sounds or a choir-like pad. **Check Vocals** measures each take: SheetSage2 re-transcribes it and counts the notes of its vocal track. With the default tolerance (any vocal note fails) it was calibrated against the owner's listening of 25 takes (Phase 4A): of the 8 takes with an audible voice it flagged 6 - the 2 it missed had a rare, faint voice - and it flagged no clean take.

**YuE2 Takes** renders several takes (seeds take seed, take seed + 1, ...), Check Vocals keeps the first clean one and the preview plays all of them. N takes cost N renders; nothing is retried automatically.

Limits: quiet humming below the transcription's threshold may pass, an instrument that sounds like a voice may be flagged, and the check says nothing about musical quality. Delivered audio is never processed by vocal removal.

## Form of instrumental songs

With only `[instrumental]` as lyrics, YuE2's planner mostly wrote an intro and one long section that repeated the same pattern. Since 0.3.1 the planner reads a **section form** that grows with the brief's length - *Intro, Verse, Chorus, Outro* for about a minute, up to *Intro, Verse, Pre-Chorus, Chorus, Verse, Pre-Chorus, Chorus, Bridge, Chorus, Outro* for 4:30 and more - as YuE2's own instrumental workflow does. The form is **only for the plan** (Song Sheet · Text, output *plan_lyrics*): the render still gets `[instrumental]`, and any melody the planner writes for the voice moves to the instrument as before. If you write or edit the lyrics yourself, the planner reads your text.

## Length of instrumental songs

YuE2 decides the length of an instrumental plan itself; tags and timed tags do not control it. Left alone, the owner's instrumental plans ran from 0.4 to 3.8 times the requested length - above all EDM and electronic styles, where the planner wrote an intro and one section that repeated for up to 14 minutes. *Prepare from brief* therefore fits every instrumental plan that is more than 1.2 times or less than 0.8 times the brief's length (Score Tools *fit length*):

- **too long**: whole sections are removed; when the sections are too long for that, the bars in between are removed inside a section at a phrase (every 4 bars). The plan's beginning and its own ending - the outro, or the last phrase - stay, so the song still ends as it was written, not with a hard cut.
- **too short**: the middle of the song (the sections between the first and the last) is repeated, like a second verse and chorus.

The score sheet says what was removed or repeated. On the owner's 274 instrumental scores this brings 92 % within 0.8-1.2 times the requested length (22 % before); the rest are single-section plans that cannot be lengthened.
