/** The last Song Sheet payload per node (from execution results and the plenio.sheet event). */
import type { SheetPayload } from '../shared/sheetSession'

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
