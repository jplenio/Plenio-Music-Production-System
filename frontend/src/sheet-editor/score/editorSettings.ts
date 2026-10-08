/**
 * The score editor's basic settings as one unit (owner's request 2026-10-03): the tracks' sounds, the
 * metronome, what a cover shows and plays of its source, the MIDI recording and the paper and size of
 * the notation export. A project file carries them (``settings``), and presets set them by kind of song -
 * built in, or saved by the user.
 *
 * User presets live in ComfyUI's user data (``plenio/score-editor-presets.json`` of the ComfyUI user, the
 * same store as the user's workflows), so they follow the user to every browser; when that store cannot
 * be reached they are kept in this browser and the editor says so.
 */
import type { Fetcher } from '../../api/client'
import { type InstrumentId, type Sounds, isInstrument, soundsOf } from './instruments'
import type { RecordSettings } from './midiRecording'
import { type EditorPrefs, defaultRecord, isNotationSize, recordOf } from './prefs'

export type Paper = 'a4' | 'letter'
/** How large the notation export draws the music (``notationExport.ts``). */
export type NotationSize = 'large' | 'standard' | 'smaller' | 'compact'

export interface EditorSettings {
  sounds: Sounds
  metronome: boolean
  /** Covers: what plays, the source's level, its waveform and its sung pitch in the roll. */
  hear: 'both' | 'notes' | 'source'
  sourceLevel: number
  wave: boolean
  sung: boolean
  record: RecordSettings
  /** The paper of the notation's PDF and print. */
  paper: Paper
  /** How large the notation export draws the music. */
  notationSize: NotationSize
}

export function settingsOf(prefs: EditorPrefs): EditorSettings {
  return {
    sounds: { ...prefs.sounds },
    metronome: prefs.metronome,
    hear: prefs.hear,
    sourceLevel: prefs.sourceLevel,
    wave: prefs.wave,
    sung: prefs.sung,
    record: { ...prefs.record },
    paper: prefs.paper,
    notationSize: prefs.notationSize
  }
}

/** ``prefs`` with the given settings (the ones a preset or a project names; the rest stays). */
export function withSettings(prefs: EditorPrefs, settings: Partial<EditorSettings>): EditorPrefs {
  return {
    ...prefs,
    ...settings,
    sounds: { ...prefs.sounds, ...(settings.sounds ?? {}) },
    record: { ...prefs.record, ...(settings.record ?? {}) }
  }
}

/**
 * The valid settings in ``value`` (a project's or a preset's, written by any version): unknown or
 * broken fields are left out, so they keep the current value.
 */
export function parseSettings(value: unknown): Partial<EditorSettings> {
  if (typeof value !== 'object' || value === null) return {}
  const data = value as Record<string, unknown>
  const out: Partial<EditorSettings> = {}
  if (typeof data.sounds === 'object' && data.sounds !== null) {
    const sounds = data.sounds as Record<string, unknown>
    if (Object.values(sounds).some(isInstrument)) out.sounds = soundsOf(sounds)
  }
  if (typeof data.metronome === 'boolean') out.metronome = data.metronome
  if (data.hear === 'both' || data.hear === 'notes' || data.hear === 'source') out.hear = data.hear
  if (typeof data.sourceLevel === 'number' && Number.isFinite(data.sourceLevel)) out.sourceLevel = Math.max(0, Math.min(1, data.sourceLevel))
  if (typeof data.wave === 'boolean') out.wave = data.wave
  if (typeof data.sung === 'boolean') out.sung = data.sung
  if (typeof data.record === 'object' && data.record !== null) out.record = recordOf(data.record)
  if (data.paper === 'a4' || data.paper === 'letter') out.paper = data.paper
  if (isNotationSize(data.notationSize)) out.notationSize = data.notationSize
  return out
}

// --- presets -----------------------------------------------------------------------------------------

export interface Preset {
  name: string
  /** What the preset is for (built in) - shown as its tooltip. */
  note?: string
  builtIn: boolean
  settings: Partial<EditorSettings>
}

const sounds = (Vocal: InstrumentId, Ins: InstrumentId, chord: InstrumentId, guide: InstrumentId): Sounds => ({ Vocal, Ins, chord, guide })

