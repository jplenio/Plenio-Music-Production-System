# Studies G1, A2 and E7 - song form, lyrics fit and what YuE2 makes of an arranged score (2026-10-08)

| | |
|---|---|
| Question | Owner, 2026-10-08: the songs of the creative modes vary in quality, some with clashing notes; harmony fitting the genre must stay, lyrics must fit the (new) melody syllable by syllable, a bounded re-generation where they do not, and the song form of lyrics and plan must agree ([proposal](../design/harmony-and-lyrics-fit.md), approved with D1-D5) |
| Code | `plenio.core.song_form` (Match Song Form), `plenio.core.lyrics_fit` and `plenio.core.syllables` (Fit Lyrics), `plenio.core.arrangement.harmony`, `.apply` (the guard and its gate), `.reask`; study tools `tools/studies/song_form.py`, `lyrics_fit_llm.py`, `arrangement_renders.py` |
| Machine | owner's RTX 5060 Ti 16 GB, **GPU 0 only** (`CUDA_VISIBLE_DEVICES=0`; a first A2 run that let llama-server spread Qwen 3.8 27B over both cards lost the second card and was discarded); llama-server of Unsloth Studio, thinking off |
| Inputs | the owner's release records, read only: 195 sung songs with YuE2's plan (G1), six cover scores (A2), two songs and two covers from study A1 with one writer plan each (E7) |
| Data | `data/2026-10-08-harmony-lyrics.json` (counts and means only; no lyrics, scores or answers) |
| Level | V3 (real models, every result measured by Plenio's own checks and SheetSage2) plus the owner's blind listening verdict on all 28 takes |

## G1 - the song form of lyrics and plan

A song's lyrics come first and YuE2 plans the melody from them. Compared by kind (*Verse 2* is a verse) and only where something is sung, in the 195 sung songs of the records:

| The plan's sung sections against the lyrics' | songs | |
|---|---|---|
| the same kinds in the same order | 49 | 25 % |
| every kind of the lyrics is in the plan: the plan's sections can be put in the lyrics' order | 27 | 14 % |
| as many sections, other kinds: renamed | 41 | 21 % |
| differs (most often a bridge or a sung outro the plan does not have, a sung intro the lyrics do not) | 78 | 40 % |

Without a second plan, the last resort (a missing kind takes a related section's melody: a bridge a verse's) fits 64 of the 78; **14 (7 %) still differ**. Put together, the scores are 0.89 times as long as the plan in the median (at most 1.08). Every changed score passed YuE2's parser and Plenio's checks. Shipped as **Match Song Form** inside *YuE2 Plan*: match, assemble or rename at once; a second plan (the next seed) only when none of them works, the better plan wins; the last resort after that.

## A2 - new cover lyrics with local LLMs

Six real cover scores (14-30 sung phrases, 4-11 sections), two seeds, English, a theme per song; the draft with Write Song's cover prompt, then what *Fit Lyrics* does: the song form, two repair rounds, the last step. Lines fitting their phrase (Plenio's count, the window of `lyrics_fit.window`):

| Writer | draft | round 1 | round 2 | last step | sent back, came back fitting | s per song |
|---|---|---|---|---|---|---|
| Gemma 4 E2B (Q4_K_XL), schema | 32 % | 86 % | 97 % | **98 %** | 80 % | 16 |
| Gemma 4 E4B (Q4_K_M), schema | 55 % | 93 % | 96 % | **97 %** | 79 % | 17 |
| Qwen 3.5 9B (Q4_K_M), schema | 30 % | 92 % | 98 % | **98 %** | 61 % | 28 |
| Gemma 4 12B QAT (Q4_0), schema | 56 % | 100 % | 100 % | **100 %** | 97 % | 26 |
| Qwen 3.8 27B (IQ3_XXS), schema | 21 % | 94 % | 100 % | **100 %** | 68 % | 55 |
| Gemma 4 E4B, free (as the native writer) | 55 % | 73 % | 77 % | 77 % | 31 % | 16 |
| Qwen 3.5 9B, free | 30 % | 68 % | 82 % | 82 % | 39 % | 27 |
| Gemma 4 E4B, free, **numbered syllables** | 55 % | 70 % | 75 % | 77 % | 28 % | 29 |
| Qwen 3.5 9B, free, **numbered syllables** | 30 % | 69 % | 97 % | **97 %** | 61 % | 40 |
| Gemma 4 E4B, schema, numbered syllables | 55 % | 85 % | 96 % | 97 % | 69 % | 28 |

