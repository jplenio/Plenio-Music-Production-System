/**
 * Viewer preferences of the score editor (layout, zoom, voices, speed, piano roll, metronome).
 * They live in this browser's localStorage only - never in the workflow - and a blocked or empty
 * storage simply gives the defaults.
 */
import type { VoiceSwitches } from '../../shared/playback'
import { NOTATION_MAX, NOTATION_MIN, ROLL_MAX, ROLL_MIN, SIDE_MAX, SIDE_MIN } from '../paneSizes'

export interface EditorPrefs {
  /**
   * *review*: piano roll, notation, inspector (ABC text under *Advanced*); *daw*: the same with the
   * track headers and the Guide track; *text*: ABC text and notation.
   */
  layout: 'review' | 'daw' | 'text'
  /** Show the ABC text in the *review* and *daw* layouts. */
  advanced: boolean
  zoom: number
  voices: VoiceSwitches
  speed: number
  /** Show the piano roll with its chord lane (review and daw layouts). */
  roll: boolean
  /** Piano-roll zoom: pixels per quarter note. */
  rollZoom: number
  /** Height of the piano roll in pixels (the splitter under it; 120-720). */
  rollHeight: number
  /** Share of the review/DAW column the notation takes above the ABC text (0.25-0.85). */
  notationShare: number
  /** Width of the side column (navigator, track panel, lyrics fit; 160-460 px). */
  sideWidth: number
  metronome: boolean
}

const KEY = 'plenio.score-editor.prefs'

export function defaultPrefs(): EditorPrefs {
  return {
    layout: 'review',
    advanced: false,
    zoom: 1,
    voices: { Vocal: true, Ins: true, chords: true, guide: true },
    speed: 1,
    roll: true,
    rollZoom: 48,
    rollHeight: 280,
    notationShare: 0.6,
    sideWidth: 230,
    metronome: false
  }
}

/** The layout of stored preferences, including those of 0.2.x (``both``/``notation``/``text``). */
function layoutOf(data: { layout?: unknown; advanced?: unknown }): Pick<EditorPrefs, 'layout' | 'advanced'> {
  const layout = data.layout
  if (layout === 'text') return { layout: 'text', advanced: data.advanced === true }
  if (layout === 'daw') return { layout: 'daw', advanced: data.advanced === true }
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
        chords: data.voices?.chords !== false,
        guide: data.voices?.guide !== false
      },
      speed: typeof data.speed === 'number' && data.speed >= 0.25 && data.speed <= 2 ? data.speed : defaults.speed,
      roll: data.roll !== false,
      rollZoom:
        typeof data.rollZoom === 'number' && data.rollZoom >= 12 && data.rollZoom <= 240 ? data.rollZoom : defaults.rollZoom,
      rollHeight:
        typeof data.rollHeight === 'number' && data.rollHeight >= ROLL_MIN && data.rollHeight <= ROLL_MAX
          ? Math.round(data.rollHeight)
          : defaults.rollHeight,
      notationShare:
        typeof data.notationShare === 'number' &&
        data.notationShare >= NOTATION_MIN &&
        data.notationShare <= NOTATION_MAX
          ? data.notationShare
          : defaults.notationShare,
      sideWidth:
        typeof data.sideWidth === 'number' && data.sideWidth >= SIDE_MIN && data.sideWidth <= SIDE_MAX
          ? Math.round(data.sideWidth)
          : defaults.sideWidth,
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
