# The twelve signature visuals (2026-11-12)

Phase 7.9, decision D-11. Chosen across the
collections and the three engines, each offered on an integrated graphics chip (the measured Nova timings: *Black
hole* and *Outrun* are too heavy there and are not among them):

| Visual | Collection | How it answers the Director's cue |
|---|---|---|
| Nova · Hyperspace | Space | leans in before a strong onset (0.12), its light jumps on it (0.45), builds before a louder part (0.35) |
| Nova · Northern lights | Nature | 0.04 / 0.2 / 0.3 - gentle: the curtains brighten towards a chorus |
| Nova · Silk | Flow | 0.05 / 0.25 / 0.25 |
| Nova · Spectrum city | Club | 0.1 / 0.5 / 0.4 - the city flashes on the kick |
| Nova · Laser show | Club | 0.06 / 0.6 / 0.3 - the strongest flash |
| Nova · Moonlit sea | Nature | 0.05 / 0.2 / 0.3 |
| Nova · Mandala | Flow, Geometry | 0.08 / 0.35 / 0.3 |
| Drop · Nebula Swirl | Space, Flow | draws in before an onset, the ring jumps on it, the swirl tightens before a louder part |
| Drop · Kaleido Bloom | Geometry | the slices turn faster towards a louder part, the shapes swell on the hit |
| Drop · Cover Galaxy | This song | the galaxy pulls harder before a louder part, the cover breathes on the hit |
| Retro Grid | Retro & hi-fi | the sun swells on the hit and rises towards a louder part |
| VU Meters | Retro & hi-fi | the dial's lamp warms towards a louder part and flares on the hit |

Nova's three weights (lean, flash, build) act around each scene's own picture (`nova/glsl.ts: IMAGE_MAIN`); the
other Nova scenes have none and draw as before. A new player shows the twelve first (*Show › Signature twelve*); a
device that draws fewer than three of them chooses from the whole pool. Their posters are in the sheet
(`frontend/src/player/public/posters.jpg`).

**Clips for the owner** (not committed - `dist/` stays local): `dist/signatures-2.0.0/<id>.webm`, one per visual,
about 13 s each, recorded in Playwright's Chromium on the integrated AMD graphics while a generated test song with a
kick drum plays across its jump from quiet to loud at 16 s (the Director's cue from the song's analysis track). The
tuning is a first pass by the agent: watched as stills from the clips, not judged in motion by the owner yet.
