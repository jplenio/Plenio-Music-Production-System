<script setup lang="ts">
/**
 * A song's page: its cover and facts, play and favourite, and tabs - the lyrics (each line a jump into the
 * song), the notation following the music, the sheet music PDF, every detail of how it was made, its other
 * takes and songs alike - and its files to download. Its stars (owner's request 2026-10-29): the listener's own,
 * given by ear, and the measured ones - faded, a pre-fill - with every measure in the details.
 */
import { computed, ref, watch } from 'vue'

import { api, media, songPage, type Quality, type SongDetail } from '../api'
import { engine } from '../engine'
import { lineIndex, sections } from '../now'
import {
  byId,
  current,
  go,
  isFavorite,
  library,
  openInComfyUI,
  playSongAt,
  playSongs,
  playing,
  removing,
  say,
  setRating,
  settings,
  songDetail,
  state,
  heard,
  toggleCurrent,
  toggleFavorite,
  videoFor,
} from '../store'
import { linesFor, sungOf, versionFor } from '../lyricsVersion'
import { madeFacts, songFacts } from '../songFacts'
import { cheerLine, cheers } from '../reactions'
import { formatTime, sectionName } from '../timing'
import { similarSongs, takesOf } from '../similar'
import { makeShown } from '../make/state'
import { isPhone } from '../layout'
import { canRemoveSongs } from '../account'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'
import Karaoke from './Karaoke.vue'
import LyricsVersionSwitch from './LyricsVersionSwitch.vue'
import Notation from './Notation.vue'
import SongCard from './SongCard.vue'
import SongMenu from './SongMenu.vue'
import Stars from './Stars.vue'
import TagEditor from './TagEditor.vue'
import { isPortable } from '../portable'

const props = defineProps<{ id: string }>()

type Tab = 'lyrics' | 'notation' | 'sheet' | 'details' | 'takes' | 'similar'
// the tab it opens on is kept with the other settings (on the player's server); a song without that tab
// (an instrumental has no lyrics) shows its first, and the setting stays for the next song
const tab = computed<Tab>({
  get: () => (tabs.value.some(([id]) => id === settings.songTab) ? settings.songTab : (tabs.value[0]?.[0] ?? 'details')) as Tab,
  set: (t) => (settings.songTab = t),
})
const opening = ref(false)
const detail = ref<SongDetail | null>(null)
const error = ref('')
const menu = ref<{ x: number; y: number } | null>(null)
const copied = ref('')
/** A long style shows two lines on a phone; a tap shows all of it. */
const styleOpen = ref(false)

const song = computed(() => byId.value.get(props.id) ?? null)
const isCurrent = computed(() => current.value?.id === props.id)
/** How well it came out, measured (asked of the player: the record's, else measured now). */
const quality = ref<Quality | null>(null)
const measuring = ref(false)
const myStars = computed(() => state.ratings?.[props.id] ?? null)
watch(
  () => props.id,
  async (id) => {
    quality.value = null
    if (isPortable) return
    measuring.value = true
    try {
      const answer = await api.quality(id)
      if (props.id === id) quality.value = answer.quality
    } catch {
      quality.value = null
    } finally {
      measuring.value = false
    }
  },
  { immediate: true }
)
function rate(value: number | null): void {
  setRating(props.id, value)
  say(value === null ? 'Your stars taken back' : `${value} of 5 - your stars`, 1800)
}
const songTime = computed(() => (isCurrent.value ? heard.value : -1))

