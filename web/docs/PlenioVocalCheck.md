# Check Vocals

Checks instrumental takes for singing and passes on the best take. It re-transcribes each take with **SheetSage2** and counts the notes of its vocal track.

- **audio** - one take, or the list of takes from *YuE2 Takes*.
- **audio_encoder** - SheetSage2 (the cover template reuses the loader of *Transcribe Score*).
- **brief** - sung songs are not checked (the first take passes through).
- **tolerance_seconds** (advanced) - seconds of vocal notes still accepted. **0** (default): any vocal note fails - calibrated against the owner's listening of 25 takes in Phase 4A: 6 of the 8 takes with an audible voice flagged (the 2 missed had a rare, faint voice), no clean take flagged.

Outputs: **audio** (the first take without vocal notes that ends naturally, else the first without vocal notes, otherwise the one with the fewest), **passed**, **report** (notes and seconds per take, where they are, takes that end while the music still plays), **takes** (all takes, the best first - connect a preview to listen to every take).

A take that fails is still delivered so you can listen to it. This is a measurement, not a guarantee: quiet humming may go unnoticed, and an instrument that sounds like a voice can be flagged.
