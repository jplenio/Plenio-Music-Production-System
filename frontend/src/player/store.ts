/**
 * The player's state: the library, the listener's state (playlists, favourites, plays, settings - saved on
 * the server), the route (``#/``, ``#/song/<id>``, ``#/playlist/<id>`` ...), the queue and what plays.
 */
import { computed, nextTick, reactive, ref, shallowRef, watch } from 'vue'

import { api, coverUrl, media, mediaReady, type Playlist, type PlayerInfo, type PlayerState, type RemoveAnswer, type SongDetail, type SongSummary, type StateAnswer } from './api'
import { isPortable, loading as portableLoading, mediaArrived } from './portable'
import { mergeState } from './stateMerge'
import { engine } from './engine'
import { type LiveSettings, liveWithDefaults } from './liveSettings'
import { type LyricsStyle, lyricsWithDefaults } from './lyricsStyle'
import { choiceOf, choicesOf, type LyricsChoice, type LyricsVersion } from './lyricsVersion'
import { type VisualSettings, withDefaults } from './visuals/chooser'
import { type MakePreset, presetsOf } from './make/presets'
import { type Remembered, rememberedOf } from './make/remember'
import { ownTags } from '../shared/lyricsTags'
import { withTransition } from './layout'
import type { Before } from './people'

export interface Settings {
  volume: number
  crossfade: number
  rate: number
  sort: string
  view: 'grid' | 'list'
  repeat: 'off' | 'all' | 'one'
  shuffle: boolean
  visuals: VisualSettings
  resume: { queue: string[]; index: number; time: number } | null
  sidebar: boolean
  /** The view Now playing opens in. */
  npView: 'stage' | 'lyrics' | 'notation' | 'visual'
  /** The tab a song's page opens on. */
  songTab: string
  /** Where *Open in ComfyUI* goes (``''``: the ComfyUI that started the player, else the one found). */
  comfyui: string
  /** The library's search and filter chips, per view (``all``, ``favorites``, ``top``, ``recent``). */
  filters: Record<string, LibraryFilter>
  /** Live Play: on, where new songs go, whether they join by themselves, what happens at the end. */
  live: LiveSettings
  /** The last settings of *Save as a video* (size, visual, lyrics ...). */
  video: Record<string, unknown>
  /** How the lyrics look: font, size, colour, effect. */
  lyrics: LyricsStyle
  /** Which lyrics to follow for every song: as written, or as the take sings them - only where chosen so
   * (lyricsVersion.ts). */
  lyricsChoice: LyricsChoice
  /** The listener's choice for single songs where it differs from ``lyricsChoice`` (song id -> version). */
  lyricsFor: Record<string, LyricsVersion>
  /** A song's page shows its lyrics timed (as written or as sung) or as the full text to copy. */
  lyricsView: 'timed' | 'text'
  /** Play a song's MP3 where it has one: less data over the network. */
  mp3: boolean
  /** Seconds the listener moved a song's notation cursor (song id -> seconds of score). */
  notationShift: Record<string, number>
  /** Searches and filters kept under a name (the sidebar's *Saved filters*). */
  savedFilters: SavedFilter[]
  /** The filter rows past the first few are open. */
  moreFilters: boolean
  /** The welcome card of the songs' page was closed (it shows on a player's first days). */
  welcomed: boolean
  /** The songs as cards or as rows on a phone (a phone has its own: rows show more songs at once). */
  phoneView: 'grid' | 'list'
  /** Presets of one's own for making a song (make/presets.ts). */
  makePresets: MakePreset[]
  /** What the song form opens with: the last song's values and configuration (make/remember.ts). */
  makeLast: Remembered | null
  /** Section tags of one's own for one's own lyrics. */
  makeTags: string[]
  /** Picture and sound together: milliseconds the picture waits more (+) or less (-) than the reported latency. */
  syncOffset: number
  /** A party started on People & access: its name, when, and the settings it changed as they were before (End the
   * party puts them back). */
  party: PartyNow | null
}

export interface PartyNow {
  name: string
  since: number
  before: Before
}

export interface LibraryFilter {
  query: string
  chips: string[]
}

export interface SavedFilter extends LibraryFilter {
  id: string
  name: string
}

const DEFAULT_SETTINGS: Settings = {
  volume: 0.85,
  crossfade: 3,
  rate: 1,
  sort: 'newest',
  view: 'grid',
  repeat: 'all',
  shuffle: false,
  visuals: withDefaults(null),
  resume: null,
  sidebar: true,
  npView: 'stage',
  songTab: 'lyrics',
  comfyui: '',
  filters: {},
  live: liveWithDefaults(null),
  video: {},
  lyrics: lyricsWithDefaults(null),
  lyricsChoice: 'written',
  lyricsFor: {},
  lyricsView: 'timed',
  mp3: false,
  notationShift: {},
  savedFilters: [],
  moreFilters: false,
  welcomed: false,
  phoneView: 'list',
  makePresets: [],
  makeLast: null,
  makeTags: [],
  party: null,
  syncOffset: 0,
}

