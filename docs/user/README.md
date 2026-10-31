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
- [Continue a song](concepts/continue-a-song.md) - open a song's release record again: its workflow, its documents kept, new takes or edits from there
- [Brief templates](concepts/brief-templates.md) - what a template fills, the explicit actions, writing your own lyrics
- [Audio HQ](concepts/audio-hq.md) - stereo cleanup, regenerated highs and de-reverb before the EQ, in every template's Master block; presets that follow the genre
- [Refine (48 kHz)](concepts/refine.md) - the super-resolution node of the library: engines, settings, licence, limits
- [Stems](concepts/stems.md) - split a song into vocals, drums, bass, other; the residual rule, the mixer, the buses
- [Score editor](concepts/score-editor.md) - correcting a score note by note, sections, playback and A/B
- [Instrumental](concepts/instrumental.md) - what Plenio guarantees for instrumentals and what it checks
- [Mastering and audio formats](concepts/mastering.md) - metering, EQ, dynamics, resampling, export formats and their limits
- [App mode](concepts/app-mode.md) - the templates as simple forms, with the mode and the Song Sheet buttons
- [Local LLMs](concepts/local-llm.md) - GGUF files from models/LLM and the models of LM Studio, Ollama, llama.cpp ... as the song writer or anywhere else
- [Seeds](concepts/seeds.md) - one switch per seed: 🔒 keep a part (the draft, the take), 🎲 renew it every run
- [Tags, variables and lyrics subtitles](concepts/tags-and-subtitles.md) - tags filled from the brief (`{genre}`, `{mood}` ...), file names, the lyrics as SRT timed by listening
- [Plenio Player](concepts/player.md) - listen to your songs: one click from ComfyUI or a double click without it; search, a page per song, lyrics and sheet music following the music, playlists, Winamp-style visuals; settings kept; a song back into ComfyUI
- [The Song API](concepts/song-api.md) - make songs from other programs: one HTTP request with a template's fields, the job followed to its record; the fields follow the template
- [Lyrics fidelity](concepts/lyrics-fidelity.md) - one take, or the best of two or three: a further take only while the best so far sang less than 96 % of its lyrics as written (takes longer)
- [Creativity](concepts/creativity.md) - one slider from steady to adventurous (0-200; 50 as before the slider, 100 the default): the writer's rules and temperature, YuE2's plan and takes
- [Creative modes](concepts/creative-modes.md) - no arrangement (*off*) or planned arrangements (standard, varied, fantasy, sterile, many instruments, dramatic), the closeness sliders, which writer model
- [LoRAs for YuE2](concepts/loras.md) - up to four LoRAs on YuE2's plan or sound, ComfyUI's and the original layout, what does not fit left out; where LoRAs come from, and training
