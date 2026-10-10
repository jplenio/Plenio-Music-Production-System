/**
 * Continue a song from its release record (owner's request 2026-10-11): apply what the backend decided
 * (``core.continuation``, ``plenio.continuation/1``) to the workflow just loaded - the settings of a template
 * by node and input name, the blocks the song ran, and the Song Sheets' states that keep its documents.
 * Kept free of the ComfyUI globals so it is tested with a graph of plain objects.
 */
import type { Continuation } from '../api/client'
import { ownedBeforeRun } from './sheetSession'
import { DOCUMENT_KINDS, type DocumentKind, type SheetState, parseState, serializeState } from './sheetState'

export interface WidgetLike {
  name: string
  value: unknown
  callback?: (value: unknown) => void
}

export interface NodeLike {
  id: number | string
  type: string
  mode?: number
  widgets?: WidgetLike[]
  inputs?: { name: string; link?: number | null }[]
  /** A subgraph instance's graph (frontend 1.2x+). */
  subgraph?: GraphLike
}

export interface GraphLike {
  nodes?: NodeLike[]
  _nodes?: NodeLike[]
  getNodeById?(id: number | string): NodeLike | null | undefined
}

const SHEET_NODE = 'PlenioSongSheet'

function nodesOf(graph: GraphLike): NodeLike[] {
  return graph.nodes ?? graph._nodes ?? []
}

function byId(graph: GraphLike, id: string): NodeLike | null {
  const found = graph.getNodeById?.(id) ?? graph.getNodeById?.(Number(id))
  return found ?? nodesOf(graph).find((node) => String(node.id) === id) ?? null
}

/** The node of an execution id: ``"4:501"`` is node 501 of the subgraph that node 4 is an instance of. */
export function nodeAt(graph: GraphLike, executionId: string): NodeLike | null {
  let current: GraphLike | undefined = graph
  let node: NodeLike | null = null
  for (const part of executionId.split(':')) {
    if (!current) return null
    node = byId(current, part)
    if (!node) return null
    current = node.subgraph
  }
  return node
}

/**
 * Set a node's widgets to ``inputs`` (input name -> value), the plain ones first: a DynamicCombo adds the
 * widgets of its option (``mode.preset``) when its own value is set. The callback runs as when the user
 * picks a value. Returns the names the node has no widget for.
 */
export function applyValues(node: NodeLike, inputs: Record<string, unknown>): string[] {
  const missing: string[] = []
  const names = Object.keys(inputs).sort((a, b) => a.split('.').length - b.split('.').length)
  for (const name of names) {
    const widget = node.widgets?.find((w) => w.name === name)
    if (!widget) {
      missing.push(name)
      continue
    }
    const value = inputs[name]
    if (widget.value === value) continue
    widget.value = value
    widget.callback?.(value)
  }
  return missing
}

export interface Applied {
  /** Settings set, and those that found no widget (``node title: input``). */
  values: number
  missing: string[]
  /** Song Sheets that keep the song's documents. */
  sheets: number
  /** Blocks turned on. */
  activated: number
}

/** Apply a continuation to the graph it loaded (``plan.workflow``). */
export function applyContinuation(graph: GraphLike, plan: Continuation): Applied {
  const applied: Applied = { values: 0, missing: [], sheets: 0, activated: 0 }
  for (const id of plan.activate) {
    const node = nodeAt(graph, id)
    if (node && node.mode !== 0) {
      node.mode = 0
      applied.activated++
    }
  }
  for (const [id, inputs] of Object.entries(plan.values)) {
    const node = nodeAt(graph, id)
    if (!node) {
      applied.missing.push(...Object.keys(inputs).map((name) => `${id}: ${name}`))
      continue
    }
    const missing = applyValues(node, inputs)
    applied.values += Object.keys(inputs).length - missing.length
    applied.missing.push(...missing.map((name) => `${node.type}: ${name}`))
  }
  for (const [id, state] of Object.entries(plan.sheets)) {
    const widget = nodeAt(graph, id)?.widgets?.find((w) => w.name === 'sheet_state')
    if (!widget) continue
    widget.value = state
    widget.callback?.(state)
    applied.sheets++
  }
  return applied
}

/**
 * For a record whose workflow cannot be rebuilt: its documents go into the Song Sheets of the open workflow,
 * each sheet taking those it owns (by its linked inputs and its state), as *manual*. Returns how many sheets
 * took documents.
 */
export function documentsIntoSheets(graph: GraphLike, documents: Record<string, string>): number {
  let count = 0
  for (const node of nodesOf(graph)) {
    if (node.type !== SHEET_NODE) continue
    const widget = node.widgets?.find((w) => w.name === 'sheet_state')
    if (!widget) continue
    const current: SheetState = parseState(widget.value) ?? { schema: 'plenio.sheet_state/1', docs: {} }
    const connected = (node.inputs ?? []).filter((slot) => slot.link != null).map((slot) => slot.name)
    const owned = ownedBeforeRun(connected, current)
    const kinds = (owned.length ? owned : [...DOCUMENT_KINDS]).filter((kind): kind is DocumentKind => !!documents[kind])
    if (!kinds.length) continue
    const docs = { ...current.docs }
    for (const kind of kinds) docs[kind] = { state: 'manual', text: documents[kind] }
    const next = serializeState({ ...current, docs, review: undefined })
    widget.value = next
    widget.callback?.(next)
    count++
  }
  return count
}

/** The workflow tab's name: the record's file name without ``.plenio.json`` (the song's base name). */
export function workflowName(source: string, title: string): string {
  const base = source.split(/[\\/]/).pop() ?? ''
  const name = base.replace(/\.plenio\.json$/i, '').replace(/\.json$/i, '')
  return name || title || 'Plenio song'
}

/** One sentence for the toast: what was restored and how to go on. */
export function describe(plan: Continuation, applied: Applied | null): string {
  const made = [plan.plenio && `Plenio ${plan.plenio}`, plan.created.slice(0, 10)].filter(Boolean).join(', ')
  const kept = applied?.sheets
    ? ' Its title, style, lyrics and score are kept in the Song Sheets (manual): a new take seed gives new takes of the same song, the editor changes the score, Back to auto lets the workflow write a document again.'
    : ''
  if (plan.from === 'record') return `"${plan.title}" opened in the workflow it was made with (${made}).${kept}`
  if (plan.from === 'template') {
    const lost = plan.unplaced.length
      ? ` ${plan.unplaced.length} node(s) of the song have no place in today's template: ${plan.unplaced.join(', ')}.`
      : ''
    return `"${plan.title}" (${made}) opened in today's template "${plan.template}" with the song's settings.${kept}${lost}`
  }
  return `The workflow "${plan.title}" was made with cannot be rebuilt (a workflow of your own, from before records kept it).`
}