/** Saved notation shifts, checked: numbers of at most a minute. */
function shiftsOf(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 60 && value !== 0) out[id] = value
  }
  return out
}

/** Saved searches, checked. */
function savedFiltersOf(raw: unknown): SavedFilter[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((f): f is SavedFilter => !!f && typeof f === 'object' && typeof f.id === 'string' && typeof f.name === 'string')
    .map((f) => ({ id: f.id, name: f.name.slice(0, 80), query: typeof f.query === 'string' ? f.query : '', chips: Array.isArray(f.chips) ? f.chips.filter((c): c is string => typeof c === 'string') : [] }))
}

/** Saved tags, checked: per song a list of short texts, each once. */
export function tagsOf(raw: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, list] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue
    const kept: string[] = []
    for (const value of list) {
      const tag = typeof value === 'string' ? cleanTag(value) : ''
      if (tag && !kept.some((k) => k.toLowerCase() === tag.toLowerCase())) kept.push(tag)
    }
    if (kept.length) out[id] = kept
  }
  return out
}

/** A tag as kept: no quotes, # or commas, spaces closed up, at most 40 characters. */
export function cleanTag(text: string): string {
  return text.replace(/["#,;]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40).trim()
}

/** Saved filters, checked (a file edited by hand or an older version may hold anything). */
function filtersOf(raw: unknown): Record<string, LibraryFilter> {
  const out: Record<string, LibraryFilter> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [view, value] of Object.entries(raw as Record<string, unknown>)) {
    const f = value as Partial<LibraryFilter> | null
    out[view] = {
      query: typeof f?.query === 'string' ? f.query : '',
      chips: Array.isArray(f?.chips) ? f.chips.filter((c): c is string => typeof c === 'string') : [],
    }
  }
  return out
}

export const library = shallowRef<SongSummary[]>([])
const details = new Map<string, SongDetail>()
export const folders = ref<string[]>([])
export const loading = ref(true)
export const loadError = ref('')
/** The player reads its folders the first time: how far (the splash shows it). */
export const scanning = ref<{ done: number; total: number } | null>(null)

export const state = reactive<PlayerState>({ playlists: [], favorites: [], plays: {}, last_played: {}, tags: {}, settings: {}, ratings: {} })
export const settings = reactive<Settings>({ ...DEFAULT_SETTINGS })

export const byId = computed(() => new Map(library.value.map((s) => [s.id, s])))

// --- the route ----------------------------------------------------------------------------------------

export const route = ref(location.hash.slice(1) || '/')
window.addEventListener('hashchange', () => {
  route.value = location.hash.slice(1) || '/'
})
/** Open a page; ``replace``: in place of the one shown (the browser's Back skips it). */
export function go(path: string, replace = false): void {
  if (location.hash.slice(1) === path) return
  if (replace) {
    history.replaceState(null, '', `#${path}`)
    route.value = path
  } else location.hash = path
}

/** Open a song's page; from a card its cover (``cover``) glides to the page's - a view transition, where the
 * browser has them. The route changes at once inside it, so the new page is there for the transition. */
export function openSong(id: string, cover?: Element | null): void {
  const path = `/song/${id}`
  if (route.value === path) return
  // from a song's page (its takes, songs alike) its own cover has the name already: the page only fades
  const el = cover instanceof HTMLElement && !route.value.startsWith('/song/') ? cover : null
  if (el) el.style.viewTransitionName = 'song-cover'
  withTransition(async () => {
    if (el) el.style.viewTransitionName = ''
    go(path)
    route.value = path
    await nextTick()
  })
}

// --- loading and saving -------------------------------------------------------------------------------

// Everything the page remembers is saved on the player's server (its state file), half a second after a
// change and once more when the page closes - nothing lives only in this browser.
export const info = shallowRef<PlayerInfo | null>(null)
export const lastSaved = ref<Date | null>(null)
export const saveError = ref('')
let saving: number | undefined
let pending = false
/** The state as the player last had it (saved or read here) and its change's number: the base of a merge
 * when another page - another tab, a phone from the network - saved in between (owner's request 2026-10-18). */
let base: PlayerState | null = null
let baseRev: number | undefined
/** Taking the player's state in: the page's watcher does not save it back. */
let adopting = false
function snapshot(): PlayerState {
  state.settings = JSON.parse(JSON.stringify(settings))
  return JSON.parse(JSON.stringify(state)) as PlayerState
}
/** Save now; ``force``: whatever another page saved since (a backup put back, a fresh start). */
async function saveNow(keepalive = false, force = false, tries = 3): Promise<void> {
  clearTimeout(saving)
  pending = false
  const mine = snapshot()
  try {
    const answer = await api.saveState(mine, keepalive, force ? undefined : baseRev)
    if (answer.ok) {
      base = mine
      baseRev = answer.rev
      lastSaved.value = new Date()
      saveError.value = ''
      return
    }
    // another page saved since this one read: both changes merged, and saved again
    await adopt(answer.state, mine)
    if (tries > 1) await saveNow(keepalive, false, tries - 1)
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : String(error)
  }
}
function save(): void {
  if (adopting) return
  clearTimeout(saving)
  pending = true
  saving = window.setTimeout(() => void saveNow(), 600)
}

/** The player's state taken in, merged with what this page changed since ``base``; ``true`` when this page
 * has something of its own left to save. */
async function adopt(theirs: StateAnswer, mine = snapshot()): Promise<boolean> {
  const { rev, ...saved } = theirs
  const merged = base ? mergeState(base, mine, saved) : saved
  base = JSON.parse(JSON.stringify(saved)) as PlayerState
  baseRev = rev
  adopting = true
  state.playlists = merged.playlists ?? []
  state.favorites = merged.favorites ?? []
  state.plays = merged.plays ?? {}
  state.last_played = merged.last_played ?? {}
  state.tags = tagsOf(merged.tags)
  state.ratings = ratingsOf(merged.ratings)
  applySettings((merged.settings ?? {}) as Partial<Settings>)
  if (!muted.value) engine.setVolume(settings.volume)
  engine.setRate(settings.rate)
  await nextTick()
  adopting = false
  return JSON.stringify(merged) !== JSON.stringify(saved)
}

/** The page is gone (a test's page torn down while a timer of this module still runs): its timers stop. */
const pageGone = (): boolean => typeof document === 'undefined'

// another page's changes come in every few seconds (when this one has none waiting to be saved)
if (!isPortable) {
  const lookForChanges = window.setInterval(async () => {
    if (pageGone()) return clearInterval(lookForChanges) // no window any more either
    if (pending || baseRev === undefined || document.visibilityState !== 'visible') return
    try {
      const { rev } = await api.stateRev()
      if (rev === baseRev || pending) return
      const theirs = await api.state()
      if (pending) return
      if (await adopt(theirs)) save()
    } catch {
      // the player restarts: next time
    }
  }, 4000)
}
window.addEventListener('pagehide', () => {
  if (pending) void saveNow(true)
})

/** The settings as saved, checked and filled with the defaults. */
function offsetOf(raw: unknown): number {
  const n = Number(raw)
  return Number.isFinite(n) ? Math.max(-300, Math.min(300, Math.round(n))) : 0
}

function partyOf(raw: unknown): PartyNow | null {
  const party = raw as Partial<PartyNow> | null | undefined
  return party && typeof party === 'object' && party.before && typeof party.before === 'object' ? { name: String(party.name ?? ''), since: Number(party.since) || 0, before: party.before } : null
}

function applySettings(stored: Partial<Settings>): void {
  Object.assign(settings, { ...DEFAULT_SETTINGS, ...stored, visuals: withDefaults(stored.visuals), filters: filtersOf(stored.filters), live: liveWithDefaults(stored.live), lyrics: lyricsWithDefaults(stored.lyrics), lyricsChoice: choiceOf(stored.lyricsChoice), lyricsFor: choicesOf(stored.lyricsFor), lyricsView: stored.lyricsView === 'text' ? 'text' : 'timed', mp3: !!stored.mp3, notationShift: shiftsOf(stored.notationShift), savedFilters: savedFiltersOf(stored.savedFilters), moreFilters: !!stored.moreFilters, welcomed: !!stored.welcomed, phoneView: stored.phoneView === 'grid' ? 'grid' : 'list', makePresets: presetsOf(stored.makePresets), makeLast: rememberedOf(stored.makeLast), makeTags: ownTags(stored.makeTags), party: partyOf(stored.party), syncOffset: offsetOf(stored.syncOffset) })
}

/** The measured stars of the songs (song id -> stars; ``null``: measured, without stars) - for the library's filter
 * (owner's request 2026-10-30). The player measures the songs exported before 1.4.0 in the background: asked again
 * every half minute while it does. */
export const measuredStars = shallowRef<Record<string, number | null>>({})
let starsTimer = 0
export async function loadStars(): Promise<void> {
  window.clearTimeout(starsTimer)
  try {
    const answer = await api.stars()
    measuredStars.value = answer.stars
    if (answer.measuring.total > 0) starsTimer = window.setTimeout(() => void loadStars(), 30000)
  } catch {
    // an older player without them: no measured stars to filter by
  }
}

/** Replace everything the player keeps (a backup read back, or ``null``: start afresh). */
export async function replaceState(data: Partial<PlayerState> | null): Promise<void> {
  const fresh = data ?? {}
  state.playlists = Array.isArray(fresh.playlists) ? fresh.playlists : []
  state.favorites = Array.isArray(fresh.favorites) ? fresh.favorites : []
  state.plays = fresh.plays && typeof fresh.plays === 'object' ? fresh.plays : {}
  state.last_played = fresh.last_played && typeof fresh.last_played === 'object' ? fresh.last_played : {}
  state.tags = tagsOf(fresh.tags)
  state.ratings = ratingsOf(fresh.ratings)
  applySettings((fresh.settings ?? {}) as Partial<Settings>)
  engine.setVolume(settings.volume)
  engine.setRate(settings.rate)
  await saveNow(false, true)
}

export async function load(): Promise<void> {
  loading.value = true
  try {
    const [first, saved, about] = await Promise.all([api.library(), api.state(), api.info().catch(() => null)])
    let answer = first
    while (answer.scanning) {
      scanning.value = answer.scanning
      await new Promise((resolve) => window.setTimeout(resolve, 900))
      answer = await api.library()
    }
    scanning.value = null
    library.value = answer.songs
    folders.value = answer.folders
    info.value = about
    const { rev, ...kept } = saved
    Object.assign(state, kept)
    state.tags = tagsOf(kept.tags)
    state.ratings = ratingsOf(kept.ratings)
    applySettings((kept.settings ?? {}) as Partial<Settings>)
    base = JSON.parse(JSON.stringify(kept)) as PlayerState
    baseRev = rev
    engine.setVolume(settings.volume)
    engine.setRate(settings.rate)
    loadError.value = ''
    restore()
    void loadStars()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
  watch([settings, () => state.playlists, () => state.favorites, () => state.tags, () => state.ratings], save, { deep: true })
  lastSaved.value = null
}

// --- the way back to ComfyUI ------------------------------------------------------------------------

/** This page came from the network (owner's request 2026-10-18): it does all but this computer's own things. */
export const remote = computed(() => !!info.value?.remote)

/** The ComfyUI that *Open in ComfyUI* goes to: the address in the settings, else the one that started the
 * player, else one the player's server finds on this computer (``null``: none runs). A page from the network
 * reaches it by the player's gateway to it. */
export async function comfyuiAddress(): Promise<string | null> {
  if (remote.value) {
    const network = await api.network().catch(() => null)
    return network?.comfyui_running && network.comfyui_here ? network.comfyui_here : null
  }
  const wanted = settings.comfyui.trim() || info.value?.comfyui || ''
  const answer = await api.comfyui(wanted)
  return answer.found?.url ?? (settings.comfyui.trim() || null)
}

/** ComfyUI to open in the browser, when it runs (``''``: not now) - asked now and then. */
export const comfyLink = ref('')
export async function lookForComfyUI(): Promise<void> {
  if (isPortable) return
  try {
    comfyLink.value = (await comfyuiAddress()) ?? ''
  } catch {
    comfyLink.value = ''
  }
}

/** Open a song's workflow in ComfyUI to work on it: ComfyUI opens in a tab (inside the click, so no pop-up
 * blocker stops it), the Plenio extension there says when it is ready, and gets the song's record - the
 * same that continuing a song from its FLAC or record restores. */
export async function openInComfyUI(song: SongSummary): Promise<void> {
  const tab = window.open('about:blank', 'plenio-comfyui')
  try {
    const [target, record] = await Promise.all([comfyuiAddress(), fetch(media(song.id, 'record')).then((r) => r.json())])
    if (!target) throw new Error('ComfyUI is not running on this computer - start it, or set its address in Settings.')
    if (!tab) throw new Error('The browser did not open a tab for ComfyUI (a pop-up blocker?).')
    const origin = new URL(target).origin
    tab.location.href = `${target.replace(/\/?$/, '/')}?plenio=continue`
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        window.removeEventListener('message', onMessage)
        reject(new Error('ComfyUI did not answer - is Plenio installed there, in version 1.0.0 or newer?'))
      }, 90_000)
      function onMessage(event: MessageEvent): void {
        if (event.source !== tab || event.origin !== origin || (event.data as { type?: string } | null)?.type !== 'plenio-ready') return
        window.clearTimeout(timer)
        window.removeEventListener('message', onMessage)
        tab?.postMessage({ type: 'plenio-continue', record, name: song.title }, origin)
        resolve()
      }
      window.addEventListener('message', onMessage)
    })
  } catch (error) {
    if (tab && !tab.closed) {
      try {
        if (tab.location.href === 'about:blank') tab.close()
      } catch {
        /* ComfyUI's page: leave it */
      }
    }
    throw error
  }
}

