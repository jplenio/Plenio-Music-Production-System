/** The last Song Sheet payload per node (from execution results and the plenio.sheet event). */
import type { AsrNote, SheetPayload } from '../shared/sheetSession'

const payloads = new Map<string, SheetPayload>()
const listeners = new Set<(nodeId: string) => void>()

export function setPayload(nodeId: string, payload: SheetPayload): void {
  payloads.set(nodeId, payload)
  for (const listener of listeners) listener(nodeId)
}

export function getPayload(nodeId: string): SheetPayload | null {
  return payloads.get(nodeId) ?? null
}

export function onPayload(listener: (nodeId: string) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Transcribe Lyrics notes (low-confidence and left-out words) by the hash of the draft they
 * belong to. The Song Sheet shows a note when its lyrics draft has that hash - no graph wiring.
 */
const asrNotes = new Map<string, AsrNote>()

export function setAsrNote(note: AsrNote): void {
  if (note?.draft_sha256) asrNotes.set(note.draft_sha256, note)
}

export function getAsrNote(draftSha256: string | null | undefined): AsrNote | null {
  return draftSha256 ? (asrNotes.get(draftSha256) ?? null) : null
}
