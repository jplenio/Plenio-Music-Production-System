/** The time the listener hears (phase 7.4): the playing time less the reported latency and the listener's offset. */
import { describe, expect, it } from 'vitest'

import { heardTime } from '../src/player/engine'

describe('the heard time', () => {
  it('with no latency reported and no offset it is the playing time', () => {
    expect(heardTime(12.5, 0, 0)).toBe(12.5)
  })

  it('a reported latency and an offset are taken off', () => {
    expect(heardTime(12.5, 0.2, 0)).toBeCloseTo(12.3, 9)
    expect(heardTime(12.5, 0.2, 0.05)).toBeCloseTo(12.25, 9)
    expect(heardTime(12.5, 0, -0.1)).toBeCloseTo(12.6, 9)
  })

  it('never below the song’s start, and a bad report counts as none', () => {
    expect(heardTime(0.05, 0.2, 0)).toBe(0)
    expect(heardTime(3, Number.NaN, 0)).toBe(3)
    expect(heardTime(3, -1, Number.NaN)).toBe(3)
  })
})
