# More musical detail for YuE2 - research and proposal

| | |
|---|---|
| Date | 2026-10-07 |
| Question (owner) | The drafts YuE2 receives are short (a ~30-word style, the lyrics). Would more detail - what each section or time span should do musically - give better, less monotonous songs, above all instrumentals? If so: an option for more detail, and how it fits the Song Sheet (editable per section). |
| Status | **Proposal; the owner decides.** Nothing of it is built. |

## 1. What YuE2 reads

| Channel | What it carries | Per section? | Evidence |
|---|---|---|---|
| `style` | genre, instruments, voice, language, mood, tempo - a short comma list (upstream examples ~20 words) | no, one line for the whole song | [UP] model card and skill: "Put genre, instruments, vocal character, language and intended tempo in `style`"; "Do not paste your own replacement instruction into the style prompt" |
| `lyrics` | section tags and the sung words | the **tag** names the section (verse, chorus, bridge, ...) | [UP] "Keep implementation notes out of lyrics"; [CM] "YuE2 will attempt to sing anything that isn't a section tag"; one guide claims a tag may carry an instrument note (`[Intro: Piano & Flute]`) - untested |
| `abc` (the score) | per bar: the Vocal melody, the **Ins** line, **chord symbols**, tempo, key and meter changes, `% section` comments | **yes - the only per-section musical channel** | [UP] abc-editing: rendered from melody, chords, tempo and key changes; dynamics, decorations and instrument names are ignored; it "does not force the generator to follow the score" - but covers follow it closely (SHS100K CLEWS mAP 0.647; Plenio 4A: melody overlap 0.89-0.92) |

There is no channel for prose instructions per section. Upstream's own way to "say" more per section is the score: its instrumental skill even lets an agent **compose the score** (`--composer agent`, events written by the LLM) instead of YuE2's planner.

## 2. What Plenio measured already

- **E6 (2026-10-01, 60 plans, 36 renders):** arrangement words in the style (*dynamic arrangement, breakdown, build-up, drop, evolving sections*) gave **no more variety** (novel windows better in 2/8 pairs); a planner-only song form gave a little more (7/10 pairs). EDM plans stayed **one chord, one pattern** for minutes whatever the lyrics said. The biggest single lever was length (fit length).
- **Phase 1A / 3:** verbose style prose was **sung** by the legacy models; a stage direction under `[Intro]` was sung until Parse removed it.
- **Monotony has a measurable cause in the score:** an 8-minute psytrance plan had 3 pitches, 1 chord and 11 % distinct bars; a sung plan 18 pitches, 7 chords, 68 % distinct.

Conclusion: longer *text* for YuE2 is unlikely to help and can hurt (sung text, out-of-distribution prompts, context budget). Variety has to reach YuE2 **as music in the score**.

## 3. Options

| | Option | What changes | Expected effect | Risk / cost |
|---|---|---|---|---|
| A | Longer style, section prose in the lyrics | the writer's prompt only | none measured (E6), may be sung | low cost, **not recommended** |
| B | **Section descriptors for the planner only** - `[Chorus: full band, lead guitar]` in the lyrics the planner reads (like the instrumental form of 0.3.1); the render keeps plain tags | writer rule + Parse (keep descriptors), text sheet output for the planner | unknown - the planner may plan different chords/density per section; no singing risk, because the render never sees them | small; **needs a measurement first** (E7) |
| C | **A section plan applied to the score** - the writer also writes per section: role, energy, **chord progression** (YuE2's chord vocabulary), key change, lead line (Ins riff / solo / rests); Score Tools applies it deterministically to the planned score (chords per section, final-chorus key lift, Ins line), visible in Song Sheet · Score | new document *arrangement*, Score Tools operation *apply arrangement*, editor fields per section | the strongest lever: harmonic and textural contrast is in the score, and YuE2 follows the score | medium; melody-chord clashes must be checked (chord tones on strong beats - the score analysis exists); quality of 7-12 B writers as harmonists is unknown |
| D | **The LLM composes the score** (upstream's agent composer): melody, Ins and chords per section as events -> canonical score | a composer mode next to YuE2's planner | full control; best suited to instrumentals | large; small LLMs are weak composers; sung melodies must fit the syllables |

## 4. Recommendation

1. **Do not lengthen the style or put prose into the lyrics** (option A) - measured and documented as ineffective or harmful.
2. **Measure before building (study E7, ~1 GPU day, the E6 tooling):** baseline vs B (descriptors for the planner) vs C-light (the writer's chord progression per section written into a melody-only plan) for sung pop and instrumental EDM/pop; metrics: distinct bars, chords per section, novel windows, Check Vocals, plus the owner's blind listening pack. Adopt only what wins, as with E6.
3. If B or C wins: **one option "arrangement detail: off / per section"** (default off until the listening verdict), owned by *Compose Writing Prompt* next to its *detail* setting and promoted on *Write Song*. The writer then answers a fifth block `ARRANGEMENT:` (one line per section). Length: about 50-80 tokens per section, well inside the new 6144-token answer limit.

## 5. Fit with the Song Sheet

- The arrangement becomes a **document of Song Sheet · Text** (auto / edited / manual like the others), shown **per section**: in the text editor as a table *section - lines - arrangement*, in the score editor in the **section inspector** (the section list exists: role, energy, chords, lead line), editable there.
- **WYSIWYG stays honest (R5, R6):** YuE2 still receives exactly style, lyrics and score. The arrangement is not sent as text; it reaches YuE2 only through the planner input (B) or through the visible Score Tools operation that writes it into the score (C), which reports every change ("chords set in 6 sections, last chorus +2 semitones"). The sheet labels it *plan for the score, not heard by YuE2 directly*.
- Edits flow like today: an edited arrangement makes the score step re-run; an edited score stays the user's (manual wins, R4).