export async function rescan(): Promise<void> {
  await api.rescan()
  await reloadLibrary()
}

/** The library as the server has it now (after the folders changed). */
export async function reloadLibrary(): Promise<void> {
  const answer = await api.library()
  library.value = answer.songs
  folders.value = answer.folders
  void loadStars()
}

// --- removing a song (owner's request 2026-10-16: a song you do not want any more) -----------------------

/** The song whose removal is being asked (the dialog in App.vue). */
export const removing = shallowRef<SongSummary | null>(null)

/** Retire the song (its files to the retired songs' folder) or delete it for good; it leaves the queue, the
 * playlists and the favourites. A song that plays makes way for the next one first. */
export async function removeSong(id: string, action: 'retire' | 'delete'): Promise<RemoveAnswer> {
  if (current.value?.id === id) {
    if (queue.value.length > 1) await next()
    else engine.pause()
  }
  engine.release(id)
  const answer = await api.removeSong(id, action)
  const nowId = queue.value[index.value]
  queue.value = queue.value.filter((x) => x !== id)
  index.value = nowId && nowId !== id ? queue.value.indexOf(nowId) : -1
  state.favorites = state.favorites.filter((x) => x !== id)
  for (const playlist of state.playlists) playlist.songs = playlist.songs.filter((x) => x !== id)
  delete state.plays[id]
  delete state.last_played[id]
  delete state.tags[id]
  delete settings.visuals.songs[id]
  details.delete(id)
  const fresh = await api.library()
  library.value = fresh.songs
  return answer
}

