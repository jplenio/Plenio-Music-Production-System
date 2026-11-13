<script setup lang="ts">
import { onMounted } from 'vue'

import { act, online, refreshLibrary, store } from '../store'
import Icon from './Icon.vue'

defineEmits<{ new: []; cover: []; library: [] }>()

onMounted(refreshLibrary)

function ago(seconds: number): string {
  const d = Date.now() / 1000 - seconds
  if (d < 3600) return `${Math.max(1, Math.round(d / 60))} min ago`
  if (d < 86400) return `${Math.round(d / 3600)} h ago`
  return new Date(seconds * 1000).toLocaleDateString()
}
</script>

<template>
  <main class="welcome">
    <section class="hero">
      <h1>Make a song for this track</h1>
      <p class="muted">
        Plenio writes, composes and sings it on your graphics card. Every take lands here, plays in time with your
        project, and stays yours to change: the words, the melody, the chords.
      </p>
      <div class="cards">
        <button class="card new" :disabled="!online()" @click="$emit('new')">
          <span class="glyph"><Icon name="sparkle" :size="26" /></span>
          <span class="t">New song</span>
          <span class="d">A style, an idea or your own lyrics</span>
        </button>
        <button class="card cover" :disabled="!online()" @click="$emit('cover')">
          <span class="glyph"><Icon name="cover" :size="26" /></span>
          <span class="t">New cover</span>
          <span class="d">A recording in another style</span>
        </button>
        <button class="card open" @click="$emit('library')">
          <span class="glyph"><Icon name="library" :size="26" /></span>
          <span class="t">Open a song</span>
          <span class="d">From your Plenio songs, also offline</span>
        </button>
      </div>
      <p v-if="!online()" class="hint">To make new songs, ComfyUI with Plenio has to run. Songs you made open and play without it.</p>
    </section>
    <section v-if="store.library.length" class="recent">
      <div class="label">Recent songs</div>
      <button v-for="s in store.library.slice(0, 5)" :key="s.id" class="row" @click="act('song.open', { id: s.id })">
        <Icon :name="s.kind === 'cover' ? 'cover' : 'music'" :size="15" />
        <span class="name">{{ s.title || 'Untitled' }}</span>
        <span class="muted">{{ s.takes }} {{ s.takes === 1 ? 'take' : 'takes' }}</span>
        <span v-if="s.stars" class="stars"><Icon name="star" :size="11" />{{ s.stars }}</span>
        <span class="when muted">{{ ago(s.modified) }}</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.welcome {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px 32px;
  gap: 34px;
}
.hero {
  max-width: 820px;
  text-align: center;
}
h1 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 650;
  margin: 0 0 10px;
  background: linear-gradient(90deg, #fff, #e6d9ff 60%, #ffc2dc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero p {
  max-width: 600px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 1.6;
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 30px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 20px 18px 18px;
  text-align: left;
  border-radius: 14px;
  border: 1px solid var(--line-strong);
  background: linear-gradient(180deg, #1d1929, #171421);
  cursor: pointer;
  transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;
}
.card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #5a4b85;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
}
.card:disabled {
  opacity: 0.45;
  cursor: default;
}
.glyph {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  margin-bottom: 6px;
  color: white;
}
.new .glyph {
  background: var(--gradient);
}
.cover .glyph {
  background: var(--gradient-warm);
}
.open .glyph {
  background: #2c2640;
  color: #cfc4ef;
}
.t {
  font-size: 15px;
  font-weight: 600;
}
.d {
  color: var(--text-dim);
  font-size: 12.5px;
}
.hint {
  margin-top: 18px !important;
  color: var(--amber);
  font-size: 12.5px !important;
}
.recent {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.recent .label {
  margin-bottom: 6px;
}
.row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.row:hover {
  background: var(--bg-raised);
  border-color: var(--line);
}
.name {
  flex: 1;
  font-weight: 550;
}
.stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--amber);
  font-size: 12px;
}
.when {
  width: 90px;
  text-align: right;
  font-size: 12px;
}
</style>
