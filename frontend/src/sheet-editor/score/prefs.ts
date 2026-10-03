/**
 * Viewer preferences of the score editor (layout, zoom, voices, speed, piano roll, metronome).
 * They live in this browser's localStorage only - never in the workflow - and a blocked or empty
 * storage simply gives the defaults.
 */
import type { VoiceSwitches } from '../../shared/playback'
import type { RecordSettings } from './midiRecording'
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
  /** A cover's playback: the notes and the source recording together, or one of them (A/B). */
  hear: 'both' | 'notes' | 'source'
  /** The source recording's level under the notes (0-1). */
  sourceLevel: number
  /** Hear a note's pitch when it is drawn, moved or a key of the roll is clicked. */
  audition: boolean
  /** The piano roll's vertical zoom: pixels per key row (6-28). */
  rowHeight: number
  /** The roll pages along with the playback line (Cubase: autoscroll). */
  follow: boolean
  /** Draw a cover's sung pitch (node Sung Pitch) over the notes. */
  sung: boolean
  /** Recording and step input with a MIDI keyboard. */
  record: RecordSettings
  /** The MIDI keyboard to listen to (an input's id; ``all``: every one). */
  midiInput: string
}

export function defaultRecord(): RecordSettings {
  return { countIn: 1, quantize: 16, mode: 'replace', mute: true, thru: true, stepLength: 8 }
}

function recordOf(value: unknown): RecordSettings {
  const defaults = defaultRecord()
  const data = (typeof value === 'object' && value !== null ? value : {}) as Partial<RecordSettings>
  const pick = <T>(candidate: unknown, allowed: readonly T[], fallback: T): T => (allowed.includes(candidate as T) ? (candidate as T) : fallback)
  return {
    countIn: pick(data.countIn, [0, 1, 2], defaults.countIn),
    quantize: pick(data.quantize, [0, 4, 8, 16, 32], defaults.quantize),
    mode: pick(data.mode, ['replace', 'merge'] as const, defaults.mode),
    mute: typeof data.mute === 'boolean' ? data.mute : defaults.mute,
    thru: typeof data.thru === 'boolean' ? data.thru : defaults.thru,
    stepLength: pick(data.stepLength, [1, 2, 4, 8, 16], defaults.stepLength)
  }
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
    metronome: false,
    hear: 'both',
    sourceLevel: 0.7,
    audition: true,
    rowHeight: 12,
    follow: true,
    sung: true,
    record: defaultRecord(),
    midiInput: 'all'
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
      metronome: data.metronome === true,
      hear: data.hear === 'notes' || data.hear === 'source' ? data.hear : defaults.hear,
      sourceLevel:
        typeof data.sourceLevel === 'number' && data.sourceLevel >= 0 && data.sourceLevel <= 1 ? data.sourceLevel : defaults.sourceLevel,
      audition: data.audition !== false,
      rowHeight:
        typeof data.rowHeight === 'number' && data.rowHeight >= 6 && data.rowHeight <= 28 ? Math.round(data.rowHeight) : defaults.rowHeight,
      follow: data.follow !== false,
      sung: data.sung !== false,
      record: recordOf(data.record),
      midiInput: typeof data.midiInput === 'string' && data.midiInput ? data.midiInput : 'all'
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
