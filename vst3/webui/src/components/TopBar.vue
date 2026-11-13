<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { act, store } from '../store'
import Icon from './Icon.vue'


const editing = ref(false)
const title = ref('')
const field = ref<HTMLInputElement | null>(null)

/** "1.5.1" older than "1.6.0" (the first three numbers; "1.6.0-dev" counts as 1.6.0). */
function older(version: string, than: string): boolean {
  const a = version.split(/[.-]/).map((x) => parseInt(x, 10) || 0)
  const b = than.split(/[.-]/).map((x) => parseInt(x, 10) || 0)
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) < (b[i] ?? 0)
  return false
}

// a Plenio that makes songs, but not yet everything the plug-in can use: what a newer one brings, and how to get it
const outdated = computed(() => {
  const c = store.connection
  if (!c || c.state !== 'connected') return false
  return !c.features.includes('stems') || !c.features.includes('bars') || (!!c.recommended && older(c.plenio, c.recommended))
})
const showUpdate = ref(false)
const offline = computed(() => store.connection?.state === 'offline')
const emit = defineEmits<{ new: []; library: []; settings: [] }>()
// the pill is the way to what it says: what a newer Plenio brings, or the settings when no studio answers
function statusClicked(): void {
  if (outdated.value) showUpdate.value = !showUpdate.value
  else if (offline.value) emit('settings')
}
function closeUpdate(e: MouseEvent): void {
  if (!(e.target as HTMLElement).closest('.status-wrap')) showUpdate.value = false
}
onMounted(() => document.addEventListener('mousedown', closeUpdate))
onBeforeUnmount(() => document.removeEventListener('mousedown', closeUpdate))

const status = computed(() => {
  const c = store.connection
  if (!c) return { tone: 'wait', text: '…' }
  if (c.state === 'connected') return { tone: outdated.value ? 'warn' : 'ok', text: `Plenio ${c.plenio}` }
  if (c.state === 'starting') return { tone: 'wait', text: 'Starting ComfyUI …' }
  if (c.state === 'searching') return { tone: 'wait', text: 'Looking for ComfyUI …' }
  if (c.problem === 'token') return { tone: 'warn', text: 'Token needed' }
  return { tone: 'off', text: 'Studio offline' }
})

async function rename(): Promise<void> {
  if (!store.song) return
  editing.value = true
  title.value = store.song.title
  await nextTick()
  field.value?.select()
}

async function commit(): Promise<void> {
  if (!editing.value) return
  editing.value = false
  const t = title.value.trim()
  if (store.song && t && t !== store.song.title) await act('song.rename', { title: t })
}
</script>

<template>
  <header class="bar">
    <div class="brand">
      <img src="/plenio-icon.png" alt="" class="logo" />
      <span class="name">Plenio</span>
    </div>
    <div v-if="store.song" class="song">
      <span class="sep">/</span>
      <input
        v-if="editing"
        ref="field"
        v-model="title"
        class="input title-edit"
        @keydown.enter="commit"
        @keydown.esc="editing = false"
        @blur="commit"
      />
      <button v-else class="title" title="Rename the song" @click="rename">
        {{ store.song.title }}
        <Icon name="pen" :size="13" class="pen" />
      </button>
      <span v-if="store.song.kind === 'cover'" class="kind">cover</span>
    </div>
    <div class="spacer" />
    <div class="status-wrap">
      <button
        class="status"
        :class="[status.tone, { clickable: outdated || offline }]"
        :title="outdated ? 'A newer Plenio brings more: click to see what and how' : store.connection?.message"
        @click="statusClicked"
      >
        <span class="light" />
        {{ status.text }}
        <span v-if="outdated" class="badge">update</span>
      </button>
      <div v-if="showUpdate && outdated" class="update">
        <b>Plenio {{ store.connection?.recommended }} brings more</b>
        <p>
          Your Plenio {{ store.connection?.plenio }} makes songs. From {{ store.connection?.recommended }} on, every take also
          comes with its stems and with its bars as measured in the take, so the tempo map fits the song.
        </p>
        <ol>
          <li>In ComfyUI: <i>Manager › Custom Nodes Manager › Plenio Music Production System › Update</i>.</li>
          <li>Restart ComfyUI. Plenio VST3 finds the new Plenio by itself.</li>
        </ol>
        <p class="muted small">
          Without the Manager: <code>git pull</code> in <code>ComfyUI/custom_nodes/Plenio-Music-Production-System</code>.
        </p>
      </div>
    </div>
    <button class="btn ghost small" title="New song" @click="$emit('new')"><Icon name="plus" :size="15" />New</button>
    <button class="btn ghost small" title="Your songs" @click="$emit('library')"><Icon name="library" :size="15" />Songs</button>
    <button class="btn ghost small icon" title="Settings" @click="$emit('settings')"><Icon name="gear" :size="16" /></button>
  </header>
</template>

<style scoped>
.bar {
  height: 50px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px 0 12px;
  border-bottom: 1px solid var(--line);
  background: rgba(18, 16, 25, 0.75);
}
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
}
.logo {
  width: 26px;
  height: 26px;
  border-radius: 7px;
}
.name {
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 16px;
  letter-spacing: 0.01em;
}
.song {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.sep {
  color: var(--text-faint);
  font-size: 18px;
}
.title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: text;
  padding: 4px 6px;
  border-radius: 6px;
  max-width: 340px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title:hover {
  background: var(--bg-hover);
}
.pen {
  color: var(--text-faint);
  opacity: 0;
}
.title:hover .pen {
  opacity: 1;
}
.title-edit {
  width: 260px;
  height: 30px;
  font-size: 15px;
  font-weight: 600;
}
.kind {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 178, 62, 0.14);
  color: var(--amber);
}
.spacer {
  flex: 1;
}
.status-wrap {
  position: relative;
}
.status {
  font: inherit;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 11px;
  border-radius: 13px;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--text-dim);
  margin-right: 6px;
}
.light {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-faint);
}
.status.ok .light {
  background: var(--ok);
  box-shadow: 0 0 8px rgba(79, 209, 165, 0.7);
}
.status.wait .light {
  background: var(--wait);
  animation: pulse 1.2s infinite;
}
.status.off .light {
  background: #7d7690;
}
.status.warn .light {
  background: var(--amber);
  box-shadow: 0 0 8px rgba(255, 178, 62, 0.6);
}
.status.clickable {
  cursor: pointer;
}
.status.clickable:hover {
  border-color: var(--amber);
}
.badge {
  font-size: 10.5px;
  font-weight: 650;
  padding: 1px 7px;
  border-radius: 9px;
  background: rgba(255, 178, 62, 0.16);
  color: var(--amber);
}
.update {
  position: absolute;
  top: 34px;
  right: 0;
  z-index: 30;
  width: 340px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #1f1a2c;
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-dim);
}
.update b {
  color: var(--text);
  font-size: 13.5px;
}
.update p,
.update ol {
  margin: 8px 0 0;
}
.update ol {
  padding-left: 18px;
}
.update code {
  font-size: 11.5px;
}
.small {
  font-size: 11.5px;
}
</style>
