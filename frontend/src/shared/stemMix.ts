/**
 * The Stem Mixer's value and the pure parts of its widget (Phase 11C D12, plan §6.3).
 *
 * ``plenio.stem_mix/1`` is the one stored value (the node's ``mix`` widget): per strip gain, mute,
 * solo, compression amount, muted time ranges and the reverb/delay sends, plus the bus settings. The
 * backend owns validation and the mixdown (`core.audio.stems`); this module only reads, writes and
 * displays the value - a second mixer model does not exist.
 */

import type { ScoreView } from './scoreView'

export const MIX_SCHEMA = 'plenio.stem_mix/1'
export const REST = 'rest'
export const BUSES = ['reverb', 'delay'] as const
export type Bus = (typeof BUSES)[number]

export const MIN_GAIN_DB = -60
export const MAX_GAIN_DB = 12

export interface Strip {
  gain_db: number
  mute: boolean
  solo: boolean
  compression: number
  muted: [number, number][]
  reverb: number
  delay: number
}

export interface MixValue {
  schema: typeof MIX_SCHEMA
  strips: Record<string, Partial<Strip>>
  reverb?: Record<string, unknown>
  delay?: Record<string, unknown>
}

export function emptyStrip(): Strip {
  return { gain_db: 0, mute: false, solo: false, compression: 0, muted: [], reverb: 0, delay: 0 }
}

/** A strip as the widget shows it: the stored values or their defaults. */
export function stripOf(mix: MixValue | null, name: string): Strip {
  const raw = mix?.strips?.[name] ?? {}
  return {
    gain_db: typeof raw.gain_db === 'number' ? raw.gain_db : 0,
    mute: raw.mute === true,
    solo: raw.solo === true,
    compression: typeof raw.compression === 'number' ? raw.compression : 0,
    muted: Array.isArray(raw.muted) ? raw.muted.map((range) => [range[0], range[1]] as [number, number]) : [],
    reverb: typeof raw.reverb === 'number' ? raw.reverb : 0,
    delay: typeof raw.delay === 'number' ? raw.delay : 0
  }
}

/** ``true`` when the strip holds no setting at all (it is then left out of the value). */
export function isNeutral(strip: Strip): boolean {
  const defaults = emptyStrip()
  return (
    strip.gain_db === defaults.gain_db &&
    strip.mute === defaults.mute &&
    strip.solo === defaults.solo &&
    strip.compression === defaults.compression &&
    strip.muted.length === 0 &&
    strip.reverb === defaults.reverb &&
    strip.delay === defaults.delay
  )
}

export function parseMix(text: unknown): MixValue | null {
  if (typeof text !== 'string' || !text.trim()) return { schema: MIX_SCHEMA, strips: {} }
  try {
    const data = JSON.parse(text) as MixValue
    if (data?.schema !== MIX_SCHEMA || typeof data.strips !== 'object' || data.strips === null) return null
    return data
  } catch {
    return null
  }
}

/** The value text: only strips that differ from neutral, buses only when they carry settings. */
export function serializeMix(mix: MixValue): string {
  const strips: Record<string, Partial<Strip>> = {}
  for (const name of Object.keys(mix.strips)) {
    if (!name) continue
    if (isNeutral(stripOf(mix, name))) continue
    const value: Partial<Strip> = {}
    const full = stripOf(mix, name)
    if (full.gain_db) value.gain_db = full.gain_db
    if (full.mute) value.mute = true
    if (full.solo) value.solo = true
    if (full.compression) value.compression = full.compression
    if (full.muted.length) value.muted = full.muted
    if (full.reverb) value.reverb = full.reverb
    if (full.delay) value.delay = full.delay
    strips[name] = value
  }
  const result: MixValue = { schema: MIX_SCHEMA, strips }
  if (mix.reverb && Object.keys(mix.reverb).length) result.reverb = mix.reverb
  if (mix.delay && Object.keys(mix.delay).length) result.delay = mix.delay
  return JSON.stringify(result)
}

/** Write one strip back into the value (the widget's edits). */
export function withStrip(mix: MixValue, name: string, strip: Strip): MixValue {
  const strips = { ...mix.strips }
  if (isNeutral(strip)) delete strips[name]
  else strips[name] = strip
  return { ...mix, strips }
}

// --- audible state ------------------------------------------------------------------------------

