<script setup lang="ts">
// Choosing a chord as YuE2 writes it: a root, one of fifteen qualities, a bass if wanted.
import { computed, ref } from 'vue'

import { store } from '../store'

const props = defineProps<{ name: string; left: number; top: number }>()
const emit = defineEmits<{ pick: [name: string]; remove: []; close: [] }>()

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const QUALITIES = ['', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', '6', 'm6', 'dim', 'aug', 'dim7', 'm7b5', '7sus4', 'm(maj7)']
const roots = computed(() => (store.settings?.flatKeys ? FLATS : SHARPS))

function parse(name: string): { root: string; quality: string; bass: string } {
  const m = /^([A-G](?:bb|##|b|#)?)(.*?)(?:\/([A-G](?:bb|##|b|#)?))?$/.exec(name)
  if (!m) return { root: 'C', quality: '', bass: '' }
  return { root: m[1], quality: QUALITIES.includes(m[2]) ? m[2] : '', bass: m[3] ?? '' }
}

const chosen = ref(parse(props.name))
const symbol = computed(() => `${chosen.value.root}${chosen.value.quality}${chosen.value.bass ? `/${chosen.value.bass}` : ''}`)

function setRoot(r: string): void {
  chosen.value.root = r
}
function setQuality(q: string): void {
  chosen.value.quality = q
}
</script>

<template>
  <div class="picker" :style="{ left: `${left}px`, top: `${top}px` }" @mousedown.stop>
    <div class="head">
      <span class="now">{{ symbol }}</span>
      <button class="btn small ghost" @click="emit('close')">Cancel</button>
      <button class="btn small primary" @click="emit('pick', symbol)">Use</button>
    </div>
    <div class="label">Root</div>
    <div class="grid roots">
      <button v-for="r in roots" :key="r" :class="{ on: chosen.root === r }" @click="setRoot(r)">{{ r }}</button>
    </div>
    <div class="label">Chord</div>
    <div class="grid qualities">
      <button v-for="q in QUALITIES" :key="q" :class="{ on: chosen.quality === q }" @click="setQuality(q)">{{ q === '' ? 'maj' : q }}</button>
    </div>
    <div class="row">
      <span class="label">Bass</span>
      <select v-model="chosen.bass" class="select small">
        <option value="">as the chord</option>
        <option v-for="r in roots" :key="r" :value="r">/{{ r }}</option>
      </select>
      <div class="spacer" />
      <button class="btn small danger" @click="emit('remove')">Remove</button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  position: absolute;
  z-index: 30;
  width: 318px;
  padding: 12px;
  border-radius: 12px;
  background: #1f1a2c;
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.now {
  flex: 1;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 650;
}
.grid {
  display: grid;
  gap: 4px;
}
.roots {
  grid-template-columns: repeat(6, 1fr);
}
.qualities {
  grid-template-columns: repeat(5, 1fr);
}
.grid button {
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--bg-sunken);
  cursor: pointer;
  font-size: 12.5px;
}
.grid button:hover {
  border-color: var(--line-strong);
  background: var(--bg-hover);
}
.grid button.on {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: white;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.select.small {
  width: auto;
  height: 28px;
  padding: 3px 26px 3px 8px;
}
.spacer {
  flex: 1;
}
</style>
