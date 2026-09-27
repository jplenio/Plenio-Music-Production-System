<script setup lang="ts">
/**
 * The DAW layout's track headers (M2/D4-D5): the four tracks - Vocal, Instrument, Chords and the
 * Guide track - with what YuE2 reads each as, how many notes it holds and a playback switch.
 * The Guide track says "not sent to YuE2" in plain words: it is playback and MIDI only.
 *
 * The panel decides nothing musically: what YuE2 receives is the ABC text, and the assignments of
 * the tracks are the ones the renderer reads (V: Vocal, V: Ins, chord symbols).
 */
import { computed } from 'vue'

import type { VoiceSwitches } from '../../shared/playback'
import type { ScoreView } from '../../shared/scoreView'
import { notesLabel, trackRows } from './tracks'

const props = defineProps<{
  view: ScoreView | null
  /** How many Guide notes this sheet keeps (node properties). */
  guideCount: number
  /** Whether this sheet has a Guide track at all (a template's choice). */
  keepsGuide: boolean
  readonly: boolean
  /** The Guide notes are shown when the track is the active one in the roll. */
  guideActive?: boolean
}>()
const voices = defineModel<VoiceSwitches>('voices', { required: true })
const emit = defineEmits<{ clearGuide: [] }>()

const visible = computed(() =>
  trackRows(props.view, props.guideCount).filter((row) => props.keepsGuide || row.voice !== 'guide')
)

function plays(voice: string): boolean {
  return voice === 'guide' ? voices.value.guide !== false : voices.value[voice as 'Vocal'] !== false
}

function toggle(voice: string, on: boolean): void {
  if (voice === 'guide') voices.value = { ...voices.value, guide: on }
  else voices.value = { ...voices.value, [voice]: on }
}
</script>

<template>
  <div class="track-panel" role="group" aria-label="Tracks">
    <h4>Tracks</h4>
    <ul>
      <li
        v-for="row in visible"
        :key="row.voice"
        :class="{ guide: row.voice === 'guide', active: row.voice === 'guide' && guideActive }"
      >
        <span class="dot" :style="{ background: row.color }" aria-hidden="true" />
        <span class="track-name">{{ row.name }}</span>
        <span class="destination" :class="{ unsent: !row.sent }">{{ row.destination }}</span>
        <span class="count">{{ notesLabel(row.notes) }}</span>
        <label class="play" :title="`Play the ${row.name} track`">
          <input
            type="checkbox"
            :checked="plays(row.voice)"
            :aria-label="`Play the ${row.name} track`"
            @change="toggle(row.voice, ($event.target as HTMLInputElement).checked)"
          />
        </label>
        <button
          v-if="row.voice === 'guide' && row.notes > 0 && !readonly"
          class="link"
          title="Remove every Guide note from this sheet"
          @click="emit('clearGuide')"
        >
          clear
        </button>
      </li>
    </ul>
    <p v-if="keepsGuide" class="hint">
      The Guide track is yours alone: it is played here and written into exported MIDI files, and it is
      <strong>never sent to YuE2</strong>. *Import MIDI…* fills it from a file's Guide track.
    </p>
    <p v-else class="hint">This sheet keeps no Guide track; the three tracks above are what YuE2 reads.</p>
  </div>
</template>
