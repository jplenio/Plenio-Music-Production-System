<script setup lang="ts">
/**
 * The inspector (next-release plan §10.3; milestone M1, task D2): the selected note(s), chord
 * symbol and bar as fields. Every edit of a field commits exactly one canonical operation through
 * ``operate`` (the backend checks it); a refused edit leaves the score as it was and the Score tab
 * shows why. Nothing here computes musical content.
 */
import { computed, ref, watch } from 'vue'

import type { ScoreOperation } from '../../api/client'
import type { ScoreView } from '../../shared/scoreView'
import {
  KEYS,
  METERS,
  chordMoveOp,
  chordOp,
  deleteBarsOp,
  duplicateBarsOp,
  focusOf,
  insertBarsOp,
  keyChangeAt,
  keyOp,
  lengthChoices,
  lengthOp,
  meterOp,
  onsetFrom,
  parsePitch,
  pitchName,
  pitchOp,
  positionOf,
  removeKeyOp,
  shiftOp,
  startOp,
  voiceOp
} from './inspector'
import type { ResizeMode, Track } from './pianoRoll'

const props = withDefaults(
  defineProps<{
    view: ScoreView | null
    selection: string[]
    operate: (operation: ScoreOperation) => Promise<boolean>
    /** The bar of the staff's selection when it is a rest (1-based). */
    fallbackBar?: number | null
    readonly?: boolean
    stale?: boolean
    busy?: boolean
    resizeMode?: ResizeMode
  }>(),
  { fallbackBar: null, readonly: false, stale: false, busy: false, resizeMode: 'rests' }
)

const model = computed(() => props.view?.model ?? null)
const focus = computed(() => focusOf(props.view, props.selection, props.fallbackBar))
const note = computed(() => (focus.value.notes.length === 1 ? focus.value.notes[0] : null))
const chord = computed(() => (focus.value.chords.length === 1 && !focus.value.notes.length ? focus.value.chords[0] : null))
const measure = computed(() => focus.value.measure)
const editable = computed(() => !props.readonly && !props.stale && !props.busy)
const choices = computed(() => (model.value ? lengthChoices(model.value) : []))
const keyChange = computed(() => (model.value && measure.value ? keyChangeAt(model.value, measure.value) : null))
const position = computed(() => {
  const onset = note.value?.onset ?? chord.value?.onset
  return model.value && onset !== undefined ? positionOf(model.value, onset) : null
})
const track = computed<Track | 'mixed' | null>(() => {
  const tracks = new Set(focus.value.notes.map((n) => n.track))
  return tracks.size === 1 ? [...tracks][0] : tracks.size ? 'mixed' : null
})

// the fields; they follow the selection and are committed with Enter or when they lose focus
const pitchText = ref('')
const startBar = ref(1)
const startOffset = ref(0)
const lengthUnits = ref(1)
const overwrite = ref(false)
const chordText = ref('')
const meterText = ref('4/4')
const keyChoice = ref('C')

watch(
  [note, chord, measure, () => focus.value.chordAtNote],
  () => {
    const current = note.value
    pitchText.value = current ? pitchName(current.pitch) : ''
    lengthUnits.value = current?.duration ?? 1
    startBar.value = position.value?.bar ?? 1
    startOffset.value = position.value?.offset ?? 0
    chordText.value = (current ? focus.value.chordAtNote?.name : chord.value?.name) ?? ''
    meterText.value = measure.value?.meter ?? '4/4'
    keyChoice.value = measure.value?.key ?? 'C'
  },
  { immediate: true }
)

const problem = ref<string | null>(null)

async function commit(operation: ScoreOperation | null): Promise<void> {
  if (!operation || !editable.value) return
  problem.value = null
  await props.operate(operation)
}

function commitPitch(): void {
  const midi = parsePitch(pitchText.value)
  if (midi === null) {
    problem.value = `"${pitchText.value}" is not a pitch; write e.g. C#5, Bb3 or a MIDI number.`
    pitchText.value = note.value ? pitchName(note.value.pitch) : ''
    return
  }
  void commit(pitchOp(focus.value.notes, midi))
}

function commitStart(): void {
  const m = model.value
  if (!m) return
  const onset = onsetFrom(m, Number(startBar.value), Number(startOffset.value))
  if (onset === null) {
    problem.value = 'That position is not in the score (bar, and units from the start of the bar).'
    return
  }
  if (note.value) void commit(startOp(m, note.value, onset))
  else if (chord.value) void commit(chordMoveOp(chord.value, onset))
}

