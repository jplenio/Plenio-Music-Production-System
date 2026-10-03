/**
 * A cover's sung pitch in the piano roll (node Sung Pitch): the curve laid onto the score's bars where the
 * timeline puts the recording, broken where nothing is sung or the recording jumps, and moved onto the
 * notes' octave (SheetSage2 often notates the melody an octave away from the singing).
 */
import { describe, expect, it } from 'vitest'

import type { ScoreModelView } from '../src/shared/scoreView'
import { curveOf, curveRuns, octaveOffset, sourceSecondOfUnit, sungAt } from '../src/sheet-editor/score/sungPitch'

// two bars of 16 units; the source sings bar 1 in 0-2 s and bar 2 in 2-4 s; a curve every 0.5 s
const model = {
  measures: [
    { n: 1, onset: 0, length: 16, meter: '4/4', key: 'C' },
    { n: 2, onset: 16, length: 16, meter: '4/4', key: 'C' }
  ],
  tracks: {
    vocal: Array.from({ length: 8 }, (_, i) => ({ id: `vocal:${i * 4}`, onset: i * 4, duration: 4, pitch: 72, segments: [] })),
    ins: [],
    chords: []
  }
} as unknown as ScoreModelView
const bars: [number, number, string][] = [
  [0, 2, '4/4'],
  [2, 4, '4/4']
]
const curve = { rate: 2, start: 0, midi: [60, 60.2, null, 59.9, 60, 60.1, 60, 60] }

describe('the sung pitch', () => {
  it('reads the payload or says there is none', () => {
    expect(curveOf({ problem: 'no model' })).toBeNull()
    expect(curveOf({ rate: 2, start: 0, midi: [60] })).toEqual({ rate: 2, start: 0, midi: [60] })
    expect(sungAt(curve, 1)).toBe(null)
    expect(sungAt(curve, 0.5)).toBe(60.2)
    expect(sourceSecondOfUnit(model, bars, 24)).toBe(3)
  })

  it('finds the octave that brings the singing onto the notes', () => {
    expect(octaveOffset(model, bars, curve)).toBe(12)
    expect(octaveOffset(model, bars, { ...curve, midi: curve.midi.map((m) => (m === null ? null : m + 12)) })).toBe(0)
  })

  it('draws runs in score units, broken where nothing is sung and where the recording jumps', () => {
    const runs = curveRuns(model, bars, curve, 0, 1, 12)
    expect(runs).toEqual([
      [
        [0, 72],
        [4, 72.2]
      ],
      [
        [12, 71.9],
        [16, 72],
        [20, 72.1],
        [24, 72],
        [28, 72]
      ]
    ])
    // an arranged cover: bar 2 is bar 1 again - the curve jumps back there
    const jumped = curveRuns(model, [bars[0], bars[0]], curve, 0, 1)
    expect(jumped.map((run) => run[0][0])).toEqual([0, 16])
  })
})
