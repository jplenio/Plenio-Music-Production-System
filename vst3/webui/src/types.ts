// What the plug-in sends the UI (src/plugin/song_controller.cpp: songView, connectionView, appState).

export type Note = [tick: number, length: number, pitch: number, velocity: number]
export type Chord = [tick: number, name: string]

export interface Connection {
  state: 'searching' | 'connected' | 'offline' | 'starting'
  host: string
  port: number
  plenio: string
  api: string
  comfyui: string
  features: string[]
  message: string
  startComfyUI?: boolean
  /** Song API major version: 2 from Plenio 2.0 on. */
  apiMajor?: number
  /** Why Plenio answers but does not let this computer in: 'token' or 'remote_off'. */
  problem?: string
  /** ComfyUI runs on another computer. */
  remote?: boolean
  /** the Plenio with which everything works (resources/plenio-compat.json) */
  recommended?: string
}

export interface Settings {
  library: string
  port: number
  startComfyUI: boolean
  /** Another computer's name or address; empty: this computer. */
  host?: string
  /** A token is kept in the system's credential store (the token itself never reaches the UI). */
  hasToken?: boolean
  /** Only ever sent: a new token (empty: forget it). */
  token?: string
  licenceAccepted: boolean
  takesPerRun: number
  stems: boolean
  flatKeys: boolean
}

export interface TakeView {
  index: number
  number: number
  title: string
  label: string
  stars?: number
  seconds: number
  created: number
  what: string
  stems: string[]
  hasAudio: boolean
  measured: boolean
  audioAt?: number
  daw?: '' | 'preparing' | 'ready' | 'failed'
  /** the cover art Plenio painted for the take (its address in the plug-in) */
  cover?: string
}

export interface DawView {
  number: number
  state: '' | 'preparing' | 'ready' | 'failed'
  problem?: string
  stems?: string[]
  click?: boolean
  folder?: string
}

export interface JobView {
  number: number
  index: number
  status: string
  stage: string
  progress: number
  what: string
  queuePosition?: number
}

export interface ScoreView {
  ppq: number
  bpm: number
  key: string
  endTick: number
  meters: [tick: number, numerator: number, denominator: number][]
  sections: [tick: number, name: string][]
  melody: Note[]
  instrument: Note[]
  chords: Chord[]
}

export interface Measure {
  tick: number
  endTick: number
  start: number
  end: number
  number: number
}

export interface Line {
  start: number
  end: number
  text: string
}

export interface SongView {
  id: string
  title: string
  kind: 'song' | 'cover'
  template: string
  fields: Record<string, unknown>
  documents: Record<string, { text: string; manual: boolean }>
  takesPerRun: number
  stems: boolean
  activeTake: number
  changes: string[]
  plan: { what: string; label: string }
  edited: { melody: boolean; instrument: boolean; chords: boolean }
  loading: boolean
  loadProblem: string
  folder: string
  /** the cover art the song shows: its active take's, else its newest take's */
  cover?: string
  reaper?: { available: boolean; placed: boolean }
  takes: TakeView[]
  jobs: JobView[]
  layout?: { scoreAt: number; audioAt: number; leadInBars: number; measured: boolean; seconds: number; tempo: [number, number] }
  lines?: Line[]
  score?: ScoreView
  measures?: Measure[]
  leadIn?: { start: number; end: number; number: number }[]
}

export interface AraClip {
  id: string
  name: string
  song: string
  stem: string
  own: number
  playing: number
  pending?: number
  takes: { number: number; label: string; seconds: number; stars?: number }[]
}

export interface AraState {
  bound: boolean
  clips: AraClip[]
}

export interface AppState {
  hello: { kind: string; version: string; host: string }
  connection: Connection | null
  settings: Settings | null
  song: SongView | null
  position: number
  ara?: AraState
}

/** A field of a template (GET /plenio/api/v2/templates/{id}). */
export interface Field {
  id: string
  label: string
  type: 'text' | 'string' | 'integer' | 'number' | 'boolean' | 'choice' | 'upload'
  default: unknown
  description?: string
  choices?: string[]
  minimum?: number
  maximum?: number
  step?: number
  when?: Record<string, string[]>
  fixed?: boolean
  required?: boolean
  advanced?: boolean
  group?: string
}

export interface TemplateDetail {
  id: string
  title: string
  kind: string
  fields: Field[]
}

export interface Brief {
  id: string
  name: string
  group?: string
  fields?: Record<string, unknown>
}

export interface LibrarySong {
  id: string
  title: string
  kind: string
  takes: number
  modified: number
  stars?: number
  cover?: string
}
