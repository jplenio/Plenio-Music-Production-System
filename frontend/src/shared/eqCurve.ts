/**
 * Pure helpers of the EQ curve widget: the plenio.eq/1 settings, the log-frequency / dB mapping of
 * the plot, and band edits. The response itself always comes from the backend (/plenio/eq/response),
 * so the curve is exactly what the node applies.
 */

export const SCHEMA = 'plenio.eq/1'
export const MAX_BANDS = 8
export const MIN_HZ = 20
export const MAX_HZ = 20000
export const MAX_GAIN_DB = 12
export const PLOT_DB = 15
export type BandType = 'peak' | 'low_shelf' | 'high_shelf' | 'highpass' | 'lowpass' | 'notch'
export const GAIN_TYPES: BandType[] = ['peak', 'low_shelf', 'high_shelf']
/** The types whose Q the backend uses (bell width, notch width, the cuts' resonance); shelves use ``slope``. */
export const Q_TYPES: BandType[] = ['peak', 'notch', 'highpass', 'lowpass']
/** The backend's ranges (``core.audio.eq``): Q 0.2 ... 10, shelf slope 0.25 ... 1. */
export const Q_RANGE: [number, number] = [0.2, 10]
export const SLOPE_RANGE: [number, number] = [0.25, 1]

export interface Band {
  id: string
  enabled: boolean
  type: BandType
  frequency_hz: number
  gain_db: number
  q: number
  slope: number
}

export interface EqSettings {
  schema: string
  preamp_db: number
  bands: Band[]
}

export function flat(): EqSettings {
  return { schema: SCHEMA, preamp_db: 0, bands: [] }
}

/** Settings from the widget's JSON text; invalid text gives ``null`` (the backend reports the error). */
export function parseSettings(text: unknown): EqSettings | null {
  if (typeof text !== 'string' || !text.trim()) return flat()
  try {
    const data = JSON.parse(text) as Partial<EqSettings>
    if (typeof data !== 'object' || data === null || !Array.isArray(data.bands)) return null
    return {
      schema: SCHEMA,
      preamp_db: typeof data.preamp_db === 'number' ? data.preamp_db : 0,
      bands: data.bands.map((band, index) => ({
        id: typeof band.id === 'string' && band.id ? band.id : `band-${index + 1}`,
        enabled: band.enabled !== false,
        type: (band.type ?? 'peak') as BandType,
        frequency_hz: Number(band.frequency_hz ?? 1000),
        gain_db: Number(band.gain_db ?? 0),
        q: Number(band.q ?? Math.SQRT1_2),
        slope: Number(band.slope ?? 1)
      }))
    }
  } catch {
    return null
  }
}

export function serialize(settings: EqSettings): string {
  return JSON.stringify(settings)
}

const round = (value: number, digits: number) => Number(value.toFixed(digits))

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

// --- plot mapping --------------------------------------------------------------------------------

export interface Plot {
  width: number
  height: number
  maxHz: number
  /** Half-height of the dB axis (default ``PLOT_DB``); the gain-range toggle changes it. */
  db?: number
}

export function plotDb(plot: Plot): number {
  return plot.db ?? PLOT_DB
}

/** The dB axis of a gain range: a little headroom above the handles' limit. */
export type GainRange = 6 | 12 | 18
export const GAIN_RANGES: GainRange[] = [6, 12, 18]
export const PLOT_DB_BY_RANGE: Record<GainRange, number> = { 6: 8, 12: 14, 18: 20 }

/** ``plot`` with the dB axis of a gain range. */
export function withRange(plot: Plot, range: GainRange): Plot {
  return { ...plot, db: PLOT_DB_BY_RANGE[range] ?? PLOT_DB }
}

export function xOf(plot: Plot, hz: number): number {
  return (Math.log(clamp(hz, MIN_HZ, plot.maxHz) / MIN_HZ) / Math.log(plot.maxHz / MIN_HZ)) * plot.width
}

export function hzOf(plot: Plot, x: number): number {
  return MIN_HZ * (plot.maxHz / MIN_HZ) ** clamp(x / plot.width, 0, 1)
}

export function yOf(plot: Plot, db: number): number {
  const span = plotDb(plot)
  return (1 - (clamp(db, -span, span) + span) / (2 * span)) * plot.height
}

export function dbOf(plot: Plot, y: number): number {
  const span = plotDb(plot)
  return (1 - clamp(y / plot.height, 0, 1)) * 2 * span - span
}

/** A drag with Shift: the movement is damped, so a fine correction stays possible. */
export function fineValue(from: number, to: number, fine: boolean): number {
  return fine ? from + (to - from) * 0.2 : to
}

