<script setup lang="ts">
/**
 * Live Play (owner's request 2026-10-16): the live playlist of a party. It plays while you change it - add,
 * remove, drag to reorder, play next - and the songs ComfyUI makes join it as soon as they are exported:
 * next, at the end, or anywhere at random. At its end it starts again from the top, or waits for the next
 * new song.
 */
import { INTROS, introShown } from '../intro'
const intro = introShown('live')
import { computed, ref } from 'vue'

import type { SongSummary } from '../api'
import { addLive, isNew, liveLog, startLive, stopLive } from '../live'
import { cheerLine, cheers } from '../reactions'
import { parseQuery, score } from '../search'
import { byId, current, duration, go, index, library, liveWaiting, newPlaylist, nowPlayingOpen, playAt, playing, queue, say, settings, state, time } from '../store'
import { formatTime } from '../timing'
import { makeShown } from '../make/state'
import CoverArt from './CoverArt.vue'
import GuestAccess from './GuestAccess.vue'
import GuestWayIn from './GuestWayIn.vue'
import Icon from './Icon.vue'
import { isPortable } from '../portable'

const live = settings.live
const dragging = ref(-1)
const over = ref(-1)
const find = ref('')
const startList = ref('')
const newest = ref(20)

const items = computed(() =>
  queue.value.map((id, i) => ({ i, song: byId.value.get(id) })).filter((x): x is { i: number; song: SongSummary } => !!x.song)
)
const upcoming = computed(() => items.value.filter((x) => x.i > index.value))
const played = computed(() => items.value.filter((x) => x.i < index.value).slice(-8).reverse())
const left = computed(() => upcoming.value.reduce((t, x) => t + x.song.seconds, 0) + Math.max(0, duration.value - time.value))
/** The guests' reactions to the song that plays (while this page is open). */
const cheered = computed(() => (current.value ? cheerLine(cheers[current.value.id]) : ''))
const found = computed(() => {
  const q = find.value.trim()
  if (!q) return []
  const terms = parseQuery(q)
  const context = { favorites: new Set(state.favorites) }
  return library.value
    .map((song) => ({ song, rank: score(song, terms, context) }))
    .filter((x) => x.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 12)
    .map((x) => x.song)
})

function remove(i: number): void {
  queue.value.splice(i, 1)
  if (i < index.value) index.value -= 1
}
/** Move a song of the playlist to play right after the one that plays. */
function playNext(i: number): void {
  const nowId = queue.value[index.value]
  const [moved] = queue.value.splice(i, 1)
  const at = queue.value.indexOf(nowId)
  queue.value.splice(at + 1, 0, moved)
  index.value = queue.value.indexOf(nowId)
}
function drop(to: number): void {
  const from = dragging.value
  dragging.value = over.value = -1
  if (from < 0 || from === to) return
  const nowId = queue.value[index.value]
  const [moved] = queue.value.splice(from, 1)
  queue.value.splice(from < to ? to - 1 : to, 0, moved)
  index.value = queue.value.indexOf(nowId)
}
function add(song: SongSummary, where: 'next' | 'end'): void {
  addLive([song.id], where)
  say(`${song.title} - ${where === 'next' ? 'plays next' : 'at the end'}`)
}
async function start(kind: 'queue' | 'playlist' | 'newest' | 'empty'): Promise<void> {
  if (kind === 'queue') await startLive()
  else if (kind === 'playlist') await startLive(state.playlists.find((p) => p.id === startList.value)?.songs.filter((id) => byId.value.has(id)) ?? [])
  else if (kind === 'newest') await startLive([...library.value].sort((a, b) => b.created.localeCompare(a.created)).slice(0, newest.value).map((s) => s.id))
  else {
    queue.value = []
    index.value = -1
    await startLive()
  }
}
function save(): void {
  const playlist = newPlaylist(`Live ${new Date().toLocaleString()}`, queue.value)
  say(`Saved as the playlist “${playlist.name}”`, 3000)
}
/** The party on the big screen (owner's request 2026-10-18): Now playing with only the visual, on the whole
 * screen - the guests' way in over it, as its settings say. */
