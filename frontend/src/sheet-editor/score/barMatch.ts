/**
 * Which bar of the transcription every bar of the score is (backend ``bar_match``, the same rule):
 * a cover's arranged score - a copied chorus, a moved verse - finds its source bars by their content,
 * so *A/B* plays the source chorus for a copied chorus and the section list shows its source times.
 * The prints are the backend's strings (``4/4:0.8.66,8.8.78``), compared with the timeline's.
 *
 * This is the fallback: while the editor edits a score it keeps which source bar every bar is
 * (``barSources``). The match is one path through the source: going on bar by bar costs nothing, a jump costs
 * more than a bar of evidence is worth - so a bar whose notes were edited (moved to the other voice, silenced)
 * keeps its place after the bar before it.
 */
import type { ModelNote, ScoreModelView } from '../../shared/scoreView'

export type BarPrint = [string, string]

/** An equal voice with notes. */
const EVIDENCE = 2
/** An equal empty voice: rests are everywhere - it only breaks a tie, it never decides a jump. */
const EMPTY = 0.01
/** Leaving the bar after the previous one (backend: ``_JUMP``). */
const JUMP = 2.5

function voicePrint(meter: string, notes: readonly ModelNote[], start: number, end: number): string {
  const parts: string[] = []
  for (const note of notes) {
    const noteEnd = note.onset + note.duration
    if (noteEnd <= start || note.onset >= end) continue
    const begin = Math.max(note.onset, start)
    parts.push(`${begin - start}.${Math.min(noteEnd, end) - begin}.${note.pitch}`)
  }
  return `${meter}:${parts.join(',')}`
}

/** The print of every bar of the model (Vocal, Ins). */
export function barPrints(model: ScoreModelView): BarPrint[] {
  return model.measures.map((m) => [
    voicePrint(m.meter, model.tracks.vocal, m.onset, m.onset + m.length),
    voicePrint(m.meter, model.tracks.ins, m.onset, m.onset + m.length)
  ])
}

function score(a: BarPrint, b: BarPrint): number {
  let total = 0
  for (let v = 0; v < 2; v++) if (a[v] === b[v]) total += a[v].endsWith(':') ? EMPTY : EVIDENCE
  return total
}

/** Whether the mapping of a bar rests on its content (notes they share, or the same rests) - else on its place after the bar before it. */
export function hasEvidence(bar: BarPrint, source: BarPrint): boolean {
  return score(bar, source) >= EVIDENCE || (bar[0] === source[0] && bar[1] === source[1])
}

/** The state of highest value, the first of equal ones. */
function topState(value: readonly number[]): number {
  let top = 0
  for (let state = 1; state < value.length; state++) if (value[state] > value[top]) top = state
  return top
}

/**
 * For every bar the 0-based source bar it is (``null``: no bar of the source, past its end): the best path through
 * the source. Each bar earns what it has in common with the source bar it is given, going on to the next source
 * bar is free, any other step costs ``JUMP``; among equal paths the one that jumps least.
 */
export function matchBars(final: readonly BarPrint[], source: readonly BarPrint[]): (number | null)[] {
  const count = source.length
  if (!final.length) return []
  if (!count) return final.map(() => null)
  const past = count
  // the first bar comes as if after a bar before the source's first
  let value = source.map((bar, j) => score(final[0], bar) + (j === 0 ? JUMP : 0))
  value.push(0)
  const back: number[][] = []
  for (let i = 1; i < final.length; i++) {
    const top = topState(value)
    const jump = value[top] - JUMP
    const now = new Array<number>(count + 1).fill(0)
    const step = new Array<number>(count + 1).fill(0)
    for (let j = 0; j < count; j++) {
      if (j > 0 && value[j - 1] >= jump) {
        now[j] = value[j - 1]
        step[j] = j - 1
      } else {
        now[j] = jump
        step[j] = top
      }
      now[j] += score(final[i], source[j])
    }
    // past the source's end: after its last bar, or on from there
    const fromEnd = value[past] > value[count - 1] ? past : count - 1
    if (value[fromEnd] >= jump) {
      now[past] = value[fromEnd]
      step[past] = fromEnd
    } else {
      now[past] = jump
      step[past] = top
    }
    value = now
    back.push(step)
  }
  let state = topState(value)
  const states = [state]
  for (let i = back.length - 1; i >= 0; i--) {
    state = back[i][state]
    states.push(state)
  }
  return states.reverse().map((s) => (s === past ? null : s))
}

/**
 * The timeline's bars ``[start, end, meter]`` as the score's bars see them: the source bar each score bar is -
 * ``known`` when the editor kept it (``barSources``), else by content when the timeline knows its bars' prints, else
 * bar by bar - and ``null`` where there is none.
 */
export function sourceBars(
  model: ScoreModelView | null | undefined,
  timeline: { bars: [number, number, string][]; bar_prints?: BarPrint[] } | null | undefined,
  known?: readonly (number | null)[] | null
): ([number, number, string] | null)[] | undefined {
  if (!timeline?.bars?.length) return undefined
  if (model && known && known.length === model.measures.length) return known.map((j) => (j === null ? null : (timeline.bars[j] ?? null)))
  if (!model || !timeline.bar_prints?.length) return model ? model.measures.map((_, i) => timeline.bars[i] ?? null) : timeline.bars
  return matchBars(barPrints(model), timeline.bar_prints).map((j) => (j === null ? null : (timeline.bars[j] ?? null)))
}

/** The 0-based source bar of every bar by content (bar by bar when the timeline has no prints). */
export function contentSources(
  model: ScoreModelView,
  timeline: { bars: readonly unknown[]; bar_prints?: BarPrint[] }
): (number | null)[] {
  if (!timeline.bar_prints?.length) return model.measures.map((_, i) => (i < timeline.bars.length ? i : null))
  return matchBars(barPrints(model), timeline.bar_prints)
}
