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
}

export interface PlayOptions {
  /** Score seconds to start from. */
  from: number
  /** Score seconds to stop (or loop) at; default: the end. */
  to?: number | null
  voices: VoiceSwitches
  /** Speed factor: 1 = the score's tempo, 0.5 = half speed. */
  speed: number
}

export interface ToneEvent {
  /** Seconds after the start of playback (speed applied). */
  at: number
  duration: number
  midi: number
  part: Voice | 'chord'
}

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
  for (const voice of ['Vocal', 'Ins'] as Voice[]) {
    if (!options.voices[voice]) continue
    for (const note of view.notes?.[voice] ?? []) {
      if (note.start_s < options.from - TIME_TOLERANCE || note.start_s >= end - TIME_TOLERANCE) continue
      const duration = Math.min(note.duration_s, end - note.start_s)
      const at = Math.max(0, note.start_s - options.from)
      events.push({ at: at / speed, duration: duration / speed, midi: note.midi, part: voice })
    }
  }
  if (options.voices.chords) {
    for (const chord of view.chords ?? []) {
      const chordEnd = Math.min(chord.start_s + chord.duration_s, end)
      const start = Math.max(chord.start_s, options.from)
      if (chordEnd <= start + TIME_TOLERANCE) continue
      for (const midi of chord.pitches) {
        events.push({ at: (start - options.from) / speed, duration: (chordEnd - start) / speed, midi, part: 'chord' })
      }
    }
  }
  return events.sort((a, b) => a.at - b.at || a.midi - b.midi)
}

/** Score seconds after ``elapsed`` real seconds of playback. */
export function scoreTime(options: PlayOptions, elapsed: number): number {
  return options.from + elapsed * clampSpeed(options.speed)
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
 * The source recording's second for a score bar: the transcription timeline's bar start,
 * else the score's own time (a score that was not transcribed from this recording).
 */
export function sourceSecond(bar: number, timelineBars: [number, number, string][] | undefined, view: ScoreView): number {
  const fromTimeline = timelineBars?.[bar - 1]?.[0]
  if (typeof fromTimeline === 'number') return fromTimeline
  return view.bars[bar - 1]?.start_s ?? 0
}