// --- tags (owner's request 2026-10-18: tags of your own per song, chosen again from a list) -----------------

/** Every tag given, with how many songs have it - the most used first. */
export const allTags = computed<[string, number][]>(() => {
  const counts = new Map<string, [string, number]>()
  for (const list of Object.values(state.tags)) {
    for (const tag of list) {
      const key = tag.toLowerCase()
      const known = counts.get(key)
      counts.set(key, known ? [known[0], known[1] + 1] : [tag, 1])
    }
  }
  return [...counts.values()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

/** A tag as given before when there is one of the same letters (``party`` -> ``Party``), else as typed. */
function spelled(tag: string): string {
  const clean = cleanTag(tag)
  return allTags.value.find(([known]) => known.toLowerCase() === clean.toLowerCase())?.[0] ?? clean
}

export const songTags = (id: string): string[] => state.tags[id] ?? []

/** Give ``ids`` the tag (each song once); the tag as spelled. */
export function addTag(ids: string[], text: string): string {
  const tag = spelled(text)
  if (!tag) return ''
  for (const id of ids) {
    const list = state.tags[id] ?? []
    if (!list.some((t) => t.toLowerCase() === tag.toLowerCase())) state.tags[id] = [...list, tag]
  }
  return tag
}

export function removeTag(ids: string[], tag: string): void {
  for (const id of ids) {
    const list = (state.tags[id] ?? []).filter((t) => t.toLowerCase() !== tag.toLowerCase())
    if (list.length) state.tags[id] = list
    else delete state.tags[id]
  }
}

/** The chips of the songs' page and the saved filters, each changed by ``change`` (``null``: taken out). */
function changeChips(change: (chip: string) => string | null): void {
  for (const filter of [...Object.values(settings.filters), ...settings.savedFilters]) {
    const next = filter.chips.map(change).filter((c): c is string => c !== null)
    filter.chips.splice(0, filter.chips.length, ...next.filter((c, k) => next.indexOf(c) === k))
  }
}

/** Rename a tag on every song (into another tag: the two become one); the filters that name it follow. */
export function renameTag(from: string, to: string): void {
  const target = cleanTag(to)
  if (!target || target === from) return
  const old = from.toLowerCase()
  const merged = allTags.value.find(([known]) => known.toLowerCase() === target.toLowerCase() && known.toLowerCase() !== old)?.[0] ?? target
  for (const [id, list] of Object.entries(state.tags)) {
    if (!list.some((t) => t.toLowerCase() === old)) continue
    const next: string[] = []
    for (const t of list) {
      const name = t.toLowerCase() === old ? merged : t
      if (!next.some((n) => n.toLowerCase() === name.toLowerCase())) next.push(name)
    }
    state.tags[id] = next
  }
  changeChips((c) => (c.toLowerCase() === `tag:"${old}"` ? `tag:"${merged}"` : c.toLowerCase() === `-tag:"${old}"` ? `-tag:"${merged}"` : c))
}

/** Take a tag off every song (and out of the filters). */
export function deleteTag(tag: string): void {
  removeTag(Object.keys(state.tags), tag)
  const old = tag.toLowerCase()
  changeChips((c) => (c.toLowerCase() === `tag:"${old}"` || c.toLowerCase() === `-tag:"${old}"` ? null : c))
}

// --- saved filters ------------------------------------------------------------------------------------

/** Keep the songs' page's search and filters under a name (the sidebar lists them). */
export function saveFilter(name: string, filter: LibraryFilter): SavedFilter {
  const saved: SavedFilter = { id: `f-${Date.now().toString(36)}`, name: name.trim().slice(0, 80) || 'My filter', query: filter.query, chips: [...filter.chips] }
  settings.savedFilters.push(saved)
  return saved
}

/** The songs of a saved filter: the songs' page with its search and filters. */
export function applySavedFilter(saved: SavedFilter): void {
  settings.filters.all = { query: saved.query, chips: [...saved.chips] }
  go('/')
}

export function deleteSavedFilter(id: string): void {
  const at = settings.savedFilters.findIndex((f) => f.id === id)
  if (at >= 0) settings.savedFilters.splice(at, 1)
}

// --- favourites and playlists -------------------------------------------------------------------------

export const isFavorite = (id: string): boolean => state.favorites.includes(id)
/** The stars a listener gives a song by ear, 0 to 5 in halves (``null``: taken back) - owner's request 2026-10-29. */
export function setRating(id: string, value: number | null): void {
  const next = { ...(state.ratings ?? {}) }
  if (value === null) delete next[id]
  else next[id] = Math.round(Math.min(5, Math.max(0, value)) * 2) / 2
  state.ratings = next
}

/** The stars as kept: song id -> 0 to 5 in halves (anything else left out). */
export function ratingsOf(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'number' && value >= 0 && value <= 5) out[id] = Math.round(value * 2) / 2
  }
  return out
}

export function toggleFavorite(id: string): void {
  const at = state.favorites.indexOf(id)
  if (at >= 0) state.favorites.splice(at, 1)
  else state.favorites.unshift(id)
}

export function newPlaylist(name: string, songs: string[] = []): Playlist {
  const playlist: Playlist = {
    id: `pl-${Date.now().toString(36)}`,
    name: name.trim() || 'New playlist',
    songs: [...songs],
    created: new Date().toISOString(),
    hue: Math.floor(Math.random() * 360),
  }
  state.playlists.push(playlist)
  return playlist
}

export function addToPlaylist(playlist: Playlist, ids: string[]): void {
  for (const id of ids) if (!playlist.songs.includes(id)) playlist.songs.push(id)
}

export function deletePlaylist(id: string): void {
  const at = state.playlists.findIndex((p) => p.id === id)
  if (at >= 0) state.playlists.splice(at, 1)
}

// --- the queue and playback -------------------------------------------------------------------------

export const queue = ref<string[]>([])
export const index = ref(-1)
/** The playlist the queue came from (its visual applies), ``''`` for the library. */
export const queueSource = ref('')
export const current = computed<SongSummary | null>(() => byId.value.get(queue.value[index.value] ?? '') ?? null)
export const detail = shallowRef<SongDetail | null>(null)
export const playing = ref(false)
export const time = ref(0)
/** The time of the song the listener hears (engine.heard): what the lyrics and the notation follow. */
export const heard = ref(0)
export const duration = ref(0)
export const nowPlayingOpen = ref(false)
/** The song put back where it stopped when the page opened, and not played since: the bar's ▶ (and Space)
 * goes on from there; its page or its card starts it from the beginning (owner's report 2026-10-16: songs
 * started in the middle). */
export const resumedOnly = ref(false)
watch(playing, (now) => now && (resumedOnly.value = false))

/** Play or pause the song that plays - from its page or its card: one only put back from the last time
 * starts from the beginning. */
export function toggleCurrent(): void {
  if (resumedOnly.value) {
    resumedOnly.value = false
    engine.seek(0)
    void engine.play()
    return
  }
  void engine.toggle()
}

/** Live Play ran out with *wait for the next new song*: the next one plays as soon as it comes. */
export const liveWaiting = ref(false)
/** The song *Save as a video* is open for. */
export const videoFor = shallowRef<SongSummary | null>(null)
/** *Share as a player* open: the songs chosen at first, the name. */
export const shareFor = shallowRef<{ songs: string[]; title: string } | null>(null)

/** A short message at the top of the page (App.vue shows it). */
export const toast = ref('')
let toastTimer: number | undefined
export function say(text: string, ms = 1800): void {
  toast.value = text
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), ms)
}

