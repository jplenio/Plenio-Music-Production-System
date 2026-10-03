/**
 * A cover's sung pitch in the piano roll (owner's request 2026-10-03): the curve of node *Sung Pitch*
 * (the source's vocal stem, a MIDI pitch every 20 ms) drawn over the transcribed notes, bar by bar where
 * the transcription's timeline puts the recording - so a wrong note, an octave error or a note that is
 * not sung shows at a glance.
 *
 * SheetSage2 often writes the melody an octave away from where it is sung (a female voice around C4 is
 * notated around C5): the curve is moved by the octaves that bring it onto the notes (``octaveOffset``)
 * and the roll says so. Pure functions.
 */
import type { ScoreModelView } from '../../shared/scoreView'

/** The payload of Song Sheet's ``sung_pitch``: the curve, or why there is none. */
export type SungPitchPayload = { rate: number; start: number; midi: (number | null)[]; source?: string } | { problem: string }

export interface SungCurve {
  rate: number
  start: number
  midi: readonly (number | null)[]
}

export type SourceBars = readonly ([number, number, string] | null)[] | undefined

export function curveOf(payload: SungPitchPayload | null | undefined): SungCurve | null {
  if (!payload || 'problem' in payload || !Array.isArray(payload.midi) || !(payload.rate > 0)) return null
  return { rate: payload.rate, start: payload.start ?? 0, midi: payload.midi }
}

/** The curve's value at source second ``second`` (``null``: not sung there). */
export function sungAt(curve: SungCurve, second: number): number | null {
  const index = Math.round((second - curve.start) * curve.rate)
  return index >= 0 && index < curve.midi.length ? curve.midi[index] : null
}

/** The source second of a unit of the score (``null``: its bar has no source). */
export function sourceSecondOfUnit(model: ScoreModelView, bars: SourceBars, unit: number): number | null {
  let index = 0
  for (let i = 0; i < model.measures.length; i++) if (model.measures[i].onset <= unit) index = i
  const measure = model.measures[index]
  const bar = bars?.[index]
  if (!measure || !bar || !measure.length) return null
  return bar[0] + ((unit - measure.onset) / measure.length) * (bar[1] - bar[0])
}

/**
 * How many semitones (a multiple of 12) bring the curve onto the Vocal notes: the median difference
 * between every note and the singing in its middle, rounded to octaves (0 without enough of them).
 */
export function octaveOffset(model: ScoreModelView, bars: SourceBars, curve: SungCurve): number {
  const diffs: number[] = []
  for (const note of model.tracks.vocal) {
    const second = sourceSecondOfUnit(model, bars, note.onset + note.duration / 2)
    const sung = second === null ? null : sungAt(curve, second)
    if (sung !== null) diffs.push(note.pitch - sung)
  }
  if (diffs.length < 6) return 0
  diffs.sort((a, b) => a - b)
  return 12 * Math.round(diffs[Math.floor(diffs.length / 2)] / 12)
}

/** A run of the curve to draw: points ``[unit, midi]`` in score units, unbroken. */
export type CurveRun = [number, number][]

/**
 * The curve as runs of points in score units for the bars ``[first, last]`` (indices): a run breaks
 * where nothing is sung and where the recording jumps (an arranged cover's copied bars).
 */
export function curveRuns(model: ScoreModelView, bars: SourceBars, curve: SungCurve, first: number, last: number, offset = 0): CurveRun[] {
  const runs: CurveRun[] = []
  let run: CurveRun = []
  let previous: number | null = null
  const step = 1 / curve.rate
  for (let i = Math.max(0, first); i <= Math.min(last, model.measures.length - 1); i++) {
    const measure = model.measures[i]
    const bar = bars?.[i]
    if (!bar || bar[1] <= bar[0]) {
      if (run.length > 1) runs.push(run)
      run = []
      previous = null
      continue
    }
    const k0 = Math.ceil((bar[0] - curve.start) * curve.rate)
    const k1 = Math.floor((bar[1] - curve.start) * curve.rate - 1e-9)
    for (let k = k0; k <= k1; k++) {
      const value = k >= 0 && k < curve.midi.length ? curve.midi[k] : null
      const second = curve.start + k * step
      if (value === null || (previous !== null && Math.abs(second - previous - step) > step / 2)) {
        if (run.length > 1) runs.push(run)
        run = []
      }
      previous = second
      if (value === null) continue
      run.push([measure.onset + ((second - bar[0]) / (bar[1] - bar[0])) * measure.length, value + offset])
    }
  }
  if (run.length > 1) runs.push(run)
  return runs
}
