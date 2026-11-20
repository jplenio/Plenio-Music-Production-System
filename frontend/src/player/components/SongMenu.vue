<script setup lang="ts">
/** The menu of a song (right click or ⋯): play next, add to the queue or a playlist, a radio of songs alike,
 * favourite, open; in a shared player, save its sound out of the file. */
import { computed, ref } from 'vue'

import type { SongSummary } from '../api'
import { vFocus } from '../focus'
import { similarSongs } from '../similar'
import { addToPlaylist, enqueue, go, isFavorite, library, newPlaylist, openInComfyUI, playSongs, removing, say, settings, songTags, state, toggleFavorite, videoFor } from '../store'
import { makeShown } from '../make/state'
import { isPortable } from '../portable'
import { fileNames, songFile, soundEnding } from '../portableExport'
import { saveBlob } from '../zip'
import { isPhone } from '../layout'
import { canRemoveSongs } from '../account'
import BottomSheet from './BottomSheet.vue'
import Icon from './Icon.vue'
import TagEditor from './TagEditor.vue'

const props = defineProps<{ song: SongSummary; x: number; y: number }>()
const emit = defineEmits<{ close: [] }>()
const naming = ref(false)
const tagging = ref(false)
const place = computed(() => ({ left: `${Math.min(props.x, window.innerWidth - 300)}px`, top: `${Math.min(props.y, window.innerHeight - 420)}px` }))
function songsTagged(tag: string): void {
  settings.filters.all = { query: '', chips: [`tag:"${tag}"`] }
  go('/')
  done()
}
const name = ref('')

function done(): void {
  emit('close')
}
function comfy(): void {
  done()
  openInComfyUI(props.song).then(
    () => say('The song opened in ComfyUI', 2600),
    (error: unknown) => say(error instanceof Error ? error.message : String(error), 6000)
  )
}
function radio(): void {
  void playSongs([props.song.id, ...similarSongs(props.song, library.value, 40).map((s) => s.id)])
  done()
}
/** The song's sound as the shared player carries it (MP3 or M4A), saved by the browser. */
async function saveSound(): Promise<void> {
  done()
  const [file] = fileNames([props.song], ['audio'], false)
  const data = await songFile(props.song.id, 'audio')
  if (data) saveBlob(data, file.name)
  else say('The sound is not there yet - the file is still being read', 4000)
}
function create(): void {
  addToPlaylist(newPlaylist(name.value || props.song.title), [props.song.id])
  done()
}
</script>

<template>
  <!-- a phone: a sheet from the bottom; elsewhere the menu where the click was -->
  <component :is="isPhone ? BottomSheet : 'div'" v-bind="isPhone ? { title: song.title } : { class: 'veil' }" v-on="isPhone ? { close: done } : { click: done, contextmenu: (e: Event) => { e.preventDefault(); done() } }">
    <div class="menu" :class="{ inline: isPhone }" :style="isPhone ? undefined : place" @click.stop>
      <p v-if="!isPhone" class="head">{{ song.title }}</p>
      <button @click="enqueue([song.id], true); done()">Play next</button>
      <button @click="enqueue([song.id]); done()">Add to the queue</button>
      <button @click="radio">Start a radio of songs alike</button>
      <button @click="toggleFavorite(song.id); done()">{{ isFavorite(song.id) ? 'Remove from favourites' : 'Add to favourites' }}</button>
      <button @click="go(`/song/${song.id}`); done()">Open the song’s page</button>
      <button v-if="makeShown && !isPortable" @click="go(`/make/${song.id}`); done()"><Icon name="wand" :size="15" /> A new version…</button>
      <button :class="{ open: tagging }" @click="tagging = !tagging">Tags…<small v-if="songTags(song.id).length">{{ songTags(song.id).map((t) => `#${t}`).join(' ') }}</small></button>
      <div v-if="tagging" class="tags"><TagEditor :ids="[song.id]" autofocus @filter="songsTagged" /></div>
      <button v-if="!song.other && !isPortable" @click="comfy">Open in ComfyUI</button>
      <button v-if="!isPortable" @click="videoFor = song; done()">Save as a video…</button>
      <button v-if="isPortable" @click="saveSound">Save its sound ({{ soundEnding().toUpperCase() }})</button>
      <button v-if="!isPortable && canRemoveSongs" class="remove" @click="removing = song; done()">Remove from the library…</button>
      <p class="head small">Add to a playlist</p>
      <button v-for="p in state.playlists" :key="p.id" @click="addToPlaylist(p, [song.id]); done()">
        <i class="dot" :style="{ background: `hsl(${p.hue ?? 260} 80% 60%)` }" />{{ p.name }}
      </button>
      <form v-if="naming" class="new" @submit.prevent="create">
        <input v-model="name" v-focus placeholder="Name of the playlist" />
        <button type="submit">Create</button>
      </form>
      <button v-else class="plus" @click="naming = true">+ New playlist…</button>
    </div>
  </component>
</template>

<style scoped>
.veil {
  position: fixed;
  inset: 0;
  z-index: 80;
}
.menu.inline {
  position: static;
  width: auto;
  max-height: none;
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
  animation: none;
}
.menu.inline button {
  min-height: 46px;
  font-size: 15px;
}
.menu {
  position: fixed;
  width: 290px;
  max-height: 420px;
  overflow-y: auto;
  background: rgba(20, 18, 30, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  animation: pop 0.16s ease-out;
}
.head {
  margin: 4px 8px 6px;
  font: 600 12px var(--font);
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.head.small {
  color: var(--muted);
  font-weight: 500;
  font-size: 11px;
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: 0;
  background: none;
  color: #ddd;
  font: 13px var(--font);
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.new {
  display: flex;
  gap: 4px;
  padding: 4px;
}
.new input {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 8px;
  padding: 5px 8px;
}
.new button {
  width: auto;
}
.plus {
  color: var(--accent);
}
.remove {
  color: #ff8f8f;
}
button small {
  margin-left: auto;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--accent);
  font-size: 11px;
}
.tags {
  padding: 4px 6px 8px;
}
.tags :deep(button) {
  width: auto;
}
.tags :deep(.add input) {
  width: 130px;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
