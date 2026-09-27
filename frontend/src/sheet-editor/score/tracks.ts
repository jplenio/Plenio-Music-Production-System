/**
 * The DAW layout's tracks (M2/D4-D5): what YuE2 reads, what is playback and MIDI only, and the
 * Guide notes' seconds. Pure - geometry and conversion only, no score model of its own.
 *
 * YuE2 reads **two monophonic voices plus chord symbols**: *Vocal* -> `V: Vocal`, *Instrument* ->
 * `V: Ins`, *Chords* -> the chord symbols in the Vocal line. The *Guide* track is never sent to
 * YuE2; it lives in the Song Sheet node's properties as ``[[onset, duration, pitch], ...]`` (the
 * format of ``midi.guide_from_json``) and is played and exported like the other tracks.
 */
import type { GuideNote } from '../../api/client'
import type { PlaybackNote, ScoreModelView, ScoreView } from '../../shared/scoreView'

export type TrackVoice = 'Vocal' | 'Ins' | 'chords' | 'guide'

export interface TrackRow {
  voice: TrackVoice
  name: string
  /** What this track is sent to YuE2 as (or that it is not). */
  destination: string
  notes: number
  /** The piano roll's colour of the voice. */
  color: string
  /** False: playback and MIDI only, never sent to YuE2. */
  sent: boolean
}

export const TRACK_COLORS: Record<TrackVoice, string> = {
  Vocal: '#4c9aff',
  Ins: '#f0a35e',
  chords: '#9ecbff',
  guide: '#9aa4b2'
}

/** The four tracks of the DAW workflow, in the order YuE2 and the roll show them. */
export function trackRows(view: ScoreView | null, guideCount = 0): TrackRow[] {
  const tracks = view?.model?.tracks
  return [
    {
      voice: 'Vocal',
      name: 'Vocal',
      destination: 'V: Vocal',
      notes: tracks?.vocal.length ?? 0,
      color: TRACK_COLORS.Vocal,
      sent: true
    },
    {
      voice: 'Ins',
      name: 'Instrument',
      destination: 'V: Ins',
      notes: tracks?.ins.length ?? 0,
      color: TRACK_COLORS.Ins,
      sent: true
    },
    {
      voice: 'chords',
      name: 'Chords',
      destination: 'chord symbols',
      notes: tracks?.chords.length ?? 0,
      color: TRACK_COLORS.chords,
      sent: true
    },
    {
      voice: 'guide',
      name: 'Guide',
      destination: 'not sent to YuE2',
      notes: guideCount,
      color: TRACK_COLORS.guide,
      sent: false
    }
  ]
}

export function notesLabel(count: number): string {
  return count === 1 ? '1 note' : `${count} notes`
}

/**
 * Guide notes in score seconds, from their units and the model's grid and tempo (the player and
 * the transport work in seconds; the score's own times come from the backend).
 */
export function guideNotes(
  guide: GuideNote[] | null | undefined,
  model: ScoreModelView | null | undefined
): PlaybackNote[] {
  if (!guide?.length || !model) return []
  const perQuarter = model.grid.units_per_quarter
  const seconds = 60 / model.tempo
  if (!perQuarter || !model.tempo) return []
  return guide.map(([onset, duration, pitch], index) => ({
    id: `guide:${onset}:${index}`,
    segments: [],
    midi: pitch,
    start_s: (onset / perQuarter) * seconds,
    duration_s: (duration / perQuarter) * seconds
  }))
}

/** The Guide notes of a node property value: ``[[onset, duration, pitch], ...]`` (invalid: empty). */
export function parseGuide(value: unknown): GuideNote[] {
  const raw = typeof value === 'string' && value.trim() ? safeJson(value) : value
  if (!Array.isArray(raw)) return []
  const notes: GuideNote[] = []
  for (const item of raw) {
    if (
      !Array.isArray(item) ||
      item.length !== 3 ||
      !item.every((part) => typeof part === 'number' && Number.isInteger(part)) ||
      item[0] < 0 ||
      item[1] < 1 ||
      item[2] < 0 ||
      item[2] > 127
    ) {
      continue
    }
    notes.push([item[0], item[1], item[2]])
  }
  return notes.sort((a, b) => a[0] - b[0] || a[2] - b[2])
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** What goes into the node property: a plain array (the workflow stores it as JSON). */
export function serializeGuide(guide: GuideNote[]): number[][] {
  return guide.map(([onset, duration, pitch]) => [onset, duration, pitch])
}

export function sameGuide(a: GuideNote[], b: GuideNote[]): boolean {
  return a.length === b.length && a.every((note, index) => note.every((part, i) => part === b[index][i]))
}