/** SVG path of a response curve. */
export function curvePath(plot: Plot, frequencies: number[], response: number[]): string {
  return frequencies
    .map((hz, index) => `${index ? 'L' : 'M'}${xOf(plot, hz).toFixed(1)},${yOf(plot, response[index] ?? 0).toFixed(1)}`)
    .join(' ')
}

/** Upper frequency limit of the bands at ``sampleRate`` (0.45 x the rate, at most 20 kHz). */
export function maxBandHz(sampleRate: number): number {
  return Math.min(MAX_HZ, 0.45 * sampleRate)
}

// --- band edits ------------------------------------------------------------------------------------

function nextId(settings: EqSettings): string {
  const used = new Set(settings.bands.map((band) => band.id))
  let index = settings.bands.length + 1
  while (used.has(`band-${index}`)) index++
  return `band-${index}`
}

/** Add a peak band at ``hz`` (``null`` when all eight bands are used). */
export function addBand(settings: EqSettings, hz: number, gainDb = 0, sampleRate = 48000): EqSettings | null {
  if (settings.bands.length >= MAX_BANDS) return null
  const band: Band = {
    id: nextId(settings),
    enabled: true,
    type: 'peak',
    frequency_hz: round(clamp(hz, MIN_HZ, maxBandHz(sampleRate)), 1),
    gain_db: round(clamp(gainDb, -MAX_GAIN_DB, MAX_GAIN_DB), 1),
    q: 1,
    slope: 1
  }
  return { ...settings, bands: [...settings.bands, band] }
}

export function moveBand(settings: EqSettings, id: string, hz: number, gainDb: number, sampleRate = 48000): EqSettings {
  return {
    ...settings,
    bands: settings.bands.map((band) =>
      band.id !== id
        ? band
        : {
            ...band,
            frequency_hz: round(clamp(hz, MIN_HZ, maxBandHz(sampleRate)), 1),
            gain_db: GAIN_TYPES.includes(band.type) ? round(clamp(gainDb, -MAX_GAIN_DB, MAX_GAIN_DB), 1) : band.gain_db
          }
    )
  }
}

/** Widen (``factor`` < 1) or narrow (> 1) a band; Q stays within 0.2 ... 10. */
export function scaleQ(settings: EqSettings, id: string, factor: number): EqSettings {
  return {
    ...settings,
    bands: settings.bands.map((band) => (band.id === id ? { ...band, q: round(clamp(band.q * factor, 0.2, 10), 3) } : band))
  }
}

export function removeBand(settings: EqSettings, id: string): EqSettings {
  return { ...settings, bands: settings.bands.filter((band) => band.id !== id) }
}

export function setType(settings: EqSettings, id: string, type: BandType): EqSettings {
  return { ...settings, bands: settings.bands.map((band) => (band.id === id ? { ...band, type } : band)) }
}

export function describeBand(band: Band): string {
  const hz = band.frequency_hz >= 1000 ? `${round(band.frequency_hz / 1000, 2)} kHz` : `${Math.round(band.frequency_hz)} Hz`
  const gain = GAIN_TYPES.includes(band.type) ? ` ${band.gain_db > 0 ? '+' : ''}${round(band.gain_db, 1)} dB` : ''
  return `${band.type.replace('_', ' ')} ${hz}${gain}, Q ${round(band.q, 2)}`
}

/** The chip of a band in the strip under the curve: ``● 2 Bell 1.20 kHz +2.0 dB Q 1.0``. */
export function bandChip(band: Band, index: number): string {
  const name = BAND_NAMES[band.type] ?? band.type
  const hz = band.frequency_hz >= 1000 ? `${(band.frequency_hz / 1000).toFixed(2)} kHz` : `${Math.round(band.frequency_hz)} Hz`
  const gain = GAIN_TYPES.includes(band.type) ? ` ${band.gain_db > 0 ? '+' : ''}${band.gain_db.toFixed(1)} dB` : ''
  const shape = Q_TYPES.includes(band.type) ? ` Q ${round(band.q, 2)}` : ''
  return `● ${index + 1} ${name} ${hz}${gain}${shape}${band.enabled ? '' : ' (off)'}`
}

/** The names of the band types as the band strip shows them. */
export const BAND_NAMES: Record<BandType, string> = {
  peak: 'Bell',
  low_shelf: 'Low shelf',
  high_shelf: 'High shelf',
  highpass: 'Low cut',
  lowpass: 'High cut',
  notch: 'Notch'
}

