/**
 * A bar keeps its place in the recording through edits of its notes, and goes along where bars really move
 * (GitHub issue 2026-11). The edits are the backend's real results (``test_bar_sources.py`` writes the fixture).
 */
import { describe, expect, it } from 'vitest'

import { type ScoreModelView, type ScoreView } from '../src/shared/scoreView'
import { playClock, sourceSegments } from '../src/shared/playback'
import { type BarPrint, barPrints, contentSources, matchBars, sourceBars } from '../src/sheet-editor/score/barMatch'
import { followContent, keepBars, parseBarSources, remapBars, validBars } from '../src/sheet-editor/score/barSources'
import { buildProject, parseProject } from '../src/sheet-editor/score/projectFile'
import { curveRuns, octaveOffset } from '../src/sheet-editor/score/sungPitch'
import fixture from './fixtures/bar-sources.json'

type Edit = (typeof fixture.edits)[number]

const SOURCE = fixture.source as BarPrint[]
const COUNT = SOURCE.length
const SECONDS = 2
/** A recording whose bars have distinct, uneven intervals. */
const TIMELINE = {
  score_sha256: 'transcription',
  bars: SOURCE.map((_, i): [number, number, string] => [i * SECONDS + 1, (i + 1) * SECONDS + 1, '4/4']),
  bar_prints: SOURCE
}
const IDENTITY = SOURCE.map((_, i) => i)

function modelOf(part: { measures: unknown; tracks: unknown }): ScoreModelView {
  return { measures: part.measures, tracks: part.tracks, sections: [], grid: { units_per_quarter: 2 } } as unknown as ScoreModelView
}
const BEFORE = modelOf(fixture)
const edit = (name: string): Edit => fixture.edits.find((e) => e.name === name)!
const noteEdits = fixture.edits.filter((e) => e.time_map === null)

function viewOf(model: ScoreModelView): ScoreView {
  const seconds = 2
  return {
    bars: model.measures.map((_, i) => ({ start_s: i * seconds, duration_s: seconds, number: i + 1 })),
    model
  } as unknown as ScoreView
}

describe('edits of notes', () => {
  it('are real edits of the bars that say they moved none', () => {
    expect(noteEdits.length).toBeGreaterThan(8)
    for (const e of noteEdits) expect(e.prints, e.name).not.toEqual(SOURCE)
  })

  it('keep every bar on its source bar, without the kept bars too: by content', () => {
    for (const e of noteEdits) {
      expect(contentSources(modelOf(e), TIMELINE), e.name).toEqual(IDENTITY)
      expect(keepBars(IDENTITY, e.measures.length), e.name).toEqual(IDENTITY)
    }
  })

  it('match like the backend', () => {
    for (const e of fixture.edits) {
      expect(barPrints(modelOf(e)), e.name).toEqual(e.prints)
      expect(matchBars(e.prints as BarPrint[], SOURCE), e.name).toEqual(e.matched)
    }
  })

  it('leave the waveform, the clock, the source playback and the sung pitch where they were', () => {
    const before = sourceBars(BEFORE, TIMELINE, IDENTITY)
    const clock = playClock(viewOf(BEFORE), before)
    const curve = { start: 0, rate: 10, midi: Array.from({ length: 450 }, () => 60) }
    const runs = curveRuns(BEFORE, before, curve, 0, COUNT - 1)
    for (const e of noteEdits) {
      const model = modelOf(e)
      // with the kept bars and by content (a project without them)
      for (const bars of [sourceBars(model, TIMELINE, keepBars(IDENTITY, COUNT)), sourceBars(model, TIMELINE)]) {
        expect(bars, e.name).toEqual(before)
        const now = playClock(viewOf(model), bars)
        expect(now, e.name).toEqual(clock)
        // source only and notes with the source play the same pieces: one run through the recording
        expect(sourceSegments(now, 0), e.name).toEqual(sourceSegments(clock, 0))
        expect(sourceSegments(now, 0).length, e.name).toBe(1)
        expect(curveRuns(model, bars, curve, 0, COUNT - 1), e.name).toEqual(runs)
      }
    }
  })

  it('find the octave of the sung pitch in the Instrument when the melody moved there', () => {
    const curve = { start: 0, rate: 10, midi: Array.from({ length: 450 }, () => 48) } // an octave under the notes
    const bars = sourceBars(BEFORE, TIMELINE, IDENTITY)
    const known = octaveOffset(BEFORE, bars, curve)
    expect(Math.abs(known)).toBeGreaterThanOrEqual(12)
    const moved = modelOf(edit('melody to Ins: the whole song'))
    expect(moved.tracks.vocal).toHaveLength(0)
    expect(octaveOffset(moved, bars, curve)).toBe(known)
  })
})

