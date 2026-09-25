/**
 * Viewer preferences of the score editor (layout, zoom, voices, speed). They live in this
 * browser's localStorage only - never in the workflow - and a blocked or empty storage
 * simply gives the defaults.
 */
import type { VoiceSwitches } from '../../shared/playback'

export interface EditorPrefs {
  layout: 'both' | 'notation' | 'text'
  zoom: number
  voices: VoiceSwitches
  speed: number
}

const KEY = 'plenio.score-editor.prefs'

export function defaultPrefs(): EditorPrefs {
  return { layout: 'both', zoom: 1, voices: { Vocal: true, Ins: true, chords: true }, speed: 1 }
}

export function loadPrefs(storage: Pick<Storage, 'getItem'> | null = safeStorage()): EditorPrefs {
  const defaults = defaultPrefs()
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return defaults
    const data = JSON.parse(raw) as Partial<EditorPrefs>
    return {
      layout: data.layout === 'notation' || data.layout === 'text' ? data.layout : 'both',
      zoom: typeof data.zoom === 'number' && data.zoom >= 0.6 && data.zoom <= 1.8 ? data.zoom : defaults.zoom,
      voices: {
        Vocal: data.voices?.Vocal !== false,
        Ins: data.voices?.Ins !== false,
        chords: data.voices?.chords !== false
      },
      speed: typeof data.speed === 'number' && data.speed >= 0.25 && data.speed <= 2 ? data.speed : defaults.speed
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