/**
 * A number typed into a band field: ``1200``, ``1.2k``, ``1,5`` (a decimal comma), ``+3 dB``,
 * ``2 kHz``. ``null`` when the text is not a number - the field then keeps the band's value
 * instead of writing ``NaN`` (which serialises as ``null`` and breaks the node's value).
 */
export function parseField(text: string, { kilo = false }: { kilo?: boolean } = {}): number | null {
  let value = text.trim().replace(',', '.').replace(/\s*(hz|db)$/i, '')
  let factor = 1
  if (kilo && /k$/i.test(value)) {
    factor = 1000
    value = value.slice(0, -1).trim()
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(value)) return null
  const number = Number(value) * factor
  return Number.isFinite(number) ? number : null
}

/** ``value`` as a finite number, else ``fallback`` (a band never takes ``NaN``). */
function finiteOr(value: unknown, fallback: number): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

/** One field of a band, edited in the strip's inline editor (clamped like a drag). */
export function editBand(
  settings: EqSettings,
  id: string,
  patch: Partial<Band>,
  sampleRate = 48000
): EqSettings {
  return {
    ...settings,
    bands: settings.bands.map((band) => {
      if (band.id !== id) return band
      const next = { ...band, ...patch }
      return {
        ...next,
        frequency_hz: round(clamp(finiteOr(next.frequency_hz, band.frequency_hz), MIN_HZ, maxBandHz(sampleRate)), 1),
        gain_db: round(clamp(finiteOr(next.gain_db, band.gain_db), -MAX_GAIN_DB, MAX_GAIN_DB), 1),
        q: round(clamp(finiteOr(next.q, band.q), Q_RANGE[0], Q_RANGE[1]), 3),
        slope: round(clamp(finiteOr(next.slope, band.slope), SLOPE_RANGE[0], SLOPE_RANGE[1]), 2),
        enabled: next.enabled !== false
      }
    })
  }
}

/** A handle that was double-clicked: gain back to 0 (filters keep their gain). */
export function resetBandGain(settings: EqSettings, id: string): EqSettings {
  return editBand(settings, id, { gain_db: 0 })
}

// --- the spectrum behind the curve ------------------------------------------------------------------

/**
 * A filled path of a power spectrum (dB), normalised so that its own maximum sits at ``top_db``.
 * The spectrum is a *shape*, not a loudness reading: it appears behind the curve as a reference.
 */
export function spectrumPath(
  plot: Plot,
  frequencies: number[],
  powerDb: number[],
  { heightFraction = 0.7 }: { heightFraction?: number } = {}
): string {
  if (!frequencies.length || frequencies.length !== powerDb.length) return ''
  const values = powerDb.filter((value) => Number.isFinite(value))
  if (!values.length) return ''
  const high = Math.max(...values)
  const low = Math.min(...values)
  const span = Math.max(high - low, 1e-6)
  // the shape sits in the lower part of the plot: a silence-gated profile is not a level reading
  const bottom = plot.height - 4
  const top = bottom - Math.max(12, plot.height * clamp(heightFraction, 0.1, 0.95))
  const points = frequencies.map((hz, index) => {
    const value = powerDb[index]
    const norm = Number.isFinite(value) ? (value - low) / span : 0
    return `${xOf(plot, hz).toFixed(1)},${(bottom - norm * (bottom - top)).toFixed(1)}`
  })
  return `M${points.join(' L')} L${plot.width.toFixed(1)},${bottom.toFixed(1)} L0,${bottom.toFixed(1)} Z`
}

// --- undo history of the bands -----------------------------------------------------------------------

/** A small history of ``plenio.eq/1`` settings (widget-local; the widget value is the store). */
export class EqHistory {
  private entries: EqSettings[]
  private index = 0

  constructor(initial: EqSettings, private readonly limit = 50) {
    this.entries = [initial]
  }

  get current(): EqSettings {
    return this.entries[this.index]
  }

  get canUndo(): boolean {
    return this.index > 0
  }

  get canRedo(): boolean {
    return this.index < this.entries.length - 1
  }

  /** Record a new state (a duplicate of the current one is ignored). */
  push(settings: EqSettings): void {
    if (serialize(settings) === serialize(this.current)) return
    this.entries = this.entries.slice(0, this.index + 1)
    this.entries.push(settings)
    if (this.entries.length > this.limit) this.entries.shift()
    this.index = this.entries.length - 1
  }

  undo(): EqSettings | null {
    if (!this.canUndo) return null
    this.index -= 1
    return this.current
  }

  redo(): EqSettings | null {
    if (!this.canRedo) return null
    this.index += 1
    return this.current
  }

  reset(settings: EqSettings): void {
    this.entries = [settings]
    this.index = 0
  }
}
