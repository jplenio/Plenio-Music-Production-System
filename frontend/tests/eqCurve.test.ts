import { describe, expect, it } from 'vitest'

import {
  type Band,
  EqHistory,
  MAX_BANDS,
  PLOT_DB,
  addBand,
  bandChip,
  curvePath,
  dbOf,
  describeBand,
  editBand,
  fineValue,
  flat,
  hzOf,
  maxBandHz,
  moveBand,
  parseField,
  parseSettings,
  plotDb,
  removeBand,
  resetBandGain,
  scaleQ,
  serialize,
  setType,
  spectrumPath,
  withRange,
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

describe('the panel helpers (M4/D8)', () => {
  const PANEL = { width: 560, height: 260, maxHz: 20000 }

  it('scales the dB axis with the gain range', () => {
    expect(plotDb(PANEL)).toBe(PLOT_DB) // the default stays for callers that pass no range
    expect(withRange(PANEL, 6).db).toBe(8)
    expect(withRange(PANEL, 18).db).toBe(20)
    expect(yOf(withRange(PANEL, 6), 8)).toBe(0)
    expect(dbOf(withRange(PANEL, 6), 0)).toBe(8)
    expect(yOf(PANEL, 0)).toBe(130)
  })

  it('damps a drag while Shift is held', () => {
    expect(fineValue(100, 200, false)).toBe(200)
    expect(fineValue(100, 200, true)).toBe(120)
  })

  it('edits one band field of the strip editor at a time, clamped', () => {
    let s = addBand(flat(), 1000, 3)! as { schema: string; preamp_db: number; bands: Band[] }
    s = editBand(s, 'band-1', { type: 'high_shelf' })
    expect(s.bands[0].type).toBe('high_shelf')
    s = editBand(s, 'band-1', { frequency_hz: 99999, gain_db: 40, q: 100 })
    expect(s.bands[0]).toMatchObject({ frequency_hz: 20000, gain_db: 12, q: 10 })
    s = editBand(s, 'band-1', { enabled: false })
    expect(s.bands[0].enabled).toBe(false)
    expect(editBand(s, 'band-2', { gain_db: 6 })).toEqual(s) // an unknown id changes nothing
    expect(resetBandGain(s, 'band-1').bands[0].gain_db).toBe(0)
  })

  it('reads typed band fields and never writes NaN', () => {
    expect(parseField('1200')).toBe(1200)
    expect(parseField(' 1,5 ')).toBe(1.5)
    expect(parseField('+3 dB')).toBe(3)
    expect(parseField('1.2k', { kilo: true })).toBe(1200)
    expect(parseField('2 kHz', { kilo: true })).toBe(2000)
    for (const text of ['', 'abc', '1.2k', '12..5', '1e']) expect(parseField(text)).toBeNull()
    const s = addBand(flat(), 1000, 3)!
    const edited = editBand(s, 'band-1', { frequency_hz: Number('abc'), gain_db: Number.NaN, q: Number.POSITIVE_INFINITY })
    expect(edited.bands[0]).toMatchObject({ frequency_hz: s.bands[0].frequency_hz, gain_db: s.bands[0].gain_db, q: s.bands[0].q })
    expect(serialize(edited)).not.toContain('null')
    // the shelf slope stays in the backend's range (0.25 ... 1)
    expect(editBand(s, 'band-1', { slope: 4 }).bands[0].slope).toBe(1)
  })

  it('labels the band chips of the strip', () => {
    const band = {
      id: 'band-2',
      enabled: true,
      type: 'peak' as const,
      frequency_hz: 1200,
      gain_db: 2,
      q: 1,
      slope: 1
    }
    expect(bandChip(band, 1)).toBe('● 2 Bell 1.20 kHz +2.0 dB Q 1')
    expect(bandChip({ ...band, type: 'highpass', enabled: false }, 0)).toBe('● 1 Low cut 1.20 kHz Q 1 (off)')
    expect(bandChip({ ...band, type: 'low_shelf' }, 0)).toBe('● 1 Low shelf 1.20 kHz +2.0 dB') // a slope, no Q
    // a match proposal's exact values are rounded for the strip (they showed 16 digits)
    expect(bandChip({ ...band, q: 0.3982428666120445, gain_db: -0.6532645 }, 0)).toBe('● 1 Bell 1.20 kHz -0.7 dB Q 0.4')
    expect(describeBand({ ...band, q: 1.4321374925, gain_db: 1.2649 })).toBe('peak 1.2 kHz +1.3 dB, Q 1.43')
  })

  it('draws the spectrum area behind the curve and refuses mismatched data', () => {
    const path = spectrumPath(PANEL, [20, 200, 2000, 20000], [-60, -40, -20, -70])
    expect(path.startsWith('M0.0,')).toBe(true)
    expect(path.endsWith('L560.0,256.0 L0,256.0 Z')).toBe(true)
    expect(path.split('L').length).toBe(6)
    expect(spectrumPath(PANEL, [20, 200], [-40])).toBe('')
    expect(spectrumPath(PANEL, [], [])).toBe('')
    expect(spectrumPath(PANEL, [20, 200], [Number.NaN, Number.NaN])).toBe('')
  })

  it('keeps a widget-local undo history of the bands', () => {
    const history = new EqHistory(flat())
    expect([history.canUndo, history.canRedo]).toEqual([false, false])
    const one = addBand(flat(), 100)!
    history.push(one)
    history.push(one) // a duplicate changes nothing
    expect(history.canUndo).toBe(true)
    const two = addBand(one, 5000)!
    history.push(two)
    expect(serialize(history.undo() ?? flat())).toBe(serialize(one))
    expect(serialize(history.redo() ?? flat())).toBe(serialize(two))
    expect(history.canRedo).toBe(false)
    expect(history.undo()).not.toBeNull()
    history.push(addBand(one, 300)!)
    expect(history.canRedo).toBe(false) // a new edit drops the redo branch
    history.reset(flat())
    expect([history.canUndo, history.canRedo]).toEqual([false, false])
    expect(serialize(history.current)).toBe(serialize(flat()))
  })
})
