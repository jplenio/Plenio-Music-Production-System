/**
 * Pure parts of the MIDI import dialog (no DOM, no fetches): the role choices, the mapping the
 * route takes, the suggested grid from the score's unit and base64 for the file bytes.
 *
 * The import itself runs in the backend (`POST /plenio/score/midi/import`) - the editor has no
 * second score model; this module only formats what the dialog shows and what it sends.
 */
import type { MidiTrack } from '../../api/client'
import type { ScoreView } from '../../shared/scoreView'

export type MidiRole = 'vocal' | 'ins' | 'chords' | 'guide' | 'none'

export interface RoleOption {
  value: MidiRole
  label: string
  title: string
}

export const ROLE_OPTIONS: RoleOption[] = [
  { value: 'vocal', label: 'Vocal', title: 'The sung melody (V: Vocal) - one voice, monophonic' },
  { value: 'ins', label: 'Instrument', title: 'The instrumental melody (V: Ins) - one voice, monophonic' },
  { value: 'chords', label: 'Chords', title: 'Chord symbols, read from the notes (best effort)' },
  { value: 'guide', label: 'Guide', title: 'Playback and MIDI only - never sent to YuE2' },
  { value: 'none', label: 'do not import', title: 'Leave this track out of the score' }
]

/** The grids the import quantises to (1/4 ... 1/64 notes). */
export const GRIDS = [4, 8, 16, 32, 64]

export interface TrackChoice {
  /** The 0-based index the route's mapping uses. */
  index: number
  /** The 1-based number the import report uses. */
  number: number
  name: string
  notes: number
  role: MidiRole
}

/** One row per track of the file; a track the file's name suggests keeps that role. */
export function choicesOf(tracks: MidiTrack[]): TrackChoice[] {
  return tracks.map((track) => ({
    index: track.index,
    number: track.index + 1,
    name: track.name,
    notes: track.notes,
    role: (track.role ?? 'none') as MidiRole
  }))
}

/** The mapping the route takes: every shown track, explicitly (``null``: do not import). */
export function mappingOf(choices: TrackChoice[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {}
  for (const choice of choices) mapping[String(choice.index)] = choice.role === 'none' ? null : choice.role
  return mapping
}

/** The grid a score suggests for foreign timing: its own unit, at most 1/64 (plan §10.3). */
export function defaultGrid(view: ScoreView | null): number {
  const unit = view?.model?.unit ?? view?.header?.unit ?? '1/16'
  const denominator = Number(unit.split('/')[1])
  const wanted = Number.isFinite(denominator) && denominator > 0 ? denominator : 16
  const fits = GRIDS.filter((grid) => grid <= wanted)
  return fits.length ? fits[fits.length - 1] : GRIDS[0]
}

/** Bytes as base64 (chunked: ``String.fromCharCode`` has an argument limit). */
export function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 0x2000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x2000))
  }
  return btoa(binary)
}

/** Base64 as bytes (the MIDI export's ``data``). */
export function fromBase64(text: string): Uint8Array {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}

/** Save bytes under ``name`` (the browser's own download). */
export function downloadBytes(name: string, bytes: Uint8Array, type = 'audio/midi'): void {
  const buffer = new ArrayBuffer(bytes.length)
  new Uint8Array(buffer).set(bytes)
  const url = URL.createObjectURL(new Blob([buffer], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.rel = 'noopener'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** What the dialog says about a track row (the report's numbering is 1-based). */
export function trackLabel(choice: TrackChoice): string {
  const name = choice.name.trim() || 'unnamed'
  return choice.notes === 1 ? `${name} · 1 note` : `${name} · ${choice.notes} notes`
}

/**
 * The lines under the track list: the report plus what happens to Guide notes - the file's
 * (``guideCount``; ``keep``: the dialog's *keep the Guide notes*) and the sheet's own
 * (``current``), which belong to the score the import replaces.
 */
export function summaryLines(
  report: string[],
  guideCount: number,
  keepsGuide: boolean,
  { current = 0, keep = true }: { current?: number; keep?: boolean } = {}
): string[] {
  const lines = [...report]
  if (guideCount) {
    lines.push(
      !keepsGuide
        ? `${guideCount} Guide note(s) in the file are not kept here (this sheet has no Guide track).`
        : keep
          ? `${guideCount} Guide note(s) in the file will be kept (never sent to YuE2).`
          : `${guideCount} Guide note(s) in the file are left out (keep the Guide notes is off).`
    )
  }
  if (keepsGuide && current) {
    const fate = guideCount && keep ? "replaced by the file's" : 'removed'
    lines.push(`The sheet's ${current} Guide note(s) belong to the replaced score and are ${fate} (Undo brings them back).`)
  }
  return lines
}
