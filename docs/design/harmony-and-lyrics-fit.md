# Harmony and lyrics fit for the creative modes - research and proposal

| | |
|---|---|
| Date | 2026-10-08 |
| Question (owner) | Songs made with the creative modes vary in quality; sometimes notes clash badly. How does the song stay harmonic and genre-typical when the flow changes? Lyrics must stay meaningful when they depart from the original, and their syllables must always fit the (new or modified) melody - with a bounded, efficient re-generation where a check fails. Research what is sensible with local models, check as many variants as possible, propose an implementation with alternatives, and ask for approval before starting. |
| Status | **Approved 2026-10-08 (D1-D5 as recommended) and built** (`723c03b`..): the harmony guard and lines in the rests (3.1-3.3), Fit Lyrics with two repair rounds (3.4; D3 on the lyrics side: contractions, melisma - the score is approved before the lyrics and stays), Match Song Form with one second plan (3.4, songs), the arranger's re-ask (3.5); arrangement *off* instead of *simple*. Measured in studies G1, A2 and E7 ([report](../test-reports/2026-10-08-harmony-lyrics.md)); 3.6 (take selection) is not built. |
| Data | The owner's release records (369, read-only; only counts and averages are reported), the tutorial runs of 0.4.5, and the 120 writer plans of study A1 replayed with today's Apply Arrangement. Scripts: scratch (to become `tools/studies/harmony_check.py`). |

## 1. What was measured

All numbers are duration-weighted over the final scores of the release records. *Avoid note*: a melody note a half step above a chord tone (b9 over the root, the 4th over a major third, b6 over the fifth); *accented*: on a strong beat or a beat long or more. *Harsh*: Vocal and Ins a minor second or major seventh apart (any octave) while both sound; a *clash* is a harsh moment of an eighth note or longer.

### 1.1 The instrument line under the singing (the largest change)

| Scores | n | Ins sounds under the voice | harsh share of that time | clashes per minute |
|---|---|---|---|---|
| YuE2's own song plans (simple) | 195 | **0 %** | - | 0 |
| Covers, SheetSage2 transcription (simple) | 35 | **0 %** | - | 0 |
| Songs, creative mode (owner) | 4 | 96-100 % | 2.6-4.7 % | 1-2.4 |
| Covers, creative mode (owner) | 4 | 97 % | 2.4 % | 3.1 |
| Study A1 plans replayed (56 sung) | 56 | 85 % | 6.2 % | **5.8** |

By line role (all arranged sections): *riff* 5.9-12 % harsh, *countermelody* 2.4-5.4 %, *arpeggio* and *pad* about 2 %.

**Finding H1 - out of distribution.** In every score YuE2 plans itself and in every SheetSage2 transcription, the `Ins` voice never sounds while the voice sings: it is the **instrumental melody** (the lead when no one sings; upstream: the score "retains vocal and instrumental melodies"), not an accompaniment track. The creative modes write pads, arpeggios, riffs and countermelodies into `Ins` *under* the singing - a conditioning YuE2 has not seen. Two melodies at once, with a minor second between them several times a minute, is the most likely source of the clashing notes the owner hears. (The audio side is a hypothesis until study E7 renders and compares it; the score side is measured.)

### 1.2 Chords

| | Songs and instrumentals (YuE2 plans) | Covers without chords |
|---|---|---|
| Melody on chord tones, before → after (sung plans: 40 songs, 16 covers) | 0.62 → 0.62 | no chords → **0.59** |
| Chords inside the key after (all tones diatonic; 78 song/instrumental plans, 30 cover plans) | 99 % | **58 %** (36 % with a foreign tone, 6 % a foreign root) |

