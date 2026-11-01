<script setup lang="ts">
/**
 * Make your own song - the party guests' page (owner's request 2026-10-25): the song form and the guest's songs in
 * the making, on a phone, below the guests' address (the guests' server, plenio/player/guest.py). A guest is known
 * by a cookie of their own; the host's settings decide whether guests may, how many songs each, how long, covers.
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import Icon from '../player/components/Icon.vue'
import MakeForm from '../player/make/MakeForm.vue'
import MakeQueue from '../player/make/MakeQueue.vue'
import { makeClient } from '../player/make/client'
import { retryRequest } from '../player/make/form'
import type { FormData, MakeJob, MakeStatus, Remake } from '../player/make/form'
import { type Remembered, rememberedOf } from '../player/make/remember'
import { ownTags } from '../shared/lyricsTags'

const client = makeClient('../api/make', { 'X-Plenio-Live': '1' })

// what the song form opens with (the last song's values and configuration) and one's own section tags: kept on
// this phone (owner's request 2026-11-01) - a private window keeps nothing, and the form starts as ever
const LAST_KEY = 'plenio.make.last'
const TAGS_KEY = 'plenio.make.tags'
function kept(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function keep(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // not kept (a private window, storage turned off)
  }
}
const remembered = shallowRef<Remembered | null>(rememberedOf(kept(LAST_KEY)))
const myTags = shallowRef<string[]>(ownTags(kept(TAGS_KEY)))
function remember(values: Remembered): void {
  remembered.value = values
  keep(LAST_KEY, values)
}
function keepTags(tags: string[]): void {
  myTags.value = tags
  keep(TAGS_KEY, tags)
}
const status = shallowRef<MakeStatus | null>(null)
const form = shallowRef<FormData | null>(null)
const editing = ref<MakeJob | null>(null)
const remake = shallowRef<Remake | null>(null)
const reading = ref(false)
const error = ref('')
const note = ref('')
const busy = ref('')
const now = ref(Date.now() / 1000)
const tab = ref<'make' | 'mine'>('make')
let timer = 0
let ticker = 0
let noteTimer = 0
const told = new Set<string>()
let first = true

const mine = computed(() => status.value?.jobs ?? [])
const making = computed(() => mine.value.filter((j) => !['done', 'failed', 'cancelled'].includes(j.status)).length)

function say(text: string): void {
  note.value = text
  window.clearTimeout(noteTimer)
  noteTimer = window.setTimeout(() => (note.value = ''), 3500)
}

async function load(): Promise<void> {
  try {
    const answer = await client.status()
    status.value = answer
    error.value = ''
    for (const job of answer.jobs) {
      if (job.status !== 'done' || told.has(job.id)) continue
      told.add(job.id)
      if (!first) say(`“${job.result?.title || job.label}” is ready - it plays at the party`)
    }
    first = false
    if (!form.value && answer.may) form.value = await client.form()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'The player cannot be reached - same Wi-Fi?'
  }
}

function made(job: MakeJob, edited: boolean): void {
  editing.value = null
  remake.value = null
  say(edited ? 'Changed' : job.position ? `Ordered - #${job.position} in line` : 'Ordered')
  tab.value = 'mine'
  void load()
}
async function act(job: MakeJob, work: () => Promise<unknown>): Promise<void> {
  busy.value = job.id
  try {
    await work()
    await load()
  } catch (e) {
    say(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = ''
  }
}
function remove(job: MakeJob): void {
  if (['sending', 'queued', 'running'].includes(job.status) && !window.confirm('Stop making this song?')) return
  void act(job, () => client.remove(job.id))
}
/** One's own song, heard first on the phone (owner's request 2026-10-29): released - or not. */
function release(job: MakeJob): void {
  void act(job, async () => {
    const answer = await client.release(job.id)
    say(answer.release === 'admin' ? 'Released - the host hears it before everybody does' : 'Released - it plays at the party')
  })
}
function discard(job: MakeJob): void {
  if (!window.confirm('Not release this song? Nobody else hears it.')) return
  void act(job, () => client.discard(job.id))
}
const listenTo = (job: MakeJob): string => client.listen(job.id)
function edit(job: MakeJob): void {
  editing.value = job
  tab.value = 'make'
  if (job.again && job.from?.song) void readAgain(job.from.song)
  else remake.value = null
}
/** What the form starts from to make a song of one's own again. */
async function readAgain(songId: string): Promise<void> {
  reading.value = true
  try {
    remake.value = await client.remake(songId)
  } catch (e) {
    remake.value = null
    say(e instanceof Error ? e.message : String(e))
  } finally {
    reading.value = false
  }
}
/** A song of one's own that is ready, made again: a new take, a new song like it, or a cover. */
async function remakeSong(job: MakeJob): Promise<void> {
  const id = job.result?.song
  if (!id) return
  editing.value = null
  tab.value = 'make'
  await readAgain(id)
}
const coverOf = (songId: string): string => `../cover/${songId}`
const cover = (job: MakeJob): string | null => (job.can.listen ? client.cover(job.id) : job.result?.song ? coverOf(job.result.song) : null)

onMounted(() => {
  void load()
  timer = window.setInterval(() => void load(), 3000)
  ticker = window.setInterval(() => (now.value = Date.now() / 1000), 1000)
})
onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.clearInterval(ticker)
})
</script>

