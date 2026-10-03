<script setup lang="ts">
/**
 * Playback of the score (simple tones from the backend's resolved pitches) from the cursor - and for a
 * cover the source recording on the same clock, like an audio track under the MIDI (owner's request
 * 2026-10-03). Like Cubase's transport: play starts at the cursor and the cursor stays there on stop; a
 * click in the ruler while it plays jumps there; *loop* plays to the end of the selection's bars (or the
 * cursor's section) and then repeats them (Cubase: cycle).
 *
 * With a source (``source``: the decoded recording, ``timelineBars``: the source's bar of every score
 * bar) every bar plays as long as the recording's bar (``playClock``), so the notes, the metronome and
 * the recording stay together, and an arranged cover's copied chorus plays the source's chorus again.
 * *hear* chooses the notes and the source together, or one of them - switched at once while it plays
 * (A/B). The playback time is reported in score seconds (``time``) for the line in the piano roll.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import {
  type GuidePlayback,
  type PlayOptions,
  TIME_TOLERANCE,
  type VoiceSwitches,
  playClock,
  schedule,
  scoreTime,
  sounding,
  sourceSegments
} from '../../shared/playback'
import { type ScoreView, clock, sectionOfBar } from '../../shared/scoreView'
import { type Levels, TonePlayer } from './player'
import type { DecodedSource } from './sourceAudio'

const props = defineProps<{
  view: ScoreView | null
  /** The cursor's bar (1-based): *loop* loops its section when nothing is selected. */
  bar: number | null
  /** The cursor in score seconds: playback starts there (default: the start of ``bar``). */
  from?: number | null
  /** How the cursor reads (``5.2.1``) for the buttons' titles. */
  position?: string
  /** The source recording's URL (a cover): the transport offers it. */
  reference: string | null
  /** The source's bar for every score bar (``null``: the source has none - an inserted bar). */
  timelineBars: ([number, number, string] | null)[] | undefined
  /** The Guide notes to play (score seconds); only with ``voices.guide``. */
  guide?: GuidePlayback[]
  /** The decoded source recording (``null`` while it loads or when there is none). */
  source?: DecodedSource | null
  /** Why the source cannot be heard (it is loading, could not be read ...); ``null``: it can. */
  sourceProblem?: string | null
  /** What *loop* repeats when something is selected: score seconds and a label (``bars 12-13``). */
  loopRange?: { from: number; to: number; label: string } | null
  /** A beat of the source at the cursor (seconds): the step of *align* by a beat. */
  sourceBeat?: number
}>()
const voices = defineModel<VoiceSwitches>('voices', { required: true })
const speed = defineModel<number>('speed', { required: true })
const metronome = defineModel<boolean>('metronome', { default: false })
const hear = defineModel<'both' | 'notes' | 'source'>('hear', { default: 'both' })
const sourceLevel = defineModel<number>('sourceLevel', { default: 0.7 })
/** How far the source recording is moved against the bars (seconds, + later): the beat grid by hand. */
const sourceShift = defineModel<number>('sourceShift', { default: 0 })
const aligning = ref(false)

function nudge(seconds: number): void {
  sourceShift.value = Math.max(-10, Math.min(10, Math.round((sourceShift.value + seconds) * 1000) / 1000))
}
const shiftLabel = computed(() => {
  const ms = Math.round(sourceShift.value * 1000)
  if (!ms) return 'in place'
  return `${Math.abs(ms)} ms ${ms > 0 ? 'later' : 'earlier'}`
})
const emit = defineEmits<{ cursor: [ids: string[]]; time: [seconds: number | null] }>()

const player = new TonePlayer()
const playing = ref(false)
const loop = ref(false)
const time = ref(0)
const problem = ref<string | null>(null)
let options: PlayOptions | null = null

const startBar = computed(() => props.bar ?? 1)
const startSecond = computed(() => props.from ?? props.view?.bars[startBar.value - 1]?.start_s ?? 0)
const where = computed(() => (props.position ? `the cursor (${props.position})` : `bar ${startBar.value}`))
const canPlay = computed(() => !!props.view?.notes)
/** The source plays on the score's clock at the normal speed only (no time stretching). */
const sourceReady = computed(() => !!props.reference && !!props.source && speed.value === 1)
const sourceNote = computed(() => {
  if (!props.reference) return null
  if (props.sourceProblem) return props.sourceProblem
  if (!props.source) return 'the source recording is loading…'
  if (speed.value !== 1) return 'the source plays at 100 % only'
  return null
})

function levels(): Levels {
  const mode = sourceReady.value ? hear.value : 'notes'
  return { tones: mode === 'source' ? 0 : 1, source: mode === 'notes' ? 0 : sourceLevel.value }
}

function barAt(seconds: number): number {
  const bars = props.view?.bars ?? []
  let found = 1
  for (const bar of bars) if (bar.start_s <= seconds + TIME_TOLERANCE) found = bar.index
  return found
}

/** What *loop* repeats (score seconds): the selection's bars, else the section ``second`` is in. */
function loopSpan(second: number): [number, number] | null {
  if (props.loopRange) return [props.loopRange.from, props.loopRange.to]
  const view = props.view
  if (!view) return null
  const section = view.sections[sectionOfBar(view, barAt(second))]
  return section ? [section.start_s, section.end_s] : null
}

