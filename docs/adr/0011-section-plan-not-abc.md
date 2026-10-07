# ADR-0011: Creative modes - the writer plans, Plenio writes the notes

- Status: accepted
- Date: 2026-10-07
- Builds on: ADR-0003, ADR-0010; design note `docs/design/yue2-section-detail.md`

## Context

The owner wants, besides the simple generation (the music model plans everything), detailed generation in creative modes (standard, fantasy, sterile, varied, many instruments ...) that also changes YuE2's section plan, with a genre-closeness slider for songs and closeness sliders for covers (lyrics and song flow, 0 = a hint of the original, 100 = the original). The changed score must always be valid; a result that cannot be used must fall back to the original plan, visibly. The owner asked how well language models handle ABC, and suggested letting them use another notation that a script converts - if that improves the quality.

Literature (2023-2025): GPT-4 produces parseable ABC in about 95 % of cases, GPT-3.5 in 65 %; most open models stay below 50 % renderable, and 7 B models fail at bar durations; multi-voice ABC loses bar alignment. Constrained decoding with a JSON schema (llama.cpp, LM Studio, Ollama, vLLM) guarantees the format; a strict format can cost some reasoning.

Study A1 (`docs/test-reports/2026-10-07-a1-arrangement-llm.md`, five local models from 2 B to 27 B on six real YuE2 scores): raw ABC for one section's instrument line was valid in 0 of 48 answers of the models up to 12 B and in 3 of 12 of Qwen 3.8 27B; a JSON section plan was usable in every answer held to its schema and - after the reader closes a missing last brace - also free; a motif in note names was readable in 60 of 60 answers.

## Decision

- **The writer never writes notation.** It answers a small JSON plan per section: chords (one per bar, symbols YuE2 reads, or *keep*), the *lead* role of the instrument line (`keep`, `none`, `pad`, `arpeggio`, `riff`, `countermelody`, `solo`, `octave`, `motif`), energy 1-5, a key shift, and for *motif* a figure in note names with lengths. Plenio writes every note with the validated score operations (`plenio.core.arrangement`, pure core) - the owner's "other notation, converted by a script", taken to the end.
- **Creative modes are Markdown files** (`resources/arrangement/*.md`, the user's in `user/plenio/arrangement`): the allowed roles, key shift and tempo ranges, chord colours, writer hints (added to the writing prompt) and arranger rules (added to the arrangement prompt). `simple` is built in and changes nothing.
- **Closeness narrows the mode**: songs - genre closeness (key, tempo, how strictly chords must hold the melody); covers - song flow closeness (from "chords, key and tempo stay" to "only a hint"; at 95 and above nothing is planned and no writer is asked) and lyrics closeness (new lyrics, writing prompt only). The melody and the form always stay; an instrument line that carries the melody is never replaced.
- **Two nodes and a block**: *Compose Arrangement* (prompt + JSON schema), *Apply Arrangement* (plan -> score, report; its `answer` input is lazy, so the simple mode never reaches the writer), the blueprint *Plenio · Arrange* with the same writer routing as *Write Song*. Local LLM takes the schema (constrained decoding; an app that refuses it is asked once more without).
- **Checks and fallback**: every step is validated; the result must pass YuE2's parser, read back unchanged, open in the score editor and fit YuE2's context (instrument lines are dropped first). Otherwise the score stays as it was, with the reason - shown in *Song Sheet · Score* (new lazy `arrangement` input), its findings and the release record.
- **One writer model per template**: a top-level *Writer model* node (Writer Choice, new `model` output) feeds *Write Song* and *Arrange*; App mode shows it with the creative mode, the sliders and the arrangement seed.
- **Same request, no second call** (owner's point 3): Local LLM keeps answers on disk (`user/plenio/cache/llm`, key = model identity incl. file size and date, prompt, system prompt, seed, every setting, schema). ComfyUI re-runs nodes whose ancestors changed even when their input values did not; the cache answers such repeats without asking the model.
- New brief inputs are appended and optional, so saved workflows and API prompts of older versions run as before (*simple*).

## Consequences

- 23 nodes; one more blueprint; the templates *1 · YuE2 · Song* and *2 · YuE2 · Cover* get *Arrange*, all song templates the *Writer model* node.
- A creative mode makes the writing prompt different from *simple*: changing the mode drafts the text again (and needs a new approval in *one song, stop to review*). The arrangement seed varies only the plan.
- The section plan guides YuE2; the audio is still YuE2's. The style words decide most of the instrumentation, which is why the modes have writer hints.
- The native writer (Generate Text) has no constrained decoding; the lenient reader (fences, thoughts, a missing last brace, Python quotes, chord and role aliases) makes its plans usable, and every repair is reported.
