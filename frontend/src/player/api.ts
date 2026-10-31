/** The Plenio Player's server (plenio/player/server.py): the library, one song, the files and the state - or,
 * in a shared player (one HTML file, portable.ts), the songs inside the page and the listener's browser. */
import { ensureMedia, isPortable, notInShared, portable, portableMedia, portablePage, portableState, savePortableState } from './portable'

export interface Loudness {
  lufs: number | null
  true_peak: number | null
  range: number | null
}

export interface Brief {
  kind?: string
  mode?: string
  template?: string
  description?: string
  genre?: string
  mood?: string
  tempo?: string
  length?: string
  vocals?: string
  language?: string
  voice?: string
  theme?: string
  lead_instrument?: string
  key?: string
  meter?: string
  arrangement?: string
  harmony?: string
  closeness?: number | null
  melody?: string
  lyrics_closeness?: number | null
  /** A cover's share of the source's notes its score kept (0-100; 100 every one). */
  original_notes?: number | null
  lines_under_singing?: boolean
  /** 0 steady ... 50 the reference ... 100 experimental (a song made before the slider: 50). */
  creativity?: number | null
  /** Per field where its value came from: ``typed``, ``template`` or ``default`` (left empty: the brief's
   * default, or for a text field the writer's choice). */
  sources?: Record<string, 'typed' | 'template' | 'default'>
}

export type SamplingStage = 'writer' | 'arrangement' | 'plan' | 'take'

/** A stage's sampling as the song was made: the writer's and a creative mode's temperature, YuE2's plan and take
 * with top-p and top-k. */
export interface SamplingValues {
  temperature: number
  top_p?: number
  top_k?: number
  /** The numbers were written in the workflow, not given by the creativity (a block saved before 1.0.2, or set by hand). */
  fixed?: boolean
}

/** What a song was made on (the record's ``made.on``, since 1.4.0). */
export interface MadeOn {
  device?: string
  gpu?: string
  vram_gb?: number
  cpu?: string
  cores?: number
  ram_gb?: number
}

/** How a song was made: when its run began and ended, how long it took, on what, the lyrics fidelity. */
export interface Made {
  started?: string | null
  finished?: string
  seconds?: number | null
  on?: MadeOn
  lyrics_fidelity?: string
}

export interface SongSummary {
  id: string
  title: string
  created: string
  /** Since 1.4.0 (older songs: the lyrics fidelity at most). */
  made?: Made
  year: string
  seconds: number
  model: string
  kind: string
  brief: Brief
  genre: string
  mood: string
  language: string
  vocals: string
  instrumental: boolean
  arrangement: string
  template: string
  style: string
  lyrics: string
  loudness: Loudness
  tags: Record<string, string>
  plenio: string
  folder: string
  file: string
  takes_key: string
  has: Record<'audio' | 'original' | 'cover' | 'pdf' | 'lines' | 'notes' | 'stems' | 'timing' | 'score', boolean> & {
    /** The record keeps what the take sings, as heard (songs exported since then). */
    sung?: boolean
    /** An MP3 besides the song's FLAC or WAV (Settings: play it, for less data). */
    mp3?: boolean
  }
  bpm?: number | null
  score_key?: string
  score_meter?: string
  seeds: Partial<Record<'take' | 'draft' | 'arrangement', number>>
  writer: string
  /** What the record shows of the sampling (older players' caches and other music: none). */
  sampling?: Partial<Record<SamplingStage, SamplingValues>>
  /** Music not made with Plenio (a folder with *also other music*): what its file has, no more. */
  other?: boolean
  artist?: string
  album?: string
}

/** A timed lyrics line: ``units`` are ``[start, cut]`` (the line shown up to ``cut`` from ``start``), with the
 * syllable's place in the score as a third number where the song has a score. */
export interface TimedLine {
  text: string
  start: number
  end: number
  units: number[][]
}

