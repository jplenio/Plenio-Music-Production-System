<script setup lang="ts">
// The songs Plenio made with the plug-in: open one in this instance (its takes stay in the library).
import { computed, onMounted, ref } from 'vue'

import { act, refreshLibrary, store } from '../store'
import Icon from './Icon.vue'

const emit = defineEmits<{ close: [] }>()
const query = ref('')
const opening = ref('')

const songs = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return [...store.library]
    .sort((a, b) => b.modified - a.modified)
    .filter((s) => words.every((w) => `${s.title} ${s.kind}`.toLowerCase().includes(w)))
})

function when(seconds: number): string {
  return new Date(seconds * 1000).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function open(id: string): Promise<void> {
  opening.value = id
  const ok = await act('song.open', { id })
  opening.value = ''
  if (ok) emit('close')
}

onMounted(refreshLibrary)
</script>

<template>
  <div class="overlay" @mousedown.self="emit('close')" @keydown.esc="emit('close')">
    <div class="dialog library" role="dialog" aria-modal="true">
      <header>
        <h2>Your songs</h2>
        <input v-model="query" class="input search" type="search" placeholder="Find …" spellcheck="false" />
        <button class="btn ghost icon" title="Close" @click="emit('close')"><Icon name="close" :size="16" /></button>
      </header>
      <div class="body">
        <p class="where muted"><Icon name="folder" :size="13" />{{ store.settings?.library }}</p>
        <div v-if="songs.length" class="list">
          <button v-for="s in songs" :key="s.id" class="row" :class="{ current: store.song?.id === s.id }" :disabled="!!opening" @click="open(s.id)">
            <span v-if="s.cover" class="glyph art"><img :src="s.cover" alt="" /></span>
            <span v-else class="glyph" :class="s.kind"><Icon :name="s.kind === 'cover' ? 'cover' : 'music'" :size="16" /></span>
            <span class="what">
              <b>{{ s.title || 'Untitled' }}</b>
              <span class="muted">{{ s.kind === 'cover' ? 'Cover' : 'Song' }} · {{ s.takes }} {{ s.takes === 1 ? 'take' : 'takes' }} · {{ when(s.modified) }}</span>
            </span>
            <span v-if="s.stars" class="stars"><Icon name="star" :size="11" />{{ s.stars }}</span>
            <span v-if="store.song?.id === s.id" class="here">open here</span>
            <span v-else-if="opening === s.id" class="here">opening …</span>
          </button>
        </div>
        <p v-else class="empty muted">{{ store.library.length ? 'No song matches.' : 'No songs yet: the songs you make land here.' }}</p>
      </div>
      <footer>
        <span class="muted hint">Songs open without ComfyUI: playing and editing always work.</span>
        <button class="btn" @click="emit('close')">Close</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.library {
  width: min(640px, calc(100vw - 32px));
  height: min(600px, calc(100vh - 32px));
}
.search {
  width: 200px;
}
.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.where {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.row:hover:not(:disabled) {
  background: var(--bg-raised);
  border-color: var(--line);
}
.row.current {
  border-color: rgba(176, 92, 255, 0.4);
}
.glyph {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  background: var(--gradient);
  color: white;
  flex: none;
}
.glyph.cover {
  background: var(--gradient-warm);
}
/* the song's cover art */
.glyph.art {
  background: var(--bg-sunken);
  overflow: hidden;
}
.glyph.art img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.what {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.what b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.what .muted {
  font-size: 12px;
}
.stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--amber);
  font-size: 12px;
}
.here {
  font-size: 11.5px;
  color: var(--accent);
}
.empty {
  margin: 40px auto;
}
.hint {
  flex: 1;
  font-size: 12px;
}
</style>
