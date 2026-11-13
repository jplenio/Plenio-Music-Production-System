// The bridge to the plug-in: calls go out through the native function `plenioCall` (JSON text in and out), events
// come in through `window.__plenioEvent`. In a browser (development, screenshots, tests) a mock answers instead.

export interface CallError {
  code: string
  message: string
}

type Handler = (payload: unknown) => void

declare global {
  interface Window {
    plenioCall?: (request: string) => Promise<string>
    __plenioEvent?: (name: string, payload: unknown) => void
  }
}

const handlers = new Map<string, Set<Handler>>()

window.__plenioEvent = (name: string, payload: unknown) => {
  for (const handler of handlers.get(name) ?? []) {
    try {
      handler(payload)
    } catch (error) {
      console.error(`event ${name}:`, error)
    }
  }
}

/** Mock: answers calls when the page runs outside the plug-in. */
export type MockCall = (method: string, params: Record<string, unknown>) => Promise<unknown>
let mock: MockCall | null = null

export function useMock(call: MockCall): void {
  mock = call
}

export function insidePlugin(): boolean {
  return typeof window.plenioCall === 'function'
}

export class BridgeError extends Error {
  readonly code: string
  constructor(error: CallError) {
    super(error.message)
    this.code = error.code
  }
}

export async function call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  if (window.plenioCall) {
    const text = await window.plenioCall(JSON.stringify({ method, params }))
    const answer = JSON.parse(text) as { ok: boolean; result?: T; error?: CallError }
    if (!answer.ok) throw new BridgeError(answer.error ?? { code: 'internal', message: 'The call failed.' })
    return answer.result as T
  }
  if (mock) return (await mock(method, params)) as T
  throw new BridgeError({ code: 'no_plugin', message: 'Not inside the plug-in.' })
}

/** Listens to an event of the plug-in; returns a function that stops listening. */
export function on(name: string, handler: Handler): () => void {
  let set = handlers.get(name)
  if (!set) {
    set = new Set()
    handlers.set(name, set)
  }
  set.add(handler)
  return () => set?.delete(handler)
}

/** For the mock: delivers an event as the plug-in would. */
export function emit(name: string, payload: unknown): void {
  window.__plenioEvent?.(name, payload)
}