/** What a take sings, as heard when it was exported (``core.subtitles.SungLyrics``): its lines, laid out like
 * its lyrics, the text with their section tags, and how far it follows them. */
export interface SungLyrics {
  lines: TimedLine[]
  text: string
  /** The share of the lyrics' words that were heard. */
  written_heard?: number | null
  /** Heard words the lyrics do not have. */
  extra_words?: number | null
  /** Lyrics lines of which no word was heard. */
  not_sung: string[]
  sections: { tag: string; words: number; heard: number }[]
  /** Words the writer model found misheard, corrected in the lines (1.2.0's Check Sung Words, retired since:
   * songs exported with it keep them). */
  corrected?: { line: number; heard: string; word: string; sure?: number }[]
}

export interface Section {
  label: string
  start: number
  bar: number
}

export interface Notation {
  abc?: string
  tempo?: number
  sections?: Section[]
  seconds?: number
  warp?: [number, number] | null
  /** ``(audio, score)`` time pairs: the score's path through the recording, found in its music
   * (plenio/player/align.py ``follow``) - or, for an older song the music could not be followed in, estimated. */
  anchors?: [number, number][]
  /** No measured times: where the score is was worked out from the music alone. */
  estimated?: boolean
  /** The anchors are the music's path (the notation follows it through the instrumental parts too). */
  followed?: boolean
  error?: string
}

export interface SongDetail extends SongSummary {
  documents: Record<string, string>
  lyrics_raw: string
  notation: Notation
  lines: TimedLine[]
  /** What the take sings, as heard (empty for songs exported before it was kept). */
  sung?: SungLyrics | Record<string, never>
  timing_source: string
  /** Why the song has no measured lyrics times (empty when it has them). */
  timing_note?: string
  files: Record<string, string>
  record_path: string
  /** Other music: the audio file's path. */
  file_path?: string
  /** Every file the song has in its record's folder (relative to it): what removing it moves or deletes. */
  owned_files: string[]
  /** Where retiring moves the files. */
  retire_to: string
  licences: string[]
  versions: Record<string, string>
}

export interface Playlist {
  id: string
  name: string
  songs: string[]
  created: string
  hue?: number
  /** A visual for the whole playlist (``''``: the visual settings decide). */
  visual?: string
}

export interface PlayerState {
  playlists: Playlist[]
  favorites: string[]
  plays: Record<string, number>
  last_played: Record<string, string>
  /** The listener's own tags per song (song id -> tags, in the order given). */
  tags: Record<string, string[]>
  settings: Record<string, unknown>
  /** The stars the listener gave each song by ear, 0 to 5 in halves (owner's request 2026-10-29). */
  ratings?: Record<string, number>
}

/** One measure of how well a song came out (``plenio.core.quality``): what was found, its score 0..1 (``null``: not
 * measured), and its weight - in how good it sounds, or the stars it takes off at most for what went wrong. */
export interface QualityPart {
  key: string
  label: string
  value: string
  score: number | null
  weight: number
  note?: string
  kind?: 'quality' | 'fault'
}

/** The measured stars of every song known now (``null``: measured, without stars), and how far the player is with
 * measuring the songs not measured yet (``total`` 0: none waiting). */
export interface StarsAnswer {
  stars: Record<string, number | null>
  measuring: { done: number; total: number }
}

/** How well a song came out, measured: a hint where to listen first, never the verdict. */
export interface Quality {
  version: number
  stars: number | null
  score: number | null
  parts: QualityPart[]
}

export interface RemoveAnswer {
  action: 'retire' | 'delete'
  files: string[]
  folder: string | null
}

/** Who answers (``/api/info``): the player, where it keeps the state, which ComfyUI started it. */
export interface PlayerInfo {
  app: string
  version: string
  folders: string[]
  state: string
  retired: string
  comfyui: string
  pid: number
  /** This page came from the network (by the player's gateway): it does all but this computer's own things. */
  remote?: boolean
}