<template>
  <main class="guest">
    <header>
      <a class="back" href="../" title="Back to the live playlist"><Icon name="back" :size="18" /> Live</a>
      <div class="brand"><i><b /><b /><b /></i> Plenio</div>
      <span v-if="status" class="pill" :class="{ ok: status.studio.reachable }">{{ status.studio.reachable ? (status.line.making ? 'studio busy' : 'studio ready') : 'studio resting' }}</span>
    </header>
    <section class="hero">
      <h1><Icon name="wand" :size="26" /> Make your own song</h1>
      <p>Pick a style, say what it is about - the studio writes the lyrics, composes and sings it. When it is ready, it plays here at the party.</p>
    </section>

    <p v-if="error" class="banner bad">{{ error }}</p>
    <p v-else-if="status && !status.may" class="banner bad">{{ status.why }}</p>

    <template v-if="status?.may">
      <nav class="tabs">
        <button :class="{ on: tab === 'make' }" @click="tab = 'make'"><Icon name="sparkles" :size="16" /> {{ editing ? 'Change it' : 'New song' }}</button>
        <button :class="{ on: tab === 'mine' }" @click="tab = 'mine'"><Icon name="music" :size="16" /> My songs <b v-if="making">{{ making }}</b></button>
      </nav>
      <section v-show="tab === 'make'" class="card">
        <p v-if="remake" class="again-bar">
          <Icon name="wand" :size="15" /> Again, from <b>{{ remake.song.title }}</b>
          <button type="button" class="link" @click="remake = null; editing = null">New song instead</button>
        </p>
        <MakeForm
          v-if="form && (!remake || !reading)"
          :client="client"
          :form="form"
          :status="status"
          :editing="editing"
          :remake="remake"
          :cover-of="coverOf"
          :remembered="remembered"
          :my-tags="myTags"
          @remember="remember"
          @tags="keepTags"
          @made="made"
          @cancel="editing = null; remake = null"
        />
        <p v-else class="empty">{{ reading ? 'Reading the song …' : 'Reading the styles …' }}</p>
      </section>
      <section v-show="tab === 'mine'" class="card">
        <MakeQueue v-if="mine.length" :jobs="mine" :now="now" :cover="cover" :busy="busy" :listen="listenTo" @edit="edit" @move="(job, by) => act(job, () => client.move(job.id, by))" @remove="remove" @again="(job) => act(job, () => client.create(retryRequest(job)))" @remake="remakeSong" @release="release" @discard="discard" />
        <p v-else class="empty">Your songs show here - in line, being made, ready. Order one under <b>New song</b>.</p>
      </section>
    </template>
    <div v-if="note" class="toast">{{ note }}</div>
  </main>
</template>

<style scoped>
.guest {
  max-width: 760px;
  margin: 0 auto;
  padding: max(12px, env(safe-area-inset-top)) 14px 60px;
  display: grid;
  gap: 14px;
}
:global(html),
:global(body) {
  overflow: auto;
  height: auto;
  min-height: 100%;
  background: radial-gradient(900px 500px at 80% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), #0d0b17;
}
header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 14px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  margin-right: auto;
}
.brand i {
  display: inline-flex;
  gap: 2px;
  align-items: flex-end;
  height: 16px;
}
.brand i b {
  width: 3px;
  background: var(--accent);
  border-radius: 2px;
  animation: eq 1s ease-in-out infinite;
}
.brand i b:nth-child(2) {
  animation-delay: -0.3s;
}
.brand i b:nth-child(3) {
  animation-delay: -0.6s;
}
@keyframes eq {
  0%,
  100% {
    height: 30%;
  }
  50% {
    height: 100%;
  }
}
.pill {
  font: 700 11px var(--font);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--muted);
}
.pill.ok {
  background: rgba(79, 191, 127, 0.2);
  color: #9be8b9;
}
.hero h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0 6px;
  font: 800 26px var(--font);
}
.hero p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 6px;
  z-index: 5;
  backdrop-filter: blur(10px);
}
.tabs button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border: 0;
  border-radius: 11px;
  background: none;
  color: rgba(255, 255, 255, 0.75);
  font: 600 14px var(--font);
  cursor: pointer;
}
.tabs button.on {
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  color: #fff;
}
.tabs b {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  border-radius: 99px;
  background: var(--accent2);
  color: #120c1c;
  font-size: 11px;
}
.card {
  padding: 14px;
  border-radius: 20px;
  background: rgba(18, 15, 28, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.again-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 13px;
}
.again-bar b {
  color: #fff;
}
.link {
  margin-left: auto;
  background: none;
  border: 0;
  color: var(--accent);
  cursor: pointer;
  font: 13px var(--font);
  padding: 0;
}
.empty {
  margin: 0;
  padding: 24px 6px;
  color: var(--muted);
  text-align: center;
}
.banner {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
}
.banner.bad {
  background: rgba(228, 87, 61, 0.12);
  border: 1px solid rgba(228, 87, 61, 0.35);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: max(18px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  max-width: calc(100vw - 28px);
  background: #2a2440;
  color: #fff;
  padding: 10px 16px;
  border-radius: 99px;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 20;
}
</style>
