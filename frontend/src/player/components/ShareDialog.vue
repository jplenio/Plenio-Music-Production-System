<script setup lang="ts">
/**
 * Share songs as a player (owner's request 2026-10-16): the songs chosen - all of a view, a playlist, the
 * favourites, any - packed with the player into one HTML file that plays by itself anywhere, also a large one
 * on a phone: send it, and the other one double-clicks it. MP3 of 128-192 kbit/s, optionally the sheet music,
 * your own visuals, your look, the playlists and tags of these songs. *Make the player* puts it in the queue
 * (owner's request 2026-10-18): made by the player in the background - close this, it goes on.
 */
import { computed, ref } from 'vue'

import { api } from '../api'
import { jobs, progressOf, progressText, queuePackage, stopJob } from '../jobs'
import { parseQuery, score } from '../search'
import { byId, go, library, settings, state } from '../store'
import { formatTime } from '../timing'
import { myPresetTexts } from '../visuals/drop'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'

const props = defineProps<{ songs: string[]; title: string }>()
const emit = defineEmits<{ close: [] }>()

const title = ref(props.title || 'My Plenio songs')
const chosen = ref(new Set(props.songs.filter((id) => byId.value.has(id))))
const find = ref('')
const bitrate = ref(192)
const pdf = ref(true)
const look = ref(true)
const presets = ref(true)
const playlists = ref(true)
const tags = ref(true)
/** Parts of at most so many MB for a large share (a phone's browser holds a file in memory while it opens it). */
const partMb = ref<number | null>(null)
const tagged = computed(() => [...chosen.value].filter((id) => (state.tags[id] ?? []).length).length)
const error = ref('')
const jobId = ref('')
const job = computed(() => jobs.value.find((j) => j.id === jobId.value) ?? null)
const working = computed(() => job.value?.state === 'working' || job.value?.state === 'waiting')
const starting = ref(false)

const shown = computed(() => {
  const q = find.value.trim()
  if (!q) return library.value
  const terms = parseQuery(q)
  const context = { favorites: new Set(state.favorites) }
  return library.value.filter((s) => score(s, terms, context) > 0)
})
const picked = computed(() => library.value.filter((s) => chosen.value.has(s.id)))
const seconds = computed(() => picked.value.reduce((t, s) => t + (s.seconds || 0), 0))
// MP3 at the bit rate, as base64 in the page (4/3), and a little for the player itself
const megabytes = computed(() => (seconds.value * bitrate.value * 1000) / 8 / 2 ** 20 * 1.34 + 1.2)
/** One file up to 600 MB, else parts of 500 MB - until chosen otherwise. */
const parts = computed({ get: () => partMb.value ?? (megabytes.value > 600 ? 500 : 0), set: (v: number) => (partMb.value = v) })
const partCount = computed(() => (parts.value ? Math.max(1, Math.ceil(megabytes.value / (parts.value - 1.2))) : 1))

