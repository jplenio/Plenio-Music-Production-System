<script setup lang="ts">
/**
 * The MIDI import dialog of the Score tab: the file's tracks with a role each (vocal, instrument,
 * chords, Guide, or not imported), the quantisation grid and the import report - shown **before**
 * anything replaces the score. *Insert* hands the imported ABC and Guide notes to the Score tab,
 * which replaces the text as one undo step. Nothing here decides musical content: the backend
 * reads the file (`POST /plenio/score/midi/import`) and every step it takes is listed.
 */
import { computed, onMounted, ref } from 'vue'

import { type Fetcher, type MidiImportResult, importMidi } from '../../api/client'
import type { ScoreView } from '../../shared/scoreView'
import {
  GRIDS,
  ROLE_OPTIONS,
  type TrackChoice,
  choicesOf,
  defaultGrid,
  mappingOf,
  summaryLines,
  trackLabel
} from './midiImport'
import { describeError } from './useScoreSession'

const props = defineProps<{
  fetcher: Fetcher
  /** The file as base64 (read by the Score tab's file picker). */
  data: string
  filename: string
  /** The current score view (suggests the grid). */
  view: ScoreView | null
  /** Whether this sheet keeps a Guide track (node properties); false: Guide notes are dropped. */
  keepsGuide: boolean
}>()
const emit = defineEmits<{
  close: []
  insert: [result: MidiImportResult, keepGuide: boolean]
}>()

const busy = ref(false)
const error = ref<string | null>(null)
const result = ref<MidiImportResult | null>(null)
const choices = ref<TrackChoice[]>([])
const grid = ref(defaultGrid(props.view))
const recognize = ref(false)
const keepGuide = ref(props.keepsGuide)

const rows = computed(() => choices.value.filter((choice) => choice.notes > 0))
const empty = computed(() => choices.value.filter((choice) => choice.notes === 0))
const lines = computed(() =>
  result.value ? summaryLines(result.value.report, result.value.guide.length, props.keepsGuide) : []
)

async function run(sendMapping: boolean): Promise<void> {
  busy.value = true
  error.value = null
  try {
    const imported = await importMidi(props.fetcher, {
      data: props.data,
      grid: grid.value,
      chords: recognize.value,
      mapping: sendMapping ? mappingOf(choices.value) : undefined
    })
    result.value = imported
    if (!sendMapping) choices.value = choicesOf(imported.tracks)
  } catch (e) {
    error.value = describeError(e)
  } finally {
    busy.value = false
  }
}

/** A role, the grid or the chord switch changed: read the file again with the current choices. */
function refresh(): void {
  void run(true)
}

onMounted(() => void run(false))
</script>

<template>
  <div class="plenio-overlay" @mousedown.self="emit('close')">
    <div class="plenio-dialog midi-dialog" role="dialog" aria-modal="true" aria-label="Import MIDI">
      <header>
        <h2>Import MIDI</h2>
        <span class="facts">{{ filename }}</span>
        <button class="icon" title="Close (Esc)" aria-label="Close MIDI import" @click="emit('close')">×</button>
      </header>
      <div class="body">
        <p v-if="busy" class="hint">Reading the file…</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <template v-if="result && !error">
          <table class="tracks">
            <thead>
              <tr><th>Track</th><th>Role</th></tr>
            </thead>
            <tbody>
              <tr v-for="choice in rows" :key="choice.index">
                <td><span class="number">{{ choice.number }}</span> {{ trackLabel(choice) }}</td>
                <td>
                  <select v-model="choice.role" :aria-label="`Role of track ${choice.number}`" @change="refresh()">
                    <option
                      v-for="option in ROLE_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                      :title="option.title"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="empty.length" class="hint">
            Empty track(s) not shown: {{ empty.map((choice) => choice.number).join(', ') }}.
          </p>
          <p class="controls">
            <label title="Foreign timing is quantised to this note value">
              grid
              <select v-model.number="grid" aria-label="Import grid" @change="refresh()">
                <option v-for="value in GRIDS" :key="value" :value="value">1/{{ value }}</option>
              </select>
            </label>
            <label title="Read chord symbols from the notes of the Chords track (best effort)">
              <input
                v-model="recognize"
                type="checkbox"
                aria-label="Read chords from the notes"
                @change="refresh()"
              />
              read chords from the notes
            </label>
            <label
              v-if="keepsGuide && result.guide.length"
              title="Keep the file's Guide notes: playback and MIDI only, never sent to YuE2"
            >
              <input v-model="keepGuide" type="checkbox" aria-label="Keep the Guide notes" />
              keep the Guide notes
            </label>
          </p>
          <h3>What the import did</h3>
          <ul class="report">
            <li v-for="(line, index) in lines" :key="index">{{ line }}</li>
            <li v-if="!lines.length">The file maps cleanly onto the score; nothing was lost or guessed.</li>
          </ul>
        </template>
      </div>
      <footer>
        <span class="spacer" />
        <button @click="emit('close')">Cancel</button>
        <button
          class="primary"
          :disabled="busy || !result"
          title="Replace the score with the imported one (one undo step)"
          @click="result && emit('insert', result, keepGuide)"
        >
          Insert
        </button>
      </footer>
    </div>
  </div>
</template>