/** Open the page of the song that plays (the ⓘ buttons, the key I). */
export function openCurrentPage(): void {
  if (!current.value) return
  nowPlayingOpen.value = false
  go(`/song/${current.value.id}`)
}

export async function songDetail(id: string): Promise<SongDetail> {
  const cached = details.get(id)
  if (cached) return cached
  const found = await api.song(id)
  details.set(id, found)
  return found
}

/** The song's sound: its MP3 where the listener wants less data and the song has one, else its first file. */
function audioUrl(song: SongSummary): string {
  return media(song.id, settings.mp3 && song.has.mp3 && !isPortable ? 'audio_mp3' : 'audio')
}

let counted = ''
export async function playAt(i: number, { crossfade = 0, at = 0, autoplay = true } = {}): Promise<void> {
  const id = queue.value[i]
  const song = id ? byId.value.get(id) : undefined
  if (!song) return
  resumedOnly.value = false
  index.value = i
  counted = ''
  if (ab.value && !song.has.original) {
    ab.value = false
    engine.setAB(false)
  }
  // a shared player makes the song's sound from the page first (a large one is still reading it in)
  if (!mediaArrived(song.id)) say(`“${song.title}” is still arriving (${portableLoading.got} of ${portableLoading.total} files) - it plays as soon as it is here`, 4000)
  await mediaReady(song.id, 'audio')
  await engine.load(
    { id: song.id, url: audioUrl(song), original: song.has.original ? media(song.id, 'original') : null },
    { crossfade, at, autoplay }
  )
  detail.value = null
  songDetail(song.id).then((d) => {
    if (current.value?.id === d.id) detail.value = d
  }).catch(() => {})
  mediaSession(song)
}