function commitLength(units: number = Number(lengthUnits.value)): void {
  const m = model.value
  if (!m || !note.value) return
  void commit(lengthOp(m, note.value, units, overwrite.value ? 'overwrite' : props.resizeMode))
}

function commitChord(): void {
  const onset = note.value?.onset ?? chord.value?.onset
  if (onset === undefined) return
  void commit(chordOp(onset, chordText.value, note.value ? focus.value.chordAtNote : chord.value))
}

function remove(closeGap: boolean): void {
  const ids = [...focus.value.notes.map((n) => n.id), ...focus.value.chords.map((c) => c.id)]
  if (ids.length) void commit({ op: closeGap ? 'delete_close_gap' : 'delete', ids })
}
</script>

<template>
  <aside class="inspector" aria-label="Inspector">
    <p v-if="!model" class="facts">{{ view?.model_error?.message ?? 'No score.' }}</p>
    <template v-else>
      <section v-if="focus.notes.length" class="panel" aria-label="Selected notes">
        <h4>
          {{ note ? `${track === 'vocal' ? 'Vocal' : 'Ins'} note` : `${focus.notes.length} notes` }}
          <span v-if="position" class="facts">{{ position.text }}</span>
        </h4>
        <div class="field" role="group" aria-label="Voice">
          <span class="name">voice</span>
          <button :class="{ active: track === 'vocal' }" :disabled="!editable" @click="commit(voiceOp(focus.notes, 'vocal'))">Vocal</button>
          <button :class="{ active: track === 'ins' }" :disabled="!editable" @click="commit(voiceOp(focus.notes, 'ins'))">Ins</button>
        </div>
        <div class="field" role="group" aria-label="Pitch">
          <span class="name">pitch</span>
          <button :disabled="!editable" title="Octave down" @click="commit(shiftOp(focus.notes, -12, focus.chords))">−8va</button>
          <button :disabled="!editable" title="Semitone down" @click="commit(shiftOp(focus.notes, -1, focus.chords))">−1</button>
          <input
            v-if="note"
            v-model="pitchText"
            class="pitch"
            :disabled="!editable"
            aria-label="Pitch (e.g. C#5 or a MIDI number)"
            @keydown.enter.prevent="commitPitch"
            @change="commitPitch"
          />
          <button :disabled="!editable" title="Semitone up" @click="commit(shiftOp(focus.notes, 1, focus.chords))">+1</button>
          <button :disabled="!editable" title="Octave up" @click="commit(shiftOp(focus.notes, 12, focus.chords))">+8va</button>
        </div>
        <template v-if="note">
          <div class="field" role="group" aria-label="Start">
            <span class="name">start</span>
            bar
            <input v-model.number="startBar" class="number" type="number" min="1" :disabled="!editable" aria-label="Bar" @keydown.enter.prevent="commitStart" @change="commitStart" />
            +
            <input
              v-model.number="startOffset"
              class="number"
              type="number"
              min="0"
              :disabled="!editable"
              :aria-label="`Units of ${model.unit} from the start of the bar`"
              @keydown.enter.prevent="commitStart"
              @change="commitStart"
            />
            <span class="facts">× {{ model.unit }}</span>
          </div>
          <div class="field" role="group" aria-label="Length">
            <span class="name">length</span>
            <input
              v-model.number="lengthUnits"
              class="number"
              type="number"
              min="1"
              :disabled="!editable"
              :aria-label="`Length in units of ${model.unit}`"
              @keydown.enter.prevent="commitLength()"
              @change="commitLength()"
            />
            <select :disabled="!editable" aria-label="Length as a note value" :value="''" @change="commitLength(Number(($event.target as HTMLSelectElement).value))">
              <option value="" disabled>note value…</option>
              <option v-for="choice in choices" :key="choice.label" :value="choice.units">{{ choice.label }}</option>
            </select>
          </div>
          <label class="field" title="Longer notes play over the following notes of the voice (they are shortened or removed)">
            <input v-model="overwrite" type="checkbox" :disabled="!editable" /> longer: over the next note
          </label>
          <div class="field" role="group" aria-label="Chord symbol at the note">
            <span class="name">chord</span>
            <input
              v-model="chordText"
              class="chord"
              placeholder="none"
              :disabled="!editable"
              aria-label="Chord symbol where the note starts (empty removes it)"
              @keydown.enter.prevent="commitChord"
              @change="commitChord"
            />
          </div>
        </template>
        <div class="field">
          <button :disabled="!editable" title="The notes become rests; bars keep their length (Delete)" @click="remove(false)">→ rest</button>
          <button :disabled="!editable" title="Delete, and let the note before take the time (Shift+Delete)" @click="remove(true)">close gap</button>
        </div>
      </section>

      <section v-else-if="chord" class="panel" aria-label="Selected chord symbol">
        <h4>
          Chord symbol <span v-if="position" class="facts">{{ position.text }}</span>
        </h4>
        <div class="field">
          <span class="name">name</span>
          <input v-model="chordText" class="chord" :disabled="!editable" aria-label="Chord symbol (empty removes it)" @keydown.enter.prevent="commitChord" @change="commitChord" />
        </div>
        <div class="field" role="group" aria-label="Transpose the chord symbol">
          <span class="name">pitch</span>
          <button :disabled="!editable" title="A semitone down (↓), spelled for the key" @click="commit(shiftOp([], -1, focus.chords))">−1</button>
          <button :disabled="!editable" title="A semitone up (↑), spelled for the key" @click="commit(shiftOp([], 1, focus.chords))">+1</button>
        </div>
        <div class="field" role="group" aria-label="Start">
          <span class="name">start</span>
          bar
          <input v-model.number="startBar" class="number" type="number" min="1" :disabled="!editable" aria-label="Bar" @keydown.enter.prevent="commitStart" @change="commitStart" />
          +
          <input v-model.number="startOffset" class="number" type="number" min="0" :disabled="!editable" aria-label="Units from the start of the bar" @keydown.enter.prevent="commitStart" @change="commitStart" />
        </div>
        <div class="field">
          <button :disabled="!editable" @click="remove(false)">remove</button>
        </div>
      </section>

      <section v-else-if="focus.chords.length > 1" class="panel" aria-label="Selected chord symbols">
        <h4>{{ focus.chords.length }} chord symbols <span class="facts">{{ focus.chords.map((c) => c.name).join(' ') }}</span></h4>
        <div class="field" role="group" aria-label="Transpose the chord symbols">
          <span class="name">pitch</span>
          <button :disabled="!editable" title="All a semitone down (↓), each spelled for its key" @click="commit(shiftOp([], -1, focus.chords))">−1</button>
          <button :disabled="!editable" title="All a semitone up (↑), each spelled for its key" @click="commit(shiftOp([], 1, focus.chords))">+1</button>
        </div>
        <div class="field">
          <button :disabled="!editable" title="Remove them (Delete)" @click="remove(false)">remove</button>
        </div>
      </section>

      <section v-if="measure" class="panel" :aria-label="`Bar ${measure.n}`">
        <h4>
          Bar {{ measure.n }} <span class="facts">{{ measure.meter }} · {{ measure.key }}</span>
        </h4>
        <div class="field" role="group" aria-label="Bars">
          <button :disabled="!editable" title="Insert an empty bar before this one" @click="commit(insertBarsOp(measure, 'before'))">+ before</button>
          <button :disabled="!editable" title="Insert an empty bar after this one" @click="commit(insertBarsOp(measure, 'after'))">+ after</button>
          <button :disabled="!editable" title="Insert a copy of this bar after it" @click="commit(duplicateBarsOp(measure))">duplicate</button>
          <button :disabled="!editable || model.measures.length < 2" title="Delete this bar in both voices" @click="commit(deleteBarsOp(model, measure))">delete</button>
        </div>
        <div class="field" role="group" aria-label="Meter">
          <span class="name">meter</span>
          <input v-model="meterText" class="meter" list="plenio-meters" :disabled="!editable" aria-label="Meter of this bar (empty bars only)" @keydown.enter.prevent="commit(meterOp(measure, meterText))" @change="commit(meterOp(measure, meterText))" />
          <datalist id="plenio-meters">
            <option v-for="value in METERS" :key="value" :value="value" />
          </datalist>
        </div>
        <div class="field" role="group" aria-label="Key">
          <span class="name">key</span>
          <select v-model="keyChoice" :disabled="!editable" aria-label="Key from this bar on" @change="commit(keyOp(measure, keyChoice))">
            <option v-for="value in KEYS" :key="value" :value="value">{{ value }}</option>
          </select>
          <button v-if="keyChange" :disabled="!editable" title="Remove the key change at this bar" @click="commit(removeKeyOp(model, measure))">remove change</button>
        </div>
      </section>

      <p v-if="!focus.notes.length && !chord && !measure" class="facts">
        Select a note (piano roll or notation), a chord symbol or a bar.
      </p>
      <p v-if="problem" class="error">{{ problem }}</p>
    </template>
  </aside>
</template>
