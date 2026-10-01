/**
 * Which bar of the transcription every bar of the score is (backend ``bar_match``, the same rule):
 * a cover's arranged score - a copied chorus, a moved verse - finds its source bars by their content,
 * so *A/B* plays the source chorus for a copied chorus and the section list shows its source times.
 * The prints are the backend's strings (``4/4:0.8.66,8.8.78``), compared with the timeline's.
 */
import type { ModelNote, ScoreModelView } from '../../shared/scoreView'

export type BarPrint = [string, string]

const EVIDENCE = 2
const EMPTY = 0.5
const LOOKAHEAD = 32

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

/** For every bar the 0-based source bar it is (``null``: past the end of the source). */
export function matchBars(final: readonly BarPrint[], source: readonly BarPrint[]): (number | null)[] {
  const scores = final.map((bar) => source.map((other) => score(bar, other)))
  const best = scores.map((row) => (row.length ? Math.max(...row) : 0))
  const run = (i: number, j: number): number => {
    let length = 0
    while (length < LOOKAHEAD && i + length < final.length && j + length < source.length) {
      if (best[i + length] <= 0 || scores[i + length][j + length] !== best[i + length]) break
      length++
    }
    return length
  }
  const mapping: (number | null)[] = []
  let previous = -1
  for (let i = 0; i < final.length; i++) {
    const follow = previous + 1
    let chosen: number | null
    if (best[i] > 0) {
      const candidates = scores[i].flatMap((value, j) => (value === best[i] ? [j] : []))
      const runs = new Map(candidates.map((j) => [j, run(i, j)]))
      const longest = Math.max(...runs.values())
      if (candidates.includes(follow) && (runs.get(follow) ?? 0) >= longest) chosen = follow
      else {
        chosen = [...candidates].sort(
          (a, b) => (runs.get(b) ?? 0) - (runs.get(a) ?? 0) || Math.abs(a - follow) - Math.abs(b - follow) || a - b
        )[0]
      }
    } else chosen = follow < source.length ? follow : null
    mapping.push(chosen)
    if (chosen !== null) previous = chosen
  }
  return mapping
}

/**
 * The timeline's bars ``[start, end, meter]`` as the score's bars see them: the source bar each score
 * bar is (by content when the timeline knows its bars' prints, else bar by bar), ``null`` where none.
 */
export function sourceBars(
  model: ScoreModelView | null | undefined,
  timeline: { bars: [number, number, string][]; bar_prints?: BarPrint[] } | null | undefined
): ([number, number, string] | null)[] | undefined {
  if (!timeline?.bars?.length) return undefined
  if (!model || !timeline.bar_prints?.length) return model ? model.measures.map((_, i) => timeline.bars[i] ?? null) : timeline.bars
  return matchBars(barPrints(model), timeline.bar_prints).map((j) => (j === null ? null : (timeline.bars[j] ?? null)))
}
