<script setup lang="ts">
/**
 * The transport's recording controls (owner's request 2026-10-03): *● rec* (Shift+R), *step* input and
 * the 🎹 panel - the MIDI keyboard (with an activity light), count-in, quantize, replace or merge,
 * muting the recorded voice's old notes, hearing the keys and the step length. Everything says where it
 * records to: the roll's *draw into* voice.
 */
import { computed, onBeforeUnmount, ref } from 'vue'

import type { MidiHub } from './midiInput'
import type { RecordSettings } from './midiRecording'

const props = defineProps<{
  hub: MidiHub
  recording: boolean
  countingIn: boolean
  step: boolean
  /** ``Vocal`` or ``Ins``: where the keys go. */
  target: string
  disabled: string | null
}>()
const settings = defineModel<RecordSettings>('settings', { required: true })
const emit = defineEmits<{ record: []; stop: []; step: []; rest: []; enable: [] }>()

const open = ref(false)
const now = ref(performance.now())
const timer = setInterval(() => (now.value = performance.now()), 120)
onBeforeUnmount(() => clearInterval(timer))
/** The chosen keyboard's name while it is unplugged (then every keyboard is listened to). */
const unplugged = computed(() => {
  const chosen = props.hub.selected.value
  if (chosen === 'all') return null
  const device = props.hub.devices.value.find((d) => d.id === chosen)
  return device?.connected ? null : (device?.name ?? 'the chosen keyboard')
})
/** The activity light: a key in the last quarter second. */
const active = computed(() => now.value - props.hub.activity.value < 250)
const status = computed(() => {
  const hub = props.hub
  if (hub.status.value === 'ready') {
    const connected = hub.devices.value.filter((d) => d.connected)
    if (!connected.length) return 'no MIDI keyboard connected - plug one in'
    if (unplugged.value) return `${unplugged.value} is unplugged - listening to every keyboard until it is back`
    return `${connected.length} keyboard${connected.length > 1 ? 's' : ''} connected`
  }
  if (hub.status.value === 'asking') return 'asking for MIDI access…'
  if (hub.status.value === 'off') return 'MIDI is off until you press rec, step or "use MIDI"'
  return hub.problem.value ?? 'MIDI is not available'
})
const recTitle = computed(() =>
  props.disabled ??
  (props.recording
    ? 'Stop and keep the take (Space); Esc throws it away'
    : `Record from the cursor into ${props.target} with a MIDI keyboard (Shift+R)${settings.value.countIn ? `, after ${settings.value.countIn} bar${settings.value.countIn > 1 ? 's' : ''} of count-in` : ''}`)
)

function set<K extends keyof RecordSettings>(key: K, value: RecordSettings[K]): void {
  settings.value = { ...settings.value, [key]: value }
}
</script>

<template>
  <span class="record" role="group" aria-label="Record with a MIDI keyboard">
    <button
      class="rec"
      :class="{ on: recording, counting: countingIn }"
      :disabled="!!disabled && !recording"
      :title="recTitle"
      @click="recording ? emit('stop') : emit('record')"
    >
      ● {{ recording ? (countingIn ? 'count-in' : 'rec') : 'rec' }}
    </button>
    <button
      class="step"
      :class="{ on: step }"
      :disabled="!!disabled || recording"
      :title="disabled ?? (step ? 'Step input is on: a key writes a note at the cursor and moves it on - click to stop' : `Step input into ${target}: every key writes a note of the step length at the cursor`)"
      @click="emit('step')"
    >
      step
    </button>
    <button v-if="step" title="A rest: the cursor moves on by one step" @click="emit('rest')">rest ▶</button>
    <span class="midi-light" :class="{ active, ready: hub.status.value === 'ready' }" :title="status" aria-hidden="true" />
    <span class="midi-settings">
      <button :aria-expanded="open" title="MIDI keyboard and recording settings" @click="open = !open">🎹</button>
      <span v-if="open" class="midi-panel" role="dialog" aria-label="MIDI and recording">
        <button class="close" aria-label="Close" @click="open = false">×</button>
        <strong>MIDI keyboard</strong>
        <span class="facts">{{ status }}</span>
        <label v-if="hub.status.value === 'ready'">
          keyboard
          <select :value="hub.selected.value" aria-label="MIDI keyboard" @change="hub.selected.value = ($event.target as HTMLSelectElement).value">
            <option value="all">all keyboards</option>
            <option v-for="device in hub.devices.value.filter((d) => d.connected)" :key="device.id" :value="device.id">{{ device.name }}</option>
            <option v-if="unplugged" :value="hub.selected.value" disabled>{{ unplugged }} (unplugged)</option>
          </select>
        </label>
        <button v-else-if="hub.status.value !== 'asking'" title="Ask the browser for MIDI access" @click="emit('enable')">use MIDI</button>
        <label title="Hear the keys you play (for keyboards without a sound of their own)">
          <input :checked="settings.thru" type="checkbox" @change="set('thru', ($event.target as HTMLInputElement).checked)" /> hear the keys
        </label>
        <strong>Recording into {{ target }}</strong>
        <span class="facts">The voice is the roll's <em>draw into</em>; the take starts at the cursor.</span>
        <label>
          count-in
          <select :value="settings.countIn" aria-label="Count-in" @change="set('countIn', Number(($event.target as HTMLSelectElement).value))">
            <option :value="0">none</option>
            <option :value="1">1 bar</option>
            <option :value="2">2 bars</option>
          </select>
        </label>
        <label title="Where the take's starts and ends go">
          quantize
          <select :value="settings.quantize" aria-label="Quantize the take" @change="set('quantize', Number(($event.target as HTMLSelectElement).value))">
            <option :value="4">1/4</option>
            <option :value="8">1/8</option>
            <option :value="16">1/16</option>
            <option :value="32">1/32</option>
            <option :value="0">off (the score's finest)</option>
          </select>
        </label>
        <label title="replace: from the start to the stop the voice plays only the take; merge: what you did not play over stays">
          mode
          <select :value="settings.mode" aria-label="Replace or merge" @change="set('mode', ($event.target as HTMLSelectElement).value as RecordSettings['mode'])">
            <option value="replace">replace</option>
            <option value="merge">merge</option>
          </select>
        </label>
        <label title="Silence the old notes of the recorded voice while recording">
          <input :checked="settings.mute" type="checkbox" @change="set('mute', ($event.target as HTMLInputElement).checked)" /> mute its old notes
        </label>
        <strong>Step input</strong>
        <label>
          step
          <select :value="settings.stepLength" aria-label="Step length" @change="set('stepLength', Number(($event.target as HTMLSelectElement).value))">
            <option :value="1">1/1</option>
            <option :value="2">1/2</option>
            <option :value="4">1/4</option>
            <option :value="8">1/8</option>
            <option :value="16">1/16</option>
          </select>
        </label>
      </span>
    </span>
  </span>
</template>
