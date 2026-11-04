# Tags, variables and lyrics subtitles

Export Release writes the song's files; since 1.0.0 its tags and file names take **variables**, and it writes
the lyrics as **subtitles** next to the song.

## Tags

Choose *tags* in Export Release (the song templates do): artist, album, date, track, genre, comment, album
artist, composer and **lyrics**. FLAC and MP3 carry them all (the lyrics as FLAC's `LYRICS` comment and MP3's
`USLT` frame, which foobar2000, MusicBee, Poweramp and others show); WAV keeps only a few and no lyrics.

Every tag field takes typed text with variables, or a **connected text**: drag a link from any text output
onto the field - a field output of the Song Brief, a writer's answer, a *String* node. The connected text
wins over the typed one.

## Variables

| Group | Variables |
|---|---|
| song | `{title}`, `{lyrics}`, `{style}`, `{artwork_prompt}`, `{duration}`, `{bpm}`, `{score_key}` |
| brief | `{description}`, `{template}`, `{mode}`, `{genre}`, `{mood}`, `{tempo}`, `{length}`, `{vocals}`, `{language}`, `{voice}`, `{theme}`, `{melody}`, `{lead_instrument}`, `{key}`, `{meter}`, `{arrangement}`, `{genre_closeness}`, `{lines_under_singing}`, `{creativity}`; a cover's `{harmony}`, `{song_flow_closeness}`, `{lyrics_closeness}` |
| run | `{date}`, `{year}`, `{time}`, `{seed}` (= `{take_seed}`), `{draft_seed}`, `{arrangement_seed}` |
| models | `{model}`, `{writer}` |
| Plenio | `{plenio_version}` |
| tags | `{artist}`, `{album}`, `{album_artist}`, `{composer}`, `{track}` |

- `{genre}` - the value. The brief's fields come through Export Release's **brief** input (connected in the
  templates); a field left empty in the brief gives the template's value.
- `[ ... ]` - the text inside appears only when every variable in it has a value: `[Mood: {mood} · ]`
  vanishes when the mood is empty. Brackets without a variable inside stay text (`[Live]`).
- `{{` and `}}` - literal braces.

Examples:

| Field | Typed | Written |
|---|---|---|
| comment | `[Genre: {genre} · ][Mood: {mood} · ][Language: {language} · ]Powered by Plenio …` (the templates') | `Genre: indie pop · Language: English · Powered by Plenio …` |
| album | `{genre} Sessions {year}` | `indie pop Sessions 2026` |
| file name | `{artist} - {title}` | `The Band - Harbour Lights.flac` |
| file name | `{genre}/{date} {title}` | a folder per genre |

A name that is no variable (`{genr}`) stops the run **when you press Run** - before anything renders - and
the message lists the names. In connected text an unknown name stays as written (generated text may contain
braces) and the export's summary notes it. The *Tags & variables* note beside Export Release in every
template lists the variables, too.

## Lyrics subtitles

*lyrics subtitles (SRT)* (on by default) writes three files next to the song:

- `<name> (lines).srt` - one subtitle per lyrics line, shown from where its first word is sung until its last
  word ends;
- `<name> (notes).srt` - the same lines **painted on note by note**: a new subtitle at every syllable (YuE2,
  on its note) or word (MiniMax), showing the line up to what is being sung - `Hal`, `Halle`, `Hallelu`,
  `Hallelujah`;
- `<name> (sung).srt` - **what the take really sings**, as heard: a music model does not always sing its
  lyrics (it repeats a line, makes one up, leaves one out). The lines follow the lyrics wherever the take sings
  them - their line breaks, and their spelling where the same word was heard -, and the words the lyrics do
  not have make lines of their own. For a video of the song as it sounds, this is the file to use.

The release record keeps both - the lyrics' times, and what was sung with its times and its text with the
lyrics' section tags - together with how far the take follows its lyrics: the share of their words that were
heard, the words heard that they do not have, the lines not heard. The export's summary says it per take
(*86 % of the lyrics' words sung as written, 12 words the lyrics do not have*) and names a section not sung as
written; the [Plenio Player](player.md#written-and-sung-lyrics) follows either version.

**What was heard stays as heard.** The lyrics as sung are what the ASR heard - a word it misheard stands there
as it was heard; nothing corrects them after the export. Misheard words are corrected only where the lyrics
themselves come from an ASR: a cover's original lyrics, before the render
([Fix Misheard Words](../paths/yue2-cover.md#misheard-words)).

**How the times are measured.** The lyrics ASR listens to the exported song. *lyrics heard on* (an option of
Export Release) chooses the **vocal stem** (the default) or *the song* (quicker): Export Release then separates
the take's vocals first (BS-RoFormer, the model of Stems and Sung Pitch - about 25 seconds for three to four minutes
on a free GPU, longer while it is busy), so the music does not pull words into the instrumental parts. Measured on 20
songs against the vocals' own onsets and silence: words timed where nobody sings 2.5 % -> 0.3 %, words within
0.3 s of a sung onset 86.7 % -> 88.8 %. Without the separation model the song is heard, and the summary says so. **Qwen3-ASR
1.7B** hears the words and **Qwen3-ForcedAligner 0.6B** places every word on the audio (Apache-2.0, 4.1 + 1.8 GB, downloaded on
first use; its results are cached). It hears the song in pieces of at most 20 seconds, cut at quiet moments,
each with a second and a half of its neighbours (a word heard by both at a cut is kept once): over a whole song
with its music the aligner loses its place - in 1.1.0, when it heard a song in one piece, lines could come up
to a minute early. Measured on 15 YuE2 songs against faster-whisper, an independent timing: 94 % of the words
within 3 seconds of Whisper's, 72 % of the word starts within 0.15 s of where the separated vocals set in. Its
words are matched to the final lyrics - Chinese and Japanese character by character -; with a score (YuE2),
the score is fitted to the heard words and every syllable takes its note's time - the heard time wins where
the two disagree. A YuE2 render is shifted against its score (1.7 s in the median song), so the score's own
times are not used. For a language the aligner does not know (it times English, German, French, Spanish, Italian,
Portuguese, Russian, Chinese, Cantonese, Japanese and Korean) **faster-whisper large-v3** (MIT, 3.1 GB) takes
over and the export's summary says so; its word times start early and are corrected - measured on 48 YuE2
songs against the aligner: half the words within 0.16 s, 82 % within 0.5 s, 92 % within 1 s.

- **Without lyrics** (*Enhance & Master*): the subtitles are the words as heard, a line per phrase; the
  sentences an ASR is known to invent into music are left out, and without singing there are none.
- **Instrumentals**: no subtitles.
- **A line nobody sang** (the render left it out) is placed between its neighbours when there is room,
  otherwise left out; the summary names it.
- **Offline without the model**, or when the ASR fails: the export goes on without subtitles and says why.

The files use no styling tags: SRT markup is read differently by players, YouTube and video editors, so the
files work everywhere. Into DaVinci Resolve: *File > Import > Subtitle…*, then drag the subtitle track onto
the timeline at the song's start; YouTube: *Subtitles > Upload file > With timing*.
