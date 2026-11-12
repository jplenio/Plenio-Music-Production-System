# Creative modes

> **Experimental.** Creative modes and the closeness sliders can give unexpected results - a chord that surprises, an instrument line that does not fit every song, a plan that is not applied. They are meant for experimenting first: try a mode, listen, change the score in the Song Sheet or run again with another *arrangement seed*, and keep what you like. *off* is the dependable choice.

▶ **Videos:** [Tutorial 6 · YuE2 · Song · Creative modes](https://jplenio.github.io/Plenio-Music-Production-System/go/tutorial-6-yue2-song-creative/) and [Tutorial 7 · YuE2 · Cover · Creative modes](https://jplenio.github.io/Plenio-Music-Production-System/go/tutorial-7-yue2-cover-creative/). All of them in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

How freely a song is written and arranged. Song Brief and Cover Brief have an **arrangement** choice:

- **off** (default) - no arrangement: the writer drafts title, style and lyrics, and the music model plans melody, chords and instruments by itself.
- **a creative mode** - the mode's hints go into the writing prompt (for example *many instruments*: a large ensemble in the style), and in *YuE2 Song* and *YuE2 Cover* the writer model also plans **every section of YuE2's score**: which chords, what the instrument line plays, how busy it is (and, in the mode *key change* only, where the key changes). Plenio turns that plan into notes, checks the result and shows it in *Song Sheet · Score*.

The brief's **creativity** slider is a separate, simpler choice: it makes the writing and YuE2's sampling steadier or bolder whatever the mode, and with a mode on it also sets how freely the writer plans ([Creativity](creativity.md)).

## The modes

From simple to rich - the list in the brief has the same order, and the line under the brief says what the chosen mode does (the Song Brief's help page lists them all). Only **key change** changes the key; every other mode keeps it from start to end.

| Mode | Sounds | Instrument line | Tempo | Chords |
|---|---|---|---|---|
| **standard** | genre-typical: calm verses, fuller choruses, the last chorus strongest | pads or arpeggios under verses, riffs or countermelodies under choruses | stays | sevenths and sixths where they fit |
| **sterile** | clean, sparse, steady | long pad notes or silence | stays | plain major and minor |
| **unplugged** | intimate and acoustic (guitar or piano), warm and close; energy never above 3 | fingerpicked broken chords under verses, soft pads under choruses, sometimes nothing | up to 5 % slower | warm: sus2, sus4, sixths |
| **varied** | no two neighbouring sections alike; new chords in the bridge | changes from section to section, also solos and motifs | ±5 % | sevenths and sixths |
| **call and response** | the instruments answer the melody, like a band talking back to the singer | short answers in the gaps between the phrases; the same answering figure in every chorus | stays | sevenths and sixths |
| **signature motif** | one short figure becomes the song's trademark | the same figure in the intro, every chorus and the outro, moved onto each chord; simple or silent in between | stays | sevenths and sixths |
| **hypnotic** | a steady repeating pattern, changing little by little (trance, minimal, krautrock) | one riff or arpeggio through most sections | stays | few, plain chords - often two alternating |
| **breakdown** | full sections, then a breakdown to almost nothing, then a build into a big final section | from riffs down to pads or silence and back up | stays | a darker chord in the breakdown |
| **dramatic** | one long arc from quiet to a big climax | from pads to the busiest line at the climax | stays | darker before the climax |
| **many instruments** | a full ensemble, something always plays besides the voice | riffs, countermelodies, a solo, octave doubling | up to +5 % | sevenths and sixths |
| **jazz colours** | rich jazz harmony, smooth rather than loud | pads and broken chords, a mellow countermelody, a solo | up to 5 % slower | seventh chords throughout, ii-V turns before a section changes |
| **fantasy** | imaginative, film-like, surprising but beautiful | countermelodies, a solo, a returning motif | ±10 % | every chord YuE2 reads, slash chords too |
| **key change** | *standard*, plus one key change: the final chorus lifted a half or whole step | as *standard* | stays | as *standard*; leading chords into the new key |

Why only one mode changes the key: in the demos of October 2026 the writer lifted the last chorus in every sung song with *standard* (a half step in 233 sections) - the "truck driver's gear change" that rarely helps a song. A lift now happens only when you choose *key change*.

Checked with a real writer model (Qwen 3.5 9B, held to the plan's format) on two sung songs and two instrumentals of those demos, every mode (52 plans, October 2026): no key change in the twelve modes that keep the key; *key change* lifted the final section (or the last two) in all four songs; and the modes keep their character - *sterile* silence and pads at energy 1-3, *unplugged* broken chords at 2-3, *breakdown* its drop to energy 1 before the finale, *dramatic* a rising arc, *hypnotic* one riff or arpeggio, *jazz colours* new seventh chords in every section, *signature motif* and *call and response* one figure for the whole song (Plenio keeps the plan's first figure in every section that plays it - the writer had varied it).

Your own modes are Markdown files in `<ComfyUI user directory>/plenio/arrangement/` - the format is described in [resources/arrangement/README.md](../../../resources/arrangement/README.md). They appear in the list after a refresh (R); a file with a mistake is skipped and named in the ComfyUI log.

## The sliders

**genre closeness** (Song Brief, creative modes only) - how close the song stays to its genre. It shapes the style words and the section plan:

| Value | Meaning | The plan may |
|---|---|---|
| 90-100 | strictly typical, no surprises | never change the tempo (*key change*: lift by at most 2); chords must hold the melody notes |
| 70-89 (default 70) | typical with personal touches | as the mode allows, but no tempo change |
| 40-69 | free within the genre | chords may colour the melody (added 2nd/9th and 6th) |
| 0-39 | borrow from any style | chords may colour freely (no melody note a half step above a chord note) |

**song flow closeness** (Cover Brief, creative modes only) - how close the cover's music stays to the original. The **form always remains**. From 80 the melody stays too; below 80 it follows the new chords - the lower the closeness, the more it may change. A sung melody keeps its rhythm, so every syllable stays on its note (new lyrics are checked against the final melody, as always).

| Value | Meaning |
|---|---|
| 95-100 | exactly the original: nothing is planned, the writer is not even asked |
| 80-94 | chords, key and tempo stay; only sections whose instrument line rests get one; the melody stays |
| 50-79 (default 70) | recognisable: chords recoloured, the instrument lines changed (*key change*: a lift of at most 2); a melody note that clashes with a new chord moves onto it - to the nearest chord tone on a strong beat or held for a beat, by a step otherwise |
| 20-49 | a free version: new chords and lines, another energy, tempo ±10 %; the writer's chords win over the old melody nearly everywhere, and the melody is written anew over them - chord tones on the accents, small steps, phrases that end on a chord tone; near the old line at 49, freer the lower it goes |
| 0-19 | only a hint of the original: harmony, lines, tempo and energy reinvented, and a new melody over the new chords in the old rhythm |

In an instrumental cover whose instrument line carries the melody, that line may also get new rhythms below 45 (from 20 its first bar keeps its rhythm - the hook). The arrangement seed picks the shape a rewritten melody follows.

**lyrics closeness** (Cover Brief, *new lyrics* only, in every arrangement mode) - how close the new words stay to the source's:

| Value | The new lyrics |
|---|---|
| 0 (default) | are written without the source's text |
| 1-29 | keep only a hint of it: one image or phrase may echo the original |
| 30-59 | keep its theme and mood, with their own story and images |
| 60-89 | retell its story and keep its central images, in new words |
| 90-100 | keep its meaning line by line - a singable translation when the language differs |

Above 0 the source's lyrics are transcribed for the writer (the lyrics ASR runs), so the source needs clear singing; a source without it stops with a message that names this slider.

**New lyrics fit the melody** (every cover with *new lyrics*, also with arrangement *off*): *Write Song* first puts the draft in the score's song form (a section the writer left out is written anew), then counts the syllables of every line against the notes of its phrase in the final score (about one syllable per note; one or two fewer are sung as a melisma; a line may span two short phrases). Lines that do not fit go back to the same writer - only those lines, with their targets and the rhyme to keep, at most twice; a new line further off than the old one is not taken. What is then still one or two syllables too long is shortened the way a singer would sing it (*I am* -> *I'm*, *going to* -> *gonna*; English). When the draft fits, the writer is not asked again. The node is **Fit Lyrics** inside the *Write Song* block.

## How a section plan becomes music

1. **Compose Arrangement** shows the writer the score as a table: every section with its bars and chords, the melody's notes in every bar (those on a strong beat marked with *), what the instrument line plays now - the **chords that fit** each section's key in the genre (for example *B, C#m, D#m, E, F#, G#m; borrowed, typical in pop: A, Em, G*) - plus the mode's rules, the closeness in words and the exact answer format.
2. The writer answers with a small **JSON plan** - per section the chords (one per bar), the *lead* role of the instrument line, an energy from 1 to 5, a key shift (always 0 but in *key change*) - never notes or ABC. With a Local LLM model (GGUF files, LM Studio, Ollama) the answer is held to the plan's format while it is written; other writers answer freely and Plenio reads leniently (code fences, a missing last brace, chord aliases such as *Cmaj9* -> *Cmaj7* are repaired and reported).
3. **Apply Arrangement** writes the notes itself, with the same checked operations as *Score Tools*:
   - **chords**, guarded (the *harmony guard*): the writer's chord stands where it belongs to the section's key or to the genre's usual borrowings (a dominant only when it resolves) and carries the melody of its **whole bar** - every note, weighed by its length and beat; a note that grinds against the chord on a strong beat or held for a beat is not allowed: a half step above a chord tone, a half step under its major seventh (Bb against Cmaj7), the #4 beside its fifth (F# over C), and a blue minor third over a major triad (over a dominant seventh chord blues, rock and metal keep it). In a cover below song flow closeness 80 the old melody counts only as much as the closeness says - at 20 the writer's chords win nearly everywhere - and is then fitted to the chords (see *song flow closeness*). Where the writer's chord does not stand, Plenio chooses per section the nearest chord that does - the original chord, the same root in another colour, or an in-key chord sharing two of its tones - and says so (*bar 3: Db is not a chord of C in pop; F instead*). A score **without chords** (a cover on *new accompaniment*) gets none: YuE2 harmonises it itself, as you chose;
   - **the instrument line** (YuE2's second voice, *Ins*): *pad*, *arpeggio*, *riff*, *countermelody*, *solo*, *octave* (the sung melody an octave away; only with lines under the singing), *motif* (the writer's figure in note names, moved onto every chord along the key's scale - C E G over C becomes A C E over Am), *none*, *keep*. Every note follows the chord sounding at it. In YuE2's own scores the *Ins* voice never plays while the voice sings - it is the instrumental melody - so **by default a line plays where the voice rests**: intros, interludes, the outro and the gaps between sung phrases (fills and answers). With the brief's **lines under the singing (experimental)** it also sounds under the voice: calm (energy at most 2), below the voice and never a minor second or major seventh against it. A line that carries the melody - an instrumental with a lead - is never replaced;
   - **key lifts** (the mode *key change*) - only while the voice stays in its range (at most two semitones above the song's highest note); a lift holds to the end of the song and is led in by chords - a chord of both keys and the new key's dominant (Cm - D7 -> Gm), or the new key's lowered sixth and seventh steps (Eb - F -> Gm), over the last one or two bars, as far as the melody allows;
   - the **tempo** change.
4. A **gate** per section: a section that clashes more after the arrangement than before - melody against its chords, or the voice against the line - goes back to how it was.
   **Asked once more:** where the guard had to replace more than a third of a section's chords, or the gate put a section back, the writer is asked once more about those sections - with what did not fit, the melody's notes of every bar and the chords that fit their key. The second plan is used when it needs fewer repairs and clashes no more; otherwise the first stands.
5. The result must pass YuE2's parser, read back unchanged, open note by note in the score editor and fit YuE2's context. Otherwise the score **stays as it was**, and *Song Sheet · Score* shows a warning with the reason (*Arrangement not applied - ...*).

Measured on the 120 writer plans of study A1 (October 2026): without the guard the line sounded under 85 % of the singing, with 5.8 clashes a minute against the voice; with it there are none, every chord belongs to the key or the genre, and still 87 % of the sections are arranged ([proposal](../../design/harmony-and-lyrics-fit.md)).

The plan cannot break the score: in the tests random scores and random, partly broken plans always gave either a valid arranged score or the old one unchanged.

## Where you see it

- **Song Sheet · Score**: the summary names the result (*varied: 5 of 7 sections arranged*). In the editor, the **Arrangement** line above the findings opens the details: the writer's idea, the **harmony check** (*melody 87 % on chord tones · 0 accented clashes with a chord · 0 between voice and line · chords 100 % in the key*) and per section what was applied and what stayed (for example *bar 3: C# is not a chord of C in pop; the bar keeps its chord*). A fallback is shown there in amber and is a warning of the sheet.
- **Apply Arrangement**'s summary has the same harmony check.
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
| Gemma 4 E4B (4 B, the default writer until 1.5.0) | 12/12 | 12/12 | about half | 21-29 % |
| Qwen 3.5 9B | 12/12 | 12/12 | a quarter | 18-26 % |
| Gemma 4 12B | 12/12 | 12/12 | a quarter to a third | 43-50 % |
| Qwen 3.8 27B | 12/12 | 12/12 | one in seven | 31 % |

**Recommendation:** any instruction-tuned model from about 2 B parameters plans usable arrangements - the default writer is enough. A GGUF file in `models/LLM`, an LM Studio or an Ollama model is held to the plan's format exactly; the native writer answers freely and Plenio repairs what it can (in the study with the same result). Bigger is not more correct here: the models differ in **character** - small Gemma models re-harmonise every section, the Qwen models change little - and Plenio's harmony guard keeps the harmony right either way. Writing the notes directly in ABC is not offered: in the same study no model up to 12 B wrote one valid section, and the 27 B model 3 of 12.

## Limits

- YuE2 reads the score's two voices and the chord symbols; **what you hear** - the instruments, the production - comes mostly from the style. That is why the modes also shape the style words.
- The instrument line is one voice. *many instruments* fills it in every section and names a large ensemble in the style; the ensemble itself is YuE2's.
- A key lift (*key change*) moves the voice: Plenio keeps it within the song's range plus two semitones, and the sheet still checks whether the voice in the style fits.
- Instrumental songs: YuE2 often plans an intro and one long part. Before the arrangement, *prepare from brief* splits a part of more than 16 bars into parts of 8 or 16 bars at phrase ends and names them by their music (a part that comes back takes the name of the first one), so every mode has sections to vary - see [YuE2 Song](../paths/yue2-song.md).
- MiniMax Music 3 and the DAW template have no planned score: there the creative mode shapes only the writing.
