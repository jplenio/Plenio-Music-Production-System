# Song API: the fields of each template

*Made by `tools/api_docs.py` from the shipped templates and the node definitions of ComfyUI 0.41.0 - do not edit by hand.* A running ComfyUI tells its own, current list: `GET /plenio/api/v1/templates/{id}`. The guide: [README.md](README.md).

Every field you leave out keeps the template's value (the *Default*). A field with *Only when* applies only while that field has one of those values; given otherwise, it is left out with a warning.

## `yue2-song` - 1 · YuE2 · Song

Kind: **song** · seeds: `draft`, `plan`, `arrangement`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `score`, `artwork_prompt`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new song every run" | `new song every run`, `one song, stop to review` |  | new song every run: each run writes and renders another song from this brief (the batch count next to Run makes a series). one song, stop to review: the Song Sheets stop for checking; later runs render new takes. |
| `template` | choice | "pop/singer-songwriter-acoustic-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (240 in all) |  | Optional starting point. Text fields you leave empty are taken from the template. |
| `description` | text |  |  |  | What the song is about and how it should sound. Sent to the writing model. |
| `genre` | string |  |  |  | Genre and sub-genre, e.g. 'indie pop'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, hopeful'. |
| `tempo` | string |  |  |  | Tempo, e.g. '88 BPM' or 'midtempo'. |
| `length` | choice | "short (about 1:30)" | `very short (about 1:00)`, `short (about 1:30)`, `about 2:00`, `about 2:30`, `standard (about 3:00)`, `about 3:30`, `about 4:00`, `long (about 4:30)`, `about 5:00`, `very long (about 6:00)` |  | Target length. Guides the writing and, without a score, the render ceiling. |
| `vocals` | choice | "sung" | `sung`, `sparse vocals`, `instrumental` |  | sung: a song with lyrics. sparse vocals: mostly instrumental, the voice sings only a few short phrases (a hook, a call, wordless sounds like 'ooh'). instrumental: no singing; hides all vocal settings. |
| `language` | string |  |  | `vocals` is `sung`, `sparse vocals` | Language of the lyrics, e.g. 'English'. |
| `voice` | string |  |  | `vocals` is `sung`, `sparse vocals` | Vocal character, e.g. 'warm female voice'. |
| `theme` | string |  |  | `vocals` is `sung`, `sparse vocals` | What the lyrics are about. |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | Whether an instrument carries a lead melody or the song is accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'saxophone'. |
| `key` | string |  |  |  | Optional key, e.g. 'G major'. Music models that use a score take the key from the score; the DAW template's empty score is built in it. |
| `meter` | string |  |  |  | Optional meter, e.g. '3/4' or '6/8'. Music models that use a score take the meter from the score; the DAW template's empty score is built in it. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the music model plans the music by itself. A creative mode (experimental) lets the writer plan chords, lines and energy per section; the line under the brief says what the chosen mode does. |
| `genre_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the song stays to its genre - 100 strictly typical, 70 typical with personal touches, 40 free within the genre, 0 any style. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 50 | 0.0 … 100.0 |  | 0 steady ... 25 balanced (1.4's 50) ... 50 experimental (the default, 1.4's 100) ... 100 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "gemma4_e4b_it_fp8_scaled.safetensors" | `(choose a model)` |  | A bare file name: a text model in models/text_encoders (ComfyUI's Generate Text). 'models/LLM · …', '… files · …', 'HF cache · …': a GGUF file. 'LM Studio · …', 'Ollama · …': a running app's model. |

### `release`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `folder` | string | "plenio" |  |  | Sub-folder of the ComfyUI output folder. |
| `naming` | string | "{date} {title}" |  |  | File name: {title}, {date}, {seed}, {genre}, {artist} ... (the variables of the tags); '/' makes sub-folders; [optional {parts}] vanish when empty. |
| `collision` | choice | "number" | `number`, `overwrite`, `error` |  | When the file exists: number (add ' (2)' - also to a title another song of the folder has), overwrite, or stop with an error. |
| `flac` | boolean | true |  |  | FLAC 24-bit (lossless). |
| `mp3` | boolean | false |  |  | MP3 VBR V0 (LAME). |
| `wav` | boolean | false |  |  | WAV 32-bit float (no clipping; few tags, no cover). |
| `tags` | choice | "tags" | `title only`, `tags`, `copy from loaded file` |  | Metadata written into the files: the title only, tags typed or connected (with {variables}), or the tags of the loaded file. |
| `artist` | string |  |  | `tags` is `tags` | The artist tag. Text with {variables}, or connect a text output to the field. |
| `album` | string |  |  | `tags` is `tags` | The album tag. Text with {variables}, or connect a text output to the field. |
| `date` | string | "{date}" |  | `tags` is `tags` | Year or date, e.g. 2026 or {date}. Text with {variables}, or connect a text output to the field. |
| `track` | string |  |  | `tags` is `tags` | Track number, e.g. 3 or 3/12. Text with {variables}, or connect a text output to the field. |
| `genre` | string | "{genre}" |  | `tags` is `tags` | The genre tag, e.g. {genre} (the brief's). Text with {variables}, or connect a text output to the field. |
| `comment` | string | "[Genre: {genre} · ][Mood: {mood} · ][Language: {language} · ]Powered by Plenio Music Production System / ComfyUI" |  | `tags` is `tags` | The comment tag; empty: none. Text with {variables}, or connect a text output to the field. |
| `album_artist` | string |  |  | `tags` is `tags` | The album artist tag. Text with {variables}, or connect a text output to the field. |
| `composer` | string |  |  | `tags` is `tags` | The composer tag. Text with {variables}, or connect a text output to the field. |
| `lyrics` | string | "{lyrics}" |  | `tags` is `tags` | The lyrics tag (FLAC, MP3; players show it), e.g. {lyrics}. Text with {variables}, or connect a text output to the field. |
| `sheet_music` | choice | "PDF (A4)" | `off`, `PDF (A4)`, `PDF (Letter)` |  | Also save the sheet music (both voices, chords, sections, the lyrics under the notes) as '<name>.pdf' on A4 or Letter pages; an open ComfyUI page draws it after the export. Needs a score (YuE2). |
| `sheet_music_size` | choice | "standard" | `standard`, `smaller`, `compact`, `large` |  | How large the sheet music draws: standard about 3 bars a line, smaller 3-4, compact about 4, large 1-2 (the biggest notes). |
| `project_in_flac` | boolean | true |  |  | Store the release record (workflow, Song Sheets, seeds, settings) inside the song's FLAC: File > Continue a Plenio song... opens the song from the FLAC alone. Off for files you share without their making-of. |
| `lyrics_srt` | boolean | true |  |  | Write the lyrics as subtitles: '(lines).srt' whole lines, '(notes).srt' note by note, '(sung).srt' what the take really sings. Timed by listening (Qwen3-ASR and its aligner, 5.9 GB, fetched on first use). |
| `lyrics_timing` | choice | "the song" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the song (quicker) or the take's vocal stem - more exact times, but the separation takes extra time: half a minute per take, more while the GPU is busy. |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |

## `yue2-cover` - 2 · YuE2 · Cover

Kind: **cover** · seeds: `arrangement`, `draft`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `score`, `artwork_prompt` · needs: `source.audio`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new cover every run" | `new cover every run`, `one cover, stop to review` |  | new cover every run (default): each run writes and renders another version, without stops. one cover, stop to review: the Song Sheets stop so you can check the transcription and the lyrics; later runs render new takes. |
| `template` | choice | "pop/dance-pop-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (240 in all) |  | Optional target style. Style fields you leave empty are taken from the template. |
| `description` | text |  |  |  | How the cover should sound - instruments, feel, production. Sent to the writing model; a genre or a description is needed. |
| `genre` | string |  |  |  | Target genre, e.g. 'acoustic folk'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, intimate'. |
| `vocals` | choice | "original lyrics" | `instrumental`, `original lyrics`, `new lyrics` |  | original lyrics: the source's words, transcribed. new lyrics: new words on the source's melody. instrumental: an instrument plays the vocal melody, or accompaniment only. |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | An instrument plays the vocal melody, or accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'piano'. |
| `language` | string |  |  | `vocals` is `original lyrics`, `new lyrics` | Language of the source's lyrics; 'auto' detects it from the singing. |
| `voice` | string |  |  | `vocals` is `original lyrics`, `new lyrics` | Vocal character, e.g. 'soft female voice'. |
| `theme` | string |  |  | `vocals` is `new lyrics` | What the new lyrics are about, e.g. 'leaving home'. |
| `phrasing_reference` | boolean | false |  | `vocals` is `new lyrics` | Show the writer the source's transcribed lyrics as a phrasing reference (runs the lyrics ASR). |
| `harmony` | choice | "keep original chords" | `new accompaniment`, `keep original chords` |  | new accompaniment: the source's chords are removed and YuE2 re-harmonises (melody mode). keep original chords: the chords stay (full mode; the 2 · YuE2 · Cover template starts with it). |
| `title` | string |  |  |  | Optional fixed title, e.g. 'Original Title (Jazz Cover)'. Empty: the source recording's title with '-cover' when 'source' is connected; else the writer proposes one. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the transcribed score stays as it is. A creative mode (experimental) re-arranges the sections within the song flow closeness; the line under the brief says what the chosen mode does. |
| `song_flow_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the cover stays to the original - 100 exactly, 80 chords and key stay, 50 recognisable, 20 a free version, 0 only a hint. The form always stays. |
| `lyrics_closeness` | integer | 0 | 0.0 … 100.0 |  | New lyrics only (experimental): how close they stay to the source's lyrics - 0 without its text (default), 30 its theme, 60 its story, 90-100 its meaning line by line. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 50 | 0.0 … 100.0 |  | 0 steady ... 25 balanced (1.4's 50) ... 50 experimental (the default, 1.4's 100) ... 100 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `original_notes` | integer | 100 | 0.0 … 100.0 |  | How many of the source's notes YuE2 gets: 100 every note of melody, instrument line and chords. Less leaves out the least important (nothing new is added), so YuE2 interprets more freely; 0 keeps about a quarter. |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "gemma4_e4b_it_fp8_scaled.safetensors" | `(choose a model)` |  | A bare file name: a text model in models/text_encoders (ComfyUI's Generate Text). 'models/LLM · …', '… files · …', 'HF cache · …': a GGUF file. 'LM Studio · …', 'Ollama · …': a running app's model. |
| `source.audio` **required** | upload |  |  |  | A recording in ComfyUI's input folder: upload it with POST /uploads?name=<file> and give the answer's name here. |
| `excerpt.start_index` | number | 0.0 | -1.8446744073709552e+19 … 1.8446744073709552e+19 |  | Start time in seconds, can be negative to count from the end (supports sub-seconds). |
| `excerpt.duration` | number | 120.0 | 0.0 … |  | Duration in seconds |
| `excerpt.enabled` | boolean | false |  |  | Whether the optional node 'Excerpt (optional)' runs (bypassed when off). |

### `release`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `folder` | string | "plenio" |  |  | Sub-folder of the ComfyUI output folder. |
| `naming` | string | "{date} {title}" |  |  | File name: {title}, {date}, {seed}, {genre}, {artist} ... (the variables of the tags); '/' makes sub-folders; [optional {parts}] vanish when empty. |
| `collision` | choice | "number" | `number`, `overwrite`, `error` |  | When the file exists: number (add ' (2)' - also to a title another song of the folder has), overwrite, or stop with an error. |
| `flac` | boolean | true |  |  | FLAC 24-bit (lossless). |
| `mp3` | boolean | false |  |  | MP3 VBR V0 (LAME). |
| `wav` | boolean | false |  |  | WAV 32-bit float (no clipping; few tags, no cover). |
| `tags` | choice | "tags" | `title only`, `tags`, `copy from loaded file` |  | Metadata written into the files: the title only, tags typed or connected (with {variables}), or the tags of the loaded file. |
| `artist` | string |  |  | `tags` is `tags` | The artist tag. Text with {variables}, or connect a text output to the field. |
| `album` | string |  |  | `tags` is `tags` | The album tag. Text with {variables}, or connect a text output to the field. |
| `date` | string | "{date}" |  | `tags` is `tags` | Year or date, e.g. 2026 or {date}. Text with {variables}, or connect a text output to the field. |
| `track` | string |  |  | `tags` is `tags` | Track number, e.g. 3 or 3/12. Text with {variables}, or connect a text output to the field. |
| `genre` | string | "{genre}" |  | `tags` is `tags` | The genre tag, e.g. {genre} (the brief's). Text with {variables}, or connect a text output to the field. |
| `comment` | string | "[Genre: {genre} · ][Mood: {mood} · ][Language: {language} · ]Powered by Plenio Music Production System / ComfyUI" |  | `tags` is `tags` | The comment tag; empty: none. Text with {variables}, or connect a text output to the field. |
| `album_artist` | string |  |  | `tags` is `tags` | The album artist tag. Text with {variables}, or connect a text output to the field. |
| `composer` | string |  |  | `tags` is `tags` | The composer tag. Text with {variables}, or connect a text output to the field. |
| `lyrics` | string | "{lyrics}" |  | `tags` is `tags` | The lyrics tag (FLAC, MP3; players show it), e.g. {lyrics}. Text with {variables}, or connect a text output to the field. |
| `sheet_music` | choice | "PDF (A4)" | `off`, `PDF (A4)`, `PDF (Letter)` |  | Also save the sheet music (both voices, chords, sections, the lyrics under the notes) as '<name>.pdf' on A4 or Letter pages; an open ComfyUI page draws it after the export. Needs a score (YuE2). |
| `sheet_music_size` | choice | "standard" | `standard`, `smaller`, `compact`, `large` |  | How large the sheet music draws: standard about 3 bars a line, smaller 3-4, compact about 4, large 1-2 (the biggest notes). |
| `project_in_flac` | boolean | true |  |  | Store the release record (workflow, Song Sheets, seeds, settings) inside the song's FLAC: File > Continue a Plenio song... opens the song from the FLAC alone. Off for files you share without their making-of. |
| `lyrics_srt` | boolean | true |  |  | Write the lyrics as subtitles: '(lines).srt' whole lines, '(notes).srt' note by note, '(sung).srt' what the take really sings. Timed by listening (Qwen3-ASR and its aligner, 5.9 GB, fetched on first use). |
| `lyrics_timing` | choice | "the song" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the song (quicker) or the take's vocal stem - more exact times, but the separation takes extra time: half a minute per take, more while the GPU is busy. |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |
