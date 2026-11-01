<script setup lang="ts">
/**
 * Make a song (owner's request 2026-10-25, docs/design/party-songs.md): the song form and one's songs in the
 * making, side by side; the admin sees everybody's songs too and finds the switches in Settings. The songs are made
 * by YuE2 in the ComfyUI on this computer - HQ mastering off, cover art on - and join Live Play when ready.
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

import { api, media, type StudioStatus } from '../api'
import { isPhone } from '../layout'
import MakeForm from '../make/MakeForm.vue'
import MakeQueue from '../make/MakeQueue.vue'
import { retryRequest } from '../make/form'
import type { MakeJob, Remake } from '../make/form'
import type { MakePreset } from '../make/presets'
import { everybody, loadForm, loadMake, makeApi, makeError, makeForm, makeStatus, pollMake } from '../make/state'
import { byId, go, playSong, reloadLibrary, remote, say, settings } from '../store'
import Icon from './Icon.vue'

const props = defineProps<{ from?: string }>()

const editing = ref<MakeJob | null>(null)
const remake = shallowRef<Remake | null>(null)
const remakeError = ref('')
const reading = ref(false)
const busy = ref('')
const error = ref('')
const now = ref(Date.now() / 1000)
const tick = window.setInterval(() => (now.value = Date.now() / 1000), 1000)
const status = computed(() => makeStatus.value)
const mine = computed(() => (status.value?.jobs ?? []).filter((j) => everybody.value || j.mine))
const making = computed(() => mine.value.filter((j) => !['done', 'failed', 'cancelled'].includes(j.status)).length)
const studio = computed(() => {
  const s = status.value
  if (!s) return { text: 'Asking the studio …', tone: 'wait' }
  if (!s.studio.reachable && studioInfo.value?.starting) return { text: `Starting the studio … ${Math.max(0, Math.round(now.value - (studioInfo.value.since ?? now.value)))} s`, tone: 'busy' }
  if (!s.studio.reachable) return { text: 'Studio not running - songs wait until ComfyUI runs', tone: 'bad' }
  if (s.line.making || s.line.waiting) return { text: `Studio busy · ${s.line.waiting} waiting`, tone: 'busy' }
  return { text: 'Studio ready', tone: 'ok' }
})

// --- the studio - ComfyUI - started from here (the admin, on this computer; owner's request 2026-10-26) ----------
const studioInfo = ref<StudioStatus | null>(null)
const startingStudio = ref(false)
let studioTimer: number | undefined
const mayStart = computed(() => !!status.value?.admin && !remote.value && !!studioInfo.value && !status.value?.studio.reachable)
async function readStudio(): Promise<void> {
  if (!status.value?.admin || remote.value) return
  try {
    studioInfo.value = await api.studio()
  } catch {
    studioInfo.value = null
  }
}
async function startStudio(): Promise<void> {
  startingStudio.value = true
  error.value = ''
  try {
    studioInfo.value = await api.studioStart()
    say('ComfyUI is starting - songs go to it as soon as it answers', 4000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    startingStudio.value = false
  }
}
watch(
  () => status.value?.admin,
  (admin) => {
    window.clearInterval(studioTimer)
    if (!admin || remote.value) return
    void readStudio()
    studioTimer = window.setInterval(() => void readStudio(), 3000)
  },
  { immediate: true }
)

// --- presets of one's own, kept with the settings -------------------------------------------------------------
function savePreset(preset: MakePreset): void {
  settings.makePresets = [...settings.makePresets.filter((p) => p.name.toLowerCase() !== preset.name.toLowerCase()), preset].slice(-40)
  say(`Preset “${preset.name}” kept - it is there next time`, 3000)
}
function deletePreset(id: string): void {
  settings.makePresets = settings.makePresets.filter((p) => p.id !== id)
}

/** A phone shows the form or one's songs, not both under each other (the list was far below the form). */
const phoneTab = ref<'form' | 'songs'>('form')

