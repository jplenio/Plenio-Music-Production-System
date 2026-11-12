<script setup lang="ts">
/** All playlists: the smart lists first (favourites, most played, recently played, never played), then
 * the listener's own, each a mosaic of its covers; a new one in place. */
import { computed, ref } from 'vue'

import type { Playlist, SongSummary } from '../api'
import { byId, go, library, newPlaylist, playSongs, route, state } from '../store'
import { moveWith } from '../layout'
import { nextTick } from 'vue'
import { countOf, formatTime } from '../timing'
import CoverArt from './CoverArt.vue'
import Icon from './Icon.vue'

/** A playlist opened from its tile: its mosaic moves to the page's head (layout.ts moveWith). */
function openPlaylist(id: string, tile: Element): void {
  moveWith(tile.querySelector('.mosaic'), 'playlist-mosaic', async () => {
    go(`/playlist/${id}`)
    route.value = `/playlist/${id}`
    await nextTick()
  })
}
const name = ref('')

const smart = computed(() => {
  const all = library.value
  const top = all.filter((s) => state.plays[s.id]).sort((a, b) => (state.plays[b.id] ?? 0) - (state.plays[a.id] ?? 0))
  const recent = all.filter((s) => state.last_played[s.id]).sort((a, b) => (state.last_played[b.id] ?? '').localeCompare(state.last_played[a.id] ?? ''))
  const fresh = all.filter((s) => !state.plays[s.id])
  return [
    { path: '/favorites', name: 'Favourites', icon: 'heart', hue: 340, songs: state.favorites.map((id) => byId.value.get(id)).filter((s): s is SongSummary => !!s) },
    { path: '/top', name: 'Most played', icon: 'star', hue: 40, songs: top },
    { path: '/recent', name: 'Recently played', icon: 'clock', hue: 190, songs: recent },
    { path: '', name: 'Never played', icon: 'sparkles', hue: 120, songs: fresh },
  ]
})
const own = computed(() =>
  state.playlists.map((p: Playlist) => ({ p, songs: p.songs.map((id) => byId.value.get(id)).filter((s): s is SongSummary => !!s) }))
)
const seconds = (songs: SongSummary[]): number => songs.reduce((t, s) => t + s.seconds, 0)

function create(): void {
  const playlist = newPlaylist(name.value)
  name.value = ''
  go(`/playlist/${playlist.id}`)
}
</script>

<template>
  <div class="pls">
    <h1>Playlists</h1>
    <h3>Made for you</h3>
    <div class="grid">
      <article v-for="list in smart" :key="list.name" class="tile" :style="{ '--hue': list.hue }" @click="list.path ? go(list.path) : playSongs(list.songs.map((s) => s.id), 0)">
        <div class="mosaic smart">
          <Icon :name="list.icon" :size="46" />
        </div>
        <button class="play" :disabled="!list.songs.length" @click.stop="playSongs(list.songs.map((s) => s.id), 0)"><Icon name="play" :size="20" /></button>
        <b>{{ list.name }}</b>
        <small>{{ countOf(list.songs.length, 'song') }} · {{ formatTime(seconds(list.songs)) }}</small>
      </article>
    </div>
    <h3>Yours</h3>
    <div class="grid">
      <article v-for="{ p, songs } in own" :key="p.id" class="tile" :style="{ '--hue': p.hue ?? 260 }" @click="openPlaylist(p.id, $event.currentTarget as Element)">
        <div class="mosaic" :class="`n${Math.min(4, songs.length)}`">
          <CoverArt v-for="s in songs.slice(0, 4)" :key="s.id" :song="s" :size="120" />
          <Icon v-if="!songs.length" name="playlist" :size="46" />
        </div>
        <button class="play" :disabled="!songs.length" @click.stop="playSongs(songs.map((s) => s.id), 0, p.id)"><Icon name="play" :size="20" /></button>
        <b>{{ p.name }}</b>
        <small>{{ countOf(songs.length, 'song') }} · {{ formatTime(seconds(songs)) }}</small>
      </article>
      <form class="tile new" @submit.prevent="create">
        <div class="mosaic"><Icon name="plus" :size="46" /></div>
        <input v-model="name" placeholder="New playlist …" />
        <small>Enter to create</small>
      </form>
    </div>
  </div>
</template>

<style scoped>
.pls {
  padding: 26px 34px 40px;
}
h1 {
  font: 800 34px var(--font);
  margin: 6px 0 16px;
}
h3 {
  font: 600 12px var(--font);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
  margin: 22px 0 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
}
/* a phone: two playlists side by side (one each filled the whole screen) */
@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: transform 0.25s, background 0.25s;
}
.tile:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.06);
}
.mosaic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  place-items: center;
  margin-bottom: 8px;
  background: linear-gradient(135deg, hsl(var(--hue, 260) 70% 45%), hsl(calc(var(--hue, 260) + 50) 70% 22%));
  color: rgba(255, 255, 255, 0.85);
}
.mosaic.smart,
.mosaic.n0,
.new .mosaic {
  grid-template-columns: 1fr;
}
.mosaic.n1 {
  grid-template-columns: 1fr;
}
.mosaic.n3 > :first-child {
  grid-row: span 2;
}
.mosaic > :deep(*) {
  width: 100%;
  height: 100%;
}
.mosaic > svg {
  width: 46px;
  height: 46px;
}
.play {
  position: absolute;
  right: 20px;
  top: calc(100% - 100px);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 0;
  background: var(--accent);
  color: #0b0a12;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.2s, transform 0.2s;
}
.tile:hover .play {
  opacity: 1;
  transform: none;
}
b {
  font: 600 14px var(--font);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
small {
  color: var(--muted);
  font-size: 12px;
}
.new {
  cursor: default;
}
.new .mosaic {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
}
.new input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #fff;
  padding: 6px 8px;
  font: 13px var(--font);
}
</style>
