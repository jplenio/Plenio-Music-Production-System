/**
 * The Stem Mixer's value and widget logic (M6/D12): parsing/serialising ``plenio.stem_mix/1``, the
 * strip defaults, mute/solo resolution, muted ranges and the peaks of the last run.
 */
import { describe, expect, it } from 'vitest'

import {
  BUSES,
  MAX_GAIN_DB,
  MIN_GAIN_DB,
  MIX_SCHEMA,
  REST,
  type MixValue,
  addRange,
  defaultNames,
  emptyStrip,
  formatGain,
  isAudible,
  isNeutral,
  normalizeRanges,
  parseMix,
  peaksFor,
  peaksOf,
  rangeAt,
  removeRange,
  serializeMix,
  stripNames,
  stripOf,
  withRange,
  withStrip,
  withoutRange
} from '../src/shared/stemMix'

const VALUE = JSON.stringify({
  schema: MIX_SCHEMA,
  strips: { vocals: { gain_db: -3, mute: true, reverb: 0.4 }, rest: { solo: true } },
  reverb: { preset: 'hall' },
  delay: { time_ms: 250, feedback: 0.4 }
})

describe('the mixer value', () => {
  it('parses, defaults and serialises without losing anything', () => {
    const mix = parseMix(VALUE)!
    expect(mix.schema).toBe(MIX_SCHEMA)
    expect(stripOf(mix, 'vocals')).toEqual({
      gain_db: -3,
      mute: true,
      solo: false,
      compression: 0,
      muted: [],
      reverb: 0.4,
      delay: 0,
      save: false
    })
    expect(stripOf(mix, 'drums')).toEqual(emptyStrip())
    expect(parseMix(serializeMix(mix))).toEqual(mix)
    expect(parseMix('')).toEqual({ schema: MIX_SCHEMA, strips: {} })
    expect(parseMix('{broken')).toBeNull()
    expect(parseMix('{"strips":{}}')).toBeNull()
    expect(BUSES).toEqual(['reverb', 'delay'])
    expect([MIN_GAIN_DB, MAX_GAIN_DB]).toEqual([-60, 12])
  })

  it('writes only what differs from neutral and keeps the buses', () => {
    let mix: MixValue = { schema: MIX_SCHEMA, strips: {}, reverb: { preset: 'plate' } }
    mix = withStrip(mix, 'vocals', { ...emptyStrip(), gain_db: 2 })
    expect(JSON.parse(serializeMix(mix))).toEqual({
      schema: MIX_SCHEMA,
      strips: { vocals: { gain_db: 2 } },
      reverb: { preset: 'plate' }
    })
    mix = withStrip(mix, 'vocals', emptyStrip())
    expect(JSON.parse(serializeMix(mix))).toEqual({ schema: MIX_SCHEMA, strips: {}, reverb: { preset: 'plate' } })
    expect(isNeutral(emptyStrip())).toBe(true)
    expect(isNeutral({ ...emptyStrip(), mute: true })).toBe(false)
  })

  it('keeps the save flag of a strip that should be written as its own file', () => {
    const mix = withStrip({ schema: MIX_SCHEMA, strips: {} }, 'drums', { ...emptyStrip(), save: true })
    expect(JSON.parse(serializeMix(mix)).strips.drums).toEqual({ save: true })
    const again = parseMix(serializeMix(mix))!
    expect(stripOf(again, 'drums').save).toBe(true)
    expect(stripOf(again, 'vocals').save).toBe(false)
    expect(isNeutral({ ...emptyStrip(), save: true })).toBe(false)
  })

  it('resolves mute and solo like the backend', () => {
    const mix = parseMix(VALUE)!  // vocals: mute, rest: solo
    expect(isAudible(mix, 'vocals', ['vocals', 'rest'])).toBe(false)
    expect(isAudible(mix, 'rest', ['vocals', 'rest'])).toBe(true)
    expect(isAudible(mix, 'drums', ['vocals', 'rest'])).toBe(false) // any solo silences the others
    const plain = parseMix(JSON.stringify({ schema: MIX_SCHEMA, strips: { drums: { mute: true } } }))!
    expect(isAudible(plain, 'drums', ['drums', 'rest'])).toBe(false)
    expect(isAudible(plain, 'rest', ['drums', 'rest'])).toBe(true)
    expect(formatGain(0)).toBe('+0.0' === '+0.0' ? '0.0' : '')
    expect(formatGain(2.5)).toBe('+2.5')
    expect(formatGain(-61)).toBe('-∞')
  })
})

describe('muted ranges', () => {
  it('merges, clips and removes them', () => {
    expect(normalizeRanges([[1, 2], [2.5, 3], [5, 6]])).toEqual([[1, 2], [2.5, 3], [5, 6]])
    expect(normalizeRanges([[1, 2], [2, 3]])).toEqual([[1, 3]])
    expect(normalizeRanges([[1, 2]], 1.5)).toEqual([[1, 1.5]])
    expect(normalizeRanges([[3, 1], [-2, 0.5]])).toEqual([[0, 0.5], [1, 3]])
    expect(normalizeRanges([[3, 1], [-2, 1]])).toEqual([[0, 3]]) // clipping can make neighbours touch
    expect(normalizeRanges([])).toEqual([])
    expect(addRange([[1, 2]], 2.5, 3)).toEqual([[1, 2], [2.5, 3]])
    expect(addRange([[1, 2]], 2, 3)).toEqual([[1, 3]])
    expect(rangeAt([[1, 2], [4, 5]], 4.5)).toBe(1)
    expect(rangeAt([[1, 2]], 3)).toBe(-1)
    expect(removeRange([[1, 2], [4, 5]], 0)).toEqual([[4, 5]])
  })

  it('writes a range into the strip and takes it out again', () => {
    const mix: MixValue = { schema: MIX_SCHEMA, strips: {} }
    const added = withRange(mix, 'drums', 4, 2)
    expect(stripOf(added, 'drums').muted).toEqual([[2, 4]])
    expect(JSON.parse(serializeMix(added)).strips.drums.muted).toEqual([[2, 4]])
    expect(stripOf(withoutRange(added, 'drums', 3), 'drums').muted).toEqual([])
    expect(withoutRange(added, 'drums', 99)).toBe(added)
  })
})

describe('the waveform data of the last run', () => {
  it('reads the peaks of the payload and resamples them to the bar width', () => {
    const output = {
      plenio_stems: [
        { stems: ['vocals', 'drums', 'bass', 'other', REST], seconds: 8.0, peaks: { vocals: [-0.5, 0.25] } }
      ]
    }
    const peaks = peaksOf(output)
    expect(peaks.vocals).toEqual([0.5, 0.25])
    expect(peaksOf({})).toEqual({})
    expect(peaksFor(peaks, 'vocals', 4)).toEqual([0.5, 0.5, 0.25, 0.25])
    expect(peaksFor(peaks, 'drums', 3)).toEqual([0, 0, 0])
    expect(stripNames({ schema: MIX_SCHEMA, strips: { drums: {} } }, null)).toEqual([
      'vocals',
      'drums',
      'bass',
      'other',
      REST
    ])
    expect(defaultNames()).toEqual(['vocals', 'drums', 'bass', 'other', REST])
    // after a run the strips follow what the separator produced
    expect(stripNames(null, { stems: ['vocals', 'drums', 'bass', 'other', REST] })).toEqual([
      'vocals',
      'drums',
      'bass',
      'other',
      REST
    ])
    expect(stripNames(null, { stems: ['vocals', 'instrumental'] })).toEqual(['vocals', 'instrumental', REST])
  })
})
