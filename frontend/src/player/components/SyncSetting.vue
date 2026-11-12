<script setup lang="ts">
/**
 * Picture and sound together (phase 7.4): the latency the browser reports for the sound's way to the ears, the
 * listener's own correction (-300 to +300 ms) and a test - a tick every second and a flash when it should be heard.
 * The lyrics, the notation's cursor and the visuals' cue follow the heard time (engine.heard).
 */
import { onBeforeUnmount, ref } from 'vue'

import { engine } from '../engine'
import { settings } from '../store'

const reported = ref(Math.round(engine.latency() * 1000))
const testing = ref(false)
const flash = ref(false)
let ctx: AudioContext | null = null
let timers: number[] = []

function stop(): void {
  testing.value = false
  for (const t of timers) window.clearTimeout(t)
  timers = []
  void ctx?.close().catch(() => undefined)
  ctx = null
}

/** Eight ticks a second apart; each flash comes when its tick reaches the ears (this context's own latency, the
 * offset), so with the right offset the two meet. */
function test(): void {
  stop()
  testing.value = true
  ctx = new AudioContext({ latencyHint: 'playback' })
  const audio = ctx
  const lag = Number(audio.outputLatency || audio.baseLatency || 0)
  reported.value = Math.round(lag * 1000)
  const start = audio.currentTime + 0.3
  for (let k = 0; k < 8; k++) {
    const at = start + k
    const tone = audio.createOscillator()
    const gain = audio.createGain()
    tone.frequency.value = 1760
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.5, at + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.06)
    tone.connect(gain).connect(audio.destination)
    tone.start(at)
    tone.stop(at + 0.08)
    const when = (at - audio.currentTime + lag + settings.syncOffset / 1000) * 1000
    timers.push(window.setTimeout(() => {
      flash.value = true
      timers.push(window.setTimeout(() => (flash.value = false), 90))
    }, Math.max(0, when)))
  }
  timers.push(window.setTimeout(stop, 9000))
}

onBeforeUnmount(stop)
</script>

<template>
  <div class="sync">
    <h4>Picture and sound together</h4>
    <p class="hint">The sound reaches your ears {{ reported ? `${reported} ms` : 'with no delay the browser knows of' }} after the page plays it (as the browser reports{{ reported ? '' : ' - a Bluetooth speaker or a television may still add 100 to 250 ms' }}). The lyrics, the notation and the visuals wait for it.</p>
    <label class="field">More or less than that
      <input v-model.number="settings.syncOffset" type="range" min="-300" max="300" step="10" aria-label="Picture and sound: offset in milliseconds" />
      <span class="value">{{ settings.syncOffset > 0 ? '+' : '' }}{{ settings.syncOffset }} ms</span>
    </label>
    <div class="row">
      <button class="ghost small" type="button" @click="testing ? stop() : test()">{{ testing ? 'Stop the test' : 'Test: a tick and a flash' }}</button>
      <span class="lamp" :class="{ on: flash }" aria-hidden="true" />
      <span class="hint">Move the slider until the flash and the tick come together.</span>
    </div>
  </div>
</template>

<style scoped>
.sync {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}
.sync h4 {
  margin: 0;
}
.field {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.field input {
  flex: 1 1 200px;
  max-width: 360px;
}
.value {
  font-variant-numeric: tabular-nums;
  min-width: 64px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.lamp {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.04s;
}
.lamp.on {
  background: #fff;
  box-shadow: 0 0 18px #fff;
}
</style>