export async function playSongs(ids: string[], start = 0, source = ''): Promise<void> {
  if (!ids.length) return
  let order = [...ids]
  let first = start
  if (settings.shuffle) {
    const head = order[start]
    order = shuffle(order.filter((_, k) => k !== start))
    order.unshift(head)
    first = 0
  }
  queue.value = order
  queueSource.value = source
  await playAt(first)
}

export async function playSong(id: string, context: string[] = [], source = ''): Promise<void> {
  const list = context.length ? context : [id]
  await playSongs(list, Math.max(0, list.indexOf(id)), source)
}

/** Plays a song from ``at`` seconds: the song that plays jumps there, another one starts there. */
export async function playSongAt(id: string, at: number, context: string[] = []): Promise<void> {
  if (current.value?.id === id) {
    engine.seek(at)
    if (engine.paused) await engine.play()
    return
  }
  const list = context.includes(id) ? context : [id]
  queue.value = [...list]
  queueSource.value = ''
  await playAt(list.indexOf(id), { at })
}

export function enqueue(ids: string[], next = false): void {
  if (index.value < 0) {
    void playSongs(ids)
    return
  }
  const fresh = ids.filter((id) => !queue.value.includes(id) || next)
  if (next) queue.value.splice(index.value + 1, 0, ...fresh)
  else queue.value.push(...fresh)
}

