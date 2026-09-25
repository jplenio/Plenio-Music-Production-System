/**
 * Read-only view of the Song Sheet state (schema plenio.sheet_state/1).
 * The backend owns validation, resolution and fingerprints; the frontend only
 * reads the state for display and writes it back after the user edits.
 */

export const SHEET_STATE_SCHEMA = 'plenio.sheet_state/1'
export const DOCUMENT_KINDS = ['title', 'style', 'lyrics', 'score', 'artwork_prompt'] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]
export type DocState = 'auto' | 'edited' | 'manual'

export interface DocEntry {
  state: 'edited' | 'manual'
  text: string
  base_sha256?: string
}

export interface SheetState {
  schema: typeof SHEET_STATE_SCHEMA
  docs: Partial<Record<DocumentKind, DocEntry>>
  review?: { approved_fingerprint?: string }
}

export function emptyState(): SheetState {
  return { schema: SHEET_STATE_SCHEMA, docs: {} }
}

/** Parse the widget value. Returns null for malformed values: the UI then refuses to edit instead of resetting. */
export function parseState(value: unknown): SheetState | null {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return emptyState()
  }
  if (typeof value !== 'string') return null
  try {
    const data = JSON.parse(value) as SheetState
    if (data?.schema !== SHEET_STATE_SCHEMA || typeof data.docs !== 'object' || data.docs === null) return null
    return data
  } catch {
    return null
  }
}

export function serializeState(state: SheetState): string {
  const docs: Partial<Record<DocumentKind, DocEntry>> = {}
  for (const kind of DOCUMENT_KINDS) {
    const entry = state.docs[kind]
    if (entry) docs[kind] = entry
  }
  const result: SheetState = { schema: SHEET_STATE_SCHEMA, docs }
  if (state.review?.approved_fingerprint) result.review = { approved_fingerprint: state.review.approved_fingerprint }
  return JSON.stringify(result)
}

export function docState(state: SheetState, kind: DocumentKind): DocState {
  return state.docs[kind]?.state ?? 'auto'
}

/** One-line summary for the node, e.g. "lyrics edited · style manual". */
export function summarize(state: SheetState | null): string {
  if (state === null) return 'Song Sheet state is unreadable - open the editor to repair it.'
  const parts = DOCUMENT_KINDS.filter((kind) => docState(state, kind) !== 'auto').map(
    (kind) => `${kind.replace('_', ' ')} ${docState(state, kind)}`
  )
  const approved = state.review?.approved_fingerprint ? ' · approved' : ''
  return (parts.length ? parts.join(' · ') : 'all documents automatic') + approved
}
