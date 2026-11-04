<script setup lang="ts">
/**
 * Operations on the selection and on the whole score; each one is checked by the backend.
 *
 * The chord field works on what is selected: a note or a rest (*set* puts a chord symbol at it, *remove*
 * takes the one there away) or chord symbols selected in the roll's chord lane (GitHub issue #28: they left
 * *set* and *remove* disabled) - *set* renames the one selected, *remove* removes every selected one, both
 * with the canonical operations the lane itself uses. *shorter* / *longer* change the note as it sounds,
 * also one tied over a bar line (``lengthOperation``).
 */
import { computed, ref, watch } from 'vue'

import type { ScoreOperation } from '../../api/client'
import { type ModelChord, type ScoreElement, type ScoreView, lengthOperation } from '../../shared/scoreView'
import { selectedChordIds, selectedNoteIds } from './pianoRoll'
import type { FitSurplus } from './noteFit'
import { SHIFTABLE, shiftBlock } from './tracks'

const props = defineProps<{
  view: ScoreView | null
  selection: string[]
  primary: ScoreElement | null
  busy: boolean
  canUndo: boolean
  canRedo: boolean
  undoLabel: string | null
  redoLabel: string | null
  /** The ABC text is not valid now: nothing can be edited until it is (or the last valid score is back). */
  stale?: boolean
  /** The notes against the lyrics: lines off, and whether there are lyrics and something selected to fit. */
  fit?: { off: number; lyrics: boolean; range: boolean; vocalLocked: boolean } | null
}>()
/** What becomes of notes the lyrics do not need. */
const fitSurplus = defineModel<FitSurplus>('fitSurplus', { default: 'auto' })
const emit = defineEmits<{ operate: [operation: ScoreOperation]; undo: []; redo: []; fitNotes: [whole: boolean] }>()

/** Why the notes cannot be fitted to the lyrics now (``null``: they can). */
const fitBlock = computed(() => {
  if (!props.fit?.lyrics) return 'This sheet has no lyrics here to fit the notes to.'
  if (props.fit.vocalLocked) return 'The Vocal track is locked: unlock it to fit its notes.'
  return null
})

const chordName = ref('')
const tempo = ref<number | null>(null)

const notes = computed(() => props.selection.filter((id) => props.view?.elements?.find((e) => e.id === id)?.kind === 'note'))
/** The selected chord symbols (the roll's chord lane): ±1 and ±8va move them with the notes. */
const chords = computed(() => [...selectedChordIds(props.selection)])
const movable = computed(() => notes.value.length > 0 || chords.value.length > 0)
const isRest = computed(() => props.primary !== null && props.primary.kind !== 'note')
const chordAtSelection = computed(() => {
  const element = props.primary
  if (!element || !props.view) return null
  return (
    props.view.chords?.find((c) => c.bar === element.bar && Math.abs(c.start_s - element.start_s) < 1e-6) ?? null
  )
})
const longer = computed(() => lengthOperation(props.view, props.primary, 1))
const shorter = computed(() => lengthOperation(props.view, props.primary, -1))
/** No edit now: the backend is busy, or the text is invalid. */
const blocked = computed(() => props.busy || !!props.stale)
/** The chord symbols selected in the roll's chord lane, as the model has them. */
const laneChords = computed<ModelChord[]>(() => {
  const ids = selectedChordIds(props.selection)
  return (props.view?.model?.tracks.chords ?? []).filter((c) => ids.has(c.id))
})
/** The one chord symbol the chord field works on when no note or rest is selected. */
const laneChord = computed(() => (!props.primary && laneChords.value.length === 1 ? laneChords.value[0] : null))
const chordTarget = computed(() => !!props.primary || !!laneChord.value)
const removable = computed(() => (props.primary ? !!chordAtSelection.value : laneChords.value.length > 0))
const setTitle = computed(() =>
  laneChord.value
    ? `Rename the selected chord symbol ${laneChord.value.name} (Enter in the field)`
    : laneChords.value.length > 1
      ? 'Select one chord symbol to rename it (or a note or rest to set one there)'
      : 'Set the chord symbol at the selected note or rest'
)
const removeTitle = computed(() =>
  props.primary
    ? 'Remove the chord symbol at the selection'
    : laneChords.value.length > 1
      ? `Remove the ${laneChords.value.length} selected chord symbols`
      : 'Remove the selected chord symbol'
)

function setChord(): void {
  const name = chordName.value.trim()
  if (!name || blocked.value) return
  if (props.primary) emit('operate', { op: 'set_chord', id: props.primary.id, name })
  else if (laneChord.value) emit('operate', { op: 'put_chord', onset: laneChord.value.onset, name })
}

function removeChord(): void {
  if (blocked.value) return
  if (props.primary) {
    if (chordAtSelection.value) emit('operate', { op: 'remove_chord', chord: chordAtSelection.value.id })
  } else if (laneChords.value.length === 1) emit('operate', { op: 'delete_chord', onset: laneChords.value[0].onset })
  else if (laneChords.value.length) emit('operate', { op: 'delete', ids: laneChords.value.map((c) => c.id) })
}

