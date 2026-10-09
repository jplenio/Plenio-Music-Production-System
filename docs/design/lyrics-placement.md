# Lyrics placement: where YuE2 sings the words (2026-10-09)

| | |
|---|---|
| Question | Owner, 2026-10-09: in the sheet music of a well rendered YuE2 song the lyrics "are spread wildly and do not match what is sung on which notes" - make the lyrics stand at the notes they are sung on, as well as it can be done |
| Code | `plenio.core.score.lyric_layout` (the layout of the piano roll's lyrics lane, the notation's `w:` lines, MusicXML and Export Release's sheet music), `plenio.core.song_form` (Match Song Form), the score editor's lyrics lane (`frontend/src/sheet-editor/score/lyricPlacement.ts`, `PianoRoll.vue`, `ScoreTab.vue`) |
| Inputs | the owner's release records and takes, read only: 79 YuE2 renders in English and German (two random samples of 26 and 53 usable songs, covers included), about 11,600 words; only aggregates are reported here |

## What YuE2 does

YuE2 gets the lyrics with their section tags and the score, and sings the words itself - nothing in the prompt says which syllable goes on which note. To see where it sings them, every render was transcribed (faster-whisper large-v3 on the CPU) and the heard words were placed on the audio once more with Qwen3-ForcedAligner-0.6B: Whisper's word times are contiguous (87 % of the words start exactly where the one before ends), so the first word of a line took the rest before it. The heard words were matched to the lyrics (Needleman-Wunsch on words), a linear time warp mapped the render onto the score (fitted on the distance of the word starts to the nearest Vocal onset: 0.1 s in the median song), and every matched word got the Vocal note sung at its start.

What the renders show:

- **YuE2 sings the lines in their order over the Vocal melody, about one syllable per note** (median 1.00 notes per syllable from one line start to the next; a quarter of the lines have 1.2 or more, a melisma or a rest inside).
- **A block starts where a section starts** in most songs - often on a **pickup** up to a bar before it - but YuE2 sings on whatever the sections are called: two blocks in one section (the plan wrote the chorus and the outro as one chorus section), a second verse in a section the plan called bridge, the verse starting on the last note of an intro.
- **A new line starts after a rest of an eighth** about as often as after a longer rest: 47 % of the line starts follow a rest of a quarter or more, 18 % one of an eighth (6.9 times as often as other notes), 35 % no rest - mostly after a long note.
- Notes no line sings: an intro's two or three notes are often ad-libs ("ooh"), and the end of a section after its block is sung without words or not at all. Lyrics the plan has no notes for (an outro after the last chorus) are seldom heard.

## The old layout and why it failed

Until 0.5.0 a lyrics block belonged to a labelled section: **by order when the score had as many labelled sections as the lyrics have blocks**, by tag otherwise, and the block's lines took only that section's notes. An instrumental intro and one extra block - or a planner that merged two blocks - shifted every block by a section. Match Song Form made it worse in the owner's song: the plan's intro held only the verse's pickup, counted as a sung section, so the plan was "renamed" to the lyrics' three sections (intro -> verse, verse -> chorus, chorus -> outro) and every block of the layout landed one section late; half of the words found no note at all.

## The layout now

The lines flow over the whole Vocal line in their order (a dynamic program over lines and notes):

| Cost | Value | |
|---|---|---|
| a syllable more than its line has notes (several on a note) | 1.0 | `CROWD_COST` |
| a note more than its line has syllables (held) | 0.4 | `HOLD_COST` |
| a line that starts inside a phrase (phrases split at rests of an eighth; a section start counts as a phrase start) | 1.5 | `MID_PHRASE_COST` |
| every phrase a line runs on into | 0.5 | `CROSS_COST` |
| a block whose first line does not start where a section starts or on its pickup | 2.0 | `BLOCK_INSIDE_COST` |
| a block that starts where a section of another kind starts | 0.5 | `OTHER_KIND_COST` |
| a note no line sings, in a section of a kind the lyrics have no block for / elsewhere | 0.05 / 0.6 | `FREE_NOTE_COST`, `LEFT_NOTE_COST` |
| a line no note sings while notes are left | 6.0 | `UNSUNG_LINE_COST` |
| a line after the last note, of a block the score has no section of its kind left for | 1.5 | `LATE_LINE_COST` |

Inside a line nothing changed: a syllable per note, a line over two phrases breaks at a word (after a comma where it can), a short phrase lets neighbouring syllables share a note, German is split by the German rules. The layout gives a **part** per block: its lines and the stretch of the score from its first line to the next part; a block no note sings gets the next free section of its kind, so the lyrics lane can give it words. Lines no note sings follow the music as text, as before.

Lines placed by hand in the lyrics lane are kept as `[start, end, block, line]`: the line stands on its span, the other lines flow between the lines placed by hand. Spans kept by 0.4.4 and 0.4.5 (`[start, end]`) still place their section's lines by the old rule; the first edit in the lane keeps them with their lines.

## Results

Words sung at the note the layout puts them on (the warp's note at the word's start):

| | sample 1 (26 songs, 4,041 words) | sample 2 (53 songs, 7,539 words) |
|---|---|---|
| within a beat - old layout | 56 % | 57 % |
| within a beat - **flow layout** | **73 %** | **71 %** |
| on the very note - old / flow | 36 % / 48 % | 32 % / 42 % |
| line starts within a beat - old / flow | 52 % / 65 % | 52 % / 64 % |

The costs were chosen on sample 1 and checked on sample 2, which no choice had seen; a cost halved or doubled changes the results by about a point at most. In the owner's song of the report: 5 % of the words within a beat before, 86 % now. The layout takes 9 ms per song in the median (84 ms at most, 496 notes).

Words still off are mostly where the render leaves the score: lines YuE2 starts a phrase early or late, renders that drift against the score by a bar, and words the speech recognition mismatched (repeated choruses).

## Match Song Form

Two changes from the same evidence (`plenio.core.song_form`):

- A section whose only Vocal notes lead into the next one (a **pickup**, starting after the downbeat of the section's last bar) is not sung. 90 sections of the owner's plans are such pickups (47 intros, 39 interludes): counted as sung, the intro was left out of an assembled score or every name of a renamed plan was shifted, and the sections check warned for nothing.
- A section of the plan may **sing the blocks after its own** up to the next section's kind, when it has notes for their syllables (0.8 per syllable): the planner wrote one melody for a chorus and an outro. Such a plan matches - no section is renamed, repeated or substituted.

On the owner's 200 sung songs with YuE2's plan the plan itself now matches the lyrics in 52 % (the old count: 27 %), and Match Song Form makes 96 % fit (93 %).