watch(
  () => props.id,
  async (id) => {
    detail.value = null
    error.value = ''
    try {
      detail.value = await songDetail(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  },
  { immediate: true }
)

// The page of the song that plays follows the music: when the next song starts, it shows that one (the tab
// stays - on Lyrics, its live lyrics), in place of the last, so Back still leads where you came from.
watch(
  () => current.value?.id,
  (now, before) => {
    if (now && before && now !== before && props.id === before) go(`/song/${now}`, true)
  }
)

const takes = computed(() => (song.value ? takesOf(song.value, library.value) : []))
const similar = computed(() => (song.value ? similarSongs(song.value, library.value, 12) : []))
const plays = computed(() => state.plays[props.id] ?? 0)
const lastPlayed = computed(() => state.last_played[props.id]?.slice(0, 16).replace('T', ' ') ?? '')

const tabs = computed(() =>
  (
    [
      ['lyrics', 'Lyrics', !!(song.value?.lyrics || detail.value?.lines.length)],
      ['notation', 'Notation', !!detail.value?.notation.abc],
      ['sheet', 'Sheet music', !!song.value?.has.pdf],
      ['details', 'Details', true],
      ['takes', `Takes (${takes.value.length + 1})`, takes.value.length > 0],
      ['similar', 'Alike', similar.value.length > 0],
    ] as [Tab, string, boolean][]
  ).filter(([, , shown]) => shown)
)

const facts = computed(() => (song.value ? songFacts(song.value) : []))
const made = computed(() => (song.value && !song.value.other ? madeFacts(song.value) : []))
const partyCheers = computed(() => (song.value ? cheerLine(cheers[song.value.id]) : ''))
const loudness = computed(() => {
  const l = song.value?.loudness
  if (!l) return []
  return [
    ['Loudness', l.lufs !== null ? `${l.lufs.toFixed(1)} LUFS` : ''],
    ['True peak', l.true_peak !== null ? `${l.true_peak.toFixed(1)} dBTP` : ''],
    ['Loudness range', l.range !== null ? `${l.range.toFixed(1)} LU` : ''],
  ].filter(([, value]) => value) as [string, string][]
})
const seedNames: Record<string, string> = { take: 'Take seed', draft: 'Draft seed', arrangement: 'Arrangement seed' }
const downloads = computed(() => {
  const files = detail.value?.files ?? {}
  const names: [string, string][] = [
    ['audio', 'MP3'],
    ['audio_flac', 'FLAC'],
    ['audio_mp3', 'MP3'],
    ['audio_wav', 'WAV'],
    ['original', 'Unmastered take'],
    ['pdf', 'Sheet music (PDF)'],
    ['lines', 'Subtitles, lines (SRT)'],
    ['notes', 'Subtitles, on the notes (SRT)'],
    ['cover', 'Cover'],
    ['record', 'Plenio record (JSON)'],
  ]
  // the Plenio Player lists the files by format; a shared player has the MP3 (and the sheet music)
  return names
    .filter(([kind]) => files[kind] && (kind !== 'audio' || isPortable))
    .map(([kind, label]) => ({ kind, label, name: files[kind], url: media(props.id, kind) }))
})

async function toComfyUI(): Promise<void> {
  if (!song.value) return
  opening.value = true
  try {
    await openInComfyUI(song.value)
    say('The song opened in ComfyUI', 2600)
  } catch (error) {
    say(error instanceof Error ? error.message : String(error), 6000)
  } finally {
    opening.value = false
  }
}
function back(): void {
  if (window.history.length > 1) window.history.back()
  else go('/')
}
/** The songs with a tag: the songs' page filtered by it. */
function songsTagged(tag: string): void {
  settings.filters.all = { query: '', chips: [`tag:"${tag}"`] }
  go('/')
}
function play(): void {
  if (isCurrent.value) {
    toggleCurrent()
    return
  }
  const ids = [props.id, ...takes.value.map((s) => s.id), ...similar.value.map((s) => s.id)]
  void playSongs(ids, 0)
}
function playFrom(at: number): void {
  void playSongAt(props.id, Math.max(0, at - 0.2))
}
async function copy(text: string, what: string): Promise<void> {
  const done = (): void => {
    copied.value = what
    window.setTimeout(() => (copied.value = ''), 1600)
  }
  try {
    await navigator.clipboard.writeText(text)
    done()
    return
  } catch {
    /* the clipboard API needs a secure context: the player in the network is plain HTTP */
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  try {
    if (document.execCommand('copy')) done()
  } finally {
    area.remove()
  }
}
/** The lyrics as their full text, with their sections (GitHub issue 2026-10-28: to copy for a new run). */
const fullText = computed(() => (detail.value?.lyrics_raw || song.value?.lyrics || '').trim())
/** The lyrics without their section tags, when they differ. */
const plainText = computed(() => {
  const plain = (song.value?.lyrics ?? '').trim()
  return plain && plain !== fullText.value ? plain : ''
})
const sungText = computed(() => (sungOf(detail.value)?.text ?? '').trim())
const asText = computed(() => settings.lyricsView === 'text' && !!fullText.value)
/** The lyrics as written, timed: the notation follows their syllables. */
const writtenLines = computed(() => detail.value?.lines ?? [])
/** The lines shown: as written, or as the take sings them (the rule, or the listener's choice for the song). */
const lyricsLines = computed(() => linesFor(detail.value, versionFor(detail.value, settings)))
const hasSung = computed(() => !!sungOf(detail.value))
/** Where the lines' times come from, in a sentence (``timing_source`` of the song's page). */
function timingSourceText(source: string, note?: string): string {
  if (source === 'subtitles') return 'Times from the song’s subtitle files.'
  if (source === 'lrc' || source === 'srt') return `Times from the .${source} file beside the song.`
  if (source === 'estimated') return `Times estimated from the score and the music, not measured. ${note ?? ''}`.trim()
  return 'Times measured when the song was exported.'
}
</script>

<template>
  <div v-if="song" class="song-page" :class="{ phone: isPhone }">
    <section class="head">
      <div class="art" :class="{ playing: isCurrent && playing }"><CoverArt :song="song" :live="isCurrent && playing" rounded :size="280" /></div>
      <div class="text">
        <button class="back" @click="back"><Icon name="back" :size="16" /> Back</button>
        <small v-if="song.other"><span class="other-mark">Other music</span> {{ [song.artist, song.album, song.year].filter(Boolean).join(' · ') }}</small>
        <small v-else>{{ song.kind === 'cover' ? 'Cover song' : song.model ? 'Song' : 'Recording' }} · {{ song.created.slice(0, 10) }}</small>
        <h1>{{ song.title }}</h1>
        <p class="style" :class="{ open: styleOpen }" @click="styleOpen = !styleOpen">{{ song.style }}</p>
        <p v-if="partyCheers" class="cheers" title="The guests' reactions while it played at a party - apart from your favourite heart">{{ partyCheers }} <span class="from">from the guests</span></p>
        <div class="rating">
          <Stars :rating="myStars" :measured="quality?.stars ?? null" editable @rate="rate" />
          <span v-if="myStars !== null" class="mine">{{ myStars }} - your stars</span>
          <span v-else-if="quality?.stars != null" class="pre">rate it by ear</span>
          <span v-if="quality?.stars != null" class="measured" :title="'Measured from the sound and the record - a hint where to listen first, never the verdict (Details: every measure)'">
            <Stars :rating="null" :measured="quality.stars" :size="14" /> {{ quality.stars }} measured
          </span>
          <span v-else-if="measuring" class="measured">measuring …</span>
        </div>
        <p v-if="song.other" class="other-note">Not made with Plenio: it plays with what its file has - its tags, cover and lyrics (timed from an <code>.lrc</code> file beside it). No notation, measured lyrics, brief or <i>Open in ComfyUI</i>.</p>
        <div v-if="isPhone" class="actions">
          <button class="primary" @click="play"><Icon :name="isCurrent && playing ? 'pause' : 'play'" /> {{ isCurrent && playing ? 'Pause' : 'Play' }}</button>
          <button class="ghost round" :class="{ on: isFavorite(song.id) }" :title="isFavorite(song.id) ? 'A favourite' : 'Add to favourites'" @click="toggleFavorite(song.id)"><Icon name="heart" :filled="isFavorite(song.id)" /></button>
          <button v-if="makeShown && !isPortable" class="ghost round" title="A new version: a new take, a new song like it, a cover" @click="go(`/make/${song.id}`)"><Icon name="wand" /></button>
          <button class="ghost round" title="More: playlist, queue, video, ComfyUI, remove" @click="menu = { x: 0, y: 0 }"><Icon name="more" /></button>
        </div>
        <div v-else class="actions">
          <button class="primary" @click="play"><Icon :name="isCurrent && playing ? 'pause' : 'play'" /> {{ isCurrent && playing ? 'Pause' : 'Play' }}</button>
          <button class="ghost" :class="{ on: isFavorite(song.id) }" @click="toggleFavorite(song.id)"><Icon name="heart" :filled="isFavorite(song.id)" /> {{ isFavorite(song.id) ? 'Favourite' : 'Add to favourites' }}</button>
          <button class="ghost" @click="menu = { x: $event.clientX, y: $event.clientY }"><Icon name="plus" /> Playlist, queue …</button>
          <button v-if="makeShown && !isPortable" class="ghost" title="Make a new take of it, a new song like it, or a cover of it" @click="go(`/make/${song.id}`)"><Icon name="wand" /> A new version…</button>
          <button v-if="!song.other && !isPortable" class="ghost" :disabled="opening" title="Open the song's workflow in ComfyUI - with its lyrics, score and settings - to work on it" @click="toComfyUI"><Icon name="external" /> {{ opening ? 'Opening ComfyUI …' : 'Open in ComfyUI' }}</button>
          <button v-if="!isPortable" class="ghost" title="Save the song as an MP4 video: a visual, its lyrics, its notation …" @click="videoFor = song"><Icon name="layers" /> Video…</button>
          <button v-if="!isPortable && canRemoveSongs" class="ghost down" title="Remove the song from the library: to the retired songs, or deleted" @click="removing = song"><Icon name="thumbdown" /> Remove…</button>
        </div>
        <p class="meta">
          <span>{{ formatTime(song.seconds) }}</span>
          <span v-if="song.bpm">{{ song.bpm }} BPM</span>
          <span v-if="song.score_key">{{ song.score_key }}</span>
          <span>{{ plays }} {{ plays === 1 ? 'play' : 'plays' }}</span>
          <span v-if="lastPlayed">last {{ lastPlayed }}</span>
        </p>
        <div class="tags-row" title="Tags of your own: type one, or choose one you gave before">
          <TagEditor :ids="[song.id]" @filter="songsTagged" />
        </div>
      </div>
    </section>

    <div v-if="isCurrent && sections.length" class="sections">
      <button v-for="s in sections" :key="s.at" class="chip" @click="engine.seek(s.at)">{{ sectionName(s.label) }} <small>{{ formatTime(s.at) }}</small></button>
    </div>

    <nav class="tabs">
      <button v-for="[id, label] in tabs" :key="id" :class="{ on: tab === id }" @click="tab = id">{{ label }}</button>
    </nav>
    <p v-if="error" class="error">{{ error }}</p>

    <section v-if="tab === 'lyrics'" class="pane lyrics">
      <LyricsVersionSwitch v-if="fullText || hasSung" :detail="detail" details full />
      <div v-if="asText" class="full-lyrics">
        <div class="copy-row">
          <button class="ghost small" @click="copy(fullText, 'lyrics')"><Icon name="copy" :size="14" /> {{ copied === 'lyrics' ? 'Copied' : 'Copy the lyrics' }}</button>
          <button v-if="plainText" class="ghost small" title="The lyrics without [Verse], [Chorus] …" @click="copy(plainText, 'plain')"><Icon name="copy" :size="14" /> {{ copied === 'plain' ? 'Copied' : 'Without the section tags' }}</button>
          <button v-if="song.style && !song.other" class="ghost small" title="What the music model was given as the style" @click="copy(song.style, 'style')"><Icon name="copy" :size="14" /> {{ copied === 'style' ? 'Copied' : 'Copy the style' }}</button>
          <a v-if="!song.other && !isPortable" class="ghost small" :href="songPage(song.id)" target="_blank" rel="noopener" title="Everything about the song on one page: the lyrics, the prompts, every setting, the files"><Icon name="external" :size="14" /> The song's page</a>
        </div>
        <pre class="full">{{ fullText }}</pre>
        <details v-if="sungText" class="sung-text">
          <summary>As the take sings them, heard when the song was exported</summary>
          <button class="ghost small" @click="copy(sungText, 'sung')"><Icon name="copy" :size="14" /> {{ copied === 'sung' ? 'Copied' : 'Copy' }}</button>
          <pre class="full">{{ sungText }}</pre>
        </details>
      </div>
      <div v-else-if="isCurrent && lyricsLines.length" class="karaoke-box">
        <Karaoke :lines="lyricsLines" :time="Math.max(0, songTime)" :plain="song.lyrics" />
      </div>
      <ol v-else-if="lyricsLines.length" class="timed">
        <li v-for="(line, i) in lyricsLines" :key="i" :class="{ now: isCurrent && lineIndex === i }" @click="playFrom(line.start)">
          <span class="at">{{ formatTime(line.start) }}</span><span>{{ line.text }}</span>
        </li>
      </ol>
      <pre v-else class="plain">{{ song.lyrics || 'An instrumental - no lyrics.' }}</pre>
      <p v-if="asText" class="hint">The lyrics as written, with their sections: copy them into a Song Sheet or <i>A new version…</i> to make the song again.</p>
      <p v-else-if="detail?.timing_source" class="hint">
        {{ timingSourceText(detail.timing_source, detail.timing_note) }}
        Click a line to hear it.
      </p>
      <p v-else-if="lyricsLines.length === 0 && song.lyrics && song.other" class="hint">The lyrics from the file's tags. An <code>.lrc</code> file of the same name beside it gives their times.</p>
      <p v-else-if="detail && lyricsLines.length === 0 && song.lyrics" class="hint">{{ detail.timing_note || 'This song was exported without lyrics times.' }} Export it again with lyrics subtitles on to follow along.</p>
    </section>

    <section v-if="tab === 'notation' && detail" class="pane">
      <div class="notation-box">
        <Notation :notation="detail.notation" :lines="writtenLines" :time="Math.max(0, songTime)" :following="isCurrent" :song-id="detail.id" />
      </div>
      <p v-if="!isCurrent" class="hint">Play the song and the notes light up as they sound; click a note to jump there.</p>
    </section>

    <section v-if="tab === 'sheet'" class="pane sheet">
      <iframe :src="media(song.id, 'pdf')" title="Sheet music" />
      <a class="ghost" :href="media(song.id, 'pdf')" target="_blank"><Icon name="sheet" /> Open the PDF</a>
    </section>

    <section v-if="tab === 'details'" class="pane details">
      <div class="block">
        <h3>The song</h3>
        <dl><template v-for="f in facts" :key="f.label"><dt>{{ f.label }}</dt><dd :class="{ fallback: f.note?.startsWith('default') }">{{ f.value }}<small v-if="f.note" class="note"> ({{ f.note }})</small></dd></template></dl>
      </div>
      <div v-if="quality?.parts.length" class="block quality">
        <h3>How it came out, measured <small>{{ quality.stars }} of 5</small></h3>
        <dl>
          <template v-for="p in quality.parts" :key="p.key">
            <dt :title="p.note">{{ p.label }}</dt>
            <dd>
              <span class="meter" :class="{ low: p.score !== null && p.score < 0.6 }"><i :style="{ width: `${Math.round((p.score ?? 0) * 100)}%` }" /></span>
              {{ p.value }}
            </dd>
          </template>
        </dl>
        <p class="hint">Measured from the sound and the record: how well the lyrics are sung as written, how clean the harmony is, how steady the beat - and what went wrong (an ending cut off, holes, clipping). A hint where to listen first: only listening tells how good a song is. Your own stars are the ones at the top.</p>
      </div>
      <div v-if="made.length" class="block">
        <h3>How it was made</h3>
        <dl><template v-for="f in made" :key="f.label"><dt>{{ f.label }}</dt><dd>{{ f.value }}<small v-if="f.note" class="note"> ({{ f.note }})</small></dd></template></dl>
      </div>
      <div class="block">
        <h3>The sound</h3>
        <dl>
          <template v-for="[k, v] in loudness" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template>
          <template v-for="(seed, name) in song.seeds" :key="name">
            <dt>{{ seedNames[name] ?? name }}</dt>
            <dd class="seed">{{ seed }} <button class="icon-btn" title="Copy" @click="copy(String(seed), name)"><Icon name="copy" :size="14" /></button><em v-if="copied === name">copied</em></dd>
          </template>
          <template v-if="song.plenio"><dt>Plenio</dt><dd>{{ song.plenio }}</dd></template>
          <template v-for="(version, name) in detail?.versions ?? {}" :key="`v-${name}`">
            <template v-if="name !== 'plenio'"><dt>{{ name }}</dt><dd>{{ version }}</dd></template>
          </template>
        </dl>
      </div>
      <div v-if="Object.keys(song.tags).length" class="block">
        <h3>Tags in the file</h3>
        <dl><template v-for="(v, k) in song.tags" :key="k"><dt>{{ k }}</dt><dd>{{ v }}</dd></template></dl>
      </div>
      <div v-if="song.brief.description" class="block wide">
        <h3>The brief</h3>
        <p>{{ song.brief.description }}</p>
      </div>
      <div v-if="detail?.documents.artwork_prompt" class="block wide">
        <h3>The cover’s prompt</h3>
        <p>{{ detail.documents.artwork_prompt }}</p>
      </div>
      <div class="block wide">
        <h3>Files</h3>
        <div class="downloads">
          <a v-if="!song.other && !isPortable" class="file" :href="songPage(song.id)" target="_blank" rel="noopener"><Icon name="external" :size="16" /> The song's page <small>lyrics, prompts and settings on one page</small></a>
          <a v-for="d in downloads" :key="d.kind" class="file" :href="d.url" :download="d.name"><Icon name="download" :size="16" /> {{ d.label }} <small>{{ d.name }}</small></a>
        </div>
        <p class="path">
          <Icon name="folder" :size="14" /> {{ detail?.record_path || detail?.file_path }}
          <button v-if="detail" class="icon-btn" title="Copy the path" @click="copy(detail.record_path || detail.file_path || '', 'path')"><Icon name="copy" :size="14" /></button>
          <em v-if="copied === 'path'">copied</em>
        </p>
        <p v-if="detail?.licences.length" class="hint">Licences: {{ detail.licences.join(', ') }}</p>
      </div>
    </section>

    <section v-if="tab === 'takes'" class="pane grid">
      <SongCard :song="song" @play="play" />
      <SongCard v-for="s in takes" :key="s.id" :song="s" @play="playSongs([s.id, song.id, ...takes.filter((t) => t.id !== s.id).map((t) => t.id)])" />
    </section>
    <section v-if="tab === 'similar'" class="pane grid">
      <SongCard v-for="(s, i) in similar" :key="s.id" :song="s" @play="playSongs(similar.map((x) => x.id), i)" />
    </section>

    <SongMenu v-if="menu" :song="song" :x="menu.x" :y="menu.y" @close="menu = null" />
  </div>
  <div v-else class="song-page missing">
    <p>This song is not in the library (any more).</p>
    <button class="ghost" @click="go('/')">To the library</button>
  </div>
</template>

<style scoped>
.other-mark {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  color: #ffd9a0;
  border: 1px solid rgba(255, 190, 90, 0.45);
  background: rgba(255, 170, 60, 0.12);
  font-weight: 600;
}
.other-note {
  max-width: 640px;
  color: var(--muted);
  font-size: 13px;
}
.song-page {
  padding: 26px 34px 40px;
}
.head {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: end;
  margin-bottom: 22px;
}
.art {
  border-radius: 18px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  /* the cover a card opened glides here (openSong) */
  view-transition-name: song-cover;
}
.art.playing {
  transform: scale(1.02);
  box-shadow: 0 30px 80px var(--glow);
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  color: var(--muted);
  font: 13px var(--font);
  cursor: pointer;
  padding: 0;
  margin-bottom: 18px;
}
.back:hover {
  color: #fff;
}
.text small {
  display: block;
  font: 700 11px var(--font);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
}
h1 {
  font: 800 clamp(30px, 4vw, 58px) / 1.04 var(--font);
  margin: 8px 0 10px;
  letter-spacing: -0.8px;
}
.style {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 18px;
  max-width: 820px;
  line-height: 1.5;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.actions .on {
  color: #ff5f8f;
}
.actions .down:hover {
  border-color: #ff8f8f;
  color: #ff8f8f;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: var(--muted);
  font: 12px var(--mono);
  margin: 16px 0 0;
}
.tags-row {
  margin-top: 12px;
}
.sections {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.sections small {
  opacity: 0.55;
}
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 18px;
  overflow-x: auto;
}
.tabs button {
  border: 0;
  background: none;
  color: var(--muted);
  font: 600 14px var(--font);
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.tabs button.on {
  color: #fff;
  border-bottom-color: var(--accent);
}
.pane {
  animation: fade 0.3s ease-out;
}
.lyrics {
  max-width: 900px;
}
.karaoke-box {
  height: min(60vh, 600px);
}
/* a height of its own, so the sheet scrolls inside it and follows the music */
.notation-box {
  height: min(72vh, 820px);
}
.timed {
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2 340px;
  column-gap: 40px;
}
.timed li {
  display: flex;
  gap: 14px;
  padding: 5px 8px;
  border-radius: 8px;
  cursor: pointer;
  break-inside: avoid;
  font-size: 16px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.85);
}
.timed li:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.timed .at {
  font: 12px/1.9 var(--mono);
  color: var(--muted);
  width: 38px;
  flex: none;
}
.plain {
  font: 16px/1.6 var(--font);
  white-space: pre-wrap;
  color: rgba(255, 255, 255, 0.85);
}
.full-lyrics .copy-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 16px;
}
.ghost.small {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  gap: 6px;
}
.full-lyrics pre.full {
  margin: 0;
  font: 16px/1.7 var(--font);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: rgba(255, 255, 255, 0.88);
  user-select: text;
}
.sung-text {
  margin-top: 22px;
}
.sung-text summary {
  cursor: pointer;
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 10px;
}
.sung-text button {
  margin-bottom: 10px;
}
.hint {
  color: var(--muted);
  font-size: 12px;
  margin-top: 16px;
}
.sheet iframe {
  width: 100%;
  height: 78vh;
  border: 0;
  border-radius: 14px;
  background: #fff;
  margin-bottom: 12px;
}
.sheet a {
  display: inline-flex;
}
.rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  margin: 2px 0 10px;
}
.rating .mine {
  color: #f5c84a;
  font-weight: 650;
  font-size: 13px;
}
.rating .pre,
.rating .measured {
  color: var(--muted);
  font-size: 12px;
}
.rating .measured {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.quality h3 small {
  color: var(--muted);
  font-weight: 500;
}
.quality dd {
  display: flex;
  align-items: center;
  gap: 8px;
}
.quality .meter {
  flex: none;
  width: 70px;
  height: 6px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.quality .meter i {
  display: block;
  height: 100%;
  background: var(--accent);
}
/* a weak measure in amber, what came out well in the accent */
.quality .meter.low i {
  background: #f5b301;
}
.quality .hint {
  margin-top: 10px;
}
.cheers {
  margin: 2px 0 0;
  font-size: 15px;
  letter-spacing: 0.02em;
}
.cheers .from {
  color: var(--muted);
  font-size: 12px;
  margin-left: 6px;
  white-space: nowrap;
}
.details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px 18px;
}
.block.wide {
  grid-column: 1 / -1;
}
.block h3 {
  margin: 0 0 12px;
  font: 600 12px var(--font);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
}
.block p {
  margin: 0;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.85);
}
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  margin: 0;
  font-size: 13px;
}
dt {
  color: var(--muted);
}
dd {
  margin: 0;
  color: #fff;
  word-break: break-word;
}
/* a field left empty: the brief's default, or the writer's choice */
dd.fallback {
  color: rgba(255, 255, 255, 0.7);
}
dd .note {
  color: var(--muted);
  font-size: 12px;
}
.seed {
  font-family: var(--mono);
  display: flex;
  align-items: center;
  gap: 4px;
}
em {
  font-style: normal;
  font-size: 11px;
  color: var(--accent);
}
.downloads {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.file {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
}
.file:hover {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
}
.file small {
  color: var(--muted);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px !important;
  font: 12px var(--mono);
  color: var(--muted) !important;
  word-break: break-all;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}
.error {
  color: #ff7a7a;
}
.missing {
  text-align: center;
  color: var(--muted);
  padding-top: 80px;
}
@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
@media (max-width: 1100px) {
  .song-page {
    padding: 22px 22px 40px;
  }
  .head {
    grid-template-columns: 200px 1fr;
    gap: 24px;
  }
}
/* a phone: the cover beside the title, the style in two lines (a tap: all of it), four buttons - the rest in ⋯ -, the
   tabs staying at the top while the lyrics scroll */
.song-page.phone {
  padding: 12px 16px 30px;
}
.phone .head {
  grid-template-columns: 112px minmax(0, 1fr);
  column-gap: 14px;
  row-gap: 0;
  align-items: center;
  margin-bottom: 14px;
}
/* the text's parts become the head's own: the title beside the cover, the rest under both, the whole width */
.phone .text {
  display: contents;
}
.phone .art {
  grid-column: 1;
  grid-row: 1 / span 3;
  align-self: start;
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
}
.phone .back,
.phone .text > small,
.phone h1 {
  grid-column: 2;
}
.phone .style,
.phone .other-note,
.phone .actions,
.phone .meta,
.phone .tags-row {
  grid-column: 1 / -1;
}
.phone .style {
  margin-top: 12px;
}
.phone .back {
  margin-bottom: 8px;
}
.phone h1 {
  font-size: 24px;
  margin: 4px 0 6px;
  overflow-wrap: anywhere;
}
.phone .style {
  grid-column: 1 / -1;
  font-size: 13px;
  margin-bottom: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  cursor: pointer;
}
.phone .style.open {
  -webkit-line-clamp: unset;
}
.phone .actions {
  gap: 8px;
  flex-wrap: nowrap;
}
.phone .actions .primary {
  flex: 1;
  justify-content: center;
}
.phone .round {
  width: 44px;
  padding: 0;
  justify-content: center;
  flex: none;
}
.phone .meta {
  margin-top: 12px;
}
.phone .tabs {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 -16px 14px;
  padding: 0 10px;
  background: color-mix(in srgb, var(--deep) 94%, transparent);
  backdrop-filter: blur(14px);
  scrollbar-width: none;
}
.phone .sections {
  flex-wrap: nowrap;
  overflow-x: auto;
  margin: 0 -16px 12px;
  padding: 0 16px;
  scrollbar-width: none;
}
.phone .timed {
  columns: 1;
}
.phone .karaoke-box {
  height: min(52vh, 480px);
}
.phone .notation-box {
  height: min(60vh, 600px);
}
.phone .details {
  grid-template-columns: minmax(0, 1fr);
}
.phone .grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
</style>