/** Starting points by kind of song (the sounds) and by way of working (cover, MIDI keyboard). */
export const BUILT_IN_PRESETS: readonly Preset[] = [
  { name: 'Classic', note: 'The editor’s plain tones', builtIn: true, settings: { sounds: sounds('soft', 'plain', 'plain', 'plain') } },
  { name: 'Pop', note: 'Voice, plucked instrument, pad chords, bass', builtIn: true, settings: { sounds: sounds('voice', 'pluck', 'pad', 'bass') } },
  { name: 'Ballad', note: 'Voice, piano, string chords, bass', builtIn: true, settings: { sounds: sounds('voice', 'piano', 'strings', 'bass') } },
  { name: 'Rock', note: 'Synth lead, organ, plucked chords, bass', builtIn: true, settings: { sounds: sounds('lead', 'organ', 'pluck', 'bass') } },
  { name: 'Electronic / dance', note: 'Synth lead, pluck, pad, bass - and the metronome', builtIn: true, settings: { sounds: sounds('lead', 'pluck', 'pad', 'bass'), metronome: true } },
  { name: 'Acoustic / singer-songwriter', note: 'Voice, flute, plucked chords, bass', builtIn: true, settings: { sounds: sounds('voice', 'flute', 'pluck', 'bass') } },
  { name: 'Jazz / soul', note: 'Voice, electric piano, electric-piano chords, bass', builtIn: true, settings: { sounds: sounds('voice', 'epiano', 'epiano', 'bass') } },
  { name: 'Orchestral / cinematic', note: 'Flute, strings, string chords, bass', builtIn: true, settings: { sounds: sounds('flute', 'strings', 'strings', 'bass') } },
  {
    name: 'Composing with a MIDI keyboard',
    note: 'Piano sounds, the metronome, one bar of count-in, 1/16 quantize',
    builtIn: true,
    settings: { sounds: sounds('piano', 'epiano', 'pad', 'bass'), metronome: true, record: { ...defaultRecord(), countIn: 1, quantize: 16 } }
  },
  {
    name: 'Cover: check the transcription',
    note: 'The source under the notes, its waveform and sung pitch shown, the melody as a voice',
    builtIn: true,
    settings: { hear: 'both', wave: true, sung: true, sourceLevel: 0.8, sounds: sounds('voice', 'plain', 'pad', 'plain') }
  },
  {
    name: 'Cover: free arrangement',
    note: 'Only the notes play; the source’s waveform and sung pitch are hidden',
    builtIn: true,
    settings: { hear: 'notes', wave: false, sung: false }
  }
]

export const PRESETS_FILE = 'plenio/score-editor-presets.json'
const PRESETS_SCHEMA = 'plenio.score_presets/1'
const LOCAL_KEY = 'plenio.score-editor.presets'

function userPresetsOf(value: unknown): Preset[] {
  const data = (typeof value === 'object' && value !== null ? value : {}) as { presets?: unknown }
  if (!Array.isArray(data.presets)) return []
  const seen = new Set<string>()
  const presets: Preset[] = []
  for (const item of data.presets) {
    const record = (typeof item === 'object' && item !== null ? item : {}) as { name?: unknown; settings?: unknown }
    const name = typeof record.name === 'string' ? record.name.trim().slice(0, 60) : ''
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    presets.push({ name, builtIn: false, settings: parseSettings(record.settings) })
  }
  return presets
}

function fileOf(presets: readonly Preset[]): string {
  return JSON.stringify({ schema: PRESETS_SCHEMA, presets: presets.map((p) => ({ name: p.name, settings: p.settings })) }, null, 1)
}

function readLocal(): Preset[] {
  try {
    return userPresetsOf(JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? '{}'))
  } catch {
    return []
  }
}

function writeLocal(presets: readonly Preset[]): boolean {
  try {
    window.localStorage.setItem(LOCAL_KEY, fileOf(presets))
    return true
  } catch {
    return false
  }
}

const userdataRoute = `/userdata/${encodeURIComponent(PRESETS_FILE)}`

/**
 * The user's presets: from ComfyUI's user data (``where: 'comfyui'``), else from this browser
 * (``'browser'``: the store could not be reached).
 */
export async function loadUserPresets(fetcher: Fetcher | null): Promise<{ presets: Preset[]; where: 'comfyui' | 'browser' }> {
  if (fetcher) {
    try {
      const response = await fetcher.fetchApi(userdataRoute, { cache: 'no-store' })
      if (response.status === 404) return { presets: [], where: 'comfyui' }
      if (response.ok) return { presets: userPresetsOf(await response.json()), where: 'comfyui' }
    } catch {
      // the store is not reachable: this browser's copy
    }
  }
  return { presets: readLocal(), where: 'browser' }
}

/** Store the user's presets (ComfyUI's user data; this browser when that fails). */
export async function saveUserPresets(fetcher: Fetcher | null, presets: readonly Preset[]): Promise<'comfyui' | 'browser' | 'failed'> {
  const own = presets.filter((p) => !p.builtIn)
  if (fetcher) {
    try {
      const response = await fetcher.fetchApi(`${userdataRoute}?overwrite=true`, { method: 'POST', body: fileOf(own) })
      if (response.ok) return 'comfyui'
    } catch {
      // keep them in this browser
    }
  }
  return writeLocal(own) ? 'browser' : 'failed'
}

/** The presets with ``preset`` added, replacing one of the same name (case does not matter). */
export function withPreset(presets: readonly Preset[], preset: Preset): Preset[] {
  return [...presets.filter((p) => p.name.toLowerCase() !== preset.name.toLowerCase()), preset].sort((a, b) => a.name.localeCompare(b.name))
}
