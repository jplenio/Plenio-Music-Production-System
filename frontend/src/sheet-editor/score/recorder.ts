/**
 * A MIDI take in the score editor (owner's request 2026-10-03): the keys played while the score plays,
 * as notes of one voice of the score.
 *
 * Times come in as score units (fractions allowed; the transport maps a key's time - compensated for
 * the audio output's latency - onto the bars). A voice of the score is one line, so the take is made
 * one line too: keys pressed together (within ``CHORD_SECONDS``) give their highest note, and a key
 * pressed before the previous one is let go ends it (legato, as on a monophonic synthesizer). Then the
 * starts and ends go onto the grid (or to the score's finest unit without one), and a key played just
 * before the start - during the count-in's last beat - lands on the start.
 *
 * ``recordOperation`` is the one backend operation (``place_notes``) that writes the take: *replace*
 * clears what the voice played from the start to the stop, *merge* overwrites only the new notes' spans.
 */
import type { ScoreOperation } from '../../api/client'
import type { Track } from './pianoRoll'

export const CHORD_SECONDS = 0.035

export interface RecordedNote {
  onset: number
  duration: number
  pitch: number
}

export type RecordMode = 'replace' | 'merge'

interface Held {
  pitch: number
  start: number
  end: number | null
}

export class Take {
  private held = new Map<number, Held>()
  private done: Held[] = []

  constructor(
    readonly start: number,
    readonly track: Track
  ) {}

  noteOn(pitch: number, unit: number): void {
    const open = this.held.get(pitch)
    if (open) this.close(open, unit) // the same key again without a note-off (a lost message)
    this.held.set(pitch, { pitch, start: unit, end: null })
  }

  noteOff(pitch: number, unit: number): void {
    const open = this.held.get(pitch)
    if (open) this.close(open, unit)
  }

  /** Everything played so far; keys still held end at ``now`` (the live picture). */
  played(now: number): Held[] {
    return [...this.done, ...[...this.held.values()].map((h) => ({ ...h, end: now }))]
  }

  /** The take at the stop: keys still held end there. */
  finish(stop: number): Held[] {
    for (const open of [...this.held.values()]) this.close(open, stop)
    return [...this.done]
  }

  get count(): number {
    return this.done.length + this.held.size
  }

  private close(open: Held, unit: number): void {
    this.held.delete(open.pitch)
    this.done.push({ ...open, end: Math.max(unit, open.start) })
  }
}

/**
 * The played keys as one line of notes in whole units: chords to their highest key, legato cut,
 * onto the grid (``grid`` units, 0: the score's unit), within ``[start, total)``. ``chordUnits``: how
 * close two keys are to count as pressed together; ``pickup``: how far before the start a key may be.
 */
export function lineOf(
  played: readonly { pitch: number; start: number; end: number | null }[],
  options: { start: number; stop: number; total: number; grid: number; chordUnits: number; pickup: number }
): RecordedNote[] {
  const { start, stop, total, chordUnits, pickup } = options
  const grid = Math.max(1, Math.round(options.grid) || 1)
  const keys = played
    .filter((p) => p.start >= start - pickup && p.start < stop)
    .map((p) => ({ pitch: p.pitch, start: Math.max(start, p.start), end: Math.min(stop, Math.max(p.end ?? stop, p.start)) }))
    .sort((a, b) => a.start - b.start || b.pitch - a.pitch)
  // keys pressed together: the highest one
  const line: { pitch: number; start: number; end: number }[] = []
  for (const key of keys) {
    const last = line.at(-1)
    if (last && key.start - last.start <= chordUnits) {
      if (key.pitch > last.pitch) line[line.length - 1] = { ...key, start: last.start, end: Math.max(key.end, last.end) }
      else last.end = Math.max(last.end, key.end)
      continue
    }
    line.push({ ...key })
  }
  // onto the grid; a note pressed before the previous one is let go ends it
  const notes: RecordedNote[] = []
  for (const [index, key] of line.entries()) {
    let onset = Math.round((key.start - start) / grid) * grid + start
    let end = Math.round((key.end - start) / grid) * grid + start
    if (end <= onset) end = onset + grid
    const next = line[index + 1]
    if (next) {
      const nextOnset = Math.round((next.start - start) / grid) * grid + start
      if (nextOnset > onset) end = Math.min(end, nextOnset)
    }
    onset = Math.max(0, Math.min(onset, total - 1))
    end = Math.min(end, total)
    const previous = notes.at(-1)
    if (previous && onset <= previous.onset) {
      // two keys on one grid step: the one held longer stays
      if (end - onset > previous.duration) notes[notes.length - 1] = { onset: previous.onset, duration: end - previous.onset, pitch: key.pitch }
      continue
    }
    if (previous && previous.onset + previous.duration > onset) previous.duration = onset - previous.onset
    if (end > onset) notes.push({ onset, duration: end - onset, pitch: key.pitch })
  }
  return notes
}

/** The backend operation that writes a take (one undo step). */
export function recordOperation(track: Track, notes: readonly RecordedNote[], start: number, stop: number, mode: RecordMode): ScoreOperation {
  return {
    op: 'place_notes',
    track,
    notes: notes.map((n) => ({ onset: n.onset, duration: n.duration, pitch: n.pitch })),
    // replace: from the start to the stop - and to the last note's end on the grid
    ...(mode === 'replace' ? { clear: [Math.round(start), Math.max(Math.round(start), Math.round(stop), ...notes.map((n) => n.onset + n.duration))] } : {}),
    label: 'recorded'
  }
}

/** A grid in units for a note value (``0``: off - the score's finest unit). */
export function gridUnits(unit: string, value: number): number {
  if (!value) return 1
  const denominator = Number(unit.split('/')[1]) || 16
  return Math.max(1, Math.round(denominator / value))
}
