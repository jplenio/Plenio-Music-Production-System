/** Typed calls to the /plenio/* routes. Errors carry the backend's message and hint. */
import type { SheetPayload } from '../shared/sheetSession'
import type { SheetState } from '../shared/sheetState'

export interface Fetcher {
  fetchApi(route: string, options?: RequestInit): Promise<Response>
}

export class PlenioApiError extends Error {
  constructor(
    message: string,
    readonly hint: string | null = null
  ) {
    super(message)
  }
}

async function post<T>(fetcher: Fetcher, route: string, body: unknown): Promise<T> {
  const response = await fetcher.fetchApi(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await response.json()
  if (!response.ok) {
    const error = data?.error ?? {}
    throw new PlenioApiError(error.message ?? `Request failed (${response.status})`, error.hint ?? null)
  }
  return data as T
}

export interface ResolveRequest {
  sheet_state: SheetState
  upstream: Record<string, string | null>
  owned: string[]
  review: string
  engine: string | null
  instrumental: boolean
  context: Record<string, string>
  max_seconds?: number
  target_seconds?: number | null
}

export function resolveSheet(fetcher: Fetcher, request: ResolveRequest): Promise<SheetPayload> {
  return post<SheetPayload>(fetcher, '/plenio/sheet/resolve', request)
}