/** Does this strip sound? Solo beats mute; any solo silences every strip that is not soloed. */
export function isAudible(mix: MixValue | null, name: string, names: string[]): boolean {
  const soloing = names.some((other) => stripOf(mix, other).solo)
  const strip = stripOf(mix, name)
  return soloing ? strip.solo : !strip.mute
}

export function formatGain(gainDb: number): string {
  if (gainDb <= MIN_GAIN_DB) return '-∞'
  return `${gainDb > 0 ? '+' : ''}${gainDb.toFixed(1)}`
}

// --- muted ranges -------------------------------------------------------------------------------

/** Merge overlapping/touching ranges and clip them to ``[0, duration]``. */
export function normalizeRanges(ranges: [number, number][], duration: number | null = null): [number, number][] {
  const clean = ranges
    .filter((range) => Array.isArray(range) && range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1]))
    .map((range) => [Math.max(0, Math.min(range[0], range[1])), Math.max(range[0], range[1])] as [number, number])
    .filter((range) => range[1] - range[0] > 1e-6)
    .sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const range of clean) {
    const last = merged[merged.length - 1]
    if (last && range[0] <= last[1] + 1e-6) last[1] = Math.max(last[1], range[1])
    else merged.push([...range] as [number, number])
  }
  if (duration !== null && duration > 0) {
    return merged
      .map(([start, end]) => [Math.min(start, duration), Math.min(end, duration)] as [number, number])
      .filter(([start, end]) => end - start > 1e-6)
  }
  return merged
}

/** Add a range (a drag in the waveform), merging it with the existing ones. */
export function addRange(ranges: [number, number][], start: number, end: number): [number, number][] {
  return normalizeRanges([...ranges, [start, end]])
}

/** The range under ``time`` (for the "remove" click), or ``null``. */
export function rangeAt(ranges: [number, number][], time: number): number {
  return ranges.findIndex(([start, end]) => start <= time && time <= end)
}

export function removeRange(ranges: [number, number][], index: number): [number, number][] {
  if (index < 0) return ranges
  return ranges.filter((_range, position) => position !== index)
}

/** A muted range as the widget writes it into the value: added to the strip's own list. */
export function withRange(mix: MixValue, name: string, start: number, end: number): MixValue {
  const strip = stripOf(mix, name)
  return withStrip(mix, name, { ...strip, muted: addRange(strip.muted, start, end) })
}

export function withoutRange(mix: MixValue, name: string, time: number): MixValue {
  const strip = stripOf(mix, name)
  const index = rangeAt(strip.muted, time)
  if (index < 0) return mix
  return withStrip(mix, name, { ...strip, muted: removeRange(strip.muted, index) })
}

// --- the waveform the widget draws --------------------------------------------------------------

export interface StemPeaks {
  name: string
  peaks: number[]
}

/** Peaks from the node's UI payload (``plenio_stems``), per stem, in the strip order. */
export function peaksOf(payload: unknown): Record<string, number[]> {
  const items = (payload as { plenio_stems?: { peaks?: Record<string, number[]>; stems?: string[] }[] } | null)
    ?.plenio_stems
  const last = items?.[items.length - 1]
  if (!last?.peaks) return {}
  const result: Record<string, number[]> = {}
  for (const [name, values] of Object.entries(last.peaks)) {
    if (Array.isArray(values) && values.length) result[name] = values.map((value) => Math.abs(Number(value) || 0))
  }
  return result
}

/** Peak values for a strip: the run's own peaks, else a flat line (no run yet). */
export function peaksFor(peaks: Record<string, number[]>, name: string, width = 200): number[] {
  const values = peaks[name]
  if (!values?.length) return new Array(width).fill(0)
  if (values.length === width) return values
  return Array.from({ length: width }, (_unused, index) => values[Math.floor((index * values.length) / width)] ?? 0)
}

/** Where the playhead/range sits in a score of ``duration`` seconds (0 ... 1). */
export function fractionOf(seconds: number, duration: number | null): number {
  if (!duration || duration <= 0) return 0
  return Math.min(1, Math.max(0, seconds / duration))
}

/** The strip names of a mix: the stems of the last run plus ``rest`` (plan §6.2). */
export function stripNames(mix: MixValue | null, view: ScoreView | null): string[] {
  const stored = Object.keys(mix?.strips ?? {})
  const base = [REST, ...stored.filter((name) => name !== REST)]
  const stems = (view as unknown as { stems?: string[] } | null)?.stems
  if (Array.isArray(stems) && stems.length) return [...stems, REST]
  return base.length ? base : [REST]
}
