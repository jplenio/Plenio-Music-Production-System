<script setup lang="ts">
/**
 * A playlist: its name (renamed in place), its colour and its own visual, its songs in order (drag to
 * reorder, remove), play and shuffle - and songs to add, found by the same search as the library.
 */
import { computed, ref } from 'vue'

import type { SongSummary } from '../api'
import { vFocus } from '../focus'
import { byId, current, deletePlaylist, go, library, playSongs, playing, state, shareFor } from '../store'
import { countOf, formatTime } from '../timing'
import { lyricsSnippet, parseQuery, score } from '../search'
import { makeShown } from '../make/state'
import { allPresets } from '../visuals/presets'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'
import { isPortable } from '../portable'

const props = defineProps<{ id: string }>()

const playlist = computed(() => state.playlists.find((p) => p.id === props.id) ?? null)
const songs = computed<SongSummary[]>(() => (playlist.value?.songs ?? []).map((id) => byId.value.get(id)).filter((s): s is SongSummary => !!s))
const missing = computed(() => (playlist.value?.songs.length ?? 0) - songs.value.length)
const total = computed(() => songs.value.reduce((t, s) => t + s.seconds, 0))
const covers = computed(() => songs.value.slice(0, 4))

const renaming = ref(false)
const adding = ref(false)
const find = ref('')
const dragging = ref(-1)
const over = ref(-1)
const confirmDelete = ref(false)

const candidates = computed(() => {
  const terms = parseQuery(find.value)
  const inside = new Set(playlist.value?.songs ?? [])
  return library.value
    .filter((s) => !inside.has(s.id) && (!terms.length || score(s, terms, { favorites: new Set(state.favorites) }) > 0))
    .slice(0, 60)
    .map((s) => ({ song: s, snippet: lyricsSnippet(s, terms) }))
})

function play(start = 0, shuffled = false): void {
  const ids = songs.value.map((s) => s.id)
  if (!ids.length) return
  const first = shuffled ? Math.floor(Math.random() * ids.length) : start
  void playSongs(ids, first, props.id)
}
function remove(i: number): void {
  playlist.value?.songs.splice(playlist.value.songs.indexOf(songs.value[i].id), 1)
}
function add(id: string): void {
  playlist.value?.songs.push(id)
}
function drop(to: number): void {
  const list = playlist.value
  const from = dragging.value
  dragging.value = over.value = -1
  if (!list || from < 0 || from === to) return
  const ids = songs.value.map((s) => s.id)
  const [moved] = ids.splice(from, 1)
  ids.splice(to, 0, moved)
  list.songs.splice(0, list.songs.length, ...ids)
}
function rename(event: Event): void {
  const name = (event.target as HTMLInputElement).value.trim()
  if (playlist.value && name) playlist.value.name = name
  renaming.value = false
}
function removeAll(): void {
  deletePlaylist(props.id)
  go('/playlists')
}
</script>

