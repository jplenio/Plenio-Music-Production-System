/**
 * Recording and step input with a MIDI keyboard in the Score tab (owner's request 2026-10-03).
 *
 * *rec*: playback starts at the cursor after a count-in, the voice being recorded is muted (choice),
 * every key goes into a ``Take`` at the score position the listener heard it at, and the notes show
 * in the roll while they are played. Stop (the button, Space, the score's end) writes the take as one
 * undo step - *replace* clears what the voice played from the start to the stop, *merge* keeps what was
 * not played over; Esc throws it away. Nothing played: nothing changes.
 *
 * *step*: without playback, a key writes a note of the step length at the cursor and moves the cursor
 * on (keys pressed together: the highest); *rest* moves on without a note.
 *
 * The keys are heard while held (``thru``) - many controllers have no sound of their own.
 */
import { type Ref, computed, ref, shallowRef } from 'vue'

import type { ScoreOperation } from '../../api/client'
import type { ScoreView } from '../../shared/scoreView'
import { secondsOfUnit, unitOfSeconds } from './locator'
import type { MidiHub, MidiNoteEvent } from './midiInput'
import type { Track } from './pianoRoll'
import { KeyMonitor } from './player'
import { CHORD_SECONDS, type RecordMode, Take, gridUnits, lineOf, recordOperation } from './recorder'

export interface RecordSettings {
  /** Bars of clicks before the cursor (0-2). */
  countIn: number
  /** Note value the take's starts and ends go to (4, 8, 16, 32; 0: the score's finest unit). */
  quantize: number
  mode: RecordMode
  /** Silence the recorded voice's old notes while recording. */
  mute: boolean
  /** Hear the keys while they are held. */
  thru: boolean
  /** The note value step input writes (1, 2, 4, 8, 16). */
  stepLength: number
}

export interface TransportLike {
  record: (from: number, recording: { countIn: number; mute: 'Vocal' | 'Ins' | null }) => boolean
  scoreSecondAt: (perfMs: number) => number | null
  stop: () => void
}

export interface RecordingDeps {
  hub: MidiHub
  transport: () => TransportLike | null
  view: () => ScoreView | null
  locator: Ref<number>
  track: () => Track
  readonly: () => boolean
  settings: () => RecordSettings
  operate: (operation: ScoreOperation) => Promise<boolean>
  notify: (text: string) => void
  problem: (text: string | null) => void
}

const STEP_CHORD_MS = 40