function play(from = startSecond.value): void {
  const view = props.view
  if (!view) return
  stop()
  const span = loop.value ? loopSpan(from) : null
  // a cursor after the loop's end starts the loop from its beginning (Cubase: cycle)
  const start = span && (from < span[0] - TIME_TOLERANCE || from >= span[1] - TIME_TOLERANCE) ? span[0] : from
  const withSource = sourceReady.value
  const clock = withSource ? playClock(view, props.timelineBars) : null
  options = {
    from: start,
    to: span ? span[1] : null,
    voices: { ...voices.value },
    speed: speed.value,
    metronome: metronome.value,
    guide: props.guide ?? [],
    clock
  }
  const current = options
  try {
    player.play(schedule(view, current), {
      source: withSource && clock && props.source ? { buffer: props.source.buffer, segments: sourceSegments(clock, start, current.to) } : null,
      levels: levels(),
      onTick: (elapsed) => {
        time.value = scoreTime(current, elapsed)
        emit('cursor', sounding(view, time.value, current.voices))
        emit('time', time.value)
      },
      onEnd: () => {
        // Cubase's cycle: to the loop's end, then the loop again from its start
        if (loop.value && playing.value) play(span?.[0] ?? current.from)
        else stop()
      }
    })
    playing.value = true
    problem.value = null
  } catch (e) {
    problem.value = e instanceof Error ? e.message : String(e)
  }
}

function stop(): void {
  player.stop()
  playing.value = false
  emit('cursor', [])
  emit('time', null)
}

function toggle(): void {
  if (playing.value) stop()
  else play()
}

/** A/B: the notes or the source alone, switched at once (from both: the source). */
function swap(): void {
  hear.value = hear.value === 'source' ? 'notes' : 'source'
}

// A/B and the source's level take effect at once while it plays
watch([hear, sourceLevel], () => {
  if (playing.value) player.setLevels(levels())
})
// a click in the ruler (or a section, Home, End) while it plays: playback jumps there
watch(
  () => props.from,
  (second, before) => {
    if (playing.value && second !== null && second !== undefined && second !== before) play(second)
  }
)

defineExpose({ toggle, stop, swap, playing })
onBeforeUnmount(() => player.close())
</script>

<template>
  <div class="transport" role="group" aria-label="Playback">
    <button :disabled="!canPlay" :title="playing ? 'Stop (Space)' : `Play from ${where} (Space)`" @click="toggle">
      {{ playing ? '■ stop' : '▶ play' }}
    </button>
    <span v-if="reference" class="hear" role="radiogroup" aria-label="Hear">
      <button
        v-for="choice in (['both', 'notes', 'source'] as const)"
        :key="choice"
        role="radio"
        :aria-checked="hear === choice"
        :class="{ active: hear === choice }"
        :disabled="!sourceReady && choice !== 'notes'"
        :title="
          sourceNote ??
          {
            both: 'The notes and the source recording together, bar by bar where the transcription puts them',
            notes: 'The notes alone (A)',
            source: 'The source recording alone (B)'
          }[choice]
        "
        @click="hear = choice"
      >
        {{ choice }}
      </button>
      <button :disabled="!sourceReady" title="A/B: the notes or the source alone - switched at once, also while it plays" @click="swap">A/B</button>
      <label class="level" :title="`The source's level under the notes: ${Math.round(sourceLevel * 100)} %`">
        source
        <input v-model.number="sourceLevel" type="range" min="0" max="1" step="0.05" :disabled="!sourceReady" aria-label="Source level" />
      </label>
      <span class="align">
        <button
          :class="{ active: sourceShift !== 0 }"
          :aria-expanded="aligning"
          :title="`Align the recording with the bars (it is ${shiftLabel})`"
          @click="aligning = !aligning"
        >
          ⇆ align{{ sourceShift ? ` ${Math.round(sourceShift * 1000)} ms` : '' }}
        </button>
        <span v-if="aligning" class="align-panel" role="group" aria-label="Align the source recording">
          <span class="facts">
            The recording runs ahead of or behind the bars (the beat detection was off)? Move it: the waveform, the playback
            and the sung pitch follow. Kept with the sheet.
          </span>
          <button :title="`One beat earlier (${Math.round((sourceBeat ?? 0.5) * 1000)} ms)`" @click="nudge(-(sourceBeat ?? 0.5))">◀◀ beat</button>
          <button title="10 ms earlier" @click="nudge(-0.01)">◀ 10 ms</button>
          <strong>{{ shiftLabel }}</strong>
          <button title="10 ms later" @click="nudge(0.01)">10 ms ▶</button>
          <button :title="`One beat later (${Math.round((sourceBeat ?? 0.5) * 1000)} ms)`" @click="nudge(sourceBeat ?? 0.5)">beat ▶▶</button>
          <button :disabled="!sourceShift" title="Back to the transcription's beat grid" @click="sourceShift = 0">reset</button>
        </span>
      </span>
      <span v-if="sourceNote" class="facts">{{ sourceNote }}</span>
    </span>
    <label :title="loopRange ? `Play to the end of the selection (${loopRange.label}), then repeat it` : 'Play to the end of the cursor\'s section, then repeat it (select notes to loop their bars)'">
      <input v-model="loop" type="checkbox" /> loop {{ loopRange ? loopRange.label : 'section' }}
    </label>
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
      {{ playing ? `▶ ${clock(time)}` : `${position ? `cursor ${position} · ` : ''}a guide to the notes, not the model's sound` }}
    </span>
    <span v-if="problem" class="error">{{ problem }}</span>
  </div>
</template>
