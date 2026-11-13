// The song's timeline in the UI: project seconds (as the DAW counts them) and the score's ticks, joined measure by
// measure (each measure lies where the take has it: the bars Plenio measured in the audio).

import { reactive } from 'vue'

import type { Measure } from './types'

export const view = reactive({
  pxPerSecond: 28,
  scroll: 0, // project seconds at the left edge of the lanes
  follow: true,
  width: 800 // lane width in pixels
})

export function x(seconds: number): number {
  return (seconds - view.scroll) * view.pxPerSecond
}

export function secondsAt(px: number): number {
  return view.scroll + px / view.pxPerSecond
}

export function zoom(factor: number, aroundPx: number): void {
  const at = secondsAt(aroundPx)
  view.pxPerSecond = Math.min(400, Math.max(4, view.pxPerSecond * factor))
  view.scroll = Math.max(-2, at - aroundPx / view.pxPerSecond)
}

/** Ticks of the score -> project seconds (straight within a measure, continued after the last). */
export function tickToSeconds(measures: Measure[], tick: number): number {
  if (measures.length === 0) return 0
  let lo = 0
  let hi = measures.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (measures[mid].tick <= tick) lo = mid
    else hi = mid - 1
  }
  const m = measures[lo]
  const span = Math.max(1, m.endTick - m.tick)
  return m.start + ((tick - m.tick) / span) * (m.end - m.start)
}

export function secondsToTick(measures: Measure[], seconds: number): number {
  if (measures.length === 0) return 0
  let lo = 0
  let hi = measures.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (measures[mid].start <= seconds) lo = mid
    else hi = mid - 1
  }
  const m = measures[lo]
  const span = Math.max(1e-6, m.end - m.start)
  return m.tick + ((seconds - m.start) / span) * (m.endTick - m.tick)
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export function pitchName(pitch: number): string {
  return `${NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`
}
