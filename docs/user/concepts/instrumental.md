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

## Length of instrumental songs

YuE2 decides the length of an instrumental plan itself; tags and timed tags do not control it. Score Tools *fit length* removes whole sections when a plan is much longer than requested and reports when the shortest complete form is still too long.