onMounted(async () => {
  pollMake(true)
  if (props.from) void readAgain(props.from)
  try {
    await loadForm()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
onBeforeUnmount(() => {
  window.clearInterval(tick)
  window.clearInterval(studioTimer)
  pollMake(false)
})
watch(everybody, () => void loadMake())
// ComfyUI came up while the form came from the package: the form again, from ComfyUI (the whole studio's settings)
watch(
  () => status.value?.studio.reachable,
  (reachable, was) => {
    if (reachable && was === false && makeForm.value?.source === 'package') void loadForm(true).catch(() => {})
  }
)

/** What the form starts from to make the song at ``#/make/<song id>`` again. */
async function readAgain(songId: string): Promise<void> {
  reading.value = true
  remakeError.value = ''
  try {
    remake.value = await makeApi.remake(songId)
  } catch (e) {
    remake.value = null
    remakeError.value = e instanceof Error ? e.message : String(e)
  } finally {
    reading.value = false
  }
}
/** The cover of the song made again (``null``: none to show). */
const coverOf = (songId: string): string | null => (byId.value.get(songId)?.has.cover ? media(songId, 'cover') : null)

function made(job: MakeJob, edited: boolean): void {
  editing.value = null
  remake.value = null
  if (isPhone.value) phoneTab.value = 'songs'
  const several = job.of && job.of > 1 ? (job.takes_left ? ` - its ${job.of - 1} more takes follow when it is ready` : ` - ${job.of} of them`) : ''
  say(edited ? 'Changed - it keeps its place in the line' : job.position ? `Ordered - #${job.position} in line${several}` : `Ordered${several}`, 4500)
  void loadMake()
  if (props.from) go('/make', true)
}
/** Change a song waiting in the line - a song made again has its remake loaded for its documents. */
function edit(job: MakeJob): void {
  editing.value = job
  if (job.again && job.from?.song) void readAgain(job.from.song)
  else remake.value = null
}
async function act(job: MakeJob, work: () => Promise<unknown>): Promise<void> {
  busy.value = job.id
  error.value = ''
  try {
    await work()
    await loadMake()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = ''
  }
}
/** A song waiting to be released: its maker releases it after hearing it, an admin approves it. */
function release(job: MakeJob): void {
  void act(job, async () => {
    const answer = await makeApi.release(job.id)
    say(answer.release === 'admin' ? 'Released - an admin hears it before everybody does' : 'Released - it joins the songs, and the party', 4500)
    if (answer.release === 'released') await reloadLibrary()
  })
}
function discard(job: MakeJob): void {
  const title = job.result?.title || job.label
  if (!window.confirm(job.release === 'admin' ? `Not approve “${title}”? Nobody else hears it; its files are kept aside.` : `Not release “${title}”? Nobody else hears it; its files are kept aside.`)) return
  void act(job, () => makeApi.discard(job.id))
}
const listenTo = (job: MakeJob): string => makeApi.listen(job.id)

function remove(job: MakeJob): void {
  const running = ['sending', 'queued', 'running'].includes(job.status)
  if (running && !window.confirm(`Stop making “${job.label}”? It cannot go on later.`)) return
  if (editing.value?.id === job.id) editing.value = null
  void act(job, () => makeApi.remove(job.id))
}
async function play(job: MakeJob): Promise<void> {
  const id = job.result?.song
  if (!id) return
  if (!byId.value.has(id)) await reloadLibrary()
  if (byId.value.has(id)) void playSong(id)
  else say('The song is not in the library yet - a moment', 3000)
}
function again(job: MakeJob): void {
  void act(job, () => makeApi.create(retryRequest(job)))
}
/** Leave a waiting song as it was - and the form as it was before: the song of ``#/make/<song id>``, else a new
 * song. */
function cancel(): void {
  editing.value = null
  if (props.from) void readAgain(props.from)
  else remake.value = null
}
/** A song that is ready, made again: a new take, a new song like it, or a cover. */
function remakeSong(job: MakeJob): void {
  if (job.result?.song) go(`/make/${job.result.song}`)
}
const cover = (job: MakeJob): string | null =>
  job.can.listen ? makeApi.cover(job.id) : job.result?.song && byId.value.get(job.result.song)?.has.cover ? media(job.result.song, 'cover') : null
</script>

<template>
  <div class="make-page" :class="{ phone: isPhone }">
    <header class="hero">
      <div>
        <h1><Icon name="wand" :size="30" /> Make a song</h1>
        <p class="lead">Pick a style, say what it is about - the studio writes the lyrics, composes, sings and paints the cover. A few minutes later it is in your songs{{ settings.live.on ? ' - and plays in Live Play' : '' }}.</p>
      </div>
      <div class="chips">
        <span class="pill" :class="studio.tone"><i /> {{ studio.text }}</span>
        <button v-if="mayStart && studioInfo?.can_start && !studioInfo.starting" class="primary start" :disabled="startingStudio" title="Start ComfyUI in the background - no workflow to open (Settings > The studio)" @click="startStudio"><Icon name="power" :size="16" /> Start the studio</button>
        <button v-else-if="mayStart && studioInfo && !studioInfo.can_start" class="ghost start" :title="studioInfo.why" @click="go('/settings/studio')"><Icon name="info" :size="16" /> How to start it</button>
        <span v-if="status?.me" class="pill who"><Icon name="user" :size="13" /> {{ status.me.name }}{{ status.me.kind === 'admin' && status.me.name.toLowerCase() !== 'admin' ? ' · admin' : '' }}</span>
      </div>
    </header>

    <p v-if="status?.admin && !status.on" class="banner">
      <Icon name="info" :size="16" /> <span>Song making is off for guests and users - you make songs as the admin. <a @click="go('/settings/party')">Switch it on in Settings</a>.</span>
    </p>
    <p v-else-if="status && !status.may" class="banner bad"><Icon name="info" :size="16" /> {{ status.why }}</p>
    <p v-if="makeError || error" class="banner bad">{{ error || makeError }}</p>

    <nav v-if="isPhone" class="tabs" aria-label="The form or your songs">
      <button :class="{ on: phoneTab === 'form' }" @click="phoneTab = 'form'"><Icon name="wand" :size="16" /> {{ editing ? 'Change' : 'New song' }}</button>
      <button :class="{ on: phoneTab === 'songs' }" @click="phoneTab = 'songs'"><Icon name="music" :size="16" /> {{ everybody ? 'Everybody’s' : 'Your songs' }} <b v-if="making">{{ making }}</b></button>
    </nav>
    <div class="grid">
      <section v-show="!isPhone || phoneTab === 'form'" class="card">
        <h2>{{ editing ? 'Change your song' : remake ? 'Again, from a song' : 'Your new song' }}</h2>
        <p v-if="remake && !editing" class="again-note">
          <Icon name="wand" :size="16" /> {{ remake.song.title }} - choose a new take, a new song like it or a cover, or <a @click="go('/make')">start a new song instead</a>.
        </p>
        <p v-if="remakeError" class="banner bad">
          <Icon name="info" :size="16" /> {{ remakeError }} <a @click="go('/make')">Make a new song instead</a>
        </p>
        <MakeForm
          v-if="makeForm && (!from || remake)"
          :client="makeApi"
          :form="makeForm"
          :status="status"
          :editing="editing"
          :remake="remake"
          :cover-of="coverOf"
          :presets="settings.makePresets"
          :remembered="settings.makeLast"
          :my-tags="settings.makeTags"
          @remember="(values) => (settings.makeLast = values)"
          @tags="(tags) => (settings.makeTags = tags)"
          @made="made"
          @cancel="cancel"
          @save-preset="savePreset"
          @delete-preset="deletePreset"
        />
        <p v-else class="empty">{{ reading ? 'Reading the song …' : 'Reading the styles …' }}</p>
      </section>
      <section v-show="!isPhone || phoneTab === 'songs'" class="card songs">
        <template v-if="status?.approvals?.length">
          <h2>Waiting for your approval <small>{{ status.approvals.length }}</small></h2>
          <p class="approve-hint">Hear each one here, on this device - then approve it, and it joins the songs and the party, or reject it, and nobody else hears it.</p>
          <MakeQueue :jobs="status.approvals" :now="now" :cover="cover" owners :busy="busy" :listen="listenTo" @release="release" @discard="discard" />
        </template>
        <h2>
          {{ everybody ? 'Everybody’s songs' : 'Your songs' }} <small v-if="making">{{ making }} in the making</small>
          <span v-if="status?.admin" class="switch">
            <button class="chip" :class="{ on: !everybody }" @click="everybody = false">Mine</button>
            <button class="chip" :class="{ on: everybody }" @click="everybody = true">Everybody’s</button>
          </span>
        </h2>
        <MakeQueue
          v-if="mine.length"
          :jobs="mine"
          :now="now"
          :cover="cover"
          :owners="everybody"
          :busy="busy"
          :listen="listenTo"
          playable
          @edit="edit"
          @move="(job, by) => act(job, () => makeApi.move(job.id, by))"
          @remove="remove"
          @play="play"
          @again="again"
          @remake="remakeSong"
          @release="release"
          @discard="discard"
        />
        <div v-else class="empty">
          <Icon name="music" :size="34" />
          <p>No songs yet. The ones you order show here - in line, being made, ready - and you can move, change or take them out while they wait.</p>
        </div>
        <p v-if="status?.me.full" class="foot">Made by YuE2 in this computer’s ComfyUI · you have the whole studio: the writer model, HQ mastering, cover art, the folder, the formats and the tags under <i>Every setting of the studio</i> · saved like a song made in ComfyUI (the template’s folder and tags) · a song ready joins your songs, and Live Play while it runs.</p>
        <p v-else-if="status?.me.kind === 'guest'" class="foot">Made by YuE2 in this computer’s ComfyUI · HQ mastering off, cover art on · a party song: album “Party-Song {{ new Date().toISOString().slice(0, 10) }}”, saved in plenio/Party-Songs-… · a song ready joins the party’s playlist.</p>
        <p v-else class="foot">Made by YuE2 in this computer’s ComfyUI · HQ mastering off, cover art on · saved like a song made in ComfyUI · a song ready joins your songs, and Live Play while it runs.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.make-page {
  padding: 26px 34px 48px;
  max-width: 1400px;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  flex-wrap: wrap;
}
h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 6px;
  font: 800 34px var(--font);
  background: linear-gradient(90deg, #fff, color-mix(in srgb, var(--accent) 60%, #fff));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
h1 :deep(svg) {
  color: var(--accent);
}
.lead {
  margin: 0;
  color: var(--muted);
  max-width: 680px;
  line-height: 1.5;
}
.again-note {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: -6px 0 14px;
  color: var(--muted);
  font-size: 13px;
}
.again-note a {
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font: 600 12.5px var(--font);
}
.pill i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8a86a0;
}
.pill.ok i {
  background: #4fbf7f;
  box-shadow: 0 0 10px #4fbf7f;
}
.pill.busy i {
  background: #e0a83c;
  box-shadow: 0 0 10px #e0a83c;
  animation: pulse 1.4s ease-in-out infinite;
}
.pill.bad i {
  background: #e4573d;
}
@keyframes pulse {
  50% {
    opacity: 0.35;
  }
}
.banner {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 16px 0 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 12%, rgba(255, 255, 255, 0.03));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
}
.banner.bad {
  background: rgba(228, 87, 61, 0.1);
  border-color: rgba(228, 87, 61, 0.35);
}
.banner a {
  color: var(--accent);
  cursor: pointer;
  text-decoration: underline;
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 18px;
  margin-top: 18px;
  align-items: start;
}
.card {
  padding: 18px 20px 20px;
  border-radius: 22px;
  background: rgba(18, 15, 28, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.songs {
  position: sticky;
  top: 18px;
}
h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 14px;
  font-size: 18px;
}
h2 small {
  color: var(--muted);
  font-weight: 500;
  font-size: 13px;
}
.switch {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
.empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 26px 10px;
  color: var(--muted);
  text-align: center;
}
.empty p {
  margin: 0;
  max-width: 360px;
}
.foot {
  margin: 14px 0 0;
  color: rgba(235, 232, 245, 0.4);
  font-size: 11.5px;
  line-height: 1.5;
}
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .songs {
    position: static;
    order: -1;
  }
}
.start {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 14px;
  padding: 4px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.tabs button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  border: 0;
  border-radius: 99px;
  background: none;
  color: rgba(255, 255, 255, 0.7);
  font: 600 14px var(--font);
  cursor: pointer;
}
.tabs button.on {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  color: #fff;
}
.tabs b {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--accent);
  color: #0b0a12;
  font: 700 11px/18px var(--font);
}
@media (max-width: 640px) {
  .make-page {
    padding: 16px 14px 40px;
  }
  .lead {
    display: none;
  }
  /* the title on a line of its own, the studio's state under it (side by side they squeezed each other) */
  .hero {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .hero .chips .who {
    display: none;
  }
  .banner {
    font-size: 13px;
    margin-top: 10px;
  }
  h1 {
    font-size: 26px;
  }
  .card {
    padding: 14px;
  }
}
.approve-hint {
  margin: -4px 0 10px;
  color: var(--muted);
  font-size: 13px;
}
</style>
