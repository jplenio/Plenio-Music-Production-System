/**
 * Which visual plays: a song of its own (fixed for that song) wins, then the playlist's visual, then the
 * mode - *auto* (one that suits the song's genre and mood), *random* (from the visuals you ticked), *cycle*
 * (through them in turn) or *fixed* (always the same). When it changes: with every song, at every new
 * section of the song, every so many seconds, or when the music drops in after a quiet passage. Only visuals this
 * device draws, and smoothly, are chosen (gpu.ts): no Drop or Nova visual where there is no WebGL2 on the graphics
 * card, no Nova visual too heavy for it, none that did not keep up in this session.
 */
import type { SongSummary } from '../api'
import { hashOf } from '../colors'
import { DEFAULT_FADE, fadeWithDefaults, type FadeStyle } from './mixer'
import { MORE_CLASSIC } from './classics'
import { MILKDROP } from './drop/milkdrop'
import { slug } from './drop/format'
import { offered } from './gpu'
import { NOVA } from './nova'
import { PRESETS, allPresets, type Scheme } from './presets'

/** The visuals added on 2026-10-23: offered once to settings saved before them. */
const ADDED_2026_10_23 = [...MORE_CLASSIC.map((p) => p.id), ...MILKDROP.map((f) => `drop-${slug(f.name)}`)]
/** Plenio Nova's visuals (2026-10-29): the same. */
const ADDED_NOVA = NOVA.map((def) => def.id)

export type VisualMode = 'auto' | 'director' | 'random' | 'cycle' | 'fixed'
export type SwitchOn = 'song' | 'section' | 'interval' | 'drop'

export interface VisualSettings {
  enabled: boolean
  mode: VisualMode
  pool: string[]
  fixed: string
  switchOn: SwitchOn
  interval: number
  scheme: Scheme
  sensitivity: number
  /** A visual of its own per song (song id -> visual id). */
  songs: Record<string, string>
  /** The lyrics over the visual in the full-screen view. */
  lyrics: boolean
  /** Short title card when a song starts. */
  titles: boolean
  /** Plenio Drop's and Plenio Nova's quality: their picture's size against the screen (0.5, 0.75, 1). */
  dropScale: number
  /** Plenio Drop's presets were offered in the pool once (settings saved before them had only the classics). */
  dropsOffered: boolean
  /** The visuals of 2026-10-23 (twelve classics, thirty Drop presets) were offered in the pool once. */
  moreOffered: boolean
  /** Plenio Nova's visuals were offered in the pool once. */
  novaOffered: boolean
  /** How one visual changes into the next, and how long it takes (owner's request 2026-10-18: softly). */
  fade: FadeStyle
  fadeSeconds: number
  /** One light (finish.ts): Nova's glow, tone curve, vignette and grain over every visual. */
  finish: boolean
}

export const DEFAULT_VISUALS: VisualSettings = {
  enabled: true,
  mode: 'auto',
  pool: PRESETS.map((p) => p.id),
  fixed: 'bars',
  switchOn: 'song',
  interval: 30,
  scheme: 'song',
  sensitivity: 1,
  songs: {},
  lyrics: true,
  titles: true,
  dropScale: 0.75,
  dropsOffered: true,
  moreOffered: true,
  novaOffered: true,
  fade: DEFAULT_FADE.style,
  fadeSeconds: DEFAULT_FADE.seconds,
  finish: true,
}

export function withDefaults(raw: unknown): VisualSettings {
  const given = (raw && typeof raw === 'object' ? raw : {}) as Partial<VisualSettings>
  const merged = { ...DEFAULT_VISUALS, ...given }
  // the listener's own presets (my-...) are read later: their ids stay
  merged.pool = (merged.pool ?? []).filter((id) => id.startsWith('my-') || PRESETS.some((p) => p.id === id))
  if (!merged.pool.length) merged.pool = DEFAULT_VISUALS.pool
  // settings from before Plenio Drop: its presets join the pool once
  if (!given.dropsOffered) {
    for (const p of PRESETS) if (p.kind === 'drop' && !merged.pool.includes(p.id)) merged.pool.push(p.id)
    merged.dropsOffered = true
  }
  // settings from before the visuals of 2026-10-23: they join the pool once (a visual taken out stays out)
  if (!given.moreOffered) {
    for (const id of ADDED_2026_10_23) if (!merged.pool.includes(id)) merged.pool.push(id)
    merged.moreOffered = true
  }
  if (!given.novaOffered) {
    for (const id of ADDED_NOVA) if (!merged.pool.includes(id)) merged.pool.push(id)
    merged.novaOffered = true
  }
  if (![0.5, 0.75, 1].includes(merged.dropScale)) merged.dropScale = 0.75
  const fade = fadeWithDefaults(merged.fade, merged.fadeSeconds)
  merged.fade = fade.style
  merged.fadeSeconds = fade.seconds
  merged.finish = merged.finish !== false
  return merged
}

