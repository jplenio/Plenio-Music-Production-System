# ADR-0013: The guests' page in the guest's language

Date: 2026-11-12. Status: accepted (owner's decision D-12, [2.0 product design](../design/v2-product-design.md) section 9.7). Amends [ADR-0008](0008-english-everywhere.md) for one page.

## Context

ADR-0008 keeps every text of Plenio in English: one language for the nodes, the player, the docs and the code, so that nothing drifts between translations and one person can keep it all true. One page is different. A party guest scans a code and meets the guests' page on their own phone, with no introduction, in a home where the host chose Plenio and they did not. It is the only place where the reader did not choose the software, and its text is short: what plays, what comes next, reactions, adding a song, hearing the party's songs again - about fifty strings.

## Decision

- The guests' page (`plenio/player/guest_page.html`) shows its words in **English, German, Spanish, French, Italian, Portuguese or Japanese**, chosen from the phone's languages (`navigator.languages`, the first that fits), English for every other language and for a word a language lacks.
- The words live in `plenio/player/guest_locales/<language>.json`, one key per string with the same `{blanks}` in every language; the guests' server hands them out below the party's token (`locales/<language>`, only these seven).
- The page holds no text of its own: its elements carry keys (`data-i18n`), its script asks `t(key)`. A test fails on a word left in the page, on a language missing a key or a blank, and on a key the page does not use.
- Everything else stays English: the player, the host's pages, ComfyUI, the docs - and on the guests' side the song form below *Make your own song* (it shares the player's form) and the server's refusals (*slow down a little*).

## Consequences

- A new string on the guests' page is written in all seven languages in the same commit; the test says which are missing.
- The translations are the agent's, checked for meaning, not by native speakers; a correction is a change to one JSON file.
- The song titles, the guests' names and the songs' own words are shown as they are, in whatever language they were made.