export function shuffle<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[k]] = [out[k], out[i]]
  }
  return out
}

// --- A/B, mute, the sleep timer ----------------------------------------------------------------------

/** A/B: the song's unmastered take instead of the master, in step. */
export const ab = ref(false)
export function toggleAB(): void {
  if (!current.value?.has.original && !ab.value) return
  ab.value = !ab.value
  engine.setAB(ab.value)
}

export const muted = ref(false)
export function toggleMute(): void {
  muted.value = !muted.value
  engine.setVolume(muted.value ? 0 : settings.volume)
}
export function setVolume(value: number): void {
  settings.volume = Math.max(0, Math.min(1, value))
  muted.value = false
  engine.setVolume(settings.volume)
}

/** The sleep timer: the music fades out over its last seconds and stops (``'song'``: after this song). */
export const sleep = ref<{ at: number; minutes: number } | 'song' | null>(null)
export const sleepLeft = ref(0)
const SLEEP_FADE_S = 12
export function setSleep(minutes: number | 'song' | null): void {
  if (sleep.value && sleep.value !== 'song') engine.setVolume(muted.value ? 0 : settings.volume)
  sleep.value = minutes === null || minutes === 'song' ? minutes : { at: Date.now() + minutes * 60_000, minutes }
}
function sleepTick(): void {
  const timer = sleep.value
  if (!timer || timer === 'song') {
    sleepLeft.value = 0
    return
  }
  const left = (timer.at - Date.now()) / 1000
  sleepLeft.value = Math.max(0, left)
  if (left <= 0) {
    engine.pause()
    sleep.value = null
    engine.setVolume(muted.value ? 0 : settings.volume)
  } else if (left < SLEEP_FADE_S && !muted.value) {
    engine.setVolume(settings.volume * (left / SLEEP_FADE_S))
  }
}

export async function next(auto = false): Promise<void> {
  if (!queue.value.length) return
  if (auto && sleep.value === 'song') {
    sleep.value = null
    engine.pause()
    return
  }
  if (auto && settings.repeat === 'one') {
    engine.seek(0)
    await engine.play()
    return
  }
  let i = index.value + 1
  if (i >= queue.value.length) {
    if (settings.live.on && settings.live.atEnd === 'wait' && auto) {
      // Live Play waits for the next song ComfyUI makes
      engine.pause()
      liveWaiting.value = true
      return
    }
    if (settings.repeat === 'off' && auto && !settings.live.on) {
      engine.pause()
      return
    }
    i = 0
  }
  await playAt(i, { crossfade: auto ? settings.crossfade : 0 })
}