function showVisual(): void {
  settings.visuals.enabled = true
  settings.npView = 'visual'
  nowPlayingOpen.value = true
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => {})
}
const ago = (at: number): string => {
  const s = Math.round((Date.now() - at) / 1000)
  return s < 60 ? `${s} s ago` : `${Math.round(s / 60)} min ago`
}
</script>

<template>
  <div class="live-page">
    <header class="head">
      <div>
        <h1><Icon name="live" :size="30" /> Live Play <span v-if="live.on" class="on-air">LIVE</span></h1>
        <p v-if="intro" class="intro">{{ INTROS.live }}</p>
        <p class="lead">A playlist that plays while you change it - and the songs ComfyUI makes now join it as soon as they are exported. Make songs at a party, and they play.</p>
      </div>
      <div class="head-right">
        <div class="head-buttons">
          <button class="primary" :disabled="!current && !queue.length" title="Only the visual, on the whole screen - for the party's big screen (Esc: back)" @click="showVisual"><Icon name="sparkles" :size="18" /> Show the visual</button>
          <button v-if="live.on" class="ghost" @click="stopLive">Stop Live Play</button>
        </div>
        <GuestWayIn />
      </div>
    </header>

    <section v-if="!live.on" class="start">
      <h3>Start</h3>
      <div class="ways">
        <button class="way" :disabled="!queue.length" @click="start('queue')">
          <b>With the queue</b><small>{{ queue.length ? `${queue.length} songs, as they are` : 'the queue is empty' }}</small>
        </button>
        <div class="way">
          <b>With a playlist</b>
          <select v-model="startList"><option value="" disabled>Choose …</option><option v-for="p in state.playlists" :key="p.id" :value="p.id">{{ p.name }} ({{ p.songs.length }})</option></select>
          <button class="ghost small" :disabled="!startList" @click="start('playlist')">Start</button>
        </div>
        <div class="way">
          <b>With the newest songs</b>
          <select v-model.number="newest"><option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">the newest {{ n }}</option></select>
          <button class="ghost small" @click="start('newest')">Start</button>
        </div>
        <button class="way" @click="start('empty')">
          <b>Empty</b><small>wait for the first song ComfyUI makes</small>
        </button>
      </div>
    </section>

    <p v-if="isPortable" class="hint shared">In a shared player Live Play is a playlist you change while it plays. Songs made in ComfyUI join it in the Plenio Player.</p>
    <section v-if="!isPortable" class="rules">
      <label class="switch"><input v-model="live.auto" type="checkbox" /> New songs from ComfyUI join by themselves</label>
      <div class="choice">
        <span>A new song goes</span>
        <label><input v-model="live.insert" type="radio" value="next" /> next</label>
        <label><input v-model="live.insert" type="radio" value="end" /> at the end</label>
        <label><input v-model="live.insert" type="radio" value="random" /> anywhere, at random</label>
      </div>
      <div class="choice">
        <span>At the end</span>
        <label><input v-model="live.atEnd" type="radio" value="again" /> from the top again</label>
        <label><input v-model="live.atEnd" type="radio" value="wait" /> wait for the next new song</label>
      </div>
      <p v-if="live.on" class="hint">Listening for new songs every few seconds{{ live.auto ? '' : ' - they are announced, add them below' }}. Export Release writes a song; a moment later it is here.</p>
    </section>
    <GuestAccess v-if="!isPortable" />

    <section v-if="live.on || queue.length" class="now">
      <div v-if="liveWaiting" class="waiting"><Icon name="live" :size="22" /> Waiting for the next new song …</div>
      <div v-else-if="current" class="playing">
        <CoverArt :song="current" :live="playing" rounded :size="200" />
        <div>
          <small>{{ playing ? 'Playing' : 'Paused' }}</small>
          <h2>{{ current.title }} <span v-if="isNew(current.id)" class="new">new</span></h2>
          <p>{{ current.other ? current.artist : current.genre }} · {{ formatTime(time) }} / {{ formatTime(duration) }}</p>
          <p v-if="cheered" :key="cheered" class="cheers" title="The guests’ reactions to this song">{{ cheered }}</p>
        </div>
      </div>
      <p class="sum">{{ upcoming.length }} to come · {{ formatTime(left) }} left <button class="ghost small" :disabled="!queue.length" @click="save"><Icon name="playlist" :size="14" /> Save as a playlist</button></p>
    </section>

    <section v-if="upcoming.length" class="list">
      <h3>Up next</h3>
      <div
        v-for="{ i, song } in upcoming"
        :key="`${i}-${song.id}`"
        class="row"
        :class="{ over: over === i, fresh: isNew(song.id) }"
        draggable="true"
        @dragstart="dragging = i"
        @dragover.prevent="over = i"
        @dragleave="over === i && (over = -1)"
        @drop.prevent="drop(i)"
        @dragend="dragging = over = -1"
      >
        <Icon class="grip" name="grip" :size="16" />
        <span class="n">{{ i - index }}</span>
        <CoverArt :song="song" rounded :size="56" />
        <span class="t"><span>{{ song.title }} <span v-if="isNew(song.id)" class="new">new</span></span><small>{{ song.other ? song.artist || 'other music' : song.genre }}</small></span>
        <span class="len">{{ formatTime(song.seconds) }}</span>
        <button class="icon-btn" title="Play now" @click="playAt(i)"><Icon name="play" :size="16" /></button>
        <button class="icon-btn" title="Play next" :disabled="i === index + 1" @click="playNext(i)"><Icon name="up" :size="16" /></button>
        <button v-if="makeShown && !isPortable" class="icon-btn again" title="A new version… - a new take of it, a new song like it, or a cover of it" @click="go(`/make/${song.id}`)"><Icon name="wand" :size="16" /></button>
        <button class="icon-btn" title="Take out of the playlist" @click="remove(i)"><Icon name="close" :size="16" /></button>
      </div>
      <div class="row end" :class="{ over: over === queue.length }" @dragover.prevent="over = queue.length" @drop.prevent="drop(queue.length)">drop here for the end</div>
    </section>

    <section class="add">
      <h3>Add songs</h3>
      <input v-model="find" class="find" placeholder="Search the library: title, genre, mood, artist …" />
      <div v-for="song in found" :key="song.id" class="row">
        <CoverArt :song="song" rounded :size="56" />
        <span class="t">{{ song.title }}<small>{{ song.other ? song.artist || 'other music' : song.genre }} · {{ formatTime(song.seconds) }}</small></span>
        <button class="ghost small" @click="add(song, 'next')">Next</button>
        <button class="ghost small" @click="add(song, 'end')">At the end</button>
      </div>
    </section>

    <section v-if="liveLog.length" class="log">
      <h3>What happened</h3>
      <p v-for="entry in liveLog" :key="`${entry.id}-${entry.at}`"><b>{{ entry.title }}</b> - {{ entry.where }} <small>{{ ago(entry.at) }}</small></p>
    </section>

    <section v-if="played.length" class="list past">
      <h3>Played</h3>
      <div v-for="{ i, song } in played" :key="`p${i}-${song.id}`" class="row">
        <CoverArt :song="song" rounded :size="56" />
        <span class="t">{{ song.title }}<small>{{ song.genre }}</small></span>
        <button v-if="makeShown && !isPortable" class="icon-btn again" title="A new version… - a new take of it, a new song like it, or a cover of it" @click="go(`/make/${song.id}`)"><Icon name="wand" :size="16" /></button>
        <button class="ghost small" title="Play it again after this one" @click="playNext(i)">Again</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.intro {
  margin: 2px 0 10px;
  color: var(--muted);
}
.live-page {
  padding: 26px 34px 40px;
  max-width: 1100px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}
