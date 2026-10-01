/**
 * The sheet that owns a score sheet's context lyrics (*Song Sheet · Text*, linked to ``context_lyrics``),
 * so that the score editor can arrange those lyrics like the score's sections and write them back on
 * Apply (docs/design/score-arrange-design.md §4; templates *1 · YuE2 · Song*, *5 · YuE2 · DAW*).
 */
import type { ComfyNode, ComfyWidget } from '../shared/comfy'
import { type SheetPayload, nextState, normalize } from '../shared/sheetSession'
import { emptyState, parseState, serializeState } from '../shared/sheetState'
import type { LyricsTarget } from '../sheet-editor/score/lyricsFollow'

const SONG_SHEET = 'PlenioSongSheet'

function stateWidget(node: ComfyNode): ComfyWidget | null {
  return node.widgets?.find((w) => w.name === 'sheet_state') ?? null
}

function upstream(node: ComfyNode, name: string): ComfyNode | null {
  const slot = (node.inputs ?? []).findIndex((input) => input.name === name && input.link != null)
  return slot < 0 ? null : (node.getInputNode?.(slot) ?? null)
}

/** The Song Sheet whose lyrics output is linked to ``node``'s ``context_lyrics``. */
export function lyricsOwner(node: ComfyNode): ComfyNode | null {
  const source = upstream(node, 'context_lyrics')
  return source && (source.comfyClass ?? source.type) === SONG_SHEET && stateWidget(source) ? source : null
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
    ;(current.inputs ?? []).forEach((input, slot) => {
      const next = input.link != null ? current.getInputNode?.(slot) : null
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
