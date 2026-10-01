/**
 * The sheets that own another sheet's context documents, so that an editor can write them back on Apply:
 *
 * - the **lyrics** of a score sheet (*Song Sheet · Text*, linked to ``context_lyrics``): the score editor
 *   arranges them like the score's sections (docs/design/score-arrange-design.md §4; templates
 *   *1 · YuE2 · Song*, *5 · YuE2 · DAW*);
 * - the **score** of a text sheet (*Song Sheet · Score*, linked to ``context_score``; *2 · YuE2 · Cover*):
 *   the cover's text sheet edits the score it shows (owner's request 2026-10-02).
 */
import { type Fetcher, resolveSheet } from '../api/client'
import type { ComfyNode, ComfyWidget } from '../shared/comfy'
import { type ScoreTarget, type SheetPayload, nextState, normalize, upstreamOf, withApproval } from '../shared/sheetSession'
import { type SheetState, emptyState, parseState, serializeState } from '../shared/sheetState'
import type { LyricsTarget } from '../sheet-editor/score/lyricsFollow'

const SONG_SHEET = 'PlenioSongSheet'

function stateWidget(node: ComfyNode): ComfyWidget | null {
  return node.widgets?.find((w) => w.name === 'sheet_state') ?? null
}

interface GraphLinks {
  links?: Map<number | string, { origin_id: number | string }> | Record<string, { origin_id: number | string }>
  getLink?(id: number | string): { origin_id: number | string } | null | undefined
  getNodeById?(id: number | string): ComfyNode | null | undefined
}

/**
 * The node linked to input ``slot``, read from the graph's link table. The frontend's own
 * ``getInputNode`` throws or answers nothing for some inputs of subgraph nodes (*YuE2 Plan*, *Write
 * Song*; frontend 1.53), and an error here once kept the Score sheet's editor from opening. Never throws.
 */
function inputNode(node: ComfyNode, slot: number): ComfyNode | null {
  const id = node.inputs?.[slot]?.link
  if (id == null) return null
  try {
    const graph = (node as unknown as { graph?: GraphLinks }).graph
    const table = graph?.links
    const link = graph?.getLink?.(id) ?? (table instanceof Map ? table.get(id) : table?.[String(id)])
    if (link && graph?.getNodeById) return graph.getNodeById(link.origin_id) ?? null
    return node.getInputNode?.(slot) ?? null
  } catch {
    return null
  }
}

function upstream(node: ComfyNode, name: string): ComfyNode | null {
  const slot = (node.inputs ?? []).findIndex((input) => input.name === name && input.link != null)
  return slot < 0 ? null : inputNode(node, slot)
}

/** The Song Sheet linked to ``node``'s context input ``name`` (``context_lyrics``, ``context_score``). */
function contextOwner(node: ComfyNode, name: string): ComfyNode | null {
  const source = upstream(node, name)
  return source && (source.comfyClass ?? source.type) === SONG_SHEET && stateWidget(source) ? source : null
}

/** The Song Sheet whose lyrics output is linked to ``node``'s ``context_lyrics``. */
export function lyricsOwner(node: ComfyNode): ComfyNode | null {
  return contextOwner(node, 'context_lyrics')
}

/** The Song Sheet whose score output is linked to ``node``'s ``context_score`` (a cover's score sheet). */
export function scoreOwner(node: ComfyNode): ComfyNode | null {
  return contextOwner(node, 'context_score')
}

/** Whether ``ancestor`` lies upstream of ``node``'s input ``name`` (through any number of nodes). */
export function feeds(ancestor: ComfyNode, node: ComfyNode, name: string): boolean {
  const queue: ComfyNode[] = []
  const first = upstream(node, name)
  if (first) queue.push(first)
  const seen = new Set<string>()
  while (queue.length && seen.size < 1000) {
    const current = queue.shift() as ComfyNode
    const id = String(current.id)
    if (seen.has(id)) continue
    seen.add(id)
    if (current === ancestor || id === String(ancestor.id)) return true
    ;(current.inputs ?? []).forEach((_input, slot) => {
      const next = inputNode(current, slot)
      if (next) queue.push(next)
    })
  }
  return false
}

/**
 * Where ``node``'s context lyrics can be written back, and whether they may: only lyrics that are still
 * what the last run showed this sheet (otherwise a newer edit in the owner would be overwritten).
 */
