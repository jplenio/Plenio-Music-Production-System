/**
 * Lyrics lines placed by hand in the piano roll's lyrics lane (owner's request 2026-10-03): moved,
 * made longer or shorter, deleted, copied and pasted like notes.
 *
 * Where a line is sung is worked out by the backend (``lyric_layout``: a line per Vocal phrase). A line
 * placed by hand has a **span** - ``[start, end)`` in units of L - kept in the node's properties
 * (``plenio_lyric_spans``, like the Guide notes) and sent with the lyrics. A section with spans is placed
 * by them: its lines take its spans in order. So an edit in the lane pins the whole section: every line
 * gets the span it has now, the edit changes some, and the lines are put in the order of their spans (a
 * line moved past another is sung after it - the lyrics text changes its order too). Spans stay inside
 * their section and do not overlap.
 *
 * Pure functions; the Score tab makes each edit one undo step.
 */
import type { LyricLayoutView, LyricLine, ScoreModelView } from '../../shared/scoreView'

/** ``[start, end)`` of a line placed by hand, in units of L. */
export type LyricSpan = [number, number]

/** A line of a section as the edit sees it: its words and where it is sung (``id``: who it was). */
export interface PlacedLine {
  id: string
  text: string
  start: number
  end: number
}

/** The key of a line in the lane: its section (in the model) and its index in the section's block. */
export function lineKey(section: number, line: number): string {
  return `${section}:${line}`
}

export function parseLineKey(key: string): { section: number; line: number } | null {
  const match = /^(\d+):(\d+)$/.exec(key)
  return match ? { section: Number(match[1]), line: Number(match[2]) } : null
}

/** The spans of a node property value: ``[[start, end], ...]`` (anything else: none). */
export function parseSpans(value: unknown): LyricSpan[] {
  if (!Array.isArray(value)) return []
  const spans: LyricSpan[] = []
  for (const item of value) {
    if (!Array.isArray(item) || item.length !== 2) continue
    const [start, end] = item
    if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start) spans.push([start, end])
  }
  return spans.sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

export function sameSpans(a: readonly LyricSpan[], b: readonly LyricSpan[]): boolean {
  return a.length === b.length && a.every((span, i) => span[0] === b[i][0] && span[1] === b[i][1])
}

/** ``[start, end)`` of a model section in units of L. */
export function sectionRange(model: ScoreModelView, section: number): [number, number] {
  const s = model.sections[section]
  if (!s) return [0, 0]
  const start = model.measures[s.first_bar - 1]?.onset ?? 0
  const after = model.measures[s.first_bar - 1 + s.bars]?.onset ?? model.total
  return [start, after]
}

/** The model section that holds ``unit`` (``-1``: none). */
export function sectionAt(model: ScoreModelView, unit: number): number {
  for (let i = 0; i < model.sections.length; i++) {
    const [start, end] = sectionRange(model, i)
    if (unit >= start && unit < end) return i
  }
  return -1
}

/**
 * The lines of a section where they are sung now - every line of its block, in order (``lines``: the
 * block's text). A line the backend could not place (no phrase left) gets a beat after the one before.
 */
export function placedLines(model: ScoreModelView, layout: LyricLayoutView, section: number, lines: readonly string[]): PlacedLine[] {
  const laid = layout.sections.find((s) => s.section === section)
  const [start, end] = sectionRange(model, section)
  const beat = Math.max(1, Math.round(model.grid.units_per_quarter))
  const byLine = new Map<number, LyricLine>((laid?.lines ?? []).map((l) => [l.line, l]))
  const placed: PlacedLine[] = []
  let cursor = start
  lines.forEach((text, index) => {
    const at = byLine.get(index)
    let from = at ? at.start : cursor
    let to = at ? Math.max(at.end, at.start + 1) : from + beat
    if (at && at.end <= at.start) to = from + beat // an unsung line: a beat wide, to grab it
    from = Math.min(Math.max(from, start), end - 1)
    to = Math.min(Math.max(to, from + 1), end)
    placed.push({ id: String(index), text, start: from, end: to })
    cursor = to
  })
  return placed
}

