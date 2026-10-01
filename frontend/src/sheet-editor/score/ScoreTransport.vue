<script setup lang="ts">
/**
 * Playback of the score (simple tones from the backend's resolved pitches) from the cursor, and
 * A/B listening against the source recording from the cursor's bar. Like Cubase's transport: play
 * starts at the cursor and the cursor stays there on stop; *loop section* plays on to the end of the
 * cursor's section and then repeats that section (Cubase: cycle). The playback time is reported
 * (``time``) for the line in the piano roll - in source mode mapped onto the score's bars.
 */
import { computed, onBeforeUnmount, ref } from 'vue'

import {
  type GuidePlayback,
  type PlayOptions,
  TIME_TOLERANCE,
  type VoiceSwitches,
  schedule,
  scoreTime,
  sounding,
  sourceSecond
} from '../../shared/playback'
import { type ScoreView, clock, sectionOfBar } from '../../shared/scoreView'
import { scoreSecondOfSource } from './locator'
import { TonePlayer } from './player'

const props = defineProps<{
  view: ScoreView | null
  /** The cursor's bar (1-based): the source starts there, *loop section* loops its section. */
  bar: number | null
  /** The cursor in score seconds: the notes start there (default: the start of ``bar``). */
  from?: number | null
  /** How the cursor reads (``5.2.1``) for the buttons' titles. */
  position?: string
  reference: string | null
  timelineBars: [number, number, string][] | undefined
  /** The Guide notes to play (score seconds); only with ``voices.guide``. */
  guide?: GuidePlayback[]
}>()
const voices = defineModel<VoiceSwitches>('voices', { required: true })
const speed = defineModel<number>('speed', { required: true })
const metronome = defineModel<boolean>('metronome', { default: false })
const emit = defineEmits<{ cursor: [ids: string[]]; time: [seconds: number | null] }>()

const player = new TonePlayer()
const mode = ref<'notes' | 'source' | null>(null)
const loop = ref(false)
const time = ref(0)
const problem = ref<string | null>(null)
const audio = ref<HTMLAudioElement | null>(null)
let options: PlayOptions | null = null

const startBar = computed(() => props.bar ?? 1)
const startSecond = computed(() => props.from ?? props.view?.bars[startBar.value - 1]?.start_s ?? 0)
const where = computed(() => (props.position ? `the cursor (${props.position})` : `bar ${startBar.value}`))
const canPlay = computed(() => !!props.view?.notes)

function barAt(seconds: number): number {
  const bars = props.view?.bars ?? []
  let found = 1
  for (const bar of bars) if (bar.start_s <= seconds + TIME_TOLERANCE) found = bar.index
  return found
}

/** The section (start and end in score seconds) that *loop section* repeats: the one ``second`` is in. */
function loopSection(second: number): [number, number] | null {
  const view = props.view
  if (!view) return null
  const section = view.sections[sectionOfBar(view, barAt(second))]
  return section ? [section.start_s, section.end_s] : null
}

function playNotes(from = startSecond.value): void {
  const view = props.view
  if (!view) return
  stop()
  const section = loop.value ? loopSection(from) : null
  options = {
    from,
    to: section ? section[1] : null,
    voices: { ...voices.value },
    speed: speed.value,
    metronome: metronome.value,
    guide: props.guide ?? []
  }
  const current = options
  try {
    player.play(schedule(view, current), {
      onTick: (elapsed) => {
        time.value = scoreTime(current, elapsed)
        emit('cursor', sounding(view, time.value, current.voices))
        emit('time', time.value)
      },
      onEnd: () => {
        // Cubase's cycle: from the cursor to the section's end, then the section again from its start
        if (loop.value && mode.value === 'notes') playNotes(loopSection(current.from)?.[0] ?? current.from)
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
  emit('time', null)
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
  if (props.view) emit('time', scoreSecondOfSource(props.view, element.currentTime, props.timelineBars))
}

defineExpose({ toggle, stop })
onBeforeUnmount(() => player.close())
</script>

<template>
  <div class="transport" role="group" aria-label="Playback">
    <button :disabled="!canPlay" :title="mode ? 'Stop (Space)' : `Play the notes from ${where} (Space)`" @click="toggle">
      {{ mode ? '■ stop' : '▶ notes' }}
    </button>
    <button
      v-if="reference"
      :title="`Play the source recording from bar ${startBar} (the cursor's bar)`"
      @click="mode === 'source' ? stop() : playSource()"
    >
      {{ mode === 'source' ? '■ stop' : '▶ source' }}
    </button>
    <button v-if="reference" :disabled="!mode" title="A/B: switch between notes and source at the current bar" @click="swap">
      A/B
    </button>
    <label title="Play to the end of the cursor's section, then repeat that section"><input v-model="loop" type="checkbox" /> loop section</label>
    <label title="A click on every beat (takes effect at the next start)"><input v-model="metronome" type="checkbox" /> metronome</label>
    <span class="switches" role="group" aria-label="Voices to play">
      <label><input v-model="voices.Vocal" type="checkbox" /> Vocal</label>
      <label><input v-model="voices.Ins" type="checkbox" /> Ins</label>
      <label><input v-model="voices.chords" type="checkbox" /> chords</label>
      <label v-if="guide?.length" title="The Guide track: playback and MIDI only, never sent to YuE2">
        <input
          :checked="voices.guide !== false"
          type="checkbox"
          aria-label="Play the Guide track"
          @change="voices = { ...voices, guide: ($event.target as HTMLInputElement).checked }"
        />
        Guide
      </label>
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
    <span class="facts">
      {{ mode ? `${mode} ${clock(time)}` : `${position ? `cursor ${position} · ` : ''}a guide to the notes, not the model's sound` }}
    </span>
    <span v-if="problem" class="error">{{ problem }}</span>
    <audio v-if="reference" ref="audio" :src="reference" preload="metadata" @timeupdate="onSourceTime" @ended="stop" />
  </div>
</template>