export function lyricsTargetOf(
  node: ComfyNode,
  payload: SheetPayload | null,
  payloadOf: (nodeId: string) => SheetPayload | null
): { owner: ComfyNode; target: LyricsTarget } | null {
  const owner = lyricsOwner(node)
  const base = payload?.context?.lyrics
  if (!owner || !base) return null
  const title = owner.title || 'Song Sheet'
  const state = parseState(stateWidget(owner)?.value)
  const current = state?.docs.lyrics?.text ?? payloadOf(String(owner.id))?.docs.lyrics?.upstream ?? null
  let blocked: string | null = null
  if (state === null) blocked = `The state of ${title} is unreadable - open that sheet and apply it first.`
  else if (current !== null && normalize(current) !== normalize(base)) {
    blocked = `The lyrics in ${title} changed after the last run. Run the workflow again; then they can follow the sections.`
  }
  return { owner, target: { title, blocked, replans: feeds(owner, node, 'score') } }
}

/** Write arranged lyrics into the owner's state: edited against its draft (manual without one). */
export function writeLyrics(owner: ComfyNode, lyrics: string, ownerPayload: SheetPayload | null): void {
  const widget = stateWidget(owner)
  if (!widget) return
  const state = parseState(widget.value) ?? emptyState()
  widget.value = serializeState(nextState(state, ownerPayload, [{ kind: 'lyrics', text: lyrics, intent: 'keep' }]))
  owner.setDirtyCanvas?.(true, true)
}

/**
 * Where ``node``'s context score can be written back, and whether it may: only a score that is still
 * what the last run showed this sheet (a newer edit in the score sheet is never overwritten).
 */
export function scoreTargetOf(
  node: ComfyNode,
  payload: SheetPayload | null,
  payloadOf: (nodeId: string) => SheetPayload | null
): { owner: ComfyNode; target: ScoreTarget } | null {
  const owner = scoreOwner(node)
  const shown = payload?.context?.score
  if (!owner || !shown) return null
  const title = owner.title || 'Song Sheet'
  const state = parseState(stateWidget(owner)?.value)
  const current = state?.docs.score?.text ?? payloadOf(String(owner.id))?.docs.score?.upstream ?? null
  let blocked: string | null = null
  if (state === null) blocked = `The state of ${title} is unreadable - open that sheet and apply it first.`
  else if (current !== null && normalize(current) !== normalize(shown)) {
    blocked = `The score in ${title} changed after the last run. Run the workflow again; then it can be edited here.`
  }
  return { owner, target: { title, blocked } }
}

/** The review setting of a sheet as its last run applied it (``as the brief says`` resolved). */
function reviewOf(owner: ComfyNode, ownerPayload: SheetPayload | null): string {
  const setting = String(owner.widgets?.find((w) => w.name === 'review')?.value ?? 'continue')
  return setting === 'as the brief says' ? (ownerPayload?.review ?? 'continue') : setting
}

/**
 * Write a score edited in a text sheet into the sheet that owns it: edited against its draft (manual
 * without one). Without ``approve`` that sheet asks for approval again (its score changed); with it -
 * Approve was pressed on exactly this score - the backend resolves the owner's new state and, when it
 * is valid, its fingerprint is stored as approved. Resolves with the state that was written.
 */
export async function writeScore(
  owner: ComfyNode,
  score: string,
  ownerPayload: SheetPayload | null,
  approve: { fetcher: Fetcher } | null = null
): Promise<SheetState | null> {
  const widget = stateWidget(owner)
  if (!widget) return null
  const before = parseState(widget.value) ?? emptyState()
  const state = nextState(before, ownerPayload, [{ kind: 'score', text: score, intent: 'keep' }])
  widget.value = serializeState(state)
  owner.setDirtyCanvas?.(true, true)
  if (!approve || !ownerPayload) return state
  try {
    const resolved = await resolveSheet(approve.fetcher, {
      sheet_state: state,
      upstream: upstreamOf(ownerPayload),
      owned: ownerPayload.owned,
      review: reviewOf(owner, ownerPayload),
      engine: ownerPayload.engine,
      instrumental: ownerPayload.instrumental,
      context: ownerPayload.context,
      target_seconds: ownerPayload.target_seconds ?? null
    })
    const clean = !resolved.findings.some((f) => f.severity === 'error')
    if (!clean || !resolved.fingerprint) return state
    const approved = withApproval(state, resolved.fingerprint)
    widget.value = serializeState(approved)
    owner.setDirtyCanvas?.(true, true)
    return approved
  } catch {
    return state // the sheet asks for approval on the next run instead
  }
}
