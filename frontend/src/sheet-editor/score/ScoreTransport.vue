<script setup lang="ts">
/**
 * Playback of the score (simple tones from the backend's resolved pitches) with a cursor,
 * and A/B listening against the source recording from the selected bar.
 */
import { computed, onBeforeUnmount, ref } from 'vue'

import {
  type PlayOptions,
  TIME_TOLERANCE,
  type VoiceSwitches,
  schedule,
  scoreTime,
  sounding,
  sourceSecond
} from '../../shared/playback'
import { type ScoreView, clock, sectionOfBar } from '../../shared/scoreView'
import { TonePlayer } from './player'

const props = defineProps<{
  view: ScoreView | null
  bar: number | null
  reference: string | null
  timelineBars: [number, number, string][] | undefined
}>()
const voices = defineModel<VoiceSwitches>('voices', { required: true })
const speed = defineModel<number>('speed', { required: true })
const emit = defineEmits<{ cursor: [ids: string[]] }>()

const player = new TonePlayer()
const mode = ref<'notes' | 'source' | null>(null)
const loop = ref(false)
const time = ref(0)
const problem = ref<string | null>(null)
const audio = ref<HTMLAudioElement | null>(null)
let options: PlayOptions | null = null

const startBar = computed(() => props.bar ?? 1)
const canPlay = computed(() => !!props.view?.notes)

function barAt(seconds: number): number {
  const bars = props.view?.bars ?? []
  let found = 1
  for (const bar of bars) if (bar.start_s <= seconds + TIME_TOLERANCE) found = bar.index
  return found
}

function loopRange(): [number, number | null] {
  const view = props.view
  if (!view) return [0, null]
  const start = view.bars[startBar.value - 1]?.start_s ?? 0
  if (!loop.value) return [start, null]
  const section = view.sections[sectionOfBar(view, startBar.value)]
  return [start, section ? section.end_s : null]
}

function playNotes(from?: number): void {
  const view = props.view
  if (!view) return
  stop()
  const [start, end] = loopRange()
  options = { from: from ?? start, to: end, voices: { ...voices.value }, speed: speed.value }
  const current = options
  try {
    player.play(schedule(view, current), {
      onTick: (elapsed) => {
        time.value = scoreTime(current, elapsed)
        emit('cursor', sounding(view, time.value, current.voices))
      },
      onEnd: () => {
        if (loop.value && mode.value === 'notes') playNotes()
        else stop()
      }
    })
    mode.value = 'notes'
    problem.value = null
  } catch (e) {
    problem.value = e instanceof Error ? e.message : String(e)
  }
}

function playSource(bar = startBar.value): void {
  const element = audio.value
  const view = props.view
  if (!element || !props.reference || !view) return
  stop()
  element.currentTime = sourceSecond(bar, props.timelineBars, view)
  void element.play().catch((e: unknown) => {
    problem.value = `The source could not be played: ${e instanceof Error ? e.message : String(e)}`
  })
  mode.value = 'source'
}

function stop(): void {
  player.stop()
  audio.value?.pause()
  mode.value = null
  emit('cursor', [])
}

function toggle(): void {
  if (mode.value) stop()
  else playNotes()
}

/** A/B: continue the other way at the current bar. */
function swap(): void {
  if (mode.value === 'notes') playSource(barAt(time.value))
  else if (mode.value === 'source' && audio.value) {
    const second = audio.value.currentTime
    const starts = props.timelineBars ?? []
    let bar = 1
    starts.forEach((item, index) => {
      if (item[0] <= second + 1e-6) bar = index + 1
    })
    const from = props.view?.bars[bar - 1]?.start_s ?? 0
    playNotes(from)
  } else playNotes()
}

function onSourceTime(): void {
  const element = audio.value
  if (!element || mode.value !== 'source') return
  time.value = element.currentTime
}

defineExpose({ toggle, stop })
onBeforeUnmount(() => player.close())
</script>

<template>
  <div class="transport" role="group" aria-label="Playback">
    <button :disabled="!canPlay" :title="mode ? 'Stop (Space)' : `Play the notes from bar ${startBar} (Space)`" @click="toggle">
      {{ mode ? '■ stop' : '▶ notes' }}
    </button>
    <button
      v-if="reference"
      :title="`Play the source recording from bar ${startBar}`"
      @click="mode === 'source' ? stop() : playSource()"
    >
      {{ mode === 'source' ? '■ stop' : '▶ source' }}
    </button>
    <button v-if="reference" :disabled="!mode" title="A/B: switch between notes and source at the current bar" @click="swap">
      A/B
    </button>
    <label title="Repeat the section of the selected bar"><input v-model="loop" type="checkbox" /> loop section</label>
    <span class="switches" role="group" aria-label="Voices to play">
      <label><input v-model="voices.Vocal" type="checkbox" /> Vocal</label>
      <label><input v-model="voices.Ins" type="checkbox" /> Ins</label>
      <label><input v-model="voices.chords" type="checkbox" /> chords</label>
    </span>
    <label title="Practice speed; the score's tempo is not changed">
      speed
      <select v-model.number="speed" aria-label="Playback speed">
        <option :value="0.5">50 %</option>
        <option :value="0.75">75 %</option>
        <option :value="1">100 %</option>
        <option :value="1.25">125 %</option>
      </select>
    </label>
    <span class="facts">{{ mode ? `${mode} ${clock(time)}` : 'a guide to the notes, not the model\'s sound' }}</span>
    <span v-if="problem" class="error">{{ problem }}</span>
    <audio v-if="reference" ref="audio" :src="reference" preload="metadata" @timeupdate="onSourceTime" @ended="stop" />
  </div>
</template>
