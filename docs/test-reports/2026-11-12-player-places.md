# The player's places, People & access, a party - checked in a browser (2026-11-12)

Phase 6.1-6.4 of the 2.0 plan, checked in Playwright's own Chromium against a Plenio Player started from the
repository with a fresh state folder, two generated test tones as its songs, and the guests' access bound to
127.0.0.1. The script drives the page as a person would (clicks, typing), and reads the server's answers to check
what the clicks changed.

| Check | Result |
|---|---|
| *People & access* opens; the grid has the five roles | pass |
| ticking *Party guest: make songs* switches the party songs on for guests (`/api/make`) | pass |
| *Invite someone* shows a QR code and the link `…/#/join/<code>` | pass |
| a second browser (390 px, another device) opens the link: *Welcome, Mia*; a PIN `4711` twice; *Join* | pass - logged in as Mia, group `maker` |
| *Start a party* (three steps): the guests' access on with *change it*, Live Play on, the party kept with its name | pass |
| *End the party*: the guests' access off, *only look*, approval as before, Live Play off, the party gone | pass |
| Settings opens on *Basic*; *Find a setting* "backup" shows *Kept* only | pass |
| the old address `#/settings/accounts` leads to `#/people` | pass |
| no page scrolls sideways at 1440 px; no error in the page | pass |

Screenshots (JPEG) in [2026-11-12-player-places/](2026-11-12-player-places/): *Songs*, *People & access* and
*Settings* at 390, 820 and 1440 px; the invitation's QR code (1440); the join page on a phone (390).

Not checked here: the invitation through *My devices* from a real phone in the network (the link then carries the
network address and its code), a guest's phone on the party's page, the screen reader's reading of the grid.
