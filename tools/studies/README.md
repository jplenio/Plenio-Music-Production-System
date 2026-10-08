# Study scripts

Measurement tools for design gates (Phase 4A). They are **not product code**: nothing in `plenio/` imports them, and they may use ComfyUI internals that product code only reaches through `plenio.comfy.host`. Results are summarised in `docs/test-reports/`.

All scripts run with ComfyUI's Python and `PLENIO_COMFYUI_ROOT` set; GPU scripts must not run while another process holds most of the VRAM (free the dev server first: `POST /free {"unload_models": true, "free_memory": true}`).

| Script | Study | What it does |
|---|---|---|
| `sheetsage_timeline.py` | E1 | native SheetSage2 transcription (same path as `SheetSage2AudioToABC`, full mode) plus the decoded beat grid; drift of a constant-tempo reading; comparison with the plan in a release record |
| `sheetsage_chunks.py` | E3 | SheetSage2 peak memory per audio length (`--memory`), chunked re-transcription of takes longer than one native window for the vocal detector |
| `asr_whisper.py` | E2 | faster-whisper transcription with word timestamps; WER against a release record or `<stem>.lyrics.txt` |
| `alignment.py` | E2b | places ASR words into score sections (beat grid, constant tempo, phrase and pickup rules) and scores them against the lyric sheet; writes the automatic draft |
| `excerpt.py` | E5 | cuts an excerpt exactly like native `TrimAudioDuration` |
| `cover_budget.py` | Q-C6 | exact YuE2 context budget for transcribed scores (tokenizer only) |
| `render_matrix.py` | E3/E4/E5 | native YuE2 and Gemma jobs on a running isolated ComfyUI (`tools/dev_server.py --gpu`): instrumental conditions, cover modes, listen detector, Gemma ASR |
| `instrumental_form.py` | E6 | instrumental form and length on the Song path: planner-only lyrics forms x styles (plan length, sections, variety: pitches, chords, distinct bars), then render-lyrics and style variants with Check Vocals |
| `evaluate_takes.py` | E3/E5 | detector metrics, cover identity, sung-lyrics WER and ending check per rendered take |
| `listening_pack.py` | — | numbered copies of the takes plus a verdict sheet for the owner |
| `lyrics_fit_llm.py` | A2 | new cover lyrics with local LLMs (llama.cpp): the draft, Fit Lyrics' two repair rounds (held to the schema, or free as the native writer) and the last step - lines fitting, deviation, lines fixed, words kept |
| `arrangement_renders.py` | E7 | the plan, 0.4.5's arrangement, the guard with fills and under the singing rendered with YuE2 (`prepare`, `render`, `evaluate` with SheetSage2, `pack`: a blind listening pack) |
| `song_form.py` | G1 | the song form of the lyrics against YuE2's plan in release records (match, assemble, rename, differs; with the last resort), aggregates only |
| `export_summary.py` | — | compact results (no audio, no word lists) for `docs/test-reports/data/` |

Typical order: `dev_server.py --gpu` → `render_matrix.py` → free the server → `sheetsage_timeline.py` and `asr_whisper.py` on the takes → `evaluate_takes.py`.
