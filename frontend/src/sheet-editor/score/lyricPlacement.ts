/**
 * Lyrics lines placed by hand in the piano roll's lyrics lane (owner's request 2026-10-03): moved,
 * made longer or shorter, deleted, copied and pasted like notes.
 *
 * Where a line is sung is worked out by the backend (``lyric_layout``: the lines in their order on the
 * Vocal notes, a **part** per lyrics block). A line placed by hand has a **span** - ``[start, end, block,
 * line]`` in units of L - kept in the node's properties (``plenio_lyric_spans``, like the Guide notes) and
 * sent with the lyrics: that line is sung on the notes that start inside it, and the other lines take the
 * notes between the lines placed by hand. An edit in the lane pins every line that is sung (GitHub issue
 * #28: editing one line moved the lines of the other blocks): every line keeps the span it has now, the edit
 * changes some, and the lines are put in the order of their spans (a line moved past another is sung after
 * it - the lyrics text changes its order too). A block's lines stay between the lines of the blocks before
 * and after it.
 *
 * **Lines never overlap and never push one another** (``fitLyricGesture``): a line dragged, made longer or
 * shorter stops at its neighbour - dragged far enough past it, it lands in the next free room -, and a new
 * line or a pasted one goes into free room only (``overlap``). Spans without their line (``[start, end]``,
 * kept by Plenio 0.4.4 and 0.4.5) still place their section's lines; the first edit keeps them with their
 * lines.
 *
 * Pure functions; the Score tab makes each edit one undo step.
 */
import type { BarSources } from './barSources'
import type { LyricLayoutView, LyricLine, LyricPart } from '../../shared/scoreView'

/**
 * ``[start, end, block, line]`` of a line placed by hand, in units of L (``[start, end]``: kept by Plenio
 * 0.4.4 and 0.4.5 without its line - the backend gives it to the lyrics block of its section). After them the
 * onsets of the line's syllables (or words) when the MusicXML import placed it: sung exactly on those notes.
 * An edit of the line in the lane places it anew, without them.
 */
export type LyricSpan = [number, number] | [number, number, number, number, ...number[]]

/**
 * What the score editor keeps in the node's properties besides the documents (they are no documents:
 * they never reach the model): the lyrics lines placed by hand and how far a cover's source recording is
 * moved against the bars (``sourceShift``, seconds, + later).
 */
