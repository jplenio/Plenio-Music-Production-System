# Plenio user guide

- [Getting started](getting-started.md) - install, first run, choosing a template, how templates are laid out, the two ways to work (a new song every run, or one song with review stops)
- [Models and downloads](models.md) - which files each template needs, where they go, alternatives for smaller GPUs
- [Configuration](configuration.md) - offline mode, downloads, worker limits, Local LLM folders and servers
- [Licensing](licensing.md) - what the model licences mean for your songs
- [Troubleshooting](troubleshooting.md) - common messages and what to do
- [1 · YuE2 · Song](paths/yue2-song.md) - new songs with YuE2, the Song Sheet, takes, instrumentals
- [2 · YuE2 · Cover](paths/yue2-cover.md) - covers of a recording: original lyrics, new lyrics or instrumental
- [3 · MiniMax · Song](paths/minimax-song.md) - new songs with MiniMax Music 3: structured caption, exact 5 000-token budget
- [4 · Enhance & Master](paths/enhance-master.md) - EQ, loudness and dynamics, FLAC/MP3/WAV with tags and cover for any recording
- [5 · YuE2 · DAW](paths/yue2-daw.md) - compose the score yourself: two voices, chord symbols and the Guide track

Concepts:

- [Song Sheet](concepts/song-sheet.md) - which text and score reach the model, edits, conflicts, review
- [Brief templates](concepts/brief-templates.md) - what a template fills, the explicit actions, writing your own lyrics
- [Refine (48 kHz)](concepts/refine.md) - the super-resolution stage: engines, settings, licence, limits
- [Stems](concepts/stems.md) - split a song into vocals, drums, bass, other; the residual rule, the mixer, the buses
- [Score editor](concepts/score-editor.md) - correcting a score note by note, sections, playback and A/B
- [Instrumental](concepts/instrumental.md) - what Plenio guarantees for instrumentals and what it checks
- [Mastering and audio formats](concepts/mastering.md) - metering, EQ, dynamics, resampling, export formats and their limits
- [App mode](concepts/app-mode.md) - the templates as simple forms, with the mode and the Song Sheet buttons
- [Local LLMs](concepts/local-llm.md) - GGUF files from models/LLM and the models of LM Studio, Ollama, llama.cpp ... as the song writer or anywhere else
- [Creative modes](concepts/creative-modes.md) - no arrangement (*off*) or planned arrangements (standard, varied, fantasy, sterile, many instruments, dramatic), the closeness sliders, which writer model
