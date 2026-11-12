/**
 * The player's help (owner's request 2026-10-26: help in the player, and tutorials to watch as videos): short guides
 * by topic, searchable, and the narrated video tutorials on YouTube - played in the page only after a click (until
 * then nothing is loaded from YouTube), through youtube-nocookie.com.
 */

import { MEDIA, PLAYLISTS } from './media.generated'

export interface Tutorial {
  /** The video's key in resources/media.toml; ``id`` is the YouTube id it plays now (media.generated.ts). */
  key: string
  id: string
  number: string
  title: string
  text: string
  /** The topic it belongs to, for the guides that point to it. */
  topic: string
  /** ComfyUI or the player. */
  where: 'player' | 'comfyui' | 'intro'
}

export const PLAYLIST = `https://www.youtube.com/playlist?list=${PLAYLISTS.tutorials}`

const LISTED: Omit<Tutorial, 'id'>[] = [
  { key: 'tutorial-8-player', number: '8', title: 'The Plenio Player', text: 'Live lyrics, the full lyrics to copy, a page per song with its stars and how it was made, the notation following the music, the visuals with Plenio Nova, playlists, Live Play with the guests’ reactions, lyric videos and a player in one file to share.', topic: 'start', where: 'player' },
  { key: 'tutorial-9-party-songs', number: '9', title: 'Party songs', text: 'Make songs from the player: presets, takes, ComfyUI started the way you start it - and your guests ordering songs on their phones, who made which song at which party, their reactions kept.', topic: 'make', where: 'player' },
  { key: 'spot-your-party', number: '★', title: 'Your idea. Your song. Your party.', text: 'Plenio in 54 seconds: songs on autopilot, every note under your control, a player made for these songs - and the party that joins in from their phones.', topic: 'start', where: 'intro' },
  { key: 'spot-your-control', number: '★', title: 'Your idea. Your song. Your control.', text: 'The first spot, in 54 seconds: from the idea to the mastered song.', topic: 'start', where: 'intro' },
  { key: 'tutorial-0-system-check', number: '0', title: 'System Check', text: 'Is your ComfyUI ready? Versions, the GPU, which model files each template needs.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-1-yue2-song', number: '1', title: 'YuE2 · Song', text: 'From a brief to a finished song - and a tour of the score editor.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-2-yue2-cover', number: '2', title: 'YuE2 · Cover', text: 'A recording becomes a new version: transcribe, edit, sing it anew.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-3-minimax-song', number: '3', title: 'MiniMax · Song', text: 'Songs with MiniMax Music 3: the caption, the lyrics and the token budget.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-4-enhance-master', number: '4', title: 'Enhance & Master', text: 'Master any recording: Audio HQ, a tone match, -14 LUFS, the release export - and the lyrics of a sung recording corrected before the release.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-5-yue2-daw', number: '5', title: 'YuE2 · DAW', text: 'Compose it yourself - draw the notes, import MIDI or play it in - and YuE2 sings your melody.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-6-yue2-song-creative', number: '6', title: 'YuE2 · Song · Creative modes', text: 'The writer model plans the arrangement, Plenio writes the notes.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-7-yue2-cover-creative', number: '7', title: 'YuE2 · Cover · Creative modes', text: 'A recording re-arranged with new chords and lyrics that keep its story.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-10-song-api', number: '10', title: 'Song API', text: 'Songs from your own programs: one POST, the job followed with ?wait, the files, examples in Python, JavaScript and the shell.', topic: 'make', where: 'comfyui' },
  { key: 'tutorial-11-yue2-loras', number: '11', title: 'YuE2 LoRAs', text: 'Up to four LoRAs on YuE2, for the plan or the sound: the node, a LoRA chosen with its strength, an instrumental made with it and what the node says after the run.', topic: 'make', where: 'comfyui' },
]

/** The tutorials with the YouTube id each key plays now. */
export const TUTORIALS: Tutorial[] = LISTED.map((t) => ({ ...t, id: MEDIA[t.key] ?? '' }))

export interface HelpTopic {
  id: string
  title: string
  icon: string
  /** One line: what the topic is about. */
  lead: string
  /** Paragraphs and lists (a line starting with "- " is a list item; **bold** works). */
  body: string[]
  /** Where the full guide is. */
  more?: string
}

const DOCS = 'https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/player'