export interface SheetExtras {
  lyricSpans: LyricSpan[]
  sourceShift: number
  /** Which source bar every bar is (``barSources``), with the score it describes. */
  barSources?: BarSources | null
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

/** At most this many syllable onsets per span (the backend's limit). */
const MAX_ONSETS = 512

/**
 * The spans of a node property value: ``[[start, end, block, line, ...onsets], ...]`` or ``[start, end]``
 * (anything else: none; onsets out of order or outside the span are left out).
 */
export function parseSpans(value: unknown): LyricSpan[] {
  if (!Array.isArray(value)) return []
  const spans: LyricSpan[] = []
  for (const item of value) {
    if (!Array.isArray(item) || item.length === 3 || item.length < 2 || item.length > 4 + MAX_ONSETS) continue
    if (!item.every((x) => Number.isInteger(x) && x >= 0)) continue
    const [start, end] = item as number[]
    if (end <= start) continue
    if (item.length === 2) {
      spans.push([start, end])
      continue
    }
    const onsets = (item as number[]).slice(4)
    const fits = onsets.every((x, i) => x >= start && x < end && (i === 0 || x >= onsets[i - 1]))
    spans.push([start, end, item[2] as number, item[3] as number, ...(fits ? onsets : [])])
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
 * The lines of a block where they are sung now - every line of its text, in order (``lines``). A line no
 * note sings (a direction, a line after the last note) takes no room: it stands where the line before it
 * ends, with no length, and gets no span - it never takes notes from the line after it.
 */
export function placedLines(
  layout: LyricLayoutView,
  block: number,
  lines: readonly string[],
  range: [number, number],
  _beat?: number
): PlacedLine[] {
  const part = partOf(layout, block)
  const [start, end] = range
  const byLine = new Map<number, LyricLine>((part?.lines ?? []).map((l) => [l.line, l]))
  const placed: PlacedLine[] = []
  let cursor = part ? Math.max(part.start, start) : start
  lines.forEach((text, index) => {
    const at = byLine.get(index)
    if (at && placedHere(at)) {
      const from = Math.min(Math.max(at.start, start), end - 1)
      const to = Math.min(Math.max(at.end, from + 1), end)
      placed.push({ id: String(index), text, start: from, end: to })
      cursor = to
    } else {
      const here = Math.min(Math.max(cursor, start), end)
      placed.push({ id: String(index), text, start: here, end: here })
    }
  })
  return placed
}

/**
 * The lines after an edit, in the order of their spans and inside ``range``. Nothing is pushed: every line
 * keeps its span (the gestures and the paste never let lines overlap, ``fitLyricGesture``, ``overlap``), a
 * line with no length stays without one, and a line moved past another is sung after it. Only spans that
 * overlap anyway (kept by an older version) are cut: the earlier line ends where the next one starts.
 */
export function settle(lines: readonly PlacedLine[], range: [number, number]): PlacedLine[] {
  const [low, high] = range
  const items = lines.map((line, index) => {
    const start = Math.min(Math.max(line.start, low), Math.max(low, high - 1))
    const end = line.end > line.start ? Math.min(Math.max(line.end, start + 1), high) : start
    return { line: { ...line, start, end }, index, placed: line.id.startsWith('*') }
  })
  const sorted = items
    .sort((a, b) => a.line.start - b.line.start || Number(b.placed) - Number(a.placed) || a.index - b.index)
    .map((item) => item.line)
  for (let i = 0; i + 1 < sorted.length; i++) {
    const next = sorted[i + 1]
    if (sorted[i].end > next.start) sorted[i].end = Math.max(next.start, sorted[i].start)
  }
  return sorted
}

/** A line that takes room in the lane: its key, its block and line, its span (``end > start``) and words. */
export interface LaneLine {
  key: string
  block: number
  line: number
  start: number
  end: number
  text: string
}

/** Every line that takes room in the lane (sung, or placed by hand), in the order of the score. */
export function laneLines(layout: LyricLayoutView | null | undefined): LaneLine[] {
  return (layout?.parts ?? [])
    .flatMap((p) =>
      p.lines
        .filter((l) => placedHere(l) && l.end > l.start)
        .map((l) => ({ key: lineKey(l.block, l.line), block: l.block, line: l.line, start: l.start, end: l.end, text: l.text }))
    )
    .sort((a, b) => a.start - b.start || a.block - b.block || a.line - b.line)
}

/** The first line of ``lines`` (other than ``except``) that one of ``spans`` overlaps, or ``null``. */
export function overlap(
  lines: readonly LaneLine[],
  spans: readonly { start: number; end: number }[],
  except: ReadonlySet<string> = new Set()
): LaneLine | null {
  for (const span of spans) {
    const hit = lines.find((l) => !except.has(l.key) && l.start < span.end && span.start < l.end)
    if (hit) return hit
  }
  return null
}

/** A drag (or a nudge) of lines in the lane: moved together (``keys``), or one line at its start or end. */
export interface LyricGesture {
  kind: 'move' | 'start' | 'end'
  key: string
  keys: readonly string[]
  /** How far the pointer went, in units of L (on the grid). */
  delta: number
}

/** Where a gesture leaves the lines: their new spans, and the line it stopped at (``null``: none). */
export interface FittedGesture {
  moves: { key: string; start: number; end: number }[]
  /** The gesture went as far as asked. */
  free: boolean
  /** The line it stopped at (a neighbour), when it stopped at one. */
  stoppedAt: LaneLine | null
}

/**
 * A gesture in the lane, fitted so that no line overlaps another (GitHub issue #28: a line made longer
 * pushed the next lines away from their notes). A line made longer or shorter stops at its neighbour; lines
 * moved together keep their distances and stop at the nearest line in their way - dragged far enough past
 * it, they land in the free room behind it. A line stays between the lines of the blocks before and after
 * its own (``total``: the end of the score). ``lines``: every line of the layout (a line without length gets
 * ``beat`` units when it is dragged).
 */
export function fitLyricGesture(
  layout: LyricLayoutView,
  gesture: LyricGesture,
  total: number,
  beat = 1
): FittedGesture {
  const all = layout.parts.flatMap((p) => p.lines.map((l) => ({ ...l, key: lineKey(l.block, l.line) })))
  const moving = gesture.kind === 'move' ? new Set(gesture.keys) : new Set([gesture.key])
  const picked = all
    .filter((l) => moving.has(l.key) && l.text)
    .map((l) => ({ key: l.key, block: l.block, start: l.start, end: l.end > l.start ? l.end : Math.min(total, l.start + Math.max(1, beat)) }))
  const others = laneLines(layout).filter((l) => !moving.has(l.key))
  const none: FittedGesture = { moves: [], free: true, stoppedAt: null }
  if (!picked.length) return none
  /** Where a line of ``block`` may stand: after the other blocks' lines before it, before those after it. */
  const range = (block: number): [number, number] => {
    let low = 0
    let high = total
    for (const other of others) {
      if (other.block < block) low = Math.max(low, other.end)
      else if (other.block > block) high = Math.min(high, other.start)
    }
    return [low, Math.max(low, high)]
  }
  if (gesture.kind !== 'move') {
    const line = picked[0]
    const [low, high] = range(line.block)
    if (gesture.kind === 'end') {
      const next = others.filter((o) => o.start >= line.start).sort((a, b) => a.start - b.start)[0]
      const limit = Math.min(high, next ? next.start : total)
      const wanted = line.end + gesture.delta
      const end = Math.max(line.start + 1, Math.min(wanted, limit))
      return { moves: [{ key: line.key, start: line.start, end }], free: end === wanted, stoppedAt: wanted > limit && next && next.start === limit ? next : null }
    }
    const before = others.filter((o) => o.end <= line.end).sort((a, b) => b.end - a.end)[0]
    const limit = Math.max(low, before ? before.end : 0)
    const wanted = line.start + gesture.delta
    const start = Math.min(line.end - 1, Math.max(wanted, limit))
    return {
      moves: [{ key: line.key, start, end: line.end }],
      free: start === wanted,
      stoppedAt: wanted < limit && before && before.end === limit ? before : null
    }
  }
  // the deltas that keep every moved line inside its room: an interval, minus the ones that would overlap
  let lowest = -Infinity
  let highest = Infinity
  for (const line of picked) {
    const [low, high] = range(line.block)
    lowest = Math.max(lowest, low - line.start)
    highest = Math.min(highest, high - line.end)
  }
  const blocked = others.flatMap((other) => picked.map((line) => ({ other, from: other.start - line.end, to: other.end - line.start })))
  const fits = (delta: number): boolean => delta >= lowest && delta <= highest && !blocked.some((b) => delta > b.from && delta < b.to)
  const wanted = gesture.delta
  const candidates = [wanted, 0, lowest, highest, ...blocked.flatMap((b) => [b.from, b.to])].filter((d) => Number.isFinite(d) && fits(d))
  if (!candidates.length) return { moves: [], free: false, stoppedAt: null }
  const delta = candidates.reduce((best, d) => {
    const closer = Math.abs(d - wanted) - Math.abs(best - wanted)
    return closer < 0 || (closer === 0 && Math.abs(d) < Math.abs(best)) ? d : best
  })
  const stoppedAt = delta === wanted ? null : (blocked.find((b) => wanted > b.from && wanted < b.to)?.other ?? null)
  return {
    moves: delta ? picked.map((line) => ({ key: line.key, start: line.start + delta, end: line.end + delta })) : [],
    free: delta === wanted,
    stoppedAt
  }
}

/**
 * Where a new line goes when the lane is double-clicked at ``unit`` where no line is (GitHub issue #28: lines
 * could only be added by copying one): into the block sung there, from the click (on the grid; in a phrase no
 * line sings, from the phrase's start) to the end of that phrase - or of the next one -, never past the next
 * line (where no phrase is ahead: ``beat`` units). ``null`` where no block is sung or there is no room.
 */
export function newLineAt(
  layout: LyricLayoutView,
  unit: number,
  snap: number,
  total: number,
  beat = 4 * Math.max(1, snap)
): { block: number; line: number; start: number; end: number } | null {
  const part = partAt(layout, Math.min(Math.max(0, unit), Math.max(0, total - 1)))
  if (!part) return null
  const lines = laneLines(layout)
  if (lines.some((l) => unit >= l.start && unit < l.end)) return null
  const room = [
    Math.max(0, ...lines.filter((l) => l.end <= unit).map((l) => l.end)),
    Math.min(total, ...lines.filter((l) => l.start > unit).map((l) => l.start))
  ]
  const [, high] = editRange(layout, part.block, total)
  const step = Math.max(1, snap)
  let start = Math.max(room[0], Math.floor(unit / step) * step)
  const phrase = part.phrases.find(([a, b]) => unit >= a && unit < b)
  if (phrase && !lines.some((l) => l.start < phrase[1] && l.end > phrase[0])) start = Math.max(room[0], phrase[0])
  const ahead = part.phrases.find(([a, b]) => b > start && a <= start) ?? part.phrases.find(([a]) => a > start)
  const end = Math.min(ahead ? ahead[1] : start + Math.max(1, beat), room[1], high, total)
  if (end <= start) return null
  const count = part.lines.length ? Math.max(...part.lines.map((l) => l.line)) + 1 : 0
  return { block: part.block, line: count, start, end }
}

/**
 * The spans after an edit that pinned ``edited`` (block -> its lines, in their new order): those blocks'
 * lines get these spans; the lines of other blocks keep theirs - with ``pinAll``, every other line that is
 * sung gets the span it is sung on now, so that no edit moves the lines of another block. Spans kept without
 * their line become the spans of the lines they placed (``layout``: the view they gave).
 */
export function withBlockSpans(
  spans: readonly LyricSpan[],
  layout: LyricLayoutView,
  edited: ReadonlyMap<number, readonly PlacedLine[]>,
  pinAll = false
): LyricSpan[] {
  const kept = spans.filter((s) => s.length >= 4 && !edited.has(s[2] as number))
  const known = new Set(kept.map((s) => lineKey(s[2] as number, s[3] as number)))
  const migrated: LyricSpan[] =
    pinAll || spans.some((s) => s.length === 2)
      ? layout.parts.flatMap((p) =>
          p.lines
            .filter((l) => (pinAll ? placedHere(l) : l.pinned) && l.end > l.start && !edited.has(l.block) && !known.has(lineKey(l.block, l.line)))
            .map((l): LyricSpan => [l.start, l.end, l.block, l.line])
        )
      : []
  // a line the edit left where it was keeps the onsets of its syllables (the MusicXML import's placement)
  const onsets = new Map(spans.filter((s) => s.length > 4).map((s) => [`${s[0]}:${s[1]}:${s[2]}`, s.slice(4)]))
  const added = [...edited].flatMap(([block, lines]) =>
    lines.map((line, index): LyricSpan => [line.start, line.end, block, index, ...(onsets.get(`${line.start}:${line.end}:${block}`) ?? [])])
  )
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
      // the syllables' onsets move along while they stay inside the moved bars
      const onsets = span.slice(4)
      const kept = onsets.every((x) => x >= oldStart && x < oldEnd) ? onsets.map((x) => x + shift) : []
      const moved: LyricSpan = span.length >= 4 ? [start + shift, Math.min(end, oldEnd) + shift, span[2] as number, span[3] as number, ...kept] : [start + shift, Math.min(end, oldEnd) + shift]
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
    if (span.length < 4) {
      result.push(span)
      continue
    }
    const section = oldLabelled[span[2] as number]
    const candidates = newLabelled.map((index, block) => ({ index, block })).filter(({ index }) => section !== undefined && sources[index] === section)
    if (!candidates.length) continue
    const nearest = candidates.reduce((best, c) => (Math.abs(newStarts[c.index] - span[0]) < Math.abs(newStarts[best.index] - span[0]) ? c : best))
    result.push([span[0], span[1], nearest.block, span[3] as number, ...span.slice(4)])
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
  return sorted.map((line) => ({ text: line.text, offset: line.start - first, length: Math.max(1, line.end - line.start) }))
}
