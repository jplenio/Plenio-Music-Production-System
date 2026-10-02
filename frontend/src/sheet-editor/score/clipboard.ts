/**
 * The score clipboard (docs/design/score-arrange-design.md §3; Cubase: key editor clipboard).
 *
 * A clip holds notes and chord symbols relative to its start, how long it lasts, which voices it
 * covers (a range copied from sections covers both, silence included) and the section labels of a
 * range. It lives in the page, so a clip can be pasted into another sheet's score. ``pasteOperation``
 * turns it into the backend's ``paste`` operation at the cursor.
 */
import { ref } from 'vue'

import type { ScoreOperation } from '../../api/client'
import type { ModelChord, ModelNote, ScoreModelView } from '../../shared/scoreView'
import type { LyricBlock } from './lyricsFollow'
import type { Track } from './pianoRoll'

export interface ClipNote {
  track: Track
  onset: number
  duration: number
  pitch: number
}

export interface Clip {
  /** The score's unit L (``1/16`` ...): onsets are counted in it. */
  unit: string
  span: number
  tracks: Track[]
  withChords: boolean
  notes: ClipNote[]
  chords: { onset: number; name: string }[]
  /** The sections of a range, with the lyrics they had (the lyrics follow a pasted section). */
  sections: { onset: number; label: string; lyrics?: LyricBlock | null }[]
  /** What was copied, for the status line (``3 notes``, ``sections chorus, verse``). */
  label: string
}

export type PasteMode = 'overwrite' | 'insert'

/** The clipboard commands of the roll and the keys (Cubase: Copy, Cut, Paste, Paste Time, Duplicate). */
export type ClipAction = 'copy' | 'cut' | 'paste' | 'insert' | 'duplicate'

/** The clipboard of the page (all sheets share it). */
export const clipboard = ref<Clip | null>(null)

function trackOf(note: ModelNote): Track {
  return note.id.startsWith('ins:') ? 'ins' : 'vocal'
}

/**
 * A clip of whole sections (0-based indices, in order): both voices, chord symbols and labels, and the
 * sections' lyric blocks when the lyrics follow the sections (``lyrics``, one per model section).
 */
export function clipOfSections(
  model: ScoreModelView,
  indices: readonly number[],
  lyrics: readonly (LyricBlock | null)[] | null = null
): Clip | null {
  const order = [...new Set(indices)].sort((a, b) => a - b).filter((i) => model.sections[i])
  const picked = order.map((i) => model.sections[i])
  if (!picked.length) return null
  const notes: ClipNote[] = []
  const chords: Clip['chords'] = []
  const sections: Clip['sections'] = []
  let offset = 0
  for (const [position, section] of picked.entries()) {
    const first = model.measures[section.first_bar - 1]
    const last = model.measures[section.first_bar - 1 + section.bars - 1]
    const start = first.onset
    const end = last.onset + last.length
    for (const note of [...model.tracks.vocal, ...model.tracks.ins]) {
      if (note.onset >= end || note.onset + note.duration <= start) continue
      const onset = Math.max(note.onset, start)
      notes.push({ track: trackOf(note), onset: onset - start + offset, duration: Math.min(note.onset + note.duration, end) - onset, pitch: note.pitch })
    }
    for (const chord of model.tracks.chords) if (chord.onset >= start && chord.onset < end) chords.push({ onset: chord.onset - start + offset, name: chord.name })
    const block = lyrics?.[order[position]]
    sections.push(block ? { onset: offset, label: section.label, lyrics: block } : { onset: offset, label: section.label })
    offset += end - start
  }
  return {
    unit: model.unit,
    span: offset,
    tracks: ['vocal', 'ins'],
    withChords: true,
    notes,
    chords,
    sections,
    label: `section${picked.length > 1 ? 's' : ''} ${picked.map((s) => s.label).join(', ')}`
  }
}

/** ``bars 5-7``, ``bar 3``, ``bars 2, 5-6`` (1-based bar numbers, sorted). */
export function barsLabel(bars: readonly number[]): string {
  const sorted = [...new Set(bars)].sort((a, b) => a - b)
  const runs: string[] = []
  for (let i = 0; i < sorted.length; ) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
    runs.push(j > i ? `${sorted[i]}-${sorted[j]}` : `${sorted[i]}`)
    i = j + 1
  }
  return `bar${sorted.length > 1 ? 's' : ''} ${runs.join(', ')}`
}

