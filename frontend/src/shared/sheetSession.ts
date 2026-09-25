/**
 * Editing session of one Song Sheet: working copies and the state transitions of
 * score-editor-design.md section 6.3. Pure functions; the backend validates and
 * computes fingerprints (/plenio/sheet/resolve).
 */
import {
  DOCUMENT_KINDS,
  type DocEntry,
  type DocumentKind,
  type SheetState,
  emptyState
} from './sheetState'

export interface PayloadDoc {
  state: 'auto' | 'edited' | 'manual'
  status: 'auto' | 'edited' | 'manual' | 'conflict' | 'missing'
  upstream: string | null
  upstream_sha256: string | null
  text: string | null
  reason: string
}

export interface Finding {
  severity: 'error' | 'warning' | 'info'
  message: string
  where: string
}

export interface SheetPayload {
  schema: string
  node_id?: string
  owned: DocumentKind[]
  docs: Partial<Record<DocumentKind, PayloadDoc>>
  context: Record<string, string>
  findings: Finding[]
  fingerprint: string | null
  review: 'continue' | 'stop for review'
  approved: boolean
  waiting: boolean
  status: string
  planning_mode: string
  score_seconds: number
  validation: Record<string, unknown> | null
  engine: string | null
  instrumental: boolean
  target_seconds?: number | null
  timeline?: TimelinePayload
  reference_audio?: { filename: string; subfolder: string; type: string }
}

/** Plenio timeline (plenio.timeline/1) as far as the editor uses it. */
export interface TimelinePayload {
  duration_s: number
  bars: [number, number, string][]
  sections: [string, number, number][]
}

/** What Transcribe Lyrics reports about the draft it produced (``plenio_asr``). */
export interface AsrNote {
  draft_sha256: string
  engine: string
  language: string
  low_confidence: string[]
  left_out: string[]
}

export interface SectionTime {
  label: string
  bars: number
  start: string
  end: string
}

function clock(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds - minutes * 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/** Start and end of every score section in the source (a timeline's bars are 1-based in sections). */
export function sectionTimes(timeline: TimelinePayload | null | undefined): SectionTime[] {
  if (!timeline?.bars?.length) return []
  return (timeline.sections ?? []).map(([label, startBar, bars]) => {
    const first = timeline.bars[Math.max(0, startBar - 1)]
    const last = timeline.bars[Math.min(timeline.bars.length - 1, startBar - 1 + bars - 1)]
    return { label, bars, start: clock(first?.[0] ?? 0), end: clock(last?.[1] ?? timeline.duration_s) }
  })
}

export type Intent = 'keep' | 'auto' | 'manual' | 'rebase'

export interface WorkingDoc {
  kind: DocumentKind
  text: string
  intent: Intent
}

/** Normalisation used by the backend (normalize_document): LF, no trailing spaces, no outer blank lines. */
export function normalize(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/\s+$/, ''))
  let start = 0
  let end = lines.length
  while (start < end && !lines[start]) start++
  while (end > start && !lines[end - 1]) end--
  return lines.slice(start, end).join('\n')
}

/** The text a document starts with in the editor. */
export function initialText(state: SheetState, payload: SheetPayload | null, kind: DocumentKind): string {
  const entry = state.docs[kind]
  if (entry) return entry.text
  return payload?.docs[kind]?.upstream ?? ''
}

export function startSession(state: SheetState, payload: SheetPayload | null, owned: DocumentKind[]): WorkingDoc[] {
  return owned.map((kind) => ({ kind, text: initialText(state, payload, kind), intent: 'keep' as Intent }))
}

/**
 * The next persisted state from the working copies.
 *
 * - intent 'auto'   -> automatic (edit discarded)
 * - intent 'manual' -> manual with the working text
 * - intent 'rebase' -> edited against the *current* draft (after resolving a conflict)
 * - intent 'keep'   -> unchanged text keeps its state; a changed text becomes 'edited'
 *   against the draft it was made from, or 'manual' when there is no draft.
 */
export function nextState(state: SheetState, payload: SheetPayload | null, working: WorkingDoc[]): SheetState {
  const docs: Partial<Record<DocumentKind, DocEntry>> = { ...state.docs }
  for (const doc of working) {
    const current = state.docs[doc.kind]
    const upstream = payload?.docs[doc.kind]
    const text = normalize(doc.text)
    if (doc.intent === 'auto') {
      delete docs[doc.kind]
    } else if (doc.intent === 'manual') {
      docs[doc.kind] = { state: 'manual', text }
    } else if (doc.intent === 'rebase') {
      if (!upstream?.upstream_sha256) {
        docs[doc.kind] = { state: 'manual', text }
      } else {
        docs[doc.kind] = { state: 'edited', text, base_sha256: upstream.upstream_sha256 }
      }
    } else if (!current) {
      const draft = normalize(upstream?.upstream ?? '')
      if (text === draft) continue
      docs[doc.kind] = upstream?.upstream_sha256
        ? { state: 'edited', text, base_sha256: upstream.upstream_sha256 }
        : { state: 'manual', text }
    } else if (normalize(current.text) !== text) {
      docs[doc.kind] = { ...current, text }
    }
  }
  const result: SheetState = { ...emptyState(), docs }
  if (state.review?.approved_fingerprint) result.review = { approved_fingerprint: state.review.approved_fingerprint }
  return result
}

export function withApproval(state: SheetState, fingerprint: string | null): SheetState {
  if (!fingerprint) return { ...state, review: undefined }
  return { ...state, review: { approved_fingerprint: fingerprint } }
}

/** Documents a sheet owns before it has run: connected document inputs plus manual documents. */
export function ownedBeforeRun(connected: string[], state: SheetState): DocumentKind[] {
  return DOCUMENT_KINDS.filter((kind) => connected.includes(kind) || state.docs[kind]?.state === 'manual')
}

export function upstreamOf(payload: SheetPayload | null): Record<string, string | null> {
  const result: Record<string, string | null> = {}
  for (const kind of payload?.owned ?? []) result[kind] = payload?.docs[kind]?.upstream ?? null
  return result
}
