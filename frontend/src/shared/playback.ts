/**
 * What the editor's player plays: the sounding notes and chord symbols of the score view,
 * already resolved by the backend (upstream pitches - no accidental reinterpretation in
 * the browser). Pure functions; the WebAudio player lives in the editor chunk.
 *
 * Playback is a guide to the notes, not a preview of the music model's rendering.
 */
import type { ScoreView, Voice } from './scoreView'

export interface VoiceSwitches {
  Vocal: boolean
  Ins: boolean
  chords: boolean
  /** The Guide track: playback and MIDI only, never sent to YuE2 (DAW layout). */
  guide?: boolean
}

/** A note of the Guide track with its time already in score seconds. */
export interface GuidePlayback {
  start_s: number
  duration_s: number
  midi: number
}

export interface PlayOptions {
  /** Score seconds to start from. */
  from: number
  /** Score seconds to stop (or loop) at; default: the end. */
  to?: number | null
  voices: VoiceSwitches
  /** Speed factor: 1 = the score's tempo, 0.5 = half speed. */
  speed: number
  /** Click on every beat (the first beat of a bar higher). */
  metronome?: boolean
  /** The Guide notes to play (only with ``voices.guide``). */
  guide?: GuidePlayback[]
  /** Bar by bar, how score time becomes playing time (``playClock``); none: the score's own time. */
  clock?: ClockBar[] | null
}

/**
 * One bar of the playing clock: where it is in the score (seconds) and while playing. With a source
 * recording the bars take the recording's time (``source``: its seconds of that bar), so the notes,
 * the metronome and the recording stay together even where the singer drifts from the score's tempo,
 * and an arranged cover's copied chorus plays the source's chorus again.
 */
export interface ClockBar {
  scoreStart: number
  scoreDur: number
  realStart: number
  realDur: number
  source: [number, number] | null
}

/**
 * The playing clock of a score: every bar as long as its source bar (``sourceBars``, the timeline's
 * bars as the score's bars see them; ``null``: a bar the source does not have keeps its own length).
 */
export function playClock(view: ScoreView, sourceBars: readonly ([number, number, string] | null)[] | null | undefined): ClockBar[] {
  const clock: ClockBar[] = []
  let real = 0
  view.bars.forEach((bar, i) => {
    const source = sourceBars?.[i] ?? null
    const span: [number, number] | null = source && source[1] > source[0] ? [source[0], source[1]] : null
    const realDur = span ? span[1] - span[0] : bar.duration_s
    clock.push({ scoreStart: bar.start_s, scoreDur: bar.duration_s, realStart: real, realDur, source: span })
    real += realDur
  })
  return clock
}

function clockBarAt(clock: readonly ClockBar[], second: number, key: 'scoreStart' | 'realStart'): ClockBar | null {
  let found: ClockBar | null = null
  for (const bar of clock) {
    if (bar[key] <= second + TIME_TOLERANCE) found = bar
    else break
  }
  return found ?? clock[0] ?? null
}

/** Playing seconds of score second ``second`` (bar by bar). */
export function toReal(clock: readonly ClockBar[], second: number): number {
  const bar = clockBarAt(clock, second, 'scoreStart')
  if (!bar) return second
  const part = bar.scoreDur > 0 ? (second - bar.scoreStart) / bar.scoreDur : 0
  return bar.realStart + part * bar.realDur
}

/** Score seconds of playing second ``second`` (the inverse of ``toReal``). */
export function toScore(clock: readonly ClockBar[], second: number): number {
  const bar = clockBarAt(clock, second, 'realStart')
  if (!bar) return second
  const part = bar.realDur > 0 ? (second - bar.realStart) / bar.realDur : 0
  return bar.scoreStart + part * bar.scoreDur
}

/** A piece of the source recording to play: ``at`` seconds after the start, from ``offset`` on. */
export interface SourceSegment {
  at: number
  offset: number
  duration: number
}

/**
 * The pieces of the source that play from score second ``from`` to ``to``: bar after bar, joined where
 * the recording runs on (a copied chorus jumps back to the source's chorus; a bar without a source is
 * silent). Seconds of playing time at speed 1.
 */
export function sourceSegments(clock: readonly ClockBar[], from: number, to?: number | null): SourceSegment[] {
  const begin = toReal(clock, from)
  const end = to === null || to === undefined ? Infinity : toReal(clock, to)
  const segments: SourceSegment[] = []
  for (const bar of clock) {
    if (!bar.source) continue
    const barEnd = bar.realStart + bar.realDur
    const start = Math.max(bar.realStart, begin)
    const stop = Math.min(barEnd, end)
    if (stop <= start + TIME_TOLERANCE) continue
    let offset = bar.source[0] + ((start - bar.realStart) / bar.realDur) * (bar.source[1] - bar.source[0])
    let at = start - begin
    let duration = stop - start
    if (offset < 0) {
      // a pickup bar padded before the recording begins: silence until the recording starts
      at -= offset
      duration += offset
      offset = 0
      if (duration <= TIME_TOLERANCE) continue
    }
    const last = segments.at(-1)
    if (last && Math.abs(last.at + last.duration - at) < TIME_TOLERANCE && Math.abs(last.offset + last.duration - offset) < 0.01) {
      last.duration += duration
    } else segments.push({ at, offset, duration })
  }
  return segments
}