- **The drafts miss the melody** in every model (21-56 % of the lines fit) - the measured 0.4.5 problem.
- **The writer hits a count when it spells it**, not when it is told it: the first repair format (*write 15 to 21 syllables*, the line as one string) moved the lines in the right direction but rarely onto the target (Qwen 3.5 9B: 0 of 7). Listing the line's syllables first, held to the target count by the schema (llama.cpp, LM Studio, Ollama), brings 97-100 % with every model after two rounds.
- **Without the schema** (ComfyUI's native *Generate Text*) the count is not enforced: 77-82 %. Numbered syllables and one target number per line help Qwen 3.5 9B (97 %), not Gemma 4 E4B (77 %), and change nothing with the schema - they are shipped.
- **Meaning:** of a rewritten line, 48-84 % of its content words stay (Qwen 3.8 27B keeps most). Lines that already fit are never touched.
- **Song form:** Qwen 3.5 9B left the verses out of 4 of its 11 drafts (Intro and three choruses for a verse-chorus score); before the song-form step these drafts looked as if they fit (the verses were not checked). Now the missing sections are written in the first round.
- Qwen 3.5 9B wrote one draft without end (cut off at 6144 tokens, as in Write Song): counted as failed, in both variants.
- Found on the way and fixed: 38 lines asked at once were cut off at 2048 tokens (now at most 20 lines a round, the furthest off first); a section written anew with fewer lines than phrases was taken (now a line per phrase is required).

**Recommendation:** for covers with new lyrics, a *Writer model* from the Local LLM list (a GGUF file, LM Studio or Ollama) - Gemma 4 12B fits every line; with the native writer about three of four lines fit after the rounds.

## E7 - what YuE2 makes of it

Two songs and two covers from study A1, each with one writer plan (Qwen 3.5 9B, held to the schema, mode *varied*); four conditions, rendered with YuE2 (two take seeds each), every take transcribed by SheetSage2 and compared with the score it was given. For cover C1 the guard kept the plan (the writer's chords did not fit; the score has none - D2), so its guard conditions are the plan's takes and were not rendered; cover C2 is instrumental without chords (no sung melody or chords to compare).

| Songs (4 takes each) | sung melody followed (note F1) | chord roots followed | sung notes on chord tones (in the take) | accented clashes a minute | key clarity |
|---|---|---|---|---|---|
| YuE2's plan | 0.98 | 1.00 | 84 % | 0.0 | 0.79 |
| 0.4.5's arrangement | **0.79** | **0.83** | 82 % | 0.1 | 0.80 |
| guard, fills (default) | 0.97 | 0.98 | 77 % | 0.3 | 0.76 |
| guard, lines under the singing | 0.95 | 0.94 | 80 % | 0.3 | 0.76 |

| Covers | sung melody followed | chords added | sung notes on chord tones | accented clashes a minute |
|---|---|---|---|---|
| plan (4 takes) | 0.97 (C1) | - | 73 % | 1.5 |
| 0.4.5 (4 takes) | 0.98 (C1) | yes, to a score without chords (C1: followed 0.67) | 67 % | 2.5 |
| guard (2 takes, C2) | - | no | 70 % | 0.0 |

- **0.4.5's arrangements pulled YuE2 off the sung melody** (note F1 0.98 -> 0.79 in the songs; one take 0.70) and off the chords (0.83) - the lines under the voice conditioned a second melody. With the guard YuE2 follows the score as it follows its own plan (0.97-0.98).
- On the covers 0.4.5 added chords to a score without chords and clashed most (2.5 accented clashes a minute); the guard adds none (D2) and clashed least.
- **Not yet better than YuE2's own plan:** in the songs the takes' sung notes sit on the chord tones slightly less often with the writer's (guarded) chords than with YuE2's own (77-80 % against 84 %). The guard keeps the clashes out; whether the writer's colours are an improvement in the ear is the owner's verdict.

**Listening pack:** `D:/Daten2/ComfyUI/output/plenio-study-e7/` - 28 takes in random order (`01.flac` ...), `sheet.md` for the verdicts (harmony 1-5, clashing notes and where), `key.json` (which take is which; open it after listening).

### The owner's verdict (blind, 2026-10-08)

| Condition | takes | harmony, mean (1-5) | lowest |
|---|---|---|---|
| YuE2's plan | 8 | **4.88** | 4 |
| 0.4.5's arrangement | 8 | **3.31** | 2 (*"dissonances in the chorus from the middle on, unusable"*) |
| guard, fills (default) | 6 | **4.83** | 4 |
| guard, lines under the singing | 6 | **4.00** | 3 (*"it clashes at the very end"*) |

- The guard brings the arranged songs back to the level of YuE2's own plan; 0.4.5's arrangements were the clearly worse ones - the measured picture (note F1, chord adherence) holds in the ear. Lines under the singing stay the experimental option (D1).
- **The key lifts** were the remark on most takes: good in themselves, but sudden ("not quite smooth"), and in one song lifted for the last chorus and back down for the outro. In 0.4.5's takes the melody did not fit after the lift. Changed after the verdict: a lift holds to the end of the song and is prepared in the bar before by a chord leading into the new key (the dominant; its subdominant or the lowered seventh step where the dominant would clash with the melody) - replayed on study A1's plans, 74 of 79 lifts are prepared, 5 come unprepared (every leading chord would clash; reported).
- Follow-up: S1 and S2 rendered again with the prepared, held lifts (same plan and take seeds; S1: C7 before Fm, S2: Cm before Gm and no fall back in the outro) - pack `plenio-study-e7/lifts/` (four takes, own sheet and key). Measured: sung melody followed 0.98-0.99, chord roots 0.83-1.00. The owner's verdict: 4, 5, 5, 5 - the notes and chords in the new key right, no fall back, but the change still "rather sudden, without a transition", and in one take a slightly odd note in it; the owner asked to apply the rules of modulation.
- Second follow-up, after that: the lift led in by a chord sequence by those rules - a chord of both keys and the new key's dominant (the pivot-chord modulation), or the new key's bVI and bVII rising to it, a bar each where the melody allows (S1: Db - C7 -> Fm in the last bar; S2: Eb - F -> Gm over the last one and a half bars). Replayed on study A1's plans: of 79 lifts, 27 get a two-chord sequence (13 over two bars), 47 a single leading chord, 5 none (reported). Rendered again (pack `plenio-study-e7/lifts-2/`, M1-M4): sung melody followed 0.97-0.99, chord roots 0.96-1.00 (the first follow-up: 0.83-1.00), no take running past its score; the owner's verdict is open.
- Abrupt endings: two of 0.4.5's takes ran past the end of the score to the render ceiling (YuE2 lost its place); one plan take of a cover ends without an outro because the transcribed source does; every guard take ends with its score.
- Unclear words in some takes (YuE2's singing; the instrumental cover hummed); not a matter of the arrangement.

## Also changed on the way

- The arrangement **gate** compares the share of the melody's time that clashes with its chords as well (a fuzz case: a short weak-beat note, half the sung time, against a new chord); replayed on study A1's 120 plans this changes nothing - the guard already keeps such chords out.
- The arranger is **asked once more** about sections the guard had to repair much (stage F); replayed on study A1's 120 plans, 9 plans (11 of 660 sections) would ask again - the writer is rarely called a second time; the host test covers the round with a real server.
