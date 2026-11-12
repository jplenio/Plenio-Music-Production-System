/**
 * The shared player (owner's request 2026-10-16): the player with songs in one HTML file that plays by itself
 * (plenio/player/package.py). When the page finds the songs inside itself, it is that player: it reads them
 * there instead of asking the player's server, and keeps the listener's playlists and settings in their
 * browser.
 *
 * A file of any size opens, also 2 GB on a phone (owner's request 2026-10-18; ``plenio.portable/2``): the
 * browser reads the file from the top - the songs' list, a small loader, then this player, which starts at once
 * - and then each song's page, the covers and the sound in small pieces. The loader (``window.__plenio``) turns
 * every piece into a file of the browser's own (a blob) as it arrives and takes the piece out of the page, so
 * the page never holds the text. A song plays as soon as its sound is there; ``loading`` says how far it is.
 * Files of the first format (``/1``) keep their songs as base64 blocks, turned into files when needed.
 */
import { reactive } from 'vue'

import type { PlayerState, SongDetail, SongSummary } from './api'

export interface PortableData {
  format: string
  id: string
  title: string
  created: string
  plenio: string
  bitrate: number
  songs: SongSummary[]
  details: Record<string, SongDetail>
  peaks: Record<string, number[]>
  settings: Record<string, unknown>
  presets: { name: string; text: string; mtime: number }[]
  playlists: { name: string; songs: string[] }[]
  /** The tags of the songs, as the one who shared them gave them. */
  tags?: Record<string, string[]>
  /** How many files of each kind follow (``/2``). */
  files?: { audio: number; cover: number; pdf: number }
  /** One of several parts (a large share, for phones): which, of how many, and every part's file name. */
  part?: { index: number; count: number; files: string[] } | null
}

/** The loader the file brings (``plenio.portable/2``). */
interface Loader {
  urls: Record<string, string>
  details: Record<string, string>
  got: number
  total: number
  done: boolean
  onurl: ((key: string, url: string) => void) | null
  get(key: string): Promise<string>
}

const FORMATS = ['plenio.portable/1', 'plenio.portable/2']

function read(): PortableData | null {
  if (typeof document === 'undefined') return null
  const el = document.getElementById('plenio-portable')
  if (!el?.textContent) return null
  try {
    const data = JSON.parse(el.textContent) as PortableData
    return FORMATS.includes(data?.format) ? data : null
  } catch {
    return null
  }
}

export const portable: PortableData | null = read()
/** This page is a shared player (no server, no ComfyUI). */
export const isPortable = portable !== null
const loader: Loader | null = portable?.format === 'plenio.portable/2' ? ((window as unknown as { __plenio?: Loader }).__plenio ?? null) : null

/** How far the songs' files have arrived (a large file is read for a while; the songs play as they come). */
export const loading = reactive({ got: loader?.got ?? 0, total: loader?.total ?? 0, done: loader ? loader.done : true })

// --- the songs' files ---------------------------------------------------------------------------------------

const urls = reactive(new Map<string, string>())
const pending = new Map<string, Promise<string>>()
const KINDS: Record<string, string> = { audio: 'audio', audio_mp3: 'audio', cover: 'cover', pdf: 'pdf' }
const SHORT: Record<string, string> = { audio: 'a', cover: 'c', pdf: 'p' }

if (loader) {
  // the files that came before this script ran, and every one from now on
  for (const [key, url] of Object.entries(loader.urls)) urls.set(key, url)
  loader.onurl = (key, url) => {
    if (key) urls.set(key, url)
    loading.got = loader.got
    loading.done = loader.done
  }
}

/** The loader's key of a song's file (``a/<id>``), or the first format's (``audio/<id>``). */
function keyOf(id: string, block: string): string {
  return loader ? `${SHORT[block]}/${id}` : `${block}/${id}`
}

/** A song's file as a URL in the shared player - ``''`` until it is there (then the page shows it). */
export function portableMedia(id: string, kind: string): string {
  const block = KINDS[kind]
  if (!block) return ''
  const known = urls.get(keyOf(id, block))
  if (known) return known
  void ensureMedia(id, kind)
  return ''
}

/** Whether a song's sound has arrived (a large file is still being read). */
export function mediaArrived(id: string, kind = 'audio'): boolean {
  const block = KINDS[kind]
  return !block || !loader || urls.has(keyOf(id, block)) || loader.done
}

/** The song's file as a URL: from the loader when it has arrived, or made from its block (first format). */
export function ensureMedia(id: string, kind: string): Promise<string> {
  const block = KINDS[kind]
  if (!block) return Promise.resolve('')
  const key = keyOf(id, block)
  const known = urls.get(key)
  if (known) return Promise.resolve(known)
  const waiting = pending.get(key)
  if (waiting) return waiting
  let made: Promise<string>
  if (loader) {
    made = loader.get(key).then((url) => {
      if (url) urls.set(key, url)
      return url
    })
  } else {
    const el = document.querySelector<HTMLElement>(`script[data-plenio="${block}"][data-id="${CSS.escape(id)}"]`)
    if (!el?.textContent) return Promise.resolve('')
    made = fetch(`data:${el.dataset.mime ?? 'application/octet-stream'};base64,${el.textContent.trim()}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        urls.set(key, url)
        return url
      })
  }
  pending.set(key, made)
  return made
}

/** A song's page and waveform: inside the data (first format), or from the loader as they arrive. */
const pages = new Map<string, { detail: SongDetail; peaks: number[] | null; analysis?: unknown }>()
export async function portablePage(id: string): Promise<{ detail: SongDetail; peaks: number[] | null; analysis?: unknown } | null> {
  if (!portable) return null
  if (!loader) return portable.details[id] ? { detail: portable.details[id], peaks: portable.peaks[id] ?? null } : null
  const known = pages.get(id)
  if (known) return known
  const text = await loader.get(`d/${id}`)
  if (!text) return null
  const page = JSON.parse(text) as { detail: SongDetail; peaks: number[] | null; analysis?: unknown }
  pages.set(id, page)
  return page
}

// --- what the listener keeps (in this browser) -----------------------------------------------------------

const storageKey = (): string => `plenio-portable:${portable?.id ?? 'none'}`

/** The listener's playlists and settings for this shared player - at first its songs' playlists and the
 * look it was shared with. */
export function portableState(): PlayerState {
  try {
    const saved = localStorage.getItem(storageKey())
    if (saved) return JSON.parse(saved) as PlayerState
  } catch {
    // a private window, or storage switched off: start afresh every time
  }
  const now = new Date().toISOString()
  return {
    playlists: (portable?.playlists ?? []).map((p, k) => ({ id: `shared${k}`, name: p.name, songs: p.songs, created: now })),
    favorites: [],
    plays: {},
    last_played: {},
    tags: { ...(portable?.tags ?? {}) },
    settings: { ...(portable?.settings ?? {}) },
  }
}

export function savePortableState(state: PlayerState): void {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(state))
  } catch {
    // full or switched off: the settings last until the page closes
  }
}

export function notInShared(): never {
  throw new Error('Not in a shared player - only in the Plenio Player')
}
