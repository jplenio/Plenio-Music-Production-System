<script setup lang="ts">
/**
 * ♫ in the transport (owner's request 2026-10-03): each track's sound (▶ plays a few notes in it) and
 * the presets - starting points by kind of song, and the user's own, saved from the current settings
 * (sounds, metronome, the cover's view of its source, recording, paper) in ComfyUI's user data.
 */
import { computed, nextTick, ref } from 'vue'

import type { Fetcher } from '../../api/client'
import { BUILT_IN_PRESETS, type EditorSettings, type Preset, loadUserPresets, saveUserPresets, withPreset } from './editorSettings'
import { INSTRUMENTS, INSTRUMENT_IDS, type InstrumentId, type Sounds } from './instruments'
import { audition } from './player'

const props = defineProps<{
  fetcher: Fetcher | null
  /** The current settings (what *save* stores). */
  settings: EditorSettings
  /** The sheet keeps a Guide track. */
  keepsGuide: boolean
}>()
const sounds = defineModel<Sounds>('sounds', { required: true })
const emit = defineEmits<{ apply: [settings: Partial<EditorSettings>, name: string] }>()

const open = ref(false)
const toggle = ref<HTMLButtonElement | null>(null)
const own = ref<Preset[]>([])
const where = ref<'comfyui' | 'browser' | null>(null)
const loaded = ref(false)
const choice = ref('')
const naming = ref(false)
const name = ref('')
const note = ref<string | null>(null)

const TRACKS = computed(() =>
  (
    [
      ['Vocal', 'Vocal'],
      ['Ins', 'Instrument'],
      ['chord', 'Chords'],
      ['guide', 'Guide']
    ] as const
  ).filter(([key]) => key !== 'guide' || props.keepsGuide)
)
const chosenOwn = computed(() => own.value.find((p) => p.name === choice.value) ?? null)

async function show(): Promise<void> {
  open.value = true
  if (loaded.value) return
  const result = await loadUserPresets(props.fetcher)
  own.value = result.presets
  where.value = result.where
  loaded.value = true
}

function close(): void {
  open.value = false
  naming.value = false
  void nextTick(() => toggle.value?.focus())
}

function apply(): void {
  const preset = [...BUILT_IN_PRESETS, ...own.value].find((p) => p.name === choice.value)
  if (!preset) return
  emit('apply', preset.settings, preset.name)
  note.value = `“${preset.name}” is set.`
}

async function save(): Promise<void> {
  const text = name.value.trim().slice(0, 60)
  if (!text) return
  if (BUILT_IN_PRESETS.some((p) => p.name.toLowerCase() === text.toLowerCase())) {
    note.value = `“${text}” is a built-in preset - choose another name.`
    return
  }
  const next = withPreset(own.value, { name: text, builtIn: false, settings: structuredClone(props.settings) })
  const stored = await saveUserPresets(props.fetcher, next)
  if (stored === 'failed') {
    note.value = 'The preset could not be saved (neither in ComfyUI nor in this browser).'
    return
  }
  own.value = next
  where.value = stored
  choice.value = text
  naming.value = false
  name.value = ''
  note.value = stored === 'comfyui' ? `Saved “${text}” in ComfyUI’s user data.` : `Saved “${text}” in this browser only (ComfyUI’s user data could not be reached).`
}

async function remove(): Promise<void> {
  const preset = chosenOwn.value
  if (!preset) return
  const next = own.value.filter((p) => p !== preset)
  const stored = await saveUserPresets(props.fetcher, next)
  if (stored === 'failed') {
    note.value = 'The preset could not be deleted.'
    return
  }
  own.value = next
  choice.value = ''
  note.value = `Deleted “${preset.name}”.`
}

function set(track: keyof Sounds, id: InstrumentId): void {
  sounds.value = { ...sounds.value, [track]: id }
}

/** A few notes in the track's sound: a phrase for the melodies, a chord, a bass line. */
function preview(track: keyof Sounds): void {
  const id = sounds.value[track]
  const plan: [number, number, number][] =
    track === 'chord'
      ? [[60, 0, 1.2], [64, 0, 1.2], [67, 0, 1.2]]
      : track === 'guide'
        ? [[36, 0, 0.4], [43, 0.45, 0.4], [48, 0.9, 0.6]]
        : [[60, 0, 0.3], [64, 0.32, 0.3], [67, 0.64, 0.3], [72, 0.96, 0.7]]
  for (const [midi, delay, seconds] of plan) setTimeout(() => audition(midi, seconds, id), delay * 1000)
}
</script>

<template>
  <span class="sounds-settings">
    <button ref="toggle" :aria-expanded="open" title="The tracks’ sounds and the presets" @click="open ? close() : show()">♫ sounds</button>
    <span v-if="open" class="sounds-panel" role="dialog" aria-label="Sounds and presets" @keydown.esc.stop.prevent="close">
      <button class="close" aria-label="Close" @click="close">×</button>
      <strong>Preset</strong>
      <span class="row">
        <select v-model="choice" aria-label="Preset">
          <option value="">- choose a preset -</option>
          <optgroup label="Built in">
            <option v-for="preset in BUILT_IN_PRESETS" :key="preset.name" :value="preset.name" :title="preset.note">{{ preset.name }}</option>
          </optgroup>
          <optgroup v-if="own.length" label="Yours">
            <option v-for="preset in own" :key="'own-' + preset.name" :value="preset.name">{{ preset.name }}</option>
          </optgroup>
        </select>
        <button :disabled="!choice" title="Set the preset’s sounds and settings" @click="apply">use</button>
        <button v-if="chosenOwn" title="Delete this preset of yours" @click="remove">delete</button>
      </span>
      <span v-if="choice" class="facts">{{ [...BUILT_IN_PRESETS, ...own].find((p) => p.name === choice)?.note ?? 'Your preset' }}</span>
      <span class="row">
        <template v-if="naming">
          <input
            v-model="name"
            maxlength="60"
            placeholder="name of the preset"
            aria-label="Name of the new preset"
            @keydown.enter.prevent="save"
            @keydown.esc.stop.prevent="naming = false"
          />
          <button :disabled="!name.trim()" @click="save">save</button>
        </template>
        <button
          v-else
          title="Save the current sounds, metronome, cover view, recording and paper as a preset of yours"
          @click="naming = true"
        >
          save current as preset…
        </button>
      </span>
      <span v-if="note" class="facts" role="status">{{ note }}</span>
      <span v-else-if="where === 'browser'" class="facts">Your presets are kept in this browser (ComfyUI’s user data could not be reached).</span>
      <strong>Sounds</strong>
      <label v-for="[key, label] in TRACKS" :key="key" class="row">
        <span class="track">{{ label }}</span>
        <select :value="sounds[key]" :aria-label="`Sound of the ${label} track`" @change="set(key, ($event.target as HTMLSelectElement).value as InstrumentId)">
          <option v-for="id in INSTRUMENT_IDS" :key="id" :value="id" :title="INSTRUMENTS[id].hint">{{ INSTRUMENTS[id].label }}</option>
        </select>
        <button :title="`Hear the ${label} track’s sound`" :aria-label="`Hear the ${label} sound`" @click.prevent="preview(key)">▶</button>
      </label>
      <span class="facts">Synthesized in the browser - a sketch of each instrument to tell the tracks apart; YuE2 renders the song itself.</span>
    </span>
  </span>
</template>
