// The UI's state: one reactive object, filled by app.state and kept current by the plug-in's events.

import { reactive } from 'vue'

import { call, on } from './bridge'
import type { AppState, AraState, Brief, Connection, DawView, JobView, LibrarySong, Settings, SongView, TemplateDetail } from './types'

export interface Toast {
  id: number
  text: string
  problem: boolean
}

export const store = reactive({
  ready: false,
  kind: 'instrument',
  version: '',
  host: '',
  connection: null as Connection | null,
  settings: null as Settings | null,
  song: null as SongView | null,
  position: 0,
  playing: false,
  preview: false,
  peaks: {} as Record<number, number[]>, // by take number
  toasts: [] as Toast[],
  templates: {} as Record<string, TemplateDetail>,
  library: [] as LibrarySong[],
  daw: {} as Record<number, DawView>, // by take number, for the open song
  ara: null as AraState | null, // Plenio ARA's window: the clips that are Plenio takes
  busy: false
})

let toastId = 1

export function toast(text: string, problem = false): void {
  const id = toastId++
  store.toasts.push({ id, text, problem })
  setTimeout(() => {
    const at = store.toasts.findIndex((t) => t.id === id)
    if (at >= 0) store.toasts.splice(at, 1)
  }, problem ? 9000 : 5000)
}

function applySong(song: SongView | null): void {
  if (song?.id !== store.song?.id) store.daw = {}
  store.song = song
  for (const take of song?.takes ?? []) {
    if (!store.peaks[take.number] && take.hasAudio) void call('take.peaks', { index: take.index, count: 1600 })
  }
}

export async function start(): Promise<void> {
  on('connection', (c) => {
    store.connection = c as Connection
  })
  on('song', (s) => applySong(s as SongView | null))
  on('jobs', (j) => {
    if (store.song) store.song.jobs = j as JobView[]
  })
  on('transport', (t) => {
    const v = t as { seconds: number; playing: boolean; preview: boolean }
    store.position = v.seconds
    store.playing = v.playing
    store.preview = v.preview
  })
  on('peaks', (p) => {
    const v = p as { number: number; peaks: number[] }
    store.peaks[v.number] = v.peaks
  })
  on('daw', (d) => {
    const v = d as DawView
    store.daw[v.number] = v
    const take = store.song?.takes.find((t) => t.number === v.number)
    if (take) take.daw = v.state
  })
  on('ara', (a) => {
    store.ara = a as AraState
  })
  on('toast', (t) => {
    const v = t as { text: string; problem: boolean }
    toast(v.text, v.problem)
  })
  const state = await call<AppState>('app.state')
  store.kind = state.hello.kind
  store.version = state.hello.version
  store.host = state.hello.host
  store.connection = state.connection
  store.settings = state.settings
  store.position = state.position
  store.ara = state.ara ?? null
  applySong(state.song)
  store.ready = true
}

/** A call that changes the song: its answer is the song's new view. False when it failed (and said why). */
export async function act(method: string, params: Record<string, unknown> = {}): Promise<boolean> {
  try {
    const answer = await call<SongView | null>(method, params)
    if (answer !== undefined && answer !== null && typeof answer === 'object' && 'id' in answer) applySong(answer)
    else if (method === 'song.close') applySong(null)
    return true
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
    return false
  }
}

export interface BriefList {
  briefs: Brief[]
  values: Record<string, string[]>
}

const briefCache: Record<string, BriefList> = {}

/** The styles Plenio knows for songs or covers, and the values its fields have (from the plug-in's cache). */
export async function loadBriefs(kind: string): Promise<BriefList> {
  if (briefCache[kind]) return briefCache[kind]
  try {
    const answer = await call<Partial<BriefList>>('api.briefs', { kind })
    const list = { briefs: Array.isArray(answer?.briefs) ? answer.briefs : [], values: answer?.values ?? {} }
    if (list.briefs.length) briefCache[kind] = list
    return list
  } catch {
    return { briefs: [], values: {} }
  }
}

export async function loadTemplate(id: string): Promise<TemplateDetail | null> {
  if (store.templates[id]) return store.templates[id]
  try {
    const detail = await call<TemplateDetail>('api.template', { id })
    if (detail && Array.isArray(detail.fields)) {
      store.templates[id] = detail
      return detail
    }
  } catch {
    /* offline and never connected: no form yet */
  }
  return null
}

export async function refreshLibrary(): Promise<void> {
  try {
    store.library = await call<LibrarySong[]>('library.list')
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
  }
}

export async function saveSettings(change: Partial<Settings>): Promise<void> {
  try {
    const state = await call<AppState>('settings.set', change as Record<string, unknown>)
    store.settings = state.settings
    store.connection = state.connection
  } catch (error) {
    toast(error instanceof Error ? error.message : String(error), true)
  }
}

export function online(): boolean {
  return store.connection?.state === 'connected'
}

/** How a take in the making is told: sending, following the run's first take (its words and notes), waiting in
 * ComfyUI's queue, being made. */
export function jobText(job: JobView, jobs: JobView[]): string {
  if (job.status === 'submitting') {
    const first = jobs.find((j) => j.index === 0)
    if (job.index > 0 && first && first !== job && first.status !== 'submitting') return `follows take ${first.number}: its words and notes`
    return 'sending to Plenio …'
  }
  if (job.status === 'queued') return job.queuePosition ? `waiting (${job.queuePosition}. in the queue)` : 'waiting in the queue'
  if (job.status === 'running') return `${job.stage || 'working'} · ${Math.round(job.progress * 100)} %`
  return job.status
}