/** A clip of whole bars (0-based measure indices, in order): both voices and the chord symbols. */
export function clipOfBars(model: ScoreModelView, indices: readonly number[]): Clip | null {
  const order = [...new Set(indices)].sort((a, b) => a - b).filter((i) => model.measures[i])
  if (!order.length) return null
  const notes: ClipNote[] = []
  const chords: Clip['chords'] = []
  let offset = 0
  for (const index of order) {
    const { onset: start, length } = model.measures[index]
    const end = start + length
    for (const note of [...model.tracks.vocal, ...model.tracks.ins]) {
      if (note.onset >= end || note.onset + note.duration <= start) continue
      const onset = Math.max(note.onset, start)
      notes.push({ track: trackOf(note), onset: onset - start + offset, duration: Math.min(note.onset + note.duration, end) - onset, pitch: note.pitch })
    }
    for (const chord of model.tracks.chords) if (chord.onset >= start && chord.onset < end) chords.push({ onset: chord.onset - start + offset, name: chord.name })
    offset += length
  }
  return { unit: model.unit, span: offset, tracks: ['vocal', 'ins'], withChords: true, notes, chords, sections: [], label: barsLabel(order.map((i) => i + 1)) }
}

/** A clip of selected notes and chord symbols; it starts at the earliest of them (Cubase). */
export function clipOfSelection(model: ScoreModelView, notes: readonly ModelNote[], chords: readonly ModelChord[]): Clip | null {
  if (!notes.length && !chords.length) return null
  const start = Math.min(...notes.map((n) => n.onset), ...chords.map((c) => c.onset))
  const end = Math.max(...notes.map((n) => n.onset + n.duration), ...chords.map((c) => c.onset + 1))
  const tracks = (['vocal', 'ins'] as Track[]).filter((t) => notes.some((n) => trackOf(n) === t))
  const parts = [notes.length ? `${notes.length} note${notes.length > 1 ? 's' : ''}` : '', chords.length ? `${chords.length} chord symbol${chords.length > 1 ? 's' : ''}` : '']
  return {
    unit: model.unit,
    span: end - start,
    tracks,
    withChords: chords.length > 0,
    notes: notes.map((n) => ({ track: trackOf(n), onset: n.onset - start, duration: n.duration, pitch: n.pitch })),
    chords: chords.map((c) => ({ onset: c.onset - start, name: c.name })),
    sections: [],
    label: parts.filter(Boolean).join(' and ')
  }
}

function denominator(unit: string): number {
  const match = /^1\/(\d+)$/.exec(unit.trim())
  return match ? Number(match[1]) : NaN
}

/** The clip in another unit L (``null`` when a duration would not be a whole number of units). */
export function convertClip(clip: Clip, unit: string): Clip | null {
  const factor = denominator(unit) / denominator(clip.unit)
  if (!Number.isFinite(factor) || factor <= 0) return null
  if (factor === 1) return clip
  const scale = (value: number): number | null => {
    const scaled = value * factor
    return Number.isInteger(scaled) ? scaled : null
  }
  const values = [clip.span, ...clip.notes.flatMap((n) => [n.onset, n.duration]), ...clip.chords.map((c) => c.onset), ...clip.sections.map((s) => s.onset)]
  if (values.some((v) => scale(v) === null)) return null
  return {
    ...clip,
    unit,
    span: clip.span * factor,
    notes: clip.notes.map((n) => ({ ...n, onset: n.onset * factor, duration: n.duration * factor })),
    chords: clip.chords.map((c) => ({ ...c, onset: c.onset * factor })),
    sections: clip.sections.map((s) => ({ ...s, onset: s.onset * factor }))
  }
}

/** The backend operation that pastes ``clip`` at ``at``; a string says why it cannot be pasted. */
export function pasteOperation(clip: Clip, model: ScoreModelView, at: number, mode: PasteMode): ScoreOperation | string {
  const converted = convertClip(clip, model.unit)
  if (!converted) return `The clip was copied with L:${clip.unit} and does not fit this score's L:${model.unit} grid.`
  if (at < 0 || at >= model.total) return 'Set the cursor inside the score first.'
  return {
    op: 'paste',
    at,
    mode,
    span: converted.span,
    tracks: converted.tracks,
    with_chords: converted.withChords,
    notes: converted.notes,
    chords: converted.chords,
    sections: mode === 'insert' ? converted.sections.map(({ onset, label }) => ({ onset, label })) : []
  }
}
