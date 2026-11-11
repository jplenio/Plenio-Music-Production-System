# Song API v2: the fields of each template

*Made by `tools/api_docs.py` from the shipped templates and the node definitions of ComfyUI 0.41.0 - do not edit by hand.* A running ComfyUI tells its own, current list: `GET /plenio/api/v2/templates/{id}`. The guide: [README.md](README.md).

Every field you leave out keeps the template's value (the *Default*). A field with *Only when* applies only while that field has one of those values; given otherwise, it is left out with a warning.

## `yue2-song` - 1 · YuE2 · Song

Kind: **song** · seeds: `draft`, `plan`, `arrangement`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `score`, `artwork_prompt`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new song every run" | `new song every run`, `one song, stop to review` |  | new song every run: each run writes and renders another song from this brief (the batch count next to Run makes a series). one song, stop to review: the Song Sheets stop for checking; later runs render new takes. |
| `template` | choice | "pop/singer-songwriter-acoustic-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (251 in all) |  | Optional starting point. Text fields you leave empty are taken from the template. |
| `description` | text | "Honest acoustic singer-songwriter song: fingerpicked or gently strummed acoustic guitar, subtle piano, upright bass and brushed drums entering late, plus a close, unpolished vocal with audible breath. Conversational verses, one quietly devastating refrain, minimal production and lots of space." |  |  | How the song should sound - its character, instruments and arrangement (the lyrics have a field of their own). Sent to the writing model. |
| `genre` | string | "singer-songwriter" |  |  | Genre and sub-genre, e.g. 'indie pop'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, hopeful'. |
| `tempo` | string | "Laid-back (70-100 BPM)" |  |  | Tempo, e.g. '88 BPM' or 'midtempo'. |
| `length` | choice | "short (about 1:30)" | `very short (about 1:00)`, `short (about 1:30)`, `about 2:00`, `about 2:30`, `standard (about 3:00)`, `about 3:30`, `about 4:00`, `long (about 4:30)`, `about 5:00`, `very long (about 6:00)` |  | Target length. Guides the writing and, without a score, the render ceiling. |
| `vocals` | choice | "sung" | `sung`, `sparse vocals`, `instrumental` |  | sung: a song with lyrics. sparse vocals: mostly instrumental, the voice sings only a few short phrases (a hook, a call, wordless sounds like 'ooh'). instrumental: no singing; hides all vocal settings. |
| `language` | string | "English" |  | `vocals` is `sung`, `sparse vocals` | Language of the lyrics, e.g. 'English'. |
| `voice` | string | "whispered & intimate vocal" |  | `vocals` is `sung`, `sparse vocals` | Vocal character, e.g. 'warm female voice'. |
| `theme` | string | "self-discovery & growth" |  | `vocals` is `sung`, `sparse vocals` | What the lyrics are about, in a few words. |
| `lyrics_from` | choice | "written from the idea below" | `written from the idea below`, `my own, sung as written below` | `vocals` is `sung`, `sparse vocals` | written from the idea below: the writer writes the lyrics; the field says what they should be about (a template gives an idea). my own: the field holds your lyrics, sung exactly as written. |
| `lyrics` | text | "Plain-spoken and personal, about a conversation that never happened." |  | `vocals` is `sung`, `sparse vocals` | The idea for the lyrics - a story, an image, a message - or, with 'my own', the lyrics themselves: sections as [Verse], [Chorus] ... (without them Plenio adds them). |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | Whether an instrument carries a lead melody or the song is accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'saxophone'. |
| `key` | string |  |  |  | Optional key, e.g. 'G major'. Music models that use a score take the key from the score; the DAW template's empty score is built in it. |
| `meter` | string | "4/4" |  |  | Optional meter, e.g. '3/4' or '6/8'. Music models that use a score take the meter from the score; the DAW template's empty score is built in it. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the music model plans the music by itself. A creative mode (experimental) lets the writer plan chords, lines and energy per section; the line under the brief says what the chosen mode does. |
| `genre_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the song stays to its genre - 100 strictly typical, 70 typical with personal touches, 40 free within the genre, 0 any style. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 100 | 0.0 … 200.0 |  | 0 steady ... 50 the reference (as before the slider) ... 100 experimental (the default) ... 200 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "Gemma 4 12B (auto)" | `Gemma 4 12B (auto)` |  | Gemma 4 12B (auto): the one on this machine, else downloaded for its card. A bare file name: a text model for ComfyUI's Generate Text. '… · …': a GGUF file ('models/LLM', 'HF cache' ...) or a running app's model. |

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
| `lyrics_timing` | choice | "vocal stem" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the model of Stems and Sung Pitch, about half a minute per take - or the song (quicker). |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |

## `yue2-cover` - 2 · YuE2 · Cover

Kind: **cover** · seeds: `arrangement`, `draft`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `score`, `artwork_prompt` · needs: `source.audio`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new cover every run" | `new cover every run`, `one cover, stop to review` |  | new cover every run (default): each run writes and renders another version, without stops. one cover, stop to review: the Song Sheets stop so you can check the transcription and the lyrics; later runs render new takes. |
| `template` | choice | "pop/dance-pop-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (251 in all) |  | Optional target style. Style fields you leave empty are taken from the template. |
| `description` | text | "Modern dance-pop: four-on-the-floor kick, bright plucky synths, deep sidechained bass, claps, a tight pre-chorus build and an explosive chorus combining a sung hook with a post-chorus drop. Glossy radio production, huge and immediate." |  |  | How the cover should sound - instruments, feel, production. Sent to the writing model; a genre or a description is needed. |
| `genre` | string | "dance-pop" |  |  | Target genre, e.g. 'acoustic folk'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, intimate'. |
| `vocals` | choice | "original lyrics" | `instrumental`, `original lyrics`, `new lyrics` |  | original lyrics: the source's words, transcribed. new lyrics: new words on the source's melody. instrumental: an instrument plays the vocal melody, or accompaniment only. |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | An instrument plays the vocal melody, or accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'piano'. |
| `language` | string |  |  | `vocals` is `original lyrics`, `new lyrics` | Language of the source's lyrics; 'auto' detects it from the singing. |
| `voice` | string | "female vocal" |  | `vocals` is `original lyrics`, `new lyrics` | Vocal character, e.g. 'soft female voice'. |
| `theme` | string |  |  | `vocals` is `new lyrics` | What the new lyrics are about, e.g. 'leaving home'. |
| `phrasing_reference` | boolean | false |  | `vocals` is `new lyrics` | Show the writer the source's transcribed lyrics as a phrasing reference (runs the lyrics ASR). |
| `harmony` | choice | "keep original chords" | `new accompaniment`, `keep original chords` |  | new accompaniment: the source's chords are removed and YuE2 re-harmonises (melody mode). keep original chords: the chords stay (full mode; the 2 · YuE2 · Cover template starts with it). |
| `title` | string |  |  |  | Optional fixed title, e.g. 'Original Title (Jazz Cover)'. Empty: the source recording's title with '-cover' when 'source' is connected; else the writer proposes one. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the transcribed score stays as it is. A creative mode (experimental) re-arranges the sections within the song flow closeness; the line under the brief says what the chosen mode does. |
| `song_flow_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the cover stays to the original - 100 exactly, 80 chords and key stay, 50 recognisable, 20 a free version, 0 only a hint. The form always stays. |
| `lyrics_closeness` | integer | 0 | 0.0 … 100.0 |  | New lyrics only (experimental): how close they stay to the source's lyrics - 0 without its text (default), 30 its theme, 60 its story, 90-100 its meaning line by line. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 100 | 0.0 … 200.0 |  | 0 steady ... 50 the reference (as before the slider) ... 100 experimental (the default) ... 200 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `original_notes` | integer | 100 | 0.0 … 100.0 |  | How many of the source's notes YuE2 gets: 100 all. Less leaves out the least important of the instrument line and chords (an instrumental's melody too; a sung one keeps all), nothing new; 0 about a quarter. |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "Gemma 4 12B (auto)" | `Gemma 4 12B (auto)` |  | Gemma 4 12B (auto): the one on this machine, else downloaded for its card. A bare file name: a text model for ComfyUI's Generate Text. '… · …': a GGUF file ('models/LLM', 'HF cache' ...) or a running app's model. |
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
| `lyrics_timing` | choice | "vocal stem" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the model of Stems and Sung Pitch, about half a minute per take - or the song (quicker). |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |

## `minimax-song` - 3 · MiniMax · Song

Kind: **song** · seeds: `draft`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `artwork_prompt`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new song every run" | `new song every run`, `one song, stop to review` |  | new song every run: each run writes and renders another song from this brief (the batch count next to Run makes a series). one song, stop to review: the Song Sheets stop for checking; later runs render new takes. |
| `template` | choice | "pop/singer-songwriter-acoustic-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (251 in all) |  | Optional starting point. Text fields you leave empty are taken from the template. |
| `description` | text | "Honest acoustic singer-songwriter song: fingerpicked or gently strummed acoustic guitar, subtle piano, upright bass and brushed drums entering late, plus a close, unpolished vocal with audible breath. Conversational verses, one quietly devastating refrain, minimal production and lots of space." |  |  | How the song should sound - its character, instruments and arrangement (the lyrics have a field of their own). Sent to the writing model. |
| `genre` | string | "singer-songwriter" |  |  | Genre and sub-genre, e.g. 'indie pop'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, hopeful'. |
| `tempo` | string | "Laid-back (70-100 BPM)" |  |  | Tempo, e.g. '88 BPM' or 'midtempo'. |
| `length` | choice | "short (about 1:30)" | `very short (about 1:00)`, `short (about 1:30)`, `about 2:00`, `about 2:30`, `standard (about 3:00)`, `about 3:30`, `about 4:00`, `long (about 4:30)`, `about 5:00`, `very long (about 6:00)` |  | Target length. Guides the writing and, without a score, the render ceiling. |
| `vocals` | choice | "sung" | `sung`, `sparse vocals`, `instrumental` |  | sung: a song with lyrics. sparse vocals: mostly instrumental, the voice sings only a few short phrases (a hook, a call, wordless sounds like 'ooh'). instrumental: no singing; hides all vocal settings. |
| `language` | string | "English" |  | `vocals` is `sung`, `sparse vocals` | Language of the lyrics, e.g. 'English'. |
| `voice` | string | "whispered & intimate vocal" |  | `vocals` is `sung`, `sparse vocals` | Vocal character, e.g. 'warm female voice'. |
| `theme` | string | "self-discovery & growth" |  | `vocals` is `sung`, `sparse vocals` | What the lyrics are about, in a few words. |
| `lyrics_from` | choice | "written from the idea below" | `written from the idea below`, `my own, sung as written below` | `vocals` is `sung`, `sparse vocals` | written from the idea below: the writer writes the lyrics; the field says what they should be about (a template gives an idea). my own: the field holds your lyrics, sung exactly as written. |
| `lyrics` | text | "Plain-spoken and personal, about a conversation that never happened." |  | `vocals` is `sung`, `sparse vocals` | The idea for the lyrics - a story, an image, a message - or, with 'my own', the lyrics themselves: sections as [Verse], [Chorus] ... (without them Plenio adds them). |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | Whether an instrument carries a lead melody or the song is accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'saxophone'. |
| `key` | string |  |  |  | Optional key, e.g. 'G major'. Music models that use a score take the key from the score; the DAW template's empty score is built in it. |
| `meter` | string | "4/4" |  |  | Optional meter, e.g. '3/4' or '6/8'. Music models that use a score take the meter from the score; the DAW template's empty score is built in it. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the music model plans the music by itself. A creative mode (experimental) lets the writer plan chords, lines and energy per section; the line under the brief says what the chosen mode does. |
| `genre_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the song stays to its genre - 100 strictly typical, 70 typical with personal touches, 40 free within the genre, 0 any style. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 100 | 0.0 … 200.0 |  | 0 steady ... 50 the reference (as before the slider) ... 100 experimental (the default) ... 200 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "Gemma 4 12B (auto)" | `Gemma 4 12B (auto)` |  | Gemma 4 12B (auto): the one on this machine, else downloaded for its card. A bare file name: a text model for ComfyUI's Generate Text. '… · …': a GGUF file ('models/LLM', 'HF cache' ...) or a running app's model. |

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
| `sheet_music` | choice | "off" | `off`, `PDF (A4)`, `PDF (Letter)` |  | Also save the sheet music (both voices, chords, sections, the lyrics under the notes) as '<name>.pdf' on A4 or Letter pages; an open ComfyUI page draws it after the export. Needs a score (YuE2). |
| `sheet_music_size` | choice | "standard" | `standard`, `smaller`, `compact`, `large` |  | How large the sheet music draws: standard about 3 bars a line, smaller 3-4, compact about 4, large 1-2 (the biggest notes). |
| `project_in_flac` | boolean | true |  |  | Store the release record (workflow, Song Sheets, seeds, settings) inside the song's FLAC: File > Continue a Plenio song... opens the song from the FLAC alone. Off for files you share without their making-of. |
| `lyrics_srt` | boolean | true |  |  | Write the lyrics as subtitles: '(lines).srt' whole lines, '(notes).srt' note by note, '(sung).srt' what the take really sings. Timed by listening (Qwen3-ASR and its aligner, 5.9 GB, fetched on first use). |
| `lyrics_timing` | choice | "vocal stem" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the model of Stems and Sung Pitch, about half a minute per take - or the song (quicker). |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |

## `enhance-master` - 4 · Enhance & Master

Kind: **master** · seeds:  · documents: `lyrics` · needs: `source.audio`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `finish.hq_mastering` | boolean | true |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `source.audio` **required** | upload |  |  |  | A recording in ComfyUI's input folder: upload it with POST /uploads?name=<file> and give the answer's name here. |
| `h_q_stereo_cleanup.preset` | choice | "standard - pop, hip-hop, soul, world" | `auto - from the song's genre`, `standard - pop, hip-hop, soul, world`, `gentle - classical, jazz, folk`, `strong - rock, metal, punk`, `wide - electronic, dance, ambient`, `custom - the fields below` |  | auto: the profile that fits the song's genre (from the connected brief; standard without one). standard, gentle, strong and wide are the same four profiles in HQ 1, 2 and 3; custom shows the fields. |
| `h_q_stereo_cleanup.preset.side_highcut_hz` | number | 10500.0 | 4000.0 … 20000.0 | `h_q_stereo_cleanup.preset` is `custom - the fields below` | Above this the side signal is cut (Hz, zero-phase). |
| `h_q_stereo_cleanup.preset.side_cleanup` | number | 0.65 | 0.0 … 1.0 | `h_q_stereo_cleanup.preset` is `custom - the fields below` | 0 off ... 1 strongest: the high-cut's share and the cleanup of the side's diffuse highs. |
| `h_q_stereo_cleanup.preset.warmth` | number | 0.18 | 0.0 … 0.8 | `h_q_stereo_cleanup.preset` is `custom - the fields below` | 0 off ... 0.8: saturation above 400 Hz (2nd and 3rd harmonics). |
| `audio_model_loader.kind` | choice | "super-resolution" | `super-resolution`, `separation` |  | super-resolution: for HQ 2 · Regenerate Highs and Refine (48 kHz); separation: for Separate Stems. |
| `audio_model_loader.kind.model` | choice | "pytorch_model.bin" |  | `audio_model_loader.kind` is `super-resolution`, `separation` | A model file in models/audio_sr. |
| `h_q_regenerate_highs.preset` | choice | "standard - pop, hip-hop, soul, world" | `auto - from the song's genre`, `standard - pop, hip-hop, soul, world`, `gentle - classical, jazz, folk`, `strong - rock, metal, punk`, `wide - electronic, dance, ambient`, `custom - the fields below` |  | auto: the profile that fits the song's genre (from the connected brief; standard without one). standard, gentle, strong and wide are the same four profiles in HQ 1, 2 and 3; custom shows the fields. |
| `h_q_regenerate_highs.preset.from_hz` | number | 8200.0 | 4500.0 … 20000.0 | `h_q_regenerate_highs.preset` is `custom - the fields below` | New highs from (Hz): the crossover. The model sees the song up to its nearest input edge below it (UniverSR: 4, 6, 8 or 12 kHz). |
| `h_q_regenerate_highs.preset.new_share` | number | 0.85 | 0.0 … 1.0 | `h_q_regenerate_highs.preset` is `custom - the fields below` | Share of the new highs above the crossover; the rest stays the original's. |
| `h_q_regenerate_highs.preset.level_match` | number | 0.9 | 0.3 … 1.5 | `h_q_regenerate_highs.preset` is `custom - the fields below` | The new highs follow the original's level (40 ms envelope) times this. |
| `h_q_regenerate_highs.seed` | integer | 0 | 0.0 … 4294967295.0 |  | Seed of the model: the same seed gives the same highs. |
| `h_q_regenerate_highs.model_steps` | integer | 4 | 2.0 … 8.0 |  | UniverSR's flow steps: 4 (default) about 1.5 s per second of music on an RTX 5060 Ti, 3 about 1.1 s, 2 about 0.75 s - fewer steps, other and quieter highs. |
| `h_q_de_reverb.preset` | choice | "standard - pop, hip-hop, soul, world" | `auto - from the song's genre`, `standard - pop, hip-hop, soul, world`, `gentle - classical, jazz, folk`, `strong - rock, metal, punk`, `wide - electronic, dance, ambient`, `custom - the fields below` |  | auto: the profile that fits the song's genre (from the connected brief; standard without one). standard, gentle, strong and wide are the same four profiles in HQ 1, 2 and 3; custom shows the fields. |
| `h_q_de_reverb.preset.dereverb` | number | 0.45 | 0.0 … 1.0 | `h_q_de_reverb.preset` is `custom - the fields below` | 0 off ... 1: how much of the late, diffuse room above 600 Hz is taken out. |
| `h_q_de_reverb.preset.phase_lock` | number | 0.55 | 0.0 … 1.0 | `h_q_de_reverb.preset` is `custom - the fields below` | 0 off ... 1: how far the phase above 2 kHz follows its strong neighbours. |
| `h_q_de_reverb.enabled` | boolean | false |  |  | Whether the optional node 'HQ 3 · De-Reverb (optional)' runs (bypassed when off). |
| `e_q.mode` | choice | "match preset" | `flat`, `manual`, `match preset`, `custom match` |  | flat: no change; manual: your bands; match: a proposal fitted to the audio. |
| `e_q.mode.bands` | text | "{\"schema\": \"plenio.eq/1\", \"preamp_db\": 0.0, \"bands\": []}" |  | `e_q.mode` is `manual` | EQ bands (plenio.eq/1); edit them on the curve. |
| `e_q.mode.preset` | choice | "Warm - gentle (workflow default)" | `Warm - gentle (workflow default)`, `Warm - subtle mastering`, `Warm - rounded mix`, `Warm - upper-mid softening`, `Bright - subtle mastering`, `Bright - gentle clarity`, `Bright - open mix`, `Reference - subtle mastering`, `Reference - balanced`, `Reference - broad match` | `e_q.mode` is `match preset` | Tone match recipes (reference recipes need the reference input). |
| `e_q.mode.target` | choice | "warm" | `warm`, `bright`, `reference` | `e_q.mode` is `custom match` | warm / bright: a gentle tilt around 1 kHz; reference: the tone of the reference input. |
| `e_q.mode.strength` | number | 0.35 | 0.0 … 1.0 | `e_q.mode` is `custom match` | How far to move towards the target. |
| `e_q.mode.max_gain_db` | number | 2.0 | 0.1 … 6.0 | `e_q.mode` is `custom match` | Largest boost or cut of the curve. |
| `e_q.mode.max_bands` | integer | 4 | 1.0 … 6.0 | `e_q.mode` is `custom match` | Most peak bands the match may use. |
| `e_q.mode.min_hz` | number | 40.0 | 20.0 … 1000.0 | `e_q.mode` is `custom match` | Lowest frequency the match measures and may place a band at (Hz). |
| `e_q.mode.max_hz` | number | 16000.0 | 1000.0 … 20000.0 | `e_q.mode` is `custom match` | Highest frequency the match measures and may place a band at (Hz; at most 45 % of the sample rate). |
| `loudness.target` | choice | "streaming (-14 LUFS, -1 dBTP)" | `streaming (-14 LUFS, -1 dBTP)`, `Apple Music / podcasts (-16 LUFS, -1 dBTP)`, `dynamic (-18 LUFS, -1 dBTP)`, `broadcast EBU R128 (-23 LUFS, -1 dBTP)`, `loud (-9 LUFS, -0.5 dBTP)`, `custom` |  | Loudness target and true-peak ceiling. |
| `loudness.target.lufs` | number | -14.0 | -30.0 … -5.0 | `loudness.target` is `custom` | Integrated loudness (LUFS). |
| `loudness.target.ceiling_dbtp` | number | -1.0 | -12.0 … -0.1 | `loudness.target` is `custom` | True-peak ceiling (dBTP). |
| `loudness.compression` | choice | "Balanced - gentle glue" | `off`, `Balanced - gentle glue`, `Acoustic - gentle`, `Classical - preserve dynamics`, `Jazz - natural`, `Vocal pop - smooth`, `Pop - punchy`, `Rock - bus glue`, `Electronic - tight`, `Club - loud`, `Hip-hop - low-end punch`, `Ambient - spacious` … (14 in all) |  | off: limiter only; a style: gentle genre presets; custom: your settings. |
| `loudness.compression.threshold_db` | number | -18.0 | -60.0 … 0.0 | `loudness.compression` is `custom` | Level above which the compressor works (dB). |
| `loudness.compression.ratio` | number | 1.5 | 1.0 … 10.0 | `loudness.compression` is `custom` | Compression ratio above the threshold. |
| `loudness.compression.knee_db` | number | 6.0 | 0.0 … 24.0 | `loudness.compression` is `custom` | Width of the soft knee around the threshold (dB); 0 is a hard knee. |
| `loudness.compression.attack_ms` | number | 20.0 | 1.0 … 200.0 | `loudness.compression` is `custom` | How fast the compressor reacts (ms). |
| `loudness.compression.release_ms` | number | 150.0 | 10.0 … 2000.0 | `loudness.compression` is `custom` | How fast it lets go (ms). |
| `loudness.compression.sidechain_hz` | number | 80.0 | 0.0 … 500.0 | `loudness.compression` is `custom` | High-pass on what the compressor listens to (Hz), so the bass does not pump it; 0 is off. |
| `loudness.compression.detector` | choice | "RMS" | `RMS`, `Peak` | `loudness.compression` is `custom` | RMS follows the average level (smooth); Peak reacts to single peaks. |
| `loudness.sample_rate` | choice | "keep" | `keep`, `44100`, `48000` |  | Output sample rate (converted before limiting). |

### `release`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `folder` | string | "plenio/enhanced" |  |  | Sub-folder of the ComfyUI output folder. |
| `naming` | string | "{title}" |  |  | File name: {title}, {date}, {seed}, {genre}, {artist} ... (the variables of the tags); '/' makes sub-folders; [optional {parts}] vanish when empty. |
| `collision` | choice | "number" | `number`, `overwrite`, `error` |  | When the file exists: number (add ' (2)' - also to a title another song of the folder has), overwrite, or stop with an error. |
| `flac` | boolean | true |  |  | FLAC 24-bit (lossless). |
| `mp3` | boolean | true |  |  | MP3 VBR V0 (LAME). |
| `wav` | boolean | false |  |  | WAV 32-bit float (no clipping; few tags, no cover). |
| `tags` | choice | "copy from loaded file" | `title only`, `tags`, `copy from loaded file` |  | Metadata written into the files: the title only, tags typed or connected (with {variables}), or the tags of the loaded file. |
| `artist` | string |  |  | `tags` is `tags` | The artist tag. Text with {variables}, or connect a text output to the field. |
| `album` | string |  |  | `tags` is `tags` | The album tag. Text with {variables}, or connect a text output to the field. |
| `date` | string |  |  | `tags` is `tags` | Year or date, e.g. 2026 or {date}. Text with {variables}, or connect a text output to the field. |
| `track` | string |  |  | `tags` is `tags` | Track number, e.g. 3 or 3/12. Text with {variables}, or connect a text output to the field. |
| `genre` | string |  |  | `tags` is `tags` | The genre tag, e.g. {genre} (the brief's). Text with {variables}, or connect a text output to the field. |
| `comment` | string | "Powered by Plenio Music Production System / ComfyUI" |  | `tags` is `tags` | The comment tag; empty: none. Text with {variables}, or connect a text output to the field. |
| `album_artist` | string |  |  | `tags` is `tags` | The album artist tag. Text with {variables}, or connect a text output to the field. |
| `composer` | string |  |  | `tags` is `tags` | The composer tag. Text with {variables}, or connect a text output to the field. |
| `lyrics` | string |  |  | `tags` is `tags` | The lyrics tag (FLAC, MP3; players show it), e.g. {lyrics}. Text with {variables}, or connect a text output to the field. |
| `sheet_music` | choice | "off" | `off`, `PDF (A4)`, `PDF (Letter)` |  | Also save the sheet music (both voices, chords, sections, the lyrics under the notes) as '<name>.pdf' on A4 or Letter pages; an open ComfyUI page draws it after the export. Needs a score (YuE2). |
| `sheet_music_size` | choice | "standard" | `standard`, `smaller`, `compact`, `large` |  | How large the sheet music draws: standard about 3 bars a line, smaller 3-4, compact about 4, large 1-2 (the biggest notes). |
| `project_in_flac` | boolean | true |  |  | Store the release record (workflow, Song Sheets, seeds, settings) inside the song's FLAC: File > Continue a Plenio song... opens the song from the FLAC alone. Off for files you share without their making-of. |
| `lyrics_srt` | boolean | true |  |  | Write the lyrics as subtitles: '(lines).srt' whole lines, '(notes).srt' note by note, '(sung).srt' what the take really sings. Timed by listening (Qwen3-ASR and its aligner, 5.9 GB, fetched on first use). |
| `lyrics_timing` | choice | "vocal stem" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the model of Stems and Sung Pitch, about half a minute per take - or the song (quicker). |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |

## `yue2-daw` - 5 · YuE2 · DAW

Kind: **song** · seeds: `draft`, `take`, `cover` · documents: `title`, `style`, `lyrics`, `score`, `artwork_prompt`

### `fields`

| Field | Type | Default | Values | Only when | What it does |
|---|---|---|---|---|---|
| `mode` (fixed) | choice | "new song every run" | `new song every run`, `one song, stop to review` |  | new song every run: each run writes and renders another song from this brief (the batch count next to Run makes a series). one song, stop to review: the Song Sheets stop for checking; later runs render new takes. |
| `template` | choice | "pop/singer-songwriter-acoustic-vocal" | `none`, `african/afrobeat-classic-instrumental`, `african/afrobeats-vocal`, `african/amapiano-instrumental`, `african/desert-blues-vocal`, `african/ethio-jazz-instrumental`, `african/gqom-instrumental`, `african/highlife-instrumental`, `african/soukous-instrumental`, `alternative/alternative-rock-vocal`, `alternative/britpop-vocal`, `alternative/new-wave-vocal` … (251 in all) |  | Optional starting point. Text fields you leave empty are taken from the template. |
| `description` | text | "Honest acoustic singer-songwriter song: fingerpicked or gently strummed acoustic guitar, subtle piano, upright bass and brushed drums entering late, plus a close, unpolished vocal with audible breath. Conversational verses, one quietly devastating refrain, minimal production and lots of space." |  |  | How the song should sound - its character, instruments and arrangement (the lyrics have a field of their own). Sent to the writing model. |
| `genre` | string | "singer-songwriter" |  |  | Genre and sub-genre, e.g. 'indie pop'. |
| `mood` | string |  |  |  | Mood words, e.g. 'warm, hopeful'. |
| `tempo` | string | "Laid-back (70-100 BPM)" |  |  | Tempo, e.g. '88 BPM' or 'midtempo'. |
| `length` | choice | "short (about 1:30)" | `very short (about 1:00)`, `short (about 1:30)`, `about 2:00`, `about 2:30`, `standard (about 3:00)`, `about 3:30`, `about 4:00`, `long (about 4:30)`, `about 5:00`, `very long (about 6:00)` |  | Target length. Guides the writing and, without a score, the render ceiling. |
| `vocals` | choice | "sung" | `sung`, `sparse vocals`, `instrumental` |  | sung: a song with lyrics. sparse vocals: mostly instrumental, the voice sings only a few short phrases (a hook, a call, wordless sounds like 'ooh'). instrumental: no singing; hides all vocal settings. |
| `language` | string | "English" |  | `vocals` is `sung`, `sparse vocals` | Language of the lyrics, e.g. 'English'. |
| `voice` | string | "whispered & intimate vocal" |  | `vocals` is `sung`, `sparse vocals` | Vocal character, e.g. 'warm female voice'. |
| `theme` | string | "self-discovery & growth" |  | `vocals` is `sung`, `sparse vocals` | What the lyrics are about, in a few words. |
| `lyrics_from` | choice | "written from the idea below" | `written from the idea below`, `my own, sung as written below` | `vocals` is `sung`, `sparse vocals` | written from the idea below: the writer writes the lyrics; the field says what they should be about (a template gives an idea). my own: the field holds your lyrics, sung exactly as written. |
| `lyrics` | text | "Plain-spoken and personal, about a conversation that never happened." |  | `vocals` is `sung`, `sparse vocals` | The idea for the lyrics - a story, an image, a message - or, with 'my own', the lyrics themselves: sections as [Verse], [Chorus] ... (without them Plenio adds them). |
| `melody` | choice | "instrument plays the lead" | `instrument plays the lead`, `accompaniment only` | `vocals` is `instrumental` | Whether an instrument carries a lead melody or the song is accompaniment only. |
| `lead_instrument` | string |  |  | `vocals` is `instrumental` | Optional lead instrument, e.g. 'saxophone'. |
| `key` | string |  |  |  | Optional key, e.g. 'G major'. Music models that use a score take the key from the score; the DAW template's empty score is built in it. |
| `meter` | string | "4/4" |  |  | Optional meter, e.g. '3/4' or '6/8'. Music models that use a score take the meter from the score; the DAW template's empty score is built in it. |
| `arrangement` | choice | "off" | `off`, `standard`, `sterile`, `unplugged`, `varied`, `call and response`, `signature motif`, `hypnotic`, `breakdown`, `dramatic`, `many instruments`, `jazz colours` … (14 in all) |  | off (default): the music model plans the music by itself. A creative mode (experimental) lets the writer plan chords, lines and energy per section; the line under the brief says what the chosen mode does. |
| `genre_closeness` | integer | 70 | 0.0 … 100.0 |  | Creative modes only (experimental): how close the song stays to its genre - 100 strictly typical, 70 typical with personal touches, 40 free within the genre, 0 any style. |
| `lines_under_singing` | boolean | false |  |  | Creative modes only (experimental): off - the instrument line plays where the voice rests, as in YuE2's own scores; on - it also sounds under the singing, calm and below the voice. |
| `creativity` | integer | 100 | 0.0 … 200.0 |  | 0 steady ... 50 the reference (as before the slider) ... 100 experimental (the default) ... 200 adventurous: how much the writer and YuE2 dare. More surprises also means more misses - try a few seeds. |
| `lyrics_fidelity` | choice | "standard" | `standard`, `high - best of 2 takes`, `highest - best of 3 takes` |  | standard: one take. high: a second take when the first sang under 96 % of the words as written; the better is kept. highest: a third when neither reached 96 %. Takes longer (up to 2x or 3x). |
| `finish.hq_mastering` | boolean | false |  |  | Highest mastering quality: UniverSR (HQ 2) regenerates the highs - clearly fewer AI shimmer and artifacts, but the song takes about twice as long. Off (default; on in Enhance & Master): UniverSR is not needed. |
| `finish.cover_art` | boolean | true |  |  | Paints the cover from the artwork prompt the writer wrote (embedded in the files); off: no cover and no image model. |
| `writer.model` | choice | "Gemma 4 12B (auto)" | `Gemma 4 12B (auto)` |  | Gemma 4 12B (auto): the one on this machine, else downloaded for its card. A bare file name: a text model for ComfyUI's Generate Text. '… · …': a GGUF file ('models/LLM', 'HF cache' ...) or a running app's model. |

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
| `lyrics_timing` | choice | "vocal stem" | `the song`, `vocal stem` |  | What the lyrics ASR hears for the subtitles and the player: the take's vocal stem - more exact times, the model of Stems and Sung Pitch, about half a minute per take - or the song (quicker). |
| `song_page` | boolean | true |  |  | Also write '<name>.html': the song on one page to open in any browser - the lyrics with their sections and the prompts to copy, every setting, how it was made, the sound, the score and links to the files. |