<template>
  <div v-if="playlist" class="pl" :style="{ '--hue': playlist.hue ?? 260 }">
    <section class="head">
      <div class="mosaic" :class="`n${covers.length}`" style="view-transition-name: playlist-mosaic">
        <CoverArt v-for="s in covers" :key="s.id" :song="s" :size="160" />
        <div v-if="!covers.length" class="blank"><Icon name="playlist" :size="54" /></div>
      </div>
      <div class="text">
        <small>Playlist</small>
        <input v-if="renaming" v-focus class="name-input" :value="playlist.name" @blur="rename" @keydown.enter="rename" @keydown.esc="renaming = false" />
        <h1 v-else title="Click to rename" @click="renaming = true">{{ playlist.name }}</h1>
        <p class="meta">{{ countOf(songs.length, 'song') }} · {{ formatTime(total) }}<span v-if="missing"> · {{ missing }} not in this library</span></p>
        <div class="actions">
          <button class="primary" :disabled="!songs.length" @click="play()"><Icon name="play" /> Play</button>
          <button class="ghost" :disabled="!songs.length" @click="play(0, true)"><Icon name="shuffle" /> Shuffle</button>
          <button class="ghost" :class="{ on: adding }" @click="adding = !adding"><Icon name="plus" /> Add songs</button>
          <button v-if="!isPortable" class="ghost" :disabled="!songs.length" title="This playlist as one HTML file that plays by itself - to send to others" @click="shareFor = { songs: playlist.songs, title: playlist.name }"><Icon name="download" /> Share…</button>
          <label class="visual" title="The visual for this playlist (a song’s own visual still wins)">
            <Icon name="sparkles" :size="16" />
            <select :value="playlist.visual ?? ''" @change="playlist.visual = ($event.target as HTMLSelectElement).value">
              <option value="">Visual: as set</option>
              <option v-for="p in allPresets()" :key="p.id" :value="p.id">Visual: {{ p.name }}</option>
            </select>
          </label>
          <label class="hue" title="Colour"><input v-model.number="playlist.hue" type="range" min="0" max="359" /></label>
          <button v-if="!confirmDelete" class="icon-btn" title="Delete the playlist" @click="confirmDelete = true"><Icon name="trash" /></button>
          <button v-else class="ghost danger" @click="removeAll">Delete “{{ playlist.name }}”?</button>
        </div>
      </div>
    </section>

    <section v-if="adding" class="adder">
      <label class="search"><Icon name="search" /><input v-model="find" v-focus placeholder="Find songs to add …" /></label>
      <div class="cands">
        <button v-for="{ song, snippet } in candidates" :key="song.id" class="cand" @click="add(song.id)">
          <CoverArt :song="song" rounded :size="56" />
          <span class="t">{{ song.title }}<small>{{ snippet ? `“${snippet}”` : song.genre }}</small></span>
          <Icon name="plus" :size="16" />
        </button>
        <p v-if="!candidates.length" class="hint">Every song that matches is in the playlist already.</p>
      </div>
    </section>

    <ol class="rows" :class="{ remaking: makeShown && !isPortable }">
      <li
        v-for="(song, i) in songs"
        :key="song.id"
        draggable="true"
        :class="{ now: current?.id === song.id, over: over === i, dragging: dragging === i }"
        @dragstart="dragging = i"
        @dragover.prevent="over = i"
        @dragleave="over === i && (over = -1)"
        @drop.prevent="drop(i)"
        @dragend="dragging = over = -1"
        @dblclick="play(i)"
      >
        <span class="n">
          <span v-if="current?.id === song.id && playing" class="eq"><i /><i /><i /></span>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <button class="art" @click="play(i)"><CoverArt :song="song" rounded :size="56" /><Icon name="play" class="ov" :size="16" /></button>
        <span class="title"><a @click="go(`/song/${song.id}`)">{{ song.title }}</a><small>{{ song.genre }}</small></span>
        <span class="mood">{{ song.mood }}</span>
        <span class="len">{{ formatTime(song.seconds) }}</span>
        <button v-if="makeShown && !isPortable" class="icon-btn again" title="A new version… - a new take of it, a new song like it, or a cover of it" @click="go(`/make/${song.id}`)"><Icon name="wand" :size="16" /></button>
        <button class="icon-btn rm" title="Remove from the playlist" @click="remove(i)"><Icon name="close" :size="16" /></button>
      </li>
    </ol>
    <p v-if="!songs.length" class="hint empty">Empty - add songs with “Add songs”, or from any song’s ⋯ menu.</p>
  </div>
  <div v-else class="pl missing">
    <p>There is no such playlist.</p>
    <button class="ghost" @click="go('/playlists')">All playlists</button>
  </div>
</template>