watch(
  () => props.view?.header?.tempo_bpm,
  (bpm) => {
    tempo.value = bpm ?? null
  },
  { immediate: true }
)
watch(
  () => (props.primary ? (chordAtSelection.value?.name ?? '') : (laneChord.value?.name ?? '')),
  (name) => {
    chordName.value = name
  },
  { immediate: true }
)

/** The two tracks a whole-track octave moves (feature request 2026-10-22: until then only selected notes). */
const TRACKS = Object.values(SHIFTABLE).map(({ track, name }) => [track, name] as const)
const trackBlock = (track: 'vocal' | 'ins', semitones: number): string | null => shiftBlock(props.view, track, semitones)

function shift(semitones: number): void {
  if (chords.value.length) {
    // with chord symbols: the canonical operation moves notes and chords in one step
    emit('operate', { op: 'set_note_pitch', ids: [...selectedNoteIds(props.view, props.selection), ...chords.value], semitones })
  } else if (notes.value.length) emit('operate', { op: 'shift_pitch', ids: notes.value, semitones })
}
</script>

<template>
  <div class="palette" role="toolbar" aria-label="Score operations">
    <div class="group" aria-label="History">
      <button :disabled="!canUndo || busy" :title="`Undo${undoLabel ? ': ' + undoLabel : ''} (Ctrl+Z)`" @click="emit('undo')">↶</button>
      <button :disabled="!canRedo || busy" :title="`Redo${redoLabel ? ': ' + redoLabel : ''} (Ctrl+Y)`" @click="emit('redo')">↷</button>
    </div>
    <div class="group" aria-label="Pitch">
      <button :disabled="!movable || busy" title="Octave down (Shift+↓)" @click="shift(-12)">−8va</button>
      <button :disabled="!movable || busy" title="Semitone down (↓): the selected notes and chord symbols" @click="shift(-1)">−1</button>
      <button :disabled="!movable || busy" title="Semitone up (↑): the selected notes and chord symbols" @click="shift(1)">+1</button>
      <button :disabled="!movable || busy" title="Octave up (Shift+↑)" @click="shift(12)">+8va</button>
    </div>
    <div class="group" aria-label="Length">
      <button
        :disabled="!shorter || blocked"
        title="Shorter from its end - also a note tied over a bar line, as one note; a rest fills the time ([)"
        @click="shorter && emit('operate', shorter)"
      >
        shorter
      </button>
      <button
        :disabled="!longer || blocked"
        title="Longer, into the rest after the note (])"
        @click="longer && emit('operate', longer)"
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
        :disabled="!chordTarget || blocked"
        @keydown.enter.prevent="setChord"
      />
      <button :disabled="!chordTarget || !chordName.trim() || blocked" :title="setTitle" @click="setChord">set</button>
      <button :disabled="!removable || blocked" :title="removeTitle" @click="removeChord">remove</button>
    </div>
    <div v-if="fit" class="group fit-notes" role="group" aria-label="Notes and lyrics">
      <button
        data-testid="fit-song"
        :disabled="blocked || !!fitBlock"
        :title="fitBlock ?? 'As many notes as syllables in every line of the song: the song\'s own melody first, new notes on its chords, key and rhythm, or the notes that carry least left out. Ctrl+Z takes it back.'"
        @click="emit('fitNotes', true)"
      >
        fit notes to lyrics<span v-if="fit.off" class="off-count" :title="`${fit.off} line(s) do not fit`">{{ fit.off }}</span>
      </button>
      <button
        data-testid="fit-selection"
        :disabled="blocked || !!fitBlock || !fit.range"
        :title="fitBlock ?? (fit.range ? 'The same for the lines of the selected notes or lyrics lines' : 'Select notes or lyrics lines first')"
        @click="emit('fitNotes', false)"
      >
        fit selection
      </button>
      <select v-model="fitSurplus" aria-label="Notes the lyrics do not need" title="What becomes of notes the lyrics do not need">
        <option value="auto" title="A phrase no line sings and a long rest of a line move to the Ins, single notes are left out">spare notes: smart</option>
        <option value="omit" title="Every note the lyrics do not need is left out">spare notes: leave out</option>
        <option value="ins" title="Every note the lyrics do not need moves to the Ins, where it is silent">spare notes: to the Ins</option>
      </select>
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
        <span v-for="[track, name] in TRACKS" :key="track" class="track-octave" role="group" :aria-label="`${name} track octave`">
          {{ name }}
          <button
            :disabled="busy || !!trackBlock(track, -12)"
            :title="trackBlock(track, -12) ?? `Every ${name} note an octave down (chord symbols and keys stay)`"
            @click="emit('operate', { op: 'shift_track', track, semitones: -12 })"
          >
            −8va
          </button>
          <button
            :disabled="busy || !!trackBlock(track, 12)"
            :title="trackBlock(track, 12) ?? `Every ${name} note an octave up (chord symbols and keys stay)`"
            @click="emit('operate', { op: 'shift_track', track, semitones: 12 })"
          >
            +8va
          </button>
        </span>
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