/** The player and ComfyUI from the network (``plenio/player/network.py``). */
export interface NetworkStatus {
  on: boolean
  port: number
  comfy_port: number
  /** The links with their code: they let a browser in (the first is this computer's main address). */
  url: string
  urls: string[]
  comfyui_url: string
  comfyui_urls: string[]
  /** For a page from the network: ComfyUI by the address it came by. */
  comfyui_here: string
  comfyui_running: boolean
  error: string
  remote: boolean
}

/** The state as the player sends it: with its change's number. */
export type StateAnswer = PlayerState & { rev?: number }

/** Saving the state: saved (and the change's number) - or another page saved since, and this is what is saved
 * now, to merge. */
export type SaveAnswer = { ok: true; rev?: number } | { ok: false; rev: number; state: StateAnswer }

export interface ComfyFound {
  url: string
  version: string
}

/** A folder the player reads, its songs and its other music. */
export interface FolderRow {
  path: string
  other: boolean
  exists: boolean
  songs: number
  other_songs: number
}

export interface FoldersAnswer {
  folders: FolderRow[]
  /** Chosen in Settings (else the folders it started with). */
  chosen: boolean
  started_with: string[]
}

export interface DirsAnswer {
  path: string | null
  parent: string | null
  dirs: { name: string; path: string }[]
  places: { name: string; path: string }[]
  error: string
}

export interface LibraryAnswer {
  songs: SongSummary[]
  folders: string[]
  errors: string[]
  version: string
  /** The folders are being read the first time: how far (the page asks again). */
  scanning?: { done: number; total: number }
}

/** The studio - ComfyUI - the player can start itself (``plenio/player/studio.py``); the paths for the admin only. */
export interface StudioStatus {
  running: boolean
  own: boolean
  starting: boolean
  since: number | null
  can_start: boolean
  why: string
  url: string
  auto: boolean
  idle_stop_min: number
  error: string
  root?: string
  chosen_root?: string
  installed_root?: string
  python?: string
  args?: string
  /** Where the arguments come from: Settings, the last start of this ComfyUI with Plenio, or none. */
  args_from?: 'settings' | 'last start' | ''
  args_used?: string
  last_start_at?: number | null
  port?: number
  command?: string
  log?: string[]
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return (await response.json()) as T
}

/** A JSON request that changes something; errors carry the server's words. */
async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error ?? `${url}: ${response.status}`)
  return data as T
}

export interface PackageOptions {
  songs: string[]
  title: string
  bitrate: number
  pdf: boolean
  settings?: Record<string, unknown>
  presets?: { name: string; text: string }[]
  playlists?: { name: string; songs: string[] }[]
  /** Your tags of the songs packed (song id -> tags). */
  tags?: Record<string, string[]>
  /** Parts of at most so many MB (250, 500, 1000) - for phones; 0: one file. */
  part_mb?: number
}

/** The guests' access to the live playlist (``plenio/player/guest.py``). */
export interface GuestStatus {
  on: boolean
  mode: 'view' | 'change'
  show: 'both' | 'qr' | 'address' | 'none'
  /** Guests may send reactions to the screen (🔥 ❤️ 🎉 ...). */
  reactions: boolean
  /** As many reactions per song as a guest likes, or one (a tap on another changes it). */
  reactions_per_song: 'any' | 'one'
  port: number
  url: string
  urls: string[]
  guests: number
  error: string
  /** Guests hear this party's songs again on their phones once they played (owner's request 2026-10-29); when the
   * party began, and how many songs there are to hear again. */
  replay?: boolean
  party_since?: number
  party_songs?: number
}

/** A guest's reaction to the song that plays (``kind``: fire, heart, party, clap, dance, laugh). */
export interface GuestReaction {
  n: number
  kind: string
  id: string
}

export interface GuestWish {
  n: number
  op: 'up' | 'down' | 'next' | 'remove' | 'add'
  id: string
  at?: number
  where?: 'next' | 'end'
}

