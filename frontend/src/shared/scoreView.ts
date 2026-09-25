/**
 * The score view returned by /plenio/score/analyze (and after every /plenio/score/transform):
 * analysis, note elements with their text positions, playback notes and the display ABC.
 * Everything here is derived from the canonical ABC text by the backend; the editor keeps
 * no second score model.
 */

export interface ScoreDiagnostic {
  severity: 'error' | 'warning' | 'info'
  message: string
  bar: number | null
  voice: string | null
  where: string
  line?: number
  start?: number
  end?: number
}

export interface ScoreBar {
  index: number
  start_s: number
  duration_s: number
  meter: string
  key: string
  chords: string[]
  vocal_notes: number
  ins_notes: number
}

export interface ScoreSection {
  label: string
  tag: string
  start_bar: number
  bars: number
  start_s: number
  end_s: number
  vocal_notes: number
}

export type Voice = 'Vocal' | 'Ins'

export interface ScoreElement {
  id: string
  voice: Voice
  bar: number
  kind: 'note' | 'rest' | 'bar_rest'
  units: number
  onset_q: number
  duration_q: number
  start_s: number
  duration_s: number
  source: [number, number]
  display: [number, number]
  midi?: number
  name?: string
  tie_in?: boolean
  tie_out?: boolean
  chord?: string
}

export interface ChordEvent {
  id: string
  name: string
  bar: number
  pitches: number[]
  start_s: number
  duration_s: number
  source: [number, number]
  display: [number, number]
}

export interface PlaybackNote {
  id: string
  segments: string[]
  midi: number
  start_s: number
  duration_s: number
}

export interface ScoreView {
  ok: boolean
  sha256: string
  diagnostics: ScoreDiagnostic[]
  header: { meter?: string; unit?: string; tempo_bpm?: number; key?: string }
  bars: ScoreBar[]
  sections: ScoreSection[]
  voices: Record<string, { notes: number; lowest: number | null; highest: number | null; chords: number }>
  duration_s: number
  has_chords: boolean
  elements?: ScoreElement[]
  chords?: ChordEvent[]
  notes?: Record<Voice, PlaybackNote[]>
  bar_starts_s?: number[]
  display_abc?: string
}

/** Native note lengths in units of the score's L: field (upstream DURATIONS). */
export const DURATIONS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48]

export function nextDuration(units: number, direction: 1 | -1): number | null {
  const index = DURATIONS.indexOf(units)
  if (index < 0) return null
  const next = DURATIONS[index + direction]
  return next ?? null
}

/** The element a click on the rendered notation hit (abcjs reports character ranges of display_abc). */
export function elementAtDisplay(view: ScoreView, start: number, end: number): ScoreElement | null {
  const elements = view.elements ?? []
  const exact = elements.find((e) => e.display[1] === end)
  if (exact) return exact
  let best: ScoreElement | null = null
  let overlap = 0
  for (const element of elements) {
    const shared = Math.min(end, element.display[1]) - Math.max(start, element.display[0])
    if (shared > overlap) {
      best = element
      overlap = shared
    }
  }
  return best
}

/** The element whose source text contains the cursor at ``offset`` (ABC text view -> notation). */
export function elementAtSource(view: ScoreView, offset: number): ScoreElement | null {
  const elements = view.elements ?? []
  return elements.find((e) => e.source[0] <= offset && offset < e.source[1]) ??
    elements.find((e) => e.source[1] === offset) ?? null
}

export function elementById(view: ScoreView | null, id: string | null | undefined): ScoreElement | null {
  if (!view || !id) return null
  return (view.elements ?? []).find((e) => e.id === id) ?? null
}

/** The next (``1``) or previous (``-1``) element of the same voice. */
export function neighbour(view: ScoreView, id: string, direction: 1 | -1): ScoreElement | null {
  const current = elementById(view, id)
  if (!current) return null
  const voice = (view.elements ?? []).filter((e) => e.voice === current.voice)
  const index = voice.findIndex((e) => e.id === id)
  return voice[index + direction] ?? null
}

/** The element of the other voice sounding at the same time. */
export function otherVoice(view: ScoreView, id: string): ScoreElement | null {
  const current = elementById(view, id)
  if (!current) return null
  const voice: Voice = current.voice === 'Vocal' ? 'Ins' : 'Vocal'
  return (
    (view.elements ?? []).find(
      (e) => e.voice === voice && e.onset_q <= current.onset_q && current.onset_q < e.onset_q + e.duration_q
    ) ?? null
  )
}

export function firstElementOfBar(view: ScoreView, bar: number, voice: Voice = 'Vocal'): ScoreElement | null {
  return (view.elements ?? []).find((e) => e.bar === bar && e.voice === voice) ?? null
}

export function sectionOfBar(view: ScoreView, bar: number): number {
  const index = view.sections.findIndex((s) => s.start_bar <= bar && bar < s.start_bar + s.bars)
  return index < 0 ? 0 : index
}

const NOTE_NAMES: Record<number, string> = {
  1: 'sixteenth',
  2: 'eighth',
  3: 'dotted eighth',
  4: 'quarter',
  6: 'dotted quarter',
  8: 'half',
  12: 'dotted half',
  16: 'whole',
  24: 'dotted whole',
  32: 'two whole notes',
  48: 'three whole notes'
}

/** A readable description of an element for the status line and screen readers. */
export function describe(element: ScoreElement | null, unit = '1/16'): string {
  if (!element) return 'nothing selected'
  const scale = 16 / Number(unit.split('/')[1] ?? 16)
  const length = NOTE_NAMES[element.units * scale] ?? `${element.units} units`
  const what = element.kind === 'note' ? `${element.name}${element.tie_out ? ' (tied)' : ''}` : 'rest'
  const chord = element.chord ? `, chord ${element.chord}` : ''
  return `${element.voice} bar ${element.bar}: ${what}, ${element.kind === 'bar_rest' ? 'whole bar' : length}${chord}`
}

export function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds - minutes * 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}