describe('edits of the bars', () => {
  const after = (name: string): (number | null)[] => {
    const e = edit(name)
    return remapBars(IDENTITY, BEFORE, modelOf(e), e.time_map as number[][])
  }

  it('a moved section takes its source bars along, with as many bars as before', () => {
    const expected = [...IDENTITY.slice(0, 8), ...IDENTITY.slice(16, 20), ...IDENTITY.slice(12, 16), ...IDENTITY.slice(8, 12)]
    expect(after('section moved, as many bars')).toEqual(expected)
    // the second chorus is the second chorus: content alone could not tell it from the first
    expect(after('section moved, as many bars').length).toBe(COUNT)
    expect(sourceBars(modelOf(edit('section moved, as many bars')), TIMELINE, expected)?.[8]?.[0]).toBe(TIMELINE.bars[16][0])
  })

  it('moved bars go along', () => {
    expect(after('bars rearranged')).toEqual([...IDENTITY.slice(0, 4), ...IDENTITY.slice(8, 12), ...IDENTITY.slice(4, 8), ...IDENTITY.slice(12)])
  })

  it('a copy refers to the bars of its original', () => {
    const copied = after('section copied')
    expect(copied).toEqual([...IDENTITY.slice(0, 12), ...IDENTITY.slice(8, 12), ...IDENTITY.slice(12)])
    expect(after('bars duplicated').slice(8, 12)).toEqual([8, 9, 8, 9])
  })

  it('a deleted bar is gone, and the others keep theirs', () => {
    expect(after('section deleted')).toEqual([...IDENTITY.slice(0, 4), ...IDENTITY.slice(8)])
    expect(after('bars deleted')).toEqual([0, 1, 2, 3, 6, 7, ...IDENTITY.slice(8)])
  })

  it('an inserted bar has no source: drawn so, silent, and it does not reuse another part of the recording', () => {
    const inserted = after('bars inserted')
    expect(inserted).toEqual([...IDENTITY.slice(0, 8), null, null, ...IDENTITY.slice(8)])
    const model = modelOf(edit('bars inserted'))
    const bars = sourceBars(model, TIMELINE, inserted)!
    expect(bars[8]).toBeNull()
    const segments = sourceSegments(playClock(viewOf(model), bars), 0)
    expect(segments).toHaveLength(2) // before and after the new bars
    expect(segments[0].duration).toBe(8 * SECONDS)
    expect(segments[1].at).toBe(10 * SECONDS)
    expect(segments[1].offset).toBe(TIMELINE.bars[8][0])
  })

  it('edits after each other go on from the bars before', () => {
    // two bars deleted, then two new ones inserted after bar 4: 18 bars of 8 units become 20
    const again = remapBars(after('bars deleted'), modelOf(edit('bars deleted')), BEFORE, [[0, 32, 0], [32, 144, 48]])
    expect(again).toEqual([0, 1, 2, 3, null, null, 6, 7, ...IDENTITY.slice(8)])
  })
})

describe('a score whose edit says nothing about its bars (typed ABC, an import)', () => {
  const prints = SOURCE
  it('keeps the bars whose notes alone changed', () => {
    for (const e of noteEdits) {
      expect(followContent(IDENTITY, prints, e.prints as BarPrint[]), e.name).toEqual(IDENTITY)
    }
  })

  it('follows bars that moved or were deleted, and new bars have no source', () => {
    const moved = edit('section moved, as many bars')
    const followed = followContent(IDENTITY, prints, moved.prints as BarPrint[])!
    expect(followed.slice(0, 8)).toEqual(IDENTITY.slice(0, 8))
    expect(followed).toHaveLength(COUNT)
    const deleted = edit('bars deleted')
    expect(followContent(IDENTITY, prints, deleted.prints as BarPrint[])).toEqual([0, 1, 2, 3, 6, 7, ...IDENTITY.slice(8)])
    const inserted = edit('bars inserted')
    expect(followContent(IDENTITY, prints, inserted.prints as BarPrint[])).toEqual([...IDENTITY.slice(0, 8), null, null, ...IDENTITY.slice(8)])
  })

  it('does not pretend when it is another score', () => {
    const other: BarPrint[] = [['4/4:0.8.61', '4/4:'], ['4/4:0.8.62', '4/4:'], ['4/4:0.8.63', '4/4:']]
    expect(followContent(IDENTITY, prints, other)).toBeNull()
  })
})

describe('kept bars', () => {
  const kept = { timeline: 'transcription', score: 'text', bars: [0, 1, null] }

  it('are read only when they fit', () => {
    expect(parseBarSources(kept)).toEqual(kept)
    expect(parseBarSources(null)).toBeNull()
    expect(parseBarSources({ timeline: 't', score: 's', bars: [1, -1] })).toBeNull()
    expect(parseBarSources({ timeline: 't', score: 's', bars: 'x' })).toBeNull()
    expect(parseBarSources({ timeline: 't', score: 's', bars: [] })).toBeNull()
  })

  it('belong to one recording, one text and as many bars', () => {
    expect(validBars(kept, 'transcription', 'text', 3)).toEqual(kept.bars)
    expect(validBars(kept, 'other', 'text', 3)).toBeNull()
    expect(validBars(kept, 'transcription', 'edited elsewhere', 3)).toBeNull()
    expect(validBars(kept, 'transcription', 'text', 4)).toBeNull()
    expect(validBars(null, 'transcription', 'text', 3)).toBeNull()
    expect(validBars(kept, undefined, 'text', 3)).toBeNull() // an old timeline: goes by content
  })

  it('without them a timeline goes by content, a timeline without prints bar by bar', () => {
    const model = modelOf(edit('melody to Ins: the whole song'))
    expect(sourceBars(model, TIMELINE)).toEqual(TIMELINE.bars)
    expect(sourceBars(model, { bars: TIMELINE.bars })).toEqual(TIMELINE.bars)
    expect(sourceBars(model, TIMELINE, [0, 1])).toEqual(TIMELINE.bars) // of another length: ignored
  })

  it('survive the project file; a file before them has none', () => {
    const file = buildProject({ score: 'X:1', barSources: kept })
    const back = parseProject(JSON.stringify(file))
    expect(typeof back === 'string' ? back : back.bar_sources).toEqual(kept)
    const { bar_sources: _, ...old } = file
    const legacy = parseProject(JSON.stringify(old))
    expect(typeof legacy === 'string' ? legacy : legacy.bar_sources).toBeNull()
  })
})
