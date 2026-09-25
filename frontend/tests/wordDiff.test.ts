import { describe, expect, it } from 'vitest'

import { sectionTimes } from '../src/shared/sheetSession'
import { LINE_BREAK, changedWords, wordDiff } from '../src/shared/wordDiff'

describe('word diff', () => {
  it('marks the words the user changed in a draft', () => {
    const parts = wordDiff('Feel the bass kick through the grate Head tilted', 'Feel the bass kick through the grate\nHead tilted')
    expect(parts).toEqual([
      { op: 'same', text: 'Feel the bass kick through the grate' },
      { op: 'added', text: LINE_BREAK },
      { op: 'same', text: 'Head tilted' }
    ])
    expect(changedWords(parts)).toBe(0) // a line break only
  })

  it('counts substituted and removed words', () => {
    const parts = wordDiff('Blue light pooling on the sidewalk\nThank you.', 'Blue light pouring on the sidewalk')
    expect(parts.filter((p) => p.op === 'removed').map((p) => p.text)).toEqual(['pooling', LINE_BREAK, 'Thank you.'])
    expect(parts.filter((p) => p.op === 'added').map((p) => p.text)).toEqual(['pouring'])
    expect(changedWords(parts)).toBe(4)
  })
})

describe('section times', () => {
  it('reads start and end of every section from the timeline', () => {
    const bars: [number, number, string][] = [
      [0, 2, '4/4'],
      [2, 4, '4/4'],
      [4, 62.5, '4/4']
    ]
    const rows = sectionTimes({ duration_s: 62.5, bars, sections: [['verse', 1, 2], ['chorus', 3, 1]] })
    expect(rows).toEqual([
      { label: 'verse', bars: 2, start: '0:00', end: '0:04' },
      { label: 'chorus', bars: 1, start: '0:04', end: '1:03' }
    ])
    expect(sectionTimes(undefined)).toEqual([])
  })
})
