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
  sections: { onset: number; label: string }[]
  /** What was copied, for the status line (``3 notes``, ``sections chorus, verse``). */
  label: string
}

export type PasteMode = 'overwrite' | 'insert'

/** The clipboard of the page (all sheets share it). */
export const clipboard = ref<Clip | null>(null)

function trackOf(note: ModelNote): Track {
  return note.id.startsWith('ins:') ? 'ins' : 'vocal'
}

/** A clip of whole sections (0-based indices, in order): both voices, chord symbols and labels. */
export function clipOfSections(model: ScoreModelView, indices: readonly number[]): Clip | null {
  const picked = [...new Set(indices)].sort((a, b) => a - b).map((i) => model.sections[i]).filter(Boolean)
  if (!picked.length) return null
  const notes: ClipNote[] = []
  const chords: Clip['chords'] = []
  const sections: Clip['sections'] = []
  let offset = 0
  for (const section of picked) {
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
    sections.push({ onset: offset, label: section.label })
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
    sections: mode === 'insert' ? converted.sections : []
  }
}
