/**
 * Arranging sections (docs/design/score-arrange-design.md §1; Cubase: arranger track).
 *
 * Pure list logic: every edit of the section list is a new **order** of the old sections (1-based,
 * repeats and omissions allowed) that the backend's ``arrange_sections`` builds, plus the positions
 * the selection has afterwards (0-based, in the new list).
 */

export interface Arrangement {
  /** The new song as old section numbers (1-based). */
  order: number[]
  /** Positions (0-based) of the sections to select in the new list. */
  selection: number[]
}

const sorted = (values: readonly number[]): number[] => [...new Set(values)].sort((a, b) => a - b)

/** Click, Ctrl+click (toggle) and Shift+click (range from the anchor) in the list. */
export function selectSection(
  current: readonly number[],
  index: number,
  modifiers: { toggle: boolean; range: boolean },
  anchor: number | null
): number[] {
  if (modifiers.range && anchor !== null) {
    const [low, high] = anchor <= index ? [anchor, index] : [index, anchor]
    const span = Array.from({ length: high - low + 1 }, (_, i) => low + i)
    return modifiers.toggle ? sorted([...current, ...span]) : span
  }
  if (modifiers.toggle) return current.includes(index) ? current.filter((i) => i !== index) : sorted([...current, index])
  return [index]
}

/** Delete the selected sections (at least one section stays: ``null`` otherwise). */
export function deleteSections(count: number, selected: readonly number[]): Arrangement | null {
  const gone = new Set(selected)
  const order = Array.from({ length: count }, (_, i) => i).filter((i) => !gone.has(i))
  if (!order.length || order.length === count) return null
  return { order: order.map((i) => i + 1), selection: [] }
}

/** Cubase *Duplicate*: the selected sections, in order, right after the last selected one. */
export function duplicateSections(count: number, selected: readonly number[]): Arrangement | null {
  const block = sorted(selected).filter((i) => i >= 0 && i < count)
  if (!block.length) return null
  const last = block[block.length - 1]
  const order = [
    ...Array.from({ length: last + 1 }, (_, i) => i),
    ...block,
    ...Array.from({ length: count - last - 1 }, (_, i) => last + 1 + i)
  ]
  return { order: order.map((i) => i + 1), selection: block.map((_, k) => last + 1 + k) }
}

/** Move the selection one place earlier (``-1``) or later (``+1``); a block moves past its neighbour. */
export function moveSections(count: number, selected: readonly number[], delta: -1 | 1): Arrangement | null {
  const chosen = new Set(selected.filter((i) => i >= 0 && i < count))
  if (!chosen.size) return null
  const items = Array.from({ length: count }, (_, i) => i)
  const positions = delta < 0 ? items : [...items].reverse()
  let moved = false
  for (const position of positions) {
    const item = items[position]
    const target = position + delta
    if (!chosen.has(item) || target < 0 || target >= count || chosen.has(items[target])) continue
    items[position] = items[target]
    items[target] = item
    moved = true
  }
  if (!moved) return null
  return { order: items.map((i) => i + 1), selection: items.flatMap((item, at) => (chosen.has(item) ? [at] : [])) }
}

/**
 * Drag and drop: the selected sections go before position ``before`` (0 ... count, in the current
 * list); with ``copy`` (Alt held while dragging - Cubase) they are copied there and stay where they are.
 */
export function dropSections(
  count: number,
  selected: readonly number[],
  before: number,
  copy: boolean
): Arrangement | null {
  const block = sorted(selected).filter((i) => i >= 0 && i < count)
  if (!block.length || before < 0 || before > count) return null
  const rest = copy ? Array.from({ length: count }, (_, i) => i) : Array.from({ length: count }, (_, i) => i).filter((i) => !block.includes(i))
  const at = copy ? before : before - block.filter((i) => i < before).length
  const order = [...rest.slice(0, at), ...block, ...rest.slice(at)]
  if (!copy && order.every((item, index) => item === index)) return null
  return { order: order.map((i) => i + 1), selection: block.map((_, k) => at + k) }
}
