/**
 * Lyrics lines placed by hand in the piano roll's lyrics lane (owner's request 2026-10-03): moved,
 * made longer or shorter, deleted, copied and pasted like notes.
 *
 * Where a line is sung is worked out by the backend (``lyric_layout``: the lines in their order on the
 * Vocal notes, a **part** per lyrics block). A line placed by hand has a **span** - ``[start, end, block,
 * line]`` in units of L - kept in the node's properties (``plenio_lyric_spans``, like the Guide notes) and
 * sent with the lyrics: that line is sung on the notes that start inside it, and the other lines take the
 * notes between the lines placed by hand. An edit in the lane pins the whole block: every line gets the span
 * it has now, the edit changes some, and the lines are put in the order of their spans (a line moved past
 * another is sung after it - the lyrics text changes its order too). A block's lines stay between the
 * lines of the blocks before and after it and do not overlap. Spans without their line (``[start, end]``,
 * kept by Plenio 0.4.4 and 0.4.5) still place their section's lines; the first edit keeps them with their
 * lines.
 *
 * Pure functions; the Score tab makes each edit one undo step.
 */
import type { LyricLayoutView, LyricLine, LyricPart } from '../../shared/scoreView'

/**
 * ``[start, end, block, line]`` of a line placed by hand, in units of L (``[start, end]``: kept by Plenio
 * 0.4.4 and 0.4.5 without its line - the backend gives it to the lyrics block of its section).
 */
export type LyricSpan = [number, number] | [number, number, number, number]

/**
 * What the score editor keeps in the node's properties besides the documents (they are no documents:
 * they never reach the model): the lyrics lines placed by hand and how far a cover's source recording is
 * moved against the bars (``sourceShift``, seconds, + later).
 */
export interface SheetExtras {
  lyricSpans: LyricSpan[]
  sourceShift: number
}

/** The source shift of a node property value (seconds within +-10, else 0). */
export function parseShift(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 10 ? Math.round(value * 1000) / 1000 : 0
}

/** A line of a block as the edit sees it: its words and where it is sung (``id``: who it was). */
export interface PlacedLine {
  id: string
  text: string
  start: number
  end: number
}

/** The key of a line in the lane: its lyrics block and its index in the block. */
export function lineKey(block: number, line: number): string {
  return `${block}:${line}`
}

export function parseLineKey(key: string): { block: number; line: number } | null {
  const match = /^(\d+):(\d+)$/.exec(key)
  return match ? { block: Number(match[1]), line: Number(match[2]) } : null
}

/** The spans of a node property value: ``[[start, end, block, line], ...]`` or ``[start, end]`` (anything else: none). */
export function parseSpans(value: unknown): LyricSpan[] {
  if (!Array.isArray(value)) return []
  const spans: LyricSpan[] = []
  for (const item of value) {
    if (!Array.isArray(item) || (item.length !== 2 && item.length !== 4)) continue
    if (!item.every((x) => Number.isInteger(x) && x >= 0)) continue
    const [start, end] = item as number[]
    if (end <= start) continue
    spans.push(item.length === 4 ? [start, end, item[2] as number, item[3] as number] : [start, end])
  }
  return spans.sort((a, b) => a[0] - b[0] || a[1] - b[1] || (a[2] ?? -1) - (b[2] ?? -1) || (a[3] ?? -1) - (b[3] ?? -1))
}

export function sameSpans(a: readonly LyricSpan[], b: readonly LyricSpan[]): boolean {
  return a.length === b.length && a.every((span, i) => span.length === b[i].length && span.every((x, k) => x === b[i][k]))
}

/** The part of lyrics block ``block`` (``undefined``: no note sings it and it has no section of its own). */
export function partOf(layout: LyricLayoutView, block: number): LyricPart | undefined {
  return layout.parts.find((p) => p.block === block)
}

/** The part whose stretch holds ``unit`` (the parts cover the score one after the other). */
export function partAt(layout: LyricLayoutView, unit: number): LyricPart | undefined {
  return layout.parts.find((p) => unit >= p.start && unit < p.end)
}

function placedHere(line: LyricLine): boolean {
  return line.syllables.length > 0 || line.pinned
}

/**
 * Where block ``block``'s lines may stand (``[start, end)`` in units of L): after the last line of the
 * blocks before it, before the first line of the blocks after it.
 */