/**
 * The lines after an edit, in the order of their spans and inside ``range``. The lines the edit placed
 * (an ``id`` starting with ``*``: moved, made longer or shorter, pasted, typed) stand exactly where they
 * were put, and the others make room: a line they cover in part starts where they end, a line they cover
 * whole moves behind them with its length (and moves the lines after it only as far as it must). A line
 * that reaches into the next one ends where that one starts; a line moved past another is sung after it.
 */
export function settle(lines: readonly PlacedLine[], range: [number, number]): PlacedLine[] {
  const [low, high] = range
  const items = lines.map((line, index) => {
    const length = Math.max(1, Math.min(line.end - line.start, high - low))
    const start = Math.min(Math.max(line.start, low), high - 1)
    return { line: { ...line, start, end: Math.min(start + length, high) }, index, placed: line.id.startsWith('*') }
  })
  const placed = items.filter((item) => item.placed).sort((a, b) => a.line.start - b.line.start)
  /** Past every placed line that ``unit`` falls in (one after the other). */
  const pastPlaced = (unit: number): number => {
    let at = unit
    for (const other of placed) if (at >= other.line.start && at < other.line.end) at = other.line.end
    return at
  }
  let previousEnd = low
  for (const item of items.filter((i) => !i.placed).sort((a, b) => a.line.start - b.line.start || a.index - b.index)) {
    const { start, end } = item.line
    let from = pastPlaced(Math.max(start, previousEnd))
    while (from !== pastPlaced(from)) from = pastPlaced(from)
    // covered in part: the rest of it stays; covered whole: it keeps its length behind what covered it
    const to = end > from ? end : from + (end - start)
    item.line.start = Math.min(from, high - 1)
    item.line.end = Math.min(Math.max(to, item.line.start + 1), high)
    previousEnd = item.line.end
  }
  const sorted = items
    .sort((a, b) => a.line.start - b.line.start || Number(b.placed) - Number(a.placed) || a.index - b.index)
    .map((item) => item.line)
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[i + 1]
    if (next && next.start <= sorted[i].start) next.start = Math.min(sorted[i].start + 1, high - 1)
    if (next && sorted[i].end > next.start) sorted[i].end = next.start
    if (sorted[i].end <= sorted[i].start) sorted[i].end = Math.min(sorted[i].start + 1, high)
  }
  return sorted
}

/** ``spans`` with the spans inside ``range`` replaced by those of ``lines`` (a section pinned anew). */
export function withSectionSpans(spans: readonly LyricSpan[], range: [number, number], lines: readonly PlacedLine[]): LyricSpan[] {
  const kept = spans.filter(([start]) => start < range[0] || start >= range[1])
  return parseSpans([...kept, ...lines.map((line) => [line.start, line.end])])
}

/** Spans after bars moved: the backend's time map of the edit (``[old_start, old_end, new_start]``). */
export function remapSpans(spans: readonly LyricSpan[], timeMap: readonly (readonly number[])[]): LyricSpan[] {
  const result: LyricSpan[] = []
  for (const [start, end] of spans) {
    for (const [oldStart, oldEnd, newStart] of timeMap) {
      // a span goes where its start goes (a copied bar copies it, a deleted one loses it)
      if (start < oldStart || start >= oldEnd) continue
      const shift = newStart - oldStart
      result.push([start + shift, Math.min(end, oldEnd) + shift])
    }
  }
  return parseSpans(result)
}

/** A clip of lyrics lines: their words and spans relative to the first one's start. */
export interface LyricClipLine {
  text: string
  offset: number
  length: number
}

export function clipOfLines(lines: readonly PlacedLine[]): LyricClipLine[] {
  const sorted = [...lines].sort((a, b) => a.start - b.start)
  const first = sorted[0]?.start ?? 0
  return sorted.map((line) => ({ text: line.text, offset: line.start - first, length: line.end - line.start }))
}