.head-right {
  display: grid;
  justify-items: end;
  gap: 12px;
}
.head-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
/* narrow: the title, then the buttons under it (beside it they broke into words on a line each) */
@media (max-width: 640px) {
  .head {
    flex-direction: column;
    gap: 12px;
  }
  .head-right {
    justify-items: start;
  }
  .head-buttons {
    justify-content: flex-start;
  }
  .head-buttons button {
    white-space: nowrap;
  }
}
h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 6px;
  font: 800 34px var(--font);
}
.lead {
  color: var(--muted);
  max-width: 680px;
  margin: 0;
}
.on-air,
.new {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: #e5484d;
  color: #fff;
  font: 700 12px var(--font);
  letter-spacing: 0.6px;
  vertical-align: middle;
}
.on-air {
  animation: on-air 1.6s ease-in-out infinite;
}
.new {
  font-size: 10px;
  padding: 1px 6px;
}
@keyframes on-air {
  50% {
    opacity: 0.55;
  }
}
section {
  margin-top: 22px;
}
h3 {
  margin: 0 0 10px;
  font: 600 13px var(--font);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--muted);
}
.ways {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 10px;
}
.way {
  display: grid;
  gap: 8px;
  align-content: start;
  text-align: left;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #eee;
  font: 14px var(--font);
}
button.way {
  cursor: pointer;
}
button.way:hover:not(:disabled) {
  border-color: var(--accent);
}
.way small {
  color: var(--muted);
}
.way select,
.find {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 7px 10px;
  font: 13px var(--font);
}
.rules {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.choice {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.choice span {
  min-width: 130px;
  color: var(--muted);
}
.choice label,
.switch {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
}
input[type='radio'],
input[type='checkbox'] {
  accent-color: var(--accent);
}
.hint {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}
.playing {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 18px;
  align-items: center;
}
.playing h2 {
  margin: 4px 0;
  font: 700 26px var(--font);
}
.playing p,
.playing small {
  color: var(--muted);
  margin: 0;
}
.playing .cheers {
  margin-top: 8px;
  color: #fff;
  font-size: 17px;
  font-variant-numeric: tabular-nums;
  animation: cheer 0.35s ease-out;
}
@keyframes cheer {
  from {
    transform: scale(1.12);
    opacity: 0.4;
  }
}
.waiting {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 22px;
  border-radius: 14px;
  border: 1px dashed rgba(229, 72, 77, 0.6);
  color: #ffb4b4;
  font: 600 16px var(--font);
}
.sum {
  display: flex;
  gap: 14px;
  align-items: center;
  color: var(--muted);
  margin: 12px 0 0;
}
.row {
  display: grid;
  grid-template-columns: auto auto 40px 1fr auto auto auto auto auto;
  gap: 10px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
}
.add .row {
  grid-template-columns: 40px 1fr auto auto;
}
.past .row {
  grid-template-columns: 40px 1fr auto auto auto;
}
.again {
  color: var(--accent);
}
.row:hover {
  background: rgba(255, 255, 255, 0.04);
}
.row.over {
  border-top-color: var(--accent);
}
.row.fresh {
  background: rgba(229, 72, 77, 0.08);
}
.row.end {
  display: block;
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}
.grip {
  cursor: grab;
  color: var(--muted);
}
.n {
  width: 22px;
  text-align: right;
  color: var(--muted);
  font: 12px var(--mono);
}
.t {
  display: grid;
  min-width: 0;
  font-weight: 600;
}
.t small {
  font-weight: 400;
  color: var(--muted);
}
.len {
  color: var(--muted);
  font: 12px var(--mono);
}
.find {
  width: 100%;
  max-width: 520px;
  margin-bottom: 8px;
}
.log p {
  margin: 4px 0;
}
.log small {
  color: var(--muted);
}
</style>
