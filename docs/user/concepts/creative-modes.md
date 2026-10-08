# Creative modes

> **Experimental (0.4.5).** Creative modes and the closeness sliders can give unexpected results - a chord that surprises, an instrument line that does not fit every song, a plan that is not applied. They are meant for experimenting first: try a mode, listen, change the score in the Song Sheet or run again with another *arrangement seed*, and keep what you like. *simple* is the dependable choice.

▶ **Videos:** *Tutorial 6 · YuE2 · Song · Creative modes* and *Tutorial 7 · YuE2 · Cover · Creative modes* in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

How freely a song is written and arranged. Song Brief and Cover Brief have an **arrangement** choice:

- **off** (default; called *simple* until 0.4.5 - saved workflows are read as *off*) - no arrangement, as before: the writer drafts title, style and lyrics, and the music model plans melody, chords and instruments by itself.
- **a creative mode** - the mode's hints go into the writing prompt (for example *many instruments*: a large ensemble in the style), and in *YuE2 Song* and *YuE2 Cover* the writer model also plans **every section of YuE2's score**: which chords, what the instrument line plays, how busy it is, whether a section lifts its key. Plenio turns that plan into notes, checks the result and shows it in *Song Sheet · Score*.

## The modes

| Mode | Sounds | Instrument line | Key, tempo | Chords |
|---|---|---|---|---|
| **standard** | genre-typical: calm verses, fuller choruses, the last chorus strongest | pads or arpeggios under verses, riffs or countermelodies under choruses | a lift of 1-2 semitones in the last chorus | sevenths and sixths where they fit |
| **varied** | no two neighbouring sections alike; new chords in the bridge | changes from section to section, also solos and motifs | lift 0-2; tempo ±5 % | sevenths and sixths |
| **fantasy** | imaginative, film-like, surprising but beautiful | countermelodies, a solo, a returning motif | a bridge may move -2..+3; tempo ±10 % | every chord YuE2 reads, slash chords too |
| **sterile** | clean, sparse, steady | long pad notes or silence | no changes | plain major and minor |
| **many instruments** | a full ensemble, something always plays besides the voice | riffs, countermelodies, a solo, octave doubling | lift 0-2; tempo up to +5 % | sevenths and sixths |
| **dramatic** | one long arc from quiet to a big climax | from pads to the busiest line at the climax | the last chorus up to +3 | darker before the climax |

Your own modes are Markdown files in `<ComfyUI user directory>/plenio/arrangement/` - the format is described in [resources/arrangement/README.md](../../../resources/arrangement/README.md). They appear in the list after a refresh (R); a file with a mistake is skipped and named in the ComfyUI log.

## The sliders

**genre closeness** (Song Brief, creative modes only) - how close the song stays to its genre. It shapes the style words and the section plan:

| Value | Meaning | The plan may |
|---|---|---|
| 90-100 | strictly typical, no surprises | lift a key by at most 2, never change the tempo; chords must hold the melody notes |
| 70-89 (default 70) | typical with personal touches | as the mode allows, but no tempo change |
| 40-69 | free within the genre | chords may colour the melody (added 2nd/9th and 6th) |
| 0-39 | borrow from any style | chords may colour freely (no melody note a half step above a chord note) |

**song flow closeness** (Cover Brief, creative modes only) - how close the cover's music stays to the original. The **melody and the form always remain** - they are what makes it a cover.

| Value | Meaning |
|---|---|
| 95-100 | exactly the original: nothing is planned, the writer is not even asked |
| 80-94 | chords, key and tempo stay; only sections whose instrument line rests get one |
| 50-79 (default 70) | recognisable: chords recoloured, the instrument lines changed, a small key lift |
| 20-49 | a free version: new chords and lines, another energy, tempo ±10 % |
| 0-19 | only a hint of the original: harmony, lines, tempo and energy reinvented |

**lyrics closeness** (Cover Brief, *new lyrics* only, in every arrangement mode) - how close the new words stay to the source's:

| Value | The new lyrics |
|---|---|
| 0 (default) | are written without the source's text, as before |
| 1-29 | keep only a hint of it: one image or phrase may echo the original |
| 30-59 | keep its theme and mood, with their own story and images |
| 60-89 | retell its story and keep its central images, in new words |
| 90-100 | keep its meaning line by line - a singable translation when the language differs |

Above 0 the source's lyrics are transcribed for the writer (the lyrics ASR runs), so the source needs clear singing; a source without it stops with a message that names this slider.

## How a section plan becomes music

