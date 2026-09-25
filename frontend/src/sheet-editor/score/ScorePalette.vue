<script setup lang="ts">
/** Operations on the selection and on the whole score; each one is checked by the backend. */
import { computed, ref, watch } from 'vue'

import type { ScoreOperation } from '../../api/client'
import { type ScoreElement, type ScoreView, nextDuration } from '../../shared/scoreView'

const props = defineProps<{
  view: ScoreView | null
  selection: string[]
  primary: ScoreElement | null
  busy: boolean
  canUndo: boolean
  canRedo: boolean
  undoLabel: string | null
  redoLabel: string | null
}>()
const emit = defineEmits<{ operate: [operation: ScoreOperation]; undo: []; redo: [] }>()

const chordName = ref('')
const tempo = ref<number | null>(null)

const notes = computed(() => props.selection.filter((id) => props.view?.elements?.find((e) => e.id === id)?.kind === 'note'))
const isNote = computed(() => props.primary?.kind === 'note')
const isRest = computed(() => props.primary !== null && props.primary.kind !== 'note')
const chordAtSelection = computed(() => {
  const element = props.primary
  if (!element || !props.view) return null
  return (
    props.view.chords?.find((c) => c.bar === element.bar && Math.abs(c.start_s - element.start_s) < 1e-6) ?? null
  )
})
const longer = computed(() => (props.primary && isNote.value ? nextDuration(props.primary.units, 1) : null))
const shorter = computed(() => (props.primary && isNote.value ? nextDuration(props.primary.units, -1) : null))

watch(
  () => props.view?.header?.tempo_bpm,
  (bpm) => {
    tempo.value = bpm ?? null
  },
  { immediate: true }
)
watch(chordAtSelection, (chord) => {
  chordName.value = chord?.name ?? ''
})

function shift(semitones: number): void {
  if (notes.value.length) emit('operate', { op: 'shift_pitch', ids: notes.value, semitones })
}
</script>

<template>
  <div class="palette" role="toolbar" aria-label="Score operations">
    <div class="group" aria-label="History">
      <button :disabled="!canUndo || busy" :title="`Undo${undoLabel ? ': ' + undoLabel : ''} (Ctrl+Z)`" @click="emit('undo')">↶</button>
      <button :disabled="!canRedo || busy" :title="`Redo${redoLabel ? ': ' + redoLabel : ''} (Ctrl+Y)`" @click="emit('redo')">↷</button>
    </div>
    <div class="group" aria-label="Pitch">
      <button :disabled="!notes.length || busy" title="Octave down (Shift+↓)" @click="shift(-12)">−8va</button>
      <button :disabled="!notes.length || busy" title="Semitone down (↓)" @click="shift(-1)">−1</button>
      <button :disabled="!notes.length || busy" title="Semitone up (↑)" @click="shift(1)">+1</button>
      <button :disabled="!notes.length || busy" title="Octave up (Shift+↑)" @click="shift(12)">+8va</button>
    </div>
    <div class="group" aria-label="Length">
      <button
        :disabled="!shorter || busy"
        title="Shorter; a rest fills the time ([)"
        @click="primary && shorter && emit('operate', { op: 'set_duration', id: primary.id, units: shorter })"
      >
        shorter
      </button>
      <button
        :disabled="!longer || busy"
        title="Longer, into the rest after the note (])"
        @click="primary && longer && emit('operate', { op: 'set_duration', id: primary.id, units: longer })"
      >
        longer
      </button>
      <button :disabled="!notes.length || busy" title="Turn into a rest (R or Delete)" @click="emit('operate', { op: 'note_to_rest', ids: notes })">
        rest
      </button>
      <button
        :disabled="!isRest || busy"
        title="Turn the rest into a note (N)"
        @click="primary && emit('operate', { op: 'rest_to_note', id: primary.id })"
      >
        note
      </button>
    </div>
    <div class="group" aria-label="Chord">
      <input
        v-model="chordName"
        class="chord"
        placeholder="chord, e.g. Am7"
        aria-label="Chord symbol"
        :disabled="!primary || busy"
        @keydown.enter.prevent="primary && chordName.trim() && emit('operate', { op: 'set_chord', id: primary.id, name: chordName })"
      />
      <button
        :disabled="!primary || !chordName.trim() || busy"
        title="Set the chord symbol at the selected note or rest"
        @click="primary && emit('operate', { op: 'set_chord', id: primary.id, name: chordName })"
      >
        set
      </button>
      <button
        :disabled="!chordAtSelection || busy"
        title="Remove the chord symbol at the selection"
        @click="chordAtSelection && emit('operate', { op: 'remove_chord', chord: chordAtSelection.id })"
      >
        remove
      </button>
    </div>
    <details class="group whole">
      <summary title="Operations on the whole score">Whole score</summary>
      <div class="whole-tools">
        <button :disabled="busy" title="Transpose everything a semitone down" @click="emit('operate', { op: 'transpose', semitones: -1 })">
          transpose −1
        </button>
        <button :disabled="busy" title="Transpose everything a semitone up" @click="emit('operate', { op: 'transpose', semitones: 1 })">
          transpose +1
        </button>
        <label>
          tempo
          <input v-model.number="tempo" type="number" min="20" max="300" class="tempo" aria-label="Tempo in BPM" />
        </label>
        <button
          :disabled="busy || !tempo || tempo === view?.header?.tempo_bpm"
          title="Set the quarter-note tempo; notes and bars stay"
          @click="tempo && emit('operate', { op: 'set_tempo', bpm: tempo })"
        >
          set tempo
        </button>
        <button :disabled="busy || !view?.has_chords" title="Remove every chord symbol" @click="emit('operate', { op: 'strip_chords' })">
          remove chords
        </button>
        <button :disabled="busy" title="Let the instrument play the vocal melody" @click="emit('operate', { op: 'move_vocal_to_ins' })">
          melody → Ins
        </button>
        <button :disabled="busy" title="Replace every Vocal note by rests" @click="emit('operate', { op: 'silence_voice', voice: 'Vocal' })">
          silence Vocal
        </button>
      </div>
    </details>
  </div>
</template>
