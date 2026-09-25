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
| `evaluate_takes.py` | E3/E5 | detector metrics, cover identity, sung-lyrics WER and ending check per rendered take |
| `listening_pack.py` | — | numbered copies of the takes plus a verdict sheet for the owner |
| `export_summary.py` | — | compact results (no audio, no word lists) for `docs/test-reports/data/` |

Typical order: `dev_server.py --gpu` → `render_matrix.py` → free the server → `sheetsage_timeline.py` and `asr_whisper.py` on the takes → `evaluate_takes.py`.
