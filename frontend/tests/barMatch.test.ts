/** The editor matches an arranged cover's bars to the source bars exactly as the backend does. */
import { describe, expect, it } from 'vitest'

import type { ScoreModelView } from '../src/shared/scoreView'
import { type BarPrint, barPrints, matchBars, sourceBars } from '../src/sheet-editor/score/barMatch'
import { scoreBarOfSource } from '../src/sheet-editor/score/locator'
import fixture from './fixtures/bar-match.json'
import tricky from './fixtures/tricky-score.json'

const MODEL = tricky.view.model as unknown as ScoreModelView
const SOURCE = fixture.source as BarPrint[]

describe('bar matching', () => {
  it('prints the bars like the backend', () => {
    expect(barPrints(MODEL)).toEqual(fixture.tricky_prints)
  })

  it('matches arranged bars like the backend', () => {
    for (const edit of fixture.edits) expect(matchBars(edit.prints as BarPrint[], SOURCE), edit.name).toEqual(edit.mapping)
  })

  it('gives every score bar its source bar and finds the score bar of a source second in order', () => {
    const bars = MODEL.measures.map((_, i): [number, number, string] => [i * 3, i * 3 + 3, '4/4'])
    const prints = barPrints(MODEL)
    const mapped = sourceBars(MODEL, { bars, bar_prints: prints })!
    expect(mapped).toEqual(bars)
    const copied = [...mapped.slice(0, 7), mapped[5], mapped[6]] // the chorus (bars 6-7) once more
    expect(scoreBarOfSource(16, copied, 0)).toBe(5)
    expect(scoreBarOfSource(16, copied, 7)).toBe(7) // later in the score: the copy
    expect(scoreBarOfSource(99, copied, 0)).toBeNull()
  })
})