<style scoped>
.pl {
  padding: 26px 34px 40px;
  --pl: hsl(var(--hue) 80% 62%);
}
.head {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 30px;
  align-items: end;
  padding: 24px;
  margin: -6px -6px 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, hsl(var(--hue) 70% 40% / 0.45), transparent 70%);
}
.mosaic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
  background: hsl(var(--hue) 50% 20%);
}
.mosaic.n1 {
  grid-template-columns: 1fr;
}
.mosaic.n3 > :first-child {
  grid-row: span 2;
}
.blank {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.6);
}
small {
  font: 700 11px var(--font);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--pl);
}
h1 {
  font: 800 clamp(30px, 4vw, 56px) / 1.05 var(--font);
  margin: 8px 0;
  cursor: text;
}
.name-input {
  font: 800 clamp(30px, 4vw, 56px) / 1.05 var(--font);
  margin: 8px 0;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--pl);
  border-radius: 10px;
  color: #fff;
  width: 100%;
}
.meta {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.visual {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}
.visual select {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 7px 8px;
  font: 13px var(--font);
}
.hue input {
  width: 90px;
  accent-color: var(--pl);
}
.danger {
  color: #ff7a7a;
  border-color: #ff7a7a;
}
.adder {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  margin-bottom: 12px;
}
.search input {
  flex: 1;
  border: 0;
  background: none;
  outline: none;
  color: #fff;
  font: 14px var(--font);
}
.cands {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}
.cand {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 10px;
  align-items: center;
  text-align: left;
  border: 0;
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  border-radius: 10px;
  padding: 5px 10px 5px 5px;
  cursor: pointer;
}
.cand:hover {
  background: hsl(var(--hue) 60% 40% / 0.35);
}
.cand .t {
  font: 13px var(--font);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cand small,
.title small {
  display: block;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  color: var(--muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rows li {
  display: grid;
  grid-template-columns: 34px 44px minmax(0, 2fr) minmax(0, 1fr) 60px 36px;
  gap: 12px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: background 0.15s;
}
/* a column for A new version… (the wand) when songs can be made */
.rows.remaking li {
  grid-template-columns: 34px 44px minmax(0, 2fr) minmax(0, 1fr) 60px 36px 36px;
}
.rows li:hover {
  background: rgba(255, 255, 255, 0.05);
}
.rows li.now {
  background: hsl(var(--hue) 60% 40% / 0.25);
}
.rows li.over {
  border-top-color: var(--pl);
}
.rows li.dragging {
  opacity: 0.4;
}
.n {
  text-align: center;
  font: 13px var(--mono);
  color: var(--muted);
}
.art {
  position: relative;
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
}
.ov {
  position: absolute;
  inset: 0;
  margin: auto;
  color: #fff;
  opacity: 0;
  filter: drop-shadow(0 1px 3px #000);
}
.art:hover .ov {
  opacity: 1;
}
.title {
  min-width: 0;
}
.title a {
  display: block;
  color: #fff;
  cursor: pointer;
  font: 600 14px var(--font);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.title a:hover {
  color: var(--pl);
}
.mood {
  color: var(--muted);
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.len {
  font: 12px var(--mono);
  color: var(--muted);
  text-align: right;
}
.rm {
  opacity: 0;
}
.again {
  opacity: 0;
  color: var(--accent);
}
.rows li:hover .rm,
.rows li:hover .again {
  opacity: 1;
}
.eq {
  display: inline-flex;
  gap: 2px;
  align-items: flex-end;
  height: 14px;
}
.eq i {
  width: 3px;
  background: var(--pl);
  animation: eq 0.9s ease-in-out infinite;
}
.eq i:nth-child(2) {
  animation-delay: -0.3s;
}
.eq i:nth-child(3) {
  animation-delay: -0.6s;
}
.hint {
  color: var(--muted);
  font-size: 13px;
}
.empty {
  text-align: center;
  padding: 30px;
}
.missing {
  text-align: center;
  color: var(--muted);
  padding-top: 80px;
}
@keyframes eq {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 14px;
  }
}
@media (max-width: 760px) {
  .head {
    grid-template-columns: 1fr;
  }
  .rows li {
    grid-template-columns: 30px 40px 1fr 50px 30px;
  }
  .rows.remaking li {
    grid-template-columns: 30px 40px 1fr 50px 30px 30px;
  }
  .mood {
    display: none;
  }
}
</style>
