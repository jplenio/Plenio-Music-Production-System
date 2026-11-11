/** Plenio Setup's calls to ``/plenio/setup/*`` (all answered only on the computer ComfyUI runs on). */
import { type Fetcher, PlenioApiError } from '../api/client'
import type { AccessCheck, DownloadView, Finding, FolderView, PlanView, SetupState, TestJob } from './model'

async function call<T>(fetcher: Fetcher, route: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetcher.fetchApi(route, {
    method,
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = data?.error ?? {}
    throw new PlenioApiError(error.message ?? `Request failed (${response.status})`, error.hint ?? null)
  }
  return data as T
}

export interface ApiToken {
  id: string
  name: string
  created: number
  last_used: number | null
}

export interface StateAnswer {
  state: SetupState
  version: string
}

export interface FindingsAnswer {
  status: string
  findings: Finding[]
  computer: {
    comfyui?: string
    platform?: string
    devices?: { index: number; name: string; kind: string; total_bytes: number | null }[]
    ram_total_bytes?: number | null
    disk_free_bytes?: number | null
    models_root?: string
  }
  templates: { template: string; ready: boolean }[]
}

export const setupApi = {
  plan: (f: Fetcher) => call<PlanView>(f, '/plenio/setup/plan'),
  state: (f: Fetcher) => call<StateAnswer>(f, '/plenio/setup/state'),
  saveState: (f: Fetcher, change: Partial<SetupState>) => call<StateAnswer>(f, '/plenio/setup/state', 'POST', change),
  findings: (f: Fetcher) => call<FindingsAnswer>(f, '/plenio/setup/findings'),
  folders: (f: Fetcher) => call<{ folders: Record<string, FolderView[]> }>(f, '/plenio/setup/folders'),
  download: (f: Fetcher, variants: string[], folders: Record<string, string> = {}) =>
    call<{ downloads: DownloadView[] }>(f, '/plenio/setup/downloads', 'POST', { variants, folders }),
  pause: (f: Fetcher, id: string) =>
    call<{ download: DownloadView }>(f, `/plenio/setup/downloads/${encodeURIComponent(id)}/pause`, 'POST', {}),
  resume: (f: Fetcher, id: string) =>
    call<{ download: DownloadView }>(f, `/plenio/setup/downloads/${encodeURIComponent(id)}/resume`, 'POST', {}),
  cancel: (f: Fetcher, id: string) =>
    call<{ download: DownloadView }>(f, `/plenio/setup/downloads/${encodeURIComponent(id)}`, 'DELETE'),
  check: (f: Fetcher, variant: string) => call<AccessCheck>(f, '/plenio/setup/check', 'POST', { variant }),
  saveToken: (f: Fetcher, token: string) => call<{ saved: boolean }>(f, '/plenio/setup/hub-token', 'POST', { token }),
  report: (f: Fetcher, workflow: unknown, error: unknown) =>
    call<{ files: Record<string, string> }>(f, '/plenio/setup/report', 'POST', { workflow, error }),
  reportZip: async (f: Fetcher, workflow: unknown, error: unknown): Promise<Blob> => {
    const response = await f.fetchApi('/plenio/setup/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, error, download: true })
    })
    if (!response.ok) throw new PlenioApiError(`The report could not be made (${response.status})`)
    return response.blob()
  },
  tokens: (f: Fetcher) => call<{ tokens: ApiToken[]; remote: string }>(f, '/plenio/setup/tokens'),
  makeToken: (f: Fetcher, name: string) =>
    call<ApiToken & { token: string }>(f, '/plenio/setup/tokens', 'POST', { name }),
  revokeToken: (f: Fetcher, id: string) =>
    call<{ revoked: string }>(f, `/plenio/setup/tokens/${encodeURIComponent(id)}`, 'DELETE'),
  testSong: (f: Fetcher) => call<TestJob>(f, '/plenio/setup/test-song', 'POST', {}),
  job: (f: Fetcher, id: string) => call<TestJob>(f, `/plenio/api/v1/jobs/${encodeURIComponent(id)}?wait=20`)
}