export interface PackageStatus {
  job?: string
  state: 'waiting' | 'working' | 'done' | 'error' | 'stopped'
  /** ``reading`` the songs, then ``packing`` their sound. */
  stage?: string
  done: number
  total: number
  title?: string
  bitrate?: number
  file?: string
  /** Every file made: one, or the parts. */
  files?: { name: string; size: number }[]
  size?: number
  folder?: string
  error?: string
  part_mb?: number
}

// --- a guest's state, in this browser (account.ts) ----------------------------------------------------------

let inBrowser = false
const GUEST_STATE = 'plenio-guest-state'

/** A guest keeps the playlists, likes, plays and settings in this browser, not on the player's computer. */
export function keepStateInBrowser(on: boolean): void {
  inBrowser = on
}

function browserState(): PlayerState {
  try {
    const saved = localStorage.getItem(GUEST_STATE)
    if (saved) return JSON.parse(saved) as PlayerState
  } catch {
    // a private window, or storage switched off: start afresh
  }
  return { playlists: [], favorites: [], plays: {}, last_played: {}, tags: {}, settings: {}, ratings: {} }
}

function keepInBrowser(state: PlayerState): void {
  try {
    localStorage.setItem(GUEST_STATE, JSON.stringify(state))
  } catch {
    // full or switched off: it lasts until the page closes
  }
}