export interface ToneEvent {
  /** Seconds after the start of playback (speed applied). */
  at: number
  duration: number
  midi: number
  part: Voice | 'chord' | 'click' | 'guide'
}

/** Length of a metronome click in real seconds (independent of the speed). */
export const CLICK_SECONDS = 0.04

/**
 * Seconds within which two score times are the same. The backend rounds times (bars and
 * sections to 3 decimals, notes to 4), so a bar start and its first note may differ by
 * 0.5 ms; the shortest native note lasts far longer (25 ms at 300 BPM, L:1/32).
 */
export const TIME_TOLERANCE = 1e-3

export const MIN_SPEED = 0.25
export const MAX_SPEED = 2

export function clampSpeed(speed: number): number {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number.isFinite(speed) ? speed : 1))
}

/** The tones between ``from`` and ``to``; a chord already sounding at ``from`` starts there. */
export function schedule(view: ScoreView, options: PlayOptions): ToneEvent[] {
  const speed = clampSpeed(options.speed)
  const end = options.to ?? view.duration_s
  const events: ToneEvent[] = []
  const clock = options.clock?.length ? options.clock : null
  const origin = clock ? toReal(clock, options.from) : options.from
  /** Playing seconds (from the start of playback, before the speed) of a score second. */
  const real = (second: number): number => (clock ? toReal(clock, second) : second) - origin
  for (const voice of ['Vocal', 'Ins'] as Voice[]) {
    if (!options.voices[voice]) continue
    for (const note of view.notes?.[voice] ?? []) {
      if (note.start_s < options.from - TIME_TOLERANCE || note.start_s >= end - TIME_TOLERANCE) continue
      const stop = Math.min(note.start_s + note.duration_s, end)
      const at = Math.max(0, real(note.start_s))
      events.push({ at: at / speed, duration: (real(stop) - at) / speed, midi: note.midi, part: voice })
    }
  }
  if (options.voices.chords) {
    for (const chord of view.chords ?? []) {
      const chordEnd = Math.min(chord.start_s + chord.duration_s, end)
      const start = Math.max(chord.start_s, options.from)
      if (chordEnd <= start + TIME_TOLERANCE) continue
      for (const midi of chord.pitches) {
        events.push({ at: real(start) / speed, duration: (real(chordEnd) - real(start)) / speed, midi, part: 'chord' })
      }
    }
  }
  if (options.voices.guide) {
    for (const note of options.guide ?? []) {
      if (note.start_s < options.from - TIME_TOLERANCE || note.start_s >= end - TIME_TOLERANCE) continue
      const stop = Math.min(note.start_s + note.duration_s, end)
      const at = Math.max(0, real(note.start_s))
      events.push({ at: at / speed, duration: (real(stop) - at) / speed, midi: note.midi, part: 'guide' })
    }
  }
  if (options.metronome) {
    for (const bar of view.bars) {
      const beats = Number(bar.meter.split('/')[0]) || 1
      for (let beat = 0; beat < beats; beat++) {
        const time = bar.start_s + (beat * bar.duration_s) / beats
        if (time < options.from - TIME_TOLERANCE || time >= end - TIME_TOLERANCE) continue
        events.push({
          at: Math.max(0, real(time)) / speed,
          duration: CLICK_SECONDS,
          midi: beat === 0 ? 96 : 89,
          part: 'click'
        })
      }
    }
  }
  return events.sort((a, b) => a.at - b.at || a.midi - b.midi)
}

/**
 * Real seconds from ``options.from`` to the end (``options.to`` or the score's end), at the speed: how
 * long playback lasts - to the last bar's end, also when the bars before it are rests (a DAW plays on
 * through empty bars; a recording into an empty score needs them).
 */
export function playLength(view: ScoreView, options: PlayOptions): number {
  const end = Math.max(options.from, options.to ?? view.duration_s)
  const clock = options.clock?.length ? options.clock : null
  const real = clock ? toReal(clock, end) - toReal(clock, options.from) : end - options.from
  return Math.max(0, real) / clampSpeed(options.speed)
}

/** Score seconds after ``elapsed`` real seconds of playback. */
export function scoreTime(options: PlayOptions, elapsed: number): number {
  const clock = options.clock?.length ? options.clock : null
  if (!clock) return options.from + elapsed * clampSpeed(options.speed)
  return toScore(clock, toReal(clock, options.from) + elapsed * clampSpeed(options.speed))
}

/** Ids of the written notes sounding at score second ``time`` (for the playback cursor). */
export function sounding(view: ScoreView, time: number, voices: VoiceSwitches): string[] {
  return (view.elements ?? [])
    .filter(
      (e) =>
        e.kind === 'note' &&
        voices[e.voice] &&
        e.start_s <= time + TIME_TOLERANCE &&
        time < e.start_s + e.duration_s - TIME_TOLERANCE
    )
    .map((e) => e.id)
}

export function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

/**
 * The source recording's second for a score bar: the transcription timeline's bar start (the bars as
 * the score's bars see them - an arranged cover's copied chorus is the source's chorus), else the
 * score's own time (a score that was not transcribed from this recording, or a bar the source lacks).
 */
export function sourceSecond(
  bar: number,
  timelineBars: readonly ([number, number, string] | null)[] | undefined,
  view: ScoreView
): number {
  const fromTimeline = timelineBars?.[bar - 1]?.[0]
  if (typeof fromTimeline === 'number') return fromTimeline
  return view.bars[bar - 1]?.start_s ?? 0
}