function toggle(id: string): void {
  const next = new Set(chosen.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  chosen.value = next
}
function pick(ids: string[], name = ''): void {
  chosen.value = new Set(ids.filter((id) => byId.value.has(id)))
  if (name) title.value = name
}

async function make(): Promise<void> {
  error.value = ''
  starting.value = true
  const ids = library.value.filter((s) => chosen.value.has(s.id)).map((s) => s.id)
  try {
    const queued = await queuePackage({
      songs: ids,
      title: title.value,
      bitrate: bitrate.value,
      pdf: pdf.value,
      settings: look.value ? JSON.parse(JSON.stringify({ visuals: settings.visuals, lyrics: settings.lyrics })) : {},
      presets: presets.value ? myPresetTexts.value : [],
      playlists: playlists.value ? state.playlists.map((p) => ({ name: p.name, songs: p.songs.filter((id) => chosen.value.has(id)) })).filter((p) => p.songs.length) : [],
      tags: tags.value ? Object.fromEntries(ids.filter((id) => state.tags[id]?.length).map((id) => [id, state.tags[id]])) : {},
      part_mb: parts.value,
    })
    jobId.value = queued.id
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    starting.value = false
  }
}
/** The folder in the file manager, the player made chosen; a failure is said, not swallowed. */
async function showFolder(file: string): Promise<void> {
  try {
    await api.openPackages(file)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
const sizeText = (bytes: number): string => (bytes > 2 ** 30 ? `${(bytes / 2 ** 30).toFixed(1)} GB` : `${Math.max(1, Math.round(bytes / 2 ** 20))} MB`)
</script>

<template>
  <div class="veil" @click.self="emit('close')">
    <div class="dialog" role="dialog" aria-label="Share as a player">
      <header>
        <h3><Icon name="download" /> Share your songs as a player</h3>
        <button class="icon-btn" title="Close (a player being made goes on)" @click="emit('close')"><Icon name="close" /></button>
      </header>
      <p class="lead">One HTML file with the player and the songs you choose: send it, and the other one opens it with a double-click - in any current browser, without installing anything, without ComfyUI. The lyrics, the notation following the music, the visuals, playlists and Live Play all play; the songs go as MP3, never as FLAC.</p>
      <div class="body">
        <div class="left">
          <div class="quick">
            <button class="chip" @click="pick(library.map((s) => s.id))">all {{ library.length }}</button>
            <button class="chip" @click="pick(state.favorites, 'My favourites')">favourites</button>
            <button v-for="p in state.playlists" :key="p.id" class="chip" @click="pick(p.songs, p.name)">{{ p.name }}</button>
            <button class="chip" @click="pick([])">none</button>
          </div>
          <input v-model="find" class="find" placeholder="Search: title, genre, mood …" />
          <div class="list">
            <label v-for="s in shown" :key="s.id" class="row" :class="{ on: chosen.has(s.id) }">
              <input type="checkbox" :checked="chosen.has(s.id)" @change="toggle(s.id)" />
              <CoverArt :song="s" rounded :size="48" />
              <span class="t">{{ s.title }}<small>{{ s.other ? s.artist || 'other music' : s.genre }} · {{ formatTime(s.seconds) }}</small></span>
            </label>
          </div>
        </div>
        <form class="right" @submit.prevent>
          <label>Name <input v-model="title" class="text" maxlength="120" /></label>
          <label>Sound
            <select v-model.number="bitrate">
              <option :value="128">MP3, 128 kbit/s - smallest</option>
              <option :value="160">MP3, 160 kbit/s</option>
              <option :value="192">MP3, 192 kbit/s - best</option>
            </select>
          </label>
          <label class="check"><input v-model="pdf" type="checkbox" /> the sheet music (PDF)</label>
          <label class="check"><input v-model="look" type="checkbox" /> my look: the visuals’ and the lyrics’ settings</label>
          <label class="check"><input v-model="presets" type="checkbox" :disabled="!myPresetTexts.length" /> my own Plenio Drop visuals ({{ myPresetTexts.length }})</label>
          <label class="check"><input v-model="playlists" type="checkbox" /> my playlists of these songs</label>
          <label class="check"><input v-model="tags" type="checkbox" :disabled="!tagged" /> my tags of these songs ({{ tagged }} tagged)</label>
          <label>Files
            <select v-model.number="parts">
              <option :value="0">one file{{ megabytes > 1000 ? ' - for a computer' : '' }}</option>
              <option :value="250">parts of at most 250 MB - for any phone</option>
              <option :value="500">parts of at most 500 MB - for phones</option>
              <option :value="1000">parts of at most 1 GB</option>
            </select>
          </label>
          <p class="sum"><b>{{ chosen.size }}</b> songs · {{ formatTime(seconds) }} · about {{ Math.max(1, Math.round(megabytes)) }} MB<template v-if="partCount > 1"> in about {{ partCount }} files</template></p>
          <p v-if="megabytes > 600" class="hint">A browser holds a file in memory while it opens it: a computer opens a file of any size, a phone one of a few hundred MB. In parts, each file is a whole player of its songs; favourites and playlists are the same in all of them.</p>
          <p class="hint">What stays out: the FLAC and WAV files, the unmastered takes, the release records with their workflows, and every path of this computer.</p>
          <div v-if="job && working" class="progress">
            <p>{{ progressText(job) }} …</p>
            <div class="bar"><i :style="{ width: `${Math.max(3, progressOf(job) * 100)}%` }" /></div>
            <p class="hint">Made in the background: close this, it goes on - see <a class="link" @click="emit('close'); go('/jobs')">In the making</a>.</p>
          </div>
          <div v-if="job?.state === 'done'" class="done">
            <p><Icon name="check" :size="16" /> Saved: <b>{{ job.files && job.files.length > 1 ? `${job.files.length} parts` : job.file }}</b> ({{ sizeText(job.size ?? 0) }})</p>
            <p v-if="job.files && job.files.length > 1" class="hint">{{ job.files.map((f) => f.name).join(' · ') }}</p>
            <div class="buttons">
              <a class="ghost small" :href="`/packages/${encodeURIComponent(job.file ?? '')}?download=1`" :download="job.file"><Icon name="download" :size="14" /> Download</a>
              <a class="ghost small" :href="`/packages/${encodeURIComponent(job.file ?? '')}`" target="_blank" rel="noopener"><Icon name="play" :size="14" /> Try it</a>
              <button type="button" class="ghost small" @click="showFolder(job.file ?? '')"><Icon name="folder" :size="14" /> Open the folder</button>
            </div>
            <p class="hint path">{{ job.folder }}</p>
          </div>
          <p v-if="job?.state === 'stopped'" class="hint">Stopped.</p>
          <p v-if="job?.state === 'error' || error" class="error">{{ job?.error || error }}</p>
        </form>
      </div>
      <footer>
        <button v-if="job && working" class="ghost" @click="stopJob(job)">Stop</button>
        <button class="primary" :disabled="!chosen.size || starting" @click="make"><Icon name="download" :size="16" /> {{ job && working ? 'Make another' : 'Make the player' }}</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.veil {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.6);
}
.dialog {
  width: min(1060px, 96vw);
  max-height: 92vh;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: #13101c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7);
}
header,
footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
}
footer {
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
h3 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
}
.lead {
  margin: 0;
  padding: 0 20px;
  color: var(--muted);
  font-size: 13px;
}
.body {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(300px, 1fr);
  gap: 20px;
  padding: 14px 20px;
  /* the body scrolls when the dialog is taller than the screen (a phone, upright or on its side) */
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  min-height: 0;
}
.left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.find,
.text,
select {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 7px 10px;
  font: 13px var(--font);
}
.list {
  overflow-y: auto;
  overscroll-behavior: contain;
  max-height: 46vh;
  max-height: 46dvh;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}
.row {
  display: grid;
  grid-template-columns: auto 48px 1fr;
  gap: 10px;
  align-items: center;
  padding: 5px 10px;
  cursor: pointer;
}
.row:hover {
  background: rgba(255, 255, 255, 0.04);
}
.row.on {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.t {
  display: grid;
  font-weight: 600;
  min-width: 0;
}
.t small {
  font-weight: 400;
  color: var(--muted);
}
.right {
  display: grid;
  gap: 10px;
  align-content: start;
  font-size: 13px;
}
.right label {
  display: grid;
  gap: 4px;
  color: var(--muted);
}
.right label.check {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ddd;
}
input[type='checkbox'] {
  accent-color: var(--accent);
}
.sum {
  margin: 4px 0 0;
}
.hint {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}
.hint.path {
  word-break: break-all;
}
.bar {
  height: 8px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 0.3s;
}
.progress p,
.done p {
  margin: 0 0 6px;
}
.done p {
  display: flex;
  gap: 6px;
  align-items: center;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.error {
  color: #ff9a9a;
}
.link {
  color: var(--accent);
  cursor: pointer;
}

/* a phone: the whole screen, one column - the songs to tick first, then the choices, the button always at hand.
   Also a phone on its side, where the screen is wide but low. */
@media (max-width: 760px), (max-height: 560px) {
  .veil {
    place-items: stretch;
  }
  .dialog {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    border: 0;
    padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px)
      env(safe-area-inset-left, 0px);
  }
  header,
  footer {
    padding: 10px 14px;
  }
  .lead {
    padding: 0 14px;
    font-size: 12px;
  }
  .body {
    grid-template-columns: minmax(0, 1fr);
    /* each part as tall as it is - the body scrolls; without it the list's row shrank to nothing on a low screen
       and the choices lay over it */
    grid-auto-rows: max-content;
    align-content: start;
    gap: 14px;
    padding: 10px 14px;
  }
  .list {
    max-height: 58vh;
    max-height: 58dvh;
    min-height: 180px;
  }
  .row {
    padding: 8px 10px;
  }
  input[type='checkbox'] {
    width: 20px;
    height: 20px;
  }
}
</style>