const MOODS: [RegExp, string][] = [
  [/edm|techno|trance|house|electro|synth|dubstep|drum|bass|club|dance|future|rave|hardstyle|phonk/i, 'electronic'],
  [/metal|punk|rock|rap|trap|drill|energetic|power|aggressive|fierce|anthem|epic|driving|upbeat|party/i, 'energetic'],
  [/acoustic|folk|jazz|blues|country|singer|unplugged|bossa|classical|piano|guitar|string/i, 'acoustic'],
  [/ambient|chill|calm|soft|dream|lofi|lo-fi|sleep|meditat|gentle|warm|tender|melanchol|ballad|slow/i, 'calm'],
  [/dark|doom|gothic|horror|industrial|sinister|brooding|haunting|noir/i, 'dark'],
]

/** What the song is like, for *auto*: energetic, calm, acoustic, electronic, dark - from its genre and mood;
 * the style only when they say nothing (a style's "warm female voice" made a dance song calm). */
export function songMoods(song: Pick<SongSummary, 'genre' | 'mood' | 'style' | 'bpm'>): string[] {
  const read = (text: string): Set<string> => new Set(MOODS.filter(([pattern]) => pattern.test(text)).map(([, mood]) => mood))
  let found = read(`${song.genre} ${song.mood}`)
  if (!found.size) found = read(song.style)
  if (song.bpm && song.bpm >= 125) found.add('energetic')
  if (song.bpm && song.bpm <= 80) found.add('calm')
  return [...found]
}

export interface Choice {
  settings: VisualSettings
  song: Pick<SongSummary, 'id' | 'genre' | 'mood' | 'style' | 'bpm'> | null
  /** The visual of the playlist the queue was started from (``''``: none). */
  playlist?: string
  previous?: string | null
  /** How many times the visual changed during this song (a new pick each time). */
  turn?: number
  random?: () => number
}

export function chooseVisual({ settings, song, playlist = '', previous = null, turn = 0, random = Math.random }: Choice): string {
  const own = song ? settings.songs[song.id] : undefined
  // only what this device draws smoothly; a song's or playlist's own visual it cannot draw falls back to the mode
  const all = allPresets().filter(offered)
  if (own && all.some((p) => p.id === own)) return own
  if (playlist && all.some((p) => p.id === playlist)) return playlist
  const known = settings.pool.filter((id) => all.some((p) => p.id === id))
  const pool = known.length ? known : all.map((p) => p.id)
  switch (settings.mode) {
    case 'fixed':
      return all.some((p) => p.id === settings.fixed) ? settings.fixed : 'bars'
    case 'cycle': {
      const at = previous ? pool.indexOf(previous) : -1
      return pool[(at + 1) % pool.length]
    }
    case 'random': {
      const choices = pool.length > 1 ? pool.filter((id) => id !== previous) : pool
      return choices[Math.floor(random() * choices.length) % choices.length]
    }
    default: {
      const moods = song ? songMoods(song) : []
      const fitting = all.filter((p) => pool.includes(p.id) && (moods.length ? p.suits.some((s) => moods.includes(s)) : true))
      const choices = (fitting.length ? fitting : all.filter((p) => pool.includes(p.id))).map((p) => p.id)
      const usable = choices.length > 1 ? choices.filter((id) => id !== previous) : choices
      const list = usable.length ? usable : ['bars']
      // the same song starts with the same visual; every change during it picks the next one
      return list[(hashOf(song?.id ?? '') + turn) % list.length]
    }
  }
}