export function editRange(layout: LyricLayoutView, block: number, total: number): [number, number] {
  let low = 0
  let high = total
  for (const part of layout.parts) {
    const lines = part.lines.filter(placedHere)
    if (!lines.length || part.block === block) continue
    if (part.block < block) low = Math.max(low, ...lines.map((l) => Math.max(l.end, l.start + 1)))
    else high = Math.min(high, ...lines.map((l) => l.start))
  }
  return [low, Math.max(high, low + 1)]
}

/**
 * The lines of a block where they are sung now - every line of its text, in order (``lines``). A line the
 * backend could not place (no note left) gets ``beat`` units after the one before.
 */
export function placedLines(
  layout: LyricLayoutView,
  block: number,
  lines: readonly string[],
  range: [number, number],
  beat: number
): PlacedLine[] {
  const part = partOf(layout, block)
  const [start, end] = range
  const byLine = new Map<number, LyricLine>((part?.lines ?? []).map((l) => [l.line, l]))
  const placed: PlacedLine[] = []
  let cursor = part ? Math.max(part.start, start) : start
  lines.forEach((text, index) => {
    const at = byLine.get(index)
    const sung = at && placedHere(at)
    let from = sung ? at.start : cursor
    let to = sung ? Math.max(at.end, at.start + 1) : from + beat
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

/**
 * The spans after an edit that pinned ``edited`` (block -> its lines, in their new order): those blocks'
 * lines get these spans; the lines of other blocks keep theirs. Spans kept without their line become the
 * spans of the lines they placed (``layout``: the view they gave).
 */
export function withBlockSpans(
  spans: readonly LyricSpan[],
  layout: LyricLayoutView,
  edited: ReadonlyMap<number, readonly PlacedLine[]>
): LyricSpan[] {
  const kept = spans.filter((s): s is [number, number, number, number] => s.length === 4 && !edited.has(s[2]))
  const known = new Set(kept.map((s) => lineKey(s[2], s[3])))
  const migrated: LyricSpan[] = spans.some((s) => s.length === 2)
    ? layout.parts.flatMap((p) =>
        p.lines
          .filter((l) => l.pinned && !edited.has(l.block) && !known.has(lineKey(l.block, l.line)))
          .map((l): LyricSpan => [l.start, l.end, l.block, l.line])
      )
    : []
  const added = [...edited].flatMap(([block, lines]) => lines.map((line, index): LyricSpan => [line.start, line.end, block, index]))
  return parseSpans([...kept, ...migrated, ...added])
}

/** Spans after bars moved: the backend's time map of the edit (``[old_start, old_end, new_start]``). */
export function remapSpans(spans: readonly LyricSpan[], timeMap: readonly (readonly number[])[]): LyricSpan[] {
  const result: LyricSpan[] = []
  for (const span of spans) {
    const [start, end] = span
    for (const [oldStart, oldEnd, newStart] of timeMap) {
      // a span goes where its start goes (a copied bar copies it, a deleted one loses it)
      if (start < oldStart || start >= oldEnd) continue
      const shift = newStart - oldStart
      const moved: LyricSpan = span.length === 4 ? [start + shift, Math.min(end, oldEnd) + shift, span[2], span[3]] : [start + shift, Math.min(end, oldEnd) + shift]
      result.push(moved)
    }
  }
  return parseSpans(result)
}

/**
 * Spans after the lyrics followed an arrangement of the sections (``lyricsFollow``): a block is the k-th
 * labelled section's, so a span goes to the block of the new section that took its section's words
 * (``sources``: the old section of every new one, ``-1``: none) - of a copied section the copy whose start
 * is nearest to the span's. A span whose section is gone is left out.
 */
export function followSpans(
  spans: readonly LyricSpan[],
  sources: readonly number[],
  oldLabelled: readonly number[],
  newLabelled: readonly number[],
  newStarts: readonly number[]
): LyricSpan[] {
  const result: LyricSpan[] = []
  for (const span of spans) {
    if (span.length !== 4) {
      result.push(span)
      continue
    }
    const section = oldLabelled[span[2]]
    const candidates = newLabelled.map((index, block) => ({ index, block })).filter(({ index }) => section !== undefined && sources[index] === section)
    if (!candidates.length) continue
    const nearest = candidates.reduce((best, c) => (Math.abs(newStarts[c.index] - span[0]) < Math.abs(newStarts[best.index] - span[0]) ? c : best))
    result.push([span[0], span[1], nearest.block, span[3]])
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