const serverApi = {
  library: () => json<LibraryAnswer>('/api/library'),
  song: (id: string) => json<SongDetail>(`/api/song/${id}`),
  /** How well a song came out, measured (the record's, else measured now - about half a second). */
  quality: (id: string) => json<{ quality: Quality | null }>(`/api/quality/${id}`),
  /** The measured stars of every song known now, for the library's filter. */
  stars: () => json<StarsAnswer>('/api/stars'),
  state: async (): Promise<StateAnswer> => (inBrowser ? { ...browserState(), rev: 0 } : json<StateAnswer>('/api/state')),
  /** The number of the last change saved (another page's too). */
  stateRev: async () => (inBrowser ? { rev: 0 } : json<{ rev: number }>('/api/state/rev')),
  /** Save the state, from the change ``rev`` (``undefined``: whatever is saved); ``keepalive``: also when the
   * page is closing (the last change is not lost). */
  saveState: async (state: PlayerState, keepalive = false, rev?: number): Promise<SaveAnswer> => {
    if (inBrowser) {
      keepInBrowser(state)
      return { ok: true, rev: 0 }
    }
    const response = await fetch('/api/state', {
      method: 'PUT',
      keepalive,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rev === undefined ? state : { ...state, rev }),
    })
    const data = await response.json().catch(() => null)
    if (response.status === 409 && data?.state) return { ok: false, rev: data.rev, state: data.state }
    if (!response.ok) throw new Error(data?.error ?? `/api/state: ${response.status}`)
    return { ok: true, rev: data?.rev }
  },
  network: () => json<NetworkStatus>('/api/network'),
  /** Switch the player's access from the network on or off, or make a new link. */
  setNetwork: (changes: { on?: boolean; regenerate?: boolean }) =>
    json<NetworkStatus>('/api/network', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) }),
  info: () => json<PlayerInfo>('/api/info'),
  find: (record: string) => json<{ id: string }>(`/api/find?record=${encodeURIComponent(record)}`),
  comfyui: (url = '') => json<{ found: ComfyFound | null }>(`/api/comfyui${url ? `?url=${encodeURIComponent(url)}` : ''}`),
  quit: () => json<{ ok: boolean }>('/api/quit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
  rescan: () => json<{ songs: number }>('/api/rescan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
  studio: () => json<StudioStatus>('/api/studio', { cache: 'no-store' }),
  studioStart: () => json<StudioStatus>('/api/studio/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
  studioStop: () => json<StudioStatus>('/api/studio/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
  studioSettings: async (changes: Record<string, unknown>) => {
    const response = await fetch('/api/studio', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `the studio's settings (${response.status})`)
    return data as StudioStatus
  },
  removeSong: (id: string, action: 'retire' | 'delete') =>
    json<RemoveAnswer>(`/api/song/${id}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, confirm: id }),
    }),
  peaks: (id: string) => json<{ peaks: number[] }>(`/api/peaks/${id}`),
  folders: () => json<FoldersAnswer>('/api/folders'),
  videoStart: (body: { song: string; take: string; start: number; length: number; fps: number; width: number; height: number; audio?: number }) =>
    post<{ job: string }>('/api/video', body),
  videoData: async (job: string, data: Uint8Array<ArrayBuffer>): Promise<void> => {
    const response = await fetch(`/api/video/${job}/data`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-Plenio-Player': '1' }, body: data })
    if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? `the video could not be sent (${response.status})`)
  },
  videoFinish: (job: string, frames: number) => post<{ file: string; size: number; folder: string }>(`/api/video/${job}/finish`, { frames }),
  videoCancel: (job: string) => post<{ ok: boolean }>(`/api/video/${job}/cancel`, {}),
  videos: () => json<{ folder: string; files: { name: string; size: number; mtime: number }[] }>('/api/videos'),
  /** The videos folder in the file manager (``file``: that video chosen). */
  openVideos: (file = '') => post<{ folder: string }>('/api/videos/open', file ? { file } : {}),
  /** The songs that appeared since ``since`` (the last answer's ``now``; ``null``: only the ``now``). */
  newSongs: (since: number | null) => json<{ now: number; songs: SongSummary[] }>(`/api/new${since !== null ? `?since=${since}` : ''}`),
  /** Save the folders (or ``null``: back to the ones it started with); errors carry the server's words. */
  setFolders: async (folders: { path: string; other: boolean }[] | null): Promise<FoldersAnswer> => {
    const response = await fetch('/api/folders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(folders ? { folders } : { reset: true }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error ?? `could not save the folders (${response.status})`)
    return data as FoldersAnswer
  },
  dirs: (path: string | null) => json<DirsAnswer>(`/api/dirs${path ? `?path=${encodeURIComponent(path)}` : ''}`, { headers: { 'X-Plenio-Player': '1' } }),
  /** A shared player of chosen songs (one HTML file), made by the server; its progress, the ones made. */
  packageStart: (options: PackageOptions) => post<{ job: string }>('/api/package', options),
  packageStatus: (job: string) => json<PackageStatus>(`/api/package/${job}`),
  /** The shared players being made, waiting and made since the player started (newest first). */
  packageJobs: () => json<{ jobs: PackageStatus[] }>('/api/package-jobs'),
  packageCancel: (job: string) => post<{ ok: boolean }>(`/api/package/${job}/cancel`, {}),
  packageClear: () => post<{ jobs: PackageStatus[] }>('/api/package-jobs/clear', {}),
  packages: () => json<{ folder: string; files: { name: string; size: number; mtime: number }[] }>('/api/packages'),
  openPackages: (file = '') => post<{ folder: string }>('/api/packages/open', file ? { file } : {}),
  guests: () => json<GuestStatus>('/api/guests'),
  /** Switch the guests' access on or off, choose what they may do and what the screen shows, or make a new
   * address (``regenerate``). */
  setGuests: (changes: Partial<Pick<GuestStatus, 'on' | 'mode' | 'show' | 'reactions' | 'reactions_per_song' | 'replay'>> & { regenerate?: boolean; new_party?: boolean }) =>
    json<GuestStatus>('/api/guests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) }),
  /** What the page shows of the live playlist, for the guests. */
  showGuests: (shown: unknown) => post<{ ok: boolean }>('/api/guests/live', shown),
  /** The guests' wishes after ``after``, and their reactions after ``reacted`` (left out: only the counts). */
  guestWishes: (after: number, reacted?: number) =>
    json<{ wishes: GuestWish[]; last: number; reactions?: GuestReaction[]; last_reaction?: number; cheers?: Record<string, Record<string, number>> }>(
      `/api/guests/wishes?after=${after}${reacted === undefined ? '' : `&reacted=${reacted}`}`
    ),
  /** The guests' reactions per song, as the player keeps them (apart from the favourites). */
  reactions: () => json<{ songs: Record<string, Record<string, number>> }>('/api/reactions'),
}

/** In a shared player: the songs inside the page, the listener's state in their browser; the rest is the
 * Plenio Player's only. */
function sharedApi(): typeof serverApi {
  const data = portable as NonNullable<typeof portable>
  const none = async () => notInShared()
  return {
    ...serverApi,
    library: async () => ({ songs: data.songs, folders: [], errors: [], version: data.plenio }),
    stars: async () => ({ stars: {}, measuring: { done: 0, total: 0 } }),
    song: async (id: string) => {
      const page = await portablePage(id)
      if (!page) throw new Error('no such song')
      return page.detail
    },
    state: async () => portableState(),
    stateRev: async () => ({ rev: 0 }),
    saveState: async (state: PlayerState) => {
      savePortableState(state)
      return { ok: true as const }
    },
    network: none,
    setNetwork: none,
    info: async () => ({ app: 'plenio-shared', version: data.plenio, folders: [], state: 'this browser', retired: '', comfyui: '', pid: 0 }),
    find: none,
    comfyui: async () => ({ found: null }),
    quit: none,
    rescan: async () => ({ songs: data.songs.length }),
    studio: none,
    studioStart: none,
    studioStop: none,
    studioSettings: none,
    removeSong: none,
    peaks: async (id: string) => {
      const levels = (await portablePage(id))?.peaks
      if (!levels) throw new Error('no waveform')
      return { peaks: levels }
    },
    folders: none,
    setFolders: none,
    dirs: none,
    newSongs: async () => ({ now: 0, songs: [] }),
    videoStart: none,
    videoData: none,
    videoFinish: none,
    videoCancel: none,
    videos: async () => ({ folder: '', files: [] }),
    openVideos: none,
    packageStart: none,
    packageStatus: none,
    packageJobs: async () => ({ jobs: [] }),
    packageCancel: none,
    packageClear: none,
    packages: async () => ({ folder: '', files: [] }),
    openPackages: none,
    guests: none,
    setGuests: none,
    showGuests: none,
    guestWishes: none,
    reactions: async () => ({ songs: {} }),
  }
}

export const api: typeof serverApi = isPortable ? sharedApi() : serverApi

/** A song's file by kind (``audio``, ``cover``, ``pdf`` ...): its URL (in a shared player ``''`` until it is
 * made from the page, then the page shows it by itself). */
export const media = (id: string, kind: string): string => (isPortable ? portableMedia(id, kind) : `/media/${id}/${kind}`)
/** A song's page on its own (``plenio.player.song_page``): the lyrics, prompts and settings to read and copy. */
export const songPage = (id: string): string => `/page/${id}`

/** The sizes of the covers' small pictures the player makes (``plenio.player.server.THUMB_SIZES``). */
export const COVER_SIZES = [128, 256, 512, 768]

/** A song's cover for a place ``shown`` CSS pixels wide: the smallest small picture that is sharp there on this
 * screen (a card of a phone gets 512 px, of a desktop 256 - not the whole cover of 1024), the cover itself beyond. */
export function coverUrl(id: string, shown?: number): string {
  const url = media(id, 'cover')
  if (isPortable || !shown) return url
  const ratio = typeof window === 'undefined' ? 1 : Math.min(3, window.devicePixelRatio || 1)
  const size = COVER_SIZES.find((s) => s >= shown * ratio)
  return size ? `${url}?size=${size}` : url
}

/** The file's URL once it can be used (a shared player makes it from the page first). */
export const mediaReady = (id: string, kind: string): Promise<string> => (isPortable ? ensureMedia(id, kind) : Promise.resolve(`/media/${id}/${kind}`))