export const TOPICS: HelpTopic[] = [
  {
    id: 'start',
    title: 'First steps',
    icon: 'music',
    lead: 'Play a song, open its page, watch it in Now playing.',
    body: [
      '**▶ on a cover** plays the song; **a click on the card** opens its page - the lyrics with their times, the notation, the sheet music, every detail of how it was made, its other takes and songs alike.',
      '**Stars**: under a song\'s title, give it 0 to 5 stars by ear (a star\'s left half gives a half star). Until you do, the measured stars stand there faded - the lyrics sung as written, the harmony, the beat, what went wrong (*Details* lists each): a hint where to listen first.',
      '**The bar at the bottom** shows the song that plays. A click on its cover - on a phone, on the slim player - opens **Now playing**: the cover and the lyrics as they are sung (*Stage*), the lyrics large (*Lyrics*), the sheet music following the music (*Notation*) or only the visual (*Visual*).',
      'On a phone, **swipe** the slim player sideways for the next or the previous song, up for Now playing; in Now playing, swipe down to close it.',
      '**Put the player on your home screen**: in the browser\'s menu, *Add to Home screen* (Android) or *Share › Add to Home Screen* (iPhone, iPad) - it then opens like an app, on the whole screen.',
      'Everything you set - playlists, favourites, the visuals, the look of the lyrics - is kept by the player itself, on the computer it runs on.',
    ],
    more: `${DOCS}/README.md`,
  },
  {
    id: 'find',
    title: 'Find songs',
    icon: 'search',
    lead: 'Search, filters, tags, saved filters - also among thousands of songs.',
    body: [
      '**Search** looks through titles, lyrics, genres, moods, styles, briefs and your tags. Fields narrow it, and the search suggests them as you type:',
      '- `genre:jazz` `mood:warm` - the brief\'s genre and mood',
      '- `bpm:>110` `bpm:90-120` `key:Am` `meter:6/8` - from the score',
      '- `lang:german` `vocals:instrumental` `len:<3` `year:2026`',
      '- `is:fav` `is:unplayed` `is:cover` `has:pdf` `#party` - favourites, never played, covers, with sheet music, your tags',
      '- `"a phrase"` and `-word` - an exact phrase, a word left out',
      '**Filters**: a chip keeps only those songs, a right click (a long press on a phone) leaves them out; several chips of one row are alternatives. On a phone the filters open with **Filters** beside the search.',
      '**Tags of your own** on a song\'s page or for every song shown (*Tag…*); **Save this filter…** keeps a search under a name in the menu.',
      'The **letters at the side** of a long list jump to a letter (sorted by title) or a month (sorted by date).',
    ],
    more: `${DOCS}/listening.md#the-library`,
  },
  {
    id: 'playing',
    title: 'Now playing and the visuals',
    icon: 'sparkles',
    lead: 'Lyrics as they are sung, the notation, more than 70 visuals that move with the music.',
    body: [
      '**The lyrics light up word by word** as they are sung; a click on a line plays from there. **W** (or the *Lyrics* chip) switches between the lyrics as written and as the take really sings them. On a song’s page, *Full lyrics* shows them as text with their sections, to copy - and *The song’s page* has the lyrics, the prompts and every setting on one page.',
      '**The notation** follows the music - also through the instrumental parts; a click on a note jumps there.',
      '**Visuals** (✦ in Now playing, or **V**): classics like Winamp\'s, and *Plenio Drop* visuals like MilkDrop\'s. Click a visual\'s name there to see it at once. Choose how they are picked (*match the music*, random, cycle, fixed), when they change (every song, every section, every few seconds) and how (*Morph*, *Melt* …). **N** shows another one; **Shift+F** puts the visual on the whole screen.',
      '**How the lyrics look** (🎤): eleven fonts, eleven effects (*Glow*, *Bounce*, *Neon*, *On the beat* …), colour and size - also in videos.',
      '**A · master / B · original** plays the unmastered take in step; the speed changes without changing the pitch.',
    ],
    more: `${DOCS}/listening.md#now-playing`,
  },
  {
    id: 'party',
    title: 'Live Play and the party',
    icon: 'live',
    lead: 'A playlist that plays while you change it - with your guests on their phones.',
    body: [
      '**Live Play** (in the menu) plays a playlist you change while it plays: drag, play next, add songs. The songs made in ComfyUI - and the party songs - join it the moment they are ready: next, at the end or at random.',
      '**Show the visual** puts the party on the big screen, with the guests\' QR code over it.',
      '**Guests in your network**: switch on *Let guests see the live playlist* - they scan the QR code with their phones and see what plays and what comes next, send **reactions** (🔥 ❤️ 🎉 👏 💃 😂) that float up the edges of the big screen, and - when you let them - move, take out and add songs.',
      'Every song’s reactions are counted and kept - Live Play and the song’s page show them, apart from your favourite heart. In the guests’ settings: as many per song as they like, or one per song and guest (a tap on another changes it); *Reactions* switches them off.',
      '**Party songs**: guests make songs of their own on their phones - a style, a few words, *Generate Song* - when you allow it in *Settings › Party songs*; *Who made it* shows their name and the party’s date while their song plays. Only a guest’s song is a party song: yours are saved like songs made in ComfyUI.',
    ],
    more: `${DOCS}/party.md#live-play-make-songs-at-a-party-and-they-play`,
  },
  {
    id: 'make',
    title: 'Make songs from the player',
    icon: 'wand',
    lead: 'A style, a few words, Generate Song - no workflow to open.',
    body: [
      '**Make a song** (the wand) makes a song with YuE2 in the ComfyUI on this computer: pick a style - a vibe, a template or *Surprise me* -, say what it is about, and press **Generate Song**. A few minutes later it plays.',
      '**Presets** keep every setting under a name - the built-in ones (*Best quality*, *Party - fast*, *Quick sketch*, *Three takes* …) or your own (*Save as preset…*).',
      '**Takes**: make two to four takes of one song - the same words and notes, sung anew - and keep the one you like best (the song\'s page lists its takes).',
      '**Again, from any song**: *A new version…* on a song\'s page makes a new take of it, a new song like it or a cover of it.',
      '**The studio**: ComfyUI must run on this computer. When it does not, *Start the studio* starts it in the background - the way you last started it yourself, with your models folder (*Settings › The studio* shows how); the player itself needs no ComfyUI to play.',
      'In ComfyUI itself, the templates give you every control - the Song Sheet, the score editor, MIDI: the tutorials below show them.',
    ],
    more: `${DOCS}/making-songs.md#party-songs-guests-make-songs`,
  },
  {
    id: 'network',
    title: 'On phones, tablets and other computers',
    icon: 'qr',
    lead: 'The whole player on every device at home - with a link and a QR code.',
    body: [
      '**Settings › In your network** switches it on: a link and a QR code open the whole player on a phone, a tablet or another computer in your home network. The music plays on the device that opens it.',
      'Who is listening: each **user** (set up in *Settings › Accounts*) keeps their own playlists and favourites on every device; a **guest** keeps them in the browser.',
      '**ComfyUI** opens through the second link, and *Make a song* has the whole studio from there.',
      'Windows asks once whether Python may accept connections: allow it for private networks. Leave it off on networks you do not trust.',
    ],
    more: `${DOCS}/people.md#the-player-in-your-network`,
  },
  {
    id: 'share',
    title: 'Videos and shared players',
    icon: 'video',
    lead: 'A song as an MP4, your songs as one file that plays anywhere.',
    body: [
      '**Video…** on a song\'s page makes an MP4: Full HD, 4K, square or upright for Shorts, Reels and TikTok - the visuals planned over the song, the lyrics as subtitles, karaoke or word by word, the notation, the cover.',
      '**Share as a player…** packs the player and the songs you choose into one HTML file: anyone double-clicks it and listens - with the lyrics, the notation and the visuals, without installing anything.',
      'Both are made in the background: **In the making** in the menu shows how far they are.',
    ],
    more: `${DOCS}/videos.md#save-a-song-as-a-video`,
  },
  {
    id: 'trouble',
    title: 'When something does not work',
    icon: 'info',
    lead: 'No songs, no studio, no sound - what to check.',
    body: [
      '**No songs**: the player reads the release records Export Release writes (`.plenio.json`). *Settings › Songs* shows the folders it reads; *Look for new songs* reads them again.',
      '**The studio is not running**: start ComfyUI (or *Start the studio*); *Settings* shows which ComfyUI the player found. Songs ordered meanwhile wait.',
      '**"ComfyUI does not find the model file …"**: that ComfyUI runs without your models folder. Start ComfyUI once the way you usually do - the player then starts it the same way - or enter `--models-directory <your folder>` in *Settings › The studio*.',
      '**A video stops - "out of memory"**: close other tabs, or choose a smaller size or 30 frames a second; a failed video is tried once more by itself.',
      '**No sound on a phone**: tap ▶ once - browsers start sound only after a touch. Check the phone\'s silent switch.',
      '**The page looks old after an update**: reload it (Ctrl+F5 on a computer).',
      '**A song of a party guest never comes**: *Make a song › Everybody\'s* shows each song and why it stopped.',
    ],
    more: 'https://github.com/jplenio/Plenio-Music-Production-System/blob/main/docs/user/troubleshooting.md',
  },
]

/** The topics, and the lines of each, that hold every word of ``query`` (case and accents aside). */
export function searchHelp(query: string, topics: HelpTopic[] = TOPICS): HelpTopic[] {
  const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return topics
  return topics
    .map((topic) => {
      const head = fold(`${topic.title} ${topic.lead}`)
      if (words.every((w) => head.includes(w))) return topic
      const body = topic.body.filter((line) => words.every((w) => fold(line).includes(w)))
      return body.length ? { ...topic, body } : null
    })
    .filter((topic): topic is HelpTopic => topic !== null)
}

/** The tutorials, searched the same way. */
export function searchTutorials(query: string): Tutorial[] {
  const fold = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const words = fold(query).split(/\s+/).filter(Boolean)
  return TUTORIALS.filter((t) => words.every((w) => fold(`${t.title} ${t.text}`).includes(w)))
}

/** The address that plays a tutorial in the page: youtube-nocookie.com, starting at once (it is opened by a click). */
export const embedUrl = (id: string): string => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`
export const watchUrl = (id: string): string => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
