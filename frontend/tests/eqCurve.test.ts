import { describe, expect, it } from 'vitest'

import {
  MAX_BANDS,
  addBand,
  curvePath,
  dbOf,
  describeBand,
  flat,
  hzOf,
  maxBandHz,
  moveBand,
  parseSettings,
  removeBand,
  scaleQ,
  serialize,
  setType,
  xOf,
  yOf
} from '../src/shared/eqCurve'

const PLOT = { width: 360, height: 150, maxHz: 20000 }

describe('EQ settings', () => {
  it('parses, defaults and serialises', () => {
    expect(parseSettings('')).toEqual(flat())
    expect(parseSettings('{bad')).toBeNull()
    expect(parseSettings('{"schema":"plenio.eq/1"}')).toBeNull()
    const parsed = parseSettings('{"preamp_db":-2,"bands":[{"frequency_hz":250,"gain_db":3}]}')!
    expect(parsed.preamp_db).toBe(-2)
    expect(parsed.bands[0]).toEqual({ id: 'band-1', enabled: true, type: 'peak', frequency_hz: 250, gain_db: 3, q: Math.SQRT1_2, slope: 1 })
    expect(parseSettings(serialize(parsed))).toEqual(parsed)
  })
})

describe('plot mapping', () => {
  it('maps frequency and gain both ways', () => {
    expect(xOf(PLOT, 20)).toBe(0)
    expect(xOf(PLOT, 20000)).toBeCloseTo(360)
    expect(hzOf(PLOT, xOf(PLOT, 1000))).toBeCloseTo(1000)
    expect(yOf(PLOT, 0)).toBe(75)
    expect(dbOf(PLOT, yOf(PLOT, 6))).toBeCloseTo(6)
    expect(yOf(PLOT, 99)).toBe(0) // clamped to the plot
    expect(curvePath(PLOT, [20, 20000], [0, 0])).toBe('M0.0,75.0 L360.0,75.0')
  })

  it('limits bands to 0.45 x the sample rate', () => {
    expect(maxBandHz(48000)).toBe(20000)
    expect(maxBandHz(22050)).toBeCloseTo(9922.5)
  })
})

describe('band edits', () => {
  it('adds, moves, scales, retypes and removes bands', () => {
    let s = addBand(flat(), 1234.56, 4.44)!
    expect(s.bands[0]).toMatchObject({ id: 'band-1', type: 'peak', frequency_hz: 1234.6, gain_db: 4.4, q: 1 })
    s = moveBand(s, 'band-1', 50000, 30)
    expect(s.bands[0]).toMatchObject({ frequency_hz: 20000, gain_db: 12 })
    s = moveBand(s, 'band-1', 10, -30, 22050)
    expect(s.bands[0]).toMatchObject({ frequency_hz: 20, gain_db: -12 })
    expect(scaleQ(s, 'band-1', 100).bands[0].q).toBe(10)
    expect(scaleQ(s, 'band-1', 0.01).bands[0].q).toBe(0.2)
    s = setType(s, 'band-1', 'highpass')
    expect(moveBand(s, 'band-1', 100, 6).bands[0].gain_db).toBe(-12) // no gain on a high-pass
    expect(removeBand(s, 'band-1').bands).toEqual([])
    expect(describeBand({ ...s.bands[0], type: 'peak', frequency_hz: 2500, gain_db: 3 })).toBe('peak 2.5 kHz +3 dB, Q 1')
  })

  it('refuses a ninth band and keeps ids unique', () => {
    let s = flat()
    for (let i = 0; i < MAX_BANDS; i++) s = addBand(s, 100 * (i + 1))!
    expect(addBand(s, 5000)).toBeNull()
    s = removeBand(s, 'band-3')
    const again = addBand(s, 5000)!
    expect(new Set(again.bands.map((b) => b.id)).size).toBe(MAX_BANDS)
  })
})