export function useMidiRecording(deps: RecordingDeps) {
  const recording = ref(false)
  const step = ref(false)
  const take = shallowRef<Take | null>(null)
  const now = ref(0)
  const monitor = new KeyMonitor()
  let discard = false
  let unsubscribe: (() => void) | null = null
  let pendingStep: { pitches: number[]; timer: ReturnType<typeof setTimeout> } | null = null

  /** Bumped with every key, so the live picture follows between playback ticks. */
  const tick = ref(0)
  /** The take as it grows (for the roll): one line, not yet on the grid. */
  const live = computed(() => {
    const current = take.value
    if (!current || !recording.value) return []
    void tick.value
    return current
      .played(now.value)
      .filter((p) => p.end !== null && p.end > p.start)
      .map((p) => ({ onset: p.start, duration: (p.end as number) - p.start, pitch: p.pitch }))
  })
  function listen(): void {
    unsubscribe ??= deps.hub.subscribe(onEvent)
  }

  /** Ask for MIDI and listen; ``false`` (with the reason shown) when there is none. */
  async function ready(): Promise<boolean> {
    const ok = await deps.hub.enable()
    deps.problem(ok ? null : deps.hub.problem.value)
    if (ok) listen()
    return ok
  }

  function unitAt(seconds: number): number | null {
    const view = deps.view()
    return view ? unitOfSeconds(view, Math.max(0, seconds)) : null
  }

  async function start(): Promise<void> {
    if (recording.value) return
    if (deps.readonly()) {
      deps.problem('This score belongs to the other sheet; record in that sheet.')
      return
    }
    const view = deps.view()
    if (!view?.model) return
    if (!(await ready())) return
    step.value = false
    const settings = deps.settings()
    const track = deps.track()
    const startUnit = Math.min(deps.locator.value, view.model.total - 1)
    const transport = deps.transport()
    if (!transport) return
    take.value = new Take(startUnit, track)
    discard = false
    recording.value = true
    now.value = startUnit
    const started = transport.record(secondsOfUnit(view, startUnit), {
      countIn: settings.countIn,
      mute: settings.mute ? (track === 'vocal' ? 'Vocal' : 'Ins') : null
    })
    if (!started) {
      recording.value = false
      take.value = null
      deps.problem('Playback could not start, so nothing can be recorded.')
      return
    }
    deps.notify(`recording into ${track === 'vocal' ? 'Vocal' : 'Ins'} from bar ${barLabel(view, startUnit)} - Space or ■ stop keeps it, Esc throws it away`)
  }

  /** Stop and keep the take (the transport's stop ends the recording through ``stopped``). */
  function stop(): void {
    deps.transport()?.stop()
  }

  /** Stop and throw the take away. */
  function cancel(): void {
    if (!recording.value) return
    discard = true
    deps.transport()?.stop()
  }

  /** The playback line moved (score seconds): the live notes grow to it. */
  function onTime(seconds: number | null): void {
    if (!recording.value || seconds === null) return
    const unit = unitAt(seconds)
    if (unit !== null) now.value = unit
  }

  /** Playback ended (stop, Space, the score's end): the take is written - or thrown away. */
  async function onStopped(): Promise<void> {
    if (!recording.value) return
    const current = take.value
    const view = deps.view()
    recording.value = false
    take.value = null
    monitor.allOff()
    const model = view?.model
    if (!current || !model) return
    if (discard) {
      deps.notify('recording thrown away')
      return
    }
    const stopUnit = Math.max(now.value, current.start)
    const bar = model.measures.find((m) => m.onset <= current.start && current.start < m.onset + m.length) ?? model.measures[0]
    const timing = view.bars[(bar?.n ?? 1) - 1]
    const unitsPerSecond = bar && timing?.duration_s ? bar.length / timing.duration_s : 8
    const beats = Number(bar?.meter.split('/')[0]) || 4
    const notes = lineOf(current.finish(stopUnit), {
      start: current.start,
      stop: stopUnit,
      total: model.total,
      grid: gridUnits(model.unit, deps.settings().quantize),
      chordUnits: CHORD_SECONDS * unitsPerSecond,
      pickup: (bar?.length ?? 16) / beats / 2
    })
    if (!notes.length) {
      deps.notify('nothing recorded - no key was played (is the keyboard chosen in 🎹?)')
      return
    }
    await deps.operate(recordOperation(current.track, notes, current.start, stopUnit, deps.settings().mode))
  }

  function onEvent(event: MidiNoteEvent): void {
    const settings = deps.settings()
    if (settings.thru) {
      if (event.kind === 'on') monitor.on(event.note, event.velocity)
      else monitor.off(event.note)
    }
    if (recording.value && take.value) {
      const seconds = deps.transport()?.scoreSecondAt(event.time) ?? null
      const view = deps.view()
      if (seconds === null || !view) return
      const unit = unitOfKey(view, take.value.start, seconds)
      if (unit === null) return
      if (event.kind === 'on') take.value.noteOn(event.note, unit)
      else take.value.noteOff(event.note, unit)
      tick.value++
      return
    }
    if (step.value && event.kind === 'on') stepKey(event.note)
  }

  function stepKey(pitch: number): void {
    if (pendingStep) {
      pendingStep.pitches.push(pitch)
      return
    }
    pendingStep = { pitches: [pitch], timer: setTimeout(() => void writeStep(), STEP_CHORD_MS) }
  }

  async function writeStep(): Promise<void> {
    const pitches = pendingStep?.pitches ?? []
    pendingStep = null
    const view = deps.view()
    const model = view?.model
    if (!model || !pitches.length || deps.readonly()) return
    const length = gridUnits(model.unit, deps.settings().stepLength)
    const onset = deps.locator.value
    if (onset >= model.total) {
      deps.notify('step input reached the end of the score - add bars or set the cursor')
      return
    }
    const ok = await deps.operate({
      op: 'place_notes',
      track: deps.track(),
      notes: [{ onset, duration: Math.min(length, model.total - onset), pitch: Math.max(...pitches) }],
      label: 'step'
    })
    if (ok) deps.locator.value = Math.min(model.total, onset + length)
  }

  /** Step input: the cursor on by one step, no note (a rest - what the voice played there stays). */
  function rest(): void {
    const model = deps.view()?.model
    if (!model) return
    deps.locator.value = Math.min(model.total, deps.locator.value + gridUnits(model.unit, deps.settings().stepLength))
  }

  async function toggleStep(): Promise<void> {
    if (step.value) {
      step.value = false
      return
    }
    if (deps.readonly()) {
      deps.problem('This score belongs to the other sheet; enter notes in that sheet.')
      return
    }
    if (await ready()) {
      step.value = true
      deps.notify(`step input into ${deps.track() === 'vocal' ? 'Vocal' : 'Ins'}: a key writes a note at the cursor and moves it on`)
    }
  }

  function dispose(): void {
    unsubscribe?.()
    unsubscribe = null
    if (pendingStep) clearTimeout(pendingStep.timer)
    monitor.close()
  }

  return { recording, step, live, start, stop, cancel, onTime, onStopped, toggleStep, rest, ready, dispose }
}

/**
 * The score unit of a key played at score second ``seconds``. Before the take's start (the count-in) it
 * is counted back from the start at the start bar's pace - also before bar 1 - so the take can tell a
 * key just early (it lands on the start) from one long before.
 */
export function unitOfKey(view: ScoreView, start: number, seconds: number): number | null {
  const model = view.model
  if (!model) return null
  const startSeconds = secondsOfUnit(view, start)
  if (seconds >= startSeconds) return unitOfSeconds(view, seconds)
  const bar = model.measures.find((m) => m.onset <= start && start < m.onset + m.length) ?? model.measures[0]
  const timing = view.bars[(bar?.n ?? 1) - 1]
  const perSecond = bar && timing?.duration_s ? bar.length / timing.duration_s : 8
  return start - (startSeconds - seconds) * perSecond
}

function barLabel(view: ScoreView, unit: number): number {
  let bar = 1
  for (const measure of view.model?.measures ?? []) if (measure.onset <= unit) bar = measure.n
  return bar
}