1. **Compose Arrangement** shows the writer the score as a table: every section with its bars and chords, the melody notes on the strong beats, what the instrument line plays now - plus the mode's rules, the closeness in words and the exact answer format.
2. The writer answers with a small **JSON plan** - per section the chords (one per bar), the *lead* role of the instrument line, an energy from 1 to 5, a key shift - never notes or ABC. With a Local LLM model (GGUF files, LM Studio, Ollama) the answer is held to the plan's format while it is written; other writers answer freely and Plenio reads leniently (code fences, a missing last brace, chord aliases such as *Cmaj9* -> *Cmaj7* are repaired and reported).
3. **Apply Arrangement** writes the notes itself, with the same checked operations as *Score Tools*:
   - **chords** bar by bar - a chord must fit the melody on the strong beats, otherwise the planned chord stays;
   - **the instrument line** (YuE2's second voice, *Ins*): *pad*, *arpeggio*, *riff*, *countermelody*, *solo*, *octave* (the sung melody an octave away), *motif* (the writer's figure in note names, moved onto every chord), *none*, *keep*. A line that carries the melody - an instrumental with a lead - is never replaced, and lines are built on chords;
   - **key lifts** - only while the voice stays in its range (at most two semitones above the song's highest note);
   - the **tempo** change.
4. The result must pass YuE2's parser, read back unchanged, open note by note in the score editor and fit YuE2's context. Otherwise the score **stays as it was**, and *Song Sheet · Score* shows a warning with the reason (*Arrangement not applied - ...*).

The plan cannot break the score: in the tests random scores and random, partly broken plans always gave either a valid arranged score or the old one unchanged.

## Where you see it

- **Song Sheet · Score**: the summary names the result (*varied: 5 of 7 sections arranged*). In the editor, the **Arrangement** line above the findings opens the details: the writer's idea and per section what was applied and what stayed (for example *bar 3: C# clashes with the melody; C stays*). A fallback is shown there in amber and is a warning of the sheet.
- The **release record** keeps the arrangement with the sheet's report.

Edit the arranged score in the sheet like any other: your edit wins (it is the sheet's rule).

## Another arrangement, and what runs again

- **Arrangement seed** (*4 · SCORE* / *3 · SCORE*, also in App mode): another plan for the same song. Only *Arrange* and what follows it run again.
- **The mode or a slider changed**: the brief changed, so ComfyUI runs everything after it again - the writer, YuE2's plan, the arrangement. A Local LLM model answers from Plenio's **answer cache** when the request is the same (for example the closeness moved within its band): no second call. A new mode changes the writing prompt, so the text is drafted again and needs a new approval in *one song, stop to review*.
- **One song, stop to review**: the arrangement runs after you approved the text, and *Song Sheet · Score* stops with the arranged score - approve it or try another arrangement seed.

## Which writer model

The plan is written by the template's **Writer model** (one list for every writing step). Study A1 (October 2026, 12 plans per model on six real YuE2 scores, [report](../../test-reports/2026-10-07-a1-arrangement-llm.md)) measured how local models handle the task:

| Writer | Usable plans, free | Usable plans, held to the format | Sections with new chords | Proposed chord bars that clashed (kept out) |
|---|---|---|---|---|
| Gemma 4 E2B (2 B) | 12/12 | 12/12 | all | 19 % |
| Gemma 4 E4B (4 B, the default writer) | 12/12 | 12/12 | about half | 21-29 % |
| Qwen 3.5 9B | 12/12 | 12/12 | a quarter | 18-26 % |
| Gemma 4 12B | 12/12 | 12/12 | a quarter to a third | 43-50 % |
| Qwen 3.8 27B | 12/12 | 12/12 | one in seven | 31 % |

**Recommendation:** any instruction-tuned model from about 2 B parameters plans usable arrangements - the default writer is enough. A GGUF file in `models/LLM`, an LM Studio or an Ollama model is held to the plan's format exactly; the native writer answers freely and Plenio repairs what it can (in the study with the same result). Bigger is not more correct here: the models differ in **character** - small Gemma models re-harmonise every section, the Qwen models change little - and Plenio's melody check keeps the harmony right either way. Writing the notes directly in ABC is not offered: in the same study no model up to 12 B wrote one valid section, and the 27 B model 3 of 12.

## Limits

- YuE2 reads the score's two voices and the chord symbols; **what you hear** - the instruments, the production - comes mostly from the style. That is why the modes also shape the style words.
- The instrument line is one voice. *many instruments* fills it in every section and names a large ensemble in the style; the ensemble itself is YuE2's.
- A key lift moves the voice: Plenio keeps it within the song's range plus two semitones, and the sheet still checks whether the voice in the style fits.
- MiniMax Music 3 and the DAW template have no planned score: there the creative mode shapes only the writing.
