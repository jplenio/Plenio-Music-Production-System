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
}

export function xOf(plot: Plot, hz: number): number {
  return (Math.log(clamp(hz, MIN_HZ, plot.maxHz) / MIN_HZ) / Math.log(plot.maxHz / MIN_HZ)) * plot.width
}

export function hzOf(plot: Plot, x: number): number {
  return MIN_HZ * (plot.maxHz / MIN_HZ) ** clamp(x / plot.width, 0, 1)
}

export function yOf(plot: Plot, db: number): number {
  return (1 - (clamp(db, -PLOT_DB, PLOT_DB) + PLOT_DB) / (2 * PLOT_DB)) * plot.height
}

export function dbOf(plot: Plot, y: number): number {
  return (1 - clamp(y / plot.height, 0, 1)) * 2 * PLOT_DB - PLOT_DB
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
  const gain = GAIN_TYPES.includes(band.type) ? ` ${band.gain_db > 0 ? '+' : ''}${band.gain_db} dB` : ''
  return `${band.type.replace('_', ' ')} ${hz}${gain}, Q ${band.q}`
}
