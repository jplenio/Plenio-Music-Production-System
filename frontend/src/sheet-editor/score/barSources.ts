/**
 * Which bar of the source recording every bar of the score is, kept while the score is edited (GitHub issue 2026-11:
 * moving notes to the other voice sent the waveform, the source's playback and the sung pitch to other bars of the
 * recording). The recording itself never changes - only which part of it a bar shows and plays.
 *
 * An edit says what it does to the bars: without a time map (notes moved, another voice, silenced, another pitch) every
 * bar stays the bar it was; with one (bars moved, copied, deleted, inserted) a bar goes where the map takes it, a copy
 * refers to the same source bar as its original and an inserted bar to none (it is drawn so, and silent while the
 * source plays). What has no time map - the ABC text typed, a MIDI file imported - is compared bar by bar with the
 * text before it (``followContent``). A score the editor knows nothing about (made before 1.5.1, changed by the
 * workflow) goes by content, ``barMatch``.
 *
 * ``bars`` belong to one timeline and one score text: they are kept in the node's properties
 * (``plenio_bar_sources``), and anything else is ignored.
 *
 * Pure functions; the Score tab makes them part of each undo step.
 */
import type { ScoreModelView } from '../../shared/scoreView'
import type { BarPrint } from './barMatch'

export interface BarSources {
  /** The transcription these bars are bars of (the timeline's ``score_sha256``). */
  timeline: string
  /** The score text they describe (the view's ``sha256``). */
  score: string
  /** The 0-based source bar of every score bar; ``null``: a bar the source does not have. */
  bars: (number | null)[]
}

/** The bar sources of a node property or a project file (anything else: none). */
export function parseBarSources(value: unknown): BarSources | null {
  if (typeof value !== 'object' || value === null) return null
  const { timeline, score, bars } = value as Record<string, unknown>
  if (typeof timeline !== 'string' || typeof score !== 'string' || !Array.isArray(bars) || !bars.length) return null
  if (!bars.every((bar) => bar === null || (Number.isInteger(bar) && (bar as number) >= 0))) return null
  return { timeline, score, bars: bars as (number | null)[] }
}

/** The bars of ``state`` when it describes this text of this timeline with this many bars. */
export function validBars(state: BarSources | null | undefined, timeline: string | null | undefined, score: string | null | undefined, count: number): (number | null)[] | null {
  return state && timeline && state.timeline === timeline && state.score === score && state.bars.length === count ? state.bars : null
}

function measureAt(model: ScoreModelView, unit: number): number {
  let index = -1
  for (let i = 0; i < model.measures.length; i++) {
    if (model.measures[i].onset > unit) break
    index = i
  }
  return index
}

/**
 * The source bars after bars moved: the backend's time map of the edit (``[old_start, old_end, new_start]``, in units
 * of L). A bar goes where the piece holding its start goes - into every copy of it; a bar no piece reaches is new.
 */
export function remapBars(
  bars: readonly (number | null)[],
  from: ScoreModelView,
  to: ScoreModelView,
  timeMap: readonly (readonly number[])[]
): (number | null)[] {
  return to.measures.map((measure) => {
    for (const [oldStart, oldEnd, newStart] of timeMap) {
      const offset = measure.onset - newStart
      if (offset < 0 || offset >= oldEnd - oldStart) continue
      const old = measureAt(from, oldStart + offset)
      return old >= 0 ? (bars[old] ?? null) : null
    }
    return null
  })
}

/** The source bars after an edit that moved no bars: bars added at the end are new, bars gone from it are gone. */
export function keepBars(bars: readonly (number | null)[], count: number): (number | null)[] {
  return Array.from({ length: count }, (_, i) => bars[i] ?? null)
}

const whole = (print: BarPrint): string => print.join('|')

/** The pairs of the longest common subsequence of ``a`` and ``b``, in order. */
function commonBars(a: readonly string[], b: readonly string[]): [number, number][] {
  const width = b.length + 1
  const table = new Uint16Array((a.length + 1) * width)
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * width + j] =
        a[i] === b[j] ? table[(i + 1) * width + j + 1] + 1 : Math.max(table[(i + 1) * width + j], table[i * width + j + 1])
    }
  }
  const pairs: [number, number][] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) pairs.push([i++, j++])
    else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) i++
    else j++
  }
  return pairs
}

/**
 * The source bars after an edit that says nothing about its bars (typed ABC, an import), from what the two texts
 * have in common: bars still in their order keep their source, a stretch of as many bars as before between them was
 * edited in place, bars found elsewhere were moved, and the bars left over are new. ``null``: the two scores have
 * too little in common to tell (another score).
 */
export function followContent(
  bars: readonly (number | null)[],
  before: readonly BarPrint[],
  after: readonly BarPrint[]
): (number | null)[] | null {
  const a = before.map(whole)
  const b = after.map(whole)
  const pairs = commonBars(a, b)
  if (a.length !== b.length && pairs.length * 2 < Math.min(a.length, b.length)) return null
  const result = new Array<number | null>(b.length).fill(null)
  const taken = new Set<number>()
  const given = new Set<number>()
  const pair = (i: number, j: number): void => {
    result[j] = bars[i] ?? null
    taken.add(i)
    given.add(j)
  }
  for (const [i, j] of pairs) pair(i, j)
  // a stretch of as many bars on both sides between two common bars: the same bars, edited
  const anchors: [number, number][] = [[-1, -1], ...pairs, [a.length, b.length]]
  for (let k = 0; k + 1 < anchors.length; k++) {
    const count = anchors[k + 1][0] - anchors[k][0] - 1
    if (count > 0 && count === anchors[k + 1][1] - anchors[k][1] - 1) {
      for (let n = 1; n <= count; n++) pair(anchors[k][0] + n, anchors[k][1] + n)
    }
  }
  // moved: equal to a bar that is left over
  for (let j = 0; j < b.length; j++) {
    if (given.has(j)) continue
    const i = a.findIndex((print, index) => !taken.has(index) && print === b[j])
    if (i >= 0) pair(i, j)
  }
  return result
}
