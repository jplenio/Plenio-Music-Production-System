/**
 * The cursor (docs/design/score-arrange-design.md §2; Cubase: project cursor): a position in units
 * of the score's L. The ruler sets it, playback starts from it and paste puts the clip there.
 *
 * Pure conversions between units, bars and score seconds. The backend's bar times are the
 * reference, so the cursor, the playback line and the notes always agree.
 */
import { TIME_TOLERANCE } from '../../shared/playback'
import type { ScoreModelView, ScoreView } from '../../shared/scoreView'

/** The bar (1-based) a unit lies in; the end of the score belongs to the last bar. */
export function barOfUnit(model: ScoreModelView, unit: number): number {
  let bar = 1
  for (const measure of model.measures) {
    if (measure.onset > unit) break
    bar = measure.n
  }
  return bar
}

/** The first unit of a bar (1-based). */
export function unitOfBar(model: ScoreModelView, bar: number): number {
  return model.measures[Math.max(0, Math.min(model.measures.length - 1, bar - 1))]?.onset ?? 0
}

/** The ruler's position for a click: on the grid, inside the score. */
export function rulerUnit(unit: number, snap: number, total: number): number {
  const snapped = snap > 0 ? Math.round(unit / snap) * snap : Math.round(unit)
  return Math.max(0, Math.min(total, snapped))
}

/** Score seconds of a unit: its bar's start (from the backend) plus its part of the bar. */
export function secondsOfUnit(view: ScoreView, unit: number): number {
  const model = view.model
  if (!model) return 0
  const bar = barOfUnit(model, unit)
  const measure = model.measures[bar - 1]
  const timing = view.bars[bar - 1]
  if (!measure || !timing || !measure.length) return 0
  return timing.start_s + ((unit - measure.onset) / measure.length) * timing.duration_s
}

/** The unit at score second ``seconds`` (the playback line); ``null`` without a model. */
export function unitOfSeconds(view: ScoreView, seconds: number): number | null {
  const model = view.model
  if (!model || !view.bars.length || !model.measures.length) return null
  let index = 0
  for (let i = 0; i < view.bars.length; i++) {
    if (view.bars[i].start_s > seconds + TIME_TOLERANCE) break
    index = i
  }
  const timing = view.bars[index]
  const measure = model.measures[Math.min(index, model.measures.length - 1)]
  const part = timing.duration_s > 0 ? (seconds - timing.start_s) / timing.duration_s : 0
  return Math.max(0, Math.min(model.total, measure.onset + Math.max(0, Math.min(1, part)) * measure.length))
}

/**
 * Score seconds for a second of the source recording: the transcription's bar times
 * (``[start, end, meter]``) mapped onto the score's bars; without them the times are the same.
 */
export function scoreSecondOfSource(
  view: ScoreView,
  second: number,
  timelineBars: [number, number, string][] | undefined
): number {
  if (!timelineBars?.length) return second
  let index = 0
  for (let i = 0; i < timelineBars.length; i++) {
    if (timelineBars[i][0] > second + TIME_TOLERANCE) break
    index = i
  }
  const [start, end] = timelineBars[index]
  const bar = view.bars[index]
  if (!bar) return view.duration_s
  const part = end > start ? Math.max(0, Math.min(1, (second - start) / (end - start))) : 0
  return bar.start_s + part * bar.duration_s
}

/** Cubase's position display: ``bar.beat.sixteenth`` (all 1-based). */
export function positionLabel(model: ScoreModelView, unit: number): string {
  const bar = barOfUnit(model, unit)
  const measure = model.measures[bar - 1]
  if (!measure) return '1.1.1'
  const beats = Number(measure.meter.split('/')[0]) || 1
  const beatLength = measure.length / beats
  const inBar = Math.max(0, unit - measure.onset)
  const beat = Math.min(beats - 1, Math.floor(inBar / beatLength))
  const sixteenth = model.grid.units_per_quarter / 4
  const sub = sixteenth > 0 ? Math.floor((inBar - beat * beatLength) / sixteenth) : 0
  return `${bar}.${beat + 1}.${sub + 1}`
}
