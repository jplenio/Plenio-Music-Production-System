<script setup lang="ts">
/**
 * *Continue a song*: the release records of the output folder, newest first. Picking one opens the
 * workflow the song was made with, its documents kept in the Song Sheets (``shared/continuation.ts``).
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { type Fetcher, PlenioApiError, type RecordRow, listRecords, viewUrl } from '../api/client'

const props = defineProps<{
  fetcher: Fetcher
  /** Continue with a record of the list or a file; resolves when the workflow is open, throws otherwise. */
  onContinue: (request: { path: string } | { record: unknown; name: string }) => Promise<void>
}>()
const emit = defineEmits<{ close: [] }>()

const rows = ref<RecordRow[] | null>(null)
const error = ref<string | null>(null)
const busy = ref<string | null>(null)
const query = ref('')
const playing = ref<string | null>(null)
let player: HTMLAudioElement | null = null

const shown = computed(() => {
  const words = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  return (rows.value ?? []).filter((row) => {
    const text = `${row.title} ${row.path} ${row.created.slice(0, 10)}`.toLowerCase()
    return words.every((word) => text.includes(word))
  })
})

function message(reason: unknown): string {
  if (reason instanceof PlenioApiError) return reason.hint ? `${reason.message} ${reason.hint}` : reason.message
  return reason instanceof Error ? reason.message : String(reason)
}

/** A file of the output folder as ComfyUI serves it (``/view``). */
function outputUrl(relative: string): string {
  const cut = relative.lastIndexOf('/')
  return viewUrl(props.fetcher, {
    filename: relative.slice(cut + 1),
    subfolder: cut < 0 ? '' : relative.slice(0, cut),
    type: 'output'
  })
}

function length(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return ''
  const whole = Math.round(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

function when(created: string): string {
  return created.slice(0, 16).replace('T', ' ')
}

function folderOf(path: string): string {
  const cut = path.lastIndexOf('/')
  return cut < 0 ? '' : path.slice(0, cut)
}

function play(row: RecordRow): void {
  if (!row.audio) return
  if (playing.value === row.path) {
    player?.pause()
    playing.value = null
    return
  }
  player?.pause()
  player = new Audio(outputUrl(row.audio))
  player.addEventListener('ended', () => (playing.value = null))
  playing.value = row.path
  void player.play().catch((reason: unknown) => {
    playing.value = null
    error.value = `The audio could not be played: ${message(reason)}`
  })
}

async function run(key: string, request: { path: string } | { record: unknown; name: string }): Promise<void> {
  busy.value = key
  error.value = null
  try {
    await props.onContinue(request)
    emit('close')
  } catch (reason) {
    error.value = message(reason)
  } finally {
    busy.value = null
  }
}

const picker = ref<HTMLInputElement | null>(null)
async function openFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const record = JSON.parse(await file.text()) as unknown
    await run(file.name, { record, name: file.name })
  } catch (reason) {
    error.value = `${file.name} could not be read: ${message(reason)}`
  } finally {
    if (picker.value) picker.value.value = ''
  }
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  try {
    rows.value = await listRecords(props.fetcher)
  } catch (reason) {
    rows.value = []
    error.value = message(reason)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  player?.pause()
})
</script>

<template>
  <div class="plenio-overlay" @mousedown.self="emit('close')">
    <div class="plenio-dialog plenio-continue" role="dialog" aria-label="Continue a song">
      <header>
        <strong>Continue a song</strong>
        <span class="hint">
          Opens the workflow a song was made with and keeps its title, style, lyrics and score in the Song Sheets.
        </span>
        <button class="close" title="Close" aria-label="Close" @click="emit('close')">×</button>
      </header>
      <div class="toolbar">
        <input v-model="query" type="search" placeholder="Search title, folder or date" aria-label="Search songs" />
        <button title="A release record from another folder (<name>.plenio.json)" @click="picker?.click()">Open a record file…</button>
        <input ref="picker" type="file" accept=".json,application/json" hidden @change="openFile" />
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="list" role="list">
        <p v-if="rows === null" class="empty">Reading the output folder…</p>
        <p v-else-if="!rows.length" class="empty">
          No release records in the output folder yet. Export Release writes one next to every song (&lt;name&gt;.plenio.json).
        </p>
        <p v-else-if="!shown.length" class="empty">No song matches "{{ query }}".</p>
        <div v-for="row in shown" :key="row.path" class="row" role="listitem">
          <img v-if="row.cover" class="cover" :src="outputUrl(row.cover)" alt="" loading="lazy" />
          <span v-else class="cover none" aria-hidden="true">♪</span>
          <div class="facts">
            <span class="title">{{ row.title }}</span>
            <span class="meta">
              {{ when(row.created) }}<template v-if="length(row.seconds)"> · {{ length(row.seconds) }}</template>
              <template v-if="row.plenio"> · Plenio {{ row.plenio }}</template>
              <template v-if="folderOf(row.path)"> · {{ folderOf(row.path) }}/</template>
            </span>
          </div>
          <button
            v-if="row.audio"
            class="play"
            :title="playing === row.path ? 'Stop' : 'Listen'"
            :aria-label="playing === row.path ? 'Stop' : `Listen to ${row.title}`"
            @click="play(row)"
          >
            {{ playing === row.path ? '■' : '▶' }}
          </button>
          <button class="primary" :disabled="busy !== null" @click="run(row.path, { path: row.path })">
            {{ busy === row.path ? 'Opening…' : 'Continue' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