/** The song ``next`` plays after the one at ``at`` when this one ends (``null``: none - the end of the list
 * without repeat, a song repeated, Live Play waiting for a new song). */
export function nextIdOf(list: string[], at: number, repeat: Settings['repeat'], live: { on: boolean; atEnd: string }): string | null {
  if (at < 0 || !list.length || repeat === 'one') return null
  if (at + 1 < list.length) return list[at + 1]
  if (live.on) return live.atEnd === 'wait' ? null : list[0]
  return repeat === 'all' ? list[0] : null
}

/** Whether the song at ``at`` plays to its very end and the music stops there: nothing follows it (the end of the
 * list without repeat, Live Play waiting for a new song) or the sleep timer stops after it. No crossfade takes its
 * last seconds then, and a click on it afterwards plays it again from the beginning (stopped a crossfade early, a
 * click went on from there and the near end stopped it again at once). */
export function playsToItsEnd(list: string[], at: number, repeat: Settings['repeat'], live: { on: boolean; atEnd: string }, sleepAfter: boolean): boolean {
  return sleepAfter || (repeat !== 'one' && nextIdOf(list, at, repeat, live) === null)
}

/** The song that comes next, for *Up next* on the big screen. */
export const upNext = computed<SongSummary | null>(() => {
  const id = nextIdOf(queue.value, index.value, settings.repeat, settings.live)
  return id && id !== queue.value[index.value] ? (byId.value.get(id) ?? null) : null
})

export async function previous(): Promise<void> {
  if (engine.time > 3 || index.value <= 0) {
    engine.seek(0)
    return
  }
  await playAt(index.value - 1)
}

function mediaSession(song: SongSummary): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.tags.artist || song.model || 'Plenio',
    album: song.tags.album || song.genre,
    artwork: song.has.cover ? [{ src: coverUrl(song.id, 256), sizes: '512x512', type: 'image/jpeg' }] : [],
  })
  navigator.mediaSession.setActionHandler('play', () => void engine.play())
  navigator.mediaSession.setActionHandler('pause', () => engine.pause())
  navigator.mediaSession.setActionHandler('nexttrack', () => void next())
  navigator.mediaSession.setActionHandler('previoustrack', () => void previous())
  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime !== undefined) engine.seek(details.seekTime)
  })
}

// the engine's ticks: time, end of song (crossfade early), plays counted after 30 s, the resume point
let lastResume = 0
engine.on(() => {
  playing.value = !engine.paused
  time.value = engine.time
  heard.value = engine.heard(settings.syncOffset / 1000)
  duration.value = engine.duration
})
/** Near the end of a song: the next one (fading over), or this one again (repeat one, at its very end). */
function nearEnd(): void {
  if (!current.value || !playing.value || fadingOut || engine.duration <= 0) return
  // the last song: its own end stops the music (the engine's 'ended'), ▶ then starts it from the beginning
  if (playsToItsEnd(queue.value, index.value, settings.repeat, settings.live, sleep.value === 'song')) return
  const left = engine.duration - engine.time
  const lead = settings.repeat === 'one' ? 0.05 : Math.max(0.05, settings.crossfade)
  if (left <= lead) toNext()
}
function toNext(): void {
  fadingOut = true
  void next(true).finally(() => window.setTimeout(() => (fadingOut = false), 400))
}
// a song that ended without the page noticing in time (a tab in the background has no frames): on we go
engine.onEnded(() => {
  if (!fadingOut) toNext()
})
// in the background the page's frames stop, its timers do not (a page that plays sound is not held back)
const backgroundTick = window.setInterval(() => {
  if (pageGone()) return clearInterval(backgroundTick) // no window any more either
  if (document.hidden) {
    sleepTick()
    nearEnd()
  }
}, 250)

function tick(): void {
  time.value = engine.time
  heard.value = engine.heard(settings.syncOffset / 1000)
  sleepTick()
  engine.keepInStep()
  const song = current.value
  if (song && playing.value) {
    nearEnd()
    if (counted !== song.id && engine.time > 30) {
      counted = song.id
      state.plays[song.id] = (state.plays[song.id] ?? 0) + 1
      state.last_played[song.id] = new Date().toISOString()
      save()
    }
    const now = performance.now()
    if (now - lastResume > 5000) {
      lastResume = now
      settings.resume = { queue: queue.value.slice(0, 500), index: index.value, time: engine.time }
    }
  }
  requestAnimationFrame(tick)
}
let fadingOut = false
requestAnimationFrame(tick)

function restore(): void {
  const resume = settings.resume
  if (!resume?.queue?.length) return
  const ids = resume.queue.filter((id) => byId.value.has(id))
  if (!ids.length) return
  queue.value = ids
  const i = Math.max(0, Math.min(ids.length - 1, resume.index))
  void playAt(i, { at: resume.time, autoplay: false })
  resumedOnly.value = true
}
