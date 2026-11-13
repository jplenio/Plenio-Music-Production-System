import { describe, expect, it } from 'vitest'

import { formatTime, pitchName, secondsToTick, tickToSeconds, view, x, zoom } from '../src/timeline'
import type { Measure } from '../src/types'

// two measures of 4/4 at 480 ppq: the first 2.0 s long from 2.0 s, the second 2.4 s long (the take slowed down)
const measures: Measure[] = [
  { tick: 0, endTick: 1920, start: 2.0, end: 4.0, number: 2 },
  { tick: 1920, endTick: 3840, start: 4.0, end: 6.4, number: 3 }
]

describe('the timeline', () => {
  it('joins ticks and project seconds measure by measure', () => {
    expect(tickToSeconds(measures, 0)).toBeCloseTo(2.0)
    expect(tickToSeconds(measures, 960)).toBeCloseTo(3.0)
    expect(tickToSeconds(measures, 1920 + 960)).toBeCloseTo(5.2)
    expect(secondsToTick(measures, 5.2)).toBeCloseTo(2880)
    // past the end: the last measure continued
    expect(tickToSeconds(measures, 3840 + 960)).toBeCloseTo(7.6)
  })

  it('zooms around the point under the mouse', () => {
    view.pxPerSecond = 20
    view.scroll = 0
    const before = 10 // seconds under x = 200 px
    zoom(2, 200)
    expect(view.pxPerSecond).toBe(40)
    expect(x(before)).toBeCloseTo(200)
  })

  it('tells times and pitches', () => {
    expect(formatTime(91.4)).toBe('1:31')
    expect(pitchName(60)).toBe('C4')
    expect(pitchName(69)).toBe('A4')
  })
})
