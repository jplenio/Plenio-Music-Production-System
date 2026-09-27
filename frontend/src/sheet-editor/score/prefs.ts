/**
 * Viewer preferences of the score editor (layout, zoom, voices, speed, piano roll, metronome).
 * They live in this browser's localStorage only - never in the workflow - and a blocked or empty
 * storage simply gives the defaults.
 */
import type { VoiceSwitches } from '../../shared/playback'

export interface EditorPrefs {
  /** *review*: piano roll, notation, inspector (ABC text under *Advanced*); *text*: ABC text and notation. */
  layout: 'review' | 'text'
  /** Show the ABC text in the *review* layout. */
  advanced: boolean
  zoom: number
  voices: VoiceSwitches
  speed: number
  /** Show the piano roll with its chord lane (review layout). */
  roll: boolean
  /** Piano-roll zoom: pixels per quarter note. */
  rollZoom: number
  metronome: boolean
}

const KEY = 'plenio.score-editor.prefs'

export function defaultPrefs(): EditorPrefs {
  return {
    layout: 'review',
    advanced: false,
    zoom: 1,
    voices: { Vocal: true, Ins: true, chords: true },
    speed: 1,
    roll: true,
    rollZoom: 48,
    metronome: false
  }
}

/** The layout of stored preferences, including those of 0.2.x (``both``/``notation``/``text``). */
function layoutOf(data: { layout?: unknown; advanced?: unknown }): Pick<EditorPrefs, 'layout' | 'advanced'> {
  const layout = data.layout
  if (layout === 'text') return { layout: 'text', advanced: data.advanced === true }
  if (layout === 'both') return { layout: 'review', advanced: true }
  return { layout: 'review', advanced: data.advanced === true }
}

export function loadPrefs(storage: Pick<Storage, 'getItem'> | null = safeStorage()): EditorPrefs {
  const defaults = defaultPrefs()
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return defaults
    const data = JSON.parse(raw) as Partial<EditorPrefs>
    return {
      ...layoutOf(data),
      zoom: typeof data.zoom === 'number' && data.zoom >= 0.6 && data.zoom <= 1.8 ? data.zoom : defaults.zoom,
      voices: {
        Vocal: data.voices?.Vocal !== false,
        Ins: data.voices?.Ins !== false,
        chords: data.voices?.chords !== false
      },
      speed: typeof data.speed === 'number' && data.speed >= 0.25 && data.speed <= 2 ? data.speed : defaults.speed,
      roll: data.roll !== false,
      rollZoom:
        typeof data.rollZoom === 'number' && data.rollZoom >= 12 && data.rollZoom <= 240 ? data.rollZoom : defaults.rollZoom,
      metronome: data.metronome === true
    }
  } catch {
    return defaults
  }
}

export function savePrefs(prefs: EditorPrefs, storage: Pick<Storage, 'setItem'> | null = safeStorage()): void {
  try {
    storage?.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // storage full or blocked: preferences are a convenience only
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