- For **songs** the writer's chords rarely leave the key and hold the melody as well as YuE2's own (0.62); single bad choices exist (G#m → Am in a B major/G# minor song: a chord a half step off the key, accepted because the check only reads the melody on beats 1 and 3 and allows 9ths).
- For **covers whose chords were removed** (*harmony: new accompaniment*, YuE2 should re-harmonise) the arrangement *adds* chords, and the render switches to *full* mode (a score with chords always renders *full*, `engines.yue2.planning_mode`). The owner's choice "YuE2 re-harmonises" silently becomes "the writer's chords are fixed" - and 42 % of those chords carry a tone outside the key.

### 1.3 How Apply Arrangement checks today (code review)

| Where | What it does | Gap |
|---|---|---|
| `apply._fits` | the new bar chord against the melody notes **on the strong beats only** (1 and 3 in 4/4); *colour* allows 2nd/6th, *free* anything not a half step above a chord tone | all other melody notes unchecked; no check against the key or the genre; *free* lets a #4 sit next to the fifth |
| one chord per bar | the plan gives one chord per bar; a bar's chords are replaced by it | a bar with two chords loses its harmonic rhythm (21 of 695 changed bars) |
| `lines.*` | lines are written from `chord_at(bar start)` | a second chord in the bar is ignored - the line holds the first chord's notes against it |
| `lines.pad/arpeggio/riff/solo` | chord tones in a fixed register | **no look at the sung note above** (harsh intervals, voice crossing) |
| `lines.riff` | figures `(0,3,5,7)` and `(0,7,0,10)` on every chord | a minor third over a major chord, a minor seventh over a maj7 chord |
| key lifts | notes, chords and key move together; singing range checked | fine; whether YuE2 renders an inline `[K:]` well is untested |

### 1.4 Lyrics against the melody (per section and per line, against the Vocal phrases)

| Lyrics | sections | ratio syllables/notes, median | sections outside 0.85-1.3 | as many lines as phrases | lines more than 25 % off their phrase |
|---|---|---|---|---|---|
| Cover, **new lyrics** | 138 | 0.84 | **54 %** | **27 %** | **41 %** |
| Cover, original lyrics (ASR) | 141 | 0.87 | 45 % | 43 % | 26 % |
| Songs (lyrics first, YuE2 plans the melody) | 1219 | 0.91 | 42 % | 36 % | 33 % |

- The syllable estimate (vowel groups) and the phrase split (rests of a beat) are rough: even the original words of a song miss the window in 45 % of the sections. The realistic target for new lyrics is **the original lyrics' fit** (per-line deviation median 0.08, 26 % of lines off) - new lyrics today are about twice as far off per line (0.15, 41 %).
- New lyrics follow the **phrase structure** much less (27 % of the sections have one line per phrase, the original words 43 %).
- **Songs:** the writer's sections and YuE2's planned sections can disagree (tutorial 6: the plan left out the chorus the lyrics have). No step reacts to it except a warning.

### 1.5 Research: what helps, what runs locally

| Topic | Finding | Source |
|---|---|---|
| LLMs and syllables | LLMs count syllables badly (numerical planning); GPT-4 writes coherent lyrics whose syllables drift off the last notes; successful systems give **per-line targets**, count **outside the model** and **revise iteratively** | REFFLY (NAACL 2025); song-form-aware lyrics generation (Interspeech 2025); singable translation with verification-guided and multi-round prompting (EACL 2026 SRW); SylAVL-CoT (EMNLP 2025, MAVL) |
| Cut-off risk | forcing a stop at the syllable target leaves dangling lines - plan the line as a whole | Unsupervised Melody-to-Lyric Generation (ACL 2023) |
| Singable translation | length (syllables per line), rhyme class and word boundaries as per-line controls | Songs Across Borders (ACL 2023); evaluation framework (ISMIR 2023) |
| Harmonising a melody | dynamic programming over candidate progressions scored by note-level dissonance, phrase templates and whole-piece coherence | AccoMontage2 (ISMIR 2022, MIT code; data of unclear licence, a model file reported missing, unmaintained) |
| Neural harmonisers | MelodyT5 (ABC, harmonisation task; MIT code, training data research-only), AutoHarmonizer (MIT, Wikifonia data), SurpriseNet | MelodyT5 (ISMIR 2024) and repositories |
| Accompaniment from a melody | Anticipatory Music Transformer: infilling around a fixed melody, Apache-2.0 code and small weights (128 M - 780 M), trained on Lakh MIDI (copyright caveat), GPU | Thickstun et al. (TMLR 2024) |
| Genre chord statistics | Chordonomicon: 666 k progressions with genre labels - **CC BY-NC** (not shippable) | Chordonomicon (2024) |
| Key finding | Krumhansl-Kessler / Albrecht-Shanahan profiles: correlate the pitch-class durations with 24 key profiles (a few lines of code) | Krumhansl 1990; Temperley |
| Dissonance | sensory roughness (Plomp-Levelt, Sethares) ranks intervals as the minor second/major seventh worst - the measure used above | Sethares |
| Syllables in code | pyphen (40+ languages, LGPL/MPL/GPL tri-licence, hyphenation points), CMU Pronouncing Dictionary (English, BSD-style) | pyphen, CMUdict |

**Conclusion of the research:** let the LLM do what it is good at - intent, words, form - and let deterministic code do what needs exactness: harmony against the melody, counting, fitting. That is ADR-0011's line, applied to harmony checks and lyrics. The neural harmonisers are interesting but bring licence, maintenance and GPU questions; a rule-based guard reaches the measured problems without any of them.

## 2. Principles

1. **Harmony is never left to chance.** Every score that goes to YuE2 passes a *harmony gate*; what cannot be repaired falls back - per section - to the score as YuE2 or the transcription had it. A song always comes out, with or without lyrics, harmonic within its genre.
2. **YuE2 gets what it knows.** The `Ins` voice stays an instrumental *melody*: fills and answers where the voice rests, the lead in instrumentals. Texture under the singing is asked for with the chords and the style words, not with notes in `Ins` (unless the user switches it on, see 3.2).
3. **Lyrics are checked against the final melody, right before the render** - whatever changed the melody or the form before. A failed check asks for a targeted repair of the failing lines only.
4. **Bounded re-generation.** At most 2 repair rounds for lyrics, 1 re-ask for an arrangement, 1 re-plan for a song form; then a deterministic fallback, and the Song Sheet says what happened.
5. **Manual wins (R4).** A score or lyrics edited by the user are reported against, never rewritten.

## 3. Proposal

### 3.1 Harmony guard for chords (core, deterministic)

1. **Key per section** from the melody and the existing chords (Krumhansl-Kessler / Albrecht-Shanahan profiles), instead of trusting `K:` - covers' transcribed keys can be wrong.
2. **Genre vocabulary.** A small table per genre family (pop, rock, EDM/dance, folk/acoustic, R&B/soul, jazz, metal, cinematic, ...; chosen from the brief's genre words): allowed chord qualities of YuE2's vocabulary, borrowed chords (bVII, iv, bVI in rock/pop; V7 in minor; secondary dominants that resolve), tension policy. The mode files and the closeness slider only widen or narrow it (high closeness = the genre-typical set). Hand-made, no dataset with an unclear licence.
3. **Whole-bar fit.** Every melody note of the bar against the chord sounding under it, weighted by beat strength and length; accented avoid notes are not allowed; the new chord must hold the melody at least as well as the old one minus a small tolerance; a bar keeps its harmonic rhythm (the plan may give half-bar chords).
4. **Repair instead of reject.** Per section a small dynamic programme: candidates per bar = the writer's chord, the original chord, and in-key chords that share its function or two of its tones; cost = melody fit + distance to the writer's intent (the *idea*, colour, energy) + transition cost (functional motion, no chromatic root steps without a dominant function). The cheapest path wins - the writer's intent where it fits, the nearest sound alternative where not (the AccoMontage2 idea, rule-based).
5. **Covers on *new accompaniment*:** the arrangement adds **no chords**; YuE2 re-harmonises in *melody* mode as the owner chose. Lines in the rests are then built on the key, not on chords YuE2 does not follow. *(Alternative: guarded chords, which switch the render to *full* - see decision D2.)*
6. **Key lifts** stay as they are (measured fine); optional: a dominant of the new key in the last bar before the lift; E7 tests whether YuE2 renders inline `[K:]` in tune.

### 3.2 Instrument lines that fit (core, deterministic)

1. **Default: lines where the voice rests** (*fills*): intros, interludes, outros and gaps of at least a beat between sung phrases - call-and-response, as YuE2's own plans and the transcriptions do. Instrumental songs keep their lead line (unchanged).
2. **Under the singing - optional** (*lines under the singing: off / sparse / full*, default off, experimental): only with the clash repair below and at most energy 2 (half notes, pads).
3. **Every note against the chord sounding at it** (multi-chord bars), not the bar's first chord.
4. **Every note against the sung note above it** (when on): no minor second, major seventh or minor ninth; no unison or crossing with the voice; prefer thirds, sixths, octaves - a moved note takes the nearest chord tone that is not harsh, else a rest. Replayed on the A1 plans this removed **all 5.8 clashes per minute** while the line stayed 88 % on chord tones.
5. **Riff and motif figures follow the chord quality** (a minor third only on minor chords, a minor seventh only on dominant and minor-seventh chords).

### 3.3 The harmony gate (before the render, every flow)

A score report in the Song Sheet - *harmony: 96 % of the melody on chord or colour tones, 0 accented avoid notes, 0 clashes, all chords in the key* - with limits per closeness. Over the limit after the guard: the section falls back to its original chords and line; with an LLM plan: one re-ask with concrete feedback (3.5). The editor shows the remaining weak bars (*harmony* findings) so a user can fix them by hand.

### 3.4 Lyrics that fit the melody and keep their sense

**Counting.** A better syllable counter in core (rules plus an exception list for English and German, the vowel-group estimate for other languages) - no new package; *alternative D4:* pyphen (LGPL/MPL) for 40 languages, CMUdict for English stress.

**Prompt (first draft).** The writer gets, per section, the phrases with their exact note counts and - for a cover with lyrics closeness above 0 - each original line with its syllables and meaning; it answers in JSON (held to a schema by GGUF/LM Studio/Ollama; the native writer is read leniently):

```
{"sections": [{"tag": "Verse 1",
  "beat": "what this section tells (one sentence)",          <- plan first: the story beat
  "rhyme": "ABAB",
  "lines": [{"text": "I drive the coast road home tonight",
             "syllables": "I drive the coast road home to-night"}]   <- hyphenated: the count is explicit
}]}
```

Rules in the prompt: one line per phrase (the schema fixes the number of lines per section), each line with the phrase's syllable count (a melisma may take one or two fewer, never more), a repeated melody repeats its lines (a chorus stays the chorus), the story beats of the section, the rhyme scheme of the original where closeness is 60 or more, the language and the theme of the brief. The hyphenated form makes the model plan syllables word by word; Plenio counts itself and does not trust the model's count.

**Check and repair (at most 2 rounds, only failing lines).** Plenio counts every line against its phrase (tolerance: notes - 2 to notes, 15 % for long phrases). Failing lines go back with their neighbours and the section's beat:

```
Rewrite only these lines. Keep the meaning, the rhyme with the line given, and the language.
Verse 1, line 3 (rhymes with line 1 "...tonight"): 11 syllables, the phrase has 8 notes - write 7-8.
Answer with the same JSON, only the lines asked for.
```

Lines that pass stay untouched; the answer cache makes repeated runs free. After round 2: **deterministic last mile** - a line one or two syllables off gets a melisma (one syllable over two notes) or a repeated note (a long note split in two) in the Vocal voice, pitches unchanged, reported; *alternative:* accept with a warning only (decision D3).

**Where the loop runs.** In the *Write Song* block, unrolled: *Check Lyrics Fit* → (lazy) writer repair → merge, twice. Nothing runs when the draft fits. The same check runs again in Song Sheet · Text before the render (principle 3).

**Songs: when the form does not match.** If YuE2's planned sections differ from the lyrics' (a chorus left out), first **one re-plan** with the next plan seed; if the form still differs, the writer **adapts the lyrics to the planned form** (sections merged or dropped, then the syllable check against the new phrases). Never a silent render with lyrics for another form.

**Future-proof.** Should an arrangement ever change the melody or the form (lower song flow closeness), the same gate catches it: the lyrics are re-checked against the arranged melody and repaired before the render.

### 3.5 Re-asking the arranger (at most once)

When the guard had to replace more than a third of a section's chords, or a section fell back, the writer gets one targeted re-ask: "bars 5-8: Fm and Db clash with the melody notes C and E; choose from: Ab, Cm, Eb, Fm7(b5) ...; keep your idea". Its answer goes through the same guard; then the section's result stands.

### 3.6 After the render (optional, GPU)

*Check Vocals* already re-transcribes takes for instrumental covers. Extended: for N takes, SheetSage2's transcription of each take against the conditioning score (melody adherence, chord agreement) and the take's key clarity (chroma against key profiles) - the take that follows the score best wins. Costs one transcription per take; off by default.

## 4. Alternatives considered

| | Alternative | For | Against | Verdict |
|---|---|---|---|---|
| A | Rule-based guard and repair (3.1-3.3) | explainable, fast, no new dependencies, reaches every measured problem | needs a genre table and tuning | **recommended** |
| B | A neural harmoniser (MelodyT5, AccoMontage2, AutoHarmonizer) chooses the chords | learned, genre-aware progressions | licences of weights/data unclear, unmaintained code, one more model to load, weak on modern genres | later study only |
| C | Anticipatory Music Transformer writes the Ins fills | musical fills learned from MIDI | GPU, Lakh MIDI copyright caveat, polyphonic output to reduce | later study only |
| D | Let the LLM write the notes of lines | flexible | study A1: raw ABC valid in 3 of 60 | rejected |
| E | Ask the LLM to count syllables itself | simple | LLMs count badly (literature, A1 experience) | rejected - Plenio counts |
| F | Unbounded re-generation until all checks pass | highest fit | time, cost, can loop | rejected - bounded rounds plus deterministic fallback |

## 5. Implementation plan (after approval)

| Phase | Content | Effort (estimate) |
|---|---|---|
| 0 | `tools/studies/harmony_check.py` (the metrics of section 1, aggregates only) and a replay mode for study plans - the yardstick for every following step | 0.5 day |
| 1 | Harmony guard: key per section, genre table, whole-bar fit, DP repair, harmonic rhythm, *new accompaniment* without chords; Song Sheet harmony report; tests (unit, fuzz, replay limits) | 2-3 days |
| 2 | Lines: rests by default, per-note chords, vocal-aware repair, figure fixes, option *lines under the singing*; brief option and templates | 1-1.5 days |
| 3 | Lyrics: counter, JSON lyrics with schema, check node, unrolled repair in *Write Song*, last mile (if chosen); Song Sheet findings per line | 2-3 days |
| 4 | Songs: section mismatch → re-plan once → lyrics adapted to the form | 1 day |
| 5 | Re-ask of the arranger with feedback | 0.5 day |
| 6 | Studies: **A2** (lyrics fit with 5 local models: today vs JSON+hyphens vs +repair rounds; per-line deviation, rounds, time) and **E7** (renders: YuE2's plan / 0.4.5 / guard with fills / guard with lines under the singing; SheetSage2 adherence, key clarity; a blind listening pack for the owner) | 1 GPU day + listening |
| 7 | Optional: take selection by score adherence (3.6) | 1 day |

Docs, help pages, CHANGELOG and the tutorials' captions where screens change; a release after E7 confirms the default.

## 6. Decisions for the owner

| | Question | Recommendation |
|---|---|---|
| D1 | Instrument lines under the singing by default? | **No** - fills where the voice rests; *under the singing* as an experimental option |
| D2 | Covers on *new accompaniment*: may a creative mode add chords? | **No** - YuE2 re-harmonises as chosen |
| D3 | Lyrics still off after 2 repair rounds: adjust the melody's rhythm (melisma / repeated note) or only warn? | **Adjust**, reported, only by one or two syllables per line |
| D4 | Syllable counting: own rules (no dependency) or pyphen/CMUdict? | **Own rules** first; pyphen only if A2 shows the counter is the bottleneck |
| D5 | Neural harmonisers / accompaniment models | **Not now** - later as a study if the guard is not enough |

## Sources

- REFFLY: Melody-Constrained Lyrics Editing Model - https://aclanthology.org/2025.naacl-long.564.pdf
- Song Form-aware Full-Song Text-to-Lyrics Generation (Interspeech 2025) - https://www.isca-archive.org/interspeech_2025/chae25_interspeech.pdf
- Unsupervised Melody-to-Lyric Generation (ACL 2023) - https://aclanthology.org/2023.acl-long.513.pdf
- Towards Singable Lyrics Translation Using Large Language Models (EACL 2026 SRW) - https://aclanthology.org/2026.eacl-srw.42/
- MAVL / SylAVL-CoT (EMNLP 2025) - https://aclanthology.org/2025.emnlp-main.689.pdf
- Songs Across Borders (ACL 2023) - https://arxiv.org/pdf/2305.16816
- A Computational Evaluation Framework for Singable Lyric Translation (ISMIR 2023) - https://arxiv.org/pdf/2308.13715
- AccoMontage2 - https://arxiv.org/pdf/2209.00353, https://github.com/billyblu2000/AccoMontage2
- MelodyT5 - https://arxiv.org/abs/2407.02277, https://github.com/sanderwood/melodyt5
- AutoHarmonizer - https://github.com/sander-wood/autoharmonizer
- Anticipatory Music Transformer - https://arxiv.org/abs/2306.08620, https://crfm.stanford.edu/2023/06/16/anticipatory-music-transformer.html
- Chordonomicon - https://arxiv.org/abs/2410.22046
- Key finding (Temperley) - https://music.informatics.indiana.edu/courses/I546/pdf/temperley.pdf
- Sensory dissonance (Sethares) - https://sethares.engr.wisc.edu/paperspdf/ttss.pdf
- pyphen - https://pyphen.org/; CMU Pronouncing Dictionary - https://en.wikipedia.org/wiki/CMU_Pronouncing_Dictionary
- YuE2 covers (upstream) - https://raw.githubusercontent.com/multimodal-art-projection/YuE/main/docs/covers.md
