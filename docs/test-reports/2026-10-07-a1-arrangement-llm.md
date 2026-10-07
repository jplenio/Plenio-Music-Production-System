# Study A1 - local LLMs as arrangers: raw ABC, a JSON section plan, a motif in note names (2026-10-07)

| | |
|---|---|
| Question | Owner, 2026-10-07: how well can language models be told the ABC syntax for a changed section plan - and would another notation, converted to ABC by a script, give better results? |
| Code | `plenio.core.arrangement` (creative modes, ADR-0011), `plenio.core.llm` (schema, answer cache), `tools/studies/arrangement_llm.py` |
| Machine | owner's RTX 5060 Ti 16 GB; llama-server of Unsloth Studio; thinking off, temperature 0.7, context 8192, seeds 1 and 2 |
| Scores | six real YuE2 scores read from the owner's release records (read only): two sung songs, two instrumentals, two covers; 3-8 sections, 42-83 bars |
| Data | `data/2026-10-07-a1-arrangement-llm.json` (counts and means only; no scores, lyrics or answers) |
| Level | V3 (real models, every answer checked by Plenio's parsers); no listening verdict yet (study E7) |

## 1. The tasks

| Task | The writer is asked for | Valid when |
|---|---|---|
| **abc** | the instrument line (YuE2's *Ins* voice) of the longest section with chords, directly in ABC: the meter, *L*, the bar length in units and the chords per bar are given | Plenio's canonical parser and YuE2's parser read it, the bar count is right and every bar has exactly its length (the study interleaves the voices in YuE2's groups of up to four bars for the model) |
| **plan** | the arrangement prompt of a creative mode (*standard* or *varied*, closeness 60): a JSON section plan, answered freely | Plenio reads the plan and `arrange` returns a score that passes every check (*applied*, *partial* or *unchanged*) |
| **plan + schema** | the same, held to the plan's JSON schema by llama.cpp (constrained decoding) | the same |
| **motif** | a one- or two-bar figure in note names with lengths (`{"note": "E4", "beats": 1}`) for that section | Plenio can read the figure; it writes the notes itself, so the ABC is valid by construction |

12 answers per model and task (six scores, two seeds).

## 2. Notation: ABC written by the model against note names converted by Plenio

| Model | abc: valid | abc: parses | motif: readable | motif: one or two whole bars | motif: strong-beat notes in the chord (before Plenio's snapping) |
|---|---|---|---|---|---|
| Gemma 4 E2B (Q4_K_XL) | 0/12 | 2/12 | 12/12 | 11/12 | 63 % |
| Gemma 4 E4B (Q4_K_M) | 0/12 | 0/12 | 12/12 | 4/12 | 41 % |
| Qwen 3.5 9B (Q4_K_M) | 0/12 | 2/12 | 12/12 | 6/12 | 83 % |
| Gemma 4 12B QAT (Q4_0) | 0/12 | 0/12 | 12/12 | 8/12 | 75 % |
| Qwen 3.8 27B (IQ3_XXS) | 3/12 | 3/12 | 12/12 | 12/12 | 75 % |

- **Raw ABC is not usable** with local models: 3 valid sections in 60 answers, all from the 27 B model (and only 64 % of their strong-beat notes were chord notes). The typical faults were bars of the wrong length (counting units of *L*), missing or extra bars, chord symbols and headers in the line, and octave marks that put the line far outside an instrument's range. This matches the literature (most open models below 50 % renderable ABC; bar durations the weak point of 7 B models).
- **Note names are read every time.** The figure's length does not always fill whole bars and a quarter to a half of the strong-beat notes missed the chord - so Plenio's motif conversion restarts the figure on every downbeat and moves strong-beat notes onto the nearest chord note (the notes between keep the writer's line). Both are guaranteed now, not measured.

**Answer to the owner's question:** yes - another notation, converted by a script, improves the quality decisively. Plenio takes it to the end: the writer chooses *what* happens per section (a JSON plan, motifs in note names), Plenio writes every note.

## 3. The section plan

Final run with the shipped prompt, schema and reader (12 plans per model and way, 66 sections each):

| Model | | usable | valid JSON as written | sections with new chords | their bars kept (the chord clashed with the melody) | sections with a new instrument line | s per plan |
|---|---|---|---|---|---|---|---|
| Gemma 4 E2B | free | 12/12 | 12/12 | 66/66 | 19 % | 38/66 | 4.2 |
|  | schema | 12/12 | 12/12 | 66/66 | 19 % | 39/66 | 3.9 |
| Gemma 4 E4B | free | 12/12 | 7/12 | 34/66 | 29 % | 41/66 | 3.6 |
|  | schema | 12/12 | 12/12 | 36/66 | 21 % | 41/66 | 4.2 |
| Qwen 3.5 9B | free | 12/12 | 12/12 | 18/66 | 26 % | 33/66 | 5.6 |
|  | schema | 12/12 | 12/12 | 16/66 | 18 % | 31/66 | 4.8 |
| Gemma 4 12B QAT | free | 12/12 | 10/12 | 17/66 | 50 % | 35/66 | 7.5 |
|  | schema | 12/12 | 12/12 | 26/66 | 43 % | 33/66 | 8.1 |
| Qwen 3.8 27B | free | 12/12 | 12/12 | 9/66 | 31 % | 33/66 | 11.3 |
|  | schema | 12/12 | 12/12 | 9/66 | 31 % | 33/66 | 9.8 |

- **Every plan was usable** - 120 of 120, free and held to the schema. Where the written JSON was broken (Gemma 4 E4B 5 of 12, Gemma 4 12B 2 of 12 free answers) the reader repaired it (section 4); no plan fell back to YuE2's score. With the schema every answer was valid JSON as written.
- **The models differ in how much they change**, not in whether it works: Gemma 4 E2B gives every section new chords, Qwen 3.8 27B 9 of 66; all of them give about half the sections a new instrument line, and most plans are *partial* - some planned parts are kept out by Plenio's checks (a chord that clashes, a key lift the voice cannot sing).
- **A fifth to a half of the proposed chord bars clashed** with the melody on a strong beat and kept the planned chord - and that does not shrink with the model's size (Gemma 4 12B clashed most). The check in *Apply Arrangement* is what keeps the harmony right, not the size of the writer.
- The schema costs nothing: the same or a little less time per plan.

## 4. What the reader repairs

The free answers had these faults; the reader repairs them and reports every repair in the arrangement's notes:

| Fault | Seen with | Repair |
|---|---|---|
| the last `}` (sometimes `]}`) missing | Gemma 4 E4B: 5-7 of 12 free answers in every run | the JSON is closed after the last complete value |
| a chord list without brackets (`"chords": "F", "G", "Am", "lead": ...`) | Gemma 4 12B: 1-2 of 12 free answers | the list is put in brackets |
| chords as one text (`"D#m \| Bmaj7 \| G#m"`, `"Fm - Fm - Bb"`) | Gemma 4 E2B, E4B | split at spaces, commas, bars and dashes |
| `F major`, `Bb maj7` | native Gemma 4 E4B in S-9 | the word joins its chord |
| one chord per bar for sections longer than 8 bars | all models | up to 32 chords per section (one per bar) |
| roles in the writer's own words (`line`, `melody`, `counter`) | Gemma 4 E2B, E4B | read as `keep`, `keep`, `countermelody` |
| code fences, thoughts, smart quotes, Python quotes | - | removed or replaced |

The reader evolved during the study: run 1 (first reader, chord lists of up to 8, a schema that allowed only the text `keep`) found the missing brace - Gemma 4 E4B's free plans were usable in 5 of 12 - and that **the schema made every model keep all chords** (0 of 66 sections with new chords for four of the five models): the models write chords as one text, and the schema allowed only `keep` as text. The schema now allows chord texts too, each chord held to the names YuE2 reads, and the prompt shows the chord endings on C (*C, Cm, Csus2 ...*) instead of naming "(major)", which Gemma had copied as a word. Section 3 is the final run with the shipped prompt, schema and reader.

## 5. On the GPU in ComfyUI (S-9)

`tests/host/test_arrangement_models.py`: YuE2 plans a score from fixed documents, *Arrange* plans the sections with a real writer, *Apply Arrangement* writes the plan, *Song Sheet · Score* accepts the result.

| Writer | Time | Result (final code) |
|---|---|---|
| ComfyUI's Generate Text with Gemma 4 E4B (fp8, answering freely) | 62 s incl. YuE2's plan and the render | *applied*: new chords in all three sections, pad, countermelody and riff lines; a planned key lift stayed out (the voice would have left its range); YuE2 rendered exactly the arranged score, and the release record holds the arrangement |
| Local LLM with Qwen 3.5 9B (GGUF, held to the schema) | 10 s | *applied*: pad, arpeggio and riff lines; the same key lift stayed out |

The first S-9 run (before the final prompt) found the last two reader repairs: *F major* written as two words, and a planned chord equal to YuE2's reported as a clash.

## 6. Recommendations (in the workflow, the guide and the help pages)

- **Minimum:** an instruction-tuned model of about 2 B parameters plans usable arrangements; the plan never breaks the score. The default writer (Gemma 4 E4B) is enough.
- **Format:** a GGUF file, an LM Studio or an Ollama model (Local LLM) is held to the plan's format exactly; ComfyUI's native writer answers freely and is read leniently (in this study with the same result).
- **Character:** small Gemma models re-harmonise boldly (every section), the Qwen models change less; a larger model did not clash less with the melody. Choose by taste; Plenio's checks keep the harmony right either way.
- Raw ABC from the writer is not offered.

## 7. Limits

- Six scores and two seeds per model: the counts show orders of magnitude, not fine differences between the models.
- Musical quality is measured only as the fit of chords and strong-beat notes to the melody; whether arranged songs *sound* better than YuE2's own plans is the listening study E7.
- One quantization per model (the sizes a 16 GB card runs next to nothing else); thinking was off, as with the schema it has to be.
